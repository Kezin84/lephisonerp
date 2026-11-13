<template>
  <div
    class="wf-designer-root"
    :class="{
      'theme-light-blue': effectiveTheme === 'light',
      'theme-custom-glass': effectiveTheme === 'custom'
    }"
  >
    <!-- =========================================================
         MINIMALIST SINGLE-BAR WORKFLOW COMMAND STRIP
         ========================================================= -->
    <div class="wf-minimal-toolbar">
      <div class="bg-seg-switch" role="tablist" aria-label="Chế độ quản lý Workflow">
        <button
          type="button"
          class="bg-seg-btn"
          :class="{ 'is-active': subTab === 'customer' }"
          @click="subTab = 'customer'"
        >
          <span>Workflow Khách Hàng</span>
          <span class="wf-tab-count wf-tabular">({{ flatCustomerFlows.length }})</span>
        </button>

        <button
          type="button"
          class="bg-seg-btn"
          :class="{ 'is-active': subTab === 'templates' }"
          @click="subTab = 'templates'"
        >
          <span>Kho Workflow Mẫu</span>
          <span class="wf-tab-count wf-tabular">({{ libraryWorkflowGroups.length + 1 }})</span>
        </button>
      </div>

      <div class="wf-toolbar-right">
        <div v-if="subTab === 'customer'" class="bg-search-shell wf-slim-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            v-model="customerSearch"
            type="text"
            class="bg-search-inp"
            placeholder="Tìm Workflow, Công ty, Khách hàng..."
          />
          <button
            v-if="customerSearch"
            type="button"
            class="bg-search-clr"
            aria-label="Xóa tìm kiếm"
            @click="customerSearch = ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div v-else class="bg-search-shell wf-slim-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            v-model="templateSearch"
            type="text"
            class="bg-search-inp"
            placeholder="Tìm Workflow mẫu, tên bước..."
          />
          <button
            v-if="templateSearch"
            type="button"
            class="bg-search-clr"
            aria-label="Xóa tìm kiếm"
            @click="templateSearch = ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <button
          type="button"
          class="wf-btn wf-btn-primary wf-btn-sm"
          :disabled="saving"
          @click="subTab === 'customer' ? openWorkflowStudioCreate('customer', focusedCustomerRow) : openWorkflowStudioCreate('template')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Tạo Workflow</span>
        </button>

        <button
          type="button"
          class="wf-icon-btn"
          :disabled="loading"
          title="Làm mới dữ liệu"
          aria-label="Làm mới dữ liệu"
          @click="refreshAllData"
        >
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
          <span v-else class="wf-spinner-sm"></span>
        </button>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading && items.length === 0 && customerRows.length === 0" class="wf-empty-card">
      <div class="wf-spinner-lg"></div>
      <div class="wf-empty-title">Đang tải danh sách Workflow...</div>
    </div>

    <!-- =========================================================
         SUBTAB 1: WORKFLOW KHÁCH HÀNG (CLICK CARD -> OPEN STUDIO MODAL)
         ========================================================= -->
    <div v-else-if="subTab === 'customer'" class="wf-flat-list">
      <div v-if="filteredFlatCustomerFlows.length === 0" class="wf-empty-card">
        <div class="wf-empty-title">
          {{
            flatCustomerFlows.length === 0
              ? 'Chưa có Workflow riêng nào của khách hàng'
              : focusedCustomerRow
                ? `Chưa có Workflow riêng cho "${focusedCustomerRow.ten_cong_ty || focusedCustomerRow.ten_khach_hang}"`
                : 'Không tìm thấy Workflow nào phù hợp'
          }}
        </div>
        <div class="wf-empty-sub">
          {{
            flatCustomerFlows.length === 0 || focusedCustomerRow
              ? 'Nhấn Tạo Workflow bên dưới để thiết kế chuỗi bước tiến độ riêng cho khách hàng.'
              : 'Hãy thử từ khóa khác theo tên Workflow, tên Công ty hoặc tên Khách hàng.'
          }}
        </div>
        <button
          v-if="flatCustomerFlows.length === 0 || focusedCustomerRow"
          type="button"
          class="wf-btn wf-btn-primary wf-btn-sm"
          style="margin-top: 6px;"
          @click="openWorkflowStudioCreate('customer', focusedCustomerRow)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>{{ focusedCustomerRow ? 'Tạo Workflow Cho Khách Hàng Này' : 'Tạo Workflow Mới' }}</span>
        </button>
      </div>

      <div
        v-for="flow in filteredFlatCustomerFlows"
        :key="flow.id_workflow"
        class="wf-flat-card is-clickable"
        :class="{ 'is-highlighted': highlightedCustomerKey && flow.customerRowKey === highlightedCustomerKey }"
        title="Nhấn vào thẻ để mở chỉnh sửa Workflow toàn diện"
        @click="openWorkflowStudioEdit(flow)"
      >
        <!-- ROW 1: FLOW NAME — COMPANY • CUSTOMER + QUICK ACTIONS -->
        <div class="wf-flat-head">
          <div class="wf-flat-meta">
            <span class="wf-flat-name">{{ flow.name_workflow }}</span>
            <template v-if="flow.displayCompanyName || flow.displayCustomerName">
              <span class="wf-em-sep">—</span>
              <span class="wf-flat-party">
                <span v-if="flow.displayCompanyName">{{ flow.displayCompanyName }}</span>
                <span v-if="flow.displayCompanyName && flow.displayCustomerName" class="wf-dot-sep">•</span>
                <span v-if="flow.displayCustomerName">{{ flow.displayCustomerName }}</span>
              </span>
            </template>
            <span v-if="flow.is_company_default" class="wf-card-mini-pill is-emerald">Mặc định KH</span>
            <span
              v-if="getDealCountForWorkflow(flow.id_workflow) > 0"
              class="wf-card-mini-pill is-sky wf-tabular"
            >
              {{ getDealCountForWorkflow(flow.id_workflow) }} việc
            </span>
          </div>

          <div class="wf-flat-tools" @click.stop>
            <button
              type="button"
              class="wf-flat-txt-btn"
              title="Mở Workflow này trên tab Công Việc Pipeline"
              @click.stop="emitOpenKanban(flow.id_workflow, flow)"
            >
              Mở Công Việc ↗
            </button>

            <button
              type="button"
              class="wf-ghost-ic-btn"
              title="Nhân bản Workflow này"
              aria-label="Nhân bản Workflow này"
              @click.stop="openWorkflowStudioClone(flow)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>

            <button
              type="button"
              class="wf-ghost-ic-btn is-danger"
              title="Xóa Workflow này"
              aria-label="Xóa Workflow này"
              @click.stop="deleteCustomerFlowFlat(flow)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <!-- ROW 2: SINGLE-LINE HORIZONTAL DRAGGABLE STEPS + INLINE ADD STEP -->
        <div class="wf-flat-track-scroll">
          <draggable
            v-model="flow.statuses"
            :group="'wf-cus-' + flow.id_workflow"
            item-key="id_status_workflow"
            @change="onListChange($event, flow)"
            animation="180"
            ghost-class="wf-ghost-chip"
            drag-class="wf-drag-chip"
            direction="horizontal"
            :disabled="isMobile"
            class="wf-flat-draggable-list"
          >
            <template #item="{ element, index }">
              <div class="wf-flat-step-unit">
                <div
                  class="wf-flat-step-chip"
                  :class="{
                    'is-flash': element.isDraggingSuccess,
                    'is-swap-source': swapSourceItem && swapSourceItem.id_status_workflow === element.id_status_workflow
                  }"
                  :style="{ '--step-clr': element.status_color || '#3b82f6' }"
                  title="Kéo để đổi thứ tự nhanh • Nhấn để mở chỉnh sửa trong Studio"
                  @click.stop="handleCardChipClick(flow, element)"
                >
                  <span v-if="!isMobile" class="wf-step-grip" aria-hidden="true">⠿</span>
                  <span class="wf-step-dot"></span>
                  <span class="wf-step-chip-name">{{ element.status_name || '---' }}</span>
                  <span class="wf-step-chip-pct wf-tabular">({{ element['%status'] || '0%' }})</span>

                  <button
                    v-if="isMobile && (!swapSourceItem || swapSourceItem.id_workflow === element.id_workflow)"
                    type="button"
                    class="wf-mobile-swap-inline"
                    :class="{
                      'is-active': swapSourceItem && swapSourceItem.id_status_workflow === element.id_status_workflow,
                      'is-target': swapSourceItem && swapSourceItem.id_status_workflow !== element.id_status_workflow
                    }"
                    title="Đổi vị trí bước"
                    @click.stop="handleSwapAction(element)"
                  >
                    ⇄
                  </button>
                </div>

                <span
                  v-if="index < flow.statuses.length - 1"
                  class="wf-step-arrow"
                  aria-hidden="true"
                >→</span>
              </div>
            </template>
          </draggable>

          <button
            type="button"
            class="wf-inline-add-step-btn"
            @click.stop="openWorkflowStudioAddStep(flow)"
          >
            + Thêm bước
          </button>
        </div>
      </div>
    </div>

    <!-- =========================================================
         SUBTAB 2: KHO WORKFLOW MẪU (CLICK CARD -> OPEN STUDIO MODAL)
         ========================================================= -->
    <div v-else class="wf-flat-list">
      <!-- SYSTEM BASELINE FLOW CARD -->
      <div
        v-if="showBaselineInTemplates"
        class="wf-flat-card is-clickable"
        title="Nhấn để xem chi tiết cấu trúc Workflow Chuẩn Hệ Thống"
        @click="openWorkflowStudioBaseline"
      >
        <div class="wf-flat-head">
          <div class="wf-flat-meta">
            <span class="wf-flat-name">Workflow Chuẩn Hệ Thống</span>
            <span class="wf-em-sep">—</span>
            <span class="wf-flat-party">Mặc định hệ thống</span>
            <span
              v-if="getDealCountForWorkflow('WF_DEFAULT') > 0"
              class="wf-card-mini-pill is-sky wf-tabular"
            >
              {{ getDealCountForWorkflow('WF_DEFAULT') }} việc
            </span>
          </div>

          <div class="wf-flat-tools" @click.stop>
            <button
              type="button"
              class="wf-flat-txt-btn"
              @click.stop="emitOpenKanban('WF_DEFAULT', null)"
            >
              Mở Công Việc ↗
            </button>

            <button
              type="button"
              class="wf-flat-txt-btn"
              @click.stop="openApplyBlueprintModal(baselineBlueprint)"
            >
              Áp vào Công ty
            </button>

            <button
              type="button"
              class="wf-ghost-ic-btn"
              title="Nhân bản thành Workflow Mẫu mới"
              aria-label="Nhân bản thành Workflow Mẫu mới"
              @click.stop="openWorkflowStudioCreate('template', null, STANDARD_FLOW_STEPS, 'Workflow mẫu — Bản sao Chuẩn')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
        </div>

        <div class="wf-flat-track-scroll">
          <div class="wf-flat-draggable-list">
            <div
              v-for="(st, idx) in STANDARD_FLOW_STEPS"
              :key="'base-' + idx"
              class="wf-flat-step-unit"
            >
              <div
                class="wf-flat-step-chip is-readonly"
                :style="{ '--step-clr': st.status_color || '#3b82f6' }"
              >
                <span class="wf-step-dot"></span>
                <span class="wf-step-chip-name">{{ st.short_label || st.status_name }}</span>
                <span class="wf-step-chip-pct wf-tabular">({{ st['%status'] }})</span>
              </div>
              <span
                v-if="idx < STANDARD_FLOW_STEPS.length - 1"
                class="wf-step-arrow"
                aria-hidden="true"
              >→</span>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY SEARCH / NO MATCHING LIBRARY FLOWS -->
      <div
        v-if="filteredLibraryGroups.length === 0 && !showBaselineInTemplates"
        class="wf-empty-card"
      >
        <div class="wf-empty-title">Không tìm thấy Workflow mẫu phù hợp</div>
        <div class="wf-empty-sub">Hãy thử từ khóa khác hoặc tạo Workflow mẫu mới.</div>
      </div>

      <!-- ALL LIBRARY CARDS (SHARED BLUEPRINTS ONLY — NO CUSTOMER INFO) -->
      <div
        v-for="group in filteredLibraryGroups"
        :key="'lib-' + group.id_workflow"
        class="wf-flat-card is-clickable"
        title="Nhấn vào thẻ để mở chỉnh sửa Workflow mẫu"
        @click="openWorkflowStudioEdit(group)"
      >
        <div class="wf-flat-head">
          <div class="wf-flat-meta">
            <span class="wf-flat-name">{{ group.name_workflow || 'Workflow mẫu chưa đặt tên' }}</span>
            <span class="wf-card-mini-pill is-slate">Mẫu dùng chung</span>
            <span
              v-if="getDealCountForWorkflow(group.id_workflow) > 0"
              class="wf-card-mini-pill is-sky wf-tabular"
            >
              {{ getDealCountForWorkflow(group.id_workflow) }} việc
            </span>
          </div>

          <div class="wf-flat-tools" @click.stop>
            <button
              type="button"
              class="wf-flat-txt-btn"
              title="Áp Workflow mẫu này thành luồng riêng cho Công ty / Khách hàng"
              @click.stop="openApplyBlueprintModal(group)"
            >
              Áp vào Công ty
            </button>

            <button
              type="button"
              class="wf-ghost-ic-btn"
              title="Nhân bản thành Workflow Mẫu mới"
              aria-label="Nhân bản thành Workflow Mẫu mới"
              @click.stop="openWorkflowStudioCreate('template', null, group.statuses, extractCleanFlowSuffix(group.name_workflow) + ' (Bản sao)')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>

            <button
              type="button"
              class="wf-ghost-ic-btn is-danger"
              title="Xóa Workflow Mẫu"
              aria-label="Xóa Workflow Mẫu"
              @click.stop="confirmDeleteWorkflowGroup(group)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <div class="wf-flat-track-scroll">
          <draggable
            v-model="group.statuses"
            :group="'wf-tpl-' + group.id_workflow"
            item-key="id_status_workflow"
            @change="onListChange($event, group)"
            animation="180"
            ghost-class="wf-ghost-chip"
            drag-class="wf-drag-chip"
            direction="horizontal"
            :disabled="isMobile"
            class="wf-flat-draggable-list"
          >
            <template #item="{ element, index }">
              <div class="wf-flat-step-unit">
                <div
                  class="wf-flat-step-chip"
                  :class="{
                    'is-flash': element.isDraggingSuccess,
                    'is-swap-source': swapSourceItem && swapSourceItem.id_status_workflow === element.id_status_workflow
                  }"
                  :style="{ '--step-clr': element.status_color || '#3b82f6' }"
                  title="Kéo để đổi thứ tự nhanh • Nhấn để mở chỉnh sửa trong Studio"
                  @click.stop="handleCardChipClick(group, element)"
                >
                  <span v-if="!isMobile" class="wf-step-grip" aria-hidden="true">⠿</span>
                  <span class="wf-step-dot"></span>
                  <span class="wf-step-chip-name">{{ element.status_name || '---' }}</span>
                  <span class="wf-step-chip-pct wf-tabular">({{ element['%status'] || '0%' }})</span>

                  <button
                    v-if="isMobile && (!swapSourceItem || swapSourceItem.id_workflow === element.id_workflow)"
                    type="button"
                    class="wf-mobile-swap-inline"
                    :class="{
                      'is-active': swapSourceItem && swapSourceItem.id_status_workflow === element.id_status_workflow,
                      'is-target': swapSourceItem && swapSourceItem.id_status_workflow !== element.id_status_workflow
                    }"
                    title="Đổi vị trí bước"
                    @click.stop="handleSwapAction(element)"
                  >
                    ⇄
                  </button>
                </div>

                <span
                  v-if="index < group.statuses.length - 1"
                  class="wf-step-arrow"
                  aria-hidden="true"
                >→</span>
              </div>
            </template>
          </draggable>

          <button
            type="button"
            class="wf-inline-add-step-btn"
            @click.stop="openWorkflowStudioAddStep(group)"
          >
            + Thêm bước
          </button>
        </div>
      </div>
    </div>

    <!-- =========================================================
         MODAL 1: UNIFIED 2-COLUMN WORKFLOW STUDIO (100% FULLSCREEN)
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showStudioModal"
        class="bg-modal-overlay wf-modal-overlay is-studio-fullscreen-overlay"
        :class="{
          'theme-light-blue': effectiveTheme === 'light',
          'theme-custom-glass': effectiveTheme === 'custom'
        }"
        @click.self="closeStudioModal"
      >
        <div class="wf-modal-card wf-modal-studio" @click="closeInlineStepPopovers">
          <div class="wf-modal-grab" aria-hidden="true"></div>

          <!-- STUDIO HEADER -->
          <div class="wf-modal-header wf-studio-header">
            <div class="wf-studio-head-left">
              <div
                class="wf-modal-ic"
                :class="{ 'is-sky': studioMode === 'baseline' || studioForm.mode === 'template' }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div class="wf-studio-head-titles">
                <div class="wf-studio-title-row">
                  <h3 class="wf-modal-title">
                    {{
                      studioMode === 'baseline'
                        ? 'Workflow Chuẩn Hệ Thống'
                        : studioMode === 'edit'
                          ? 'Chỉnh Sửa Workflow'
                          : 'Tạo Workflow Mới'
                    }}
                  </h3>
                  <div class="wf-studio-pills">
                    <span
                      class="wf-ctx-pill"
                      :class="studioMode === 'baseline' || studioForm.mode === 'template' ? 'is-sky' : 'is-emerald'"
                    >
                      {{
                        studioMode === 'baseline'
                          ? 'Chuẩn Hệ Thống'
                          : studioForm.mode === 'customer'
                            ? 'Workflow Khách Hàng'
                            : 'Workflow Mẫu (Blueprint)'
                      }}
                    </span>
                    <span class="wf-ctx-pill is-slate wf-tabular">{{ studioForm.steps.length }} bước</span>
                    <span v-if="studioActiveDealCount > 0" class="wf-ctx-pill is-amber wf-tabular">
                      {{ studioActiveDealCount }} công việc đang chạy
                    </span>
                    <span
                      v-if="studioMode !== 'baseline' && studioForm.mode === 'customer' && studioForm.setAsDefault"
                      class="wf-ctx-pill is-emerald"
                    >
                      ★ Mặc định KH
                    </span>
                  </div>
                </div>
                <p class="wf-modal-sub">
                  {{
                    studioMode === 'baseline'
                      ? 'Cấu trúc 5 bước mặc định áp cho các khách hàng chưa thiết lập Workflow riêng'
                      : studioMode === 'edit'
                        ? 'Cập nhật tên, khách hàng sở hữu và kéo-thả sắp xếp chuỗi bước tiến độ trong một lần lưu'
                        : 'Định danh phạm vi Workflow ở cột trái và thiết kế chuỗi bước tiến độ ở cột phải'
                  }}
                </p>
              </div>
            </div>

            <div class="wf-studio-head-right">
              <button
                v-if="studioMode === 'baseline' || (studioMode === 'edit' && studioForm.mode === 'template')"
                type="button"
                class="wf-btn wf-btn-slate wf-btn-sm bg-hide-sm"
                @click="triggerApplyBlueprintFromStudio"
              >
                Áp vào Công ty
              </button>
              <button
                v-if="studioMode !== 'create'"
                type="button"
                class="wf-btn wf-btn-sky-soft wf-btn-sm"
                @click="openKanbanFromStudio"
              >
                <span>Mở Công Việc ↗</span>
              </button>
              <button type="button" class="wf-modal-close" @click="closeStudioModal" aria-label="Đóng">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <!-- 2-COLUMN STUDIO WORKSPACE BODY -->
          <div class="wf-studio-body-grid">
            <!-- ===================================================
                 COLUMN 1 (LEFT ~38%): IDENTITY, SCOPE & CUSTOMER
                 =================================================== -->
            <section class="modal-group wf-studio-col wf-studio-col-left">
              <div class="modal-banner-header is-sky">
                <div class="modal-banner-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  <span>ĐỊNH DANH &amp; PHẠM VI WORKFLOW</span>
                </div>
              </div>

              <div class="modal-group-body wf-studio-col-scroll">
                <!-- SYSTEM BASELINE READ-ONLY LEFT PANE -->
                <template v-if="studioMode === 'baseline'">
                  <div class="wf-baseline-info-box">
                    <div class="wf-baseline-info-title">Khung vận hành mặc định toàn hệ thống</div>
                    <div class="wf-baseline-info-desc">
                      Mọi Công việc Pipeline của khách hàng chưa có Workflow riêng sẽ tự động chạy trên 5 bước chuẩn này (kèm 2 cột kết thúc <strong>100% Thành công</strong> và <strong>0% Thất bại</strong>).
                    </div>
                    <div class="wf-baseline-stat-row wf-tabular">
                      <span>Công việc đang chạy trên khung chuẩn:</span>
                      <strong>{{ studioActiveDealCount }} việc</strong>
                    </div>
                  </div>

                  <div class="wf-baseline-cta-stack">
                    <button
                      type="button"
                      class="wf-studio-action-card"
                      @click="openWorkflowStudioCreate('customer', null, STANDARD_FLOW_STEPS, '')"
                    >
                      <div class="wf-sac-title">+ Tạo Workflow riêng cho Khách hàng từ khung này</div>
                      <div class="wf-sac-sub">Chọn 1 Công ty / Khách hàng và tùy biến lại các bước theo thực tế</div>
                    </button>

                    <button
                      type="button"
                      class="wf-studio-action-card"
                      @click="openWorkflowStudioCreate('template', null, STANDARD_FLOW_STEPS, 'Workflow mẫu — Bản sao Chuẩn')"
                    >
                      <div class="wf-sac-title">+ Nhân bản thành Workflow Mẫu (Blueprint)</div>
                      <div class="wf-sac-sub">Tạo mẫu dùng chung mới dựa trên 5 bước chuẩn để áp cho nhiều công ty</div>
                    </button>

                    <button
                      type="button"
                      class="wf-studio-action-card"
                      @click="triggerApplyBlueprintFromStudio"
                    >
                      <div class="wf-sac-title">Áp thẳng khung chuẩn cho nhiều Công ty</div>
                      <div class="wf-sac-sub">Khởi tạo nhanh Workflow riêng hàng loạt cho danh sách công ty được chọn</div>
                    </button>
                  </div>
                </template>

                <!-- CREATE / EDIT LEFT PANE -->
                <template v-else>
                  <!-- 1. SCOPE CHOICE GRID (2 BUTTONS) -->
                  <div class="wf-field">
                    <label class="wf-label">1. Loại Workflow</label>
                    <div class="wf-scope-choice-grid">
                      <button
                        type="button"
                        class="wf-scope-choice-btn"
                        :class="{ 'is-active': studioForm.mode === 'customer' }"
                        @click="switchStudioScope('customer')"
                      >
                        <span class="wf-scope-choice-main">Theo Khách Hàng</span>
                        <span class="wf-scope-choice-sub">Gắn riêng 1 Công ty / KH</span>
                      </button>
                      <button
                        type="button"
                        class="wf-scope-choice-btn is-sky-tone"
                        :class="{ 'is-active': studioForm.mode === 'template' }"
                        @click="switchStudioScope('template')"
                      >
                        <span class="wf-scope-choice-main">Workflow Mẫu</span>
                        <span class="wf-scope-choice-sub">Blueprint dùng chung</span>
                      </button>
                    </div>
                  </div>

                  <!-- 2. WORKFLOW NAME (#1 PRIMARY INPUT) -->
                  <div class="wf-field">
                    <label class="wf-label">
                      2. {{ studioForm.mode === 'customer' ? 'Tên Workflow' : 'Tên Workflow Mẫu' }}
                      <span class="wf-req">*</span>
                    </label>
                    <input
                      ref="studioNameInputRef"
                      v-model="studioForm.name_workflow"
                      type="text"
                      class="bg-input wf-input-hero-title"
                      :placeholder="
                        studioForm.mode === 'customer'
                          ? 'VD: ACB — Đấu thầu thiết bị / Gia hạn License...'
                          : 'VD: Workflow Đấu Thầu Ngân Hàng / Gia Hạn License...'
                      "
                    />
                  </div>

                  <!-- 3. STANDARDIZED CUSTOMER PICKER (WHEN MODE === 'customer') -->
                  <div v-if="studioForm.mode === 'customer'" class="wf-customer-group-box">
                    <div class="wf-customer-group-head">
                      <span class="wf-label">3. Khách hàng sở hữu Workflow</span>
                      <button
                        type="button"
                        class="wf-link-action-btn"
                        @click="openStudioAddCustomerModal"
                      >
                        + Thêm KH mới
                      </button>
                    </div>

                    <div class="wf-field">
                      <label class="wf-sub-label">Tên Công ty <span class="wf-req">*</span></label>
                      <div class="wf-input-with-picker">
                        <input
                          :value="studioForm.ten_cong_ty"
                          type="text"
                          class="bg-input has-inline-picker"
                          readonly
                          placeholder="Nhấn Chọn để gán Công ty..."
                          @click="openStudioCustomerPicker('company')"
                        />
                        <button
                          v-if="studioForm.ten_cong_ty"
                          type="button"
                          class="wf-inline-clear-btn"
                          title="Xóa Công ty đang chọn"
                          @click.stop="clearStudioCompany"
                        >
                          ×
                        </button>
                        <button
                          type="button"
                          class="wf-inline-pick-btn"
                          @click="openStudioCustomerPicker('company')"
                        >
                          Chọn
                        </button>
                      </div>
                    </div>

                    <div class="wf-field">
                      <label class="wf-sub-label">Người liên hệ / Khách hàng</label>
                      <div class="wf-input-with-picker">
                        <input
                          :value="studioForm.ten_khach_hang"
                          type="text"
                          class="bg-input has-inline-picker"
                          readonly
                          placeholder="Chọn người liên hệ (tùy chọn)..."
                          @click="openStudioCustomerPicker('contact')"
                        />
                        <button
                          v-if="studioForm.ten_khach_hang"
                          type="button"
                          class="wf-inline-clear-btn"
                          title="Xóa người liên hệ"
                          @click.stop="clearStudioContact"
                        >
                          ×
                        </button>
                        <button
                          type="button"
                          class="wf-inline-pick-btn"
                          @click="openStudioCustomerPicker('contact')"
                        >
                          Chọn
                        </button>
                      </div>
                    </div>

                    <!-- DEFAULT TOGGLE CARD -->
                    <div
                      class="wf-toggle-card"
                      :class="{ 'is-on': studioForm.setAsDefault }"
                      @click="studioForm.setAsDefault = !studioForm.setAsDefault"
                    >
                      <span class="wf-apply-check-box" :class="{ 'is-on': studioForm.setAsDefault }">
                        <svg v-if="studioForm.setAsDefault" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </span>
                      <div class="wf-toggle-card-copy">
                        <div class="wf-toggle-card-title">Đặt làm Workflow mặc định của khách hàng</div>
                        <div class="wf-toggle-card-sub">Tự động gán khi tạo Công việc mới cho công ty này</div>
                      </div>
                    </div>
                  </div>

                  <!-- 4. QUICK PRESET LOADER -->
                  <div class="wf-field">
                    <label class="wf-label">
                      {{ studioForm.mode === 'customer' ? '4.' : '3.' }} Nạp nhanh chuỗi bước từ mẫu có sẵn
                    </label>
                    <select
                      v-model="studioForm.selectedPresetId"
                      class="bg-input"
                      @change="handleStudioPresetSelect(studioForm.selectedPresetId)"
                    >
                      <option value="">-- Giữ chuỗi bước đang thiết kế bên phải --</option>
                      <option value="WF_DEFAULT">Workflow Chuẩn Hệ Thống (5 bước)</option>
                      <optgroup v-if="templateWorkflowGroups.length > 0" label="Kho Workflow Mẫu (Blueprint)">
                        <option
                          v-for="tpl in templateWorkflowGroups"
                          :key="'st-opt-' + tpl.id_workflow"
                          :value="tpl.id_workflow"
                        >
                          {{ tpl.name_workflow }} ({{ tpl.statuses.length }} bước)
                        </option>
                      </optgroup>
                      <optgroup v-if="flatCustomerFlows.length > 0" label="Workflow Của Khách Hàng Khác">
                        <option
                          v-for="cg in flatCustomerFlows"
                          :key="'st-opt-cg-' + cg.id_workflow"
                          :value="cg.id_workflow"
                        >
                          {{ cg.name_workflow }}{{ cg.displayCompanyName ? ' — ' + cg.displayCompanyName : '' }} ({{ cg.statuses.length }} bước)
                        </option>
                      </optgroup>
                      <option value="__BLANK__">Khung trắng (1 bước khởi tạo 10%)</option>
                    </select>
                  </div>

                  <!-- 5. EXTRA SHORTCUTS WHEN EDITING EXISTING WORKFLOW -->
                  <div v-if="studioMode === 'edit'" class="wf-edit-utility-box">
                    <div class="wf-edit-utility-row wf-tabular">
                      <span>Công việc đang chạy trên Workflow này:</span>
                      <strong>{{ studioActiveDealCount }} việc</strong>
                    </div>
                    <div class="wf-edit-utility-actions">
                      <button
                        v-if="studioForm.mode === 'customer'"
                        type="button"
                        class="wf-flat-txt-btn"
                        @click="cloneCurrentStudioAsBlueprint"
                      >
                        Lưu bản sao vào Kho Workflow Mẫu
                      </button>
                      <button
                        v-else
                        type="button"
                        class="wf-flat-txt-btn"
                        @click="triggerApplyBlueprintFromStudio"
                      >
                        Áp mẫu này cho Công ty / KH
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </section>

            <!-- ===================================================
                 COLUMN 2 (RIGHT ~62%): LIVE KANBAN PREVIEW & DRAGGABLE STEPS
                 =================================================== -->
            <aside class="modal-group wf-studio-col wf-studio-col-right">
              <div class="modal-banner-header is-emerald">
                <div class="modal-banner-title wf-tabular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  <span>CHUỖI BƯỚC TIẾN ĐỘ ({{ studioForm.steps.length }})</span>
                </div>
                <button
                  v-if="studioMode !== 'baseline'"
                  type="button"
                  class="bg-banner-btn"
                  @click="addStudioStepRow()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>Thêm bước</span>
                </button>
              </div>

              <div class="modal-group-body wf-studio-col-scroll">
                <!-- LIVE KANBAN FLOW VISUAL PREVIEW STRIP -->
                <div class="wf-live-preview-box">
                  <div class="wf-live-preview-head">
                    <span>MÔ PHỎNG DẢI CỘT TRÊN CÔNG VIỆC PIPELINE</span>
                    <span class="wf-live-preview-note">2 cột kết thúc tự động gắn cuối bảng</span>
                  </div>
                  <div class="wf-live-preview-track">
                    <template v-for="(st, pIdx) in studioForm.steps" :key="'lp-' + st._uid">
                      <div
                        class="wf-live-col-pill"
                        :style="{ '--step-clr': st.status_color || '#3b82f6' }"
                      >
                        <span class="wf-step-dot"></span>
                        <span class="wf-live-col-pct wf-tabular">{{ formatPercentStatus(st['%status']) }}</span>
                        <span class="wf-live-col-name">{{ st.status_name || 'Chưa đặt tên' }}</span>
                      </div>
                      <span v-if="pIdx < studioForm.steps.length - 1" class="wf-step-arrow" aria-hidden="true">→</span>
                    </template>
                    <span class="wf-live-term-sep" aria-hidden="true">|</span>
                    <div class="wf-live-col-pill is-term-won wf-tabular">✓ 100% Thành công</div>
                    <div class="wf-live-col-pill is-term-lost wf-tabular">✕ 0% Thất bại</div>
                  </div>
                </div>

                <!-- BASELINE READ-ONLY STEPS LIST -->
                <div v-if="studioMode === 'baseline'" class="wf-studio-steps-list">
                  <div
                    v-for="(st, bIdx) in studioForm.steps"
                    :key="'base-row-' + st._uid"
                    class="wf-studio-step-row is-readonly"
                  >
                    <span class="wf-studio-row-idx wf-tabular" :style="{ backgroundColor: st.status_color || '#3b82f6' }">
                      {{ String(bIdx + 1).padStart(2, '0') }}
                    </span>
                    <div class="wf-studio-readonly-name">{{ st.status_name }}</div>
                    <span class="wf-studio-readonly-pct wf-tabular">{{ formatPercentStatus(st['%status']) }}</span>
                  </div>
                </div>

                <!-- INTERACTIVE DRAGGABLE STEPS EDITOR -->
                <template v-else>
                  <draggable
                    v-model="studioForm.steps"
                    item-key="_uid"
                    handle=".wf-studio-row-grip"
                    animation="180"
                    ghost-class="wf-studio-row-ghost"
                    class="wf-studio-steps-list"
                  >
                    <template #item="{ element: st, index }">
                      <div
                        class="wf-studio-step-row"
                        :class="{ 'is-focused-step': focusedStepUid === st._uid }"
                      >
                        <!-- DRAG HANDLE -->
                        <span
                          v-if="!isMobile"
                          class="wf-studio-row-grip"
                          title="Nắm kéo lên/xuống để đổi thứ tự bước"
                          aria-hidden="true"
                        >⠿</span>

                        <!-- STEP NUMBER -->
                        <span
                          class="wf-studio-row-idx wf-tabular"
                          :style="{ backgroundColor: st.status_color || '#3b82f6' }"
                        >
                          {{ String(index + 1).padStart(2, '0') }}
                        </span>

                        <!-- COMPACT COLOR SWATCH POPOVER -->
                        <div class="wf-color-pop-wrap" @click.stop>
                          <button
                            type="button"
                            class="wf-color-trigger-btn"
                            title="Đổi màu nhận diện của cột"
                            @click="toggleColorPopover(st._uid)"
                          >
                            <span class="wf-color-trigger-dot" :style="{ backgroundColor: st.status_color || '#3b82f6' }"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>

                          <div v-if="openColorRowUid === st._uid" class="wf-color-popover">
                            <button
                              v-for="color in PRESET_COLORS"
                              :key="color.hex"
                              type="button"
                              class="wf-color-pop-item"
                              :class="{ 'is-active': st.status_color === color.hex }"
                              :style="{ backgroundColor: color.hex }"
                              :title="color.name"
                              @click="pickStepColor(st, color.hex)"
                            >
                              <svg v-if="st.status_color === color.hex" viewBox="0 0 24 24" width="12" height="12" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                          </div>
                        </div>

                        <!-- STEP NAME INPUT -->
                        <input
                          :ref="(el) => setStepInputRef(st._uid, el)"
                          v-model="st.status_name"
                          type="text"
                          class="bg-input wf-studio-step-inp"
                          placeholder="Nhập tên bước (VD: Khảo sát yêu cầu...)"
                          @focus="focusedStepUid = st._uid"
                          @keydown.enter.prevent="onStepNameEnter(index)"
                        />

                        <!-- PROGRESS % INPUT + QUICK % CHIPS POPOVER -->
                        <div class="wf-pct-pop-wrap" @click.stop>
                          <input
                            v-model="st['%status']"
                            type="text"
                            class="bg-input wf-studio-pct-inp wf-tabular"
                            placeholder="30%"
                            @focus="openPctPopover(st._uid)"
                            @blur="onStepPctBlur(st)"
                            @keydown.enter.prevent="openPctRowUid = ''"
                          />
                          <div v-if="openPctRowUid === st._uid" class="wf-pct-popover">
                            <button
                              v-for="pct in QUICK_PERCENT_PRESETS"
                              :key="pct"
                              type="button"
                              class="wf-pct-chip wf-tabular"
                              :class="{ 'is-active': formatPercentStatus(st['%status']) === pct }"
                              @mousedown.prevent="pickQuickPct(st, pct)"
                            >
                              {{ pct }}
                            </button>
                          </div>
                        </div>

                        <!-- ACTIVE PIPELINE DEALS BADGE ON STEP -->
                        <span
                          v-if="studioMode === 'edit' && getStepDealCount(st) > 0"
                          class="wf-step-deal-pill wf-tabular"
                          :title="getStepDealCount(st) + ' Công việc Pipeline đang nằm ở bước này'"
                        >
                          {{ getStepDealCount(st) }} việc
                        </span>

                        <!-- ROW ACTIONS -->
                        <div class="wf-studio-row-acts">
                          <template v-if="isMobile">
                            <button
                              type="button"
                              class="wf-row-ic-btn"
                              :disabled="index === 0"
                              title="Chuyển lên"
                              @click="moveStudioStep(index, -1)"
                            >↑</button>
                            <button
                              type="button"
                              class="wf-row-ic-btn"
                              :disabled="index === studioForm.steps.length - 1"
                              title="Chuyển xuống"
                              @click="moveStudioStep(index, 1)"
                            >↓</button>
                          </template>

                          <button
                            type="button"
                            class="wf-row-ic-btn"
                            title="Chèn thêm 1 bước ngay bên dưới"
                            @click="insertStudioStepAfter(index)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          </button>

                          <button
                            type="button"
                            class="wf-row-ic-btn is-danger"
                            :disabled="studioForm.steps.length <= 1"
                            title="Xóa bước này"
                            @click="removeStudioStepRow(index)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    </template>
                  </draggable>

                  <button
                    type="button"
                    class="wf-studio-add-step-card"
                    @click="addStudioStepRow()"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Thêm bước tiến độ mới</span>
                    <span class="wf-studio-add-hint bg-hide-sm">(Nhấn Enter ở ô tên bước để thêm liên tiếp)</span>
                  </button>
                </template>
              </div>
            </aside>
          </div>

          <!-- STUDIO STICKY FOOTER -->
          <div class="wf-modal-footer is-studio-foot">
            <div class="wf-studio-foot-left">
              <button
                v-if="studioMode === 'edit'"
                type="button"
                class="wf-btn wf-btn-danger-ghost"
                :disabled="saving"
                @click="deleteWorkflowFromStudio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>Xóa Workflow</span>
              </button>
              <span class="wf-studio-kbd-hint bg-hide-sm">
                {{ studioMode === 'baseline' ? 'Esc để đóng' : 'Ctrl + S lưu nhanh · Kéo ⠿ để sắp xếp · Esc đóng' }}
              </span>
            </div>

            <div class="wf-studio-foot-right">
              <button
                v-if="studioMode !== 'create'"
                type="button"
                class="wf-btn wf-btn-slate"
                :disabled="saving"
                @click="cloneFromCurrentStudio"
              >
                Nhân bản
              </button>
              <button
                type="button"
                class="wf-btn wf-btn-slate"
                :disabled="saving"
                @click="closeStudioModal"
              >
                {{ studioMode === 'baseline' ? 'Đóng' : 'Hủy' }}
              </button>
              <button
                v-if="studioMode !== 'baseline'"
                type="button"
                class="wf-btn wf-btn-primary"
                :disabled="saving"
                @click="submitWorkflowStudio"
              >
                <span v-if="saving" class="wf-spinner-sm"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>{{ studioMode === 'edit' ? 'Lưu Cập Nhật' : 'Lưu Workflow' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL 2: CUSTOMER / CONTACT PICKER POPUP (SYNCED WITH PIPELINE)
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showStudioCustomerPicker"
        class="bg-modal-overlay wf-modal-overlay is-sub-picker-overlay"
        :class="{
          'theme-light-blue': effectiveTheme === 'light',
          'theme-custom-glass': effectiveTheme === 'custom'
        }"
        @click.self="showStudioCustomerPicker = false"
      >
        <div class="wf-modal-card wf-modal-md">
          <div class="wf-modal-grab" aria-hidden="true"></div>
          <div class="wf-modal-header">
            <div>
              <h3 class="wf-modal-title">
                {{
                  studioCustomerPickerFocus === 'contact'
                    ? 'Chọn Người Liên Hệ / Khách Hàng'
                    : 'Chọn Tên Công Ty / Khách Hàng'
                }}
              </h3>
              <p
                v-if="studioCustomerPickerFocus === 'contact' && studioForm.ten_cong_ty"
                class="wf-modal-sub"
              >
                Đang ưu tiên người liên hệ thuộc: <strong>{{ studioForm.ten_cong_ty }}</strong>
              </p>
            </div>
            <button type="button" class="wf-modal-close" @click="showStudioCustomerPicker = false" aria-label="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="wf-modal-body">
            <div class="wf-picker-top-bar">
              <input
                ref="studioCustomerSearchInputRef"
                v-model="studioCustomerPickerSearch"
                type="text"
                class="bg-input"
                style="flex: 1; min-width: 180px;"
                :placeholder="
                  studioCustomerPickerFocus === 'contact'
                    ? 'Tìm hoặc nhập tên người liên hệ, công ty...'
                    : 'Tìm hoặc nhập tên công ty, người liên hệ, mã KH...'
                "
                @keydown.enter.prevent="studioCustomerPickerSearch.trim() && filteredStudioCustomers.length === 0 && applyManualStudioCustomerSearch()"
              />
              <button
                v-if="studioCustomerPickerSearch.trim()"
                type="button"
                class="wf-btn wf-btn-sky-soft wf-btn-sm"
                @click="applyManualStudioCustomerSearch"
              >
                Dùng "{{ studioCustomerPickerSearch.trim() }}"
              </button>
              <button
                type="button"
                class="wf-btn wf-btn-primary wf-btn-sm"
                @click="openStudioAddCustomerModal"
              >
                + Thêm KH mới
              </button>
            </div>

            <div class="wf-picker-rows-list">
              <div v-if="filteredStudioCustomers.length === 0" class="wf-empty-inline">
                <div>Không tìm thấy khách hàng có sẵn khớp từ khóa.</div>
                <div v-if="studioCustomerPickerSearch.trim()" style="margin-top: 8px;">
                  <button type="button" class="wf-btn wf-btn-primary wf-btn-sm" @click="applyManualStudioCustomerSearch">
                    + Chọn nhanh "{{ studioCustomerPickerSearch.trim() }}"
                  </button>
                </div>
              </div>

              <div
                v-for="c in filteredStudioCustomers"
                :key="c.pickKey"
                class="wf-picker-row-item"
                :class="{ 'is-selected': isStudioCustomerActive(c) }"
                @click="selectStudioCustomerOption(c)"
              >
                <div class="wf-picker-row-main">
                  <div class="wf-picker-row-title">
                    {{
                      studioCustomerPickerFocus === 'contact'
                        ? c.ten_khach_hang || c.ten_cong_ty
                        : c.ten_cong_ty || c.ten_khach_hang
                    }}
                  </div>
                  <div class="wf-picker-row-sub">
                    <template v-if="studioCustomerPickerFocus === 'contact'">
                      {{ c.ten_cong_ty || 'Chưa rõ công ty' }}
                      <template v-if="c.ma_khach_hang"> • <span class="wf-mono">{{ c.ma_khach_hang }}</span></template>
                    </template>
                    <template v-else>
                      {{ c.ten_khach_hang || 'Chưa có người liên hệ' }}
                      <template v-if="c.ma_khach_hang"> • <span class="wf-mono">{{ c.ma_khach_hang }}</span></template>
                    </template>
                  </div>
                </div>

                <div class="wf-picker-row-right">
                  <span v-if="c._isSameCompany" class="wf-card-mini-pill is-sky">Cùng công ty</span>
                  <span v-if="c.existingFlowCount > 0" class="wf-card-mini-pill is-emerald wf-tabular">
                    {{ c.existingFlowCount }} Workflow
                  </span>
                  <button
                    type="button"
                    class="wf-picker-choose-btn"
                    :class="{ 'is-selected': isStudioCustomerActive(c) }"
                    @click.stop="selectStudioCustomerOption(c)"
                  >
                    {{ isStudioCustomerActive(c) ? 'Đang chọn' : 'Chọn' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="wf-modal-footer">
            <button type="button" class="wf-btn wf-btn-slate" @click="showStudioCustomerPicker = false">Đóng</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL 3: QUICK ADD NEW CUSTOMER TO DIRECTORY
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showStudioAddCustomerModal"
        class="bg-modal-overlay wf-modal-overlay is-top-picker-overlay"
        :class="{
          'theme-light-blue': effectiveTheme === 'light',
          'theme-custom-glass': effectiveTheme === 'custom'
        }"
        @click.self="showStudioAddCustomerModal = false"
      >
        <div class="wf-modal-card" style="max-width: 440px;">
          <div class="wf-modal-grab" aria-hidden="true"></div>
          <div class="wf-modal-header">
            <h3 class="wf-modal-title">Thêm Khách Hàng Mới</h3>
            <button type="button" class="wf-modal-close" @click="showStudioAddCustomerModal = false" aria-label="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="wf-modal-body">
            <div class="wf-field">
              <label class="wf-label">Tên Công Ty <span class="wf-req">*</span></label>
              <input
                v-model="newStudioCustomerForm.ten_cong_ty"
                type="text"
                class="bg-input"
                placeholder="VD: CÔNG TY CỔ PHẦN ABC..."
              />
            </div>
            <div class="wf-field">
              <label class="wf-label">Tên Người Liên Hệ / Khách Hàng <span class="wf-req">*</span></label>
              <input
                v-model="newStudioCustomerForm.ten_khach_hang"
                type="text"
                class="bg-input"
                placeholder="VD: ANH MINH..."
                @keydown.enter.prevent="submitNewStudioCustomer"
              />
            </div>
          </div>
          <div class="wf-modal-footer">
            <button type="button" class="wf-btn wf-btn-slate" @click="showStudioAddCustomerModal = false">Hủy</button>
            <button
              type="button"
              class="wf-btn wf-btn-primary"
              :disabled="isSavingNewCustomer"
              @click="submitNewStudioCustomer"
            >
              <span v-if="isSavingNewCustomer" class="wf-spinner-sm"></span>
              <span>Lưu Khách Hàng</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL 4: APPLY WORKFLOW BLUEPRINT TO ONE OR MULTIPLE COMPANIES
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showApplyBlueprintModal"
        class="bg-modal-overlay wf-modal-overlay is-sub-picker-overlay"
        :class="{
          'theme-light-blue': effectiveTheme === 'light',
          'theme-custom-glass': effectiveTheme === 'custom'
        }"
        @click.self="showApplyBlueprintModal = false"
      >
        <div class="wf-modal-card wf-modal-lg">
          <div class="wf-modal-grab" aria-hidden="true"></div>
          <div class="wf-modal-header">
            <div class="wf-modal-title-wrap">
              <div class="wf-modal-ic is-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              </div>
              <div>
                <h3 class="wf-modal-title">Áp Workflow Mẫu Vào Công Ty / Khách Hàng</h3>
                <p class="wf-modal-sub">
                  Workflow gốc: {{ applyBlueprintState.blueprint?.name_workflow }} ({{ (applyBlueprintState.blueprint?.statuses || []).length }} bước)
                </p>
              </div>
            </div>
            <button type="button" class="wf-modal-close" @click="showApplyBlueprintModal = false" aria-label="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="wf-modal-body">
            <!-- GROUP 1: BLUEPRINT PREVIEW & NAMING SUFFIX -->
            <div class="modal-group">
              <div class="wf-clean-group-head">
                <span>1. Đặt tên Workflow khi áp vào Công ty</span>
              </div>
              <div class="modal-group-body">
                <div class="wf-flat-track-scroll">
                  <div class="wf-flat-draggable-list">
                    <div
                      v-for="(st, sIdx) in (applyBlueprintState.blueprint?.statuses || [])"
                      :key="'bp-prev-' + sIdx"
                      class="wf-flat-step-unit"
                    >
                      <div class="wf-flat-step-chip is-readonly">
                        <span class="wf-step-dot" :style="{ backgroundColor: st.status_color || '#3b82f6' }"></span>
                        <span class="wf-step-chip-name">{{ st.short_label || st.status_name }}</span>
                        <span class="wf-step-chip-pct wf-tabular">({{ st['%status'] }})</span>
                      </div>
                      <span
                        v-if="sIdx < (applyBlueprintState.blueprint?.statuses || []).length - 1"
                        class="wf-step-arrow"
                        aria-hidden="true"
                      >→</span>
                    </div>
                  </div>
                </div>

                <div class="wf-form-row-2">
                  <div class="wf-field">
                    <label class="wf-label">Nhãn quy trình gắn sau tên Công ty <span class="wf-req">*</span></label>
                    <input
                      v-model="applyBlueprintState.flowSuffix"
                      type="text"
                      class="bg-input"
                      placeholder="VD: Đấu thầu thiết bị / Gia hạn License..."
                    />
                  </div>
                  <div class="wf-field">
                    <label class="wf-label">Xem trước tên Workflow sẽ tạo</label>
                    <div class="wf-name-preview-box">
                      [Tên Công Ty] — <strong>{{ applyBlueprintState.flowSuffix || applyBlueprintState.blueprint?.name_workflow || 'Quy trình riêng' }}</strong>
                    </div>
                  </div>
                </div>

                <label class="wf-check-line">
                  <input v-model="applyBlueprintState.setAsDefault" type="checkbox" />
                  <span>Đặt làm Workflow mặc định cho các Công ty được chọn</span>
                </label>
              </div>
            </div>

            <!-- GROUP 2: MULTI-SELECT COMPANIES -->
            <div class="modal-group">
              <div class="wf-clean-group-head">
                <span class="wf-tabular">2. Chọn Công ty áp dụng ({{ applyBlueprintState.selectedKeys.length }} đã chọn)</span>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="wf-flat-txt-btn" @click="selectAllFilteredApplyCompanies">
                    Chọn tất cả
                  </button>
                  <button
                    v-if="applyBlueprintState.selectedKeys.length > 0"
                    type="button"
                    class="wf-flat-txt-btn"
                    @click="applyBlueprintState.selectedKeys = []"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div class="modal-group-body">
                <div class="bg-search-shell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input
                    v-model="applyBlueprintState.search"
                    type="text"
                    class="bg-search-inp"
                    placeholder="Gõ tìm Công ty, Khách hàng..."
                  />
                  <button
                    v-if="applyBlueprintState.search"
                    type="button"
                    class="bg-search-clr"
                    @click="applyBlueprintState.search = ''"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div class="wf-apply-company-list">
                  <div v-if="filteredApplyCompanyRows.length === 0" class="wf-empty-inline">
                    Không tìm thấy công ty nào khớp từ khóa.
                  </div>
                  <div
                    v-for="co in filteredApplyCompanyRows"
                    :key="'ap-' + co.rowKey"
                    class="wf-apply-company-row"
                    :class="{ 'is-checked': applyBlueprintState.selectedKeys.includes(co.rowKey) }"
                    @click="toggleApplyCompanyKey(co.rowKey)"
                  >
                    <span class="wf-apply-check-box" :class="{ 'is-on': applyBlueprintState.selectedKeys.includes(co.rowKey) }">
                      <svg v-if="applyBlueprintState.selectedKeys.includes(co.rowKey)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>

                    <div class="wf-apply-company-info">
                      <div class="wf-apply-company-title">
                        <span>{{ co.ten_cong_ty || co.ten_khach_hang }}</span>
                        <span v-if="co.contactsLabel && co.ten_cong_ty && cleanCode(co.contactsLabel) !== cleanCode(co.ten_cong_ty)" class="wf-apply-muted-meta">
                          • {{ co.contactsLabel }}
                        </span>
                      </div>
                      <div v-if="co.customGroups.length > 0" class="wf-apply-company-sub">
                        <span>Đang có {{ co.customGroups.length }} Workflow riêng</span>
                        <span v-if="hasCompanyAppliedBlueprint(co, applyBlueprintState.blueprint?.id_workflow)">• Đã áp mẫu này</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="wf-modal-footer">
            <button type="button" class="wf-btn wf-btn-slate" :disabled="saving" @click="showApplyBlueprintModal = false">
              Hủy
            </button>
            <button
              type="button"
              class="wf-btn wf-btn-primary"
              :disabled="saving || applyBlueprintState.selectedKeys.length === 0"
              @click="submitApplyBlueprintToCompanies"
            >
              <span v-if="saving" class="wf-spinner-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span class="wf-tabular">Áp Workflow Cho {{ applyBlueprintState.selectedKeys.length }} Công Ty</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         3-TIER BAOGIA DIALOG (PROMISE ALERT / CONFIRM)
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="dialogState.open"
        class="baogia-dialog-overlay wf-dialog-overlay"
        :class="{
          'theme-light-blue': effectiveTheme === 'light',
          'theme-custom-glass': effectiveTheme === 'custom'
        }"
        @click.self="closeDialog(false)"
      >
        <div class="wf-dialog-card" :class="'tone-' + dialogState.tone" role="dialog" aria-modal="true">
          <div class="wf-dialog-head">
            <div class="wf-dialog-ic" :class="'tone-' + dialogState.tone">
              <svg v-if="dialogState.tone === 'danger'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <svg v-else-if="dialogState.tone === 'success'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <h4 class="wf-dialog-title">{{ dialogState.title }}</h4>
          </div>

          <div v-if="dialogState.targetValue" class="wf-dialog-target-box">
            <span class="wf-dialog-target-tag">{{ dialogState.targetTag || 'ĐỐI TƯỢNG' }}</span>
            <span class="wf-dialog-target-val">{{ dialogState.targetValue }}</span>
          </div>

          <div class="wf-dialog-msg-box" :class="'tone-' + dialogState.tone">
            {{ dialogState.message }}
          </div>

          <div class="wf-dialog-actions">
            <button
              v-if="dialogState.mode === 'confirm'"
              type="button"
              class="wf-btn wf-btn-slate"
              @click="closeDialog(false)"
            >
              {{ dialogState.cancelText || 'Hủy' }}
            </button>
            <button
              type="button"
              class="wf-btn"
              :class="dialogState.tone === 'danger' ? 'wf-btn-danger' : 'wf-btn-primary'"
              @click="closeDialog(true)"
            >
              {{ dialogState.confirmText || 'Đồng ý' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- SMART TOAST (TOP-CENTER PC-A / MB-A) -->
    <Teleport to="body">
      <div
        class="smart-toast-wrap"
        :class="{ 'theme-light-blue': effectiveTheme === 'light' }"
      >
        <Transition name="wf-toast-fade">
          <div v-if="toast.show" class="wf-smart-toast" :class="'is-' + toast.type" role="status">
            <span class="wf-toast-ic">
              <svg v-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>{{ toast.message }}</span>
          </div>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import draggable from 'vuedraggable'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, update } from 'firebase/database'

const props = defineProps({
  uiTheme: {
    type: String,
    default: ''
  },
  customersExternal: {
    type: Array,
    default: () => []
  },
  pipelinesExternal: {
    type: Array,
    default: () => []
  },
  focusCustomerKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['updated', 'open-kanban-workflow'])

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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const database = getDatabase(app)

const effectiveTheme = computed(() => {
  if (props.uiTheme) return props.uiTheme
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sonai_report_fb_theme_v2')
    if (saved === 'light' || saved === 'dark' || saved === 'custom') return saved
  }
  return 'dark'
})

const STANDARD_FLOW_STEPS = [
  { status_name: 'TẠM', short_label: 'TẠM', '%status': '0%', status_color: '#3b82f6' },
  { status_name: 'Pipeline (khảo sát nhu cầu khách hàng)', short_label: 'Pipeline', '%status': '30%', status_color: '#ef4444' },
  { status_name: 'Forecast (đã lên báo giá gởi khách hàng)', short_label: 'Forecast', '%status': '50%', status_color: '#f97316' },
  { status_name: 'Commit (EU đồng ý giải pháp, chờ ngân sách đầu tư)', short_label: 'Commit', '%status': '70%', status_color: '#eab308' },
  { status_name: 'Closed Won (đã ký xác nhận đặt hàng)', short_label: 'Closed Won', '%status': '90%', status_color: '#22c55e' }
]

const QUICK_PERCENT_PRESETS = ['0%', '10%', '25%', '50%', '70%', '85%', '95%']

const PRESET_COLORS = [
  { name: 'Sky Blue', hex: '#0ea5e9' },
  { name: 'Royal Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Rose Red', hex: '#ef4444' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Slate', hex: '#64748b' },
  { name: 'Cool Gray', hex: '#94a3b8' }
]

const sanitizeFirebaseKey = (key) => String(key || '').replace(/[.#$/[\]]/g, '_')

const removeDiacritics = (str) => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

const cleanCode = (str) =>
  removeDiacritics(str)
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9_-]/g, '')

const genMaCT = (congTy) =>
  removeDiacritics(congTy).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')

const genMaKH = (tenKH, congTy) => {
  const tenClean = removeDiacritics(tenKH).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
  const maCT = genMaCT(congTy)
  if (!tenClean && !maCT) return ''
  return [tenClean, maCT].filter(Boolean).join('-')
}

const formatPercentStatus = (p) => {
  if (p === '' || p === null || p === undefined) return '0%'
  if (typeof p === 'number') {
    const val = p <= 1 && p > 0 ? Math.round(p * 100) : p
    return val + '%'
  }
  const s = String(p).trim()
  if (!s) return '0%'
  if (!isNaN(Number(s))) {
    const num = Number(s)
    const val = num <= 1 && num > 0 ? Math.round(num * 100) : num
    return val + '%'
  }
  return s.endsWith('%') ? s : s + '%'
}

const getInitials = (text) => {
  const s = String(text || '').trim()
  if (!s) return 'KH'
  const words = s.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// STATE
const subTab = ref('customer')
const items = ref([])
const internalCustomers = ref([])
const internalPipelines = ref([])
const loading = ref(false)
const saving = ref(false)
const isReordering = ref(false)
const isMobile = ref(false)
const swapSourceItem = ref(null)
const collapsedGroups = ref({})
const collapsedCompanies = ref({})
const highlightedCustomerKey = ref('')

const customerSearch = ref('')
const customerFilterMode = ref('all')
const customerVisibleLimit = ref(30)
const templateSearch = ref('')

const baselineBlueprint = {
  id_workflow: 'WF_DEFAULT',
  name_workflow: 'Workflow Chuẩn Hệ Thống (5 bước)',
  workflow_scope: 'template',
  statuses: STANDARD_FLOW_STEPS
}

let stepUidSeed = 1
const makeStepUid = () => `wfst_${Date.now()}_${stepUidSeed++}`

// UNIFIED WORKFLOW STUDIO MODAL STATE
const showStudioModal = ref(false)
const studioMode = ref('create') // 'create' | 'edit' | 'baseline'
const studioOriginalGroup = ref(null)
const studioNameInputRef = ref(null)
const focusedStepUid = ref('')
const openColorRowUid = ref('')
const openPctRowUid = ref('')
const stepInputRefs = new Map()

const setStepInputRef = (uid, el) => {
  if (el) {
    stepInputRefs.set(uid, el)
  } else {
    stepInputRefs.delete(uid)
  }
}

const focusStepInputByUid = (uid) => {
  nextTick(() => {
    const el = stepInputRefs.get(uid)
    if (el && typeof el.focus === 'function') {
      el.focus()
      focusedStepUid.value = uid
    }
  })
}

const studioForm = ref({
  id_workflow: '',
  mode: 'customer',
  name_workflow: '',
  customer: null,
  ma_khach_hang: '',
  ma_cong_ty: '',
  ten_khach_hang: '',
  ten_cong_ty: '',
  selectedPresetId: '',
  source_template_id: '',
  source_template_name: '',
  setAsDefault: true,
  steps: []
})

// STANDARDIZED CUSTOMER PICKER & QUICK ADD CUSTOMER STATE
const localAddedCustomers = ref([])
const showStudioCustomerPicker = ref(false)
const studioCustomerPickerFocus = ref('company') // 'company' | 'contact'
const studioCustomerPickerSearch = ref('')
const studioCustomerSearchInputRef = ref(null)

const showStudioAddCustomerModal = ref(false)
const isSavingNewCustomer = ref(false)
const newStudioCustomerForm = ref({
  ten_cong_ty: '',
  ten_khach_hang: ''
})

const showApplyBlueprintModal = ref(false)
const applyBlueprintState = ref({
  blueprint: null,
  flowSuffix: '',
  setAsDefault: false,
  search: '',
  selectedKeys: []
})

// SMART TOAST
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null
const showToast = (message, type = 'success', duration = 2600) => {
  toast.value = { show: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, duration)
}

// 3-TIER PROMISE DIALOG (WITH LAYERED ESCAPE & CTRL+S STUDIO SHORTCUT)
const dialogState = ref({
  open: false,
  mode: 'confirm',
  tone: 'info',
  title: '',
  message: '',
  targetTag: '',
  targetValue: '',
  confirmText: 'Đồng ý',
  cancelText: 'Hủy'
})
let dialogResolver = null

const askConfirm = ({ title, message, targetTag = '', targetValue = '', tone = 'info', confirmText = 'Đồng ý', cancelText = 'Hủy' }) => {
  return new Promise((resolve) => {
    dialogResolver = resolve
    dialogState.value = {
      open: true,
      mode: 'confirm',
      tone,
      title,
      message,
      targetTag,
      targetValue,
      confirmText,
      cancelText
    }
  })
}

const closeDialog = (result) => {
  dialogState.value.open = false
  if (dialogResolver) {
    const fn = dialogResolver
    dialogResolver = null
    fn(Boolean(result))
  }
}

const closeInlineStepPopovers = () => {
  openColorRowUid.value = ''
  openPctRowUid.value = ''
}

const closeStudioModal = () => {
  closeInlineStepPopovers()
  showStudioModal.value = false
}

const normalizeWorkflowRecord = (raw, fallbackKey = '') => {
  if (!raw) return null
  if (Array.isArray(raw)) {
    const idSt = String(raw[1] ?? fallbackKey ?? '')
    if (!idSt) return null
    const idWf = String(raw[0] ?? '')
    return {
      id_workflow: idWf,
      id_status_workflow: idSt,
      name_workflow: String(raw[2] ?? ''),
      '%status': formatPercentStatus(raw[3]),
      status_name: String(raw[4] ?? ''),
      status_index: parseInt(raw[5] ?? 0, 10) || 0,
      status_color: String(raw[6] || '#3b82f6'),
      workflow_scope: idWf.startsWith('WF_CUS_') ? 'customer' : 'template',
      ma_khach_hang: '',
      ma_cong_ty: '',
      ten_khach_hang: '',
      ten_cong_ty: '',
      is_company_default: false,
      source_template_id: '',
      source_template_name: ''
    }
  }
  if (typeof raw === 'object') {
    const idSt = String(raw.id_status_workflow ?? fallbackKey ?? '')
    if (!idSt) return null
    const idWf = String(raw.id_workflow ?? '')
    const scope =
      raw.workflow_scope ||
      (idWf.startsWith('WF_CUS_') || raw.ma_khach_hang || raw.ma_cong_ty || raw.ten_cong_ty ? 'customer' : 'template')
    return {
      id_workflow: idWf,
      id_status_workflow: idSt,
      name_workflow: String(raw.name_workflow ?? ''),
      '%status': formatPercentStatus(raw['%status'] ?? raw.percent_status ?? ''),
      status_name: String(raw.status_name ?? ''),
      status_index: parseInt(raw.status_index ?? 0, 10) || 0,
      status_color: String(raw.status_color || '#3b82f6'),
      workflow_scope: scope,
      ma_khach_hang: scope === 'customer' ? String(raw.ma_khach_hang ?? '') : '',
      ma_cong_ty: scope === 'customer' ? String(raw.ma_cong_ty ?? '') : '',
      ten_khach_hang: scope === 'customer' ? String(raw.ten_khach_hang ?? '') : '',
      ten_cong_ty: scope === 'customer' ? String(raw.ten_cong_ty ?? '') : '',
      is_company_default: scope === 'customer' ? Boolean(raw.is_company_default) : false,
      source_template_id: String(raw.source_template_id ?? ''),
      source_template_name: String(raw.source_template_name ?? '')
    }
  }
  return null
}

const toCleanWorkflowRecord = (item) => {
  const scope =
    item.workflow_scope ||
    (String(item.id_workflow || '').startsWith('WF_CUS_') || item.ma_cong_ty || item.ten_cong_ty || item.ma_khach_hang
      ? 'customer'
      : 'template')
  const isCus = scope === 'customer'
  return {
    id_workflow: String(item.id_workflow ?? ''),
    id_status_workflow: String(item.id_status_workflow ?? ''),
    name_workflow: String(item.name_workflow ?? ''),
    '%status': formatPercentStatus(item['%status']),
    status_name: String(item.status_name ?? ''),
    status_index: parseInt(item.status_index ?? 0, 10) || 0,
    status_color: String(item.status_color || '#3b82f6'),
    workflow_scope: scope,
    ma_khach_hang: isCus ? String(item.ma_khach_hang ?? '') : '',
    ma_cong_ty: isCus ? String(item.ma_cong_ty ?? '') : '',
    ten_khach_hang: isCus ? String(item.ten_khach_hang ?? '') : '',
    ten_cong_ty: isCus ? String(item.ten_cong_ty ?? '') : '',
    is_company_default: isCus ? Boolean(item.is_company_default) : false,
    source_template_id: isCus ? String(item.source_template_id ?? '') : '',
    source_template_name: isCus ? String(item.source_template_name ?? '') : ''
  }
}

// GROUP ALL WORKFLOWS
const allWorkflowGroups = computed(() => {
  const groupsMap = new Map()
  items.value.forEach((item) => {
    const wfId = item.id_workflow || 'UNKNOWN'
    if (!groupsMap.has(wfId)) {
      groupsMap.set(wfId, {
        id_workflow: wfId,
        name_workflow: item.name_workflow || 'Quy trình chưa đặt tên',
        workflow_scope: item.workflow_scope || (wfId.startsWith('WF_CUS_') ? 'customer' : 'template'),
        ma_khach_hang: item.ma_khach_hang || '',
        ma_cong_ty: item.ma_cong_ty || '',
        ten_khach_hang: item.ten_khach_hang || '',
        ten_cong_ty: item.ten_cong_ty || '',
        is_company_default: Boolean(item.is_company_default),
        source_template_id: item.source_template_id || '',
        source_template_name: item.source_template_name || '',
        statuses: []
      })
    }
    const g = groupsMap.get(wfId)
    if (!g.ma_khach_hang && item.ma_khach_hang) g.ma_khach_hang = item.ma_khach_hang
    if (!g.ma_cong_ty && item.ma_cong_ty) g.ma_cong_ty = item.ma_cong_ty
    if (!g.ten_khach_hang && item.ten_khach_hang) g.ten_khach_hang = item.ten_khach_hang
    if (!g.ten_cong_ty && item.ten_cong_ty) g.ten_cong_ty = item.ten_cong_ty
    if (item.is_company_default) g.is_company_default = true
    if (!g.source_template_id && item.source_template_id) g.source_template_id = item.source_template_id
    if (!g.source_template_name && item.source_template_name) g.source_template_name = item.source_template_name
    g.statuses.push(item)
  })

  const result = Array.from(groupsMap.values())
  result.forEach((g) => {
    g.statuses.sort((a, b) => (parseInt(a.status_index, 10) || 0) - (parseInt(b.status_index, 10) || 0))
  })
  return result
})

const customerWorkflowGroups = computed(() =>
  allWorkflowGroups.value.filter((g) => g.workflow_scope === 'customer')
)

const templateWorkflowGroups = computed(() =>
  allWorkflowGroups.value.filter((g) => g.workflow_scope !== 'customer')
)

const filteredTemplateGroups = computed(() => {
  const kw = templateSearch.value.trim().toLowerCase()
  if (!kw) return templateWorkflowGroups.value
  return templateWorkflowGroups.value.filter(
    (g) =>
      (g.name_workflow && g.name_workflow.toLowerCase().includes(kw)) ||
      g.statuses.some((s) => s.status_name && s.status_name.toLowerCase().includes(kw))
  )
})

const effectiveCustomersSource = computed(() => {
  const base =
    props.customersExternal && props.customersExternal.length > 0
      ? props.customersExternal
      : internalCustomers.value
  return localAddedCustomers.value.length > 0 ? [...localAddedCustomers.value, ...base] : base
})

const effectivePipelinesSource = computed(() =>
  props.pipelinesExternal && props.pipelinesExternal.length > 0
    ? props.pipelinesExternal
    : internalPipelines.value
)

// MERGED COMPANY DIRECTORY + 1-COMPANY-TO-MANY-WORKFLOWS RESOLUTION
const customerRows = computed(() => {
  const map = new Map()

  const buildCompanyRowKey = (maKH, maCT, tenCT, tenKH) => {
    const compKey = cleanCode(tenCT || maCT)
    if (compKey) return 'CT_' + compKey
    const khKey = cleanCode(maKH || tenKH)
    if (khKey) return 'KH_' + khKey
    return ''
  }

  const upsertCompanyEntry = ({ ma_khach_hang, ten_khach_hang, ma_cong_ty, ten_cong_ty, addDeal = 0 }) => {
    const rowKey = buildCompanyRowKey(ma_khach_hang, ma_cong_ty, ten_cong_ty, ten_khach_hang)
    if (!rowKey) return null
    if (!map.has(rowKey)) {
      map.set(rowKey, {
        rowKey,
        ma_khach_hang: ma_khach_hang || '',
        ten_khach_hang: ten_khach_hang || '',
        ma_cong_ty: ma_cong_ty || '',
        ten_cong_ty: ten_cong_ty || '',
        contactsList: [],
        customerCodesSet: new Set(),
        companyCodesSet: new Set(),
        dealCount: 0,
        customGroups: []
      })
    }
    const row = map.get(rowKey)
    if (!row.ten_cong_ty && ten_cong_ty) row.ten_cong_ty = ten_cong_ty
    if (!row.ma_cong_ty && ma_cong_ty) row.ma_cong_ty = ma_cong_ty
    if (!row.ma_khach_hang && ma_khach_hang) row.ma_khach_hang = ma_khach_hang
    if (!row.ten_khach_hang && ten_khach_hang) row.ten_khach_hang = ten_khach_hang

    if (ten_khach_hang && !row.contactsList.some((n) => cleanCode(n) === cleanCode(ten_khach_hang))) {
      row.contactsList.push(ten_khach_hang)
    }
    if (ma_khach_hang) row.customerCodesSet.add(cleanCode(ma_khach_hang))
    if (ma_cong_ty) row.companyCodesSet.add(cleanCode(ma_cong_ty))
    if (ten_cong_ty) row.companyCodesSet.add(cleanCode(ten_cong_ty))
    if (addDeal) row.dealCount += addDeal
    return row
  }

  effectiveCustomersSource.value.forEach((c) => {
    upsertCompanyEntry({
      ma_khach_hang: String(c.Ma_khach_hang ?? c.ma_khach_hang ?? '').trim(),
      ten_khach_hang: String(c.Ten_khach_hang ?? c.ten_khach_hang ?? '').trim(),
      ma_cong_ty: String(c.Ma_cong_ty ?? c.ma_cong_ty ?? '').trim(),
      ten_cong_ty: String(c.Ten_cong_ty ?? c.ten_cong_ty ?? '').trim(),
      addDeal: 0
    })
  })

  effectivePipelinesSource.value.forEach((p) => {
    const ma_khach_hang = String(p.ma_khach_hang ?? '').trim()
    const ten_khach_hang = String(p.ten_khach_hang ?? '').trim()
    const ma_cong_ty = String(p.ma_cong_ty ?? '').trim()
    const ten_cong_ty = String(p.ten_cong_ty ?? '').trim()
    if (!ma_khach_hang && !ten_cong_ty && !ten_khach_hang) return
    upsertCompanyEntry({
      ma_khach_hang,
      ten_khach_hang,
      ma_cong_ty,
      ten_cong_ty,
      addDeal: 1
    })
  })

  customerWorkflowGroups.value.forEach((cg) => {
    let matched = null
    const cgCompCode = cleanCode(cg.ten_cong_ty || cg.ma_cong_ty)
    const cgKhCode = cleanCode(cg.ma_khach_hang)

    if (cgCompCode && map.has('CT_' + cgCompCode)) {
      matched = map.get('CT_' + cgCompCode)
    }
    if (!matched && cgKhCode && map.has('KH_' + cgKhCode)) {
      matched = map.get('KH_' + cgKhCode)
    }
    if (!matched) {
      for (const row of map.values()) {
        if (
          (cgCompCode && row.companyCodesSet.has(cgCompCode)) ||
          (cg.ma_cong_ty && row.companyCodesSet.has(cleanCode(cg.ma_cong_ty))) ||
          (cgKhCode && row.customerCodesSet.has(cgKhCode))
        ) {
          matched = row
          break
        }
      }
    }

    if (matched) {
      matched.customGroups.push(cg)
    } else {
      const fallbackComp = cg.ten_cong_ty || cg.name_workflow.replace(/^Flow KH:\s*/i, '').split('—')[0].trim()
      const created = upsertCompanyEntry({
        ma_khach_hang: cg.ma_khach_hang || '',
        ten_khach_hang: cg.ten_khach_hang || '',
        ma_cong_ty: cg.ma_cong_ty || '',
        ten_cong_ty: fallbackComp,
        addDeal: 0
      })
      if (created) {
        created.customGroups.push(cg)
      }
    }
  })

  const finalized = Array.from(map.values()).map((row) => {
    row.customGroups.sort((a, b) => {
      if (Boolean(a.is_company_default) !== Boolean(b.is_company_default)) {
        return a.is_company_default ? -1 : 1
      }
      return (a.name_workflow || '').localeCompare(b.name_workflow || '', 'vi')
    })

    let contactsLabel = ''
    if (row.contactsList.length === 1) {
      contactsLabel = row.contactsList[0]
    } else if (row.contactsList.length === 2) {
      contactsLabel = `${row.contactsList[0]}, ${row.contactsList[1]}`
    } else if (row.contactsList.length > 2) {
      contactsLabel = `${row.contactsList[0]}, ${row.contactsList[1]} (+${row.contactsList.length - 2} liên hệ)`
    }

    return {
      ...row,
      contactsLabel
    }
  })

  return finalized.sort((a, b) => {
    const aHas = a.customGroups.length > 0
    const bHas = b.customGroups.length > 0
    if (aHas !== bHas) return aHas ? -1 : 1
    if (b.customGroups.length !== a.customGroups.length) {
      return b.customGroups.length - a.customGroups.length
    }
    if (b.dealCount !== a.dealCount) {
      return b.dealCount - a.dealCount
    }
    const labelA = a.ten_cong_ty || a.ten_khach_hang || ''
    const labelB = b.ten_cong_ty || b.ten_khach_hang || ''
    return labelA.localeCompare(labelB, 'vi')
  })
})

const customFlowCustomerCount = computed(() =>
  customerRows.value.filter((r) => r.customGroups.length > 0).length
)

const filteredCustomerRows = computed(() => {
  let list = customerRows.value
  if (customerFilterMode.value === 'custom') {
    list = list.filter((r) => r.customGroups.length > 0)
  } else if (customerFilterMode.value === 'standard') {
    list = list.filter((r) => r.customGroups.length === 0)
  }

  const kw = customerSearch.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (r) =>
        (r.ten_cong_ty && r.ten_cong_ty.toLowerCase().includes(kw)) ||
        (r.ten_khach_hang && r.ten_khach_hang.toLowerCase().includes(kw)) ||
        (r.contactsLabel && r.contactsLabel.toLowerCase().includes(kw)) ||
        (r.ma_khach_hang && r.ma_khach_hang.toLowerCase().includes(kw)) ||
        (r.ma_cong_ty && r.ma_cong_ty.toLowerCase().includes(kw)) ||
        r.customGroups.some((cg) => cg.name_workflow && cg.name_workflow.toLowerCase().includes(kw))
    )
  }
  return list
})

const paginatedCustomerRows = computed(() =>
  filteredCustomerRows.value.slice(0, customerVisibleLimit.value)
)

const resolveDistinctFlowParty = (rawEntity = {}) => {
  let tenCT = String(rawEntity.ten_cong_ty || '').trim()
  let tenKH = String(rawEntity.ten_khach_hang || '').trim()
  const maKH = cleanCode(rawEntity.ma_khach_hang || '')
  const maCT = cleanCode(rawEntity.ma_cong_ty || '')
  const codeCT = cleanCode(tenCT)
  const codeKH = cleanCode(tenKH)

  if ((!tenCT || !tenKH) && effectiveCustomersSource.value.length > 0) {
    const matched = effectiveCustomersSource.value.find((c) => {
      if (!c) return false
      const cMaKH = cleanCode(c.Ma_khach_hang ?? c.ma_khach_hang ?? '')
      const cMaCT = cleanCode(c.Ma_cong_ty ?? c.ma_cong_ty ?? '')
      const cTenCT = cleanCode(c.Ten_cong_ty ?? c.ten_cong_ty ?? '')
      const cTenKH = cleanCode(c.Ten_khach_hang ?? c.ten_khach_hang ?? '')
      if (maKH && cMaKH && maKH === cMaKH) return true
      if (maCT && cMaCT && maCT === cMaCT) return true
      if (codeCT && cTenCT && codeCT === cTenCT) return true
      if (codeKH && cTenKH && codeKH === cTenKH) return true
      return false
    })
    if (matched) {
      if (!tenCT) tenCT = String(matched.Ten_cong_ty ?? matched.ten_cong_ty ?? '').trim()
      if (!tenKH) tenKH = String(matched.Ten_khach_hang ?? matched.ten_khach_hang ?? '').trim()
    }
  }

  const sameLabel = Boolean(tenCT && tenKH && cleanCode(tenCT) === cleanCode(tenKH))
  return {
    displayCompanyName: tenCT,
    displayCustomerName: sameLabel ? '' : tenKH
  }
}

const flatCustomerFlows = computed(() => {
  const rowByWfId = new Map()
  customerRows.value.forEach((r) => {
    r.customGroups.forEach((cg) => {
      rowByWfId.set(cg.id_workflow, r)
    })
  })

  return customerWorkflowGroups.value
    .map((cg) => {
      const matchedRow = rowByWfId.get(cg.id_workflow) || null
      const party = resolveDistinctFlowParty({
        ma_khach_hang: cg.ma_khach_hang || matchedRow?.ma_khach_hang || '',
        ma_cong_ty: cg.ma_cong_ty || matchedRow?.ma_cong_ty || '',
        ten_cong_ty: cg.ten_cong_ty || matchedRow?.ten_cong_ty || '',
        ten_khach_hang: cg.ten_khach_hang || matchedRow?.ten_khach_hang || ''
      })
      return {
        ...cg,
        statuses: cg.statuses,
        customerRow: matchedRow,
        customerRowKey: matchedRow?.rowKey || '',
        displayCompanyName: party.displayCompanyName,
        displayCustomerName: party.displayCustomerName
      }
    })
    .sort((a, b) => {
      const partyA = a.displayCompanyName || a.displayCustomerName || a.name_workflow || ''
      const partyB = b.displayCompanyName || b.displayCustomerName || b.name_workflow || ''
      const cmpParty = partyA.localeCompare(partyB, 'vi')
      if (cmpParty !== 0) return cmpParty
      if (Boolean(a.is_company_default) !== Boolean(b.is_company_default)) {
        return a.is_company_default ? -1 : 1
      }
      return (a.name_workflow || '').localeCompare(b.name_workflow || '', 'vi')
    })
})

const filteredFlatCustomerFlows = computed(() => {
  const kw = customerSearch.value.trim().toLowerCase()
  if (!kw) return flatCustomerFlows.value
  return flatCustomerFlows.value.filter(
    (f) =>
      (f.name_workflow && f.name_workflow.toLowerCase().includes(kw)) ||
      (f.displayCompanyName && f.displayCompanyName.toLowerCase().includes(kw)) ||
      (f.displayCustomerName && f.displayCustomerName.toLowerCase().includes(kw)) ||
      (f.ten_cong_ty && f.ten_cong_ty.toLowerCase().includes(kw)) ||
      (f.ten_khach_hang && f.ten_khach_hang.toLowerCase().includes(kw)) ||
      (f.ma_cong_ty && f.ma_cong_ty.toLowerCase().includes(kw)) ||
      (f.ma_khach_hang && f.ma_khach_hang.toLowerCase().includes(kw)) ||
      f.statuses.some((s) => s.status_name && s.status_name.toLowerCase().includes(kw))
  )
})

const showBaselineInTemplates = computed(() => {
  const kw = templateSearch.value.trim().toLowerCase()
  if (!kw) return true
  return (
    'khung chuẩn hệ thống mặc định'.includes(kw) ||
    STANDARD_FLOW_STEPS.some((s) => s.status_name && s.status_name.toLowerCase().includes(kw))
  )
})

const libraryWorkflowGroups = computed(() => {
  return templateWorkflowGroups.value.map((g) => ({
    ...g,
    statuses: g.statuses,
    ma_khach_hang: '',
    ma_cong_ty: '',
    ten_khach_hang: '',
    ten_cong_ty: '',
    displayCompanyName: '',
    displayCustomerName: ''
  }))
})

const filteredLibraryGroups = computed(() => {
  const kw = templateSearch.value.trim().toLowerCase()
  if (!kw) return libraryWorkflowGroups.value
  return libraryWorkflowGroups.value.filter(
    (g) =>
      (g.name_workflow && g.name_workflow.toLowerCase().includes(kw)) ||
      g.statuses.some((s) => s.status_name && s.status_name.toLowerCase().includes(kw))
  )
})

const focusedCustomerRow = computed(() => {
  const kw = customerSearch.value.trim()
  if (!kw) return null
  const cKw = cleanCode(kw)
  if (!cKw) return null
  return (
    customerRows.value.find(
      (r) =>
        cleanCode(r.ten_cong_ty) === cKw ||
        cleanCode(r.ten_khach_hang) === cKw ||
        cleanCode(r.ma_cong_ty) === cKw ||
        cleanCode(r.ma_khach_hang) === cKw
    ) || null
  )
})

const studioCustomerDirectory = computed(() => {
  const seen = new Set()
  const list = []
  const flowCountByComp = new Map()
  customerRows.value.forEach((r) => {
    const cKey = cleanCode(r.ten_cong_ty || r.ma_cong_ty || r.ten_khach_hang || r.ma_khach_hang)
    if (cKey) flowCountByComp.set(cKey, r.customGroups.length)
  })

  effectiveCustomersSource.value.forEach((c, idx) => {
    if (!c) return
    const maKH = String(c.Ma_khach_hang ?? c.ma_khach_hang ?? '').trim()
    const tenKH = String(c.Ten_khach_hang ?? c.ten_khach_hang ?? '').trim()
    const maCT = String(c.Ma_cong_ty ?? c.ma_cong_ty ?? '').trim()
    const tenCT = String(c.Ten_cong_ty ?? c.ten_cong_ty ?? '').trim()
    if (!tenCT && !tenKH) return
    const dedupKey = `${cleanCode(tenCT || maCT)}__${cleanCode(tenKH || maKH)}`
    if (seen.has(dedupKey)) return
    seen.add(dedupKey)
    const cKey = cleanCode(tenCT || maCT || tenKH || maKH)
    list.push({
      pickKey: 'khsrc_' + idx + '_' + dedupKey,
      ma_khach_hang: maKH,
      ten_khach_hang: tenKH,
      ma_cong_ty: maCT,
      ten_cong_ty: tenCT,
      existingFlowCount: flowCountByComp.get(cKey) || 0
    })
  })

  customerRows.value.forEach((r) => {
    const tenCT = String(r.ten_cong_ty || '').trim()
    const tenKH = String(r.ten_khach_hang || '').trim()
    if (!tenCT && !tenKH) return
    const dedupKey = `${cleanCode(tenCT || r.ma_cong_ty)}__${cleanCode(tenKH || r.ma_khach_hang)}`
    if (seen.has(dedupKey)) return
    seen.add(dedupKey)
    list.push({
      pickKey: 'crow_' + r.rowKey,
      ma_khach_hang: r.ma_khach_hang || '',
      ten_khach_hang: tenKH,
      ma_cong_ty: r.ma_cong_ty || '',
      ten_cong_ty: tenCT,
      existingFlowCount: r.customGroups.length
    })
  })

  return list
})

const filteredStudioCustomers = computed(() => {
  const kw = String(studioCustomerPickerSearch.value || '').trim().toLowerCase()
  const activeCompCode = cleanCode(studioForm.value.ten_cong_ty)
  const isContactFocus = studioCustomerPickerFocus.value === 'contact'

  let list = studioCustomerDirectory.value.map((c) => ({
    ...c,
    _isSameCompany: Boolean(isContactFocus && activeCompCode && cleanCode(c.ten_cong_ty) === activeCompCode)
  }))

  if (kw) {
    list = list.filter(
      (o) =>
        (o.ten_cong_ty && o.ten_cong_ty.toLowerCase().includes(kw)) ||
        (o.ten_khach_hang && o.ten_khach_hang.toLowerCase().includes(kw)) ||
        (o.ma_cong_ty && o.ma_cong_ty.toLowerCase().includes(kw)) ||
        (o.ma_khach_hang && o.ma_khach_hang.toLowerCase().includes(kw))
    )
  }

  return list
    .sort((a, b) => {
      if (a._isSameCompany !== b._isSameCompany) return a._isSameCompany ? -1 : 1
      const lblA = isContactFocus ? a.ten_khach_hang || a.ten_cong_ty || '' : a.ten_cong_ty || a.ten_khach_hang || ''
      const lblB = isContactFocus ? b.ten_khach_hang || b.ten_cong_ty || '' : b.ten_cong_ty || b.ten_khach_hang || ''
      return lblA.localeCompare(lblB, 'vi')
    })
    .slice(0, 80)
})

const filteredApplyCompanyRows = computed(() => {
  const kw = String(applyBlueprintState.value.search || '').trim().toLowerCase()
  if (!kw) return customerRows.value
  return customerRows.value.filter(
    (r) =>
      (r.ten_cong_ty && r.ten_cong_ty.toLowerCase().includes(kw)) ||
      (r.ten_khach_hang && r.ten_khach_hang.toLowerCase().includes(kw)) ||
      (r.contactsLabel && r.contactsLabel.toLowerCase().includes(kw)) ||
      (r.ma_cong_ty && r.ma_cong_ty.toLowerCase().includes(kw)) ||
      (r.ma_khach_hang && r.ma_khach_hang.toLowerCase().includes(kw))
  )
})

watch([customerSearch, customerFilterMode], () => {
  customerVisibleLimit.value = 30
})

watch(
  () => props.focusCustomerKey,
  (val) => {
    if (!val) return
    subTab.value = 'customer'
    customerFilterMode.value = 'all'
    customerSearch.value = val
    const foundRow = customerRows.value.find(
      (r) =>
        cleanCode(r.ten_cong_ty) === cleanCode(val) ||
        cleanCode(r.ten_khach_hang) === cleanCode(val) ||
        cleanCode(r.ma_cong_ty) === cleanCode(val)
    )
    highlightedCustomerKey.value = foundRow ? foundRow.rowKey : val
    setTimeout(() => {
      highlightedCustomerKey.value = ''
    }, 2400)
  },
  { immediate: true }
)

// DATA FETCHING
const fetchWorkflows = async () => {
  loading.value = true
  try {
    const snap = await get(dbRef(database, 'pipeline_workflow'))
    if (snap.exists()) {
      const raw = snap.val()
      const entries = Array.isArray(raw)
        ? raw.map((val, idx) => [String(idx), val])
        : Object.entries(raw || {})
      items.value = entries
        .map(([key, val]) => normalizeWorkflowRecord(val, key))
        .filter(Boolean)
    } else {
      items.value = []
    }
  } catch (err) {
    console.error('Firebase error fetching workflows:', err)
    showToast('Không thể tải cấu hình Workflow', 'error')
  } finally {
    loading.value = false
  }
}

const fetchFallbackDirectoryIfNeeded = async () => {
  if (!props.customersExternal || props.customersExternal.length === 0) {
    try {
      const snap = await get(dbRef(database, 'khach_hang'))
      if (snap.exists()) {
        const raw = snap.val()
        const entries = Array.isArray(raw)
          ? raw.map((v, i) => [String(i), v])
          : Object.entries(raw || {})
        internalCustomers.value = entries
          .map(([k, r]) => {
            if (!r) return null
            if (Array.isArray(r)) {
              return {
                Ma_khach_hang: String(r[0] ?? ''),
                Ten_khach_hang: String(r[1] ?? ''),
                Ma_cong_ty: String(r[4] ?? ''),
                Ten_cong_ty: String(r[5] ?? '')
              }
            }
            return {
              Ma_khach_hang: String(r.ma_khach_hang ?? r.Ma_khach_hang ?? k ?? ''),
              Ten_khach_hang: String(r.ten_khach_hang ?? r.Ten_khach_hang ?? ''),
              Ma_cong_ty: String(r.ma_cong_ty ?? r.Ma_cong_ty ?? ''),
              Ten_cong_ty: String(r.ten_cong_ty ?? r.Ten_cong_ty ?? '')
            }
          })
          .filter(Boolean)
      }
    } catch (e) {
      console.error('Error loading khach_hang in Workflow designer:', e)
    }
  }

  if (!props.pipelinesExternal || props.pipelinesExternal.length === 0) {
    try {
      const snapP = await get(dbRef(database, 'pipeline'))
      if (snapP.exists()) {
        const raw = snapP.val()
        const entries = Array.isArray(raw) ? raw : Object.values(raw || {})
        internalPipelines.value = entries.filter(Boolean)
      }
    } catch (e) {
      console.error('Error loading pipeline in Workflow designer:', e)
    }
  }
}

const refreshAllData = async () => {
  await Promise.all([fetchWorkflows(), fetchFallbackDirectoryIfNeeded()])
}

const toggleGroup = (wfId) => {
  collapsedGroups.value[wfId] = !collapsedGroups.value[wfId]
}

const toggleCompanyCollapse = (rowKey) => {
  collapsedCompanies.value[rowKey] = !collapsedCompanies.value[rowKey]
}

const isGroupDefaultForCompany = (cus, cg, cgIdx) => {
  if (!cus || !Array.isArray(cus.customGroups) || cus.customGroups.length === 0) return false
  const hasExplicitDefault = cus.customGroups.some((g) => Boolean(g.is_company_default))
  if (hasExplicitDefault) return Boolean(cg.is_company_default)
  return cgIdx === 0
}

const getCompanyPrimaryWfId = (cus) => {
  if (!cus || !Array.isArray(cus.customGroups) || cus.customGroups.length === 0) return 'WF_DEFAULT'
  const def = cus.customGroups.find((g) => Boolean(g.is_company_default)) || cus.customGroups[0]
  return def ? def.id_workflow : 'WF_DEFAULT'
}

const getDealCountForWorkflow = (wfId, cus = null) => {
  const normTarget = wfId || 'WF_DEFAULT'
  return effectivePipelinesSource.value.filter((p) => {
    if (!p) return false
    const pWf = p.id_workflow || 'WF_DEFAULT'
    if (pWf !== normTarget) return false
    if (!cus) return true
    if (cus.ten_cong_ty && p.ten_cong_ty) {
      return cleanCode(cus.ten_cong_ty) === cleanCode(p.ten_cong_ty)
    }
    if (cus.ma_khach_hang && p.ma_khach_hang) {
      return cleanCode(cus.ma_khach_hang) === cleanCode(p.ma_khach_hang)
    }
    return true
  }).length
}

const getAppliedCompanyCount = (tplId) => {
  if (!tplId) return 0
  return customerRows.value.filter((co) =>
    co.customGroups.some((cg) => cg.source_template_id === tplId)
  ).length
}

const hasCompanyAppliedBlueprint = (co, tplId) => {
  if (!co || !tplId) return false
  return co.customGroups.some((cg) => cg.source_template_id === tplId)
}

const emitOpenKanban = (wfId, cus) => {
  emit('open-kanban-workflow', {
    id_workflow: wfId || 'WF_DEFAULT',
    customer: cus
      ? {
          ma_khach_hang: cus.ma_khach_hang || '',
          ten_khach_hang: cus.ten_khach_hang || '',
          ma_cong_ty: cus.ma_cong_ty || '',
          ten_cong_ty: cus.ten_cong_ty || ''
        }
      : null
  })
}

// CREATE / CLONE / DELETE FLAT CUSTOMER FLOWS & BLUEPRINTS
const findMatchingCustomerRow = ({ ma_khach_hang = '', ma_cong_ty = '', ten_cong_ty = '', ten_khach_hang = '' }) => {
  const cCT = cleanCode(ten_cong_ty || ma_cong_ty)
  const cKH = cleanCode(ma_khach_hang || ten_khach_hang)
  if (!cCT && !cKH) return null
  return (
    customerRows.value.find(
      (r) =>
        (cCT && (cleanCode(r.ten_cong_ty) === cCT || cleanCode(r.ma_cong_ty) === cCT || r.companyCodesSet.has(cCT))) ||
        (cKH && (cleanCode(r.ma_khach_hang) === cKH || cleanCode(r.ten_khach_hang) === cKH || r.customerCodesSet.has(cKH)))
    ) || null
  )
}

// =========================================================
// UNIFIED 2-COLUMN WORKFLOW STUDIO MODAL LOGIC
// =========================================================
const extractCleanFlowSuffix = (rawName = '') => {
  const s = String(rawName || '').replace(/^Flow KH:\s*/i, '').trim()
  if (!s) return 'Quy trình riêng'
  if (s.includes('—')) {
    const afterDash = s.split('—').slice(1).join('—').trim()
    if (afterDash) return afterDash
  }
  return s
}

const mapRawStepsToStudioRows = (rawSteps = [], preserveId = false) => {
  const source = Array.isArray(rawSteps) && rawSteps.length > 0 ? rawSteps : STANDARD_FLOW_STEPS
  return source.map((s) => ({
    _uid: makeStepUid(),
    id_status_workflow: preserveId ? String(s.id_status_workflow || '') : '',
    _origStatusName: preserveId ? String(s.status_name || '') : '',
    status_name: String(s.status_name || ''),
    '%status': formatPercentStatus(s['%status']),
    status_color: String(s.status_color || '#3b82f6')
  }))
}

const studioActiveDealCount = computed(() => {
  if (studioMode.value === 'baseline') {
    return getDealCountForWorkflow('WF_DEFAULT')
  }
  if (studioMode.value === 'edit' && studioForm.value.id_workflow) {
    return getDealCountForWorkflow(studioForm.value.id_workflow)
  }
  return 0
})

const getStepDealCount = (st) => {
  if (studioMode.value !== 'edit' || !studioForm.value.id_workflow || !st || !st.id_status_workflow) return 0
  const wfId = studioForm.value.id_workflow
  return effectivePipelinesSource.value.filter((p) => {
    if (!p || (p.id_workflow || 'WF_DEFAULT') !== wfId) return false
    if (p.status_name === 'THÀNH CÔNG' || p.status_name === 'THẤT BẠI') return false
    if (p.id_status_workflow === st.id_status_workflow) return true
    if (!p.id_status_workflow && st._origStatusName && p.status_name === st._origStatusName) return true
    return false
  }).length
}

const openWorkflowStudioBaseline = () => {
  closeInlineStepPopovers()
  studioMode.value = 'baseline'
  studioOriginalGroup.value = baselineBlueprint
  focusedStepUid.value = ''
  studioForm.value = {
    id_workflow: 'WF_DEFAULT',
    mode: 'template',
    name_workflow: 'Workflow Chuẩn Hệ Thống',
    customer: null,
    ma_khach_hang: '',
    ma_cong_ty: '',
    ten_cong_ty: '',
    ten_khach_hang: '',
    selectedPresetId: '',
    source_template_id: 'WF_DEFAULT',
    source_template_name: 'Workflow Chuẩn Hệ Thống',
    setAsDefault: false,
    steps: mapRawStepsToStudioRows(STANDARD_FLOW_STEPS, false)
  }
  showStudioModal.value = true
}

const openWorkflowStudioCreate = (mode = 'customer', seedCustomer = null, seedSteps = null, suggestedName = '') => {
  closeInlineStepPopovers()
  studioMode.value = 'create'
  studioOriginalGroup.value = null
  focusedStepUid.value = ''

  const isCus = mode === 'customer'
  const matchedRow =
    isCus && seedCustomer
      ? seedCustomer.rowKey
        ? seedCustomer
        : findMatchingCustomerRow(seedCustomer)
      : null

  const party =
    isCus && seedCustomer
      ? resolveDistinctFlowParty({
          ma_khach_hang: seedCustomer.ma_khach_hang || matchedRow?.ma_khach_hang || '',
          ma_cong_ty: seedCustomer.ma_cong_ty || matchedRow?.ma_cong_ty || '',
          ten_cong_ty: seedCustomer.ten_cong_ty || matchedRow?.ten_cong_ty || '',
          ten_khach_hang: seedCustomer.ten_khach_hang || matchedRow?.ten_khach_hang || ''
        })
      : { displayCompanyName: '', displayCustomerName: '' }

  const compLabel = party.displayCompanyName || party.displayCustomerName || ''
  const existingCount = matchedRow && Array.isArray(matchedRow.customGroups) ? matchedRow.customGroups.length : 0
  const autoName = suggestedName
    ? suggestedName
    : isCus && compLabel
      ? existingCount === 0
        ? `${compLabel} — Quy trình riêng`
        : `${compLabel} — Quy trình #${existingCount + 1}`
      : ''

  studioForm.value = {
    id_workflow: '',
    mode: isCus ? 'customer' : 'template',
    name_workflow: autoName,
    customer: matchedRow,
    ma_khach_hang: isCus ? seedCustomer?.ma_khach_hang || matchedRow?.ma_khach_hang || '' : '',
    ma_cong_ty: isCus ? seedCustomer?.ma_cong_ty || matchedRow?.ma_cong_ty || '' : '',
    ten_cong_ty: isCus ? party.displayCompanyName || seedCustomer?.ten_cong_ty || '' : '',
    ten_khach_hang: isCus ? party.displayCustomerName || seedCustomer?.ten_khach_hang || '' : '',
    selectedPresetId: '',
    source_template_id: seedSteps ? '' : 'WF_DEFAULT',
    source_template_name: seedSteps ? '' : 'Workflow Chuẩn Hệ Thống',
    setAsDefault: isCus ? existingCount === 0 : false,
    steps: mapRawStepsToStudioRows(seedSteps || STANDARD_FLOW_STEPS, false)
  }

  showStudioModal.value = true
  nextTick(() => {
    if (studioNameInputRef.value && typeof studioNameInputRef.value.focus === 'function') {
      studioNameInputRef.value.focus()
    }
  })
}

const openWorkflowStudioEdit = (group, focusStepId = '') => {
  if (!group || group.id_workflow === 'WF_DEFAULT') {
    openWorkflowStudioBaseline()
    return
  }
  closeInlineStepPopovers()
  studioMode.value = 'edit'
  studioOriginalGroup.value = group

  const isCus = group.workflow_scope === 'customer'
  const matchedRow = isCus ? group.customerRow || findMatchingCustomerRow(group) : null
  const party = isCus
    ? resolveDistinctFlowParty({
        ma_khach_hang: group.ma_khach_hang || matchedRow?.ma_khach_hang || '',
        ma_cong_ty: group.ma_cong_ty || matchedRow?.ma_cong_ty || '',
        ten_cong_ty: group.ten_cong_ty || matchedRow?.ten_cong_ty || '',
        ten_khach_hang: group.ten_khach_hang || matchedRow?.ten_khach_hang || ''
      })
    : { displayCompanyName: '', displayCustomerName: '' }

  const mappedSteps = mapRawStepsToStudioRows(group.statuses, true)
  studioForm.value = {
    id_workflow: group.id_workflow,
    mode: isCus ? 'customer' : 'template',
    name_workflow: group.name_workflow || '',
    customer: matchedRow,
    ma_khach_hang: isCus ? group.ma_khach_hang || matchedRow?.ma_khach_hang || '' : '',
    ma_cong_ty: isCus ? group.ma_cong_ty || matchedRow?.ma_cong_ty || '' : '',
    ten_cong_ty: isCus ? party.displayCompanyName || group.ten_cong_ty || '' : '',
    ten_khach_hang: isCus ? party.displayCustomerName || group.ten_khach_hang || '' : '',
    selectedPresetId: '',
    source_template_id: group.source_template_id || '',
    source_template_name: group.source_template_name || '',
    setAsDefault: isCus ? Boolean(group.is_company_default) : false,
    steps: mappedSteps
  }

  showStudioModal.value = true

  if (focusStepId) {
    const foundRow = mappedSteps.find((s) => s.id_status_workflow === focusStepId)
    if (foundRow) {
      focusedStepUid.value = foundRow._uid
      focusStepInputByUid(foundRow._uid)
    }
  } else {
    focusedStepUid.value = ''
  }
}

const openWorkflowStudioAddStep = (group) => {
  openWorkflowStudioEdit(group)
  nextTick(() => {
    addStudioStepRow()
  })
}

const openWorkflowStudioClone = (flow) => {
  if (!flow) return
  const isCus = flow.workflow_scope === 'customer'
  openWorkflowStudioCreate(
    isCus ? 'customer' : 'template',
    isCus ? flow.customerRow || flow : null,
    flow.statuses,
    `${flow.name_workflow || 'Workflow'} (Bản sao)`
  )
  studioForm.value.setAsDefault = false
}

const cloneFromCurrentStudio = () => {
  const isBaseline = studioMode.value === 'baseline'
  const nextMode = isBaseline ? 'template' : studioForm.value.mode
  const baseName = isBaseline
    ? 'Workflow mẫu — Bản sao Chuẩn'
    : `${studioForm.value.name_workflow || 'Workflow'} (Bản sao)`

  const seedCus =
    nextMode === 'customer'
      ? {
          ma_khach_hang: studioForm.value.ma_khach_hang,
          ma_cong_ty: studioForm.value.ma_cong_ty,
          ten_cong_ty: studioForm.value.ten_cong_ty,
          ten_khach_hang: studioForm.value.ten_khach_hang
        }
      : null

  openWorkflowStudioCreate(nextMode, seedCus, studioForm.value.steps, baseName)
  studioForm.value.setAsDefault = false
  showToast('Đã chuyển sang bản sao mới — đặt tên và nhấn Lưu Workflow!', 'success')
}

const cloneCurrentStudioAsBlueprint = () => {
  const cleanTitle = extractCleanFlowSuffix(studioForm.value.name_workflow)
  openWorkflowStudioCreate(
    'template',
    null,
    studioForm.value.steps,
    `Workflow mẫu — ${cleanTitle || studioForm.value.name_workflow}`
  )
  showToast('Đã nạp thành Workflow Mẫu mới — nhấn Lưu Workflow để lưu vào kho!', 'success')
}

const switchStudioScope = (nextMode) => {
  if (studioForm.value.mode === nextMode) return
  studioForm.value.mode = nextMode
  if (nextMode === 'template') {
    studioForm.value.customer = null
    studioForm.value.ma_khach_hang = ''
    studioForm.value.ma_cong_ty = ''
    studioForm.value.ten_cong_ty = ''
    studioForm.value.ten_khach_hang = ''
    studioForm.value.setAsDefault = false
  }
}

const openKanbanFromStudio = () => {
  const wfId = studioMode.value === 'baseline' ? 'WF_DEFAULT' : studioForm.value.id_workflow || 'WF_DEFAULT'
  const cus =
    studioForm.value.mode === 'customer' && (studioForm.value.ten_cong_ty || studioForm.value.ten_khach_hang)
      ? {
          ma_khach_hang: studioForm.value.ma_khach_hang,
          ten_khach_hang: studioForm.value.ten_khach_hang,
          ma_cong_ty: studioForm.value.ma_cong_ty,
          ten_cong_ty: studioForm.value.ten_cong_ty
        }
      : null
  closeStudioModal()
  emitOpenKanban(wfId, cus)
}

const triggerApplyBlueprintFromStudio = () => {
  if (studioMode.value === 'baseline') {
    openApplyBlueprintModal(baselineBlueprint)
    return
  }
  const bpGroup = {
    id_workflow: studioForm.value.id_workflow || 'WF_CUSTOM_TEMP',
    name_workflow: studioForm.value.name_workflow || 'Workflow Mẫu',
    workflow_scope: studioForm.value.mode,
    statuses: studioForm.value.steps.map((s) => ({
      status_name: s.status_name,
      '%status': formatPercentStatus(s['%status']),
      status_color: s.status_color || '#3b82f6'
    }))
  }
  openApplyBlueprintModal(bpGroup)
}

// =========================================================
// STUDIO CUSTOMER PICKER & QUICK ADD NEW CUSTOMER
// =========================================================
const openStudioCustomerPicker = (focus = 'company') => {
  studioCustomerPickerFocus.value = focus
  studioCustomerPickerSearch.value = ''
  showStudioCustomerPicker.value = true
  if (effectiveCustomersSource.value.length === 0) {
    fetchFallbackDirectoryIfNeeded()
  }
  nextTick(() => {
    if (studioCustomerSearchInputRef.value && typeof studioCustomerSearchInputRef.value.focus === 'function') {
      studioCustomerSearchInputRef.value.focus()
    }
  })
}

const isStudioCustomerActive = (c) => {
  if (!c) return false
  const fCT = cleanCode(studioForm.value.ten_cong_ty)
  const fKH = cleanCode(studioForm.value.ten_khach_hang)
  const oCT = cleanCode(c.ten_cong_ty)
  const oKH = cleanCode(c.ten_khach_hang)
  if (oCT && oKH) return fCT === oCT && fKH === oKH
  if (oCT) return fCT === oCT
  if (oKH) return fKH === oKH
  return false
}

const applyCustomerToStudioForm = ({ ma_khach_hang = '', ma_cong_ty = '', ten_cong_ty = '', ten_khach_hang = '' }) => {
  const prevComp = studioForm.value.ten_cong_ty || studioForm.value.ten_khach_hang || ''
  const matchedRow = findMatchingCustomerRow({ ma_khach_hang, ma_cong_ty, ten_cong_ty, ten_khach_hang })
  const sameName = Boolean(ten_cong_ty && ten_khach_hang && cleanCode(ten_cong_ty) === cleanCode(ten_khach_hang))

  studioForm.value.customer = matchedRow
  studioForm.value.ten_cong_ty = ten_cong_ty || ''
  studioForm.value.ten_khach_hang = sameName ? '' : ten_khach_hang || ''
  studioForm.value.ma_cong_ty = ma_cong_ty || matchedRow?.ma_cong_ty || genMaCT(ten_cong_ty)
  studioForm.value.ma_khach_hang = ma_khach_hang || matchedRow?.ma_khach_hang || genMaKH(ten_khach_hang, ten_cong_ty)

  const newLabel = ten_cong_ty || ten_khach_hang || ''
  const curName = String(studioForm.value.name_workflow || '').trim()
  if (studioMode.value === 'create' && newLabel && (!curName || (prevComp && curName.startsWith(prevComp + ' —')))) {
    const existingCount = matchedRow && Array.isArray(matchedRow.customGroups) ? matchedRow.customGroups.length : 0
    studioForm.value.name_workflow =
      existingCount === 0 ? `${newLabel} — Quy trình riêng` : `${newLabel} — Quy trình #${existingCount + 1}`
    studioForm.value.setAsDefault = existingCount === 0
  }
}

const selectStudioCustomerOption = (c) => {
  if (!c) return
  if (studioCustomerPickerFocus.value === 'contact' && studioForm.value.ten_cong_ty && !c.ten_cong_ty) {
    applyCustomerToStudioForm({
      ma_khach_hang: c.ma_khach_hang,
      ma_cong_ty: studioForm.value.ma_cong_ty,
      ten_cong_ty: studioForm.value.ten_cong_ty,
      ten_khach_hang: c.ten_khach_hang
    })
  } else {
    applyCustomerToStudioForm(c)
  }
  showStudioCustomerPicker.value = false
}

const applyManualStudioCustomerSearch = () => {
  const txt = String(studioCustomerPickerSearch.value || '').trim()
  if (!txt) return
  if (studioCustomerPickerFocus.value === 'contact') {
    applyCustomerToStudioForm({
      ten_cong_ty: studioForm.value.ten_cong_ty,
      ten_khach_hang: txt,
      ma_cong_ty: studioForm.value.ma_cong_ty,
      ma_khach_hang: genMaKH(txt, studioForm.value.ten_cong_ty)
    })
  } else {
    applyCustomerToStudioForm({
      ten_cong_ty: txt,
      ten_khach_hang: studioForm.value.ten_khach_hang,
      ma_cong_ty: genMaCT(txt),
      ma_khach_hang: genMaKH(studioForm.value.ten_khach_hang, txt)
    })
  }
  showStudioCustomerPicker.value = false
}

const clearStudioCompany = () => {
  studioForm.value.ten_cong_ty = ''
  studioForm.value.ma_cong_ty = ''
  studioForm.value.customer = null
  if (!studioForm.value.ten_khach_hang) {
    studioForm.value.ma_khach_hang = ''
  }
}

const clearStudioContact = () => {
  studioForm.value.ten_khach_hang = ''
  studioForm.value.ma_khach_hang = studioForm.value.ten_cong_ty ? genMaCT(studioForm.value.ten_cong_ty) : ''
}

const openStudioAddCustomerModal = () => {
  newStudioCustomerForm.value = {
    ten_cong_ty: String(studioForm.value.ten_cong_ty || '').trim(),
    ten_khach_hang: ''
  }
  showStudioAddCustomerModal.value = true
}

const submitNewStudioCustomer = async () => {
  const tenCT = String(newStudioCustomerForm.value.ten_cong_ty || '').trim().toUpperCase()
  const tenKH = String(newStudioCustomerForm.value.ten_khach_hang || '').trim().toUpperCase()
  if (!tenCT || !tenKH) {
    showToast('Vui lòng nhập đầy đủ Tên Công Ty & Tên Người Liên Hệ!', 'error')
    return
  }

  isSavingNewCustomer.value = true
  try {
    const ma_ct = genMaCT(tenCT)
    const ma_kh = genMaKH(tenKH, tenCT)
    const isDup = effectiveCustomersSource.value.some(
      (c) =>
        cleanCode(c.Ma_khach_hang ?? c.ma_khach_hang) === cleanCode(ma_kh) &&
        cleanCode(c.Ma_cong_ty ?? c.ma_cong_ty) === cleanCode(ma_ct)
    )
    if (isDup) {
      showToast(`Khách hàng đã tồn tại (${ma_kh})`, 'error')
      isSavingNewCustomer.value = false
      return
    }

    const payload = {
      ma_khach_hang: ma_kh,
      ten_khach_hang: tenKH,
      ma_cong_ty: ma_ct,
      ten_cong_ty: tenCT,
      created_time: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }

    localAddedCustomers.value.unshift({
      Ma_khach_hang: ma_kh,
      Ten_khach_hang: tenKH,
      Ma_cong_ty: ma_ct,
      Ten_cong_ty: tenCT
    })

    applyCustomerToStudioForm({
      ma_khach_hang: ma_kh,
      ma_cong_ty: ma_ct,
      ten_cong_ty: tenCT,
      ten_khach_hang: tenKH
    })

    showStudioAddCustomerModal.value = false
    showStudioCustomerPicker.value = false
    newStudioCustomerForm.value = { ten_cong_ty: '', ten_khach_hang: '' }

    await set(dbRef(database, 'khach_hang/' + sanitizeFirebaseKey(ma_kh)), payload)
    showToast('Đã thêm khách hàng mới & điền vào Workflow!', 'success')
    emit('updated')
  } catch (err) {
    console.error('Lỗi thêm KH mới trong Workflow:', err)
    showToast('Lỗi khi lưu khách hàng mới', 'error')
  } finally {
    isSavingNewCustomer.value = false
  }
}

// =========================================================
// STUDIO STEP ROWS, POPOVERS, PRESET LOADER & ATOMIC SAVE
// =========================================================
const toggleColorPopover = (uid) => {
  openPctRowUid.value = ''
  openColorRowUid.value = openColorRowUid.value === uid ? '' : uid
}

const pickStepColor = (st, hex) => {
  st.status_color = hex
  openColorRowUid.value = ''
}

const openPctPopover = (uid) => {
  openColorRowUid.value = ''
  openPctRowUid.value = uid
}

const pickQuickPct = (st, pct) => {
  st['%status'] = pct
  openPctRowUid.value = ''
}

const onStepPctBlur = (st) => {
  st['%status'] = formatPercentStatus(st['%status'])
  setTimeout(() => {
    if (openPctRowUid.value === st._uid) {
      openPctRowUid.value = ''
    }
  }, 120)
}

const suggestNextStepMeta = (afterIndex) => {
  const prev = studioForm.value.steps[afterIndex]
  const prevPct = prev ? parseFloat(String(prev['%status'] || '0').replace('%', '')) || 0 : 10
  const nextPctNum = Math.min(95, Math.max(10, Math.round((prevPct + 20) / 5) * 5))
  const paletteIdx = (afterIndex + 1) % PRESET_COLORS.length
  return {
    pct: `${nextPctNum}%`,
    color: PRESET_COLORS[paletteIdx].hex
  }
}

const addStudioStepRow = () => {
  const lastIdx = studioForm.value.steps.length - 1
  const meta = suggestNextStepMeta(lastIdx)
  const newRow = {
    _uid: makeStepUid(),
    id_status_workflow: '',
    _origStatusName: '',
    status_name: '',
    '%status': meta.pct,
    status_color: meta.color
  }
  studioForm.value.steps.push(newRow)
  focusStepInputByUid(newRow._uid)
}

const insertStudioStepAfter = (index) => {
  const meta = suggestNextStepMeta(index)
  const newRow = {
    _uid: makeStepUid(),
    id_status_workflow: '',
    _origStatusName: '',
    status_name: '',
    '%status': meta.pct,
    status_color: meta.color
  }
  studioForm.value.steps.splice(index + 1, 0, newRow)
  focusStepInputByUid(newRow._uid)
}

const onStepNameEnter = (index) => {
  if (index < studioForm.value.steps.length - 1) {
    const nextRow = studioForm.value.steps[index + 1]
    if (nextRow && !String(nextRow.status_name || '').trim()) {
      focusStepInputByUid(nextRow._uid)
      return
    }
  }
  insertStudioStepAfter(index)
}

const moveStudioStep = (index, delta) => {
  const target = index + delta
  if (target < 0 || target >= studioForm.value.steps.length) return
  const arr = studioForm.value.steps
  const [moved] = arr.splice(index, 1)
  arr.splice(target, 0, moved)
}

const removeStudioStepRow = async (index) => {
  if (studioForm.value.steps.length <= 1) {
    showToast('Workflow cần tối thiểu 1 bước tiến độ!', 'error')
    return
  }
  const st = studioForm.value.steps[index]
  const activeCount = getStepDealCount(st)
  if (activeCount > 0) {
    const ok = await askConfirm({
      title: 'Xóa bước đang có Công việc?',
      targetTag: 'BƯỚC TRONG WORKFLOW',
      targetValue: `${formatPercentStatus(st['%status'])} — ${st.status_name || 'Bước #' + (index + 1)}`,
      message: `Hiện có ${activeCount} Công việc Pipeline đang nằm ở bước này. Khi bạn nhấn Lưu Cập Nhật, các công việc đó sẽ được tự động chuyển sang bước gần nhất theo % tiến độ.`,
      tone: 'danger',
      confirmText: 'Gỡ bước này',
      cancelText: 'Giữ lại'
    })
    if (!ok) return
  }
  studioForm.value.steps.splice(index, 1)
}

const handleStudioPresetSelect = async (presetWfId) => {
  if (!presetWfId) return

  if (studioMode.value === 'edit' && studioActiveDealCount.value > 0) {
    const ok = await askConfirm({
      title: 'Thay thế chuỗi bước hiện tại?',
      targetTag: studioForm.value.name_workflow || 'WORKFLOW ĐANG CHẠY',
      targetValue: `Đang có ${studioActiveDealCount.value} Công việc sử dụng`,
      message: 'Nạp bộ bước mới sẽ thay thế các bước hiện tại trong biểu mẫu (chỉ ghi vào hệ thống khi bạn nhấn Lưu Cập Nhật, và các công việc đang chạy sẽ được ánh xạ sang bước có % gần nhất).',
      tone: 'info',
      confirmText: 'Nạp bộ bước mẫu',
      cancelText: 'Hủy'
    })
    if (!ok) {
      studioForm.value.selectedPresetId = ''
      return
    }
  }

  const isCus = studioForm.value.mode === 'customer'
  const compTitle = isCus ? String(studioForm.value.ten_cong_ty || studioForm.value.ten_khach_hang || '').trim() : ''

  if (presetWfId === '__BLANK__') {
    studioForm.value.source_template_id = ''
    studioForm.value.source_template_name = ''
    studioForm.value.steps = [
      {
        _uid: makeStepUid(),
        id_status_workflow: '',
        _origStatusName: '',
        status_name: 'Bước khởi tạo',
        '%status': '10%',
        status_color: '#3b82f6'
      }
    ]
  } else if (presetWfId === 'WF_DEFAULT') {
    studioForm.value.source_template_id = 'WF_DEFAULT'
    studioForm.value.source_template_name = 'Workflow Chuẩn Hệ Thống'
    studioForm.value.steps = mapRawStepsToStudioRows(STANDARD_FLOW_STEPS, false)
  } else {
    const foundGroup = allWorkflowGroups.value.find((g) => g.id_workflow === presetWfId)
    if (foundGroup && foundGroup.statuses.length > 0) {
      studioForm.value.source_template_id = foundGroup.id_workflow
      studioForm.value.source_template_name = foundGroup.name_workflow
      studioForm.value.steps = mapRawStepsToStudioRows(foundGroup.statuses, false)

      if (studioMode.value === 'create') {
        if (isCus && compTitle && !String(studioForm.value.name_workflow || '').trim()) {
          studioForm.value.name_workflow = `${compTitle} — ${extractCleanFlowSuffix(foundGroup.name_workflow)}`
        } else if (!isCus && !String(studioForm.value.name_workflow || '').trim()) {
          studioForm.value.name_workflow = `${extractCleanFlowSuffix(foundGroup.name_workflow)} (Mẫu)`
        }
      }
    }
  }

  studioForm.value.selectedPresetId = ''
  showToast('Đã nạp chuỗi bước mẫu vào cột phải!', 'success')
}

const submitWorkflowStudio = async () => {
  if (studioMode.value === 'baseline' || saving.value) return

  const isEdit = studioMode.value === 'edit'
  const isCus = studioForm.value.mode === 'customer'
  const tenCT = String(studioForm.value.ten_cong_ty || '').trim()
  const tenKH = String(studioForm.value.ten_khach_hang || '').trim()

  if (isCus && !tenCT && !tenKH) {
    showToast('Vui lòng chọn Công ty / Khách hàng sở hữu Workflow!', 'error')
    return
  }

  const wfName = String(studioForm.value.name_workflow || '').trim()
  if (!wfName) {
    showToast('Vui lòng nhập Tên Workflow!', 'error')
    if (studioNameInputRef.value) studioNameInputRef.value.focus()
    return
  }

  const validSteps = studioForm.value.steps.filter((s) => String(s.status_name || '').trim() !== '')
  if (validSteps.length === 0) {
    showToast('Workflow cần tối thiểu 1 bước có tên hợp lệ!', 'error')
    return
  }

  const cus = isCus
    ? studioForm.value.customer ||
      findMatchingCustomerRow({
        ma_khach_hang: studioForm.value.ma_khach_hang,
        ma_cong_ty: studioForm.value.ma_cong_ty,
        ten_cong_ty: tenCT,
        ten_khach_hang: tenKH
      })
    : null

  const resolvedMaKH = isCus ? String(studioForm.value.ma_khach_hang || cus?.ma_khach_hang || genMaKH(tenKH, tenCT)) : ''
  const resolvedMaCT = isCus ? String(studioForm.value.ma_cong_ty || cus?.ma_cong_ty || cleanCode(tenCT || tenKH)) : ''
  const resolvedTenCT = isCus ? tenCT || cus?.ten_cong_ty || '' : ''
  const resolvedTenKH = isCus ? tenKH || cus?.ten_khach_hang || '' : ''

  const nowTs = Date.now()
  const cusCode = isCus ? cleanCode(resolvedMaCT || resolvedTenCT || resolvedMaKH || resolvedTenKH || nowTs) : ''
  const wfId =
    isEdit && studioForm.value.id_workflow
      ? studioForm.value.id_workflow
      : isCus
        ? `WF_CUS_${cusCode}_${nowTs.toString(36)}`
        : `WF_TPL_${nowTs.toString(36)}_${Math.random().toString(36).substring(2, 5)}`

  const otherGroupsOfCustomer =
    isCus && cus && Array.isArray(cus.customGroups)
      ? cus.customGroups.filter((g) => g.id_workflow !== wfId)
      : []
  const makeDefault = isCus && (Boolean(studioForm.value.setAsDefault) || otherGroupsOfCustomer.length === 0)

  const wfUpdates = {}

  if (isCus && makeDefault && otherGroupsOfCustomer.length > 0) {
    const otherWfIds = new Set(otherGroupsOfCustomer.map((g) => g.id_workflow))
    items.value.forEach((it) => {
      if (otherWfIds.has(it.id_workflow) && it.is_company_default) {
        it.is_company_default = false
        wfUpdates[sanitizeFirebaseKey(it.id_status_workflow)] = toCleanWorkflowRecord(it)
      }
    })
  }

  const keptStepIds = new Set()
  const savedRecords = validSteps.map((st, idx) => {
    const stId = st.id_status_workflow || `ST_${nowTs}_${idx}_${Math.random().toString(36).substring(2, 5)}`
    keptStepIds.add(stId)
    return {
      id_workflow: wfId,
      id_status_workflow: stId,
      name_workflow: wfName,
      '%status': formatPercentStatus(st['%status']),
      status_name: String(st.status_name).trim(),
      status_index: idx + 1,
      status_color: st.status_color || '#3b82f6',
      workflow_scope: isCus ? 'customer' : 'template',
      ma_khach_hang: resolvedMaKH,
      ma_cong_ty: resolvedMaCT,
      ten_khach_hang: resolvedTenKH,
      ten_cong_ty: resolvedTenCT,
      is_company_default: makeDefault,
      source_template_id: isCus ? String(studioForm.value.source_template_id || '') : '',
      source_template_name: isCus ? String(studioForm.value.source_template_name || '') : ''
    }
  })

  const removedStepIds = new Set()
  if (isEdit) {
    items.value.forEach((it) => {
      if (it.id_workflow === wfId && !keptStepIds.has(it.id_status_workflow)) {
        removedStepIds.add(it.id_status_workflow)
        wfUpdates[sanitizeFirebaseKey(it.id_status_workflow)] = null
      }
    })
  }

  savedRecords.forEach((rec) => {
    wfUpdates[sanitizeFirebaseKey(rec.id_status_workflow)] = toCleanWorkflowRecord(rec)
  })

  const backupItems = [...items.value]
  items.value = [...items.value.filter((it) => it.id_workflow !== wfId), ...savedRecords]
  closeStudioModal()

  saving.value = true
  try {
    await update(dbRef(database, 'pipeline_workflow'), wfUpdates)

    if (isCus && makeDefault && resolvedMaKH) {
      const khKey = sanitizeFirebaseKey(resolvedMaKH)
      const khSnap = await get(dbRef(database, `khach_hang/${khKey}`))
      if (khSnap.exists() && typeof khSnap.val() === 'object' && !Array.isArray(khSnap.val())) {
        await update(dbRef(database, `khach_hang/${khKey}`), {
          default_workflow_id: wfId,
          last_updated: new Date().toISOString()
        })
      }
    }

    if (isEdit) {
      const pipeSnap = await get(dbRef(database, 'pipeline'))
      if (pipeSnap.exists()) {
        const rawPipes = pipeSnap.val()
        const pipeUpdates = {}
        const recById = new Map(savedRecords.map((r) => [r.id_status_workflow, r]))

        Object.entries(rawPipes || {}).forEach(([pKey, pVal]) => {
          if (!pVal || typeof pVal !== 'object' || pVal.id_workflow !== wfId) return
          if (pVal.status_name === 'THÀNH CÔNG' || pVal.status_name === 'THẤT BẠI') return

          const directStep = pVal.id_status_workflow ? recById.get(pVal.id_status_workflow) : null
          if (directStep) {
            if (pVal.status_name !== directStep.status_name || pVal['%status'] !== directStep['%status']) {
              pipeUpdates[`${pKey}/status_name`] = directStep.status_name
              pipeUpdates[`${pKey}/%status`] = directStep['%status']
            }
          } else if (removedStepIds.has(pVal.id_status_workflow) || !pVal.id_status_workflow) {
            const pctNum = parseFloat(String(pVal['%status'] || '0').replace('%', '')) || 0
            let bestStep = savedRecords[0]
            let minDiff = Infinity
            savedRecords.forEach((cand) => {
              const cNum = parseFloat(String(cand['%status'] || '0').replace('%', '')) || 0
              const diff = Math.abs(cNum - pctNum)
              if (diff < minDiff) {
                minDiff = diff
                bestStep = cand
              }
            })
            if (bestStep) {
              pipeUpdates[`${pKey}/id_status_workflow`] = bestStep.id_status_workflow
              pipeUpdates[`${pKey}/status_name`] = bestStep.status_name
              pipeUpdates[`${pKey}/%status`] = bestStep['%status']
            }
          }
        })

        if (Object.keys(pipeUpdates).length > 0) {
          await update(dbRef(database, 'pipeline'), pipeUpdates)
        }
      }
    }

    showToast(isEdit ? 'Đã lưu cập nhật Workflow!' : 'Đã tạo Workflow mới!', 'success')
    emit('updated')
  } catch (err) {
    console.error('Lỗi lưu Workflow Studio:', err)
    items.value = backupItems
    showToast('Lỗi mạng khi lưu Workflow', 'error')
    await fetchWorkflows()
  } finally {
    saving.value = false
  }
}

const deleteCustomerFlowFlat = async (flow) => {
  if (flow.customerRow) {
    await deleteSingleCompanyFlow(flow.customerRow, flow)
  } else {
    await confirmDeleteWorkflowGroup(flow)
  }
}

const deleteWorkflowFromStudio = async () => {
  if (studioMode.value !== 'edit' || !studioForm.value.id_workflow) return
  const liveGroup =
    flatCustomerFlows.value.find((f) => f.id_workflow === studioForm.value.id_workflow) ||
    allWorkflowGroups.value.find((g) => g.id_workflow === studioForm.value.id_workflow) ||
    studioOriginalGroup.value
  if (!liveGroup) return

  if (liveGroup.workflow_scope === 'customer') {
    await deleteCustomerFlowFlat(liveGroup)
  } else {
    await confirmDeleteWorkflowGroup(liveGroup)
  }
  if (!items.value.some((i) => i.id_workflow === liveGroup.id_workflow)) {
    closeStudioModal()
  }
}

// APPLY A BLUEPRINT TO ONE OR MULTIPLE COMPANIES IN BATCH
const openApplyBlueprintModal = (blueprint) => {
  if (!blueprint) return
  const defaultSuffix =
    blueprint.id_workflow === 'WF_DEFAULT'
      ? 'Quy trình riêng'
      : blueprint.workflow_scope === 'customer'
        ? extractCleanFlowSuffix(blueprint.name_workflow)
        : blueprint.name_workflow || 'Quy trình riêng'
  applyBlueprintState.value = {
    blueprint,
    flowSuffix: defaultSuffix,
    setAsDefault: false,
    search: '',
    selectedKeys: []
  }
  showApplyBlueprintModal.value = true
}

const toggleApplyCompanyKey = (rowKey) => {
  const arr = applyBlueprintState.value.selectedKeys
  const idx = arr.indexOf(rowKey)
  if (idx === -1) {
    arr.push(rowKey)
  } else {
    arr.splice(idx, 1)
  }
}

const selectAllFilteredApplyCompanies = () => {
  const currentSet = new Set(applyBlueprintState.value.selectedKeys)
  filteredApplyCompanyRows.value.forEach((r) => currentSet.add(r.rowKey))
  applyBlueprintState.value.selectedKeys = Array.from(currentSet)
}

const submitApplyBlueprintToCompanies = async () => {
  const bp = applyBlueprintState.value.blueprint
  const keys = applyBlueprintState.value.selectedKeys
  if (!bp || !Array.isArray(keys) || keys.length === 0) {
    showToast('Vui lòng chọn ít nhất 1 Công ty để áp Workflow!', 'error')
    return
  }
  const suffix = String(applyBlueprintState.value.flowSuffix || bp.name_workflow || 'Quy trình riêng').trim()
  const sourceSteps = Array.isArray(bp.statuses) && bp.statuses.length > 0 ? bp.statuses : STANDARD_FLOW_STEPS

  const selectedCompanies = customerRows.value.filter((r) => keys.includes(r.rowKey))
  if (selectedCompanies.length === 0) return

  const wfUpdates = {}
  const allNewRecords = []
  const nowBase = Date.now()

  selectedCompanies.forEach((co, coIdx) => {
    const compTitle = co.ten_cong_ty || co.ten_khach_hang || co.ma_cong_ty || 'Công ty'
    const cusCode = cleanCode(co.ma_cong_ty || co.ten_cong_ty || co.ma_khach_hang || co.ten_khach_hang || coIdx)
    const wfId = `WF_CUS_${cusCode}_${(nowBase + coIdx).toString(36)}`
    const wfName = `${compTitle} — ${suffix}`
    const makeDef = Boolean(applyBlueprintState.value.setAsDefault) || co.customGroups.length === 0

    if (makeDef && co.customGroups.length > 0) {
      const existingWfIds = new Set(co.customGroups.map((g) => g.id_workflow))
      items.value.forEach((it) => {
        if (existingWfIds.has(it.id_workflow) && it.is_company_default) {
          it.is_company_default = false
          wfUpdates[sanitizeFirebaseKey(it.id_status_workflow)] = toCleanWorkflowRecord(it)
        }
      })
    }

    sourceSteps.forEach((st, sIdx) => {
      const stId = `ST_${nowBase}_${coIdx}_${sIdx}_${Math.random().toString(36).substring(2, 5)}`
      const rec = {
        id_workflow: wfId,
        id_status_workflow: stId,
        name_workflow: wfName,
        '%status': formatPercentStatus(st['%status']),
        status_name: String(st.status_name || '').trim(),
        status_index: sIdx + 1,
        status_color: st.status_color || '#3b82f6',
        workflow_scope: 'customer',
        ma_khach_hang: String(co.ma_khach_hang || ''),
        ma_cong_ty: String(co.ma_cong_ty || cleanCode(co.ten_cong_ty || '')),
        ten_khach_hang: String(co.ten_khach_hang || ''),
        ten_cong_ty: String(co.ten_cong_ty || ''),
        is_company_default: makeDef,
        source_template_id: String(bp.id_workflow || ''),
        source_template_name: String(bp.name_workflow || '')
      }
      allNewRecords.push(rec)
      wfUpdates[sanitizeFirebaseKey(rec.id_status_workflow)] = toCleanWorkflowRecord(rec)
    })

    collapsedGroups.value[wfId] = false
    collapsedCompanies.value[co.rowKey] = false
  })

  items.value.push(...allNewRecords)
  showApplyBlueprintModal.value = false
  closeStudioModal()
  saving.value = true

  try {
    await update(dbRef(database, 'pipeline_workflow'), wfUpdates)
    subTab.value = 'customer'
    showToast(`Đã áp Workflow "${bp.name_workflow}" cho ${selectedCompanies.length} công ty!`, 'success')
    emit('updated')
  } catch (err) {
    console.error('Lỗi khi áp Workflow mẫu hàng loạt:', err)
    showToast('Lỗi mạng khi áp Workflow mẫu vào công ty', 'error')
    await fetchWorkflows()
  } finally {
    saving.value = false
  }
}

// DELETE A SINGLE COMPANY FLOW TEMPLATE (KEEPING OTHER TEMPLATES OF THAT COMPANY INTACT)
const deleteSingleCompanyFlow = async (cus, group) => {
  if (!cus || !group) return
  const remainingGroups = cus.customGroups.filter((g) => g.id_workflow !== group.id_workflow)
  const nextFallbackGroup =
    remainingGroups.find((g) => Boolean(g.is_company_default)) || remainingGroups[0] || null

  const ok = await askConfirm({
    title: 'Xóa Workflow Của Công Ty?',
    targetTag: cus.ten_cong_ty || cus.ten_khach_hang || 'CÔNG TY',
    targetValue: `${group.name_workflow} (${group.statuses.length} bước)`,
    message: nextFallbackGroup
      ? `Workflow này sẽ bị xóa khỏi danh sách của công ty (${remainingGroups.length} Workflow khác của công ty vẫn giữ nguyên). Các Công việc Pipeline đang dùng Workflow này sẽ được chuyển an toàn về Workflow Chuẩn.`
      : 'Công ty sẽ quay về dùng Workflow Chuẩn Hệ Thống (5 bước). Các Công việc Pipeline đang dùng Workflow này sẽ được ánh xạ an toàn về Workflow Chuẩn.',
    tone: 'danger',
    confirmText: 'Xóa Workflow này',
    cancelText: 'Giữ lại'
  })
  if (!ok) return

  const backup = [...items.value]
  items.value = items.value.filter((i) => i.id_workflow !== group.id_workflow)

  const wfUpdates = {}
  group.statuses.forEach((st) => {
    wfUpdates[sanitizeFirebaseKey(st.id_status_workflow)] = null
  })

  if (nextFallbackGroup && !remainingGroups.some((g) => Boolean(g.is_company_default))) {
    items.value.forEach((it) => {
      if (it.id_workflow === nextFallbackGroup.id_workflow) {
        it.is_company_default = true
        wfUpdates[sanitizeFirebaseKey(it.id_status_workflow)] = toCleanWorkflowRecord(it)
      }
    })
  }

  saving.value = true
  try {
    const pipeSnap = await get(dbRef(database, 'pipeline'))
    if (pipeSnap.exists()) {
      const rawPipes = pipeSnap.val()
      const pipeUpdates = {}
      Object.entries(rawPipes || {}).forEach(([pKey, pVal]) => {
        if (!pVal || typeof pVal !== 'object') return
        if (pVal.id_workflow !== group.id_workflow) return
        pipeUpdates[`${pKey}/id_workflow`] = ''
        pipeUpdates[`${pKey}/id_status_workflow`] = ''
        if (pVal.status_name !== 'THÀNH CÔNG' && pVal.status_name !== 'THẤT BẠI') {
          const pctNum = parseFloat(String(pVal['%status'] || '0').replace('%', '')) || 0
          let fallbackStep = STANDARD_FLOW_STEPS[0]
          let minDiff = Infinity
          STANDARD_FLOW_STEPS.forEach((st) => {
            const stNum = parseFloat(st['%status']) || 0
            const diff = Math.abs(stNum - pctNum)
            if (diff < minDiff) {
              minDiff = diff
              fallbackStep = st
            }
          })
          pipeUpdates[`${pKey}/status_name`] = fallbackStep.status_name
          pipeUpdates[`${pKey}/%status`] = fallbackStep['%status']
        }
      })
      if (Object.keys(pipeUpdates).length > 0) {
        await update(dbRef(database, 'pipeline'), pipeUpdates)
      }
    }

    await update(dbRef(database, 'pipeline_workflow'), wfUpdates)

    if (cus.ma_khach_hang) {
      const khKey = sanitizeFirebaseKey(cus.ma_khach_hang)
      const khSnap = await get(dbRef(database, `khach_hang/${khKey}`))
      if (khSnap.exists() && typeof khSnap.val() === 'object' && !Array.isArray(khSnap.val())) {
        await update(dbRef(database, `khach_hang/${khKey}`), {
          default_workflow_id: nextFallbackGroup ? nextFallbackGroup.id_workflow : ''
        })
      }
    }

    showToast('Đã xóa Workflow khỏi công ty!', 'success')
    emit('updated')
  } catch (err) {
    console.error('Lỗi xóa Workflow công ty:', err)
    items.value = backup
    showToast('Có lỗi khi xóa Workflow', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDeleteWorkflowGroup = async (group) => {
  const ok = await askConfirm({
    title: 'Xóa Workflow Mẫu?',
    targetTag: 'WORKFLOW',
    targetValue: `${group.name_workflow} (${group.statuses.length} bước)`,
    message: 'Các Công việc Pipeline đang dùng Workflow này sẽ không bị mất mà được chuyển an toàn về Workflow Chuẩn Hệ Thống.',
    tone: 'danger',
    confirmText: 'Xóa Workflow',
    cancelText: 'Hủy'
  })
  if (!ok) return

  const backup = [...items.value]
  items.value = items.value.filter((i) => i.id_workflow !== group.id_workflow)
  saving.value = true

  try {
    const wfUpdates = {}
    group.statuses.forEach((st) => {
      wfUpdates[sanitizeFirebaseKey(st.id_status_workflow)] = null
    })
    await update(dbRef(database, 'pipeline_workflow'), wfUpdates)

    const pipeSnap = await get(dbRef(database, 'pipeline'))
    if (pipeSnap.exists()) {
      const rawPipes = pipeSnap.val()
      const pipeUpdates = {}
      Object.entries(rawPipes || {}).forEach(([pKey, pVal]) => {
        if (pVal && typeof pVal === 'object' && pVal.id_workflow === group.id_workflow) {
          pipeUpdates[`${pKey}/id_workflow`] = ''
          pipeUpdates[`${pKey}/id_status_workflow`] = ''
        }
      })
      if (Object.keys(pipeUpdates).length > 0) {
        await update(dbRef(database, 'pipeline'), pipeUpdates)
      }
    }

    showToast('Đã xóa Workflow!', 'success')
    emit('updated')
  } catch (err) {
    console.error('Lỗi xóa Workflow:', err)
    items.value = backup
    showToast('Lỗi mạng khi xóa Workflow', 'error')
  } finally {
    saving.value = false
  }
}

// CARD CHIP CLICK & MOBILE SWAP REORDERING ON LIST
const handleCardChipClick = (group, element) => {
  if (isMobile.value && swapSourceItem.value && swapSourceItem.value.id_workflow === element.id_workflow) {
    handleSwapAction(element)
  } else {
    openWorkflowStudioEdit(group, element.id_status_workflow)
  }
}

const handleSwapAction = async (element) => {
  if (!swapSourceItem.value) {
    swapSourceItem.value = element
    return
  }
  if (swapSourceItem.value.id_status_workflow === element.id_status_workflow) {
    swapSourceItem.value = null
    return
  }
  if (swapSourceItem.value.id_workflow !== element.id_workflow) return

  const mainSource = items.value.find((i) => i.id_status_workflow === swapSourceItem.value.id_status_workflow)
  const mainTarget = items.value.find((i) => i.id_status_workflow === element.id_status_workflow)
  swapSourceItem.value = null

  if (!mainSource || !mainTarget) return
  const tempIndex = mainSource.status_index
  mainSource.status_index = mainTarget.status_index
  mainTarget.status_index = tempIndex

  mainSource.isDraggingSuccess = true
  mainTarget.isDraggingSuccess = true
  setTimeout(() => {
    mainSource.isDraggingSuccess = false
    mainTarget.isDraggingSuccess = false
  }, 900)

  saving.value = true
  isReordering.value = true
  try {
    const updates = {
      [sanitizeFirebaseKey(mainSource.id_status_workflow)]: toCleanWorkflowRecord(mainSource),
      [sanitizeFirebaseKey(mainTarget.id_status_workflow)]: toCleanWorkflowRecord(mainTarget)
    }
    await update(dbRef(database, 'pipeline_workflow'), updates)
    showToast('Đã hoán đổi thứ tự bước!', 'success')
    emit('updated')
  } catch (err) {
    console.error('Lỗi hoán đổi vị trí:', err)
    showToast('Lỗi khi lưu thứ tự mới', 'error')
    await fetchWorkflows()
  } finally {
    saving.value = false
    isReordering.value = false
  }
}

const onListChange = async (event, group) => {
  if (!event.moved) return
  const movedItem = event.moved.element
  saving.value = true
  isReordering.value = true
  try {
    await updateAllIndexesForGroup(group)
    movedItem.isDraggingSuccess = true
    showToast('Đã cập nhật thứ tự bước!', 'success')
    setTimeout(() => {
      movedItem.isDraggingSuccess = false
    }, 900)
  } finally {
    saving.value = false
    isReordering.value = false
  }
}

const updateAllIndexesForGroup = async (group) => {
  const updatesObj = {}
  group.statuses.forEach((item, index) => {
    const newIndex = index + 1
    item.status_index = newIndex
    const mainIdx = items.value.findIndex((i) => i.id_status_workflow === item.id_status_workflow)
    if (mainIdx !== -1) items.value[mainIdx].status_index = newIndex
    updatesObj[sanitizeFirebaseKey(item.id_status_workflow)] = toCleanWorkflowRecord(item)
  })
  if (Object.keys(updatesObj).length === 0) return
  await update(dbRef(database, 'pipeline_workflow'), updatesObj)
  emit('updated')
}

const handleGlobalKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    if (
      showStudioModal.value &&
      studioMode.value !== 'baseline' &&
      !dialogState.value.open &&
      !showStudioCustomerPicker.value &&
      !showStudioAddCustomerModal.value &&
      !showApplyBlueprintModal.value
    ) {
      e.preventDefault()
      submitWorkflowStudio()
      return
    }
  }

  if (e.key === 'Escape') {
    if (dialogState.value.open) {
      e.preventDefault()
      closeDialog(false)
      return
    }
    if (openColorRowUid.value || openPctRowUid.value) {
      e.preventDefault()
      closeInlineStepPopovers()
      return
    }
    if (showStudioAddCustomerModal.value) {
      e.preventDefault()
      showStudioAddCustomerModal.value = false
      return
    }
    if (showStudioCustomerPicker.value) {
      e.preventDefault()
      showStudioCustomerPicker.value = false
      return
    }
    if (showApplyBlueprintModal.value) {
      e.preventDefault()
      showApplyBlueprintModal.value = false
      return
    }
    if (showStudioModal.value) {
      e.preventDefault()
      closeStudioModal()
      return
    }
  }

  if (dialogState.value.open && e.key === 'Enter' && dialogState.value.tone !== 'danger') {
    e.preventDefault()
    closeDialog(true)
  }
}

const checkMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 768
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleGlobalKeydown)
  refreshAllData()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
/* ============================================================================
   UNIFIED DESIGN TOKENS: DARK NAVY (DEFAULT) + ENTERPRISE LIGHT BLUE + CUSTOM GLASS
   ============================================================================ */
.wf-designer-root,
.wf-modal-overlay,
.wf-dialog-overlay,
.smart-toast-wrap {
  --bg-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --bg-page: #070d19;
  --bg-panel: #0d1628;
  --bg-panel-elev: #131f36;
  --bg-glass-panel: linear-gradient(180deg, rgba(19, 31, 54, 0.88) 0%, rgba(11, 19, 35, 0.94) 100%);
  --bg-glass-border: rgba(148, 163, 184, 0.17);
  --bg-modal-surface: linear-gradient(180deg, #111c32 0%, #0a1222 100%);
  --bg-group-surface: rgba(15, 24, 42, 0.62);
  --bg-group-border: rgba(148, 163, 184, 0.14);
  --bg-soft-pad: rgba(2, 6, 23, 0.38);
  --bg-soft-pad-bd: rgba(148, 163, 184, 0.12);
  --bg-well: rgba(3, 7, 18, 0.56);
  --bg-well-border: rgba(148, 163, 184, 0.18);
  --bg-well-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(0, 0, 0, 0.25);
  --bg-island: rgba(15, 24, 42, 0.72);
  --bg-subbar: rgba(3, 7, 18, 0.34);
  --bg-subbar-sep: rgba(148, 163, 184, 0.12);
  --bg-chip-rest: rgba(255, 255, 255, 0.04);
  --bg-chip-rest-bd: rgba(148, 163, 184, 0.16);
  --bg-cselect-bg: rgba(15, 24, 42, 0.85);
  --bg-cselect-bd: rgba(148, 163, 184, 0.22);
  --bg-specular: rgba(255, 255, 255, 0.08);
  --bg-specular-strong: rgba(255, 255, 255, 0.15);

  --bg-card: #101a2e;
  --bg-subtle: #17243d;
  --bg-hover: rgba(16, 185, 129, 0.1);
  --bg-border: rgba(148, 163, 184, 0.15);
  --bg-border-strong: rgba(148, 163, 184, 0.26);
  --bg-text: #f8fafc;
  --bg-text-sec: #cbd5e1;
  --bg-text-muted: #94a3b8;
  --bg-shadow-panel: 0 16px 36px -12px rgba(0, 0, 0, 0.62);
  --bg-shadow-pop: 0 26px 60px -12px rgba(0, 0, 0, 0.82);
  --bg-overlay: rgba(2, 6, 18, 0.76);
  --bg-scheme: dark;

  --theme-pri: #059669;
  --theme-pri-bright: #34d399;
  --theme-pri-bg: rgba(16, 185, 129, 0.16);
  --theme-pri-bd: rgba(52, 211, 153, 0.44);
  --theme-pri-grad: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --theme-pri-header-grad: linear-gradient(135deg, #059669 0%, #047857 100%);
  --theme-pri-shadow: rgba(16, 185, 129, 0.46);
  --theme-pri-ring: rgba(16, 185, 129, 0.18);

  --sem-sky: #0284c7;
  --sem-sky-bright: #38bdf8;
  --sem-sky-bg: rgba(14, 165, 233, 0.14);
  --sem-sky-bd: rgba(56, 189, 248, 0.34);

  --sem-emerald: #059669;
  --sem-emerald-bright: #34d399;
  --sem-emerald-bg: rgba(16, 185, 129, 0.14);
  --sem-emerald-bd: rgba(52, 211, 153, 0.34);

  --sem-amber: #d97706;
  --sem-amber-bright: #fbbf24;
  --sem-amber-bg: rgba(245, 158, 11, 0.14);
  --sem-amber-bd: rgba(251, 191, 36, 0.36);

  --sem-rose: #e11d48;
  --sem-rose-bright: #fb7185;
  --sem-rose-bg: rgba(244, 63, 94, 0.14);
  --sem-rose-bd: rgba(251, 113, 133, 0.36);
}

/* ENTERPRISE LIGHT BLUE THEME OVERRIDES */
.wf-designer-root.theme-light-blue,
.wf-modal-overlay.theme-light-blue,
.wf-dialog-overlay.theme-light-blue,
.smart-toast-wrap.theme-light-blue {
  --bg-page: #edf4fc;
  --bg-panel: #ffffff;
  --bg-panel-elev: #ffffff;
  --bg-glass-panel: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  --bg-glass-border: #cfdceb;
  --bg-modal-surface: #f4f8fd;
  --bg-group-surface: #ffffff;
  --bg-group-border: #d8e3f0;
  --bg-soft-pad: #f1f6fc;
  --bg-soft-pad-bd: #dbe6f3;
  --bg-well: #eef3f9;
  --bg-well-border: #cfdceb;
  --bg-well-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.06);
  --bg-island: #ffffff;
  --bg-subbar: #f3f7fc;
  --bg-subbar-sep: #e2eaf4;
  --bg-chip-rest: #ffffff;
  --bg-chip-rest-bd: #d5e0ee;
  --bg-cselect-bg: #ffffff;
  --bg-cselect-bd: #cbd8e8;
  --bg-specular: rgba(255, 255, 255, 0.9);
  --bg-specular-strong: rgba(255, 255, 255, 0.98);

  --bg-card: #ffffff;
  --bg-subtle: #eff6ff;
  --bg-hover: rgba(2, 132, 199, 0.08);
  --bg-border: #dce6f2;
  --bg-border-strong: #c8d6e6;
  --bg-text: #0f172a;
  --bg-text-sec: #334155;
  --bg-text-muted: #64748b;
  --bg-shadow-panel: 0 10px 26px -8px rgba(15, 23, 42, 0.08);
  --bg-shadow-pop: 0 24px 52px -12px rgba(15, 23, 42, 0.22);
  --bg-overlay: rgba(15, 23, 42, 0.45);
  --bg-scheme: light;

  --theme-pri: #0284c7;
  --theme-pri-bright: #0284c7;
  --theme-pri-bg: #e0f2fe;
  --theme-pri-bd: #38bdf8;
  --theme-pri-grad: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  --theme-pri-header-grad: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  --theme-pri-shadow: rgba(2, 132, 199, 0.42);
  --theme-pri-ring: rgba(2, 132, 199, 0.18);

  --sem-sky: #0284c7;
  --sem-sky-bright: #0369a1;
  --sem-sky-bg: #e0f2fe;
  --sem-sky-bd: #7dd3fc;

  --sem-emerald: #059669;
  --sem-emerald-bright: #047857;
  --sem-emerald-bg: #d1fae5;
  --sem-emerald-bd: #6ee7b7;

  --sem-amber: #d97706;
  --sem-amber-bright: #b45309;
  --sem-amber-bg: #fef3c7;
  --sem-amber-bd: #fcd34d;

  --sem-rose: #e11d48;
  --sem-rose-bright: #be123c;
  --sem-rose-bg: #ffe4e6;
  --sem-rose-bd: #fda4af;
}

/* CUSTOM GLASS THEME OVERRIDES */
.wf-designer-root.theme-custom-glass,
.wf-modal-overlay.theme-custom-glass,
.wf-dialog-overlay.theme-custom-glass {
  --bg-glass-panel: linear-gradient(180deg, var(--cg-panel-top, rgba(15, 23, 42, 0.65)) 0%, var(--cg-panel-bot, rgba(15, 23, 42, 0.52)) 100%);
  --bg-glass-border: var(--cg-border, rgba(255, 255, 255, 0.28));
  --bg-card: var(--cg-card-top, rgba(15, 23, 42, 0.6));
}

.wf-designer-root {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--bg-text);
  color-scheme: var(--bg-scheme);
}

.wf-tabular {
  font-variant-numeric: tabular-nums;
}

.wf-mono {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}

/* =========================================================
   COMMAND FILTER STRIP (SOLID COLORED HEADER + RECESSED WELLS)
   ========================================================= */
.bg-filter-strip {
  background: var(--bg-glass-panel);
  border: 1px solid var(--bg-glass-border);
  border-radius: 16px;
  box-shadow: var(--bg-shadow-panel), inset 0 1px 0 var(--bg-specular);
  overflow: hidden;
  backdrop-filter: blur(var(--cg-blur, 16px));
}

.bg-filter-head {
  background: var(--theme-pri-header-grad);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: #ffffff;
}

.bg-filter-head-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffffff;
}

.bg-filter-head-tools {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.bg-head-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 11px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s var(--bg-ease);
}

.bg-head-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.24);
  transform: translateY(-1px);
}

