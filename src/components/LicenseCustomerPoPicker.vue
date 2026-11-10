<template>
  <div class="lic-cp-picker-root" :class="{ 'is-light': theme === 'light' }">
    <!-- 1. Ô TÊN KHÁCH HÀNG / CTY (DATABASE) -->
    <div class="lic-cp-field">
      <div class="lic-cp-label-row">
        <div class="lic-cp-label-cluster">
          <label class="lic-cp-label">Tên Khách hàng / Cty (Database)</label>
          <span v-if="!hasSelectedCustomer" class="lic-cp-unlinked-badge">Chưa gắn DB</span>
        </div>
        <button
          type="button"
          class="lic-cp-suggest-btn"
          :disabled="isSuggesting || !modelValue?.CUSTOMER"
          @click="handleAutoSuggestCustomer"
          title="Đối chiếu tự động tên khách hàng trên file License với danh sách công ty trong DB"
        >
          <svg
            v-if="isSuggesting"
            class="lic-cp-spin"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <svg
            v-else
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
          </svg>
          <span>{{ isSuggesting ? 'Đang gợi ý...' : 'Gợi ý tự động' }}</span>
        </button>
      </div>

      <div class="lic-cp-input-box" @click="openCustomerModal">
        <input
          type="text"
          readonly
          class="lic-cp-input"
          :value="customerDisplayText"
          placeholder="-- Nhấn Chọn: Tên KH - Tên CTY --"
        />
        <div class="lic-cp-input-actions" @click.stop>
          <button
            v-if="hasSelectedCustomer"
            type="button"
            class="lic-cp-clear-btn"
            @click="clearCustomer"
            title="Bỏ chọn khách hàng"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button
            type="button"
            class="lic-cp-choose-in-btn is-emerald"
            @click="openCustomerModal"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Chọn</span>
          </button>
        </div>
      </div>
      <small v-if="suggestFeedback" class="lic-cp-hint" :class="suggestFeedbackType === 'warn' ? 'is-amber' : 'is-emerald'">
        <span>{{ suggestFeedback }}</span>
      </small>
    </div>

    <!-- 2. Ô LIÊN KẾT ĐƠN HÀNG PO CHÍNH THỨC (HIỂN THỊ SỐ PO - CONTENT_OF_CONTRACT_PO) -->
    <div class="lic-cp-field">
      <div class="lic-cp-label-row">
        <label class="lic-cp-label">Liên kết Đơn hàng PO Chính thức (Đồng bộ 2 chiều)</label>
      </div>
      <div class="lic-cp-input-box" @click="openPoModal">
        <input
          type="text"
          readonly
          class="lic-cp-input"
          :value="poDisplayText"
          placeholder="-- Nhấn Chọn: Số PO - Nội dung HĐ --"
        />
        <div class="lic-cp-input-actions" @click.stop>
          <button
            v-if="modelValue?.PO_FIREBASE_KEY || modelValue?.SO_PO"
            type="button"
            class="lic-cp-clear-btn"
            @click="clearPo"
            title="Bỏ liên kết PO"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button
            v-if="modelValue?.PO_FIREBASE_KEY || modelValue?.SO_PO"
            type="button"
            class="lic-cp-act-btn is-view is-in-input"
            @click="viewCurrentLinkedPoInSaleReport"
            title="Xem đơn hàng PO này trên trang Sale Report"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Xem</span>
          </button>
          <button
            type="button"
            class="lic-cp-choose-in-btn is-sky"
            @click="openPoModal"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Chọn</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ================= MODAL 1: CHỌN KHÁCH HÀNG / CÔNG TY (DATABASE) ================= -->
    <Teleport to="body">
      <div
        v-if="showCustomerModal"
        class="lic-cp-modal-overlay"
        :class="{ 'is-light': theme === 'light' }"
        @click.self="showCustomerModal = false"
      >
        <div class="lic-cp-modal-card">
          <div class="lic-cp-modal-head">
            <div class="lic-cp-modal-head-left">
              <span class="lic-cp-modal-icon is-emerald">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <div class="lic-cp-modal-title-row">
                <h4>Chọn Tên Khách Hàng / Công Ty</h4>
              </div>
            </div>
            <button type="button" class="lic-cp-modal-close" @click="showCustomerModal = false" aria-label="Đóng">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="lic-cp-modal-toolbar">
            <div class="lic-cp-search-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                ref="custSearchInputRef"
                v-model="customerSearch"
                type="text"
                class="lic-cp-search-input"
                placeholder="Tìm nhanh theo Tên công ty, Tên khách hàng, MST, Mã KH..."
              />
              <button v-if="customerSearch" type="button" class="lic-cp-search-clear" @click="customerSearch = ''" aria-label="Xóa tìm kiếm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <button
              type="button"
              class="lic-cp-add-new-btn"
              @click="openCustomerForm('create')"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Thêm mới KH</span>
            </button>
            <button
              v-if="modelValue?.CUSTOMER"
              type="button"
              class="lic-cp-suggest-btn is-in-modal"
              :disabled="isSuggesting"
              @click="handleAutoSuggestCustomer"
            >
              <svg
                v-if="isSuggesting"
                class="lic-cp-spin"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <svg
                v-else
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 2v4" />
                <path d="m16.2 7.8 2.9-2.9" />
                <path d="M18 12h4" />
                <path d="m16.2 16.2 2.9 2.9" />
                <path d="M12 18v4" />
                <path d="m4.9 19.1 2.9-2.9" />
                <path d="M2 12h4" />
                <path d="m4.9 4.9 2.9 2.9" />
              </svg>
              <span>{{ isSuggesting ? 'Đang gợi ý...' : 'Gợi ý tự động' }}</span>
            </button>
            <span class="lic-cp-result-tag">{{ filteredCustomers.length }} kết quả</span>
          </div>

          <div class="lic-cp-modal-body">
            <div v-if="filteredCustomers.length === 0" class="lic-cp-empty">
              <span>Không tìm thấy khách hàng nào phù hợp với từ khóa "{{ customerSearch }}".</span>
              <button type="button" class="lic-cp-add-new-btn" @click="openCustomerForm('create')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Thêm mới khách hàng này</span>
              </button>
            </div>
            <div v-else class="lic-cp-list">
              <!-- CARD KHÁCH HÀNG: TÊN CTY / TÊN KH / MST | 3 NÚT: XEM, SỬA, CHỌN -->
              <div
                v-for="c in filteredCustomers"
                :key="c.firebaseKey || c.ma_khach_hang"
                class="lic-cp-item"
                :class="{ 'is-selected': isCustomerSelected(c) }"
                @click="selectCustomer(c)"
              >
                <div class="lic-cp-item-main">
                  <div class="lic-cp-line-1">
                    <strong class="lic-cp-company-title">{{ c.ten_cong_ty || 'Chưa có tên công ty' }}</strong>
                  </div>
                  <div class="lic-cp-line-2">
                    <span class="lic-cp-line-lbl">Tên KH:</span>
                    <span class="lic-cp-line-val">{{ c.ten_khach_hang || 'Chưa cập nhật' }}</span>
                  </div>
                  <div class="lic-cp-line-3">
                    <span class="lic-cp-line-lbl">MST:</span>
                    <span class="lic-cp-line-val is-mono">{{ c.mst || 'Chưa cập nhật' }}</span>
                  </div>
                </div>

                <div class="lic-cp-card-actions" @click.stop>
                  <button
                    type="button"
                    class="lic-cp-act-btn is-view"
                    @click="openCustomerForm('view', c)"
                    title="Xem chi tiết thông tin khách hàng"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>Xem</span>
                  </button>
                  <button
                    type="button"
                    class="lic-cp-act-btn is-edit"
                    @click="openCustomerForm('edit', c)"
                    title="Sửa thông tin khách hàng"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    <span>Sửa</span>
                  </button>
                  <button
                    type="button"
                    class="lic-cp-pick-pill"
                    :class="{ 'is-selected': isCustomerSelected(c) }"
                    @click="selectCustomer(c)"
                  >
                    <svg v-if="isCustomerSelected(c)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{{ isCustomerSelected(c) ? 'Đang chọn' : 'Chọn' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="lic-cp-modal-foot">
            <div class="lic-cp-foot-status">
              Đang chọn:
              <strong>{{ customerDisplayText || 'Chưa chọn' }}</strong>
            </div>
            <div class="lic-cp-foot-btns">
              <button
                v-if="hasSelectedCustomer"
                type="button"
                class="lic-cp-foot-btn is-clear"
                @click="clearCustomer(); showCustomerModal = false"
              >
                Bỏ chọn
              </button>
              <button type="button" class="lic-cp-foot-btn" @click="showCustomerModal = false">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ================= SUB-MODAL: XEM / SỬA / THÊM MỚI KHÁCH HÀNG ================= -->
    <Teleport to="body">
      <div
        v-if="customerFormModal.show"
        class="lic-cp-modal-overlay is-sub-overlay"
        :class="{ 'is-light': theme === 'light' }"
        @click.self="closeCustomerForm"
      >
        <div class="lic-cp-modal-card is-sub-card">
          <div class="lic-cp-modal-head">
            <div class="lic-cp-modal-head-left">
              <span class="lic-cp-modal-icon is-emerald">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </span>
              <div class="lic-cp-modal-title-row">
                <h4>
                  {{ customerFormModal.mode === 'create' ? 'Thêm Mới Khách Hàng' : (customerFormModal.mode === 'edit' ? 'Chỉnh Sửa Thông Tin Khách Hàng' : 'Chi Tiết Thông Tin Khách Hàng') }}
                </h4>
              </div>
            </div>
            <button type="button" class="lic-cp-modal-close" @click="closeCustomerForm" aria-label="Đóng">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="lic-cp-modal-body is-form-body">
            <div class="lic-cp-form-grid">
              <div class="lic-cp-form-group is-full">
                <label>Tên Công Ty *</label>
                <input
                  v-model="customerFormModal.form.ten_cong_ty"
                  type="text"
                  class="lic-cp-form-input"
                  :readonly="customerFormModal.mode === 'view'"
                  placeholder="Nhập tên công ty đầy đủ..."
                />
              </div>

              <div class="lic-cp-form-group">
                <label>Tên Khách Hàng (Người đại diện / nhận hàng)</label>
                <input
                  v-model="customerFormModal.form.ten_khach_hang"
                  type="text"
                  class="lic-cp-form-input"
                  :readonly="customerFormModal.mode === 'view'"
                  placeholder="Nhập tên khách hàng..."
                />
              </div>

              <div class="lic-cp-form-group">
                <label>Mã Số Thuế (MST)</label>
                <input
                  v-model="customerFormModal.form.mst"
                  type="text"
                  class="lic-cp-form-input"
                  :readonly="customerFormModal.mode === 'view'"
                  placeholder="Nhập mã số thuế..."
                />
              </div>

              <div class="lic-cp-form-group">
                <label>Mã Khách Hàng (Để trống tự tạo khi thêm mới)</label>
                <input
                  v-model="customerFormModal.form.ma_khach_hang"
                  type="text"
                  class="lic-cp-form-input"
                  :readonly="customerFormModal.mode !== 'create'"
                  placeholder="VD: KH001..."
                />
              </div>

              <div class="lic-cp-form-group">
                <label>Số Điện Thoại</label>
                <input
                  v-model="customerFormModal.form.so_dien_thoai_ca_nhan"
                  type="text"
                  class="lic-cp-form-input"
                  :readonly="customerFormModal.mode === 'view'"
                  placeholder="Số điện thoại liên hệ..."
                />
              </div>

              <div class="lic-cp-form-group">
                <label>Email</label>
                <input
                  v-model="customerFormModal.form.email_ca_nhan"
                  type="text"
                  class="lic-cp-form-input"
                  :readonly="customerFormModal.mode === 'view'"
                  placeholder="Email liên hệ..."
                />
              </div>

              <div class="lic-cp-form-group">
                <label>Địa Chỉ Công Ty</label>
                <input
                  v-model="customerFormModal.form.dia_chi_cong_ty"
                  type="text"
                  class="lic-cp-form-input"
                  :readonly="customerFormModal.mode === 'view'"
                  placeholder="Địa chỉ trụ sở..."
                />
              </div>

              <div class="lic-cp-form-group is-full">
                <label>Ghi Chú</label>
                <textarea
                  v-model="customerFormModal.form.ghi_chu"
                  rows="2"
                  class="lic-cp-form-input"
                  :readonly="customerFormModal.mode === 'view'"
                  placeholder="Ghi chú thêm về khách hàng..."
                ></textarea>
              </div>
            </div>
            <div v-if="customerFormModal.error" class="lic-cp-form-err">
              {{ customerFormModal.error }}
            </div>
          </div>

          <div class="lic-cp-modal-foot">
            <div class="lic-cp-foot-status">
              <span v-if="customerFormModal.mode === 'view'">Chế độ chỉ xem</span>
              <span v-else>Vui lòng kiểm tra thông tin trước khi lưu</span>
            </div>
            <div class="lic-cp-foot-btns">
              <button type="button" class="lic-cp-foot-btn" @click="closeCustomerForm">Đóng</button>
              <button
                v-if="customerFormModal.mode === 'view'"
                type="button"
                class="lic-cp-foot-btn"
                @click="customerFormModal.mode = 'edit'"
              >
                Sửa KH
              </button>
              <button
                v-if="customerFormModal.mode === 'view'"
                type="button"
                class="lic-cp-foot-btn is-primary"
                @click="selectCustomer(customerFormModal.form); closeCustomerForm()"
              >
                Chọn KH này
              </button>
              <button
                v-else
                type="button"
                class="lic-cp-foot-btn is-primary"
                :disabled="customerFormModal.saving"
                @click="saveCustomerForm"
              >
                {{ customerFormModal.saving ? 'Đang lưu...' : (customerFormModal.mode === 'create' ? 'Lưu & Chọn KH' : 'Lưu cập nhật') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ================= MODAL 2: CHỌN ĐƠN HÀNG PO CHÍNH THỨC ================= -->
    <Teleport to="body">
      <div
        v-if="showPoModal"
        class="lic-cp-modal-overlay"
        :class="{ 'is-light': theme === 'light' }"
        @click.self="showPoModal = false"
      >
        <div class="lic-cp-modal-card">
          <div class="lic-cp-modal-head is-sky-head">
            <div class="lic-cp-modal-head-left">
              <span class="lic-cp-modal-icon is-sky">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              <div class="lic-cp-modal-title-row">
                <h4>Chọn Đơn Hàng PO Chính Thức</h4>
              </div>
            </div>
            <button type="button" class="lic-cp-modal-close" @click="showPoModal = false" aria-label="Đóng">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="lic-cp-modal-toolbar">
            <div class="lic-cp-search-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                ref="poSearchInputRef"
                v-model="poSearch"
                type="text"
                class="lic-cp-search-input"
                placeholder="Tìm theo Số PO, Nội dung HĐ, Tên KH, Tên công ty, Ngày..."
              />
              <button v-if="poSearch" type="button" class="lic-cp-search-clear" @click="poSearch = ''" aria-label="Xóa tìm kiếm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div v-if="hasSelectedCustomer" class="lic-cp-scope-switch">
              <button
                type="button"
                class="lic-cp-scope-btn"
                :class="{ active: poScopeMode === 'customer' }"
                @click="poScopeMode = 'customer'"
              >
                Theo KH ({{ customerScopedPos.length }})
              </button>
              <button
                type="button"
                class="lic-cp-scope-btn"
                :class="{ active: poScopeMode === 'all' }"
                @click="poScopeMode = 'all'"
              >
                Tất cả PO ({{ officialPos.length }})
              </button>
            </div>
          </div>

          <div class="lic-cp-modal-body">
            <div v-if="filteredPos.length === 0" class="lic-cp-empty">
              <span>Không tìm thấy đơn hàng PO nào phù hợp.</span>
              <button
                v-if="hasSelectedCustomer && poScopeMode === 'customer'"
                type="button"
                class="lic-cp-switch-all-link"
                @click="poScopeMode = 'all'"
              >
                Xem toàn bộ {{ officialPos.length }} PO
              </button>
            </div>
            <div v-else class="lic-cp-list">
              <!-- CARD PO: DÒNG 1: SỐ PO - CONTENT_OF_CONTRACT_PO | DÒNG 2: TÊN KH - TÊN CTY | DÒNG 3: NGÀY : -->
              <div
                v-for="po in filteredPos"
                :key="po.firebaseKey"
                class="lic-cp-item is-po-item"
                :class="{ 'is-selected': isPoSelected(po) }"
                @click="selectPo(po)"
              >
                <div class="lic-cp-item-main">
                  <div class="lic-cp-line-1">
                    <span class="lic-cp-po-badge">{{ po.soPO || '—' }}</span>
                    <span class="lic-cp-dash">-</span>
                    <strong class="lic-cp-company-title">{{ po.content || 'Chưa có nội dung hợp đồng' }}</strong>
                  </div>
                  <div class="lic-cp-line-2">
                    <span class="lic-cp-line-val is-cust-pair">{{ formatPoCustomerPair(po) }}</span>
                  </div>
                  <div class="lic-cp-line-3">
                    <span class="lic-cp-line-lbl">Ngày :</span>
                    <span class="lic-cp-line-val is-mono">{{ formatPoDate(po.createdTime) }}</span>
                  </div>
                </div>

                <div class="lic-cp-card-actions" @click.stop>
                  <button
                    type="button"
                    class="lic-cp-act-btn is-view"
                    @click="viewPoInSaleReport(po)"
                    title="Xem đơn hàng PO này trên trang Sale Report"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>Xem</span>
                  </button>
                  <button
                    type="button"
                    class="lic-cp-pick-pill is-sky"
                    :class="{ 'is-selected': isPoSelected(po) }"
                    @click="selectPo(po)"
                  >
                    <svg v-if="isPoSelected(po)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{{ isPoSelected(po) ? 'Đang chọn' : 'Chọn' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="lic-cp-modal-foot">
            <div class="lic-cp-foot-status">
              Đang chọn:
              <strong>{{ poDisplayText || 'Chưa liên kết PO' }}</strong>
            </div>
            <div class="lic-cp-foot-btns">
              <button
                v-if="modelValue?.PO_FIREBASE_KEY || modelValue?.SO_PO"
                type="button"
                class="lic-cp-foot-btn is-clear"
                @click="clearPo(); showPoModal = false"
              >
                Bỏ liên kết PO
              </button>
              <button type="button" class="lic-cp-foot-btn" @click="showPoModal = false">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getApps, getApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import {
  filterPosForCustomer,
  fuzzyMatchCustomer,
  saveCustomerRecordToFirebase,
  normalizeViText as normalizeVN
} from '../utils/licensePoSync'
import { callDeepSeek } from '../services/deepseek'

const router = useRouter()

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  customers: {
    type: Array,
    default: () => []
  },
  officialPos: {
    type: Array,
    default: () => []
  },
  theme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['change-customer', 'change-po', 'customer-saved', 'view-po'])

const localCustomers = ref([])
watch(
  () => props.customers,
  (list) => {
    localCustomers.value = Array.isArray(list) ? [...list] : []
  },
  { immediate: true, deep: true }
)

const showCustomerModal = ref(false)
const showPoModal = ref(false)
const customerSearch = ref('')
const poSearch = ref('')
const poScopeMode = ref('customer')
const custSearchInputRef = ref(null)
const poSearchInputRef = ref(null)
const isSuggesting = ref(false)
const suggestFeedback = ref('')
const suggestFeedbackType = ref('ok')

const customerFormModal = ref({
  show: false,
  mode: 'view', // 'view' | 'edit' | 'create'
  saving: false,
  error: '',
  form: {
    firebaseKey: '',
    ma_khach_hang: '',
    ten_cong_ty: '',
    ten_khach_hang: '',
    mst: '',
    so_dien_thoai_ca_nhan: '',
    email_ca_nhan: '',
    dia_chi_cong_ty: '',
    ghi_chu: ''
  }
})

const matchedCustomerRecord = computed(() => {
  const code = String(props.modelValue?.MA_KHACH_HANG || '').trim()
  const comp = String(props.modelValue?.TEN_CONG_TY || '').trim()
  if (code) {
    const byCode = localCustomers.value.find(c => String(c.ma_khach_hang || '').trim() === code)
    if (byCode) return byCode
  }
  if (comp) {
    const compNorm = normalizeVN(comp)
    const byComp = localCustomers.value.find(c => normalizeVN(c.ten_cong_ty) === compNorm)
    if (byComp) return byComp
  }
  return null
})

const hasSelectedCustomer = computed(() => {
  return Boolean(
    String(props.modelValue?.MA_KHACH_HANG || '').trim() ||
    String(props.modelValue?.TEN_CONG_TY || '').trim() ||
    String(props.modelValue?.TEN_KHACH_HANG || '').trim()
  )
})

// Hiển thị trong input: Tên KH - Tên CTY
const customerDisplayText = computed(() => {
  const rec = matchedCustomerRecord.value
  const tenKH = String(props.modelValue?.TEN_KHACH_HANG || rec?.ten_khach_hang || '').trim()
  const tenCty = String(props.modelValue?.TEN_CONG_TY || rec?.ten_cong_ty || '').trim()
  if (tenKH && tenCty) {
    if (normalizeVN(tenKH) === normalizeVN(tenCty)) return tenCty
    return `${tenKH} - ${tenCty}`
  }
  return tenCty || tenKH || ''
})

// Hiển thị trong input PO: Số PO - Content_of_Contract_PO
const poDisplayText = computed(() => {
  const key = String(props.modelValue?.PO_FIREBASE_KEY || '').trim()
  const soPo = String(props.modelValue?.SO_PO || '').trim()
  if (!key && !soPo) return ''
  const matched = props.officialPos.find(p => p.firebaseKey === key || (soPo && String(p.soPO || '') === soPo))
  if (matched) {
    const num = matched.soPO || soPo || '—'
    const content = matched.content || matched.tenCongTy || 'Chưa có nội dung HĐ'
    return `${num} - ${content}`
  }
  return soPo
})

const filteredCustomers = computed(() => {
  const q = normalizeVN(customerSearch.value)
  if (!q) return localCustomers.value
  return localCustomers.value.filter(c => {
    const hay = normalizeVN(`${c.ten_cong_ty || ''} ${c.ten_khach_hang || ''} ${c.mst || ''} ${c.ma_khach_hang || ''}`)
    return hay.includes(q)
  })
})

const customerScopedPos = computed(() => {
  if (!hasSelectedCustomer.value) return props.officialPos
  return filterPosForCustomer(
    props.officialPos,
    props.modelValue.MA_KHACH_HANG,
    props.modelValue.TEN_CONG_TY,
    props.modelValue.CUSTOMER
  )
})

const filteredPos = computed(() => {
  const baseList = (hasSelectedCustomer.value && poScopeMode.value === 'customer')
    ? customerScopedPos.value
    : props.officialPos
  const q = normalizeVN(poSearch.value)
  if (!q) return baseList
  return baseList.filter(po => {
    const hay = normalizeVN(`${po.soPO || ''} ${po.content || ''} ${po.tenKhachHang || ''} ${po.tenCongTy || ''} ${po.maKhachHang || ''} ${po.createdTime || ''}`)
    return hay.includes(q)
  })
})

function isCustomerSelected(c) {
  if (!c || !props.modelValue) return false
  if (props.modelValue.MA_KHACH_HANG && c.ma_khach_hang && props.modelValue.MA_KHACH_HANG === c.ma_khach_hang) {
    return true
  }
  if (props.modelValue.TEN_CONG_TY && c.ten_cong_ty && normalizeVN(props.modelValue.TEN_CONG_TY) === normalizeVN(c.ten_cong_ty)) {
    return true
  }
  return false
}

function isPoSelected(po) {
  if (!po || !props.modelValue) return false
  if (props.modelValue.PO_FIREBASE_KEY && po.firebaseKey === props.modelValue.PO_FIREBASE_KEY) return true
  if (props.modelValue.SO_PO && po.soPO && String(props.modelValue.SO_PO) === String(po.soPO)) return true
  return false
}

function formatPoCustomerPair(po) {
  const kh = String(po?.tenKhachHang || '').trim()
  const cty = String(po?.tenCongTy || '').trim()
  if (kh && cty) {
    if (normalizeVN(kh) === normalizeVN(cty)) return cty
    return `${kh} - ${cty}`
  }
  return cty || kh || 'Chưa rõ khách hàng / công ty'
}

function formatPoDate(raw) {
  if (!raw) return 'Chưa rõ ngày'
  return String(raw).split(' ')[0]
}

async function handleAutoSuggestCustomer() {
  const rawName = String(props.modelValue?.CUSTOMER || '').trim()
  if (!rawName || !localCustomers.value.length) return
  isSuggesting.value = true
  suggestFeedback.value = ''

  try {
    const fastMatch = fuzzyMatchCustomer(rawName, localCustomers.value)
    if (fastMatch.matched && fastMatch.score >= 0.65) {
      selectCustomer(fastMatch.matched)
      suggestFeedbackType.value = 'ok'
      suggestFeedback.value = `Đã khớp nhanh: ${formatCustPair(fastMatch.matched)}`
      return
    }

    const compactList = localCustomers.value
      .slice(0, 250)
      .map(c => `${c.ma_khach_hang}: ${c.ten_cong_ty} (${c.ten_khach_hang || ''})`)
      .join('\n')

    const sysPrompt = `Bạn là trợ lý đối chiếu danh mục khách hàng doanh nghiệp. Nhiệm vụ: Từ tên khách hàng trên chứng chỉ License, hãy tìm đúng Mã khách hàng (ma_khach_hang) tương ứng trong danh sách công ty bên dưới. Chỉ trả về duy nhất JSON dạng {"ma_khach_hang": "..."} (hoặc {"ma_khach_hang": ""} nếu không có công ty nào khớp).`
    const userPrompt = `Tên trên file License: "${rawName}"\n\nDanh sách khách hàng trong DB:\n${compactList}`

    const aiReply = await callDeepSeek(sysPrompt, userPrompt, 0.1)
    const jsonMatch = String(aiReply || '').match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const wantedCode = String(parsed?.ma_khach_hang || '').trim()
      if (wantedCode) {
        const matchedCust = localCustomers.value.find(
          c => String(c.ma_khach_hang || '').trim().toLowerCase() === wantedCode.toLowerCase()
        )
        if (matchedCust) {
          selectCustomer(matchedCust)
          suggestFeedbackType.value = 'ok'
          suggestFeedback.value = `AI gợi ý: ${formatCustPair(matchedCust)}`
          return
        }
      }
    }

    if (fastMatch.matched) {
      selectCustomer(fastMatch.matched)
      suggestFeedbackType.value = 'ok'
      suggestFeedback.value = `Đã gợi ý gần nhất: ${formatCustPair(fastMatch.matched)}`
    } else {
      suggestFeedbackType.value = 'warn'
      suggestFeedback.value = 'Không tìm thấy công ty tương ứng tự động, vui lòng nhấn Chọn để tìm.'
    }
  } catch {
    const fallback = fuzzyMatchCustomer(rawName, localCustomers.value)
    if (fallback.matched) {
      selectCustomer(fallback.matched)
      suggestFeedbackType.value = 'ok'
      suggestFeedback.value = `Đã gợi ý: ${formatCustPair(fallback.matched)}`
    } else {
      suggestFeedbackType.value = 'warn'
      suggestFeedback.value = 'Không tìm thấy công ty tương ứng, vui lòng nhấn Chọn.'
    }
  } finally {
    isSuggesting.value = false
  }
}

