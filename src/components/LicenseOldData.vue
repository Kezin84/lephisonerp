<template>
  <div class="license-page-wrapper">
    <div class="license-container">
      <div class="header-section">
        <h2>MANAGE LICENSES</h2>
        
      </div>

      <div class="search-card">
        <div class="search-wrapper">
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Tìm kiếm theo Tên khách hàng, License ID, Sản phẩm..." 
              class="license-input"
            />
          </div>
          <button class="btn-search" @click="fetchData" :disabled="loading">
            <span v-if="loading" class="spinner-small"></span>
            <span v-else>Làm mới</span>
          </button>
          <button class="btn-import" @click="showImportModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Quét Ảnh (OCR)
          </button>
          <button class="btn-import pdf-btn" @click="showPdfModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Nhập File PDF
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar-container">
        <div class="master-date-filter-box">
          <div class="master-date-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Mốc tính toán:</span>
          </div>

          <div class="master-date-tabs">
            <button :class="{ active: filterMode === 'day' }" @click="filterMode = 'day'">Ngày</button>
            <button :class="{ active: filterMode === 'week' }" @click="filterMode = 'week'">Tuần</button>
            <button :class="{ active: filterMode === 'month' }" @click="filterMode = 'month'">Tháng</button>
            <button :class="{ active: filterMode === 'year' }" @click="filterMode = 'year'">Năm</button>
            <button :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">Tất cả</button>
          </div>

          <template v-if="filterMode !== 'all'">
            <input class="master-date-input" v-if="filterMode === 'day'" type="date" v-model="filterDate" />
            <input class="master-date-input" v-else-if="filterMode === 'week'" type="week" v-model="filterWeek" />
            <input class="master-date-input" v-else-if="filterMode === 'month'" type="month" v-model="filterMonth" />
            <div class="master-date-year-picker" v-else-if="filterMode === 'year'">
              <button @click="filterYear--">&#9664;</button>
              <span>Năm {{ filterYear }}</span>
              <button @click="filterYear++">&#9654;</button>
            </div>
          </template>
        </div>
      </div>

      <!-- Status & Time Filters -->
      <div class="filter-group-container">
        <div class="filter-item">
          <span class="filter-label">Thời hạn:</span>
          <div class="filter-controls">
            <select v-model="filterExpirationStatus" class="form-control filter-select">
              <option value="all">Tất cả</option>
              <option value="active">Còn hạn</option>
              <option value="expired">Quá hạn</option>
            </select>
            <select v-model="filterExpirationMonths" class="form-control filter-select" :disabled="filterExpirationStatus === 'all'">
              <option value="all">Bất kỳ</option>
              <option v-for="i in 12" :key="'exp'+i" :value="i">< {{i}} tháng</option>
            </select>
          </div>
        </div>

        <div class="filter-item">
          <span class="filter-label">Hiệu lực:</span>
          <div class="filter-controls">
            <select v-model="filterGraceStatus" class="form-control filter-select">
              <option value="all">Tất cả</option>
              <option value="active">Còn hiệu lực</option>
              <option value="expired">Quá hiệu lực</option>
            </select>
            <select v-model="filterGraceMonths" class="form-control filter-select" :disabled="filterGraceStatus === 'all'">
              <option value="all">Bất kỳ</option>
              <option v-for="i in 12" :key="'grc'+i" :value="i">< {{i}} tháng</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Attribute Filters -->
      <div class="filter-group-container">
        <div class="filter-item">
          <span class="filter-label">Nhà sản xuất:</span>
          <div class="filter-controls">
            <select v-model="filterNhaSanXuat" class="form-control filter-select" style="min-width: 180px;">
              <option value="all">Tất cả</option>
              <option v-for="item in uniqueNhaSanXuat" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
        </div>

        <div class="filter-item">
          <span class="filter-label">Khách hàng:</span>
          <div class="filter-controls">
            <select v-model="filterCustomer" class="form-control filter-select" style="min-width: 180px;">
              <option value="all">Tất cả</option>
              <option v-for="item in uniqueCustomer" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar" v-if="!loading && baseData.length > 0">
        <div class="stat-card" @click="setQuickFilter('all')" :class="{ active: quickFilter === 'all' && filterExpirationStatus === 'all' && filterGraceStatus === 'all' }">
          <div class="stat-icon" style="color: #22d3ee; background: rgba(34,211,238,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="stat-value">{{ baseData.length }}</div>
          <div class="stat-label">Tổng cộng</div>
        </div>
        <div class="stat-card" @click="setQuickFilter('con_han')" :class="{ active: filterExpirationStatus === 'active' }">
          <div class="stat-icon" style="color: #10b981; background: rgba(16,185,129,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="stat-value">{{ baseData.filter(i => { const d = parseDateForCalc(i.EXPIRATION_TIME); return d && d.getTime() >= targetCalcDate.getTime(); }).length }}</div>
          <div class="stat-label">Còn hạn</div>
        </div>
        <div class="stat-card" @click="setQuickFilter('qua_han')" :class="{ active: filterExpirationStatus === 'expired' }">
          <div class="stat-icon" style="color: #ef4444; background: rgba(239,68,68,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div class="stat-value">{{ baseData.filter(i => { const d = parseDateForCalc(i.EXPIRATION_TIME); return d && d.getTime() < targetCalcDate.getTime(); }).length }}</div>
          <div class="stat-label">Quá hạn</div>
        </div>
        <div class="stat-card" @click="setQuickFilter('con_hieu_luc')" :class="{ active: filterGraceStatus === 'active' }">
          <div class="stat-icon" style="color: #34d399; background: rgba(52,211,153,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="stat-value">{{ baseData.filter(i => { const d = parseDateForCalc(i.SO_NGAY_HIEU_LUC); return d && d.getTime() >= targetCalcDate.getTime(); }).length }}</div>
          <div class="stat-label">Còn hiệu lực</div>
        </div>
        <div class="stat-card" @click="setQuickFilter('qua_hieu_luc')" :class="{ active: filterGraceStatus === 'expired' }">
          <div class="stat-icon" style="color: #f87171; background: rgba(248,113,113,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="stat-value">{{ baseData.filter(i => { const d = parseDateForCalc(i.SO_NGAY_HIEU_LUC); return d && d.getTime() < targetCalcDate.getTime(); }).length }}</div>
          <div class="stat-label">Quá hiệu lực</div>
        </div>
        <div class="stat-card" @click="setQuickFilter('da_xu_ly')" :class="{ active: quickFilter === 'processed' }">
          <div class="stat-icon" style="color: #60a5fa; background: rgba(96,165,250,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          </div>
          <div class="stat-value">{{ baseData.filter(i => i.IS_GIA_HAN === 'Đã gia hạn' || i.is_gia_han === 'Đã gia hạn').length }}</div>
          <div class="stat-label">Đã xử lý</div>
        </div>
      </div>

      <!-- Card Grid -->
      <div v-if="loading" class="loading-state">
        <div class="spinner-small" style="margin: 0 auto;"></div>
        <div style="margin-top: 10px; color: #94a3b8;">Đang tải dữ liệu...</div>
      </div>
      <div v-else-if="filteredData.length === 0" class="empty-state">
        Không tìm thấy dữ liệu.
      </div>
      <div v-else class="license-grid">
        <template v-for="(groupItems, customer) in groupedData" :key="customer">
          <!-- Folder Header -->
          <div class="folder-header">
            <div class="folder-tab">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span>SỐ LƯỢNG: {{ groupItems.length }}</span>
            </div>
            <div class="folder-body">
              <h3 class="folder-title" :title="customer">{{ customer }}</h3>
            </div>
          </div>
          
          <div class="license-card" v-for="(item, index) in groupItems" :key="item.ROW_INDEX || index" @click="openEditModal(item)" :style="{ animationDelay: (index % 20) * 0.04 + 's' }">
            <!-- Glow accent top -->
            <div class="card-glow" :class="getRemainingTimeBadgeClass(item.EXPIRATION_TIME)"></div>
            
            <div class="card-inner">
              <!-- Left: Image Preview -->
              <div class="card-preview">
                <a v-if="item.LINK_FILE" :href="item.LINK_FILE" target="_blank" class="card-img-link" :title="item.NAME_FILE" @click.stop>
                  <img :src="getPreviewUrl(item.LINK_FILE)" alt="License" class="card-img" />
                </a>
                <div v-else class="card-img-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
              </div>
  
              <!-- Right: Info -->
              <div class="card-info">
                <div class="card-info-top">
                  <span class="product-badge" style="display: flex; align-items: center; gap: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span v-html="highlightMatch(item.LICENSE_ID || 'Chưa có ID', searchQuery)"></span>
                  </span>
                </div>
                
                <h3 class="customer-name" style="margin-bottom: 6px; line-height: 1.4;" v-html="highlightMatch(item.PRODUCT_NAME || 'Sản phẩm ẩn danh', searchQuery)"></h3>
                
                <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                      <span v-if="item.PRODUCT_CODE" class="meta-tag code">{{ item.PRODUCT_CODE }}</span>
                      <span v-if="item.NHA_SAN_XUAT" class="meta-tag nsx-badge" :style="getNsxStyle(item.NHA_SAN_XUAT)">{{ item.NHA_SAN_XUAT }}</span>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;" v-if="item.LICENSE_TYPE">
                      <span class="meta-tag" style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3);">{{ item.LICENSE_TYPE }}</span>
                    </div>
                  </div>
                  <p class="customer-subtitle" style="color: #94a3b8; font-size: 0.95rem; margin: 0; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span v-html="highlightMatch(item.CUSTOMER || 'Khách hàng ẩn danh', searchQuery)"></span>
                  </p>
                </div>
  
                <div class="info-grid-3">
                  <div class="info-item">
                    <span class="info-label">NGÀY CẤP</span>
                    <span class="info-value">{{ item.DATE_OF_LICENSE || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">HẾT HẠN</span>
                    <span class="info-value" :class="{ 'text-danger': getRemainingTimeBadgeClass(item.EXPIRATION_TIME) === 'badge-danger' }">{{ item.EXPIRATION_TIME || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">CÒN LẠI</span>
                    <span class="info-value" :class="getRemainingTimeBadgeClass(item.EXPIRATION_TIME) === 'badge-danger' ? 'text-danger' : getRemainingTimeBadgeClass(item.EXPIRATION_TIME) === 'badge-warning' ? 'text-warning' : 'text-success'">{{ getRemainingTimeText(item.EXPIRATION_TIME) || '-' }}</span>
                  </div>
                </div>
  
                <div class="info-grid-3b">
                  <!-- LOẠI và SỐ LƯỢNG đã được ẩn/di chuyển theo yêu cầu -->
                  <div class="info-item">
                    <span class="info-label">HIỆU LỰC</span>
                    <span class="info-value" :style="{ color: getHieuLucColor(item.SO_NGAY_HIEU_LUC) }">{{ getHieuLucText(item.SO_NGAY_HIEU_LUC) }}</span>
                  </div>
                </div>
  
                <!-- LOCALIZATION đã được ẩn theo yêu cầu -->
  
                <div class="card-gia-han" v-if="!(item.IS_GIA_HAN || item.is_gia_han)">
                  <button 
                    class="btn-gia-han chua-gia-han" 
                    @click.stop="setGiaHan(item, 'Không gia hạn')"
                    :disabled="item._toggling"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    Không gia hạn
                  </button>
                  <button 
                    class="btn-gia-han da-gia-han" 
                    @click.stop="setGiaHan(item, 'Đã gia hạn')"
                    :disabled="item._toggling"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Đã gia hạn
                  </button>
                </div>
                <div class="card-gia-han" v-else style="display: flex; align-items: center; justify-content: space-between;">
                  <span v-if="(item.IS_GIA_HAN || item.is_gia_han) === 'Đã gia hạn'" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 5px 10px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Đã gia hạn
                  </span>
                  <span v-else-if="(item.IS_GIA_HAN || item.is_gia_han) === 'Không gia hạn'" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 5px 10px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    Không gia hạn
                  </span>
                  <span v-else style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 5px 10px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">
                    {{ item.IS_GIA_HAN || item.is_gia_han }}
                  </span>
                  
                  <button @click.stop="setGiaHan(item, '')" :disabled="item._toggling" style="background: transparent; border: none; color: #94a3b8; font-size: 0.72rem; text-decoration: underline; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#f8fafc'" onmouseout="this.style.color='#94a3b8'">
                    Hoàn tác
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- NÚT XEM THÊM -->
        <button v-if="totalGroupsCount > displayLimit" 
                @click="displayLimit += 15" 
                style="grid-column: 1 / -1; margin-top: 20px; padding: 14px; background: rgba(56, 189, 248, 0.1); border: 1px dashed rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.background='rgba(56, 189, 248, 0.2)';" 
                onmouseout="this.style.background='rgba(56, 189, 248, 0.1)';">
          <i class="lucide-chevron-down" style="font-size: 14px; margin-right: 4px;"></i> 
          Xem thêm (còn {{ totalGroupsCount - displayLimit }} nhóm khách hàng)
        </button>
      </div>
    </div>
    <ImportLicenseModal 
      v-if="showImportModal" 
      @close="showImportModal = false" 
      @import-success="fetchData" 
    />
    <ImportPDFModal 
      v-if="showPdfModal" 
      @close="showPdfModal = false" 
      @import-success="fetchData" 
    />
    
    <!-- Edit Modal -->
    <div class="modal-overlay" v-if="selectedCard" @click.self="selectedCard = null">
      <div class="modal-container">
        <div class="modal-header">
          <h3 style="margin: 0;">Chỉnh sửa Mặt Hàng</h3>
          <button class="btn-close" @click="selectedCard = null">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <h4 class="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Thông Tin Chung
            </h4>
            <div class="form-row">
              <div class="form-group">
                <label>License ID</label>
                <input type="text" v-model="selectedCard.LICENSE_ID" class="form-control" />
              </div>
              <div class="form-group">
                <label>Product Code</label>
                <input type="text" v-model="selectedCard.PRODUCT_CODE" class="form-control" />
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label>Khách Hàng</label>
              <textarea v-model="selectedCard.CUSTOMER" class="form-control" rows="2"></textarea>
            </div>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label>Sản Phẩm</label>
              <textarea v-model="selectedCard.PRODUCT_NAME" class="form-control" rows="2"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Số Lượng (Volume)</label>
                <input type="text" v-model="selectedCard.LICENSE_VOLUME" class="form-control" />
              </div>
              <div class="form-group">
                <label>Loại License</label>
                <input type="text" v-model="selectedCard.LICENSE_TYPE" class="form-control" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Localization</label>
                <input type="text" v-model="selectedCard.LOCALIZATION" class="form-control" />
              </div>
              <div class="form-group">
                <label>Nhà Sản Xuất</label>
                <input type="text" v-model="selectedCard.NHA_SAN_XUAT" class="form-control" />
              </div>
            </div>
            <div class="form-group">
              <label>Mô tả (Description)</label>
              <textarea v-model="selectedCard.LICENSE_DESCRIPTION" class="form-control" rows="2"></textarea>
            </div>
          </div>

          <div class="modal-section">
            <h4 class="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Thời Gian & Hiệu Lực
            </h4>
            <div class="form-row">
              <div class="form-group">
                <label>Ngày Cấp (Date)</label>
                <input type="text" v-model="selectedCard.DATE_OF_LICENSE" class="form-control" />
              </div>
              <div class="form-group">
                <label>Hết Hạn (Expiration)</label>
                <input type="text" v-model="selectedCard.EXPIRATION_TIME" class="form-control" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Trạng thái gia hạn</label>
                <select v-model="selectedCard.IS_GIA_HAN" class="form-control">
                  <option value="">Chưa có / Trống</option>
                  <option value="Không gia hạn">Không gia hạn</option>
                  <option value="Đã gia hạn">Đã gia hạn</option>
                </select>
              </div>
              <div class="form-group">
                <label>Số ngày hiệu lực (sau hết hạn)</label>
                <input type="number" v-model="editGraceDays" class="form-control" placeholder="VD: 10" />
                <small v-if="editGraceDays && selectedCard.EXPIRATION_TIME" style="color: #fbbf24; margin-top: 4px;">→ Hiệu lực đến: {{ calcGraceDate(selectedCard.EXPIRATION_TIME, editGraceDays) }}</small>
              </div>
            </div>
          </div>

          <div class="modal-section" style="margin-bottom: 0;">
            <h4 class="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Tập Tin Đính Kèm
            </h4>
            <div class="form-row">
              <div class="form-group">
                <label>Tên File Gốc</label>
                <input type="text" v-model="selectedCard.NAME_FILE" class="form-control" />
              </div>
              <div class="form-group">
                <label>Link File Gốc</label>
                <input type="text" v-model="selectedCard.LINK_FILE" class="form-control" />
              </div>
            </div>
          </div>

          <div v-if="editErrorMsg" class="error-msg">{{ editErrorMsg }}</div>
        </div>
        <div class="modal-footer" style="justify-content: space-between;">
          <button class="btn-danger" @click="deleteCard" :disabled="saving || deleting">
            <span v-if="deleting" class="spinner-small"></span>
            <span v-else>Xóa Mặt Hàng</span>
          </button>
          <div style="display:flex; gap: 12px;">
            <button class="btn-secondary" @click="selectedCard = null">Hủy</button>
            <button v-if="hasChanges" class="btn-primary" @click="updateCard" :disabled="saving || deleting">
              <span v-if="saving" class="spinner-small"></span>
              <span v-else>Lưu Thay Đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <AsyncConfirmModal
      :show="asyncModal.show"
      :type="asyncModal.type"
      :title="asyncModal.title"
      :msg="asyncModal.msg"
      :confirmText="asyncModal.confirmText"
      :cancelText="asyncModal.cancelText"
      @close="asyncModal.show = false"
      @confirm="handleAsyncConfirm"
      @cancel="handleAsyncCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ImportLicenseModal from './ImportLicenseModal.vue'
import ImportPDFModal from './ImportPDFModal.vue'
import AsyncConfirmModal from './AsyncConfirmModal.vue'

const asyncModal = ref({ show: false, type: 'confirm', title: '', msg: '', confirmText: 'Đồng ý', cancelText: 'Hủy' })
let confirmResolve = null
const confirmAction = (title, msg, confirmText) => {
  return new Promise((resolve) => {
    asyncModal.value = { show: true, type: 'confirm', title, msg, confirmText, cancelText: 'Hủy' }
    confirmResolve = resolve
  })
}
const handleAsyncConfirm = () => {
  if (confirmResolve) confirmResolve(true)
}
const handleAsyncCancel = () => {
  if (confirmResolve) confirmResolve(false)
  asyncModal.value.show = false
}

const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const searchQuery = ref('')
const loading = ref(false)
const showImportModal = ref(false)
const showPdfModal = ref(false)
const rawData = ref([])
const filterMode = ref('all')
const filterDate = ref(getTodayStr())
const filterWeek = ref(getWeekString(new Date()))
const filterMonth = ref(getThisMonthStr())
const filterYear = ref(new Date().getFullYear())

const filterExpirationStatus = ref('all')
const filterExpirationMonths = ref('all')
const filterGraceStatus = ref('all')
const filterGraceMonths = ref('all')
const filterNhaSanXuat = ref('all')
const filterCustomer = ref('all')
const quickFilter = ref('all')

const uniqueNhaSanXuat = computed(() => {
  const set = new Set(rawData.value.map(i => i.NHA_SAN_XUAT || i.nha_san_xuat).filter(Boolean));
  return Array.from(set).sort();
})

const uniqueCustomer = computed(() => {
  const set = new Set(rawData.value.map(i => i.CUSTOMER).filter(Boolean));
  return Array.from(set).sort();
})

const setQuickFilter = (type) => {
  filterExpirationStatus.value = 'all'
  filterExpirationMonths.value = 'all'
  filterGraceStatus.value = 'all'
  filterGraceMonths.value = 'all'
  filterNhaSanXuat.value = 'all'
  filterCustomer.value = 'all'
  quickFilter.value = 'all'

  if (type === 'con_han') filterExpirationStatus.value = 'active'
  else if (type === 'qua_han') filterExpirationStatus.value = 'expired'
  else if (type === 'con_hieu_luc') filterGraceStatus.value = 'active'
  else if (type === 'qua_hieu_luc') filterGraceStatus.value = 'expired'
  else if (type === 'da_xu_ly') quickFilter.value = 'processed'
}

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getThisMonthStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getWeekString(d) {
  const date = new Date(d.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function getWeekDateRange(weekStr) {
  if (!weekStr) return null;
  const parts = weekStr.split('-W');
  if (parts.length !== 2) return null;
  const [year, week] = parts.map(Number);
  const d = new Date(year, 0, 4);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1 + (week - 1) * 7);
  const start = new Date(d); start.setHours(0, 0, 0, 0);
  const end = new Date(d); end.setDate(end.getDate() + 6); end.setHours(23, 59, 59, 999);
  return { start, end };
}

const getFilterRange = () => {
  if (filterMode.value === 'all') return null
  if (filterMode.value === 'day') {
    const d = new Date(filterDate.value); d.setHours(0,0,0,0)
    const end = new Date(d); end.setHours(23,59,59,999)
    return { start: d, end }
  }
  if (filterMode.value === 'week') {
    return getWeekDateRange(filterWeek.value)
  }
  if (filterMode.value === 'month') {
    const [y, m] = filterMonth.value.split('-')
    const start = new Date(Number(y), Number(m) - 1, 1)
    const end = new Date(Number(y), Number(m), 0); end.setHours(23,59,59,999)
    return { start, end }
  }
  if (filterMode.value === 'year') {
    const y = Number(filterYear.value)
    return { start: new Date(y, 0, 1), end: new Date(y, 11, 31, 23, 59, 59, 999) }
  }
  return null
}

const setFilterCurrent = () => {
  if (filterMode.value === 'day') filterDate.value = getTodayStr()
  else if (filterMode.value === 'week') filterWeek.value = getWeekString(new Date())
  else if (filterMode.value === 'month') filterMonth.value = getThisMonthStr()
  else if (filterMode.value === 'year') filterYear.value = new Date().getFullYear()
}

const setFilterPrev = () => {
  const d = new Date()
  if (filterMode.value === 'day') {
    d.setDate(d.getDate() - 1)
    filterDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } else if (filterMode.value === 'week') {
    d.setDate(d.getDate() - 7)
    filterWeek.value = getWeekString(d)
  } else if (filterMode.value === 'month') {
    d.setMonth(d.getMonth() - 1)
    filterMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  } else if (filterMode.value === 'year') {
    filterYear.value = new Date().getFullYear() - 1
  }
}

const isFilterCurrent = computed(() => {
  if (filterMode.value === 'day') return filterDate.value === getTodayStr()
  if (filterMode.value === 'week') return filterWeek.value === getWeekString(new Date())
  if (filterMode.value === 'month') return filterMonth.value === getThisMonthStr()
  if (filterMode.value === 'year') return filterYear.value === new Date().getFullYear()
  return false
})

const isFilterPrev = computed(() => {
  const d = new Date()
  if (filterMode.value === 'day') {
    d.setDate(d.getDate() - 1)
    return filterDate.value === `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  if (filterMode.value === 'week') {
    d.setDate(d.getDate() - 7)
    return filterWeek.value === getWeekString(d)
  }
  if (filterMode.value === 'month') {
    d.setMonth(d.getMonth() - 1)
    return filterMonth.value === `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  if (filterMode.value === 'year') return filterYear.value === new Date().getFullYear() - 1
  return false
})

const selectedCard = ref(null)
const originalCard = ref(null)
const saving = ref(false)
const deleting = ref(false)
const editErrorMsg = ref('')
const editGraceDays = ref('')
const originalGraceDays = ref('')

const calcGraceDate = (expirationTime, days) => {
  const d = parseDate(expirationTime)
  if (!d || isNaN(d.getTime()) || !days) return ''
  d.setDate(d.getDate() + parseInt(days))
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

const getNsxStyle = (nsx) => {
  if (!nsx) return {}
  const name = nsx.toString().toLowerCase()
  if (name.includes('sophos')) {
    return { background: '#ffffff', color: '#1d4ed8', borderColor: '#1d4ed8', fontWeight: 'bold' }
  }
  if (name.includes('kaspersky')) {
    return { background: '#16a34a', color: '#ffffff', borderColor: '#16a34a', fontWeight: 'bold' }
  }
  if (name.includes('acronis')) {
    return { background: '#1e3a8a', color: '#ffffff', borderColor: '#1e3a8a', fontWeight: 'bold' }
  }
  if (name.includes('delinea')) {
    return { background: '#9333ea', color: '#ffffff', borderColor: '#9333ea', fontWeight: 'bold' }
  }
  return {}
}

const openEditModal = (item) => {
  selectedCard.value = JSON.parse(JSON.stringify(item)) // Clone
  originalCard.value = JSON.parse(JSON.stringify(item)) // Clone
  editErrorMsg.value = ''
  
  if (item.SO_NGAY_HIEU_LUC && item.EXPIRATION_TIME) {
    const dGrace = parseDate(item.SO_NGAY_HIEU_LUC)
    const dExp = parseDate(item.EXPIRATION_TIME)
    if (dGrace && !isNaN(dGrace.getTime()) && dExp && !isNaN(dExp.getTime())) {
      const diffTime = dGrace.getTime() - dExp.getTime()
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24))
      editGraceDays.value = diffDays > 0 ? diffDays : ''
    } else {
      editGraceDays.value = ''
    }
  } else {
    editGraceDays.value = ''
  }
  originalGraceDays.value = editGraceDays.value
}

const hasChanges = computed(() => {
  if (!selectedCard.value || !originalCard.value) return false;
  if (editGraceDays.value !== originalGraceDays.value) return true;
  return Object.keys(originalCard.value).some(key => {
    return selectedCard.value[key] !== originalCard.value[key];
  });
})

const setGiaHan = async (item, newVal) => {
  if (item.IS_GIA_HAN === newVal) return // already set
  item._toggling = true
  try {
    const payload = {
      sheet: 'license_old_data',
      action: 'update',
      ...item,
      IS_GIA_HAN: newVal
    }
    delete payload._toggling
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(r => r.json())
    if (res.status === 'success') {
      item.IS_GIA_HAN = newVal
    }
  } catch(e) {
    console.error('Lỗi set gia hạn:', e)
  } finally {
    item._toggling = false
  }
}

const updateCard = async () => {
  const userConfirmed = await confirmAction('Lưu thay đổi', 'Bạn có chắc chắn muốn lưu các thay đổi này?', 'Lưu');
  if (!userConfirmed) return;

  saving.value = true
  editErrorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang cập nhật thông tin...' }
  try {
    // Nếu có nhập số ngày hiệu lực, tính ra ngày cụ thể
    if (editGraceDays.value && selectedCard.value.EXPIRATION_TIME) {
      selectedCard.value.SO_NGAY_HIEU_LUC = calcGraceDate(selectedCard.value.EXPIRATION_TIME, editGraceDays.value)
    }
    const payload = {
      sheet: 'license_old_data',
      action: 'update',
      ...selectedCard.value
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(r => r.json())
    
    if (res.status === 'success') {
      const idx = rawData.value.findIndex(r => r.ROW_INDEX === selectedCard.value.ROW_INDEX)
      if (idx !== -1) {
        rawData.value[idx] = { ...selectedCard.value }
      }
      selectedCard.value = null
      asyncModal.value = { show: true, type: 'success', title: 'Thành công!', msg: 'Đã lưu thay đổi' }
      setTimeout(() => asyncModal.value.show = false, 1500)
    } else {
      editErrorMsg.value = res.message || 'Lỗi cập nhật'
      asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
    }
  } catch(e) {
    editErrorMsg.value = 'Lỗi kết nối mạng'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
  } finally {
    saving.value = false
  }
}

const deleteCard = async () => {
  const userConfirmed = await confirmAction('Xóa mặt hàng', 'Bạn có chắc chắn muốn xóa mặt hàng này khỏi cơ sở dữ liệu?', 'Xóa');
  if (!userConfirmed) return;

  deleting.value = true
  editErrorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang xóa mặt hàng...' }
  try {
    const payload = {
      sheet: 'license_old_data',
      action: 'delete',
      ROW_INDEX: selectedCard.value.ROW_INDEX
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(r => r.json())
    
    if (res.status === 'success') {
      rawData.value = rawData.value.filter(r => r.ROW_INDEX !== selectedCard.value.ROW_INDEX)
      selectedCard.value = null
      asyncModal.value = { show: true, type: 'success', title: 'Thành công!', msg: 'Đã xóa mặt hàng' }
      setTimeout(() => asyncModal.value.show = false, 1500)
    } else {
      editErrorMsg.value = res.message || 'Lỗi khi xóa'
      asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
    }
  } catch(e) {
    editErrorMsg.value = 'Lỗi kết nối mạng'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
  } finally {
    deleting.value = false
  }
}

const removeDiacritics = (str) => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

const normalizeForSearch = (str) => {
  if (!str) return '';
  return removeDiacritics(String(str))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const escapeHtml = (unsafe) => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const highlightMatch = (text, query) => {
  if (!query || !text) return escapeHtml(text);
  
  const normQuery = normalizeForSearch(query);
  if (!normQuery) return escapeHtml(text);

  const originalStr = String(text);
  let matchStartIndex = -1;
  let matchEndIndex = -1;
  
  for (let i = 0; i < originalStr.length; i++) {
    let currentNormMatch = '';
    let j = i;
    while (j < originalStr.length && currentNormMatch.length < normQuery.length) {
       const cNorm = normalizeForSearch(originalStr[j]);
       if (cNorm) {
         currentNormMatch += cNorm;
       }
       j++;
    }
    
    if (currentNormMatch === normQuery) {
       matchStartIndex = i;
       matchEndIndex = j;
       break;
    }
  }

  if (matchStartIndex !== -1) {
    const before = originalStr.substring(0, matchStartIndex);
    const match = originalStr.substring(matchStartIndex, matchEndIndex);
    const after = originalStr.substring(matchEndIndex);
    return `${escapeHtml(before)}<mark style="background-color: #fef08a; color: #854d0e; padding: 0 2px; border-radius: 2px;">${escapeHtml(match)}</mark>${escapeHtml(after)}`;
  }
  
  return escapeHtml(text);
}

const formatDisplayDate = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;
  
  const d = new Date(str);
  if (!isNaN(d.getTime()) && (str.includes('-') || str.includes('T'))) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return str;
}

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = String(dateStr).split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
}

const parseDateForCalc = (dateStr) => {
  if (!dateStr) return null;
  const d = parseDate(dateStr);
  if (!d || isNaN(d.getTime())) return null;
  return d;
}

const targetCalcDate = computed(() => {
  const range = getFilterRange();
  if (range && range.end) {
    const d = new Date(range.end);
    d.setHours(0,0,0,0);
    return d;
  }
  const d = new Date();
  d.setHours(0,0,0,0);
  return d;
})

const getRemainingDays = (expirationTime) => {
  if (!expirationTime) return null;
  const expDate = parseDate(expirationTime);
  if (!expDate || isNaN(expDate.getTime())) return null;
  
  const now = targetCalcDate.value;
  
  const diffTime = expDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const getRemainingTimeText = (expirationTime) => {
  if (!expirationTime) return '';
  const expDate = parseDate(expirationTime);
  if (!expDate || isNaN(expDate.getTime())) return '';
  
  const range = getFilterRange();
  if (!range) {
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diff < 0) return `Quá hạn ${Math.abs(diff)} ngày`;
    if (diff === 0) return 'Hết hạn hôm nay';
    return `Còn ${diff} ngày`;
  }

  const diffStart = expDate.getTime() - range.start.getTime();
  const daysLeftStart = Math.ceil(diffStart / (1000 * 3600 * 24));
  
  const diffEnd = expDate.getTime() - range.end.getTime();
  const daysLeftEnd = Math.ceil(diffEnd / (1000 * 3600 * 24));
  
  if (filterMode.value === 'day') {
    if (daysLeftEnd < 0) return `Quá hạn ${Math.abs(daysLeftEnd)} ngày`;
    if (daysLeftEnd === 0) return 'Hết hạn hôm nay';
    return `Còn ${daysLeftEnd} ngày`;
  } else {
    if (daysLeftStart < 0 && daysLeftEnd < 0) {
      return `Quá hạn ${Math.abs(daysLeftStart)} - ${Math.abs(daysLeftEnd)} ngày`;
    } else if (daysLeftStart >= 0 && daysLeftEnd >= 0) {
      return `Còn ${daysLeftEnd} - ${daysLeftStart} ngày`;
    } else {
      return `Còn ${daysLeftStart} ngày -> Quá hạn ${Math.abs(daysLeftEnd)} ngày`;
    }
  }
}

const getRemainingTimeBadgeClass = (expirationTime) => {
  const days = getRemainingDays(expirationTime);
  if (days === null) return '';
  if (days < 0) return 'badge-danger';
  if (days <= 30) return 'badge-warning';
  return 'badge-success';
}

const getHieuLucText = (soNgayHieuLuc) => {
  if (!soNgayHieuLuc) return '-';
  const expDate = parseDate(soNgayHieuLuc);
  if (!expDate || isNaN(expDate.getTime())) return '-';
  
  const range = getFilterRange();
  if (!range) {
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diff < 0) return `Hết ${Math.abs(diff)} ngày`;
    if (diff === 0) return 'Hôm nay';
    return `Còn ${diff} ngày`;
  }

  const diffStart = expDate.getTime() - range.start.getTime();
  const daysLeftStart = Math.ceil(diffStart / (1000 * 3600 * 24));
  
  const diffEnd = expDate.getTime() - range.end.getTime();
  const daysLeftEnd = Math.ceil(diffEnd / (1000 * 3600 * 24));
  
  if (filterMode.value === 'day') {
    if (daysLeftEnd < 0) return `Hết ${Math.abs(daysLeftEnd)} ngày`;
    if (daysLeftEnd === 0) return 'Hôm nay';
    return `Còn ${daysLeftEnd} ngày`;
  } else {
    if (daysLeftStart < 0 && daysLeftEnd < 0) {
      return `Hết ${Math.abs(daysLeftStart)} - ${Math.abs(daysLeftEnd)} ngày`;
    } else if (daysLeftStart >= 0 && daysLeftEnd >= 0) {
      return `Còn ${daysLeftEnd} - ${daysLeftStart} ngày`;
    } else {
      return `Còn ${daysLeftStart} ngày -> Hết ${Math.abs(daysLeftEnd)} ngày`;
    }
  }
}

const getHieuLucColor = (soNgayHieuLuc) => {
  if (!soNgayHieuLuc) return '#475569';
  const d = parseDate(soNgayHieuLuc);
  if (!d || isNaN(d.getTime())) return '#475569';
  const now = targetCalcDate.value;
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '#f87171';
  if (diff <= 10) return '#fbbf24';
  return '#34d399';
}

const getPreviewUrl = (url) => {
  if (!url) return '';
  if (url.toLowerCase().endsWith('.pdf') && url.includes('cloudinary.com')) {
    return url.substring(0, url.lastIndexOf('.')) + '.jpg';
  }
  return url;
}

const baseData = computed(() => {
  let data = rawData.value;
  // Text search
  if (searchQuery.value) {
    const q = normalizeForSearch(searchQuery.value);
    data = data.filter(item => {
      return (
        (item.CUSTOMER && normalizeForSearch(item.CUSTOMER).includes(q)) ||
        (item.LICENSE_ID && normalizeForSearch(item.LICENSE_ID).includes(q)) ||
        (item.PRODUCT_NAME && normalizeForSearch(item.PRODUCT_NAME).includes(q))
      );
    });
  }
  
  if (filterNhaSanXuat.value !== 'all') {
    data = data.filter(item => (item.NHA_SAN_XUAT || item.nha_san_xuat) === filterNhaSanXuat.value);
  }
  
  if (filterCustomer.value !== 'all') {
    data = data.filter(item => item.CUSTOMER === filterCustomer.value);
  }
  
  return data;
})

const filteredData = computed(() => {
  let data = baseData.value;
  
  const targetDate = targetCalcDate.value;
  
  // Status Filters
  data = data.filter(item => {
    // Thời hạn
    if (filterExpirationStatus.value !== 'all') {
      const expDate = parseDateForCalc(item.EXPIRATION_TIME);
      if (!expDate) return false;
      const diffExp = Math.ceil((expDate.getTime() - targetDate.getTime()) / (1000 * 3600 * 24));
      
      if (filterExpirationStatus.value === 'active' && diffExp < 0) return false;
      if (filterExpirationStatus.value === 'expired' && diffExp >= 0) return false;
      
      if (filterExpirationMonths.value !== 'all') {
        const months = parseInt(filterExpirationMonths.value);
        if (Math.abs(diffExp) > months * 30) return false;
      }
    }
    
    // Hiệu lực
    if (filterGraceStatus.value !== 'all') {
      const graceDate = parseDateForCalc(item.SO_NGAY_HIEU_LUC);
      if (!graceDate) return false;
      const diffGrace = Math.ceil((graceDate.getTime() - targetDate.getTime()) / (1000 * 3600 * 24));
      
      if (filterGraceStatus.value === 'active' && diffGrace < 0) return false;
      if (filterGraceStatus.value === 'expired' && diffGrace >= 0) return false;
      
      if (filterGraceMonths.value !== 'all') {
        const months = parseInt(filterGraceMonths.value);
        if (Math.abs(diffGrace) > months * 30) return false;
      }
    }
    
    // Quick Filter
    if (quickFilter.value === 'processed') {
      if (!(item.IS_GIA_HAN === 'Đã gia hạn' || item.is_gia_han === 'Đã gia hạn')) return false;
    }
    
    return true;
  });
  
  return data;
})

const fetchData = async () => {
  loading.value = true;
  try {
    const url = new URL(API_URL);
    url.searchParams.append('sheet', 'license_old_data');
    url.searchParams.append('action', 'get');
    
    const response = await fetch(url.toString());
    const result = await response.json();
    
    if (result.status === 'success' && result.data) {
      if (Array.isArray(result.data)) {
         if (result.data.length > 0 && Array.isArray(result.data[0])) {
           // Array of arrays format
           const dataRows = result.data;
           rawData.value = dataRows.map((row, index) => {
             return {
               ROW_INDEX: index + 2,
               LICENSE_ID: row[0] || '',
               CUSTOMER: row[1] || '',
               PRODUCT_NAME: row[2] || '',
               LOCALIZATION: row[3] || '',
               LICENSE_VOLUME: row[4] || '',
               LICENSE_DESCRIPTION: row[5] || '',
               DATE_OF_LICENSE: formatDisplayDate(row[6]),
               EXPIRATION_TIME: formatDisplayDate(row[7]),
               LICENSE_TYPE: row[8] || '',
               PRODUCT_CODE: row[9] || '',
               LINK_FILE: row[10] || '',
               NAME_FILE: row[11] || '',
               IS_GIA_HAN: row[12] || '',
               SO_NGAY_HIEU_LUC: row[13] || '',
               NHA_SAN_XUAT: row[14] || '',
             }
           });
         } else {
           // Array of objects format
           rawData.value = result.data.map((item, index) => ({
               ROW_INDEX: index + 2,
               LICENSE_ID: item.LICENSE_ID || item.lICENSE_ID || '',
               CUSTOMER: item.CUSTOMER || '',
               PRODUCT_NAME: item.PRODUCT_NAME || '',
               LOCALIZATION: item.LOCALIZATION || '',
               LICENSE_VOLUME: item.LICENSE_VOLUME || '',
               LICENSE_DESCRIPTION: item.LICENSE_DESCRIPTION || '',
               DATE_OF_LICENSE: formatDisplayDate(item.DATE_OF_LICENSE),
               EXPIRATION_TIME: formatDisplayDate(item.EXPIRATION_TIME),
               LICENSE_TYPE: item.LICENSE_TYPE || '',
               PRODUCT_CODE: item.PRODUCT_CODE || '',
               LINK_FILE: item.LINK_FILE || '',
               NAME_FILE: item.NAME_FILE || '',
               IS_GIA_HAN: item.IS_GIA_HAN || item.is_gia_han || '',
               SO_NGAY_HIEU_LUC: item.SO_NGAY_HIEU_LUC || item.so_ngay_hieu_luc || '',
               NHA_SAN_XUAT: item.NHA_SAN_XUAT || item.nha_san_xuat || '',
           }));
         }
      } else {
         rawData.value = [];
      }
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu license_old_data:', err);
  } finally {
    loading.value = false;
  }
}

const totalGroupsCount = computed(() => {
  const categories = new Set(filteredData.value.map(item => item.CUSTOMER || 'KHÁCH HÀNG ẨN DANH'))
  return categories.size
})

const displayLimit = ref(15)

watch(searchQuery, () => {
  displayLimit.value = 15
})

const groupedData = computed(() => {
  const groups = {}
  filteredData.value.forEach(item => {
    const customer = item.CUSTOMER || 'KHÁCH HÀNG ẨN DANH'
    if (!groups[customer]) {
      groups[customer] = []
    }
    groups[customer].push(item)
  })
  
  const sortedKeys = Object.keys(groups).sort()
  const idx = sortedKeys.indexOf('KHÁCH HÀNG ẨN DANH')
  if (idx > -1) {
    sortedKeys.splice(idx, 1)
    sortedKeys.push('KHÁCH HÀNG ẨN DANH')
  }
  const limitedKeys = sortedKeys.slice(0, displayLimit.value)
  
  const sortedGroups = {}
  limitedKeys.forEach(k => {
    sortedGroups[k] = groups[k]
  })
  return sortedGroups
})

onMounted(() => {
  fetchData();
})
</script>

<style scoped>
.license-page-wrapper {
  min-height: calc(100vh - 48px);
  padding: 40px 20px;
  font-family: 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif;
}

.license-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-section h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 4px 0;
}

.subtitle {
  color: #94a3b8;
  font-size: 1rem;
}

/* Search Bar */
.search-card {
  background: rgba(15, 23, 42, 0.6);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 24px;
  backdrop-filter: blur(8px);
}

.search-wrapper {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.input-group {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
}

.license-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 1px solid #334155;
  border-radius: 24px;
  font-size: 1rem;
  color: #f8fafc;
  background: #0f172a;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.license-input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
}

.btn-search {
  padding: 0 24px;
  height: 48px;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.btn-search:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
}

.btn-search:disabled {
  background: #334155;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-import {
  padding: 0 20px;
  height: 48px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-import.pdf-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-import.pdf-btn:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}


/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.8));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  border-color: rgba(255,255,255,0.2);
}

.stat-card.active {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.05);
}

.stat-card.active::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: #38bdf8;
}

