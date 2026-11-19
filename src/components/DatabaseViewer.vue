<template>
  <div class="db-viewer-container" :class="{ 'theme-light-blue': uiTheme === 'light' }">
    <!-- ═══════════════ TOP HEADER ═══════════════ -->
    <header class="db-header">
      <div class="db-header__top-row">
        <div class="db-header__left">
          <div class="db-header__icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          </div>
          <div class="db-header__text">
            <div class="db-header__title-row">
              <h1 class="db-header__title">Database Viewer</h1>
              <span class="db-header__pill tabular-nums">{{ availableNodes.length }} bảng</span>
            </div>
            <p class="db-header__subtitle">
              {{ viewMode === 'diagram'
                ? 'Sơ đồ quan hệ giữa các bảng Firebase (chỉ xem • kéo thả sắp xếp • xuất ảnh PNG)'
                : viewMode === 'features'
                  ? 'Sơ đồ chức năng chính toàn hệ thống (Cây phân hệ & Luồng nghiệp vụ • xuất ảnh PNG)'
                  : 'Tra cứu dữ liệu từng bảng Realtime Database & xuất CSV' }}
            </p>
          </div>
        </div>

        <!-- Mobile quick theme button -->
        <button
          type="button"
          class="db-btn db-btn--ghost db-mob-only-theme"
          @click="toggleUiTheme"
          :title="uiTheme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'"
        >
          <svg v-if="uiTheme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>

      <!-- View Switcher (3 Modes) -->
      <div class="db-mode-switch" role="tablist" aria-label="Chế độ xem Database">
        <button
          type="button"
          class="db-mode-switch__btn"
          :class="{ active: viewMode === 'table' }"
          @click="switchViewMode('table')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          <span>Dữ liệu Bảng</span>
        </button>
        <button
          type="button"
          class="db-mode-switch__btn"
          :class="{ active: viewMode === 'diagram' }"
          @click="switchViewMode('diagram')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="7" height="6" rx="1.5"/><rect x="15" y="3" width="7" height="6" rx="1.5"/><rect x="8.5" y="15" width="7" height="6" rx="1.5"/><path d="M5.5 9v3a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9"/><line x1="12" y1="14" x2="12" y2="15"/></svg>
          <span>Sơ đồ DB</span>
        </button>
        <button
          type="button"
          class="db-mode-switch__btn"
          :class="{ active: viewMode === 'features' }"
          @click="switchViewMode('features')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          <span>Chức năng chính</span>
        </button>
      </div>

      <!-- Right Actions -->
      <div class="db-header__actions" :class="{ 'is-single-mob': viewMode === 'features' }">
        <button
          type="button"
          class="db-btn db-btn--ghost db-dt-only-theme"
          @click="toggleUiTheme"
          :title="uiTheme === 'dark' ? 'Chuyển sang giao diện Sáng (Light Blue)' : 'Chuyển sang giao diện Tối (Dark Navy)'"
        >
          <svg v-if="uiTheme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <span>{{ uiTheme === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>

        <template v-if="viewMode === 'diagram'">
          <button
            type="button"
            class="db-btn db-btn--ghost"
            @click="loadAllSchemas(true)"
            :disabled="schemaLoading"
            title="Quét lại danh sách bảng và cấu trúc cột mới nhất từ Firebase"
          >
            <svg :class="{ 'db-spin': schemaLoading }" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>Quét lại</span>
          </button>

          <button
            type="button"
            class="db-btn db-btn--primary"
            @click="handleExportPng"
            :disabled="schemaLoading || exportingPng || visibleDiagramNodes.length === 0"
          >
            <svg v-if="!exportingPng" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span v-else class="db-spinner-sm"></span>
            <span>{{ exportingPng ? 'Đang xuất...' : 'Xuất ảnh PNG' }}</span>
          </button>
        </template>

        <template v-else-if="viewMode === 'features'">
          <button
            type="button"
            class="db-btn db-btn--primary"
            @click="handleExportFeaturesPng"
            :disabled="exportingFeaturesPng"
          >
            <svg v-if="!exportingFeaturesPng" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span v-else class="db-spinner-sm"></span>
            <span>{{ exportingFeaturesPng ? 'Đang xuất...' : 'Xuất ảnh PNG' }}</span>
          </button>
        </template>

        <template v-else>
          <button
            v-if="selectedNode"
            type="button"
            class="db-btn db-btn--ghost db-mob-only-btn"
            @click="locateNodeOnDiagram(selectedNode)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Xem sơ đồ</span>
          </button>
          <button
            type="button"
            class="db-btn db-btn--primary"
            @click="exportToCSV"
            :disabled="!flattenedData.length"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Xuất CSV</span>
          </button>
        </template>
      </div>
    </header>

    <!-- Toast Notification -->
    <transition name="db-toast-fade">
      <div v-if="toastMsg" class="db-toast" :class="`is-${toastType}`">
        <span>{{ toastMsg }}</span>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════
         MODE 1: TABLE DATA VIEW
    ════════════════════════════════════════════════════ -->
    <template v-if="viewMode === 'table'">
      <div class="db-table-toolbar">
        <div class="db-toolbar-field">
          <label class="db-toolbar-label">Bảng</label>
          <select v-model="selectedNode" @change="fetchData" class="db-input db-select">
            <option v-for="node in availableNodes" :key="node" :value="node">
              {{ node }} — {{ getTableMeta(node).title }}
            </option>
          </select>
        </div>

        <div class="db-toolbar-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Tìm kiếm dữ liệu trong bảng..."
            class="db-toolbar-search__input"
          />
          <button v-if="searchQuery" type="button" class="db-clear-x" @click="searchQuery = ''">✕</button>
        </div>

        <button
          v-if="selectedNode"
          type="button"
          class="db-btn db-btn--soft db-dt-only-btn"
          @click="locateNodeOnDiagram(selectedNode)"
          title="Chuyển sang Sơ đồ và định vị bảng này"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Xem trên sơ đồ</span>
        </button>

        <div class="db-toolbar-bottom-row">
          <!-- Mobile Table Layout Toggle (Cards vs Spreadsheet) -->
          <div v-if="isMobileViewport" class="db-mob-layout-toggle">
            <button
              type="button"
              class="db-mob-layout-btn"
              :class="{ active: mobileTableLayout === 'cards' }"
              @click="mobileTableLayout = 'cards'"
            >Dạng thẻ</button>
            <button
              type="button"
              class="db-mob-layout-btn"
              :class="{ active: mobileTableLayout === 'grid' }"
              @click="mobileTableLayout = 'grid'"
            >Bảng ngang</button>
          </div>

          <div class="db-toolbar-meta tabular-nums">
            <span><strong>{{ filteredData.length }}</strong> dòng</span>
            <span>•</span>
            <span><strong>{{ columns.length }}</strong> cột</span>
          </div>
        </div>
      </div>

      <div class="db-table-wrapper" v-if="loading">
        <div class="loading-state">
          <div class="db-spinner-lg"></div>
          <span>Đang tải dữ liệu bảng <strong>{{ selectedNode }}</strong>...</span>
        </div>
      </div>

      <div class="db-table-wrapper" v-else-if="flattenedData.length === 0">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          <span>Không có dữ liệu trong bảng này.</span>
        </div>
      </div>

      <!-- Mobile Card List for Table Data (Easy-to-read on Phones) -->
      <div v-else-if="isMobileViewport && mobileTableLayout === 'cards'" class="db-mob-cards-wrap">
        <article
          v-for="(row, index) in paginatedData"
          :key="row._key || index"
          class="db-mob-row-card"
        >
          <div class="db-mob-row-card__head">
            <span class="db-mob-row-idx tabular-nums">#{{ (currentPage - 1) * rowsPerPage + index + 1 }}</span>
            <strong class="db-mob-row-key">{{ getRowPrimaryTitle(row) }}</strong>
            <button
              v-if="getRowDisplayFields(row).total > 6"
              type="button"
              class="db-mob-row-toggle"
              @click="toggleMobRowExpand(row._key ?? index)"
            >
              {{ expandedMobRows[row._key ?? index] ? 'Thu gọn' : `+${getRowDisplayFields(row).total - 6} trường` }}
            </button>
          </div>

          <div class="db-mob-row-grid">
            <div
              v-for="field in getRowDisplayFields(row, Boolean(expandedMobRows[row._key ?? index])).fields"
              :key="field.key"
              class="db-mob-field"
            >
              <span class="db-mob-field__key">{{ field.key }}</span>
              <span class="db-mob-field__val">{{ field.val }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Classic Horizontal Table (Desktop default & Mobile optional) -->
      <div class="db-table-wrapper" v-else>
        <table class="elite-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col" @click="sortBy(col)">
                <div class="db-th-inner">
                  <span>{{ col }}</span>
                  <span v-if="sortCol === col" class="db-sort-active">{{ sortAsc ? '▲' : '▼' }}</span>
                  <span v-else class="db-sort-idle">↕</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in paginatedData" :key="index" @dblclick="handleRowDblClick(row)">
              <td v-for="col in columns" :key="col" :title="row[col]">
                <div class="cell-content">{{ row[col] !== undefined ? row[col] : '' }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="db-pagination" v-if="filteredData.length > 0">
        <button type="button" class="db-page-btn" :disabled="currentPage === 1" @click="currentPage--">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="db-page-info tabular-nums">
          Trang <strong>{{ currentPage }}</strong> / {{ totalPages }}
          <span class="db-page-sub">({{ filteredData.length }} dòng)</span>
        </span>
        <button type="button" class="db-page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <select v-model="rowsPerPage" class="db-input db-page-size">
          <option :value="20">20 / trang</option>
          <option :value="50">50 / trang</option>
          <option :value="100">100 / trang</option>
          <option :value="500">500 / trang</option>
        </select>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════
         MODE 2: INTERACTIVE READ-ONLY ERD DIAGRAM VIEW
    ════════════════════════════════════════════════════ -->
    <template v-else-if="viewMode === 'diagram'">
      <!-- Filter & Group Bar -->
      <div class="erd-filter-bar">
        <div class="erd-filter-top">
          <div class="erd-search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              v-model="diagramSearch"
              type="text"
              class="erd-search-box__input"
              placeholder="Tìm tên bảng, mô tả hoặc tên cột..."
            />
            <button v-if="diagramSearch" type="button" class="db-clear-x" @click="diagramSearch = ''">✕</button>
          </div>

          <!-- Mobile ERD Sub-mode toggle (Canvas vs List Cards) -->
          <div v-if="isMobileViewport" class="db-mob-layout-toggle">
            <button
              type="button"
              class="db-mob-layout-btn"
              :class="{ active: mobileErdMode === 'list' }"
              @click="mobileErdMode = 'list'"
            >Danh sách</button>
            <button
              type="button"
              class="db-mob-layout-btn"
              :class="{ active: mobileErdMode === 'canvas' }"
              @click="switchMobileErdToCanvas"
            >Sơ đồ</button>
          </div>
        </div>

        <div class="erd-group-chips">
          <button
            type="button"
            class="erd-chip"
            :class="{ active: selectedGroup === 'all' }"
            @click="selectedGroup = 'all'"
          >
            Tất cả <span class="tabular-nums">({{ schemaNodes.length }})</span>
          </button>
          <button
            v-for="grp in groupOptions"
            :key="grp.id"
            type="button"
            class="erd-chip"
            :class="{ active: selectedGroup === grp.id }"
            @click="selectedGroup = selectedGroup === grp.id ? 'all' : grp.id"
          >
            <span class="erd-chip-dot" :style="{ background: grp.color }"></span>
            <span>{{ grp.label }}</span>
            <span class="tabular-nums">({{ grp.count }})</span>
          </button>
        </div>

        <div class="erd-toggles">
          <button
            type="button"
            class="erd-toggle-btn"
            :class="{ active: onlyLinkedTables }"
            @click="onlyLinkedTables = !onlyLinkedTables"
            title="Ẩn các bảng độc lập chưa có liên kết khóa ngoại"
          >
            <span>Chỉ bảng có liên kết</span>
          </button>
          <button
            v-if="!isMobileViewport || mobileErdMode === 'canvas'"
            type="button"
            class="erd-toggle-btn"
            :class="{ active: showEdgeLabels }"
            @click="showEdgeLabels = !showEdgeLabels"
            title="Bật / tắt nhãn tên trường khóa ngoại trên dây nối"
          >
            <span>Nhãn trường nối</span>
          </button>
          <span class="erd-stats-badge tabular-nums">
            {{ visibleDiagramNodes.length }} bảng · {{ visibleDiagramRelations.length }} liên kết
          </span>
        </div>
      </div>

      <!-- MOBILE-FRIENDLY RELATION CARDS VIEW (When on phone & mobileErdMode === 'list') -->
      <div v-if="isMobileViewport && mobileErdMode === 'list'" class="erd-mob-list-wrap">
        <div v-if="schemaLoading" class="erd-mob-loading">
          <div class="db-spinner-lg"></div>
          <div class="erd-loading-title">Đang quét cấu trúc Firebase...</div>
          <div class="erd-loading-sub tabular-nums">{{ schemaProgress.done }} / {{ schemaProgress.total }} bảng</div>
        </div>

        <div v-else-if="visibleDiagramNodes.length === 0" class="erd-mob-loading">
          <p>Không có bảng nào khớp bộ lọc hiện tại.</p>
          <button type="button" class="db-btn db-btn--soft" @click="resetDiagramFilters">Xóa bộ lọc</button>
        </div>

        <template v-else>
          <article
            v-for="node in visibleDiagramNodes"
            :key="node.name"
            class="erd-mob-table-card"
            :style="{ borderLeftColor: node.meta.groupInfo.color }"
          >
            <div class="erd-mob-table-card__head" @click="activeDiagramNode = node.name">
              <div class="erd-mob-table-card__title-wrap">
                <div class="erd-mob-table-card__top-tags">
                  <span class="erd-inspector__group-tag is-sm" :style="{ background: node.meta.groupInfo.color }">
                    {{ node.meta.groupInfo.label }}
                  </span>
                  <span class="erd-mob-count-pill tabular-nums">{{ node.rowCount }} dòng · {{ node.columns.length }} cột</span>
                </div>
                <h3 class="erd-mob-table-name">{{ node.name }}</h3>
                <p class="erd-mob-table-sub">{{ node.meta.title }}</p>
              </div>
            </div>

            <!-- Key columns preview -->
            <div class="erd-mob-keys">
              <span
                v-for="col in getNodeKeyCols(node)"
                :key="col.name"
                class="erd-mob-key-pill"
                :class="col.isPk ? 'is-pk' : 'is-fk'"
              >
                <strong>{{ col.isPk ? 'PK' : 'FK' }}</strong>
                <span>{{ col.name }}</span>
              </span>
            </div>

            <!-- Relations summary -->
            <div v-if="getNodeOutgoing(node.name).length || getNodeIncoming(node.name).length" class="erd-mob-rels">
              <div v-if="getNodeOutgoing(node.name).length" class="erd-mob-rel-row">
                <span class="erd-mob-rel-lbl">Trỏ tới:</span>
                <div class="erd-mob-rel-chips">
                  <button
                    v-for="rel in getNodeOutgoing(node.name)"
                    :key="rel.id"
                    type="button"
                    class="erd-mob-rel-chip is-out"
                    @click="activeDiagramNode = rel.to"
                  >
                    → {{ rel.to }}
                  </button>
                </div>
              </div>
              <div v-if="getNodeIncoming(node.name).length" class="erd-mob-rel-row">
                <span class="erd-mob-rel-lbl">Tham chiếu từ:</span>
                <div class="erd-mob-rel-chips">
                  <button
                    v-for="rel in getNodeIncoming(node.name)"
                    :key="rel.id"
                    type="button"
                    class="erd-mob-rel-chip is-in"
                    @click="activeDiagramNode = rel.from"
                  >
                    ← {{ rel.from }}
                  </button>
                </div>
              </div>
            </div>

            <div class="erd-mob-table-card__foot">
              <button type="button" class="db-btn db-btn--ghost erd-mob-act-btn" @click="activeDiagramNode = node.name">
                Chi tiết &amp; Cột
              </button>
              <button type="button" class="db-btn db-btn--soft erd-mob-act-btn" @click="openNodeInTableView(node.name)">
                Xem dữ liệu →
              </button>
            </div>
          </article>
        </template>
      </div>

      <!-- INTERACTIVE CANVAS + INSPECTOR WORKSPACE -->
      <div v-else class="erd-workspace">
        <div
          ref="canvasRef"
          class="erd-stage"
          :class="{ 'is-panning': isPanning }"
          @pointerdown="onStagePointerDown"
          @wheel.prevent="onStageWheel"
        >
          <!-- Loading Overlay -->
          <div v-if="schemaLoading" class="erd-loading-overlay">
            <div class="erd-loading-card">
              <div class="db-spinner-lg"></div>
              <div class="erd-loading-title">Đang quét cấu trúc dữ liệu Firebase...</div>
              <div class="erd-loading-sub tabular-nums">
                Đã đọc {{ schemaProgress.done }} / {{ schemaProgress.total }} bảng
              </div>
              <div class="erd-loading-track">
                <div
                  class="erd-loading-fill"
                  :style="{ width: schemaProgress.total > 0 ? Math.round((schemaProgress.done / schemaProgress.total) * 100) + '%' : '15%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="visibleDiagramNodes.length === 0" class="erd-empty-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <p>Không có bảng nào khớp bộ lọc hiện tại.</p>
            <button type="button" class="db-btn db-btn--soft" @click="resetDiagramFilters">Xóa bộ lọc</button>
          </div>

          <!-- Transformed World -->
          <div
            v-show="!schemaLoading && visibleDiagramNodes.length > 0"
            class="erd-world"
            :style="worldTransformStyle"
          >
            <!-- SVG Edges Layer -->
            <svg class="erd-svg-layer" width="1" height="1">
              <g v-for="edge in renderedEdges" :key="edge.id" class="erd-edge-group" :class="{ 'is-dimmed': edge.isDimmed, 'is-highlighted': edge.isHighlighted }">
                <path
                  :d="edge.geo.path"
                  fill="none"
                  stroke="transparent"
                  stroke-width="14"
                  class="erd-edge-hit"
                  @pointerenter="hoveredEdgeId = edge.id"
                  @pointerleave="hoveredEdgeId = null"
                />
                <path
                  :d="edge.geo.path"
                  fill="none"
                  class="erd-edge-path"
                  :class="{
                    'is-auto': edge.isAutoDetected,
                    'is-highlighted': edge.isHighlighted
                  }"
                />
                <template v-if="edge.isManyFrom">
                  <line :x1="edge.geo.x1" :y1="edge.geo.y1" :x2="edge.geo.fromStubX" :y2="edge.geo.y1" class="erd-edge-mark" :class="{ 'is-highlighted': edge.isHighlighted }" />
                  <line :x1="edge.geo.fromStubX" :y1="edge.geo.y1" :x2="edge.geo.x1" :y2="edge.geo.y1 - 6" class="erd-edge-mark" :class="{ 'is-highlighted': edge.isHighlighted }" />
                  <line :x1="edge.geo.fromStubX" :y1="edge.geo.y1" :x2="edge.geo.x1" :y2="edge.geo.y1 + 6" class="erd-edge-mark" :class="{ 'is-highlighted': edge.isHighlighted }" />
                </template>
                <template v-else>
                  <line :x1="edge.geo.x1 + edge.geo.dir1 * 8" :y1="edge.geo.y1 - 6" :x2="edge.geo.x1 + edge.geo.dir1 * 8" :y2="edge.geo.y1 + 6" class="erd-edge-mark" :class="{ 'is-highlighted': edge.isHighlighted }" />
                </template>
                <circle :cx="edge.geo.x2" :cy="edge.geo.y2" r="3.8" class="erd-edge-dot" :class="{ 'is-highlighted': edge.isHighlighted }" />
                <line :x1="edge.geo.x2 + edge.geo.dir2 * 9" :y1="edge.geo.y2 - 6" :x2="edge.geo.x2 + edge.geo.dir2 * 9" :y2="edge.geo.y2 + 6" class="erd-edge-mark" :class="{ 'is-highlighted': edge.isHighlighted }" />

                <g
                  v-if="showEdgeLabels || edge.isHighlighted"
                  :transform="`translate(${edge.geo.midX}, ${edge.geo.midY})`"
                  class="erd-edge-label"
                >
                  <rect
                    :x="-edge.labelBoxW / 2"
                    y="-10"
                    :width="edge.labelBoxW"
                    height="20"
                    rx="10"
                    class="erd-edge-label__bg"
                    :class="{ 'is-highlighted': edge.isHighlighted }"
                  />
                  <text
                    x="0"
                    y="3.5"
                    text-anchor="middle"
                    class="erd-edge-label__txt"
                    :class="{ 'is-highlighted': edge.isHighlighted }"
                  >{{ edge.shortField }}</text>
                </g>
              </g>
            </svg>

            <!-- HTML Entity Table Cards -->
            <div
              v-for="node in visibleDiagramNodes"
              :key="node.name"
              class="erd-node-card"
              :class="{
                'is-selected': activeDiagramNode === node.name,
                'is-related': isNodeHighlighted(node.name),
                'is-dimmed': isNodeDimmed(node.name),
                'is-dragging': draggingNodeName === node.name
              }"
              :style="getNodeCardStyle(node.name)"
              @pointerenter="hoveredNodeName = node.name"
              @pointerleave="hoveredNodeName = null"
              @dblclick.stop="openNodeInTableView(node.name)"
            >
              <div
                class="erd-node-head"
                :style="{ background: node.meta.groupInfo.color }"
                @pointerdown.stop="onNodePointerDown($event, node.name)"
              >
                <div class="erd-node-head__top">
                  <span class="erd-node-name" :title="node.name">{{ node.name }}</span>
                  <span class="erd-node-rows tabular-nums">{{ node.rowCount }} dòng</span>
                </div>
                <div class="erd-node-subtitle" :title="node.meta.title">{{ node.meta.title }}</div>
              </div>

              <div class="erd-node-cols" @click.stop="selectDiagramNode(node.name)">
                <div
                  v-for="col in getNodeCols(node).rows"
                  :key="col.name"
                  class="erd-col-row"
                  :class="{ 'is-key': col.isPk || col.isFk }"
                >
                  <span v-if="col.isPk || col.isFk" class="erd-port is-left"></span>
                  <span v-if="col.isPk" class="erd-key-badge is-pk">PK</span>
                  <span v-else-if="col.isFk" class="erd-key-badge is-fk">FK</span>
                  <span v-else class="erd-col-dot"></span>
                  <span class="erd-col-name" :title="col.name">{{ col.name }}</span>
                  <span v-if="col.isPk || col.isFk" class="erd-port is-right"></span>
                </div>

                <button
                  v-if="getNodeCols(node).hiddenCount > 0 || (expandedNodes[node.name] && getNodeCols(node).totalCount > MAX_COLLAPSED_COLS)"
                  type="button"
                  class="erd-node-more-btn"
                  @click.stop="toggleNodeExpand(node.name)"
                >
                  {{ expandedNodes[node.name] ? 'Thu gọn cột ▲' : `+ Xem thêm ${getNodeCols(node).hiddenCount} cột ▼` }}
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom-Left Legend -->
          <div class="erd-legend">
            <span class="erd-legend__item"><span class="erd-key-badge is-pk">PK</span> Khóa chính</span>
            <span class="erd-legend__item"><span class="erd-key-badge is-fk">FK</span> Khóa ngoại</span>
            <span class="erd-legend__item"><span class="erd-legend-line is-solid"></span> Quan hệ chuẩn</span>
            <span class="erd-legend__item"><span class="erd-legend-line is-dashed"></span> Tự dò FK</span>
            <span class="erd-legend__hint">Kéo bảng để xếp • Cuộn để zoom • Double-click xem dữ liệu</span>
          </div>

          <!-- Bottom-Right Controls -->
          <div class="erd-canvas-controls">
            <button type="button" class="erd-ctrl-btn" @click="zoomBy(-0.15)" title="Thu nhỏ">−</button>
            <span class="erd-zoom-pct tabular-nums">{{ Math.round(zoom * 100) }}%</span>
            <button type="button" class="erd-ctrl-btn" @click="zoomBy(0.15)" title="Phóng to">+</button>
            <span class="erd-ctrl-sep"></span>
            <button type="button" class="erd-ctrl-btn is-text" @click="fitToScreen" title="Vừa toàn bộ sơ đồ">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              <span>Fit</span>
            </button>
            <button type="button" class="erd-ctrl-btn is-text" @click="resetSmartLayout" title="Sắp xếp lại vị trí các bảng tự động">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>Xếp lại</span>
            </button>
            <button type="button" class="erd-ctrl-btn is-text db-dt-only-ctrl" @click="toggleAllNodesExpand" :title="allNodesExpanded ? 'Thu gọn cột tất cả bảng' : 'Mở rộng cột tất cả bảng'">
              <span>{{ allNodesExpanded ? 'Thu cột' : 'Mở cột' }}</span>
            </button>
          </div>
        </div>

        <!-- Read-only Inspector Sidebar (Desktop Right Panel) -->
        <aside v-if="!isMobileViewport && activeNodeObj" class="erd-inspector">
          <div class="erd-inspector__head">
            <div class="erd-inspector__head-info">
              <span class="erd-inspector__group-tag" :style="{ background: activeNodeObj.meta.groupInfo.color }">
                {{ activeNodeObj.meta.groupInfo.label }}
              </span>
              <h3 class="erd-inspector__name">{{ activeNodeObj.name }}</h3>
              <p class="erd-inspector__title">{{ activeNodeObj.meta.title }}</p>
            </div>
            <button type="button" class="erd-inspector__close" @click="activeDiagramNode = null" aria-label="Đóng">✕</button>
          </div>

          <div class="erd-inspector__body">
            <p class="erd-inspector__desc">{{ activeNodeObj.meta.desc }}</p>

            <div class="erd-inspector__kpi-row tabular-nums">
              <div class="erd-inspector__kpi">
                <span>Số dòng</span>
                <strong>{{ activeNodeObj.rowCount }}</strong>
              </div>
              <div class="erd-inspector__kpi">
                <span>Số cột</span>
                <strong>{{ activeNodeObj.columns.length }}</strong>
              </div>
              <div class="erd-inspector__kpi">
                <span>Liên kết</span>
                <strong>{{ activeNodeOutgoing.length + activeNodeIncoming.length }}</strong>
              </div>
            </div>

            <button
              type="button"
              class="db-btn db-btn--primary erd-inspector__cta"
              @click="openNodeInTableView(activeNodeObj.name)"
            >
              <span>Mở dữ liệu bảng này</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>

            <!-- Outgoing Relations -->
            <div class="erd-inspector__section">
              <h4 class="erd-inspector__sec-title">
                Liên kết đi (FK → Bảng cha) <span class="tabular-nums">({{ activeNodeOutgoing.length }})</span>
              </h4>
              <div v-if="activeNodeOutgoing.length" class="erd-rel-list">
                <button
                  v-for="rel in activeNodeOutgoing"
                  :key="rel.id"
                  type="button"
                  class="erd-rel-item"
                  @click="focusAndPanToNode(rel.to)"
                >
                  <div class="erd-rel-item__top">
                    <span class="erd-rel-target">{{ rel.to }}</span>
                    <span class="erd-rel-card">{{ rel.cardinality }}</span>
                  </div>
                  <div class="erd-rel-item__sub">
                    <span class="erd-code-chip">{{ rel.fromField }}</span>
                    <span class="erd-rel-arrow">→</span>
                    <span class="erd-code-chip">{{ rel.toField }}</span>
                  </div>
                </button>
              </div>
              <div v-else class="erd-inspector__empty">Không có khóa ngoại trỏ ra ngoài.</div>
            </div>

            <!-- Incoming Relations -->
            <div class="erd-inspector__section">
              <h4 class="erd-inspector__sec-title">
                Được tham chiếu bởi <span class="tabular-nums">({{ activeNodeIncoming.length }})</span>
              </h4>
              <div v-if="activeNodeIncoming.length" class="erd-rel-list">
                <button
                  v-for="rel in activeNodeIncoming"
                  :key="rel.id"
                  type="button"
                  class="erd-rel-item"
                  @click="focusAndPanToNode(rel.from)"
                >
                  <div class="erd-rel-item__top">
                    <span class="erd-rel-target">{{ rel.from }}</span>
                    <span class="erd-rel-card">{{ rel.cardinality }}</span>
                  </div>
                  <div class="erd-rel-item__sub">
                    <span class="erd-code-chip">{{ rel.fromField }}</span>
                    <span class="erd-rel-arrow">→</span>
                    <span class="erd-code-chip">{{ rel.toField }}</span>
                  </div>
                </button>
              </div>
              <div v-else class="erd-inspector__empty">Chưa có bảng con nào tham chiếu tới bảng này.</div>
            </div>

            <!-- All Columns with quick search -->
            <div class="erd-inspector__section">
              <h4 class="erd-inspector__sec-title">
                Danh sách cột thực tế <span class="tabular-nums">({{ filteredInspectorCols.length }}/{{ activeNodeAllCols.length }})</span>
              </h4>
              <div v-if="activeNodeAllCols.length > 8" class="erd-insp-col-search">
                <input
                  v-model="inspectorColSearch"
                  type="text"
                  class="erd-insp-col-search__input"
                  placeholder="Lọc nhanh tên cột..."
                />
                <button v-if="inspectorColSearch" type="button" class="db-clear-x" @click="inspectorColSearch = ''">✕</button>
              </div>
              <div class="erd-inspector__col-list">
                <div
                  v-for="col in filteredInspectorCols"
                  :key="col.name"
                  class="erd-inspector__col-item"
                  :class="{ 'is-key-row': col.isPk || col.isFk }"
                >
                  <span v-if="col.isPk" class="erd-key-badge is-pk">PK</span>
                  <span v-else-if="col.isFk" class="erd-key-badge is-fk">FK</span>
                  <span v-else class="erd-col-dot"></span>
                  <span class="erd-col-code">{{ col.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- MOBILE FULLSCREEN INSPECTOR SHEET (Safe-Area Top 52px + Sticky Bottom CTA) -->
      <aside v-if="isMobileViewport && activeNodeObj" class="erd-inspector is-mobile-sheet">
        <div class="erd-inspector__head">
          <div class="erd-inspector__head-info">
            <span class="erd-inspector__group-tag" :style="{ background: activeNodeObj.meta.groupInfo.color }">
              {{ activeNodeObj.meta.groupInfo.label }}
            </span>
            <h3 class="erd-inspector__name">{{ activeNodeObj.name }}</h3>
            <p class="erd-inspector__title">{{ activeNodeObj.meta.title }}</p>
          </div>
          <button type="button" class="erd-inspector__close" @click="activeDiagramNode = null" aria-label="Đóng">✕</button>
        </div>

        <div class="erd-inspector__body">
          <p class="erd-inspector__desc">{{ activeNodeObj.meta.desc }}</p>

          <div class="erd-inspector__kpi-row tabular-nums">
            <div class="erd-inspector__kpi">
              <span>Số dòng</span>
              <strong>{{ activeNodeObj.rowCount }}</strong>
            </div>
            <div class="erd-inspector__kpi">
              <span>Số cột</span>
              <strong>{{ activeNodeObj.columns.length }}</strong>
            </div>
            <div class="erd-inspector__kpi">
              <span>Liên kết</span>
              <strong>{{ activeNodeOutgoing.length + activeNodeIncoming.length }}</strong>
            </div>
          </div>

          <div class="erd-inspector__section">
            <h4 class="erd-inspector__sec-title">
              Liên kết đi (FK → Bảng cha) <span class="tabular-nums">({{ activeNodeOutgoing.length }})</span>
            </h4>
            <div v-if="activeNodeOutgoing.length" class="erd-rel-list">
              <button
                v-for="rel in activeNodeOutgoing"
                :key="rel.id"
                type="button"
                class="erd-rel-item"
                @click="focusAndPanToNode(rel.to)"
              >
                <div class="erd-rel-item__top">
                  <span class="erd-rel-target">{{ rel.to }}</span>
                  <span class="erd-rel-card">{{ rel.cardinality }}</span>
                </div>
                <div class="erd-rel-item__sub">
                  <span class="erd-code-chip">{{ rel.fromField }}</span>
                  <span class="erd-rel-arrow">→</span>
                  <span class="erd-code-chip">{{ rel.toField }}</span>
                </div>
              </button>
            </div>
            <div v-else class="erd-inspector__empty">Không có khóa ngoại trỏ ra ngoài.</div>
          </div>

          <div class="erd-inspector__section">
            <h4 class="erd-inspector__sec-title">
              Được tham chiếu bởi <span class="tabular-nums">({{ activeNodeIncoming.length }})</span>
            </h4>
            <div v-if="activeNodeIncoming.length" class="erd-rel-list">
              <button
                v-for="rel in activeNodeIncoming"
                :key="rel.id"
                type="button"
                class="erd-rel-item"
                @click="focusAndPanToNode(rel.from)"
              >
                <div class="erd-rel-item__top">
                  <span class="erd-rel-target">{{ rel.from }}</span>
                  <span class="erd-rel-card">{{ rel.cardinality }}</span>
                </div>
                <div class="erd-rel-item__sub">
                  <span class="erd-code-chip">{{ rel.fromField }}</span>
                  <span class="erd-rel-arrow">→</span>
                  <span class="erd-code-chip">{{ rel.toField }}</span>
                </div>
              </button>
            </div>
            <div v-else class="erd-inspector__empty">Chưa có bảng con nào tham chiếu tới bảng này.</div>
          </div>

          <div class="erd-inspector__section">
            <h4 class="erd-inspector__sec-title">
              Danh sách cột thực tế <span class="tabular-nums">({{ filteredInspectorCols.length }}/{{ activeNodeAllCols.length }})</span>
            </h4>
            <div v-if="activeNodeAllCols.length > 8" class="erd-insp-col-search">
              <input
                v-model="inspectorColSearch"
                type="text"
                class="erd-insp-col-search__input"
                placeholder="Lọc nhanh tên cột..."
              />
              <button v-if="inspectorColSearch" type="button" class="db-clear-x" @click="inspectorColSearch = ''">✕</button>
            </div>
            <div class="erd-inspector__col-list">
              <div
                v-for="col in filteredInspectorCols"
                :key="col.name"
                class="erd-inspector__col-item"
                :class="{ 'is-key-row': col.isPk || col.isFk }"
              >
                <span v-if="col.isPk" class="erd-key-badge is-pk">PK</span>
                <span v-else-if="col.isFk" class="erd-key-badge is-fk">FK</span>
                <span v-else class="erd-col-dot"></span>
                <span class="erd-col-code">{{ col.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="erd-inspector__mob-foot">
          <button
            type="button"
            class="db-btn db-btn--primary erd-inspector__cta"
            @click="openNodeInTableView(activeNodeObj.name)"
          >
            <span>Mở dữ liệu bảng {{ activeNodeObj.name }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </aside>
    </template>

    <!-- ═══════════════════════════════════════════════════
         MODE 3: SYSTEM CORE FEATURES DIAGRAM (TREE & FLOW)
    ════════════════════════════════════════════════════ -->
    <SystemFeaturesDiagram
      v-else
      ref="featuresDiagramRef"
      :ui-theme="uiTheme"
      :is-mobile="isMobileViewport"
      @open-table="openNodeInTableView"
      @locate-table="locateNodeOnDiagram"
      @open-route="router.push($event)"
      @toast="onChildToast"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, markRaw, toRaw } from 'vue';
import { getDatabase, ref as dbRef, onValue, off, get, query, limitToFirst } from "firebase/database";
import { initializeApp, getApps, getApp } from "firebase/app";
import { useRouter } from 'vue-router';
import SystemFeaturesDiagram from './SystemFeaturesDiagram.vue';
import { useBinaryAppTheme } from '../composables/useAppTheme';
import {
  SCHEMA_GROUPS,
  NODE_CARD_WIDTH,
  MAX_COLLAPSED_COLS,
  getTableMeta,
  buildRelationsForNodes,
  getOrderedColumnsForNode,
  estimateNodeHeight,
  computeSmartLayout,
  computeEdgeGeometry,
  exportErdToPng
} from '../utils/dbSchemaMeta';

const router = useRouter();

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "929199941311",
  appId: "1:929199941311:web:ca8d86f9fd7f8dff61480a",
  measurementId: "G-48VVPGFSFK"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = markRaw(getDatabase(app));

// ─── Mobile Viewport Detection ───
const isMobileViewport = ref(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
const updateViewport = () => {
  if (typeof window !== 'undefined') {
    isMobileViewport.value = window.innerWidth <= 768;
  }
};
const mobileTableLayout = ref('cards'); // 'cards' | 'grid'
const mobileErdMode = ref('list'); // 'list' (readable relation cards) | 'canvas' (interactive diagram)
const expandedMobRows = ref({});
const toggleMobRowExpand = (key) => {
  expandedMobRows.value = {
    ...expandedMobRows.value,
    [key]: !expandedMobRows.value[key]
  };
};

// ─── Dual Theme (Synced globally across all pages via useAppTheme) ───
const { uiTheme, toggleUiTheme } = useBinaryAppTheme();

// ─── Toast Helper ───
const toastMsg = ref('');
const toastType = ref('success');
let toastTimer = null;
const showToast = (msg, type = 'success', duration = 2600) => {
  toastMsg.value = msg;
  toastType.value = type;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMsg.value = '';
  }, duration);
};

// ─── View Mode & Table Data State ───
const viewMode = ref('table'); // 'table' | 'diagram'
const availableNodes = ref([]);
const selectedNode = ref('');
const rawData = ref({});
const flattenedData = ref([]);
const columns = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const sortCol = ref('_key');
const sortAsc = ref(true);
const currentPage = ref(1);
const rowsPerPage = ref(50);

let currentDbRef = null;

const fetchData = () => {
  if (!selectedNode.value) return;
  loading.value = true;
  expandedMobRows.value = {};
  if (currentDbRef) {
    off(toRaw(currentDbRef));
  }

  currentDbRef = markRaw(dbRef(db, selectedNode.value));
  onValue(currentDbRef, (snapshot) => {
    const data = snapshot.val() || {};
    rawData.value = data;
    processData(data);
    loading.value = false;
  }, (error) => {
    console.error("Firebase read error:", error);
    loading.value = false;
  });
};

const fetchRootNodes = async () => {
  try {
    const url = `${firebaseConfig.databaseURL}/.json?shallow=true`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && typeof data === 'object') {
      const keys = new Set([...Object.keys(data), 'sale_report', 'lich_su_thanh_toan', 'khach_hang']);
      availableNodes.value = Array.from(keys).sort((a, b) => a.localeCompare(b));
      if (availableNodes.value.length > 0 && !selectedNode.value) {
        selectedNode.value = availableNodes.value[0];
        fetchData();
      }
    }
  } catch (error) {
    console.error("Failed to fetch root nodes:", error);
    availableNodes.value = [
      'khach_hang', 'hop_dong_tong_quat', 'hop_dong_chi_tiet', 'sale_report',
      'sale_report_craft', 'lich_su_thanh_toan', 'hang_hoa', 'license_old_data',
      'pipeline', 'pipeline_projects', 'pipeline_workflow', 'REPORT',
      'quan_ly_file', 'kho_luu_tru', 'zalo_bot_config'
    ].sort();
    if (!selectedNode.value) {
      selectedNode.value = 'khach_hang';
      fetchData();
    }
  }
};

const processData = (data) => {
  let arr = [];
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const item = data[key];
        if (typeof item === 'object' && item !== null) {
          arr.push(flattenObject({ _key: key, ...item }));
        } else {
          arr.push({ _key: key, value: item });
        }
      }
    }
  } else if (Array.isArray(data)) {
    arr = data.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return flattenObject({ _key: index, ...item });
      }
      return { _key: index, value: item };
    });
  }

  const cols = new Set();
  arr.forEach(row => {
    Object.keys(row).forEach(k => cols.add(k));
  });

  const colArray = Array.from(cols);
  colArray.sort((a, b) => {
    if (a === '_key' || a === 'id') return -1;
    if (b === '_key' || b === 'id') return 1;
    return a.localeCompare(b);
  });

  columns.value = colArray;
  flattenedData.value = arr;
};