.bg-head-btn.is-solid-white {
  background: #ffffff;
  color: #0f172a;
  border-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.bg-head-btn.is-solid-white:hover:not(:disabled) {
  background: #f8fafc;
}

.wf-command-body {
  padding: 13px 16px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.wf-toolbar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.bg-seg-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3.5px;
  border-radius: 11px;
  background: var(--bg-well);
  border: 1px solid var(--bg-well-border);
  box-shadow: var(--bg-well-shadow);
  flex-wrap: wrap;
}

.bg-seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--bg-text-muted);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s var(--bg-ease);
}

.bg-seg-switch.is-compact .bg-seg-btn {
  height: 29px;
  padding: 0 10px;
  font-size: 12px;
}

.bg-seg-btn:hover {
  color: var(--bg-text);
}

.bg-seg-btn.is-active {
  background: var(--theme-pri-grad);
  color: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32), 0 3px 10px -2px var(--theme-pri-shadow);
}

.wf-tab-pill {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: rgba(148, 163, 184, 0.18);
  color: currentColor;
}

.bg-seg-btn.is-active .wf-tab-pill {
  background: rgba(255, 255, 255, 0.24);
  color: #ffffff;
}

.wf-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.bg-search-shell {
  position: relative;
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  height: 38px;
  background: var(--bg-well);
  border: 1px solid var(--bg-well-border);
  box-shadow: var(--bg-well-shadow);
  border-radius: 11px;
  padding: 0 10px 0 34px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.bg-search-shell:focus-within {
  border-color: var(--theme-pri-bright);
  box-shadow: var(--bg-well-shadow), 0 0 0 3px var(--theme-pri-ring);
}

.bg-search-ic {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--bg-text-muted);
  pointer-events: none;
}

