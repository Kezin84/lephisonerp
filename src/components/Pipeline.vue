<template>
  <div class="pipeline-page">
    <!-- Elite Header -->
    <header class="header" style="position: relative; justify-content: center; display: flex; align-items: center; margin-bottom: 1.5rem; flex-shrink: 0;">
      <div class="title-section" style="text-align: center;">
        <h1 style="color: #10b981; text-transform: uppercase; margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.05em; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Pipeline Kanban</h1>
        <p class="subtitle" style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #94a3b8;">Theo dõi và cập nhật trạng thái hợp đồng</p>
      </div>
    </header>

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
        <div class="elite-filter-row" style="margin-bottom: 12px; display: flex; gap: 12px; width: 100%;">
          <div class="elite-date-group group-date" style="flex: 1; min-width: 0;">
            <label>Tên khách hàng</label>
            <input v-model="filterConfig.customerName" list="customer-list" class="elite-input" placeholder="Tất cả..." style="width: 100%;" />
            <datalist id="customer-list">
              <option v-for="c in uniqueCustomers" :key="c" :value="c"></option>
            </datalist>
          </div>
          <div class="elite-date-group group-date" style="flex: 1; min-width: 0;">
            <label>Tên công ty</label>
            <input v-model="filterConfig.companyName" list="company-list" class="elite-input" placeholder="Tất cả..." style="width: 100%;" />
            <datalist id="company-list">
              <option v-for="c in uniqueCompanies" :key="c" :value="c"></option>
            </datalist>
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
              <input type="number" v-model="filterConfig.yearFrom" :max="filterConfig.yearTo" placeholder="2024" class="elite-input" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date">
              <label>Đến năm</label>
              <input type="number" v-model="filterConfig.yearTo" :min="filterConfig.yearFrom" placeholder="2025" class="elite-input" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Elite Toolbar -->
    <div class="elite-filter-panel" style="margin-bottom: 1rem; padding: 0.75rem 1.5rem; display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.7); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
      <div class="search-container" style="position: relative; width: 350px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" v-model="searchQuery" placeholder="Tìm tên KH, mã hợp đồng..." class="elite-input" style="width: 100%; padding: 0.5rem 1rem 0.5rem 2.5rem; border-radius: 99px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #fff; outline: none; transition: all 0.2s; font-size: 0.85rem;" onfocus="this.style.borderColor='#10b981'; this.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'" />
      </div>

      <div class="header-actions" style="display: flex; gap: 0.75rem;">
        <button class="tech-vip-btn" @click="exportToExcel" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Xuất Excel
        </button>
        <button class="tech-vip-btn" @click="openAddModal" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm mới
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
        <div class="kanban-header" @click="isMobile && (collapsedCols.unassigned = !collapsedCols.unassigned)" :style="{ cursor: isMobile ? 'pointer' : 'default' }">
          <div class="kanban-title">
            <span class="status-dot" style="background: #94a3b8; box-shadow: 0 0 8px rgba(148,163,184,0.5);"></span>
            <h3 style="color: #94a3b8; margin: 0; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Chưa phân loại</h3>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="kanban-badge" v-show="isMobile || !collapsedCols.unassigned">{{ boardData.unassigned?.length || 0 }}</span>
            <svg v-if="isMobile" :style="{ transform: collapsedCols.unassigned ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }" viewBox="0 0 24 24" width="20" height="20" stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
        <draggable v-show="!isMobile || !collapsedCols.unassigned"
          v-model="boardData.unassigned"
          group="pipeline"
          item-key="Id_pipeline"
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
                  @change="(evt) => onNestedChange(evt, element)"
                  class="nested-dropzone"
                  ghost-class="ghost-sub-card"
                  animation="200"
                >
                  <template #item="{ element: child, index }">
                    <div style="position: relative;" :style="{ marginTop: index > 0 ? '24px' : '0' }">
                      <div v-if="index > 0" :style="{ position: 'absolute', left: '50%', top: '-24px', transform: 'translateX(-50%)', width: '2px', height: '24px', background: '#94a3b8' }"></div>
                      <div class="kanban-card vip-card" @click="mergeMode ? toggleMergeSelect(child) : openEditModal(child)" :style="{ cursor: 'pointer', margin: 0, border: mergeSelected.find(i => i.Id_pipeline === child.Id_pipeline) ? '2px solid #3b82f6' : '' }">
                        <div class="tl-shimmer-border"></div>
                        <div :style="{ background: '#475569', color: '#ffffff', padding: '6px 16px', margin: '-16px -16px 12px -16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' }">
                          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {{ child.finish_time || 'No Deadline' }}
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="vip-badge tag-normal" v-if="child.tag" :class="getTagClass(child.tag)">{{ child.tag }}</span>
                            <button v-if="!mergeMode" @click.stop="startMerge(child)" title="Gộp thẻ" style="background: rgba(255,255,255,0.1); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; display: flex; align-items: center; justify-content: center;">🔗</button>
                            <input v-if="mergeMode && mergeTarget?.Id_pipeline !== child.Id_pipeline" type="checkbox" :checked="!!mergeSelected.find(i => i.Id_pipeline === child.Id_pipeline)" @click.stop="toggleMergeSelect(child)" style="cursor: pointer; width: 16px; height: 16px;" />
                            <span v-if="mergeMode && mergeTarget?.Id_pipeline === child.Id_pipeline" style="font-size: 11px; color: #fbbf24; font-weight: 800;">GỐC</span>
                          </div>
                        </div>
                        <div class="vip-card-header" style="flex-direction: column; align-items: flex-start; gap: 8px;" v-if="child.ten_khach_hang || child.ten_cong_ty">
                          <div class="vip-badges" style="display: flex; flex-wrap: wrap; gap: 6px; width: 100%;">
                            <span class="vip-badge" style="background: #ffffff; color: #334155; border: none; padding: 4px 8px; font-size: 11px; font-weight: 800;">{{ [child.ten_cong_ty, child.ten_khach_hang].filter(Boolean).join(' - ') }}</span>
                          </div>
                        </div>
          
                        <div class="vip-content" style="margin-top: 12px;">
                          <h4 class="vip-desc" style="color: #f8fafc; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">{{ child.content_of_contract_po || 'Chưa có nội dung hợp đồng' }}</h4>
                          
                          <div v-if="child.quantity || child.type || child.volume" style="margin-bottom: 8px;">
                            <span class="vip-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                              {{ [child.quantity, child.type, formatNumber(child.volume)].filter(Boolean).join(' - ') }}
                            </span>
                          </div>
          
                          <div v-if="child.ghi_chu_hop_dong" style="color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 4px;">
                            {{ child.ghi_chu_hop_dong }}
                          </div>
                        </div>
          
                        <div class="vip-footer" style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
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

            <div v-else class="kanban-card vip-card" v-show="matchesSearch(element)" @click="mergeMode ? toggleMergeSelect(element) : openEditModal(element)" :style="{ cursor: 'pointer', border: mergeSelected.find(i => i.Id_pipeline === element.Id_pipeline) ? '2px solid #3b82f6' : '' }">
              <div class="tl-shimmer-border"></div>
              <div :style="{ background: '#475569', color: '#ffffff', padding: '6px 16px', margin: '-16px -16px 12px -16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' }">
                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {{ element.finish_time || 'No Deadline' }}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="vip-badge tag-normal" v-if="element.tag" :class="getTagClass(element.tag)">{{ element.tag }}</span>
                  <button v-if="!mergeMode" @click.stop="startMerge(element)" title="Gộp thẻ" style="background: rgba(255,255,255,0.1); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; display: flex; align-items: center; justify-content: center;">🔗</button>
                  <input v-if="mergeMode && mergeTarget?.Id_pipeline !== element.Id_pipeline" type="checkbox" :checked="!!mergeSelected.find(i => i.Id_pipeline === element.Id_pipeline)" @click.stop="toggleMergeSelect(element)" style="cursor: pointer; width: 16px; height: 16px;" />
                  <span v-if="mergeMode && mergeTarget?.Id_pipeline === element.Id_pipeline" style="font-size: 11px; color: #fbbf24; font-weight: 800;">GỐC</span>
                </div>
              </div>
              <div class="vip-card-header" style="flex-direction: column; align-items: flex-start; gap: 8px;" v-if="element.ten_khach_hang || element.ten_cong_ty">
                <div class="vip-badges" style="display: flex; flex-wrap: wrap; gap: 6px; width: 100%;">
                  <span class="vip-badge" style="background: #ffffff; color: #334155; border: none; padding: 4px 8px; font-size: 11px; font-weight: 800;">{{ [element.ten_cong_ty, element.ten_khach_hang].filter(Boolean).join(' - ') }}</span>
                </div>
              </div>

              <div class="vip-content" style="margin-top: 12px;">
                <h4 class="vip-desc" style="color: #f8fafc; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">{{ element.content_of_contract_po || 'Chưa có nội dung hợp đồng' }}</h4>
                
                <div v-if="element.quantity || element.type || element.volume" style="margin-bottom: 8px;">
                  <span class="vip-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                    {{ [element.quantity, element.type, formatNumber(element.volume)].filter(Boolean).join(' - ') }}
                  </span>
                </div>

                <div v-if="element.ghi_chu_hop_dong" style="color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 4px;">
                  {{ element.ghi_chu_hop_dong }}
                </div>
              </div>

              <div class="vip-footer" style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
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
          <div class="kanban-header" @click="isMobile && (collapsedCols[col.id] = !collapsedCols[col.id])" :style="{ cursor: isMobile ? 'pointer' : 'default', background: getColHeaderBg(col.id), ...((!isMobile && collapsedCols[col.id]) ? { flexDirection: 'column', padding: '12px 4px', height: '100%', position: 'relative' } : {}) }">
            <div class="kanban-title" :style="(!isMobile && collapsedCols[col.id]) ? 'flex-direction: column; gap: 12px;' : ''">
              <span class="status-dot" :class="getColColorClass(col.id)" :style="(!isMobile && collapsedCols[col.id]) ? 'margin-right: 0;' : ''"></span>
              <h3 v-if="isMobile || !collapsedCols[col.id]" style="margin: 0; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;" :style="{ color: getColTitleColor(col.id) }">{{ col.label }}</h3>
              <h3 v-else style="margin: 0; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; writing-mode: vertical-rl; transform: rotate(180deg); margin-top: 12px; white-space: nowrap;" :style="{ color: getColTitleColor(col.id) }">{{ col.label }}</h3>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;" :style="(!isMobile && collapsedCols[col.id]) ? 'flex-direction: column; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin-top: 0;' : ''">
              <span class="kanban-badge" v-show="isMobile || !collapsedCols[col.id]">{{ boardData[col.id]?.length || 0 }}</span>
              <button v-if="!isMobile && (col.id === 'that_bai' || col.id === 'hoan_thanh')" @click.stop="collapsedCols[col.id] = !collapsedCols[col.id]" :title="collapsedCols[col.id] ? 'Hiện cột' : 'Thu gọn cột'" :style="{ background: col.id === 'that_bai' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: col.id === 'that_bai' ? '#ef4444' : '#10b981', border: col.id === 'that_bai' ? '1px dashed rgba(239, 68, 68, 0.4)' : '1px dashed rgba(16, 185, 129, 0.4)', borderRadius: '6px', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }" @mouseover="e => e.currentTarget.style.background = col.id === 'that_bai' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'" @mouseout="e => e.currentTarget.style.background = col.id === 'that_bai' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'">
                <svg v-if="collapsedCols[col.id]" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
                <svg v-else viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
              </button>
              <svg v-if="isMobile" :style="{ transform: collapsedCols[col.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }" viewBox="0 0 24 24" width="20" height="20" stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          
          <draggable v-show="!collapsedCols[col.id]"
            v-model="boardData[col.id]"
            group="pipeline"
            item-key="Id_pipeline"
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
                  @change="(evt) => onNestedChange(evt, element)"
                  class="nested-dropzone"
                  ghost-class="ghost-sub-card"
                  animation="200"
                >
                  <template #item="{ element: child, index }">
                    <div style="position: relative;" :style="{ marginTop: index > 0 ? '24px' : '0' }">
                      <div v-if="index > 0" :style="{ position: 'absolute', left: '50%', top: '-24px', transform: 'translateX(-50%)', width: '2px', height: '24px', background: (col.id === 'that_bai' || col.id === 'hoan_thanh') ? '#475569' : getColTitleColor(col.id) }"></div>
                      <div class="kanban-card vip-card" @click="mergeMode ? toggleMergeSelect(child) : openEditModal(child)" :style="{ cursor: 'pointer', margin: 0, border: mergeSelected.find(i => i.Id_pipeline === child.Id_pipeline) ? '2px solid #3b82f6' : ((col.id === 'that_bai' || col.id === 'hoan_thanh') ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${getColTitleColor(col.id)}`) }">
                        <div class="tl-shimmer-border"></div>
                        <div :style="{ background: getColTitleColor(col.id), color: '#ffffff', padding: '6px 16px', margin: '-16px -16px 12px -16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' }">
                          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {{ child.finish_time || 'No Deadline' }}
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="vip-badge tag-normal" v-if="child.tag" :class="getTagClass(child.tag)">{{ child.tag }}</span>
                            <button v-if="!mergeMode" @click.stop="startMerge(child)" title="Gộp thẻ" style="background: rgba(255,255,255,0.2); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; display: flex; align-items: center; justify-content: center;">🔗</button>
                            <input v-if="mergeMode && mergeTarget?.Id_pipeline !== child.Id_pipeline" type="checkbox" :checked="!!mergeSelected.find(i => i.Id_pipeline === child.Id_pipeline)" @click.stop="toggleMergeSelect(child)" style="cursor: pointer; width: 16px; height: 16px;" />
                            <span v-if="mergeMode && mergeTarget?.Id_pipeline === child.Id_pipeline" style="font-size: 11px; color: #fbbf24; font-weight: 800;">GỐC</span>
                          </div>
                        </div>
                        <div class="vip-card-header" style="flex-direction: column; align-items: flex-start; gap: 8px;" v-if="child.ten_khach_hang || child.ten_cong_ty">
                          <div class="vip-badges" style="display: flex; flex-wrap: wrap; gap: 6px; width: 100%;">
                            <span class="vip-badge" :style="{ background: '#ffffff', color: getColDarkColor(col.id), border: 'none', padding: '4px 8px', fontSize: '11px', fontWeight: '800' }">{{ [child.ten_cong_ty, child.ten_khach_hang].filter(Boolean).join(' - ') }}</span>
                          </div>
                        </div>
          
                        <div class="vip-content" style="margin-top: 12px;">
                          <h4 class="vip-desc" style="color: #f8fafc; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">{{ child.content_of_contract_po || 'Chưa có nội dung hợp đồng' }}</h4>
                          
                          <div v-if="child.quantity || child.type || child.volume" style="margin-bottom: 8px;">
                            <span class="vip-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                              {{ [child.quantity, child.type, formatNumber(child.volume)].filter(Boolean).join(' - ') }}
                            </span>
                          </div>
          
                          <div v-if="child.ghi_chu_hop_dong" style="color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 4px;">
                            {{ child.ghi_chu_hop_dong }}
                          </div>
                        </div>
          
                        <div class="vip-footer" style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
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

            <div v-else class="kanban-card vip-card" v-show="matchesSearch(element)" @click="mergeMode ? toggleMergeSelect(element) : openEditModal(element)" :style="{ cursor: 'pointer', border: mergeSelected.find(i => i.Id_pipeline === element.Id_pipeline) ? '2px solid #3b82f6' : ((col.id === 'that_bai' || col.id === 'hoan_thanh') ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${getColTitleColor(col.id)}`) }">
              <div class="tl-shimmer-border"></div>
              <div :style="{ background: getColTitleColor(col.id), color: '#ffffff', padding: '6px 16px', margin: '-16px -16px 12px -16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)' }">
                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {{ element.finish_time || 'No Deadline' }}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="vip-badge tag-normal" v-if="element.tag" :class="getTagClass(element.tag)">{{ element.tag }}</span>
                  <button v-if="!mergeMode" @click.stop="startMerge(element)" title="Gộp thẻ" style="background: rgba(255,255,255,0.2); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; display: flex; align-items: center; justify-content: center;">🔗</button>
                  <input v-if="mergeMode && mergeTarget?.Id_pipeline !== element.Id_pipeline" type="checkbox" :checked="!!mergeSelected.find(i => i.Id_pipeline === element.Id_pipeline)" @click.stop="toggleMergeSelect(element)" style="cursor: pointer; width: 16px; height: 16px;" />
                  <span v-if="mergeMode && mergeTarget?.Id_pipeline === element.Id_pipeline" style="font-size: 11px; color: #fbbf24; font-weight: 800;">GỐC</span>
                </div>
              </div>
              <div class="vip-card-header" style="flex-direction: column; align-items: flex-start; gap: 8px;" v-if="element.ten_khach_hang || element.ten_cong_ty">
                <div class="vip-badges" style="display: flex; flex-wrap: wrap; gap: 6px; width: 100%;">
                  <span class="vip-badge" :style="{ background: '#ffffff', color: getColDarkColor(col.id), border: 'none', padding: '4px 8px', fontSize: '11px', fontWeight: '800' }">{{ [element.ten_cong_ty, element.ten_khach_hang].filter(Boolean).join(' - ') }}</span>
                </div>
              </div>

              <div class="vip-content" style="margin-top: 12px;">
                <h4 class="vip-desc" style="color: #f8fafc; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">{{ element.content_of_contract_po || 'Chưa có nội dung hợp đồng' }}</h4>
                
                <div v-if="element.quantity || element.type || element.volume" style="margin-bottom: 8px;">
                  <span class="vip-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                    {{ [element.quantity, element.type, formatNumber(element.volume)].filter(Boolean).join(' - ') }}
                  </span>
                </div>

                <div v-if="element.ghi_chu_hop_dong" style="color: #ef4444; font-size: 12px; font-weight: 700; margin-bottom: 4px;">
                  {{ element.ghi_chu_hop_dong }}
                </div>
              </div>

              <div class="vip-footer" style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
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
                  <option v-for="col in COLUMNS" :key="col.id" :value="col.value">{{ col.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Finish Time (Dự kiến trong khoảng)</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="date" v-model="tempStartDate" @change="updateFinishTime" class="input-field" style="color: #fff; background: rgba(0,0,0,0.2); flex: 1;" />
                  <span style="color: #94a3b8;">-</span>
                  <input type="date" v-model="tempEndDate" @change="updateFinishTime" class="input-field" style="color: #fff; background: rgba(0,0,0,0.2); flex: 1;" />
                </div>
              </div>
              <div class="form-group">
                <label>Tên khách hàng</label>
                <input v-model="formData.ten_khach_hang" type="text" class="input-field" />
              </div>
              <div class="form-group">
                <label>Tên công ty</label>
                <input v-model="formData.ten_cong_ty" type="text" class="input-field" />
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
                <input v-model="formData.content_of_contract_po" type="text" class="input-field" />
              </div>
              <div class="form-group">
                <label>Volume</label>
                <NumberInput v-model="formData.volume" class="input-field" />
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
                <label>Report ID</label>
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
                <div v-if="showReportDropdown" class="modal-overlay" @click.stop="showReportDropdown = false" style="z-index: 10005;">
                  <div class="custom-alert-modal" style="background: #0f172a; padding: 24px; border-radius: 12px; max-width: 600px; width: 100%; border: 1px solid rgba(255,255,255,0.1); max-height: 80vh; display: flex; flex-direction: column;" @click.stop>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                      <h3 style="color: #f8fafc; font-size: 18px; margin: 0; font-weight: 700;">Chọn Report liên kết</h3>
                      <button @click="showReportDropdown = false" style="background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; line-height: 1; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">&times;</button>
                    </div>
                    
                    <div style="overflow-y: auto; flex: 1; padding-right: 8px;">
                      <div class="custom-option" @click.stop="selectReport('')" style="margin-bottom: 8px; border-radius: 6px;">
                        <span style="color: #94a3b8;">-- Bỏ chọn tất cả --</span>
                      </div>
                      <div class="custom-option" v-for="rep in reports" :key="rep.id" 
                           :class="{ 'is-selected': selectedReportIds.includes(rep.id) }"
                           @click.stop="selectReport(rep.id)" style="border-radius: 6px; margin-bottom: 4px;">
                        <div class="report-main">
                          <svg v-if="selectedReportIds.includes(rep.id)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle; flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          {{ rep.noi_dung || 'Không có nội dung' }}
                        </div>
                        <div class="report-sub" v-if="rep.ghi_chu" :style="{ marginLeft: selectedReportIds.includes(rep.id) ? '18px' : '0' }">{{ rep.ghi_chu }}</div>
                      </div>
                    </div>
                    
                    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                      <button type="button" class="btn btn-primary" @click="showReportDropdown = false" style="padding: 8px 16px; border-radius: 6px; border: none; background: #3b82f6; color: #fff; cursor: pointer; font-weight: 600;">Xong</button>
                    </div>
                  </div>
                </div>
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
          <div></div>
          
          <!-- Giữa: 4 Nút chức năng -->
          <div class="modal-actions-center" style="display: flex; gap: 12px; justify-content: center;" v-if="isEditing">
            <button class="vip-btn primary" @click="duplicateItem(items.find(i => i.Id_pipeline === formData.Id_pipeline) || formData)" title="Nhân bản" style="width: auto; padding: 6px 12px; gap: 6px; font-size: 13px; font-weight: 600;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Nhân bản
            </button>
            <button class="vip-btn danger" @click="requestAction(items.find(i => i.Id_pipeline === formData.Id_pipeline) || formData, 'fail')" title="Thất bại" style="width: auto; padding: 6px 12px; gap: 6px; font-size: 13px; font-weight: 600;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              Thất bại
            </button>
            <button class="vip-btn success" @click="requestAction(items.find(i => i.Id_pipeline === formData.Id_pipeline) || formData, 'complete')" title="Hoàn thành" style="width: auto; padding: 6px 12px; gap: 6px; font-size: 13px; font-weight: 600;">
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
  <Teleport to="body">
    <div v-if="isDragging && hoverColName" class="drag-cursor-tooltip" :style="{ left: mouseX + 'px', top: mouseY + 'px' }">
      Thả vào: {{ hoverColName }}
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import draggable from 'vuedraggable'
import NumberInput from './NumberInput.vue'
import ExcelJS from 'exceljs'

const formatNumber = (val) => {
  if (val == null || val === '') return '';
  const raw = String(val).replace(/,/g, '');
  if (!isNaN(raw) && raw !== '') {
    return new Intl.NumberFormat('en-US').format(Number(raw));
  }
  return val;
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

// Configuration of columns
const COLUMNS = [
  { id: 'nhap', label: 'TẠM', value: 'TẠM', percent: '0%' },
  { id: 'col_30', label: '30%: Pipeline', value: 'Pipeline (khảo sát nhu cầu khách hàng)', percent: '30%' },
  { id: 'col_50', label: '50%: Forecast', value: 'Forecast (đã lên báo giá gởi khách hàng)', percent: '50%' },
  { id: 'col_70', label: '70%: Commit', value: 'Commit (EU đồng ý giải pháp, chờ ngân sách đầu tư)', percent: '70%' },
  { id: 'col_90', label: '90%: Closed Won', value: 'Closed Won (đã ký xác nhận đặt hàng)', percent: '90%' },
  { id: 'that_bai', label: 'THẤT BẠI', value: 'THẤT BẠI', percent: '0%' },
  { id: 'hoan_thanh', label: 'THÀNH CÔNG', value: 'THÀNH CÔNG', percent: '100%' }
]

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const uploadingFiles = ref(false)
const backgroundSyncing = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
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
  customerName: '',
  companyName: ''
})

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
    customerName: '',
    companyName: ''
  }
}

