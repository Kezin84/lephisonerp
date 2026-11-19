<template>
  <div
    class="storage-page klt-page"
    :class="{ 'theme-light-blue': uiTheme === 'light' }"
    @click="closeContextMenu"
  >
    <!-- =========================================================
         1. TOP HEADER BAR (DUAL-THEME • SEMANTIC 5+1 PALETTE)
    ========================================================== -->
    <header class="klt-header">
      <div class="klt-header-left">
        <div class="klt-brand-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="klt-title-block">
          <div class="klt-title-row">
            <h1 class="klt-page-title">Kho Lưu Trữ</h1>
            <div class="klt-stat-pills">
              <span class="klt-stat-pill is-sky tabular-nums" title="Tổng số thư mục">
                <strong>{{ storageStats.totalFolders }}</strong> thư mục
              </span>
              <span class="klt-stat-pill is-emerald tabular-nums" title="Tổng số tệp tin">
                <strong>{{ storageStats.totalFiles }}</strong> tệp tin
              </span>
            </div>
          </div>
          <p class="klt-subtitle">Quản lý thư mục, chứng từ &amp; tài liệu theo khách hàng</p>
        </div>
      </div>

      <div class="klt-header-actions">
        <button
          type="button"
          class="klt-btn klt-btn-neutral klt-theme-btn"
          @click="toggleUiTheme"
          :title="uiTheme === 'dark' ? 'Chuyển sang giao diện Sáng (Light Blue)' : 'Chuyển sang giao diện Tối (Dark Navy)'"
        >
          <svg v-if="uiTheme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <span class="klt-theme-lbl">{{ uiTheme === 'dark' ? 'Light' : 'Dark' }}</span>
        </button>

        <button
          type="button"
          class="klt-btn klt-btn-neutral"
          :class="{ 'is-active-select': selectionMode }"
          @click="selectionMode ? cancelSelectionMode() : enterSelectionMode()"
          title="Bật/tắt chế độ chọn nhiều mục"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>{{ selectionMode ? 'Thoát chọn' : 'Chọn nhiều' }}</span>
        </button>

        <button type="button" class="klt-btn klt-btn-emerald" @click="openCreateFolderModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          <span>Thư mục mới</span>
        </button>

        <button type="button" class="klt-btn klt-btn-sky" @click="triggerUpload">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span>Tải file lên</span>
        </button>

        <button type="button" class="klt-btn klt-btn-amber" @click="openAddCustomerModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          <span>Thêm KH</span>
        </button>

        <input type="file" ref="fileInput" multiple style="display: none;" @change="handleFileUpload" />
      </div>
    </header>

    <!-- =========================================================
         2. MAIN WORKSPACE CARD (TOOLBAR + BREADCRUMB + EXPLORER)
    ========================================================== -->
    <div class="storage-content klt-workspace" @contextmenu.prevent="openEmptyContextMenu($event)">
      <!-- Unified Filter & View Toolbar -->
      <div class="klt-toolbar">
        <div class="klt-toolbar-left">
          <div class="view-toggle" role="tablist" aria-label="Chế độ xem">
            <button
              type="button"
              class="view-btn"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
              title="Xem tất cả (Dạng lưới)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              <span>Dạng lưới</span>
            </button>
            <button
              type="button"
              class="view-btn"
              :class="{ active: viewMode === 'tree' }"
              @click="viewMode = 'tree'"
              title="Xem dạng cây & xem trước"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <span>Dạng cây</span>
            </button>
          </div>

          <!-- Search Input -->
          <div class="klt-search-box">
            <svg class="klt-search-ico" xmlns="http://www.w3.org/2000/svg" width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              v-model="searchQuery"
              class="klt-search-input"
              placeholder="Tìm tên thư mục, tài liệu, khách hàng..."
            />
            <button
              v-if="searchQuery"
              type="button"
              class="klt-search-clear"
              @click="searchQuery = ''"
              title="Xóa tìm kiếm"
            >✕</button>
          </div>
        </div>

        <div class="klt-toolbar-filters">
          <div class="klt-filter-field">
            <label class="klt-filter-label">Công ty / KH</label>
            <select v-model="filterCustomer" class="klt-select is-emerald">
              <option value="">Tất cả Công ty / KH</option>
              <option v-for="c in uniqueCompanyCustomers" :key="c.key" :value="c.key">{{ c.label }}</option>
            </select>
          </div>

          <div class="klt-filter-field">
            <label class="klt-filter-label">Sắp xếp</label>
            <select v-model="sortBy" class="klt-select is-sky">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>

          <button
            type="button"
            class="klt-icon-btn"
            :disabled="loading"
            @click="fetchData"
            title="Tải lại dữ liệu từ Firebase"
          >
            <svg :class="{ 'is-spin': loading }" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
        </div>
      </div>

      <!-- Breadcrumb Bar -->
      <div class="breadcrumb klt-breadcrumb">
        <div class="klt-breadcrumb-path">
          <span @click="navigateTo(null)" class="breadcrumb-item" :class="{ active: !currentFolderId }">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Trang chủ</span>
          </span>
          <template v-for="folder in breadcrumbs" :key="folder.id">
            <span class="separator">/</span>
            <span @click="navigateTo(folder.id)" class="breadcrumb-item" :class="{ active: currentFolderId === folder.id }">
              {{ folder.name }}
            </span>
          </template>
        </div>

        <div class="klt-breadcrumb-right">
          <span v-if="clipboard.items?.length" class="klt-clipboard-pill">
            <span>{{ clipboard.action === 'cut' ? 'Đã cắt' : 'Đã sao chép' }} {{ clipboard.items.length }} mục</span>
            <button type="button" class="klt-paste-inline-btn" @click.stop="handlePaste">Dán tại đây</button>
          </span>
          <span class="klt-count-badge tabular-nums">
            {{ viewMode === 'grid' ? currentItems.length : treeItems.length }} mục
          </span>
        </div>
      </div>

      <!-- Upload Progress Strip -->
      <div v-if="uploadingFiles.length > 0" class="upload-progress-container">
        <div class="upload-title">
          <span class="spinner small"></span>
          <span>Đang tải lên {{ uploadingFiles.length }} tệp tin...</span>
        </div>
        <div class="upload-list">
          <div v-for="(f, i) in uploadingFiles" :key="i" class="upload-item">
            <span class="file-name">{{ f.name }}</span>
            <span class="upload-status-tag">Đang xử lý</span>
          </div>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading && storageData.length === 0" class="klt-loading-state">
        <span class="spinner large"></span>
        <p>Đang đồng bộ kho lưu trữ...</p>
      </div>

      <!-- Grid View -->
      <div class="file-grid" v-else-if="viewMode === 'grid' && currentItems.length > 0">
        <div
          v-for="item in currentItems"
          :key="item.id"
          class="file-item"
          :class="{
            'is-folder': item.type === 'folder',
            'selected': selectedItemId === item.id || selectedItems.includes(item.id),
            'cut-item': clipboard.action === 'cut' && clipboard.items?.some(i => i.id === item.id)
          }"
          @click.stop="handleItemClick(item)"
          @touchstart="handleTouchStart($event, item)"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd($event)"
          @dblclick.stop="!selectionMode ? (item.type === 'folder' ? navigateTo(item.id) : openFile(item.link_file)) : null"
          @contextmenu.prevent.stop="!selectionMode ? openItemContextMenu($event, item) : null"
        >
          <!-- Selection checkbox indicator -->
          <div
            v-if="selectionMode"
            class="klt-card-check"
            :class="{ checked: selectedItems.includes(item.id) }"
            aria-hidden="true"
          >
            <svg v-if="selectedItems.includes(item.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>

          <!-- Quick Action Trigger (⋮) -->
          <button
            v-if="!selectionMode"
            type="button"
            class="klt-card-more-btn"
            title="Thao tác"
            @click.stop="openItemMenuFromButton($event, item)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg>
          </button>

          <div class="item-icon" :class="item.type">
            <template v-if="item.type === 'folder'">
              <div class="klt-folder-glyph">
                <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
            </template>
            <template v-else-if="isPreviewableImage(item.link_file)">
              <div class="thumbnail-wrapper">
                <img :src="item.link_file" alt="Thumbnail" loading="lazy" />
              </div>
            </template>
            <template v-else>
              <div class="klt-file-glyph" :class="getFileExtBadge(item.name, item.link_file).cls">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="klt-file-ext-tag">{{ getFileExtBadge(item.name, item.link_file).label }}</span>
              </div>
            </template>
          </div>

          <div class="item-details">
            <h4 class="item-name" :title="item.name">{{ item.name }}</h4>
            <div v-if="item.Ten_cong_ty || item.Ten_khach_hang" class="klt-item-customer-tag" :title="[item.Ten_cong_ty, item.Ten_khach_hang].filter(Boolean).join(' - ')">
              {{ [item.Ten_cong_ty, item.Ten_khach_hang].filter(Boolean).join(' · ') }}
            </div>
            <span v-if="item.created_time" class="item-meta tabular-nums">{{ item.created_time }}</span>
          </div>
        </div>
      </div>

      <!-- Tree View & Split Preview Layout -->
      <div class="tree-layout" v-else-if="viewMode === 'tree' && treeItems.length > 0">
        <!-- Tree Column -->
        <div class="tree-column">
          <div class="file-tree">
            <div
              v-for="item in treeItems"
              :key="item.id"
              class="tree-item"
              :class="{
                'selected': selectedItemId === item.id || selectedItems.includes(item.id),
                'cut-item': clipboard.action === 'cut' && clipboard.items?.some(i => i.id === item.id)
              }"
              @click.stop="handleItemClick(item)"
              @touchstart="handleTouchStart($event, item)"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd($event)"
              @dblclick.stop="!selectionMode ? (item.type === 'folder' ? toggleFolder(item.id) : openFile(item.link_file)) : null"
              @contextmenu.prevent.stop="!selectionMode ? openItemContextMenu($event, item) : null"
            >
              <div class="tree-indent" :style="{ width: (item.depth * 20) + 'px' }"></div>

              <!-- Selection check -->
              <div
                v-if="selectionMode"
                class="klt-tree-check"
                :class="{ checked: selectedItems.includes(item.id) }"
              >
                <svg v-if="selectedItems.includes(item.id)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>

              <!-- Expand/Collapse Chevron -->
              <div class="tree-chevron" :class="{ 'invisible': item.type !== 'folder' }" @click.stop="toggleFolder(item.id)">
                <svg v-if="expandedFolders.has(item.id)" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>

              <div class="tree-icon" :class="item.type">
                <svg v-if="item.type === 'folder'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>

              <div class="tree-info">
                <div class="tree-name" :title="item.name">{{ item.name }}</div>
                <div v-if="item.Ten_cong_ty || item.Ten_khach_hang" class="tree-customer-sub">
                  {{ [item.Ten_cong_ty, item.Ten_khach_hang].filter(Boolean).join(' · ') }}
                </div>
              </div>

              <div class="tree-meta tabular-nums" v-if="item.created_time">{{ item.created_time }}</div>

              <button
                v-if="!selectionMode"
                type="button"
                class="klt-tree-more-btn"
                title="Thao tác"
                @click.stop="openItemMenuFromButton($event, item)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Preview Column (Desktop Split Pane ↔ Mobile Edge-to-Edge Fullscreen Modal) -->
        <div
          class="preview-column"
          :class="{ 'mobile-modal-active': previewItem, 'theme-light-blue': uiTheme === 'light' }"
        >
          <div v-if="previewItem" class="preview-content">
            <!-- Header bar (visible on both Desktop for files & always on Mobile with Safe-Area 52px) -->
            <div class="klt-preview-head">
              <div class="klt-preview-head-left">
                <span class="klt-preview-badge" :class="previewItem.type === 'folder' ? 'is-sky' : 'is-emerald'">
                  {{ previewItem.type === 'folder' ? 'Thư mục' : getFileExtBadge(previewItem.name, previewItem.link_file).label }}
                </span>
                <span class="klt-preview-title" :title="previewItem.name">{{ previewItem.name }}</span>
              </div>
              <div class="klt-preview-head-actions">
                <a
                  v-if="previewItem.type === 'file' && previewItem.link_file"
                  :href="previewItem.link_file"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="klt-btn klt-btn-sky klt-btn-sm"
                  style="text-decoration: none;"
                >
                  <span>Mở tab mới</span>
                </a>
                <button
                  type="button"
                  class="klt-modal-close mobile-preview-close"
                  @click.stop="selectedItemId = null"
                  aria-label="Đóng xem trước"
                >✕</button>
              </div>
            </div>

            <template v-if="previewItem.type === 'file'">
              <div v-if="isPreviewableImage(previewItem.link_file)" class="preview-image-container">
                <img :src="previewItem.link_file" alt="Preview" class="preview-image" />
              </div>
              <div v-else class="preview-iframe-container">
                <iframe :src="previewItem.link_file" class="klt-preview-iframe"></iframe>
              </div>
            </template>

            <div v-else class="preview-generic">
              <div class="klt-folder-glyph is-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h4 class="klt-preview-folder-name">{{ previewItem.name }}</h4>
              <p class="klt-preview-folder-meta">
                Thư mục
                <span v-if="previewItem.created_time" class="tabular-nums"> • {{ previewItem.created_time }}</span>
              </p>
              <div v-if="previewItem.Ten_cong_ty || previewItem.Ten_khach_hang" class="klt-item-customer-tag is-lg">
                {{ [previewItem.Ten_cong_ty, previewItem.Ten_khach_hang].filter(Boolean).join(' - ') }}
              </div>
            </div>
          </div>

          <div v-else class="preview-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <p>Chọn một thư mục hoặc tệp tin để xem trước</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="klt-empty-ico">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3>{{ searchQuery || filterCustomer ? 'Không tìm thấy mục phù hợp' : 'Thư mục trống' }}</h3>
        <p>{{ searchQuery || filterCustomer ? 'Thử xóa bộ lọc hoặc nhập từ khóa khác.' : 'Tạo thư mục mới hoặc tải tài liệu lên đây.' }}</p>
      </div>
    </div>

    <!-- =========================================================
         3. FLOATING SELECTION ACTION BAR
    ========================================================== -->
    <div class="selection-action-bar" :class="{ 'theme-light-blue': uiTheme === 'light' }" v-if="selectionMode">
      <span class="klt-sel-count tabular-nums">Đã chọn <strong>{{ selectedItems.length }}</strong> mục</span>
      <div class="selection-actions">
        <button type="button" class="klt-btn klt-btn-neutral klt-btn-sm" @click="handleBulkCopy" :disabled="selectedItems.length === 0">Copy</button>
        <button type="button" class="klt-btn klt-btn-neutral klt-btn-sm" @click="handleBulkCut" :disabled="selectedItems.length === 0">Cut</button>
        <button type="button" class="klt-btn klt-btn-rose klt-btn-sm" @click="handleBulkDeleteSelected" :disabled="selectedItems.length === 0">Xóa đã chọn</button>
        <button type="button" class="klt-btn klt-btn-neutral klt-btn-sm" @click="cancelSelectionMode">Hủy</button>
      </div>
    </div>

    <!-- =========================================================
         4. MODALS (PC CENTERED ↔ MOBILE FULLSCREEN 52px / DIALOG 56px)
    ========================================================== -->

    <!-- A. Small Dialog Modal: Create Folder / Rename -->
    <div
      class="modal-overlay klt-modal-overlay is-dialog-overlay"
      :class="{ 'theme-light-blue': uiTheme === 'light' }"
      v-if="showModal"
      @click.self="showModal = false"
    >
      <div class="klt-modal-card is-dialog-card">
        <div class="klt-modal-head is-emerald-head">
          <div class="klt-modal-head-left">
            <span class="klt-modal-head-ico">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </span>
            <div>
              <h3 class="klt-modal-title">{{ modalTitle }}</h3>
              <p class="klt-modal-sub">{{ modalAction === 'rename' ? 'Nhập tên mới cho mục đang chọn' : 'Tạo thư mục trong vị trí hiện tại' }}</p>
            </div>
          </div>
          <button type="button" class="klt-modal-close" @click="showModal = false" aria-label="Đóng">✕</button>
        </div>

        <div class="klt-modal-body">
          <label class="klt-field-label">Tên hiển thị</label>
          <input
            type="text"
            v-model="modalInputName"
            class="klt-input"
            :placeholder="modalPlaceholder"
            @keyup.enter="handleModalSubmit"
            autofocus
          />
        </div>

        <div class="klt-modal-foot">
          <button type="button" class="klt-btn klt-btn-neutral" @click="showModal = false">Hủy</button>
          <button type="button" class="klt-btn klt-btn-emerald" @click="handleModalSubmit">Lưu</button>
        </div>
      </div>
    </div>

    <!-- B. Small Dialog Modal: Duplicate Confirm -->
    <div
      class="modal-overlay klt-modal-overlay is-dialog-overlay"
      :class="{ 'theme-light-blue': uiTheme === 'light' }"
      v-if="showDuplicateModal"
      @click.self="cancelDuplicateAction"
    >
      <div class="klt-modal-card is-dialog-card">
        <div class="klt-modal-head is-amber-head">
          <div class="klt-modal-head-left">
            <span class="klt-modal-head-ico">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </span>
            <div>
              <h3 class="klt-modal-title">Trùng tên</h3>
              <p class="klt-modal-sub">Đề xuất đổi tên tự động tránh ghi đè</p>
            </div>
          </div>
          <button type="button" class="klt-modal-close" @click="cancelDuplicateAction" aria-label="Đóng">✕</button>
        </div>

        <div class="klt-modal-body">
          <p class="klt-dialog-msg">
            Tên này đã tồn tại trong thư mục hiện tại. Bạn có muốn lưu với tên tự động là
            <strong class="klt-highlight-name">{{ duplicateSuggestedName }}</strong> không?
          </p>
        </div>

        <div class="klt-modal-foot">
          <button type="button" class="klt-btn klt-btn-neutral" @click="cancelDuplicateAction">Đổi lại</button>
          <button type="button" class="klt-btn klt-btn-sky" @click="confirmDuplicateAction">Tiếp tục</button>
        </div>
      </div>
    </div>

    <!-- C. Fullscreen Mobile Modal: Label Modal (Gắn nhãn khách - cty) -->
    <div
      class="modal-overlay klt-modal-overlay is-sheet-fullscreen"
      :class="{ 'theme-light-blue': uiTheme === 'light' }"
      v-if="showLabelModal"
      @click.self="showLabelModal = false"
    >
      <div class="klt-modal-card is-sheet-card">
        <div class="klt-modal-head is-emerald-head">
          <div class="klt-modal-head-left">
            <span class="klt-modal-head-ico">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </span>
            <div class="klt-modal-head-text">
              <h3 class="klt-modal-title">Gắn nhãn khách - công ty</h3>
              <p class="klt-modal-sub">{{ labelTarget?.name }}</p>
            </div>
          </div>
          <button type="button" class="klt-modal-close" @click="showLabelModal = false" aria-label="Đóng">✕</button>
        </div>

        <div class="klt-modal-body klt-form-stack">
          <div class="klt-target-banner">
            <span class="klt-target-lbl">Áp dụng cho:</span>
            <strong>{{ labelTarget?.name }}</strong>
          </div>

          <div class="klt-form-group">
            <label class="klt-field-label">Tên khách hàng</label>
            <div class="bg-input-with-picker">
              <textarea
                rows="1"
                class="bg-wrap-input has-right-picker"
                v-auto-grow
                @keydown.enter.prevent
                v-model="labelForm.ten_khach_hang"
                placeholder="Nhập tên khách hàng..."
              ></textarea>
              <button type="button" class="bg-inline-picker-btn" @click="openCustomerPicker('ten_kh', 'label')">Chọn</button>
            </div>
          </div>

          <div class="klt-form-group">
            <label class="klt-field-label">Tên công ty</label>
            <div class="bg-input-with-picker">
              <textarea
                rows="1"
                class="bg-wrap-input has-right-picker"
                v-auto-grow
                @keydown.enter.prevent
                v-model="labelForm.ten_cong_ty"
                placeholder="Nhập tên công ty..."
              ></textarea>
              <button type="button" class="bg-inline-picker-btn" @click="openCustomerPicker('ten_cong_ty', 'label')">Chọn</button>
            </div>
          </div>

          <div class="klt-grid-2">
            <div class="klt-form-group">
              <label class="klt-field-label">Mã KH (tự động)</label>
              <input type="text" :value="generatedMaKH" class="klt-input is-readonly tabular-nums" disabled />
            </div>
            <div class="klt-form-group">
              <label class="klt-field-label">Mã CT (tự động)</label>
              <input type="text" :value="generatedMaCT" class="klt-input is-readonly tabular-nums" disabled />
            </div>
          </div>
        </div>

        <div class="klt-modal-foot">
          <button type="button" class="klt-btn klt-btn-neutral" @click="showLabelModal = false">Hủy</button>
          <button type="button" class="klt-btn klt-btn-emerald" @click="saveLabelData">Lưu nhãn</button>
        </div>
      </div>
    </div>

    <!-- D. Fullscreen Modal: Thêm / Chi Tiết Khách Hàng (100% chuẩn baogiaFirebase.vue) -->
    <div
      class="modal-overlay klt-modal-overlay bg-cust-fullscreen-overlay"
      :class="{ 'theme-light-blue': uiTheme === 'light' }"
      v-if="showCustomerModal"
      @click.self="showCustomerModal = false"
    >
      <div class="bg-cust-fullscreen-card">
        <!-- HEADER (Emerald Gradient giống baogiaFirebase) -->
        <div class="bg-modal-head-themed">
          <div class="bg-dt-only-head">THÊM / CHI TIẾT KHÁCH HÀNG</div>
          <div class="bg-m-grab-head-stack">
            <span class="bg-m-grab-eyebrow">{{ khach.Ma_khach_hang ? 'Hồ sơ đối tác • ' + khach.Ma_khach_hang : 'Hồ sơ đối tác' }}</span>
            <span class="bg-m-grab-title">Thêm / Chi tiết khách hàng</span>
          </div>
          <button type="button" class="bg-modal-x-btn" @click="showCustomerModal = false" aria-label="Đóng">✕</button>
        </div>

        <!-- TOP QUICK STATUS & ACTION TOOLBAR -->
        <div class="bg-cust-top-toolbar">
          <div class="bg-cust-toolbar-status-row">
            <span class="bg-cust-db-badge" :class="isCustomerInDB ? 'is-in-db' : 'is-new'">
              {{ isCustomerInDB ? 'ĐÃ CÓ TRONG DB' : 'KHÁCH HÀNG MỚI' }}
            </span>
            <span v-if="maKHInput || khach.Ma_khach_hang" class="bg-cust-meta-chip">
              Mã KH: <strong class="is-sky tabular-nums">{{ maKHInput || khach.Ma_khach_hang }}</strong>
            </span>
            <span v-if="khach.Ma_cong_ty || khach.Ten_cong_ty" class="bg-cust-meta-chip">
              • Mã CT: <strong class="is-emerald tabular-nums">{{ khach.Ma_cong_ty || genMaCT(khach.Ten_cong_ty) }}</strong>
            </span>
            <span class="bg-cust-meta-chip bg-cust-last-updated">
              • Cập nhật cuối: <strong class="is-sky-deep tabular-nums">{{ formatLastUpdated(khach.last_updated) }}</strong>
            </span>

            <div class="bg-cust-mobile-mini-actions">
              <button
                v-if="showSaveToDBBtn"
                type="button"
                class="bg-cust-mini-btn is-save"
                :disabled="savingCustomer"
                @click="saveCustomerToDB(false)"
              >
                {{ savingCustomer ? '...' : (isCustomerInDB ? 'Lưu DB' : '+ DB') }}
              </button>
              <button
                type="button"
                class="bg-cust-mini-btn is-reset"
                @click="resetCustomerForm"
                title="Xóa trắng thông tin khách hàng"
              >
                Reset
              </button>
            </div>
          </div>

          <div class="bg-cust-toolbar-right-actions">
            <button
              v-if="showSaveToDBBtn"
              type="button"
              class="bg-cust-tb-btn is-save"
              :disabled="savingCustomer"
              @click="saveCustomerToDB(false)"
            >
              {{ savingCustomer ? 'Đang lưu...' : (isCustomerInDB ? 'Lưu khách hàng' : 'Thêm vào DB') }}
            </button>
            <button
              type="button"
              class="bg-cust-tb-btn is-reset"
              @click="resetCustomerForm"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- BODY 2-COLUMN BENTO FORM (1fr 1.15fr) -->
        <div class="bg-save-modal-body-scroll">
          <div class="bg-save-modal-top-grid">
            <!-- LEFT COLUMN: NGƯỜI LIÊN HỆ CHÍNH + KHÁCH HÀNG PHỤ -->
            <div class="bg-cust-col">
              <!-- 1. NGƯỜI LIÊN HỆ CHÍNH -->
              <div class="bg-cust-group-box is-main">
                <div class="bg-cust-group-title is-emerald">THÔNG TIN NGƯỜI LIÊN HỆ CHÍNH</div>

                <div class="bg-cust-row-1-14">
                  <div class="bg-cust-field">
                    <label>Mã KH</label>
                    <div class="bg-input-with-picker">
                      <textarea
                        rows="1"
                        class="bg-wrap-input has-right-picker"
                        v-auto-grow
                        @keydown.enter.prevent
                        v-model="maKHInput"
                        placeholder="Tự động tạo hoặc nhập Mã KH"
                        @change="fillCustomerByMa(maKHInput)"
                        @blur="onBlurMaKH"
                      ></textarea>
                      <button type="button" class="bg-inline-picker-btn" @click="openCustomerPicker('ma_kh', 'customer')">Chọn</button>
                    </div>
                  </div>
                  <div class="bg-cust-field">
                    <label>Tên người liên hệ</label>
                    <div class="bg-input-with-picker">
                      <textarea
                        rows="1"
                        class="bg-wrap-input has-right-picker"
                        v-auto-grow
                        @keydown.enter.prevent
                        v-model="tenKHInput"
                        placeholder="Tên người liên hệ"
                        @change="fillCustomerByTen(tenKHInput)"
                        @blur="onBlurTenKH"
                      ></textarea>
                      <button type="button" class="bg-inline-picker-btn" @click="openCustomerPicker('ten_kh', 'customer')">Chọn</button>
                    </div>
                  </div>
                </div>

                <div class="bg-cust-row-1-14">
                  <div class="bg-cust-field">
                    <label>SĐT cá nhân</label>
                    <textarea
                      rows="1"
                      class="bg-wrap-input"
                      v-auto-grow
                      @keydown.enter.prevent
                      v-model="khach.So_dien_thoai_ca_nhan"
                      placeholder="Số điện thoại liên hệ"
                    ></textarea>
                  </div>
                  <div class="bg-cust-field">
                    <label>Email cá nhân</label>
                    <textarea
                      rows="1"
                      class="bg-wrap-input"
                      v-auto-grow
                      @keydown.enter.prevent
                      v-model="khach.Email_ca_nhan"
                      placeholder="Email cá nhân"
                    ></textarea>
                  </div>
                </div>

                <div class="bg-cust-field">
                  <label>Ghi chú khách hàng</label>
                  <textarea
                    rows="1"
                    class="bg-wrap-input"
                    v-auto-grow
                    @keydown.enter.prevent
                    v-model="khach.Ghi_chu"
                    placeholder="Ghi chú thêm về khách hàng..."
                  ></textarea>
                </div>
              </div>

              <!-- NÚT MỞ RỘNG MỤC PHỤ TRÊN MOBILE -->
              <button
                type="button"
                class="bg-mobile-cust-accordion-btn"
                @click="showMobileCustSubSection = !showMobileCustSubSection"
              >
                <span>Khách hàng phụ &amp; Đơn hàng PO (Tiếng Anh)</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: showMobileCustSubSection ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              <!-- 2. KHÁCH HÀNG PHỤ (NGƯỜI NHẬN HÀNG) -->
              <div class="bg-cust-group-box is-sub bg-cust-collapsible-sub" :class="{ 'is-mobile-open': showMobileCustSubSection }">
                <div class="bg-cust-group-title is-sub-title">KHÁCH HÀNG PHỤ (NGƯỜI NHẬN HÀNG)</div>
                <div class="bg-cust-row-sub-3">
                  <div class="bg-cust-field">
                    <label>Tên KH phụ</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.Ten_khach_hang_phu" placeholder="Tên người nhận phụ"></textarea>
                  </div>
                  <div class="bg-cust-field">
                    <label>SĐT phụ</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.So_dien_thoai_ca_nhan_phu" placeholder="SĐT phụ"></textarea>
                  </div>
                  <div class="bg-cust-field">
                    <label>Email phụ</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.Email_ca_nhan_phu" placeholder="Email phụ"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: THÔNG TIN CÔNG TY & GIAO DỊCH QUỐC TẾ -->
            <div class="bg-cust-col">
              <!-- 1. THÔNG TIN CÔNG TY & PHÁP LÝ -->
              <div class="bg-cust-group-box is-company">
                <div class="bg-cust-group-title is-sky">THÔNG TIN CÔNG TY &amp; PHÁP LÝ</div>

                <div class="bg-cust-row-22-1">
                  <div class="bg-cust-field">
                    <label>Tên công ty</label>
                    <div class="bg-input-with-picker">
                      <textarea
                        rows="1"
                        class="bg-wrap-input has-right-picker"
                        v-auto-grow
                        @keydown.enter.prevent
                        v-model="khach.Ten_cong_ty"
                        placeholder="Tên công ty đầy đủ"
                        @change="fillCustomerByCongTy(khach.Ten_cong_ty)"
                        @blur="onBlurCongTy"
                      ></textarea>
                      <button type="button" class="bg-inline-picker-btn" @click="openCustomerPicker('ten_cong_ty', 'customer')">Chọn</button>
                    </div>
                  </div>
                  <div class="bg-cust-field">
                    <label>Mã số thuế (MST)</label>
                    <div class="bg-input-with-picker">
                      <textarea
                        rows="1"
                        class="bg-wrap-input has-right-picker"
                        v-auto-grow
                        @keydown.enter.prevent
                        v-model="khach.MST"
                        @change="onMSTChange"
                        placeholder="Mã số thuế"
                      ></textarea>
                      <button type="button" class="bg-inline-picker-btn" @click="openCustomerPicker('mst', 'customer')">Chọn</button>
                    </div>
                  </div>
                </div>

                <div class="bg-cust-row-22-1">
                  <div class="bg-cust-field">
                    <label>Địa chỉ xuất hóa đơn</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.Dia_chi_cong_ty" placeholder="Địa chỉ trụ sở / xuất hóa đơn"></textarea>
                  </div>
                  <div class="bg-cust-field">
                    <label>Website</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.Website_cong_ty" placeholder="Website công ty"></textarea>
                  </div>
                </div>

                <div class="bg-cust-row-company-3">
                  <div class="bg-cust-field">
                    <label>SĐT công ty</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.So_dien_thoai_cong_ty" placeholder="SĐT bàn / công ty"></textarea>
                  </div>
                  <div class="bg-cust-field">
                    <label>Email công ty / nhận HĐ</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.Email_cong_ty" placeholder="Email nhận hóa đơn"></textarea>
                  </div>
                  <div class="bg-cust-field">
                    <label>Ngành nghề kinh doanh</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.Nganh_nghe_cong_ty" placeholder="Ngành nghề chính"></textarea>
                  </div>
                </div>
              </div>

              <!-- 2. THÔNG TIN GIAO DỊCH PO / TIẾNG ANH -->
              <div class="bg-cust-group-box is-sub bg-cust-collapsible-sub" :class="{ 'is-mobile-open': showMobileCustSubSection }">
                <div class="bg-cust-group-title is-sub-title">THÔNG TIN ĐƠN HÀNG PO / TIẾNG ANH (COMPANY • ADDRESS • TEL • FAX)</div>
                <div class="bg-cust-row-po-4">
                  <div class="bg-cust-field">
                    <label>COMPANY</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.COMPANY" placeholder="Tên công ty trên PO"></textarea>
                  </div>
                  <div class="bg-cust-field">
                    <label>TEL</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.TEL" placeholder="TEL"></textarea>
                  </div>
                  <div class="bg-cust-field">
                    <label>Fax</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.So_fax_cong_ty" placeholder="Số Fax"></textarea>
                  </div>
                  <div class="bg-cust-field">
                    <label>ADDRESS</label>
                    <textarea rows="1" class="bg-wrap-input" v-auto-grow @keydown.enter.prevent v-model="khach.ADDRESS" placeholder="Địa chỉ Tiếng Anh trên PO"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="bg-cust-modal-footer">
          <button
            v-if="showSaveToDBBtn"
            type="button"
            class="bg-cust-foot-save-btn"
            :disabled="savingCustomer"
            @click="saveCustomerToDB(true)"
          >
            <span v-if="savingCustomer">Đang lưu...</span>
            <span v-else>{{ isCustomerInDB ? 'LƯU KHÁCH HÀNG' : 'THÊM VÀO DB' }}</span>
          </button>
          <button type="button" class="bg-cust-foot-close-btn" @click="showCustomerModal = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- E. Modal Chọn Khách Hàng (100% chuẩn showCustomerPickerModal trong baogiaFirebase.vue) -->
    <div
      class="modal-overlay klt-modal-overlay is-sheet-fullscreen"
      :class="{ 'theme-light-blue': uiTheme === 'light' }"
      style="z-index: 10075;"
      v-if="showCustomerPickerModal"
      @click.self="showCustomerPickerModal = false"
    >
      <div class="bg-picker-modal-card">
        <!-- HEADER -->
        <div class="bg-picker-modal-head">
          <h3 class="bg-dt-only-head">{{ customerPickerTitle }}</h3>
          <div class="bg-m-grab-head-stack">
            <span class="bg-m-grab-eyebrow">Danh bạ đối tác</span>
            <span class="bg-m-grab-title">{{ customerPickerColumnLabel ? 'Chọn ' + customerPickerColumnLabel : 'Chọn khách hàng' }}</span>
          </div>
          <button type="button" class="bg-modal-x-btn" @click="showCustomerPickerModal = false" aria-label="Đóng">✕</button>
        </div>

        <!-- TOP SEARCH TOOLBAR -->
        <div class="bg-picker-search-toolbar">
          <div class="bg-picker-search-row">
            <input
              v-model="customerPickerSearch"
              type="text"
              class="bg-picker-search-input"
              :placeholder="'Tìm kiếm ' + customerPickerColumnLabel + '...'"
              autofocus
            />
            <button
              v-if="customerPickerSearch"
              type="button"
              class="bg-picker-search-clear-btn"
              @click="customerPickerSearch = ''"
            >
              Xóa
            </button>
          </div>
          <span class="bg-picker-counter tabular-nums">
            Hiển thị <strong>{{ visibleCustomerPickerList.length }}</strong> / {{ filteredCustomerPickerList.length }}
          </span>
        </div>

        <!-- TABLE WORKSPACE (LAZY LOADING 20 HÀNG) -->
        <div class="bg-picker-table-wrap">
          <div class="bg-picker-table-box" @scroll="onCustomerPickerScroll">
            <table class="bg-picker-data-table">
              <thead>
                <tr>
                  <th style="width: 56px; text-align: center;">STT</th>
                  <th style="text-align: left;">{{ customerPickerColumnLabel }}</th>
                  <th style="width: 106px; text-align: center;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredCustomerPickerList.length === 0">
                  <td colspan="3" class="bg-picker-empty-td">
                    Không tìm thấy dữ liệu phù hợp với từ khóa "{{ customerPickerSearch }}".
                  </td>
                </tr>
                <tr
                  v-for="(cus, idx) in visibleCustomerPickerList"
                  :key="(cus.Ma_khach_hang || '') + '_' + idx"
                  class="bg-picker-row"
                  :class="{ 'is-selected': isCustomerRowSelected(cus) }"
                  @click="selectCustomerFromPicker(cus)"
                >
                  <td style="text-align: center; font-weight: 700; opacity: 0.75;" class="tabular-nums">{{ idx + 1 }}</td>
                  <td style="font-weight: 700;">{{ getCustomerPickerValue(cus) }}</td>
                  <td style="text-align: center;" @click.stop>
                    <button
                      type="button"
                      class="bg-picker-select-btn"
                      @click="selectCustomerFromPicker(cus)"
                    >
                      {{ isCustomerRowSelected(cus) ? 'Đang chọn' : 'Chọn' }}
                    </button>
                  </td>
                </tr>
                <tr
                  v-if="visibleCustomerPickerList.length < filteredCustomerPickerList.length"
                  class="bg-picker-more-row"
                  @click="customerPickerVisibleCount += 20"
                >
                  <td colspan="3">
                    Đang hiển thị {{ visibleCustomerPickerList.length }} / {{ filteredCustomerPickerList.length }} dòng — Cuộn xuống hoặc bấm để tải thêm 20 dòng...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="bg-picker-modal-footer">
          <button type="button" class="bg-cust-foot-close-btn" @click="showCustomerPickerModal = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- F. Fullscreen Mobile Modal: Upload Modal -->
    <div
      class="modal-overlay klt-modal-overlay is-sheet-fullscreen"
      :class="{ 'theme-light-blue': uiTheme === 'light' }"
      v-if="showUploadModal"
      @click.self="showUploadModal = false"
    >
      <div class="klt-modal-card is-sheet-card is-wide-sheet">
        <div class="klt-modal-head is-sky-head">
          <div class="klt-modal-head-left">
            <span class="klt-modal-head-ico">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </span>
            <div>
              <h3 class="klt-modal-title">Tải tệp tin lên</h3>
              <p class="klt-modal-sub">Hỗ trợ chọn nhiều file, kéo thả hoặc dán trực tiếp (Ctrl+V)</p>
            </div>
          </div>
          <button type="button" class="klt-modal-close" @click="showUploadModal = false" aria-label="Đóng">✕</button>
        </div>

        <div class="klt-modal-body">
          <div
            class="upload-dropzone"
            :class="{ 'dragging': isDragging }"
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <div class="klt-drop-ico">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <h4 class="klt-drop-title">Chọn file hoặc kéo thả vào đây</h4>
            <p class="klt-drop-sub">Ảnh sẽ được tự động tối ưu kích thước; bạn có thể dán (Ctrl+V) trực tiếp vào cửa sổ này</p>
            <span class="klt-btn klt-btn-sky klt-btn-sm" style="margin-top: 12px;">Chọn tệp từ thiết bị</span>
          </div>
        </div>

        <div class="klt-modal-foot">
          <button type="button" class="klt-btn klt-btn-neutral" @click="showUploadModal = false">Hủy</button>
        </div>
      </div>
    </div>

    <!-- G. Small Dialog Modal: Custom Alert / Confirm -->
    <div
      class="modal-overlay klt-modal-overlay is-dialog-overlay"
      :class="{ 'theme-light-blue': uiTheme === 'light' }"
      style="z-index: 10090;"
      v-if="customDialog.show"
      @click.self="customDialog.type === 'confirm' ? customDialog.onCancel() : customDialog.onConfirm()"
    >
      <div class="klt-modal-card is-dialog-card is-center-alert">
        <div class="klt-alert-icon" :class="customDialog.type === 'confirm' ? 'is-rose' : 'is-sky'">
          <svg v-if="customDialog.type === 'confirm'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <h3 class="klt-alert-title">{{ customDialog.title }}</h3>
        <p class="klt-alert-desc">{{ customDialog.message }}</p>
        <div class="klt-alert-actions">
          <button
            v-if="customDialog.type === 'confirm'"
            type="button"
            class="klt-btn klt-btn-neutral"
            @click="customDialog.onCancel"
          >
            {{ customDialog.cancelText }}
          </button>
          <button
            type="button"
            class="klt-btn"
            :class="customDialog.type === 'alert' ? 'klt-btn-sky' : 'klt-btn-rose'"
            @click="customDialog.onConfirm"
          >
            {{ customDialog.confirmText }}
          </button>
        </div>
      </div>
    </div>

    <!-- =========================================================
         5. CONTEXT MENU (DUAL-THEME & VIEWPORT-CLAMPED)
    ========================================================== -->
    <div
      v-if="contextMenu.show"
      class="custom-context-menu"
      :class="{ 'theme-light-blue': uiTheme === 'light' }"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
    >
      <template v-if="contextMenu.type === 'item'">
        <div class="menu-item" @click="enterSelectionMode">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>Chọn nhiều</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" @click="handleCopy">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy</span> <span class="shortcut">Ctrl+C</span>
        </div>
        <div class="menu-item" @click="handleCut">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
          <span>Cut</span> <span class="shortcut">Ctrl+X</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" @click="openRenameModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>Đổi tên</span>
        </div>
        <div class="menu-item" @click="openLabelModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          <span>Gắn nhãn khách - cty</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item danger" @click="handleDelete">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>Xóa</span> <span class="shortcut">Del</span>
        </div>
      </template>

      <template v-else-if="contextMenu.type === 'empty'">
        <div class="menu-item" @click="openCreateFolderModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          <span>Thư mục mới</span>
        </div>
        <div class="menu-item" @click="triggerUploadFromMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span>Tải file lên</span>
        </div>
        <div class="menu-divider"></div>
        <div
          class="menu-item"
          :class="{ disabled: !clipboard.items || clipboard.items.length === 0 }"
          @click="(clipboard.items && clipboard.items.length > 0) ? handlePaste() : null"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          <span>Paste</span> <span class="shortcut">Ctrl+V</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, update, remove } from 'firebase/database'