.bg-search-inp {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--bg-text);
  font-size: 13px;
  outline: none;
}

.bg-search-inp::placeholder {
  color: var(--bg-text-muted);
}

.bg-search-clr {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: var(--bg-chip-rest);
  color: var(--bg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.bg-search-clr:hover {
  color: var(--bg-text);
}

.wf-hint-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--bg-text-muted);
}

/* =========================================================
   ARCHITECTURE BANNER & GROUP CARDS
   ========================================================= */
.wf-architecture-banner {
  background: var(--theme-pri-bg);
  border: 1px solid var(--theme-pri-bd);
  border-radius: 14px;
  padding: 12px 15px;
}

.wf-arch-left {
  display: flex;
  align-items: flex-start;
  gap: 11px;
}

.wf-arch-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--theme-pri-grad);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px -2px var(--theme-pri-shadow);
}

.wf-arch-title {
  font-weight: 800;
  font-size: 13px;
  color: var(--bg-text);
}

.wf-arch-sub {
  font-size: 12px;
  color: var(--bg-text-sec);
  margin-top: 2px;
}

.wf-section-stack,
.wf-customer-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.wf-group-card {
  background: var(--bg-glass-panel);
  border: 1px solid var(--bg-glass-border);
  border-radius: 14px;
  box-shadow: var(--bg-shadow-panel), inset 0 1px 0 var(--bg-specular);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.wf-group-card.is-custom-flow {
  border-color: var(--sem-emerald-bd);
}

.wf-group-card.is-baseline-card {
  border-color: var(--sem-sky-bd);
}

.wf-group-card.is-highlighted {
  border-color: var(--theme-pri-bright);
  box-shadow: 0 0 0 3px var(--theme-pri-ring), var(--bg-shadow-panel);
}

.wf-group-head {
  padding: 13px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.wf-cus-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.wf-cus-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border-strong);
  color: var(--bg-text-sec);
  font-weight: 800;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wf-cus-avatar.is-custom {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bd);
  color: var(--sem-emerald-bright);
}

