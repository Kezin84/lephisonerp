<template>
  <div class="quan-ly-hang-hoa">
    <div class="page-header">
      <h1 class="page-title">Quản lý Hàng Hóa</h1>
      <div class="actions">
        <label class="btn btn-outline" style="cursor: pointer;">
          <input type="file" accept=".xlsx" style="display:none" @change="handleFileUpload" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Import LP_HANGHOA
        </label>
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

    <!-- Filters -->
    <div class="filters">
      <input type="text" v-model="searchQuery" placeholder="Tìm mã / tên hàng / NCC..." class="search-input" />
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
        
        <div v-for="(item, index) in groupItems" :key="item.Ma_hang || index" class="product-card">
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
                <button class="btn-icon text-primary" title="Sửa" @click="openEditModal(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon text-danger" title="Xóa" @click="requestDelete(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
            <h3 class="product-name" :title="item.Ten_hang" v-html="highlightText(item.Ten_hang, searchQuery)"></h3>
            <p class="product-desc text-muted" v-if="item.Mo_ta_chung" :title="item.Mo_ta_chung">{{ item.Mo_ta_chung }}</p>
            <div class="price-info-box">
              <p>License duration: <span>{{ item.License_duration || '-' }}</span></p>
              <p>Đơn vị tiền tệ: <span>{{ item.Don_vi_tien_te || '-' }}</span></p>
              <p>Tỉ giá: <span>{{ item.Ti_gia ? formatCurrency(item.Ti_gia, 'VND') : '-' }}</span></p>
              
              <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 6px 0; width: 100%;"></div>
              
              <p style="color: #fbbf24;">Giá nhập: <span style="color: #fcd34d;">{{ formatCurrency(item.gia_nhap || 0, item.Don_vi_tien_te) }}</span></p>
              <p>Thuế VAT: <span style="color: #facc15;">{{ item.Thue_VAT ? item.Thue_VAT + '%' : '0%' }}</span></p>
              <p class="highlight" style="margin-top: 4px;">
                Giá bán: 
                <span>
                  {{ formatCurrency(item.Don_gia, item.Don_vi_tien_te) }}
                  <small v-if="item.DVT" style="font-size: 11px; color: #64748b; font-weight: 500;">/ {{ item.DVT }}</small>
                </span>
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Cập nhật hàng hóa' : 'Thêm hàng hóa mới' }}</h2>
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
                  <textarea v-model="formData.Features" rows="3"></textarea>
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
                  <label>Đơn giá</label>
                  <NumberInput v-model="formData.Don_gia" />
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
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Hủy</button>
          <button class="btn btn-primary" @click="saveItem" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Đang lưu...' : 'Lưu lại' }}
          </button>
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
                <td><textarea v-model="row.Features" class="imp-input imp-input--textarea imp-input--autofit" rows="1"></textarea></td>
                <td><textarea v-model="row.Danh_muc" class="imp-input imp-input--textarea imp-input--autofit" rows="1"></textarea></td>
                <td><input type="text" v-model="row.Type" class="imp-input imp-input--sm" /></td>
                <td><NumberInput v-model="row.Don_gia" class="imp-input imp-input--num imp-input--green" /></td>
                <td><NumberInput v-model="row.gia_nhap" class="imp-input imp-input--num imp-input--green" /></td>
                <td><NumberInput v-model="row.Thue_VAT" class="imp-input imp-input--num imp-input--green" /></td>
                <td><input type="text" v-model="row.Don_vi_tien_te" class="imp-input imp-input--sm" /></td>
                <td><NumberInput v-model="row.Ti_gia" class="imp-input imp-input--num imp-input--green" /></td>
                <td><input type="text" v-model="row.DVT" class="imp-input imp-input--sm" /></td>
                <td><input type="text" v-model="row.License_duration" class="imp-input" /></td>
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

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const confirmDeleteModal = ref({ show: false, item: null })

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
      const workbook = XLSX.read(data, { type: 'array' })
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
            let features = moTaStr
            const firstNewline = moTaStr.indexOf('\n')
            
            if (firstNewline !== -1) {
              tenHang = moTaStr.substring(0, firstNewline).trim()
              if (tenHang.endsWith(':')) tenHang = tenHang.slice(0, -1)
            }
            features = moTaStr
            
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
              Type: String(typeVal || '').trim()
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