function formatCustPair(c) {
  if (!c) return ''
  const kh = String(c.ten_khach_hang || '').trim()
  const cty = String(c.ten_cong_ty || '').trim()
  if (kh && cty && normalizeVN(kh) !== normalizeVN(cty)) return `${kh} - ${cty}`
  return cty || kh || c.ma_khach_hang || ''
}

function openCustomerModal() {
  customerSearch.value = ''
  showCustomerModal.value = true
  nextTick(() => {
    custSearchInputRef.value?.focus?.()
  })
}

function openPoModal() {
  poSearch.value = ''
  poScopeMode.value = hasSelectedCustomer.value ? 'customer' : 'all'
  showPoModal.value = true
  nextTick(() => {
    poSearchInputRef.value?.focus?.()
  })
}

function openCustomerForm(mode, cust = null) {
  const defaultCompanyName =
    cust?.ten_cong_ty ||
    (mode === 'create'
      ? String(customerSearch.value || props.modelValue?.CUSTOMER || '').trim()
      : '')

  customerFormModal.value = {
    show: true,
    mode,
    saving: false,
    error: '',
    form: {
      firebaseKey: cust?.firebaseKey || '',
      ma_khach_hang: cust?.ma_khach_hang || '',
      ten_cong_ty: defaultCompanyName,
      ten_khach_hang: cust?.ten_khach_hang || '',
      mst: cust?.mst || '',
      so_dien_thoai_ca_nhan: cust?.so_dien_thoai_ca_nhan || '',
      email_ca_nhan: cust?.email_ca_nhan || '',
      dia_chi_cong_ty: cust?.dia_chi_cong_ty || '',
      ghi_chu: cust?.ghi_chu || ''
    }
  }
}