.wf-cus-avatar.is-baseline {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bd);
  color: var(--sem-sky-bright);
}

.wf-cus-avatar.is-template {
  background: var(--sem-amber-bg);
  border-color: var(--sem-amber-bd);
  color: var(--sem-amber-bright);
}

.wf-cus-titles {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wf-cus-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wf-cus-company {
  font-weight: 800;
  font-size: 14px;
  color: var(--bg-text);
}

.wf-cus-sub-line {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--bg-text-muted);
}

.wf-inline-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--bg-text-sec);
  font-weight: 600;
}

.wf-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.03em;
  border: 1px solid transparent;
}

.wf-badge-emerald {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-bright);
  border-color: var(--sem-emerald-bd);
}

.wf-badge-sky {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-bright);
  border-color: var(--sem-sky-bd);
}

.wf-badge-amber {
  background: var(--sem-amber-bg);
  color: var(--sem-amber-bright);
  border-color: var(--sem-amber-bd);
}

.wf-badge-slate {
  background: var(--bg-soft-pad);
  color: var(--bg-text-muted);
  border-color: var(--bg-border-strong);
}

.wf-group-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* STANDARD PREVIEW STRIP */
.wf-standard-preview-strip {
  padding: 9px 16px 12px;
  border-top: 1px dashed var(--bg-subbar-sep);
  background: var(--bg-subbar);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.wf-preview-step-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 7px;
  background: var(--bg-chip-rest);
  border: 1px solid var(--bg-chip-rest-bd);
  font-size: 11.5px;
  color: var(--bg-text-sec);
}