const confirmImport = async () => {
  if (!confirm(`Bạn chắc chắn muốn lưu ${importData.value.length} sản phẩm này vào sheet hang_hoa chứ?`)) return
  importing.value = true
  showAsyncLoading('Đang lưu dữ liệu...', `Sẽ lưu ${importData.value.length} sản phẩm`)
  try {
    const payloads = importData.value.map(p => [
      p.Ma_hang || '', p.Ten_hang || '', p.Main_img || '', p.Ma_nha_cung_cap || '', p.Ten_nha_cung_cap || '',
      p.Mo_ta_chung || '', p.Mo_ta_chi_tiet || '', p.Features || '', p.Danh_muc || '', p.License_duration || '',
      p.DVT || '', p.Gia_tieu_chuan || 0, p.Don_gia || 0, p.Trang_thai || '', p.Don_vi_tien_te || '',
      p.Ti_gia || 1, p.Thue_VAT || 0, p.Ma_hang_lien_ket || '', p.Ten_hang_lien_ket || '', p.Ghi_chu || '',
      p.gia_hardware || 0, p.gia_nhap || 0, p.muc_phan_tram_off || 0, p.Type || ''
    ])
    
    const body = new URLSearchParams()
    body.set('action', 'addHangHoaBatch')
    body.set('payload', JSON.stringify(payloads))

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    
    const result = await res.json()
    if (result.ok) {
      showImportModal.value = false
      const added = result.added !== undefined ? result.added : result.count
      const updated = result.updated || 0
      showAsyncSuccess('Đã lưu thành công!', `Thêm mới: ${added}, Cập nhật: ${updated} sản phẩm.`)
      fetchData()
    } else {
      showAsyncError('Lỗi lưu dữ liệu', result.error)
    }
  } catch (err) {
    showAsyncError('Lỗi kết nối', err.message)
  } finally {
    importing.value = false
  }
}

