<template>
  <div class="compare-node">
    <!-- C. Pass-through line to next sibling (only if child AND not last) -->
    <div class="line-pass-through" v-if="isChild && !isLast"></div>

    <div class="compare-row">
      <!-- ═══ CỘT TRÁI: CÂY PHÂN CẤP + CARD FILE (GIỮ NGUYÊN NHƯ CŨ) ═══ -->
      <div class="node-content compare-left-card">
        <!-- A. Bridge from above down to dot center (only if child) -->
        <div class="line-bridge" v-if="isChild"></div>

        <!-- B. Horizontal connector to dot (only if child) -->
        <div class="line-horizontal" v-if="isChild"></div>

        <!-- D. Parent line to own children (only if has children) -->
        <div class="line-to-children" v-if="node.children && node.children.length > 0"></div>

        <div class="node-dot">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>

        <!-- CONTENT CARD -->
        <div class="node-card tl-rect-card tl-rect--green"
             :class="{
               'is-highlighted': node.id == highlightedId,
               'is-json-selected-card': jsonSelectionOrder > 0,
               'is-dragover-append': dragOverType === 'append',
               'is-dragover-insert': dragOverType === 'insert'
             }"
             :id="'tl-compare-node-' + node.id"
             @click="$emit('edit', node)"
             draggable="true"
             @dragstart="onDragStart($event, node)"
             @dragover.prevent="onDragOver($event)"
             @dragleave="onDragLeave"
             @drop="onDrop($event, node)">
          <div class="tl-shimmer tl-shimmer--green"></div>
          <div class="tl-rect-border tl-border--green"></div>

          <div class="tl-rect-header" style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; gap: 6px;">
            <div class="tl-rect-tags">
              <button type="button"
                      class="compare-pick-btn json-card-pick-btn"
                      :class="{ 'picked-compare': jsonSelectionOrder > 0 }"
                      @click.stop="$emit('toggle-select-json-card', node.id)"
                      :title="jsonSelectionOrder > 0 ? 'Nhấn để bỏ chọn card này khỏi danh sách tải JSON' : 'Nhấn để chọn card này tải JSON'">
                <span v-if="jsonSelectionOrder > 0">Bỏ chọn JSON (#{{ String(jsonSelectionOrder).padStart(2, '0') }})</span>
                <span v-else>+ Chọn tải JSON</span>
              </button>
              <span class="tl-status-chip is-green" style="background: rgba(148,163,184,0.1); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2);">
                {{ formatTime(node.createdTime) }}
              </span>
              <span v-if="node.mucDoUuTien" class="tl-status-chip" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);">
                {{ node.mucDoUuTien }}
              </span>
              <span v-if="node.trangThaiXuLy" class="tl-status-chip" :class="getStatusClass(node.trangThaiXuLy)">
                {{ node.trangThaiXuLy }}
              </span>
              <span v-if="node.trangThaiBaoGia" class="tl-status-chip" :class="getQuoteClass(node.trangThaiBaoGia)">
                {{ node.trangThaiBaoGia }}
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end;">
              <button v-if="cardChainInfo && cardChainInfo.totalCards > 1"
                      type="button"
                      @click.stop="$emit('export-chain-json', { node, customer })"
                      :title="'Tải JSON toàn bộ chuỗi liên kết này (' + cardChainInfo.totalCards + ' card)'"
                      class="btn-chain-json-mini">
                <span>🔗 Tải chuỗi ({{ cardChainInfo.totalCards }})</span>
              </button>
              <button type="button"
                      @click.stop="$emit('export-card-json', { node, customer })"
                      title="Xuất file JSON (Tài chính & Hàng hóa) của riêng card này"
                      class="btn-card-json-mini">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>JSON</span>
              </button>
              <button @click.stop="$emit('delete', node.id)" title="Xóa card" style="background: #ef4444; color: #ffffff; border: none; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; opacity: 0.9; box-shadow: 0 2px 4px rgba(239,68,68,0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="tl-rect-body" style="margin-top: 0.5rem; padding-top: 0.7rem; border-top: 1px dashed rgba(255,255,255,0.08);">
            <div class="tl-body-text">{{ node.noiDung }}</div>
            <div v-if="node.ghiChu && node.ghiChu.trim()" style="margin-top: 0.35rem; font-size: 0.82rem; font-weight: 600; font-style: italic; color: #ef4444;">
              * Ghi chú: {{ node.ghiChu }}
            </div>
          </div>

          <!-- ĐÍNH KÈM TRÊN CARD CHÍNH: List ra tất cả các file + ảnh của hồ sơ -->
          <div v-if="allCardFiles.length > 0 || allCardImages.length > 0" class="tl-attachments" style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.6rem;">
            <!-- Header vùng đính kèm + Nút Download All ZIP -->
            <div class="tl-attachments-toolbar" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.3rem; border-bottom: 1px dashed rgba(255,255,255,0.08); margin-bottom: 0.15rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; display: inline-flex; align-items: center; gap: 4px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                Tệp &amp; Ảnh ({{ allCardFiles.length + allCardImages.length }})
              </span>
              <button type="button"
                      @click.stop.prevent="handleDownloadAllZip"
                      :disabled="isDownloadingZip"
                      class="btn-dl-all-zip"
                      :title="'Tải về toàn bộ ' + (allCardFiles.length + allCardImages.length) + ' file & ảnh (.zip)'">
                <template v-if="isDownloadingZip">
                  <span class="zip-mini-spinner"></span>
                  <span>{{ zipProgressText || 'Đang nén...' }}</span>
                </template>
                <template v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>Download all</span>
                </template>
              </button>
            </div>

            <!-- Tài liệu -->
            <div v-if="allCardFiles.length > 0" style="display: flex; flex-direction: column; gap: 0.35rem;">
              <div v-for="(fileObj, i) in allCardFiles" :key="'acf-' + i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem;">
                <a :href="typeof fileObj === 'string' ? fileObj : fileObj.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(fileObj)" style="flex: 1; min-width: 0;" :title="getFileName(fileObj, 'File', i)">
                  <span v-html="getFileIconSvg(fileObj)" style="display: flex; align-items: center;"></span>
                  <span class="attach-text">{{ truncateFileName(getFileName(fileObj, 'File đính kèm', i)) }}</span>
                </a>
                <a :href="getOfficeViewUrl(fileObj)" target="_blank" @click.stop title="Xem file (Office Online)" class="view-mini-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </a>
                <button @click.stop.prevent="handleDownloadClick($event, typeof fileObj === 'string' ? fileObj : fileObj.url, getFileName(fileObj, 'File đính kèm', i))" title="Tải về" class="dl-mini-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
              </div>
            </div>

            <!-- Hình ảnh -->
            <div v-if="allCardImages.length > 0" style="display: flex; flex-direction: column; gap: 0.35rem;">
              <div v-for="(fileObj, i) in allCardImages" :key="'aci-' + i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem;">
                <a :href="typeof fileObj === 'string' ? fileObj : fileObj.url" target="_blank" @click.stop class="attach-badge badge-image" style="flex: 1; min-width: 0;" :title="getFileName(fileObj, 'Hình ảnh', i)">
                  <img :src="typeof fileObj === 'string' ? fileObj : fileObj.url" style="width: 20px; height: 20px; object-fit: cover; border-radius: 4px; flex-shrink: 0; background: rgba(0,0,0,0.2);" />
                  <span class="attach-text">{{ truncateFileName(getFileName(fileObj, 'Hình ảnh', i)) }}</span>
                </a>
                <a :href="getOfficeViewUrl(fileObj)" target="_blank" @click.stop title="Xem file (Office Online)" class="view-mini-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </a>
                <button @click.stop.prevent="handleDownloadClick($event, typeof fileObj === 'string' ? fileObj : fileObj.url, getFileName(fileObj, 'Hình ảnh', i))" title="Tải về" class="dl-mini-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ CONNECTOR GIỮA CARD & BỘ CHỈ SỐ (GIỮ NGUYÊN NHƯ CŨ) ═══ -->
      <div class="compare-bridge-connector">
        <div class="compare-bridge-line"></div>
      </div>

      <!-- ═══ CỘT PHẢI: FULL BỘ CHỈ SỐ TÀI CHÍNH SALE REPORT (DESIGN TASTE) ═══ -->
      <div class="compare-right-metrics">
        <!-- Trường hợp chưa có Sale Report nào -->
        <div v-if="nodeReports.length === 0" class="metrics-empty-box">
          <div class="metrics-empty-info">
            <span class="empty-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </span>
            <span>Hồ sơ này chưa khởi tạo dữ liệu chỉ số Sale Report</span>
          </div>
          <div style="display: flex; align-items: center; gap: 7px; flex-wrap: wrap;">
            <button type="button"
                    class="compare-pick-btn json-card-pick-btn"
                    :class="{ 'picked-compare': jsonSelectionOrder > 0 }"
                    @click.stop="$emit('toggle-select-json-card', node.id)"
                    :title="jsonSelectionOrder > 0 ? 'Nhấn để bỏ chọn card này khỏi danh sách tải JSON' : 'Nhấn để chọn card này tải JSON'">
              <span v-if="jsonSelectionOrder > 0">Bỏ chọn JSON (#{{ String(jsonSelectionOrder).padStart(2, '0') }})</span>
              <span v-else>+ Chọn tải JSON</span>
            </button>
            <button v-if="cardChainInfo && cardChainInfo.totalCards > 1"
                    type="button"
                    @click.stop="$emit('export-chain-json', { node, customer })"
                    class="export-sr-chain-json-btn"
                    :title="'Tải file JSON cho toàn bộ chuỗi liên kết này (' + cardChainInfo.totalCards + ' card)'">
              🔗 Tải JSON Chuỗi ({{ cardChainInfo.totalCards }})
            </button>
            <button type="button" @click.stop="$emit('export-card-json', { node, customer })" class="export-sr-json-btn" title="Tải file JSON dữ liệu tài chính & hàng hóa của riêng card này">
              <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Tải JSON
            </button>
            <button type="button" @click.stop="$emit('open-sale-report', node)" class="open-sr-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Khởi tạo Sale Report
            </button>
          </div>
        </div>

        <!-- Trường hợp đã có >= 1 Sale Report -->
        <div v-else class="metrics-panel-wrapper">
          <!-- Header thanh công cụ của bộ chỉ số -->
          <div class="metrics-panel-header">
            <div class="metrics-header-left">
              <span class="sr-count-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                {{ nodeReports.length }} phiên bản
              </span>
              <span v-if="closedCount > 0" class="sr-closed-badge">
                Đã chốt {{ closedCount }}/{{ nodeReports.length }}
              </span>
              <span v-else class="sr-draft-badge">
                Bản nháp
              </span>
              <span v-if="totalCardGoodsCount > 0" class="sr-goods-badge" :title="'Có ' + totalCardGoodsCount + ' mặt hàng trong bảng hàng hóa'">
                📦 {{ totalCardGoodsCount }} mặt hàng
              </span>

              <!-- Nút chuyển Phân tách / Gộp ngay trên từng card có nhiều Sale Report -->
              <div v-if="nodeReports.length > 1" class="local-mode-switch">
                <button type="button"
                        :class="{ active: effectiveMode === 'split' }"
                        @click.stop="localModeOverride = 'split'">
                  Phân tách ({{ nodeReports.length }})
                </button>
                <button type="button"
                        :class="{ active: effectiveMode === 'merged' }"
                        @click.stop="localModeOverride = 'merged'">
                  Xem gộp
                </button>
              </div>

              <!-- Nút chuyển Xem cụ thể / Xem tổng quan (bên phải nút phân tách/xem gộp) -->
              <div class="local-mode-switch view-density-switch">
                <button type="button"
                        :class="{ active: effectiveDensity === 'detailed' }"
                        @click.stop="toggleDensity('detailed')"
                        title="Xem cụ thể: 4 ô chỉ số chi tiết">
                  Xem cụ thể
                </button>
                <button type="button"
                        :class="{ active: effectiveDensity === 'overview' }"
                        @click.stop="toggleDensity('overview')"
                        title="Xem tổng quan: Các chỉ số nằm ngang trên 1 hàng">
                  Xem tổng quan
                </button>
              </div>

              <!-- Nút chọn nhanh tất cả các bản của card này để so sánh % tăng giảm -->
              <button v-if="nodeReports.length > 1"
                      type="button"
                      class="quick-compare-card-btn"
                      :class="{ active: areAllNodeReportsSelected }"
                      @click.stop="onToggleAllNodeReports"
                      title="Chọn tất cả phiên bản Sale Report của hồ sơ này để đối chiếu chênh lệch %">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                {{ areAllNodeReportsSelected ? 'Bỏ chọn ' + nodeReports.length + ' bản' : 'Đối chiếu ' + nodeReports.length + ' bản' }}
              </button>
            </div>

            <div style="display: flex; align-items: center; gap: 7px; flex-wrap: wrap;">
              <button type="button"
                      class="compare-pick-btn json-card-pick-btn"
                      :class="{ 'picked-compare': jsonSelectionOrder > 0 }"
                      @click.stop="$emit('toggle-select-json-card', node.id)"
                      :title="jsonSelectionOrder > 0 ? 'Nhấn để bỏ chọn card này khỏi danh sách tải JSON' : 'Nhấn để chọn card này tải JSON'">
                <span v-if="jsonSelectionOrder > 0">Bỏ chọn JSON (#{{ String(jsonSelectionOrder).padStart(2, '0') }})</span>
                <span v-else>+ Chọn tải JSON</span>
              </button>
              <button v-if="cardChainInfo && cardChainInfo.totalCards > 1"
                      type="button"
                      @click.stop="$emit('export-chain-json', { node, customer })"
                      class="export-sr-chain-json-btn"
                      :title="'Tải file JSON toàn bộ chuỗi liên kết của card này (' + cardChainInfo.totalCards + ' card)'">
                🔗 Tải JSON Chuỗi ({{ cardChainInfo.totalCards }})
              </button>
              <button type="button"
                      @click.stop="$emit('export-card-json', { node, customer })"
                      class="export-sr-json-btn"
                      title="Tải file JSON dữ liệu tài chính & hàng hóa của riêng card này">
                <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Tải JSON
              </button>
              <button type="button" @click.stop="$emit('open-sale-report', node)" class="open-sr-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Mở / Chỉnh sửa ({{ nodeReports.length }})
              </button>
            </div>
          </div>

          <!-- CHẾ ĐỘ 1: XEM CỤ THỂ (DẠNG 4 CỘT CHI TIẾT) -->
          <template v-if="effectiveDensity === 'detailed'">
            <!-- Xem Gộp -->
            <div v-if="effectiveMode === 'merged'"
                 class="metrics-single-block"
                 :class="{ 'is-selected-compare': getSelectionOrder(mergedSelectionKey) > 0 }">
              <div v-if="nodeReports.length > 1" class="sub-report-bar merged-bar">
                <div class="sub-report-meta">
                  <span class="merged-tag">TỔNG HỢP ({{ nodeReports.length }} BÁO CÁO)</span>
                  <strong class="sub-po-code">{{ mergedReport.poSummary }}</strong>
                  <span v-if="mergedReport.productSummary" class="sub-meta-item">NCC: {{ mergedReport.productSummary }}</span>
                </div>
                <div class="sub-report-actions">
                  <button type="button"
                          class="compare-pick-btn"
                          :class="[getPickBtnClass(mergedSelectionKey), { 'picked-compare': getSelectionOrder(mergedSelectionKey) > 0 }]"
                          @click.stop="onToggleSelectKey(mergedSelectionKey)"
                          :title="getSelectionOrder(mergedSelectionKey) > 0 ? 'Nhấn để bỏ chọn đối chiếu bản ghi này' : 'Nhấn để chọn đối chiếu số liệu'">
                    <span v-if="getSelectionOrder(mergedSelectionKey) > 0">Bỏ chọn (#{{ String(getSelectionOrder(mergedSelectionKey)).padStart(2, '0') }})</span>
                    <span v-else>+ Chọn đối chiếu</span>
                  </button>
                </div>
              </div>
              <div v-else class="sub-report-bar">
                <div class="sub-report-meta">
                  <span class="split-index-badge">#01</span>
                  <span class="sub-po-code">{{ nodeReports[0].soPO ? ('PO ' + nodeReports[0].soPO) : 'Báo cáo #01' }}</span>
                  <span v-if="nodeReports[0].soHD" class="sub-hd-code">{{ nodeReports[0].soHD }}</span>
                  <span v-if="nodeReports[0].productType" class="sub-meta-item">NCC: {{ nodeReports[0].productType }}</span>
                  <span v-if="nodeReports[0].am" class="sub-meta-item">AM: {{ nodeReports[0].am }}</span>
                </div>
                <div class="sub-report-actions">
                  <button type="button"
                          class="compare-pick-btn"
                          :class="[getPickBtnClass(mergedSelectionKey), { 'picked-compare': getSelectionOrder(mergedSelectionKey) > 0 }]"
                          @click.stop="onToggleSelectKey(mergedSelectionKey)"
                          :title="getSelectionOrder(mergedSelectionKey) > 0 ? 'Nhấn để bỏ chọn đối chiếu bản ghi này' : 'Nhấn để chọn đối chiếu số liệu'">
                    <span v-if="getSelectionOrder(mergedSelectionKey) > 0">Bỏ chọn (#{{ String(getSelectionOrder(mergedSelectionKey)).padStart(2, '0') }})</span>
                    <span v-else>+ Chọn đối chiếu</span>
                  </button>
                  <button type="button"
                          class="open-tab-mini-btn"
                          @click.stop="$emit('open-sale-report', { file: node, tabIndex: 0 })"
                          title="Mở xem Sale Report này">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    Xem
                  </button>
                  <span v-if="nodeReports[0].chotDeal" class="mini-pill closed">Đã chốt</span>
                  <span v-else class="mini-pill draft">Nháp</span>
                </div>
              </div>

              <!-- Grid 4 ô chỉ số tài chính (Cụ thể) -->
              <div class="compare-finance-grid">
                <!-- Ô 1: Tệp báo cáo tổng hợp -->
                <div class="compare-fin-col compare-files-col">
                  <div class="fin-col-caption" style="display: flex; align-items: center; justify-content: space-between;">
                    <span>Tệp báo cáo</span>
                    <span v-if="mergedReportFiles.length || mergedReportImages.length" class="fin-caption-badge">
                      {{ mergedReportFiles.length + mergedReportImages.length }} tệp
                    </span>
                  </div>

                  <div v-if="mergedReportFiles.length || mergedReportImages.length" class="compare-files-list">
                    <div v-for="(fObj, fi) in mergedReportFiles" :key="'mrf-' + fi" class="report-file-item">
                      <a :href="fObj.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(fObj)" style="flex: 1; min-width: 0;" :title="fObj.name">
                        <span class="file-role-tag" :class="fObj.role?.includes('Mua') ? 'role-mh' : 'role-bg'">{{ fObj.role }}</span>
                        <span v-html="getFileIconSvg(fObj)" style="display: flex; align-items: center; flex-shrink: 0;"></span>
                        <span class="attach-text">{{ truncateFileName(fObj.name) }}</span>
                      </a>
                      <a :href="getOfficeViewUrl(fObj.url)" target="_blank" @click.stop title="Xem file (Office Online)" class="view-mini-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </a>
                      <button type="button" @click.stop.prevent="handleDownloadClick($event, fObj.url, fObj.name)" title="Tải về" class="dl-mini-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>

                    <div v-for="(imgObj, ii) in mergedReportImages" :key="'mri-' + ii" class="report-file-item">
                      <a :href="imgObj.url" target="_blank" @click.stop class="attach-badge badge-image" style="flex: 1; min-width: 0;" :title="imgObj.name">
                        <span class="file-role-tag role-img">{{ imgObj.role || 'Chứng từ' }}</span>
                        <img :src="imgObj.url" style="width: 18px; height: 18px; object-fit: cover; border-radius: 3px; flex-shrink: 0; background: rgba(0,0,0,0.2);" />
                        <span class="attach-text">{{ truncateFileName(imgObj.name) }}</span>
                      </a>
                      <a :href="getOfficeViewUrl(imgObj.url)" target="_blank" @click.stop title="Xem file (Office Online)" class="view-mini-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </a>
                      <button type="button" @click.stop.prevent="handleDownloadClick($event, imgObj.url, imgObj.name)" title="Tải về" class="dl-mini-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </div>
                  <div v-else class="split-files-empty" style="font-size: 11px; color: #64748b; font-style: italic; padding: 6px 0;">
                    Chưa có tệp đính kèm
                  </div>
                </div>

                <!-- Ô 2: DSB, Giá mua, Tổng CP -->
                <div class="compare-fin-col">
                  <div class="fin-col-caption">Cơ cấu doanh thu &amp; chi phí</div>
                  <div class="fin-metric-row">
                    <span class="fin-label">Doanh số bán</span>
                    <div class="fin-val-group">
                      <strong class="fin-val text-white">{{ fmtMoney(activeSingleOrMerged.doanhSoBan) }}</strong>
                    </div>
                  </div>
                  <div class="fin-metric-row">
                    <span class="fin-label">Giá mua</span>
                    <div class="fin-val-group">
                      <strong class="fin-val text-slate">{{ fmtMoney(activeSingleOrMerged.giaMua) }}</strong>
                    </div>
                  </div>
                  <div class="fin-metric-row">
                    <span class="fin-label">Tổng CP đơn hàng</span>
                    <div class="fin-val-group">
                      <strong class="fin-val text-amber">{{ fmtMoney(activeSingleOrMerged.tongCP) }}</strong>
                    </div>
                  </div>
                </div>

                <!-- Cột 2: Net COM, Gross com, Thuế, Net PO, Net Margin -->
                <div class="compare-fin-col">
                  <div class="fin-col-caption">Chiết khấu &amp; Lợi nhuận ròng</div>
                  <div class="fin-metric-row highlight-green-row">
                    <span class="fin-label">Net COM</span>
                    <div class="fin-val-group">
                      <strong class="fin-val text-emerald">{{ fmtMoney(activeSingleOrMerged.netCom) }}</strong>
                    </div>
                  </div>
                  <div class="fin-metric-row">
                    <span class="fin-label">Gross com</span>
                    <div class="fin-val-group">
                      <strong class="fin-val text-white">{{ fmtMoney(activeSingleOrMerged.grossCom) }}</strong>
                    </div>
                  </div>
                  <div class="fin-metric-row">
                    <span class="fin-label">Thuế ({{ activeSingleOrMerged.taxPct }}%)</span>
                    <div class="fin-val-group">
                      <strong class="fin-val text-slate">{{ fmtMoney(activeSingleOrMerged.thue) }}</strong>
                    </div>
                  </div>
                  <div class="fin-metric-row">
                    <span class="fin-label">Net PO</span>
                    <div class="fin-val-group">
                      <strong class="fin-val text-white">{{ fmtMoney(activeSingleOrMerged.netPO) }}</strong>
                    </div>
                  </div>
                  <div class="fin-metric-row net-margin-row">
                    <span class="fin-label">Net Margin</span>
                    <div class="fin-val-group">
                      <strong class="fin-val" :class="activeSingleOrMerged.netMargin >= 0 ? 'text-green' : 'text-red'">
                        {{ fmtMoney(activeSingleOrMerged.netMargin) }}
                      </strong>
                    </div>
                  </div>
                </div>

                <!-- Cột 3: Tỷ suất % -->
                <div class="compare-fin-col highlight-ratio-col">
                  <div class="fin-col-caption">Biên tỷ suất tài chính (%)</div>
                  <div class="fin-metric-row">
                    <span class="fin-label">Net COM / Net PO</span>
                    <div class="fin-val-group">
                      <strong class="fin-val text-green">{{ fmtPct(activeSingleOrMerged.netComOverNetPO) }}</strong>
                    </div>
                  </div>
                  <div class="fin-metric-row">
                    <span class="fin-label">Net Margin / Net PO</span>
                    <div class="fin-val-group">
                      <strong class="fin-val" :class="activeSingleOrMerged.netMarginOverNetPO >= 0 ? 'text-green' : 'text-red'">
                        {{ fmtPct(activeSingleOrMerged.netMarginOverNetPO) }}
                      </strong>
                    </div>
                  </div>
                  <div class="fin-metric-row ratio-divider">
                    <span class="fin-label">Net COM / DSB</span>
                    <div class="fin-val-group">
                      <strong class="fin-val text-green">{{ fmtPct(activeSingleOrMerged.netComOverDSB) }}</strong>
                    </div>
                  </div>
                  <div class="fin-metric-row">
                    <span class="fin-label">Net Margin / DSB</span>
                    <div class="fin-val-group">
                      <strong class="fin-val" :class="activeSingleOrMerged.netMarginOverDSB >= 0 ? 'text-green' : 'text-red'">
                        {{ fmtPct(activeSingleOrMerged.netMarginOverDSB) }}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Xem Phân Tách -->
            <div v-else class="metrics-split-list">
              <div v-for="(rep, rIdx) in nodeReports"
                   :key="rep.key || rIdx"
                   class="metrics-single-block split-item"
                   :class="{
                     'is-selected-compare': getSelectionOrder(getSplitSelectionKey(rep, rIdx)) > 0
                   }">
                <div class="sub-report-bar">
                  <div class="sub-report-meta">
                    <span class="split-index-badge">#{{ String(rIdx + 1).padStart(2, '0') }}</span>
                    <span class="sub-po-code">{{ rep.soPO ? ('PO ' + rep.soPO) : ('Báo cáo #' + (rIdx + 1)) }}</span>
                    <span v-if="rep.soHD" class="sub-hd-code">{{ rep.soHD }}</span>
                    <span v-if="rep.content" class="sub-content-snippet">{{ rep.content.length > 45 ? rep.content.slice(0, 45) + '...' : rep.content }}</span>
                    <span v-if="rep.productType" class="sub-meta-item">NCC: {{ rep.productType }}</span>
                    <span v-if="rep.am" class="sub-meta-item">AM: {{ rep.am }}</span>
                  </div>
                  <div class="sub-report-actions">
                    <button type="button"
                            class="compare-pick-btn"
                            :class="[getPickBtnClass(getSplitSelectionKey(rep, rIdx)), { 'picked-compare': getSelectionOrder(getSplitSelectionKey(rep, rIdx)) > 0 }]"
                            @click.stop="onToggleSelectKey(getSplitSelectionKey(rep, rIdx))"
                            :title="getSelectionOrder(getSplitSelectionKey(rep, rIdx)) > 0 ? 'Nhấn để bỏ chọn đối chiếu bản ghi này' : 'Nhấn để chọn đối chiếu số liệu'">
                      <span v-if="getSelectionOrder(getSplitSelectionKey(rep, rIdx)) > 0">Bỏ chọn (#{{ String(getSelectionOrder(getSplitSelectionKey(rep, rIdx))).padStart(2, '0') }})</span>
                      <span v-else>+ Chọn đối chiếu</span>
                    </button>
                    <button type="button"
                            class="open-tab-mini-btn"
                            @click.stop="$emit('open-sale-report', { file: node, tabIndex: rIdx })"
                            :title="'Mở xem Sale Report (Tab #' + (rIdx + 1) + ')'">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      Xem
                    </button>
                    <span v-if="rep.chotDeal" class="mini-pill closed">Đã chốt</span>
                    <span v-else class="mini-pill draft">Nháp</span>
                  </div>
                </div>

                <!-- Grid 4 ô chỉ số tài chính (Cụ thể) -->
                <div class="compare-finance-grid">
                  <!-- Ô 1: Tệp báo cáo của riêng bản ghi này -->
                  <div class="compare-fin-col compare-files-col">
                    <div class="fin-col-caption" style="display: flex; align-items: center; justify-content: space-between;">
                      <span>Tệp báo cáo</span>
                      <span v-if="(rep.files && rep.files.length) || (rep.images && rep.images.length)" class="fin-caption-badge">
                        {{ (rep.files || []).length + (rep.images || []).length }} tệp
                      </span>
                    </div>

                    <div v-if="(rep.files && rep.files.length > 0) || (rep.images && rep.images.length > 0)" class="compare-files-list">
                      <div v-for="(fObj, fi) in (rep.files || [])" :key="'srf-' + rIdx + '-' + fi" class="report-file-item">
                        <a :href="fObj.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(fObj)" style="flex: 1; min-width: 0;" :title="fObj.name">
                          <span class="file-role-tag" :class="fObj.role === 'Mua hàng' ? 'role-mh' : 'role-bg'">{{ fObj.role }}</span>
                          <span v-html="getFileIconSvg(fObj)" style="display: flex; align-items: center; flex-shrink: 0;"></span>
                          <span class="attach-text">{{ truncateFileName(fObj.name) }}</span>
                        </a>
                        <a :href="getOfficeViewUrl(fObj.url)" target="_blank" @click.stop title="Xem file (Office Online)" class="view-mini-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                        <button type="button" @click.stop.prevent="handleDownloadClick($event, fObj.url, fObj.name)" title="Tải về" class="dl-mini-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>

                      <div v-for="(imgObj, ii) in (rep.images || [])" :key="'sri-' + rIdx + '-' + ii" class="report-file-item">
                        <a :href="imgObj.url" target="_blank" @click.stop class="attach-badge badge-image" style="flex: 1; min-width: 0;" :title="imgObj.name">
                          <span class="file-role-tag role-img">Chứng từ</span>
                          <img :src="imgObj.url" style="width: 18px; height: 18px; object-fit: cover; border-radius: 3px; flex-shrink: 0; background: rgba(0,0,0,0.2);" />
                          <span class="attach-text">{{ truncateFileName(imgObj.name) }}</span>
                        </a>
                        <a :href="getOfficeViewUrl(imgObj.url)" target="_blank" @click.stop title="Xem file (Office Online)" class="view-mini-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                        <button type="button" @click.stop.prevent="handleDownloadClick($event, imgObj.url, imgObj.name)" title="Tải về" class="dl-mini-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                    </div>
                    <div v-else class="split-files-empty" style="font-size: 11px; color: #64748b; font-style: italic; padding: 6px 0;">
                      Chưa có tệp đính kèm
                    </div>
                  </div>

                  <!-- Ô 2: Cơ cấu doanh thu & chi phí -->
                  <div class="compare-fin-col">
                    <div class="fin-col-caption">Cơ cấu doanh thu &amp; chi phí</div>
                    <div class="fin-metric-row">
                      <span class="fin-label">Doanh số bán</span>
                      <div class="fin-val-group">
                        <strong class="fin-val text-white">{{ fmtMoney(rep.doanhSoBan) }}</strong>
                      </div>
                    </div>
                    <div class="fin-metric-row">
                      <span class="fin-label">Giá mua</span>
                      <div class="fin-val-group">
                        <strong class="fin-val text-slate">{{ fmtMoney(rep.giaMua) }}</strong>
                      </div>
                    </div>
                    <div class="fin-metric-row">
                      <span class="fin-label">Tổng CP đơn hàng</span>
                      <div class="fin-val-group">
                        <strong class="fin-val text-amber">{{ fmtMoney(rep.tongCP) }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Cột 2 -->
                  <div class="compare-fin-col">
                    <div class="fin-col-caption">Chiết khấu &amp; Lợi nhuận ròng</div>
                    <div class="fin-metric-row highlight-green-row">
                      <span class="fin-label">Net COM</span>
                      <div class="fin-val-group">
                        <strong class="fin-val text-emerald">{{ fmtMoney(rep.netCom) }}</strong>
                      </div>
                    </div>
                    <div class="fin-metric-row">
                      <span class="fin-label">Gross com</span>
                      <div class="fin-val-group">
                        <strong class="fin-val text-white">{{ fmtMoney(rep.grossCom) }}</strong>
                      </div>
                    </div>
                    <div class="fin-metric-row">
                      <span class="fin-label">Thuế ({{ rep.taxPct }}%)</span>
                      <div class="fin-val-group">
                        <strong class="fin-val text-slate">{{ fmtMoney(rep.thue) }}</strong>
                      </div>
                    </div>
                    <div class="fin-metric-row">
                      <span class="fin-label">Net PO</span>
                      <div class="fin-val-group">
                        <strong class="fin-val text-white">{{ fmtMoney(rep.netPO) }}</strong>
                      </div>
                    </div>
                    <div class="fin-metric-row net-margin-row">
                      <span class="fin-label">Net Margin</span>
                      <div class="fin-val-group">
                        <strong class="fin-val" :class="rep.netMargin >= 0 ? 'text-green' : 'text-red'">
                          {{ fmtMoney(rep.netMargin) }}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <!-- Cột 3 -->
                  <div class="compare-fin-col highlight-ratio-col">
                    <div class="fin-col-caption">Biên tỷ suất tài chính (%)</div>
                    <div class="fin-metric-row">
                      <span class="fin-label">Net COM / Net PO</span>
                      <div class="fin-val-group">
                        <strong class="fin-val text-green">{{ fmtPct(rep.netComOverNetPO) }}</strong>
                      </div>
                    </div>
                    <div class="fin-metric-row">
                      <span class="fin-label">Net Margin / Net PO</span>
                      <div class="fin-val-group">
                        <strong class="fin-val" :class="rep.netMarginOverNetPO >= 0 ? 'text-green' : 'text-red'">
                          {{ fmtPct(rep.netMarginOverNetPO) }}
                        </strong>
                      </div>
                    </div>
                    <div class="fin-metric-row ratio-divider">
                      <span class="fin-label">Net COM / DSB</span>
                      <div class="fin-val-group">
                        <strong class="fin-val text-green">{{ fmtPct(rep.netComOverDSB) }}</strong>
                      </div>
                    </div>
                    <div class="fin-metric-row">
                      <span class="fin-label">Net Margin / DSB</span>
                      <div class="fin-val-group">
                        <strong class="fin-val" :class="rep.netMarginOverDSB >= 0 ? 'text-green' : 'text-red'">
                          {{ fmtPct(rep.netMarginOverDSB) }}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- CHẾ ĐỘ 2: XEM TỔNG QUAN (CHIỀU NGANG GIỐNG BẢNG MA TRẬN) -->
          <div v-else class="cmp-table-scroll cmp-overview-matrix-wrap">
            <table class="cmp-matrix-table is-horizontal">
              <thead>
                <tr>
                  <th class="cmp-th-sticky cmp-th-sticky-version">
                    {{ effectiveMode === 'merged' && nodeReports.length > 1 ? 'TỔNG HỢP / TỆP BÁO CÁO' : 'PHIÊN BẢN / TỆP BÁO CÁO' }}
                  </th>
                  <th class="cmp-th-metric-col">DOANH SỐ BÁN</th>
                  <th class="cmp-th-metric-col">GIÁ MUA</th>
                  <th class="cmp-th-metric-col">TỔNG CP</th>
                  <th class="cmp-th-metric-col">GROSS COM</th>
                  <th class="cmp-th-metric-col">THUẾ</th>
                  <th class="cmp-th-metric-col">NET PO</th>
                  <th class="cmp-th-metric-col is-col-emerald">NET COM</th>
                  <th class="cmp-th-metric-col is-col-margin">NET MARGIN</th>
                  <th class="cmp-th-metric-col">NET COM / NET PO</th>
                  <th class="cmp-th-metric-col">NET MARGIN / NET PO</th>
                  <th class="cmp-th-metric-col">NET COM / DSB</th>
                  <th class="cmp-th-metric-col">NET MARGIN / DSB</th>
                </tr>
              </thead>
              <tbody>
                <!-- Trạng thái 1: Xem gộp -->
                <tr v-if="effectiveMode === 'merged'"
                    class="cmp-tr-horizontal"
                    :class="{ 'is-selected-compare': getSelectionOrder(mergedSelectionKey) > 0 }">
                  <td class="cmp-td-sticky cmp-td-version-sticky">
                    <div class="cmp-th-top">
                      <span v-if="nodeReports.length > 1" class="cmp-chip-index is-merged">
                        TỔNG HỢP ({{ nodeReports.length }})
                      </span>
                      <span v-else class="cmp-chip-index">#01</span>
                      <span v-if="nodeReports.length === 1 && nodeReports[0]?.chotDeal" class="mini-pill closed" style="margin-left: 4px;">Đã chốt</span>
                      <span v-else-if="nodeReports.length === 1" class="mini-pill draft" style="margin-left: 4px;">Nháp</span>
                      <div class="cmp-th-actions" style="margin-left: auto;">
                        <button v-if="nodeReports.length === 1"
                                type="button"
                                class="open-tab-mini-btn"
                                @click.stop="$emit('open-sale-report', { file: node, tabIndex: 0 })"
                                title="Mở xem Sale Report">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          Xem
                        </button>
                        <button type="button"
                                class="compare-pick-btn"
                                :class="[getPickBtnClass(mergedSelectionKey), { 'picked-compare': getSelectionOrder(mergedSelectionKey) > 0 }]"
                                @click.stop="onToggleSelectKey(mergedSelectionKey)"
                                :title="getSelectionOrder(mergedSelectionKey) > 0 ? 'Nhấn để bỏ chọn đối chiếu bản ghi này' : 'Nhấn để chọn đối chiếu số liệu'">
                          <span v-if="getSelectionOrder(mergedSelectionKey) > 0">Bỏ chọn (#{{ String(getSelectionOrder(mergedSelectionKey)).padStart(2, '0') }})</span>
                          <span v-else>+ Chọn đối chiếu</span>
                        </button>
                      </div>
                    </div>
                    <div class="cmp-th-title">
                      {{ nodeReports.length > 1 ? mergedReport.poSummary : (nodeReports[0]?.soPO ? ('PO ' + nodeReports[0].soPO) : 'Báo cáo #01') }}
                      <span v-if="nodeReports.length === 1 && nodeReports[0]?.soHD" class="cmp-th-hd">{{ nodeReports[0].soHD }}</span>
                    </div>
                    <div v-if="nodeReports.length > 1 && mergedReport.productSummary" class="cmp-th-meta">
                      NCC: {{ mergedReport.productSummary }}
                    </div>
                    <div v-else-if="nodeReports.length === 1 && (nodeReports[0]?.productType || nodeReports[0]?.am)" class="cmp-th-meta">
                      <span v-if="nodeReports[0]?.productType">NCC: {{ nodeReports[0].productType }}</span>
                      <span v-if="nodeReports[0]?.am"> · AM: {{ nodeReports[0].am }}</span>
                    </div>
                    <!-- Danh sách tệp gộp -->
                    <div v-if="mergedReportFiles.length || mergedReportImages.length" class="cmp-th-files">
                      <div v-for="(fObj, fi) in mergedReportFiles" :key="'ov-mf-' + fi" class="cmp-th-file-row">
                        <a :href="fObj.url" target="_blank" @click.stop class="cmp-th-file-badge" :class="getFileBadgeClass(fObj)">
                          <span class="cmp-th-file-role" :class="fObj.role?.includes('Mua') ? 'role-mh' : 'role-bg'">{{ fObj.role }}</span>
                          <span class="cmp-th-file-name" :title="fObj.name">{{ truncateFileName(fObj.name) }}</span>
                        </a>
                        <a :href="getOfficeViewUrl(fObj.url)" target="_blank" @click.stop title="Xem file (Office Online)" class="cmp-icon-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                        <button type="button" @click.stop.prevent="handleDownloadClick($event, fObj.url, fObj.name)" title="Tải về" class="cmp-icon-btn is-dl">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                      <div v-for="(imgObj, ii) in mergedReportImages" :key="'ov-mi-' + ii" class="cmp-th-file-row">
                        <a :href="imgObj.url" target="_blank" @click.stop class="cmp-th-file-badge">
                          <span class="cmp-th-file-role role-img">{{ imgObj.role || 'Chứng từ' }}</span>
                          <span class="cmp-th-file-name" :title="imgObj.name">{{ truncateFileName(imgObj.name) }}</span>
                        </a>
                        <a :href="getOfficeViewUrl(imgObj.url)" target="_blank" @click.stop title="Xem ảnh" class="cmp-icon-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                        <button type="button" @click.stop.prevent="handleDownloadClick($event, imgObj.url, imgObj.name)" title="Tải về" class="cmp-icon-btn is-dl">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-white">{{ fmtMoney(activeSingleOrMerged.doanhSoBan) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-slate">{{ fmtMoney(activeSingleOrMerged.giaMua) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-amber">{{ fmtMoney(activeSingleOrMerged.tongCP) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-white">{{ fmtMoney(activeSingleOrMerged.grossCom) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <div class="cmp-cell-primary">
                      <span class="cmp-tax-note">({{ activeSingleOrMerged.taxPct }}%)</span>
                      <strong class="cmp-mono-val text-slate">{{ fmtMoney(activeSingleOrMerged.thue) }}</strong>
                    </div>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-white">{{ fmtMoney(activeSingleOrMerged.netPO) }}</strong>
                  </td>
                  <td class="cmp-td-val is-col-emerald">
                    <strong class="cmp-mono-val text-emerald">{{ fmtMoney(activeSingleOrMerged.netCom) }}</strong>
                  </td>
                  <td class="cmp-td-val is-col-margin">
                    <strong class="cmp-mono-val" :class="activeSingleOrMerged.netMargin >= 0 ? 'text-green' : 'text-red'">
                      {{ fmtMoney(activeSingleOrMerged.netMargin) }}
                    </strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-green">{{ fmtPct(activeSingleOrMerged.netComOverNetPO) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val" :class="activeSingleOrMerged.netMarginOverNetPO >= 0 ? 'text-green' : 'text-red'">
                      {{ fmtPct(activeSingleOrMerged.netMarginOverNetPO) }}
                    </strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-green">{{ fmtPct(activeSingleOrMerged.netComOverDSB) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val" :class="activeSingleOrMerged.netMarginOverDSB >= 0 ? 'text-green' : 'text-red'">
                      {{ fmtPct(activeSingleOrMerged.netMarginOverDSB) }}
                    </strong>
                  </td>
                </tr>

                <!-- Trạng thái 2: Xem phân tách (mỗi report 1 hàng) -->
                <tr v-else
                    v-for="(rep, rIdx) in nodeReports"
                    :key="'ov-split-row-' + rIdx"
                    class="cmp-tr-horizontal"
                    :class="{ 'is-selected-compare': getSelectionOrder(getSplitSelectionKey(rep, rIdx)) > 0 }">
                  <td class="cmp-td-sticky cmp-td-version-sticky">
                    <div class="cmp-th-top">
                      <span class="cmp-chip-index">#{{ String(rIdx + 1).padStart(2, '0') }}</span>
                      <span v-if="rep.chotDeal" class="mini-pill closed" style="margin-left: 4px;">Đã chốt</span>
                      <span v-else class="mini-pill draft" style="margin-left: 4px;">Nháp</span>
                      <div class="cmp-th-actions" style="margin-left: auto;">
                        <button type="button"
                                class="open-tab-mini-btn"
                                @click.stop="$emit('open-sale-report', { file: node, tabIndex: rIdx })"
                                :title="'Mở xem Sale Report (Tab #' + (rIdx + 1) + ')'">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          Xem
                        </button>
                        <button type="button"
                                class="compare-pick-btn"
                                :class="[getPickBtnClass(getSplitSelectionKey(rep, rIdx)), { 'picked-compare': getSelectionOrder(getSplitSelectionKey(rep, rIdx)) > 0 }]"
                                @click.stop="onToggleSelectKey(getSplitSelectionKey(rep, rIdx))"
                                :title="getSelectionOrder(getSplitSelectionKey(rep, rIdx)) > 0 ? 'Nhấn để bỏ chọn đối chiếu bản ghi này' : 'Nhấn để chọn đối chiếu số liệu'">
                          <span v-if="getSelectionOrder(getSplitSelectionKey(rep, rIdx)) > 0">Bỏ chọn (#{{ String(getSelectionOrder(getSplitSelectionKey(rep, rIdx))).padStart(2, '0') }})</span>
                          <span v-else>+ Chọn đối chiếu</span>
                        </button>
                      </div>
                    </div>
                    <div class="cmp-th-title">
                      {{ rep.soPO ? ('PO ' + rep.soPO) : ('Báo cáo #' + (rIdx + 1)) }}
                      <span v-if="rep.soHD" class="cmp-th-hd">{{ rep.soHD }}</span>
                    </div>
                    <div v-if="rep.content" class="cmp-th-subtitle" :title="rep.content">
                      {{ rep.content.length > 50 ? rep.content.slice(0, 50) + '...' : rep.content }}
                    </div>
                    <div v-if="rep.productType || rep.am" class="cmp-th-meta">
                      <span v-if="rep.productType">NCC: {{ rep.productType }}</span>
                      <span v-if="rep.am"> · AM: {{ rep.am }}</span>
                    </div>
                    <!-- Danh sách tệp riêng của bản ghi -->
                    <div v-if="(rep.files && rep.files.length > 0) || (rep.images && rep.images.length > 0)" class="cmp-th-files">
                      <div v-for="(fObj, fi) in (rep.files || [])" :key="'ov-sf-' + rIdx + '-' + fi" class="cmp-th-file-row">
                        <a :href="fObj.url" target="_blank" @click.stop class="cmp-th-file-badge" :class="getFileBadgeClass(fObj)">
                          <span class="cmp-th-file-role" :class="fObj.role === 'Mua hàng' ? 'role-mh' : 'role-bg'">{{ fObj.role }}</span>
                          <span class="cmp-th-file-name" :title="fObj.name">{{ truncateFileName(fObj.name) }}</span>
                        </a>
                        <a :href="getOfficeViewUrl(fObj.url)" target="_blank" @click.stop title="Xem file (Office Online)" class="view-mini-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                        <button type="button" @click.stop.prevent="handleDownloadClick($event, fObj.url, fObj.name)" title="Tải về" class="dl-mini-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                      <div v-for="(imgObj, ii) in (rep.images || [])" :key="'ov-si-' + rIdx + '-' + ii" class="cmp-th-file-row">
                        <a :href="imgObj.url" target="_blank" @click.stop class="cmp-th-file-badge">
                          <span class="cmp-th-file-role role-img">Chứng từ</span>
                          <span class="cmp-th-file-name" :title="imgObj.name">{{ truncateFileName(imgObj.name) }}</span>
                        </a>
                        <a :href="getOfficeViewUrl(imgObj.url)" target="_blank" @click.stop title="Xem ảnh" class="view-mini-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                        <button type="button" @click.stop.prevent="handleDownloadClick($event, imgObj.url, imgObj.name)" title="Tải về" class="dl-mini-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-white">{{ fmtMoney(rep.doanhSoBan) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-slate">{{ fmtMoney(rep.giaMua) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-amber">{{ fmtMoney(rep.tongCP) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-white">{{ fmtMoney(rep.grossCom) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <div class="cmp-cell-primary">
                      <span class="cmp-tax-note">({{ rep.taxPct }}%)</span>
                      <strong class="cmp-mono-val text-slate">{{ fmtMoney(rep.thue) }}</strong>
                    </div>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-white">{{ fmtMoney(rep.netPO) }}</strong>
                  </td>
                  <td class="cmp-td-val is-col-emerald">
                    <strong class="cmp-mono-val text-emerald">{{ fmtMoney(rep.netCom) }}</strong>
                  </td>
                  <td class="cmp-td-val is-col-margin">
                    <strong class="cmp-mono-val" :class="rep.netMargin >= 0 ? 'text-green' : 'text-red'">
                      {{ fmtMoney(rep.netMargin) }}
                    </strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-green">{{ fmtPct(rep.netComOverNetPO) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val" :class="rep.netMarginOverNetPO >= 0 ? 'text-green' : 'text-red'">
                      {{ fmtPct(rep.netMarginOverNetPO) }}
                    </strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val text-green">{{ fmtPct(rep.netComOverDSB) }}</strong>
                  </td>
                  <td class="cmp-td-val">
                    <strong class="cmp-mono-val" :class="rep.netMarginOverDSB >= 0 ? 'text-green' : 'text-red'">
                      {{ fmtPct(rep.netMarginOverDSB) }}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ĐỆ QUY CON (PHÂN CẤP GIỐNG DẠNG LUỒNG) -->
    <div class="children-list" v-if="node.children && node.children.length > 0">
      <FileCompareNode
        v-for="(child, index) in node.children"
        :key="child.id"
        :node="child"
        :customer="customer"
        :isChild="true"
        :isLast="index === node.children.length - 1"
        :highlighted-id="highlightedId"
        :compare-mode="compareMode"
        :view-density="viewDensity"
        :get-reports-for-file="getReportsForFile"
        :selected-compare-keys="selectedCompareKeys"
        :get-reference-report-for-key="getReferenceReportForKey"
        :selected-json-card-ids="selectedJsonCardIds"
        :get-chain-info-for-card="getChainInfoForCard"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @open-sale-report="$emit('open-sale-report', $event)"
        @node-dropped="$emit('node-dropped', $event)"
        @toggle-select-compare="$emit('toggle-select-compare', $event)"
        @select-card-reports-compare="$emit('select-card-reports-compare', $event)"
        @change-density="$emit('change-density', $event)"
        @export-card-json="$emit('export-card-json', $event)"
        @export-chain-json="$emit('export-chain-json', $event)"
        @open-chain-card-picker="$emit('open-chain-card-picker', $event)"
        @toggle-select-json-card="$emit('toggle-select-json-card', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { downloadCardFilesAsZip } from '../utils/cardZipHelper'

const props = defineProps({
  node: { type: Object, required: true },
  customer: { type: Object, default: null },
  isChild: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  highlightedId: { type: [String, Number], default: null },
  compareMode: { type: String, default: 'split' }, // 'split' | 'merged'
  viewDensity: { type: String, default: 'detailed' }, // 'detailed' | 'overview'
  getReportsForFile: { type: Function, required: true },
  selectedCompareKeys: { type: Array, default: () => [] },
  getReferenceReportForKey: { type: Function, default: null },
  selectedJsonCardIds: { type: Array, default: () => [] },
  getChainInfoForCard: { type: Function, default: null }
})

const emit = defineEmits([
  'edit',
  'delete',
  'open-sale-report',
  'node-dropped',
  'toggle-select-compare',
  'select-card-reports-compare',
  'change-density',
  'export-card-json',
  'export-chain-json',
  'open-chain-card-picker',
  'toggle-select-json-card'
])

const jsonSelectionOrder = computed(() => {
  const idx = (props.selectedJsonCardIds || []).indexOf(props.node?.id)
  return idx >= 0 ? idx + 1 : 0
})
const isCardSelectedForJson = computed(() => jsonSelectionOrder.value > 0)
const cardChainInfo = computed(() => (props.getChainInfoForCard && props.node) ? props.getChainInfoForCard(props.node) : null)

const localModeOverride = ref(null)
watch(() => props.compareMode, () => {
  localModeOverride.value = null
})
const effectiveMode = computed(() => localModeOverride.value || props.compareMode || 'split')

const localDensityOverride = ref(null)
watch(() => props.viewDensity, () => {
  localDensityOverride.value = null
})
const effectiveDensity = computed(() => localDensityOverride.value || props.viewDensity || 'detailed')

const toggleDensity = (density) => {
  localDensityOverride.value = density
  emit('change-density', density)
}

const nodeReports = computed(() => {
  if (!props.getReportsForFile || !props.node) return []
  return props.getReportsForFile(props.node) || []
})

const closedCount = computed(() => nodeReports.value.filter(r => r.chotDeal).length)

const totalCardGoodsCount = computed(() => {
  return nodeReports.value.reduce((sum, r) => sum + (Array.isArray(r.goodsList) ? r.goodsList.length : 0), 0)
})

const allCardFiles = computed(() => {
  const seen = new Set()
  const list = []
  getFiles(props.node?.linkFileBaoGia).forEach(f => {
    const url = typeof f === 'string' ? f : f?.url
    if (url && !seen.has(url)) {
      seen.add(url)
      list.push(f)
    }
  })
  nodeReports.value.forEach(r => {
    ;(r.files || []).forEach(f => {
      if (f && f.url && !seen.has(f.url)) {
        seen.add(f.url)
        list.push(f)
      }
    })
  })
  return list
})

const allCardImages = computed(() => {
  const seen = new Set()
  const list = []
  getFiles(props.node?.linkImgSave).forEach(img => {
    const url = typeof img === 'string' ? img : img?.url
    if (url && !seen.has(url)) {
      seen.add(url)
      list.push(img)
    }
  })
  nodeReports.value.forEach(r => {
    ;(r.images || []).forEach(img => {
      if (img && img.url && !seen.has(img.url)) {
        seen.add(img.url)
        list.push(img)
      }
    })
  })
  return list
})

const mergedReportFiles = computed(() => {
  const seen = new Set()
  const list = []
  nodeReports.value.forEach((r, rIdx) => {
    ;(r.files || []).forEach(f => {
      if (f && f.url && !seen.has(f.url)) {
        seen.add(f.url)
        list.push({
          ...f,
          role: nodeReports.value.length > 1 ? `#${rIdx + 1} ${f.role || 'File'}` : (f.role || '')
        })
      }
    })
  })
  return list
})

const mergedReportImages = computed(() => {
  const seen = new Set()
  const list = []
  nodeReports.value.forEach((r, rIdx) => {
    ;(r.images || []).forEach(img => {
      if (img && img.url && !seen.has(img.url)) {
        seen.add(img.url)
        list.push({
          ...img,
          role: nodeReports.value.length > 1 ? `#${rIdx + 1} Chứng từ` : 'Chứng từ'
        })
      }
    })
  })
  return list
})

const mergedReport = computed(() => {
  const list = nodeReports.value
  const doanhSoBan = list.reduce((s, x) => s + (Number(x.doanhSoBan) || 0), 0)
  const giaMua = list.reduce((s, x) => s + (Number(x.giaMua) || 0), 0)
  const tongCP = list.reduce((s, x) => s + (Number(x.tongCP) || 0), 0)
  const grossCom = list.reduce((s, x) => s + (Number(x.grossCom) || 0), 0)
  const thue = list.reduce((s, x) => s + (Number(x.thue) || 0), 0)
  const taxPct = grossCom !== 0 ? Number(((thue / grossCom) * 100).toFixed(1)) : (list[0]?.taxPct ?? 25)
  const netCom = list.reduce((s, x) => s + (Number(x.netCom) || 0), 0)
  const netPO = doanhSoBan - grossCom
  const netMargin = doanhSoBan - grossCom - tongCP

  return {
    doanhSoBan,
    giaMua,
    tongCP,
    grossCom,
    thue,
    taxPct,
    netCom,
    netPO,
    netMargin,
    netComOverNetPO: netPO !== 0 ? (netCom / netPO) * 100 : 0,
    netMarginOverNetPO: netPO !== 0 ? (netMargin / netPO) * 100 : 0,
    netComOverDSB: doanhSoBan !== 0 ? (netCom / doanhSoBan) * 100 : 0,
    netMarginOverDSB: doanhSoBan !== 0 ? (netMargin / doanhSoBan) * 100 : 0,
    poSummary: list.map((x, i) => x.soPO ? `PO ${x.soPO}` : `#${i + 1}`).join(' + '),
    productSummary: Array.from(new Set(list.map(x => x.productType).filter(Boolean))).join(', ')
  }
})

const activeSingleOrMerged = computed(() => {
  if (nodeReports.value.length === 1) return nodeReports.value[0]
  return mergedReport.value
})

const fmtMoney = (val) => {
  const n = Math.round(Number(val) || 0)
  return new Intl.NumberFormat('vi-VN').format(n)
}

const fmtPct = (val) => {
  const n = Number(val) || 0
  if (n === 0) return '0%'
  return n.toFixed(2) + '%'
}

const getSplitSelectionKey = (rep, rIdx) => {
  const repKey = rep?.key ?? rIdx
  return `${props.node?.id}::rep::${repKey}`
}

const mergedSelectionKey = computed(() => {
  if (nodeReports.value.length === 1) {
    return getSplitSelectionKey(nodeReports.value[0], 0)
  }
  return `${props.node?.id}::merged`
})

const getSelectionOrder = (selKey) => {
  const arr = props.selectedCompareKeys || []
  const idx = arr.indexOf(selKey)
  return idx >= 0 ? idx + 1 : 0
}

const getPickBtnClass = (selKey) => {
  const order = getSelectionOrder(selKey)
  if (order === 1) return 'is-picked-base'
  if (order > 1) return 'is-picked-target'
  return ''
}

const onToggleSelectKey = (selKey) => {
  emit('toggle-select-compare', selKey)
}

const areAllNodeReportsSelected = computed(() => {
  if (nodeReports.value.length <= 1) return false
  const arr = props.selectedCompareKeys || []
  return nodeReports.value.every((rep, rIdx) => arr.includes(getSplitSelectionKey(rep, rIdx)))
})

const onToggleAllNodeReports = () => {
  const keys = nodeReports.value.map((rep, rIdx) => getSplitSelectionKey(rep, rIdx))
  if (localModeOverride.value === 'merged' || (!localModeOverride.value && props.compareMode === 'merged')) {
    localModeOverride.value = 'split'
  }
  emit('select-card-reports-compare', { keys, allSelected: areAllNodeReportsSelected.value })
}

const getMetricDiff = (currReport, selKey, field, isRatio = false) => {
  const order = getSelectionOrder(selKey)
  if (order <= 1 || !currReport || !props.getReferenceReportForKey) return null
  const refInfo = props.getReferenceReportForKey(selKey)
  if (!refInfo || !refInfo.report) return null

  const baseVal = Number(refInfo.report[field]) || 0
  const currVal = Number(currReport[field]) || 0
  const delta = currVal - baseVal

  if (Math.abs(delta) < 0.0001) {
    return {
      delta: 0,
      pct: 0,
      pctText: '0.0%',
      dir: 'flat',
      tooltip: `Đối chiếu ${refInfo.refLabel}: Không đổi (0%)`
    }
  }

  let pct = 0
  let pctText = ''
  if (Math.abs(baseVal) < 0.0001) {
    pct = currVal > 0 ? 100 : -100
    pctText = currVal > 0 ? '+Mới' : '-100%'
  } else {
    pct = ((currVal - baseVal) / Math.abs(baseVal)) * 100
    const sign = pct > 0 ? '+' : ''
    pctText = `${sign}${pct.toFixed(1)}%`
  }

  const deltaStr = isRatio
    ? `${delta >= 0 ? '+' : ''}${delta.toFixed(2)} đpt (${fmtPct(baseVal)} -> ${fmtPct(currVal)})`
    : `${delta >= 0 ? '+' : ''}${fmtMoney(delta)} đ (${fmtMoney(baseVal)} -> ${fmtMoney(currVal)})`

  return {
    delta,
    pct,
    pctText,
    dir: delta > 0 ? 'up' : 'down',
    tooltip: `Đối chiếu ${refInfo.refLabel}: ${pctText} | Chênh lệch: ${deltaStr}`
  }
}

// Drag & Drop (giống FileTimelineNode)
const dragOverType = ref(null)
const onDragStart = (e, node) => {
  e.dataTransfer.setData('nodeId', node.id)
  e.dataTransfer.effectAllowed = 'move'
}
const onDragOver = (e) => {
  e.preventDefault()
  const rect = e.currentTarget.getBoundingClientRect()
  const y = e.clientY - rect.top
  dragOverType.value = y < rect.height * 0.3 ? 'insert' : 'append'
}
const onDragLeave = () => {
  dragOverType.value = null
}
const onDrop = (e, targetNode) => {
  e.stopPropagation()
  const draggedId = e.dataTransfer.getData('nodeId')
  const pos = dragOverType.value
  dragOverType.value = null
  if (draggedId && draggedId !== targetNode.id) {
    emit('node-dropped', { draggedId, targetId: targetNode.id, position: pos })
  }
}

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const getStatusClass = (status) => status === 'Đã gửi' ? 'is-done' : 'is-pending'
const getQuoteClass = (status) => {
  if (status === 'Thành công') return 'is-done'
  if (status === 'Thất bại') return 'is-failed'
  return 'is-pending'
}

function getFiles(field) {
  if (!field) return []
  if (Array.isArray(field)) return field
  if (typeof field === 'string') return field.split('\n').filter(l => l.trim() !== '')
  return []
}

const hasAttachments = (node) => getFiles(node.linkFileBaoGia).length > 0 || getFiles(node.linkImgSave).length > 0

const getFileName = (fileObj, prefix, index) => {
  if (typeof fileObj === 'object' && fileObj.name) return fileObj.name
  const url = typeof fileObj === 'string' ? fileObj : fileObj.url
  try {
    const parts = url.split('/')
    let name = parts[parts.length - 1]
    name = name.split('?')[0]
    return decodeURIComponent(name)
  } catch {
    return `${prefix} ${index + 1}`
  }
}

const truncateFileName = (name) => {
  if (!name) return ''
  if (name.length > 25) return name.substring(0, 15) + '...' + name.substring(name.length - 7)
  return name
}

const getOriginalFileName = (fileObj) => {
  if (typeof fileObj === 'object' && fileObj.name) return fileObj.name
  return typeof fileObj === 'string' ? fileObj : fileObj.url
}

const getFileIconType = (fileObj) => {
  const name = (getOriginalFileName(fileObj) || '').toLowerCase()
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word'
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'excel'
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif')) return 'image'
  return 'default'
}

const getFileBadgeClass = (fileObj) => {
  const type = getFileIconType(fileObj)
  if (type === 'pdf') return 'badge-pdf'
  if (type === 'word') return 'badge-word'
  if (type === 'excel') return 'badge-excel'
  return 'badge-default'
}

const getFileIconSvg = (fileObj) => {
  const type = getFileIconType(fileObj)
  const imgStyle = 'width: 16px; height: 16px; object-fit: contain; border-radius: 2px;'
  if (type === 'pdf') return `<img src="https://i.ibb.co/3YdHRTFs/unnamed.webp" style="${imgStyle}" />`
  if (type === 'word') return `<img src="https://i.ibb.co/d0Y6v4yD/images-7.jpg" style="${imgStyle}" />`
  if (type === 'excel') return `<img src="https://i.ibb.co/b5yq09VP/images-8.jpg" style="${imgStyle}" />`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`
}

const getOfficeViewUrl = (fileObj) => {
  const url = typeof fileObj === 'string' ? fileObj : fileObj?.url
  if (!url || typeof url !== 'string') return '#'
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
}

const handleDownloadClick = async (event, url, defaultName) => {
  event.preventDefault()
  let name = defaultName
  if (!url || typeof url !== 'string') return
  const urlParts = url.split('?')[0].split('/')
  const lastPart = urlParts[urlParts.length - 1]
  const extIndex = lastPart.lastIndexOf('.')
  const ext = extIndex > -1 ? lastPart.substring(extIndex) : ''
  if (ext && !name.toLowerCase().endsWith(ext.toLowerCase())) {
    name = name + ext
  }
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Fetch failed')
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = objectUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(objectUrl)
    }, 1000)
  } catch (err) {
    console.error('Lỗi khi tải file qua JS:', err)
    window.open(url, '_blank')
  }
}

const isDownloadingZip = ref(false)
const zipProgressText = ref('')

const handleDownloadAllZip = async () => {
  if (isDownloadingZip.value) return
  isDownloadingZip.value = true
  zipProgressText.value = 'Đang nén...'
  try {
    const customerName = props.customer?.ten_khach_hang || props.customer?.name || props.node?.tenKH || props.node?.maKH || 'Khách hàng'
    await downloadCardFilesAsZip({
      customerName,
      noiDung: props.node?.noiDung || '',
      ghiChu: props.node?.ghiChu || '',
      files: allCardFiles.value,
      images: allCardImages.value,
      onProgress: (percent, msg) => {
        zipProgressText.value = msg || `${percent}%`
      }
    })
  } catch (err) {
    console.error('Lỗi khi tải zip card:', err)
    alert('Không thể tạo file zip: ' + (err.message || 'Lỗi không xác định'))
  } finally {
    isDownloadingZip.value = false
    zipProgressText.value = ''
  }
}
</script>

<style scoped>
.btn-dl-all-zip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 5px;
  padding: 3px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.2;
}
.btn-dl-all-zip:hover:not(:disabled) {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}
.btn-dl-all-zip:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.zip-mini-spinner {
  width: 10px;
  height: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #34d399;
  border-radius: 50%;
  animation: zipSpin 0.7s linear infinite;
  display: inline-block;
}
@keyframes zipSpin {
  to { transform: rotate(360deg); }
}

.compare-node {
  margin-top: 18px;
  position: relative;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

.compare-row {
  display: flex;
  align-items: stretch;
  gap: 0;
  position: relative;
}

.compare-left-card {
  display: flex;
  gap: 14px;
  position: relative;
  cursor: pointer;
  align-items: stretch;
  flex: 0 0 430px;
  max-width: 430px;
}

.compare-bridge-connector {
  display: flex;
  align-items: center;
  width: 28px;
  flex-shrink: 0;
}

.compare-bridge-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.7), rgba(56, 189, 248, 0.7));
}

.compare-right-metrics {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Hierarchy Lines (giống FileTimelineNode) */
.line-bridge {
  position: absolute;
  left: -20px;
  top: -18px;
  height: 33px;
  width: 2px;
  background: rgba(16, 185, 129, 0.6);
  z-index: 1;
}

.line-horizontal {
  position: absolute;
  left: -20px;
  top: 15px;
  width: 20px;
  height: 2px;
  background: rgba(16, 185, 129, 0.6);
  z-index: 1;
}

.line-pass-through {
  position: absolute;
  left: -20px;
  top: 15px;
  bottom: 0;
  width: 2px;
  background: rgba(16, 185, 129, 0.6);
  z-index: 1;
}

.line-to-children {
  position: absolute;
  left: 15px;
  top: 30px;
  bottom: 0;
  width: 2px;
  background: rgba(16, 185, 129, 0.6);
  z-index: 1;
}

.children-list {
  padding-left: 35px;
}

.node-dot {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  border-radius: 4px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.node-card {
  flex: 1;
  border-radius: 12px;
  padding: 12px 14px;
  min-width: 0;
  position: relative;
  z-index: 2;
  transition: all 0.25s ease;
  overflow: hidden;
}

.tl-rect--green {
  background: linear-gradient(180deg, rgba(15, 23, 34, 0.95) 0%, rgba(15, 23, 34, 0.85) 100%);
  border: 2px solid rgba(16, 185, 129, 0.75) !important;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);
}

.tl-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
}

.tl-shimmer--green {
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent);
}

.node-content:hover .node-card {
  transform: translateY(-2px);
  filter: brightness(1.08);
}

.is-highlighted {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 1) !important;
  transform: scale(1.03) !important;
  z-index: 9999 !important;
  border-color: #3b82f6 !important;
  border-width: 4px !important;
  background: linear-gradient(180deg, rgba(30, 58, 138, 0.95) 0%, rgba(30, 58, 138, 0.85) 100%) !important;
}

.is-dragover-append {
  box-shadow: 0 0 0 3px #10b981, inset 0 0 20px rgba(16, 185, 129, 0.4) !important;
  transform: scale(1.02);
  z-index: 9999;
}

.is-dragover-insert {
  border-top: 4px dashed #f59e0b !important;
  box-shadow: 0 -4px 10px rgba(245, 158, 11, 0.3) !important;
  z-index: 9999;
}

/* Card internal tags & attachments (giữ nguyên như cũ) */
.tl-rect-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tl-status-chip {
  padding: 2px 7px;
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
}

.is-done { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.is-pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
.is-failed { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

.tl-body-text {
  color: #f8fafc;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.attach-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  text-decoration: none;
  max-width: 100%;
}

.attach-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff !important;
}

.view-mini-btn {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  text-decoration: none;
  transition: all 0.2s;
}

.view-mini-btn:hover {
  background: #3b82f6;
  color: #ffffff;
}

.dl-mini-btn {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.dl-mini-btn:hover {
  background: #10b981;
  color: #ffffff;
}

.badge-pdf { background: rgba(239, 68, 68, 0.4); color: #ffffff !important; border: 1px solid rgba(239, 68, 68, 0.6); }
.badge-word { background: rgba(59, 130, 246, 0.4); color: #ffffff !important; border: 1px solid rgba(59, 130, 246, 0.6); }
.badge-excel { background: rgba(16, 185, 129, 0.4); color: #ffffff !important; border: 1px solid rgba(16, 185, 129, 0.6); }
.badge-default { background: rgba(148, 163, 184, 0.4); color: #ffffff !important; border: 1px solid rgba(148, 163, 184, 0.6); }
.badge-image { background: rgba(168, 85, 247, 0.4); color: #ffffff !important; border: 1px solid rgba(168, 85, 247, 0.6); }

/* Separated per-Sale-Report file groups on Left Card */
.left-split-file-group {
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-left: 3px solid #38bdf8;
  border-radius: 8px;
  padding: 6px 8px;
  transition: border-color 0.2s;
}

.left-split-file-group:hover {
  border-color: rgba(56, 189, 248, 0.5);
}

.left-split-file-group.general-file-group {
  border-color: rgba(148, 163, 184, 0.25);
  border-left-color: #94a3b8;
}

.left-split-file-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-bottom: 4px;
  border-bottom: 1px dashed rgba(51, 65, 85, 0.7);
  cursor: pointer;
}

.file-role-tag {
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 4px;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.file-role-tag.role-bg {
  background: rgba(16, 185, 129, 0.9);
  color: #022c22;
}

.file-role-tag.role-mh {
  background: rgba(245, 158, 11, 0.95);
  color: #451a03;
}

.file-role-tag.role-img {
  background: rgba(216, 180, 254, 0.95);
  color: #3b0764;
}

/* ═══ RIGHT METRICS PANEL (DESIGN TASTE WORKSTATION) ═══ */
.metrics-empty-box {
  background: #0d131f;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 100%;
  box-sizing: border-box;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.metrics-empty-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 500;
}

.empty-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.metrics-panel-wrapper {
  background: #0d131f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metrics-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
}

.metrics-header-left {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.sr-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.sr-closed-badge {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.sr-draft-badge {
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
}

.local-mode-switch {
  display: inline-flex;
  background: #070a12;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.local-mode-switch button {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.local-mode-switch button:hover {
  color: #cbd5e1;
}

.local-mode-switch button.active {
  background: #1e293b;
  color: #f8fafc;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.view-density-switch {
  border-color: rgba(56, 189, 248, 0.2);
}

.view-density-switch button.active {
  background: rgba(56, 189, 248, 0.16);
  color: #38bdf8;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(56, 189, 248, 0.2);
}

/* Overview Matrix Table (Bảng ma trận chiều ngang) */
.cmp-table-scroll {
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #070a12;
}

.cmp-overview-matrix-wrap {
  margin-top: 4px;
}

.cmp-table-scroll::-webkit-scrollbar {
  height: 6px;
}

.cmp-table-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 4px;
}

.cmp-matrix-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
  font-size: 12px;
}

.cmp-matrix-table thead tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.cmp-th-sticky {
  text-align: left;
  padding: 10px 12px;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  position: sticky;
  left: 0;
  background: #090d16;
  z-index: 2;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.cmp-th-sticky-version {
  width: 250px;
  min-width: 230px;
  max-width: 280px;
}

.cmp-th-metric-col {
  text-align: right;
  padding: 10px 12px;
  min-width: 130px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #090d16;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  white-space: nowrap;
}

.cmp-th-metric-col.is-col-emerald {
  color: #34d399;
  background: rgba(16, 185, 129, 0.06);
}

.cmp-th-metric-col.is-col-margin {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.03);
}

.cmp-matrix-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.15s ease;
}

.cmp-matrix-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.cmp-matrix-table tbody tr.is-selected-compare {
  background: rgba(16, 185, 129, 0.04);
}

.cmp-td-sticky {
  padding: 9px 12px;
  color: #cbd5e1;
  font-weight: 600;
  font-size: 12px;
  position: sticky;
  left: 0;
  background: #090d16;
  z-index: 1;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.cmp-td-version-sticky {
  width: 250px;
  min-width: 230px;
  max-width: 280px;
  vertical-align: top;
}

.cmp-chip-index {
  font-size: 10px;
  font-weight: 700;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  padding: 1px 5px;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.cmp-chip-index.is-merged {
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
}

.cmp-th-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
}

.cmp-th-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cmp-th-title {
  color: #f8fafc;
  font-weight: 700;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.cmp-th-hd {
  color: #94a3b8;
  font-weight: 500;
  font-size: 11px;
  margin-left: 4px;
}

.cmp-th-subtitle {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 400;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.cmp-th-meta {
  color: #64748b;
  font-size: 10.5px;
  text-align: left;
  margin-top: 2px;
}

.cmp-th-files {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 6px;
  text-align: left;
  max-height: 120px;
  overflow-y: auto;
}

.cmp-th-file-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cmp-th-file-badge {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: #e2e8f0;
  font-size: 10.5px;
  text-decoration: none;
}

.cmp-th-file-role {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  padding: 1px 4px;
  border-radius: 3px;
}

.cmp-th-file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmp-icon-btn {
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cmp-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.cmp-icon-btn.is-dl:hover {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
}

.cmp-td-val {
  padding: 9px 12px;
  text-align: right;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
  white-space: nowrap;
}

.cmp-td-val.is-col-emerald {
  background: rgba(16, 185, 129, 0.045);
}

.cmp-td-val.is-col-margin {
  background: rgba(255, 255, 255, 0.02);
}

.cmp-cell-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.cmp-tax-note {
  color: #64748b;
  font-size: 10.5px;
  font-family: 'JetBrains Mono', monospace;
}

.cmp-mono-val {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
}

.open-sr-btn {
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.open-sr-btn:hover {
  background: #10b981;
  color: #022c22;
  border-color: #10b981;
}

.open-sr-btn:active {
  transform: scale(0.98);
}

.sub-report-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 7px;
  padding: 6px 10px;
  font-size: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.merged-bar {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
}

.sub-report-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sub-report-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.merged-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 2px 6px;
  border-radius: 4px;
}

.sub-po-code {
  color: #f8fafc;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
}

.sub-hd-code {
  color: #94a3b8;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 11.5px;
}

.sub-content-snippet {
  color: #cbd5e1;
  font-size: 11.5px;
  padding-left: 6px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.sub-meta-item {
  color: #64748b;
  font-size: 11px;
  padding-left: 6px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.split-index-badge {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.09);
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
}

.mini-pill {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.mini-pill.closed {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.mini-pill.draft {
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.metrics-split-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.split-item {
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.split-item:first-child {
  padding-top: 0;
  border-top: none;
}

/* 4-Column Financial Grid with Report Files Column */
.compare-finance-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr 1.15fr 1.1fr;
  gap: 10px;
}

.compare-files-col {
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.compare-files-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 185px;
  overflow-y: auto;
  padding-right: 2px;
}

.compare-files-list::-webkit-scrollbar {
  width: 4px;
}

.compare-files-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.report-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.fin-caption-badge {
  font-size: 9.5px;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 4px;
  padding: 1px 5px;
  letter-spacing: normal;
  text-transform: none;
}

.compare-fin-col {
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fin-col-caption {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  padding-bottom: 4px;
  margin-bottom: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.highlight-ratio-col {
  background: rgba(16, 185, 129, 0.025);
  border-color: rgba(16, 185, 129, 0.14);
}

.fin-metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  padding: 2px 0;
}

.highlight-green-row {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 5px;
  padding: 4px 8px;
  margin: 1px -4px;
}

.net-margin-row {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 6px;
  margin-top: 2px;
}

.ratio-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 6px;
  margin-top: 2px;
}

.fin-label {
  color: #94a3b8;
  font-weight: 500;
  font-size: 11.5px;
}

.highlight-green-row .fin-label {
  color: #d1fae5;
  font-weight: 600;
}

.fin-val {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}

.text-white { color: #f8fafc; }
.text-slate { color: #cbd5e1; }
.text-amber { color: #fbbf24; }
.text-emerald { color: #34d399; }
.text-green { color: #10b981; }
.text-red { color: #f43f5e; }

.split-report-files-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 5px 9px;
  margin-bottom: 8px;
}

.split-files-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.split-file-chip-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
}

.split-files-empty {
  font-size: 11px;
  color: #475569;
}

.open-tab-mini-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(56, 189, 248, 0.08);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
  white-space: nowrap;
}

.open-tab-mini-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  color: #f8fafc;
  border-color: rgba(56, 189, 248, 0.5);
  transform: translateY(-0.5px);
}

.quick-compare-card-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.03);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
  white-space: nowrap;
}

.quick-compare-card-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.18);
}

.quick-compare-card-btn.active {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
}

.compare-pick-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 10.5px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
  white-space: nowrap;
}

.compare-pick-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-0.5px);
}

.compare-pick-btn.picked-compare,
.compare-pick-btn.is-picked-target {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.42);
}

.compare-pick-btn.is-picked-base {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.45);
}

.compare-pick-btn.picked-compare:hover {
  background: rgba(239, 68, 68, 0.16);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.45);
}

.metrics-single-block.is-selected-base {
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 8px;
  padding: 8px;
  background: rgba(245, 158, 11, 0.025);
}

.metrics-single-block.is-selected-compare {
  border: 1px solid rgba(16, 185, 129, 0.38);
  border-radius: 8px;
  padding: 8px;
  background: rgba(16, 185, 129, 0.025);
}

.fin-val-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.fin-diff-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.fin-diff-badge.diff-up {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.28);
}

.fin-diff-badge.diff-down {
  background: rgba(244, 63, 94, 0.12);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.28);
}

.fin-diff-badge.diff-flat {
  background: rgba(255, 255, 255, 0.04);
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.node-card.is-json-selected-card {
  box-shadow: 0 0 0 1.5px rgba(56, 189, 248, 0.65), 0 8px 22px -6px rgba(14, 165, 233, 0.28) !important;
}

.btn-pick-json-card {
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  border-radius: 5px;
  padding: 2px 7px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.16s ease;
}
.btn-pick-json-card:hover {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.45);
}
.btn-pick-json-card.is-picked {
  background: rgba(16, 185, 129, 0.22);
  color: #34d399;
  border: 1px solid #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.28);
}

.btn-chain-json-mini {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
  cursor: pointer;
  padding: 3px 7px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  flex-shrink: 0;
}
.btn-chain-json-mini:hover {
  background: #059669;
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
  transform: translateY(-1px);
}

.export-sr-chain-json-btn {
  background: rgba(16, 185, 129, 0.13);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.38);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}
.export-sr-chain-json-btn:hover {
  background: #059669;
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.35);
  transform: translateY(-1px);
}

.export-sr-chain-pick-btn {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}
.export-sr-chain-pick-btn:hover {
  background: #d97706;
  color: #ffffff;
  border-color: #fbbf24;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3);
  transform: translateY(-1px);
}

.btn-card-json-mini {
  background: rgba(56, 189, 248, 0.14);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
  cursor: pointer;
  padding: 3px 7px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  flex-shrink: 0;
}
.btn-card-json-mini:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 2px 8px rgba(56, 189, 248, 0.35);
  transform: translateY(-1px);
}

.export-sr-json-btn {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}
.export-sr-json-btn:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.35);
  transform: translateY(-1px);
}
.export-sr-json-btn:active {
  transform: scale(0.98);
}

.sr-goods-badge {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.25);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1400px) {
  .compare-finance-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1100px) {
  .compare-row {
    flex-direction: column;
    gap: 10px;
  }
  .compare-left-card {
    flex: 1 1 auto;
    max-width: 100%;
  }
  .compare-bridge-connector {
    display: none;
  }
  .compare-finance-grid {
    grid-template-columns: 1fr;
  }
}
</style>
