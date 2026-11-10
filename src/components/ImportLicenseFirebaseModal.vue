<template>
  <div
    class="lic-modal-overlay"
    :class="{ 'theme-light-blue': theme === 'light' }"
    @click.self="$emit('close')"
  >
    <div class="lic-modal-card">
      <!-- HEADER MODAL (ĐỒNG BỘ 100% MODAL CHỈNH SỬA LICENSE & SALEREPORT) -->
      <div class="lic-modal-head">
        <div class="lic-modal-head-left">
          <span class="lic-modal-head-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </span>
          <div class="lic-modal-title-row">
            <h3>Thêm mới thông tin License</h3>
          </div>
        </div>
        <button type="button" class="lic-modal-close-x" @click="$emit('close')" title="Đóng cửa sổ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- BODY CHIA 2 CỘT 50% TRÁI / 50% PHẢI -->
      <div class="lic-modal-body">
        <!-- Input ẩn cho Quét Ảnh & Upload PDF -->
        <input
          ref="imageFileInput"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="onImageFilesSelected"
        />
        <input
          ref="pdfFileInput"
          type="file"
          accept=".pdf,application/pdf"
          multiple
          style="display: none"
          @change="onPdfFilesSelected"
        />

        <div class="lic-modal-split-workspace">
          <!-- CỘT TRÁI (50%): TẢI LÊN & XEM TRƯỚC CHỨNG TỪ LICENSE (ẢNH / PDF) -->
          <div class="lic-modal-preview-col">
            <div class="lic-modal-banner is-teal-head">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>TẢI LÊN &amp; XEM TRƯỚC CHỨNG TỪ LICENSE (50%)</span>
            </div>

            <!-- Thanh công cụ Quét Ảnh / Upload PDF nằm cố định trên khung Preview -->
            <div class="lic-card-preview-bar is-modal-bar">
              <div class="lic-card-preview-tabs">
                <button
                  type="button"
                  class="lic-preview-tab-btn"
                  :class="{ 'is-active': !showRawOcrView }"
                  @click="showRawOcrView = false"
                >
                  <span>{{ activeCard?.NAME_FILE || 'Xem Chứng Từ' }}</span>
                </button>
                <button
                  v-if="activeCard?._rawText"
                  type="button"
                  class="lic-preview-tab-btn"
                  :class="{ 'is-active': showRawOcrView }"
                  @click="showRawOcrView = !showRawOcrView"
                  title="Xem văn bản thô trích xuất từ file"
                >
                  <span>Dữ liệu thô (OCR)</span>
                </button>
              </div>

              <div class="lic-modal-bar-actions">
                <button
                  type="button"
                  class="lic-scan-replace-btn is-image-btn"
                  :disabled="scanning || saving || activeCard?._aiProcessing"
                  @click="triggerImageInput"
                  title="Chọn file Ảnh chứng nhận License để quét OCR"
                >
                  <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Quét Ảnh (OCR)</span>
                </button>

                <button
                  type="button"
                  class="lic-scan-replace-btn is-pdf-btn"
                  :disabled="scanning || saving || activeCard?._aiProcessing"
                  @click="triggerPdfInput"
                  title="Chọn 1 hoặc nhiều file PDF License để bóc tách tự động"
                >
                  <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <polyline points="9 15 12 12 15 15"/>
                  </svg>
                  <span>Upload PDF</span>
                </button>

                <button
                  v-if="activeCard?._file || activeCard?._rawText"
                  type="button"
                  class="lic-scan-replace-btn is-ai-btn"
                  :disabled="scanning || saving || activeCard?._aiProcessing"
                  @click="processCardWithAI(activeCard)"
                  title="Dùng AI thông minh phân tích lại thông số từ chứng từ Ảnh / PDF"
                >
                  <span v-if="activeCard?._aiProcessing" class="spinner-small"></span>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
                  <span>{{ activeCard?._aiProcessing ? 'AI đang đọc...' : 'Quét AI' }}</span>
                </button>

                <a
                  v-if="activePreviewUrl"
                  :href="activePreviewUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="lic-open-file-btn"
                  title="Mở xem chứng từ trên tab mới"
                >
                  Mở rộng ↗
                </a>
              </div>
            </div>

            <!-- Cảnh báo định dạng lệch chuẩn gợi ý quét AI -->
            <div v-if="activeCard?._formatError && !scanning" class="lic-format-warn-strip">
              <span>Chứng từ này không theo mẫu chuẩn tự động. Bạn có thể nhập tay hoặc bấm nút bên cạnh để AI bóc tách:</span>
              <button
                type="button"
                class="lic-format-ai-cta"
                :disabled="activeCard?._aiProcessing"
                @click="processCardWithAI(activeCard)"
              >
                <span v-if="activeCard?._aiProcessing" class="spinner-small"></span>
                <span>{{ activeCard?._aiProcessing ? 'Đang phân tích AI...' : 'Phân tích bằng AI' }}</span>
              </button>
            </div>

            <!-- KHUNG PREVIEW CHÍNH / DROPZONE CHỌN QUÉT ẢNH HOẶC UPLOAD PDF -->
            <div
              class="lic-modal-preview-stage"
              :class="{ 'is-dragging': isDraggingFile }"
              @dragover.prevent="isDraggingFile = true"
              @dragleave.prevent="isDraggingFile = false"
              @drop.prevent="handleDropFiles"
            >
              <!-- Trạng thái 1: Đang quét file -->
              <div v-if="scanning || activeCard?._aiProcessing" class="lic-scanning-box">
                <div class="lic-scanner-visual">
                  <div class="lic-scanner-beam"></div>
                  <img
                    v-if="activePreviewUrl && activeCard?._fileKind === 'image'"
                    :src="activePreviewUrl"
                    class="lic-scanning-thumb"
                    alt="Scanning"
                  />
                  <svg v-else width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <strong class="lic-scanning-title">
                  {{ activeCard?._aiProcessing ? (activeCard?._aiProgressMsg || 'Đang phân tích dữ liệu License bằng AI...') : `Đang đọc & bóc tách chứng từ... ${Math.round(scanProgress * 100)}%` }}
                </strong>
                <div class="lic-scan-progress-track">
                  <div class="lic-scan-progress-fill" :style="{ width: `${Math.max(12, Math.round(scanProgress * 100))}%` }"></div>
                </div>
              </div>

              <!-- Trạng thái 2: Xem văn bản thô OCR -->
              <div v-else-if="showRawOcrView && activeCard?._rawText" class="lic-raw-ocr-wrap">
                <textarea
                  readonly
                  :value="activeCard._rawText"
                  class="lic-raw-ocr-textarea"
                  placeholder="Văn bản thô trích xuất từ chứng từ..."
                ></textarea>
              </div>

              <!-- Trạng thái 3: Đã có file Ảnh hoặc PDF để xem trước -->
              <template v-else-if="activePreviewUrl">
                <div
                  v-if="activeCard?._fileKind === 'image'"
                  class="lic-preview-img-wrap"
                  title="Nhấn vào ảnh để phóng to"
                  @click="showImageModal = true"
                >
                  <img :src="activePreviewUrl" :alt="activeCard?.NAME_FILE || 'License'" class="lic-preview-img" />
                </div>
                <iframe
                  v-else
                  :src="activePreviewUrl"
                  class="lic-preview-iframe"
                  title="Xem trước PDF License"
                ></iframe>
              </template>

              <!-- Trạng thái 4 (Mặc định Kiểu 2): Khu vực chọn Quét Ảnh (OCR) hoặc Upload PDF -->
              <div v-else class="lic-preview-empty is-upload-hub">
                <div class="lic-upload-hub-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                </div>
                <strong class="lic-upload-hub-title">Chọn phương thức tải lên Chứng từ License</strong>
                <span class="lic-upload-hub-sub">
                  Kéo thả file vào khung này, nhấn <kbd>Ctrl</kbd> + <kbd>V</kbd> để dán nhanh, hoặc chọn 1 trong 2 nút bên dưới:
                </span>

                <div class="lic-upload-hub-actions">
                  <button
                    type="button"
                    class="lic-hub-choice-btn is-image"
                    :disabled="scanning || saving"
                    @click="triggerImageInput"
                  >
                    <span class="lic-hub-choice-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </span>
                    <span class="lic-hub-choice-text">
                      <strong>Quét Ảnh (OCR)</strong>
                      <small>Chụp / tải ảnh chứng nhận (.png, .jpg, .webp)</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    class="lic-hub-choice-btn is-pdf"
                    :disabled="scanning || saving"
                    @click="triggerPdfInput"
                  >
                    <span class="lic-hub-choice-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </span>
                    <span class="lic-hub-choice-text">
                      <strong>Upload File PDF</strong>
                      <small>Hỗ trợ chọn 1 hoặc nhiều file PDF cùng lúc</small>
                    </span>
                  </button>
                </div>

                <span class="lic-upload-hub-manual-note">
                  Hoặc bạn có thể nhập tay trực tiếp thông số bản quyền ở cột bên phải →
                </span>
              </div>
            </div>
          </div>

          <!-- CỘT PHẢI (50%): THÔNG SỐ BẢN QUYỀN, KHÁCH HÀNG, LIÊN KẾT PO & THỜI HẠN (CHUẨN PHƯƠNG ÁN A) -->
          <div class="lic-modal-specs-col" v-if="activeCard">
            <!-- Thanh chuyển đổi Mặt hàng khi tải nhiều file / PDF có nhiều sản phẩm -->
            <div v-if="formDatas.length > 1" class="lic-multi-items-bar">
              <div class="lic-multi-items-tabs">
                <button
                  v-for="(item, idx) in formDatas"
                  :key="item._uid || idx"
                  type="button"
                  class="lic-multi-item-tab"
                  :class="{
                    'is-active': activeCardIdx === idx,
                    'is-dup-block': getCardDuplicateInfo(item, idx).status === 'exact_duplicate',
                    'is-dup-renewal': getCardDuplicateInfo(item, idx).status === 'renewal_candidate'
                  }"
                  @click="activeCardIdx = idx"
                >
                  <span
                    class="lic-multi-item-dot"
                    :class="{
                      'is-block': getCardDuplicateInfo(item, idx).status === 'exact_duplicate',
                      'is-renewal': getCardDuplicateInfo(item, idx).status === 'renewal_candidate',
                      'is-ok': !getCardDuplicateInfo(item, idx).isDuplicate
                    }"
                  ></span>
                  <span>Mặt hàng #{{ idx + 1 }}</span>
                  <small v-if="item.LICENSE_ID">({{ item.LICENSE_ID }})</small>
                  <span
                    class="lic-multi-item-del"
                    title="Xóa mặt hàng này"
                    @click.stop="removeItem(idx)"
                  >✕</span>
                </button>
              </div>
            </div>

            <!-- KHỐI 1: THÔNG SỐ BẢN QUYỀN & LIÊN KẾT PO -->
            <div class="lic-modal-group">
              <div class="lic-modal-banner is-blue-head">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>THÔNG SỐ BẢN QUYỀN &amp; LIÊN KẾT PO (50%)</span>
              </div>

              <!-- Cảnh báo trùng License ID / Gia hạn theo Phương án 2 -->
              <div
                v-if="activeCardDuplicateInfo.isDuplicate"
                class="lic-modal-dup-banner"
                :class="activeCardDuplicateInfo.status === 'exact_duplicate' ? 'is-block' : 'is-renewal'"
              >
                <div class="lic-modal-dup-head">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <strong v-if="activeCardDuplicateInfo.status === 'exact_duplicate'">
                    CẢNH BÁO TRÙNG LICENSE ID / SERIAL KEY — CHẶN THÊM MỚI
                  </strong>
                  <strong v-else>
                    PHÁT HIỆN LICENSE ID ĐÃ TỒN TẠI (KHÁC NGÀY HẾT HẠN — GIA HẠN KỲ MỚI)
                  </strong>
                </div>
                <p class="lic-modal-dup-desc">{{ activeCardDuplicateInfo.message }}</p>
              </div>

              <!-- HÀNG 1: KHỐI CHỌN TÊN KHÁCH HÀNG / CTY (DATABASE) & LIÊN KẾT PO CHÍNH THỨC -->
              <LicenseCustomerPoPicker
                :modelValue="activeCard"
                :customers="dbCustomers"
                :officialPos="officialPos"
                :theme="theme"
                @change-customer="onCardCustomerChanged(activeCard)"
                @customer-saved="onCardCustomerSaved($event, activeCard)"
                @view-po="$emit('close')"
              />

              <!-- HÀNG 2 (FULL 100%): KHÁCH HÀNG (TÊN GỐC TRÊN FILE LICENSE) -->
              <div class="lic-form-row is-full">
                <div class="lic-form-field">
                  <label>Khách hàng (Tên gốc trên File License)</label>
                  <input
                    type="text"
                    v-model="activeCard.CUSTOMER"
                    class="lic-input"
                    placeholder="Tên công ty đầy đủ trên chứng từ License..."
                  />
                </div>
              </div>

              <!-- HÀNG 3 (2 CỘT): LICENSE ID & NHÀ SẢN XUẤT (HÃNG) -->
              <div class="lic-form-row">
                <div class="lic-form-field">
                  <label class="lic-label-with-dup-pill">
                    <span>License ID / Serial Key</span>
                    <span v-if="activeCardDuplicateInfo.status === 'exact_duplicate'" class="lic-dup-inline-pill is-block">Trùng lặp</span>
                    <span v-else-if="activeCardDuplicateInfo.status === 'renewal_candidate'" class="lic-dup-inline-pill is-renewal">Gia hạn</span>
                  </label>
                  <input
                    type="text"
                    v-model="activeCard.LICENSE_ID"
                    class="lic-input"
                    placeholder="Nhập License ID / Serial Key..."
                  />
                </div>
                <div class="lic-form-field">
                  <label>Nhà sản xuất (Hãng)</label>
                  <div class="lic-input-with-picker">
                    <input
                      type="text"
                      v-model="activeCard.NHA_SAN_XUAT"
                      class="lic-input has-picker-btn"
                      placeholder="Sophos, Kaspersky, Acronis..."
                    />
                    <button
                      type="button"
                      class="lic-inline-picker-btn"
                      @click="showVendorPickerModal = true"
                      title="Mở modal chọn hãng / nhà sản xuất"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                      <span>Chọn</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- HÀNG 4 (TỈ LỆ 65% - 35%): TÊN SẢN PHẨM & MÃ SẢN PHẨM -->
              <div class="lic-form-row is-product-split">
                <div class="lic-form-field">
                  <label>Tên sản phẩm (Product Name)</label>
                  <input
                    type="text"
                    v-model="activeCard.PRODUCT_NAME"
                    class="lic-input"
                    placeholder="Tên phần mềm / gói bản quyền..."
                  />
                </div>
                <div class="lic-form-field">
                  <label>Mã sản phẩm (Product Code)</label>
                  <input
                    type="text"
                    v-model="activeCard.PRODUCT_CODE"
                    class="lic-input"
                    placeholder="Nhập mã sản phẩm..."
                  />
                </div>
              </div>

              <!-- HÀNG 5 (3 CỘT GỌN): SỐ LƯỢNG, LOẠI LICENSE & LOCALIZATION -->
              <div class="lic-form-row is-three-cols">
                <div class="lic-form-field">
                  <label>Số lượng (Volume)</label>
                  <input
                    type="text"
                    v-model="activeCard.LICENSE_VOLUME"
                    class="lic-input"
                    placeholder="VD: 10, 50..."
                  />
                </div>
                <div class="lic-form-field">
                  <label>Loại License (Type)</label>
                  <input
                    type="text"
                    v-model="activeCard.LICENSE_TYPE"
                    class="lic-input"
                    placeholder="VD: Base, Renewal..."
                  />
                </div>
                <div class="lic-form-field">
                  <label>Khu vực / Ngôn ngữ (Localization)</label>
                  <input
                    type="text"
                    v-model="activeCard.LOCALIZATION"
                    class="lic-input"
                    placeholder="VD: Vietnamese, Global..."
                  />
                </div>
              </div>
            </div>

            <!-- KHỐI 2: THỜI GIAN, HIỆU LỰC GIA HẠN & MÔ TẢ -->
            <div class="lic-modal-group">
              <div class="lic-modal-banner is-green-head">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>THỜI GIAN, HIỆU LỰC GIA HẠN &amp; MÔ TẢ</span>
              </div>

              <div class="lic-form-row">
                <div class="lic-form-field">
                  <label>Ngày cấp (DD/MM/YYYY)</label>
                  <LicenseDatePickerInput
                    v-model="activeCard.DATE_OF_LICENSE"
                    :theme="theme"
                    placeholder="Chọn ngày cấp..."
                  />
                </div>
                <div class="lic-form-field">
                  <label>Ngày hết hạn (DD/MM/YYYY)</label>
                  <LicenseDatePickerInput
                    v-model="activeCard.EXPIRATION_TIME"
                    :theme="theme"
                    placeholder="Chọn ngày hết hạn..."
                    @change="onCardExpDateChange(activeCard, $event)"
                  />
                </div>
              </div>

              <div class="lic-form-row">
                <div class="lic-form-field">
                  <label>Số ngày cộng thêm (sau hết hạn)</label>
                  <input
                    type="number"
                    v-model="activeCard._graceDays"
                    class="lic-input"
                    placeholder="VD: 10, 30..."
                    @input="onCardGraceDaysInput(activeCard)"
                  />
                  <small v-if="activeCard._graceDays !== '' && activeCard.EXPIRATION_TIME" class="lic-grace-preview">
                    → Hạn hiệu lực: <b>{{ addDaysToLicenseDate(activeCard.EXPIRATION_TIME, activeCard._graceDays) }}</b>
                  </small>
                </div>
                <div class="lic-form-field">
                  <label>Hạn hiệu lực (Ân hạn DD/MM/YYYY)</label>
                  <LicenseDatePickerInput
                    v-model="activeCard.SO_NGAY_HIEU_LUC"
                    :theme="theme"
                    placeholder="Chọn hạn hiệu lực..."
                    @change="onCardGraceDateChange(activeCard, $event)"
                  />
                </div>
              </div>

              <div class="lic-form-field">
                <label>Mô tả (Description)</label>
                <textarea
                  v-model="activeCard.LICENSE_DESCRIPTION"
                  class="lic-input"
                  rows="2"
                  placeholder="Ghi chú chi tiết..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="lic-modal-err-strip">{{ errorMsg }}</div>
      </div>

      <!-- FOOTER MODAL (ĐỒNG BỘ MODAL CHỈNH SỬA LICENSE) -->
      <div class="lic-modal-foot">
        <div class="lic-foot-left-actions">
          <button
            type="button"
            class="lic-foot-btn is-add-more"
            :disabled="saving || scanning"
            @click="addNewManualItem"
          >
            <span>+ Thêm mặt hàng</span>
          </button>
          <button
            v-if="formDatas.length > 1"
            type="button"
            class="lic-foot-btn is-danger"
            :disabled="saving || scanning"
            @click="removeItem(activeCardIdx)"
          >
            <span>✕ Xóa mặt hàng #{{ activeCardIdx + 1 }}</span>
          </button>
        </div>

        <div style="display: flex; gap: 10px;">
          <button
            type="button"
            class="lic-foot-btn is-secondary"
            :disabled="saving"
            @click="$emit('close')"
          >
            Đóng
          </button>
          <button
            type="button"
            class="lic-foot-btn is-primary"
            :class="{
              'is-blocked': hasBlockedDuplicates,
              'is-renewal': !hasBlockedDuplicates && hasRenewalCandidates
            }"
            :disabled="saving || scanning || hasBlockedDuplicates"
            @click="saveData"
          >
            <span v-if="saving" class="spinner-small"></span>
            <span v-else-if="hasBlockedDuplicates">Trùng License ID (Không thể lưu)</span>
            <span v-else-if="hasRenewalCandidates">
              {{ formDatas.length > 1 ? `Lưu & Cập nhật Gia hạn (${formDatas.length} mặt hàng)` : 'Cập nhật Gia hạn vào License cũ' }}
            </span>
            <span v-else>
              {{ formDatas.length > 1 ? `Lưu ${formDatas.length} mặt hàng` : 'Lưu bản quyền' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận / thông báo -->
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

    <!-- Phóng to ảnh khi click -->
    <div v-if="showImageModal && activePreviewUrl" class="lic-img-zoom-overlay" @click="showImageModal = false">
      <button type="button" class="lic-btn-close-zoom" @click="showImageModal = false">✕</button>
      <img :src="activePreviewUrl" class="lic-zoomed-img" @click.stop alt="Zoomed License" />
    </div>

    <!-- Modal chọn Hãng / Nhà sản xuất -->
    <LicenseVendorPickerModal
      v-if="activeCard"
      v-model:show="showVendorPickerModal"
      v-model="activeCard.NHA_SAN_XUAT"
      :officialPos="officialPos"
      :theme="theme"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, push, set } from 'firebase/database'
import AsyncConfirmModal from './AsyncConfirmModal.vue'
import LicenseCustomerPoPicker from './LicenseCustomerPoPicker.vue'
import LicenseVendorPickerModal from './LicenseVendorPickerModal.vue'
import LicenseDatePickerInput from './LicenseDatePickerInput.vue'
import {
  loadCustomerAndPoCatalog,
  fuzzyMatchCustomer,
  syncLicenseToSaleReportPO,
  propagateCustomerToSameVendorLicenses,
  normalizeViText,
  addDaysToLicenseDate,
  diffDaysBetweenLicenseDates,
  formatLicenseDateStr,
  extractLicenseRecordsFromFile,
  extractSmartLicenseWithAI,
  uploadLicenseFileToCloudinary,
  loadExistingLicensesCatalog,
  inspectLicenseDuplicate,
  applyRenewalUpdateToExistingLicense,
  normalizeLicenseIdKey
} from '../utils/licensePoSync'

const props = defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['close', 'import-success'])

