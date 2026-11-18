<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="sr-modal-overlay qlbg-cmp-overlay"
      :class="{ 'theme-light-blue': uiTheme === 'light', 'mode-craft': true }"
      @click.self="emit('close')"
      style="z-index: 10010; padding: 0;"
    >
      <div
        class="sr-modal sr-modal-large sr-analytics-modal mode-craft"
        :class="{ 'is-light': uiTheme === 'light' }"
      >
        <!-- Header (100% đồng bộ chuẩn Modal Phân tích & So sánh Phương án Tạm - SaleReport) -->
        <div class="sr-analytics-header">
          <div class="sr-analytics-header-left">
            <button
              type="button"
              class="sr-analytics-back-btn"
              @click="handleHeaderBack"
              title="Quay lại"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
            <span v-if="!isMobile" class="sr-analytics-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            </span>
            <div class="sr-analytics-title-wrap">
              <div class="sr-analytics-title-row" style="flex-wrap: wrap; gap: 8px;">
                <h3 class="sr-analytics-title">Phân tích &amp; So sánh Phương án</h3>
                <span class="sr-analytics-po-badge">Đã chọn {{ rows.length }} / {{ totalCount }} Phương án</span>
              </div>
              <p class="sr-analytics-sub">
                Chọn các chỉ số KPI ở cột bên trái để hiển thị Biểu đồ và Bảng ma trận đối chiếu theo Nội dung hợp đồng (content_of_contract_PO)
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button
              v-if="!isMobile && rows.length > 0"
              type="button"
              class="sr-ccm-tool-btn is-clone"
              @click="emit('duplicate', rows[rows.length - 1]._contract)"
              title="Nhân bản thêm 1 phương án mới từ phương án cuối"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span class="sr-hide-mob">+ Nhân bản PA</span>
            </button>
            <button
              type="button"
              class="sr-add-choice-close"
              @click="emit('close')"
              title="Đóng phân tích so sánh"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- 2-Column Split Workspace -->
        <div
          class="sr-analytics-split-shell"
          :class="[`mob-analytics-dock-${mobileDockTab}`, { 'is-sidebar-collapsed': isSidebarCollapsed }]"
        >
          <!-- Thanh Bottom Dock 3 nút trên Mobile -->
          <nav class="sr-analytics-mobile-dock" aria-label="Điều hướng phân tích phương án">
            <button
              type="button"
              class="sr-analytics-dock-btn"
              :class="{ active: mobileDockTab === 'metric' }"
              @click="mobileDockTab = 'metric'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              <span>Phương án &amp; Chỉ số</span>
            </button>
            <button
              type="button"
              class="sr-analytics-dock-btn"
              :class="{ active: mobileDockTab === 'group' }"
              @click="mobileDockTab = 'group'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
              <span>Góc nhìn</span>
            </button>
            <button
              type="button"
              class="sr-analytics-dock-btn"
              :class="{ active: mobileDockTab === 'chart' }"
              @click="mobileDockTab = 'chart'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
              <span>Biểu đồ</span>
            </button>
          </nav>

          <!-- CỘT TRÁI: Chọn Chỉ Số KPI + 4 Thẻ KPI Tóm Tắt -->
          <aside class="sr-analytics-sidebar custom-scrollbar">
            <div class="sr-analytics-side-section">
              <div class="sr-analytics-price-mode-bar" role="group" aria-label="Chế độ giá ma trận và biểu đồ">
                <button
                  type="button"
                  class="sr-analytics-price-mode-btn"
                  :class="{ active: analyticsPriceMode === 'hd' }"
                  @click="analyticsPriceMode = 'hd'"
                  title="Hiển thị các chỉ số theo Giá hợp đồng (bao gồm chênh lệch COM)"
                >
                  <span>Giá hợp đồng</span>
                </button>
                <button
                  type="button"
                  class="sr-analytics-price-mode-btn is-khach"
                  :class="{ active: analyticsPriceMode === 'khach' }"
                  @click="analyticsPriceMode = 'khach'"
                  title="Hiển thị các chỉ số theo Giá khách (giá gốc thực tế chưa nâng giá COM)"
                >
                  <span>Giá khách</span>
                </button>
              </div>
              <div class="sr-analytics-side-heading is-with-toggle">
                <span>Chỉ số biểu đồ (3 Nhóm Card PO)</span>
                <button
                  type="button"
                  class="sr-analytics-side-collapse-btn"
                  @click="isSidebarCollapsed = true"
                  title="Thu gọn cột chỉ số bên trái"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
                  <span>Ẩn</span>
                </button>
              </div>
              <div class="sr-analytics-metric-strip">
                <button
                  v-for="mDef in metricDefs"
                  :key="mDef.key"
                  type="button"
                  class="sr-analytics-metric-chip"
                  :class="[
                    mDef.group === 'profit' || mDef.group === 'ratio' ? 'is-margin' : (mDef.group === 'cost' ? 'is-com' : `is-${mDef.group}`),
                    { active: chartMetric === mDef.key }
                  ]"
                  @click="chartMetric = mDef.key; mobileDockTab = 'group'"
                  :title="mDef.formula ? `${mDef.label} (${mDef.formula})` : mDef.label"
                >
                  {{ mDef.shortLabel || mDef.label }}
                </button>
                <button
                  type="button"
                  class="sr-analytics-metric-chip is-margin"
                  :class="{ active: chartMetric === 'triple_kpi' }"
                  @click="chartMetric = 'triple_kpi'; mobileDockTab = 'group'"
                  title="Vẽ gộp 3 cột KPI chính (Doanh số bán • Net COM • Net Margin) cho từng phương án trên cùng 1 biểu đồ"
                >
                  Gộp 3 KPI chính
                </button>
              </div>
            </div>

            <div class="sr-analytics-side-section">
              <div class="sr-analytics-side-heading">
                Tóm tắt — {{ chartMetric === 'triple_kpi' ? '3 Cụm KPI' : activeChartMetricDef.label }}
              </div>
              <div class="sr-analytics-kpi-grid">
                <div
                  v-for="(kpi, kIdx) in summaryKpis"
                  :key="kIdx"
                  class="sr-analytics-kpi-card"
                  :class="`is-${kpi.tone}`"
                >
                  <span class="sr-analytics-kpi-label">{{ kpi.label }}</span>
                  <strong class="sr-analytics-kpi-val">{{ kpi.value }}</strong>
                  <span class="sr-analytics-kpi-sub" :title="kpi.sub">{{ kpi.sub }}</span>
                </div>
              </div>
            </div>
          </aside>

          <!-- CỘT PHẢI: Thanh Tab Góc Nhìn + Vùng Biểu Đồ & Bảng Full Chiều Cao -->
          <div class="sr-analytics-main">
            <div class="sr-analytics-toolbar">
              <div class="sr-analytics-tabs">
                <button
                  type="button"
                  class="sr-analytics-sidebar-toggle-btn"
                  :class="{ 'is-collapsed': isSidebarCollapsed }"
                  @click="isSidebarCollapsed = !isSidebarCollapsed"
                  :title="isSidebarCollapsed ? 'Mở lại cột chỉ số KPI bên trái' : 'Thu gọn cột chỉ số bên trái để mở rộng không gian'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <polyline v-if="isSidebarCollapsed" points="13 9 16 12 13 15" />
                    <polyline v-else points="15 9 12 12 15 15" />
                  </svg>
                  <span>{{ isSidebarCollapsed ? 'Mở cột chỉ số' : 'Ẩn cột trái' }}</span>
                </button>
                <button
                  type="button"
                  class="sr-analytics-tab-btn"
                  :class="{ active: viewSection === 'both' }"
                  @click="viewSection = 'both'; mobileDockTab = 'chart'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                  <span>So sánh Phương án PO ({{ rows.length }})</span>
                </button>
                <button
                  type="button"
                  class="sr-analytics-tab-btn"
                  :class="{ active: viewSection === 'table' }"
                  @click="viewSection = 'table'; mobileDockTab = 'chart'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  <span>Bảng Ma trận So sánh (3 Nhóm)</span>
                </button>
              </div>

              <!-- Controls cho Tab Biểu đồ So sánh PO -->
              <div v-if="viewSection !== 'table'" class="sr-analytics-controls">
                <div class="sr-analytics-ctrl-group">
                  <span class="sr-analytics-ctrl-label">Sắp xếp:</span>
                  <button
                    type="button"
                    class="sr-analytics-seg-btn"
                    :class="{ active: chartSort === 'original' }"
                    @click="chartSort = 'original'"
                  >
                    Thứ tự gốc
                  </button>
                  <button
                    type="button"
                    class="sr-analytics-seg-btn"
                    :class="{ active: chartSort === 'desc' }"
                    @click="chartSort = 'desc'"
                  >
                    Cao nhất
                  </button>
                  <button
                    type="button"
                    class="sr-analytics-seg-btn"
                    :class="{ active: chartSort === 'asc' }"
                    @click="chartSort = 'asc'"
                  >
                    Thấp nhất
                  </button>
                </div>
              </div>

              <!-- Controls cho Tab Bảng Ma trận KPI -->
              <div v-else class="sr-analytics-controls">
                <div class="sr-analytics-ctrl-group">
                  <span class="sr-analytics-ctrl-label">Bố cục:</span>
                  <button
                    type="button"
                    class="sr-analytics-seg-btn"
                    :class="{ active: matrixLayout === 'columns' }"
                    @click="matrixLayout = 'columns'"
                  >
                    Dạng Cột
                  </button>
                  <button
                    type="button"
                    class="sr-analytics-seg-btn"
                    :class="{ active: matrixLayout === 'rows' }"
                    @click="matrixLayout = 'rows'"
                  >
                    Dạng Dòng
                  </button>
                </div>
                <div v-if="rows.length > 1" class="sr-analytics-ctrl-group">
                  <span class="sr-analytics-ctrl-label">Bản gốc:</span>
                  <button
                    v-for="(r, bIdx) in rows"
                    :key="'base-pick-' + (getRowKey(r) || bIdx)"
                    type="button"
                    class="sr-analytics-seg-btn"
                    :class="{ active: isBaselineRow(r) }"
                    @click="setBaselineRow(r)"
                    :title="'Chọn làm Bản gốc: ' + getColTitle(r, bIdx)"
                  >
                    {{ isBaselineRow(r) ? '★ ' : '' }}PA {{ bIdx + 1 }}
                  </button>
                </div>
                <div class="sr-analytics-ctrl-group">
                  <button
                    type="button"
                    class="sr-analytics-seg-btn"
                    :class="{ active: onlyDiff }"
                    @click="onlyDiff = !onlyDiff"
                  >
                    {{ onlyDiff ? 'Đang lọc: Có chênh lệch' : 'Tất cả 13 chỉ số KPI' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div
              class="sr-analytics-body custom-scrollbar"
              :class="{ 'is-matrix-body': viewSection === 'table' && rows.length > 0 }"
            >
              <div v-if="rows.length === 0" class="sr-ccm-empty">
                <p>Chưa có báo giá nào được chọn. Hãy tích chọn các báo giá ở danh sách bên ngoài rồi mở bảng so sánh.</p>
              </div>

              <div v-else class="sr-analytics-ranking-workspace">
                <!-- HÀNG 1: DOUGHNUT + BAR CHART -->
                <div v-if="viewSection !== 'table'" class="sr-analytics-charts-row">
                  <div
                    v-if="chartMetric !== 'triple_kpi' && !activeChartMetricDef.isRatio"
                    class="sr-analytics-doughnut-card"
                  >
                    <div class="sr-analytics-panel-head">
                      <h4 class="sr-analytics-panel-title">Cơ cấu tỷ trọng phương án</h4>
                      <span class="sr-analytics-panel-sub">{{ activeChartMetricDef.label }}</span>
                    </div>
                    <div class="sr-analytics-doughnut-wrap">
                      <Doughnut
                        :key="'qlbg-ccm-dn-' + chartMetric + '-' + analyticsPriceMode + '-' + chartSort + '-' + rows.length + '-' + uiTheme"
                        :data="pieData"
                        :options="pieOptions"
                      />
                    </div>
                  </div>

                  <div class="sr-analytics-bar-card">
                    <div class="sr-analytics-panel-head">
                      <h4 class="sr-analytics-panel-title">
                        Biểu đồ xếp hạng Phương án PO —
                        {{ chartMetric === 'triple_kpi' ? 'Doanh số bán • Net COM • Net Margin' : activeChartMetricDef.label }}
                      </h4>
                      <span class="sr-analytics-panel-sub">
                        Tên mỗi cột là Nội dung hợp đồng (content_of_contract_PO) • Chọn nhanh 13 chỉ số KPI ở cột bên trái
                      </span>
                    </div>
                    <div class="sr-analytics-bar-scroll custom-scrollbar">
                      <div
                        class="chart-wrapper-mobile"
                        :style="isMobile ? {
                          '--mob-bar-h': Math.max(240, sortedChartRows.length * (chartMetric === 'triple_kpi' ? 88 : 68) + 64) + 'px',
                          height: Math.max(240, sortedChartRows.length * (chartMetric === 'triple_kpi' ? 88 : 68) + 64) + 'px',
                          width: '100%',
                          minWidth: '100%'
                        } : {
                          height: '420px',
                          width: Math.max(100, sortedChartRows.length * (chartMetric === 'triple_kpi' ? 165 : 125)) + 'px',
                          minWidth: '100%'
                        }"
                      >
                        <Bar
                          :key="'qlbg-ccm-bar-' + (isMobile ? 'mob-h' : 'pc-v') + '-' + chartMetric + '-' + analyticsPriceMode + '-' + chartSort + '-' + rows.length + '-' + uiTheme"
                          :data="barData"
                          :options="barOptions"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- HÀNG 2A: BẢNG CHI TIẾT XẾP HẠNG PHƯƠNG ÁN PO -->
                <div v-if="viewSection !== 'table'" class="sr-analytics-table-card">
                  <div class="sr-analytics-panel-head">
                    <h4 class="sr-analytics-panel-title">
                      Bảng chi tiết xếp hạng Phương án PO ({{ sortedChartRows.length }} phương án)
                    </h4>
                    <span class="sr-analytics-panel-sub">
                      So sánh trực tiếp Doanh số bán, Net COM, Net Margin và thao tác Chi tiết / Sửa / Nhân bản / Chốt Deal từng phương án
                    </span>
                  </div>
                  <div class="sr-analytics-table-scroll custom-scrollbar">
                    <table class="sr-analytics-table">
                      <thead>
                        <tr>
                          <th style="width: 56px;">Hạng</th>
                          <th>Nội dung hợp đồng (content of contract)</th>
                          <th style="width: 150px; text-align: right;">Doanh số bán</th>
                          <th style="width: 145px; text-align: right;">Net COM</th>
                          <th style="width: 145px; text-align: right;">Net Margin</th>
                          <th v-if="chartMetric !== 'triple_kpi'" style="width: 160px; text-align: right;">
                            {{ activeChartMetricDef.label }}
                          </th>
                          <th v-if="chartMetric !== 'triple_kpi' && !activeChartMetricDef.isRatio" style="width: 185px;">
                            Tỷ trọng
                          </th>
                          <th style="width: 245px; text-align: right;">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(item, rIdx) in sortedChartRows"
                          :key="(getRowKey(item.row) || rIdx)"
                        >
                          <td>
                            <span class="sr-rank-badge" :class="{ 'is-top1': rIdx === 0, 'is-top2': rIdx === 1, 'is-top3': rIdx === 2 }">
                              {{ rIdx + 1 }}
                            </span>
                          </td>
                          <td class="sr-rank-name" :title="item.label">
                            <div>{{ item.label }}</div>
                            <div style="font-size: 11px; font-weight: 500; opacity: 0.72; margin-top: 2px; white-space: normal;">
                              {{ getSubMetaLine(item.row) }}
                            </div>
                          </td>
                          <td class="qlbg-rk-col-dsb" style="text-align: right; font-weight: 700; font-variant-numeric: tabular-nums;">
                            <small class="qlbg-mob-cell-lbl">Doanh số bán: </small>{{ fmt(analyticsDoanhSoBan(item.row)) }} đ
                          </td>
                          <td class="qlbg-rk-col-com" style="text-align: right; font-weight: 700; font-variant-numeric: tabular-nums;">
                            <small class="qlbg-mob-cell-lbl">Net COM: </small>{{ fmt(netCom(item.row)) }} đ
                            <small style="display: block; font-size: 10px; opacity: 0.72;">({{ pct(netCom(item.row), analyticsDoanhSoBan(item.row)) }}% DSB)</small>
                          </td>
                          <td class="qlbg-rk-col-margin sr-rank-val" style="text-align: right; font-variant-numeric: tabular-nums;" :class="netMargin(item.row) < 0 ? 'text-red' : 'text-green'">
                            <small class="qlbg-mob-cell-lbl">Net Margin: </small>{{ fmt(netMargin(item.row)) }} đ
                            <small style="display: block; font-size: 10px; opacity: 0.72;">({{ pct(netMargin(item.row), analyticsDoanhSoBan(item.row)) }}% DSB)</small>
                          </td>
                          <td
                            v-if="chartMetric !== 'triple_kpi'"
                            style="text-align: right; font-variant-numeric: tabular-nums;"
                            class="sr-rank-val qlbg-rk-col-active"
                            :class="item.val < 0 ? 'text-red' : 'text-green'"
                          >
                            <small class="qlbg-mob-cell-lbl">{{ activeChartMetricDef.shortLabel || activeChartMetricDef.label }}: </small>{{ activeChartMetricDef.format(item.row) }}{{ activeChartMetricDef.isRatio ? '' : ' đ' }}
                          </td>
                          <td v-if="chartMetric !== 'triple_kpi' && !activeChartMetricDef.isRatio" class="qlbg-rk-col-share">
                            <div class="sr-rank-share-cell">
                              <div class="sr-rank-share-bar">
                                <div
                                  class="sr-rank-share-fill"
                                  :style="{
                                    width: (chartTotal > 0 ? Math.min(100, Math.max(0, (Math.max(0, item.val) / chartTotal) * 100)) : 0) + '%'
                                  }"
                                ></div>
                              </div>
                              <span class="sr-rank-share-text">
                                {{ chartTotal > 0 ? ((Math.max(0, item.val) / chartTotal) * 100).toFixed(1) : '0.0' }}%
                              </span>
                            </div>
                          </td>
                          <td class="qlbg-rk-col-actions" style="text-align: right;">
                            <div class="sr-ccm-opt-actions is-right-aligned">
                              <button
                                type="button"
                                class="sr-ccm-act-btn is-icon-only"
                                title="Xem chi tiết báo giá"
                                @click="emit('view-detail', item.row._contract)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button
                                v-if="!item.row.is_completed"
                                type="button"
                                class="sr-ccm-act-btn is-edit is-icon-only"
                                title="Mở chỉnh sửa trong Tạo Báo Giá"
                                @click="emit('edit', item.row._contract)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                              </button>
                              <button
                                type="button"
                                class="sr-ccm-act-btn is-clone is-icon-only"
                                title="Nhân bản phương án"
                                @click="emit('duplicate', item.row._contract)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                              </button>
                              <button
                                v-if="item.row.is_official"
                                type="button"
                                class="sr-ccm-act-btn"
                                title="Mở trong Sale Report"
                                @click="emit('open-sr', item.row._contract)"
                              >
                                <span>SR ↗</span>
                              </button>
                              <button
                                v-else
                                type="button"
                                class="sr-ccm-act-btn is-chot"
                                :disabled="chotDealLoading || item.row.is_completed"
                                title="Chốt Deal phương án này"
                                @click="!item.row.is_completed && emit('chot-deal', item.row._contract)"
                              >
                                <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>Chốt</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- HÀNG 2B: BẢNG MA TRẬN ĐỐI CHIẾU 13 CHỈ SỐ KPI -->
                <div v-else class="sr-analytics-table-card is-matrix-full-card">
                  <div class="sr-analytics-table-scroll is-matrix-full-scroll custom-scrollbar">
                    <!-- DẠNG CỘT (COLUMNS) -->
                    <table
                      v-if="matrixLayout === 'columns'"
                      class="sr-ccm-table is-columns-layout is-clean-sheet"
                      :style="{ '--ccm-opt-count': Math.max(1, rows.length) }"
                    >
                      <colgroup>
                        <col class="sr-ccm-col-sticky" />
                        <col
                          v-for="(r, colIdx) in rows"
                          :key="'col-' + (getRowKey(r) || colIdx)"
                          class="sr-ccm-col-option"
                        />
                      </colgroup>
                      <thead>
                        <tr>
                          <th class="sr-ccm-sticky-col sr-ccm-metric-th">
                            <div class="sr-ccm-corner-head">
                              <span>CHỈ SỐ KPI ({{ filteredMetricDefs.length }})</span>
                            </div>
                          </th>
                          <th
                            v-for="(r, colIdx) in rows"
                            :key="getRowKey(r) || colIdx"
                            class="sr-ccm-option-th"
                            :class="{ 'is-baseline-col': isBaselineRow(r) }"
                          >
                            <div class="sr-ccm-opt-head">
                              <div class="sr-ccm-opt-top">
                                <div class="sr-ccm-opt-top-left">
                                  <button
                                    v-if="rows.length > 1"
                                    type="button"
                                    class="sr-ccm-base-btn"
                                    :class="{ 'is-active': isBaselineRow(r) }"
                                    @click.stop="setBaselineRow(r)"
                                    :title="isBaselineRow(r) ? 'Phương án này đang được chọn làm Bản gốc' : 'Chọn phương án này làm Bản gốc để so sánh tăng/giảm'"
                                  >
                                    {{ isBaselineRow(r) ? '★ Bản gốc' : 'Chọn làm gốc' }}
                                  </button>
                                  <span v-else class="sr-ccm-opt-num">PA #1</span>
                                </div>
                                <button
                                  v-if="rows.length > 1"
                                  type="button"
                                  class="sr-ccm-opt-rm"
                                  @click="emit('remove', r)"
                                  title="Ẩn phương án này khỏi bảng so sánh"
                                >
                                  ×
                                </button>
                              </div>
                              <div class="sr-ccm-opt-po" :title="getColTitle(r, colIdx)">
                                {{ getColTitle(r, colIdx) }}
                              </div>
                              <div class="sr-ccm-opt-cust" :title="getSubMetaLine(r)">
                                {{ getSubMetaLine(r) }}
                              </div>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-for="mDef in filteredMetricDefs" :key="mDef.key">
                          <tr
                            v-if="mDef.sectionTitle"
                            class="sr-ccm-section-banner"
                            :class="'is-sec-' + (mDef.sectionGroup === 'rev_cost' ? 'rev' : mDef.sectionGroup === 'com_tax_margin' ? 'com' : 'profit')"
                          >
                            <td :colspan="rows.length + 1" class="sr-ccm-section-td">
                              <span
                                class="sr-ccm-sec-dot"
                                :class="'is-' + (mDef.sectionGroup === 'rev_cost' ? 'rev' : mDef.sectionGroup === 'com_tax_margin' ? 'com' : 'profit')"
                              ></span>
                              <span>{{ mDef.sectionTitle }}</span>
                            </td>
                          </tr>
                          <tr
                            :class="[
                              'sr-ccm-row-' + mDef.group,
                              {
                                'is-highlight-row': mDef.highlightRow,
                                'is-active-chart-metric': chartMetric === mDef.key
                              }
                            ]"
                            :title="mDef.formula ? `${mDef.label}: ${mDef.formula}` : mDef.label"
                          >
                            <td
                              class="sr-ccm-sticky-col sr-ccm-metric-td"
                              style="cursor: pointer;"
                              @click="chartMetric = mDef.key"
                            >
                              <div class="sr-ccm-m-label">
                                <span class="sr-ccm-m-dot" :class="'is-' + mDef.group"></span>
                                <strong>{{ mDef.label }}</strong>
                              </div>
                            </td>
                            <td
                              v-for="(r, colIdx) in rows"
                              :key="(getRowKey(r) || colIdx) + '_' + mDef.key"
                              class="sr-ccm-val-td"
                              :class="{
                                'is-baseline-col': isBaselineRow(r),
                                'is-best-cell': isBestMetricCell(mDef, r, rows)
                              }"
                            >
                              <div class="sr-ccm-cell-main is-right-aligned">
                                <span
                                  class="sr-ccm-cell-val"
                                  :class="{
                                    'is-neg-val': mDef.isNumeric && mDef.getNumeric(r) < 0,
                                    'is-best-val': isBestMetricCell(mDef, r, rows)
                                  }"
                                >
                                  {{ mDef.format(r) }}
                                </span>
                              </div>
                              <div
                                v-if="mDef.isNumeric && !isBaselineRow(r) && getMetricDelta(mDef, r)"
                                class="sr-ccm-delta-row is-right-aligned"
                              >
                                <span
                                  class="sr-ccm-delta-text"
                                  :class="getMetricDelta(mDef, r)?.toneClass"
                                >
                                  <span class="sr-ccm-delta-part">
                                    {{ getMetricDelta(mDef, r)?.deltaText }}
                                  </span>
                                  <span
                                    v-if="getMetricDelta(mDef, r)?.pctText"
                                    class="sr-ccm-delta-part is-pct-part"
                                  >
                                    ({{ getMetricDelta(mDef, r)?.pctText }})
                                  </span>
                                </span>
                              </div>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                      <tfoot>
                        <tr class="sr-ccm-footer-actions-row">
                          <td class="sr-ccm-sticky-col sr-ccm-metric-td">
                            <strong style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.78;">Thao tác phương án</strong>
                          </td>
                          <td
                            v-for="(r, colIdx) in rows"
                            :key="'foot-act-' + (getRowKey(r) || colIdx)"
                            class="sr-ccm-foot-act-td"
                            :class="{ 'is-baseline-col': isBaselineRow(r) }"
                          >
                            <div class="sr-ccm-opt-actions is-right-aligned">
                              <button
                                type="button"
                                class="sr-ccm-act-btn is-icon-only"
                                title="Xem chi tiết báo giá"
                                @click="emit('view-detail', r._contract)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button
                                v-if="!r.is_completed"
                                type="button"
                                class="sr-ccm-act-btn is-edit is-icon-only"
                                title="Sửa báo giá"
                                @click="emit('edit', r._contract)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                              </button>
                              <button
                                type="button"
                                class="sr-ccm-act-btn is-clone is-icon-only"
                                title="Nhân bản phương án"
                                @click="emit('duplicate', r._contract)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                              </button>
                              <button
                                v-if="r.is_official"
                                type="button"
                                class="sr-ccm-act-btn"
                                title="Mở trong Sale Report"
                                @click="emit('open-sr', r._contract)"
                              >
                                <span>SR ↗</span>
                              </button>
                              <button
                                v-else
                                type="button"
                                class="sr-ccm-act-btn is-chot"
                                :disabled="chotDealLoading || r.is_completed"
                                title="Chốt Deal phương án này"
                                @click="!r.is_completed && emit('chot-deal', r._contract)"
                              >
                                <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>Chốt</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    <!-- DẠNG DÒNG (ROWS) -->
                    <table
                      v-else
                      class="sr-ccm-table is-rows-layout is-clean-sheet"
                      :style="{ '--ccm-metric-count': Math.max(1, filteredMetricDefs.length) }"
                    >
                      <colgroup>
                        <col class="sr-ccm-col-row-sticky" />
                        <col
                          v-for="mDef in filteredMetricDefs"
                          :key="'rcol-' + mDef.key"
                          class="sr-ccm-col-row-metric"
                        />
                        <col class="sr-ccm-col-row-actions" />
                      </colgroup>
                      <thead>
                        <tr class="sr-ccm-row-group-header-tr">
                          <th rowspan="2" class="sr-ccm-sticky-col">
                            <div class="sr-ccm-corner-head">
                              <span>NỘI DUNG HỢP ĐỒNG</span>
                            </div>
                          </th>
                          <th
                            v-for="grp in rowHeaderGroups"
                            :key="grp.key"
                            :colspan="grp.count"
                            class="sr-ccm-row-group-th"
                            :class="'is-sec-' + grp.tone"
                          >
                            <span class="sr-ccm-sec-dot" :class="'is-' + grp.tone"></span>
                            <span>{{ grp.title }}</span>
                          </th>
                          <th rowspan="2" class="sr-ccm-row-actions-th" style="text-align: right;">Thao tác</th>
                        </tr>
                        <tr class="sr-ccm-row-metric-header-tr">
                          <th
                            v-for="mDef in filteredMetricDefs"
                            :key="mDef.key"
                            class="sr-ccm-row-metric-th"
                            style="text-align: right; cursor: pointer;"
                            :title="mDef.formula || mDef.label"
                            @click="chartMetric = mDef.key"
                          >
                            <div>{{ mDef.shortLabel || mDef.label }}</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(r, rowIdx) in rows"
                          :key="getRowKey(r) || rowIdx"
                          :class="{ 'is-baseline-row': isBaselineRow(r) }"
                        >
                          <td
                            class="sr-ccm-sticky-col sr-ccm-row-opt-td"
                            :class="{ 'is-baseline-col': isBaselineRow(r) }"
                          >
                            <div v-if="rows.length > 1" class="sr-ccm-row-opt-head" style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                              <button
                                type="button"
                                class="sr-ccm-base-btn"
                                :class="{ 'is-active': isBaselineRow(r) }"
                                @click.stop="setBaselineRow(r)"
                                :title="isBaselineRow(r) ? 'Phương án này đang được chọn làm Bản gốc' : 'Chọn phương án này làm Bản gốc để so sánh tăng/giảm'"
                              >
                                {{ isBaselineRow(r) ? '★ Bản gốc' : 'Chọn làm gốc' }}
                              </button>
                              <button
                                type="button"
                                class="sr-ccm-opt-rm"
                                @click.stop="emit('remove', r)"
                                title="Ẩn phương án này khỏi bảng so sánh"
                              >
                                ×
                              </button>
                            </div>
                            <div class="sr-ccm-opt-po" style="margin-top: 3px;" :title="getColTitle(r, rowIdx)">
                              {{ getColTitle(r, rowIdx) }}
                            </div>
                            <div class="sr-ccm-opt-cust" :title="getSubMetaLine(r)">
                              {{ getSubMetaLine(r) }}
                            </div>
                          </td>
                          <td
                            v-for="mDef in filteredMetricDefs"
                            :key="mDef.key"
                            class="sr-ccm-val-td"
                            :class="{
                              'is-baseline-col': isBaselineRow(r),
                              'is-best-cell': isBestMetricCell(mDef, r, rows)
                            }"
                          >
                            <div class="sr-ccm-cell-main is-right-aligned">
                              <span
                                class="sr-ccm-cell-val"
                                :class="{
                                  'is-neg-val': mDef.isNumeric && mDef.getNumeric(r) < 0,
                                  'is-best-val': isBestMetricCell(mDef, r, rows)
                                }"
                              >
                                {{ mDef.format(r) }}
                              </span>
                            </div>
                            <div
                              v-if="mDef.isNumeric && !isBaselineRow(r) && getMetricDelta(mDef, r)"
                              class="sr-ccm-delta-row is-right-aligned"
                            >
                              <span
                                class="sr-ccm-delta-text"
                                :class="getMetricDelta(mDef, r)?.toneClass"
                              >
                                <span class="sr-ccm-delta-part">
                                  {{ getMetricDelta(mDef, r)?.deltaText }}
                                </span>
                                <span
                                  v-if="getMetricDelta(mDef, r)?.pctText"
                                  class="sr-ccm-delta-part is-pct-part"
                                >
                                  ({{ getMetricDelta(mDef, r)?.pctText }})
                                </span>
                              </span>
                            </div>
                          </td>
                          <td
                            class="sr-ccm-row-actions-td"
                            :class="{ 'is-baseline-col': isBaselineRow(r) }"
                          >
                            <div class="sr-ccm-opt-actions is-right-aligned">
                              <button
                                type="button"
                                class="sr-ccm-act-btn is-icon-only"
                                title="Xem chi tiết báo giá"
                                @click="emit('view-detail', r._contract)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button
                                v-if="!r.is_completed"
                                type="button"
                                class="sr-ccm-act-btn is-edit is-icon-only"
                                title="Sửa báo giá"
                                @click="emit('edit', r._contract)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                              </button>
                              <button
                                type="button"
                                class="sr-ccm-act-btn is-clone is-icon-only"
                                title="Nhân bản phương án"
                                @click="emit('duplicate', r._contract)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                              </button>
                              <button
                                v-if="r.is_official"
                                type="button"
                                class="sr-ccm-act-btn"
                                title="Mở trong Sale Report"
                                @click="emit('open-sr', r._contract)"
                              >
                                <span>SR ↗</span>
                              </button>
                              <button
                                v-else
                                type="button"
                                class="sr-ccm-act-btn is-chot"
                                :disabled="chotDealLoading || r.is_completed"
                                title="Chốt Deal phương án này"
                                @click="!r.is_completed && emit('chot-deal', r._contract)"
                              >
                                <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>Chốt</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
)

