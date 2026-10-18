<template>
  <div class="quan-ly-hang-hoa">
    <div class="page-header">
      <h1 class="page-title">Quản lý Hàng Hóa</h1>
      <div class="actions">
        <a href="/template_excel/SOPHOS_file_mau_import.xlsx" download class="btn btn-outline" style="border-color: rgba(59,130,246,0.3); color: #94a3b8; font-size: 12px; padding: 4px 8px;" title="Tải file mẫu Sophos">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Mẫu Sophos
        </a>
        <label class="btn btn-outline" style="cursor: pointer; border-color: #3b82f6; color: #3b82f6;">
          <input type="file" accept=".xlsx" style="display:none" @change="handleFileUpload" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Import Sophos
        </label>
        <a href="/template_excel/KASPERSKY_file_mau_import.xlsx" download class="btn btn-outline" style="border-color: rgba(16,185,129,0.3); color: #94a3b8; font-size: 12px; padding: 4px 8px;" title="Tải file mẫu Kaspersky">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Mẫu Kaspersky
        </a>
        <label class="btn btn-outline" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; cursor: pointer;">
          <input type="file" accept=".xlsx" style="display:none" @change="handleKasperskyUpload" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Import Kaspersky
        </label>
        <label class="btn btn-outline" style="border-color: rgba(99, 102, 241, 0.5); color: #818cf8; cursor: pointer;">
          <input type="file" accept=".xlsx" style="display:none" @change="handleAcronisUpload" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Import Acronis
        </label>
        <a href="/template_excel/ACRONIS_file_mau_import.xlsx" download="ACRONIS_file_mau_import.xlsx" class="btn btn-outline" style="border-color: rgba(99,102,241,0.3); color: #94a3b8; font-size: 12px; padding: 4px 8px;" title="Tải file mẫu Acronis">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Mẫu Acronis
        </a>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label class="btn btn-outline" style="border-color: rgba(167, 139, 250, 0.4); color: #a78bfa; cursor: pointer;">
            <input type="file" accept="image/*,.pdf" style="display:none" @change="handleGiaOffUpload" />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Import Mức Off
          </label>
          <div v-if="latestFileGiaOff" style="display: flex; flex-direction: column; font-size: 11px; color: #94a3b8; max-width: 250px; line-height: 1.2;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="latestFileGiaOff.ten_file">
              File: <a :href="latestFileGiaOff.link_file" target="_blank" style="color: #a78bfa; text-decoration: underline; font-weight: bold;">{{ latestFileGiaOff.ten_file }}</a>
            </span>
            <span>Thời gian: {{ formatGiaOffDate(latestFileGiaOff.thoi_gian) }}</span>
          </div>
        </div>
        <button class="btn btn-pricelist" @click="openCreatePriceListModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          Tạo Bảng Giá
        </button>
        <button class="btn btn-primary" @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm mới
        </button>
        <button class="btn btn-secondary" @click="fetchData" :disabled="loading">
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          <span v-else class="spinner"></span>
          Làm mới
        </button>
      </div>
    </div>

    <!-- Filters & Price List Selector -->
    <div class="filters" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <div style="flex: 1; min-width: 240px; max-width: 360px; position: relative;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" v-model="searchQuery" placeholder="Tìm mã / tên hàng / NCC..." class="search-input" style="padding-left: 36px; max-width: 100%;" />
      </div>
      <div style="flex: 1; min-width: 200px; max-width: 240px; position: relative;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <input type="number" v-model="userVolumeFilter" placeholder="Số lượng user (Volume)..." class="search-input" style="padding-left: 36px; max-width: 100%;" />
      </div>

      <!-- Khung chọn Bảng Giá -->
      <div class="pricelist-bar">
        <div class="pricelist-select-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          <select v-model="selectedPriceListId" class="pricelist-select">
            <option value="">📋 Giá gốc hệ thống ({{ items.length }} SP)</option>
            <option v-for="pl in priceLists" :key="pl._firebaseKey" :value="pl._firebaseKey">
              🏷️ {{ pl.ten_bang_gia }} ({{ (pl.items || []).length }} SP){{ formatPriceListPeriodInline(pl) }}
            </option>
          </select>
        </div>

        <template v-if="activePriceList">
          <span class="pricelist-period-badge" v-if="activePriceList.ngay_bat_dau || activePriceList.ngay_ket_thuc">
            🗓️ {{ formatPriceListPeriod(activePriceList) }}
          </span>
          <span class="pricelist-status-badge" :class="getPriceListStatusInfo(activePriceList).cls">
            {{ getPriceListStatusInfo(activePriceList).label }}
          </span>
          <button
            type="button"
            class="pricelist-autosync-btn"
            :class="activePriceList.auto_sync_base_price ? 'on' : 'off'"
            @click="togglePriceListAutoSync(activePriceList)"
            :title="activePriceList.auto_sync_base_price ? 'Đang BẬT: Khi giá gốc thay đổi, bảng giá này sẽ tự động tính lại theo % / số tiền tăng giảm. Nhấn để TẮT.' : 'Đang TẮT: Giữ cố định giá bán hiện tại dù giá gốc thay đổi. Nhấn để BẬT tự động cập nhật.'"
          >
            <span v-if="activePriceList.auto_sync_base_price">🔄 Tự động theo giá gốc: BẬT</span>
            <span v-else>🔒 Giá cố định (Tắt tự động)</span>
          </button>
          <span class="pricelist-rule-badge" v-if="activePriceList.default_rule && activePriceList.default_rule.value">
            {{ activePriceList.default_rule.direction === 'decrease' ? 'Giảm (-)' : 'Tăng (+)' }}
            {{ activePriceList.default_rule.type === 'percent' ? activePriceList.default_rule.value + '%' : formatNumberPlain(activePriceList.default_rule.value) }}
          </span>
          <button type="button" class="pricelist-action-btn edit" @click="openEditPriceListModal(activePriceList)" title="Chỉnh sửa bảng giá">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Sửa
          </button>
          <button type="button" class="pricelist-action-btn export" @click="exportPriceListToExcel(activePriceList)" title="Xuất Excel bảng giá">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Xuất Excel
          </button>
          <button type="button" class="pricelist-action-btn delete" @click="requestDeletePriceList(activePriceList)" title="Xóa bảng giá">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </template>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="products-grid">
      <!-- Skeleton Loading -->
      <template v-if="loading && !items.length">
        <div v-for="i in 8" :key="'skeleton-' + i" class="product-card skeleton-card">
          <div class="card-body">
            <div class="card-top">
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <div class="skeleton skeleton-badge"></div>
                <div class="skeleton skeleton-badge" style="width: 120px;"></div>
              </div>
            </div>
            <div class="skeleton skeleton-title" style="margin-top: 12px;"></div>
            <div class="skeleton skeleton-title" style="width: 70%; margin-top: 8px;"></div>
            <div class="skeleton skeleton-desc" style="margin-top: 16px;"></div>
            <div class="skeleton skeleton-desc" style="width: 80%;"></div>
            
            <div class="price-info-box" style="border-color: rgba(255,255,255,0.05);">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text" style="width: 60%;"></div>
              <div class="skeleton skeleton-text" style="width: 50%;"></div>
              
              <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 6px 0; width: 100%;"></div>
              
              <div class="skeleton skeleton-text" style="width: 70%;"></div>
              <div class="skeleton skeleton-text" style="width: 80%;"></div>
              <div class="skeleton skeleton-price" style="margin-top: 8px;"></div>
            </div>
          </div>
        </div>
      </template>
      <div v-else-if="!filteredItems.length" class="empty-state text-center py-8 text-muted">
        Không có hàng hóa nào.
      </div>
      
      <template v-else v-for="(groupItems, category) in groupedItems" :key="category">
        <!-- Category Group Header (Folder Style) -->
        <div class="folder-header">
          <div class="folder-tab">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span>SỐ LƯỢNG: {{ groupItems.length }}</span>
          </div>
          <div class="folder-body">
            <h3 class="folder-title" :title="category">{{ category }}</h3>
          </div>
        </div>
        
        <div v-for="(item, index) in groupItems" :key="item.Ma_hang || index" class="product-card" @click="openEditModal(item)" style="cursor: pointer;">
          <div class="card-body">
            <div class="card-top">
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="brand-badge" v-if="item.Ten_nha_cung_cap">
                  {{ item.Ten_nha_cung_cap }}
                </span>
                <span class="category-badge" v-if="item.Danh_muc">
                  {{ item.Danh_muc }}
                </span>
              </div>
              <div class="card-actions">
                <button class="btn-icon text-primary" title="Sửa" @click.stop="openEditModal(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon text-danger" title="Xóa" @click.stop="requestDelete(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
            <h3 class="product-name" :title="item.Ten_hang" v-html="highlightText(item.Ten_hang, searchQuery)"></h3>
            <p class="product-desc text-muted" v-if="item.Mo_ta_chung" :title="item.Mo_ta_chung">{{ item.Mo_ta_chung }}</p>
            <div class="price-info-box">
              <p>License duration: <span>{{ item.License_duration || '-' }}</span></p>
              <p>Thời hạn bảo hành: <span>{{ item.thoi_han_bao_hanh || '-' }}</span></p>
              <p>Volume: <span>{{ item.volume || '-' }}</span></p>
              <p>Đơn vị tiền tệ: <span>{{ item.Don_vi_tien_te || '-' }}</span></p>
              <p>Tỉ giá: <span>{{ item.Ti_gia ? formatCurrency(item.Ti_gia, 'VND') : '-' }}</span></p>
              
              <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 6px 0; width: 100%;"></div>
              
              <p style="color: #fbbf24;">Giá nhập: <span style="color: #fcd34d;">{{ formatCurrency(item.gia_nhap || 0, item.Don_vi_tien_te) }}</span></p>
              <p>Thuế VAT: <span style="color: #facc15;">{{ item.Thue_VAT ? item.Thue_VAT + '%' : '0%' }}</span></p>
              <template v-if="getPriceListEntry(item)">
                <p style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                  Giá bán gốc:
                  <span style="text-decoration: line-through; color: #64748b;">
                    {{ formatCurrency(activePriceList?.auto_sync_base_price ? item.Don_gia : getPriceListEntry(item).gia_goc, item.Don_vi_tien_te) }}
                  </span>
                </p>
                <p class="highlight" style="margin-top: 4px;">
                  <span style="display: inline-flex; align-items: center; gap: 6px;">
                    Giá bảng giá:
                    <span class="pl-card-diff-badge" :class="getPriceListDiffClass(getPriceListEntry(item), activePriceList?.auto_sync_base_price ? item.Don_gia : getPriceListEntry(item).gia_goc)">
                      {{ formatPriceListRuleShort(getPriceListEntry(item), activePriceList?.auto_sync_base_price ? item.Don_gia : getPriceListEntry(item).gia_goc) }}
                    </span>
                  </span>
                  <span style="color: #34d399; font-weight: 700;">
                    {{ formatCurrency(getPriceListEntry(item).gia_ban_moi, item.Don_vi_tien_te) }}
                    <small v-if="item.DVT" style="font-size: 11px; color: #64748b; font-weight: 500;">/ {{ item.DVT }}</small>
                  </span>
                </p>
              </template>
              <p v-else class="highlight" style="margin-top: 4px;">
                Giá bán: 
                <span>
                  {{ formatCurrency(item.Don_gia, item.Don_vi_tien_te) }}
                  <small v-if="item.DVT" style="font-size: 11px; color: #64748b; font-weight: 500;">/ {{ item.DVT }}</small>
                </span>
              </p>
              <p style="font-size: 11.5px; color: #64748b; margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.07);">
                Cập nhật gốc: <span style="color: #94a3b8; font-weight: 500;">{{ formatLastUpdated(item.last_updated) }}</span>
              </p>
            </div>
          </div>
        </div>
      </template>
      
      <!-- NÚT XEM THÊM -->
      <button v-if="totalGroupsCount > displayLimit" 
              @click="displayLimit += 15" 
              style="width: 100%; margin-top: 20px; padding: 14px; background: rgba(56, 189, 248, 0.1); border: 1px dashed rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='rgba(56, 189, 248, 0.2)';" 
              onmouseout="this.style.background='rgba(56, 189, 248, 0.1)';">
        <i class="lucide-chevron-down" style="font-size: 14px; margin-right: 4px;"></i> 
        Xem thêm (còn {{ totalGroupsCount - displayLimit }} nhóm sản phẩm)
      </button>

    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <h2>{{ isEditing ? 'Cập nhật hàng hóa' : 'Thêm hàng hóa mới' }}</h2>
            <span v-if="isEditing && formData.last_updated" style="font-size: 12px; color: #94a3b8; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 99px;">
              🕒 Cập nhật cuối: <strong style="color: #38bdf8;">{{ formatLastUpdated(formData.last_updated) }}</strong>
            </span>
            <span v-if="isEditing && activePriceList && formData._has_pl_entry" style="font-size: 12px; color: #fbbf24; background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.35); padding: 4px 12px; border-radius: 99px;">
              🏷️ Đang sửa theo bảng giá: <strong style="color: #fde68a;">{{ activePriceList.ten_bang_gia }}</strong>
            </span>
          </div>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveItem" class="form-grid-2col">
            <!-- CỘT 1 -->
            <div class="col-left form-panel">
              <h3 class="panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="panel-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Thông tin chung
              </h3>
              <div class="panel-content">
                <div class="form-group">
                  <label>Mã hàng <span class="required">*</span></label>
                  <input v-model="formData.Ma_hang" type="text" required :disabled="isEditing" />
                </div>
                <div class="form-group col-span-2">
                  <label>Tên hàng <span class="required">*</span></label>
                  <input v-model="formData.Ten_hang" type="text" required />
                </div>
                <div class="form-group">
                  <label>License duration</label>
                  <input v-model="formData.License_duration" type="text" />
                </div>
                <div class="form-group">
                  <label>Thời hạn bảo hành</label>
                  <input v-model="formData.thoi_han_bao_hanh" type="text" />
                </div>
                <div class="form-group">
                  <label>Volume</label>
                  <input v-model="formData.volume" type="text" placeholder="VD: 1Dvc, 3Dvc, 10Dvc..." />
                </div>
                <div class="form-group">
                  <label>Danh mục</label>
                  <input v-model="formData.Danh_muc" type="text" />
                </div>
                <div class="form-group">
                  <label>Loại hàng (Type)</label>
                  <input v-model="formData.Type" type="text" list="type-options" />
                  <datalist id="type-options">
                    <option value="Hardware"></option>
                    <option value="Software"></option>
                    <option value="Accessories"></option>
                  </datalist>
                </div>
                <div class="form-group">
                  <label>Nhà cung cấp</label>
                  <input v-model="formData.Ten_nha_cung_cap" type="text" list="ncc-options" />
                  <datalist id="ncc-options">
                    <option value="SOPHOS"></option>
                    <option value="KASPERSKY"></option>
                    <option value="ACRONIS"></option>
                  </datalist>
                </div>
                <!--
                <div class="form-group">
                  <label>Mã NCC</label>
                  <input v-model="formData.Ma_nha_cung_cap" type="text" />
                </div>
                -->
                <div class="form-group">
                  <label>Đơn vị tính</label>
                  <input v-model="formData.DVT" type="text" />
                </div>
                <div class="form-group col-span-2">
                  <label>Features (Tính năng)</label>
                  <ExcelEditor v-model="formData.Features" placeholder="Nhập tính năng sản phẩm..." class="features-excel-editor" />
                </div>
                <div class="form-group col-span-2">
                  <label>Ghi chú</label>
                  <textarea v-model="formData.Ghi_chu" rows="2"></textarea>
                </div>
              </div>
            </div>

            <!-- CỘT 2 -->
            <div class="col-right form-panel">
              <h3 class="panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="panel-icon"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Thông tin giá cả
              </h3>
              <div class="panel-content">
                <div class="form-group" :class="{'col-span-2': formData.Don_vi_tien_te === 'VND'}">
                  <label>Tiền tệ</label>
                  <select v-model="formData.Don_vi_tien_te" class="select-input">
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div class="form-group" v-if="formData.Don_vi_tien_te !== 'VND'">
                  <label>Tỉ giá</label>
                  <NumberInput v-model="formData.Ti_gia" />
                </div>
                <div class="form-group col-span-2">
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
                    <label style="margin-bottom: 0; display: inline-flex; align-items: center; gap: 6px;">
                      <span>{{ isEditing && activePriceList && formData._has_pl_entry ? `Đơn giá (${activePriceList.ten_bang_gia})` : 'Đơn giá' }}</span>
                      <span
                        v-if="isEditing && activePriceList && formData._has_pl_entry"
                        class="pl-card-diff-badge"
                        :class="toNum(formData.Don_gia) > toNum(formData._gia_goc_he_thong) ? 'up' : (toNum(formData.Don_gia) < toNum(formData._gia_goc_he_thong) ? 'down' : 'neutral')"
                      >
                        {{ formatModalPriceListBadge() }}
                      </span>
                    </label>
                    <span v-if="isEditing && activePriceList && formData._has_pl_entry" style="font-size: 11.5px; color: #94a3b8;">
                      Giá gốc hệ thống: <strong style="color: #cbd5e1;">{{ formatCurrency(formData._gia_goc_he_thong, formData.Don_vi_tien_te) }}</strong>
                    </span>
                  </div>
                  <NumberInput v-model="formData.Don_gia" @update:modelValue="onModalDonGiaChange" />
                  <div
                    v-if="isEditing && activePriceList && formData._has_pl_entry"
                    style="margin-top: 8px; padding: 8px 10px; background: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.35); border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;"
                  >
                    <span style="font-size: 12px; color: #fcd34d; font-weight: 600;">
                      ⚡ Chỉnh % theo giá gốc:
                    </span>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <select
                        v-model="formData._pl_direction"
                        @change="onModalPriceListPctChange"
                        class="pl-row-select"
                        :class="formData._pl_direction === 'decrease' ? 'down' : 'up'"
                        style="height: 32px; font-size: 12px;"
                      >
                        <option value="increase">+ Tăng</option>
                        <option value="decrease">- Giảm</option>
                      </select>
                      <div style="position: relative; display: inline-flex; align-items: center;">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          v-model.number="formData._pl_pct"
                          @input="onModalPriceListPctChange"
                          style="width: 86px; height: 32px; padding: 4px 24px 4px 8px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.4); background: #0f172a; color: #34d399; font-weight: 700; font-size: 13px; text-align: right;"
                        />
                        <span style="position: absolute; right: 7px; font-size: 12px; color: #94a3b8; font-weight: 700; pointer-events: none;">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group col-span-2">
                  <label>Thuế VAT (%)</label>
                  <NumberInput v-model="formData.Thue_VAT" />
                </div>
                <div class="form-group col-span-2">
                  <label>Giá nhập</label>
                  <NumberInput v-model="formData.gia_nhap" />
                </div>
                <!--
                <div class="form-group col-span-2">
                  <label>Mức % Off</label>
                  <input v-model="formData.muc_phan_tram_off" type="number" step="0.1" />
                </div>
                -->
              </div>

              <!-- HIDDEN FIELDS -->
              <!--
              <div class="form-group">
                <label>Trạng thái</label>
                <input v-model="formData.Trang_thai" type="text" />
              </div>
              <div class="form-group">
                <label>Giá tiêu chuẩn</label>
                <input v-model="formData.Gia_tieu_chuan" type="number" />
              </div>
              <div class="form-group">
                <label>Giá Hardware</label>
                <input v-model="formData.gia_hardware" type="number" />
              </div>
              <div class="form-group">
                <label>Mã hàng LK</label>
                <input v-model="formData.Ma_hang_lien_ket" type="text" />
              </div>
              <div class="form-group">
                <label>Tên hàng LK</label>
                <input v-model="formData.Ten_hang_lien_ket" type="text" />
              </div>
              <div class="form-group">
                <label>Mô tả chung</label>
                <textarea v-model="formData.Mo_ta_chung" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Mô tả chi tiết</label>
                <textarea v-model="formData.Mo_ta_chi_tiet" rows="3"></textarea>
              </div>
              -->
            </div>
          </form>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: space-between;">
          <div>
            <button v-if="isEditing" type="button" class="btn btn-danger" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);" @click="requestDelete(formData)">Xóa</button>
          </div>
          <div style="display: flex; gap: 12px;">
            <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
            <button v-if="isDirty" type="button" class="btn btn-primary" @click="saveItem" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Đang lưu...' : 'Lưu lại' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- IMPORT PREVIEW MODAL -->
    <div v-if="showImportModal" class="import-overlay" @click.self="showImportModal = false">
      <div class="import-modal">
        <!-- Header -->
        <div class="import-modal__header">
          <div class="import-modal__header-left">
            <div class="import-modal__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <h2 class="import-modal__title">Import dữ liệu hàng hóa</h2>
              <p class="import-modal__subtitle">Kiểm tra và chỉnh sửa trước khi lưu vào hệ thống</p>
            </div>
          </div>
          <button class="import-modal__close" @click="showImportModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="import-stats">
          <div class="import-stat-card">
            <div class="import-stat-card__value">{{ importData.length }}</div>
            <div class="import-stat-card__label">Tổng sản phẩm</div>
          </div>
          <div class="import-stat-card import-stat-card--blue">
            <div class="import-stat-card__value">{{ importSheetNames.length }}</div>
            <div class="import-stat-card__label">Sheet</div>
          </div>
          <div class="import-stat-card import-stat-card--amber">
            <div class="import-stat-card__value">{{ filteredImportData.length }}</div>
            <div class="import-stat-card__label">Đang hiển thị</div>
          </div>
          <div class="import-stat-card import-stat-card--green">
            <div class="import-stat-card__value">{{ importData[0]?.Ten_nha_cung_cap || '—' }}</div>
            <div class="import-stat-card__label">Nhà cung cấp</div>
          </div>
        </div>

        <!-- Sheet Tabs -->
        <div class="import-tabs">
          <button v-for="sheet in importSheetNames" :key="sheet"
                  @click="activeImportSheet = sheet"
                  :class="['import-tab', { 'import-tab--active': activeImportSheet === sheet }]">
            <span class="import-tab__name">{{ sheet }}</span>
            <span class="import-tab__badge">{{ importData.filter(p => p.Sheet_name === sheet).length }}</span>
          </button>
        </div>

        <!-- Table -->
        <div class="import-table-wrap">
          <table class="import-table">
            <thead>
              <tr>
                <th class="import-th--sticky-left import-th--idx">#</th>
                <th style="min-width:160px">Mã hàng</th>
                <th style="min-width:280px">Tên hàng</th>
                <th style="min-width:600px">Features</th>
                <th style="min-width:180px">Danh mục</th>
                <th style="min-width:80px">Type</th>
                <th style="min-width:100px">Giá tham khảo</th>
                <th style="min-width:100px">Giá nhập</th>
                <th style="min-width:70px">VAT%</th>
                <th style="min-width:70px">Tiền tệ</th>
                <th style="min-width:80px">Tỉ giá</th>
                <th style="min-width:80px">ĐVT</th>
                <th style="min-width:90px">License</th>
                <th style="min-width:110px">Bảo hành</th>
                <th style="min-width:90px">Volume</th>
                <th style="min-width:110px">NCC</th>
                <th style="min-width:110px">Mã NCC</th>
                <!-- <th style="min-width:130px">Mô tả chung</th> -->
                <!-- <th style="min-width:130px">Mô tả chi tiết</th> -->
                <!-- <th style="min-width:100px">Giá HW</th> -->
                <th style="min-width:80px">% Off</th>
                <!-- <th style="min-width:90px">Trạng thái</th> -->
                <th style="min-width:140px">Mã hàng LK</th>
                <th style="min-width:140px">Tên hàng LK</th>
                <!-- <th style="min-width:100px">Ảnh</th> -->
                <th style="min-width:120px">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in filteredImportData" :key="row.Ma_hang + '_' + idx" class="import-row">
                <td class="import-th--sticky-left import-th--idx import-row__idx">{{ idx + 1 }}</td>
                <td><input type="text" v-model="row.Ma_hang" class="imp-input imp-input--code" /></td>
                <td><textarea v-model="row.Ten_hang" class="imp-input imp-input--textarea imp-input--autofit" rows="1"></textarea></td>
                <td>
                  <div class="imp-features-cell">
                    <div
                      class="imp-input imp-input--rich"
                      contenteditable="true"
                      v-html="formatFeaturesHtml(row.Features)"
                      @blur="row.Features = $event.currentTarget.innerHTML"
                    ></div>
                    <button
                      type="button"
                      class="imp-features-edit-btn"
                      title="Mở công cụ chỉnh sửa format Features"
                      @click="openImportFeaturesEditor(row)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  </div>
                </td>
                <td><textarea v-model="row.Danh_muc" class="imp-input imp-input--textarea imp-input--autofit" rows="1"></textarea></td>
                <td><input type="text" v-model="row.Type" class="imp-input imp-input--sm" /></td>
                <td><NumberInput v-model="row.Don_gia" class="imp-input imp-input--num imp-input--green" /></td>
                <td><NumberInput v-model="row.gia_nhap" class="imp-input imp-input--num imp-input--green" /></td>
                <td><NumberInput v-model="row.Thue_VAT" class="imp-input imp-input--num imp-input--green" /></td>
                <td><input type="text" v-model="row.Don_vi_tien_te" class="imp-input imp-input--sm" /></td>
                <td><NumberInput v-model="row.Ti_gia" class="imp-input imp-input--num imp-input--green" /></td>
                <td><input type="text" v-model="row.DVT" class="imp-input imp-input--sm" /></td>
                <td><input type="text" v-model="row.License_duration" class="imp-input" /></td>
                <td><input type="text" v-model="row.thoi_han_bao_hanh" class="imp-input" /></td>
                <td><input type="text" v-model="row.volume" class="imp-input" /></td>
                <td><input type="text" v-model="row.Ten_nha_cung_cap" class="imp-input" /></td>
                <td><input type="text" v-model="row.Ma_nha_cung_cap" class="imp-input" /></td>
                <!-- <td><input type="text" v-model="row.Mo_ta_chung" class="imp-input" /></td> -->
                <!-- <td><input type="text" v-model="row.Mo_ta_chi_tiet" class="imp-input" /></td> -->
                <!-- <td><input type="number" v-model="row.gia_hardware" class="imp-input imp-input--num" /></td> -->
                <td><input type="number" v-model="row.muc_phan_tram_off" class="imp-input imp-input--num" /></td>
                <!-- <td><input type="text" v-model="row.Trang_thai" class="imp-input imp-input--sm" /></td> -->
                <td><textarea v-model="row.Ma_hang_lien_ket" class="imp-input imp-input--textarea" rows="1"></textarea></td>
                <td><textarea v-model="row.Ten_hang_lien_ket" class="imp-input imp-input--textarea" rows="1"></textarea></td>
                <!-- <td><input type="text" v-model="row.Main_img" class="imp-input" /></td> -->
                <td><input type="text" v-model="row.Ghi_chu" class="imp-input" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="import-modal__footer">
          <button class="btn btn-secondary" @click="showImportModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Hủy bỏ
          </button>
          <button class="btn import-btn-save" @click="confirmImport" :disabled="importing">
            <span v-if="importing" class="spinner"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {{ importing ? 'Đang lưu...' : `Lưu tất cả ${importData.length} sản phẩm` }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL CHỈNH SỬA FORMAT FEATURES TRONG BẢNG IMPORT PREVIEW -->
    <div v-if="importFeaturesEditRow" class="modal-overlay" @click.self="importFeaturesEditRow = null" style="z-index: 3000;">
      <div class="modal-content" style="max-width: 820px;">
        <div class="modal-header">
          <h2>Chỉnh sửa định dạng Features — {{ importFeaturesEditRow.Ma_hang }}</h2>
          <button class="close-btn" @click="importFeaturesEditRow = null">&times;</button>
        </div>
        <div class="modal-body">
          <ExcelEditor v-model="importFeaturesEditRow.Features" placeholder="Nhập tính năng sản phẩm..." class="features-excel-editor" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="importFeaturesEditRow = null">Xong</button>
        </div>
      </div>
    </div>

    <!-- CONFIRM DELETE MODAL -->
    <div v-if="confirmDeleteModal.show" class="modal-overlay" @click.self="confirmDeleteModal.show = false" style="z-index: 10001;">
      <div class="custom-alert-modal">
        <div class="alert-icon question" style="color: #ef4444; background: rgba(239, 68, 68, 0.1);">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </div>
        <h3 class="alert-title" style="color: #f8fafc; font-size: 18px; margin: 16px 0 8px; font-weight: 700;">Xác nhận Xóa</h3>
        <p class="alert-desc" style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Bạn có chắc muốn xóa hàng hóa <br><span style="color:#ef4444; font-weight: 700;">{{ confirmDeleteModal.item?.Ten_hang }}</span>?</p>
        <div class="alert-actions" style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" @click="confirmDeleteModal.show = false">Hủy</button>
          <button class="btn btn-primary" style="background: #ef4444; border: none; box-shadow: 0 4px 12px rgba(239,68,68,0.3);" @click="executeDelete">Xóa ngay</button>
        </div>
      </div>
    </div>

    <!-- CONFIRM DELETE PRICE LIST MODAL -->
    <div v-if="confirmDeletePriceListModal.show" class="modal-overlay" @click.self="confirmDeletePriceListModal.show = false" style="z-index: 10002;">
      <div class="custom-alert-modal">
        <div class="alert-icon question" style="color: #ef4444; background: rgba(239, 68, 68, 0.1);">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
        </div>
        <h3 class="alert-title" style="color: #f8fafc; font-size: 18px; margin: 16px 0 8px; font-weight: 700;">Xóa Bảng Giá</h3>
        <p class="alert-desc" style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
          Bạn có chắc muốn xóa bảng giá <br>
          <span style="color:#f59e0b; font-weight: 700;">{{ confirmDeletePriceListModal.priceList?.ten_bang_gia }}</span>?
        </p>
        <div class="alert-actions" style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" @click="confirmDeletePriceListModal.show = false">Hủy</button>
          <button class="btn btn-primary" style="background: #ef4444; border: none; box-shadow: 0 4px 12px rgba(239,68,68,0.3);" @click="executeDeletePriceList">Xóa bảng giá</button>
        </div>
      </div>
    </div>

    <!-- MODAL TẠO / CẬP NHẬT BẢNG GIÁ -->
    <div v-if="showPriceListModal" class="import-overlay" @click.self="showPriceListModal = false" style="z-index: 2600;">
      <div class="import-modal pricelist-modal">
        <!-- Header -->
        <div class="import-modal__header">
          <div class="import-modal__title-group">
            <div class="import-modal__icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border-color: rgba(245, 158, 11, 0.3);">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            </div>
            <div>
              <h2 class="import-modal__title">
                {{ isEditingPriceList ? 'Cập nhật Bảng Giá' : 'Tạo Bảng Giá Mới' }}
              </h2>
              <p class="import-modal__subtitle">
                Đã chọn <strong style="color: #34d399;">{{ selectedPriceListCount }}</strong> / {{ priceListRows.length }} sản phẩm trong kho
              </p>
            </div>
          </div>
          <button class="import-modal__close" @click="showPriceListModal = false" title="Đóng">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Khung Cấu hình Tên Bảng Giá & Khung Tăng/Giảm Giá Bán Hàng Loạt -->
        <div class="pl-config-section">
          <!-- Khung 1: Tên bảng giá, Thời gian áp dụng & Ghi chú -->
          <div class="pl-config-card">
            <div class="pl-config-card__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              1. Thông tin & Thời hạn Bảng Giá
            </div>
            <div class="pl-config-grid pl-config-grid--4">
              <div class="pl-field">
                <label>Tên bảng giá <span class="required">*</span></label>
                <input type="text" v-model="priceListForm.ten_bang_gia" placeholder="VD: Bảng giá Đại lý cấp 1..." class="pl-input" />
              </div>
              <div class="pl-field">
                <label>Thời gian bắt đầu áp dụng</label>
                <input type="date" v-model="priceListForm.ngay_bat_dau" class="pl-input" />
              </div>
              <div class="pl-field">
                <label>Thời gian kết thúc</label>
                <input type="date" v-model="priceListForm.ngay_ket_thuc" class="pl-input" />
              </div>
              <div class="pl-field">
                <label>Ghi chú / Mô tả</label>
                <input type="text" v-model="priceListForm.ghi_chu" placeholder="Ghi chú đối tượng áp dụng..." class="pl-input" />
              </div>
            </div>
            <div class="pl-autosync-box" :class="{ active: priceListForm.auto_sync_base_price }">
              <label class="pl-autosync-label">
                <input
                  type="checkbox"
                  v-model="priceListForm.auto_sync_base_price"
                  @change="onModalAutoSyncChange"
                  class="pl-autosync-checkbox"
                />
                <span class="pl-autosync-title">
                  {{ priceListForm.auto_sync_base_price ? '🔄 Tự động cập nhật khi bảng giá gốc thay đổi (Đang BẬT)' : '🔒 Giữ giá cố định — Không tự động đổi theo giá gốc (Đang TẮT)' }}
                </span>
              </label>
              <span class="pl-autosync-hint">
                {{ priceListForm.auto_sync_base_price
                  ? 'Khi giá gốc sản phẩm thay đổi (do Import Excel hoặc sửa giá gốc), bảng giá này sẽ tự động cập nhật giá bán mới theo % / số tiền đã cài đặt.'
                  : 'Bảng giá sẽ giữ cố định mức giá bán đã lưu, không bị thay đổi khi bảng giá gốc biến động.' }}
              </span>
            </div>
          </div>

          <!-- Khung 2: Khung điều chỉnh giá bán tăng / giảm theo % hoặc Số tiền -->
          <div class="pl-config-card pl-config-card--highlight">
            <div class="pl-config-card__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              2. Khung Điều Chỉnh Giá Bán (Tăng / Giảm theo % hoặc Số tiền)
            </div>
            <div class="pl-bulk-controls">
              <div class="pl-field" style="min-width: 135px;">
                <label>Chiều điều chỉnh</label>
                <select v-model="priceListForm.bulkDirection" @change="onBulkRuleAutoApply" class="pl-select" :class="priceListForm.bulkDirection === 'decrease' ? 'pl-select--down' : 'pl-select--up'">
                  <option value="increase">📈 Tăng giá (+)</option>
                  <option value="decrease">📉 Giảm giá (-)</option>
                </select>
              </div>
              <div class="pl-field" style="min-width: 150px;">
                <label>Đơn vị tính</label>
                <select v-model="priceListForm.bulkType" @change="onBulkRuleAutoApply" class="pl-select">
                  <option value="percent">Theo Phần trăm (%)</option>
                  <option value="amount">Theo Số tiền cố định</option>
                </select>
              </div>
              <div class="pl-field" style="flex: 1; min-width: 150px;">
                <label>
                  {{ priceListForm.bulkType === 'percent' ? 'Mức % tăng/giảm' : 'Số tiền tăng/giảm' }}
                </label>
                <div style="position: relative; display: flex; align-items: center;">
                  <input
                    v-if="priceListForm.bulkType === 'percent'"
                    type="number"
                    step="0.1"
                    min="0"
                    v-model.number="priceListForm.bulkValue"
                    @input="onBulkRuleAutoApply"
                    placeholder="VD: 10"
                    class="pl-input"
                    style="padding-right: 32px; font-weight: 700; color: #fbbf24;"
                  />
                  <NumberInput
                    v-else
                    v-model="priceListForm.bulkValue"
                    @update:modelValue="onBulkRuleAutoApply"
                    placeholder="VD: 500.000"
                    class="pl-input"
                    style="padding-right: 45px; font-weight: 700; color: #fbbf24;"
                  />
                  <span style="position: absolute; right: 10px; font-size: 12px; font-weight: 700; color: #94a3b8; pointer-events: none;">
                    {{ priceListForm.bulkType === 'percent' ? '%' : 'Tiền' }}
                  </span>
                </div>
              </div>
              <div class="pl-bulk-actions">
                <button type="button" class="pl-apply-btn pl-apply-btn--selected" @click="applyBulkRuleToSelected" title="Áp dụng mức tăng/giảm này cho tất cả sản phẩm đã tích chọn">
                  ⚡ Áp dụng cho SP đã chọn ({{ selectedPriceListCount }})
                </button>
                <button type="button" class="pl-apply-btn pl-apply-btn--filtered" @click="applyBulkRuleToFiltered" title="Tích chọn và áp dụng mức tăng/giảm này cho danh sách đang lọc bên dưới">
                  🎯 Chọn & Áp dụng SP đang lọc ({{ filteredModalProducts.length }})
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Thanh Lọc & Chọn Sản Phẩm -->
        <div class="pl-filter-bar">
          <div class="pl-filter-group">
            <select v-model="modalBrandFilter" class="pl-filter-select">
              <option value="ALL">🏢 Tất cả Hãng ({{ priceListBrandOptions.length }})</option>
              <option v-for="b in priceListBrandOptions" :key="b" :value="b">{{ b }}</option>
            </select>

            <select v-model="modalCategoryFilter" class="pl-filter-select" style="max-width: 260px;">
              <option value="ALL">📁 Tất cả Danh mục ({{ priceListCategoryOptions.length }})</option>
              <option v-for="c in priceListCategoryOptions" :key="c" :value="c">{{ c }}</option>
            </select>

            <div style="position: relative; flex: 1; min-width: 200px; max-width: 300px;">
              <input
                type="text"
                v-model="modalSearchQuery"
                placeholder="🔍 Tìm mã hàng, tên sản phẩm..."
                class="pl-filter-input"
              />
              <button
                v-if="modalSearchQuery"
                type="button"
                @click="modalSearchQuery = ''"
                style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 13px;"
              >✕</button>
            </div>

            <div class="pl-view-tabs">
              <button type="button" :class="['pl-view-tab', { active: modalViewMode === 'all' }]" @click="modalViewMode = 'all'">
                Tất cả ({{ priceListRows.length }})
              </button>
              <button type="button" :class="['pl-view-tab', { active: modalViewMode === 'selected' }]" @click="modalViewMode = 'selected'">
                Đã chọn ({{ selectedPriceListCount }})
              </button>
              <button type="button" :class="['pl-view-tab', { active: modalViewMode === 'unselected' }]" @click="modalViewMode = 'unselected'">
                Chưa chọn ({{ priceListRows.length - selectedPriceListCount }})
              </button>
            </div>
          </div>

          <div class="pl-selection-btns">
            <button type="button" class="pl-mini-btn" @click="selectAllFilteredInModal">
              ☑️ Chọn tất cả đang lọc ({{ filteredModalProducts.length }})
            </button>
            <button type="button" class="pl-mini-btn pl-mini-btn--muted" @click="deselectAllFilteredInModal">
              ⬜ Bỏ chọn đang lọc
            </button>
          </div>
        </div>

        <!-- Bảng danh sách sản phẩm trong Bảng Giá -->
        <div class="import-table-wrap" style="flex: 1;">
          <table class="import-table pl-table">
            <thead>
              <tr>
                <th style="width: 42px; text-align: center;">
                  <input
                    type="checkbox"
                    :checked="isAllFilteredSelected"
                    @change="toggleAllFilteredInModal($event.target.checked)"
                    title="Chọn / Bỏ chọn tất cả sản phẩm đang lọc"
                    style="width: 16px; height: 16px; cursor: pointer; accent-color: #10b981;"
                  />
                </th>
                <th style="width: 46px;">#</th>
                <th style="min-width: 150px;">Mã hàng</th>
                <th style="min-width: 260px;">Tên hàng hóa</th>
                <th style="min-width: 110px;">Hãng</th>
                <th style="min-width: 160px;">Danh mục</th>
                <th style="width: 75px; text-align: center;">Tiền tệ</th>
                <th style="min-width: 120px; text-align: right;">Giá nhập</th>
                <th style="min-width: 140px; text-align: right;">Giá bán gốc</th>
                <th style="min-width: 250px;">Tăng / Giảm riêng</th>
                <th style="min-width: 155px; text-align: right;">Giá bán mới (Bảng giá)</th>
                <th style="min-width: 120px; text-align: right;">Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!displayedModalProducts.length">
                <td colspan="12" style="text-align: center; padding: 32px; color: #64748b;">
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
              <tr
                v-for="(row, idx) in displayedModalProducts"
                :key="row.Ma_hang || idx"
                :class="{ 'pl-row-selected': row.selected }"
                @click="row.selected = !row.selected"
                style="cursor: pointer;"
              >
                <td style="text-align: center;" @click.stop>
                  <input
                    type="checkbox"
                    v-model="row.selected"
                    style="width: 16px; height: 16px; cursor: pointer; accent-color: #10b981;"
                  />
                </td>
                <td class="import-row-num">{{ idx + 1 }}</td>
                <td>
                  <span style="font-family: monospace; font-weight: 600; color: #93c5fd; font-size: 12px;">{{ row.Ma_hang }}</span>
                </td>
                <td>
                  <div style="font-weight: 500; color: #f1f5f9; font-size: 12.5px; line-height: 1.35;">{{ row.Ten_hang }}</div>
                </td>
                <td>
                  <span class="brand-badge" style="font-size: 10px; padding: 2px 7px;">{{ row.Ten_nha_cung_cap || '-' }}</span>
                </td>
                <td>
                  <span style="font-size: 11px; color: #94a3b8;">{{ row.Danh_muc || '-' }}</span>
                </td>
                <td style="text-align: center; font-weight: 600; color: #cbd5e1; font-size: 12px;">
                  {{ row.Don_vi_tien_te || 'VND' }}
                </td>
                <td style="text-align: right; color: #fbbf24; font-family: monospace; font-size: 12px;">
                  {{ formatNumberPlain(row.gia_nhap) }}
                </td>
                <td style="text-align: right; color: #cbd5e1; font-weight: 600; font-family: monospace; font-size: 12.5px;">
                  <div>{{ formatNumberPlain(row.gia_goc) }}</div>
                  <div v-if="row.last_updated" style="font-size: 10px; color: #64748b; font-weight: 400; font-family: sans-serif; margin-top: 2px;">
                    CN: {{ formatLastUpdated(row.last_updated) }}
                  </div>
                </td>
                <td @click.stop>
                  <div class="pl-row-adjust">
                    <select v-model="row.direction" @change="recalcRowPrice(row, true)" class="pl-row-select" :class="row.direction === 'decrease' ? 'down' : 'up'">
                      <option value="increase">+ Tăng</option>
                      <option value="decrease">- Giảm</option>
                    </select>
                    <select v-model="row.type" @change="recalcRowPrice(row, true)" class="pl-row-select">
                      <option value="percent">%</option>
                      <option value="amount">Tiền</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>
                    <input
                      v-if="row.type === 'percent'"
                      type="number"
                      step="0.1"
                      min="0"
                      v-model.number="row.value"
                      @input="recalcRowPrice(row, true)"
                      class="imp-input imp-input--num"
                      style="width: 72px; min-width: 72px;"
                      placeholder="0%"
                    />
                    <NumberInput
                      v-else-if="row.type === 'amount'"
                      v-model="row.value"
                      @update:modelValue="recalcRowPrice(row, true)"
                      class="imp-input imp-input--num"
                      style="width: 95px; min-width: 95px;"
                      placeholder="0"
                    />
                    <span v-else style="font-size: 11px; color: #94a3b8; padding: 0 4px;">Nhập trực tiếp</span>
                  </div>
                </td>
                <td @click.stop>
                  <NumberInput
                    v-model="row.gia_ban_moi"
                    @update:modelValue="onCustomRowPriceChange(row)"
                    class="imp-input imp-input--num imp-input--amber"
                    style="font-size: 13px; color: #34d399 !important; border-color: rgba(16, 185, 129, 0.35);"
                  />
                </td>
                <td style="text-align: right; font-family: monospace; font-size: 12px;">
                  <span :class="getRowDiffClass(row)">
                    {{ formatRowDiffText(row) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredModalProducts.length > modalDisplayLimit" style="padding: 12px; text-align: center; background: #0f172a;">
            <button
              type="button"
              class="btn btn-outline"
              @click="modalDisplayLimit += 100"
              style="font-size: 12.5px; padding: 6px 18px;"
            >
              Hiển thị thêm 100 sản phẩm (còn {{ filteredModalProducts.length - modalDisplayLimit }} SP)
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="import-modal__footer" style="justify-content: space-between;">
          <div style="font-size: 13px; color: #94a3b8;">
            Tổng số SP trong bảng giá: <strong style="color: #34d399; font-size: 15px;">{{ selectedPriceListCount }}</strong> sản phẩm
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button type="button" class="btn btn-secondary" @click="showPriceListModal = false">
              Hủy bỏ
            </button>
            <button type="button" class="btn btn-outline" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" @click="exportDraftPriceListToExcel">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Xuất Excel
            </button>
            <button type="button" class="btn import-btn-save" @click="savePriceList" :disabled="savingPriceList">
              <span v-if="savingPriceList" class="spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {{ savingPriceList ? 'Đang lưu...' : (isEditingPriceList ? `Cập nhật Bảng Giá (${selectedPriceListCount} SP)` : `Lưu Bảng Giá (${selectedPriceListCount} SP)`) }}
            </button>
          </div>
        </div>
      </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx-js-style'
import NumberInput from './NumberInput.vue'
import ExcelEditor from './ExcelEditor.vue'
import Tesseract from 'tesseract.js'
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

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const latestFileGiaOff = ref(null)
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const userVolumeFilter = ref('')
const originalItem = ref(null)
const confirmDeleteModal = ref({ show: false, item: null })
const importFeaturesEditRow = ref(null)

const openImportFeaturesEditor = (row) => {
  if (!row) return
  row.Features = formatFeaturesHtml(row.Features)
  importFeaturesEditRow.value = row
}

const decodeXmlEntities = (str) => {
  return String(str || '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

const escapeHtmlWithBr = (str) => {
  return String(str || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

const formatFeaturesHtml = (val) => {
  const s = String(val ?? '').trim()
  if (!s) return ''
  if (/<(br|span|b|strong|i|em|u|s|strike|div|p|font|ul|ol|li)\b/i.test(s)) {
    return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '<br>')
  }
  return escapeHtmlWithBr(s)
}

const extractExcelCellRichHtml = (ws, r, c) => {
  if (!ws || r < 0 || c < 0) return ''
  const addr = XLSX.utils.encode_cell({ r, c })
  const cell = ws[addr]
  if (!cell) return ''

  const cellFont = cell.s && cell.s.font ? cell.s.font : {}
  const xml = String(cell.r || '')

  if (xml && /<r[\s>]/i.test(xml)) {
    const defaultSzMatch = xml.match(/<sz\s+val="([\d.]+)"\s*\/>/i)
    const defaultFontMatch = xml.match(/<(?:rFont|font)\s+val="([^"]+)"\s*\/>/i)
    const fallbackSz = cellFont.sz || (defaultSzMatch ? defaultSzMatch[1] : '')
    const fallbackFont = cellFont.name || (defaultFontMatch ? defaultFontMatch[1] : '')

    const runRegex = /<r(?:\s[^>]*)?>([\s\S]*?)<\/r>/gi
    let match
    let html = ''

    while ((match = runRegex.exec(xml)) !== null) {
      const runContent = match[1]
      const rPrMatch = runContent.match(/<rPr>([\s\S]*?)<\/rPr>/i)
      const tMatch = runContent.match(/<t[^>]*>([\s\S]*?)<\/t>/i)
      if (!tMatch) continue

      const rawText = decodeXmlEntities(tMatch[1])
      let text = escapeHtmlWithBr(rawText)
      if (!text) continue

      const styles = []
      let isBold = false
      let isItalic = false
      let isUnderline = false
      let isStrike = false

      if (rPrMatch) {
        const rPr = rPrMatch[1]
        isBold = /<b(?:\s+val="(?:1|true)")?\s*\/>/i.test(rPr)
        isItalic = /<i(?:\s+val="(?:1|true)")?\s*\/>/i.test(rPr)
        isUnderline = /<u(?:\s+val="[^"]*?")?\s*\/>/i.test(rPr) && !/<u\s+val="none"\s*\/>/i.test(rPr)
        isStrike = /<strike(?:\s+val="(?:1|true)")?\s*\/>/i.test(rPr)

        const szMatch = rPr.match(/<sz\s+val="([\d.]+)"\s*\/>/i)
        const fontMatch = rPr.match(/<(?:rFont|font)\s+val="([^"]+)"\s*\/>/i)
        const colorMatch = rPr.match(/<color\s+rgb="([0-9A-Fa-f]{6,8})"\s*\/>/i)

        const szVal = szMatch ? szMatch[1] : fallbackSz
        const fontVal = fontMatch ? fontMatch[1] : fallbackFont

        if (fontVal) styles.push(`font-family:${fontVal}`)
        if (szVal) styles.push(`font-size:${szVal}pt`)
        if (colorMatch) {
          const hex = colorMatch[1].length === 8 ? colorMatch[1].slice(2) : colorMatch[1]
          if (hex.toUpperCase() !== '000000') {
            styles.push(`color:#${hex}`)
          }
        }
      } else {
        isBold = Boolean(cellFont.bold)
        isItalic = Boolean(cellFont.italic)
        isUnderline = Boolean(cellFont.underline)
        isStrike = Boolean(cellFont.strike)
        if (fallbackFont) styles.push(`font-family:${fallbackFont}`)
        if (fallbackSz) styles.push(`font-size:${fallbackSz}pt`)
        if (cellFont.color && cellFont.color.rgb) {
          const rgb = String(cellFont.color.rgb)
          const hex = rgb.length === 8 ? rgb.slice(2) : rgb
          if (hex.toUpperCase() !== '000000') {
            styles.push(`color:#${hex}`)
          }
        }
      }

      if (isStrike) styles.push('text-decoration:line-through')
      if (isUnderline) text = `<u>${text}</u>`
      if (isItalic) text = `<i>${text}</i>`
      if (isBold) text = `<b>${text}</b>`
      if (styles.length > 0) {
        text = `<span style="${styles.join(';')}">${text}</span>`
      }
      html += text
    }

    if (html) return html.trim()
  }

  const plain = String(cell.v ?? '').trim()
  if (!plain) return ''
  let text = escapeHtmlWithBr(plain)
  const styles = []
  if (cellFont.name) styles.push(`font-family:${cellFont.name}`)
  if (cellFont.sz) styles.push(`font-size:${cellFont.sz}pt`)
  if (cellFont.color && cellFont.color.rgb) {
    const rgb = String(cellFont.color.rgb)
    const hex = rgb.length === 8 ? rgb.slice(2) : rgb
    if (hex.toUpperCase() !== '000000') {
      styles.push(`color:#${hex}`)
    }
  }
  if (cellFont.strike) styles.push('text-decoration:line-through')
  if (cellFont.underline) text = `<u>${text}</u>`
  if (cellFont.italic) text = `<i>${text}</i>`
  if (cellFont.bold) text = `<b>${text}</b>`
  if (styles.length > 0) {
    text = `<span style="${styles.join(';')}">${text}</span>`
  }
  return text
}

const isDirty = computed(() => {
  if (!isEditing.value) return true
  return JSON.stringify(formData.value) !== JSON.stringify(originalItem.value)
})

const asyncResultModal = ref({ show: false, type: 'loading', title: '', msg: '' })
let asyncResultTimeout = null

const showAsyncLoading = (title, msg = '') => {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'loading', title, msg }
}

const showAsyncSuccess = (title, msg = '') => {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'success', title, msg }
  asyncResultTimeout = setTimeout(() => { asyncResultModal.value.show = false }, 3000)
}

const showAsyncError = (title, msg = '') => {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'error', title, msg }
}

const showImportModal = ref(false)
const importData = ref([])
const importing = ref(false)
const activeImportSheet = ref('')
const importSheetNames = computed(() => {
  return [...new Set(importData.value.map(p => p.Sheet_name).filter(Boolean))]
})
const filteredImportData = computed(() => {
  if (!activeImportSheet.value) return importData.value
  return importData.value.filter(p => p.Sheet_name === activeImportSheet.value)
})

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const data = evt.target.result
      const workbook = XLSX.read(data, { type: 'array', cellStyles: true, cellHTML: true })
      const products = []

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) continue
        
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        let headerRowIndex = -1
        
        let sttIdx = -1, maSpIdx = -1, moTaIdx = -1, giaIdx = -1, typeIdx = -1, vatIdx = -1, giaNhapIdx = -1, dvtIdx = -1
        let currentStt = ''
        let currentMaSp = ''
        let currentCategory = ''
        let currentVat = 0
      
      // Get Ti_Gia from A2 (index 1, 0)
      let globalTiGia = 1
      if (json.length > 1 && json[1] && json[1][0]) {
        const a2Text = String(json[1][0])
        const match = a2Text.match(/[\d,.]+/g)
        if (match) {
           const parsed = Number(match[match.length - 1].replace(/,/g, ''))
           if (!isNaN(parsed) && parsed > 0) globalTiGia = parsed
        }
      }

      // Get Nha_cung_cap from C2 (index 1, 2)
      let globalNhaCungCap = ''
      if (json.length > 1 && json[1] && json[1][2]) {
        globalNhaCungCap = String(json[1][2]).trim()
      }
      
      for (let i = 0; i < json.length; i++) {
        const row = json[i]
        if (!row || !row.length) continue

        if (headerRowIndex === -1) {
          if (row.some(c => String(c || '').toUpperCase().includes('MÔ TẢ SẢN PHẨM'))) {
            headerRowIndex = i
            // Quét các dòng tiêu đề (từ dòng trên nó 2 dòng cho đến dòng hiện tại) để xử lý ô gộp (merged cells)
            for (let r = Math.max(0, i - 2); r <= i; r++) {
               const hr = json[r]
               if (!hr) continue
               hr.forEach((c, idx) => {
                  const text = String(c || '').toUpperCase().replace(/\s/g, '')
                  if (text.includes('STT')) sttIdx = idx
                  if (text.includes('MÃSP')) maSpIdx = idx
                  if (text.includes('MÔTẢSẢNPHẨM')) moTaIdx = idx
                  if (text.includes('GIÁTHAMKHẢO')) giaIdx = idx
                  if (text.includes('TYPE')) typeIdx = idx
                  if (text.includes('VAT')) vatIdx = idx
                  if (text.includes('GIÁNHẬP')) giaNhapIdx = idx
                  if (text === 'ĐVT' || text === 'DVT') dvtIdx = idx
               })
            }
          }
          continue
        }
        
        if (i > headerRowIndex) {
          const stt = sttIdx >= 0 ? row[sttIdx] : ''
          const maSp = maSpIdx >= 0 ? row[maSpIdx] : ''
          const moTa = moTaIdx >= 0 ? row[moTaIdx] : ''
          const giaThamKhao = giaIdx >= 0 ? row[giaIdx] : ''
          const typeVal = typeIdx >= 0 ? row[typeIdx] : ''
          const giaNhap = giaNhapIdx >= 0 ? row[giaNhapIdx] : ''
          const dvtVal = dvtIdx >= 0 ? row[dvtIdx] : ''
          
          if (vatIdx >= 0 && row[vatIdx] !== undefined && row[vatIdx] !== null && String(row[vatIdx]).trim() !== '') {
            const rawVat = String(row[vatIdx])
            const v = rawVat.replace('%', '').trim()
            let vatVal = toNum(v, 0)
            if (rawVat.includes('%') && vatVal < 1 && vatVal > 0) {
               vatVal = vatVal * 100
            } else if (!rawVat.includes('%') && vatVal < 1 && vatVal > 0) {
               vatVal = vatVal * 100
            }
            currentVat = vatVal
          }
          
          if (stt !== undefined && stt !== null && stt !== '') currentStt = String(stt).trim()
          if (maSp !== undefined && maSp !== null && maSp !== '') currentMaSp = String(maSp).trim()
          
          if (moTa !== undefined && moTa !== null && String(moTa).trim() !== '') {
            const moTaStr = String(moTa).trim()
            let tenHang = moTaStr
            const firstNewline = moTaStr.indexOf('\n')
            
            if (firstNewline !== -1) {
              tenHang = moTaStr.substring(0, firstNewline).trim()
              if (tenHang.endsWith(':')) tenHang = tenHang.slice(0, -1)
            }
            const richFeatures = moTaIdx >= 0 ? extractExcelCellRichHtml(worksheet, i, moTaIdx) : ''
            const features = richFeatures || formatFeaturesHtml(moTaStr)
            
            let licenseDuration = ''
            const durationMatch = tenHang.match(/(\d+)[-\s]?(year|month)s?/i)
            if (durationMatch) {
              licenseDuration = durationMatch[1] + ' ' + durationMatch[2].toLowerCase()
            }
            
            const rawCategory = currentCategory || String(currentMaSp)
            const typeStr = String(typeVal || '').trim()
            // Sinh mã hàng bằng cách ghép Danh mục, Tên hàng và Type, thay khoảng trắng bằng gạch ngang và bỏ ký tự đặc biệt
            let id = `${rawCategory}-${tenHang}`
            if (currentMaSp && rawCategory && !rawCategory.toUpperCase().includes(currentMaSp.toUpperCase())) {
              id = `${currentMaSp}-${id}`
            }
            if (typeStr) id += `-${typeStr}`
            
            id = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
            id = id.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9\-]/g, '')
            // Xóa các dấu gạch ngang liên tiếp nếu có
            id = id.replace(/-+/g, '-')
            id = id.replace(/-+$/, '') // Xóa gạch ngang ở cuối nếu có

            
            products.push({
              Sheet_name: sheetName,
              Ma_hang: id,
              Ten_hang: tenHang,
              Main_img: '',
              Ma_nha_cung_cap: globalNhaCungCap,
              Ten_nha_cung_cap: globalNhaCungCap,
              Mo_ta_chung: '',
              Mo_ta_chi_tiet: '',
              Features: features,
              Danh_muc: String(currentCategory || currentMaSp).toUpperCase(),
              License_duration: licenseDuration,
              DVT: dvtVal !== undefined && dvtVal !== null && String(dvtVal).trim() !== '' ? String(dvtVal).trim() : '',
              Gia_tieu_chuan: toNum(giaThamKhao, 0),
              Don_gia: toNum(giaThamKhao, 0),
              Trang_thai: 'Còn hàng',
              Don_vi_tien_te: 'USD',
              Ti_gia: globalTiGia,
              Thue_VAT: currentVat ? currentVat : '',
              Ma_hang_lien_ket: '',
              Ten_hang_lien_ket: '',
              Ghi_chu: '',
              gia_hardware: 0,
              gia_nhap: toNum(giaNhap, 0),
              muc_phan_tram_off: 0,
              Type: String(typeVal || '').trim(),
              thoi_han_bao_hanh: '',
              volume: ''
            })
          } else {
            // Nếu dòng không có mô tả sản phẩm (moTa trống), thì có thể đây là dòng danh mục (hàng màu hồng/xanh)
            const firstCell = row.find(c => c !== undefined && c !== null && String(c).trim() !== '')
            if (firstCell) {
              currentCategory = String(firstCell).trim()
            }
          }
        }
      }
      }
      
      // Liên kết các mặt hàng cùng mục (cùng Danh_muc)
      products.forEach(p => {
         if (p.Danh_muc) {
            const related = products.filter(r => r.Danh_muc === p.Danh_muc && r.Ma_hang !== p.Ma_hang)
            if (related.length > 0) {
               p.Ma_hang_lien_ket = related.map(r => r.Ma_hang).join('\n')
               p.Ten_hang_lien_ket = related.map(r => r.Ten_hang).join('\n')
            }
         }
      })
      
      if (products.length > 0) {
        importData.value = products
        activeImportSheet.value = [...new Set(products.map(p => p.Sheet_name).filter(Boolean))][0] || ''
        showImportModal.value = true
      } else {
        alert('Không tìm thấy dữ liệu hợp lệ trong sheet.')
      }
    } catch (err) {
      console.error(err)
      alert('Lỗi khi đọc file Excel: ' + err.message)
    }
  }
  reader.readAsArrayBuffer(file)
  e.target.value = '' // reset
}

const handleKasperskyUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  showAsyncLoading('Đang xử lý file Kaspersky...', 'Vui lòng chờ giây lát...')
  
  const reader = new FileReader()
  reader.onload = (evt) => {
    setTimeout(() => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array', cellStyles: true, cellHTML: true })
        let targetSheetName = wb.SheetNames.find(name => name.trim() === 'SMB+Enterprise (License)')
        if (!targetSheetName) {
          showAsyncError('Import thất bại', 'Không tìm thấy sheet "SMB+Enterprise (License)".')
          return
        }
        const ws = wb.Sheets[targetSheetName]
        const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      
      let products = []
      
      // Lấy danh sách các cột Band từ dòng 10 (index 9)
      const headerRow = json[9] || []
      const bands = []
      let featuresIdx = -1
      for (let j = 0; j < headerRow.length; j++) {
        const colName = String(headerRow[j] || '').trim().toUpperCase().replace(/\s+/g, '')
        if (colName.includes('FEATURES') || colName.includes('MÔTẢSẢNPHẨM') || colName === 'MÔTẢ') {
          featuresIdx = j
        }
      }
      for (let j = 9; j < headerRow.length; j++) {
        const b = String(headerRow[j] || '').trim()
        if (b && b !== 'Grand Total') {
          bands.push({ index: j, name: b })
        }
      }
      
      if (bands.length === 0) {
        alert('Không tìm thấy cột Band nào trong sheet.')
        return
      }
      
      let lastProduct = ''
      let lastPkg = ''
      let lastType = ''
      let lastFeatures = ''
      
      for (let i = 10; i < json.length; i++) {
        const row = json[i]
        if (!row || !row.length) continue
        
        const rawProduct = String(row[2] || '').trim()
        const rawPkg = String(row[4] || '').trim()
        const rawType = String(row[6] || '').trim()
        const rawFeaturesText = featuresIdx >= 0 ? String(row[featuresIdx] || '').trim() : ''
        
        // Kế thừa giá trị từ dòng trên nếu dòng hiện tại bị trống (do tính chất của Pivot table gộp ô)
        if (rawProduct) {
          lastProduct = rawProduct
          lastFeatures = ''
        }
        if (rawPkg) lastPkg = rawPkg
        if (rawType) lastType = rawType
        if (rawFeaturesText && featuresIdx >= 0) {
          lastFeatures = extractExcelCellRichHtml(ws, i, featuresIdx) || formatFeaturesHtml(rawFeaturesText)
        }
        
        const product = rawProduct || lastProduct
        const pkg = rawPkg || lastPkg
        const type = rawType || lastType
        const rowFeatures = (rawFeaturesText && featuresIdx >= 0)
          ? (extractExcelCellRichHtml(ws, i, featuresIdx) || formatFeaturesHtml(rawFeaturesText))
          : lastFeatures
        
        const term = String(row[7] || '').trim()
        const sku = String(row[8] || '').trim()
        
        if (!product) continue // Skip if no product name
        if (product.toUpperCase().includes('MAX OF PRICE')) continue
        
        for (const band of bands) {
          const priceStr = String(row[band.index] || '').trim()
          const price = toNum(priceStr, 0)
          
          if (!priceStr || price === 0) continue; // Bỏ qua nếu Band này không có giá
          
          let id = ''
          if (sku && sku !== '-') {
             // Vì import full band, phải nối thêm band name vào SKU để tránh trùng lặp đè mất dữ liệu
             id = `${sku} - ${band.name} - ${type} - ${term} - ${pkg}`
          } else {
             id = `${product} - ${type} - ${term} - ${band.name} - ${pkg}`
          }
          id = id.replace(/\s+/g, ' ').trim()
        
          const parts = [type, term, band.name].filter(Boolean).join(' - ')
          let tenHang = product
          if (parts) {
            tenHang += ` (${parts})`
          }
        
          products.push({
          Sheet_name: targetSheetName,
          Ma_hang: id,
          Ten_hang: tenHang,
          Main_img: '',
          Ma_nha_cung_cap: 'KASPERSKY',
          Ten_nha_cung_cap: 'KASPERSKY',
          Mo_ta_chung: '',
          Mo_ta_chi_tiet: '',
          Features: rowFeatures,
          Danh_muc: product.toUpperCase(),
          License_duration: term,
          DVT: pkg,
          Gia_tieu_chuan: 0,
          Don_gia: price,
          Trang_thai: 'Còn hàng',
          Don_vi_tien_te: 'VND',
          Ti_gia: 1,
          Thue_VAT: 0,
          Ma_hang_lien_ket: '',
          Ten_hang_lien_ket: '',
          Ghi_chu: '',
          gia_hardware: 0,
          gia_nhap: 0,
          muc_phan_tram_off: 0,
          Type: type,
          thoi_han_bao_hanh: '',
          volume: band.name
        })
      }
    }
      if (products.length > 0) {
        // Liên kết các sản phẩm có cùng Danh_muc (cùng product gốc)
        products.forEach(p => {
           if (p.Danh_muc) {
              const related = products.filter(r => r.Danh_muc === p.Danh_muc && r.Ma_hang !== p.Ma_hang)
              if (related.length > 0) {
                 p.Ma_hang_lien_ket = related.map(r => r.Ma_hang).join('\n')
                 p.Ten_hang_lien_ket = related.map(r => r.Ten_hang).join('\n')
              }
           }
        })
        
        importData.value = products
        activeImportSheet.value = targetSheetName
        asyncResultModal.value.show = false // Tắt overlay loading
        showImportModal.value = true
      } else {
        showAsyncError('Import thất bại', 'Không tìm thấy dữ liệu hợp lệ trong sheet.')
      }
    } catch (err) {
      console.error(err)
      showAsyncError('Lỗi đọc file', 'Không thể xử lý file Kaspersky: ' + err.message)
    }
    }, 50) // Delay 50ms để browser kịp render loading overlay
  }
  reader.readAsArrayBuffer(file)
  e.target.value = '' // reset
}

const handleAcronisUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  showAsyncLoading('Đang xử lý file Acronis...', 'Vui lòng chờ giây lát...')

  const reader = new FileReader()
  reader.onload = (evt) => {
    setTimeout(() => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array', cellStyles: true, cellHTML: true })
        const products = []

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName]
          if (!ws) continue

          // Giới hạn số cột đọc (tránh trường hợp sheet Personal có !ref kéo dài tới cột XEV gây treo)
          if (ws['!ref']) {
            const range = XLSX.utils.decode_range(ws['!ref'])
            if (range.e.c > 20) {
              range.e.c = 20
              ws['!ref'] = XLSX.utils.encode_range(range)
            }
          }

          const json = XLSX.utils.sheet_to_json(ws, { header: 1 })
          let headerRowIndex = -1
          let skuForIdx = 0
          let skuIdx = 1
          let moTaIdx = 2
          let priceIdx = 3

          for (let i = 0; i < json.length; i++) {
            const row = json[i]
            if (!row || !row.length) continue
            const hasHeader = row.some(c => {
              const t = String(c || '').toUpperCase().replace(/\s+/g, ' ').trim()
              return t.includes('MÔ TẢ SẢN PHẨM') || t === 'SKU FOR'
            })
            if (hasHeader) {
              headerRowIndex = i
              row.forEach((c, idx) => {
                const text = String(c || '').toUpperCase().replace(/\s+/g, '')
                if (text.includes('SKUFOR')) skuForIdx = idx
                else if (text === 'SKU') skuIdx = idx
                else if (text.includes('MÔTẢSẢNPHẨM')) moTaIdx = idx
                else if (text.includes('UNITPRICE') || text.includes('GIÁ')) priceIdx = idx
              })
              break
            }
          }

          if (headerRowIndex === -1) continue

          let currentCategory = ''
          let currentFeatures = ''
          let currentSubType = ''

          for (let i = headerRowIndex + 1; i < json.length; i++) {
            const row = json[i]
            if (!row || !row.length) continue

            const skuFor = String(row[skuForIdx] ?? '').trim()
            const sku = String(row[skuIdx] ?? '').trim()
            const moTa = String(row[moTaIdx] ?? '').trim()
            const rawPrice = row[priceIdx]
            const priceStr = String(rawPrice ?? '').trim()
            const price = toNum(rawPrice, 0)
            const hasPrice = priceStr !== '' && price > 0

            // 1. Dòng sản phẩm: có SKU (hoặc SKU For), có Mô tả sản phẩm và có Unit Price
            if ((sku || skuFor) && moTa && hasPrice) {
              const tenHang = moTa.replace(/\u00a0/g, ' ').trim()
              const maHang = [skuFor, sku].filter(Boolean).join(' - ')

              let licenseDuration = ''
              const durMatch = tenHang.match(/(\d+)\s*(year|month)s?/i)
              if (durMatch) {
                licenseDuration = `${durMatch[1]} ${durMatch[2].toLowerCase()}`
              }

              let volume = ''
              const volMatch = tenHang.match(/(?:^|[\s(])(\d+(?:\/\d+)?\s*(?:VMs?(?:\s*pack)?|Seats?|Computers?|GB|TB))\b/i)
              if (volMatch) {
                volume = volMatch[1].trim()
              }

              let typeVal = ''
              if (/reinstated\s+renewal/i.test(tenHang)) typeVal = 'Reinstated Renewal'
              else if (/renewal/i.test(tenHang)) typeVal = 'Renewal'
              else if (/upgrade/i.test(tenHang)) typeVal = 'Upgrade'
              else if (/subscription/i.test(tenHang) || /subscription/i.test(currentSubType)) typeVal = 'Subscription'
              else if (/perpeptual|perpetual/i.test(tenHang) || /perpeptual|perpetual/i.test(currentSubType)) typeVal = 'Perpetual'

              const rawCat = (currentCategory || sheetName).replace(/^\d+(\.\d+)?\.?\s*/, '').trim().toUpperCase()

              products.push({
                Sheet_name: sheetName,
                Ma_hang: maHang,
                Ten_hang: tenHang,
                Main_img: '',
                Ma_nha_cung_cap: 'ACRONIS',
                Ten_nha_cung_cap: 'ACRONIS',
                Mo_ta_chung: '',
                Mo_ta_chi_tiet: '',
                Features: currentFeatures,
                Danh_muc: rawCat,
                License_duration: licenseDuration,
                DVT: 'License',
                Gia_tieu_chuan: price,
                Don_gia: price,
                Trang_thai: 'Còn hàng',
                Don_vi_tien_te: 'VND',
                Ti_gia: 1,
                Thue_VAT: 0,
                Ma_hang_lien_ket: '',
                Ten_hang_lien_ket: '',
                Ghi_chu: '',
                gia_hardware: 0,
                gia_nhap: 0,
                muc_phan_tram_off: 0,
                Type: typeVal,
                thoi_han_bao_hanh: '',
                volume: volume
              })
            }
            // 2. Dòng Features: có Mô tả sản phẩm nhưng KHÔNG có SKU và KHÔNG có Unit Price -> giữ nguyên format Excel
            else if (!sku && !skuFor && moTa && !hasPrice) {
              currentFeatures = extractExcelCellRichHtml(ws, i, moTaIdx) || formatFeaturesHtml(moTa)
            }
            // 3. Dòng tiêu đề mục (Category) hoặc tiêu đề phụ (Sub-header): không có Mô tả sản phẩm & không có Unit Price
            else if (!moTa && !hasPrice && (sku || skuFor)) {
              const headerText = sku || skuFor
              const isSubHeader = (sku && skuFor && sku === skuFor) || /perpeptual|perpetual|^\d+\.\d+\s/i.test(headerText)
              if (isSubHeader) {
                currentSubType = headerText
              } else {
                currentCategory = headerText
                currentFeatures = '' // Reset features cho mục mới; nếu mục không có dòng mô tả thì để trống
                currentSubType = ''
              }
            }
          }
        }

        if (products.length > 0) {
          // Liên kết các sản phẩm có cùng Danh_muc
          products.forEach(p => {
            if (p.Danh_muc) {
              const related = products.filter(r => r.Danh_muc === p.Danh_muc && r.Ma_hang !== p.Ma_hang)
              if (related.length > 0) {
                p.Ma_hang_lien_ket = related.map(r => r.Ma_hang).join('\n')
                p.Ten_hang_lien_ket = related.map(r => r.Ten_hang).join('\n')
              }
            }
          })

          importData.value = products
          activeImportSheet.value = [...new Set(products.map(p => p.Sheet_name).filter(Boolean))][0] || ''
          asyncResultModal.value.show = false
          showImportModal.value = true
        } else {
          showAsyncError('Import thất bại', 'Không tìm thấy dữ liệu hợp lệ trong file Acronis.')
        }
      } catch (err) {
        console.error(err)
        showAsyncError('Lỗi đọc file', 'Không thể xử lý file Acronis: ' + err.message)
      }
    }, 50)
  }
  reader.readAsArrayBuffer(file)
  e.target.value = '' // reset
}

const handleGiaOffUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  showAsyncLoading('Đang đọc nội dung ảnh...', 'AI đang quét dữ liệu, vui lòng đợi...')
  try {
    let extractedName = file.name
    let extractedDate = ''
    
    // 1. OCR để lấy Tên và Tháng/Năm
    if (file.type.startsWith('image/')) {
      const worker = await Tesseract.createWorker('vie', 1)
      const result = await worker.recognize(file)
      await worker.terminate()
      
      const lines = result.data.text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        extractedName = lines[0]
      }
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i]
        // Tìm định dạng MM/YYYY (có thể có khoảng trắng)
        const match = line.match(/(\d{1,2})\s*[\/\-]\s*(\d{4})/)
        if (match) {
          extractedDate = `${match[1]}/${match[2]}`
          break
        }
      }
      
      // Fallback nếu OCR đọc quá mờ không ra được số
      if (!extractedDate) {
        extractedDate = '4/2026'
      }
    }

    // 2. Upload lên Cloudinary
    showAsyncLoading('Đang tải ảnh lên Cloudinary...', 'Sắp xong rồi...')
    const formData = new FormData()
    formData.append('upload_preset', 'upload_file')
    formData.append('file', file)
    
    const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
      method: 'POST',
      body: formData
    }).then(r => r.json())
    
    if (!uploadRes.secure_url) {
      throw new Error('Không lấy được link từ Cloudinary')
    }
    const secureUrl = uploadRes.secure_url

    showAsyncLoading('Đang lưu vào Firebase file_gia_off...', 'Sắp xong rồi...')
    
    // 3. Lưu thông tin file vào node file_gia_off trên Firebase (tương đương uploadFileGiaOff_ trong backendOfficial)
    const fileId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'giaoff_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
    const timestamp = extractedDate ? extractedDate : new Date().toISOString()

    await set(dbRef(database, `file_gia_off/${fileId}`), {
      id: fileId,
      thoi_gian: timestamp,
      ten_file: extractedName,
      link_file: secureUrl,
      created_at: Date.now()
    })
    
    showAsyncSuccess('Thành công', 'Đã lưu file giá off lên Firebase')
    await fetchLatestGiaOff()
  } catch (err) {
    console.error(err)
    showAsyncError('Lỗi tải file', err.message)
  } finally {
    e.target.value = ''
  }
}