const flattenObject = (ob) => {
  const toReturn = {};
  for (const i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;
    if (typeof ob[i] === 'object' && ob[i] !== null) {
      if (Array.isArray(ob[i])) {
        if (i === 'ke_hoach_thanh_toan') {
          toReturn[i] = ob[i]
            .map(x => {
              if (!x || typeof x !== 'object') return String(x);
              const amt = Number(x.so_tien_phai_thu || 0).toLocaleString('vi-VN');
              return `Đợt ${x.dot || ''}: ${x.ty_le_pct || 0}% (${amt}đ - Hạn: ${x.han_thanh_toan || 'Chưa đặt'})`;
            })
            .join(' | ');
        } else {
          toReturn[i] = ob[i].map(x => (typeof x === 'object' ? JSON.stringify(x) : x)).join(', ');
        }
      } else {
        toReturn[i] = JSON.stringify(ob[i]);
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

const getRowPrimaryTitle = (row) => {
  const candidates = [
    row.ten_cong_ty, row.TEN_CONG_TY, row.Ten_cong_ty,
    row.Ten_hang, row.PRODUCT_NAME, row.ten_khach_hang,
    row.So_PO, row.so_po, row.LICENSE_ID, row.ma_hop_dong,
    row.NOI_DUNG, row.noi_dung, row.ten_file, row.id, row._key
  ];
  for (const v of candidates) {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return String(v).trim();
    }
  }
  return 'Bản ghi';
};

const getRowDisplayFields = (row, expanded = false) => {
  const entries = [];
  for (const col of columns.value) {
    const raw = row[col];
    if (raw === undefined || raw === null || String(raw).trim() === '') continue;
    entries.push({ key: col, val: String(raw) });
  }
  return {
    total: entries.length,
    fields: expanded ? entries : entries.slice(0, 6)
  };
};

const sortBy = (col) => {
  if (sortCol.value === col) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortCol.value = col;
    sortAsc.value = true;
  }
};

const filteredData = computed(() => {
  let result = flattenedData.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(row =>
      Object.values(row).some(val => val !== null && val !== undefined && String(val).toLowerCase().includes(q))
    );
  }
  if (sortCol.value) {
    result = [...result].sort((a, b) => {
      const valA = a[sortCol.value] !== undefined ? a[sortCol.value] : '';
      const valB = b[sortCol.value] !== undefined ? b[sortCol.value] : '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc.value ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortAsc.value ? -1 : 1;
      if (strA > strB) return sortAsc.value ? 1 : -1;
      return 0;
    });
  }
  return result;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / rowsPerPage.value)));
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredData.value.slice(start, start + rowsPerPage.value);
});