const exportToExcel = async () => {
  const filtered = items.value.filter(matchesSearch);
  
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
    const worksheet = workbook.addWorksheet('Pipeline 2024');
    
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
      [' PIPELINE 2024'], 
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
    worksheet.mergeCells('A4:J4');
    const titleCell = worksheet.getCell('A4');
    titleCell.value = 'PIPELINE 2024';
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
        const colMatch = COLUMNS.find(c => c.value === item.status_name);
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

const uniqueCustomers = computed(() => {
  const names = items.value.map(i => i.ten_khach_hang).filter(Boolean);
  return [...new Set(names)].sort();
});

const uniqueCompanies = computed(() => {
  const names = items.value.map(i => i.ten_cong_ty).filter(Boolean);
  return [...new Set(names)].sort();
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
    COLUMNS.forEach(c => {
      collapsedCols.value[c.id] = true
    })
    collapsedCols.value.unassigned = true
    collapsedCols.value.tam = false // keep the first one open
  } else if (!isMobile.value && wasMobile) {
    COLUMNS.forEach(c => {
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

const boardData = ref({
  unassigned: [],
  nhap: [],
  col_30: [],
  col_50: [],
  col_70: [],
  col_90: [],
  that_bai: [],
  hoan_thanh: []
})

const defaultFormData = {
  Id_pipeline: '', report_id: '', ma_hop_dong: '', ma_khach_hang: '', ten_khach_hang: '',
  ma_cong_ty: '', ten_cong_ty: '', AM: 'Sơn', tag: 'Bình thường', '%status': '0%', status_name: 'TẠM',
  isSuccess: '', type: '', ghi_chu_hop_dong: '', created_time: '', finish_time: '',
  content_of_contract_po: '', quantity: '', volume: '', ten_file: '', link_file: ''
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

  if (filterConfig.value.customerName && item.ten_khach_hang !== filterConfig.value.customerName) {
    return false;
  }
  
  if (filterConfig.value.companyName && item.ten_cong_ty !== filterConfig.value.companyName) {
    return false;
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
    const colConfig = COLUMNS.find(c => c.value === item.status_name) || COLUMNS.find(c => c.percent === item['%status'])
    if (colConfig) {
      boardData.value[colConfig.id].push(item)
    } else {
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

const getColTitleColor = (colId) => {
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
  if (colId === 'col_30') return 'rgba(239, 68, 68, 0.15)' // Red
  if (colId === 'col_50') return 'rgba(249, 115, 22, 0.15)' // Orange
  if (colId === 'col_70') return 'rgba(234, 179, 8, 0.15)' // Yellow
  if (colId === 'col_90') return 'rgba(34, 197, 94, 0.15)' // Green
  return 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)' // Default
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetch(`${SCRIPT_URL}?sheet=pipeline&action=get`)
    const result = await res.json()
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
  const allCols = [...COLUMNS.map(c => c.id), 'unassigned']
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
    const colConfig = COLUMNS.find(c => c.id === colId) || { value: '', percent: '' }
    
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
  const colConfig = COLUMNS.find(c => c.value === formData.value.status_name)
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
  const parseDate = (dStr) => {
    if (!dStr) return ''
    const [d, m, y] = dStr.split('/')
    if (d && m && y) return `${y}-${m}-${d}`
    return ''
  }
  tempStartDate.value = parseDate(parts[0]) || ''
  tempEndDate.value = parseDate(parts[1]) || ''
}

const updateFinishTime = () => {
  const formatOut = (dStr) => {
    if (!dStr) return ''
    const [y, m, d] = dStr.split('-')
    return `${d}/${m}/${y}`
  }
  const start = formatOut(tempStartDate.value)
  const end = formatOut(tempEndDate.value)
  
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
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

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
  margin-top: 4px;
  padding-top: 8px;
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
  .kanban-wrapper {
    flex-direction: column !important;
  }
  .kanban-board {
    flex-direction: column !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
  .kanban-column {
    min-width: 100% !important;
    width: 100% !important;
    margin-bottom: 12px;
    height: auto !important;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .large-modal {
    width: 100% !important;
    max-width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
  .modal-body {
    padding: 16px !important;
  }
  .form-grid .input-field, .form-grid .custom-select-container {
    max-width: 100% !important;
  }
}
</style>