.wf-preview-step-pill.is-terminal-ok {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bd);
  color: var(--sem-emerald-bright);
}

.wf-preview-step-pill.is-terminal-fail {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bd);
  color: var(--sem-rose-bright);
}

.wf-step-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
}

.wf-step-pct {
  font-weight: 800;
}

/* INTERACTIVE STEPS BODY */
.wf-group-body {
  padding: 13px 16px 15px;
  border-top: 1px solid var(--bg-subbar-sep);
  background: var(--bg-subbar);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wf-group-subbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
}

.wf-flow-name-tag {
  color: var(--sem-emerald-bright);
}

.wf-drag-hint {
  color: var(--bg-text-muted);
  font-size: 11.5px;
}

.wf-steps-track {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 10px;
}

.wf-step-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--bg-border-strong);
  border-top: 3px solid var(--step-accent, #38bdf8);
  border-radius: 11px;
  padding: 11px 12px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
  box-shadow: 0 4px 12px -6px rgba(15, 23, 42, 0.16);
}

.wf-step-card:hover:not(.is-readonly) {
  transform: translateY(-2px);
  border-color: var(--theme-pri-bright);
  box-shadow: 0 10px 22px -10px rgba(15, 23, 42, 0.35);
}

.wf-step-card.is-readonly {
  cursor: default;
}