watch([searchQuery, rowsPerPage], () => {
  currentPage.value = 1;
});

const handleRowDblClick = (row) => {
  if (selectedNode.value === 'khach_hang') {
    router.push('/customerfirebase');
  } else if (selectedNode.value === 'license_old_data') {
    router.push('/license-old-data-firebase');
  } else if (selectedNode.value === 'sale_report' || selectedNode.value === 'sale_report_craft') {
    router.push('/sale-report-firebase');
  } else if (selectedNode.value === 'kho_luu_tru') {
    router.push('/kho-luu-tru-firebase');
  } else if (selectedNode.value === 'hang_hoa') {
    router.push('/quanlyhanghoafirebase');
  } else {
    showToast(`Bản ghi ${selectedNode.value} • Key: ${row.id || row._key}`, 'info');
  }
};

const exportToCSV = () => {
  if (!filteredData.value.length) return;
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent += columns.value.map(col => `"${col}"`).join(",") + "\r\n";

  filteredData.value.forEach(row => {
    const rowString = columns.value.map(col => {
      let val = row[col];
      if (val === undefined || val === null) val = '';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(",");
    csvContent += rowString + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Export_${selectedNode.value}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ═══════════════════════════════════════════════════════════════════════
// ERD DIAGRAM STATE, LIVE SCHEMA INSPECTION, DRAG/PAN/PINCH-ZOOM & EXPORT
// ═══════════════════════════════════════════════════════════════════════
const ERD_POSITIONS_KEY = 'nts_db_erd_positions_v1';

const schemaLoaded = ref(false);
const schemaLoading = ref(false);
const schemaProgress = ref({ done: 0, total: 0 });
const schemaNodes = ref([]);
const diagramPositions = ref({});
const expandedNodes = ref({});
const diagramSearch = ref('');
const selectedGroup = ref('all');
const onlyLinkedTables = ref(false);
const showEdgeLabels = ref(true);

const activeDiagramNode = ref(null);
const inspectorColSearch = ref('');
const hoveredNodeName = ref(null);
const hoveredEdgeId = ref(null);
const exportingPng = ref(false);

watch(activeDiagramNode, () => {
  inspectorColSearch.value = '';
});

// Viewport transform state
const canvasRef = ref(null);
const panX = ref(40);
const panY = ref(40);
const zoom = ref(0.75);
const isPanning = ref(false);
const draggingNodeName = ref(null);

let dragContext = null;
const activePointers = new Map();
let pinchState = null;

const loadSavedPositions = () => {
  try {
    const raw = localStorage.getItem(ERD_POSITIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const savePositions = () => {
  try {
    localStorage.setItem(ERD_POSITIONS_KEY, JSON.stringify(diagramPositions.value));
  } catch {}
};

const inspectSingleNodeSchema = async (nodeName) => {
  let rowCount = 0;
  let isSingletonConfig = false;
  let shallowKeys = [];

  try {
    const res = await fetch(`${firebaseConfig.databaseURL}/${encodeURIComponent(nodeName)}.json?shallow=true`);
    if (res.ok) {
      const shallow = await res.json();
      if (shallow && typeof shallow === 'object') {
        const entries = Object.entries(shallow);
        shallowKeys = entries.map(([k]) => k);
        const objectChildCount = entries.filter(([, v]) => v === true).length;
        if (entries.length > 0 && objectChildCount < entries.length * 0.4) {
          isSingletonConfig = true;
          rowCount = 1;
        } else {
          rowCount = entries.length;
        }
      }
    }
  } catch {}

  const colsSet = new Set();
  if (isSingletonConfig) {
    shallowKeys.forEach(k => colsSet.add(k));
  } else {
    try {
      const snap = await get(query(dbRef(db, nodeName), limitToFirst(5)));
      if (snap.exists()) {
        const val = snap.val();
        if (val && typeof val === 'object') {
          const entries = Object.entries(val);
          if (!rowCount) rowCount = entries.length;

          const objRows = entries.filter(([, item]) => item && typeof item === 'object' && !Array.isArray(item));
          const arrRows = entries.filter(([, item]) => Array.isArray(item));

          if (objRows.length > 0) {
            colsSet.add('_key');
            objRows.forEach(([, item]) => {
              Object.keys(item).forEach(k => colsSet.add(k));
            });
          } else if (arrRows.length > 0) {
            colsSet.add('_key');
            const maxLen = Math.min(12, Math.max(...arrRows.map(([, a]) => a.length)));
            for (let i = 0; i < maxLen; i++) colsSet.add(`col_${i}`);
          } else {
            entries.forEach(([k]) => colsSet.add(k));
            if (rowCount === entries.length) rowCount = 1;
          }
        }
      }
    } catch (err) {
      console.warn(`Không đọc được mẫu cột của node ${nodeName}:`, err);
    }
  }

  const meta = getTableMeta(nodeName);
  if (colsSet.size === 0 && Array.isArray(meta.priorityCols)) {
    meta.priorityCols.forEach(c => colsSet.add(c));
  }

  return {
    name: nodeName,
    rowCount,
    columns: Array.from(colsSet),
    meta
  };
};

const loadAllSchemas = async (forceReload = false) => {
  if (schemaLoading.value) return;
  if (schemaLoaded.value && !forceReload) return;

  schemaLoading.value = true;
  try {
    if (!availableNodes.value.length) {
      await fetchRootNodes();
    }
    const list = [...availableNodes.value];
    schemaProgress.value = { done: 0, total: list.length };

    const results = [];
    const BATCH_SIZE = 6;
    for (let i = 0; i < list.length; i += BATCH_SIZE) {
      const batch = list.slice(i, i + BATCH_SIZE);
      const batchRes = await Promise.all(batch.map(n => inspectSingleNodeSchema(n)));
      results.push(...batchRes);
      schemaProgress.value = { done: Math.min(list.length, i + batch.length), total: list.length };
    }

    schemaNodes.value = results;
    const rels = buildRelationsForNodes(results);
    const smartPos = computeSmartLayout(results, rels, expandedNodes.value);
    const saved = loadSavedPositions();

    const mergedPos = {};
    results.forEach(n => {
      mergedPos[n.name] = saved[n.name] && typeof saved[n.name].x === 'number'
        ? { x: saved[n.name].x, y: saved[n.name].y }
        : smartPos[n.name];
    });
    diagramPositions.value = mergedPos;
    schemaLoaded.value = true;

    await nextTick();
    fitToScreen();
  } catch (err) {
    console.error('Lỗi quét schema ERD:', err);
    showToast('Có lỗi khi quét cấu trúc bảng từ Firebase.', 'error');
  } finally {
    schemaLoading.value = false;
  }
};

const allRelations = computed(() => buildRelationsForNodes(schemaNodes.value));

const linkedNodeSet = computed(() => {
  const s = new Set();
  allRelations.value.forEach(r => {
    s.add(r.from);
    s.add(r.to);
  });
  return s;
});

const groupOptions = computed(() => {
  const counts = {};
  schemaNodes.value.forEach(n => {
    const gid = n.meta.group;
    counts[gid] = (counts[gid] || 0) + 1;
  });
  return Object.values(SCHEMA_GROUPS)
    .sort((a, b) => a.order - b.order)
    .map(g => ({ ...g, count: counts[g.id] || 0 }))
    .filter(g => g.count > 0);
});

const visibleDiagramNodes = computed(() => {
  const q = diagramSearch.value.trim().toLowerCase();
  return schemaNodes.value.filter(n => {
    if (selectedGroup.value !== 'all' && n.meta.group !== selectedGroup.value) return false;
    if (onlyLinkedTables.value && !linkedNodeSet.value.has(n.name)) return false;
    if (q) {
      const matchName = n.name.toLowerCase().includes(q);
      const matchTitle = String(n.meta.title || '').toLowerCase().includes(q);
      const matchCol = (n.columns || []).some(c => c.toLowerCase().includes(q));
      return matchName || matchTitle || matchCol;
    }
    return true;
  });
});

const visibleNodeMap = computed(() => {
  const m = {};
  visibleDiagramNodes.value.forEach(n => { m[n.name] = n; });
  return m;
});

const visibleDiagramRelations = computed(() => {
  const m = visibleNodeMap.value;
  return allRelations.value.filter(r => Boolean(m[r.from] && m[r.to]));
});

const getNodeOutgoing = (nodeName) => allRelations.value.filter(r => r.from === nodeName);
const getNodeIncoming = (nodeName) => allRelations.value.filter(r => r.to === nodeName);
const getNodeKeyCols = (node) =>
  getOrderedColumnsForNode(node, allRelations.value, true).rows.filter(c => c.isPk || c.isFk);

const focusNodeName = computed(() => hoveredNodeName.value || activeDiagramNode.value);

const focusNeighborSet = computed(() => {
  const target = focusNodeName.value;
  if (!target) return null;
  const s = new Set([target]);
  visibleDiagramRelations.value.forEach(r => {
    if (r.from === target) s.add(r.to);
    if (r.to === target) s.add(r.from);
  });
  return s;
});

const isNodeHighlighted = (name) => {
  if (!focusNodeName.value) return false;
  return Boolean(focusNeighborSet.value && focusNeighborSet.value.has(name) && name !== focusNodeName.value);
};

const isNodeDimmed = (name) => {
  if (hoveredEdgeId.value) {
    const edge = visibleDiagramRelations.value.find(r => r.id === hoveredEdgeId.value);
    if (edge) return edge.from !== name && edge.to !== name;
  }
  if (!focusNodeName.value) return false;
  return Boolean(focusNeighborSet.value && !focusNeighborSet.value.has(name));
};

const renderedEdges = computed(() => {
  const pos = diagramPositions.value;
  const nodeMap = visibleNodeMap.value;
  const rels = visibleDiagramRelations.value;
  const exp = expandedNodes.value;
  const focus = focusNodeName.value;
  const hovEdge = hoveredEdgeId.value;

  return rels
    .map(rel => {
      const geo = computeEdgeGeometry(rel, pos, nodeMap, rels, exp);
      if (!geo) return null;
      const isHighlighted =
        hovEdge === rel.id ||
        Boolean(focus && (rel.from === focus || rel.to === focus));
      const isDimmed = Boolean((focus || hovEdge) && !isHighlighted);
      const shortField = rel.fromField.length > 20 ? rel.fromField.slice(0, 19) + '…' : rel.fromField;
      const labelBoxW = Math.max(54, shortField.length * 6.4 + 16);
      return {
        ...rel,
        geo,
        isHighlighted,
        isDimmed,
        isManyFrom: String(rel.cardinality || 'N:1').startsWith('N'),
        shortField,
        labelBoxW
      };
    })
    .filter(Boolean);
});

const getNodeCols = (node) =>
  getOrderedColumnsForNode(node, visibleDiagramRelations.value, Boolean(expandedNodes.value[node.name]));

const getNodeCardStyle = (nodeName) => {
  const p = diagramPositions.value[nodeName] || { x: 0, y: 0 };
  return {
    width: `${NODE_CARD_WIDTH}px`,
    transform: `translate3d(${p.x}px, ${p.y}px, 0)`
  };
};

const worldTransformStyle = computed(() => ({
  transform: `translate3d(${panX.value}px, ${panY.value}px, 0) scale(${zoom.value})`
}));

const activeNodeObj = computed(() => {
  if (!activeDiagramNode.value) return null;
  return schemaNodes.value.find(n => n.name === activeDiagramNode.value) || null;
});

const activeNodeOutgoing = computed(() => {
  if (!activeDiagramNode.value) return [];
  return allRelations.value.filter(r => r.from === activeDiagramNode.value);
});

const activeNodeIncoming = computed(() => {
  if (!activeDiagramNode.value) return [];
  return allRelations.value.filter(r => r.to === activeDiagramNode.value);
});

const activeNodeAllCols = computed(() => {
  if (!activeNodeObj.value) return [];
  return getOrderedColumnsForNode(activeNodeObj.value, allRelations.value, true).rows;
});

const filteredInspectorCols = computed(() => {
  const q = inspectorColSearch.value.trim().toLowerCase();
  if (!q) return activeNodeAllCols.value;
  return activeNodeAllCols.value.filter(c => c.name.toLowerCase().includes(q));
});

const allNodesExpanded = computed(() => {
  if (!visibleDiagramNodes.value.length) return false;
  return visibleDiagramNodes.value.every(n => Boolean(expandedNodes.value[n.name]));
});

const toggleNodeExpand = (nodeName) => {
  expandedNodes.value = {
    ...expandedNodes.value,
    [nodeName]: !expandedNodes.value[nodeName]
  };
};

const toggleAllNodesExpand = () => {
  const nextState = !allNodesExpanded.value;
  const nextMap = { ...expandedNodes.value };
  visibleDiagramNodes.value.forEach(n => {
    nextMap[n.name] = nextState;
  });
  expandedNodes.value = nextMap;
};

const selectDiagramNode = (nodeName) => {
  activeDiagramNode.value = activeDiagramNode.value === nodeName ? null : nodeName;
};

const openNodeInTableView = (nodeName) => {
  activeDiagramNode.value = null;
  selectedNode.value = nodeName;
  viewMode.value = 'table';
  fetchData();
};

const locateNodeOnDiagram = async (nodeName) => {
  viewMode.value = 'diagram';
  await loadAllSchemas(false);
  await nextTick();
  selectedGroup.value = 'all';
  onlyLinkedTables.value = false;
  diagramSearch.value = '';
  await nextTick();
  focusAndPanToNode(nodeName);
};

const switchMobileErdToCanvas = async () => {
  mobileErdMode.value = 'canvas';
  await nextTick();
  fitToScreen();
};

const focusAndPanToNode = async (nodeName) => {
  if (!visibleNodeMap.value[nodeName]) {
    selectedGroup.value = 'all';
    onlyLinkedTables.value = false;
    diagramSearch.value = '';
    await nextTick();
  }
  activeDiagramNode.value = nodeName;
  const pos = diagramPositions.value[nodeName];
  const stage = canvasRef.value;
  if (!pos || !stage) return;
  const rect = stage.getBoundingClientRect();
  const node = schemaNodes.value.find(n => n.name === nodeName);
  const cardH = node ? estimateNodeHeight(node, allRelations.value, Boolean(expandedNodes.value[nodeName])) : 240;
  const targetZoom = Math.max(zoom.value, 0.85);
  zoom.value = Math.min(1.2, targetZoom);
  panX.value = Math.round(rect.width / 2 - (pos.x + NODE_CARD_WIDTH / 2) * zoom.value);
  panY.value = Math.round(rect.height / 2 - (pos.y + cardH / 2) * zoom.value);
};

const switchViewMode = async (mode) => {
  viewMode.value = mode;
  if (mode === 'diagram') {
    await loadAllSchemas(false);
  }
};

const resetDiagramFilters = () => {
  diagramSearch.value = '';
  selectedGroup.value = 'all';
  onlyLinkedTables.value = false;
};

const resetSmartLayout = () => {
  const smartPos = computeSmartLayout(schemaNodes.value, allRelations.value, expandedNodes.value);
  diagramPositions.value = smartPos;
  try {
    localStorage.removeItem(ERD_POSITIONS_KEY);
  } catch {}
  nextTick(() => fitToScreen());
  showToast('Đã tự động sắp xếp lại sơ đồ!', 'info');
};

const fitToScreen = () => {
  const stage = canvasRef.value;
  const nodes = visibleDiagramNodes.value;
  if (!stage || !nodes.length) return;

  const rect = stage.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(n => {
    const p = diagramPositions.value[n.name];
    if (!p) return;
    const h = estimateNodeHeight(n, visibleDiagramRelations.value, Boolean(expandedNodes.value[n.name]));
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + NODE_CARD_WIDTH);
    maxY = Math.max(maxY, p.y + h);
  });

  if (!Number.isFinite(minX)) return;

  const contentW = Math.max(300, maxX - minX);
  const contentH = Math.max(240, maxY - minY);
  const pad = isMobileViewport.value ? 24 : 56;
  const scaleX = (rect.width - pad * 2) / contentW;
  const scaleY = (rect.height - pad * 2) / contentH;
  const nextZoom = Math.max(0.22, Math.min(1.05, Math.min(scaleX, scaleY)));

  zoom.value = Number(nextZoom.toFixed(2));
  panX.value = Math.round((rect.width - contentW * zoom.value) / 2 - minX * zoom.value);
  panY.value = Math.round((rect.height - contentH * zoom.value) / 2 - minY * zoom.value);
};

const zoomBy = (delta) => {
  const stage = canvasRef.value;
  const prevZoom = zoom.value;
  const nextZoom = Math.max(0.22, Math.min(2.0, Number((prevZoom + delta).toFixed(2))));
  if (nextZoom === prevZoom) return;

  if (stage) {
    const rect = stage.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const worldX = (cx - panX.value) / prevZoom;
    const worldY = (cy - panY.value) / prevZoom;
    panX.value = Math.round(cx - worldX * nextZoom);
    panY.value = Math.round(cy - worldY * nextZoom);
  }
  zoom.value = nextZoom;
};

const onStageWheel = (e) => {
  const stage = canvasRef.value;
  if (!stage) return;
  const rect = stage.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const prevZoom = zoom.value;
  const factor = e.deltaY < 0 ? 1.1 : 0.91;
  const nextZoom = Math.max(0.22, Math.min(2.0, Number((prevZoom * factor).toFixed(3))));
  if (nextZoom === prevZoom) return;

  const worldX = (mouseX - panX.value) / prevZoom;
  const worldY = (mouseY - panY.value) / prevZoom;
  zoom.value = nextZoom;
  panX.value = Math.round(mouseX - worldX * nextZoom);
  panY.value = Math.round(mouseY - worldY * nextZoom);
};

// Pointer drag + Two-Finger Pinch Zoom
const onStagePointerDown = (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (activePointers.size === 2) {
    const pts = Array.from(activePointers.values());
    const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
    const midX = (pts[0].x + pts[1].x) / 2;
    const midY = (pts[0].y + pts[1].y) / 2;
    pinchState = {
      startDist: dist,
      startZoom: zoom.value,
      startPanX: panX.value,
      startPanY: panY.value,
      midX,
      midY
    };
    dragContext = null;
    isPanning.value = false;
  } else if (activePointers.size === 1) {
    isPanning.value = true;
    dragContext = {
      type: 'pan',
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origPanX: panX.value,
      origPanY: panY.value,
      moved: false
    };
  }

  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
};

const onNodePointerDown = (e, nodeName) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const pos = diagramPositions.value[nodeName] || { x: 0, y: 0 };
  draggingNodeName.value = nodeName;
  dragContext = {
    type: 'node',
    pointerId: e.pointerId,
    nodeName,
    startX: e.clientX,
    startY: e.clientY,
    origX: pos.x,
    origY: pos.y,
    moved: false
  };
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
};

const onWindowPointerMove = (e) => {
  if (activePointers.has(e.pointerId)) {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  // Handle two-finger pinch zoom on touch screens
  if (pinchState && activePointers.size >= 2) {
    const stage = canvasRef.value;
    const pts = Array.from(activePointers.values());
    const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
    const nextZoom = Math.max(0.22, Math.min(2.0, Number((pinchState.startZoom * (dist / pinchState.startDist)).toFixed(3))));
    if (stage) {
      const rect = stage.getBoundingClientRect();
      const focalX = pinchState.midX - rect.left;
      const focalY = pinchState.midY - rect.top;
      const worldX = (focalX - pinchState.startPanX) / pinchState.startZoom;
      const worldY = (focalY - pinchState.startPanY) / pinchState.startZoom;
      panX.value = Math.round(focalX - worldX * nextZoom);
      panY.value = Math.round(focalY - worldY * nextZoom);
    }
    zoom.value = nextZoom;
    return;
  }

  if (!dragContext || dragContext.pointerId !== e.pointerId) return;
  const dx = e.clientX - dragContext.startX;
  const dy = e.clientY - dragContext.startY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
    dragContext.moved = true;
  }

  if (dragContext.type === 'pan') {
    panX.value = dragContext.origPanX + dx;
    panY.value = dragContext.origPanY + dy;
  } else if (dragContext.type === 'node') {
    diagramPositions.value = {
      ...diagramPositions.value,
      [dragContext.nodeName]: {
        x: Math.round(dragContext.origX + dx / zoom.value),
        y: Math.round(dragContext.origY + dy / zoom.value)
      }
    };
  }
};

const onWindowPointerUp = (e) => {
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) {
    pinchState = null;
  }

  if (dragContext && dragContext.pointerId === e.pointerId) {
    if (dragContext.type === 'node') {
      if (dragContext.moved) {
        savePositions();
      } else {
        selectDiagramNode(dragContext.nodeName);
      }
    } else if (dragContext.type === 'pan' && !dragContext.moved) {
      activeDiagramNode.value = null;
    }
    isPanning.value = false;
    draggingNodeName.value = null;
    dragContext = null;
  }

  if (activePointers.size === 0 && !dragContext) {
    window.removeEventListener('pointermove', onWindowPointerMove);
    window.removeEventListener('pointerup', onWindowPointerUp);
    window.removeEventListener('pointercancel', onWindowPointerUp);
  }
};

const featuresDiagramRef = ref(null);
const exportingFeaturesPng = ref(false);

const onChildToast = ({ msg, type } = {}) => {
  if (msg) showToast(msg, type || 'info');
};

const handleExportFeaturesPng = async () => {
  if (exportingFeaturesPng.value || !featuresDiagramRef.value) return;
  exportingFeaturesPng.value = true;
  try {
    const res = await featuresDiagramRef.value.exportPng();
    if (res?.fileName) {
      showToast(`Đã xuất ảnh chức năng chính (${res.fileName})`, 'success', 3200);
    }
  } catch (err) {
    console.error('Lỗi xuất ảnh PNG Chức năng chính:', err);
    showToast('Không thể xuất ảnh PNG. Vui lòng thử lại!', 'error');
  } finally {
    exportingFeaturesPng.value = false;
  }
};

const handleExportPng = async () => {
  if (exportingPng.value || !visibleDiagramNodes.value.length) return;
  exportingPng.value = true;
  try {
    const res = await exportErdToPng({
      nodes: visibleDiagramNodes.value,
      relations: visibleDiagramRelations.value,
      positions: diagramPositions.value,
      theme: uiTheme.value,
      expandedMap: expandedNodes.value,
      showLabels: showEdgeLabels.value
    });
    showToast(`Đã xuất ảnh sơ đồ (${res.fileName})`, 'success', 3200);
  } catch (err) {
    console.error('Lỗi xuất ảnh PNG ERD:', err);
    showToast('Không thể xuất ảnh PNG. Vui lòng thử lại!', 'error');
  } finally {
    exportingPng.value = false;
  }
};

onMounted(() => {
  updateViewport();
  window.addEventListener('resize', updateViewport, { passive: true });
  fetchRootNodes();
});

onUnmounted(() => {
  if (currentDbRef) {
    off(toRaw(currentDbRef));
    currentDbRef = null;
  }
  if (toastTimer) clearTimeout(toastTimer);
  window.removeEventListener('resize', updateViewport);
  window.removeEventListener('pointermove', onWindowPointerMove);
  window.removeEventListener('pointerup', onWindowPointerUp);
  window.removeEventListener('pointercancel', onWindowPointerUp);
});
</script>

<style scoped>
/* ==========================================================================
   ENTERPRISE BLUE DUAL-THEME TOKENS (DARK NAVY BLUE & LIGHT BLUE)
========================================================================== */
.db-viewer-container {
  --db-canvas: radial-gradient(ellipse 75% 48% at 12% 0%, rgba(37, 99, 235, 0.2) 0%, transparent 55%),
    radial-gradient(ellipse 65% 45% at 92% 100%, rgba(14, 165, 233, 0.14) 0%, transparent 55%),
    linear-gradient(180deg, #060d1f 0%, #0a1428 50%, #071020 100%);
  --db-panel: rgba(12, 23, 46, 0.92);
  --db-panel-solid: #0c172e;
  --db-card: #10203e;
  --db-card-hover: #152b52;
  --db-well: rgba(6, 13, 30, 0.64);
  --db-stage-bg: #071124;
  --db-grid-dot: rgba(96, 165, 250, 0.22);
  --db-border: rgba(96, 165, 250, 0.18);
  --db-border-strong: rgba(96, 165, 250, 0.36);
  --db-ink: #f8fafc;
  --db-ink-sec: #cbd5e1;
  --db-ink-muted: #94a3b8;
  --db-shadow: 0 12px 32px -10px rgba(2, 6, 23, 0.65);

  --db-blue: #38bdf8;
  --db-blue-strong: #2563eb;
  --db-blue-bg: rgba(37, 99, 235, 0.2);
  --db-blue-border: rgba(56, 189, 248, 0.44);
  --db-blue-grad: linear-gradient(135deg, #2563eb 0%, #0284c7 100%);
  --db-blue-glow: 0 6px 18px rgba(37, 99, 235, 0.36);

  --db-pk-bg: rgba(245, 158, 11, 0.22);
  --db-pk-border: rgba(251, 191, 36, 0.58);
  --db-pk-ink: #fde68a;

  --db-fk-bg: rgba(56, 189, 248, 0.2);
  --db-fk-border: rgba(56, 189, 248, 0.52);
  --db-fk-ink: #bae6fd;

  --db-code-bg: rgba(56, 189, 248, 0.14);
  --db-code-border: rgba(56, 189, 248, 0.3);
  --db-code-ink: #e0f2fe;

  --db-insp-head: #0f2042;
  --db-insp-row: #0e1c36;
  --db-insp-row-alt: #132547;

  --db-edge: #38bdf8;
  --db-edge-hi: #facc15;
  --db-edge-pill-bg: #0c1830;

  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  background: var(--db-canvas);
  color: var(--db-ink);
  font-family: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.db-viewer-container.theme-light-blue {
  --db-canvas: linear-gradient(180deg, #e8f2fc 0%, #dcebfb 55%, #e6f0fc 100%);
  --db-panel: #ffffff;
  --db-panel-solid: #ffffff;
  --db-card: #ffffff;
  --db-card-hover: #f0f7ff;
  --db-well: #f1f7fe;
  --db-stage-bg: #eaf2fc;
  --db-grid-dot: rgba(37, 99, 235, 0.2);
  --db-border: #bfdbfe;
  --db-border-strong: #93c5fd;
  --db-ink: #0f172a;
  --db-ink-sec: #1e293b;
  --db-ink-muted: #475569;
  --db-shadow: 0 10px 26px -8px rgba(30, 64, 175, 0.13);

  --db-blue: #1d4ed8;
  --db-blue-strong: #2563eb;
  --db-blue-bg: #eff6ff;
  --db-blue-border: #93c5fd;
  --db-blue-grad: linear-gradient(135deg, #2563eb 0%, #0284c7 100%);
  --db-blue-glow: 0 6px 16px rgba(37, 99, 235, 0.24);

  --db-pk-bg: #fef3c7;
  --db-pk-border: #f59e0b;
  --db-pk-ink: #92400e;

  --db-fk-bg: #dbeafe;
  --db-fk-border: #3b82f6;
  --db-fk-ink: #1e40af;

  --db-code-bg: #e0edff;
  --db-code-border: #93c5fd;
  --db-code-ink: #1e3a8a;

  --db-insp-head: #eff6ff;
  --db-insp-row: #ffffff;
  --db-insp-row-alt: #f4f8ff;

  --db-edge: #2563eb;
  --db-edge-hi: #0284c7;
  --db-edge-pill-bg: #ffffff;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* ── Header ── */
.db-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 11px 16px;
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: 14px;
  box-shadow: var(--db-shadow);
  flex-shrink: 0;
}
.db-header__top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}
.db-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.db-header__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--db-blue-grad);
  border: 1px solid rgba(147, 197, 253, 0.45);
  color: #ffffff;
  box-shadow: var(--db-blue-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.db-header__text {
  min-width: 0;
}
.db-header__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.db-header__title {
  margin: 0;
  font-size: 18.5px;
  font-weight: 800;
  color: var(--db-ink);
  letter-spacing: -0.2px;
}
.db-header__pill {
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--db-blue-bg);
  border: 1px solid var(--db-blue-border);
  color: var(--db-blue);
  font-size: 11.5px;
  font-weight: 700;
}
.db-header__subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--db-ink-muted);
  font-weight: 500;
}

.db-mob-only-theme,
.db-mob-only-btn {
  display: none;
}

/* View Switcher */
.db-mode-switch {
  display: inline-flex;
  align-items: center;
  background: var(--db-well);
  border: 1px solid var(--db-border-strong);
  border-radius: 11px;
  padding: 3px;
  gap: 3px;
}
.db-mode-switch__btn {
  height: 33px;
  padding: 0 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--db-ink-muted);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.db-mode-switch__btn:hover {
  color: var(--db-blue);
  background: var(--db-blue-bg);
}
.db-mode-switch__btn.active {
  background: var(--db-blue-grad);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.34);
}

/* Header Actions & Buttons */
.db-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.db-btn {
  height: 36px;
  padding: 0 13px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: all 0.18s ease;
  border: 1px solid transparent;
}
.db-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.db-btn--primary {
  background: var(--db-blue-grad);
  color: #ffffff;
  box-shadow: var(--db-blue-glow);
}
.db-btn--primary:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}
.db-btn--ghost {
  background: var(--db-well);
  color: var(--db-blue);
  border-color: var(--db-blue-border);
}
.db-btn--ghost:hover:not(:disabled) {
  background: var(--db-blue-bg);
  transform: translateY(-1px);
}
.db-btn--soft {
  background: var(--db-blue-bg);
  color: var(--db-blue);
  border-color: var(--db-blue-border);
}
.db-btn--soft:hover:not(:disabled) {
  filter: brightness(1.06);
}

/* Toast */
.db-toast {
  position: fixed;
  top: 20px;
  right: 22px;
  z-index: 10100;
  padding: 10px 16px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(2, 6, 23, 0.35);
}
.db-toast.is-success { background: linear-gradient(135deg, #059669, #10b981); }
.db-toast.is-info { background: var(--db-blue-grad); }
.db-toast.is-error { background: linear-gradient(135deg, #dc2626, #ef4444); }
.db-toast-fade-enter-active, .db-toast-fade-leave-active { transition: all 0.22s ease; }
.db-toast-fade-enter-from, .db-toast-fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* ═══════════════ TABLE VIEW ═══════════════ */
.db-table-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: 13px;
  box-shadow: var(--db-shadow);
  flex-shrink: 0;
}
.db-toolbar-field {
  display: flex;
  align-items: center;
  gap: 8px;
}
.db-toolbar-label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--db-blue);
  white-space: nowrap;
}
.db-input {
  height: 36px;
  padding: 0 11px;
  border-radius: 9px;
  border: 1px solid var(--db-border-strong);
  background: var(--db-well);
  color: var(--db-ink);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  font-family: inherit;
}
.db-input:focus {
  border-color: var(--db-blue-strong);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
}
.db-select {
  min-width: 240px;
  max-width: 340px;
  cursor: pointer;
}
.db-select option {
  background: var(--db-panel-solid);
  color: var(--db-ink);
}
.db-toolbar-search {
  flex: 1;
  min-width: 200px;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  border-radius: 9px;
  background: var(--db-well);
  border: 1px solid var(--db-border-strong);
  color: var(--db-ink-muted);
}
.db-toolbar-search:focus-within {
  border-color: var(--db-blue-strong);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
  color: var(--db-blue);
}
.db-toolbar-search__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--db-ink);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
}
.db-clear-x {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--db-blue-bg);
  color: var(--db-blue);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.db-toolbar-bottom-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.db-toolbar-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--db-ink-muted);
  padding: 5px 11px;
  border-radius: 999px;
  background: var(--db-well);
  border: 1px solid var(--db-border);
  white-space: nowrap;
}
.db-toolbar-meta strong {
  color: var(--db-blue);
}

/* Mobile Layout Sub-Toggle */
.db-mob-layout-toggle {
  display: inline-flex;
  background: var(--db-well);
  border: 1px solid var(--db-border-strong);
  border-radius: 9px;
  padding: 2px;
  gap: 2px;
  flex-shrink: 0;
}
.db-mob-layout-btn {
  height: 28px;
  padding: 0 10px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--db-ink-muted);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}