export interface CompareQuoteRow {
  rowKey: string
  ma_hop_dong: string
  so_hop_dong: string
  is_completed: boolean
  is_official?: boolean
  isOriginal: boolean
  versionLabel: string
  So_PO: string
  content_of_contract_PO: string
  Ten_cong_ty: string
  Ten_khach_hang: string
  Ten_nha_cung_cap: string
  Tong_tien_truoc_thueVAT: number
  Tong_thueVAT: number
  Tong_tien_sau_thueVAT: number
  Tong_tien_truoc_thueVAT_khach: number
  Tong_thueVAT_khach: number
  Tong_tien_sau_thueVAT_khach: number
  Tong_thanh_tien_chua_VAT_mua_hang: number
  Tong_CP_don_hang: number
  chiet_khau_tong_truoc_thue: number
  chenh_lech_gia: number
  phan_tram_thue_chenh_lech_gia: number
  con_lai: number
  tong_chiet_khau: number
  lam_tron_ti_suat?: boolean
  _contract: any
}

const props = withDefaults(
  defineProps<{
    show: boolean
    rows: CompareQuoteRow[]
    totalCount: number
    uiTheme: 'dark' | 'light'
    initialPriceMode?: 'hd' | 'khach'
    chotDealLoading?: boolean
  }>(),
  {
    initialPriceMode: 'hd',
    chotDealLoading: false
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'remove', row: CompareQuoteRow): void
  (e: 'view-detail', contract: any): void
  (e: 'edit', contract: any): void
  (e: 'duplicate', contract: any): void
  (e: 'chot-deal', contract: any): void
  (e: 'open-sr', contract: any): void
}>()

