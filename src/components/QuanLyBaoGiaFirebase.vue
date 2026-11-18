<template>
  <div class="qlbg-page" :class="{ 'theme-light-blue': uiTheme === 'light' }">
    <!-- DẢI 3 THẺ BENTO KPI -->
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
      </button>
    </section>

    <!-- THANH BỘ LỌC & TÌM KIẾM HỢP NHẤT (TRÁI BỘ LỌC · GIỮA TÌM KIẾM · PHẢI HIỂN THỊ & TẠO MỚI) -->
    <section class="qlbg-filter-bar">
      <div class="qlbg-filter-row-main">
        <!-- BÊN TRÁI: BỘ LỌC (KHÁCH HÀNG · THỜI GIAN MODAL · SẮP XẾP TEMPLATE) -->
        <div class="qlbg-filter-left">
          <!-- Lọc Khách hàng (Modal) -->
          <button
            type="button"
            class="qlbg-picker-btn"
            :class="{ 'is-active': customerFilter !== 'ALL' }"
            @click="openCustomerModal"
            title="Lọc theo khách hàng"
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

          <!-- Lọc Thời gian (Modal) -->
          <button
            type="button"
            class="qlbg-picker-btn"
            :class="{ 'is-active': dateQuickRange !== 'all' }"
            @click="openDateModal"
            title="Lọc theo khoảng thời gian"
          >
            <svg width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="picker-btn-text">{{ selectedDateLabel }}</span>
            <span
              v-if="dateQuickRange !== 'all'"
              class="picker-clear-dot"
              title="Bỏ lọc thời gian"
              @click.stop="resetDateFilter"
            >✕</span>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.65; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          <!-- Sắp xếp (Adaptive Template Picker: PC Popover ↔ Mobile Bottom Sheet) -->
          <div ref="sortRootRef" class="qlbg-sort-root">
            <button
              type="button"
              class="qlbg-picker-btn qlbg-sort-trigger"
              :class="{ 'is-active': sortMode !== 'DESC', 'is-open': showSortMenu }"
              @click.stop="toggleSortMenu"
              title="Chọn thứ tự sắp xếp"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              <span class="picker-btn-text">{{ selectedSortLabel }}</span>
              <span
                v-if="sortMode !== 'DESC'"
                class="picker-clear-dot"
                title="Về sắp xếp mặc định (Mới → Cũ)"
                @click.stop="sortMode = 'DESC'; showSortMenu = false"
              >✕</span>
              <svg v-else class="qlbg-chev-ico" :class="{ 'is-rotated': showSortMenu }" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            <div
              v-if="showSortMenu"
              class="qlbg-sort-backdrop"
              @click="showSortMenu = false"
            ></div>

            <div
              v-if="showSortMenu"
              class="qlbg-pop-menu"
              :class="{ 'theme-light-blue': uiTheme === 'light' }"
              @click.stop
            >
              <div class="mob-sheet-grabber"></div>
              <div class="qlbg-pop-head">
                <span>Sắp xếp danh sách</span>
                <button type="button" class="qlbg-pop-close" @click="showSortMenu = false">✕</button>
              </div>
              <div class="qlbg-pop-list">
                <button
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  type="button"
                  class="qlbg-pop-opt"
                  :class="{ active: sortMode === opt.value }"
                  @click="selectSortOption(opt.value)"
                >
                  <div class="qlbg-pop-opt-main">
                    <div class="qlbg-pop-opt-title-row">
                      <strong>{{ opt.label }}</strong>
                      <span class="qlbg-pop-tag">{{ opt.tag }}</span>
                    </div>
                    <span class="qlbg-pop-opt-desc">{{ opt.desc }}</span>
                  </div>
                  <span v-if="sortMode === opt.value" class="pm-check">✓</span>
                </button>
              </div>
            </div>
          </div>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="qlbg-reset-btn"
            @click="resetAllFilters"
            title="Đặt lại toàn bộ bộ lọc"
          >
            <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Đặt lại</span>
          </button>
        </div>

        <!-- Ở GIỮA: Ô TÌM KIẾM ĐA NĂNG -->
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

        <!-- BÊN PHẢI: HIỂN THỊ & TẠO BÁO GIÁ MỚI -->
        <div class="qlbg-filter-right">
          <button
            v-if="displayedGroupedContracts.length > 0"
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

          <button
            type="button"
            class="qlbg-icon-btn"
            :disabled="loading"
            @click="fetchData(true)"
            title="Đồng bộ lại dữ liệu"
          >
            <svg :class="{ 'is-spin': loading }" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>

          <button
            type="button"
            class="qlbg-icon-btn"
            @click="toggleUiTheme"
            :title="uiTheme === 'dark' ? 'Chuyển sang giao diện Sáng (Light Blue)' : 'Chuyển sang giao diện Tối (Dark Navy)'"
          >
            <svg v-if="uiTheme === 'dark'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>

          <button type="button" class="qlbg-btn-primary" @click="goCreateNewQuote">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Tạo báo giá</span>
          </button>
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
         HIỂN THỊ THẺ NHÓM PHIÊN BẢN & THẺ LẺ (CARD VIEW)
    ========================================================== -->
    <div v-else class="qlbg-content-stack">
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
              <button
                type="button"
                class="sr-md-cc-check"
                :class="{
                  selected: isGroupSelectedForCompare(group),
                  'is-partial': isGroupPartiallySelectedForCompare(group)
                }"
                :title="isGroupSelectedForCompare(group) ? 'Bỏ chọn tất cả phiên bản trong nhóm để so sánh' : 'Chọn tất cả phiên bản trong nhóm để so sánh'"
                @click.stop="toggleGroupCompareSelection(group)"
              >
                <svg v-if="isGroupSelectedForCompare(group)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span v-else-if="isGroupPartiallySelectedForCompare(group)" class="qlbg-chk-dash"></span>
              </button>
              <span class="gh-folder-ico" :class="isGroupCompleted(group) ? 'is-emerald' : 'is-amber'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </span>
              <div class="gh-info-grid">
                <!-- Khối trái: MST -> Tên công ty -> Tên KH -->
                <div class="gh-col-cust">
                  <div v-if="getCustomerInfo(group.latest.ma_khach_hang).mst" class="gh-line tabular-nums">
                    <span v-html="'MST: ' + highlightText(getCustomerInfo(group.latest.ma_khach_hang).mst, searchKeyword)"></span>
                  </div>
                  <div v-if="getCustomerInfo(group.latest.ma_khach_hang).tenCongTy" class="gh-line gh-line-strong">
                    <span v-html="highlightText(getCustomerInfo(group.latest.ma_khach_hang).tenCongTy, searchKeyword)"></span>
                  </div>
                  <div class="gh-line">
                    <span v-html="highlightText(group.latest.ten_khach_hang || getCustomerInfo(group.latest.ma_khach_hang).tenKH || 'Chưa rõ khách hàng', searchKeyword)"></span>
                  </div>
                </div>

                <!-- Khối giữa/phải: Nội dung PO -> Thời gian mới nhất -->
                <div class="gh-col-po">
                  <div v-if="getGroupPoContent(group)" class="gh-line gh-line-wrap">
                    <span v-html="highlightText(getGroupPoContent(group), searchKeyword)"></span>
                  </div>
                  <div v-if="getGroupNewestCreatedTime(group)" class="gh-line gh-line-time tabular-nums">
                    <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>{{ getGroupNewestCreatedTime(group) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="gh-right">
              <span class="gh-ver-count tabular-nums">{{ group.versions.length }} bản</span>
              <button
                type="button"
                class="gh-toggle-btn"
                :aria-expanded="!collapsedGroups[group.goc]"
                :title="collapsedGroups[group.goc] ? 'Mở rộng nhóm phiên bản' : 'Thu gọn nhóm phiên bản'"
                @click.stop="toggleGroup(group.goc)"
              >
                <span class="gh-chevron" :class="{ 'is-collapsed': collapsedGroups[group.goc] }">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>
            </div>
          </div>

          <!-- Danh sách Card Phiên Bản trong nhóm -->
          <div v-show="!collapsedGroups[group.goc]" class="qlbg-cards-grid is-inside-group">
            <article
              v-for="(c, vIdx) in group.versions"
              :key="c.ma_hop_dong"
              class="qlbg-quote-card"
              :class="[isOfficialContract(c) ? 'is-official' : 'is-draft', { 'is-latest-ver': vIdx === 0, 'is-selected-card': isQuoteSelectedForCompare(c) }]"
              @click="viewDetails(c)"
            >
              <div class="qc-top">
                <div class="qc-top-left">
                  <button
                    type="button"
                    class="sr-md-cc-check"
                    :class="{ selected: isQuoteSelectedForCompare(c) }"
                    :title="isQuoteSelectedForCompare(c) ? 'Bỏ chọn báo giá này' : 'Chọn báo giá này để so sánh'"
                    @click.stop="toggleQuoteCompareSelection(c)"
                  >
                    <svg v-if="isQuoteSelectedForCompare(c)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
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
                <span class="qc-status-badge" :class="isOfficialContract(c) ? 'is-emerald' : 'is-amber'">
                  <span class="status-dot"></span>
                  {{ isOfficialContract(c) ? 'Chính thức' : 'Bản tạm' }}
                </span>
                <span v-if="getVersionNumberLabel(c)" class="qc-ver-tag tabular-nums">{{ getVersionNumberLabel(c) }}</span>
                <span v-if="isOriginalContract(c)" class="qc-origin-tag">Gốc</span>
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

              <!-- File đính kèm (nằm dưới nội dung card, không khung bọc, xuống dòng đầy đủ + Xem / Tải) -->
              <div v-if="getCardFilesList(c).length > 0" class="qc-files-block" @click.stop>
                <div class="qc-files-list">
                  <div
                    v-for="(f, fi) in getCardFilesList(c)"
                    :key="'gcf-' + c.ma_hop_dong + '-' + fi"
                    class="qc-file-row"
                  >
                    <a
                      :href="getCardFilePreviewUrl(f.link, f.name)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="qc-file-chip"
                      :class="f.slot === 'khach' ? 'is-khach' : 'is-hd'"
                      :title="f.name"
                      @click.stop
                    >
                      <span class="qc-file-ico" v-html="getCardFileIconSvg(f.name, f.link)"></span>
                      <span class="qc-file-tag">{{ f.label }}</span>
                      <span class="qc-file-name">{{ f.name }}</span>
                    </a>
                    <div class="qc-file-actions">
                      <a
                        :href="getCardFilePreviewUrl(f.link, f.name)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="qc-file-act-btn is-view"
                        title="Xem file"
                        @click.stop
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>Xem</span>
                      </a>
                      <a
                        :href="getCardFileDownloadUrl(f.link)"
                        class="qc-file-act-btn is-dl"
                        title="Tải xuống"
                        @click.stop="handleCardFileDownload($event, f.link, f.name)"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>Tải</span>
                      </a>
                    </div>
                  </div>
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
                  <span>Tổng tiền trước thuế (HĐ)</span>
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
                  v-if="isOfficialContract(c)"
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
                  :disabled="chotDealLoading || c.is_completed"
                  :title="c.is_completed ? 'Nhóm đã chốt hợp đồng chính thức — hãy dùng Nhân bản để tạo báo giá mới' : 'Chốt Deal & Lưu sang Sale Report'"
                  @click="!c.is_completed && chotDealAndSaleReport(c)"
                >
                  Chốt Deal
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <!-- INTERSECTION OBSERVER SENTINEL CHO DANH SÁCH NHÓM -->
      <div v-if="hasMoreCards" ref="cardLazySentinelRef" class="qlbg-lazy-sentinel">
        <span class="lazy-info tabular-nums">
          Đang hiển thị {{ paginatedGroupedContracts.length }} / {{ displayedGroupedContracts.length }} nhóm
        </span>
        <button type="button" class="qlbg-ghost-btn" @click="loadMoreCards">Tải thêm</button>
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
        <div
          class="qlbg-detail-modal"
          :class="{
            'is-mob-view': isMobileModalView,
            'is-mob-chitiet': isMobileModalView && activeMobileSubTab === 'chitiet',
            'is-mob-tongket': isMobileModalView && activeMobileSubTab === 'tongket'
          }"
        >
          <!-- Shared hidden file inputs cho cả Desktop Dock lẫn Mobile File Pane -->
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

          <!-- Header Modal -->
          <div class="dm-head">
            <div class="dm-head-left">
              <span class="dm-mob-header-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </span>
              <div class="dm-head-titles">
                <!-- Header Mobile: chỉ hiển thị Tên công ty, Chính thức / Bản tạm, Version -->
                <template v-if="isMobileModalView">
                  <h2 class="dm-code dm-mob-company-title">
                    {{ modalCustEdit.tenCongTy || modalCustEdit.tenKH || selectedContract.so_hop_dong || selectedContract.ma_hop_dong }}
                  </h2>
                  <div class="dm-title-row dm-mob-head-pills">
                    <span class="qc-status-badge" :class="isOfficialContract(selectedContract) ? 'is-emerald' : 'is-amber'">
                      <span class="status-dot"></span>
                      {{ isOfficialContract(selectedContract) ? 'Chính thức' : 'Bản tạm' }}
                    </span>
                    <span class="qc-ver-tag tabular-nums">{{ getVersionNumberLabel(selectedContract) || 'V1' }}</span>
                  </div>
                </template>

                <!-- Header Desktop: giữ nguyên đầy đủ thông tin -->
                <template v-else>
                  <div class="dm-title-row">
                    <span class="qc-status-badge" :class="isOfficialContract(selectedContract) ? 'is-emerald' : 'is-amber'">
                      <span class="status-dot"></span>
                      {{ isOfficialContract(selectedContract) ? 'Chính thức' : 'Bản tạm' }}
                    </span>
                    <span v-if="getVersionNumberLabel(selectedContract)" class="qc-ver-tag tabular-nums">{{ getVersionNumberLabel(selectedContract) }}</span>
                    <span v-if="isOriginalContract(selectedContract)" class="qc-origin-tag">Gốc</span>
                    <h2 class="dm-code tabular-nums">{{ selectedContract.so_hop_dong || selectedContract.ma_hop_dong }}</h2>
                    <span v-if="selectedContract.so_po" class="qc-po-badge tabular-nums">PO #{{ selectedContract.so_po }}</span>
                    <button
                      v-if="!selectedContract.is_completed && isActiveOnSaleReportCraft(selectedContract)"
                      type="button"
                      class="qc-sr-active-pill"
                      @click="openInSaleReport(selectedContract, true)"
                    >
                      <span class="dm-lbl-dt">Đang hiện trên SR Tạm ↗</span>
                      <span class="dm-lbl-mob">SR Tạm ↗</span>
                    </button>
                  </div>
                  <div class="dm-sub-row tabular-nums">
                    <span>Mã lưu: {{ selectedContract.ma_hop_dong }}</span>
                    <span v-if="selectedContract.ngay_tao">· {{ selectedContract.ngay_tao }}</span>
                    <span v-if="selectedContract.content_of_contract_po">· {{ selectedContract.content_of_contract_po }}</span>
                  </div>
                </template>
              </div>
            </div>

            <div class="dm-head-controls">
              <!-- Chế độ giá trong Modal (PC header; Mobile chuyển xuống thẻ chế độ giá trong body) -->
              <div class="qlbg-seg-group dm-dt-only-ctrl">
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

              <!-- Tiền tệ VND / USD (PC header; Mobile chuyển xuống thẻ chế độ giá trong body) -->
              <div class="qlbg-seg-group dm-dt-only-ctrl">
                <button type="button" class="qlbg-seg-btn" :class="{ active: quoteCurrency === 'VND' }" @click="quoteCurrency = 'VND'">VND</button>
                <button type="button" class="qlbg-seg-btn" :class="{ active: quoteCurrency === 'USD' }" @click="quoteCurrency = 'USD'">USD</button>
              </div>

              <!-- Xuất Excel -->
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
                <span class="dm-lbl-dt">{{ exportingExcel ? 'Đang xuất...' : 'Xuất Excel' }}</span>
                <span class="dm-lbl-mob">{{ exportingExcel ? 'Xuất...' : 'Excel' }}</span>
              </button>

              <button type="button" class="dm-close-btn" @click="showDetailModal = false" title="Đóng">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Mobile Pane Switcher (<= 1080px, đồng bộ Sale Report .sr-po-mobile-switch) -->
          <div class="dm-mobile-tabs">
            <button
              type="button"
              class="dm-mob-tab"
              :class="{ active: activeMobileSubTab === 'chitiet' }"
              @click="activeMobileSubTab = 'chitiet'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              <span>Thông tin &amp; Hàng hóa ({{ selectedContractDetails.length }})</span>
            </button>
            <button
              type="button"
              class="dm-mob-tab"
              :class="{ active: activeMobileSubTab === 'tongket' }"
              @click="activeMobileSubTab = 'tongket'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>Hồ sơ File ({{ detailFilesTotalCount }}) &amp; Tổng kết</span>
            </button>
          </div>

          <!-- Body 2 cột (PC) / Workspace Option A (Mobile) -->
          <div
            class="dm-body"
            :class="[
              {
                'is-side-collapsed': !isMobileModalView && !showCompareFinancePanel,
                'is-mob-chitiet': isMobileModalView && activeMobileSubTab === 'chitiet',
                'is-mob-tongket': isMobileModalView && activeMobileSubTab === 'tongket'
              },
              detailViewMode === 'khach' ? 'is-mode-khach' : detailViewMode === 'noibo' ? 'is-mode-noibo' : 'is-mode-hd'
            ]"
          >
            <!-- MOBILE CARD 1: THÔNG TIN CHUNG & KHÁCH HÀNG (Option A, Tab 1) -->
            <div v-if="isMobileModalView && activeMobileSubTab === 'chitiet'" class="dm-mob-overview-card">
              <div class="dm-mob-overview-accent"></div>
              <div class="dm-mob-overview-head">
                <div class="dm-mob-overview-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Thông tin Khách hàng &amp; Báo giá</span>
                </div>
                <button
                  v-if="selectedContract.ma_khach_hang"
                  type="button"
                  class="btn-customer-detail-pill"
                  @click="openCustomerInfoModal(selectedContract.ma_khach_hang)"
                >
                  Chi tiết KH →
                </button>
              </div>
              <div class="dm-mob-overview-grid">
                <div class="dm-mob-ov-field is-full">
                  <span class="dm-mob-ov-lbl">Công ty / Đơn vị</span>
                  <div class="dm-mob-ov-val" :class="{ 'is-empty': !modalCustEdit.tenCongTy }">
                    {{ modalCustEdit.tenCongTy || '—' }}
                  </div>
                </div>
                <div class="dm-mob-ov-field">
                  <span class="dm-mob-ov-lbl">Số hợp đồng / PO</span>
                  <div class="dm-mob-ov-val tabular-nums">
                    {{ selectedContract.so_hop_dong || selectedContract.ma_hop_dong }}<template v-if="selectedContract.so_po"> · PO #{{ selectedContract.so_po }}</template>
                  </div>
                </div>
                <div class="dm-mob-ov-field">
                  <span class="dm-mob-ov-lbl">Ngày tạo</span>
                  <div class="dm-mob-ov-val tabular-nums">{{ selectedContract.ngay_tao || '—' }}</div>
                </div>
                <div class="dm-mob-ov-field">
                  <span class="dm-mob-ov-lbl">Khách hàng</span>
                  <div class="dm-mob-ov-val" :class="{ 'is-empty': !modalCustEdit.tenKH }">
                    {{ modalCustEdit.tenKH || '—' }}
                  </div>
                </div>
                <div class="dm-mob-ov-field">
                  <span class="dm-mob-ov-lbl">MST</span>
                  <div class="dm-mob-ov-val tabular-nums" :class="{ 'is-empty': !modalCustEdit.mst }">
                    {{ modalCustEdit.mst || '—' }}
                  </div>
                </div>
                <div v-if="selectedContract.content_of_contract_po" class="dm-mob-ov-field is-full">
                  <span class="dm-mob-ov-lbl">Nội dung / Diễn giải</span>
                  <div class="dm-mob-ov-val">{{ selectedContract.content_of_contract_po }}</div>
                </div>
              </div>
            </div>

            <!-- MOBILE CARD 2 CHROME: CHẾ ĐỘ GIÁ + TIỀN TỆ + TAB CON (Option A, Tab 1) -->
            <div
              v-if="isMobileModalView && activeMobileSubTab === 'chitiet'"
              class="dm-mob-tabs-chrome"
              :class="detailViewMode === 'khach' ? 'is-mode-khach' : detailViewMode === 'noibo' ? 'is-mode-noibo' : 'is-mode-hd'"
            >
              <div class="dm-mob-price-bar">
                <div class="dm-mob-price-seg" role="tablist" aria-label="Chế độ xem giá">
                  <button
                    type="button"
                    role="tab"
                    class="dm-mob-price-btn is-hd"
                    :class="{ active: detailViewMode === 'hd' }"
                    @click="detailViewMode = 'hd'"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span>Giá HĐ</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    class="dm-mob-price-btn is-khach"
                    :class="{ active: detailViewMode === 'khach' }"
                    @click="detailViewMode = 'khach'"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Giá Khách</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    class="dm-mob-price-btn is-noibo"
                    :class="{ active: detailViewMode === 'noibo' }"
                    @click="detailViewMode = 'noibo'"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                    <span>Nội bộ</span>
                  </button>
                </div>

                <div class="dm-mob-util-strip">
                  <div class="dm-mob-currency-wrap">
                    <div class="dm-mob-currency-seg" role="group" aria-label="Tiền tệ">
                      <button
                        type="button"
                        class="dm-mob-cur-btn"
                        :class="{ active: quoteCurrency === 'VND' }"
                        @click="quoteCurrency = 'VND'"
                      >
                        VND
                      </button>
                      <button
                        type="button"
                        class="dm-mob-cur-btn"
                        :class="{ active: quoteCurrency === 'USD' }"
                        @click="quoteCurrency = 'USD'"
                      >
                        USD
                      </button>
                    </div>
                    <span v-if="quoteCurrency === 'USD'" class="dm-mob-rate-note tabular-nums">
                      1$ = {{ formatVND(effectiveModalExchangeRate || 25400) }}đ
                    </span>
                  </div>

                  <div class="dm-mob-active-total tabular-nums">
                    <span class="dm-mob-total-lbl">{{ detailViewMode === 'noibo' ? 'Net Margin:' : 'Sau VAT:' }}</span>
                    <strong class="dm-mob-total-val" :class="detailViewMode === 'noibo' ? (detailSummary.netMargin >= 0 ? 'is-profit' : 'is-warn') : ''">
                      {{ formatModalMoneyWithUnit(detailViewMode === 'noibo' ? detailSummary.netMargin : detailSummary.activeSau) }}
                    </strong>
                  </div>
                </div>
              </div>

              <div class="dm-mob-tabs-head">
                <div class="dm-mob-tabs-btn-group">
                  <button
                    type="button"
                    class="dm-mob-inner-tab"
                    :class="{ active: activeMobileInnerTab === 'goods' }"
                    @click="activeMobileInnerTab = 'goods'"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    <span>Bảng Hàng hóa ({{ selectedContractDetails.length }})</span>
                  </button>
                  <button
                    type="button"
                    class="dm-mob-inner-tab"
                    :class="{ active: activeMobileInnerTab === 'metrics' }"
                    @click="activeMobileInnerTab = 'metrics'"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <span>Chỉ số &amp; Chiết khấu</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- CỘT TRÁI: BẢNG HÀNG HÓA -->
            <div
              class="dm-main-col"
              :class="{
                'mob-hidden': isMobileModalView && !(activeMobileSubTab === 'chitiet' && activeMobileInnerTab === 'goods'),
                'is-mob-tab-panel': isMobileModalView
              }"
            >
              <!-- Dải tóm tắt nhanh tiền hàng trên Mobile -->
              <div v-if="isMobileModalView && !loadingDetails && selectedContractDetails.length > 0" class="dm-mob-goods-summary">
                <template v-if="detailViewMode === 'noibo'">
                  <div class="dm-mob-gs-cell">
                    <span>Giá vốn</span>
                    <strong class="tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.costTotal) }}</strong>
                  </div>
                  <div class="dm-mob-gs-cell">
                    <span>Chênh lệch</span>
                    <strong class="is-sky tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.clGia) }}</strong>
                  </div>
                  <div class="dm-mob-gs-cell">
                    <span>Net Margin</span>
                    <strong :class="detailSummary.netMargin >= 0 ? 'is-emerald' : 'is-rose'" class="tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.netMargin) }}</strong>
                  </div>
                </template>
                <template v-else>
                  <div class="dm-mob-gs-cell">
                    <span>Trước VAT</span>
                    <strong class="tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.activeTruoc) }}</strong>
                  </div>
                  <div class="dm-mob-gs-cell">
                    <span>Thuế VAT</span>
                    <strong class="tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.activeVat) }}</strong>
                  </div>
                  <div class="dm-mob-gs-cell">
                    <span>Sau VAT</span>
                    <strong class="is-emerald tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.activeSau) }}</strong>
                  </div>
                </template>
              </div>

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

            <!-- CỘT PHẢI: 3 BỘ CHỈ SỐ + DOCK KHÁCH / HỒ SƠ / CHIẾT KHẤU / TÀI CHÍNH -->
            <aside
              class="dm-side-col"
              :class="{
                'mob-hidden':
                  isMobileModalView &&
                  !((activeMobileSubTab === 'chitiet' && activeMobileInnerTab === 'metrics') || activeMobileSubTab === 'tongket'),
                'is-collapsed': !isMobileModalView && !showCompareFinancePanel,
                'is-mob-metrics': isMobileModalView && activeMobileSubTab === 'chitiet' && activeMobileInnerTab === 'metrics',
                'is-mob-tongket': isMobileModalView && activeMobileSubTab === 'tongket'
              }"
            >
              <!-- Thanh dọc thu gọn khi đóng panel (Chỉ PC) -->
              <div v-if="!isMobileModalView && !showCompareFinancePanel" class="cmp-sr-collapsed-rail">
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
                <!-- Thanh chọn nguồn giá & thao tác nhanh (Trên Mobile chỉ hiện khi đang xem Nội bộ & Tab Chỉ số) -->
                <div
                  v-if="!isMobileModalView || (activeMobileSubTab === 'chitiet' && activeMobileInnerTab === 'metrics' && detailViewMode === 'noibo')"
                  class="cmp-sr-source-bar"
                >
                  <div class="cmp-sr-source-pills" role="tablist" aria-label="Nguồn giá tính chỉ số">
                    <button
                      type="button"
                      role="tab"
                      class="cmp-sr-source-pill"
                      :class="{ active: cmpSrPriceSource === 'contract' }"
                      :aria-selected="cmpSrPriceSource === 'contract'"
                      @click="setCmpSrPriceSource('contract')"
                    >
                      Giá Hợp đồng
                    </button>
                    <button
                      type="button"
                      role="tab"
                      class="cmp-sr-source-pill is-khach"
                      :class="{ active: cmpSrPriceSource === 'customer' }"
                      :aria-selected="cmpSrPriceSource === 'customer'"
                      @click="setCmpSrPriceSource('customer')"
                    >
                      Giá Khách
                    </button>
                  </div>
                  <div v-if="!isMobileModalView" class="cmp-sr-source-actions">
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

                <!-- Vùng cuộn 3 bộ chỉ số (PC luôn hiện; Mobile hiện trong Tab 1 -> Chỉ số & Chiết khấu) -->
                <div
                  v-show="!isMobileModalView || (activeMobileSubTab === 'chitiet' && activeMobileInnerTab === 'metrics')"
                  class="cmp-sr-blocks-scroll"
                >
                  <!-- BỘ 1: Doanh số & Chi phí -->
                  <div class="cmp-sr-po1-block is-tone-sky">
                    <div class="cmp-sr-po1-block-title">Doanh số &amp; Chi phí</div>
                    <div class="cmp-sr-po1-list">
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Doanh số bán</span>
                        <span class="cmp-sr-po1-val">{{ fmtCmpSrMoney(cmpSrDoanhSoBan) }}</span>
                      </div>
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Giá mua</span>
                        <span class="cmp-sr-po1-val">{{ fmtCmpSrMoney(cmpSrGiaMua) }}</span>
                      </div>
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Tổng CP đơn hàng</span>
                        <span class="cmp-sr-po1-val">{{ fmtCmpSrMoney(cmpSrTongCP) }}</span>
                      </div>
                      <div class="cmp-sr-po1-item is-readonly-accent">
                        <span class="cmp-sr-po1-lbl">Tổng tiền sau VAT</span>
                        <span class="cmp-sr-po1-val is-accent">{{ fmtCmpSrMoney(cmpSrTongSauVat) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- BỘ 2: COM, Thuế & Margin -->
                  <div class="cmp-sr-po1-block is-tone-emerald">
                    <div class="cmp-sr-po1-block-title">COM, Thuế &amp; Margin</div>
                    <div class="cmp-sr-po1-list">
                      <!-- Gross COM -->
                      <div class="cmp-sr-po1-item is-inline-dual">
                        <div class="cmp-sr-po1-lbl-group">
                          <span class="cmp-sr-po1-lbl">Gross COM</span>
                          <span class="cmp-sr-pct-badge">{{ Number(cmpSrGrossComPct.toFixed(2)) }}%</span>
                        </div>
                        <span class="cmp-sr-po1-val">{{ fmtCmpSrMoney(cmpSrGrossCom) }}</span>
                      </div>

                      <!-- Thuế -->
                      <div class="cmp-sr-po1-item is-inline-dual">
                        <div class="cmp-sr-po1-lbl-group">
                          <span class="cmp-sr-po1-lbl">Thuế</span>
                          <span class="cmp-sr-pct-badge">{{ Number(cmpSrTaxPct.toFixed(2)) }}%</span>
                        </div>
                        <span class="cmp-sr-po1-val is-warn">{{ fmtCmpSrMoney(cmpSrTaxAmount) }}</span>
                      </div>

                      <!-- Net COM -->
                      <div class="cmp-sr-po1-item">
                        <span class="cmp-sr-po1-lbl">Net COM</span>
                        <span class="cmp-sr-po1-val">{{ fmtCmpSrMoney(cmpSrNetCom) }}</span>
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
                  <div class="cmp-sr-po1-block is-tone-amber is-ratio-block">
                    <div class="cmp-sr-po1-block-head">
                      <div class="cmp-sr-po1-block-title">Tỉ suất (%)</div>
                      <button
                        type="button"
                        class="cmp-sr-round-toggle-btn"
                        :class="{ 'is-active': cmpSrIsRatioRounded }"
                        title="Bật/tắt làm tròn số phần trăm khi xem"
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
                  </div>
                </div>

                <!-- DOCK BÊN DƯỚI: KHÁCH / HỒ SƠ / CHIẾT KHẤU / TÀI CHÍNH -->
                <div class="pc-right-finance-dock">
                  <div
                    v-if="!isMobileModalView"
                    class="sidebar-dock-tabs"
                    role="tablist"
                    aria-label="Thông tin khách hàng, hồ sơ, chiết khấu và tài chính"
                  >
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

                  <!-- TAB 1: THÔNG TIN KHÁCH HÀNG (PC Dock; Mobile đã có Card Tổng quan ở Tab 1) -->
                  <div v-if="!isMobileModalView && activeDetailDockTab === 'customer'" class="dock-tab-panel customer-dock-panel">
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
                        <span class="cd-lbl">MST</span>
                        <div class="cd-readonly-val tabular-nums" :class="{ 'is-empty': !modalCustEdit.mst }">
                          {{ modalCustEdit.mst || '—' }}
                        </div>
                      </div>

                      <div class="cd-row">
                        <span class="cd-lbl">Khách</span>
                        <div class="cd-readonly-val" :class="{ 'is-empty': !modalCustEdit.tenKH }">
                          {{ modalCustEdit.tenKH || '—' }}
                        </div>
                      </div>

                      <div class="cd-row">
                        <span class="cd-lbl">Công ty</span>
                        <div class="cd-readonly-val" :class="{ 'is-empty': !modalCustEdit.tenCongTy }">
                          {{ modalCustEdit.tenCongTy || '—' }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TAB 2: HỒ SƠ FILE (PC Dock hoặc Tab 2 Mobile Option A) -->
                  <div
                    v-if="isMobileModalView ? activeMobileSubTab === 'tongket' : activeDetailDockTab === 'files'"
                    class="dock-tab-panel files-dock-panel"
                  >
                    <div v-if="isMobileModalView" class="dm-mob-dock-sec-head is-sky">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span>Hồ sơ Đính kèm ({{ detailFilesTotalCount }} file)</span>
                    </div>
                    <!-- File Hồ sơ (SVG icon, tên file xuống dòng, Xem, Tải, Đính kèm) -->
                    <div
                      v-for="slotCfg in [
                        { key: 'hd' as const, title: 'File Báo giá Hợp đồng', files: parsedFilesHd, emptyText: 'Chưa có file hợp đồng' },
                        { key: 'khach' as const, title: 'File Báo giá Khách', files: parsedFilesKhach, emptyText: 'Chưa có file báo giá khách' }
                      ]"
                      :key="'dm-slot-' + slotCfg.key"
                      class="dm-file-slot"
                    >
                      <div class="slot-head" :class="slotCfg.key === 'khach' ? 'is-khach' : 'is-hd'">
                        <span class="slot-label">{{ slotCfg.title }} ({{ slotCfg.files.length }})</span>
                        <button
                          type="button"
                          class="slot-upload-btn"
                          :disabled="uploadingFileSlot !== null"
                          @click="triggerSlotUpload(slotCfg.key)"
                        >
                          {{ uploadingFileSlot === slotCfg.key ? 'Đang tải...' : '+ Đính kèm' }}
                        </button>
                      </div>
                      <div v-if="slotCfg.files.length === 0" class="slot-empty">{{ slotCfg.emptyText }}</div>
                      <div v-else class="slot-file-list">
                        <div
                          v-for="(f, idx) in slotCfg.files"
                          :key="'f-' + slotCfg.key + '-' + idx"
                          class="slot-file-item"
                        >
                          <a
                            :href="getCardFilePreviewUrl(f.link, f.name)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="slot-file-main"
                            :class="slotCfg.key === 'khach' ? 'is-khach' : 'is-hd'"
                            :title="f.name"
                          >
                            <span class="qc-file-ico" v-html="getCardFileIconSvg(f.name, f.link)"></span>
                            <span class="slot-file-name">{{ f.name }}</span>
                          </a>
                          <div class="slot-file-actions">
                            <a
                              :href="getCardFilePreviewUrl(f.link, f.name)"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="qc-file-act-btn is-view"
                              title="Xem file"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              <span>Xem</span>
                            </a>
                            <a
                              :href="getCardFileDownloadUrl(f.link)"
                              class="qc-file-act-btn is-dl"
                              title="Tải xuống"
                              @click="handleCardFileDownload($event, f.link, f.name)"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                              <span>Tải</span>
                            </a>
                            <button type="button" class="slot-file-del" title="Gỡ file" @click="removeSlotFile(slotCfg.key, idx)">✕</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TAB 3: CHIẾT KHẤU & CHÊNH LỆCH GIÁ (CHỈ XEM) -->
                  <div
                    v-if="
                      isMobileModalView
                        ? activeMobileSubTab === 'tongket' || (activeMobileSubTab === 'chitiet' && activeMobileInnerTab === 'metrics')
                        : activeDetailDockTab === 'discount'
                    "
                    class="dock-tab-panel discount-dock-panel"
                  >
                    <div v-if="isMobileModalView" class="dm-mob-dock-sec-head is-amber">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                      <span>Chiết khấu &amp; Chênh lệch giá</span>
                    </div>
                    <div class="fin-row">
                      <div class="fin-lbl-inline">
                        <span class="fin-lbl">Chiết khấu tổng trước thuế</span>
                        <span class="fin-pct-badge">{{ modalChietKhauTruocThuePct }}%</span>
                      </div>
                      <span class="fin-val is-discount tabular-nums">{{ formatModalMoneyWithUnit(detailSummary.tongChietKhau) }}</span>
                    </div>

                    <div class="fin-row">
                      <div class="fin-lbl-inline">
                        <span class="fin-lbl">Thuế chênh lệch giá</span>
                        <span class="fin-pct-badge">{{ modalThueChenhLechPct }}%</span>
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
                  <div
                    v-if="
                      isMobileModalView
                        ? activeMobileSubTab === 'tongket' || (activeMobileSubTab === 'chitiet' && activeMobileInnerTab === 'metrics')
                        : activeDetailDockTab === 'finance'
                    "
                    class="dock-tab-panel finance-dock-panel"
                  >
                    <div v-if="isMobileModalView" class="dm-mob-dock-sec-head is-emerald">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      <span>Tài chính Tổng hợp ({{ quoteCurrency }})</span>
                    </div>
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

          <!-- Footer Modal (PC 1 hàng; Mobile <= 768px 2 hàng chuẩn Sale Report) -->
          <div class="dm-foot">
            <div class="dm-foot-sec-row">
              <button
                v-if="!selectedContract.is_completed"
                type="button"
                class="qlbg-btn-danger-ghost dm-btn-delete"
                @click="requestDeleteDraft(selectedContract, true)"
              >
                <span class="dm-lbl-dt">Xóa bản tạm</span>
                <span class="dm-lbl-mob">Xóa</span>
              </button>
              <button
                type="button"
                class="qlbg-ghost-btn"
                :disabled="selectedContract.is_completed"
                @click="!selectedContract.is_completed && editContract(selectedContract)"
              >
                <span class="dm-lbl-dt">Sửa báo giá</span>
                <span class="dm-lbl-mob">Sửa</span>
              </button>
              <button type="button" class="qlbg-ghost-btn" @click="duplicateContract(selectedContract)">
                <span>Nhân bản</span>
              </button>
              <button
                type="button"
                class="qlbg-ghost-btn is-mob-inline-close"
                @click="showDetailModal = false"
              >
                <span>Đóng</span>
              </button>
            </div>
            <div class="dm-foot-cta-row">
              <button
                v-if="!selectedContract.is_completed && isActiveOnSaleReportCraft(selectedContract)"
                type="button"
                class="qlbg-ghost-btn dm-btn-sr-craft"
                @click="openInSaleReport(selectedContract, true)"
              >
                <span class="dm-lbl-dt">Mở SR Tạm ↗</span>
                <span class="dm-lbl-mob">SR Tạm ↗</span>
              </button>
              <button
                v-else-if="canPinToSaleReportCraft(selectedContract)"
                type="button"
                class="qlbg-ghost-btn dm-btn-sr-craft"
                :disabled="pinningSrCraftMa === selectedContract.ma_hop_dong"
                @click="pinContractToSaleReportCraft(selectedContract)"
              >
                <span class="dm-lbl-dt">{{ pinningSrCraftMa === selectedContract.ma_hop_dong ? 'Đang ghim...' : 'Đưa lên SR Tạm' }}</span>
                <span class="dm-lbl-mob">{{ pinningSrCraftMa === selectedContract.ma_hop_dong ? 'Đang ghim...' : 'Lên SR Tạm' }}</span>
              </button>
              <button
                v-if="isOfficialContract(selectedContract)"
                type="button"
                class="qlbg-btn-primary"
                @click="openInSaleReport(selectedContract)"
              >
                <span class="dm-lbl-dt">Mở trong Sale Report ↗</span>
                <span class="dm-lbl-mob">Sale Report ↗</span>
              </button>
              <button
                v-else
                type="button"
                class="qlbg-btn-emerald"
                :disabled="chotDealLoading || selectedContract.is_completed"
                @click="!selectedContract.is_completed && chotDealAndSaleReport(selectedContract)"
              >
                <span class="dm-lbl-dt">Chốt Deal &amp; Lưu Sale Report</span>
                <span class="dm-lbl-mob">Chốt Deal</span>
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
         MODAL 2B: LỌC THEO THỜI GIAN
    ========================================================== -->
    <Teleport to="body">
      <div
        v-if="showDateModal"
        class="modal-overlay qlbg-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
        @click.self="showDateModal = false"
      >
        <div class="qlbg-picker-modal qlbg-date-modal">
          <div class="mob-sheet-grabber"></div>
          <div class="pm-head">
            <div class="pm-title-wrap">
              <h3>Lọc theo Thời gian</h3>
              <span class="pm-count">{{ selectedDateLabel }}</span>
            </div>
            <button type="button" class="dm-close-btn" @click="showDateModal = false">✕</button>
          </div>

          <div class="dm-date-modal-body">
            <div class="dm-date-sec-lbl">Chọn nhanh</div>
            <div class="dm-preset-grid">
              <button
                v-for="opt in dateQuickOptions"
                :key="'dm-date-' + opt.value"
                type="button"
                class="dm-preset-btn"
                :class="{ active: draftDateRange === opt.value }"
                @click="selectDatePresetInModal(opt.value)"
              >
                <div class="dm-preset-top">
                  <strong>{{ opt.label }}</strong>
                  <span v-if="draftDateRange === opt.value" class="pm-check">✓</span>
                </div>
                <span class="dm-preset-desc">{{ opt.desc }}</span>
              </button>
            </div>

            <div class="dm-custom-range-box" :class="{ 'is-highlighted': draftDateRange === 'custom' }">
              <div class="dm-date-sec-lbl">Khoảng ngày tùy chỉnh</div>
              <div class="dm-custom-range-inputs">
                <label class="dm-date-field">
                  <span>Từ ngày</span>
                  <input
                    v-model="draftCustomFrom"
                    type="date"
                    :max="draftCustomTo || undefined"
                    class="qlbg-date-input"
                    @focus="draftDateRange = 'custom'"
                  />
                </label>
                <span class="dm-date-arrow">→</span>
                <label class="dm-date-field">
                  <span>Đến ngày</span>
                  <input
                    v-model="draftCustomTo"
                    type="date"
                    :min="draftCustomFrom || undefined"
                    class="qlbg-date-input"
                    @focus="draftDateRange = 'custom'"
                  />
                </label>
              </div>
            </div>
          </div>

          <div class="pm-foot">
            <button
              type="button"
              class="qlbg-ghost-btn"
              @click="resetDateFilter(); showDateModal = false"
            >
              Đặt lại
            </button>
            <div class="pm-foot-right">
              <button type="button" class="qlbg-ghost-btn" @click="showDateModal = false">Đóng</button>
              <button type="button" class="qlbg-btn-primary" @click="applyCustomDateModal">
                Áp dụng khoảng ngày
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL 3: HỒ SƠ CHI TIẾT KHÁCH HÀNG (ĐẦY ĐỦ NHƯ TRANG KHÁCH HÀNG)
    ========================================================== -->
    <Teleport to="body">
      <div
        v-if="showCustomerInfoModal"
        class="modal-overlay qlbg-overlay qlbg-cust-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
        @click.self="showCustomerInfoModal = false"
      >
        <div class="qlbg-cust-modal">
          <div class="mob-sheet-grabber"></div>
          <div class="pm-head">
            <div class="pm-title-wrap">
              <h3>Hồ sơ Chi tiết Khách hàng</h3>
              <span v-if="customerInfoData.maKH" class="pm-count tabular-nums">{{ customerInfoData.maKH }}</span>
              <span v-if="customerInfoData.lastUpdated" class="cm-upd-pill tabular-nums">
                Cập nhật: {{ formatCustomerUpdatedAt(customerInfoData.lastUpdated) }}
              </span>
            </div>
            <button type="button" class="dm-close-btn" @click="showCustomerInfoModal = false" title="Đóng">✕</button>
          </div>

          <div class="cm-body">
            <!-- Bố cục 2 cột đầy đủ như Modal Chi tiết bên trang Khách hàng -->
            <div class="cm-2col">
              <!-- CỘT TRÁI: LIÊN HỆ & PHÂN NHÓM & CÔNG NỢ -->
              <div class="cm-col">
                <!-- Box 1: Người Liên Hệ & Định Danh -->
                <div class="cm-section-box">
                  <div class="cm-section-title is-emerald">
                    <span>Người Liên Hệ &amp; Định Danh</span>
                  </div>
                  <div class="cm-grid">
                    <div class="cm-field">
                      <span>Tên người liên hệ chính</span>
                      <strong>{{ customerInfoData.tenKH || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>Mã khách hàng</span>
                      <strong class="is-mono tabular-nums">{{ customerInfoData.maKH || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>SĐT cá nhân</span>
                      <strong class="tabular-nums">{{ customerInfoData.sdt || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>Email cá nhân</span>
                      <strong>{{ customerInfoData.email || '—' }}</strong>
                    </div>
                  </div>

                  <div class="cm-sub-divider">Người liên hệ phụ / Giao nhận</div>
                  <div class="cm-grid">
                    <div class="cm-field is-full">
                      <span>Tên khách hàng phụ</span>
                      <strong>{{ customerInfoData.tenKHPhu || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>SĐT liên hệ phụ</span>
                      <strong class="tabular-nums">{{ customerInfoData.sdtPhu || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>Email liên hệ phụ</span>
                      <strong>{{ customerInfoData.emailPhu || '—' }}</strong>
                    </div>
                  </div>
                </div>

                <!-- Box 2: Nhóm Khách Hàng (tagKH) & Ghi Chú -->
                <div class="cm-section-box">
                  <div class="cm-section-title is-amber">
                    <span>Nhóm Khách Hàng (tagKH) &amp; Ghi Chú</span>
                  </div>
                  <div v-if="customerInfoData.tagKH && customerInfoData.tagKH.length > 0" class="cm-tag-list">
                    <span v-for="tag in customerInfoData.tagKH" :key="'cm-tag-' + tag" class="cm-tag-chip">
                      {{ tag }}
                    </span>
                  </div>
                  <div v-else class="cm-empty-note">Chưa gán nhóm khách hàng</div>

                  <div class="cm-field is-full" style="margin-top: 8px;">
                    <span>Ghi chú chăm sóc</span>
                    <strong>{{ customerInfoData.ghiChu || '—' }}</strong>
                  </div>
                </div>

                <!-- Box 3: Công Nợ Hiện Tại Của Khách Hàng -->
                <div class="cm-section-box cm-debt-box">
                  <div class="cm-section-title is-sky">
                    <span>Công Nợ Hiện Tại Của Khách Hàng</span>
                  </div>
                  <div class="cm-debt-stats">
                    <div class="cm-debt-stat">
                      <span class="cm-debt-lbl">Công nợ hiện tại</span>
                      <strong
                        class="cm-debt-val-lg tabular-nums"
                        :class="customerInfoDebtSummary.congNo > 0 ? 'is-rose' : 'is-emerald'"
                      >
                        {{ formatVND(customerInfoDebtSummary.congNo) }} đ
                      </strong>
                    </div>
                    <div class="cm-debt-stat">
                      <span class="cm-debt-lbl">Đã thanh toán</span>
                      <strong class="cm-debt-val tabular-nums is-emerald">
                        {{ formatVND(customerInfoDebtSummary.daThanhToan) }} đ
                      </strong>
                    </div>
                    <div class="cm-debt-stat">
                      <span class="cm-debt-lbl">Tổng phải thu ({{ customerInfoDebtSummary.poCount }} PO)</span>
                      <strong class="cm-debt-val tabular-nums is-sky">
                        {{ formatVND(customerInfoDebtSummary.tongSauVat) }} đ
                        <small>({{ customerInfoDebtSummary.progressPct }}%)</small>
                      </strong>
                    </div>
                  </div>
                  <div class="cm-debt-bar-track">
                    <div
                      class="cm-debt-bar-fill"
                      :class="{ 'is-paid': customerInfoDebtSummary.congNo <= 0 }"
                      :style="{ width: customerInfoDebtSummary.progressPct + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- CỘT PHẢI: PHÁP NHÂN CÔNG TY & HÓA ĐƠN -->
              <div class="cm-col">
                <div class="cm-section-box">
                  <div class="cm-section-title is-indigo">
                    <span>Pháp Nhân Công Ty &amp; Hóa Đơn</span>
                  </div>
                  <div class="cm-grid">
                    <div class="cm-field is-full">
                      <span>Tên công ty / Tổ chức</span>
                      <strong>{{ customerInfoData.tenCongTy || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>Mã công ty</span>
                      <strong class="is-mono tabular-nums">{{ customerInfoData.maCongTy || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>Mã số thuế (MST)</span>
                      <strong class="is-mono tabular-nums">{{ customerInfoData.mst || '—' }}</strong>
                    </div>
                    <div class="cm-field is-full">
                      <span>Địa chỉ xuất hóa đơn / Trụ sở</span>
                      <strong>{{ customerInfoData.diaChi || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>SĐT công ty</span>
                      <strong class="tabular-nums">{{ customerInfoData.sdtCongTy || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>Số Fax</span>
                      <strong class="tabular-nums">{{ customerInfoData.fax || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>Email công ty / Hóa đơn</span>
                      <strong>{{ customerInfoData.emailCongTy || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>Website</span>
                      <strong>{{ customerInfoData.website || '—' }}</strong>
                    </div>
                    <div class="cm-field is-full">
                      <span>Ngành nghề kinh doanh chính</span>
                      <strong>{{ customerInfoData.nganhNghe || '—' }}</strong>
                    </div>
                  </div>

                  <div class="cm-sub-divider">Thông tin tiếng Anh / Đề xuất mua hàng (DXMH)</div>
                  <div class="cm-grid">
                    <div class="cm-field">
                      <span>COMPANY (Eng)</span>
                      <strong>{{ customerInfoData.company || '—' }}</strong>
                    </div>
                    <div class="cm-field">
                      <span>TEL (Eng)</span>
                      <strong class="tabular-nums">{{ customerInfoData.tel || '—' }}</strong>
                    </div>
                    <div class="cm-field is-full">
                      <span>ADDRESS (Eng)</span>
                      <strong>{{ customerInfoData.address || '—' }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="cm-foot">
            <button type="button" class="qlbg-ghost-btn" @click="showCustomerInfoModal = false">
              Đóng
            </button>
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

    <!-- THANH NỔI THAO TÁC NHANH KHI CHỌN BÁO GIÁ ĐỂ SO SÁNH (100% ĐỒNG BỘ SALEREPORT) -->
    <Teleport to="body">
      <div
        v-if="selectedCompareIds.length > 0 && !showCompareModal && !showDetailModal && !confirmDialog.visible && !asyncResultModal.show && !showCustomerInfoModal && !showCustomerPickerModal"
        class="sr-selection-floating-bar"
      >
        <div class="sr-sel-bar-info">
          <span class="sr-sel-count-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Đã chọn: {{ selectedCompareIds.length }}
          </span>
        </div>
        <div class="sr-sel-bar-actions">
          <button
            type="button"
            class="sr-sel-btn sr-sel-btn-compare"
            @click="showCompareModal = true"
            title="Mở bảng Phân tích & So sánh chỉ số giữa các báo giá đang chọn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>So sánh</span>
          </button>
          <button
            v-if="filteredContracts.length > 0 && !isAllFilteredSelectedForCompare"
            type="button"
            class="sr-sel-btn sr-sel-btn-ghost"
            @click="toggleSelectAllVisibleForCompare"
            title="Chọn tất cả báo giá đang hiển thị theo bộ lọc"
          >
            Chọn tất cả ({{ filteredContracts.length }})
          </button>
          <button
            type="button"
            class="sr-sel-btn sr-sel-btn-clear"
            @click="clearCompareSelection"
          >
            Bỏ chọn
          </button>
        </div>
      </div>
    </Teleport>

    <!-- MODAL PHÂN TÍCH & SO SÁNH ĐA PHƯƠNG ÁN (100% ĐỒNG BỘ SALEREPORT PHƯƠNG ÁN TẠM) -->
    <QuoteCompareModal
      :show="showCompareModal"
      :rows="compareModalRows"
      :total-count="filteredContracts.length || contracts.length"
      :ui-theme="uiTheme"
      initial-price-mode="hd"
      :chot-deal-loading="chotDealLoading"
      @close="showCompareModal = false"
      @remove="removeFromCompareModal"
      @view-detail="c => viewDetails(c)"
      @edit="c => { showCompareModal = false; editContract(c) }"
      @duplicate="c => { showCompareModal = false; duplicateContract(c) }"
      @chot-deal="c => chotDealAndSaleReport(c)"
      @open-sr="c => { showCompareModal = false; openInSaleReport(c) }"
    />

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

    <!-- POPOVER THIẾT LẬP HIỂN THỊ MOBILE (TRÊN FLOATING DOCK <= 768px) -->
    <div
      v-if="isMobileDockViewport && showMobileDisplayPopover && !isMobileDockHidden"
      ref="mobileDisplayPopoverRef"
      class="bg-mob-display-popover"
      @click.stop
    >
      <div class="bg-ds-head">
        <span class="bg-ds-title">Thiết lập hiển thị</span>
        <button type="button" class="bg-ds-close" @click="showMobileDisplayPopover = false" aria-label="Đóng">✕</button>
      </div>

      <div class="bg-ds-section">
        <div class="bg-ds-label">Giao diện (Theme)</div>
        <div class="bg-ds-grid-2">
          <button
            type="button"
            class="bg-ds-opt-btn"
            :class="{ active: uiTheme === 'dark' }"
            @click="uiTheme !== 'dark' && toggleUiTheme()"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <span>Tối (Mặc định)</span>
          </button>
          <button
            type="button"
            class="bg-ds-opt-btn"
            :class="{ active: uiTheme === 'light' }"
            @click="uiTheme !== 'light' && toggleUiTheme()"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <span>Sáng (Xanh-Trắng)</span>
          </button>
        </div>
      </div>

      <div v-if="displayedGroupedContracts.length > 0" class="bg-ds-section" :class="{ 'is-last': !hasActiveFilters }">
        <div class="bg-ds-label">Nhóm phiên bản</div>
        <div class="bg-ds-grid-2">
          <button
            type="button"
            class="bg-ds-opt-btn"
            :class="{ active: !areAllGroupsCollapsed }"
            @click="areAllGroupsCollapsed && toggleAllGroupsCollapse()"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            <span>Mở rộng tất cả</span>
          </button>
          <button
            type="button"
            class="bg-ds-opt-btn"
            :class="{ active: areAllGroupsCollapsed }"
            @click="!areAllGroupsCollapsed && toggleAllGroupsCollapse()"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
            <span>Thu gọn tất cả</span>
          </button>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="bg-ds-section is-last">
        <button
          type="button"
          class="bg-ds-reset-btn"
          @click="resetAllFilters(); showMobileDisplayPopover = false"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>Đặt lại toàn bộ bộ lọc</span>
        </button>
      </div>
    </div>

    <!-- MOBILE FLOATING GLASS BOTTOM SUB-DOCK (HIỂN THỊ | TẠO BÁO GIÁ | ĐỒNG BỘ — CHUẨN APP.VUE & SALEREPORT) -->
    <nav
      v-if="isMobileDockViewport"
      ref="mobileDockRef"
      class="bg-mobile-dock"
      :class="{ 'is-modal-hidden': isMobileDockHidden }"
      aria-label="Thanh thao tác nhanh Quản lý Báo giá Mobile"
    >
      <!-- 1. Hiển thị (Theme Sáng/Tối + Thu gọn/Mở rộng nhóm) -->
      <button
        type="button"
        class="bg-dock-btn"
        :class="{ active: showMobileDisplayPopover }"
        @click.stop="showMobileDisplayPopover = !showMobileDisplayPopover"
        title="Thiết lập hiển thị & giao diện"
      >
        <div class="bg-dock-icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span class="bg-dock-badge is-mode">
            {{ uiTheme === 'dark' ? 'Tối' : 'Sáng' }}
          </span>
        </div>
        <span>Hiển thị</span>
      </button>

      <!-- 2. Tạo báo giá mới (Primary Center CTA) -->
      <button
        type="button"
        class="bg-dock-btn is-primary is-center-cta"
        @click="goCreateNewQuote"
      >
        <div class="bg-dock-icon-wrap">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <span>Tạo báo giá</span>
      </button>

      <!-- 3. Đồng bộ dữ liệu -->
      <button
        type="button"
        class="bg-dock-btn"
        :disabled="loading"
        @click="fetchData(true)"
        title="Đồng bộ lại dữ liệu"
      >
        <div class="bg-dock-icon-wrap">
          <svg :class="{ 'is-spin': loading }" width="17.5" height="17.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <span v-if="totalGroups > 0" class="bg-dock-badge tabular-nums">
            {{ totalGroups > 999 ? '999+' : totalGroups }}
          </span>
        </div>
        <span>{{ loading ? 'Đang tải...' : 'Đồng bộ' }}</span>
      </button>
    </nav>
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
import { buildQuoteFileName } from '../utils/printTemplateEngine'
import QuoteCompareModal, { type CompareQuoteRow } from './QuoteCompareModal.vue'

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
const customerFullMap = ref<Map<string, any>>(new Map())
const hangHoaDescMap = ref<Record<string, string>>({})
const hangHoaSkuMap = ref<Record<string, string>>({})
const saleReportMapByKeyOrPo = ref<Record<string, { key: string; soPo: string; paid: number; debt: number; total: number }>>({})
const saleReportRecords = ref<Array<{ maKH: string; maCT: string; mst: string; total: number; paid: number; debt: number }>>([])
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

function normalizeCustomerFullRecord(item: any, fbKey: string) {
  if (!item || typeof item !== 'object') return null
  if (Array.isArray(item)) {
    const r = fbKhachHangToRow(item, fbKey)
    return {
      maKH: String(r[0] || fbKey || '').trim(),
      tenKH: String(r[1] || ''),
      email: String(r[2] || ''),
      sdt: String(r[3] || ''),
      maCongTy: String(r[4] || ''),
      tenCongTy: String(r[5] || ''),
      sdtCongTy: String(r[6] || ''),
      fax: String(r[7] || ''),
      diaChi: String(r[8] || ''),
      emailCongTy: String(r[9] || ''),
      website: String(r[10] || ''),
      trangThai: String(r[14] || ''),
      ghiChu: String(r[15] || ''),
      tenKHPhu: String(r[16] || ''),
      sdtPhu: String(r[17] || ''),
      emailPhu: String(r[18] || ''),
      mst: String(r[19] || ''),
      company: String(r[20] || ''),
      address: String(r[21] || ''),
      tel: String(r[22] || ''),
      nganhNghe: '',
      tagKH: [] as string[],
      congNoRaw: toNum(r[13], 0),
      lastUpdated: ''
    }
  }
  const maKH = String(item.ma_khach_hang ?? item.Ma_khach_hang ?? fbKey ?? '').trim()
  const tagKH = Array.isArray(item.tagKH)
    ? item.tagKH.map((t: any) => String(t || '').trim()).filter(Boolean)
    : typeof item.tagKH === 'string' && item.tagKH.trim()
      ? [item.tagKH.trim()]
      : []
  return {
    maKH,
    tenKH: String(item.ten_khach_hang ?? item.Ten_khach_hang ?? ''),
    email: String(item.email_ca_nhan ?? item.Email_ca_nhan ?? item.email ?? ''),
    sdt: String(item.so_dien_thoai_ca_nhan ?? item.So_dien_thoai_ca_nhan ?? item.sdt ?? ''),
    maCongTy: String(item.ma_cong_ty ?? item.Ma_cong_ty ?? ''),
    tenCongTy: String(item.ten_cong_ty ?? item.Ten_cong_ty ?? item.COMPANY ?? ''),
    sdtCongTy: String(item.so_dien_thoai_cong_ty ?? item.So_dien_thoai_cong_ty ?? ''),
    fax: String(item.so_fax_cong_ty ?? item.So_fax_cong_ty ?? ''),
    diaChi: String(
      item.dia_chi_cong_ty ??
        item.Dia_chi_cong_ty ??
        item.dia_chi ??
        item.Dia_chi ??
        item.diaChi ??
        item.dia_chi_hoa_don ??
        item.Dia_chi_hoa_don ??
        ''
    ),
    emailCongTy: String(item.email_cong_ty ?? item.Email_cong_ty ?? ''),
    website: String(item.website_cong_ty ?? item.Website_cong_ty ?? ''),
    trangThai: String(item.trang_thai ?? item.Trang_thai ?? ''),
    ghiChu: String(item.ghi_chu ?? item.Ghi_chu ?? ''),
    tenKHPhu: String(item.ten_khach_hang_phu ?? item.Ten_khach_hang_phu ?? ''),
    sdtPhu: String(item.so_dien_thoai_ca_nhan_phu ?? item.So_dien_thoai_ca_nhan_phu ?? ''),
    emailPhu: String(item.email_ca_nhan_phu ?? item.Email_ca_nhan_phu ?? ''),
    mst: String(item.mst ?? item.MST ?? ''),
    company: String(item.company ?? item.COMPANY ?? ''),
    address: String(item.address ?? item.ADDRESS ?? ''),
    tel: String(item.tel ?? item.TEL ?? ''),
    nganhNghe: String(
      item.nganh_nghe_cong_ty ?? item.Nganh_nghe_cong_ty ?? item.nganh_nghe_chinh ?? item.Nganh_nghe_chinh ?? ''
    ),
    tagKH,
    congNoRaw: Math.max(0, toNum(item.cong_no, 0)),
    lastUpdated: item.last_updated ?? item.lastupdated ?? item.lastUpdated ?? item.lastupadted ?? ''
  }
}

function applyCustomersSnapshot(data: any) {
  if (!data || typeof data !== 'object') {
    customersRaw.value = []
    customerFullMap.value = new Map()
    return
  }
  const rows: any[][] = []
  const fullMap = new Map<string, any>()
  for (const [k, v] of Object.entries(data)) {
    const row = fbKhachHangToRow(v, k)
    rows.push(row)
    const full = normalizeCustomerFullRecord(v, k)
    if (full && full.maKH) {
      fullMap.set(full.maKH, full)
    }
  }
  customersRaw.value = rows
  customerFullMap.value = fullMap
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
  const list: Array<{ maKH: string; maCT: string; mst: string; total: number; paid: number; debt: number }> = []
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
      list.push({
        maKH: String(v.Ma_khach_hang ?? v.ma_khach_hang ?? '').trim(),
        maCT: String(v.Ma_cong_ty ?? v.ma_cong_ty ?? '').trim(),
        mst: String(v.MST ?? v.mst ?? '').trim(),
        total,
        paid,
        debt
      })
    }
  }
  saleReportMapByKeyOrPo.value = map
  saleReportRecords.value = list
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
  return c.tong_truoc_thue
}
function getContractVat(c: Contract): number {
  return c.tong_vat
}
function getContractSauThue(c: Contract): number {
  return c.tong_sau_thue
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

function isOfficialContract(c: Contract | null): boolean {
  if (!c) return false
  const status = String(c.trang_thai || '').trim()
  if (status === 'Chính thức') return true
  if (status === 'Tạm') return false
  return Boolean(c.is_completed)
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

const sortRootRef = ref<HTMLElement | null>(null)
const showSortMenu = ref(false)
const sortOptions: { value: typeof sortMode.value; label: string; desc: string; tag: string }[] = [
  { value: 'DESC', label: 'Ngày tạo: Mới → Cũ', desc: 'Ưu tiên báo giá mới tạo lên đầu', tag: 'Mặc định' },
  { value: 'ASC', label: 'Ngày tạo: Cũ → Mới', desc: 'Xem theo thứ tự thời gian cũ trước', tag: 'Tăng dần' },
  { value: 'AMOUNT_DESC', label: 'Giá trị: Cao → Thấp', desc: 'Ưu tiên đơn tổng sau VAT lớn nhất', tag: 'Giá cao' },
  { value: 'AMOUNT_ASC', label: 'Giá trị: Thấp → Cao', desc: 'Xem các đơn giá trị nhỏ trước', tag: 'Giá thấp' }
]
const selectedSortLabel = computed(() => {
  return sortOptions.find(o => o.value === sortMode.value)?.label || 'Ngày tạo: Mới → Cũ'
})
function toggleSortMenu() {
  showSortMenu.value = !showSortMenu.value
}
function selectSortOption(val: typeof sortMode.value) {
  sortMode.value = val
  showSortMenu.value = false
}

const showDateModal = ref(false)
const draftDateRange = ref<typeof dateQuickRange.value>('all')
const draftCustomFrom = ref('')
const draftCustomTo = ref('')

const dateQuickOptions: { value: typeof dateQuickRange.value; label: string; desc: string }[] = [
  { value: 'all', label: 'Tất cả', desc: 'Không giới hạn ngày tạo' },
  { value: 'today', label: 'Hôm nay', desc: 'Tạo trong ngày hôm nay' },
  { value: '7d', label: '7 ngày qua', desc: 'Trong 7 ngày gần nhất' },
  { value: 'month', label: 'Tháng này', desc: 'Từ đầu tháng tới nay' },
  { value: 'quarter', label: 'Quý này', desc: 'Trong quý hiện tại' },
  { value: 'year', label: 'Năm nay', desc: 'Từ đầu năm tới nay' },
  { value: 'custom', label: 'Tùy chọn', desc: 'Tự chọn Từ ngày → Đến ngày' }
]

function formatShortIsoDate(iso: string): string {
  const parts = String(iso || '').split('-')
  if (parts.length !== 3) return iso
  return `${parts[2]}/${parts[1]}`
}

const selectedDateLabel = computed(() => {
  if (dateQuickRange.value === 'all') return 'Thời gian: Tất cả'
  if (dateQuickRange.value === 'custom') {
    if (customDateFrom.value && customDateTo.value) {
      return `${formatShortIsoDate(customDateFrom.value)} → ${formatShortIsoDate(customDateTo.value)}`
    }
    if (customDateFrom.value) return `Từ ${formatShortIsoDate(customDateFrom.value)}`
    if (customDateTo.value) return `Đến ${formatShortIsoDate(customDateTo.value)}`
    return 'Khoảng ngày'
  }
  return dateQuickOptions.find(o => o.value === dateQuickRange.value)?.label || 'Thời gian: Tất cả'
})

function openDateModal() {
  showSortMenu.value = false
  draftDateRange.value = dateQuickRange.value
  if (customDateFrom.value || customDateTo.value) {
    draftCustomFrom.value = customDateFrom.value
    draftCustomTo.value = customDateTo.value
  } else {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    draftCustomTo.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    draftCustomFrom.value = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`
  }
  showDateModal.value = true
}

function selectDatePresetInModal(val: typeof dateQuickRange.value) {
  draftDateRange.value = val
  if (val !== 'custom') {
    dateQuickRange.value = val
    customDateFrom.value = ''
    customDateTo.value = ''
    showDateModal.value = false
  }
}

function applyCustomDateModal() {
  let fromVal = draftCustomFrom.value
  let toVal = draftCustomTo.value
  if (fromVal && toVal && fromVal > toVal) {
    const tmp = fromVal
    fromVal = toVal
    toVal = tmp
  }
  dateQuickRange.value = 'custom'
  customDateFrom.value = fromVal
  customDateTo.value = toVal
  showDateModal.value = false
}

function resetDateFilter() {
  dateQuickRange.value = 'all'
  customDateFrom.value = ''
  customDateTo.value = ''
  draftDateRange.value = 'all'
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
  // Gom toàn bộ báo giá (cả nhóm nhiều phiên bản lẫn đơn 1 bản) theo ma_hop_dong_goc || ma_hop_dong
  const tempBucket = new Map<string, Contract[]>()
  filteredContracts.value.forEach(c => {
    const gocKey = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
    if (!tempBucket.has(gocKey)) tempBucket.set(gocKey, [])
    const arr = tempBucket.get(gocKey)!
    if (!arr.some(x => x.ma_hop_dong === c.ma_hop_dong)) arr.push(c)
  })

  const groups: ContractGroup[] = []
  tempBucket.forEach((vers, goc) => {
    if (!vers.length) return
    // Sort versions inside a group: Chính thức first, then newest first so versions[0] is always the lead version
    const sortedVers = [...vers].sort((a, b) => {
      const aOff = isOfficialContract(a)
      const bOff = isOfficialContract(b)
      if (aOff !== bOff) return aOff ? -1 : 1
      const da = parseVietnameseDate(a.created_time || a.ngay_tao)?.getTime() || 0
      const db = parseVietnameseDate(b.created_time || b.ngay_tao)?.getTime() || 0
      return db - da
    })
    groups.push({ goc, latest: sortedVers[0], versions: sortedVers })
  })

  return groups.sort((a, b) => compareContracts(a.latest, b.latest))
})

function isGroupCompleted(g: ContractGroup): boolean {
  return g.versions.some(v => isOfficialContract(v))
}

function getGroupPoContent(g: ContractGroup): string {
  if (!g?.versions?.length) return ''
  const fromLatest = String(g.latest?.content_of_contract_po || '').trim()
  if (fromLatest) return fromLatest
  const match = g.versions.find(v => String(v.content_of_contract_po || '').trim())
  return String(match?.content_of_contract_po || '').trim()
}

function getGroupNewestCreatedTime(g: ContractGroup): string {
  if (!g?.versions?.length) return ''
  let newestVer = g.versions[0]
  let newestTs = parseVietnameseDate(newestVer.created_time || newestVer.ngay_tao)?.getTime() || 0
  for (let i = 1; i < g.versions.length; i++) {
    const v = g.versions[i]
    const ts = parseVietnameseDate(v.created_time || v.ngay_tao)?.getTime() || 0
    if (ts > newestTs) {
      newestTs = ts
      newestVer = v
    }
  }
  return newestVer.created_time || newestVer.ngay_tao || ''
}

const totalGroups = computed(() => groupedContracts.value.length)
const completedGroups = computed(() => groupedContracts.value.filter(g => isGroupCompleted(g)).length)
const processingGroups = computed(() => groupedContracts.value.filter(g => !isGroupCompleted(g)).length)

const displayedGroupedContracts = computed(() => {
  if (dashboardFilter.value === 'ALL') return groupedContracts.value
  if (dashboardFilter.value === 'COMPLETED') return groupedContracts.value.filter(g => isGroupCompleted(g))
  return groupedContracts.value.filter(g => !isGroupCompleted(g))
})

const hasAnyDisplayedData = computed(() => {
  return displayedGroupedContracts.value.length > 0
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
const MODAL_CUST_LAZY_BATCH = 25

const cardDisplayLimit = ref(CARD_LAZY_BATCH)

const paginatedGroupedContracts = computed(() => {
  return displayedGroupedContracts.value.slice(0, cardDisplayLimit.value)
})

const hasMoreCards = computed(() => paginatedGroupedContracts.value.length < displayedGroupedContracts.value.length)
function loadMoreCards() {
  if (hasMoreCards.value) cardDisplayLimit.value += CARD_LAZY_BATCH
}

watch([searchKeyword, customerFilter, dashboardFilter, dateQuickRange, customDateFrom, customDateTo, sortMode], () => {
  cardDisplayLimit.value = CARD_LAZY_BATCH
})

const cardLazySentinelRef = ref<HTMLElement | null>(null)
const customerModalSentinelRef = ref<HTMLElement | null>(null)

let cardObserver: IntersectionObserver | null = null
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

function openCustomerModal() {
  showSortMenu.value = false
  customerModalSearch.value = ''
  customerModalLimit.value = MODAL_CUST_LAZY_BATCH
  showCustomerModal.value = true
}

function selectCustomerFilter(id: string) {
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

function formatCustomerUpdatedAt(val: any): string {
  if (!val && val !== 0) return ''
  const rawStr = String(val).trim()
  if (!rawStr) return ''
  const dt = /^\d+$/.test(rawStr) ? new Date(Number(rawStr)) : parseVietnameseDate(rawStr)
  if (!dt || isNaN(dt.getTime())) return rawStr
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const customerInfoDebtSummary = computed(() => {
  const d = customerInfoData.value
  if (!d) return { poCount: 0, tongSauVat: 0, daThanhToan: 0, congNo: 0, progressPct: 100 }
  const mkh = String(d.maKH || '').trim()
  const mct = String(d.maCongTy || '').trim()
  const mst = String(d.mst || '').trim()

  const pos = saleReportRecords.value.filter(r => {
    if (mkh && r.maKH && mkh === r.maKH) return true
    if (mct && r.maCT && mct === r.maCT) return true
    if (mkh && r.maCT && mkh === r.maCT) return true
    if (mct && r.maKH && mct === r.maKH) return true
    if (mst && r.mst && mst === r.mst) return true
    return false
  })

  if (pos.length > 0) {
    const tongSauVat = pos.reduce((s, r) => s + r.total, 0)
    const daThanhToan = pos.reduce((s, r) => s + r.paid, 0)
    const congNo = pos.reduce((s, r) => s + r.debt, 0)
    const progressPct =
      tongSauVat > 0 ? Math.min(100, Math.round((daThanhToan / tongSauVat) * 100)) : congNo <= 0 ? 100 : 0
    return { poCount: pos.length, tongSauVat, daThanhToan, congNo, progressPct }
  }

  const fallbackCn = Math.max(0, toNum(d.congNoRaw, 0))
  return {
    poCount: 0,
    tongSauVat: fallbackCn,
    daThanhToan: 0,
    congNo: fallbackCn,
    progressPct: fallbackCn > 0 ? 0 : 100
  }
})

function openCustomerInfoModal(maKH: string) {
  const key = String(maKH || '').trim()
  const full = customerFullMap.value.get(key)
  if (full) {
    customerInfoData.value = { ...full }
  } else {
    const row = customerMap.value.get(key)
    if (row) {
      customerInfoData.value = {
        maKH: String(row[0] || ''),
        tenKH: String(row[1] || ''),
        email: String(row[2] || ''),
        sdt: String(row[3] || ''),
        maCongTy: String(row[4] || ''),
        tenCongTy: String(row[5] || ''),
        sdtCongTy: String(row[6] || ''),
        fax: String(row[7] || ''),
        diaChi: String(row[8] || ''),
        emailCongTy: String(row[9] || ''),
        website: String(row[10] || ''),
        congNoRaw: Math.max(0, toNum(row[13], 0)),
        trangThai: String(row[14] || ''),
        ghiChu: String(row[15] || ''),
        tenKHPhu: String(row[16] || ''),
        sdtPhu: String(row[17] || ''),
        emailPhu: String(row[18] || ''),
        mst: String(row[19] || ''),
        company: String(row[20] || ''),
        address: String(row[21] || ''),
        tel: String(row[22] || ''),
        nganhNghe: '',
        tagKH: [],
        lastUpdated: ''
      }
    } else {
      customerInfoData.value = { maKH: key, tagKH: [], congNoRaw: 0 }
    }
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
const activeMobileInnerTab = ref<'goods' | 'metrics'>('goods')
const isMobileModalView = ref(false)
const isMobileDockViewport = ref(false)
const showMobileDisplayPopover = ref(false)
const mobileDockRef = ref<HTMLElement | null>(null)
const mobileDisplayPopoverRef = ref<HTMLElement | null>(null)
let detailModalMq: MediaQueryList | null = null
let mobileDockMq: MediaQueryList | null = null

function updateMobileModalViewport(target?: MediaQueryList | MediaQueryListEvent) {
  const matches = target
    ? target.matches
    : typeof window !== 'undefined'
      ? window.innerWidth <= 1080
      : false
  isMobileModalView.value = matches
}

function updateMobileDockViewport(target?: MediaQueryList | MediaQueryListEvent) {
  const matches = target
    ? target.matches
    : typeof window !== 'undefined'
      ? window.innerWidth <= 768
      : false
  isMobileDockViewport.value = matches
  if (!matches) showMobileDisplayPopover.value = false
}
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

function toggleDetailDockTab(tab: 'customer' | 'files' | 'discount' | 'finance') {
  activeDetailDockTab.value = activeDetailDockTab.value === tab ? '' : tab
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
    _hasOrigSaved: false
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
  selectedContract.value = contract
  detailViewMode.value = 'hd'
  cmpSrPriceSource.value = 'contract'
  quoteCurrency.value = 'VND'
  activeMobileSubTab.value = 'chitiet'
  activeMobileInnerTab.value = 'goods'
  showCompareFinancePanel.value = true
  if (!activeDetailDockTab.value) activeDetailDockTab.value = 'discount'
  showDetailModal.value = true
  loadingDetails.value = true
  rebuildSelectedContractDetails(contract.ma_hop_dong)
  initModalMetricsFromContract(contract)
  loadingDetails.value = false
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

function setCmpSrPriceSource(src: 'contract' | 'customer') {
  cmpSrPriceSource.value = src
  if (detailViewMode.value !== 'noibo') {
    detailViewMode.value = src === 'customer' ? 'khach' : 'hd'
  }
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

/* ======================
   DUAL-SLOT FILE MANAGEMENT (HĐ & KHÁCH + ĐỒNG BỘ SALE REPORT / QUAN LY FILE)
====================== */
const contractFileInputHd = ref<HTMLInputElement | null>(null)
const contractFileInputKhach = ref<HTMLInputElement | null>(null)
const uploadingFileSlot = ref<'hd' | 'khach' | null>(null)

function triggerSlotUpload(slot: 'hd' | 'khach') {
  if (slot === 'hd') contractFileInputHd.value?.click()
  else contractFileInputKhach.value?.click()
}

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

function getCardFilesList(c: Contract): { slot: 'hd' | 'khach'; label: string; name: string; link: string }[] {
  const hd = extractFilePairs(c.ten_file, c.link_file).map(f => ({
    slot: 'hd' as const,
    label: 'HĐ',
    name: f.name,
    link: f.link
  }))
  const khach = extractFilePairs(c.ten_file_khach, c.link_file_khach).map(f => ({
    slot: 'khach' as const,
    label: 'Khách',
    name: f.name,
    link: f.link
  }))
  return [...hd, ...khach]
}

function getCardFileIconSvg(fileName: string, fileUrl = ''): string {
  const check = `${fileName || ''} ${fileUrl || ''}`.toLowerCase()
  const isPdf = /\.pdf(\?|#|\s|$)/i.test(check)
  const isWord = /\.(docx?|rtf)(\?|#|\s|$)/i.test(check) || (!isPdf && check.includes('word'))
  const isImage = /\.(png|jpe?g|webp|gif|bmp|svg|jfif|tiff?)(\?|#|\s|$)/i.test(check)
  const isExcel =
    /\.(xlsx?|xls|xlsm|xlsb|csv)(\?|#|\s|$)/i.test(check) ||
    (!isPdf && !isWord && !isImage && (check.includes('excel') || check.includes('báo giá') || check.includes('mua hàng') || check.includes('dxmh')))

  if (isExcel) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="15" height="15"><path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"/><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"/><path fill="#2E7D32" d="M27,42L6,38.746C5.416,38.655,5,38.146,5,37.555v-27.11c0-0.591,0.416-1.1,1-1.191L27,6V42z"/><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"/></svg>`
  }
  if (isPdf) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="15" height="15"><path fill="#FF1744" d="M38,42H10c-2.2,0-4-1.8-4-4V10c0-2.2,1.8-4,4-4h19l13,13v19C42,40.2,40.2,42,38,42z"/><path fill="#B71C1C" d="M29,6v9c0,2.2,1.8,4,4,4h9L29,6z"/><path fill="#FFF" d="M13.5,27v-8h3.3c1.8,0,2.9,1,2.9,2.6c0,1.6-1.1,2.6-2.9,2.6h-1.4V27H13.5z M15.4,22.6h1.2c0.8,0,1.2-0.4,1.2-1.1c0-0.7-0.4-1.1-1.2-1.1h-1.2V22.6z M21.2,27v-8h3c2.5,0,4.1,1.5,4.1,4c0,2.5-1.6,4-4.1,4H21.2z M23.1,25.4h1c1.4,0,2.2-0.9,2.2-2.4c0-1.5-0.8-2.4-2.2-2.4h-1V25.4z M29.9,27v-8h5.4v1.6h-3.5v1.7h3.1v1.6h-3.1V27H29.9z"/><rect x="13.5" y="30" width="21" height="2" rx="1" fill="#FFF"/><rect x="13.5" y="33.5" width="16" height="2" rx="1" fill="#FFF"/><rect x="13.5" y="37" width="12" height="2" rx="1" fill="#FFF"/></svg>`
  }
  if (isWord) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="15" height="15"><path fill="#2196F3" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"/><path fill="#FFF" d="M25 15H39V17.5H25zM25 20H39V22.5H25zM25 25H39V27.5H25zM25 30H35V32.5H25z"/><path fill="#1565C0" d="M27,42L6,38.746C5.416,38.655,5,38.146,5,37.555v-27.11c0-0.591,0.416-1.1,1-1.191L27,6V42z"/><path fill="#FFF" d="M21.8,17h-2.7l-1.5,8.6L15.8,17h-2.5l-1.9,8.6L9.9,17H7.1l2.8,14h2.7l1.9-8.3l1.8,8.3H19l2.8-14z"/></svg>`
  }
  if (isImage) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="15" height="15"><rect x="6" y="8" width="36" height="32" rx="4" fill="#29B6F6"/><circle cx="16.5" cy="17.5" r="4" fill="#FFD54F"/><path fill="#0277BD" d="M23,25l-11,13h26c2.2,0,4-1.8,4-4v-2L31,20L23,25z"/><path fill="#4FC3F7" d="M16,24L6,36c0,2.2,1.8,4,4,4h22L16,24z"/></svg>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="15" height="15"><path fill="#90CAF9" d="M38,42H10c-2.2,0-4-1.8-4-4V10c0-2.2,1.8-4,4-4h19l13,13v19C42,40.2,40.2,42,38,42z"/><path fill="#1976D2" d="M29,6v9c0,2.2,1.8,4,4,4h9L29,6z"/><rect x="14" y="23" width="20" height="2.5" rx="1.2" fill="#1565C0"/><rect x="14" y="29" width="20" height="2.5" rx="1.2" fill="#1565C0"/><rect x="14" y="35" width="13" height="2.5" rx="1.2" fill="#1565C0"/></svg>`
}

function getCardFilePreviewUrl(url: string, fileName = ''): string {
  if (!url) return ''
  const check = `${url} ${fileName}`.toLowerCase()
  if (/\.(xlsx?|xls|xlsm|xlsb|docx?|pptx?)(\?|#|\s|$)/i.test(check) || check.includes('.xls') || check.includes('.doc') || check.includes('.ppt')) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
  }
  return url
}

function getCardFileDownloadUrl(url: string): string {
  if (!url) return ''
  if (url.includes('drive.google.com/file/d/')) {
    try {
      const id = url.split('/d/')[1].split('/')[0]
      return `https://drive.google.com/uc?export=download&id=${id}`
    } catch {
      return url
    }
  }
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/fl_attachment/')
  }
  return url
}

async function handleCardFileDownload(event: Event, url: string, defaultName: string) {
  event.preventDefault()
  if (!url || typeof url !== 'string') return
  let name = defaultName || 'file'
  const lastPart = url.split('?')[0].split('/').pop() || ''
  const extIdx = lastPart.lastIndexOf('.')
  if (extIdx > -1) {
    const ext = lastPart.substring(extIdx)
    if (ext && !name.toLowerCase().endsWith(ext.toLowerCase())) name += ext
  }
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Fetch failed')
    const blob = await response.blob()
    const objUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = objUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(objUrl)
    }, 1000)
  } catch {
    window.open(getCardFileDownloadUrl(url), '_blank')
  }
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
  localStorage.setItem('pendingCreateNewQuoteTab', '1')
  router.push({ path: '/baogiafirebase', query: { newTab: '1', _ts: String(Date.now()) } })
}

function editContract(c: Contract | null) {
  if (!c || c.is_completed) return
  const ma = String(c.ma_hop_dong || '').trim()
  if (!ma) return
  localStorage.removeItem('pendingCreateNewQuoteTab')
  localStorage.setItem('pendingEditQuoteMaHopDong', ma)
  showDetailModal.value = false
  router.push({ path: '/baogiafirebase', query: { ma, _ts: String(Date.now()) } })
}

function duplicateContract(c: Contract | null) {
  if (!c) return
  localStorage.removeItem('pendingCreateNewQuoteTab')
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

function isOriginalContract(c: Contract | null): boolean {
  if (!c) return false
  const ma = String(c.ma_hop_dong || '').trim()
  const goc = String(c.ma_hop_dong_goc || '').trim()
  if (!ma) return false
  return !goc || goc === ma
}

function getVersionNumberLabel(c: Contract | null): string {
  if (!c) return ''
  const goc = String(c.ma_hop_dong_goc || c.ma_hop_dong).trim()
  const arr = familyVersionsMap.value.get(goc) || []
  if (arr.length <= 1) return ''
  const idx = arr.findIndex(x => x.ma_hop_dong === c.ma_hop_dong)
  return idx >= 0 ? `V${idx + 1}` : ''
}

/* ======================
   CHỌN & SO SÁNH BÁO GIÁ (100% ĐỒNG BỘ SO SÁNH PHƯƠNG ÁN TẠM SALEREPORT)
====================== */
const selectedCompareIds = ref<string[]>([])
const showCompareModal = ref(false)

function isQuoteSelectedForCompare(c: Contract | null): boolean {
  if (!c?.ma_hop_dong) return false
  return selectedCompareIds.value.includes(c.ma_hop_dong)
}

function toggleQuoteCompareSelection(c: Contract | null) {
  const id = String(c?.ma_hop_dong || '').trim()
  if (!id) return
  const idx = selectedCompareIds.value.indexOf(id)
  if (idx >= 0) {
    selectedCompareIds.value.splice(idx, 1)
  } else {
    selectedCompareIds.value.push(id)
  }
}

function isGroupSelectedForCompare(group: ContractGroup): boolean {
  if (!group?.versions?.length) return false
  return group.versions.every(v => isQuoteSelectedForCompare(v))
}

function isGroupPartiallySelectedForCompare(group: ContractGroup): boolean {
  if (!group?.versions?.length) return false
  const selectedCount = group.versions.filter(v => isQuoteSelectedForCompare(v)).length
  return selectedCount > 0 && selectedCount < group.versions.length
}

function toggleGroupCompareSelection(group: ContractGroup) {
  if (!group?.versions?.length) return
  const ids = group.versions.map(v => String(v.ma_hop_dong || '').trim()).filter(Boolean)
  if (!ids.length) return
  if (isGroupSelectedForCompare(group)) {
    const idSet = new Set(ids)
    selectedCompareIds.value = selectedCompareIds.value.filter(id => !idSet.has(id))
  } else {
    const curSet = new Set(selectedCompareIds.value)
    ids.forEach(id => {
      if (!curSet.has(id)) {
        curSet.add(id)
        selectedCompareIds.value.push(id)
      }
    })
  }
}

const isAllFilteredSelectedForCompare = computed(() => {
  const list = filteredContracts.value
  if (!list.length) return false
  return list.every(c => isQuoteSelectedForCompare(c))
})

function toggleSelectAllVisibleForCompare() {
  const list = filteredContracts.value
  if (!list.length) return
  if (isAllFilteredSelectedForCompare.value) {
    const visSet = new Set(list.map(c => c.ma_hop_dong))
    selectedCompareIds.value = selectedCompareIds.value.filter(id => !visSet.has(id))
  } else {
    const curSet = new Set(selectedCompareIds.value)
    list.forEach(c => {
      if (c.ma_hop_dong && !curSet.has(c.ma_hop_dong)) {
        curSet.add(c.ma_hop_dong)
        selectedCompareIds.value.push(c.ma_hop_dong)
      }
    })
  }
}

function clearCompareSelection() {
  selectedCompareIds.value = []
  showCompareModal.value = false
}

function removeFromCompareModal(row: CompareQuoteRow) {
  const targetId = String(row?.ma_hop_dong || row?.rowKey || '').trim()
  if (!targetId) return
  selectedCompareIds.value = selectedCompareIds.value.filter(id => id !== targetId)
}

const contractDetailStatsMap = computed(() => {
  const statsMap = new Map<string, { suppliers: string; giaMuaSum: number }>()
  const nccSets = new Map<string, Set<string>>()
  const muaSums = new Map<string, number>()

  allDetailsRaw.value.forEach(r => {
    const maHD = String(r[0] || '').trim()
    if (!maHD) return

    const ncc = String(r[6] || '').trim()
    if (ncc) {
      if (!nccSets.has(maHD)) nccSets.set(maHD, new Set<string>())
      nccSets.get(maHD)!.add(ncc)
    }

    const sl = Math.max(1, toNum(r[18], 1))
    const tgUsd = toNum(r[24], 0)
    const effTg = tgUsd > 1 ? tgUsd : (toNum(r[16], 1) > 1 ? toNum(r[16], 1) : 1)
    const giaMuaUnit =
      tgUsd > 1 && toNum(r[25], 0) > 0
        ? round2(toNum(r[25], 0) * tgUsd)
        : round2(toNum(r[13], 0) * effTg)
    muaSums.set(maHD, (muaSums.get(maHD) || 0) + round2(giaMuaUnit * sl))
  })

  nccSets.forEach((set, maHD) => {
    statsMap.set(maHD, {
      suppliers: Array.from(set).join(', '),
      giaMuaSum: Math.round(muaSums.get(maHD) || 0)
    })
  })
  muaSums.forEach((sum, maHD) => {
    if (!statsMap.has(maHD)) {
      statsMap.set(maHD, { suppliers: '', giaMuaSum: Math.round(sum) })
    }
  })

  return statsMap
})

const compareModalRows = computed<CompareQuoteRow[]>(() => {
  if (!selectedCompareIds.value.length) return []
  const byMa = new Map<string, Contract>()
  contracts.value.forEach(c => {
    if (c.ma_hop_dong) byMa.set(c.ma_hop_dong, c)
  })
  return selectedCompareIds.value
    .map(id => byMa.get(id))
    .filter((c): c is Contract => Boolean(c))
    .map(c => {
      const cust = getCustomerInfo(c.ma_khach_hang)
      const detStats = contractDetailStatsMap.value.get(c.ma_hop_dong)
      const giaMuaVal = c.gia_mua > 0 ? c.gia_mua : (detStats?.giaMuaSum || 0)
      const tongCpVal = c.tong_cp > 0 ? c.tong_cp : giaMuaVal
      const grossVal = c.chiet_khau_truoc_thue || c.chenh_lech_gia || 0
      const netVal = c.con_lai || c.tong_chiet_khau || 0
      const taxPct =
        c.thue_chenh_lech_pct > 0
          ? c.thue_chenh_lech_pct
          : c.thue_chenh_lech > 0 && grossVal > 0
            ? Math.round((c.thue_chenh_lech / grossVal) * 10000) / 100
            : grossVal === 0 && netVal === 0
              ? 25
              : 0

      return {
        rowKey: c.ma_hop_dong,
        ma_hop_dong: c.ma_hop_dong,
        so_hop_dong: c.so_hop_dong,
        is_completed: c.is_completed,
        is_official: isOfficialContract(c),
        isOriginal: isOriginalContract(c),
        versionLabel: getVersionNumberLabel(c),
        So_PO: c.so_po,
        content_of_contract_PO: c.content_of_contract_po,
        Ten_cong_ty: cust.tenCongTy || '',
        Ten_khach_hang: c.ten_khach_hang || cust.tenKH || '',
        Ten_nha_cung_cap: detStats?.suppliers || '',
        Tong_tien_truoc_thueVAT: c.tong_truoc_thue,
        Tong_thueVAT: c.tong_vat,
        Tong_tien_sau_thueVAT: c.tong_sau_thue,
        Tong_tien_truoc_thueVAT_khach: c.tong_truoc_thue_khach,
        Tong_thueVAT_khach: c.tong_vat_khach,
        Tong_tien_sau_thueVAT_khach: c.tong_sau_thue_khach,
        Tong_thanh_tien_chua_VAT_mua_hang: giaMuaVal,
        Tong_CP_don_hang: tongCpVal,
        chiet_khau_tong_truoc_thue: c.chiet_khau_truoc_thue,
        chenh_lech_gia: c.chenh_lech_gia,
        phan_tram_thue_chenh_lech_gia: taxPct,
        con_lai: c.con_lai,
        tong_chiet_khau: c.tong_chiet_khau,
        lam_tron_ti_suat: c.lam_tron_ti_suat,
        _contract: c
      }
    })
})

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

function handleGlobalDocumentClick(ev: MouseEvent) {
  const targetNode = ev.target as Node
  if (showSortMenu.value && sortRootRef.value && !sortRootRef.value.contains(targetNode)) {
    showSortMenu.value = false
  }
  if (
    showMobileDisplayPopover.value &&
    (!mobileDisplayPopoverRef.value || !mobileDisplayPopoverRef.value.contains(targetNode)) &&
    (!mobileDockRef.value || !mobileDockRef.value.contains(targetNode))
  ) {
    showMobileDisplayPopover.value = false
  }
}

function handleGlobalKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape') {
    if (showSortMenu.value) showSortMenu.value = false
    if (showDateModal.value) showDateModal.value = false
    if (showMobileDisplayPopover.value) showMobileDisplayPopover.value = false
  }
}

const isMobileDockHidden = computed(() =>
  Boolean(
    showDetailModal.value ||
      showCustomerModal.value ||
      showDateModal.value ||
      showCustomerInfoModal.value ||
      showCompareModal.value ||
      confirmDialog.visible ||
      asyncResultModal.show ||
      showSortMenu.value ||
      selectedCompareIds.value.length > 0
  )
)

watch(isMobileDockHidden, hidden => {
  if (hidden) showMobileDisplayPopover.value = false
})

onMounted(() => {
  uiTheme.value = loadSavedTheme()
  setupRealtimeSubscriptions()
  applyIncomingRouteQuery()
  document.addEventListener('click', handleGlobalDocumentClick)
  document.addEventListener('keydown', handleGlobalKeydown)
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    detailModalMq = window.matchMedia('(max-width: 1080px)')
    updateMobileModalViewport(detailModalMq)
    if (typeof detailModalMq.addEventListener === 'function') {
      detailModalMq.addEventListener('change', updateMobileModalViewport)
    } else if (typeof (detailModalMq as any).addListener === 'function') {
      ;(detailModalMq as any).addListener(updateMobileModalViewport)
    }

    mobileDockMq = window.matchMedia('(max-width: 768px)')
    updateMobileDockViewport(mobileDockMq)
    if (typeof mobileDockMq.addEventListener === 'function') {
      mobileDockMq.addEventListener('change', updateMobileDockViewport)
    } else if (typeof (mobileDockMq as any).addListener === 'function') {
      ;(mobileDockMq as any).addListener(updateMobileDockViewport)
    }
  }
})

onActivated(() => {
  uiTheme.value = loadSavedTheme()
  applyIncomingRouteQuery()
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalDocumentClick)
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (detailModalMq) {
    if (typeof detailModalMq.removeEventListener === 'function') {
      detailModalMq.removeEventListener('change', updateMobileModalViewport)
    } else if (typeof (detailModalMq as any).removeListener === 'function') {
      ;(detailModalMq as any).removeListener(updateMobileModalViewport)
    }
    detailModalMq = null
  }
  if (mobileDockMq) {
    if (typeof mobileDockMq.removeEventListener === 'function') {
      mobileDockMq.removeEventListener('change', updateMobileDockViewport)
    } else if (typeof (mobileDockMq as any).removeListener === 'function') {
      ;(mobileDockMq as any).removeListener(updateMobileDockViewport)
    }
    mobileDockMq = null
  }
  unsubscribers.forEach(fn => {
    try {
      fn()
    } catch {}
  })
  unsubscribers.length = 0
  if (cardObserver) cardObserver.disconnect()
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

  --indigo-text: #a5b4fc;
  --indigo-bg: rgba(99, 102, 241, 0.14);
  --indigo-border: rgba(129, 140, 248, 0.36);

  --bg-modal-head-rich: linear-gradient(135deg, #0d1d36 0%, #102a49 55%, #0c223b 100%);
  --bg-table-head-rich: #102442;
  --ink-table-head: #7dd3fc;

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

  --indigo-text: #4338ca;
  --indigo-bg: #eef2ff;
  --indigo-border: #c7d2fe;

  --bg-modal-head-rich: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 55%, #eff6ff 100%);
  --bg-table-head-rich: #dbeafe;
  --ink-table-head: #0369a1;

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

.qlbg-overlay {
  font-family: var(--font-sans);
  letter-spacing: normal;
}

.qlbg-overlay *,
.qlbg-overlay *::before,
.qlbg-overlay *::after {
  font-family: inherit;
}

.qlbg-overlay .qc-ver-tag,
.qlbg-overlay .cm-field strong.is-mono {
  font-family: var(--font-sans) !important;
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
   1. CONTROLS (Segmented Controls & Standard Buttons)
========================================================================== */
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.qlbg-kpi-card {
  width: 100%;
  margin: 0;
  text-align: left;
  padding: 15px 17px 14px;
  border-radius: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
  color: var(--ink-primary);
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  transition: all 0.18s ease;
}
.qlbg-kpi-card * {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

.qlbg-kpi-card:hover {
  transform: translateY(-1px);
}
.qlbg-kpi-card:not(.active):hover {
  background: var(--bg-card-hover);
}

/* Nền mặc định bình thường (trắng ở Light / nền card ở Dark) + giữ nguyên màu chữ theo loại; chỉ tô đậm nền khi .active */
.qlbg-kpi-card.is-sky .kpi-label {
  color: #bae6fd;
}
.qlbg-kpi-card.is-sky .kpi-val {
  color: #ffffff;
}
.qlbg-kpi-card.is-sky:not(.active):hover {
  border-color: #38bdf8;
}
.qlbg-kpi-card.is-sky.active {
  background: linear-gradient(155deg, #0369a1 0%, #075985 55%, #0c4a6e 100%);
  border-color: #7dd3fc;
  box-shadow: inset 3px 0 0 #38bdf8, 0 8px 22px -8px rgba(14, 165, 233, 0.45);
}

.qlbg-kpi-card.is-amber .kpi-label {
  color: #fde68a;
}
.qlbg-kpi-card.is-amber .kpi-val {
  color: #ffffff;
}
.qlbg-kpi-card.is-amber:not(.active):hover {
  border-color: #fbbf24;
}
.qlbg-kpi-card.is-amber.active {
  background: linear-gradient(155deg, #b45309 0%, #92400e 58%, #78350f 100%);
  border-color: #fde68a;
  box-shadow: inset 3px 0 0 #fbbf24, 0 8px 22px -8px rgba(245, 158, 11, 0.45);
}

.qlbg-kpi-card.is-emerald .kpi-label {
  color: #a7f3d0;
}
.qlbg-kpi-card.is-emerald .kpi-val {
  color: #ffffff;
}
.qlbg-kpi-card.is-emerald:not(.active):hover {
  border-color: #6ee7b7;
}
.qlbg-kpi-card.is-emerald.active {
  background: linear-gradient(155deg, #047857 0%, #065f46 58%, #064e3b 100%);
  border-color: #6ee7b7;
  box-shadow: inset 3px 0 0 #34d399, 0 8px 22px -8px rgba(16, 185, 129, 0.45);
}

.qlbg-kpi-card.active .kpi-icon {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

/* Light Blue Theme: card không active giữ nền trắng + màu chữ tương ứng; active mới tô đậm nền */
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-sky .kpi-label {
  color: #0369a1;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-sky .kpi-val {
  color: #0c4a6e;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-sky:not(.active):hover {
  border-color: #38bdf8;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-sky.active {
  background: linear-gradient(155deg, #0284c7 0%, #0369a1 58%, #075985 100%);
  border-color: #0284c7;
  box-shadow: inset 3px 0 0 #bae6fd, 0 8px 22px -8px rgba(2, 132, 199, 0.38);
}

.qlbg-page.theme-light-blue .qlbg-kpi-card.is-amber .kpi-label {
  color: #b45309;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-amber .kpi-val {
  color: #78350f;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-amber:not(.active):hover {
  border-color: #f59e0b;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-amber.active {
  background: linear-gradient(155deg, #d97706 0%, #b45309 58%, #92400e 100%);
  border-color: #b45309;
  box-shadow: inset 3px 0 0 #fde68a, 0 8px 22px -8px rgba(217, 119, 6, 0.38);
}

.qlbg-page.theme-light-blue .qlbg-kpi-card.is-emerald .kpi-label {
  color: #047857;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-emerald .kpi-val {
  color: #064e3b;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-emerald:not(.active):hover {
  border-color: #10b981;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.is-emerald.active {
  background: linear-gradient(155deg, #059669 0%, #047857 58%, #065f46 100%);
  border-color: #047857;
  box-shadow: inset 3px 0 0 #a7f3d0, 0 8px 22px -8px rgba(5, 150, 105, 0.38);
}

.qlbg-page.theme-light-blue .qlbg-kpi-card.active .kpi-label,
.qlbg-page.theme-light-blue .qlbg-kpi-card.active .kpi-val {
  color: #ffffff;
}
.qlbg-page.theme-light-blue .qlbg-kpi-card.active .kpi-icon {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.kpi-label {
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: -0.005em;
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

.kpi-val {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--ink-strong);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==========================================================================
   3. UNIFIED SMART FILTER BAR
========================================================================== */
.qlbg-filter-bar {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  margin-bottom: 14px;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qlbg-filter-row-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.qlbg-filter-left,
.qlbg-filter-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
  min-width: 0;
}

.qlbg-filter-bar .qlbg-picker-btn:not(.is-active),
.qlbg-filter-bar .qlbg-icon-btn,
.qlbg-filter-bar .qlbg-ghost-btn {
  background: var(--bg-card);
}

.qlbg-filter-right .qlbg-icon-btn {
  width: 36px;
  height: 36px;
}
.qlbg-filter-right .qlbg-ghost-btn,
.qlbg-filter-right .qlbg-btn-primary {
  height: 36px;
  padding: 0 13px;
}

.qlbg-search-box {
  flex: 1 1 260px;
  min-width: 190px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  background: var(--bg-card);
  border: 1.5px solid var(--sky-border);
  border-radius: 999px;
  box-shadow: 0 2px 10px -4px rgba(14, 165, 233, 0.18);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}

.qlbg-search-box:focus-within {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.16);
}

.qlbg-search-ico {
  color: var(--sky-text);
  opacity: 0.85;
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
  padding: 3px 9px;
  border-radius: 999px;
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
  max-width: 220px;
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
.qlbg-picker-btn:hover,
.qlbg-picker-btn.is-open {
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

.qlbg-chev-ico {
  opacity: 0.65;
  flex-shrink: 0;
  transition: transform 0.18s ease;
}
.qlbg-chev-ico.is-rotated {
  transform: rotate(180deg);
  opacity: 1;
  color: var(--sky-text);
}

/* Custom Template Adaptive Sort Picker (PC Popover ↔ Mobile Bottom Sheet) */
.qlbg-sort-root {
  position: relative;
  display: inline-flex;
  min-width: 0;
}
.qlbg-sort-trigger {
  width: 100%;
  max-width: 240px;
}
.qlbg-sort-backdrop {
  display: none;
}
.qlbg-pop-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 270px;
  z-index: 80;
  border-radius: 13px;
  background: var(--bg-modal);
  border: 1px solid var(--sky-border);
  box-shadow: var(--shadow-modal);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.qlbg-pop-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  background: var(--bg-modal-head-rich);
  border-bottom: 1px solid var(--sky-border);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-table-head);
}
.qlbg-pop-close {
  display: none;
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border-radius: 6px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-secondary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
.qlbg-pop-list {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.qlbg-pop-opt {
  width: 100%;
  margin: 0;
  padding: 8px 10px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-primary);
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition: all 0.14s ease;
}
.qlbg-pop-opt:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-subtle);
}
.qlbg-pop-opt.active {
  background: var(--sky-bg);
  border-color: var(--sky-border);
}
.qlbg-pop-opt-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.qlbg-pop-opt-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.qlbg-pop-opt-title-row strong {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-strong);
}
.qlbg-pop-opt.active .qlbg-pop-opt-title-row strong {
  color: var(--sky-text);
}
.qlbg-pop-tag {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  background: var(--slate-bg);
  color: var(--ink-secondary);
  border: 1px solid var(--slate-border);
}
.qlbg-pop-opt.active .qlbg-pop-tag {
  background: var(--bg-card);
  color: var(--sky-text);
  border-color: var(--sky-border);
}
.qlbg-pop-opt-desc {
  font-size: 11px;
  color: var(--ink-muted);
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
  --gh-ink: #fffbeb;
  --gh-divider: rgba(251, 191, 36, 0.32);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 16px;
  background: linear-gradient(90deg, rgba(180, 83, 9, 0.56) 0%, rgba(146, 64, 14, 0.48) 58%, rgba(120, 53, 15, 0.42) 100%);
  border-bottom: 1px solid rgba(245, 158, 11, 0.36);
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;
}
.qlbg-group-header:hover {
  background: linear-gradient(90deg, rgba(217, 119, 6, 0.62) 0%, rgba(180, 83, 9, 0.54) 58%, rgba(146, 64, 14, 0.48) 100%);
}
.qlbg-page.theme-light-blue .qlbg-group-header {
  --gh-ink: #0f172a;
  --gh-divider: rgba(217, 119, 6, 0.28);
  background: linear-gradient(90deg, #ffedd5 0%, #fed7aa 65%, #ffedd5 100%);
  border-bottom: 1px solid #f59e0b;
}
.qlbg-page.theme-light-blue .qlbg-group-header:hover {
  background: linear-gradient(90deg, #fed7aa 0%, #fdba74 65%, #fed7aa 100%);
}
.qlbg-group-header .gh-folder-ico.is-amber {
  background: rgba(255, 255, 255, 0.14);
  color: #fde68a;
  border-color: rgba(253, 224, 71, 0.4);
}
.qlbg-page.theme-light-blue .qlbg-group-header .gh-folder-ico.is-amber {
  background: rgba(255, 255, 255, 0.72);
  color: #b45309;
  border-color: #f59e0b;
}
.qlbg-group-block:not(.is-group-official) .qlbg-group-header .gh-ver-count,
.qlbg-group-block:not(.is-group-official) .qlbg-group-header .gh-toggle-btn {
  background: rgba(255, 255, 255, 0.14);
  color: #fffbeb;
  border-color: rgba(253, 224, 71, 0.35);
}
.qlbg-group-block:not(.is-group-official) .qlbg-group-header .gh-chevron {
  color: #fffbeb;
}
.qlbg-group-block:not(.is-group-official) .qlbg-group-header .gh-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(253, 224, 71, 0.6);
  color: #ffffff;
}
.qlbg-page.theme-light-blue .qlbg-group-block:not(.is-group-official) .qlbg-group-header .gh-ver-count,
.qlbg-page.theme-light-blue .qlbg-group-block:not(.is-group-official) .qlbg-group-header .gh-toggle-btn {
  background: rgba(255, 255, 255, 0.72);
  color: #9a3412;
  border-color: rgba(217, 119, 6, 0.38);
}
.qlbg-page.theme-light-blue .qlbg-group-block:not(.is-group-official) .qlbg-group-header .gh-chevron {
  color: #9a3412;
}

.qlbg-group-block.is-group-official .qlbg-group-header {
  --gh-ink: #ffffff;
  --gh-divider: rgba(167, 243, 208, 0.32);
  background: linear-gradient(90deg, #065f46 0%, #064e3b 55%, #053e2f 100%);
  border-bottom: 1px solid rgba(52, 211, 153, 0.42);
}
.qlbg-group-block.is-group-official .qlbg-group-header:hover {
  background: linear-gradient(90deg, #047857 0%, #065f46 55%, #064e3b 100%);
}
.qlbg-page.theme-light-blue .qlbg-group-block.is-group-official .qlbg-group-header {
  --gh-ink: #ffffff;
  --gh-divider: rgba(255, 255, 255, 0.32);
  background: linear-gradient(90deg, #059669 0%, #047857 58%, #065f46 100%);
  border-bottom: 1px solid #047857;
}
.qlbg-page.theme-light-blue .qlbg-group-block.is-group-official .qlbg-group-header:hover {
  background: linear-gradient(90deg, #10b981 0%, #059669 58%, #047857 100%);
}
.qlbg-group-block.is-group-official .qlbg-group-header .gh-folder-ico.is-emerald {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.34);
}
.qlbg-group-block.is-group-official .qlbg-group-header .gh-ver-count,
.qlbg-group-block.is-group-official .qlbg-group-header .gh-toggle-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}
.qlbg-group-block.is-group-official .qlbg-group-header .gh-chevron {
  color: #ffffff;
}
.qlbg-group-block.is-group-official .qlbg-group-header .gh-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.26);
  border-color: rgba(255, 255, 255, 0.55);
  color: #ffffff;
}
.qlbg-group-block.is-group-official .qlbg-group-header .sr-md-cc-check:not(.selected) {
  background: rgba(2, 44, 34, 0.55);
  border-color: rgba(255, 255, 255, 0.58);
}

.gh-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  flex: 1 1 auto;
}
.gh-left > .sr-md-cc-check {
  margin-top: 3px;
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

.gh-info-grid {
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(220px, 1.05fr) minmax(240px, 1fr);
  gap: 16px;
  align-items: start;
}

.gh-col-cust,
.gh-col-po {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.gh-col-po {
  border-left: 1px solid var(--gh-divider);
  padding-left: 16px;
}

.gh-line {
  min-width: 0;
  font-size: 12.5px;
  line-height: 1.4;
  font-weight: 600;
  color: var(--gh-ink);
  word-break: break-word;
}

.gh-line-strong {
  font-weight: 700;
}

.gh-line-time {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

@media (max-width: 900px) {
  .gh-info-grid {
    grid-template-columns: 1fr;
    gap: 2px;
  }
  .gh-col-po {
    border-left: none;
    padding-left: 0;
  }
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

.gh-toggle-btn {
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border-radius: 8px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.gh-toggle-btn:hover {
  border-color: var(--sky-border);
  color: var(--sky-text);
  background: var(--sky-bg);
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
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease, opacity 0.16s ease;
}

.qlbg-quote-card:hover {
  transform: translateY(-2px);
  background: var(--bg-card-hover);
  border-color: var(--border-strong);
}

.qlbg-quote-card.is-official,
.qlbg-page.theme-light-blue .qlbg-quote-card.is-official {
  --ink-strong: #ffffff;
  --ink-primary: #f0fdf4;
  --ink-secondary: #d1fae5;
  --ink-muted: #a7f3d0;
  --ink-faint: #6ee7b7;
  --bg-well: rgba(2, 24, 18, 0.66);
  --bg-input: rgba(2, 30, 22, 0.56);
  --border-subtle: rgba(110, 231, 183, 0.28);
  --border-control: rgba(110, 231, 183, 0.42);
  --sky-text: #7dd3fc;
  --sky-bg: rgba(14, 165, 233, 0.24);
  --sky-border: rgba(125, 211, 252, 0.48);
  --emerald-text: #6ee7b7;
  --emerald-bg: rgba(16, 185, 129, 0.34);
  --emerald-border: rgba(110, 231, 183, 0.55);
  --amber-text: #fde68a;
  --rose-text: #fda4af;
  --slate-text: #ecfdf5;
  --slate-bg: rgba(255, 255, 255, 0.15);
  --slate-border: rgba(255, 255, 255, 0.3);

  background: linear-gradient(160deg, #065f46 0%, #064e3b 52%, #05382b 100%);
  border-color: rgba(52, 211, 153, 0.65);
  border-top: 3px solid #34d399;
}
.qlbg-quote-card.is-official:hover {
  background: linear-gradient(160deg, #047857 0%, #065f46 52%, #064e3b 100%);
  border-color: #6ee7b7;
}
.qlbg-page.theme-light-blue .qlbg-quote-card.is-official {
  background: linear-gradient(160deg, #059669 0%, #047857 54%, #065f46 100%);
  border-color: #10b981;
  border-top: 3px solid #6ee7b7;
}
.qlbg-page.theme-light-blue .qlbg-quote-card.is-official:hover {
  background: linear-gradient(160deg, #10b981 0%, #059669 54%, #047857 100%);
  border-color: #a7f3d0;
}
.qlbg-quote-card.is-official .qc-status-badge.is-emerald {
  background: rgba(16, 185, 129, 0.42);
  color: #ffffff;
  border-color: #a7f3d0;
}
.qlbg-quote-card.is-official .qc-fin-box {
  background: rgba(2, 24, 18, 0.68);
  border-color: rgba(110, 231, 183, 0.32);
}
.qlbg-quote-card.is-official .qc-btn:not(.is-sr-link):not(.is-chot-deal) {
  background: rgba(2, 32, 24, 0.58);
  color: #ecfdf5;
  border-color: rgba(110, 231, 183, 0.38);
}
.qlbg-quote-card.is-official .qc-btn:not(.is-sr-link):not(.is-chot-deal):hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.35);
  border-color: #a7f3d0;
  color: #ffffff;
}
.qlbg-quote-card.is-official .qc-btn.is-sr-link {
  background: rgba(2, 132, 199, 0.42);
  color: #e0f2fe;
  border-color: #7dd3fc;
}
.qlbg-quote-card.is-official .qc-btn.is-sr-link:hover {
  background: #0284c7;
  color: #ffffff;
}
.qlbg-quote-card.is-official .sr-md-cc-check:not(.selected) {
  background: rgba(2, 44, 34, 0.55);
  border-color: rgba(255, 255, 255, 0.58);
}

.qlbg-quote-card.is-draft {
  border-top: 2.5px solid rgba(245, 158, 11, 0.7);
}
.qlbg-group-block.is-group-official .qlbg-quote-card.is-draft {
  opacity: 0.65;
  border-top-color: rgba(245, 158, 11, 0.38);
}
.qlbg-group-block.is-group-official .qlbg-quote-card.is-draft:hover,
.qlbg-group-block.is-group-official .qlbg-quote-card.is-draft.is-selected-card {
  opacity: 0.96;
  border-top-color: rgba(245, 158, 11, 0.72);
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
  gap: 7px;
  min-width: 0;
  flex: 1 1 auto;
}

.sr-md-cc-check {
  width: 17px;
  height: 17px;
  margin: 0;
  border-radius: 4px;
  border: 1.5px solid rgba(148, 163, 184, 0.52);
  background: rgba(15, 23, 42, 0.72);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.14s ease;
}
.sr-md-cc-check:hover {
  border-color: #38bdf8;
}
.sr-md-cc-check.selected {
  background: #0284c7;
  border-color: #38bdf8;
}
.sr-md-cc-check.is-partial {
  border-color: #38bdf8;
  background: rgba(2, 132, 199, 0.24);
}
.qlbg-chk-dash {
  width: 8px;
  height: 2px;
  border-radius: 999px;
  background: #38bdf8;
}

.qlbg-page.theme-light-blue .sr-md-cc-check {
  background: #ffffff;
  border-color: #94a3b8;
}
.qlbg-page.theme-light-blue .sr-md-cc-check.selected {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}
.qlbg-page.theme-light-blue .sr-md-cc-check.is-partial {
  border-color: #059669;
  background: #d1fae5;
}
.qlbg-page.theme-light-blue .qlbg-chk-dash {
  background: #059669;
}

.qlbg-quote-card.is-selected-card {
  border-color: #38bdf8 !important;
  box-shadow: inset 3px 0 0 #38bdf8, 0 8px 20px -6px rgba(2, 132, 199, 0.35) !important;
}
.qlbg-page.theme-light-blue .qlbg-quote-card.is-selected-card {
  border-color: #059669 !important;
  box-shadow: inset 4px 0 0 #059669, 0 8px 20px -6px rgba(5, 150, 105, 0.22) !important;
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

.qc-origin-tag {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
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

/* File đính kèm hiển thị trực tiếp dưới nội dung Card (không khung bọc) */
.qc-files-block {
  display: flex;
  flex-direction: column;
  padding: 2px 0;
}
.qc-files-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.qc-file-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  padding: 1px 0;
}
.qc-file-chip {
  flex: 1 1 auto;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  min-width: 0;
  padding: 0;
  background: transparent;
  border: none;
  text-decoration: none;
}
.qc-file-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.qc-file-chip:hover .qc-file-name {
  color: var(--sky-text);
  text-decoration: underline;
}
.qc-file-chip.is-khach:hover .qc-file-name {
  color: var(--emerald-text);
}
.qc-file-tag {
  flex-shrink: 0;
  margin-top: 1px;
  padding: 0.5px 4.5px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 800;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
}
.qc-file-chip.is-khach .qc-file-tag {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border-color: var(--emerald-border);
}
.qc-file-name {
  min-width: 0;
  flex: 1 1 auto;
  font-size: 10.5px;
  font-weight: 500;
  line-height: 1.38;
  color: var(--ink-secondary);
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  transition: color 0.14s ease;
}
.qc-file-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.qc-file-act-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.14s ease;
}
.qc-file-act-btn.is-view {
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
}
.qc-file-act-btn.is-view:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}
.qc-file-act-btn.is-dl {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
}
.qc-file-act-btn.is-dl:hover {
  background: #059669;
  color: #ffffff;
  border-color: #059669;
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
  background: var(--bg-modal-head-rich);
  border-bottom: 1.5px solid var(--sky-border);
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
  font-family: var(--font-sans);
  letter-spacing: -0.01em;
  line-height: 1.3;
  color: var(--ink-strong);
}

.dm-sub-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 3px;
  font-size: 12px;
  color: var(--ink-secondary);
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
  background: var(--bg-table-head-rich);
  color: var(--ink-table-head);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: left;
  padding: 10px 10px;
  border-bottom: 1.5px solid var(--sky-border);
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
  border-top: 1px solid var(--sky-border);
  border-bottom: 1px solid var(--sky-border);
}
.dm-group-row td:first-child {
  box-shadow: inset 3px 0 0 var(--sky-text);
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
  font-family: var(--font-sans);
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
  background: var(--bg-modal-head-rich);
  border-bottom: 1px solid var(--sky-border);
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
.cmp-sr-source-pill:hover:not(.active) {
  color: var(--ink-primary);
}
.cmp-sr-source-pill.active {
  background: var(--sky-bg);
  color: var(--sky-text);
  box-shadow: inset 0 0 0 1px var(--sky-border), 0 1px 2px rgba(2, 6, 23, 0.16);
}
.cmp-sr-source-pill.is-khach.active {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  box-shadow: inset 0 0 0 1px var(--emerald-border), 0 1px 2px rgba(2, 6, 23, 0.16);
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
  overflow: hidden;
}
.cmp-sr-po1-block.is-tone-sky {
  border-color: var(--sky-border);
}
.cmp-sr-po1-block.is-tone-emerald {
  border-color: var(--emerald-border);
}
.cmp-sr-po1-block.is-tone-amber {
  border-color: var(--amber-border);
}

.cmp-sr-po1-block > .cmp-sr-po1-block-title,
.cmp-sr-po1-block-head {
  margin: -8px -10px 2px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border-subtle);
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
.cmp-sr-po1-block.is-tone-sky > .cmp-sr-po1-block-title,
.cmp-sr-po1-block.is-tone-sky .cmp-sr-po1-block-head {
  background: var(--sky-bg);
  border-bottom-color: var(--sky-border);
}
.cmp-sr-po1-block.is-tone-sky .cmp-sr-po1-block-title {
  color: var(--sky-text);
}
.cmp-sr-po1-block.is-tone-emerald > .cmp-sr-po1-block-title,
.cmp-sr-po1-block.is-tone-emerald .cmp-sr-po1-block-head {
  background: var(--emerald-bg);
  border-bottom-color: var(--emerald-border);
}
.cmp-sr-po1-block.is-tone-emerald .cmp-sr-po1-block-title {
  color: var(--emerald-text);
}
.cmp-sr-po1-block.is-tone-amber > .cmp-sr-po1-block-title,
.cmp-sr-po1-block.is-tone-amber .cmp-sr-po1-block-head {
  background: var(--amber-bg);
  border-bottom-color: var(--amber-border);
}
.cmp-sr-po1-block.is-tone-amber .cmp-sr-po1-block-title {
  color: var(--amber-text);
}

.cmp-sr-round-toggle-btn {
  width: auto;
  margin: 0;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid var(--border-control);
  background: var(--bg-card);
  color: var(--ink-secondary);
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

.cmp-sr-pct-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 5px;
  border: 1px solid var(--amber-border);
  background: var(--amber-bg);
  color: var(--amber-text);
  font-size: 10.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
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
  background: var(--bg-table-head-rich);
  border-bottom: 1px solid var(--sky-border);
}

.dock-tab-btn {
  width: 100%;
  margin: 0;
  padding: 5px 4px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-secondary);
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
  color: var(--ink-strong);
  background: var(--sky-bg);
}
.dock-tab-btn.active {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-color: var(--sky-border);
  font-weight: 800;
}
.qlbg-overlay.theme-light-blue .dock-tab-btn.active {
  background: #ffffff;
  color: #0284c7;
  border-color: #60a5fa;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.16);
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
  padding: 4px 8px;
  border-radius: 7px;
  background: var(--sky-bg);
  border: 1px solid var(--sky-border);
}
.customer-dock-title {
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--sky-text);
}
.btn-customer-detail-pill {
  width: auto;
  margin: 0;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--sky-border);
  background: var(--bg-card);
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
.cd-readonly-val {
  min-height: 24px;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  color: var(--ink-strong);
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.35;
  word-break: break-word;
}
.cd-readonly-val.is-empty {
  color: var(--ink-faint);
  font-weight: 500;
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
.fin-pct-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 5px;
  border: 1px solid var(--amber-border);
  background: var(--amber-bg);
  color: var(--amber-text);
  font-size: 10.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
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

/* Dual File Slots (không đóng khung, SVG icon + tên file xuống dòng + Xem / Tải / Đính kèm) */
.dm-file-slot {
  padding: 6px 0;
  border-radius: 0;
  background: transparent;
  border: none;
  border-top: 1px dashed var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dm-file-slot:first-of-type {
  border-top: none;
  padding-top: 2px;
}
.slot-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
}
.slot-head.is-hd {
  background: var(--sky-bg);
  border-left: 3px solid var(--sky-text);
}
.slot-head.is-khach {
  background: var(--emerald-bg);
  border-left: 3px solid var(--emerald-text);
}
.slot-label {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--ink-secondary);
}
.slot-head.is-hd .slot-label {
  color: var(--sky-text);
}
.slot-head.is-khach .slot-label {
  color: var(--emerald-text);
}
.slot-upload-btn {
  width: auto;
  margin: 0;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid var(--sky-border);
  background: var(--bg-card);
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
.slot-head.is-khach .slot-upload-btn {
  border-color: var(--emerald-border);
  color: var(--emerald-text);
}
.slot-head.is-khach .slot-upload-btn:hover:not(:disabled) {
  background: #059669;
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
  gap: 7px;
}
.slot-file-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 0;
  background: transparent;
  border: none;
}
.slot-file-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  text-decoration: none;
}
.slot-file-name {
  min-width: 0;
  flex: 1 1 auto;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.38;
  color: var(--ink-primary);
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  transition: color 0.14s ease;
}
.slot-file-main.is-hd:hover .slot-file-name {
  color: var(--sky-text);
  text-decoration: underline;
}
.slot-file-main.is-khach:hover .slot-file-name {
  color: var(--emerald-text);
  text-decoration: underline;
}
.slot-file-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
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

.dm-mob-header-icon {
  display: none;
}
.dm-head-titles {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dm-lbl-mob,
.is-mob-inline-close {
  display: none !important;
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
.dm-foot-sec-row {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
.dm-foot-sec-row .dm-btn-delete {
  margin-right: auto;
}
.dm-foot-cta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ==========================================================================
   8. CUSTOMER PICKER MODAL, PROFILE MODAL, CONFIRM & SMART TOAST
========================================================================== */
.qlbg-cust-overlay {
  z-index: 10025;
  padding: 0 !important;
}
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
.qlbg-cust-modal {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  max-height: 100vh !important;
  border-radius: 0 !important;
  border: none !important;
}
.qlbg-cust-modal .mob-sheet-grabber {
  display: none !important;
}

.pm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 16px;
  background: var(--bg-modal-head-rich);
  border-bottom: 1.5px solid var(--sky-border);
}
.dm-date-modal-body {
  padding: 14px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dm-date-sec-lbl {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--sky-text);
}
.dm-preset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.dm-preset-btn {
  width: 100%;
  margin: 0;
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-well);
  color: var(--ink-primary);
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: all 0.14s ease;
}
.dm-preset-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--sky-border);
}
.dm-preset-btn.active {
  background: var(--sky-bg);
  border-color: var(--sky-border);
}
.dm-preset-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.dm-preset-top strong {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-strong);
}
.dm-preset-btn.active .dm-preset-top strong {
  color: var(--sky-text);
}
.dm-preset-desc {
  font-size: 11px;
  color: var(--ink-muted);
}
.dm-custom-range-box {
  padding: 11px 12px;
  border-radius: 11px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.dm-custom-range-box.is-highlighted {
  border-color: var(--sky-border);
  background: var(--sky-bg);
}
.dm-custom-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dm-date-field {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dm-date-field span {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.qlbg-date-input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border-radius: 9px;
  border: 1px solid var(--border-control);
  background: var(--bg-input);
  color: var(--ink-strong);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color-scheme: dark;
  outline: none;
}
.theme-light-blue .qlbg-date-input {
  color-scheme: light;
}
.qlbg-date-input:focus {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.14);
}
.dm-date-arrow {
  padding-top: 16px;
  color: var(--ink-muted);
  font-weight: 700;
  flex-shrink: 0;
}
.pm-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 16px;
  background: var(--bg-modal-head);
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
}
.pm-foot-right {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* Customer Profile Modal (Full 2-Column Bento Layout like CustomerFirebase) */
.cm-upd-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: var(--slate-bg);
  color: var(--ink-secondary);
  border: 1px solid var(--slate-border);
}
.cm-body {
  flex: 1 1 auto;
  min-height: 0;
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
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
}
.cm-hero-info {
  min-width: 0;
  flex: 1 1 auto;
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
.cm-hero-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.cm-hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: var(--bg-card);
  color: var(--ink-secondary);
  border: 1px solid var(--border-subtle);
}
.cm-hero-chip.is-sky {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-color: var(--sky-border);
}
.cm-hero-chip.is-emerald {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border-color: var(--emerald-border);
}
.cm-2col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
}
.cm-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.cm-section-box {
  padding: 13px 14px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cm-section-title {
  margin: -13px -14px 2px;
  padding: 9px 14px;
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--slate-bg);
  color: var(--ink-secondary);
  border-bottom: 1px solid var(--border-subtle);
}
.cm-section-title.is-emerald {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border-bottom-color: var(--emerald-border);
}
.cm-section-title.is-sky {
  background: var(--sky-bg);
  color: var(--sky-text);
  border-bottom-color: var(--sky-border);
}
.cm-section-title.is-amber {
  background: var(--amber-bg);
  color: var(--amber-text);
  border-bottom-color: var(--amber-border);
}
.cm-section-title.is-indigo {
  background: var(--indigo-bg);
  color: var(--indigo-text);
  border-bottom-color: var(--indigo-border);
}
.cm-sub-divider {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--sky-text);
  padding: 8px 0 2px;
  margin-top: 2px;
  border-top: 1px dashed var(--sky-border);
}
.cm-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.cm-field {
  padding: 8px 10px;
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
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.cm-field strong {
  font-size: 12.5px;
  color: var(--ink-strong);
  word-break: break-word;
}
.cm-field strong.is-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.cm-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.cm-tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  background: var(--sky-bg);
  color: var(--sky-text);
  border: 1px solid var(--sky-border);
}
.cm-empty-note {
  font-size: 12px;
  font-style: italic;
  color: var(--ink-faint);
}
.cm-debt-box {
  border-color: var(--sky-border);
}
.cm-debt-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.cm-debt-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.cm-debt-lbl {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.cm-debt-val-lg {
  font-size: 16px;
  font-weight: 900;
  line-height: 1.15;
}
.cm-debt-val {
  font-size: 13.5px;
  font-weight: 800;
  line-height: 1.2;
}
.cm-debt-val small {
  font-size: 11px;
  font-weight: 700;
}
.cm-debt-val-lg.is-rose,
.cm-debt-val.is-rose {
  color: var(--rose-text);
}
.cm-debt-val-lg.is-emerald,
.cm-debt-val.is-emerald {
  color: var(--emerald-text);
}
.cm-debt-val.is-sky {
  color: var(--sky-text);
}
.cm-debt-bar-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
}
.cm-debt-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #38bdf8, #10b981);
  transition: width 0.3s ease;
}
.cm-debt-bar-fill.is-paid {
  background: #10b981;
}
.cm-foot {
  padding: 12px 16px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-modal-head);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
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
   9. RESPONSIVE — TABLET & MOBILE MODAL (SYNCED SALEREPORT PO OPTION A)
========================================================================== */
@media (max-width: 1080px) {
  .qlbg-kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  /* 1. Fullscreen 100dvh Modal Shell + Khóa trượt ngang + Né tai thỏ / Dynamic Island */
  .qlbg-overlay.qlbg-detail-overlay {
    padding: 0 !important;
    align-items: stretch !important;
    overflow-x: hidden !important;
    max-width: 100vw !important;
    touch-action: pan-y;
  }

  .qlbg-detail-modal {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border: none !important;
    overflow-x: hidden !important;
    overscroll-behavior-x: none !important;
    touch-action: pan-y;
  }

  .qlbg-detail-modal .dm-head,
  .qlbg-detail-modal .dm-mobile-tabs,
  .qlbg-detail-modal .dm-body,
  .qlbg-detail-modal .dm-main-col,
  .qlbg-detail-modal .dm-side-col,
  .qlbg-detail-modal .dm-mob-overview-card,
  .qlbg-detail-modal .dm-mob-tabs-chrome,
  .qlbg-detail-modal .dm-foot {
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }

  /* 2. Gradient Full-Bleed Header chuẩn .sr-po-modal-header */
  .dm-dt-only-ctrl {
    display: none !important;
  }

  .dm-mob-header-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.34);
    color: #ffffff;
    flex-shrink: 0;
  }

  .dm-head {
    padding: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) 14px 12px !important;
    background: linear-gradient(90deg, #059669 0%, #047857 55%, #0f766e 100%) !important;
    border-bottom: 1px solid rgba(52, 211, 153, 0.34) !important;
    border-radius: 0 !important;
    color: #ffffff !important;
    flex-wrap: nowrap;
    align-items: center;
    gap: 10px;
  }

  .qlbg-overlay.theme-light-blue .dm-head {
    background: linear-gradient(90deg, #0284c7 0%, #2563eb 55%, #1d4ed8 100%) !important;
    border-bottom: 1px solid #7dd3fc !important;
  }

  .dm-head-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 auto;
    min-width: 0;
  }

  .dm-title-row {
    gap: 6px;
  }

  .dm-code,
  .dm-code.dm-mob-company-title {
    font-size: 14px;
    font-weight: 800;
    font-family: var(--font-sans);
    letter-spacing: -0.01em;
    line-height: 1.28;
    color: #ffffff !important;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  .dm-mob-head-pills {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 4px;
  }

  .dm-head .qc-status-badge,
  .dm-head .qc-ver-tag {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.36) !important;
    color: #ffffff !important;
    font-family: var(--font-sans) !important;
  }

  .dm-head .status-dot {
    background: #ffffff !important;
  }

  .dm-head-controls {
    flex-wrap: nowrap;
    gap: 7px;
    flex-shrink: 0;
  }

  .dm-head .qlbg-excel-btn {
    height: 34px;
    padding: 0 10px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.16) !important;
    border: 1px solid rgba(255, 255, 255, 0.36) !important;
    color: #ffffff !important;
    font-size: 12px;
    font-weight: 800;
  }

  .dm-head .qlbg-excel-btn:hover:not(:disabled) {
    background: #ffffff !important;
    color: #059669 !important;
  }

  .qlbg-overlay.theme-light-blue .dm-head .qlbg-excel-btn:hover:not(:disabled) {
    color: #0284c7 !important;
  }

  .dm-head .dm-close-btn {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    background: rgba(15, 23, 42, 0.28) !important;
    color: #ffffff !important;
  }

  .dm-head .dm-close-btn:hover {
    background: rgba(239, 68, 68, 0.55) !important;
    border-color: #fecaca !important;
  }

  /* 3. Mobile Pane Switcher chuẩn .sr-po-mobile-switch */
  .dm-mobile-tabs {
    display: flex;
    padding: 8px 12px;
    gap: 8px;
    background: rgba(9, 20, 16, 0.96);
    border-bottom: 1px solid rgba(52, 211, 153, 0.22);
    flex-shrink: 0;
  }

  .qlbg-overlay.theme-light-blue .dm-mobile-tabs {
    background: #f8fafc;
    border-bottom-color: #bae6fd;
  }

  .dm-mob-tab {
    flex: 1 1 0%;
    min-width: 0;
    margin: 0;
    height: 36px;
    padding: 0 8px;
    border-radius: 9px;
    border: 1px solid rgba(52, 211, 153, 0.24);
    background: rgba(15, 29, 25, 0.78);
    color: #94a3b8;
    font-size: 11.5px;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dm-mob-tab.active {
    background: rgba(16, 185, 129, 0.22);
    border-color: #34d399;
    color: #ffffff;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tab {
    background: #ffffff;
    border-color: #cbd5e1;
    color: #475569;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tab.active {
    background: #e0f2fe;
    color: #0284c7;
    border-color: #0284c7;
    box-shadow: 0 2px 6px rgba(2, 132, 199, 0.14);
  }

  .mob-hidden {
    display: none !important;
  }

  /* 4. Option A Body Workspace (Cuộn 1 mạch, không lồng scroll) */
  .dm-body {
    display: flex;
    flex-direction: column;
    grid-template-columns: none;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding: 10px 12px 16px;
    gap: 0;
    background: rgba(8, 17, 15, 0.96);
  }

  .qlbg-overlay.theme-light-blue .dm-body {
    background: #eef4fb;
  }

  /* Overview Card chuẩn .sr-po-overview-card */
  .dm-mob-overview-card {
    position: relative;
    background: linear-gradient(165deg, rgba(15, 29, 25, 0.94) 0%, rgba(10, 20, 17, 0.98) 100%);
    border: 1px solid rgba(52, 211, 153, 0.26);
    border-radius: 14px;
    padding: 11px 12px 12px;
    margin-bottom: 10px;
    box-shadow: 0 8px 22px -10px rgba(0, 0, 0, 0.5);
    flex-shrink: 0;
    overflow: hidden;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-overview-card {
    background: #ffffff;
    border-color: #bae6fd;
    box-shadow: 0 8px 22px -8px rgba(2, 132, 199, 0.1);
  }

  .dm-mob-overview-accent {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #10b981, #34d399, #38bdf8);
  }

  .qlbg-overlay.theme-light-blue .dm-mob-overview-accent {
    background: linear-gradient(90deg, #0284c7, #2563eb, #059669);
  }

  .dm-mob-overview-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 7px;
    margin-bottom: 8px;
    border-bottom: 1px dashed rgba(52, 211, 153, 0.24);
  }

  .qlbg-overlay.theme-light-blue .dm-mob-overview-head {
    border-bottom-color: #dbeafe;
  }

  .dm-mob-overview-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #34d399;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-overview-title {
    color: #0284c7;
  }

  .dm-mob-overview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px 9px;
  }

  .dm-mob-ov-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .dm-mob-ov-field.is-full {
    grid-column: 1 / -1;
  }

  .dm-mob-ov-lbl {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--ink-muted);
  }

  .dm-mob-ov-val {
    min-height: 28px;
    padding: 5px 8px;
    border-radius: 7px;
    background: var(--bg-well);
    border: 1px solid var(--border-subtle);
    color: var(--ink-strong);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.35;
    word-break: break-word;
  }

  .dm-mob-ov-val.is-empty {
    color: var(--ink-faint);
    font-weight: 500;
  }

  /* Card 2 Chrome (.sr-po-tabs-card parity: Price Mode Bar + Utility Strip + Inner Sub-tabs) */
  .dm-mob-tabs-chrome {
    border-radius: 14px 14px 0 0;
    border: 1px solid rgba(56, 189, 248, 0.35);
    border-bottom: none;
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(165deg, rgba(12, 31, 52, 0.94) 0%, rgba(9, 20, 36, 0.97) 100%);
  }

  .dm-mob-tabs-chrome.is-mode-khach {
    border-color: rgba(52, 211, 153, 0.36);
    background: linear-gradient(165deg, rgba(10, 35, 28, 0.94) 0%, rgba(8, 24, 19, 0.97) 100%);
  }

  .dm-mob-tabs-chrome.is-mode-noibo {
    border-color: rgba(245, 158, 11, 0.36);
    background: linear-gradient(165deg, rgba(35, 24, 10, 0.94) 0%, rgba(22, 16, 8, 0.97) 100%);
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tabs-chrome {
    background: #ffffff;
    border-color: #93c5fd;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tabs-chrome.is-mode-khach {
    border-color: #6ee7b7;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tabs-chrome.is-mode-noibo {
    border-color: #fcd34d;
  }

  .dm-mob-price-bar {
    padding: 8px 10px;
    background: rgba(15, 23, 42, 0.55);
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tabs-chrome.is-mode-hd .dm-mob-price-bar {
    background: linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 100%);
    border-bottom-color: #bae6fd;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tabs-chrome.is-mode-khach .dm-mob-price-bar {
    background: linear-gradient(180deg, #d1fae5 0%, #ecfdf5 100%);
    border-bottom-color: #a7f3d0;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tabs-chrome.is-mode-noibo .dm-mob-price-bar {
    background: linear-gradient(180deg, #fef3c7 0%, #fffbeb 100%);
    border-bottom-color: #fde68a;
  }

  .dm-mob-price-seg {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
    padding: 3px;
    border-radius: 9px;
    background: rgba(9, 14, 26, 0.78);
    border: 1px solid rgba(148, 163, 184, 0.25);
  }

  .qlbg-overlay.theme-light-blue .dm-mob-price-seg {
    background: #ffffff;
    border-color: #cbd5e1;
  }

  .dm-mob-price-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 100%;
    height: 30px;
    margin: 0;
    padding: 0 6px;
    border-radius: 6.5px;
    border: 1px solid transparent;
    background: transparent;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.16s ease;
  }

  .dm-mob-price-btn.is-hd:not(.active) {
    color: #7dd3fc;
  }
  .dm-mob-price-btn.is-khach:not(.active) {
    color: #6ee7b7;
  }
  .dm-mob-price-btn.is-noibo:not(.active) {
    color: #fcd34d;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-price-btn.is-hd:not(.active) {
    color: #0369a1;
  }
  .qlbg-overlay.theme-light-blue .dm-mob-price-btn.is-khach:not(.active) {
    color: #047857;
  }
  .qlbg-overlay.theme-light-blue .dm-mob-price-btn.is-noibo:not(.active) {
    color: #b45309;
  }

  .dm-mob-price-btn.is-hd.active {
    background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
    border-color: rgba(125, 211, 252, 0.55);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(2, 132, 199, 0.34);
  }
  .dm-mob-price-btn.is-khach.active {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    border-color: rgba(110, 231, 183, 0.55);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.34);
  }
  .dm-mob-price-btn.is-noibo.active {
    background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
    border-color: rgba(252, 211, 77, 0.55);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(217, 119, 6, 0.32);
  }

  .dm-mob-util-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 7px;
  }

  .dm-mob-currency-wrap {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .dm-mob-currency-seg {
    display: inline-flex;
    align-items: center;
    padding: 2px;
    gap: 2px;
    border-radius: 7px;
    background: var(--bg-input);
    border: 1px solid var(--border-control);
  }

  .dm-mob-cur-btn {
    height: 24px;
    margin: 0;
    padding: 0 9px;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: var(--ink-muted);
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
  }

  .dm-mob-cur-btn.active {
    background: var(--sky-bg);
    color: var(--sky-text);
    box-shadow: inset 0 0 0 1px var(--sky-border);
  }

  .dm-mob-rate-note {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--ink-muted);
  }

  .dm-mob-active-total {
    display: inline-flex;
    align-items: baseline;
    gap: 5px;
    font-size: 12px;
  }

  .dm-mob-total-lbl {
    font-size: 11px;
    font-weight: 700;
    color: var(--ink-muted);
  }

  .dm-mob-total-val {
    font-size: 13px;
    font-weight: 800;
    color: var(--emerald-text);
  }
  .dm-mob-total-val.is-profit {
    color: var(--emerald-text);
  }
  .dm-mob-total-val.is-warn {
    color: var(--rose-text);
  }

  /* Row 2 Inner Tabs (.sr-po-tabs-head parity) */
  .dm-mob-tabs-head {
    padding: 7px 10px 8px;
    background: rgba(15, 23, 42, 0.38);
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tabs-head {
    background: #ffffff;
    border-bottom-color: #e2e8f0;
  }

  .dm-mob-tabs-btn-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
  }

  .dm-mob-inner-tab {
    height: 35px;
    width: 100%;
    margin: 0;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.24);
    background: rgba(15, 23, 42, 0.68);
    color: #94a3b8;
    font-size: 11.5px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: all 0.16s ease;
  }

  .dm-mob-tabs-chrome.is-mode-hd .dm-mob-inner-tab.active {
    background: rgba(2, 132, 199, 0.24);
    border: 1.5px solid #38bdf8;
    color: #f0f9ff;
    box-shadow: inset 0 -2.5px 0 #0284c7, 0 2px 8px rgba(2, 132, 199, 0.22);
  }
  .dm-mob-tabs-chrome.is-mode-khach .dm-mob-inner-tab.active {
    background: rgba(5, 150, 105, 0.24);
    border: 1.5px solid #34d399;
    color: #ecfdf5;
    box-shadow: inset 0 -2.5px 0 #10b981, 0 2px 8px rgba(16, 185, 129, 0.22);
  }
  .dm-mob-tabs-chrome.is-mode-noibo .dm-mob-inner-tab.active {
    background: rgba(217, 119, 6, 0.24);
    border: 1.5px solid #fbbf24;
    color: #fffbeb;
    box-shadow: inset 0 -2.5px 0 #f59e0b, 0 2px 8px rgba(217, 119, 6, 0.22);
  }

  .qlbg-overlay.theme-light-blue .dm-mob-inner-tab {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
  }

  .qlbg-overlay.theme-light-blue .dm-mob-tabs-chrome.is-mode-hd .dm-mob-inner-tab.active {
    background: #e0f2fe;
    border-color: #0284c7;
    color: #0369a1;
    box-shadow: inset 0 -2.5px 0 #0284c7, 0 2px 6px rgba(2, 132, 199, 0.14);
  }
  .qlbg-overlay.theme-light-blue .dm-mob-tabs-chrome.is-mode-khach .dm-mob-inner-tab.active {
    background: #d1fae5;
    border-color: #059669;
    color: #047857;
    box-shadow: inset 0 -2.5px 0 #059669, 0 2px 6px rgba(5, 150, 105, 0.14);
  }
  .qlbg-overlay.theme-light-blue .dm-mob-tabs-chrome.is-mode-noibo .dm-mob-inner-tab.active {
    background: #fef3c7;
    border-color: #d97706;
    color: #b45309;
    box-shadow: inset 0 -2.5px 0 #d97706, 0 2px 6px rgba(217, 119, 6, 0.14);
  }

  /* Seamless Connected Lower Half inside Card 2 */
  .dm-main-col.is-mob-tab-panel,
  .dm-side-col.is-mob-metrics {
    flex: none !important;
    min-height: auto !important;
    overflow: visible !important;
    border-radius: 0 0 14px 14px;
    border: 1px solid rgba(56, 189, 248, 0.35);
    border-top: none !important;
    padding: 10px 10px 12px;
    background: linear-gradient(165deg, rgba(12, 31, 52, 0.9) 0%, rgba(9, 20, 36, 0.96) 100%);
  }

  .dm-body.is-mode-khach .dm-main-col.is-mob-tab-panel,
  .dm-body.is-mode-khach .dm-side-col.is-mob-metrics {
    border-color: rgba(52, 211, 153, 0.36);
    background: linear-gradient(165deg, rgba(10, 35, 28, 0.9) 0%, rgba(8, 24, 19, 0.96) 100%);
  }

  .dm-body.is-mode-noibo .dm-main-col.is-mob-tab-panel,
  .dm-body.is-mode-noibo .dm-side-col.is-mob-metrics {
    border-color: rgba(245, 158, 11, 0.36);
    background: linear-gradient(165deg, rgba(35, 24, 10, 0.9) 0%, rgba(22, 16, 8, 0.96) 100%);
  }

  .qlbg-overlay.theme-light-blue .dm-main-col.is-mob-tab-panel,
  .qlbg-overlay.theme-light-blue .dm-side-col.is-mob-metrics {
    background: #ffffff;
    border-color: #93c5fd;
  }

  .qlbg-overlay.theme-light-blue .dm-body.is-mode-khach .dm-main-col.is-mob-tab-panel,
  .qlbg-overlay.theme-light-blue .dm-body.is-mode-khach .dm-side-col.is-mob-metrics {
    border-color: #6ee7b7;
  }

  .qlbg-overlay.theme-light-blue .dm-body.is-mode-noibo .dm-main-col.is-mob-tab-panel,
  .qlbg-overlay.theme-light-blue .dm-body.is-mode-noibo .dm-side-col.is-mob-metrics {
    border-color: #fcd34d;
  }

  /* Quick Goods Totals Strip */
  .dm-mob-goods-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    padding: 8px;
    margin-bottom: 10px;
    border-radius: 10px;
    background: var(--bg-well);
    border: 1px solid var(--border-subtle);
  }

  .dm-mob-gs-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .dm-mob-gs-cell span {
    font-size: 10px;
    font-weight: 700;
    color: var(--ink-muted);
    text-transform: uppercase;
  }

  .dm-mob-gs-cell strong {
    font-size: 11.5px;
    font-weight: 800;
    color: var(--ink-strong);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dm-mob-gs-cell strong.is-sky {
    color: var(--sky-text);
  }
  .dm-mob-gs-cell strong.is-emerald {
    color: var(--emerald-text);
  }
  .dm-mob-gs-cell strong.is-rose {
    color: var(--rose-text);
  }

  /* Metrics + Dock inside Mobile (No trapped height or inner scrollbars!) */
  .dm-side-col {
    border-left: none;
    overflow: visible !important;
  }

  .dm-side-col .cmp-sr-po1-blocks,
  .dm-side-col .cmp-sr-blocks-scroll {
    overflow: visible !important;
    padding: 0;
  }

  .dm-side-col.is-mob-metrics .cmp-sr-source-bar {
    border-radius: 9px;
    margin-bottom: 8px;
    border: 1px solid var(--sky-border);
  }

  .dm-side-col.is-mob-metrics .pc-right-finance-dock {
    margin-top: 10px;
    background: transparent !important;
    border-top: none !important;
    gap: 10px;
  }

  .dm-side-col.is-mob-metrics .dock-tab-panel {
    max-height: none !important;
    overflow: visible !important;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 11px;
    padding: 10px 12px;
  }

  /* Tab 2: Hồ sơ File & Tổng kết (Mobile Option A) */
  .dm-side-col.is-mob-tongket {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  .dm-side-col.is-mob-tongket .pc-right-finance-dock {
    background: transparent !important;
    border-top: none !important;
    gap: 10px;
  }

  .dm-side-col.is-mob-tongket .dock-tab-panel {
    max-height: none !important;
    overflow: visible !important;
    padding: 12px 13px !important;
    border-radius: 14px !important;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    box-shadow: 0 8px 22px -10px rgba(0, 0, 0, 0.35);
    gap: 8px;
  }

  .qlbg-overlay.theme-light-blue .dm-side-col.is-mob-tongket .dock-tab-panel {
    border-color: #bae6fd;
    box-shadow: 0 8px 22px -8px rgba(2, 132, 199, 0.1);
  }

  .dm-mob-dock-sec-head {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-bottom: 7px;
    margin-bottom: 2px;
    border-bottom: 1px dashed var(--border-subtle);
    font-size: 11.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .dm-mob-dock-sec-head.is-sky {
    color: var(--sky-text);
  }
  .dm-mob-dock-sec-head.is-amber {
    color: var(--amber-text);
  }
  .dm-mob-dock-sec-head.is-emerald {
    color: var(--emerald-text);
  }
}

@media (max-width: 768px) {
  .qlbg-page {
    padding: 10px 10px calc(158px + env(safe-area-inset-bottom, 0px));
  }

  .hide-xs {
    display: none !important;
  }

  .qlbg-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .qlbg-kpi-card {
    padding: 12px 13px;
  }
  .qlbg-kpi-card.is-sky {
    grid-column: 1 / -1;
  }
  .kpi-label {
    font-size: 12.5px;
  }
  .kpi-val {
    font-size: 20px;
  }

  .qlbg-filter-row-main {
    gap: 8px;
  }
  .qlbg-search-box {
    order: 1;
    flex: 1 1 100%;
    min-width: 0;
  }
  .qlbg-filter-left {
    order: 2;
    width: 100%;
  }
  /* Ẩn cụm Hiển thị & Tạo báo giá ở thanh trên vì đã chuyển xuống Floating Bottom Sub-Dock (.bg-mobile-dock) */
  .qlbg-filter-right {
    display: none !important;
  }

  /* =========================================================
     FLOATING GLASS BOTTOM SUB-DOCK (.bg-mobile-dock — ĐỒNG BỘ APP.VUE, CF & SR)
     ========================================================= */
  .bg-mobile-dock {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: calc(74px + env(safe-area-inset-bottom, 0px));
    width: auto;
    max-width: 420px;
    margin: 0 auto;
    z-index: 955;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    gap: 6px;
    padding: 6px;
    border-radius: 20px;
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.28);
    box-shadow:
      0 14px 36px rgba(2, 6, 23, 0.62),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(22px) saturate(165%);
    -webkit-backdrop-filter: blur(22px) saturate(165%);
    transform: translate3d(0, 0, 0);
    will-change: bottom, transform;
    transition:
      bottom 0.38s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
      visibility 0.24s ease,
      box-shadow 0.3s ease;
  }

  .qlbg-page.theme-light-blue .bg-mobile-dock {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(2, 132, 199, 0.28);
    box-shadow:
      0 14px 34px rgba(15, 23, 42, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  :global(.app-layout.mobile-nav-hidden .bg-mobile-dock) {
    bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .bg-mobile-dock.is-modal-hidden,
  :global(.app-layout.has-open-modal .bg-mobile-dock),
  :global(body.app-has-open-modal .bg-mobile-dock) {
    transform: translateY(calc(100% + 96px + env(safe-area-inset-bottom, 0px))) scale(0.96) !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .bg-dock-btn {
    position: relative;
    width: 100%;
    min-width: 0;
    min-height: 48px;
    margin: 0;
    padding: 5px 4px 4px;
    border-radius: 14px;
    border: 1px solid transparent;
    background: transparent;
    color: #94a3b8;
    font-family: var(--font-sans);
    font-size: 10.5px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.01em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.16s ease;
  }

  .bg-dock-btn > span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bg-dock-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .bg-dock-btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .bg-dock-btn.active {
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.14);
    border-color: rgba(56, 189, 248, 0.3);
  }

  .qlbg-page.theme-light-blue .bg-dock-btn {
    color: #475569;
  }

  .qlbg-page.theme-light-blue .bg-dock-btn.active {
    color: #0284c7;
    background: #e0f2fe;
    border-color: #7dd3fc;
  }

  .bg-dock-btn.is-primary.is-center-cta {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #042f2e;
    font-weight: 800;
    border-color: rgba(110, 231, 183, 0.48);
    box-shadow: 0 6px 18px -4px rgba(16, 185, 129, 0.52);
  }

  .qlbg-page.theme-light-blue .bg-dock-btn.is-primary.is-center-cta {
    background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
    color: #ffffff;
    border-color: #38bdf8;
    box-shadow: 0 6px 18px -4px rgba(2, 132, 199, 0.42);
  }

  .bg-dock-icon-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
  }

  .bg-dock-badge {
    position: absolute;
    top: -5px;
    right: -15px;
    min-width: 17px;
    height: 15px;
    padding: 0 5px;
    border-radius: 999px;
    background: #0ea5e9;
    color: #ffffff;
    font-size: 9px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #0f172a;
    white-space: nowrap;
  }

  .bg-dock-badge.is-mode {
    background: rgba(56, 189, 248, 0.22);
    color: #38bdf8;
    right: -22px;
  }

  .qlbg-page.theme-light-blue .bg-dock-badge {
    border-color: #ffffff;
  }

  .qlbg-page.theme-light-blue .bg-dock-badge.is-mode {
    background: #e0f2fe;
    color: #0369a1;
  }

  /* Popover Thiết lập hiển thị nổi ngay trên Dock */
  .bg-mob-display-popover {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: calc(138px + env(safe-area-inset-bottom, 0px));
    max-width: 380px;
    margin: 0 auto;
    z-index: 980;
    padding: 12px;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.97);
    border: 1px solid rgba(56, 189, 248, 0.34);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.68);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: var(--font-sans);
    transition: bottom 0.38s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .qlbg-page.theme-light-blue .bg-mob-display-popover {
    background: #ffffff;
    border-color: #93c5fd;
    box-shadow: 0 20px 44px rgba(15, 23, 42, 0.2);
  }

  :global(.app-layout.mobile-nav-hidden .bg-mob-display-popover) {
    bottom: calc(74px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .bg-ds-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .bg-ds-title {
    font-size: 12.5px;
    font-weight: 800;
    color: var(--ink-strong);
  }

  .bg-ds-close {
    width: 26px;
    height: 26px;
    margin: 0;
    padding: 0;
    border-radius: 7px;
    border: 1px solid var(--border-control);
    background: var(--bg-input);
    color: var(--ink-muted);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .bg-ds-section {
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .bg-ds-section.is-last {
    padding-bottom: 0;
    border-bottom: none;
  }

  .bg-ds-label {
    font-size: 10.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--ink-muted);
  }

  .bg-ds-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .bg-ds-opt-btn {
    height: 34px;
    width: 100%;
    margin: 0;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid var(--border-control);
    background: var(--bg-input);
    color: var(--ink-secondary);
    font-family: var(--font-sans);
    font-size: 11.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    white-space: nowrap;
  }

  .bg-ds-opt-btn.active {
    background: var(--sky-bg);
    border-color: var(--sky-border);
    color: var(--sky-text);
    font-weight: 800;
  }

  .bg-ds-reset-btn {
    height: 34px;
    width: 100%;
    margin: 0;
    padding: 0 10px;
    border-radius: 8px;
    border: 1px solid var(--rose-border);
    background: var(--rose-bg);
    color: var(--rose-text);
    font-family: var(--font-sans);
    font-size: 11.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
  }
  .qlbg-filter-left > .qlbg-picker-btn {
    flex: 1 1 calc(50% - 4px);
    max-width: none;
  }
  .qlbg-filter-left > .qlbg-sort-root {
    flex: 1 1 100%;
    max-width: none;
  }
  .qlbg-sort-trigger {
    max-width: none;
  }
  .qlbg-sort-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 10028;
    background: rgba(2, 6, 23, 0.65);
    backdrop-filter: blur(3px);
  }
  .qlbg-pop-menu {
    position: fixed;
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10030;
    min-width: 0;
    border-radius: 18px 18px 0 0;
    border-bottom: none;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
  .qlbg-pop-close {
    display: inline-flex;
  }
  .qlbg-pop-opt {
    min-height: 46px;
  }
  .dm-preset-grid {
    grid-template-columns: 1fr;
  }
  .dm-custom-range-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  .dm-date-arrow {
    display: none;
  }

  .qlbg-group-header {
    padding: 11px 12px;
    align-items: flex-start;
  }
  .gh-right {
    flex-wrap: nowrap;
    gap: 6px;
    padding-top: 2px;
  }

  .qlbg-cards-grid {
    grid-template-columns: 1fr;
  }
  .qlbg-cards-grid.is-inside-group {
    padding: 10px;
  }

  /* Bottom-Sheet Modals on Mobile (Picker modals keep bottom-sheet; Detail & Customer modals stay 100dvh fullscreen) */
  .qlbg-overlay:not(.qlbg-detail-overlay) {
    padding: 0;
    align-items: flex-end;
  }
  .qlbg-confirm-modal,
  .qlbg-async-card {
    margin: auto 14px;
  }
  .qlbg-picker-modal {
    width: 100%;
    max-height: 94vh;
    border-radius: 18px 18px 0 0;
    border-bottom: none;
  }
  .qlbg-cust-modal {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
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

  /* Ngăn iOS / Chrome Mobile auto-zoom khi chạm vào input trong modal */
  .qlbg-detail-modal input:not([type="checkbox"]):not([type="radio"]),
  .qlbg-detail-modal select,
  .qlbg-detail-modal textarea {
    font-size: 16px !important;
  }

  /* Touch targets dễ bấm hơn cho File Slots trên Mobile */
  .dm-file-slot {
    padding: 8px 0;
    gap: 8px;
  }
  .slot-upload-btn {
    min-height: 28px;
    padding: 4px 10px;
  }
  .slot-file-actions .qc-file-act-btn {
    min-height: 28px;
    padding: 0 9px;
  }
  .slot-file-del {
    width: 28px;
    height: 28px;
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

  .cm-2col,
  .cm-grid,
  .cm-debt-stats {
    grid-template-columns: 1fr;
  }

  /* Sticky 2-Row Mobile Footer chuẩn .sr-po-modal-footer */
  .dm-lbl-dt {
    display: none !important;
  }
  .dm-lbl-mob {
    display: inline !important;
  }
  .is-mob-inline-close {
    display: inline-flex !important;
  }

  .dm-foot {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 6px !important;
    padding: 8px 10px calc(8px + env(safe-area-inset-bottom, 0px)) !important;
    background: rgba(9, 18, 15, 0.98) !important;
    border-top: 1px solid rgba(52, 211, 153, 0.24) !important;
  }

  .qlbg-overlay.theme-light-blue .dm-foot {
    background: #f8fafc !important;
    border-top-color: #bae6fd !important;
  }

  .dm-foot-sec-row,
  .dm-foot-cta-row {
    display: flex !important;
    flex-wrap: nowrap !important;
    width: 100% !important;
    min-width: 0 !important;
    justify-content: stretch !important;
    gap: 6px !important;
  }

  .dm-foot-sec-row .dm-btn-delete {
    margin-right: 0 !important;
  }

  .dm-foot-sec-row > button,
  .dm-foot-cta-row > button {
    flex: 1 1 0% !important;
    min-width: 0 !important;
    justify-content: center !important;
    text-align: center !important;
    padding: 0 7px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .dm-foot-sec-row > button {
    height: 35px !important;
    font-size: 11.5px !important;
  }

  .dm-foot-cta-row > button {
    height: 38px !important;
    font-size: 12px !important;
    font-weight: 800 !important;
  }

  .dm-foot-cta-row .dm-btn-sr-craft {
    background: var(--sky-bg) !important;
    border-color: var(--sky-border) !important;
    color: var(--sky-text) !important;
  }
}

/* ==========================================================================
   FLOATING SELECTION BAR FOR QUOTE COMPARE (100% SALEREPORT PARITY)
   ========================================================================== */
.sr-selection-floating-bar,
.sr-selection-floating-bar * {
  box-sizing: border-box;
  font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
}

.sr-selection-floating-bar {
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  z-index: 9500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 16px;
  width: max-content;
  max-width: calc(100vw - 24px);
  background: rgba(15, 23, 42, 0.94);
  border: 1px solid rgba(16, 185, 129, 0.45);
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(16, 185, 129, 0.15);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: #f8fafc;
  animation: qlbgFloatBarUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes qlbgFloatBarUp {
  from {
    opacity: 0;
    transform: translate(-50%, 16px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.sr-sel-bar-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.sr-sel-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
}

.sr-sel-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sr-sel-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 13px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.sr-sel-btn-ghost {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
}
.sr-sel-btn-ghost:hover {
  background: rgba(56, 189, 248, 0.22);
}

.sr-sel-btn-clear {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.32);
  color: #f87171;
}
.sr-sel-btn-clear:hover {
  background: rgba(239, 68, 68, 0.22);
}

.sr-sel-btn-compare {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  border: 1px solid #38bdf8;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.36);
}
.sr-sel-btn-compare:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .sr-selection-floating-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    bottom: 12px;
    padding: 12px 14px;
  }
  .sr-sel-bar-actions {
    justify-content: flex-end;
  }
}
</style>
