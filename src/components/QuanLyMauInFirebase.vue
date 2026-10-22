<template>
  <div class="quan-ly-mau-in" @click="closeFloatingMenus">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-top-row">
        <div class="header-left">
          <h1 class="page-title">Thiết lập Mẫu In Báo Giá</h1>
          <p class="page-subtitle">
            Thao tác trực tiếp trên bảng lưới bên trái và đối chiếu kết quả trực quan ngay bên phải
          </p>
        </div>

        <div class="header-actions" v-if="activeTpl">
          <!-- NÚT CHỌN MẪU IN (MỞ MODAL QUẢN LÝ MẪU) -->
          <button class="btn btn-template-picker" @click="showTemplateModal = true" title="Bấm để đổi mẫu in, tạo mẫu mới hoặc import file Excel">
            <span class="picker-label">Mẫu đang chọn:</span>
            <strong class="picker-name">{{ activeTpl.ten_mau || 'Mẫu in' }}</strong>
            <span v-if="activeTpl.mac_dinh" class="picker-default-tag">Mặc định</span>
            <span class="picker-count">({{ templates.length }} mẫu)</span>
          </button>

          <button class="btn btn-indigo" @click="showTokenModal = !showTokenModal">
            <span>Kho Token</span>
          </button>

          <button class="btn btn-blue" @click="showSettingsModal = true">
            <span>Cấu hình Trang &amp; Người lập</span>
          </button>

          <button class="btn btn-secondary" @click="handleRestoreStandardHeader" title="Điền lại khung Header chuẩn vào lưới">
            <span>Khôi phục Header</span>
          </button>

          <button class="btn btn-emerald" @click="handleSaveCurrentTemplate" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span>Lưu Mẫu In</span>
          </button>

          <button class="btn btn-ghost" @click="router.push('/baogiafirebase')">
            <span>Về trang Báo giá</span>
          </button>
        </div>
      </div>

      <!-- THANH SỬA NHANH TÊN MẪU IN & GHI CHÚ MẪU IN -->
      <div v-if="activeTpl" class="header-meta-bar">
        <div class="header-meta-field meta-name-field">
          <label>Tên mẫu in:</label>
          <input
            v-model="activeTpl.ten_mau"
            type="text"
            placeholder="Nhập tên mẫu in..."
            @input="syncActiveMetaToList"
            @keyup.enter="handleSaveCurrentTemplate"
          />
        </div>
        <div class="header-meta-field meta-note-field">
          <label>Ghi chú mẫu in:</label>
          <input
            v-model="activeTpl.ghi_chu"
            type="text"
            placeholder="Nhập ghi chú / mô tả cho mẫu in này..."
            @input="syncActiveMetaToList"
            @keyup.enter="handleSaveCurrentTemplate"
          />
        </div>
        <button
          type="button"
          class="btn btn-emerald header-meta-save-btn"
          :disabled="saving"
          @click="handleSaveCurrentTemplate"
          title="Lưu tên mẫu in, ghi chú và toàn bộ thiết lập hiện tại"
        >
          <span v-if="saving" class="spinner"></span>
          <span>Lưu tên &amp; ghi chú</span>
        </button>
      </div>
    </div>

    <!-- MAIN SPLIT WORKSPACE: GRID (LEFT) & LIVE PREVIEW (RIGHT) -->
    <div v-if="activeTpl" class="split-workspace">
      <!-- ==================== LEFT PANEL: INTERACTIVE GRID OR PARALLEL CODE (HTML/CSS/JS) ==================== -->
      <div class="split-panel split-left-grid">
        <!-- COMPACT RIBBON: MODE SWITCH (THỦ CÔNG / CODE) + CELL STYLING + PAGE SETUP -->
        <div class="grid-ribbon">
          <!-- Mode Switch: Thủ công | Code -->
          <div class="ribbon-mode-switch" title="Chuyển đổi song song giữa Bảng lưới Thủ công và Code (HTML / CSS / JS)">
            <button
              type="button"
              class="mode-switch-btn"
              :class="{ active: editorMode === 'manual' }"
              @click="switchEditorMode('manual')"
            >
              Thủ công
            </button>
            <button
              type="button"
              class="mode-switch-btn"
              :class="{ active: editorMode === 'code' }"
              @click="switchEditorMode('code')"
            >
              Code
            </button>
          </div>

          <div class="ribbon-divider"></div>

          <!-- Page Setup Quick Controls (Available in both Manual & Code modes) -->
          <div class="ribbon-group">
            <span class="ribbon-lbl">Trang:</span>
            <select v-model="activeTpl.cau_hinh_trang.kho_giay" class="ribbon-select" title="Khổ giấy">
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="Letter">Letter</option>
            </select>
            <select v-model="activeTpl.cau_hinh_trang.huong_giay" class="ribbon-select" title="Hướng trang in">
              <option value="landscape">Ngang</option>
              <option value="portrait">Dọc</option>
            </select>
          </div>

          <div class="ribbon-divider"></div>

          <!-- Upload Single Logo via Cloudinary -->
          <div class="ribbon-group">
            <label class="ribbon-btn-sm btn-upload-logo" title="Tải ảnh Logo lên Cloudinary">
              <input type="file" accept="image/*" style="display: none;" @change="handleUploadLogoToCloudinary" />
              <span v-if="uploadingLogo">Đang tải...</span>
              <span v-else>Upload Logo</span>
            </label>
          </div>

          <!-- MANUAL GRID TOOLS -->
          <template v-if="editorMode === 'manual'">
            <div class="ribbon-divider"></div>

            <!-- Font & Size -->
            <div class="ribbon-group">
              <select v-model="currentCellStyle.fontFamily" @change="applyStyleToSelection('fontFamily', currentCellStyle.fontFamily)" class="ribbon-select">
                <option value="Calibri">Calibri</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Roboto">Roboto</option>
                <option value="Segoe UI">Segoe UI</option>
              </select>
              <input
                type="number"
                min="8"
                max="36"
                v-model.number="currentCellStyle.fontSize"
                @change="applyStyleToSelection('fontSize', currentCellStyle.fontSize)"
                class="ribbon-num"
                title="Cỡ chữ (pt)"
              />
            </div>

            <div class="ribbon-divider"></div>

            <!-- Bold, Italic, Underline, Border -->
            <div class="ribbon-group">
              <button class="ribbon-icon-btn" :class="{ active: currentCellStyle.bold }" @click="toggleStyleBool('bold')" title="Chữ đậm (Ctrl+B)">
                <b>B</b>
              </button>
              <button class="ribbon-icon-btn" :class="{ active: currentCellStyle.italic }" @click="toggleStyleBool('italic')" title="Chữ nghiêng (Ctrl+I)">
                <i>I</i>
              </button>
              <button class="ribbon-icon-btn" :class="{ active: currentCellStyle.underline }" @click="toggleStyleBool('underline')" title="Gạch chân (Ctrl+U)">
                <u>U</u>
              </button>
              <button class="ribbon-icon-btn" :class="{ active: currentCellStyle.border }" @click="toggleStyleBool('border')" title="Kẻ khung viền">
                Khung
              </button>
            </div>

            <div class="ribbon-divider"></div>

            <!-- Alignment -->
            <div class="ribbon-group">
              <button class="ribbon-icon-btn" :class="{ active: currentCellStyle.align === 'left' }" @click="applyStyleToSelection('align', 'left')">
                Trái
              </button>
              <button class="ribbon-icon-btn" :class="{ active: currentCellStyle.align === 'center' }" @click="applyStyleToSelection('align', 'center')">
                Giữa
              </button>
              <button class="ribbon-icon-btn" :class="{ active: currentCellStyle.align === 'right' }" @click="applyStyleToSelection('align', 'right')">
                Phải
              </button>
            </div>

            <div class="ribbon-divider"></div>

            <!-- Colors -->
            <div class="ribbon-group">
              <label class="color-picker-label" title="Màu chữ">
                <span>Chữ</span>
                <input type="color" :value="currentCellStyle.color || '#0f172a'" @input="applyStyleToSelection('color', ($event.target as HTMLInputElement).value)" />
              </label>
              <label class="color-picker-label" title="Màu nền ô">
                <span>Nền</span>
                <input type="color" :value="currentCellStyle.bgColor || '#ffffff'" @input="applyStyleToSelection('bgColor', ($event.target as HTMLInputElement).value)" />
              </label>
              <button class="ribbon-btn-sm" @click="applyStyleToSelection('bgColor', undefined)" title="Xóa màu nền">
                Xóa nền
              </button>
            </div>

            <div class="ribbon-divider"></div>

            <!-- Merge / Unmerge & Row/Col -->
            <div class="ribbon-group">
              <button class="ribbon-btn-sm btn-merge" @click="mergeSelectedRange" title="Gộp các ô đang chọn">
                Gộp ô
              </button>
              <button class="ribbon-btn-sm" @click="unmergeAtSelectedCell" title="Bỏ gộp ô">
                Bỏ gộp
              </button>
              <button class="ribbon-btn-sm" @click="insertRowBelowSelected" title="Chèn thêm 1 dòng bên dưới">
                + Dòng
              </button>
              <button class="ribbon-btn-sm" @click="deleteSelectedRow" title="Xóa dòng đang chọn">
                - Dòng
              </button>
              <button class="ribbon-btn-sm" @click="insertColumnLeftSelected" title="Chèn thêm 1 cột vào bên trái cột đang chọn">
                + Cột Trái
              </button>
              <button class="ribbon-btn-sm" @click="insertColumnRightSelected" title="Chèn thêm 1 cột vào bên phải cột đang chọn">
                + Cột Phải
              </button>
              <button class="ribbon-btn-sm" @click="deleteSelectedColumn" title="Xóa cột đang chọn">
                - Cột
              </button>
              <div class="ribbon-divider"></div>
              <span class="ribbon-lbl" :title="`Độ rộng cột ${colIndexToLetter(selCol || 1)} (px) — kéo hoặc nhập 0 để thu về 0`">Rộng {{ colIndexToLetter(selCol || 1) }}:</span>
              <input
                type="number"
                min="0"
                max="600"
                :value="selectedColWidth"
                class="ribbon-num"
                title="Độ rộng cột đang chọn (px) — nhập 0 để thu sát/ẩn cột"
                @input="onSelectedColWidthInput($event)"
              />
              <span class="ribbon-lbl" :title="`Chiều cao dòng ${selRow || 1} (px) — kéo hoặc nhập 0 để thu về 0`">Cao D{{ selRow || 1 }}:</span>
              <input
                type="number"
                min="0"
                max="400"
                :value="selectedRowHeight"
                class="ribbon-num"
                title="Chiều cao dòng đang chọn (px) — nhập 0 để thu sát/ẩn dòng"
                @input="onSelectedRowHeightInput($event)"
              />
            </div>
          </template>

          <!-- PARALLEL CODE STUDIO TOOLS (HTML / CSS / JS) -->
          <template v-else>
            <div class="ribbon-divider"></div>
            <div class="code-lang-tabs">
              <button
                type="button"
                class="code-lang-tab html"
                :class="{ active: codeLangTab === 'html' }"
                @click="switchCodeLangTab('html')"
              >
                HTML
              </button>
              <button
                type="button"
                class="code-lang-tab css"
                :class="{ active: codeLangTab === 'css' }"
                @click="switchCodeLangTab('css')"
              >
                CSS
              </button>
              <button
                type="button"
                class="code-lang-tab js"
                :class="{ active: codeLangTab === 'js' }"
                @click="switchCodeLangTab('js')"
              >
                JS
              </button>
            </div>

            <div class="ribbon-divider"></div>

            <div class="ribbon-group">
              <button
                type="button"
                class="ribbon-btn-sm btn-code-token"
                title="Chèn mã Token vào vị trí con trỏ trong trình soạn thảo Code"
                @click="showTokenModal = true"
              >
                + Chèn Token vào Code
              </button>
              <span class="code-sync-badge">
                Đồng bộ song song với Bảng lưới (Ô đang trỏ: #cell-{{ selectedCellLabel }})
              </span>
              <span v-if="jsRuntimeError" class="code-js-err-badge" :title="jsRuntimeError">
                Lỗi JS: {{ jsRuntimeError }}
              </span>
            </div>
          </template>
        </div>

        <!-- SPREADSHEET GRID CANVAS (SIZED DIRECTLY TO PAGE CONFIG WITHOUT EXTRA WHITESPACE) -->
        <div
          v-show="editorMode === 'manual'"
          ref="gridScrollWrapRef"
          class="paper-canvas-scroll"
          @mouseup="onGridMouseUp"
        >
          <!-- GRID PAPER SHEET MATCHING PAGE CONFIG -->
          <div class="grid-paper-sheet" :style="paperSheetStyle">
            <table class="spreadsheet-table">
              <colgroup>
                <col class="grid-row-heading-col" />
                <col
                  v-for="c in activeTpl.so_cot"
                  :key="'col_'+c"
                  :style="{ width: getColumnWidthPercent(c) + '%' }"
                />
              </colgroup>
              <thead>
                <tr class="grid-col-heading-tr">
                  <th
                    class="grid-corner-th"
                    title="Click để chọn toàn bộ bảng lưới"
                    @mousedown.stop.prevent="selectEntireGrid"
                  >
                    <span>◢</span>
                  </th>
                  <th
                    v-for="c in activeTpl.so_cot"
                    :key="'col_hd_'+c"
                    class="grid-col-heading-th"
                    :class="{
                      isActiveCol: selCol > 0 && c >= normRange.c1 && c <= normRange.c2,
                      isPrimaryCol: selCol === c,
                      isZeroSize: (activeTpl.col_widths[c] ?? 100) <= 0
                    }"
                    :title="`Cột ${colIndexToLetter(c)} (${activeTpl.col_widths[c] ?? 100}px) — Click để chọn cả cột, chuột phải để mở menu cột, kéo mép phải để chỉnh độ rộng (tối thiểu 0px)`"
                    @mousedown.stop.prevent="selectEntireColumn(c, $event)"
                    @contextmenu.prevent="openColContextMenu($event, c)"
                  >
                    <span class="col-heading-letter">{{ colIndexToLetter(c) }}</span>
                    <div
                      class="col-heading-resize-handle"
                      title="Kéo để chỉnh độ rộng cột (có thể kéo về 0px)"
                      @mousedown.stop.prevent="startColResize($event, c)"
                    ></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in activeTpl.so_dong"
                  :key="'row_'+r"
                  :class="[getRowRoleClass(r), { isPreviewRowHighlighted: previewHighlightRow === r }]"
                >
                  <th
                    class="grid-row-heading-th"
                    :class="[
                      getRowRoleClass(r),
                      {
                        isActiveRow: selRow > 0 && r >= normRange.r1 && r <= normRange.r2,
                        isPrimaryRow: selRow === r,
                        isPreviewHighlightRow: previewHighlightRow === r,
                        isZeroSize: (activeTpl.row_heights[r] ?? 26) <= 0
                      }
                    ]"
                    :style="getRowHeadingStyle(r)"
                    :title="getRowHeadingTitle(r)"
                    @mousedown.stop.prevent="selectEntireRow(r, $event)"
                    @contextmenu.prevent="openRowContextMenu($event, r)"
                  >
                    <span class="row-heading-num">{{ r }}</span>
                    <div
                      class="row-heading-resize-handle"
                      title="Kéo để chỉnh chiều cao dòng (có thể kéo về 0px)"
                      @mousedown.stop.prevent="startRowResize($event, r)"
                    ></div>
                  </th>
                  <template v-for="c in activeTpl.so_cot" :key="`cell_${r}_${c}`">
                    <td
                      v-if="!isSecondaryMergedCell(r, c)"
                      :colspan="getCellColspan(r, c)"
                      :data-cell-coord="`${r}_${c}`"
                      class="grid-cell-td"
                      :class="{
                        isSelected: selRow === r && selCol === c,
                        isInRange: isCellInSelectionRange(r, c),
                        isEditing: isEditingCell && selRow === r && selCol === c,
                        isPreviewHighlighted: previewHighlightCoord === `${r}_${c}`,
                        hasToken: cellHasToken(r, c),
                        logoRowBottomLine: isLogoCell(r, c) && activeTpl.cau_hinh_trang?.hien_thi_line_mau
                      }"
                      :style="getComputedCellStyle(r, c)"
                      @mousedown="onCellMouseDown($event, r, c)"
                      @mouseenter="onCellMouseEnter(r, c)"
                      @mouseup="onCellMouseUp(r, c)"
                      @dblclick.stop="startInlineEdit(r, c)"
                      @contextmenu.prevent="openContextMenu($event, r, c)"
                    >
                      <!-- INTERACTIVE SINGLE LOGO CELL WITH DRAG-TO-RESIZE (UP TO 100% FULL WIDTH) & CLOUDINARY UPLOAD -->
                      <div
                        v-if="isLogoCell(r, c)"
                        class="grid-logo-cell-wrap"
                      >
                        <div
                          v-if="activeTpl.cau_hinh_trang?.hien_thi_logo !== false"
                          class="grid-logo-resizable"
                          :style="{
                            width: (activeTpl.cau_hinh_trang.logo_width_pct || 35) + '%',
                            height: (activeTpl.cau_hinh_trang.logo_height || 68) + 'px'
                          }"
                        >
                          <img
                            :src="activeTpl.cau_hinh_trang.logo_url || activeTpl.cau_hinh_trang.logo_trai || '/logo1.png'"
                            alt="Logo"
                            class="grid-logo-img"
                            draggable="false"
                          />
                          <div class="logo-overlay-tools" @mousedown.stop>
                            <label class="logo-upload-mini" title="Tải ảnh Logo mới lên Cloudinary">
                              <input type="file" accept="image/*" style="display: none;" @change="handleUploadLogoToCloudinary" />
                              <span>{{ uploadingLogo ? 'Đang tải...' : 'Đổi Logo' }}</span>
                            </label>
                            <button
                              type="button"
                              class="logo-full-btn"
                              title="Kéo dài Logo 100% Full Width ngang trang"
                              @click.stop="setLogoFullWidth"
                            >
                              Full 100%
                            </button>
                            <span class="logo-size-badge">
                              {{ activeTpl.cau_hinh_trang.logo_width_pct || 35 }}% × {{ activeTpl.cau_hinh_trang.logo_height || 68 }}px
                            </span>
                          </div>
                          <!-- Drag Handles on Logo: Right edge (width), Bottom edge (height), Bottom-Right corner (both) -->
                          <div
                            class="logo-resize-edge-e"
                            title="Kéo ngang để chỉnh độ rộng Logo (tối đa 100% Full Width)"
                            @mousedown.stop.prevent="startLogoResize($event, 'w')"
                          ></div>
                          <div
                            class="logo-resize-edge-s"
                            title="Kéo dọc để chỉnh chiều cao Logo"
                            @mousedown.stop.prevent="startLogoResize($event, 'h')"
                          ></div>
                          <div
                            class="logo-resize-handle"
                            title="Giữ và kéo chuột để chỉnh rộng (Full Width 100%) &amp; cao của Logo"
                            @mousedown.stop.prevent="startLogoResize($event, 'both')"
                          ></div>
                        </div>
                        <div v-else class="logo-hidden-notice">
                          Logo đang ẩn (Bật lại trong Cấu hình Trang)
                        </div>
                      </div>

                      <!-- NORMAL CELL DISPLAY (ALWAYS KEPT IN DOM TO PREVENT ANY ROW HEIGHT JUMP) -->
                      <template v-else>
                        <div
                          class="cell-content-render"
                          :style="getCellContentBoxStyle(r)"
                          v-html="formatCellDisplayHtml(r, c)"
                        ></div>

                        <!-- FLOATING ZOOMED POP-OUT CELL EDITOR (DOES NOT AFFECT TABLE ROW HEIGHT) -->
                        <div
                          v-if="isEditingCell && selRow === r && selCol === c"
                          class="inline-cell-editor-wrap"
                          :class="{ alignRightEdge: isRightHalfCol(r, c) }"
                          @mousedown.stop
                          @click.stop
                        >
                          <div class="inline-editor-topbar">
                            <span class="inline-editor-coord">Ô {{ cellCoordToAddress(r, c) }} (D{{ r }}:C{{ c }})</span>
                            <div class="inline-editor-actions">
                              <button
                                type="button"
                                class="inline-editor-act-btn token"
                                @mousedown.prevent="openTokenTableModal"
                              >
                                + Token
                              </button>
                              <button
                                type="button"
                                class="inline-editor-act-btn cancel"
                                title="Đóng hộp thoại và hủy chọn ô"
                                @mousedown.prevent="cancelCellSelection"
                              >
                                Hủy chọn
                              </button>
                              <button
                                type="button"
                                class="inline-editor-act-btn done"
                                @mousedown.prevent="finishInlineEdit"
                              >
                                Xong
                              </button>
                            </div>
                          </div>
                          <textarea
                            ref="inlineCellInputRef"
                            v-model="currentCellValue"
                            class="inline-cell-textarea"
                            :style="getInlineEditorStyle(r, c)"
                            placeholder="Nhập nội dung hoặc gõ {{ để chèn Token..."
                            @input="onInlineEditorInput($event)"
                            @keydown="onInlineEditorKeydown($event)"
                            @blur="onInlineEditorBlur"
                          ></textarea>

                          <!-- INLINE TOKEN AUTOCOMPLETE DROPDOWN WHEN TYPING {{ OR CLICKING + TOKEN -->
                          <div v-if="inlineTokenSuggest.visible" class="inline-token-dropdown" @mousedown.stop @click.stop>
                            <div class="inline-tk-head">
                              <span>Chọn Token để chèn:</span>
                              <input
                                v-model="inlineTokenSuggest.query"
                                type="text"
                                placeholder="Tìm nhanh token..."
                                class="inline-tk-search"
                                @keydown.stop="onInlineTokenSearchKeydown($event)"
                              />
                            </div>
                            <div class="inline-tk-list">
                              <div
                                v-for="(tk, idx) in filteredInlineTokens"
                                :key="tk.token"
                                class="inline-tk-item"
                                :class="{ active: idx === inlineTokenSuggest.activeIndex }"
                                @mousedown.prevent="pickInlineToken(tk)"
                              >
                                <code>{{ tk.token }}</code>
                                <span class="inline-tk-lbl">{{ tk.label }}</span>
                              </div>
                              <div v-if="filteredInlineTokens.length === 0" class="inline-tk-empty">
                                Không tìm thấy token phù hợp
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Direct Column Width & Row Height Drag Handles on Cell Borders -->
                      <div
                        class="cell-col-resize-handle"
                        title="Kéo mép dọc để chỉnh độ rộng cột"
                        @mousedown.stop.prevent="startColResize($event, c + getCellColspan(r, c) - 1)"
                      ></div>
                      <div
                        class="cell-row-resize-handle"
                        title="Kéo mép ngang để chỉnh chiều cao dòng"
                        @mousedown.stop.prevent="startRowResize($event, r)"
                      ></div>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PARALLEL CODE STUDIO EDITOR (HTML / CSS / JS) -->
        <div v-show="editorMode === 'code'" class="code-studio-container">
          <div class="code-studio-info-bar">
            <span v-if="codeLangTab === 'html'">
              <strong>HTML (Đồng bộ 2 chiều):</strong> Chỉnh sửa trực tiếp thẻ <code>&lt;tr&gt;</code>, <code>&lt;td id="cell-A1"&gt;</code>, <code>colspan</code>, <code>style</code> hoặc mã <code>&#123;&#123;TOKEN&#125;&#125;</code> — Bảng lưới và Xem trước sẽ cập nhật song song.
            </span>
            <span v-else-if="codeLangTab === 'css'">
              <strong>CSS (Đồng bộ 2 chiều):</strong> Chỉnh <code>col[data-col]</code>, <code>tr[data-row]</code>, <code>#cell-A1</code> hoặc viết thêm CSS tùy chỉnh ở mục 2 bên dưới.
            </span>
            <span v-else>
              <strong>JavaScript (Chạy trực tiếp trên tờ báo giá):</strong> Sử dụng biến <code>sheet</code> (DOM tờ in), <code>ctx</code> (dữ liệu báo giá), <code>tpl</code> (cấu hình mẫu).
            </span>
          </div>

          <div class="code-editor-body">
            <div ref="codeGutterRef" class="code-line-gutter">
              <div
                v-for="ln in currentCodeLineCount"
                :key="'ln_' + ln"
                class="code-line-num"
              >
                {{ ln }}
              </div>
            </div>
            <textarea
              ref="codeTextareaRef"
              :value="currentCodeText"
              class="code-studio-textarea"
              spellcheck="false"
              autocapitalize="off"
              autocomplete="off"
              @input="onCodeTextareaInput($event)"
              @scroll="onCodeTextareaScroll($event)"
              @keydown="onCodeTextareaKeydown($event)"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- ==================== RIGHT PANEL: LIVE PREVIEW ==================== -->
      <div class="split-panel split-right-preview">
        <div class="preview-ribbon">
          <div class="preview-ribbon-left">
            <span class="preview-title-tag">Xem trước trực tiếp ({{ activeTpl.cau_hinh_trang.kho_giay }} - {{ activeTpl.cau_hinh_trang.huong_giay === 'portrait' ? 'Dọc' : 'Ngang' }})</span>
            <select v-model="previewCurrency" class="ribbon-select">
              <option value="VND">Tiền tệ: VND</option>
              <option value="USD">Tiền tệ: USD</option>
            </select>
          </div>
          <div class="preview-export-btns">
            <button class="ribbon-btn-sm btn-export-xlsx" @click="handleTestExport('excel')">
              Xuất Excel
            </button>
            <button class="ribbon-btn-sm btn-export-word" @click="handleTestExport('word')">
              Xuất Word (.doc)
            </button>
            <button class="ribbon-btn-sm btn-export-pdf" @click="handleTestExport('pdf')">
              In / PDF
            </button>
            <button class="ribbon-btn-sm btn-export-png" @click="handleTestExport('png')">
              Xuất PNG
            </button>
            <button class="ribbon-btn-sm" @click="handleTestExport('html')">
              Xuất HTML
            </button>
          </div>
        </div>

        <div class="paper-canvas-scroll">
          <div
            ref="previewSheetRef"
            class="preview-paper-sheet"
            :style="paperSheetOuterStyle"
            @click="onPreviewSheetClick($event)"
            @dblclick="onPreviewSheetDblClick($event)"
            v-html="livePreviewHtml"
          ></div>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL 1: CHỌN & QUẢN LÝ MẪU IN ==================== -->
    <div v-if="showTemplateModal && activeTpl" class="studio-modal-backdrop" @click.self="showTemplateModal = false">
      <div class="studio-modal modal-lg">
        <div class="modal-head">
          <div>
            <h3>Chọn &amp; Quản lý Mẫu In Báo Giá</h3>
            <p>Chọn mẫu đang có, sửa tên &amp; ghi chú mẫu in, tạo mẫu mới hoặc tải lên file Excel (.xlsx)</p>
          </div>
          <div class="modal-head-actions">
            <button
              type="button"
              class="btn btn-emerald"
              :disabled="saving"
              @click="handleSaveCurrentTemplate"
            >
              <span v-if="saving" class="spinner"></span>
              <span>Lưu Mẫu In</span>
            </button>
            <button class="modal-close-btn" @click="showTemplateModal = false">Đóng</button>
          </div>
        </div>

        <div class="modal-body">
          <!-- Thông tin mẫu đang chọn -->
          <div class="current-tpl-edit-box">
            <div class="form-field">
              <label>Tên mẫu đang chọn</label>
              <input
                v-model="activeTpl.ten_mau"
                type="text"
                placeholder="Nhập tên mẫu in..."
                @input="syncActiveMetaToList"
                @keyup.enter="handleSaveCurrentTemplate"
              />
            </div>
            <div class="form-field">
              <label>Ghi chú / Mô tả mẫu</label>
              <input
                v-model="activeTpl.ghi_chu"
                type="text"
                placeholder="Mô tả ngắn..."
                @input="syncActiveMetaToList"
                @keyup.enter="handleSaveCurrentTemplate"
              />
            </div>
            <div class="current-tpl-save-col">
              <button
                type="button"
                class="btn btn-emerald current-tpl-save-btn"
                :disabled="saving"
                @click="handleSaveCurrentTemplate"
              >
                <span v-if="saving" class="spinner"></span>
                <span>Lưu tên &amp; ghi chú</span>
              </button>
            </div>
          </div>

          <!-- Thanh công cụ tạo mới / Import mẫu -->
          <div class="modal-tpl-toolbar">
            <button class="btn btn-emerald" @click="handleCreateStarterTemplate">
              + Tạo mẫu chuẩn NTS
            </button>
            <button class="btn btn-indigo" @click="handleCreateDealRegTemplate">
              + Tạo mẫu DealReg
            </button>
            <button class="btn btn-blue" @click="handleCreateBlankTemplate">
              + Tạo mẫu tự thiết kế
            </button>
            <label class="btn btn-amber" style="cursor: pointer; margin: 0;">
              <input type="file" accept=".xlsx" multiple style="display: none;" @change="handleImportExcelFiles" />
              <span>Import file .xlsx</span>
            </label>
            <button class="btn btn-secondary" @click="loadTemplates(true)" :disabled="loading">
              <span>Đồng bộ danh sách</span>
            </button>
          </div>

          <!-- Danh sách các mẫu in -->
          <div class="modal-templates-grid">
            <div
              v-for="tpl in templates"
              :key="tpl.id"
              class="tpl-card"
              :class="{ active: activeTpl && activeTpl.id === tpl.id, isDefault: tpl.mac_dinh }"
              @click="handleSelectCardInModal(tpl)"
            >
              <div class="tpl-card-top">
                <span class="tpl-type-badge" :class="tpl.loai_mau">
                  {{ tpl.loai_mau === 'imported_excel' ? 'Excel Import' : 'Web Studio' }}
                </span>
                <span v-if="tpl.mac_dinh" class="tpl-default-badge">Mặc định</span>
              </div>

              <!-- Chế độ sửa trực tiếp Tên & Ghi chú trên thẻ mẫu in -->
              <div v-if="editingCardId === tpl.id" class="tpl-card-inline-edit" @click.stop>
                <div class="form-field">
                  <label>Tên mẫu in</label>
                  <input
                    v-model="editCardName"
                    type="text"
                    placeholder="Nhập tên mẫu in..."
                    @keyup.enter="saveCardMeta(tpl)"
                  />
                </div>
                <div class="form-field">
                  <label>Ghi chú mẫu in</label>
                  <input
                    v-model="editCardNote"
                    type="text"
                    placeholder="Nhập ghi chú mẫu in..."
                    @keyup.enter="saveCardMeta(tpl)"
                  />
                </div>
                <div class="tpl-card-inline-actions">
                  <button
                    type="button"
                    class="mini-btn mini-save"
                    :disabled="saving"
                    @click="saveCardMeta(tpl)"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    class="mini-btn"
                    @click="cancelEditCardMeta"
                  >
                    Hủy
                  </button>
                </div>
              </div>

              <template v-else>
                <div class="tpl-card-name">{{ tpl.ten_mau }}</div>
                <div class="tpl-card-meta">
                  <span>{{ tpl.so_dong }} dòng x {{ tpl.so_cot }} cột</span>
                  <span>• {{ tpl.cau_hinh_trang?.kho_giay || 'A4' }} ({{ tpl.cau_hinh_trang?.huong_giay === 'portrait' ? 'Dọc' : 'Ngang' }})</span>
                </div>
                <div class="tpl-card-note" v-if="tpl.ghi_chu">{{ tpl.ghi_chu }}</div>
                <div class="tpl-card-note tpl-card-note-empty" v-else>Chưa có ghi chú mẫu in</div>
              </template>

              <div class="tpl-card-actions" @click.stop>
                <button
                  class="mini-btn mini-edit"
                  @click="startEditCardMeta(tpl)"
                >
                  Sửa tên / ghi chú
                </button>
                <button
                  v-if="!tpl.mac_dinh"
                  class="mini-btn mini-star"
                  @click="handleSetDefault(tpl)"
                >
                  Đặt mặc định
                </button>
                <button class="mini-btn" @click="handleDuplicate(tpl)">
                  Nhân bản
                </button>
                <button
                  v-if="tpl.link_file_goc"
                  class="mini-btn"
                  @click="handleDownloadOriginal(tpl)"
                >
                  File gốc
                </button>
                <button
                  v-if="templates.length > 1"
                  class="mini-btn mini-danger"
                  @click="handleDeleteTemplate(tpl)"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL 2: CẤU HÌNH TRANG IN, LOGO CLOUDINARY & NGƯỜI LẬP ==================== -->
    <div v-if="showSettingsModal && activeTpl" class="studio-modal-backdrop" @click.self="showSettingsModal = false">
      <div class="studio-modal modal-lg">
        <div class="modal-head">
          <div>
            <h3>Cấu hình Trang in, Logo &amp; Thông tin Người lập</h3>
            <p>Mọi thay đổi sẽ tự động cập nhật trực tiếp lên Bảng lưới và Khung xem trước</p>
          </div>
          <div class="modal-head-actions">
            <button
              type="button"
              class="btn btn-emerald"
              :disabled="saving"
              @click="handleSaveCurrentTemplate"
            >
              <span v-if="saving" class="spinner"></span>
              <span>Lưu Mẫu In</span>
            </button>
            <button class="modal-close-btn" @click="showSettingsModal = false">Đóng</button>
          </div>
        </div>

        <div class="modal-body">
          <div class="settings-grid">
            <!-- CARD 1: KHỔ GIẤY & LOGO CLOUDINARY -->
            <div class="settings-card">
              <h4>Thông tin Mẫu in, Trang in &amp; Logo Công ty</h4>
              <div class="form-row-2">
                <div class="form-field">
                  <label>Tên mẫu in</label>
                  <input
                    v-model="activeTpl.ten_mau"
                    type="text"
                    placeholder="Nhập tên mẫu in..."
                    @input="syncActiveMetaToList"
                    @keyup.enter="handleSaveCurrentTemplate"
                  />
                </div>
                <div class="form-field">
                  <label>Ghi chú / Mô tả mẫu in</label>
                  <input
                    v-model="activeTpl.ghi_chu"
                    type="text"
                    placeholder="Nhập ghi chú mẫu in..."
                    @input="syncActiveMetaToList"
                    @keyup.enter="handleSaveCurrentTemplate"
                  />
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-field">
                  <label>Khổ giấy</label>
                  <select v-model="activeTpl.cau_hinh_trang.kho_giay">
                    <option value="A4">A4 (Chuẩn)</option>
                    <option value="A3">A3</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Hướng giấy</label>
                  <select v-model="activeTpl.cau_hinh_trang.huong_giay">
                    <option value="landscape">Ngang (Landscape)</option>
                    <option value="portrait">Dọc (Portrait)</option>
                  </select>
                </div>
              </div>

              <div class="form-row-3">
                <div class="form-field">
                  <label>Font mặc định</label>
                  <select v-model="activeTpl.cau_hinh_trang.font_mac_dinh">
                    <option value="Calibri">Calibri</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Cỡ chữ chuẩn (pt)</label>
                  <input type="number" v-model.number="activeTpl.cau_hinh_trang.co_chu_mac_dinh" min="8" max="18" />
                </div>
                <div class="form-field">
                  <label>Lề trang (px)</label>
                  <input type="number" v-model.number="activeTpl.cau_hinh_trang.padding_trang" min="8" max="60" />
                </div>
              </div>

              <div class="form-row-2" style="margin-top: 10px;">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="activeTpl.cau_hinh_trang.hien_thi_logo" />
                  Hiển thị Logo công ty (<code>&#123;&#123;LOGO&#125;&#125;</code>)
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="activeTpl.cau_hinh_trang.hien_thi_line_mau" />
                  Hiển thị đường kẻ màu thương hiệu dưới Logo
                </label>
              </div>

              <!-- UPLOAD 1 LOGO LÊN CLOUDINARY -->
              <div class="logo-upload-card" v-if="activeTpl.cau_hinh_trang.hien_thi_logo">
                <div class="logo-upload-preview">
                  <img
                    :src="activeTpl.cau_hinh_trang.logo_url || activeTpl.cau_hinh_trang.logo_trai || '/logo1.png'"
                    alt="Logo hiện tại"
                  />
                </div>
                <div class="logo-upload-controls">
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <label class="btn btn-amber" style="cursor: pointer; margin: 0;">
                      <input type="file" accept="image/*" style="display: none;" @change="handleUploadLogoToCloudinary" />
                      <span v-if="uploadingLogo">Đang tải lên Cloudinary...</span>
                      <span v-else>Tải Logo mới lên (Cloudinary)</span>
                    </label>
                    <button type="button" class="btn btn-blue" @click="setLogoFullWidth">
                      Full Width 100%
                    </button>
                  </div>
                  <div class="logo-width-field">
                    <label>Độ rộng Logo (% trang, tối đa 100%):</label>
                    <input
                      type="number"
                      v-model.number="activeTpl.cau_hinh_trang.logo_width_pct"
                      min="5"
                      max="100"
                    />
                  </div>
                  <div class="logo-width-field">
                    <label>Chiều cao Logo (px):</label>
                    <input
                      type="number"
                      v-model.number="activeTpl.cau_hinh_trang.logo_height"
                      min="24"
                      max="500"
                    />
                  </div>
                </div>
              </div>

              <div class="form-field" style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed rgba(255,255,255,0.1);">
                <label>Cập nhật lưới từ file Excel (.xlsx) khác:</label>
                <div>
                  <label class="btn btn-secondary" style="cursor: pointer; margin: 0;">
                    <input type="file" accept=".xlsx" style="display: none;" @change="handleReplaceExcelForCurrentTemplate" />
                    Chọn file .xlsx để nạp lại cấu trúc
                  </label>
                </div>
              </div>
            </div>

            <!-- CARD 2: THÔNG TIN NGƯỜI LẬP & CÔNG TY PHÁT HÀNH -->
            <div class="settings-card">
              <h4>Thông tin Người lập &amp; Công ty phát hành</h4>
              <div class="form-row-2">
                <div class="form-field">
                  <label>Tên người lập (<code>&#123;&#123;NGUOI_LAP&#125;&#125;</code>)</label>
                  <input type="text" v-model="activeTpl.thong_tin_nguoi_lap.ten_nguoi_lap" />
                </div>
                <div class="form-field">
                  <label>Chức vụ (<code>&#123;&#123;CHUC_VU_NGUOI_LAP&#125;&#125;</code>)</label>
                  <input type="text" v-model="activeTpl.thong_tin_nguoi_lap.chuc_vu" />
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-field">
                  <label>Số điện thoại (<code>&#123;&#123;SDT_NGUOI_LAP&#125;&#125;</code>)</label>
                  <input type="text" v-model="activeTpl.thong_tin_nguoi_lap.so_dien_thoai" />
                </div>
                <div class="form-field">
                  <label>Email (<code>&#123;&#123;EMAIL_NGUOI_LAP&#125;&#125;</code>)</label>
                  <input type="text" v-model="activeTpl.thong_tin_nguoi_lap.email" />
                </div>
              </div>
              <div class="form-field">
                <label>Tên công ty phát hành (<code>&#123;&#123;TEN_CONG_TY_BAN&#125;&#125;</code>)</label>
                <input type="text" v-model="activeTpl.thong_tin_nguoi_lap.ten_cong_ty_ban" />
              </div>
              <div class="form-field">
                <label>Địa chỉ công ty phát hành (<code>&#123;&#123;DIA_CHI_CONG_TY_BAN&#125;&#125;</code>)</label>
                <input type="text" v-model="activeTpl.thong_tin_nguoi_lap.dia_chi_cong_ty_ban" />
              </div>
              <div class="form-field">
                <label>Hiệu lực báo giá mặc định (<code>&#123;&#123;HIEU_LUC_BAO_GIA&#125;&#125;</code>)</label>
                <input type="text" v-model="activeTpl.thong_tin_nguoi_lap.hieu_luc_bao_gia" placeholder="VD: 15 ngày" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL 3: BẢNG DANH MỤC TOÀN BỘ TOKEN BÁO GIÁ ==================== -->
    <div v-if="showTokenModal && activeTpl" class="studio-modal-backdrop" @click.self="showTokenModal = false">
      <div class="studio-modal modal-token-xl" @click.stop>
        <div class="modal-head">
          <div>
            <h3>Danh mục Kho Token Báo Giá ({{ AVAILABLE_TOKENS.length }} Token)</h3>
            <p>
              Đang chọn: <strong>Ô Dòng {{ selRow }}, Cột {{ selCol }}</strong> — Bấm vào dòng bất kỳ hoặc nút <strong>"+ Chèn vào ô"</strong> để gắn Token.
            </p>
          </div>
          <button class="modal-close-btn" @click="showTokenModal = false">Đóng</button>
        </div>

        <div class="token-modal-toolbar">
          <input
            v-model="tokenSearch"
            type="text"
            placeholder="Tìm nhanh theo mã Token, tên hiển thị hoặc dữ liệu mẫu..."
            class="token-modal-search"
          />

          <div class="token-group-filter-pills">
            <button
              type="button"
              class="tk-filter-pill"
              :class="{ active: tokenGroupFilter === 'all' }"
              @click="tokenGroupFilter = 'all'"
            >
              Tất cả ({{ AVAILABLE_TOKENS.length }})
            </button>
            <button
              v-for="g in TOKEN_GROUPS"
              :key="g.id"
              type="button"
              class="tk-filter-pill"
              :class="{ active: tokenGroupFilter === g.id }"
              @click="tokenGroupFilter = g.id"
            >
              {{ g.label }}
            </button>
          </div>

          <div class="insert-mode-switch">
            <label :class="{ active: tokenInsertMode === 'append' }">
              <input type="radio" value="append" v-model="tokenInsertMode" />
              Nối thêm vào ô
            </label>
            <label :class="{ active: tokenInsertMode === 'replace' }">
              <input type="radio" value="replace" v-model="tokenInsertMode" />
              Ghi đè toàn bộ ô
            </label>
          </div>
        </div>

        <div class="modal-body token-modal-body">
          <div
            v-for="(grp, gIdx) in filteredTokenGroups"
            :key="grp.id"
            class="token-table-section"
          >
            <div class="token-section-banner" :style="{ borderLeftColor: grp.color }">
              <div class="token-section-title">
                {{ gIdx + 1 }}. {{ grp.label }} ({{ grp.tokens.length }} token)
              </div>
              <div class="token-section-desc">{{ grp.desc }}</div>
            </div>

            <div class="token-table-wrap">
              <table class="token-catalog-table">
                <thead>
                  <tr>
                    <th style="width: 52px; text-align: center;">STT</th>
                    <th style="width: 220px;">Token</th>
                    <th style="width: 250px;">Tên hiển thị</th>
                    <th>Dữ liệu mẫu</th>
                    <th style="width: 150px; text-align: right;">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="tk in grp.tokens"
                    :key="tk.token"
                    class="token-catalog-row"
                    @click="insertTokenFromModal(tk)"
                  >
                    <td style="text-align: center; color: #94a3b8; font-weight: 600;">
                      {{ tk.globalIndex }}
                    </td>
                    <td>
                      <code class="token-code-badge" :style="{ color: grp.color, borderColor: grp.color + '55' }">
                        {{ tk.token }}
                      </code>
                    </td>
                    <td class="token-col-label">{{ tk.label }}</td>
                    <td class="token-col-sample">{{ tk.sample }}</td>
                    <td style="text-align: right;" @click.stop>
                      <div class="token-row-actions">
                        <button
                          type="button"
                          class="btn-insert-token"
                          @click="insertTokenFromModal(tk)"
                        >
                          + Chèn vào ô
                        </button>
                        <button
                          type="button"
                          class="copy-tk-btn"
                          @click="copyTokenToClipboard(tk.token)"
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="filteredTokenGroups.length === 0" class="token-empty-state">
            Không tìm thấy Token nào khớp với từ khóa "{{ tokenSearch }}".
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== EXCEL-LIKE RIGHT-CLICK CONTEXT MENU DIRECTLY ON GRID ==================== -->
    <div
      v-if="contextMenu.visible && activeTpl"
      class="grid-context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
    >
      <!-- Quick Format Row -->
      <div class="ctx-quick-styles">
        <button :class="{ active: currentCellStyle.bold }" @click="toggleStyleBool('bold')" title="Đậm (Ctrl+B)"><b>B</b></button>
        <button :class="{ active: currentCellStyle.italic }" @click="toggleStyleBool('italic')" title="Nghiêng (Ctrl+I)"><i>I</i></button>
        <button :class="{ active: currentCellStyle.underline }" @click="toggleStyleBool('underline')" title="Gạch chân (Ctrl+U)"><u>U</u></button>
        <button :class="{ active: currentCellStyle.border }" @click="toggleStyleBool('border')" title="Kẻ khung">Khung</button>
        <button :class="{ active: currentCellStyle.align === 'left' }" @click="applyStyleToSelection('align', 'left')">Trái</button>
        <button :class="{ active: currentCellStyle.align === 'center' }" @click="applyStyleToSelection('align', 'center')">Giữa</button>
        <button :class="{ active: currentCellStyle.align === 'right' }" @click="applyStyleToSelection('align', 'right')">Phải</button>
      </div>

      <!-- Quick Color Swatches -->
      <div class="ctx-color-row">
        <span>Màu nền:</span>
        <div class="ctx-swatches">
          <button class="swatch" style="background: #ffffff;" @click="applyStyleToSelection('bgColor', undefined)" title="Không màu"></button>
          <button class="swatch" style="background: #0070c0;" @click="applyStyleToSelection('bgColor', '#0070c0'); applyStyleToSelection('color', '#ffffff')" title="Xanh chuẩn NTS"></button>
          <button class="swatch" style="background: #d9e1f2;" @click="applyStyleToSelection('bgColor', '#d9e1f2'); applyStyleToSelection('color', '#0f172a')" title="Xanh nhạt nhóm"></button>
          <button class="swatch" style="background: #fadb14;" @click="applyStyleToSelection('bgColor', '#fadb14'); applyStyleToSelection('color', '#0f172a')" title="Vàng tổng cộng"></button>
          <button class="swatch" style="background: #dcfce7;" @click="applyStyleToSelection('bgColor', '#dcfce7'); applyStyleToSelection('color', '#14532d')" title="Xanh lá nhạt"></button>
          <button class="swatch" style="background: #fee2e2;" @click="applyStyleToSelection('bgColor', '#fee2e2'); applyStyleToSelection('color', '#991b1b')" title="Đỏ nhạt"></button>
        </div>
      </div>

      <div class="ctx-divider"></div>

      <button class="ctx-item" @click="startInlineEdit(selRow, selCol); closeFloatingMenus()">
        <span>Sửa trực tiếp nội dung ô</span>
        <kbd>F2 / Click đúp</kbd>
      </button>
      <button class="ctx-item" @click="openInlineTokenPickerAtCell(selRow, selCol)">
        <span>Chèn mã Token vào ô này...</span>
        <kbd>&#123;&#123;...&#125;&#125;</kbd>
      </button>

      <div class="ctx-divider"></div>

      <button class="ctx-item" @click="mergeSelectedRange(); closeFloatingMenus()">
        <span>Gộp các ô đang chọn (Merge)</span>
      </button>
      <button class="ctx-item" @click="unmergeAtSelectedCell(); closeFloatingMenus()">
        <span>Bỏ gộp ô (Unmerge)</span>
      </button>

      <div class="ctx-divider"></div>

      <div class="ctx-sub-label">Gán vai trò cho Dòng {{ selRow }}:</div>
      <div class="ctx-role-grid">
        <button :class="{ active: activeTpl.mapping_vung.dong_tieu_de_bang === selRow }" @click="activeTpl.mapping_vung.dong_tieu_de_bang = selRow; closeFloatingMenus()">
          Tiêu đề bảng
        </button>
        <button :class="{ active: activeTpl.mapping_vung.dong_mau_nhom === selRow }" @click="toggleGroupRowRole(selRow); closeFloatingMenus()">
          Dòng Nhóm lặp
        </button>
        <button :class="{ active: activeTpl.mapping_vung.dong_mau_san_pham === selRow }" @click="activeTpl.mapping_vung.dong_mau_san_pham = selRow; closeFloatingMenus()">
          Dòng SP lặp
        </button>
        <button :class="{ active: activeTpl.mapping_vung.danh_sach_dong_tong?.includes(selRow) }" @click="activeTpl.mapping_vung.danh_sach_dong_tong = [selRow]; closeFloatingMenus()">
          Dòng Tổng
        </button>
        <button :class="{ active: activeTpl.mapping_vung.dong_dieu_khoan === selRow }" @click="setTermsRowRole(selRow); closeFloatingMenus()">
          Điều khoản
        </button>
        <button :class="{ active: activeTpl.mapping_vung.dong_chu_ky === selRow }" @click="activeTpl.mapping_vung.dong_chu_ky = selRow; closeFloatingMenus()">
          Chữ ký
        </button>
      </div>

      <div class="ctx-divider"></div>

      <button class="ctx-item" @click="insertRowAboveSelected(); closeFloatingMenus()">
        <span>Chèn 1 dòng phía trên</span>
      </button>
      <button class="ctx-item" @click="insertRowBelowSelected(); closeFloatingMenus()">
        <span>Chèn 1 dòng phía dưới</span>
      </button>
      <button class="ctx-item" @click="duplicateSelectedRow(); closeFloatingMenus()">
        <span>Nhân bản dòng này</span>
      </button>
      <button class="ctx-item danger" @click="deleteSelectedRow(); closeFloatingMenus()">
        <span>Xóa dòng này</span>
      </button>

      <div class="ctx-divider"></div>

      <button class="ctx-item" @click="insertColumnLeftSelected(); closeFloatingMenus()">
        <span>Chèn 1 cột bên trái (Cột {{ colIndexToLetter(selCol || 1) }})</span>
      </button>
      <button class="ctx-item" @click="insertColumnRightSelected(); closeFloatingMenus()">
        <span>Chèn 1 cột bên phải (Cột {{ colIndexToLetter(selCol || 1) }})</span>
      </button>
      <button class="ctx-item danger" @click="deleteSelectedColumn(); closeFloatingMenus()">
        <span>Xóa cột {{ colIndexToLetter(selCol || 1) }}</span>
      </button>

      <div class="ctx-divider"></div>

      <button class="ctx-item" @click="copySelectedCell(); closeFloatingMenus()">
        <span>Sao chép ô</span>
        <kbd>Ctrl+C</kbd>
      </button>
      <button class="ctx-item" :disabled="!clipboardCell" @click="pasteToSelectedCells(); closeFloatingMenus()">
        <span>Dán vào vùng chọn</span>
        <kbd>Ctrl+V</kbd>
      </button>
      <button class="ctx-item danger" @click="clearSelectedRangeContent(); closeFloatingMenus()">
        <span>Xóa nội dung vùng chọn</span>
        <kbd>Delete</kbd>
      </button>
    </div>

    <!-- TOAST NOTIFICATION -->
    <Transition name="fade">
      <div v-if="toastMsg" class="studio-toast">
        {{ toastMsg }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  TOKEN_GROUPS,
  AVAILABLE_TOKENS,
  colIndexToLetter,
  cellCoordToAddress,
  createStarterTemplateConfig,
  createBlankTemplateConfig,
  createDealRegTemplateConfig,
  ensureGridHeaderPopulated,
  parseExcelBufferToTemplateConfig,
  fetchAndSyncPrintTemplates,
  savePrintTemplateToFirebase,
  setDefaultPrintTemplateInFirebase,
  deletePrintTemplateFromFirebase,
  createMockQuoteContext,
  renderTemplateToHtml,
  serializeTemplateToCode,
  applyHtmlCodeToTemplate,
  applyCssCodeToTemplate,
  runTemplateCustomJs,
  generateExcelBlobFromTemplate,
  exportPdfOrPrintFromTemplate,
  exportPngFromTemplate,
  exportHtmlFileFromTemplate,
  exportWordFromTemplate,
  deliverExportedFile,
  type PrintTemplateConfig,
  type GridCellStyle,
  type GridCellData,
  type TokenDef
} from '../utils/printTemplateEngine'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const uploadingLogo = ref(false)
const templates = ref<PrintTemplateConfig[]>([])
const activeTpl = ref<PrintTemplateConfig | null>(null)

// Editor mode: 'manual' (Visual Grid) | 'code' (Parallel HTML / CSS / JS)
const editorMode = ref<'manual' | 'code'>('manual')
const codeLangTab = ref<'html' | 'css' | 'js'>('html')
const codeHtmlText = ref('')
const codeCssText = ref('')
const codeJsText = ref('')
const jsRuntimeError = ref<string | null>(null)
const isUpdatingFromCode = ref(false)

// Modals state
const showTemplateModal = ref(false)
const showSettingsModal = ref(false)
const showTokenModal = ref(false)

// Selection & Excel-like interaction state in Visual Grid
const selRow = ref(1)
const selCol = ref(1)
const selEndRow = ref(1)
const selEndCol = ref(1)
const isDraggingSelection = ref(false)
const isEditingCell = ref(false)
const previewHighlightCoord = ref('1_1')
const previewHighlightRow = ref(1)

const tokenInsertMode = ref<'append' | 'replace'>('append')
const tokenSearch = ref('')
const tokenGroupFilter = ref<'all' | TokenDef['group']>('all')
const previewCurrency = ref<'VND' | 'USD'>('VND')
const toastMsg = ref('')

const inlineCellInputRef = ref<HTMLTextAreaElement[] | HTMLTextAreaElement | null>(null)
const gridScrollWrapRef = ref<HTMLElement | null>(null)
const codeTextareaRef = ref<HTMLTextAreaElement | null>(null)
const codeGutterRef = ref<HTMLElement | null>(null)
const previewSheetRef = ref<HTMLElement | null>(null)

// Clipboard for Ctrl+C / Ctrl+V
const clipboardCell = ref<GridCellData | null>(null)

// Inline Token Autocomplete inside cell
const inlineTokenSuggest = reactive({
  visible: false,
  query: '',
  activeIndex: 0
})

// Right-click Context Menu state
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0
})

// Column / Row / Logo Drag Resize state
const resizeState = reactive<{
  type: 'col' | 'row' | 'logo' | null
  logoAxis: 'w' | 'h' | 'both'
  index: number
  startPos: number
  startPosY: number
  startSize: number
  startHeight: number
  containerWidth: number
}>({
  type: null,
  logoAxis: 'both',
  index: 0,
  startPos: 0,
  startPosY: 0,
  startSize: 0,
  startHeight: 68,
  containerWidth: 700
})

function showToast(msg: string) {
  toastMsg.value = msg
  setTimeout(() => {
    if (toastMsg.value === msg) toastMsg.value = ''
  }, 2600)
}

function closeFloatingMenus() {
  contextMenu.visible = false
  inlineTokenSuggest.visible = false
}

// Compute paper sheet dimensions based on page setup (`kho_giay`, `huong_giay`, `padding_trang`)
const paperMaxWidthPx = computed(() => {
  const cfg = activeTpl.value?.cau_hinh_trang
  const isPortrait = cfg?.huong_giay === 'portrait'
  const paper = cfg?.kho_giay || 'A4'
  if (paper === 'A3') return isPortrait ? '960px' : '100%'
  if (paper === 'Letter') return isPortrait ? '840px' : '100%'
  return isPortrait ? '840px' : '100%'
})

const paperSheetStyle = computed(() => {
  const cfg = activeTpl.value?.cau_hinh_trang
  return {
    maxWidth: paperMaxWidthPx.value,
    width: '100%',
    overflowX: 'hidden' as const,
    boxSizing: 'border-box' as const,
    padding: `${cfg?.padding_trang ?? 14}px`,
    fontFamily: cfg?.font_mac_dinh || 'Arial, Calibri, sans-serif',
    fontSize: `${cfg?.co_chu_mac_dinh || 10}pt`
  }
})

const paperSheetOuterStyle = computed(() => ({
  maxWidth: paperMaxWidthPx.value,
  width: '100%',
  overflowX: 'hidden' as const,
  boxSizing: 'border-box' as const
}))

const totalGridColWidths = computed(() => {
  if (!activeTpl.value) return 1000
  let sum = 0
  for (let c = 1; c <= activeTpl.value.so_cot; c++) {
    sum += Math.max(0, activeTpl.value.col_widths[c] ?? 100)
  }
  return Math.max(1, sum)
})

function getColumnWidthPercent(c: number): string {
  if (!activeTpl.value) return '10'
  const w = Math.max(0, activeTpl.value.col_widths[c] ?? 100)
  if (w === 0) return '0'
  return ((w / totalGridColWidths.value) * 100).toFixed(2)
}

const selectedColWidth = computed(() => {
  if (!activeTpl.value) return 100
  return Math.max(0, activeTpl.value.col_widths[selCol.value] ?? 100)
})

const selectedRowHeight = computed(() => {
  if (!activeTpl.value) return 26
  return Math.max(0, activeTpl.value.row_heights[selRow.value] ?? 26)
})

function onSelectedColWidthInput(e: Event) {
  if (!activeTpl.value) return
  const raw = Number((e.target as HTMLInputElement).value)
  const val = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(600, Math.round(raw)))
  const nr = normRange.value
  for (let c = nr.c1; c <= nr.c2; c++) {
    activeTpl.value.col_widths[c] = val
  }
}

function onSelectedRowHeightInput(e: Event) {
  if (!activeTpl.value) return
  const raw = Number((e.target as HTMLInputElement).value)
  const val = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(400, Math.round(raw)))
  const nr = normRange.value
  for (let r = nr.r1; r <= nr.r2; r++) {
    activeTpl.value.row_heights[r] = val
  }
}

const normRange = computed(() => ({
  r1: Math.min(selRow.value, selEndRow.value),
  r2: Math.max(selRow.value, selEndRow.value),
  c1: Math.min(selCol.value, selEndCol.value),
  c2: Math.max(selCol.value, selEndCol.value)
}))

const hasMultiCellSelection = computed(() => {
  const nr = normRange.value
  return nr.r1 !== nr.r2 || nr.c1 !== nr.c2
})

const selectedCellLabel = computed(() => cellCoordToAddress(selRow.value, selCol.value))

const selectionRangeLabel = computed(() => {
  const nr = normRange.value
  if (nr.r1 === nr.r2 && nr.c1 === nr.c2) {
    return cellCoordToAddress(nr.r1, nr.c1)
  }
  return `${cellCoordToAddress(nr.r1, nr.c1)}:${cellCoordToAddress(nr.r2, nr.c2)}`
})

const currentCellValue = computed({
  get() {
    if (!activeTpl.value) return ''
    return activeTpl.value.grid_cells[`${selRow.value}_${selCol.value}`]?.value || ''
  },
  set(val: string) {
    if (!activeTpl.value) return
    const key = `${selRow.value}_${selCol.value}`
    if (!activeTpl.value.grid_cells[key]) {
      activeTpl.value.grid_cells[key] = {
        value: val,
        style: { fontSize: activeTpl.value.cau_hinh_trang?.co_chu_mac_dinh || 11, align: 'left' }
      }
    } else {
      activeTpl.value.grid_cells[key].value = val
    }
  }
})

const currentCellStyle = reactive<GridCellStyle>({
  fontFamily: 'Calibri',
  fontSize: 11,
  bold: false,
  italic: false,
  underline: false,
  border: false,
  align: 'left',
  valign: 'middle',
  color: '#0f172a',
  bgColor: undefined
})

function syncRibbonWithSelectedCell() {
  if (!activeTpl.value) return
  const cell = activeTpl.value.grid_cells[`${selRow.value}_${selCol.value}`]
  const st = cell?.style || {}
  currentCellStyle.fontFamily = st.fontFamily || activeTpl.value.cau_hinh_trang?.font_mac_dinh || 'Calibri'
  currentCellStyle.fontSize = st.fontSize || activeTpl.value.cau_hinh_trang?.co_chu_mac_dinh || 11
  currentCellStyle.bold = !!st.bold
  currentCellStyle.italic = !!st.italic
  currentCellStyle.underline = !!st.underline
  currentCellStyle.border = !!st.border
  currentCellStyle.align = st.align || 'left'
  currentCellStyle.valign = st.valign || 'middle'
  currentCellStyle.color = st.color || '#0f172a'
  currentCellStyle.bgColor = st.bgColor
}

function selectCell(r: number, c: number, keepRange = false) {
  if (isEditingCell.value && (selRow.value !== r || selCol.value !== c)) {
    isEditingCell.value = false
    inlineTokenSuggest.visible = false
  }
  selRow.value = r
  selCol.value = c
  previewHighlightCoord.value = `${r}_${c}`
  previewHighlightRow.value = r
  if (!keepRange) {
    selEndRow.value = r
    const span = getCellColspan(r, c)
    selEndCol.value = span > 1 ? c + span - 1 : c
  }
  syncRibbonWithSelectedCell()
}

function isCellInSelectionRange(r: number, c: number): boolean {
  if (selRow.value <= 0 || selCol.value <= 0) return false
  const nr = normRange.value
  return r >= nr.r1 && r <= nr.r2 && c >= nr.c1 && c <= nr.c2
}

function selectEntireColumn(c: number, e?: MouseEvent) {
  if (!activeTpl.value) return
  isEditingCell.value = false
  inlineTokenSuggest.visible = false
  contextMenu.visible = false

  if (e?.shiftKey) {
    selRow.value = 1
    selEndRow.value = activeTpl.value.so_dong
    selEndCol.value = c
  } else {
    selRow.value = 1
    selCol.value = c
    selEndRow.value = activeTpl.value.so_dong
    selEndCol.value = c
  }
  previewHighlightCoord.value = `1_${c}`
  previewHighlightRow.value = 1
  syncRibbonWithSelectedCell()
}

function selectEntireRow(r: number, e?: MouseEvent) {
  if (!activeTpl.value) return
  isEditingCell.value = false
  inlineTokenSuggest.visible = false
  contextMenu.visible = false

  if (e?.shiftKey) {
    selCol.value = 1
    selEndCol.value = activeTpl.value.so_cot
    selEndRow.value = r
  } else {
    selRow.value = r
    selCol.value = 1
    selEndRow.value = r
    selEndCol.value = activeTpl.value.so_cot
  }
  previewHighlightCoord.value = `${r}_1`
  previewHighlightRow.value = r
  syncRibbonWithSelectedCell()
}

function selectEntireGrid() {
  if (!activeTpl.value) return
  isEditingCell.value = false
  inlineTokenSuggest.visible = false
  contextMenu.visible = false
  selRow.value = 1
  selCol.value = 1
  selEndRow.value = activeTpl.value.so_dong
  selEndCol.value = activeTpl.value.so_cot
  previewHighlightCoord.value = '1_1'
  previewHighlightRow.value = 1
  syncRibbonWithSelectedCell()
}

function openRowContextMenu(e: MouseEvent, r: number) {
  selectEntireRow(r)
  contextMenu.visible = true
  contextMenu.x = Math.min(e.clientX, window.innerWidth - 290)
  contextMenu.y = Math.min(e.clientY, window.innerHeight - 500)
}

function openColContextMenu(e: MouseEvent, c: number) {
  selectEntireColumn(c)
  contextMenu.visible = true
  contextMenu.x = Math.min(e.clientX, window.innerWidth - 290)
  contextMenu.y = Math.min(e.clientY, window.innerHeight - 500)
}

// Mouse drag range selection (Floating editor opens on double-click)
function onCellMouseDown(e: MouseEvent, r: number, c: number) {
  if (e.button !== 0) return
  contextMenu.visible = false

  if (e.shiftKey && selRow.value > 0 && selCol.value > 0) {
    isEditingCell.value = false
    inlineTokenSuggest.visible = false
    selEndRow.value = r
    selEndCol.value = c
    return
  }

  selectCell(r, c, false)
  isDraggingSelection.value = true
}

function onCellMouseEnter(r: number, c: number) {
  if (!isDraggingSelection.value) return
  if (r !== selRow.value || c !== selCol.value) {
    isEditingCell.value = false
    inlineTokenSuggest.visible = false
  }
  selEndRow.value = r
  const span = getCellColspan(r, c)
  selEndCol.value = span > 1 ? c + span - 1 : c
}

function onCellMouseUp(_r: number, _c: number) {
  isDraggingSelection.value = false
}

function onGridMouseUp() {
  isDraggingSelection.value = false
}

// Direct In-Cell Floating Zoomed Editing (triggered on double-click)
function focusInlineTextarea() {
  nextTick(() => {
    const rawRef = inlineCellInputRef.value
    const el = Array.isArray(rawRef) ? rawRef[0] : rawRef
    if (el) {
      el.focus()
      const len = el.value.length
      el.setSelectionRange(len, len)
    }
  })
}

function startInlineEdit(r: number, c: number, initialChar?: string) {
  if (isLogoCell(r, c)) return
  selectCell(r, c, false)
  isEditingCell.value = true
  if (initialChar !== undefined) {
    currentCellValue.value = initialChar
    if (initialChar === '{') {
      inlineTokenSuggest.visible = true
      inlineTokenSuggest.query = ''
      inlineTokenSuggest.activeIndex = 0
    }
  }
  focusInlineTextarea()
}

function openTokenTableModal() {
  inlineTokenSuggest.visible = false
  isEditingCell.value = false
  showTokenModal.value = true
}

function toggleInlineTokenSuggest() {
  openTokenTableModal()
}

function finishInlineEdit() {
  isEditingCell.value = false
  inlineTokenSuggest.visible = false
}

function cancelCellSelection() {
  isEditingCell.value = false
  inlineTokenSuggest.visible = false
  contextMenu.visible = false
  selRow.value = 0
  selCol.value = 0
  selEndRow.value = 0
  selEndCol.value = 0
  previewHighlightCoord.value = ''
  previewHighlightRow.value = 0
}

function openInlineTokenPickerAtCell(r: number, c: number) {
  contextMenu.visible = false
  selectCell(r, c, false)
  isEditingCell.value = false
  inlineTokenSuggest.visible = false
  showTokenModal.value = true
}

function onInlineEditorInput(e: Event) {
  const val = (e.target as HTMLTextAreaElement).value
  const lastOpen = val.lastIndexOf('{{')
  const lastClose = val.lastIndexOf('}}')
  if (lastOpen !== -1 && lastOpen > lastClose) {
    inlineTokenSuggest.visible = true
    inlineTokenSuggest.query = val.slice(lastOpen + 2).trim()
    inlineTokenSuggest.activeIndex = 0
  } else if (val.endsWith('{')) {
    inlineTokenSuggest.visible = true
    inlineTokenSuggest.query = ''
    inlineTokenSuggest.activeIndex = 0
  } else {
    inlineTokenSuggest.visible = false
  }
}

const filteredInlineTokens = computed(() => {
  const q = inlineTokenSuggest.query.trim().toLowerCase()
  if (!q) return AVAILABLE_TOKENS
  return AVAILABLE_TOKENS.filter(
    t =>
      t.token.toLowerCase().includes(q) ||
      t.label.toLowerCase().includes(q) ||
      t.key.toLowerCase().includes(q)
  )
})

function pickInlineToken(tk: TokenDef) {
  const cur = currentCellValue.value
  const lastDouble = cur.lastIndexOf('{{')
  const lastClose = cur.lastIndexOf('}}')
  if (lastDouble !== -1 && lastDouble > lastClose) {
    currentCellValue.value = cur.slice(0, lastDouble) + tk.token
  } else if (cur.endsWith('{')) {
    currentCellValue.value = cur.slice(0, -1) + tk.token
  } else if (!cur) {
    currentCellValue.value = tk.token
  } else {
    currentCellValue.value = `${cur}${cur.endsWith(' ') ? '' : ' '}${tk.token}`
  }

  if (tk.isNumeric) {
    applyStyleToSelection('align', 'right')
  }
  if (activeTpl.value) {
    if (tk.group === 'group_row') activeTpl.value.mapping_vung.dong_mau_nhom = selRow.value
    else if (tk.group === 'item_row' || tk.token === '{{TT_TRUOC_THUE_USD}}') activeTpl.value.mapping_vung.dong_mau_san_pham = selRow.value
    else if (tk.token === '{{DIEU_KHOAN}}') activeTpl.value.mapping_vung.dong_dieu_khoan = selRow.value
  }

  inlineTokenSuggest.visible = false
  focusInlineTextarea()
}

function onInlineTokenSearchKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (filteredInlineTokens.value.length) {
      inlineTokenSuggest.activeIndex = (inlineTokenSuggest.activeIndex + 1) % filteredInlineTokens.value.length
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (filteredInlineTokens.value.length) {
      inlineTokenSuggest.activeIndex =
        (inlineTokenSuggest.activeIndex - 1 + filteredInlineTokens.value.length) % filteredInlineTokens.value.length
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const picked = filteredInlineTokens.value[inlineTokenSuggest.activeIndex]
    if (picked) pickInlineToken(picked)
  } else if (e.key === 'Escape') {
    inlineTokenSuggest.visible = false
  }
}

function onInlineEditorKeydown(e: KeyboardEvent) {
  if (inlineTokenSuggest.visible) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (filteredInlineTokens.value.length) {
        inlineTokenSuggest.activeIndex = (inlineTokenSuggest.activeIndex + 1) % filteredInlineTokens.value.length
      }
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (filteredInlineTokens.value.length) {
        inlineTokenSuggest.activeIndex =
          (inlineTokenSuggest.activeIndex - 1 + filteredInlineTokens.value.length) % filteredInlineTokens.value.length
      }
      return
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      const picked = filteredInlineTokens.value[inlineTokenSuggest.activeIndex]
      if (picked) {
        e.preventDefault()
        pickInlineToken(picked)
        return
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      inlineTokenSuggest.visible = false
      return
    }
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    isEditingCell.value = false
    inlineTokenSuggest.visible = false
    if (activeTpl.value && selRow.value < activeTpl.value.so_dong) {
      selectCell(selRow.value + 1, selCol.value, false)
    }
  } else if (e.key === 'Tab') {
    e.preventDefault()
    isEditingCell.value = false
    inlineTokenSuggest.visible = false
    moveSelectionByTab(e.shiftKey ? -1 : 1)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    isEditingCell.value = false
    inlineTokenSuggest.visible = false
  }
}

function onInlineEditorBlur() {
  setTimeout(() => {
    if (!inlineTokenSuggest.visible) {
      isEditingCell.value = false
    }
  }, 150)
}

function moveSelectionByTab(delta: number) {
  if (!activeTpl.value) return
  const nextCol = Math.min(Math.max(1, selCol.value + delta), activeTpl.value.so_cot)
  selectCell(selRow.value, nextCol, false)
}

// Grid-level keyboard navigation & shortcuts (like Excel)
function handleGridKeydown(e: KeyboardEvent) {
  if (!activeTpl.value || isEditingCell.value || editorMode.value !== 'manual') return
  if (showTemplateModal.value || showSettingsModal.value || showTokenModal.value) return
  if (selRow.value <= 0 || selCol.value <= 0) return
  const targetEl = e.target as HTMLElement | null
  const tag = targetEl?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || targetEl?.isContentEditable) return

  if (e.ctrlKey || e.metaKey) {
    const k = e.key.toLowerCase()
    if (k === 'b') {
      e.preventDefault()
      toggleStyleBool('bold')
      return
    }
    if (k === 'i') {
      e.preventDefault()
      toggleStyleBool('italic')
      return
    }
    if (k === 'u') {
      e.preventDefault()
      toggleStyleBool('underline')
      return
    }
    if (k === 'c') {
      e.preventDefault()
      copySelectedCell()
      return
    }
    if (k === 'v') {
      e.preventDefault()
      pasteToSelectedCells()
      return
    }
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectCell(Math.max(1, selRow.value - 1), selCol.value, e.shiftKey)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectCell(Math.min(activeTpl.value.so_dong, selRow.value + 1), selCol.value, e.shiftKey)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    selectCell(selRow.value, Math.max(1, selCol.value - 1), e.shiftKey)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    selectCell(selRow.value, Math.min(activeTpl.value.so_cot, selCol.value + 1), e.shiftKey)
  } else if (e.key === 'Tab') {
    e.preventDefault()
    moveSelectionByTab(e.shiftKey ? -1 : 1)
  } else if (e.key === 'Enter' || e.key === 'F2') {
    e.preventDefault()
    startInlineEdit(selRow.value, selCol.value)
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    clearSelectedRangeContent()
  } else if (e.key.length === 1 && !e.altKey) {
    e.preventDefault()
    startInlineEdit(selRow.value, selCol.value, e.key)
  }
}

function getInlineEditorStyle(r: number, c: number) {
  const cell = activeTpl.value?.grid_cells?.[`${r}_${c}`]
  const st = cell?.style || {}
  return {
    fontFamily: st.fontFamily || activeTpl.value?.cau_hinh_trang?.font_mac_dinh || 'Calibri',
    fontSize: (st.fontSize || activeTpl.value?.cau_hinh_trang?.co_chu_mac_dinh || 11) + 'pt',
    fontWeight: st.bold ? '700' : '400',
    fontStyle: st.italic ? 'italic' : 'normal',
    textAlign: st.align || 'left',
    color: '#0f172a'
  }
}

function ensureCellObjAt(r: number, c: number) {
  if (!activeTpl.value) return null
  const key = `${r}_${c}`
  if (!activeTpl.value.grid_cells[key]) {
    activeTpl.value.grid_cells[key] = {
      value: '',
      style: {
        fontFamily: currentCellStyle.fontFamily,
        fontSize: currentCellStyle.fontSize,
        align: currentCellStyle.align || 'left'
      }
    }
  }
  if (!activeTpl.value.grid_cells[key].style) {
    activeTpl.value.grid_cells[key].style = {}
  }
  return activeTpl.value.grid_cells[key]
}

function applyStyleToSelection(prop: keyof GridCellStyle, val: any) {
  ;(currentCellStyle as any)[prop] = val
  const nr = normRange.value
  for (let r = nr.r1; r <= nr.r2; r++) {
    for (let c = nr.c1; c <= nr.c2; c++) {
      const cell = ensureCellObjAt(r, c)
      if (cell && cell.style) {
        ;(cell.style as any)[prop] = val
      }
    }
  }
}

function toggleStyleBool(prop: 'bold' | 'italic' | 'underline' | 'border') {
  const nextVal = !currentCellStyle[prop]
  applyStyleToSelection(prop, nextVal)
}

function clearSelectedRangeContent() {
  if (!activeTpl.value) return
  const nr = normRange.value
  for (let r = nr.r1; r <= nr.r2; r++) {
    for (let c = nr.c1; c <= nr.c2; c++) {
      const key = `${r}_${c}`
      if (activeTpl.value.grid_cells[key]) {
        activeTpl.value.grid_cells[key].value = ''
      }
    }
  }
  showToast(`Đã xóa nội dung vùng ${selectionRangeLabel.value}`)
}

function copySelectedCell() {
  if (!activeTpl.value) return
  const src = activeTpl.value.grid_cells[`${selRow.value}_${selCol.value}`]
  clipboardCell.value = src ? JSON.parse(JSON.stringify(src)) : { value: '', style: { ...currentCellStyle } }
  showToast(`Đã sao chép ô ${selectedCellLabel.value}`)
}

function pasteToSelectedCells() {
  if (!activeTpl.value || !clipboardCell.value) return
  const nr = normRange.value
  for (let r = nr.r1; r <= nr.r2; r++) {
    for (let c = nr.c1; c <= nr.c2; c++) {
      activeTpl.value.grid_cells[`${r}_${c}`] = JSON.parse(JSON.stringify(clipboardCell.value))
    }
  }
  syncRibbonWithSelectedCell()
  showToast(`Đã dán vào ${selectionRangeLabel.value}`)
}

// Context menu
function openContextMenu(e: MouseEvent, r: number, c: number) {
  if (!isCellInSelectionRange(r, c)) {
    selectCell(r, c, false)
  } else {
    selRow.value = r
    selCol.value = c
  }
  contextMenu.visible = true
  contextMenu.x = Math.min(e.clientX, window.innerWidth - 290)
  contextMenu.y = Math.min(e.clientY, window.innerHeight - 500)
}

// Direct Drag Resize for Columns, Rows, and Logo in Grid (minimum 0px)
function startColResize(e: MouseEvent, c: number) {
  if (!activeTpl.value) return
  resizeState.type = 'col'
  resizeState.index = c
  resizeState.startPos = e.clientX
  resizeState.startSize = activeTpl.value.col_widths[c] ?? 110
  window.addEventListener('mousemove', onGlobalMouseMove)
  window.addEventListener('mouseup', stopGlobalResize)
}

function startRowResize(e: MouseEvent, r: number) {
  if (!activeTpl.value) return
  resizeState.type = 'row'
  resizeState.index = r
  resizeState.startPos = e.clientY
  resizeState.startSize = activeTpl.value.row_heights[r] ?? 28
  window.addEventListener('mousemove', onGlobalMouseMove)
  window.addEventListener('mouseup', stopGlobalResize)
}

function startLogoResize(e: MouseEvent, axis: 'w' | 'h' | 'both' = 'both') {
  if (!activeTpl.value) return
  const wrapEl = (e.target as HTMLElement)?.closest('.grid-logo-cell-wrap') as HTMLElement | null
  resizeState.type = 'logo'
  resizeState.logoAxis = axis
  resizeState.index = 1
  resizeState.startPos = e.clientX
  resizeState.startPosY = e.clientY
  resizeState.startSize = activeTpl.value.cau_hinh_trang.logo_width_pct || 35
  resizeState.startHeight = activeTpl.value.cau_hinh_trang.logo_height || 68
  resizeState.containerWidth = wrapEl?.clientWidth || 700
  window.addEventListener('mousemove', onGlobalMouseMove)
  window.addEventListener('mouseup', stopGlobalResize)
}

function setLogoFullWidth() {
  if (!activeTpl.value) return
  activeTpl.value.cau_hinh_trang.logo_width_pct = 100
  showToast('Đã kéo dài Logo 100% Full Width ngang trang!')
}

function onGlobalMouseMove(e: MouseEvent) {
  if (!activeTpl.value || !resizeState.type) return
  if (resizeState.type === 'col') {
    const diff = e.clientX - resizeState.startPos
    activeTpl.value.col_widths[resizeState.index] = Math.max(0, Math.min(600, Math.round(resizeState.startSize + diff)))
  } else if (resizeState.type === 'row') {
    const diff = e.clientY - resizeState.startPos
    activeTpl.value.row_heights[resizeState.index] = Math.max(0, Math.min(400, Math.round(resizeState.startSize + diff)))
  } else if (resizeState.type === 'logo') {
    if (resizeState.logoAxis === 'w' || resizeState.logoAxis === 'both') {
      const diffX = e.clientX - resizeState.startPos
      const deltaPct = (diffX / Math.max(100, resizeState.containerWidth)) * 100
      const newPct = Math.max(5, Math.min(100, Math.round(resizeState.startSize + deltaPct)))
      activeTpl.value.cau_hinh_trang.logo_width_pct = newPct
    }
    if (resizeState.logoAxis === 'h' || resizeState.logoAxis === 'both') {
      const diffY = e.clientY - resizeState.startPosY
      const newH = Math.max(24, Math.min(500, Math.round(resizeState.startHeight + diffY)))
      activeTpl.value.cau_hinh_trang.logo_height = newH
      activeTpl.value.row_heights[1] = newH + 8
    }
  }
}

function stopGlobalResize() {
  resizeState.type = null
  window.removeEventListener('mousemove', onGlobalMouseMove)
  window.removeEventListener('mouseup', stopGlobalResize)
}

onBeforeUnmount(() => {
  stopGlobalResize()
  window.removeEventListener('keydown', handleGridKeydown)
})

// Merge helpers
function isSecondaryMergedCell(r: number, c: number): boolean {
  if (!activeTpl.value) return false
  if (c > 1 && isLogoCell(r, 1)) return true
  return (activeTpl.value.merges || []).some(
    m => m.top <= r && m.bottom >= r && c > m.left && c <= m.right
  )
}

function getCellColspan(r: number, c: number): number {
  if (!activeTpl.value) return 1
  if (c === 1 && isLogoCell(r, 1)) return activeTpl.value.so_cot
  const found = (activeTpl.value.merges || []).find(
    m => m.top === r && m.bottom === r && m.left === c
  )
  return found ? found.right - found.left + 1 : 1
}

function mergeSelectedRange() {
  if (!activeTpl.value) return
  const nr = normRange.value
  const left = nr.c1
  const right = nr.c2 > nr.c1 ? nr.c2 : Math.min(nr.c1 + 3, activeTpl.value.so_cot)
  if (left === right) return

  for (let r = nr.r1; r <= nr.r2; r++) {
    activeTpl.value.merges = (activeTpl.value.merges || []).filter(
      m => !(m.top === r && !(m.right < left || m.left > right))
    )
    activeTpl.value.merges.push({ top: r, left, bottom: r, right })
  }
  selEndCol.value = right
  showToast(`Đã gộp ô ngang ${cellCoordToAddress(nr.r1, left)}:${cellCoordToAddress(nr.r2, right)}`)
}

function unmergeAtSelectedCell() {
  if (!activeTpl.value) return
  const nr = normRange.value
  const before = (activeTpl.value.merges || []).length
  activeTpl.value.merges = (activeTpl.value.merges || []).filter(
    m => !(m.top >= nr.r1 && m.bottom <= nr.r2 && !(m.right < nr.c1 || m.left > nr.c2))
  )
  if (activeTpl.value.merges.length < before) {
    selEndCol.value = selCol.value
    showToast(`Đã bỏ gộp ô tại ${selectionRangeLabel.value}`)
  }
}

// Row / Column structural helpers
function shiftRowsDownFrom(fromRow: number) {
  if (!activeTpl.value) return
  const newCells: Record<string, any> = {}
  Object.entries(activeTpl.value.grid_cells).forEach(([k, v]) => {
    const [rS, cS] = k.split('_')
    const r = Number(rS)
    const c = Number(cS)
    if (r < fromRow) newCells[k] = v
    else newCells[`${r + 1}_${c}`] = v
  })
  activeTpl.value.grid_cells = newCells
  activeTpl.value.merges = (activeTpl.value.merges || []).map(m => ({
    top: m.top >= fromRow ? m.top + 1 : m.top,
    bottom: m.bottom >= fromRow ? m.bottom + 1 : m.bottom,
    left: m.left,
    right: m.right
  }))
  const mv = activeTpl.value.mapping_vung
  if (mv.dong_tieu_de_bang >= fromRow) mv.dong_tieu_de_bang++
  if (mv.dong_mau_nhom >= fromRow) mv.dong_mau_nhom++
  if (mv.dong_mau_san_pham >= fromRow) mv.dong_mau_san_pham++
  if (mv.dong_dieu_khoan >= fromRow) mv.dong_dieu_khoan++
  if (mv.dong_chu_ky >= fromRow) mv.dong_chu_ky++
  mv.danh_sach_dong_tong = (mv.danh_sach_dong_tong || []).map(r => (r >= fromRow ? r + 1 : r))
  activeTpl.value.so_dong++
}

function insertRowAboveSelected() {
  if (!activeTpl.value) return
  const target = selRow.value
  shiftRowsDownFrom(target)
  showToast(`Đã chèn thêm dòng mới tại dòng ${target}`)
}

function insertRowBelowSelected() {
  if (!activeTpl.value) return
  const target = selRow.value
  shiftRowsDownFrom(target + 1)
  showToast(`Đã chèn thêm dòng ${target + 1}`)
}

function duplicateSelectedRow() {
  if (!activeTpl.value) return
  const srcR = selRow.value
  const dstR = srcR + 1
  shiftRowsDownFrom(dstR)
  for (let c = 1; c <= activeTpl.value.so_cot; c++) {
    const cell = activeTpl.value.grid_cells[`${srcR}_${c}`]
    if (cell) {
      activeTpl.value.grid_cells[`${dstR}_${c}`] = JSON.parse(JSON.stringify(cell))
    }
  }
  const rowMerges = (activeTpl.value.merges || []).filter(m => m.top === srcR && m.bottom === srcR)
  rowMerges.forEach(m => {
    activeTpl.value!.merges.push({ top: dstR, bottom: dstR, left: m.left, right: m.right })
  })
  showToast(`Đã nhân bản dòng ${srcR} xuống dòng ${dstR}`)
}

function deleteSelectedRow() {
  if (!activeTpl.value || activeTpl.value.so_dong <= 5) return
  const target = selRow.value
  const newCells: Record<string, any> = {}
  Object.entries(activeTpl.value.grid_cells).forEach(([k, v]) => {
    const [rS, cS] = k.split('_')
    const r = Number(rS)
    const c = Number(cS)
    if (r < target) newCells[k] = v
    else if (r > target) newCells[`${r - 1}_${c}`] = v
  })
  activeTpl.value.grid_cells = newCells
  activeTpl.value.merges = (activeTpl.value.merges || [])
    .filter(m => m.top !== target)
    .map(m => ({
      top: m.top > target ? m.top - 1 : m.top,
      bottom: m.bottom > target ? m.bottom - 1 : m.bottom,
      left: m.left,
      right: m.right
    }))
  const mv = activeTpl.value.mapping_vung
  if (mv.dong_tieu_de_bang > target) mv.dong_tieu_de_bang--
  if (mv.dong_mau_nhom > target) mv.dong_mau_nhom--
  if (mv.dong_mau_san_pham > target) mv.dong_mau_san_pham--
  if (mv.dong_dieu_khoan > target) mv.dong_dieu_khoan--
  if (mv.dong_chu_ky > target) mv.dong_chu_ky--
  mv.danh_sach_dong_tong = (mv.danh_sach_dong_tong || []).map(r => (r > target ? r - 1 : r))
  activeTpl.value.so_dong--
  if (selRow.value > activeTpl.value.so_dong) selRow.value = activeTpl.value.so_dong
  selEndRow.value = selRow.value
  showToast(`Đã xóa dòng ${target}`)
}

function shiftColumnsRightFrom(fromCol: number): boolean {
  if (!activeTpl.value || activeTpl.value.so_cot >= 24) return false
  const newCells: Record<string, any> = {}
  Object.entries(activeTpl.value.grid_cells).forEach(([k, v]) => {
    const [rS, cS] = k.split('_')
    const r = Number(rS)
    const c = Number(cS)
    if (c < fromCol) newCells[k] = v
    else newCells[`${r}_${c + 1}`] = v
  })
  activeTpl.value.grid_cells = newCells

  const newWidths: Record<number, number> = {}
  for (let c = 1; c <= activeTpl.value.so_cot; c++) {
    const w = activeTpl.value.col_widths[c] ?? 100
    if (c < fromCol) newWidths[c] = w
    else newWidths[c + 1] = w
  }
  newWidths[fromCol] = 100
  activeTpl.value.col_widths = newWidths

  activeTpl.value.merges = (activeTpl.value.merges || []).map(m => ({
    top: m.top,
    bottom: m.bottom,
    left: m.left >= fromCol ? m.left + 1 : m.left,
    right: m.right >= fromCol ? m.right + 1 : m.right
  }))

  activeTpl.value.so_cot++
  return true
}

function insertColumnLeftSelected() {
  if (!activeTpl.value) return
  const target = selCol.value > 0 ? selCol.value : 1
  if (!shiftColumnsRightFrom(target)) {
    showToast('Số lượng cột đã đạt tối đa (24 cột)')
    return
  }
  selCol.value = target
  selEndCol.value = target
  if (selRow.value <= 0) {
    selRow.value = 1
    selEndRow.value = 1
  }
  previewHighlightCoord.value = `${selRow.value}_${target}`
  syncRibbonWithSelectedCell()
  showToast(`Đã chèn thêm 1 cột bên trái tại cột ${colIndexToLetter(target)}`)
}

function insertColumnRightSelected() {
  if (!activeTpl.value) return
  const curCol = selCol.value > 0 ? selCol.value : activeTpl.value.so_cot
  const target = curCol + 1
  if (!shiftColumnsRightFrom(target)) {
    showToast('Số lượng cột đã đạt tối đa (24 cột)')
    return
  }
  selCol.value = target
  selEndCol.value = target
  if (selRow.value <= 0) {
    selRow.value = 1
    selEndRow.value = 1
  }
  previewHighlightCoord.value = `${selRow.value}_${target}`
  syncRibbonWithSelectedCell()
  showToast(`Đã chèn thêm 1 cột bên phải (${colIndexToLetter(target)})`)
}

function deleteSelectedColumn() {
  if (!activeTpl.value || activeTpl.value.so_cot <= 3) return
  const target = selCol.value > 0 ? selCol.value : activeTpl.value.so_cot
  const deletedLetter = colIndexToLetter(target)

  const newCells: Record<string, any> = {}
  Object.entries(activeTpl.value.grid_cells).forEach(([k, v]) => {
    const [rS, cS] = k.split('_')
    const r = Number(rS)
    const c = Number(cS)
    if (c < target) newCells[k] = v
    else if (c > target) newCells[`${r}_${c - 1}`] = v
  })
  activeTpl.value.grid_cells = newCells

  const newWidths: Record<number, number> = {}
  for (let c = 1; c <= activeTpl.value.so_cot; c++) {
    const w = activeTpl.value.col_widths[c] ?? 100
    if (c < target) newWidths[c] = w
    else if (c > target) newWidths[c - 1] = w
  }
  activeTpl.value.col_widths = newWidths

  activeTpl.value.merges = (activeTpl.value.merges || [])
    .filter(m => !(m.left === target && m.right === target))
    .map(m => ({
      top: m.top,
      bottom: m.bottom,
      left: m.left > target ? m.left - 1 : m.left,
      right: m.right >= target ? m.right - 1 : m.right
    }))
    .filter(m => m.right > m.left)

  activeTpl.value.so_cot--
  if (selCol.value > activeTpl.value.so_cot) selCol.value = activeTpl.value.so_cot
  selEndCol.value = selCol.value
  showToast(`Đã xóa cột ${deletedLetter}`)
}

function handleRestoreStandardHeader() {
  if (!activeTpl.value) return
  const starter = createStarterTemplateConfig(activeTpl.value.id, activeTpl.value.ten_mau)
  const hRow = activeTpl.value.mapping_vung?.dong_tieu_de_bang || 7
  for (let r = 1; r <= Math.min(hRow, 7); r++) {
    for (let c = 1; c <= activeTpl.value.so_cot; c++) {
      if (starter.grid_cells[`${r}_${c}`]) {
        activeTpl.value.grid_cells[`${r}_${c}`] = JSON.parse(JSON.stringify(starter.grid_cells[`${r}_${c}`]))
      } else {
        delete activeTpl.value.grid_cells[`${r}_${c}`]
      }
    }
  }
  activeTpl.value.merges = [
    ...starter.merges.filter(m => m.bottom <= 7),
    ...(activeTpl.value.merges || []).filter(m => m.top > 7)
  ]
  activeTpl.value.row_heights[1] = 28
  activeTpl.value.row_heights[7] = 32
  selectCell(1, 1, false)
  showToast('Đã khôi phục khung Header chuẩn trên bảng lưới!')
}

// Row role toggles (used in right-click context menu)
function toggleGroupRowRole(r: number) {
  if (!activeTpl.value) return
  if (activeTpl.value.mapping_vung.dong_mau_nhom === r) {
    activeTpl.value.mapping_vung.dong_mau_nhom = 0
    showToast('Đã tắt Dòng mẫu Nhóm')
  } else {
    activeTpl.value.mapping_vung.dong_mau_nhom = r
    showToast(`Đã đặt Dòng ${r} làm Dòng mẫu Nhóm danh mục`)
  }
}

function setTermsRowRole(r: number) {
  if (!activeTpl.value) return
  activeTpl.value.mapping_vung.dong_dieu_khoan = r
  const colCount = Math.max(activeTpl.value.so_cot || 9, 2)
  activeTpl.value.grid_cells[`${r}_1`] = {
    value: '1, 2...',
    style: { fontSize: 10, fontFamily: 'Arial', align: 'right', valign: 'middle' }
  }
  const key2 = `${r}_2`
  const cur2 = activeTpl.value.grid_cells[key2]?.value || ''
  activeTpl.value.grid_cells[key2] = {
    value: cur2.includes('{{DIEU_KHOAN}}') ? cur2 : '{{DIEU_KHOAN}}',
    style: activeTpl.value.grid_cells[key2]?.style || { fontSize: 10, fontFamily: 'Arial', align: 'left', valign: 'middle', wrapText: true }
  }
  activeTpl.value.merges = (activeTpl.value.merges || []).filter(m => m.top !== r)
  activeTpl.value.merges.push({ top: r, left: 2, bottom: r, right: colCount })
  showToast(`Đã đặt Dòng ${r} làm vùng Điều khoản thương mại (Cột A: STT, Cột B..: Nội dung)`)
}

function getRowRoleClass(r: number): string {
  if (!activeTpl.value) return ''
  const mv = activeTpl.value.mapping_vung
  if (mv.dong_tieu_de_bang === r) return 'row-role-tag-header'
  if (mv.dong_mau_nhom === r) return 'row-role-tag-group'
  if (mv.dong_mau_san_pham === r) return 'row-role-tag-item'
  if (mv.danh_sach_dong_tong?.includes(r)) return 'row-role-tag-total'
  return ''
}

function getRowHeadingTitle(r: number): string {
  if (!activeTpl.value) return `Dòng ${r}`
  const mv = activeTpl.value.mapping_vung
  const h = activeTpl.value.row_heights[r] ?? 26
  let role = ''
  if (mv.dong_tieu_de_bang === r) role = ' (Dòng Tiêu đề bảng)'
  else if (mv.dong_mau_nhom === r) role = ' (Dòng mẫu Nhóm danh mục)'
  else if (mv.dong_mau_san_pham === r) role = ' (Dòng mẫu Sản phẩm lặp lại)'
  else if (mv.dong_dieu_khoan === r) role = ' (Vùng Điều khoản thương mại)'
  else if (mv.danh_sach_dong_tong?.includes(r)) role = ' (Dòng Tổng tiền)'
  return `Dòng ${r} (${h}px)${role} — Click để chọn cả dòng, chuột phải để mở menu thao tác dòng, kéo mép dưới để chỉnh chiều cao (tối thiểu 0px)`
}

function getRowHeadingStyle(r: number) {
  const h = activeTpl.value?.row_heights?.[r] ?? 26
  if (h <= 0) {
    return {
      height: '0px',
      padding: '0px',
      fontSize: '0px',
      lineHeight: '0'
    }
  }
  if (h < 18) {
    return {
      height: `${h}px`,
      padding: '0px',
      fontSize: `${Math.max(8, h - 2)}px`,
      lineHeight: `${h}px`
    }
  }
  return {
    height: `${h}px`
  }
}

function isLogoCell(r: number, c: number): boolean {
  const val = activeTpl.value?.grid_cells?.[`${r}_${c}`]?.value?.trim() || ''
  return val === '{{LOGO}}' || val === '{{LOGO_TRAI}}'
}

function cellHasToken(r: number, c: number): boolean {
  const val = activeTpl.value?.grid_cells?.[`${r}_${c}`]?.value || ''
  return val.includes('{{') && val.includes('}}')
}

function isRightHalfCol(r: number, c: number): boolean {
  const totalCols = activeTpl.value?.so_cot || 7
  const span = getCellColspan(r, c)
  if (span >= totalCols - 1) return false
  return c + span - 1 > Math.ceil(totalCols / 2)
}

function getCellContentBoxStyle(r: number) {
  const h = activeTpl.value?.row_heights?.[r] ?? 26
  if (h <= 0) {
    return {
      maxHeight: '0px',
      height: '0px',
      overflow: 'hidden'
    }
  }
  return {
    maxHeight: `${Math.max(1, h > 16 ? h - 8 : h)}px`,
    overflow: 'hidden'
  }
}

function getComputedCellStyle(r: number, c: number) {
  const cell = activeTpl.value?.grid_cells?.[`${r}_${c}`]
  const st = cell?.style || {}
  const h = activeTpl.value?.row_heights?.[r] ?? 26
  const isLogo = isLogoCell(r, c)
  const span = getCellColspan(r, c)
  let spanWidthPx = 0
  for (let cc = c; cc < c + span; cc++) {
    spanWidthPx += Math.max(0, activeTpl.value?.col_widths?.[cc] ?? 100)
  }
  const isZeroRow = h <= 0
  const isCompactRow = h > 0 && h < 20
  const isZeroCol = spanWidthPx <= 0
  const isCompactCol = spanWidthPx > 0 && spanWidthPx < 30

  const padV = isZeroRow || isCompactRow ? '0px' : '4px'
  const padH = isZeroCol ? '0px' : isCompactCol ? '1px' : '7px'

  return {
    padding: isLogo ? (isZeroRow ? '0' : '0 0 4px 0') : `${padV} ${padH}`,
    fontFamily: st.fontFamily || activeTpl.value?.cau_hinh_trang?.font_mac_dinh || 'Calibri',
    fontSize: isZeroRow || isZeroCol ? '0px' : (st.fontSize || activeTpl.value?.cau_hinh_trang?.co_chu_mac_dinh || 11) + 'pt',
    lineHeight: isZeroRow || isZeroCol ? '0' : isCompactRow ? `${Math.max(1, h)}px` : undefined,
    fontWeight: st.bold ? '700' : '400',
    fontStyle: st.italic ? 'italic' : 'normal',
    textDecoration: st.underline ? 'underline' : 'none',
    textAlign: st.align || 'left',
    verticalAlign: st.valign || 'middle',
    color: st.color || '#0f172a',
    backgroundColor: st.bgColor || '#ffffff',
    border: st.border ? `1px solid ${st.borderColor || '#1e293b'}` : '1px dashed #cbd5e1',
    height: `${Math.max(0, h)}px`
  }
}

function formatCellDisplayHtml(r: number, c: number): string {
  const raw = activeTpl.value?.grid_cells?.[`${r}_${c}`]?.value || ''
  if (!raw) return ''

  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')

  return escaped.replace(/(\{\{[A-Z0-9_]+\}\})/g, (match) => {
    return `<span class="cell-token-pill">${match}</span>`
  })
}

// Token palette filtering & insertion
const filteredTokenGroups = computed(() => {
  const kw = tokenSearch.value.trim().toLowerCase()
  const indexedTokens = AVAILABLE_TOKENS.map((t, i) => ({
    ...t,
    globalIndex: i + 1
  }))
  return TOKEN_GROUPS.filter(g => tokenGroupFilter.value === 'all' || g.id === tokenGroupFilter.value)
    .map(g => {
      const tokens = indexedTokens.filter(t => {
        if (t.group !== g.id) return false
        if (!kw) return true
        return (
          t.token.toLowerCase().includes(kw) ||
          t.label.toLowerCase().includes(kw) ||
          t.sample.toLowerCase().includes(kw)
        )
      })
      return { ...g, tokens }
    })
    .filter(g => g.tokens.length > 0)
})

// ===== PARALLEL TWO-WAY SYNC: THỦ CÔNG <-> CODE (HTML / CSS / JS) =====
function syncCodeBuffersFromTemplate() {
  if (!activeTpl.value || isUpdatingFromCode.value) return
  const serialized = serializeTemplateToCode(activeTpl.value)
  codeHtmlText.value = serialized.html
  codeCssText.value = serialized.css
  codeJsText.value = serialized.js
}

function switchEditorMode(mode: 'manual' | 'code') {
  editorMode.value = mode
  if (activeTpl.value) {
    activeTpl.value.che_do_soan_thao = mode
  }
  if (mode === 'code') {
    syncCodeBuffersFromTemplate()
  }
}

function switchCodeLangTab(tab: 'html' | 'css' | 'js') {
  codeLangTab.value = tab
  syncCodeBuffersFromTemplate()
  nextTick(() => {
    codeTextareaRef.value?.focus()
  })
}

const currentCodeText = computed(() => {
  if (codeLangTab.value === 'css') return codeCssText.value
  if (codeLangTab.value === 'js') return codeJsText.value
  return codeHtmlText.value
})

const currentCodeLineCount = computed(() => {
  const lines = (currentCodeText.value || '').split('\n').length
  return Math.max(20, lines)
})

function onCodeTextareaInput(e: Event) {
  if (!activeTpl.value) return
  const val = (e.target as HTMLTextAreaElement).value
  isUpdatingFromCode.value = true

  if (codeLangTab.value === 'html') {
    codeHtmlText.value = val
    applyHtmlCodeToTemplate(activeTpl.value, val)
    const refreshed = serializeTemplateToCode(activeTpl.value)
    codeCssText.value = refreshed.css
  } else if (codeLangTab.value === 'css') {
    codeCssText.value = val
    applyCssCodeToTemplate(activeTpl.value, val)
    const refreshed = serializeTemplateToCode(activeTpl.value)
    codeHtmlText.value = refreshed.html
  } else if (codeLangTab.value === 'js') {
    codeJsText.value = val
    activeTpl.value.custom_js = val
    executePreviewCustomJs()
  }

  nextTick(() => {
    isUpdatingFromCode.value = false
  })
}

function onCodeTextareaScroll(e: Event) {
  const target = e.target as HTMLTextAreaElement
  if (codeGutterRef.value) {
    codeGutterRef.value.scrollTop = target.scrollTop
  }
}

function onCodeTextareaKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const el = e.target as HTMLTextAreaElement
    const start = el.selectionStart
    const end = el.selectionEnd
    const val = el.value
    el.value = val.slice(0, start) + '  ' + val.slice(end)
    el.selectionStart = el.selectionEnd = start + 2
    onCodeTextareaInput(e)
  }
}

function executePreviewCustomJs() {
  if (!activeTpl.value || !previewSheetRef.value) {
    jsRuntimeError.value = null
    return
  }
  const mockCtx = createMockQuoteContext(activeTpl.value)
  mockCtx.currency = previewCurrency.value
  jsRuntimeError.value = runTemplateCustomJs(previewSheetRef.value, activeTpl.value, mockCtx)
}

watch(
  () => activeTpl.value,
  () => {
    if (!isUpdatingFromCode.value) {
      syncCodeBuffersFromTemplate()
    }
  },
  { deep: true }
)

function insertTokenFromModal(tk: TokenDef) {
  if (editorMode.value === 'code' && codeTextareaRef.value) {
    const el = codeTextareaRef.value
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const cur = el.value
    const nextVal = cur.slice(0, start) + tk.token + cur.slice(end)
    el.value = nextVal
    onCodeTextareaInput({ target: el } as unknown as Event)
    showTokenModal.value = false
    nextTick(() => {
      el.focus()
      const pos = start + tk.token.length
      el.setSelectionRange(pos, pos)
    })
    showToast(`Đã chèn ${tk.token} vào khung Code (${codeLangTab.value.toUpperCase()})`)
    return
  }
  insertTokenIntoSelectedCell(tk)
  showTokenModal.value = false
}

function insertTokenIntoSelectedCell(tk: TokenDef) {
  if (!activeTpl.value) return
  const r = selRow.value > 0 ? selRow.value : 1
  const c = selCol.value > 0 ? selCol.value : 1
  if (selRow.value <= 0 || selCol.value <= 0) {
    selectCell(r, c, false)
  }
  const cur = currentCellValue.value
  if (tokenInsertMode.value === 'replace' || !cur) {
    currentCellValue.value = tk.token
  } else {
    currentCellValue.value = `${cur}${cur.endsWith(' ') ? '' : ' '}${tk.token}`
  }

  if (tk.isNumeric) {
    applyStyleToSelection('align', 'right')
  }

  if (tk.group === 'group_row') {
    activeTpl.value.mapping_vung.dong_mau_nhom = selRow.value
  } else if (tk.group === 'item_row' || tk.token === '{{TT_TRUOC_THUE_USD}}') {
    activeTpl.value.mapping_vung.dong_mau_san_pham = selRow.value
  } else if (tk.token === '{{DIEU_KHOAN}}') {
    activeTpl.value.mapping_vung.dong_dieu_khoan = selRow.value
  }

  showToast(`Đã gắn ${tk.token} vào ô ${selectedCellLabel.value}`)
}

async function copyTokenToClipboard(tokenStr: string) {
  try {
    await navigator.clipboard.writeText(tokenStr)
    showToast(`Đã copy mã ${tokenStr}`)
  } catch {
    showToast(`Mã: ${tokenStr}`)
  }
}

// Live preview with active cell sync
const livePreviewHtml = computed(() => {
  if (!activeTpl.value) return ''
  const mockCtx = createMockQuoteContext(activeTpl.value)
  mockCtx.currency = previewCurrency.value
  if (previewCurrency.value === 'USD') {
    mockCtx.totals = {
      truoc: 2519.69,
      vat: 201.58,
      sau: 2721.27,
      off: 236.22
    }
    mockCtx.rows.forEach(r => {
      if (r.type === 'item') {
        r.donGiaKH = Number(((r.donGiaKH || 0) / 25400).toFixed(2))
        r.truocThue = Number(((r.truocThue || 0) / 25400).toFixed(2))
        r.vatAmount = Number(((r.vatAmount || 0) / 25400).toFixed(2))
        r.sauThue = Number(((r.sauThue || 0) / 25400).toFixed(2))
      }
    })
  }
  const rawHtml = renderTemplateToHtml(activeTpl.value, mockCtx)
  const targetAttr = `data-grid-row="${selRow.value}" data-grid-col="${selCol.value}" class="preview-interactive-td"`
  const activeAttr = `data-grid-row="${selRow.value}" data-grid-col="${selCol.value}" class="preview-interactive-td preview-td-selected"`
  return rawHtml.split(targetAttr).join(activeAttr)
})

watch(livePreviewHtml, () => {
  nextTick(() => {
    executePreviewCustomJs()
  })
})

function focusCodeAtCell(r: number, c: number) {
  const el = codeTextareaRef.value
  if (!el) return
  const addr = `${colIndexToLetter(c)}${r}`
  const text = el.value
  let needle = `id="cell-${addr}"`
  if (codeLangTab.value === 'css') {
    needle = `#cell-${addr}`
    if (!text.includes(needle)) needle = `tr[data-row="${r}"]`
  }
  const idx = text.indexOf(needle)
  if (idx !== -1) {
    el.focus()
    el.setSelectionRange(idx, idx + needle.length)
    const linesBefore = text.slice(0, idx).split('\n').length
    const targetScroll = Math.max(0, (linesBefore - 5) * 20)
    el.scrollTop = targetScroll
    if (codeGutterRef.value) codeGutterRef.value.scrollTop = targetScroll
  }
}

function onPreviewSheetClick(e: MouseEvent) {
  const target = (e.target as HTMLElement)?.closest('[data-grid-row]') as HTMLElement | null
  if (!target) return
  const r = Number(target.getAttribute('data-grid-row')) || 1
  const c = Number(target.getAttribute('data-grid-col')) || 1
  isEditingCell.value = false
  inlineTokenSuggest.visible = false
  selectCell(r, c, false)
  nextTick(() => {
    if (editorMode.value === 'code') {
      focusCodeAtCell(r, c)
      return
    }
    const gridCellEl = gridScrollWrapRef.value?.querySelector(
      `[data-cell-coord="${r}_${c}"]`
    ) as HTMLElement | null
    if (gridCellEl) {
      gridCellEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  })
}

function onPreviewSheetDblClick(e: MouseEvent) {
  const target = (e.target as HTMLElement)?.closest('[data-grid-row]') as HTMLElement | null
  if (!target) return
  const r = Number(target.getAttribute('data-grid-row')) || 1
  const c = Number(target.getAttribute('data-grid-col')) || 1
  selectCell(r, c, false)
  nextTick(() => {
    if (editorMode.value === 'code') {
      focusCodeAtCell(r, c)
      return
    }
    const gridCellEl = gridScrollWrapRef.value?.querySelector(
      `[data-cell-coord="${r}_${c}"]`
    ) as HTMLElement | null
    if (gridCellEl) {
      gridCellEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
    startInlineEdit(r, c)
  })
}

async function handleTestExport(format: 'excel' | 'word' | 'pdf' | 'png' | 'html') {
  if (!activeTpl.value) return
  const mockCtx = createMockQuoteContext(activeTpl.value)
  mockCtx.currency = previewCurrency.value
  const safeName = activeTpl.value.ten_mau.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Mau_Bao_Gia'

  try {
    if (format === 'excel') {
      showToast('Đang tạo file Excel thử nghiệm...')
      const blob = await generateExcelBlobFromTemplate(activeTpl.value, mockCtx)
      await deliverExportedFile(
        blob,
        `Test_${safeName}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      showToast('Đã tải file Excel!')
    } else if (format === 'word') {
      showToast('Đang xuất file Word (.doc)...')
      await exportWordFromTemplate(activeTpl.value, mockCtx, `Test_${safeName}`)
      showToast('Đã tải file Word (.doc)!')
    } else if (format === 'pdf') {
      exportPdfOrPrintFromTemplate(activeTpl.value, mockCtx, `Test_${safeName}`)
    } else if (format === 'png') {
      showToast('Đang kết xuất ảnh PNG...')
      await exportPngFromTemplate(activeTpl.value, mockCtx, `Test_${safeName}`)
      showToast('Đã tải ảnh PNG!')
    } else if (format === 'html') {
      await exportHtmlFileFromTemplate(activeTpl.value, mockCtx, `Test_${safeName}`)
      showToast('Đã tải file HTML!')
    }
  } catch (e: any) {
    console.error(e)
    showToast('Lỗi xuất thử: ' + (e.message || e))
  }
}

// Upload File / Logo to Cloudinary
async function uploadFileToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('upload_preset', 'upload_file')
  formData.append('file', file)
  const res = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
    method: 'POST',
    body: formData
  }).then(r => r.json())
  if (!res.secure_url) throw new Error('Không thể tải file lên Cloudinary')
  return res.secure_url
}

async function handleUploadLogoToCloudinary(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !activeTpl.value) return

  uploadingLogo.value = true
  try {
    showToast('Đang tải ảnh Logo lên Cloudinary...')
    const url = await uploadFileToCloudinary(file)
    activeTpl.value.cau_hinh_trang.logo_url = url
    activeTpl.value.cau_hinh_trang.logo_trai = url
    activeTpl.value.cau_hinh_trang.hien_thi_logo = true
    if (!activeTpl.value.grid_cells['1_1']?.value?.includes('{{LOGO')) {
      activeTpl.value.grid_cells['1_1'] = {
        value: '{{LOGO}}',
        style: { bold: true, fontSize: 10, align: 'left', valign: 'middle' }
      }
    }
    showToast('Đã tải Logo lên Cloudinary thành công!')
  } catch (err: any) {
    showToast('Lỗi tải Logo: ' + (err.message || err))
  } finally {
    uploadingLogo.value = false
    input.value = ''
  }
}

// CRUD & Sync Actions
async function loadTemplates(notify = false) {
  loading.value = true
  try {
    const list = await fetchAndSyncPrintTemplates()
    templates.value = list
    if (!activeTpl.value && list.length > 0) {
      selectTemplate(list[0])
    } else if (activeTpl.value) {
      const updated = list.find(t => t.id === activeTpl.value!.id)
      if (updated) selectTemplate(updated)
      else if (list.length > 0) selectTemplate(list[0])
    }
    if (notify) showToast(`Đã đồng bộ ${list.length} mẫu in!`)
  } finally {
    loading.value = false
  }
}

const editingCardId = ref<string | null>(null)
const editCardName = ref('')
const editCardNote = ref('')

function syncActiveMetaToList() {
  if (!activeTpl.value) return
  const idx = templates.value.findIndex(t => t.id === activeTpl.value!.id)
  if (idx >= 0) {
    templates.value[idx].ten_mau = activeTpl.value.ten_mau
    templates.value[idx].ghi_chu = activeTpl.value.ghi_chu
  }
}

function startEditCardMeta(tpl: PrintTemplateConfig) {
  editingCardId.value = tpl.id
  editCardName.value = tpl.ten_mau || ''
  editCardNote.value = tpl.ghi_chu || ''
}

function cancelEditCardMeta() {
  editingCardId.value = null
  editCardName.value = ''
  editCardNote.value = ''
}

async function saveCardMeta(tpl: PrintTemplateConfig) {
  const newName = (editCardName.value || '').trim() || 'Mẫu in'
  const newNote = (editCardNote.value ?? '').trim()
  saving.value = true
  try {
    tpl.ten_mau = newName
    tpl.ghi_chu = newNote
    if (activeTpl.value && activeTpl.value.id === tpl.id) {
      activeTpl.value.ten_mau = newName
      activeTpl.value.ghi_chu = newNote
      await savePrintTemplateToFirebase(activeTpl.value)
      const idx = templates.value.findIndex(t => t.id === activeTpl.value!.id)
      if (idx >= 0) {
        templates.value[idx] = JSON.parse(JSON.stringify(activeTpl.value))
      }
    } else {
      await savePrintTemplateToFirebase(tpl)
    }
    editingCardId.value = null
    showToast(`Đã lưu tên & ghi chú cho mẫu "${newName}"!`)
  } catch (e: any) {
    showToast('Lỗi lưu thông tin mẫu: ' + (e.message || e))
  } finally {
    saving.value = false
  }
}

function handleSelectCardInModal(tpl: PrintTemplateConfig) {
  if (editingCardId.value === tpl.id) return
  if (activeTpl.value && activeTpl.value.id === tpl.id) {
    showTemplateModal.value = false
    return
  }
  selectTemplate(tpl)
  showTemplateModal.value = false
}

function selectTemplate(tpl: PrintTemplateConfig) {
  const copy = ensureGridHeaderPopulated(JSON.parse(JSON.stringify(tpl)))
  activeTpl.value = copy
  editorMode.value = copy.che_do_soan_thao || 'manual'
  syncCodeBuffersFromTemplate()
  selectCell(1, 1, false)
}

async function handleSaveCurrentTemplate() {
  if (!activeTpl.value) return
  activeTpl.value.ten_mau = (activeTpl.value.ten_mau || '').trim() || 'Mẫu in'
  activeTpl.value.ghi_chu = (activeTpl.value.ghi_chu ?? '').trim()
  saving.value = true
  try {
    await savePrintTemplateToFirebase(activeTpl.value)
    const idx = templates.value.findIndex(t => t.id === activeTpl.value!.id)
    if (idx >= 0) {
      templates.value[idx] = JSON.parse(JSON.stringify(activeTpl.value))
    } else {
      templates.value.unshift(JSON.parse(JSON.stringify(activeTpl.value)))
    }
    showToast(`Đã lưu mẫu "${activeTpl.value.ten_mau}"!`)
  } catch (e: any) {
    showToast('Lỗi lưu mẫu: ' + (e.message || e))
  } finally {
    saving.value = false
  }
}

async function handleCreateStarterTemplate() {
  const newTpl = createStarterTemplateConfig(undefined, `Mẫu Chuẩn NTS (${templates.value.length + 1})`)
  await savePrintTemplateToFirebase(newTpl)
  templates.value.unshift(newTpl)
  selectTemplate(newTpl)
  showTemplateModal.value = false
  showToast('Đã khởi tạo Mẫu Chuẩn NTS mới!')
}

async function handleCreateDealRegTemplate() {
  const existing = templates.value.find(t => t.id === 'MINTL_DEAL_REG')
  const newId = existing ? `MINTL_DEAL_REG_${Date.now()}` : 'MINTL_DEAL_REG'
  const newName = existing ? `Mẫu Deal Registration (${templates.value.length + 1})` : 'Mẫu Deal Registration'
  const newTpl = createDealRegTemplateConfig(newId, newName)
  await savePrintTemplateToFirebase(newTpl)
  templates.value.unshift(newTpl)
  selectTemplate(newTpl)
  showTemplateModal.value = false
  showToast('Đã tạo Mẫu Deal Registration chuẩn 4 cột!')
}

async function handleCreateBlankTemplate() {
  const newTpl = createBlankTemplateConfig(`Mẫu Tự Tạo (${templates.value.length + 1})`)
  await savePrintTemplateToFirebase(newTpl)
  templates.value.unshift(newTpl)
  selectTemplate(newTpl)
  showTemplateModal.value = false
  showToast('Đã tạo mẫu mới có sẵn khung Header!')
}

async function handleImportExcelFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files || !files.length) return

  loading.value = true
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      showToast(`Đang phân tích & tải lên "${file.name}"...`)
      const buffer = await file.arrayBuffer()
      let cloudUrl = ''
      try {
        cloudUrl = await uploadFileToCloudinary(file)
      } catch (err) {
        console.warn('Upload Cloudinary lỗi, vẫn đọc cấu trúc tại chỗ:', err)
      }

      const newId = `MINTL_${Date.now()}_${i}`
      const parsedTpl = await parseExcelBufferToTemplateConfig(buffer, {
        id: newId,
        ten_mau: file.name.replace(/\.xlsx$/i, ''),
        link_file_goc: cloudUrl,
        ghi_chu: `Import từ file ${file.name}`
      })
      await savePrintTemplateToFirebase(parsedTpl)
      templates.value.unshift(parsedTpl)
      selectTemplate(parsedTpl)
    }
    showTemplateModal.value = false
    showToast('Đã import file Excel thành công!')
  } catch (err: any) {
    showToast('Lỗi import file: ' + (err.message || err))
  } finally {
    loading.value = false
    input.value = ''
  }
}

async function handleReplaceExcelForCurrentTemplate(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !activeTpl.value) return

  loading.value = true
  try {
    showToast(`Đang cập nhật cấu trúc từ "${file.name}"...`)
    const buffer = await file.arrayBuffer()
    let cloudUrl = activeTpl.value.link_file_goc
    try {
      cloudUrl = await uploadFileToCloudinary(file)
    } catch {}

    const parsed = await parseExcelBufferToTemplateConfig(buffer, {
      id: activeTpl.value.id,
      ten_mau: activeTpl.value.ten_mau,
      link_file_goc: cloudUrl,
      ghi_chu: activeTpl.value.ghi_chu
    })
    parsed.mac_dinh = activeTpl.value.mac_dinh
    await savePrintTemplateToFirebase(parsed)
    selectTemplate(parsed)
    showSettingsModal.value = false
    showToast('Đã cập nhật lại lưới thiết kế từ file Excel mới!')
  } catch (err: any) {
    showToast('Lỗi đọc file: ' + (err.message || err))
  } finally {
    loading.value = false
    input.value = ''
  }
}

async function handleSetDefault(tpl: PrintTemplateConfig) {
  await setDefaultPrintTemplateInFirebase(tpl.id, templates.value)
  if (activeTpl.value && activeTpl.value.id === tpl.id) {
    activeTpl.value.mac_dinh = true
  }
  showToast(`Đã đặt "${tpl.ten_mau}" làm mẫu in mặc định!`)
}

async function handleDuplicate(tpl: PrintTemplateConfig) {
  const copy: PrintTemplateConfig = JSON.parse(JSON.stringify(tpl))
  copy.id = `MINTL_${Date.now()}`
  copy.ten_mau = `${tpl.ten_mau} (Bản sao)`
  copy.mac_dinh = false
  copy.source_upload_id = undefined
  await savePrintTemplateToFirebase(copy)
  templates.value.push(copy)
  selectTemplate(copy)
  showToast(`Đã nhân bản mẫu "${copy.ten_mau}"`)
}

function handleDownloadOriginal(tpl: PrintTemplateConfig) {
  if (!tpl.link_file_goc) return
  const a = document.createElement('a')
  a.href = tpl.link_file_goc
  a.download = `${tpl.ten_mau}.xlsx`
  a.target = '_blank'
  a.click()
}

async function handleDeleteTemplate(tpl: PrintTemplateConfig) {
  if (!confirm(`Bạn có chắc chắn muốn xóa mẫu in "${tpl.ten_mau}" không?`)) return
  saving.value = true
  try {
    await deletePrintTemplateFromFirebase(tpl)
    templates.value = templates.value.filter(t => t.id !== tpl.id)
    if (templates.value.length > 0 && !templates.value.some(t => t.mac_dinh)) {
      templates.value[0].mac_dinh = true
      await setDefaultPrintTemplateInFirebase(templates.value[0].id, templates.value)
    }
    if (activeTpl.value?.id === tpl.id && templates.value.length > 0) {
      selectTemplate(templates.value[0])
    }
    showToast(`Đã xóa vĩnh viễn mẫu "${tpl.ten_mau}"`)
  } catch (e: any) {
    showToast('Lỗi xóa mẫu in: ' + (e.message || e))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const mainEl = document.querySelector('.main-content') as HTMLElement | null
  if (mainEl) {
    mainEl.style.overflow = ''
    mainEl.style.overflowY = 'auto'
  }
  window.addEventListener('keydown', handleGridKeydown)
  loadTemplates(false)
})
</script>

<style scoped>
.quan-ly-mau-in {
  min-height: 100vh;
  padding: 12px 16px;
  background: #0b1118;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 10px;
  user-select: none;
  touch-action: pan-y pan-x;
}

/* ===== PAGE HEADER ===== */
.page-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(16, 185, 129, 0.28);
  border-radius: 12px;
  padding: 10px 16px;
}

.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.header-meta-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%;
}

.header-meta-field {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 240px;
}

.header-meta-field.meta-note-field {
  flex: 1.5 1 300px;
}

.header-meta-field label {
  font-size: 11.5px;
  font-weight: 700;
  color: #34d399;
  white-space: nowrap;
}

.header-meta-field input {
  flex: 1;
  min-width: 140px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f8fafc;
  padding: 6px 10px;
  border-radius: 7px;
  font-size: 12.5px;
  transition: border-color 0.15s ease;
}

.header-meta-field input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18);
}

.header-meta-save-btn {
  flex-shrink: 0;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #10b981;
}

.page-subtitle {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.16s ease;
  color: #ffffff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-template-picker {
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.5);
  padding: 7px 14px;
}

.btn-template-picker:hover {
  background: rgba(16, 185, 129, 0.24);
}

.picker-label {
  color: #94a3b8;
  font-weight: 600;
}

.picker-name {
  color: #34d399;
  font-size: 13px;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-default-tag {
  background: rgba(245, 158, 11, 0.22);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 99px;
}

.picker-count {
  color: #cbd5e1;
  font-size: 11px;
}

.btn-emerald {
  background: linear-gradient(135deg, #10b981, #059669);
}

.btn-blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.btn-indigo {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

.btn-amber {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
}

.btn-ghost {
  background: transparent;
  border-color: rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
}

/* ===== SPLIT WORKSPACE: LEFT GRID & RIGHT PREVIEW ===== */
.split-workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
  min-width: 0;
}

.split-panel {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: visible;
}

/* ===== RIBBONS ===== */
.grid-ribbon,
.preview-ribbon {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 12px;
  background: #1e293b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.grid-ribbon {
  justify-content: flex-start;
}

.ribbon-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ribbon-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.ribbon-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0 2px;
}

.ribbon-select {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #f8fafc;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.ribbon-num {
  width: 48px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #f8fafc;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
}

.ribbon-icon-btn {
  min-width: 28px;
  height: 26px;
  padding: 0 7px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  cursor: pointer;
  font-size: 11px;
}

.ribbon-icon-btn.active {
  background: #3b82f6;
  border-color: #60a5fa;
  color: #ffffff;
}

.ribbon-btn-sm {
  height: 26px;
  padding: 0 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.ribbon-btn-sm:hover {
  background: rgba(255, 255, 255, 0.14);
}

.btn-upload-logo {
  background: rgba(245, 158, 11, 0.18);
  border-color: rgba(245, 158, 11, 0.45);
  color: #fbbf24;
}

.btn-merge {
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(59, 130, 246, 0.4);
  color: #93c5fd;
}

.color-picker-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
}

.color-picker-label input[type='color'] {
  width: 18px;
  height: 18px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

/* ===== MODE SWITCH (THỦ CÔNG | CODE) & CODE STUDIO ===== */
.ribbon-mode-switch {
  display: inline-flex;
  align-items: center;
  background: #0f172a;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 7px;
  padding: 2px;
  gap: 2px;
}

.mode-switch-btn {
  height: 24px;
  padding: 0 10px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-switch-btn:hover {
  color: #e2e8f0;
}

.mode-switch-btn.active {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #ffffff;
  box-shadow: 0 1px 4px rgba(14, 165, 233, 0.35);
}

.code-lang-tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.code-lang-tab {
  height: 25px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(15, 23, 42, 0.75);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.code-lang-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.code-lang-tab.lang-html.active {
  background: rgba(249, 115, 22, 0.22);
  border-color: #f97316;
  color: #fdba74;
}

.code-lang-tab.lang-css.active {
  background: rgba(56, 189, 248, 0.22);
  border-color: #38bdf8;
  color: #7dd3fc;
}

.code-lang-tab.lang-js.active {
  background: rgba(234, 179, 8, 0.22);
  border-color: #eab308;
  color: #fde047;
}

.btn-code-token {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  color: #6ee7b7;
}

.btn-code-token:hover {
  background: rgba(16, 185, 129, 0.28);
}

.code-sync-badge {
  font-size: 11px;
  font-weight: 600;
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 3px 8px;
  border-radius: 6px;
}

.code-js-err-badge {
  font-size: 11px;
  font-weight: 700;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.45);
  padding: 3px 8px;
  border-radius: 6px;
}

.code-studio-container {
  display: flex;
  flex-direction: column;
  background: #0b1120;
  min-height: 620px;
  max-height: 78vh;
}

.code-studio-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 12px;
  background: #111827;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.code-info-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.code-file-badge {
  font-family: 'Consolas', 'Fira Code', monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}

.code-file-badge.badge-html {
  background: rgba(249, 115, 22, 0.2);
  color: #fb923c;
  border: 1px solid rgba(249, 115, 22, 0.4);
}

.code-file-badge.badge-css {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.code-file-badge.badge-js {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
  border: 1px solid rgba(234, 179, 8, 0.4);
}

.code-hint-text {
  font-size: 11px;
  color: #94a3b8;
}

.code-info-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.code-cell-jump-btn {
  background: rgba(59, 130, 246, 0.16);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #93c5fd;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 5px;
  cursor: pointer;
}

.code-cell-jump-btn:hover {
  background: rgba(59, 130, 246, 0.28);
}

.code-editor-body {
  position: relative;
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 560px;
}

.code-line-gutter {
  width: 44px;
  padding: 12px 6px 12px 0;
  background: #090d16;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  color: #475569;
  font-family: 'Consolas', 'Fira Code', 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 20px;
  text-align: right;
  user-select: none;
  overflow: hidden;
  flex-shrink: 0;
}

.code-line-num {
  height: 20px;
  padding-right: 4px;
}

.code-studio-textarea {
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  padding: 12px 14px;
  background: #0b1120;
  color: #e2e8f0;
  font-family: 'Consolas', 'Fira Code', 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 20px;
  tab-size: 2;
  white-space: pre;
  overflow: auto;
  user-select: text;
}

.code-studio-textarea:focus {
  background: #0d1526;
}

.preview-ribbon-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-title-tag {
  font-size: 12px;
  font-weight: 700;
  color: #34d399;
}

.preview-export-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.btn-export-xlsx {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.45);
  color: #34d399;
}

.btn-export-word {
  background: rgba(99, 102, 241, 0.22);
  border-color: rgba(99, 102, 241, 0.5);
  color: #a5b4fc;
}

.btn-export-pdf {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.45);
  color: #93c5fd;
}

.btn-export-png {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.45);
  color: #fbbf24;
}

/* ===== PAPER CANVAS SCROLL (MATCHING PAGE CONFIG, NO WASTED SPACE) ===== */
.paper-canvas-scroll {
  position: relative;
  padding: 12px;
  background: #1e293b;
  border-radius: 0 0 12px 12px;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y pan-x;
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: none;
}

.grid-paper-sheet {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  border-radius: 4px;
  box-sizing: border-box;
  touch-action: pan-y pan-x;
  transition: max-width 0.2s ease, padding 0.2s ease;
}

.preview-paper-sheet {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  border-radius: 4px;
  overflow: hidden;
  touch-action: pan-y pan-x;
  transition: max-width 0.2s ease;
}

.preview-paper-sheet :deep(.preview-interactive-td) {
  cursor: pointer;
  touch-action: pan-y pan-x;
  transition: outline 0.12s ease, background-color 0.12s ease;
}

.preview-paper-sheet :deep(.preview-interactive-td:hover) {
  outline: 1.5px dashed #3b82f6;
  outline-offset: -1.5px;
  background-color: rgba(59, 130, 246, 0.07);
}

.preview-paper-sheet :deep(.preview-td-selected) {
  outline: 2px solid #f59e0b !important;
  outline-offset: -2px;
  background-color: rgba(245, 158, 11, 0.12) !important;
}

/* ===== SPREADSHEET TABLE WITH EXCEL ROW & COLUMN HEADINGS ===== */
.spreadsheet-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  background: #ffffff;
  touch-action: pan-y pan-x;
}

.grid-row-heading-col {
  width: 34px;
}

.grid-corner-th {
  width: 34px;
  height: 24px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #94a3b8;
  font-size: 9px;
  text-align: right;
  vertical-align: bottom;
  padding: 2px 3px;
  cursor: pointer;
  user-select: none;
}

.grid-corner-th:hover {
  background: #e2e8f0;
  color: #2563eb;
}

.grid-col-heading-th {
  position: relative;
  height: 24px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  vertical-align: middle;
  padding: 0 4px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.grid-col-heading-th:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.grid-col-heading-th.isActiveCol {
  background: #dbeafe;
  color: #1d4ed8;
  border-bottom: 2px solid #2563eb;
}

.grid-col-heading-th.isPrimaryCol {
  background: #bfdbfe;
  color: #1e40af;
}

.grid-col-heading-th.isZeroSize {
  padding: 0 !important;
  font-size: 0 !important;
  overflow: visible;
  border-right: 2px double #64748b;
}

.col-heading-resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
}

.col-heading-resize-handle:hover {
  background: #3b82f6;
}

.grid-row-heading-th {
  position: relative;
  width: 34px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  vertical-align: middle;
  padding: 0 2px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.grid-row-heading-th.isZeroSize {
  padding: 0 !important;
  font-size: 0 !important;
  line-height: 0 !important;
  height: 0px !important;
  overflow: visible;
  border-bottom: 2px double #64748b;
}

.grid-row-heading-th:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.grid-row-heading-th.isActiveRow {
  background: #dbeafe;
  color: #1d4ed8;
  border-right: 2px solid #2563eb;
}

.grid-row-heading-th.isPrimaryRow {
  background: #bfdbfe;
  color: #1e40af;
}

.grid-row-heading-th.isPreviewHighlightRow {
  background: #fef3c7 !important;
  color: #b45309 !important;
  border-right: 2.5px solid #f59e0b !important;
}

.grid-row-heading-th.row-role-tag-header {
  border-left: 3px solid #3b82f6;
}

.grid-row-heading-th.row-role-tag-group {
  border-left: 3px solid #f59e0b;
}

.grid-row-heading-th.row-role-tag-item {
  border-left: 3px solid #10b981;
}

.grid-row-heading-th.row-role-tag-total {
  border-left: 3px solid #8b5cf6;
}

.row-heading-resize-handle {
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: row-resize;
  z-index: 10;
}

.row-heading-resize-handle:hover {
  background: #3b82f6;
}

.grid-cell-td {
  position: relative;
  padding: 4px 7px;
  box-sizing: border-box;
  cursor: cell;
  word-break: break-word;
  overflow: visible;
}

.grid-cell-td.logoRowBottomLine {
  border-bottom: 3px solid #ed7d31 !important;
  padding: 0 0 2px 0 !important;
}

.grid-cell-td.isInRange {
  background-color: rgba(59, 130, 246, 0.12) !important;
}

tr.isPreviewRowHighlighted > td.grid-cell-td {
  background-image: linear-gradient(rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.08));
}

.grid-cell-td.isSelected {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
  z-index: 5;
}

.grid-cell-td.isPreviewHighlighted {
  outline: 2.5px solid #f59e0b !important;
  outline-offset: -2px;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.28);
  z-index: 15;
}

.grid-cell-td.isEditing {
  outline: 2px solid #10b981 !important;
  outline-offset: -2px;
  z-index: 60;
}

/* Direct Resize Handles on Cell Borders */
.cell-col-resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 8;
}

.cell-col-resize-handle:hover {
  background: rgba(59, 130, 246, 0.5);
}

.cell-row-resize-handle {
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: row-resize;
  z-index: 8;
}

.cell-row-resize-handle:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* ===== RESIZABLE SINGLE LOGO INSIDE GRID ===== */
.grid-logo-cell-wrap {
  width: 100%;
  display: block;
  padding: 0;
  box-sizing: border-box;
}

.grid-logo-resizable {
  position: relative;
  display: block;
  box-sizing: border-box;
  max-width: 100%;
  border: 1.5px dashed rgba(37, 99, 235, 0.45);
  border-radius: 4px;
  padding: 0;
  background: rgba(248, 250, 252, 0.6);
  transition: border-color 0.15s;
}

.grid-logo-resizable:hover {
  border-color: #2563eb;
  background: rgba(239, 246, 255, 0.7);
}

.grid-logo-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: fill;
  pointer-events: none;
}

.logo-overlay-tools {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.92;
  z-index: 14;
}

.logo-upload-mini {
  background: rgba(15, 23, 42, 0.85);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.5);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  cursor: pointer;
}

.logo-upload-mini:hover {
  background: #0f172a;
}

.logo-full-btn {
  background: rgba(16, 185, 129, 0.9);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
}

.logo-full-btn:hover {
  background: #059669;
}

.logo-size-badge {
  background: rgba(37, 99, 235, 0.88);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 4px;
}

.logo-resize-edge-e {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: ew-resize;
  z-index: 11;
}

.logo-resize-edge-e:hover {
  background: rgba(37, 99, 235, 0.35);
}

.logo-resize-edge-s {
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 8px;
  cursor: ns-resize;
  z-index: 11;
}

.logo-resize-edge-s:hover {
  background: rgba(37, 99, 235, 0.35);
}

.logo-resize-handle {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 14px;
  height: 14px;
  background: #2563eb;
  border: 2px solid #ffffff;
  border-radius: 3px;
  cursor: nwse-resize;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  z-index: 12;
}

.logo-resize-handle:hover {
  transform: scale(1.2);
  background: #10b981;
}

.logo-hidden-notice {
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
}

/* ===== FLOATING ZOOMED POP-OUT CELL EDITOR & INLINE TOKEN DROPDOWN ===== */
.inline-cell-editor-wrap {
  position: absolute;
  top: -4px;
  left: -4px;
  min-width: max(calc(100% + 8px), 260px);
  width: max(calc(100% + 8px), 260px);
  background: #ffffff;
  border: 2px solid #2563eb;
  border-radius: 6px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
  z-index: 80;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.inline-cell-editor-wrap.alignRightEdge {
  left: auto;
  right: -4px;
}

.inline-editor-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  color: #e2e8f0;
  padding: 3px 7px;
  border-radius: 4px 4px 0 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.inline-editor-coord {
  font-size: 10px;
  font-weight: 700;
  color: #93c5fd;
}

.inline-editor-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.inline-editor-act-btn {
  border: none;
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.inline-editor-act-btn.token {
  background: #10b981;
  color: #ffffff;
}

.inline-editor-act-btn.cancel {
  background: rgba(239, 68, 68, 0.22);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

.inline-editor-act-btn.cancel:hover {
  background: #ef4444;
  color: #ffffff;
}

.inline-editor-act-btn.done {
  background: rgba(255, 255, 255, 0.16);
  color: #f8fafc;
}

.inline-cell-textarea {
  width: 100%;
  min-height: 58px;
  border: none;
  outline: none;
  padding: 6px 8px;
  box-sizing: border-box;
  background: #ffffff;
  resize: both;
  border-radius: 0 0 4px 4px;
  font-family: inherit;
  line-height: 1.4;
}

.inline-token-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 310px;
  max-height: 260px;
  background: #0f172a;
  border: 1px solid #10b981;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
  z-index: 99;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-align: left;
}

.inline-cell-editor-wrap.alignRightEdge .inline-token-dropdown {
  left: auto;
  right: 0;
}

.inline-tk-head {
  padding: 6px 8px;
  background: #1e293b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.inline-tk-head span {
  font-size: 10px;
  font-weight: 700;
  color: #34d399;
}

.inline-tk-search {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f8fafc;
  padding: 4px 7px;
  border-radius: 5px;
  font-size: 11px;
}

.inline-tk-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  max-height: 195px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.inline-tk-item {
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.inline-tk-item:hover,
.inline-tk-item.active {
  background: rgba(16, 185, 129, 0.2);
}

.inline-tk-item code {
  font-size: 11px;
  font-weight: 700;
  color: #34d399;
}

.inline-tk-lbl {
  font-size: 11px;
  color: #cbd5e1;
  text-align: right;
}

.inline-tk-empty {
  padding: 10px;
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
}

.cell-content-render {
  min-height: 16px;
  line-height: 1.35;
}

:deep(.cell-token-pill) {
  display: inline-block;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.35);
  border-radius: 4px;
  padding: 0 4px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.9em;
  font-weight: 700;
}

.cell-quick-Overlay {
  position: absolute;
  top: -20px;
  right: 0;
  display: inline-flex;
  gap: 3px;
  z-index: 15;
}

.cell-quick-btn {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid #475569;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.cell-quick-btn.token-btn {
  background: #059669;
  border-color: #10b981;
  color: #ffffff;
}

/* ===== MODALS ===== */
.studio-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.78);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.studio-modal {
  background: #0f172a;
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 14px;
  width: 100%;
  max-width: 980px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
}

.modal-head {
  padding: 14px 20px;
  background: #1e293b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-head h3 {
  margin: 0;
  font-size: 16px;
  color: #10b981;
}

.modal-head p {
  margin: 3px 0 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.modal-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #f8fafc;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.modal-body {
  padding: 18px 20px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-tpl-edit-box {
  display: grid;
  grid-template-columns: 1fr 1.2fr auto;
  align-items: end;
  gap: 12px;
  background: #1e293b;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.current-tpl-save-col {
  display: flex;
  align-items: flex-end;
}

.current-tpl-save-btn {
  height: 33px;
  white-space: nowrap;
}

.modal-tpl-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.modal-templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.tpl-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.16s ease;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tpl-card:hover {
  border-color: rgba(16, 185, 129, 0.5);
  transform: translateY(-1px);
}

.tpl-card.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(30, 41, 59, 0.95));
  border-color: #10b981;
}

.tpl-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tpl-type-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
  background: rgba(59, 130, 246, 0.16);
  color: #60a5fa;
}

.tpl-type-badge.imported_excel {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
}

.tpl-default-badge {
  font-size: 10px;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.16);
  padding: 2px 7px;
  border-radius: 99px;
}

.tpl-card-name {
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
}

.tpl-card-meta {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  gap: 6px;
}

.tpl-card-note {
  font-size: 11px;
  color: #cbd5e1;
}

.tpl-card-note-empty {
  color: #64748b;
  font-style: italic;
}

.tpl-card-inline-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 8px;
  padding: 8px 10px;
  margin: 2px 0;
}

.tpl-card-inline-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.tpl-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 4px;
}

.mini-btn {
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  cursor: pointer;
}

.mini-btn.mini-edit {
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.12);
}

.mini-btn.mini-save {
  color: #ffffff;
  background: #10b981;
  border-color: #059669;
}

.mini-btn.mini-star {
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.35);
}

.mini-btn.mini-danger {
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

/* ===== SETTINGS MODAL ===== */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.settings-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-card h4 {
  margin: 0;
  font-size: 14px;
  color: #34d399;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-field label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

.form-field input,
.form-field select {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #f8fafc;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #e2e8f0;
  cursor: pointer;
}

.logo-upload-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #0f172a;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-upload-preview {
  width: 140px;
  height: 64px;
  background: #ffffff;
  border-radius: 6px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-upload-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-upload-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logo-width-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.logo-width-field label {
  font-size: 11px;
  color: #94a3b8;
}

.logo-width-field input {
  width: 80px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f8fafc;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 12px;
}

/* ===== MODAL 3: TOKEN CATALOG TABLE MODAL ===== */
.modal-token-xl {
  max-width: 1080px;
  width: 96%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.token-modal-toolbar {
  padding: 12px 18px;
  background: #1e293b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
}

.token-modal-search {
  flex: 1 1 260px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f8fafc;
  padding: 7px 12px;
  border-radius: 7px;
  font-size: 12px;
}

.token-group-filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tk-filter-pill {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.tk-filter-pill:hover {
  border-color: #60a5fa;
  color: #ffffff;
}

.tk-filter-pill.active {
  background: #2563eb;
  border-color: #3b82f6;
  color: #ffffff;
}

.insert-mode-switch {
  display: flex;
  gap: 6px;
}

.insert-mode-switch label {
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 6px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.insert-mode-switch label.active {
  border-color: #10b981;
  color: #34d399;
}

.token-modal-body {
  padding: 16px 18px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: block;
}

.token-table-section {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  margin-bottom: 18px;
}

.token-table-section:last-child {
  margin-bottom: 0;
}

.token-section-banner {
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.65);
  border-left: 4px solid #10b981;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.token-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #f8fafc;
}

.token-section-desc {
  font-size: 11px;
  color: #94a3b8;
}

.token-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.token-catalog-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}

.token-catalog-table thead th {
  background: #0f172a;
  color: #94a3b8;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.token-catalog-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.12s;
}

.token-catalog-row:hover {
  background: rgba(37, 99, 235, 0.14);
}

.token-catalog-row td {
  padding: 8px 12px;
  vertical-align: middle;
}

.token-code-badge {
  display: inline-block;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 3px 7px;
  border-radius: 5px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 11.5px;
  font-weight: 700;
}

.token-col-label {
  color: #f1f5f9;
  font-weight: 600;
}

.token-col-sample {
  color: #cbd5e1;
  font-size: 11.5px;
  white-space: pre-line;
}

.token-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-insert-token {
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.btn-insert-token:hover {
  background: #059669;
}

.copy-tk-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  cursor: pointer;
}

.copy-tk-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.token-empty-state {
  padding: 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

/* ===== CONTEXT MENU ===== */
.grid-context-menu {
  position: fixed;
  width: 270px;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
  z-index: 250;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ctx-quick-styles {
  display: flex;
  gap: 4px;
}

.ctx-quick-styles button {
  flex: 1;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  border-radius: 5px;
  padding: 4px 0;
  font-size: 11px;
  cursor: pointer;
}

.ctx-quick-styles button.active {
  background: #2563eb;
  border-color: #60a5fa;
}

.ctx-color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 4px;
  font-size: 11px;
  color: #94a3b8;
}

.ctx-swatches {
  display: flex;
  gap: 5px;
}

.swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.ctx-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 2px 0;
}

.ctx-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
}

.ctx-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.ctx-item.danger {
  color: #f87171;
}

.ctx-item kbd {
  font-size: 10px;
  color: #94a3b8;
  background: #1e293b;
  padding: 1px 5px;
  border-radius: 4px;
}

.ctx-sub-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  padding: 2px 6px;
}

.ctx-role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 0 4px;
}

.ctx-role-grid button {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 11px;
  padding: 4px 6px;
  border-radius: 5px;
  cursor: pointer;
}

.ctx-role-grid button.active {
  background: rgba(16, 185, 129, 0.22);
  border-color: #10b981;
  color: #34d399;
}

/* ===== TOAST ===== */
.studio-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #10b981;
  color: #052e16;
  font-weight: 700;
  font-size: 13px;
  padding: 10px 18px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
  z-index: 300;
}

@media (max-width: 1200px) {
  .split-workspace {
    grid-template-columns: 1fr;
  }
  .settings-grid,
  .current-tpl-edit-box {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px), (pointer: coarse) {
  .cell-col-resize-handle,
  .cell-row-resize-handle,
  .col-heading-resize-handle,
  .row-heading-resize-handle {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .quan-ly-mau-in {
    min-height: auto;
    height: auto;
    overflow: visible;
    padding: 10px 8px calc(96px + env(safe-area-inset-bottom, 0px)) 8px;
    touch-action: pan-y pan-x;
  }

  .page-header {
    padding: 10px 12px;
    gap: 8px;
  }

  .header-actions {
    width: 100%;
    gap: 6px;
  }

  .header-meta-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .header-meta-field,
  .header-meta-field.meta-note-field {
    flex: 1 1 auto;
    width: 100%;
  }

  .header-meta-save-btn,
  .current-tpl-save-btn {
    width: 100%;
    justify-content: center;
  }

  .btn-template-picker {
    width: 100%;
    justify-content: space-between;
  }

  .split-workspace {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
  }

  .split-panel {
    width: 100%;
    overflow: visible;
  }

  .grid-ribbon,
  .preview-ribbon {
    padding: 8px;
    gap: 6px;
  }

  .paper-canvas-scroll {
    padding: 6px;
    overflow-x: auto;
    overflow-y: visible !important;
    touch-action: pan-y pan-x !important;
  }

  .grid-cell-td,
  .grid-col-heading-th,
  .grid-row-heading-th {
    touch-action: pan-y pan-x !important;
  }

  .form-row-2,
  .form-row-3 {
    grid-template-columns: 1fr;
  }

  .logo-upload-card {
    flex-direction: column;
    align-items: stretch;
  }

  .studio-modal-backdrop {
    padding: 8px;
    padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px));
    z-index: 10050;
  }

  .studio-modal,
  .modal-token-xl {
    max-height: calc(100dvh - 84px);
    width: 100%;
  }

  .modal-body,
  .token-modal-body {
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
  }

  .studio-toast {
    bottom: calc(70px + env(safe-area-inset-bottom, 0px));
    right: 12px;
    left: 12px;
    text-align: center;
  }
}
</style>