const firebaseConfig = {
  apiKey: 'AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8',
  authDomain: 'chusonproject.firebaseapp.com',
  databaseURL: 'https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'chusonproject',
  storageBucket: 'chusonproject.firebasestorage.app',
  messagingSenderId: '929199941311',
  appId: '1:929199941311:web:ca8d86f9fd7f8dff61480a',
  measurementId: 'G-48VVPGFSFK'
}
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const database = getDatabase(firebaseApp)

const asyncModal = ref({
  show: false,
  type: 'confirm',
  title: '',
  msg: '',
  confirmText: 'Đồng ý',
  cancelText: 'Hủy'
})
let confirmResolve = null
const confirmAction = (title, msg, confirmText = 'Đồng ý', cancelText = 'Hủy') => {
  return new Promise(resolve => {
    asyncModal.value = { show: true, type: 'confirm', title, msg, confirmText, cancelText }
    confirmResolve = resolve
  })
}
const handleAsyncConfirm = () => {
  asyncModal.value.show = false
  if (confirmResolve) confirmResolve(true)
}
const handleAsyncCancel = () => {
  if (confirmResolve) confirmResolve(false)
  asyncModal.value.show = false
}

const imageFileInput = ref(null)
const pdfFileInput = ref(null)
const scanning = ref(false)
const scanProgress = ref(0)
const saving = ref(false)
const errorMsg = ref('')
const isDraggingFile = ref(false)
const showRawOcrView = ref(false)
const showImageModal = ref(false)
const showVendorPickerModal = ref(false)