const toNum = (val, def = 0) => {
  if (val === undefined || val === null || val === '') return def
  const n = Number(String(val).replace(/,/g, ''))
  return isNaN(n) ? def : n
}

const buildFirebaseHangHoaPayload = (p) => {
  const typeVal = String(p.Type ?? p.TYPE ?? '').trim()
  const offVal = toNum(p.muc_phan_tram_off !== undefined && p.muc_phan_tram_off !== '' ? p.muc_phan_tram_off : p['muc_%_off'], 0)
  return {
    Ma_hang: String(p.Ma_hang || '').trim(),
    Ten_hang: String(p.Ten_hang || '').trim(),
    Main_img: String(p.Main_img || ''),
    Ma_nha_cung_cap: String(p.Ma_nha_cung_cap || ''),
    Ten_nha_cung_cap: String(p.Ten_nha_cung_cap || ''),
    Mo_ta_chung: String(p.Mo_ta_chung || ''),
    Mo_ta_chi_tiet: String(p.Mo_ta_chi_tiet || ''),
    Features: String(p.Features || ''),
    Danh_muc: String(p.Danh_muc || '').trim().toUpperCase(),
    License_duration: String(p.License_duration || ''),
    DVT: String(p.DVT || ''),
    Gia_tieu_chuan: toNum(p.Gia_tieu_chuan, 0),
    Don_gia: toNum(p.Don_gia, 0),
    Trang_thai: String(p.Trang_thai || ''),
    Don_vi_tien_te: String(p.Don_vi_tien_te || 'VND'),
    Ti_gia: toNum(p.Ti_gia, p.Don_vi_tien_te === 'VND' ? 1 : 0),
    Thue_VAT: toNum(p.Thue_VAT, 0),
    Ma_hang_lien_ket: String(p.Ma_hang_lien_ket || ''),
    Ten_hang_lien_ket: String(p.Ten_hang_lien_ket || ''),
    Ghi_chu: String(p.Ghi_chu || ''),
    gia_hardware: toNum(p.gia_hardware, 0),
    gia_nhap: toNum(p.gia_nhap, 0),
    'muc_%_off': offVal,
    muc_phan_tram_off: offVal,
    TYPE: typeVal,
    Type: typeVal,
    thoi_han_bao_hanh: String(p.thoi_han_bao_hanh || ''),
    volume: String(p.volume || ''),
    last_updated: new Date().toISOString()
  }
}

const confirmImport = async () => {
  if (!confirm(`Bạn chắc chắn muốn lưu ${importData.value.length} sản phẩm này vào Firebase (node hang_hoa) chứ?`)) return
  importing.value = true
  showAsyncLoading('Đang lưu dữ liệu lên Firebase...', `Sẽ lưu ${importData.value.length} sản phẩm`)
  try {
    // Đọc danh sách hiện có trên Firebase để map Ma_hang -> firebaseKey (giống createHangHoaBatch_ trong backendOfficial)
    const snap = await get(dbRef(database, 'hang_hoa'))
    const existingData = snap.val() || {}
    const existingMap = {}
    Object.entries(existingData).forEach(([fbKey, row]) => {
      if (row && typeof row === 'object') {
        const ma = String(row.Ma_hang || '').trim()
        if (ma) existingMap[ma] = fbKey
      }
    })

    let addedCount = 0
    let updatedCount = 0
    const allEntries = []

    importData.value.forEach(p => {
      const payloadObj = buildFirebaseHangHoaPayload(p)
      const maHang = payloadObj.Ma_hang
      if (maHang && existingMap[maHang]) {
        const fbKey = existingMap[maHang]
        allEntries.push([fbKey, payloadObj])
        updatedCount++
      } else {
        const newKey = push(dbRef(database, 'hang_hoa')).key
        if (maHang) existingMap[maHang] = newKey
        allEntries.push([newKey, payloadObj])
        addedCount++
      }
    })

    // Ghi theo batch (mỗi batch 400 bản ghi để đảm bảo tốc độ và giới hạn payload của Firebase)
    const CHUNK_SIZE = 400
    for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
      const chunk = allEntries.slice(i, i + CHUNK_SIZE)
      const batchUpdates = {}
      chunk.forEach(([key, val]) => {
        batchUpdates[key] = val
      })
      await update(dbRef(database, 'hang_hoa'), batchUpdates)
    }

    showImportModal.value = false
    showAsyncSuccess('Đã lưu thành công!', `Thêm mới: ${addedCount}, Cập nhật: ${updatedCount} sản phẩm.`)
    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
  } catch (err) {
    console.error('Import Firebase error:', err)
    showAsyncError('Lỗi lưu dữ liệu Firebase', err.message)
  } finally {
    importing.value = false
  }
}

const defaultForm = {
  Ma_hang: '',
  Ten_hang: '',
  Main_img: '',
  Ma_nha_cung_cap: '',
  Ten_nha_cung_cap: '',
  Mo_ta_chung: '',
  Mo_ta_chi_tiet: '',
  Features: '',
  Danh_muc: '',
  License_duration: '',
  DVT: '',
  Gia_tieu_chuan: '',
  Don_gia: '',
  Trang_thai: '',
  Don_vi_tien_te: 'VND',
  Ti_gia: '',
  Thue_VAT: '',
  Ma_hang_lien_ket: '',
  Ten_hang_lien_ket: '',
  Ghi_chu: '',
  gia_hardware: '',
  gia_nhap: '',
  muc_phan_tram_off: '',
  Type: '',
  thoi_han_bao_hanh: '',
  volume: '',
  last_updated: ''
}

const formData = ref({ ...defaultForm })

watch([() => formData.value.Danh_muc, () => formData.value.Ten_hang, () => formData.value.Type], ([danhMuc, tenHang, type]) => {
  if (!isEditing.value) {
    if (!tenHang) {
      formData.value.Ma_hang = ''
      return
    }
    const rawCategory = danhMuc || ''
    const typeStr = type || ''
    
    let id = rawCategory ? `${rawCategory}-${tenHang}` : tenHang
    if (typeStr) id += `-${typeStr}`
    
    id = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    id = id.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9\-]/g, '')
    id = id.replace(/-+/g, '-')
    id = id.replace(/-+$/, '')
    
    formData.value.Ma_hang = id
  }
})

watch(() => formData.value.Ten_nha_cung_cap, (newVal) => {
  if (newVal) {
    const upper = newVal.toUpperCase()
    if (formData.value.Ten_nha_cung_cap !== upper) {
      formData.value.Ten_nha_cung_cap = upper
    }
  }
  
  if (!isEditing.value) {
    formData.value.Ma_nha_cung_cap = (formData.value.Ten_nha_cung_cap || '').trim()
  }
})

watch(() => formData.value.Don_vi_tien_te, (newVal) => {
  if (!isEditing.value && newVal === 'VND') {
    formData.value.Ti_gia = 1
  }
})

const normalizeString = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi, '')

function checkVolumeMatch(volumeStr, userCount) {
  if (!volumeStr) return false;
  const str = volumeStr.toLowerCase();
  
  // 1. Range: A-B or A - B
  const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return userCount >= min && userCount <= max;
  }
  
  // 2. Less than: < 50
  const lessMatch = str.match(/<\s*(\d+)/);
  if (lessMatch) {
    const val = parseInt(lessMatch[1], 10);
    return userCount < val;
  }
  
  // 3. Greater than: > 1000 or 1000+
  const greaterMatch1 = str.match(/>\s*(\d+)/);
  if (greaterMatch1) {
    const val = parseInt(greaterMatch1[1], 10);
    return userCount > val;
  }
  const greaterMatch2 = str.match(/(\d+)\s*\+/);
  if (greaterMatch2) {
    const val = parseInt(greaterMatch2[1], 10);
    return userCount >= val;
  }
  
  return false;
}

const filteredItems = computed(() => {
  const uCount = parseInt(userVolumeFilter.value, 10)
  const hasVolumeFilter = userVolumeFilter.value !== '' && !isNaN(uCount)
  const hasPriceListFilter = Boolean(selectedPriceListId.value && activePriceList.value)
  const words = searchQuery.value ? searchQuery.value.toLowerCase().split(/\s+/).filter(Boolean) : []

  if (!words.length && !hasVolumeFilter && !hasPriceListFilter) return items.value
  
  return items.value.filter(item => {
    if (hasPriceListFilter && !getPriceListEntry(item)) {
      return false
    }

    let okKw = true;
    if (words.length > 0) {
      const ma = (item.Ma_hang || '').toLowerCase()
      const ten = (item.Ten_hang || '').toLowerCase()
      const ncc = (item.Ten_nha_cung_cap || '').toLowerCase()
      
      const maN = normalizeString(ma)
      const tenN = normalizeString(ten)
      const nccN = normalizeString(ncc)
      
      okKw = words.every(w => {
        const wN = normalizeString(w)
        return ma.includes(w) || maN.includes(wN) ||
               ten.includes(w) || tenN.includes(wN) ||
               ncc.includes(w) || nccN.includes(wN)
      })
    }

    let okVolume = true;
    if (hasVolumeFilter) {
      okVolume = checkVolumeMatch(item.volume || '', uCount);
    }

    return okKw && okVolume;
  })
})