.db-mob-layout-btn.active {
  background: var(--db-blue-grad);
  color: #ffffff;
}

/* Mobile Table Data Cards */
.db-mob-cards-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.db-mob-row-card {
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-left: 3.5px solid var(--db-blue-strong);
  border-radius: 13px;
  padding: 12px;
  box-shadow: var(--db-shadow);
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.db-mob-row-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--db-border);
}
.db-mob-row-idx {
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--db-blue-bg);
  color: var(--db-blue);
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}
.db-mob-row-key {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--db-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.db-mob-row-toggle {
  padding: 3px 8px;
  border-radius: 7px;
  border: 1px solid var(--db-blue-border);
  background: var(--db-blue-bg);
  color: var(--db-blue);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
}
.db-mob-row-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
}
.db-mob-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 6px 8px;
  border-radius: 8px;
  background: var(--db-well);
  border: 1px solid var(--db-border);
}
.db-mob-field__key {
  font-size: 10px;
  font-weight: 800;
  color: var(--db-blue);
  font-family: 'JetBrains Mono', Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.db-mob-field__val {
  font-size: 12px;
  font-weight: 600;
  color: var(--db-ink);
  word-break: break-word;
  line-height: 1.35;
}

.db-table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--db-panel);
  border-radius: 14px;
  border: 1px solid var(--db-border);
  box-shadow: var(--db-shadow);
}
.elite-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  white-space: nowrap;
}
.elite-table th {
  background: var(--db-panel-solid);
  position: sticky;
  top: 0;
  padding: 11px 14px;
  text-align: left;
  font-size: 12px;
  font-weight: 800;
  color: var(--db-blue);
  border-bottom: 2px solid var(--db-border-strong);
  cursor: pointer;
  user-select: none;
  z-index: 5;
  transition: background 0.15s;
}
.elite-table th:hover {
  background: var(--db-card-hover);
}
.db-th-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.db-sort-active { color: var(--db-blue); }
.db-sort-idle { color: var(--db-ink-muted); opacity: 0.45; }

