<template>
  <div class="pipeline-page">
    <!-- Elite Header -->
    <header class="header" style="position: relative; justify-content: center; display: flex; align-items: center; margin-bottom: 1.5rem; flex-shrink: 0; flex-direction: column;">
      <div class="title-section" style="text-align: center; margin-bottom: 1rem;">
        <h1 style="color: #10b981; text-transform: uppercase; margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.05em; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Pipeline Kanban</h1>
        <p class="subtitle" style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #94a3b8;">Theo dõi và cập nhật trạng thái hợp đồng</p>
      </div>

      <!-- Tab Switcher -->
      <div class="pipeline-tabs" style="display: flex; gap: 0.5rem; background: rgba(15, 23, 42, 0.6); padding: 0.25rem; border-radius: 99px; border: 1px solid rgba(255,255,255,0.05);">
        <button 
          :class="['pipeline-tab-btn', activeTab === 'kanban' ? 'active' : '']"
          @click="activeTab = 'kanban'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
          Kanban Board
        </button>
        <button 
          :class="['pipeline-tab-btn', activeTab === 'workflow' ? 'active' : '']"
          @click="activeTab = 'workflow'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          Thiết kế Workflow
        </button>
      </div>
    </header>

    <div v-show="activeTab === 'kanban'" class="kanban-tab-content" style="display: flex; flex-direction: column; flex: 1; min-height: 0;">
      <!-- Time Filter -->
      <div class="elite-filter-panel elite-time-filter" style="margin-bottom: 1rem;">
      <div class="elite-filter-accent"></div>
      <div class="elite-filter-header">
        <div class="elite-filter-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          <span>Bộ lọc nâng cao</span>
        </div>
        <button class="elite-refresh-btn" @click="resetFilters">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
          Làm mới
        </button>
      </div>

      <div class="elite-filter-body">
        <div class="elite-filter-row" style="margin-bottom: 12px; display: flex; gap: 12px; width: 100%;" v-show="false">
          <div class="elite-date-group group-date" style="flex: 1; min-width: 0;">
            <label>Công ty / Khách hàng</label>
            <select v-model="filterConfig.companyCustomer" class="elite-input" style="width: 100%; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: #0f172a; color: #fff; cursor: pointer;">
              <option value="">Tất cả</option>
              <option v-for="c in uniqueCompanyCustomers" :key="c.key" :value="c.key">{{ c.label }}</option>
            </select>
          </div>
        </div>

        <div class="elite-filter-row">
          <div class="elite-date-group group-tabs" style="flex: 0 0 auto; min-width: auto; max-width: none;">
            <label style="opacity: 0; user-select: none;" class="mobile-hidden-label">Chế độ</label>
            <div class="elite-mode-tabs">
              <button type="button" :class="{ active: filterConfig.filterMode === 'all' }" @click="filterConfig.filterMode = 'all'">Tất cả</button>
              <button type="button" :class="{ active: filterConfig.filterMode === 'day' }" @click="filterConfig.filterMode = 'day'">Ngày</button>
              <button type="button" :class="{ active: filterConfig.filterMode === 'week' }" @click="filterConfig.filterMode = 'week'">Tuần</button>
              <button type="button" :class="{ active: filterConfig.filterMode === 'month' }" @click="filterConfig.filterMode = 'month'">Tháng</button>
              <button type="button" :class="{ active: filterConfig.filterMode === 'year' }" @click="filterConfig.filterMode = 'year'">Năm</button>
            </div>
          </div>

          <template v-if="filterConfig.filterMode === 'day'">
            <div class="elite-date-group group-date">
              <label>Từ ngày</label>
              <input type="date" v-model="filterConfig.dateFrom" :max="filterConfig.dateTo" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến ngày</label>
              <input type="date" v-model="filterConfig.dateTo" :min="filterConfig.dateFrom" class="elite-input" />
            </div>
          </template>

          <template v-if="filterConfig.filterMode === 'week'">
            <div class="elite-date-group group-date">
              <label>Từ tuần</label>
              <input type="week" v-model="filterConfig.weekFrom" :max="filterConfig.weekTo" @change="filterConfig.weekTo = filterConfig.weekFrom" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến tuần</label>
              <input type="week" v-model="filterConfig.weekTo" :min="filterConfig.weekFrom" class="elite-input" />
            </div>
          </template>

          <template v-if="filterConfig.filterMode === 'month'">
            <div class="elite-date-group group-date">
              <label>Từ tháng</label>
              <input type="month" v-model="filterConfig.monthFrom" :max="filterConfig.monthTo" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến tháng</label>
              <input type="month" v-model="filterConfig.monthTo" :min="filterConfig.monthFrom" class="elite-input" />
            </div>
          </template>

          <template v-if="filterConfig.filterMode === 'year'">
            <div class="elite-date-group group-date">
              <label>Từ năm</label>
              <select v-model="filterConfig.yearFrom" class="elite-input" style="appearance: auto; background-color: #1e293b;">
                <option v-for="y in 21" :key="'yfrom-'+y" :value="2019 + y">{{ 2019 + y }}</option>
              </select>
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến năm</label>
              <select v-model="filterConfig.yearTo" class="elite-input" style="appearance: auto; background-color: #1e293b;">
                <option v-for="y in 21" :key="'yto-'+y" :value="2019 + y">{{ 2019 + y }}</option>
              </select>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Elite Toolbar -->
    <div class="elite-filter-panel" style="margin-bottom: 1rem; padding: 0.75rem 1.5rem; display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.7); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); backdrop-filter: blur(10px); position: relative; z-index: 45;">
      <div style="display: flex; gap: 12px; align-items: center; flex: 1; max-width: 500px; flex-wrap: wrap;">
        <div class="search-container" style="position: relative; flex: 1; min-width: 250px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" v-model="searchQuery" placeholder="Tìm tên KH, mã hợp đồng..." class="elite-input" style="width: 100%; box-sizing: border-box; padding: 0.5rem 1rem 0.5rem 2.5rem; border-radius: 99px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #fff; outline: none; transition: all 0.2s; font-size: 0.85rem;" onfocus="this.style.borderColor='#10b981'; this.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'" />
        </div>
        <button class="tech-vip-btn" @click="openAddCustomerModal" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; border-radius: 99px; padding: 0 16px; height: 34px; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-size: 0.85rem; font-weight: 600;" onmouseover="this.style.background='rgba(16, 185, 129, 0.2)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.1)'; this.style.transform='none'" title="Thêm khách hàng nhanh">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm khách hàng
        </button>
      </div>

      <div class="toolbar-selectors" style="display: flex; align-items: center; gap: 16px; margin-right: 12px; flex: 1; justify-content: flex-end; flex-wrap: wrap;">
        <div class="company-selector" style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 600;">Công ty / KH:</span>
          <div style="position: relative; min-width: 200px; max-width: 350px; flex: 1;">
            <!-- Nút bấm hiển thị -->
            <div @click="showCompanyFilterDropdown = !showCompanyFilterDropdown" class="elite-input" style="background: #0f172a; border: 1px solid rgba(16,185,129,0.3); color: #10b981; font-weight: 600; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; min-height: 32px;">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="filterConfig.companyCustomer ? uniqueCompanyCustomers.find(c => c.key === filterConfig.companyCustomer)?.label : 'Tất cả Công ty / KH'">
                {{ filterConfig.companyCustomer ? uniqueCompanyCustomers.find(c => c.key === filterConfig.companyCustomer)?.label : 'Tất cả Công ty / KH' }}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            <!-- Overlay để click ra ngoài đóng dropdown -->
            <div v-if="showCompanyFilterDropdown" class="dropdown-overlay" @click="showCompanyFilterDropdown = false"></div>

            <!-- Danh sách tùy chọn -->
            <div v-if="showCompanyFilterDropdown" style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px; background: #0f172a; border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; z-index: 50; max-height: 350px; overflow-y: auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
              <div @click="filterConfig.companyCustomer = ''; showCompanyFilterDropdown = false" style="padding: 10px 12px; cursor: pointer; color: #10b981; font-size: 0.85rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(16,185,129,0.1)'" onmouseout="this.style.background='transparent'">
                Tất cả Công ty / KH
              </div>
              <div v-for="c in uniqueCompanyCustomers" :key="c.key" @click="filterConfig.companyCustomer = c.key; showCompanyFilterDropdown = false" style="padding: 10px 12px; cursor: pointer; color: #10b981; font-size: 0.85rem; transition: background 0.2s; white-space: normal; word-wrap: break-word; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.05);" onmouseover="this.style.background='rgba(16,185,129,0.1)'" onmouseout="this.style.background='transparent'">
                {{ c.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="workflow-selector" style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 600;">Quy trình:</span>
          <select v-model="selectedWorkflowId" class="elite-input" style="background: #0f172a; border: 1px solid rgba(16,185,129,0.3); color: #10b981; font-weight: 600; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; outline: none; min-width: 150px;">
            <option value="WF_DEFAULT" style="background: #0f172a; color: #10b981;">Mặc định</option>
            <option v-for="wf in uniqueWorkflows" :key="wf.id_workflow" :value="wf.id_workflow" style="background: #0f172a; color: #10b981;">{{ wf.name_workflow }}</option>
          </select>
        </div>
      </div>

      <div class="header-actions" style="display: flex; gap: 0.75rem;">
        <button class="tech-vip-btn" @click="showExportModal = true" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Xuất Excel
        </button>
        <button class="tech-vip-btn" @click="openAddModal" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm pipeline mới
        </button>
        <button class="tech-vip-btn" @click="fetchData" :disabled="loading" style="background: rgba(255,255,255,0.1); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
          <span v-else class="spinner small"></span>
          Làm mới
        </button>
      </div>
    </div>

    <!-- Kanban Board Wrapper -->
    <div class="kanban-wrapper" :class="{ 'is-dragging': isDragging }" @dragover="onDragOver" v-if="!loading || items.length > 0" style="display: flex; gap: 8px; flex: 1; overflow: visible; padding-bottom: 12px;">
      
      <!-- Backlog / Unassigned Column -->
      <div class="kanban-column unassigned-col" data-col-name="Chưa phân loại" style="background: rgba(15, 23, 42, 0.8); border: 1px dashed rgba(148, 163, 184, 0.3);">
        <div class="kanban-header" style="background: rgba(148, 163, 184, 0.15);">
          <div class="kanban-title">
            <span class="status-dot" style="background: #94a3b8; box-shadow: 0 0 8px rgba(148,163,184,0.5);"></span>
            <h3 style="color: #94a3b8; margin: 0; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Chưa phân loại</h3>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="kanban-badge">{{ boardData.unassigned?.length || 0 }}</span>
          </div>
        </div>
        <draggable v-show="true"
          v-model="boardData.unassigned"
          group="pipeline"
          item-key="Id_pipeline"
          :disabled="isMobile"
          @change="(evt) => onChange(evt, 'unassigned')"
          @start="isDragging = true"
          @end="isDragging = false"
          class="draggable-zone"
          ghost-class="ghost-card"
          animation="200"
        >
          <template #item="{ element }">
            <div v-if="element.isGroup" class="kanban-group-folder" v-show="matchesSearch(element)" :style="{ background: 'transparent', padding: '0', border: 'none', position: 'relative' }">
              <div class="nested-dropzone-container" style="display: flex; flex-direction: column; gap: 24px;">
                <draggable
                  v-model="element.linked_items"
                  group="pipeline"
                  item-key="Id_pipeline"
                  :disabled="isMobile"
                  @change="(evt) => onNestedChange(evt, element)"
                  class="nested-dropzone"
                  ghost-class="ghost-sub-card"
                  animation="200"
                >
                  <template #item="{ element: child, index }">
                    <div style="position: relative;" :style="{ marginTop: index > 0 ? '24px' : '0' }">
                      <div v-if="index > 0" :style="{ position: 'absolute', left: '50%', top: '-24px', transform: 'translateX(-50%)', width: '2px', height: '24px', background: '#94a3b8' }"></div>
                      <div :id="'pipeline-card-' + child.Id_pipeline" class="kanban-card vip-card" :class="{'highlight-card': highlightedCardId === child.Id_pipeline}" @click="mergeMode ? toggleMergeSelect(child) : openEditModal(child)" :style="{ cursor: 'pointer', margin: 0, border: mergeSelected.find(i => i.Id_pipeline === child.Id_pipeline) ? '2px solid #3b82f6' : '' }">
                        <div class="tl-shimmer-border"></div>
                        <div :style="{ background: '#475569', color: '#ffffff', padding: '6px 16px', margin: '-16px -16px 6px -16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' }">
                          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {{ child.finish_time || 'No Deadline' }}
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <button v-if="!mergeMode" @click.stop="startMerge(child)" title="Gộp thẻ" style="background: rgba(255,255,255,0.1); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; display: flex; align-items: center; justify-content: center;">🔗</button>
                            <input v-if="mergeMode && mergeTarget?.Id_pipeline !== child.Id_pipeline" type="checkbox" :checked="!!mergeSelected.find(i => i.Id_pipeline === child.Id_pipeline)" @click.stop="toggleMergeSelect(child)" style="cursor: pointer; width: 16px; height: 16px;" />
                            <span v-if="mergeMode && mergeTarget?.Id_pipeline === child.Id_pipeline" style="font-size: 11px; color: #fbbf24; font-weight: 800;">GỐC</span>
                          </div>
                        </div>
                        <div class="vip-card-header" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 8px; width: 100%;" v-if="child.ten_khach_hang || child.ten_cong_ty || child.tag">
                          <div class="vip-badges" style="display: flex; flex-wrap: wrap; gap: 6px; flex: 1;" v-if="child.ten_khach_hang || child.ten_cong_ty">
                            <span class="vip-badge" style="background: #ffffff; color: #334155; border: none; padding: 2px 6px; font-size: 9px; font-weight: 800;">{{ child.ten_cong_ty || child.ten_khach_hang }}</span>
                          </div>
                          <span class="vip-badge tag-normal" v-if="child.tag && child.tag.toLowerCase() !== 'bình thường'" :class="getTagClass(child.tag)" style="flex-shrink: 0; font-size: 9px;">{{ child.tag }}</span>
                        </div>
          
                        <div class="vip-content" style="margin-top: 6px;">
                          <h4 class="vip-desc" style="color: #f8fafc; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">{{ child.content_of_contract_po || 'Chưa có nội dung hợp đồng' }}</h4>
                          
                          <div v-if="child.quantity || child.type || child.volume" style="margin-bottom: 8px;">
                            <span class="vip-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                              {{ [child.quantity, child.type, formatNumber(child.volume)].filter(Boolean).join(' - ') }}
                            </span>
                          </div>
          
                          <div v-if="child.ghi_chu_hop_dong" style="color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 0px;">
                            {{ child.ghi_chu_hop_dong }}
                          </div>
                        </div>
          
                        <div class="vip-footer" style="margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
                          <div v-if="child.ten_file || child.report_id" style="display: flex; flex-direction: column; gap: 8px; margin-top: 0;">
                            <details v-if="child.ten_file" class="vip-details" @click.stop>
                              <summary style="font-size: 11px; color: #ffffff; cursor: pointer; user-select: none; font-weight: 600; outline: none; margin: 0; padding: 0; margin-left: -14px; text-align: left;">
                                FILE ĐÍNH KÈM (<span style="color: #ef4444; font-size: 13px; font-weight: 800;">{{ String(child.ten_file).split(',').filter(f => f.trim()).length }}</span>)
                              </summary>
                              <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 12px; margin-top: 6px;">
                                <div v-for="(fileItem, idx) in getParsedFiles(child)" :key="'f-'+idx" style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #ffffff;">
                                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                  
                                  <a :href="getPreviewUrl(fileItem.url)" target="_blank" @click.stop style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; color: #ffffff; text-decoration: none;" :title="'Xem trước: ' + fileItem.name" class="file-link-hover">
                                    {{ fileItem.name }}
                                  </a>
                                  
                                  <a v-if="fileItem.url !== '#'" :href="getDownloadUrl(fileItem.url)" target="_blank" @click.stop style="color: #9ca3af; flex-shrink: 0; margin-left: auto; transition: color 0.2s;" class="download-icon-hover" title="Tải xuống">
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                  </a>
                                </div>
                              </div>
                            </details>
                            <details v-if="child.report_id" class="vip-details" @click.stop>
                              <summary style="font-size: 11px; color: #ffffff; cursor: pointer; user-select: none; font-weight: 600; outline: none; margin: 0; padding: 0; margin-left: -14px; text-align: left;">
                                REPORT ĐÍNH KÈM (<span style="color: #ef4444; font-size: 13px; font-weight: 800;">{{ String(child.report_id).split(',').filter(r => r.trim()).length }}</span>)
                              </summary>
                              <div style="display: flex; flex-direction: column; gap: 6px; padding-left: 12px; margin-top: 6px;">
                                <a v-for="(rep, idx) in String(child.report_id).split(',').filter(r => r.trim())" :key="'r-'+idx" :href="'/report?id=' + rep.trim()" target="_blank" @click.stop style="display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #ffffff; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'" :title="'Mở report: ' + rep.trim()">
                                  <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #10b981; flex-shrink: 0; margin-top: 5px;"></div>
                                  <div style="display: flex; flex-direction: column; word-break: break-word; white-space: normal; line-height: 1.3;">
                                    <span style="font-weight: 500;">{{ getReportDetails(rep.trim()).noi_dung }}</span>
                                    <span v-if="getReportDetails(rep.trim()).ghi_chu" style="color: #cbd5e1; font-size: 11px; margin-top: 2px;">
                                      <i>Ghi chú:</i> {{ getReportDetails(rep.trim()).ghi_chu }}
                                    </span>
                                  </div>
                                </a>
                              </div>
                            </details>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>

            <div v-else :id="'pipeline-card-' + element.Id_pipeline" class="kanban-card vip-card" :class="{'highlight-card': highlightedCardId === element.Id_pipeline}" v-show="matchesSearch(element)" @click="mergeMode ? toggleMergeSelect(element) : openEditModal(element)" :style="{ cursor: 'pointer', border: mergeSelected.find(i => i.Id_pipeline === element.Id_pipeline) ? '2px solid #3b82f6' : '' }">
              <div class="tl-shimmer-border"></div>
              <div :style="{ background: '#475569', color: '#ffffff', padding: '6px 16px', margin: '-16px -16px 6px -16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' }">
                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {{ element.finish_time || 'No Deadline' }}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button v-if="!mergeMode" @click.stop="startMerge(element)" title="Gộp thẻ" style="background: rgba(255,255,255,0.1); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; display: flex; align-items: center; justify-content: center;">🔗</button>
                  <input v-if="mergeMode && mergeTarget?.Id_pipeline !== element.Id_pipeline" type="checkbox" :checked="!!mergeSelected.find(i => i.Id_pipeline === element.Id_pipeline)" @click.stop="toggleMergeSelect(element)" style="cursor: pointer; width: 16px; height: 16px;" />
                  <span v-if="mergeMode && mergeTarget?.Id_pipeline === element.Id_pipeline" style="font-size: 11px; color: #fbbf24; font-weight: 800;">GỐC</span>
                </div>
              </div>
              <div class="vip-card-header" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 8px; width: 100%;" v-if="element.ten_khach_hang || element.ten_cong_ty || element.tag">
                <div class="vip-badges" style="display: flex; flex-wrap: wrap; gap: 6px; flex: 1;" v-if="element.ten_khach_hang || element.ten_cong_ty">
                  <span class="vip-badge" style="background: #ffffff; color: #334155; border: none; padding: 2px 6px; font-size: 9px; font-weight: 800;">{{ element.ten_cong_ty || element.ten_khach_hang }}</span>
                </div>
                <span class="vip-badge tag-normal" v-if="element.tag && element.tag.toLowerCase() !== 'bình thường'" :class="getTagClass(element.tag)" style="flex-shrink: 0; font-size: 9px;">{{ element.tag }}</span>
              </div>

              <div class="vip-content" style="margin-top: 6px;">
                <h4 class="vip-desc" style="color: #f8fafc; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">{{ element.content_of_contract_po || 'Chưa có nội dung hợp đồng' }}</h4>
                
                <div v-if="element.quantity || element.type || element.volume" style="margin-bottom: 8px;">
                  <span class="vip-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                    {{ [element.quantity, element.type, formatNumber(element.volume)].filter(Boolean).join(' - ') }}
                  </span>
                </div>

                <div v-if="element.ghi_chu_hop_dong" style="color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 0px;">
                  {{ element.ghi_chu_hop_dong }}
                </div>
              </div>

              <div class="vip-footer" style="margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
                <div v-if="element.ten_file || element.report_id" style="display: flex; flex-direction: column; gap: 8px; margin-top: 0;">
                  <details v-if="element.ten_file" class="vip-details" @click.stop>
                    <summary style="font-size: 11px; color: #ffffff; cursor: pointer; user-select: none; font-weight: 600; outline: none; margin: 0; padding: 0; margin-left: -14px; text-align: left;">
                      FILE ĐÍNH KÈM (<span style="color: #ef4444; font-size: 13px; font-weight: 800;">{{ String(element.ten_file).split(',').filter(f => f.trim()).length }}</span>)
                    </summary>
                    <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 12px; margin-top: 6px;">
                      <div v-for="(fileItem, idx) in getParsedFiles(element)" :key="'f-'+idx" style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #ffffff;">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        
                        <a :href="getPreviewUrl(fileItem.url)" target="_blank" @click.stop style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; color: #ffffff; text-decoration: none;" :title="'Xem trước: ' + fileItem.name" class="file-link-hover">
                          {{ fileItem.name }}
                        </a>
                        
                        <a v-if="fileItem.url !== '#'" :href="getDownloadUrl(fileItem.url)" target="_blank" @click.stop style="color: #9ca3af; flex-shrink: 0; margin-left: auto; transition: color 0.2s;" class="download-icon-hover" title="Tải xuống">
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                      </div>
                    </div>
                  </details>
                  <details v-if="element.report_id" class="vip-details" @click.stop>
                    <summary style="font-size: 11px; color: #ffffff; cursor: pointer; user-select: none; font-weight: 600; outline: none; margin: 0; padding: 0; margin-left: -14px; text-align: left;">
                      REPORT ĐÍNH KÈM (<span style="color: #ef4444; font-size: 13px; font-weight: 800;">{{ String(element.report_id).split(',').filter(r => r.trim()).length }}</span>)
                    </summary>
                    <div style="display: flex; flex-direction: column; gap: 6px; padding-left: 12px; margin-top: 6px;">
                      <a v-for="(rep, idx) in String(element.report_id).split(',').filter(r => r.trim())" :key="'r-'+idx" :href="'/report?id=' + rep.trim()" target="_blank" @click.stop style="display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #ffffff; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'" :title="'Mở report: ' + rep.trim()">
                        <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #10b981; flex-shrink: 0; margin-top: 5px;"></div>
                        <div style="display: flex; flex-direction: column; word-break: break-word; white-space: normal; line-height: 1.3;">
                          <span style="font-weight: 500;">{{ getReportDetails(rep.trim()).noi_dung }}</span>
                          <span v-if="getReportDetails(rep.trim()).ghi_chu" style="color: #cbd5e1; font-size: 11px; margin-top: 2px;">
                            <i>Ghi chú:</i> {{ getReportDetails(rep.trim()).ghi_chu }}
                          </span>
                        </div>
                      </a>
                    </div>
                  </details>
                </div>

              </div>

            </div>
          </template>
        </draggable>
      </div>

      <!-- Main Kanban Board -->
      <div class="kanban-board" :class="{ 'is-dragging': isDragging }" style="padding-bottom: 0; flex: 7;">
        <div class="kanban-column" v-for="col in COLUMNS" :key="col.id" :data-col-name="col.label" :class="{ 'col-that-bai': col.id === 'that_bai', 'col-hoan-thanh': col.id === 'hoan_thanh' }" :style="(!isMobile && collapsedCols[col.id]) ? 'min-width: 48px; width: 48px; flex: none;' : ''">
          <div class="kanban-header" :style="{ background: getColHeaderBg(col.id), ...((!isMobile && collapsedCols[col.id]) ? { flexDirection: 'column', padding: '12px 4px', height: '100%', position: 'relative' } : {}) }">
            <div class="kanban-title" :style="(!isMobile && collapsedCols[col.id]) ? 'flex-direction: column; gap: 12px;' : ''">
              <span class="status-dot" :class="getColColorClass(col.id)" :style="getColColorStyle(col, !isMobile && collapsedCols[col.id])"></span>
              <h3 v-if="isMobile || !collapsedCols[col.id]" style="margin: 0; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;" :style="{ color: getColTitleColor(col.id) }">{{ col.label }}</h3>
              <h3 v-else style="margin: 0; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; writing-mode: vertical-rl; transform: rotate(180deg); margin-top: 12px; white-space: nowrap;" :style="{ color: getColTitleColor(col.id) }">{{ col.label }}</h3>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;" :style="(!isMobile && collapsedCols[col.id]) ? 'flex-direction: column; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin-top: 0;' : ''">
              <span class="kanban-badge" v-show="isMobile || !collapsedCols[col.id]">{{ boardData[col.id]?.length || 0 }}</span>
              <button v-if="!isMobile && (col.id === 'that_bai' || col.id === 'hoan_thanh')" @click.stop="collapsedCols[col.id] = !collapsedCols[col.id]" :title="collapsedCols[col.id] ? 'Hiện cột' : 'Thu gọn cột'" :style="{ background: col.id === 'that_bai' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: col.id === 'that_bai' ? '#ef4444' : '#10b981', border: col.id === 'that_bai' ? '1px dashed rgba(239, 68, 68, 0.4)' : '1px dashed rgba(16, 185, 129, 0.4)', borderRadius: '6px', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }" @mouseover="e => e.currentTarget.style.background = col.id === 'that_bai' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'" @mouseout="e => e.currentTarget.style.background = col.id === 'that_bai' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'">
                <svg v-if="collapsedCols[col.id]" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
                <svg v-else viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
              </button>
            </div>
          </div>
          
          <draggable v-show="isMobile || !collapsedCols[col.id]"
            v-model="boardData[col.id]"
            group="pipeline"
            item-key="Id_pipeline"
            :disabled="isMobile"
            @change="(evt) => onChange(evt, col.id)"
            @start="isDragging = true"
            @end="isDragging = false"
            class="draggable-zone"
            ghost-class="ghost-card"
            animation="200"
          >
            <template #item="{ element }">
            <div v-if="element.isGroup" class="kanban-group-folder" v-show="matchesSearch(element)" :style="{ background: 'transparent', padding: '0', border: 'none', position: 'relative' }">
              <div class="nested-dropzone-container" style="display: flex; flex-direction: column; gap: 24px;">
                <draggable
                  v-model="element.linked_items"
                  group="pipeline"
                  item-key="Id_pipeline"
                  :disabled="isMobile"
                  @change="(evt) => onNestedChange(evt, element)"
                  class="nested-dropzone"
                  ghost-class="ghost-sub-card"
                  animation="200"
                >
                  <template #item="{ element: child, index }">
                    <div style="position: relative;" :style="{ marginTop: index > 0 ? '24px' : '0' }">
                      <div v-if="index > 0" :style="{ position: 'absolute', left: '50%', top: '-24px', transform: 'translateX(-50%)', width: '2px', height: '24px', background: (col.id === 'that_bai' || col.id === 'hoan_thanh') ? '#475569' : getColTitleColor(col.id) }"></div>
                      <div :id="'pipeline-card-' + child.Id_pipeline" class="kanban-card vip-card" :class="{'highlight-card': highlightedCardId === child.Id_pipeline}" @click="mergeMode ? toggleMergeSelect(child) : openEditModal(child)" :style="{ cursor: 'pointer', margin: 0, border: mergeSelected.find(i => i.Id_pipeline === child.Id_pipeline) ? '2px solid #3b82f6' : ((col.id === 'that_bai' || col.id === 'hoan_thanh') ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${getColTitleColor(col.id)}`) }">
                        <div class="tl-shimmer-border"></div>
                        <div :style="{ background: 'transparent', color: getColTitleColor(col.id), padding: '6px 16px', margin: '-16px -16px 6px -16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' }">
                          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {{ child.finish_time || 'No Deadline' }}
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <button v-if="!mergeMode" @click.stop="startMerge(child)" title="Gộp thẻ" style="background: rgba(255,255,255,0.2); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; display: flex; align-items: center; justify-content: center;">🔗</button>
                            <input v-if="mergeMode && mergeTarget?.Id_pipeline !== child.Id_pipeline" type="checkbox" :checked="!!mergeSelected.find(i => i.Id_pipeline === child.Id_pipeline)" @click.stop="toggleMergeSelect(child)" style="cursor: pointer; width: 16px; height: 16px;" />
                            <span v-if="mergeMode && mergeTarget?.Id_pipeline === child.Id_pipeline" style="font-size: 11px; color: #fbbf24; font-weight: 800;">GỐC</span>
                          </div>
                        </div>
                        <div class="vip-card-header" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 8px; width: 100%;" v-if="child.ten_khach_hang || child.ten_cong_ty || child.tag">
                          <div class="vip-badges" style="display: flex; flex-wrap: wrap; gap: 6px; flex: 1;" v-if="child.ten_khach_hang || child.ten_cong_ty">
                            <span class="vip-badge" :style="{ background: '#ffffff', color: getColDarkColor(col.id), border: 'none', padding: '2px 6px', fontSize: '9px', fontWeight: '800' }">{{ child.ten_cong_ty || child.ten_khach_hang }}</span>
                          </div>
                          <span class="vip-badge tag-normal" v-if="child.tag && child.tag.toLowerCase() !== 'bình thường'" :class="getTagClass(child.tag)" style="flex-shrink: 0; font-size: 9px;">{{ child.tag }}</span>
                        </div>
          
                        <div class="vip-content" style="margin-top: 6px;">
                          <h4 class="vip-desc" style="color: #f8fafc; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">{{ child.content_of_contract_po || 'Chưa có nội dung hợp đồng' }}</h4>
                          
                          <div v-if="child.quantity || child.type || child.volume" style="margin-bottom: 8px;">
                            <span class="vip-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                              {{ [child.quantity, child.type, formatNumber(child.volume)].filter(Boolean).join(' - ') }}
                            </span>
                          </div>
          
                          <div v-if="child.ghi_chu_hop_dong" style="color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 0px;">
                            {{ child.ghi_chu_hop_dong }}
                          </div>
                        </div>
          
                        <div class="vip-footer" style="margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
                          <div v-if="child.ten_file || child.report_id" style="display: flex; flex-direction: column; gap: 8px; margin-top: 0;">
                            <details v-if="child.ten_file" class="vip-details" @click.stop>
                              <summary style="font-size: 11px; color: #ffffff; cursor: pointer; user-select: none; font-weight: 600; outline: none; margin: 0; padding: 0; margin-left: -14px; text-align: left;">
                                FILE ĐÍNH KÈM (<span style="color: #ef4444; font-size: 13px; font-weight: 800;">{{ String(child.ten_file).split(',').filter(f => f.trim()).length }}</span>)
                              </summary>
                              <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 12px; margin-top: 6px;">
                                <div v-for="(fileItem, idx) in getParsedFiles(child)" :key="'f-'+idx" style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #ffffff;">
                                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                  
                                  <a :href="getPreviewUrl(fileItem.url)" target="_blank" @click.stop style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; color: #ffffff; text-decoration: none;" :title="'Xem trước: ' + fileItem.name" class="file-link-hover">
                                    {{ fileItem.name }}
                                  </a>
                                  
                                  <a v-if="fileItem.url !== '#'" :href="getDownloadUrl(fileItem.url)" target="_blank" @click.stop style="color: #9ca3af; flex-shrink: 0; margin-left: auto; transition: color 0.2s;" class="download-icon-hover" title="Tải xuống">
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                  </a>
                                </div>
                              </div>
                            </details>
                            <details v-if="child.report_id" class="vip-details" @click.stop>
                              <summary style="font-size: 11px; color: #ffffff; cursor: pointer; user-select: none; font-weight: 600; outline: none; margin: 0; padding: 0; margin-left: -14px; text-align: left;">
                                REPORT ĐÍNH KÈM (<span style="color: #ef4444; font-size: 13px; font-weight: 800;">{{ String(child.report_id).split(',').filter(r => r.trim()).length }}</span>)
                              </summary>
                              <div style="display: flex; flex-direction: column; gap: 6px; padding-left: 12px; margin-top: 6px;">
                                <a v-for="(rep, idx) in String(child.report_id).split(',').filter(r => r.trim())" :key="'r-'+idx" :href="'/report?id=' + rep.trim()" target="_blank" @click.stop style="display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #ffffff; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'" :title="'Mở report: ' + rep.trim()">
                                  <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #10b981; flex-shrink: 0; margin-top: 5px;"></div>
                                  <div style="display: flex; flex-direction: column; word-break: break-word; white-space: normal; line-height: 1.3;">
                                    <span style="font-weight: 500;">{{ getReportDetails(rep.trim()).noi_dung }}</span>
                                    <span v-if="getReportDetails(rep.trim()).ghi_chu" style="color: #cbd5e1; font-size: 11px; margin-top: 2px;">
                                      <i>Ghi chú:</i> {{ getReportDetails(rep.trim()).ghi_chu }}
                                    </span>
                                  </div>
                                </a>
                              </div>
                            </details>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>

            <div v-else :id="'pipeline-card-' + element.Id_pipeline" class="kanban-card vip-card" :class="{'highlight-card': highlightedCardId === element.Id_pipeline}" v-show="matchesSearch(element)" @click="mergeMode ? toggleMergeSelect(element) : openEditModal(element)" :style="{ cursor: 'pointer', border: mergeSelected.find(i => i.Id_pipeline === element.Id_pipeline) ? '2px solid #3b82f6' : ((col.id === 'that_bai' || col.id === 'hoan_thanh') ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${getColTitleColor(col.id)}`) }">
              <div class="tl-shimmer-border"></div>
              <div :style="{ background: 'transparent', color: getColTitleColor(col.id), padding: '6px 16px', margin: '-16px -16px 6px -16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' }">
                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {{ element.finish_time || 'No Deadline' }}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button v-if="!mergeMode" @click.stop="startMerge(element)" title="Gộp thẻ" style="background: rgba(255,255,255,0.2); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; display: flex; align-items: center; justify-content: center;">🔗</button>
                  <input v-if="mergeMode && mergeTarget?.Id_pipeline !== element.Id_pipeline" type="checkbox" :checked="!!mergeSelected.find(i => i.Id_pipeline === element.Id_pipeline)" @click.stop="toggleMergeSelect(element)" style="cursor: pointer; width: 16px; height: 16px;" />
                  <span v-if="mergeMode && mergeTarget?.Id_pipeline === element.Id_pipeline" style="font-size: 11px; color: #fbbf24; font-weight: 800;">GỐC</span>
                </div>
              </div>
              <div class="vip-card-header" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 8px; width: 100%;" v-if="element.ten_khach_hang || element.ten_cong_ty || element.tag">
                <div class="vip-badges" style="display: flex; flex-wrap: wrap; gap: 6px; flex: 1;" v-if="element.ten_khach_hang || element.ten_cong_ty">
                  <span class="vip-badge" :style="{ background: '#ffffff', color: getColDarkColor(col.id), border: 'none', padding: '2px 6px', fontSize: '9px', fontWeight: '800' }">{{ element.ten_cong_ty || element.ten_khach_hang }}</span>
                </div>
                <span class="vip-badge tag-normal" v-if="element.tag && element.tag.toLowerCase() !== 'bình thường'" :class="getTagClass(element.tag)" style="flex-shrink: 0; font-size: 9px;">{{ element.tag }}</span>
              </div>

              <div class="vip-content" style="margin-top: 6px;">
                <h4 class="vip-desc" style="color: #f8fafc; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">{{ element.content_of_contract_po || 'Chưa có nội dung hợp đồng' }}</h4>
                
                <div v-if="element.quantity || element.type || element.volume" style="margin-bottom: 8px;">
                  <span class="vip-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                    {{ [element.quantity, element.type, formatNumber(element.volume)].filter(Boolean).join(' - ') }}
                  </span>
                </div>

                <div v-if="element.ghi_chu_hop_dong" style="color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 0px;">
                  {{ element.ghi_chu_hop_dong }}
                </div>
              </div>

              <div class="vip-footer" style="margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
                <div v-if="element.ten_file || element.report_id" style="display: flex; flex-direction: column; gap: 8px; margin-top: 0;">
                  <details v-if="element.ten_file" class="vip-details" @click.stop>
                    <summary style="font-size: 11px; color: #ffffff; cursor: pointer; user-select: none; font-weight: 600; outline: none; margin: 0; padding: 0; margin-left: -14px; text-align: left;">
                      FILE ĐÍNH KÈM (<span style="color: #ef4444; font-size: 13px; font-weight: 800;">{{ String(element.ten_file).split(',').filter(f => f.trim()).length }}</span>)
                    </summary>
                    <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 12px; margin-top: 6px;">
                      <div v-for="(fileItem, idx) in getParsedFiles(element)" :key="'f-'+idx" style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #ffffff;">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        
                        <a :href="getPreviewUrl(fileItem.url)" target="_blank" @click.stop style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; color: #ffffff; text-decoration: none;" :title="'Xem trước: ' + fileItem.name" class="file-link-hover">
                          {{ fileItem.name }}
                        </a>
                        
                        <a v-if="fileItem.url !== '#'" :href="getDownloadUrl(fileItem.url)" target="_blank" @click.stop style="color: #9ca3af; flex-shrink: 0; margin-left: auto; transition: color 0.2s;" class="download-icon-hover" title="Tải xuống">
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                      </div>
                    </div>
                  </details>
                  <details v-if="element.report_id" class="vip-details" @click.stop>
                    <summary style="font-size: 11px; color: #ffffff; cursor: pointer; user-select: none; font-weight: 600; outline: none; margin: 0; padding: 0; margin-left: -14px; text-align: left;">
                      REPORT ĐÍNH KÈM (<span style="color: #ef4444; font-size: 13px; font-weight: 800;">{{ String(element.report_id).split(',').filter(r => r.trim()).length }}</span>)
                    </summary>
                    <div style="display: flex; flex-direction: column; gap: 6px; padding-left: 12px; margin-top: 6px;">
                      <a v-for="(rep, idx) in String(element.report_id).split(',').filter(r => r.trim())" :key="'r-'+idx" :href="'/report?id=' + rep.trim()" target="_blank" @click.stop style="display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #ffffff; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'" :title="'Mở report: ' + rep.trim()">
                        <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #10b981; flex-shrink: 0; margin-top: 5px;"></div>
                        <div style="display: flex; flex-direction: column; word-break: break-word; white-space: normal; line-height: 1.3;">
                          <span style="font-weight: 500;">{{ getReportDetails(rep.trim()).noi_dung }}</span>
                          <span v-if="getReportDetails(rep.trim()).ghi_chu" style="color: #cbd5e1; font-size: 11px; margin-top: 2px;">
                            <i>Ghi chú:</i> {{ getReportDetails(rep.trim()).ghi_chu }}
                          </span>
                        </div>
                      </a>
                    </div>
                  </details>
                </div>

              </div>

            </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="loading-state">
      <span class="spinner large"></span>
      <p>Đang tải bảng Kanban...</p>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content large-modal" style="width: 1400px; max-width: 98vw; max-height: 95vh; background: #0f172a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        <div class="modal-header" style="padding: 1rem 1.25rem 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 18px; color: #f8fafc; font-weight: 700;">{{ isEditing ? 'Cập nhật Pipeline' : 'Thêm Pipeline mới' }}</h2>
          <button class="close-btn" @click="closeModal" style="background: none; border: none; color: #ffffff; font-size: 28px; cursor: pointer; line-height: 1; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">&times;</button>
        </div>
        <div class="modal-body" style="padding: 24px; overflow-y: auto; flex: 1;">
          <form @submit.prevent="saveItem" class="form-grid" style="gap: 24px;">
            <!-- Cột 1 -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div class="form-group">
                <label>Quy trình (Workflow)</label>
                <select v-model="formData.id_workflow" class="input-field" @change="onModalWorkflowChange">
                  <option value="">Quy trình mặc định</option>
                  <option v-for="wf in uniqueWorkflows" :key="wf.id_workflow" :value="wf.id_workflow">{{ wf.name_workflow }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tag (Phân loại)</label>
                <select v-model="formData.tag" class="input-field">
                  <option value="Bình thường">Bình thường</option>
                  <option value="Bám đuổi">Bám đuổi</option>
                  <option value="Ưu tiên">Ưu tiên</option>
                </select>
              </div>
              <div class="form-group">
                <label>Trạng thái (Status Name)</label>
                <select v-model="formData.status_name" class="input-field" @change="onStatusNameChange">
                  <option v-for="col in MODAL_COLUMNS" :key="col.id" :value="col.value">{{ col.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Finish Time (Dự kiến trong khoảng)</label>
                <div class="finish-time-row" style="display: flex; gap: 6px; align-items: center;">
                  <div style="flex: 1; width: 100%; position: relative;">
                    <div class="mobile-label" style="display: none; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Từ tháng:</div>
                    <input type="month" v-model="tempStartDate" @change="updateFinishTime" @click="$event.target.showPicker && $event.target.showPicker()" class="input-field" style="color: #fff; background: rgba(0,0,0,0.2); width: 100%; color-scheme: dark; cursor: pointer; padding: 8px 6px; min-width: 0; font-size: 12px; box-sizing: border-box;" title="Chọn tháng bắt đầu" />
                  </div>
                  <span class="finish-time-separator" style="color: #94a3b8; font-weight: bold;">-</span>
                  <div style="flex: 1; width: 100%; position: relative;">
                    <div class="mobile-label" style="display: none; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Đến tháng:</div>
                    <input type="month" v-model="tempEndDate" @change="updateFinishTime" @click="$event.target.showPicker && $event.target.showPicker()" class="input-field" style="color: #fff; background: rgba(0,0,0,0.2); width: 100%; color-scheme: dark; cursor: pointer; padding: 8px 6px; min-width: 0; font-size: 12px; box-sizing: border-box;" title="Chọn tháng kết thúc" />
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Tên khách hàng</label>
                <div style="display: flex; gap: 8px;">
                  <input v-model="formData.ten_khach_hang" type="text" class="input-field" style="flex: 1;" />
                  <button type="button" @click="openCustomerSearch('ten_khach_hang')" style="background: #10b981; color: #ffffff; border: 1px solid #059669; padding: 0 12px; border-radius: 6px; cursor: pointer; white-space: nowrap; font-weight: 600; font-size: 13px; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">Tìm KH</button>
                </div>
              </div>
              <div class="form-group">
                <label>Tên công ty</label>
                <div style="display: flex; gap: 8px;">
                  <input v-model="formData.ten_cong_ty" type="text" class="input-field" style="flex: 1;" />
                  <button type="button" @click="openCustomerSearch('ten_cong_ty')" style="background: #10b981; color: #ffffff; border: 1px solid #059669; padding: 0 12px; border-radius: 6px; cursor: pointer; white-space: nowrap; font-weight: 600; font-size: 13px; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">Tìm CTy</button>
                </div>
              </div>
              <div class="form-group">
                <label>A.M (Account Manager)</label>
                <input v-model="formData.AM" type="text" class="input-field" />
              </div>
              
              <!-- Ẩn -->
              <div style="display: none;">
                <input v-model="formData['%status']" type="hidden" />
                <input v-model="formData.isSuccess" type="hidden" />
                <input v-model="formData.ma_khach_hang" type="hidden" />
                <input v-model="formData.ma_cong_ty" type="hidden" />
              </div>
            </div>

            <!-- Cột 2 -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div class="form-group">
                <label>Nội dung hợp đồng / PO</label>
                <div style="display: flex; gap: 8px;">
                  <input v-model="formData.content_of_contract_po" type="text" class="input-field" style="flex: 1;" />
                  <button type="button" @click="showReportContentModal = true" style="background: #3b82f6; color: #ffffff; border: 1px solid #2563eb; padding: 0 12px; border-radius: 6px; cursor: pointer; white-space: nowrap; font-weight: 600; font-size: 13px; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Chọn Report</button>
                </div>
              </div>
              <div class="form-group">
                <label>Volume</label>
                <div style="display: flex; gap: 8px;">
                  <NumberInput v-model="formData.volume" class="input-field" style="flex: 1;" />
                  <button type="button" @click="triggerScanVolumeFile" class="tech-vip-btn" style="padding: 0 16px; border-radius: 8px; flex-shrink: 0; background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3); color: #38bdf8; display: flex; align-items: center; gap: 6px;" title="Quét file tìm Tổng cộng trước thuế">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Quét File
                  </button>
                  <input type="file" ref="scanVolumeFileInput" @change="onScanVolumeFileChange" style="display: none;" accept=".xlsx, .xls, .pdf" />
                </div>
              </div>
              <div class="form-group">
                <label>Type</label>
                <input v-model="formData.type" type="text" list="type-options" class="input-field" placeholder="Nhập hoặc chọn..." />
                <datalist id="type-options">
                  <option value="new"></option>
                  <option value="renew"></option>
                </datalist>
              </div>
              <div class="form-group">
                <label>Quantity</label>
                <input v-model="formData.quantity" type="text" class="input-field" />
              </div>
              <div class="form-group">
                <label>Ghi chú</label>
                <input v-model="formData.ghi_chu_hop_dong" type="text" class="input-field" />
              </div>
            </div>

            <!-- Cột 3 -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div class="form-group" style="position: relative;">
                <label>Liên kết report</label>
                <div class="custom-select-container" @click="showReportDropdown = !showReportDropdown">
                  <div class="custom-select-value" style="display: flex; flex-direction: column; gap: 6px; align-items: stretch; min-height: 32px; padding: 0;">
                    <template v-if="selectedReports.length > 0">
                      <div v-for="rep in selectedReports" :key="rep.id" class="report-chip">
                        <span class="chip-text">
                          <strong>{{ rep.noi_dung || rep.id }}</strong>
                          <span v-if="rep.ghi_chu" class="chip-sub"> - {{ rep.ghi_chu }}</span>
                        </span>
                        <div style="display: flex; align-items: center; gap: 8px; margin-left: 8px; flex-shrink: 0;">
                          <a :href="'/report?id=' + rep.id" target="_blank" @click.stop title="Xem Report" style="color: inherit; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </a>
                          <span class="remove-chip" @click.stop="selectReport(rep.id)" title="Xóa">&times;</span>
                        </div>
                      </div>
                    </template>
                    <button type="button" style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 4px; color: #94a3b8; width: 100%; height: 32px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#f8fafc';" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#94a3b8';" title="Thêm Report">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </div>
                </div>
                <!-- Modal Chọn Report liên kết đã được chuyển ra ngoài form -->
              </div>

              <div class="form-group">
                <label>Mã hợp đồng</label>
                <input v-model="formData.ma_hop_dong" type="text" class="input-field" />
              </div>

              <div class="form-group" style="position: relative;">
                <label>File đính kèm</label>
                <div style="display: flex; flex-direction: column; gap: 6px; align-items: stretch; min-height: 32px;">
                  <div class="file-list" v-if="fileList.length > 0" style="margin-top: 0;">
                    <div v-for="(f, index) in fileList" :key="index" class="file-item">
                      <div class="file-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                        <span class="file-name" :title="f.name">{{ f.name }}</span>
                      </div>
                      <div class="file-actions">
                        <a v-if="f.url" :href="getPreviewUrl(f.url)" target="_blank" class="btn-icon text-primary" title="Preview">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                        <a v-if="f.url" :href="getDownloadUrl(f.url)" target="_blank" class="btn-icon text-success" title="Tải về" download>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                        <button type="button" @click="removeFile(index)" class="btn-icon text-danger" title="Xóa file">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="file-upload-wrapper">
                    <label style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 4px; color: #94a3b8; width: 100%; height: 32px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s; margin: 0; padding: 0;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#f8fafc';" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.color='#94a3b8';" title="Tải file lên">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <input type="file" multiple style="display: none;" @change="handleFileUpload" :disabled="uploadingFiles" />
                    </label>
                  </div>
                  
                  <div v-if="uploadingFiles" style="display: flex; align-items: center; gap: 8px; justify-content: center; margin-top: 4px;">
                    <span class="spinner small"></span>
                    <span style="font-size: 13px; color: #60a5fa;">Đang tải lên, chờ xíu nha...</span>
                  </div>
                </div>
              </div>

              <!-- Ẩn -->
              <div style="display: none;">
                <input v-model="formData.created_time" type="hidden" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; background: rgba(15, 23, 42, 0.4);">
          <!-- Trái rỗng để cân bằng grid -->
          <div class="hide-on-mobile"></div>
          
          <!-- Giữa: 4 Nút chức năng -->
          <div class="modal-actions-center" style="display: flex; gap: 12px; justify-content: center;" v-if="isEditing">
            <button class="vip-btn primary" @click="duplicateItem(items.find(i => i.Id_pipeline === formData.Id_pipeline) || formData)" title="Nhân bản" style="width: auto; padding: 6px 12px; gap: 6px; font-size: 13px; font-weight: 600;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Nhân bản
            </button>
            <button class="vip-btn danger hide-on-mobile" @click="requestAction(items.find(i => i.Id_pipeline === formData.Id_pipeline) || formData, 'fail')" title="Thất bại" style="width: auto; padding: 6px 12px; gap: 6px; font-size: 13px; font-weight: 600;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              Thất bại
            </button>
            <button class="vip-btn success hide-on-mobile" @click="requestAction(items.find(i => i.Id_pipeline === formData.Id_pipeline) || formData, 'complete')" title="Hoàn thành" style="width: auto; padding: 6px 12px; gap: 6px; font-size: 13px; font-weight: 600;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Hoàn thành
            </button>
            <button class="vip-btn danger" @click="requestAction(items.find(i => i.Id_pipeline === formData.Id_pipeline) || formData, 'delete')" title="Xóa" style="width: auto; padding: 6px 12px; gap: 6px; font-size: 13px; font-weight: 600;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Xóa
            </button>
          </div>
          <div v-else></div>

          <!-- Phải: Nút Hủy / Lưu -->
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" @click="closeModal" style="padding: 8px 16px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; cursor: pointer;">Hủy</button>
            <button v-show="isFormChanged" type="button" class="btn btn-primary" @click="saveItem" :disabled="saving" style="padding: 8px 16px; border-radius: 6px; border: none; background: #3b82f6; color: #fff; cursor: pointer; font-weight: 600;">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Đang lưu...' : (isEditing ? 'Lưu lại' : 'Thêm mới') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Excel Modal -->
    <div class="modal-overlay" v-if="showExportModal" @click.self="showExportModal = false">
      <div class="modal-content export-modal-content" style="background: #0f172a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; overflow: hidden;">
        <div class="modal-header" style="padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 18px; color: #f8fafc; font-weight: 700;">Xuất Excel Pipeline</h2>
          <button class="close-btn" @click="showExportModal = false" style="background: none; border: none; color: #ffffff; font-size: 28px; cursor: pointer; line-height: 1;">&times;</button>
        </div>
        <div class="modal-body export-modal-body" style="padding: 1.5rem; display: flex; gap: 24px; overflow: hidden;">
          <!-- Left Column: Filters -->
          <div class="export-filters" style="display: flex; flex-direction: column; gap: 1rem; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 24px; width: 300px; flex-shrink: 0;">
            <div class="elite-form-group">
              <label style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Quy trình (Workflow)</label>
              <select v-model="exportFilters.id_workflow" style="width: 100%; box-sizing: border-box; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #fff; outline: none; color-scheme: dark;">
                <option value="">Tất cả quy trình</option>
                <option value="WF_DEFAULT">Mặc định</option>
                <option v-for="wf in uniqueWorkflows" :key="wf.id_workflow" :value="wf.id_workflow">{{ wf.name_workflow }}</option>
              </select>
            </div>
            <div class="elite-form-group">
              <label style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Từ ngày (Finish Time)</label>
              <input type="date" v-model="exportFilters.dateFrom" @click="$event.target.showPicker && $event.target.showPicker()" style="width: 100%; box-sizing: border-box; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #fff; outline: none; color-scheme: dark; cursor: pointer;" />
            </div>
            <div class="elite-form-group">
              <label style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Đến ngày</label>
              <input type="date" v-model="exportFilters.dateTo" @click="$event.target.showPicker && $event.target.showPicker()" style="width: 100%; box-sizing: border-box; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #fff; outline: none; color-scheme: dark; cursor: pointer;" />
            </div>
          </div>
          <!-- Right Column: Preview -->
          <div class="export-preview-container" style="display: flex; flex-direction: column; overflow: hidden; flex: 1;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1rem; color: #e2e8f0;">Xem trước danh sách ({{ exportPreviewList.length }} thẻ)</h3>
            <div style="overflow-y: auto; flex: 1; padding-right: 8px; display: flex; flex-direction: column; gap: 8px;">
              <div v-for="item in exportPreviewList" :key="item.Id_pipeline" style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; position: relative;">
                <button type="button" @click.stop="removeExportCard(item.Id_pipeline)" style="position: absolute; top: 8px; right: 8px; background: rgba(239, 68, 68, 0.1); border: none; border-radius: 50%; color: #ef4444; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.color='#f87171'" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.color='#ef4444'" title="Loại bỏ thẻ này khỏi danh sách xuất">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div style="font-weight: 600; color: #38bdf8; font-size: 0.95rem; padding-right: 28px;">
                  {{ item.ten_cong_ty || 'Chưa có CTy' }} - {{ item.ten_khach_hang || 'Chưa có KH' }}
                </div>
                <div v-if="item.content_of_contract_po" style="color: #f8fafc; font-size: 0.85rem; line-height: 1.4; margin-top: 2px;">
                  {{ item.content_of_contract_po }}
                </div>
                <div v-if="item.type || item.volume || item.quantity" style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; margin-top: 4px;">
                  <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 2px 6px; border-radius: 4px;">
                    {{ [item.type, formatNumber(item.volume), item.quantity].filter(Boolean).join(' - ') }}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px; font-size: 0.8rem;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; color: #cbd5e1; font-weight: 600;">
                      {{ getFormattedStatus(item) }}
                    </span>
                    <span v-if="item.ghi_chu_hop_dong" style="color: #ef4444; font-weight: 600; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      {{ item.ghi_chu_hop_dong }}
                    </span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: flex-end; color: #fbbf24; margin-top: 2px;">
                    <svg style="margin-right: 4px; vertical-align: text-bottom;" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {{ item.finish_time || 'Chưa hẹn' }}
                  </div>
                </div>
              </div>
              <div v-if="exportPreviewList.length === 0" style="text-align: center; color: #64748b; padding: 2rem; font-style: italic;">
                Không có thẻ nào phù hợp với bộ lọc.
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer export-modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.4); display: flex; justify-content: flex-end;">
          <button class="tech-vip-btn" @click="confirmExportExcel" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Xác nhận xuất Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Action Modal -->
    <div v-if="confirmActionModal.show" class="modal-overlay" @click.self="confirmActionModal.show = false" style="z-index: 10001;">
      <div class="custom-alert-modal" style="background: #1e293b; padding: 24px; border-radius: 12px; max-width: 400px; width: 100%; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
        <h3 style="color: #f8fafc; font-size: 18px; margin: 0 0 12px; font-weight: 700;">
          {{ confirmActionModal.action === 'delete' ? 'Xác nhận Xóa' : (confirmActionModal.action === 'complete' ? 'Xác nhận Thành công' : 'Xác nhận Thất bại') }}
        </h3>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
          {{ confirmActionModal.action === 'delete' ? 'Bạn có chắc muốn xóa Pipeline này?' : (confirmActionModal.action === 'complete' ? 'Bạn có chắc muốn đánh dấu Pipeline này là Thành công?' : 'Bạn có chắc muốn đánh dấu Pipeline này là Thất bại?') }}
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" @click="confirmActionModal.show = false" style="padding: 8px 16px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; cursor: pointer;">Hủy</button>
          <button class="btn" @click="executeAction" :style="{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: confirmActionModal.action === 'complete' ? '#10b981' : '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: '600' }">
            {{ confirmActionModal.action === 'delete' ? 'Xóa ngay' : 'Xác nhận' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Background syncing indicator -->
    <div class="sync-indicator" :class="{ 'is-syncing': backgroundSyncing }">
      <span class="spinner small"></span> Đang đồng bộ...
    </div>

    <!-- Floating Action Bar cho Chế độ gộp -->
    <div v-if="mergeMode" class="floating-merge-bar" style="position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1e293b; border: 2px solid #3b82f6; box-shadow: 0 10px 25px rgba(0,0,0,0.5); padding: 16px 24px; border-radius: 12px; z-index: 1000; display: flex; align-items: center; gap: 24px;">
      <div style="color: #fff; display: flex; flex-direction: column;">
        <span style="font-size: 14px; font-weight: 600;">Đang gộp vào thẻ: <span style="color: #fbbf24;">{{ mergeTarget?.ma_hop_dong || mergeTarget?.Id_pipeline }} {{ mergeTarget?.ten_khach_hang ? ('- ' + mergeTarget.ten_khach_hang) : '' }}</span></span>
        <span style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Đã chọn: <strong style="color: #3b82f6; font-size: 14px;">{{ mergeSelected.length }}</strong> thẻ cần gộp</span>
      </div>
      <div style="display: flex; gap: 12px;">
        <button @click="cancelMerge" style="background: rgba(255,255,255,0.1); color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">Hủy</button>
        <button @click="executeMerge" :disabled="mergeSelected.length === 0" :style="{ background: mergeSelected.length > 0 ? '#3b82f6' : '#475569', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: mergeSelected.length > 0 ? 'pointer' : 'not-allowed', fontWeight: '600', transition: 'background 0.2s' }" onmouseover="if(!this.disabled) this.style.background='#2563eb'" onmouseout="if(!this.disabled) this.style.background='#3b82f6'">Xác nhận gộp</button>
      </div>
    </div>
    </div>

    <!-- Modal Chọn Report liên kết (Chuyển từ trong form ra ngoài) -->
    <div class="modal-overlay" v-if="showReportDropdown" @click.self="showReportDropdown = false" style="z-index: 10005;">
      <div class="modal-content" style="width: 600px; max-width: 95vw; max-height: 70vh; background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        <div class="modal-header" style="padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 16px; color: #f8fafc; font-weight: 700;">Chọn Report liên kết</h2>
          <button type="button" @click="showReportDropdown = false" style="background: none; border: none; color: #ffffff; font-size: 24px; cursor: pointer; line-height: 1; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">&times;</button>
        </div>
        
        <div class="modal-body" style="padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow: hidden; flex: 1;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <input v-model="reportContentSearchStr" placeholder="Nhập nội dung, ghi chú, mã report..." class="input-field" style="flex: 1;" autofocus />
            <input type="month" v-model="reportContentFilterDate" @click="$event.target.showPicker && $event.target.showPicker()" class="input-field" style="width: 180px; background: rgba(0,0,0,0.2); color-scheme: dark; cursor: pointer; position: relative; z-index: 2005;" title="Chọn thời gian" placeholder="Chọn thời gian" />
          </div>
          
          <div style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
            <div v-for="r in paginatedReportContents" :key="r.id" @click="selectReport(r.id)" :style="{ padding: '12px', background: selectedReportIds.includes(r.id) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', border: '1px solid ' + (selectedReportIds.includes(r.id) ? '#10b981' : 'transparent'), transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '6px' }">
              <div v-if="r.thoi_gian" style="font-size: 11px; color: #10b981; display: flex; align-items: center; gap: 4px; font-weight: 600;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{{ formatReportTime(r.thoi_gian) }}</span>
                <svg v-if="selectedReportIds.includes(r.id)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div style="font-weight: 600; color: #f8fafc; font-size: 14px; word-break: break-word;">
                {{ r.noi_dung || 'Không có nội dung' }}
              </div>
              <div v-if="r.ghi_chu" style="font-size: 12px; color: #94a3b8; display: flex; align-items: flex-start; gap: 4px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 2px; flex-shrink: 0;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>{{ r.ghi_chu }}</span>
              </div>
            </div>

            <button type="button" v-if="hasMoreReports" @click="loadMoreReports" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px dashed rgba(16, 185, 129, 0.3); padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s; text-align: center; margin-top: 4px;" onmouseover="this.style.background='rgba(16, 185, 129, 0.2)'; this.style.borderColor='rgba(16, 185, 129, 0.5)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.1)'; this.style.borderColor='rgba(16, 185, 129, 0.3)'">Xem tiếp</button>

            <div v-if="paginatedReportContents.length === 0" style="text-align: center; padding: 30px 20px; color: #94a3b8; background: rgba(255,255,255,0.02); border-radius: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <div>Không tìm thấy report phù hợp.</div>
            </div>
          </div>

          <div style="margin-top: auto; display: flex; justify-content: flex-end; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08);">
            <button type="button" @click="showReportDropdown = false" style="padding: 10px 24px; border-radius: 8px; border: none; background: #10b981; color: #fff; cursor: pointer; font-weight: 600; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">Xong</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tìm Khách Hàng -->
    <div class="modal-overlay" v-if="showCustomerModal" @click.self="showCustomerModal = false" style="z-index: 2000;">
      <div class="modal-content" style="width: 600px; max-width: 95vw; max-height: 70vh; background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        <div class="modal-header" style="padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 16px; color: #f8fafc; font-weight: 700;">Tìm kiếm Khách Hàng</h2>
          <button @click="showCustomerModal = false" style="background: none; border: none; color: #ffffff; font-size: 24px; cursor: pointer; line-height: 1; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">&times;</button>
        </div>
        <div class="modal-body" style="padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow: hidden; flex: 1;">
          <input v-model="customerSearchStr" placeholder="Nhập tên khách hàng, tên công ty, mã KH..." class="input-field" style="width: 100%;" autofocus />
          <div v-if="loadingCustomers" style="text-align: center; padding: 20px; color: #94a3b8;">
            <span class="spinner" style="display: inline-block; margin-bottom: 8px;"></span>
            <div>Đang tải danh sách khách hàng...</div>
          </div>
          <div v-else style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
            <div v-for="c in filteredCustomers" :key="c.Ma_khach_hang" @click="selectCustomer(c)" style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; display: flex; flex-direction: column; gap: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(16, 185, 129, 0.5)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='transparent'">
              <div style="font-weight: 600; color: #f8fafc; font-size: 14px; word-break: break-word;">
                <span v-if="customerSearchTarget === 'ten_khach_hang'">{{ c.Ten_khach_hang || 'Chưa có tên KH' }}</span>
                <span v-else>{{ c.Ten_cong_ty || 'Chưa có tên CTy' }}</span>
              </div>
              <div style="font-size: 12px; color: #94a3b8;" v-if="customerSearchTarget === 'ten_khach_hang' && c.Ten_cong_ty">CTy: {{ c.Ten_cong_ty }}</div>
              <div style="font-size: 12px; color: #94a3b8;" v-if="customerSearchTarget === 'ten_cong_ty' && c.Ten_khach_hang">KH: {{ c.Ten_khach_hang }}</div>
            </div>
            <div v-if="filteredCustomers.length === 0" style="text-align: center; padding: 30px 20px; color: #94a3b8; background: rgba(255,255,255,0.02); border-radius: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <div>Không tìm thấy kết quả phù hợp.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chọn Report cho Nội dung PO -->
    <div class="modal-overlay" v-if="showReportContentModal" @click.self="showReportContentModal = false" style="z-index: 2000;">
      <div class="modal-content" style="width: 600px; max-width: 95vw; max-height: 70vh; background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        <div class="modal-header" style="padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 16px; color: #f8fafc; font-weight: 700;">Chọn Report</h2>
          <button @click="showReportContentModal = false" style="background: none; border: none; color: #ffffff; font-size: 24px; cursor: pointer; line-height: 1; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">&times;</button>
        </div>
        <div class="modal-body" style="padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow: hidden; flex: 1;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <input v-model="reportContentSearchStr" placeholder="Nhập nội dung, ghi chú, mã report..." class="input-field" style="flex: 1;" autofocus />
            <input type="month" v-model="reportContentFilterDate" @click="$event.target.showPicker && $event.target.showPicker()" class="input-field" style="width: 180px; background: rgba(0,0,0,0.2); color-scheme: dark; cursor: pointer; position: relative; z-index: 2005;" title="Chọn thời gian" placeholder="Chọn thời gian" />
          </div>
          <div style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
            <div v-for="r in paginatedReportContents" :key="r.id" @click="selectReportContent(r)" style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; display: flex; flex-direction: column; gap: 6px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(59, 130, 246, 0.5)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='transparent'">
              <div v-if="r.thoi_gian" style="font-size: 11px; color: #10b981; display: flex; align-items: center; gap: 4px; font-weight: 600;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{{ formatReportTime(r.thoi_gian) }}</span>
              </div>
              <div style="font-weight: 600; color: #f8fafc; font-size: 14px; word-break: break-word;">
                {{ r.noi_dung || 'Không có nội dung' }}
              </div>
              <div v-if="r.ghi_chu" style="font-size: 12px; color: #94a3b8; display: flex; align-items: flex-start; gap: 4px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 2px; flex-shrink: 0;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>{{ r.ghi_chu }}</span>
              </div>
            </div>
            
            <button type="button" v-if="hasMoreReports" @click="loadMoreReports" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px dashed rgba(59, 130, 246, 0.3); padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s; text-align: center; margin-top: 4px;" onmouseover="this.style.background='rgba(59, 130, 246, 0.2)'; this.style.borderColor='rgba(59, 130, 246, 0.5)'" onmouseout="this.style.background='rgba(59, 130, 246, 0.1)'; this.style.borderColor='rgba(59, 130, 246, 0.3)'">Xem tiếp</button>

            <div v-if="paginatedReportContents.length === 0" style="text-align: center; padding: 30px 20px; color: #94a3b8; background: rgba(255,255,255,0.02); border-radius: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <div>Không tìm thấy report phù hợp.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scan Confirm Modal -->
    <div class="modal-overlay" v-if="showScanConfirmModal" @click.self="showScanConfirmModal = false" style="z-index: 10000;">
      <div class="modal-content" :style="{ width: (scanConfirmPreviewUrl || scanConfirmIsExcel) ? '850px' : '450px', maxWidth: '95vw', background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease' }">
        <div class="modal-header" style="padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
          <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            {{ scanConfirmTitle }}
          </h3>
        </div>
        <div class="modal-body scan-confirm-body">
          <!-- Cột ảnh preview -->
          <div v-if="scanConfirmPreviewUrl || scanConfirmIsExcel" class="scan-confirm-preview">
            <template v-if="scanConfirmPreviewUrl">
              <img :src="scanConfirmPreviewUrl" style="width: 100%; height: auto; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); object-fit: contain; background: white;" />
            </template>
            <template v-else-if="scanConfirmIsExcel">
              <div style="width: 100%; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); overflow: hidden; border: 1px solid #cbd5e1; background: white; display: flex; flex-direction: column;">
                <div style="background: #107c41; color: white; padding: 8px 12px; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M8 17h2"></path><path d="M14 13h2"></path><path d="M14 17h2"></path></svg>
                   <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ scanConfirmFileName }}</span>
                </div>
                <div style="overflow-x: auto; padding: 8px;" v-html="scanConfirmExcelHtml"></div>
              </div>
            </template>
          </div>
          
          <!-- Nội dung text -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px;">
            <div v-html="scanConfirmMessage"></div>
            
            <!-- Phần nhập số tiền chỉnh sửa -->
            <div v-if="scanConfirmHasEditableAmount" style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1.25rem; border-radius: 12px; margin-top: 8px;">
              <label style="color: #10b981; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Số tiền quét được (có thể chỉnh sửa nếu cần):
              </label>
              <NumberInput v-model="scanConfirmEditableAmount" placeholder="Nhập số tiền chính xác..." class="elite-input" style="width: 100%; box-sizing: border-box; padding: 0.85rem 1rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(0,0,0,0.3); color: #10b981; font-size: 1.1rem; font-weight: 700; outline: none; transition: all 0.2s;" onfocus="this.style.borderColor='#10b981'; this.style.boxShadow='0 0 0 3px rgba(16, 185, 129, 0.2)'" onblur="this.style.borderColor='rgba(16, 185, 129, 0.3)'; this.style.boxShadow='none'" />
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: flex-end; gap: 12px; background: rgba(15, 23, 42, 0.4);">
          <button v-if="scanConfirmIsQuestion" type="button" class="tech-vip-btn" style="background: rgba(255,255,255,0.1); color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;" @click="handleScanConfirm(false)">Hủy</button>
          <button type="button" class="tech-vip-btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;" @click="handleScanConfirm(true)">{{ scanConfirmIsQuestion ? 'Đồng ý' : 'Đóng' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal Thêm Khách Hàng Nhanh -->
    <div class="modal-overlay" v-if="showAddCustomerModal" @click.self="showAddCustomerModal = false" style="z-index: 100000;">
      <div class="modal-content" style="width: 450px; max-width: 95vw; background: #0f172a; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        <div class="modal-header" style="padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 16px; color: #f8fafc; font-weight: 700;">Thêm khách hàng nhanh</h2>
          <button type="button" @click="showAddCustomerModal = false" style="background: none; border: none; color: #ffffff; font-size: 24px; cursor: pointer; line-height: 1; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">&times;</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Tên công ty <span style="color: #ef4444">*</span></label>
            <input type="text" v-model="newCustomerForm.ten_cong_ty" class="elite-input" placeholder="Nhập tên công ty..." style="width: 100%; box-sizing: border-box; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #fff; outline: none; transition: all 0.2s; font-size: 0.9rem;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" />
          </div>
          <div>
            <label style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">Tên khách hàng <span style="color: #ef4444">*</span></label>
            <input type="text" v-model="newCustomerForm.ten_khach_hang" class="elite-input" placeholder="Nhập tên khách hàng..." style="width: 100%; box-sizing: border-box; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #fff; outline: none; transition: all 0.2s; font-size: 0.9rem;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'" />
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: flex-end; gap: 12px; background: rgba(15, 23, 42, 0.4);">
          <button type="button" @click="showAddCustomerModal = false" style="background: rgba(255,255,255,0.1); color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;" :disabled="isSavingCustomer">Hủy</button>
          <button type="button" @click="submitNewCustomer" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px;" :disabled="isSavingCustomer">
            <span v-if="isSavingCustomer" style="display: inline-block; width: 12px; height: 12px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span>
            <span v-else>Thêm khách hàng</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Modal Center -->
    <div v-if="notificationModal.show" class="modal-overlay" style="z-index: 1000000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
      <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; text-align: center; width: 400px; max-width: 90vw; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); animation: scaleIn 0.2s ease-out;">
        <div v-if="notificationModal.type === 'success'" style="width: 64px; height: 64px; background: rgba(16,185,129,0.1); color: #10b981; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 16px auto;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div v-else style="width: 64px; height: 64px; background: rgba(239,68,68,0.1); color: #ef4444; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 16px auto;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 style="color: #f8fafc; font-size: 1.25rem; font-weight: 700; margin: 0 0 8px 0;">{{ notificationModal.title }}</h3>
        <p style="color: #94a3b8; font-size: 0.95rem; margin: 0 0 24px 0; line-height: 1.5; white-space: pre-line;">{{ notificationModal.message }}</p>
        <button @click="notificationModal.show = false" style="background: #1e293b; color: white; border: 1px solid rgba(255,255,255,0.1); padding: 10px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='#1e293b'">Đóng</button>
      </div>
    </div>

    <!-- Workflow Design Tab -->
    <PipelineWorkflow v-if="activeTab === 'workflow'" />

  </div>
  <Teleport to="body">
    <div v-if="isDragging && hoverColName" class="drag-cursor-tooltip" :style="{ left: mouseX + 'px', top: mouseY + 'px' }">
      Thả vào: {{ hoverColName }}
    </div>
  </Teleport>
</template>

<script setup>
defineOptions({ name: 'Pipeline' })
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import NumberInput from './NumberInput.vue'
import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url'

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
}

import PipelineWorkflow from './PipelineWorkflow.vue'

const activeTab = ref('kanban')

const formatNumber = (val) => {
  if (val == null || val === '') return '';
  const raw = String(val).replace(/,/g, '');
  if (!isNaN(raw) && raw !== '') {
    return new Intl.NumberFormat('en-US').format(Number(raw));
  }
  return val;
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const route = useRoute()
const router = useRouter()

const selectedWorkflowId = ref('WF_DEFAULT')
const workflowsData = ref([])

const uniqueWorkflows = computed(() => {
  const map = new Map()
  workflowsData.value.forEach(wf => {
    if (wf.id_workflow && !map.has(wf.id_workflow)) {
      map.set(wf.id_workflow, { id_workflow: wf.id_workflow, name_workflow: wf.name_workflow })
    }
  })
  return Array.from(map.values())
})

const defaultColumns = [
  { id: 'nhap', label: 'TẠM', value: 'TẠM', percent: '0%' },
  { id: 'col_30', label: '30%: Pipeline', value: 'Pipeline (khảo sát nhu cầu khách hàng)', percent: '30%' },
  { id: 'col_50', label: '50%: Forecast', value: 'Forecast (đã lên báo giá gởi khách hàng)', percent: '50%' },
  { id: 'col_70', label: '70%: Commit', value: 'Commit (EU đồng ý giải pháp, chờ ngân sách đầu tư)', percent: '70%' },
  { id: 'col_90', label: '90%: Closed Won', value: 'Closed Won (đã ký xác nhận đặt hàng)', percent: '90%' },
  { id: 'hoan_thanh', label: 'THÀNH CÔNG', value: 'THÀNH CÔNG', percent: '100%' },
  { id: 'that_bai', label: 'THẤT BẠI', value: 'THẤT BẠI', percent: '0%' }
]

// Configuration of columns
const COLUMNS = computed(() => {
  if (selectedWorkflowId.value === 'WF_DEFAULT') {
    return defaultColumns
  }
  const wfColumns = workflowsData.value
    .filter(wf => wf.id_workflow === selectedWorkflowId.value)
    .sort((a, b) => parseInt(a.status_index || 0) - parseInt(b.status_index || 0))
    .map(wf => ({
      id: `wf_${wf.id_status_workflow}`,
      label: wf.status_name,
      value: wf.status_name,
      percent: wf['%status'],
      color: wf.status_color
    }))
  
  if (wfColumns.length > 0) {
    return [
      ...wfColumns,
      { id: 'hoan_thanh', label: 'THÀNH CÔNG', value: 'THÀNH CÔNG', percent: '100%' },
      { id: 'that_bai', label: 'THẤT BẠI', value: 'THẤT BẠI', percent: '0%' }
    ]
  }
  return defaultColumns
})

const MODAL_COLUMNS = computed(() => {
  const wfId = formData.value.id_workflow || 'WF_DEFAULT'
  if (wfId === 'WF_DEFAULT') {
    return defaultColumns
  }
  const wfColumns = workflowsData.value
    .filter(wf => wf.id_workflow === wfId)
    .sort((a, b) => parseInt(a.status_index || 0) - parseInt(b.status_index || 0))
    .map(wf => ({
      id: `wf_${wf.id_status_workflow}`,
      label: wf.status_name,
      value: wf.status_name,
      percent: wf['%status'],
      color: wf.status_color
    }))
  
  if (wfColumns.length > 0) {
    return [
      ...wfColumns,
      { id: 'hoan_thanh', label: 'THÀNH CÔNG', value: 'THÀNH CÔNG', percent: '100%' },
      { id: 'that_bai', label: 'THẤT BẠI', value: 'THẤT BẠI', percent: '0%' }
    ]
  }
  return defaultColumns
})

const onModalWorkflowChange = () => {
  if (MODAL_COLUMNS.value.length > 0) {
    formData.value.status_name = MODAL_COLUMNS.value[0].value
  }
}

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const uploadingFiles = ref(false)
const backgroundSyncing = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const showCustomerModal = ref(false)
const customerSearchStr = ref('')
const loadingCustomers = ref(false)
const customersList = ref([])
const customerSearchTarget = ref('')

const showReportContentModal = ref(false)
const reportContentSearchStr = ref('')
const reportContentFilterDate = ref('')
const reportContentPage = ref(1)

watch([reportContentSearchStr, reportContentFilterDate], () => {
  reportContentPage.value = 1;
})

const filteredReportContents = computed(() => {
  let list = reports.value;

  const kw = reportContentSearchStr.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(r => 
      (r.noi_dung && r.noi_dung.toLowerCase().includes(kw)) ||
      (r.id && r.id.toLowerCase().includes(kw)) ||
      (r.ghi_chu && r.ghi_chu.toLowerCase().includes(kw)) ||
      (r.thoi_gian && r.thoi_gian.toLowerCase().includes(kw))
    )
  }

  const dateFilter = reportContentFilterDate.value;
  if (dateFilter) {
    const parts = dateFilter.split('-'); // Format from type="month" is "YYYY-MM"
    if (parts.length === 2) {
      const my = `${parts[1]}/${parts[0]}`; // MM/YYYY
      list = list.filter(r => r.thoi_gian && r.thoi_gian.includes(my));
    }
  }

  return list;
})

const paginatedReportContents = computed(() => {
  return filteredReportContents.value.slice(0, reportContentPage.value * 15);
})

const hasMoreReports = computed(() => {
  return paginatedReportContents.value.length < filteredReportContents.value.length;
})

const loadMoreReports = () => {
  reportContentPage.value++;
}

const formatReportTime = (thoi_gian) => {
  if (!thoi_gian) return '';
  const parts = thoi_gian.split(' /');
  if (parts.length === 3) {
    const timePart = parts[0].trim();
    let thuPart = parts[1].trim();
    const datePart = parts[2].trim();
    
    if (thuPart === '8' || thuPart.toUpperCase() === 'CN') {
      thuPart = 'Chủ nhật';
    } else {
      thuPart = `thứ ${thuPart}`;
    }
    
    return `${timePart}, ${thuPart} , ${datePart}`;
  }
  return thoi_gian;
}

const selectReportContent = (rep) => {
  formData.value.content_of_contract_po = rep.noi_dung || rep.id;
  showReportContentModal.value = false;
}

const filteredCustomers = computed(() => {
  const kw = customerSearchStr.value.trim().toLowerCase()
  if (!kw) return customersList.value.slice(0, 50)
  return customersList.value.filter(c => 
    (c.Ten_khach_hang && c.Ten_khach_hang.toLowerCase().includes(kw)) ||
    (c.Ten_cong_ty && c.Ten_cong_ty.toLowerCase().includes(kw)) ||
    (c.Ma_khach_hang && c.Ma_khach_hang.toLowerCase().includes(kw))
  ).slice(0, 50)
})

const fetchCustomersData = async () => {
  if (customersList.value.length > 0) return;
  loadingCustomers.value = true;
  try {
    const res = await fetch(`${SCRIPT_URL}?action=khach_hang`);
    const data = await res.json();
    if (Array.isArray(data)) {
      customersList.value = data.map(row => ({
        Ma_khach_hang: String(row[0] ?? ''),
        Ten_khach_hang: String(row[1] ?? ''),
        Ma_cong_ty: String(row[4] ?? ''),
        Ten_cong_ty: String(row[5] ?? ''),
      }));
    }
  } catch (e) {
    console.error('Lỗi khi fetch khách hàng:', e);
  } finally {
    loadingCustomers.value = false;
  }
}

const openCustomerSearch = (target) => {
  customerSearchTarget.value = target;
  customerSearchStr.value = formData.value[target] || '';
  showCustomerModal.value = true;
  fetchCustomersData();
}

const selectCustomer = (c) => {
  formData.value.ten_khach_hang = c.Ten_khach_hang;
  formData.value.ten_cong_ty = c.Ten_cong_ty;
  formData.value.ma_khach_hang = c.Ma_khach_hang;
  formData.value.ma_cong_ty = c.Ma_cong_ty;
  showCustomerModal.value = false;
}

const searchQuery = ref('')
const confirmActionModal = ref({ show: false, item: null, action: '' })
const tempStartDate = ref('')
const tempEndDate = ref('')
const reports = ref([])

const filterConfig = ref({
  filterMode: 'all',
  dateFrom: '',
  dateTo: '',
  weekFrom: '',
  weekTo: '',
  monthFrom: '',
  monthTo: '',
  yearFrom: '',
  yearTo: '',
  companyCustomer: ''
})

const showAddCustomerModal = ref(false)
const isSavingCustomer = ref(false)
const newCustomerForm = ref({ ten_khach_hang: '', ten_cong_ty: '' })

const openAddCustomerModal = () => {
  showAddCustomerModal.value = true;
  // Tải ngầm danh sách khách hàng để tối ưu tốc độ check trùng lặp khi lưu
  if (customersList.value.length === 0) {
    fetchCustomersData();
  }
}

const notificationModal = ref({
  show: false,
  title: '',
  message: '',
  type: 'success'
})

const showNotification = (title, message, type = 'success') => {
  notificationModal.value = { show: true, title, message, type }
}

const showCompanyFilterDropdown = ref(false)
const showExportModal = ref(false)
const showScanConfirmModal = ref(false)
const scanConfirmTitle = ref('')
const scanConfirmMessage = ref('')
const scanConfirmIsQuestion = ref(false)
const scanConfirmPreviewUrl = ref(null)
const scanConfirmIsExcel = ref(false)
const scanConfirmFileName = ref('')
const scanConfirmExcelHtml = ref('')
const scanConfirmHasEditableAmount = ref(false)
const scanConfirmEditableAmount = ref(0)
let scanConfirmResolve = null

const customConfirm = (title, message, isQuestion = true, options = {}) => {
  return new Promise((resolve) => {
    scanConfirmTitle.value = title
    scanConfirmMessage.value = message
    scanConfirmIsQuestion.value = isQuestion
    scanConfirmPreviewUrl.value = options.previewUrl || null
    scanConfirmIsExcel.value = options.isExcel || false
    scanConfirmFileName.value = options.fileName || ''
    scanConfirmExcelHtml.value = options.excelHtml || ''
    
    if (options.editableAmount !== undefined) {
      scanConfirmHasEditableAmount.value = true
      scanConfirmEditableAmount.value = options.editableAmount
    } else {
      scanConfirmHasEditableAmount.value = false
    }
    
    showScanConfirmModal.value = true
    scanConfirmResolve = resolve
  })
}

const handleScanConfirm = (result) => {
  showScanConfirmModal.value = false
  if (scanConfirmResolve) {
    if (result && scanConfirmHasEditableAmount.value) {
      scanConfirmResolve({ confirmed: true, amount: scanConfirmEditableAmount.value })
    } else {
      scanConfirmResolve(result)
    }
    scanConfirmResolve = null
  }
}

const removedExportIds = ref([])
const exportFilters = ref({
  id_workflow: '',
  dateFrom: '',
  dateTo: ''
})

const parseDMY = (dmyStr) => {
  const parts = dmyStr.split('/')
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`).getTime()
  }
  return 0
}

const exportPreviewList = computed(() => {
  let list = items.value.filter(matchesSearch)
  
  if (exportFilters.value.id_workflow) {
    if (exportFilters.value.id_workflow === 'WF_DEFAULT') {
      list = list.filter(i => !i.id_workflow || i.id_workflow === 'WF_DEFAULT')
    } else {
      list = list.filter(i => i.id_workflow === exportFilters.value.id_workflow)
    }
  }
  
  if (exportFilters.value.dateFrom || exportFilters.value.dateTo) {
    const fromTime = exportFilters.value.dateFrom ? new Date(exportFilters.value.dateFrom).getTime() : 0
    const toTime = exportFilters.value.dateTo ? new Date(exportFilters.value.dateTo).setHours(23,59,59,999) : Infinity
    
    list = list.filter(i => {
      if (!i.finish_time) return false;
      const dates = i.finish_time.split('-').map(s => s.trim())
      const startDateStr = dates[0]
      const itemDate = parseDMY(startDateStr)
      if (itemDate) {
        return itemDate >= fromTime && itemDate <= toTime
      }
      return false
    })
  }

  if (removedExportIds.value.length > 0) {
    list = list.filter(i => !removedExportIds.value.includes(i.Id_pipeline))
  }

  return list
})

const removeExportCard = (id) => {
  if (!removedExportIds.value.includes(id)) {
    removedExportIds.value.push(id)
  }
}

watch(showExportModal, (val) => {
  if (val) {
    removedExportIds.value = []
  }
})

const getFormattedStatus = (item) => {
  let statusStr = item['%status'] || ''; 
  if (typeof statusStr === 'number' || (!isNaN(statusStr) && statusStr !== '')) {
    let num = Number(statusStr);
    if (num <= 1 && num >= 0) {
      statusStr = (num * 100) + '%';
    }
  } else if (typeof statusStr === 'string' && !statusStr.includes('%') && item.status_name) {
    const colMatch = COLUMNS.value.find(c => c.value === item.status_name);
    if (colMatch) statusStr = colMatch.percent;
  }
  return statusStr || item.status_name || '0%';
}

const confirmExportExcel = () => {
  exportToExcel(exportPreviewList.value)
  showExportModal.value = false
}

const resetFilters = () => {
  filterConfig.value = {
    filterMode: 'all',
    dateFrom: '',
    dateTo: '',
    weekFrom: '',
    weekTo: '',
    monthFrom: '',
    monthTo: '',
    yearFrom: '',
    yearTo: '',
    companyCustomer: ''
  }
}

const exportToExcel = async (listToExport = null) => {
  const dataList = Array.isArray(listToExport) ? listToExport : items.value.filter(matchesSearch);
  const filtered = dataList;
  
  let titleText = 'PIPELINE';
  if (exportFilters.value.dateFrom) {
    const year = new Date(exportFilters.value.dateFrom).getFullYear();
    titleText = `PIPELINE ( ${year} )`;
  } else if (exportFilters.value.dateTo) {
    const year = new Date(exportFilters.value.dateTo).getFullYear();
    titleText = `PIPELINE ( ${year} )`;
  }
  
  const formatTimeline = (finishTimeStr) => {
    if (!finishTimeStr) return '';
    const parts = finishTimeStr.split('-').map(s => s.trim());
    
    const getMonthStr = (dateStr) => {
      if (!dateStr) return null;
      const partsDate = dateStr.split('/');
      if (partsDate.length !== 3) return null;
      return parseInt(partsDate[1], 10);
    };

    const getQuarter = (month) => {
      return Math.ceil(month / 3);
    };

    if (parts.length === 1) {
      const m = getMonthStr(parts[0]);
      if (m) return `Tháng ${m}`;
      return parts[0];
    } else if (parts.length === 2) {
      const m1 = getMonthStr(parts[0]);
      const m2 = getMonthStr(parts[1]);
      
      if (m1 && m2) {
        if (m1 === m2) {
          return `Tháng ${m1}`;
        } else {
          const q1 = getQuarter(m1);
          const q2 = getQuarter(m2);
          if (q1 === q2) {
            return `Q${q1}`;
          } else {
            const qs = [];
            for (let i = q1; i <= q2; i++) {
              qs.push(`Q${i}`);
            }
            return qs.join('/');
          }
        }
      }
      return finishTimeStr;
    }
    return finishTimeStr;
  };

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pipeline');
    
    // Setup cột
    worksheet.columns = [
      { width: 8 },  // A: No.
      { width: 12 }, // B: A.M
      { width: 35 }, // C: Customer
      { width: 45 }, // D: BOM
      { width: 10 }, // E: Q'ty
      { width: 20 }, // F: Volume (LP)
      { width: 15 }, // G: Type
      { width: 15 }, // H: Timeline
      { width: 15 }, // I: Status
      { width: 45 }, // J: Remarks
    ];

    // Tiêu đề tĩnh (Ghi thô trước, định dạng sau)
    const headers = [
      ['Công ty CP Tích hợp hệ thống Nam Trường Sơn'],
      ['55/10 Trần Đình Xu, P. Cầu Kho, Q.1, TP. HCM'],
      [],
      [' ' + titleText], 
      ['Stage (trạng thái)'],
      ['30% : Pipeline (khảo sát nhu cầu khách hàng)'],
      ['50%: Forecast (đã lên báo giá gởi khách hàng)'],
      ['70% : Commit (EU đồng ý giải pháp, chờ ngân sách đầu tư)'],
      ['90% : Closed Won (đã ký xác nhận đặt hàng)'],
      ['Closed Lost (mất cơ hội bán hàng)'],
      [],
      ['No.', 'A.M', 'Customer', 'BOM', "Q'ty", 'Volume (LP)', 'Type', 'Timeline', 'Status ', 'Remarks']
    ];

    headers.forEach(h => worksheet.addRow(h));

    // Style tiêu đề công ty (Đen, In đậm)
    worksheet.getCell('A1').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
    worksheet.getCell('A2').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
    
    // Style tiêu đề chính
    const titleCell = worksheet.getCell('A4');
    worksheet.mergeCells('A4:O4');
    titleCell.value = titleText;
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Style ghi chú Stage
    worksheet.getCell('A5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFF0000' } }; // Đỏ, không gạch chân
    
    // Rich text cho các mốc %
    const stageData = [
      { row: 6, percent: '30% : Pipeline ', text: '(khảo sát nhu cầu khách hàng)' },
      { row: 7, percent: '50%: Forecast ', text: '(đã lên báo giá gởi khách hàng)' },
      { row: 8, percent: '70% : Commit ', text: '(EU đồng ý giải pháp, chờ ngân sách đầu tư)' },
      { row: 9, percent: '90% : Closed Won ', text: '(đã ký xác nhận đặt hàng)' },
      { row: 10, percent: 'Closed Lost ', text: '(mất cơ hội bán hàng)' }
    ];
    stageData.forEach(sd => {
      worksheet.getCell(`A${sd.row}`).value = {
        richText: [
          { font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF002060' } }, text: sd.percent },
          { font: { name: 'Arial', size: 10, color: { argb: 'FF000000' } }, text: sd.text }
        ]
      };
    });

    // Style row header bảng
    const headerRow = worksheet.getRow(12);
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF002060' } }; // Chữ xanh đen đậm
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDEBF7' } // Nền xanh nhạt
      };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    
    // Auto Filter
    worksheet.autoFilter = 'A12:J12';

    // Điền dữ liệu
    filtered.forEach((item, index) => {
      let rawVolume = String(item.volume || '').replace(/,/g, '');
      let volumeNum = !isNaN(rawVolume) && rawVolume !== '' ? Number(rawVolume) : rawVolume;

      let statusStr = item['%status'] || ''; 
      
      // Khắc phục lỗi API trả về số thập phân (ví dụ: 0.5) thay vì chuỗi '50%'
      if (typeof statusStr === 'number' || (!isNaN(statusStr) && statusStr !== '')) {
        let num = Number(statusStr);
        if (num <= 1 && num >= 0) {
          statusStr = (num * 100) + '%';
        }
      } else if (!statusStr.includes('%') && item.status_name) {
        // Fallback lấy % từ cấu hình COLUMNS nếu API trả về lỗi
        const colMatch = COLUMNS.value.find(c => c.value === item.status_name);
        if (colMatch) statusStr = colMatch.percent;
      }

      const rowData = [
        index + 1,
        item.AM || '',
        item.ten_cong_ty || '',
        item.content_of_contract_po || '',
        item.quantity ? Number(item.quantity) : '',
        volumeNum,
        item.type || '',
        formatTimeline(item.finish_time),
        statusStr,
        item.ghi_chu_hop_dong || ''
      ];
      
      const row = worksheet.addRow(rowData);
      
      // Zebra striping: tô nền xanh nhạt cho các dòng lẻ của bảng (Row 13, 15, 17...)
      const isOddTableRow = index % 2 === 0; // index bắt đầu từ 0 (Row 13)

      row.eachCell((cell, colNumber) => {
        // Viền: viền dọc thin, viền ngang trong bảng dùng dotted
        cell.border = {
          top: { style: 'dotted' }, left: { style: 'thin' },
          bottom: { style: 'dotted' }, right: { style: 'thin' }
        };
        
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { vertical: 'middle', wrapText: true };
        
        if (isOddTableRow) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
        }
        
        // No., A.M, Timeline, Status -> Center
        if (colNumber === 1 || colNumber === 2 || colNumber === 8 || colNumber === 9) {
          cell.alignment.horizontal = 'center';
        }
        // Customer, BOM, Type -> Left
        if (colNumber === 3 || colNumber === 4 || colNumber === 7) {
          cell.alignment.horizontal = 'left';
        }
        // Q'ty -> Right, Bold
        if (colNumber === 5) {
          cell.alignment.horizontal = 'right';
          cell.font = { name: 'Arial', size: 10, bold: true };
        }
        // Volume -> Right, Bold, Format số phẩy
        if (colNumber === 6) {
          cell.alignment.horizontal = 'right';
          cell.font = { name: 'Arial', size: 10, bold: true };
          if (volumeNum) cell.numFmt = '#,##0';
        }
        // Remarks -> Red, Italic
        if (colNumber === 10 && cell.value) {
          cell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FFFF0000' } };
        }
      });
    });
    
    // Khép viền đáy đậm cho dòng cuối cùng của bảng
    const lastRow = worksheet.getRow(12 + filtered.length);
    lastRow.eachCell((cell) => {
      cell.border = {
        top: cell.border.top, left: cell.border.left, right: cell.border.right,
        bottom: { style: 'thin' }
      };
    });
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pipeline_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error exporting excel:', error);
    alert('Có lỗi xảy ra khi xuất Excel. Vui lòng thử lại!');
  }
};

const uniqueCompanyCustomers = computed(() => {
  const map = new Map();
  items.value.forEach(i => {
    if (i.ten_cong_ty || i.ten_khach_hang) {
      const company = i.ten_cong_ty || '';
      const customer = i.ten_khach_hang || '';
      const key = JSON.stringify({ company, customer });
      if (!map.has(key)) {
        map.set(key, { 
          key, 
          company, 
          customer, 
          label: company ? (customer ? `${company} - ${customer}` : company) : customer 
        });
      }
    }
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
});

const getWeekDateRange = (weekStr) => {
  if (!weekStr) return { from: null, to: null };
  const [year, week] = weekStr.split('-W');
  const d = new Date(year, 0, 1);
  const days = (week - 1) * 7;
  d.setDate(d.getDate() + days - d.getDay() + 1);
  const from = new Date(d);
  const to = new Date(d);
  to.setDate(to.getDate() + 6);
  return { from, to };
}

// Trạng thái gộp thẻ
const mergeMode = ref(false)
const mergeTarget = ref(null)
const mergeSelected = ref([])
const showReportDropdown = ref(false)

const collapsedCols = ref({
  that_bai: true,
  hoan_thanh: true
})

const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 768
  
  if (isMobile.value && !wasMobile) {
    COLUMNS.value.forEach(c => {
      collapsedCols.value[c.id] = true
    })
    collapsedCols.value.unassigned = true
    collapsedCols.value.tam = false // keep the first one open
  } else if (!isMobile.value && wasMobile) {
    COLUMNS.value.forEach(c => {
      collapsedCols.value[c.id] = (c.id === 'that_bai' || c.id === 'hoan_thanh')
    })
    collapsedCols.value.unassigned = false
  }
}

const selectedReportIds = computed(() => {
  return (formData.value.report_id || '').split(',').map(s => s.trim()).filter(Boolean)
})

const selectedReports = computed(() => {
  return selectedReportIds.value.map(id => reports.value.find(r => r.id === id)).filter(Boolean)
})

const selectReport = (id) => {
  if (!id) {
    formData.value.report_id = ''
    showReportDropdown.value = false
    return
  }
  let ids = [...selectedReportIds.value]
  if (ids.includes(id)) {
    ids = ids.filter(i => i !== id) // Toggle off
  } else {
    ids.push(id) // Toggle on
  }
  formData.value.report_id = ids.join(', ')
}

const getReportContent = (id) => {
  const rep = reports.value.find(r => r.id === id)
  return rep ? (rep.noi_dung || rep.id) : id
}

const getReportDetails = (id) => {
  const rep = reports.value.find(r => r.id === id)
  if (!rep) return { noi_dung: id, ghi_chu: '' }
  return {
    noi_dung: rep.noi_dung || rep.id,
    ghi_chu: rep.ghi_chu || ''
  }
}

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const hasExt = filename.includes('.')
  if (hasExt && ['doc', 'docx'].includes(ext)) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231D4ED8"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/><path d="M14.5 15l-1.5-4.5-1.5 4.5h-2l-2-7h2l1 4.5 1.5-4.5h2l1.5 4.5 1-4.5h2l-2 7h-2.5z"/></svg>'
  }
  if ((hasExt && ['xls', 'xlsx', 'csv'].includes(ext)) || filename.toLowerCase().includes('report')) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23047857"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/><path d="M14 15l-2-3.5-2 3.5h-2.5l3.5-5-3.5-5h2.5l2 3.5 2-3.5h2.5l-3.5 5 3.5 5h-2.5z"/></svg>'
  }
  if (hasExt && ['pdf'].includes(ext)) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23DC2626"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/><text x="8" y="16" font-size="5" font-family="Arial" font-weight="bold" fill="%23DC2626">PDF</text></svg>'
  }
  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>'
}

const getParsedFiles = (element) => {
  if (!element.ten_file) return []
  const names = String(element.ten_file).split(',')
  const links = element.link_file ? String(element.link_file).split(',') : []
  
  const results = []
  names.forEach((name, i) => {
    if (name.trim()) {
      results.push({
        name: name.trim(),
        url: links[i] ? links[i].trim() : '#'
      })
    }
  })
  return results
}


// State for kanban boards
const highlightedCardId = ref(null)
const isDragging = ref(false)
const isMobile = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)
const hoverColName = ref('')

const onDragOver = (e) => {
  if (!isDragging.value) return
  mouseX.value = e.clientX
  mouseY.value = e.clientY
  const col = e.target.closest('.kanban-column')
  if (col) {
    hoverColName.value = col.dataset.colName || ''
  } else {
    hoverColName.value = ''
  }
}

watch(isDragging, (val) => {
  if (val) {
    window.addEventListener('dragover', onDragOver, true)
    window.addEventListener('mousemove', onDragOver, true)
  } else {
    window.removeEventListener('dragover', onDragOver, true)
    window.removeEventListener('mousemove', onDragOver, true)
    hoverColName.value = ''
  }
})

const boardData = ref({ unassigned: [] })

watch(COLUMNS, (newCols) => {
  const newBoardData = { unassigned: boardData.value.unassigned || [] }
  newCols.forEach(c => {
    newBoardData[c.id] = boardData.value[c.id] || []
  })
  boardData.value = newBoardData
  
  newCols.forEach(c => {
    if (collapsedCols.value[c.id] === undefined) {
      collapsedCols.value[c.id] = (c.id === 'that_bai' || c.id === 'hoan_thanh')
    }
  })
}, { immediate: true })

watch(selectedWorkflowId, () => {
  distributeItems()
})

const defaultFormData = {
  Id_pipeline: '', report_id: '', ma_hop_dong: '', ma_khach_hang: '', ten_khach_hang: '',
  ma_cong_ty: '', ten_cong_ty: '', AM: 'Sơn', tag: 'Bình thường', '%status': '0%', status_name: 'TẠM',
  isSuccess: '', type: '', ghi_chu_hop_dong: '', created_time: '', finish_time: '',
  content_of_contract_po: '', quantity: '', volume: '', ten_file: '', link_file: '',
  id_workflow: ''
}

const formData = ref({ ...defaultFormData })
const originalFormData = ref('')

const isFormChanged = computed(() => {
  if (!isEditing.value) return true
  return JSON.stringify(formData.value) !== originalFormData.value
})

const removeDiacritics = (str) => {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/d/g, 'd')
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

const submitNewCustomer = async () => {
  if (!newCustomerForm.value.ten_khach_hang || !newCustomerForm.value.ten_cong_ty) {
    showNotification("Thiếu thông tin", "Vui lòng nhập đầy đủ tên khách hàng và tên công ty!", "error")
    return
  }
  isSavingCustomer.value = true
  try {
    const ma_ct = genMaCT(newCustomerForm.value.ten_cong_ty)
    const ma_kh = genMaKH(newCustomerForm.value.ten_khach_hang, newCustomerForm.value.ten_cong_ty)
    
    // Đảm bảo đã load danh sách khách hàng để check trùng
    if (customersList.value.length === 0) {
      await fetchCustomersData()
    }

    // Check for duplicates
    const isDuplicate = customersList.value.some(c => c.Ma_khach_hang === ma_kh && c.Ma_cong_ty === ma_ct)
    if (isDuplicate) {
      showNotification("Phát hiện trùng lặp", `Khách hàng này đã tồn tại trong hệ thống!\n(Mã KH: ${ma_kh} - Mã CT: ${ma_ct})`, "error")
      isSavingCustomer.value = false
      return
    }

    const payload = {
      sheet: 'khach_hang',
      action: 'add',
      ma_khach_hang: ma_kh,
      ten_khach_hang: newCustomerForm.value.ten_khach_hang.toUpperCase(),
      ma_cong_ty: ma_ct,
      ten_cong_ty: newCustomerForm.value.ten_cong_ty.toUpperCase()
    }

    // Optimistic Update: Đóng modal, hiện thông báo, cập nhật list ngay lập tức
    showAddCustomerModal.value = false
    isSavingCustomer.value = false
    const tempForm = { ...newCustomerForm.value }
    newCustomerForm.value = { ten_khach_hang: '', ten_cong_ty: '' }
    
    customersList.value.unshift({
      Ma_khach_hang: ma_kh,
      Ten_khach_hang: tempForm.ten_khach_hang.toUpperCase(),
      Ma_cong_ty: ma_ct,
      Ten_cong_ty: tempForm.ten_cong_ty.toUpperCase()
    })
    
    showNotification("Thêm thành công", "Đã thêm khách hàng mới vào hệ thống!", "success")

    // Call API ngầm
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    .then(res => res.json())
    .then(result => {
      if (result.status !== 'success') {
        // Rollback nếu lỗi
        customersList.value = customersList.value.filter(c => !(c.Ma_khach_hang === ma_kh && c.Ma_cong_ty === ma_ct))
        showNotification("Lỗi đồng bộ", "Không thể lưu KH lên máy chủ: " + result.message, "error")
      }
    })
    .catch(err => {
      // Rollback nếu lỗi
      customersList.value = customersList.value.filter(c => !(c.Ma_khach_hang === ma_kh && c.Ma_cong_ty === ma_ct))
      showNotification("Lỗi kết nối", "Đồng bộ KH thất bại: " + err.message, "error")
    })
  } catch (err) {
    showNotification("Lỗi", err.message, "error")
    isSavingCustomer.value = false
  }
}

watch(
  () => [formData.value.ten_khach_hang, formData.value.ten_cong_ty],
  ([tenKH, congTy]) => {
    if (!isEditing.value) {
      formData.value.ma_khach_hang = genMaKH(tenKH, congTy)
      formData.value.ma_cong_ty = genMaCT(congTy)
    }
  }
)

// Filtering for cards
const matchesSearch = (item) => {
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    const textMatch = (item.ten_khach_hang && item.ten_khach_hang.toLowerCase().includes(query)) ||
           (item.ma_hop_dong && item.ma_hop_dong.toLowerCase().includes(query)) ||
           (item.content_of_contract_po && item.content_of_contract_po.toLowerCase().includes(query))
    if (!textMatch) return false;
  }

  if (filterConfig.value.companyCustomer) {
    try {
      const selected = JSON.parse(filterConfig.value.companyCustomer);
      if (selected.company && item.ten_cong_ty !== selected.company) return false;
      if (selected.customer && item.ten_khach_hang !== selected.customer) return false;
    } catch(e) {}
  }

  if (filterConfig.value.filterMode !== 'all') {
    if (!item.finish_time) return false;
    const f = filterConfig.value;
    if (f.filterMode === 'day') {
      if (f.dateFrom && item.finish_time < f.dateFrom) return false;
      if (f.dateTo && item.finish_time > f.dateTo) return false;
    } else if (f.filterMode === 'week') {
      let fromStr = null;
      let toStr = null;
      if (f.weekFrom) {
        const { from } = getWeekDateRange(f.weekFrom);
        if (from) {
          const m = from.getMonth() + 1;
          const d = from.getDate();
          fromStr = `${from.getFullYear()}-${m < 10 ? '0'+m : m}-${d < 10 ? '0'+d : d}`;
        }
      }
      if (f.weekTo) {
        const { to } = getWeekDateRange(f.weekTo);
        if (to) {
          const m = to.getMonth() + 1;
          const d = to.getDate();
          toStr = `${to.getFullYear()}-${m < 10 ? '0'+m : m}-${d < 10 ? '0'+d : d}`;
        }
      }
      if (fromStr && item.finish_time < fromStr) return false;
      if (toStr && item.finish_time > toStr) return false;
    } else if (f.filterMode === 'month') {
      const ft = item.finish_time.substring(0, 7);
      if (f.monthFrom && ft < f.monthFrom) return false;
      if (f.monthTo && ft > f.monthTo) return false;
    } else if (f.filterMode === 'year') {
      const fy = item.finish_time.substring(0, 4);
      if (f.yearFrom && fy < f.yearFrom) return false;
      if (f.yearTo && fy > f.yearTo) return false;
    }
  }

  return true;
}

const syncItemAPI = async (item) => {
  backgroundSyncing.value = true
  try {
    const payload = {
      sheet: 'pipeline',
      action: 'update',
      Id_pipeline: item.Id_pipeline,
      status_name: item.status_name,
      '%status': item['%status'],
      isSuccess: item.isSuccess,
      id_pipeline_lien_ket: item.id_pipeline_lien_ket || ''
    }
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const result = await res.json()
    if (result.status !== 'success') {
      console.error('API Lỗi:', result.message)
    }
  } catch (err) {
    console.error('API Catch Lỗi:', err)
  } finally {
    backgroundSyncing.value = false
  }
}

const syncBulkItemsAPI = async (itemsList) => {
  if (!itemsList || itemsList.length === 0) return
  backgroundSyncing.value = true
  try {
    const payload = {
      sheet: 'pipeline',
      action: 'update_bulk',
      items: itemsList.map(item => ({
        Id_pipeline: item.Id_pipeline,
        status_name: item.status_name,
        '%status': item['%status'],
        isSuccess: item.isSuccess,
        id_pipeline_lien_ket: item.id_pipeline_lien_ket || ''
      }))
    }
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const result = await res.json()
    if (result.status !== 'success') {
      console.error('Bulk API Lỗi:', result.message)
    }
  } catch (err) {
    console.error('Bulk API Catch Lỗi:', err)
  } finally {
    backgroundSyncing.value = false
  }
}

const distributeItems = () => {
  // Clear existing boards
  Object.keys(boardData.value).forEach(k => boardData.value[k] = [])
  
  // Group items by id_pipeline_lien_ket
  const groupsMap = new Map()
  const independentItems = []

  items.value.forEach(item => {
    item.linked_items = [] // reset
    const groupId = item.id_pipeline_lien_ket ? String(item.id_pipeline_lien_ket).trim() : ''
    
    if (groupId) {
      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, {
          isGroup: true,
          Id_pipeline: groupId,
          linked_items: [],
          status_name: item.status_name,
          '%status': item['%status'],
          ten_khach_hang: item.ten_khach_hang || 'Chưa rõ',
          ma_hop_dong: 'FOLDER'
        })
      }
      groupsMap.get(groupId).linked_items.push(item)
    } else {
      independentItems.push(item)
    }
  })
  
  // Cleanup groups with <= 1 item (dissolve them)
  for (const [groupId, group] of groupsMap.entries()) {
    if (group.linked_items.length <= 1) {
       group.linked_items.forEach(child => {
         child.id_pipeline_lien_ket = ''
         independentItems.push(child)
         syncItemAPI(child) // update backend in background
       })
       groupsMap.delete(groupId)
    }
  }

  const rootItems = [...independentItems, ...groupsMap.values()]
  
  // Distribute root items to columns
  rootItems.forEach(item => {
    const wfMatch = selectedWorkflowId.value === 'WF_DEFAULT' 
        ? (!item.id_workflow || item.id_workflow === 'WF_DEFAULT')
        : (item.id_workflow === selectedWorkflowId.value);

    if (!wfMatch) return;

    const colConfig = COLUMNS.value.find(c => c.value === item.status_name) || COLUMNS.value.find(c => c.percent === item['%status'])
    if (colConfig) {
      if (!boardData.value[colConfig.id]) boardData.value[colConfig.id] = []
      boardData.value[colConfig.id].push(item)
    } else {
      if (!boardData.value.unassigned) boardData.value.unassigned = []
      boardData.value.unassigned.push(item)
    }
  })
}

const getTagClass = (tag) => {
  if (!tag) return ''
  const t = tag.toLowerCase()
  if (t.includes('ưu tiên')) return 'tag-urgent'
  if (t.includes('bám đuổi')) return 'tag-warning'
  return 'tag-normal'
}

const getColColorClass = (colId) => {
  if (colId === 'hoan_thanh') return 'dot-success'
  if (colId === 'that_bai') return 'dot-danger'
  if (colId === 'nhap' || colId === 'unassigned') return 'dot-warning'
  if (colId === 'col_30') return 'dot-30'
  if (colId === 'col_50') return 'dot-50'
  if (colId === 'col_70') return 'dot-70'
  if (colId === 'col_90') return 'dot-90'
  return 'dot-primary'
}

const getColColorStyle = (col, isCollapsed) => {
  let style = isCollapsed ? 'margin-right: 0;' : ''
  if (col && col.color && col.color !== '#94a3b8') {
    style += ` background-color: ${col.color}; box-shadow: 0 0 8px ${col.color}80;`
  }
  return style
}

const getColTitleColor = (colId) => {
  const col = COLUMNS.value.find(c => c.id === colId)
  if (col && col.color && col.color !== '#94a3b8') return col.color

  if (colId === 'col_30') return '#ef4444' // Red
  if (colId === 'col_50') return '#f97316' // Orange
  if (colId === 'col_70') return '#eab308' // Yellow
  if (colId === 'col_90') return '#22c55e' // Green
  if (colId === 'that_bai') return '#ef4444' // Red
  if (colId === 'hoan_thanh') return '#10b981' // Emerald
  if (colId === 'nhap') return '#3b82f6' // Blue
  return '#e2e8f0' // Default light gray
}

const getColDarkColor = (colId) => {
  const col = COLUMNS.value.find(c => c.id === colId)
  if (col && col.color && col.color !== '#94a3b8') return col.color

  if (colId === 'col_30') return '#b91c1c' // Dark Red
  if (colId === 'col_50') return '#c2410c' // Dark Orange
  if (colId === 'col_70') return '#a16207' // Dark Yellow
  if (colId === 'col_90') return '#15803d' // Dark Green
  if (colId === 'that_bai') return '#b91c1c' // Dark Red
  if (colId === 'hoan_thanh') return '#047857' // Dark Emerald
  if (colId === 'nhap') return '#1d4ed8' // Dark Blue
  return '#334155' // Slate 700
}

const getColHeaderBg = (colId) => {
  const color = getColTitleColor(colId)
  return `color-mix(in srgb, ${color} 15%, transparent)`
}

const fetchData = async () => {
  loading.value = true
  try {
    const [resPipeline, resWorkflow] = await Promise.all([
      fetch(`${SCRIPT_URL}?sheet=pipeline&action=get`),
      fetch(`${SCRIPT_URL}?sheet=pipeline_workflow&action=get`)
    ])
    
    const result = await resPipeline.json()
    const wfResult = await resWorkflow.json()
    
    if (wfResult.status === 'success') {
      workflowsData.value = wfResult.data || []
    }
    
    if (result.status === 'success') {
      items.value = (result.data || []).map(item => {
        // Format ISO dates coming from Google Sheets API back to DD/MM/YYYY HH:mm:ss
        if (item.created_time && item.created_time.includes('T') && item.created_time.endsWith('Z')) {
          const d = new Date(item.created_time)
          if (!isNaN(d)) {
            const pad = n => String(n).padStart(2, "0")
            item.created_time = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
          }
        }
        return item
      })
      distributeItems()
      if (route.query.openId) {
        const targetItem = items.value.find(i => String(i.Id_pipeline) === String(route.query.openId))
        if (targetItem) {
          selectedWorkflowId.value = targetItem.id_workflow || 'WF_DEFAULT'
          highlightedCardId.value = targetItem.Id_pipeline
          
          setTimeout(() => {
            const el = document.getElementById('pipeline-card-' + targetItem.Id_pipeline)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 100)

          setTimeout(() => {
            highlightedCardId.value = null
          }, 2500)
        }
        router.replace({ path: '/pipeline' })
      }
    } else {
      console.error('Fetch error:', result.message)
    }
  } catch (err) {
    console.error('Network error:', err)
  } finally {
    loading.value = false
  }
}

const fetchReports = async () => {
  try {
    const res = await fetch(`${SCRIPT_URL}?sheet=REPORT&action=get`)
    const result = await res.json()
    if (result.status === 'success') {
      // Sort reports by latest ID descending if possible, or just keep them as fetched
      reports.value = result.data || []
    }
  } catch (err) {
    console.error('Lỗi khi fetch reports:', err)
  }
}

const optimisticCleanupFolders = () => {
  const allCols = [...COLUMNS.value.map(c => c.id), 'unassigned']
  for (const colId of allCols) {
    const list = boardData.value[colId]
    if (!list) continue
    for (let i = list.length - 1; i >= 0; i--) {
      const folder = list[i]
      if (folder.isGroup && folder.linked_items && folder.linked_items.length <= 1) {
        if (folder.linked_items.length === 1) {
          const lastItem = folder.linked_items[0]
          lastItem.id_pipeline_lien_ket = ''
          list.splice(i, 1, lastItem) // Thay Folder bằng Thẻ cuối cùng
          syncItemAPI(lastItem) // Chạy ngầm định
        } else {
          list.splice(i, 1) // Folder rỗng, xoá luôn
        }
      }
    }
  }
}

const onNestedChange = (evt, dropTarget) => {
  if (evt.added) {
    const item = evt.added.element
    
    if (dropTarget.isGroup) {
      item.id_pipeline_lien_ket = dropTarget.Id_pipeline
      item.status_name = dropTarget.status_name
      item['%status'] = dropTarget['%status']
      syncItemAPI(item)
    } else {
      const newGroupId = `GRP_${Date.now()}`
      
      dropTarget.id_pipeline_lien_ket = newGroupId
      item.id_pipeline_lien_ket = newGroupId
      item.status_name = dropTarget.status_name
      item['%status'] = dropTarget['%status']
      
      distributeItems()
      
      // Gửi API ngầm định hàng loạt (bulk)
      syncBulkItemsAPI([dropTarget, item])
    }
  }
}

const onChange = (evt, colId) => {
  if (evt.added) {
    const item = evt.added.element
    const colConfig = COLUMNS.value.find(c => c.id === colId) || { value: '', percent: '' }
    
    if (item.isGroup) {
      item.status_name = colConfig.value
      item['%status'] = colConfig.percent
      
      const childrenToUpdate = []
      for (const child of item.linked_items) {
        child.status_name = colConfig.value
        child['%status'] = colConfig.percent
        if (colId === 'that_bai') { child['%status'] = '100%'; child.isSuccess = false }
        else if (colId === 'hoan_thanh') child.isSuccess = true
        else child.isSuccess = ''
        childrenToUpdate.push(child)
      }
      syncBulkItemsAPI(childrenToUpdate)
    } else {
      item.id_pipeline_lien_ket = '' 
      
      if (colId === 'unassigned') {
        item.status_name = ''
        item['%status'] = ''
        item.isSuccess = ''
      } else {
        item.status_name = colConfig.value
        item['%status'] = colConfig.percent
        if (colId === 'that_bai') {
          item['%status'] = '100%'
          item.isSuccess = false
        } else if (colId === 'hoan_thanh') {
          item.isSuccess = true
        } else {
          item.isSuccess = ''
        }
      }
      
      ;(async () => {
        await syncItemAPI(item)
      })()
      
      // Tự động giải tán Folder nếu bị rút mất thẻ
      optimisticCleanupFolders()
    }
  }
}

const onStatusNameChange = () => {
  const colConfig = COLUMNS.value.find(c => c.value === formData.value.status_name)
  if (colConfig) {
    formData.value['%status'] = colConfig.percent
  }
}

// Cloudinary Upload Logic
const uploadCloudinary = async (file) => {
  try {
    const fd = new FormData()
    fd.append('upload_preset', 'upload_file')
    fd.append('file', file)
    const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
      method: 'POST',
      body: fd
    }).then(r => r.json())
    return uploadRes.secure_url || ''
  } catch (e) {
    console.error('Lỗi upload file:', e)
    return ''
  }
}

const scanVolumeFileInput = ref(null)

const triggerScanVolumeFile = () => {
  if (scanVolumeFileInput.value) {
    scanVolumeFileInput.value.click()
  }
}

const onScanVolumeFileChange = async (event) => {
  const target = event.target
  if (!target.files || target.files.length === 0) return
  
  const file = target.files[0]
  
  try {
    let foundTotal = 0
    let previewUrl = null
    let isExcelFile = false
    let excelHtmlPreview = ''
    const arrayBuffer = await file.arrayBuffer()

    if (file.name.toLowerCase().endsWith('.pdf')) {
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      
      // Tạo ảnh preview cho PDF (trang 1)
      try {
        const page1 = await doc.getPage(1)
        const viewport = page1.getViewport({ scale: 1.0 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        await page1.render({ canvasContext: context, viewport: viewport }).promise
        previewUrl = canvas.toDataURL('image/png')
      } catch (e) {
        console.warn('Không thể tạo preview cho PDF', e)
      }
      
      let fullText = ''
      
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map(item => item.str).join(' ') + ' '
      }
      
      const matches = fullText.match(/[\d,\.]+/g) || []
      let nums = []
      
      matches.forEach(m => {
        const clean = m.replace(/,/g, '')
        const cleanDot = clean.replace(/\./g, '')
        const n = Number(clean)
        const nDot = Number(cleanDot)
        const finalNum = (nDot > n && nDot % 1000 === 0) ? nDot : n
        // Bỏ qua các số nhỏ (dưới 100k thường ko phải là tổng báo giá B2B) và số điện thoại / STK
        if (!isNaN(finalNum) && finalNum >= 100000 && finalNum !== 199458149) {
          nums.push(finalNum)
        }
      })
      
      nums = [...new Set(nums)].sort((a, b) => b - a)
      
      if (nums.length > 0) {
        let found = false
        for (let i = 0; i < nums.length; i++) {
          for (let j = i + 1; j < nums.length; j++) {
            let max = nums[i]
            let min = nums[j]
            let diff10 = Math.abs((min * 1.1) - max)
            let diff8 = Math.abs((min * 1.08) - max)
            // Nếu có sự chênh lệch chuẩn 8% hoặc 10% VAT, số nhỏ hơn chính là Trước Thuế
            if (diff10 <= 10 || diff8 <= 10) {
              foundTotal = min
              found = true
              break
            }
          }
          if (found) break
        }
        
        // Nếu không tìm thấy cặp số có thuế, lấy số lớn nhất làm tổng cộng
        if (!found) {
          foundTotal = nums[0]
        }
      }
    } else {
      isExcelFile = true
      // Logic cho file Excel (Sử dụng SheetJS / XLSX để hỗ trợ cả .xls và .xlsx)
      const data = new Uint8Array(arrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const wsName = workbook.SheetNames[0]
      const ws = workbook.Sheets[wsName]
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
      
      let htmlPreview = '<table style="width: 100%; border-collapse: collapse; font-size: 11px; background: white; color: black; text-align: left;">'
      for (let i = 0; i < Math.min(rows.length, 15); i++) {
        htmlPreview += '<tr>'
        const rowLen = rows[i] ? rows[i].length : 0
        // Cố định in ra tối đa 8 cột để nhìn đẹp trên giao diện
        for (let j = 0; j < Math.max(Math.min(rowLen, 8), 5); j++) {
           const cellVal = rows[i] && rows[i][j] !== undefined && rows[i][j] !== null ? rows[i][j] : ''
           let displayVal = String(cellVal)
           if (displayVal.length > 25) displayVal = displayVal.substring(0, 25) + '...'
           htmlPreview += `<td style="border: 1px solid #e2e8f0; padding: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;">${displayVal}</td>`
        }
        htmlPreview += '</tr>'
      }
      htmlPreview += '</table>'
      if (rows.length > 15) {
        htmlPreview += '<div style="text-align: center; font-size: 11px; color: #64748b; margin-top: 4px; padding: 4px; background: #f8fafc;">... và ' + (rows.length - 15) + ' dòng khác</div>'
      }
      excelHtmlPreview = htmlPreview
      
      let beforeTaxCol = -1
      
      // Lượt 1: Tìm cột "Trước thuế" hoặc "Thành tiền"
      rows.forEach((row) => {
        if (!row || !Array.isArray(row)) return
        row.forEach((cell, colNumber) => {
          const text = String(cell || '').toLowerCase()
          if (text.includes('thành tiền trước thuế') || 
              (text.includes('thành tiền') && !text.includes('sau thuế') && !text.includes('vat')) || 
              text === 'thành tiền' || text.includes('amount')) {
            if (beforeTaxCol === -1) beforeTaxCol = colNumber
          }
        })
      })
      
      // Lượt 2: Tìm dòng tổng cộng và lấy số liệu
      rows.forEach((row) => {
        if (!row || !Array.isArray(row)) return
        let isTotalRow = false
        let rowNumbers = []
        let colMap = {}
        
        row.forEach((cell, colNumber) => {
          const val = cell
          let text = String(val || '')
          
          if (typeof val === 'number') {
            rowNumbers.push(val)
            colMap[colNumber] = val
          } else if (typeof val === 'string') {
            const cleanStr = val.replace(/,/g, '')
            if (cleanStr && !isNaN(Number(cleanStr)) && cleanStr.trim() !== '') {
               const n = Number(cleanStr)
               rowNumbers.push(n)
               colMap[colNumber] = n
            }
          }
          
          text = text.toLowerCase()
          if (text.includes('tổng cộng') || text.includes('cộng tiền hàng') || text.includes('tổng tiền') || text.includes('total') || text.includes('cộng')) {
            isTotalRow = true
          }
        })
        
        if (isTotalRow) {
          if (beforeTaxCol !== -1 && colMap[beforeTaxCol] !== undefined && colMap[beforeTaxCol] > 0) {
            if (colMap[beforeTaxCol] > foundTotal) {
              foundTotal = colMap[beforeTaxCol]
            }
          } else {
            const nums = rowNumbers.filter(n => !isNaN(n) && n > 0)
            if (nums.length >= 2) {
               // Số đầu tiên trong dãy số (từ trái qua) thường là trước thuế
               const firstNum = nums[0]
               if (firstNum > foundTotal) foundTotal = firstNum
            } else if (nums.length === 1) {
               if (nums[0] > foundTotal) foundTotal = nums[0]
            } else if (nums.length > 0) {
               const rowMax = Math.max(...nums)
               if (rowMax > foundTotal) foundTotal = rowMax
            }
          }
        }
      })
    }
    
    if (foundTotal > 0) {
      const userConfirmResult = await customConfirm(
        'Xác nhận File & Số tiền', 
        '', 
        true,
        { previewUrl, isExcel: isExcelFile, fileName: file.name, excelHtml: excelHtmlPreview, editableAmount: foundTotal }
      )
      if (userConfirmResult && userConfirmResult.confirmed) {
        formData.value.volume = userConfirmResult.amount
        await handleFileUpload({ target: { files: [file] } })
      }
    } else {
      await customConfirm(
        'Thông báo', 
        'Không tìm thấy dữ liệu "Tổng cộng trước thuế" hoặc số tiền hợp lệ trong file này.', 
        false,
        { previewUrl, isExcel: isExcelFile, fileName: file.name, excelHtml: excelHtmlPreview }
      )
    }
    
  } catch (err) {
    console.error(err)
    await customConfirm('Lỗi', 'Lỗi khi đọc file: ' + String(err.message || err), false)
  }
  
  target.value = ''
}

const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  
  uploadingFiles.value = true
  try {
    const newNames = []
    const newLinks = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const url = await uploadCloudinary(file)
      if (url) {
        newNames.push(file.name)
        newLinks.push(url)
      }
    }
    
    if (newNames.length > 0) {
      if (formData.value.ten_file) {
        formData.value.ten_file += ', ' + newNames.join(', ')
      } else {
        formData.value.ten_file = newNames.join(', ')
      }
      
      if (formData.value.link_file) {
        formData.value.link_file += ', ' + newLinks.join(', ')
      } else {
        formData.value.link_file = newLinks.join(', ')
      }
    }
  } catch (error) {
    console.error('Upload error', error)
    alert('Có lỗi xảy ra khi upload file lên Cloudinary.')
  } finally {
    uploadingFiles.value = false
    event.target.value = '' // Reset input
  }
}

const fileList = computed(() => {
  if (!formData.value.ten_file && !formData.value.link_file) return []
  const names = (formData.value.ten_file || '').split(',').map(s => s.trim()).filter(Boolean)
  const links = (formData.value.link_file || '').split(',').map(s => s.trim()).filter(Boolean)
  
  const maxLength = Math.max(names.length, links.length)
  const list = []
  for (let i = 0; i < maxLength; i++) {
    list.push({
      name: names[i] || `File ${i + 1}`,
      url: links[i] || ''
    })
  }
  return list
})

const getPreviewUrl = (url) => {
  if (!url) return ''
  const u = url.toLowerCase()
  // Sử dụng Microsoft Office Viewer cho các định dạng văn phòng vì trình duyệt không tự đọc được
  if (u.includes('.xls') || u.includes('.doc') || u.includes('.ppt')) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
  }
  // Nếu muốn Google Viewer (hỗ trợ nhiều format hơn nhưng thi thoảng bị chặn iframe):
  // return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`
  return url
}

const getDownloadUrl = (url) => {
  if (!url) return ''
  if (url.includes('drive.google.com/file/d/')) {
    try {
      const id = url.split('/d/')[1].split('/')[0]
      return `https://drive.google.com/uc?export=download&id=${id}`
    } catch(e) {
      return url
    }
  }
  // If it's a cloudinary URL, inject fl_attachment to force download
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/fl_attachment/')
  }
  return url
}

const removeFile = (index) => {
  const names = (formData.value.ten_file || '').split(',').map(s => s.trim()).filter(Boolean)
  const links = (formData.value.link_file || '').split(',').map(s => s.trim()).filter(Boolean)
  
  names.splice(index, 1)
  links.splice(index, 1)
  
  formData.value.ten_file = names.join(', ')
  formData.value.link_file = links.join(', ')
}

const parseFinishTime = (ft) => {
  if (!ft) {
    tempStartDate.value = ''
    tempEndDate.value = ''
    return
  }
  const parts = ft.split('-').map(s => s.trim())
  const parseDateToMonth = (dStr) => {
    if (!dStr) return ''
    const [d, m, y] = dStr.split('/')
    if (m && y) return `${y}-${m}`
    return ''
  }
  tempStartDate.value = parseDateToMonth(parts[0]) || ''
  tempEndDate.value = parseDateToMonth(parts[1]) || ''
}

const updateFinishTime = () => {
  const formatOutToFirstDay = (monthStr) => {
    if (!monthStr) return ''
    const [y, m] = monthStr.split('-')
    if (y && m) return `01/${m}/${y}`
    return ''
  }
  const start = formatOutToFirstDay(tempStartDate.value)
  const end = formatOutToFirstDay(tempEndDate.value)
  
  if (start && end) {
    formData.value.finish_time = `${start} - ${end}`
  } else if (start) {
    formData.value.finish_time = start
  } else if (end) {
    formData.value.finish_time = end
  } else {
    formData.value.finish_time = ''
  }
}

const getCurrentFormattedTime = () => {
  const d = new Date()
  const pad = n => String(n).padStart(2, "0")
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const openAddModal = () => {
  isEditing.value = false
  formData.value = { ...defaultFormData }
  formData.value.id_workflow = selectedWorkflowId.value === 'WF_DEFAULT' ? '' : selectedWorkflowId.value
  formData.value.created_time = getCurrentFormattedTime()
  tempStartDate.value = ''
  tempEndDate.value = ''
  showModal.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  formData.value = { ...item }
  originalFormData.value = JSON.stringify(formData.value)
  parseFinishTime(item.finish_time)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveItem = async () => {
  const isUpdate = isEditing.value
  const optimisticData = { ...formData.value }
  
  // Optimistic UI Update
  if (isUpdate) {
    const index = items.value.findIndex(i => i.Id_pipeline === optimisticData.Id_pipeline)
    if (index !== -1) items.value[index] = optimisticData
  } else {
    optimisticData.Id_pipeline = 'temp_' + Date.now()
    items.value.unshift(optimisticData)
  }
  
  distributeItems()
  closeModal()
  
  saving.value = true
  try {
    const payload = {
      sheet: 'pipeline',
      action: isUpdate ? 'update' : 'add',
      ...optimisticData
    }
    if (!isUpdate) delete payload.Id_pipeline

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const result = await res.json()
    if (result.status === 'success') {
      fetchData()
    } else {
      alert('Lỗi khi lưu: ' + result.message)
      fetchData()
    }
  } catch (err) {
    console.error('Error saving item:', err)
    fetchData()
  } finally {
    saving.value = false
  }
}

const duplicateItem = (item) => {
  isEditing.value = false
  const newItem = { ...item }
  
  delete newItem.Id_pipeline
  newItem.id_pipeline_lien_ket = ''
  newItem['%status'] = ''
  newItem.status_name = ''
  newItem.isSuccess = ''
  newItem.created_time = getCurrentFormattedTime()
  
  formData.value = { ...defaultFormData, ...newItem }
  parseFinishTime(newItem.finish_time || '')
  showModal.value = true
}

const requestAction = (item, actionType) => {
  confirmActionModal.value = { show: true, item, action: actionType }
}

const startMerge = (item) => {
  mergeMode.value = true
  mergeTarget.value = item
  mergeSelected.value = []
}

const toggleMergeSelect = (item) => {
  if (!mergeMode.value) return
  const index = mergeSelected.value.findIndex(i => i.Id_pipeline === item.Id_pipeline)
  if (index > -1) {
    mergeSelected.value.splice(index, 1)
  } else {
    mergeSelected.value.push(item)
  }
}

const cancelMerge = () => {
  mergeMode.value = false
  mergeTarget.value = null
  mergeSelected.value = []
}

const executeMerge = async () => {
  if (mergeSelected.value.length === 0) return
  
  const target = mergeTarget.value
  let groupId = target.id_pipeline_lien_ket ? String(target.id_pipeline_lien_ket).trim() : ''
  if (!groupId) {
    groupId = `GRP_${Date.now()}`
    target.id_pipeline_lien_ket = groupId
  }
  
  const itemsToUpdate = [target]
  
  mergeSelected.value.forEach(item => {
    item.id_pipeline_lien_ket = groupId
    item.status_name = target.status_name
    item['%status'] = target['%status']
    itemsToUpdate.push(item)
  })
  
  distributeItems() // Update UI immediately
  cancelMerge()
  
  await syncBulkItemsAPI(itemsToUpdate)
  fetchData() // Ensure consistency after background sync
}

const executeAction = async () => {
  const { item, action } = confirmActionModal.value
  if (!item) return
  confirmActionModal.value.show = false
  if (showModal.value) closeModal()
  
  if (action === 'delete') {
    // Remove locally right away
    items.value = items.value.filter(i => i.Id_pipeline !== item.Id_pipeline)
    distributeItems()
    
    backgroundSyncing.value = true
    try {
      const payload = {
        sheet: 'pipeline',
        action: 'delete',
        Id_pipeline: item.Id_pipeline
      }
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (result.status !== 'success') {
        fetchData() // Reload if failed
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      fetchData()
    } finally {
      backgroundSyncing.value = false
    }
  } else if (action === 'complete' || action === 'fail') {
    item.status_name = action === 'complete' ? 'THÀNH CÔNG' : 'THẤT BẠI'
    item['%status'] = '100%'
    item.isSuccess = action === 'complete'
    distributeItems() // Optimistic UI update
    
    await syncItemAPI(item)
    fetchData()
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchData()
  fetchReports()
  
  const pendingPipeline = sessionStorage.getItem('pendingPipelineCreate')
  if (pendingPipeline) {
    try {
      const parsed = JSON.parse(pendingPipeline)
      sessionStorage.removeItem('pendingPipelineCreate')
      setTimeout(() => {
        openAddModal()
        formData.value.content_of_contract_po = parsed.content || ''
        formData.value.ghi_chu_hop_dong = parsed.note || ''
      }, 300)
    } catch (e) {
      console.error('Error parsing pending pipeline data', e)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.scan-confirm-body {
  padding: 1.5rem;
  color: #e2e8f0;
  font-size: 14px;
  line-height: 1.6;
  display: flex;
  gap: 24px;
}
.scan-confirm-preview {
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.05);
  padding: 12px;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
}
@media (max-width: 768px) {
  .scan-confirm-body {
    flex-direction: column;
  }
  .scan-confirm-preview {
    flex: none;
    width: 100%;
    max-width: 100%;
  }
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@keyframes card-highlight-pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8); background-color: rgba(16, 185, 129, 0.4); transform: scale(1); }
  50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); background-color: rgba(16, 185, 129, 0.7); transform: scale(1.03); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); background-color: rgba(16, 185, 129, 0.4); transform: scale(1); }
}

.highlight-card {
  animation: card-highlight-pulse 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  border: 2px solid #10b981 !important;
  background-color: rgba(16, 185, 129, 0.4) !important;
  z-index: 10;
  position: relative;
}

.pipeline-page {
  padding: 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 15% 50%, rgba(30, 41, 59, 0.8), #0b0f19 80%);
  color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
}
.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #f8fafc;
}
.actions {
  display: flex;
  gap: 12px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}
.btn-primary {
  background: #3b82f6;
  color: white;
}
.btn-primary:hover { background: #2563eb; }
.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
}
.btn-icon:hover { opacity: 1; background: rgba(255,255,255,0.1); }
.text-primary { color: #3b82f6; }
.text-danger { color: #ef4444; }
.text-success { color: #10b981; }

/* Kanban Board Layout */
.kanban-board {
  display: flex;
  gap: 8px;
  overflow-x: visible;
  padding-bottom: 0;
  flex: 1;
}

.kanban-column {
  background: rgba(15, 23, 42, 0.7);
  border-radius: 12px;
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid rgba(255,255,255,0.04);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}

.kanban-column.col-that-bai {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
}

.kanban-column.col-hoan-thanh {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
}

/* Elite Kanban Header & Board styles */
.kanban-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.kanban-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px currentColor;
}
.dot-primary { background: #3b82f6; color: rgba(59,130,246,0.6); }
.dot-success { background: #10b981; color: rgba(16,185,129,0.6); }
.dot-danger { background: #ef4444; color: rgba(239,68,100,0.6); }
.dot-warning { background: #f59e0b; color: rgba(245,158,11,0.6); }
.dot-30 { background: #ef4444; color: rgba(239,68,68,0.6); }
.dot-50 { background: #f97316; color: rgba(249,115,22,0.6); }
.dot-70 { background: #eab308; color: rgba(234,179,8,0.6); }
.dot-90 { background: #22c55e; color: rgba(34,197,94,0.6); }

.kanban-badge {
  background: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.draggable-zone {
  padding: 8px;
  flex: 1;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 50px;
}
.draggable-zone::-webkit-scrollbar { width: 4px; }
.draggable-zone::-webkit-scrollbar-track { background: transparent; }
.draggable-zone::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* VIP Card Design (Ultra Elite Style) */
.vip-card {
  position: relative;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 16px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
}
.tl-shimmer-border {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
  box-shadow: inset 0 0 0 1px transparent;
  z-index: 10;
}
.vip-card:hover .tl-shimmer-border {
  opacity: 1;
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.4);
  background: linear-gradient(145deg, rgba(56, 189, 248, 0.08) 0%, transparent 60%);
}

.vip-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
}
.vip-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.4), 0 8px 12px -6px rgba(0, 0, 0, 0.2);
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(255,255,255,0.08);
}
.vip-card:active {
  transform: scale(0.98);
  cursor: grabbing;
}
.vip-details summary:hover {
  background: rgba(255, 255, 255, 0.05);
}
.vip-details summary::marker {
  color: #ffffff;
}

.file-link-hover:hover {
  text-decoration: underline !important;
  color: #93c5fd !important;
}

.download-icon-hover:hover {
  color: #10b981 !important;
}

.vip-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.vip-id {
  font-family: 'JetBrains Mono', monospace, sans-serif;
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.05em;
}
.vip-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}
.vip-avatar {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  font-weight: 800;
  box-shadow: 0 0 0 2px #111827;
}

.vip-title-area {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vip-client {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #f9fafb;
  letter-spacing: -0.01em;
  line-height: 1.3;
}
.vip-company {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}

.vip-content {
  background: transparent;
}
.vip-desc {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #d1d5db;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.vip-meta-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #8b5cf6;
}
.vip-meta-inline .dot {
  color: #4b5563;
}

.vip-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(245, 158, 11, 0.05);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  color: #fbbf24;
  font-style: italic;
  line-height: 1.4;
  border-left: 2px solid #fbbf24;
}
.vip-note svg {
  fill: none; stroke: currentColor; opacity: 0.8; margin-top: 2px; flex-shrink: 0;
}

.vip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0px;
  padding-top: 4px;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.vip-date, .vip-deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}
.vip-date svg, .vip-deadline svg {
  fill: none; stroke: currentColor; opacity: 0.7;
}
.vip-deadline.has-deadline {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}
.vip-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.vip-card:hover .vip-actions {
  opacity: 1;
}
.vip-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.vip-btn:hover { background: rgba(255,255,255,0.1); color: #f9fafb; }
.vip-btn.primary { color: #60a5fa; }
.vip-btn.primary:hover { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
.vip-btn.success { color: #34d399; }
.vip-btn.success:hover { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
.vip-btn.danger { color: #f87171; }
.vip-btn.danger:hover { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

.vip-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes popIn {
  from { opacity: 0; transform: translate(-50%, -10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.drag-cursor-tooltip {
  position: fixed;
  pointer-events: none;
  z-index: 999999;
  transform: translate(-50%, -50%);
  background: rgba(16, 185, 129, 0.95);
  backdrop-filter: blur(6px);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.ghost-card {
  opacity: 0.6;
  background: rgba(30, 41, 59, 0.8);
  border: 2px dashed rgba(16, 185, 129, 0.5);
  transition: none !important;
}
.sortable-drag, .sortable-chosen {
  transition: none !important;
}

/* Tag Badges */
.tag-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}
.tag-normal {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}
.tag-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}
.tag-urgent {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}



/* Modal and Inputs */
.search-input, .input-field {
  width: 100%;
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6);
  color: #f8fafc;
  font-size: 0.875rem;
  box-sizing: border-box;
}
.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
}

.form-grid .input-field, .form-grid .custom-select-container {
  max-width: 380px;
}
.search-input { padding-left: 36px; }
.search-input:focus, .input-field:focus { 
  outline: none; 
  border-color: #10b981; 
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
  background: rgba(15, 23, 42, 0.9);
}
.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #f8fafc;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
  border-top-color: #fff; animation: spin 1s linear infinite;
}
.spinner.small { width: 12px; height: 12px; border-width: 2px; }
.spinner.large { width: 24px; height: 24px; }
@keyframes spin { to { transform: rotate(360deg); } }

.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex: 1; color: #94a3b8; gap: 12px;
}

.sync-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.sync-indicator.is-syncing {
  transform: translateY(0);
  opacity: 1;
}

/* File List Styles */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}
.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  color: #e2e8f0;
  font-size: 13px;
}
.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.empty-files {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
  padding: 12px;
  background: rgba(0,0,0,0.1);
  border-radius: 6px;
  text-align: center;
}

/* Custom Select Styles */
.custom-select-container {
  position: relative;
  cursor: pointer;
}
.custom-select-value {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 40px;
  height: auto;
  padding: 6px 12px;
}
.dropdown-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 40;
}
.custom-select-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  margin-bottom: 4px;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 -10px 15px -3px rgba(0,0,0,0.5);
}
.custom-select-dropdown::-webkit-scrollbar { width: 6px; }
.custom-select-dropdown::-webkit-scrollbar-track { background: transparent; }
.custom-select-dropdown::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

.custom-option {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: background 0.2s;
  cursor: pointer;
}
.custom-option.is-selected {
  background: rgba(16, 185, 129, 0.1);
}
.custom-option:last-child {
  border-bottom: none;
}
.custom-option:hover {
  background: rgba(59, 130, 246, 0.2);
}
.report-main {
  font-size: 14px;
  color: #f8fafc;
  font-weight: 500;
  line-height: 1.4;
  display: flex;
  align-items: center;
}
.report-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  line-height: 1.3;
}

/* Chips for Multi-select */
.report-chip {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13.5px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  max-width: 100%;
}
.chip-text {
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  flex: 1;
}
.chip-sub {
  opacity: 0.8;
  font-size: 0.9em;
}
.remove-chip {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  color: #f87171;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.remove-chip:hover {
  opacity: 1;
}

/* Nested Draggable Styles */
.nested-dropzone-container {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255,255,255,0.1);
}
.nested-dropzone {
  min-height: 35px;
  background: rgba(0,0,0,0.2);
  border-radius: 6px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.2s;
  position: relative;
}
.kanban-board.is-dragging .kanban-card {
  position: relative;
}
.kanban-board.is-dragging .kanban-card .nested-dropzone-container {
  position: absolute;
  top: 15%;
  bottom: 15%;
  left: 0;
  right: 0;
  z-index: 10;
}
.kanban-board.is-dragging .kanban-card .nested-dropzone {
  height: 100%;
  min-height: 100%;
}

/* Merge Dropzone Styles */
.merge-dropzone-container {
  position: absolute;
  top: 15%;
  bottom: 15%;
  left: 0;
  right: 0;
  z-index: -1;
  opacity: 0;
  pointer-events: none;
}
.kanban-wrapper.is-dragging .merge-dropzone-container {
  z-index: 10;
  pointer-events: auto;
}
.merge-dropzone {
  height: 100%;
  min-height: 100%;
  background: transparent !important;
  border: none !important;
  padding: 0;
}
.kanban-wrapper.is-dragging .merge-dropzone-container .merge-dropzone:hover {
  background: rgba(59,130,246,0.15) !important;
  border: 2px dashed #60a5fa !important;
  border-radius: 8px;
  opacity: 1;
}
.kanban-card .nested-dropzone .ghost-sub-card {
  position: absolute;
  inset: 0;
  background: rgba(96, 165, 250, 0.2) !important;
  border: 2px dashed #60a5fa !important;
  border-radius: 8px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  opacity: 1 !important;
  margin: 0 !important;
  padding: 0 !important;
}
.kanban-card .nested-dropzone .ghost-sub-card > * {
  display: none !important;
}
.kanban-card .nested-dropzone .ghost-sub-card::after {
  content: "+";
  font-size: 60px;
  font-weight: 300;
  color: #60a5fa;
  display: block;
}
.nested-dropzone:hover {
  background: rgba(59,130,246,0.1);
  border: 1px dashed rgba(59,130,246,0.3);
}
.kanban-sub-card {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.2s;
}
.kanban-sub-card:hover {
  background: #334155;
  transform: translateY(-1px);
}
.sub-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.sub-card-id {
  font-size: 10px;
  font-weight: 700;
  color: #60a5fa;
}
.sub-card-badge {
  font-size: 9px;
  background: rgba(16,185,129,0.15);
  color: #10b981;
  padding: 2px 4px;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}
.sub-card-content {
  font-size: 11px;
  color: #cbd5e1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}
.ghost-sub-card {
  opacity: 1 !important;
  background: rgba(59,130,246,0.15) !important;
  border: 2px dashed #60a5fa !important;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}
.ghost-sub-card::after {
  content: "+ Thả vào để gộp";
  color: #60a5fa;
  font-weight: 600;
  font-size: 12px;
}
.ghost-sub-card > * {
  display: none !important;
}

/* Folder UI Styles */
.kanban-group-folder {
  background: rgba(30, 41, 59, 0.7);
  border: 1px dashed rgba(148, 163, 184, 0.4);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 12px;
  cursor: grab;
  transition: all 0.2s;
}
.kanban-group-folder:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(96, 165, 250, 0.6);
}
.folder-header {
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.folder-title {
  font-size: 13px;
  font-weight: 600;
  color: #93c5fd;
  margin: 0 0 2px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.folder-subtitle {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.elite-time-filter.elite-filter-panel {
  position: relative;
  background: rgba(20, 32, 50, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05);
  margin-bottom: 1.5rem;
  z-index: 10;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.elite-time-filter.elite-filter-panel:hover {
  box-shadow: 0 16px 48px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15);
}
.elite-time-filter .elite-filter-accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981 0%, #34d399 40%, #6ee7b7 70%, #a7f3d0 100%);
  border-radius: 12px 12px 0 0;
}
.elite-time-filter .elite-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem 0;
}
.elite-time-filter .elite-filter-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
}
.elite-time-filter .elite-filter-title svg { color: #10b981; }
.elite-time-filter .elite-refresh-btn {
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
  cursor: pointer;
}
.elite-time-filter .elite-refresh-btn:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%);
  transform: translateY(-1px);
}
.elite-time-filter .elite-filter-body {
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.elite-time-filter .elite-filter-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}
/* Mode Tabs */
.elite-time-filter .elite-mode-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 4px;
  gap: 3px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}
.elite-time-filter .elite-mode-tabs button {
  padding: 0.5rem 1.4rem;
  border-radius: 9px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: none;
  cursor: pointer;
  border: none;
}
.elite-time-filter .elite-mode-tabs button.active {
  background: #ffffff;
  color: #065f46;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.elite-time-filter .elite-mode-tabs button:hover:not(.active) {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.1);
}
/* Date groups */
.elite-time-filter .elite-date-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 120px;
  flex: 1;
}
.elite-time-filter .elite-date-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0;
}
.elite-time-filter .elite-input {
  width: 100%;
  padding: 0.6rem 1.2rem;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.875rem;
  color: #f8fafc;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.25s ease;
  box-sizing: border-box;
  font-weight: 500;
  outline: none;
}
.elite-time-filter .elite-input:focus {
  border-color: #10b981;
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2), 0 2px 8px -2px rgba(16, 185, 129, 0.3);
}
.elite-time-filter .elite-range-sep {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: #10b981;
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.6;
}
::-webkit-calendar-picker-indicator {
    filter: invert(1);
}

@media (max-width: 768px) {
  .large-modal {
    max-height: 70vh !important;
  }
  .finish-time-row {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }
  .finish-time-separator {
    display: none !important;
  }
  .finish-time-row .mobile-label {
    display: block !important;
  }
  .kanban-wrapper {
    flex-direction: row !important;
    overflow-x: auto !important;
    scroll-snap-type: x mandatory !important;
    padding-bottom: 20px !important;
    scrollbar-width: none;
  }
  .kanban-wrapper::-webkit-scrollbar {
    display: none;
  }
  .elite-filter-panel {
    flex-direction: column !important;
    gap: 1rem !important;
    align-items: stretch !important;
    padding: 1rem !important;
    box-sizing: border-box !important;
  }
  .elite-filter-panel .search-container {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  .elite-filter-panel .search-container input {
    box-sizing: border-box !important;
    width: 100% !important;
  }
  .elite-filter-panel .header-actions {
    width: 100% !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
  }
  .elite-time-filter .elite-mode-tabs {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    padding: 4px !important;
    justify-content: flex-start !important;
    -webkit-overflow-scrolling: touch;
  }
  .elite-time-filter .elite-mode-tabs button {
    padding: 0.4rem 0.6rem !important;
    font-size: 0.75rem !important;
    flex-shrink: 0;
  }
  .kanban-board {
    flex-direction: row !important;
    overflow-y: visible !important;
    overflow-x: visible !important;
    flex: none !important;
  }
  .kanban-column {
    min-width: 88vw !important;
    width: 88vw !important;
    margin-bottom: 0 !important;
    height: 100% !important;
    scroll-snap-align: center !important;
    flex: none !important;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .large-modal {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100% !important;
    max-height: 100% !important;
    border-radius: 0 !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
    margin: 0 !important;
  }
  .modal-body {
    padding: 16px !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
    width: 100% !important;
  }
  .modal-footer {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    padding: 16px !important;
    padding-bottom: 90px !important;
    gap: 8px !important;
    box-sizing: border-box !important;
    width: 100% !important;
    justify-content: space-between !important;
    scrollbar-width: none;
  }
  .modal-footer::-webkit-scrollbar {
    display: none;
  }
  .modal-footer > div {
    display: contents !important;
  }
  .modal-footer button {
    flex: none !important;
    white-space: nowrap !important;
  }
  .hide-on-mobile {
    display: none !important;
  }
  .form-grid .input-field, .form-grid .custom-select-container {
    max-width: 100% !important;
  }
}

.pipeline-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 99px;
  background: transparent;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pipeline-tab-btn:hover {
  color: #e2e8f0;
}

.pipeline-tab-btn.active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.pipeline-tab-btn svg {
  stroke-width: 2.5;
}

.export-modal-content {
  width: 1000px;
  max-width: 95vw;
}
.export-modal-body {
  min-height: 400px;
  max-height: 70vh;
}

@media (max-width: 768px) {
  .export-modal-content {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    margin: 0 !important;
    border: none !important;
  }
  .export-modal-body {
    flex-direction: column !important;
    gap: 12px !important;
    min-height: auto !important;
    max-height: none !important;
    flex: 1 !important;
    overflow-y: auto !important;
    padding: 16px !important;
  }
  .export-filters {
    width: 100% !important;
    border-right: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    padding-right: 0 !important;
    padding-bottom: 16px !important;
    flex-shrink: 0 !important;
  }
  .export-preview-container {
    overflow-y: visible !important;
  }
  .export-preview-container > div {
    overflow-y: visible !important;
  }
  .export-modal-footer {
    padding-bottom: 90px !important;
    justify-content: center !important;
  }
  .export-modal-footer .tech-vip-btn {
    width: 100% !important;
  }
}
</style>