function highlightText(text, query) {
  if (!query || !text) return text;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return text;
  
  const safeWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${safeWords.join('|')})`, 'gi')
  return text.replace(regex, '<span style="background-color: #eab308; color: #0f172a; font-weight: bold; padding: 0 2px; border-radius: 2px;">$1</span>')
}

const displayLimit = ref(15)

watch(searchQuery, () => {
  displayLimit.value = 15
})

/* ═══════════════════════════════════════════════════════════════════════════
   QUẢN LÝ BẢNG GIÁ (PRICE LIST) — FIREBASE NODE: bang_gia
   ═══════════════════════════════════════════════════════════════════════════ */
const priceLists = ref([])
const selectedPriceListId = ref('')
const showPriceListModal = ref(false)
const isEditingPriceList = ref(false)
const editingPriceListKey = ref('')
const savingPriceList = ref(false)
const confirmDeletePriceListModal = ref({ show: false, priceList: null })

const priceListForm = ref({
  ten_bang_gia: '',
  ghi_chu: '',
  ngay_bat_dau: '',
  ngay_ket_thuc: '',
  auto_sync_base_price: true,
  bulkDirection: 'increase', // 'increase' | 'decrease'
  bulkType: 'percent',       // 'percent' | 'amount'
  bulkValue: 0
})

const formatLastUpdated = (val) => {
  if (!val) return 'Chưa ghi nhận'
  const dt = new Date(val)
  if (isNaN(dt.getTime())) return String(val)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const formatDateVN = (dateStr) => {
  if (!dateStr) return ''
  const parts = String(dateStr).split('T')[0].split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return String(dateStr)
}

const formatPriceListPeriod = (pl) => {
  if (!pl) return ''
  const s = formatDateVN(pl.ngay_bat_dau)
  const e = formatDateVN(pl.ngay_ket_thuc)
  if (s && e) return `${s} → ${e}`
  if (s) return `Từ ${s}`
  if (e) return `Đến ${e}`
  return 'Không giới hạn'
}

const formatPriceListPeriodInline = (pl) => {
  if (!pl || (!pl.ngay_bat_dau && !pl.ngay_ket_thuc)) return ''
  return ` • [${formatPriceListPeriod(pl)}]`
}

const getPriceListStatusInfo = (pl) => {
  if (!pl) return { label: '', cls: '' }
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const start = String(pl.ngay_bat_dau || '').trim()
  const end = String(pl.ngay_ket_thuc || '').trim()

  if (start && todayStr < start) {
    return { label: '⏳ Chưa đến hạn', cls: 'upcoming' }
  }
  if (end && todayStr > end) {
    return { label: '⚠️ Đã hết hạn', cls: 'expired' }
  }
  return { label: '✅ Đang hiệu lực', cls: 'active' }
}

const priceListRows = ref([])
const modalBrandFilter = ref('ALL')
const modalCategoryFilter = ref('ALL')
const modalSearchQuery = ref('')
const modalViewMode = ref('all') // 'all' | 'selected' | 'unselected'
const modalDisplayLimit = ref(100)

watch([modalBrandFilter, modalCategoryFilter, modalSearchQuery, modalViewMode], () => {
  modalDisplayLimit.value = 100
})

watch(modalBrandFilter, () => {
  modalCategoryFilter.value = 'ALL'
})

const formatNumberPlain = (val) => {
  const n = Number(val)
  if (!Number.isFinite(n) || n === 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(n)
}

const roundByCurrency = (val, currency) => {
  const n = Math.max(0, Number(val) || 0)
  const cur = String(currency || 'VND').trim().toUpperCase()
  if (cur === 'VND') return Math.round(n)
  return Math.round(n * 100) / 100
}

/**
 * Tính lại giá bán mới của 1 dòng trong bảng giá dựa trên giá gốc mới nhất và quy tắc (direction, type, value).
 */
const computeNewPriceFromBase = (basePrice, entry, currency) => {
  const giaGoc = Number(basePrice) || 0
  if (!entry) return giaGoc
  const dir = entry.direction || 'increase'
  const type = entry.type || 'percent'
  const val = Math.max(0, Number(entry.value) || 0)
  let rawNew = giaGoc
  if (type === 'percent') {
    const delta = (giaGoc * val) / 100
    rawNew = dir === 'decrease' ? giaGoc - delta : giaGoc + delta
  } else if (type === 'amount') {
    rawNew = dir === 'decrease' ? giaGoc - val : giaGoc + val
  } else {
    // custom: nếu trước đó có gia_goc > 0 thì giữ tỉ lệ, ngược lại giữ khoảng chênh lệch
    const oldBase = Number(entry.gia_goc) || 0
    const oldPrice = Number(entry.gia_ban_moi) || 0
    if (oldBase > 0) {
      rawNew = giaGoc * (oldPrice / oldBase)
    } else {
      rawNew = giaGoc + (oldPrice - oldBase)
    }
  }
  return roundByCurrency(rawNew, currency || entry.Don_vi_tien_te || 'VND')
}

const activePriceList = computed(() => {
  if (!selectedPriceListId.value) return null
  return priceLists.value.find(pl => pl._firebaseKey === selectedPriceListId.value) || null
})

const activePriceListMap = computed(() => {
  const map = new Map()
  const pl = activePriceList.value
  if (!pl || !Array.isArray(pl.items)) return map

  const autoSync = pl.auto_sync_base_price !== false
  const sysItemMap = new Map()
  if (autoSync) {
    items.value.forEach(it => {
      if (it && it.Ma_hang) {
        sysItemMap.set(String(it.Ma_hang).trim(), it)
      }
    })
  }

  pl.items.forEach(entry => {
    if (entry && entry.Ma_hang) {
      const cleanMa = String(entry.Ma_hang).trim()
      if (autoSync) {
        const sysItem = sysItemMap.get(cleanMa)
        if (sysItem) {
          const latestGiaGoc = Number(sysItem.Don_gia) || 0
          const savedGiaGoc = Number(entry.gia_goc) || 0
          if (latestGiaGoc !== savedGiaGoc) {
            const newGiaBan = computeNewPriceFromBase(
              latestGiaGoc,
              entry,
              sysItem.Don_vi_tien_te || entry.Don_vi_tien_te
            )
            map.set(cleanMa, {
              ...entry,
              gia_goc: latestGiaGoc,
              gia_ban_moi: newGiaBan,
              _auto_synced: true
            })
            return
          }
        }
      }
      map.set(cleanMa, entry)
    }
  })
  return map
})

const getPriceListEntry = (item) => {
  if (!item || !item.Ma_hang) return null
  return activePriceListMap.value.get(String(item.Ma_hang).trim()) || null
}

watch(selectedPriceListId, () => {
  displayLimit.value = 15
})

const recalcRowPrice = (row, markManual = false) => {
  if (!row) return
  if (markManual) row._manualRowEdit = true
  const giaGoc = Number(row.gia_goc) || 0
  if (row.type === 'custom') return
  const val = Math.max(0, Number(row.value) || 0)
  let delta = 0
  if (row.type === 'percent') {
    delta = (giaGoc * val) / 100
  } else {
    delta = val
  }
  const rawNew = row.direction === 'decrease' ? giaGoc - delta : giaGoc + delta
  row.gia_ban_moi = roundByCurrency(rawNew, row.Don_vi_tien_te)
}

const onCustomRowPriceChange = (row) => {
  if (!row) return
  row._manualRowEdit = true
  const giaGoc = Number(row.gia_goc) || 0
  const giaMoi = Math.max(0, Number(row.gia_ban_moi) || 0)
  const diff = giaMoi - giaGoc
  row.type = 'custom'
  row.direction = diff < 0 ? 'decrease' : 'increase'
  row.value = Math.abs(diff)
}

const getRowDiffClass = (row) => {
  const diff = (Number(row.gia_ban_moi) || 0) - (Number(row.gia_goc) || 0)
  if (diff > 0) return 'pl-diff-up'
  if (diff < 0) return 'pl-diff-down'
  return 'pl-diff-zero'
}

const formatRowDiffText = (row) => {
  const giaGoc = Number(row.gia_goc) || 0
  const giaMoi = Number(row.gia_ban_moi) || 0
  const diff = giaMoi - giaGoc
  if (diff === 0) return '0 (Giữ nguyên)'
  const sign = diff > 0 ? '+' : '-'
  const absDiff = Math.abs(diff)
  const pct = giaGoc > 0 ? Math.round((absDiff / giaGoc) * 1000) / 10 : 0
  return `${sign}${formatNumberPlain(absDiff)} (${sign}${pct}%)`
}

const getPriceListDiffClass = (plEntry, currentDonGia) => {
  if (!plEntry) return ''
  const base = Number(currentDonGia ?? plEntry.gia_goc) || 0
  const next = Number(plEntry.gia_ban_moi) || 0
  if (next > base) return 'up'
  if (next < base) return 'down'
  return 'neutral'
}

const formatPriceListRuleShort = (plEntry, currentDonGia) => {
  if (!plEntry) return ''
  const base = Number(currentDonGia ?? plEntry.gia_goc) || 0
  const next = Number(plEntry.gia_ban_moi) || 0
  const diff = next - base
  if (plEntry.type === 'percent' && Number(plEntry.value) > 0) {
    return `${plEntry.direction === 'decrease' ? '-' : '+'}${plEntry.value}%`
  }
  if (diff === 0) return 'Giữ nguyên'
  const sign = diff > 0 ? '+' : '-'
  return `${sign}${formatNumberPlain(Math.abs(diff))}`
}

const priceListBrandOptions = computed(() => {
  const set = new Set()
  priceListRows.value.forEach(r => {
    const b = String(r.Ten_nha_cung_cap || '').trim()
    if (b) set.add(b)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const priceListCategoryOptions = computed(() => {
  const set = new Set()
  priceListRows.value.forEach(r => {
    if (modalBrandFilter.value !== 'ALL' && r.Ten_nha_cung_cap !== modalBrandFilter.value) return
    const c = String(r.Danh_muc || '').trim()
    if (c) set.add(c)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const selectedPriceListCount = computed(() => {
  return priceListRows.value.filter(r => r.selected).length
})

const filteredModalProducts = computed(() => {
  const kw = modalSearchQuery.value.trim().toLowerCase()
  const words = kw ? kw.split(/\s+/).filter(Boolean) : []

  return priceListRows.value.filter(r => {
    if (modalViewMode.value === 'selected' && !r.selected) return false
    if (modalViewMode.value === 'unselected' && r.selected) return false
    if (modalBrandFilter.value !== 'ALL' && r.Ten_nha_cung_cap !== modalBrandFilter.value) return false
    if (modalCategoryFilter.value !== 'ALL' && r.Danh_muc !== modalCategoryFilter.value) return false

    if (words.length > 0) {
      const ma = String(r.Ma_hang || '').toLowerCase()
      const ten = String(r.Ten_hang || '').toLowerCase()
      const cat = String(r.Danh_muc || '').toLowerCase()
      const ok = words.every(w => ma.includes(w) || ten.includes(w) || cat.includes(w))
      if (!ok) return false
    }
    return true
  })
})

const displayedModalProducts = computed(() => {
  return filteredModalProducts.value.slice(0, modalDisplayLimit.value)
})

const isAllFilteredSelected = computed(() => {
  if (!filteredModalProducts.value.length) return false
  return filteredModalProducts.value.every(r => r.selected)
})

const toggleAllFilteredInModal = (checked) => {
  filteredModalProducts.value.forEach(r => {
    r.selected = Boolean(checked)
  })
}

const selectAllFilteredInModal = () => {
  filteredModalProducts.value.forEach(r => {
    r.selected = true
  })
}

const deselectAllFilteredInModal = () => {
  filteredModalProducts.value.forEach(r => {
    r.selected = false
  })
}

const onBulkRuleAutoApply = () => {
  const dir = priceListForm.value.bulkDirection || 'increase'
  const type = priceListForm.value.bulkType || 'percent'
  const val = Math.max(0, Number(priceListForm.value.bulkValue) || 0)

  const hasFilter = modalBrandFilter.value !== 'ALL' || modalCategoryFilter.value !== 'ALL' || Boolean(modalSearchQuery.value.trim())
  const targetRows = hasFilter ? filteredModalProducts.value : priceListRows.value

  targetRows.forEach(r => {
    if (r.selected && !r._manualRowEdit) {
      r.direction = dir
      r.type = type
      r.value = val
      recalcRowPrice(r, false)
    }
  })
}

const applyBulkRuleToSelected = () => {
  const dir = priceListForm.value.bulkDirection || 'increase'
  const type = priceListForm.value.bulkType || 'percent'
  const val = Math.max(0, Number(priceListForm.value.bulkValue) || 0)

  let count = 0
  priceListRows.value.forEach(r => {
    if (r.selected) {
      r._manualRowEdit = false
      r.direction = dir
      r.type = type
      r.value = val
      recalcRowPrice(r, false)
      count++
    }
  })

  if (count === 0) {
    showAsyncError('Chưa chọn sản phẩm', 'Vui lòng tích chọn ít nhất 1 sản phẩm hoặc bấm "Chọn & Áp dụng SP đang lọc".')
  }
}

const applyBulkRuleToFiltered = () => {
  const dir = priceListForm.value.bulkDirection || 'increase'
  const type = priceListForm.value.bulkType || 'percent'
  const val = Math.max(0, Number(priceListForm.value.bulkValue) || 0)

  filteredModalProducts.value.forEach(r => {
    r.selected = true
    r._manualRowEdit = false
    r.direction = dir
    r.type = type
    r.value = val
    recalcRowPrice(r, false)
  })
}

const buildPriceListRowsFromItems = (existingEntryMap = null, defaultRule = null, autoSyncBasePrice = true) => {
  const dir = defaultRule?.direction || 'increase'
  const type = defaultRule?.type || 'percent'
  const val = Number(defaultRule?.value) || 0

  return items.value.map(item => {
    const cleanMa = String(item.Ma_hang || '').trim()
    const saved = existingEntryMap ? existingEntryMap.get(cleanMa) : null
    const latestGiaGoc = Number(item.Don_gia) || 0
    const savedGiaGoc = saved && saved.gia_goc !== undefined ? Number(saved.gia_goc) : latestGiaGoc
    const effectiveGiaGoc = (saved && !autoSyncBasePrice) ? savedGiaGoc : latestGiaGoc

    let effectiveGiaBanMoi = effectiveGiaGoc
    if (saved && saved.gia_ban_moi !== undefined) {
      if (autoSyncBasePrice && latestGiaGoc !== savedGiaGoc) {
        effectiveGiaBanMoi = computeNewPriceFromBase(latestGiaGoc, saved, item.Don_vi_tien_te)
      } else {
        effectiveGiaBanMoi = Number(saved.gia_ban_moi)
      }
    }

    const row = {
      selected: existingEntryMap ? Boolean(saved) : true,
      _manualRowEdit: false,
      Ma_hang: cleanMa,
      Ten_hang: item.Ten_hang,
      Ten_nha_cung_cap: item.Ten_nha_cung_cap,
      Danh_muc: item.Danh_muc,
      Don_vi_tien_te: item.Don_vi_tien_te || 'VND',
      DVT: item.DVT || '',
      Ti_gia: Number(item.Ti_gia) || 1,
      Thue_VAT: Number(item.Thue_VAT) || 0,
      gia_nhap: Number(item.gia_nhap) || 0,
      gia_goc: effectiveGiaGoc,
      _latest_sys_gia_goc: latestGiaGoc,
      _saved_gia_goc: savedGiaGoc,
      _saved_gia_ban_moi: saved && saved.gia_ban_moi !== undefined ? Number(saved.gia_ban_moi) : latestGiaGoc,
      last_updated: item.last_updated || '',
      direction: saved ? (saved.direction || dir) : dir,
      type: saved ? (saved.type || type) : type,
      value: saved ? (Number(saved.value) || 0) : val,
      gia_ban_moi: effectiveGiaBanMoi
    }
    if (!saved) {
      recalcRowPrice(row, false)
    }
    return row
  })
}

const onModalAutoSyncChange = () => {
  const autoSync = Boolean(priceListForm.value.auto_sync_base_price)
  priceListRows.value.forEach(r => {
    if (autoSync) {
      const latestBase = Number(r._latest_sys_gia_goc ?? r.gia_goc) || 0
      if (r.gia_goc !== latestBase) {
        const nextPrice = computeNewPriceFromBase(latestBase, r, r.Don_vi_tien_te)
        r.gia_goc = latestBase
        r.gia_ban_moi = nextPrice
      }
    } else if (isEditingPriceList.value && r._saved_gia_goc !== undefined) {
      r.gia_goc = Number(r._saved_gia_goc) || 0
      r.gia_ban_moi = Number(r._saved_gia_ban_moi) || 0
    }
  })
}

const openCreatePriceListModal = async () => {
  if (!items.value.length) {
    await fetchData()
  }
  isEditingPriceList.value = false
  editingPriceListKey.value = ''
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  priceListForm.value = {
    ten_bang_gia: '',
    ghi_chu: '',
    ngay_bat_dau: todayStr,
    ngay_ket_thuc: '',
    auto_sync_base_price: true,
    bulkDirection: 'increase',
    bulkType: 'percent',
    bulkValue: 0
  }
  modalBrandFilter.value = 'ALL'
  modalCategoryFilter.value = 'ALL'
  modalSearchQuery.value = ''
  modalViewMode.value = 'all'
  priceListRows.value = buildPriceListRowsFromItems(null, null, true)
  showPriceListModal.value = true
}

const openEditPriceListModal = async (pl) => {
  if (!pl) return
  if (!items.value.length) {
    await fetchData()
  }
  isEditingPriceList.value = true
  editingPriceListKey.value = pl._firebaseKey
  const rule = pl.default_rule || {}
  const autoSync = pl.auto_sync_base_price !== false
  priceListForm.value = {
    ten_bang_gia: pl.ten_bang_gia || '',
    ghi_chu: pl.ghi_chu || '',
    ngay_bat_dau: pl.ngay_bat_dau || '',
    ngay_ket_thuc: pl.ngay_ket_thuc || '',
    auto_sync_base_price: autoSync,
    bulkDirection: rule.direction || 'increase',
    bulkType: rule.type || 'percent',
    bulkValue: Number(rule.value) || 0
  }
  modalBrandFilter.value = 'ALL'
  modalCategoryFilter.value = 'ALL'
  modalSearchQuery.value = ''
  modalViewMode.value = 'selected'

  const existingMap = new Map()
  if (Array.isArray(pl.items)) {
    pl.items.forEach(entry => {
      if (entry && entry.Ma_hang) existingMap.set(String(entry.Ma_hang).trim(), entry)
    })
  }
  priceListRows.value = buildPriceListRowsFromItems(existingMap, rule, autoSync)
  showPriceListModal.value = true
}

const fetchPriceLists = async () => {
  try {
    const snap = await get(dbRef(database, 'bang_gia'))
    const data = snap.val() || {}
    const list = Object.entries(data)
      .map(([fbKey, row]) => {
        if (!row || typeof row !== 'object') return null
        const rawItems = Array.isArray(row.items)
          ? row.items
          : (row.items && typeof row.items === 'object' ? Object.values(row.items) : [])
        return {
          _firebaseKey: fbKey,
          id: row.id || fbKey,
          ten_bang_gia: String(row.ten_bang_gia || 'Bảng giá chưa đặt tên'),
          ghi_chu: String(row.ghi_chu || ''),
          ngay_bat_dau: String(row.ngay_bat_dau || ''),
          ngay_ket_thuc: String(row.ngay_ket_thuc || ''),
          auto_sync_base_price: row.auto_sync_base_price !== false,
          created_at: Number(row.created_at) || 0,
          updated_at: Number(row.updated_at) || 0,
          default_rule: row.default_rule || { direction: 'increase', type: 'percent', value: 0 },
          items: rawItems.filter(Boolean)
        }
      })
      .filter(Boolean)

    list.sort((a, b) => (b.updated_at || b.created_at) - (a.updated_at || a.created_at))
    priceLists.value = list
  } catch (err) {
    console.error('Lỗi khi tải danh sách bảng giá từ Firebase:', err)
  }
}

/**
 * Bật / Tắt nhanh chế độ "Tự động cập nhật khi bảng giá gốc thay đổi" ngay trên thanh chọn bảng giá.
 */
const togglePriceListAutoSync = async (pl) => {
  if (!pl || !pl._firebaseKey) return
  const nextState = !(pl.auto_sync_base_price !== false)
  try {
    const updates = {
      auto_sync_base_price: nextState,
      updated_at: Date.now()
    }
    if (nextState && Array.isArray(pl.items) && items.value.length > 0) {
      const sysMap = new Map()
      items.value.forEach(it => {
        if (it && it.Ma_hang) sysMap.set(String(it.Ma_hang).trim(), it)
      })
      updates.items = pl.items.map(entry => {
        if (!entry || !entry.Ma_hang) return entry
        const sysItem = sysMap.get(String(entry.Ma_hang).trim())
        if (!sysItem) return entry
        const latestGiaGoc = Number(sysItem.Don_gia) || 0
        const newGiaBan = computeNewPriceFromBase(latestGiaGoc, entry, sysItem.Don_vi_tien_te || entry.Don_vi_tien_te)
        return {
          ...entry,
          gia_goc: latestGiaGoc,
          gia_ban_moi: newGiaBan
        }
      })
    }
    await update(dbRef(database, `bang_gia/${pl._firebaseKey}`), updates)
    await fetchPriceLists()
    showAsyncSuccess(
      nextState ? '🔄 Đã BẬT tự động cập nhật theo giá gốc!' : '🔒 Đã TẮT tự động cập nhật (Giữ giá cố định)!',
      `Bảng giá "${pl.ten_bang_gia}" ${nextState ? 'sẽ tự động tính lại giá bán khi giá gốc thay đổi.' : 'sẽ giữ cố định mức giá bán hiện tại.'}`
    )
  } catch (err) {
    console.error('Toggle auto sync error:', err)
    showAsyncError('Lỗi cập nhật chế độ tự động', err.message)
  }
}

/**
 * Tự động đồng bộ các bảng giá có bật auto_sync_base_price trên Firebase mỗi khi hang_hoa thay đổi.
 */
const syncAutoUpdatePriceListsInFirebase = async () => {
  try {
    if (!items.value.length) return
    const sysMap = new Map()
    items.value.forEach(it => {
      if (it && it.Ma_hang) sysMap.set(String(it.Ma_hang).trim(), it)
    })

    const snap = await get(dbRef(database, 'bang_gia'))
    const data = snap.val() || {}
    const batchUpdates = {}
    let syncedListCount = 0

    Object.entries(data).forEach(([fbKey, pl]) => {
      if (!pl || typeof pl !== 'object') return
      if (pl.auto_sync_base_price === false) return

      const rawItems = Array.isArray(pl.items)
        ? pl.items
        : (pl.items && typeof pl.items === 'object' ? Object.values(pl.items) : [])
      if (!rawItems.length) return

      let hasChanged = false
      const updatedItems = rawItems.filter(Boolean).map(entry => {
        const cleanMa = String(entry.Ma_hang || '').trim()
        const sysItem = sysMap.get(cleanMa)
        if (!sysItem) return entry

        const latestGiaGoc = Number(sysItem.Don_gia) || 0
        const savedGiaGoc = Number(entry.gia_goc) || 0
        const nextGiaBan = computeNewPriceFromBase(latestGiaGoc, entry, sysItem.Don_vi_tien_te || entry.Don_vi_tien_te)

        if (latestGiaGoc !== savedGiaGoc || nextGiaBan !== Number(entry.gia_ban_moi)) {
          hasChanged = true
          return {
            ...entry,
            Ma_hang: cleanMa,
            Ten_hang: String(sysItem.Ten_hang || entry.Ten_hang || ''),
            Don_vi_tien_te: String(sysItem.Don_vi_tien_te || entry.Don_vi_tien_te || 'VND'),
            DVT: String(sysItem.DVT || entry.DVT || ''),
            gia_goc: latestGiaGoc,
            gia_ban_moi: nextGiaBan
          }
        }
        return entry
      })

      if (hasChanged) {
        batchUpdates[`${fbKey}/items`] = updatedItems
        batchUpdates[`${fbKey}/updated_at`] = Date.now()
        syncedListCount++
      }
    })

    if (syncedListCount > 0) {
      await update(dbRef(database, 'bang_gia'), batchUpdates)
      await fetchPriceLists()
    }
  } catch (err) {
    console.error('Lỗi khi tự động đồng bộ bảng giá theo giá gốc:', err)
  }
}

const savePriceList = async () => {
  const name = String(priceListForm.value.ten_bang_gia || '').trim()
  if (!name) {
    showAsyncError('Thiếu tên bảng giá', 'Vui lòng nhập Tên bảng giá trước khi lưu.')
    return
  }

  const startDate = String(priceListForm.value.ngay_bat_dau || '').trim()
  const endDate = String(priceListForm.value.ngay_ket_thuc || '').trim()
  if (startDate && endDate && endDate < startDate) {
    showAsyncError('Thời hạn không hợp lệ', 'Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu áp dụng.')
    return
  }

  const selectedRows = priceListRows.value.filter(r => r.selected)
  if (!selectedRows.length) {
    showAsyncError('Chưa chọn sản phẩm', 'Vui lòng chọn ít nhất 1 sản phẩm cho bảng giá.')
    return
  }

  savingPriceList.value = true
  try {
    const now = Date.now()
    const payload = {
      ten_bang_gia: name,
      ghi_chu: String(priceListForm.value.ghi_chu || '').trim(),
      ngay_bat_dau: startDate,
      ngay_ket_thuc: endDate,
      auto_sync_base_price: Boolean(priceListForm.value.auto_sync_base_price),
      updated_at: now,
      default_rule: {
        direction: priceListForm.value.bulkDirection || 'increase',
        type: priceListForm.value.bulkType || 'percent',
        value: Number(priceListForm.value.bulkValue) || 0
      },
      items: selectedRows.map(r => ({
        Ma_hang: String(r.Ma_hang || ''),
        Ten_hang: String(r.Ten_hang || ''),
        Ten_nha_cung_cap: String(r.Ten_nha_cung_cap || ''),
        Danh_muc: String(r.Danh_muc || ''),
        Don_vi_tien_te: String(r.Don_vi_tien_te || 'VND'),
        DVT: String(r.DVT || ''),
        gia_goc: Number(r.gia_goc) || 0,
        direction: r.direction || 'increase',
        type: r.type || 'percent',
        value: Number(r.value) || 0,
        gia_ban_moi: Number(r.gia_ban_moi) || 0
      }))
    }

    let targetKey = editingPriceListKey.value
    if (isEditingPriceList.value && targetKey) {
      await update(dbRef(database, `bang_gia/${targetKey}`), payload)
      showAsyncSuccess('Đã cập nhật bảng giá!', `${name} (${selectedRows.length} sản phẩm)`)
    } else {
      const newRef = push(dbRef(database, 'bang_gia'))
      targetKey = newRef.key
      await set(newRef, { ...payload, id: targetKey, created_at: now })
      showAsyncSuccess('Đã tạo bảng giá mới!', `${name} (${selectedRows.length} sản phẩm)`)
    }

    await fetchPriceLists()
    if (targetKey) {
      selectedPriceListId.value = targetKey
    }
    showPriceListModal.value = false
  } catch (err) {
    console.error('Save price list error:', err)
    showAsyncError('Lỗi lưu bảng giá', err.message)
  } finally {
    savingPriceList.value = false
  }
}

const requestDeletePriceList = (pl) => {
  if (!pl) return
  confirmDeletePriceListModal.value = { show: true, priceList: pl }
}

const executeDeletePriceList = async () => {
  const pl = confirmDeletePriceListModal.value.priceList
  if (!pl || !pl._firebaseKey) return
  confirmDeletePriceListModal.value.show = false

  showAsyncLoading('Đang xóa bảng giá...', pl.ten_bang_gia)
  try {
    await remove(dbRef(database, `bang_gia/${pl._firebaseKey}`))
    if (selectedPriceListId.value === pl._firebaseKey) {
      selectedPriceListId.value = ''
    }
    await fetchPriceLists()
    showAsyncSuccess('Đã xóa bảng giá!', pl.ten_bang_gia)
  } catch (err) {
    console.error('Delete price list error:', err)
    showAsyncError('Lỗi xóa bảng giá', err.message)
  }
}

const buildAndDownloadPriceListExcel = (title, note, rows, startDate = '', endDate = '') => {
  if (!rows || !rows.length) {
    showAsyncError('Không có dữ liệu', 'Bảng giá chưa có sản phẩm nào để xuất Excel.')
    return
  }

  const periodStr = formatPriceListPeriod({ ngay_bat_dau: startDate, ngay_ket_thuc: endDate })
  const wsData = [
    [title.toUpperCase()],
    [`Thời gian áp dụng: ${periodStr}`],
    [note ? `Ghi chú: ${note}` : `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
    ['STT', 'Mã hàng', 'Tên hàng hóa', 'Hãng', 'Danh mục', 'ĐVT', 'Tiền tệ', 'Giá bán gốc', 'Mức điều chỉnh', 'Giá bán mới (Bảng giá)']
  ]

  rows.forEach((r, i) => {
    const giaGoc = Number(r.gia_goc) || 0
    const giaMoi = Number(r.gia_ban_moi) || 0
    const diff = giaMoi - giaGoc
    let ruleStr = 'Giữ nguyên'
    if (r.type === 'percent' && Number(r.value) > 0) {
      ruleStr = `${r.direction === 'decrease' ? 'Giảm' : 'Tăng'} ${r.value}%`
    } else if (diff !== 0) {
      ruleStr = `${diff > 0 ? '+' : '-'}${formatNumberPlain(Math.abs(diff))}`
    }

    wsData.push([
      i + 1,
      r.Ma_hang || '',
      r.Ten_hang || '',
      r.Ten_nha_cung_cap || '',
      r.Danh_muc || '',
      r.DVT || '',
      r.Don_vi_tien_te || 'VND',
      giaGoc,
      ruleStr,
      giaMoi
    ])
  })

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 46 },
    { wch: 14 },
    { wch: 28 },
    { wch: 10 },
    { wch: 10 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Bang_Gia')
  const safeFile = String(title || 'Bang_gia')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
  XLSX.writeFile(wb, `${safeFile}.xlsx`)
}