const dbCustomers = ref([])
const officialPos = ref([])
const existingLicensesCatalog = ref([])

let uidCounter = 1
const createEmptyCard = (fileName = '') => ({
  _uid: `LIC_NEW_${Date.now()}_${uidCounter++}`,
  LICENSE_ID: '',
  CUSTOMER: '',
  MA_KHACH_HANG: '',
  TEN_CONG_TY: '',
  SO_PO: '',
  PO_FIREBASE_KEY: '',
  PRODUCT_NAME: '',
  LOCALIZATION: '',
  LICENSE_VOLUME: '',
  LICENSE_DESCRIPTION: '',
  DATE_OF_LICENSE: '',
  EXPIRATION_TIME: '',
  LICENSE_TYPE: '',
  PRODUCT_CODE: '',
  LINK_FILE: '',
  NAME_FILE: fileName,
  SO_NGAY_HIEU_LUC: '',
  NHA_SAN_XUAT: '',
  _graceDays: 30,
  _file: null,
  _previewUrl: '',
  _fileKind: 'pdf',
  _formatError: false,
  _rawText: '',
  _aiProcessing: false
})

const formDatas = ref([createEmptyCard()])
const activeCardIdx = ref(0)

const activeCard = computed(() => {
  return formDatas.value[activeCardIdx.value] || formDatas.value[0] || null
})