import { useBinaryAppTheme } from '../composables/useAppTheme'

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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const database = getDatabase(app)

const sanitizeFirebaseKey = (key) => String(key || '').trim().replace(/[.#$/[\]]/g, '_')

const KLT_HEADERS = [
  'id', 'parents_id', 'parents_name', 'type',
  'Ma_khach_hang', 'Ten_khach_hang', 'Ma_cong_ty', 'Ten_cong_ty',
  'Ten_file', 'link_file', 'created_time'
]

// --- Dual Theme (Synced globally across all pages via useAppTheme) ---
const { uiTheme, toggleUiTheme } = useBinaryAppTheme()

// --- State ---
const currentFolderId = ref(null)
const storageData = ref([])
const viewMode = ref('grid') // 'grid' | 'tree'
const expandedFolders = ref(new Set([''])) // root is always expanded
const loading = ref(false)
const fileInput = ref(null)
const uploadingFiles = ref([])

// Filter, Search & Sort State
const searchQuery = ref('')
const filterCustomer = ref('')
const sortBy = ref('newest') // 'newest' | 'oldest'

// Multi-select State
const selectionMode = ref(false)
const selectedItems = ref([])

// Modal State
const showModal = ref(false)
const modalTitle = ref('')
const modalPlaceholder = ref('')
const modalInputName = ref('')
const modalAction = ref('') // 'create_folder' | 'rename'
const itemToRename = ref(null)

// --- Custom Dialog State ---
const customDialog = ref({
  show: false,
  type: 'alert',
  title: 'Thông báo',
  message: '',
  confirmText: 'Đóng',
  cancelText: 'Hủy',
  onConfirm: null,
  onCancel: null
})

const showAlert = (message, title = 'Thông báo') => {
  return new Promise((resolve) => {
    customDialog.value = {
      show: true,
      type: 'alert',
      title,
      message,
      confirmText: 'Đóng',
      onConfirm: () => {
        customDialog.value.show = false
        resolve()
      }
    }
  })
}

const showConfirm = (message, title = 'Xác nhận') => {
  return new Promise((resolve) => {
    customDialog.value = {
      show: true,
      type: 'confirm',
      title,
      message,
      confirmText: 'Đồng ý',
      cancelText: 'Hủy',
      onConfirm: () => {
        customDialog.value.show = false
        resolve(true)
      },
      onCancel: () => {
        customDialog.value.show = false
        resolve(false)
      }
    }
  })
}

// Context Menu & Selection State
const selectedItemId = ref(null)
const clipboard = ref({ action: null, items: [], descendants: [] }) // action: 'copy' | 'cut'
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  type: 'empty', // 'item' | 'empty'
  item: null
})