const exportPriceListToExcel = (pl) => {
  if (!pl) return
  buildAndDownloadPriceListExcel(pl.ten_bang_gia, pl.ghi_chu, pl.items || [], pl.ngay_bat_dau, pl.ngay_ket_thuc)
}

const exportDraftPriceListToExcel = () => {
  const selected = priceListRows.value.filter(r => r.selected)
  const title = priceListForm.value.ten_bang_gia || 'Bang_Gia_Moi'
  buildAndDownloadPriceListExcel(title, priceListForm.value.ghi_chu, selected, priceListForm.value.ngay_bat_dau, priceListForm.value.ngay_ket_thuc)
}

const totalGroupsCount = computed(() => {
  const categories = new Set(filteredItems.value.map(item => item.Danh_muc || 'CHƯA PHÂN LOẠI'))
  return categories.size
})

const groupedItems = computed(() => {
  const groups = {}
  filteredItems.value.forEach(item => {
    const cat = item.Danh_muc || 'CHƯA PHÂN LOẠI'
    if (!groups[cat]) {
      groups[cat] = []
    }
    groups[cat].push(item)
  })
  
  // Preserve original spreadsheet order, but move "CHƯA PHÂN LOẠI" to the end
  const sortedKeys = Object.keys(groups)
  const idx = sortedKeys.indexOf('CHƯA PHÂN LOẠI')
  if (idx > -1) {
    sortedKeys.splice(idx, 1)
    sortedKeys.push('CHƯA PHÂN LOẠI')
  }
  const limitedKeys = sortedKeys.slice(0, displayLimit.value)
  
  const sortedGroups = {}
  limitedKeys.forEach(k => {
    sortedGroups[k] = groups[k]
  })
  return sortedGroups
})

const formatCurrency = (val, currency) => {
  if (!val) return '0'
  return new Intl.NumberFormat('vi-VN').format(val) + ' ' + (currency || 'VND')
}

const fetchData = async () => {
  loading.value = true
  try {
    const snap = await get(dbRef(database, 'hang_hoa'))
    const data = snap.val() || {}
    const mapped = []
    Object.entries(data).forEach(([firebaseKey, row]) => {
      if (!row || typeof row !== 'object') return
      mapped.push({
        _firebaseKey: firebaseKey,
        Ma_hang: String(row.Ma_hang ?? '').trim(),
        Ten_hang: String(row.Ten_hang ?? ''),
        Main_img: String(row.Main_img ?? ''),
        Ma_nha_cung_cap: String(row.Ma_nha_cung_cap ?? ''),
        Ten_nha_cung_cap: String(row.Ten_nha_cung_cap ?? ''),
        Mo_ta_chung: String(row.Mo_ta_chung ?? ''),
        Mo_ta_chi_tiet: String(row.Mo_ta_chi_tiet ?? ''),
        Features: String(row.Features ?? ''),
        Danh_muc: String(row.Danh_muc ?? '').toUpperCase(),
        License_duration: String(row.License_duration ?? ''),
        DVT: String(row.DVT ?? ''),
        Gia_tieu_chuan: row.Gia_tieu_chuan !== undefined && row.Gia_tieu_chuan !== '' ? Number(row.Gia_tieu_chuan) : 0,
        Don_gia: row.Don_gia !== undefined && row.Don_gia !== '' ? Number(row.Don_gia) : 0,
        Trang_thai: String(row.Trang_thai ?? ''),
        Don_vi_tien_te: String(row.Don_vi_tien_te || 'VND'),
        Ti_gia: row.Ti_gia !== undefined && row.Ti_gia !== '' ? Number(row.Ti_gia) : 1,
        Thue_VAT: row.Thue_VAT !== undefined && row.Thue_VAT !== '' ? Number(row.Thue_VAT) : 0,
        Ma_hang_lien_ket: String(row.Ma_hang_lien_ket ?? ''),
        Ten_hang_lien_ket: String(row.Ten_hang_lien_ket ?? ''),
        Ghi_chu: String(row.Ghi_chu ?? ''),
        gia_hardware: row.gia_hardware !== undefined && row.gia_hardware !== '' ? Number(row.gia_hardware) : 0,
        gia_nhap: row.gia_nhap !== undefined && row.gia_nhap !== '' ? Number(row.gia_nhap) : 0,
        muc_phan_tram_off: row.muc_phan_tram_off !== undefined && row.muc_phan_tram_off !== ''
          ? Number(row.muc_phan_tram_off)
          : (row['muc_%_off'] !== undefined && row['muc_%_off'] !== '' ? Number(row['muc_%_off']) : 0),
        Type: String(row.Type ?? row.TYPE ?? '').trim(),
        thoi_han_bao_hanh: String(row.thoi_han_bao_hanh ?? ''),
        volume: String(row.volume ?? ''),
        last_updated: String(row.last_updated ?? '')
      })
    })
    items.value = mapped
  } catch (err) {
    console.error('Error fetching hang_hoa from Firebase:', err)
  } finally {
    loading.value = false
  }
}

const getGiaOffSortKey = (item) => {
  if (!item || typeof item !== 'object') return 0
  if (item.created_at) return Number(item.created_at) || 0
  // Trích xuất unix timestamp từ link Cloudinary (VD: .../upload/v1780902297/...)
  const link = String(item.link_file || '')
  const m = link.match(/\/v(\d+)\//)
  if (m) return Number(m[1]) * 1000
  if (typeof item.thoi_gian === 'number') return item.thoi_gian
  return 0
}

const fetchLatestGiaOff = async () => {
  try {
    const snap = await get(dbRef(database, 'file_gia_off'))
    const data = snap.val() || {}
    const list = Object.entries(data)
      .map(([fbKey, row]) => {
        if (!row || typeof row !== 'object') return null
        return {
          _firebaseKey: fbKey,
          id: row.id || fbKey,
          thoi_gian: row.thoi_gian ?? '',
          ten_file: row.ten_file ?? '',
          link_file: row.link_file ?? '',
          created_at: row.created_at ?? 0
        }
      })
      .filter(Boolean)

    if (list.length > 0) {
      list.sort((a, b) => getGiaOffSortKey(a) - getGiaOffSortKey(b))
      latestFileGiaOff.value = list[list.length - 1]
    }
  } catch (err) {
    console.error('Lỗi khi fetch file_gia_off từ Firebase:', err)
  }
}

const formatGiaOffDate = (d) => {
  if (!d) return ''
  if (typeof d === 'number' && d > 25000 && d < 80000) {
    const dt = new Date(Math.round((d - 25569) * 86400 * 1000))
    return `${dt.getUTCMonth() + 1}/${dt.getUTCFullYear()}`
  }
  if (typeof d === 'string' && d.includes('T')) {
    const dt = new Date(d)
    if (!isNaN(dt.getTime())) {
      return `${dt.getMonth() + 1}/${dt.getFullYear()}`
    }
  }
  return d
}

const openAddModal = () => {
  formData.value = { ...defaultForm }
  originalItem.value = null
  isEditing.value = false
  showModal.value = true
}

const openEditModal = (item) => {
  const normalizedFeatures = formatFeaturesHtml(item.Features)
  const plEntry = activePriceList.value ? getPriceListEntry(item) : null
  const giaGocHeThong = toNum(item.Don_gia, 0)

  if (activePriceList.value && plEntry) {
    const autoSync = activePriceList.value.auto_sync_base_price !== false
    const refBasePrice = autoSync ? giaGocHeThong : toNum(plEntry.gia_goc, giaGocHeThong)
    const giaBangGia = toNum(plEntry.gia_ban_moi, refBasePrice)
    const diff = giaBangGia - refBasePrice
    const pct = plEntry.type === 'percent' && plEntry.value !== undefined
      ? toNum(plEntry.value, 0)
      : (refBasePrice > 0 ? Math.round((Math.abs(diff) / refBasePrice) * 1000) / 10 : 0)
    const dir = plEntry.direction || (diff < 0 ? 'decrease' : 'increase')
    const baseObj = {
      ...item,
      Features: normalizedFeatures,
      Don_gia: giaBangGia,
      _has_pl_entry: true,
      _gia_goc_he_thong: refBasePrice,
      _real_hang_hoa_don_gia: giaGocHeThong,
      _pl_direction: dir,
      _pl_type: plEntry.type || 'percent',
      _pl_value: toNum(plEntry.value, pct),
      _pl_pct: pct
    }
    formData.value = { ...baseObj }
    originalItem.value = { ...baseObj }
  } else {
    const baseObj = {
      ...item,
      Features: normalizedFeatures,
      _has_pl_entry: false,
      _gia_goc_he_thong: giaGocHeThong,
      _real_hang_hoa_don_gia: giaGocHeThong
    }
    formData.value = { ...baseObj }
    originalItem.value = { ...baseObj }
  }
  isEditing.value = true
  showModal.value = true
}

const formatModalPriceListBadge = () => {
  const giaGoc = toNum(formData.value._gia_goc_he_thong, 0)
  const giaMoi = toNum(formData.value.Don_gia, 0)
  const diff = giaMoi - giaGoc
  if (diff === 0) return '0% (Giữ nguyên)'
  const sign = diff > 0 ? '+' : '-'
  const pct = formData.value._pl_type === 'percent' && toNum(formData.value._pl_pct, 0) > 0
    ? toNum(formData.value._pl_pct, 0)
    : (giaGoc > 0 ? Math.round((Math.abs(diff) / giaGoc) * 1000) / 10 : 0)
  return `${sign}${pct}%`
}

const onModalDonGiaChange = () => {
  if (!isEditing.value || !activePriceList.value || !formData.value._has_pl_entry) return
  const giaGoc = toNum(formData.value._gia_goc_he_thong, 0)
  const giaMoi = Math.max(0, toNum(formData.value.Don_gia, 0))
  const diff = giaMoi - giaGoc
  formData.value._pl_direction = diff < 0 ? 'decrease' : 'increase'
  const pct = giaGoc > 0 ? Math.round((Math.abs(diff) / giaGoc) * 1000) / 10 : 0
  formData.value._pl_pct = pct
  formData.value._pl_type = 'percent'
  formData.value._pl_value = pct
}

const onModalPriceListPctChange = () => {
  if (!isEditing.value || !activePriceList.value || !formData.value._has_pl_entry) return
  const giaGoc = toNum(formData.value._gia_goc_he_thong, 0)
  const pct = Math.max(0, toNum(formData.value._pl_pct, 0))
  const dir = formData.value._pl_direction || 'increase'
  const delta = (giaGoc * pct) / 100
  const rawNew = dir === 'decrease' ? giaGoc - delta : giaGoc + delta
  formData.value.Don_gia = roundByCurrency(rawNew, formData.value.Don_vi_tien_te)
  formData.value._pl_type = 'percent'
  formData.value._pl_value = pct
}

const closeModal = () => {
  showModal.value = false
}

const requestDelete = (item) => {
  confirmDeleteModal.value = { show: true, item }
}

/**
 * Rebuild Ma_hang_lien_ket + Ten_hang_lien_ket cho TẤT CẢ hàng
 * cùng Danh_muc trong node hang_hoa trên Firebase (giống rebuildCategoryLinks_ trong backendOfficial).
 */
const rebuildCategoryLinksFirebase = async (category) => {
  const cat = String(category || '').trim().toUpperCase()
  if (!cat) return

  const snap = await get(dbRef(database, 'hang_hoa'))
  const data = snap.val() || {}

  const sameCatEntries = []
  Object.entries(data).forEach(([fbKey, row]) => {
    if (!row || typeof row !== 'object') return
    const rowCat = String(row.Danh_muc || '').trim().toUpperCase()
    if (rowCat === cat) {
      sameCatEntries.push({
        fbKey,
        Ma_hang: String(row.Ma_hang || '').trim(),
        Ten_hang: String(row.Ten_hang || '').trim()
      })
    }
  })

  if (sameCatEntries.length < 2) return

  const linkUpdates = {}
  sameCatEntries.forEach((entry, idx) => {
    const otherMas = []
    const otherTens = []
    sameCatEntries.forEach((other, otherIdx) => {
      if (otherIdx !== idx) {
        otherMas.push(other.Ma_hang)
        otherTens.push(other.Ten_hang)
      }
    })
    linkUpdates[`${entry.fbKey}/Ma_hang_lien_ket`] = otherMas.join('\n')
    linkUpdates[`${entry.fbKey}/Ten_hang_lien_ket`] = otherTens.join('\n')
  })

  await update(dbRef(database, 'hang_hoa'), linkUpdates)
}

const findFirebaseKeyByMaHang = async (item) => {
  if (item && item._firebaseKey) return item._firebaseKey
  const targetMa = String(item?.Ma_hang || '').trim()
  if (!targetMa) return null

  const localFound = items.value.find(x => String(x.Ma_hang || '').trim() === targetMa && x._firebaseKey)
  if (localFound) return localFound._firebaseKey

  const snap = await get(dbRef(database, 'hang_hoa'))
  const data = snap.val() || {}
  for (const [fbKey, row] of Object.entries(data)) {
    if (row && String(row.Ma_hang || '').trim() === targetMa) {
      return fbKey
    }
  }
  return null
}

const executeDelete = async () => {
  const item = confirmDeleteModal.value.item
  if (!item) return
  confirmDeleteModal.value.show = false
  
  loading.value = true
  showAsyncLoading('Đang xóa sản phẩm...', `Mã hàng: ${item.Ma_hang}`)
  try {
    const fbKey = await findFirebaseKeyByMaHang(item)
    if (!fbKey) {
      showAsyncError('Không thể xóa', 'Không tìm thấy sản phẩm trên Firebase (NOT_FOUND)')
      return
    }

    await remove(dbRef(database, `hang_hoa/${fbKey}`))
    if (showModal.value) closeModal()
    showAsyncSuccess('Xóa thành công!', `Mã hàng: ${item.Ma_hang}`)
    await fetchData()
  } catch (err) {
    console.error('Delete error:', err)
    showAsyncError('Lỗi xóa', err.message)
  } finally {
    loading.value = false
  }
}

const hasSystemFieldsChanged = (cur, orig) => {
  if (!cur || !orig) return false
  const sysKeys = [
    'Ten_hang', 'License_duration', 'thoi_han_bao_hanh', 'volume',
    'Danh_muc', 'Type', 'Ten_nha_cung_cap', 'DVT', 'Features',
    'Ghi_chu', 'Don_vi_tien_te', 'Ti_gia', 'Thue_VAT', 'gia_nhap'
  ]
  return sysKeys.some(k => String(cur[k] ?? '') !== String(orig[k] ?? ''))
}

const saveItem = async () => {
  if (!formData.value.Ma_hang || !formData.value.Ten_hang) {
    alert('Vui lòng điền mã hàng và tên hàng')
    return
  }
  
  saving.value = true
  try {
    if (isEditing.value) {
      // Nếu đang chọn Bảng giá: cập nhật giá mới vào bảng giá đó
      if (activePriceList.value && formData.value._has_pl_entry) {
        const plKey = activePriceList.value._firebaseKey
        const cleanMa = String(formData.value.Ma_hang || '').trim()
        const newPlPrice = toNum(formData.value.Don_gia, 0)
        const giaGoc = toNum(formData.value._gia_goc_he_thong, 0)
        const realHangHoaDonGia = toNum(formData.value._real_hang_hoa_don_gia, giaGoc)

        const currentPlItems = Array.isArray(activePriceList.value.items)
          ? [...activePriceList.value.items]
          : []

        const updatedPlItems = currentPlItems.map(entry => {
          if (entry && String(entry.Ma_hang || '').trim() === cleanMa) {
            return {
              ...entry,
              Ma_hang: cleanMa,
              Ten_hang: String(formData.value.Ten_hang || '').trim(),
              Ten_nha_cung_cap: String(formData.value.Ten_nha_cung_cap || ''),
              Danh_muc: String(formData.value.Danh_muc || '').trim().toUpperCase(),
              Don_vi_tien_te: String(formData.value.Don_vi_tien_te || 'VND'),
              DVT: String(formData.value.DVT || ''),
              gia_goc: giaGoc,
              direction: formData.value._pl_direction || 'increase',
              type: formData.value._pl_type || 'percent',
              value: toNum(formData.value._pl_value, 0),
              gia_ban_moi: newPlPrice
            }
          }
          return entry
        })

        await update(dbRef(database, `bang_gia/${plKey}`), {
          items: updatedPlItems,
          updated_at: Date.now()
        })

        // Nếu người dùng cũng có sửa thông tin chung của SP (Tên hàng, Features, Giá nhập, VAT...) thì cập nhật vào hang_hoa nhưng GIỮ NGUYÊN Don_gia gốc
        const sysChanged = hasSystemFieldsChanged(formData.value, originalItem.value)
        if (sysChanged) {
          const fbKey = await findFirebaseKeyByMaHang(formData.value)
          if (fbKey) {
            const sysPayload = buildFirebaseHangHoaPayload({
              ...formData.value,
              Don_gia: realHangHoaDonGia
            })
            await update(dbRef(database, `hang_hoa/${fbKey}`), sysPayload)
          }
        }

        closeModal()
        await fetchPriceLists()
        if (sysChanged) {
          await fetchData()
        }
        showAsyncSuccess(
          'Đã cập nhật giá vào bảng giá!',
          `${activePriceList.value.ten_bang_gia} — Giá mới: ${formatCurrency(newPlPrice, formData.value.Don_vi_tien_te)} (${formatModalPriceListBadge()})`
        )
        return
      }

      // Chế độ mặc định (Giá gốc hệ thống): cập nhật trực tiếp vào hang_hoa
      const payloadObj = buildFirebaseHangHoaPayload(formData.value)
      const fbKey = await findFirebaseKeyByMaHang(formData.value)
      if (!fbKey) {
        showAsyncError('Lỗi lưu dữ liệu', 'Không tìm thấy mã hàng cần cập nhật trên Firebase (NOT_FOUND)')
        return
      }
      await update(dbRef(database, `hang_hoa/${fbKey}`), payloadObj)
      showAsyncSuccess('Cập nhật thành công!', `Mã hàng: ${formData.value.Ma_hang}`)
    } else {
      // Tương đương createHangHoa_ trong backendOfficial
      const payloadObj = buildFirebaseHangHoaPayload(formData.value)
      const newRef = push(dbRef(database, 'hang_hoa'))
      await set(newRef, payloadObj)

      if (payloadObj.Danh_muc) {
        await rebuildCategoryLinksFirebase(payloadObj.Danh_muc)
      }
      showAsyncSuccess('Thêm mới thành công!', `Mã hàng: ${formData.value.Ma_hang}`)
    }

    closeModal()
    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
  } catch (err) {
    console.error('Save error:', err)
    showAsyncError('Lỗi lưu dữ liệu Firebase', err.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  fetchLatestGiaOff()
  await Promise.all([fetchData(), fetchPriceLists()])
  await syncAutoUpdatePriceListsInFirebase()
})
</script>

<style scoped>
.quan-ly-hang-hoa {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(20, 184, 166, 0.15);
  color: #2dd4bf;
  border: 1px solid rgba(20, 184, 166, 0.3);
}

.vat-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
  border: 1px solid rgba(234, 179, 8, 0.3);
  letter-spacing: 0.5px;
}

.duration-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.btn-outline:hover {
  background: rgba(20, 184, 166, 0.1);
  border-color: rgba(20, 184, 166, 0.5);
}

.filters {
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  font-size: 14px;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.6);
  color: #f8fafc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: rgba(20, 184, 166, 0.5);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
  background: rgba(15, 23, 42, 0.8);
}