const toNum = (val, def = 0) => {
  if (!val) return def
  const n = Number(String(val).replace(/,/g, ''))
  return isNaN(n) ? def : n
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
  Type: ''
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

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const words = searchQuery.value.toLowerCase().split(/\s+/).filter(Boolean)
  
  return items.value.filter(item => {
    const ma = (item.Ma_hang || '').toLowerCase()
    const ten = (item.Ten_hang || '').toLowerCase()
    const ncc = (item.Ten_nha_cung_cap || '').toLowerCase()
    
    const maN = normalizeString(ma)
    const tenN = normalizeString(ten)
    const nccN = normalizeString(ncc)
    
    return words.every(w => {
      const wN = normalizeString(w)
      return ma.includes(w) || maN.includes(wN) ||
             ten.includes(w) || tenN.includes(wN) ||
             ncc.includes(w) || nccN.includes(wN)
    })
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
  
  const sortedGroups = {}
  sortedKeys.forEach(k => {
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
    const ts = Date.now()
    const res = await fetch(`${SCRIPT_URL}?action=hang_hoa&t=${ts}`)
    const data = await res.json()
    if (Array.isArray(data)) {
      items.value = data.map((row, index) => {
        if (index === 0) console.log("First row from backend:", row);
        return {
          Ma_hang: row[0],
          Ten_hang: row[1],
          Main_img: row[2],
          Ma_nha_cung_cap: row[3],
          Ten_nha_cung_cap: row[4],
          Mo_ta_chung: row[5],
          Mo_ta_chi_tiet: row[6],
          Features: row[7],
          Danh_muc: String(row[8] || '').toUpperCase(),
          License_duration: row[9],
          DVT: row[10],
          Gia_tieu_chuan: row[11],
          Don_gia: row[12],
          Trang_thai: row[13],
          Don_vi_tien_te: row[14],
          Ti_gia: row[15],
          Thue_VAT: row[16],
          Ma_hang_lien_ket: row[17],
          Ten_hang_lien_ket: row[18],
          Ghi_chu: row[19],
          gia_hardware: row[20],
          gia_nhap: row[21],
          muc_phan_tram_off: row[22],
          Type: (row[23] || '').toString().trim()
        };
      })
    }
  } catch (err) {
    console.error('Error fetching hang_hoa:', err)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  formData.value = { ...defaultForm }
  isEditing.value = false
  showModal.value = true
}

const openEditModal = (item) => {
  formData.value = { ...item }
  isEditing.value = true
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const requestDelete = (item) => {
  confirmDeleteModal.value = { show: true, item }
}

const executeDelete = async () => {
  const item = confirmDeleteModal.value.item
  if (!item) return
  confirmDeleteModal.value.show = false
  
  loading.value = true
  showAsyncLoading('Đang xóa sản phẩm...', `Mã hàng: ${item.Ma_hang}`)
  try {
    const body = new URLSearchParams()
    body.set('action', 'deleteHangHoa')
    body.set('payload', JSON.stringify({ Ma_hang: item.Ma_hang }))

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    
    const data = await res.json()
    if (data.ok) {
      showAsyncSuccess('Xóa thành công!', `Mã hàng: ${item.Ma_hang}`)
      fetchData()
    } else {
      showAsyncError('Không thể xóa', data.error)
    }
  } catch (err) {
    console.error('Delete error:', err)
    showAsyncError('Lỗi xóa', err.message)
  } finally {
    loading.value = false
  }
}

const saveItem = async () => {
  if (!formData.value.Ma_hang || !formData.value.Ten_hang) {
    alert('Vui lòng điền mã hàng và tên hàng')
    return
  }
  
  saving.value = true
  try {
    // Array order must match spreadsheet columns
    const payload = [
      formData.value.Ma_hang,
      formData.value.Ten_hang,
      formData.value.Main_img || '',
      formData.value.Ma_nha_cung_cap || '',
      formData.value.Ten_nha_cung_cap || '',
      formData.value.Mo_ta_chung || '',
      formData.value.Mo_ta_chi_tiet || '',
      formData.value.Features || '',
      formData.value.Danh_muc || '',
      formData.value.License_duration || '',
      formData.value.DVT || '',
      formData.value.Gia_tieu_chuan || 0,
      formData.value.Don_gia || 0,
      formData.value.Trang_thai || '',
      formData.value.Don_vi_tien_te || 'VND',
      formData.value.Ti_gia || 0,
      formData.value.Thue_VAT || 0,
      formData.value.Ma_hang_lien_ket || '',
      formData.value.Ten_hang_lien_ket || '',
      formData.value.Ghi_chu || '',
      formData.value.gia_hardware || 0,
      formData.value.gia_nhap || 0,
      formData.value.muc_phan_tram_off || 0,
      formData.value.Type || ''
    ]

    const body = new URLSearchParams()
    // Giả định backend dùng action addHangHoa. Nếu không có thì sẽ ghi log
    body.set('action', isEditing.value ? 'editHangHoa' : 'addHangHoa')
    body.set('payload', JSON.stringify(payload))

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    
    const data = await res.json()
    if (data.ok) {
      showAsyncSuccess(isEditing.value ? 'Cập nhật thành công!' : 'Thêm mới thành công!', `Mã hàng: ${formData.value.Ma_hang}`)
      closeModal()
      fetchData()
    } else {
      showAsyncError('Lỗi lưu dữ liệu', data.error)
    }
  } catch (err) {
    console.error('Save error:', err)
    showAsyncError('Đã lưu offline hoặc API backend chưa hỗ trợ', err.message)
    closeModal()
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
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
</style>