// Label Modal State
const showLabelModal = ref(false)
const labelTarget = ref(null)
const labelForm = ref({ ten_khach_hang: '', ten_cong_ty: '' })

// --- Code Gen Helpers ---
const generateCurrentTime = () => {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
}

const normalizeKLTRecord = (raw, key) => {
  if (!raw) return null
  let item = null
  if (Array.isArray(raw)) {
    item = {}
    KLT_HEADERS.forEach((h, idx) => {
      item[h] = raw[idx] !== undefined && raw[idx] !== null ? String(raw[idx]) : ''
    })
    if (!item.id) item.id = key || ''
  } else if (typeof raw === 'object') {
    if (!raw.type && !raw.Ten_file && !raw.parents_name && raw.ten_kho) {
      return null
    }
    item = {
      id: String(raw.id ?? key ?? ''),
      parents_id: String(raw.parents_id ?? ''),
      parents_name: String(raw.parents_name ?? ''),
      type: String(raw.type ?? ''),
      Ma_khach_hang: String(raw.Ma_khach_hang ?? raw.ma_khach_hang ?? ''),
      Ten_khach_hang: String(raw.Ten_khach_hang ?? raw.ten_khach_hang ?? ''),
      Ma_cong_ty: String(raw.Ma_cong_ty ?? raw.ma_cong_ty ?? ''),
      Ten_cong_ty: String(raw.Ten_cong_ty ?? raw.ten_cong_ty ?? ''),
      Ten_file: String(raw.Ten_file ?? raw.ten_file ?? ''),
      link_file: String(raw.link_file ?? ''),
      created_time: String(raw.created_time ?? '')
    }
  }
  if (!item || !item.id) return null
  if (!item.type) {
    item.type = item.link_file || item.Ten_file ? 'file' : 'folder'
  }
  let display = ''
  if (item.type === 'folder') {
    display = item.parents_name || raw.name || ''
  } else {
    display = item.Ten_file || raw.name || ''
  }
  return {
    ...item,
    name: display || 'Không tên'
  }
}

const toCleanKLTRecord = (item) => {
  const clean = {}
  KLT_HEADERS.forEach((h) => {
    clean[h] = item[h] !== undefined && item[h] !== null ? item[h] : ''
  })
  if (!clean.created_time) {
    clean.created_time = generateCurrentTime()
  }
  return clean
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
  return removeDiacritics(congTy).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
}

const genMaKH = (tenKH, congTy) => {
  const tenClean = removeDiacritics(tenKH).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
  const maCT = genMaCT(congTy)
  if (!tenClean && !maCT) return ''
  return [tenClean, maCT].filter(Boolean).join('-')
}

const generatedMaKH = computed(() => genMaKH(labelForm.value.ten_khach_hang, labelForm.value.ten_cong_ty))
const generatedMaCT = computed(() => genMaCT(labelForm.value.ten_cong_ty))