function closeCustomerForm() {
  customerFormModal.value.show = false
}

async function saveCustomerForm() {
  const f = customerFormModal.value.form
  if (!String(f.ten_cong_ty || '').trim() && !String(f.ten_khach_hang || '').trim()) {
    customerFormModal.value.error = 'Vui lòng nhập Tên công ty hoặc Tên khách hàng.'
    return
  }

  customerFormModal.value.saving = true
  customerFormModal.value.error = ''
  try {
    const app = getApps().length ? getApp() : null
    if (!app) throw new Error('Chưa kết nối Firebase')
    const db = getDatabase(app)
    const isCreate = customerFormModal.value.mode === 'create'
    const saved = await saveCustomerRecordToFirebase(db, f, isCreate)

    const idx = localCustomers.value.findIndex(
      c => c.firebaseKey === saved.firebaseKey || c.ma_khach_hang === saved.ma_khach_hang
    )
    if (idx >= 0) {
      localCustomers.value.splice(idx, 1, saved)
    } else {
      localCustomers.value.unshift(saved)
    }

    selectCustomer(saved)
    emit('customer-saved', saved)
    closeCustomerForm()
  } catch (err) {
    customerFormModal.value.error = 'Lỗi khi lưu khách hàng: ' + (err?.message || String(err))
  } finally {
    customerFormModal.value.saving = false
  }
}