const activePreviewUrl = computed(() => {
  const card = activeCard.value
  if (!card) return ''
  return card._previewUrl || card.LINK_FILE || ''
})

const isCardCompletelyBlank = (card) => {
  if (!card) return true
  return (
    !String(card.LICENSE_ID || '').trim() &&
    !String(card.CUSTOMER || '').trim() &&
    !String(card.PRODUCT_NAME || '').trim() &&
    !String(card.PRODUCT_CODE || '').trim() &&
    !String(card.EXPIRATION_TIME || '').trim() &&
    !String(card.LINK_FILE || '').trim() &&
    !String(card._previewUrl || '').trim() &&
    !card._file
  )
}

// ============================================================================
// KIỂM TRA TRÙNG LICENSE_ID / SERIAL KEY & GIA HẠN (PHƯƠNG ÁN 2)
// ============================================================================
const getCardDuplicateInfo = (card, cardIdx) => {
  if (!card) return { isDuplicate: false, status: 'ok', message: '' }
  const dbCheck = inspectLicenseDuplicate(card, existingLicensesCatalog.value)
  if (dbCheck.isDuplicate) return dbCheck

  const normId = normalizeLicenseIdKey(card.LICENSE_ID)
  if (normId && typeof cardIdx === 'number' && cardIdx > 0) {
    const candExp = formatLicenseDateStr(card.EXPIRATION_TIME)
    for (let i = 0; i < cardIdx; i++) {
      const prev = formDatas.value[i]
      if (!prev) continue
      if (normalizeLicenseIdKey(prev.LICENSE_ID) === normId) {
        const prevExp = formatLicenseDateStr(prev.EXPIRATION_TIME)
        if (prevExp === candExp) {
          return {
            isDuplicate: true,
            status: 'exact_duplicate',
            matchedRecord: prev,
            message: `Trùng License ID "${card.LICENSE_ID}" với Mặt hàng #${i + 1} ngay trong danh sách đang thêm mới. Vui lòng xóa bớt 1 mặt hàng trùng lặp!`
          }
        }
      }
    }
  }
  return { isDuplicate: false, status: 'ok', message: '' }
}

const activeCardDuplicateInfo = computed(() => {
  return getCardDuplicateInfo(activeCard.value, activeCardIdx.value)
})

const hasBlockedDuplicates = computed(() => {
  return formDatas.value.some((card, idx) => getCardDuplicateInfo(card, idx).status === 'exact_duplicate')
})

const hasRenewalCandidates = computed(() => {
  return formDatas.value.some((card, idx) => getCardDuplicateInfo(card, idx).status === 'renewal_candidate')
})

// ============================================================================
// ĐỒNG BỘ 2 CHIỀU NGÀY HẾT HẠN <-> SỐ NGÀY CỘNG THÊM <-> HẠN HIỆU LỰC
// ============================================================================
const onCardGraceDaysInput = (card) => {
  if (!card) return
  if (card._graceDays !== '' && card._graceDays !== null && card.EXPIRATION_TIME) {
    card.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(card.EXPIRATION_TIME, card._graceDays)
  }
}

const onCardExpDateChange = (card, newExp) => {
  if (!card) return
  if (card._graceDays !== '' && card._graceDays !== null && newExp) {
    card.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(newExp, card._graceDays)
  } else if (newExp && card.SO_NGAY_HIEU_LUC) {
    const diff = diffDaysBetweenLicenseDates(newExp, card.SO_NGAY_HIEU_LUC)
    card._graceDays = diff !== null ? diff : ''
  }
}

const onCardGraceDateChange = (card, newGrace) => {
  if (!card) return
  if (!newGrace) {
    card._graceDays = ''
    return
  }
  if (card.EXPIRATION_TIME) {
    const diff = diffDaysBetweenLicenseDates(card.EXPIRATION_TIME, newGrace)
    card._graceDays = diff !== null ? diff : ''
  }
}

// ============================================================================
// ĐỒNG BỘ KHÁCH HÀNG GIỮA CÁC MẶT HÀNG CÙNG TÊN CUSTOMER
// ============================================================================
const onCardCustomerChanged = (card) => {
  if (!card || !card.CUSTOMER) return
  const normVendor = normalizeViText(card.CUSTOMER)
  if (!normVendor || (!card.MA_KHACH_HANG && !card.TEN_CONG_TY)) return
  formDatas.value.forEach(other => {
    if (other === card) return
    if (normalizeViText(other.CUSTOMER) === normVendor && !other.MA_KHACH_HANG && !other.TEN_CONG_TY) {
      other.MA_KHACH_HANG = card.MA_KHACH_HANG || ''
      other.TEN_CONG_TY = card.TEN_CONG_TY || ''
      other.TEN_KHACH_HANG = card.TEN_KHACH_HANG || ''
    }
  })
}

const onCardCustomerSaved = (savedCust, card) => {
  if (!savedCust) return
  const idx = dbCustomers.value.findIndex(
    c => c.firebaseKey === savedCust.firebaseKey || c.ma_khach_hang === savedCust.ma_khach_hang
  )
  if (idx >= 0) dbCustomers.value.splice(idx, 1, savedCust)
  else dbCustomers.value.unshift(savedCust)
  onCardCustomerChanged(card)
}

const addNewManualItem = () => {
  const next = createEmptyCard()
  formDatas.value.push(next)
  activeCardIdx.value = formDatas.value.length - 1
  showRawOcrView.value = false
}

const removeItem = (idx) => {
  if (formDatas.value.length <= 1) {
    formDatas.value = [createEmptyCard()]
    activeCardIdx.value = 0
    return
  }
  formDatas.value.splice(idx, 1)
  if (activeCardIdx.value >= formDatas.value.length) {
    activeCardIdx.value = Math.max(0, formDatas.value.length - 1)
  }
}