// --- Auto-grow textarea directive (100% chuẩn baogiaFirebase.vue) ---
const autoResizeTextarea = (el) => {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.max(el.scrollHeight, 38)}px`
}
const vAutoGrow = {
  mounted(el) {
    autoResizeTextarea(el)
    el._kltAutoGrow = () => autoResizeTextarea(el)
    el.addEventListener('input', el._kltAutoGrow)
  },
  updated(el) {
    autoResizeTextarea(el)
  },
  unmounted(el) {
    if (el._kltAutoGrow) el.removeEventListener('input', el._kltAutoGrow)
  }
}

// --- Customer Workspace Modal State (100% chuẩn baogiaFirebase.vue) ---
const createEmptyKhach = () => ({
  Ma_khach_hang: '',
  Ten_khach_hang: '',
  Email_ca_nhan: '',
  So_dien_thoai_ca_nhan: '',
  Ma_cong_ty: '',
  Ten_cong_ty: '',
  So_dien_thoai_cong_ty: '',
  So_fax_cong_ty: '',
  Dia_chi_cong_ty: '',
  Email_cong_ty: '',
  Website_cong_ty: '',
  Hoa_hong: '',
  Tong_chi_tieu: '',
  Trang_thai: '',
  Tong_loi_nhuan: '',
  Ghi_chu: '',
  Ten_khach_hang_phu: '',
  So_dien_thoai_ca_nhan_phu: '',
  Email_ca_nhan_phu: '',
  MST: '',
  COMPANY: '',
  ADDRESS: '',
  TEL: '',
  Nganh_nghe_cong_ty: '',
  last_updated: ''
})

const showCustomerModal = ref(false)
const showMobileCustSubSection = ref(false)
const khach = ref(createEmptyKhach())
const maKHInput = ref('')
const tenKHInput = ref('')
const isExistingCustomer = ref(false)
const originalKhach = ref(null)
const savingCustomer = ref(false)

const isCustomerInDB = computed(() => {
  const ma = (maKHInput.value?.trim() || khach.value.Ma_khach_hang?.trim() || '').toUpperCase()
  if (ma && customersList.value.some(c => String(c.Ma_khach_hang || '').trim().toUpperCase() === ma)) {
    return true
  }
  return isExistingCustomer.value
})

const showSaveToDBBtn = computed(() => {
  const k = khach.value
  const ma = maKHInput.value?.trim() || k.Ma_khach_hang?.trim()
  const ten = tenKHInput.value?.trim() || k.Ten_khach_hang?.trim()
  const congTy = k.Ten_cong_ty?.trim()
  if (!ma && !ten && !congTy) return false

  if (!isExistingCustomer.value) {
    return !!(ma || ten || congTy)
  }

  if (!originalKhach.value) return false
  const o = originalKhach.value
  return (
    (maKHInput.value || k.Ma_khach_hang || '') !== (o.Ma_khach_hang || '') ||
    (tenKHInput.value || k.Ten_khach_hang || '') !== (o.Ten_khach_hang || '') ||
    (k.Email_ca_nhan || '') !== (o.Email_ca_nhan || '') ||
    (k.So_dien_thoai_ca_nhan || '') !== (o.So_dien_thoai_ca_nhan || '') ||
    (k.Ten_cong_ty || '') !== (o.Ten_cong_ty || '') ||
    (k.MST || '') !== (o.MST || '') ||
    (k.So_dien_thoai_cong_ty || '') !== (o.So_dien_thoai_cong_ty || '') ||
    (k.So_fax_cong_ty || '') !== (o.So_fax_cong_ty || '') ||
    (k.Dia_chi_cong_ty || '') !== (o.Dia_chi_cong_ty || '') ||
    (k.Email_cong_ty || '') !== (o.Email_cong_ty || '') ||
    (k.Website_cong_ty || '') !== (o.Website_cong_ty || '') ||
    (k.Ghi_chu || '') !== (o.Ghi_chu || '') ||
    (k.Ten_khach_hang_phu || '') !== (o.Ten_khach_hang_phu || '') ||
    (k.So_dien_thoai_ca_nhan_phu || '') !== (o.So_dien_thoai_ca_nhan_phu || '') ||
    (k.Email_ca_nhan_phu || '') !== (o.Email_ca_nhan_phu || '') ||
    (k.COMPANY || '') !== (o.COMPANY || '') ||
    (k.ADDRESS || '') !== (o.ADDRESS || '') ||
    (k.TEL || '') !== (o.TEL || '') ||
    (k.Nganh_nghe_cong_ty || '') !== (o.Nganh_nghe_cong_ty || '')
  )
})

watch(tenKHInput, (val) => {
  const clean = val ?? ''
  if (khach.value.Ten_khach_hang !== clean) khach.value.Ten_khach_hang = clean
})
watch(() => khach.value.Ten_khach_hang, (val) => {
  const clean = val ?? ''
  if (tenKHInput.value !== clean) tenKHInput.value = clean
})
watch(maKHInput, (val) => {
  const clean = val ?? ''
  if (khach.value.Ma_khach_hang !== clean) khach.value.Ma_khach_hang = clean
})
watch(() => khach.value.Ma_khach_hang, (val) => {
  const clean = val ?? ''
  if (maKHInput.value !== clean) maKHInput.value = clean
})
watch(
  () => [tenKHInput.value, khach.value.Ten_cong_ty],
  ([ten, congTy]) => {
    const tenStr = ten || ''
    const ctStr = congTy || ''
    if (khach.value.Ten_khach_hang !== tenStr) khach.value.Ten_khach_hang = tenStr
    if (isExistingCustomer.value) return
    const newMaKH = genMaKH(tenStr, ctStr)
    if (newMaKH) {
      maKHInput.value = newMaKH
      khach.value.Ma_khach_hang = newMaKH
    }
    khach.value.Ma_cong_ty = genMaCT(ctStr)
  }
)

const formatLastUpdated = (raw) => {
  if (!raw) return 'Chưa lưu'
  const str = String(raw).trim()
  if (!str) return 'Chưa lưu'
  const d = new Date(str)
  if (!Number.isNaN(d.getTime())) {
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  }
  return str
}

// --- Customer Picker Modal State (100% chuẩn showCustomerPickerModal trong baogiaFirebase.vue) ---
const normalizePickerStr = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi, '')

const showCustomerPickerModal = ref(false)
const customerPickerField = ref('ma_kh') // 'ma_kh' | 'ten_kh' | 'ten_cong_ty' | 'mst'
const customerPickerTarget = ref('customer') // 'customer' | 'label'
const customerPickerSearch = ref('')
const customerPickerVisibleCount = ref(20)

const customerPickerTitle = computed(() => {
  switch (customerPickerField.value) {
    case 'ma_kh': return 'CHỌN MÃ KHÁCH HÀNG'
    case 'ten_kh': return 'CHỌN TÊN NGƯỜI LIÊN HỆ / KHÁCH HÀNG'
    case 'ten_cong_ty': return 'CHỌN TÊN CÔNG TY'
    case 'mst': return 'CHỌN MÃ SỐ THUẾ (MST)'
    default: return 'CHỌN KHÁCH HÀNG'
  }
})

const customerPickerColumnLabel = computed(() => {
  switch (customerPickerField.value) {
    case 'ma_kh': return 'Mã khách hàng'
    case 'ten_kh': return 'Tên người liên hệ (Khách hàng)'
    case 'ten_cong_ty': return 'Tên công ty'
    case 'mst': return 'Mã số thuế (MST)'
    default: return 'Khách hàng'
  }
})

const getCustomerPickerValue = (cus) => {
  if (!cus) return ''
  switch (customerPickerField.value) {
    case 'ma_kh': return String(cus.Ma_khach_hang || '').trim()
    case 'ten_kh': return String(cus.Ten_khach_hang || '').trim()
    case 'ten_cong_ty': return String(cus.Ten_cong_ty || '').trim()
    case 'mst': return String(cus.MST || '').trim()
    default: return ''
  }
}

const isCustomerRowSelected = (cus) => {
  const val = getCustomerPickerValue(cus)
  if (!val) return false
  if (customerPickerTarget.value === 'label') {
    if (customerPickerField.value === 'ten_kh') return labelForm.value.ten_khach_hang === val
    if (customerPickerField.value === 'ten_cong_ty') return labelForm.value.ten_cong_ty === val
    return false
  }
  switch (customerPickerField.value) {
    case 'ma_kh': return (maKHInput.value || khach.value.Ma_khach_hang) === val
    case 'ten_kh': return (tenKHInput.value || khach.value.Ten_khach_hang) === val
    case 'ten_cong_ty': return khach.value.Ten_cong_ty === val
    case 'mst': return khach.value.MST === val
    default: return false
  }
}

watch(customerPickerSearch, () => {
  customerPickerVisibleCount.value = 20
})

const filteredCustomerPickerList = computed(() => {
  const q = normalizePickerStr(removeDiacritics(customerPickerSearch.value.trim()))
  const seen = new Set()
  const result = []
  for (const c of customersList.value || []) {
    const val = getCustomerPickerValue(c)
    if (!val) continue
    const key = val.toLowerCase()
    if (seen.has(key)) continue
    if (q) {
      const hay = normalizePickerStr(removeDiacritics(val))
      if (!hay.includes(q)) continue
    }
    seen.add(key)
    result.push(c)
  }
  return result
})

const visibleCustomerPickerList = computed(() => {
  return filteredCustomerPickerList.value.slice(0, customerPickerVisibleCount.value)
})

const onCustomerPickerScroll = (e) => {
  const el = e.target
  if (!el) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
    if (customerPickerVisibleCount.value < filteredCustomerPickerList.value.length) {
      customerPickerVisibleCount.value += 20
    }
  }
}

// --- Stats & File Badge Helpers ---
const storageStats = computed(() => {
  let totalFolders = 0
  let totalFiles = 0
  for (const item of storageData.value) {
    if (item.type === 'folder') totalFolders++
    else totalFiles++
  }
  return { totalFolders, totalFiles }
})

const getFileExtBadge = (name, url) => {
  const src = String(name || url || '').toLowerCase()
  if (/\.pdf(\?|$)/.test(src)) return { label: 'PDF', cls: 'is-rose' }
  if (/\.(xlsx|xls|xlsb|csv)(\?|$)/.test(src)) return { label: 'XLS', cls: 'is-emerald' }
  if (/\.(doc|docx)(\?|$)/.test(src)) return { label: 'DOC', cls: 'is-sky' }
  if (/\.(zip|rar|7z)(\?|$)/.test(src)) return { label: 'ZIP', cls: 'is-amber' }
  if (/\.(jpeg|jpg|gif|png|webp|svg|bmp)(\?|$)/.test(src)) return { label: 'IMG', cls: 'is-sky' }
  return { label: 'FILE', cls: 'is-slate' }
}

// --- Filter Computed ---
const uniqueCompanyCustomers = computed(() => {
  const map = new Map()
  storageData.value.forEach(c => {
    if (!c.Ten_cong_ty && !c.Ten_khach_hang) return
    const key = `${c.Ten_cong_ty || ''}_${c.Ten_khach_hang || ''}`
    if (!map.has(key)) {
      const label = [c.Ten_cong_ty, c.Ten_khach_hang].filter(Boolean).join(' - ')
      map.set(key, { key, label })
    }
  })
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
})

const itemCustomerMap = computed(() => {
  const map = new Map()
  storageData.value.forEach(item => {
    if (item.Ten_cong_ty || item.Ten_khach_hang) {
      map.set(item.id, `${item.Ten_cong_ty || ''}_${item.Ten_khach_hang || ''}`)
    }
  })
  const resolveCustomer = (id, visited = new Set()) => {
    if (!id || visited.has(id)) return null
    if (map.has(id)) return map.get(id)
    visited.add(id)
    const item = storageData.value.find(i => i.id === id)
    if (item && item.parents_id) {
      const parentLabel = resolveCustomer(item.parents_id, visited)
      if (parentLabel) {
        map.set(id, parentLabel)
        return parentLabel
      }
    }
    return null
  }
  storageData.value.forEach(item => resolveCustomer(item.id))
  return map
})

const filteredStorageData = computed(() => {
  let list = storageData.value
  if (filterCustomer.value) {
    list = list.filter(item => itemCustomerMap.value.get(item.id) === filterCustomer.value)
  }
  const kw = searchQuery.value.trim().toLowerCase()
  if (kw) {
    const kwNoAccent = removeDiacritics(kw)
    list = list.filter(item => {
      const hay = `${item.name || ''} ${item.Ten_khach_hang || ''} ${item.Ten_cong_ty || ''}`.toLowerCase()
      return hay.includes(kw) || removeDiacritics(hay).includes(kwNoAccent)
    })
  }
  return list
})

// --- Sorting Logic ---
const parseDateString = (dateStr) => {
  if (!dateStr) return 0
  const match = dateStr.match(/(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return 0
  const [, hh, mm, dd, MM, yyyy] = match
  return new Date(`${yyyy}-${MM}-${dd}T${hh}:${mm}:00`).getTime()
}

const sortItems = (items) => {
  return items.sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1
    if (a.type !== 'folder' && b.type === 'folder') return 1

    const timeA = parseDateString(a.created_time)
    const timeB = parseDateString(b.created_time)

    if (sortBy.value === 'newest') {
      if (timeB === timeA) return a.name.localeCompare(b.name)
      return timeB - timeA
    } else {
      if (timeA === timeB) return a.name.localeCompare(b.name)
      return timeA - timeB
    }
  })
}

// --- Computed ---
const currentItems = computed(() => {
  let items = []
  if (searchQuery.value.trim()) {
    items = filteredStorageData.value
  } else if (filterCustomer.value) {
    items = filteredStorageData.value.filter(item => item.type !== 'folder')
  } else {
    items = filteredStorageData.value.filter(item => item.parents_id === (currentFolderId.value || ''))
  }
  return sortItems([...items])
})

// Tree View Logic
const treeItems = computed(() => {
  if (searchQuery.value.trim()) {
    return sortItems(filteredStorageData.value.map(item => ({ ...item, depth: 0 })))
  }

  if (filterCustomer.value) {
    const files = filteredStorageData.value
      .filter(item => item.type !== 'folder')
      .map(item => ({ ...item, depth: 0 }))
    return sortItems(files)
  }

  const result = []

  const buildTree = (parentId, depth) => {
    if (!expandedFolders.value.has(parentId)) return

    const children = filteredStorageData.value.filter(i => i.parents_id === parentId)
    sortItems(children)

    for (const child of children) {
      result.push({ ...child, depth })
      if (child.type === 'folder') {
        buildTree(child.id, depth + 1)
      }
    }
  }

  buildTree('', 0)
  return result
})

const toggleFolder = (folderId) => {
  const newSet = new Set(expandedFolders.value)
  if (newSet.has(folderId)) {
    newSet.delete(folderId)
  } else {
    newSet.add(folderId)
  }
  expandedFolders.value = newSet
}

const previewItem = computed(() => {
  if (!selectedItemId.value) return null
  return storageData.value.find(i => i.id === selectedItemId.value) || null
})

const isPreviewableImage = (url) => {
  if (!url) return false
  return !!url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i)
}

const breadcrumbs = computed(() => {
  const crumbs = []
  let currId = currentFolderId.value
  while (currId) {
    const folder = storageData.value.find(item => item.id === currId)
    if (folder) {
      crumbs.unshift(folder)
      currId = folder.parents_id || null
    } else {
      break
    }
  }
  return crumbs
})

// --- Firebase API Methods ---
const fetchData = async () => {
  loading.value = true
  try {
    const snap = await get(dbRef(database, 'kho_luu_tru'))
    if (snap.exists()) {
      const raw = snap.val()
      const entries = Array.isArray(raw)
        ? raw.map((val, idx) => [String(idx), val])
        : Object.entries(raw || {})
      storageData.value = entries
        .map(([key, val]) => normalizeKLTRecord(val, key))
        .filter(Boolean)
    } else {
      storageData.value = []
    }
  } catch (e) {
    console.error('Lỗi lấy dữ liệu từ Firebase:', e)
  } finally {
    loading.value = false
  }
}

const postData = async (payload) => {
  try {
    const id = payload?.id
    if (!id) return { status: 'error', message: 'Thiếu ID' }
    const key = sanitizeFirebaseKey(id)
    const record = toCleanKLTRecord(payload)
    if (payload.action === 'edit') {
      await update(dbRef(database, `kho_luu_tru/${key}`), record)
      return { status: 'success', message: 'Cập nhật thành công', data: record }
    } else {
      await set(dbRef(database, `kho_luu_tru/${key}`), record)
      return { status: 'success', message: 'Thêm thành công', data: record }
    }
  } catch (e) {
    console.error('Lỗi lưu dữ liệu Firebase:', e)
    return null
  }
}

const deleteData = async (id) => {
  try {
    if (!id) return { status: 'error', message: 'Thiếu ID' }
    const key = sanitizeFirebaseKey(id)
    await remove(dbRef(database, `kho_luu_tru/${key}`))
    return { status: 'success', message: 'Đã xóa thành công' }
  } catch (e) {
    console.error('Lỗi xóa dữ liệu Firebase:', e)
    return null
  }
}

// --- Lifecycle & Shortcuts ---
const isAnyModalOpen = computed(() => (
  showModal.value ||
  showDuplicateModal.value ||
  showLabelModal.value ||
  showCustomerModal.value ||
  showCustomerPickerModal.value ||
  showUploadModal.value ||
  customDialog.value.show
))

const handleKeydown = (e) => {
  if (isAnyModalOpen.value || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return

  if (e.key === 'Escape' && selectionMode.value) {
    cancelSelectionMode()
    return
  }

  if (e.ctrlKey && e.key === 'c') {
    handleCopy()
  } else if (e.ctrlKey && e.key === 'x') {
    handleCut()
  } else if (e.ctrlKey && e.key === 'v') {
    handlePaste()
  } else if (e.key === 'Delete') {
    if (selectionMode.value && selectedItems.value.length > 0) {
      handleBulkDeleteSelected()
    } else {
      handleDelete()
    }
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// --- Methods ---
const getUniqueName = (baseName, parentId, type, excludeId = null) => {
  const siblings = storageData.value.filter(item =>
    item.parents_id === parentId &&
    item.type === type &&
    item.id !== excludeId
  )
  const existingNames = siblings.map(item => item.name)
  if (!existingNames.includes(baseName)) return baseName

  let nameWithoutExt = baseName
  let ext = ''

  if (type === 'file') {
    const lastDotIndex = baseName.lastIndexOf('.')
    if (lastDotIndex > 0) {
      nameWithoutExt = baseName.substring(0, lastDotIndex)
      ext = baseName.substring(lastDotIndex)
    }
  }

  let counter = 1
  let newName = `${nameWithoutExt}(${counter})${ext}`
  while (existingNames.includes(newName)) {
    counter++
    newName = `${nameWithoutExt}(${counter})${ext}`
  }
  return newName
}

const navigateTo = (folderId) => {
  currentFolderId.value = folderId || null
  selectedItemId.value = null
  if (selectionMode.value) {
    cancelSelectionMode()
  }
  closeContextMenu()
}

const openFile = (url) => {
  if (url) window.open(url, '_blank')
}

// Mobile Touch Long Press for Context Menu
let touchTimer = null
let isLongPress = false
let touchStartX = 0
let touchStartY = 0

const handleTouchStart = (event, item) => {
  if (selectionMode.value) return
  isLongPress = false
  const touch = event.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  const mockEvent = {
    preventDefault: () => { if (event.cancelable) event.preventDefault() },
    clientX: touch.clientX,
    clientY: touch.clientY
  }

  touchTimer = setTimeout(() => {
    isLongPress = true
    openItemContextMenu(mockEvent, item)
    if (navigator.vibrate) navigator.vibrate(50)
    touchTimer = null
  }, 500)
}

const handleTouchMove = (event) => {
  if (touchTimer && event.touches && event.touches.length > 0) {
    const touch = event.touches[0]
    const dx = Math.abs(touch.clientX - touchStartX)
    const dy = Math.abs(touch.clientY - touchStartY)
    if (dx > 10 || dy > 10) {
      clearTimeout(touchTimer)
      touchTimer = null
    }
  }
}

const handleTouchEnd = () => {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  } else if (isLongPress) {
    setTimeout(() => {
      isLongPress = false
    }, 500)
  }
}

// Context Menu Methods (Clamped safely inside viewport)
const clampContextPos = (x, y, isItemMenu = true) => {
  const menuW = 225
  const menuH = isItemMenu ? 260 : 140
  const maxX = Math.max(12, window.innerWidth - menuW - 12)
  const maxY = Math.max(12, window.innerHeight - menuH - 12)
  return {
    x: Math.min(Math.max(12, x), maxX),
    y: Math.min(Math.max(12, y), maxY)
  }
}

const openItemContextMenu = (event, item) => {
  event?.preventDefault?.()
  selectedItemId.value = item.id
  const pos = clampContextPos(event.clientX, event.clientY, true)
  contextMenu.value = {
    show: true,
    x: pos.x,
    y: pos.y,
    type: 'item',
    item
  }
}

const openItemMenuFromButton = (event, item) => {
  const rect = event.currentTarget.getBoundingClientRect()
  openItemContextMenu({ clientX: rect.left, clientY: rect.bottom + 6 }, item)
}

const openEmptyContextMenu = (event) => {
  event.preventDefault()
  selectedItemId.value = null
  const pos = clampContextPos(event.clientX, event.clientY, false)
  contextMenu.value = {
    show: true,
    x: pos.x,
    y: pos.y,
    type: 'empty',
    item: null
  }
}

const closeContextMenu = () => {
  contextMenu.value.show = false
}

const handleItemClick = (item) => {
  if (isLongPress) return

  if (selectionMode.value) {
    const idx = selectedItems.value.indexOf(item.id)
    if (idx !== -1) {
      selectedItems.value.splice(idx, 1)
    } else {
      selectedItems.value.push(item.id)
    }
  } else {
    selectedItemId.value = item.id
    if (item.type === 'folder') {
      if (viewMode.value === 'grid') {
        navigateTo(item.id)
      } else {
        toggleFolder(item.id)
      }
    } else {
      if (window.innerWidth <= 768 && viewMode.value === 'grid') {
        openFile(item.link_file)
      }
    }
  }
  closeContextMenu()
}

const enterSelectionMode = () => {
  selectionMode.value = true
  selectedItems.value = []
  if (selectedItemId.value) {
    selectedItems.value.push(selectedItemId.value)
    selectedItemId.value = null
  }
  closeContextMenu()
}

const cancelSelectionMode = () => {
  selectionMode.value = false
  selectedItems.value = []
}

const handleBulkDeleteSelected = async () => {
  if (selectedItems.value.length === 0) return

  if (await showConfirm(`Bạn có chắc muốn xóa ${selectedItems.value.length} mục đã chọn?`)) {
    const idsToDelete = []

    for (const id of selectedItems.value) {
      idsToDelete.push(id)
      const item = storageData.value.find(i => i.id === id)
      if (item && item.type === 'folder') {
        const descendants = getAllDescendants(item.id)
        for (const d of descendants) {
          idsToDelete.push(d.id)
        }
      }
    }

    const uniqueIdsToDelete = [...new Set(idsToDelete)]

    storageData.value = storageData.value.filter(i => !uniqueIdsToDelete.includes(i.id))

    if (clipboard.value.items?.some(i => uniqueIdsToDelete.includes(i.id))) {
      clipboard.value = { action: null, items: [], descendants: [] }
    }

    cancelSelectionMode()
    await bulkDelete(uniqueIdsToDelete)
  }
}

// Clipboard Actions
const handleCopy = () => {
  const item = contextMenu.value.item || storageData.value.find(i => i.id === selectedItemId.value)
  if (item) {
    clipboard.value = { action: 'copy', items: [{ ...item }] }
    if (item.type === 'folder') {
      clipboard.value.descendants = getAllDescendants(item.id)
    } else {
      clipboard.value.descendants = []
    }
  }
  closeContextMenu()
}

const handleCut = () => {
  const item = contextMenu.value.item || storageData.value.find(i => i.id === selectedItemId.value)
  if (item) {
    clipboard.value = { action: 'cut', items: [{ ...item }], descendants: [] }
  }
  closeContextMenu()
}

const handleBulkCopy = () => {
  if (selectedItems.value.length === 0) return
  const items = selectedItems.value.map(id => ({ ...storageData.value.find(i => i.id === id) })).filter(Boolean)

  const descendants = []
  for (const item of items) {
    if (item.type === 'folder') {
      descendants.push(...getAllDescendants(item.id))
    }
  }
  clipboard.value = { action: 'copy', items, descendants }
  cancelSelectionMode()
}

const handleBulkCut = () => {
  if (selectedItems.value.length === 0) return
  const items = selectedItems.value.map(id => ({ ...storageData.value.find(i => i.id === id) })).filter(Boolean)

  clipboard.value = { action: 'cut', items, descendants: [] }
  cancelSelectionMode()
}

// Get all descendants of a folder recursively
const getAllDescendants = (folderId) => {
  const result = []
  const children = storageData.value.filter(i => i.parents_id === folderId)
  for (const child of children) {
    result.push({ ...child })
    if (child.type === 'folder') {
      result.push(...getAllDescendants(child.id))
    }
  }
  return result
}

// Bulk Firebase API helpers
const bulkAdd = async (items) => {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { status: 'error', message: 'Thiếu danh sách items' }
    }
    const updates = {}
    const defaultTime = generateCurrentTime()
    for (const item of items) {
      if (!item || !item.id) continue
      const key = sanitizeFirebaseKey(item.id)
      updates[key] = toCleanKLTRecord({
        ...item,
        created_time: item.created_time || defaultTime
      })
    }
    await update(dbRef(database, 'kho_luu_tru'), updates)
    return { status: 'success', message: `Đã thêm ${items.length} dòng`, count: items.length }
  } catch (e) {
    console.error('Lỗi bulk add Firebase:', e)
    return null
  }
}

const bulkDelete = async (ids) => {
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return { status: 'error', message: 'Thiếu danh sách IDs để xóa' }
    }
    const updates = {}
    for (const id of ids) {
      if (!id) continue
      updates[sanitizeFirebaseKey(id)] = null
    }
    await update(dbRef(database, 'kho_luu_tru'), updates)
    return { status: 'success', message: `Đã xóa ${ids.length} dòng`, count: ids.length }
  } catch (e) {
    console.error('Lỗi bulk delete Firebase:', e)
    return null
  }
}

const bulkEdit = async (items) => {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { status: 'error', message: 'Thiếu danh sách items' }
    }
    const updates = {}
    for (const item of items) {
      if (!item || !item.id) continue
      const key = sanitizeFirebaseKey(item.id)
      updates[key] = toCleanKLTRecord(item)
    }
    await update(dbRef(database, 'kho_luu_tru'), updates)
    return { status: 'success', message: `Đã sửa ${items.length} dòng`, count: items.length }
  } catch (e) {
    console.error('Lỗi bulk edit Firebase:', e)
    return null
  }
}

const handlePaste = async () => {
  if (!clipboard.value.items || clipboard.value.items.length === 0) return

  const itemMenu = contextMenu.value.item
  const targetId = (viewMode.value === 'tree' && itemMenu && itemMenu.type === 'folder') ? itemMenu.id : (currentFolderId.value || '')

  const { action, items, descendants } = clipboard.value
  const parentFolder = storageData.value.find(f => f.id === targetId)
  const destFolderName = parentFolder ? (parentFolder.type === 'folder' ? parentFolder.parents_name : parentFolder.name) || '' : ''

  if (action === 'cut') {
    const itemsToEdit = []
    for (const item of items) {
      if (item.id === targetId) {
        await showAlert(`Không thể di chuyển thư mục "${item.name}" vào chính nó!`)
        continue
      }

      const targetItem = storageData.value.find(i => i.id === item.id)
      if (targetItem) {
        targetItem.parents_id = targetId
        targetItem.parents_name = targetItem.type === 'folder' ? targetItem.parents_name : destFolderName
        itemsToEdit.push({ ...targetItem })
      }
    }

    if (itemsToEdit.length > 0) {
      await bulkEdit(itemsToEdit)
    }
    clipboard.value = { action: null, items: [], descendants: [] }
  } else if (action === 'copy') {
    const allNewItems = []
    const idMap = {}
    const nameMap = {}

    for (const item of items) {
      const newId = (item.type === 'folder' ? 'F_' : 'FILE_') + Date.now() + Math.floor(Math.random() * 100000)
      let newName = item.name
      if (!newName.includes(' - Copy')) {
        newName = newName.replace(/(\.[^.]+)$/, ' - Copy$1')
        if (newName === item.name) newName += ' - Copy'
      }
      newName = getUniqueName(newName, targetId, item.type)

      const newItem = {
        ...item,
        id: newId,
        name: newName,
        parents_id: targetId,
        created_time: generateCurrentTime()
      }

      if (item.type === 'folder') {
        newItem.parents_name = newName
        newItem.Ten_file = ''
      } else {
        newItem.parents_name = destFolderName
        newItem.Ten_file = newName
      }

      allNewItems.push(newItem)
      idMap[item.id] = newId
      nameMap[item.id] = newName
    }

    if (descendants && descendants.length > 0) {
      let counter = 1
      for (const desc of descendants) {
        const descNewId = (desc.type === 'folder' ? 'F_' : 'FILE_') + Date.now() + '_' + counter++
        idMap[desc.id] = descNewId
        if (desc.type === 'folder') {
          nameMap[desc.id] = desc.parents_name || desc.name
        }
      }

      for (const desc of descendants) {
        const descNewId = idMap[desc.id]
        const descNewParentId = idMap[desc.parents_id] || desc.parents_id
        const descParentName = nameMap[desc.parents_id] || desc.parents_name || ''

        const newChild = {
          ...desc,
          id: descNewId,
          parents_id: descNewParentId,
          created_time: generateCurrentTime()
        }

        if (desc.type === 'folder') {
          newChild.parents_name = desc.parents_name || desc.name
          newChild.name = desc.parents_name || desc.name
        } else {
          newChild.parents_name = descParentName
          newChild.name = desc.Ten_file || desc.name
        }

        allNewItems.push(newChild)
      }
    }

    for (const ni of allNewItems) {
      storageData.value.push(ni)
    }

    await bulkAdd(allNewItems)
  }

  closeContextMenu()
}

const handleDelete = async () => {
  const item = contextMenu.value.item || storageData.value.find(i => i.id === selectedItemId.value)
  if (!item) return

  if (await showConfirm(`Bạn có chắc muốn xóa "${item.name}"?`)) {
    const idsToDelete = [item.id]

    if (item.type === 'folder') {
      const descendants = getAllDescendants(item.id)
      for (const d of descendants) {
        idsToDelete.push(d.id)
      }
    }

    storageData.value = storageData.value.filter(i => !idsToDelete.includes(i.id))
    if (clipboard.value.items?.some(i => idsToDelete.includes(i.id))) {
      clipboard.value = { action: null, items: [], descendants: [] }
    }
    if (idsToDelete.includes(selectedItemId.value)) {
      selectedItemId.value = null
    }

    await bulkDelete(idsToDelete)
  }
  closeContextMenu()
}

// Label Actions
const openLabelModal = () => {
  const item = contextMenu.value.item || storageData.value.find(i => i.id === selectedItemId.value)
  if (!item) return

  closeContextMenu()
  labelTarget.value = item
  labelForm.value = {
    ten_khach_hang: item.Ten_khach_hang || '',
    ten_cong_ty: item.Ten_cong_ty || ''
  }
  showLabelModal.value = true
}

const saveLabelData = async () => {
  if (!labelTarget.value) return

  const item = labelTarget.value
  const ma_kh = generatedMaKH.value
  const ma_ct = generatedMaCT.value
  const ten_kh = labelForm.value.ten_khach_hang.trim()
  const ten_ct = labelForm.value.ten_cong_ty.trim()

  item.Ma_khach_hang = ma_kh
  item.Ten_khach_hang = ten_kh
  item.Ma_cong_ty = ma_ct
  item.Ten_cong_ty = ten_ct

  showLabelModal.value = false

  await postData({
    ...item,
    Ma_khach_hang: ma_kh,
    Ten_khach_hang: ten_kh,
    Ma_cong_ty: ma_ct,
    Ten_cong_ty: ten_ct,
    action: 'edit'
  })

  if (item.type === 'folder') {
    const descendants = getAllDescendants(item.id)
    if (descendants.length > 0) {
      const itemsToEdit = []
      for (const desc of descendants) {
        const realItem = storageData.value.find(i => i.id === desc.id)
        if (realItem) {
          realItem.Ma_khach_hang = ma_kh
          realItem.Ten_khach_hang = ten_kh
          realItem.Ma_cong_ty = ma_ct
          realItem.Ten_cong_ty = ten_ct
        }
        desc.Ma_khach_hang = ma_kh
        desc.Ten_khach_hang = ten_kh
        desc.Ma_cong_ty = ma_ct
        desc.Ten_cong_ty = ten_ct
        itemsToEdit.push({ ...desc })
      }
      await bulkEdit(itemsToEdit)
    }
  }
}

// Customer Actions (100% chuẩn schema & logic baogiaFirebase.vue)
const customersList = ref([])

const mapKhachRow = (row, fbKey = '') => {
  if (!row) return null
  if (Array.isArray(row)) {
    return {
      Ma_khach_hang: String(row[0] ?? fbKey ?? ''),
      Ten_khach_hang: String(row[1] ?? ''),
      Email_ca_nhan: String(row[2] ?? ''),
      So_dien_thoai_ca_nhan: String(row[3] ?? ''),
      Ma_cong_ty: String(row[4] ?? ''),
      Ten_cong_ty: String(row[5] ?? ''),
      So_dien_thoai_cong_ty: String(row[6] ?? ''),
      So_fax_cong_ty: String(row[7] ?? ''),
      Dia_chi_cong_ty: String(row[8] ?? ''),
      Email_cong_ty: String(row[9] ?? ''),
      Website_cong_ty: String(row[10] ?? ''),
      Hoa_hong: String(row[11] ?? ''),
      Tong_chi_tieu: String(row[12] ?? ''),
      Tong_loi_nhuan: String(row[13] ?? ''),
      Trang_thai: String(row[14] ?? ''),
      Ghi_chu: String(row[15] ?? ''),
      Ten_khach_hang_phu: String(row[16] ?? ''),
      So_dien_thoai_ca_nhan_phu: String(row[17] ?? ''),
      Email_ca_nhan_phu: String(row[18] ?? ''),
      MST: String(row[19] ?? ''),
      COMPANY: String(row[20] ?? ''),
      ADDRESS: String(row[21] ?? ''),
      TEL: String(row[22] ?? ''),
      Nganh_nghe_cong_ty: String(row[23] ?? ''),
      last_updated: String(row[24] ?? ''),
      _firebaseKey: fbKey || String(row[0] ?? '')
    }
  }
  const obj = row || {}
  return {
    Ma_khach_hang: String(obj.ma_khach_hang ?? obj.Ma_khach_hang ?? fbKey ?? ''),
    Ten_khach_hang: String(obj.ten_khach_hang ?? obj.Ten_khach_hang ?? ''),
    Email_ca_nhan: String(obj.email_ca_nhan ?? obj.Email_ca_nhan ?? ''),
    So_dien_thoai_ca_nhan: String(obj.so_dien_thoai_ca_nhan ?? obj.So_dien_thoai_ca_nhan ?? ''),
    Ma_cong_ty: String(obj.ma_cong_ty ?? obj.Ma_cong_ty ?? ''),
    Ten_cong_ty: String(obj.ten_cong_ty ?? obj.Ten_cong_ty ?? ''),
    So_dien_thoai_cong_ty: String(obj.so_dien_thoai_cong_ty ?? obj.So_dien_thoai_cong_ty ?? ''),
    So_fax_cong_ty: String(obj.so_fax_cong_ty ?? obj.So_fax_cong_ty ?? ''),
    Dia_chi_cong_ty: String(obj.dia_chi_cong_ty ?? obj.Dia_chi_cong_ty ?? ''),
    Email_cong_ty: String(obj.email_cong_ty ?? obj.Email_cong_ty ?? ''),
    Website_cong_ty: String(obj.website_cong_ty ?? obj.Website_cong_ty ?? ''),
    Hoa_hong: String(obj.hoa_hong ?? obj.Hoa_hong ?? ''),
    Tong_chi_tieu: String(obj.tong_chi_tieu ?? obj.Tong_chi_tieu ?? ''),
    Tong_loi_nhuan: String(obj.tong_loi_nhuan ?? obj.Tong_loi_nhuan ?? ''),
    Trang_thai: String(obj.trang_thai ?? obj.Trang_thai ?? ''),
    Ghi_chu: String(obj.ghi_chu ?? obj.Ghi_chu ?? ''),
    Ten_khach_hang_phu: String(obj.ten_khach_hang_phu ?? obj.Ten_khach_hang_phu ?? ''),
    So_dien_thoai_ca_nhan_phu: String(obj.so_dien_thoai_ca_nhan_phu ?? obj.So_dien_thoai_ca_nhan_phu ?? ''),
    Email_ca_nhan_phu: String(obj.email_ca_nhan_phu ?? obj.Email_ca_nhan_phu ?? ''),
    MST: String(obj.mst ?? obj.MST ?? ''),
    COMPANY: String(obj.company ?? obj.COMPANY ?? ''),
    ADDRESS: String(obj.address ?? obj.ADDRESS ?? ''),
    TEL: String(obj.tel ?? obj.TEL ?? ''),
    Nganh_nghe_cong_ty: String(obj.nganh_nghe_cong_ty ?? obj.Nganh_nghe_cong_ty ?? obj.nganh_nghe_chinh ?? ''),
    last_updated: String(obj.last_updated ?? obj.Last_updated ?? obj.ngay_cap_nhat ?? obj.created_time ?? ''),
    _firebaseKey: fbKey || String(obj.ma_khach_hang ?? obj.Ma_khach_hang ?? '')
  }
}

const fetchCustomersList = async () => {
  try {
    const snap = await get(dbRef(database, 'khach_hang'))
    if (snap.exists()) {
      const raw = snap.val()
      const entries = Array.isArray(raw)
        ? raw.map((val, idx) => [String(idx), val])
        : Object.entries(raw || {})
      customersList.value = entries
        .map(([key, row]) => mapKhachRow(row, key))
        .filter(Boolean)
    } else {
      customersList.value = []
    }
  } catch (e) {
    console.error('Lỗi lấy danh sách khách hàng từ Firebase:', e)
  }
}

const applySelectedCustomerToForm = (found) => {
  if (!found) return
  isExistingCustomer.value = true
  originalKhach.value = JSON.parse(JSON.stringify(found))
  khach.value = { ...createEmptyKhach(), ...JSON.parse(JSON.stringify(found)) }
  maKHInput.value = found.Ma_khach_hang || ''
  tenKHInput.value = found.Ten_khach_hang || ''
}

const fillCustomerByMa = (val) => {
  const found = customersList.value.find(c => c.Ma_khach_hang === val)
  if (found) applySelectedCustomerToForm(found)
}
const fillCustomerByTen = (val) => {
  const found = customersList.value.find(c => c.Ten_khach_hang === val)
  if (found) applySelectedCustomerToForm(found)
}
const fillCustomerByCongTy = (val) => {
  const found = customersList.value.find(c => c.Ten_cong_ty === val)
  if (found) applySelectedCustomerToForm(found)
}
const onBlurMaKH = () => {
  if (maKHInput.value?.trim()) fillCustomerByMa(maKHInput.value.trim())
}
const onBlurTenKH = () => {
  if (tenKHInput.value?.trim()) fillCustomerByTen(tenKHInput.value.trim())
}
const onBlurCongTy = () => {
  if (khach.value.Ten_cong_ty?.trim()) fillCustomerByCongTy(khach.value.Ten_cong_ty.trim())
}
const onMSTChange = () => {
  const val = khach.value.MST?.trim()
  if (!val) return
  const found = customersList.value.find(c => c.MST === val)
  if (found) applySelectedCustomerToForm(found)
}

const resetCustomerForm = () => {
  isExistingCustomer.value = false
  originalKhach.value = null
  khach.value = createEmptyKhach()
  maKHInput.value = ''
  tenKHInput.value = ''
}

const openCustomerPicker = (field = 'ma_kh', target = 'customer') => {
  customerPickerField.value = field
  customerPickerTarget.value = target
  customerPickerSearch.value = ''
  customerPickerVisibleCount.value = 20
  showCustomerPickerModal.value = true
  if (customersList.value.length === 0) {
    fetchCustomersList()
  }
}

const selectCustomerFromPicker = (cus) => {
  if (!cus) return
  if (customerPickerTarget.value === 'label') {
    labelForm.value.ten_khach_hang = cus.Ten_khach_hang || ''
    labelForm.value.ten_cong_ty = cus.Ten_cong_ty || ''
  } else {
    applySelectedCustomerToForm(cus)
  }
  showCustomerPickerModal.value = false
}

const openAddCustomerModal = () => {
  resetCustomerForm()
  showMobileCustSubSection.value = false
  showCustomerModal.value = true
  fetchCustomersList()
}

const findCustomerInFirebase = async (maKH) => {
  const target = String(maKH || '').trim()
  if (!target) return null
  try {
    const safeKey = sanitizeFirebaseKey(target)
    if (safeKey) {
      const directSnap = await get(dbRef(database, `khach_hang/${safeKey}`))
      if (directSnap.exists()) {
        return { key: safeKey, data: directSnap.val() }
      }
    }
    const allSnap = await get(dbRef(database, 'khach_hang'))
    const allData = allSnap.val()
    if (allData && typeof allData === 'object') {
      for (const [k, v] of Object.entries(allData)) {
        if (!v || typeof v !== 'object') continue
        const recMa = String(v.ma_khach_hang ?? v.Ma_khach_hang ?? k ?? '').trim()
        if (recMa === target) {
          return { key: k, data: v }
        }
      }
    }
  } catch (e) {
    console.warn('findCustomerInFirebase error:', e)
  }
  return null
}

const saveCustomerToDB = async (closeDetailModal = true) => {
  const k = khach.value
  const tenKHVal = (tenKHInput.value || k.Ten_khach_hang || '').trim()
  const tenCTVal = (k.Ten_cong_ty || '').trim()
  const maCTVal = (k.Ma_cong_ty || genMaCT(tenCTVal) || '').trim()
  const ma = (maKHInput.value?.trim() || k.Ma_khach_hang?.trim() || genMaKH(tenKHVal, tenCTVal)).trim()

  if (!ma) {
    await showAlert('Vui lòng nhập Mã KH hoặc điền Tên khách hàng / Tên công ty để tự động tạo Mã KH trước khi lưu!', 'Thiếu Mã khách hàng')
    return
  }

  const isUpdate = isCustomerInDB.value
  const nowIso = new Date().toISOString()

  k.Ma_khach_hang = ma
  k.Ten_khach_hang = tenKHVal
  k.Ma_cong_ty = maCTVal
  k.Ten_cong_ty = tenCTVal
  k.last_updated = nowIso
  maKHInput.value = ma
  tenKHInput.value = tenKHVal

  const fbPayload = {
    ma_khach_hang: ma,
    Ma_khach_hang: ma,
    ten_khach_hang: tenKHVal,
    Ten_khach_hang: tenKHVal,
    email_ca_nhan: k.Email_ca_nhan || '',
    Email_ca_nhan: k.Email_ca_nhan || '',
    so_dien_thoai_ca_nhan: k.So_dien_thoai_ca_nhan || '',
    So_dien_thoai_ca_nhan: k.So_dien_thoai_ca_nhan || '',
    ma_cong_ty: maCTVal,
    Ma_cong_ty: maCTVal,
    ten_cong_ty: tenCTVal,
    Ten_cong_ty: tenCTVal,
    so_dien_thoai_cong_ty: k.So_dien_thoai_cong_ty || '',
    So_dien_thoai_cong_ty: k.So_dien_thoai_cong_ty || '',
    so_fax_cong_ty: k.So_fax_cong_ty || '',
    So_fax_cong_ty: k.So_fax_cong_ty || '',
    dia_chi_cong_ty: k.Dia_chi_cong_ty || '',
    Dia_chi_cong_ty: k.Dia_chi_cong_ty || '',
    email_cong_ty: k.Email_cong_ty || '',
    Email_cong_ty: k.Email_cong_ty || '',
    website_cong_ty: k.Website_cong_ty || '',
    Website_cong_ty: k.Website_cong_ty || '',
    hoa_hong: k.Hoa_hong || '',
    Hoa_hong: k.Hoa_hong || '',
    tong_chi_tieu: k.Tong_chi_tieu || 0,
    Tong_chi_tieu: k.Tong_chi_tieu || 0,
    tong_loi_nhuan: k.Tong_loi_nhuan || 0,
    Tong_loi_nhuan: k.Tong_loi_nhuan || 0,
    trang_thai: k.Trang_thai || 'Tiềm năng',
    Trang_thai: k.Trang_thai || 'Tiềm năng',
    ghi_chu: k.Ghi_chu || '',
    Ghi_chu: k.Ghi_chu || '',
    ten_khach_hang_phu: k.Ten_khach_hang_phu || '',
    Ten_khach_hang_phu: k.Ten_khach_hang_phu || '',
    so_dien_thoai_ca_nhan_phu: k.So_dien_thoai_ca_nhan_phu || '',
    So_dien_thoai_ca_nhan_phu: k.So_dien_thoai_ca_nhan_phu || '',
    email_ca_nhan_phu: k.Email_ca_nhan_phu || '',
    Email_ca_nhan_phu: k.Email_ca_nhan_phu || '',
    mst: k.MST || '',
    MST: k.MST || '',
    company: k.COMPANY || '',
    COMPANY: k.COMPANY || '',
    address: k.ADDRESS || '',
    ADDRESS: k.ADDRESS || '',
    tel: k.TEL || '',
    TEL: k.TEL || '',
    nganh_nghe_cong_ty: k.Nganh_nghe_cong_ty || '',
    Nganh_nghe_cong_ty: k.Nganh_nghe_cong_ty || '',
    last_updated: nowIso
  }

  savingCustomer.value = true
  try {
    const existing = await findCustomerInFirebase(ma)
    const targetKey = existing ? existing.key : sanitizeFirebaseKey(ma)
    if (existing) {
      if (existing.data?.created_time) {
        fbPayload.created_time = existing.data.created_time
      }
      await update(dbRef(database, `khach_hang/${targetKey}`), fbPayload)
    } else {
      fbPayload.created_time = nowIso
      await set(dbRef(database, `khach_hang/${targetKey}`), fbPayload)
    }

    isExistingCustomer.value = true
    const snapshot = JSON.parse(JSON.stringify(k))
    originalKhach.value = snapshot
    const existingIdx = customersList.value.findIndex(c => c.Ma_khach_hang === ma)
    if (existingIdx >= 0) {
      customersList.value[existingIdx] = JSON.parse(JSON.stringify(snapshot))
    } else {
      customersList.value.unshift(JSON.parse(JSON.stringify(snapshot)))
    }

    if (closeDetailModal) {
      showCustomerModal.value = false
    }
    await showAlert(
      isUpdate ? `Đã cập nhật khách hàng "${tenKHVal || tenCTVal || ma}" thành công!` : `Đã thêm khách hàng "${tenKHVal || tenCTVal || ma}" vào DB thành công!`,
      'Thành công'
    )
  } catch (e) {
    console.error('Lỗi lưu khách hàng vào Firebase:', e)
    await showAlert('Có lỗi khi lưu thông tin khách hàng lên Firebase. Vui lòng thử lại!', 'Lỗi')
  } finally {
    savingCustomer.value = false
  }
}

// Modal Actions
const modalTargetFolderId = ref('')

const openCreateFolderModal = () => {
  const item = contextMenu.value.item
  modalTargetFolderId.value = (viewMode.value === 'tree' && item && item.type === 'folder') ? item.id : (currentFolderId.value || '')

  closeContextMenu()
  modalTitle.value = 'Tạo thư mục mới'
  modalPlaceholder.value = 'Nhập tên thư mục...'
  modalInputName.value = ''
  modalAction.value = 'create_folder'
  showModal.value = true
}

const openRenameModal = () => {
  const item = contextMenu.value.item || storageData.value.find(i => i.id === selectedItemId.value)
  if (!item) return

  closeContextMenu()
  itemToRename.value = item
  modalTitle.value = 'Đổi tên'
  modalPlaceholder.value = 'Nhập tên mới...'
  modalInputName.value = item.name
  modalAction.value = 'rename'
  showModal.value = true
}

const showDuplicateModal = ref(false)
const duplicateSuggestedName = ref('')
const duplicateConfirmCallback = ref(null)
const duplicateCancelCallback = ref(null)

const confirmDuplicateAction = () => {
  if (duplicateConfirmCallback.value) duplicateConfirmCallback.value()
}
const cancelDuplicateAction = () => {
  if (duplicateCancelCallback.value) duplicateCancelCallback.value()
}

const proceedCreateFolder = async (finalName) => {
  const newFolder = {
    id: 'F_' + Date.now(),
    parents_id: modalTargetFolderId.value,
    parents_name: finalName,
    type: 'folder',
    name: finalName,
    Ten_file: '',
    link_file: '',
    created_time: generateCurrentTime(),
    action: 'add'
  }
  storageData.value.push(newFolder)
  showModal.value = false
  await postData(newFolder)
}

const proceedRename = async (item, finalName) => {
  item.name = finalName

  if (item.type === 'folder') {
    item.parents_name = finalName
    const children = storageData.value.filter(i => i.parents_id === item.id && i.type === 'file')
    const childrenToUpdate = []
    for (const child of children) {
      child.parents_name = finalName
      childrenToUpdate.push({ ...child })
    }

    showModal.value = false
    await postData({ ...item, action: 'edit' })

    if (childrenToUpdate.length > 0) {
      await bulkEdit(childrenToUpdate)
    }
  } else {
    item.Ten_file = finalName
    showModal.value = false
    await postData({ ...item, action: 'edit' })
  }
}

const handleModalSubmit = async () => {
  const newName = modalInputName.value.trim()
  if (!newName) return

  if (modalAction.value === 'create_folder') {
    const uniqueName = getUniqueName(newName, modalTargetFolderId.value, 'folder')
    if (uniqueName !== newName) {
      duplicateSuggestedName.value = uniqueName
      showModal.value = false
      showDuplicateModal.value = true
      duplicateConfirmCallback.value = () => {
        showDuplicateModal.value = false
        proceedCreateFolder(uniqueName)
      }
      duplicateCancelCallback.value = () => {
        showDuplicateModal.value = false
        showModal.value = true
      }
      return
    }
    await proceedCreateFolder(newName)
  } else if (modalAction.value === 'rename' && itemToRename.value) {
    const item = itemToRename.value
    if (item.name === newName) {
      showModal.value = false
      return
    }

    const uniqueName = getUniqueName(newName, item.parents_id, item.type, item.id)
    if (uniqueName !== newName) {
      duplicateSuggestedName.value = uniqueName
      showModal.value = false
      showDuplicateModal.value = true
      duplicateConfirmCallback.value = () => {
        showDuplicateModal.value = false
        proceedRename(item, uniqueName)
      }
      duplicateCancelCallback.value = () => {
        showDuplicateModal.value = false
        showModal.value = true
      }
      return
    }
    await proceedRename(item, newName)
  }
}

// Upload Actions
const uploadTargetFolderId = ref('')
const showUploadModal = ref(false)
const isDragging = ref(false)

const triggerUploadFromMenu = () => {
  const item = contextMenu.value.item
  uploadTargetFolderId.value = (viewMode.value === 'tree' && item && item.type === 'folder') ? item.id : (currentFolderId.value || '')
  closeContextMenu()
  showUploadModal.value = true
}

const triggerUpload = () => {
  uploadTargetFolderId.value = currentFolderId.value || ''
  showUploadModal.value = true
}

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const compressImage = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
      return resolve(file)
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const MAX_WIDTH = 1920
        const MAX_HEIGHT = 1920
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width))
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height))
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (!blob) return resolve(file)
          const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg'
          const compressedFile = new File([blob], newFileName, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        }, 'image/jpeg', 0.8)
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

const uploadFiles = async (filesArray) => {
  if (!filesArray || filesArray.length === 0) return

  showUploadModal.value = false
  isDragging.value = false

  uploadingFiles.value = filesArray.map(f => ({ name: f.name }))

  let successCount = 0
  const parentFolder = storageData.value.find(f => f.id === uploadTargetFolderId.value)
  const parentsName = parentFolder ? parentFolder.name || parentFolder.parents_name : ''

  for (let file of filesArray) {
    try {
      file = await compressImage(file)

      const fd = new FormData()
      fd.append('upload_preset', 'upload_file')
      fd.append('file', file)

      const res = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
        method: 'POST',
        body: fd
      }).then(r => r.json())

      if (res.secure_url) {
        const uniqueFileName = getUniqueName(file.name, uploadTargetFolderId.value || '', 'file')
        const fileRecord = {
          id: 'FILE_' + Date.now() + Math.floor(Math.random() * 1000),
          parents_id: uploadTargetFolderId.value || '',
          parents_name: parentsName,
          type: 'file',
          name: uniqueFileName,
          Ten_file: uniqueFileName,
          link_file: res.secure_url,
          created_time: generateCurrentTime(),
          action: 'add'
        }

        storageData.value.push(fileRecord)
        await postData(fileRecord)
        successCount++
      }
    } catch (e) {
      console.error('Lỗi upload file:', e)
      await showAlert(`Lỗi khi tải lên file ${file.name}`, 'Lỗi')
    }
  }

  uploadingFiles.value = []

  if (successCount > 0) {
    await showAlert(`Tải lên thành công ${successCount} file!`, 'Thành công')
  }
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  uploadFiles(files)
  if (event.target) event.target.value = ''
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) uploadFiles(files)
}

const handleGlobalPaste = (event) => {
  if (!showUploadModal.value) return
  const items = event.clipboardData?.items
  if (!items) return

  const files = []
  for (let i = 0; i < items.length; i++) {
    if (items[i].kind === 'file') {
      files.push(items[i].getAsFile())
    }
  }
  if (files.length > 0) {
    uploadFiles(files)
  }
}

watch(showUploadModal, (val) => {
  if (val) {
    window.addEventListener('paste', handleGlobalPaste)
  } else {
    window.removeEventListener('paste', handleGlobalPaste)
  }
})
</script>

<style scoped>
/* ==========================================================================
   DUAL-THEME DESIGN TOKENS: DARK NAVY (DEFAULT) & ENTERPRISE LIGHT BLUE
   Matching BaoGia / QuanLyHangHoa / SaleReport UI Standard
========================================================================== */
.klt-page,
.klt-modal-overlay,
.custom-context-menu,
.selection-action-bar,
.preview-column {
  --klt-canvas: radial-gradient(ellipse 80% 50% at 10% 0%, rgba(14, 165, 233, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 90% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    #09090b;
  --klt-panel: rgba(15, 23, 42, 0.78);
  --klt-panel-solid: #0f172a;
  --klt-card: #111c30;
  --klt-card-hover: #17253e;
  --klt-well: rgba(2, 6, 23, 0.52);
  --klt-input-bg: rgba(15, 23, 42, 0.72);
  --klt-border: rgba(148, 163, 184, 0.16);
  --klt-border-strong: rgba(148, 163, 184, 0.28);
  --klt-ink: #f8fafc;
  --klt-ink-sec: #cbd5e1;
  --klt-ink-muted: #94a3b8;
  --klt-shadow: 0 14px 32px -12px rgba(0, 0, 0, 0.55);

  --klt-sky: #38bdf8;
  --klt-sky-bg: rgba(14, 165, 233, 0.15);
  --klt-sky-border: rgba(56, 189, 248, 0.42);
  --klt-sky-cta: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);

  --klt-emerald: #34d399;
  --klt-emerald-bg: rgba(16, 185, 129, 0.14);
  --klt-emerald-border: rgba(16, 185, 129, 0.38);
  --klt-emerald-cta: linear-gradient(135deg, #10b981 0%, #059669 100%);

  --klt-amber: #fbbf24;
  --klt-amber-bg: rgba(245, 158, 11, 0.14);
  --klt-amber-border: rgba(245, 158, 11, 0.38);
  --klt-amber-cta: linear-gradient(135deg, #d97706 0%, #b45309 100%);

  --klt-rose: #f87171;
  --klt-rose-bg: rgba(239, 68, 68, 0.15);
  --klt-rose-border: rgba(239, 68, 68, 0.38);
  --klt-rose-cta: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);

  --klt-neutral-bg: rgba(148, 163, 184, 0.1);
  --klt-neutral-hover: rgba(148, 163, 184, 0.18);
  --klt-folder-color: #38bdf8;
}

.klt-page.theme-light-blue,
.klt-modal-overlay.theme-light-blue,
.custom-context-menu.theme-light-blue,
.selection-action-bar.theme-light-blue,
.preview-column.theme-light-blue {
  --klt-canvas: linear-gradient(180deg, #eef4fb 0%, #e2ecf8 100%);
  --klt-panel: #ffffff;
  --klt-panel-solid: #ffffff;
  --klt-card: #ffffff;
  --klt-card-hover: #f8fbff;
  --klt-well: #f1f5f9;
  --klt-input-bg: #f8fafc;
  --klt-border: #dbeafe;
  --klt-border-strong: #cbd5e1;
  --klt-ink: #0f172a;
  --klt-ink-sec: #334155;
  --klt-ink-muted: #64748b;
  --klt-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);

  --klt-sky: #0284c7;
  --klt-sky-bg: #eff6ff;
  --klt-sky-border: #93c5fd;
  --klt-sky-cta: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);

  --klt-emerald: #059669;
  --klt-emerald-bg: #ecfdf5;
  --klt-emerald-border: #6ee7b7;
  --klt-emerald-cta: linear-gradient(135deg, #10b981 0%, #059669 100%);

  --klt-amber: #b45309;
  --klt-amber-bg: #fffbeb;
  --klt-amber-border: #fcd34d;
  --klt-amber-cta: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);

  --klt-rose: #dc2626;
  --klt-rose-bg: #fef2f2;
  --klt-rose-border: #fecaca;
  --klt-rose-cta: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);

  --klt-neutral-bg: #f1f5f9;
  --klt-neutral-hover: #e2e8f0;
  --klt-folder-color: #2563eb;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* ==========================================================================
   PAGE SHELL & HEADER
========================================================================== */
.storage-page.klt-page {
  padding: 16px 20px;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  background: var(--klt-canvas);
  color: var(--klt-ink);
  font-family: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  overflow: hidden;
}

.klt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  background: var(--klt-panel);
  border: 1px solid var(--klt-border);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: var(--klt-shadow);
  flex-shrink: 0;
}

.klt-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.klt-brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--klt-sky-bg);
  border: 1px solid var(--klt-sky-border);
  color: var(--klt-sky);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.klt-title-block {
  min-width: 0;
}

.klt-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.klt-page-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--klt-ink);
}

.klt-stat-pills {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.klt-stat-pill {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid var(--klt-border-strong);
  background: var(--klt-well);
  color: var(--klt-ink-sec);
}
.klt-stat-pill.is-sky {
  background: var(--klt-sky-bg);
  border-color: var(--klt-sky-border);
  color: var(--klt-sky);
}
.klt-stat-pill.is-emerald {
  background: var(--klt-emerald-bg);
  border-color: var(--klt-emerald-border);
  color: var(--klt-emerald);
}

.klt-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--klt-ink-muted);
}

.klt-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ==========================================================================
   UNIFIED SEMANTIC BUTTONS (NO RAINBOW COLORS)
========================================================================== */
.klt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 35px;
  padding: 0 13px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.16s ease;
  width: auto;
  margin: 0;
}
.klt-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
.klt-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.klt-btn-sm {
  height: 31px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 8px;
}

.klt-btn-sky {
  background: var(--klt-sky-cta);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.28);
}
.klt-btn-emerald {
  background: var(--klt-emerald-cta);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.26);
}
.klt-btn-amber {
  background: var(--klt-amber-bg);
  border-color: var(--klt-amber-border);
  color: var(--klt-amber);
}
.klt-btn-rose {
  background: var(--klt-rose-cta);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.26);
}
.klt-btn-neutral {
  background: var(--klt-neutral-bg);
  border-color: var(--klt-border-strong);
  color: var(--klt-ink-sec);
}
.klt-btn-neutral:hover:not(:disabled) {
  background: var(--klt-neutral-hover);
  color: var(--klt-ink);
}
.klt-btn-neutral.is-active-select {
  background: var(--klt-emerald-bg);
  border-color: var(--klt-emerald-border);
  color: var(--klt-emerald);
}

.klt-icon-btn {
  width: 35px;
  height: 35px;
  border-radius: 9px;
  border: 1px solid var(--klt-border-strong);
  background: var(--klt-neutral-bg);
  color: var(--klt-ink-sec);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.16s ease;
}
.klt-icon-btn:hover:not(:disabled) {
  background: var(--klt-neutral-hover);
  color: var(--klt-ink);
}

@keyframes kltSpin {
  to { transform: rotate(360deg); }
}
.is-spin {
  animation: kltSpin 0.85s linear infinite;
}

/* ==========================================================================
   WORKSPACE CONTAINER, TOOLBAR & BREADCRUMB
========================================================================== */
.klt-workspace {
  flex: 1;
  min-height: 0;
  background: var(--klt-panel);
  border-radius: 14px;
  border: 1px solid var(--klt-border);
  box-shadow: var(--klt-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.klt-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: var(--klt-well);
  border-bottom: 1px solid var(--klt-border);
  flex-shrink: 0;
}

.klt-toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 240px;
}

.view-toggle {
  display: inline-flex;
  gap: 3px;
  background: var(--klt-panel-solid);
  padding: 3px;
  border-radius: 9px;
  border: 1px solid var(--klt-border-strong);
  flex-shrink: 0;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 29px;
  padding: 0 11px;
  border-radius: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--klt-ink-muted);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.16s ease;
}
.view-btn:hover {
  color: var(--klt-ink);
  background: var(--klt-neutral-bg);
}
.view-btn.active {
  background: var(--klt-sky-cta);
  color: #ffffff;
}

.klt-search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 380px;
  min-width: 170px;
}
.klt-search-ico {
  position: absolute;
  left: 11px;
  color: var(--klt-ink-muted);
  pointer-events: none;
}
.klt-search-input {
  width: 100%;
  height: 35px;
  padding: 0 30px 0 34px;
  border-radius: 999px;
  border: 1px solid var(--klt-border-strong);
  background: var(--klt-input-bg);
  color: var(--klt-ink);
  font-size: 12.5px;
  outline: none;
  transition: border-color 0.16s, box-shadow 0.16s;
}
.klt-search-input::placeholder {
  color: var(--klt-ink-muted);
}
.klt-search-input:focus {
  border-color: var(--klt-sky);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.klt-search-clear {
  position: absolute;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--klt-neutral-hover);
  color: var(--klt-ink-sec);
  font-size: 10.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.klt-toolbar-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.klt-filter-field {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.klt-filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--klt-ink-muted);
  white-space: nowrap;
}
.klt-select {
  height: 35px;
  padding: 0 11px;
  border-radius: 8px;
  border: 1px solid var(--klt-border-strong);
  background: var(--klt-input-bg);
  color: var(--klt-ink);
  font-size: 12.5px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: border-color 0.16s;
}
.klt-select.is-emerald {
  width: 215px;
  border-color: var(--klt-emerald-border);
  color: var(--klt-emerald);
}
.klt-select.is-sky {
  width: 132px;
  border-color: var(--klt-sky-border);
  color: var(--klt-sky);
}
.klt-select option {
  background: var(--klt-panel-solid);
  color: var(--klt-ink);
}

/* Breadcrumb */
.klt-breadcrumb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 16px;
  background: var(--klt-panel-solid);
  border-bottom: 1px solid var(--klt-border);
  flex-shrink: 0;
  flex-wrap: wrap;
}
.klt-breadcrumb-path {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}
.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 7px;
  color: var(--klt-ink-muted);
  cursor: pointer;
  font-weight: 600;
  font-size: 12.5px;
  transition: background 0.15s, color 0.15s;
}
.breadcrumb-item:hover {
  background: var(--klt-neutral-bg);
  color: var(--klt-ink);
}
.breadcrumb-item.active {
  background: var(--klt-sky-bg);
  color: var(--klt-sky);
  font-weight: 700;
}
.separator {
  color: var(--klt-ink-muted);
  opacity: 0.6;
}
.klt-breadcrumb-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.klt-clipboard-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 3px 6px 3px 10px;
  border-radius: 999px;
  background: var(--klt-amber-bg);
  border: 1px solid var(--klt-amber-border);
  color: var(--klt-amber);
  font-size: 11.5px;
  font-weight: 700;
}
.klt-paste-inline-btn {
  padding: 2px 8px;
  border-radius: 999px;
  border: none;
  background: var(--klt-amber-cta);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.klt-count-badge {
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--klt-well);
  border: 1px solid var(--klt-border);
  color: var(--klt-ink-muted);
  font-size: 11.5px;
  font-weight: 700;
}

/* Upload Progress */
.upload-progress-container {
  padding: 10px 16px;
  background: var(--klt-sky-bg);
  border-bottom: 1px solid var(--klt-sky-border);
  flex-shrink: 0;
}
.upload-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--klt-sky);
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 12.5px;
}
.upload-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.upload-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--klt-panel-solid);
  border: 1px solid var(--klt-border);
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  color: var(--klt-ink);
}
.upload-status-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--klt-sky);
}

.spinner {
  border: 2px solid var(--klt-border-strong);
  border-radius: 50%;
  border-top-color: var(--klt-sky);
  width: 14px;
  height: 14px;
  display: inline-block;
  animation: kltSpin 0.85s linear infinite;
}
.spinner.large {
  width: 28px;
  height: 28px;
  border-width: 3px;
}

.klt-loading-state,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: var(--klt-ink-muted);
  text-align: center;
}
.klt-empty-ico {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: var(--klt-well);
  border: 1px solid var(--klt-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--klt-ink-muted);
}
.empty-state h3 {
  margin: 6px 0 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--klt-ink);
}
.empty-state p {
  margin: 0;
  font-size: 12.5px;
  color: var(--klt-ink-muted);
}

/* ==========================================================================
   GRID VIEW CARDS
========================================================================== */
.file-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 14px;
  padding: 16px;
  overflow-y: auto;
  align-content: start;
}

.file-item {
  position: relative;
  background: var(--klt-card);
  border: 1px solid var(--klt-border);
  border-radius: 13px;
  padding: 18px 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
  -webkit-touch-callout: none;
  user-select: none;
  min-height: 172px;
}
.file-item:hover {
  background: var(--klt-card-hover);
  border-color: var(--klt-sky-border);
  transform: translateY(-2px);
  box-shadow: var(--klt-shadow);
}
.file-item.selected {
  background: var(--klt-sky-bg);
  border-color: var(--klt-sky);
  box-shadow: 0 0 0 1px var(--klt-sky);
}
.file-item.cut-item {
  opacity: 0.48;
  filter: grayscale(0.5);
}

.klt-card-check {
  position: absolute;
  top: 9px;
  left: 9px;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid var(--klt-border-strong);
  background: var(--klt-panel-solid);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}
.klt-card-check.checked {
  background: var(--klt-emerald-cta);
  border-color: transparent;
}

.klt-card-more-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--klt-ink-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.65;
  transition: all 0.15s;
}
.file-item:hover .klt-card-more-btn,
.klt-card-more-btn:hover {
  opacity: 1;
  background: var(--klt-neutral-bg);
  border-color: var(--klt-border-strong);
  color: var(--klt-ink);
}

.item-icon {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 76px;
}
.klt-folder-glyph {
  color: var(--klt-folder-color);
  display: inline-flex;
  filter: drop-shadow(0 6px 12px rgba(37, 99, 235, 0.22));
}
.thumbnail-wrapper {
  width: 78px;
  height: 78px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--klt-border-strong);
  background: var(--klt-well);
}
.thumbnail-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.klt-file-glyph {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--klt-ink-muted);
}
.klt-file-glyph.is-rose { color: var(--klt-rose); }
.klt-file-glyph.is-emerald { color: var(--klt-emerald); }
.klt-file-glyph.is-sky { color: var(--klt-sky); }
.klt-file-glyph.is-amber { color: var(--klt-amber); }
.klt-file-ext-tag {
  margin-top: 2px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  background: var(--klt-well);
  border: 1px solid var(--klt-border-strong);
  color: inherit;
}

.item-details {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.item-name {
  color: var(--klt-ink);
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.35;
  margin: 0;
  width: 100%;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.klt-item-customer-tag {
  max-width: 100%;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--klt-emerald-bg);
  border: 1px solid var(--klt-emerald-border);
  color: var(--klt-emerald);
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.klt-item-customer-tag.is-lg {
  margin-top: 8px;
  font-size: 12px;
  padding: 4px 12px;
}
.item-meta {
  color: var(--klt-ink-muted);
  font-size: 11px;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==========================================================================
   TREE VIEW & SPLIT PREVIEW PANE
========================================================================== */
.tree-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
  padding: 12px;
}

.tree-column {
  flex: 1;
  min-width: 280px;
  max-width: 48%;
  background: var(--klt-card);
  border-radius: 12px;
  border: 1px solid var(--klt-border);
  overflow-y: auto;
}

.file-tree {
  display: flex;
  flex-direction: column;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--klt-border);
  cursor: pointer;
  transition: background 0.14s;
  color: var(--klt-ink);
  user-select: none;
}
.tree-item:last-child {
  border-bottom: none;
}
.tree-item:hover {
  background: var(--klt-card-hover);
}
.tree-item.selected {
  background: var(--klt-sky-bg);
}
.tree-item.cut-item {
  opacity: 0.48;
}

.tree-indent {
  flex-shrink: 0;
}
.klt-tree-check {
  width: 17px;
  height: 17px;
  border-radius: 5px;
  border: 1.5px solid var(--klt-border-strong);
  background: var(--klt-panel-solid);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}
.klt-tree-check.checked {
  background: var(--klt-emerald-cta);
  border-color: transparent;
}

.tree-chevron {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--klt-ink-muted);
  border-radius: 5px;
  flex-shrink: 0;
}
.tree-chevron:hover {
  background: var(--klt-neutral-bg);
  color: var(--klt-ink);
}
.tree-chevron.invisible {
  visibility: hidden;
}

.tree-icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--klt-ink-muted);
}
.tree-icon.folder {
  color: var(--klt-folder-color);
}

.tree-info {
  flex: 1;
  min-width: 0;
}
.tree-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--klt-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tree-customer-sub {
  font-size: 11px;
  color: var(--klt-emerald);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tree-meta {
  font-size: 11px;
  color: var(--klt-ink-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.klt-tree-more-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--klt-ink-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.klt-tree-more-btn:hover {
  background: var(--klt-neutral-bg);
  color: var(--klt-ink);
}

/* Preview Column */
.preview-column {
  flex: 1;
  min-width: 0;
  background: var(--klt-card);
  border-radius: 12px;
  border: 1px solid var(--klt-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.preview-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.klt-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
  border-bottom: 1px solid var(--klt-border);
  color: #ffffff;
  flex-shrink: 0;
}
.preview-column.theme-light-blue .klt-preview-head {
  background: linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%);
}
.klt-preview-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.klt-preview-badge {
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  flex-shrink: 0;
}
.klt-preview-title {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.klt-preview-head-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.mobile-preview-close {
  display: none;
}

.preview-image-container {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--klt-well);
}
.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
}
.preview-iframe-container {
  flex: 1;
  min-height: 0;
  display: flex;
}
.klt-preview-iframe {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
}
.preview-generic,
.preview-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: var(--klt-ink-muted);
}
.klt-preview-folder-name {
  margin: 14px 0 4px;
  font-size: 15px;
  font-weight: 800;
  color: var(--klt-ink);
  max-width: 85%;
  word-break: break-word;
}
.klt-preview-folder-meta {
  margin: 0;
  font-size: 12.5px;
  color: var(--klt-ink-muted);
}

/* ==========================================================================
   FLOATING SELECTION ACTION BAR & CONTEXT MENU
========================================================================== */
.selection-action-bar {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--klt-panel-solid);
  border: 1px solid var(--klt-emerald-border);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.42);
  padding: 10px 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 10040;
  color: var(--klt-ink);
  max-width: calc(100vw - 24px);
}
.klt-sel-count {
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}
.selection-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.custom-context-menu {
  position: fixed;
  background: var(--klt-panel-solid);
  border: 1px solid var(--klt-border-strong);
  border-radius: 12px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
  min-width: 205px;
  z-index: 10085;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.menu-item {
  padding: 8px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--klt-ink-sec);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.14s, color 0.14s;
}
.menu-item:hover:not(.disabled) {
  background: var(--klt-sky-bg);
  color: var(--klt-sky);
}
.menu-item.danger {
  color: var(--klt-rose);
}
.menu-item.danger:hover {
  background: var(--klt-rose-bg);
  color: var(--klt-rose);
}
.menu-item.disabled {
  opacity: 0.42;
  cursor: not-allowed;
}
.menu-divider {
  height: 1px;
  background: var(--klt-border);
  margin: 4px 2px;
}
.shortcut {
  margin-left: auto;
  font-size: 11px;
  color: var(--klt-ink-muted);
  font-weight: 500;
}

/* ==========================================================================
   MODALS (PC CENTERED BOLD GRADIENT HEADER)
========================================================================== */
.klt-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 10060;
  box-sizing: border-box;
}
.klt-modal-overlay.theme-light-blue {
  background: rgba(15, 23, 42, 0.45);
}

.klt-modal-card {
  width: 100%;
  max-width: 460px;
  max-height: calc(100dvh - 32px);
  background: var(--klt-panel-solid);
  border: 1px solid var(--klt-border-strong);
  border-radius: 16px;
  box-shadow: 0 24px 56px -12px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--klt-ink);
}
.klt-modal-card.is-wide-sheet {
  max-width: 540px;
}

.klt-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  color: #ffffff;
  flex-shrink: 0;
}
.klt-modal-head.is-sky-head {
  background: linear-gradient(135deg, #0c4a6e 0%, #0284c7 58%, #2563eb 100%);
}
.klt-modal-head.is-emerald-head {
  background: linear-gradient(135deg, #064e3b 0%, #047857 58%, #0d9488 100%);
}
.klt-modal-head.is-amber-head {
  background: linear-gradient(135deg, #78350f 0%, #b45309 58%, #d97706 100%);
}

.klt-modal-head-left {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}
.klt-modal-head-text {
  min-width: 0;
}
.klt-modal-head-ico {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}
.klt-modal-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
}
.klt-modal-sub {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: rgba(241, 245, 249, 0.88);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.klt-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(2, 6, 23, 0.25);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.klt-modal-close:hover {
  background: rgba(239, 68, 68, 0.85);
  border-color: #fecaca;
}

.klt-modal-body {
  padding: 16px 18px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.klt-form-stack {
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.klt-form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.klt-field-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--klt-ink-muted);
  margin-bottom: 4px;
}
.klt-form-group .klt-field-label {
  margin-bottom: 0;
}

.klt-input {
  width: 100%;
  box-sizing: border-box;
  height: 38px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid var(--klt-border-strong);
  background: var(--klt-input-bg);
  color: var(--klt-ink);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.klt-input:focus {
  border-color: var(--klt-sky);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.klt-input.is-readonly {
  opacity: 0.72;
  background: var(--klt-well);
  cursor: not-allowed;
}

.klt-input-with-btn {
  display: flex;
  gap: 8px;
  align-items: center;
}
.klt-input-with-btn .klt-input {
  flex: 1;
  min-width: 0;
}
.klt-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.klt-target-banner {
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--klt-emerald-bg);
  border: 1px solid var(--klt-emerald-border);
  font-size: 12.5px;
  color: var(--klt-ink);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.klt-target-lbl {
  color: var(--klt-emerald);
  font-weight: 700;
}

.klt-dialog-msg {
  margin: 0;
  color: var(--klt-ink-sec);
  font-size: 13.5px;
  line-height: 1.55;
}
.klt-highlight-name {
  color: var(--klt-sky);
  word-break: break-word;
}

.klt-modal-foot {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: var(--klt-well);
  border-top: 1px solid var(--klt-border);
  flex-shrink: 0;
}

/* Search Customer List */
.klt-search-modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.klt-customer-list {
  flex: 1;
  min-height: 160px;
  max-height: 340px;
  overflow-y: auto;
  border-radius: 10px;
  border: 1px solid var(--klt-border-strong);
  background: var(--klt-well);
}
.klt-customer-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--klt-ink-muted);
  font-size: 13px;
}
.customer-list-item {
  width: 100%;
  text-align: left;
  padding: 11px 13px;
  border: none;
  border-bottom: 1px solid var(--klt-border);
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: background 0.14s;
}
.customer-list-item:last-child {
  border-bottom: none;
}
.customer-list-item:hover {
  background: var(--klt-sky-bg);
}
.klt-cust-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--klt-ink);
}
.klt-cust-company {
  font-size: 12px;
  color: var(--klt-ink-muted);
}

/* Upload Dropzone */
.upload-dropzone {
  border: 2px dashed var(--klt-sky-border);
  border-radius: 14px;
  padding: 36px 20px;
  text-align: center;
  cursor: pointer;
  background: var(--klt-well);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.upload-dropzone:hover,
.upload-dropzone.dragging {
  border-color: var(--klt-sky);
  background: var(--klt-sky-bg);
}
.klt-drop-ico {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--klt-sky-bg);
  border: 1px solid var(--klt-sky-border);
  color: var(--klt-sky);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.klt-drop-title {
  margin: 0 0 6px;
  font-size: 14.5px;
  font-weight: 800;
  color: var(--klt-ink);
}
.klt-drop-sub {
  margin: 0;
  font-size: 12.5px;
  color: var(--klt-ink-muted);
  max-width: 340px;
  line-height: 1.45;
}

/* Alert / Confirm Dialog Card */
.klt-modal-card.is-center-alert {
  max-width: 400px;
  padding: 22px 20px 18px;
  align-items: center;
  text-align: center;
}
.klt-alert-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.klt-alert-icon.is-sky {
  background: var(--klt-sky-bg);
  border: 1px solid var(--klt-sky-border);
  color: var(--klt-sky);
}
.klt-alert-icon.is-rose {
  background: var(--klt-rose-bg);
  border: 1px solid var(--klt-rose-border);
  color: var(--klt-rose);
}
.klt-alert-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 800;
  color: var(--klt-ink);
}
.klt-alert-desc {
  margin: 0 0 18px;
  font-size: 13px;
  color: var(--klt-ink-sec);
  line-height: 1.55;
}
.klt-alert-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
}
.klt-alert-actions .klt-btn {
  min-width: 108px;
}

/* Custom thin scrollbars */
.file-grid::-webkit-scrollbar,
.tree-column::-webkit-scrollbar,
.klt-modal-body::-webkit-scrollbar,
.klt-customer-list::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.file-grid::-webkit-scrollbar-thumb,
.tree-column::-webkit-scrollbar-thumb,
.klt-modal-body::-webkit-scrollbar-thumb,
.klt-customer-list::-webkit-scrollbar-thumb {
  background: var(--klt-border-strong);
  border-radius: 3px;
}

/* ==========================================================================
   MOBILE RESPONSIVE (<= 768px)
   Chuẩn Modal Mobile Safe-Area Top 52px (Phương án A — Đồng bộ SaleReport & QLHH)
========================================================================== */
@media (max-width: 768px) {
  .storage-page.klt-page {
    padding: 10px 10px 76px;
    gap: 10px;
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }

  .klt-header {
    padding: 12px;
    gap: 10px;
  }

  .klt-header-actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }
  .klt-header-actions .klt-btn {
    width: 100%;
    padding: 0 10px;
    font-size: 12px;
  }
  .klt-header-actions .klt-theme-btn {
    grid-column: span 1;
  }

  .klt-workspace {
    overflow: visible;
  }

  .klt-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px;
  }
  .klt-toolbar-left {
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
  }
  .view-toggle {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .view-btn {
    justify-content: center;
  }
  .klt-search-box {
    max-width: 100%;
    min-width: 0;
  }
  .klt-toolbar-filters {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
  }
  .klt-filter-field {
    grid-column: span 2;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
  .klt-filter-field:nth-of-type(2) {
    grid-column: span 1;
  }
  .klt-select.is-emerald,
  .klt-select.is-sky {
    width: 100%;
  }
  .klt-toolbar-filters .klt-icon-btn {
    align-self: end;
  }

  .file-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 10px;
  }
  .file-item {
    min-height: 152px;
    padding: 14px 10px 12px;
  }

  .tree-layout {
    flex-direction: column;
    padding: 10px;
  }
  .tree-column {
    max-width: 100%;
    min-width: 0;
  }
  .preview-column {
    display: none;
  }

  /* ─── 1. MOBILE PREVIEW FULLSCREEN (EDGE-TO-EDGE + SAFE-AREA TOP 52px) ─── */
  .preview-column.mobile-modal-active {
    display: flex;
    position: fixed;
    inset: 0;
    width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    z-index: 10065;
    border-radius: 0 !important;
    border: none !important;
    background: var(--klt-panel-solid);
  }
  .preview-column.mobile-modal-active .klt-preview-head {
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) !important;
    padding-bottom: 12px !important;
    padding-left: 14px !important;
    padding-right: 14px !important;
    border-radius: 0 !important;
  }
  .preview-column.mobile-modal-active .mobile-preview-close {
    display: inline-flex;
  }

  /* ─── 2. MODAL FULLSCREEN TRÊN MOBILE (UPLOAD, GẮN NHÃN, THÊM KH, TÌM KH) ─── */
  .klt-modal-overlay.is-sheet-fullscreen {
    padding: 0 !important;
    align-items: stretch !important;
    justify-content: stretch !important;
  }
  .klt-modal-overlay.is-sheet-fullscreen > .klt-modal-card {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  .klt-modal-overlay.is-sheet-fullscreen > .klt-modal-card > .klt-modal-head {
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) !important;
    padding-bottom: 12px !important;
    padding-left: 14px !important;
    padding-right: 14px !important;
    border-radius: 0 !important;
  }
  .klt-modal-overlay.is-sheet-fullscreen > .klt-modal-card > .klt-modal-foot {
    padding-bottom: max(calc(env(safe-area-inset-bottom, 0px) + 10px), 14px) !important;
  }
  .klt-customer-list {
    max-height: none;
  }
  .klt-grid-2 {
    grid-template-columns: 1fr;
  }

  /* ─── 3. MODAL NHỎ / DIALOG / CONFIRM GIỮA MÀN HÌNH (CÁCH ĐỈNH TỐI THIỂU 56px) ─── */
  .klt-modal-overlay.is-dialog-overlay {
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 12px), 56px) !important;
    padding-bottom: max(calc(env(safe-area-inset-bottom, 0px) + 12px), 24px) !important;
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
  .klt-modal-overlay.is-dialog-overlay > .klt-modal-card {
    max-height: calc(100dvh - max(calc(env(safe-area-inset-top, 0px) + 24px), 80px)) !important;
  }

  .selection-action-bar {
    bottom: 72px;
    border-radius: 14px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: calc(100vw - 20px);
    padding: 10px 12px;
  }
  .selection-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .selection-actions .klt-btn {
    width: 100%;
  }
}

/* ==========================================================================
   BAOGIAFIREBASE 100% CUSTOMER WORKSPACE MODAL & CUSTOMER PICKER MODAL
   Dual-Theme (Dark Navy & Enterprise Light Blue) + Mobile Safe-Area Top 52px
========================================================================== */
.bg-cust-fullscreen-overlay {
  padding: 0 !important;
  align-items: stretch !important;
  justify-content: stretch !important;
  z-index: 10062;
}

.bg-cust-fullscreen-card {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0b1322;
  color: #f8fafc;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-fullscreen-card {
  background: #f0f5fa;
  color: #0f172a;
}

.bg-modal-head-themed {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 24px;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #ffffff;
  flex-shrink: 0;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-modal-head-themed {
  background: linear-gradient(135deg, #0284c7, #2563eb);
}

.bg-dt-only-head {
  margin: 0;
  color: #ffffff;
  text-transform: uppercase;
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 0.5px;
}
.bg-m-grab-head-stack {
  display: none;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.bg-m-grab-eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.bg-m-grab-title {
  font-size: 15.5px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
}

.bg-modal-x-btn {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.18);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.bg-modal-x-btn:hover {
  background: rgba(239, 68, 68, 0.85);
}

.bg-cust-top-toolbar {
  padding: 12px 32px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-top-toolbar {
  background: #ffffff;
  border-bottom-color: #cbd5e1;
}

.bg-cust-toolbar-status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.bg-cust-db-badge {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.bg-cust-db-badge.is-in-db {
  background: rgba(16, 185, 129, 0.16);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.4);
}
.bg-cust-db-badge.is-new {
  background: rgba(245, 158, 11, 0.16);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-db-badge.is-new {
  background: #fffbeb;
  color: #b45309;
  border-color: #fcd34d;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-db-badge.is-in-db {
  background: #ecfdf5;
  color: #059669;
  border-color: #6ee7b7;
}

.bg-cust-meta-chip {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.9;
}
.bg-cust-meta-chip strong.is-sky { color: #38bdf8; }
.bg-cust-meta-chip strong.is-emerald { color: #34d399; }
.bg-cust-meta-chip strong.is-sky-deep { color: #0284c7; }
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-meta-chip strong.is-sky { color: #0284c7; }
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-meta-chip strong.is-emerald { color: #059669; }

.bg-cust-toolbar-right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bg-cust-tb-btn {
  padding: 7px 13px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  border: none;
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  transition: filter 0.15s, transform 0.15s;
}
.bg-cust-tb-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}
.bg-cust-tb-btn.is-save {
  background: #10b981;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}
.bg-cust-tb-btn.is-reset {
  background: #ef4444;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.bg-cust-mobile-mini-actions {
  display: none;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.bg-cust-mini-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
  cursor: pointer;
}
.bg-cust-mini-btn.is-save { background: #10b981; }
.bg-cust-mini-btn.is-reset { background: #ef4444; }

.bg-save-modal-body-scroll {
  padding: 20px 32px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.bg-save-modal-top-grid {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 20px;
  align-items: stretch;
  flex: 1;
}
.bg-cust-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.bg-cust-group-box {
  border-radius: 10px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
}
.bg-cust-group-box.is-main {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.18);
  flex: 1;
}
.bg-cust-group-box.is-company {
  background: rgba(56, 189, 248, 0.05);
  border: 1px solid rgba(56, 189, 248, 0.18);
  flex: 1;
}
.bg-cust-group-box.is-sub {
  background: rgba(148, 163, 184, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.16);
  padding: 18px 22px;
  gap: 12px;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-group-box.is-main {
  background: #f0fdf4;
  border-color: #86efac;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-group-box.is-company {
  background: #eff6ff;
  border-color: #93c5fd;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-group-box.is-sub {
  background: #ffffff;
  border-color: #cbd5e1;
}

.bg-cust-group-title {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.8px;
}
.bg-cust-group-title.is-emerald { color: #10b981; }
.bg-cust-group-title.is-sky { color: #0284c7; }
.bg-cust-group-title.is-sub-title { font-size: 11px; color: #f8fafc; }
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-group-title.is-sub-title { color: #1e3a8a; }

.bg-cust-row-1-14 { display: grid; grid-template-columns: 1fr 1.4fr; gap: 12px; }
.bg-cust-row-sub-3 { display: grid; grid-template-columns: 1.1fr 0.9fr 1.2fr; gap: 12px; }
.bg-cust-row-22-1 { display: grid; grid-template-columns: 2.2fr 1fr; gap: 12px; }
.bg-cust-row-company-3 { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr; gap: 12px; }
.bg-cust-row-po-4 { display: grid; grid-template-columns: 1.5fr 0.8fr 0.8fr 1.8fr; gap: 12px; }

.bg-cust-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.bg-cust-field label {
  font-size: 10.5px;
  text-transform: uppercase;
  color: #e2e8f0;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-field label {
  color: #334155;
}

/* Input + Inline CHỌN Button (100% chuẩn baogiaFirebase.vue) */
.bg-input-with-picker {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}
.bg-wrap-input {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  min-height: 38px;
  resize: none;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.72);
  color: #f8fafc;
  font-family: inherit;
  outline: none;
  margin: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.bg-wrap-input.has-right-picker {
  padding-right: 64px;
}
.bg-wrap-input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.18);
}
.theme-light-blue .bg-wrap-input {
  background: #ffffff;
  color: #0f172a;
  border-color: #cbd5e1;
}
.theme-light-blue .bg-wrap-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.bg-inline-picker-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: rgba(2, 132, 199, 0.22);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.45);
  cursor: pointer;
  width: fit-content;
  margin: 0;
  line-height: 1.1;
  z-index: 3;
  transition: all 0.15s ease;
}
.bg-inline-picker-btn:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}
.theme-light-blue .bg-inline-picker-btn {
  background: #e0f2fe;
  color: #0369a1;
  border-color: #7dd3fc;
}
.theme-light-blue .bg-inline-picker-btn:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

.bg-mobile-cust-accordion-btn {
  display: none;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-mobile-cust-accordion-btn {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #1e293b;
}

.bg-cust-modal-footer {
  padding: 14px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.95);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.bg-cust-fullscreen-overlay.theme-light-blue .bg-cust-modal-footer {
  background: #ffffff;
  border-top-color: #cbd5e1;
}
.bg-cust-foot-save-btn {
  padding: 11px 22px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 13.5px;
  color: #ffffff;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.28);
  transition: transform 0.15s, filter 0.15s;
}
.bg-cust-foot-save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
.bg-cust-foot-close-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: background 0.15s;
}
.bg-cust-foot-close-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}
.theme-light-blue .bg-cust-foot-close-btn {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}
.theme-light-blue .bg-cust-foot-close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* ─── MODAL CHỌN KHÁCH HÀNG (showCustomerPickerModal — 100% chuẩn baogiaFirebase.vue) ─── */
.bg-picker-modal-card {
  width: 680px;
  max-width: 94vw;
  height: 74vh;
  max-height: 680px;
  border-radius: 14px;
  background: #0b1322;
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  color: #f8fafc;
}
.theme-light-blue .bg-picker-modal-card {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.22);
  color: #0f172a;
}

.bg-picker-modal-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #0284c7, #2563eb);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.bg-picker-search-toolbar {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.theme-light-blue .bg-picker-search-toolbar {
  background: #f8fafc;
  border-bottom-color: #cbd5e1;
}

.bg-picker-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 220px;
}
.bg-picker-search-input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  outline: none;
}
.bg-picker-search-input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.18);
}
.theme-light-blue .bg-picker-search-input {
  background: #ffffff;
  color: #0f172a;
  border-color: #cbd5e1;
}
.bg-picker-search-clear-btn {
  padding: 8px 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  background: #64748b;
  color: #ffffff;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}
.bg-picker-counter {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.bg-picker-counter strong {
  color: #0284c7;
}

.bg-picker-table-wrap {
  padding: 14px 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.bg-picker-table-box {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.45);
}
.theme-light-blue .bg-picker-table-box {
  background: #ffffff;
  border-color: #cbd5e1;
}

.bg-picker-data-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 13px;
}
.bg-picker-data-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #1e293b;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 11px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
}
.bg-picker-data-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  color: #f1f5f9;
  vertical-align: middle;
  word-break: break-word;
}
.bg-picker-row {
  cursor: pointer;
  transition: background 0.12s ease;
}
.bg-picker-row:hover {
  background: rgba(56, 189, 248, 0.1);
}
.bg-picker-row.is-selected {
  background: rgba(16, 185, 129, 0.16);
}
.bg-picker-select-btn {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 800;
  background: #0284c7;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.bg-picker-select-btn:hover {
  background: #0369a1;
}
.bg-picker-empty-td {
  padding: 36px 16px;
  text-align: center;
  font-weight: 600;
  opacity: 0.75;
}
.bg-picker-more-row {
  cursor: pointer;
}
.bg-picker-more-row td {
  padding: 12px;
  text-align: center;
  font-weight: 700;
  color: #0284c7 !important;
  font-size: 12px;
}

.theme-light-blue .bg-picker-data-table thead th {
  background: #f1f5f9;
  color: #334155;
  border-bottom-color: #cbd5e1;
}
.theme-light-blue .bg-picker-data-table tbody td {
  color: #0f172a;
  border-bottom-color: #e2e8f0;
}
.theme-light-blue .bg-picker-row:hover {
  background: #f0f9ff;
}
.theme-light-blue .bg-picker-row.is-selected {
  background: #ecfdf5;
}

.bg-picker-modal-footer {
  padding: 10px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.95);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.theme-light-blue .bg-picker-modal-footer {
  background: #f8fafc;
  border-top-color: #cbd5e1;
}

@media (max-width: 980px) {
  .bg-save-modal-top-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .bg-dt-only-head {
    display: none !important;
  }
  .bg-m-grab-head-stack {
    display: flex !important;
  }
  .bg-modal-head-themed,
  .bg-picker-modal-head {
    justify-content: flex-start !important;
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) !important;
    padding-bottom: 12px !important;
    padding-left: 14px !important;
    padding-right: 54px !important;
    border-radius: 0 !important;
  }
  .bg-modal-x-btn {
    top: max(calc(env(safe-area-inset-top, 0px) + 8px), 52px) !important;
    right: 12px !important;
    transform: none !important;
    width: 34px !important;
    height: 34px !important;
  }
  .bg-cust-top-toolbar {
    padding: 10px 14px;
  }
  .bg-cust-toolbar-right-actions,
  .bg-cust-last-updated {
    display: none !important;
  }
  .bg-cust-mobile-mini-actions {
    display: inline-flex !important;
  }
  .bg-save-modal-body-scroll {
    padding: 12px 14px;
    gap: 12px;
  }
  .bg-cust-group-box {
    padding: 14px !important;
  }
  .bg-cust-row-1-14,
  .bg-cust-row-sub-3,
  .bg-cust-row-22-1,
  .bg-cust-row-company-3,
  .bg-cust-row-po-4 {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .bg-mobile-cust-accordion-btn {
    display: flex !important;
  }
  .bg-cust-collapsible-sub {
    display: none !important;
  }
  .bg-cust-collapsible-sub.is-mobile-open {
    display: flex !important;
  }
  .bg-cust-modal-footer,
  .bg-picker-modal-footer {
    padding: 10px 14px max(calc(env(safe-area-inset-bottom, 0px) + 10px), 14px) !important;
  }
  .bg-picker-modal-card {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
  }
  .bg-picker-search-toolbar {
    padding: 10px 14px;
  }
  .bg-picker-table-wrap {
    padding: 10px 14px;
  }
}
</style>