function selectCustomer(c) {
  if (!props.modelValue || !c) return
  props.modelValue.MA_KHACH_HANG = c.ma_khach_hang || ''
  props.modelValue.TEN_CONG_TY = c.ten_cong_ty || ''
  props.modelValue.TEN_KHACH_HANG = c.ten_khach_hang || ''
  if (c.mst) props.modelValue.MST = c.mst

  if (props.modelValue.PO_FIREBASE_KEY) {
    const validPos = filterPosForCustomer(
      props.officialPos,
      props.modelValue.MA_KHACH_HANG,
      props.modelValue.TEN_CONG_TY,
      props.modelValue.CUSTOMER
    )
    const stillValid = validPos.some(p => p.firebaseKey === props.modelValue.PO_FIREBASE_KEY)
    if (!stillValid) {
      props.modelValue.PO_FIREBASE_KEY = ''
      props.modelValue.SO_PO = ''
    }
  }

  showCustomerModal.value = false
  emit('change-customer', c)
}

function clearCustomer() {
  if (!props.modelValue) return
  props.modelValue.MA_KHACH_HANG = ''
  props.modelValue.TEN_CONG_TY = ''
  props.modelValue.TEN_KHACH_HANG = ''
  suggestFeedback.value = ''
  emit('change-customer', null)
}