const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth <= 1080 : false)
function handleResize() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 1080
  }
}
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
})
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})

const analyticsPriceMode = ref<'hd' | 'khach'>(props.initialPriceMode)
const isSidebarCollapsed = ref(false)
const viewSection = ref<'both' | 'table'>('both')
const chartMetric = ref<string>('dsb')
const chartSort = ref<'original' | 'desc' | 'asc'>('original')
const matrixLayout = ref<'columns' | 'rows'>('columns')
const baseRowKey = ref<string>('')
const onlyDiff = ref(false)
const mobileDockTab = ref<'metric' | 'group' | 'chart'>('chart')

watch(
  () => props.show,
  v => {
    if (v) {
      analyticsPriceMode.value = props.initialPriceMode || 'hd'
      mobileDockTab.value = 'chart'
    }
  }
)

function handleHeaderBack() {
  if (isMobile.value && mobileDockTab.value === 'chart') {
    mobileDockTab.value = 'group'
    return
  }
  if (isMobile.value && mobileDockTab.value === 'group') {
    mobileDockTab.value = 'metric'
    return
  }
  emit('close')
}

/* ── HELPERS TÍNH TOÁN 100% ĐỒNG BỘ SALEREPORTFIREBASE ── */
function toNum(v: any): number {
  if (v === null || v === undefined || v === '') return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = String(v).trim().replace(/,/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

const fmt = (v: number) => {
  if (v === 0) return '0'
  return Math.round(v).toLocaleString('vi-VN')
}

const pctFmt = (v: number) => {
  if (v === 0) return '0%'
  return v.toFixed(2) + '%'
}

function pct(num: number, den: number): string {
  if (!den || !Number.isFinite(den) || Math.abs(den) < 0.0001) return '0.00'
  const val = (Number(num || 0) / den) * 100
  return Number.isFinite(val) ? val.toFixed(2) : '0.00'
}

const giaMua = (r: CompareQuoteRow) => toNum(r?.Tong_thanh_tien_chua_VAT_mua_hang)
const tongCP = (r: CompareQuoteRow) => toNum(r?.Tong_CP_don_hang)
const doanhSoBanHd = (r: CompareQuoteRow) => toNum(r?.Tong_tien_truoc_thueVAT)
const tongSauVatHd = (r: CompareQuoteRow) => {
  const s = toNum(r?.Tong_tien_sau_thueVAT)
  return s > 0 ? s : (toNum(r?.Tong_tien_truoc_thueVAT) + toNum(r?.Tong_thueVAT))
}

const thuePct = (r: CompareQuoteRow) => {
  if (!r) return 25
  const raw = r.phan_tram_thue_chenh_lech_gia as any
  if (raw !== undefined && raw !== null && raw !== '') {
    const val = Number(raw)
    if (!isNaN(val) && val >= 0) return val
  }
  return 25
}

const grossCom = (r: CompareQuoteRow) => {
  if (!r) return 0
  const direct = toNum(r.chiet_khau_tong_truoc_thue) || toNum(r.chenh_lech_gia)
  if (direct !== 0) return direct

  const net = toNum(r.con_lai) || toNum(r.tong_chiet_khau)
  if (net !== 0) {
    const t = thuePct(r)
    if (t >= 0 && t < 100) {
      return Math.round(net / (1 - t / 100))
    }
  }
  return 0
}

const thue = (r: CompareQuoteRow) => grossCom(r) * (thuePct(r) / 100)

const netCom = (r: CompareQuoteRow) => {
  if (!r) return 0
  const direct = toNum(r.con_lai) || toNum(r.tong_chiet_khau)
  if (direct !== 0) return direct
  const gc = grossCom(r)
  if (gc !== 0) {
    return Math.round(gc * (1 - thuePct(r) / 100))
  }
  return 0
}

const doanhSoBanKhach = (r: CompareQuoteRow): number => {
  if (!r) return 0
  const rawKhach = toNum(r.Tong_tien_truoc_thueVAT_khach)
  if (rawKhach > 0) return rawKhach
  return Math.max(0, doanhSoBanHd(r) - grossCom(r))
}

const thueVatKhach = (r: CompareQuoteRow): number => {
  if (!r) return 0
  const rawVatKhach = toNum(r.Tong_thueVAT_khach)
  if (rawVatKhach > 0) return rawVatKhach
  const dsbHd = doanhSoBanHd(r)
  const dsbKh = doanhSoBanKhach(r)
  const vatHd = toNum(r.Tong_thueVAT) || Math.max(0, tongSauVatHd(r) - dsbHd)
  if (dsbHd > 0 && vatHd > 0) {
    return Math.round(vatHd * (dsbKh / dsbHd))
  }
  return vatHd
}

const tongSauVatKhach = (r: CompareQuoteRow): number => {
  if (!r) return 0
  const rawSauKhach = toNum(r.Tong_tien_sau_thueVAT_khach)
  if (rawSauKhach > 0) return rawSauKhach
  return doanhSoBanKhach(r) + thueVatKhach(r)
}

const analyticsDoanhSoBan = (r: CompareQuoteRow): number =>
  analyticsPriceMode.value === 'khach' ? doanhSoBanKhach(r) : doanhSoBanHd(r)

const analyticsTongSauVat = (r: CompareQuoteRow): number =>
  analyticsPriceMode.value === 'khach' ? tongSauVatKhach(r) : tongSauVatHd(r)

const netPO = (r: CompareQuoteRow) => doanhSoBanHd(r) - grossCom(r)
const netMargin = (r: CompareQuoteRow) => doanhSoBanHd(r) - grossCom(r) - tongCP(r)

/* ── IDENTIFIERS & DISPLAY TITLES ── */
function getRowKey(r: CompareQuoteRow): string {
  return String(r?.rowKey || r?.ma_hop_dong || r?.so_hop_dong || r?.So_PO || '').trim()
}

const duplicateContentCounts = computed(() => {
  const m = new Map<string, number>()
  props.rows.forEach(r => {
    const c = String(r?.content_of_contract_PO || '').trim()
    if (c) m.set(c, (m.get(c) || 0) + 1)
  })
  return m
})

function getColTitle(r: CompareQuoteRow, idx = 0): string {
  const content = String(r?.content_of_contract_PO || '').trim()
  const verSuffix = r.versionLabel || (r.isOriginal ? 'Gốc' : '')
  const code = String(r?.so_hop_dong || r?.ma_hop_dong || '').trim()
  if (content) {
    if ((duplicateContentCounts.value.get(content) || 0) > 1) {
      const tag = verSuffix || code
      return tag ? `${content} (${tag})` : content
    }
    return content
  }
  const soPo = String(r?.So_PO || '').trim()
  if (soPo) return `PO #${soPo}`
  if (code) return verSuffix ? `${code} (${verSuffix})` : code
  return `Phương án #${idx + 1}`
}

function getSubMetaLine(r: CompareQuoteRow): string {
  const parts: string[] = []
  const comp = r.Ten_cong_ty || r.Ten_khach_hang || 'Khách lẻ'
  parts.push(comp)
  const code = r.so_hop_dong || r.ma_hop_dong
  if (code) parts.push(code)
  const tagParts: string[] = []
  if (r.versionLabel) tagParts.push(r.versionLabel)
  if (r.isOriginal) tagParts.push('Gốc')
  if (tagParts.length) parts.push(tagParts.join(' • '))
  if (r.So_PO) parts.push(`PO: ${r.So_PO}`)
  if (r.Ten_nha_cung_cap) parts.push(`NCC: ${r.Ten_nha_cung_cap}`)
  return parts.join(' • ')
}

function wrapText(text: string, maxLen = 20, maxLines = 0): string | string[] {
  if (!text) return ''
  const normalized = String(text).replace(/_/g, '_ ')
  if (normalized.length <= maxLen) return String(text)
  const rawWords = normalized.split(/\s+/).filter(Boolean)
  const words: string[] = []
  for (const w of rawWords) {
    if (w.length <= maxLen) {
      words.push(w)
    } else {
      for (let i = 0; i < w.length; i += maxLen) {
        words.push(w.slice(i, i + maxLen))
      }
    }
  }
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? (line.endsWith('_') ? line + word : line + ' ' + word) : word
    if (candidate.length <= maxLen) {
      line = candidate
    } else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  if (maxLines > 0 && lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    const last = kept[maxLines - 1]
    kept[maxLines - 1] = (last.length > maxLen - 2 ? last.slice(0, maxLen - 2).trimEnd() : last) + '…'
    return kept
  }
  return lines
}

/* ── 13 CHỈ SỐ KPI ĐỐI CHIẾU CHUẨN 3 NHÓM ── */
interface MetricDef {
  key: string
  label: string
  shortLabel?: string
  formula?: string
  sectionTitle?: string
  sectionGroup?: 'rev_cost' | 'com_tax_margin' | 'ratio'
  group: 'rev' | 'cost' | 'com' | 'profit' | 'ratio'
  isNumeric: boolean
  isRatio?: boolean
  higherIsBetter?: boolean | null
  highlightRow?: boolean
  getNumeric: (r: CompareQuoteRow) => number
  format: (r: CompareQuoteRow) => string
}

const metricDefs: MetricDef[] = [
  // NHÓM 1: DOANH SỐ & CHI PHÍ
  {
    key: 'dsb',
    sectionGroup: 'rev_cost',
    sectionTitle: '1. DOANH SỐ & CHI PHÍ',
    label: 'Doanh số bán',
    shortLabel: 'Doanh số bán',
    formula: 'Giá trị hàng bán trước thuế VAT',
    group: 'rev',
    isNumeric: true,
    higherIsBetter: true,
    highlightRow: true,
    getNumeric: (r) => analyticsDoanhSoBan(r),
    format: (r) => fmt(analyticsDoanhSoBan(r))
  },
  {
    key: 'gia_mua',
    sectionGroup: 'rev_cost',
    label: 'Giá mua',
    shortLabel: 'Giá mua',
    formula: 'Giá trị mua hàng đầu vào',
    group: 'cost',
    isNumeric: true,
    higherIsBetter: false,
    getNumeric: (r) => giaMua(r),
    format: (r) => fmt(giaMua(r))
  },
  {
    key: 'tong_cp',
    sectionGroup: 'rev_cost',
    label: 'Tổng CP đơn hàng',
    shortLabel: 'Tổng CP đơn hàng',
    formula: 'Tổng chi phí thực hiện đơn hàng',
    group: 'cost',
    isNumeric: true,
    higherIsBetter: false,
    getNumeric: (r) => tongCP(r),
    format: (r) => fmt(tongCP(r))
  },
  {
    key: 'tong_sau_vat',
    sectionGroup: 'rev_cost',
    label: 'Tổng tiền sau VAT',
    shortLabel: 'Tổng tiền sau VAT',
    formula: '= Doanh số bán + Thuế VAT',
    group: 'rev',
    isNumeric: true,
    higherIsBetter: true,
    getNumeric: (r) => analyticsTongSauVat(r),
    format: (r) => fmt(analyticsTongSauVat(r))
  },

  // NHÓM 2: COM, THUẾ & MARGIN
  {
    key: 'net_com',
    sectionGroup: 'com_tax_margin',
    sectionTitle: '2. COM, THUẾ & MARGIN',
    label: 'Net COM',
    shortLabel: 'Net COM',
    formula: '= Gross COM - Thuế COM',
    group: 'com',
    isNumeric: true,
    higherIsBetter: true,
    highlightRow: true,
    getNumeric: (r) => netCom(r),
    format: (r) => fmt(netCom(r))
  },
  {
    key: 'gross_com',
    sectionGroup: 'com_tax_margin',
    label: 'Gross COM',
    shortLabel: 'Gross COM',
    formula: 'Chênh lệch nâng giá trước thuế',
    group: 'com',
    isNumeric: true,
    higherIsBetter: true,
    getNumeric: (r) => grossCom(r),
    format: (r) => fmt(grossCom(r))
  },
  {
    key: 'thue_com',
    sectionGroup: 'com_tax_margin',
    label: 'Thuế',
    shortLabel: 'Thuế',
    formula: '= Gross COM × % Thuế COM',
    group: 'cost',
    isNumeric: true,
    higherIsBetter: false,
    getNumeric: (r) => Math.round(thue(r)),
    format: (r) => `${fmt(Math.round(thue(r)))} (${thuePct(r)}%)`
  },
  {
    key: 'net_po',
    sectionGroup: 'com_tax_margin',
    label: 'Net PO',
    shortLabel: 'Net PO',
    formula: '= Doanh số bán - Gross COM',
    group: 'rev',
    isNumeric: true,
    higherIsBetter: true,
    getNumeric: (r) => netPO(r),
    format: (r) => fmt(netPO(r))
  },
  {
    key: 'net_margin',
    sectionGroup: 'com_tax_margin',
    label: 'Net Margin',
    shortLabel: 'Net Margin',
    formula: '= Doanh số bán - Gross COM - Tổng CP',
    group: 'profit',
    isNumeric: true,
    higherIsBetter: true,
    highlightRow: true,
    getNumeric: (r) => netMargin(r),
    format: (r) => fmt(netMargin(r))
  },

  // NHÓM 3: TỈ SUẤT
  {
    key: 'pct_com_netpo',
    sectionGroup: 'ratio',
    sectionTitle: '3. TỈ SUẤT',
    label: 'Net COM / Net PO',
    shortLabel: 'Net COM / Net PO',
    formula: '= (Net COM / Net PO) × 100%',
    group: 'ratio',
    isNumeric: true,
    isRatio: true,
    higherIsBetter: true,
    getNumeric: (r) => {
      const np = netPO(r)
      return np > 0 ? Number(((netCom(r) / np) * 100).toFixed(2)) : 0
    },
    format: (r) => `${pct(netCom(r), netPO(r))}%`
  },
  {
    key: 'pct_margin_netpo',
    sectionGroup: 'ratio',
    label: 'Net Margin / Net PO',
    shortLabel: 'Net Margin / Net PO',
    formula: '= (Net Margin / Net PO) × 100%',
    group: 'ratio',
    isNumeric: true,
    isRatio: true,
    higherIsBetter: true,
    getNumeric: (r) => {
      const np = netPO(r)
      return np > 0 ? Number(((netMargin(r) / np) * 100).toFixed(2)) : 0
    },
    format: (r) => `${pct(netMargin(r), netPO(r))}%`
  },
  {
    key: 'pct_com_dsb',
    sectionGroup: 'ratio',
    label: 'Net COM / DSB',
    shortLabel: 'Net COM / DSB',
    formula: '= (Net COM / Doanh số bán) × 100%',
    group: 'ratio',
    isNumeric: true,
    isRatio: true,
    higherIsBetter: true,
    getNumeric: (r) => {
      const d = analyticsDoanhSoBan(r)
      return d > 0 ? Number(((netCom(r) / d) * 100).toFixed(2)) : 0
    },
    format: (r) => `${pct(netCom(r), analyticsDoanhSoBan(r))}%`
  },
  {
    key: 'pct_margin_dsb',
    sectionGroup: 'ratio',
    label: 'Net Margin / DSB',
    shortLabel: 'Net Margin / DSB',
    formula: '= (Net Margin / Doanh số bán) × 100%',
    group: 'ratio',
    isNumeric: true,
    isRatio: true,
    higherIsBetter: true,
    getNumeric: (r) => {
      const d = analyticsDoanhSoBan(r)
      return d > 0 ? Number(((netMargin(r) / d) * 100).toFixed(2)) : 0
    },
    format: (r) => `${pct(netMargin(r), analyticsDoanhSoBan(r))}%`
  }
]

const filteredMetricDefs = computed(() => {
  const baseList =
    !onlyDiff.value || props.rows.length < 2
      ? metricDefs
      : metricDefs.filter(mDef => {
          const firstFormatted = mDef.format(props.rows[0])
          return props.rows.some(r => mDef.format(r) !== firstFormatted)
        })
  const seenGroup = new Set<string>()
  const groupTitleMap: Record<string, string> = {
    rev_cost: '1. DOANH SỐ & CHI PHÍ',
    com_tax_margin: '2. COM, THUẾ & MARGIN',
    ratio: '3. TỈ SUẤT'
  }
  return baseList.map(mDef => {
    const gKey = mDef.sectionGroup || 'rev_cost'
    if (!seenGroup.has(gKey)) {
      seenGroup.add(gKey)
      return {
        ...mDef,
        sectionTitle: groupTitleMap[gKey] || mDef.sectionTitle
      }
    }
    return {
      ...mDef,
      sectionTitle: undefined
    }
  })
})

const rowHeaderGroups = computed(() => {
  const defs = filteredMetricDefs.value
  const groups: Array<{ key: string; title: string; tone: string; count: number }> = []
  const groupMeta: Record<string, { title: string; tone: string }> = {
    rev_cost: { title: '1. DOANH SỐ & CHI PHÍ', tone: 'rev' },
    com_tax_margin: { title: '2. COM, THUẾ & MARGIN', tone: 'com' },
    ratio: { title: '3. TỈ SUẤT', tone: 'profit' }
  }
  for (const m of defs) {
    const gKey = m.sectionGroup || 'rev_cost'
    const meta = groupMeta[gKey] || groupMeta.rev_cost
    const last = groups[groups.length - 1]
    if (last && last.key === gKey) {
      last.count += 1
    } else {
      groups.push({ key: gKey, title: meta.title, tone: meta.tone, count: 1 })
    }
  }
  return groups
})

/* ── BASELINE & DELTAS ── */
const effectiveBaseRow = computed<CompareQuoteRow | null>(() => {
  const list = props.rows
  if (!list.length) return null
  if (baseRowKey.value) {
    const found = list.find(r => getRowKey(r) === baseRowKey.value)
    if (found) return found
  }
  return list[0]
})

function isBaselineRow(r: CompareQuoteRow): boolean {
  const base = effectiveBaseRow.value
  if (!base || !r) return false
  return getRowKey(base) === getRowKey(r)
}

function setBaselineRow(r: CompareQuoteRow) {
  const k = getRowKey(r)
  if (k) baseRowKey.value = k
}

function isBestMetricCell(mDef: MetricDef, r: CompareQuoteRow, list: CompareQuoteRow[]): boolean {
  if (!mDef.isNumeric || mDef.higherIsBetter === null || mDef.higherIsBetter === undefined) return false
  if (!list || list.length < 2) return false
  const vals = list.map(item => mDef.getNumeric(item))
  const allEqual = vals.every(v => Math.abs(v - vals[0]) < 0.001)
  if (allEqual) return false
  const curVal = mDef.getNumeric(r)
  if (mDef.higherIsBetter === false) {
    const positiveVals = vals.filter(v => v > 0)
    if (!positiveVals.length || curVal <= 0) return false
    const minVal = Math.min(...positiveVals)
    return Math.abs(curVal - minVal) < 0.001
  }
  const maxVal = Math.max(...vals)
  return Math.abs(curVal - maxVal) < 0.001
}

function getMetricDelta(mDef: MetricDef, r: CompareQuoteRow) {
  const list = props.rows
  if (!mDef.isNumeric || !list || list.length < 2) return null
  const refRow = effectiveBaseRow.value
  if (!refRow || getRowKey(refRow) === getRowKey(r)) return null
  const baseVal = mDef.getNumeric(refRow)
  const curVal = mDef.getNumeric(r)
  const diff = curVal - baseVal
  if (Math.abs(diff) < 0.005) {
    return {
      deltaText: 'Không đổi',
      pctText: '0%',
      toneClass: 'is-flat'
    }
  }
  const isRatio = Boolean(mDef.isRatio || mDef.group === 'ratio')
  const arrow = diff > 0 ? '▲ +' : '▼ '
  const deltaText = isRatio
    ? `${arrow}${diff.toFixed(2)}%`
    : `${arrow}${fmt(Math.round(diff))}`
  let pctText = ''
  if (Math.abs(baseVal) > 0.001) {
    const p = ((diff / Math.abs(baseVal)) * 100).toFixed(1)
    pctText = `${diff > 0 ? '+' : ''}${p}%`
  }
  let toneClass = 'is-neutral'
  if (mDef.higherIsBetter === true) {
    toneClass = diff > 0 ? 'is-good' : 'is-bad'
  } else if (mDef.higherIsBetter === false) {
    toneClass = diff < 0 ? 'is-good' : 'is-bad'
  }
  return { deltaText, pctText, toneClass }
}

/* ── CHARTS & SUMMARY KPIS ── */
const activeChartMetricDef = computed<MetricDef>(() => {
  return metricDefs.find(m => m.key === chartMetric.value) || metricDefs[0]
})

const sortedChartRows = computed(() => {
  const mDef = activeChartMetricDef.value
  const list = props.rows.map((r, idx) => ({
    row: r,
    origIdx: idx,
    label: getColTitle(r, idx),
    val: chartMetric.value === 'triple_kpi' ? netMargin(r) : mDef.getNumeric(r)
  }))
  if (chartSort.value === 'desc') {
    return [...list].sort((a, b) => b.val - a.val)
  }
  if (chartSort.value === 'asc') {
    return [...list].sort((a, b) => a.val - b.val)
  }
  return list
})

const chartTotal = computed(() => {
  const mDef = activeChartMetricDef.value
  return sortedChartRows.value.reduce(
    (s, item) => s + Math.max(0, mDef.getNumeric(item.row)),
    0
  )
})

const summaryKpis = computed(() => {
  const items = sortedChartRows.value
  const count = items.length
  const mDef = activeChartMetricDef.value
  const ratio = chartMetric.value !== 'triple_kpi' && Boolean(mDef.isRatio)
  const formatVal = (v: number) => (ratio ? pctFmt(v) : `${fmt(Math.round(v))} đ`)

  if (!count) {
    return [
      { label: 'Tổng phương án', value: '0', sub: 'Chưa có dữ liệu', tone: 'blue' },
      { label: 'Phương án dẫn đầu', value: '0', sub: 'Chưa có dữ liệu', tone: 'emerald' },
      { label: 'Trung bình / Phương án', value: '0', sub: 'Chưa có dữ liệu', tone: 'amber' },
      { label: 'Chênh lệch tối đa', value: '0', sub: 'Chưa có dữ liệu', tone: 'blue' }
    ]
  }

  const byValDesc = [...items].sort((a, b) => b.val - a.val)
  const bestItem = byValDesc[0]
  const worstItem = byValDesc[byValDesc.length - 1]
  const sumVal = items.reduce((s, x) => s + x.val, 0)
  const avgVal = sumVal / count
  const diffVal = Math.max(0, bestItem.val - worstItem.val)

  return [
    {
      label: 'Tổng phương án so sánh',
      value: `${count} PA`,
      sub: ratio
        ? `Đang so sánh: ${mDef.label}`
        : `Tổng ${chartMetric.value === 'triple_kpi' ? 'Net Margin' : mDef.label}: ${formatVal(sumVal)}`,
      tone: 'blue'
    },
    {
      label: 'Phương án dẫn đầu (Top 1)',
      value: formatVal(bestItem.val),
      sub: bestItem.label,
      tone: 'emerald'
    },
    {
      label: 'Trung bình mỗi phương án',
      value: formatVal(avgVal),
      sub: `Chia đều trên ${count} phương án`,
      tone: 'amber'
    },
    {
      label: 'Biên độ chênh lệch (Max - Min)',
      value: count > 1 ? formatVal(diffVal) : '0',
      sub: count > 1 ? `Thấp nhất: ${worstItem.label} (${formatVal(worstItem.val)})` : 'Cần >= 2 phương án',
      tone: 'blue'
    }
  ]
})

const piePalette = [
  '#10b981', '#0284c7', '#f59e0b', '#14b8a6', '#f97316',
  '#3b82f6', '#84cc16', '#06b6d4', '#64748b'
]

const pieData = computed<any>(() => {
  const mDef = activeChartMetricDef.value
  const items = sortedChartRows.value
    .map(item => ({ label: item.label, val: Math.max(0, mDef.getNumeric(item.row)) }))
    .filter(item => item.val > 0)

  const labels = items.map(item => {
    const text = item.label
    if (isMobile.value && text.length > 18) return text.substring(0, 18) + '...'
    if (!isMobile.value && text.length > 28) return text.substring(0, 28) + '...'
    return text
  })
  const values = items.map(item => item.val)

  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: piePalette,
        borderWidth: 2,
        borderColor: props.uiTheme === 'light' ? '#ffffff' : '#091411'
      }
    ]
  }
})

