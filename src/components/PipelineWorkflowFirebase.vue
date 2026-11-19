<template>
  <div
    class="wf-designer-root"
    :class="{
      'theme-light-blue': effectiveTheme === 'light',
      'theme-custom-glass': effectiveTheme === 'custom'
    }"
  >
    <!-- =========================================================
         MOBILE UNIFIED 1-ROW SEARCH + REFRESH + THEME CYCLE (TAB WORKFLOW)
         ========================================================= -->
    <div class="wf-mob-unified-bar">
      <div
        class="bg-search-shell wf-mob-search-shell"
        :class="{ 'has-query': Boolean(workflowSearch && workflowSearch.trim()) }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input
          v-model="workflowSearch"
          type="text"
          class="bg-search-inp"
          placeholder="Tìm tên Workflow, tên bước..."
        />
        <span
          v-if="workflowSearch && workflowSearch.trim()"
          class="wf-mob-match-pill wf-tabular"
          :class="{ 'is-zero': filteredWorkflowGroups.length === 0 && !showBaselineCard }"
        >
          {{ filteredWorkflowGroups.length + (showBaselineCard ? 1 : 0) }}
        </span>
        <button
          v-if="workflowSearch"
          type="button"
          class="bg-search-clr"
          aria-label="Xóa tìm kiếm"
          @click="workflowSearch = ''"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <button
        type="button"
        class="wf-mob-sq-btn"
        :disabled="loading"
        title="Làm mới dữ liệu"
        aria-label="Làm mới dữ liệu"
        @click="refreshAllData"
      >
        <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
        <span v-else class="wf-spinner-sm"></span>
      </button>

      <button
        type="button"
        class="wf-mob-sq-btn is-theme-btn"
        title="Đổi chế độ giao diện"
        aria-label="Đổi chế độ giao diện"
        @click="emit('cycle-theme', $event)"
      >
        <svg v-if="effectiveTheme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        <svg v-else-if="effectiveTheme === 'light'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
      </button>
    </div>

    <div class="wf-mob-section-bar">
      <div class="wf-mob-sec-left">
        <svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="wf-toolbar-ic"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        <span class="wf-mob-sec-title">Danh Sách Workflow</span>
        <span class="wf-mob-sec-cnt wf-tabular">{{ filteredWorkflowGroups.length + (showBaselineCard ? 1 : 0) }}</span>
      </div>
      <button
        type="button"
        class="wf-mob-create-btn"
        :disabled="saving"
        @click="openWorkflowStudioCreate()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Tạo mới</span>
      </button>
    </div>

    <!-- =========================================================
         MINIMALIST SINGLE-BAR WORKFLOW COMMAND STRIP (UNIFIED WORKFLOWS)
         ========================================================= -->
    <div class="wf-minimal-toolbar">
      <div class="wf-toolbar-heading">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="wf-toolbar-ic"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        <span class="wf-toolbar-title">Danh Sách Workflow</span>
        <span class="wf-card-mini-pill is-sky wf-tabular" style="margin-left: 2px;">{{ unifiedWorkflowGroups.length + 1 }}</span>
      </div>

      <div class="wf-toolbar-right">
        <div class="bg-search-shell wf-slim-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            v-model="workflowSearch"
            type="text"
            class="bg-search-inp"
            placeholder="Tìm tên Workflow, tên bước..."
          />
          <button
            v-if="workflowSearch"
            type="button"
            class="bg-search-clr"
            aria-label="Xóa tìm kiếm"
            @click="workflowSearch = ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <button
          type="button"
          class="wf-btn wf-btn-primary wf-btn-sm"
          :disabled="saving"
          @click="openWorkflowStudioCreate()"
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
    <div v-if="loading && items.length === 0" class="wf-empty-card">
      <div class="wf-spinner-lg"></div>
      <div class="wf-empty-title">Đang tải danh sách Workflow...</div>
    </div>

    <!-- =========================================================
         UNIFIED WORKFLOW DIRECTORY (CUSTOMER-FREE, REUSABLE ACROSS ALL PROJECTS)
         ========================================================= -->
    <div v-else class="wf-flat-list">
      <!-- SYSTEM BASELINE FLOW CARD -->
      <div
        v-if="showBaselineCard"
        id="wf-card-WF_DEFAULT"
        class="wf-flat-card is-clickable"
        :class="{ 'is-nav-highlighted': highlightedWorkflowId === 'WF_DEFAULT' }"
        title="Nhấn để xem chi tiết và sửa tên Workflow Chuẩn Hệ Thống"
        @click="openWorkflowStudioBaseline(true)"
      >
        <div class="wf-flat-head">
          <div class="wf-flat-meta">
            <span class="wf-flat-name">{{ defaultWorkflowName }}</span>
            <span class="wf-card-mini-pill is-slate">Mặc định hệ thống</span>
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
              @click.stop="emitOpenKanban('WF_DEFAULT')"
            >
              Mở Công Việc ↗
            </button>

            <button
              type="button"
              class="wf-ghost-ic-btn"
              title="Nhân bản thành Workflow mới"
              aria-label="Nhân bản thành Workflow mới"
              @click.stop="openWorkflowStudioCreate(STANDARD_FLOW_STEPS, 'Workflow — Bản sao Chuẩn')"
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

      <!-- EMPTY SEARCH -->
      <div
        v-if="filteredWorkflowGroups.length === 0 && !showBaselineCard"
        class="wf-empty-card"
      >
        <div class="wf-empty-title">Không tìm thấy Workflow nào phù hợp</div>
        <div class="wf-empty-sub">Hãy thử từ khóa khác theo tên Workflow, tên bước hoặc nhấn Tạo Workflow mới.</div>
        <button
          type="button"
          class="wf-btn wf-btn-primary wf-btn-sm"
          style="margin-top: 6px;"
          @click="openWorkflowStudioCreate()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Tạo Workflow Mới</span>
        </button>
      </div>

      <!-- ALL WORKFLOW CARDS (UNIFIED, CUSTOMER-FREE) -->
      <div
        v-for="group in filteredWorkflowGroups"
        :id="'wf-card-' + group.id_workflow"
        :key="'wf-' + group.id_workflow"
        class="wf-flat-card is-clickable"
        :class="{ 'is-nav-highlighted': highlightedWorkflowId === group.id_workflow }"
        title="Nhấn vào thẻ để mở chỉnh sửa Workflow toàn diện"
        @click="openWorkflowStudioEdit(group)"
      >
        <div class="wf-flat-head">
          <div class="wf-flat-meta">
            <span class="wf-flat-name">{{ group.name_workflow || 'Workflow chưa đặt tên' }}</span>
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
              class="wf-flat-txt-btn is-edit-btn"
              title="Mở modal chỉnh sửa các bước của Workflow này"
              @click.stop="openWorkflowStudioEdit(group)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Sửa</span>
            </button>

            <button
              type="button"
              class="wf-flat-txt-btn"
              title="Mở Workflow này trên tab Công Việc Pipeline"
              @click.stop="emitOpenKanban(group.id_workflow)"
            >
              Mở Công Việc ↗
            </button>

            <button
              type="button"
              class="wf-ghost-ic-btn"
              title="Nhân bản Workflow này"
              aria-label="Nhân bản Workflow này"
              @click.stop="openWorkflowStudioClone(group)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>

            <button
              type="button"
              class="wf-ghost-ic-btn is-danger"
              title="Xóa Workflow này"
              aria-label="Xóa Workflow này"
              @click.stop="confirmDeleteWorkflowGroup(group)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <div class="wf-flat-track-scroll">
          <draggable
            v-model="group.statuses"
            :group="'wf-grp-' + group.id_workflow"
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
         MODAL 0: STEP 1 — NHẬP TÊN WORKFLOW TRƯỚC KHI MỞ MODAL LỚN
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showCreateNameModal"
        class="bg-modal-overlay wf-modal-overlay is-create-name-overlay"
        :class="{
          'theme-light-blue': effectiveTheme === 'light',
          'theme-custom-glass': effectiveTheme === 'custom'
        }"
        @click.self="closeCreateNameModal"
      >
        <div class="wf-modal-card" role="dialog" aria-modal="true">
          <div class="wf-modal-grab" aria-hidden="true"></div>
          <div class="wf-modal-header">
            <div class="wf-modal-title-wrap">
              <div class="wf-modal-ic is-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div>
                <h3 class="wf-modal-title">
                  {{ isCloneNameModal ? 'Nhân Bản Workflow' : 'Tạo Workflow Mới' }}
                </h3>
                <p class="wf-modal-sub">
                  Nhập tên Workflow trước khi mở màn hình thiết kế các bước tiến độ
                </p>
              </div>
            </div>
            <button type="button" class="wf-modal-close" aria-label="Đóng" @click="closeCreateNameModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="wf-modal-body">
            <div class="wf-field">
              <label class="wf-label">
                Tên Workflow <span class="wf-req">*</span>
              </label>
              <input
                ref="createNameInputRef"
                v-model="createNameDraft"
                type="text"
                class="bg-input wf-input-hero-title"
                placeholder="VD: Quy trình Đấu thầu / Bán thương mại / Gia hạn License..."
                @keydown.enter.prevent="confirmCreateNameAndOpenStudio"
              />
            </div>
          </div>

          <div class="wf-modal-footer">
            <button type="button" class="wf-btn wf-btn-slate" @click="closeCreateNameModal">
              Hủy
            </button>
            <button type="button" class="wf-btn wf-btn-primary" @click="confirmCreateNameAndOpenStudio">
              <span>Tiếp tục thiết kế bước</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
              <div class="wf-modal-ic is-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div class="wf-studio-head-titles">
                <div class="wf-studio-title-row">
                  <h3 class="wf-modal-title">
                    {{
                      studioMode === 'baseline'
                        ? defaultWorkflowName
                        : studioMode === 'edit'
                          ? 'Chỉnh Sửa Workflow'
                          : 'Tạo Workflow Mới'
                    }}
                  </h3>
                  <div class="wf-studio-pills">
                    <span v-if="studioMode === 'baseline'" class="wf-ctx-pill is-sky">
                      Chuẩn Hệ Thống
                    </span>
                    <span
                      v-else-if="studioMode === 'edit' && studioOriginalGroup?.workflow_scope === 'project'"
                      class="wf-ctx-pill is-sky"
                    >
                      Workflow riêng của Dự án
                    </span>
                    <span class="wf-ctx-pill is-slate wf-tabular">{{ studioForm.steps.length }} bước</span>
                    <span v-if="studioActiveDealCount > 0" class="wf-ctx-pill is-amber wf-tabular">
                      {{ studioActiveDealCount }} công việc đang chạy
                    </span>
                  </div>
                </div>
                <p class="wf-modal-sub">
                  {{
                    studioMode === 'baseline'
                      ? 'Đổi tên hiển thị trong Kho Workflow và xem cấu trúc 5 bước chuẩn dùng chung trên toàn hệ thống'
                      : studioMode === 'edit' && studioOriginalGroup?.workflow_scope === 'project'
                        ? 'Chỉnh sửa tên & các bước riêng trong Dự án này — không ảnh hưởng tới Kho Workflow hay Dự án khác'
                        : studioMode === 'edit'
                          ? 'Cập nhật tên quy trình và kéo-thả sắp xếp chuỗi bước tiến độ trong một lần lưu'
                          : 'Đặt tên quy trình ở cột trái và thiết kế chuỗi bước tiến độ ở cột phải'
                  }}
                </p>
              </div>
            </div>

            <div class="wf-studio-head-right">
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
                 COLUMN 1 (LEFT ~38%): WORKFLOW IDENTITY & PRESET LOADER
                 =================================================== -->
            <section class="modal-group wf-studio-col wf-studio-col-left">
              <div class="modal-banner-header is-sky">
                <div class="modal-banner-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  <span>THÔNG TIN WORKFLOW</span>
                </div>
              </div>

              <div class="modal-group-body wf-studio-col-scroll">
                <!-- SYSTEM BASELINE RENAME + READ-ONLY INFO LEFT PANE -->
                <template v-if="studioMode === 'baseline'">
                  <div class="wf-field">
                    <div class="wf-customer-group-head">
                      <label class="wf-label">
                        Tên Workflow Mặc Định <span class="wf-req">*</span>
                      </label>
                      <button
                        v-if="String(studioForm.name_workflow || '').trim() !== DEFAULT_SYSTEM_WORKFLOW_NAME"
                        type="button"
                        class="wf-link-action-btn"
                        @click="studioForm.name_workflow = DEFAULT_SYSTEM_WORKFLOW_NAME"
                      >
                        Khôi phục tên gốc
                      </button>
                    </div>
                    <input
                      ref="studioNameInputRef"
                      v-model="studioForm.name_workflow"
                      type="text"
                      class="bg-input wf-input-hero-title"
                      placeholder="VD: Workflow Chuẩn Hệ Thống..."
                      @keydown.enter.prevent="submitBaselineWorkflowName"
                    />
                  </div>

                  <div class="wf-baseline-info-box">
                    <div class="wf-baseline-info-title">Khung vận hành mặc định toàn hệ thống</div>
                    <div class="wf-baseline-info-desc">
                      Các Dự án và Công việc chưa gắn Workflow khác sẽ chạy trên 5 bước chuẩn này (kèm 2 cột kết thúc <strong>100% Thành công</strong> và <strong>0% Thất bại</strong>).
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
                      @click="openWorkflowStudioCreate(STANDARD_FLOW_STEPS, 'Workflow — Bản sao Chuẩn')"
                    >
                      <div class="wf-sac-title">+ Nhân bản thành Workflow mới từ khung chuẩn</div>
                      <div class="wf-sac-sub">Tạo quy trình mới dựa trên 5 bước chuẩn để tùy biến và gắn vào các Dự án</div>
                    </button>
                  </div>
                </template>

                <!-- CREATE / EDIT LEFT PANE (PURE WORKFLOW — NO CUSTOMER FIELDS) -->
                <template v-else>
                  <!-- WORKFLOW NAME (#1 PRIMARY INPUT) -->
                  <div class="wf-field">
                    <label class="wf-label">
                      Tên Workflow <span class="wf-req">*</span>
                    </label>
                    <input
                      ref="studioNameInputRef"
                      v-model="studioForm.name_workflow"
                      type="text"
                      class="bg-input wf-input-hero-title"
                      placeholder="VD: Quy trình Đấu thầu / Bán thương mại / Gia hạn License..."
                    />
                  </div>

                  <!-- USAGE SUMMARY WHEN EDITING EXISTING WORKFLOW -->
                  <div v-if="studioMode === 'edit'" class="wf-edit-utility-box">
                    <div class="wf-edit-utility-row wf-tabular">
                      <span>Công việc đang chạy trên Workflow này:</span>
                      <strong>{{ studioActiveDealCount }} việc</strong>
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
                {{ studioMode === 'baseline' ? 'Ctrl + S lưu nhanh · Esc đóng' : 'Ctrl + S lưu nhanh · Kéo ⠿ để sắp xếp · Esc đóng' }}
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
                {{ studioMode === 'edit' && studioOriginalGroup?.workflow_scope === 'project' ? 'Lưu mẫu vào Kho' : 'Nhân bản' }}
              </button>
              <button
                type="button"
                class="wf-btn wf-btn-slate"
                :disabled="saving"
                @click="closeStudioModal"
              >
                Hủy
              </button>
              <button
                type="button"
                class="wf-btn wf-btn-primary"
                :disabled="saving"
                @click="studioMode === 'baseline' ? submitBaselineWorkflowName() : submitWorkflowStudio()"
              >
                <span v-if="saving" class="wf-spinner-sm"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>{{ studioMode === 'baseline' ? 'Lưu Tên' : studioMode === 'edit' ? 'Lưu Cập Nhật' : 'Lưu Workflow' }}</span>
              </button>
            </div>
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
import { getDatabase, ref as dbRef, get, update } from 'firebase/database'
import { useFullAppTheme } from '../composables/useAppTheme'

const props = defineProps({
  uiTheme: {
    type: String,
    default: ''
  },
  pipelinesExternal: {
    type: Array,
    default: () => []
  },
  workflowsExternal: {
    type: Array,
    default: () => []
  },
  defaultWorkflowNameExternal: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['updated', 'open-kanban-workflow', 'cycle-theme'])

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

const { uiTheme: globalFullTheme } = useFullAppTheme()

const effectiveTheme = computed(() => {
  if (props.uiTheme) return props.uiTheme
  return globalFullTheme.value
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

const DEFAULT_SYSTEM_WORKFLOW_NAME = 'Workflow Chuẩn Hệ Thống'

// STATE
const workflowSearch = ref('')
const items = ref([])
const internalPipelines = ref([])
const defaultWorkflowName = ref(DEFAULT_SYSTEM_WORKFLOW_NAME)
const loading = ref(false)
const saving = ref(false)
const isReordering = ref(false)
const isMobile = ref(false)
const swapSourceItem = ref(null)

const baselineBlueprint = computed(() => ({
  id_workflow: 'WF_DEFAULT',
  name_workflow: defaultWorkflowName.value || DEFAULT_SYSTEM_WORKFLOW_NAME,
  workflow_scope: 'template',
  statuses: STANDARD_FLOW_STEPS
}))

let stepUidSeed = 1
const makeStepUid = () => `wfst_${Date.now()}_${stepUidSeed++}`

// STEP 1 CREATE NAME MODAL STATE
const showCreateNameModal = ref(false)
const createNameDraft = ref('')
const initialCreateNameDraft = ref('')
const isCloneNameModal = ref(false)
const pendingCreateSeedSteps = ref(null)
const createNameInputRef = ref(null)

// UNIFIED WORKFLOW STUDIO MODAL STATE
const showStudioModal = ref(false)
const studioMode = ref('create') // 'create' | 'edit' | 'baseline'
const studioOriginalGroup = ref(null)
const studioNameInputRef = ref(null)
const focusedStepUid = ref('')
const openColorRowUid = ref('')
const openPctRowUid = ref('')
const initialStudioSnapshot = ref('')
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
  name_workflow: '',
  steps: []
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

const serializeStudioSnapshot = (form) => {
  if (!form) return ''
  return JSON.stringify({
    mode: studioMode.value,
    id: String(form.id_workflow || ''),
    name: String(form.name_workflow || '').trim(),
    steps: Array.isArray(form.steps)
      ? form.steps.map((s) => ({
          id: String(s.id_status_workflow || ''),
          name: String(s.status_name || '').trim(),
          pct: formatPercentStatus(s['%status']),
          color: String(s.status_color || '#3b82f6')
        }))
      : []
  })
}

const isCreateNameDirty = computed(() => {
  if (!showCreateNameModal.value) return false
  const cur = String(createNameDraft.value || '').trim()
  const init = String(initialCreateNameDraft.value || '').trim()
  return Boolean(cur && cur !== init)
})

const isStudioDirty = computed(() => {
  if (!showStudioModal.value) return false
  return serializeStudioSnapshot(studioForm.value) !== initialStudioSnapshot.value
})

const forceCloseCreateNameModal = () => {
  showCreateNameModal.value = false
  pendingCreateSeedSteps.value = null
  initialCreateNameDraft.value = ''
}

const closeCreateNameModal = async () => {
  if (isCreateNameDirty.value) {
    const ok = await askConfirm({
      title: 'Thoát khi chưa lưu tên Workflow?',
      targetTag: 'THAY ĐỔI CHƯA LƯU',
      targetValue: String(createNameDraft.value || '').trim() || 'Tạo Workflow Mới',
      message: 'Bạn đã nhập tên cho Workflow mới nhưng chưa hoàn tất tạo. Nếu thoát bây giờ, dữ liệu vừa nhập sẽ bị hủy bỏ.',
      tone: 'warning',
      confirmText: 'Bỏ thay đổi & Thoát',
      cancelText: 'Ở lại tiếp tục'
    })
    if (!ok) return false
  }
  forceCloseCreateNameModal()
  return true
}

const forceCloseStudioModal = () => {
  closeInlineStepPopovers()
  showStudioModal.value = false
  initialStudioSnapshot.value = ''
}

const closeStudioModal = async () => {
  if (isStudioDirty.value) {
    const targetLabel =
      String(studioForm.value.name_workflow || '').trim() ||
      (studioMode.value === 'baseline' ? defaultWorkflowName.value : 'Workflow đang chỉnh sửa')
    const ok = await askConfirm({
      title: 'Thoát khi chưa lưu thay đổi?',
      targetTag: 'THAY ĐỔI CHƯA LƯU',
      targetValue: targetLabel,
      message:
        studioMode.value === 'create'
          ? 'Workflow mới đang thiết kế chưa được lưu vào hệ thống. Nếu thoát bây giờ, toàn bộ thông tin và các bước vừa thiết lập sẽ bị hủy bỏ.'
          : 'Bạn đang có thay đổi tên hoặc chuỗi bước tiến độ chưa được lưu. Nếu thoát bây giờ, toàn bộ thay đổi sẽ bị hủy bỏ.',
      tone: 'warning',
      confirmText: 'Bỏ thay đổi & Thoát',
      cancelText: 'Ở lại tiếp tục'
    })
    if (!ok) return false
  }
  forceCloseStudioModal()
  return true
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
      workflow_scope: 'template',
      id_project: '',
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
    return {
      id_workflow: idWf,
      id_status_workflow: idSt,
      name_workflow: String(raw.name_workflow ?? ''),
      '%status': formatPercentStatus(raw['%status'] ?? raw.percent_status ?? ''),
      status_name: String(raw.status_name ?? ''),
      status_index: parseInt(raw.status_index ?? 0, 10) || 0,
      status_color: String(raw.status_color || '#3b82f6'),
      workflow_scope: raw.workflow_scope === 'project' ? 'project' : 'template',
      id_project: String(raw.id_project ?? ''),
      ma_khach_hang: '',
      ma_khach_hang_raw: '',
      ma_cong_ty: '',
      ten_khach_hang: '',
      ten_cong_ty: '',
      is_company_default: false,
      source_template_id: String(raw.source_template_id ?? ''),
      source_template_name: String(raw.source_template_name ?? '')
    }
  }
  return null
}

const toCleanWorkflowRecord = (item) => {
  return {
    id_workflow: String(item.id_workflow ?? ''),
    id_status_workflow: String(item.id_status_workflow ?? ''),
    name_workflow: String(item.name_workflow ?? ''),
    '%status': formatPercentStatus(item['%status']),
    status_name: String(item.status_name ?? ''),
    status_index: parseInt(item.status_index ?? 0, 10) || 0,
    status_color: String(item.status_color || '#3b82f6'),
    workflow_scope: item.workflow_scope === 'project' ? 'project' : 'template',
    id_project: String(item.id_project ?? ''),
    ma_khach_hang: '',
    ma_cong_ty: '',
    ten_khach_hang: '',
    ten_cong_ty: '',
    is_company_default: false,
    source_template_id: String(item.source_template_id ?? ''),
    source_template_name: String(item.source_template_name ?? '')
  }
}

// ALL WORKFLOW GROUPS (TEMPLATES + PROJECT-PRIVATE COPIES FOR STUDIO EDITING)
const allWorkflowGroups = computed(() => {
  const groupsMap = new Map()
  items.value.forEach((item) => {
    const wfId = item.id_workflow || 'UNKNOWN'
    if (!wfId || wfId === 'WF_DEFAULT') return
    if (!groupsMap.has(wfId)) {
      groupsMap.set(wfId, {
        id_workflow: wfId,
        name_workflow: item.name_workflow || 'Quy trình chưa đặt tên',
        workflow_scope: item.workflow_scope === 'project' ? 'project' : 'template',
        id_project: item.id_project || '',
        source_template_id: item.source_template_id || '',
        source_template_name: item.source_template_name || '',
        statuses: []
      })
    } else {
      const g = groupsMap.get(wfId)
      if (item.workflow_scope === 'project') g.workflow_scope = 'project'
      if (!g.id_project && item.id_project) g.id_project = item.id_project
      if (!g.source_template_id && item.source_template_id) g.source_template_id = item.source_template_id
      if (!g.source_template_name && item.source_template_name) g.source_template_name = item.source_template_name
    }
    groupsMap.get(wfId).statuses.push(item)
  })

  const result = Array.from(groupsMap.values())
  result.forEach((g) => {
    g.statuses.sort((a, b) => (parseInt(a.status_index, 10) || 0) - (parseInt(b.status_index, 10) || 0))
  })
  return result.sort((a, b) => (a.name_workflow || '').localeCompare(b.name_workflow || '', 'vi'))
})

// KHO WORKFLOW LIBRARY GROUPS (TEMPLATES ONLY — EXCLUDES PROJECT-PRIVATE COPIES)
const unifiedWorkflowGroups = computed(() =>
  allWorkflowGroups.value.filter((g) => g.workflow_scope !== 'project')
)

const filteredWorkflowGroups = computed(() => {
  const kw = workflowSearch.value.trim().toLowerCase()
  if (!kw) return unifiedWorkflowGroups.value
  return unifiedWorkflowGroups.value.filter(
    (g) =>
      (g.name_workflow && g.name_workflow.toLowerCase().includes(kw)) ||
      g.statuses.some((s) => s.status_name && s.status_name.toLowerCase().includes(kw))
  )
})

const showBaselineCard = computed(() => {
  const kw = workflowSearch.value.trim().toLowerCase()
  if (!kw) return true
  if ((defaultWorkflowName.value || '').toLowerCase().includes(kw)) return true
  if ('workflow chuẩn hệ thống mặc định'.includes(kw)) return true
  return STANDARD_FLOW_STEPS.some(
    (s) =>
      s.status_name.toLowerCase().includes(kw) ||
      (s.short_label && s.short_label.toLowerCase().includes(kw))
  )
})

const effectivePipelinesSource = computed(() =>
  props.pipelinesExternal && props.pipelinesExternal.length > 0
    ? props.pipelinesExternal
    : internalPipelines.value
)

watch(
  () => props.defaultWorkflowNameExternal,
  (extName) => {
    if (saving.value) return
    const clean = String(extName || '').trim()
    if (clean) {
      defaultWorkflowName.value = clean
    }
  },
  { immediate: true }
)

watch(
  () => props.workflowsExternal,
  (extList) => {
    if (saving.value || isReordering.value || !Array.isArray(extList)) return
    if (extList.length === 0 && items.value.length === 0) return
    items.value = extList
      .map((val, idx) => normalizeWorkflowRecord(val, val?.id_status_workflow || String(idx)))
      .filter(Boolean)
  },
  { deep: false }
)

// DATA FETCHING
const fetchWorkflows = async () => {
  loading.value = true
  try {
    const [snap, metaSnap] = await Promise.all([
      get(dbRef(database, 'pipeline_workflow')),
      get(dbRef(database, 'pipeline_workflow_meta/WF_DEFAULT'))
    ])
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

    if (metaSnap.exists()) {
      const metaVal = metaSnap.val()
      const customName = String(metaVal?.name_workflow || '').trim()
      defaultWorkflowName.value = customName || DEFAULT_SYSTEM_WORKFLOW_NAME
    } else if (props.defaultWorkflowNameExternal) {
      defaultWorkflowName.value = String(props.defaultWorkflowNameExternal).trim() || DEFAULT_SYSTEM_WORKFLOW_NAME
    } else {
      defaultWorkflowName.value = DEFAULT_SYSTEM_WORKFLOW_NAME
    }
  } catch (err) {
    console.error('Firebase error fetching workflows:', err)
    showToast('Không thể tải cấu hình Workflow', 'error')
  } finally {
    loading.value = false
  }
}

const fetchFallbackPipelinesIfNeeded = async () => {
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
  await Promise.all([fetchWorkflows(), fetchFallbackPipelinesIfNeeded()])
}

const getDealCountForWorkflow = (wfId) => {
  const normTarget = wfId || 'WF_DEFAULT'
  return effectivePipelinesSource.value.filter((p) => {
    if (!p) return false
    if (normTarget === 'WF_DEFAULT' && p.id_project && p.id_workflow !== 'WF_DEFAULT') return false
    const pWf = p.id_workflow || 'WF_DEFAULT'
    return pWf === normTarget
  }).length
}

const emitOpenKanban = (wfId, projId = '') => {
  emit('open-kanban-workflow', {
    id_workflow: wfId || 'WF_DEFAULT',
    id_project: projId || '',
    customer: null
  })
}

// =========================================================
// UNIFIED 2-COLUMN WORKFLOW STUDIO MODAL LOGIC
// =========================================================
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

const openWorkflowStudioBaseline = (focusName = false) => {
  closeInlineStepPopovers()
  forceCloseCreateNameModal()
  studioMode.value = 'baseline'
  studioOriginalGroup.value = baselineBlueprint.value
  focusedStepUid.value = ''
  studioForm.value = {
    id_workflow: 'WF_DEFAULT',
    name_workflow: defaultWorkflowName.value || DEFAULT_SYSTEM_WORKFLOW_NAME,
    steps: mapRawStepsToStudioRows(STANDARD_FLOW_STEPS, false)
  }
  initialStudioSnapshot.value = serializeStudioSnapshot(studioForm.value)
  showStudioModal.value = true
  if (focusName === true) {
    nextTick(() => {
      if (studioNameInputRef.value && typeof studioNameInputRef.value.focus === 'function') {
        studioNameInputRef.value.focus()
        if (typeof studioNameInputRef.value.select === 'function') {
          studioNameInputRef.value.select()
        }
      }
    })
  }
}

const openWorkflowStudioCreate = async (seedSteps = null, suggestedName = '') => {
  if (showStudioModal.value) {
    const canClose = await closeStudioModal()
    if (!canClose) return
  } else {
    closeInlineStepPopovers()
  }
  pendingCreateSeedSteps.value = Array.isArray(seedSteps) && seedSteps.length > 0 ? [...seedSteps] : null
  isCloneNameModal.value = Boolean(suggestedName)
  createNameDraft.value = suggestedName || ''
  initialCreateNameDraft.value = String(suggestedName || '').trim()
  showCreateNameModal.value = true

  nextTick(() => {
    if (createNameInputRef.value && typeof createNameInputRef.value.focus === 'function') {
      createNameInputRef.value.focus()
      if (suggestedName && typeof createNameInputRef.value.select === 'function') {
        createNameInputRef.value.select()
      }
    }
  })
}

const confirmCreateNameAndOpenStudio = () => {
  const cleanName = String(createNameDraft.value || '').trim()
  if (!cleanName) {
    showToast('Vui lòng nhập Tên Workflow!', 'error')
    nextTick(() => {
      if (createNameInputRef.value && typeof createNameInputRef.value.focus === 'function') {
        createNameInputRef.value.focus()
      }
    })
    return
  }

  const seed = pendingCreateSeedSteps.value || STANDARD_FLOW_STEPS
  forceCloseCreateNameModal()

  closeInlineStepPopovers()
  studioMode.value = 'create'
  studioOriginalGroup.value = null
  focusedStepUid.value = ''
  studioForm.value = {
    id_workflow: '',
    name_workflow: cleanName,
    steps: mapRawStepsToStudioRows(seed, false)
  }
  initialStudioSnapshot.value = '__UNSAVED_NEW_WORKFLOW__'
  showStudioModal.value = true
}

const openWorkflowStudioEdit = (group, focusStepId = '') => {
  if (!group || group.id_workflow === 'WF_DEFAULT') {
    openWorkflowStudioBaseline(true)
    return
  }
  closeInlineStepPopovers()
  forceCloseCreateNameModal()
  studioMode.value = 'edit'
  studioOriginalGroup.value = group

  const mappedSteps = mapRawStepsToStudioRows(group.statuses, true)
  studioForm.value = {
    id_workflow: group.id_workflow,
    name_workflow: group.name_workflow || '',
    steps: mappedSteps
  }
  initialStudioSnapshot.value = serializeStudioSnapshot(studioForm.value)

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

const highlightedWorkflowId = ref('')
let highlightedWorkflowTimer = null

const locateWorkflowCard = async (wfId) => {
  const cleanId = String(wfId || 'WF_DEFAULT').trim() || 'WF_DEFAULT'
  if (workflowSearch.value.trim()) {
    const isMatched =
      cleanId === 'WF_DEFAULT'
        ? showBaselineCard.value
        : filteredWorkflowGroups.value.some((g) => g.id_workflow === cleanId)
    if (!isMatched) {
      workflowSearch.value = ''
    }
  }

  if (cleanId !== 'WF_DEFAULT' && !unifiedWorkflowGroups.value.some((g) => g.id_workflow === cleanId)) {
    await fetchWorkflows()
  }

  if (highlightedWorkflowTimer) {
    clearTimeout(highlightedWorkflowTimer)
    highlightedWorkflowTimer = null
  }
  highlightedWorkflowId.value = ''

  nextTick(() => {
    setTimeout(() => {
      highlightedWorkflowId.value = cleanId
      if (typeof document !== 'undefined') {
        const el = document.getElementById(`wf-card-${cleanId}`)
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      highlightedWorkflowTimer = setTimeout(() => {
        if (highlightedWorkflowId.value === cleanId) {
          highlightedWorkflowId.value = ''
        }
      }, 3200)
    }, 45)
  })
}

const openWorkflowById = async (wfId) => {
  const cleanId = String(wfId || '').trim()
  if (!cleanId || cleanId === 'WF_DEFAULT') {
    openWorkflowStudioBaseline(true)
    return
  }
  let group = allWorkflowGroups.value.find((g) => g.id_workflow === cleanId)
  if (!group) {
    await fetchWorkflows()
    group = allWorkflowGroups.value.find((g) => g.id_workflow === cleanId)
  }
  if (group) {
    openWorkflowStudioEdit(group)
  } else {
    showToast('Không tìm thấy thông tin Workflow cần sửa', 'error')
  }
}

const openWorkflowStudioAddStep = (group) => {
  openWorkflowStudioEdit(group)
  nextTick(() => {
    addStudioStepRow()
  })
}

const openWorkflowStudioClone = (group) => {
  if (!group) return
  openWorkflowStudioCreate(
    group.statuses,
    `${group.name_workflow || 'Workflow'} (Bản sao)`
  )
}

const cloneFromCurrentStudio = () => {
  const isBaseline = studioMode.value === 'baseline'
  const baseName = isBaseline
    ? (defaultWorkflowName.value && defaultWorkflowName.value !== DEFAULT_SYSTEM_WORKFLOW_NAME
        ? `${defaultWorkflowName.value} (Bản sao)`
        : 'Workflow — Bản sao Chuẩn')
    : `${studioForm.value.name_workflow || 'Workflow'} (Bản sao)`

  openWorkflowStudioCreate(studioForm.value.steps, baseName)
}

const openKanbanFromStudio = async () => {
  const wfId = studioMode.value === 'baseline' ? 'WF_DEFAULT' : studioForm.value.id_workflow || 'WF_DEFAULT'
  const projId =
    studioMode.value === 'edit' && studioOriginalGroup.value?.workflow_scope === 'project'
      ? String(studioOriginalGroup.value.id_project || '')
      : ''
  const closed = await closeStudioModal()
  if (!closed) return
  emitOpenKanban(wfId, projId)
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
  const stepLabel = `${formatPercentStatus(st['%status'])} — ${String(st.status_name || '').trim() || 'Bước #' + (index + 1)}`
  const ok = await askConfirm(
    activeCount > 0
      ? {
          title: 'Xóa bước đang có Công việc?',
          targetTag: 'BƯỚC TRONG WORKFLOW',
          targetValue: stepLabel,
          message: `Hiện có ${activeCount} Công việc Pipeline đang nằm ở bước này. Khi bạn nhấn Lưu Cập Nhật, các công việc đó sẽ được tự động chuyển sang bước gần nhất theo % tiến độ.`,
          tone: 'danger',
          confirmText: 'Xóa bước này',
          cancelText: 'Giữ lại'
        }
      : {
          title: 'Xóa bước tiến độ này?',
          targetTag: 'BƯỚC TRONG WORKFLOW',
          targetValue: stepLabel,
          message: 'Bạn có chắc chắn muốn xóa bước tiến độ này khỏi chuỗi quy trình không?',
          tone: 'danger',
          confirmText: 'Xóa bước này',
          cancelText: 'Hủy'
        }
  )
  if (!ok) return
  studioForm.value.steps.splice(index, 1)
}

const submitBaselineWorkflowName = async () => {
  if (studioMode.value !== 'baseline' || saving.value) return
  const cleanName = String(studioForm.value.name_workflow || '').trim()
  if (!cleanName) {
    showToast('Vui lòng nhập Tên Workflow mặc định!', 'error')
    if (studioNameInputRef.value) studioNameInputRef.value.focus()
    return
  }

  const prevName = defaultWorkflowName.value
  defaultWorkflowName.value = cleanName
  forceCloseStudioModal()

  saving.value = true
  try {
    await update(dbRef(database, 'pipeline_workflow_meta/WF_DEFAULT'), {
      id_workflow: 'WF_DEFAULT',
      name_workflow: cleanName,
      updated_at: new Date().toISOString()
    })
    showToast('Đã đổi tên Workflow mặc định!', 'success')
    emit('updated', { defaultWorkflowName: cleanName })
  } catch (err) {
    console.error('Lỗi lưu tên Workflow mặc định:', err)
    defaultWorkflowName.value = prevName
    showToast('Lỗi mạng khi lưu tên Workflow mặc định', 'error')
  } finally {
    saving.value = false
  }
}

const submitWorkflowStudio = async () => {
  if (studioMode.value === 'baseline' || saving.value) return

  const isEdit = studioMode.value === 'edit'
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

  const nowTs = Date.now()
  const wfId =
    isEdit && studioForm.value.id_workflow
      ? studioForm.value.id_workflow
      : `WF_${nowTs.toString(36)}_${Math.random().toString(36).substring(2, 5)}`
  const isProjectScoped = isEdit && studioOriginalGroup.value?.workflow_scope === 'project'
  const preservedProjId = isProjectScoped ? String(studioOriginalGroup.value?.id_project || '') : ''
  const preservedSrcId = isProjectScoped ? String(studioOriginalGroup.value?.source_template_id || '') : ''
  const preservedSrcName = isProjectScoped ? String(studioOriginalGroup.value?.source_template_name || '') : ''

  const wfUpdates = {}
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
      workflow_scope: isProjectScoped ? 'project' : 'template',
      id_project: preservedProjId,
      ma_khach_hang: '',
      ma_cong_ty: '',
      ten_khach_hang: '',
      ten_cong_ty: '',
      is_company_default: false,
      source_template_id: preservedSrcId,
      source_template_name: preservedSrcName
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
  forceCloseStudioModal()

  saving.value = true
  try {
    await update(dbRef(database, 'pipeline_workflow'), wfUpdates)

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

const cleanupDeletedPipesLinksInFirebase = async (deletedEntries = []) => {
  if (!Array.isArray(deletedEntries) || deletedEntries.length === 0) return
  await Promise.all(
    deletedEntries.map(async ({ pipeId, reportIdStr, qlfIdStr }) => {
      if (!pipeId) return
      const repIds = String(reportIdStr || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const qlfIds = String(qlfIdStr || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      await Promise.all([
        ...repIds.map(async (repId) => {
          try {
            const repRef = dbRef(database, 'REPORT/' + sanitizeFirebaseKey(repId))
            const snap = await get(repRef)
            if (!snap.exists()) return
            const repVal = snap.val()
            if (Array.isArray(repVal)) {
              const cur = String(repVal[11] || '')
                .split(',')
                .map((s) => s.trim())
                .filter((x) => x && x !== pipeId)
              repVal[11] = cur[0] || ''
              await set(repRef, repVal)
            } else if (repVal && typeof repVal === 'object') {
              const rawField = repVal.id_pipeline ?? repVal.ID_PIPELINE ?? ''
              const cur = String(rawField)
                .split(',')
                .map((s) => s.trim())
                .filter((x) => x && x !== pipeId)
              const singleRemaining = cur[0] || ''
              const updates = { id_pipeline: singleRemaining }
              if ('ID_PIPELINE' in repVal) updates.ID_PIPELINE = singleRemaining
              await update(repRef, updates)
            }
          } catch (e) {
            console.error('Lỗi gỡ liên kết REPORT khi xóa Workflow:', repId, e)
          }
        }),
        ...qlfIds.map(async (qlfId) => {
          try {
            const qlfRef = dbRef(database, 'quan_ly_file/' + sanitizeFirebaseKey(qlfId))
            const snap = await get(qlfRef)
            if (!snap.exists()) return
            const qlfVal = snap.val()
            if (qlfVal && typeof qlfVal === 'object' && !Array.isArray(qlfVal)) {
              const rawField = qlfVal.id_pipeline ?? qlfVal.ID_PIPELINE ?? ''
              const next = String(rawField)
                .split(',')
                .map((s) => s.trim())
                .filter((x) => x && x !== pipeId)
              const joined = next.join(', ')
              const updates = { id_pipeline: joined }
              if ('ID_PIPELINE' in qlfVal) updates.ID_PIPELINE = joined
              await update(qlfRef, updates)
            }
          } catch (e) {
            console.error('Lỗi gỡ liên kết quan_ly_file khi xóa Workflow:', qlfId, e)
          }
        })
      ])
    })
  )
}

const confirmDeleteWorkflowGroup = async (group) => {
  if (!group) return
  const isProjectScoped = group.workflow_scope === 'project'
  const dealCount = getDealCountForWorkflow(group.id_workflow)
  const ok = await askConfirm({
    title: isProjectScoped ? 'Xóa Workflow khỏi Dự án?' : 'Xóa Workflow?',
    targetTag: isProjectScoped ? 'WORKFLOW TRONG DỰ ÁN' : 'WORKFLOW',
    targetValue: `${group.name_workflow} (${group.statuses.length} bước)`,
    message:
      dealCount > 0
        ? `Workflow này đang có ${dealCount} Công việc Pipeline. Nếu xóa, toàn bộ ${dealCount} công việc bên trong cũng sẽ bị xóa vĩnh viễn theo Workflow này (không chuyển sang Workflow khác).`
        : isProjectScoped
          ? 'Bạn có chắc chắn muốn xóa vĩnh viễn Workflow riêng này khỏi Dự án không?'
          : 'Bạn có chắc chắn muốn xóa vĩnh viễn Workflow này khỏi Kho Workflow không?',
    tone: 'danger',
    confirmText: dealCount > 0 ? `Xóa Workflow & ${dealCount} việc` : 'Xóa Workflow',
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

    if (isProjectScoped && group.id_project) {
      const projKey = sanitizeFirebaseKey(group.id_project)
      const projSnap = await get(dbRef(database, `pipeline_projects/${projKey}`))
      if (projSnap.exists()) {
        const rawProj = projSnap.val() || {}
        const rawLinked = Array.isArray(rawProj.linked_workflow_ids)
          ? rawProj.linked_workflow_ids
          : rawProj.linked_workflow_ids && typeof rawProj.linked_workflow_ids === 'object'
            ? Object.values(rawProj.linked_workflow_ids)
            : []
        const rawExcluded = Array.isArray(rawProj.excluded_workflow_ids)
          ? rawProj.excluded_workflow_ids
          : rawProj.excluded_workflow_ids && typeof rawProj.excluded_workflow_ids === 'object'
            ? Object.values(rawProj.excluded_workflow_ids)
            : []
        const nextLinked = rawLinked
          .map((v) => String(v || '').trim())
          .filter((v) => v && v !== group.id_workflow)
        const nextExcluded = Array.from(
          new Set([...rawExcluded.map((v) => String(v || '').trim()).filter(Boolean), 'WF_DEFAULT'])
        )
        const nextDefault =
          rawProj.default_workflow_id === group.id_workflow
            ? nextLinked[0] || ''
            : String(rawProj.default_workflow_id || '')
        await update(dbRef(database, `pipeline_projects/${projKey}`), {
          linked_workflow_ids: nextLinked,
          excluded_workflow_ids: nextExcluded,
          default_workflow_id: nextDefault
        })
      }
    }

    const pipeSnap = await get(dbRef(database, 'pipeline'))
    if (pipeSnap.exists()) {
      const rawPipes = pipeSnap.val()
      const pipeDeletes = {}
      const deletedEntries = []
      Object.entries(rawPipes || {}).forEach(([pKey, pVal]) => {
        if (!pVal || typeof pVal !== 'object' || pVal.id_workflow !== group.id_workflow) return
        pipeDeletes[pKey] = null
        deletedEntries.push({
          pipeId: String(pVal.Id_pipeline || pKey).trim(),
          reportIdStr: String(pVal.report_id || ''),
          qlfIdStr: String(pVal.id_quanlyfile || '')
        })
      })
      if (Object.keys(pipeDeletes).length > 0) {
        await update(dbRef(database, 'pipeline'), pipeDeletes)
        internalPipelines.value = internalPipelines.value.filter(
          (p) => p && p.id_workflow !== group.id_workflow
        )
        await cleanupDeletedPipesLinksInFirebase(deletedEntries)
      }
    }

    showToast(
      dealCount > 0 ? `Đã xóa Workflow và ${dealCount} công việc bên trong!` : 'Đã xóa Workflow!',
      'success'
    )
    emit('updated')
  } catch (err) {
    console.error('Lỗi xóa Workflow:', err)
    items.value = backup
    showToast('Lỗi mạng khi xóa Workflow', 'error')
  } finally {
    saving.value = false
  }
}

const deleteWorkflowFromStudio = async () => {
  if (studioMode.value !== 'edit' || !studioForm.value.id_workflow) return
  const liveGroup =
    allWorkflowGroups.value.find((g) => g.id_workflow === studioForm.value.id_workflow) ||
    studioOriginalGroup.value
  if (!liveGroup) return

  await confirmDeleteWorkflowGroup(liveGroup)
  if (!items.value.some((i) => i.id_workflow === liveGroup.id_workflow)) {
    forceCloseStudioModal()
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
    if (showStudioModal.value && !dialogState.value.open) {
      e.preventDefault()
      if (studioMode.value === 'baseline') {
        submitBaselineWorkflowName()
      } else {
        submitWorkflowStudio()
      }
      return
    }
  }

  if (e.key === 'Escape') {
    if (dialogState.value.open) {
      e.preventDefault()
      closeDialog(false)
      return
    }
    if (showCreateNameModal.value) {
      e.preventDefault()
      closeCreateNameModal()
      return
    }
    if (openColorRowUid.value || openPctRowUid.value) {
      e.preventDefault()
      closeInlineStepPopovers()
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

defineExpose({
  openWorkflowById,
  locateWorkflowCard,
  openCreateWorkflow: () => openWorkflowStudioCreate(),
  isAnyModalOpen: () => Boolean(showStudioModal.value || showCreateNameModal.value || dialogState.value.open),
  hasUnsavedChanges: () => Boolean(isStudioDirty.value || isCreateNameDirty.value)
})

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
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.wf-mob-unified-bar,
.wf-mob-section-bar {
  display: none;
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
  z-index: 100042;
  background: var(--bg-overlay);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--bg-text);
  color-scheme: var(--bg-scheme);
}

.wf-modal-overlay.is-create-name-overlay {
  z-index: 100046;
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

.wf-modal-card.wf-modal-sm {
  max-width: 460px;
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
  z-index: 100150;
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
  padding: 10px 14px;
  border-radius: 13px;
  background: var(--bg-glass-panel);
  border: 1px solid var(--bg-glass-border);
  box-shadow: var(--bg-shadow-panel), inset 0 1px 0 var(--bg-specular);
  backdrop-filter: blur(var(--cg-blur, 16px));
}

.wf-toolbar-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.wf-toolbar-ic {
  color: var(--theme-pri-bright);
  flex-shrink: 0;
}

.wf-toolbar-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--bg-text);
  letter-spacing: 0.01em;
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
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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

.wf-flat-txt-btn.is-edit-btn {
  gap: 4.5px;
  color: var(--sem-sky-bright);
  border-color: var(--sem-sky-bd);
  background: var(--sem-sky-bg);
}

.wf-flat-txt-btn.is-edit-btn:hover {
  filter: brightness(1.06);
  color: var(--sem-sky-bright);
  border-color: var(--sem-sky-bright);
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
  background: var(--bg-chip-rest);
  border: 1px solid var(--bg-chip-rest-bd);
  border-left: 3.5px solid var(--step-clr, #3b82f6);
  color: var(--bg-text);
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: grab;
  user-select: none;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
}

.wf-flat-step-chip .wf-step-dot {
  background: var(--step-clr, #3b82f6);
}

.wf-flat-step-chip:hover:not(.is-readonly) {
  border-color: var(--bg-border-strong);
  border-left-color: var(--step-clr, #3b82f6);
  background: var(--bg-hover);
  box-shadow: 0 3px 8px -2px rgba(15, 23, 42, 0.22);
}

.wf-flat-step-chip:active:not(.is-readonly) {
  cursor: grabbing;
}

.wf-flat-step-chip.is-readonly {
  cursor: default;
}

.wf-flat-step-chip.is-flash {
  border-color: var(--sem-emerald-bright);
  border-left-color: var(--step-clr, #3b82f6);
  box-shadow: 0 0 0 2px var(--sem-emerald-bg);
}

.wf-flat-step-chip.is-swap-source {
  border-color: var(--sem-amber-bright);
  border-left-color: var(--step-clr, #3b82f6);
  box-shadow: 0 0 0 2px var(--sem-amber-bg);
}

.wf-step-grip {
  font-size: 11px;
  line-height: 1;
  color: var(--bg-text-muted);
  opacity: 0.75;
}

.wf-flat-step-chip:hover .wf-step-grip {
  opacity: 1;
  color: var(--bg-text);
}

.wf-step-chip-name {
  font-weight: 700;
  color: var(--bg-text);
}

.wf-step-chip-pct {
  font-size: 11px;
  color: var(--bg-text-muted);
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

.wf-flat-card.is-nav-highlighted {
  border-color: var(--sem-sky-bright) !important;
  box-shadow: 0 0 0 2px var(--sem-sky-bright), 0 10px 28px -6px rgba(14, 165, 233, 0.35) !important;
  animation: wfCardLocatePulse 0.65s ease-out;
}

@keyframes wfCardLocatePulse {
  0% {
    transform: scale(0.992);
  }
  50% {
    transform: scale(1.008);
  }
  100% {
    transform: scale(1);
  }
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
  z-index: 100042;
  padding: 0;
  align-items: stretch;
  justify-content: stretch;
}

.wf-modal-overlay.is-studio-fullscreen-overlay.theme-custom-glass {
  background: rgba(6, 15, 28, 0.84);
  backdrop-filter: blur(22px);
}

.wf-modal-overlay.is-sub-picker-overlay {
  z-index: 100048;
}

.wf-modal-overlay.is-top-picker-overlay {
  z-index: 100052;
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
  .wf-modal-overlay:not(.is-create-name-overlay) {
    padding: 0;
    align-items: stretch;
  }
  .wf-modal-overlay:not(.is-create-name-overlay) .wf-modal-card,
  .wf-modal-card.wf-modal-md,
  .wf-modal-card.wf-modal-lg,
  .wf-modal-card.wf-modal-studio {
    max-width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    border: none;
  }
  .wf-modal-overlay:not(.is-create-name-overlay) .wf-modal-grab {
    display: none !important;
  }
  .wf-modal-overlay:not(.is-create-name-overlay) .wf-modal-header,
  .wf-modal-overlay:not(.is-create-name-overlay) .wf-studio-header {
    padding: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) 14px 12px !important;
  }
  .wf-modal-overlay.is-create-name-overlay,
  .wf-dialog-overlay {
    padding: max(calc(env(safe-area-inset-top, 0px) + 12px), 56px) 14px calc(16px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

@media (max-width: 980px) {
  .wf-studio-body-grid {
    grid-template-columns: minmax(0, 1fr);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .wf-studio-col {
    height: auto;
    min-width: 0;
    max-width: 100%;
    overflow: visible;
  }
  .wf-studio-col-scroll {
    overflow: visible;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .bg-hide-sm {
    display: none !important;
  }
  .wf-designer-root {
    min-width: 0;
    width: 100%;
    max-width: 100%;
    gap: 10px;
    overflow-x: clip;
  }

  /* Hide desktop toolbar on mobile and show App-synced unified mobile header */
  .wf-minimal-toolbar {
    display: none !important;
  }

  .wf-mob-unified-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-width: 0;
  }

  .bg-search-shell.wf-mob-search-shell {
    flex: 1 1 0%;
    min-width: 0 !important;
    max-width: none;
    height: 40px;
    padding: 0 10px 0 33px;
    border-radius: 12px;
    background: var(--bg-panel);
    border: 1.5px solid rgba(56, 189, 248, 0.42);
    box-shadow: var(--bg-shadow-panel);
  }

  .wf-designer-root.theme-light-blue .bg-search-shell.wf-mob-search-shell {
    background: #ffffff;
    border-color: rgba(2, 132, 199, 0.44);
  }

  .bg-search-shell.wf-mob-search-shell:focus-within,
  .bg-search-shell.wf-mob-search-shell.has-query {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.16);
  }

  .wf-mob-match-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 6px;
    margin-right: 4px;
    border-radius: 999px;
    background: var(--sem-sky-bg);
    border: 1px solid var(--sem-sky-bd);
    color: var(--sem-sky-bright);
    font-size: 10.5px;
    font-weight: 800;
    flex-shrink: 0;
  }

  .wf-mob-match-pill.is-zero {
    background: var(--sem-rose-bg);
    border-color: var(--sem-rose-bd);
    color: var(--sem-rose-bright);
  }

  .wf-mob-sq-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 12px;
    border: 1px solid var(--bg-border-strong);
    background: var(--bg-panel);
    color: var(--bg-text-sec);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    box-shadow: var(--bg-shadow-panel);
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.14s ease, border-color 0.16s ease;
  }

  .wf-mob-sq-btn.is-theme-btn {
    color: var(--sem-sky-bright);
  }

  .wf-designer-root.theme-light-blue .wf-mob-sq-btn {
    background: #ffffff;
    border-color: rgba(15, 23, 42, 0.14);
  }

  .wf-designer-root.theme-custom-glass .bg-search-shell.wf-mob-search-shell,
  .wf-designer-root.theme-custom-glass .wf-mob-sq-btn {
    background: var(--bg-glass-panel);
    border-color: var(--bg-glass-border);
    backdrop-filter: blur(var(--cg-blur, 16px));
    -webkit-backdrop-filter: blur(var(--cg-blur, 16px));
  }

  .wf-mob-sq-btn:active {
    transform: scale(0.94);
  }

  .wf-mob-section-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 2px;
    min-width: 0;
  }

  .wf-mob-sec-left {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }

  .wf-mob-sec-title {
    font-size: 13.5px;
    font-weight: 800;
    color: var(--bg-text);
    white-space: nowrap;
  }

  .wf-mob-sec-cnt {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 7px;
    border-radius: 999px;
    background: var(--sem-sky-bg);
    border: 1px solid var(--sem-sky-bd);
    color: var(--sem-sky-bright);
    font-size: 11px;
    font-weight: 800;
  }

  .wf-mob-create-btn {
    height: 30px;
    padding: 0 11px;
    border-radius: 9px;
    border: 1px solid rgba(56, 189, 248, 0.38);
    background: var(--theme-pri-grad);
    color: #ffffff;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
    cursor: pointer;
    box-shadow: 0 3px 10px -2px var(--theme-pri-shadow);
  }

  /* Clean simplified mobile header inside Studio Modal (only title + close button) */
  .wf-studio-header {
    padding: 11px 14px;
  }
  .wf-modal-overlay .wf-studio-header .wf-modal-ic,
  .wf-modal-overlay .wf-studio-header .wf-studio-pills,
  .wf-modal-overlay .wf-studio-header .wf-modal-sub,
  .wf-modal-overlay .wf-studio-header .wf-studio-head-right .wf-btn-sky-soft {
    display: none !important;
  }
  .wf-modal-overlay .wf-studio-header .wf-studio-title-row {
    gap: 0;
  }
  .wf-modal-overlay .wf-studio-header .wf-modal-title {
    font-size: 16px;
    line-height: 1.3;
  }

  .wf-modal-footer.is-studio-foot {
    padding: 11px 14px calc(11px + env(safe-area-inset-bottom, 0px));
  }
  .wf-studio-body-grid {
    padding: 12px 12px;
    gap: 12px;
  }
  .wf-live-preview-box,
  .wf-live-preview-track,
  .wf-studio-steps-list,
  .wf-studio-step-row {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Clean 2-tier Workflow card header + roomy horizontal swipe track on Mobile */
  .wf-flat-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }
  .wf-flat-card {
    min-width: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    padding: 12px 13px;
    gap: 10px;
    border-radius: 13px;
  }
  .wf-flat-head {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    min-width: 0;
    width: 100%;
  }
  .wf-flat-meta {
    width: 100%;
    min-width: 0;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
  }
  .wf-flat-name {
    font-size: 14.5px;
    line-height: 1.35;
    max-width: 100%;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .wf-card-mini-pill {
    margin-left: 0;
    height: 22px;
    padding: 0 8px;
    font-size: 11px;
  }
  .wf-flat-tools {
    width: 100%;
    min-width: 0;
    flex-wrap: wrap;
    gap: 6px;
    padding-top: 2px;
  }
  .wf-flat-txt-btn {
    height: 31px;
    padding: 0 10px;
    border-radius: 8px;
    font-size: 11.5px;
  }
  .wf-ghost-ic-btn {
    width: 31px;
    height: 31px;
    border-radius: 8px;
    border-color: var(--bg-border-strong);
    background: var(--bg-chip-rest);
  }
  .wf-ghost-ic-btn.is-danger {
    margin-left: auto;
  }
  .wf-flat-track-scroll {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 8px;
    padding: 4px 2px 8px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    touch-action: pan-x pan-y;
  }
  .wf-flat-track-scroll::-webkit-scrollbar {
    height: 4px;
  }
  .wf-flat-draggable-list {
    gap: 7px;
  }
  .wf-flat-step-unit {
    gap: 7px;
  }
  .wf-flat-step-chip {
    height: 36px;
    max-width: 78vw;
    padding: 0 11px;
    border-radius: 9px;
    border-left-width: 4px;
    font-size: 12.5px;
    gap: 6px;
  }
  .wf-step-chip-name {
    max-width: 56vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .wf-step-chip-pct {
    font-size: 11.5px;
    flex-shrink: 0;
  }
  .wf-mobile-swap-inline {
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }
  .wf-step-arrow {
    font-size: 13px;
    opacity: 0.72;
  }
  .wf-inline-add-step-btn {
    height: 36px;
    padding: 0 12px;
    border-radius: 9px;
    font-size: 12px;
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