function selectPo(po) {
  if (!props.modelValue || !po) return
  props.modelValue.PO_FIREBASE_KEY = po.firebaseKey || ''
  props.modelValue.SO_PO = po.soPO || ''

  // Nếu ở KH đang trống thì khi chọn PO sẽ tự động lấy theo KH của PO đó
  if (!hasSelectedCustomer.value) {
    const matchedCust = localCustomers.value.find(c => {
      if (po.maKhachHang && c.ma_khach_hang && normalizeVN(po.maKhachHang) === normalizeVN(c.ma_khach_hang)) {
        return true
      }
      if (po.tenCongTy && c.ten_cong_ty && normalizeVN(po.tenCongTy) === normalizeVN(c.ten_cong_ty)) {
        return true
      }
      return false
    })

    if (matchedCust) {
      props.modelValue.MA_KHACH_HANG = matchedCust.ma_khach_hang || po.maKhachHang || ''
      props.modelValue.TEN_CONG_TY = matchedCust.ten_cong_ty || po.tenCongTy || ''
      props.modelValue.TEN_KHACH_HANG = matchedCust.ten_khach_hang || po.tenKhachHang || ''
      if (matchedCust.mst || po.mst) props.modelValue.MST = matchedCust.mst || po.mst || ''
    } else {
      props.modelValue.MA_KHACH_HANG = po.maKhachHang || ''
      props.modelValue.TEN_CONG_TY = po.tenCongTy || ''
      props.modelValue.TEN_KHACH_HANG = po.tenKhachHang || ''
      if (po.mst) props.modelValue.MST = po.mst
    }
  }

  showPoModal.value = false
  emit('change-po', po)
}