const pieOptions = computed<any>(() => {
  const isLight = props.uiTheme === 'light'
  const mDef = activeChartMetricDef.value
  const total = sortedChartRows.value.reduce(
    (s, item) => s + Math.max(0, mDef.getNumeric(item.row)),
    0
  )
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '58%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isLight ? '#334155' : '#cbd5e1',
          font: { size: 11, weight: '600' },
          boxWidth: 10
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const p = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : '0.0'
            return ` ${ctx.label}: ${fmt(ctx.raw)} đ (${p}%)`
          }
        }
      },
      datalabels: {
        color: '#ffffff',
        formatter: (val: number) => {
          if (!total) return ''
          const p = (val / total) * 100
          return p >= 6 ? `${p.toFixed(0)}%` : ''
        },
        font: { weight: 'bold', size: 11 },
        textShadowBlur: 4,
        textShadowColor: 'rgba(0,0,0,0.75)'
      }
    }
  }
})

const barData = computed<any>(() => {
  const items = sortedChartRows.value
  const isLight = props.uiTheme === 'light'
  const labels = items.map(d =>
    isMobile.value ? wrapText(d.label, 18, 3) : wrapText(d.label, 22, 3)
  )

  if (chartMetric.value === 'triple_kpi') {
    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Doanh số bán',
          data: items.map(d => analyticsDoanhSoBan(d.row)),
          backgroundColor: isLight ? '#0284c7' : '#38bdf8',
          borderRadius: 6,
          maxBarThickness: isMobile.value ? 22 : 38
        },
        {
          type: 'bar',
          label: 'Net COM',
          data: items.map(d => netCom(d.row)),
          backgroundColor: isLight ? '#d97706' : '#f59e0b',
          borderRadius: 6,
          maxBarThickness: isMobile.value ? 22 : 38
        },
        {
          type: 'bar',
          label: 'Net Margin',
          data: items.map(d => netMargin(d.row)),
          backgroundColor: isLight ? '#059669' : '#10b981',
          borderRadius: 6,
          maxBarThickness: isMobile.value ? 22 : 38
        }
      ]
    }
  }

  const mDef = activeChartMetricDef.value
  const ratio = Boolean(mDef.isRatio)
  const values = items.map(d => mDef.getNumeric(d.row))
  const positiveBarColor =
    mDef.group === 'rev'
      ? '#0284c7'
      : mDef.group === 'com'
        ? '#f59e0b'
        : isLight
          ? '#059669'
          : '#10b981'

  const datasets: any[] = []
  if (items.length > 1) {
    const avgVal = values.reduce((s, v) => s + v, 0) / items.length
    datasets.push({
      type: 'line',
      label: `Trung bình phương án (${ratio ? pctFmt(avgVal) : fmt(Math.round(avgVal)) + ' đ'})`,
      data: values.map(() => avgVal),
      borderColor: isLight ? '#d97706' : '#fbbf24',
      borderWidth: 2,
      borderDash: [6, 5],
      pointRadius: 2.5,
      fill: false,
      order: 1,
      datalabels: { display: false }
    })
  }

  datasets.push({
    type: 'bar',
    label: mDef.label,
    data: values,
    backgroundColor: (ctx: any) => (ctx.raw < 0 ? '#ef4444' : positiveBarColor),
    borderRadius: 6,
    maxBarThickness: isMobile.value ? 28 : 54,
    order: 2
  })

  return {
    labels,
    datasets
  }
})

