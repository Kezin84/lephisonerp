<template>
  <div
    class="pipeline-workspace page"
    :class="{
      'theme-light-blue': uiTheme === 'light',
      'theme-custom-glass': uiTheme === 'custom'
    }"
    :style="uiTheme === 'custom' ? customGlassStyleVars : null"
  >
    <!-- =========================================================
         MODULE 1 + 2 (UNIFIED SLIM BAR): LEFT-ALIGNED WORKSPACE TABS · CONTEXT ACTIONS & THEME
         ========================================================= -->
    <header class="bg-topbar is-unified-bar">
      <div class="pl-topbar-left">
        <div class="bg-seg-switch pl-workspace-tabs is-slim-tabs" role="tablist" aria-label="Không gian làm việc Pipeline">
          <button
            type="button"
            class="bg-seg-btn"
            :class="{ 'is-active': activeTab === 'kanban' }"
            @click="activeTab = 'kanban'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
            <span>Công Việc Pipeline</span>
            <span class="pl-ws-count pl-tabular">{{ items.length }}</span>
          </button>

          <button
            type="button"
            class="bg-seg-btn"
            :class="{ 'is-active': activeTab === 'projects' }"
            @click="activeTab = 'projects'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span>Dự Án (Gốc)</span>
            <span class="pl-ws-count pl-tabular">{{ projectsList.length }}</span>
          </button>

          <button
            type="button"
            class="bg-seg-btn"
            :class="{ 'is-active': activeTab === 'workflow' }"
            @click="activeTab = 'workflow'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>Workflow</span>
            <span class="pl-ws-count pl-tabular">{{ uniqueWorkflows.length + 1 }}</span>
          </button>
        </div>

        <span v-if="backgroundSyncing" class="pl-sync-pill">
          <span class="pl-spinner-xs"></span>
          <span class="bg-hide-sm">Đồng bộ...</span>
        </span>
      </div>

      <div v-if="activeTab !== 'kanban'" class="bg-topbar-right">
        <div v-if="activeTab === 'projects'" class="pl-command-actions is-slim-actions">
          <button
            type="button"
            class="pl-btn pl-btn-slate pl-btn-sm"
            :disabled="loading"
            @click="refreshWorkspace"
            title="Tải lại dữ liệu từ Firebase"
          >
            <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
            <span v-else class="pl-spinner-xs"></span>
            <span class="bg-hide-sm">Làm mới</span>
          </button>

          <button
            type="button"
            class="pl-btn pl-btn-primary pl-btn-sm"
            @click="openAddProjectModal()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
            <span>Tạo Dự Án</span>
          </button>

          <span class="pl-topbar-divider bg-hide-sm" aria-hidden="true"></span>
        </div>

        <div class="bg-theme-mode-switch is-slim-theme-switch" role="tablist" aria-label="Chế độ giao diện">
          <button
            type="button"
            class="bg-theme-seg-btn"
            :class="{ 'is-active': uiTheme === 'dark' }"
            @click="setUiTheme('dark')"
            title="Giao diện Dark Navy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <span>Dark</span>
          </button>
          <button
            type="button"
            class="bg-theme-seg-btn"
            :class="{ 'is-active': uiTheme === 'light' }"
            @click="setUiTheme('light')"
            title="Giao diện Enterprise Light Blue"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <span>Light</span>
          </button>
          <button
            type="button"
            class="bg-theme-seg-btn"
            :class="{ 'is-active': uiTheme === 'custom' }"
            @click="onClickCustomThemeBtn($event)"
            title="Giao diện Custom Glassify"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>Custom</span>
          </button>
          <button
            v-if="uiTheme === 'custom'"
            type="button"
            class="bg-theme-tuner-btn"
            :class="{ 'is-open': showCustomGlassTuner }"
            @click.stop="toggleCustomGlassTuner($event)"
            title="Tùy chỉnh độ trong suốt & độ sáng kính"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          </button>
        </div>
      </div>

      <!-- CUSTOM GLASS TUNER POPOVER (SHARED ACROSS ALL TABS, ANCHORED TO TRIGGER) -->
      <Teleport to="body">
        <div
          v-if="uiTheme === 'custom' && showCustomGlassTuner"
          class="pl-tuner-backdrop"
          @click="showCustomGlassTuner = false"
        ></div>
        <div
          v-if="uiTheme === 'custom' && showCustomGlassTuner"
          class="pl-tuner-popover"
          :class="{ 'theme-custom-glass': uiTheme === 'custom' }"
          :style="[customGlassStyleVars, tunerPopoverPos]"
          @click.stop
        >
          <div class="pl-tuner-head">
            <div>
              <div class="pl-tuner-title">Tùy chỉnh Kính mờ (Glassify)</div>
              <div class="pl-tuner-sub">Đồng bộ toàn hệ thống</div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="pl-btn pl-btn-slate pl-btn-xs" @click="resetCustomGlassConfig">Đặt lại</button>
              <button type="button" class="pl-icon-btn" @click="showCustomGlassTuner = false" aria-label="Đóng">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <div class="pl-tuner-presets">
            <button type="button" class="pl-preset-chip" :class="{ 'is-active': activeGlassPreset === 'ios_frost' }" @click="applyGlassPreset('ios_frost')">iOS Frosted</button>
            <button type="button" class="pl-preset-chip" :class="{ 'is-active': activeGlassPreset === 'ocean_dark' }" @click="applyGlassPreset('ocean_dark')">Ocean Dark</button>
            <button type="button" class="pl-preset-chip" :class="{ 'is-active': activeGlassPreset === 'crystal_clear' }" @click="applyGlassPreset('crystal_clear')">Trong suốt</button>
          </div>

          <div class="pl-tuner-sliders">
            <div class="pl-slider-item">
              <div class="pl-slider-lbl"><span>Độ sáng kính</span><span class="pl-tabular">{{ customGlassConfig.brightness }}%</span></div>
              <input type="range" min="0" max="85" v-model.number="customGlassConfig.brightness" />
            </div>
            <div class="pl-slider-item">
              <div class="pl-slider-lbl"><span>Độ đục (Opacity)</span><span class="pl-tabular">{{ customGlassConfig.opacity }}%</span></div>
              <input type="range" min="12" max="86" v-model.number="customGlassConfig.opacity" />
            </div>
            <div class="pl-slider-item">
              <div class="pl-slider-lbl"><span>Độ nhòe (Blur)</span><span class="pl-tabular">{{ customGlassConfig.blur }}px</span></div>
              <input type="range" min="0" max="36" v-model.number="customGlassConfig.blur" />
            </div>
            <div class="pl-slider-item">
              <div class="pl-slider-lbl"><span>Độ dịu ảnh nền</span><span class="pl-tabular">{{ customGlassConfig.dim }}%</span></div>
              <input type="range" min="0" max="75" v-model.number="customGlassConfig.dim" />
            </div>
          </div>
        </div>
      </Teleport>
    </header>

    <!-- =========================================================
         TAB 3: WORKFLOW DESIGNER WORKSPACE
         ========================================================= -->
    <div v-if="activeTab === 'workflow'" class="pl-tab-body">
      <PipelineWorkflowFirebase
        :ui-theme="uiTheme"
        :customers-external="customersList"
        :pipelines-external="items"
        :focus-customer-key="workflowFocusCustomerKey"
        @updated="fetchData"
        @open-kanban-workflow="handleOpenKanbanFromWorkflow"
      />
    </div>

    <!-- =========================================================
         TAB 2: MULTI-PIPELINE PROJECTS PORTFOLIO & ON-DEMAND WORKFLOW DRAWER
         ========================================================= -->
    <div v-else-if="activeTab === 'projects'" class="pl-tab-body">
      <!-- SLIM 1-ROW PROJECT FILTER TOOLBAR (NO KPI / NO EXTRA BANNER) -->
      <section class="bg-filter-strip is-slim-toolbar">
        <div class="pl-slim-toolbar-row">
          <div class="bg-search-shell is-slim-inline">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              v-model="projectSearchQuery"
              type="text"
              class="bg-search-inp"
              placeholder="Tìm Dự án, Mã DA, Cty, KH, Workflow..."
            />
            <button v-if="projectSearchQuery" type="button" class="bg-search-clr" @click="projectSearchQuery = ''" aria-label="Xóa tìm kiếm">
              <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="bg-filter-row-pickers pl-proj-bento-row is-slim-pickers">
              <!-- 1. TÊN KH -->
              <div class="pl-dropdown-anchor">
                <button
                  type="button"
                  class="pl-picker-trigger"
                  :class="{ 'is-filtered': !!projectFilter.customerName }"
                  @click="toggleProjFilterMenu('customer')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span class="pl-picker-lbl">Tên KH:</span>
                  <span class="pl-picker-val">{{ activeProjCustomerFilterLabel }}</span>
                  <span
                    v-if="projectFilter.customerName"
                    class="pl-picker-clear"
                    title="Xóa lọc Tên KH"
                    @click.stop="selectProjCustomerFilter('')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="pl-caret-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="openProjFilterMenu === 'customer'" class="pl-dropdown-backdrop" @click="openProjFilterMenu = ''"></div>
                <div v-if="openProjFilterMenu === 'customer'" class="pl-dropdown-menu">
                  <div class="pl-dropdown-search">
                    <input v-model="projFilterSearch.customer" type="text" class="bg-input bg-input-sm" placeholder="Tìm Tên khách hàng / liên hệ..." />
                  </div>
                  <div class="pl-dropdown-list">
                    <div class="pl-dropdown-item" :class="{ 'is-selected': !projectFilter.customerName }" @click="selectProjCustomerFilter('')">
                      <span>Tất cả Khách hàng ({{ projCustomerFilterOptions.length }})</span>
                    </div>
                    <div
                      v-for="opt in filteredProjCustomerOptions"
                      :key="'pkh-' + opt.key"
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': projectFilter.customerName === opt.key }"
                      @click="selectProjCustomerFilter(opt.key)"
                    >
                      <div class="pl-dd-main">
                        <span>{{ opt.label }}</span>
                        <span class="pl-mini-tag is-slate pl-tabular">{{ opt.count }} DA</span>
                      </div>
                    </div>
                    <div v-if="filteredProjCustomerOptions.length === 0" class="pl-dd-empty">Không có Tên KH tương ứng</div>
                  </div>
                </div>
              </div>

              <!-- 2. TÊN CTY -->
              <div class="pl-dropdown-anchor">
                <button
                  type="button"
                  class="pl-picker-trigger"
                  :class="{ 'is-filtered': !!projectFilter.companyName }"
                  @click="toggleProjFilterMenu('company')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="6" x2="9.01" y2="6"></line><line x1="15" y1="6" x2="15.01" y2="6"></line><line x1="9" y1="10" x2="9.01" y2="10"></line><line x1="15" y1="10" x2="15.01" y2="10"></line><line x1="9" y1="18" x2="15" y2="18"></line></svg>
                  <span class="pl-picker-lbl">Tên Cty:</span>
                  <span class="pl-picker-val">{{ activeProjCompanyFilterLabel }}</span>
                  <span
                    v-if="projectFilter.companyName"
                    class="pl-picker-clear"
                    title="Xóa lọc Tên Cty"
                    @click.stop="selectProjCompanyFilter('')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="pl-caret-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="openProjFilterMenu === 'company'" class="pl-dropdown-backdrop" @click="openProjFilterMenu = ''"></div>
                <div v-if="openProjFilterMenu === 'company'" class="pl-dropdown-menu">
                  <div class="pl-dropdown-search">
                    <input v-model="projFilterSearch.company" type="text" class="bg-input bg-input-sm" placeholder="Tìm Tên công ty..." />
                  </div>
                  <div class="pl-dropdown-list">
                    <div class="pl-dropdown-item" :class="{ 'is-selected': !projectFilter.companyName }" @click="selectProjCompanyFilter('')">
                      <span>Tất cả Công ty ({{ projCompanyFilterOptions.length }})</span>
                    </div>
                    <div
                      v-for="opt in filteredProjCompanyOptions"
                      :key="'pct-' + opt.key"
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': projectFilter.companyName === opt.key }"
                      @click="selectProjCompanyFilter(opt.key)"
                    >
                      <div class="pl-dd-main">
                        <span>{{ opt.label }}</span>
                        <span class="pl-mini-tag is-slate pl-tabular">{{ opt.count }} DA</span>
                      </div>
                    </div>
                    <div v-if="filteredProjCompanyOptions.length === 0" class="pl-dd-empty">Không có Công ty tương ứng</div>
                  </div>
                </div>
              </div>

              <!-- 3. DỰ ÁN -->
              <div class="pl-dropdown-anchor">
                <button
                  type="button"
                  class="pl-picker-trigger"
                  :class="{ 'is-filtered': !!projectFilter.projectId }"
                  @click="toggleProjFilterMenu('project')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <span class="pl-picker-lbl">Dự án:</span>
                  <span class="pl-picker-val">{{ activeProjProjectFilterLabel }}</span>
                  <span
                    v-if="projectFilter.projectId"
                    class="pl-picker-clear"
                    title="Xóa lọc Dự án"
                    @click.stop="selectProjProjectFilter('')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="pl-caret-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="openProjFilterMenu === 'project'" class="pl-dropdown-backdrop" @click="openProjFilterMenu = ''"></div>
                <div v-if="openProjFilterMenu === 'project'" class="pl-dropdown-menu">
                  <div class="pl-dropdown-search">
                    <input v-model="projFilterSearch.project" type="text" class="bg-input bg-input-sm" placeholder="Tìm Dự án, Mã DA..." />
                  </div>
                  <div class="pl-dropdown-list">
                    <div class="pl-dropdown-item" :class="{ 'is-selected': !projectFilter.projectId }" @click="selectProjProjectFilter('')">
                      <span>Tất cả Dự án ({{ projProjectFilterOptions.length }})</span>
                    </div>
                    <div
                      v-for="opt in filteredProjProjectOptions"
                      :key="'pda-' + opt.id_project"
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': projectFilter.projectId === opt.id_project }"
                      @click="selectProjProjectFilter(opt.id_project)"
                    >
                      <div class="pl-dd-main">
                        <span>{{ opt.label }}</span>
                        <span v-if="opt.sub" class="pl-dd-sub">{{ opt.sub }}</span>
                      </div>
                    </div>
                    <div v-if="filteredProjProjectOptions.length === 0" class="pl-dd-empty">Không có Dự án tương ứng</div>
                  </div>
                </div>
              </div>

              <!-- 4. PIPELINE (KHUNG PIPELINE) -->
              <div class="pl-dropdown-anchor">
                <button
                  type="button"
                  class="pl-picker-trigger"
                  :class="{ 'is-filtered': !!projectFilter.workflowId }"
                  @click="toggleProjFilterMenu('workflow')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  <span class="pl-picker-lbl">Pipeline:</span>
                  <span class="pl-picker-val">{{ activeProjWorkflowFilterLabel }}</span>
                  <span
                    v-if="projectFilter.workflowId"
                    class="pl-picker-clear"
                    title="Xóa lọc Khung Pipeline"
                    @click.stop="selectProjWorkflowFilter('')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="pl-caret-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="openProjFilterMenu === 'workflow'" class="pl-dropdown-backdrop" @click="openProjFilterMenu = ''"></div>
                <div v-if="openProjFilterMenu === 'workflow'" class="pl-dropdown-menu">
                  <div class="pl-dropdown-search">
                    <input v-model="projFilterSearch.workflow" type="text" class="bg-input bg-input-sm" placeholder="Tìm Khung Pipeline..." />
                  </div>
                  <div class="pl-dropdown-list">
                    <div class="pl-dropdown-item" :class="{ 'is-selected': !projectFilter.workflowId }" @click="selectProjWorkflowFilter('')">
                      <span>Tất cả Khung Pipeline ({{ projWorkflowFilterOptions.length }})</span>
                    </div>
                    <div
                      v-for="opt in filteredProjWorkflowOptions"
                      :key="'pwf-' + opt.id_workflow"
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': projectFilter.workflowId === opt.id_workflow }"
                      @click="selectProjWorkflowFilter(opt.id_workflow)"
                    >
                      <div class="pl-dd-main">
                        <span>{{ opt.label }}</span>
                        <span class="pl-mini-tag is-slate pl-tabular">{{ opt.count }} DA</span>
                      </div>
                    </div>
                    <div v-if="filteredProjWorkflowOptions.length === 0" class="pl-dd-empty">Không có Khung Pipeline tương ứng</div>
                  </div>
                </div>
              </div>

              <div class="bg-seg-switch is-compact is-slim-seg" title="Lọc theo trạng thái dự án">
                <button
                  v-for="stOpt in [
                    { v: 'Tất cả', l: 'Tất cả' },
                    { v: 'Đang triển khai', l: 'Đang chạy' },
                    { v: 'Hoàn thành', l: 'Hoàn thành' },
                    { v: 'Tạm dừng', l: 'Tạm dừng' }
                  ]"
                  :key="stOpt.v"
                  type="button"
                  class="bg-seg-btn"
                  :class="{ 'is-active': projectStatusFilter === stOpt.v }"
                  @click="projectStatusFilter = stOpt.v"
                >
                  {{ stOpt.l }}
                </button>
              </div>

              <button
                v-if="hasActiveProjectFilters"
                type="button"
                class="pl-slim-reset-btn"
                @click="resetProjectFilters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                <span>Đặt lại lọc</span>
              </button>
          </div>
        </div>
      </section>

      <!-- 6/4 SPLIT WORKSPACE: LEFT (60% DỰ ÁN) | RIGHT (40% KHO FLOW: WORKFLOW KHÁCH HÀNG & WORKFLOW KHO) -->
      <div class="pl-projects-split-workspace">
        <!-- =====================================================
             LEFT COLUMN (6/10): B2B PROJECT CARDS & DROP ZONES
             ===================================================== -->
        <div class="pl-proj-left-col">
          <div v-if="enrichedProjects.length === 0" class="pl-empty-panel">
            <div class="pl-empty-ic">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div class="pl-empty-title">
              {{ hasActiveProjectFilters ? 'Không có Dự án nào khớp bộ lọc hiện tại' : 'Chưa có Dự án (Gốc) nào được khởi tạo' }}
            </div>
            <div class="pl-empty-sub">
              {{
                hasActiveProjectFilters
                  ? 'Thử xóa từ khóa tìm kiếm hoặc đặt lại bộ lọc Khách hàng / Trạng thái.'
                  : 'Khởi tạo Dự án mới ở góc trên bên phải, sau đó kéo thả các Workflow từ Kho Flow bên phải vào Dự án.'
              }}
            </div>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 8px;">
              <button
                v-if="hasActiveProjectFilters"
                type="button"
                class="pl-btn pl-btn-slate"
                @click="resetProjectFilters"
              >
                Đặt lại bộ lọc
              </button>
              <button type="button" class="pl-btn pl-btn-primary" @click="openAddProjectModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>{{ hasActiveProjectFilters ? 'Tạo Dự Án Mới' : 'Tạo Dự Án Đầu Tiên' }}</span>
              </button>
            </div>
          </div>

          <div v-else class="pl-projects-grid">
            <div
              v-for="proj in enrichedProjects"
              :key="proj.id_project"
              class="pl-project-card"
              :class="[
                getProjectCardToneClass(proj),
                {
                  'is-overdue-proj': isProjectOverdue(proj),
                  'is-drag-ready': !!draggingWorkflow && !isWorkflowAlreadyInProject(proj, draggingWorkflow.id_workflow),
                  'is-drag-over':
                    dragOverProjectId === proj.id_project &&
                    !!draggingWorkflow &&
                    !isWorkflowAlreadyInProject(proj, draggingWorkflow.id_workflow),
                  'is-drag-duplicate':
                    dragOverProjectId === proj.id_project &&
                    !!draggingWorkflow &&
                    isWorkflowAlreadyInProject(proj, draggingWorkflow.id_workflow)
                }
              ]"
              @click="openProjectDetailModal(proj)"
              @dragenter.prevent="onProjectDragEnter(proj)"
              @dragover.prevent="onProjectDragOver($event, proj)"
              @dragleave="onProjectDragLeave($event, proj)"
              @drop.prevent="onProjectDrop($event, proj)"
            >
              <!-- TIER 1: TOP META & BADGES ROW (REPORT DNA) -->
              <div class="pl-proj-meta-top">
                <div class="pl-proj-meta-left">
                  <span class="pl-proj-code-chip pl-mono pl-tabular">
                    #{{ proj.ma_du_an || proj.id_project.slice(-6) }}
                  </span>
                  <span
                    v-if="proj.deadline"
                    class="pl-proj-deadline-chip pl-tabular"
                    :class="{ 'is-overdue': isProjectOverdue(proj) }"
                    :title="isProjectOverdue(proj) ? 'Dự án đã quá hạn deadline' : 'Hạn dự kiến hoàn thành dự án'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{{ isProjectOverdue(proj) ? 'Quá hạn: ' : 'Hạn: ' }}{{ formatProjectDeadline(proj.deadline) }}</span>
                  </span>
                </div>

                <div class="pl-proj-meta-right">
                  <span class="pl-status-pill" :class="getProjectStatusPillClass(proj)">
                    {{ proj.trang_thai || 'Đang triển khai' }}
                  </span>
                  <span
                    v-if="proj.partnerCustomerCount > 0"
                    class="pl-proj-partner-badge pl-tabular"
                    :title="'Đối tác / SI tham gia: ' + proj.partnerCustomerLabels.join(', ')"
                  >
                    +{{ proj.partnerCustomerCount }} Đối tác / SI
                  </span>
                  <span
                    class="pl-am-avatar"
                    :title="'AM phụ trách dự án: ' + (proj.AM || 'Sơn')"
                  >{{ (proj.AM || 'S').charAt(0).toUpperCase() }}</span>
                </div>
              </div>

              <!-- TIER 2: BOLD TITLE + FLAT CUSTOMER IDENTITY + NOTE (NO NESTED BOXES) -->
              <div class="pl-proj-identity">
                <div class="pl-dcard-title-row">
                  <span
                    v-if="proj.trang_thai === 'Hoàn thành'"
                    class="pl-dcard-done-circle"
                    title="Dự án đã hoàn thành"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                  <div class="pl-proj-title">{{ proj.ten_du_an }}</div>
                </div>

                <div class="pl-proj-subline">
                  <template v-if="proj.displayCompanyName || proj.displayCustomerName">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="pl-proj-party-ic"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="6" x2="9.01" y2="6"></line><line x1="15" y1="6" x2="15.01" y2="6"></line><line x1="9" y1="10" x2="9.01" y2="10"></line><line x1="15" y1="10" x2="15.01" y2="10"></line><line x1="9" y1="18" x2="15" y2="18"></line></svg>
                    <span v-if="proj.displayCompanyName" class="pl-proj-company-txt">{{ proj.displayCompanyName }}</span>
                    <span v-if="proj.displayCompanyName && proj.displayCustomerName" class="pl-dot-sep">•</span>
                    <span v-if="proj.displayCustomerName" class="pl-proj-cus-txt">{{ proj.displayCustomerName }}</span>
                  </template>
                  <span
                    v-else
                    class="pl-proj-missing-cus"
                    @click.stop="openEditProjectModal(proj)"
                  >
                    Chưa cập nhật Công ty / Khách hàng Gốc
                  </span>
                </div>

                <div v-if="proj.ghi_chu" class="pl-proj-note-row" :title="proj.ghi_chu">
                  <span class="pl-proj-note-tag">NOTE</span>
                  <span class="pl-proj-note-txt">{{ proj.ghi_chu }}</span>
                </div>
              </div>

              <!-- TIER 3: FLAT FINANCIAL METRICS & PROGRESS BAR (CRISP HAIRLINE — REPORT DNA) -->
              <div class="pl-proj-metrics-flat">
                <div class="pl-proj-metrics-row">
                  <div class="pl-card-chips pl-tabular">
                    <span class="pl-metric-chip">{{ proj.pipelines.length }} công việc</span>
                    <span v-if="proj.wonCount > 0" class="pl-metric-chip is-won-chip">{{ proj.wonCount }} chốt xong</span>
                    <span v-if="parseNum(proj.ngan_sach_du_kien) > 0" class="pl-metric-chip">
                      NS: {{ formatNumber(proj.ngan_sach_du_kien) }} ₫
                    </span>
                    <span v-else-if="proj.weightedVolume > 0" class="pl-metric-chip">
                      Quy đổi: {{ formatNumber(proj.weightedVolume) }} ₫
                    </span>
                  </div>

                  <div class="pl-proj-vol-hero pl-tabular" :class="{ 'is-zero': !(proj.totalVolume > 0) }">
                    {{ formatNumber(proj.totalVolume) || '0' }}<span class="pl-proj-vol-cur">₫</span>
                  </div>
                </div>

                <div class="pl-proj-prog-inline pl-tabular">
                  <span class="pl-proj-exec-lbl">Tiến độ</span>
                  <div class="pl-proj-prog-track">
                    <div
                      class="pl-proj-prog-fill"
                      :class="{ 'is-done': proj.avgProgress >= 100 || proj.trang_thai === 'Hoàn thành' }"
                      :style="{ width: (proj.trang_thai === 'Hoàn thành' ? 100 : Math.min(100, Math.max(0, proj.avgProgress))) + '%' }"
                    ></div>
                  </div>
                  <strong class="pl-proj-exec-pct">
                    {{ proj.trang_thai === 'Hoàn thành' ? 100 : proj.avgProgress }}%
                  </strong>
                </div>
              </div>

              <!-- TIER 4: CLEAN WORKFLOW DIRECTORY INSIDE PROJECT (NO SCOPE BADGES + DUPLICATE HIGHLIGHT) -->
              <div class="pl-proj-wf-stack" @click.stop>
                <div class="pl-proj-wf-sec-head">
                  <span class="pl-proj-wf-sec-lbl pl-tabular">
                    WORKFLOW ĐANG GẮN ({{ proj.correspondingWorkflows.length }})
                  </span>
                </div>

                <div
                  v-for="wf in proj.correspondingWorkflows"
                  :id="'proj-wf-card-' + proj.id_project + '-' + wf.id_workflow"
                  :key="proj.id_project + '-wf-' + wf.id_workflow"
                  class="pl-proj-wf-card"
                  :class="{
                    'is-preferred': wf.isPreferred,
                    'is-dup-hover':
                      dragOverProjectId === proj.id_project &&
                      !!draggingWorkflow &&
                      draggingWorkflow.id_workflow === wf.id_workflow,
                    'is-dup-highlight': highlightedProjWfKey === proj.id_project + '::' + wf.id_workflow
                  }"
                  title="Nhấn để mở Workflow này trên bảng Công Việc Pipeline"
                  @click="openProjectWorkflowOnKanban(proj, wf.id_workflow)"
                >
                  <div class="pl-proj-wf-row-head">
                    <div class="pl-proj-wf-meta-inline">
                      <span class="pl-proj-wf-name">{{ wf.name_workflow }}</span>
                      <template v-if="wf.displayCompanyName || wf.displayCustomerName">
                        <span class="pl-em-sep">—</span>
                        <span class="pl-proj-wf-party">
                          <span v-if="wf.displayCompanyName">{{ wf.displayCompanyName }}</span>
                          <span v-if="wf.displayCompanyName && wf.displayCustomerName" class="pl-dot-sep">•</span>
                          <span v-if="wf.displayCustomerName">{{ wf.displayCustomerName }}</span>
                        </span>
                      </template>
                    </div>

                    <div class="pl-wf-card-mini-tools">
                      <span v-if="wf.pipeCount > 0" class="pl-wf-live-stat pl-tabular">
                        {{ wf.pipeCount }} việc<template v-if="wf.totalVolume > 0"> · {{ formatNumber(wf.totalVolume) }} ₫</template>
                      </span>
                      <button
                        type="button"
                        class="pl-wf-plus-btn"
                        title="Thêm Công việc vào Workflow này"
                        @click.stop="openAddPipelineForProject(proj, wf.id_workflow)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                      <button
                        v-if="wf.isExplicitlyLinked"
                        type="button"
                        class="pl-wf-detach-btn"
                        title="Gỡ Workflow này khỏi Dự án"
                        @click.stop="handleQuickDetachFlowFromCard(proj, wf)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </div>

                  <!-- SINGLE-LINE HORIZONTAL WORKFLOW STEPS WITH LIVE ACTIVE COUNTS -->
                  <div class="pl-proj-wf-steps-line">
                    <template
                      v-for="(st, sIdx) in getProjWfDisplaySteps(wf)"
                      :key="proj.id_project + '-' + wf.id_workflow + '-' + st.id"
                    >
                      <div
                        class="pl-wf-step-flat"
                        :class="{
                          'is-has-active': st.activeCount > 0,
                          'is-won-step': st.id === 'hoan_thanh' && st.activeCount > 0,
                          'is-lost-step': st.id === 'that_bai' && st.activeCount > 0
                        }"
                        :style="{ '--st-clr': st.color || '#3b82f6' }"
                        :title="st.value + ' (' + st.percent + ')' + (st.activeCount > 0 ? ` — ${st.activeCount} công việc` : '')"
                      >
                        <span class="pl-proj-wf-step-dot"></span>
                        <span class="pl-wf-step-flat-lbl">{{ st.shortLabel || st.label }}</span>
                        <span v-if="st.activeCount > 0" class="pl-wf-step-cnt pl-tabular">{{ st.activeCount }}</span>
                      </div>
                      <span
                        v-if="sIdx < getProjWfDisplaySteps(wf).length - 1"
                        class="pl-wf-step-arrow"
                        aria-hidden="true"
                      >→</span>
                    </template>
                  </div>
                </div>
              </div>

              <!-- LIVE DROP SLOT INDICATOR WHILE DRAGGING A WORKFLOW FROM KHO FLOW -->
              <div
                v-if="draggingWorkflow"
                class="pl-proj-drop-slot"
                :class="{
                  'is-active':
                    dragOverProjectId === proj.id_project &&
                    !isWorkflowAlreadyInProject(proj, draggingWorkflow.id_workflow),
                  'is-duplicate': isWorkflowAlreadyInProject(proj, draggingWorkflow.id_workflow)
                }"
              >
                <span v-if="isWorkflowAlreadyInProject(proj, draggingWorkflow.id_workflow)">
                  ⚠ Dự án đã có sẵn "{{ draggingWorkflow.name_workflow }}" — thả để xem vị trí
                </span>
                <span v-else>
                  + Thả vào đây để gắn "{{ draggingWorkflow.name_workflow }}"
                </span>
              </div>

              <!-- TIER 5: REPORT-DNA BOTTOM ACTION FOOTER (SỬA · XOÁ · + THÊM VIỆC · TRẠNG THÁI ▾) -->
              <div class="pl-proj-card-actions" @mousedown.stop @click.stop>
                <div class="pl-dcard-btn-row">
                  <button
                    type="button"
                    class="pl-dcard-btn is-copy"
                    title="Chỉnh sửa thông tin Dự án"
                    @click.stop="openEditProjectModal(proj)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    <span>Sửa</span>
                  </button>

                  <button
                    type="button"
                    class="pl-dcard-btn is-del"
                    title="Xóa Dự án"
                    @click.stop="confirmDeleteProject(proj)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    <span>Xoá</span>
                  </button>

                  <button
                    type="button"
                    class="pl-dcard-btn is-copy"
                    title="Thêm Công việc Pipeline mới vào Dự án này"
                    @click.stop="openAddPipelineForProject(proj, proj.default_workflow_id || (proj.correspondingWorkflows[0] && proj.correspondingWorkflows[0].id_workflow) || 'WF_DEFAULT')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Thêm việc</span>
                  </button>

                  <label class="pl-dcard-btn is-stage" title="Đổi nhanh trạng thái Dự án" @click.stop>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    <span>Trạng thái</span>
                    <span class="pl-stage-pct-pill">{{ proj.trang_thai || 'Đang triển khai' }}</span>
                    <span class="pl-stage-caret" aria-hidden="true">▾</span>
                    <select
                      class="pl-stage-native-overlay"
                      :value="proj.trang_thai || 'Đang triển khai'"
                      aria-label="Chọn trạng thái Dự án"
                      @change="updateProjectQuickStatus(proj, $event.target.value)"
                    >
                      <option value="Đang triển khai">Đang triển khai</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                      <option value="Tạm dừng">Tạm dừng</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- =====================================================
             RIGHT COLUMN (4/10): STICKY KHO FLOW (2 SECTIONS: WORKFLOW KHÁCH HÀNG | WORKFLOW KHO)
             ===================================================== -->
        <aside class="pl-wf-palette-aside">
          <div class="pl-palette-head">
            <div class="pl-palette-head-left">
              <div class="pl-palette-title pl-tabular">
                Kho Flow ({{ paletteTotalCount }})
              </div>
              <div class="pl-palette-sub">
                Kéo thả Workflow sang Dự án bên trái để gắn
              </div>
            </div>

            <div class="pl-palette-head-actions">
              <button
                type="button"
                class="pl-btn pl-btn-xs"
                :class="showPaletteQuickCreate ? 'pl-btn-slate' : 'pl-btn-sky-soft'"
                @click="showPaletteQuickCreate = !showPaletteQuickCreate"
              >
                <svg v-if="!showPaletteQuickCreate" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>{{ showPaletteQuickCreate ? 'Đóng' : '+ Tạo nhanh' }}</span>
              </button>
              <button
                type="button"
                class="pl-btn pl-btn-slate pl-btn-xs"
                title="Mở trang quản lý & thiết kế chi tiết Workflow"
                @click="activeTab = 'workflow'"
              >
                <span>Studio ↗</span>
              </button>
            </div>
          </div>

          <!-- 2 MỤC TRONG KHO FLOW: 1. WORKFLOW KHÁCH HÀNG | 2. WORKFLOW KHO -->
          <div class="bg-seg-switch pl-palette-tabs" role="tablist" aria-label="Phân loại Kho Flow">
            <button
              type="button"
              class="bg-seg-btn"
              :class="{ 'is-active': paletteScopeTab === 'customer' }"
              @click="paletteScopeTab = 'customer'"
            >
              <span>Workflow Khách hàng</span>
              <span class="pl-pal-tab-cnt pl-tabular">{{ paletteCustomerList.length }}</span>
            </button>

            <button
              type="button"
              class="bg-seg-btn"
              :class="{ 'is-active': paletteScopeTab === 'library' }"
              @click="paletteScopeTab = 'library'"
            >
              <span>Workflow Kho</span>
              <span class="pl-pal-tab-cnt pl-tabular">{{ paletteLibraryList.length }}</span>
            </button>
          </div>

          <!-- INLINE QUICK-CREATE WORKFLOW FORM (ADAPTS TO ACTIVE SECTION) -->
          <div v-if="showPaletteQuickCreate" class="pl-palette-quick-form">
            <template v-if="paletteScopeTab === 'customer'">
              <div class="pl-field">
                <div class="bg-label-row">
                  <label class="bg-label">Công ty (1 KH) <span class="bg-req">*</span></label>
                  <div style="display: flex; gap: 6px;">
                    <button type="button" class="pl-link-btn" @click="openCustomerSearch('project_quick_wf')">Danh bạ KH</button>
                    <button type="button" class="pl-link-btn" @click="openAddCustomerModal('project_quick_wf')">+ KH mới</button>
                  </div>
                </div>
                <input v-model="quickProjWfForm.ten_cong_ty" type="text" class="bg-input bg-input-sm" placeholder="Tên công ty..." />
              </div>

              <div class="pl-field">
                <label class="bg-label">Tên Khách hàng / Liên hệ</label>
                <input v-model="quickProjWfForm.ten_khach_hang" type="text" class="bg-input bg-input-sm" placeholder="Người liên hệ..." />
              </div>
            </template>

            <div class="pl-field">
              <label class="bg-label">
                {{ paletteScopeTab === 'customer' ? 'Tên Workflow Khách hàng' : 'Tên Workflow Kho' }} <span class="bg-req">*</span>
              </label>
              <input
                v-model="quickProjWfForm.name_workflow"
                type="text"
                class="bg-input bg-input-sm"
                :placeholder="paletteScopeTab === 'customer' ? 'VD: Workflow Nhà thầu phụ SI...' : 'VD: Quy trình Đấu thầu Thiết bị Y tế...'"
              />
            </div>

            <div class="pl-field">
              <label class="bg-label">Khởi tạo bước từ</label>
              <select v-model="quickProjWfForm.base_template_id" class="bg-input bg-input-sm">
                <option value="WF_DEFAULT">Workflow Chuẩn Hệ Thống (5 bước)</option>
                <optgroup v-if="templateWorkflowOptions.length > 0" label="Workflow Kho dùng chung">
                  <option v-for="tpl in templateWorkflowOptions" :key="'pal-tpl-' + tpl.id_workflow" :value="tpl.id_workflow">
                    {{ tpl.name_workflow }}
                  </option>
                </optgroup>
                <optgroup v-if="customerWorkflowOptions.length > 0" label="Workflow Khách hàng">
                  <option v-for="cwf in customerWorkflowOptions" :key="'pal-cwf-' + cwf.id_workflow" :value="cwf.id_workflow">
                    {{ cwf.name_workflow }}{{ (cwf.ten_cong_ty || cwf.ten_khach_hang) ? ` — ${cwf.ten_cong_ty || cwf.ten_khach_hang}` : '' }}
                  </option>
                </optgroup>
              </select>
            </div>

            <button
              type="button"
              class="pl-btn pl-btn-primary pl-btn-sm"
              style="width: 100%;"
              :disabled="savingQuickProjWf"
              @click="submitQuickWorkflowForProject(null)"
            >
              <span v-if="savingQuickProjWf" class="pl-spinner-xs"></span>
              <span>{{ paletteScopeTab === 'customer' ? 'Lưu vào Workflow Khách hàng' : 'Lưu vào Workflow Kho' }}</span>
            </button>
          </div>

          <!-- PALETTE SEARCH BAR -->
          <div class="pl-palette-search">
            <div class="bg-search-shell">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                v-model="paletteWfSearch"
                type="text"
                class="bg-search-inp"
                :placeholder="paletteScopeTab === 'customer' ? 'Tìm Workflow, Công ty, Khách hàng...' : 'Tìm Workflow kho, tên bước...'"
              />
              <button v-if="paletteWfSearch" type="button" class="bg-search-clr" @click="paletteWfSearch = ''" aria-label="Xóa tìm kiếm">
                <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <!-- DRAGGABLE WORKFLOW LIST (NO SCOPE BADGES ON CARDS) -->
          <div class="pl-palette-list">
            <div v-if="filteredPaletteWorkflows.length === 0" class="pl-empty-inline">
              <div style="margin-bottom: 6px;">
                {{
                  paletteWfSearch
                    ? 'Không tìm thấy Workflow nào khớp từ khóa.'
                    : paletteScopeTab === 'customer'
                      ? 'Chưa có Workflow riêng nào của Khách hàng.'
                      : 'Chưa có Workflow nào trong Kho.'
                }}
              </div>
              <button
                v-if="!showPaletteQuickCreate"
                type="button"
                class="pl-btn pl-btn-sky-soft pl-btn-xs"
                @click="showPaletteQuickCreate = true"
              >
                {{ paletteScopeTab === 'customer' ? '+ Tạo Workflow Khách hàng' : '+ Tạo Workflow Kho' }}
              </button>
            </div>

            <div
              v-for="wf in filteredPaletteWorkflows"
              :key="'pal-wf-' + wf.id_workflow"
              class="pl-palette-wf-card"
              :class="{ 'is-dragging': draggingWorkflow && draggingWorkflow.id_workflow === wf.id_workflow }"
              draggable="true"
              @dragstart="onPaletteWfDragStart($event, wf)"
              @dragend="onPaletteWfDragEnd"
            >
              <div class="pl-palette-wf-top">
                <span class="pl-drag-grip" aria-hidden="true" title="Giữ chuột kéo sang Dự án bên trái">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>
                </span>
                <div class="pl-palette-wf-titles">
                  <div class="pl-proj-wf-name">{{ wf.name_workflow }}</div>
                  <div
                    v-if="paletteScopeTab === 'customer' && wf.workflow_scope === 'customer' && (wf.displayCompanyName || wf.displayCustomerName)"
                    class="pl-proj-wf-party"
                  >
                    <span v-if="wf.displayCompanyName">{{ wf.displayCompanyName }}</span>
                    <span v-if="wf.displayCompanyName && wf.displayCustomerName" class="pl-dot-sep">•</span>
                    <span v-if="wf.displayCustomerName">{{ wf.displayCustomerName }}</span>
                  </div>
                </div>

                <!-- 1-CLICK QUICK-ATTACH SELECTOR (BOTH PC & MOBILE) -->
                <select
                  v-if="enrichedProjects.length > 0"
                  class="pl-palette-quick-select"
                  aria-label="Chọn dự án để gắn nhanh"
                  @change="onMobileQuickAttachSelect($event, wf.id_workflow)"
                >
                  <option value="">+ Gắn DA</option>
                  <option
                    v-for="pOpt in enrichedProjects"
                    :key="'m-att-' + wf.id_workflow + '-' + pOpt.id_project"
                    :value="pOpt.id_project"
                  >
                    {{ pOpt.ten_du_an }}{{ isWorkflowAlreadyInProject(pOpt, wf.id_workflow) ? ' (Đã có)' : '' }}
                  </option>
                </select>
              </div>

              <!-- SINGLE-LINE HORIZONTAL FLOW STEPS -->
              <div class="pl-proj-wf-steps-line">
                <template
                  v-for="(st, sIdx) in wf.flowSteps"
                  :key="'pal-st-' + wf.id_workflow + '-' + st.id"
                >
                  <div
                    class="pl-wf-step-flat"
                    :style="{ '--st-clr': st.color || '#3b82f6' }"
                    :title="st.value + ' (' + st.percent + ')'"
                  >
                    <span class="pl-proj-wf-step-dot"></span>
                    <span class="pl-wf-step-flat-lbl">{{ st.shortLabel || st.label }}</span>
                  </div>
                  <span
                    v-if="sIdx < wf.flowSteps.length - 1"
                    class="pl-wf-step-arrow"
                    aria-hidden="true"
                  >→</span>
                </template>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- =========================================================
         TAB 1: KANBAN BOARD WORKSPACE (STANDARD + PROJECT SWIMLANES)
         ========================================================= -->
    <div v-else class="pl-tab-body">
      <!-- SPACIOUS 2-COL COMMAND DECK: LEFT FRAMELESS PIPELINE FILES + RIGHT CASCADING FILTER PANEL -->
      <section class="bg-bento-deck is-kanban-spacious-deck">
        <!-- LEFT: SPACIOUS SPLIT PIPELINE FILE VAULT (FILE TỪ REPORT | UPLOAD TRỰC TIẾP — LARGE & FRAMELESS ITEMS LIKE SALEREPORTFIREBASE) -->
        <div class="pl-pipe-files-vault is-taller-vault">
          <div class="pl-pfv-grid">
            <!-- COMPARTMENT 1: FILE TỪ REPORT -->
            <div class="pl-pfv-col is-report-col">
              <div class="pl-pfv-head">
                <div class="pl-pfv-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <span>File từ Report</span>
                  <span class="pl-pfv-cnt is-emerald pl-tabular">{{ activeKanbanFilesVault.reportFiles.length }}</span>
                </div>
                <button
                  v-if="activeKanbanFilesVault.reportFiles.length > 0"
                  type="button"
                  class="pl-pfv-expand-btn"
                  title="Mở rộng xem & lọc danh sách File từ Report"
                  @click="openPipelineFilesVaultModal('report')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                </button>
              </div>

              <div v-if="activeKanbanFilesVault.reportFiles.length === 0" class="pl-pfv-empty">
                Chưa có tệp từ Report liên kết
              </div>
              <div v-else class="pl-pfv-list">
                <div
                  v-for="f in activeKanbanFilesVault.reportFiles"
                  :key="f.key"
                  class="pl-pfv-row"
                >
                  <button
                    type="button"
                    class="pl-pfv-file-main"
                    :title="f.tooltip"
                    @click="openReportAttachmentView(f)"
                  >
                    <span class="pl-pfv-file-svg" v-html="getReportAttIconSvg(f)"></span>
                    <span class="pl-pfv-label-wrap">
                      <span v-if="f.badgeLabel" class="pl-rep-file-badge is-pfv-tag" :class="f.badgeCls">{{ f.badgeLabel }}</span>
                      <span class="pl-pfv-fname-txt">{{ f.name }}</span>
                    </span>
                  </button>
                  <div class="pl-pfv-acts">
                    <button
                      type="button"
                      class="pl-pfv-fe-btn is-view"
                      :title="f.kind === 'image' ? 'Xem ảnh' : 'Xem qua ViewOffice / Trình xem'"
                      @click.stop="openReportAttachmentView(f)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <span>Xem</span>
                    </button>
                    <a
                      :href="getDownloadUrl(f.url)"
                      class="pl-pfv-fe-btn is-dl"
                      title="Tải xuống"
                      @click.stop="handleDownloadClick($event, f.url, f.name)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </a>
                    <button
                      type="button"
                      class="pl-pfv-fe-btn is-locate"
                      :title="'Định vị & highlight thẻ: ' + f.ownerSummary"
                      @click.stop="locateFileOwnerCardOnBoard(f.primaryPipeId)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- COMPARTMENT 2: FILE UPLOAD TRỰC TIẾP -->
            <div class="pl-pfv-col is-direct-col">
              <div class="pl-pfv-head">
                <div class="pl-pfv-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                  <span>Upload trực tiếp</span>
                  <span class="pl-pfv-cnt is-sky pl-tabular">{{ activeKanbanFilesVault.directFiles.length }}</span>
                </div>
                <button
                  v-if="activeKanbanFilesVault.totalCount > 0"
                  type="button"
                  class="pl-pfv-expand-btn is-with-lbl"
                  title="Mở kho xem tất cả tệp trong Pipeline"
                  @click="openPipelineFilesVaultModal('all')"
                >
                  <span>Xem hết</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                </button>
              </div>

              <div v-if="activeKanbanFilesVault.directFiles.length === 0" class="pl-pfv-empty">
                Chưa có tệp upload trực tiếp
              </div>
              <div v-else class="pl-pfv-list">
                <div
                  v-for="f in activeKanbanFilesVault.directFiles"
                  :key="f.key"
                  class="pl-pfv-row"
                >
                  <button
                    type="button"
                    class="pl-pfv-file-main"
                    :title="f.tooltip"
                    @click="openReportAttachmentView(f)"
                  >
                    <span class="pl-pfv-file-svg" v-html="getReportAttIconSvg(f)"></span>
                    <span class="pl-pfv-label-wrap">
                      <span class="pl-pfv-fname-txt">{{ f.name }}</span>
                    </span>
                  </button>
                  <div class="pl-pfv-acts">
                    <button
                      type="button"
                      class="pl-pfv-fe-btn is-view"
                      :title="f.kind === 'image' ? 'Xem ảnh' : 'Xem qua ViewOffice / Trình xem'"
                      @click.stop="openReportAttachmentView(f)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <span>Xem</span>
                    </button>
                    <a
                      :href="getDownloadUrl(f.url)"
                      class="pl-pfv-fe-btn is-dl"
                      title="Tải xuống"
                      @click.stop="handleDownloadClick($event, f.url, f.name)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </a>
                    <button
                      type="button"
                      class="pl-pfv-fe-btn is-locate"
                      :title="'Định vị & highlight thẻ: ' + f.ownerSummary"
                      @click.stop="locateFileOwnerCardOnBoard(f.primaryPipeId)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: FRAMELESS VERTICAL CASCADING FILTER LIST (PA1: FLAT 4 ROWS + HEADER TIMELINE) -->
        <div class="bg-filter-strip is-kanban-filter-panel is-frameless-vertical">
          <div class="pl-filter-panel-col">
            <!-- FILTER HEAD + INLINE TIMELINE MODE + RESET -->
            <div class="pl-fp-head">
              <div class="pl-fp-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <span>Bộ lọc công việc</span>
              </div>

              <div class="pl-fp-head-controls">
                <div class="bg-seg-switch is-compact is-fp-head-seg">
                  <button
                    v-for="tm in [
                      { k: 'all', l: 'Tất cả hạn' },
                      { k: 'day', l: 'Ngày' },
                      { k: 'week', l: 'Tuần' },
                      { k: 'month', l: 'Tháng' },
                      { k: 'year', l: 'Năm' }
                    ]"
                    :key="tm.k"
                    type="button"
                    class="bg-seg-btn"
                    :class="{ 'is-active': filterConfig.filterMode === tm.k }"
                    @click="filterConfig.filterMode = tm.k"
                  >
                    {{ tm.l }}
                  </button>
                </div>

                <button
                  v-if="hasActiveFilters"
                  type="button"
                  class="pl-slim-reset-btn is-fp-head-reset"
                  title="Đặt lại toàn bộ bộ lọc"
                  @click="resetFilters"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                  <span>Đặt lại</span>
                </button>
              </div>
            </div>

            <!-- CONDITIONAL DATE RANGE BAR (ONLY SHOWN WHEN NGÀY / TUẦN / THÁNG / NĂM IS ACTIVE) -->
            <div v-if="filterConfig.filterMode !== 'all'" class="pl-fp-date-inline-row">
              <span class="pl-fp-date-lbl">Khoảng hạn:</span>
              <div class="bg-date-range-capsule is-spacious-date is-flat-date">
                <template v-if="filterConfig.filterMode === 'day'">
                  <input type="date" v-model="filterConfig.dateFrom" class="bg-date-inp pl-tabular" />
                  <span class="pl-sep">→</span>
                  <input type="date" v-model="filterConfig.dateTo" class="bg-date-inp pl-tabular" />
                </template>
                <template v-else-if="filterConfig.filterMode === 'week'">
                  <input type="week" v-model="filterConfig.weekFrom" class="bg-date-inp pl-tabular" />
                  <span class="pl-sep">→</span>
                  <input type="week" v-model="filterConfig.weekTo" class="bg-date-inp pl-tabular" />
                </template>
                <template v-else-if="filterConfig.filterMode === 'month'">
                  <input type="month" v-model="filterConfig.monthFrom" class="bg-date-inp pl-tabular" />
                  <span class="pl-sep">→</span>
                  <input type="month" v-model="filterConfig.monthTo" class="bg-date-inp pl-tabular" />
                </template>
                <template v-else-if="filterConfig.filterMode === 'year'">
                  <input type="number" min="2020" max="2040" v-model="filterConfig.yearFrom" placeholder="Từ năm" class="bg-date-inp is-year pl-tabular" />
                  <span class="pl-sep">→</span>
                  <input type="number" min="2020" max="2040" v-model="filterConfig.yearTo" placeholder="Đến năm" class="bg-date-inp is-year pl-tabular" />
                </template>
              </div>
            </div>

            <!-- 4 FRAMELESS VERTICAL ROWS: DỰ ÁN -> PIPELINE -> TÊN CTY -> TÊN KH -->
            <div class="pl-filter-vertical-list">
              <!-- 1. DỰ ÁN -->
              <div class="pl-dropdown-anchor" :class="{ 'is-open': openKanbanFilterMenu === 'project' }">
                <button
                  type="button"
                  class="pl-picker-trigger is-flat-row"
                  :class="{ 'is-filtered': !!filterConfig.projectId }"
                  @click="toggleKanbanFilterMenu('project')"
                >
                  <svg class="pl-flat-row-ic" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <span class="pl-picker-lbl">Dự án</span>
                  <span class="pl-picker-val" :title="activeKanbanProjectFilterLabel">{{ activeKanbanProjectFilterLabel }}</span>
                  <span
                    v-if="filterConfig.projectId"
                    class="pl-picker-clear"
                    title="Xóa lọc Dự án"
                    @click.stop="selectKanbanProjectFilter('')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="pl-caret-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="openKanbanFilterMenu === 'project'" class="pl-dropdown-backdrop" @click="openKanbanFilterMenu = ''"></div>
                <div v-if="openKanbanFilterMenu === 'project'" class="pl-dropdown-menu">
                  <div class="pl-dropdown-search">
                    <input
                      v-model="kanbanFilterSearch.project"
                      type="text"
                      class="bg-input bg-input-sm"
                      placeholder="Tìm Dự án, Mã DA..."
                    />
                  </div>
                  <div class="pl-dropdown-list">
                    <div
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': !filterConfig.projectId }"
                      @click="selectKanbanProjectFilter('')"
                    >
                      <span>Tất cả Dự án &amp; Công việc lẻ</span>
                    </div>
                    <div
                      v-if="kanbanStandaloneCount > 0 || filterConfig.projectId === '__STANDALONE__'"
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': filterConfig.projectId === '__STANDALONE__' }"
                      @click="selectKanbanProjectFilter('__STANDALONE__')"
                    >
                      <div class="pl-dd-main">
                        <span>Chỉ Công việc lẻ (Chưa gắn Dự án)</span>
                        <span class="pl-mini-tag is-slate pl-tabular">{{ kanbanStandaloneCount }} việc</span>
                      </div>
                    </div>
                    <div
                      v-for="opt in filteredKanbanProjectOptions"
                      :key="'kbda-' + opt.id_project"
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': filterConfig.projectId === opt.id_project }"
                      @click="selectKanbanProjectFilter(opt.id_project)"
                    >
                      <div class="pl-dd-main">
                        <span>{{ opt.label }}</span>
                        <span v-if="opt.sub" class="pl-dd-sub">{{ opt.sub }}</span>
                      </div>
                    </div>
                    <div v-if="filteredKanbanProjectOptions.length === 0 && kanbanStandaloneCount === 0" class="pl-dd-empty">Không có Dự án tương ứng</div>
                  </div>
                </div>
              </div>

              <!-- 2. PIPELINE (KHUNG PIPELINE) -->
              <div class="pl-dropdown-anchor" :class="{ 'is-open': openKanbanFilterMenu === 'workflow' }">
                <button
                  type="button"
                  class="pl-picker-trigger is-flat-row"
                  :class="{ 'is-filtered': !!filterConfig.workflowId || selectedWorkflowId !== 'WF_DEFAULT' }"
                  @click="toggleKanbanFilterMenu('workflow')"
                >
                  <svg class="pl-flat-row-ic" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  <span class="pl-picker-lbl">Pipeline</span>
                  <span class="pl-picker-val" :title="activeKanbanWorkflowFilterLabel">{{ activeKanbanWorkflowFilterLabel }}</span>
                  <span
                    v-if="filterConfig.workflowId"
                    class="pl-picker-clear"
                    title="Xóa khóa lọc Khung Pipeline"
                    @click.stop="clearKanbanWorkflowFilter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="pl-caret-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="openKanbanFilterMenu === 'workflow'" class="pl-dropdown-backdrop" @click="openKanbanFilterMenu = ''"></div>
                <div v-if="openKanbanFilterMenu === 'workflow'" class="pl-dropdown-menu">
                  <div class="pl-dropdown-search">
                    <input
                      v-model="kanbanFilterSearch.workflow"
                      type="text"
                      class="bg-input bg-input-sm"
                      placeholder="Tìm Khung Pipeline..."
                    />
                  </div>
                  <div class="pl-dropdown-list">
                    <div
                      v-if="filterConfig.workflowId"
                      class="pl-dropdown-item"
                      @click="clearKanbanWorkflowFilter"
                    >
                      <span>Tất cả Khung tương ứng ({{ kanbanWorkflowFilterOptions.length }})</span>
                    </div>
                    <div
                      v-for="opt in filteredKanbanWorkflowOptions"
                      :key="'kbwf-' + opt.id_workflow"
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': selectedWorkflowId === opt.id_workflow }"
                      @click="selectKanbanWorkflowFilter(opt.id_workflow)"
                    >
                      <div class="pl-dd-main">
                        <div style="min-width: 0; display: flex; flex-direction: column;">
                          <span>{{ opt.label }}</span>
                          <span v-if="opt.sub" class="pl-dd-sub">{{ opt.sub }}</span>
                        </div>
                        <span class="pl-mini-tag is-slate pl-tabular">{{ opt.count }} việc</span>
                      </div>
                    </div>
                    <div v-if="filteredKanbanWorkflowOptions.length === 0" class="pl-dd-empty">Không có Khung Pipeline tương ứng</div>
                  </div>
                </div>
              </div>

              <!-- 3. TÊN CTY -->
              <div class="pl-dropdown-anchor" :class="{ 'is-open': openKanbanFilterMenu === 'company' }">
                <button
                  type="button"
                  class="pl-picker-trigger is-flat-row"
                  :class="{ 'is-filtered': !!filterConfig.companyName }"
                  @click="toggleKanbanFilterMenu('company')"
                >
                  <svg class="pl-flat-row-ic" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="6" x2="9.01" y2="6"></line><line x1="15" y1="6" x2="15.01" y2="6"></line><line x1="9" y1="10" x2="9.01" y2="10"></line><line x1="15" y1="10" x2="15.01" y2="10"></line><line x1="9" y1="18" x2="15" y2="18"></line></svg>
                  <span class="pl-picker-lbl">Tên Cty</span>
                  <span class="pl-picker-val" :title="activeKanbanCompanyFilterLabel">{{ activeKanbanCompanyFilterLabel }}</span>
                  <span
                    v-if="filterConfig.companyName"
                    class="pl-picker-clear"
                    title="Xóa lọc Tên Cty"
                    @click.stop="selectKanbanCompanyFilter('')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="pl-caret-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="openKanbanFilterMenu === 'company'" class="pl-dropdown-backdrop" @click="openKanbanFilterMenu = ''"></div>
                <div v-if="openKanbanFilterMenu === 'company'" class="pl-dropdown-menu">
                  <div class="pl-dropdown-search">
                    <input
                      v-model="kanbanFilterSearch.company"
                      type="text"
                      class="bg-input bg-input-sm"
                      placeholder="Tìm Tên công ty..."
                    />
                  </div>
                  <div class="pl-dropdown-list">
                    <div
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': !filterConfig.companyName }"
                      @click="selectKanbanCompanyFilter('')"
                    >
                      <span>Tất cả Công ty ({{ kanbanCompanyFilterOptions.length }})</span>
                    </div>
                    <div
                      v-for="opt in filteredKanbanCompanyOptions"
                      :key="'kbct-' + opt.key"
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': filterConfig.companyName === opt.key }"
                      @click="selectKanbanCompanyFilter(opt.key)"
                    >
                      <div class="pl-dd-main">
                        <span>{{ opt.label }}</span>
                        <div style="display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;">
                          <span v-if="opt.hasCustomFlow" class="pl-mini-tag is-emerald pl-tabular">
                            {{ opt.customFlowCount > 1 ? opt.customFlowCount + ' Khung' : 'Khung riêng' }}
                          </span>
                          <span v-if="opt.count > 0" class="pl-mini-tag is-slate pl-tabular">{{ opt.count }} việc</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="filteredKanbanCompanyOptions.length === 0" class="pl-dd-empty">Không có Công ty tương ứng</div>
                  </div>
                </div>
              </div>

              <!-- 4. TÊN KH -->
              <div class="pl-dropdown-anchor" :class="{ 'is-open': openKanbanFilterMenu === 'customer' }">
                <button
                  type="button"
                  class="pl-picker-trigger is-flat-row"
                  :class="{ 'is-filtered': !!filterConfig.customerName }"
                  @click="toggleKanbanFilterMenu('customer')"
                >
                  <svg class="pl-flat-row-ic" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span class="pl-picker-lbl">Tên KH</span>
                  <span class="pl-picker-val" :title="activeKanbanCustomerFilterLabel">{{ activeKanbanCustomerFilterLabel }}</span>
                  <span
                    v-if="filterConfig.customerName"
                    class="pl-picker-clear"
                    title="Xóa lọc Tên KH"
                    @click.stop="selectKanbanCustomerFilter('')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="pl-caret-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="openKanbanFilterMenu === 'customer'" class="pl-dropdown-backdrop" @click="openKanbanFilterMenu = ''"></div>
                <div v-if="openKanbanFilterMenu === 'customer'" class="pl-dropdown-menu">
                  <div class="pl-dropdown-search">
                    <input
                      v-model="kanbanFilterSearch.customer"
                      type="text"
                      class="bg-input bg-input-sm"
                      placeholder="Tìm Tên khách hàng / liên hệ..."
                    />
                  </div>
                  <div class="pl-dropdown-list">
                    <div
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': !filterConfig.customerName }"
                      @click="selectKanbanCustomerFilter('')"
                    >
                      <span>Tất cả Khách hàng ({{ kanbanCustomerFilterOptions.length }})</span>
                    </div>
                    <div
                      v-for="opt in filteredKanbanCustomerOptions"
                      :key="'kbkh-' + opt.key"
                      class="pl-dropdown-item"
                      :class="{ 'is-selected': filterConfig.customerName === opt.key }"
                      @click="selectKanbanCustomerFilter(opt.key)"
                    >
                      <div class="pl-dd-main">
                        <span>{{ opt.label }}</span>
                        <span v-if="opt.count > 0" class="pl-mini-tag is-slate pl-tabular">{{ opt.count }} việc</span>
                      </div>
                    </div>
                    <div v-if="filteredKanbanCustomerOptions.length === 0" class="pl-dd-empty">Không có Tên KH tương ứng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- UNIFIED CONTROL, SEARCH & ACTION ROW BELOW DECK:
           LEFT: [CỘT CHUẨN | LÀN DỰ ÁN] + [DARK | LIGHT | CUSTOM]
           CENTER: [KHUNG TÌM KIẾM]
           RIGHT: [LÀM MỚI] + [XUẤT EXCEL] + [+ THÊM CÔNG VIỆC] -->
      <div class="pl-kanban-control-bar">
        <div class="pl-kcb-left">
          <div class="bg-seg-switch is-compact" title="Chế độ hiển thị bảng Kanban">
            <button
              type="button"
              class="bg-seg-btn"
              :class="{ 'is-active': kanbanViewMode === 'standard' }"
              @click="kanbanViewMode = 'standard'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
              <span>Cột chuẩn</span>
            </button>
            <button
              type="button"
              class="bg-seg-btn"
              :class="{ 'is-active': kanbanViewMode === 'swimlane' }"
              @click="kanbanViewMode = 'swimlane'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
              <span>Làn Dự Án</span>
            </button>
          </div>

          <div class="bg-theme-mode-switch" role="tablist" aria-label="Chế độ giao diện">
            <button
              type="button"
              class="bg-theme-seg-btn"
              :class="{ 'is-active': uiTheme === 'dark' }"
              @click="setUiTheme('dark')"
              title="Giao diện Dark Navy"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              <span>Dark</span>
            </button>
            <button
              type="button"
              class="bg-theme-seg-btn"
              :class="{ 'is-active': uiTheme === 'light' }"
              @click="setUiTheme('light')"
              title="Giao diện Enterprise Light Blue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              <span>Light</span>
            </button>
            <button
              type="button"
              class="bg-theme-seg-btn"
              :class="{ 'is-active': uiTheme === 'custom' }"
              @click="onClickCustomThemeBtn($event)"
              title="Giao diện Custom Glassify"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <span>Custom</span>
            </button>
            <button
              v-if="uiTheme === 'custom'"
              type="button"
              class="bg-theme-tuner-btn"
              :class="{ 'is-open': showCustomGlassTuner }"
              @click.stop="toggleCustomGlassTuner($event)"
              title="Tùy chỉnh độ trong suốt & độ sáng kính"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
            </button>
          </div>
        </div>

        <div class="pl-kcb-center">
          <div
            class="bg-search-shell is-control-bar-search"
            :class="{ 'has-query': Boolean(searchQuery && searchQuery.trim()) }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              ref="kanbanSearchInputRef"
              v-model="searchQuery"
              type="text"
              class="bg-search-inp"
              placeholder="Tìm KH, Công ty, Nội dung công việc, Dự án, File..."
              @keydown.esc="onKanbanSearchEsc"
            />
            <span
              v-if="searchQuery && searchQuery.trim()"
              class="pl-search-match-pill pl-tabular"
              :class="{ 'is-zero': displayedKanbanItems.length === 0 }"
            >
              {{ displayedKanbanItems.length }} kết quả
            </span>
            <button
              v-if="searchQuery"
              type="button"
              class="bg-search-clr"
              aria-label="Xóa tìm kiếm"
              @mousedown.prevent
              @click="searchQuery = ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div class="pl-kcb-right">
          <button
            type="button"
            class="pl-btn pl-btn-slate pl-btn-sm"
            :disabled="loading"
            @click="refreshWorkspace"
            title="Tải lại dữ liệu từ Firebase"
          >
            <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
            <span v-else class="pl-spinner-xs"></span>
            <span class="bg-hide-sm">Làm mới</span>
          </button>

          <button
            type="button"
            class="pl-btn pl-btn-slate pl-btn-sm"
            @click="showExportModal = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            class="pl-btn pl-btn-primary pl-btn-sm"
            @click="openAddModal()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Thêm Công Việc</span>
          </button>
        </div>
      </div>

      <!-- LOADING SKELETON -->
      <div v-if="loading && items.length === 0" class="pl-empty-panel">
        <div class="pl-spinner-lg"></div>
        <div class="pl-empty-title">Đang tải dữ liệu Pipeline &amp; Dự án...</div>
      </div>

      <!-- =====================================================
           KANBAN VIEW A: STANDARD COLUMNS (STICKY NON-CLIPPED HEADER + DRAG & DROP)
           ===================================================== -->
      <div v-else-if="kanbanViewMode === 'standard'" class="pl-kanban-board-area">
        <div ref="boardStickySentinelRef" class="pl-board-sticky-sentinel" aria-hidden="true"></div>

        <!-- FULL-BLEED STICKY PIPELINE BOARD HEADER DOCK (ZERO CORNER/GAP CLIPPING ON SCROLL) -->
        <div
          class="pl-board-sticky-shell"
          :class="{ 'is-stuck': isBoardHeaderStuck }"
        >
          <div
            ref="boardStickyHeadScrollRef"
            class="pl-board-sticky-viewport"
            @scroll.passive="onStickyHeadHorizontalScroll"
          >
            <div class="pl-board-sticky-track">
              <!-- UNASSIGNED STICKY CAP -->
              <div
                v-if="filteredUnassignedItems.length > 0"
                class="pl-sticky-col-cap is-unassigned"
                :class="{ 'is-collapsed': collapsedCols.unassigned }"
                style="--col-accent: #f59e0b"
                :title="collapsedCols.unassigned ? 'Mở rộng cột: CHƯA PHÂN LOẠI (' + filteredUnassignedItems.length + ')' : 'Thu gọn cột CHƯA PHÂN LOẠI'"
                @click="collapsedCols.unassigned = !collapsedCols.unassigned"
              >
                <div class="kanban-col-title">
                  <span v-if="!collapsedCols.unassigned" class="pl-col-dot" style="background: #f59e0b;"></span>
                  <span v-if="!collapsedCols.unassigned" class="kanban-col-name">CHƯA PHÂN LOẠI</span>
                  <span class="kanban-col-count pl-tabular">{{ filteredUnassignedItems.length }}</span>
                  <span class="kanban-col-toggle">
                    <svg v-if="collapsedCols.unassigned" xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </span>
                </div>
              </div>

              <!-- DYNAMIC WORKFLOW STICKY CAPS -->
              <div
                v-for="col in COLUMNS"
                :key="'sh-' + col.id"
                class="pl-sticky-col-cap"
                :class="{
                  'is-collapsed': collapsedCols[col.id],
                  'is-col-success': col.id === 'hoan_thanh',
                  'is-col-fail': col.id === 'that_bai'
                }"
                :style="{ '--col-accent': getColTitleColor(col.id) }"
                :title="collapsedCols[col.id] ? 'Mở rộng cột: ' + col.label + ' (' + getColumnFilteredItems(col.id).length + ')' : (col.value || col.label)"
                @click="toggleColumnCollapse(col.id)"
              >
                <div class="kanban-col-title">
                  <span v-if="!collapsedCols[col.id]" class="pl-col-dot" :style="{ backgroundColor: getColTitleColor(col.id) }"></span>
                  <span v-if="!collapsedCols[col.id]" class="kanban-col-name">{{ col.label }}</span>
                  <span class="kanban-col-count pl-tabular">{{ getColumnFilteredItems(col.id).length }}</span>
                  <span class="kanban-col-toggle">
                    <svg v-if="collapsedCols[col.id]" xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref="kanbanBodyScrollRef"
          class="pl-kanban-scroll"
          @scroll.passive="onKanbanBodyHorizontalScroll"
        >
          <div class="kanban-board">
            <!-- UNASSIGNED COLUMN -->
            <div
              v-if="filteredUnassignedItems.length > 0"
              class="kanban-column is-unassigned"
              :class="{ 'is-collapsed': collapsedCols.unassigned }"
              data-col-name="Chưa phân loại"
            >
              <div class="kanban-col-head" @click="collapsedCols.unassigned = !collapsedCols.unassigned">
                <div class="kanban-col-title">
                  <span class="pl-col-dot" style="background: #f59e0b;"></span>
                  <span class="kanban-col-name">CHƯA PHÂN LOẠI</span>
                  <span class="kanban-col-count pl-tabular pl-col-body-meta">{{ filteredUnassignedItems.length }}</span>
                  <span class="kanban-col-toggle pl-col-body-meta">
                    <svg v-if="collapsedCols.unassigned" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </span>
                </div>
              </div>

            <draggable
              v-show="!collapsedCols.unassigned"
              v-model="boardData.unassigned"
              group="pipeline"
              item-key="Id_pipeline"
              draggable=".pl-card"
              class="draggable-zone"
              :disabled="isMobile"
              @start="isDragging = true; closeKanbanCardMenu()"
              @end="isDragging = false"
              @change="onChange($event, 'unassigned')"
            >
              <template #item="{ element }">
                <div
                  v-show="matchesSearch(element)"
                  :id="'pipeline-card-' + element.Id_pipeline"
                  class="pl-card is-pending"
                  :class="{
                    'is-priority': isPriorityCard(element),
                    'is-followup': isFollowupCard(element),
                    'is-kmenu-open': openKanbanCardMenuId === element.Id_pipeline,
                    'is-search-hit': activeSearchTokens.length > 0,
                    'highlight-card': highlightedCardId === element.Id_pipeline,
                    'dropped-success': droppedCardId === element.Id_pipeline
                  }"
                  style="--card-accent: #f59e0b"
                  @click="openEditModal(element)"
                >
                  <!-- QUICK ACTION MENU TRIGGER (TOP RIGHT, ZERO LAYOUT SHIFT) -->
                  <div class="pl-kcard-menu-anchor" @mousedown.stop @click.stop>
                    <button
                      type="button"
                      class="pl-kcard-more-btn"
                      :class="{ 'is-active': openKanbanCardMenuId === element.Id_pipeline }"
                      title="Thao tác nhanh"
                      aria-label="Thao tác nhanh"
                      @click.stop="toggleKanbanCardMenu(element.Id_pipeline)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                    </button>

                    <div
                      v-if="openKanbanCardMenuId === element.Id_pipeline"
                      class="pl-kcard-menu-backdrop"
                      @click.stop="closeKanbanCardMenu"
                    ></div>

                    <div
                      v-if="openKanbanCardMenuId === element.Id_pipeline"
                      class="pl-kcard-menu"
                      @click.stop
                    >
                      <button
                        type="button"
                        class="pl-kcard-menu-item"
                        @click="handleKanbanMenuDuplicate(element)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Nhân bản công việc</span>
                      </button>

                      <button
                        v-if="element.id_project"
                        type="button"
                        class="pl-kcard-menu-item"
                        @click="handleKanbanMenuOpenProject(element)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        <span>Mở Dự án gốc ↗</span>
                      </button>

                      <div class="pl-kcard-menu-sep"></div>
                      <div class="pl-kcard-menu-lbl">Chuyển bước tiến độ</div>
                      <div class="pl-kcard-menu-stages">
                        <button
                          type="button"
                          class="pl-kcard-stage-opt is-current"
                          :style="{ '--step-clr': '#f59e0b' }"
                          @click="handleKanbanMenuMoveStage(element, 'unassigned')"
                        >
                          <span class="pl-kcard-stage-dot"></span>
                          <span class="pl-kcard-stage-name">Chưa phân loại</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                        <button
                          v-for="mc in COLUMNS"
                          :key="element.Id_pipeline + '-um-' + mc.id"
                          type="button"
                          class="pl-kcard-stage-opt"
                          :style="{ '--step-clr': getColTitleColor(mc.id) }"
                          @click="handleKanbanMenuMoveStage(element, mc.id)"
                        >
                          <span class="pl-kcard-stage-dot"></span>
                          <span class="pl-kcard-stage-pct pl-tabular">{{ mc.percent }}</span>
                          <span class="pl-kcard-stage-name">{{ mc.label }}</span>
                        </button>
                      </div>

                      <div class="pl-kcard-menu-sep"></div>
                      <button
                        type="button"
                        class="pl-kcard-menu-item is-danger"
                        @click="handleKanbanMenuDelete(element)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        <span>Xoá công việc</span>
                      </button>
                    </div>
                  </div>

                  <!-- BODY: TIMELINE (NHỎ TRÁI) -> CÔNG TY (NHỎ) -> KHÁCH (NHỎ) -> TÊN CÔNG VIỆC (TO ĐẬM) -->
                  <div class="pl-kcard-body">
                    <div
                      v-if="element.finish_time"
                      class="pl-kcard-timeline pl-tabular"
                      :title="'Timeline dự kiến: ' + element.finish_time"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span v-html="highlightKanbanText(element.finish_time)"></span>
                    </div>

                    <div
                      v-if="element.ten_cong_ty"
                      class="pl-kcard-company"
                      :title="element.ten_cong_ty"
                      v-html="highlightKanbanText(element.ten_cong_ty)"
                    ></div>

                    <div
                      v-if="hasDistinctCardContact(element)"
                      class="pl-kcard-customer"
                      :title="element.ten_khach_hang"
                      v-html="highlightKanbanText(element.ten_khach_hang)"
                    ></div>

                    <div class="pl-kcard-task-row">
                      <div
                        class="pl-kcard-title"
                        :class="{ 'is-empty-title': !element.content_of_contract_po }"
                        :title="element.content_of_contract_po || ''"
                        v-html="highlightKanbanText(element.content_of_contract_po, 'Chưa nhập tên công việc')"
                      ></div>
                    </div>
                  </div>

                  <!-- HÀNG RIÊNG 1: FILE ĐÍNH KÈM -->
                  <div
                    v-if="getParsedFiles(element).length > 0"
                    class="pl-kcard-att-block"
                    @mousedown.stop
                    @click.stop
                  >
                    <button
                      type="button"
                      class="pl-dcard-link-toggle is-full-row"
                      :class="{ 'is-open': isCardFilesOpen(element.Id_pipeline, element) }"
                      @click.stop="toggleCardFiles(element.Id_pipeline, element)"
                    >
                      <span class="pl-dcard-link-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        <span class="pl-tabular">File đính kèm ({{ getParsedFiles(element).length }})</span>
                      </span>
                      <span class="pl-dcard-link-caret">{{ isCardFilesOpen(element.Id_pipeline, element) ? '▴' : '▾' }}</span>
                    </button>

                    <div
                      class="pl-dcard-collapse"
                      :class="{ 'is-open': isCardFilesOpen(element.Id_pipeline, element) }"
                    >
                      <div class="pl-dcard-collapse-inner">
                        <div class="pl-dcard-collapse-box">
                          <div class="pl-rep-file-list is-compact is-no-top-gap">
                            <div
                              v-for="(f, fi) in getParsedFiles(element)"
                              :key="'uf-' + fi"
                              class="pl-rep-file-pill"
                            >
                              <span class="pl-rep-file-ic" v-html="getFileIconSvg(f.name, f.url)"></span>
                              <a
                                :href="getPreviewUrl(f.url)"
                                target="_blank"
                                class="pl-rep-file-name is-clickable"
                                :title="f.name"
                                @click.stop.prevent="openReportAttachmentView(f)"
                                v-html="highlightKanbanText(f.name)"
                              ></a>
                              <button
                                type="button"
                                class="pl-rep-file-act is-view"
                                :title="f.kind === 'image' ? 'Xem ảnh' : 'Xem qua ViewOffice / Trình xem'"
                                @click.stop.prevent="openReportAttachmentView(f)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              </button>
                              <a
                                :href="getDownloadUrl(f.url)"
                                class="pl-rep-file-act is-dl"
                                title="Tải xuống"
                                @click.stop="handleDownloadClick($event, f.url, f.name)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- HÀNG RIÊNG 2: REPORT ĐÍNH KÈM -->
                  <div
                    v-if="getPipeReportIds(element).length > 0"
                    class="pl-kcard-att-block"
                    @mousedown.stop
                    @click.stop
                  >
                    <button
                      type="button"
                      class="pl-dcard-link-toggle is-report-pill is-full-row"
                      :class="{ 'is-open': isCardReportsOpen(element.Id_pipeline, element) }"
                      @click.stop="toggleCardReports(element.Id_pipeline, element)"
                    >
                      <span class="pl-dcard-link-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                        <span class="pl-tabular">
                          Report đính kèm ({{ getPipeReportIds(element).length }}{{ getCardReportAttachmentCount(element) > 0 ? ' • ' + getCardReportAttachmentCount(element) + ' tệp' : '' }})
                        </span>
                      </span>
                      <span class="pl-dcard-link-caret">{{ isCardReportsOpen(element.Id_pipeline, element) ? '▴' : '▾' }}</span>
                    </button>

                    <div
                      class="pl-dcard-collapse"
                      :class="{ 'is-open': isCardReportsOpen(element.Id_pipeline, element) }"
                    >
                      <div class="pl-dcard-collapse-inner">
                        <div class="pl-dcard-collapse-box">
                          <div
                            v-for="(repId, ri) in getPipeReportIds(element)"
                            :key="ri"
                            class="pl-rep-mini-item"
                          >
                            <div class="pl-linked-rep-head">
                              <span
                                class="pl-linked-rep-title"
                                :title="getReportDetails(repId).noi_dung"
                                v-html="highlightKanbanText(getReportDetails(repId).noi_dung)"
                              ></span>
                              <button
                                type="button"
                                class="pl-linked-rep-eye"
                                title="Xem Report trên trang Report Firebase (Mở tab mới)"
                                @click.stop="openReportInNewTab(repId)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              </button>
                            </div>
                            <div
                              v-if="getReportDetails(repId).ghi_chu"
                              class="pl-linked-rep-note"
                              v-html="highlightKanbanText(getReportDetails(repId).ghi_chu)"
                            ></div>
                            <div
                              v-if="getUnifiedReportAttachments(repId).length > 0"
                              class="pl-rep-file-list is-compact"
                            >
                              <div
                                v-for="(att, atti) in getUnifiedReportAttachments(repId)"
                                :key="'katt-' + ri + '-' + atti"
                                class="pl-rep-file-pill"
                              >
                                <span class="pl-rep-file-ic" v-html="getReportAttIconSvg(att)"></span>
                                <span class="pl-rep-file-badge" :class="att.badgeCls">{{ att.badgeLabel }}</span>
                                <span class="pl-rep-file-name" :title="att.name" v-html="highlightKanbanText(att.name)"></span>
                                <button
                                  type="button"
                                  class="pl-rep-file-act is-view"
                                  :title="att.kind === 'image' ? 'Xem ảnh' : 'Xem qua ViewOffice / Trình xem'"
                                  @click.stop.prevent="openReportAttachmentView(att)"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                                <a
                                  :href="getDownloadUrl(att.url)"
                                  class="pl-rep-file-act is-dl"
                                  title="Tải xuống"
                                  @click.stop="handleDownloadClick($event, att.url, att.name)"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>

          <!-- DYNAMIC WORKFLOW COLUMNS -->
          <div
            v-for="col in COLUMNS"
            :key="col.id"
            class="kanban-column"
            :class="{
              'is-collapsed': collapsedCols[col.id],
              'is-col-success': col.id === 'hoan_thanh',
              'is-col-fail': col.id === 'that_bai'
            }"
            :data-col-name="col.label"
            :style="{ '--col-accent': getColTitleColor(col.id) }"
          >
            <div class="kanban-col-head" @click="toggleColumnCollapse(col.id)">
              <div class="kanban-col-title">
                <span class="pl-col-dot" :style="{ backgroundColor: getColTitleColor(col.id) }"></span>
                <span class="kanban-col-name" :title="col.value">{{ col.label }}</span>
                <span class="kanban-col-count pl-tabular pl-col-body-meta">{{ getColumnFilteredItems(col.id).length }}</span>
                <span class="kanban-col-toggle pl-col-body-meta">
                  <svg v-if="collapsedCols[col.id]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </span>
              </div>
            </div>

            <draggable
              v-show="!collapsedCols[col.id]"
              v-model="boardData[col.id]"
              group="pipeline"
              item-key="Id_pipeline"
              draggable=".pl-card"
              class="draggable-zone"
              :disabled="isMobile"
              @start="isDragging = true; closeKanbanCardMenu()"
              @end="isDragging = false"
              @change="onChange($event, col.id)"
            >
              <template #item="{ element }">
                <div
                  v-show="matchesSearch(element)"
                  :id="'pipeline-card-' + element.Id_pipeline"
                  class="pl-card"
                  :class="{
                    'is-done': col.id === 'hoan_thanh',
                    'is-failed': col.id === 'that_bai',
                    'is-pending': col.id !== 'hoan_thanh' && col.id !== 'that_bai',
                    'is-priority': isPriorityCard(element),
                    'is-followup': isFollowupCard(element),
                    'is-kmenu-open': openKanbanCardMenuId === element.Id_pipeline,
                    'is-search-hit': activeSearchTokens.length > 0,
                    'highlight-card': highlightedCardId === element.Id_pipeline,
                    'dropped-success': droppedCardId === element.Id_pipeline
                  }"
                  :style="{ '--card-accent': getColTitleColor(col.id) }"
                  @click="openEditModal(element)"
                >
                  <!-- QUICK ACTION MENU TRIGGER (TOP RIGHT, ZERO LAYOUT SHIFT) -->
                  <div class="pl-kcard-menu-anchor" @mousedown.stop @click.stop>
                    <button
                      type="button"
                      class="pl-kcard-more-btn"
                      :class="{ 'is-active': openKanbanCardMenuId === element.Id_pipeline }"
                      title="Thao tác nhanh"
                      aria-label="Thao tác nhanh"
                      @click.stop="toggleKanbanCardMenu(element.Id_pipeline)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                    </button>

                    <div
                      v-if="openKanbanCardMenuId === element.Id_pipeline"
                      class="pl-kcard-menu-backdrop"
                      @click.stop="closeKanbanCardMenu"
                    ></div>

                    <div
                      v-if="openKanbanCardMenuId === element.Id_pipeline"
                      class="pl-kcard-menu"
                      @click.stop
                    >
                      <button
                        type="button"
                        class="pl-kcard-menu-item"
                        @click="handleKanbanMenuDuplicate(element)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Nhân bản công việc</span>
                      </button>

                      <button
                        v-if="element.id_project"
                        type="button"
                        class="pl-kcard-menu-item"
                        @click="handleKanbanMenuOpenProject(element)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        <span>Mở Dự án gốc ↗</span>
                      </button>

                      <div class="pl-kcard-menu-sep"></div>
                      <div class="pl-kcard-menu-lbl">Chuyển bước tiến độ</div>
                      <div class="pl-kcard-menu-stages">
                        <button
                          v-for="mc in COLUMNS"
                          :key="element.Id_pipeline + '-km-' + mc.id"
                          type="button"
                          class="pl-kcard-stage-opt"
                          :class="{ 'is-current': col.id === mc.id }"
                          :style="{ '--step-clr': getColTitleColor(mc.id) }"
                          @click="handleKanbanMenuMoveStage(element, mc.id)"
                        >
                          <span class="pl-kcard-stage-dot"></span>
                          <span class="pl-kcard-stage-pct pl-tabular">{{ mc.percent }}</span>
                          <span class="pl-kcard-stage-name">{{ mc.label }}</span>
                          <svg v-if="col.id === mc.id" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                      </div>

                      <div class="pl-kcard-menu-sep"></div>
                      <button
                        type="button"
                        class="pl-kcard-menu-item is-danger"
                        @click="handleKanbanMenuDelete(element)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        <span>Xoá công việc</span>
                      </button>
                    </div>
                  </div>

                  <!-- BODY: TIMELINE (NHỎ TRÁI) -> CÔNG TY (NHỎ) -> KHÁCH (NHỎ) -> TÊN CÔNG VIỆC (TO ĐẬM) -->
                  <div class="pl-kcard-body">
                    <div
                      v-if="element.finish_time"
                      class="pl-kcard-timeline pl-tabular"
                      :title="'Timeline dự kiến: ' + element.finish_time"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span v-html="highlightKanbanText(element.finish_time)"></span>
                    </div>

                    <div
                      v-if="element.ten_cong_ty"
                      class="pl-kcard-company"
                      :title="element.ten_cong_ty"
                      v-html="highlightKanbanText(element.ten_cong_ty)"
                    ></div>

                    <div
                      v-if="hasDistinctCardContact(element)"
                      class="pl-kcard-customer"
                      :title="element.ten_khach_hang"
                      v-html="highlightKanbanText(element.ten_khach_hang)"
                    ></div>

                    <div class="pl-kcard-task-row">
                      <span v-if="col.id === 'hoan_thanh'" class="pl-dcard-done-circle is-sm" title="Đã chốt thành công (100%)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="9.5" height="9.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </span>
                      <span v-else-if="col.id === 'that_bai'" class="pl-dcard-done-circle is-fail-circle is-sm" title="Thất bại (0%)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </span>
                      <div
                        class="pl-kcard-title"
                        :class="{ 'is-empty-title': !element.content_of_contract_po }"
                        :title="element.content_of_contract_po || ''"
                        v-html="highlightKanbanText(element.content_of_contract_po, 'Chưa nhập tên công việc')"
                      ></div>
                    </div>
                  </div>

                  <!-- HÀNG RIÊNG 1: FILE ĐÍNH KÈM -->
                  <div
                    v-if="getParsedFiles(element).length > 0"
                    class="pl-kcard-att-block"
                    @mousedown.stop
                    @click.stop
                  >
                    <button
                      type="button"
                      class="pl-dcard-link-toggle is-full-row"
                      :class="{ 'is-open': isCardFilesOpen(element.Id_pipeline, element) }"
                      @click.stop="toggleCardFiles(element.Id_pipeline, element)"
                    >
                      <span class="pl-dcard-link-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        <span class="pl-tabular">File đính kèm ({{ getParsedFiles(element).length }})</span>
                      </span>
                      <span class="pl-dcard-link-caret">{{ isCardFilesOpen(element.Id_pipeline, element) ? '▴' : '▾' }}</span>
                    </button>

                    <div
                      class="pl-dcard-collapse"
                      :class="{ 'is-open': isCardFilesOpen(element.Id_pipeline, element) }"
                    >
                      <div class="pl-dcard-collapse-inner">
                        <div class="pl-dcard-collapse-box">
                          <div class="pl-rep-file-list is-compact is-no-top-gap">
                            <div
                              v-for="(f, fi) in getParsedFiles(element)"
                              :key="'uf-' + fi"
                              class="pl-rep-file-pill"
                            >
                              <span class="pl-rep-file-ic" v-html="getFileIconSvg(f.name, f.url)"></span>
                              <a
                                :href="getPreviewUrl(f.url)"
                                target="_blank"
                                class="pl-rep-file-name is-clickable"
                                :title="f.name"
                                @click.stop.prevent="openReportAttachmentView(f)"
                                v-html="highlightKanbanText(f.name)"
                              ></a>
                              <button
                                type="button"
                                class="pl-rep-file-act is-view"
                                :title="f.kind === 'image' ? 'Xem ảnh' : 'Xem qua ViewOffice / Trình xem'"
                                @click.stop.prevent="openReportAttachmentView(f)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              </button>
                              <a
                                :href="getDownloadUrl(f.url)"
                                class="pl-rep-file-act is-dl"
                                title="Tải xuống"
                                @click.stop="handleDownloadClick($event, f.url, f.name)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- HÀNG RIÊNG 2: REPORT ĐÍNH KÈM -->
                  <div
                    v-if="getPipeReportIds(element).length > 0"
                    class="pl-kcard-att-block"
                    @mousedown.stop
                    @click.stop
                  >
                    <button
                      type="button"
                      class="pl-dcard-link-toggle is-report-pill is-full-row"
                      :class="{ 'is-open': isCardReportsOpen(element.Id_pipeline, element) }"
                      @click.stop="toggleCardReports(element.Id_pipeline, element)"
                    >
                      <span class="pl-dcard-link-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                        <span class="pl-tabular">
                          Report đính kèm ({{ getPipeReportIds(element).length }}{{ getCardReportAttachmentCount(element) > 0 ? ' • ' + getCardReportAttachmentCount(element) + ' tệp' : '' }})
                        </span>
                      </span>
                      <span class="pl-dcard-link-caret">{{ isCardReportsOpen(element.Id_pipeline, element) ? '▴' : '▾' }}</span>
                    </button>

                    <div
                      class="pl-dcard-collapse"
                      :class="{ 'is-open': isCardReportsOpen(element.Id_pipeline, element) }"
                    >
                      <div class="pl-dcard-collapse-inner">
                        <div class="pl-dcard-collapse-box">
                          <div
                            v-for="(repId, ri) in getPipeReportIds(element)"
                            :key="ri"
                            class="pl-rep-mini-item"
                          >
                            <div class="pl-linked-rep-head">
                              <span
                                class="pl-linked-rep-title"
                                :title="getReportDetails(repId).noi_dung"
                                v-html="highlightKanbanText(getReportDetails(repId).noi_dung)"
                              ></span>
                              <button
                                type="button"
                                class="pl-linked-rep-eye"
                                title="Xem Report trên trang Report Firebase (Mở tab mới)"
                                @click.stop="openReportInNewTab(repId)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              </button>
                            </div>
                            <div
                              v-if="getReportDetails(repId).ghi_chu"
                              class="pl-linked-rep-note"
                              v-html="highlightKanbanText(getReportDetails(repId).ghi_chu)"
                            ></div>
                            <div
                              v-if="getUnifiedReportAttachments(repId).length > 0"
                              class="pl-rep-file-list is-compact"
                            >
                              <div
                                v-for="(att, atti) in getUnifiedReportAttachments(repId)"
                                :key="'katt-' + ri + '-' + atti"
                                class="pl-rep-file-pill"
                              >
                                <span class="pl-rep-file-ic" v-html="getReportAttIconSvg(att)"></span>
                                <span class="pl-rep-file-badge" :class="att.badgeCls">{{ att.badgeLabel }}</span>
                                <span class="pl-rep-file-name" :title="att.name" v-html="highlightKanbanText(att.name)"></span>
                                <button
                                  type="button"
                                  class="pl-rep-file-act is-view"
                                  :title="att.kind === 'image' ? 'Xem ảnh' : 'Xem qua ViewOffice / Trình xem'"
                                  @click.stop.prevent="openReportAttachmentView(att)"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                                <a
                                  :href="getDownloadUrl(att.url)"
                                  class="pl-rep-file-act is-dl"
                                  title="Tải xuống"
                                  @click.stop="handleDownloadClick($event, att.url, att.name)"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template #footer>
                <button
                  type="button"
                  class="pl-col-add-card"
                  :class="{
                    'is-outcome-win': col.id === 'hoan_thanh',
                    'is-outcome-fail': col.id === 'that_bai'
                  }"
                  :style="{ '--add-accent': getColTitleColor(col.id) }"
                  :title="'Thêm công việc mới vào cột ' + col.label"
                  @click="openAddModalForColumn(col)"
                >
                  <span class="pl-col-add-ic" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </span>
                  <span class="pl-col-add-txt">Thêm công việc</span>
                </button>
              </template>
            </draggable>
            </div>
          </div>
        </div>
      </div>

      <!-- =====================================================
           KANBAN VIEW B: PROJECT SWIMLANES (1 DỰ ÁN NHIỀU PIPELINE)
           ===================================================== -->
      <div v-else class="pl-swimlane-stack">
        <div
          v-for="lane in swimlaneRows"
          :key="lane.laneId"
          class="pl-swimlane-card"
        >
          <div class="pl-swimlane-head" @click="toggleSwimlane(lane.laneId)">
            <div class="pl-swimlane-left">
              <span class="pl-swimlane-caret" :class="{ 'is-collapsed': collapsedSwimlanes[lane.laneId] }">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
              <span
                v-if="lane.project"
                class="pl-code-pill pl-mono"
                v-html="highlightKanbanText(lane.project.ma_du_an || 'DỰ ÁN')"
              ></span>
              <span class="pl-swimlane-title" v-html="highlightKanbanText(lane.title)"></span>
              <span v-if="lane.subtitle" class="pl-swimlane-sub">
                • KH Gốc: <span v-html="highlightKanbanText(lane.subtitle)"></span>
              </span>
              <span class="pl-status-pill is-sky pl-tabular">{{ lane.cardsInActiveFlow.length }} Công việc ở Khung này</span>
              <span v-if="lane.otherFlowCount > 0" class="pl-status-pill is-amber pl-tabular">
                +{{ lane.otherFlowCount }} Công việc ở Khung khác
              </span>
            </div>

            <div class="pl-swimlane-right" @click.stop>
              <span class="pl-swimlane-vol pl-tabular">Tổng: {{ formatNumber(lane.totalVolume) || '0' }}</span>
              <button
                v-if="lane.project"
                type="button"
                class="pl-btn pl-btn-sky-soft pl-btn-xs"
                @click="openAddPipelineForProject(lane.project, selectedWorkflowId)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Thêm Công việc</span>
              </button>
              <button
                v-if="lane.project"
                type="button"
                class="pl-btn pl-btn-slate pl-btn-xs"
                @click="openProjectDetailModal(lane.project)"
              >
                <span>Điều phối Dự án</span>
              </button>
            </div>
          </div>

          <div v-show="!collapsedSwimlanes[lane.laneId]" class="pl-swimlane-grid">
            <div
              v-for="col in COLUMNS"
              :key="lane.laneId + '-' + col.id"
              class="pl-swimlane-cell"
              :class="{
                'is-cell-success': col.id === 'hoan_thanh',
                'is-cell-fail': col.id === 'that_bai'
              }"
            >
              <div class="pl-swimlane-cell-head">
                <span class="pl-col-dot" :style="{ backgroundColor: getColTitleColor(col.id) }"></span>
                <span class="pl-swimlane-col-lbl">{{ col.label }}</span>
                <span class="pl-tabular">({{ getSwimlaneCellCards(lane, col.id).length }})</span>
              </div>

              <div class="pl-swimlane-cell-cards">
                <div
                  v-for="card in getSwimlaneCellCards(lane, col.id)"
                  :key="card.Id_pipeline"
                  :id="'pipeline-card-' + card.Id_pipeline"
                  class="pl-card is-compact"
                  :class="{
                    'is-done': col.id === 'hoan_thanh',
                    'is-failed': col.id === 'that_bai',
                    'is-pending': col.id !== 'hoan_thanh' && col.id !== 'that_bai',
                    'is-priority': isPriorityCard(card),
                    'is-followup': isFollowupCard(card),
                    'is-search-hit': activeSearchTokens.length > 0,
                    'highlight-card': highlightedCardId === card.Id_pipeline
                  }"
                  :style="{ '--card-accent': getColTitleColor(col.id) }"
                  @click="openEditModal(card)"
                >
                  <div class="pl-kcard-body is-no-menu">
                    <div
                      v-if="card.finish_time"
                      class="pl-kcard-timeline pl-tabular"
                      :title="'Timeline dự kiến: ' + card.finish_time"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span v-html="highlightKanbanText(card.finish_time)"></span>
                    </div>

                    <div
                      v-if="card.ten_cong_ty"
                      class="pl-kcard-company"
                      :title="card.ten_cong_ty"
                      v-html="highlightKanbanText(card.ten_cong_ty)"
                    ></div>

                    <div
                      v-if="hasDistinctCardContact(card)"
                      class="pl-kcard-customer"
                      :title="card.ten_khach_hang"
                      v-html="highlightKanbanText(card.ten_khach_hang)"
                    ></div>

                    <div class="pl-kcard-task-row">
                      <span v-if="col.id === 'hoan_thanh'" class="pl-dcard-done-circle is-sm" title="Đã chốt thành công (100%)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="9.5" height="9.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </span>
                      <span v-else-if="col.id === 'that_bai'" class="pl-dcard-done-circle is-fail-circle is-sm" title="Thất bại (0%)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </span>
                      <div
                        class="pl-kcard-title"
                        :class="{ 'is-empty-title': !card.content_of_contract_po }"
                        :title="card.content_of_contract_po || ''"
                        v-html="highlightKanbanText(card.content_of_contract_po, 'Chưa nhập tên công việc')"
                      ></div>
                    </div>
                  </div>

                  <div
                    v-if="getParsedFiles(card).length > 0"
                    class="pl-kcard-att-block"
                    @mousedown.stop
                    @click.stop
                  >
                    <button
                      type="button"
                      class="pl-dcard-link-toggle is-full-row"
                      :class="{ 'is-open': isCardFilesOpen(card.Id_pipeline, card) }"
                      @click.stop="toggleCardFiles(card.Id_pipeline, card)"
                    >
                      <span class="pl-dcard-link-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        <span class="pl-tabular">File đính kèm ({{ getParsedFiles(card).length }})</span>
                      </span>
                      <span class="pl-dcard-link-caret">{{ isCardFilesOpen(card.Id_pipeline, card) ? '▴' : '▾' }}</span>
                    </button>

                    <div
                      class="pl-dcard-collapse"
                      :class="{ 'is-open': isCardFilesOpen(card.Id_pipeline, card) }"
                    >
                      <div class="pl-dcard-collapse-inner">
                        <div class="pl-dcard-collapse-box">
                          <div class="pl-rep-file-list is-compact is-no-top-gap">
                            <div
                              v-for="(f, fi) in getParsedFiles(card)"
                              :key="'sf-' + fi"
                              class="pl-rep-file-pill"
                            >
                              <span class="pl-rep-file-ic" v-html="getFileIconSvg(f.name, f.url)"></span>
                              <a
                                :href="getPreviewUrl(f.url)"
                                target="_blank"
                                class="pl-rep-file-name is-clickable"
                                :title="f.name"
                                @click.stop.prevent="openReportAttachmentView(f)"
                                v-html="highlightKanbanText(f.name)"
                              ></a>
                              <button
                                type="button"
                                class="pl-rep-file-act is-view"
                                :title="f.kind === 'image' ? 'Xem ảnh' : 'Xem qua ViewOffice / Trình xem'"
                                @click.stop.prevent="openReportAttachmentView(f)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              </button>
                              <a
                                :href="getDownloadUrl(f.url)"
                                class="pl-rep-file-act is-dl"
                                title="Tải xuống"
                                @click.stop="handleDownloadClick($event, f.url, f.name)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="getPipeReportIds(card).length > 0"
                    class="pl-kcard-att-block"
                    @mousedown.stop
                    @click.stop
                  >
                    <button
                      type="button"
                      class="pl-dcard-link-toggle is-report-pill is-full-row"
                      :class="{ 'is-open': isCardReportsOpen(card.Id_pipeline, card) }"
                      @click.stop="toggleCardReports(card.Id_pipeline, card)"
                    >
                      <span class="pl-dcard-link-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                        <span class="pl-tabular">
                          Report đính kèm ({{ getPipeReportIds(card).length }}{{ getCardReportAttachmentCount(card) > 0 ? ' • ' + getCardReportAttachmentCount(card) + ' tệp' : '' }})
                        </span>
                      </span>
                      <span class="pl-dcard-link-caret">{{ isCardReportsOpen(card.Id_pipeline, card) ? '▴' : '▾' }}</span>
                    </button>

                    <div
                      class="pl-dcard-collapse"
                      :class="{ 'is-open': isCardReportsOpen(card.Id_pipeline, card) }"
                    >
                      <div class="pl-dcard-collapse-inner">
                        <div class="pl-dcard-collapse-box">
                          <div
                            v-for="(repId, ri) in getPipeReportIds(card)"
                            :key="ri"
                            class="pl-rep-mini-item"
                          >
                            <div class="pl-linked-rep-head">
                              <span
                                class="pl-linked-rep-title"
                                :title="getReportDetails(repId).noi_dung"
                                v-html="highlightKanbanText(getReportDetails(repId).noi_dung)"
                              ></span>
                              <button
                                type="button"
                                class="pl-linked-rep-eye"
                                title="Xem Report trên trang Report Firebase (Mở tab mới)"
                                @click.stop="openReportInNewTab(repId)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              </button>
                            </div>
                            <div
                              v-if="getReportDetails(repId).ghi_chu"
                              class="pl-linked-rep-note"
                              v-html="highlightKanbanText(getReportDetails(repId).ghi_chu)"
                            ></div>
                            <div
                              v-if="getUnifiedReportAttachments(repId).length > 0"
                              class="pl-rep-file-list is-compact"
                            >
                              <div
                                v-for="(att, atti) in getUnifiedReportAttachments(repId)"
                                :key="'skatt-' + ri + '-' + atti"
                                class="pl-rep-file-pill"
                              >
                                <span class="pl-rep-file-ic" v-html="getReportAttIconSvg(att)"></span>
                                <span class="pl-rep-file-badge" :class="att.badgeCls">{{ att.badgeLabel }}</span>
                                <span class="pl-rep-file-name" :title="att.name" v-html="highlightKanbanText(att.name)"></span>
                                <button
                                  type="button"
                                  class="pl-rep-file-act is-view"
                                  :title="att.kind === 'image' ? 'Xem ảnh' : 'Xem qua ViewOffice / Trình xem'"
                                  @click.stop.prevent="openReportAttachmentView(att)"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                                <a
                                  :href="getDownloadUrl(att.url)"
                                  class="pl-rep-file-act is-dl"
                                  title="Tải xuống"
                                  @click.stop="handleDownloadClick($event, att.url, att.name)"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="pl-col-add-card is-compact"
                  :class="{
                    'is-outcome-win': col.id === 'hoan_thanh',
                    'is-outcome-fail': col.id === 'that_bai'
                  }"
                  :style="{ '--add-accent': getColTitleColor(col.id) }"
                  :title="'Thêm công việc vào ' + col.label + (lane.project ? ' (' + lane.title + ')' : '')"
                  @click="openAddModalForSwimlaneCell(lane, col)"
                >
                  <span class="pl-col-add-ic" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </span>
                  <span class="pl-col-add-txt">Thêm công việc</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================================================
         MODAL A: PROJECT MULTI-PIPELINE DETAIL STUDIO (100% FULLSCREEN 3-COL)
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showProjectDetailModal && activeProjectDetail"
        class="bg-modal-overlay pl-modal-overlay is-fullscreen-overlay is-project-studio-overlay"
        :class="{
          'theme-light-blue': uiTheme === 'light',
          'theme-custom-glass': uiTheme === 'custom'
        }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="closeProjectDetailModal"
      >
        <div
          class="pl-modal-card pl-modal-fullscreen is-studio-modal"
          @click="openProjPipeStageMenuId = ''"
        >
          <div class="pl-modal-grab" aria-hidden="true"></div>

          <!-- STUDIO TOP BAR WITH CONDENSED PROJECT METRICS -->
          <div class="pl-modal-header is-fullscreen-head is-studio-head">
            <div class="pl-modal-title-group" style="min-width: 0; flex: 1;">
              <div class="pl-modal-icon is-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div style="min-width: 0;">
                <div class="pl-proj-studio-title-row">
                  <span class="pl-code-pill pl-mono">{{ activeProjectDetail.ma_du_an }}</span>
                  <h3 class="pl-modal-title pl-proj-studio-title">{{ activeProjectDetail.ten_du_an }}</h3>
                  <span class="pl-status-pill" :class="getProjectStatusTone(activeProjectDetail.trang_thai)">
                    {{ activeProjectDetail.trang_thai || 'Đang triển khai' }}
                  </span>
                </div>
                <p class="pl-modal-sub pl-proj-studio-sub">
                  <span>KH Gốc: <strong>{{ activeProjectDetail.displayCompanyName || activeProjectDetail.displayCustomerName || 'Chưa gắn KH' }}</strong></span>
                  <span v-if="activeProjectDetail.displayCompanyName && activeProjectDetail.displayCustomerName"> · {{ activeProjectDetail.displayCustomerName }}</span>
                  <span
                    v-if="activeProjectDetail.partnerCustomerCount > 0"
                    class="pl-tabular"
                    :title="'Các KH / Đối tác tham gia: ' + activeProjectDetail.partnerCustomerLabels.join(', ')"
                  >
                    · +{{ activeProjectDetail.partnerCustomerCount }} đối tác
                  </span>
                  <span> · AM: <strong>{{ activeProjectDetail.AM || 'Sơn' }}</strong></span>
                  <span v-if="activeProjectDetail.deadline" class="pl-tabular"> · Hạn: {{ activeProjectDetail.deadline }}</span>
                </p>
              </div>
            </div>

            <div class="pl-studio-head-right">
              <div class="pl-studio-head-pills">
                <span
                  class="pl-studio-ctx-pill is-sky pl-tabular"
                  :title="
                    'Volume quy đổi: ' +
                    (formatNumber(activeProjectDetail.weightedVolume) || '0') +
                    ' ₫ • Ngân sách dự kiến: ' +
                    (activeProjectDetail.ngan_sach_du_kien ? formatNumber(activeProjectDetail.ngan_sach_du_kien) + ' ₫' : 'Chưa đặt')
                  "
                >
                  Tổng Vol: {{ formatNumber(activeProjectDetail.totalVolume) || '0' }} ₫
                </span>
                <span
                  class="pl-studio-ctx-pill is-emerald pl-tabular"
                  title="Tổng doanh số đã chốt thành công (100%)"
                >
                  Đã chốt: {{ formatNumber(activeProjectDetail.wonVolume) || '0' }} ₫ ({{ activeProjectDetail.wonCount }})
                </span>
                <span class="pl-studio-ctx-pill is-slate pl-tabular" title="Tổng số công việc & tiến độ trung bình">
                  {{ activeProjectDetail.pipelines.length }} CV · {{ activeProjectDetail.avgProgress }}% TB
                </span>
              </div>

              <button
                type="button"
                class="pl-btn pl-btn-slate pl-btn-sm"
                @click="openEditProjectModal(activeProjectDetail)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span class="bg-hide-sm">Sửa DA</span>
              </button>
              <button
                type="button"
                class="pl-modal-close"
                @click="closeProjectDetailModal"
                aria-label="Đóng"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <!-- 3-COLUMN MASTER-DETAIL BODY -->
          <div class="pl-modal-body pl-fullscreen-form-body is-studio-3col is-proj-studio-3col">
            <!-- =========================================================
                 COLUMN 1 (~23%): DANH SÁCH KHUNG PIPELINE TRONG DỰ ÁN
                 ========================================================= -->
            <aside
              class="modal-group pl-studio-col is-col-left"
              :class="{ 'is-mob-collapsed': !isProjLeftRailOpen }"
            >
              <div
                class="modal-banner-header is-sky is-mob-collapsible"
                @click="toggleProjLeftRail"
              >
                <div class="pl-studio-banner-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  <span class="modal-banner-title pl-tabular">KHUNG PIPELINE ({{ activeProjectDetail.correspondingWorkflows.length }})</span>
                </div>

                <div style="display: flex; align-items: center; gap: 6px;">
                  <button
                    type="button"
                    class="bg-banner-btn"
                    title="Gắn Khung có sẵn hoặc tạo nhanh Khung cho KH đối tác"
                    @click.stop="openManageProjectWfModal('attach')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Gắn / Tạo</span>
                  </button>
                  <button
                    type="button"
                    class="pl-studio-mob-rail-toggle"
                    :class="{ 'is-open': isProjLeftRailOpen }"
                    @click.stop="toggleProjLeftRail"
                  >
                    <span>{{ isProjLeftRailOpen ? 'Thu gọn' : activeProjectWfFilterLabel }}</span>
                    <svg class="pl-studio-mob-rail-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                </div>
              </div>

              <div class="modal-group-body pl-studio-col-body pl-studio-left-body pl-proj-wf-nav-body">
                <!-- NAV ITEM 0: ALL FRAMES -->
                <div
                  class="pl-proj-nav-item"
                  :class="{ 'is-active': projectDetailWfFilter === 'ALL' }"
                  @click="selectProjectDetailWorkflow('ALL')"
                >
                  <div class="pl-proj-nav-head">
                    <span class="pl-proj-nav-title">Tất cả Khung trong Dự án</span>
                    <span class="pl-proj-nav-cnt pl-tabular">{{ activeProjectDetail.pipelines.length }}</span>
                  </div>
                  <div class="pl-proj-nav-sub pl-tabular">
                    {{ activeProjectDetail.distinctCustomerCount }} KH tham gia · {{ formatNumber(activeProjectDetail.totalVolume) || '0' }} ₫
                  </div>
                </div>

                <!-- NAV ITEMS 1..N: EACH PIPELINE FRAME -->
                <div
                  v-for="wf in activeProjectDetail.correspondingWorkflows"
                  :key="'pnav-wf-' + wf.id_workflow"
                  class="pl-proj-nav-item"
                  :class="{ 'is-active': projectDetailWfFilter === wf.id_workflow }"
                  @click="selectProjectDetailWorkflow(wf.id_workflow)"
                >
                  <div class="pl-proj-nav-head">
                    <div class="pl-proj-nav-title-wrap">
                      <span class="pl-proj-nav-title">{{ wf.name_workflow }}</span>
                      <span v-if="wf.isPreferred" class="pl-proj-nav-pref">Mặc định</span>
                    </div>
                    <span class="pl-proj-nav-cnt pl-tabular">{{ wf.pipeCount }}</span>
                  </div>

                  <div class="pl-proj-nav-sub pl-tabular">
                    <span>{{ wf.displayCompanyName || wf.displayCustomerName || wf.scopeLabel }}</span>
                    <span v-if="wf.totalVolume > 0"> · {{ formatNumber(wf.totalVolume) }} ₫</span>
                  </div>

                  <div class="pl-proj-nav-foot">
                    <div class="pl-proj-nav-dots" :title="wf.stepCount + ' bước tiến độ'">
                      <span
                        v-for="st in wf.flowSteps"
                        :key="'ndot-' + wf.id_workflow + '-' + st.id"
                        class="pl-proj-nav-dot"
                        :style="{ backgroundColor: st.color }"
                      ></span>
                    </div>

                    <div class="pl-proj-nav-acts" @click.stop>
                      <button
                        type="button"
                        class="pl-proj-nav-act-btn"
                        title="Thêm công việc mới vào khung này"
                        @click="openAddPipelineForProject(activeProjectDetail, wf.id_workflow)"
                      >
                        + CV
                      </button>
                      <button
                        type="button"
                        class="pl-proj-nav-act-btn"
                        title="Mở Workflow này trên Công Việc Pipeline"
                        @click="openProjectWorkflowOnKanban(activeProjectDetail, wf.id_workflow)"
                      >
                        Mở CV ↗
                      </button>
                      <button
                        v-if="wf.isExplicitlyLinked"
                        type="button"
                        class="pl-proj-nav-act-btn is-danger"
                        title="Gỡ Khung Pipeline khỏi Dự án"
                        @click="handleQuickDetachFlowFromCard(activeProjectDetail, wf)"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  v-if="activeProjectDetail.hasValidCustomer"
                  type="button"
                  class="pl-proj-designer-jump"
                  @click="jumpToCustomerWorkflowDesignerFromProject(activeProjectDetail)"
                >
                  <span>Thiết kế / tùy chỉnh Khung KH Gốc</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </aside>

            <!-- =========================================================
                 COLUMN 2 (~49%): DANH SÁCH CÔNG VIỆC TRONG PIPELINE
                 ========================================================= -->
            <section class="modal-group pl-studio-col is-col-center">
              <div class="modal-banner-header is-emerald">
                <div class="pl-studio-banner-left" style="min-width: 0;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
                  <span class="modal-banner-title pl-tabular">CÔNG VIỆC PIPELINE ({{ displayedProjectDetailPipelines.length }})</span>
                  <span v-if="projectDetailWfFilter !== 'ALL'" class="bg-banner-pill pl-proj-banner-truncate">
                    {{ activeProjectWfFilterLabel }}
                  </span>
                </div>

                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <button
                    type="button"
                    class="bg-banner-btn"
                    @click="openAttachPipelineModal"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <span>Gắn CV lẻ</span>
                  </button>
                  <button
                    type="button"
                    class="bg-banner-btn is-solid-cta"
                    @click="openAddPipelineForProject(activeProjectDetail, projectDetailWfFilter !== 'ALL' ? projectDetailWfFilter : '')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Thêm CV mới</span>
                  </button>
                </div>
              </div>

              <div
                class="modal-group-body pl-studio-col-body pl-proj-pipes-body"
                @scroll.passive="openProjPipeStageMenuId && (openProjPipeStageMenuId = '')"
              >
                <!-- QUICK SEARCH BAR -->
                <div
                  v-if="filteredProjectDetailPipelines.length > 0 || projectDetailPipeSearch"
                  class="pl-proj-pipe-search-wrap"
                >
                  <svg class="pl-proj-pipe-search-ic" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input
                    v-model="projectDetailPipeSearch"
                    type="text"
                    class="bg-input bg-input-sm pl-proj-pipe-search-input"
                    placeholder="Tìm nội dung PO, khách hàng, mã HĐ, AM..."
                  />
                  <button
                    v-if="projectDetailPipeSearch"
                    type="button"
                    class="pl-tl-clear-btn"
                    title="Xóa từ khóa"
                    @click="projectDetailPipeSearch = ''"
                  >×</button>
                </div>

                <!-- EMPTY STATE -->
                <div v-if="displayedProjectDetailPipelines.length === 0" class="pl-empty-panel" style="margin: auto 0;">
                  <div class="pl-empty-title">
                    {{
                      projectDetailPipeSearch
                        ? 'Không có công việc nào khớp từ khóa tìm kiếm'
                        : projectDetailWfFilter === 'ALL'
                          ? 'Dự án này chưa có Công việc nào trong Pipeline'
                          : 'Khung Pipeline này chưa có Công việc nào'
                    }}
                  </div>
                  <div class="pl-empty-sub">
                    {{
                      projectDetailPipeSearch
                        ? 'Thử xóa từ khóa hoặc chuyển sang Tất cả Khung ở cột bên trái.'
                        : 'Thêm công việc mới hoặc gắn công việc độc lập có sẵn vào Dự án.'
                    }}
                  </div>
                  <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 8px;">
                    <button
                      v-if="projectDetailPipeSearch"
                      type="button"
                      class="pl-btn pl-btn-slate pl-btn-sm"
                      @click="projectDetailPipeSearch = ''"
                    >
                      Xóa tìm kiếm
                    </button>
                    <template v-else>
                      <button
                        type="button"
                        class="pl-btn pl-btn-slate pl-btn-sm"
                        @click="openAttachPipelineModal"
                      >
                        Gắn CV có sẵn
                      </button>
                      <button
                        type="button"
                        class="pl-btn pl-btn-primary pl-btn-sm"
                        @click="openAddPipelineForProject(activeProjectDetail, projectDetailWfFilter !== 'ALL' ? projectDetailWfFilter : '')"
                      >
                        + Thêm Công việc mới
                      </button>
                    </template>
                  </div>
                </div>

                <!-- MINIMALIST WORK ITEM CARDS (ZERO BADGE CLUTTER) -->
                <div
                  v-for="pipe in displayedProjectDetailPipelines"
                  :key="pipe.Id_pipeline"
                  class="pl-proj-work-card"
                  :class="{
                    'is-focused': focusedProjectPipeId === pipe.Id_pipeline,
                    'is-menu-open': openProjPipeStageMenuId === pipe.Id_pipeline
                  }"
                  @click="toggleFocusProjectPipe(pipe.Id_pipeline)"
                  @dblclick="openEditModal(pipe)"
                >
                  <!-- ROW 1: CUSTOMER & HERO VOLUME -->
                  <div class="pl-pwc-top">
                    <div class="pl-pwc-party">
                      <span class="pl-pwc-company">
                        {{ pipe.ten_cong_ty || pipe.ten_khach_hang || 'Chưa gắn khách hàng' }}
                      </span>
                      <span
                        v-if="pipe.ten_cong_ty && pipe.ten_khach_hang && pipe.ten_cong_ty.toLowerCase() !== pipe.ten_khach_hang.toLowerCase()"
                        class="pl-pwc-contact"
                      >
                        · {{ pipe.ten_khach_hang }}
                      </span>
                      <span
                        v-if="(pipe.ten_cong_ty || pipe.ten_khach_hang) && !isCardSameAsProjectRootCustomer(pipe, activeProjectDetail)"
                        class="pl-pwc-partner-pill"
                        title="Khách hàng / Đối tác khác tham gia trong dự án"
                      >
                        Đối tác
                      </span>
                    </div>

                    <div
                      class="pl-pwc-vol pl-tabular"
                      :class="{ 'is-zero': !(parseNum(pipe.volume) > 0) }"
                    >
                      {{ formatNumber(pipe.volume) || '0' }} ₫
                    </div>
                  </div>

                  <!-- ROW 2: PO / CONTRACT CONTENT -->
                  <div class="pl-pwc-content">
                    {{ pipe.content_of_contract_po || 'Chưa nhập nội dung Hợp đồng / PO' }}
                  </div>

                  <!-- ROW 3: 1-TAP STAGE POPOVER + COMPACT METADATA + CLEAN ACTIONS -->
                  <div class="pl-pwc-foot">
                    <div class="pl-pwc-foot-left">
                      <!-- 1-TAP STAGE DROPDOWN PILL -->
                      <div class="pl-pwc-stage-wrap" @click.stop>
                        <button
                          type="button"
                          class="pl-pwc-stage-btn"
                          :style="{ '--st-clr': getPipelineStageColor(pipe) }"
                          title="Nhấn để chuyển nhanh bước tiến độ"
                          @click="openProjPipeStageMenuId = openProjPipeStageMenuId === pipe.Id_pipeline ? '' : pipe.Id_pipeline"
                        >
                          <span class="pl-pwc-stage-dot" aria-hidden="true"></span>
                          <span class="pl-tabular">{{ getPipelineStagePercent(pipe) }}</span>
                          <span>·</span>
                          <span class="pl-pwc-stage-lbl">{{ getPipelineStageShortName(pipe) }}</span>
                          <svg class="pl-pwc-stage-chev" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>

                        <div
                          v-if="openProjPipeStageMenuId === pipe.Id_pipeline"
                          class="pl-pwc-stage-menu"
                        >
                          <button
                            v-for="stepCol in getColumnsForWorkflow(pipe.id_workflow)"
                            :key="pipe.Id_pipeline + '-m-' + stepCol.id"
                            type="button"
                            class="pl-pwc-stage-opt"
                            :class="{ 'is-current': isPipelineAtStep(pipe, stepCol) }"
                            :style="{ '--st-clr': stepCol.color || '#3b82f6' }"
                            @click.stop="selectPipeStageFromMenu(pipe, stepCol)"
                          >
                            <span class="pl-pwc-stage-dot"></span>
                            <span class="pl-pwc-opt-pct pl-tabular">{{ stepCol.percent }}</span>
                            <span class="pl-pwc-opt-lbl">{{ stepCol.shortLabel || stepCol.label }}</span>
                            <svg v-if="isPipelineAtStep(pipe, stepCol)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </button>
                        </div>
                      </div>

                      <div class="pl-pwc-meta pl-tabular">
                        <span v-if="pipe.ma_hop_dong" class="pl-mono">{{ pipe.ma_hop_dong }}</span>
                        <span v-if="projectDetailWfFilter === 'ALL'">{{ getWorkflowShortLabel(pipe.id_workflow) }}</span>
                        <span v-if="pipe.finish_time">Hạn {{ pipe.finish_time }}</span>
                        <span
                          v-if="getPipeReportIds(pipe).length > 0 || getParsedFiles(pipe).length > 0"
                          class="pl-pwc-rep-tag"
                        >
                          {{ getPipeReportIds(pipe).length }} Rep · {{ getParsedFiles(pipe).length + getCardReportAttachmentCount(pipe) }} tệp
                        </span>
                      </div>
                    </div>

                    <div class="pl-pwc-actions" @click.stop>
                      <button
                        type="button"
                        class="pl-pwc-act-btn"
                        title="Mở & định vị thẻ này trên Công Việc Pipeline"
                        @click="focusCardOnKanban(pipe)"
                      >
                        Định vị ↗
                      </button>
                      <button
                        type="button"
                        class="pl-pwc-act-btn is-edit"
                        title="Chỉnh sửa chi tiết công việc"
                        @click="openEditModal(pipe)"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        class="pl-pwc-act-btn is-danger"
                        title="Gỡ khỏi dự án (giữ công việc độc lập)"
                        @click="detachPipelineFromProject(pipe)"
                      >
                        Gỡ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- =========================================================
                 COLUMN 3 (~28%): REPORT CON LIÊN KẾT & CHỨNG TỪ DỰ ÁN
                 ========================================================= -->
            <aside class="modal-group pl-studio-col is-col-right">
              <div class="modal-banner-header is-teal">
                <div class="pl-studio-banner-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <span class="modal-banner-title">REPORT CON &amp; CHỨNG TỪ</span>
                </div>
                <span class="bg-banner-pill pl-tabular">
                  {{ scopedProjectHub.reports.length }} Rep · {{ scopedProjectHub.files.length }} tệp
                </span>
              </div>

              <div class="modal-group-body pl-studio-col-body pl-studio-right-body">
                <!-- DYNAMIC SCOPE CONTEXT BAR -->
                <div v-if="focusedProjectPipe || projectDetailWfFilter !== 'ALL'" class="pl-proj-hub-scope-bar">
                  <div class="pl-proj-hub-scope-txt">
                    <template v-if="focusedProjectPipe">
                      Đang xem CV: <strong>{{ focusedProjectPipe.content_of_contract_po || focusedProjectPipe.ma_hop_dong || focusedProjectPipe.Id_pipeline }}</strong>
                    </template>
                    <template v-else>
                      Đang lọc Khung: <strong>{{ activeProjectWfFilterLabel }}</strong>
                    </template>
                  </div>
                  <button
                    type="button"
                    class="pl-proj-hub-scope-reset"
                    @click="focusedProjectPipe ? (focusedProjectPipeId = '') : selectProjectDetailWorkflow('ALL')"
                  >
                    Xem tất cả
                  </button>
                </div>

                <!-- 1. LINKED CHILD REPORTS -->
                <div class="pl-field">
                  <label class="bg-label pl-tabular">Report Con Liên Kết ({{ scopedProjectHub.reports.length }})</label>

                  <div v-if="scopedProjectHub.reports.length === 0" class="pl-studio-empty-hint">
                    Chưa có Report con nào gắn với {{ focusedProjectPipe ? 'công việc đang chọn' : 'phạm vi hiện tại' }}.
                  </div>

                  <div v-else class="pl-linked-rep-stack">
                    <div
                      v-for="rep in scopedProjectHub.reports"
                      :key="'phub-rep-' + rep.id"
                      class="pl-linked-rep-card"
                    >
                      <div class="pl-linked-rep-head">
                        <span class="pl-linked-rep-title">{{ rep.noi_dung }}</span>
                        <button
                          type="button"
                          class="pl-linked-rep-eye"
                          title="Xem Report trên trang Report Firebase (Mở tab mới)"
                          @click.stop="openReportInNewTab(rep.id)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                      </div>
                      <div v-if="rep.parentPipeLabels && rep.parentPipeLabels.length > 0" class="pl-hub-parent-pipe">
                        CV cha: <strong>{{ rep.parentPipeLabels.join(' • ') }}</strong>
                      </div>
                      <div v-if="rep.thoi_gian || rep.ghi_chu" class="pl-hub-sub">
                        {{ formatReportTime(rep.thoi_gian) }}{{ rep.ghi_chu ? (rep.thoi_gian ? ' · ' : '') + rep.ghi_chu : '' }}
                      </div>

                      <div
                        v-if="getUnifiedReportAttachments(rep).length > 0"
                        class="pl-rep-file-list"
                        style="margin-top: 4px;"
                      >
                        <div
                          v-for="(att, atti) in getUnifiedReportAttachments(rep)"
                          :key="'hubatt-' + rep.id + '-' + atti"
                          class="pl-rep-file-pill"
                        >
                          <span class="pl-rep-file-ic" v-html="getReportAttIconSvg(att)"></span>
                          <span class="pl-rep-file-badge" :class="att.badgeCls">{{ att.badgeLabel }}</span>
                          <span class="pl-rep-file-name" :title="att.name">{{ att.name }}</span>
                          <button
                            type="button"
                            class="pl-rep-file-act is-view"
                            :title="att.kind === 'image' ? 'Xem ảnh' : 'Xem qua ViewOffice / Trình xem'"
                            @click.stop.prevent="openReportAttachmentView(att)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>
                          <a
                            :href="getDownloadUrl(att.url)"
                            class="pl-rep-file-act is-dl"
                            title="Tải xuống"
                            @click.stop="handleDownloadClick($event, att.url, att.name)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pl-studio-divider"></div>

                <!-- 2. AGGREGATED ATTACHMENTS VAULT -->
                <div class="pl-field">
                  <label class="bg-label pl-tabular">Chứng Từ &amp; Tệp Đính Kèm ({{ scopedProjectHub.files.length }})</label>

                  <div v-if="scopedProjectHub.files.length === 0" class="pl-studio-empty-hint">
                    Chưa có chứng từ đính kèm trực tiếp hoặc kế thừa từ Report con.
                  </div>

                  <div v-else class="pl-studio-file-stack">
                    <div
                      v-for="(f, idx) in scopedProjectHub.files"
                      :key="'hubf-' + idx"
                      class="pl-studio-file-card"
                    >
                      <span class="pl-rep-file-ic is-md" v-html="getFileIconSvg(f.name, f.url)"></span>
                      <div style="min-width: 0; flex: 1;">
                        <a
                          :href="getPreviewUrl(f.url)"
                          target="_blank"
                          class="pl-rep-file-name is-clickable"
                          style="display: block;"
                          :title="f.name"
                          @click.stop.prevent="openReportAttachmentView(f)"
                        >
                          {{ f.name }}
                        </a>
                        <div class="pl-hub-sub" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          {{ f.sourceLabel }}
                        </div>
                      </div>
                      <div class="pl-studio-file-acts">
                        <button
                          type="button"
                          class="pl-rep-file-act is-view"
                          :title="f.kind === 'image' ? 'Xem ảnh' : 'Xem file qua ViewOffice / Trình xem'"
                          @click.stop.prevent="openReportAttachmentView(f)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <a
                          :href="getDownloadUrl(f.url)"
                          class="pl-rep-file-act is-dl"
                          title="Tải xuống"
                          @click.stop="handleDownloadClick($event, f.url, f.name)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <!-- STUDIO STICKY FOOTER -->
          <div class="pl-modal-footer is-fullscreen-foot is-studio-foot">
            <div class="pl-studio-foot-left">
              <button
                type="button"
                class="pl-btn pl-btn-sky-soft pl-btn-sm"
                @click="openProjectWorkflowOnKanban(activeProjectDetail, projectDetailWfFilter !== 'ALL' ? projectDetailWfFilter : '')"
              >
                <span>Mở Trên Công Việc Pipeline ↗</span>
              </button>
              <span class="pl-studio-kbd-hint bg-hide-sm">Nhấn vào thẻ CV để lọc riêng Report · Đúp chuột mở sửa · Esc đóng</span>
            </div>
            <div class="pl-studio-foot-right">
              <button
                type="button"
                class="pl-btn pl-btn-slate"
                @click="closeProjectDetailModal"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL A1: POPUP PICKER — GẮN / TẠO KHUNG PIPELINE CHO DỰ ÁN
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showManageProjectWfDrawer && activeProjectDetail"
        class="bg-modal-overlay pl-modal-overlay is-submodal-overlay"
        :class="{
          'theme-light-blue': uiTheme === 'light',
          'theme-custom-glass': uiTheme === 'custom'
        }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showManageProjectWfDrawer = false"
      >
        <div class="pl-modal-card pl-modal-lg">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header">
            <div class="pl-modal-title-group">
              <div class="pl-modal-icon is-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </div>
              <div>
                <h3 class="pl-modal-title">Gắn / Tạo Khung Pipeline Vào Dự Án</h3>
                <p class="pl-modal-sub">Dự án: <strong>{{ activeProjectDetail.ten_du_an }}</strong></p>
              </div>
            </div>
            <button type="button" class="pl-modal-close" @click="showManageProjectWfDrawer = false" aria-label="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="pl-modal-body">
            <div class="pl-manage-wf-top">
              <div class="bg-seg-switch is-compact">
                <button
                  type="button"
                  class="bg-seg-btn"
                  :class="{ 'is-active': manageWfDrawerMode === 'attach' }"
                  @click="manageWfDrawerMode = 'attach'"
                >
                  Chọn Khung có sẵn (KH khác / Mẫu)
                </button>
                <button
                  type="button"
                  class="bg-seg-btn"
                  :class="{ 'is-active': manageWfDrawerMode === 'create' }"
                  @click="manageWfDrawerMode = 'create'"
                >
                  + Tạo nhanh Khung cho KH khác
                </button>
              </div>

              <button
                v-if="activeProjectDetail.hasValidCustomer"
                type="button"
                class="pl-btn pl-btn-slate pl-btn-xs"
                @click="jumpToCustomerWorkflowDesignerFromProject(activeProjectDetail)"
              >
                Mở Workflow KH Gốc ↗
              </button>
            </div>

            <!-- MODE 1: ATTACH / DETACH EXISTING PIPELINE FRAMES -->
            <template v-if="manageWfDrawerMode === 'attach'">
              <div class="pl-picker-search-bar">
                <input
                  v-model="manageWfSearch"
                  type="text"
                  class="bg-input"
                  style="flex: 1; min-width: 180px;"
                  placeholder="Tìm tên Khung Pipeline, tên Công ty / KH đối tác hoặc Khung mẫu..."
                />
                <select v-model="manageWfScopeFilter" class="bg-input" style="max-width: 220px;">
                  <option value="ALL">Tất cả Khung ({{ uniqueWorkflows.length }})</option>
                  <option value="customer">Khung riêng theo KH / Công ty</option>
                  <option value="template">Kho Khung Mẫu (Blueprint)</option>
                </select>
              </div>

              <div class="pl-picker-list">
                <div v-if="attachableWorkflowsForProject.length === 0" class="pl-empty-inline">
                  Không tìm thấy Khung Pipeline phù hợp. Bạn có thể chuyển sang tab <strong>"+ Tạo nhanh Khung cho KH khác"</strong> ngay phía trên.
                </div>
                <div
                  v-for="candWf in attachableWorkflowsForProject"
                  :key="'candwf-' + candWf.id_workflow"
                  class="pl-picker-row"
                  :class="{ 'is-selected': candWf.isLinkedToProject || candWf.isAutoRootFlow }"
                >
                  <div style="min-width: 0; flex: 1;">
                    <div class="pl-picker-row-title">{{ candWf.name_workflow }}</div>
                    <div class="pl-picker-row-sub pl-tabular">
                      <span>
                        {{
                          candWf.workflow_scope === 'customer'
                            ? 'KH: ' + (candWf.ten_cong_ty || candWf.ten_khach_hang || 'Công ty riêng')
                            : 'Khung mẫu Blueprint'
                        }}
                      </span>
                      · {{ candWf.stepCount }} bước
                    </div>
                  </div>

                  <span v-if="candWf.isAutoRootFlow" class="pl-mini-tag is-emerald">
                    Khung KH Gốc
                  </span>
                  <button
                    v-else-if="candWf.isLinkedToProject"
                    type="button"
                    class="pl-btn pl-btn-danger-ghost pl-btn-xs"
                    @click="detachWorkflowFromProject(activeProjectDetail, candWf.id_workflow)"
                  >
                    Gỡ khỏi DA
                  </button>
                  <button
                    v-else
                    type="button"
                    class="pl-picker-select-btn"
                    @click="attachWorkflowToProject(activeProjectDetail, candWf.id_workflow)"
                  >
                    + Gắn vào DA
                  </button>
                </div>
              </div>
            </template>

            <!-- MODE 2: QUICK-CREATE CUSTOMER PIPELINE FRAME & ATTACH TO PROJECT -->
            <template v-else>
              <div class="pl-form-grid-2">
                <div class="pl-field">
                  <div class="bg-label-row">
                    <label class="bg-label">Công Ty Của Khung Này <span class="bg-req">*</span></label>
                    <button type="button" class="pl-link-btn" @click="openAddCustomerModal('project_quick_wf')">+ Thêm KH mới</button>
                  </div>
                  <div
                    class="pl-input-with-picker"
                    :class="{ 'has-clear-btn': Boolean(quickProjWfForm.ten_cong_ty) }"
                    @click="openCustomerSearch('project_quick_wf', 'company')"
                  >
                    <input
                      :value="quickProjWfForm.ten_cong_ty"
                      type="text"
                      readonly
                      class="bg-input has-inline-picker is-clickable-picker"
                      placeholder="Nhấn chọn công ty / đối tác..."
                    />
                    <button
                      v-if="quickProjWfForm.ten_cong_ty"
                      type="button"
                      class="pl-inline-clear-btn"
                      title="Xóa công ty"
                      @click.stop="clearQuickProjWfCompanyField"
                    >×</button>
                    <button
                      type="button"
                      class="pl-inline-picker-btn"
                      @click.stop="openCustomerSearch('project_quick_wf', 'company')"
                    >Chọn</button>
                  </div>
                </div>

                <div class="pl-field">
                  <label class="bg-label">Người Liên Hệ / Đại Diện</label>
                  <div
                    class="pl-input-with-picker"
                    :class="{ 'has-clear-btn': Boolean(quickProjWfForm.ten_khach_hang) }"
                    @click="openCustomerSearch('project_quick_wf', 'contact')"
                  >
                    <input
                      :value="quickProjWfForm.ten_khach_hang"
                      type="text"
                      readonly
                      class="bg-input has-inline-picker is-clickable-picker"
                      placeholder="Nhấn chọn người liên hệ..."
                    />
                    <button
                      v-if="quickProjWfForm.ten_khach_hang"
                      type="button"
                      class="pl-inline-clear-btn"
                      title="Xóa người liên hệ"
                      @click.stop="clearQuickProjWfContactField"
                    >×</button>
                    <button
                      type="button"
                      class="pl-inline-picker-btn"
                      @click.stop="openCustomerSearch('project_quick_wf', 'contact')"
                    >Chọn</button>
                  </div>
                </div>

                <div class="pl-field">
                  <label class="bg-label">Khởi tạo cột bước từ Khung Mẫu</label>
                  <select v-model="quickProjWfForm.base_template_id" class="bg-input">
                    <option value="WF_DEFAULT">Khung Chuẩn Hệ Thống (5 bước: 0% → 90%)</option>
                    <optgroup v-if="templateWorkflowOptions.length > 0" label="Khung mẫu dùng chung">
                      <option v-for="tpl in templateWorkflowOptions" :key="'qpwf-tpl-' + tpl.id_workflow" :value="tpl.id_workflow">
                        {{ tpl.name_workflow }}
                      </option>
                    </optgroup>
                    <optgroup v-if="customerWorkflowOptions.length > 0" label="Khung thiết kế của Công ty / KH">
                      <option v-for="cwf in customerWorkflowOptions" :key="'qpwf-cwf-' + cwf.id_workflow" :value="cwf.id_workflow">
                        {{ cwf.name_workflow }}{{ (cwf.ten_cong_ty || cwf.ten_khach_hang) ? ` — ${cwf.ten_cong_ty || cwf.ten_khach_hang}` : '' }}
                      </option>
                    </optgroup>
                  </select>
                </div>

                <div class="pl-field">
                  <label class="bg-label">Tên Khung Pipeline Sẽ Tạo <span class="bg-req">*</span></label>
                  <input
                    v-model="quickProjWfForm.name_workflow"
                    type="text"
                    class="bg-input"
                    placeholder="VD: Đối tác SI B — Gói thầu SOC..."
                  />
                </div>
              </div>
            </template>
          </div>

          <div class="pl-modal-footer">
            <button type="button" class="pl-btn pl-btn-slate" @click="showManageProjectWfDrawer = false">Đóng</button>
            <button
              v-if="manageWfDrawerMode === 'create'"
              type="button"
              class="pl-btn pl-btn-primary"
              :disabled="savingQuickProjWf"
              @click="submitQuickWorkflowForProject(activeProjectDetail)"
            >
              <span v-if="savingQuickProjWf" class="pl-spinner-xs"></span>
              <span>Tạo Khung &amp; Gắn Vào Dự Án</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL A2: POPUP PICKER — GẮN CÔNG VIỆC LẺ CÓ SẴN VÀO DỰ ÁN
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showAttachPipelineDrawer && activeProjectDetail"
        class="bg-modal-overlay pl-modal-overlay is-submodal-overlay"
        :class="{
          'theme-light-blue': uiTheme === 'light',
          'theme-custom-glass': uiTheme === 'custom'
        }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showAttachPipelineDrawer = false"
      >
        <div class="pl-modal-card pl-modal-lg">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header">
            <div class="pl-modal-title-group">
              <div class="pl-modal-icon is-emerald">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </div>
              <div>
                <h3 class="pl-modal-title">Gắn Công Việc Có Sẵn Vào Dự Án</h3>
                <p class="pl-modal-sub">Dự án: <strong>{{ activeProjectDetail.ten_du_an }}</strong></p>
              </div>
            </div>
            <button type="button" class="pl-modal-close" @click="showAttachPipelineDrawer = false" aria-label="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="pl-modal-body">
            <div class="pl-picker-search-bar">
              <input
                v-model="attachPipelineSearch"
                type="text"
                class="bg-input"
                style="flex: 1; min-width: 180px;"
                placeholder="Tìm Công việc theo nội dung PO, khách hàng, mã hợp đồng..."
              />
              <label class="pl-inline-chk">
                <input v-model="attachSameCustomerOnly" type="checkbox" />
                <span>Chỉ lọc cùng KH Gốc DA</span>
              </label>
            </div>

            <div class="pl-picker-list">
              <div v-if="attachablePipelines.length === 0" class="pl-empty-inline">
                Không tìm thấy Công việc nào phù hợp để gắn vào Dự án này.
              </div>
              <div
                v-for="cand in attachablePipelines.slice(0, 40)"
                :key="cand.Id_pipeline"
                class="pl-picker-row"
              >
                <div style="min-width: 0; flex: 1;">
                  <div class="pl-picker-row-title">{{ cand.content_of_contract_po || cand.ma_hop_dong || cand.Id_pipeline }}</div>
                  <div class="pl-picker-row-sub pl-tabular">
                    KH: <strong>{{ cand.ten_cong_ty || cand.ten_khach_hang || '---' }}</strong> · {{ getWorkflowShortLabel(cand.id_workflow) }} · {{ getFormattedStatus(cand) }}
                    <span v-if="cand.volume"> · {{ formatNumber(cand.volume) }} ₫</span>
                    <span v-if="cand.ten_du_an"> · Đang thuộc: {{ cand.ten_du_an }}</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="pl-picker-select-btn"
                  @click="attachExistingPipelineToProject(cand, activeProjectDetail)"
                >
                  + Gắn vào DA
                </button>
              </div>
            </div>
          </div>

          <div class="pl-modal-footer">
            <button type="button" class="pl-btn pl-btn-slate" @click="showAttachPipelineDrawer = false">Xong</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL B: ADD / EDIT PROJECT (2-COLUMN STUDIO WORKSPACE)
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showProjectFormModal"
        class="bg-modal-overlay pl-modal-overlay is-elevated-overlay"
        :class="{
          'theme-light-blue': uiTheme === 'light',
          'theme-custom-glass': uiTheme === 'custom'
        }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showProjectFormModal = false"
      >
        <div class="pl-modal-card pl-modal-proj-studio">
          <div class="pl-modal-grab" aria-hidden="true"></div>

          <!-- STUDIO HEADER -->
          <div class="pl-modal-header is-studio-head">
            <div class="pl-modal-title-group">
              <div class="pl-modal-icon is-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
              </div>
              <div>
                <h3 class="pl-modal-title">{{ isEditingProject ? 'Cập Nhật Dự Án (Gốc)' : 'Khởi Tạo Dự Án Mới (Gốc)' }}</h3>
                <p class="pl-modal-sub">Mỗi Dự án có 1 KH Chủ đầu tư gốc &amp; điều phối nhiều Khung Pipeline đối tác</p>
              </div>
            </div>

            <div class="pl-studio-head-right">
              <div class="pl-studio-head-pills">
                <span class="pl-status-pill" :class="getProjectStatusTone(projectForm.trang_thai)">
                  {{ projectForm.trang_thai || 'Đang triển khai' }}
                </span>
                <span
                  v-if="parseNum(projectForm.ngan_sach_du_kien) > 0"
                  class="pl-studio-ctx-pill is-emerald pl-tabular"
                >
                  NS: {{ formatNumber(projectForm.ngan_sach_du_kien) }} ₫
                </span>
              </div>
              <button type="button" class="pl-modal-close" @click="showProjectFormModal = false" aria-label="Đóng">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <!-- 2-COLUMN STUDIO BODY -->
          <div class="pl-modal-body pl-proj-form-2col">
            <!-- LEFT COLUMN (~55%): TÊN DỰ ÁN, CHỦ ĐẦU TƯ GỐC, NGÂN SÁCH & TIMELINE -->
            <section class="modal-group pl-proj-form-col">
              <div class="modal-banner-header is-emerald">
                <div class="pl-studio-banner-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <span class="modal-banner-title">THÔNG TIN DỰ ÁN &amp; CHỦ ĐẦU TƯ GỐC</span>
                </div>
                <button type="button" class="bg-banner-btn" @click="openAddCustomerModal('project')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>Thêm KH mới</span>
                </button>
              </div>

              <div class="modal-group-body pl-proj-form-col-body">
                <!-- 1. TÊN DỰ ÁN (#1 TOP PRIORITY) -->
                <div class="pl-field">
                  <label class="bg-label">Tên Dự Án <span class="bg-req">*</span></label>
                  <input
                    v-model="projectForm.ten_du_an"
                    type="text"
                    class="bg-input is-proj-name-hero"
                    placeholder="VD: Dự án Hạ tầng Bảo mật SOC 2026..."
                  />
                </div>

                <!-- 2. KHÁCH HÀNG / CHỦ ĐẦU TƯ GỐC (INLINE PICKERS CHUẨN HÓA) -->
                <div class="pl-form-grid-2">
                  <div class="pl-field">
                    <label class="bg-label">Công Ty Chủ Đầu Tư (KH Gốc) <span class="bg-req">*</span></label>
                    <div
                      class="pl-input-with-picker"
                      :class="{ 'has-clear-btn': Boolean(projectForm.ten_cong_ty) }"
                      @click="openCustomerSearch('project', 'company')"
                    >
                      <input
                        :value="projectForm.ten_cong_ty"
                        type="text"
                        readonly
                        class="bg-input has-inline-picker is-clickable-picker"
                        placeholder="Nhấn chọn công ty..."
                      />
                      <button
                        v-if="projectForm.ten_cong_ty"
                        type="button"
                        class="pl-inline-clear-btn"
                        title="Xóa công ty"
                        @click.stop="clearProjectCompanyField"
                      >×</button>
                      <button
                        type="button"
                        class="pl-inline-picker-btn"
                        @click.stop="openCustomerSearch('project', 'company')"
                      >Chọn</button>
                    </div>
                  </div>

                  <div class="pl-field">
                    <label class="bg-label">Người Liên Hệ / Đại Diện <span class="bg-req">*</span></label>
                    <div
                      class="pl-input-with-picker"
                      :class="{ 'has-clear-btn': Boolean(projectForm.ten_khach_hang) }"
                      @click="openCustomerSearch('project', 'contact')"
                    >
                      <input
                        :value="projectForm.ten_khach_hang"
                        type="text"
                        readonly
                        class="bg-input has-inline-picker is-clickable-picker"
                        placeholder="Nhấn chọn người liên hệ..."
                      />
                      <button
                        v-if="projectForm.ten_khach_hang"
                        type="button"
                        class="pl-inline-clear-btn"
                        title="Xóa người liên hệ"
                        @click.stop="clearProjectContactField"
                      >×</button>
                      <button
                        type="button"
                        class="pl-inline-picker-btn"
                        @click.stop="openCustomerSearch('project', 'contact')"
                      >Chọn</button>
                    </div>
                  </div>
                </div>

                <!-- 3. TRẠNG THÁI DỰ ÁN (1-TAP CHOICE GRID) -->
                <div class="pl-field">
                  <label class="bg-label">Trạng Thái Dự Án</label>
                  <div class="pl-choice-grid is-cols-4">
                    <button
                      type="button"
                      class="pl-choice-btn"
                      :class="{ 'is-active-sky': !projectForm.trang_thai || projectForm.trang_thai === 'Đang triển khai' }"
                      @click="projectForm.trang_thai = 'Đang triển khai'"
                    >
                      Đang triển khai
                    </button>
                    <button
                      type="button"
                      class="pl-choice-btn"
                      :class="{ 'is-active-emerald': projectForm.trang_thai === 'Hoàn thành' }"
                      @click="projectForm.trang_thai = 'Hoàn thành'"
                    >
                      Hoàn thành
                    </button>
                    <button
                      type="button"
                      class="pl-choice-btn"
                      :class="{ 'is-active-amber': projectForm.trang_thai === 'Tạm dừng' }"
                      @click="projectForm.trang_thai = 'Tạm dừng'"
                    >
                      Tạm dừng
                    </button>
                    <button
                      type="button"
                      class="pl-choice-btn"
                      :class="{ 'is-active-rose': projectForm.trang_thai === 'Huỷ' }"
                      @click="projectForm.trang_thai = 'Huỷ'"
                    >
                      Huỷ
                    </button>
                  </div>
                </div>

                <!-- 4. TỔNG NGÂN SÁCH DỰ KIẾN (HERO FINTECH INPUT) -->
                <div class="pl-field">
                  <label class="bg-label">Tổng Ngân Sách Dự Kiến Trước Thuế (₫)</label>
                  <div class="pl-volume-input-wrap">
                    <NumberInput
                      v-model="projectForm.ngan_sach_du_kien"
                      :decimals="0"
                      class="bg-input pl-tabular is-volume-hero"
                      placeholder="0"
                    />
                    <span class="pl-volume-unit" aria-hidden="true">₫</span>
                  </div>
                </div>

                <!-- 5. MÃ DỰ ÁN & AM -->
                <div class="pl-form-grid-2">
                  <div class="pl-field">
                    <label class="bg-label">Mã Dự Án (Tự sinh nếu trống)</label>
                    <input v-model="projectForm.ma_du_an" type="text" class="bg-input pl-mono" placeholder="DA-2026-001" />
                  </div>

                  <div class="pl-field">
                    <label class="bg-label">AM Phụ Trách</label>
                    <input v-model="projectForm.AM" type="text" class="bg-input" placeholder="Sơn" />
                  </div>
                </div>

                <!-- 6. HẠN DỰ KIẾN / TIMELINE DỰ ÁN -->
                <div class="pl-field">
                  <label class="bg-label">Hạn Dự Kiến (Timeline Dự Án)</label>
                  <div class="pl-timeline-presets">
                    <button
                      type="button"
                      class="pl-tl-chip"
                      :class="{ 'is-active': activeProjectDeadlinePreset === 'this_quarter' }"
                      @click="applyProjectDeadlinePreset('this_quarter')"
                    >Quý này</button>
                    <button
                      type="button"
                      class="pl-tl-chip"
                      :class="{ 'is-active': activeProjectDeadlinePreset === 'plus_6m' }"
                      @click="applyProjectDeadlinePreset('plus_6m')"
                    >+6 tháng</button>
                    <button
                      type="button"
                      class="pl-tl-chip"
                      :class="{ 'is-active': activeProjectDeadlinePreset === 'this_year' }"
                      @click="applyProjectDeadlinePreset('this_year')"
                    >Cuối năm nay</button>
                    <button
                      type="button"
                      class="pl-tl-chip"
                      :class="{ 'is-active': activeProjectDeadlinePreset === 'next_year' }"
                      @click="applyProjectDeadlinePreset('next_year')"
                    >Năm sau</button>
                  </div>
                  <div class="pl-tl-single-input-wrap">
                    <input
                      v-model="projectForm.deadline"
                      type="text"
                      class="bg-input pl-tabular"
                      :class="{ 'has-right-clear': Boolean(projectForm.deadline) }"
                      placeholder="VD: Q3/2026 hoặc 12/2026"
                    />
                    <button
                      v-if="projectForm.deadline"
                      type="button"
                      class="pl-tl-clear-btn"
                      title="Xóa hạn dự kiến"
                      @click="projectForm.deadline = ''"
                    >×</button>
                  </div>
                </div>

                <!-- 7. GHI CHÚ DỰ ÁN -->
                <div class="pl-field">
                  <label class="bg-label">Ghi Chú Phạm Vi Dự Án</label>
                  <textarea
                    v-model="projectForm.ghi_chu"
                    rows="2"
                    class="bg-textarea"
                    placeholder="Mô tả phạm vi dự án, các gói thầu/pipeline dự kiến..."
                  ></textarea>
                </div>
              </div>
            </section>

            <!-- RIGHT COLUMN (~45%): CÁC KHUNG PIPELINE TRONG DỰ ÁN -->
            <aside class="modal-group pl-proj-form-col">
              <div class="modal-banner-header is-sky">
                <div class="pl-studio-banner-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  <span class="modal-banner-title pl-tabular">
                    KHUNG PIPELINE TRONG DỰ ÁN ({{ projectModalCorrespondingWorkflows.length }})
                  </span>
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button
                    v-if="hasProjectModalCustomer"
                    type="button"
                    class="bg-banner-btn"
                    @click="showProjectFormWfPicker = true"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Gắn thêm Khung</span>
                  </button>
                  <button
                    type="button"
                    class="bg-banner-btn"
                    @click="jumpToCustomerWorkflowDesignerFromModal"
                  >
                    <span>Mở Workflow ↗</span>
                  </button>
                </div>
              </div>

              <div class="modal-group-body pl-proj-form-col-body pl-proj-form-right-body">
                <!-- EMPTY STATE WHEN ROOT CUSTOMER NOT YET CHOSEN -->
                <div v-if="!hasProjectModalCustomer" class="pl-proj-form-wf-empty">
                  <div class="pl-proj-form-wf-empty-ic">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  </div>
                  <div class="pl-empty-title">Chưa chọn Khách hàng / Chủ đầu tư gốc</div>
                  <div class="pl-empty-sub">
                    Chọn <strong>Công ty Chủ đầu tư</strong> ở cột bên trái trước — hệ thống sẽ tự động nạp Khung Pipeline chuẩn của khách hàng đó và cho phép gắn thêm Khung của các đối tác / SI.
                  </div>
                  <button
                    type="button"
                    class="pl-btn pl-btn-sky-soft pl-btn-sm"
                    style="margin-top: 6px;"
                    @click="openCustomerSearch('project', 'company')"
                  >
                    Chọn Công ty Chủ đầu tư
                  </button>
                </div>

                <!-- CORRESPONDING FRAMES LIST (1-TAP TO SET PROJECT DEFAULT) -->
                <template v-else>
                  <div class="pl-proj-wf-guide-note">
                    Nhấn vào 1 Khung bên dưới để đặt làm <strong>Khung mặc định</strong> khi thêm công việc mới:
                  </div>

                  <div class="pl-proj-wf-stack">
                    <div
                      v-for="wf in projectModalCorrespondingWorkflows"
                      :key="'pmwf-card-' + wf.id_workflow"
                      class="pl-proj-wf-card"
                      :class="{ 'is-preferred': wf.isPreferred }"
                      style="cursor: pointer;"
                      @click="projectForm.default_workflow_id = wf.id_workflow"
                    >
                      <div class="pl-proj-wf-row-head">
                        <div class="pl-proj-wf-meta-inline">
                          <span class="pl-proj-wf-radio" :class="{ 'is-on': wf.isPreferred }" aria-hidden="true"></span>
                          <span class="pl-proj-wf-name">{{ wf.name_workflow }}</span>
                          <template v-if="wf.displayCompanyName || wf.displayCustomerName">
                            <span class="pl-em-sep">—</span>
                            <span class="pl-proj-wf-party">
                              <span v-if="wf.displayCompanyName">{{ wf.displayCompanyName }}</span>
                              <span v-if="wf.displayCompanyName && wf.displayCustomerName" class="pl-dot-sep">•</span>
                              <span v-if="wf.displayCustomerName">{{ wf.displayCustomerName }}</span>
                            </span>
                          </template>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                          <span v-if="wf.isPreferred" class="pl-wf-pref-hint">Mặc định DA</span>
                          <button
                            v-if="wf.isExplicitlyLinked"
                            type="button"
                            class="pl-btn pl-btn-danger-ghost pl-btn-xs"
                            title="Gỡ Khung này khỏi Dự án"
                            @click.stop="toggleProjectFormLinkedWorkflow(wf.id_workflow)"
                          >
                            Gỡ
                          </button>
                        </div>
                      </div>

                      <div class="pl-proj-wf-steps-line">
                        <template
                          v-for="(st, sIdx) in wf.flowSteps"
                          :key="'pmwf-st-' + wf.id_workflow + '-' + st.id"
                        >
                          <div class="pl-wf-step-flat" :title="st.value + ' (' + st.percent + ')'">
                            <span class="pl-proj-wf-step-dot" :style="{ backgroundColor: st.color }"></span>
                            <span class="pl-wf-step-flat-lbl">{{ st.shortLabel || st.label }}</span>
                          </div>
                          <span
                            v-if="sIdx < wf.flowSteps.length - 1"
                            class="pl-wf-step-arrow"
                            aria-hidden="true"
                          >→</span>
                        </template>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="pl-proj-wf-add-card-btn"
                      @click="showProjectFormWfPicker = true"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span>Gắn thêm Khung Pipeline của KH đối tác / Khung mẫu</span>
                    </button>
                  </div>
                </template>
              </div>
            </aside>
          </div>

          <!-- STUDIO FOOTER -->
          <div class="pl-modal-footer is-studio-foot">
            <div class="pl-studio-foot-left">
              <button
                v-if="isEditingProject"
                type="button"
                class="pl-btn pl-btn-danger-ghost"
                @click="confirmDeleteProjectFromForm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>Xóa Dự Án</span>
              </button>
              <span class="pl-studio-kbd-hint bg-hide-sm">Ctrl + S lưu nhanh · Esc đóng</span>
            </div>

            <div class="pl-studio-foot-right">
              <button type="button" class="pl-btn pl-btn-slate" @click="showProjectFormModal = false">Hủy</button>
              <button type="button" class="pl-btn pl-btn-primary" :disabled="savingProject" @click="saveProjectForm">
                <span v-if="savingProject" class="pl-spinner-xs"></span>
                <span>{{ isEditingProject ? 'Lưu Cập Nhật' : 'Tạo Dự Án' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL B1: POPUP PICKER — CHỌN KHUNG PIPELINE GẮN VÀO FORM DỰ ÁN
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showProjectFormWfPicker && showProjectFormModal"
        class="bg-modal-overlay pl-modal-overlay is-submodal-overlay"
        :class="{
          'theme-light-blue': uiTheme === 'light',
          'theme-custom-glass': uiTheme === 'custom'
        }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showProjectFormWfPicker = false"
      >
        <div class="pl-modal-card pl-modal-md">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header">
            <div>
              <h3 class="pl-modal-title">Gắn Thêm Khung Pipeline Vào Dự Án</h3>
              <p class="pl-modal-sub">Chọn Khung Pipeline của KH đối tác / nhà thầu hoặc Khung mẫu</p>
            </div>
            <button type="button" class="pl-modal-close" @click="showProjectFormWfPicker = false" aria-label="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="pl-modal-body">
            <div class="pl-picker-search-bar">
              <input
                v-model="projectFormWfSearch"
                type="text"
                class="bg-input"
                style="flex: 1;"
                placeholder="Tìm tên Khung Pipeline, tên Công ty / KH đối tác..."
              />
            </div>

            <div class="pl-picker-list">
              <div v-if="projectFormAttachableWorkflows.length === 0" class="pl-empty-inline">
                Không tìm thấy Workflow phù hợp. Bạn có thể tạo thêm ở tab Workflow hoặc trong Chi tiết Dự án.
              </div>
              <div
                v-for="wf in projectFormAttachableWorkflows"
                :key="'pf-att-' + wf.id_workflow"
                class="pl-picker-row"
                :class="{ 'is-selected': wf.isLinkedInForm }"
                @click="toggleProjectFormLinkedWorkflow(wf.id_workflow)"
              >
                <div style="min-width: 0; flex: 1;">
                  <div class="pl-picker-row-title">{{ wf.name_workflow }}</div>
                  <div class="pl-picker-row-sub">
                    <span v-if="wf.workflow_scope === 'customer'">KH Khung: {{ wf.ten_cong_ty || wf.ten_khach_hang || 'Riêng KH' }}</span>
                    <span v-else>Kho Khung Mẫu (Blueprint)</span>
                    · <span class="pl-tabular">{{ wf.steps?.length || 0 }} bước</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="pl-picker-select-btn"
                  :class="{ 'is-selected': wf.isLinkedInForm }"
                  @click.stop="toggleProjectFormLinkedWorkflow(wf.id_workflow)"
                >
                  {{ wf.isLinkedInForm ? 'Đã gắn · Bấm gỡ' : '+ Gắn vào DA' }}
                </button>
              </div>
            </div>
          </div>

          <div class="pl-modal-footer">
            <button type="button" class="pl-btn pl-btn-primary" @click="showProjectFormWfPicker = false">Xong</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         MODAL C: ADD / EDIT PIPELINE ITEM (100% FULLSCREEN WORKSPACE)
         ========================================================= -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="bg-modal-overlay pl-modal-overlay is-fullscreen-overlay"
        :class="{
          'theme-light-blue': uiTheme === 'light',
          'theme-custom-glass': uiTheme === 'custom'
        }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="closeModal"
      >
        <div class="pl-modal-card pl-modal-fullscreen is-studio-modal" @click="openTlSelectKey = null">
          <div class="pl-modal-grab" aria-hidden="true"></div>

          <!-- STUDIO TOP BAR WITH LIVE CONTEXT PILLS -->
          <div class="pl-modal-header is-fullscreen-head is-studio-head">
            <div class="pl-modal-title-group">
              <div class="pl-modal-icon is-emerald">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
              </div>
              <div style="min-width: 0;">
                <h3 class="pl-modal-title">{{ isEditing ? 'Chỉnh Sửa Công Việc Pipeline' : 'Thêm Mới Công Việc Pipeline' }}</h3>
                <p class="pl-modal-sub">
                  {{
                    isEditing
                      ? 'Mã công việc: ' + formData.Id_pipeline
                      : 'Mỗi công việc thuộc 1 khách hàng duy nhất • Đồng bộ 2 chiều với Report con'
                  }}
                </p>
              </div>
            </div>

            <div class="pl-studio-head-right">
              <div class="pl-studio-head-pills">
                <span class="pl-studio-ctx-pill is-sky" title="Khung Pipeline đang áp dụng">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  <span>{{ getWorkflowShortLabel(formData.id_workflow || 'WF_DEFAULT') }}</span>
                </span>
                <span
                  class="pl-studio-ctx-pill pl-tabular"
                  :class="'is-' + activeModalStageTone"
                  title="Bước tiến độ hiện tại"
                >
                  {{ activeModalStageSummary }}
                </span>
                <span
                  v-if="parseNum(formData.volume) > 0"
                  class="pl-studio-ctx-pill is-emerald pl-tabular"
                  title="Volume dự kiến trước thuế"
                >
                  {{ formatNumber(formData.volume) }} ₫
                </span>
              </div>

              <button type="button" class="pl-modal-close" @click="closeModal" aria-label="Đóng">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <!-- 3-COLUMN STUDIO WORKSPACE BODY (MATCHES REPORT & BAOGIA TEMPLATE) -->
          <div class="pl-modal-body pl-fullscreen-form-body is-studio-3col">
            <!-- =========================================================
                 COLUMN 1 (~25%): THIẾT LẬP, ƯU TIÊN, PHÂN LOẠI & THỜI HẠN
                 ========================================================= -->
            <aside
              class="modal-group pl-studio-col is-col-left"
              :class="{ 'is-mob-collapsed': !isStudioLeftRailOpen }"
            >
              <div
                class="modal-banner-header is-sky is-mob-collapsible"
                @click="toggleStudioLeftRail"
              >
                <div class="pl-studio-banner-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span class="modal-banner-title">THIẾT LẬP, PHÂN LOẠI &amp; THỜI HẠN</span>
                </div>
                <button
                  type="button"
                  class="pl-studio-mob-rail-toggle"
                  :class="{ 'is-open': isStudioLeftRailOpen }"
                  @click.stop="toggleStudioLeftRail"
                >
                  <span class="pl-tabular">{{ isStudioLeftRailOpen ? 'Thu gọn' : (formData.finish_time || formData.type || formData.tag || 'Thiết lập') }}</span>
                  <svg class="pl-studio-mob-rail-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>

              <div class="modal-group-body pl-studio-col-body pl-studio-left-body">
                <!-- DỰ ÁN GỐC & KHUNG PIPELINE (CHỈ HIỆN KHI MỞ TỪ NGOÀI BẢNG KANBAN) -->
                <template v-if="!isKanbanModalContext">
                  <div class="pl-field">
                    <div class="bg-label-row">
                      <label class="bg-label">Dự Án Gốc (Tùy chọn)</label>
                      <button type="button" class="pl-link-btn" @click="openQuickProjectFromPipelineModal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Dự án mới</span>
                      </button>
                    </div>
                    <select v-model="formData.id_project" class="bg-input" @change="onSelectProjectInPipelineModal">
                      <option value="">Công việc độc lập (Không gắn Dự án)</option>
                      <option
                        v-for="proj in projectsListForModal"
                        :key="'mproj-' + proj.id_project"
                        :value="proj.id_project"
                      >
                        {{ proj.ten_du_an }}{{ proj.ten_cong_ty ? ' — ' + proj.ten_cong_ty : '' }}
                      </option>
                    </select>
                    <div v-if="modalSelectedProject" class="pl-proj-context-note" style="margin-top: 4px;">
                      <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                        <span class="pl-mini-tag is-emerald">KH Gốc: {{ modalSelectedProject.ten_cong_ty || modalSelectedProject.ten_khach_hang || '—' }}</span>
                        <span
                          v-if="(formData.ten_cong_ty || formData.ten_khach_hang) && !isCardSameAsProjectRootCustomer(formData, modalSelectedProject)"
                          class="pl-mini-tag is-amber"
                        >
                          KH đối tác riêng
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="pl-field">
                    <label class="bg-label">Khung Pipeline Áp Dụng</label>
                    <select v-model="formData.id_workflow" class="bg-input" @change="onModalWorkflowChange">
                      <option value="">Khung Chuẩn Hệ Thống (5 bước)</option>
                      <optgroup
                        v-if="modalProjectLinkedWorkflows.length > 0"
                        :label="'Khung Trong Dự Án: ' + (modalSelectedProject?.ten_du_an || '')"
                      >
                        <option v-for="wf in modalProjectLinkedWorkflows" :key="'mwf-proj-' + wf.id_workflow" :value="wf.id_workflow">
                          {{ wf.name_workflow }} ({{ wf.scopeLabel }})
                        </option>
                      </optgroup>
                      <optgroup
                        v-if="modalMatchedCompanyWorkflows.length > 0"
                        :label="'Khung Riêng Của ' + (formData.ten_cong_ty || formData.ten_khach_hang || 'KH này')"
                      >
                        <option v-for="wf in modalMatchedCompanyWorkflows" :key="'mwf-own-' + wf.id_workflow" :value="wf.id_workflow">
                          {{ wf.name_workflow }}{{ wf.is_company_default ? ' (Mặc định)' : '' }}
                        </option>
                      </optgroup>
                      <optgroup v-if="templateWorkflowOptions.length > 0" label="Kho Khung Mẫu Chung">
                        <option v-for="wf in templateWorkflowOptions" :key="'mwft-' + wf.id_workflow" :value="wf.id_workflow">
                          {{ wf.name_workflow }}
                        </option>
                      </optgroup>
                      <optgroup v-if="modalOtherCustomerWorkflows.length > 0" label="Khung Riêng KH Khác">
                        <option v-for="wf in modalOtherCustomerWorkflows" :key="'mwfc-' + wf.id_workflow" :value="wf.id_workflow">
                          {{ wf.name_workflow }}
                        </option>
                      </optgroup>
                    </select>

                    <div v-if="modalSuggestedWorkflowChips.length > 0" class="pl-modal-company-flows">
                      <button
                        v-for="wf in modalSuggestedWorkflowChips"
                        :key="'qchip-' + wf.id_workflow"
                        type="button"
                        class="pl-mcf-chip"
                        :class="{ 'is-active': formData.id_workflow === wf.id_workflow }"
                        @click="selectModalWorkflowQuick(wf.id_workflow)"
                      >
                        {{ wf.name_workflow }}
                      </button>
                      <button
                        type="button"
                        class="pl-mcf-chip"
                        :class="{ 'is-active': !formData.id_workflow || formData.id_workflow === 'WF_DEFAULT' }"
                        @click="selectModalWorkflowQuick('')"
                      >
                        Khung Chuẩn
                      </button>
                    </div>
                  </div>
                </template>

                <!-- 1. MỨC ĐỘ ƯU TIÊN (1-TAP CHOICE GRID) -->
                <div class="pl-field">
                  <label class="bg-label">Mức Độ Ưu Tiên</label>
                  <div class="pl-choice-grid is-cols-3">
                    <button
                      type="button"
                      class="pl-choice-btn"
                      :class="{ 'is-active-slate': !formData.tag || formData.tag === 'Bình thường' }"
                      @click="formData.tag = 'Bình thường'"
                    >
                      Bình thường
                    </button>
                    <button
                      type="button"
                      class="pl-choice-btn"
                      :class="{ 'is-active-amber': formData.tag === 'Bám đuổi' }"
                      @click="formData.tag = 'Bám đuổi'"
                    >
                      Bám đuổi
                    </button>
                    <button
                      type="button"
                      class="pl-choice-btn"
                      :class="{ 'is-active-rose': formData.tag === 'Ưu tiên' }"
                      @click="formData.tag = 'Ưu tiên'"
                    >
                      Ưu tiên
                    </button>
                  </div>
                </div>

                <!-- 2. PHÂN LOẠI (INLINE PICKER) + SỐ LƯỢNG & AM -->
                <div class="pl-field">
                  <label class="bg-label">Phân Loại (Type)</label>
                  <div
                    class="pl-input-with-picker"
                    :class="{ 'has-clear-btn': Boolean(formData.type) }"
                    @click="openTypePickerModal"
                  >
                    <input
                      :value="formData.type"
                      type="text"
                      readonly
                      class="bg-input has-inline-picker is-clickable-picker"
                      placeholder="Nhấn chọn phân loại..."
                    />
                    <button
                      v-if="formData.type"
                      type="button"
                      class="pl-inline-clear-btn"
                      title="Xóa phân loại"
                      @click.stop="formData.type = ''"
                    >×</button>
                    <button
                      type="button"
                      class="pl-inline-picker-btn"
                      @click.stop="openTypePickerModal"
                    >Chọn</button>
                  </div>
                </div>

                <div class="pl-studio-compact-2col">
                  <div class="pl-field">
                    <label class="bg-label">Số Lượng</label>
                    <input v-model="formData.quantity" type="number" inputmode="numeric" class="bg-input pl-tabular" placeholder="1" />
                  </div>
                  <div class="pl-field">
                    <label class="bg-label">AM Phụ Trách</label>
                    <input v-model="formData.AM" type="text" class="bg-input" placeholder="Sơn" />
                  </div>
                </div>

                <!-- 3. TIMELINE DỰ KIẾN CHỐT (PA1: MACHINED DATETIME MATRIX CHUẨN REPORT TEMPLATE) -->
                <div class="pl-field">
                  <div class="bg-label-row">
                    <label class="bg-label">Timeline Dự Kiến Chốt</label>
                    <button
                      v-if="formData.finish_time"
                      type="button"
                      class="pl-link-btn is-rose-hover"
                      @click="clearTimelineField"
                    >
                      <span>Xoá hạn</span>
                    </button>
                  </div>

                  <div class="pl-tl-matrix">
                    <!-- TẦNG 1: QUICK PRESETS ĐỒNG BỘ .pl-choice-btn -->
                    <div class="pl-choice-grid is-cols-4 is-tl-presets">
                      <button
                        type="button"
                        class="pl-choice-btn"
                        :class="{ 'is-active-sky': activeTimelinePreset === 'this_month' }"
                        @click="applyTimelinePreset('this_month')"
                      >Tháng này</button>
                      <button
                        type="button"
                        class="pl-choice-btn"
                        :class="{ 'is-active-sky': activeTimelinePreset === 'this_quarter' }"
                        @click="applyTimelinePreset('this_quarter')"
                      >Quý này</button>
                      <button
                        type="button"
                        class="pl-choice-btn"
                        :class="{ 'is-active-sky': activeTimelinePreset === 'plus_3m' }"
                        @click="applyTimelinePreset('plus_3m')"
                      >+3 tháng</button>
                      <button
                        type="button"
                        class="pl-choice-btn"
                        :class="{ 'is-active-sky': activeTimelinePreset === 'plus_6m' }"
                        @click="applyTimelinePreset('plus_6m')"
                      >+6 tháng</button>
                    </div>

                    <!-- TẦNG 2: CUSTOM DAY / MONTH / YEAR POPOVER MATRIX (MỞ SẴN, ĐỒNG BỘ REPORT) -->
                    <div class="pl-tl-cselect-rows pl-tabular">
                      <!-- DÒNG TỪ -->
                      <div class="pl-tl-cselect-row">
                        <span class="pl-tl-row-tag">TỪ</span>

                        <!-- Ngày bắt đầu -->
                        <div class="pl-tl-cselect-wrap is-day" @click.stop>
                          <button
                            type="button"
                            class="pl-tl-cselect-btn"
                            :class="{
                              'is-open': openTlSelectKey === 'start_d',
                              'has-value': Boolean(tlStartDay)
                            }"
                            @click="toggleTlSelect('start_d')"
                          >
                            <span>{{ tlStartDay || 'Ngày' }}</span>
                            <svg class="pl-tl-cselect-chev" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>

                          <div v-if="openTlSelectKey === 'start_d'" class="pl-tl-cselect-pop is-day-pop">
                            <div class="pl-tl-pop-head">
                              <span>Ngày bắt đầu</span>
                              <div class="pl-tl-pop-actions">
                                <button type="button" class="pl-tl-pop-today" @click="selectTodayForTlSide('start')">Hôm nay</button>
                                <button v-if="tlStartDay" type="button" class="pl-tl-pop-clear" @click="clearTlSide('start')">Bỏ</button>
                              </div>
                            </div>
                            <div class="pl-tl-pop-grid is-cols-7">
                              <button
                                v-for="d in tlStartDayOptions"
                                :key="'sd-' + d"
                                type="button"
                                class="pl-tl-cselect-cell is-day-cell"
                                :class="{ 'is-selected': tlStartDay === d }"
                                @click="selectTlPart('start', 'day', d)"
                              >{{ d }}</button>
                            </div>
                          </div>
                        </div>

                        <span class="pl-tl-sep">/</span>

                        <!-- Tháng bắt đầu -->
                        <div class="pl-tl-cselect-wrap is-month" @click.stop>
                          <button
                            type="button"
                            class="pl-tl-cselect-btn"
                            :class="{
                              'is-open': openTlSelectKey === 'start_m',
                              'has-value': Boolean(tlStartMonth)
                            }"
                            @click="toggleTlSelect('start_m')"
                          >
                            <span>{{ tlStartMonth ? 'T' + tlStartMonth : 'Tháng' }}</span>
                            <svg class="pl-tl-cselect-chev" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>

                          <div v-if="openTlSelectKey === 'start_m'" class="pl-tl-cselect-pop is-month-pop">
                            <div class="pl-tl-pop-head">
                              <span>Tháng bắt đầu</span>
                              <button v-if="tlStartMonth" type="button" class="pl-tl-pop-clear" @click="clearTlSide('start')">Bỏ</button>
                            </div>
                            <div class="pl-tl-pop-grid is-cols-4">
                              <button
                                v-for="m in TIMELINE_MONTH_OPTIONS"
                                :key="'sm-' + m"
                                type="button"
                                class="pl-tl-cselect-cell"
                                :class="{ 'is-selected': tlStartMonth === m }"
                                @click="selectTlPart('start', 'month', m)"
                              >T{{ m }}</button>
                            </div>
                          </div>
                        </div>

                        <span class="pl-tl-sep">/</span>

                        <!-- Năm bắt đầu -->
                        <div class="pl-tl-cselect-wrap is-year" @click.stop>
                          <button
                            type="button"
                            class="pl-tl-cselect-btn"
                            :class="{
                              'is-open': openTlSelectKey === 'start_y',
                              'has-value': Boolean(tlStartYear)
                            }"
                            @click="toggleTlSelect('start_y')"
                          >
                            <span>{{ tlStartYear || 'Năm' }}</span>
                            <svg class="pl-tl-cselect-chev" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>

                          <div v-if="openTlSelectKey === 'start_y'" class="pl-tl-cselect-pop is-year-pop">
                            <div class="pl-tl-pop-head">
                              <span>Năm bắt đầu</span>
                              <button v-if="tlStartYear" type="button" class="pl-tl-pop-clear" @click="clearTlSide('start')">Bỏ</button>
                            </div>
                            <div class="pl-tl-pop-grid is-cols-4">
                              <button
                                v-for="y in timelineYearOptions"
                                :key="'sy-' + y"
                                type="button"
                                class="pl-tl-cselect-cell"
                                :class="{ 'is-selected': tlStartYear === y }"
                                @click="selectTlPart('start', 'year', y)"
                              >{{ y }}</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- DÒNG ĐẾN -->
                      <div class="pl-tl-cselect-row">
                        <span class="pl-tl-row-tag is-end">ĐẾN</span>

                        <!-- Ngày kết thúc / hạn chốt -->
                        <div class="pl-tl-cselect-wrap is-day" @click.stop>
                          <button
                            type="button"
                            class="pl-tl-cselect-btn"
                            :class="{
                              'is-open': openTlSelectKey === 'end_d',
                              'has-value': Boolean(tlEndDay)
                            }"
                            @click="toggleTlSelect('end_d')"
                          >
                            <span>{{ tlEndDay || 'Ngày' }}</span>
                            <svg class="pl-tl-cselect-chev" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>

                          <div v-if="openTlSelectKey === 'end_d'" class="pl-tl-cselect-pop is-day-pop">
                            <div class="pl-tl-pop-head">
                              <span>Ngày dự kiến chốt</span>
                              <div class="pl-tl-pop-actions">
                                <button type="button" class="pl-tl-pop-today" @click="selectTodayForTlSide('end')">Hôm nay</button>
                                <button v-if="tlEndDay" type="button" class="pl-tl-pop-clear" @click="clearTlSide('end')">Bỏ</button>
                              </div>
                            </div>
                            <div class="pl-tl-pop-grid is-cols-7">
                              <button
                                v-for="d in tlEndDayOptions"
                                :key="'ed-' + d"
                                type="button"
                                class="pl-tl-cselect-cell is-day-cell"
                                :class="{ 'is-selected': tlEndDay === d }"
                                @click="selectTlPart('end', 'day', d)"
                              >{{ d }}</button>
                            </div>
                          </div>
                        </div>

                        <span class="pl-tl-sep">/</span>

                        <!-- Tháng dự kiến chốt -->
                        <div class="pl-tl-cselect-wrap is-month" @click.stop>
                          <button
                            type="button"
                            class="pl-tl-cselect-btn"
                            :class="{
                              'is-open': openTlSelectKey === 'end_m',
                              'has-value': Boolean(tlEndMonth)
                            }"
                            @click="toggleTlSelect('end_m')"
                          >
                            <span>{{ tlEndMonth ? 'T' + tlEndMonth : 'Tháng' }}</span>
                            <svg class="pl-tl-cselect-chev" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>

                          <div v-if="openTlSelectKey === 'end_m'" class="pl-tl-cselect-pop is-month-pop">
                            <div class="pl-tl-pop-head">
                              <span>Tháng dự kiến chốt</span>
                              <button v-if="tlEndMonth" type="button" class="pl-tl-pop-clear" @click="clearTlSide('end')">Bỏ</button>
                            </div>
                            <div class="pl-tl-pop-grid is-cols-4">
                              <button
                                v-for="m in TIMELINE_MONTH_OPTIONS"
                                :key="'em-' + m"
                                type="button"
                                class="pl-tl-cselect-cell"
                                :class="{ 'is-selected': tlEndMonth === m }"
                                @click="selectTlPart('end', 'month', m)"
                              >T{{ m }}</button>
                            </div>
                          </div>
                        </div>

                        <span class="pl-tl-sep">/</span>

                        <!-- Năm dự kiến chốt -->
                        <div class="pl-tl-cselect-wrap is-year" @click.stop>
                          <button
                            type="button"
                            class="pl-tl-cselect-btn"
                            :class="{
                              'is-open': openTlSelectKey === 'end_y',
                              'has-value': Boolean(tlEndYear)
                            }"
                            @click="toggleTlSelect('end_y')"
                          >
                            <span>{{ tlEndYear || 'Năm' }}</span>
                            <svg class="pl-tl-cselect-chev" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>

                          <div v-if="openTlSelectKey === 'end_y'" class="pl-tl-cselect-pop is-year-pop">
                            <div class="pl-tl-pop-head">
                              <span>Năm dự kiến chốt</span>
                              <button v-if="tlEndYear" type="button" class="pl-tl-pop-clear" @click="clearTlSide('end')">Bỏ</button>
                            </div>
                            <div class="pl-tl-pop-grid is-cols-4">
                              <button
                                v-for="y in timelineYearOptions"
                                :key="'ey-' + y"
                                type="button"
                                class="pl-tl-cselect-cell"
                                :class="{ 'is-selected': tlEndYear === y }"
                                @click="selectTlPart('end', 'year', y)"
                              >{{ y }}</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- TẦNG 3: Ô HIỂN THỊ KẾT QUẢ / NHẬP TAY CÓ ICON LỊCH -->
                    <div class="pl-tl-single-input-wrap">
                      <svg
                        class="pl-tl-cal-ic"
                        :class="{ 'is-active': Boolean(formData.finish_time) }"
                        xmlns="http://www.w3.org/2000/svg"
                        width="13.5"
                        height="13.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      ><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <input
                        v-model="formData.finish_time"
                        type="text"
                        class="bg-input pl-tabular has-left-cal"
                        :class="{
                          'has-right-clear': Boolean(formData.finish_time),
                          'has-tl-val': Boolean(formData.finish_time)
                        }"
                        placeholder="VD: 01/06/2026 - 01/09/2026"
                        @input="parseFinishTime(formData.finish_time)"
                      />
                      <button
                        v-if="formData.finish_time"
                        type="button"
                        class="pl-tl-clear-btn"
                        title="Xóa timeline"
                        @click="clearTimelineField"
                      >×</button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <!-- =========================================================
                 COLUMN 2 (~47%): KHÁCH HÀNG, GIÁ TRỊ & NỘI DUNG PO / HỢP ĐỒNG
                 ========================================================= -->
            <section class="modal-group pl-studio-col is-col-center">
              <div class="modal-banner-header is-emerald">
                <div class="pl-studio-banner-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <span class="modal-banner-title">KHÁCH HÀNG &amp; NỘI DUNG HỢP ĐỒNG / PO</span>
                </div>
                <button type="button" class="bg-banner-btn" @click="openAddCustomerModal('pipeline')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>Thêm KH mới</span>
                </button>
              </div>

              <div class="modal-group-body pl-studio-col-body pl-studio-center-body">
                <!-- 1. KHÁCH HÀNG CỦA CÔNG VIỆC (2 Ô INLINE PICKER CHUẨN ĐÃ CHỐT) -->
                <div class="pl-form-grid-2">
                  <div class="pl-field">
                    <label class="bg-label">Tên Công Ty Của Công Việc Này</label>
                    <div
                      class="pl-input-with-picker"
                      :class="{ 'has-clear-btn': Boolean(formData.ten_cong_ty) }"
                      @click="openCustomerSearch('pipeline', 'company')"
                    >
                      <input
                        :value="formData.ten_cong_ty"
                        type="text"
                        readonly
                        class="bg-input has-inline-picker is-clickable-picker"
                        placeholder="Nhấn để chọn tên công ty..."
                      />
                      <button
                        v-if="formData.ten_cong_ty"
                        type="button"
                        class="pl-inline-clear-btn"
                        title="Xóa tên công ty"
                        @click.stop="clearPipelineCompanyField"
                      >×</button>
                      <button
                        type="button"
                        class="pl-inline-picker-btn"
                        @click.stop="openCustomerSearch('pipeline', 'company')"
                      >Chọn</button>
                    </div>
                  </div>

                  <div class="pl-field">
                    <label class="bg-label">Người Liên Hệ / Khách Hàng</label>
                    <div
                      class="pl-input-with-picker"
                      :class="{ 'has-clear-btn': Boolean(formData.ten_khach_hang) }"
                      @click="openCustomerSearch('pipeline', 'contact')"
                    >
                      <input
                        :value="formData.ten_khach_hang"
                        type="text"
                        readonly
                        class="bg-input has-inline-picker is-clickable-picker"
                        placeholder="Nhấn để chọn người liên hệ..."
                      />
                      <button
                        v-if="formData.ten_khach_hang"
                        type="button"
                        class="pl-inline-clear-btn"
                        title="Xóa người liên hệ"
                        @click.stop="clearPipelineContactField"
                      >×</button>
                      <button
                        type="button"
                        class="pl-inline-picker-btn"
                        @click.stop="openCustomerSearch('pipeline', 'contact')"
                      >Chọn</button>
                    </div>
                  </div>
                </div>

                <!-- 2. CHỈ SỐ THƯƠNG MẠI: VOLUME DỰ KIẾN TRƯỚC THUẾ -->
                <div class="pl-studio-commercial-row">
                  <div class="pl-field pl-studio-volume-col">
                    <label class="bg-label">Volume Dự Kiến Trước Thuế (₫)</label>
                    <div class="pl-volume-studio-shell">
                      <div class="pl-volume-input-wrap">
                        <NumberInput
                          v-model="formData.volume"
                          :decimals="0"
                          class="bg-input pl-tabular is-volume-hero"
                          placeholder="0"
                        />
                        <span class="pl-volume-unit" aria-hidden="true">₫</span>
                      </div>
                      <button
                        type="button"
                        class="pl-btn pl-btn-sky-soft pl-volume-scan-btn"
                        title="Quét tự động số tiền trước thuế từ PDF / Excel báo giá"
                        @click="triggerScanVolumeFile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line></svg>
                        <span>Quét File</span>
                      </button>
                      <input
                        ref="scanVolumeFileInput"
                        type="file"
                        accept=".pdf,.xls,.xlsx"
                        style="display: none"
                        @change="onScanVolumeFileChange"
                      />
                    </div>
                  </div>
                </div>

                <!-- 3. BỐ CỤC ĐÔI CỘT GIỮA: [TRÁI: NỘI DUNG PO + GHI CHÚ] | [PHẢI: BƯỚC TIẾN ĐỘ] -->
                <div class="pl-studio-work-stage-split">
                  <!-- NỬA TRÁI: NỘI DUNG HỢP ĐỒNG / PO + GHI CHÚ -->
                  <div class="pl-studio-editor-col">
                    <div class="pl-field pl-studio-main-po-field">
                      <div class="bg-label-row">
                        <label class="bg-label">Nội Dung Hợp Đồng / PO / BOM</label>
                        <button type="button" class="pl-link-btn" @click="showReportContentModal = true">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                          <span>Lấy nội dung từ Report</span>
                        </button>
                      </div>
                      <textarea
                        v-model="formData.content_of_contract_po"
                        class="bg-textarea pl-studio-main-textarea"
                        placeholder="Nhập chi tiết hạng mục hàng hóa, license, cấu hình BOM, giải pháp chào thầu..."
                      ></textarea>
                    </div>

                    <div class="pl-field pl-studio-remarks-field">
                      <label class="bg-label">Ghi Chú / Remarks</label>
                      <textarea
                        v-model="formData.ghi_chu_hop_dong"
                        rows="2"
                        class="bg-textarea pl-studio-remarks-textarea"
                        placeholder="Ghi chú tiến độ đàm phán, đối thủ cạnh tranh, ngân sách khách hàng..."
                      ></textarea>
                    </div>
                  </div>

                  <!-- NỬA PHẢI: CỘT PHỤ BƯỚC TIẾN ĐỘ HIỆN TẠI (~215px) -->
                  <div class="pl-field pl-studio-stage-col">
                    <div class="bg-label-row">
                      <label class="bg-label">Bước Tiến Độ Hiện Tại</label>
                      <span
                        class="pl-stage-cur-hint pl-tabular"
                        :class="'is-' + activeModalStageTone"
                      >
                        {{ formData['%status'] || '0%' }}
                      </span>
                    </div>

                    <div class="pl-stage-rail-box">
                      <div class="pl-stage-steps-list">
                        <button
                          v-for="col in progressionModalStages"
                          :key="col.id"
                          type="button"
                          class="pl-stage-step-btn"
                          :class="{ 'is-active': isModalStageActive(col) }"
                          :style="{ '--step-clr': col.color || '#38bdf8' }"
                          :title="col.value"
                          @click="selectModalStage(col)"
                        >
                          <span class="pl-stage-dot" aria-hidden="true"></span>
                          <span class="pl-stage-pct pl-tabular">{{ col.percent }}</span>
                          <span class="pl-stage-lbl">{{ getCleanModalColTitle(col) }}</span>
                          <svg v-if="isModalStageActive(col)" class="pl-stage-chk" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                      </div>

                      <div v-if="outcomeModalStages.length > 0" class="pl-stage-outcomes-row is-rail-footer">
                        <button
                          v-for="col in outcomeModalStages"
                          :key="col.id"
                          type="button"
                          class="pl-stage-outcome-btn"
                          :class="[
                            col.id === 'hoan_thanh' ? 'is-win' : 'is-lost',
                            { 'is-active': isModalStageActive(col) }
                          ]"
                          :style="{ '--step-clr': col.color || (col.id === 'hoan_thanh' ? '#10b981' : '#ef4444') }"
                          :title="col.id === 'hoan_thanh' ? '100% · THÀNH CÔNG' : '0% · THẤT BẠI'"
                          @click="selectModalStage(col)"
                        >
                          <svg
                            v-if="col.id === 'hoan_thanh'"
                            xmlns="http://www.w3.org/2000/svg"
                            width="11.5"
                            height="11.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <svg
                            v-else
                            xmlns="http://www.w3.org/2000/svg"
                            width="11.5"
                            height="11.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          <span>{{ col.id === 'hoan_thanh' ? 'THÀNH CÔNG' : 'THẤT BẠI' }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- =========================================================
                 COLUMN 3 (~28%): REPORT CON LIÊN KẾT & KHO TỆP CHỨNG TỪ
                 ========================================================= -->
            <aside class="modal-group pl-studio-col is-col-right">
              <div class="modal-banner-header is-teal">
                <div class="pl-studio-banner-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <span class="modal-banner-title">REPORT CON &amp; TỆP ĐÍNH KÈM</span>
                </div>
                <span
                  v-if="selectedReports.length > 0 || modalTotalLinkedAttachmentsCount > 0"
                  class="bg-banner-pill pl-tabular"
                >
                  {{ selectedReports.length }} Report · {{ modalTotalLinkedAttachmentsCount }} tệp
                </span>
              </div>

              <div class="modal-group-body pl-studio-col-body pl-studio-right-body">
                <!-- 1. REPORT CON LIÊN KẾT (INLINE PICKER + PER-REPORT FILES) -->
                <div class="pl-field">
                  <label class="bg-label pl-tabular">Report Liên Kết — Con của công việc này ({{ selectedReports.length }})</label>
                  <div
                    class="pl-input-with-picker"
                    :class="{ 'has-clear-btn': selectedReports.length > 0 }"
                    @click="openReportPickerModal"
                  >
                    <input
                      :value="''"
                      type="text"
                      readonly
                      class="bg-input has-inline-picker is-clickable-picker"
                      :placeholder="selectedReports.length > 0 ? 'Nhấn để chọn thêm Report liên kết...' : 'Nhấn để chọn Report liên kết...'"
                    />
                    <button
                      v-if="selectedReports.length > 0"
                      type="button"
                      class="pl-inline-clear-btn"
                      title="Bỏ chọn toàn bộ Report"
                      @click.stop="formData.report_id = ''"
                    >×</button>
                    <button
                      type="button"
                      class="pl-inline-picker-btn"
                      @click.stop="openReportPickerModal"
                    >Chọn</button>
                  </div>

                  <div v-if="selectedReports.length > 0" class="pl-linked-rep-stack">
                    <div v-for="rep in selectedReports" :key="rep.id" class="pl-linked-rep-card">
                      <div class="pl-linked-rep-head">
                        <span class="pl-linked-rep-title" :title="rep.noi_dung">{{ rep.noi_dung }}</span>
                        <div class="pl-linked-rep-actions">
                          <button
                            type="button"
                            class="pl-linked-rep-eye"
                            title="Xem Report trên trang Report Firebase (Mở tab mới)"
                            aria-label="Xem trên Report Firebase"
                            @click.stop="openReportInNewTab(rep.id)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>
                          <button
                            type="button"
                            class="pl-linked-rep-rm"
                            title="Gỡ Report này"
                            aria-label="Gỡ"
                            @click.stop="selectReport(rep.id)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      </div>
                      <div v-if="rep.thoi_gian" class="pl-linked-rep-time pl-tabular">
                        {{ formatReportTime(rep.thoi_gian) }}
                      </div>
                      <div v-if="rep.ghi_chu" class="pl-linked-rep-note">
                        <span class="pl-linked-rep-note-lbl">Ghi chú:</span> {{ rep.ghi_chu }}
                      </div>
                      <div
                        v-if="getUnifiedReportAttachments(rep).length > 0"
                        class="pl-rep-file-list"
                      >
                        <div
                          v-for="(att, atti) in getUnifiedReportAttachments(rep)"
                          :key="'matt-' + rep.id + '-' + atti"
                          class="pl-rep-file-pill"
                        >
                          <span class="pl-rep-file-ic" v-html="getReportAttIconSvg(att)"></span>
                          <span class="pl-rep-file-badge" :class="att.badgeCls">{{ att.badgeLabel }}</span>
                          <span class="pl-rep-file-name" :title="att.name">{{ att.name }}</span>
                          <button
                            type="button"
                            class="pl-rep-file-act is-view"
                            :title="att.kind === 'image' ? 'Xem ảnh' : 'Xem file qua ViewOffice / Trình xem'"
                            @click.stop.prevent="openReportAttachmentView(att)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>
                          <a
                            :href="getDownloadUrl(att.url)"
                            class="pl-rep-file-act is-dl"
                            title="Tải xuống"
                            @click.stop="handleDownloadClick($event, att.url, att.name)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="pl-studio-empty-hint">
                    Chưa gắn Report con. Các file Báo giá / DXMH / Hình ảnh trong Report sẽ tự động hiện tại đây khi liên kết.
                  </div>
                </div>

                <div class="pl-studio-divider"></div>

                <!-- 2. KHO TẢI LÊN CHỨNG TỪ TRỰC TIẾP (UPLOAD VAULT CHUẨN STUDIO) -->
                <div class="pl-field">
                  <div class="bg-label-row">
                    <label class="bg-label pl-tabular">Tệp Đính Kèm Trực Tiếp ({{ fileList.length }})</label>
                  </div>

                  <div
                    class="pl-studio-upload-vault"
                    :class="{ 'is-dragging': isDraggingUpload, 'is-uploading': uploadingFiles }"
                    role="button"
                    tabindex="0"
                    @click="triggerStudioFileUpload"
                    @keydown.enter.prevent="triggerStudioFileUpload"
                    @dragover.prevent="isDraggingUpload = true"
                    @dragleave.prevent="isDraggingUpload = false"
                    @drop.prevent="handleStudioFileDrop"
                  >
                    <span class="pl-studio-up-ic" aria-hidden="true">
                      <span v-if="uploadingFiles" class="pl-spinner-xs"></span>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </span>
                    <div class="pl-studio-up-txt">
                      <span class="pl-studio-up-main">
                        {{ uploadingFiles ? 'Đang tải tệp lên hệ thống...' : 'Tải tệp chứng từ / Kéo thả vào đây' }}
                      </span>
                      <span class="pl-studio-up-sub">Hỗ trợ PDF, Excel, Word, Hình ảnh...</span>
                    </div>
                    <input
                      ref="studioFileInputRef"
                      type="file"
                      multiple
                      style="display: none"
                      :disabled="uploadingFiles"
                      @change="handleFileUpload"
                    />
                  </div>

                  <div v-if="fileList.length > 0" class="pl-studio-file-list">
                    <div v-for="(file, idx) in fileList" :key="idx" class="pl-studio-file-card">
                      <span class="pl-rep-file-ic is-md" v-html="getFileIconSvg(file.name, file.url)"></span>
                      <a
                        :href="getPreviewUrl(file.url)"
                        target="_blank"
                        class="pl-rep-file-name is-clickable"
                        :title="file.name"
                        @click.stop.prevent="openReportAttachmentView(file)"
                      >
                        {{ file.name }}
                      </a>
                      <div class="pl-studio-file-acts">
                        <button
                          type="button"
                          class="pl-rep-file-act is-view"
                          :title="file.kind === 'image' ? 'Xem ảnh' : 'Xem file qua ViewOffice / Trình xem'"
                          @click.stop.prevent="openReportAttachmentView(file)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <a
                          :href="getDownloadUrl(file.url)"
                          class="pl-rep-file-act is-dl"
                          title="Tải xuống"
                          @click.stop="handleDownloadClick($event, file.url, file.name)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                        <button
                          type="button"
                          class="pl-rep-file-act is-del"
                          title="Xóa tệp đính kèm"
                          aria-label="Xóa tệp"
                          @click.stop="removeFile(idx)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <!-- STUDIO STICKY FOOTER -->
          <div class="pl-modal-footer is-fullscreen-foot is-studio-foot">
            <div class="pl-studio-foot-left">
              <button
                v-if="isEditing"
                type="button"
                class="pl-btn pl-btn-danger-ghost"
                @click="requestAction(formData, 'delete')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>Xóa Công Việc</span>
              </button>
              <span class="pl-studio-kbd-hint bg-hide-sm">Ctrl + S lưu nhanh · Esc đóng</span>
            </div>
            <div class="pl-studio-foot-right">
              <button type="button" class="pl-btn pl-btn-slate" @click="closeModal">Hủy</button>
              <button
                type="button"
                class="pl-btn pl-btn-primary"
                :disabled="saving || uploadingFiles || !isFormChanged"
                @click="saveItem"
              >
                <span v-if="saving" class="pl-spinner-xs"></span>
                <span>{{ isEditing ? 'Lưu Thay Đổi' : 'Tạo Công Việc' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- =========================================================
         UTILITY MODALS 1-8, BAOGIA DIALOG & SMART TOAST
         ========================================================= -->
    <!-- 1. CUSTOMER / COMPANY / CONTACT PICKER MODAL -->
    <Teleport to="body">
      <div
        v-if="showCustomerModal"
        class="bg-modal-overlay pl-modal-overlay is-picker-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showCustomerModal = false"
      >
        <div class="pl-modal-card pl-modal-md">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header">
            <div>
              <h3 class="pl-modal-title">
                {{
                  customerPickerFocus === 'contact'
                    ? 'Chọn Người Liên Hệ / Khách Hàng'
                    : 'Chọn Tên Công Ty / Khách Hàng'
                }}
              </h3>
              <p v-if="customerPickerFocus === 'contact' && activePickerCompanyHint" class="pl-modal-sub">
                Đang ưu tiên người liên hệ thuộc: {{ activePickerCompanyHint }}
              </p>
            </div>
            <button type="button" class="pl-modal-close" @click="showCustomerModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="pl-modal-body">
            <div class="pl-picker-search-bar">
              <input
                v-model="customerSearchStr"
                type="text"
                class="bg-input"
                :placeholder="
                  customerPickerFocus === 'contact'
                    ? 'Tìm hoặc nhập tên người liên hệ, công ty...'
                    : 'Tìm hoặc nhập tên công ty, người liên hệ, mã KH...'
                "
                style="flex: 1; min-width: 180px;"
                @keydown.enter.prevent="customerSearchStr.trim() && filteredCustomers.length === 0 && applyManualCustomerSearchInput()"
              />
              <button
                v-if="customerSearchStr.trim()"
                type="button"
                class="pl-btn pl-btn-sky-soft pl-btn-sm"
                @click="applyManualCustomerSearchInput"
              >
                Dùng "{{ customerSearchStr.trim() }}"
              </button>
              <button
                type="button"
                class="pl-btn pl-btn-primary pl-btn-sm"
                @click="openAddCustomerModal(customerSearchMode)"
              >
                + Thêm KH mới
              </button>
            </div>

            <div class="pl-picker-list">
              <div v-if="loadingCustomers" class="pl-empty-inline">Đang tải danh bạ khách hàng...</div>
              <div v-else-if="filteredCustomers.length === 0" class="pl-empty-inline">
                <div>Không tìm thấy khách hàng có sẵn khớp từ khóa.</div>
                <div v-if="customerSearchStr.trim()" style="margin-top: 8px;">
                  <button type="button" class="pl-btn pl-btn-primary pl-btn-xs" @click="applyManualCustomerSearchInput">
                    + Chọn nhanh "{{ customerSearchStr.trim() }}"
                  </button>
                </div>
              </div>
              <div
                v-for="(c, cIdx) in filteredCustomers"
                :key="c.Ma_khach_hang + '_' + c.Ma_cong_ty + '_' + cIdx"
                class="pl-picker-row"
                :class="{ 'is-selected': isCustomerPickerRowActive(c) }"
                @click="selectCustomer(c)"
              >
                <div style="min-width: 0; flex: 1;">
                  <div class="pl-picker-row-title">
                    {{
                      customerPickerFocus === 'contact'
                        ? c.Ten_khach_hang || c.Ten_cong_ty
                        : c.Ten_cong_ty || c.Ten_khach_hang
                    }}
                  </div>
                  <div class="pl-picker-row-sub">
                    <template v-if="customerPickerFocus === 'contact'">
                      {{ c.Ten_cong_ty || 'Chưa rõ công ty' }} • <span class="pl-mono">{{ c.Ma_khach_hang }}</span>
                    </template>
                    <template v-else>
                      {{ c.Ten_khach_hang || 'Chưa có người liên hệ' }} • <span class="pl-mono">{{ c.Ma_khach_hang }}</span>
                    </template>
                  </div>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;">
                  <span v-if="c._isSameCompany" class="pl-mini-tag is-sky">Cùng công ty</span>
                  <span
                    v-if="resolveCustomerWorkflow({ ma_khach_hang: c.Ma_khach_hang, ten_cong_ty: c.Ten_cong_ty, ten_khach_hang: c.Ten_khach_hang }).isCustom"
                    class="pl-mini-tag is-emerald"
                  >
                    Có Khung riêng
                  </span>
                  <button
                    type="button"
                    class="pl-picker-select-btn"
                    title="Xem / Cập nhật thông tin khách hàng này"
                    @click.stop="editCustomerFromPicker(c)"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    class="pl-picker-select-btn"
                    :class="{ 'is-selected': isCustomerPickerRowActive(c) }"
                    @click.stop="selectCustomer(c)"
                  >
                    {{ isCustomerPickerRowActive(c) ? 'Đang chọn' : 'Chọn' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="pl-modal-footer">
            <button type="button" class="pl-btn pl-btn-slate" @click="showCustomerModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 2. ADD / EDIT CUSTOMER MODAL SUITE (100% ĐỒNG BỘ REPORTFIREBASE: MODULE 4D + 4D-1..4 + 4E) -->
    <Teleport to="body">
      <!-- MODULE 4D: MODAL THÊM / SỬA KHÁCH HÀNG (2-COL THEMED BANNER GROUPS + SMART IMPORT) -->
      <div
        v-if="showAddCustomerModal"
        class="bg-modal-overlay pl-modal-overlay pl-cus-suite-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="[{ zIndex: 100065 }, uiTheme === 'custom' ? customGlassStyleVars : null]"
        @click.self="showAddCustomerModal = false"
      >
        <div class="bg-modal-card is-lg is-mobile-sheet cus-modal-with-import" role="dialog" aria-modal="true">
          <div class="bg-modal-head dt-only-head">
            <div class="bg-modal-title-row">
              <div class="bg-modal-icon is-emerald">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              </div>
              <div>
                <div class="bg-modal-title-inline">
                  <h2 class="bg-modal-title">{{ customerFormData.id ? 'Cập Nhật Khách Hàng' : 'Tạo Khách Hàng Mới' }}</h2>
                  <span v-if="customerFormData.id && customerFormData.last_updated" class="bg-count-pill bg-tabular">
                    Cập nhật: {{ formatCustomerLastUpdated(customerFormData.last_updated) }}
                  </span>
                </div>
                <p class="bg-modal-sub">Đồng bộ trực tiếp với danh bạ Khách Hàng hệ thống • Hỗ trợ quét nhanh ĐXMH, Báo Giá &amp; Thuế / ĐKKD</p>
              </div>
            </div>
            <button type="button" class="bg-modal-close" @click="showAddCustomerModal = false">✕</button>
          </div>

          <div class="m-grab-head-stack">
            <div class="m-grab-pill"></div>
            <div class="m-grab-bar">
              <h2 class="m-grab-title">{{ customerFormData.id ? 'Cập Nhật Khách Hàng' : 'Tạo Khách Hàng Mới' }}</h2>
              <button type="button" class="bg-modal-close" @click="showAddCustomerModal = false">✕</button>
            </div>
          </div>

          <!-- TOP QUICK-ACTION IMPORT TOOLBAR (ĐỒNG BỘ TRANG REPORTFIREBASE / BÁO GIÁ) -->
          <div class="bg-modal-subbar cus-import-toolbar">
            <div class="cus-import-status-row">
              <span class="cus-db-status-pill" :class="customerFormData.id ? 'is-existing' : 'is-new'">
                {{ customerFormData.id ? 'ĐÃ CÓ TRONG DB' : 'KHÁCH HÀNG MỚI' }}
              </span>
              <span v-if="customerFormData.ma_khach_hang" class="cus-code-meta-chip bg-tabular">
                Mã KH: <strong class="is-sky">{{ customerFormData.ma_khach_hang }}</strong>
              </span>
              <span v-if="customerFormData.ma_cong_ty" class="cus-code-meta-chip bg-tabular">
                • Mã CT: <strong class="is-emerald">{{ customerFormData.ma_cong_ty }}</strong>
              </span>
            </div>

            <div class="cus-import-btn-row">
              <button
                type="button"
                class="cus-quick-import-btn is-dxmh"
                @click="openCusSmartImportModal('khach_dxmh')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span class="dt-lbl">Import khách hàng (File DXMH)</span>
                <span class="mb-lbl">File DXMH</span>
              </button>

              <button
                type="button"
                class="cus-quick-import-btn is-baogia"
                @click="openCusSmartImportModal('khach_baogia')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                <span class="dt-lbl">Import khách hàng (File Báo Giá)</span>
                <span class="mb-lbl">File Báo Giá</span>
              </button>

              <button
                type="button"
                class="cus-quick-import-btn is-tax"
                @click="openCusSmartImportModal('thue')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span class="dt-lbl">Import Thuế / ĐKKD</span>
                <span class="mb-lbl">Thuế / ĐKKD</span>
              </button>

              <button
                type="button"
                class="cus-quick-import-btn is-reset"
                title="Làm mới trắng biểu mẫu để tạo khách hàng mới"
                @click="resetCustomerModalForm"
              >
                Reset
              </button>
            </div>
          </div>

          <div class="bg-modal-body">
            <div class="bg-grid-2">
              <!-- Group 1: Đại diện -->
              <div class="modal-group is-sky">
                <div class="modal-banner-header is-sky">
                  <span>THÔNG TIN ĐẠI DIỆN</span>
                </div>
                <div class="modal-group-body">
                  <div class="bg-field">
                    <label class="bg-label">Mã khách hàng <span class="bg-req">*</span></label>
                    <input type="text" v-model="customerFormData.ma_khach_hang" class="bg-input bg-tabular" placeholder="VD: KH-001" :disabled="!!customerFormData.id" />
                  </div>

                  <div class="bg-grid-2">
                    <div class="bg-field">
                      <label class="bg-label">Tên khách hàng <span class="bg-req">*</span></label>
                      <input type="text" v-model="customerFormData.ten_khach_hang" class="bg-input" placeholder="VD: Nguyễn Văn A" />
                    </div>
                    <div class="bg-field">
                      <div class="bg-label-row">
                        <label class="bg-label">Nhóm KH</label>
                        <button type="button" class="bg-mini-link is-sky" @click="isTagModalOpen = true">Quản lý nhóm</button>
                      </div>
                      <div v-if="availableTags.length > 0" class="bg-tag-selector">
                        <button
                          v-for="tag in availableTags"
                          :key="tag.id"
                          type="button"
                          class="bg-tag-toggle"
                          :class="{ 'is-selected': customerFormData.tagKH?.includes(tag.name) }"
                          @click="toggleTag(tag.name)"
                        >
                          {{ tag.name }}
                        </button>
                      </div>
                      <div v-else class="bg-target-muted">Chưa có nhóm</div>
                    </div>
                  </div>

                  <div class="bg-grid-2">
                    <div class="bg-field">
                      <label class="bg-label">SĐT cá nhân</label>
                      <input type="text" v-model="customerFormData.so_dien_thoai_ca_nhan" class="bg-input bg-tabular" />
                    </div>
                    <div class="bg-field">
                      <label class="bg-label">Email cá nhân</label>
                      <input type="email" v-model="customerFormData.email_ca_nhan" class="bg-input" />
                    </div>
                  </div>

                  <div class="bg-field">
                    <label class="bg-label">Tên khách hàng phụ</label>
                    <input type="text" v-model="customerFormData.ten_khach_hang_phu" class="bg-input" />
                  </div>

                  <div class="bg-grid-2">
                    <div class="bg-field">
                      <label class="bg-label">SĐT phụ</label>
                      <input type="text" v-model="customerFormData.so_dien_thoai_ca_nhan_phu" class="bg-input bg-tabular" />
                    </div>
                    <div class="bg-field">
                      <label class="bg-label">Email phụ</label>
                      <input type="email" v-model="customerFormData.email_ca_nhan_phu" class="bg-input" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Group 2: Công ty -->
              <div class="modal-group is-emerald">
                <div class="modal-banner-header is-emerald">
                  <span>THÔNG TIN CÔNG TY</span>
                </div>
                <div class="modal-group-body">
                  <div class="bg-grid-2">
                    <div class="bg-field">
                      <label class="bg-label">Mã công ty</label>
                      <input type="text" v-model="customerFormData.ma_cong_ty" class="bg-input bg-tabular" :disabled="!!customerFormData.id" />
                    </div>
                    <div class="bg-field">
                      <label class="bg-label">Tên công ty</label>
                      <input type="text" v-model="customerFormData.ten_cong_ty" class="bg-input" />
                    </div>
                  </div>

                  <div class="bg-grid-2">
                    <div class="bg-field">
                      <label class="bg-label">Mã số thuế (MST)</label>
                      <input type="text" v-model="customerFormData.mst" class="bg-input bg-tabular" />
                    </div>
                    <div class="bg-field">
                      <label class="bg-label">Ngành nghề kinh doanh</label>
                      <input type="text" v-model="customerFormData.nganh_nghe_cong_ty" class="bg-input" placeholder="Ngành nghề chính..." />
                    </div>
                  </div>

                  <div class="bg-field">
                    <label class="bg-label">Địa chỉ công ty</label>
                    <input type="text" v-model="customerFormData.dia_chi_cong_ty" class="bg-input" />
                  </div>

                  <div class="bg-grid-2">
                    <div class="bg-field">
                      <label class="bg-label">Email công ty</label>
                      <input type="email" v-model="customerFormData.email_cong_ty" class="bg-input" />
                    </div>
                    <div class="bg-field">
                      <label class="bg-label">Website</label>
                      <input type="text" v-model="customerFormData.website_cong_ty" class="bg-input" />
                    </div>
                  </div>

                  <div class="bg-grid-2">
                    <div class="bg-field">
                      <label class="bg-label">SĐT công ty</label>
                      <input type="text" v-model="customerFormData.so_dien_thoai_cong_ty" class="bg-input bg-tabular" />
                    </div>
                    <div class="bg-field">
                      <label class="bg-label">Số Fax</label>
                      <input type="text" v-model="customerFormData.so_fax_cong_ty" class="bg-input bg-tabular" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Group 3: Đơn hàng PO (Tiếng Anh) & Thông tin bổ sung -->
            <div class="modal-group is-teal" style="margin-top: 14px;">
              <div class="modal-banner-header is-teal">
                <span>ĐƠN HÀNG PO (QUỐC TẾ) &amp; THÔNG TIN BỔ SUNG</span>
              </div>
              <div class="modal-group-body">
                <div class="bg-grid-3" style="margin-bottom: 10px;">
                  <div class="bg-field">
                    <label class="bg-label">COMPANY (Tên Tiếng Anh / PO)</label>
                    <input type="text" v-model="customerFormData.company" class="bg-input" placeholder="International Company Name..." />
                  </div>
                  <div class="bg-field">
                    <label class="bg-label">TEL (SĐT PO)</label>
                    <input type="text" v-model="customerFormData.tel" class="bg-input bg-tabular" placeholder="Telephone..." />
                  </div>
                  <div class="bg-field">
                    <label class="bg-label">ADDRESS (Địa chỉ PO / Giao hàng)</label>
                    <input type="text" v-model="customerFormData.address" class="bg-input" placeholder="Address..." />
                  </div>
                </div>

                <div class="bg-grid-3">
                  <div class="bg-field">
                    <label class="bg-label">Trạng thái</label>
                    <input type="text" v-model="customerFormData.trang_thai" class="bg-input" placeholder="Active / Tiềm năng" />
                  </div>
                  <div class="bg-field">
                    <label class="bg-label">Hoa hồng (%)</label>
                    <input type="text" v-model="customerFormData.hoa_hong" class="bg-input bg-tabular" />
                  </div>
                  <div class="bg-field">
                    <label class="bg-label">Ghi chú KH</label>
                    <input type="text" v-model="customerFormData.ghi_chu" class="bg-input" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-modal-foot">
            <button type="button" class="bg-btn bg-btn-slate" @click="showAddCustomerModal = false">Huỷ bỏ</button>
            <div class="bg-foot-right">
              <button
                v-if="!customerFormData.id"
                type="button"
                class="bg-btn bg-btn-primary"
                :disabled="isSavingCustomer"
                @click="saveNewCustomer"
              >
                <span v-if="isSavingCustomer" class="pl-spinner-xs"></span>
                <span>Tạo Khách Hàng</span>
              </button>
              <button
                v-else-if="isCustomerDataChanged"
                type="button"
                class="bg-btn bg-btn-emerald"
                :disabled="isSavingCustomer"
                @click="saveNewCustomer"
              >
                <span v-if="isSavingCustomer" class="pl-spinner-xs"></span>
                <span>Lưu Thay Đổi</span>
              </button>
              <button
                v-else
                type="button"
                class="bg-btn bg-btn-primary"
                @click="applyExistingCustomerFromModal"
              >
                Chọn Khách Hàng Này
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODULE 4D-1: MODAL IMPORT ĐA ĐỊNH DẠNG THỐNG NHẤT (FILE DXMH / FILE BÁO GIÁ / THUẾ & ĐKKD) -->
      <div
        v-if="cusSmartImportModal.show"
        class="bg-modal-overlay pl-modal-overlay pl-cus-suite-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="[{ zIndex: 100075 }, uiTheme === 'custom' ? customGlassStyleVars : null]"
        @click.self="closeCusSmartImportModal"
        @dragover="onCusSmartImportDragOver"
        @dragleave="onCusSmartImportDragLeave"
        @drop="onCusSmartImportDrop"
      >
        <div class="bg-modal-card is-md is-mobile-sheet cus-smart-upload-card" role="dialog" aria-modal="true">
          <div class="bg-modal-head dt-only-head">
            <div class="bg-modal-title-row">
              <div class="bg-modal-icon" :class="cusSmartImportMeta.iconTone">
                <svg v-if="cusSmartImportModal.mode === 'thue'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <svg v-else-if="cusSmartImportModal.mode === 'khach_baogia'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <div>
                <div class="bg-modal-title-inline">
                  <h2 class="bg-modal-title">{{ cusSmartImportMeta.title }}</h2>
                  <span class="bg-count-pill">{{ cusSmartImportMeta.badge }}</span>
                </div>
                <p class="bg-modal-sub">Hỗ trợ Excel mọi định dạng, PDF, Word và Ảnh chụp chứng từ</p>
              </div>
            </div>
            <button type="button" class="bg-modal-close" @click="closeCusSmartImportModal">✕</button>
          </div>

          <div class="m-grab-head-stack">
            <div class="m-grab-pill"></div>
            <div class="m-grab-bar">
              <div>
                <div class="cus-mob-eyebrow">{{ cusSmartImportMeta.badge }}</div>
                <h2 class="m-grab-title">{{ cusSmartImportMeta.mobTitle }}</h2>
              </div>
              <button type="button" class="bg-modal-close" @click="closeCusSmartImportModal">✕</button>
            </div>
          </div>

          <div class="bg-modal-body cus-smart-upload-body">
            <input
              ref="cusSmartFileInputRef"
              type="file"
              :accept="UNIVERSAL_IMPORT_ACCEPT"
              style="display: none;"
              @change="onCusSmartImportFileChange"
            />
            <input
              ref="cusSmartImageInputRef"
              type="file"
              accept="image/*"
              style="display: none;"
              @change="onCusSmartImportFileChange"
            />

            <!-- DESKTOP DROPZONE -->
            <div
              class="cus-smart-dropzone"
              :class="{
                'is-dragging': cusSmartImportModal.isDragging,
                'is-compact': cusSmartImportModal.files.length > 0
              }"
              @click="cusSmartFileInputRef?.click()"
            >
              <div class="cus-smart-drop-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path></svg>
              </div>
              <div class="cus-smart-drop-title">
                Nhấn <kbd>Ctrl + V</kbd> để dán ảnh chụp màn hình, hoặc kéo thả file / ảnh vào đây
              </div>
              <div class="cus-smart-drop-sub">
                Hỗ trợ Excel (.xlsx, .xls, .xlsm, .xlsb, .ods, .csv...), PDF, Word (.docx, .doc, .rtf) và Ảnh
              </div>
              <div class="cus-smart-drop-actions" @click.stop>
                <button type="button" class="bg-btn bg-btn-primary" @click="cusSmartFileInputRef?.click()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <span>Chọn File tài liệu</span>
                </button>
                <button type="button" class="bg-btn bg-btn-slate" @click="cusSmartImageInputRef?.click()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>Chọn Ảnh</span>
                </button>
              </div>
            </div>

            <!-- MOBILE PICKER BOX -->
            <div class="cus-smart-mob-picker">
              <div class="cus-smart-mob-grid">
                <button type="button" class="bg-btn bg-btn-primary cus-smart-mob-btn" @click="cusSmartFileInputRef?.click()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <span>Chọn File tài liệu</span>
                </button>
                <button type="button" class="bg-btn bg-btn-slate cus-smart-mob-btn" @click="cusSmartImageInputRef?.click()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>Chọn / Chụp Ảnh</span>
                </button>
              </div>
              <button type="button" class="bg-btn bg-btn-slate cus-smart-mob-paste-btn" @click="pasteFromMobileClipboardToCusSmartImport">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                <span>Dán ảnh từ bộ nhớ tạm</span>
              </button>
              <div v-if="cusSmartImportModal.showMobPasteBox" class="cus-smart-mob-paste-fallback">
                <input
                  ref="cusSmartMobPasteRef"
                  type="text"
                  readonly
                  class="bg-input"
                  placeholder="Chạm giữ vào đây rồi chọn Dán (Paste)..."
                  @paste="onCusSmartImportPaste"
                />
              </div>
            </div>

            <!-- ẢNH MẪU HƯỚNG DẪN KHI Ở CHẾ ĐỘ QUÉT THUẾ CHƯA CHỌN FILE -->
            <div
              v-if="cusSmartImportModal.mode === 'thue' && cusSmartImportModal.files.length === 0"
              class="cus-tax-sample-box"
            >
              <div class="cus-tax-sample-head">
                <span>Ảnh mẫu thông tin thuế chuẩn</span>
                <button
                  type="button"
                  class="cus-zoom-mini-btn"
                  @click="openCustomerDocPreviewImage(anhMauThueUrl, 'Ảnh mẫu thông tin thuế chuẩn')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                  <span>Phóng to mẫu</span>
                </button>
              </div>
              <div
                class="cus-tax-sample-frame"
                @click="openCustomerDocPreviewImage(anhMauThueUrl, 'Ảnh mẫu thông tin thuế chuẩn')"
              >
                <img :src="anhMauThueUrl" alt="Ảnh mẫu thông tin thuế" />
              </div>
            </div>

            <!-- FILE / ẢNH ĐƯA VÀO -->
            <div v-if="cusSmartImportModal.files.length > 0" class="cus-staged-section">
              <div class="cus-staged-head">
                <span>Tài liệu sẵn sàng quét dữ liệu</span>
              </div>
              <div
                v-for="(uItem, uIdx) in cusSmartImportModal.files"
                :key="uItem.id"
                class="cus-staged-card"
              >
                <div class="cus-staged-top">
                  <div class="cus-staged-meta">
                    <span class="cus-staged-type-icon" :class="'is-' + uItem.category">
                      <svg v-if="uItem.isImage" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </span>
                    <span class="cus-staged-ext bg-tabular">{{ uItem.ext || 'FILE' }}</span>
                    <span class="cus-staged-size bg-tabular">{{ uItem.sizeLabel }}</span>
                    <span v-if="uItem.fromClipboard" class="cus-staged-clip">Clipboard</span>
                  </div>
                  <button
                    type="button"
                    class="cus-staged-remove-btn"
                    title="Gỡ tài liệu này"
                    @click.stop="removeCusSmartImportPendingItem(uIdx)"
                  >✕</button>
                </div>
                <div class="cus-staged-name-row" @click.stop>
                  <input
                    type="text"
                    v-model="uItem.baseName"
                    class="bg-input cus-smart-name-input"
                    placeholder="Tên tài liệu..."
                  />
                </div>
              </div>

              <!-- XEM TRƯỚC NẾU LÀ ẢNH -->
              <div
                v-if="cusSmartImportModal.files[0]?.isImage && cusSmartImportModal.files[0]?.previewUrl"
                class="cus-tax-sample-box"
              >
                <div class="cus-tax-sample-head">
                  <span>Xem trước ảnh đã chọn</span>
                  <button
                    type="button"
                    class="cus-zoom-mini-btn"
                    @click="openCustomerDocPreviewImage(cusSmartImportModal.files[0].previewUrl, cusSmartImportModal.files[0].baseName || 'Xem trước ảnh đã chọn')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    <span>Phóng to</span>
                  </button>
                </div>
                <div
                  class="cus-tax-sample-frame"
                  @click="openCustomerDocPreviewImage(cusSmartImportModal.files[0].previewUrl, cusSmartImportModal.files[0].baseName || 'Xem trước ảnh đã chọn')"
                >
                  <img :src="cusSmartImportModal.files[0].previewUrl" alt="Xem trước ảnh tài liệu" />
                </div>
              </div>
            </div>
          </div>

          <div class="bg-modal-foot">
            <button type="button" class="bg-btn bg-btn-slate" @click="closeCusSmartImportModal">Huỷ bỏ</button>
            <div class="bg-foot-right">
              <button
                type="button"
                class="bg-btn bg-btn-primary"
                :disabled="!cusSmartImportModal.files.length"
                @click="submitCusSmartImportStandardScan"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>{{ cusSmartImportMeta.primaryCta }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODULE 4D-2: MODAL XÁC NHẬN THÔNG TIN THUẾ / ĐKKD -->
      <div
        v-if="isCusTaxModalOpen"
        class="bg-modal-overlay pl-modal-overlay pl-cus-suite-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="[{ zIndex: 100078 }, uiTheme === 'custom' ? customGlassStyleVars : null]"
        @click.self="closeCusTaxModal"
      >
        <div class="bg-modal-card is-lg is-mobile-sheet cus-tax-confirm-card" role="dialog" aria-modal="true">
          <div class="bg-modal-head dt-only-head">
            <div class="bg-modal-title-row">
              <div class="bg-modal-icon is-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>
              </div>
              <div>
                <h2 class="bg-modal-title">Xác Nhận Thông Tin Thuế / ĐKKD</h2>
                <p class="bg-modal-sub">Kiểm tra &amp; chỉnh sửa dữ liệu trích xuất trước khi điền vào hồ sơ khách hàng</p>
              </div>
            </div>
            <button type="button" class="bg-modal-close" @click="closeCusTaxModal">✕</button>
          </div>

          <div class="m-grab-head-stack">
            <div class="m-grab-pill"></div>
            <div class="m-grab-bar">
              <div>
                <div class="cus-mob-eyebrow">Kiểm tra dữ liệu trích xuất</div>
                <h2 class="m-grab-title">Xác nhận thông tin thuế</h2>
              </div>
              <button type="button" class="bg-modal-close" @click="closeCusTaxModal">✕</button>
            </div>
          </div>

          <div class="bg-modal-subbar cus-tax-subbar">
            <div class="cus-tax-subbar-left">
              <span v-if="lastCusTaxFile" class="cus-tax-pill">
                <span class="cus-tax-pill-lbl">Nguồn:</span>
                <strong class="cus-tax-pill-name" :title="lastCusTaxFile.name">{{ lastCusTaxFile.name }}</strong>
              </span>
              <span class="cus-tax-pill">
                <span class="cus-tax-pill-lbl">Chế độ đọc:</span>
                <strong class="is-sky">{{ cusTaxScanSourceMode === 'ai' ? 'AI thông minh' : 'Quét chuẩn' }}</strong>
              </span>
            </div>
            <button
              type="button"
              class="cus-zoom-mini-btn"
              @click="closeCusTaxModal(); openCusSmartImportModal('thue')"
            >
              Chọn tài liệu khác
            </button>
          </div>

          <div class="bg-modal-body">
            <div class="cus-tax-split-grid">
              <div class="cus-tax-form-col">
                <div class="bg-field">
                  <label class="bg-label">Mã số thuế (MST)</label>
                  <input
                    type="text"
                    v-model="cusTaxInfo.mst"
                    class="bg-input bg-tabular"
                    placeholder="Mã số thuế doanh nghiệp..."
                  />
                </div>
                <div class="bg-field">
                  <label class="bg-label">Tên công ty (Tiếng Việt)</label>
                  <textarea
                    rows="2"
                    v-model="cusTaxInfo.tenCongTy"
                    class="bg-input cus-tax-textarea"
                    placeholder="Tên công ty tiếng Việt..."
                  ></textarea>
                </div>
                <div class="bg-field">
                  <label class="bg-label is-sky-accent">Tên công ty (Tiếng Anh / Quốc tế)</label>
                  <textarea
                    rows="2"
                    v-model="cusTaxInfo.tenCongTyEn"
                    class="bg-input cus-tax-textarea is-sky-accent"
                    placeholder="Tên quốc tế / Tiếng Anh..."
                  ></textarea>
                </div>
                <div class="bg-field">
                  <label class="bg-label">Địa chỉ công ty</label>
                  <textarea
                    rows="2"
                    v-model="cusTaxInfo.diaChi"
                    class="bg-input cus-tax-textarea"
                    placeholder="Địa chỉ trụ sở..."
                  ></textarea>
                </div>
                <div class="bg-field">
                  <label class="bg-label">Ngành nghề chính</label>
                  <textarea
                    rows="3"
                    v-model="cusTaxInfo.nganhNgheChinh"
                    class="bg-input cus-tax-textarea"
                    placeholder="Ngành nghề kinh doanh chính..."
                  ></textarea>
                </div>
              </div>

              <div class="cus-tax-preview-col">
                <label class="bg-label">
                  {{ cusTaxSourceIsImage ? 'Ảnh Thuế Đã Tải Lên (Nhấn để phóng to)' : 'Tài Liệu Nguồn Đã Tải Lên' }}
                </label>
                <div
                  v-if="cusTaxSourceIsImage && cusTaxPreviewUrl"
                  class="cus-tax-img-frame"
                  @click="openCustomerDocPreviewImage(cusTaxPreviewUrl, lastCusTaxFile?.name || 'Ảnh thông tin thuế')"
                >
                  <img :src="cusTaxPreviewUrl" alt="Ảnh thông tin thuế" />
                </div>
                <div v-else class="cus-tax-doc-card">
                  <div class="cus-tax-doc-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  </div>
                  <div class="cus-tax-doc-name">{{ lastCusTaxFile?.name || 'Tài liệu thông tin thuế' }}</div>
                  <div v-if="lastCusTaxFile" class="cus-tax-doc-meta bg-tabular">
                    Dung lượng: {{ formatCusImportFileSize(lastCusTaxFile.size) }}
                  </div>
                  <button
                    type="button"
                    class="bg-btn bg-btn-slate"
                    style="margin-top: 6px;"
                    @click="closeCusTaxModal(); openCusSmartImportModal('thue')"
                  >
                    Chọn tài liệu khác
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-modal-foot">
            <button type="button" class="bg-btn bg-btn-slate" @click="closeCusTaxModal">Huỷ bỏ</button>
            <div class="bg-foot-right">
              <button type="button" class="bg-btn bg-btn-emerald" @click="confirmCusTaxModalInfo">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Đồng ý &amp; Cập nhật</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODULE 4D-3: MODAL ĐỀ XUẤT QUÉT BẰNG AI FALLBACK -->
      <div
        v-if="cusAiFallbackModal.show"
        class="bg-modal-overlay pl-modal-overlay pl-cus-suite-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="[{ zIndex: 100080 }, uiTheme === 'custom' ? customGlassStyleVars : null]"
        @click.self="closeCusAiImportFallback"
      >
        <div class="bg-modal-card is-sm cus-ai-fallback-card" role="dialog" aria-modal="true">
          <div class="bg-modal-head">
            <div class="bg-modal-title-row">
              <div class="bg-modal-icon is-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div>
                <h2 class="bg-modal-title">Chuyển Sang Quét Thông Minh Bằng AI?</h2>
                <p class="bg-modal-sub">{{ cusAiFallbackFlowLabel }}</p>
              </div>
            </div>
            <button type="button" class="bg-modal-close" @click="closeCusAiImportFallback">✕</button>
          </div>

          <div class="bg-modal-body cus-ai-fallback-body">
            <div v-if="cusAiFallbackModal.file" class="cus-ai-file-chip">
              <strong>Tệp nguồn:</strong>
              <span>{{ cusAiFallbackModal.file.name }}</span>
            </div>
            <p class="cus-ai-reason-text">{{ cusAiFallbackModal.reason }}</p>
            <p class="cus-ai-hint-text">
              Bạn có muốn sử dụng <strong>AI nhận diện chứng từ</strong> để tự động trích xuất thông tin khách hàng / mã số thuế từ tài liệu này không?
            </p>
          </div>

          <div class="bg-modal-foot">
            <button type="button" class="bg-btn bg-btn-slate" @click="closeCusAiImportFallback">Đóng</button>
            <div class="bg-foot-right">
              <button type="button" class="bg-btn bg-btn-primary" @click="confirmCusAiImportFallback">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>Quét thông minh bằng AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODULE 4D-4: OVERLAY TIẾN TRÌNH ĐANG QUÉT TÀI LIỆU / AI -->
      <div
        v-if="cusImportScanning.active"
        class="bg-modal-overlay pl-modal-overlay pl-cus-suite-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="[{ zIndex: 100085 }, uiTheme === 'custom' ? customGlassStyleVars : null]"
      >
        <div class="bg-modal-card is-sm cus-scanning-card" role="status" aria-live="polite">
          <div class="cus-scanning-spinner"></div>
          <h3 class="cus-scanning-title">{{ cusImportScanning.title }}</h3>
          <p class="cus-scanning-msg">{{ cusImportScanning.message }}</p>
        </div>
      </div>

      <!-- MODULE 4E: MODAL QUẢN LÝ NHÓM KHÁCH HÀNG -->
      <div
        v-if="isTagModalOpen"
        class="bg-modal-overlay pl-modal-overlay pl-cus-suite-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="[{ zIndex: 100070 }, uiTheme === 'custom' ? customGlassStyleVars : null]"
        @click.self="isTagModalOpen = false"
      >
        <div class="bg-modal-card is-sm" style="max-width: 480px;" role="dialog" aria-modal="true">
          <div class="bg-modal-head dt-only-head">
            <div class="bg-modal-title-row">
              <div class="bg-modal-icon is-teal">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </div>
              <h2 class="bg-modal-title">Quản Lý Nhóm Khách Hàng</h2>
            </div>
            <button type="button" class="bg-modal-close" @click="isTagModalOpen = false">✕</button>
          </div>

          <div class="m-grab-head-stack">
            <div class="m-grab-pill"></div>
            <div class="m-grab-bar">
              <h2 class="m-grab-title">Quản Lý Nhóm Khách Hàng</h2>
              <button type="button" class="bg-modal-close" @click="isTagModalOpen = false">✕</button>
            </div>
          </div>

          <div class="bg-modal-body">
            <div class="bg-inline-add-row">
              <input
                type="text"
                v-model="tempTagKH"
                placeholder="Nhập tên nhóm mới..."
                class="bg-input"
                style="flex: 1;"
                @keyup.enter="addNewTagFromInput"
              />
              <button type="button" class="bg-btn bg-btn-emerald" @click="addNewTagFromInput">Thêm mới</button>
            </div>

            <div style="margin-top: 14px;">
              <div class="bg-label" style="margin-bottom: 8px;">Danh sách nhóm hiện có</div>
              <div v-if="availableTags.length === 0" class="bg-empty-box">Chưa có nhóm nào.</div>
              <div v-else class="bg-tag-manage-list">
                <div v-for="tag in availableTags" :key="tag.id" class="bg-tag-manage-row">
                  <template v-if="editingTagId === tag.name">
                    <input
                      type="text"
                      v-model="editTagValue"
                      class="bg-input"
                      style="flex: 1; height: 32px;"
                      @keyup.enter="saveTagEdit(tag.name)"
                    />
                    <button type="button" class="bg-btn-xs is-emerald" @click="saveTagEdit(tag.name)">Lưu</button>
                    <button type="button" class="bg-btn-xs is-slate" @click="editingTagId = null">Huỷ</button>
                  </template>
                  <template v-else>
                    <span class="bg-tag-manage-name">{{ tag.name }}</span>
                    <div class="bg-cus-actions">
                      <button type="button" class="bg-btn-xs is-sky" @click="startEditTag(tag.name)">Sửa</button>
                      <button type="button" class="bg-btn-xs is-rose" @click="deleteTagGlobal(tag.name)">Xoá</button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 2B. PICK PHÂN LOẠI (TYPE) MODAL -->
    <Teleport to="body">
      <div
        v-if="showTypePickerModal"
        class="bg-modal-overlay pl-modal-overlay is-picker-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showTypePickerModal = false"
      >
        <div class="pl-modal-card" style="max-width: 560px;">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header">
            <div>
              <h3 class="pl-modal-title">Chọn Phân Loại Công Việc (Type)</h3>
              <p class="pl-modal-sub">Chọn phân loại có sẵn hoặc nhập phân loại mới</p>
            </div>
            <button type="button" class="pl-modal-close" @click="showTypePickerModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="pl-modal-body">
            <div class="pl-picker-search-bar">
              <input
                v-model="typePickerSearch"
                type="text"
                class="bg-input"
                placeholder="Tìm hoặc nhập mới phân loại (VD: Renewal, New, HW...)..."
                style="flex: 1;"
                @keydown.enter.prevent="canAddCustomTypeOption ? addAndSelectCustomTypeOption() : (filteredTypeOptions[0] && selectTypeOption(filteredTypeOptions[0].value))"
              />
              <button
                v-if="canAddCustomTypeOption"
                type="button"
                class="pl-btn pl-btn-primary pl-btn-sm"
                @click="addAndSelectCustomTypeOption"
              >
                + Thêm &amp; Chọn
              </button>
              <button
                v-if="typePickerSearch"
                type="button"
                class="pl-btn pl-btn-slate pl-btn-sm"
                @click="typePickerSearch = ''"
              >
                Xóa
              </button>
            </div>

            <div class="pl-picker-list">
              <div v-if="filteredTypeOptions.length === 0" class="pl-empty-inline">
                <div>Chưa có phân loại "{{ typePickerSearch.trim() }}" trong danh sách.</div>
                <div v-if="canAddCustomTypeOption" style="margin-top: 8px;">
                  <button type="button" class="pl-btn pl-btn-primary pl-btn-xs" @click="addAndSelectCustomTypeOption">
                    + Thêm mới &amp; Chọn "{{ typePickerSearch.trim() }}"
                  </button>
                </div>
              </div>

              <div
                v-for="opt in filteredTypeOptions"
                :key="'tp-opt-' + opt.value"
                class="pl-picker-row"
                :class="{ 'is-selected': formData.type === opt.value }"
                @click="selectTypeOption(opt.value)"
              >
                <div>
                  <div class="pl-picker-row-title">{{ opt.value }}</div>
                  <div v-if="opt.count > 0" class="pl-picker-row-sub pl-tabular">{{ opt.count }} công việc đang dùng</div>
                </div>
                <button
                  type="button"
                  class="pl-picker-select-btn"
                  :class="{ 'is-selected': formData.type === opt.value }"
                  @click.stop="selectTypeOption(opt.value)"
                >
                  {{ formData.type === opt.value ? 'Đang chọn' : 'Chọn' }}
                </button>
              </div>
            </div>
          </div>

          <div class="pl-modal-footer" style="justify-content: space-between;">
            <div>
              <button
                v-if="formData.type"
                type="button"
                class="pl-btn pl-btn-danger-ghost pl-btn-sm"
                @click="formData.type = ''; showTypePickerModal = false"
              >
                Bỏ phân loại
              </button>
            </div>
            <button type="button" class="pl-btn pl-btn-slate" @click="showTypePickerModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 3. PICK REPORT CONTENT MODAL -->
    <Teleport to="body">
      <div
        v-if="showReportContentModal"
        class="bg-modal-overlay pl-modal-overlay is-picker-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showReportContentModal = false"
      >
        <div class="pl-modal-card pl-modal-rep-picker">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header">
            <h3 class="pl-modal-title">Chọn Nội Dung PO Từ Report</h3>
            <button type="button" class="pl-modal-close" @click="showReportContentModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="pl-modal-body">
            <div class="pl-rep-picker-toolbar">
              <div class="bg-search-shell">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  v-model="reportContentSearchStr"
                  type="text"
                  class="bg-search-inp"
                  placeholder="Tìm nội dung, ghi chú hoặc tên file đính kèm..."
                />
                <button v-if="reportContentSearchStr" type="button" class="bg-search-clr" @click="reportContentSearchStr = ''" aria-label="Xóa tìm kiếm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div class="pl-rep-date-filter-bar">
                <span class="pl-rep-date-lbl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>Lọc ngày:</span>
                </span>
                <select v-model="reportFilterDay" class="pl-rep-date-select pl-tabular" aria-label="Lọc theo ngày">
                  <option value="">Tất cả ngày</option>
                  <option v-for="d in REPORT_DAY_OPTIONS" :key="'rcd-' + d" :value="d">Ngày {{ d }}</option>
                </select>
                <select v-model="reportFilterMonth" class="pl-rep-date-select pl-tabular" aria-label="Lọc theo tháng">
                  <option value="">Tất cả tháng</option>
                  <option v-for="m in REPORT_MONTH_OPTIONS" :key="'rcm-' + m" :value="m">Tháng {{ m }}</option>
                </select>
                <select v-model="reportFilterYear" class="pl-rep-date-select pl-tabular" aria-label="Lọc theo năm">
                  <option value="">Tất cả năm</option>
                  <option v-for="y in reportAvailableYears" :key="'rcy-' + y" :value="y">Năm {{ y }}</option>
                </select>
                <input
                  type="date"
                  :value="reportExactDateValue"
                  class="pl-rep-date-quick pl-tabular"
                  title="Chọn nhanh ngày/tháng/năm từ lịch"
                  @input="onPickReportExactDate($event.target.value)"
                />
                <button
                  v-if="hasActiveReportDateFilter"
                  type="button"
                  class="pl-rep-date-reset"
                  @click="resetReportDateFilter"
                >
                  Đặt lại
                </button>
              </div>
            </div>

            <div class="pl-picker-list">
              <div v-if="paginatedReportContents.length === 0" class="pl-empty-inline">
                Không tìm thấy Report phù hợp.
              </div>
              <div
                v-for="rep in paginatedReportContents"
                :key="rep.id"
                class="pl-picker-row pl-rep-picker-card"
                @click="selectReportContent(rep)"
              >
                <div class="pl-rep-picker-main">
                  <div class="pl-rep-picker-top">
                    <div class="pl-picker-row-title">{{ rep.noi_dung || 'Chưa có nội dung công việc' }}</div>
                    <button type="button" class="pl-picker-select-btn" @click.stop="selectReportContent(rep)">Chọn</button>
                  </div>
                  <div v-if="rep.ghi_chu" class="pl-rep-picker-note">
                    <span class="pl-linked-rep-note-lbl">Ghi chú:</span> {{ rep.ghi_chu }}
                  </div>
                  <div v-if="rep.thoi_gian" class="pl-picker-row-sub pl-tabular">{{ formatReportTime(rep.thoi_gian) }}</div>
                </div>
              </div>
              <button v-if="hasMoreReports" type="button" class="pl-btn pl-btn-slate pl-btn-sm" style="margin-top: 6px;" @click="loadMoreReports">
                Tải thêm Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 4. MULTI-SELECT LINK REPORT MODAL -->
    <Teleport to="body">
      <div
        v-if="showReportDropdown"
        class="bg-modal-overlay pl-modal-overlay is-picker-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showReportDropdown = false"
      >
        <div class="pl-modal-card pl-modal-rep-picker">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header">
            <div>
              <h3 class="pl-modal-title pl-tabular">Chọn Report Liên Kết ({{ selectedReportIds.length }})</h3>
              <p class="pl-modal-sub">1 công việc Pipeline gắn được nhiều Report • Mỗi Report thuộc tối đa 1 công việc Pipeline</p>
            </div>
            <button type="button" class="pl-modal-close" @click="showReportDropdown = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="pl-modal-body">
            <!-- BỘ LỌC TỪ KHÓA + NGÀY / THÁNG / NĂM -->
            <div class="pl-rep-picker-toolbar">
              <div class="bg-search-shell">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  v-model="reportContentSearchStr"
                  type="text"
                  class="bg-search-inp"
                  placeholder="Tìm nội dung, ghi chú hoặc tên file đính kèm..."
                />
                <button v-if="reportContentSearchStr" type="button" class="bg-search-clr" @click="reportContentSearchStr = ''" aria-label="Xóa tìm kiếm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div class="pl-rep-date-filter-bar">
                <span class="pl-rep-date-lbl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>Lọc ngày:</span>
                </span>
                <select v-model="reportFilterDay" class="pl-rep-date-select pl-tabular" aria-label="Lọc theo ngày">
                  <option value="">Tất cả ngày</option>
                  <option v-for="d in REPORT_DAY_OPTIONS" :key="'rpd-' + d" :value="d">Ngày {{ d }}</option>
                </select>
                <select v-model="reportFilterMonth" class="pl-rep-date-select pl-tabular" aria-label="Lọc theo tháng">
                  <option value="">Tất cả tháng</option>
                  <option v-for="m in REPORT_MONTH_OPTIONS" :key="'rpm-' + m" :value="m">Tháng {{ m }}</option>
                </select>
                <select v-model="reportFilterYear" class="pl-rep-date-select pl-tabular" aria-label="Lọc theo năm">
                  <option value="">Tất cả năm</option>
                  <option v-for="y in reportAvailableYears" :key="'rpy-' + y" :value="y">Năm {{ y }}</option>
                </select>
                <input
                  type="date"
                  :value="reportExactDateValue"
                  class="pl-rep-date-quick pl-tabular"
                  title="Chọn nhanh ngày/tháng/năm từ lịch"
                  @input="onPickReportExactDate($event.target.value)"
                />
                <button
                  v-if="hasActiveReportDateFilter"
                  type="button"
                  class="pl-rep-date-reset"
                  @click="resetReportDateFilter"
                >
                  Đặt lại
                </button>
              </div>
            </div>

            <div class="pl-picker-list pl-rep-picker-list">
              <div v-if="paginatedReportContents.length === 0" class="pl-empty-inline">
                Không tìm thấy Report phù hợp với bộ lọc hiện tại.
              </div>
              <div
                v-for="rep in paginatedReportContents"
                :key="'lk-' + rep.id"
                class="pl-picker-row pl-rep-picker-card"
                :class="{ 'is-selected': selectedReportIds.includes(rep.id) }"
                @click="selectReport(rep.id)"
              >
                <div class="pl-rep-picker-main">
                  <div class="pl-rep-picker-top">
                    <div class="pl-picker-row-title">{{ rep.noi_dung || 'Chưa có nội dung công việc' }}</div>
                    <div class="pl-rep-picker-actions">
                      <button
                        type="button"
                        class="pl-linked-rep-eye"
                        title="Xem Report trên trang Report Firebase (Mở tab mới)"
                        aria-label="Xem trên Report Firebase"
                        @click.stop="openReportInNewTab(rep.id)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button
                        type="button"
                        class="pl-picker-select-btn"
                        :class="{ 'is-selected': selectedReportIds.includes(rep.id) }"
                        @click.stop="selectReport(rep.id)"
                      >
                        {{ selectedReportIds.includes(rep.id) ? 'Đã chọn' : getReportOtherOwnerLabel(rep) ? 'Chuyển sang' : 'Chọn' }}
                      </button>
                    </div>
                  </div>

                  <div v-if="rep.ghi_chu" class="pl-rep-picker-note">
                    <span class="pl-linked-rep-note-lbl">Ghi chú:</span> {{ rep.ghi_chu }}
                  </div>

                  <div v-if="rep.thoi_gian || getReportOtherOwnerLabel(rep)" class="pl-picker-row-sub pl-tabular">
                    <span v-if="rep.thoi_gian">{{ formatReportTime(rep.thoi_gian) }}</span>
                    <span v-if="getReportOtherOwnerLabel(rep)" style="opacity: 0.9;">
                      {{ rep.thoi_gian ? '• ' : '' }}Đang thuộc: {{ getReportOtherOwnerLabel(rep) }}
                    </span>
                  </div>

                  <div
                    v-if="getUnifiedReportAttachments(rep).length > 0"
                    class="pl-rep-file-list"
                    @click.stop
                  >
                    <div
                      v-for="(att, atti) in getUnifiedReportAttachments(rep)"
                      :key="'pkatt-' + rep.id + '-' + atti"
                      class="pl-rep-file-pill"
                    >
                      <span class="pl-rep-file-ic" v-html="getReportAttIconSvg(att)"></span>
                      <span class="pl-rep-file-badge" :class="att.badgeCls">{{ att.badgeLabel }}</span>
                      <span class="pl-rep-file-name" :title="att.name">{{ att.name }}</span>
                      <button
                        type="button"
                        class="pl-rep-file-act is-view"
                        :title="att.kind === 'image' ? 'Xem ảnh' : 'Xem file qua ViewOffice / Trình xem'"
                        @click.stop.prevent="openReportAttachmentView(att)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <a
                        :href="getDownloadUrl(att.url)"
                        class="pl-rep-file-act is-dl"
                        title="Tải xuống"
                        @click.stop="handleDownloadClick($event, att.url, att.name)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <button v-if="hasMoreReports" type="button" class="pl-btn pl-btn-slate pl-btn-sm" @click="loadMoreReports">
                Tải thêm ({{ filteredReportContents.length - paginatedReportContents.length }} còn lại)
              </button>
            </div>
          </div>
          <div class="pl-modal-footer">
            <button type="button" class="pl-btn pl-btn-primary pl-tabular" @click="showReportDropdown = false">Xong ({{ selectedReportIds.length }})</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 6. SCAN VOLUME CONFIRM MODAL -->
    <Teleport to="body">
      <div
        v-if="showScanConfirmModal"
        class="bg-modal-overlay pl-modal-overlay is-picker-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="handleScanConfirm(false)"
      >
        <div class="pl-modal-card pl-modal-lg">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header">
            <h3 class="pl-modal-title">{{ scanConfirmTitle }}</h3>
            <button type="button" class="pl-modal-close" @click="handleScanConfirm(false)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="pl-modal-body">
            <div class="scan-confirm-body">
              <div v-if="scanConfirmPreviewUrl || scanConfirmIsExcel" class="scan-confirm-preview">
                <div class="scan-confirm-file-head">
                  <span class="pl-rep-file-ic" v-html="getFileIconSvg(scanConfirmFileName, '')"></span>
                  <span class="scan-confirm-file-name" :title="scanConfirmFileName">{{ scanConfirmFileName }}</span>
                </div>
                <img v-if="scanConfirmPreviewUrl" :src="scanConfirmPreviewUrl" alt="PDF Preview" style="max-width: 100%; border-radius: 6px;" />
                <div v-else-if="scanConfirmIsExcel" v-html="scanConfirmExcelHtml" style="width: 100%; overflow-x: auto;"></div>
              </div>
              <div class="scan-confirm-controls">
                <p v-if="scanConfirmMessage" class="scan-confirm-msg">{{ scanConfirmMessage }}</p>
                <div v-if="scanConfirmHasEditableAmount" class="pl-field">
                  <label class="bg-label">{{ scanConfirmAmountLabel }}</label>
                  <div class="pl-volume-input-wrap">
                    <NumberInput v-model="scanConfirmEditableAmount" :decimals="0" class="bg-input pl-tabular is-volume-hero" />
                    <span class="pl-volume-unit" aria-hidden="true">₫</span>
                  </div>
                </div>
                <label
                  v-if="scanConfirmCanAttachFile"
                  class="scan-confirm-attach-opt"
                  :class="{ 'is-checked': scanConfirmAttachFile }"
                >
                  <input v-model="scanConfirmAttachFile" type="checkbox" class="scan-confirm-attach-chk" />
                  <span class="scan-confirm-attach-copy">
                    <span class="scan-confirm-attach-title">Đính kèm luôn vào Tệp Đính Kèm Trực Tiếp</span>
                    <span class="scan-confirm-attach-sub">
                      {{
                        isScanFileDuplicate
                          ? 'Tệp cùng tên đã có sẵn — sẽ tự động cập nhật bản mới, không nhân đôi dòng.'
                          : 'Tự động tải tệp này vào công việc để không phải chọn lại lần 2 (bỏ tích nếu là file nháp nội bộ).'
                      }}
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div class="pl-modal-footer">
            <button v-if="scanConfirmIsQuestion" type="button" class="pl-btn pl-btn-slate" @click="handleScanConfirm(false)">Hủy</button>
            <button type="button" class="pl-btn pl-btn-primary" @click="handleScanConfirm(true)">
              {{ scanConfirmPrimaryLabel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 7. EXPORT EXCEL MODAL -->
    <Teleport to="body">
      <div
        v-if="showExportModal"
        class="bg-modal-overlay pl-modal-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showExportModal = false"
      >
        <div class="pl-modal-card pl-modal-lg">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header">
            <h3 class="pl-modal-title">Xuất Danh Sách Công Việc Pipeline Ra Excel ({{ exportPreviewList.length }} dòng)</h3>
            <button type="button" class="pl-modal-close" @click="showExportModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="pl-modal-body">
            <div class="modal-group">
              <div class="modal-banner-header is-emerald">
                <span class="modal-banner-title">ĐIỀU KIỆN LỌC FILE EXCEL</span>
              </div>
              <div class="modal-group-body pl-form-grid-2">
                <div class="pl-field">
                  <label class="bg-label">Lọc theo Khung Pipeline</label>
                  <select v-model="exportFilters.id_workflow" class="bg-input">
                    <option value="">Tất cả Khung Pipeline</option>
                    <option value="WF_DEFAULT">Khung Chuẩn Hệ Thống</option>
                    <option v-for="wf in uniqueWorkflows" :key="'ex-' + wf.id_workflow" :value="wf.id_workflow">
                      {{ wf.name_workflow }}
                    </option>
                  </select>
                </div>
                <div class="pl-field">
                  <label class="bg-label">Lọc theo Dự án (Gốc)</label>
                  <select v-model="exportFilters.id_project" class="bg-input">
                    <option value="">Tất cả Dự án &amp; Công việc lẻ</option>
                    <option v-for="pr in projectsList" :key="'expr-' + pr.id_project" :value="pr.id_project">
                      {{ pr.ten_du_an }}
                    </option>
                  </select>
                </div>
                <div class="pl-field">
                  <label class="bg-label">Từ ngày (Finish Time)</label>
                  <input type="date" v-model="exportFilters.dateFrom" class="bg-input pl-tabular" />
                </div>
                <div class="pl-field">
                  <label class="bg-label">Đến ngày (Finish Time)</label>
                  <input type="date" v-model="exportFilters.dateTo" class="bg-input pl-tabular" />
                </div>
              </div>
            </div>

            <div class="pl-picker-list" style="max-height: 280px;">
              <div v-for="exItem in exportPreviewList" :key="exItem.Id_pipeline" class="pl-picker-row">
                <div>
                  <div class="pl-picker-row-title">{{ exItem.ten_cong_ty || exItem.ten_khach_hang }} — {{ exItem.content_of_contract_po }}</div>
                  <div class="pl-picker-row-sub pl-tabular">
                    AM: {{ exItem.AM }} • {{ getFormattedStatus(exItem) }} • Volume: {{ formatNumber(exItem.volume) || '0' }}
                  </div>
                </div>
                <button type="button" class="pl-btn pl-btn-danger-ghost pl-btn-xs" @click="removeExportCard(exItem.Id_pipeline)">Bỏ khỏi file</button>
              </div>
            </div>
          </div>
          <div class="pl-modal-footer">
            <button type="button" class="pl-btn pl-btn-slate" @click="showExportModal = false">Hủy</button>
            <button type="button" class="pl-btn pl-btn-primary" :disabled="exportPreviewList.length === 0" @click="confirmExportExcel">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Xuất File Excel ({{ exportPreviewList.length }})</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 7B. PIPELINE FILES VAULT MODAL (EXPANDED 2-SOURCE VIEW) -->
    <Teleport to="body">
      <div
        v-if="showPipelineFilesVaultModal"
        class="bg-modal-overlay pl-modal-overlay"
        :class="{ 'theme-light-blue': uiTheme === 'light', 'theme-custom-glass': uiTheme === 'custom' }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="showPipelineFilesVaultModal = false"
      >
        <div class="pl-modal-card pl-modal-xl pl-vault-modal-card">
          <div class="pl-modal-grab" aria-hidden="true"></div>
          <div class="pl-modal-header pl-vault-modal-head">
            <div class="pl-vault-head-left">
              <span class="pl-vault-head-ic">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </span>
              <div class="pl-vault-head-meta">
                <h3 class="pl-modal-title">Kho Tệp Đính Kèm Trong Pipeline</h3>
                <div class="pl-vault-head-sub pl-tabular">
                  <span>Khung: <strong>{{ activeKanbanWorkflowFilterLabel }}</strong></span>
                  <span>•</span>
                  <span>{{ displayedKanbanItems.length }} công việc đang hiển thị</span>
                  <span>•</span>
                  <span>Tổng <strong>{{ activeKanbanFilesVault.totalCount }}</strong> tệp</span>
                </div>
              </div>
            </div>
            <button type="button" class="pl-modal-close" title="Đóng (Esc)" @click="showPipelineFilesVaultModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="pl-modal-body pl-vault-modal-body">
            <!-- FILTER & SEARCH TOOLBAR -->
            <div class="pl-vault-modal-toolbar">
              <div class="bg-search-shell is-slim-inline pl-vault-search">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="bg-search-ic"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  v-model="vaultFileSearchQuery"
                  type="text"
                  class="bg-search-inp"
                  placeholder="Tìm tên file, công việc, khách hàng, nội dung report..."
                />
                <button v-if="vaultFileSearchQuery" type="button" class="bg-search-clr" @click="vaultFileSearchQuery = ''">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div class="bg-seg-switch is-compact is-slim-seg pl-vault-filter-chips">
                <button
                  type="button"
                  class="bg-seg-btn pl-tabular"
                  :class="{ 'is-active': vaultFileCategoryFilter === 'all' }"
                  @click="vaultFileCategoryFilter = 'all'"
                >
                  Tất cả ({{ activeKanbanFilesVault.totalCount }})
                </button>
                <button
                  type="button"
                  class="bg-seg-btn pl-tabular"
                  :class="{ 'is-active': vaultFileCategoryFilter === 'report' }"
                  @click="vaultFileCategoryFilter = 'report'"
                >
                  Từ Report ({{ activeKanbanFilesVault.reportFiles.length }})
                </button>
                <button
                  type="button"
                  class="bg-seg-btn pl-tabular"
                  :class="{ 'is-active': vaultFileCategoryFilter === 'direct' }"
                  @click="vaultFileCategoryFilter = 'direct'"
                >
                  Upload trực tiếp ({{ activeKanbanFilesVault.directFiles.length }})
                </button>
                <button
                  type="button"
                  class="bg-seg-btn"
                  :class="{ 'is-active': vaultFileCategoryFilter === 'bao_gia' }"
                  @click="vaultFileCategoryFilter = 'bao_gia'"
                >
                  Báo giá
                </button>
                <button
                  type="button"
                  class="bg-seg-btn"
                  :class="{ 'is-active': vaultFileCategoryFilter === 'mua_hang' }"
                  @click="vaultFileCategoryFilter = 'mua_hang'"
                >
                  DXMH/Khác
                </button>
                <button
                  type="button"
                  class="bg-seg-btn"
                  :class="{ 'is-active': vaultFileCategoryFilter === 'image' }"
                  @click="vaultFileCategoryFilter = 'image'"
                >
                  Hình ảnh
                </button>
              </div>
            </div>

            <!-- 2-SOURCE COLUMNS -->
            <div
              class="pl-vault-modal-grid"
              :class="{ 'is-single-col': vaultFileCategoryFilter === 'report' || vaultFileCategoryFilter === 'direct' }"
            >
              <!-- COLUMN 1: FILE TỪ REPORT -->
              <div v-if="vaultFileCategoryFilter !== 'direct'" class="pl-vault-col">
                <div class="pl-vault-col-head is-report">
                  <div class="pl-vault-col-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <span>FILE TỪ REPORT LIÊN KẾT</span>
                  </div>
                  <span class="pl-pfv-cnt pl-tabular">{{ filteredVaultReportFiles.length }} tệp</span>
                </div>

                <div v-if="filteredVaultReportFiles.length === 0" class="pl-vault-col-empty">
                  Không có tệp từ Report phù hợp điều kiện lọc hiện tại.
                </div>

                <div v-else class="pl-vault-col-list">
                  <div v-for="f in filteredVaultReportFiles" :key="'vmr-' + f.key" class="pl-vault-fcard">
                    <div class="pl-vault-fcard-top">
                      <span class="pl-rep-file-ic" v-html="getReportAttIconSvg(f)"></span>
                      <span class="pl-rep-file-badge" :class="f.badgeCls">{{ f.badgeLabel }}</span>
                      <button
                        type="button"
                        class="pl-vault-fname"
                        @click="openReportAttachmentView(f)"
                      >
                        {{ f.name }}
                      </button>
                    </div>

                    <div class="pl-vault-fcard-meta">
                      <div class="pl-vault-meta-line">
                        <span class="pl-vault-meta-tag is-pipe">Công việc</span>
                        <span class="pl-vault-meta-txt">
                          {{ f.pipeTitle }}
                          <strong v-if="f.partyLabel"> · {{ f.partyLabel }}</strong>
                          <span v-if="f.extraOwnerCount > 0" class="pl-vault-extra-cnt">(+{{ f.extraOwnerCount }} việc khác)</span>
                        </span>
                      </div>
                      <div v-if="f.reportTitle" class="pl-vault-meta-line">
                        <span class="pl-vault-meta-tag is-rep">Report</span>
                        <span class="pl-vault-meta-txt">{{ f.reportTitle }}</span>
                      </div>
                    </div>

                    <div class="pl-vault-factions">
                      <button
                        type="button"
                        class="pl-rep-file-act is-btn is-view"
                        @click="openReportAttachmentView(f)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <span>{{ f.kind === 'image' ? 'Xem ảnh' : 'Xem file' }}</span>
                      </button>
                      <a
                        :href="getDownloadUrl(f.url)"
                        class="pl-rep-file-act is-btn is-dl"
                        @click="handleDownloadClick($event, f.url, f.name)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>Tải về</span>
                      </a>
                      <button
                        type="button"
                        class="pl-rep-file-act is-btn is-locate"
                        @click="locateFileOwnerCardOnBoard(f.primaryPipeId)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                        <span>Định vị CV</span>
                      </button>
                      <button
                        v-if="f.reportId"
                        type="button"
                        class="pl-rep-file-act is-btn is-rep-open"
                        @click="openReportInNewTab(f.reportId)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        <span>Mở Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- COLUMN 2: FILE UPLOAD TRỰC TIẾP -->
              <div v-if="vaultFileCategoryFilter !== 'report'" class="pl-vault-col">
                <div class="pl-vault-col-head is-direct">
                  <div class="pl-vault-col-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    <span>FILE UPLOAD TRỰC TIẾP TRONG CÔNG VIỆC</span>
                  </div>
                  <span class="pl-pfv-cnt is-sky pl-tabular">{{ filteredVaultDirectFiles.length }} tệp</span>
                </div>

                <div v-if="filteredVaultDirectFiles.length === 0" class="pl-vault-col-empty">
                  Không có tệp upload trực tiếp phù hợp điều kiện lọc hiện tại.
                </div>

                <div v-else class="pl-vault-col-list">
                  <div v-for="f in filteredVaultDirectFiles" :key="'vmd-' + f.key" class="pl-vault-fcard">
                    <div class="pl-vault-fcard-top">
                      <span class="pl-rep-file-ic" v-html="getReportAttIconSvg(f)"></span>
                      <span class="pl-rep-file-badge" :class="f.badgeCls">{{ f.badgeLabel }}</span>
                      <button
                        type="button"
                        class="pl-vault-fname"
                        @click="openReportAttachmentView(f)"
                      >
                        {{ f.name }}
                      </button>
                    </div>

                    <div class="pl-vault-fcard-meta">
                      <div class="pl-vault-meta-line">
                        <span class="pl-vault-meta-tag is-pipe">Công việc</span>
                        <span class="pl-vault-meta-txt">
                          {{ f.pipeTitle }}
                          <strong v-if="f.partyLabel"> · {{ f.partyLabel }}</strong>
                          <span v-if="f.extraOwnerCount > 0" class="pl-vault-extra-cnt">(+{{ f.extraOwnerCount }} việc khác)</span>
                        </span>
                      </div>
                    </div>

                    <div class="pl-vault-factions">
                      <button
                        type="button"
                        class="pl-rep-file-act is-btn is-view"
                        @click="openReportAttachmentView(f)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <span>{{ f.kind === 'image' ? 'Xem ảnh' : 'Xem file' }}</span>
                      </button>
                      <a
                        :href="getDownloadUrl(f.url)"
                        class="pl-rep-file-act is-btn is-dl"
                        @click="handleDownloadClick($event, f.url, f.name)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>Tải về</span>
                      </a>
                      <button
                        type="button"
                        class="pl-rep-file-act is-btn is-locate"
                        @click="locateFileOwnerCardOnBoard(f.primaryPipeId)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                        <span>Định vị CV</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pl-modal-footer pl-vault-modal-foot">
            <span class="pl-vault-foot-hint">
              Mẹo: File Excel/Word mở trực tiếp qua ViewOffice; nhấn <strong>Định vị CV</strong> để cuộn tới &amp; tô đỏ thẻ công việc trên bảng.
            </span>
            <button type="button" class="pl-btn pl-btn-slate" @click="showPipelineFilesVaultModal = false">Đóng</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 8. IMAGE LIGHTBOX -->
    <Teleport to="body">
      <div
        v-if="previewQuanLyFileImage"
        class="bg-lightbox-overlay pl-lightbox"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
        @click="previewQuanLyFileImage = null"
      >
        <img :src="previewQuanLyFileImage.url" :alt="previewQuanLyFileImage.name" class="pl-lightbox-img" @click.stop />
      </div>
    </Teleport>

    <!-- 9. 3-TIER QUEUED BAOGIA DIALOG (PROMISE CONFIRM / ALERT) -->
    <Teleport to="body">
      <div
        v-if="baogiaDialog.open"
        class="baogia-dialog-overlay pl-dialog-overlay"
        :class="{
          'theme-light-blue': uiTheme === 'light',
          'theme-custom-glass': uiTheme === 'custom'
        }"
        :style="uiTheme === 'custom' ? customGlassStyleVars : null"
        @click.self="resolveBaogiaDialog(false)"
      >
        <div class="pl-dialog-card" role="dialog" aria-modal="true">
          <div class="pl-dialog-head">
            <span class="pl-dialog-badge" :class="'tone-' + baogiaDialog.tone">
              <svg v-if="baogiaDialog.tone === 'danger'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <svg v-else-if="baogiaDialog.tone === 'success'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </span>
            <h4 class="pl-dialog-title">{{ baogiaDialog.title }}</h4>
          </div>

          <div v-if="baogiaDialog.targetValue" class="pl-dialog-target-box">
            <span class="pl-dialog-target-tag">{{ baogiaDialog.targetTag || 'ĐỐI TƯỢNG' }}</span>
            <span class="pl-dialog-target-val">{{ baogiaDialog.targetValue }}</span>
          </div>

          <div class="pl-dialog-msg-box" :class="'tone-' + baogiaDialog.tone">{{ baogiaDialog.message }}</div>

          <div class="pl-dialog-foot">
            <button
              v-if="baogiaDialog.mode === 'confirm'"
              type="button"
              class="pl-btn pl-btn-slate"
              @click="resolveBaogiaDialog(false)"
            >
              {{ baogiaDialog.cancelText }}
            </button>
            <button
              type="button"
              class="pl-btn"
              :class="baogiaDialog.tone === 'danger' ? 'pl-btn-danger' : 'pl-btn-primary'"
              @click="resolveBaogiaDialog(true)"
            >
              {{ baogiaDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 10. TOP-CENTER SMART TOAST & DRAG TOOLTIP -->
    <Teleport to="body">
      <div
        class="smart-toast-wrap"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
      >
        <Transition name="pl-toast-fade">
          <div v-if="smartToast.show" class="pl-smart-toast" :class="'is-' + smartToast.type" role="status">
            <span class="pl-toast-ic">
              <svg v-if="smartToast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              <svg v-else-if="smartToast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>{{ smartToast.message }}</span>
          </div>
        </Transition>
      </div>

      <div
        v-if="isDragging && hoverColName"
        class="pl-drag-tooltip"
        :class="{ 'theme-light-blue': uiTheme === 'light' }"
        :style="{ left: mouseX + 'px', top: mouseY + 'px' }"
      >
        Thả vào: {{ hoverColName }}
      </div>
    </Teleport>
  </div>
</template>


<script setup>
defineOptions({ name: 'PipelineFirebase' })
import { ref, computed, nextTick, onMounted, onUnmounted, onActivated, onDeactivated, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import NumberInput from './NumberInput.vue'
import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, update, remove, push, onValue } from 'firebase/database'
import PipelineWorkflowFirebase from './PipelineWorkflowFirebase.vue'
import anhMauThueUrl from '../assets/anh_mau_thue.png'
import {
  UNIVERSAL_IMPORT_ACCEPT,
  isImageDocFile,
  isPdfDocFile,
  isWordDocFile,
  parseCustomerDxmhStandardFromFile,
  parseCustomerQuoteStandardFromFile,
  parseTaxStandardFromFile,
  analyzeCustomerOrTaxFileWithAI
} from '../utils/universalDocumentReader'

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
}

const route = useRoute()
const router = useRouter()

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

const sanitizeFirebaseKey = (key) => String(key || '').replace(/[.#$/[\]]/g, '_')

const removeDiacritics = (str) => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

const genMaCT = (congTy) =>
  removeDiacritics(congTy).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')

const genMaKH = (tenKH, congTy) => {
  const tenClean = removeDiacritics(tenKH).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
  const maCT = genMaCT(congTy)
  if (!tenClean && !maCT) return ''
  return [tenClean, maCT].filter(Boolean).join('-')
}

const parseNum = (val) => {
  if (val === null || val === undefined || val === '') return 0
  const cleaned = String(val).replace(/,/g, '').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

const formatNumber = (val) => {
  if (val == null || val === '') return ''
  const raw = String(val).replace(/,/g, '')
  if (!isNaN(raw) && raw !== '') {
    return new Intl.NumberFormat('en-US').format(Number(raw))
  }
  return val
}

// =========================================================
// THEME & CUSTOM GLASSIFY (SYNCED WITH MAIN TEMPLATE)
// =========================================================
const THEME_STORAGE_KEY = 'sonai_report_fb_theme_v2'
const CUSTOM_GLASS_CFG_KEY = 'sonai_report_fb_custom_glass_cfg_v1'

const DEFAULT_CUSTOM_GLASS_CONFIG = {
  brightness: 34,
  opacity: 46,
  blur: 22,
  dim: 20,
  wallpaper: '/hon-mun-island-in-nha-trang.jpg'
}

const GLASS_PRESETS = {
  ios_frost: { brightness: 34, opacity: 46, blur: 22, dim: 20 },
  ocean_dark: { brightness: 6, opacity: 52, blur: 20, dim: 32 },
  crystal_clear: { brightness: 42, opacity: 26, blur: 12, dim: 14 }
}

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'dark' || saved === 'light' || saved === 'custom') return saved
  }
  return 'dark'
}

const loadInitialGlassConfig = () => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CUSTOM_GLASS_CFG_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          return {
            brightness: Number.isFinite(Number(parsed.brightness)) ? Number(parsed.brightness) : 34,
            opacity: Number.isFinite(Number(parsed.opacity)) ? Number(parsed.opacity) : 46,
            blur: Number.isFinite(Number(parsed.blur)) ? Number(parsed.blur) : 22,
            dim: Number.isFinite(Number(parsed.dim)) ? Number(parsed.dim) : 20,
            wallpaper: typeof parsed.wallpaper === 'string' && parsed.wallpaper.trim() ? parsed.wallpaper : '/hon-mun-island-in-nha-trang.jpg'
          }
        }
      }
    } catch (e) {}
  }
  return { ...DEFAULT_CUSTOM_GLASS_CONFIG }
}

const uiTheme = ref(getInitialTheme())
const showCustomGlassTuner = ref(false)
const customGlassConfig = ref(loadInitialGlassConfig())

watch(
  customGlassConfig,
  (val) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(CUSTOM_GLASS_CFG_KEY, JSON.stringify(val))
    } catch (e) {}
  },
  { deep: true }
)

const activeGlassPreset = computed(() => {
  const c = customGlassConfig.value
  for (const [k, p] of Object.entries(GLASS_PRESETS)) {
    if (c.brightness === p.brightness && c.opacity === p.opacity && c.blur === p.blur && c.dim === p.dim) {
      return k
    }
  }
  return ''
})

const applyGlassPreset = (key) => {
  const p = GLASS_PRESETS[key]
  if (!p) return
  customGlassConfig.value = { ...customGlassConfig.value, ...p }
}

const resetCustomGlassConfig = () => {
  customGlassConfig.value = { ...DEFAULT_CUSTOM_GLASS_CONFIG }
  showToast('Đã đặt lại cấu hình kính mờ mặc định', 'info')
}

const customGlassStyleVars = computed(() => {
  const c = customGlassConfig.value || DEFAULT_CUSTOM_GLASS_CONFIG
  const b = Math.max(0, Math.min(85, Number(c.brightness) || 0)) / 100
  const op = Math.max(12, Math.min(86, Number(c.opacity) || 46)) / 100
  const blur = Math.max(0, Math.min(36, Number(c.blur) ?? 22))
  const dim = Math.max(0, Math.min(75, Number(c.dim) ?? 20)) / 100

  const r = Math.round(8 + b * 222)
  const g = Math.round(28 + b * 214)
  const bl = Math.round(46 + b * 206)
  const r2 = Math.round(4 + b * 198)
  const g2 = Math.round(18 + b * 195)
  const bl2 = Math.round(34 + b * 190)

  const rawWp = (c.wallpaper || '/hon-mun-island-in-nha-trang.jpg').replace(/"/g, '\\"')
  return {
    '--cg-panel-top': `rgba(${r}, ${g}, ${bl}, ${Math.min(0.92, +(op + 0.04).toFixed(3))})`,
    '--cg-panel-bot': `rgba(${r2}, ${g2}, ${bl2}, ${Math.max(0.08, +(op - 0.1).toFixed(3))})`,
    '--cg-card-top': `rgba(${r}, ${g}, ${bl}, ${Math.min(0.94, +(op + 0.1).toFixed(3))})`,
    '--cg-card-bot': `rgba(${r2}, ${g2}, ${bl2}, ${Math.max(0.1, +(op - 0.03).toFixed(3))})`,
    '--cg-border': `rgba(255, 255, 255, ${+(0.22 + b * 0.45).toFixed(3)})`,
    '--cg-blur': `${blur}px`,
    '--cg-dim-top': `rgba(3, 14, 26, ${+(dim * 0.85).toFixed(3)})`,
    '--cg-dim-bot': `rgba(3, 14, 26, ${+(dim * 1.15).toFixed(3)})`,
    '--cg-wallpaper': `url("${rawWp}")`
  }
})

const syncCustomGlassVarsToDocumentRoot = () => {
  if (typeof document === 'undefined') return
  const rootStyle = document.documentElement.style
  const vars = customGlassStyleVars.value
  if (uiTheme.value === 'custom' && vars) {
    for (const [k, v] of Object.entries(vars)) rootStyle.setProperty(k, String(v))
  } else {
    for (const k of Object.keys(vars || {})) rootStyle.removeProperty(k)
  }
}

watch([uiTheme, customGlassStyleVars], syncCustomGlassVarsToDocumentRoot, { immediate: true })

const setUiTheme = (nextTheme) => {
  if (!nextTheme || uiTheme.value === nextTheme) return
  uiTheme.value = nextTheme
  if (nextTheme !== 'custom') showCustomGlassTuner.value = false
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  } catch (e) {}
}

const tunerPopoverPos = ref({ top: '54px', left: 'auto', right: '18px' })

const updateTunerAnchorFromEvent = (evt) => {
  if (typeof window === 'undefined' || !evt || !evt.currentTarget) return
  const rect = evt.currentTarget.getBoundingClientRect()
  const popoverWidth = 310
  const margin = 12
  const maxLeft = Math.max(margin, window.innerWidth - popoverWidth - margin)
  const clampedLeft = Math.min(Math.max(margin, rect.left), maxLeft)
  const preferredTop = rect.bottom + 8
  const clampedTop = Math.min(preferredTop, Math.max(54, window.innerHeight - 380))
  tunerPopoverPos.value = {
    top: `${Math.round(clampedTop)}px`,
    left: `${Math.round(clampedLeft)}px`,
    right: 'auto'
  }
}

const toggleCustomGlassTuner = (evt) => {
  if (!showCustomGlassTuner.value) updateTunerAnchorFromEvent(evt)
  showCustomGlassTuner.value = !showCustomGlassTuner.value
}

const onClickCustomThemeBtn = (evt) => {
  updateTunerAnchorFromEvent(evt)
  if (uiTheme.value === 'custom') {
    showCustomGlassTuner.value = !showCustomGlassTuner.value
  } else {
    setUiTheme('custom')
  }
}

// =========================================================
// 3-TIER QUEUED BAOGIA DIALOG & TOP-CENTER SMART TOAST
// =========================================================
const smartToast = ref({ show: false, message: '', type: 'info' })
let smartToastTimer = null
const showToast = (message, type = 'success', duration = 2600) => {
  smartToast.value = { show: true, message, type }
  if (smartToastTimer) clearTimeout(smartToastTimer)
  smartToastTimer = setTimeout(() => {
    smartToast.value.show = false
  }, duration)
}

const baogiaDialog = ref({
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
let dialogQueueResolver = null

const askConfirm = ({
  title,
  message,
  targetTag = '',
  targetValue = '',
  tone = 'info',
  confirmText = 'Đồng ý',
  cancelText = 'Hủy'
}) =>
  new Promise((resolve) => {
    dialogQueueResolver = resolve
    baogiaDialog.value = {
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

const showAlert = ({
  title,
  message,
  targetTag = '',
  targetValue = '',
  tone = 'info',
  confirmText = 'Đã hiểu'
}) =>
  new Promise((resolve) => {
    dialogQueueResolver = resolve
    baogiaDialog.value = {
      open: true,
      mode: 'alert',
      tone,
      title,
      message,
      targetTag,
      targetValue,
      confirmText,
      cancelText: ''
    }
  })

const resolveBaogiaDialog = (val) => {
  baogiaDialog.value.open = false
  if (dialogQueueResolver) {
    const r = dialogQueueResolver
    dialogQueueResolver = null
    r(Boolean(val))
  }
}

const onGlobalDialogKeydown = (e) => {
  if (!baogiaDialog.value.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    resolveBaogiaDialog(false)
  } else if (e.key === 'Enter' && baogiaDialog.value.tone !== 'danger') {
    e.preventDefault()
    resolveBaogiaDialog(true)
  }
}

// =========================================================
// SCHEMA NORMALIZATION (BACKWARD-COMPATIBLE + EXTENDED)
// =========================================================
const PIPELINE_HEADERS = [
  'Id_pipeline', 'report_id', 'ma_hop_dong', 'ma_khach_hang', 'ten_khach_hang',
  'ma_cong_ty', 'ten_cong_ty', 'AM', 'tag', '%status', 'status_name',
  'isSuccess', 'type', 'ghi_chu_hop_dong', 'created_time', 'finish_time',
  'content_of_contract_po', 'quantity', 'volume', 'ten_file', 'link_file',
  'id_pipeline_lien_ket', 'id_workflow', 'id_quanlyfile',
  'id_status_workflow', 'id_project', 'ten_du_an'
]

const normalizePipelineRecord = (raw, key) => {
  if (!raw) return null
  let item = null
  if (Array.isArray(raw)) {
    item = {}
    PIPELINE_HEADERS.forEach((h, idx) => {
      item[h] = raw[idx] ?? ''
    })
    if (!item.Id_pipeline) item.Id_pipeline = key || ''
  } else if (typeof raw === 'object') {
    if (!raw.Id_pipeline && !raw.status_name && !raw.content_of_contract_po && raw.ten_deal) {
      return null
    }
    item = {}
    PIPELINE_HEADERS.forEach((h) => {
      if (h === '%status') {
        item[h] = raw['%status'] ?? raw.percent_status ?? ''
      } else {
        item[h] = raw[h] ?? ''
      }
    })
    if (!item.Id_pipeline) item.Id_pipeline = key || ''
  }
  if (!item || !item.Id_pipeline) return null
  if (item.created_time && String(item.created_time).includes('T') && String(item.created_time).endsWith('Z')) {
    const d = new Date(item.created_time)
    if (!isNaN(d)) {
      const pad = (n) => String(n).padStart(2, '0')
      item.created_time = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
  }
  return item
}

const toCleanPipelineRecord = (item) => {
  const clean = {}
  PIPELINE_HEADERS.forEach((h) => {
    clean[h] = item[h] !== undefined && item[h] !== null ? item[h] : ''
  })
  return clean
}

const normalizeWorkflowRecord = (raw, key) => {
  if (!raw) return null
  let item = null
  if (Array.isArray(raw)) {
    const idWf = String(raw[0] ?? '')
    item = {
      id_workflow: idWf,
      id_status_workflow: String(raw[1] ?? key ?? ''),
      name_workflow: String(raw[2] ?? ''),
      '%status': String(raw[3] ?? ''),
      status_name: String(raw[4] ?? ''),
      status_index: raw[5] ?? '',
      status_color: raw[6] || '#3b82f6',
      workflow_scope: idWf.startsWith('WF_CUS_') ? 'customer' : 'template',
      ma_khach_hang: '',
      ma_cong_ty: '',
      ten_khach_hang: '',
      ten_cong_ty: '',
      is_company_default: false,
      source_template_id: '',
      source_template_name: ''
    }
  } else if (typeof raw === 'object') {
    const idWf = String(raw.id_workflow ?? '')
    const scope =
      raw.workflow_scope === 'template'
        ? 'template'
        : raw.workflow_scope === 'customer'
          ? 'customer'
          : idWf.startsWith('WF_CUS_') || raw.ma_khach_hang || raw.ma_cong_ty || raw.ten_cong_ty
            ? 'customer'
            : 'template'
    const isCus = scope === 'customer'
    item = {
      id_workflow: idWf,
      id_status_workflow: String(raw.id_status_workflow ?? key ?? ''),
      name_workflow: String(raw.name_workflow ?? ''),
      '%status': String(raw['%status'] ?? raw.percent_status ?? ''),
      status_name: String(raw.status_name ?? ''),
      status_index: raw.status_index ?? '',
      status_color: raw.status_color || '#3b82f6',
      workflow_scope: scope,
      ma_khach_hang: isCus ? String(raw.ma_khach_hang ?? '') : '',
      ma_cong_ty: isCus ? String(raw.ma_cong_ty ?? '') : '',
      ten_khach_hang: isCus ? String(raw.ten_khach_hang ?? '') : '',
      ten_cong_ty: isCus ? String(raw.ten_cong_ty ?? '') : '',
      is_company_default: isCus ? Boolean(raw.is_company_default) : false,
      source_template_id: String(raw.source_template_id ?? ''),
      source_template_name: String(raw.source_template_name ?? '')
    }
  }
  if (!item || !item.id_workflow || !item.status_name) return null
  return item
}

const normalizeLinkedWorkflowIds = (rawVal) => {
  if (!rawVal) return []
  let arr = []
  if (Array.isArray(rawVal)) {
    arr = rawVal
  } else if (typeof rawVal === 'string') {
    arr = rawVal.split(',')
  } else if (typeof rawVal === 'object') {
    arr = Object.values(rawVal)
  }
  const seen = new Set()
  const out = []
  arr.forEach((v) => {
    const clean = String(v || '').trim()
    if (clean && clean !== 'WF_DEFAULT' && !seen.has(clean)) {
      seen.add(clean)
      out.push(clean)
    }
  })
  return out
}

const normalizeProjectRecord = (raw, key) => {
  if (!raw || typeof raw !== 'object') return null
  const id_project = String(raw.id_project || key || '')
  if (!id_project) return null
  return {
    id_project,
    ma_du_an: String(raw.ma_du_an || ''),
    ten_du_an: String(raw.ten_du_an || 'Dự án chưa đặt tên'),
    ma_khach_hang: String(raw.ma_khach_hang || ''),
    ten_khach_hang: String(raw.ten_khach_hang || ''),
    ma_cong_ty: String(raw.ma_cong_ty || ''),
    ten_cong_ty: String(raw.ten_cong_ty || ''),
    default_workflow_id: String(raw.default_workflow_id || ''),
    linked_workflow_ids: normalizeLinkedWorkflowIds(raw.linked_workflow_ids),
    AM: String(raw.AM || 'Sơn'),
    ngan_sach_du_kien: raw.ngan_sach_du_kien ?? '',
    deadline: String(raw.deadline || ''),
    trang_thai: String(raw.trang_thai || 'Đang triển khai'),
    ghi_chu: String(raw.ghi_chu || ''),
    created_time: String(raw.created_time || ''),
    last_updated: String(raw.last_updated || '')
  }
}

const getPipeReportIds = (pipe) => {
  if (!pipe || !pipe.report_id) return []
  return String(pipe.report_id)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

const isCardSameAsProjectRootCustomer = (pipe, proj) => {
  if (!pipe || !proj) return true
  const pCT = genMaCT(pipe.ten_cong_ty || pipe.ma_cong_ty)
  const pKH = genMaCT(pipe.ten_khach_hang || pipe.ma_khach_hang)
  if (!pCT && !pKH) return true
  const rootCT = genMaCT(proj.ten_cong_ty || proj.ma_cong_ty)
  const rootKH = genMaCT(proj.ten_khach_hang || proj.ma_khach_hang)
  if (!rootCT && !rootKH) return true
  if (rootCT && pCT) return rootCT === pCT
  if (rootKH && pKH) return rootKH === pKH
  return (rootCT || rootKH) === (pCT || pKH)
}

// =========================================================
// CORE REACTIVE STATE
// =========================================================
const activeTab = ref('kanban') // 'kanban' | 'projects' | 'workflow'
const kanbanViewMode = ref('standard') // 'standard' | 'swimlane'
const workflowFocusCustomerKey = ref('')

const items = ref([])
const workflowsData = ref([])
const projectsList = ref([])
const customersList = ref([])
const reports = ref([])
const quanLyFiles = ref([])

const loading = ref(false)
const saving = ref(false)
const uploadingFiles = ref(false)
const backgroundSyncing = ref(false)
const loadingCustomers = ref(false)

const selectedWorkflowId = ref('WF_DEFAULT')
const searchQuery = ref('')
const openKanbanFilterMenu = ref('')
const kanbanFilterSearch = ref({
  customer: '',
  company: '',
  project: '',
  workflow: ''
})

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
  companyName: '',
  projectId: '',
  workflowId: ''
})

// =========================================================
// WORKFLOW DEFINITIONS & CUSTOMER FLOW RESOLUTION
// =========================================================
const defaultColumns = [
  { id: 'nhap', label: 'TẠM', shortLabel: 'TẠM', value: 'TẠM', percent: '0%', color: '#3b82f6' },
  { id: 'col_30', label: '30%: Pipeline', shortLabel: 'Pipeline', value: 'Pipeline (khảo sát nhu cầu khách hàng)', percent: '30%', color: '#ef4444' },
  { id: 'col_50', label: '50%: Forecast', shortLabel: 'Forecast', value: 'Forecast (đã lên báo giá gởi khách hàng)', percent: '50%', color: '#f97316' },
  { id: 'col_70', label: '70%: Commit', shortLabel: 'Commit', value: 'Commit (EU đồng ý giải pháp, chờ ngân sách đầu tư)', percent: '70%', color: '#eab308' },
  { id: 'col_90', label: '90%: Closed Won', shortLabel: 'Closed Won', value: 'Closed Won (đã ký xác nhận đặt hàng)', percent: '90%', color: '#22c55e' },
  { id: 'hoan_thanh', label: 'THÀNH CÔNG', shortLabel: 'THÀNH CÔNG', value: 'THÀNH CÔNG', percent: '100%', color: '#10b981' },
  { id: 'that_bai', label: 'THẤT BẠI', shortLabel: 'THẤT BẠI', value: 'THẤT BẠI', percent: '0%', color: '#ef4444' }
]

const uniqueWorkflows = computed(() => {
  const map = new Map()
  workflowsData.value.forEach((wf) => {
    if (wf.id_workflow && !map.has(wf.id_workflow)) {
      const scope =
        wf.workflow_scope === 'template'
          ? 'template'
          : wf.workflow_scope === 'customer'
            ? 'customer'
            : wf.id_workflow.startsWith('WF_CUS_') || wf.ma_cong_ty || wf.ten_cong_ty || wf.ma_khach_hang
              ? 'customer'
              : 'template'
      const isCus = scope === 'customer'
      map.set(wf.id_workflow, {
        id_workflow: wf.id_workflow,
        name_workflow: wf.name_workflow,
        workflow_scope: scope,
        ma_khach_hang: isCus ? wf.ma_khach_hang || '' : '',
        ma_cong_ty: isCus ? wf.ma_cong_ty || '' : '',
        ten_khach_hang: isCus ? wf.ten_khach_hang || '' : '',
        ten_cong_ty: isCus ? wf.ten_cong_ty || '' : '',
        is_company_default: isCus ? Boolean(wf.is_company_default) : false,
        source_template_id: wf.source_template_id || '',
        source_template_name: wf.source_template_name || ''
      })
    } else if (wf.id_workflow && map.has(wf.id_workflow)) {
      const ex = map.get(wf.id_workflow)
      if (ex.workflow_scope === 'customer') {
        if (!ex.ma_khach_hang && wf.ma_khach_hang) ex.ma_khach_hang = wf.ma_khach_hang
        if (!ex.ma_cong_ty && wf.ma_cong_ty) ex.ma_cong_ty = wf.ma_cong_ty
        if (!ex.ten_cong_ty && wf.ten_cong_ty) ex.ten_cong_ty = wf.ten_cong_ty
        if (!ex.ten_khach_hang && wf.ten_khach_hang) ex.ten_khach_hang = wf.ten_khach_hang
        if (wf.is_company_default) ex.is_company_default = true
      }
      if (!ex.source_template_id && wf.source_template_id) ex.source_template_id = wf.source_template_id
      if (!ex.source_template_name && wf.source_template_name) ex.source_template_name = wf.source_template_name
    }
  })
  return Array.from(map.values())
})

const customerWorkflowOptions = computed(() =>
  uniqueWorkflows.value.filter((w) => w.workflow_scope === 'customer')
)

const templateWorkflowOptions = computed(() =>
  uniqueWorkflows.value.filter((w) => w.workflow_scope !== 'customer')
)

const getColumnsForWorkflow = (wfId) => {
  const normWf = !wfId || wfId === 'WF_DEFAULT' ? 'WF_DEFAULT' : wfId
  if (normWf === 'WF_DEFAULT') return defaultColumns
  const wfCols = workflowsData.value
    .filter((wf) => wf.id_workflow === normWf)
    .sort((a, b) => (parseInt(a.status_index, 10) || 0) - (parseInt(b.status_index, 10) || 0))
    .map((wf) => ({
      id: `wf_${wf.id_status_workflow}`,
      rawStatusId: wf.id_status_workflow,
      label: wf.status_name,
      shortLabel: wf.status_name.length > 22 ? wf.status_name.substring(0, 22) + '...' : wf.status_name,
      value: wf.status_name,
      percent: wf['%status'] || '0%',
      color: wf.status_color || '#3b82f6'
    }))
  if (wfCols.length > 0) {
    return [
      ...wfCols,
      { id: 'hoan_thanh', label: 'THÀNH CÔNG', shortLabel: 'THÀNH CÔNG', value: 'THÀNH CÔNG', percent: '100%', color: '#10b981' },
      { id: 'that_bai', label: 'THẤT BẠI', shortLabel: 'THẤT BẠI', value: 'THẤT BẠI', percent: '0%', color: '#ef4444' }
    ]
  }
  return defaultColumns
}

const COLUMNS = computed(() => getColumnsForWorkflow(selectedWorkflowId.value))
const MODAL_COLUMNS = computed(() => getColumnsForWorkflow(formData.value.id_workflow || 'WF_DEFAULT'))

const getWorkflowShortLabel = (wfId) => {
  if (!wfId || wfId === 'WF_DEFAULT') return 'Khung Chuẩn'
  const found = uniqueWorkflows.value.find((w) => w.id_workflow === wfId)
  return found ? found.name_workflow : 'Khung Riêng'
}

const activeWorkflowMeta = computed(() => {
  if (!selectedWorkflowId.value || selectedWorkflowId.value === 'WF_DEFAULT') {
    return { id: 'WF_DEFAULT', label: 'Khung Chuẩn Hệ Thống (5 bước)' }
  }
  const found = uniqueWorkflows.value.find((w) => w.id_workflow === selectedWorkflowId.value)
  return {
    id: selectedWorkflowId.value,
    label: found ? found.name_workflow : selectedWorkflowId.value
  }
})

const resolveCompanyWorkflows = ({
  ma_khach_hang = '',
  ma_cong_ty = '',
  ten_cong_ty = '',
  ten_khach_hang = ''
} = {}) => {
  const cleanMaKH = genMaCT(ma_khach_hang)
  const cleanCT = genMaCT(ten_cong_ty || ma_cong_ty)
  const cleanKH = genMaCT(ten_khach_hang)

  const matched = []
  customerWorkflowOptions.value.forEach((wf) => {
    const wfCT = genMaCT(wf.ten_cong_ty || wf.ma_cong_ty)
    const wfMaKH = genMaCT(wf.ma_khach_hang)
    const wfKH = genMaCT(wf.ten_khach_hang)

    let isMatch = false
    if (cleanCT && wfCT && cleanCT === wfCT) {
      isMatch = true
    } else if (!cleanCT && cleanMaKH && wfMaKH && cleanMaKH === wfMaKH) {
      isMatch = true
    } else if (!cleanCT && cleanKH && !wfCT && wfKH && cleanKH === wfKH) {
      isMatch = true
    } else if (cleanMaKH && wfMaKH && cleanMaKH === wfMaKH) {
      isMatch = true
    }

    if (isMatch) {
      matched.push(wf)
    }
  })

  matched.sort((a, b) => {
    if (Boolean(a.is_company_default) !== Boolean(b.is_company_default)) {
      return a.is_company_default ? -1 : 1
    }
    return (a.name_workflow || '').localeCompare(b.name_workflow || '', 'vi')
  })

  const primary =
    matched.find((w) => Boolean(w.is_company_default)) ||
    matched[0] ||
    { id_workflow: 'WF_DEFAULT', name_workflow: 'Flow Chuẩn Hệ Thống', isCustom: false }

  return {
    list: matched,
    hasCustom: matched.length > 0,
    count: matched.length,
    primary: matched.length > 0 ? { ...primary, isCustom: true } : primary
  }
}

const resolveCustomerWorkflow = (params = {}) => {
  const res = resolveCompanyWorkflows(params)
  return {
    id_workflow: res.primary.id_workflow,
    name_workflow: res.primary.name_workflow,
    isCustom: res.hasCustom,
    count: res.count,
    list: res.list
  }
}

// =========================================================
// SHARED CUSTOMER RESOLUTION & 4-FILTER CASCADING ENGINE (TAB 1: KANBAN)
// =========================================================
const normFilterKey = (val) =>
  removeDiacritics(String(val || '').trim())
    .toLowerCase()
    .replace(/\s+/g, ' ')

const resolveCompleteCustomerPair = ({
  ma_khach_hang = '',
  ma_cong_ty = '',
  ten_cong_ty = '',
  ten_khach_hang = ''
} = {}) => {
  let company = String(ten_cong_ty || '').trim()
  let customer = String(ten_khach_hang || '').trim()
  if (company && customer) {
    return { ten_cong_ty: company, ten_khach_hang: customer }
  }

  const cleanMaKH = genMaCT(ma_khach_hang)
  const cleanCT = genMaCT(company || ma_cong_ty)
  const cleanKH = genMaCT(customer)

  const matchedCus = customersList.value.find((c) => {
    const cMaKH = genMaCT(c.Ma_khach_hang)
    const cCT = genMaCT(c.Ten_cong_ty || c.Ma_cong_ty)
    const cKH = genMaCT(c.Ten_khach_hang)
    if (cleanMaKH && cMaKH && cleanMaKH === cMaKH) return true
    if (cleanCT && cCT && cleanCT === cCT) return true
    if (!cleanCT && cleanKH && cKH && cleanKH === cKH) return true
    return false
  })

  if (matchedCus) {
    if (!company && matchedCus.Ten_cong_ty) company = String(matchedCus.Ten_cong_ty).trim()
    if (!customer && matchedCus.Ten_khach_hang) customer = String(matchedCus.Ten_khach_hang).trim()
  }

  return { ten_cong_ty: company, ten_khach_hang: customer }
}

const formatDistinctCustomerPair = (ten_cong_ty = '', ten_khach_hang = '') => {
  const company = String(ten_cong_ty || '').trim()
  const customer = String(ten_khach_hang || '').trim()
  if (company && customer && company.toLowerCase() === customer.toLowerCase()) {
    return { displayCompanyName: company, displayCustomerName: '' }
  }
  return { displayCompanyName: company, displayCustomerName: customer }
}

const getContactsByCompanyNormKey = computed(() => {
  const map = new Map()
  customersList.value.forEach((c) => {
    const comp = String(c.Ten_cong_ty || '').trim()
    const cus = String(c.Ten_khach_hang || '').trim()
    const compK = normFilterKey(comp)
    const cusK = normFilterKey(cus)
    if (!compK || !cusK) return
    if (!map.has(compK)) map.set(compK, new Map())
    if (!map.get(compK).has(cusK)) map.get(compK).set(cusK, cus)
  })
  return map
})

const getItemPartyInfo = (item) => {
  const proj = item?.id_project ? projectsList.value.find((p) => p.id_project === item.id_project) : null
  const directComp = String(item?.ten_cong_ty || '').trim()
  const directCus = String(item?.ten_khach_hang || '').trim()
  const fallbackComp = !directComp && !directCus && proj ? String(proj.ten_cong_ty || '').trim() : ''
  const fallbackCus = !directComp && !directCus && proj ? String(proj.ten_khach_hang || '').trim() : ''

  const pair = resolveCompleteCustomerPair({
    ma_khach_hang: item?.ma_khach_hang || (!directComp && !directCus && proj ? proj.ma_khach_hang : '') || '',
    ma_cong_ty: item?.ma_cong_ty || (!directComp && !directCus && proj ? proj.ma_cong_ty : '') || '',
    ten_cong_ty: directComp || fallbackComp,
    ten_khach_hang: directCus || fallbackCus
  })

  const companyLabel = directComp || pair.ten_cong_ty || ''
  const customerLabel = directCus || pair.ten_khach_hang || ''
  const companyKey = normFilterKey(companyLabel)
  const customerKey = normFilterKey(customerLabel)

  const customerMap = new Map()
  if (customerKey) customerMap.set(customerKey, customerLabel)
  if (!directCus && companyKey && getContactsByCompanyNormKey.value.has(companyKey)) {
    getContactsByCompanyNormKey.value.get(companyKey).forEach((lbl, k) => {
      if (!customerMap.has(k)) customerMap.set(k, lbl)
    })
  }

  return {
    companyLabel,
    customerLabel,
    companyKey,
    customerKey,
    customerMap
  }
}

const toggleKanbanFilterMenu = (menuKey) => {
  openKanbanFilterMenu.value = openKanbanFilterMenu.value === menuKey ? '' : menuKey
}

const kanbanEntityRelations = computed(() => {
  const rels = []

  // 1. Live Pipeline Work Items
  items.value.forEach((it) => {
    const info = getItemPartyInfo(it)
    const companyMap = new Map()
    if (info.companyKey) companyMap.set(info.companyKey, info.companyLabel)
    rels.push({
      isWorkItem: true,
      customerMap: info.customerMap,
      companyMap,
      projectId: it.id_project || '__STANDALONE__',
      workflowIds: new Set([it.id_workflow || 'WF_DEFAULT'])
    })
  })

  // 2. Projects & Linked Workflows
  allEnrichedProjects.value.forEach((p) => {
    const customerMap = new Map()
    const companyMap = new Map()
    const rootPair = resolveCompleteCustomerPair(p)
    const rComp = String(p.ten_cong_ty || rootPair.ten_cong_ty || '').trim()
    const rCus = String(p.ten_khach_hang || rootPair.ten_khach_hang || '').trim()
    const rCompK = normFilterKey(rComp)
    const rCusK = normFilterKey(rCus)
    if (rCompK) companyMap.set(rCompK, rComp)
    if (rCusK) customerMap.set(rCusK, rCus)
    if (rCompK && getContactsByCompanyNormKey.value.has(rCompK)) {
      getContactsByCompanyNormKey.value.get(rCompK).forEach((lbl, k) => {
        if (!customerMap.has(k)) customerMap.set(k, lbl)
      })
    }

    const wfIds = new Set()
    ;(p.correspondingWorkflows || []).forEach((w) => {
      if (w.id_workflow) wfIds.add(w.id_workflow)
      if (w.scopeType === 'company_custom' || w.scopeType === 'partner_custom') {
        const wComp = String(w.ten_cong_ty || '').trim()
        const wCus = String(w.ten_khach_hang || '').trim()
        if (normFilterKey(wComp)) companyMap.set(normFilterKey(wComp), wComp)
        if (normFilterKey(wCus)) customerMap.set(normFilterKey(wCus), wCus)
      }
    })
    if (wfIds.size === 0) wfIds.add('WF_DEFAULT')

    rels.push({
      isWorkItem: false,
      customerMap,
      companyMap,
      projectId: p.id_project,
      workflowIds: wfIds
    })
  })

  // 3. Customers Directory
  customersList.value.forEach((c) => {
    const comp = String(c.Ten_cong_ty || '').trim()
    const cus = String(c.Ten_khach_hang || '').trim()
    const compK = normFilterKey(comp)
    const cusK = normFilterKey(cus)
    if (!compK && !cusK) return
    const customerMap = new Map()
    const companyMap = new Map()
    if (cusK) customerMap.set(cusK, cus)
    if (compK) companyMap.set(compK, comp)

    const wfRes = resolveCompanyWorkflows({
      ma_khach_hang: c.Ma_khach_hang,
      ma_cong_ty: c.Ma_cong_ty,
      ten_cong_ty: comp,
      ten_khach_hang: cus
    })
    const wfIds = new Set(wfRes.list.map((w) => w.id_workflow))
    if (!wfRes.hasCustom) wfIds.add('WF_DEFAULT')

    rels.push({
      isWorkItem: false,
      customerMap,
      companyMap,
      projectId: '',
      workflowIds: wfIds
    })
  })

  // 4. Customer-Scoped Workflows
  customerWorkflowOptions.value.forEach((wf) => {
    const wfPair = resolveCompleteCustomerPair(wf)
    const comp = String(wf.ten_cong_ty || wfPair.ten_cong_ty || '').trim()
    const cus = String(wf.ten_khach_hang || wfPair.ten_khach_hang || '').trim()
    const customerMap = new Map()
    const companyMap = new Map()
    if (normFilterKey(cus)) customerMap.set(normFilterKey(cus), cus)
    if (normFilterKey(comp)) companyMap.set(normFilterKey(comp), comp)
    rels.push({
      isWorkItem: false,
      customerMap,
      companyMap,
      projectId: '',
      workflowIds: new Set([wf.id_workflow])
    })
  })

  return rels
})

const doesKanbanRelMatch = (rel, omitField = '') => {
  const f = filterConfig.value
  if (omitField !== 'customer' && f.customerName) {
    if (!rel.customerMap.has(f.customerName)) return false
  }
  if (omitField !== 'company' && f.companyName) {
    if (!rel.companyMap.has(f.companyName)) return false
  }
  if (omitField !== 'project' && f.projectId) {
    if (f.projectId === '__STANDALONE__') {
      if (rel.projectId !== '__STANDALONE__') return false
    } else if (rel.projectId !== f.projectId) {
      return false
    }
  }
  if (omitField !== 'workflow' && f.workflowId) {
    if (!rel.workflowIds.has(f.workflowId)) return false
  }
  return true
}

const kanbanCustomerFilterOptions = computed(() => {
  const map = new Map()
  kanbanEntityRelations.value.forEach((rel) => {
    if (!doesKanbanRelMatch(rel, 'customer')) return
    rel.customerMap.forEach((label, key) => {
      if (!map.has(key)) {
        map.set(key, { key, label, count: 0 })
      }
      if (rel.isWorkItem) {
        map.get(key).count += 1
      }
    })
  })
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'))
})

const filteredKanbanCustomerOptions = computed(() => {
  const kw = normFilterKey(kanbanFilterSearch.value.customer)
  if (!kw) return kanbanCustomerFilterOptions.value
  return kanbanCustomerFilterOptions.value.filter((o) => normFilterKey(o.label).includes(kw))
})

const kanbanCompanyFilterOptions = computed(() => {
  const map = new Map()
  kanbanEntityRelations.value.forEach((rel) => {
    if (!doesKanbanRelMatch(rel, 'company')) return
    rel.companyMap.forEach((label, key) => {
      if (!map.has(key)) {
        const resolved = resolveCompanyWorkflows({ ten_cong_ty: label })
        map.set(key, {
          key,
          label,
          count: 0,
          hasCustomFlow: resolved.hasCustom,
          customFlowCount: resolved.count
        })
      }
      if (rel.isWorkItem) {
        map.get(key).count += 1
      }
    })
  })
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'))
})

const filteredKanbanCompanyOptions = computed(() => {
  const kw = normFilterKey(kanbanFilterSearch.value.company)
  if (!kw) return kanbanCompanyFilterOptions.value
  return kanbanCompanyFilterOptions.value.filter((o) => normFilterKey(o.label).includes(kw))
})

const kanbanStandaloneCount = computed(() => {
  let cnt = 0
  kanbanEntityRelations.value.forEach((rel) => {
    if (!rel.isWorkItem || rel.projectId !== '__STANDALONE__') return
    if (doesKanbanRelMatch(rel, 'project')) cnt += 1
  })
  return cnt
})

const kanbanProjectFilterOptions = computed(() => {
  const matchedProjIds = new Set()
  const countMap = new Map()
  kanbanEntityRelations.value.forEach((rel) => {
    if (!rel.projectId || rel.projectId === '__STANDALONE__') return
    if (!doesKanbanRelMatch(rel, 'project')) return
    matchedProjIds.add(rel.projectId)
    if (rel.isWorkItem) {
      countMap.set(rel.projectId, (countMap.get(rel.projectId) || 0) + 1)
    }
  })

  return allEnrichedProjects.value
    .filter((p) => matchedProjIds.has(p.id_project))
    .map((p) => {
      const cnt = countMap.get(p.id_project) || 0
      const ownerSub = p.displayCompanyName || p.displayCustomerName || p.ma_du_an || ''
      return {
        id_project: p.id_project,
        label: p.ten_du_an,
        sub: cnt > 0 ? `${ownerSub ? ownerSub + ' · ' : ''}${cnt} việc` : ownerSub,
        count: cnt
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'))
})

const filteredKanbanProjectOptions = computed(() => {
  const kw = normFilterKey(kanbanFilterSearch.value.project)
  if (!kw) return kanbanProjectFilterOptions.value
  return kanbanProjectFilterOptions.value.filter(
    (o) => normFilterKey(o.label).includes(kw) || normFilterKey(o.sub).includes(kw)
  )
})

const kanbanWorkflowFilterOptions = computed(() => {
  const f = filterConfig.value
  const hasEntityFilter = Boolean(f.customerName || f.companyName || f.projectId)
  const matchedWfIds = new Set()
  const countMap = new Map()

  kanbanEntityRelations.value.forEach((rel) => {
    if (!doesKanbanRelMatch(rel, 'workflow')) return
    rel.workflowIds.forEach((wId) => {
      matchedWfIds.add(wId)
      if (rel.isWorkItem) {
        countMap.set(wId, (countMap.get(wId) || 0) + 1)
      }
    })
  })

  if (!hasEntityFilter) {
    matchedWfIds.add('WF_DEFAULT')
    uniqueWorkflows.value.forEach((w) => {
      if (w.id_workflow) matchedWfIds.add(w.id_workflow)
    })
  } else if (matchedWfIds.size === 0) {
    matchedWfIds.add('WF_DEFAULT')
  }

  const out = []
  if (matchedWfIds.has('WF_DEFAULT')) {
    out.push({
      id_workflow: 'WF_DEFAULT',
      label: 'Khung Chuẩn Hệ Thống (5 bước)',
      sub: 'Khung chuẩn dùng chung',
      count: countMap.get('WF_DEFAULT') || 0,
      orderGroup: 1
    })
  }

  uniqueWorkflows.value.forEach((wf) => {
    if (!wf.id_workflow || wf.id_workflow === 'WF_DEFAULT' || !matchedWfIds.has(wf.id_workflow)) return
    const isCus = wf.workflow_scope === 'customer'
    const ownerPair = isCus ? formatDistinctCustomerPair(wf.ten_cong_ty, wf.ten_khach_hang) : { displayCompanyName: '', displayCustomerName: '' }
    const ownerText = [ownerPair.displayCompanyName, ownerPair.displayCustomerName].filter(Boolean).join(' • ')
    out.push({
      id_workflow: wf.id_workflow,
      label: wf.name_workflow || wf.id_workflow,
      sub: isCus ? ownerText || 'Workflow Khách hàng' : 'Workflow Kho mẫu',
      count: countMap.get(wf.id_workflow) || 0,
      orderGroup: isCus ? 0 : 2
    })
  })

  return out.sort((a, b) => {
    if (a.orderGroup !== b.orderGroup) return a.orderGroup - b.orderGroup
    if (b.count !== a.count) return b.count - a.count
    return a.label.localeCompare(b.label, 'vi')
  })
})

const filteredKanbanWorkflowOptions = computed(() => {
  const kw = normFilterKey(kanbanFilterSearch.value.workflow)
  if (!kw) return kanbanWorkflowFilterOptions.value
  return kanbanWorkflowFilterOptions.value.filter(
    (o) => normFilterKey(o.label).includes(kw) || normFilterKey(o.sub).includes(kw)
  )
})

const activeKanbanCustomerFilterLabel = computed(() => {
  if (!filterConfig.value.customerName) return 'Tất cả KH'
  const found = kanbanCustomerFilterOptions.value.find((o) => o.key === filterConfig.value.customerName)
  if (found) return found.label
  const anyCus = customersList.value.find((c) => normFilterKey(c.Ten_khach_hang) === filterConfig.value.customerName)
  return anyCus?.Ten_khach_hang || 'Đang lọc KH'
})

const activeKanbanCompanyFilterLabel = computed(() => {
  if (!filterConfig.value.companyName) return 'Tất cả Cty'
  const found = kanbanCompanyFilterOptions.value.find((o) => o.key === filterConfig.value.companyName)
  if (found) return found.label
  const anyComp = customersList.value.find((c) => normFilterKey(c.Ten_cong_ty) === filterConfig.value.companyName)
  return anyComp?.Ten_cong_ty || 'Đang lọc Cty'
})

const activeKanbanProjectFilterLabel = computed(() => {
  const pid = filterConfig.value.projectId
  if (!pid) return 'Tất cả Dự án'
  if (pid === '__STANDALONE__') return 'Công việc lẻ'
  const found = projectsList.value.find((p) => p.id_project === pid)
  return found ? found.ten_du_an : 'Đang lọc Dự án'
})

const activeKanbanWorkflowFilterLabel = computed(() => {
  const curWf = filterConfig.value.workflowId || selectedWorkflowId.value || 'WF_DEFAULT'
  if (curWf === 'WF_DEFAULT') return 'Khung Chuẩn Hệ Thống'
  const found = uniqueWorkflows.value.find((w) => w.id_workflow === curWf)
  return found ? found.name_workflow : curWf
})

const reconcileKanbanCascadingFilters = (changedField) => {
  const f = filterConfig.value
  if (changedField !== 'project' && f.projectId) {
    if (f.projectId === '__STANDALONE__') {
      if (kanbanStandaloneCount.value === 0) f.projectId = ''
    } else if (!kanbanProjectFilterOptions.value.some((o) => o.id_project === f.projectId)) {
      f.projectId = ''
    }
  }
  if (changedField !== 'company' && f.companyName) {
    if (!kanbanCompanyFilterOptions.value.some((o) => o.key === f.companyName)) {
      f.companyName = ''
    }
  }
  if (changedField !== 'customer' && f.customerName) {
    if (!kanbanCustomerFilterOptions.value.some((o) => o.key === f.customerName)) {
      f.customerName = ''
    }
  }
  if (changedField !== 'workflow' && f.workflowId) {
    if (!kanbanWorkflowFilterOptions.value.some((o) => o.id_workflow === f.workflowId)) {
      f.workflowId = ''
    }
  }

  if (f.workflowId) {
    selectedWorkflowId.value = f.workflowId
    return
  }

  const wfOpts = kanbanWorkflowFilterOptions.value
  if (f.projectId && f.projectId !== '__STANDALONE__') {
    const proj = allEnrichedProjects.value.find((p) => p.id_project === f.projectId)
    if (proj) {
      const curInOpts = wfOpts.find((o) => o.id_workflow === selectedWorkflowId.value)
      if (!curInOpts || (curInOpts.count === 0 && wfOpts.some((o) => o.count > 0))) {
        const prefOpt = proj.default_workflow_id ? wfOpts.find((o) => o.id_workflow === proj.default_workflow_id) : null
        const bestWithItems = wfOpts.find((o) => o.count > 0)
        selectedWorkflowId.value = prefOpt?.id_workflow || bestWithItems?.id_workflow || wfOpts[0]?.id_workflow || 'WF_DEFAULT'
      }
      return
    }
  }

  if (f.companyName || f.customerName) {
    const compLabel = f.companyName ? activeKanbanCompanyFilterLabel.value : ''
    const cusLabel = f.customerName ? activeKanbanCustomerFilterLabel.value : ''
    const resolved = resolveCompanyWorkflows({
      ten_cong_ty: compLabel,
      ten_khach_hang: cusLabel
    })
    const curInOpts = wfOpts.find((o) => o.id_workflow === selectedWorkflowId.value)
    if (resolved.hasCustom) {
      if (!curInOpts || !resolved.list.some((w) => w.id_workflow === selectedWorkflowId.value)) {
        selectedWorkflowId.value = resolved.primary.id_workflow
      }
    } else if (!curInOpts || (curInOpts.count === 0 && wfOpts.some((o) => o.count > 0))) {
      const bestWithItems = wfOpts.find((o) => o.count > 0)
      selectedWorkflowId.value = bestWithItems?.id_workflow || wfOpts[0]?.id_workflow || 'WF_DEFAULT'
    }
  }
}

const selectKanbanCustomerFilter = (keyVal) => {
  filterConfig.value.customerName = keyVal || ''
  openKanbanFilterMenu.value = ''
  kanbanFilterSearch.value.customer = ''
  reconcileKanbanCascadingFilters('customer')
}

const selectKanbanCompanyFilter = (keyVal) => {
  filterConfig.value.companyName = keyVal || ''
  openKanbanFilterMenu.value = ''
  kanbanFilterSearch.value.company = ''
  reconcileKanbanCascadingFilters('company')
}

const selectKanbanProjectFilter = (projId) => {
  filterConfig.value.projectId = projId || ''
  openKanbanFilterMenu.value = ''
  kanbanFilterSearch.value.project = ''
  reconcileKanbanCascadingFilters('project')
}

const selectKanbanWorkflowFilter = (wfId) => {
  const nextWf = wfId || 'WF_DEFAULT'
  filterConfig.value.workflowId = wfId || ''
  selectedWorkflowId.value = nextWf
  openKanbanFilterMenu.value = ''
  kanbanFilterSearch.value.workflow = ''
  if (wfId) {
    reconcileKanbanCascadingFilters('workflow')
  }
}

const clearKanbanWorkflowFilter = () => {
  filterConfig.value.workflowId = ''
  openKanbanFilterMenu.value = ''
  kanbanFilterSearch.value.workflow = ''
  if (!filterConfig.value.companyName && !filterConfig.value.customerName && !filterConfig.value.projectId) {
    selectedWorkflowId.value = 'WF_DEFAULT'
  } else {
    reconcileKanbanCascadingFilters('workflow')
  }
}

const selectedCustomerContext = computed(() => {
  const f = filterConfig.value
  if (!f.companyName && !f.customerName) return null

  const compLabel = f.companyName ? activeKanbanCompanyFilterLabel.value : ''
  const cusLabel = f.customerName ? activeKanbanCustomerFilterLabel.value : ''
  const resolved = resolveCompanyWorkflows({
    ten_cong_ty: compLabel,
    ten_khach_hang: cusLabel
  })

  const wfCounter = new Map()
  items.value.forEach((it) => {
    const info = getItemPartyInfo(it)
    if (f.companyName && info.companyKey !== f.companyName) return
    if (f.customerName && !info.customerMap.has(f.customerName)) return
    if (f.projectId) {
      if (f.projectId === '__STANDALONE__' && it.id_project) return
      if (f.projectId !== '__STANDALONE__' && it.id_project !== f.projectId) return
    }
    const wId = it.id_workflow || 'WF_DEFAULT'
    wfCounter.set(wId, (wfCounter.get(wId) || 0) + 1)
  })

  const availableTabs = []
  const addedSet = new Set()

  resolved.list.forEach((wf) => {
    addedSet.add(wf.id_workflow)
    availableTabs.push({
      id_workflow: wf.id_workflow,
      name_workflow: wf.name_workflow,
      count: wfCounter.get(wf.id_workflow) || 0
    })
  })

  addedSet.add('WF_DEFAULT')
  availableTabs.push({
    id_workflow: 'WF_DEFAULT',
    name_workflow: 'Flow Chuẩn Hệ Thống',
    count: wfCounter.get('WF_DEFAULT') || 0
  })

  wfCounter.forEach((count, wId) => {
    if (!addedSet.has(wId)) {
      addedSet.add(wId)
      availableTabs.push({
        id_workflow: wId,
        name_workflow: getWorkflowShortLabel(wId),
        count
      })
    }
  })

  const displayTitle = [compLabel, cusLabel].filter(Boolean).join(' — ')
  return {
    label: displayTitle,
    companyTitle: compLabel || cusLabel || 'Công ty',
    searchKeyword: compLabel || cusLabel || '',
    isCustom: resolved.hasCustom,
    companyFlows: resolved.list,
    workflowId: resolved.primary.id_workflow,
    workflowName: resolved.primary.name_workflow,
    availableTabs
  }
})

const jumpToCustomerWorkflowDesigner = (keyword) => {
  workflowFocusCustomerKey.value = keyword || ''
  activeTab.value = 'workflow'
}

const handleOpenKanbanFromWorkflow = (payload) => {
  if (!payload) return
  const targetWf = payload.id_workflow || 'WF_DEFAULT'
  selectedWorkflowId.value = targetWf
  filterConfig.value.workflowId = targetWf
  filterConfig.value.projectId = ''
  if (payload.customer && (payload.customer.ten_cong_ty || payload.customer.ten_khach_hang)) {
    filterConfig.value.companyName = normFilterKey(payload.customer.ten_cong_ty)
    filterConfig.value.customerName = normFilterKey(payload.customer.ten_khach_hang)
  } else {
    filterConfig.value.companyName = ''
    filterConfig.value.customerName = ''
  }
  activeTab.value = 'kanban'
}

// =========================================================
// KANBAN DISTRIBUTION, FILTERING & DRAG-AND-DROP
// =========================================================
const boardData = ref({ unassigned: [] })
const collapsedCols = ref({ that_bai: true, hoan_thanh: true })
const collapsedSwimlanes = ref({})
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
  const col = e.target && e.target.closest ? e.target.closest('.kanban-column') : null
  hoverColName.value = col ? col.dataset.colName || '' : ''
}

watch(isDragging, (val) => {
  if (typeof window === 'undefined') return
  if (val) {
    window.addEventListener('dragover', onDragOver, true)
    window.addEventListener('mousemove', onDragOver, true)
  } else {
    window.removeEventListener('dragover', onDragOver, true)
    window.removeEventListener('mousemove', onDragOver, true)
    hoverColName.value = ''
  }
})

const getWeekDateRange = (weekStr) => {
  if (!weekStr) return { from: null, to: null }
  const [year, week] = weekStr.split('-W')
  const d = new Date(year, 0, 1)
  const days = (week - 1) * 7
  d.setDate(d.getDate() + days - d.getDay() + 1)
  const from = new Date(d)
  const to = new Date(d)
  to.setDate(to.getDate() + 6)
  return { from, to }
}

const getProjectDisplayName = (item) => {
  if (!item.id_project) return ''
  const found = projectsList.value.find((p) => p.id_project === item.id_project)
  return found ? found.ten_du_an : item.ten_du_an || item.id_project
}

const kanbanSearchInputRef = ref(null)

const escapeKanbanHtml = (val) =>
  String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const foldKanbanSearchText = (val) =>
  String(val ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

const activeSearchTokens = computed(() => {
  const raw = String(searchQuery.value || '').trim()
  if (!raw) return []
  const folded = foldKanbanSearchText(raw)
  const parts = folded.split(/\s+/).filter(Boolean)
  const unique = Array.from(new Set(parts))
  return unique.sort((a, b) => b.length - a.length)
})

const highlightKanbanText = (rawText, fallbackText = '') => {
  const str = String(rawText ?? '')
  if (!str) return escapeKanbanHtml(fallbackText)
  const tokens = activeSearchTokens.value
  if (!tokens.length) return escapeKanbanHtml(str)

  let foldedStr = ''
  const origStarts = []
  let i = 0
  while (i < str.length) {
    const codePoint = str.codePointAt(i)
    const ch = String.fromCodePoint(codePoint)
    const chLen = ch.length
    const foldedCh = ch
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
    for (let k = 0; k < foldedCh.length; k++) {
      foldedStr += foldedCh[k]
      origStarts.push(i)
    }
    i += chLen
  }

  if (!foldedStr) return escapeKanbanHtml(str)

  const ranges = []
  for (const tok of tokens) {
    if (!tok) continue
    let pos = 0
    while (pos <= foldedStr.length - tok.length) {
      const idx = foldedStr.indexOf(tok, pos)
      if (idx === -1) break
      const endFolded = idx + tok.length
      const startOrig = origStarts[idx]
      let endOrig = endFolded < origStarts.length ? origStarts[endFolded] : str.length
      while (endOrig < str.length && /[\u0300-\u036f]/.test(str[endOrig])) {
        endOrig += 1
      }
      if (endOrig > startOrig) {
        ranges.push([startOrig, endOrig])
      }
      pos = idx + 1
    }
  }

  if (!ranges.length) return escapeKanbanHtml(str)

  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1])
  const merged = [ranges[0]]
  for (let r = 1; r < ranges.length; r++) {
    const prev = merged[merged.length - 1]
    const cur = ranges[r]
    if (cur[0] <= prev[1]) {
      if (cur[1] > prev[1]) prev[1] = cur[1]
    } else {
      merged.push(cur)
    }
  }

  let html = ''
  let cursor = 0
  for (const [s, e] of merged) {
    if (s > cursor) {
      html += escapeKanbanHtml(str.slice(cursor, s))
    }
    html += `<mark class="pl-search-hl">${escapeKanbanHtml(str.slice(s, e))}</mark>`
    cursor = e
  }
  if (cursor < str.length) {
    html += escapeKanbanHtml(str.slice(cursor))
  }
  return html
}

const textMatchesAnySearchToken = (rawText) => {
  const tokens = activeSearchTokens.value
  if (!tokens.length || !rawText) return false
  const folded = foldKanbanSearchText(rawText)
  return tokens.some((tok) => folded.includes(tok))
}

const cardHasFileSearchMatch = (item) => {
  if (!item || !activeSearchTokens.value.length) return false
  const files = getParsedFiles(item)
  return files.some((f) => textMatchesAnySearchToken(f?.name))
}

const cardHasReportSearchMatch = (item) => {
  if (!item || !activeSearchTokens.value.length) return false
  const repIds = getPipeReportIds(item)
  return repIds.some((repId) => {
    const det = getReportDetails(repId)
    if (textMatchesAnySearchToken(det?.noi_dung) || textMatchesAnySearchToken(det?.ghi_chu)) {
      return true
    }
    const atts = getUnifiedReportAttachments(repId)
    return atts.some((att) => textMatchesAnySearchToken(att?.name))
  })
}

const onKanbanSearchEsc = () => {
  if (searchQuery.value) {
    searchQuery.value = ''
  } else if (kanbanSearchInputRef.value) {
    kanbanSearchInputRef.value.blur()
  }
}

const matchesSearch = (item) => {
  const tokens = activeSearchTokens.value
  if (tokens.length > 0) {
    const projName = getProjectDisplayName(item)
    const fileNames = getParsedFiles(item)
      .map((f) => f?.name || '')
      .join(' ')
    const reportTexts = getPipeReportIds(item)
      .map((repId) => {
        const det = getReportDetails(repId)
        const attNames = getUnifiedReportAttachments(repId)
          .map((a) => a?.name || '')
          .join(' ')
        return `${det?.noi_dung || ''} ${det?.ghi_chu || ''} ${attNames}`
      })
      .join(' ')

    const combinedFolded = foldKanbanSearchText(
      [
        item.ten_khach_hang,
        item.ten_cong_ty,
        item.ma_hop_dong,
        item.content_of_contract_po,
        projName,
        item.finish_time,
        item.ghi_chu,
        fileNames,
        reportTexts
      ]
        .filter(Boolean)
        .join(' ')
    )

    const allMatched = tokens.every((tok) => combinedFolded.includes(tok))
    if (!allMatched) return false
  }

  if (filterConfig.value.companyName || filterConfig.value.customerName) {
    const info = getItemPartyInfo(item)
    if (filterConfig.value.companyName && info.companyKey !== filterConfig.value.companyName) {
      return false
    }
    if (filterConfig.value.customerName && !info.customerMap.has(filterConfig.value.customerName)) {
      return false
    }
  }

  if (filterConfig.value.projectId) {
    if (filterConfig.value.projectId === '__STANDALONE__') {
      if (item.id_project) return false
    } else if (item.id_project !== filterConfig.value.projectId) {
      return false
    }
  }

  if (filterConfig.value.filterMode !== 'all') {
    if (!item.finish_time) return false
    const f = filterConfig.value
    if (f.filterMode === 'day') {
      if (f.dateFrom && item.finish_time < f.dateFrom) return false
      if (f.dateTo && item.finish_time > f.dateTo) return false
    } else if (f.filterMode === 'week') {
      let fromStr = null
      let toStr = null
      if (f.weekFrom) {
        const { from } = getWeekDateRange(f.weekFrom)
        if (from) {
          const m = from.getMonth() + 1
          const d = from.getDate()
          fromStr = `${from.getFullYear()}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
        }
      }
      if (f.weekTo) {
        const { to } = getWeekDateRange(f.weekTo)
        if (to) {
          const m = to.getMonth() + 1
          const d = to.getDate()
          toStr = `${to.getFullYear()}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
        }
      }
      if (fromStr && item.finish_time < fromStr) return false
      if (toStr && item.finish_time > toStr) return false
    } else if (f.filterMode === 'month') {
      const ft = item.finish_time.substring(0, 7)
      if (f.monthFrom && ft < f.monthFrom) return false
      if (f.monthTo && ft > f.monthTo) return false
    } else if (f.filterMode === 'year') {
      const fy = item.finish_time.substring(0, 4)
      if (f.yearFrom && fy < f.yearFrom) return false
      if (f.yearTo && fy > f.yearTo) return false
    }
  }

  return true
}

const hasActiveFilters = computed(
  () =>
    Boolean(searchQuery.value) ||
    Boolean(filterConfig.value.customerName) ||
    Boolean(filterConfig.value.companyName) ||
    Boolean(filterConfig.value.projectId) ||
    Boolean(filterConfig.value.workflowId) ||
    filterConfig.value.filterMode !== 'all'
)

const resetFilters = () => {
  searchQuery.value = ''
  openKanbanFilterMenu.value = ''
  kanbanFilterSearch.value = { customer: '', company: '', project: '', workflow: '' }
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
    companyName: '',
    projectId: '',
    workflowId: ''
  }
  selectedWorkflowId.value = 'WF_DEFAULT'
}

const resolveColumnForItem = (item, cols) => {
  if (item.status_name === 'THÀNH CÔNG') return cols.find((c) => c.id === 'hoan_thanh')
  if (item.status_name === 'THẤT BẠI') return cols.find((c) => c.id === 'that_bai')
  if (item.id_status_workflow) {
    const byId = cols.find((c) => c.rawStatusId === item.id_status_workflow || c.id === item.id_status_workflow)
    if (byId) return byId
  }
  const byName = cols.find((c) => c.value === item.status_name)
  if (byName) return byName
  const byPct = cols.find((c) => c.percent === item['%status'] && c.id !== 'that_bai')
  return byPct || null
}

const getCardColumnId = (item) => {
  const matched = resolveColumnForItem(item, COLUMNS.value)
  return matched ? matched.id : 'unassigned'
}

const distributeItems = () => {
  const nextBoard = { unassigned: [] }
  COLUMNS.value.forEach((c) => {
    nextBoard[c.id] = []
  })

  items.value.forEach((item) => {
    const wfMatch =
      selectedWorkflowId.value === 'WF_DEFAULT'
        ? !item.id_workflow || item.id_workflow === 'WF_DEFAULT'
        : item.id_workflow === selectedWorkflowId.value

    if (!wfMatch) return

    const colConfig = resolveColumnForItem(item, COLUMNS.value)
    if (colConfig) {
      if (!nextBoard[colConfig.id]) nextBoard[colConfig.id] = []
      nextBoard[colConfig.id].push(item)
    } else {
      nextBoard.unassigned.push(item)
    }
  })

  boardData.value = nextBoard
}

watch(
  COLUMNS,
  (newCols) => {
    newCols.forEach((c) => {
      if (collapsedCols.value[c.id] === undefined) {
        collapsedCols.value[c.id] = c.id === 'that_bai' || c.id === 'hoan_thanh'
      }
    })
    distributeItems()
  },
  { immediate: true }
)

watch(selectedWorkflowId, () => {
  distributeItems()
})

const filteredUnassignedItems = computed(() => (boardData.value.unassigned || []).filter(matchesSearch))
const getColumnFilteredItems = (colId) => (boardData.value[colId] || []).filter(matchesSearch)
const getColumnTotalVolume = (colId) =>
  getColumnFilteredItems(colId).reduce((acc, it) => acc + parseNum(it.volume), 0)

const toggleColumnCollapse = (colId) => {
  collapsedCols.value[colId] = !collapsedCols.value[colId]
}

const kanbanKpis = computed(() => {
  const activeWfItems = items.value.filter((item) => {
    const wfMatch =
      selectedWorkflowId.value === 'WF_DEFAULT'
        ? !item.id_workflow || item.id_workflow === 'WF_DEFAULT'
        : item.id_workflow === selectedWorkflowId.value
    return wfMatch && matchesSearch(item)
  })

  let totalVolume = 0
  let weightedVolume = 0
  let wonVolume = 0
  let wonCount = 0
  const projSet = new Set()

  activeWfItems.forEach((it) => {
    const vol = parseNum(it.volume)
    if (it.id_project) projSet.add(it.id_project)
    if (it.status_name === 'THẤT BẠI') return
    totalVolume += vol
    if (it.status_name === 'THÀNH CÔNG' || it.isSuccess === true) {
      wonVolume += vol
      weightedVolume += vol
      wonCount += 1
    } else {
      const pct = Math.min(100, Math.max(0, parseFloat(String(it['%status'] || '0').replace('%', '')) || 0))
      weightedVolume += Math.round((vol * pct) / 100)
    }
  })

  return {
    count: activeWfItems.length,
    totalVolume,
    weightedVolume,
    wonVolume,
    wonCount,
    projectCount: projSet.size
  }
})

const swimlaneRows = computed(() => {
  const activeCards = items.value.filter((item) => {
    const wfMatch =
      selectedWorkflowId.value === 'WF_DEFAULT'
        ? !item.id_workflow || item.id_workflow === 'WF_DEFAULT'
        : item.id_workflow === selectedWorkflowId.value
    return wfMatch && matchesSearch(item)
  })

  const lanes = []
  projectsList.value.forEach((proj) => {
    if (filterConfig.value.projectId && filterConfig.value.projectId !== proj.id_project) return
    const cardsInActiveFlow = activeCards.filter((c) => c.id_project === proj.id_project)
    const allProjectCards = items.value.filter((c) => c.id_project === proj.id_project)
    if (cardsInActiveFlow.length === 0 && !filterConfig.value.projectId) return

    const totalVolume = cardsInActiveFlow.reduce(
      (s, c) => (c.status_name === 'THẤT BẠI' ? s : s + parseNum(c.volume)),
      0
    )
    lanes.push({
      laneId: proj.id_project,
      project: proj,
      title: proj.ten_du_an,
      subtitle: proj.ten_cong_ty || proj.ten_khach_hang || '',
      cardsInActiveFlow,
      otherFlowCount: Math.max(0, allProjectCards.length - cardsInActiveFlow.length),
      totalVolume
    })
  })

  const standaloneCards = activeCards.filter((c) => !c.id_project)
  if (standaloneCards.length > 0 || lanes.length === 0) {
    lanes.push({
      laneId: '__STANDALONE__',
      project: null,
      title: 'Công Việc Độc Lập (Chưa gắn Dự án)',
      subtitle: 'Các công việc trên khung này chạy riêng lẻ',
      cardsInActiveFlow: standaloneCards,
      otherFlowCount: 0,
      totalVolume: standaloneCards.reduce((s, c) => (c.status_name === 'THẤT BẠI' ? s : s + parseNum(c.volume)), 0)
    })
  }

  return lanes
})

const toggleSwimlane = (laneId) => {
  collapsedSwimlanes.value[laneId] = !collapsedSwimlanes.value[laneId]
}

const getSwimlaneCellCards = (lane, colId) =>
  lane.cardsInActiveFlow.filter((card) => getCardColumnId(card) === colId)

const syncItemAPI = async (item) => {
  if (!item || !item.Id_pipeline) return
  backgroundSyncing.value = true
  try {
    const key = sanitizeFirebaseKey(item.Id_pipeline)
    await update(dbRef(database, 'pipeline/' + key), {
      Id_pipeline: item.Id_pipeline,
      status_name: item.status_name ?? '',
      '%status': item['%status'] ?? '',
      id_status_workflow: item.id_status_workflow ?? '',
      isSuccess: item.isSuccess ?? ''
    })
  } catch (err) {
    console.error('Firebase syncItemAPI Lỗi:', err)
  } finally {
    backgroundSyncing.value = false
  }
}

const applyColumnToItem = (item, colId, cols = COLUMNS.value) => {
  const colConfig = cols.find((c) => c.id === colId)
  if (!colConfig || colId === 'unassigned') {
    item.status_name = ''
    item['%status'] = ''
    item.id_status_workflow = ''
    item.isSuccess = ''
    return
  }
  item.status_name = colConfig.value
  item['%status'] = colConfig.percent
  item.id_status_workflow = colConfig.rawStatusId || colConfig.id
  if (colId === 'that_bai') {
    item['%status'] = '0%'
    item.isSuccess = false
  } else if (colId === 'hoan_thanh') {
    item['%status'] = '100%'
    item.isSuccess = true
  } else {
    item.isSuccess = ''
  }
}

const droppedCardId = ref(null)
let droppedCardTimer = null

const triggerCardDropPulse = (cardId) => {
  if (!cardId) return
  droppedCardId.value = cardId
  if (droppedCardTimer) clearTimeout(droppedCardTimer)
  droppedCardTimer = setTimeout(() => {
    if (droppedCardId.value === cardId) droppedCardId.value = null
  }, 650)
}

const onChange = (evt, colId) => {
  if (evt.added) {
    const item = evt.added.element
    applyColumnToItem(item, colId, COLUMNS.value)
    triggerCardDropPulse(item.Id_pipeline)
    syncItemAPI(item)
  }
}

const moveCardToColumn = async (item, colId) => {
  applyColumnToItem(item, colId, COLUMNS.value)
  distributeItems()
  triggerCardDropPulse(item.Id_pipeline)
  await syncItemAPI(item)
  showToast(`Đã chuyển sang: ${item.status_name || 'Chưa phân loại'}`, 'info', 1800)
}

// =========================================================
// MULTI-PIPELINE PROJECTS WORKSPACE & ORCHESTRATION (4-TIER)
// =========================================================
const projectSearchQuery = ref('')
const projectStatusFilter = ref('Tất cả')
const openProjFilterMenu = ref('')
const projFilterSearch = ref({
  customer: '',
  company: '',
  project: '',
  workflow: ''
})
const projectFilter = ref({
  customerName: '',
  companyName: '',
  projectId: '',
  workflowId: ''
})
const toggleProjFilterMenu = (menuKey) => {
  openProjFilterMenu.value = openProjFilterMenu.value === menuKey ? '' : menuKey
}
const showProjectFormModal = ref(false)
const isEditingProject = ref(false)
const savingProject = ref(false)
const showProjectFormWfPicker = ref(false)
const projectFormWfSearch = ref('')

const defaultProjectForm = {
  id_project: '',
  ma_du_an: '',
  ten_du_an: '',
  ma_khach_hang: '',
  ten_khach_hang: '',
  ma_cong_ty: '',
  ten_cong_ty: '',
  default_workflow_id: '',
  linked_workflow_ids: [],
  AM: 'Sơn',
  ngan_sach_du_kien: '',
  deadline: '',
  trang_thai: 'Đang triển khai',
  ghi_chu: ''
}
const projectForm = ref({ ...defaultProjectForm, linked_workflow_ids: [] })

watch(
  () => [projectForm.value.ten_khach_hang, projectForm.value.ten_cong_ty],
  ([tenKH, congTy]) => {
    if (tenKH || congTy) {
      projectForm.value.ma_cong_ty = genMaCT(congTy)
      projectForm.value.ma_khach_hang = genMaKH(tenKH, congTy)
    }
  }
)

const showProjectDetailModal = ref(false)
const activeProjectId = ref('')
const projectDetailSubTab = ref('pipelines')
const projectDetailWfFilter = ref('ALL')
const isProjLeftRailOpen = ref(true)
const projectDetailPipeSearch = ref('')
const focusedProjectPipeId = ref('')
const openProjPipeStageMenuId = ref('')

const showAttachPipelineDrawer = ref(false)
const attachPipelineSearch = ref('')
const attachSameCustomerOnly = ref(false)

const showManageProjectWfDrawer = ref(false)
const manageWfDrawerMode = ref('attach') // 'attach' | 'create'
const manageWfSearch = ref('')
const manageWfScopeFilter = ref('ALL') // 'ALL' | 'customer' | 'template'
const savingQuickProjWf = ref(false)
const quickProjWfForm = ref({
  ten_cong_ty: '',
  ten_khach_hang: '',
  ma_cong_ty: '',
  ma_khach_hang: '',
  base_template_id: 'WF_DEFAULT',
  name_workflow: ''
})

watch(
  () => [quickProjWfForm.value.ten_khach_hang, quickProjWfForm.value.ten_cong_ty],
  ([tenKH, congTy]) => {
    if (tenKH || congTy) {
      quickProjWfForm.value.ma_cong_ty = genMaCT(congTy)
      quickProjWfForm.value.ma_khach_hang = genMaKH(tenKH, congTy)
    }
  }
)

const toggleProjLeftRail = () => {
  if (isMobile.value || (typeof window !== 'undefined' && window.innerWidth <= 1100)) {
    isProjLeftRailOpen.value = !isProjLeftRailOpen.value
  }
}

const openManageProjectWfModal = (mode = 'attach') => {
  manageWfDrawerMode.value = mode
  manageWfSearch.value = ''
  showAttachPipelineDrawer.value = false
  showManageProjectWfDrawer.value = true
}

const openAttachPipelineModal = () => {
  attachPipelineSearch.value = ''
  showManageProjectWfDrawer.value = false
  showAttachPipelineDrawer.value = true
}

const toggleAttachPipelineDrawer = () => {
  if (showAttachPipelineDrawer.value) {
    showAttachPipelineDrawer.value = false
  } else {
    openAttachPipelineModal()
  }
}

const toggleManageProjectWfDrawer = () => {
  if (showManageProjectWfDrawer.value) {
    showManageProjectWfDrawer.value = false
  } else {
    openManageProjectWfModal('attach')
  }
}

const clearProjectCompanyField = () => {
  projectForm.value.ten_cong_ty = ''
  projectForm.value.ma_cong_ty = ''
}

const clearProjectContactField = () => {
  projectForm.value.ten_khach_hang = ''
  projectForm.value.ma_khach_hang = projectForm.value.ten_cong_ty
    ? genMaKH('', projectForm.value.ten_cong_ty)
    : ''
}

const clearQuickProjWfCompanyField = () => {
  quickProjWfForm.value.ten_cong_ty = ''
  quickProjWfForm.value.ma_cong_ty = ''
}

const clearQuickProjWfContactField = () => {
  quickProjWfForm.value.ten_khach_hang = ''
  quickProjWfForm.value.ma_khach_hang = quickProjWfForm.value.ten_cong_ty
    ? genMaKH('', quickProjWfForm.value.ten_cong_ty)
    : ''
}

const buildProjectDeadlinePresetValue = (preset) => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const pad2 = (n) => String(n).padStart(2, '0')
  if (preset === 'this_quarter') {
    const q = Math.floor((m - 1) / 3) + 1
    return `Q${q}/${y}`
  }
  if (preset === 'plus_6m') {
    const end = new Date(y, m - 1 + 6, 1)
    return `${pad2(m)}/${y} - ${pad2(end.getMonth() + 1)}/${end.getFullYear()}`
  }
  if (preset === 'this_year') {
    return `12/${y}`
  }
  if (preset === 'next_year') {
    return `12/${y + 1}`
  }
  return ''
}

const activeProjectDeadlinePreset = computed(() => {
  const cur = String(projectForm.value.deadline || '').trim()
  if (!cur) return ''
  for (const key of ['this_quarter', 'plus_6m', 'this_year', 'next_year']) {
    if (buildProjectDeadlinePresetValue(key) === cur) return key
  }
  return ''
})

const applyProjectDeadlinePreset = (preset) => {
  const nextVal = buildProjectDeadlinePresetValue(preset)
  if (!nextVal) return
  projectForm.value.deadline = projectForm.value.deadline === nextVal ? '' : nextVal
}

const buildCorrespondingWorkflowsForEntity = (entity = {}, childPipes = [], options = {}) => {
  const rootPair = resolveCompleteCustomerPair({
    ma_khach_hang: entity.ma_khach_hang || '',
    ma_cong_ty: entity.ma_cong_ty || '',
    ten_cong_ty: entity.ten_cong_ty || '',
    ten_khach_hang: entity.ten_khach_hang || ''
  })

  const companyWfRes = resolveCompanyWorkflows({
    ma_khach_hang: entity.ma_khach_hang || '',
    ma_cong_ty: entity.ma_cong_ty || '',
    ten_cong_ty: rootPair.ten_cong_ty || entity.ten_cong_ty || '',
    ten_khach_hang: rootPair.ten_khach_hang || entity.ten_khach_hang || ''
  })

  const pipesByWf = new Map()
  childPipes.forEach((p) => {
    const wfId = p.id_workflow || 'WF_DEFAULT'
    if (!pipesByWf.has(wfId)) pipesByWf.set(wfId, [])
    pipesByWf.get(wfId).push(p)
  })

  const explicitIds = normalizeLinkedWorkflowIds(entity.linked_workflow_ids)
  const rawEntries = []
  const seenIds = new Set()

  // 1. Root Customer's own Pipeline Frames
  companyWfRes.list.forEach((wf) => {
    seenIds.add(wf.id_workflow)
    const wfPair = resolveCompleteCustomerPair({
      ma_khach_hang: wf.ma_khach_hang || entity.ma_khach_hang || '',
      ma_cong_ty: wf.ma_cong_ty || entity.ma_cong_ty || '',
      ten_cong_ty: wf.ten_cong_ty || rootPair.ten_cong_ty || '',
      ten_khach_hang: wf.ten_khach_hang || rootPair.ten_khach_hang || ''
    })
    rawEntries.push({
      id_workflow: wf.id_workflow,
      name_workflow: wf.name_workflow,
      scopeType: 'company_custom',
      scopeLabel: wf.is_company_default ? 'KH Gốc (Mặc định)' : 'Khung KH Gốc',
      tone: 'emerald',
      isRootCustomerFlow: true,
      isExplicitlyLinked: false,
      ten_cong_ty: wfPair.ten_cong_ty,
      ten_khach_hang: wfPair.ten_khach_hang,
      ownerCustomer: wfPair.ten_cong_ty || wfPair.ten_khach_hang || ''
    })
  })

  // 2. Explicitly linked Pipeline Frames (Partner Customers / Blueprints — Templates NEVER bind customer info)
  explicitIds.forEach((wfId) => {
    if (!seenIds.has(wfId) && wfId !== 'WF_DEFAULT') {
      seenIds.add(wfId)
      const meta = uniqueWorkflows.value.find((w) => w.id_workflow === wfId)
      const isCusScope = meta?.workflow_scope === 'customer'
      const firstPipe = (pipesByWf.get(wfId) || [])[0]
      const wfPair = isCusScope
        ? resolveCompleteCustomerPair({
            ma_khach_hang: meta?.ma_khach_hang || firstPipe?.ma_khach_hang || '',
            ma_cong_ty: meta?.ma_cong_ty || firstPipe?.ma_cong_ty || '',
            ten_cong_ty: meta?.ten_cong_ty || firstPipe?.ten_cong_ty || '',
            ten_khach_hang: meta?.ten_khach_hang || firstPipe?.ten_khach_hang || ''
          })
        : { ten_cong_ty: '', ten_khach_hang: '' }
      const ownerLabel = isCusScope ? wfPair.ten_cong_ty || wfPair.ten_khach_hang || '' : ''
      rawEntries.push({
        id_workflow: wfId,
        name_workflow: meta?.name_workflow || wfId,
        scopeType: isCusScope ? 'partner_custom' : 'blueprint',
        scopeLabel: isCusScope ? `KH Khung: ${ownerLabel || 'KH đối tác'}` : 'Khung mẫu dùng chung',
        tone: isCusScope ? 'amber' : 'sky',
        isRootCustomerFlow: false,
        isExplicitlyLinked: true,
        ten_cong_ty: isCusScope ? wfPair.ten_cong_ty : '',
        ten_khach_hang: isCusScope ? wfPair.ten_khach_hang : '',
        ownerCustomer: ownerLabel
      })
    }
  })

  // 3. Pipeline Frames derived from child Work Items in this Project
  pipesByWf.forEach((list, wfId) => {
    if (!seenIds.has(wfId) && wfId !== 'WF_DEFAULT') {
      seenIds.add(wfId)
      const meta = uniqueWorkflows.value.find((w) => w.id_workflow === wfId)
      const isCusScope = meta?.workflow_scope === 'customer'
      const firstPipe = list[0]
      const wfPair = isCusScope
        ? resolveCompleteCustomerPair({
            ma_khach_hang: meta?.ma_khach_hang || firstPipe?.ma_khach_hang || '',
            ma_cong_ty: meta?.ma_cong_ty || firstPipe?.ma_cong_ty || '',
            ten_cong_ty: meta?.ten_cong_ty || firstPipe?.ten_cong_ty || '',
            ten_khach_hang: meta?.ten_khach_hang || firstPipe?.ten_khach_hang || ''
          })
        : { ten_cong_ty: '', ten_khach_hang: '' }
      const ownerLabel = isCusScope ? wfPair.ten_cong_ty || wfPair.ten_khach_hang || '' : ''
      rawEntries.push({
        id_workflow: wfId,
        name_workflow: meta?.name_workflow || wfId,
        scopeType: isCusScope ? 'partner_custom' : 'blueprint',
        scopeLabel: isCusScope ? (ownerLabel ? `KH Khung: ${ownerLabel}` : 'Khung KH khác') : 'Khung mẫu dùng chung',
        tone: isCusScope ? 'amber' : 'sky',
        isRootCustomerFlow: false,
        isExplicitlyLinked: false,
        ten_cong_ty: isCusScope ? wfPair.ten_cong_ty : '',
        ten_khach_hang: isCusScope ? wfPair.ten_khach_hang : '',
        ownerCustomer: ownerLabel
      })
    }
  })

  // 4. System Standard Workflow (Customer-free system template)
  const isDefaultExplicitlyLinked = explicitIds.includes('WF_DEFAULT')
  const shouldIncludeStandard =
    Boolean(options.alwaysIncludeStandard) ||
    rawEntries.length === 0 ||
    isDefaultExplicitlyLinked ||
    pipesByWf.has('WF_DEFAULT') ||
    entity.default_workflow_id === 'WF_DEFAULT'

  if (shouldIncludeStandard) {
    seenIds.add('WF_DEFAULT')
    rawEntries.push({
      id_workflow: 'WF_DEFAULT',
      name_workflow: 'Workflow Chuẩn Hệ Thống',
      scopeType: 'standard',
      scopeLabel: 'Workflow chuẩn',
      tone: 'sky',
      isRootCustomerFlow: false,
      isExplicitlyLinked: isDefaultExplicitlyLinked,
      ten_cong_ty: '',
      ten_khach_hang: '',
      ownerCustomer: ''
    })
  }

  const preferredWfId =
    entity.default_workflow_id && seenIds.has(entity.default_workflow_id)
      ? entity.default_workflow_id
      : companyWfRes.primary.id_workflow

  return rawEntries.map((entry) => {
    const allCols = getColumnsForWorkflow(entry.id_workflow)
    const wfPipes = pipesByWf.get(entry.id_workflow) || []
    const stepsWithCounts = allCols.map((col) => {
      const matchedPipes = wfPipes.filter((p) => (resolveColumnForItem(p, allCols)?.id || '') === col.id)
      const stepVolume = matchedPipes.reduce((acc, p) => acc + parseNum(p.volume), 0)
      return {
        ...col,
        activeCount: matchedPipes.length,
        stepVolume,
        matchedPipes
      }
    })

    const coreSteps = stepsWithCounts.filter((s) => s.id !== 'hoan_thanh' && s.id !== 'that_bai')
    const distinctPair = formatDistinctCustomerPair(entry.ten_cong_ty, entry.ten_khach_hang)

    let wfVolume = 0
    let wonCount = 0
    wfPipes.forEach((p) => {
      if (p.status_name === 'THẤT BẠI') return
      wfVolume += parseNum(p.volume)
      if (p.status_name === 'THÀNH CÔNG' || p.isSuccess === true) wonCount += 1
    })

    return {
      ...entry,
      ...distinctPair,
      isPreferred: entry.id_workflow === preferredWfId,
      stepCount: coreSteps.length,
      allColumns: allCols,
      stepsWithCounts,
      flowSteps: coreSteps.length > 0 ? coreSteps : stepsWithCounts,
      cardSteps: stepsWithCounts.filter((s) => s.id !== 'that_bai' || s.activeCount > 0),
      pipelines: wfPipes,
      pipeCount: wfPipes.length,
      totalVolume: wfVolume,
      wonCount
    }
  })
}

const hasProjectModalCustomer = computed(() =>
  Boolean(String(projectForm.value.ten_cong_ty || '').trim() || String(projectForm.value.ten_khach_hang || '').trim())
)

const projectModalCorrespondingWorkflows = computed(() => {
  if (!hasProjectModalCustomer.value) return []
  const existingChildPipes = isEditingProject.value && projectForm.value.id_project
    ? items.value.filter((i) => i.id_project === projectForm.value.id_project)
    : []
  return buildCorrespondingWorkflowsForEntity(projectForm.value, existingChildPipes, { alwaysIncludeStandard: true })
})

const projectFormAttachableWorkflows = computed(() => {
  const rootRes = resolveCompanyWorkflows({
    ma_khach_hang: projectForm.value.ma_khach_hang || '',
    ma_cong_ty: projectForm.value.ma_cong_ty || '',
    ten_cong_ty: projectForm.value.ten_cong_ty || '',
    ten_khach_hang: projectForm.value.ten_khach_hang || ''
  })
  const rootFlowSet = new Set(rootRes.list.map((w) => w.id_workflow))
  const linkedSet = new Set(normalizeLinkedWorkflowIds(projectForm.value.linked_workflow_ids))
  const kw = projectFormWfSearch.value.trim().toLowerCase()

  return uniqueWorkflows.value
    .filter((wf) => {
      if (!wf.id_workflow || wf.id_workflow === 'WF_DEFAULT') return false
      if (rootFlowSet.has(wf.id_workflow)) return false
      if (!kw) return true
      return (
        (wf.name_workflow && wf.name_workflow.toLowerCase().includes(kw)) ||
        (wf.ten_cong_ty && wf.ten_cong_ty.toLowerCase().includes(kw)) ||
        (wf.ten_khach_hang && wf.ten_khach_hang.toLowerCase().includes(kw))
      )
    })
    .map((wf) => {
      const stepRows = workflowsData.value.filter((r) => r.id_workflow === wf.id_workflow)
      return {
        ...wf,
        steps: stepRows,
        stepCount: stepRows.length,
        isLinkedInForm: linkedSet.has(wf.id_workflow)
      }
    })
})

const toggleProjectFormLinkedWorkflow = (wfId) => {
  if (!wfId || wfId === 'WF_DEFAULT') return
  const cur = normalizeLinkedWorkflowIds(projectForm.value.linked_workflow_ids)
  if (cur.includes(wfId)) {
    projectForm.value.linked_workflow_ids = cur.filter((id) => id !== wfId)
    if (projectForm.value.default_workflow_id === wfId) {
      projectForm.value.default_workflow_id = ''
    }
  } else {
    projectForm.value.linked_workflow_ids = [...cur, wfId]
  }
}

const buildEnrichedProject = (proj) => {
  const childPipes = items.value.filter((i) => i.id_project === proj.id_project)
  const wfSet = new Set()
  let totalVolume = 0
  let weightedVolume = 0
  let wonVolume = 0
  let wonCount = 0
  let sumProgress = 0
  let activeForAvg = 0

  childPipes.forEach((p) => {
    wfSet.add(p.id_workflow || 'WF_DEFAULT')
    const vol = parseNum(p.volume)
    if (p.status_name === 'THẤT BẠI') return
    totalVolume += vol
    const pct = p.status_name === 'THÀNH CÔNG' ? 100 : Math.min(100, Math.max(0, parseFloat(String(p['%status'] || '0').replace('%', '')) || 0))
    sumProgress += pct
    activeForAvg += 1
    weightedVolume += Math.round((vol * pct) / 100)
    if (p.status_name === 'THÀNH CÔNG' || p.isSuccess === true) {
      wonVolume += vol
      wonCount += 1
    }
  })

  const rootPair = resolveCompleteCustomerPair(proj)
  const rootDisplayPair = formatDistinctCustomerPair(rootPair.ten_cong_ty, rootPair.ten_khach_hang)
  const hasValidCustomer = Boolean(rootPair.ten_cong_ty || rootPair.ten_khach_hang)
  const correspondingWorkflows = buildCorrespondingWorkflowsForEntity(proj, childPipes)
  correspondingWorkflows.forEach((w) => {
    if (w.id_workflow !== 'WF_DEFAULT') wfSet.add(w.id_workflow)
  })
  const customWorkflowCount = correspondingWorkflows.filter(
    (w) => w.scopeType === 'company_custom' || w.scopeType === 'partner_custom'
  ).length
  const customerKey = genMaCT(rootPair.ten_cong_ty || proj.ma_cong_ty || rootPair.ten_khach_hang || proj.ma_khach_hang) || '__NO_CUS__'

  // Distinct partner / SI customers participating in this Project via linked frames or work cards
  const partnerMap = new Map()
  correspondingWorkflows.forEach((w) => {
    if (w.ownerCustomer) {
      const k = genMaCT(w.ownerCustomer)
      if (k && k !== customerKey && !partnerMap.has(k)) {
        partnerMap.set(k, w.ownerCustomer)
      }
    }
  })
  childPipes.forEach((p) => {
    if (!isCardSameAsProjectRootCustomer(p, proj)) {
      const lbl = p.ten_cong_ty || p.ten_khach_hang || ''
      const k = genMaCT(lbl)
      if (k && k !== customerKey && !partnerMap.has(k)) {
        partnerMap.set(k, lbl)
      }
    }
  })

  const partnerCustomerLabels = Array.from(partnerMap.values())
  const partnerCustomerCount = partnerCustomerLabels.length
  const distinctCustomerCount = (hasValidCustomer ? 1 : 0) + partnerCustomerCount

  return {
    ...proj,
    ...rootDisplayPair,
    linked_workflow_ids: normalizeLinkedWorkflowIds(proj.linked_workflow_ids),
    hasValidCustomer,
    customerKey,
    correspondingWorkflows,
    customWorkflowCount,
    partnerCustomerLabels,
    partnerCustomerCount,
    distinctCustomerCount,
    pipelines: childPipes,
    distinctWorkflowCount: wfSet.size,
    totalVolume,
    weightedVolume,
    wonVolume,
    wonCount,
    avgProgress: activeForAvg > 0 ? Math.round(sumProgress / activeForAvg) : 0
  }
}

const allEnrichedProjects = computed(() => projectsList.value.map(buildEnrichedProject))

const getProjectPartyAndFlowMeta = (p) => {
  const customerMap = new Map()
  const companyMap = new Map()
  const rootPair = resolveCompleteCustomerPair(p)
  const rComp = String(p.ten_cong_ty || rootPair.ten_cong_ty || '').trim()
  const rCus = String(p.ten_khach_hang || rootPair.ten_khach_hang || '').trim()
  const rCompK = normFilterKey(rComp)
  const rCusK = normFilterKey(rCus)
  if (rCompK) companyMap.set(rCompK, rComp)
  if (rCusK) customerMap.set(rCusK, rCus)
  if (rCompK && getContactsByCompanyNormKey.value.has(rCompK)) {
    getContactsByCompanyNormKey.value.get(rCompK).forEach((lbl, k) => {
      if (!customerMap.has(k)) customerMap.set(k, lbl)
    })
  }

  ;(p.pipelines || []).forEach((it) => {
    const itComp = String(it.ten_cong_ty || '').trim()
    const itCus = String(it.ten_khach_hang || '').trim()
    if (normFilterKey(itComp)) companyMap.set(normFilterKey(itComp), itComp)
    if (normFilterKey(itCus)) customerMap.set(normFilterKey(itCus), itCus)
  })

  const workflowMap = new Map()
  ;(p.correspondingWorkflows || []).forEach((w) => {
    if (w.id_workflow) {
      workflowMap.set(w.id_workflow, w.name_workflow || w.id_workflow)
    }
    if (w.scopeType === 'company_custom' || w.scopeType === 'partner_custom') {
      const wComp = String(w.ten_cong_ty || '').trim()
      const wCus = String(w.ten_khach_hang || '').trim()
      if (normFilterKey(wComp)) companyMap.set(normFilterKey(wComp), wComp)
      if (normFilterKey(wCus)) customerMap.set(normFilterKey(wCus), wCus)
    }
  })

  return { customerMap, companyMap, workflowMap }
}

const allProjectsFilterMeta = computed(() =>
  allEnrichedProjects.value.map((p) => ({
    project: p,
    ...getProjectPartyAndFlowMeta(p)
  }))
)

const doesProjectEntryMatch = (entry, omitField = '') => {
  const p = entry.project
  const pf = projectFilter.value
  if (omitField !== 'status' && projectStatusFilter.value !== 'Tất cả') {
    if ((p.trang_thai || 'Đang triển khai') !== projectStatusFilter.value) return false
  }
  if (omitField !== 'customer' && pf.customerName) {
    if (!entry.customerMap.has(pf.customerName)) return false
  }
  if (omitField !== 'company' && pf.companyName) {
    if (!entry.companyMap.has(pf.companyName)) return false
  }
  if (omitField !== 'project' && pf.projectId) {
    if (p.id_project !== pf.projectId) return false
  }
  if (omitField !== 'workflow' && pf.workflowId) {
    if (!entry.workflowMap.has(pf.workflowId)) return false
  }
  return true
}

const projCustomerFilterOptions = computed(() => {
  const map = new Map()
  allProjectsFilterMeta.value.forEach((entry) => {
    if (!doesProjectEntryMatch(entry, 'customer')) return
    entry.customerMap.forEach((label, key) => {
      if (!map.has(key)) map.set(key, { key, label, count: 0 })
      map.get(key).count += 1
    })
  })
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'))
})

const filteredProjCustomerOptions = computed(() => {
  const kw = normFilterKey(projFilterSearch.value.customer)
  if (!kw) return projCustomerFilterOptions.value
  return projCustomerFilterOptions.value.filter((o) => normFilterKey(o.label).includes(kw))
})

const projCompanyFilterOptions = computed(() => {
  const map = new Map()
  allProjectsFilterMeta.value.forEach((entry) => {
    if (!doesProjectEntryMatch(entry, 'company')) return
    entry.companyMap.forEach((label, key) => {
      if (!map.has(key)) map.set(key, { key, label, count: 0 })
      map.get(key).count += 1
    })
  })
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'))
})

const filteredProjCompanyOptions = computed(() => {
  const kw = normFilterKey(projFilterSearch.value.company)
  if (!kw) return projCompanyFilterOptions.value
  return projCompanyFilterOptions.value.filter((o) => normFilterKey(o.label).includes(kw))
})

const projProjectFilterOptions = computed(() =>
  allProjectsFilterMeta.value
    .filter((entry) => doesProjectEntryMatch(entry, 'project'))
    .map((entry) => {
      const p = entry.project
      return {
        id_project: p.id_project,
        label: p.ten_du_an,
        sub: p.displayCompanyName || p.displayCustomerName || p.ma_du_an || ''
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'))
)

const filteredProjProjectOptions = computed(() => {
  const kw = normFilterKey(projFilterSearch.value.project)
  if (!kw) return projProjectFilterOptions.value
  return projProjectFilterOptions.value.filter(
    (o) => normFilterKey(o.label).includes(kw) || normFilterKey(o.sub).includes(kw)
  )
})

const projWorkflowFilterOptions = computed(() => {
  const map = new Map()
  allProjectsFilterMeta.value.forEach((entry) => {
    if (!doesProjectEntryMatch(entry, 'workflow')) return
    entry.workflowMap.forEach((label, id_workflow) => {
      if (!map.has(id_workflow)) map.set(id_workflow, { id_workflow, label, count: 0 })
      map.get(id_workflow).count += 1
    })
  })
  return Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.label.localeCompare(b.label, 'vi')
  })
})

const filteredProjWorkflowOptions = computed(() => {
  const kw = normFilterKey(projFilterSearch.value.workflow)
  if (!kw) return projWorkflowFilterOptions.value
  return projWorkflowFilterOptions.value.filter((o) => normFilterKey(o.label).includes(kw))
})

const activeProjCustomerFilterLabel = computed(() => {
  if (!projectFilter.value.customerName) return 'Tất cả KH'
  const found = projCustomerFilterOptions.value.find((o) => o.key === projectFilter.value.customerName)
  if (found) return found.label
  const anyEntry = allProjectsFilterMeta.value.find((e) => e.customerMap.has(projectFilter.value.customerName))
  return anyEntry?.customerMap.get(projectFilter.value.customerName) || 'Đang lọc KH'
})

const activeProjCompanyFilterLabel = computed(() => {
  if (!projectFilter.value.companyName) return 'Tất cả Cty'
  const found = projCompanyFilterOptions.value.find((o) => o.key === projectFilter.value.companyName)
  if (found) return found.label
  const anyEntry = allProjectsFilterMeta.value.find((e) => e.companyMap.has(projectFilter.value.companyName))
  return anyEntry?.companyMap.get(projectFilter.value.companyName) || 'Đang lọc Cty'
})

const activeProjProjectFilterLabel = computed(() => {
  if (!projectFilter.value.projectId) return 'Tất cả Dự án'
  const found = projectsList.value.find((p) => p.id_project === projectFilter.value.projectId)
  return found ? found.ten_du_an : 'Đang lọc Dự án'
})

const activeProjWorkflowFilterLabel = computed(() => {
  if (!projectFilter.value.workflowId) return 'Tất cả Khung'
  if (projectFilter.value.workflowId === 'WF_DEFAULT') return 'Workflow Chuẩn Hệ Thống'
  const found = uniqueWorkflows.value.find((w) => w.id_workflow === projectFilter.value.workflowId)
  return found ? found.name_workflow : projectFilter.value.workflowId
})

const reconcileProjCascadingFilters = (changedField) => {
  const pf = projectFilter.value
  if (changedField !== 'project' && pf.projectId) {
    if (!projProjectFilterOptions.value.some((o) => o.id_project === pf.projectId)) {
      pf.projectId = ''
    }
  }
  if (changedField !== 'company' && pf.companyName) {
    if (!projCompanyFilterOptions.value.some((o) => o.key === pf.companyName)) {
      pf.companyName = ''
    }
  }
  if (changedField !== 'customer' && pf.customerName) {
    if (!projCustomerFilterOptions.value.some((o) => o.key === pf.customerName)) {
      pf.customerName = ''
    }
  }
  if (changedField !== 'workflow' && pf.workflowId) {
    if (!projWorkflowFilterOptions.value.some((o) => o.id_workflow === pf.workflowId)) {
      pf.workflowId = ''
    }
  }
}

const selectProjCustomerFilter = (keyVal) => {
  projectFilter.value.customerName = keyVal || ''
  openProjFilterMenu.value = ''
  projFilterSearch.value.customer = ''
  reconcileProjCascadingFilters('customer')
}

const selectProjCompanyFilter = (keyVal) => {
  projectFilter.value.companyName = keyVal || ''
  openProjFilterMenu.value = ''
  projFilterSearch.value.company = ''
  reconcileProjCascadingFilters('company')
}

const selectProjProjectFilter = (projId) => {
  projectFilter.value.projectId = projId || ''
  openProjFilterMenu.value = ''
  projFilterSearch.value.project = ''
  reconcileProjCascadingFilters('project')
}

const selectProjWorkflowFilter = (wfId) => {
  projectFilter.value.workflowId = wfId || ''
  openProjFilterMenu.value = ''
  projFilterSearch.value.workflow = ''
  reconcileProjCascadingFilters('workflow')
}

const enrichedProjects = computed(() => {
  let list = allProjectsFilterMeta.value
    .filter((entry) => doesProjectEntryMatch(entry))
    .map((entry) => entry.project)

  const kw = projectSearchQuery.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (p) =>
        p.ten_du_an.toLowerCase().includes(kw) ||
        (p.ma_du_an && p.ma_du_an.toLowerCase().includes(kw)) ||
        (p.displayCompanyName && p.displayCompanyName.toLowerCase().includes(kw)) ||
        (p.displayCustomerName && p.displayCustomerName.toLowerCase().includes(kw)) ||
        (p.ten_cong_ty && p.ten_cong_ty.toLowerCase().includes(kw)) ||
        (p.ten_khach_hang && p.ten_khach_hang.toLowerCase().includes(kw)) ||
        (p.AM && p.AM.toLowerCase().includes(kw)) ||
        p.partnerCustomerLabels.some((lbl) => lbl.toLowerCase().includes(kw)) ||
        p.correspondingWorkflows.some(
          (w) =>
            w.name_workflow.toLowerCase().includes(kw) ||
            (w.displayCompanyName && w.displayCompanyName.toLowerCase().includes(kw)) ||
            (w.displayCustomerName && w.displayCustomerName.toLowerCase().includes(kw)) ||
            (w.ownerCustomer && w.ownerCustomer.toLowerCase().includes(kw))
        )
    )
  }
  return list
})

const hasActiveProjectFilters = computed(() =>
  Boolean(
    projectSearchQuery.value.trim() ||
    projectStatusFilter.value !== 'Tất cả' ||
    projectFilter.value.customerName ||
    projectFilter.value.companyName ||
    projectFilter.value.projectId ||
    projectFilter.value.workflowId
  )
)

const resetProjectFilters = () => {
  projectSearchQuery.value = ''
  projectStatusFilter.value = 'Tất cả'
  openProjFilterMenu.value = ''
  projFilterSearch.value = { customer: '', company: '', project: '', workflow: '' }
  projectFilter.value = {
    customerName: '',
    companyName: '',
    projectId: '',
    workflowId: ''
  }
}

const filteredProjectKpis = computed(() => {
  const list = enrichedProjects.value
  let boundPipesCount = 0
  let totalWorkflowLinks = 0
  let totalVolume = 0
  let weightedVolume = 0
  let wonVolume = 0
  let wonPipesCount = 0
  let sumEffectiveProg = 0

  list.forEach((p) => {
    boundPipesCount += p.pipelines.length
    totalWorkflowLinks += (p.correspondingWorkflows || []).length
    totalVolume += p.totalVolume
    weightedVolume += p.weightedVolume
    wonVolume += p.wonVolume
    wonPipesCount += p.wonCount
    sumEffectiveProg += p.trang_thai === 'Hoàn thành' ? 100 : (p.avgProgress || 0)
  })

  const count = list.length
  const activeCount = list.filter((p) => (p.trang_thai || 'Đang triển khai') === 'Đang triển khai').length
  const doneCount = list.filter((p) => p.trang_thai === 'Hoàn thành').length

  return {
    count,
    activeCount,
    doneCount,
    boundPipesCount,
    totalWorkflowLinks,
    totalVolume,
    weightedVolume,
    wonVolume,
    wonPipesCount,
    avgProgress: count > 0 ? Math.round(sumEffectiveProg / count) : 0
  }
})

const getProjectCardToneClass = (proj) => {
  const st = proj?.trang_thai || 'Đang triển khai'
  if (st === 'Hoàn thành') return 'is-done-proj'
  if (st === 'Tạm dừng') return 'is-paused-proj'
  return 'is-active-proj'
}

const updateProjectQuickStatus = async (proj, nextStatus) => {
  if (!proj || !nextStatus) return
  const curStatus = proj.trang_thai || 'Đang triển khai'
  if (curStatus === nextStatus) return
  const idx = projectsList.value.findIndex((p) => p.id_project === proj.id_project)
  if (idx === -1) return

  const nowStr = getCurrentFormattedTime()
  projectsList.value[idx] = {
    ...projectsList.value[idx],
    trang_thai: nextStatus,
    last_updated: nowStr
  }

  try {
    await update(dbRef(database, `pipeline_projects/${sanitizeFirebaseKey(proj.id_project)}`), {
      trang_thai: nextStatus,
      last_updated: nowStr
    })
    showToast(
      nextStatus === 'Hoàn thành'
        ? `Dự án "${proj.ten_du_an}" đã chuyển sang Hoàn thành!`
        : `Đã chuyển trạng thái Dự án sang: ${nextStatus}`,
      nextStatus === 'Hoàn thành' ? 'success' : 'info'
    )
  } catch (err) {
    console.error('Lỗi cập nhật nhanh trạng thái dự án:', err)
    showToast('Lỗi mạng khi cập nhật trạng thái Dự án', 'error')
    fetchData()
  }
}

const getProjectStatusPillClass = (proj) => {
  const st = proj?.trang_thai || 'Đang triển khai'
  if (st === 'Hoàn thành') return 'is-emerald'
  if (st === 'Tạm dừng') return 'is-amber'
  return 'is-sky'
}

const formatProjectDeadline = (raw) => {
  if (!raw) return ''
  const str = String(raw).trim()
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`
  }
  return str
}

const isProjectOverdue = (proj) => {
  if (!proj || !proj.deadline || proj.trang_thai === 'Hoàn thành') return false
  const str = String(proj.deadline).trim()
  let targetDate = null
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const vnMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (isoMatch) {
    targetDate = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]), 23, 59, 59)
  } else if (vnMatch) {
    targetDate = new Date(Number(vnMatch[3]), Number(vnMatch[2]) - 1, Number(vnMatch[1]), 23, 59, 59)
  }
  if (!targetDate || isNaN(targetDate.getTime())) return false
  return targetDate.getTime() < Date.now()
}

const getProjWfScopeBadge = (wf) => {
  if (!wf) return { label: 'Chuẩn', cls: 'is-slate' }
  if (wf.scopeType === 'company_custom') return { label: 'KH Gốc', cls: 'is-emerald' }
  if (wf.scopeType === 'partner_custom') return { label: 'Đối tác', cls: 'is-amber' }
  if (wf.scopeType === 'blueprint') return { label: 'Mẫu', cls: 'is-sky' }
  return { label: 'Chuẩn', cls: 'is-slate' }
}

const getProjWfDisplaySteps = (wf) => {
  if (!wf) return []
  const source = wf.stepsWithCounts && wf.stepsWithCounts.length > 0 ? wf.stepsWithCounts : wf.flowSteps || []
  return source.filter((s) => (s.id !== 'hoan_thanh' && s.id !== 'that_bai') || s.activeCount > 0)
}

const projectKpis = computed(() => {
  const all = allEnrichedProjects.value
  let totalBoundPipelines = 0
  let totalVolume = 0
  let weightedVolume = 0
  let wonVolume = 0
  let wonPipelinesCount = 0

  all.forEach((p) => {
    totalBoundPipelines += p.pipelines.length
    totalVolume += p.totalVolume
    weightedVolume += p.weightedVolume
    wonVolume += p.wonVolume
    wonPipelinesCount += p.wonCount
  })

  return {
    totalProjects: all.length,
    activeProjects: all.filter((p) => (p.trang_thai || 'Đang triển khai') === 'Đang triển khai').length,
    totalBoundPipelines,
    standalonePipelines: items.value.filter((i) => !i.id_project).length,
    totalVolume,
    weightedVolume,
    wonVolume,
    wonPipelinesCount
  }
})

const activeProjectDetail = computed(() => {
  if (!activeProjectId.value) return null
  const found = allEnrichedProjects.value.find((p) => p.id_project === activeProjectId.value)
  return found || null
})

const filteredProjectDetailPipelines = computed(() => {
  const detail = activeProjectDetail.value
  if (!detail) return []
  if (projectDetailWfFilter.value === 'ALL') return detail.pipelines
  return detail.pipelines.filter((p) => (p.id_workflow || 'WF_DEFAULT') === projectDetailWfFilter.value)
})

const displayedProjectDetailPipelines = computed(() => {
  const base = filteredProjectDetailPipelines.value
  const kw = projectDetailPipeSearch.value.trim().toLowerCase()
  if (!kw) return base
  return base.filter(
    (p) =>
      (p.content_of_contract_po && p.content_of_contract_po.toLowerCase().includes(kw)) ||
      (p.ma_hop_dong && p.ma_hop_dong.toLowerCase().includes(kw)) ||
      (p.ten_cong_ty && p.ten_cong_ty.toLowerCase().includes(kw)) ||
      (p.ten_khach_hang && p.ten_khach_hang.toLowerCase().includes(kw)) ||
      (p.AM && p.AM.toLowerCase().includes(kw)) ||
      (p.type && p.type.toLowerCase().includes(kw)) ||
      (p.ghi_chu_hop_dong && p.ghi_chu_hop_dong.toLowerCase().includes(kw))
  )
})

const focusedProjectPipe = computed(() => {
  if (!focusedProjectPipeId.value) return null
  return filteredProjectDetailPipelines.value.find((p) => p.Id_pipeline === focusedProjectPipeId.value) || null
})

const activeProjectWfFilterLabel = computed(() => {
  if (projectDetailWfFilter.value === 'ALL') return 'Tất cả Khung'
  const detail = activeProjectDetail.value
  const found = detail?.correspondingWorkflows?.find((w) => w.id_workflow === projectDetailWfFilter.value)
  return found?.name_workflow || getWorkflowShortLabel(projectDetailWfFilter.value)
})

const selectProjectDetailWorkflow = (wfId) => {
  projectDetailWfFilter.value = wfId || 'ALL'
  openProjPipeStageMenuId.value = ''
  if (focusedProjectPipeId.value) {
    const stillVisible =
      projectDetailWfFilter.value === 'ALL'
        ? activeProjectDetail.value?.pipelines?.some((p) => p.Id_pipeline === focusedProjectPipeId.value)
        : activeProjectDetail.value?.pipelines?.some(
            (p) =>
              p.Id_pipeline === focusedProjectPipeId.value &&
              (p.id_workflow || 'WF_DEFAULT') === projectDetailWfFilter.value
          )
    if (!stillVisible) focusedProjectPipeId.value = ''
  }
  if (isMobile.value || (typeof window !== 'undefined' && window.innerWidth <= 1100)) {
    isProjLeftRailOpen.value = false
  }
}

const toggleFocusProjectPipe = (pipeId) => {
  openProjPipeStageMenuId.value = ''
  focusedProjectPipeId.value = focusedProjectPipeId.value === pipeId ? '' : pipeId
}

const buildHubFromPipes = (pipeList = []) => {
  const repIdSet = new Set()
  const repParentMap = new Map()
  const filesArr = []
  const seenFileUrls = new Set()

  const pushHubFile = (f, sourceLabel) => {
    if (!f || !f.url || seenFileUrls.has(f.url)) return
    seenFileUrls.add(f.url)
    const kind = f.kind || detectReportAttachmentKind(f.url, f.name, 'direct')
    filesArr.push({ ...f, kind, sourceLabel })
  }

  pipeList.forEach((pipe) => {
    const label = pipe.content_of_contract_po || pipe.ma_hop_dong || pipe.Id_pipeline
    getPipeReportIds(pipe).forEach((id) => {
      repIdSet.add(id)
      if (!repParentMap.has(id)) repParentMap.set(id, [])
      const arr = repParentMap.get(id)
      if (!arr.includes(label)) arr.push(label)
    })
    getParsedFiles(pipe).forEach((f) => {
      pushHubFile(f, label)
    })
  })

  const linkedReps = Array.from(repIdSet)
    .map((id) => {
      const base = reports.value.find((r) => r.id === id) || { id, noi_dung: id, thoi_gian: '', ghi_chu: '' }
      const parentLabels = repParentMap.get(id) || []
      const srcTag = `Report #${id}${parentLabels.length > 0 ? ' (' + parentLabels.join(', ') + ')' : ''}`
      getReportAttachedFiles(base).forEach((rf) => pushHubFile(rf, srcTag))
      getReportAttachedImages(base).forEach((ri) => pushHubFile(ri, srcTag))
      return {
        ...base,
        parentPipeLabels: parentLabels
      }
    })
    .filter(Boolean)

  return { reports: linkedReps, files: filesArr }
}

const activeProjectHub = computed(() => {
  const detail = activeProjectDetail.value
  if (!detail) return { reports: [], files: [] }
  return buildHubFromPipes(detail.pipelines)
})

const scopedProjectHub = computed(() => {
  const detail = activeProjectDetail.value
  if (!detail) return { reports: [], files: [] }
  if (focusedProjectPipe.value) return buildHubFromPipes([focusedProjectPipe.value])
  return buildHubFromPipes(filteredProjectDetailPipelines.value)
})

const attachableWorkflowsForProject = computed(() => {
  const detail = activeProjectDetail.value
  if (!detail) return []
  const rootFlowSet = new Set(
    detail.correspondingWorkflows.filter((w) => w.isRootCustomerFlow).map((w) => w.id_workflow)
  )
  const linkedSet = new Set(normalizeLinkedWorkflowIds(detail.linked_workflow_ids))
  const kw = manageWfSearch.value.trim().toLowerCase()
  const scopeFilter = manageWfScopeFilter.value

  return uniqueWorkflows.value
    .filter((wf) => {
      if (!wf.id_workflow || wf.id_workflow === 'WF_DEFAULT') return false
      if (scopeFilter === 'customer' && wf.workflow_scope !== 'customer') return false
      if (scopeFilter === 'template' && wf.workflow_scope === 'customer') return false
      if (!kw) return true
      return (
        (wf.name_workflow && wf.name_workflow.toLowerCase().includes(kw)) ||
        (wf.ten_cong_ty && wf.ten_cong_ty.toLowerCase().includes(kw)) ||
        (wf.ten_khach_hang && wf.ten_khach_hang.toLowerCase().includes(kw)) ||
        wf.id_workflow.toLowerCase().includes(kw)
      )
    })
    .map((wf) => {
      const stepCount = workflowsData.value.filter((r) => r.id_workflow === wf.id_workflow).length
      return {
        ...wf,
        stepCount,
        isAutoRootFlow: rootFlowSet.has(wf.id_workflow),
        isLinkedToProject: linkedSet.has(wf.id_workflow)
      }
    })
})

const attachWorkflowToProject = async (proj, wfId) => {
  if (!proj || !wfId) return
  const targetIdx = projectsList.value.findIndex((p) => p.id_project === proj.id_project)
  if (targetIdx === -1) return

  const cur = normalizeLinkedWorkflowIds(projectsList.value[targetIdx].linked_workflow_ids)
  if (cur.includes(wfId)) return

  const nextIds = [...cur, wfId]
  const nowStr = getCurrentFormattedTime()
  projectsList.value[targetIdx] = {
    ...projectsList.value[targetIdx],
    linked_workflow_ids: nextIds,
    last_updated: nowStr
  }

  try {
    await update(dbRef(database, `pipeline_projects/${sanitizeFirebaseKey(proj.id_project)}`), {
      linked_workflow_ids: nextIds,
      last_updated: nowStr
    })
    showToast('Đã gắn Workflow vào Dự án!', 'success')
  } catch (err) {
    console.error('Lỗi gắn workflow vào dự án:', err)
    showToast('Lỗi mạng khi gắn Workflow', 'error')
    fetchData()
  }
}

const detachWorkflowFromProject = async (proj, wfId) => {
  if (!proj || !wfId) return
  const targetIdx = projectsList.value.findIndex((p) => p.id_project === proj.id_project)
  if (targetIdx === -1) return

  const cur = normalizeLinkedWorkflowIds(projectsList.value[targetIdx].linked_workflow_ids)
  const nextIds = cur.filter((id) => id !== wfId)
  const nowStr = getCurrentFormattedTime()
  const nextDefault =
    projectsList.value[targetIdx].default_workflow_id === wfId
      ? ''
      : projectsList.value[targetIdx].default_workflow_id

  projectsList.value[targetIdx] = {
    ...projectsList.value[targetIdx],
    linked_workflow_ids: nextIds,
    default_workflow_id: nextDefault,
    last_updated: nowStr
  }

  if (projectDetailWfFilter.value === wfId) {
    projectDetailWfFilter.value = 'ALL'
  }

  try {
    await update(dbRef(database, `pipeline_projects/${sanitizeFirebaseKey(proj.id_project)}`), {
      linked_workflow_ids: nextIds,
      default_workflow_id: nextDefault,
      last_updated: nowStr
    })
    showToast('Đã gỡ Workflow khỏi Dự án', 'info')
  } catch (err) {
    console.error('Lỗi gỡ workflow khỏi dự án:', err)
    showToast('Lỗi mạng khi gỡ Workflow', 'error')
    fetchData()
  }
}

// =========================================================
// RIGHT COLUMN (4/10) KHO FLOW (2 MỤC: WORKFLOW KHÁCH HÀNG & WORKFLOW KHO) + DUPLICATE HIGHLIGHT
// =========================================================
const paletteScopeTab = ref('customer')
const paletteWfSearch = ref('')
const showPaletteQuickCreate = ref(false)
const draggingWorkflow = ref(null)
const dragOverProjectId = ref('')
const highlightedProjWfKey = ref('')
let highlightedProjWfTimer = null

const buildPaletteWfEntry = (wf) => {
  const wfPair =
    wf.workflow_scope === 'customer'
      ? resolveCompleteCustomerPair({
          ma_khach_hang: wf.ma_khach_hang || '',
          ma_cong_ty: wf.ma_cong_ty || '',
          ten_cong_ty: wf.ten_cong_ty || '',
          ten_khach_hang: wf.ten_khach_hang || ''
        })
      : { ten_cong_ty: '', ten_khach_hang: '' }
  const distinctPair = formatDistinctCustomerPair(wfPair.ten_cong_ty, wfPair.ten_khach_hang)
  const allCols = getColumnsForWorkflow(wf.id_workflow)
  const coreSteps = allCols.filter((c) => c.id !== 'hoan_thanh' && c.id !== 'that_bai')
  return {
    ...wf,
    ...distinctPair,
    flowSteps: coreSteps.length > 0 ? coreSteps : allCols
  }
}

const paletteCustomerList = computed(() => {
  return uniqueWorkflows.value
    .filter((wf) => wf.id_workflow && wf.id_workflow !== 'WF_DEFAULT' && wf.workflow_scope === 'customer')
    .map(buildPaletteWfEntry)
    .sort((a, b) => {
      const compA = a.displayCompanyName || a.displayCustomerName || ''
      const compB = b.displayCompanyName || b.displayCustomerName || ''
      const cmp = compA.localeCompare(compB, 'vi')
      if (cmp !== 0) return cmp
      return (a.name_workflow || '').localeCompare(b.name_workflow || '', 'vi')
    })
})

const paletteLibraryList = computed(() => {
  const defaultCols = getColumnsForWorkflow('WF_DEFAULT')
  const defaultCoreSteps = defaultCols.filter((c) => c.id !== 'hoan_thanh' && c.id !== 'that_bai')
  const systemStandardEntry = {
    id_workflow: 'WF_DEFAULT',
    name_workflow: 'Workflow Chuẩn Hệ Thống',
    workflow_scope: 'template',
    displayCompanyName: '',
    displayCustomerName: '',
    flowSteps: defaultCoreSteps.length > 0 ? defaultCoreSteps : defaultCols
  }

  const customLibraryList = uniqueWorkflows.value
    .filter((wf) => wf.id_workflow && wf.id_workflow !== 'WF_DEFAULT' && wf.workflow_scope !== 'customer')
    .map(buildPaletteWfEntry)
    .sort((a, b) => (a.name_workflow || '').localeCompare(b.name_workflow || '', 'vi'))

  return [systemStandardEntry, ...customLibraryList]
})

const paletteTotalCount = computed(() => paletteCustomerList.value.length + paletteLibraryList.value.length)

const filteredPaletteWorkflows = computed(() => {
  const activeSource = paletteScopeTab.value === 'customer' ? paletteCustomerList.value : paletteLibraryList.value
  const kw = paletteWfSearch.value.trim().toLowerCase()
  if (!kw) return activeSource
  return activeSource.filter(
    (w) =>
      (w.name_workflow && w.name_workflow.toLowerCase().includes(kw)) ||
      (w.displayCompanyName && w.displayCompanyName.toLowerCase().includes(kw)) ||
      (w.displayCustomerName && w.displayCustomerName.toLowerCase().includes(kw)) ||
      (w.ten_cong_ty && w.ten_cong_ty.toLowerCase().includes(kw)) ||
      (w.ten_khach_hang && w.ten_khach_hang.toLowerCase().includes(kw)) ||
      (w.flowSteps || []).some((st) => (st.value || st.label || '').toLowerCase().includes(kw))
  )
})

const isWorkflowAlreadyInProject = (proj, wfId) => {
  if (!proj || !wfId) return false
  return (proj.correspondingWorkflows || []).some((w) => w.id_workflow === wfId)
}

const triggerHighlightDuplicateProjWorkflow = (proj, wfId) => {
  if (!proj || !wfId) return
  const matchedWf =
    (proj.correspondingWorkflows || []).find((w) => w.id_workflow === wfId) ||
    uniqueWorkflows.value.find((w) => w.id_workflow === wfId)
  const wfLabel =
    matchedWf?.name_workflow ||
    (wfId === 'WF_DEFAULT' ? 'Workflow Chuẩn Hệ Thống' : wfId)

  showToast(`Dự án "${proj.ten_du_an}" đã có sẵn Workflow "${wfLabel}"!`, 'warning', 3200)

  if (highlightedProjWfTimer) {
    clearTimeout(highlightedProjWfTimer)
    highlightedProjWfTimer = null
  }

  highlightedProjWfKey.value = ''
  nextTick(() => {
    const key = `${proj.id_project}::${wfId}`
    highlightedProjWfKey.value = key
    if (typeof document !== 'undefined') {
      const domEl = document.getElementById(`proj-wf-card-${proj.id_project}-${wfId}`)
      if (domEl && typeof domEl.scrollIntoView === 'function') {
        domEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
    highlightedProjWfTimer = setTimeout(() => {
      if (highlightedProjWfKey.value === key) {
        highlightedProjWfKey.value = ''
      }
    }, 2800)
  })
}

const onPaletteWfDragStart = (event, wf) => {
  draggingWorkflow.value = wf
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', wf.id_workflow)
  }
}

const onPaletteWfDragEnd = () => {
  draggingWorkflow.value = null
  dragOverProjectId.value = ''
}

const onProjectDragEnter = (proj) => {
  if (!draggingWorkflow.value || !proj) return
  dragOverProjectId.value = proj.id_project
}

const onProjectDragOver = (event, proj) => {
  if (!draggingWorkflow.value || !proj) return
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  if (dragOverProjectId.value !== proj.id_project) {
    dragOverProjectId.value = proj.id_project
  }
}

const onProjectDragLeave = (event, proj) => {
  if (!proj) return
  const currentTarget = event.currentTarget
  const related = event.relatedTarget
  if (currentTarget && related && currentTarget.contains(related)) {
    return
  }
  if (dragOverProjectId.value === proj.id_project) {
    dragOverProjectId.value = ''
  }
}

const onProjectDrop = async (event, proj) => {
  const wfId =
    draggingWorkflow.value?.id_workflow ||
    event.dataTransfer?.getData('text/plain') ||
    ''
  dragOverProjectId.value = ''
  draggingWorkflow.value = null
  if (!wfId || !proj) return

  if (isWorkflowAlreadyInProject(proj, wfId)) {
    triggerHighlightDuplicateProjWorkflow(proj, wfId)
    return
  }
  await attachWorkflowToProject(proj, wfId)
}

const onMobileQuickAttachSelect = async (event, wfId) => {
  const projId = event.target.value
  event.target.value = ''
  if (!projId || !wfId) return
  const proj = allEnrichedProjects.value.find((p) => p.id_project === projId)
  if (!proj) return
  if (isWorkflowAlreadyInProject(proj, wfId)) {
    triggerHighlightDuplicateProjWorkflow(proj, wfId)
    return
  }
  await attachWorkflowToProject(proj, wfId)
}

const handleQuickDetachFlowFromCard = async (proj, wf) => {
  if (!proj || !wf) return
  if (wf.pipeCount > 0) {
    const ok = await askConfirm({
      title: 'Gỡ Workflow khỏi Dự án?',
      targetTag: 'WORKFLOW',
      targetValue: wf.name_workflow,
      message: `Workflow này đang có ${wf.pipeCount} công việc thuộc dự án "${proj.ten_du_an}". Nếu gỡ liên kết, Workflow vẫn còn hiển thị khi còn công việc gắn với dự án.`,
      tone: 'warning',
      confirmText: 'Vẫn gỡ liên kết',
      cancelText: 'Hủy'
    })
    if (!ok) return
  }
  await detachWorkflowFromProject(proj, wf.id_workflow)
}

const submitQuickWorkflowForProject = async (proj = null) => {
  const isLibraryCreate = !proj && paletteScopeTab.value === 'library'
  const tenCongTy = isLibraryCreate ? '' : String(quickProjWfForm.value.ten_cong_ty || '').trim()
  const tenKhachHang = isLibraryCreate ? '' : String(quickProjWfForm.value.ten_khach_hang || '').trim()

  if (!isLibraryCreate && !tenCongTy && !tenKhachHang) {
    showToast('Mỗi Workflow Khách hàng phải gắn 1 Công ty / Khách hàng! Vui lòng chọn hoặc nhập KH.', 'error')
    return
  }

  const rawName = String(quickProjWfForm.value.name_workflow || '').trim()
  if (isLibraryCreate && !rawName) {
    showToast('Vui lòng nhập Tên Workflow Kho!', 'error')
    return
  }

  const wfName =
    rawName ||
    (proj ? `${tenCongTy || tenKhachHang} — ${proj.ten_du_an}` : `Workflow — ${tenCongTy || tenKhachHang}`)

  const maCT = isLibraryCreate ? '' : genMaCT(tenCongTy)
  const maKH = isLibraryCreate ? '' : (quickProjWfForm.value.ma_khach_hang || genMaKH(tenKhachHang, tenCongTy))
  const cleanCode = (maCT || maKH || 'CUS').replace(/[^A-Z0-9_]/gi, '').slice(0, 14) || 'CUS'
  const newWfId = isLibraryCreate ? `WF_TPL_${Date.now()}` : `WF_CUS_${cleanCode}_${Date.now()}`

  const baseTplId = quickProjWfForm.value.base_template_id || 'WF_DEFAULT'
  let seedSteps = []
  let sourceTplName = 'Workflow Chuẩn Hệ Thống'

  if (baseTplId !== 'WF_DEFAULT') {
    const tplRows = workflowsData.value
      .filter((r) => r.id_workflow === baseTplId)
      .sort((a, b) => (parseInt(a.status_index, 10) || 0) - (parseInt(b.status_index, 10) || 0))
    if (tplRows.length > 0) {
      sourceTplName = tplRows[0].name_workflow || baseTplId
      seedSteps = tplRows.map((r, idx) => ({
        percent: r['%status'] || '0%',
        status_name: r.status_name,
        status_index: idx + 1,
        status_color: r.status_color || '#3b82f6'
      }))
    }
  }

  if (seedSteps.length === 0) {
    seedSteps = defaultColumns
      .filter((c) => c.id !== 'hoan_thanh' && c.id !== 'that_bai')
      .map((c, idx) => ({
        percent: c.percent,
        status_name: c.value,
        status_index: idx + 1,
        status_color: c.color
      }))
  }

  const existingCompanyFlows = isLibraryCreate
    ? { hasCustom: true }
    : resolveCompanyWorkflows({
        ma_khach_hang: maKH,
        ma_cong_ty: maCT,
        ten_cong_ty: tenCongTy,
        ten_khach_hang: tenKhachHang
      })
  const makeDefaultForCompany = !isLibraryCreate && !existingCompanyFlows.hasCustom

  savingQuickProjWf.value = true
  try {
    const wfUpdates = {}
    const createdRecords = []
    seedSteps.forEach((st, idx) => {
      const idStatus = `${newWfId}_ST_${idx + 1}`
      const rec = {
        id_workflow: newWfId,
        id_status_workflow: idStatus,
        name_workflow: wfName,
        '%status': st.percent,
        status_name: st.status_name,
        status_index: idx + 1,
        status_color: st.status_color,
        workflow_scope: isLibraryCreate ? 'template' : 'customer',
        ma_khach_hang: maKH,
        ma_cong_ty: maCT,
        ten_khach_hang: tenKhachHang,
        ten_cong_ty: tenCongTy,
        is_company_default: makeDefaultForCompany,
        source_template_id: baseTplId,
        source_template_name: sourceTplName
      }
      wfUpdates[sanitizeFirebaseKey(idStatus)] = rec
      createdRecords.push(rec)
    })

    workflowsData.value.push(...createdRecords)
    await update(dbRef(database, 'pipeline_workflow'), wfUpdates)
    if (proj) {
      await attachWorkflowToProject(proj, newWfId)
    }

    quickProjWfForm.value = {
      ten_cong_ty: '',
      ten_khach_hang: '',
      ma_cong_ty: '',
      ma_khach_hang: '',
      base_template_id: 'WF_DEFAULT',
      name_workflow: ''
    }
    manageWfDrawerMode.value = 'attach'
    if (proj) {
      showManageProjectWfDrawer.value = false
    }
    showPaletteQuickCreate.value = false
    showToast(
      proj
        ? `Đã tạo Workflow "${wfName}" & gắn vào Dự án!`
        : `Đã tạo Workflow "${wfName}" — Kéo thả vào Dự án bên trái để gắn!`,
      'success'
    )
  } catch (err) {
    console.error('Lỗi tạo nhanh workflow:', err)
    showToast('Lỗi khi tạo Workflow mới', 'error')
    fetchData()
  } finally {
    savingQuickProjWf.value = false
  }
}

const attachablePipelines = computed(() => {
  const detail = activeProjectDetail.value
  if (!detail) return []
  const kw = attachPipelineSearch.value.trim().toLowerCase()
  const projCT = genMaCT(detail.ten_cong_ty || detail.ma_cong_ty)
  const projKH = genMaCT(detail.ten_khach_hang || detail.ma_khach_hang)

  return items.value.filter((it) => {
    if (it.id_project === detail.id_project) return false
    if (attachSameCustomerOnly.value && (projCT || projKH)) {
      const itCT = genMaCT(it.ten_cong_ty || it.ma_cong_ty)
      const itKH = genMaCT(it.ten_khach_hang || it.ma_khach_hang)
      const sameCT = projCT && itCT && projCT === itCT
      const sameKH = !projCT && projKH && itKH && projKH === itKH
      if (!sameCT && !sameKH) return false
    }
    if (!kw) return true
    return (
      (it.content_of_contract_po && it.content_of_contract_po.toLowerCase().includes(kw)) ||
      (it.ten_cong_ty && it.ten_cong_ty.toLowerCase().includes(kw)) ||
      (it.ten_khach_hang && it.ten_khach_hang.toLowerCase().includes(kw)) ||
      (it.ma_hop_dong && it.ma_hop_dong.toLowerCase().includes(kw))
    )
  })
})

const getProjectStatusTone = (status) => {
  if (status === 'Hoàn thành') return 'is-emerald'
  if (status === 'Tạm dừng') return 'is-amber'
  if (status === 'Huỷ') return 'is-rose'
  return 'is-sky'
}

const openAddProjectModal = (prefillCustomer = null) => {
  isEditingProject.value = false
  showProjectFormWfPicker.value = false
  projectFormWfSearch.value = ''
  let initCustomer = prefillCustomer
  if (!initCustomer) {
    const activeCompKey =
      activeTab.value === 'projects'
        ? projectFilter.value.companyName || filterConfig.value.companyName
        : filterConfig.value.companyName || projectFilter.value.companyName
    const activeCusKey =
      activeTab.value === 'projects'
        ? projectFilter.value.customerName || filterConfig.value.customerName
        : filterConfig.value.customerName || projectFilter.value.customerName

    if (activeCompKey || activeCusKey) {
      const compText = activeCompKey
        ? activeTab.value === 'projects' && projectFilter.value.companyName
          ? activeProjCompanyFilterLabel.value
          : activeKanbanCompanyFilterLabel.value
        : ''
      const cusText = activeCusKey
        ? activeTab.value === 'projects' && projectFilter.value.customerName
          ? activeProjCustomerFilterLabel.value
          : activeKanbanCustomerFilterLabel.value
        : ''
      const pair = resolveCompleteCustomerPair({
        ten_cong_ty: compText,
        ten_khach_hang: cusText
      })
      initCustomer = {
        ma_khach_hang: genMaKH(pair.ten_khach_hang, pair.ten_cong_ty),
        ten_khach_hang: pair.ten_khach_hang || '',
        ma_cong_ty: genMaCT(pair.ten_cong_ty),
        ten_cong_ty: pair.ten_cong_ty || ''
      }
    }
  }

  projectForm.value = {
    ...defaultProjectForm,
    ma_khach_hang: initCustomer?.ma_khach_hang || '',
    ten_khach_hang: initCustomer?.ten_khach_hang || '',
    ma_cong_ty: initCustomer?.ma_cong_ty || '',
    ten_cong_ty: initCustomer?.ten_cong_ty || '',
    default_workflow_id: '',
    linked_workflow_ids: []
  }
  showProjectFormModal.value = true
}

const openEditProjectModal = (proj) => {
  isEditingProject.value = true
  showProjectFormWfPicker.value = false
  projectFormWfSearch.value = ''
  projectForm.value = {
    id_project: proj.id_project,
    ma_du_an: proj.ma_du_an || '',
    ten_du_an: proj.ten_du_an || '',
    ma_khach_hang: proj.ma_khach_hang || '',
    ten_khach_hang: proj.ten_khach_hang || '',
    ma_cong_ty: proj.ma_cong_ty || '',
    ten_cong_ty: proj.ten_cong_ty || '',
    default_workflow_id: proj.default_workflow_id || '',
    linked_workflow_ids: normalizeLinkedWorkflowIds(proj.linked_workflow_ids),
    AM: proj.AM || 'Sơn',
    ngan_sach_du_kien: proj.ngan_sach_du_kien ?? '',
    deadline: proj.deadline || '',
    trang_thai: proj.trang_thai || 'Đang triển khai',
    ghi_chu: proj.ghi_chu || '',
    created_time: proj.created_time || ''
  }
  showProjectFormModal.value = true
}

const openQuickProjectFromPipelineModal = () => {
  openAddProjectModal({
    ma_khach_hang: formData.value.ma_khach_hang,
    ten_khach_hang: formData.value.ten_khach_hang,
    ma_cong_ty: formData.value.ma_cong_ty,
    ten_cong_ty: formData.value.ten_cong_ty
  })
}

const saveProjectForm = async () => {
  const tenCongTy = String(projectForm.value.ten_cong_ty || '').trim()
  const tenKhachHang = String(projectForm.value.ten_khach_hang || '').trim()
  if (!tenCongTy && !tenKhachHang) {
    showToast('Dự án bắt buộc phải có 1 Khách hàng / Chủ đầu tư gốc! Vui lòng chọn từ danh bạ hoặc nhập KH.', 'error')
    return
  }

  const title = String(projectForm.value.ten_du_an || '').trim()
  if (!title) {
    showToast('Vui lòng nhập Tên Dự Án!', 'error')
    return
  }

  const nowStr = getCurrentFormattedTime()
  const isEdit = isEditingProject.value
  const idProj = isEdit ? projectForm.value.id_project : `PRJ_${Date.now()}`
  const autoCode = `DA-${new Date().getFullYear()}-${String(projectsList.value.length + 1).padStart(3, '0')}`

  const maCT = genMaCT(tenCongTy)
  const maKH = projectForm.value.ma_khach_hang || genMaKH(tenKhachHang, tenCongTy)

  const record = {
    id_project: idProj,
    ma_du_an: String(projectForm.value.ma_du_an || '').trim() || autoCode,
    ten_du_an: title,
    ma_khach_hang: maKH,
    ten_khach_hang: tenKhachHang,
    ma_cong_ty: maCT,
    ten_cong_ty: tenCongTy,
    default_workflow_id: String(projectForm.value.default_workflow_id || ''),
    linked_workflow_ids: normalizeLinkedWorkflowIds(projectForm.value.linked_workflow_ids),
    AM: String(projectForm.value.AM || 'Sơn').trim(),
    ngan_sach_du_kien: projectForm.value.ngan_sach_du_kien ?? '',
    deadline: String(projectForm.value.deadline || '').trim(),
    trang_thai: projectForm.value.trang_thai || 'Đang triển khai',
    ghi_chu: String(projectForm.value.ghi_chu || '').trim(),
    created_time: isEdit ? projectForm.value.created_time || nowStr : nowStr,
    last_updated: nowStr
  }

  if (isEdit) {
    const idx = projectsList.value.findIndex((p) => p.id_project === idProj)
    if (idx !== -1) projectsList.value[idx] = record
  } else {
    projectsList.value.unshift(record)
    if (showModal.value) {
      formData.value.id_project = idProj
      formData.value.ten_du_an = record.ten_du_an
      if (!formData.value.ten_cong_ty && !formData.value.ten_khach_hang) {
        formData.value.ten_cong_ty = record.ten_cong_ty
        formData.value.ten_khach_hang = record.ten_khach_hang
        formData.value.ma_cong_ty = record.ma_cong_ty
        formData.value.ma_khach_hang = record.ma_khach_hang
      }
      if (!formData.value.id_workflow) {
        if (record.default_workflow_id) {
          formData.value.id_workflow = record.default_workflow_id === 'WF_DEFAULT' ? '' : record.default_workflow_id
          onModalWorkflowChange()
        } else {
          applyCustomerFlowToModalForm()
        }
      }
    }
  }

  showProjectFormModal.value = false
  if (!isEdit && showModal.value) {
    formData.value.id_project = idProj
    formData.value.ten_du_an = title
  }
  savingProject.value = true

  try {
    await set(dbRef(database, `pipeline_projects/${sanitizeFirebaseKey(idProj)}`), record)

    if (isEdit) {
      const pipeUpdates = {}
      items.value.forEach((it) => {
        if (it.id_project === idProj) {
          const k = sanitizeFirebaseKey(it.Id_pipeline)
          if (it.ten_du_an !== record.ten_du_an) {
            it.ten_du_an = record.ten_du_an
            pipeUpdates[`${k}/ten_du_an`] = record.ten_du_an
          }
          if (!it.ten_cong_ty && !it.ten_khach_hang && (record.ten_cong_ty || record.ten_khach_hang)) {
            it.ten_cong_ty = record.ten_cong_ty
            it.ma_cong_ty = record.ma_cong_ty
            it.ten_khach_hang = record.ten_khach_hang
            it.ma_khach_hang = record.ma_khach_hang
            pipeUpdates[`${k}/ten_cong_ty`] = record.ten_cong_ty
            pipeUpdates[`${k}/ma_cong_ty`] = record.ma_cong_ty
            pipeUpdates[`${k}/ten_khach_hang`] = record.ten_khach_hang
            pipeUpdates[`${k}/ma_khach_hang`] = record.ma_khach_hang
          }
        }
      })
      if (Object.keys(pipeUpdates).length > 0) {
        await update(dbRef(database, 'pipeline'), pipeUpdates)
      }
    }

    showToast(isEdit ? 'Đã cập nhật Dự án & danh sách Khung Pipeline!' : 'Đã khởi tạo Dự án mới!', 'success')
  } catch (err) {
    console.error('Lỗi lưu dự án:', err)
    showToast('Lỗi mạng khi lưu Dự án', 'error')
    fetchData()
  } finally {
    savingProject.value = false
  }
}

const confirmDeleteProject = async (proj) => {
  const childCount = items.value.filter((i) => i.id_project === proj.id_project).length
  const ok = await askConfirm({
    title: 'Xóa Dự Án (Gốc)?',
    targetTag: 'DỰ ÁN',
    targetValue: proj.ten_du_an,
    message:
      childCount > 0
        ? `Dự án này đang chứa ${childCount} công việc trong Pipeline. Các công việc sẽ KHÔNG bị xóa mà chuyển về trạng thái Công việc độc lập.`
        : 'Bạn có chắc chắn muốn xóa dự án này khỏi hệ thống?',
    tone: 'danger',
    confirmText: 'Xóa Dự Án',
    cancelText: 'Hủy'
  })
  if (!ok) return

  projectsList.value = projectsList.value.filter((p) => p.id_project !== proj.id_project)
  if (activeProjectId.value === proj.id_project) showProjectDetailModal.value = false

  backgroundSyncing.value = true
  try {
    await remove(dbRef(database, `pipeline_projects/${sanitizeFirebaseKey(proj.id_project)}`))
    const pipeUpdates = {}
    items.value.forEach((it) => {
      if (it.id_project === proj.id_project) {
        it.id_project = ''
        it.ten_du_an = ''
        const k = sanitizeFirebaseKey(it.Id_pipeline)
        pipeUpdates[`${k}/id_project`] = ''
        pipeUpdates[`${k}/ten_du_an`] = ''
      }
    })
    if (Object.keys(pipeUpdates).length > 0) {
      await update(dbRef(database, 'pipeline'), pipeUpdates)
    }
    showToast('Đã xóa Dự án!', 'success')
  } catch (err) {
    console.error('Lỗi xóa dự án:', err)
    showToast('Lỗi khi xóa Dự án', 'error')
    fetchData()
  } finally {
    backgroundSyncing.value = false
  }
}

const openProjectDetailModal = (proj) => {
  activeProjectId.value = proj.id_project
  projectDetailSubTab.value = 'pipelines'
  projectDetailWfFilter.value = 'ALL'
  projectDetailPipeSearch.value = ''
  focusedProjectPipeId.value = ''
  openProjPipeStageMenuId.value = ''
  isProjLeftRailOpen.value = !(typeof window !== 'undefined' && window.innerWidth <= 1100)
  showAttachPipelineDrawer.value = false
  showManageProjectWfDrawer.value = false
  showProjectDetailModal.value = true
}

const closeProjectDetailModal = () => {
  openProjPipeStageMenuId.value = ''
  showAttachPipelineDrawer.value = false
  showManageProjectWfDrawer.value = false
  showProjectDetailModal.value = false
}

const confirmDeleteProjectFromForm = async () => {
  if (!isEditingProject.value || !projectForm.value.id_project) return
  const found = projectsList.value.find((p) => p.id_project === projectForm.value.id_project)
  if (!found) return
  showProjectFormModal.value = false
  await confirmDeleteProject(found)
}

const openProjectById = (projId) => {
  const found = projectsList.value.find((p) => p.id_project === projId)
  if (found) {
    openProjectDetailModal(found)
  } else {
    showToast('Không tìm thấy thông tin Dự án này', 'info')
  }
}

const openAddPipelineForProject = (proj, specificWorkflowId = '') => {
  openAddModal()
  pipelineModalSource.value = 'project'
  formData.value.id_project = proj.id_project
  formData.value.ten_du_an = proj.ten_du_an
  formData.value.AM = proj.AM || 'Sơn'

  const targetWfId = specificWorkflowId || proj.default_workflow_id || ''
  const wfMeta =
    targetWfId && targetWfId !== 'WF_DEFAULT'
      ? uniqueWorkflows.value.find((w) => w.id_workflow === targetWfId)
      : null

  // If adding onto a specific Customer's Pipeline Frame (e.g. Partner B's frame),
  // pre-fill that Frame's 1 Customer onto the new Work Item! Otherwise use Project Root Customer.
  if (wfMeta && wfMeta.workflow_scope === 'customer' && (wfMeta.ten_cong_ty || wfMeta.ten_khach_hang || wfMeta.ma_khach_hang)) {
    const resolvedWfCus = resolveCompleteCustomerPair({
      ma_khach_hang: wfMeta.ma_khach_hang || '',
      ma_cong_ty: wfMeta.ma_cong_ty || '',
      ten_cong_ty: wfMeta.ten_cong_ty || '',
      ten_khach_hang: wfMeta.ten_khach_hang || (isCardSameAsProjectRootCustomer(wfMeta, proj) ? proj.ten_khach_hang || '' : '')
    })
    formData.value.ten_cong_ty = resolvedWfCus.ten_cong_ty || ''
    formData.value.ten_khach_hang = resolvedWfCus.ten_khach_hang || ''
    formData.value.ma_cong_ty = wfMeta.ma_cong_ty || genMaCT(formData.value.ten_cong_ty)
    formData.value.ma_khach_hang = wfMeta.ma_khach_hang || genMaKH(formData.value.ten_khach_hang, formData.value.ten_cong_ty)
  } else {
    const resolvedProjCus = resolveCompleteCustomerPair(proj)
    formData.value.ten_cong_ty = resolvedProjCus.ten_cong_ty || proj.ten_cong_ty || ''
    formData.value.ten_khach_hang = resolvedProjCus.ten_khach_hang || proj.ten_khach_hang || ''
    formData.value.ma_cong_ty = proj.ma_cong_ty || genMaCT(formData.value.ten_cong_ty)
    formData.value.ma_khach_hang = proj.ma_khach_hang || genMaKH(formData.value.ten_khach_hang, formData.value.ten_cong_ty)
  }

  if (targetWfId) {
    formData.value.id_workflow = targetWfId === 'WF_DEFAULT' ? '' : targetWfId
    onModalWorkflowChange()
  } else {
    applyCustomerFlowToModalForm()
  }
}

const openProjectWorkflowOnKanban = (proj, wfId = '') => {
  showProjectDetailModal.value = false
  filterConfig.value.customerName = ''
  filterConfig.value.companyName = ''
  filterConfig.value.projectId = proj.id_project
  const targetWf =
    wfId ||
    proj.default_workflow_id ||
    proj.correspondingWorkflows?.[0]?.id_workflow ||
    'WF_DEFAULT'
  filterConfig.value.workflowId = targetWf
  selectedWorkflowId.value = targetWf
  activeTab.value = 'kanban'
  kanbanViewMode.value = 'standard'
  showToast(`Đang mở Kanban Dự án "${proj.ten_du_an}" — ${getWorkflowShortLabel(targetWf)}`, 'info', 2200)
}

const jumpToCustomerWorkflowDesignerFromProject = (proj) => {
  showProjectDetailModal.value = false
  jumpToCustomerWorkflowDesigner(proj.ten_cong_ty || proj.ten_khach_hang || '')
}

const jumpToCustomerWorkflowDesignerFromModal = () => {
  const kw = projectForm.value.ten_cong_ty || projectForm.value.ten_khach_hang || ''
  showProjectFormModal.value = false
  jumpToCustomerWorkflowDesigner(kw)
}

const attachExistingPipelineToProject = async (pipe, proj) => {
  pipe.id_project = proj.id_project
  pipe.ten_du_an = proj.ten_du_an
  try {
    const k = sanitizeFirebaseKey(pipe.Id_pipeline)
    await update(dbRef(database, 'pipeline/' + k), {
      id_project: proj.id_project,
      ten_du_an: proj.ten_du_an
    })
    showToast('Đã gắn Công việc vào Dự án!', 'success')
  } catch (err) {
    console.error('Lỗi gắn pipeline vào dự án:', err)
    showToast('Lỗi khi gắn Công việc', 'error')
  }
}

const detachPipelineFromProject = async (pipe) => {
  pipe.id_project = ''
  pipe.ten_du_an = ''
  try {
    const k = sanitizeFirebaseKey(pipe.Id_pipeline)
    await update(dbRef(database, 'pipeline/' + k), {
      id_project: '',
      ten_du_an: ''
    })
    showToast('Đã gỡ Công việc khỏi Dự án', 'info')
  } catch (err) {
    console.error('Lỗi gỡ pipeline:', err)
  }
}

const isPipelineAtStep = (pipe, stepCol) => {
  const cols = getColumnsForWorkflow(pipe.id_workflow)
  const resolved = resolveColumnForItem(pipe, cols)
  return resolved ? resolved.id === stepCol.id : false
}

const isStepPassed = (pipe, stepCol, stepIdx, allCols) => {
  if (pipe.status_name === 'THẤT BẠI' || stepCol.id === 'that_bai') return false
  if (pipe.status_name === 'THÀNH CÔNG') return stepCol.id !== 'hoan_thanh'
  const curIdx = allCols.findIndex((c) => isPipelineAtStep(pipe, c))
  return curIdx > stepIdx
}

const updatePipelineStepInline = async (pipe, stepCol) => {
  const cols = getColumnsForWorkflow(pipe.id_workflow)
  applyColumnToItem(pipe, stepCol.id, cols)
  distributeItems()
  await syncItemAPI(pipe)
  showToast(`Đã cập nhật bước: ${stepCol.label} (${stepCol.percent})`, 'success', 1800)
}

let highlightedCardTimer = null

const triggerPipelineCardHighlight = (pipeId) => {
  if (!pipeId) return
  if (highlightedCardTimer) {
    clearTimeout(highlightedCardTimer)
    highlightedCardTimer = null
  }
  highlightedCardId.value = pipeId
  highlightedCardTimer = setTimeout(() => {
    if (highlightedCardId.value === pipeId) {
      highlightedCardId.value = null
    }
    highlightedCardTimer = null
  }, 4200)
}

const focusCardOnKanban = (pipe) => {
  if (!pipe || !pipe.Id_pipeline) return
  showProjectDetailModal.value = false
  searchQuery.value = ''
  filterConfig.value.customerName = ''
  filterConfig.value.companyName = ''
  filterConfig.value.workflowId = ''
  filterConfig.value.filterMode = 'all'
  if (filterConfig.value.projectId && filterConfig.value.projectId !== pipe.id_project) {
    filterConfig.value.projectId = ''
  }
  selectedWorkflowId.value = pipe.id_workflow || 'WF_DEFAULT'
  activeTab.value = 'kanban'
  kanbanViewMode.value = 'standard'
  distributeItems()
  const targetColId = getCardColumnId(pipe)
  if (targetColId && collapsedCols.value[targetColId]) {
    collapsedCols.value[targetColId] = false
  }
  triggerPipelineCardHighlight(pipe.Id_pipeline)
  setTimeout(() => {
    const el = document.getElementById('pipeline-card-' + pipe.Id_pipeline)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }, 220)
}

const getPipelineStageColor = (pipe) => {
  const cols = getColumnsForWorkflow(pipe.id_workflow)
  const col = resolveColumnForItem(pipe, cols)
  return col?.color || '#38bdf8'
}

const getPipelineStagePercent = (pipe) => {
  const cols = getColumnsForWorkflow(pipe.id_workflow)
  const col = resolveColumnForItem(pipe, cols)
  return col?.percent || pipe?.['%status'] || '0%'
}

const getPipelineStageShortName = (pipe) => {
  const cols = getColumnsForWorkflow(pipe.id_workflow)
  const col = resolveColumnForItem(pipe, cols)
  if (!col) return pipe?.status_name || 'TẠM'
  if (col.id === 'hoan_thanh') return 'THÀNH CÔNG'
  if (col.id === 'that_bai') return 'THẤT BẠI'
  return getCleanModalColTitle(col)
}

const selectPipeStageFromMenu = async (pipe, stepCol) => {
  openProjPipeStageMenuId.value = ''
  await updatePipelineStepInline(pipe, stepCol)
}

// =========================================================
// ADD / EDIT PIPELINE MODAL & CUSTOMER AUTO-WORKFLOW BINDING
// =========================================================
const showModal = ref(false)
const isEditing = ref(false)
const pipelineModalSource = ref('kanban')
const isKanbanModalContext = computed(() => pipelineModalSource.value === 'kanban')
const isStudioLeftRailOpen = ref(true)
const openTlSelectKey = ref(null)
const tempStartDate = ref('')
const tempEndDate = ref('')

const toggleStudioLeftRail = () => {
  if (isMobile.value || (typeof window !== 'undefined' && window.innerWidth <= 1100)) {
    isStudioLeftRailOpen.value = !isStudioLeftRailOpen.value
  }
}

const defaultFormData = {
  Id_pipeline: '',
  report_id: '',
  ma_hop_dong: '',
  ma_khach_hang: '',
  ten_khach_hang: '',
  ma_cong_ty: '',
  ten_cong_ty: '',
  AM: 'Sơn',
  tag: 'Bình thường',
  '%status': '0%',
  status_name: 'TẠM',
  isSuccess: '',
  type: '',
  ghi_chu_hop_dong: '',
  created_time: '',
  finish_time: '',
  content_of_contract_po: '',
  quantity: '',
  volume: '',
  ten_file: '',
  link_file: '',
  id_pipeline_lien_ket: '',
  id_workflow: '',
  id_quanlyfile: '',
  id_status_workflow: '',
  id_project: '',
  ten_du_an: ''
}

const formData = ref({ ...defaultFormData })
const originalFormData = ref('')

const isFormChanged = computed(() => {
  if (!isEditing.value) return true
  return JSON.stringify(formData.value) !== originalFormData.value
})

const projectsListForModal = computed(() => projectsList.value)

const modalSelectedProject = computed(() => {
  if (!formData.value.id_project) return null
  return allEnrichedProjects.value.find((p) => p.id_project === formData.value.id_project) || null
})

const modalProjectLinkedWorkflows = computed(() => {
  const proj = modalSelectedProject.value
  if (!proj) return []
  return (proj.correspondingWorkflows || []).filter((w) => w.id_workflow !== 'WF_DEFAULT')
})

const modalMatchedCompanyWorkflows = computed(() => {
  if (!formData.value.ten_cong_ty && !formData.value.ten_khach_hang && !formData.value.ma_khach_hang) {
    return []
  }
  const projSet = new Set(modalProjectLinkedWorkflows.value.map((w) => w.id_workflow))
  return resolveCompanyWorkflows({
    ma_khach_hang: formData.value.ma_khach_hang,
    ma_cong_ty: formData.value.ma_cong_ty,
    ten_cong_ty: formData.value.ten_cong_ty,
    ten_khach_hang: formData.value.ten_khach_hang
  }).list.filter((w) => !projSet.has(w.id_workflow))
})

const modalOtherCustomerWorkflows = computed(() => {
  const usedSet = new Set([
    ...modalProjectLinkedWorkflows.value.map((w) => w.id_workflow),
    ...modalMatchedCompanyWorkflows.value.map((w) => w.id_workflow)
  ])
  return customerWorkflowOptions.value.filter((w) => !usedSet.has(w.id_workflow))
})

const modalSuggestedWorkflowChips = computed(() => {
  const seen = new Set()
  const out = []
  const rawOwn =
    formData.value.ten_cong_ty || formData.value.ten_khach_hang || formData.value.ma_khach_hang
      ? resolveCompanyWorkflows({
          ma_khach_hang: formData.value.ma_khach_hang,
          ma_cong_ty: formData.value.ma_cong_ty,
          ten_cong_ty: formData.value.ten_cong_ty,
          ten_khach_hang: formData.value.ten_khach_hang
        }).list
      : []

  ;[...rawOwn, ...modalProjectLinkedWorkflows.value].forEach((wf) => {
    if (wf && wf.id_workflow && wf.id_workflow !== 'WF_DEFAULT' && !seen.has(wf.id_workflow)) {
      seen.add(wf.id_workflow)
      out.push(wf)
    }
  })
  return out
})

const selectModalWorkflowQuick = (wfId) => {
  formData.value.id_workflow = wfId || ''
  onModalWorkflowChange()
}

const modalCustomerFlowHint = computed(() => {
  if (!formData.value.ten_cong_ty && !formData.value.ten_khach_hang) return ''
  const resolved = resolveCompanyWorkflows({
    ma_khach_hang: formData.value.ma_khach_hang,
    ma_cong_ty: formData.value.ma_cong_ty,
    ten_cong_ty: formData.value.ten_cong_ty,
    ten_khach_hang: formData.value.ten_khach_hang
  })
  if (resolved.count > 1) {
    return `KH này có ${resolved.count} Khung Pipeline riêng`
  }
  if (resolved.count === 1) {
    return `KH có Khung riêng: ${resolved.primary.name_workflow}`
  }
  return 'Đang dùng Khung Chuẩn Hệ Thống'
})

const applyCustomerFlowToModalForm = () => {
  if (isEditing.value || pipelineModalSource.value === 'kanban') return
  const resolved = resolveCompanyWorkflows({
    ma_khach_hang: formData.value.ma_khach_hang,
    ma_cong_ty: formData.value.ma_cong_ty,
    ten_cong_ty: formData.value.ten_cong_ty,
    ten_khach_hang: formData.value.ten_khach_hang
  })
  formData.value.id_workflow = resolved.primary.id_workflow === 'WF_DEFAULT' ? '' : resolved.primary.id_workflow
  onModalWorkflowChange()
}

const onModalWorkflowChange = () => {
  if (MODAL_COLUMNS.value.length > 0) {
    const first = MODAL_COLUMNS.value[0]
    formData.value.status_name = first.value
    formData.value['%status'] = first.percent
    formData.value.id_status_workflow = first.rawStatusId || first.id
  }
}

const onStatusNameChange = () => {
  const colConfig = MODAL_COLUMNS.value.find((c) => c.value === formData.value.status_name)
  if (colConfig) {
    formData.value['%status'] = colConfig.percent
    formData.value.id_status_workflow = colConfig.rawStatusId || colConfig.id
    if (colConfig.id === 'hoan_thanh') formData.value.isSuccess = true
    else if (colConfig.id === 'that_bai') formData.value.isSuccess = false
    else formData.value.isSuccess = ''
  }
}

const getCleanModalColTitle = (col) => {
  if (!col) return ''
  const raw = String(col.label || col.value || '').trim()
  const stripped = raw.replace(/^\d+%\s*[:\-–—]\s*/, '').trim()
  return stripped || raw
}

const progressionModalStages = computed(() =>
  MODAL_COLUMNS.value.filter((c) => c.id !== 'hoan_thanh' && c.id !== 'that_bai')
)

const outcomeModalStages = computed(() =>
  MODAL_COLUMNS.value.filter((c) => c.id === 'hoan_thanh' || c.id === 'that_bai')
)

const activeModalStageObj = computed(
  () => resolveColumnForItem(formData.value, MODAL_COLUMNS.value) || MODAL_COLUMNS.value[0] || null
)

const isModalStageActive = (col) => Boolean(col && activeModalStageObj.value?.id === col.id)

const selectModalStage = (col) => {
  if (!col) return
  formData.value.status_name = col.value
  onStatusNameChange()
}

const activeModalStageTone = computed(() => {
  const cur = activeModalStageObj.value
  if (!cur) return 'sky'
  if (cur.id === 'hoan_thanh') return 'emerald'
  if (cur.id === 'that_bai') return 'rose'
  return 'sky'
})

const activeModalStageSummary = computed(() => {
  const cur = activeModalStageObj.value
  if (!cur) return formData.value.status_name || '0% · TẠM'
  if (cur.id === 'hoan_thanh') return '100% · THÀNH CÔNG'
  if (cur.id === 'that_bai') return '0% · THẤT BẠI'
  return `${cur.percent} · ${getCleanModalColTitle(cur)}`
})

const modalTotalLinkedAttachmentsCount = computed(() => {
  const repFiles = selectedReports.value.reduce((acc, rep) => acc + getReportTotalAttachmentsCount(rep), 0)
  return repFiles + fileList.value.length
})

const onSelectProjectInPipelineModal = () => {
  const pId = formData.value.id_project
  if (!pId) {
    formData.value.ten_du_an = ''
    return
  }
  const proj = projectsList.value.find((p) => p.id_project === pId)
  if (!proj) return
  formData.value.ten_du_an = proj.ten_du_an

  // Only pre-fill Root Customer if the card does NOT already have its own 1 Customer chosen
  const cardHasCustomer = Boolean(
    String(formData.value.ten_cong_ty || '').trim() || String(formData.value.ten_khach_hang || '').trim()
  )
  if (!cardHasCustomer && (proj.ten_cong_ty || proj.ten_khach_hang)) {
    formData.value.ten_cong_ty = proj.ten_cong_ty || ''
    formData.value.ten_khach_hang = proj.ten_khach_hang || ''
    formData.value.ma_cong_ty = proj.ma_cong_ty || genMaCT(formData.value.ten_cong_ty)
    formData.value.ma_khach_hang = proj.ma_khach_hang || genMaKH(formData.value.ten_khach_hang, formData.value.ten_cong_ty)
  }

  if (!isEditing.value && !formData.value.id_workflow) {
    if (isCardSameAsProjectRootCustomer(formData.value, proj) && proj.default_workflow_id) {
      formData.value.id_workflow = proj.default_workflow_id === 'WF_DEFAULT' ? '' : proj.default_workflow_id
      onModalWorkflowChange()
    } else {
      applyCustomerFlowToModalForm()
    }
  }
}

watch(
  () => [formData.value.ten_khach_hang, formData.value.ten_cong_ty],
  ([tenKH, congTy]) => {
    if (tenKH || congTy) {
      formData.value.ma_khach_hang = genMaKH(tenKH, congTy)
      formData.value.ma_cong_ty = genMaCT(congTy)
    }
  }
)

const getCurrentFormattedTime = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const TIMELINE_MONTH_OPTIONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

const timelineYearOptions = computed(() => {
  const curYear = new Date().getFullYear()
  const years = new Set()
  for (let y = curYear - 1; y <= curYear + 6; y++) {
    years.add(String(y))
  }
  const sYr = String(tempStartDate.value || '').split('-')[0]
  const eYr = String(tempEndDate.value || '').split('-')[0]
  if (/^\d{4}$/.test(sYr)) years.add(sYr)
  if (/^\d{4}$/.test(eYr)) years.add(eYr)
  return Array.from(years).sort()
})

const getDaysInMonthCount = (yrStr, moStr) => {
  const y = parseInt(yrStr, 10) || new Date().getFullYear()
  const m = parseInt(moStr, 10) || new Date().getMonth() + 1
  return new Date(y, m, 0).getDate()
}

const tlStartYear = computed(() => String(tempStartDate.value || '').split('-')[0] || '')
const tlStartMonth = computed(() => String(tempStartDate.value || '').split('-')[1] || '')
const tlStartDay = computed(() => String(tempStartDate.value || '').split('-')[2] || '')
const tlEndYear = computed(() => String(tempEndDate.value || '').split('-')[0] || '')
const tlEndMonth = computed(() => String(tempEndDate.value || '').split('-')[1] || '')
const tlEndDay = computed(() => String(tempEndDate.value || '').split('-')[2] || '')

const tlStartDayOptions = computed(() =>
  Array.from({ length: getDaysInMonthCount(tlStartYear.value, tlStartMonth.value) }, (_, i) =>
    String(i + 1).padStart(2, '0')
  )
)

const tlEndDayOptions = computed(() =>
  Array.from({ length: getDaysInMonthCount(tlEndYear.value, tlEndMonth.value) }, (_, i) =>
    String(i + 1).padStart(2, '0')
  )
)

const toggleTlSelect = (key) => {
  openTlSelectKey.value = openTlSelectKey.value === key ? null : key
}

const onChangeTlPart = (side, part, val) => {
  const now = new Date()
  const defaultYr = String(now.getFullYear())
  const defaultMo = String(now.getMonth() + 1).padStart(2, '0')
  const defaultDayForSide = (y, m) =>
    side === 'end' ? String(getDaysInMonthCount(y, m)).padStart(2, '0') : '01'

  const curVal = side === 'start' ? tempStartDate.value : tempEndDate.value
  let [yr, mo, dy] = String(curVal || '').split('-')

  if (part === 'day') {
    dy = val
    if (dy && !mo) mo = defaultMo
    if (dy && !yr) yr = defaultYr
  } else if (part === 'month') {
    mo = val
    if (mo && !yr) yr = defaultYr
    if (mo && !dy) dy = defaultDayForSide(yr, mo)
  } else {
    yr = val
    if (yr && !mo) mo = defaultMo
    if (yr && !dy) dy = defaultDayForSide(yr, mo)
  }

  if (yr && mo && dy) {
    const maxDay = getDaysInMonthCount(yr, mo)
    const clamped = Math.min(Math.max(parseInt(dy, 10) || 1, 1), maxDay)
    dy = String(clamped).padStart(2, '0')
  }

  const nextYmd = yr && mo && dy ? `${yr}-${mo}-${dy}` : ''
  if (side === 'start') tempStartDate.value = nextYmd
  else tempEndDate.value = nextYmd
  updateFinishTime()
}

const selectTlPart = (side, part, val) => {
  onChangeTlPart(side, part, val)
  openTlSelectKey.value = null
}

const selectTodayForTlSide = (side) => {
  const now = new Date()
  const pad2 = (n) => String(n).padStart(2, '0')
  const todayYmd = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
  if (side === 'start') tempStartDate.value = todayYmd
  else tempEndDate.value = todayYmd
  updateFinishTime()
  openTlSelectKey.value = null
}

const clearTlSide = (side) => {
  if (side === 'start') tempStartDate.value = ''
  else tempEndDate.value = ''
  updateFinishTime()
  openTlSelectKey.value = null
}

const buildTimelinePresetValue = (presetKey) => {
  const now = new Date()
  const yr = now.getFullYear()
  const moIdx = now.getMonth() // 0..11
  const pad2 = (n) => String(n).padStart(2, '0')
  const lastDayOf = (y, mZero) => new Date(y, mZero + 1, 0).getDate()

  if (presetKey === 'this_month') {
    const mm = pad2(moIdx + 1)
    const endDay = pad2(lastDayOf(yr, moIdx))
    return {
      startYmd: `${yr}-${mm}-01`,
      endYmd: `${yr}-${mm}-${endDay}`,
      text: `01/${mm}/${yr} - ${endDay}/${mm}/${yr}`
    }
  }
  if (presetKey === 'this_quarter') {
    const qStart = Math.floor(moIdx / 3) * 3
    const qEnd = qStart + 2
    const sm = pad2(qStart + 1)
    const em = pad2(qEnd + 1)
    const endDay = pad2(lastDayOf(yr, qEnd))
    return {
      startYmd: `${yr}-${sm}-01`,
      endYmd: `${yr}-${em}-${endDay}`,
      text: `01/${sm}/${yr} - ${endDay}/${em}/${yr}`
    }
  }
  const offset = presetKey === 'plus_6m' ? 6 : 3
  const target = new Date(yr, moIdx + offset, 1)
  const sm = pad2(moIdx + 1)
  const ty = target.getFullYear()
  const tm = pad2(target.getMonth() + 1)
  return {
    startYmd: `${yr}-${sm}-01`,
    endYmd: `${ty}-${tm}-01`,
    text: `01/${sm}/${yr} - 01/${tm}/${ty}`
  }
}

const activeTimelinePreset = computed(() => {
  const cur = String(formData.value.finish_time || '').trim()
  if (!cur) return ''
  for (const key of ['this_month', 'this_quarter', 'plus_3m', 'plus_6m']) {
    if (buildTimelinePresetValue(key).text === cur) return key
  }
  return ''
})

const applyTimelinePreset = (presetKey) => {
  const res = buildTimelinePresetValue(presetKey)
  tempStartDate.value = res.startYmd
  tempEndDate.value = res.endYmd
  formData.value.finish_time = res.text
  openTlSelectKey.value = null
}

const clearTimelineField = () => {
  formData.value.finish_time = ''
  tempStartDate.value = ''
  tempEndDate.value = ''
  openTlSelectKey.value = null
}

const parseFinishTime = (ft) => {
  if (!ft) {
    tempStartDate.value = ''
    tempEndDate.value = ''
    return
  }
  const parts = String(ft).split('-').map((s) => s.trim())
  const parseDateToYmd = (dStr, isEnd = false) => {
    if (!dStr) return ''
    const segs = dStr.split('/').map((s) => s.trim())
    if (segs.length === 3) {
      const [d, m, y] = segs
      if (/^\d{1,2}$/.test(d) && /^\d{1,2}$/.test(m) && /^\d{4}$/.test(y)) {
        const mm = m.padStart(2, '0')
        const maxD = getDaysInMonthCount(y, mm)
        const dd = String(Math.min(Math.max(parseInt(d, 10) || 1, 1), maxD)).padStart(2, '0')
        return `${y}-${mm}-${dd}`
      }
    } else if (segs.length === 2) {
      const [m, y] = segs
      if (/^\d{1,2}$/.test(m) && /^\d{4}$/.test(y)) {
        const mm = m.padStart(2, '0')
        const dd = isEnd ? String(getDaysInMonthCount(y, mm)).padStart(2, '0') : '01'
        return `${y}-${mm}-${dd}`
      }
    }
    return ''
  }

  if (parts.length === 1) {
    const single = parseDateToYmd(parts[0], Boolean(tempEndDate.value && !tempStartDate.value))
    if (tempEndDate.value && !tempStartDate.value) {
      tempStartDate.value = ''
      tempEndDate.value = single || ''
    } else {
      tempStartDate.value = single || ''
      tempEndDate.value = ''
    }
    return
  }

  tempStartDate.value = parseDateToYmd(parts[0], false) || ''
  tempEndDate.value = parseDateToYmd(parts[1], true) || ''
}

const updateFinishTime = () => {
  const fmt = (ymdStr) => {
    if (!ymdStr) return ''
    const [y, m, d] = ymdStr.split('-')
    if (y && m && d) return `${d}/${m}/${y}`
    if (y && m) return `01/${m}/${y}`
    return ''
  }
  const start = fmt(tempStartDate.value)
  const end = fmt(tempEndDate.value)
  if (start && end) formData.value.finish_time = `${start} - ${end}`
  else if (start) formData.value.finish_time = start
  else if (end) formData.value.finish_time = end
  else formData.value.finish_time = ''
}

const openAddModal = () => {
  isEditing.value = false
  pipelineModalSource.value = 'kanban'
  isStudioLeftRailOpen.value = true
  openTlSelectKey.value = null
  formData.value = { ...defaultFormData }
  formData.value.id_workflow = selectedWorkflowId.value === 'WF_DEFAULT' ? '' : selectedWorkflowId.value

  if (filterConfig.value.companyName || filterConfig.value.customerName) {
    const compText = filterConfig.value.companyName ? activeKanbanCompanyFilterLabel.value : ''
    const cusText = filterConfig.value.customerName ? activeKanbanCustomerFilterLabel.value : ''
    const pair = resolveCompleteCustomerPair({
      ten_cong_ty: compText,
      ten_khach_hang: cusText
    })
    formData.value.ten_cong_ty = pair.ten_cong_ty || ''
    formData.value.ten_khach_hang = pair.ten_khach_hang || ''
    formData.value.ma_cong_ty = genMaCT(formData.value.ten_cong_ty)
    formData.value.ma_khach_hang = genMaKH(formData.value.ten_khach_hang, formData.value.ten_cong_ty)
  } else if (selectedWorkflowId.value && selectedWorkflowId.value !== 'WF_DEFAULT') {
    const activeWfMeta = uniqueWorkflows.value.find((w) => w.id_workflow === selectedWorkflowId.value)
    if (activeWfMeta && activeWfMeta.workflow_scope === 'customer' && (activeWfMeta.ten_cong_ty || activeWfMeta.ten_khach_hang)) {
      formData.value.ten_cong_ty = activeWfMeta.ten_cong_ty || ''
      formData.value.ten_khach_hang = activeWfMeta.ten_khach_hang || ''
      formData.value.ma_cong_ty = activeWfMeta.ma_cong_ty || genMaCT(formData.value.ten_cong_ty)
      formData.value.ma_khach_hang = activeWfMeta.ma_khach_hang || genMaKH(formData.value.ten_khach_hang, formData.value.ten_cong_ty)
    }
  }

  if (filterConfig.value.projectId && filterConfig.value.projectId !== '__STANDALONE__') {
    const p = projectsList.value.find((pr) => pr.id_project === filterConfig.value.projectId)
    if (p) {
      formData.value.id_project = p.id_project
      formData.value.ten_du_an = p.ten_du_an
      if (!formData.value.ten_cong_ty && !formData.value.ten_khach_hang) {
        formData.value.ten_cong_ty = p.ten_cong_ty || ''
        formData.value.ten_khach_hang = p.ten_khach_hang || ''
      }
    }
  }
  onModalWorkflowChange()
  formData.value.created_time = getCurrentFormattedTime()
  tempStartDate.value = ''
  tempEndDate.value = ''
  showModal.value = true
}

const openAddModalForColumn = (col) => {
  openAddModal()
  if (col) {
    selectModalStage(col)
  }
}

const openAddModalForSwimlaneCell = (lane, col) => {
  if (lane?.project) {
    openAddPipelineForProject(lane.project, selectedWorkflowId.value)
  } else {
    openAddModal()
  }
  if (col) {
    selectModalStage(col)
  }
}

const openEditModal = (item) => {
  isEditing.value = true
  pipelineModalSource.value = activeTab.value === 'projects' || showProjectDetailModal.value ? 'project' : 'kanban'
  isStudioLeftRailOpen.value = !(typeof window !== 'undefined' && window.innerWidth <= 1100)
  openTlSelectKey.value = null
  formData.value = { ...defaultFormData, ...item }
  originalFormData.value = JSON.stringify(formData.value)
  parseFinishTime(item.finish_time)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  openTlSelectKey.value = null
  isDraggingUpload.value = false
}

const duplicateItem = (item) => {
  isEditing.value = false
  pipelineModalSource.value = activeTab.value === 'projects' || showProjectDetailModal.value ? 'project' : 'kanban'
  isStudioLeftRailOpen.value = true
  openTlSelectKey.value = null
  const copy = { ...defaultFormData, ...item }
  copy.Id_pipeline = ''
  copy.isSuccess = ''
  copy.created_time = getCurrentFormattedTime()
  formData.value = copy
  onModalWorkflowChange()
  parseFinishTime(copy.finish_time || '')
  showModal.value = true
}

const showPipelineFilesVaultModal = ref(false)

const onStudioModalKeydown = (e) => {
  if (baogiaDialog.value.open) return
  const anyStudioOpen =
    showModal.value ||
    showProjectFormModal.value ||
    showProjectDetailModal.value ||
    showPipelineFilesVaultModal.value ||
    showAddCustomerModal.value ||
    showCustomerModal.value ||
    Boolean(previewQuanLyFileImage.value)
  if (!anyStudioOpen) return

  if ((e.ctrlKey || e.metaKey) && String(e.key || '').toLowerCase() === 's') {
    if (showAddCustomerModal.value) {
      e.preventDefault()
      if (
        !isSavingCustomer.value &&
        !cusImportScanning.value.active &&
        (!customerFormData.value.id || isCustomerDataChanged.value)
      ) {
        saveNewCustomer()
      }
      return
    }
    if (showProjectFormModal.value) {
      e.preventDefault()
      if (!savingProject.value) saveProjectForm()
      return
    }
    if (showModal.value) {
      e.preventDefault()
      if (!saving.value && !uploadingFiles.value && isFormChanged.value) {
        saveItem()
      }
      return
    }
  }

  if (e.key === 'Escape') {
    if (previewQuanLyFileImage.value) {
      e.preventDefault()
      previewQuanLyFileImage.value = null
      return
    }
    if (cusImportScanning.value.active) {
      e.preventDefault()
      return
    }
    if (cusAiFallbackModal.value.show) {
      e.preventDefault()
      closeCusAiImportFallback()
      return
    }
    if (isCusTaxModalOpen.value) {
      e.preventDefault()
      closeCusTaxModal()
      return
    }
    if (cusSmartImportModal.value.show) {
      e.preventDefault()
      closeCusSmartImportModal()
      return
    }
    if (isTagModalOpen.value) {
      e.preventDefault()
      isTagModalOpen.value = false
      return
    }
    if (showPipelineFilesVaultModal.value) {
      e.preventDefault()
      showPipelineFilesVaultModal.value = false
      return
    }
    if (showScanConfirmModal.value) {
      e.preventDefault()
      handleScanConfirm(false)
      return
    }
    if (showAddCustomerModal.value) {
      e.preventDefault()
      showAddCustomerModal.value = false
      return
    }
    if (showCustomerModal.value) {
      e.preventDefault()
      showCustomerModal.value = false
      return
    }
    if (showTypePickerModal.value) {
      e.preventDefault()
      showTypePickerModal.value = false
      return
    }
    if (showReportDropdown.value) {
      e.preventDefault()
      showReportDropdown.value = false
      return
    }
    if (showReportContentModal.value) {
      e.preventDefault()
      showReportContentModal.value = false
      return
    }
    if (openTlSelectKey.value) {
      e.preventDefault()
      openTlSelectKey.value = null
      return
    }
    if (showProjectFormWfPicker.value) {
      e.preventDefault()
      showProjectFormWfPicker.value = false
      return
    }
    if (showManageProjectWfDrawer.value) {
      e.preventDefault()
      showManageProjectWfDrawer.value = false
      return
    }
    if (showAttachPipelineDrawer.value) {
      e.preventDefault()
      showAttachPipelineDrawer.value = false
      return
    }
    if (openKanbanCardMenuId.value) {
      e.preventDefault()
      openKanbanCardMenuId.value = ''
      return
    }
    if (openProjPipeStageMenuId.value) {
      e.preventDefault()
      openProjPipeStageMenuId.value = ''
      return
    }
    if (showProjectFormModal.value) {
      e.preventDefault()
      showProjectFormModal.value = false
      return
    }
    if (showModal.value) {
      e.preventDefault()
      closeModal()
      return
    }
    if (showProjectDetailModal.value) {
      e.preventDefault()
      closeProjectDetailModal()
    }
  }
}

const saveItem = async () => {
  const isUpdate = isEditing.value
  const optimisticData = { ...formData.value }
  if (optimisticData.id_project) {
    const pr = projectsList.value.find((p) => p.id_project === optimisticData.id_project)
    if (pr) optimisticData.ten_du_an = pr.ten_du_an
  } else {
    optimisticData.ten_du_an = ''
  }

  let oldReportId = ''
  let oldQuanLyFile = ''

  if (isUpdate) {
    const index = items.value.findIndex((i) => i.Id_pipeline === optimisticData.Id_pipeline)
    if (index !== -1) {
      oldReportId = String(items.value[index].report_id || '')
      oldQuanLyFile = String(items.value[index].id_quanlyfile || '')
      items.value[index] = optimisticData
    }
  } else {
    optimisticData.Id_pipeline = 'PIPE_' + Date.now()
    items.value.unshift(optimisticData)
  }

  if (!isUpdate) {
    selectedWorkflowId.value = optimisticData.id_workflow || 'WF_DEFAULT'
  }

  distributeItems()
  closeModal()

  saving.value = true
  try {
    const key = sanitizeFirebaseKey(optimisticData.Id_pipeline)
    await set(dbRef(database, 'pipeline/' + key), toCleanPipelineRecord(optimisticData))
    await syncLinkRefsFirebase(oldReportId, optimisticData.report_id || '', optimisticData.Id_pipeline)
    await syncQuanLyFileRefsFirebase(oldQuanLyFile, optimisticData.id_quanlyfile || '', optimisticData.Id_pipeline)
    showToast(isUpdate ? 'Đã lưu cập nhật Công việc trong Pipeline!' : 'Đã tạo Công việc mới trong Pipeline!', 'success')
    fetchData()
  } catch (err) {
    console.error('Error saving item to Firebase:', err)
    await showAlert({ title: 'Lỗi lưu dữ liệu', message: String(err.message || err), tone: 'danger' })
    fetchData()
  } finally {
    saving.value = false
  }
}

const requestAction = async (item, actionType) => {
  if (!item) return
  const itemLabel = item.content_of_contract_po || item.ten_cong_ty || item.Id_pipeline
  if (actionType === 'delete') {
    const ok = await askConfirm({
      title: 'Xóa Công Việc Trong Pipeline?',
      targetTag: 'CÔNG VIỆC PIPELINE',
      targetValue: itemLabel,
      message: 'Bạn có chắc chắn muốn xóa vĩnh viễn công việc này? Các liên kết Report con cũng sẽ được gỡ tự động.',
      tone: 'danger',
      confirmText: 'Xóa vĩnh viễn',
      cancelText: 'Hủy'
    })
    if (!ok) return
    if (showModal.value) closeModal()

    const oldReportId = String(item.report_id || '')
    const oldQuanLyFile = String(item.id_quanlyfile || '')
    items.value = items.value.filter((i) => i.Id_pipeline !== item.Id_pipeline)
    distributeItems()

    backgroundSyncing.value = true
    try {
      const key = sanitizeFirebaseKey(item.Id_pipeline)
      await remove(dbRef(database, 'pipeline/' + key))
      await syncLinkRefsFirebase(oldReportId, '', item.Id_pipeline)
      await syncQuanLyFileRefsFirebase(oldQuanLyFile, '', item.Id_pipeline)
      showToast('Đã xóa công việc trong Pipeline!', 'info')
    } catch (err) {
      console.error('Error deleting pipeline:', err)
      fetchData()
    } finally {
      backgroundSyncing.value = false
    }
    return
  }

  const isWin = actionType === 'complete'
  const ok = await askConfirm({
    title: isWin ? 'Xác nhận Chốt Thành Công (100%)?' : 'Đánh dấu Thất Bại (Closed Lost)?',
    targetTag: 'CÔNG VIỆC PIPELINE',
    targetValue: itemLabel,
    message: isWin
      ? 'Chuyển công việc này sang cột THÀNH CÔNG (100%) và ghi nhận vào doanh số đã chốt?'
      : 'Chuyển công việc này sang cột THẤT BẠI (0%)?',
    tone: isWin ? 'success' : 'danger',
    confirmText: isWin ? 'Xác nhận Thành công' : 'Đánh dấu Thất bại',
    cancelText: 'Hủy'
  })
  if (!ok) return

  item.status_name = isWin ? 'THÀNH CÔNG' : 'THẤT BẠI'
  item['%status'] = isWin ? '100%' : '0%'
  item.id_status_workflow = isWin ? 'hoan_thanh' : 'that_bai'
  item.isSuccess = isWin
  distributeItems()
  await syncItemAPI(item)
  showToast(isWin ? 'Công việc đã chốt Thành công (100%)!' : 'Đã chuyển sang cột Thất bại', isWin ? 'success' : 'info')
}

// =========================================================
// CUSTOMERS, TYPE PICKER, REPORTS, QUAN LY FILE & SYNC
// =========================================================
const showCustomerModal = ref(false)
const customerSearchStr = ref('')
const customerSearchMode = ref('pipeline') // 'pipeline' | 'project' | 'project_quick_wf'
const customerPickerFocus = ref('company') // 'company' | 'contact'
const showAddCustomerModal = ref(false)
const isSavingCustomer = ref(false)
const originalCustomerFormDataStr = ref('')
const extraCreatedCustomerTags = ref([])

const defaultCustomerForm = {
  ma_khach_hang: '',
  ten_khach_hang: '',
  tagKH: [],
  so_dien_thoai_ca_nhan: '',
  email_ca_nhan: '',
  ten_khach_hang_phu: '',
  so_dien_thoai_ca_nhan_phu: '',
  email_ca_nhan_phu: '',
  ma_cong_ty: '',
  ten_cong_ty: '',
  mst: '',
  nganh_nghe_cong_ty: '',
  dia_chi_cong_ty: '',
  email_cong_ty: '',
  website_cong_ty: '',
  so_dien_thoai_cong_ty: '',
  so_fax_cong_ty: '',
  company: '',
  address: '',
  tel: '',
  ghi_chu: '',
  hoa_hong: '',
  trang_thai: 'Active',
  last_updated: ''
}

const cloneCustomerFormState = (src = {}) => ({
  ...defaultCustomerForm,
  ...src,
  tagKH: Array.isArray(src?.tagKH) ? [...src.tagKH] : []
})

const customerFormData = ref(cloneCustomerFormState())

const isCustomerDataChanged = computed(() => {
  return JSON.stringify(customerFormData.value) !== originalCustomerFormDataStr.value
})

const formatCustomerLastUpdated = (val) => {
  if (!val && val !== 0) return 'Chưa ghi nhận'
  const rawStr = String(val).trim()
  if (!rawStr) return 'Chưa ghi nhận'
  const dt = /^\d+$/.test(rawStr) ? new Date(Number(rawStr)) : new Date(rawStr)
  if (isNaN(dt.getTime())) return rawStr
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const openCustomerDocPreviewImage = (url, name = 'Xem trước ảnh chứng từ') => {
  if (!url) return
  previewQuanLyFileImage.value = { url, name }
}

const normalizeCustomerRow = (key, row) => {
  if (!row) return null
  if (Array.isArray(row)) {
    const maKH = String(row[0] ?? '')
    const tenKH = String(row[1] ?? '')
    const maCT = String(row[4] ?? '')
    const tenCT = String(row[5] ?? '')
    return {
      ...defaultCustomerForm,
      id: String(key || maKH),
      ma_khach_hang: maKH,
      ten_khach_hang: tenKH,
      ma_cong_ty: maCT,
      ten_cong_ty: tenCT,
      tagKH: [],
      Ma_khach_hang: maKH,
      Ten_khach_hang: tenKH,
      Ma_cong_ty: maCT,
      Ten_cong_ty: tenCT
    }
  }
  const maKH = String(row.ma_khach_hang ?? row.Ma_khach_hang ?? key ?? '')
  const tenKH = String(row.ten_khach_hang ?? row.Ten_khach_hang ?? '')
  const maCT = String(row.ma_cong_ty ?? row.Ma_cong_ty ?? '')
  const tenCT = String(row.ten_cong_ty ?? row.Ten_cong_ty ?? '')
  const tagArr = Array.isArray(row.tagKH)
    ? row.tagKH.map((t) => String(t || '').trim()).filter(Boolean)
    : []
  return {
    ...defaultCustomerForm,
    ...row,
    id: String(row.id ?? key ?? maKH),
    ma_khach_hang: maKH,
    ten_khach_hang: tenKH,
    ma_cong_ty: maCT,
    ten_cong_ty: tenCT,
    mst: String(row.mst ?? row.MST ?? ''),
    tagKH: tagArr,
    Ma_khach_hang: maKH,
    Ten_khach_hang: tenKH,
    Ma_cong_ty: maCT,
    Ten_cong_ty: tenCT
  }
}

const showTypePickerModal = ref(false)
const typePickerSearch = ref('')
const customTypeOptions = ref([])
const DEFAULT_PIPELINE_TYPES = [
  'Renewal',
  'New',
  'Hardware',
  'Software',
  'License',
  'Base Plus',
  'Renewal Plus',
  'Dịch vụ / Triển khai',
  'Bảo trì / Support'
]

const pipelineTypeOptions = computed(() => {
  const countMap = new Map()
  items.value.forEach((it) => {
    const raw = String(it?.type || '').trim()
    if (!raw) return
    const key = raw.toLowerCase()
    const prev = countMap.get(key)
    if (prev) {
      prev.count += 1
    } else {
      countMap.set(key, { value: raw, count: 1 })
    }
  })

  const seen = new Set()
  const out = []
  const pushType = (val) => {
    const clean = String(val || '').trim()
    if (!clean) return
    const k = clean.toLowerCase()
    if (seen.has(k)) return
    seen.add(k)
    const stat = countMap.get(k)
    out.push({ value: stat ? stat.value : clean, count: stat ? stat.count : 0 })
  }

  customTypeOptions.value.forEach(pushType)
  DEFAULT_PIPELINE_TYPES.forEach(pushType)
  Array.from(countMap.values()).forEach((entry) => pushType(entry.value))

  return out
})

const filteredTypeOptions = computed(() => {
  const kw = typePickerSearch.value.trim().toLowerCase()
  if (!kw) return pipelineTypeOptions.value
  return pipelineTypeOptions.value.filter((o) => o.value.toLowerCase().includes(kw))
})

const canAddCustomTypeOption = computed(() => {
  const clean = typePickerSearch.value.trim()
  if (!clean) return false
  return !pipelineTypeOptions.value.some((o) => o.value.toLowerCase() === clean.toLowerCase())
})

const openTypePickerModal = () => {
  typePickerSearch.value = ''
  showTypePickerModal.value = true
}

const selectTypeOption = (val) => {
  formData.value.type = String(val || '').trim()
  showTypePickerModal.value = false
}

const addAndSelectCustomTypeOption = () => {
  const clean = typePickerSearch.value.trim()
  if (!clean) return
  if (!customTypeOptions.value.some((v) => v.toLowerCase() === clean.toLowerCase())) {
    customTypeOptions.value.unshift(clean)
  }
  formData.value.type = clean
  typePickerSearch.value = ''
  showTypePickerModal.value = false
}

const fetchCustomersData = async () => {
  loadingCustomers.value = true
  try {
    const snap = await get(dbRef(database, 'khach_hang'))
    if (snap.exists()) {
      const raw = snap.val()
      const entries = Array.isArray(raw)
        ? raw.map((val, idx) => [String(idx), val])
        : Object.entries(raw || {})
      customersList.value = entries
        .map(([key, row]) => normalizeCustomerRow(key, row))
        .filter(Boolean)
    }
  } catch (e) {
    console.error('Lỗi fetch khach_hang:', e)
  } finally {
    loadingCustomers.value = false
  }
}

const activePickerCompanyHint = computed(() => {
  if (customerSearchMode.value === 'project') return String(projectForm.value.ten_cong_ty || '').trim()
  if (customerSearchMode.value === 'project_quick_wf') return String(quickProjWfForm.value.ten_cong_ty || '').trim()
  return String(formData.value.ten_cong_ty || '').trim()
})

const filteredCustomers = computed(() => {
  const kw = customerSearchStr.value.trim().toLowerCase()
  const compHint = activePickerCompanyHint.value.toLowerCase()
  const isContactFocus = customerPickerFocus.value === 'contact'

  let list = customersList.value
  if (kw) {
    list = list.filter(
      (c) =>
        (c.Ten_khach_hang && c.Ten_khach_hang.toLowerCase().includes(kw)) ||
        (c.Ten_cong_ty && c.Ten_cong_ty.toLowerCase().includes(kw)) ||
        (c.Ma_khach_hang && c.Ma_khach_hang.toLowerCase().includes(kw))
    )
  }

  const mapped = list.map((c) => {
    const isSameComp =
      Boolean(isContactFocus && compHint && c.Ten_cong_ty) &&
      c.Ten_cong_ty.trim().toLowerCase() === compHint
    return {
      ...c,
      _isSameCompany: isSameComp
    }
  })

  if (isContactFocus && compHint) {
    mapped.sort((a, b) => {
      if (a._isSameCompany !== b._isSameCompany) return a._isSameCompany ? -1 : 1
      return 0
    })
  }

  return mapped.slice(0, 80)
})

const isCustomerPickerRowActive = (c) => {
  if (!c) return false
  const target =
    customerSearchMode.value === 'project'
      ? projectForm.value
      : customerSearchMode.value === 'project_quick_wf'
        ? quickProjWfForm.value
        : formData.value
  const curComp = String(target.ten_cong_ty || '').trim().toLowerCase()
  const curCus = String(target.ten_khach_hang || '').trim().toLowerCase()
  const rowComp = String(c.Ten_cong_ty || '').trim().toLowerCase()
  const rowCus = String(c.Ten_khach_hang || '').trim().toLowerCase()
  if (customerPickerFocus.value === 'contact') {
    return Boolean(curCus && rowCus && curCus === rowCus && (!curComp || !rowComp || curComp === rowComp))
  }
  return Boolean(curComp && rowComp && curComp === rowComp && (!curCus || !rowCus || curCus === rowCus))
}

const openCustomerSearch = (mode = 'pipeline', focus = 'company') => {
  customerSearchMode.value = mode
  customerPickerFocus.value = focus
  customerSearchStr.value = ''
  showCustomerModal.value = true
  if (customersList.value.length === 0) fetchCustomersData()
}

const applyManualCustomerSearchInput = () => {
  const val = customerSearchStr.value.trim()
  if (!val) return
  if (customerSearchMode.value === 'pipeline') {
    if (customerPickerFocus.value === 'contact') {
      formData.value.ten_khach_hang = val
    } else {
      formData.value.ten_cong_ty = val
      applyCustomerFlowToModalForm()
    }
  } else if (customerSearchMode.value === 'project') {
    if (customerPickerFocus.value === 'contact') projectForm.value.ten_khach_hang = val
    else projectForm.value.ten_cong_ty = val
  } else if (customerSearchMode.value === 'project_quick_wf') {
    if (customerPickerFocus.value === 'contact') quickProjWfForm.value.ten_khach_hang = val
    else quickProjWfForm.value.ten_cong_ty = val
  }
  showCustomerModal.value = false
}

const clearPipelineCompanyField = () => {
  formData.value.ten_cong_ty = ''
  formData.value.ma_cong_ty = ''
}

const clearPipelineContactField = () => {
  formData.value.ten_khach_hang = ''
  formData.value.ma_khach_hang = formData.value.ten_cong_ty
    ? genMaKH('', formData.value.ten_cong_ty)
    : ''
}

const selectCustomer = (c) => {
  if (customerSearchMode.value === 'project_quick_wf') {
    quickProjWfForm.value.ten_khach_hang = c.Ten_khach_hang
    quickProjWfForm.value.ten_cong_ty = c.Ten_cong_ty
    quickProjWfForm.value.ma_khach_hang = c.Ma_khach_hang
    quickProjWfForm.value.ma_cong_ty = c.Ma_cong_ty
    if (!quickProjWfForm.value.name_workflow) {
      const projLabel =
        showProjectDetailModal.value && activeProjectDetail.value?.ten_du_an
          ? activeProjectDetail.value.ten_du_an
          : 'Flow Riêng'
      quickProjWfForm.value.name_workflow = `${c.Ten_cong_ty || c.Ten_khach_hang} — ${projLabel}`
    }
  } else if (customerSearchMode.value === 'project') {
    projectForm.value.ten_khach_hang = c.Ten_khach_hang
    projectForm.value.ten_cong_ty = c.Ten_cong_ty
    projectForm.value.ma_khach_hang = c.Ma_khach_hang
    projectForm.value.ma_cong_ty = c.Ma_cong_ty
  } else {
    formData.value.ten_khach_hang = c.Ten_khach_hang
    formData.value.ten_cong_ty = c.Ten_cong_ty
    formData.value.ma_khach_hang = c.Ma_khach_hang
    formData.value.ma_cong_ty = c.Ma_cong_ty
    applyCustomerFlowToModalForm()
  }
  showCustomerModal.value = false
}

// =========================================================
// QUẢN LÝ KHÁCH HÀNG, NHÓM KH & IMPORT ĐA ĐỊNH DẠNG (100% GIỐNG REPORTFIREBASE)
// =========================================================
const availableTags = computed(() => {
  const tags = new Set()
  customersList.value.forEach((c) => {
    if (c.tagKH && Array.isArray(c.tagKH)) {
      c.tagKH.forEach((tag) => {
        if (tag) tags.add(tag)
      })
    }
  })
  if (customerFormData.value.tagKH && Array.isArray(customerFormData.value.tagKH)) {
    customerFormData.value.tagKH.forEach((tag) => {
      if (tag) tags.add(tag)
    })
  }
  extraCreatedCustomerTags.value.forEach((tag) => {
    if (tag) tags.add(tag)
  })
  return Array.from(tags).map((tag) => ({ id: tag, name: tag }))
})

const isTagModalOpen = ref(false)
const editingTagId = ref(null)
const editTagValue = ref('')
const tempTagKH = ref('')

const startEditTag = (tagName) => {
  editingTagId.value = tagName
  editTagValue.value = tagName
}

const saveTagEdit = async (oldTagName) => {
  const newTagName = editTagValue.value.trim()
  if (!newTagName || newTagName === oldTagName) {
    editingTagId.value = null
    return
  }

  const updates = {}
  const nowIso = new Date().toISOString()
  customersList.value.forEach((c) => {
    if (c.id && c.tagKH && c.tagKH.includes(oldTagName)) {
      const newTags = c.tagKH.map((t) => (t === oldTagName ? newTagName : t))
      updates[`khach_hang/${c.id}/tagKH`] = newTags
      updates[`khach_hang/${c.id}/last_updated`] = nowIso
      c.tagKH = newTags
      c.last_updated = nowIso
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(dbRef(database), updates)
  }

  if (customerFormData.value.tagKH && customerFormData.value.tagKH.includes(oldTagName)) {
    customerFormData.value.tagKH = customerFormData.value.tagKH.map((t) =>
      t === oldTagName ? newTagName : t
    )
  }
  if (extraCreatedCustomerTags.value.includes(oldTagName)) {
    extraCreatedCustomerTags.value = extraCreatedCustomerTags.value.map((t) =>
      t === oldTagName ? newTagName : t
    )
  }

  editingTagId.value = null
  showToast(`Đã đổi tên nhóm thành "${newTagName}"`, 'success')
}

const deleteTagGlobal = async (tagName) => {
  const confirmDel = await askConfirm({
    title: 'Xoá nhóm khách hàng?',
    targetTag: 'ÁP DỤNG TOÀN BỘ DANH BẠ KHÁCH HÀNG',
    targetValue: tagName,
    message: `Bạn có chắc chắn muốn xoá vĩnh viễn nhóm "${tagName}" khỏi tất cả khách hàng không? Thao tác này chỉ gỡ nhãn nhóm, không xoá hồ sơ khách hàng.`,
    tone: 'danger',
    confirmText: 'Xoá vĩnh viễn',
    cancelText: 'Huỷ bỏ'
  })
  if (!confirmDel) return

  const updates = {}
  const nowIso = new Date().toISOString()
  customersList.value.forEach((c) => {
    if (c.id && c.tagKH && c.tagKH.includes(tagName)) {
      const newTags = c.tagKH.filter((t) => t !== tagName)
      updates[`khach_hang/${c.id}/tagKH`] = newTags
      updates[`khach_hang/${c.id}/last_updated`] = nowIso
      c.tagKH = newTags
      c.last_updated = nowIso
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(dbRef(database), updates)
  }

  if (customerFormData.value.tagKH) {
    customerFormData.value.tagKH = customerFormData.value.tagKH.filter((t) => t !== tagName)
  }
  extraCreatedCustomerTags.value = extraCreatedCustomerTags.value.filter((t) => t !== tagName)
  showToast(`Đã xoá nhóm "${tagName}"`, 'success')
}

const addNewTagFromInput = () => {
  if (!tempTagKH.value) return
  const newTag = tempTagKH.value.trim()
  if (newTag) {
    if (!extraCreatedCustomerTags.value.includes(newTag)) {
      extraCreatedCustomerTags.value.push(newTag)
    }
    if (!Array.isArray(customerFormData.value.tagKH)) {
      customerFormData.value.tagKH = []
    }
    if (!customerFormData.value.tagKH.includes(newTag)) {
      customerFormData.value.tagKH.push(newTag)
    }
  }
  tempTagKH.value = ''
}

const toggleTag = (tagName) => {
  if (!Array.isArray(customerFormData.value.tagKH)) customerFormData.value.tagKH = []
  if (customerFormData.value.tagKH.includes(tagName)) {
    customerFormData.value.tagKH = customerFormData.value.tagKH.filter((t) => t !== tagName)
  } else {
    customerFormData.value.tagKH.push(tagName)
  }
}

watch(
  [() => customerFormData.value.ten_khach_hang, () => customerFormData.value.ten_cong_ty],
  ([ten, congTy]) => {
    if (showAddCustomerModal.value && !customerFormData.value.id) {
      const newMaKH = genMaKH(ten, congTy)
      if (newMaKH || newMaKH === '') {
        customerFormData.value.ma_khach_hang = newMaKH
      }
      customerFormData.value.ma_cong_ty = genMaCT(congTy)
    }
  }
)

const applyCustomerRecordToActiveTarget = (cusRecord) => {
  const maKH = String(cusRecord?.ma_khach_hang ?? cusRecord?.Ma_khach_hang ?? '').trim()
  const tenKH = String(cusRecord?.ten_khach_hang ?? cusRecord?.Ten_khach_hang ?? '').trim()
  const maCT = String(cusRecord?.ma_cong_ty ?? cusRecord?.Ma_cong_ty ?? '').trim()
  const tenCT = String(cusRecord?.ten_cong_ty ?? cusRecord?.Ten_cong_ty ?? '').trim()

  if (customerSearchMode.value === 'project_quick_wf') {
    quickProjWfForm.value.ten_cong_ty = tenCT
    quickProjWfForm.value.ten_khach_hang = tenKH
    quickProjWfForm.value.ma_cong_ty = maCT
    quickProjWfForm.value.ma_khach_hang = maKH
    if (!quickProjWfForm.value.name_workflow) {
      const projLabel =
        showProjectDetailModal.value && activeProjectDetail.value?.ten_du_an
          ? activeProjectDetail.value.ten_du_an
          : 'Dự án'
      quickProjWfForm.value.name_workflow = `${tenCT || tenKH} — ${projLabel}`
    }
  } else if (customerSearchMode.value === 'project') {
    projectForm.value.ten_cong_ty = tenCT
    projectForm.value.ten_khach_hang = tenKH
    projectForm.value.ma_cong_ty = maCT
    projectForm.value.ma_khach_hang = maKH
  } else {
    formData.value.ten_cong_ty = tenCT
    formData.value.ten_khach_hang = tenKH
    formData.value.ma_cong_ty = maCT
    formData.value.ma_khach_hang = maKH
    applyCustomerFlowToModalForm()
  }
  showCustomerModal.value = false
}

const openAddCustomerModal = (mode = 'pipeline') => {
  customerSearchMode.value = mode
  const targetForm =
    mode === 'project'
      ? projectForm.value
      : mode === 'project_quick_wf'
        ? quickProjWfForm.value
        : formData.value

  const curMaKH = String(targetForm?.ma_khach_hang || '').trim()
  const curComp = String(targetForm?.ten_cong_ty || '').trim()
  const pickerTyped = showCustomerModal.value ? String(customerSearchStr.value || '').trim() : ''

  const existsInDb = customersList.value.some(
    (c) =>
      (curMaKH && String(c.ma_khach_hang || c.Ma_khach_hang || '').trim() === curMaKH) ||
      (curComp &&
        String(c.ten_cong_ty || c.Ten_cong_ty || '').trim().toLowerCase() === curComp.toLowerCase())
  )

  let seedComp = ''
  let seedCus = ''
  if (pickerTyped) {
    if (customerPickerFocus.value === 'contact') {
      seedCus = pickerTyped
      if (curComp) seedComp = curComp
    } else {
      seedComp = pickerTyped
    }
  } else if (!existsInDb && curComp) {
    seedComp = curComp
  }

  customerFormData.value = cloneCustomerFormState({
    ten_cong_ty: seedComp,
    ten_khach_hang: seedCus,
    ma_cong_ty: seedComp ? genMaCT(seedComp) : '',
    ma_khach_hang: seedCus || seedComp ? genMaKH(seedCus, seedComp) : ''
  })
  originalCustomerFormDataStr.value = ''
  showAddCustomerModal.value = true
  if (customersList.value.length === 0) fetchCustomersData()
}

const editCustomerFromPicker = (cus) => {
  if (!cus) return
  const normalized = normalizeCustomerRow(cus.id || cus.ma_khach_hang || cus.Ma_khach_hang, cus)
  customerFormData.value = cloneCustomerFormState(normalized)
  originalCustomerFormDataStr.value = JSON.stringify(customerFormData.value)
  showCustomerModal.value = false
  showAddCustomerModal.value = true
}

const resetCustomerModalForm = () => {
  customerFormData.value = cloneCustomerFormState()
  originalCustomerFormDataStr.value = ''
  showToast('Đã làm mới trắng biểu mẫu khách hàng', 'info')
}

const applyExistingCustomerFromModal = () => {
  const code = String(customerFormData.value.ma_khach_hang || '').trim()
  applyCustomerRecordToActiveTarget(customerFormData.value)
  showAddCustomerModal.value = false
  showToast(
    `Đã chọn khách hàng ${customerFormData.value.ten_khach_hang || customerFormData.value.ten_cong_ty || code}`,
    'success'
  )
}

const saveNewCustomer = async () => {
  if (isSavingCustomer.value) return
  if (!customerFormData.value.ten_khach_hang && customerFormData.value.ten_cong_ty) {
    customerFormData.value.ten_khach_hang = customerFormData.value.ten_cong_ty
  }
  if (
    !customerFormData.value.ma_khach_hang &&
    (customerFormData.value.ten_khach_hang || customerFormData.value.ten_cong_ty)
  ) {
    customerFormData.value.ma_khach_hang = genMaKH(
      customerFormData.value.ten_khach_hang,
      customerFormData.value.ten_cong_ty
    )
  }
  if (!customerFormData.value.ma_cong_ty && customerFormData.value.ten_cong_ty) {
    customerFormData.value.ma_cong_ty = genMaCT(customerFormData.value.ten_cong_ty)
  }

  if (!customerFormData.value.ma_khach_hang || !customerFormData.value.ten_khach_hang) {
    showToast('Vui lòng nhập Mã Khách Hàng và Tên Khách Hàng', 'warning')
    return
  }

  isSavingCustomer.value = true
  try {
    const nowIso = new Date().toISOString()
    const sdtCompat =
      customerFormData.value.sdt ||
      customerFormData.value.so_dien_thoai_ca_nhan ||
      customerFormData.value.so_dien_thoai_cong_ty ||
      ''
    const emailCompat =
      customerFormData.value.email ||
      customerFormData.value.email_ca_nhan ||
      customerFormData.value.email_cong_ty ||
      ''
    const diaChiCompat =
      customerFormData.value.dia_chi ||
      customerFormData.value.dia_chi_cong_ty ||
      customerFormData.value.address ||
      ''

    if (customerFormData.value.id) {
      const cusId = String(customerFormData.value.id)
      const cusRef = dbRef(database, 'khach_hang/' + cusId)
      const dataToSave = {
        ...customerFormData.value,
        sdt: sdtCompat,
        email: emailCompat,
        dia_chi: diaChiCompat,
        last_updated: nowIso
      }
      delete dataToSave.id
      delete dataToSave.Ma_khach_hang
      delete dataToSave.Ten_khach_hang
      delete dataToSave.Ma_cong_ty
      delete dataToSave.Ten_cong_ty
      await update(cusRef, dataToSave)

      const updatedNorm = normalizeCustomerRow(cusId, dataToSave)
      const idx = customersList.value.findIndex(
        (c) => c.id === cusId || c.ma_khach_hang === updatedNorm.ma_khach_hang
      )
      if (idx !== -1) {
        customersList.value.splice(idx, 1, updatedNorm)
      } else {
        customersList.value.unshift(updatedNorm)
      }
      showToast('Đã cập nhật thông tin khách hàng', 'success')
    } else {
      const newCusRef = push(dbRef(database, 'khach_hang'))
      const payload = {
        ...customerFormData.value,
        sdt: sdtCompat,
        email: emailCompat,
        dia_chi: diaChiCompat,
        created_time: Date.now(),
        last_updated: nowIso
      }
      delete payload.id
      delete payload.Ma_khach_hang
      delete payload.Ten_khach_hang
      delete payload.Ma_cong_ty
      delete payload.Ten_cong_ty
      await set(newCusRef, payload)

      const createdNorm = normalizeCustomerRow(newCusRef.key, payload)
      if (
        !customersList.value.some(
          (c) => c.id === newCusRef.key || c.ma_khach_hang === payload.ma_khach_hang
        )
      ) {
        customersList.value.unshift(createdNorm)
      }
      showToast('Đã tạo khách hàng mới', 'success')
    }

    applyCustomerRecordToActiveTarget(customerFormData.value)
    showAddCustomerModal.value = false
  } catch (error) {
    console.error('Lỗi khi thêm/sửa KH:', error)
    await showAlert({
      title: 'Không thể lưu khách hàng',
      message: 'Lỗi: ' + (error?.message || error),
      tone: 'danger'
    })
  } finally {
    isSavingCustomer.value = false
  }
}

// --- HỆ THỐNG IMPORT THÔNG MINH TRONG MODAL KHÁCH HÀNG (DXMH / BÁO GIÁ / THUẾ & ĐKKD + AI FALLBACK) ---
const normalizeCustomerCompareStr = (s) => {
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

const findMatchedCustomerInDb = (extracted) => {
  if (!extracted) return null
  const list = Array.isArray(customersList.value) ? customersList.value : []
  if (list.length === 0) return null

  const mstClean = String(extracted.mst || '').replace(/[^0-9A-Za-z-]/g, '').trim()
  const rawComp = String(extracted.ten_cong_ty || '').trim()
  const rawRec = String(extracted.ten_khach_hang || '').trim()
  const normComp = normalizeCustomerCompareStr(rawComp)
  const normRec = normalizeCustomerCompareStr(rawRec)

  // 1. Tra cứu theo MST
  if (mstClean && mstClean.length >= 8) {
    const byMst = list.find(
      (c) => String(c.mst || c.MST || '').replace(/[^0-9A-Za-z-]/g, '').trim() === mstClean
    )
    if (byMst) return byMst
  }

  // 2. Tra cứu theo Mã KH sinh tự động (TenKH-MaCT)
  const genKH = genMaKH(rawRec, rawComp)
  if (genKH) {
    const byMaKH = list.find(
      (c) => String(c.ma_khach_hang || c.Ma_khach_hang || '').trim() === genKH
    )
    if (byMaKH) return byMaKH
  }

  // 3. Tra cứu theo Mã công ty (MaCT)
  const genCT = genMaCT(rawComp || rawRec)
  if (genCT) {
    const byMaCT = list.find(
      (c) =>
        String(c.ma_cong_ty || c.Ma_cong_ty || '').trim() === genCT ||
        String(c.ma_khach_hang || c.Ma_khach_hang || '').trim() === genCT
    )
    if (byMaCT) return byMaCT
  }

  // 4. Tra cứu theo Tên công ty chuẩn hoá
  if (normComp) {
    const compCode = genMaCT(rawComp)
    const byComp = list.find((c) => {
      const cComp = normalizeCustomerCompareStr(c.ten_cong_ty || c.Ten_cong_ty)
      const cKH = normalizeCustomerCompareStr(c.ten_khach_hang || c.Ten_khach_hang)
      if (cComp && cComp === normComp) return true
      if (compCode && compCode.length >= 4 && genMaCT(c.ten_cong_ty || c.Ten_cong_ty) === compCode) {
        return true
      }
      if (!cComp && cKH === normComp) return true
      return false
    })
    if (byComp) return byComp
  }

  // 5. Trường hợp File Báo giá chỉ có Tên người nhận (không có tên công ty)
  if (!normComp && normRec) {
    const byRec = list.find((c) => {
      const cKH = normalizeCustomerCompareStr(c.ten_khach_hang || c.Ten_khach_hang)
      const cComp = normalizeCustomerCompareStr(c.ten_cong_ty || c.Ten_cong_ty)
      return cKH === normRec || cComp === normRec
    })
    if (byRec) return byRec
  }

  return null
}

const cusSmartFileInputRef = ref(null)
const cusSmartImageInputRef = ref(null)
const cusSmartMobPasteRef = ref(null)

const cusSmartImportModal = ref({
  show: false,
  mode: 'khach_dxmh',
  isDragging: false,
  showMobPasteBox: false,
  files: [],
  activeIdx: 0
})

const isCusTaxModalOpen = ref(false)
const cusTaxInfo = ref({
  mst: '',
  tenCongTy: '',
  tenCongTyEn: '',
  diaChi: '',
  nganhNgheChinh: ''
})
const cusTaxPreviewUrl = ref('')
const lastCusTaxFile = ref(null)
const cusTaxScanSourceMode = ref('standard')
const cusTaxSourceIsImage = ref(true)

const cusAiFallbackModal = ref({
  show: false,
  mode: 'khach_dxmh',
  file: null,
  reason: ''
})

const cusImportScanning = ref({
  active: false,
  title: 'Đang quét tài liệu...',
  message: ''
})

const cusSmartImportMeta = computed(() => {
  switch (cusSmartImportModal.value.mode) {
    case 'khach_baogia':
      return {
        title: 'Import Khách Hàng (File Báo Giá)',
        mobTitle: 'Import KH (File Báo Giá)',
        badge: 'Trích xuất Kính gửi & Người nhận',
        iconTone: 'is-violet',
        primaryCta: 'Tải lên & Quét khách hàng'
      }
    case 'thue':
      return {
        title: 'Quét Thông Tin Thuế / ĐKKD',
        mobTitle: 'Quét Thông Tin Thuế',
        badge: 'MST, Tên công ty, Địa chỉ & Ngành nghề',
        iconTone: 'is-sky',
        primaryCta: 'Tải lên & Quét thông tin thuế'
      }
    case 'khach_dxmh':
    default:
      return {
        title: 'Import Khách Hàng (File ĐXMH / PO)',
        mobTitle: 'Import KH (File ĐXMH)',
        badge: 'Trích xuất hồ sơ đối tác',
        iconTone: 'is-emerald',
        primaryCta: 'Tải lên & Quét khách hàng'
      }
  }
})

const cusAiFallbackFlowLabel = computed(() => {
  switch (cusAiFallbackModal.value.mode) {
    case 'khach_baogia':
      return 'Import Khách hàng từ File Báo Giá'
    case 'thue':
      return 'Quét Thông tin Thuế / Đăng ký kinh doanh'
    case 'khach_dxmh':
    default:
      return 'Import Khách hàng từ File ĐXMH / PO'
  }
})

const formatCusImportFileSize = (bytes) => {
  const n = Number(bytes || 0)
  if (!n || n <= 0) return '0 KB'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

const makeCusClipboardTimestampName = () => {
  const d = new Date()
  const pad = (v) => String(v).padStart(2, '0')
  return `Anh_dan_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

const splitCusFileNameAndExt = (rawName, mimeType) => {
  const trimmed = String(rawName || '').trim()
  if (trimmed) {
    const dotIdx = trimmed.lastIndexOf('.')
    if (dotIdx > 0 && dotIdx < trimmed.length - 1) {
      return {
        baseName: trimmed.slice(0, dotIdx),
        ext: trimmed.slice(dotIdx).toLowerCase()
      }
    }
    return { baseName: trimmed, ext: '' }
  }
  const m = String(mimeType || '').toLowerCase()
  let ext = '.png'
  if (m.includes('jpeg') || m.includes('jpg')) ext = '.jpg'
  else if (m.includes('webp')) ext = '.webp'
  else if (m.includes('pdf')) ext = '.pdf'
  return { baseName: makeCusClipboardTimestampName(), ext }
}

const getCusFileCategory = (file) => {
  if (!file) return 'doc'
  if (isImageDocFile(file)) return 'img'
  if (isPdfDocFile(file)) return 'pdf'
  if (isWordDocFile(file)) return 'word'
  return 'excel'
}

const revokeCusPendingPreviews = (list) => {
  if (!Array.isArray(list)) return
  list.forEach((it) => {
    if (it && it.previewUrl) {
      try {
        URL.revokeObjectURL(it.previewUrl)
      } catch (_) {}
    }
  })
}

const buildCusFinalFileFromPending = (item) => {
  if (!item || !item.file) return null
  const cleanBase = String(item.baseName || '').trim() || 'Tai_lieu'
  const ext = String(item.ext || '').trim()
  const finalName =
    ext && !cleanBase.toLowerCase().endsWith(ext.toLowerCase()) ? `${cleanBase}${ext}` : cleanBase
  if (finalName === item.file.name) return item.file
  try {
    return new File([item.file], finalName, {
      type: item.file.type,
      lastModified: item.file.lastModified || Date.now()
    })
  } catch (_) {
    return item.file
  }
}

const openCusSmartImportModal = (mode) => {
  revokeCusPendingPreviews(cusSmartImportModal.value.files)
  cusSmartImportModal.value = {
    show: true,
    mode: mode || 'khach_dxmh',
    isDragging: false,
    showMobPasteBox: false,
    files: [],
    activeIdx: 0
  }
}

const closeCusSmartImportModal = () => {
  revokeCusPendingPreviews(cusSmartImportModal.value.files)
  cusSmartImportModal.value.files = []
  cusSmartImportModal.value.activeIdx = 0
  cusSmartImportModal.value.isDragging = false
  cusSmartImportModal.value.showMobPasteBox = false
  cusSmartImportModal.value.show = false
}

const addFilesToCusSmartImportModal = (rawFiles, fromClipboard = false) => {
  if (!Array.isArray(rawFiles) || rawFiles.length === 0) return
  revokeCusPendingPreviews(cusSmartImportModal.value.files)
  cusSmartImportModal.value.files = []

  const firstRaw = rawFiles[0]
  if (!firstRaw) return
  const isGenericClipName =
    fromClipboard ||
    /^image\.(png|jpe?g|webp|bmp|gif)$/i.test(String(firstRaw.name || '').trim()) ||
    !String(firstRaw.name || '').trim()
  const parsed = splitCusFileNameAndExt(isGenericClipName ? '' : firstRaw.name, firstRaw.type)
  const isImg = isImageDocFile(firstRaw)
  const previewUrl = isImg ? URL.createObjectURL(firstRaw) : ''

  cusSmartImportModal.value.files.push({
    id: `cus_sm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    file: firstRaw,
    baseName: parsed.baseName,
    ext: parsed.ext,
    isImage: isImg,
    category: getCusFileCategory(firstRaw),
    previewUrl,
    sizeLabel: formatCusImportFileSize(firstRaw.size),
    fromClipboard
  })
  cusSmartImportModal.value.activeIdx = 0
}

const removeCusSmartImportPendingItem = (idx) => {
  if (idx < 0 || idx >= cusSmartImportModal.value.files.length) return
  const removed = cusSmartImportModal.value.files.splice(idx, 1)
  revokeCusPendingPreviews(removed)
  cusSmartImportModal.value.activeIdx = 0
}

const onCusSmartImportFileChange = (e) => {
  const input = e?.target
  const list = Array.from(input?.files || [])
  if (input) input.value = ''
  if (!list.length) return
  addFilesToCusSmartImportModal(list, false)
}

const onCusSmartImportDragOver = (e) => {
  e.preventDefault()
  cusSmartImportModal.value.isDragging = true
}

const onCusSmartImportDragLeave = (e) => {
  e.preventDefault()
  cusSmartImportModal.value.isDragging = false
}

const onCusSmartImportDrop = (e) => {
  e.preventDefault()
  cusSmartImportModal.value.isDragging = false
  const list = Array.from(e.dataTransfer?.files || [])
  if (!list.length) return
  addFilesToCusSmartImportModal(list, false)
}

const onCusSmartImportPaste = (e) => {
  if (!cusSmartImportModal.value.show) return
  const targetEl = e?.target
  if (targetEl && targetEl.classList?.contains('cus-smart-name-input')) {
    return
  }
  const items = e.clipboardData?.items
  const pastedFiles = []
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (it.kind === 'file') {
        const blob = it.getAsFile()
        if (blob) pastedFiles.push(blob)
      }
    }
  }
  if (!pastedFiles.length && e.clipboardData?.files?.length) {
    pastedFiles.push(...Array.from(e.clipboardData.files))
  }
  if (!pastedFiles.length) return
  e.preventDefault()
  cusSmartImportModal.value.showMobPasteBox = false
  if (cusSmartMobPasteRef.value) cusSmartMobPasteRef.value.value = ''
  addFilesToCusSmartImportModal(pastedFiles, true)
  showToast('Đã dán tài liệu / ảnh từ bộ nhớ tạm', 'success')
}

const pasteFromMobileClipboardToCusSmartImport = async () => {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.read === 'function') {
      const clipItems = await navigator.clipboard.read()
      const extracted = []
      for (const cItem of clipItems) {
        const matchedType = cItem.types.find(
          (t) => t.startsWith('image/') || t === 'application/pdf'
        )
        if (matchedType) {
          const blob = await cItem.getType(matchedType)
          const ext = matchedType.includes('jpeg')
            ? '.jpg'
            : matchedType.includes('webp')
              ? '.webp'
              : matchedType.includes('pdf')
                ? '.pdf'
                : '.png'
          const file = new File([blob], `${makeCusClipboardTimestampName()}${ext}`, {
            type: matchedType,
            lastModified: Date.now()
          })
          extracted.push(file)
        }
      }
      if (extracted.length > 0) {
        addFilesToCusSmartImportModal(extracted, true)
        cusSmartImportModal.value.showMobPasteBox = false
        showToast('Đã dán ảnh / file từ bộ nhớ tạm', 'success')
        return
      }
    }
  } catch (_) {}
  cusSmartImportModal.value.showMobPasteBox = true
  nextTick(() => {
    cusSmartMobPasteRef.value?.focus?.()
  })
  showToast('Chạm giữ vào ô bên dưới rồi chọn "Dán" để dán ảnh', 'info')
}

const translateCompanyNameToEnglishSafeForCus = async (companyName) => {
  const clean = String(companyName || '').trim()
  if (!clean) return ''
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(clean)}`
    )
    const json = await res.json()
    if (json && json[0] && json[0][0] && json[0][0][0]) {
      return String(json[0][0][0]).trim()
    }
  } catch (err) {
    console.warn('Không dịch được tên tiếng Anh qua Google Translate:', err)
  }
  return ''
}

const applyExtractedCustomerFieldsToPipelineModal = async (fields, toastMsg) => {
  if (!fields) return
  if (customersList.value.length === 0) {
    await fetchCustomersData()
  }

  const clean = (v) => String(v || '').trim()
  const tenKH = clean(fields.Ten_khach_hang)
  const tenCT = clean(fields.Ten_cong_ty || fields.COMPANY)
  const mst = clean(fields.MST)
  const diaChi = clean(fields.Dia_chi_cong_ty)
  const sdtCaNhan = clean(fields.So_dien_thoai_ca_nhan)
  const sdtCongTy = clean(fields.So_dien_thoai_cong_ty)
  const faxCongTy = clean(fields.So_fax_cong_ty)
  const emailCaNhan = clean(fields.Email_ca_nhan)
  const emailCongTy = clean(fields.Email_cong_ty)
  const website = clean(fields.Website_cong_ty)
  const tenKHPhu = clean(fields.Ten_khach_hang_phu)
  const sdtPhu = clean(fields.So_dien_thoai_ca_nhan_phu)
  const companyEn = clean(fields.COMPANY)
  const addressEn = clean(fields.ADDRESS)
  const telEn = clean(fields.TEL)
  const nganhNghe = clean(fields.Nganh_nghe_cong_ty)

  const incomingMap = {
    ten_khach_hang: tenKH,
    ten_cong_ty: tenCT,
    mst,
    nganh_nghe_cong_ty: nganhNghe,
    dia_chi_cong_ty: diaChi,
    so_dien_thoai_ca_nhan: sdtCaNhan,
    so_dien_thoai_cong_ty: sdtCongTy,
    so_fax_cong_ty: faxCongTy,
    email_ca_nhan: emailCaNhan,
    email_cong_ty: emailCongTy,
    website_cong_ty: website,
    ten_khach_hang_phu: tenKHPhu,
    so_dien_thoai_ca_nhan_phu: sdtPhu,
    company: companyEn,
    address: addressEn,
    tel: telEn
  }

  const nonEmptyIncoming = Object.fromEntries(
    Object.entries(incomingMap).filter(([_, val]) => val !== '' && val !== undefined)
  )

  // Trường hợp 1: Đang mở sửa 1 khách hàng đã xác định sẵn trong DB
  if (customerFormData.value.id) {
    customerFormData.value = cloneCustomerFormState({
      ...customerFormData.value,
      ...nonEmptyIncoming,
      id: customerFormData.value.id,
      ma_khach_hang: customerFormData.value.ma_khach_hang,
      ma_cong_ty:
        customerFormData.value.ma_cong_ty ||
        genMaCT(nonEmptyIncoming.ten_cong_ty || customerFormData.value.ten_cong_ty)
    })
    if (toastMsg) showToast(toastMsg, 'success')
    return
  }

  // Trường hợp 2: Đang ở chế độ tạo mới -> kiểm tra xem khách hàng này đã có trong DB chưa
  const matchedInDb = findMatchedCustomerInDb({
    mst: mst || customerFormData.value.mst,
    ten_cong_ty: tenCT || customerFormData.value.ten_cong_ty,
    ten_khach_hang: tenKH || customerFormData.value.ten_khach_hang
  })

  if (matchedInDb) {
    const baseDbSnapshot = cloneCustomerFormState(JSON.parse(JSON.stringify(matchedInDb)))
    originalCustomerFormDataStr.value = JSON.stringify(baseDbSnapshot)
    const fixedMaKH =
      clean(matchedInDb.ma_khach_hang || matchedInDb.Ma_khach_hang) ||
      genMaKH(tenKH || matchedInDb.ten_khach_hang, tenCT || matchedInDb.ten_cong_ty)
    const fixedMaCT =
      clean(matchedInDb.ma_cong_ty || matchedInDb.Ma_cong_ty) ||
      genMaCT(matchedInDb.ten_cong_ty || tenCT || matchedInDb.ten_khach_hang || tenKH)

    customerFormData.value = cloneCustomerFormState({
      ...baseDbSnapshot,
      ...nonEmptyIncoming,
      id: matchedInDb.id,
      ma_khach_hang: fixedMaKH,
      ma_cong_ty: fixedMaCT
    })
    showToast(
      `${toastMsg || 'Đã quét thông tin khách hàng'} • Đã khớp hồ sơ có sẵn trong DB (${fixedMaKH})`,
      'success'
    )
    return
  }

  // Trường hợp 3: Khách hàng mới hoàn toàn
  const mergedDraft = cloneCustomerFormState({
    ...customerFormData.value,
    ...nonEmptyIncoming
  })
  const effectiveTenKH = clean(mergedDraft.ten_khach_hang)
  const effectiveTenCT = clean(mergedDraft.ten_cong_ty)
  mergedDraft.ma_cong_ty = genMaCT(effectiveTenCT)
  mergedDraft.ma_khach_hang = genMaKH(effectiveTenKH, effectiveTenCT)
  customerFormData.value = mergedDraft

  if (toastMsg) showToast(toastMsg, 'success')
}

const openCusAiImportFallback = (mode, file, reason) => {
  cusAiFallbackModal.value = {
    show: true,
    mode: mode || 'khach_dxmh',
    file,
    reason: reason || 'Bộ quét tiêu chuẩn không nhận diện được cấu trúc tài liệu này.'
  }
}

const closeCusAiImportFallback = () => {
  cusAiFallbackModal.value.show = false
  cusAiFallbackModal.value.file = null
}

const processPipelineCustomerImportStandard = async (file, mode) => {
  if (!file) return
  const modeLabel = mode === 'khach_dxmh' ? 'File ĐXMH / PO' : 'File Báo Giá'
  if (isImageDocFile(file)) {
    openCusAiImportFallback(
      mode,
      file,
      `Tài liệu đang ở định dạng hình ảnh nên bộ quét ${modeLabel} tiêu chuẩn không thể đọc trực tiếp.`
    )
    return
  }

  cusImportScanning.value = {
    active: true,
    title: 'Đang quét khách hàng tiêu chuẩn...',
    message: `Đang đọc thông tin đối tác từ ${modeLabel} "${file.name}"...`
  }

  try {
    const stdCustomer =
      mode === 'khach_dxmh'
        ? await parseCustomerDxmhStandardFromFile(file)
        : await parseCustomerQuoteStandardFromFile(file)

    const hasValidCustomer = Boolean(
      stdCustomer &&
        (stdCustomer.Ten_cong_ty ||
          stdCustomer.COMPANY ||
          stdCustomer.Ten_khach_hang ||
          stdCustomer.MST)
    )

    cusImportScanning.value.active = false
    if (!hasValidCustomer || !stdCustomer) {
      openCusAiImportFallback(
        mode,
        file,
        `Quét tiêu chuẩn không nhận diện được Tên công ty / Người liên hệ từ ${modeLabel}.`
      )
      return
    }

    await applyExtractedCustomerFieldsToPipelineModal(
      stdCustomer,
      `Đã import thông tin khách hàng từ ${modeLabel} thành công`
    )
  } catch (err) {
    console.error('Lỗi quét khách hàng tiêu chuẩn:', err)
    cusImportScanning.value.active = false
    openCusAiImportFallback(
      mode,
      file,
      `Quét tiêu chuẩn gặp sự cố định dạng (${String(err?.message || err)}).`
    )
  }
}

const processPipelineTaxFileStandard = async (file) => {
  if (!file) return
  lastCusTaxFile.value = file
  const isImg = isImageDocFile(file)
  cusTaxSourceIsImage.value = isImg
  if (cusTaxPreviewUrl.value) {
    try {
      URL.revokeObjectURL(cusTaxPreviewUrl.value)
    } catch (_) {}
    cusTaxPreviewUrl.value = ''
  }
  if (isImg) {
    cusTaxPreviewUrl.value = URL.createObjectURL(file)
  }

  cusImportScanning.value = {
    active: true,
    title: 'Đang quét thông tin Thuế / ĐKKD...',
    message: 'Đang đọc dữ liệu Mã số thuế & Doanh nghiệp theo chế độ tiêu chuẩn...'
  }

  try {
    const stdRes = await parseTaxStandardFromFile(file, (msg) => {
      cusImportScanning.value.message = msg
    })
    const tx = stdRes?.data
    if (!stdRes?.isSuccess || !tx || (!tx.mst && !tx.tenCongTy)) {
      cusImportScanning.value.active = false
      openCusAiImportFallback(
        'thue',
        file,
        'Quét tiêu chuẩn không nhận diện được Mã số thuế hoặc Tên công ty từ tài liệu này.'
      )
      return
    }

    let companyNameEn = String(tx.tenCongTyEn || '').trim()
    if (!companyNameEn && tx.tenCongTy) {
      companyNameEn = await translateCompanyNameToEnglishSafeForCus(tx.tenCongTy)
    }

    cusTaxInfo.value = {
      mst: tx.mst || '',
      tenCongTy: tx.tenCongTy || '',
      tenCongTyEn: companyNameEn,
      diaChi: tx.diaChi || '',
      nganhNgheChinh: tx.nganhNgheChinh || ''
    }
    cusTaxScanSourceMode.value = 'standard'
    cusImportScanning.value.active = false
    isCusTaxModalOpen.value = true
  } catch (err) {
    console.error('Lỗi quét thuế tiêu chuẩn:', err)
    cusImportScanning.value.active = false
    openCusAiImportFallback(
      'thue',
      file,
      `Quét tiêu chuẩn gặp lỗi định dạng (${String(err?.message || err)}).`
    )
  }
}

const closeCusTaxModal = () => {
  isCusTaxModalOpen.value = false
  if (cusTaxPreviewUrl.value) {
    try {
      URL.revokeObjectURL(cusTaxPreviewUrl.value)
    } catch (_) {}
    cusTaxPreviewUrl.value = ''
  }
}

const confirmCusTaxModalInfo = async () => {
  const tx = cusTaxInfo.value
  closeCusTaxModal()
  await applyExtractedCustomerFieldsToPipelineModal(
    {
      MST: tx.mst,
      Ten_cong_ty: tx.tenCongTy,
      COMPANY: tx.tenCongTyEn,
      Dia_chi_cong_ty: tx.diaChi,
      Nganh_nghe_cong_ty: tx.nganhNgheChinh
    },
    'Đã cập nhật thông tin khách hàng từ tài liệu Thuế / ĐKKD'
  )
}

const submitCusSmartImportStandardScan = async () => {
  const activeItem =
    cusSmartImportModal.value.files[cusSmartImportModal.value.activeIdx] ||
    cusSmartImportModal.value.files[0]
  if (!activeItem) return
  const mode = cusSmartImportModal.value.mode
  const finalFile = buildCusFinalFileFromPending(activeItem)
  closeCusSmartImportModal()
  if (!finalFile) return

  if (mode === 'thue') {
    await processPipelineTaxFileStandard(finalFile)
  } else {
    await processPipelineCustomerImportStandard(finalFile, mode)
  }
}

const confirmCusAiImportFallback = async () => {
  const file = cusAiFallbackModal.value.file
  const mode = cusAiFallbackModal.value.mode
  closeCusAiImportFallback()
  if (!file) return

  if (mode === 'thue') {
    lastCusTaxFile.value = file
    const isImg = isImageDocFile(file)
    cusTaxSourceIsImage.value = isImg
    if (isImg && !cusTaxPreviewUrl.value) {
      cusTaxPreviewUrl.value = URL.createObjectURL(file)
    }

    cusImportScanning.value = {
      active: true,
      title: 'AI đang phân tích Thuế / ĐKKD...',
      message: `AI đang nhận diện thông tin thuế từ "${file.name}"...`
    }

    try {
      const aiRes = await analyzeCustomerOrTaxFileWithAI(file, 'thue', (msg) => {
        cusImportScanning.value.message = msg
      })
      const tx = aiRes?.tax || {}
      if (!tx.mst && !tx.tenCongTy) {
        cusImportScanning.value.active = false
        await showAlert({
          title: 'Không tìm thấy thông tin thuế',
          message: 'AI không trích xuất được Mã số thuế hoặc Tên doanh nghiệp hợp lệ từ tài liệu này.',
          tone: 'info'
        })
        return
      }
      let companyNameEn = String(tx.tenCongTyEn || '').trim()
      if (!companyNameEn && tx.tenCongTy) {
        companyNameEn = await translateCompanyNameToEnglishSafeForCus(tx.tenCongTy)
      }
      cusTaxInfo.value = {
        mst: tx.mst || '',
        tenCongTy: tx.tenCongTy || '',
        tenCongTyEn: companyNameEn,
        diaChi: tx.diaChi || '',
        nganhNgheChinh: tx.nganhNgheChinh || ''
      }
      cusTaxScanSourceMode.value = 'ai'
      cusImportScanning.value.active = false
      isCusTaxModalOpen.value = true
      showToast('AI đã phân tích thông tin thuế thành công', 'success')
    } catch (err) {
      console.error('Lỗi AI quét thông tin thuế:', err)
      cusImportScanning.value.active = false
      await showAlert({
        title: 'Lỗi phân tích AI',
        message: String(err?.message || err),
        tone: 'danger'
      })
    }
    return
  }

  // Luồng AI cho khách hàng từ File ĐXMH hoặc File Báo Giá
  const modeLabel = mode === 'khach_dxmh' ? 'File ĐXMH / PO' : 'File Báo Giá'
  const aiContextMode = mode === 'khach_dxmh' ? 'dxmh' : 'bao_gia'

  cusImportScanning.value = {
    active: true,
    title: 'AI đang phân tích khách hàng...',
    message: `AI đang trích xuất thông tin đối tác từ "${file.name}"...`
  }

  try {
    const aiRes = await analyzeCustomerOrTaxFileWithAI(file, aiContextMode, (msg) => {
      cusImportScanning.value.message = msg
    })
    const c = aiRes?.customer || {}
    if (!c.Ten_cong_ty && !c.COMPANY && !c.Ten_khach_hang && !c.MST) {
      cusImportScanning.value.active = false
      await showAlert({
        title: 'Không tìm thấy khách hàng',
        message: `AI không tìm thấy Tên công ty, Người liên hệ hoặc Mã số thuế trong "${file.name}".`,
        tone: 'info'
      })
      return
    }

    cusImportScanning.value.active = false
    await applyExtractedCustomerFieldsToPipelineModal(
      c,
      `AI đã trích xuất thông tin khách hàng từ ${modeLabel} thành công`
    )
  } catch (err) {
    console.error('Lỗi AI trích xuất khách hàng:', err)
    cusImportScanning.value.active = false
    await showAlert({
      title: 'Lỗi phân tích AI',
      message: String(err?.message || err),
      tone: 'danger'
    })
  }
}

watch(showAddCustomerModal, (open) => {
  if (!open) {
    if (cusSmartImportModal.value.show) closeCusSmartImportModal()
    if (isCusTaxModalOpen.value) closeCusTaxModal()
    if (cusAiFallbackModal.value.show) closeCusAiImportFallback()
    if (isTagModalOpen.value) isTagModalOpen.value = false
  }
})

const detachReportFromOtherPipelinesFirebase = async (repId, prevPipeIds, keepPipelineId) => {
  const toClean = (prevPipeIds || []).filter((pid) => pid && pid !== keepPipelineId)
  if (toClean.length === 0) return

  await Promise.all(
    toClean.map(async (prevPid) => {
      try {
        const localIdx = items.value.findIndex((i) => i.Id_pipeline === prevPid)
        if (localIdx !== -1) {
          const curReps = String(items.value[localIdx].report_id || '')
            .split(',')
            .map((s) => s.trim())
            .filter((x) => x && x !== repId)
          items.value[localIdx].report_id = curReps.join(', ')
        }

        const prevRef = dbRef(database, 'pipeline/' + sanitizeFirebaseKey(prevPid))
        const prevSnap = await get(prevRef)
        if (!prevSnap.exists()) return
        const prevVal = prevSnap.val()
        if (Array.isArray(prevVal)) {
          const cur = String(prevVal[1] || '').split(',').map((s) => s.trim()).filter((x) => x && x !== repId)
          prevVal[1] = cur.join(', ')
          await set(prevRef, prevVal)
        } else if (prevVal && typeof prevVal === 'object') {
          const rawRep = prevVal.report_id ?? prevVal.REPORT_ID ?? ''
          const cur = String(rawRep).split(',').map((s) => s.trim()).filter((x) => x && x !== repId)
          const joined = cur.join(', ')
          const updates = { report_id: joined }
          if ('REPORT_ID' in prevVal) updates.REPORT_ID = joined
          await update(prevRef, updates)
        }
      } catch (err) {
        console.error('Lỗi gỡ Report khỏi Pipeline cũ:', prevPid, err)
      }
    })
  )
}

const syncLinkRefsFirebase = async (oldReportIdStr, newReportIdStr, pipelineId) => {
  if (!pipelineId) return
  const oldIds = String(oldReportIdStr || '').split(',').map((s) => s.trim()).filter(Boolean)
  const newIds = String(newReportIdStr || '').split(',').map((s) => s.trim()).filter(Boolean)
  const added = newIds.filter((id) => !oldIds.includes(id))
  const removed = oldIds.filter((id) => !newIds.includes(id))
  if (added.length === 0 && removed.length === 0) return

  const targetIds = [...new Set([...added, ...removed])]
  await Promise.all(
    targetIds.map(async (repId) => {
      try {
        const repRef = dbRef(database, 'REPORT/' + sanitizeFirebaseKey(repId))
        const snap = await get(repRef)
        if (!snap.exists()) return
        const repVal = snap.val()
        if (Array.isArray(repVal)) {
          const cur = String(repVal[11] || '').split(',').map((s) => s.trim()).filter(Boolean)
          if (added.includes(repId)) {
            repVal[11] = pipelineId
            await set(repRef, repVal)
            await detachReportFromOtherPipelinesFirebase(repId, cur, pipelineId)
          } else if (removed.includes(repId)) {
            const next = cur.filter((x) => x !== pipelineId)
            repVal[11] = next[0] || ''
            await set(repRef, repVal)
          }
        } else if (repVal && typeof repVal === 'object') {
          const rawField = repVal.id_pipeline ?? repVal.ID_PIPELINE ?? ''
          const cur = String(rawField).split(',').map((s) => s.trim()).filter(Boolean)
          if (added.includes(repId)) {
            const updates = { id_pipeline: pipelineId }
            if ('ID_PIPELINE' in repVal) updates.ID_PIPELINE = pipelineId
            await update(repRef, updates)
            await detachReportFromOtherPipelinesFirebase(repId, cur, pipelineId)
          } else if (removed.includes(repId)) {
            const next = cur.filter((x) => x !== pipelineId)
            const singleRemaining = next[0] || ''
            const updates = { id_pipeline: singleRemaining }
            if ('ID_PIPELINE' in repVal) updates.ID_PIPELINE = singleRemaining
            await update(repRef, updates)
          }
        }
      } catch (e) {
        console.error('Lỗi syncLinkRefsFirebase:', repId, e)
      }
    })
  )
  distributeItems()
}

const syncQuanLyFileRefsFirebase = async (oldQlfStr, newQlfStr, pipelineId) => {
  if (!pipelineId) return
  const oldIds = String(oldQlfStr || '').split(',').map((s) => s.trim()).filter(Boolean)
  const newIds = String(newQlfStr || '').split(',').map((s) => s.trim()).filter(Boolean)
  const added = newIds.filter((id) => !oldIds.includes(id))
  const removed = oldIds.filter((id) => !newIds.includes(id))
  if (added.length === 0 && removed.length === 0) return

  const targetIds = [...new Set([...added, ...removed])]
  await Promise.all(
    targetIds.map(async (qlfId) => {
      try {
        const qlfRef = dbRef(database, 'quan_ly_file/' + sanitizeFirebaseKey(qlfId))
        const snap = await get(qlfRef)
        if (!snap.exists()) return
        const qlfVal = snap.val()
        if (qlfVal && typeof qlfVal === 'object' && !Array.isArray(qlfVal)) {
          const rawField = qlfVal.id_pipeline ?? qlfVal.ID_PIPELINE ?? ''
          const cur = String(rawField).split(',').map((s) => s.trim()).filter(Boolean)
          let next = cur
          if (added.includes(qlfId) && !cur.includes(pipelineId)) next = [...cur, pipelineId]
          if (removed.includes(qlfId)) next = cur.filter((x) => x !== pipelineId)
          const joined = next.join(', ')
          const updates = { id_pipeline: joined }
          if ('ID_PIPELINE' in qlfVal) updates.ID_PIPELINE = joined
          await update(qlfRef, updates)
        }
      } catch (e) {
        console.error('Lỗi syncQuanLyFileRefsFirebase:', qlfId, e)
      }
    })
  )
}

const showReportContentModal = ref(false)
const showReportDropdown = ref(false)
const showQuanLyFileDropdown = ref(false)
const reportContentSearchStr = ref('')
const reportFilterDay = ref('')
const reportFilterMonth = ref('')
const reportFilterYear = ref('')
const reportContentPage = ref(1)
const quanLyFileSearchStr = ref('')
const quanLyFileFilterDate = ref('')
const quanLyFilePage = ref(1)
const previewQuanLyFileImage = ref(null)

const REPORT_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const REPORT_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

const parseReportDateParts = (rawTime) => {
  if (!rawTime) return null
  const str = String(rawTime).trim()
  const dmyMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0')
    const month = dmyMatch[2].padStart(2, '0')
    const year = dmyMatch[3]
    let hh = 0
    let mm = 0
    let ss = 0
    const timeMatch = str.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/)
    if (timeMatch) {
      hh = Number(timeMatch[1]) || 0
      mm = Number(timeMatch[2]) || 0
      ss = Number(timeMatch[3]) || 0
    }
    const ts = new Date(Number(year), Number(month) - 1, Number(day), hh, mm, ss).getTime()
    return { day, month, year, ts: Number.isFinite(ts) ? ts : 0 }
  }
  const isoMatch = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoMatch) {
    const year = isoMatch[1]
    const month = isoMatch[2].padStart(2, '0')
    const day = isoMatch[3].padStart(2, '0')
    const ts = new Date(Number(year), Number(month) - 1, Number(day)).getTime()
    return { day, month, year, ts: Number.isFinite(ts) ? ts : 0 }
  }
  return null
}

const reportAvailableYears = computed(() => {
  const curY = new Date().getFullYear()
  const years = new Set([String(curY + 1), String(curY), String(curY - 1), String(curY - 2)])
  reports.value.forEach((r) => {
    const p = parseReportDateParts(r.thoi_gian)
    if (p?.year) years.add(p.year)
  })
  if (reportFilterYear.value) years.add(reportFilterYear.value)
  return Array.from(years).sort((a, b) => Number(b) - Number(a))
})

const reportExactDateValue = computed(() => {
  if (reportFilterYear.value && reportFilterMonth.value && reportFilterDay.value) {
    return `${reportFilterYear.value}-${reportFilterMonth.value}-${reportFilterDay.value}`
  }
  return ''
})

const onPickReportExactDate = (isoVal) => {
  const clean = String(isoVal || '').trim()
  if (!clean) {
    reportFilterDay.value = ''
    reportFilterMonth.value = ''
    reportFilterYear.value = ''
    return
  }
  const [y, m, d] = clean.split('-')
  if (y && m && d) {
    reportFilterYear.value = y
    reportFilterMonth.value = m.padStart(2, '0')
    reportFilterDay.value = d.padStart(2, '0')
  }
}

const hasActiveReportDateFilter = computed(() =>
  Boolean(reportFilterDay.value || reportFilterMonth.value || reportFilterYear.value)
)

const resetReportDateFilter = () => {
  reportFilterDay.value = ''
  reportFilterMonth.value = ''
  reportFilterYear.value = ''
}

watch([reportContentSearchStr, reportFilterDay, reportFilterMonth, reportFilterYear], () => {
  reportContentPage.value = 1
})
watch([quanLyFileSearchStr, quanLyFileFilterDate], () => {
  quanLyFilePage.value = 1
})

const openReportInNewTab = (repId) => {
  const cleanId = String(repId || '').trim()
  if (!cleanId || typeof window === 'undefined') return
  const resolved = router.resolve({ path: '/report-firebase', query: { openId: cleanId } })
  window.open(resolved.href, '_blank', 'noopener,noreferrer')
}

const getFileIconSvg = (fileName, fileUrl = '') => {
  const check = `${fileName || ''} ${fileUrl || ''}`.toLowerCase()
  const isPdf = /\.pdf(\?|#|\s|$)/i.test(check)
  const isWord = /\.(docx?|rtf)(\?|#|\s|$)/i.test(check) || (!isPdf && check.includes('word'))
  const isImage = /\.(png|jpe?g|webp|gif|bmp|svg|jfif|tiff?)(\?|#|\s|$)/i.test(check)
  const isExcel =
    /\.(xlsx?|xls|xlsm|xlsb|csv)(\?|#|\s|$)/i.test(check) ||
    (!isPdf && !isWord && !isImage && (check.includes('excel') || check.includes('báo giá') || check.includes('mua hàng') || check.includes('dxmh')))

  if (isExcel) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"/><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"/><path fill="#2E7D32" d="M27,42L6,38.746C5.416,38.655,5,38.146,5,37.555v-27.11c0-0.591,0.416-1.1,1-1.191L27,6V42z"/><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"/></svg>`
  }
  if (isPdf) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#FF1744" d="M38,42H10c-2.2,0-4-1.8-4-4V10c0-2.2,1.8-4,4-4h19l13,13v19C42,40.2,40.2,42,38,42z"/><path fill="#B71C1C" d="M29,6v9c0,2.2,1.8,4,4,4h9L29,6z"/><path fill="#FFF" d="M13.5,27v-8h3.3c1.8,0,2.9,1,2.9,2.6c0,1.6-1.1,2.6-2.9,2.6h-1.4V27H13.5z M15.4,22.6h1.2c0.8,0,1.2-0.4,1.2-1.1c0-0.7-0.4-1.1-1.2-1.1h-1.2V22.6z M21.2,27v-8h3c2.5,0,4.1,1.5,4.1,4c0,2.5-1.6,4-4.1,4H21.2z M23.1,25.4h1c1.4,0,2.2-0.9,2.2-2.4c0-1.5-0.8-2.4-2.2-2.4h-1V25.4z M29.9,27v-8h5.4v1.6h-3.5v1.7h3.1v1.6h-3.1V27H29.9z"/><rect x="13.5" y="30" width="21" height="2" rx="1" fill="#FFF"/><rect x="13.5" y="33.5" width="16" height="2" rx="1" fill="#FFF"/><rect x="13.5" y="37" width="12" height="2" rx="1" fill="#FFF"/></svg>`
  }
  if (isWord) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#2196F3" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"/><path fill="#FFF" d="M25 15H39V17.5H25zM25 20H39V22.5H25zM25 25H39V27.5H25zM25 30H35V32.5H25z"/><path fill="#1565C0" d="M27,42L6,38.746C5.416,38.655,5,38.146,5,37.555v-27.11c0-0.591,0.416-1.1,1-1.191L27,6V42z"/><path fill="#FFF" d="M21.8,17h-2.7l-1.5,8.6L15.8,17h-2.5l-1.9,8.6L9.9,17H7.1l2.8,14h2.7l1.9-8.3l1.8,8.3H19l2.8-14z"/></svg>`
  }
  if (isImage) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><rect x="6" y="8" width="36" height="32" rx="4" fill="#29B6F6"/><circle cx="16.5" cy="17.5" r="4" fill="#FFD54F"/><path fill="#0277BD" d="M23,25l-11,13h26c2.2,0,4-1.8,4-4v-2L31,20L23,25z"/><path fill="#4FC3F7" d="M16,24L6,36c0,2.2,1.8,4,4,4h22L16,24z"/></svg>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#90CAF9" d="M38,42H10c-2.2,0-4-1.8-4-4V10c0-2.2,1.8-4,4-4h19l13,13v19C42,40.2,40.2,42,38,42z"/><path fill="#1976D2" d="M29,6v9c0,2.2,1.8,4,4,4h9L29,6z"/><rect x="14" y="23" width="20" height="2.5" rx="1.2" fill="#1565C0"/><rect x="14" y="29" width="20" height="2.5" rx="1.2" fill="#1565C0"/><rect x="14" y="35" width="13" height="2.5" rx="1.2" fill="#1565C0"/></svg>`
}

const extractCleanExt = (val) => {
  if (!val) return ''
  const clean = String(val).trim().split('?')[0].split('#')[0]
  const dot = clean.lastIndexOf('.')
  if (dot === -1 || dot === clean.length - 1) return ''
  return clean.slice(dot + 1).toLowerCase()
}

const detectReportAttachmentKind = (url, name, source, forceKind = '') => {
  if (forceKind === 'image') return 'image'
  const ext = extractCleanExt(name) || extractCleanExt(url)
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'jfif', 'tif', 'tiff'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['xls', 'xlsx', 'xlsm', 'xlsb', 'csv', 'doc', 'docx', 'rtf', 'ppt', 'pptx'].includes(ext)) return 'office'
  if ((source === 'bao_gia' || source === 'mua_hang') && ext !== 'pdf') return 'office'
  return 'other'
}

const getOfficeViewUrl = (url) => {
  if (!url) return ''
  const lower = String(url).toLowerCase()
  if (lower.includes('docs.google.com') || lower.includes('drive.google.com')) return url
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
}

const getReportAttIconSvg = (att) => {
  if (att && att.kind === 'image') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><rect x="6" y="8" width="36" height="32" rx="4" fill="#29B6F6"/><circle cx="16.5" cy="17.5" r="4" fill="#FFD54F"/><path fill="#0277BD" d="M23,25l-11,13h26c2.2,0,4-1.8,4-4v-2L31,20L23,25z"/><path fill="#4FC3F7" d="M16,24L6,36c0,2.2,1.8,4,4,4h22L16,24z"/></svg>`
  }
  return getFileIconSvg((att && att.name) || '', (att && att.url) || '')
}

const openReportAttachmentView = (att) => {
  if (!att || !att.url || att.url === '#') return
  const kind = att.kind || detectReportAttachmentKind(att.url, att.name, 'direct')
  if (kind === 'image') {
    previewQuanLyFileImage.value = { url: att.url, name: att.name || 'Hình ảnh đính kèm' }
    return
  }
  if (typeof window === 'undefined') return
  if (kind === 'office') {
    window.open(getOfficeViewUrl(att.url), '_blank', 'noopener,noreferrer')
    return
  }
  window.open(att.url, '_blank', 'noopener,noreferrer')
}

const extractCleanFileName = (rawUrl, fallback = 'File') => {
  if (!rawUrl) return fallback
  try {
    const seg = String(rawUrl).trim().split('?')[0].split('/').pop()
    return decodeURIComponent(seg || fallback)
  } catch {
    return fallback
  }
}

const resolveReportObj = (repOrId) => {
  if (!repOrId) return null
  if (typeof repOrId === 'object') {
    if (repOrId.link_excel_bao_gia !== undefined || repOrId.link_excel_mua_hang !== undefined || repOrId.img_save !== undefined) {
      return repOrId
    }
    return reports.value.find((r) => r.id === repOrId.id) || repOrId
  }
  return reports.value.find((r) => r.id === String(repOrId).trim()) || null
}

const getUnifiedReportAttachments = (repOrId) => {
  const rep = resolveReportObj(repOrId)
  if (!rep) return []
  const list = []
  const seen = new Set()

  const pushEntry = (rawUrl, rawName, source, badgeLabel, badgeCls, forceKind = '') => {
    const url = typeof rawUrl === 'string' ? rawUrl.trim() : ''
    if (!url || seen.has(url)) return
    seen.add(url)
    const name = rawName && String(rawName).trim() ? String(rawName).trim() : extractCleanFileName(url, badgeLabel)
    const kind = detectReportAttachmentKind(url, name, source, forceKind)
    list.push({
      url,
      name,
      source,
      badgeLabel,
      badgeCls,
      kind
    })
  }

  const parseMultiLinks = (linksRaw, namesRaw, source, badgeLabel, badgeCls, fallbackPrefix, forceKind = '') => {
    if (!linksRaw) return
    const links = String(linksRaw).split('\n').map((s) => s.trim()).filter(Boolean)
    const names = namesRaw ? String(namesRaw).split('\n').map((s) => s.trim()) : []
    links.forEach((url, idx) => {
      const explicitName = names[idx] && names[idx].trim() ? names[idx].trim() : ''
      pushEntry(
        url,
        explicitName || extractCleanFileName(url, `${fallbackPrefix}_${idx + 1}`),
        source,
        badgeLabel,
        badgeCls,
        forceKind
      )
    })
  }

  parseMultiLinks(
    rep.link_excel_bao_gia || rep.LINK_EXCEL_BAO_GIA,
    rep.ten_file_bao_gia || rep.TEN_FILE_BAO_GIA,
    'bao_gia',
    'BÁO GIÁ',
    'is-bg',
    'Bao_gia'
  )
  parseMultiLinks(
    rep.link_excel_mua_hang || rep.LINK_EXCEL_MUA_HANG,
    rep.ten_file_mua_hang || rep.TEN_FILE_MUA_HANG,
    'mua_hang',
    'DXMH/KHÁC',
    'is-mh',
    'DXMH'
  )
  parseMultiLinks(
    rep.img_save || rep.IMG_SAVE,
    rep.ten_file_img || rep.TEN_FILE_IMG,
    'image',
    'ẢNH',
    'is-img',
    'Hinh',
    'image'
  )

  const qlfId = String(rep.id_quanlyfile || rep.ID_QUANLYFILE || '').trim()
  if (qlfId && Array.isArray(quanLyFiles.value) && quanLyFiles.value.length > 0) {
    const linked = quanLyFiles.value.find((f) => String(f.id) === qlfId)
    if (linked) {
      const linkedFiles = Array.isArray(linked.linkFileBaoGia)
        ? linked.linkFileBaoGia
        : typeof linked.linkFileBaoGia === 'string' && linked.linkFileBaoGia.trim()
          ? [linked.linkFileBaoGia]
          : []
      linkedFiles.forEach((fObj, idx) => {
        const u = typeof fObj === 'string' ? fObj : fObj?.url || ''
        const n = typeof fObj === 'object' && fObj?.name ? fObj.name : extractCleanFileName(u, `File_LK_${idx + 1}`)
        pushEntry(u, n, 'bao_gia', 'BÁO GIÁ', 'is-bg')
      })

      const linkedImgs = Array.isArray(linked.linkImgSave)
        ? linked.linkImgSave
        : typeof linked.linkImgSave === 'string' && linked.linkImgSave.trim()
          ? [linked.linkImgSave]
          : []
      linkedImgs.forEach((imgObj, idx) => {
        const u = typeof imgObj === 'string' ? imgObj : imgObj?.url || ''
        const n = typeof imgObj === 'object' && imgObj?.name ? imgObj.name : extractCleanFileName(u, `Anh_LK_${idx + 1}`)
        pushEntry(u, n, 'image', 'ẢNH', 'is-img', 'image')
      })
    }
  }

  return list
}

const filteredReportContents = computed(() => {
  let list = reports.value.slice()

  if (reportFilterDay.value || reportFilterMonth.value || reportFilterYear.value) {
    list = list.filter((r) => {
      const p = parseReportDateParts(r.thoi_gian)
      if (!p) return false
      if (reportFilterDay.value && p.day !== reportFilterDay.value) return false
      if (reportFilterMonth.value && p.month !== reportFilterMonth.value) return false
      if (reportFilterYear.value && p.year !== reportFilterYear.value) return false
      return true
    })
  }

  const kw = reportContentSearchStr.value.trim().toLowerCase()
  if (kw) {
    list = list.filter((r) => {
      if (r.noi_dung && r.noi_dung.toLowerCase().includes(kw)) return true
      if (r.ghi_chu && r.ghi_chu.toLowerCase().includes(kw)) return true
      const atts = getUnifiedReportAttachments(r)
      return atts.some((a) => a.name && a.name.toLowerCase().includes(kw))
    })
  }

  return list.sort((a, b) => {
    const tsA = parseReportDateParts(a.thoi_gian)?.ts || 0
    const tsB = parseReportDateParts(b.thoi_gian)?.ts || 0
    return tsB - tsA
  })
})

const paginatedReportContents = computed(() => filteredReportContents.value.slice(0, reportContentPage.value * 15))
const hasMoreReports = computed(() => paginatedReportContents.value.length < filteredReportContents.value.length)
const loadMoreReports = () => { reportContentPage.value += 1 }

const formatReportTime = (thoi_gian) => {
  if (!thoi_gian) return ''
  const parts = thoi_gian.split(' /')
  if (parts.length === 3) {
    const timePart = parts[0].trim()
    let thuPart = parts[1].trim()
    const datePart = parts[2].trim()
    thuPart = thuPart === '8' || thuPart.toUpperCase() === 'CN' ? 'Chủ nhật' : `thứ ${thuPart}`
    return `${timePart}, ${thuPart}, ${datePart}`
  }
  return thoi_gian
}

const selectReportContent = (rep) => {
  formData.value.content_of_contract_po = rep.noi_dung || rep.id
  showReportContentModal.value = false
}

const selectedReportIds = computed(() =>
  (formData.value.report_id || '').split(',').map((s) => s.trim()).filter(Boolean)
)
const selectedReports = computed(() =>
  selectedReportIds.value.map((id) => reports.value.find((r) => r.id === id) || { id, noi_dung: id }).filter(Boolean)
)

const openReportPickerModal = () => {
  reportContentSearchStr.value = ''
  resetReportDateFilter()
  showReportDropdown.value = true
}

const getReportOtherOwnerLabel = (rep) => {
  if (!rep || !rep.id_pipeline) return ''
  const curPipeId = String(formData.value.Id_pipeline || '').trim()
  const ownerIds = String(rep.id_pipeline)
    .split(',')
    .map((s) => s.trim())
    .filter((pid) => pid && pid !== curPipeId)
  if (ownerIds.length === 0) return ''
  const ownerPipe = items.value.find((p) => p.Id_pipeline === ownerIds[0])
  if (!ownerPipe) return ownerIds[0]
  return ownerPipe.content_of_contract_po || ownerPipe.ten_cong_ty || ownerPipe.ten_khach_hang || ownerPipe.Id_pipeline
}

const selectReport = (id) => {
  if (!id) return
  let ids = [...selectedReportIds.value]
  ids = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
  formData.value.report_id = ids.join(', ')
}

const getReportDetails = (id) => {
  const rep = reports.value.find((r) => r.id === id)
  return rep ? { noi_dung: rep.noi_dung || rep.id, ghi_chu: rep.ghi_chu || '' } : { noi_dung: id, ghi_chu: '' }
}

const getReportAttachedFiles = (repOrId) =>
  getUnifiedReportAttachments(repOrId)
    .filter((a) => a.kind !== 'image')
    .map((a) => ({ url: a.url, name: a.name }))

const getReportAttachedImages = (repOrId) =>
  getUnifiedReportAttachments(repOrId)
    .filter((a) => a.kind === 'image')
    .map((a) => ({ url: a.url, name: a.name }))

const getReportTotalAttachmentsCount = (repOrId) => getUnifiedReportAttachments(repOrId).length

const getCardReportAttachmentCount = (pipe) =>
  getPipeReportIds(pipe).reduce((sum, repId) => sum + getReportTotalAttachmentsCount(repId), 0)

// =========================================================
// KANBAN COMPACT FILE VAULT (2 SOURCES: REPORT & DIRECT UPLOAD)
// =========================================================
const vaultFileSearchQuery = ref('')
const vaultFileCategoryFilter = ref('all')

const displayedKanbanItems = computed(() =>
  items.value.filter((item) => {
    const wfMatch =
      selectedWorkflowId.value === 'WF_DEFAULT'
        ? !item.id_workflow || item.id_workflow === 'WF_DEFAULT'
        : item.id_workflow === selectedWorkflowId.value
    return wfMatch && matchesSearch(item)
  })
)

const activeKanbanFilesVault = computed(() => {
  const reportFileMap = new Map()
  const directFileMap = new Map()

  const reportByIdMap = new Map()
  const reverseReportMap = new Map()

  reports.value.forEach((rep) => {
    if (!rep || !rep.id) return
    const rid = String(rep.id).trim()
    if (!rid) return
    reportByIdMap.set(rid, rep)

    const rawPipes = String(rep.id_pipeline || rep.ID_PIPELINE || '')
    if (rawPipes) {
      rawPipes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((pid) => {
          if (!reverseReportMap.has(pid)) reverseReportMap.set(pid, [])
          reverseReportMap.get(pid).push(rid)
        })
    }
  })

  displayedKanbanItems.value.forEach((pipe) => {
    if (!pipe || !pipe.Id_pipeline) return
    const pipeId = String(pipe.Id_pipeline).trim()
    const pipeTitle = String(pipe.content_of_contract_po || pipe.ma_hop_dong || pipeId).trim()
    const partyLabel = String(pipe.ten_cong_ty || pipe.ten_khach_hang || '').trim()
    const ownerSummary = partyLabel ? `${pipeTitle} (${partyLabel})` : pipeTitle

    const reportCoveredQlfIds = new Set()
    const linkedRepIds = [
      ...new Set([
        ...getPipeReportIds(pipe),
        ...(reverseReportMap.get(pipeId) || [])
      ])
    ]

    // 1. Source A: Files from Linked Reports
    linkedRepIds.forEach((repId) => {
      const rep = reportByIdMap.get(repId) || null
      if (rep) {
        const qlfId = String(rep.id_quanlyfile || rep.ID_QUANLYFILE || '').trim()
        if (qlfId) reportCoveredQlfIds.add(qlfId)
      }
      const repTitle = String(rep?.noi_dung || rep?.ghi_chu || repId).trim()
      const atts = getUnifiedReportAttachments(rep || repId)

      atts.forEach((att) => {
        if (!att || !att.url) return
        const existing = reportFileMap.get(att.url)
        if (existing) {
          if (existing.primaryPipeId !== pipeId) existing.extraOwnerCount += 1
          return
        }
        reportFileMap.set(att.url, {
          key: `rf_${reportFileMap.size}_${pipeId}`,
          url: att.url,
          name: att.name,
          kind: att.kind,
          source: att.source,
          originGroup: 'report',
          badgeLabel: att.badgeLabel,
          badgeCls: att.badgeCls,
          primaryPipeId: pipeId,
          pipeTitle,
          partyLabel,
          ownerSummary,
          extraOwnerCount: 0,
          reportId: repId,
          reportTitle: repTitle,
          tooltip: `${att.name}\n• Nguồn Report: ${repTitle}\n• Công việc: ${ownerSummary}`
        })
      })
    })

    // 2. Source B: Files Uploaded Directly on Pipeline Task
    const pushDirectEntry = (rawUrl, rawName, forceKind = '') => {
      const url = typeof rawUrl === 'string' ? rawUrl.trim() : ''
      if (!url || url === '#') return
      const existing = directFileMap.get(url)
      if (existing) {
        if (existing.primaryPipeId !== pipeId) existing.extraOwnerCount += 1
        return
      }
      const name = rawName && String(rawName).trim() ? String(rawName).trim() : extractCleanFileName(url, 'File_CV')
      const kind = detectReportAttachmentKind(url, name, 'direct', forceKind)
      const isImg = kind === 'image'
      directFileMap.set(url, {
        key: `df_${directFileMap.size}_${pipeId}`,
        url,
        name,
        kind,
        source: isImg ? 'image' : 'direct',
        originGroup: 'direct',
        badgeLabel: isImg ? 'ẢNH CV' : 'FILE CV',
        badgeCls: isImg ? 'is-img' : 'is-direct',
        primaryPipeId: pipeId,
        pipeTitle,
        partyLabel,
        ownerSummary,
        extraOwnerCount: 0,
        reportId: '',
        reportTitle: '',
        tooltip: `${name}\n• Upload trực tiếp trong CV: ${ownerSummary}`
      })
    }

    if (pipe.ten_file || pipe.link_file) {
      const names = String(pipe.ten_file || '').split(',').map((s) => s.trim())
      const links = String(pipe.link_file || '').split(',').map((s) => s.trim())
      const maxLen = Math.max(names.length, links.length)
      for (let i = 0; i < maxLen; i++) {
        const u = links[i] || ''
        if (!u || u === '#') continue
        const n = names[i] || extractCleanFileName(u, `File_${i + 1}`)
        pushDirectEntry(u, n)
      }
    }

    if (pipe.id_quanlyfile && Array.isArray(quanLyFiles.value) && quanLyFiles.value.length > 0) {
      const directQlfIds = String(pipe.id_quanlyfile)
        .split(',')
        .map((s) => s.trim())
        .filter((id) => id && !reportCoveredQlfIds.has(id))

      directQlfIds.forEach((qlfId) => {
        const linked = quanLyFiles.value.find((f) => String(f.id) === qlfId)
        if (!linked) return
        const linkedFiles = Array.isArray(linked.linkFileBaoGia)
          ? linked.linkFileBaoGia
          : typeof linked.linkFileBaoGia === 'string' && linked.linkFileBaoGia.trim()
            ? [linked.linkFileBaoGia]
            : []
        linkedFiles.forEach((fObj, idx) => {
          const u = typeof fObj === 'string' ? fObj : fObj?.url || ''
          if (reportFileMap.has(u)) return
          const n = typeof fObj === 'object' && fObj?.name ? fObj.name : extractCleanFileName(u, `File_CV_${idx + 1}`)
          pushDirectEntry(u, n)
        })

        const linkedImgs = Array.isArray(linked.linkImgSave)
          ? linked.linkImgSave
          : typeof linked.linkImgSave === 'string' && linked.linkImgSave.trim()
            ? [linked.linkImgSave]
            : []
        linkedImgs.forEach((imgObj, idx) => {
          const u = typeof imgObj === 'string' ? imgObj : imgObj?.url || ''
          if (reportFileMap.has(u)) return
          const n = typeof imgObj === 'object' && imgObj?.name ? imgObj.name : extractCleanFileName(u, `Anh_CV_${idx + 1}`)
          pushDirectEntry(u, n, 'image')
        })
      })
    }
  })

  const reportFiles = Array.from(reportFileMap.values())
  const directFiles = Array.from(directFileMap.values())
  return {
    reportFiles,
    directFiles,
    totalCount: reportFiles.length + directFiles.length
  }
})

const matchesVaultModalFilter = (fileItem) => {
  const cat = vaultFileCategoryFilter.value
  if (cat === 'bao_gia' && fileItem.source !== 'bao_gia') return false
  if (cat === 'mua_hang' && fileItem.source !== 'mua_hang') return false
  if (cat === 'image' && fileItem.kind !== 'image') return false

  const kw = vaultFileSearchQuery.value.trim().toLowerCase()
  if (!kw) return true
  return (
    (fileItem.name && fileItem.name.toLowerCase().includes(kw)) ||
    (fileItem.pipeTitle && fileItem.pipeTitle.toLowerCase().includes(kw)) ||
    (fileItem.partyLabel && fileItem.partyLabel.toLowerCase().includes(kw)) ||
    (fileItem.reportTitle && fileItem.reportTitle.toLowerCase().includes(kw)) ||
    (fileItem.badgeLabel && fileItem.badgeLabel.toLowerCase().includes(kw))
  )
}

const filteredVaultReportFiles = computed(() => {
  if (vaultFileCategoryFilter.value === 'direct') return []
  return activeKanbanFilesVault.value.reportFiles.filter(matchesVaultModalFilter)
})

const filteredVaultDirectFiles = computed(() => {
  if (
    vaultFileCategoryFilter.value === 'report' ||
    vaultFileCategoryFilter.value === 'bao_gia' ||
    vaultFileCategoryFilter.value === 'mua_hang'
  ) {
    return []
  }
  return activeKanbanFilesVault.value.directFiles.filter(matchesVaultModalFilter)
})

const openPipelineFilesVaultModal = (initialFilter = 'all') => {
  vaultFileSearchQuery.value = ''
  vaultFileCategoryFilter.value = initialFilter || 'all'
  showPipelineFilesVaultModal.value = true
}

const locateFileOwnerCardOnBoard = (pipeId) => {
  const cleanId = String(pipeId || '').trim()
  if (!cleanId) return
  showPipelineFilesVaultModal.value = false

  const pipe = items.value.find((it) => it.Id_pipeline === cleanId)
  if (pipe) {
    if (kanbanViewMode.value === 'standard') {
      const colId = getCardColumnId(pipe) || 'unassigned'
      if (collapsedCols.value[colId]) {
        collapsedCols.value[colId] = false
      }
    } else {
      const laneKey = pipe.id_project || '__STANDALONE__'
      if (collapsedSwimlanes.value[laneKey]) {
        collapsedSwimlanes.value[laneKey] = false
      }
    }
  }

  triggerPipelineCardHighlight(cleanId)
  nextTick(() => {
    setTimeout(() => {
      const el = document.getElementById('pipeline-card-' + cleanId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    }, 100)
  })
}

// =========================================================
// FILES, CLOUDINARY UPLOAD & PDF/EXCEL VOLUME SCANNER
// =========================================================
const getParsedFiles = (element) => {
  if (!element || !element.ten_file) return []
  const names = String(element.ten_file).split(',')
  const links = element.link_file ? String(element.link_file).split(',') : []
  const res = []
  names.forEach((name, i) => {
    const cleanName = name.trim()
    if (cleanName) {
      const cleanUrl = links[i] ? links[i].trim() : '#'
      res.push({
        name: cleanName,
        url: cleanUrl,
        kind: detectReportAttachmentKind(cleanUrl, cleanName, 'direct')
      })
    }
  })
  return res
}

const fileList = computed(() => {
  if (!formData.value.ten_file && !formData.value.link_file) return []
  const names = (formData.value.ten_file || '').split(',').map((s) => s.trim()).filter(Boolean)
  const links = (formData.value.link_file || '').split(',').map((s) => s.trim()).filter(Boolean)
  const maxLen = Math.max(names.length, links.length)
  const list = []
  for (let i = 0; i < maxLen; i++) {
    const cleanName = names[i] || `File ${i + 1}`
    const cleanUrl = links[i] || ''
    list.push({
      name: cleanName,
      url: cleanUrl,
      kind: detectReportAttachmentKind(cleanUrl, cleanName, 'direct')
    })
  }
  return list
})

const uploadCloudinary = async (file) => {
  try {
    const fd = new FormData()
    fd.append('upload_preset', 'upload_file')
    fd.append('file', file)
    const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
      method: 'POST',
      body: fd
    }).then((r) => r.json())
    return uploadRes.secure_url || ''
  } catch (e) {
    console.error('Lỗi upload Cloudinary:', e)
    return ''
  }
}

const studioFileInputRef = ref(null)
const isDraggingUpload = ref(false)

const triggerStudioFileUpload = () => {
  if (uploadingFiles.value) return
  if (studioFileInputRef.value) studioFileInputRef.value.click()
}

const uploadPipelineFilesBatch = async (files) => {
  if (!files || files.length === 0 || uploadingFiles.value) return
  uploadingFiles.value = true
  try {
    const existingNames = (formData.value.ten_file || '').split(',').map((s) => s.trim()).filter(Boolean)
    const existingLinks = (formData.value.link_file || '').split(',').map((s) => s.trim()).filter(Boolean)
    const pairLen = Math.max(existingNames.length, existingLinks.length)
    const entries = []
    for (let i = 0; i < pairLen; i++) {
      entries.push({
        name: existingNames[i] || `File ${i + 1}`,
        url: existingLinks[i] || ''
      })
    }

    let addedCount = 0
    let replacedCount = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const safeName = String(file.name || 'file').replace(/,/g, ' -').trim() || 'file'
      const url = await uploadCloudinary(file)
      if (url) {
        const dupIdx = entries.findIndex((e) => e.name.toLowerCase() === safeName.toLowerCase())
        if (dupIdx > -1) {
          entries[dupIdx] = { name: safeName, url }
          replacedCount++
        } else {
          entries.push({ name: safeName, url })
          addedCount++
        }
      }
    }

    if (addedCount > 0 || replacedCount > 0) {
      formData.value.ten_file = entries.map((e) => e.name).join(', ')
      formData.value.link_file = entries.map((e) => e.url).join(', ')
      if (addedCount > 0 && replacedCount > 0) {
        showToast(`Đã đính kèm ${addedCount} tệp mới & cập nhật ${replacedCount} tệp trùng tên!`, 'success')
      } else if (replacedCount > 0) {
        showToast(`Đã cập nhật bản mới cho ${replacedCount} tệp đính kèm!`, 'success')
      } else {
        showToast(`Đã tải lên ${addedCount} tệp vào Tệp đính kèm trực tiếp!`, 'success')
      }
    }
  } catch (err) {
    showToast('Có lỗi khi tải file lên Cloudinary', 'error')
  } finally {
    uploadingFiles.value = false
  }
}

const handleFileUpload = async (event) => {
  const files = event?.target?.files
  if (!files || files.length === 0) return
  await uploadPipelineFilesBatch(files)
  if (event?.target) event.target.value = ''
}

const handleStudioFileDrop = async (event) => {
  isDraggingUpload.value = false
  const dropped = event?.dataTransfer?.files
  if (!dropped || dropped.length === 0) return
  await uploadPipelineFilesBatch(dropped)
}

const getFileExtBadge = (nameOrUrl) => {
  const clean = String(nameOrUrl || '').split('?')[0].toLowerCase()
  if (clean.endsWith('.pdf')) return { ext: 'PDF', tone: 'rose' }
  if (clean.endsWith('.xls') || clean.endsWith('.xlsx') || clean.endsWith('.csv')) return { ext: 'XLS', tone: 'emerald' }
  if (clean.endsWith('.doc') || clean.endsWith('.docx')) return { ext: 'DOC', tone: 'sky' }
  if (/\.(png|jpe?g|webp|gif|bmp|svg)$/.test(clean)) return { ext: 'IMG', tone: 'amber' }
  return { ext: 'FILE', tone: 'slate' }
}

const removeFile = (index) => {
  const names = (formData.value.ten_file || '').split(',').map((s) => s.trim()).filter(Boolean)
  const links = (formData.value.link_file || '').split(',').map((s) => s.trim()).filter(Boolean)
  names.splice(index, 1)
  links.splice(index, 1)
  formData.value.ten_file = names.join(', ')
  formData.value.link_file = links.join(', ')
}

const getPreviewUrl = (url) => {
  if (!url) return ''
  const u = url.toLowerCase()
  if (u.includes('.xls') || u.includes('.doc') || u.includes('.ppt')) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
  }
  return url
}

const getDownloadUrl = (url) => {
  if (!url) return ''
  if (url.includes('drive.google.com/file/d/')) {
    try {
      const id = url.split('/d/')[1].split('/')[0]
      return `https://drive.google.com/uc?export=download&id=${id}`
    } catch {
      return url
    }
  }
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/fl_attachment/')
  }
  return url
}

const handleDownloadClick = async (event, url, defaultName) => {
  event.preventDefault()
  if (!url || typeof url !== 'string') return
  let name = defaultName || 'file'
  const lastPart = url.split('?')[0].split('/').pop() || ''
  const extIdx = lastPart.lastIndexOf('.')
  if (extIdx > -1) {
    const ext = lastPart.substring(extIdx)
    if (ext && !name.toLowerCase().endsWith(ext.toLowerCase())) name += ext
  }
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Fetch failed')
    const blob = await response.blob()
    const objUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = objUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(objUrl)
    }, 1000)
  } catch {
    window.open(url, '_blank')
  }
}

const scanVolumeFileInput = ref(null)
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
const scanConfirmAmountLabel = ref('Số tiền Trước Thuế nhận diện được (Có thể chỉnh sửa):')
const scanConfirmCanAttachFile = ref(false)
const scanConfirmAttachFile = ref(true)
let scanConfirmResolve = null

const isScanFileDuplicate = computed(() => {
  const clean = String(scanConfirmFileName.value || '').replace(/,/g, ' -').trim().toLowerCase()
  if (!clean) return false
  return fileList.value.some((f) => String(f.name || '').trim().toLowerCase() === clean)
})

const scanConfirmPrimaryLabel = computed(() => {
  if (!scanConfirmIsQuestion.value) return 'Đóng'
  const hasVol = parseNum(scanConfirmEditableAmount.value) > 0
  if (scanConfirmCanAttachFile.value && scanConfirmAttachFile.value) {
    return hasVol ? 'Áp dụng Volume & Đính kèm tệp' : 'Đính kèm tệp vào công việc'
  }
  return 'Chỉ áp dụng Volume'
})

const customConfirm = (title, message, isQuestion = true, options = {}) =>
  new Promise((resolve) => {
    scanConfirmTitle.value = title
    scanConfirmMessage.value = message
    scanConfirmIsQuestion.value = isQuestion
    scanConfirmPreviewUrl.value = options.previewUrl || null
    scanConfirmIsExcel.value = options.isExcel || false
    scanConfirmFileName.value = options.fileName || ''
    scanConfirmExcelHtml.value = options.excelHtml || ''
    scanConfirmAmountLabel.value =
      options.amountLabel || 'Số tiền Trước Thuế nhận diện được (Có thể chỉnh sửa):'
    scanConfirmCanAttachFile.value = Boolean(options.canAttachFile)
    scanConfirmAttachFile.value =
      options.defaultAttachFile !== undefined ? Boolean(options.defaultAttachFile) : true
    if (options.editableAmount !== undefined) {
      scanConfirmHasEditableAmount.value = true
      scanConfirmEditableAmount.value = options.editableAmount
    } else {
      scanConfirmHasEditableAmount.value = false
    }
    showScanConfirmModal.value = true
    scanConfirmResolve = resolve
  })

const handleScanConfirm = (result) => {
  showScanConfirmModal.value = false
  if (scanConfirmResolve) {
    const r = scanConfirmResolve
    scanConfirmResolve = null
    if (result && (scanConfirmHasEditableAmount.value || scanConfirmCanAttachFile.value)) {
      r({
        confirmed: true,
        amount: scanConfirmEditableAmount.value,
        attachFile: scanConfirmCanAttachFile.value ? Boolean(scanConfirmAttachFile.value) : false
      })
    } else {
      r(result)
    }
  }
}

const triggerScanVolumeFile = () => {
  if (scanVolumeFileInput.value) scanVolumeFileInput.value.click()
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
      try {
        const page1 = await doc.getPage(1)
        const viewport = page1.getViewport({ scale: 1.0 })
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        await page1.render({ canvasContext: ctx, viewport }).promise
        previewUrl = canvas.toDataURL('image/png')
      } catch (e) {}

      let fullText = ''
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map((it) => it.str).join(' ') + ' '
      }

      const matches = fullText.match(/[\d,.]+/g) || []
      let nums = []
      matches.forEach((m) => {
        const clean = m.replace(/,/g, '')
        const cleanDot = clean.replace(/\./g, '')
        const n = Number(clean)
        const nDot = Number(cleanDot)
        const finalNum = nDot > n && nDot % 1000 === 0 ? nDot : n
        if (!isNaN(finalNum) && finalNum >= 100000 && finalNum !== 199458149) nums.push(finalNum)
      })
      nums = [...new Set(nums)].sort((a, b) => b - a)
      if (nums.length > 0) {
        let found = false
        for (let i = 0; i < nums.length; i++) {
          for (let j = i + 1; j < nums.length; j++) {
            const max = nums[i]
            const min = nums[j]
            if (Math.abs(min * 1.1 - max) <= 10 || Math.abs(min * 1.08 - max) <= 10) {
              foundTotal = min
              found = true
              break
            }
          }
          if (found) break
        }
        if (!found) foundTotal = nums[0]
      }
    } else {
      isExcelFile = true
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
      const ws = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

      let htmlPreview = '<table style="width:100%;border-collapse:collapse;font-size:11px;background:#fff;color:#0f172a;">'
      for (let i = 0; i < Math.min(rows.length, 15); i++) {
        htmlPreview += '<tr>'
        const rLen = rows[i] ? rows[i].length : 0
        for (let j = 0; j < Math.max(Math.min(rLen, 8), 5); j++) {
          const val = rows[i] && rows[i][j] != null ? String(rows[i][j]) : ''
          const disp = val.length > 25 ? val.substring(0, 25) + '...' : val
          htmlPreview += `<td style="border:1px solid #cbd5e1;padding:4px;">${disp}</td>`
        }
        htmlPreview += '</tr>'
      }
      htmlPreview += '</table>'
      excelHtmlPreview = htmlPreview

      let beforeTaxCol = -1
      rows.forEach((row) => {
        if (!Array.isArray(row)) return
        row.forEach((cell, cIdx) => {
          const t = String(cell || '').toLowerCase()
          if (
            t.includes('thành tiền trước thuế') ||
            (t.includes('thành tiền') && !t.includes('sau thuế') && !t.includes('vat')) ||
            t.includes('amount')
          ) {
            if (beforeTaxCol === -1) beforeTaxCol = cIdx
          }
        })
      })

      rows.forEach((row) => {
        if (!Array.isArray(row)) return
        let isTotal = false
        const rowNums = []
        const colMap = {}
        row.forEach((cell, cIdx) => {
          if (typeof cell === 'number') {
            rowNums.push(cell)
            colMap[cIdx] = cell
          } else if (typeof cell === 'string') {
            const cl = cell.replace(/,/g, '')
            if (cl.trim() && !isNaN(Number(cl))) {
              const n = Number(cl)
              rowNums.push(n)
              colMap[cIdx] = n
            }
          }
          const t = String(cell || '').toLowerCase()
          if (t.includes('tổng cộng') || t.includes('cộng tiền hàng') || t.includes('tổng tiền') || t.includes('total')) {
            isTotal = true
          }
        })
        if (isTotal) {
          if (beforeTaxCol !== -1 && colMap[beforeTaxCol] > foundTotal) {
            foundTotal = colMap[beforeTaxCol]
          } else {
            const valid = rowNums.filter((n) => n > 0)
            if (valid.length > 0 && valid[0] > foundTotal) foundTotal = valid[0]
          }
        }
      })
    }

    const isAutoDetected = foundTotal > 0
    const res = await customConfirm(
      isAutoDetected ? 'Xác nhận File & Volume Trước Thuế' : 'Nhập Volume & Đính Kèm Tệp',
      isAutoDetected
        ? ''
        : 'Chưa tự nhận diện được dòng Tổng tiền trước thuế trong tệp này. Bạn có thể đối chiếu bản xem trước để nhập Volume và đính kèm tệp luôn:',
      true,
      {
        previewUrl,
        isExcel: isExcelFile,
        fileName: file.name,
        excelHtml: excelHtmlPreview,
        editableAmount: isAutoDetected ? foundTotal : (parseNum(formData.value.volume) || 0),
        amountLabel: isAutoDetected
          ? 'Số tiền Trước Thuế nhận diện được (Có thể chỉnh sửa):'
          : 'Nhập Volume Dự Kiến Trước Thuế (₫):',
        canAttachFile: true,
        defaultAttachFile: true
      }
    )
    if (res && res.confirmed) {
      const nextAmt = parseNum(res.amount)
      if (isAutoDetected || nextAmt > 0) {
        formData.value.volume = res.amount
      }
      if (res.attachFile) {
        await uploadPipelineFilesBatch([file])
      } else if (isAutoDetected || nextAmt > 0) {
        showToast('Đã áp dụng Volume dự kiến trước thuế!', 'success')
      }
    }
  } catch (err) {
    await customConfirm('Lỗi đọc tệp', String(err.message || err), false)
  }
  target.value = ''
}

// =========================================================
// EXCEL EXPORT
// =========================================================
const showExportModal = ref(false)
const removedExportIds = ref([])
const exportFilters = ref({ id_workflow: '', id_project: '', dateFrom: '', dateTo: '' })

watch(showExportModal, (v) => {
  if (v) removedExportIds.value = []
})

const parseDMY = (dmyStr) => {
  const parts = String(dmyStr || '').split('/')
  if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`).getTime()
  return 0
}

const exportPreviewList = computed(() => {
  let list = items.value.filter(matchesSearch)
  if (exportFilters.value.id_workflow) {
    if (exportFilters.value.id_workflow === 'WF_DEFAULT') {
      list = list.filter((i) => !i.id_workflow || i.id_workflow === 'WF_DEFAULT')
    } else {
      list = list.filter((i) => i.id_workflow === exportFilters.value.id_workflow)
    }
  }
  if (exportFilters.value.id_project) {
    list = list.filter((i) => i.id_project === exportFilters.value.id_project)
  }
  if (exportFilters.value.dateFrom || exportFilters.value.dateTo) {
    const fromTime = exportFilters.value.dateFrom ? new Date(exportFilters.value.dateFrom).getTime() : 0
    const toTime = exportFilters.value.dateTo ? new Date(exportFilters.value.dateTo).setHours(23, 59, 59, 999) : Infinity
    list = list.filter((i) => {
      if (!i.finish_time) return false
      const firstDate = i.finish_time.split('-')[0].trim()
      const t = parseDMY(firstDate)
      return t && t >= fromTime && t <= toTime
    })
  }
  if (removedExportIds.value.length > 0) {
    list = list.filter((i) => !removedExportIds.value.includes(i.Id_pipeline))
  }
  return list
})

const removeExportCard = (id) => {
  if (!removedExportIds.value.includes(id)) removedExportIds.value.push(id)
}

const getFormattedStatus = (item) => {
  let statusStr = item['%status'] || ''
  if (typeof statusStr === 'number' || (!isNaN(statusStr) && statusStr !== '')) {
    const num = Number(statusStr)
    if (num <= 1 && num >= 0) statusStr = num * 100 + '%'
  } else if (typeof statusStr === 'string' && !statusStr.includes('%') && item.status_name) {
    const cols = getColumnsForWorkflow(item.id_workflow)
    const match = cols.find((c) => c.value === item.status_name)
    if (match) statusStr = match.percent
  }
  return statusStr || item.status_name || '0%'
}

const confirmExportExcel = async () => {
  await exportToExcel(exportPreviewList.value)
  showExportModal.value = false
}

const exportToExcel = async (listToExport = null) => {
  const filtered = Array.isArray(listToExport) ? listToExport : items.value.filter(matchesSearch)
  let titleText = 'PIPELINE'
  if (exportFilters.value.dateFrom) titleText = `PIPELINE ( ${new Date(exportFilters.value.dateFrom).getFullYear()} )`
  else if (exportFilters.value.dateTo) titleText = `PIPELINE ( ${new Date(exportFilters.value.dateTo).getFullYear()} )`

  const formatTimeline = (finishTimeStr) => {
    if (!finishTimeStr) return ''
    const parts = finishTimeStr.split('-').map((s) => s.trim())
    const getMonthNum = (dStr) => {
      const p = String(dStr || '').split('/')
      return p.length === 3 ? parseInt(p[1], 10) : null
    }
    if (parts.length === 1) {
      const m = getMonthNum(parts[0])
      return m ? `Tháng ${m}` : parts[0]
    }
    if (parts.length === 2) {
      const m1 = getMonthNum(parts[0])
      const m2 = getMonthNum(parts[1])
      if (m1 && m2) {
        if (m1 === m2) return `Tháng ${m1}`
        const q1 = Math.ceil(m1 / 3)
        const q2 = Math.ceil(m2 / 3)
        if (q1 === q2) return `Q${q1}`
        const qs = []
        for (let i = q1; i <= q2; i++) qs.push(`Q${i}`)
        return qs.join('/')
      }
    }
    return finishTimeStr
  }

  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pipeline')
    worksheet.columns = [
      { width: 8 }, { width: 12 }, { width: 35 }, { width: 45 }, { width: 10 },
      { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 45 }
    ]

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
    ]
    headers.forEach((h) => worksheet.addRow(h))

    worksheet.getCell('A1').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } }
    worksheet.getCell('A2').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } }
    const titleCell = worksheet.getCell('A4')
    worksheet.mergeCells('A4:J4')
    titleCell.value = titleText
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell('A5').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFF0000' } }

    const headerRow = worksheet.getRow(12)
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF002060' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet.autoFilter = 'A12:J12'

    filtered.forEach((item, index) => {
      const rawVolume = String(item.volume || '').replace(/,/g, '')
      const volumeNum = !isNaN(rawVolume) && rawVolume !== '' ? Number(rawVolume) : rawVolume
      const statusStr = getFormattedStatus(item)

      const row = worksheet.addRow([
        index + 1,
        item.AM || '',
        item.ten_cong_ty || item.ten_khach_hang || '',
        item.content_of_contract_po || '',
        item.quantity ? Number(item.quantity) : '',
        volumeNum,
        item.type || '',
        formatTimeline(item.finish_time),
        statusStr,
        item.ghi_chu_hop_dong || ''
      ])

      const isOdd = index % 2 === 0
      row.eachCell((cell, colNumber) => {
        cell.border = { top: { style: 'dotted' }, left: { style: 'thin' }, bottom: { style: 'dotted' }, right: { style: 'thin' } }
        cell.font = { name: 'Arial', size: 10 }
        cell.alignment = { vertical: 'middle', wrapText: true }
        if (isOdd) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } }
        if ([1, 2, 8, 9].includes(colNumber)) cell.alignment.horizontal = 'center'
        if ([3, 4, 7].includes(colNumber)) cell.alignment.horizontal = 'left'
        if (colNumber === 5) {
          cell.alignment.horizontal = 'right'
          cell.font = { name: 'Arial', size: 10, bold: true }
        }
        if (colNumber === 6) {
          cell.alignment.horizontal = 'right'
          cell.font = { name: 'Arial', size: 10, bold: true }
          if (volumeNum) cell.numFmt = '#,##0'
        }
        if (colNumber === 10 && cell.value) {
          cell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FFFF0000' } }
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Pipeline_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Đã xuất báo cáo Excel thành công!', 'success')
  } catch (error) {
    console.error('Error exporting excel:', error)
    showToast('Có lỗi khi xuất Excel', 'error')
  }
}

// =========================================================
// VISUAL HELPERS & INITIAL DATA LOAD
// =========================================================
const openCardPanelMap = ref({})
const openKanbanCardMenuId = ref('')

const toggleKanbanCardMenu = (cardId) => {
  openKanbanCardMenuId.value = openKanbanCardMenuId.value === cardId ? '' : cardId
}

const closeKanbanCardMenu = () => {
  openKanbanCardMenuId.value = ''
}

const handleKanbanMenuMoveStage = (item, colId) => {
  openKanbanCardMenuId.value = ''
  moveCardToColumn(item, colId)
}

const handleKanbanMenuDuplicate = (item) => {
  openKanbanCardMenuId.value = ''
  duplicateItem(item)
}

const handleKanbanMenuDelete = (item) => {
  openKanbanCardMenuId.value = ''
  requestAction(item, 'delete')
}

const handleKanbanMenuOpenProject = (item) => {
  openKanbanCardMenuId.value = ''
  if (item?.id_project) openProjectById(item.id_project)
}

const hasDistinctCardContact = (item) => {
  const kh = String(item?.ten_khach_hang || '').trim()
  if (!kh) return false
  const cty = String(item?.ten_cong_ty || '').trim()
  return !cty || kh.toLowerCase() !== cty.toLowerCase()
}

const isCardFilesOpen = (cardId, item = null) => {
  const key = `${cardId}:files`
  if (Object.prototype.hasOwnProperty.call(openCardPanelMap.value, key)) {
    return Boolean(openCardPanelMap.value[key])
  }
  if (item && cardHasFileSearchMatch(item)) return true
  return false
}
const toggleCardFiles = (cardId, item = null) => {
  const key = `${cardId}:files`
  const cur = isCardFilesOpen(cardId, item)
  openCardPanelMap.value[key] = !cur
}

const isCardReportsOpen = (cardId, item = null) => {
  const key = `${cardId}:reports`
  if (Object.prototype.hasOwnProperty.call(openCardPanelMap.value, key)) {
    return Boolean(openCardPanelMap.value[key])
  }
  if (item && cardHasReportSearchMatch(item)) return true
  return false
}
const toggleCardReports = (cardId, item = null) => {
  const key = `${cardId}:reports`
  const cur = isCardReportsOpen(cardId, item)
  openCardPanelMap.value[key] = !cur
}

watch(searchQuery, (val) => {
  if (!String(val || '').trim()) {
    Object.keys(openCardPanelMap.value).forEach((k) => {
      if (openCardPanelMap.value[k] === false) {
        delete openCardPanelMap.value[k]
      }
    })
  }
})

const getTagClass = (tag) => {
  if (!tag) return 'is-normal'
  const t = tag.toLowerCase()
  if (t.includes('ưu tiên') || t.includes('gấp')) return 'is-urgent'
  if (t.includes('bám đuổi')) return 'is-warn'
  return 'is-normal'
}

const isPriorityCard = (item) => getTagClass(item?.tag) === 'is-urgent'
const isFollowupCard = (item) => getTagClass(item?.tag) === 'is-warn'

const isVisiblePrioTag = (tag) => {
  if (!tag) return false
  const norm = String(tag).trim().toLowerCase()
  return Boolean(norm) && norm !== 'bình thường' && norm !== 'binh thuong'
}

const isNumericVolume = (val) => {
  if (val == null || val === '') return false
  const raw = String(val).replace(/,/g, '').trim()
  return raw !== '' && !isNaN(raw)
}

const getColTitleColor = (colId) => {
  const col = COLUMNS.value.find((c) => c.id === colId)
  if (col && col.color) return col.color
  if (colId === 'col_30') return '#ef4444'
  if (colId === 'col_50') return '#f97316'
  if (colId === 'col_70') return '#eab308'
  if (colId === 'col_90') return '#22c55e'
  if (colId === 'that_bai') return '#ef4444'
  if (colId === 'hoan_thanh') return '#10b981'
  return '#3b82f6'
}

const getPendingPipelineOpenId = () => {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search)
      const fromUrl = params.get('openId')
      if (fromUrl && String(fromUrl).trim()) return String(fromUrl).trim()
    } catch (_) {}
    return ''
  }
  return route.query.openId ? String(route.query.openId).trim() : ''
}

const clearPipelineOpenIdUrlQuery = () => {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('openId')) return
    url.searchParams.delete('openId')
    const cleanSearch = url.searchParams.toString()
    const cleanUrl = url.pathname + (cleanSearch ? `?${cleanSearch}` : '') + url.hash
    window.history.replaceState(window.history.state, '', cleanUrl)
  } catch (_) {}
}

const handleOpenIdDeepLink = (explicitId = '') => {
  const targetOpenId = String(explicitId || getPendingPipelineOpenId()).trim()
  if (!targetOpenId || !items.value.length) return
  const targetItem = items.value.find((i) => String(i.Id_pipeline) === targetOpenId)
  // Xóa ?openId khỏi URL bằng history.replaceState để không làm <keep-alive :key="route.fullPath"> remount mất highlight
  clearPipelineOpenIdUrlQuery()
  if (targetItem) {
    focusCardOnKanban(targetItem)
  }
}

const checkPendingPipelineCreate = () => {
  const pendingPipeline = sessionStorage.getItem('pendingPipelineCreate')
  if (!pendingPipeline) return
  try {
    const parsed = JSON.parse(pendingPipeline)
    sessionStorage.removeItem('pendingPipelineCreate')
    setTimeout(() => {
      openAddModal()
      formData.value.content_of_contract_po = parsed.content || ''
      formData.value.ghi_chu_hop_dong = parsed.note || ''
    }, 250)
  } catch (e) {}
}

const fetchData = async () => {
  loading.value = true
  try {
    const [snapPipeline, snapWorkflow, snapProjects] = await Promise.all([
      get(dbRef(database, 'pipeline')),
      get(dbRef(database, 'pipeline_workflow')),
      get(dbRef(database, 'pipeline_projects'))
    ])

    if (snapWorkflow.exists()) {
      const wfRaw = snapWorkflow.val()
      const wfEntries = Array.isArray(wfRaw)
        ? wfRaw.map((val, idx) => [String(idx), val])
        : Object.entries(wfRaw || {})
      workflowsData.value = wfEntries.map(([k, v]) => normalizeWorkflowRecord(v, k)).filter(Boolean)
    } else {
      workflowsData.value = []
    }

    if (snapProjects.exists()) {
      const prRaw = snapProjects.val()
      const prEntries = Array.isArray(prRaw)
        ? prRaw.map((val, idx) => [String(idx), val])
        : Object.entries(prRaw || {})
      projectsList.value = prEntries.map(([k, v]) => normalizeProjectRecord(v, k)).filter(Boolean)
    } else {
      projectsList.value = []
    }

    if (snapPipeline.exists()) {
      const pipeRaw = snapPipeline.val()
      const pipeEntries = Array.isArray(pipeRaw)
        ? pipeRaw.map((val, idx) => [String(idx), val])
        : Object.entries(pipeRaw || {})
      items.value = pipeEntries.map(([k, v]) => normalizePipelineRecord(v, k)).filter(Boolean)
    } else {
      items.value = []
    }

    distributeItems()
    handleOpenIdDeepLink()
  } catch (err) {
    console.error('Firebase error in fetchData:', err)
  } finally {
    loading.value = false
  }
}

const normalizeReportSnapshotItem = (key, r) => {
  if (!r) return null
  if (Array.isArray(r)) {
    return {
      id: String(r[0] ?? key ?? ''),
      thoi_gian: String(r[1] ?? ''),
      noi_dung: String(r[3] ?? ''),
      ghi_chu: String(r[4] ?? ''),
      img_save: String(r[7] ?? ''),
      ten_file_img: String(r[8] ?? ''),
      link_excel_bao_gia: String(r[9] ?? ''),
      ten_file_bao_gia: String(r[10] ?? ''),
      id_pipeline: String(r[11] ?? ''),
      link_excel_mua_hang: String(r[12] ?? ''),
      ten_file_mua_hang: String(r[13] ?? ''),
      id_quanlyfile: String(r[14] ?? '')
    }
  }
  return {
    ...r,
    id: String(r.id ?? r.ID ?? key ?? ''),
    thoi_gian: String(r.thoi_gian ?? r.THOI_GIAN ?? ''),
    noi_dung: String(r.noi_dung ?? r.NOI_DUNG ?? ''),
    ghi_chu: String(r.ghi_chu ?? r.GHI_CHU ?? ''),
    img_save: String(r.img_save ?? r.IMG_SAVE ?? ''),
    ten_file_img: String(r.ten_file_img ?? r.TEN_FILE_IMG ?? ''),
    link_excel_bao_gia: String(r.link_excel_bao_gia ?? r.LINK_EXCEL_BAO_GIA ?? ''),
    ten_file_bao_gia: String(r.ten_file_bao_gia ?? r.TEN_FILE_BAO_GIA ?? ''),
    link_excel_mua_hang: String(r.link_excel_mua_hang ?? r.LINK_EXCEL_MUA_HANG ?? ''),
    ten_file_mua_hang: String(r.ten_file_mua_hang ?? r.TEN_FILE_MUA_HANG ?? ''),
    id_pipeline: String(r.id_pipeline ?? r.ID_PIPELINE ?? ''),
    id_quanlyfile: String(r.id_quanlyfile ?? r.ID_QUANLYFILE ?? '')
  }
}

const fetchReports = async () => {
  try {
    const snap = await get(dbRef(database, 'REPORT'))
    if (!snap.exists()) {
      reports.value = []
      return
    }
    const raw = snap.val()
    const entries = Array.isArray(raw) ? raw.map((v, i) => [String(i), v]) : Object.entries(raw || {})
    reports.value = entries.map(([key, r]) => normalizeReportSnapshotItem(key, r)).filter((r) => r && r.id)
  } catch (e) {
    console.error('Lỗi fetch REPORT:', e)
  }
}

const fetchQuanLyFiles = async () => {
  try {
    const snap = await get(dbRef(database, 'quan_ly_file'))
    if (!snap.exists()) {
      quanLyFiles.value = []
      return
    }
    const raw = snap.val() || {}
    quanLyFiles.value = Object.keys(raw)
      .map((key) => (raw[key] && typeof raw[key] === 'object' ? { id: key, ...raw[key] } : null))
      .filter(Boolean)
  } catch (e) {
    console.error('Lỗi fetch quan_ly_file:', e)
  }
}

const refreshWorkspace = async () => {
  await Promise.all([fetchData(), fetchCustomersData(), fetchReports(), fetchQuanLyFiles()])
  showToast('Đã đồng bộ dữ liệu mới nhất!', 'info', 1800)
}

const checkMobile = () => {
  if (typeof window === 'undefined') return
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value && !wasMobile) {
    COLUMNS.value.forEach((c, idx) => {
      collapsedCols.value[c.id] = idx !== 0
    })
  } else if (!isMobile.value && wasMobile) {
    COLUMNS.value.forEach((c) => {
      collapsedCols.value[c.id] = c.id === 'that_bai' || c.id === 'hoan_thanh'
    })
  }
}

let unsubscribePipelineRealtime = null
let unsubscribeReportsRealtime = null
let unsubscribeQuanLyFilesRealtime = null

const listenRealtimeCrossLinks = () => {
  if (!unsubscribeReportsRealtime) {
    unsubscribeReportsRealtime = onValue(dbRef(database, 'REPORT'), (snap) => {
      if (!snap.exists()) {
        reports.value = []
        return
      }
      const raw = snap.val()
      const entries = Array.isArray(raw) ? raw.map((v, i) => [String(i), v]) : Object.entries(raw || {})
      reports.value = entries.map(([key, r]) => normalizeReportSnapshotItem(key, r)).filter((r) => r && r.id)
    })
  }

  if (!unsubscribeQuanLyFilesRealtime) {
    unsubscribeQuanLyFilesRealtime = onValue(dbRef(database, 'quan_ly_file'), (snap) => {
      if (!snap.exists()) {
        quanLyFiles.value = []
        return
      }
      const raw = snap.val() || {}
      quanLyFiles.value = Object.keys(raw)
        .map((key) => (raw[key] && typeof raw[key] === 'object' ? { id: key, ...raw[key] } : null))
        .filter(Boolean)
    })
  }

  if (!unsubscribePipelineRealtime) {
    unsubscribePipelineRealtime = onValue(dbRef(database, 'pipeline'), (snap) => {
      if (isDragging.value || saving.value || backgroundSyncing.value) return
      if (!snap.exists()) {
        items.value = []
        distributeItems()
        return
      }
      const pipeRaw = snap.val()
      const pipeEntries = Array.isArray(pipeRaw)
        ? pipeRaw.map((val, idx) => [String(idx), val])
        : Object.entries(pipeRaw || {})
      items.value = pipeEntries.map(([k, v]) => normalizePipelineRecord(v, k)).filter(Boolean)
      distributeItems()
    })
  }
}

// =========================================================
// STICKY PIPELINE BOARD HEADER DOCK & HORIZONTAL SCROLL SYNC
// =========================================================
const boardStickySentinelRef = ref(null)
const boardStickyHeadScrollRef = ref(null)
const kanbanBodyScrollRef = ref(null)
const isBoardHeaderStuck = ref(false)
let stickyScrollRaf = 0

const onKanbanBodyHorizontalScroll = (e) => {
  const src = e?.target || kanbanBodyScrollRef.value
  const dst = boardStickyHeadScrollRef.value
  if (!src || !dst) return
  if (Math.abs(dst.scrollLeft - src.scrollLeft) > 0.5) {
    dst.scrollLeft = src.scrollLeft
  }
}

const onStickyHeadHorizontalScroll = (e) => {
  const src = e?.target || boardStickyHeadScrollRef.value
  const dst = kanbanBodyScrollRef.value
  if (!src || !dst) return
  if (Math.abs(dst.scrollLeft - src.scrollLeft) > 0.5) {
    dst.scrollLeft = src.scrollLeft
  }
}

const syncBoardStickyState = () => {
  stickyScrollRaf = 0
  if (typeof window === 'undefined' || window.innerWidth < 769) {
    if (isBoardHeaderStuck.value) isBoardHeaderStuck.value = false
    return
  }
  const sentinel = boardStickySentinelRef.value
  if (!sentinel) {
    if (isBoardHeaderStuck.value) isBoardHeaderStuck.value = false
    return
  }
  const mainScrollEl = sentinel.closest('.main-content')
  const rootTop = mainScrollEl ? Math.max(0, mainScrollEl.getBoundingClientRect().top) : 0
  const sentinelTop = sentinel.getBoundingClientRect().top
  const nextStuck = sentinelTop < rootTop - 0.5
  if (isBoardHeaderStuck.value !== nextStuck) {
    isBoardHeaderStuck.value = nextStuck
  }
}

const onWorkspaceAnyScroll = () => {
  if (stickyScrollRaf) return
  stickyScrollRaf = window.requestAnimationFrame(syncBoardStickyState)
}

watch(
  [activeTab, kanbanViewMode, () => COLUMNS.value.length],
  () => {
    nextTick(() => {
      syncBoardStickyState()
      const bodyEl = kanbanBodyScrollRef.value
      const headEl = boardStickyHeadScrollRef.value
      if (bodyEl && headEl && Math.abs(headEl.scrollLeft - bodyEl.scrollLeft) > 0.5) {
        headEl.scrollLeft = bodyEl.scrollLeft
      }
    })
  }
)

watch(() => route.query.openId, (v) => {
  if (v && items.value.length > 0) handleOpenIdDeepLink(String(v))
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('resize', onWorkspaceAnyScroll, { passive: true })
  window.addEventListener('scroll', onWorkspaceAnyScroll, { passive: true, capture: true })
  window.addEventListener('keydown', onGlobalDialogKeydown)
  window.addEventListener('keydown', onStudioModalKeydown)
  window.addEventListener('paste', onCusSmartImportPaste)
  syncCustomGlassVarsToDocumentRoot()
  fetchData()
  fetchCustomersData()
  fetchReports()
  fetchQuanLyFiles()
  listenRealtimeCrossLinks()
  checkPendingPipelineCreate()
  nextTick(syncBoardStickyState)
})

onActivated(() => {
  uiTheme.value = getInitialTheme()
  customGlassConfig.value = loadInitialGlassConfig()
  syncCustomGlassVarsToDocumentRoot()
  handleOpenIdDeepLink()
  checkPendingPipelineCreate()
  nextTick(syncBoardStickyState)
})

onDeactivated(() => {
  if (typeof document !== 'undefined') {
    const rootStyle = document.documentElement.style
    for (const k of Object.keys(customGlassStyleVars.value || {})) rootStyle.removeProperty(k)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('resize', onWorkspaceAnyScroll)
  window.removeEventListener('scroll', onWorkspaceAnyScroll, { capture: true })
  if (stickyScrollRaf) {
    window.cancelAnimationFrame(stickyScrollRaf)
    stickyScrollRaf = 0
  }
  window.removeEventListener('keydown', onGlobalDialogKeydown)
  window.removeEventListener('keydown', onStudioModalKeydown)
  window.removeEventListener('paste', onCusSmartImportPaste)
  if (highlightedCardTimer) {
    clearTimeout(highlightedCardTimer)
    highlightedCardTimer = null
  }
  if (unsubscribePipelineRealtime) {
    unsubscribePipelineRealtime()
    unsubscribePipelineRealtime = null
  }
  if (unsubscribeReportsRealtime) {
    unsubscribeReportsRealtime()
    unsubscribeReportsRealtime = null
  }
  if (unsubscribeQuanLyFilesRealtime) {
    unsubscribeQuanLyFilesRealtime()
    unsubscribeQuanLyFilesRealtime = null
  }
  if (typeof document !== 'undefined') {
    const rootStyle = document.documentElement.style
    for (const k of Object.keys(customGlassStyleVars.value || {})) rootStyle.removeProperty(k)
  }
})
</script>

<style scoped>
/* =========================================================
   GLOBAL APP-LAYOUT SYNC & VIEWPORT STICKY UNLOCK
   ========================================================= */
:global(html:has(.pipeline-workspace.page)) {
  overflow-x: clip !important;
  overflow-y: auto !important;
}

:global(body:has(.pipeline-workspace.page)),
:global(#app:has(.pipeline-workspace.page)),
:global(.app-layout:has(.pipeline-workspace.page)),
:global(.app-layout:has(.pipeline-workspace.page) .main-content) {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  overflow-x: clip !important;
}

:global(.app-layout:has(.pipeline-workspace.page) .main-content) {
  background: #070d19 !important;
}

:global(.app-layout:has(.pipeline-workspace.page.theme-light-blue) .main-content) {
  background: #e3edf9 !important;
}

/* =========================================================
   DESIGN SYSTEM TOKENS (DARK NAVY / LIGHT BLUE / CUSTOM GLASS)
   ========================================================= */
.pipeline-workspace.page,
.pl-modal-overlay,
.pl-dialog-overlay,
.pl-lightbox,
.pl-tuner-popover,
.smart-toast-wrap,
.pl-drag-tooltip {
  --bg-canvas: #070d19;
  --bg-surface-1: #0f172a;
  --bg-surface-2: #162137;
  --bg-surface-3: #1e2b45;
  --bg-input-well: rgba(8, 15, 30, 0.78);
  --bg-border-subtle: rgba(148, 163, 184, 0.14);
  --bg-border-strong: rgba(148, 163, 184, 0.28);
  --bg-text-primary: #f8fafc;
  --bg-text-secondary: #cbd5e1;
  --bg-text-muted: #94a3b8;
  --bg-text-faint: #64748b;
  --bg-shadow-card: 0 10px 28px rgba(2, 6, 23, 0.36);
  --bg-shadow-modal: 0 24px 64px rgba(2, 6, 23, 0.68);

  --theme-pri-header-grad: linear-gradient(135deg, #059669 0%, #0d9488 55%, #0284c7 100%);
  --theme-sky-header-grad: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  --theme-teal-header-grad: linear-gradient(135deg, #0d9488 0%, #059669 100%);
  --theme-cta-grad: linear-gradient(135deg, #059669 0%, #10b981 100%);
  --theme-cta-shadow: 0 6px 18px rgba(16, 185, 129, 0.28);

  --sem-emerald-txt: #34d399;
  --sem-emerald-bg: rgba(16, 185, 129, 0.14);
  --sem-emerald-bdr: rgba(16, 185, 129, 0.34);

  --sem-sky-txt: #38bdf8;
  --sem-sky-bg: rgba(14, 165, 233, 0.14);
  --sem-sky-bdr: rgba(56, 189, 248, 0.34);

  --sem-amber-txt: #fbbf24;
  --sem-amber-bg: rgba(245, 158, 11, 0.14);
  --sem-amber-bdr: rgba(245, 158, 11, 0.34);

  --sem-rose-txt: #fb7185;
  --sem-rose-bg: rgba(244, 63, 94, 0.14);
  --sem-rose-bdr: rgba(244, 63, 94, 0.34);

  --option-bg: #0f172a;
  --option-txt: #f8fafc;
  --bg-sticky-shield: #070d19;
  --bg-col-cap-solid: #0f172a;
}

/* ENTERPRISE LIGHT BLUE MODE */
.pipeline-workspace.page.theme-light-blue,
.pl-modal-overlay.theme-light-blue,
.pl-dialog-overlay.theme-light-blue,
.pl-lightbox.theme-light-blue,
.smart-toast-wrap.theme-light-blue,
.pl-drag-tooltip.theme-light-blue {
  --bg-canvas: #e3edf9;
  --bg-surface-1: #f4f8ff;
  --bg-surface-2: #ffffff;
  --bg-surface-3: #e8f1fc;
  --bg-input-well: #eef5fd;
  --bg-border-subtle: rgba(15, 23, 42, 0.1);
  --bg-border-strong: rgba(2, 132, 199, 0.28);
  --bg-text-primary: #0f172a;
  --bg-text-secondary: #334155;
  --bg-text-muted: #475569;
  --bg-text-faint: #64748b;
  --bg-shadow-card: 0 6px 20px rgba(15, 23, 42, 0.06);
  --bg-shadow-modal: 0 24px 56px rgba(15, 23, 42, 0.2);

  --theme-pri-header-grad: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
  --theme-sky-header-grad: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  --theme-teal-header-grad: linear-gradient(135deg, #0d9488 0%, #059669 100%);
  --theme-cta-grad: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  --theme-cta-shadow: 0 6px 16px rgba(2, 132, 199, 0.25);

  --sem-emerald-txt: #047857;
  --sem-emerald-bg: rgba(16, 185, 129, 0.12);
  --sem-emerald-bdr: rgba(5, 150, 105, 0.3);

  --sem-sky-txt: #0369a1;
  --sem-sky-bg: rgba(2, 132, 199, 0.1);
  --sem-sky-bdr: rgba(2, 132, 199, 0.28);

  --sem-amber-txt: #b45309;
  --sem-amber-bg: rgba(245, 158, 11, 0.12);
  --sem-amber-bdr: rgba(217, 119, 6, 0.3);

  --sem-rose-txt: #be123c;
  --sem-rose-bg: rgba(244, 63, 94, 0.1);
  --sem-rose-bdr: rgba(225, 29, 72, 0.28);

  --option-bg: #ffffff;
  --option-txt: #0f172a;
  --bg-sticky-shield: #e3edf9;
  --bg-col-cap-solid: #f4f8ff;
}

/* CUSTOM GLASSIFY MODE */
.pipeline-workspace.page.theme-custom-glass,
.pl-modal-overlay.theme-custom-glass,
.pl-dialog-overlay.theme-custom-glass,
.pl-tuner-popover.theme-custom-glass {
  --bg-surface-1: linear-gradient(160deg, var(--cg-panel-top, rgba(15, 35, 58, 0.52)), var(--cg-panel-bot, rgba(8, 22, 40, 0.38)));
  --bg-surface-2: linear-gradient(160deg, var(--cg-card-top, rgba(20, 44, 70, 0.58)), var(--cg-card-bot, rgba(10, 26, 46, 0.42)));
  --bg-surface-3: rgba(255, 255, 255, 0.14);
  --bg-input-well: rgba(6, 18, 34, 0.46);
  --bg-border-subtle: var(--cg-border, rgba(255, 255, 255, 0.28));
  --bg-border-strong: rgba(125, 211, 252, 0.55);
  --bg-text-primary: #f8fafc;
  --bg-text-secondary: #e2e8f0;
  --bg-text-muted: #cbd5e1;
  --bg-text-faint: #94a3b8;
  --bg-sticky-shield: rgba(6, 18, 34, 0.88);
  --bg-col-cap-solid: rgba(13, 31, 53, 0.86);
}

/* =========================================================
   WORKSPACE SHELL & TYPOGRAPHY
   ========================================================= */
.pipeline-workspace.page {
  min-height: 100vh;
  min-height: 100dvh;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  overflow-x: clip !important;
  padding: 10px 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: var(--bg-text-primary);
  background:
    radial-gradient(ellipse 80% 50% at 10% 0%, rgba(14, 165, 233, 0.1) 0%, transparent 55%),
    radial-gradient(ellipse 60% 45% at 90% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 55%),
    var(--bg-canvas);
  box-sizing: border-box;
  position: relative;
}

.pipeline-workspace.page.theme-light-blue {
  background:
    radial-gradient(ellipse 80% 50% at 10% 0%, rgba(2, 132, 199, 0.09) 0%, transparent 55%),
    radial-gradient(ellipse 60% 45% at 90% 100%, rgba(13, 148, 136, 0.06) 0%, transparent 55%),
    var(--bg-canvas);
}

.pipeline-workspace.page.theme-custom-glass {
  background:
    linear-gradient(180deg, var(--cg-dim-top, rgba(3, 14, 26, 0.22)), var(--cg-dim-bot, rgba(3, 14, 26, 0.34))),
    var(--cg-wallpaper, url('/hon-mun-island-in-nha-trang.jpg')) center / cover fixed no-repeat;
}

.pl-tabular {
  font-variant-numeric: tabular-nums;
}

.pl-mono {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}

.pipeline-workspace select option,
.pl-modal-overlay select option {
  background: var(--option-bg);
  color: var(--option-txt);
}

/* =========================================================
   MODULE 1: TOPBAR & CUSTOM GLASS TUNER
   ========================================================= */
.bg-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  box-shadow: var(--bg-shadow-card);
  backdrop-filter: blur(var(--cg-blur, 18px));
  flex-wrap: wrap;
}

.bg-brand-title-wrap {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.bg-brand-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--theme-pri-header-grad);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(2, 132, 199, 0.28);
}

.bg-title-stack {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.bg-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.bg-page-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.015em;
  color: var(--bg-text-primary);
}

.bg-page-subtitle {
  font-size: 12px;
  color: var(--bg-text-muted);
}

.pl-sync-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--sem-sky-txt);
  background: var(--sem-sky-bg);
  border: 1px solid var(--sem-sky-bdr);
}

.bg-topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bg-theme-mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border-radius: 10px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
}

.bg-theme-seg-btn,
.bg-theme-tuner-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--bg-text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
}

.bg-theme-seg-btn:hover,
.bg-theme-tuner-btn:hover {
  color: var(--bg-text-primary);
  background: var(--bg-surface-3);
}

.bg-theme-seg-btn.is-active,
.bg-theme-tuner-btn.is-open {
  background: var(--theme-cta-grad);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.28);
}

/* GLASS TUNER POPOVER */
.pl-tuner-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100010;
}

.pl-tuner-popover {
  position: fixed;
  top: 54px;
  right: 18px;
  width: 310px;
  z-index: 100015;
  padding: 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.28);
  backdrop-filter: blur(24px);
  box-shadow: 0 20px 50px rgba(2, 6, 23, 0.6);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* UNIFIED SLIM TOPBAR (LEFT-ALIGNED WORKSPACE TABS) */
.bg-topbar.is-unified-bar {
  padding: 6px 11px;
  gap: 10px;
  border-radius: 12px;
  min-height: 44px;
}

.pl-topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
}

.bg-topbar.is-unified-bar .bg-brand-title-wrap {
  gap: 8px;
}

.bg-brand-icon.is-slim-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.22);
}

.bg-topbar.is-unified-bar .bg-page-title {
  font-size: 14.5px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
}

.pl-workspace-tabs.is-slim-tabs {
  padding: 2px;
  gap: 3px;
  border-radius: 9px;
}

.pl-workspace-tabs.is-slim-tabs .bg-seg-btn {
  padding: 4.5px 10px;
  font-size: 12px;
  border-radius: 7px;
  gap: 5px;
}

.pl-workspace-tabs.is-slim-tabs .pl-ws-count {
  padding: 0.5px 6px;
  font-size: 10.5px;
}

.pl-command-actions.is-slim-actions {
  gap: 6px;
}

.pl-command-actions.is-slim-actions .pl-btn-xs {
  height: 29px;
  padding: 0 9px;
  font-size: 11.5px;
  border-radius: 8px;
}

.pl-topbar-divider {
  width: 1px;
  height: 20px;
  background: var(--bg-border-subtle);
  flex-shrink: 0;
}

.bg-theme-mode-switch.is-slim-theme-switch {
  padding: 2px;
  gap: 2px;
  border-radius: 8px;
}

.bg-theme-mode-switch.is-slim-theme-switch .bg-theme-seg-btn,
.bg-theme-mode-switch.is-slim-theme-switch .bg-theme-tuner-btn {
  padding: 4px 8px;
  font-size: 11.5px;
  border-radius: 6px;
}

.pl-tuner-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pl-tuner-title {
  font-size: 13px;
  font-weight: 800;
}

.pl-tuner-sub {
  font-size: 11px;
  color: #94a3b8;
}

.pl-tuner-presets {
  display: flex;
  gap: 6px;
}

.pl-preset-chip {
  flex: 1;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}

.pl-preset-chip.is-active {
  background: linear-gradient(135deg, #0284c7, #10b981);
  border-color: transparent;
  color: #ffffff;
}

.pl-tuner-sliders {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.pl-slider-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pl-slider-lbl {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: #cbd5e1;
  font-weight: 600;
}

.pl-slider-item input[type='range'] {
  width: 100%;
  accent-color: #10b981;
  cursor: pointer;
}

/* =========================================================
   MODULE 2: WORKSPACE TABS & BUTTON SYSTEM
   ========================================================= */
.pl-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 13px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  box-shadow: var(--bg-shadow-card);
  backdrop-filter: blur(var(--cg-blur, 18px));
  flex-wrap: wrap;
}

.bg-seg-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border-radius: 10px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  flex-wrap: wrap;
}

.bg-seg-switch.is-compact {
  padding: 2px;
  border-radius: 9px;
}

.bg-seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--bg-text-muted);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
  white-space: nowrap;
}

.bg-seg-switch.is-compact .bg-seg-btn {
  padding: 5px 10px;
  font-size: 12px;
}

.bg-seg-btn:hover {
  color: var(--bg-text-primary);
  background: var(--bg-surface-3);
}

.bg-seg-btn.is-active {
  background: var(--theme-cta-grad);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.25);
}

.pl-ws-count {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: rgba(148, 163, 184, 0.18);
  color: inherit;
}

.bg-seg-btn.is-active .pl-ws-count {
  background: rgba(255, 255, 255, 0.24);
  color: #ffffff;
}

.pl-command-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* BUTTONS */
.pl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.16s ease;
  text-decoration: none;
  white-space: nowrap;
}

.pl-btn:disabled {
  opacity: 0.52;
  cursor: not-allowed;
}

.pl-btn-sm {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 8px;
}

.pl-btn-xs {
  padding: 4px 8px;
  font-size: 11.5px;
  border-radius: 7px;
}

.pl-btn-primary {
  background: var(--theme-cta-grad);
  color: #ffffff;
  box-shadow: var(--theme-cta-shadow);
}

.pl-btn-primary:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.pl-btn-slate {
  background: var(--bg-surface-2);
  color: var(--bg-text-primary);
  border-color: var(--bg-border-strong);
}

.pl-btn-slate:hover:not(:disabled) {
  background: var(--bg-surface-3);
}

.pl-btn-sky-soft {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border-color: var(--sem-sky-bdr);
}

.pl-btn-sky-soft:hover:not(:disabled) {
  filter: brightness(1.08);
}

.pl-btn-emerald-soft {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
  border-color: var(--sem-emerald-bdr);
}

.pl-btn-emerald-soft:hover:not(:disabled) {
  filter: brightness(1.08);
}

.pl-btn-danger {
  background: linear-gradient(135deg, #e11d48 0%, #ef4444 100%);
  color: #ffffff;
  box-shadow: 0 6px 16px rgba(225, 29, 72, 0.28);
}

.pl-btn-danger-ghost {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
  border-color: var(--sem-rose-bdr);
}

.pl-btn-danger-ghost:hover:not(:disabled) {
  background: rgba(244, 63, 94, 0.22);
}

.pl-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-surface-2);
  color: var(--bg-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pl-icon-btn:hover {
  color: var(--bg-text-primary);
  border-color: var(--bg-border-strong);
  background: var(--bg-surface-3);
}

.pl-icon-btn.is-danger:hover {
  color: var(--sem-rose-txt);
  border-color: var(--sem-rose-bdr);
  background: var(--sem-rose-bg);
}

.pl-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--sem-sky-txt);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 5px;
}

.pl-link-btn:hover {
  background: var(--sem-sky-bg);
}

/* =========================================================
   ASYMMETRIC BENTO COMMAND DECK (.bg-bento-deck)
   ========================================================= */
.pl-tab-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  min-height: 0;
}

.bg-bento-deck {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 440px;
  gap: 10px;
  align-items: stretch;
}

.bg-bento-deck.is-kanban-compact-deck {
  grid-template-columns: minmax(0, 54fr) minmax(0, 46fr);
  gap: 8px;
  align-items: stretch;
}

.bg-filter-strip {
  border-radius: 12px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  box-shadow: var(--bg-shadow-card);
  backdrop-filter: blur(var(--cg-blur, 18px));
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.bg-filter-strip.is-slim-toolbar {
  padding: 6px 10px;
}

.bg-filter-strip.is-kanban-slim-bar {
  padding: 6px 10px;
  justify-content: center;
}

.pl-slim-toolbar-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pl-slim-toolbar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-slim-toolbar-row.is-sub-row {
  padding-top: 5px;
  border-top: 1px dashed var(--bg-border-subtle);
}

.bg-search-shell.is-slim-inline {
  height: 31px;
  padding: 0 9px;
  gap: 6px;
  border-radius: 8px;
  flex: 1 1 180px;
  min-width: 150px;
}

.bg-search-shell.is-slim-inline .bg-search-inp {
  font-size: 12px;
}

.is-slim-pickers .pl-picker-trigger {
  height: 31px;
  padding: 0 8px;
  gap: 5px;
  border-radius: 8px;
  font-size: 11.5px;
  max-width: 225px;
}

.is-slim-pickers .pl-picker-val {
  max-width: 132px;
}

.bg-seg-switch.is-slim-seg {
  padding: 2px;
  gap: 2px;
  border-radius: 8px;
}

.bg-seg-switch.is-slim-seg .bg-seg-btn {
  padding: 3.5px 8px;
  font-size: 11.5px;
  border-radius: 6px;
  gap: 4px;
}

.pl-select-capsule.is-slim-capsule {
  height: 29px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 11.5px;
}

.pl-select-capsule.is-slim-capsule .pl-capsule-select {
  font-size: 11.5px;
}

.bg-date-range-capsule.is-slim-date {
  height: 29px;
  padding: 0 8px;
  border-radius: 8px;
}

.bg-date-range-capsule.is-slim-date .bg-date-inp {
  font-size: 11.5px;
}

.pl-slim-reset-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 29px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid var(--sem-rose-bdr);
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.pl-slim-reset-btn:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}

/* =========================================================
   COMPACT PIPELINE FILE VAULT (3.1A: 2-SOURCE SPLIT VAULT)
   ========================================================= */
.pl-pipe-files-vault {
  border-radius: 12px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  box-shadow: var(--bg-shadow-card);
  backdrop-filter: blur(var(--cg-blur, 18px));
  padding: 6px 9px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  max-height: 94px;
  overflow: hidden;
}

.pl-pfv-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;
  height: 100%;
  align-items: stretch;
}

.pl-pfv-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  min-height: 0;
}

.pl-pfv-col.is-direct-col {
  padding-left: 8px;
  border-left: 1px dashed var(--bg-border-subtle);
}

.pl-pfv-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  flex-shrink: 0;
  min-width: 0;
}

.pl-pfv-title {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.015em;
  color: var(--bg-text-secondary);
  min-width: 0;
  white-space: nowrap;
}

.pl-pfv-col.is-report-col .pl-pfv-title svg {
  color: var(--sem-emerald-txt);
  flex-shrink: 0;
}

.pl-pfv-col.is-direct-col .pl-pfv-title svg {
  color: var(--sem-sky-txt);
  flex-shrink: 0;
}

.pl-pfv-cnt {
  padding: 0.5px 6px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
  border: 1px solid var(--sem-emerald-bdr);
  flex-shrink: 0;
}

.pl-pfv-cnt.is-sky {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border-color: var(--sem-sky-bdr);
}

.pl-pfv-expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 20px;
  padding: 0 5px;
  border-radius: 5px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-surface-2);
  color: var(--bg-text-secondary);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  transition: all 0.14s ease;
}

.pl-pfv-expand-btn.is-with-lbl {
  padding: 0 6px;
  border-color: var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
}

.pl-pfv-expand-btn:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pl-pfv-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 44px;
  border-radius: 7px;
  border: 1px dashed var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-faint);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  text-align: center;
}

.pl-pfv-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 54px;
  overflow-y: auto;
  padding-right: 2px;
  min-width: 0;
}

.pl-pfv-list::-webkit-scrollbar {
  width: 4px;
}

.pl-pfv-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.35);
  border-radius: 999px;
}

.pl-pfv-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2.5px 5px;
  border-radius: 6px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  min-width: 0;
  transition: border-color 0.14s ease, background 0.14s ease;
}

.pl-pfv-pill:hover {
  border-color: var(--sem-sky-bdr);
  background: var(--bg-surface-2);
}

.pl-pfv-fname {
  flex: 1 1 0%;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  text-align: left;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: var(--bg-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.pl-pfv-fname:hover {
  color: var(--sem-sky-txt);
  text-decoration: underline;
}

.pl-pfv-acts {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

/* =========================================================
   SWAPPED & TALLER KANBAN COMMAND DECK + UNIFIED CONTROL ROW
   ========================================================= */
.bg-bento-deck.is-kanban-spacious-deck {
  grid-template-columns: minmax(0, 52fr) minmax(0, 48fr);
  gap: 10px;
  align-items: stretch;
}

/* Left: Taller 2-Source Pipeline File Vault (Frameless Large Rows like SaleReportFirebase) */
.pl-pipe-files-vault.is-taller-vault {
  min-height: 174px;
  max-height: 204px;
  padding: 11px 14px;
  justify-content: flex-start;
  border-radius: 14px;
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-grid {
  gap: 14px;
  flex: 1 1 auto;
  min-height: 0;
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-col {
  gap: 8px;
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-col.is-direct-col {
  padding-left: 14px;
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-head {
  padding-bottom: 6px;
  border-bottom: 1px solid var(--bg-border-subtle);
  min-height: 25px;
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-title {
  font-size: 12.5px;
  gap: 6px;
  color: var(--bg-text-primary);
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-cnt {
  padding: 1px 7px;
  font-size: 11px;
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-expand-btn {
  height: 24px;
  padding: 0 7px;
  border-radius: 6px;
  font-size: 11px;
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-expand-btn.is-with-lbl {
  padding: 0 8px;
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-list {
  flex: 1 1 auto;
  max-height: 142px;
  gap: 8px;
  padding: 2px 4px 2px 0;
}

/* Frameless Large File Item (Synced with SaleReportFirebase .sr-po-all-file-row) */
.pl-pfv-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 2px 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.pl-pfv-file-main {
  width: auto;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1 1 0%;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--bg-text-primary);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.42;
  text-align: left;
  cursor: pointer;
  transition: color 0.14s ease;
}

.pl-pfv-file-svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}

.pl-pfv-file-svg :deep(svg) {
  width: 38px !important;
  height: 38px !important;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.24));
}

.pl-pfv-label-wrap {
  flex: 1 1 0%;
  min-width: 0;
  line-height: 1.42;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pl-rep-file-badge.is-pfv-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  padding: 1.5px 6px;
  border-radius: 4px;
  margin-right: 6px;
  vertical-align: 1px;
}

.pl-pfv-fname-txt {
  vertical-align: baseline;
}

.pl-pfv-file-main:hover .pl-pfv-fname-txt {
  color: var(--sem-sky-txt);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.pl-pfv-acts {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.pl-pfv-fe-btn {
  width: auto;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 23px;
  padding: 0 7px;
  border-radius: 5px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  flex-shrink: 0;
  box-sizing: border-box;
}

.pl-pfv-fe-btn.is-dl,
.pl-pfv-fe-btn.is-locate {
  width: 24px;
  padding: 0;
}

.pl-pfv-fe-btn.is-view {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-pfv-fe-btn.is-view:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pl-pfv-fe-btn.is-dl {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bdr);
  color: var(--sem-emerald-txt);
}

.pl-pfv-fe-btn.is-dl:hover {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.pl-pfv-fe-btn.is-locate {
  background: var(--bg-surface-2);
  border-color: var(--bg-border-subtle);
  color: var(--bg-text-secondary);
}

.pl-pfv-fe-btn.is-locate:hover {
  background: #d97706;
  border-color: #d97706;
  color: #ffffff;
}

.pl-pipe-files-vault.is-taller-vault .pl-pfv-empty {
  min-height: 112px;
  border: none;
  background: transparent;
  font-size: 12px;
  padding: 8px 10px;
}

/* Right: Frameless Vertical Cascading Filter List (PA1: Flat 4 Rows + Header Timeline) */
.bg-filter-strip.is-kanban-filter-panel {
  min-height: 174px;
  padding: 11px 4px 4px 10px;
  border-radius: 0;
  justify-content: flex-start;
}

.bg-filter-strip.is-kanban-filter-panel.is-frameless-vertical {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

.pl-filter-panel-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 2px;
  flex: 1 1 auto;
  min-width: 0;
}

.pl-fp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--bg-border-subtle);
  min-height: 25px;
}

.pl-fp-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.015em;
  color: var(--bg-text-primary);
  white-space: nowrap;
}

.pl-fp-title svg {
  color: var(--sem-sky-txt);
  flex-shrink: 0;
}

.pl-fp-head-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-left: auto;
}

.bg-seg-switch.is-fp-head-seg {
  padding: 2px;
  gap: 2px;
  border-radius: 7px;
}

.bg-seg-switch.is-fp-head-seg .bg-seg-btn {
  padding: 2.5px 7.5px;
  font-size: 11px;
  border-radius: 5.5px;
}

.pl-slim-reset-btn.is-fp-head-reset {
  margin-left: 0;
  height: 23px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 11px;
}

.pl-fp-date-inline-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 4px 6px 5px;
  border-bottom: 1px dashed var(--bg-border-subtle);
  min-width: 0;
}

.pl-fp-date-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--bg-text-muted);
  white-space: nowrap;
}

.bg-date-range-capsule.is-spacious-date {
  height: 32px;
  padding: 0 9px;
  border-radius: 8px;
}

.bg-date-range-capsule.is-spacious-date.is-flat-date {
  height: 27px;
  padding: 0 8px;
  border-radius: 7px;
}

.pl-filter-vertical-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1 1 auto;
  gap: 0;
  min-width: 0;
}

.pl-filter-vertical-list .pl-dropdown-anchor {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
}

.pl-picker-trigger.is-flat-row {
  width: 100%;
  max-width: none;
  height: 35px;
  padding: 0 8px;
  gap: 8px;
  border-radius: 6px 6px 0 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--bg-border-subtle);
  box-shadow: none;
  color: var(--bg-text-primary);
  font-size: 12.5px;
  justify-content: flex-start;
  box-sizing: border-box;
  min-width: 0;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.pl-picker-trigger.is-flat-row .pl-flat-row-ic {
  color: var(--bg-text-muted);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.pl-picker-trigger.is-flat-row .pl-picker-lbl {
  width: 66px;
  flex-shrink: 0;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-text-muted);
  transition: color 0.15s ease;
}

.pl-picker-trigger.is-flat-row .pl-picker-val {
  flex: 1 1 0%;
  min-width: 0;
  max-width: none;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--bg-text-primary);
}

.pl-picker-trigger.is-flat-row .pl-caret-svg,
.pl-picker-trigger.is-flat-row .pl-picker-clear {
  margin-left: auto;
  flex-shrink: 0;
}

.pl-picker-trigger.is-flat-row .pl-caret-svg {
  transition: transform 0.18s ease, color 0.15s ease;
}

.pl-picker-trigger.is-flat-row:hover,
.pl-filter-vertical-list .pl-dropdown-anchor.is-open .pl-picker-trigger.is-flat-row {
  background: rgba(56, 189, 248, 0.07);
  border-bottom-color: var(--sem-sky-bdr);
}

.pipeline-workspace.page.theme-light-blue .pl-picker-trigger.is-flat-row:hover,
.pipeline-workspace.page.theme-light-blue .pl-filter-vertical-list .pl-dropdown-anchor.is-open .pl-picker-trigger.is-flat-row {
  background: rgba(2, 132, 199, 0.06);
  border-bottom-color: #38bdf8;
}

.pl-picker-trigger.is-flat-row:hover .pl-flat-row-ic,
.pl-picker-trigger.is-flat-row:hover .pl-caret-svg,
.pl-filter-vertical-list .pl-dropdown-anchor.is-open .pl-picker-trigger.is-flat-row .pl-flat-row-ic,
.pl-filter-vertical-list .pl-dropdown-anchor.is-open .pl-picker-trigger.is-flat-row .pl-caret-svg {
  color: var(--sem-sky-txt);
}

.pl-filter-vertical-list .pl-dropdown-anchor.is-open .pl-picker-trigger.is-flat-row .pl-caret-svg {
  transform: rotate(180deg);
}

.pl-picker-trigger.is-flat-row.is-filtered {
  background: linear-gradient(90deg, rgba(14, 165, 233, 0.12) 0%, transparent 92%);
  border: none;
  border-bottom: 1px solid var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pipeline-workspace.page.theme-light-blue .pl-picker-trigger.is-flat-row.is-filtered {
  background: linear-gradient(90deg, rgba(2, 132, 199, 0.1) 0%, transparent 92%);
  border-bottom-color: #0284c7;
}

.pl-picker-trigger.is-flat-row.is-filtered .pl-flat-row-ic,
.pl-picker-trigger.is-flat-row.is-filtered .pl-picker-lbl {
  color: var(--sem-sky-txt);
}

.pl-picker-trigger.is-flat-row.is-filtered .pl-picker-val {
  color: var(--sem-sky-txt);
  font-weight: 700;
}

.pl-filter-vertical-list .pl-dropdown-menu {
  left: 0;
  right: 0;
  width: 100%;
  min-width: min(320px, 90vw);
  max-width: 100%;
  top: calc(100% + 3px);
}

/* Unified Control, Centered Search & Action Row Directly Below Deck */
.pl-kanban-control-bar {
  display: grid;
  grid-template-columns: minmax(max-content, 1fr) minmax(220px, 340px) minmax(max-content, 1fr);
  align-items: center;
  gap: 10px;
  padding: 2px 0;
  position: relative;
}

.pl-kcb-left,
.pl-kcb-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  min-width: 0;
}

.pl-kcb-left {
  justify-self: start;
}

.pl-kcb-center {
  position: relative;
  width: 100%;
  max-width: 340px;
  height: 36px;
  justify-self: center;
  min-width: 0;
  z-index: 44;
}

.pl-kcb-center:focus-within {
  z-index: 84;
}

.bg-search-shell.is-control-bar-search {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 36px;
  padding: 0 11px;
  border-radius: 9px;
  width: 100%;
  box-sizing: border-box;
  cursor: text;
  transition:
    width 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    padding 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    border-radius 0.22s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.22s ease;
}

.bg-search-shell.is-control-bar-search .bg-search-ic {
  transition: color 0.18s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.bg-search-shell.is-control-bar-search .bg-search-inp {
  transition: font-size 0.18s ease;
}

.bg-search-shell.is-control-bar-search.has-query:not(:focus-within) {
  border-color: var(--sem-sky-bdr);
  background: var(--bg-surface-2);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
}

.bg-search-shell.is-control-bar-search:focus-within {
  width: min(640px, calc(100vw - 48px));
  height: 46px;
  padding: 0 16px;
  border-radius: 13px;
  background: #0f172a;
  border: 1.5px solid #38bdf8;
  box-shadow:
    0 0 0 4px rgba(56, 189, 248, 0.2),
    0 18px 38px -10px rgba(2, 6, 23, 0.72);
}

.pipeline-workspace.page.theme-light-blue .bg-search-shell.is-control-bar-search:focus-within {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow:
    0 0 0 4px rgba(2, 132, 199, 0.16),
    0 16px 34px -8px rgba(15, 23, 42, 0.18);
}

.pipeline-workspace.page.theme-custom-glass .bg-search-shell.is-control-bar-search:focus-within {
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(22px);
  border-color: #38bdf8;
}

.bg-search-shell.is-control-bar-search:focus-within .bg-search-ic {
  color: #38bdf8;
  transform: scale(1.12);
}

.pipeline-workspace.page.theme-light-blue .bg-search-shell.is-control-bar-search:focus-within .bg-search-ic {
  color: #0284c7;
}

.bg-search-shell.is-control-bar-search:focus-within .bg-search-inp {
  font-size: 14.5px;
  font-weight: 600;
}

.pl-search-match-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1.25;
  white-space: nowrap;
  flex-shrink: 0;
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border: 1px solid var(--sem-sky-bdr);
  user-select: none;
}

.pl-search-match-pill.is-zero {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
  border-color: var(--sem-rose-bdr);
}

/* Search Substring Highlight Inside Kanban Cards & Swimlanes */
:deep(.pl-search-hl) {
  background: linear-gradient(135deg, #fde047 0%, #facc15 100%) !important;
  color: #0f172a !important;
  font-weight: 800;
  padding: 0.5px 3.5px;
  margin: 0 -0.5px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(234, 179, 8, 0.48);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.pl-card.is-search-hit:not(.is-done):not(.is-failed):not(.highlight-card) {
  border-color: rgba(56, 189, 248, 0.48);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.16), 0 8px 20px -6px rgba(2, 6, 23, 0.34);
}

.pipeline-workspace.page.theme-light-blue .pl-card.is-search-hit:not(.is-done):not(.is-failed):not(.highlight-card) {
  border-color: #38bdf8;
  box-shadow: 0 0 0 1.5px rgba(14, 165, 233, 0.18), 0 8px 18px -6px rgba(15, 23, 42, 0.12);
}

.pl-kcb-right {
  justify-self: end;
  margin-left: 0;
}

.pl-kcb-left .bg-seg-switch.is-compact,
.pl-kcb-left .bg-theme-mode-switch {
  min-height: 36px;
  box-sizing: border-box;
}

.pl-kcb-right .pl-btn-sm {
  height: 36px;
  padding: 0 12px;
  box-sizing: border-box;
}

.bg-filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 13px 13px 0 0;
  background: var(--theme-pri-header-grad);
  color: #ffffff;
}

.bg-filter-head-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.bg-filter-head-tools {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bg-head-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}

.bg-head-btn:hover {
  background: rgba(255, 255, 255, 0.26);
}

.bg-filter-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  justify-content: center;
}

.bg-search-shell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  height: 38px;
  border-radius: 10px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.bg-search-shell:focus-within {
  border-color: var(--sem-sky-bdr);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.14);
}

.bg-search-ic {
  color: var(--bg-text-muted);
  flex-shrink: 0;
}

.bg-search-inp {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--bg-text-primary);
  font-size: 13px;
}

.bg-search-inp::placeholder {
  color: var(--bg-text-faint);
}

.bg-search-clr {
  border: none;
  background: transparent;
  color: var(--bg-text-muted);
  cursor: pointer;
  display: inline-flex;
  padding: 3px;
  border-radius: 5px;
}

.bg-search-clr:hover {
  color: var(--bg-text-primary);
  background: var(--bg-surface-3);
}

.bg-filter-row-pickers,
.bg-filter-row-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-micro-lbl {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--bg-text-muted);
}

/* CUSTOMER PICKER POPOVER & SELECT CAPSULES */
.pl-dropdown-anchor {
  position: relative;
}

.pl-picker-trigger,
.pl-select-capsule {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 10px;
  border-radius: 9px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  color: var(--bg-text-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  max-width: 260px;
}

.pl-picker-trigger.is-filtered,
.pl-select-capsule.is-filtered {
  border-color: var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
}

.pl-picker-lbl {
  font-weight: 800;
  color: var(--bg-text-muted);
}

.pl-picker-val {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 170px;
}

.pl-picker-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(244, 63, 94, 0.18);
  color: var(--sem-rose-txt);
}

.pl-caret-svg {
  color: var(--bg-text-muted);
  flex-shrink: 0;
}

.pl-capsule-select {
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: 12px;
  font-weight: 700;
  max-width: 205px;
  cursor: pointer;
}

.pl-dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
}

.pl-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 340px;
  max-width: 90vw;
  z-index: 95;
  border-radius: 12px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-strong);
  box-shadow: var(--bg-shadow-modal);
  overflow: hidden;
}

.pl-dropdown-menu.is-align-right {
  left: auto;
  right: 0;
}

.pl-dropdown-search {
  padding: 8px;
  border-bottom: 1px solid var(--bg-border-subtle);
}

.pl-dropdown-list {
  max-height: 260px;
  overflow-y: auto;
  padding: 5px;
}

.pl-dropdown-item {
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 12.5px;
  color: var(--bg-text-primary);
  cursor: pointer;
}

.pl-dropdown-item:hover {
  background: var(--bg-surface-3);
}

.pl-dropdown-item.is-selected {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  font-weight: 700;
}

.pl-dd-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.pl-dd-main > span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-dd-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--bg-text-muted);
  margin-left: auto;
  flex-shrink: 0;
  max-width: 48%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-dd-empty {
  padding: 14px 10px;
  text-align: center;
  font-size: 12px;
  color: var(--bg-text-muted);
}

.pl-mini-tag {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
}

.pl-mini-tag.is-emerald {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
  border: 1px solid var(--sem-emerald-bdr);
}

.pl-mini-tag.is-sky {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border: 1px solid var(--sem-sky-bdr);
}

.pl-mini-tag.is-amber {
  background: var(--sem-amber-bg);
  color: var(--sem-amber-txt);
  border: 1px solid var(--sem-amber-bdr);
}

.pl-mini-tag.is-slate {
  background: var(--bg-surface-3);
  color: var(--bg-text-secondary);
  border: 1px solid var(--bg-border-subtle);
}

/* DATE RANGE CAPSULE */
.bg-date-range-capsule {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 9px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
}

.bg-date-inp {
  border: none;
  outline: none;
  background: transparent;
  color: var(--bg-text-primary);
  font-size: 12px;
  font-weight: 600;
}

.bg-date-inp.is-year {
  width: 74px;
}

.pl-sep {
  color: var(--bg-text-muted);
  font-weight: 700;
}

/* RIGHT BENTO: 1-TALL HERO + 3-STACKED KPI ROWS */
.bg-kpi-grid {
  display: grid;
  grid-template-columns: 165px minmax(0, 1fr);
  gap: 10px;
}

.bg-kpi-hero {
  padding: 13px;
  border-radius: 14px;
  background: var(--theme-pri-header-grad);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--bg-shadow-card);
}

.bg-kpi-hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.bg-kpi-hero-lbl {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  opacity: 0.92;
}

.bg-kpi-hero-ic {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bg-kpi-hero-val {
  font-size: 30px;
  font-weight: 900;
  line-height: 1.05;
  margin: 6px 0 3px;
}

.bg-kpi-hero-sub {
  font-size: 11px;
  opacity: 0.92;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bg-kpi-hero-bar {
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.24);
  overflow: hidden;
  margin-top: 8px;
}

.bg-kpi-hero-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: #ffffff;
  transition: width 0.3s ease;
}

.bg-kpi-hero-foot {
  margin-top: 5px;
  font-size: 10.5px;
  opacity: 0.86;
}

.bg-kpi-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
}

.bg-kpi-row {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 11px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  border-left-width: 4px;
  box-shadow: var(--bg-shadow-card);
  backdrop-filter: blur(var(--cg-blur, 18px));
}

.bg-kpi-row.is-sky {
  border-left-color: #0ea5e9;
}

.bg-kpi-row.is-amber {
  border-left-color: #f59e0b;
}

.bg-kpi-row.is-emerald {
  border-left-color: #10b981;
}

.bg-kpi-row-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.bg-kpi-row-lbl {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: var(--bg-text-muted);
}

.bg-kpi-row-sub {
  font-size: 11px;
  color: var(--bg-text-faint);
}

.bg-kpi-row-val {
  font-size: 15px;
  font-weight: 900;
  white-space: nowrap;
}

.bg-kpi-row.is-sky .bg-kpi-row-val {
  color: var(--sem-sky-txt);
}

.bg-kpi-row.is-amber .bg-kpi-row-val {
  color: var(--sem-amber-txt);
}

.bg-kpi-row.is-emerald .bg-kpi-row-val {
  color: var(--sem-emerald-txt);
}

/* =========================================================
   CUSTOMER CONTEXT BANNER & EMPTY PANEL
   ========================================================= */
.pl-customer-flow-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 14px;
  border-radius: 12px;
  background: var(--bg-surface-1);
  border: 1px solid var(--sem-sky-bdr);
  flex-wrap: wrap;
}

.pl-cfb-left {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.pl-cfb-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.pl-cfb-badge.is-emerald {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
  border: 1px solid var(--sem-emerald-bdr);
}

.pl-cfb-badge.is-sky {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border: 1px solid var(--sem-sky-bdr);
}

.pl-cfb-text {
  font-size: 12.5px;
  color: var(--bg-text-secondary);
}

.pl-cfb-other-flows {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--bg-text-muted);
  flex-wrap: wrap;
}

.pl-cfb-switch-chip {
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-surface-2);
  color: var(--bg-text-primary);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
}

.pl-cfb-switch-chip:hover {
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-cfb-switch-chip.is-current {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border-color: var(--sem-sky-bdr);
  box-shadow: 0 0 0 1px var(--sem-sky-bdr);
}

.pl-modal-company-flows {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}

.pl-mcf-chip {
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid var(--bg-border-strong);
  background: var(--bg-surface-2);
  color: var(--bg-text-secondary);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pl-mcf-chip:hover {
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-mcf-chip.is-active {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border-color: var(--sem-sky-bdr);
}

.pl-empty-panel {
  padding: 36px 20px;
  border-radius: 14px;
  background: var(--bg-surface-1);
  border: 1px dashed var(--bg-border-strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.pl-empty-ic {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pl-empty-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-empty-sub {
  max-width: 520px;
  font-size: 12.5px;
  color: var(--bg-text-muted);
}

.pl-empty-inline {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--bg-text-muted);
}

/* =========================================================
   TAB 2: 6/4 SPLIT PORTFOLIO WORKSPACE (60% DỰ ÁN | 40% KHO FLOW)
   ========================================================= */
.pl-proj-bento-row {
  align-items: center;
}

.pl-projects-split-workspace {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 4fr);
  gap: 16px;
  align-items: start;
}

.pl-proj-left-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.pl-projects-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  width: 100%;
}

.pl-project-card {
  --proj-accent: #0ea5e9;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 14px 16px 13px 15px;
  border-radius: 14px;
  background:
    radial-gradient(ellipse 90% 65% at 0% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 62%),
    var(--bg-surface-2);
  border: 1px solid var(--bg-border-strong);
  border-left: 4.5px solid var(--proj-accent);
  box-shadow: var(--bg-shadow-card);
  backdrop-filter: blur(var(--cg-blur, 18px));
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition:
    transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.18s ease,
    box-shadow 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.18s ease;
}

.pipeline-workspace.page.theme-light-blue .pl-project-card {
  background: #ffffff;
  border-color: #cbd5e1;
  border-left-color: var(--proj-accent);
  box-shadow: 0 5px 15px -3px rgba(15, 23, 42, 0.08);
}

.pl-project-card.is-active-proj {
  --proj-accent: #0ea5e9;
}

.pipeline-workspace.page.theme-light-blue .pl-project-card.is-active-proj {
  --proj-accent: #0284c7;
}

.pl-project-card.is-paused-proj {
  --proj-accent: #f59e0b;
  border-color: rgba(245, 158, 11, 0.36);
  background: linear-gradient(140deg, rgba(245, 158, 11, 0.12) 0%, var(--bg-surface-2) 68%);
}

.pipeline-workspace.page.theme-light-blue .pl-project-card.is-paused-proj {
  border-color: #fde68a;
  border-left-color: #f59e0b;
  background: linear-gradient(140deg, #fffbeb 0%, #ffffff 72%);
}

.pl-project-card.is-overdue-proj:not(.is-done-proj) {
  --proj-accent: #e11d48;
}

/* Completed Project Hierarchy — Report-DNA Solid Emerald (Dark/Glass) / Solid Ocean Blue (Light) */
.pl-project-card.is-done-proj {
  --proj-accent: #a7f3d0;
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  border: 1px solid rgba(110, 231, 183, 0.44) !important;
  border-left: 4.5px solid #a7f3d0 !important;
  color: #ffffff !important;
  box-shadow: 0 8px 20px -4px rgba(5, 150, 105, 0.42);
}

.pipeline-workspace.page.theme-light-blue .pl-project-card.is-done-proj {
  --proj-accent: #e0f2fe;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
  border: 1px solid rgba(125, 211, 252, 0.52) !important;
  border-left: 4.5px solid #e0f2fe !important;
  color: #ffffff !important;
  box-shadow: 0 8px 20px -4px rgba(2, 132, 199, 0.34);
}

.pl-project-card:hover {
  transform: translateY(-2px);
  border-color: var(--sem-sky-bdr);
  border-left-color: var(--proj-accent);
  box-shadow: 0 14px 28px -10px rgba(2, 6, 23, 0.46);
}

.pipeline-workspace.page.theme-light-blue .pl-project-card:hover {
  border-color: #94a3b8;
  border-left-color: var(--proj-accent);
  box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.15);
}

.pl-project-card.is-done-proj:hover {
  box-shadow: 0 12px 26px -6px rgba(5, 150, 105, 0.52);
}

.pipeline-workspace.page.theme-light-blue .pl-project-card.is-done-proj:hover {
  box-shadow: 0 12px 26px -6px rgba(2, 132, 199, 0.44);
}

.pl-project-card.is-drag-ready {
  border-style: dashed;
  border-left-style: solid;
  border-color: var(--bg-border-strong);
  border-left-color: var(--proj-accent);
}

.pl-project-card.is-drag-over {
  border-style: solid;
  border-color: var(--sem-emerald-bdr);
  border-left-color: #10b981;
  box-shadow: 0 0 0 2px var(--sem-emerald-bg), var(--bg-shadow-card);
}

.pl-project-card.is-drag-duplicate {
  border-style: solid;
  border-color: var(--sem-amber-bdr);
  border-left-color: #f59e0b;
  box-shadow: 0 0 0 2px var(--sem-amber-bg), var(--bg-shadow-card);
}

.pl-proj-drop-slot {
  padding: 8px 12px;
  border-radius: 9px;
  border: 1px dashed var(--bg-border-strong);
  background: var(--bg-input-well);
  color: var(--bg-text-muted);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  pointer-events: none;
  transition: all 0.15s ease;
}

.pl-proj-drop-slot.is-active {
  border-color: var(--sem-emerald-bdr);
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
}

.pl-proj-drop-slot.is-duplicate {
  border-style: dashed;
  border-color: var(--sem-amber-bdr);
  background: var(--sem-amber-bg);
  color: var(--sem-amber-txt);
  font-weight: 700;
}

/* TIER 1: TOP META & BADGES ROW (REPORT DNA) */
.pl-proj-meta-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px 8px;
}

.pl-proj-meta-left,
.pl-proj-meta-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-proj-code-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  color: var(--bg-text-secondary);
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
}

.pl-proj-deadline-chip {
  display: inline-flex;
  align-items: center;
  gap: 4.5px;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  color: var(--bg-text-muted);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.pl-proj-deadline-chip.is-overdue {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bdr);
  color: var(--sem-rose-txt);
  font-weight: 800;
}

/* TIER 2: FLAT PROJECT IDENTITY + NOTE (NO BOX-INSIDE-BOX) */
.pl-proj-head-minimal {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.pl-proj-identity {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  flex: 1;
}

.pl-proj-title {
  flex: 1 1 0;
  min-width: 0;
  font-size: 15.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
  line-height: 1.36;
  letter-spacing: -0.012em;
  word-break: break-word;
}

.pl-proj-subline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--bg-text-muted);
  line-height: 1.4;
  min-width: 0;
}

.pl-proj-party-ic {
  color: var(--sem-sky-txt);
  flex-shrink: 0;
}

.pl-proj-company-txt {
  color: var(--bg-text-secondary);
  font-weight: 700;
}

.pl-proj-cus-txt {
  color: var(--bg-text-muted);
  font-weight: 600;
}

.pl-proj-missing-cus {
  color: var(--bg-text-faint);
  font-style: italic;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.pl-proj-note-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 8px;
  background: var(--bg-input-well);
  border: 1px dashed var(--bg-border-subtle);
  font-size: 11.5px;
  line-height: 1.4;
}

.pl-proj-note-tag {
  flex-shrink: 0;
  padding: 1px 5.5px;
  border-radius: 4px;
  background: var(--sem-amber-bg);
  border: 1px solid var(--sem-amber-bdr);
  color: var(--sem-amber-txt);
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.pl-proj-note-txt {
  color: var(--bg-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.pl-proj-partner-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7.5px;
  border-radius: 6px;
  background: var(--sem-amber-bg);
  border: 1px solid var(--sem-amber-bdr);
  color: var(--sem-amber-txt);
  font-size: 10.5px;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
}

/* TIER 3: FLAT FINANCIAL METRICS & INLINE PROGRESS BAR (REPORT DNA) */
.pl-proj-metrics-flat {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding-top: 9px;
  border-top: 1px dashed var(--bg-border-subtle);
}

.pl-proj-metrics-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.pl-metric-chip.is-won-chip {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bdr);
  color: var(--sem-emerald-txt);
}

.pl-proj-prog-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.pl-proj-exec-lbl {
  font-size: 11px;
  color: var(--bg-text-muted);
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.pl-proj-exec-pct {
  font-size: 11.5px;
  color: var(--bg-text-primary);
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 32px;
  text-align: right;
}

.pl-proj-prog-track {
  flex: 1 1 auto;
  height: 6px;
  border-radius: 999px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  overflow: hidden;
}

.pl-proj-prog-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0284c7 0%, #38bdf8 100%);
  transition: width 0.25s ease;
}

.pl-proj-prog-fill.is-done {
  background: linear-gradient(90deg, #059669 0%, #34d399 100%);
}

.pl-proj-vol-hero {
  margin-left: auto;
  font-size: 15px;
  font-weight: 900;
  color: var(--sem-emerald-txt);
  line-height: 1.25;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.pl-proj-vol-hero.is-zero {
  color: var(--bg-text-faint);
  font-weight: 700;
}

.pl-proj-vol-cur {
  margin-left: 2px;
  font-size: 11.5px;
  font-weight: 800;
  opacity: 0.88;
}

.pl-dot-sep {
  opacity: 0.55;
  font-size: 11px;
  user-select: none;
}

.pl-em-sep {
  color: var(--bg-text-faint);
  margin: 0 5px;
  user-select: none;
}

.pl-ghost-ic-btn {
  width: 27px;
  height: 27px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--bg-text-faint);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.14s ease, background-color 0.14s ease, border-color 0.14s ease;
}

.pl-ghost-ic-btn:hover {
  color: var(--bg-text-primary) !important;
  background: var(--bg-input-well);
  border-color: var(--bg-border-subtle);
}

.pl-ghost-ic-btn.is-danger:hover {
  color: var(--sem-rose-txt) !important;
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bdr);
}

.pl-proj-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.pl-proj-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pl-code-pill {
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  color: var(--bg-text-secondary);
  font-weight: 700;
}

.pl-status-pill {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
  white-space: nowrap;
}

.pl-status-pill.is-emerald {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
  border: 1px solid var(--sem-emerald-bdr);
}

.pl-status-pill.is-sky {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border: 1px solid var(--sem-sky-bdr);
}

.pl-status-pill.is-amber {
  background: var(--sem-amber-bg);
  color: var(--sem-amber-txt);
  border: 1px solid var(--sem-amber-bdr);
}

.pl-status-pill.is-rose {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
  border: 1px solid var(--sem-rose-bdr);
}

.pl-inline-ic-txt {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.pl-inline-ic-txt.is-strong {
  color: var(--bg-text-primary);
  font-weight: 700;
}

/* TIER 4: WORKFLOW STACK INSIDE PROJECT & MODAL */
.pl-proj-wf-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px dashed var(--bg-border-subtle);
}

.pl-proj-wf-sec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 1px;
}

.pl-proj-wf-sec-lbl {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--bg-text-muted);
}

.pl-proj-wf-card {
  padding: 8px 11px;
  border-radius: 9.5px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  border-left: 3px solid var(--sem-sky-bdr);
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.pl-proj-wf-card:hover {
  border-color: var(--bg-border-strong);
  border-left-color: #0ea5e9;
}

.pl-proj-wf-card.is-preferred {
  border-left-color: #10b981;
}

.pl-proj-wf-card.is-dup-hover {
  border-color: #f59e0b !important;
  border-left-color: #f59e0b !important;
  background: var(--sem-amber-bg) !important;
  box-shadow: 0 0 0 2px var(--sem-amber-bdr);
}

.pl-proj-wf-card.is-dup-highlight {
  border-color: #f59e0b !important;
  border-left-color: #f59e0b !important;
  background: var(--sem-amber-bg) !important;
  box-shadow: 0 0 0 3px var(--sem-amber-bdr), 0 8px 22px rgba(245, 158, 11, 0.28);
  animation: plWfDupPulse 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) 1;
}

/* TIER 5: REPORT-DNA BOTTOM ACTION BAR FOR PROJECT CARD */
.pl-proj-card-actions {
  margin-top: auto;
  padding-top: 9px;
  border-top: 1px solid var(--bg-border-subtle);
}

/* COMPLETED PROJECT CARD (IS-DONE-PROJ) WHITE INK & CONTRAST OVERRIDES */
.pl-project-card.is-done-proj .pl-proj-title,
.pl-project-card.is-done-proj .pl-proj-company-txt,
.pl-project-card.is-done-proj .pl-proj-vol-hero,
.pl-project-card.is-done-proj .pl-proj-exec-pct,
.pl-project-card.is-done-proj .pl-proj-wf-name {
  color: #ffffff !important;
}

.pl-project-card.is-done-proj .pl-proj-cus-txt,
.pl-project-card.is-done-proj .pl-proj-subline,
.pl-project-card.is-done-proj .pl-proj-party-ic,
.pl-project-card.is-done-proj .pl-proj-exec-lbl,
.pl-project-card.is-done-proj .pl-proj-wf-sec-lbl,
.pl-project-card.is-done-proj .pl-proj-wf-party,
.pl-project-card.is-done-proj .pl-proj-note-txt,
.pl-project-card.is-done-proj .pl-wf-step-arrow {
  color: rgba(255, 255, 255, 0.9) !important;
}

.pl-project-card.is-done-proj .pl-proj-metrics-flat,
.pl-project-card.is-done-proj .pl-proj-wf-stack {
  border-top-color: rgba(255, 255, 255, 0.26) !important;
}

.pl-project-card.is-done-proj .pl-proj-card-actions {
  border-top-color: rgba(255, 255, 255, 0.28) !important;
}

.pl-project-card.is-done-proj .pl-proj-code-chip,
.pl-project-card.is-done-proj .pl-proj-deadline-chip,
.pl-project-card.is-done-proj .pl-status-pill,
.pl-project-card.is-done-proj .pl-proj-partner-badge,
.pl-project-card.is-done-proj .pl-metric-chip,
.pl-project-card.is-done-proj .pl-wf-live-stat,
.pl-project-card.is-done-proj .pl-proj-note-tag {
  background: rgba(255, 255, 255, 0.18) !important;
  border-color: rgba(255, 255, 255, 0.36) !important;
  color: #ffffff !important;
}

.pl-project-card.is-done-proj .pl-am-avatar {
  background: rgba(255, 255, 255, 0.24) !important;
  border: 1px solid rgba(255, 255, 255, 0.42) !important;
  color: #ffffff !important;
}

.pl-project-card.is-done-proj .pl-proj-prog-track {
  background: rgba(0, 0, 0, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
}

.pl-project-card.is-done-proj .pl-proj-prog-fill {
  background: #ffffff !important;
}

.pl-project-card.is-done-proj .pl-proj-note-row,
.pl-project-card.is-done-proj .pl-proj-wf-card {
  background: rgba(0, 0, 0, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.26) !important;
  border-left-color: rgba(255, 255, 255, 0.7) !important;
}

.pl-project-card.is-done-proj .pl-proj-wf-card.is-dup-hover,
.pl-project-card.is-done-proj .pl-proj-wf-card.is-dup-highlight {
  background: rgba(245, 158, 11, 0.32) !important;
  border-color: #fde68a !important;
  border-left-color: #fde68a !important;
}

.pl-project-card.is-done-proj .pl-wf-step-flat {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

.pl-project-card.is-done-proj .pl-wf-plus-btn,
.pl-project-card.is-done-proj .pl-wf-detach-btn {
  background: rgba(255, 255, 255, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.32) !important;
  color: #ffffff !important;
}

.pl-project-card.is-done-proj .pl-dcard-btn.is-copy,
.pl-project-card.is-done-proj .pl-dcard-btn.is-del,
.pl-project-card.is-done-proj .pl-dcard-btn.is-stage {
  background: rgba(255, 255, 255, 0.17) !important;
  border-color: rgba(255, 255, 255, 0.42) !important;
  color: #ffffff !important;
}

.pl-project-card.is-done-proj .pl-stage-pct-pill {
  background: rgba(255, 255, 255, 0.24) !important;
  color: #ffffff !important;
}

.pl-project-card.is-done-proj .pl-dcard-btn.is-del:hover {
  background: #e11d48 !important;
  border-color: #fda4af !important;
  color: #ffffff !important;
}

.pl-project-card.is-done-proj .pl-dcard-btn.is-copy:hover,
.pl-project-card.is-done-proj .pl-dcard-btn.is-stage:hover {
  background: rgba(255, 255, 255, 0.28) !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

@keyframes plWfDupPulse {
  0%, 100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-3px);
  }
  80% {
    transform: translateX(3px);
  }
}

.pl-proj-wf-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.pl-proj-wf-meta-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  row-gap: 3px;
  min-width: 0;
  flex: 1;
  font-size: 12.5px;
  line-height: 1.35;
}

.pl-proj-wf-name {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--bg-text-primary);
}

.pl-proj-wf-party {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--bg-text-muted);
  font-weight: 500;
}

.pl-wf-pref-hint {
  font-size: 11px;
  font-weight: 600;
  color: var(--bg-text-muted);
}

.pl-wf-card-mini-tools {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.pl-wf-live-stat {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  color: var(--bg-text-secondary);
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
}

.pl-wf-plus-btn,
.pl-wf-detach-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: color 0.14s ease, border-color 0.14s ease, background-color 0.14s ease, opacity 0.14s ease;
}

.pl-wf-plus-btn:hover {
  color: var(--bg-text-primary);
  border-color: var(--bg-border-strong);
  background: var(--bg-surface-3);
}

.pl-wf-detach-btn {
  border-color: transparent;
  background: transparent;
  color: var(--bg-text-faint);
}

.pl-wf-detach-btn:hover {
  color: var(--sem-rose-txt);
  border-color: var(--sem-rose-bdr);
  background: var(--sem-rose-bg);
}

/* ON-DEMAND RIGHT STICKY PALETTE ASIDE */
.pl-wf-palette-aside {
  position: sticky;
  top: 14px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  max-height: calc(100vh - 28px);
  max-height: calc(100dvh - 28px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 13px;
  border-radius: 13px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  box-shadow: var(--bg-shadow-card);
  backdrop-filter: blur(var(--cg-blur, 18px));
  overflow: hidden;
}

.pl-palette-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.pl-palette-head-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pl-palette-head-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.pl-palette-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-palette-sub {
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

.pl-palette-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  flex-shrink: 0;
}

.pl-palette-tabs .bg-seg-btn {
  justify-content: center;
  gap: 6px;
  padding: 6px 8px;
  font-size: 11.5px;
}

.pl-pal-tab-cnt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 19px;
  height: 17px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--bg-input-well);
  color: var(--bg-text-secondary);
  font-size: 10px;
  font-weight: 800;
}

.pl-palette-tabs .bg-seg-btn.is-active .pl-pal-tab-cnt {
  background: rgba(255, 255, 255, 0.22);
  color: currentColor;
}

.pl-palette-quick-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
}

.pl-palette-search {
  flex-shrink: 0;
}

.pl-palette-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 2px;
  flex: 1 1 auto;
  min-height: 120px;
}

.pl-palette-wf-card {
  padding: 10px 11px;
  border-radius: 10px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: grab;
  user-select: none;
  transition: border-color 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
}

.pl-palette-wf-card:hover {
  border-color: var(--bg-border-strong);
}

.pl-palette-wf-card:active,
.pl-palette-wf-card.is-dragging {
  cursor: grabbing;
  opacity: 0.65;
  border-color: var(--sem-sky-bdr);
}

.pl-palette-wf-top {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  min-width: 0;
}

.pl-drag-grip {
  color: var(--bg-text-faint);
  display: inline-flex;
  align-items: center;
  padding-top: 2px;
  flex-shrink: 0;
}

.pl-palette-wf-card:hover .pl-drag-grip {
  color: var(--bg-text-muted);
}

.pl-palette-wf-titles {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.pl-palette-wf-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pl-palette-quick-select {
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  font-size: 11px;
  font-weight: 700;
  max-width: 104px;
  flex-shrink: 0;
  cursor: pointer;
}

.pl-palette-quick-select option {
  background: var(--option-bg);
  color: var(--option-txt);
}

/* STRICTLY 1 HORIZONTAL LINE FOR WORKFLOW STEPS + LIVE ACTIVE COUNTS */
.pl-proj-wf-steps-line {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 5px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.pl-proj-wf-steps-line::-webkit-scrollbar {
  height: 3px;
}

.pl-proj-wf-steps-line::-webkit-scrollbar-thumb {
  background: var(--bg-border-strong);
  border-radius: 999px;
}

.pl-wf-step-flat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--st-clr, #3b82f6);
  border: 1px solid rgba(255, 255, 255, 0.24);
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 1.5px rgba(15, 23, 42, 0.24);
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.84;
  transition: opacity 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease;
}

.pl-wf-step-flat .pl-proj-wf-step-dot {
  background: rgba(255, 255, 255, 0.92);
}

.pl-wf-step-flat.is-has-active {
  opacity: 1;
  border-color: #ffffff;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 2px 7px -2px rgba(2, 6, 23, 0.42);
}

.pipeline-workspace.page.theme-light-blue .pl-wf-step-flat.is-has-active {
  box-shadow: 0 0 0 1.5px rgba(15, 23, 42, 0.35), 0 2px 6px -1px rgba(15, 23, 42, 0.18);
}

.pl-wf-step-flat.is-won-step {
  background: var(--st-clr, #10b981);
  border-color: #ffffff;
  color: #ffffff;
}

.pl-wf-step-flat.is-lost-step {
  background: var(--st-clr, #ef4444);
  border-color: #ffffff;
  color: #ffffff;
}

.pl-wf-step-flat-lbl {
  white-space: nowrap;
}

.pl-wf-step-cnt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 15px;
  padding: 0 4px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.36);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}

.pl-wf-step-flat.is-won-step .pl-wf-step-cnt,
.pl-wf-step-flat.is-lost-step .pl-wf-step-cnt {
  background: rgba(15, 23, 42, 0.28);
  color: #ffffff;
}

.pl-wf-step-arrow {
  font-size: 11px;
  color: var(--bg-text-faint);
  flex-shrink: 0;
  user-select: none;
  line-height: 1;
}

.pl-proj-wf-tag {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.pl-proj-wf-tag.is-emerald {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
  border: 1px solid var(--sem-emerald-bdr);
}

.pl-proj-wf-tag.is-sky {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border: 1px solid var(--sem-sky-bdr);
}

.pl-proj-wf-tag.is-amber {
  background: var(--sem-amber-bg);
  color: var(--sem-amber-txt);
  border: 1px solid var(--sem-amber-bdr);
}

.pl-proj-wf-tag.is-slate {
  background: var(--bg-input-well);
  color: var(--bg-text-muted);
  border: 1px solid var(--bg-border-subtle);
}

.pl-proj-wf-step-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
}

/* PROJECT DETAIL WORKFLOW BOARD & MANDATORY CALLOUT */
.pl-detail-wf-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
}

.pl-wf-board-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pl-wf-board-card {
  padding: 12px;
  border-radius: 12px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pl-wf-board-card.is-preferred {
  border-color: var(--sem-emerald-bdr);
}

.pl-wf-board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.pl-wf-board-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-wf-board-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-wf-board-meta {
  font-size: 11.5px;
  color: var(--bg-text-muted);
  font-weight: 600;
}

.pl-wf-board-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 8px;
}

.pl-wf-board-col {
  border-radius: 9px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pl-wf-board-col.is-occupied {
  border-color: var(--sem-sky-bdr);
}

.pl-wf-board-col-head {
  padding: 6px 8px;
  border-top: 3px solid #38bdf8;
  border-bottom: 1px solid var(--bg-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  background: var(--bg-input-well);
}

.pl-wf-board-col-pct {
  font-size: 11px;
  font-weight: 800;
}

.pl-wf-board-col-lbl {
  flex: 1;
  font-size: 11px;
  font-weight: 700;
  color: var(--bg-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-wf-board-col-cnt {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--bg-surface-3);
  color: var(--bg-text-secondary);
  font-size: 10.5px;
  font-weight: 800;
}

.pl-wf-board-col-body {
  padding: 7px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 54px;
}

.pl-wf-board-empty {
  font-size: 11px;
  color: var(--bg-text-faint);
  text-align: center;
  padding: 8px 0;
}

.pl-wf-board-mini-deal {
  padding: 6px 8px;
  border-radius: 7px;
  background: var(--bg-surface-3);
  border: 1px solid var(--bg-border-subtle);
  cursor: pointer;
  transition: border-color 0.14s ease;
}

.pl-wf-board-mini-deal:hover {
  border-color: var(--sem-sky-bdr);
}

.pl-wf-board-deal-title {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--bg-text-primary);
  line-height: 1.3;
}

.pl-wf-board-deal-vol {
  font-size: 11px;
  font-weight: 800;
  color: var(--sem-emerald-txt);
  margin-top: 2px;
}

.pl-req-callout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 9px;
  background: var(--sem-amber-bg);
  border: 1px solid var(--sem-amber-bdr);
  color: var(--sem-amber-txt);
  font-size: 12px;
  line-height: 1.4;
}

.pl-inline-chk {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-text-secondary);
  white-space: nowrap;
  cursor: pointer;
}

.pl-proj-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
}

.pl-proj-metric-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pl-proj-metric-lbl {
  font-size: 10.5px;
  color: var(--bg-text-muted);
}

.pl-proj-metric-val {
  font-size: 13px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-proj-metric-val.is-emerald {
  color: var(--sem-emerald-txt);
}

.pl-proj-metric-val.is-sky {
  color: var(--sem-sky-txt);
}

.pl-progress-track {
  height: 6px;
  border-radius: 999px;
  background: var(--bg-input-well);
  overflow: hidden;
}

.pl-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--theme-cta-grad);
  transition: width 0.3s ease;
}

.pl-proj-mini-pipes {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.pl-proj-no-pipe {
  padding: 8px;
  border-radius: 8px;
  border: 1px dashed var(--bg-border-subtle);
  text-align: center;
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

.pl-proj-mini-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 8px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  font-size: 11.5px;
}

.pl-proj-mini-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.pl-mini-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  flex-shrink: 0;
}

.pl-mini-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--bg-text-primary);
  font-weight: 600;
}

.pl-proj-mini-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.pl-mini-wf {
  font-size: 10.5px;
  color: var(--bg-text-muted);
}

.pl-mini-pct {
  font-weight: 800;
  color: var(--sem-sky-txt);
}

.pl-proj-more-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--sem-sky-txt);
  text-align: center;
}

.pl-proj-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--bg-border-subtle);
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

.pl-proj-open-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--sem-sky-txt);
  font-weight: 800;
}

/* =========================================================
   TAB 1: KANBAN BOARD COLUMNS & STICKY NON-CLIPPED HEADER DOCK
   ========================================================= */
.pl-kanban-board-area {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  position: relative;
}

.pl-board-sticky-sentinel {
  width: 100%;
  height: 0;
  pointer-events: none;
  flex-shrink: 0;
}

.pl-board-sticky-shell {
  position: sticky;
  top: 0;
  z-index: 75;
  flex-shrink: 0;
  margin: 0 -14px;
  padding: 0 14px;
  background: transparent;
  transition: background 0.14s ease, box-shadow 0.16s ease;
}

.pl-board-sticky-shell.is-stuck {
  background: var(--bg-sticky-shield);
  box-shadow: 0 10px 24px -10px rgba(2, 6, 23, 0.56);
  border-bottom: 1px solid var(--bg-border-subtle);
}

.pipeline-workspace.page.theme-light-blue .pl-board-sticky-shell.is-stuck {
  box-shadow: 0 10px 22px -10px rgba(15, 23, 42, 0.14);
}

.pipeline-workspace.page.theme-custom-glass .pl-board-sticky-shell.is-stuck {
  backdrop-filter: blur(var(--cg-blur, 20px));
}

.pl-board-sticky-viewport {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.pl-board-sticky-viewport::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.pl-board-sticky-track {
  display: flex;
  align-items: stretch;
  gap: 12px;
  width: 100%;
}

.pl-sticky-col-cap {
  flex: 1 0 280px;
  min-width: 280px;
  box-sizing: border-box;
  min-height: 44px;
  padding: 9px 12px;
  border-radius: 15px 15px 0 0;
  background: var(--bg-col-cap-solid);
  border: 1px solid var(--bg-border-subtle);
  border-top: 3px solid var(--col-accent, #3b82f6);
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  transition: border-radius 0.14s ease, background 0.16s ease, border-color 0.16s ease;
}

.pipeline-workspace.page.theme-custom-glass .pl-sticky-col-cap {
  backdrop-filter: blur(var(--cg-blur, 18px));
}

.pl-sticky-col-cap:hover {
  background: var(--bg-surface-2);
}

.pl-sticky-col-cap .kanban-col-title {
  width: 100%;
}

.pl-sticky-col-cap.is-collapsed {
  flex: 0 0 54px;
  width: 54px;
  min-width: 54px;
  max-width: 54px;
  padding: 6px 4px;
  justify-content: center;
}

.pl-sticky-col-cap.is-collapsed .kanban-col-title {
  justify-content: center;
  gap: 3px;
}

.pl-sticky-col-cap.is-collapsed .kanban-col-count {
  padding: 1px 5px;
  font-size: 10.5px;
}

/* When Scrolled: Square Top Corners Flush at Top:0 (Zero Corner Notch / Bleed) */
.pl-board-sticky-shell.is-stuck .pl-sticky-col-cap {
  border-radius: 0;
}

.pl-kanban-scroll {
  position: relative;
  z-index: 1;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  padding-bottom: 6px;
}

.kanban-board {
  display: flex;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  flex: 1 1 auto;
  min-height: calc(100vh - 36px);
  min-height: calc(100dvh - 36px);
}

.kanban-column {
  flex: 1 0 280px;
  min-width: 280px;
  box-sizing: border-box;
  min-height: calc(100vh - 36px);
  min-height: calc(100dvh - 36px);
  border-radius: 16px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  border-top: 3px solid var(--col-accent, #3b82f6);
  box-shadow: var(--bg-shadow-card);
  backdrop-filter: blur(var(--cg-blur, 18px));
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.kanban-column.is-collapsed {
  flex: 0 0 54px;
  width: 54px;
  min-width: 54px;
  max-width: 54px;
  box-sizing: border-box;
  min-height: calc(100vh - 36px);
  min-height: calc(100dvh - 36px);
  align-items: center;
}

.kanban-col-head {
  padding: 10px 12px;
  border-bottom: 1px solid var(--bg-border-subtle);
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.kanban-column.is-collapsed .kanban-col-head {
  border-bottom: none;
  padding: 14px 6px;
  height: 100%;
  align-items: center;
}

.kanban-col-title {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.kanban-column.is-collapsed .kanban-col-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  gap: 10px;
}

.pl-col-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  flex-shrink: 0;
}

.kanban-col-name {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.kanban-col-count {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  color: var(--bg-text-secondary);
}

.kanban-col-toggle {
  color: var(--bg-text-muted);
  display: inline-flex;
}

.kanban-col-sub {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--bg-text-muted);
}

.kanban-col-pct {
  font-weight: 800;
  color: var(--sem-sky-txt);
}

.kanban-col-vol {
  font-weight: 700;
  color: var(--sem-emerald-txt);
}

.draggable-zone {
  padding: 8px;
  flex: 1 1 auto;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* INLINE "ADD CARD" TILE INSIDE EVERY KANBAN COLUMN & SWIMLANE CELL */
.pl-col-add-card {
  width: 100%;
  margin: 0;
  padding: 9px 11px;
  border-radius: 12px;
  border: 1.5px dashed var(--bg-border-strong);
  background: rgba(15, 23, 42, 0.24);
  color: var(--bg-text-muted);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    transform 0.16s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.16s ease;
}

.pl-col-add-card.is-compact {
  padding: 7px 9px;
  border-radius: 10px;
  font-size: 11.5px;
  gap: 6px;
}

.pl-col-add-ic {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  color: var(--add-accent, #38bdf8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.16s ease;
}

.pl-col-add-card.is-compact .pl-col-add-ic {
  width: 20px;
  height: 20px;
  border-radius: 6px;
}

.pl-col-add-card:hover {
  border-style: solid;
  border-color: var(--add-accent, #38bdf8);
  background: var(--bg-surface-2);
  color: var(--bg-text-primary);
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -8px rgba(2, 6, 23, 0.42);
}

.pl-col-add-card:hover .pl-col-add-ic {
  background: var(--add-accent, #0284c7);
  border-color: transparent;
  color: #ffffff;
  transform: scale(1.05);
}

.pl-col-add-card:active {
  transform: translateY(0) scale(0.99);
}

/* Enterprise Light Blue Theme Overrides for Add Card Tile */
.pipeline-workspace.page.theme-light-blue .pl-col-add-card {
  background: rgba(248, 250, 252, 0.78);
  border-color: #cbd5e1;
  color: #64748b;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card .pl-col-add-ic {
  background: #ffffff;
  border-color: #cbd5e1;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card:hover {
  background: #ffffff;
  border-color: var(--add-accent, #0284c7);
  color: #0f172a;
  box-shadow: 0 8px 18px -8px rgba(15, 23, 42, 0.14);
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card:hover .pl-col-add-ic {
  background: var(--add-accent, #0284c7);
  border-color: transparent;
  color: #ffffff;
}

/* Harmonized Add Card Tile inside THÀNH CÔNG & THẤT BẠI Columns */
.pl-col-add-card.is-outcome-win {
  border-color: rgba(52, 211, 153, 0.42);
  background: rgba(16, 185, 129, 0.1);
  color: #a7f3d0;
}

.pl-col-add-card.is-outcome-win .pl-col-add-ic {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(52, 211, 153, 0.4);
  color: #6ee7b7;
}

.pl-col-add-card.is-outcome-win:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: #34d399;
  color: #ffffff;
}

.pl-col-add-card.is-outcome-win:hover .pl-col-add-ic {
  background: #10b981;
  color: #ffffff;
}

.pl-col-add-card.is-outcome-fail {
  border-color: rgba(251, 113, 133, 0.42);
  background: rgba(244, 63, 94, 0.1);
  color: #fecdd3;
}

.pl-col-add-card.is-outcome-fail .pl-col-add-ic {
  background: rgba(244, 63, 94, 0.2);
  border-color: rgba(251, 113, 133, 0.4);
  color: #fda4af;
}

.pl-col-add-card.is-outcome-fail:hover {
  background: rgba(244, 63, 94, 0.2);
  border-color: #fb7185;
  color: #ffffff;
}

.pl-col-add-card.is-outcome-fail:hover .pl-col-add-ic {
  background: #e11d48;
  color: #ffffff;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card.is-outcome-win {
  background: rgba(255, 255, 255, 0.65);
  border-color: #6ee7b7;
  color: #047857;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card.is-outcome-win .pl-col-add-ic {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #059669;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card.is-outcome-win:hover {
  background: #ffffff;
  border-color: #059669;
  color: #065f46;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card.is-outcome-win:hover .pl-col-add-ic {
  background: #059669;
  color: #ffffff;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card.is-outcome-fail {
  background: rgba(255, 255, 255, 0.65);
  border-color: #fda4af;
  color: #be123c;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card.is-outcome-fail .pl-col-add-ic {
  background: #ffe4e6;
  border-color: #fda4af;
  color: #e11d48;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card.is-outcome-fail:hover {
  background: #ffffff;
  border-color: #e11d48;
  color: #9f1239;
}

.pipeline-workspace.page.theme-light-blue .pl-col-add-card.is-outcome-fail:hover .pl-col-add-ic {
  background: #e11d48;
  color: #ffffff;
}

/* =========================================================
   OUTCOME COLUMNS — THÀNH CÔNG (EMERALD) & THẤT BẠI (ROSE)
   ========================================================= */
.kanban-column.is-col-success {
  background:
    linear-gradient(180deg, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.08) 100%),
    var(--bg-surface-1);
  border-color: rgba(16, 185, 129, 0.42);
  border-top: 3px solid #34d399;
  box-shadow: 0 10px 26px -10px rgba(5, 150, 105, 0.28), var(--bg-shadow-card);
}

.kanban-column.is-col-fail {
  background:
    linear-gradient(180deg, rgba(239, 68, 68, 0.16) 0%, rgba(225, 29, 72, 0.08) 100%),
    var(--bg-surface-1);
  border-color: rgba(244, 63, 94, 0.42);
  border-top: 3px solid #fb7185;
  box-shadow: 0 10px 26px -10px rgba(225, 29, 72, 0.28), var(--bg-shadow-card);
}

.pipeline-workspace.page.theme-light-blue .kanban-column.is-col-success {
  background: linear-gradient(180deg, #d1fae5 0%, #ecfdf5 42%, #f0fdf4 100%);
  border-color: #6ee7b7;
  border-top: 3px solid #059669;
  box-shadow: 0 10px 24px -10px rgba(5, 150, 105, 0.18);
}

.pipeline-workspace.page.theme-light-blue .kanban-column.is-col-fail {
  background: linear-gradient(180deg, #ffe4e6 0%, #fff1f2 42%, #fef2f2 100%);
  border-color: #fda4af;
  border-top: 3px solid #e11d48;
  box-shadow: 0 10px 24px -10px rgba(225, 29, 72, 0.18);
}

/* Expanded Solid Outcome Headers */
.kanban-column.is-col-success:not(.is-collapsed) .kanban-col-head {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-bottom-color: rgba(255, 255, 255, 0.22);
  border-radius: 13px 13px 0 0;
}

.kanban-column.is-col-fail:not(.is-collapsed) .kanban-col-head {
  background: linear-gradient(135deg, #ef4444 0%, #e11d48 100%);
  border-bottom-color: rgba(255, 255, 255, 0.22);
  border-radius: 13px 13px 0 0;
}

/* Collapsed 54px Solid Outcome Strips */
.kanban-column.is-col-success.is-collapsed,
.pipeline-workspace.page.theme-light-blue .kanban-column.is-col-success.is-collapsed {
  background: linear-gradient(180deg, #10b981 0%, #059669 55%, #047857 100%);
  border-color: rgba(110, 231, 183, 0.55);
  border-top: 3px solid #a7f3d0;
  box-shadow: 0 10px 22px -6px rgba(5, 150, 105, 0.45);
}

.kanban-column.is-col-fail.is-collapsed,
.pipeline-workspace.page.theme-light-blue .kanban-column.is-col-fail.is-collapsed {
  background: linear-gradient(180deg, #ef4444 0%, #e11d48 55%, #be123c 100%);
  border-color: rgba(253, 164, 175, 0.55);
  border-top: 3px solid #fecdd3;
  box-shadow: 0 10px 22px -6px rgba(225, 29, 72, 0.45);
}

.kanban-column.is-col-success.is-collapsed:hover,
.kanban-column.is-col-fail.is-collapsed:hover {
  filter: brightness(1.05);
}

/* Crisp White Ink, Dot & Frosted Count Badge on Outcome Headers */
.kanban-column.is-col-success .kanban-col-head .kanban-col-name,
.kanban-column.is-col-fail .kanban-col-head .kanban-col-name {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(15, 23, 42, 0.22);
}

.kanban-column.is-col-success .kanban-col-head .pl-col-dot,
.kanban-column.is-col-fail .kanban-col-head .pl-col-dot {
  background: #ffffff !important;
  box-shadow: 0 0 0 2.5px rgba(255, 255, 255, 0.28);
}

.kanban-column.is-col-success .kanban-col-head .kanban-col-count,
.kanban-column.is-col-fail .kanban-col-head .kanban-col-count {
  background: rgba(15, 23, 42, 0.24);
  border-color: rgba(255, 255, 255, 0.38);
  color: #ffffff;
}

.kanban-column.is-col-success .kanban-col-head .kanban-col-toggle,
.kanban-column.is-col-fail .kanban-col-head .kanban-col-toggle {
  color: #ffffff;
}

/* Sticky Cap Outcome Variants (THÀNH CÔNG & THẤT BẠI) */
.pl-sticky-col-cap.is-col-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: rgba(16, 185, 129, 0.52);
  border-top: 3px solid #6ee7b7;
  border-bottom-color: rgba(255, 255, 255, 0.24);
}

.pl-sticky-col-cap.is-col-fail {
  background: linear-gradient(135deg, #ef4444 0%, #e11d48 100%);
  border-color: rgba(244, 63, 94, 0.52);
  border-top: 3px solid #fda4af;
  border-bottom-color: rgba(255, 255, 255, 0.24);
}

.pl-sticky-col-cap.is-col-success:hover,
.pl-sticky-col-cap.is-col-fail:hover {
  filter: brightness(1.04);
}

.pl-sticky-col-cap.is-col-success .kanban-col-name,
.pl-sticky-col-cap.is-col-fail .kanban-col-name,
.pl-sticky-col-cap.is-col-success .kanban-col-toggle,
.pl-sticky-col-cap.is-col-fail .kanban-col-toggle {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(15, 23, 42, 0.22);
}

.pl-sticky-col-cap.is-col-success .pl-col-dot,
.pl-sticky-col-cap.is-col-fail .pl-col-dot {
  background: #ffffff !important;
  box-shadow: 0 0 0 2.5px rgba(255, 255, 255, 0.28);
}

.pl-sticky-col-cap.is-col-success .kanban-col-count,
.pl-sticky-col-cap.is-col-fail .kanban-col-count {
  background: rgba(15, 23, 42, 0.24);
  border-color: rgba(255, 255, 255, 0.38);
  color: #ffffff;
}

/* PC Seamless Sticky-Cap-to-Column Join (>= 769px) */
@media (min-width: 769px) {
  .pl-kanban-board-area .kanban-column,
  .pl-kanban-board-area .kanban-column.is-col-success,
  .pl-kanban-board-area .kanban-column.is-col-fail,
  .pl-kanban-board-area .kanban-column.is-collapsed,
  .pipeline-workspace.page.theme-light-blue .pl-kanban-board-area .kanban-column,
  .pipeline-workspace.page.theme-light-blue .pl-kanban-board-area .kanban-column.is-col-success,
  .pipeline-workspace.page.theme-light-blue .pl-kanban-board-area .kanban-column.is-col-fail,
  .pipeline-workspace.page.theme-light-blue .pl-kanban-board-area .kanban-column.is-col-success.is-collapsed,
  .pipeline-workspace.page.theme-light-blue .pl-kanban-board-area .kanban-column.is-col-fail.is-collapsed {
    border-radius: 0 0 16px 16px;
    border-top: none;
  }

  .pl-kanban-board-area .kanban-column:not(.is-collapsed) > .kanban-col-head {
    display: none;
  }

  .pl-kanban-board-area .kanban-column.is-collapsed > .kanban-col-head .pl-col-body-meta {
    display: none;
  }
}

/* =========================================================
   KANBAN DEAL CARD — COMPACT TASK-FIRST HIERARCHY
   ========================================================= */
.pl-card {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border-radius: 12px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-strong);
  border-left: 4px solid var(--card-accent, #3b82f6);
  box-shadow: 0 4px 12px -4px rgba(2, 6, 23, 0.24);
  color: var(--bg-text-primary);
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  position: relative;
  min-width: 0;
  transition:
    transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.18s ease,
    background 0.18s ease;
}

.pl-card.is-kmenu-open {
  z-index: 40;
}

.pipeline-workspace.page.theme-light-blue .pl-card {
  background: #ffffff;
  border-color: #cbd5e1;
  border-left-color: var(--card-accent, #0284c7);
  box-shadow: 0 4px 13px -3px rgba(15, 23, 42, 0.08);
}

.pl-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -10px rgba(2, 6, 23, 0.46);
}

.pipeline-workspace.page.theme-light-blue .pl-card:hover {
  box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.15);
}

/* Priority & Follow-up Left Accents on Active Deals */
.pl-card.is-pending.is-priority {
  border-left-color: #f43f5e !important;
}

.pl-card.is-pending.is-followup {
  border-left-color: #f59e0b !important;
}

/* Synchronized Outcome Deal Cards — Solid Emerald (THÀNH CÔNG) & Solid Rose (THẤT BẠI) + Crisp White Ink */
.pl-card.is-done,
.pipeline-workspace.page.theme-light-blue .pl-card.is-done {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  border: 1px solid rgba(167, 243, 208, 0.52) !important;
  border-left: 4.5px solid #a7f3d0 !important;
  color: #ffffff !important;
  box-shadow: 0 7px 18px -4px rgba(5, 150, 105, 0.42);
}

.pl-card.is-done:hover,
.pipeline-workspace.page.theme-light-blue .pl-card.is-done:hover {
  box-shadow: 0 12px 24px -6px rgba(5, 150, 105, 0.54);
}

.pl-card.is-failed,
.pipeline-workspace.page.theme-light-blue .pl-card.is-failed {
  background: linear-gradient(135deg, #e11d48 0%, #be123c 100%) !important;
  border: 1px solid rgba(254, 205, 211, 0.52) !important;
  border-left: 4.5px solid #fecdd3 !important;
  color: #ffffff !important;
  box-shadow: 0 7px 18px -4px rgba(225, 29, 72, 0.42);
}

.pl-card.is-failed:hover,
.pipeline-workspace.page.theme-light-blue .pl-card.is-failed:hover {
  box-shadow: 0 12px 24px -6px rgba(225, 29, 72, 0.54);
}

/* Drag Ghost, Post-Drop Settle & Deep-Link Focus Pulse */
.pl-card.sortable-ghost {
  opacity: 0.38 !important;
  transform: scale(0.985) !important;
  box-shadow: none !important;
}

.pl-card.sortable-drag {
  box-shadow: 0 18px 36px -8px rgba(2, 6, 23, 0.55) !important;
}

@keyframes plCardDropSmooth {
  0% {
    opacity: 0.75;
    transform: translate3d(0, -7px, 0) scale(0.976);
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.78), 0 16px 32px -8px rgba(16, 185, 129, 0.42);
  }
  58% {
    opacity: 1;
    transform: translate3d(0, 1.5px, 0) scale(1.006);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes plCardRedPulse {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.34), 0 12px 26px -6px rgba(220, 38, 38, 0.44);
  }
  50% {
    box-shadow: 0 0 0 5.5px rgba(239, 68, 68, 0.58), 0 16px 32px -4px rgba(220, 38, 38, 0.64);
  }
}

.pl-card.dropped-success {
  z-index: 25;
  animation: plCardDropSmooth 0.52s cubic-bezier(0.22, 1, 0.36, 1);
}

.pl-card.highlight-card {
  position: relative;
  z-index: 25;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.24) 0%, rgba(185, 28, 28, 0.16) 100%) !important;
  border: 2px solid #f87171 !important;
  border-left: 4.5px solid #ef4444 !important;
  box-shadow: 0 0 0 3.5px rgba(239, 68, 68, 0.34), 0 12px 26px -6px rgba(220, 38, 38, 0.45);
  animation: plCardRedPulse 1.25s ease-in-out 3;
}

.pipeline-workspace.page.theme-light-blue .pl-card.highlight-card {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
  border: 2px solid #ef4444 !important;
  border-left: 4.5px solid #dc2626 !important;
  box-shadow: 0 0 0 3.5px rgba(239, 68, 68, 0.28), 0 12px 26px -6px rgba(220, 38, 38, 0.36);
  animation: plCardRedPulse 1.25s ease-in-out 3;
}

.pl-card.is-done.highlight-card,
.pl-card.is-failed.highlight-card,
.pipeline-workspace.page.theme-light-blue .pl-card.is-done.highlight-card,
.pipeline-workspace.page.theme-light-blue .pl-card.is-failed.highlight-card {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  border: 2px solid #fecaca !important;
  border-left: 4.5px solid #ffffff !important;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.42), 0 14px 30px -6px rgba(220, 38, 38, 0.58);
  animation: plCardRedPulse 1.25s ease-in-out 3;
}

/* Compact Swimlane Deal Card */
.pl-card.is-compact {
  padding: 8px 10px;
  border-radius: 11px;
  gap: 4px;
}

/* Compact Task-First Card Body & Top-Right Quick Menu */
.pl-kcard-body {
  display: flex;
  flex-direction: column;
  gap: 2.5px;
  min-width: 0;
}

.pl-kcard-body:not(.is-no-menu) > :first-child {
  padding-right: 24px;
}

.pl-kcard-timeline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--bg-text-muted);
  min-width: 0;
}

.pl-kcard-timeline svg {
  flex-shrink: 0;
  opacity: 0.85;
}

.pl-kcard-timeline span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-kcard-company {
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.34;
  color: var(--bg-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.pl-kcard-customer {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.32;
  color: var(--bg-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.pl-kcard-task-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 1.5px;
  min-width: 0;
}

.pl-kcard-title {
  flex: 1 1 0;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 800;
  line-height: 1.38;
  color: var(--bg-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.pl-kcard-title.is-empty-title {
  font-weight: 600;
  font-style: italic;
  color: var(--bg-text-muted);
}

.pl-kcard-menu-anchor {
  position: absolute;
  top: 6px;
  right: 7px;
  z-index: 6;
}

.pl-kcard-more-btn {
  width: 22px;
  height: 22px;
  padding: 0;
  margin: 0;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--bg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s ease, background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.pl-kcard-more-btn:hover,
.pl-kcard-more-btn.is-active {
  background: var(--bg-input-well);
  border-color: var(--bg-border-strong);
  color: var(--bg-text-primary);
}

@media (hover: hover) and (min-width: 769px) {
  .pl-kcard-more-btn {
    opacity: 0;
    pointer-events: none;
  }

  .pl-card:hover .pl-kcard-more-btn,
  .pl-card:focus-within .pl-kcard-more-btn,
  .pl-kcard-more-btn.is-active {
    opacity: 1;
    pointer-events: auto;
  }
}

.pl-kcard-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
  cursor: default;
}

.pl-kcard-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 204px;
  padding: 5px;
  border-radius: 10px;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: 0 16px 34px -6px rgba(2, 6, 23, 0.72);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 60;
  cursor: default;
}

.pipeline-workspace.page.theme-light-blue .pl-kcard-menu {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
  box-shadow: 0 14px 30px -6px rgba(15, 23, 42, 0.2);
}

.pl-kcard-menu-item {
  width: 100%;
  margin: 0;
  padding: 6px 8px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 11.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left;
  cursor: pointer;
  transition: background 0.14s ease, color 0.14s ease;
}

.pl-kcard-menu-item:hover {
  background: rgba(148, 163, 184, 0.14);
}

.pipeline-workspace.page.theme-light-blue .pl-kcard-menu-item:hover {
  background: #f1f5f9;
}

.pl-kcard-menu-item.is-danger {
  color: #f87171;
}

.pipeline-workspace.page.theme-light-blue .pl-kcard-menu-item.is-danger {
  color: #dc2626;
}

.pl-kcard-menu-item.is-danger:hover {
  background: rgba(239, 68, 68, 0.16);
}

.pipeline-workspace.page.theme-light-blue .pl-kcard-menu-item.is-danger:hover {
  background: #fef2f2;
}

.pl-kcard-menu-sep {
  height: 1px;
  margin: 3px 2px;
  background: rgba(148, 163, 184, 0.18);
}

.pipeline-workspace.page.theme-light-blue .pl-kcard-menu-sep {
  background: #e2e8f0;
}

.pl-kcard-menu-lbl {
  padding: 3px 8px 2px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.pipeline-workspace.page.theme-light-blue .pl-kcard-menu-lbl {
  color: #64748b;
}

.pl-kcard-menu-stages {
  display: flex;
  flex-direction: column;
  gap: 3.5px;
  padding: 2px;
  max-height: 205px;
  overflow-y: auto;
}

.pl-kcard-stage-opt {
  width: 100%;
  margin: 0;
  padding: 6px 8px;
  border-radius: 7px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: var(--step-clr, #3b82f6);
  color: #ffffff;
  text-shadow: 0 1px 1.5px rgba(15, 23, 42, 0.26);
  font-size: 11.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left;
  cursor: pointer;
  opacity: 0.78;
  transition: opacity 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease, transform 0.12s ease;
}

.pl-kcard-stage-opt:hover {
  opacity: 0.96;
  border-color: rgba(255, 255, 255, 0.72);
  transform: translateX(1.5px);
}

.pl-kcard-stage-opt.is-current {
  opacity: 1;
  font-weight: 800;
  color: #ffffff;
  border-color: #ffffff;
  box-shadow: 0 0 0 1.5px var(--step-clr, #3b82f6), 0 3px 8px -2px rgba(2, 6, 23, 0.45);
}

.pipeline-workspace.page.theme-light-blue .pl-kcard-stage-opt.is-current {
  color: #ffffff;
  border-color: #ffffff;
  box-shadow: 0 0 0 1.5px #0f172a, 0 3px 8px -2px rgba(15, 23, 42, 0.22);
}

.pl-kcard-stage-dot {
  width: 6.5px;
  height: 6.5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  flex-shrink: 0;
}

.pl-kcard-stage-pct {
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.24);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
}

.pl-kcard-stage-name {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Tier 1: Top Meta & Badges Row */
.pl-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 5px 8px;
  min-width: 0;
}

.pl-card-meta-left,
.pl-card-meta-right {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-dcard-time {
  display: inline-flex;
  align-items: center;
  gap: 4.5px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--bg-text-muted);
  white-space: nowrap;
}

.pl-id-tag,
.pl-contract-tag {
  padding: 2px 6.5px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  background: var(--bg-input-well);
  color: var(--bg-text-muted);
  border: 1px solid var(--bg-border-subtle);
  white-space: nowrap;
}

.pl-dcard-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2.5px 7.5px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.25;
  white-space: nowrap;
}

.pl-dcard-chip.is-prio-chip {
  background: var(--sem-rose-bg);
  border: 1px solid var(--sem-rose-bdr);
  color: var(--sem-rose-txt);
}

.pl-dcard-chip.is-warn-chip {
  background: var(--sem-amber-bg);
  border: 1px solid var(--sem-amber-bdr);
  color: var(--sem-amber-txt);
}

.pl-dcard-chip.is-failed-chip {
  background: #e11d48;
  border: 1px solid #fb7185;
  color: #ffffff;
}

.pl-am-avatar {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--theme-sky-header-grad);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Linked Root Project Pill */
.pl-card-project-pill {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3.5px 8.5px;
  border-radius: 7.5px;
  border: 1px solid var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  max-width: 100%;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.pl-card-project-pill:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pl-card-project-pill span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-proj-pill-arrow {
  font-size: 10.5px;
  opacity: 0.82;
  flex-shrink: 0;
}

/* Tier 2: Flat Customer & PO Description (No Box-Inside-Box) */
.pl-card-customer {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.pl-dcard-title-row {
  display: flex;
  align-items: flex-start;
  gap: 7.5px;
  min-width: 0;
}

.pl-dcard-done-circle {
  width: 21px;
  height: 21px;
  border-radius: 999px;
  background: #ffffff;
  color: #047857;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

.pl-dcard-done-circle.is-sm {
  width: 17px;
  height: 17px;
}

.pipeline-workspace.page.theme-light-blue .pl-dcard-done-circle {
  color: #0284c7;
}

.pipeline-workspace.page.theme-light-blue .pl-card.is-done .pl-dcard-done-circle {
  color: #047857;
}

.pl-dcard-done-circle.is-fail-circle,
.pipeline-workspace.page.theme-light-blue .pl-dcard-done-circle.is-fail-circle {
  color: #be123c;
}

.pl-card-company {
  flex: 1 1 0;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
  line-height: 1.38;
  word-break: break-word;
}

.pl-card-contact {
  display: inline-flex;
  align-items: center;
  gap: 4.5px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--bg-text-muted);
}

.pl-card-po {
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--bg-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.pl-card-po.is-compact-po {
  font-size: 11.5px;
  -webkit-line-clamp: 2;
}

/* Tier 3: B2B Financial Deal Metrics Strip */
.pl-card-metrics {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 2px;
  min-width: 0;
}

.pl-card-chips {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-metric-chip {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  background: var(--bg-input-well);
  color: var(--bg-text-secondary);
  border: 1px solid var(--bg-border-subtle);
  white-space: nowrap;
}

.pl-volume-val {
  margin-left: auto;
  font-size: 13.5px;
  font-weight: 900;
  color: var(--sem-emerald-txt);
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.pl-volume-cur {
  margin-left: 2px;
  font-size: 11.5px;
  font-weight: 800;
  opacity: 0.88;
}

/* Tier 4: Smooth Report-DNA Collapsible Pills (Attachments & Linked Reports) */
.pl-dcard-links-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pl-dcard-links-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-dcard-link-toggle {
  flex: 1 1 115px;
  min-width: 0;
  height: 29px;
  padding: 0 9px;
  border-radius: 8px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-strong);
  color: var(--sem-sky-txt);
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.pl-dcard-link-toggle.is-report-pill {
  color: var(--sem-emerald-txt);
}

.pl-dcard-link-toggle:hover,
.pl-dcard-link-toggle.is-open {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bdr);
}

.pl-dcard-link-toggle.is-report-pill:hover,
.pl-dcard-link-toggle.is-report-pill.is-open {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bdr);
}

.pl-dcard-link-left {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-dcard-link-caret {
  font-size: 11px;
  opacity: 0.85;
  flex-shrink: 0;
}

.pl-kcard-att-block {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.pl-dcard-link-toggle.is-full-row {
  flex: none;
  width: 100%;
  height: 26px;
  padding: 0 8px;
  margin: 0;
  border-radius: 7px;
  font-size: 11px;
}

.pl-kcard-att-block .pl-dcard-collapse.is-open {
  margin-top: 4px;
}

.pl-dcard-collapse {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  pointer-events: none;
  transition:
    grid-template-rows 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.18s ease;
}

.pl-dcard-collapse.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
  pointer-events: auto;
}

.pl-dcard-collapse-inner {
  min-height: 0;
  overflow: hidden;
}

.pl-dcard-collapse-box {
  padding: 6px 8px;
  border-radius: 8.5px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* Shared File & Linked Report Sub-rows (Also used in Studio Modals) */
.pl-file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.pl-file-link {
  color: var(--sem-sky-txt);
  text-decoration: none;
  font-size: 11.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-file-link:hover {
  text-decoration: underline;
}

.pl-file-dl {
  color: var(--bg-text-muted);
  display: inline-flex;
  padding: 2px;
}

.pl-file-dl:hover {
  color: var(--sem-emerald-txt);
}

.pl-rep-mini-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--bg-border-subtle);
}

.pl-rep-mini-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.pl-rep-att-sub {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 10px;
  border-left: 2px solid var(--bg-border-strong);
  margin-top: 2px;
}

.pl-linked-rep-stack {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 8px;
}

.pl-linked-rep-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 8px 10px;
  border-radius: 9px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
}

.pl-linked-rep-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.pl-linked-rep-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--bg-text-primary);
  line-height: 1.4;
  min-width: 0;
  flex: 1 1 0%;
  word-break: break-word;
}

.pl-linked-rep-actions {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.pl-linked-rep-eye {
  width: 24px;
  height: 22px;
  padding: 0;
  margin: 0;
  border-radius: 6px;
  border: 1px solid var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.14s ease;
}

.pl-linked-rep-eye:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pl-linked-rep-time {
  font-size: 11px;
  color: var(--bg-text-muted);
  font-variant-numeric: tabular-nums;
}

.pl-linked-rep-note {
  font-size: 11.5px;
  color: var(--bg-text-secondary);
  line-height: 1.42;
  word-break: break-word;
}

.pl-linked-rep-note-lbl {
  font-weight: 700;
  color: var(--bg-text-muted);
}

/* UNIFIED REPORT ATTACHMENT PILLS (SYNCED WITH REPORTFIREBASE.VUE) */
.pl-rep-file-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 4px;
  min-width: 0;
}

.pl-rep-file-list.is-compact {
  gap: 4px;
  margin-top: 3px;
}

.pl-rep-file-list.is-no-top-gap {
  margin-top: 0;
}

.pl-rep-file-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 7px;
  border-radius: 8px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  min-width: 0;
  transition: border-color 0.14s ease, background 0.14s ease;
}

.pl-rep-file-pill:hover {
  border-color: var(--sem-sky-bdr);
}

.pl-rep-file-list.is-compact .pl-rep-file-pill {
  padding: 4px 6px;
  gap: 5px;
}

.pl-rep-file-ic {
  width: 17px;
  height: 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pl-rep-file-ic :deep(svg) {
  width: 17px;
  height: 17px;
  display: block;
}

.pl-rep-file-ic.is-md {
  width: 20px;
  height: 20px;
}

.pl-rep-file-ic.is-md :deep(svg) {
  width: 20px;
  height: 20px;
}

.pl-rep-file-ic.is-xs {
  width: 14px;
  height: 14px;
}

.pl-rep-file-ic.is-xs :deep(svg) {
  width: 14px;
  height: 14px;
}

.pl-rep-file-badge {
  font-size: 9.8px;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 2px 5px;
  border-radius: 5px;
  flex-shrink: 0;
  color: #ffffff;
  white-space: nowrap;
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.pl-rep-file-badge.is-xs {
  font-size: 8.5px;
  padding: 1px 4px;
  border-radius: 4px;
  letter-spacing: 0.03em;
}

.pl-rep-file-badge.is-bg {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.pl-rep-file-badge.is-mh {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.pl-rep-file-badge.is-img {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
}

.pl-rep-file-badge.is-direct {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.pl-rep-file-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 1 0%;
  min-width: 0;
}

.pl-rep-file-name.is-clickable {
  text-decoration: none;
  cursor: pointer;
  transition: color 0.14s ease;
}

.pl-rep-file-name.is-clickable:hover {
  color: var(--sem-sky-txt);
  text-decoration: underline;
}

.pl-rep-file-act {
  width: 24px !important;
  height: 22px;
  padding: 0;
  margin: 0;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  text-decoration: none;
  font-family: inherit;
  transition: all 0.14s ease;
}

.pl-rep-file-act.is-xs {
  width: 20px !important;
  height: 19px;
  border-radius: 5px;
}

.pl-rep-file-act.is-btn {
  width: auto !important;
  height: 25px;
  padding: 0 8px;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
}

.pl-rep-file-act.is-view {
  background: var(--sem-sky-bg);
  border: 1px solid var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-rep-file-act.is-view:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pl-rep-file-act.is-dl {
  background: var(--sem-emerald-bg);
  border: 1px solid var(--sem-emerald-bdr);
  color: var(--sem-emerald-txt);
}

.pl-rep-file-act.is-dl:hover {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.pl-rep-file-act.is-del {
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  color: var(--bg-text-muted);
}

.pl-rep-file-act.is-del:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}

.pl-rep-file-act.is-locate {
  background: var(--sem-rose-bg);
  border: 1px solid var(--sem-rose-bdr);
  color: var(--sem-rose-txt);
}

.pl-rep-file-act.is-locate:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}

.pl-rep-file-act.is-rep-open {
  background: var(--sem-amber-bg);
  border: 1px solid var(--sem-amber-bdr);
  color: var(--sem-amber-txt);
}

.pl-rep-file-act.is-rep-open:hover {
  background: #d97706;
  border-color: #d97706;
  color: #ffffff;
}

.pl-linked-rep-rm {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--bg-border-subtle);
  background: transparent;
  color: var(--bg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.14s ease;
}

.pl-linked-rep-rm:hover {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.pl-qf-mini-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px dashed var(--bg-border-subtle);
}

.pl-qf-mini-title {
  font-weight: 700;
  color: var(--bg-text-primary);
}

.pl-qf-thumbs {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.pl-qf-thumb {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid var(--bg-border-subtle);
  cursor: zoom-in;
}

/* Tier 5: Differentiated Report-DNA Action Footer */
.pl-card-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  margin-top: auto;
  border-top: 1px solid var(--bg-border-subtle);
  transition:
    max-height 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.16s ease,
    padding-top 0.16s ease,
    margin-top 0.16s ease,
    border-color 0.16s ease;
}

/* PC Hover-Reveal: Clean Kanban columns at rest, smooth slide-out on hover/focus */
@media (hover: hover) and (min-width: 769px) {
  .pl-card .pl-card-actions {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    padding-top: 0;
    margin-top: -4px;
    border-top-color: transparent;
    pointer-events: none;
  }

  .pl-card:hover .pl-card-actions,
  .pl-card:focus-within .pl-card-actions {
    max-height: 48px;
    opacity: 1;
    padding-top: 9px;
    margin-top: 2px;
    border-top-color: var(--bg-border-subtle);
    pointer-events: auto;
  }

  :is(.pl-card.is-done, .pl-card.is-failed):hover .pl-card-actions,
  :is(.pl-card.is-done, .pl-card.is-failed):focus-within .pl-card-actions {
    border-top-color: rgba(255, 255, 255, 0.28);
  }
}

.pl-dcard-btn-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
}

.pl-dcard-btn {
  flex: 0 0 auto;
  height: 30px;
  padding: 0 8px;
  margin: 0;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  cursor: pointer;
  position: relative;
  user-select: none;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
}

.pl-dcard-btn:active {
  transform: scale(0.97);
}

.pl-dcard-btn.is-copy {
  background: var(--bg-input-well);
  border: 1.5px solid var(--bg-border-strong);
  color: var(--bg-text-secondary);
}

.pl-dcard-btn.is-copy:hover {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-dcard-btn.is-del {
  background: transparent;
  border: 1.5px solid rgba(248, 113, 113, 0.38);
  color: #f87171;
}

.pipeline-workspace.page.theme-light-blue .pl-dcard-btn.is-del {
  border-color: rgba(225, 29, 72, 0.36);
  color: #e11d48;
}

.pl-dcard-btn.is-del:hover {
  background: #e11d48;
  border-color: #e11d48;
  color: #ffffff;
  box-shadow: 0 4px 10px -2px rgba(225, 29, 72, 0.42);
}

.pl-dcard-btn.is-stage {
  flex: 1 1 auto;
  min-width: 0;
  background: var(--sem-sky-bg);
  border: 1.5px solid var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
  overflow: hidden;
}

.pl-dcard-btn.is-stage:hover,
.pl-dcard-btn.is-stage:focus-within {
  background: var(--theme-cta-grad);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 4px 11px -2px var(--theme-cta-shadow);
}

.pl-stage-pct-pill {
  padding: 1px 5px;
  border-radius: 5px;
  background: rgba(14, 165, 233, 0.16);
  font-size: 10px;
  font-weight: 900;
  line-height: 1.25;
}

.pl-dcard-btn.is-stage:hover .pl-stage-pct-pill,
.pl-dcard-btn.is-stage:focus-within .pl-stage-pct-pill {
  background: rgba(255, 255, 255, 0.24);
  color: #ffffff;
}

.pl-stage-caret {
  font-size: 10px;
  opacity: 0.85;
}

.pl-stage-native-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  font-size: 16px;
}

/* Contrast Overrides Inside Solid Outcome Cards (.pl-card.is-done & .pl-card.is-failed) */
:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-time,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-card-company,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-volume-val,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-kcard-title {
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-kcard-title.is-empty-title {
  color: rgba(255, 255, 255, 0.82) !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-card-contact,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-card-po,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-kcard-company {
  color: rgba(255, 255, 255, 0.92) !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-kcard-timeline,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-kcard-customer {
  color: rgba(255, 255, 255, 0.84) !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-kcard-more-btn {
  color: rgba(255, 255, 255, 0.9) !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-kcard-more-btn:hover,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-kcard-more-btn.is-active {
  background: rgba(255, 255, 255, 0.22) !important;
  border-color: rgba(255, 255, 255, 0.45) !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-id-tag,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-contract-tag,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-metric-chip,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-card-project-pill,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-link-toggle {
  background: rgba(255, 255, 255, 0.17) !important;
  border-color: rgba(255, 255, 255, 0.34) !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-card-project-pill:hover,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-link-toggle:hover,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-link-toggle.is-open {
  background: rgba(255, 255, 255, 0.26) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-chip.is-prio-chip,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-chip.is-warn-chip {
  background: rgba(225, 29, 72, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.48) !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-am-avatar {
  background: rgba(255, 255, 255, 0.24) !important;
  border: 1px solid rgba(255, 255, 255, 0.42) !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-collapse-box {
  background: rgba(0, 0, 0, 0.18) !important;
  border-color: rgba(255, 255, 255, 0.26) !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-file-link,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-file-dl {
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-rep-mini-item {
  border-bottom-color: rgba(255, 255, 255, 0.22) !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-linked-rep-title,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-rep-file-name,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-rep-file-name.is-clickable:hover {
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-linked-rep-note {
  color: rgba(255, 255, 255, 0.88) !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-rep-file-pill {
  background: rgba(0, 0, 0, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.26) !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-linked-rep-eye,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-rep-file-act {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.44) !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-linked-rep-eye:hover,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-rep-file-act:hover {
  background: rgba(255, 255, 255, 0.36) !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-rep-att-sub {
  border-left-color: rgba(255, 255, 255, 0.4) !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-btn.is-copy,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-btn.is-del,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-btn.is-stage {
  background: rgba(255, 255, 255, 0.17) !important;
  border-color: rgba(255, 255, 255, 0.42) !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-stage-pct-pill {
  background: rgba(255, 255, 255, 0.24) !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-btn.is-del:hover {
  background: #9f1239 !important;
  border-color: #fda4af !important;
  color: #ffffff !important;
}

:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-btn.is-copy:hover,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-btn.is-stage:hover,
:is(.pl-card.is-done, .pl-card.is-failed) .pl-dcard-btn.is-stage:focus-within {
  background: rgba(255, 255, 255, 0.3) !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

/* =========================================================
   KANBAN VIEW B: PROJECT SWIMLANES
   ========================================================= */
.pl-swimlane-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pl-swimlane-card {
  border-radius: 14px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  box-shadow: var(--bg-shadow-card);
  overflow: visible;
}

.pl-swimlane-head {
  position: sticky;
  top: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 13px 13px 0 0;
  background: var(--bg-col-cap-solid);
  border-bottom: 1px solid var(--bg-border-subtle);
  box-shadow: 0 6px 14px -8px rgba(2, 6, 23, 0.34);
  cursor: pointer;
  flex-wrap: wrap;
}

.pipeline-workspace.page.theme-custom-glass .pl-swimlane-head {
  backdrop-filter: blur(var(--cg-blur, 18px));
}

.pl-swimlane-left,
.pl-swimlane-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-swimlane-caret {
  display: inline-flex;
  transition: transform 0.18s ease;
  color: var(--bg-text-muted);
}

.pl-swimlane-caret.is-collapsed {
  transform: rotate(-90deg);
}

.pl-swimlane-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-swimlane-sub {
  font-size: 12px;
  color: var(--bg-text-muted);
}

.pl-swimlane-vol {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--sem-emerald-txt);
}

.pl-swimlane-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  padding: 10px;
  overflow-x: auto;
}

.pl-swimlane-cell {
  border-radius: 10px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 110px;
}

.pl-swimlane-cell-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--bg-text-secondary);
}

.pl-swimlane-col-lbl {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-swimlane-cell-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pl-swimlane-cell.is-cell-success {
  background:
    linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.07) 100%),
    var(--bg-input-well);
  border-color: rgba(16, 185, 129, 0.42);
}

.pl-swimlane-cell.is-cell-fail {
  background:
    linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, rgba(225, 29, 72, 0.07) 100%),
    var(--bg-input-well);
  border-color: rgba(244, 63, 94, 0.42);
}

.pipeline-workspace.page.theme-light-blue .pl-swimlane-cell.is-cell-success {
  background: linear-gradient(180deg, #d1fae5 0%, #ecfdf5 45%, #f0fdf4 100%);
  border-color: #6ee7b7;
}

.pipeline-workspace.page.theme-light-blue .pl-swimlane-cell.is-cell-fail {
  background: linear-gradient(180deg, #ffe4e6 0%, #fff1f2 45%, #fef2f2 100%);
  border-color: #fda4af;
}

.pl-swimlane-cell.is-cell-success .pl-swimlane-cell-head {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  margin: -8px -8px 2px;
  padding: 7px 10px;
  border-radius: 9px 9px 0 0;
}

.pl-swimlane-cell.is-cell-fail .pl-swimlane-cell-head {
  background: linear-gradient(135deg, #ef4444 0%, #e11d48 100%);
  color: #ffffff;
  margin: -8px -8px 2px;
  padding: 7px 10px;
  border-radius: 9px 9px 0 0;
}

.pl-swimlane-cell.is-cell-success .pl-swimlane-cell-head .pl-col-dot,
.pl-swimlane-cell.is-cell-fail .pl-swimlane-cell-head .pl-col-dot {
  background: #ffffff !important;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.28);
}

/* =========================================================
   MODALS, .modal-group & .modal-banner-header ANATOMY
   ========================================================= */
.pl-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100020;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.pl-modal-overlay.theme-light-blue {
  background: rgba(15, 23, 42, 0.42);
}

/* 100% Fullscreen Studio Modals & Layered Picker Z-Index Ladder */
.pl-modal-overlay.is-fullscreen-overlay {
  z-index: 100024;
  padding: 0;
  align-items: stretch;
  justify-content: stretch;
}

.pl-modal-overlay.is-fullscreen-overlay.is-project-studio-overlay {
  z-index: 100020;
}

.pl-modal-overlay.is-fullscreen-overlay.theme-custom-glass {
  background: rgba(6, 15, 28, 0.82);
  backdrop-filter: blur(22px);
}

.pl-modal-overlay.is-elevated-overlay {
  z-index: 100026;
}

.pl-modal-overlay.is-submodal-overlay {
  z-index: 100029;
}

.pl-modal-overlay.is-picker-overlay {
  z-index: 100032;
}

.pl-modal-overlay.is-top-picker-overlay {
  z-index: 100036;
}

.pl-modal-card {
  width: 100%;
  max-height: 92vh;
  border-radius: 16px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-strong);
  box-shadow: var(--bg-shadow-modal);
  color: var(--bg-text-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pl-modal-card.pl-modal-fullscreen {
  width: 100vw;
  max-width: 100%;
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.pl-modal-header.is-fullscreen-head {
  padding: 12px 20px;
  flex-shrink: 0;
}

.pl-modal-footer.is-fullscreen-foot {
  padding: 11px 20px;
  flex-shrink: 0;
}

.pl-modal-body.pl-fullscreen-form-body {
  flex: 1 1 0%;
  min-height: 0;
  padding: 14px 20px;
  overflow-y: auto;
}

/* =========================================================
   3-COLUMN STUDIO MODAL ARCHITECTURE (SYNCED WITH REPORT & BAOGIA)
   ========================================================= */
.pl-studio-head-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.pl-studio-head-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pl-studio-ctx-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-secondary);
}

.pl-studio-ctx-pill.is-sky {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-studio-ctx-pill.is-emerald {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bdr);
  color: var(--sem-emerald-txt);
}

.pl-studio-ctx-pill.is-rose {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bdr);
  color: var(--sem-rose-txt);
}

.pl-studio-banner-left {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.pl-studio-mob-rail-toggle {
  display: none;
  width: auto !important;
  margin: 0;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.pl-studio-mob-rail-chevron {
  transition: transform 0.18s ease;
}

.pl-studio-mob-rail-toggle.is-open .pl-studio-mob-rail-chevron {
  transform: rotate(180deg);
}

.pl-studio-col-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 13px 14px;
  min-width: 0;
}

/* DESKTOP (> 1100px): FIXED 3-COLUMN WORKSPACE WITH INDEPENDENT SCROLL */
@media (min-width: 1101px) {
  .pl-modal-body.pl-fullscreen-form-body.is-studio-3col {
    display: grid;
    grid-template-columns: minmax(265px, 24.5%) minmax(0, 1fr) minmax(285px, 27.5%);
    gap: 14px;
    overflow: hidden;
    align-items: stretch;
  }

  .pl-studio-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .pl-studio-col-body {
    flex: 1 1 0%;
    min-height: 0;
    overflow-y: auto;
  }

  .pl-studio-center-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pl-studio-work-stage-split {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pl-studio-editor-col {
    flex: 1 1 0%;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pl-studio-main-po-field {
    flex: 1 1 120px;
    min-height: 108px;
    display: flex;
    flex-direction: column;
  }

  .pl-studio-main-textarea {
    flex: 1 1 0%;
    min-height: 88px;
    resize: none;
    line-height: 1.55;
  }

  .pl-studio-remarks-field,
  .pl-studio-stage-col {
    flex-shrink: 0;
  }
}

/* WIDE DESKTOP (>= 1360px): SIDE-BY-SIDE [PO + REMARKS] | [STAGE STEPPER RAIL] */
@media (min-width: 1360px) {
  .pl-studio-work-stage-split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 216px;
    gap: 12px;
    align-items: stretch;
  }

  .pl-studio-stage-col {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .pl-stage-rail-box {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    border-radius: 10px;
    background: var(--bg-surface-2, rgba(15, 23, 42, 0.42));
    border: 1px solid var(--bg-border-subtle);
  }

  .pl-modal-overlay.theme-light-blue .pl-stage-rail-box {
    background: #f8fafc;
    border-color: #dbe3ee;
  }
}

/* MOBILE / TABLET (<= 1100px): VERTICAL STACK + COLLAPSIBLE LEFT RAIL */
@media (max-width: 1100px) {
  .pl-modal-body.pl-fullscreen-form-body.is-studio-3col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal-banner-header.is-mob-collapsible {
    cursor: pointer;
    user-select: none;
  }

  .pl-studio-mob-rail-toggle {
    display: inline-flex;
  }

  .pl-studio-col.is-mob-collapsed .pl-studio-left-body {
    display: none;
  }

  .pl-studio-work-stage-split,
  .pl-studio-editor-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pl-studio-main-textarea {
    min-height: 150px;
    line-height: 1.5;
  }
}

/* 1-TAP PRIORITY CHOICE GRID */
.pl-choice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.pl-choice-grid.is-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.pl-choice-grid.is-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 560px) {
  .pl-choice-grid.is-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.pl-choice-btn {
  width: auto;
  margin: 0;
  height: 33px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.14s ease;
}

.pl-choice-btn:hover {
  border-color: var(--bg-border-strong);
  color: var(--bg-text-primary);
}

.pl-choice-btn.is-active-slate {
  background: var(--bg-surface-3);
  border-color: var(--sem-sky-bdr);
  color: var(--bg-text-primary);
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.18);
}

.pl-choice-btn.is-active-sky {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-choice-btn.is-active-emerald {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bdr);
  color: var(--sem-emerald-txt);
}

.pl-choice-btn.is-active-amber {
  background: var(--sem-amber-bg);
  border-color: var(--sem-amber-bdr);
  color: var(--sem-amber-txt);
}

.pl-choice-btn.is-active-rose {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bdr);
  color: var(--sem-rose-txt);
}

/* 1-TAP VISUAL STAGE STEPPER (NORMAL AT REST -> SOLID STAGE COLOR + WHITE TEXT WHEN ACTIVE) */
.pl-stage-cur-hint {
  font-size: 11px;
  font-weight: 800;
  color: var(--sem-sky-txt);
}

.pl-stage-cur-hint.is-emerald {
  color: var(--sem-emerald-txt);
}

.pl-stage-cur-hint.is-rose {
  color: var(--sem-rose-txt);
}

.pl-stage-stepper,
.pl-stage-rail-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pl-stage-steps-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 0;
  overflow-y: auto;
}

@media (max-width: 1359px) {
  .pl-stage-steps-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(154px, 1fr));
    gap: 6px;
    overflow: visible;
  }
}

@media (max-width: 560px) {
  .pl-stage-steps-list {
    grid-template-columns: minmax(0, 1fr);
  }
}

.pl-stage-step-btn {
  width: 100%;
  margin: 0;
  min-height: 34px;
  padding: 5px 10px 5px 11px;
  border-radius: 9px;
  border: 1px solid var(--bg-border-subtle);
  border-left: 3px solid var(--step-clr, #3b82f6);
  background: var(--bg-input-well);
  color: var(--bg-text-secondary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
  cursor: pointer;
  transition: background 0.14s ease, color 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease, transform 0.12s ease;
}

.pl-stage-step-btn:hover:not(.is-active) {
  border-color: var(--bg-border-strong);
  border-left-color: var(--step-clr, #3b82f6);
  background: var(--bg-surface-3);
  color: var(--bg-text-primary);
  transform: translateY(-1px);
}

.pl-stage-step-btn.is-active {
  background: var(--step-clr, #3b82f6);
  border-color: rgba(255, 255, 255, 0.36);
  border-left-color: #ffffff;
  color: #ffffff;
  text-shadow: 0 1px 1.5px rgba(15, 23, 42, 0.26);
  font-weight: 800;
  box-shadow: 0 5px 14px -3px rgba(2, 6, 23, 0.42);
}

.pl-modal-overlay.theme-light-blue .pl-stage-step-btn.is-active {
  border-color: rgba(15, 23, 42, 0.14);
  border-left-color: #ffffff;
  box-shadow: 0 5px 14px -3px rgba(15, 23, 42, 0.22);
}

.pl-stage-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--step-clr, #3b82f6);
  opacity: 0.82;
  flex-shrink: 0;
  transition: background 0.14s ease, box-shadow 0.14s ease, opacity 0.14s ease;
}

.pl-stage-step-btn.is-active .pl-stage-dot {
  background: #ffffff;
  opacity: 1;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.28);
}

.pl-stage-pct {
  padding: 1px 6px;
  border-radius: 5px;
  background: rgba(148, 163, 184, 0.14);
  border: 1px solid transparent;
  color: var(--bg-text-primary);
  font-size: 10.5px;
  font-weight: 800;
  flex-shrink: 0;
  transition: background 0.14s ease, border-color 0.14s ease, color 0.14s ease;
}

.pl-stage-step-btn.is-active .pl-stage-pct {
  background: rgba(15, 23, 42, 0.26);
  border-color: rgba(255, 255, 255, 0.42);
  color: #ffffff;
}

.pl-stage-lbl {
  flex: 1 1 0%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: inherit;
}

.pl-stage-chk {
  color: #ffffff;
  flex-shrink: 0;
}

.pl-stage-outcomes-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 2px;
}

@media (min-width: 1360px) {
  .pl-stage-outcomes-row.is-rail-footer {
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px dashed var(--bg-border-subtle);
    gap: 5px;
  }

  .pl-stage-outcomes-row.is-rail-footer .pl-stage-outcome-btn {
    height: 33px;
    padding: 0 5px;
    font-size: 10.5px;
    gap: 4px;
  }
}

.pl-stage-outcome-btn {
  width: auto;
  margin: 0;
  height: 34px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
  text-shadow: 0 1px 1.5px rgba(15, 23, 42, 0.26);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  opacity: 0.72;
  filter: saturate(0.9);
  transition: opacity 0.14s ease, filter 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease, transform 0.12s ease;
}

.pl-stage-outcome-btn.is-win {
  background: var(--step-clr, #10b981);
}

.pl-stage-outcome-btn.is-lost {
  background: var(--step-clr, #ef4444);
}

.pl-stage-outcome-btn:hover {
  opacity: 0.94;
  filter: none;
  border-color: rgba(255, 255, 255, 0.7);
  color: #ffffff;
  transform: translateY(-1px);
}

.pl-stage-outcome-btn.is-active {
  opacity: 1;
  filter: none;
  border-color: #ffffff;
  color: #ffffff;
  box-shadow: 0 0 0 2px var(--step-clr, #10b981), 0 6px 14px -3px rgba(2, 6, 23, 0.48);
}

.pl-modal-overlay.theme-light-blue .pl-stage-outcome-btn.is-active {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px #0f172a, 0 5px 12px -3px rgba(15, 23, 42, 0.24);
}

.pl-studio-compact-2col {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 8px;
}

/* PA1: MACHINED DATETIME MATRIX (MATCHES REPORT & BAOGIA TEMPLATE) */
.pl-link-btn.is-rose-hover:hover {
  color: var(--sem-rose-txt);
}

.pl-tl-matrix {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 9px;
  border-radius: 10px;
  background: var(--bg-surface-2, rgba(15, 23, 42, 0.45));
  border: 1px solid var(--bg-border-subtle);
}

.pl-modal-overlay.theme-light-blue .pl-tl-matrix {
  background: #f8fafc;
  border-color: #dbe3ee;
}

.pl-choice-grid.is-tl-presets {
  gap: 5px;
}

.pl-choice-grid.is-tl-presets .pl-choice-btn {
  height: 30px;
  padding: 0 5px;
  font-size: 11px;
  border-radius: 7px;
}

.pl-tl-cselect-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pl-tl-cselect-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pl-tl-row-tag {
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  border-radius: 7px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  color: var(--bg-text-muted);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pl-tl-row-tag.is-end {
  color: var(--sem-sky-txt);
  border-color: var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
}

.pl-tl-sep {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--bg-text-muted);
  opacity: 0.6;
  flex-shrink: 0;
  user-select: none;
}

.pl-tl-cselect-wrap {
  position: relative;
  flex: 1 1 0%;
  min-width: 0;
}

.pl-tl-cselect-wrap.is-day {
  flex: 0.95 1 0%;
}

.pl-tl-cselect-wrap.is-month {
  flex: 1 1 0%;
}

.pl-tl-cselect-wrap.is-year {
  flex: 1.12 1 0%;
}

.pl-tl-cselect-btn {
  width: 100%;
  height: 31px;
  margin: 0;
  padding: 0 6px 0 7px;
  border-radius: 7px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3px;
  cursor: pointer;
  transition: border-color 0.14s ease, background 0.14s ease, color 0.14s ease, box-shadow 0.14s ease;
}

.pl-tl-cselect-btn.has-value {
  color: var(--bg-text-primary);
  font-weight: 800;
}

.pl-tl-cselect-btn:hover {
  border-color: var(--bg-border-strong);
  color: var(--bg-text-primary);
}

.pl-tl-cselect-btn.is-open {
  border-color: var(--sem-sky-bdr);
  background: var(--bg-surface-3);
  color: var(--sem-sky-txt);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.16);
}

.pl-tl-cselect-chev {
  flex-shrink: 0;
  opacity: 0.72;
  transition: transform 0.15s ease;
}

.pl-tl-cselect-btn.is-open .pl-tl-cselect-chev {
  transform: rotate(180deg);
  opacity: 1;
}

/* POPOVER OPENS UPWARD TO PREVENT ANY COLUMN CLIPPING */
.pl-tl-cselect-pop {
  position: absolute;
  bottom: calc(100% + 6px);
  z-index: 80;
  padding: 8px;
  border-radius: 10px;
  background: #0f172a;
  border: 1px solid rgba(56, 189, 248, 0.34);
  box-shadow: 0 14px 32px -6px rgba(2, 6, 23, 0.72);
}

.pl-tl-cselect-pop.is-day-pop {
  left: -35px;
  min-width: 228px;
}

.pl-tl-cselect-pop.is-month-pop {
  left: -46px;
  min-width: 208px;
}

.pl-tl-cselect-pop.is-year-pop {
  right: 0;
  min-width: 208px;
}

.pl-modal-overlay.theme-light-blue .pl-tl-cselect-pop {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 14px 30px -6px rgba(15, 23, 42, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.08);
}

.pl-modal-overlay.theme-custom-glass .pl-tl-cselect-pop {
  background: var(--bg-surface-1, rgba(15, 23, 42, 0.94));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.pl-tl-pop-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  padding: 0 2px 5px;
  border-bottom: 1px solid var(--bg-border-subtle);
  font-size: 10.5px;
  font-weight: 800;
  color: var(--bg-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.pl-tl-pop-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pl-tl-pop-today {
  width: auto !important;
  margin: 0;
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.pl-tl-pop-clear {
  width: auto !important;
  margin: 0;
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid var(--sem-rose-bdr);
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.pl-tl-pop-grid.is-cols-4 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
}

.pl-tl-pop-grid.is-cols-7 {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3.5px;
}

.pl-tl-cselect-cell {
  width: 100%;
  height: 29px;
  margin: 0;
  padding: 0 4px;
  border-radius: 6px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-secondary);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
}

.pl-tl-cselect-cell.is-day-cell {
  height: 27px;
  padding: 0;
  font-size: 11px;
}

.pl-tl-cselect-cell:hover {
  border-color: var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
}

.pl-tl-cselect-cell.is-selected {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 3px 10px -2px rgba(2, 132, 199, 0.45);
}

.pl-tl-single-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.pl-tl-cal-ic {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--bg-text-muted);
  pointer-events: none;
  transition: color 0.14s ease;
}

.pl-tl-cal-ic.is-active {
  color: var(--sem-sky-txt);
}

.pl-tl-single-input-wrap .bg-input.has-left-cal {
  padding-left: 31px;
  font-size: 12px;
  font-weight: 700;
}

.pl-tl-single-input-wrap .bg-input.has-tl-val {
  border-color: var(--sem-sky-bdr);
}

.pl-tl-single-input-wrap .bg-input.has-right-clear {
  padding-right: 30px;
}

.pl-tl-clear-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px !important;
  height: 22px;
  margin: 0;
  padding: 0;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--bg-text-muted);
  font-size: 14px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pl-tl-clear-btn:hover {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
}

/* CENTER COLUMN: COMMERCIAL ROW & FINTECH VOLUME HERO */
.pl-studio-commercial-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  align-items: end;
}

.pl-volume-studio-shell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pl-volume-input-wrap {
  position: relative;
  flex: 1 1 0%;
  min-width: 0;
  display: flex;
  align-items: center;
}

.bg-input.is-volume-hero {
  padding-right: 28px;
  font-size: 14.5px;
  font-weight: 800;
  color: var(--sem-emerald-txt);
  border-color: var(--sem-emerald-bdr);
  background: var(--sem-emerald-bg);
}

.bg-input.is-volume-hero:focus {
  border-color: var(--sem-emerald-txt);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.16);
}

.pl-volume-unit {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12.5px;
  font-weight: 800;
  color: var(--sem-emerald-txt);
  pointer-events: none;
}

.pl-volume-scan-btn {
  height: 36px;
  flex-shrink: 0;
  white-space: nowrap;
}

/* RIGHT COLUMN: UPLOAD VAULT & FILE CARDS */
.pl-studio-empty-hint {
  margin-top: 6px;
  padding: 9px 11px;
  border-radius: 8px;
  border: 1px dashed var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-muted);
  font-size: 11.5px;
  line-height: 1.45;
}

.pl-studio-divider {
  height: 1px;
  background: var(--bg-border-subtle);
  margin: 2px 0;
}

.pl-studio-upload-vault {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1.5px dashed var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  cursor: pointer;
  transition: all 0.15s ease;
}

.pl-studio-upload-vault:hover,
.pl-studio-upload-vault.is-dragging {
  border-color: var(--sem-sky-txt);
  background: rgba(14, 165, 233, 0.2);
}

.pl-modal-overlay.theme-light-blue .pl-studio-upload-vault {
  background: #f0f7ff;
  border-color: #93c5fd;
}

.pl-modal-overlay.theme-light-blue .pl-studio-upload-vault:hover,
.pl-modal-overlay.theme-light-blue .pl-studio-upload-vault.is-dragging {
  background: #e0f2fe;
  border-color: #0284c7;
}

.pl-studio-up-ic {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(2, 132, 199, 0.22);
  border: 1px solid var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pl-studio-up-txt {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.pl-studio-up-main {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-studio-up-sub {
  font-size: 11px;
  color: var(--bg-text-muted);
}

.pl-studio-file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.pl-studio-file-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 9px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  min-width: 0;
}

.pl-file-ext-badge {
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  flex-shrink: 0;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-surface-3);
  color: var(--bg-text-secondary);
}

.pl-file-ext-badge.is-rose {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bdr);
  color: var(--sem-rose-txt);
}

.pl-file-ext-badge.is-emerald {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bdr);
  color: var(--sem-emerald-txt);
}

.pl-file-ext-badge.is-sky {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-file-ext-badge.is-amber {
  background: var(--sem-amber-bg);
  border-color: var(--sem-amber-bdr);
  color: var(--sem-amber-txt);
}

.pl-studio-file-name {
  flex: 1 1 0%;
  min-width: 0;
  font-weight: 600;
}

.pl-studio-file-acts {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.pl-studio-file-act-btn {
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-surface-2);
  color: var(--bg-text-secondary);
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.14s ease;
}

.pl-studio-file-act-btn:hover {
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-studio-file-del-btn {
  width: 24px !important;
  height: 24px;
  margin: 0;
  padding: 0;
  border-radius: 6px;
  border: 1px solid var(--bg-border-subtle);
  background: transparent;
  color: var(--bg-text-muted);
  font-size: 11.5px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.14s ease;
}

.pl-studio-file-del-btn:hover {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bdr);
  color: var(--sem-rose-txt);
}

/* STUDIO STICKY FOOTER */
.pl-modal-footer.is-studio-foot {
  justify-content: space-between;
  padding-bottom: calc(11px + env(safe-area-inset-bottom, 0px));
}

.pl-studio-foot-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pl-studio-kbd-hint {
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

.pl-studio-foot-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .pl-studio-head-pills {
    display: none;
  }

  .pl-studio-commercial-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* =========================================================
   PROJECT STUDIO MODALS (MODAL A 3-COL MASTER-DETAIL & MODAL B 2-COL)
   ========================================================= */
.pl-proj-studio-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-proj-studio-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: min(46vw, 560px);
}

.pl-proj-studio-sub {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bg-banner-btn.is-solid-cta {
  background: #ffffff;
  border-color: #ffffff;
  color: #047857;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.bg-banner-btn.is-solid-cta:hover {
  background: #f0fdf4;
  color: #065f46;
}

.pl-proj-banner-truncate {
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 1101px) {
  .pl-modal-body.pl-fullscreen-form-body.is-studio-3col.is-proj-studio-3col {
    grid-template-columns: minmax(250px, 23%) minmax(0, 1fr) minmax(275px, 27.5%);
  }
}

/* COLUMN 1: PROJECT WORKFLOW NAVIGATION RAIL */
.pl-proj-wf-nav-body {
  gap: 8px;
}

.pl-proj-nav-item {
  padding: 9px 11px;
  border-radius: 10px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  border-left: 3px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pl-proj-nav-item:hover {
  border-color: var(--bg-border-strong);
  background: var(--bg-surface-3);
}

.pl-proj-nav-item.is-active {
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bdr);
  border-left: 3px solid #0ea5e9;
}

.pl-proj-nav-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.pl-proj-nav-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-proj-nav-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
  line-height: 1.3;
}

.pl-proj-nav-pref {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  background: var(--sem-emerald-bg);
  border: 1px solid var(--sem-emerald-bdr);
  color: var(--sem-emerald-txt);
  white-space: nowrap;
}

.pl-proj-nav-cnt {
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  color: var(--bg-text-secondary);
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pl-proj-nav-item.is-active .pl-proj-nav-cnt {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pl-proj-nav-sub {
  font-size: 11px;
  color: var(--bg-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-proj-nav-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px dashed var(--bg-border-subtle);
}

.pl-proj-nav-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

.pl-proj-nav-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  flex-shrink: 0;
}

.pl-proj-nav-acts {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.pl-proj-nav-act-btn {
  width: auto !important;
  height: 22px;
  margin: 0;
  padding: 0 7px;
  border-radius: 5px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-surface-2);
  color: var(--bg-text-secondary);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.14s ease;
}

.pl-proj-nav-act-btn:hover {
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
}

.pl-proj-nav-act-btn.is-danger:hover {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bdr);
  color: var(--sem-rose-txt);
}

.pl-proj-designer-jump {
  width: 100%;
  margin: 2px 0 0;
  padding: 8px 11px;
  border-radius: 9px;
  border: 1px dashed var(--bg-border-strong);
  background: transparent;
  color: var(--bg-text-muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.14s ease;
}

.pl-proj-designer-jump:hover {
  border-color: var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
  background: var(--sem-sky-bg);
}

/* COLUMN 2: MINIMALIST WORK ITEM CARDS & 1-TAP STAGE MENU */
.pl-proj-pipes-body {
  gap: 9px;
}

.pl-proj-pipe-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.pl-proj-pipe-search-ic {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--bg-text-muted);
  pointer-events: none;
}

.pl-proj-pipe-search-input {
  padding-left: 31px;
  padding-right: 30px;
}

.pl-proj-work-card {
  position: relative;
  padding: 11px 13px;
  border-radius: 11px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 7px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.pl-proj-work-card:hover {
  border-color: var(--bg-border-strong);
  background: var(--bg-surface-3);
}

.pl-proj-work-card.is-focused {
  border-color: var(--sem-emerald-bdr);
  box-shadow: inset 3px 0 0 #10b981;
  background: var(--bg-surface-1);
}

.pl-proj-work-card.is-menu-open {
  z-index: 35;
}

.pl-pwc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pl-pwc-party {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.pl-pwc-company {
  font-size: 12px;
  font-weight: 800;
  color: var(--bg-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-pwc-contact {
  font-size: 11.5px;
  color: var(--bg-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-pwc-partner-pill {
  padding: 1px 6px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 800;
  background: var(--sem-amber-bg);
  border: 1px solid var(--sem-amber-bdr);
  color: var(--sem-amber-txt);
  flex-shrink: 0;
}

.pl-pwc-vol {
  font-size: 13.5px;
  font-weight: 900;
  color: var(--sem-emerald-txt);
  white-space: nowrap;
  flex-shrink: 0;
}

.pl-pwc-vol.is-zero {
  color: var(--bg-text-faint);
  font-weight: 700;
}

.pl-pwc-content {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--bg-text-primary);
  line-height: 1.42;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.pl-pwc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 6px;
  border-top: 1px solid var(--bg-border-subtle);
}

.pl-pwc-foot-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-pwc-stage-wrap {
  position: relative;
  display: inline-flex;
}

.pl-pwc-stage-btn {
  width: auto !important;
  height: 26px;
  margin: 0;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: var(--st-clr, #3b82f6);
  color: #ffffff;
  text-shadow: 0 1px 1.5px rgba(15, 23, 42, 0.25);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.14s ease;
}

.pl-pwc-stage-btn:hover {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.2);
  filter: brightness(1.06);
}

.pl-pwc-stage-dot {
  width: 6.5px;
  height: 6.5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  flex-shrink: 0;
}

.pl-pwc-stage-lbl {
  max-width: 135px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-pwc-stage-chev {
  color: rgba(255, 255, 255, 0.9);
}

.pl-pwc-stage-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  z-index: 60;
  min-width: 224px;
  max-height: 260px;
  overflow-y: auto;
  padding: 5px;
  border-radius: 10px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-strong);
  box-shadow: var(--bg-shadow-modal);
  display: flex;
  flex-direction: column;
  gap: 3.5px;
}

.pl-pwc-stage-opt {
  width: 100%;
  margin: 0;
  padding: 6px 9px;
  border-radius: 7px;
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  background: var(--st-clr, #3b82f6);
  color: #ffffff;
  text-shadow: 0 1px 1.5px rgba(15, 23, 42, 0.25);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
  cursor: pointer;
  opacity: 0.78;
  transition: opacity 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease;
}

.pl-pwc-stage-opt:hover {
  opacity: 0.96;
  border-color: rgba(255, 255, 255, 0.72);
  color: #ffffff;
}

.pl-pwc-stage-opt.is-current {
  opacity: 1;
  font-weight: 800;
  border-color: #ffffff;
  color: #ffffff;
  box-shadow: 0 0 0 1.5px var(--st-clr, #3b82f6), 0 3px 8px -2px rgba(2, 6, 23, 0.45);
}

.pl-modal-overlay.theme-light-blue .pl-pwc-stage-opt.is-current {
  border-color: #ffffff;
  box-shadow: 0 0 0 1.5px #0f172a, 0 3px 8px -2px rgba(15, 23, 42, 0.22);
}

.pl-pwc-opt-pct {
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.24);
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 800;
}

.pl-pwc-opt-lbl {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-pwc-meta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--bg-text-muted);
}

.pl-pwc-meta > span + span::before {
  content: '·';
  margin-right: 7px;
  opacity: 0.55;
}

.pl-pwc-rep-tag {
  color: var(--sem-sky-txt);
  font-weight: 700;
}

.pl-pwc-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.pl-pwc-act-btn {
  width: auto !important;
  height: 25px;
  margin: 0;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-surface-2);
  color: var(--bg-text-secondary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.14s ease;
}

.pl-pwc-act-btn:hover {
  border-color: var(--bg-border-strong);
  color: var(--bg-text-primary);
}

.pl-pwc-act-btn.is-edit {
  color: var(--sem-sky-txt);
  border-color: var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
}

.pl-pwc-act-btn.is-edit:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pl-pwc-act-btn.is-danger:hover {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bdr);
  color: var(--sem-rose-txt);
}

/* COLUMN 3: DYNAMIC SCOPE CONTEXT BAR */
.pl-proj-hub-scope-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--sem-sky-bg);
  border: 1px solid var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
  font-size: 11.5px;
}

.pl-proj-hub-scope-txt {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-proj-hub-scope-reset {
  width: auto !important;
  margin: 0;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--sem-sky-bdr);
  background: var(--bg-surface-1);
  color: var(--sem-sky-txt);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}

.pl-proj-hub-scope-reset:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

/* MODAL B: 2-COLUMN PROJECT FORM STUDIO */
.pl-modal-card.pl-modal-proj-studio {
  max-width: 1080px;
  max-height: 92vh;
}

.bg-input.is-proj-name-hero {
  height: 40px;
  font-size: 14px;
  font-weight: 700;
}

.pl-proj-form-col-body {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

@media (min-width: 921px) {
  .pl-modal-body.pl-proj-form-2col {
    display: grid;
    grid-template-columns: minmax(0, 1.18fr) minmax(340px, 0.88fr);
    gap: 14px;
    align-items: stretch;
    overflow: hidden;
    flex: 1 1 auto;
    min-height: 0;
  }

  .pl-proj-form-col {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .pl-proj-form-col-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
  }
}

.pl-proj-form-wf-empty {
  margin: auto 0;
  padding: 24px 16px;
  border-radius: 11px;
  border: 1px dashed var(--bg-border-strong);
  background: var(--bg-input-well);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
}

.pl-proj-form-wf-empty-ic {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--sem-sky-bg);
  border: 1px solid var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.pl-proj-wf-guide-note {
  font-size: 11.5px;
  color: var(--bg-text-muted);
  line-height: 1.4;
}

.pl-proj-wf-radio {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid var(--bg-border-strong);
  background: transparent;
  display: inline-block;
  flex-shrink: 0;
  box-sizing: border-box;
  transition: all 0.14s ease;
}

.pl-proj-wf-radio.is-on {
  border-color: #10b981;
  background: #10b981;
  box-shadow: inset 0 0 0 2.5px var(--bg-surface-2);
}

.pl-proj-wf-add-card-btn {
  width: 100%;
  margin: 2px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px dashed var(--sem-sky-bdr);
  background: var(--bg-input-well);
  color: var(--sem-sky-txt);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.14s ease;
}

.pl-proj-wf-add-card-btn:hover {
  background: var(--sem-sky-bg);
  border-color: #0ea5e9;
}

@media (max-width: 768px) {
  .pl-proj-studio-title {
    max-width: 62vw;
  }

  .pl-modal-card.pl-modal-proj-studio .bg-input,
  .pl-modal-card.pl-modal-proj-studio .bg-textarea,
  .pl-modal-overlay.is-submodal-overlay .bg-input {
    font-size: 16px;
  }
}

.pl-modal-md {
  max-width: 640px;
}

.pl-modal-rep-picker {
  max-width: 760px;
}

.pl-modal-lg {
  max-width: 860px;
}

.pl-modal-xl {
  max-width: 1080px;
}

.pl-modal-grab {
  display: none;
  width: 42px;
  height: 4px;
  border-radius: 999px;
  background: var(--bg-border-strong);
  margin: 8px auto 0;
}

.pl-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 18px;
  background: var(--bg-surface-2);
  border-bottom: 1px solid var(--bg-border-subtle);
}

.pl-modal-title-group {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.pl-modal-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}

.pl-modal-icon.is-sky {
  background: var(--theme-sky-header-grad);
}

.pl-modal-icon.is-emerald {
  background: var(--theme-cta-grad);
}

.pl-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-modal-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--bg-text-muted);
}

.pl-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.pl-modal-close:hover {
  color: var(--sem-rose-txt);
  border-color: var(--sem-rose-bdr);
  background: var(--sem-rose-bg);
}

.pl-modal-body {
  padding: 16px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pl-modal-footer {
  padding: 12px 18px;
  background: var(--bg-surface-2);
  border-top: 1px solid var(--bg-border-subtle);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* MODAL GROUP + SOLID BANNER HEADER */
.modal-group {
  border-radius: 12px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  overflow: hidden;
}

.modal-banner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  color: #ffffff;
  flex-wrap: wrap;
}

.modal-banner-header.is-emerald {
  background: var(--theme-pri-header-grad);
}

.modal-banner-header.is-sky {
  background: var(--theme-sky-header-grad);
}

.modal-banner-header.is-teal {
  background: var(--theme-teal-header-grad);
}

.modal-banner-header.is-amber {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.modal-banner-title {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.bg-banner-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}

.bg-banner-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}

.bg-banner-pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 11px;
  font-weight: 700;
}

.modal-group-body {
  padding: 13px 14px;
}

/* FORM GRID & SOFT RECESSED INPUT WELLS */
.pl-form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 11px 13px;
}

.pl-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.pl-span-2 {
  grid-column: span 2;
}

.bg-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.bg-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-text-secondary);
}

.bg-req {
  color: var(--sem-rose-txt);
}

.bg-input,
.bg-textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 9px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-primary);
  font-family: inherit;
  font-size: 13px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;
}

.bg-input {
  height: 36px;
  padding: 0 11px;
}

.bg-input-sm {
  height: 32px;
  font-size: 12px;
}

.bg-textarea {
  padding: 8px 11px;
  resize: vertical;
}

.bg-input:focus,
.bg-textarea:focus {
  border-color: var(--sem-sky-bdr);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.14);
}

/* UNIFIED INPUT-WITH-PICKER SHELL (INLINE "CHỌN" BUTTON INSIDE INPUT) */
.pl-input-with-picker {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

.pl-input-with-picker .bg-input.has-inline-picker {
  padding-right: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-input-with-picker.has-clear-btn .bg-input.has-inline-picker {
  padding-right: 88px;
}

.pl-input-with-picker .bg-input.is-clickable-picker {
  cursor: pointer;
}

.pl-input-with-picker:hover .bg-input {
  border-color: var(--sem-sky-bdr);
}

.pl-inline-clear-btn {
  position: absolute;
  right: 58px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  padding: 0;
  margin: 0;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--bg-text-muted);
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.pl-inline-clear-btn:hover {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
}

.pl-inline-picker-btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: auto !important;
  height: 26px;
  padding: 0 10px;
  margin: 0;
  border-radius: 6px;
  border: 1px solid var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.01em;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pl-inline-picker-btn:hover,
.pl-input-with-picker:hover .pl-inline-picker-btn {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pl-linked-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.pl-picker-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-picker-select-btn {
  width: auto !important;
  height: 27px;
  padding: 0 11px;
  margin: 0;
  border-radius: 7px;
  border: 1px solid var(--sem-sky-bdr);
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pl-picker-select-btn:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pl-picker-select-btn.is-selected {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bdr);
  color: var(--sem-emerald-txt);
}

/* PROJECT ORCHESTRATOR DETAIL MODAL */
.pl-modal-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.pl-modal-kpi-box {
  padding: 11px 13px;
  border-radius: 11px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  border-left: 4px solid #64748b;
}

.pl-modal-kpi-box.is-sky {
  border-left-color: #0ea5e9;
}

.pl-modal-kpi-box.is-amber {
  border-left-color: #f59e0b;
}

.pl-modal-kpi-box.is-emerald {
  border-left-color: #10b981;
}

.pl-kpi-lbl {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--bg-text-muted);
}

.pl-kpi-val {
  font-size: 18px;
  font-weight: 900;
  color: var(--bg-text-primary);
  margin: 3px 0 2px;
}

.pl-kpi-sub {
  font-size: 11px;
  color: var(--bg-text-faint);
}

.pl-proj-detail-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.pl-attach-drawer {
  padding: 12px;
  border-radius: 11px;
  background: var(--bg-surface-2);
  border: 1px solid var(--sem-sky-bdr);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pl-manage-wf-drawer {
  padding: 12px;
  border-radius: 11px;
  background: var(--bg-surface-2);
  border: 1px solid var(--sem-sky-bdr);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pl-manage-wf-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-mini-cus-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 5px;
  background: var(--sem-amber-bg);
  color: var(--sem-amber-txt);
  border: 1px solid var(--sem-amber-bdr);
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
}

.pl-mini-rep-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 5px;
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border: 1px solid var(--sem-sky-bdr);
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.pl-wf-board-deal-cus {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--bg-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.pl-hub-parent-pipe {
  font-size: 11.5px;
  color: var(--sem-amber-txt);
  margin-top: 2px;
}

.pl-proj-context-note {
  padding: 9px 12px;
  border-radius: 9px;
  background: var(--bg-input-well);
  border: 1px dashed var(--sem-sky-bdr);
  color: var(--bg-text-secondary);
  font-size: 12px;
}

.pl-attach-head {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-attach-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pl-attach-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
}

.pl-attach-title {
  font-weight: 700;
  font-size: 12.5px;
}

.pl-attach-meta {
  font-size: 11px;
  color: var(--bg-text-muted);
}

.pl-multi-pipe-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pl-pipe-track-card {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pl-pipe-track-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.pl-pipe-track-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.pl-pipe-track-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-pipe-track-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

.pl-pipe-track-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pl-pipe-vol-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 6px;
}

.pl-pipe-vol-box strong {
  font-size: 13.5px;
  color: var(--sem-emerald-txt);
}

.pl-stepper-row {
  display: flex;
  align-items: stretch;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.pl-stepper-pill {
  flex: 1 0 105px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-input-well);
  color: var(--bg-text-muted);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.pl-stepper-pill:hover {
  border-color: var(--sem-sky-bdr);
  color: var(--bg-text-primary);
}

.pl-stepper-pill.is-passed {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bdr);
  color: var(--sem-emerald-txt);
}

.pl-stepper-pill.is-current {
  background: var(--theme-sky-header-grad);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.28);
}

.pl-stepper-pill.is-terminal-ok.is-current {
  background: var(--theme-cta-grad);
}

.pl-stepper-pill.is-terminal-fail.is-current {
  background: linear-gradient(135deg, #e11d48, #ef4444);
}

.pl-stepper-pct {
  font-size: 10.5px;
  font-weight: 800;
}

.pl-stepper-lbl {
  font-size: 11px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.pl-project-hub-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.pl-hub-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--bg-border-subtle);
}

.pl-hub-item:last-child {
  border-bottom: none;
}

.pl-hub-sub {
  font-size: 11px;
  color: var(--bg-text-muted);
}

/* LINKED CHIPS, PICKER LISTS & SCAN VOLUME */
.pl-linked-box {
  min-height: 42px;
  padding: 7px;
  border-radius: 9px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pl-linked-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 7px;
  background: var(--sem-sky-bg);
  border: 1px solid var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
  font-size: 11.5px;
  font-weight: 700;
}

.pl-linked-chip button {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  padding: 0;
}

.pl-uploaded-files {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pl-uploaded-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
}

.pl-picker-list {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pl-picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 9px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  cursor: pointer;
}

.pl-picker-row:hover {
  border-color: var(--sem-sky-bdr);
  background: var(--bg-surface-3);
}

.pl-picker-row.is-selected {
  border-color: var(--sem-emerald-bdr);
  background: var(--sem-emerald-bg);
}

.pl-picker-row-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--bg-text-primary);
}

.pl-picker-row-sub {
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

/* REPORT PICKER MODAL & NGÀY / THÁNG / NĂM FILTER BAR */
.pl-rep-picker-toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.pl-rep-date-filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 10px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
}

.pl-rep-date-lbl {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--bg-text-muted);
  white-space: nowrap;
  margin-right: 2px;
}

.pl-rep-date-select,
.pl-rep-date-quick {
  height: 31px;
  padding: 0 9px;
  border-radius: 7px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-surface-2);
  color: var(--bg-text-primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.pl-rep-date-select option {
  background: var(--option-bg);
  color: var(--option-txt);
}

.pl-rep-date-select:focus,
.pl-rep-date-quick:focus {
  border-color: var(--sem-sky-bdr);
}

.pl-rep-date-reset {
  width: auto;
  margin: 0 0 0 auto;
  height: 31px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--sem-rose-bdr);
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.14s ease;
}

.pl-rep-date-reset:hover {
  background: #e11d48;
  border-color: #e11d48;
  color: #ffffff;
}

.pl-rep-picker-list {
  max-height: 430px;
}

.pl-picker-row.pl-rep-picker-card {
  align-items: stretch;
  padding: 11px 13px;
  border-radius: 11px;
}

.pl-rep-picker-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.pl-rep-picker-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.pl-rep-picker-top .pl-picker-row-title {
  flex: 1 1 0%;
  min-width: 0;
  line-height: 1.42;
  word-break: break-word;
}

.pl-rep-picker-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.pl-rep-picker-note {
  font-size: 12px;
  color: var(--bg-text-secondary);
  line-height: 1.42;
  word-break: break-word;
}

.scan-confirm-body {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.scan-confirm-preview {
  flex: 1 1 320px;
  max-height: 360px;
  overflow: auto;
  padding: 10px;
  border-radius: 10px;
  background: var(--bg-input-well);
  border: 1px solid var(--bg-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scan-confirm-file-head {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.scan-confirm-file-name {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--bg-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.scan-confirm-controls {
  flex: 1 1 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  min-width: 0;
}

.scan-confirm-msg {
  margin: 0;
  padding: 9px 11px;
  border-radius: 9px;
  font-size: 12px;
  line-height: 1.45;
  background: var(--sem-amber-bg);
  border: 1px solid var(--sem-amber-bdr);
  color: var(--sem-amber-txt);
}

.scan-confirm-attach-opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-input-well);
  border: 1.5px solid var(--bg-border-strong);
  cursor: pointer;
  user-select: none;
  transition: background 0.16s ease, border-color 0.16s ease;
}

.scan-confirm-attach-opt:hover {
  border-color: var(--sem-sky-bdr);
}

.scan-confirm-attach-opt.is-checked {
  background: var(--sem-emerald-bg);
  border-color: var(--sem-emerald-bdr);
}

.scan-confirm-attach-chk {
  width: 16px;
  height: 16px;
  margin: 2px 0 0;
  accent-color: #10b981;
  cursor: pointer;
  flex-shrink: 0;
}

.scan-confirm-attach-copy {
  display: flex;
  flex-direction: column;
  gap: 2.5px;
  min-width: 0;
}

.scan-confirm-attach-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
  line-height: 1.35;
}

.scan-confirm-attach-opt.is-checked .scan-confirm-attach-title {
  color: var(--sem-emerald-txt);
}

.scan-confirm-attach-sub {
  font-size: 11.2px;
  line-height: 1.38;
  color: var(--bg-text-secondary);
}

/* =========================================================
   LIGHTBOX, 3-TIER BAOGIA DIALOG & TOP-CENTER SMART TOAST
   ========================================================= */
.pl-lightbox {
  position: fixed;
  inset: 0;
  z-index: 100110;
  background: rgba(2, 6, 23, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: zoom-out;
}

.pl-lightbox-img {
  max-width: 92vw;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65);
}

.pl-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 100120;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.pl-dialog-overlay.theme-light-blue {
  background: rgba(15, 23, 42, 0.42);
}

.pl-dialog-card {
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-strong);
  box-shadow: var(--bg-shadow-modal);
  color: var(--bg-text-primary);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.pl-dialog-head {
  display: flex;
  align-items: center;
  gap: 11px;
}

.pl-dialog-badge {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pl-dialog-badge.tone-danger {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
  border: 1px solid var(--sem-rose-bdr);
}

.pl-dialog-badge.tone-success {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
  border: 1px solid var(--sem-emerald-bdr);
}

.pl-dialog-badge.tone-info {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border: 1px solid var(--sem-sky-bdr);
}

.pl-dialog-title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-dialog-target-box {
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pl-dialog-target-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--bg-text-muted);
}

.pl-dialog-target-val {
  font-size: 13px;
  font-weight: 800;
  color: var(--bg-text-primary);
}

.pl-dialog-msg-box {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-input-well);
  border-left: 3px solid var(--sem-sky-txt);
  font-size: 12.5px;
  color: var(--bg-text-secondary);
  line-height: 1.5;
}

.pl-dialog-msg-box.tone-danger {
  border-left-color: #ef4444;
}

.pl-dialog-msg-box.tone-success {
  border-left-color: #10b981;
}

.pl-dialog-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* TOP-CENTER SMART TOAST */
.smart-toast-wrap {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100130;
  pointer-events: none;
}

.pl-smart-toast {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 16px;
  border-radius: 999px;
  background: var(--bg-surface-2);
  border: 1px solid var(--bg-border-strong);
  box-shadow: var(--bg-shadow-modal);
  color: var(--bg-text-primary);
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
}

.pl-smart-toast.is-success {
  border-color: var(--sem-emerald-bdr);
}

.pl-smart-toast.is-warning {
  border-color: var(--sem-amber-bdr);
}

.pl-smart-toast.is-error {
  border-color: var(--sem-rose-bdr);
}

.pl-toast-ic {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
}

.pl-smart-toast.is-warning .pl-toast-ic {
  background: var(--sem-amber-bg);
  color: var(--sem-amber-txt);
}

.pl-smart-toast.is-error .pl-toast-ic {
  background: var(--sem-rose-bg);
  color: var(--sem-rose-txt);
}

.pl-smart-toast.is-info .pl-toast-ic {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
}

.pl-toast-fade-enter-active,
.pl-toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.pl-toast-fade-enter-from,
.pl-toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.pl-drag-tooltip {
  position: fixed;
  z-index: 100070;
  pointer-events: none;
  transform: translate(14px, 14px);
  padding: 5px 10px;
  border-radius: 8px;
  background: var(--bg-surface-2);
  border: 1px solid var(--sem-sky-bdr);
  color: var(--sem-sky-txt);
  font-size: 11.5px;
  font-weight: 800;
  box-shadow: var(--bg-shadow-card);
}

/* SPINNERS */
.pl-spinner-xs {
  width: 13px;
  height: 13px;
  border-radius: 999px;
  border: 2px solid rgba(148, 163, 184, 0.35);
  border-top-color: currentColor;
  animation: plSpin 0.7s linear infinite;
}

.pl-spinner-lg {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 3px solid var(--bg-border-subtle);
  border-top-color: var(--sem-sky-txt);
  animation: plSpin 0.75s linear infinite;
}

@keyframes plSpin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   EXPANDED PIPELINE FILES VAULT MODAL (2-SOURCE VIEW)
   ========================================================= */
.pl-modal-card.pl-modal-xl.pl-vault-modal-card {
  width: min(1160px, 96vw);
  max-width: 1160px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.pl-vault-modal-head {
  gap: 12px;
}

.pl-vault-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.pl-vault-head-ic {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--theme-pri-header-grad);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pl-vault-head-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pl-vault-head-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

.pl-vault-head-sub strong {
  color: var(--bg-text-primary);
}

.pl-vault-modal-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  flex: 1 1 auto;
  min-height: 0;
}

.pl-vault-modal-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.pl-vault-search {
  flex: 1 1 260px;
}

.pl-vault-modal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.pl-vault-modal-grid.is-single-col {
  grid-template-columns: minmax(0, 1fr);
}

.pl-vault-col {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid var(--bg-border-subtle);
  background: var(--bg-input-well);
  min-height: 0;
  overflow: hidden;
}

.pl-vault-col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--bg-border-subtle);
  background: var(--bg-surface-2);
  flex-shrink: 0;
}

.pl-vault-col-head.is-report {
  border-top: 3px solid #10b981;
}

.pl-vault-col-head.is-direct {
  border-top: 3px solid #0ea5e9;
}

.pl-vault-col-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: var(--bg-text-primary);
}

.pl-vault-col-head.is-report .pl-vault-col-title svg {
  color: var(--sem-emerald-txt);
}

.pl-vault-col-head.is-direct .pl-vault-col-title svg {
  color: var(--sem-sky-txt);
}

.pl-vault-col-empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 12px;
  color: var(--bg-text-muted);
}

.pl-vault-col-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 180px;
  max-height: 55vh;
}

.pl-vault-fcard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 9px 11px;
  border-radius: 10px;
  background: var(--bg-surface-1);
  border: 1px solid var(--bg-border-subtle);
  transition: border-color 0.14s ease, box-shadow 0.14s ease;
}

.pl-vault-fcard:hover {
  border-color: var(--sem-sky-bdr);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.1);
}

.pl-vault-fcard-top {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  min-width: 0;
}

.pl-vault-fname {
  flex: 1 1 0%;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  text-align: left;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--bg-text-primary);
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.pl-vault-fname:hover {
  color: var(--sem-sky-txt);
  text-decoration: underline;
}

.pl-vault-fcard-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 24px;
  min-width: 0;
}

.pl-vault-meta-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 11.5px;
  color: var(--bg-text-secondary);
  min-width: 0;
}

.pl-vault-meta-tag {
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

.pl-vault-meta-tag.is-pipe {
  background: var(--sem-sky-bg);
  color: var(--sem-sky-txt);
  border: 1px solid var(--sem-sky-bdr);
}

.pl-vault-meta-tag.is-rep {
  background: var(--sem-emerald-bg);
  color: var(--sem-emerald-txt);
  border: 1px solid var(--sem-emerald-bdr);
}

.pl-vault-meta-txt {
  min-width: 0;
  white-space: normal;
  word-break: break-word;
}

.pl-vault-extra-cnt {
  color: var(--sem-amber-txt);
  font-weight: 700;
  margin-left: 4px;
}

.pl-vault-factions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-left: 24px;
  padding-top: 2px;
}

.pl-vault-modal-foot {
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.pl-vault-foot-hint {
  font-size: 11.5px;
  color: var(--bg-text-muted);
}

/* =========================================================
   RESPONSIVE BREAKPOINTS (DESKTOP / TABLET / MOBILE SHEET)
   ========================================================= */
@media (max-width: 1240px) {
  .bg-bento-deck.is-kanban-compact-deck {
    grid-template-columns: minmax(0, 1fr);
  }
  .bg-filter-strip.is-kanban-filter-panel,
  .pl-pipe-files-vault.is-taller-vault {
    max-height: none;
  }
}

@media (max-width: 1160px) {
  .bg-bento-deck,
  .bg-bento-deck.is-kanban-spacious-deck {
    grid-template-columns: minmax(0, 1fr);
  }
  .bg-filter-strip.is-kanban-filter-panel {
    min-height: 0;
    padding: 6px 2px 4px;
  }
  .pl-kanban-control-bar {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }
  .pl-kcb-center {
    grid-column: 1 / -1;
    max-width: none;
    height: auto;
  }
  .bg-search-shell.is-control-bar-search,
  .bg-search-shell.is-control-bar-search:focus-within {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    width: 100%;
  }
  .bg-search-shell.is-control-bar-search:focus-within {
    height: 44px;
    padding: 0 14px;
  }
  .pl-kcb-left,
  .pl-kcb-right {
    flex-wrap: wrap;
  }
  .pl-dropdown-menu.is-align-right {
    left: 0;
    right: auto;
  }
  .pl-modal-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .pl-projects-split-workspace {
    grid-template-columns: minmax(0, 6fr) minmax(320px, 4fr);
  }
}

@media (max-width: 940px) {
  .pl-projects-split-workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .pl-wf-palette-aside {
    position: static;
    max-height: 440px;
  }
  .pl-vault-modal-body {
    overflow-y: auto;
  }
  .pl-vault-modal-grid {
    grid-template-columns: minmax(0, 1fr);
    overflow: visible;
  }
  .pl-vault-col-list {
    max-height: 36vh;
  }
}

@media (max-width: 768px) {
  .pipeline-workspace.page {
    padding: 8px 10px 76px;
  }
  .bg-hide-sm {
    display: none !important;
  }
  .pl-topbar-divider {
    display: none;
  }
  .pl-board-sticky-shell {
    display: none;
  }
  .pl-pipe-files-vault,
  .pl-pipe-files-vault.is-taller-vault {
    max-height: none;
    min-height: 0;
  }
  .bg-filter-strip.is-kanban-filter-panel {
    min-height: 0;
    padding: 4px 0 2px;
  }
  .pl-fp-head-controls {
    margin-left: 0;
  }
  .pl-kanban-control-bar {
    grid-template-columns: minmax(0, 1fr);
  }
  .pl-kcb-left {
    width: 100%;
  }
  .pl-kcb-right {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
  .pl-pfv-file-svg,
  .pl-pfv-file-svg :deep(svg) {
    width: 32px !important;
    height: 32px !important;
  }
  .pl-pfv-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
  .pl-pfv-col.is-direct-col,
  .pl-pipe-files-vault.is-taller-vault .pl-pfv-col.is-direct-col {
    padding-left: 0;
    padding-top: 8px;
    border-left: none;
    border-top: 1px dashed var(--bg-border-subtle);
  }
  .pl-vault-fcard-meta,
  .pl-vault-factions {
    padding-left: 0;
  }
  .bg-kpi-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .pl-projects-grid,
  .pl-wf-board-cols,
  .pl-form-grid-2,
  .pl-project-hub-grid,
  .pl-modal-kpi-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .pl-proj-card-actions .pl-dcard-btn-row {
    flex-wrap: wrap;
  }
  .pl-proj-card-actions .pl-dcard-btn.is-stage {
    flex: 1 1 100%;
  }
  .pl-span-2 {
    grid-column: span 1;
  }
  .kanban-board {
    flex-direction: column;
    min-height: auto;
  }
  .kanban-column,
  .kanban-column.is-collapsed {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: auto;
  }
  .kanban-column.is-collapsed .kanban-col-head {
    flex-direction: row;
    padding: 10px 12px;
  }
  .kanban-column.is-collapsed .kanban-col-title {
    writing-mode: horizontal-tb;
  }
  .pl-modal-overlay {
    align-items: flex-end;
    padding: 0;
  }
  .pl-modal-card {
    border-radius: 18px 18px 0 0;
    max-height: 94vh;
  }
  .pl-modal-card.pl-modal-fullscreen {
    border-radius: 0;
    height: 100vh;
    height: 100dvh;
    max-height: 100dvh;
  }
  .pl-modal-grab {
    display: block;
  }
  .pl-modal-fullscreen .pl-modal-grab {
    display: none;
  }
  .pl-modal-header.is-fullscreen-head,
  .pl-modal-footer.is-fullscreen-foot {
    padding: 12px 14px;
  }
  .pl-modal-body.pl-fullscreen-form-body {
    padding: 12px;
  }
  .pl-modal-card.pl-modal-fullscreen .bg-input,
  .pl-modal-card.pl-modal-fullscreen .bg-textarea,
  .pl-modal-rep-picker .bg-search-inp,
  .pl-rep-date-select,
  .pl-rep-date-quick {
    font-size: 16px;
  }
  .pl-rep-date-select,
  .pl-rep-date-quick {
    flex: 1 1 calc(50% - 6px);
    height: 36px;
  }
  .pl-rep-date-lbl {
    flex: 1 1 100%;
  }
}

/* =========================================================
   CUSTOMER MODAL SUITE (100% ĐỒNG BỘ REPORTFIREBASE: MODULE 4D + 4D-1..4 + 4E)
   ========================================================= */
.pl-cus-suite-overlay {
  --bg-modal-surface: var(--bg-surface-1);
  --bg-text: var(--bg-text-primary);
  --bg-text-sec: var(--bg-text-secondary);
  --bg-border: var(--bg-border-subtle);
  --bg-glass-border: var(--bg-border-strong);
  --bg-soft-pad: var(--bg-input-well);
  --bg-subtle: var(--bg-surface-2);
  --bg-subbar: var(--bg-surface-2);
  --bg-well: var(--bg-input-well);
  --bg-well-border: var(--bg-border-subtle);
  --bg-well-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.14);
  --bg-group-surface: var(--bg-surface-2);
  --bg-group-border: var(--bg-border-subtle);
  --bg-specular: rgba(255, 255, 255, 0.08);
  --bg-specular-strong: rgba(255, 255, 255, 0.14);
  --bg-shadow-pop: var(--bg-shadow-modal);
  --bg-scheme: dark;
  --bg-ease: cubic-bezier(0.2, 0.8, 0.2, 1);

  --theme-pri: #10b981;
  --theme-pri-bright: #34d399;
  --theme-pri-bg: rgba(16, 185, 129, 0.14);
  --theme-pri-bd: rgba(16, 185, 129, 0.34);
  --theme-pri-grad: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --theme-pri-shadow: rgba(16, 185, 129, 0.35);
  --theme-pri-ring: rgba(16, 185, 129, 0.18);

  --sem-sky-bd: var(--sem-sky-bdr);
  --sem-sky-bright: var(--sem-sky-txt);
  --sem-emerald-bd: var(--sem-emerald-bdr);
  --sem-emerald-bright: var(--sem-emerald-txt);
  --sem-amber-bd: var(--sem-amber-bdr);
  --sem-amber-bright: var(--sem-amber-txt);
  --sem-rose-bd: var(--sem-rose-bdr);
  --sem-rose-bright: var(--sem-rose-txt);
  --sem-teal-bg: rgba(20, 184, 166, 0.14);
  --sem-teal-bd: rgba(45, 212, 191, 0.34);
  --sem-teal-bright: #2dd4bf;
}

.pl-cus-suite-overlay.theme-light-blue {
  --bg-scheme: light;
  --bg-well-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
  --bg-specular: rgba(255, 255, 255, 0.8);
  --bg-specular-strong: rgba(255, 255, 255, 0.92);

  --theme-pri: #0284c7;
  --theme-pri-bright: #0284c7;
  --theme-pri-bg: rgba(2, 132, 199, 0.12);
  --theme-pri-bd: rgba(2, 132, 199, 0.32);
  --theme-pri-grad: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  --theme-pri-shadow: rgba(2, 132, 199, 0.32);
  --theme-pri-ring: rgba(2, 132, 199, 0.16);

  --sem-teal-bg: rgba(13, 148, 136, 0.12);
  --sem-teal-bd: rgba(13, 148, 136, 0.3);
  --sem-teal-bright: #0f766e;
}

@keyframes bgModalPop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.pl-cus-suite-overlay .bg-tabular {
  font-variant-numeric: tabular-nums;
}

.pl-cus-suite-overlay .bg-modal-card {
  width: 100%;
  max-height: 92vh;
  background: var(--bg-modal-surface);
  color: var(--bg-text);
  border: 1px solid var(--bg-glass-border);
  border-radius: 22px;
  box-shadow:
    inset 0 1px 0 var(--bg-specular-strong),
    var(--bg-shadow-pop);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color-scheme: var(--bg-scheme);
  animation: bgModalPop 0.22s var(--bg-ease);
}

.pl-cus-suite-overlay .bg-modal-card.is-sm {
  max-width: 440px;
}

.pl-cus-suite-overlay .bg-modal-card.is-md {
  max-width: 740px;
}

.pl-cus-suite-overlay .bg-modal-card.is-lg {
  max-width: 980px;
}

.pl-cus-suite-overlay .m-grab-head-stack {
  display: none;
}

.pl-cus-suite-overlay .bg-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 20px;
  border-bottom: 1px solid var(--bg-border);
  background: rgba(255, 255, 255, 0.02);
  flex-shrink: 0;
}

.pl-cus-suite-overlay .bg-modal-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.pl-cus-suite-overlay .bg-modal-title-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-cus-suite-overlay .bg-modal-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.pl-cus-suite-overlay .bg-modal-icon.is-sky,
.pl-cus-suite-overlay .bg-modal-icon.is-emerald {
  background: var(--theme-pri-bg);
  border: 1px solid var(--theme-pri-bd);
  color: var(--theme-pri-bright);
}

.pl-cus-suite-overlay .bg-modal-icon.is-teal {
  background: var(--sem-teal-bg);
  border: 1px solid var(--sem-teal-bd);
  color: var(--sem-teal-bright);
}

.pl-cus-suite-overlay .bg-modal-icon.is-violet {
  background: rgba(124, 58, 237, 0.16);
  border: 1px solid rgba(139, 92, 246, 0.38);
  color: #a78bfa;
}

.pl-cus-suite-overlay.theme-light-blue .bg-modal-icon.is-violet {
  background: rgba(124, 58, 237, 0.12);
  border-color: rgba(124, 58, 237, 0.3);
  color: #6d28d9;
}

.pl-cus-suite-overlay .bg-modal-title {
  margin: 0 !important;
  font-size: 1.08rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.015em;
  color: var(--bg-text) !important;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pl-cus-suite-overlay .bg-modal-sub {
  margin: 2px 0 0 !important;
  font-size: 0.77rem;
  color: var(--bg-text-muted);
}

.pl-cus-suite-overlay .bg-count-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  background: var(--theme-pri-bg);
  border: 1px solid var(--theme-pri-bd);
  color: var(--theme-pri-bright);
  white-space: nowrap;
}

.pl-cus-suite-overlay .bg-modal-close {
  width: 34px !important;
  height: 34px !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 10px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border);
  color: var(--bg-text-muted);
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.16s ease;
}

.pl-cus-suite-overlay .bg-modal-close:hover {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bd);
  color: var(--sem-rose-bright);
}

.pl-cus-suite-overlay .bg-modal-subbar {
  padding: 10px 20px;
  background: var(--bg-subbar);
  border-bottom: 1px solid var(--bg-border);
  flex-shrink: 0;
}

.pl-cus-suite-overlay .bg-modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.pl-cus-suite-overlay .bg-modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 20px;
  border-top: 1px solid var(--bg-border);
  background: rgba(255, 255, 255, 0.02);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.pl-cus-suite-overlay .bg-foot-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-left: auto;
}

.pl-cus-suite-overlay .bg-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.pl-cus-suite-overlay .bg-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.pl-cus-suite-overlay .modal-group {
  background: var(--bg-group-surface);
  border: 1px solid var(--bg-group-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  box-shadow:
    inset 0 1px 0 var(--bg-specular),
    0 8px 22px -12px rgba(0, 0, 0, 0.35);
}

.pl-cus-suite-overlay .modal-banner-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 15px 15px 0 0;
  color: #ffffff;
}

.pl-cus-suite-overlay .modal-banner-header.is-sky {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    0 4px 14px -4px rgba(14, 165, 233, 0.42);
}

.pl-cus-suite-overlay .modal-banner-header.is-emerald {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    0 4px 14px -4px rgba(16, 185, 129, 0.44);
}

.pl-cus-suite-overlay .modal-banner-header.is-teal {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 4px 14px -4px rgba(13, 148, 136, 0.42);
}

.pl-cus-suite-overlay.theme-light-blue .modal-banner-header.is-sky {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
}

.pl-cus-suite-overlay.theme-light-blue .modal-banner-header.is-emerald {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
}

.pl-cus-suite-overlay.theme-light-blue .modal-banner-header.is-teal {
  background: linear-gradient(135deg, #0284c7 0%, #075985 100%);
}

.pl-cus-suite-overlay .modal-group-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 13px;
  flex: 1;
}

.pl-cus-suite-overlay .bg-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pl-cus-suite-overlay .bg-input {
  height: 37px;
  padding: 0 12px;
  border-radius: 11px;
  font-size: 0.85rem;
}

.pl-cus-suite-overlay .bg-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pl-cus-suite-overlay .bg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 36px;
  padding: 0 15px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.15s ease, filter 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.pl-cus-suite-overlay .bg-btn:disabled {
  opacity: 0.52;
  cursor: not-allowed;
}

.pl-cus-suite-overlay .bg-btn-primary {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  border-color: rgba(125, 211, 252, 0.36);
  color: #ffffff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 6px 16px -4px rgba(2, 132, 199, 0.42);
}

.pl-cus-suite-overlay .bg-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.pl-cus-suite-overlay .bg-btn-emerald {
  background: var(--theme-pri-grad);
  border-color: var(--theme-pri-bd);
  color: #ffffff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.34),
    0 6px 18px -4px var(--theme-pri-shadow);
}

.pl-cus-suite-overlay .bg-btn-emerald:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.pl-cus-suite-overlay .bg-btn-slate {
  background: var(--bg-soft-pad);
  border-color: var(--bg-border-strong);
  color: var(--bg-text-sec);
}

.pl-cus-suite-overlay .bg-btn-slate:hover:not(:disabled) {
  background: var(--bg-subtle);
  color: var(--bg-text);
  border-color: var(--theme-pri-bd);
}

.pl-cus-suite-overlay .bg-btn-xs {
  width: auto !important;
  margin: 0 !important;
  height: 27px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.16s var(--bg-ease);
}

.pl-cus-suite-overlay .bg-btn-xs.is-sky,
.pl-cus-suite-overlay .bg-btn-xs.is-emerald {
  background: var(--theme-pri-bg);
  border-color: var(--theme-pri-bd);
  color: var(--theme-pri-bright);
}

.pl-cus-suite-overlay .bg-btn-xs.is-sky:hover,
.pl-cus-suite-overlay .bg-btn-xs.is-emerald:hover {
  background: var(--theme-pri-grad);
  border-color: transparent;
  color: #ffffff;
}

.pl-cus-suite-overlay .bg-btn-xs.is-rose {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bd);
  color: var(--sem-rose-bright);
}

.pl-cus-suite-overlay .bg-btn-xs.is-rose:hover {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
  border-color: transparent;
  color: #ffffff;
}

.pl-cus-suite-overlay .bg-btn-xs.is-slate {
  background: var(--bg-subtle);
  border-color: var(--bg-border-strong);
  color: var(--bg-text-sec);
}

.pl-cus-suite-overlay .bg-btn-xs.is-slate:hover {
  color: var(--bg-text);
  border-color: var(--theme-pri-bd);
}

.pl-cus-suite-overlay .bg-mini-link {
  width: auto !important;
  margin: 0 !important;
  height: auto !important;
  padding: 2px 7px !important;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
}

.pl-cus-suite-overlay .bg-mini-link.is-sky {
  color: var(--sem-sky-bright);
  background: var(--sem-sky-bg);
  border-color: var(--sem-sky-bd);
}

.pl-cus-suite-overlay .bg-mini-link.is-sky:hover {
  filter: brightness(1.08);
}

.pl-cus-suite-overlay .bg-target-muted {
  font-size: 0.76rem;
  color: var(--bg-text-muted);
}

.pl-cus-suite-overlay .bg-empty-box {
  padding: 28px 16px;
  text-align: center;
  color: var(--bg-text-muted);
  font-size: 0.88rem;
  background: var(--bg-soft-pad);
  border: 1px dashed var(--bg-border-strong);
  border-radius: 13px;
}

.pl-cus-suite-overlay .bg-cus-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.pl-cus-suite-overlay .bg-tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.pl-cus-suite-overlay .bg-tag-toggle {
  width: auto !important;
  margin: 0 !important;
  height: 26px;
  padding: 0 9px;
  border-radius: 7px;
  font-size: 0.73rem;
  font-weight: 700;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border-strong);
  color: var(--bg-text-muted);
  cursor: pointer;
  transition: all 0.14s ease;
}

.pl-cus-suite-overlay .bg-tag-toggle.is-selected {
  background: var(--theme-pri-grad);
  border-color: transparent;
  color: #ffffff;
}

.pl-cus-suite-overlay .bg-inline-add-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pl-cus-suite-overlay .bg-tag-manage-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
}

.pl-cus-suite-overlay .bg-tag-manage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 11px;
  border-radius: 10px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border);
}

.pl-cus-suite-overlay .bg-tag-manage-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--bg-text);
}

/* Smart Import Toolbar & Sub-Modals */
.pl-cus-suite-overlay .cus-import-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.pl-cus-suite-overlay .cus-import-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-cus-suite-overlay .cus-db-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.pl-cus-suite-overlay .cus-db-status-pill.is-existing {
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.pl-cus-suite-overlay .cus-db-status-pill.is-new {
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.pl-cus-suite-overlay.theme-light-blue .cus-db-status-pill.is-existing {
  background: rgba(16, 185, 129, 0.14);
  color: #047857;
}

.pl-cus-suite-overlay.theme-light-blue .cus-db-status-pill.is-new {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.pl-cus-suite-overlay .cus-code-meta-chip {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--bg-text-muted);
  white-space: nowrap;
}

.pl-cus-suite-overlay .cus-code-meta-chip strong.is-sky,
.pl-cus-suite-overlay .cus-tax-pill strong.is-sky {
  color: #38bdf8;
}

.pl-cus-suite-overlay .cus-code-meta-chip strong.is-emerald {
  color: #34d399;
}

.pl-cus-suite-overlay.theme-light-blue .cus-code-meta-chip strong.is-sky,
.pl-cus-suite-overlay.theme-light-blue .cus-tax-pill strong.is-sky {
  color: #0284c7;
}

.pl-cus-suite-overlay.theme-light-blue .cus-code-meta-chip strong.is-emerald {
  color: #059669;
}

.pl-cus-suite-overlay .cus-import-btn-row {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.pl-cus-suite-overlay .cus-quick-import-btn {
  width: auto !important;
  margin: 0 !important;
  padding: 7px 12px !important;
  border-radius: 8px;
  border: none;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: transform 0.14s ease, filter 0.16s ease, box-shadow 0.16s ease;
}

.pl-cus-suite-overlay .cus-quick-import-btn:hover {
  filter: brightness(1.07);
  transform: translateY(-1px);
}

.pl-cus-suite-overlay .cus-quick-import-btn:active {
  transform: translateY(0);
}

.pl-cus-suite-overlay .cus-quick-import-btn.is-dxmh {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.28);
}

.pl-cus-suite-overlay .cus-quick-import-btn.is-baogia {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  box-shadow: 0 3px 10px rgba(124, 58, 237, 0.28);
}

.pl-cus-suite-overlay .cus-quick-import-btn.is-tax {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  box-shadow: 0 3px 10px rgba(14, 165, 233, 0.28);
}

.pl-cus-suite-overlay .cus-quick-import-btn.is-reset {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.25);
}

.pl-cus-suite-overlay .cus-quick-import-btn .mb-lbl {
  display: none;
}

.pl-cus-suite-overlay .cus-smart-upload-card {
  max-width: 650px;
}

.pl-cus-suite-overlay .cus-mob-eyebrow {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--theme-pri-bright);
  margin-bottom: 2px;
}

.pl-cus-suite-overlay .cus-smart-upload-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pl-cus-suite-overlay .cus-smart-dropzone {
  border: 2px dashed rgba(56, 189, 248, 0.36);
  background: rgba(14, 165, 233, 0.05);
  border-radius: 14px;
  padding: 24px 18px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.18s ease;
}

.pl-cus-suite-overlay .cus-smart-dropzone.is-compact {
  padding: 16px 14px;
}

.pl-cus-suite-overlay .cus-smart-dropzone:hover,
.pl-cus-suite-overlay .cus-smart-dropzone.is-dragging {
  border-color: #38bdf8;
  background: rgba(14, 165, 233, 0.11);
}

.pl-cus-suite-overlay.theme-light-blue .cus-smart-dropzone {
  border-color: rgba(2, 132, 199, 0.34);
  background: rgba(2, 132, 199, 0.04);
}

.pl-cus-suite-overlay.theme-light-blue .cus-smart-dropzone:hover,
.pl-cus-suite-overlay.theme-light-blue .cus-smart-dropzone.is-dragging {
  border-color: #0284c7;
  background: rgba(2, 132, 199, 0.09);
}

.pl-cus-suite-overlay .cus-smart-drop-icon {
  width: 48px;
  height: 48px;
  border-radius: 13px;
  background: var(--theme-pri-bg);
  border: 1px solid var(--theme-pri-bd);
  color: var(--theme-pri-bright);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pl-cus-suite-overlay .cus-smart-drop-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--bg-text);
  line-height: 1.4;
}

.pl-cus-suite-overlay .cus-smart-drop-title kbd {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 800;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border);
  color: var(--theme-pri-bright);
}

.pl-cus-suite-overlay .cus-smart-drop-sub {
  font-size: 0.76rem;
  color: var(--bg-text-muted);
  max-width: 500px;
  line-height: 1.4;
}

.pl-cus-suite-overlay .cus-smart-drop-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.pl-cus-suite-overlay .cus-smart-mob-picker {
  display: none;
  flex-direction: column;
  gap: 8px;
}

.pl-cus-suite-overlay .cus-smart-mob-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.pl-cus-suite-overlay .cus-smart-mob-btn,
.pl-cus-suite-overlay .cus-smart-mob-paste-btn {
  width: 100% !important;
  justify-content: center;
}

.pl-cus-suite-overlay .cus-tax-sample-box {
  border: 1px solid var(--bg-border);
  background: var(--bg-soft-pad);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pl-cus-suite-overlay .cus-tax-sample-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--bg-text);
}

.pl-cus-suite-overlay .cus-zoom-mini-btn {
  width: auto !important;
  margin: 0 !important;
  padding: 5px 10px !important;
  border-radius: 7px;
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border);
  color: var(--theme-pri-bright);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.pl-cus-suite-overlay .cus-zoom-mini-btn:hover {
  border-color: var(--theme-pri-bd);
  background: var(--theme-pri-bg);
}

.pl-cus-suite-overlay .cus-tax-sample-frame {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--bg-border);
  background: rgba(0, 0, 0, 0.18);
  max-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
}

.pl-cus-suite-overlay.theme-light-blue .cus-tax-sample-frame {
  background: rgba(15, 23, 42, 0.04);
}

.pl-cus-suite-overlay .cus-tax-sample-frame img {
  max-width: 100%;
  max-height: 216px;
  object-fit: contain;
  display: block;
}

.pl-cus-suite-overlay .cus-staged-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pl-cus-suite-overlay .cus-staged-head {
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--bg-text-muted);
}

.pl-cus-suite-overlay .cus-staged-card {
  border: 1px solid var(--theme-pri-bd);
  background: var(--bg-soft-pad);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pl-cus-suite-overlay .cus-staged-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pl-cus-suite-overlay .cus-staged-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-cus-suite-overlay .cus-staged-type-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--theme-pri-bg);
  color: var(--theme-pri-bright);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pl-cus-suite-overlay .cus-staged-ext {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  background: var(--theme-pri-bg);
  border: 1px solid var(--theme-pri-bd);
  color: var(--theme-pri-bright);
}

.pl-cus-suite-overlay .cus-staged-size {
  font-size: 0.74rem;
  color: var(--bg-text-muted);
}

.pl-cus-suite-overlay .cus-staged-clip {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
}

.pl-cus-suite-overlay.theme-light-blue .cus-staged-clip {
  color: #047857;
}

.pl-cus-suite-overlay .cus-staged-remove-btn {
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 8px;
  border: 1px solid var(--bg-border);
  background: transparent;
  color: var(--bg-text-muted);
  cursor: pointer;
  flex-shrink: 0;
}

.pl-cus-suite-overlay .cus-staged-remove-btn:hover {
  background: var(--sem-rose-bg);
  border-color: var(--sem-rose-bd);
  color: var(--sem-rose-bright);
}

/* Tax Confirmation Modal */
.pl-cus-suite-overlay .cus-tax-subbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.pl-cus-suite-overlay .cus-tax-subbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.pl-cus-suite-overlay .cus-tax-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.74rem;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border);
  color: var(--bg-text);
  max-width: 100%;
}

.pl-cus-suite-overlay .cus-tax-pill-lbl {
  color: var(--bg-text-muted);
}

.pl-cus-suite-overlay .cus-tax-pill-name {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pl-cus-suite-overlay .cus-tax-split-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 16px;
  align-items: start;
}

.pl-cus-suite-overlay .cus-tax-form-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.pl-cus-suite-overlay .cus-tax-textarea {
  height: auto !important;
  padding: 9px 12px !important;
  resize: vertical;
  min-height: 54px;
  line-height: 1.45;
}

.pl-cus-suite-overlay .bg-label.is-sky-accent {
  color: var(--theme-pri-bright) !important;
}

.pl-cus-suite-overlay .cus-tax-textarea.is-sky-accent {
  border-color: var(--theme-pri-bd);
}

.pl-cus-suite-overlay .cus-tax-preview-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.pl-cus-suite-overlay .cus-tax-img-frame {
  border-radius: 12px;
  border: 1px solid var(--bg-border);
  background: rgba(0, 0, 0, 0.2);
  padding: 8px;
  min-height: 260px;
  max-height: 410px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: zoom-in;
}

.pl-cus-suite-overlay.theme-light-blue .cus-tax-img-frame {
  background: rgba(15, 23, 42, 0.04);
}

.pl-cus-suite-overlay .cus-tax-img-frame img {
  max-width: 100%;
  max-height: 390px;
  object-fit: contain;
  border-radius: 8px;
}

.pl-cus-suite-overlay .cus-tax-doc-card {
  border: 1px dashed var(--bg-border);
  background: var(--bg-soft-pad);
  border-radius: 12px;
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.pl-cus-suite-overlay .cus-tax-doc-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--theme-pri-bg);
  border: 1px solid var(--theme-pri-bd);
  color: var(--theme-pri-bright);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pl-cus-suite-overlay .cus-tax-doc-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--bg-text);
  word-break: break-word;
}

.pl-cus-suite-overlay .cus-tax-doc-meta {
  font-size: 0.74rem;
  color: var(--bg-text-muted);
}

/* AI Fallback & Scanning Progress */
.pl-cus-suite-overlay .cus-ai-fallback-card {
  max-width: 500px;
}

.pl-cus-suite-overlay .cus-ai-fallback-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pl-cus-suite-overlay .cus-ai-file-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 11px;
  border-radius: 9px;
  background: var(--bg-soft-pad);
  border: 1px solid var(--bg-border);
  font-size: 0.78rem;
  color: var(--bg-text);
  word-break: break-word;
}

.pl-cus-suite-overlay .cus-ai-reason-text {
  margin: 0;
  padding: 10px 12px;
  border-radius: 9px;
  background: var(--sem-amber-bg);
  border: 1px solid var(--sem-amber-bd);
  color: var(--sem-amber-bright);
  font-size: 0.8rem;
  line-height: 1.45;
}

.pl-cus-suite-overlay .cus-ai-hint-text {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--bg-text-muted);
}

.pl-cus-suite-overlay .cus-scanning-card {
  max-width: 400px;
  padding: 26px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.pl-cus-suite-overlay .cus-scanning-spinner {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 3px solid var(--bg-border);
  border-top-color: var(--theme-pri-bright);
  animation: cusSpinAnim 0.8s linear infinite;
}

@keyframes cusSpinAnim {
  to {
    transform: rotate(360deg);
  }
}

.pl-cus-suite-overlay .cus-scanning-title {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 800;
  color: var(--bg-text);
}

.pl-cus-suite-overlay .cus-scanning-msg {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--bg-text-muted);
}

@media (max-width: 768px) {
  .pl-cus-suite-overlay .dt-only-head {
    display: none !important;
  }

  .pl-cus-suite-overlay .m-grab-head-stack {
    display: block;
    padding: 10px 14px 12px;
    border-bottom: 1px solid var(--bg-border);
    background: var(--bg-subbar);
    flex-shrink: 0;
  }

  .pl-cus-suite-overlay .m-grab-pill {
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: var(--bg-border-strong);
    margin: 0 auto 8px;
  }

  .pl-cus-suite-overlay .m-grab-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .pl-cus-suite-overlay .m-grab-title {
    margin: 0 !important;
    font-size: 0.98rem !important;
    font-weight: 800 !important;
    color: var(--bg-text) !important;
  }

  .pl-cus-suite-overlay .bg-modal-card.is-mobile-sheet {
    border-radius: 20px 20px 0 0;
    max-height: 94dvh;
  }

  .pl-cus-suite-overlay .bg-grid-2,
  .pl-cus-suite-overlay .bg-grid-3 {
    grid-template-columns: minmax(0, 1fr);
  }

  .pl-cus-suite-overlay .bg-modal-body {
    padding: 12px 14px;
  }

  .pl-cus-suite-overlay .bg-modal-foot {
    padding: 12px 14px;
  }

  .pl-cus-suite-overlay .bg-input {
    font-size: 16px;
  }

  .pl-cus-suite-overlay .cus-import-toolbar {
    padding: 10px 14px;
    gap: 8px;
  }

  .pl-cus-suite-overlay .cus-quick-import-btn {
    padding: 7px 10px !important;
    font-size: 0.68rem;
  }

  .pl-cus-suite-overlay .cus-quick-import-btn .dt-lbl {
    display: none;
  }

  .pl-cus-suite-overlay .cus-quick-import-btn .mb-lbl {
    display: inline;
  }

  .pl-cus-suite-overlay .cus-smart-dropzone {
    display: none;
  }

  .pl-cus-suite-overlay .cus-smart-mob-picker {
    display: flex;
  }

  .pl-cus-suite-overlay .cus-tax-split-grid {
    grid-template-columns: 1fr;
  }

  .pl-cus-suite-overlay .cus-tax-img-frame {
    min-height: 180px;
    max-height: 260px;
  }
}
</style>