.elite-table td {
  padding: 9px 14px;
  border-bottom: 1px solid var(--db-border);
  color: var(--db-ink-sec);
  font-size: 13px;
}
.cell-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.elite-table tbody tr:hover td {
  background: var(--db-blue-bg);
  color: var(--db-ink);
}

.db-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 9px 14px;
  background: var(--db-panel);
  border-radius: 13px;
  border: 1px solid var(--db-border);
  box-shadow: var(--db-shadow);
  flex-shrink: 0;
}
.db-page-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--db-border-strong);
  background: var(--db-well);
  color: var(--db-blue);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.db-page-btn:hover:not(:disabled) {
  background: var(--db-blue-bg);
}
.db-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.db-page-info {
  font-size: 13px;
  color: var(--db-ink-sec);
}
.db-page-info strong { color: var(--db-ink); }
.db-page-sub { color: var(--db-ink-muted); font-size: 12px; margin-left: 4px; }
.db-page-size {
  height: 34px;
  font-size: 12.5px;
  margin-left: 4px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  height: 100%;
  min-height: 260px;
  color: var(--db-ink-muted);
  font-size: 14px;
  font-weight: 600;
}

/* Spinners */
.db-spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-left-color: #ffffff;
  border-radius: 50%;
  animation: db-spin 0.8s linear infinite;
  display: inline-block;
}
.db-spinner-lg {
  width: 34px;
  height: 34px;
  border: 3px solid var(--db-border-strong);
  border-left-color: var(--db-blue-strong);
  border-radius: 50%;
  animation: db-spin 0.85s linear infinite;
}
.db-spin {
  animation: db-spin 0.9s linear infinite;
}
@keyframes db-spin {
  100% { transform: rotate(360deg); }
}