.wf-step-card.is-flash {
  border-color: var(--sem-emerald-bright);
  box-shadow: 0 0 0 2px var(--sem-emerald-bd);
}

.wf-step-card.is-swap-source {
  border-color: var(--sem-amber-bright);
  box-shadow: 0 0 0 2px var(--sem-amber-bd);
}

.wf-step-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.wf-step-index {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.wf-step-percent {
  font-size: 12px;
  font-weight: 800;
  color: var(--bg-text);
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-soft-pad-bd);
  padding: 2px 8px;
  border-radius: 999px;
}

.wf-step-card-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--bg-text);
  line-height: 1.4;
  word-break: break-word;
}

.wf-step-card-foot {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.wf-step-edit-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--bg-text-muted);
}

.wf-mobile-swap-btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-soft-pad);
  color: var(--bg-text-sec);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.wf-mobile-swap-btn.is-active {
  background: var(--sem-amber-bg);
  border-color: var(--sem-amber-bd);
  color: var(--sem-amber-bright);
}

.wf-mobile-swap-btn.is-target {
  border-color: var(--sem-sky-bd);
  color: var(--sem-sky-bright);
}

.wf-ghost-card {
  opacity: 0.4;
  border: 1px dashed var(--theme-pri-bright) !important;
}

/* =========================================================
   SEMANTIC 5-TONE BUTTONS
   ========================================================= */