function clearPo() {
  if (!props.modelValue) return
  props.modelValue.PO_FIREBASE_KEY = ''
  props.modelValue.SO_PO = ''
  emit('change-po', null)
}

function viewPoInSaleReport(po) {
  if (!po) return
  showPoModal.value = false
  emit('view-po', po)
  router.push({
    path: '/sale-report-firebase',
    query: {
      openPoKey: String(po.firebaseKey || '').trim(),
      openSoPo: String(po.soPO || '').trim()
    }
  })
}

function viewCurrentLinkedPoInSaleReport() {
  const key = String(props.modelValue?.PO_FIREBASE_KEY || '').trim()
  const soPo = String(props.modelValue?.SO_PO || '').trim()
  if (!key && !soPo) return
  const matched = props.officialPos.find(
    p => (key && p.firebaseKey === key) || (soPo && String(p.soPO || '') === soPo)
  )
  viewPoInSaleReport(matched || { firebaseKey: key, soPO: soPo })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.lic-cp-picker-root,
.lic-cp-picker-root *,
.lic-cp-modal-overlay,
.lic-cp-modal-overlay * {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  box-sizing: border-box;
}

.lic-cp-picker-root {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px dashed rgba(52, 211, 153, 0.38);
}

.lic-cp-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.lic-cp-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 22px;
}

.lic-cp-label-cluster {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  flex-wrap: wrap;
}

.lic-cp-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #cbd5e1;
}

.lic-cp-suggest-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 5px;
  border: 1px solid rgba(52, 211, 153, 0.45);
  background: rgba(16, 185, 129, 0.16);
  color: #6ee7b7;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.lic-cp-suggest-btn.is-in-modal {
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px;
}

.lic-cp-suggest-btn:hover:not(:disabled) {
  background: #059669;
  border-color: #10b981;
  color: #ffffff;
}

.lic-cp-suggest-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.lic-cp-spin {
  animation: licCpSpin 0.8s linear infinite;
}

@keyframes licCpSpin {
  to {
    transform: rotate(360deg);
  }
}

.lic-cp-input-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  background: #090f1a;
  padding: 0 5px 0 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lic-cp-input-box:hover {
  border-color: rgba(52, 211, 153, 0.55);
}

.lic-cp-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fafc;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-cp-input::placeholder {
  color: #64748b;
  font-weight: 500;
}

.lic-cp-input-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 6px;
}

.lic-cp-clear-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: rgba(148, 163, 184, 0.14);
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lic-cp-clear-btn:hover {
  background: rgba(239, 68, 68, 0.22);
  color: #fca5a5;
}

.lic-cp-choose-in-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.lic-cp-choose-in-btn.is-emerald {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: rgba(110, 231, 183, 0.45);
  color: #ffffff;
}