/* ═══════════════ ERD DIAGRAM VIEW ═══════════════ */
.erd-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 9px 14px;
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: 13px;
  box-shadow: var(--db-shadow);
  flex-shrink: 0;
}
.erd-filter-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.erd-search-box {
  width: 240px;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border-radius: 9px;
  background: var(--db-well);
  border: 1px solid var(--db-border-strong);
  color: var(--db-ink-muted);
}
.erd-search-box:focus-within {
  border-color: var(--db-blue-strong);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  color: var(--db-blue);
}
.erd-search-box__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--db-ink);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
}

.erd-group-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}
.erd-chip {
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--db-border);
  background: var(--db-well);
  color: var(--db-ink-sec);
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.erd-chip:hover {
  border-color: var(--db-blue-border);
  color: var(--db-blue);
}
.erd-chip.active {
  background: var(--db-blue-grad);
  border-color: transparent;
  color: #ffffff;
}
.erd-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.erd-chip.active .erd-chip-dot {
  background: #ffffff !important;
}

.erd-toggles {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.erd-toggle-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--db-border-strong);
  background: var(--db-well);
  color: var(--db-ink-muted);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.erd-toggle-btn.active {
  background: var(--db-blue-bg);
  border-color: var(--db-blue-border);
  color: var(--db-blue);
}
.erd-stats-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--db-blue-bg);
  border: 1px solid var(--db-blue-border);
  color: var(--db-blue);
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
}