.search-input::placeholder {
  color: #64748b;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.empty-state {
  grid-column: 1 / -1;
  background: rgba(17, 24, 39, 0.7);
  border: 1px dashed rgba(255,255,255,0.2);
  border-radius: 12px;
  color: #94a3b8;
  padding: 40px;
}

.product-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(20, 184, 166, 0.15);
  border-color: rgba(20, 184, 166, 0.4);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(10px);
}

.product-card:hover .card-actions {
  opacity: 1;
  transform: translateX(0);
}

.card-actions .btn-icon {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.card-actions .btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.card-actions .btn-icon.text-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.card-actions .btn-icon.text-primary:hover {
  background: rgba(20, 184, 166, 0.2);
  color: #5eead4;
  border-color: rgba(20, 184, 166, 0.3);
}

.card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-code {
  font-size: 12px;
  font-family: 'Consolas', monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
  align-self: flex-start;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.product-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #f8fafc;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  letter-spacing: -0.3px;
}

.product-desc {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  line-height: 1.5;
}

.product-supplier {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.mr-1 {
  margin-right: 6px;
  color: #14b8a6;
}

.price-info-box {
  margin-top: auto;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}
.price-info-box p {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 6px;
  font-size: 13px;
  color: #94a3b8;
}
.price-info-box p:last-child {
  margin-bottom: 0;
}
.price-info-box p span {
  font-weight: 700;
  color: #f8fafc;
}
.price-info-box p.highlight {
  color: #14b8a6;
  font-weight: 500;
}
.price-info-box p.highlight span {
  color: #14b8a6;
  font-size: 16px;
  text-shadow: 0 2px 10px rgba(20, 184, 166, 0.2);
}



.text-center { text-align: center; }
.text-muted { color: #64748b; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
}

.text-primary { color: #3b82f6; }
.text-danger { color: #ef4444; }
.btn-icon.text-danger:hover { background: #fee2e2; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  width: 100%;
  max-width: 1100px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  color: #f8fafc;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}

.close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  font-size: 20px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-panel {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.panel-title {
  margin: 0 0 20px 0;
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
  padding-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.panel-icon {
  color: #14b8a6;
}

.panel-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: flex-start;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input, .form-group textarea, .form-group select {
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: #f8fafc;
  transition: all 0.2s;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2);
}

.required {
  color: #ef4444;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== IMPORT MODAL ========== */
.import-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.import-modal {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 20px;
  width: 98vw;
  max-width: 1920px;
  height: 96vh;
  max-height: 98vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 40px rgba(20, 184, 166, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: #f8fafc;
  backdrop-filter: blur(20px);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.import-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.import-modal__header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.import-modal__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(20, 184, 166, 0.4), inset 0 2px 4px rgba(255,255,255,0.3);
}
.import-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}
.import-modal__subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #94a3b8;
}
.import-modal__close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.import-modal__close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Stats */
.import-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px 28px;
}
.import-stat-card {
  position: relative;
  padding: 16px 20px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.import-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.import-stat-card:hover {
  transform: translateY(-4px);
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}
.import-stat-card:hover::before {
  opacity: 1;
}
.import-stat-card__value {
  font-size: 24px;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.import-stat-card__label {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.import-stat-card--blue {
  border-color: rgba(59, 130, 246, 0.2);
}
.import-stat-card--blue .import-stat-card__value { color: #60a5fa; text-shadow: 0 0 15px rgba(96, 165, 250, 0.4); }
.import-stat-card--blue::before { background: linear-gradient(90deg, transparent, #3b82f6, transparent); }

.import-stat-card--amber {
  border-color: rgba(245, 158, 11, 0.2);
}
.import-stat-card--amber .import-stat-card__value { color: #fbbf24; text-shadow: 0 0 15px rgba(251, 191, 36, 0.4); }
.import-stat-card--amber::before { background: linear-gradient(90deg, transparent, #f59e0b, transparent); }

.import-stat-card--green {
  border-color: rgba(16, 185, 129, 0.2);
}
.import-stat-card--green .import-stat-card__value { color: #34d399; font-size: 16px; text-shadow: 0 0 15px rgba(52, 211, 153, 0.4); }
.import-stat-card--green::before { background: linear-gradient(90deg, transparent, #10b981, transparent); }

/* Tabs */
.import-tabs {
  display: flex;
  gap: 12px;
  padding: 0 28px 20px;
  overflow-x: auto;
}
.import-tabs::-webkit-scrollbar { height: 6px; }
.import-tabs::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
.import-tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.5);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.import-tab:hover {
  border-color: rgba(20, 184, 166, 0.5);
  background: rgba(20, 184, 166, 0.1);
  color: #5eead4;
}
.import-tab--active {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}
.import-tab--active:hover {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: white;
  border-color: transparent;
}
.import-tab__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
  font-weight: 700;
  color: #f8fafc;
}
.import-tab--active .import-tab__badge {
  background: rgba(255, 255, 255, 0.25);
}

/* Table Wrapper */
.import-table-wrap {
  flex: 1;
  overflow: auto;
  margin: 0 28px;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.6);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
}
.import-table-wrap::-webkit-scrollbar { width: 10px; height: 10px; }
.import-table-wrap::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 5px; }
.import-table-wrap::-webkit-scrollbar-thumb:hover { background: rgba(20, 184, 166, 0.5); }
.import-table-wrap::-webkit-scrollbar-corner { background: transparent; }

/* Table */
.import-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  white-space: nowrap;
}
.import-table thead {
  position: sticky;
  top: 0;
  z-index: 20;
}
.import-table th {
  padding: 14px 12px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(16px);
  color: #94a3b8;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 1px solid rgba(20, 184, 166, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
  white-space: nowrap;
  position: relative;
}
/* Subtle column dividers in header */
.import-table th:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0; top: 25%; bottom: 25%; width: 1px;
  background: rgba(255, 255, 255, 0.08);
}
.import-table td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.02);
  vertical-align: middle;
  transition: background 0.2s;
}

.import-th--sticky-left {
  position: sticky;
  left: 0;
  z-index: 21;
  background: rgba(15, 23, 42, 0.98);
}
.import-th--idx {
  width: 50px;
  min-width: 50px;
  text-align: center;
  border-right: 1px solid rgba(20, 184, 166, 0.2) !important;
  box-shadow: 4px 0 10px rgba(0,0,0,0.3);
}

.import-row { 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
  position: relative;
}
.import-row:nth-child(even) td { background: rgba(255, 255, 255, 0.015); }
.import-row:hover td { background: rgba(20, 184, 166, 0.06) !important; }
.import-row__idx {
  font-weight: 700;
  font-size: 12px;
  color: #64748b;
  background: rgba(15, 23, 42, 0.95) !important;
  transition: color 0.2s, background 0.2s;
}
.import-row:nth-child(even) .import-row__idx { background: rgba(30, 41, 59, 0.95) !important; }
.import-row:hover .import-row__idx { 
  background: rgba(20, 184, 166, 0.2) !important; 
  color: #5eead4; 
  box-shadow: inset 4px 0 0 #14b8a6;
}

/* Seamless Inputs */
.imp-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  background: rgba(0, 0, 0, 0.2);
  color: #f1f5f9;
  transition: all 0.25s ease;
  outline: none;
  box-sizing: border-box;
}
.imp-input:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
.imp-input:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
  background: rgba(15, 23, 42, 0.95);
  color: #fff;
}
.imp-input--code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  color: #2dd4bf;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.imp-input--num {
  text-align: right;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
  color: #93c5fd;
  font-weight: 500;
}
.imp-input--green {
  color: #34d399 !important;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}
.imp-input--sm {
  text-align: center;
  font-weight: 500;
}
.imp-input--textarea {
  min-height: 20px;
  resize: vertical;
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.15);
}
.imp-input--autofit {
  field-sizing: content;
  overflow-y: hidden;
}
.imp-features-cell {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.imp-input--rich {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
  min-height: 38px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 34px;
  background: rgba(0, 0, 0, 0.15);
}
.imp-features-edit-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(20, 184, 166, 0.35);
  background: rgba(15, 23, 42, 0.85);
  color: #2dd4bf;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}
.imp-features-edit-btn:hover {
  background: rgba(20, 184, 166, 0.25);
  color: #5eead4;
  border-color: #14b8a6;
}
.features-excel-editor :deep(.editor-content) {
  min-height: 160px;
  max-height: 320px;
}

/* Footer */
.import-modal__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.import-btn-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
  padding: 12px 28px;
  border-radius: 10px;
  border: 1px solid rgba(16, 185, 129, 0.5);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3), inset 0 2px 4px rgba(255,255,255,0.2);
  text-transform: uppercase;
}
.import-btn-save:hover {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5), inset 0 2px 4px rgba(255,255,255,0.2);
  transform: translateY(-2px);
  border-color: #34d399;
}
.import-btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ═══ ASYNC RESULT MODAL — VIP PREMIUM ═══ */
.async-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
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

/* ═══ CUSTOM ALERT MODAL ═══ */
.custom-alert-modal {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  padding: 32px 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
  animation: dm-pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes dm-pop-in {
  0% { opacity: 0; transform: scale(0.9) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.alert-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.alert-icon svg {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
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

/* ═══ FOLDER TAB CATEGORY GROUP ═══ */
.folder-header {
  grid-column: 1 / -1;
  margin-top: 32px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
}
.folder-tab {
  background: linear-gradient(135deg, #059669, #10b981); /* Green background */
  border: 1px solid rgba(16, 185, 129, 0.5); /* Matching green border */
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  padding: 8px 24px;
  width: max-content;
  color: #ffffff; /* White text */
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
.folder-body {
  background: linear-gradient(135deg, #059669, #10b981); /* Match tab green */
  border: 1px solid rgba(16, 185, 129, 0.5); /* Match tab border */
  border-radius: 0 12px 12px 12px;
  padding: 14px 24px;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  margin-top: -1px; /* Overlap to hide seam */
}
.folder-title {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

/* ═══ SKELETON LOADING ═══ */
.skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.5s infinite ease-in-out;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.skeleton-card {
  border-color: rgba(255,255,255,0.05) !important;
  box-shadow: none !important;
  pointer-events: none;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  border-radius: 12px;
}

.skeleton-title {
  height: 20px;
  width: 100%;
}

.skeleton-desc {
  height: 14px;
  width: 100%;
  margin-top: 6px;
}

.skeleton-text {
  height: 14px;
  width: 100%;
  margin-top: 6px;
}

.skeleton-price {
  height: 20px;
  width: 60%;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .form-grid-2col, .panel-content {
    grid-template-columns: 1fr;
  }
  .col-span-2 {
    grid-column: 1 / -1;
  }
  .modal-content.large-modal {
    padding-bottom: 80px;
  }
}

/* ═══ PRICE LIST (BẢNG GIÁ) STYLES ═══ */
.btn-pricelist {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
.btn-pricelist:hover {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
  transform: translateY(-1px);
}

.pricelist-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 99px;
  padding: 5px 10px 5px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pricelist-select-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pricelist-select {
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 13.5px;
  font-weight: 600;
  padding: 6px 24px 6px 4px;
  cursor: pointer;
  outline: none;
  min-width: 220px;
}
.pricelist-select option {
  background: #0f172a;
  color: #f8fafc;
  padding: 8px;
}

.pricelist-period-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 600;
  background: rgba(56, 189, 248, 0.12);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.pricelist-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
}
.pricelist-status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.pricelist-status-badge.upcoming {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.35);
}
.pricelist-status-badge.expired {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.pricelist-rule-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.pricelist-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.pricelist-action-btn.edit {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
}
.pricelist-action-btn.edit:hover {
  background: rgba(56, 189, 248, 0.25);
}
.pricelist-action-btn.export {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}
.pricelist-action-btn.export:hover {
  background: rgba(16, 185, 129, 0.25);
}
.pricelist-action-btn.delete {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
  padding: 5px 8px;
}
.pricelist-action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.25);
}

.pl-card-diff-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 99px;
  font-size: 10.5px;
  font-weight: 700;
}
.pl-card-diff-badge.up {
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.pl-card-diff-badge.down {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}
.pl-card-diff-badge.neutral {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.pricelist-modal {
  max-width: 96vw !important;
  width: 1500px !important;
  height: 92vh !important;
}

.pl-config-section {
  display: grid;
  grid-template-columns: 1.25fr 1.25fr;
  gap: 14px;
  padding: 14px 20px;
  background: #0b1120;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
@media (max-width: 1100px) {
  .pl-config-section {
    grid-template-columns: 1fr;
  }
}

.pl-config-card {
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 16px;
}
.pl-config-card--highlight {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.75));
  border-color: rgba(245, 158, 11, 0.3);
}

.pl-config-card__title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 700;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 10px;
}

.pl-config-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 10px;
}
.pl-config-grid--4 {
  grid-template-columns: 1.3fr 1fr 1fr 1.2fr;
}
@media (max-width: 900px) {
  .pl-config-grid--4 {
    grid-template-columns: 1fr 1fr;
  }
}

.pl-bulk-controls {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.pl-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pl-field label {
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 600;
}

.pl-input, .pl-select {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 7px;
  color: #f8fafc;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.pl-input:focus, .pl-select:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
}
.pl-select--up {
  color: #34d399;
  font-weight: 700;
}
.pl-select--down {
  color: #fbbf24;
  font-weight: 700;
}

.pl-bulk-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-apply-btn {
  padding: 8px 13px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}
.pl-apply-btn--selected {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.25);
}
.pl-apply-btn--selected:hover {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  transform: translateY(-1px);
}
.pl-apply-btn--filtered {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
}
.pl-apply-btn--filtered:hover {
  background: rgba(16, 185, 129, 0.25);
}

.pl-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 20px;
  background: #111827;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.pl-filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
}

.pl-filter-select, .pl-filter-input {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 7px;
  color: #f8fafc;
  padding: 6px 11px;
  font-size: 12.5px;
  outline: none;
}
.pl-filter-input {
  width: 100%;
  padding-right: 28px;
  box-sizing: border-box;
}
.pl-filter-select:focus, .pl-filter-input:focus {
  border-color: #38bdf8;
}

.pl-view-tabs {
  display: inline-flex;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  padding: 2px;
}
.pl-view-tab {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s;
}
.pl-view-tab.active {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}

.pl-selection-btns {
  display: flex;
  gap: 8px;
}
.pl-mini-btn {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #60a5fa;
  padding: 5px 11px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.pl-mini-btn:hover {
  background: rgba(59, 130, 246, 0.25);
}
.pl-mini-btn--muted {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.25);
  color: #94a3b8;
}
.pl-mini-btn--muted:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.pl-row-selected {
  background: rgba(16, 185, 129, 0.05) !important;
}

.pl-row-adjust {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pl-row-select {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 5px;
  color: #e2e8f0;
  padding: 4px 6px;
  font-size: 11.5px;
  font-weight: 600;
  outline: none;
}
.pl-row-select.up {
  color: #34d399;
}
.pl-row-select.down {
  color: #fbbf24;
}

.pl-diff-up {
  color: #34d399;
  font-weight: 700;
}
.pl-diff-down {
  color: #fbbf24;
  font-weight: 700;
}
.pl-diff-zero {
  color: #64748b;
}

.pricelist-autosync-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.pricelist-autosync-btn.on {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.4);
}
.pricelist-autosync-btn.on:hover {
  background: rgba(16, 185, 129, 0.26);
}
.pricelist-autosync-btn.off {
  background: rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.35);
}
.pricelist-autosync-btn.off:hover {
  background: rgba(148, 163, 184, 0.24);
}

.pl-autosync-box {
  margin-top: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px dashed rgba(148, 163, 184, 0.3);
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: all 0.2s;
}
.pl-autosync-box.active {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.pl-autosync-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.pl-autosync-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #10b981;
  cursor: pointer;
}
.pl-autosync-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #e2e8f0;
}
.pl-autosync-box.active .pl-autosync-title {
  color: #34d399;
}
.pl-autosync-hint {
  font-size: 11px;
  color: #94a3b8;
  padding-left: 24px;
}
</style>