.wf-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 35px;
  padding: 0 13px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.16s var(--bg-ease);
  white-space: nowrap;
}

.wf-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.wf-btn-sm {
  height: 31px;
  padding: 0 10px;
  font-size: 12px;
}

.wf-btn-primary {
  background: var(--theme-pri-grad);
  color: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 4px 12px -2px var(--theme-pri-shadow);
}

.wf-btn-primary:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.wf-btn-sky-soft {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-bright);
  border-color: var(--sem-sky-bd);
}

.wf-btn-sky-soft:hover:not(:disabled) {
  filter: brightness(1.06);
}

.wf-btn-slate {
  background: var(--bg-chip-rest);
  color: var(--bg-text-sec);
  border-color: var(--bg-border-strong);
}

.wf-btn-slate:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--bg-text);
}

.wf-btn-danger {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px -2px rgba(225, 29, 72, 0.42);
}

.wf-btn-danger-ghost {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-bright);
  border-color: var(--sem-rose-bd);
}

.wf-btn-danger-ghost:hover:not(:disabled) {
  filter: brightness(1.06);
}

.wf-icon-btn {
  width: 31px;
  height: 31px;
  border-radius: 8px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-chip-rest);
  color: var(--bg-text-sec);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.16s ease;
}

.wf-icon-btn:hover:not(:disabled) {
  color: var(--bg-text);
  background: var(--bg-hover);
}

.wf-icon-btn.is-danger:hover:not(:disabled) {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-bright);
  border-color: var(--sem-rose-bd);
}

.wf-icon-btn svg.is-rotated {
  transform: rotate(180deg);
}

.wf-load-more-wrap {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.wf-empty-card {
  background: var(--bg-glass-panel);
  border: 1px dashed var(--bg-border-strong);
  border-radius: 14px;
  padding: 34px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.wf-empty-ic {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border-strong);
  color: var(--theme-pri-bright);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wf-empty-title {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--bg-text);
}

.wf-empty-sub {
  font-size: 12.5px;
  color: var(--bg-text-muted);
  max-width: 520px;
}

/* =========================================================
   MODALS WITH MODAL-GROUP & SOLID BANNER HEADERS
   ========================================================= */
.wf-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100020;
  background: var(--bg-overlay);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--bg-text);
  color-scheme: var(--bg-scheme);
}

.wf-modal-card {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  background: var(--bg-modal-surface);
  border: 1px solid var(--bg-glass-border);
  border-radius: 16px;
  box-shadow: var(--bg-shadow-pop);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wf-modal-card.wf-modal-lg {
  max-width: 780px;
}

.wf-modal-grab {
  display: none;
}

.wf-modal-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--bg-border);
  background: var(--bg-panel);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.wf-modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 11px;
}

.wf-modal-ic {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--theme-pri-bg);
  border: 1px solid var(--theme-pri-bd);
  color: var(--theme-pri-bright);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wf-modal-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--bg-text);
}

.wf-modal-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--bg-text-muted);
}

.wf-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-chip-rest);
  color: var(--bg-text-sec);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wf-modal-close:hover {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-bright);
  border-color: var(--sem-rose-bd);
}

.wf-modal-body {
  padding: 16px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-group {
  background: var(--bg-group-surface);
  border: 1px solid var(--bg-group-border);
  border-radius: 13px;
  overflow: hidden;
}

.modal-banner-header {
  padding: 9px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.modal-banner-header.is-emerald {
  background: var(--theme-pri-header-grad);
}

.modal-banner-header.is-sky {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
}

.modal-banner-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.bg-banner-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}

.bg-banner-btn:hover {
  background: rgba(255, 255, 255, 0.26);
}

.modal-group-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.wf-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wf-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-text-sec);
}

.wf-req {
  color: var(--sem-rose-bright);
}

.bg-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 10px;
  background: var(--bg-well);
  color: var(--bg-text);
  border: 1px solid var(--bg-well-border);
  box-shadow: var(--bg-well-shadow);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  color-scheme: var(--bg-scheme);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.bg-input:focus {
  border-color: var(--theme-pri-bright);
  box-shadow: var(--bg-well-shadow), 0 0 0 3px var(--theme-pri-ring);
}

.wf-steps-editor-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-step-edit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-step-row-num {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wf-step-row-name {
  flex: 1;
}

.wf-step-row-pct {
  width: 82px;
  text-align: center;
}

.wf-mini-swatches {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.wf-mini-swatch {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}

.wf-mini-swatch.is-selected {
  border-color: var(--bg-text);
  transform: scale(1.16);
}

.wf-color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.wf-color-swatch {
  height: 34px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wf-color-swatch.is-active {
  border-color: var(--bg-text);
  box-shadow: 0 0 0 2px var(--theme-pri-ring);
}

.wf-modal-footer {
  padding: 13px 18px;
  border-top: 1px solid var(--bg-border);
  background: var(--bg-panel);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* =========================================================
   3-TIER BAOGIA DIALOG & TOP-CENTER SMART TOAST
   ========================================================= */
.wf-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 100040;
  background: var(--bg-overlay);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--bg-text);
}

.wf-dialog-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-modal-surface);
  border: 1px solid var(--bg-glass-border);
  border-radius: 16px;
  padding: 18px;
  box-shadow: var(--bg-shadow-pop);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-dialog-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wf-dialog-ic {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wf-dialog-ic.tone-danger {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-bright);
  border: 1px solid var(--sem-rose-bd);
}

.wf-dialog-ic.tone-success {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-bright);
  border: 1px solid var(--sem-emerald-bd);
}

.wf-dialog-ic.tone-info {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-bright);
  border: 1px solid var(--sem-sky-bd);
}

.wf-dialog-title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
  color: var(--bg-text);
}

.wf-dialog-target-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 11px;
  border-radius: 10px;
  background: var(--bg-well);
  border: 1px solid var(--bg-well-border);
}

.wf-dialog-target-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--theme-pri-bg);
  color: var(--theme-pri-bright);
  border: 1px solid var(--theme-pri-bd);
  flex-shrink: 0;
}

.wf-dialog-target-val {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--bg-text);
  word-break: break-word;
}

.wf-dialog-msg-box {
  padding: 11px 13px;
  border-radius: 11px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--bg-text-sec);
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-soft-pad-bd);
}

.wf-dialog-msg-box.tone-danger {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bd);
  color: var(--bg-text);
}

.wf-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 2px;
}

/* SMART TOAST PC-A / MB-A */
.smart-toast-wrap {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000000;
  pointer-events: none;
}

.wf-smart-toast {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--bg-panel-elev);
  border: 1px solid var(--bg-glass-border);
  color: var(--bg-text);
  font-size: 13px;
  font-weight: 700;
  box-shadow: var(--bg-shadow-pop);
  pointer-events: auto;
}

.wf-smart-toast.is-success {
  border-color: var(--sem-emerald-bd);
}

.wf-smart-toast.is-error {
  border-color: var(--sem-rose-bd);
}

.wf-toast-ic {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-bright);
}

.wf-smart-toast.is-error .wf-toast-ic {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-bright);
}

.wf-toast-fade-enter-active,
.wf-toast-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.wf-toast-fade-enter-from,
.wf-toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* SPINNERS */
.wf-spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.32);
  border-top-color: currentColor;
  border-radius: 999px;
  animation: wfSpin 0.7s linear infinite;
}

.wf-spinner-lg {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(148, 163, 184, 0.25);
  border-top-color: var(--theme-pri-bright);
  border-radius: 999px;
  animation: wfSpin 0.8s linear infinite;
}

@keyframes wfSpin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   MULTI-TEMPLATE COMPANY STACK (1 COMPANY = MANY FLOWS)
   ========================================================= */