// ============================================================================
// XỬ LÝ TẢI LÊN & QUÉT FILE ẢNH (OCR) / FILE PDF
// ============================================================================
const triggerImageInput = () => {
  if (imageFileInput.value) imageFileInput.value.click()
}

const triggerPdfInput = () => {
  if (pdfFileInput.value) pdfFileInput.value.click()
}

const onImageFilesSelected = async (e) => {
  const files = Array.from(e.target?.files || [])
  if (e.target) e.target.value = ''
  if (files.length > 0) {
    await processUploadedFiles(files)
  }
}

const onPdfFilesSelected = async (e) => {
  const files = Array.from(e.target?.files || [])
  if (e.target) e.target.value = ''
  if (files.length > 0) {
    await processUploadedFiles(files)
  }
}

const handleDropFiles = async (e) => {
  isDraggingFile.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length > 0) {
    await processUploadedFiles(files)
  }
}

const handlePaste = async (e) => {
  const tag = String(e.target?.tagName || '').toLowerCase()
  if ((tag === 'input' || tag === 'textarea') && (!e.clipboardData?.files || e.clipboardData.files.length === 0)) {
    return
  }
  if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
    e.preventDefault()
    await processUploadedFiles(Array.from(e.clipboardData.files))
  }
}

const processUploadedFiles = async (filesList) => {
  const validFiles = filesList.filter(
    f => f && (f.type === 'application/pdf' || /\.pdf$/i.test(f.name || '') || f.type.startsWith('image/'))
  )
  if (validFiles.length === 0) {
    errorMsg.value = 'Vui lòng chọn file Hình ảnh (.png, .jpg, .webp) hoặc file PDF (.pdf).'
    return
  }

  errorMsg.value = ''
  scanning.value = true
  scanProgress.value = 0.12
  showRawOcrView.value = false

  const replaceCurrentBlank =
    formDatas.value.length === 1 && isCardCompletelyBlank(formDatas.value[0])
  const newlyCreatedCards = []

  try {
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')
      const fileKind = isPdf ? 'pdf' : 'image'
      const localPreviewUrl = URL.createObjectURL(file)

      // Hiển thị preview ngay lập tức nếu đang thay thế card đầu tiên
      if (replaceCurrentBlank && i === 0 && formDatas.value[0]) {
        formDatas.value[0]._previewUrl = localPreviewUrl
        formDatas.value[0]._fileKind = fileKind
        formDatas.value[0].NAME_FILE = file.name
      }

      scanProgress.value = 0.15 + 0.75 * (i / validFiles.length)

      const [cloudUrl, extractedRecords] = await Promise.all([
        uploadLicenseFileToCloudinary(file),
        extractLicenseRecordsFromFile(file, false)
      ])

      const recordsToUse =
        Array.isArray(extractedRecords) && extractedRecords.length > 0
          ? extractedRecords
          : [createEmptyCard(file.name)]

      recordsToUse.forEach(rec => {
        const expStr = formatLicenseDateStr(rec.EXPIRATION_TIME || '')
        const graceStr =
          formatLicenseDateStr(rec.SO_NGAY_HIEU_LUC || '') ||
          (expStr ? addDaysToLicenseDate(expStr, 30) : '')
        const diffDays = expStr && graceStr ? diffDaysBetweenLicenseDates(expStr, graceStr) : 30

        const cardObj = {
          ...createEmptyCard(file.name),
          ...rec,
          DATE_OF_LICENSE: formatLicenseDateStr(rec.DATE_OF_LICENSE || ''),
          EXPIRATION_TIME: expStr,
          SO_NGAY_HIEU_LUC: graceStr,
          _graceDays: diffDays !== null ? diffDays : 30,
          NAME_FILE: file.name,
          LINK_FILE: cloudUrl || '',
          _file: file,
          _previewUrl: localPreviewUrl,
          _fileKind: fileKind,
          _formatError: Boolean(rec._formatError),
          _rawText: String(rec._rawText || ''),
          _aiProcessing: false,
          _aiProgressMsg: ''
        }
        autoMatchCardCustomerFromDb(cardObj)
        newlyCreatedCards.push(cardObj)
      })
    }

    scanProgress.value = 1
    if (newlyCreatedCards.length > 0) {
      if (replaceCurrentBlank) {
        formDatas.value = newlyCreatedCards
        activeCardIdx.value = 0
      } else {
        const firstNewIdx = formDatas.value.length
        formDatas.value.push(...newlyCreatedCards)
        activeCardIdx.value = firstNewIdx
      }
    }
  } catch (err) {
    console.error('Lỗi khi đọc và bóc tách chứng từ License:', err)
    errorMsg.value = 'Có lỗi xảy ra khi đọc file: ' + (err.message || String(err))
  } finally {
    scanning.value = false
  }

  // Hướng B: Khi quét thường không nhận diện được định dạng chuẩn, bật hộp thoại hỏi người dùng có dùng AI thông minh để quét không
  const unparsedCards = newlyCreatedCards.filter(c => c._formatError && (c._file || c._rawText))
  if (unparsedCards.length > 0) {
    const promptMsg =
      unparsedCards.length === 1
        ? `Hệ thống không tự động nhận diện được định dạng chuẩn của file "${unparsedCards[0].NAME_FILE}". Bạn có muốn sử dụng AI để quét và bóc tách thông số License không?`
        : `Có ${unparsedCards.length} chứng từ không theo mẫu chuẩn tự động. Bạn có muốn sử dụng AI để quét và bóc tách thông số License cho các file này không?`

    const allowAi = await confirmAction(
      'Sử dụng AI để quét thông số License?',
      promptMsg,
      'Sử dụng AI để quét',
      'Để tự nhập tay'
    )
    asyncModal.value.show = false

    if (allowAi) {
      for (const card of unparsedCards) {
        const idx = formDatas.value.indexOf(card)
        if (idx >= 0) {
          activeCardIdx.value = idx
        }
        await processCardWithAI(card)
      }
    }
  }
}

const autoMatchCardCustomerFromDb = (card) => {
  if (!card || card.MA_KHACH_HANG || !card.CUSTOMER) return
  const matchRes = fuzzyMatchCustomer(card.CUSTOMER, dbCustomers.value)
  const matchedCust = matchRes?.matched || null
  if (matchedCust) {
    card.MA_KHACH_HANG = matchedCust.ma_khach_hang || ''
    card.TEN_CONG_TY = matchedCust.ten_cong_ty || ''
    if (matchedCust.ten_khach_hang) {
      card.TEN_KHACH_HANG = matchedCust.ten_khach_hang
    }
    onCardCustomerChanged(card)
  }
}

const processCardWithAI = async (card) => {
  if (!card || (!card._file && !card._rawText)) return
  card._aiProcessing = true
  card._aiProgressMsg = 'Đang dùng AI phân tích chứng từ License...'
  errorMsg.value = ''
  try {
    const aiRecords = await extractSmartLicenseWithAI(
      card._file || null,
      card._rawText || '',
      card.NAME_FILE,
      msg => {
        card._aiProgressMsg = msg
      }
    )
    if (Array.isArray(aiRecords) && aiRecords.length > 0) {
      const parsed = aiRecords[0]
      Object.keys(parsed).forEach(k => {
        if (!k.startsWith('_') && k !== 'LINK_FILE' && k !== 'NAME_FILE' && parsed[k]) {
          card[k] = parsed[k]
        }
      })
      if (card.EXPIRATION_TIME) {
        card.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(
          card.EXPIRATION_TIME,
          card._graceDays !== '' && card._graceDays !== null ? card._graceDays : 30
        )
      }
      autoMatchCardCustomerFromDb(card)
      card._formatError = false
    } else {
      errorMsg.value = 'AI không tìm thấy thông tin hợp lệ từ chứng từ này. Vui lòng kiểm tra và nhập tay.'
    }
  } catch (err) {
    console.error('processCardWithAI error:', err)
    errorMsg.value = 'Lỗi khi gọi AI phân tích: ' + (err.message || String(err))
  } finally {
    card._aiProcessing = false
    card._aiProgressMsg = ''
  }
}

