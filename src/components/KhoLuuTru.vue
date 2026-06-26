<template>
  <div class="storage-page" @click="closeContextMenu">
    <header class="header">
      <div class="title-section">
        <h1 class="page-title">Kho Lưu Trữ</h1>
        <p class="subtitle">Quản lý thư mục và tài liệu</p>
      </div>
      <div class="header-actions">
        <button class="tech-vip-btn" @click="openCreateFolderModal" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
          Thư mục mới
        </button>
        <button class="tech-vip-btn" @click="triggerUpload" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Tải file lên
        </button>
        <button class="tech-vip-btn" @click="openAddCustomerModal" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          Thêm khách hàng
        </button>
        <input type="file" ref="fileInput" multiple style="display: none;" @change="handleFileUpload" />
      </div>
    </header>

    <div class="storage-content" @contextmenu.prevent="openEmptyContextMenu($event)">
      <!-- Premium Top Toolbar -->
      <div class="premium-toolbar">
        
        <!-- Left Side: Spacer for balance -->
        <div class="toolbar-spacer"></div>

        <!-- Center: View Toggle -->
        <div class="view-toggle toolbar-center">
          <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="Xem tất cả (Dạng lưới)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span style="margin-left: 6px; font-weight: 600; font-size: 0.85rem;">Xem tất cả</span>
          </button>
          <button class="view-btn" :class="{ active: viewMode === 'tree' }" @click="viewMode = 'tree'" title="Xem dạng cây">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            <span style="margin-left: 6px; font-weight: 600; font-size: 0.85rem;">Xem dạng cây</span>
          </button>
        </div>

        <!-- Right Side: Filters -->
        <div class="toolbar-filters">
          
          <!-- Customer Filter -->
          <div style="display: flex; align-items: center; gap: 8px; height: 38px;">
            <span style="color: #94a3b8; font-size: 0.9rem; font-weight: 500; flex-shrink: 0; white-space: nowrap; line-height: 1; display: flex; align-items: center; height: 100%;">Công ty / KH:</span>
            <select v-model="filterCustomer" class="elite-input" style="margin: 0 !important; height: 38px; box-sizing: border-box; padding: 0 12px; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; background: rgba(15, 23, 42, 0.6); color: #10b981; font-weight: 500; cursor: pointer; width: 220px; outline: none; transition: all 0.2s;" onmouseover="this.style.borderColor='rgba(16, 185, 129, 0.6)'" onmouseout="this.style.borderColor='rgba(16, 185, 129, 0.3)'">
              <option value="">Tất cả Công ty / KH</option>
              <option v-for="c in uniqueCompanyCustomers" :key="c.key" :value="c.key">{{ c.label }}</option>
            </select>
          </div>

          <!-- Sort Filter -->
          <div style="display: flex; align-items: center; gap: 8px; height: 38px;">
            <span style="color: #94a3b8; font-size: 0.9rem; font-weight: 500; flex-shrink: 0; white-space: nowrap; line-height: 1; display: flex; align-items: center; height: 100%;">Sắp xếp:</span>
            <select v-model="sortBy" class="elite-input" style="margin: 0 !important; height: 38px; box-sizing: border-box; padding: 0 12px; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 6px; background: rgba(15, 23, 42, 0.6); color: #3b82f6; font-weight: 500; cursor: pointer; width: 140px; outline: none; transition: all 0.2s;" onmouseover="this.style.borderColor='rgba(59, 130, 246, 0.6)'" onmouseout="this.style.borderColor='rgba(59, 130, 246, 0.3)'">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Breadcrumb -->
      <div class="breadcrumb" style="margin-bottom: 1.5rem;">
        <span @click="navigateTo(null)" class="breadcrumb-item" :class="{ active: !currentFolderId }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Trang chủ
        </span>
        <template v-for="folder in breadcrumbs" :key="folder.id">
          <span class="separator">/</span>
          <span @click="navigateTo(folder.id)" class="breadcrumb-item" :class="{ active: currentFolderId === folder.id }">
            {{ folder.name }}
          </span>
        </template>
      </div>

      <!-- Loading State -->
      <div v-if="uploadingFiles.length > 0" class="upload-progress-container">
        <div class="upload-title">Đang tải lên {{ uploadingFiles.length }} file...</div>
        <div class="upload-list">
          <div v-for="(f, i) in uploadingFiles" :key="i" class="upload-item">
            <span class="file-name">{{ f.name }}</span>
            <span class="spinner small"></span>
          </div>
        </div>
      </div>

      <!-- File Grid -->
      <div class="file-grid" v-if="viewMode === 'grid' && currentItems.length > 0">
        <div 
          v-for="item in currentItems" 
          :key="item.id" 
          class="file-item"
          :class="{ 'selected': selectedItemId === item.id || selectedItems.includes(item.id), 'cut-item': clipboard.action === 'cut' && clipboard.items?.some(i => i.id === item.id) }"
          @click.stop="handleItemClick(item)"
          @touchstart="handleTouchStart($event, item)"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd($event)"
          @dblclick.stop="!selectionMode ? (item.type === 'folder' ? navigateTo(item.id) : openFile(item.link_file)) : null"
          @contextmenu.prevent.stop="!selectionMode ? openItemContextMenu($event, item) : null"
        >
          <div class="item-icon" :class="item.type">
            <template v-if="item.type === 'folder'">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="#3b82f6" stroke="#2563eb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </template>
            <template v-else-if="isPreviewableImage(item.link_file)">
              <div class="thumbnail-wrapper" style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; background: rgba(0,0,0,0.2);">
                <img :src="item.link_file" alt="Thumbnail" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
              </div>
            </template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </template>
          </div>
          <div class="item-details">
            <h4 class="item-name" :title="item.name">{{ item.name }}</h4>
            <span v-if="item.created_time" class="item-meta">{{ item.created_time }}</span>
          </div>
        </div>
      </div>

      <!-- Tree View & Preview Layout -->
      <div class="tree-layout" v-else-if="viewMode === 'tree' && treeItems.length > 0">
        <!-- Tree Column -->
        <div class="tree-column">
          <div class="file-tree">
            <div 
              v-for="item in treeItems" 
              :key="item.id" 
              class="tree-item"
              :class="{ 'selected': selectedItemId === item.id || selectedItems.includes(item.id), 'cut-item': clipboard.action === 'cut' && clipboard.items?.some(i => i.id === item.id) }"
              @click.stop="handleItemClick(item)"
              @touchstart="handleTouchStart($event, item)"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd($event)"
              @dblclick.stop="!selectionMode ? (item.type === 'folder' ? toggleFolder(item.id) : openFile(item.link_file)) : null"
              @contextmenu.prevent.stop="!selectionMode ? openItemContextMenu($event, item) : null"
            >
              <div :style="{ width: (item.depth * 24) + 'px' }"></div>
              
              <!-- Expand/Collapse Chevron -->
              <div class="tree-chevron" :class="{ 'invisible': item.type !== 'folder' }" @click.stop="toggleFolder(item.id)">
                <svg v-if="expandedFolders.has(item.id)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
              
              <div class="tree-icon" :class="item.type">
                <svg v-if="item.type === 'folder'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6" stroke="#2563eb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              
              <div class="tree-name" :title="item.name">{{ item.name }}</div>
              <div class="tree-meta" v-if="item.created_time">{{ item.created_time }}</div>
            </div>
          </div>
        </div>
        
        <!-- Preview Column -->
        <div class="preview-column" :class="{ 'mobile-modal-active': previewItem }">
          <div v-if="previewItem" class="preview-content">
            <!-- Mobile Close Button -->
            <div class="mobile-preview-close" @click.stop="selectedItemId = null">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            
            <template v-if="previewItem.type === 'file'">
              <div v-if="isPreviewableImage(previewItem.link_file)" class="preview-image-container">
                <img :src="previewItem.link_file" alt="Preview" class="preview-image" />
              </div>
              <div v-else class="preview-iframe-container" style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; background: rgba(0,0,0,0.2);">
                  <span style="font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; color: #f8fafc;" :title="previewItem.name">{{ previewItem.name }}</span>
                  <a :href="previewItem.link_file" target="_blank" class="tech-vip-btn" style="padding: 6px 12px; font-size: 0.85rem; background: #3b82f6; color: white; text-decoration: none;">Mở Tab Mới</a>
                </div>
                <iframe :src="previewItem.link_file" style="flex: 1; width: 100%; border: none; background: white;"></iframe>
              </div>
            </template>
            <div v-else class="preview-generic">
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
               <h4 style="margin: 16px 0 8px; text-align: center; max-width: 80%;">{{ previewItem.name }}</h4>
               <p style="color: #94a3b8; font-size: 0.9rem;">Thư mục</p>
            </div>
          </div>
          <div v-else class="preview-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <p style="margin-top: 12px;">Chọn một mục để xem trước</p>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        <h3>Thư mục trống</h3>
        <p>Thêm thư mục mới hoặc tải file lên đây.</p>
      </div>
    </div>

    <!-- Generic Modal (Create/Rename) -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal-content">
        <h3>{{ modalTitle }}</h3>
        <input 
          type="text" 
          v-model="modalInputName" 
          class="elite-input" 
          :placeholder="modalPlaceholder" 
          @keyup.enter="handleModalSubmit"
          autofocus
        />
        <div class="modal-actions">
          <button class="tech-vip-btn outline" @click="showModal = false">Hủy</button>
          <button class="tech-vip-btn" @click="handleModalSubmit" style="background: #10b981; color: white;">Lưu</button>
        </div>
      </div>
    </div>

    <!-- Duplicate Confirm Modal -->
    <div class="modal-overlay" v-if="showDuplicateModal" @click.self="cancelDuplicateAction">
      <div class="modal-content">
        <h3>Trùng tên</h3>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5;">
          Tên này đã tồn tại trong thư mục hiện tại. Bạn có muốn lưu với tên tự động là 
          <strong style="color: #e2e8f0;">{{ duplicateSuggestedName }}</strong> không?
        </p>
        <div class="modal-actions">
          <button class="tech-vip-btn outline" @click="cancelDuplicateAction">Đổi lại</button>
          <button class="tech-vip-btn" @click="confirmDuplicateAction" style="background: #3b82f6; color: white;">Tiếp tục</button>
        </div>
      </div>
    </div>

    <!-- Label Modal (Gắn nhãn khách - cty) -->
    <div class="modal-overlay" v-if="showLabelModal" @click.self="showLabelModal = false">
      <div class="modal-content" style="max-width: 450px;">
        <h3 style="display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          Gắn nhãn khách - công ty
        </h3>
        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 16px;">Gắn cho: <strong style="color: #e2e8f0;">{{ labelTarget?.name }}</strong></p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="display: block; color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Tên khách hàng</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" v-model="labelForm.ten_khach_hang" class="elite-input" placeholder="Nhập tên khách hàng..." style="flex: 1;" />
              <button class="tech-vip-btn" @click="openCustomerSearch('ten_khach_hang')" style="background: #3b82f6; color: white; padding: 4px 10px; font-size: 12px; height: 34px; white-space: nowrap;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Tìm KH
              </button>
            </div>
          </div>
          <div>
            <label style="display: block; color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Tên công ty</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" v-model="labelForm.ten_cong_ty" class="elite-input" placeholder="Nhập tên công ty..." style="flex: 1;" />
              <button class="tech-vip-btn" @click="openCustomerSearch('ten_cong_ty')" style="background: #3b82f6; color: white; padding: 4px 10px; font-size: 12px; height: 34px; white-space: nowrap;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Tìm CT
              </button>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <div style="flex: 1;">
              <label style="display: block; color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Mã KH (tự động)</label>
              <input type="text" :value="generatedMaKH" class="elite-input" disabled style="opacity: 0.6;" />
            </div>
            <div style="flex: 1;">
              <label style="display: block; color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Mã CT (tự động)</label>
              <input type="text" :value="generatedMaCT" class="elite-input" disabled style="opacity: 0.6;" />
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="tech-vip-btn outline" @click="showLabelModal = false">Hủy</button>
          <button class="tech-vip-btn" @click="saveLabelData" style="background: #10b981; color: white;">Lưu</button>
        </div>
      </div>
    </div>

    <!-- Add Customer Modal -->
    <div class="modal-overlay" v-if="showCustomerModal" @click.self="showCustomerModal = false">
      <div class="modal-content" style="max-width: 450px;">
        <h3 style="display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          Thêm khách hàng mới
        </h3>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
          <div>
            <label style="display: block; color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Tên khách hàng</label>
            <input type="text" v-model="customerForm.ten_khach_hang" class="elite-input" placeholder="Nhập tên khách hàng..." />
          </div>
          <div>
            <label style="display: block; color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Tên công ty</label>
            <input type="text" v-model="customerForm.ten_cong_ty" class="elite-input" placeholder="Nhập tên công ty..." />
          </div>
          <div style="display: flex; gap: 8px;">
            <div style="flex: 1;">
              <label style="display: block; color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Mã KH (tự động)</label>
              <input type="text" :value="customerGeneratedMaKH" class="elite-input" disabled style="opacity: 0.6;" />
            </div>
            <div style="flex: 1;">
              <label style="display: block; color: #94a3b8; font-size: 12px; margin-bottom: 4px;">Mã CT (tự động)</label>
              <input type="text" :value="customerGeneratedMaCT" class="elite-input" disabled style="opacity: 0.6;" />
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="tech-vip-btn outline" @click="showCustomerModal = false">Hủy</button>
          <button class="tech-vip-btn" @click="saveNewCustomer" style="background: #f59e0b; color: white;">Lưu</button>
        </div>
      </div>
    </div>

    <!-- Search Customer Modal -->
    <div class="modal-overlay" v-if="showSearchModal" @click.self="showSearchModal = false">
      <div class="modal-content" style="max-width: 500px; display: flex; flex-direction: column; gap: 16px;">
        <h3 style="display: flex; align-items: center; gap: 8px; margin: 0;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          Tìm kiếm khách hàng
        </h3>
        
        <input type="text" v-model="customerSearchStr" class="elite-input" placeholder="Nhập tên KH, tên CT hoặc mã KH để tìm..." autofocus />
        
        <div style="max-height: 300px; overflow-y: auto; border-radius: 6px; border: 1px solid #334155;">
          <div v-if="filteredCustomersSearch.length === 0" style="padding: 16px; text-align: center; color: #64748b; font-size: 13px;">
            Không tìm thấy khách hàng nào.
          </div>
          <div v-else class="customer-list-item" v-for="c in filteredCustomersSearch" :key="c.ma_khach_hang" @click="selectCustomerSearch(c)" style="padding: 12px; border-bottom: 1px solid #334155; cursor: pointer; transition: all 0.2s;">
            <div style="font-weight: 500; color: #f1f5f9;">{{ c.ten_khach_hang }}</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              {{ c.ten_cong_ty }}
            </div>
          </div>
        </div>
        
        <div class="modal-actions" style="margin-top: 0;">
          <button class="tech-vip-btn outline" @click="showSearchModal = false" style="width: 100%;">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Selection Action Bar -->
    <div class="selection-action-bar" v-if="selectionMode">
      <span>Đã chọn {{ selectedItems.length }} mục</span>
      <div class="selection-actions">
        <button class="tech-vip-btn outline" @click="handleBulkCopy" :disabled="selectedItems.length === 0">
          Copy
        </button>
        <button class="tech-vip-btn outline" @click="handleBulkCut" :disabled="selectedItems.length === 0">
          Cut
        </button>
        <button class="tech-vip-btn danger" @click="handleBulkDeleteSelected" :disabled="selectedItems.length === 0">
          Xóa đã chọn
        </button>
        <button class="tech-vip-btn outline" @click="cancelSelectionMode">
          Hủy
        </button>
      </div>
    </div>

    <!-- Custom Dialog Modal -->
    <div class="modal-overlay" v-if="customDialog.show" @click.self="customDialog.type === 'confirm' ? customDialog.onCancel() : customDialog.onConfirm()">
      <div class="modal-content" style="max-width: 400px; text-align: center;">
        <h3 style="margin-bottom: 1rem;">{{ customDialog.title }}</h3>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5;">
          {{ customDialog.message }}
        </p>
        <div class="modal-actions" style="justify-content: center;">
          <button v-if="customDialog.type === 'confirm'" class="tech-vip-btn outline" @click="customDialog.onCancel">
            {{ customDialog.cancelText }}
          </button>
          <button class="tech-vip-btn" @click="customDialog.onConfirm" :style="{ background: customDialog.type === 'alert' ? '#3b82f6' : '#ef4444', color: 'white' }">
            {{ customDialog.confirmText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div class="modal-overlay" v-if="showUploadModal" @click.self="showUploadModal = false">
      <div class="modal-content upload-modal-content" style="max-width: 500px;">
        <h3 style="display: flex; align-items: center; gap: 8px; margin-bottom: 1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Tải file lên
        </h3>
        
        <div 
          class="upload-dropzone" 
          :class="{ 'dragging': isDragging }"
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; color: #3b82f6;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <h4 style="margin: 0 0 8px 0; color: #f1f5f9;">Chọn file hoặc Kéo thả vào đây</h4>
          <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">Bạn cũng có thể dán (Ctrl+V) file trực tiếp vào cửa sổ này</p>
        </div>

        <div class="modal-actions" style="margin-top: 1.5rem;">
          <button class="tech-vip-btn outline" @click="showUploadModal = false">Hủy</button>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div 
      v-if="contextMenu.show" 
      class="custom-context-menu" 
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    >
      <template v-if="contextMenu.type === 'item'">
        <div class="menu-item" @click="enterSelectionMode">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          Chọn nhiều
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" @click="handleCopy">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy <span class="shortcut">Ctrl+C</span>
        </div>
        <div class="menu-item" @click="handleCut">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
          Cut <span class="shortcut">Ctrl+X</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" @click="openRenameModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Đổi tên
        </div>
        <div class="menu-item" @click="openLabelModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          Gắn nhãn khách - cty
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item danger" @click="handleDelete">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Xóa <span class="shortcut">Del</span>
        </div>
      </template>

      <template v-else-if="contextMenu.type === 'empty'">
        <div class="menu-item" @click="openCreateFolderModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
          Thư mục mới
        </div>
        <div class="menu-item" @click="triggerUploadFromMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Tải file lên
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" :class="{ disabled: !clipboard.items || clipboard.items.length === 0 }" @click="(clipboard.items && clipboard.items.length > 0) ? handlePaste() : null">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
          Paste <span class="shortcut">Ctrl+V</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

// --- State ---
const currentFolderId = ref(null)
const storageData = ref([])
const viewMode = ref('grid') // 'grid' | 'tree'
const expandedFolders = ref(new Set([''])) // root is always expanded
const loading = ref(false)
const fileInput = ref(null)
const uploadingFiles = ref([])

// Filter & Sort State
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

// --- Code Gen Helpers (same as Pipeline) ---
const generateCurrentTime = () => {
  const now = new Date()
  const pad = n => String(n).padStart(2, "0")
  return `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`
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

// Search Modal State
const showSearchModal = ref(false)
const customerSearchTarget = ref('')
const customerSearchStr = ref('')

const filteredCustomersSearch = computed(() => {
  const kw = customerSearchStr.value.toLowerCase().trim()
  if (!kw) return customersList.value.slice(0, 50)
  return customersList.value.filter(c => 
    (c.ten_khach_hang && c.ten_khach_hang.toLowerCase().includes(kw)) ||
    (c.ten_cong_ty && c.ten_cong_ty.toLowerCase().includes(kw)) ||
    (c.ma_khach_hang && c.ma_khach_hang.toLowerCase().includes(kw))
  ).slice(0, 50)
})


// Customer Modal State
const showCustomerModal = ref(false)
const customerForm = ref({ ten_khach_hang: '', ten_cong_ty: '' })
const customerGeneratedMaKH = computed(() => genMaKH(customerForm.value.ten_khach_hang, customerForm.value.ten_cong_ty))
const customerGeneratedMaCT = computed(() => genMaCT(customerForm.value.ten_cong_ty))

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
  if (!filterCustomer.value) return storageData.value
  return storageData.value.filter(item => itemCustomerMap.value.get(item.id) === filterCustomer.value)
})

// --- Sorting Logic ---
const parseDateString = (dateStr) => {
  if (!dateStr) return 0
  const match = dateStr.match(/(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return 0
  const [_, hh, mm, dd, MM, yyyy] = match
  return new Date(`${yyyy}-${MM}-${dd}T${hh}:${mm}:00`).getTime()
}

const sortItems = (items) => {
  return items.sort((a, b) => {
    // Folders always first
    if (a.type === 'folder' && b.type !== 'folder') return -1
    if (a.type !== 'folder' && b.type === 'folder') return 1
    
    const timeA = parseDateString(a.created_time)
    const timeB = parseDateString(b.created_time)
    
    // Sort by date based on selected mode
    if (sortBy.value === 'newest') {
      // If same date, sort by name
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
  if (filterCustomer.value) {
    items = filteredStorageData.value.filter(item => item.type !== 'folder')
  } else {
    items = filteredStorageData.value.filter(item => item.parents_id === (currentFolderId.value || ''))
  }
  return sortItems([...items])
})

// Tree View Logic
const treeItems = computed(() => {
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

// --- API Methods ---
const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}?sheet=kho_luu_tru&action=get`)
    const data = await res.json()
    if (data.status === 'success') {
      storageData.value = data.data.map(item => {
        let display = ''
        if (item.type === 'folder') {
          display = item.parents_name
        } else {
          display = item.Ten_file
        }
        return {
          ...item,
          name: display || 'Không tên'
        }
      })
    }
  } catch (e) {
    console.error('Lỗi lấy dữ liệu:', e)
  } finally {
    loading.value = false
  }
}

const postData = async (payload) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        sheet: 'kho_luu_tru',
        ...payload
      })
    })
    const data = await res.json()
    return data
  } catch (e) {
    console.error('Lỗi lưu dữ liệu:', e)
    return null
  }
}

const deleteData = async (id) => {
  try {
    const res = await fetch(`${API_URL}?sheet=kho_luu_tru&action=delete&id=${id}`)
    const data = await res.json()
    return data
  } catch (e) {
    console.error('Lỗi xóa dữ liệu:', e)
    return null
  }
}

// --- Lifecycle & Shortcuts ---
const handleKeydown = (e) => {
  // Prevent shortcuts when modal is open or focusing input
  if (showModal.value || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

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

const handleTouchEnd = (event) => {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  } else if (isLongPress) {
    setTimeout(() => {
      isLongPress = false
    }, 500)
  }
}

// Context Menu Methods
const openItemContextMenu = (event, item) => {
  event.preventDefault()
  selectedItemId.value = item.id
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    type: 'item',
    item: item
  }
}

const openEmptyContextMenu = (event) => {
  event.preventDefault()
  selectedItemId.value = null
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    type: 'empty',
    item: null
  }
}

const closeContextMenu = () => {
  contextMenu.value.show = false
}

const handleItemClick = (item) => {
  if (isLongPress) {
    return
  }
  
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
      if (window.innerWidth <= 768) {
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

// Bulk API helpers
const bulkAdd = async (items) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        sheet: 'kho_luu_tru',
        action: 'bulk_add',
        items: items
      })
    })
    return await res.json()
  } catch (e) {
    console.error('Lỗi bulk add:', e)
    return null
  }
}

const bulkDelete = async (ids) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        sheet: 'kho_luu_tru',
        action: 'bulk_delete',
        ids: ids
      })
    })
    return await res.json()
  } catch (e) {
    console.error('Lỗi bulk delete:', e)
    return null
  }
}

const bulkEdit = async (items) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        sheet: 'kho_luu_tru',
        action: 'bulk_edit',
        items: items
      })
    })
    return await res.json()
  } catch (e) {
    console.error('Lỗi bulk edit:', e)
    return null
  }
}

const handlePaste = async () => {
  if (!clipboard.value.items || clipboard.value.items.length === 0) return
  
  const itemMenu = contextMenu.value.item
  const targetId = (viewMode.value === 'tree' && itemMenu && itemMenu.type === 'folder') ? itemMenu.id : (currentFolderId.value || '')
  
  const { action, items, descendants } = clipboard.value
  const parentFolder = storageData.value.find(f => f.id === targetId)
  // Get the display name of the destination folder (= parents_name value for items we paste here)
  const destFolderName = parentFolder ? (parentFolder.type === 'folder' ? parentFolder.parents_name : parentFolder.name) || '' : ''

  if (action === 'cut') {
    const itemsToEdit = []
    for (const item of items) {
      if (item.id === currentFolderId.value) {
        await showAlert(`Không thể di chuyển thư mục "${item.name}" vào chính nó!`)
        continue
      }
      
      const targetItem = storageData.value.find(i => i.id === item.id)
      if (targetItem) {
        targetItem.parents_id = currentFolderId.value || ''
        targetItem.parents_name = targetItem.type === 'folder' ? targetItem.parents_name : destFolderName
        // For folders: parents_name = its own name, don't change
        // For files: parents_name = parent folder's name, update it
        
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

    // Process all root copied items
    for (const item of items) {
      const newId = (item.type === 'folder' ? 'F_' : 'FILE_') + Date.now() + Math.floor(Math.random() * 100000)
      let newName = item.name
      if (!newName.includes(' - Copy')) {
        newName = newName.replace(/(\.[^.]+)$/, ' - Copy$1')
        if (newName === item.name) newName += ' - Copy'
      }
      newName = getUniqueName(newName, currentFolderId.value || '', item.type)

      const newItem = {
        ...item,
        id: newId,
        name: newName,
        parents_id: currentFolderId.value || '',
        created_time: generateCurrentTime()
      }
      
      // For folder: parents_name = its own name (newName)
      // For file: parents_name = destination folder's name, Ten_file = newName
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

    // Process descendants for folders
    if (descendants && descendants.length > 0) {
      let counter = 1
      for (const desc of descendants) {
        const descNewId = (desc.type === 'folder' ? 'F_' : 'FILE_') + Date.now() + '_' + counter++
        idMap[desc.id] = descNewId
        if (desc.type === 'folder') {
          nameMap[desc.id] = desc.parents_name || desc.name // folder's own name
        }
      }
      
      for (const desc of descendants) {
        const descNewId = idMap[desc.id]
        const descNewParentId = idMap[desc.parents_id] || desc.parents_id
        
        // Lookup the parent folder's name from nameMap
        const descParentName = nameMap[desc.parents_id] || desc.parents_name || ''
        
        const newChild = {
          ...desc,
          id: descNewId,
          parents_id: descNewParentId,
          created_time: generateCurrentTime()
        }
        
        if (desc.type === 'folder') {
          // Folder: parents_name = its own name, keep original
          newChild.parents_name = desc.parents_name || desc.name
          newChild.name = desc.parents_name || desc.name
        } else {
          // File: parents_name = parent folder's name from nameMap
          newChild.parents_name = descParentName
          newChild.name = desc.Ten_file || desc.name
        }
        
        allNewItems.push(newChild)
      }
    }
    
    // Optimistic UI update
    for (const ni of allNewItems) {
      storageData.value.push(ni)
    }
    
    // Single bulk API call
    await bulkAdd(allNewItems)
  }
  
  closeContextMenu()
}

const handleDelete = async () => {
  const item = contextMenu.value.item || storageData.value.find(i => i.id === selectedItemId.value)
  if (!item) return
  
  if (await showConfirm(`Bạn có chắc muốn xóa "${item.name}"?`)) {
    // Collect all IDs to delete
    const idsToDelete = [item.id]
    
    if (item.type === 'folder') {
      const descendants = getAllDescendants(item.id)
      for (const d of descendants) {
        idsToDelete.push(d.id)
      }
    }
    
    // Remove from UI
    storageData.value = storageData.value.filter(i => !idsToDelete.includes(i.id))
    if (clipboard.value.items?.some(i => idsToDelete.includes(i.id))) {
      clipboard.value = { action: null, items: [], descendants: [] }
    }
    
    // Single bulk API call
    await bulkDelete(idsToDelete)
    console.log('[KLT] Bulk delete done:', idsToDelete.length, 'items')
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
  
  // Update target item in local state
  item.Ma_khach_hang = ma_kh
  item.Ten_khach_hang = ten_kh
  item.Ma_cong_ty = ma_ct
  item.Ten_cong_ty = ten_ct
  
  showLabelModal.value = false
  
  // Save target item to backend
  await postData({
    ...item,
    Ma_khach_hang: ma_kh,
    Ten_khach_hang: ten_kh,
    Ma_cong_ty: ma_ct,
    Ten_cong_ty: ten_ct,
    action: 'edit'
  })
  
  // If folder, also label all descendants
  if (item.type === 'folder') {
    const descendants = getAllDescendants(item.id)
    if (descendants.length > 0) {
      const itemsToEdit = []
      for (const desc of descendants) {
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

// Customer Actions
const customersList = ref([])

const fetchCustomersList = async () => {
  try {
    const res = await fetch(`${API_URL}?sheet=khach_hang&action=get`)
    const data = await res.json()
    if (data.status === 'success') {
      customersList.value = data.data || []
    }
  } catch (e) {
    console.error('Lỗi lấy danh sách khách hàng:', e)
  }
}

// Customer Search Actions
const openCustomerSearch = (target) => {
  customerSearchTarget.value = target
  customerSearchStr.value = '' // Luôn để trống khi mở
  showSearchModal.value = true
  fetchCustomersList() // Re-use the fetch list function
}

const selectCustomerSearch = (c) => {
  labelForm.value.ten_khach_hang = c.ten_khach_hang || ''
  labelForm.value.ten_cong_ty = c.ten_cong_ty || ''
  showSearchModal.value = false
}

const openAddCustomerModal = () => {
  customerForm.value = { ten_khach_hang: '', ten_cong_ty: '' }
  showCustomerModal.value = true
  fetchCustomersList()
}

const saveNewCustomer = async () => {
  const ten_kh = customerForm.value.ten_khach_hang.trim()
  const ten_ct = customerForm.value.ten_cong_ty.trim()
  if (!ten_kh && !ten_ct) {
    await showAlert('Vui lòng nhập ít nhất tên khách hàng hoặc tên công ty!')
    return
  }
  
  const ma_kh = customerGeneratedMaKH.value
  const ma_ct = customerGeneratedMaCT.value
  
  // Check duplicate
  const isDuplicate = customersList.value.some(c => 
    c.ma_khach_hang === ma_kh && c.ma_cong_ty === ma_ct
  )
  if (isDuplicate) {
    await showAlert('Khách hàng này đã tồn tại (trùng mã khách hàng và mã công ty)!')
    return
  }
  
  showCustomerModal.value = false
  
  // Save to khach_hang sheet
  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      sheet: 'khach_hang',
      action: 'add',
      ma_khach_hang: ma_kh,
      ten_khach_hang: ten_kh,
      ma_cong_ty: ma_ct,
      ten_cong_ty: ten_ct
    })
  })
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
  let newName = modalInputName.value.trim()
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
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg"
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
  
  showUploadModal.value = false // Close modal immediately
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
.storage-page {
  padding: 1.5rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.title-section .page-title {
  color: #10b981;
  text-transform: uppercase;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.title-section .subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.tech-vip-btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tech-vip-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.tech-vip-btn.outline {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  box-shadow: none;
}

.storage-content {
  flex: 1;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 1rem 1.5rem;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #fff;
}

.breadcrumb-item.active {
  color: #10b981;
}

.separator {
  color: #475569;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  overflow-y: auto;
}

.file-item {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  min-height: 180px;
}

.file-item:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.item-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

.item-name {
  color: #f8fafc;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  width: 100%;
  word-break: break-word;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 4px;
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #94a3b8;
}

.empty-state h3 {
  color: #f8fafc;
  margin: 1rem 0 0.5rem 0;
}

.upload-progress-container {
  padding: 1rem 1.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.upload-title {
  color: #60a5fa;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.upload-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.2);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #e2e8f0;
}

.spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid #fff;
  width: 14px;
  height: 14px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #fff;
  font-size: 1.25rem;
}

.elite-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.2);
  color: #fff;
  outline: none;
  font-size: 0.9rem;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
}

.elite-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16,185,129,0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* --- Selection & Cut States --- */
.file-item.selected {
  background: rgba(30, 41, 59, 0.9);
  border-color: #10b981;
  box-shadow: 0 0 0 1px #10b981;
}

.file-item.cut-item {
  opacity: 0.5;
  filter: grayscale(0.5);
}

/* --- Context Menu --- */
.custom-context-menu {
  position: fixed;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  min-width: 180px;
  z-index: 9999;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
}

.menu-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e2e8f0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.danger {
  color: #ef4444;
}

.menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.menu-item.disabled {
  color: #64748b;
  cursor: not-allowed;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.25rem 0;
}

.shortcut {
  margin-left: auto;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* --- Selection Mode --- */
.selection-action-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  padding: 12px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1000;
  color: #fff;
  font-weight: 600;
}
.selection-actions {
  display: flex;
  gap: 8px;
}
.tech-vip-btn.danger {
  background: #ef4444;
  color: white;
}
.tech-vip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


/* Tree View Styles */
.view-toggle {
  display: flex;
  gap: 4px;
  background: rgba(15, 23, 42, 0.4);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #334155;
}

.view-btn {
  padding: 6px;
  border-radius: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.view-btn:hover {
  background: rgba(51, 65, 85, 0.5);
  color: #f1f5f9;
}

.view-btn.active {
  background: #10b981;
  color: #fff;
}

/* Tree View Layout Styles */
.tree-layout {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.tree-column {
  flex: 1;
  min-width: 300px;
  max-width: 50%;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid #334155;
  overflow-y: auto;
}

.preview-column {
  flex: 1;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid #334155;
  overflow: hidden;
}

.preview-content, .preview-empty, .preview-generic {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.preview-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.file-tree {
  display: flex;
  flex-direction: column;
}

.tree-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #1e293b;
  cursor: pointer;
  transition: all 0.2s;
  color: #f8fafc;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.tree-item:last-child {
  border-bottom: none;
}

.tree-item:hover {
  background: rgba(51, 65, 85, 0.5);
}

.tree-item.selected {
  background: rgba(59, 130, 246, 0.2);
}

.tree-item.cut-item {
  opacity: 0.5;
}

.tree-chevron {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  color: #94a3b8;
  border-radius: 4px;
}
.tree-chevron:hover {
  background: rgba(255, 255, 255, 0.1);
}
.tree-chevron.invisible {
  visibility: hidden;
}

.tree-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
}

.tree-name {
  flex: 1;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-meta {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-left: 16px;
}

/* Premium Toolbar Responsive Styles */
.premium-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.toolbar-spacer {
  flex: 1;
}

.toolbar-center {
  flex-shrink: 0;
}

.toolbar-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
}

@media (min-width: 769px) {
  .mobile-preview-close {
    display: none;
  }
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
  }
  .file-item {
    min-height: 220px;
    padding: 2rem 1.5rem;
    justify-content: center;
  }
  .item-icon {
    height: 100px;
    margin-bottom: 1.5rem;
  }
  .item-icon svg {
    width: 80px;
    height: 80px;
  }
  .thumbnail-wrapper {
    width: 100px !important;
    height: 100px !important;
  }
}

@media (max-width: 768px) {
  .premium-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  .toolbar-spacer {
    display: none; /* Hide empty spacer on mobile */
  }
  .toolbar-center {
    align-self: center; /* Keep toggle centered horizontally */
  }
  .toolbar-filters {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-filters > div {
    width: 100%;
  }
  .toolbar-filters select {
    width: 100% !important;
  }
  
  /* Tree Layout Mobile */
  .tree-layout {
    flex-direction: column;
    padding: 0 1rem 1rem 1rem;
  }
  .tree-column {
    max-width: 100%;
    min-width: auto;
  }
  .preview-column {
    display: none;
  }
  
  /* Full-screen Modal for Preview on Mobile */
  .preview-column.mobile-modal-active {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(8px);
    border-radius: 0;
    border: none;
  }
  
  .mobile-preview-close {
    display: flex;
    position: absolute;
    top: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 10000;
    cursor: pointer;
  }
}
.upload-dropzone {
  border: 2px dashed #334155;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.4);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-dropzone:hover, .upload-dropzone.dragging {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

</style>