const barOptions = computed<any>(() => {
  const isLight = props.uiTheme === 'light'
  const isTriple = chartMetric.value === 'triple_kpi'
  const mDef = activeChartMetricDef.value
  const ratio = !isTriple && Boolean(mDef.isRatio)
  const items = sortedChartRows.value
  const total =
    !isTriple && !ratio
      ? items.reduce((s, d) => s + Math.max(0, mDef.getNumeric(d.row)), 0)
      : 0
  const horiz = isMobile.value

  const formatAxisValue = (v: any) => {
    const num = Number(v)
    if (ratio) return pctFmt(num)
    if (horiz) {
      if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + ' Tỷ'
      if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(0) + ' Tr'
      if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(0) + 'k'
    }
    return fmt(num)
  }

  return {
    indexAxis: horiz ? ('y' as const) : ('x' as const),
    responsive: true,
    maintainAspectRatio: false,
    layout: horiz
      ? { padding: { top: 8, right: ratio ? 44 : 62, bottom: 8, left: 2 } }
      : { padding: { top: 42, bottom: 16 } },
    scales: horiz
      ? {
          x: {
            beginAtZero: true,
            grace: '22%',
            grid: { color: isLight ? 'rgba(148, 163, 184, 0.25)' : 'rgba(51, 65, 85, 0.45)' },
            ticks: {
              color: isLight ? '#475569' : '#94a3b8',
              maxTicksLimit: 5,
              font: { weight: '600', size: 10 },
              callback: formatAxisValue
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: isLight ? '#0f172a' : '#e2e8f0',
              autoSkip: false,
              font: { size: 10.5, weight: '700' }
            }
          }
        }
      : {
          y: {
            beginAtZero: true,
            grace: '24%',
            grid: { color: isLight ? 'rgba(148, 163, 184, 0.25)' : 'rgba(51, 65, 85, 0.45)' },
            ticks: {
              color: isLight ? '#475569' : '#94a3b8',
              font: { weight: '600', size: 11 },
              callback: (v: any) => (ratio ? pctFmt(v) : fmt(v))
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: isLight ? '#0f172a' : '#e2e8f0',
              minRotation: 0,
              maxRotation: 0,
              autoSkip: false,
              font: { size: 11, weight: '700' }
            }
          }
        },
    plugins: {
      legend: {
        display: isTriple || items.length > 1,
        position: 'top' as const,
        labels: {
          color: isLight ? '#0f172a' : '#e2e8f0',
          font: { size: 11, weight: '600' },
          usePointStyle: true,
          boxWidth: 9
        }
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => {
            if (!tooltipItems || !tooltipItems.length) return ''
            const idx = tooltipItems[0].dataIndex
            const item = items[idx]
            if (!item) return ''
            const cty = item.row?.Ten_cong_ty || item.row?.Ten_khach_hang || ''
            return cty ? `${item.label} — ${cty}` : item.label
          },
          label: (ctx: any) => {
            const dsLabel = ctx.dataset?.label || ''
            if (ratio) return ` ${dsLabel}: ${pctFmt(ctx.raw)}`
            return ` ${dsLabel}: ${fmt(Math.round(ctx.raw))} đ`
          },
          afterBody: (tooltipItems: any[]) => {
            if (!tooltipItems || !tooltipItems.length) return []
            const idx = tooltipItems[0].dataIndex
            const r = items[idx]?.row
            if (!r) return []
            const lines: string[] = []
            if (r.so_hop_dong) lines.push(`Số HĐ: ${r.so_hop_dong}`)
            if (r.So_PO) lines.push(`Mã PO: ${r.So_PO}`)
            if (r.Ten_nha_cung_cap) lines.push(`NCC: ${r.Ten_nha_cung_cap}`)
            return lines
          }
        }
      },
      datalabels: {
        labels: {
          value: {
            color: isLight ? '#0f172a' : '#ffffff',
            anchor: 'end',
            align: horiz ? 'end' : 'top',
            offset: horiz ? 6 : ratio || isTriple ? 4 : 18,
            textAlign: horiz ? ('left' as const) : ('center' as const),
            font: { weight: 'bold', size: horiz ? 10 : isTriple ? 10 : 11 },
            formatter: (val: number, ctx: any) => {
              if (ctx?.dataset?.type === 'line') return ''
              if (ratio) return pctFmt(val)
              let shortVal = fmt(val)
              if (Math.abs(val) >= 1e9) shortVal = (val / 1e9).toFixed(2) + ' Tỷ'
              else if (Math.abs(val) >= 1e6) shortVal = (val / 1e6).toFixed(1) + ' Tr'
              if (horiz && total && !isTriple) {
                const p = (val / total) * 100
                return [shortVal, `(${p.toFixed(1)}%)`]
              }
              return shortVal
            },
            textShadowBlur: isLight ? 0 : 4,
            textShadowColor: 'rgba(0,0,0,0.5)'
          },
          percent: {
            display: !horiz && !isTriple && !ratio,
            color: isLight ? '#059669' : '#34d399',
            anchor: 'end',
            align: 'top',
            offset: 3,
            font: { weight: 'bold', size: 10.5 },
            formatter: (val: number, ctx: any) => {
              if (ctx?.dataset?.type === 'line') return ''
              if (ratio || !total) return ''
              const p = (val / total) * 100
              return `${p.toFixed(1)}%`
            },
            textShadowBlur: isLight ? 0 : 4,
            textShadowColor: 'rgba(0,0,0,0.5)'
          }
        }
      }
    }
  }
})
</script>

<style scoped>
/* Overlay & Base Modal Shell (100% SaleReportFirebase Craft Compare Parity) */
.sr-modal-overlay.qlbg-cmp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10010;
  animation: qlbgCmpFadeIn 0.2s ease;
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
}

.sr-modal-overlay.qlbg-cmp-overlay * {
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
}

@keyframes qlbgCmpFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sr-analytics-modal,
.sr-analytics-modal *,
.sr-analytics-modal *::before,
.sr-analytics-modal *::after {
  box-sizing: border-box !important;
}

.sr-analytics-modal {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0 !important;
  background: linear-gradient(180deg, rgba(6, 20, 18, 0.99) 0%, rgba(4, 13, 18, 1) 100%);
  border: none;
  box-shadow: none;
  color: #f1f5f9;
}

.sr-analytics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 20px;
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.88) 0%, rgba(37, 99, 235, 0.72) 55%, rgba(15, 23, 42, 0.98) 100%);
  border-bottom: 1px solid rgba(56, 189, 248, 0.45);
  flex-shrink: 0;
}

.sr-analytics-header-left {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.sr-analytics-back-btn {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(52, 211, 153, 0.42);
  color: #34d399;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.18s ease;
}
.sr-analytics-back-btn:hover {
  background: rgba(16, 185, 129, 0.28);
  transform: translateX(-1px);
}

.sr-analytics-header-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.24) 0%, rgba(2, 132, 199, 0.14) 100%);
  border: 1px solid rgba(56, 189, 248, 0.48);
  color: #7dd3fc;
  flex-shrink: 0;
}

.sr-analytics-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.sr-analytics-title-row {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.sr-analytics-title {
  margin: 0;
  font-size: 16.5px;
  font-weight: 800;
  color: #ecfdf5;
  letter-spacing: -0.01em;
}

.sr-analytics-po-badge {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #cbd5e1;
}

.sr-analytics-sub {
  margin: 0;
  font-size: 12px;
  color: #cbd5e1;
}

.sr-ccm-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}
.sr-ccm-tool-btn.is-clone {
  background: rgba(2, 132, 199, 0.2);
  border-color: rgba(56, 189, 248, 0.45);
  color: #38bdf8;
}
.sr-ccm-tool-btn.is-clone:hover {
  background: rgba(2, 132, 199, 0.35);
  color: #ffffff;
}

.sr-add-choice-close {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(15, 23, 42, 0.28);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
}
.sr-add-choice-close:hover {
  border-color: #fecaca;
  color: #ffffff;
  background: rgba(239, 68, 68, 0.45);
}

/* Split Shell */
.sr-analytics-split-shell {
  flex: 1;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}
.sr-analytics-split-shell.is-sidebar-collapsed {
  grid-template-columns: minmax(0, 1fr) !important;
}
.sr-analytics-split-shell.is-sidebar-collapsed .sr-analytics-sidebar {
  display: none !important;
}

.sr-analytics-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 14px 14px 20px;
  background: rgba(5, 16, 20, 0.92);
  border-right: 1px solid rgba(16, 185, 129, 0.2);
  overflow-y: auto;
  min-height: 0;
}

.sr-analytics-side-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sr-analytics-price-mode-bar {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 4px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(52, 211, 153, 0.24);
  margin-bottom: 2px;
}

.sr-analytics-price-mode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 31px;
  padding: 5px 8px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: all 0.16s ease;
}
.sr-analytics-price-mode-btn:hover {
  color: #ecfdf5;
  background: rgba(16, 185, 129, 0.12);
}
.sr-analytics-price-mode-btn.active {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: rgba(125, 211, 252, 0.5);
  color: #ffffff;
  box-shadow: 0 3px 10px -2px rgba(2, 132, 199, 0.45);
}
.sr-analytics-price-mode-btn.is-khach.active {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: rgba(110, 231, 183, 0.5);
  color: #ffffff;
  box-shadow: 0 3px 10px -2px rgba(16, 185, 129, 0.45);
}