.lic-cp-choose-in-btn.is-sky {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  border-color: rgba(125, 211, 252, 0.45);
  color: #ffffff;
}

.lic-cp-choose-in-btn:hover {
  filter: brightness(1.08);
}

.lic-cp-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  line-height: 1.35;
}

.lic-cp-hint.is-emerald {
  color: #34d399;
}

.lic-cp-hint.is-sky {
  color: #38bdf8;
}

.lic-cp-hint.is-amber {
  color: #fbbf24;
}

/* ================= MODAL PICKER ================= */
.lic-cp-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100250;
  background: rgba(2, 6, 23, 0.78);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lic-cp-modal-overlay.is-sub-overlay {
  z-index: 100300;
}

.lic-cp-modal-card {
  width: min(900px, 100%);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #0b141c;
  border: 1.5px solid rgba(52, 211, 153, 0.45);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  overflow: hidden;
  color: #f8fafc;
}

.lic-cp-modal-card.is-sub-card {
  width: min(720px, 100%);
}

.lic-cp-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 20px;
  background: linear-gradient(90deg, #059669 0%, #047857 55%, #0f766e 100%);
  border-bottom: 1px solid rgba(52, 211, 153, 0.32);
  color: #ffffff;
  flex-shrink: 0;
}

.lic-cp-modal-head.is-sky-head {
  background: linear-gradient(90deg, #0284c7 0%, #2563eb 55%, #1d4ed8 100%);
  border-bottom-color: rgba(56, 189, 248, 0.35);
}

.lic-cp-modal-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.lic-cp-head-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.lic-cp-add-new-btn {
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(110, 231, 183, 0.55);
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.lic-cp-add-new-btn:hover {
  filter: brightness(1.08);
}

.lic-cp-modal-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.34);
  color: #ffffff;
  flex-shrink: 0;
}

.lic-cp-modal-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.lic-cp-modal-title-row h4 {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.01em;
}

.lic-cp-modal-close {
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

.lic-cp-modal-close:hover {
  background: rgba(239, 68, 68, 0.55);
  border-color: #fecaca;
}

.lic-cp-modal-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #0f1b29;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  flex-wrap: wrap;
}

.lic-cp-search-wrap {
  flex: 1;
  min-width: 240px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 9px;
  background: #070d17;
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #94a3b8;
}

.lic-cp-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fafc;
  font-size: 13px;
}