.stat-card .stat-icon {
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card .stat-value {
  font-size: 1.85rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1;
}

.stat-card .stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Card Grid Layout */
.license-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

@media (max-width: 560px) {
  .license-grid {
    grid-template-columns: 1fr;
  }
}

.license-card {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  cursor: pointer;
  backdrop-filter: blur(8px);
  animation: cardFadeIn 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.license-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(56, 189, 248, 0.25);
}

/* Glow accent line on top */
.card-glow {
  height: 3px;
  background: linear-gradient(90deg, #334155, #334155);
  transition: background 0.3s;
}
.card-glow.badge-success { background: linear-gradient(90deg, #10b981, #059669); }
.card-glow.badge-warning { background: linear-gradient(90deg, #f59e0b, #d97706); }
.card-glow.badge-danger { background: linear-gradient(90deg, #ef4444, #dc2626); }

/* Card Inner: Horizontal layout */
.card-inner {
  display: flex;
  padding: 16px;
  gap: 16px;
}

/* Card Preview (Left side) */
.card-preview {
  flex: 0 0 120px;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.card-img-link {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, filter 0.3s;
  filter: brightness(0.85);
}

.card-img-link:hover .card-img,
.license-card:hover .card-img {
  transform: scale(1.08);
  filter: brightness(1);
}

.card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.status-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.badge-success { background: rgba(16, 185, 129, 0.9); color: white; }
.badge-warning { background: rgba(245, 158, 11, 0.9); color: white; }
.badge-danger { background: rgba(239, 68, 68, 0.9); color: white; }

/* Card Info (Right side) */
.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-info-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-badge {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  border: 1px solid rgba(34, 211, 238, 0.2);
  word-break: break-word;
}

.nsx-badge {
  background: rgba(168, 85, 247, 0.1);
  color: #c084fc;
  border-color: rgba(168, 85, 247, 0.2);
  margin-left: 6px;
}

.customer-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  word-break: break-word;
  line-height: 1.4;
}

.license-id {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 0.78rem;
  font-family: ui-monospace, Consolas, monospace;
  margin: 0;
  word-break: break-all;
}

.info-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px 12px;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.info-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  margin-top: 6px;
}

.info-grid-3b {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px 12px;
  margin-top: 6px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.6rem;
  color: #475569;
  font-weight: 700;
  letter-spacing: 0.8px;
  margin-bottom: 1px;
}

.info-value {
  font-size: 0.85rem;
  color: #cbd5e1;
  font-weight: 500;
}

.info-value.text-danger { color: #f87171; }
.info-value.text-warning { color: #fbbf24; }
.info-value.text-success { color: #34d399; }
.info-value.highlight { color: #22d3ee; font-weight: 700; }

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
  padding-top: 6px;
}

.meta-tag {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.meta-tag.code {
  border-color: rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

/* Gia hạn toggle */
.card-gia-han {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  gap: 8px;
}

.btn-gia-han {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid;
  opacity: 0.4;
}

.btn-gia-han:hover {
  opacity: 0.8;
}

.btn-gia-han.active {
  opacity: 1;
}

.btn-gia-han.chua-gia-han {
  background: transparent;
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.25);
}
.btn-gia-han.chua-gia-han.active {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.15);
}

.btn-gia-han.da-gia-han {
  background: transparent;
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.25);
}
.btn-gia-han.da-gia-han.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
}

.btn-gia-han:disabled {
  opacity: 0.3;
  cursor: wait;
}

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 99999;
  animation: fadeIn 0.25s ease-out;
}
.modal-container {
  background: #1e293b; border-radius: 16px; width: 95%; max-width: 800px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalZoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-header {
  padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(15, 23, 42, 0.5);
}
.modal-header h3 { color: #f8fafc; }
.btn-close {
  background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8;
  transition: color 0.2s;
}
.btn-close:hover { color: #ef4444; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }

.modal-section {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  color: #38bdf8;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-row:last-child { margin-bottom: 0; }
.form-group { display: flex; flex-direction: column; text-align: left; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #94a3b8; margin-bottom: 6px; }
.form-control {
  padding: 10px 12px; border: 1px solid #334155; border-radius: 8px;
  background: #0f172a; color: #f8fafc; font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-control:focus {
  outline: none; border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}
.modal-footer {
  padding: 16px 24px; border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex; background: rgba(15, 23, 42, 0.5);
}
.btn-primary, .btn-secondary, .btn-danger {
  padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.25s;
}
.btn-primary { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; }
.btn-primary:hover { box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4); }
.btn-secondary { background: #334155; color: #cbd5e1; border: 1px solid #475569; }
.btn-secondary:hover { background: #475569; }
.btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
.btn-danger:hover { box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }
.error-msg {
  margin-top: 16px; padding: 12px;
  background: rgba(239, 68, 68, 0.1); color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalZoomIn {
  from { opacity: 0; transform: scale(0.98) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px dashed #334155;
  color: #94a3b8;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top: 3px solid #22d3ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ------------------- CSS BỘ LỌC ------------------- */
.filter-bar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  margin-top: 10px;
  width: 100%;
}

.master-date-filter-box {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9));
  padding: 12px 24px;
  border-radius: 20px;
  border: 1px solid rgba(16,185,129,0.3);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}

.master-date-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
}
.master-date-title span {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.master-date-tabs {
  display: flex;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(16,185,129,0.3);
}

.master-date-tabs button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.master-date-tabs button:hover {
  color: #fff;
  background: rgba(16,185,129,0.1);
}

.master-date-tabs button.active {
  background: #10b981;
  color: #fff;
}

.master-date-input {
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(16,185,129,0.4);
  background: rgba(15,23,42,0.8);
  color: #f8fafc;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  color-scheme: dark;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}
.master-date-input:focus, .master-date-input:hover {
  border-color: #10b981;
}

.master-date-year-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
}
.master-date-year-picker button {
  background: rgba(16,185,129,0.2);
  border: 1px solid #10b981;
  color: #10b981;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.master-date-year-picker button:hover {
  background: #10b981;
  color: #fff;
}
.master-date-year-picker span {
  color: #f8fafc;
  font-weight: 700;
  font-size: 16px;
}

.filter-group-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(15,23,42,0.6);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}

.filter-label {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.filter-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

.filter-select {
  padding: 6px 12px;
  font-size: 0.85rem;
  background: rgba(15,23,42,0.8);
  min-width: 130px;
}

@media (max-width: 768px) {
  .filter-bar-container {
    padding: 0 16px;
    box-sizing: border-box;
  }
  .master-date-filter-box {
    flex-direction: column;
    padding: 16px;
    width: 100%;
    align-items: stretch;
    text-align: center;
    gap: 12px;
    box-sizing: border-box;
  }
  .master-date-title {
    justify-content: center;
  }
  .master-date-tabs {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    border-radius: 12px;
  }
  .master-date-tabs button {
    flex: 1 1 30%;
    padding: 8px 4px;
    font-size: 0.9rem;
  }
  .master-date-tabs button:nth-child(4), .master-date-tabs button:nth-child(5) {
    flex: 1 1 45%;
  }
  .master-date-input, .master-date-year-picker {
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
  }
  
  .filter-group-container {
    flex-direction: column;
    align-items: stretch;
    padding: 0 16px;
  }
  .filter-item {
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
    box-sizing: border-box;
    padding: 12px 16px;
  }
  .filter-label {
    flex: 0 0 100px;
    margin-bottom: 0;
    margin-top: 8px;
    white-space: normal;
    line-height: 1.2;
  }
  .filter-controls {
    flex: 1;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .filter-select {
    width: 100%;
    max-width: 100% !important;
  }
  
  .search-wrapper {
    flex-direction: column;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .card-inner {
    flex-direction: column;
  }
  .card-preview {
    flex: 0 0 auto;
    height: 120px;
    width: 100%;
  }
  
  .modal-container {
    width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    max-width: 100vw !important;
    border-radius: 0 !important;
    margin: 0 !important;
    animation: slideRight 0.3s ease-out forwards;
  }
}

@keyframes slideRight {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
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
</style>