.sr-analytics-side-heading {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #34d399;
  padding: 0 2px;
}
.sr-analytics-side-heading.is-with-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sr-analytics-side-collapse-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.65);
  color: #cbd5e1;
  transition: all 0.15s ease;
}
.sr-analytics-side-collapse-btn:hover {
  border-color: #38bdf8;
  color: #7dd3fc;
  background: rgba(2, 132, 199, 0.18);
}

.sr-analytics-metric-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.sr-analytics-metric-chip {
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.72);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all 0.16s ease;
  text-align: left;
}
.sr-analytics-metric-chip:hover {
  border-color: rgba(52, 211, 153, 0.45);
  color: #ecfdf5;
  background: rgba(16, 185, 129, 0.12);
}
.sr-analytics-metric-chip.active {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #34d399;
  color: #ffffff;
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.45);
}

/* 4 Mini-KPI Summary Cards */
.sr-analytics-kpi-grid {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.sr-analytics-kpi-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.18);
  min-width: 0;
}

.sr-analytics-kpi-card.is-amber,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(1),
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(3) {
  border: 1.5px solid rgba(52, 211, 153, 0.48) !important;
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.38) 0%, rgba(15, 23, 42, 0.86) 100%) !important;
}
.sr-analytics-kpi-card.is-amber .sr-analytics-kpi-label,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(1) .sr-analytics-kpi-label,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(3) .sr-analytics-kpi-label {
  color: #6ee7b7 !important;
}
.sr-analytics-kpi-card.is-amber .sr-analytics-kpi-val,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(1) .sr-analytics-kpi-val,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(3) .sr-analytics-kpi-val {
  color: #34d399 !important;
}

.sr-analytics-kpi-card.is-blue,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(2),
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(4) {
  border: 1.5px solid rgba(56, 189, 248, 0.48) !important;
  background: linear-gradient(135deg, rgba(12, 74, 110, 0.38) 0%, rgba(15, 23, 42, 0.86) 100%) !important;
}
.sr-analytics-kpi-card.is-blue .sr-analytics-kpi-label,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(2) .sr-analytics-kpi-label,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(4) .sr-analytics-kpi-label {
  color: #7dd3fc !important;
}
.sr-analytics-kpi-card.is-blue .sr-analytics-kpi-val,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(2) .sr-analytics-kpi-val,
.sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(4) .sr-analytics-kpi-val {
  color: #38bdf8 !important;
}

.sr-analytics-kpi-label {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.sr-analytics-kpi-val {
  font-size: 16px;
  font-weight: 800;
  color: #ecfdf5;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sr-analytics-kpi-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Main Right Column & Toolbar */
.sr-analytics-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.sr-analytics-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 22px;
  background: rgba(9, 24, 28, 0.9);
  border-bottom: 1px solid rgba(16, 185, 129, 0.18);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.sr-analytics-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sr-analytics-sidebar-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 11px;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px dashed rgba(148, 163, 184, 0.42);
  background: rgba(15, 23, 42, 0.68);
  color: #cbd5e1;
  transition: all 0.16s ease;
}
.sr-analytics-sidebar-toggle-btn:hover,
.sr-analytics-sidebar-toggle-btn.is-collapsed {
  border-style: solid;
  border-color: #38bdf8;
  color: #7dd3fc;
  background: rgba(2, 132, 199, 0.22);
}

.sr-analytics-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 13px;
  border-radius: 9px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.65);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
}
.sr-analytics-tab-btn:hover {
  border-color: rgba(52, 211, 153, 0.45);
  color: #ecfdf5;
}
.sr-analytics-tab-btn.active {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #34d399;
  box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.25);
}

.sr-analytics-controls {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.sr-analytics-ctrl-group {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 6px;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.sr-analytics-ctrl-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  padding: 0 5px;
}

.sr-analytics-seg-btn {
  height: 26px;
  padding: 0 9px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #cbd5e1;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sr-analytics-seg-btn:hover {
  color: #ffffff;
  background: rgba(148, 163, 184, 0.12);
}
.sr-analytics-seg-btn.active {
  background: #10b981;
  color: #042f2e;
  font-weight: 800;
}

/* Body & Charts */
.sr-analytics-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 22px 22px;
}
.sr-analytics-body.is-matrix-body {
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow: hidden !important;
}
.sr-analytics-body.is-matrix-body .sr-analytics-ranking-workspace {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  width: 100% !important;
  height: 100% !important;
  gap: 0 !important;
}

.sr-ccm-empty {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.sr-analytics-ranking-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sr-analytics-charts-row {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}

.sr-analytics-doughnut-card,
.sr-analytics-bar-card,
.sr-analytics-table-card {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.68);
  border: 1px solid rgba(16, 185, 129, 0.2);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.sr-analytics-bar-card:only-child {
  grid-column: 1 / -1;
}

.sr-analytics-panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.sr-analytics-panel-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 800;
  color: #ecfdf5;
}
.sr-analytics-panel-sub {
  font-size: 11px;
  color: #94a3b8;
}

.sr-analytics-doughnut-wrap {
  height: 360px;
  width: 100%;
  position: relative;
}

.sr-analytics-bar-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 6px;
}

/* Ranking Table */
.sr-analytics-table-scroll {
  max-height: 340px;
  overflow-y: auto;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
}
.sr-analytics-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.sr-analytics-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgba(6, 24, 24, 0.96);
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(16, 185, 129, 0.24);
}
.sr-analytics-table tbody tr {
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  transition: background 0.14s ease;
}
.sr-analytics-table tbody tr:hover {
  background: rgba(16, 185, 129, 0.08);
}
.sr-analytics-table td {
  padding: 9px 12px;
  color: #e2e8f0;
  vertical-align: middle;
}

.qlbg-mob-cell-lbl {
  display: none;
}