/* Mobile Readable ERD Relation Cards */
.erd-mob-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.erd-mob-loading {
  padding: 40px 16px;
  border-radius: 14px;
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.erd-mob-table-card {
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-left: 4px solid #2563eb;
  border-radius: 14px;
  padding: 13px;
  box-shadow: var(--db-shadow);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.erd-mob-table-card__top-tags {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
}
.erd-mob-count-pill {
  font-size: 11px;
  font-weight: 700;
  color: var(--db-ink-muted);
}
.erd-mob-table-name {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--db-ink);
  word-break: break-word;
}
.erd-mob-table-sub {
  margin: 2px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--db-blue);
}
.erd-mob-keys {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.erd-mob-key-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 7px;
  font-size: 11px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 700;
}
.erd-mob-key-pill.is-pk {
  background: var(--db-pk-bg);
  border: 1px solid var(--db-pk-border);
  color: var(--db-pk-ink);
}
.erd-mob-key-pill.is-fk {
  background: var(--db-fk-bg);
  border: 1px solid var(--db-fk-border);
  color: var(--db-fk-ink);
}
.erd-mob-rels {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 9px 10px;
  border-radius: 10px;
  background: var(--db-well);
  border: 1px solid var(--db-border);
}
.erd-mob-rel-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.erd-mob-rel-lbl {
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.35px;
  color: var(--db-ink-muted);
}
.erd-mob-rel-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.erd-mob-rel-chip {
  padding: 4px 9px;
  border-radius: 7px;
  border: 1px solid var(--db-blue-border);
  background: var(--db-card);
  color: var(--db-blue);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.erd-mob-table-card__foot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--db-border);
}
.erd-mob-act-btn {
  height: 34px;
  font-size: 12px;
  width: 100%;
}

/* ERD Workspace */
.erd-workspace {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
  position: relative;
}

.erd-stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--db-border-strong);
  background-color: var(--db-stage-bg);
  background-image: radial-gradient(var(--db-grid-dot) 1.25px, transparent 1.25px);
  background-size: 24px 24px;
  box-shadow: var(--db-shadow);
  cursor: grab;
  user-select: none;
  touch-action: none;
}
.erd-stage.is-panning {
  cursor: grabbing;
}

.erd-world {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
}

/* SVG Edges */
.erd-svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 1;
}
.erd-edge-hit {
  pointer-events: stroke;
  cursor: pointer;
}
.erd-edge-group {
  transition: opacity 0.2s ease;
}
.erd-edge-group.is-dimmed {
  opacity: 0.14;
}
.erd-edge-path {
  stroke: var(--db-edge);
  stroke-width: 2;
  stroke-opacity: 0.72;
  transition: stroke 0.18s, stroke-width 0.18s, stroke-opacity 0.18s;
}
.erd-edge-path.is-auto {
  stroke-dasharray: 6 5;
  stroke-opacity: 0.65;
}
.erd-edge-path.is-highlighted {
  stroke: var(--db-edge-hi);
  stroke-width: 3;
  stroke-opacity: 1;
}
.erd-edge-mark {
  stroke: var(--db-edge);
  stroke-width: 1.9;
  stroke-opacity: 0.85;
}
.erd-edge-mark.is-highlighted {
  stroke: var(--db-edge-hi);
  stroke-width: 2.5;
}
.erd-edge-dot {
  fill: var(--db-edge);
}
.erd-edge-dot.is-highlighted {
  fill: var(--db-edge-hi);
}
.erd-edge-label {
  pointer-events: none;
}
.erd-edge-label__bg {
  fill: var(--db-edge-pill-bg);
  stroke: var(--db-blue-border);
  stroke-width: 1;
}
.erd-edge-label__bg.is-highlighted {
  stroke: var(--db-edge-hi);
  stroke-width: 1.6;
}
.erd-edge-label__txt {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 10.5px;
  font-weight: 700;
  fill: var(--db-blue);
}
.erd-edge-label__txt.is-highlighted {
  fill: var(--db-ink);
}