// ============================================================================
// LƯU BẢN QUYỀN (KIỂM TRA TRÙNG & HỖ TRỢ GIA HẠN THEO PHƯƠNG ÁN 2)
// ============================================================================
const saveData = async () => {
  errorMsg.value = ''
  const latestCatalog = await loadExistingLicensesCatalog(database)
  existingLicensesCatalog.value = latestCatalog

  const blockedItems = []
  const renewalItems = []

  formDatas.value.forEach((card, idx) => {
    const dup = getCardDuplicateInfo(card, idx)
    if (dup.status === 'exact_duplicate') {
      blockedItems.push({ index: idx, card, dup })
    } else if (dup.status === 'renewal_candidate' && dup.matchedRecord?.firebaseKey) {
      renewalItems.push({ index: idx, card, dup })
    }
  })

  if (blockedItems.length > 0) {
    activeCardIdx.value = blockedItems[0].index
    const summaryMsg = blockedItems
      .map(b => `• Mặt hàng #${b.index + 1}: ${b.dup.message}`)
      .join('\n')
    errorMsg.value = summaryMsg
    asyncModal.value = {
      show: true,
      type: 'error',
      title: 'Cảnh báo trùng License ID — Chặn thêm mới',
      msg: `${summaryMsg}\n\nVui lòng xóa mặt hàng bị trùng hoặc kiểm tra lại mã License ID trước khi lưu!`
    }
    return
  }

  if (renewalItems.length > 0) {
    const renewalSummary = renewalItems
      .map(
        r =>
          `• Mặt hàng #${r.index + 1} (${r.card.LICENSE_ID}): Hết hạn cũ ${r.dup.oldExpDate || '—'} → Mới ${r.dup.newExpDate || '—'}`
      )
      .join('\n')
    const confirmedRenewal = await confirmAction(
      'Phát hiện License ID đã tồn tại (Gia hạn kỳ mới)',
      `${renewalSummary}\n\nHệ thống chặn tạo mới bản ghi trùng mã. Bạn có muốn CẬP NHẬT (Ghi đè) kỳ hạn & chứng từ mới vào License cũ tương ứng không?`,
      'Cập nhật vào License cũ'
    )
    if (!confirmedRenewal) return
  } else {
    const confirmedSave = await confirmAction(
      'Lưu dữ liệu bản quyền',
      formDatas.value.length > 1
        ? `Bạn có chắc chắn muốn lưu ${formDatas.value.length} mặt hàng License này?`
        : 'Bạn có chắc chắn muốn lưu thông tin chứng nhận License này?',
      'Lưu bản quyền'
    )
    if (!confirmedSave) return
  }

  saving.value = true
  asyncModal.value = {
    show: true,
    type: 'loading',
    title: 'Đang xử lý...',
    msg: 'Đang lưu dữ liệu bản quyền và đồng bộ hệ thống...'
  }

  try {
    // Đảm bảo các file chưa có LINK_FILE được tải lên Cloudinary
    const uniqueFilesMap = new Map()
    formDatas.value.forEach(card => {
      if (card._file && !card.LINK_FILE && !uniqueFilesMap.has(card._file)) {
        uniqueFilesMap.set(card._file, '')
      }
    })

    for (const [fileObj] of uniqueFilesMap.entries()) {
      const url = await uploadLicenseFileToCloudinary(fileObj)
      if (url) {
        uniqueFilesMap.set(fileObj, url)
      }
    }

    for (let idx = 0; idx < formDatas.value.length; idx++) {
      const card = formDatas.value[idx]
      if (!card.LINK_FILE && card._file && uniqueFilesMap.get(card._file)) {
        card.LINK_FILE = uniqueFilesMap.get(card._file)
      }
      if (!card.SO_NGAY_HIEU_LUC && card.EXPIRATION_TIME) {
        const gDays = card._graceDays !== '' && card._graceDays !== null ? card._graceDays : 30
        card.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(card.EXPIRATION_TIME, gDays)
      }

      const dup = getCardDuplicateInfo(card, idx)
      const payload = { ...card }
      delete payload._uid
      delete payload._graceDays
      delete payload._file
      delete payload._previewUrl
      delete payload._fileKind
      delete payload._formatError
      delete payload._rawText
      delete payload._aiProcessing
      delete payload._autoMatchedCust
      delete payload.sheet
      delete payload.action
      delete payload.IS_GIA_HAN

      if (dup.status === 'renewal_candidate' && dup.matchedRecord?.firebaseKey) {
        await applyRenewalUpdateToExistingLicense(
          database,
          dup.matchedRecord.firebaseKey,
          payload,
          dup.matchedRecord
        )
      } else {
        const newRef = push(dbRef(database, 'license_old_data'))
        await set(newRef, payload)
        if (payload.PO_FIREBASE_KEY) {
          await syncLicenseToSaleReportPO(database, newRef.key, payload)
        }
        if (payload.CUSTOMER && (payload.MA_KHACH_HANG || payload.TEN_CONG_TY)) {
          await propagateCustomerToSameVendorLicenses(database, payload.CUSTOMER, payload, newRef.key)
        }
      }
    }

    asyncModal.value = {
      show: true,
      type: 'success',
      title: 'Thành công!',
      msg:
        renewalItems.length > 0
          ? 'Đã lưu & cập nhật kỳ hạn gia hạn mới thành công!'
          : 'Đã thêm mới dữ liệu bản quyền thành công!'
    }
    setTimeout(() => {
      asyncModal.value.show = false
      emit('import-success')
      emit('close')
    }, 1100)
  } catch (err) {
    console.error('Lỗi lưu dữ liệu License:', err)
    errorMsg.value = 'Có lỗi xảy ra khi lưu dữ liệu lên máy chủ.'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: errorMsg.value }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  window.addEventListener('paste', handlePaste)
  const [catalog, existingLics] = await Promise.all([
    loadCustomerAndPoCatalog(database),
    loadExistingLicensesCatalog(database)
  ])
  dbCustomers.value = catalog.customers
  officialPos.value = catalog.officialPos
  existingLicensesCatalog.value = existingLics
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
  formDatas.value.forEach(c => {
    if (c._previewUrl && c._previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(c._previewUrl)
    }
  })
})
</script>

<style scoped>
/* ============================================================================
   MODAL THÊM MỚI LICENSE — ĐỒNG BỘ 100% GIAO DIỆN MODAL CHỈNH SỬA LICENSE
   ============================================================================ */
.lic-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
}

.lic-modal-card {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  background: #0b141c;
  border: none;
  box-shadow: none;
  overflow: hidden;
  color: #f8fafc;
}

.lic-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 20px;
  background: linear-gradient(90deg, #059669 0%, #047857 55%, #0f766e 100%);
  border-bottom: 1px solid rgba(52, 211, 153, 0.32);
  border-radius: 0;
  color: #ffffff;
  flex-shrink: 0;
}

.lic-modal-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.lic-modal-head-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.34);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lic-modal-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.lic-modal-title-row h3 {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.01em;
}

.lic-modal-close-x {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(15, 23, 42, 0.28);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
  padding: 0;
}

.lic-modal-close-x:hover {
  background: rgba(239, 68, 68, 0.55);
  border-color: #fecaca;
}

.lic-modal-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 18px;
  overflow: hidden;
}