.sr-rank-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 26px !important;
  height: 26px !important;
  min-width: 26px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  border: none !important;
  font-size: 11.5px !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  color: #ffffff !important;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3) !important;
}
.sr-rank-badge.is-top1 {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  box-shadow: 0 2px 7px rgba(245, 158, 11, 0.42) !important;
}
.sr-rank-badge.is-top2 {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%) !important;
  box-shadow: 0 2px 7px rgba(100, 116, 139, 0.38) !important;
}
.sr-rank-badge.is-top3 {
  background: linear-gradient(135deg, #d97706 0%, #92400e 100%) !important;
  box-shadow: 0 2px 7px rgba(180, 83, 9, 0.38) !important;
}

.sr-rank-name {
  font-weight: 700;
  color: #f8fafc;
  max-width: 340px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sr-rank-val {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.text-green { color: #34d399; }
.text-red { color: #f87171; }

.sr-rank-share-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sr-rank-share-bar {
  flex: 1;
  height: 7px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  overflow: hidden;
}
.sr-rank-share-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}
.sr-rank-share-text {
  width: 44px;
  text-align: right;
  font-size: 11.5px;
  font-weight: 700;
  color: #cbd5e1;
  font-variant-numeric: tabular-nums;
}

/* Matrix Table (Clean Sheet Mode-Craft Ocean Blue Dark / Emerald Green Light) */
.sr-analytics-table-card.is-matrix-full-card {
  width: 100% !important;
  max-width: 100% !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  height: 100% !important;
  padding: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  overflow: hidden !important;
}
.sr-analytics-table-scroll.is-matrix-full-scroll {
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  border: none !important;
  border-radius: 0 !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
}

.sr-ccm-table {
  width: 100% !important;
  min-width: max-content !important;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12.5px;
  color: #f1f5f9;
  background: #0b1626;
}
.sr-ccm-table th,
.sr-ccm-table td {
  padding: 7px 14px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.16);
  border-right: 1px solid rgba(56, 189, 248, 0.14);
  vertical-align: middle;
  background: #0b1626;
  transition: background-color 0.14s ease;
}
.sr-ccm-table tbody tr:hover td {
  background: #132238;
}
.sr-ccm-table thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background: linear-gradient(90deg, #0c4a6e 0%, #1e3a8a 55%, #0f172a 100%) !important;
  border-bottom: 1.5px solid rgba(56, 189, 248, 0.55) !important;
  padding: 6px 8px !important;
}
.sr-ccm-sticky-col {
  position: sticky;
  left: 0;
  z-index: 8 !important;
  background: #0b1626;
  border-right: 2px solid rgba(148, 163, 184, 0.32) !important;
  box-shadow: 4px 0 10px -2px rgba(2, 6, 23, 0.45);
}
.sr-ccm-table thead th.sr-ccm-sticky-col {
  z-index: 14 !important;
  box-shadow: 4px 0 10px -2px rgba(2, 6, 23, 0.5);
}
.sr-ccm-table td.sr-ccm-sticky-col:not(.is-baseline-col) {
  background: #0b1626 !important;
}

.sr-ccm-table.is-columns-layout {
  table-layout: fixed !important;
  width: 100% !important;
  min-width: calc(195px + var(--ccm-opt-count, 1) * 220px) !important;
}
.sr-ccm-table.is-columns-layout th,
.sr-ccm-table.is-columns-layout td {
  padding: 6px 14px !important;
}
.sr-ccm-table.is-columns-layout td.sr-ccm-val-td,
.sr-ccm-table.is-columns-layout td.sr-ccm-metric-td {
  vertical-align: top !important;
}
.sr-ccm-table.is-columns-layout col.sr-ccm-col-sticky,
.sr-ccm-table.is-columns-layout .sr-ccm-sticky-col {
  width: 195px !important;
  min-width: 195px !important;
  max-width: 195px !important;
}
.sr-ccm-table.is-columns-layout col.sr-ccm-col-option,
.sr-ccm-table.is-columns-layout .sr-ccm-option-th,
.sr-ccm-table.is-columns-layout .sr-ccm-val-td,
.sr-ccm-table.is-columns-layout .sr-ccm-foot-act-td {
  width: calc((100% - 195px) / var(--ccm-opt-count, 1)) !important;
  min-width: 220px !important;
  max-width: none !important;
}

.sr-ccm-table.is-rows-layout {
  table-layout: fixed !important;
  width: 100% !important;
  min-width: calc(210px + 185px + var(--ccm-metric-count, 13) * 140px) !important;
}
.sr-ccm-table.is-rows-layout th,
.sr-ccm-table.is-rows-layout td {
  padding: 6px 10px !important;
}
.sr-ccm-table.is-rows-layout td.sr-ccm-val-td,
.sr-ccm-table.is-rows-layout td.sr-ccm-row-opt-td,
.sr-ccm-table.is-rows-layout td.sr-ccm-row-actions-td {
  vertical-align: middle !important;
}
.sr-ccm-table.is-rows-layout col.sr-ccm-col-row-sticky,
.sr-ccm-table.is-rows-layout .sr-ccm-sticky-col {
  width: 210px !important;
  min-width: 210px !important;
  max-width: 210px !important;
}
.sr-ccm-table.is-rows-layout col.sr-ccm-col-row-metric,
.sr-ccm-table.is-rows-layout .sr-ccm-row-metric-th,
.sr-ccm-table.is-rows-layout .sr-ccm-val-td {
  width: calc((100% - 210px - 185px) / var(--ccm-metric-count, 13)) !important;
  min-width: 140px !important;
  max-width: none !important;
}
.sr-ccm-table.is-rows-layout col.sr-ccm-col-row-actions,
.sr-ccm-table.is-rows-layout .sr-ccm-row-actions-th,
.sr-ccm-table.is-rows-layout .sr-ccm-row-actions-td {
  width: 185px !important;
  min-width: 185px !important;
  max-width: 185px !important;
}
.sr-ccm-table.is-rows-layout .sr-ccm-delta-text {
  display: inline-flex !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  gap: 1px !important;
  line-height: 1.18 !important;
}
.sr-ccm-table.is-rows-layout .sr-ccm-delta-part {
  display: block !important;
  white-space: nowrap !important;
}
.sr-ccm-table.is-rows-layout .sr-ccm-delta-part.is-pct-part {
  margin-left: 0 !important;
  font-size: 10px !important;
  opacity: 0.92;
}

.sr-ccm-corner-head {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
}
.sr-ccm-corner-head span {
  font-size: 11px !important;
  font-weight: 800;
  line-height: 1.2 !important;
  letter-spacing: 0.02em !important;
  color: #f8fafc;
}

.sr-ccm-option-th {
  text-align: left;
}
.sr-ccm-opt-head {
  display: flex;
  flex-direction: column;
  gap: 2px !important;
}
.sr-ccm-opt-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.sr-ccm-opt-num {
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: 0.03em !important;
  padding: 2px 7px !important;
  border-radius: 5px !important;
  background: rgba(2, 132, 199, 0.28) !important;
  border: 1px solid rgba(56, 189, 248, 0.55) !important;
  color: #7dd3fc !important;
}
.sr-ccm-base-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px !important;
  border-radius: 5px;
  font-size: 9.5px !important;
  font-weight: 700;
  cursor: pointer;
  border: 1px dashed rgba(148, 163, 184, 0.48);
  background: rgba(15, 23, 42, 0.55);
  color: #cbd5e1;
  transition: all 0.15s ease;
}
.sr-ccm-base-btn:hover {
  border-style: solid;
  border-color: #38bdf8;
  color: #7dd3fc;
  background: rgba(2, 132, 199, 0.2);
}
.sr-ccm-base-btn.is-active {
  border-style: solid;
  border-color: #38bdf8;
  background: #0284c7;
  color: #ffffff;
}
.sr-ccm-opt-rm {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.sr-ccm-opt-rm:hover {
  background: rgba(239, 68, 68, 0.16);
  color: #ef4444;
}

.sr-ccm-opt-po {
  font-size: 12px !important;
  font-weight: 800;
  line-height: 1.25 !important;
  color: #f8fafc;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}
.sr-ccm-opt-cust {
  font-size: 10.5px !important;
  font-weight: 500;
  line-height: 1.2 !important;
  color: #94a3b8;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Baseline Column Shading - Dark Mode Craft */
.sr-ccm-table th.is-baseline-col {
  background: linear-gradient(135deg, #075985 0%, #1e40af 100%) !important;
  border-bottom: 2px solid #38bdf8 !important;
}
.sr-ccm-table td.is-baseline-col {
  background: #0c2540 !important;
}

/* Section Banners */
.sr-ccm-section-banner .sr-ccm-section-td {
  padding: 4px 11px !important;
  font-size: 10.5px !important;
  font-weight: 800 !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase;
  border-top: 1px solid rgba(56, 189, 248, 0.3) !important;
  border-bottom: 1px solid rgba(56, 189, 248, 0.3) !important;
  background: #0c3554 !important;
  color: #7dd3fc !important;
}
.sr-ccm-sec-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 7px;
  vertical-align: middle;
}
.sr-ccm-sec-dot.is-rev { background: #0284c7; }
.sr-ccm-sec-dot.is-com { background: #f59e0b; }
.sr-ccm-sec-dot.is-profit { background: #10b981; }

.sr-ccm-table.is-rows-layout th.sr-ccm-row-group-th {
  text-align: center !important;
  font-size: 10px !important;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 4px 8px !important;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  border-left: 1px solid rgba(148, 163, 184, 0.18);
  border-right: 1px solid rgba(148, 163, 184, 0.18);
}
.sr-ccm-table.is-rows-layout th.sr-ccm-row-group-th.is-sec-rev {
  background: #0c243d !important;
  color: #38bdf8;
}
.sr-ccm-table.is-rows-layout th.sr-ccm-row-group-th.is-sec-com {
  background: #291f0c !important;
  color: #fbbf24;
}
.sr-ccm-table.is-rows-layout th.sr-ccm-row-group-th.is-sec-profit {
  background: #0b2922 !important;
  color: #34d399;
}

.sr-ccm-m-label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sr-ccm-m-label strong {
  color: #f1f5f9;
  font-weight: 700;
  font-size: 12px;
}
.sr-ccm-m-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #64748b;
  flex-shrink: 0;
}
.sr-ccm-m-dot.is-rev { background: #0284c7; }
.sr-ccm-m-dot.is-cost { background: #f59e0b; }
.sr-ccm-m-dot.is-com { background: #f59e0b; }
.sr-ccm-m-dot.is-profit { background: #10b981; }
.sr-ccm-m-dot.is-ratio { background: #0284c7; }

.sr-ccm-table tr.is-highlight-row td:not(.is-baseline-col) {
  background: #132036;
}
.sr-ccm-table tr.is-highlight-row .sr-ccm-m-label strong {
  font-weight: 800;
  color: #ffffff;
}
.sr-ccm-table tr.is-active-chart-metric td {
  background: #122b47 !important;
}
.sr-ccm-val-td.is-best-cell {
  background: rgba(16, 185, 129, 0.14) !important;
}

.sr-ccm-cell-main {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-height: 18px;
  line-height: 1.25 !important;
}
.sr-ccm-cell-val {
  font-weight: 700;
  font-size: 12.5px;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
  color: #f8fafc;
}
.sr-ccm-cell-val.is-best-val {
  font-weight: 800;
  color: #34d399;
}
.sr-ccm-cell-val.is-neg-val {
  color: #f87171;
}

.sr-ccm-delta-row {
  margin-top: 2px !important;
  line-height: 1.15 !important;
  text-align: right;
}
.sr-ccm-delta-text {
  font-size: 10.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.sr-ccm-delta-text.is-good { color: #34d399; }
.sr-ccm-delta-text.is-bad { color: #f87171; }
.sr-ccm-delta-text.is-flat,
.sr-ccm-delta-text.is-neutral { color: #94a3b8; }
.sr-ccm-delta-part.is-pct-part { margin-left: 3px; }

/* Action Buttons */
.sr-ccm-opt-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.sr-ccm-opt-actions.is-right-aligned {
  justify-content: flex-end;
}
.sr-ccm-act-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  line-height: 1 !important;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #1e293b;
  color: #f1f5f9;
  transition: all 0.15s ease;
}
.sr-ccm-act-btn:hover:not(:disabled) {
  border-color: #38bdf8;
  color: #38bdf8;
}
.sr-ccm-act-btn.is-icon-only {
  width: 28px !important;
  height: 26px !important;
  padding: 0 !important;
}
.sr-ccm-act-btn.is-chot {
  height: 26px !important;
  padding: 0 9px !important;
  font-weight: 800 !important;
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  border-color: #10b981 !important;
  color: #ffffff !important;
}
.sr-ccm-act-btn.is-chot:hover:not(:disabled) {
  filter: brightness(1.08);
  color: #ffffff !important;
}
.sr-ccm-act-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.sr-ccm-footer-actions-row td {
  background: #162235 !important;
  border-top: 2px solid rgba(148, 163, 184, 0.32);
  padding: 6px 11px !important;
}

/* =========================================================================
   LIGHT BLUE MODE (.sr-analytics-modal.is-light.mode-craft) — EMERALD HEADER/MATRIX + SKY BLUE KPI
   ========================================================================= */
.sr-analytics-modal.is-light {
  background: #f8fafc;
  color: #0f172a;
}
.sr-analytics-modal.is-light.mode-craft .sr-analytics-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 55%, #047857 100%) !important;
  border-bottom: 1.5px solid #34d399 !important;
}
.sr-analytics-modal.is-light .sr-analytics-back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
}
.sr-analytics-modal.is-light .sr-analytics-back-btn:hover {
  background: rgba(255, 255, 255, 0.32);
}
.sr-analytics-modal.is-light .sr-analytics-header-icon {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}
.sr-analytics-modal.is-light .sr-analytics-title { color: #ffffff; }
.sr-analytics-modal.is-light .sr-analytics-po-badge {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}
.sr-analytics-modal.is-light .sr-analytics-sub { color: rgba(255, 255, 255, 0.88); }
.sr-analytics-modal.is-light .sr-ccm-tool-btn.is-clone {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.42);
  color: #ffffff;
}
.sr-analytics-modal.is-light .sr-analytics-sidebar {
  background: #f0f9ff;
  border-right-color: #bae6fd;
}
.sr-analytics-modal.is-light .sr-analytics-side-heading { color: #0284c7; }
.sr-analytics-modal.is-light .sr-analytics-side-collapse-btn {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}
.sr-analytics-modal.is-light.mode-craft .sr-analytics-side-collapse-btn:hover {
  border-color: #059669;
  color: #047857;
  background: #d1fae5;
}
.sr-analytics-modal.is-light .sr-analytics-price-mode-bar {
  background: #e0f2fe;
  border-color: #bae6fd;
}
.sr-analytics-modal.is-light .sr-analytics-price-mode-btn { color: #475569; }
.sr-analytics-modal.is-light .sr-analytics-price-mode-btn:hover {
  color: #0284c7;
  background: rgba(255, 255, 255, 0.65);
}
.sr-analytics-modal.is-light .sr-analytics-price-mode-btn.active {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #0284c7;
  color: #ffffff;
  box-shadow: 0 3px 10px -2px rgba(37, 99, 235, 0.32);
}
.sr-analytics-modal.is-light .sr-analytics-price-mode-btn.is-khach.active {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #059669;
  color: #ffffff;
  box-shadow: 0 3px 10px -2px rgba(5, 150, 105, 0.32);
}
.sr-analytics-modal.is-light .sr-analytics-metric-chip {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #334155;
}
.sr-analytics-modal.is-light .sr-analytics-metric-chip:hover {
  border-color: #38bdf8;
  color: #0284c7;
  background: #e0f2fe;
}
.sr-analytics-modal.is-light .sr-analytics-metric-chip.active {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #0284c7;
  color: #ffffff;
  box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.35);
}

/* Light Mode 4 Summary KPI Cards */
.sr-analytics-modal.is-light .sr-analytics-kpi-card.is-amber,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(1),
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(3) {
  border: 1.5px solid #059669 !important;
  background: linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%) !important;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.08) !important;
}
.sr-analytics-modal.is-light .sr-analytics-kpi-card.is-amber .sr-analytics-kpi-label,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(1) .sr-analytics-kpi-label,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(3) .sr-analytics-kpi-label {
  color: #047857 !important;
}
.sr-analytics-modal.is-light .sr-analytics-kpi-card.is-amber .sr-analytics-kpi-val,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(1) .sr-analytics-kpi-val,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(3) .sr-analytics-kpi-val {
  color: #059669 !important;
}
.sr-analytics-modal.is-light .sr-analytics-kpi-card.is-blue,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(2),
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(4) {
  border: 1.5px solid #0284c7 !important;
  background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%) !important;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.08) !important;
}
.sr-analytics-modal.is-light .sr-analytics-kpi-card.is-blue .sr-analytics-kpi-label,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(2) .sr-analytics-kpi-label,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(4) .sr-analytics-kpi-label {
  color: #0369a1 !important;
}
.sr-analytics-modal.is-light .sr-analytics-kpi-card.is-blue .sr-analytics-kpi-val,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(2) .sr-analytics-kpi-val,
.sr-analytics-modal.is-light .sr-analytics-kpi-grid > .sr-analytics-kpi-card:nth-child(4) .sr-analytics-kpi-val {
  color: #0284c7 !important;
}
.sr-analytics-modal.is-light .sr-analytics-kpi-sub { color: #475569 !important; }

/* Light Toolbar & Panels */
.sr-analytics-modal.is-light .sr-analytics-toolbar {
  background: #f1f5f9;
  border-bottom-color: #cbd5e1;
}
.sr-analytics-modal.is-light .sr-analytics-sidebar-toggle-btn {
  background: #ffffff;
  border-color: #94a3b8;
  color: #334155;
}
.sr-analytics-modal.is-light.mode-craft .sr-analytics-sidebar-toggle-btn:hover,
.sr-analytics-modal.is-light.mode-craft .sr-analytics-sidebar-toggle-btn.is-collapsed {
  border-style: solid;
  border-color: #059669;
  color: #047857;
  background: #d1fae5;
}
.sr-analytics-modal.is-light .sr-analytics-tab-btn {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}
.sr-analytics-modal.is-light .sr-analytics-tab-btn:hover {
  border-color: #38bdf8;
  color: #0284c7;
}
.sr-analytics-modal.is-light .sr-analytics-tab-btn.active {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #0369a1;
  box-shadow: inset 0 0 0 1px rgba(2, 132, 199, 0.2);
}
.sr-analytics-modal.is-light .sr-analytics-ctrl-group {
  background: #ffffff;
  border-color: #cbd5e1;
}
.sr-analytics-modal.is-light .sr-analytics-ctrl-label { color: #64748b; }
.sr-analytics-modal.is-light .sr-analytics-seg-btn { color: #475569; }
.sr-analytics-modal.is-light .sr-analytics-seg-btn:hover { color: #0f172a; background: #f1f5f9; }
.sr-analytics-modal.is-light .sr-analytics-seg-btn.active { background: #0284c7; color: #ffffff; }

.sr-analytics-modal.is-light .sr-analytics-doughnut-card,
.sr-analytics-modal.is-light .sr-analytics-bar-card,
.sr-analytics-modal.is-light .sr-analytics-table-card {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
}
.sr-analytics-modal.is-light .sr-analytics-panel-title { color: #0f172a; }
.sr-analytics-modal.is-light .sr-analytics-panel-sub { color: #64748b; }
.sr-analytics-modal.is-light .sr-analytics-table-scroll { border-color: #e2e8f0; }
.sr-analytics-modal.is-light .sr-analytics-table thead th {
  background: #f0f9ff;
  color: #0369a1;
  border-bottom-color: #bae6fd;
}
.sr-analytics-modal.is-light .sr-analytics-table tbody tr { border-bottom-color: #f1f5f9; }
.sr-analytics-modal.is-light .sr-analytics-table tbody tr:hover { background: #f0f9ff; }
.sr-analytics-modal.is-light .sr-analytics-table td { color: #1e293b; }
.sr-analytics-modal.is-light .sr-rank-name { color: #0f172a; }
.sr-analytics-modal.is-light .text-green { color: #059669; }
.sr-analytics-modal.is-light .text-red { color: #dc2626; }
.sr-analytics-modal.is-light .sr-rank-share-bar { background: #e2e8f0; }
.sr-analytics-modal.is-light .sr-rank-share-fill { background: linear-gradient(90deg, #0284c7 0%, #38bdf8 100%); }
.sr-analytics-modal.is-light .sr-rank-share-text { color: #334155; }

/* Light Mode Craft Matrix */
.sr-analytics-modal.is-light .sr-ccm-table {
  color: #0f172a;
  background: #ffffff;
}
.sr-analytics-modal.is-light.mode-craft .sr-ccm-table th,
.sr-analytics-modal.is-light.mode-craft .sr-ccm-table td {
  border-bottom-color: #d1fae5;
  border-right-color: #d1fae5;
  background: #ffffff;
}
.sr-analytics-modal.is-light .sr-ccm-table tbody tr:hover td { background: #f8fafc; }
.sr-analytics-modal.is-light.mode-craft .sr-ccm-table thead th {
  background: linear-gradient(90deg, #bbf7d0 0%, #d1fae5 55%, #ecfdf5 100%) !important;
  border-bottom: 1.5px solid #34d399 !important;
}
.sr-analytics-modal.is-light.mode-craft .sr-ccm-table .sr-ccm-sticky-col {
  border-right-color: #6ee7b7 !important;
  box-shadow: 4px 0 10px -2px rgba(15, 23, 42, 0.08);
}
.sr-analytics-modal.is-light .sr-ccm-table td.sr-ccm-sticky-col:not(.is-baseline-col) {
  background: #ffffff !important;
}
.sr-analytics-modal.is-light .sr-ccm-corner-head span { color: #0f172a; }
.sr-analytics-modal.is-light.mode-craft .sr-ccm-opt-num {
  background: #059669 !important;
  border-color: #047857 !important;
  color: #ffffff !important;
}
.sr-analytics-modal.is-light.mode-craft .sr-ccm-base-btn {
  background: rgba(255, 255, 255, 0.92);
  border-color: #6ee7b7;
  color: #047857;
}
.sr-analytics-modal.is-light.mode-craft .sr-ccm-base-btn:hover {
  border-color: #059669;
  background: #d1fae5;
  color: #047857;
}
.sr-analytics-modal.is-light.mode-craft .sr-ccm-base-btn.is-active {
  border-color: #047857;
  background: #059669;
  color: #ffffff;
}
.sr-analytics-modal.is-light .sr-ccm-opt-po { color: #0f172a; }
.sr-analytics-modal.is-light .sr-ccm-opt-cust { color: #475569; }
.sr-analytics-modal.is-light.mode-craft .sr-ccm-table th.is-baseline-col {
  background: linear-gradient(135deg, #6ee7b7 0%, #a7f3d0 100%) !important;
  border-bottom: 2px solid #059669 !important;
}
.sr-analytics-modal.is-light.mode-craft .sr-ccm-table td.is-baseline-col {
  background: #d1fae5 !important;
}
.sr-analytics-modal.is-light.mode-craft .sr-ccm-section-banner .sr-ccm-section-td {
  background: #ecfdf5 !important;
  color: #047857 !important;
  border-top-color: #a7f3d0 !important;
  border-bottom-color: #a7f3d0 !important;
}
.sr-analytics-modal.is-light .sr-ccm-table.is-rows-layout th.sr-ccm-row-group-th { border-color: #cbd5e1; }
.sr-analytics-modal.is-light .sr-ccm-table.is-rows-layout th.sr-ccm-row-group-th.is-sec-rev {
  background: #e0f2fe !important;
  color: #0369a1;
}
.sr-analytics-modal.is-light .sr-ccm-table.is-rows-layout th.sr-ccm-row-group-th.is-sec-com {
  background: #fef3c7 !important;
  color: #b45309;
}
.sr-analytics-modal.is-light .sr-ccm-table.is-rows-layout th.sr-ccm-row-group-th.is-sec-profit {
  background: #d1fae5 !important;
  color: #047857;
}
.sr-analytics-modal.is-light .sr-ccm-m-label strong { color: #1e293b; }
.sr-analytics-modal.is-light .sr-ccm-table tr.is-highlight-row td:not(.is-baseline-col) { background: #f8fafc; }
.sr-analytics-modal.is-light .sr-ccm-table tr.is-highlight-row .sr-ccm-m-label strong { color: #0f172a; }
.sr-analytics-modal.is-light .sr-ccm-table tr.is-active-chart-metric td { background: #e0f2fe !important; }
.sr-analytics-modal.is-light .sr-ccm-val-td.is-best-cell { background: #ecfdf5 !important; }
.sr-analytics-modal.is-light .sr-ccm-cell-val { color: #0f172a; }
.sr-analytics-modal.is-light .sr-ccm-cell-val.is-best-val { color: #047857; }
.sr-analytics-modal.is-light .sr-ccm-cell-val.is-neg-val { color: #dc2626; }
.sr-analytics-modal.is-light .sr-ccm-delta-text.is-good { color: #047857; }
.sr-analytics-modal.is-light .sr-ccm-delta-text.is-bad { color: #dc2626; }
.sr-analytics-modal.is-light .sr-ccm-delta-text.is-flat,
.sr-analytics-modal.is-light .sr-ccm-delta-text.is-neutral { color: #64748b; }
.sr-analytics-modal.is-light .sr-ccm-act-btn {
  background: #ffffff;
  color: #1e293b;
  border-color: #cbd5e1;
}
.sr-analytics-modal.is-light .sr-ccm-act-btn:hover:not(:disabled) {
  background: #f0f9ff;
  border-color: #0284c7;
  color: #0284c7;
}
.sr-analytics-modal.is-light.mode-craft .sr-ccm-footer-actions-row td {
  background: #f0fdf4 !important;
  border-top-color: #6ee7b7 !important;
}

/* Custom Scrollbar inside modal */
.custom-scrollbar::-webkit-scrollbar { width: 7px; height: 7px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.32);
  border-radius: 999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Mobile Dock (Hidden on Desktop) */
.sr-analytics-mobile-dock {
  display: none;
}

/* =========================================================================
   RESPONSIVE MOBILE <= 1080px & <= 768px
   ========================================================================= */
@media (max-width: 1080px) {
  .sr-analytics-sidebar-toggle-btn,
  .sr-analytics-side-collapse-btn {
    display: none !important;
  }

  .sr-analytics-split-shell {
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 0% !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    padding-bottom: calc(78px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .sr-analytics-charts-row {
    grid-template-columns: 1fr !important;
  }

  /* Tab 1: Metric & Prices */
  .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-sidebar {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 0% !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    border-right: none !important;
    padding: 14px 12px 28px !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-strip {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-chip {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    height: auto !important;
    min-height: 50px !important;
    padding: 10px 12px !important;
    border-radius: 12px !important;
    font-size: 12.5px !important;
    white-space: normal !important;
    border: 1.5px solid rgba(56, 189, 248, 0.42) !important;
    background: rgba(15, 23, 42, 0.82) !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-chip.is-com,
  .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-chip.is-margin {
    border-color: rgba(52, 211, 153, 0.45) !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-chip {
    background: #ffffff !important;
    color: #0f172a !important;
    border: 1.5px solid #0284c7 !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-chip.is-com,
  .sr-analytics-modal.is-light .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-chip.is-margin {
    border-color: #059669 !important;
    background: linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%) !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-chip.active {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
    border-color: #6ee7b7 !important;
    color: #ffffff !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-chip.active {
    background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;
    border-color: #0284c7 !important;
    color: #ffffff !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-metric-chip.active::after {
    content: "✓";
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.24);
    color: #ffffff;
    font-size: 11px;
    font-weight: 900;
    flex-shrink: 0;
  }
  .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-sidebar > .sr-analytics-side-section:nth-child(2),
  .sr-analytics-split-shell.mob-analytics-dock-metric .sr-analytics-main {
    display: none !important;
  }

  /* Tab 2: Group / View Mode */
  .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-sidebar {
    display: none !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-main {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 0% !important;
    width: 100% !important;
    overflow-y: auto !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-toolbar {
    padding: 14px 12px 28px !important;
    border-bottom: none !important;
    background: transparent !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-tabs {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-tab-btn {
    width: 100% !important;
    height: auto !important;
    min-height: 56px !important;
    padding: 12px 13px !important;
    border-radius: 13px !important;
    white-space: normal !important;
    text-align: left !important;
    border: 1.5px solid rgba(56, 189, 248, 0.38) !important;
    background: rgba(15, 23, 42, 0.82) !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-tab-btn {
    background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%) !important;
    border: 1.5px solid #0284c7 !important;
    color: #0f172a !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-tab-btn.active {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
    border-color: #6ee7b7 !important;
    color: #ffffff !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-tab-btn.active {
    background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;
    border-color: #0284c7 !important;
    color: #ffffff !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-controls,
  .sr-analytics-split-shell.mob-analytics-dock-group .sr-analytics-body {
    display: none !important;
  }

  /* Tab 3: Charts & Tables */
  .sr-analytics-split-shell.mob-analytics-dock-chart {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-sidebar {
    display: flex !important;
    flex: 0 0 auto !important;
    width: 100% !important;
    min-height: auto !important;
    overflow: visible !important;
    border-right: none !important;
    padding: 12px 12px 4px !important;
    background: transparent !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-sidebar > .sr-analytics-side-section:nth-child(1) {
    display: none !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-kpi-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 8px !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-main {
    flex: 0 0 auto !important;
    overflow: visible !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-toolbar {
    padding: 6px 12px !important;
    border-bottom: none !important;
    background: transparent !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-tabs {
    display: none !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-controls {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
    width: 100% !important;
    padding: 10px 11px !important;
    border-radius: 12px !important;
    background: rgba(15, 23, 42, 0.78) !important;
    border: 1.5px solid rgba(56, 189, 248, 0.35) !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-controls {
    background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%) !important;
    border: 1.5px solid #0284c7 !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-ctrl-group {
    flex-wrap: wrap !important;
    width: 100% !important;
  }
  .sr-analytics-split-shell.mob-analytics-dock-chart .sr-analytics-body {
    flex: 0 0 auto !important;
    overflow: visible !important;
    padding: 8px 12px 28px !important;
  }
  .sr-analytics-body.is-matrix-body {
    overflow: visible !important;
  }
  .sr-analytics-table-scroll.is-matrix-full-scroll {
    overflow-x: auto !important;
    overflow-y: visible !important;
  }

  .sr-analytics-bar-scroll {
    overflow-x: hidden !important;
  }
  .sr-analytics-bar-scroll .chart-wrapper-mobile {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    height: var(--mob-bar-h, 340px) !important;
    overflow-x: hidden !important;
  }

  /* Mobile Ranking Card View */
  .sr-analytics-table-scroll {
    overflow-x: visible !important;
    max-height: none !important;
    border: none !important;
  }
  .sr-analytics-table,
  .sr-analytics-table tbody {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    width: 100% !important;
  }
  .sr-analytics-table thead {
    display: none !important;
  }
  .sr-analytics-table tbody tr {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 8px 10px !important;
    padding: 12px 14px !important;
    border-radius: 14px !important;
    background: rgba(15, 23, 42, 0.85) !important;
    border: 1.5px solid rgba(56, 189, 248, 0.42) !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-table tbody tr {
    background: #ffffff !important;
    border: 2px solid #0284c7 !important;
  }
  .sr-analytics-table tbody td {
    display: block !important;
    padding: 0 !important;
    border: none !important;
    width: auto !important;
  }
  .sr-analytics-table tbody td:nth-child(1) { order: 1; }
  .sr-analytics-table tbody td.sr-rank-name {
    order: 2;
    flex: 1 1 calc(100% - 44px) !important;
    white-space: normal !important;
    word-break: break-word !important;
  }
  .qlbg-mob-cell-lbl {
    display: inline !important;
    font-size: 11px;
    font-weight: 600;
    opacity: 0.72;
  }
  .sr-analytics-table tbody td.qlbg-rk-col-dsb,
  .sr-analytics-table tbody td.qlbg-rk-col-com,
  .sr-analytics-table tbody td.qlbg-rk-col-margin {
    order: 3;
    flex: 1 1 calc(33% - 8px) !important;
    text-align: left !important;
    font-size: 12px !important;
  }
  .sr-analytics-table tbody td.qlbg-rk-col-active {
    order: 4;
    flex: 1 1 100% !important;
    text-align: left !important;
    font-size: 14px !important;
    padding: 6px 10px !important;
    border-radius: 9px !important;
    background: rgba(16, 185, 129, 0.12) !important;
    border: 1px solid rgba(52, 211, 153, 0.28) !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-table tbody td.qlbg-rk-col-active {
    background: #f0f9ff !important;
    border: 1px solid #bae6fd !important;
    color: #0369a1 !important;
  }
  .sr-analytics-table tbody td.qlbg-rk-col-share {
    order: 5;
    flex: 1 1 auto !important;
    min-width: 140px !important;
  }
  .sr-analytics-table tbody td.qlbg-rk-col-actions {
    order: 6;
    margin-left: auto !important;
  }

  /* Bottom Dock 3 Buttons */
  .sr-analytics-mobile-dock {
    position: fixed !important;
    left: 10px !important;
    right: 10px !important;
    bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
    z-index: 10012 !important;
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 6px !important;
    padding: 6px 8px !important;
    border-radius: 20px !important;
    background: rgba(8, 22, 18, 0.95) !important;
    border: 1px solid rgba(52, 211, 153, 0.36) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    box-shadow: 0 18px 40px -8px rgba(0, 0, 0, 0.72), 0 0 0 1px rgba(16, 185, 129, 0.16) !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-mobile-dock {
    background: rgba(255, 255, 255, 0.96) !important;
    border: 1.5px solid #bae6fd !important;
    box-shadow: 0 16px 36px -8px rgba(2, 132, 199, 0.24), 0 0 0 1px rgba(14, 165, 233, 0.14) !important;
  }
  .sr-analytics-dock-btn {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 3px !important;
    min-height: 48px !important;
    padding: 5px 6px !important;
    border-radius: 14px !important;
    border: 1px solid transparent !important;
    background: transparent !important;
    color: #94a3b8 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    cursor: pointer !important;
  }
  .sr-analytics-dock-btn.active {
    background: rgba(16, 185, 129, 0.18) !important;
    border-color: rgba(52, 211, 153, 0.42) !important;
    color: #34d399 !important;
  }
  .sr-analytics-modal.is-light .sr-analytics-dock-btn { color: #475569 !important; }
  .sr-analytics-modal.is-light .sr-analytics-dock-btn.active {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
    border-color: #38bdf8 !important;
    color: #ffffff !important;
  }
}

@media (max-width: 768px) {
  .sr-analytics-header .sr-analytics-header-icon,
  .sr-analytics-header .sr-ccm-tool-btn.is-clone {
    display: none !important;
  }
  .sr-ccm-table.is-columns-layout {
    min-width: calc(122px + var(--ccm-opt-count, 1) * 148px) !important;
  }
  .sr-ccm-table.is-columns-layout col.sr-ccm-col-sticky,
  .sr-ccm-table.is-columns-layout .sr-ccm-sticky-col {
    width: 122px !important;
    min-width: 122px !important;
    max-width: 122px !important;
  }
  .sr-ccm-table.is-columns-layout col.sr-ccm-col-option,
  .sr-ccm-table.is-columns-layout .sr-ccm-option-th,
  .sr-ccm-table.is-columns-layout .sr-ccm-val-td,
  .sr-ccm-table.is-columns-layout .sr-ccm-foot-act-td {
    width: calc((100% - 122px) / var(--ccm-opt-count, 1)) !important;
    min-width: 148px !important;
  }
  .sr-ccm-table.is-rows-layout {
    min-width: calc(130px + 145px + var(--ccm-metric-count, 13) * 115px) !important;
  }
  .sr-ccm-table.is-rows-layout col.sr-ccm-col-row-sticky,
  .sr-ccm-table.is-rows-layout .sr-ccm-sticky-col {
    width: 130px !important;
    min-width: 130px !important;
    max-width: 130px !important;
  }
  .sr-ccm-table.is-rows-layout col.sr-ccm-col-row-metric,
  .sr-ccm-table.is-rows-layout .sr-ccm-row-metric-th,
  .sr-ccm-table.is-rows-layout .sr-ccm-val-td {
    width: calc((100% - 130px - 145px) / var(--ccm-metric-count, 13)) !important;
    min-width: 115px !important;
  }
  .sr-ccm-table.is-rows-layout col.sr-ccm-col-row-actions,
  .sr-ccm-table.is-rows-layout .sr-ccm-row-actions-th,
  .sr-ccm-table.is-rows-layout .sr-ccm-row-actions-td {
    width: 145px !important;
    min-width: 145px !important;
    max-width: 145px !important;
  }
  .sr-ccm-table.is-columns-layout th,
  .sr-ccm-table.is-columns-layout td,
  .sr-ccm-table.is-rows-layout th,
  .sr-ccm-table.is-rows-layout td {
    padding: 5px 7px !important;
  }
}
</style>