/* Entity Table Cards */
.erd-node-card {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  box-sizing: border-box;
  border-radius: 12px;
  background: var(--db-card);
  border: 1.5px solid var(--db-border-strong);
  box-shadow: 0 10px 26px -10px rgba(2, 6, 23, 0.55);
  overflow: hidden;
  transition: opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.db-viewer-container.theme-light-blue .erd-node-card {
  box-shadow: 0 8px 22px -8px rgba(30, 64, 175, 0.16);
}
.erd-node-card.is-dimmed {
  opacity: 0.22;
}
.erd-node-card.is-related {
  border-color: var(--db-blue);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35), 0 14px 30px -8px rgba(37, 99, 235, 0.35);
  z-index: 4;
}
.erd-node-card.is-selected {
  border-color: var(--db-edge-hi);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.45), 0 18px 38px -10px rgba(37, 99, 235, 0.45);
  z-index: 6;
}
.erd-node-card.is-dragging {
  z-index: 10;
  cursor: grabbing;
}

.erd-node-head {
  height: 56px;
  padding: 9px 11px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  cursor: grab;
  color: #ffffff;
}
.erd-node-head:active {
  cursor: grabbing;
}
.erd-node-head__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.erd-node-name {
  font-size: 13px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.1px;
}
.erd-node-rows {
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.24);
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
}
.erd-node-subtitle {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.erd-node-cols {
  display: flex;
  flex-direction: column;
}
.erd-col-row {
  position: relative;
  height: 27px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 7px;
  border-bottom: 1px solid var(--db-border);
  font-size: 11.5px;
  color: var(--db-ink-sec);
  box-sizing: border-box;
}
.erd-col-row:nth-child(even) {
  background: var(--db-well);
}
.erd-col-row.is-key {
  color: var(--db-ink);
  font-weight: 700;
}
.erd-col-name {
  font-family: 'JetBrains Mono', Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.erd-col-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--db-ink-muted);
  opacity: 0.55;
  margin: 0 9px;
  flex-shrink: 0;
}
.erd-port {
  position: absolute;
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--db-blue);
  transform: translateY(-50%);
  opacity: 0.7;
}
.erd-port.is-left { left: -3px; }
.erd-port.is-right { right: -3px; }

.erd-key-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 17px;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}
.erd-key-badge.is-pk {
  background: var(--db-pk-bg);
  border: 1px solid var(--db-pk-border);
  color: var(--db-pk-ink);
}
.erd-key-badge.is-fk {
  background: var(--db-fk-bg);
  border: 1px solid var(--db-fk-border);
  color: var(--db-fk-ink);
}

.erd-node-more-btn {
  height: 30px;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--db-blue);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.erd-node-more-btn:hover {
  background: var(--db-blue-bg);
}

/* Canvas Overlays */
.erd-loading-overlay,
.erd-empty-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(6, 13, 31, 0.55);
  backdrop-filter: blur(4px);
  color: var(--db-ink);
}
.db-viewer-container.theme-light-blue .erd-loading-overlay,
.db-viewer-container.theme-light-blue .erd-empty-overlay {
  background: rgba(232, 242, 252, 0.78);
}
.erd-loading-card {
  padding: 24px 30px;
  border-radius: 16px;
  background: var(--db-panel);
  border: 1px solid var(--db-border-strong);
  box-shadow: var(--db-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 260px;
}
.erd-loading-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--db-ink);
}
.erd-loading-sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--db-ink-muted);
}
.erd-loading-track {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--db-well);
  overflow: hidden;
}
.erd-loading-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--db-blue-grad);
  transition: width 0.2s ease;
}

/* Legend & Controls */
.erd-legend {
  position: absolute;
  left: 14px;
  bottom: 14px;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 11px;
  flex-wrap: wrap;
  padding: 7px 12px;
  border-radius: 10px;
  background: var(--db-panel);
  border: 1px solid var(--db-border-strong);
  box-shadow: var(--db-shadow);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--db-ink-sec);
  max-width: calc(100% - 340px);
}
.erd-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.erd-legend-line {
  width: 20px;
  height: 0;
  border-top: 2px solid var(--db-edge);
  display: inline-block;
}
.erd-legend-line.is-dashed {
  border-top-style: dashed;
}
.erd-legend__hint {
  color: var(--db-ink-muted);
  font-size: 11px;
}

.erd-canvas-controls {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 15;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px;
  border-radius: 11px;
  background: var(--db-panel);
  border: 1px solid var(--db-border-strong);
  box-shadow: var(--db-shadow);
}
.erd-ctrl-btn {
  height: 30px;
  min-width: 30px;
  padding: 0 8px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--db-blue);
  font-size: 15px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-family: inherit;
}
.erd-ctrl-btn.is-text {
  font-size: 12px;
  font-weight: 700;
}
.erd-ctrl-btn:hover {
  background: var(--db-blue-bg);
}
.erd-zoom-pct {
  font-size: 12px;
  font-weight: 800;
  color: var(--db-ink);
  min-width: 42px;
  text-align: center;
}
.erd-ctrl-sep {
  width: 1px;
  height: 18px;
  background: var(--db-border-strong);
  margin: 0 2px;
}

/* ═══════════════ READ-ONLY INSPECTOR SIDEBAR (CRISP LIGHT & DARK) ═══════════════ */
.erd-inspector {
  width: 332px;
  flex-shrink: 0;
  background: var(--db-panel);
  border: 1px solid var(--db-border-strong);
  border-radius: 16px;
  box-shadow: var(--db-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--db-ink);
}
.erd-inspector__head {
  padding: 14px 15px;
  border-bottom: 1px solid var(--db-border);
  background: var(--db-insp-head);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
}
.erd-inspector__head-info {
  min-width: 0;
}
.erd-inspector__group-tag {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 6px;
}
.erd-inspector__group-tag.is-sm {
  margin-bottom: 0;
}
.erd-inspector__name {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--db-ink);
  word-break: break-word;
}
.erd-inspector__title {
  margin: 2px 0 0;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--db-blue);
}
.erd-inspector__close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--db-border-strong);
  background: var(--db-card);
  color: var(--db-ink);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.erd-inspector__close:hover {
  background: rgba(239, 68, 68, 0.16);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.45);
}

.erd-inspector__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 15px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.erd-inspector__desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--db-ink-sec);
  font-weight: 500;
}
.erd-inspector__kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.erd-inspector__kpi {
  padding: 9px 8px;
  border-radius: 10px;
  background: var(--db-well);
  border: 1px solid var(--db-border);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.erd-inspector__kpi span {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--db-ink-muted);
  text-transform: uppercase;
}
.erd-inspector__kpi strong {
  font-size: 16.5px;
  font-weight: 800;
  color: var(--db-blue);
}
.erd-inspector__cta {
  width: 100%;
  height: 39px;
}
.erd-inspector__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.erd-inspector__sec-title {
  margin: 0;
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  color: var(--db-ink-muted);
}
.erd-rel-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.erd-rel-item {
  width: 100%;
  text-align: left;
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid var(--db-border-strong);
  background: var(--db-card);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.erd-rel-item:hover {
  border-color: var(--db-blue-strong);
  background: var(--db-blue-bg);
}
.erd-rel-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.erd-rel-target {
  font-size: 13px;
  font-weight: 800;
  color: var(--db-blue);
}
.erd-rel-card {
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--db-blue-bg);
  border: 1px solid var(--db-blue-border);
  color: var(--db-blue);
  font-size: 10.5px;
  font-weight: 800;
}
.erd-rel-item__sub {
  margin-top: 6px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  font-size: 11.5px;
}
.erd-rel-arrow {
  color: var(--db-blue);
  font-weight: 800;
}
/* High-contrast inline field chip (replaces global dark <code> tag!) */
.erd-code-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--db-code-bg);
  border: 1px solid var(--db-code-border);
  color: var(--db-code-ink);
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.3;
}
.erd-inspector__empty {
  font-size: 12px;
  font-style: italic;
  color: var(--db-ink-muted);
}

.erd-insp-col-search {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 9px;
  border-radius: 8px;
  background: var(--db-well);
  border: 1px solid var(--db-border-strong);
}
.erd-insp-col-search__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--db-ink);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
}

.erd-inspector__col-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.erd-inspector__col-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--db-insp-row);
  border: 1px solid var(--db-border);
  color: var(--db-ink);
}
.erd-inspector__col-item:nth-child(even) {
  background: var(--db-insp-row-alt);
}
.erd-inspector__col-item.is-key-row {
  border-color: var(--db-border-strong);
}
.erd-col-code {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--db-ink);
  word-break: break-all;
  line-height: 1.35;
}

.erd-inspector__mob-foot {
  padding: 10px 14px max(calc(env(safe-area-inset-bottom, 0px) + 10px), 14px);
  background: var(--db-panel);
  border-top: 1px solid var(--db-border);
  flex-shrink: 0;
}

/* Scrollbar */
.db-table-wrapper::-webkit-scrollbar,
.erd-inspector__body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.db-table-wrapper::-webkit-scrollbar-thumb,
.erd-inspector__body::-webkit-scrollbar-thumb {
  background: var(--db-border-strong);
  border-radius: 3px;
}

/* ═══════════════ MOBILE RESPONSIVE (<= 768px) ═══════════════ */
@media (max-width: 768px) {
  .db-viewer-container {
    padding: 10px 10px 76px;
    gap: 10px;
    height: auto;
    max-height: none;
    min-height: 100dvh;
    overflow: visible;
  }
  .db-header {
    padding: 11px 12px;
    gap: 10px;
  }
  .db-header__top-row {
    width: 100%;
  }
  .db-header__icon-wrap {
    width: 36px;
    height: 36px;
  }
  .db-header__title {
    font-size: 17px;
  }
  .db-header__subtitle {
    display: none;
  }
  .db-dt-only-theme,
  .db-dt-only-btn,
  .db-dt-only-ctrl {
    display: none !important;
  }
  .db-mob-only-theme {
    display: inline-flex;
    width: 36px;
    height: 36px;
    padding: 0;
    flex-shrink: 0;
  }
  .db-mob-only-btn {
    display: inline-flex;
  }
  .db-mode-switch {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .db-mode-switch__btn {
    justify-content: center;
    padding: 0 5px;
    gap: 4px;
    font-size: 11px;
  }
  .db-mode-switch__btn svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }
  .db-header__actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .db-header__actions.is-single-mob {
    grid-template-columns: 1fr;
  }
  .db-header__actions .db-btn {
    width: 100%;
    height: 35px;
    font-size: 12px;
  }

  /* Table toolbar mobile */
  .db-table-toolbar {
    padding: 10px;
    gap: 8px;
  }
  .db-toolbar-field {
    width: 100%;
  }
  .db-toolbar-label {
    display: none;
  }
  .db-select,
  .db-toolbar-search {
    width: 100%;
    min-width: 0;
    max-width: none;
  }
  .db-toolbar-bottom-row {
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
  }
  .db-mob-row-grid {
    grid-template-columns: 1fr;
  }
  .db-table-wrapper {
    max-height: 62dvh;
  }
  .db-pagination {
    padding: 8px 10px;
    gap: 8px;
  }
  .db-page-sub {
    display: none;
  }

  /* ERD Filter Bar Mobile (Compact + Horizontal Swipe Chips) */
  .erd-filter-bar {
    padding: 10px;
    gap: 8px;
  }
  .erd-filter-top {
    width: 100%;
  }
  .erd-search-box {
    flex: 1;
    width: auto;
    min-width: 0;
  }
  .erd-group-chips {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 2px;
  }
  .erd-group-chips::-webkit-scrollbar {
    display: none;
  }
  .erd-toggles {
    width: 100%;
    justify-content: space-between;
  }

  /* Canvas on Mobile */
  .erd-stage {
    height: calc(100dvh - 260px);
    min-height: 420px;
  }
  .erd-legend {
    display: none;
  }
  .erd-canvas-controls {
    left: 10px;
    right: 10px;
    bottom: 10px;
    justify-content: space-between;
    padding: 4px 6px;
  }
  .erd-ctrl-btn {
    padding: 0 6px;
  }

  /* Fullscreen Mobile Inspector Sheet with Safe-Area Top 52px */
  .erd-inspector.is-mobile-sheet {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
    border: none;
    z-index: 10080;
  }
  .erd-inspector.is-mobile-sheet .erd-inspector__head {
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) !important;
  }
  .erd-inspector.is-mobile-sheet .erd-inspector__close {
    width: 34px;
    height: 34px;
  }
}
</style>