.wf-company-flows-stack {
  padding: 12px 16px 14px;
  border-top: 1px solid var(--bg-subbar-sep);
  background: var(--bg-subbar);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wf-subflow-card {
  background: var(--bg-island);
  border: 1px solid var(--bg-border-strong);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.wf-subflow-card.is-default-subflow {
  border-color: var(--sem-emerald-bd);
}

.wf-subflow-head {
  padding: 10px 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  cursor: pointer;
  background: var(--bg-soft-pad);
}

.wf-subflow-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.wf-subflow-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 7px;
  border-radius: 6px;
  background: var(--theme-pri-bg);
  border: 1px solid var(--theme-pri-bd);
  color: var(--theme-pri-bright);
  font-size: 11px;
  font-weight: 800;
}

.wf-subflow-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--bg-text);
}

.wf-subflow-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.wf-subflow-body {
  padding: 12px 13px;
  border-top: 1px solid var(--bg-subbar-sep);
}

.wf-btn-xs {
  height: 27px;
  padding: 0 9px;
  font-size: 11.5px;
  border-radius: 7px;
}

.wf-icon-btn-sm {
  width: 27px;
  height: 27px;
  border-radius: 7px;
}

.wf-std-ref-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--bg-soft-pad);
  border: 1px dashed var(--bg-border-strong);
  font-size: 12px;
  color: var(--bg-text-sec);
}

.wf-std-ref-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* =========================================================
   BLUEPRINT APPLY MODAL & CHECKBOXES
   ========================================================= */
.wf-check-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--bg-text-sec);
  cursor: pointer;
  user-select: none;
  padding: 4px 2px 0;
}

.wf-check-line input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: var(--theme-pri);
  cursor: pointer;
}

.wf-blueprint-preview-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-soft-pad-bd);
}

.wf-name-preview-box {
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  background: var(--bg-soft-pad);
  border: 1px dashed var(--bg-border-strong);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  color: var(--bg-text-sec);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-name-preview-box strong {
  color: var(--theme-pri-bright);
}

.wf-apply-company-list {
  max-height: 290px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 2px;
}

.wf-apply-company-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--bg-border);
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease;
}

.wf-apply-company-row:hover {
  border-color: var(--bg-border-strong);
  background: var(--bg-hover);
}

.wf-apply-company-row.is-checked {
  border-color: var(--theme-pri-bd);
  background: var(--theme-pri-bg);
}

.wf-apply-check-box {
  width: 19px;
  height: 19px;
  border-radius: 6px;
  border: 1.5px solid var(--bg-border-strong);
  background: var(--bg-well);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.wf-apply-check-box.is-on {
  background: var(--theme-pri-grad);
  border-color: transparent;
}

.wf-apply-company-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wf-apply-company-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 700;
  color: var(--bg-text);
}

.wf-apply-company-sub {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

.wf-empty-inline {
  padding: 18px 12px;
  text-align: center;
  color: var(--bg-text-muted);
  font-size: 12.5px;
  border: 1px dashed var(--bg-border-strong);
  border-radius: 10px;
}

/* =========================================================
   MINIMALIST FLAT FLOW CARDS & SINGLE-LINE STEP TRACK
   ========================================================= */
.wf-minimal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 12px;
  border-radius: 13px;
  background: var(--bg-glass-panel);
  border: 1px solid var(--bg-glass-border);
  box-shadow: var(--bg-shadow-panel), inset 0 1px 0 var(--bg-specular);
  backdrop-filter: blur(var(--cg-blur, 16px));
}

.wf-tab-count {
  font-size: 11.5px;
  font-weight: 600;
  opacity: 0.84;
}

.wf-toolbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 250px;
  flex-wrap: wrap;
}

.wf-slim-search {
  height: 33px;
  max-width: 310px;
  min-width: 185px;
  border-radius: 9px;
}

.wf-flat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wf-flat-card {
  padding: 12px 15px;
  border-radius: 12px;
  background: var(--bg-glass-panel);
  border: 1px solid var(--bg-glass-border);
  display: flex;
  flex-direction: column;
  gap: 9px;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.wf-flat-card:hover {
  border-color: var(--bg-border-strong);
}

.wf-flat-card.is-highlighted {
  border-color: var(--theme-pri-bright);
  box-shadow: 0 0 0 3px var(--theme-pri-ring);
}

.wf-flat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.wf-flat-meta {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  row-gap: 2px;
  min-width: 0;
  flex: 1;
  line-height: 1.4;
}

.wf-flat-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--bg-text);
}

.wf-em-sep {
  margin: 0 7px;
  color: var(--bg-text-muted);
  opacity: 0.6;
  user-select: none;
}

.wf-dot-sep {
  margin: 0 5px;
  color: var(--bg-text-muted);
  opacity: 0.65;
  user-select: none;
}

.wf-flat-party {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--bg-text-muted);
}

.wf-flat-tools {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.wf-ghost-ic-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--bg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.wf-ghost-ic-btn:hover {
  color: var(--bg-text);
  background: var(--bg-chip-rest);
  border-color: var(--bg-border-strong);
}

.wf-ghost-ic-btn.is-danger:hover {
  color: var(--sem-rose-bright);
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bd);
}

.wf-flat-txt-btn {
  height: 27px;
  padding: 0 9px;
  border-radius: 7px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-chip-rest);
  color: var(--bg-text-sec);
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.wf-flat-txt-btn:hover {
  color: var(--bg-text);
  border-color: var(--theme-pri-bd);
  background: var(--bg-hover);
}

.wf-flat-track-scroll {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.wf-flat-track-scroll::-webkit-scrollbar {
  height: 3px;
}

.wf-flat-track-scroll::-webkit-scrollbar-thumb {
  background: var(--bg-border-strong);
  border-radius: 999px;
}

.wf-flat-draggable-list {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  flex-shrink: 0;
}

.wf-flat-step-unit {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  flex-shrink: 0;
}

.wf-flat-step-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  background: var(--step-clr, #3b82f6);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  text-shadow: 0 1px 1.5px rgba(15, 23, 42, 0.24);
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: grab;
  user-select: none;
  transition: border-color 0.15s ease, filter 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
}

.wf-flat-step-chip .wf-step-dot {
  background: rgba(255, 255, 255, 0.92);
}

.wf-flat-step-chip:hover:not(.is-readonly) {
  border-color: #ffffff;
  color: #ffffff;
  filter: brightness(1.06);
  box-shadow: 0 3px 8px -2px rgba(15, 23, 42, 0.3);
}

.wf-flat-step-chip:active:not(.is-readonly) {
  cursor: grabbing;
}

.wf-flat-step-chip.is-readonly {
  cursor: default;
}

.wf-flat-step-chip.is-flash {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px var(--sem-emerald-bright);
}

.wf-flat-step-chip.is-swap-source {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px var(--sem-amber-bright);
}

.wf-step-grip {
  font-size: 11px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.8);
  opacity: 0.85;
}

.wf-flat-step-chip:hover .wf-step-grip {
  opacity: 1;
}

.wf-step-chip-name {
  font-weight: 700;
  color: #ffffff;
}

.wf-step-chip-pct {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
}

.wf-step-arrow {
  font-size: 11.5px;
  color: var(--bg-text-muted);
  opacity: 0.55;
  user-select: none;
  line-height: 1;
  flex-shrink: 0;
}

.wf-inline-add-step-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px dashed var(--bg-border-strong);
  background: transparent;
  color: var(--bg-text-muted);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.wf-inline-add-step-btn:hover {
  color: var(--bg-text);
  border-color: var(--theme-pri-bd);
  background: var(--bg-chip-rest);
}

.wf-ghost-chip {
  opacity: 0.38;
}

.wf-drag-chip {
  opacity: 0.92;
}

.wf-mobile-swap-inline {
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-soft-pad);
  color: var(--bg-text-muted);
  border-radius: 5px;
  padding: 1px 5px;
  font-size: 11px;
  line-height: 1.2;
  cursor: pointer;
}

.wf-mobile-swap-inline.is-active {
  color: var(--sem-amber-bright);
  border-color: var(--sem-amber-bd);
}

.wf-mobile-swap-inline.is-target {
  color: var(--sem-sky-bright);
  border-color: var(--sem-sky-bd);
}

.wf-clean-group-head {
  padding: 9px 14px;
  border-bottom: 1px solid var(--bg-group-border);
  background: var(--bg-soft-pad);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-text-sec);
}

.wf-cus-picker-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-picker-search {
  height: 35px;
}

.wf-cus-picker-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 122px;
  overflow-y: auto;
  padding: 2px 2px 2px 0;
}

.wf-cus-pick-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 7px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-chip-rest);
  color: var(--bg-text-sec);
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.14s ease, background 0.14s ease, color 0.14s ease;
}

.wf-cus-pick-item:hover {
  border-color: var(--theme-pri-bd);
  color: var(--bg-text);
}

.wf-cus-pick-item.is-picked {
  border-color: var(--theme-pri-bd);
  background: var(--theme-pri-bg);
  color: var(--bg-text);
}

.wf-cus-pick-main {
  font-weight: 600;
}

.wf-cus-pick-sub {
  color: var(--bg-text-muted);
  font-size: 11.5px;
}

.wf-apply-muted-meta {
  font-size: 12px;
  font-weight: 500;
  color: var(--bg-text-muted);
}

/* =========================================================
   CLICKABLE CARDS & SUBTLE MINI PILLS
   ========================================================= */
.wf-flat-card.is-clickable {
  cursor: pointer;
}

.wf-flat-card.is-clickable:hover {
  border-color: var(--theme-pri-bd);
  box-shadow: var(--bg-shadow-panel), 0 0 0 1px var(--theme-pri-ring);
}

.wf-card-mini-pill {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  margin-left: 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid transparent;
  vertical-align: middle;
}

.wf-card-mini-pill.is-emerald {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-bright);
  border-color: var(--sem-emerald-bd);
}

.wf-card-mini-pill.is-sky {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-bright);
  border-color: var(--sem-sky-bd);
}

.wf-card-mini-pill.is-slate {
  background: var(--bg-soft-pad);
  color: var(--bg-text-muted);
  border-color: var(--bg-border-strong);
}

/* =========================================================
   UNIFIED 2-COLUMN WORKFLOW STUDIO MODAL (100% FULLSCREEN) & SUB-PICKERS
   ========================================================= */
.wf-modal-overlay.is-studio-fullscreen-overlay {
  z-index: 100022;
  padding: 0;
  align-items: stretch;
  justify-content: stretch;
}

.wf-modal-overlay.is-studio-fullscreen-overlay.theme-custom-glass {
  background: rgba(6, 15, 28, 0.84);
  backdrop-filter: blur(22px);
}

.wf-modal-overlay.is-sub-picker-overlay {
  z-index: 100028;
}

.wf-modal-overlay.is-top-picker-overlay {
  z-index: 100034;
}

.wf-modal-card.wf-modal-md {
  max-width: 660px;
}

.wf-modal-card.wf-modal-studio {
  width: 100vw;
  max-width: 100%;
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.wf-modal-ic.is-sky {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bd);
  color: var(--sem-sky-bright);
}

.wf-studio-header {
  padding: 13px 20px;
  align-items: center;
  flex-shrink: 0;
}

.wf-studio-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.wf-studio-head-titles {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wf-studio-title-row {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.wf-studio-pills {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.wf-ctx-pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid transparent;
  white-space: nowrap;
}

.wf-ctx-pill.is-emerald {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-bright);
  border-color: var(--sem-emerald-bd);
}

.wf-ctx-pill.is-sky {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-bright);
  border-color: var(--sem-sky-bd);
}

.wf-ctx-pill.is-amber {
  background: var(--sem-amber-bg);
  color: var(--sem-amber-bright);
  border-color: var(--sem-amber-bd);
}

.wf-ctx-pill.is-slate {
  background: var(--bg-soft-pad);
  color: var(--bg-text-sec);
  border-color: var(--bg-border-strong);
}

.wf-studio-head-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.wf-studio-body-grid {
  flex: 1;
  min-height: 0;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: minmax(360px, 430px) minmax(0, 1fr);
  gap: 18px;
  overflow: hidden;
}

.wf-studio-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.wf-studio-col-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

/* 1-TAP SCOPE CHOICE GRID */
.wf-scope-choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.wf-scope-choice-btn {
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-well);
  color: var(--bg-text-sec);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  cursor: pointer;
  text-align: left;
  transition: all 0.16s ease;
}

.wf-scope-choice-btn:hover {
  border-color: var(--theme-pri-bd);
  color: var(--bg-text);
}

.wf-scope-choice-btn.is-active {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bd);
  color: var(--bg-text);
  box-shadow: inset 0 1px 0 var(--bg-specular);
}

.wf-scope-choice-btn.is-sky-tone.is-active {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bd);
}

.wf-scope-choice-main {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--bg-text);
}

.wf-scope-choice-sub {
  font-size: 11px;
  color: var(--bg-text-muted);
}

.wf-input-hero-title {
  height: 40px;
  font-size: 13.5px;
  font-weight: 700;
}

/* STANDARDIZED INLINE CUSTOMER PICKER BOX */
.wf-customer-group-box {
  padding: 11px 12px;
  border-radius: 11px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-soft-pad-bd);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wf-customer-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.wf-link-action-btn {
  border: none;
  background: transparent;
  color: var(--sem-sky-bright);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 5px;
}

.wf-link-action-btn:hover {
  background: var(--sem-sky-bg);
}

.wf-sub-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--bg-text-muted);
}

.wf-input-with-picker {
  position: relative;
  display: flex;
  align-items: center;
}

.bg-input.has-inline-picker {
  padding-right: 84px;
  cursor: pointer;
}

.wf-inline-clear-btn {
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: none;
  background: var(--bg-chip-rest);
  color: var(--bg-text-muted);
  font-size: 14px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.wf-inline-clear-btn:hover {
  color: var(--sem-rose-bright);
  background: var(--sem-rose-bg);
}

.wf-inline-pick-btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  height: 28px;
  padding: 0 11px;
  border-radius: 7px;
  border: 1px solid var(--theme-pri-bd);
  background: var(--theme-pri-bg);
  color: var(--theme-pri-bright);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.wf-inline-pick-btn:hover {
  background: var(--theme-pri-grad);
  color: #ffffff;
  border-color: transparent;
}

/* DEFAULT WORKFLOW TOGGLE CARD */
.wf-toggle-card {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 9px;
  background: var(--bg-card);
  border: 1px solid var(--bg-border-strong);
  cursor: pointer;
  user-select: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.wf-toggle-card:hover {
  border-color: var(--theme-pri-bd);
}

.wf-toggle-card.is-on {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bd);
}

.wf-toggle-card-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.wf-toggle-card-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-text);
}

.wf-toggle-card-sub {
  font-size: 11px;
  color: var(--bg-text-muted);
}

/* BASELINE & EDIT UTILITY BOXES */
.wf-baseline-info-box,
.wf-edit-utility-box {
  padding: 12px 13px;
  border-radius: 11px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-soft-pad-bd);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-baseline-info-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--bg-text);
}

.wf-baseline-info-desc {
  font-size: 12px;
  color: var(--bg-text-sec);
  line-height: 1.5;
}

.wf-baseline-stat-row,
.wf-edit-utility-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--bg-text-muted);
  padding-top: 4px;
  border-top: 1px dashed var(--bg-border);
}

.wf-baseline-stat-row strong,
.wf-edit-utility-row strong {
  color: var(--bg-text);
}

.wf-baseline-cta-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-studio-action-card {
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-card);
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
}

.wf-studio-action-card:hover {
  border-color: var(--theme-pri-bd);
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.wf-sac-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--theme-pri-bright);
}

.wf-sac-sub {
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

.wf-edit-utility-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* LIVE KANBAN PREVIEW STRIP */
.wf-live-preview-box {
  padding: 10px 12px;
  border-radius: 11px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-soft-pad-bd);
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex-shrink: 0;
}

.wf-live-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--bg-text-muted);
}

.wf-live-preview-note {
  font-weight: 600;
  letter-spacing: 0;
  font-size: 11px;
}

.wf-live-preview-track {
  display: flex;
  align-items: center;
  gap: 5px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.wf-live-col-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 8px;
  border-radius: 6px;
  background: var(--step-clr, #3b82f6);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 1.5px rgba(15, 23, 42, 0.24);
  white-space: nowrap;
  flex-shrink: 0;
}

.wf-live-col-pill .wf-step-dot {
  background: rgba(255, 255, 255, 0.92);
}

.wf-live-col-pct {
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.24);
  font-weight: 800;
  color: #ffffff;
}

.wf-live-col-name {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff;
}

.wf-live-term-sep {
  margin: 0 3px;
  color: var(--bg-text-muted);
  opacity: 0.45;
}

.wf-live-col-pill.is-term-won {
  background: #10b981;
  border-color: rgba(255, 255, 255, 0.28);
  color: #ffffff;
  font-weight: 800;
}

.wf-live-col-pill.is-term-lost {
  background: #ef4444;
  border-color: rgba(255, 255, 255, 0.28);
  color: #ffffff;
  font-weight: 800;
}

/* VERTICAL DRAGGABLE STEP ROWS IN STUDIO */
.wf-studio-steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-studio-step-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--bg-border);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.wf-studio-step-row:hover {
  border-color: var(--bg-border-strong);
}

.wf-studio-step-row.is-focused-step {
  border-color: var(--theme-pri-bd);
  box-shadow: 0 0 0 2px var(--theme-pri-ring);
}

.wf-studio-step-row.is-readonly {
  padding: 9px 12px;
}

.wf-studio-readonly-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--bg-text);
}

.wf-studio-readonly-pct {
  font-size: 12px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border-strong);
  color: var(--bg-text-sec);
}

.wf-studio-row-ghost {
  opacity: 0.42;
  border: 1px dashed var(--theme-pri-bright) !important;
}

.wf-studio-row-grip {
  cursor: grab;
  color: var(--bg-text-muted);
  font-size: 14px;
  line-height: 1;
  padding: 4px 2px;
  user-select: none;
  opacity: 0.65;
}

.wf-studio-row-grip:hover {
  opacity: 1;
  color: var(--bg-text);
}

.wf-studio-row-idx {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* COMPACT COLOR SWATCH POPOVER */
.wf-color-pop-wrap {
  position: relative;
  flex-shrink: 0;
}

.wf-color-trigger-btn {
  height: 34px;
  padding: 0 7px;
  border-radius: 8px;
  border: 1px solid var(--bg-well-border);
  background: var(--bg-well);
  color: var(--bg-text-muted);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.wf-color-trigger-btn:hover {
  border-color: var(--bg-border-strong);
  color: var(--bg-text);
}

.wf-color-trigger-dot {
  width: 13px;
  height: 13px;
  border-radius: 999px;
}

.wf-color-popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 30;
  width: 188px;
  padding: 8px;
  border-radius: 11px;
  background: var(--bg-panel-elev);
  border: 1px solid var(--bg-border-strong);
  box-shadow: var(--bg-shadow-pop);
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.wf-color-pop-item {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.wf-color-pop-item.is-active {
  border-color: var(--bg-text);
  transform: scale(1.08);
}

.wf-studio-step-inp {
  flex: 1;
  min-width: 130px;
  height: 34px;
}

/* PROGRESS % INPUT + QUICK % POPOVER */
.wf-pct-pop-wrap {
  position: relative;
  width: 78px;
  flex-shrink: 0;
}

.wf-studio-pct-inp {
  height: 34px;
  text-align: center;
  font-weight: 700;
  padding: 0 8px;
}

.wf-pct-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  padding: 6px;
  border-radius: 10px;
  background: var(--bg-panel-elev);
  border: 1px solid var(--bg-border-strong);
  box-shadow: var(--bg-shadow-pop);
  display: flex;
  align-items: center;
  gap: 4px;
}

.wf-pct-chip {
  height: 25px;
  padding: 0 7px;
  border-radius: 6px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-well);
  color: var(--bg-text-sec);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.wf-pct-chip:hover,
.wf-pct-chip.is-active {
  background: var(--theme-pri-bg);
  border-color: var(--theme-pri-bd);
  color: var(--theme-pri-bright);
}

.wf-step-deal-pill {
  height: 24px;
  padding: 0 7px;
  border-radius: 6px;
  background: var(--sem-amber-bg);
  border: 1px solid var(--sem-amber-bd);
  color: var(--sem-amber-bright);
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  flex-shrink: 0;
}

.wf-studio-row-acts {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.wf-row-ic-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--bg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.14s ease;
}

.wf-row-ic-btn:hover:not(:disabled) {
  background: var(--bg-soft-pad);
  border-color: var(--bg-border-strong);
  color: var(--bg-text);
}

.wf-row-ic-btn.is-danger:hover:not(:disabled) {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bd);
  color: var(--sem-rose-bright);
}

.wf-row-ic-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.wf-studio-add-step-card {
  width: 100%;
  min-height: 40px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px dashed var(--bg-border-strong);
  background: transparent;
  color: var(--bg-text-sec);
  font-size: 12.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  transition: all 0.16s ease;
}

.wf-studio-add-step-card:hover {
  border-color: var(--theme-pri-bd);
  background: var(--bg-hover);
  color: var(--theme-pri-bright);
}

.wf-studio-add-hint {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--bg-text-muted);
}

/* STUDIO STICKY FOOTER */
.wf-modal-footer.is-studio-foot {
  padding: 12px 20px;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.wf-studio-foot-left,
.wf-studio-foot-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wf-studio-kbd-hint {
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

/* CUSTOMER PICKER SUB-MODAL LIST */
.wf-picker-top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wf-picker-rows-list {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 2px;
}

.wf-picker-row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--bg-border);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.wf-picker-row-item:hover {
  border-color: var(--bg-border-strong);
  background: var(--bg-hover);
}

.wf-picker-row-item.is-selected {
  border-color: var(--theme-pri-bd);
  background: var(--theme-pri-bg);
}

.wf-picker-row-main {
  min-width: 0;
  flex: 1;
}

.wf-picker-row-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--bg-text);
  overflow: hidden;
  text-overflow: ellipsis;
}

.wf-picker-row-sub {
  font-size: 11.5px;
  color: var(--bg-text-muted);
  margin-top: 2px;
}

.wf-picker-row-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.wf-picker-choose-btn {
  height: 27px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-well);
  color: var(--bg-text-sec);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}

.wf-picker-choose-btn.is-selected,
.wf-picker-row-item:hover .wf-picker-choose-btn {
  background: var(--theme-pri-grad);
  border-color: transparent;
  color: #ffffff;
}

@media (max-width: 1100px) {
  .wf-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  .wf-modal-card,
  .wf-modal-card.wf-modal-md,
  .wf-modal-card.wf-modal-lg,
  .wf-modal-card.wf-modal-studio {
    max-width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
  .wf-modal-grab {
    display: block;
    width: 38px;
    height: 4px;
    border-radius: 999px;
    background: var(--bg-border-strong);
    margin: 8px auto 0;
    flex-shrink: 0;
  }
}

@media (max-width: 980px) {
  .wf-studio-body-grid {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
  .wf-studio-col {
    height: auto;
    overflow: visible;
  }
  .wf-studio-col-scroll {
    overflow: visible;
  }
}

@media (max-width: 768px) {
  .bg-hide-sm {
    display: none !important;
  }
  .wf-studio-header,
  .wf-modal-footer.is-studio-foot {
    padding: 11px 14px;
  }
  .wf-studio-body-grid {
    padding: 12px 14px;
    gap: 12px;
  }
  .wf-toolbar-right {
    width: 100%;
    justify-content: stretch;
  }
  .wf-slim-search {
    max-width: none;
    flex: 1 1 180px;
  }
  .wf-form-row-2,
  .wf-scope-choice-grid {
    grid-template-columns: 1fr;
  }
  .wf-studio-step-row {
    flex-wrap: wrap;
  }
  .wf-studio-step-inp {
    flex: 1 1 180px;
  }
  .bg-input,
  .bg-search-inp {
    font-size: 16px;
  }
}
</style>