.lic-modal-split-workspace {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.lic-modal-preview-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: rgba(8, 15, 28, 0.75);
  border: 1px solid rgba(52, 211, 153, 0.28);
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.lic-modal-specs-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.lic-modal-group {
  padding: 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 11px;
}

/* Header khối nền Gradient chuẩn Template */
.lic-modal-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 2px;
  border-radius: 8px;
  border: 1px solid rgba(52, 211, 153, 0.38);
  background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
  box-shadow: 0 3px 10px -2px rgba(15, 23, 42, 0.35);
  font-size: 11.5px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.lic-modal-banner.is-teal-head {
  background: linear-gradient(90deg, #0d9488 0%, #0284c7 100%);
  border-color: rgba(56, 189, 248, 0.42);
}

.lic-modal-banner.is-blue-head {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: rgba(56, 189, 248, 0.45);
}

.lic-modal-banner.is-green-head {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: rgba(52, 211, 153, 0.45);
}

/* Thanh công cụ Preview & 2 nút Quét Ảnh / Upload PDF */
.lic-card-preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 11px;
  background: rgba(15, 23, 42, 0.72);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  flex-wrap: wrap;
}

.lic-card-preview-tabs {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  min-width: 0;
}

.lic-preview-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.22);
  cursor: pointer;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-preview-tab-btn.is-active {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(52, 211, 153, 0.6);
  color: #6ee7b7;
}

.lic-modal-bar-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.lic-scan-replace-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 11px;
  border-radius: 7px;
  border: 1px solid rgba(52, 211, 153, 0.45);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.32) 100%);
  color: #6ee7b7;
  font-size: 11.5px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.lic-scan-replace-btn.is-pdf-btn {
  border-color: rgba(56, 189, 248, 0.48);
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(37, 99, 235, 0.32) 100%);
  color: #7dd3fc;
}

.lic-scan-replace-btn.is-ai-btn {
  border-color: rgba(167, 139, 250, 0.48);
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.24) 0%, rgba(99, 102, 241, 0.32) 100%);
  color: #c4b5fd;
}

.lic-scan-replace-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #34d399;
  color: #ffffff;
}

.lic-scan-replace-btn.is-pdf-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #38bdf8;
  color: #ffffff;
}

.lic-scan-replace-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.lic-open-file-btn {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 11px;
  border-radius: 7px;
  background: #0284c7;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

/* Strip báo file lệch chuẩn cần AI */
.lic-format-warn-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 11px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(251, 191, 36, 0.45);
  color: #fde68a;
  font-size: 11.5px;
  font-weight: 600;
}

.lic-format-ai-cta {
  height: 26px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #fbbf24;
  background: #d97706;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* Khung Preview chính */
.lic-modal-preview-stage {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050a14;
  border-radius: 10px;
  border: 1.5px dashed rgba(148, 163, 184, 0.24);
  overflow: hidden;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.lic-modal-preview-stage.is-dragging {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.lic-preview-img-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-sizing: border-box;
  cursor: zoom-in;
}

.lic-preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.lic-preview-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  background: #ffffff;
}

.lic-raw-ocr-wrap {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.lic-raw-ocr-textarea {
  width: 100%;
  height: 100%;
  resize: none;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #090f1a;
  color: #cbd5e1;
  padding: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  box-sizing: border-box;
  outline: none;
}

/* Khu vực chọn Quét Ảnh hoặc Upload PDF (Kiểu 2) */
.lic-preview-empty.is-upload-hub {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px 20px;
  text-align: center;
  max-width: 520px;
}

.lic-upload-hub-icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #34d399;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.lic-upload-hub-title {
  font-size: 15px;
  font-weight: 800;
  color: #f8fafc;
}

.lic-upload-hub-sub {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}

.lic-upload-hub-sub kbd {
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 700;
}

.lic-upload-hub-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin-top: 6px;
}

.lic-hub-choice-btn {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 14px;
  border-radius: 11px;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.lic-hub-choice-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.06);
}

.lic-hub-choice-btn.is-image {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.28) 0%, rgba(16, 185, 129, 0.18) 100%);
  border-color: rgba(52, 211, 153, 0.5);
  color: #ecfdf5;
  box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.25);
}

.lic-hub-choice-btn.is-pdf {
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.28) 0%, rgba(37, 99, 235, 0.18) 100%);
  border-color: rgba(56, 189, 248, 0.5);
  color: #f0f9ff;
  box-shadow: 0 8px 20px -6px rgba(2, 132, 199, 0.25);
}

.lic-hub-choice-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lic-hub-choice-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.lic-hub-choice-text strong {
  font-size: 13px;
  font-weight: 800;
}

.lic-hub-choice-text small {
  font-size: 11px;
  opacity: 0.82;
  line-height: 1.3;
}

.lic-upload-hub-manual-note {
  margin-top: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #6ee7b7;
}

/* Hiệu ứng đang quét */
.lic-scanning-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  width: 100%;
  max-width: 340px;
  text-align: center;
}

.lic-scanner-visual {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #38bdf8;
}

.lic-scanning-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.55;
}

.lic-scanner-beam {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: #10b981;
  box-shadow: 0 0 12px 2px #10b981;
  animation: lic-scan-beam 1.8s infinite ease-in-out;
  z-index: 2;
}

@keyframes lic-scan-beam {
  0% { top: 6%; }
  50% { top: 92%; }
  100% { top: 6%; }
}

.lic-scanning-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #e2e8f0;
}

.lic-scan-progress-track {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.9);
  overflow: hidden;
}

.lic-scan-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #0284c7 100%);
  transition: width 0.25s ease;
}