.lic-cp-search-clear {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lic-cp-result-tag {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

.lic-cp-scope-switch {
  display: inline-flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.lic-cp-scope-btn {
  height: 34px;
  padding: 0 12px;
  border: none;
  background: rgba(15, 23, 42, 0.75);
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.lic-cp-scope-btn.active {
  background: #0284c7;
  color: #ffffff;
}

.lic-cp-modal-body {
  flex: 1;
  min-height: 240px;
  max-height: 56vh;
  overflow-y: auto;
  padding: 12px 18px;
}

.lic-cp-modal-body.is-form-body {
  padding: 18px 20px;
}

.lic-cp-empty {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.lic-cp-switch-all-link {
  padding: 6px 12px;
  border-radius: 7px;
  border: 1px solid #38bdf8;
  background: rgba(14, 165, 233, 0.16);
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.lic-cp-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lic-cp-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 15px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #f8fafc;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lic-cp-item:hover {
  border-color: rgba(52, 211, 153, 0.55);
  background: rgba(16, 185, 129, 0.08);
}

.lic-cp-item.is-po-item:hover {
  border-color: rgba(56, 189, 248, 0.55);
  background: rgba(14, 165, 233, 0.08);
}

.lic-cp-item.is-selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.lic-cp-item.is-po-item.is-selected {
  border-color: #0ea5e9;
  background: rgba(14, 165, 233, 0.15);
}

.lic-cp-item-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.lic-cp-line-1 {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.lic-cp-company-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.35;
}

.lic-cp-dash {
  color: #64748b;
  font-weight: 700;
}

.lic-cp-line-2,
.lic-cp-line-3 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  line-height: 1.35;
}

.lic-cp-line-lbl {
  color: #94a3b8;
  font-weight: 600;
}

.lic-cp-line-val {
  color: #e2e8f0;
  font-weight: 600;
}

.lic-cp-line-val.is-cust-pair {
  color: #6ee7b7;
  font-weight: 700;
}

.lic-cp-line-val.is-mono {
  font-variant-numeric: tabular-nums;
  color: #cbd5e1;
}

.lic-cp-po-badge {
  padding: 2px 8px;
  border-radius: 5px;
  background: rgba(14, 165, 233, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.5);
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 800;
}

.lic-cp-card-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.lic-cp-act-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(30, 41, 59, 0.75);
  color: #e2e8f0;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.lic-cp-act-btn.is-in-input {
  height: 28px;
  padding: 0 9px;
  border-radius: 6px;
}

.lic-cp-act-btn.is-view:hover {
  border-color: #38bdf8;
  color: #7dd3fc;
  background: rgba(14, 165, 233, 0.14);
}

.lic-cp-act-btn.is-edit:hover {
  border-color: #fbbf24;
  color: #fde68a;
  background: rgba(245, 158, 11, 0.14);
}

.lic-cp-pick-pill {
  height: 30px;
  padding: 0 12px;
  border-radius: 7px;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(52, 211, 153, 0.45);
  color: #6ee7b7;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  cursor: pointer;
}

.lic-cp-pick-pill.is-sky {
  background: rgba(14, 165, 233, 0.18);
  border-color: rgba(56, 189, 248, 0.45);
  color: #7dd3fc;
}

.lic-cp-pick-pill.is-selected {
  background: #059669;
  border-color: #10b981;
  color: #ffffff;
}

.lic-cp-pick-pill.is-sky.is-selected {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

/* Form Xem / Sửa / Thêm mới KH */
.lic-cp-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.lic-cp-form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.lic-cp-form-group.is-full {
  grid-column: 1 / -1;
}

.lic-cp-form-group label {
  font-size: 11.5px;
  font-weight: 700;
  color: #94a3b8;
}

.lic-cp-form-input {
  width: 100%;
  padding: 8px 11px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #070d17;
  color: #f8fafc;
  font-size: 13px;
  outline: none;
}

.lic-cp-form-input:focus:not([readonly]) {
  border-color: #10b981;
}

.lic-cp-form-input[readonly] {
  opacity: 0.8;
  cursor: default;
}

.lic-cp-form-err {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.16);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #fca5a5;
  font-size: 12.5px;
}

.lic-cp-modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  background: #08101a;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.lic-cp-foot-status {
  font-size: 12.5px;
  color: #94a3b8;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-cp-foot-status strong {
  color: #f8fafc;
}

.lic-cp-foot-btns {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.lic-cp-foot-btn {
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #1e293b;
  color: #f8fafc;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.lic-cp-foot-btn.is-primary {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #34d399;
  color: #ffffff;
}

.lic-cp-foot-btn.is-clear {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(248, 113, 113, 0.45);
  color: #fca5a5;
}

.lic-cp-unlinked-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px dashed rgba(245, 158, 11, 0.42);
  margin-top: 2px;
}

.lic-cp-unlinked-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.lic-cp-unlinked-badge {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  background: rgba(245, 158, 11, 0.22);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.45);
}

.lic-cp-unlinked-text {
  font-size: 11px;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lic-cp-unlinked-text strong {
  color: #f8fafc;
  font-weight: 700;
}

.lic-cp-quick-create-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.18);
  color: #6ee7b7;
  font-size: 10.5px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lic-cp-quick-create-btn:hover {
  background: #059669;
  color: #ffffff;
}

.lic-cp-picker-root.is-light .lic-cp-unlinked-strip {
  background: #fffbeb;
  border-color: #fcd34d;
}

.lic-cp-picker-root.is-light .lic-cp-unlinked-badge {
  background: #fef3c7;
  color: #b45309;
  border-color: #f59e0b;
}

.lic-cp-picker-root.is-light .lic-cp-unlinked-text {
  color: #475569;
}

.lic-cp-picker-root.is-light .lic-cp-unlinked-text strong {
  color: #0f172a;
}

.lic-cp-picker-root.is-light .lic-cp-quick-create-btn {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #047857;
}

.lic-cp-picker-root.is-light .lic-cp-quick-create-btn:hover {
  background: #059669;
  color: #ffffff;
}

/* Light Theme Support */
.lic-cp-picker-root.is-light {
  background: #f0fdf4;
  border-color: #86efac;
}

.lic-cp-picker-root.is-light .lic-cp-label {
  color: #334155;
}

.lic-cp-picker-root.is-light .lic-cp-suggest-btn {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #047857;
}

.lic-cp-picker-root.is-light .lic-cp-suggest-btn:hover:not(:disabled) {
  background: #059669;
  color: #ffffff;
}

.lic-cp-picker-root.is-light .lic-cp-input-box {
  background: #ffffff;
  border-color: #cbd5e1;
}

.lic-cp-picker-root.is-light .lic-cp-input {
  color: #0f172a;
}

.lic-cp-modal-overlay.is-light .lic-cp-modal-card {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-cp-modal-overlay.is-light .lic-cp-modal-head {
  background: linear-gradient(90deg, #0284c7 0%, #2563eb 55%, #1d4ed8 100%);
  border-bottom-color: #7dd3fc;
}

.lic-cp-modal-overlay.is-light .lic-cp-modal-toolbar {
  background: #f1f5f9;
  border-bottom-color: #e2e8f0;
}

.lic-cp-modal-overlay.is-light .lic-cp-search-wrap {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}

.lic-cp-modal-overlay.is-light .lic-cp-search-input {
  color: #0f172a;
}

.lic-cp-modal-overlay.is-light .lic-cp-item {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #0f172a;
}

.lic-cp-modal-overlay.is-light .lic-cp-company-title {
  color: #0f172a;
}

.lic-cp-modal-overlay.is-light .lic-cp-line-lbl {
  color: #64748b;
}

.lic-cp-modal-overlay.is-light .lic-cp-line-val {
  color: #1e293b;
}

.lic-cp-modal-overlay.is-light .lic-cp-line-val.is-cust-pair {
  color: #047857;
}

.lic-cp-picker-root.is-light .lic-cp-act-btn,
.lic-cp-modal-overlay.is-light .lic-cp-act-btn {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #334155;
}

.lic-cp-picker-root.is-light .lic-cp-act-btn.is-view:hover,
.lic-cp-modal-overlay.is-light .lic-cp-act-btn.is-view:hover {
  border-color: #0284c7;
  color: #0369a1;
  background: #e0f2fe;
}

.lic-cp-modal-overlay.is-light .lic-cp-po-badge {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #075985;
}

.lic-cp-modal-overlay.is-light .lic-cp-form-input {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-cp-modal-overlay.is-light .lic-cp-modal-foot {
  background: #f1f5f9;
  border-top-color: #e2e8f0;
}

.lic-cp-modal-overlay.is-light .lic-cp-foot-status strong {
  color: #0f172a;
}

.lic-cp-modal-overlay.is-light .lic-cp-foot-btn {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

@media (max-width: 1100px) {
  .lic-cp-modal-overlay {
    padding: 0 !important;
  }

  .lic-cp-modal-card,
  .lic-cp-modal-card.is-sub-card {
    width: 100% !important;
    max-width: 100% !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border: none !important;
  }

  .lic-cp-modal-card > .lic-cp-modal-head {
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) !important;
    padding-bottom: 12px !important;
    padding-left: 14px !important;
    padding-right: 14px !important;
    border-radius: 0 !important;
  }

  .lic-cp-modal-body {
    max-height: none !important;
    flex: 1 1 0% !important;
    min-height: 0 !important;
    padding: 12px 14px !important;
  }

  .lic-cp-modal-toolbar {
    padding: 10px 14px !important;
  }

  .lic-cp-modal-card > .lic-cp-modal-foot {
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

@media (max-width: 768px) {
  .lic-cp-picker-root,
  .lic-cp-form-grid {
    grid-template-columns: 1fr;
  }
  .lic-cp-search-wrap {
    min-width: 0;
    flex: 1 1 100%;
  }
  .lic-cp-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .lic-cp-card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