/* Thanh chuyển đổi nhiều mặt hàng */
.lic-multi-items-bar {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.lic-multi-items-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.lic-multi-item-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(30, 41, 59, 0.7);
  color: #cbd5e1;
  font-size: 11.5px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

.lic-multi-item-tab.is-active {
  background: rgba(2, 132, 199, 0.24);
  border-color: #38bdf8;
  color: #ffffff;
}

.lic-multi-item-tab.is-dup-block {
  border-color: #f87171;
}

.lic-multi-item-tab.is-dup-renewal {
  border-color: #f59e0b;
}

.lic-multi-item-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.lic-multi-item-dot.is-ok { background: #10b981; }
.lic-multi-item-dot.is-block { background: #ef4444; }
.lic-multi-item-dot.is-renewal { background: #f59e0b; }

.lic-multi-item-del {
  margin-left: 2px;
  opacity: 0.7;
  font-size: 11px;
}

.lic-multi-item-del:hover {
  opacity: 1;
  color: #fca5a5;
}

/* Bố cục hàng/cột chuẩn Phương án A */
.lic-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.lic-form-row.is-full {
  grid-template-columns: minmax(0, 1fr);
}

.lic-form-row.is-product-split {
  grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr);
}

.lic-form-row.is-three-cols {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.lic-form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lic-form-field label {
  font-size: 11.5px;
  font-weight: 700;
  color: #94a3b8;
}

.lic-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: #090f1a;
  color: #f8fafc;
  font-size: 12.5px;
  font-family: inherit;
  outline: none;
}

.lic-input:focus {
  border-color: #10b981;
}

.lic-input-with-picker {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.lic-input.has-picker-btn {
  padding-right: 72px;
}

.lic-inline-picker-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  height: 27px;
  padding: 0 9px;
  border-radius: 6px;
  border: 1px solid rgba(110, 231, 183, 0.45);
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.lic-grace-preview {
  font-size: 11px;
  color: #34d399;
}

/* Cảnh báo trùng License ID */
.lic-modal-dup-banner {
  padding: 9px 12px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.lic-modal-dup-banner.is-block {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(248, 113, 113, 0.55);
  color: #fecaca;
}

.lic-modal-dup-banner.is-renewal {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(251, 191, 36, 0.55);
  color: #fde68a;
}

.lic-modal-dup-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
}

.lic-modal-dup-desc {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  font-weight: 600;
}

.lic-label-with-dup-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lic-dup-inline-pill {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}

.lic-dup-inline-pill.is-block {
  background: rgba(239, 68, 68, 0.22);
  border: 1px solid rgba(248, 113, 113, 0.55);
  color: #fca5a5;
}

.lic-dup-inline-pill.is-renewal {
  background: rgba(245, 158, 11, 0.22);
  border: 1px solid rgba(251, 191, 36, 0.55);
  color: #fcd34d;
}

.lic-modal-err-strip {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.16);
  border: 1px solid rgba(248, 113, 113, 0.45);
  color: #fecaca;
  font-size: 12px;
  font-weight: 600;
  white-space: pre-line;
}

/* Footer Modal */
.lic-modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  background: #080f18;
  flex-wrap: wrap;
}

.lic-foot-left-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.lic-foot-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lic-foot-btn.is-add-more {
  background: rgba(2, 132, 199, 0.18);
  border-color: rgba(56, 189, 248, 0.45);
  color: #7dd3fc;
}

.lic-foot-btn.is-add-more:hover:not(:disabled) {
  background: #0284c7;
  color: #ffffff;
}

.lic-foot-btn.is-danger {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(248, 113, 113, 0.45);
  color: #fca5a5;
}

.lic-foot-btn.is-danger:hover:not(:disabled) {
  background: #dc2626;
  color: #ffffff;
}

.lic-foot-btn.is-secondary {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

.lic-foot-btn.is-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #34d399;
  color: #ffffff;
}

.lic-foot-btn.is-primary.is-blocked {
  background: #dc2626 !important;
  border-color: #f87171 !important;
  opacity: 0.72;
  cursor: not-allowed;
}

.lic-foot-btn.is-primary.is-renewal {
  background: linear-gradient(135deg, #d97706 0%, #059669 100%);
  border-color: #fbbf24;
}

/* Zoom ảnh */
.lic-img-zoom-overlay {
  position: fixed;
  inset: 0;
  z-index: 2600;
  background: rgba(2, 6, 23, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.lic-zoomed-img {
  max-width: 92vw;
  max-height: 92vh;
  object-fit: contain;
  border-radius: 8px;
}

.lic-btn-close-zoom {
  position: absolute;
  top: 18px;
  right: 24px;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(15, 23, 42, 0.7);
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
}

.spinner-small {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: lic-spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes lic-spin {
  to { transform: rotate(360deg); }
}

/* ============================================================================
   LIGHT MODE (.theme-light-blue) ĐỒNG BỘ 100% VỚI MODAL CHỈNH SỬA LICENSE
   ============================================================================ */
.lic-modal-overlay.theme-light-blue .lic-modal-card {
  background: #f8fafc;
  color: #0f172a;
}

.lic-modal-overlay.theme-light-blue .lic-modal-head {
  background: linear-gradient(90deg, #0284c7 0%, #2563eb 55%, #1d4ed8 100%);
  border-bottom-color: #7dd3fc;
}

.lic-modal-overlay.theme-light-blue .lic-modal-preview-col {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.lic-modal-overlay.theme-light-blue .lic-card-preview-bar {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.lic-modal-overlay.theme-light-blue .lic-preview-tab-btn {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}

.lic-modal-overlay.theme-light-blue .lic-preview-tab-btn.is-active {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.lic-modal-overlay.theme-light-blue .lic-scan-replace-btn {
  background: #ecfdf5;
  border-color: #34d399;
  color: #047857;
}

.lic-modal-overlay.theme-light-blue .lic-scan-replace-btn.is-pdf-btn {
  background: #e0f2fe;
  border-color: #38bdf8;
  color: #0369a1;
}

.lic-modal-overlay.theme-light-blue .lic-scan-replace-btn.is-ai-btn {
  background: #f3e8ff;
  border-color: #c084fc;
  color: #6b21a8;
}

.lic-modal-overlay.theme-light-blue .lic-modal-preview-stage {
  background: #ffffff;
  border-color: #93c5fd;
}

.lic-modal-overlay.theme-light-blue .lic-upload-hub-title {
  color: #0f172a;
}

.lic-modal-overlay.theme-light-blue .lic-upload-hub-sub {
  color: #475569;
}

.lic-modal-overlay.theme-light-blue .lic-upload-hub-sub kbd {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-modal-overlay.theme-light-blue .lic-hub-choice-btn.is-image {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #34d399;
  color: #065f46;
}

.lic-modal-overlay.theme-light-blue .lic-hub-choice-btn.is-pdf {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #38bdf8;
  color: #075985;
}

.lic-modal-overlay.theme-light-blue .lic-hub-choice-icon {
  background: rgba(255, 255, 255, 0.8);
}

.lic-modal-overlay.theme-light-blue .lic-upload-hub-manual-note {
  color: #0284c7;
}

.lic-modal-overlay.theme-light-blue .lic-modal-group {
  background: #ffffff;
  border-color: #cbd5e1;
}

.lic-modal-overlay.theme-light-blue .lic-multi-items-bar {
  background: #ffffff;
  border-color: #cbd5e1;
}

.lic-modal-overlay.theme-light-blue .lic-multi-item-tab {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.lic-modal-overlay.theme-light-blue .lic-multi-item-tab.is-active {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #0369a1;
}

.lic-modal-overlay.theme-light-blue .lic-form-field label {
  color: #475569;
}

.lic-modal-overlay.theme-light-blue .lic-input,
.lic-modal-overlay.theme-light-blue .lic-raw-ocr-textarea {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-modal-overlay.theme-light-blue .lic-modal-dup-banner.is-block {
  background: #fef2f2;
  border-color: #f87171;
  color: #991b1b;
}

.lic-modal-overlay.theme-light-blue .lic-modal-dup-banner.is-renewal {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #92400e;
}

.lic-modal-overlay.theme-light-blue .lic-dup-inline-pill.is-block {
  background: #fee2e2;
  border-color: #f87171;
  color: #b91c1c;
}

.lic-modal-overlay.theme-light-blue .lic-dup-inline-pill.is-renewal {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #b45309;
}

.lic-modal-overlay.theme-light-blue .lic-modal-foot {
  background: #f1f5f9;
  border-top-color: #cbd5e1;
}

.lic-modal-overlay.theme-light-blue .lic-foot-btn.is-secondary {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #334155;
}

.lic-modal-overlay.theme-light-blue .lic-foot-btn.is-add-more {
  background: #e0f2fe;
  border-color: #38bdf8;
  color: #0369a1;
}

@media (max-width: 1100px) {
  .lic-modal-overlay {
    padding: 0 !important;
  }

  .lic-modal-card {
    width: 100% !important;
    max-width: 100% !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }

  .lic-modal-card > .lic-modal-head {
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) !important;
    padding-bottom: 12px !important;
    padding-left: 14px !important;
    padding-right: 14px !important;
    border-radius: 0 !important;
  }

  .lic-modal-card > .lic-modal-foot {
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

@media (max-width: 960px) {
  .lic-modal-body {
    overflow-y: auto;
  }
  .lic-modal-split-workspace {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }
  .lic-modal-preview-col {
    min-height: 360px;
  }
  .lic-modal-specs-col {
    height: auto;
    overflow: visible;
  }
}

@media (max-width: 680px) {
  .lic-upload-hub-actions,
  .lic-form-row,
  .lic-form-row.is-product-split,
  .lic-form-row.is-three-cols {
    grid-template-columns: 1fr;
  }
}
</style>
