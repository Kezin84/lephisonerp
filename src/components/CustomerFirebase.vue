<template>
  <div
    class="customer-page page"
    :class="{
      'theme-light-blue': uiTheme === 'light',
      'theme-custom-glass': uiTheme === 'custom',
      'is-mobile-shell': isMobileViewport
    }"
    :style="uiTheme === 'custom' ? customGlassStyleVars : null"
  >
    <!-- Hidden File Inputs for Multi-Import -->
    <input
      type="file"
      ref="fileInput"
      @change="handleFileUpload"
      accept=".xlsx, .xls"
      multiple
      style="display: none"
    />
    <input
      type="file"
      ref="quoteFileInput"
      @change="handleQuoteFileUpload"
      accept=".xlsx, .xls, .pdf"
      multiple
      style="display: none"
    />

    <!-- Teleported Glassify Tuner Popover -->
    <Teleport to="body">
      <div
        v-if="uiTheme === 'custom' && showCustomGlassTuner"
        class="cf-tuner-backdrop"
        @click="showCustomGlassTuner = false"
      ></div>
      <div
        v-if="uiTheme === 'custom' && showCustomGlassTuner"
        class="cf-glass-tuner"
        :style="[customGlassStyleVars, tunerPopoverPos]"
        @click.stop
      >
        <div class="cf-tuner-head">
          <div class="cf-tuner-title">
            <i class="ri-sparkling-2-line"></i>
            <span>Tùy chỉnh Kính mờ (Glassify)</span>
          </div>
          <div class="cf-tuner-head-acts">
            <button type="button" class="cf-tuner-reset" @click="resetCustomGlassConfig">Mặc định</button>
            <button type="button" class="cf-tuner-close" @click="showCustomGlassTuner = false">✕</button>
          </div>
        </div>

        <div class="cf-tuner-presets">
          <button
            type="button"
            :class="{ active: activeGlassPreset === 'ios_frost' }"
            @click="applyGlassPreset('ios_frost')"
          >
            iOS Frost
          </button>
          <button
            type="button"
            :class="{ active: activeGlassPreset === 'ocean_dark' }"
            @click="applyGlassPreset('ocean_dark')"
          >
            Ocean Dark
          </button>
          <button
            type="button"
            :class="{ active: activeGlassPreset === 'crystal_clear' }"
            @click="applyGlassPreset('crystal_clear')"
          >
            Crystal
          </button>
        </div>

        <div class="cf-tuner-sliders">
          <div class="cf-slider-row">
            <div class="cf-slider-lbl">
              <span>Độ sáng kính</span>
              <strong class="tabular-nums">{{ customGlassConfig.brightness }}%</strong>
            </div>
            <input type="range" min="0" max="85" v-model.number="customGlassConfig.brightness" />
          </div>
          <div class="cf-slider-row">
            <div class="cf-slider-lbl">
              <span>Độ đục (Opacity)</span>
              <strong class="tabular-nums">{{ customGlassConfig.opacity }}%</strong>
            </div>
            <input type="range" min="12" max="86" v-model.number="customGlassConfig.opacity" />
          </div>
          <div class="cf-slider-row">
            <div class="cf-slider-lbl">
              <span>Độ nhòe (Blur)</span>
              <strong class="tabular-nums">{{ customGlassConfig.blur }}px</strong>
            </div>
            <input type="range" min="0" max="36" v-model.number="customGlassConfig.blur" />
          </div>
          <div class="cf-slider-row">
            <div class="cf-slider-lbl">
              <span>Độ dịu ảnh nền</span>
              <strong class="tabular-nums">{{ customGlassConfig.dim }}%</strong>
            </div>
            <input type="range" min="0" max="75" v-model.number="customGlassConfig.dim" />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ================== 2. 3-CARD SUPER BENTO KPI GRID ================== -->
    <section
      class="sr-super-bento-grid"
      aria-label="Tổng quan tệp khách hàng"
    >
      <!-- KPI 1: QUY MÔ TỆP KHÁCH HÀNG (Blue Gradient) -->
      <article class="sr-sb-card sb-card-revenue">
        <div class="sr-sb-head">
          <div class="sr-sb-title-cluster">
            <span class="sr-sb-icon">
              <i class="ri-building-2-line"></i>
            </span>
            <h3 class="sr-sb-title">Quy mô tệp khách hàng</h3>
          </div>
        </div>

        <div class="sr-sb-main">
          <div class="sr-sb-hero-val tabular-nums">
            {{ customers.length }}
            <span class="sr-sb-unit">KH</span>
          </div>
          <span class="sr-sb-po-badge tabular-nums">{{ uniqueCompanyCount }} Công ty</span>
        </div>

        <div class="sr-sb-foot">
          <div
            class="sr-sb-foot-row"
            :class="{ 'is-active': filters.tagKH === '__tagged__' }"
            @click="toggleKpiFilter('tagKH', '__tagged__')"
            title="Lọc khách hàng đã gán nhóm"
          >
            <span class="sr-sb-foot-label">Đã phân nhóm</span>
            <strong class="sr-sb-foot-val tabular-nums">{{ taggedCustomerCount }} <small>KH</small></strong>
          </div>
          <div
            class="sr-sb-foot-row"
            :class="{ 'is-active': filters.tagKH === '__untagged__' }"
            @click="toggleKpiFilter('tagKH', '__untagged__')"
            title="Lọc khách hàng chưa phân nhóm"
          >
            <span class="sr-sb-foot-label">Chưa phân nhóm</span>
            <strong class="sr-sb-foot-val tabular-nums">{{ untaggedCustomerCount }} <small>KH</small></strong>
          </div>
        </div>
      </article>

      <!-- KPI 2: TÍN HIỆU BÁO GIÁ & DEAL (Emerald Gradient) -->
      <article class="sr-sb-card sb-card-com">
        <div class="sr-sb-head">
          <div class="sr-sb-title-cluster">
            <span class="sr-sb-icon">
              <i class="ri-file-check-line"></i>
            </span>
            <h3 class="sr-sb-title">Tín hiệu Báo Giá &amp; Deal</h3>
          </div>
        </div>

        <div class="sr-sb-main">
          <div class="sr-sb-hero-val tabular-nums">
            {{ closedDealCustomerCount }}
            <span class="sr-sb-unit">KH chốt</span>
          </div>
          <span class="sr-sb-po-badge tabular-nums">{{ totalClosedContractsCount }} BG</span>
        </div>

        <div class="sr-sb-foot">
          <div
            class="sr-sb-foot-row"
            :class="{ 'is-active': filters.quoteSignal === 'closed' }"
            @click="toggleKpiFilter('quoteSignal', 'closed')"
            title="Lọc khách hàng có báo giá đã chốt"
          >
            <span class="sr-sb-foot-label">Báo giá đã chốt</span>
            <strong class="sr-sb-foot-val tabular-nums">{{ closedDealCustomerCount }} <small>KH</small></strong>
          </div>
          <div
            class="sr-sb-foot-row"
            :class="{ 'is-active': filters.quoteSignal === 'processing' }"
            @click="toggleKpiFilter('quoteSignal', 'processing')"
            title="Lọc khách hàng có báo giá đang xử lý"
          >
            <span class="sr-sb-foot-label">Đang xử lý</span>
            <strong class="sr-sb-foot-val tabular-nums">{{ processingDealCustomerCount }} <small>KH</small></strong>
          </div>
        </div>
      </article>

      <!-- KPI 3: TỔNG CÔNG NỢ PHẢI THU (Red Gradient + Bottom Progress Bar) -->
      <article class="sr-sb-card" :class="totalPortfolioDebt > 0 ? 'sb-card-debt' : 'sb-card-com'">
        <div class="sr-sb-head">
          <div class="sr-sb-title-cluster">
            <span class="sr-sb-icon">
              <i class="ri-bank-card-line"></i>
            </span>
            <h3 class="sr-sb-title">Tổng Công Nợ Phải Thu</h3>
          </div>
        </div>

        <div class="sr-sb-main">
          <div class="sr-sb-hero-val is-money tabular-nums">
            {{ formatCurrency(totalPortfolioDebt) || '0' }}
            <span class="sr-sb-unit">VND</span>
          </div>
          <button
            type="button"
            class="sr-sb-po-badge tabular-nums"
            :class="{ 'is-active': filters.debt === 'debt' }"
            @click.stop="toggleKpiFilter('debt', 'debt')"
            title="Click để lọc nhanh khách hàng đang còn nợ"
          >
            {{ allDebtCustomerCount }}/{{ customers.length }} KH nợ
          </button>
        </div>

        <div class="sr-sb-foot">
          <div
            class="sr-sb-foot-row"
            :class="{ 'is-active': filters.debt === 'debt' }"
            @click="toggleKpiFilter('debt', 'debt')"
            title="Lọc khách hàng đang còn công nợ"
          >
            <span class="sr-sb-foot-label">Khách đang còn nợ</span>
            <strong class="sr-sb-foot-val tabular-nums">{{ allDebtCustomerCount }} <small>KH</small></strong>
          </div>
          <div
            class="sr-sb-foot-row"
            :class="{ 'is-active': filters.debt === 'no_debt' }"
            @click="toggleKpiFilter('debt', 'no_debt')"
            title="Lọc khách hàng không còn nợ"
          >
            <span class="sr-sb-foot-label">Tất toán / 0đ • Đã thu</span>
            <strong class="sr-sb-foot-val tabular-nums">{{ allNoDebtCustomerCount }} <small>KH</small> ({{ portfolioCollectionPct }}%)</strong>
          </div>
        </div>

        <div class="sr-sb-bottom-progress" aria-hidden="true">
          <div
            class="sr-sb-bottom-progress-fill"
            :style="{ width: portfolioCollectionPct + '%' }"
          ></div>
        </div>
      </article>
    </section>

    <!-- ================== 3. UNIFIED 1-ROW TOOLBAR & FILTER DECK ================== -->
    <section class="cf-toolbar-shell">
      <div class="cf-toolbar-row">
        <!-- 3-Mode Theme Switcher (Dark / Light / Custom Glassify) -->
        <div class="cf-theme-seg cf-hide-mob" role="group" aria-label="Chế độ hiển thị">
          <button
            type="button"
            class="cf-theme-btn"
            :class="{ 'is-active': uiTheme === 'dark' }"
            @click="setUiTheme('dark')"
            title="Giao diện Tối (Dark Navy)"
          >
            <i class="ri-moon-clear-line"></i>
            <span class="hide-sm">Dark</span>
          </button>
          <button
            type="button"
            class="cf-theme-btn"
            :class="{ 'is-active': uiTheme === 'light' }"
            @click="setUiTheme('light')"
            title="Giao diện Sáng (Light Blue)"
          >
            <i class="ri-sun-line"></i>
            <span class="hide-sm">Light</span>
          </button>
          <button
            type="button"
            class="cf-theme-btn"
            :class="{ 'is-active': uiTheme === 'custom' }"
            @click="onClickCustomThemeBtn($event)"
            title="Giao diện Kính mờ tùy biến (Glassify)"
          >
            <i class="ri-sparkling-2-line"></i>
            <span class="hide-sm">Glass</span>
          </button>
          <button
            v-if="uiTheme === 'custom'"
            type="button"
            class="cf-theme-gear"
            :class="{ 'is-open': showCustomGlassTuner }"
            @click.stop="toggleCustomGlassTuner($event)"
            title="Tùy chỉnh thông số kính mờ"
          >
            <i class="ri-equalizer-line"></i>
          </button>
        </div>

        <!-- Unified Search Shell -->
        <div class="bg-search-shell" ref="searchShellRef">
          <i class="ri-search-line bg-search-ico" aria-hidden="true"></i>
          <input
            type="text"
            v-model="filters.search"
            class="bg-search-input"
            placeholder="Tìm công ty, người liên hệ, MST, SĐT, email, mã KH, nhóm..."
            @focus="isSearchFocused = true"
            @keydown.esc="onSearchEscape"
            @keydown.enter="commitRecentSearch(filters.search)"
          />
          <span v-if="filters.search" class="bg-search-match tabular-nums">
            {{ totalFilteredCount }} KQ
          </span>
          <button
            v-if="filters.search"
            type="button"
            class="bg-search-clear"
            @click="filters.search = ''"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            ✕
          </button>

          <!-- Recent Searches Dropdown -->
          <div
            v-if="isSearchFocused && !filters.search && recentSearches.length > 0"
            class="bg-recent-dropdown"
          >
            <div class="bg-recent-head">
              <span>Tìm kiếm gần đây</span>
              <button type="button" @mousedown.prevent="clearAllRecentSearches">Xóa tất cả</button>
            </div>
            <div class="bg-recent-list">
              <div
                v-for="term in recentSearches"
                :key="term"
                class="bg-recent-item"
                @mousedown.prevent="applyRecentSearch(term)"
              >
                <i class="ri-history-line"></i>
                <span>{{ term }}</span>
                <button
                  type="button"
                  class="bg-recent-del"
                  @mousedown.stop.prevent="removeRecentSearch(term)"
                  aria-label="Xóa mục này"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="cf-toolbar-actions">
          <button
            type="button"
            class="cf-btn cf-btn-slate cf-btn-filter-toggle"
            :class="{ 'is-active-filter': showFilterPanel || activeFilterCount > 0 }"
            @click="showFilterPanel = !showFilterPanel"
            title="Mở bộ lọc nâng cao"
          >
            <i class="ri-equalizer-2-line"></i>
            <span>Bộ lọc</span>
            <span v-if="activeFilterCount > 0" class="cf-badge is-sky tabular-nums">{{ activeFilterCount }}</span>
            <i v-if="isMobileViewport" :class="showFilterPanel ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" class="cf-filter-mob-caret"></i>
          </button>

          <button
            type="button"
            class="cf-btn cf-btn-slate cf-hide-mob"
            :class="{ 'has-dup-warn': duplicateGroups.length > 0 }"
            @click="openDuplicateCheckModal"
            title="Kiểm tra khách hàng trùng tên công ty, tên KH hoặc MST"
          >
            <i class="ri-file-copy-2-line"></i>
            <span>Check trùng</span>
            <span
              v-if="duplicateGroups.length > 0"
              class="cf-badge is-danger tabular-nums"
            >
              {{ duplicateGroups.length }}
            </span>
          </button>

          <!-- Single Primary CTA -->
          <button
            type="button"
            class="cf-btn cf-btn-primary cf-hide-mob"
            @click="showAddChoiceModal = true"
          >
            <i class="ri-add-line"></i>
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      <!-- Expandable Filter Panel -->
      <Transition name="cf-slide-fade">
        <div v-if="showFilterPanel" class="cf-filter-panel">
          <div class="cf-filter-grid">
            <div
              v-for="picker in cfFilterPickers"
              :key="picker.key"
              class="cf-filter-field"
            >
              <label>{{ picker.label }}</label>
              <div class="cf-picker-root" :class="{ 'is-open': openCfPickerKey === picker.key }">
                <button
                  type="button"
                  class="pl-picker-trigger"
                  :class="{ 'is-custom': picker.isCustom, 'is-open': openCfPickerKey === picker.key }"
                  @click.stop="toggleCfPicker(picker.key)"
                >
                  <span class="pl-trig-icon" aria-hidden="true">
                    <i :class="picker.icon"></i>
                  </span>
                  <span class="pl-trig-name">{{ picker.displayName }}</span>
                  <span v-if="picker.displayCount" class="pl-trig-count tabular-nums">
                    {{ picker.displayCount }}
                  </span>
                  <span
                    v-if="picker.isCustom"
                    role="button"
                    tabindex="0"
                    class="pl-trig-reset"
                    title="Đặt lại mặc định"
                    aria-label="Đặt lại mặc định"
                    @click.stop="selectCfPickerOption(picker.key, '')"
                    @keydown.enter.stop.prevent="selectCfPickerOption(picker.key, '')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10.5" height="10.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </span>
                  <svg
                    class="pl-trig-chevron"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12.5"
                    height="12.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                <!-- DESKTOP CUSTOM POPOVER (> 1100px) -->
                <Transition name="pl-pop">
                  <div
                    v-if="!isMobileViewport && openCfPickerKey === picker.key"
                    class="pl-desktop-popover"
                    @click.stop
                  >
                    <div v-if="picker.searchable" class="pl-pop-search-box">
                      <svg class="pl-pop-search-ic" xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        v-model="cfPickerTagSearch"
                        type="text"
                        class="pl-pop-search-input"
                        :placeholder="picker.searchPlaceholder"
                      />
                      <button
                        v-if="cfPickerTagSearch"
                        type="button"
                        class="pl-pop-search-clear"
                        title="Xóa từ khóa"
                        @click="cfPickerTagSearch = ''"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>

                    <div class="pl-pop-list">
                      <template v-for="(sec, sIdx) in picker.sections" :key="picker.key + '-sec-' + sIdx">
                        <div v-if="sec.title" class="pl-pop-section-lbl">
                          <span>{{ sec.title }}</span>
                        </div>
                        <div v-if="sec.emptyText && sec.items.length === 0" class="pl-pop-empty">
                          {{ sec.emptyText }}
                        </div>
                        <button
                          v-for="opt in sec.items"
                          :key="picker.key + '-opt-' + opt.value"
                          type="button"
                          class="pl-opt-card"
                          :class="{ 'is-base-opt': opt.value === '', 'is-selected': picker.activeValue === opt.value }"
                          @click="selectCfPickerOption(picker.key, opt.value)"
                        >
                          <div class="pl-opt-top">
                            <span class="pl-opt-radio">
                              <svg v-if="picker.activeValue === opt.value" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                            <span v-if="opt.dot" class="pl-opt-dot" :class="opt.dot"></span>
                            <i v-else-if="opt.icon" :class="opt.icon" class="pl-opt-icon"></i>
                            <span class="pl-opt-title">{{ opt.label }}</span>
                            <span v-if="opt.countText" class="pl-opt-count tabular-nums">{{ opt.countText }}</span>
                          </div>
                          <div v-if="opt.sub" class="pl-opt-sub">{{ opt.sub }}</div>
                        </button>
                      </template>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <div class="cf-filter-panel-foot">
            <span class="cf-filter-summary tabular-nums">
              Đang lọc <strong>{{ totalFilteredCount }}</strong> / {{ customers.length }} khách hàng
            </span>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button
                type="button"
                class="cf-btn cf-btn-slate"
                @click="isTagModalOpen = true"
                title="Quản lý danh mục Nhóm khách hàng (tagKH)"
              >
                <i class="ri-price-tag-3-line"></i>
                <span>Quản lý Nhóm KH</span>
                <span v-if="availableTags.length > 0" class="cf-badge is-slate tabular-nums">{{ availableTags.length }}</span>
              </button>
              <button
                v-if="hasAnyActiveFilter"
                type="button"
                class="cf-btn cf-btn-ghost-danger"
                @click="resetFilters"
              >
                <i class="ri-filter-off-line"></i>
                <span>Xóa toàn bộ lọc</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Active Filter Chips Strip -->
      <div v-if="activeFilterChips.length > 0" class="cf-active-chips-row">
        <span class="cf-chips-label">Đang lọc:</span>
        <button
          v-for="chip in activeFilterChips"
          :key="chip.key"
          type="button"
          class="cf-active-chip"
          @click="clearSingleFilter(chip.key)"
        >
          <span>{{ chip.label }}</span>
          <i class="ri-close-line"></i>
        </button>
        <button type="button" class="cf-clear-all-link" @click="resetFilters">
          Đặt lại tất cả
        </button>
      </div>
    </section>

    <!-- ================== 4. DATA WORKSPACE: SHIMMER / EMPTY / OLD CARD LAYOUT ================== -->
    <main class="cf-workspace">
      <!-- A. SKELETON SHIMMER LOADING -->
      <div v-if="loading && customers.length === 0" class="card-list">
        <div v-for="i in 8" :key="'skeleton-' + i" class="report-card skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-title"></div>
          </div>
          <div class="skeleton-body">
            <div class="skeleton-line"></div>
            <div class="skeleton-line" style="width: 70%;"></div>
            <div class="skeleton-line" style="width: 40%;"></div>
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-box"></div>
            <div class="skeleton-box"></div>
            <div class="skeleton-box"></div>
          </div>
        </div>
      </div>

      <!-- B. EMPTY STATE -->
      <div v-else-if="filteredCustomers.length === 0" class="cf-empty-state">
        <div class="cf-empty-icon">
          <i class="ri-user-search-line"></i>
        </div>
        <h3>Không tìm thấy khách hàng phù hợp</h3>
        <p v-if="hasAnyActiveFilter">
          Không có hồ sơ khách hàng nào khớp với từ khóa hoặc bộ lọc đang chọn.
        </p>
        <p v-else>
          Hệ thống hiện chưa có khách hàng nào. Hãy thêm mới hoặc import từ Báo Giá / Đề xuất mua hàng.
        </p>
        <div class="cf-empty-actions">
          <button v-if="hasAnyActiveFilter" type="button" class="cf-btn cf-btn-slate" @click="resetFilters">
            <i class="ri-filter-off-line"></i>
            <span>Xóa bộ lọc</span>
          </button>
          <button type="button" class="cf-btn cf-btn-primary" @click="showAddChoiceModal = true">
            <i class="ri-add-line"></i>
            <span>Thêm khách hàng mới</span>
          </button>
        </div>
      </div>

      <!-- C. OLD CARD LIST VIEW -->
      <div v-else class="card-list">
        <div
          v-for="(kh, index) in visibleCustomers"
          :key="'card-' + (kh._firebaseKey || kh.ma_khach_hang || index)"
          class="report-card"
          @click="openEditModal(kh)"
        >
          <div class="card-row-header">
            <div class="cf-card-head-top">
              <div class="time-primary" :title="kh.ten_cong_ty || kh.ten_khach_hang || ''">
                <span v-html="highlightMatch(kh.ten_cong_ty || kh.ten_khach_hang || 'Chưa cập nhật tên')"></span>
              </div>
              <span class="card-id tabular-nums">#{{ index + 1 }}</span>
            </div>

            <div class="cf-card-head-badges">
              <span class="cf-head-mst-chip" :class="{ 'is-empty': !kh.mst }">
                <span class="cf-head-lbl">MST</span>
                <span
                  v-if="kh.mst"
                  class="cf-head-val tabular-nums"
                  v-html="highlightMatch(kh.mst)"
                ></span>
                <span v-else class="cf-head-empty">—</span>
              </span>

              <span
                class="cf-head-industry-pill"
                :class="{ 'is-empty': !kh.nganh_nghe_cong_ty }"
                :title="kh.nganh_nghe_cong_ty || 'Chưa cập nhật ngành hàng'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11.5" height="11.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span>{{ kh.nganh_nghe_cong_ty || 'Chưa rõ ngành' }}</span>
              </span>
            </div>

            <div class="cf-card-head-addr" :title="getCustomerAddress(kh) || ''">
              <svg xmlns="http://www.w3.org/2000/svg" width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span
                v-if="getCustomerAddress(kh)"
                class="cf-head-addr-val is-clamp2"
                v-html="highlightMatch(getCustomerAddress(kh))"
              ></span>
              <span v-else class="cf-head-empty">Chưa cập nhật địa chỉ</span>
            </div>
          </div>

          <div class="card-row-content">
            <div class="content-title">
              <div v-if="kh.ten_khach_hang" class="info-line">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span v-html="highlightMatch(kh.ten_khach_hang)"></span>
              </div>
              <div v-if="kh.so_dien_thoai_ca_nhan" class="info-line">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span class="tabular-nums" v-html="highlightMatch(kh.so_dien_thoai_ca_nhan)"></span>
              </div>
              <div v-if="kh.email_ca_nhan" class="info-line">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span v-html="highlightMatch(kh.email_ca_nhan)"></span>
              </div>

              <div class="financial-wrapper">
                <div class="financial-stats" style="border-top: none; margin-top: 0; padding-top: 0;">
                  <div class="stat-item" v-if="kh.hopDongChotCount > 0">
                    <span class="stat-label">
                      <svg class="cf-stat-ico is-emerald" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Báo giá đã chốt:
                    </span>
                    <span class="stat-val tabular-nums cf-stat-val is-emerald cf-stat-with-eye">{{ kh.hopDongChotCount || 0 }}
                      <span
                        @click.stop="navigateToContracts(kh, 'COMPLETED')"
                        class="cf-eye-btn is-emerald"
                        title="Xem các báo giá đã chốt"
                      >
                        <svg class="action-eye-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </span>
                    </span>
                  </div>
                  <div class="stat-item" v-else>
                    <span class="stat-label">
                      <svg class="cf-stat-ico is-emerald" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Báo giá đã chốt:
                    </span>
                    <span class="stat-val tabular-nums cf-stat-val is-emerald">0</span>
                  </div>

                  <div class="stat-item" v-if="kh.hopDongProcessingCount > 0">
                    <span class="stat-label">
                      <svg class="cf-stat-ico is-amber" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Báo giá đang xử lý:
                    </span>
                    <span class="stat-val tabular-nums cf-stat-val is-amber cf-stat-with-eye">{{ kh.hopDongProcessingCount || 0 }}
                      <span
                        @click.stop="navigateToContracts(kh, 'PROCESSING')"
                        class="cf-eye-btn is-amber"
                        title="Xem các báo giá đang xử lý"
                      >
                        <svg class="action-eye-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </span>
                    </span>
                  </div>
                  <div class="stat-item" v-else>
                    <span class="stat-label">
                      <svg class="cf-stat-ico is-amber" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Báo giá đang xử lý:
                    </span>
                    <span class="stat-val tabular-nums cf-stat-val is-amber">0</span>
                  </div>

                  <div class="stat-item">
                    <span class="stat-label">
                      <svg class="cf-stat-ico is-sky" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      Lần cuối mua hàng:
                    </span>
                    <span class="stat-val tabular-nums cf-old-last-buy">{{ kh.lastPurchaseText || 'Chưa có' }}</span>
                  </div>

                  <div class="stat-item">
                    <span class="stat-label">
                      <svg class="cf-stat-ico is-slate" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Cập nhật cuối:
                    </span>
                    <span class="stat-val tabular-nums cf-old-last-upd">{{ formatLastUpdated(kh.last_updated) }}</span>
                  </div>

                  <div class="stat-item" v-if="kh.renewalCount > 0">
                    <span class="stat-label">
                      <svg class="cf-stat-ico is-rose" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      Cần gia hạn:
                    </span>
                    <span class="stat-val tabular-nums cf-stat-val is-rose cf-stat-with-eye">{{ kh.renewalCount }} sản phẩm
                      <span
                        @click.stop="navigateToRenewal(kh)"
                        class="cf-eye-btn is-rose"
                        title="Xem sản phẩm cần gia hạn"
                      >
                        <svg class="action-eye-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </span>
                    </span>
                  </div>
                </div>

                <div class="financial-stats">
                  <div class="stat-item" style="align-items: flex-start; gap: 8px;">
                    <span class="stat-label" style="flex-shrink: 0; margin-top: 2px;">
                      <svg class="cf-stat-ico is-sky" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                      Nhóm khách:
                    </span>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end;">
                      <template v-if="kh.tagKH && kh.tagKH.length > 0">
                        <span
                          v-for="tag in kh.tagKH"
                          :key="tag"
                          class="cf-old-tag-pill"
                        >
                          {{ tag }}
                        </span>
                      </template>
                      <span v-else class="cf-old-tag-empty">Chưa phân nhóm</span>
                    </div>
                  </div>

                  <div
                    class="stat-item cf-debt-row"
                    @click.stop="openCustomerDebtModal(kh)"
                    title="Nhấp để xem tiến độ trả nợ và lịch sử thanh toán của khách hàng"
                  >
                    <span class="stat-label">
                      <svg
                        class="cf-stat-ico"
                        :class="(Number(kh.cong_no) || 0) > 0 ? 'is-rose' : 'is-emerald'"
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                      Công nợ:
                    </span>
                    <span
                      class="stat-val tabular-nums cf-debt-val-text cf-stat-with-eye"
                      :class="(Number(kh.cong_no) || 0) > 0 ? 'is-debt' : 'is-settled'"
                    >
                      {{ formatCurrency(kh.cong_no || 0) || '0' }} đ
                      <span
                        class="cf-eye-btn"
                        :class="(Number(kh.cong_no) || 0) > 0 ? 'is-rose' : 'is-emerald'"
                        title="Xem chi tiết công nợ & lịch sử thanh toán"
                      >
                        <svg class="action-eye-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LAZY LOADING SENTINEL & LOAD MORE BUTTON -->
      <div
        v-if="!loading && totalFilteredCount > 0"
        ref="lazyLoadSentinelRef"
        class="cf-lazy-footer"
      >
        <div class="cf-lazy-status tabular-nums">
          Đang hiển thị <strong>{{ displayedCustomersCount }}</strong> / <strong>{{ totalFilteredCount }}</strong> khách hàng
        </div>
        <button
          v-if="hasMoreCustomers"
          type="button"
          class="cf-lazy-more-btn tabular-nums"
          @click="loadMoreCustomers"
        >
          <i class="ri-arrow-down-s-line"></i>
          <span>
            Tải thêm +{{ Math.min(CUSTOMER_PAGE_SIZE, totalFilteredCount - displayedCustomersCount) }} khách hàng
            (còn {{ totalFilteredCount - displayedCustomersCount }})
          </span>
        </button>
      </div>
    </main>

    <!-- ================== MODAL 1: BENTO ADD / IMPORT CHOICE MODAL ================== -->
    <div
      v-if="showAddChoiceModal"
      class="modal vip-modal-overlay"
      style="z-index: 10020;"
      @click.self="showAddChoiceModal = false"
    >
      <div class="modal-card vip-modal-card cf-choice-modal">
        <div class="modal-head modal-head-themed">
          <div class="dt-only-head cf-modal-dt-title">
            <i class="ri-user-add-line"></i>
            <span>Thêm Hồ Sơ Khách Hàng</span>
          </div>
          <div class="m-grab-head-stack">
            <span class="m-grab-eyebrow">Khởi tạo dữ liệu</span>
            <span class="m-grab-title">Thêm Hồ Sơ Khách Hàng</span>
          </div>
          <button type="button" class="x" @click="showAddChoiceModal = false">✕</button>
        </div>

        <div class="cf-choice-body">
          <p class="cf-choice-lead">Chọn phương thức tạo mới hoặc trích xuất tự động từ chứng từ:</p>

          <div class="cf-choice-grid">
            <button type="button" class="cf-choice-card is-sky" @click="openAddModalFromChoice">
              <div class="cf-choice-ico is-sky">
                <i class="ri-edit-box-line"></i>
              </div>
              <div class="cf-choice-info">
                <strong>Thêm mới trực tiếp</strong>
                <span>Nhập hồ sơ pháp nhân, MST, người liên hệ &amp; phân nhóm KH thủ công</span>
              </div>
              <i class="ri-arrow-right-s-line cf-choice-arr"></i>
            </button>

            <button type="button" class="cf-choice-card is-emerald" @click="triggerQuoteImportFromChoice">
              <div class="cf-choice-ico is-emerald">
                <i class="ri-file-text-line"></i>
              </div>
              <div class="cf-choice-info">
                <strong>Import từ File Báo Giá (PDF / Excel)</strong>
                <span>Tự động bóc tách mục Kính gửi, Người nhận &amp; Địa chỉ từ nhiều file cùng lúc</span>
              </div>
              <i class="ri-arrow-right-s-line cf-choice-arr"></i>
            </button>

            <button type="button" class="cf-choice-card is-amber" @click="triggerDxmhImportFromChoice">
              <div class="cf-choice-ico is-amber">
                <i class="ri-file-excel-2-line"></i>
              </div>
              <div class="cf-choice-info">
                <strong>Import Đề xuất mua hàng (DXMH Excel)</strong>
                <span>Đọc tự động Công ty, MST, Liên hệ chính &amp; Người nhận phụ từ sheet PO / Đơn hàng</span>
              </div>
              <i class="ri-arrow-right-s-line cf-choice-arr"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================== MODAL 2: ADD / EDIT CUSTOMER DETAIL MODAL (WITH BAOGIA DEBT BOX) ================== -->
    <div
      v-if="isModalOpen"
      class="modal vip-modal-overlay modal-fullscreen-overlay cf-modal-full100-overlay"
      style="z-index: 10025;"
      @click.self="attemptCloseCustomerModal"
    >
      <div class="modal-card modal-wide vip-modal-card cf-customer-form-modal">
        <!-- HEADER -->
        <div class="modal-head modal-head-themed">
          <div class="dt-only-head cf-modal-dt-title">
            <i :class="isEditing ? 'ri-user-settings-line' : 'ri-user-add-line'"></i>
            <span>
              {{ isMultiImport ? 'Kiểm Duyệt Import Khách Hàng' : (isEditing ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Thêm Khách Hàng Mới') }}
            </span>
            <span v-if="isEditing && formData.last_updated" class="cf-head-upd-pill tabular-nums">
              Cập nhật: {{ formatLastUpdated(formData.last_updated) }}
            </span>
          </div>
          <div class="m-grab-head-stack">
            <span class="m-grab-eyebrow">
              {{ isEditing && formData.last_updated ? ('Cập nhật: ' + formatLastUpdated(formData.last_updated)) : 'Hồ sơ khách hàng' }}
            </span>
            <span class="m-grab-title">
              {{ isMultiImport ? 'Kiểm Duyệt Import KH' : (isEditing ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Mới') }}
            </span>
          </div>
          <button type="button" class="x" @click="attemptCloseCustomerModal">✕</button>
        </div>

        <!-- MULTI-IMPORT PAGINATION BAR -->
        <div v-if="isMultiImport && importedList.length > 0" class="cf-multi-import-bar">
          <div class="cf-multi-file-info">
            <span class="cf-multi-step tabular-nums">File {{ currentImportIndex + 1 }} / {{ importedList.length }}</span>
            <strong class="cf-multi-filename" :title="importedList[currentImportIndex]?.fileName">
              {{ importedList[currentImportIndex]?.fileName }}
            </strong>
            <span class="cf-multi-mode-pill" :class="isEditing ? 'is-upd' : 'is-new'">
              {{ isEditing ? 'Khớp KH cũ (Cập nhật)' : 'Khách hàng mới' }}
            </span>
          </div>
          <div class="cf-multi-nav">
            <button type="button" class="cf-btn cf-btn-slate cf-btn-sm" @click="prevPage" :disabled="currentImportIndex === 0">
              ← Trước
            </button>
            <button
              type="button"
              class="cf-btn cf-btn-slate cf-btn-sm"
              @click="nextPage"
              :disabled="currentImportIndex === importedList.length - 1"
            >
              Tiếp →
            </button>
          </div>
        </div>

        <!-- FORM BODY -->
        <form @submit.prevent="saveCustomer" class="cf-form-body">
          <div class="cf-form-2col">
            <!-- LEFT COLUMN: LIÊN HỆ & PHÂN NHÓM -->
            <div class="cf-form-col">
              <div class="cust-group-box cust-group-main cf-bento-form-box">
                <div class="cf-box-title is-emerald">
                  <i class="ri-contacts-line"></i>
                  <span>Người Liên Hệ &amp; Định Danh</span>
                </div>

                <div class="cf-field-grid-2">
                  <div class="cf-field">
                    <label>Tên người liên hệ chính <span class="req">*</span></label>
                    <input
                      type="text"
                      v-model="formData.ten_khach_hang"
                      class="cf-input"
                      placeholder="VD: ANH NGUYỄN VĂN A"
                      required
                    />
                  </div>
                  <div class="cf-field">
                    <label>Mã khách hàng</label>
                    <input
                      type="text"
                      v-model="formData.ma_khach_hang"
                      class="cf-input is-mono"
                      placeholder="Tự động tạo theo Tên + Công ty"
                    />
                  </div>
                </div>

                <div class="cf-field-grid-2">
                  <div class="cf-field">
                    <label>SĐT cá nhân</label>
                    <input
                      type="text"
                      v-model="formData.so_dien_thoai_ca_nhan"
                      class="cf-input tabular-nums"
                      placeholder="09xx xxx xxx"
                    />
                  </div>
                  <div class="cf-field">
                    <label>Email cá nhân</label>
                    <input
                      type="email"
                      v-model="formData.email_ca_nhan"
                      class="cf-input"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>

                <div class="cf-sub-divider">Người liên hệ phụ / Giao nhận</div>

                <div class="cf-field">
                  <label>Tên khách hàng phụ</label>
                  <input
                    type="text"
                    v-model="formData.ten_khach_hang_phu"
                    class="cf-input"
                    placeholder="Người nhận hàng / liên hệ dự phòng"
                  />
                </div>

                <div class="cf-field-grid-2">
                  <div class="cf-field">
                    <label>SĐT liên hệ phụ</label>
                    <input
                      type="text"
                      v-model="formData.so_dien_thoai_ca_nhan_phu"
                      class="cf-input tabular-nums"
                      placeholder="09xx xxx xxx"
                    />
                  </div>
                  <div class="cf-field">
                    <label>Email liên hệ phụ</label>
                    <input
                      type="email"
                      v-model="formData.email_ca_nhan_phu"
                      class="cf-input"
                      placeholder="sub-contact@company.com"
                    />
                  </div>
                </div>
              </div>

              <!-- NHÓM KHÁCH HÀNG (tagKH) & GHI CHÚ -->
              <div class="cust-group-box cust-group-sub cf-bento-form-box">
                <div class="cf-box-title-between">
                  <div class="cf-box-title is-sky">
                    <i class="ri-price-tag-3-line"></i>
                    <span>Nhóm Khách Hàng (tagKH) &amp; Ghi Chú</span>
                  </div>
                  <button type="button" class="cf-mini-manage-btn" @click="isTagModalOpen = true">
                    <i class="ri-settings-3-line"></i>
                    <span>Quản lý nhóm</span>
                  </button>
                </div>

                <div class="cf-tag-creator-row">
                  <input
                    type="text"
                    v-model="tempTagKH"
                    @keydown.enter.prevent="addNewTagFromInput"
                    placeholder="Nhập tên nhóm mới rồi nhấn Enter..."
                    class="cf-input"
                  />
                  <button type="button" class="cf-btn cf-btn-emerald cf-btn-sm" @click="addNewTagFromInput">
                    + Thêm
                  </button>
                </div>

                <div v-if="availableTags.length > 0" class="cf-tag-selector-list">
                  <button
                    v-for="tag in availableTags"
                    :key="'form-tag-' + tag"
                    type="button"
                    class="cf-tag-select-chip"
                    :class="{ active: Array.isArray(formData.tagKH) && formData.tagKH.includes(tag) }"
                    @click="toggleTag(tag)"
                  >
                    <i :class="Array.isArray(formData.tagKH) && formData.tagKH.includes(tag) ? 'ri-check-line' : 'ri-add-line'"></i>
                    <span>{{ tag }}</span>
                  </button>
                </div>
                <div v-else class="cf-tag-empty-hint">
                  Chưa có nhóm khách hàng nào. Nhập tên nhóm phía trên để khởi tạo.
                </div>

                <div class="cf-field" style="margin-top: 8px;">
                  <label>Ghi chú chăm sóc</label>
                  <textarea
                    v-model="formData.ghi_chu"
                    rows="2"
                    class="cf-textarea"
                    placeholder="Ghi chú đặc thù thanh toán, sở thích, lưu ý giao hàng..."
                  ></textarea>
                </div>
              </div>

              <!-- CÔNG NỢ & TIẾN ĐỘ TRẢ NỢ CỦA KHÁCH HÀNG (NẰM DƯỚI NHÓM KHÁCH HÀNG) -->
              <div
                data-guide="cust-debt-overview"
                class="cust-group-box cust-debt-box"
                style="width: 100%; padding: 14px 16px; background: rgba(15, 23, 42, 0.55); border: 1px solid rgba(56, 189, 248, 0.28); border-radius: 12px; display: flex; flex-direction: column; gap: 12px;"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                  <div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap;">
                    <div>
                      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0284c7; letter-spacing: 0.6px; margin-bottom: 3px;">
                        Công Nợ Hiện Tại Của Khách Hàng
                      </div>
                      <div
                        class="tabular-nums"
                        style="font-size: 20px; font-weight: 900; line-height: 1.1;"
                        :style="{ color: getCustomerDebtSummary(formData).congNo > 0 ? '#ef4444' : '#10b981' }"
                      >
                        {{ formatVND(getCustomerDebtSummary(formData).congNo) || '0' }} đ
                      </div>
                    </div>
                    <div style="height: 32px; width: 1px; background: rgba(148,163,184,0.25);"></div>
                    <div>
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; opacity: 0.75; margin-bottom: 3px;">
                        Đã thanh toán
                      </div>
                      <div class="tabular-nums" style="font-size: 15px; font-weight: 800; color: #10b981;">
                        {{ formatVND(getCustomerDebtSummary(formData).daThanhToan) || '0' }} đ
                      </div>
                    </div>
                    <div style="height: 32px; width: 1px; background: rgba(148,163,184,0.25);"></div>
                    <div>
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; opacity: 0.75; margin-bottom: 3px;">
                        Tổng phải thu ({{ getCustomerDebtSummary(formData).poCount }} PO)
                      </div>
                      <div class="tabular-nums" style="font-size: 15px; font-weight: 800; color: #0284c7;">
                        {{ formatVND(getCustomerDebtSummary(formData).tongSauVat) || '0' }} đ
                        <span style="font-size: 12.5px; font-weight: 700;">({{ getCustomerDebtSummary(formData).progressPct }}%)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    @click="openCustomerDebtModal(formData)"
                    style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(56, 189, 248, 0.22)); color: #0284c7; border: 1px solid rgba(56, 189, 248, 0.45); border-radius: 8px; padding: 8px 13px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; width: fit-content; transition: all 0.2s;"
                    class="cust-debt-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    <span>Xem Tiến Độ Trả Nợ &amp; Lịch Sử TT ({{ getCustomerPaymentHistoryCount(formData) }})</span>
                  </button>
                </div>

                <div style="width: 100%; height: 9px; background: rgba(148, 163, 184, 0.25); border-radius: 999px; overflow: hidden;">
                  <div
                    :style="{
                      width: getCustomerDebtSummary(formData).progressPct + '%',
                      height: '100%',
                      background: getCustomerDebtSummary(formData).congNo <= 0 ? '#10b981' : 'linear-gradient(90deg, #38bdf8, #10b981)',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease'
                    }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: PHÁP NHÂN CÔNG TY -->
            <div class="cf-form-col">
              <div class="cust-group-box cust-group-company cf-bento-form-box">
                <div class="cf-box-title is-sky">
                  <i class="ri-building-4-line"></i>
                  <span>Pháp Nhân Công Ty &amp; Hóa Đơn</span>
                </div>

                <div class="cf-field">
                  <label>Tên công ty / Tổ chức</label>
                  <input
                    type="text"
                    v-model="formData.ten_cong_ty"
                    class="cf-input"
                    placeholder="CÔNG TY TNHH ..."
                  />
                </div>

                <div class="cf-field-grid-2">
                  <div class="cf-field">
                    <label>Mã công ty</label>
                    <input
                      type="text"
                      v-model="formData.ma_cong_ty"
                      class="cf-input is-mono"
                      placeholder="Tự động tạo theo Tên công ty"
                    />
                  </div>
                  <div class="cf-field">
                    <label>Mã số thuế (MST)</label>
                    <input
                      type="text"
                      v-model="formData.mst"
                      class="cf-input is-mono tabular-nums"
                      placeholder="03xxxxxxxx"
                    />
                  </div>
                </div>

                <div class="cf-field">
                  <label>Địa chỉ xuất hóa đơn / Trụ sở</label>
                  <input
                    type="text"
                    v-model="formData.dia_chi_cong_ty"
                    class="cf-input"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>

                <div class="cf-field-grid-2">
                  <div class="cf-field">
                    <label>SĐT công ty</label>
                    <input
                      type="text"
                      v-model="formData.so_dien_thoai_cong_ty"
                      class="cf-input tabular-nums"
                      placeholder="028 xxxx xxxx"
                    />
                  </div>
                  <div class="cf-field">
                    <label>Số Fax</label>
                    <input
                      type="text"
                      v-model="formData.so_fax_cong_ty"
                      class="cf-input tabular-nums"
                      placeholder="Fax công ty"
                    />
                  </div>
                </div>

                <div class="cf-field-grid-2">
                  <div class="cf-field">
                    <label>Email công ty / Hóa đơn</label>
                    <input
                      type="email"
                      v-model="formData.email_cong_ty"
                      class="cf-input"
                      placeholder="accounting@company.com"
                    />
                  </div>
                  <div class="cf-field">
                    <label>Website</label>
                    <input
                      type="text"
                      v-model="formData.website_cong_ty"
                      class="cf-input"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div class="cf-field">
                  <label>Ngành nghề kinh doanh chính</label>
                  <div class="cf-input-with-picker">
                    <input
                      type="text"
                      v-model="formData.nganh_nghe_cong_ty"
                      class="cf-input cf-input-has-picker"
                      placeholder="VD: Sản xuất linh kiện, Tài chính - Ngân hàng, Giáo dục..."
                    />
                    <button
                      type="button"
                      class="cf-inline-picker-btn"
                      @click="openIndustryPickerModal"
                      title="Chọn từ danh sách ngành nghề kinh doanh"
                    >
                      <i class="ri-list-check-2"></i>
                      <span>Chọn</span>
                    </button>
                  </div>
                </div>

                <div class="cf-sub-divider">Thông tin tiếng Anh / Đề xuất mua hàng (DXMH)</div>

                <div class="cf-field-grid-2">
                  <div class="cf-field">
                    <label>COMPANY (Eng)</label>
                    <input
                      type="text"
                      v-model="formData.company"
                      class="cf-input"
                      placeholder="English company name"
                    />
                  </div>
                  <div class="cf-field">
                    <label>TEL (Eng)</label>
                    <input
                      type="text"
                      v-model="formData.tel"
                      class="cf-input tabular-nums"
                      placeholder="+84 ..."
                    />
                  </div>
                </div>

                <div class="cf-field">
                  <label>ADDRESS (Eng)</label>
                  <input
                    type="text"
                    v-model="formData.address"
                    class="cf-input"
                    placeholder="English company address"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- STICKY FOOTER -->
          <div class="cust-modal-footer cf-form-footer">
            <button
              v-if="isEditing && !isMultiImport && formData.ma_khach_hang"
              type="button"
              class="cf-btn cf-btn-danger-outline cf-footer-del-btn"
              :disabled="saving"
              @click="confirmDelete(formData.ma_khach_hang, formData)"
            >
              <i class="ri-delete-bin-6-line"></i>
              <span>Xoá<span class="cf-hide-xs-inline"> khách hàng</span></span>
            </button>

            <div class="cf-form-footer-right">
              <button
                type="button"
                class="modal-btn-secondary cf-btn cf-btn-slate"
                :disabled="saving"
                @click="attemptCloseCustomerModal"
              >
                Huỷ bỏ
              </button>
              <button type="submit" class="cf-btn cf-btn-emerald" :disabled="saving">
                <i v-if="!saving" class="ri-check-line"></i>
                <span v-if="saving">Đang lưu...</span>
                <span v-else-if="isMultiImport">Lưu tất cả ({{ importedList.length }} KH)</span>
                <span v-else>{{ isEditing ? 'Lưu cập nhật' : 'Thêm khách hàng' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ================== MODAL 3: TIẾN ĐỘ TRẢ NỢ & LỊCH SỬ THANH TOÁN KHÁCH HÀNG (1:1 BAOGIAFIREBASE) ================== -->
    <div
      v-if="paymentModal.show && paymentModal.customer"
      class="modal vip-modal-overlay modal-fullscreen-overlay"
      @click.self="closePaymentModal"
      style="z-index: 10035;"
    >
      <div class="modal-card modal-wide vip-modal-card modal-fullscreen-card debt-payment-modal">
        <!-- HEADER -->
        <div
          class="modal-head modal-head-themed"
          style="justify-content: center; position: relative; margin-bottom: 0; padding: 14px 24px; border-bottom: none; border-radius: 0; flex-shrink: 0;"
        >
          <div
            class="dt-only-head"
            style="color: #ffffff; text-transform: uppercase; font-weight: 900; font-size: 16px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; max-width: calc(100% - 70px);"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span :title="paymentModal.row ? getPoContractContent(paymentModal.row) : ''" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              TIẾN ĐỘ TRẢ NỢ &amp; LỊCH SỬ THANH TOÁN<template v-if="paymentModal.row"> — {{ getPoContractContent(paymentModal.row, 58) }}</template>
            </span>
          </div>
          <div class="m-grab-head-stack">
            <span class="m-grab-eyebrow" :title="paymentModal.row ? getPoContractContent(paymentModal.row) : ''">
              {{ paymentModal.row ? ('Quản lý công nợ • ' + getPoContractContent(paymentModal.row, 38)) : 'Quản lý công nợ' }}
            </span>
            <span class="m-grab-title">Tiến độ &amp; Lịch sử thanh toán</span>
          </div>
          <button
            type="button"
            class="x"
            @click="closePaymentModal"
            style="color: #fff; position: absolute; right: 18px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.15); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;"
          >
            ✕
          </button>
        </div>

        <!-- TOP QUICK ACTION TOOLBAR (DESKTOP) -->
        <div
          class="cust-top-toolbar dt-only-debt-view"
          style="padding: 12px 32px; border-bottom: 1px solid rgba(148,163,184,0.16); background: rgba(15,23,42,0.35); display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; flex-shrink: 0;"
        >
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span style="font-size: 13px; font-weight: 800; color: #0284c7;">
              {{ getDebtCustomerDisplayName(paymentModal.customer) }}
            </span>
            <span class="tabular-nums" style="font-size: 12px; font-weight: 700; opacity: 0.9;">
              • Mã KH: <strong style="color: #10b981;">{{ getDebtCustomerCode(paymentModal.customer) }}</strong>
            </span>
            <span v-if="paymentModal.row" class="tabular-nums" style="font-size: 12px; font-weight: 700; opacity: 0.9;">
              • ID SaleReport: <strong style="color: #7c3aed;">{{ paymentModal.row.ID || paymentModal.row._firebaseKey }}</strong>
            </span>
            <span
              v-if="paymentModal.row"
              :style="{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: '800',
                background: paymentModal.scheduleMode === 'nhieu_dot' ? 'rgba(124, 58, 237, 0.14)' : 'rgba(2, 132, 199, 0.14)',
                color: paymentModal.scheduleMode === 'nhieu_dot' ? '#7c3aed' : '#0284c7',
                border: paymentModal.scheduleMode === 'nhieu_dot' ? '1px solid rgba(124, 58, 237, 0.35)' : '1px solid rgba(2, 132, 199, 0.35)'
              }"
            >
              <span v-if="paymentModal.scheduleMode === 'nhieu_dot'">Chia {{ modalEvaluatedInstallments.length }} đợt thanh toán</span>
              <span v-else>Thanh toán 1 lần (100% — Hạn: {{ paymentModal.singleDueDate || 'Chưa đặt' }})</span>
            </span>
          </div>

          <div v-if="paymentModal.row" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button
              type="button"
              data-guide="debt-dt-btn-schedule"
              @click="openScheduleSubModal"
              style="display: inline-flex; align-items: center; gap: 6px; background: #0284c7; color: #ffffff; border: none; border-radius: 7px; padding: 8px 14px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; cursor: pointer; width: fit-content; margin: 0; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.28);"
            >
              <span>Thiết lập Kế hoạch / Hạn thanh toán</span>
            </button>

            <button
              type="button"
              data-guide="debt-dt-btn-record"
              @click="openRecordPaymentSubModal()"
              style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 7px; padding: 8px 15px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; cursor: pointer; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.28); width: fit-content; margin: 0;"
            >
              <span>+ Ghi nhận đợt thanh toán mới</span>
            </button>
          </div>
        </div>

        <!-- MAIN FULLSCREEN WORKSPACE (DESKTOP) -->
        <div
          class="dt-only-debt-view"
          style="padding: 18px 32px; overflow: hidden; flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 16px;"
        >
          <!-- 4 KPI CARDS -->
          <div style="display: grid; grid-template-columns: repeat(4, minmax(180px, 1fr)); gap: 14px; flex-shrink: 0;">
            <div class="cust-group-box cust-group-company" style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 12px 16px;">
              <div style="font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase;">
                {{ paymentModal.row ? 'Tổng tiền sau VAT (PO)' : 'Tổng phải thu toàn KH' }}
              </div>
              <div class="tabular-nums" style="font-size: 19px; font-weight: 900; color: #0284c7; margin-top: 4px;">
                {{ formatVND(paymentModal.row ? poTongSauVat(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).tongSauVat) || '0' }} đ
              </div>
            </div>

            <div class="cust-group-box cust-group-main" style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 12px 16px;">
              <div style="font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase;">
                {{ paymentModal.row ? 'Khách đã thanh toán (PO)' : 'Đã thanh toán toàn KH' }}
              </div>
              <div class="tabular-nums" style="font-size: 19px; font-weight: 900; color: #10b981; margin-top: 4px;">
                {{ formatVND(paymentModal.row ? poDaThanhToan(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).daThanhToan) || '0' }} đ
              </div>
            </div>

            <div class="cust-group-box cust-group-sub" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.28); border-radius: 10px; padding: 12px 16px;">
              <div style="font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase;">Công nợ còn lại (PO)</div>
              <div
                class="tabular-nums"
                style="font-size: 19px; font-weight: 900; margin-top: 4px;"
                :style="{ color: (paymentModal.row ? poCongNo(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).congNo) > 0 ? '#ef4444' : '#10b981' }"
              >
                {{ formatVND(paymentModal.row ? poCongNo(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).congNo) || '0' }} đ
              </div>
            </div>

            <div class="cust-group-box cust-group-sub" style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 12px 16px;">
              <div style="font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase;">Tổng nợ toàn KH ({{ paymentModal.customerPOs.length }} PO)</div>
              <div class="tabular-nums" style="font-size: 19px; font-weight: 900; color: #d97706; margin-top: 4px;">
                {{ formatVND(getCustomerDebtSummary(paymentModal.customer).congNo) || '0' }} đ
              </div>
            </div>
          </div>

          <!-- 2-COLUMN SPLIT: LEFT PO SIDEBAR + RIGHT TABLES -->
          <div style="flex: 1; min-height: 0; display: grid; grid-template-columns: 310px 1fr; gap: 18px; overflow: hidden;">
            <!-- LEFT SIDEBAR: DANH SÁCH PO CỦA KHÁCH HÀNG -->
            <div
              data-guide="debt-dt-po-list"
              class="cust-group-box cust-group-sub debt-po-sidebar"
              style="background: rgba(148,163,184,0.04); border: 1px solid rgba(148,163,184,0.16); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; min-height: 0; overflow: hidden;"
            >
              <div class="cust-group-title-sub" style="font-size: 11.5px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.6px; flex-shrink: 0;">
                DANH SÁCH ĐƠN HÀNG PO ({{ paymentModal.customerPOs.length }})
              </div>

              <div v-if="paymentModal.customerPOs.length > 0" style="flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
                <div
                  v-for="po in paymentModal.customerPOs"
                  :key="po._firebaseKey || po.ID"
                  @click="selectPoInPaymentModal(po)"
                  class="debt-po-item"
                  style="padding: 11px 12px; border-radius: 9px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; transition: all 0.2s;"
                  :style="{
                    background: paymentModal.row && (paymentModal.row._firebaseKey === po._firebaseKey)
                      ? 'rgba(2, 132, 199, 0.14)'
                      : 'rgba(148, 163, 184, 0.08)',
                    border: paymentModal.row && (paymentModal.row._firebaseKey === po._firebaseKey)
                      ? '2px solid #0284c7'
                      : '1px solid rgba(148, 163, 184, 0.25)'
                  }"
                >
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                    <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;">
                      <span
                        :title="getPoContractContent(po)"
                        style="font-size: 12.5px; font-weight: 800; color: #0284c7; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;"
                      >
                        {{ getPoContractContent(po) }}
                      </span>
                      <span v-if="getPoCreatedDateShort(po)" class="tabular-nums" style="font-size: 10.5px; color: #64748b; font-weight: 600;">
                        Ngày tạo: {{ getPoCreatedDateShort(po) }}
                      </span>
                    </div>
                    <span
                      style="padding: 2px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 800; flex-shrink: 0; white-space: nowrap;"
                      :style="{
                        background: poCongNo(po) > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.16)',
                        color: poCongNo(po) > 0 ? '#ef4444' : '#10b981'
                      }"
                    >
                      {{ poCongNo(po) > 0 ? 'Còn nợ' : 'Đã tất toán' }}
                    </span>
                  </div>
                  <div class="tabular-nums" style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; opacity: 0.85;">
                    <span>Tổng sau VAT:</span>
                    <strong>{{ formatVND(poTongSauVat(po)) || '0' }} đ</strong>
                  </div>
                  <div class="tabular-nums" style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px;">
                    <span style="opacity: 0.85;">Còn nợ:</span>
                    <strong :style="{ color: poCongNo(po) > 0 ? '#ef4444' : '#10b981' }">{{ formatVND(poCongNo(po)) || '0' }} đ</strong>
                  </div>
                </div>
              </div>
              <div v-else style="flex: 1; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(148,163,184,0.3); border-radius: 8px; padding: 18px; text-align: center; color: #64748b; font-size: 12.5px;">
                Khách hàng này hiện chưa có đơn hàng (PO) nào trong <code>sale_report</code>.
              </div>
            </div>

            <!-- RIGHT MAIN AREA: 2 TABLES STACKED & FLEX-EXPANDED -->
            <div style="display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow: hidden;">
              <!-- BẢNG 1: TIẾN ĐỘ KẾ HOẠCH & MỐC HẠN THANH TOÁN -->
              <div
                v-if="paymentModal.row"
                data-guide="debt-dt-schedule-box"
                class="cust-group-box cust-group-company"
                style="background: rgba(56,189,248,0.04); border: 1px solid rgba(56,189,248,0.16); border-radius: 10px; padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; max-height: 45%; min-height: 175px; overflow: hidden;"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; flex-shrink: 0;">
                  <span style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">
                    Tiến độ Kế hoạch &amp; Mốc hạn thanh toán ({{ modalEvaluatedInstallments.length }} đợt)
                  </span>
                  <button
                    type="button"
                    @click="openScheduleSubModal"
                    style="background: rgba(2, 132, 199, 0.12); color: #0284c7; border: 1px solid rgba(2, 132, 199, 0.35); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer; width: fit-content; margin: 0;"
                  >
                    Chỉnh sửa mốc hạn / Chia đợt
                  </button>
                </div>

                <div class="quote-table-wrap" style="flex: 1; min-height: 0; overflow: auto;">
                  <table style="width: 100%; min-width: 720px; border-collapse: collapse; font-size: 12px;">
                    <thead>
                      <tr>
                        <th style="padding: 9px 12px; width: 55px;">Đợt</th>
                        <th style="padding: 9px 12px; text-align: left;">Nội dung đợt</th>
                        <th style="padding: 9px 12px; text-align: right; width: 80px;">Tỷ lệ</th>
                        <th style="padding: 9px 12px; text-align: right;">Phải thu</th>
                        <th style="padding: 9px 12px; text-align: right;">Đã thu</th>
                        <th style="padding: 9px 12px; text-align: right;">Còn thiếu</th>
                        <th style="padding: 9px 12px; text-align: left;">Mốc hạn TT</th>
                        <th style="padding: 9px 12px; text-align: left;">Trạng thái hạn</th>
                        <th style="padding: 9px 12px; text-align: center; width: 110px;">Thu nhanh</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(inst, idx) in modalEvaluatedInstallments" :key="idx" class="quote-item-row">
                        <td class="tabular-nums" style="padding: 9px 12px; font-weight: 800; color: #7c3aed;">#{{ inst.dot }}</td>
                        <td style="padding: 9px 12px; font-weight: 600;">{{ inst.noi_dung }}</td>
                        <td class="tabular-nums" style="padding: 9px 12px; text-align: right; font-weight: 700; color: #0284c7;">{{ inst.ty_le_pct }}%</td>
                        <td class="tabular-nums" style="padding: 9px 12px; text-align: right; font-weight: 700;">{{ formatVND(inst.so_tien_phai_thu) || '0' }} đ</td>
                        <td class="tabular-nums" style="padding: 9px 12px; text-align: right; font-weight: 700; color: #10b981;">{{ formatVND(inst.da_thu) || '0' }} đ</td>
                        <td class="tabular-nums" style="padding: 9px 12px; text-align: right; font-weight: 700;" :style="{ color: inst.con_thieu > 0 ? '#ef4444' : '#64748b' }">
                          {{ formatVND(inst.con_thieu) || '0' }} đ
                        </td>
                        <td class="tabular-nums" style="padding: 9px 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 700;">
                          {{ inst.han_thanh_toan || 'Chưa đặt hạn' }}
                        </td>
                        <td style="padding: 9px 12px;">
                          <span
                            :style="{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: inst.statusColor,
                              background: 'rgba(148, 163, 184, 0.12)',
                              border: `1px solid ${inst.statusColor}`
                            }"
                          >
                            <span>{{ inst.statusLabel }}</span>
                          </span>
                        </td>
                        <td style="padding: 9px 12px; text-align: center;">
                          <button
                            v-if="inst.con_thieu > 0"
                            type="button"
                            @click="openRecordPaymentSubModal(inst)"
                            style="background: #10b981; color: #ffffff; border: none; border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 800; cursor: pointer; white-space: nowrap; width: fit-content; margin: 0;"
                          >
                            Thu đợt này
                          </button>
                          <span v-else style="font-size: 11px; color: #10b981; font-weight: 800;">Hoàn tất</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- BẢNG 2: LỊCH SỬ THANH TOÁN THỰC TẾ -->
              <div
                data-guide="debt-dt-history-box"
                class="cust-group-box cust-group-main"
                style="background: rgba(16,185,129,0.04); border: 1px solid rgba(16,185,129,0.16); border-radius: 10px; padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; flex: 1; min-height: 0; overflow: hidden;"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; flex-shrink: 0;">
                  <span
                    :title="paymentModal.row ? getPoContractContent(paymentModal.row) : ''"
                    style="font-size: 12px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px;"
                  >
                    Lịch sử thanh toán thực tế {{ paymentModal.row ? ('— ' + getPoContractContent(paymentModal.row, 56)) : 'của Khách hàng' }}
                    ({{ currentModalPaymentHistory.length }} lần)
                  </span>
                </div>

                <div class="quote-table-wrap" style="flex: 1; min-height: 0; overflow: auto;">
                  <table style="width: 100%; min-width: 780px; border-collapse: collapse; font-size: 12px;">
                    <thead>
                      <tr>
                        <th style="padding: 10px 12px; width: 56px; text-align: left;">Lần</th>
                        <th style="padding: 10px 12px; text-align: left; white-space: nowrap;">Thời gian TT</th>
                        <th style="padding: 10px 12px; text-align: left;">Tên KH</th>
                        <th style="padding: 10px 12px; text-align: left;">Tên Công ty</th>
                        <th style="padding: 10px 12px; text-align: right; white-space: nowrap;">Số tiền thanh toán</th>
                        <th style="padding: 10px 12px; text-align: right; white-space: nowrap;">Công nợ còn lại</th>
                        <th style="padding: 10px 12px; text-align: left;">Ghi chú</th>
                        <th style="padding: 10px 12px; text-align: center; width: 65px;">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(h, idx) in currentModalPaymentHistory" :key="h.id || idx" class="quote-item-row">
                        <td
                          class="tabular-nums"
                          :title="h.id ? ('Mã GD: ' + h.id) : ''"
                          style="padding: 10px 12px; font-weight: 800; color: #0284c7;"
                        >
                          #{{ currentModalPaymentHistory.length - idx }}
                        </td>
                        <td class="tabular-nums" style="padding: 10px 12px; font-weight: 600; white-space: nowrap;">{{ h.thoi_gian_thanh_toan || '—' }}</td>
                        <td style="padding: 10px 12px; font-weight: 600;">{{ getPaymentHistoryCustomerInfo(h).tenKH }}</td>
                        <td style="padding: 10px 12px; font-weight: 600; max-width: 220px; word-break: break-word;">{{ getPaymentHistoryCustomerInfo(h).tenCongTy }}</td>
                        <td class="tabular-nums" style="padding: 10px 12px; text-align: right; font-weight: 800; color: #10b981; white-space: nowrap;">
                          +{{ formatVND(toNum(h.so_tien_thanh_toan)) || '0' }} đ
                        </td>
                        <td
                          class="tabular-nums"
                          style="padding: 10px 12px; text-align: right; font-weight: 800; white-space: nowrap;"
                          :style="{ color: toNum(h.cong_no_con_lai) > 0 ? '#ef4444' : '#10b981' }"
                        >
                          {{ formatVND(toNum(h.cong_no_con_lai)) || '0' }} đ
                        </td>
                        <td style="padding: 10px 12px;">{{ h.ghi_chu || '—' }}</td>
                        <td style="padding: 10px 12px; text-align: center;">
                          <button
                            v-if="paymentModal.row"
                            type="button"
                            @click="deletePaymentHistoryItem(h)"
                            title="Xóa đợt thanh toán này và hoàn lại công nợ"
                            style="background: rgba(239, 68, 68, 0.14); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 6px; padding: 5px 9px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                      <tr v-if="currentModalPaymentHistory.length === 0">
                        <td colspan="8" style="padding: 28px; text-align: center; color: #64748b; font-style: italic;">
                          Chưa có lịch sử thanh toán nào.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MOBILE FINTECH WORKSPACE (<= 1100px) -->
        <div class="m-debt-body">
          <!-- 1. COMPACT CUSTOMER IDENTITY & PLAN CARD -->
          <div class="m-debt-cust-card">
            <div class="m-debt-cust-top">
              <div class="m-debt-cust-name">
                {{ getDebtCustomerDisplayName(paymentModal.customer) }}
              </div>
              <span class="m-debt-cust-code">{{ getDebtCustomerCode(paymentModal.customer) }}</span>
            </div>

            <div v-if="paymentModal.row" data-guide="debt-m-plan-row" class="m-debt-plan-row">
              <span class="m-debt-plan-badge" :class="paymentModal.scheduleMode === 'nhieu_dot' ? 'is-multi' : 'is-single'">
                <svg class="m-debt-plan-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span v-if="paymentModal.scheduleMode === 'nhieu_dot'">Chia {{ modalEvaluatedInstallments.length }} đợt thanh toán</span>
                <span v-else>Thanh toán 1 lần • Hạn: {{ paymentModal.singleDueDate || 'Chưa đặt' }}</span>
              </span>

              <button type="button" class="m-debt-plan-edit-btn" @click="openScheduleSubModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Sửa hạn</span>
              </button>
            </div>
          </div>

          <!-- 2. BENTO 2x2 KPI GRID + PROGRESS BAR -->
          <div class="m-debt-kpi-section">
            <div class="m-debt-bento-grid">
              <div class="m-debt-kpi-tile is-sky">
                <div class="m-debt-kpi-lbl">{{ paymentModal.row ? 'Tổng sau VAT (PO)' : 'Tổng phải thu KH' }}</div>
                <div class="m-debt-kpi-val">
                  {{ formatVND(paymentModal.row ? poTongSauVat(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).tongSauVat) || '0' }} đ
                </div>
              </div>

              <div class="m-debt-kpi-tile is-emerald">
                <div class="m-debt-kpi-lbl">{{ paymentModal.row ? 'Đã thanh toán' : 'Đã thu toàn KH' }}</div>
                <div class="m-debt-kpi-val">
                  {{ formatVND(paymentModal.row ? poDaThanhToan(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).daThanhToan) || '0' }} đ
                </div>
              </div>

              <div
                class="m-debt-kpi-tile"
                :class="(paymentModal.row ? poCongNo(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).congNo) > 0 ? 'is-rose' : 'is-emerald'"
              >
                <div class="m-debt-kpi-lbl">Công nợ còn lại</div>
                <div class="m-debt-kpi-val">
                  {{ formatVND(paymentModal.row ? poCongNo(paymentModal.row) : getCustomerDebtSummary(paymentModal.customer).congNo) || '0' }} đ
                </div>
              </div>

              <div class="m-debt-kpi-tile is-amber">
                <div class="m-debt-kpi-lbl">Tổng nợ KH ({{ paymentModal.customerPOs.length }} PO)</div>
                <div class="m-debt-kpi-val">
                  {{ formatVND(getCustomerDebtSummary(paymentModal.customer).congNo) || '0' }} đ
                </div>
              </div>
            </div>

            <div class="m-debt-progress-card">
              <div class="m-debt-progress-head">
                <span class="m-debt-progress-lbl" :title="paymentModal.row ? getPoContractContent(paymentModal.row) : ''">
                  Tiến độ thanh toán{{ paymentModal.row ? (' • ' + getPoContractContent(paymentModal.row, 28)) : '' }}
                </span>
                <span class="m-debt-progress-pct" :class="{ 'is-done': modalDebtProgressPct >= 100 }">{{ modalDebtProgressPct }}%</span>
              </div>
              <div class="m-debt-progress-track">
                <div class="m-debt-progress-fill" :style="{ width: modalDebtProgressPct + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- 3. HORIZONTAL SCROLLABLE PO PILLS -->
          <div data-guide="debt-m-po-strip" class="m-debt-po-strip">
            <div class="m-debt-sec-head">
              <span class="m-debt-sec-title">Đơn hàng PO ({{ paymentModal.customerPOs.length }})</span>
              <span v-if="paymentModal.customerPOs.length > 1" class="m-debt-sec-hint">Vuốt ngang để chọn PO</span>
            </div>

            <div v-if="paymentModal.customerPOs.length > 0" class="m-debt-po-scroll">
              <button
                v-for="po in paymentModal.customerPOs"
                :key="'m-po-' + (po._firebaseKey || po.ID)"
                type="button"
                class="m-debt-po-pill"
                :title="getPoContractContent(po)"
                :class="{
                  'is-active': paymentModal.row && (paymentModal.row._firebaseKey === po._firebaseKey),
                  'is-paid': poCongNo(po) <= 0
                }"
                @click="selectPoInPaymentModal(po)"
              >
                <span class="m-debt-po-code">{{ getPoContractContent(po) }}</span>
                <span class="m-debt-po-sep">•</span>
                <span class="m-debt-po-state">{{ poCongNo(po) > 0 ? ('Nợ ' + (formatVND(poCongNo(po)) || '0') + ' đ') : 'Đã tất toán' }}</span>
              </button>
            </div>
            <div v-else class="m-debt-po-empty">
              Khách hàng hiện chưa có đơn hàng PO nào trên hệ thống.
            </div>
          </div>

          <!-- 4. SEGMENTED TABS & FINTECH CARDS -->
          <div class="m-debt-tabs-wrap">
            <div v-if="paymentModal.row" data-guide="debt-m-tabs" class="m-debt-tabs">
              <button
                type="button"
                class="m-debt-tab-btn"
                :class="{ active: mobileDebtActiveTab === 'schedule' }"
                @click="mobileDebtActiveTab = 'schedule'"
              >
                <span>Kế hoạch &amp; Mốc hạn</span>
                <span class="m-debt-tab-count">{{ modalEvaluatedInstallments.length }}</span>
              </button>
              <button
                type="button"
                class="m-debt-tab-btn"
                :class="{ active: mobileDebtActiveTab === 'history' }"
                @click="mobileDebtActiveTab = 'history'"
              >
                <span>Lịch sử đã thu</span>
                <span class="m-debt-tab-count">{{ currentModalPaymentHistory.length }}</span>
              </button>
            </div>
            <div v-else class="m-debt-sec-head">
              <span class="m-debt-sec-title">Lịch sử thanh toán ({{ currentModalPaymentHistory.length }})</span>
            </div>

            <!-- TAB 1: KE HOACH & MOC HAN THANH TOAN -->
            <div v-if="paymentModal.row && mobileDebtActiveTab === 'schedule'" class="m-debt-card-list">
              <div v-for="(inst, idx) in modalEvaluatedInstallments" :key="'m-inst-' + idx" class="m-debt-inst-card">
                <div class="m-debt-inst-head">
                  <div class="m-debt-inst-title-group">
                    <span class="m-debt-inst-dot">#{{ inst.dot }}</span>
                    <span class="m-debt-inst-pct">{{ inst.ty_le_pct }}%</span>
                    <span class="m-debt-inst-name">{{ inst.noi_dung }}</span>
                  </div>
                  <span class="m-debt-inst-status" :class="'status-' + inst.status">{{ inst.statusLabel }}</span>
                </div>

                <div class="m-debt-inst-metrics">
                  <div class="m-debt-metric-col">
                    <span class="m-debt-metric-lbl">Phải thu</span>
                    <strong class="m-debt-metric-val">{{ formatVND(inst.so_tien_phai_thu) || '0' }} đ</strong>
                  </div>
                  <div class="m-debt-metric-col">
                    <span class="m-debt-metric-lbl">Đã thu</span>
                    <strong class="m-debt-metric-val is-emerald">{{ formatVND(inst.da_thu) || '0' }} đ</strong>
                  </div>
                  <div class="m-debt-metric-col">
                    <span class="m-debt-metric-lbl">Còn thiếu</span>
                    <strong class="m-debt-metric-val" :class="inst.con_thieu > 0 ? 'is-rose' : 'is-muted'">{{ formatVND(inst.con_thieu) || '0' }} đ</strong>
                  </div>
                </div>

                <div class="m-debt-inst-foot">
                  <div class="m-debt-inst-due">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Hạn TT: <strong>{{ inst.han_thanh_toan || 'Chưa đặt hạn' }}</strong></span>
                  </div>
                  <button
                    v-if="inst.con_thieu > 0"
                    type="button"
                    class="m-debt-inst-pay-btn"
                    @click="openRecordPaymentSubModal(inst)"
                  >
                    Thu đợt này
                  </button>
                  <span v-else class="m-debt-inst-done-tag">Hoàn tất</span>
                </div>
              </div>
            </div>

            <!-- TAB 2: LICH SU DA THU -->
            <div v-if="!paymentModal.row || mobileDebtActiveTab === 'history'" class="m-debt-card-list">
              <template v-if="currentModalPaymentHistory.length > 0">
                <div v-for="(h, idx) in currentModalPaymentHistory" :key="'m-hist-' + (h.id || idx)" class="m-debt-hist-card">
                  <div class="m-debt-hist-top">
                    <div class="m-debt-hist-meta">
                      <span class="m-debt-hist-idx" :title="h.id ? ('Mã GD: ' + h.id) : ''">Lần #{{ currentModalPaymentHistory.length - idx }}</span>
                      <span class="m-debt-hist-time">{{ h.thoi_gian_thanh_toan || '—' }}</span>
                    </div>
                    <span class="m-debt-hist-amt">+{{ formatVND(toNum(h.so_tien_thanh_toan)) || '0' }} đ</span>
                  </div>

                  <div class="m-debt-hist-cust-info">
                    <span v-if="getPaymentHistoryCustomerInfo(h).tenKH !== '—'" class="m-debt-hist-kh">
                      KH: <strong>{{ getPaymentHistoryCustomerInfo(h).tenKH }}</strong>
                    </span>
                    <span v-if="getPaymentHistoryCustomerInfo(h).tenCongTy !== '—'" class="m-debt-hist-cty">
                      Cty: <strong>{{ getPaymentHistoryCustomerInfo(h).tenCongTy }}</strong>
                    </span>
                  </div>

                  <div class="m-debt-hist-mid">
                    <span class="m-debt-hist-rem">
                      Dư nợ sau GD:
                      <strong :class="toNum(h.cong_no_con_lai) > 0 ? 'is-rose' : 'is-emerald'">
                        {{ formatVND(toNum(h.cong_no_con_lai)) || '0' }} đ
                      </strong>
                    </span>
                    <button
                      v-if="paymentModal.row"
                      type="button"
                      class="m-debt-hist-del-btn"
                      title="Xóa đợt thanh toán này và hoàn lại công nợ"
                      @click="deletePaymentHistoryItem(h)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Xóa</span>
                    </button>
                  </div>

                  <div v-if="h.ghi_chu" class="m-debt-hist-note">{{ h.ghi_chu }}</div>
                </div>
              </template>

              <div v-else data-guide="debt-m-history-empty" class="m-debt-empty-box">
                <svg class="m-debt-empty-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                <div class="m-debt-empty-title">Chưa có lịch sử thanh toán</div>
                <div class="m-debt-empty-sub">Các đợt khách hàng thanh toán thực tế sẽ được lưu tại đây.</div>
                <button
                  v-if="paymentModal.row"
                  type="button"
                  class="m-debt-empty-cta"
                  @click="openRecordPaymentSubModal()"
                >
                  + Ghi nhận đợt thanh toán đầu tiên
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div
          class="cust-modal-footer fullscreen-modal-footer debt-modal-footer"
          style="padding: 14px 32px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end; flex-shrink: 0; border-radius: 0 !important;"
        >
          <button
            type="button"
            class="modal-btn-secondary btn-debt-close"
            @click="closePaymentModal"
            style="padding: 10px 24px; border-radius: 8px; background: rgba(255,255,255,0.1); color: #f8fafc; border: 1px solid rgba(255,255,255,0.2); font-weight: 700; cursor: pointer; width: fit-content; margin: 0;"
          >
            Đóng
          </button>
          <button v-if="paymentModal.row" type="button" data-guide="debt-m-btn-schedule" class="m-only-debt-btn btn-debt-schedule" @click="openScheduleSubModal">
            Kế hoạch hạn
          </button>
          <button v-if="paymentModal.row" type="button" data-guide="debt-m-btn-record" class="m-only-debt-btn btn-debt-record" @click="openRecordPaymentSubModal()">
            + Ghi nhận TT
          </button>
        </div>
      </div>
    </div>

    <!-- SUB-MODAL 1: Thiết lập Kế hoạch & Mốc thời gian phải thanh toán -->
    <div
      v-if="paymentModal.show && paymentModal.row && paymentModal.showScheduleSubModal"
      class="modal vip-modal-overlay"
      @click.self="attemptCloseScheduleSubModal"
      style="z-index: 10040; padding: 20px; background: rgba(2, 6, 23, 0.78);"
    >
      <div class="modal-card vip-modal-card debt-schedule-submodal" style="max-width: 920px; width: 95vw; overflow: hidden; display: flex; flex-direction: column; max-height: 90vh;">
        <div class="modal-head modal-head-themed" style="padding: 14px 22px; margin-bottom: 0; border-radius: 0; display: flex; justify-content: space-between; align-items: center;">
          <div style="min-width: 0; padding-right: 12px;">
            <h4 :title="getPoContractContent(paymentModal.row)" style="margin: 0; color: #ffffff !important; font-size: 15px; font-weight: 800; text-transform: uppercase;">
              Thiết lập Kế hoạch &amp; Mốc hạn thanh toán — {{ getPoContractContent(paymentModal.row, 52) }}
            </h4>
            <div class="tabular-nums" style="font-size: 12px; color: #ffffff; opacity: 0.9; margin-top: 2px;">
              Tổng giá trị PO sau VAT: <strong>{{ formatVND(poTongSauVat(paymentModal.row)) || '0' }} đ</strong>
              • Đã thu: <strong>{{ formatVND(poDaThanhToan(paymentModal.row)) || '0' }} đ</strong>
            </div>
          </div>
          <button type="button" class="x" @click="attemptCloseScheduleSubModal">✕</button>
        </div>

        <div class="debt-sub-body" style="padding: 18px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <div class="debt-sub-seg" style="display: inline-flex; background: rgba(148, 163, 184, 0.12); border: 1px solid rgba(148, 163, 184, 0.3); border-radius: 8px; padding: 3px; gap: 4px; align-self: flex-start;">
            <button
              type="button"
              @click="setScheduleMode('mot_lan')"
              :style="{
                background: paymentModal.scheduleMode === 'mot_lan' ? '#0284c7' : 'transparent',
                color: paymentModal.scheduleMode === 'mot_lan' ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                width: 'fit-content',
                margin: 0
              }"
            >
              Thanh toán 1 lần (100%)
            </button>
            <button
              type="button"
              @click="setScheduleMode('nhieu_dot')"
              :style="{
                background: paymentModal.scheduleMode === 'nhieu_dot' ? '#7c3aed' : 'transparent',
                color: paymentModal.scheduleMode === 'nhieu_dot' ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                width: 'fit-content',
                margin: 0
              }"
            >
              Chia theo đợt (% khác nhau)
            </button>
          </div>

          <div
            v-if="paymentModal.scheduleMode === 'mot_lan'"
            class="cust-group-box cust-group-sub debt-single-due-box"
            style="display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 10px; padding: 16px;"
          >
            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; width: 100%;">
              <div class="debt-due-field-wrap">
                <label class="debt-sub-lbl">Mốc hạn thanh toán (DD/MM/YYYY)</label>
                <div class="debt-due-inputs-row" style="display: flex; align-items: center; gap: 8px;">
                  <input type="text" v-model="paymentModal.singleDueDate" class="cf-input tabular-nums" placeholder="DD/MM/YYYY" style="width: 145px; padding: 8px 10px; border-radius: 8px; margin: 0;" />
                  <input type="date" :value="debtDdmmyyyyToIso(paymentModal.singleDueDate)" @change="onSingleDueDatePickerChange" class="cf-input tabular-nums" style="width: 160px; padding: 7px 10px; border-radius: 8px; margin: 0;" />
                </div>
              </div>
              <div>
                <label class="debt-sub-lbl">Chọn nhanh hạn TT (từ ngày tạo PO)</label>
                <div class="debt-sub-chips" style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button type="button" class="modal-btn-secondary debt-quick-chip" @click="setSingleDueDateDays(7, true)">+7 ngày</button>
                  <button type="button" class="modal-btn-secondary debt-quick-chip" @click="setSingleDueDateDays(15, true)">+15 ngày</button>
                  <button type="button" class="modal-btn-secondary debt-quick-chip" @click="setSingleDueDateDays(30, true)">+30 ngày</button>
                  <button type="button" class="modal-btn-secondary debt-quick-chip" @click="setSingleDueDateDays(45, true)">+45 ngày</button>
                  <button type="button" class="modal-btn-secondary debt-quick-chip" @click="setSingleDueDateDays(60, true)">+60 ngày</button>
                </div>
              </div>
            </div>
          </div>

          <div v-else style="display: flex; flex-direction: column; gap: 12px;">
            <div class="debt-sub-chips" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-size: 11.5px; color: #94a3b8; font-weight: 600;">Mẫu chia đợt nhanh:</span>
                <button type="button" @click="applySchedulePreset([30, 70], ['Đợt 1 - Tạm ứng 30%', 'Đợt 2 - Tất toán 70%'])" style="background: rgba(2, 132, 199, 0.14); color: #0284c7; border: 1px solid rgba(2, 132, 199, 0.35); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">2 đợt (30% - 70%)</button>
                <button type="button" @click="applySchedulePreset([50, 50], ['Đợt 1 - Tạm ứng 50%', 'Đợt 2 - Tất toán 50%'])" style="background: rgba(2, 132, 199, 0.14); color: #0284c7; border: 1px solid rgba(2, 132, 199, 0.35); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">2 đợt (50% - 50%)</button>
                <button type="button" @click="applySchedulePreset([30, 50, 20], ['Đợt 1 - Tạm ứng 30%', 'Đợt 2 - Giao hàng 50%', 'Đợt 3 - Nghiệm thu 20%'])" style="background: rgba(124, 58, 237, 0.14); color: #7c3aed; border: 1px solid rgba(124, 58, 237, 0.35); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">3 đợt (30% - 50% - 20%)</button>
              </div>
              <button type="button" @click="addScheduleInstallment" style="background: #10b981; color: #ffffff; border: none; border-radius: 6px; padding: 5px 11px; font-size: 11.5px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">+ Thêm đợt TT</button>
            </div>

            <div class="debt-sub-table-wrap quote-table-wrap" style="overflow-x: auto; border: 1px solid rgba(148,163,184,0.3); border-radius: 10px;">
              <table style="width: 100%; min-width: 680px; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr>
                    <th style="padding: 8px 10px; width: 46px;">Đợt</th>
                    <th style="padding: 8px 10px; text-align: left;">Nội dung đợt</th>
                    <th style="padding: 8px 10px; width: 90px; text-align: right;">Tỷ lệ (%)</th>
                    <th style="padding: 8px 10px; width: 150px; text-align: right;">Số tiền phải thu</th>
                    <th style="padding: 8px 10px; width: 155px; text-align: left;">Hạn thanh toán</th>
                    <th style="padding: 8px 10px; text-align: center; width: 55px;">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(inst, idx) in paymentModal.scheduleItems" :key="idx" class="quote-item-row">
                    <td class="tabular-nums" style="padding: 8px 10px; font-weight: 800; color: #7c3aed;">#{{ idx + 1 }}</td>
                    <td style="padding: 8px 10px;">
                      <input type="text" v-model="inst.noi_dung" class="cf-input" style="padding: 6px 8px; font-size: 12px; border-radius: 6px; margin: 0;" />
                    </td>
                    <td style="padding: 8px 10px;">
                      <FormattedInput
                        :modelValue="inst.ty_le_pct"
                        :decimals="2"
                        @update:modelValue="onInstallmentPctChange(idx, $event)"
                        placeholder="0"
                        class="cf-input tabular-nums"
                        style="padding: 6px; font-size: 12px; text-align: right; border-radius: 6px; margin: 0;"
                      />
                    </td>
                    <td style="padding: 8px 10px;">
                      <input
                        type="text"
                        inputmode="numeric"
                        :value="inst.so_tien_phai_thu > 0 ? inst.so_tien_phai_thu.toLocaleString('vi-VN') : ''"
                        @input="onInstallmentAmountInput(idx, $event)"
                        @paste="onInstallmentAmountPaste(idx, $event)"
                        placeholder="0"
                        class="cf-input tabular-nums"
                        style="padding: 6px 8px; font-size: 12px; text-align: right; border-radius: 6px; margin: 0;"
                      />
                    </td>
                    <td style="padding: 8px 10px;">
                      <input
                        type="date"
                        :value="debtDdmmyyyyToIso(inst.han_thanh_toan)"
                        @change="onInstallmentDatePickerChange(idx, $event)"
                        class="cf-input tabular-nums"
                        style="padding: 5px 8px; font-size: 12px; border-radius: 6px; margin: 0;"
                      />
                    </td>
                    <td style="padding: 8px 10px; text-align: center;">
                      <button
                        v-if="paymentModal.scheduleItems.length > 1"
                        type="button"
                        class="debt-sub-row-del"
                        @click="removeScheduleInstallment(idx)"
                        style="background: rgba(239, 68, 68, 0.14); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 6px; padding: 4px 8px; cursor: pointer; width: fit-content; margin: 0;"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="debt-sub-balance-row tabular-nums" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #94a3b8;">
              <div>
                Tổng tỷ lệ: <strong :style="{ color: Math.abs(modalScheduleTotalPct - 100) < 0.1 ? '#10b981' : '#d97706' }">{{ modalScheduleTotalPct }}%</strong>
                • Tổng tiền kế hoạch: <strong>{{ formatVND(modalScheduleTotalAmount) || '0' }} / {{ formatVND(poTongSauVat(paymentModal.row)) || '0' }} đ</strong>
              </div>
              <button
                v-if="Math.abs(modalScheduleTotalAmount - poTongSauVat(paymentModal.row)) > 1"
                type="button"
                class="debt-sub-balance-btn"
                @click="balanceLastInstallment"
                style="background: rgba(245, 158, 11, 0.15); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;"
              >
                Tự động cân bằng đợt cuối cho khớp 100%
              </button>
            </div>
          </div>
        </div>

        <div class="cust-modal-footer debt-sub-footer" style="padding: 14px 22px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="modal-btn-secondary debt-sub-cancel" @click="attemptCloseScheduleSubModal" style="padding: 8px 18px; border-radius: 8px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">Hủy</button>
          <button type="button" class="debt-sub-save" @click="savePaymentScheduleOnly" :disabled="paymentModal.savingSchedule" style="padding: 8px 18px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">
            {{ paymentModal.savingSchedule ? 'Đang lưu...' : 'Lưu Kế hoạch & Hạn TT' }}
          </button>
        </div>
      </div>
    </div>

    <!-- SUB-MODAL 2: Ghi nhận đợt thanh toán mới -->
    <div
      v-if="paymentModal.show && paymentModal.row && paymentModal.showRecordSubModal"
      class="modal vip-modal-overlay"
      @click.self="attemptCloseRecordSubModal"
      style="z-index: 10040; padding: 20px; background: rgba(2, 6, 23, 0.78);"
    >
      <div class="modal-card vip-modal-card debt-record-submodal" style="max-width: 640px; width: 95vw; overflow: hidden; display: flex; flex-direction: column;">
        <div class="modal-head modal-head-themed" style="padding: 14px 22px; margin-bottom: 0; border-radius: 0; display: flex; justify-content: space-between; align-items: center;">
          <div style="min-width: 0; padding-right: 12px;">
            <h4 :title="getPoContractContent(paymentModal.row)" style="margin: 0; color: #ffffff !important; font-size: 15px; font-weight: 800; text-transform: uppercase;">
              Ghi nhận đợt thanh toán mới — {{ getPoContractContent(paymentModal.row, 44) }}
            </h4>
            <div class="tabular-nums" style="font-size: 12px; color: #ffffff; opacity: 0.9; margin-top: 2px;">
              Công nợ hiện tại của đơn hàng: <strong>{{ formatVND(poCongNo(paymentModal.row)) || '0' }} đ</strong>
            </div>
          </div>
          <button type="button" class="x" @click="attemptCloseRecordSubModal">✕</button>
        </div>

        <div class="debt-sub-body" style="padding: 18px 22px; display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="debt-sub-lbl">Số tiền khách thanh toán (VNĐ)</label>
            <input
              type="text"
              inputmode="numeric"
              :value="paymentModal.amountStr"
              @focus="onPaymentAmountFocus"
              @blur="onPaymentAmountBlur"
              @input="onPaymentAmountInput"
              @paste="onPaymentAmountPaste"
              placeholder="0"
              class="cf-input tabular-nums"
              style="width: 100%; padding: 10px 14px; border-radius: 8px; font-size: 17px; font-weight: 800; color: #10b981; text-align: right; margin: 0;"
            />

            <div class="debt-quick-amount-below" style="margin-top: 8px;">
              <div class="debt-sub-chips" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-right: 2px;">Chọn nhanh:</span>
                <template v-if="paymentModal.scheduleMode === 'nhieu_dot'">
                  <button
                    v-for="(inst, idx) in modalEvaluatedInstallments.filter(x => x.con_thieu > 0)"
                    :key="'quick-inst-' + idx"
                    type="button"
                    @click="applyQuickInstallmentAmount(inst)"
                    style="background: rgba(124, 58, 237, 0.14); color: #7c3aed; border: 1px solid rgba(124, 58, 237, 0.35); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;"
                  >
                    Đợt {{ inst.dot }} ({{ formatVND(inst.con_thieu) || '0' }} đ)
                  </button>
                </template>
                <button type="button" @click="setPaymentQuickPct(100)" style="background: rgba(16, 185, 129, 0.14); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">
                  Tất toán 100% nợ ({{ formatVND(poCongNo(paymentModal.row)) || '0' }})
                </button>
                <button type="button" @click="setPaymentQuickPct(50)" style="background: rgba(2, 132, 199, 0.14); color: #0284c7; border: 1px solid rgba(2, 132, 199, 0.35); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">
                  50% công nợ
                </button>
                <button type="button" @click="setPaymentQuickPct(30)" style="background: rgba(245, 158, 11, 0.14); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">
                  30% công nợ
                </button>
                <button
                  v-if="paymentModal.amount > 0"
                  type="button"
                  @click="resetPaymentAmountToZero"
                  style="background: rgba(148, 163, 184, 0.14); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.32); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;"
                >
                  Đặt về 0
                </button>
              </div>
            </div>

            <div
              v-if="poCongNo(paymentModal.row) > 0 && paymentModal.amount > poCongNo(paymentModal.row)"
              style="margin-top: 8px; padding: 8px 11px; border-radius: 7px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.38); color: #f59e0b; font-size: 11.5px; font-weight: 600;"
            >
              Lưu ý: Số tiền đang nhập vượt quá công nợ còn lại của đơn hàng ({{ formatVND(poCongNo(paymentModal.row)) || '0' }} đ).
            </div>
          </div>

          <div class="debt-record-2col" style="display: grid; grid-template-columns: 1fr 1.25fr; gap: 12px;">
            <div>
              <label class="debt-sub-lbl">Thời gian thanh toán</label>
              <input type="text" v-model="paymentModal.paymentTime" class="cf-input tabular-nums" placeholder="DD/MM/YYYY HH:mm:ss" style="width: 100%; padding: 9px 12px; border-radius: 8px; margin: 0;" />
            </div>
            <div>
              <label class="debt-sub-lbl">Ghi chú đợt thanh toán (Tùy chọn)</label>
              <input type="text" v-model="paymentModal.note" class="cf-input" placeholder="VD: Thanh toán đợt 1 chuyển khoản..." style="width: 100%; padding: 9px 12px; border-radius: 8px; margin: 0;" />
            </div>
          </div>

          <div
            class="cust-group-box cust-group-sub debt-preview-box tabular-nums"
            style="padding: 10px 12px; background: rgba(30, 41, 59, 0.5); border: 1px dashed rgba(148, 163, 184, 0.35); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #94a3b8;"
          >
            <span>
              Dự kiến Đã TT mới:
              <strong style="color: #10b981;">{{ formatVND(poDaThanhToan(paymentModal.row) + (paymentModal.amount || 0)) || '0' }} đ</strong>
            </span>
            <span>
              Công nợ còn lại:
              <strong :style="{ color: Math.max(0, poCongNo(paymentModal.row) - (paymentModal.amount || 0)) > 0 ? '#ef4444' : '#10b981', fontSize: '13px' }">
                {{ formatVND(Math.max(0, poCongNo(paymentModal.row) - (paymentModal.amount || 0))) || '0' }} đ
              </strong>
            </span>
          </div>
        </div>

        <div class="cust-modal-footer debt-sub-footer" style="padding: 14px 22px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="modal-btn-secondary debt-sub-cancel" @click="attemptCloseRecordSubModal" style="padding: 8px 18px; border-radius: 8px; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">Hủy</button>
          <button type="button" class="debt-sub-save" @click="submitPayment" :disabled="paymentModal.saving || paymentModal.amount <= 0" style="padding: 8px 18px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; font-weight: 700; cursor: pointer; width: fit-content; margin: 0;">
            {{ paymentModal.saving ? 'Đang lưu...' : 'Xác nhận Ghi nhận TT' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL 4: QUẢN LÝ NHÓM KHÁCH HÀNG (tagKH) ================== -->
    <div
      v-if="isTagModalOpen"
      class="modal vip-modal-overlay"
      style="z-index: 10030;"
      @click.self="isTagModalOpen = false"
    >
      <div class="modal-card vip-modal-card cf-tag-modal">
        <div class="modal-head modal-head-themed">
          <div class="dt-only-head cf-modal-dt-title">
            <i class="ri-price-tag-3-line"></i>
            <span>Quản Lý Nhóm Khách Hàng ({{ availableTags.length }})</span>
          </div>
          <div class="m-grab-head-stack">
            <span class="m-grab-eyebrow">Phân loại tệp KH</span>
            <span class="m-grab-title">Quản Lý Nhóm Khách Hàng</span>
          </div>
          <button type="button" class="x" @click="isTagModalOpen = false">✕</button>
        </div>

        <div class="cf-tag-modal-body">
          <div class="cf-tag-creator-row">
            <input
              type="text"
              v-model="newTagModalInput"
              @keydown.enter.prevent="createTagFromManager"
              placeholder="Nhập tên nhóm khách hàng mới..."
              class="cf-input"
            />
            <button type="button" class="cf-btn cf-btn-emerald cf-btn-sm" @click="createTagFromManager">
              + Tạo nhóm
            </button>
          </div>

          <div v-if="availableTags.length === 0" class="cf-tag-empty-box">
            <i class="ri-price-tag-line"></i>
            <p>Chưa có nhóm khách hàng nào trên hệ thống.</p>
          </div>

          <div v-else class="cf-tag-manage-list">
            <div v-for="tag in availableTags" :key="'mgr-' + tag" class="cf-tag-manage-row">
              <template v-if="editingTagId === tag">
                <input
                  type="text"
                  v-model="editTagValue"
                  @keydown.enter.prevent="saveTagEdit(tag)"
                  @keydown.esc.prevent="editingTagId = null"
                  class="cf-input"
                  style="flex: 1;"
                />
                <button type="button" class="cf-btn cf-btn-emerald cf-btn-sm" @click="saveTagEdit(tag)">Lưu</button>
                <button type="button" class="cf-btn cf-btn-slate cf-btn-sm" @click="editingTagId = null">Huỷ</button>
              </template>
              <template v-else>
                <div class="cf-tag-manage-info">
                  <span class="cf-tag-pill">{{ tag }}</span>
                  <span class="cf-tag-count tabular-nums">{{ getTagCustomerCount(tag) }} khách hàng</span>
                </div>
                <div class="cf-row-actions">
                  <button type="button" class="cf-icon-act is-edit-act" @click="startEditTag(tag)" title="Đổi tên nhóm">
                    <i class="ri-edit-line"></i>
                  </button>
                  <button type="button" class="cf-icon-act is-del-act" @click="deleteTagGlobal(tag)" title="Xóa nhóm khỏi tất cả KH">
                    <i class="ri-delete-bin-6-line"></i>
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="cust-modal-footer cf-simple-footer">
          <button type="button" class="modal-btn-secondary cf-btn cf-btn-slate" @click="isTagModalOpen = false">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL 4B: CHỌN / THÊM NGÀNH NGHỀ KINH DOANH ================== -->
    <div
      v-if="isIndustryPickerOpen"
      class="modal vip-modal-overlay"
      style="z-index: 10035;"
      @click.self="isIndustryPickerOpen = false"
    >
      <div class="modal-card vip-modal-card cf-tag-modal cf-industry-modal">
        <div class="modal-head modal-head-themed">
          <div class="dt-only-head cf-modal-dt-title">
            <i class="ri-briefcase-4-line"></i>
            <span>Chọn Ngành Nghề Kinh Doanh ({{ industryDirectoryList.length }})</span>
          </div>
          <div class="m-grab-head-stack">
            <span class="m-grab-eyebrow">Lĩnh vực hoạt động</span>
            <span class="m-grab-title">Chọn Ngành Nghề Kinh Doanh</span>
          </div>
          <button type="button" class="x" @click="isIndustryPickerOpen = false">✕</button>
        </div>

        <div class="cf-tag-modal-body">
          <div class="cf-industry-search-wrap">
            <i class="ri-search-line"></i>
            <input
              type="text"
              v-model="industrySearchQuery"
              placeholder="Tìm ngành nghề có sẵn..."
              class="cf-input"
              autofocus
            />
          </div>

          <div class="cf-tag-creator-row">
            <input
              type="text"
              v-model="newIndustryInput"
              @keydown.enter.prevent="createAndSelectIndustry"
              placeholder="Hoặc nhập ngành nghề mới rồi nhấn Enter..."
              class="cf-input"
            />
            <button type="button" class="cf-btn cf-btn-emerald cf-btn-sm" @click="createAndSelectIndustry">
              + Thêm &amp; Chọn
            </button>
          </div>

          <div v-if="filteredIndustryDirectoryList.length === 0" class="cf-tag-empty-box">
            <i class="ri-briefcase-4-line"></i>
            <p>Chưa có ngành nghề phù hợp. Nhập ở trên và nhấn "+ Thêm &amp; Chọn" để dùng ngay.</p>
          </div>

          <div v-else class="cf-tag-manage-list">
            <div
              v-for="ind in filteredIndustryDirectoryList"
              :key="'ind-' + ind.name"
              class="cf-tag-manage-row cf-industry-row"
              :class="{ 'is-selected': isIndustrySelected(ind.name) }"
              @click="selectIndustryFromPicker(ind.name)"
            >
              <div class="cf-tag-manage-info">
                <span class="cf-industry-name">{{ ind.name }}</span>
                <span v-if="ind.count > 0" class="cf-badge is-sky tabular-nums">{{ ind.count }} KH</span>
              </div>
              <div>
                <span v-if="isIndustrySelected(ind.name)" class="cf-industry-selected-pill">
                  <i class="ri-check-line"></i> Đang chọn
                </span>
                <button v-else type="button" class="cf-btn cf-btn-sky-soft cf-btn-sm">
                  Chọn
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="cust-modal-footer cf-simple-footer">
          <button type="button" class="modal-btn-secondary cf-btn cf-btn-slate" @click="isIndustryPickerOpen = false">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL 5: KIỂM TRA KHÁCH HÀNG TRÙNG LẶP ================== -->
    <div
      v-if="isDuplicateModalOpen"
      class="modal vip-modal-overlay modal-fullscreen-overlay"
      style="z-index: 10022;"
      @click.self="isDuplicateModalOpen = false"
    >
      <div class="modal-card modal-wide vip-modal-card cf-dup-modal">
        <div class="modal-head modal-head-themed">
          <div class="dt-only-head cf-modal-dt-title">
            <i class="ri-file-copy-2-line"></i>
            <span>Kiểm Tra Khách Hàng Trùng Lặp ({{ duplicateGroups.length }} nhóm)</span>
          </div>
          <div class="m-grab-head-stack">
            <span class="m-grab-eyebrow">Chuẩn hóa dữ liệu</span>
            <span class="m-grab-title">Khách Hàng Trùng Lặp ({{ duplicateGroups.length }})</span>
          </div>
          <button type="button" class="x" @click="isDuplicateModalOpen = false">✕</button>
        </div>

        <div class="cf-dup-toolbar">
          <div class="cf-dup-tabs">
            <button
              v-for="tab in duplicateFilterTabs"
              :key="tab.key"
              type="button"
              class="cf-dup-tab"
              :class="{ active: duplicateFilterType === tab.key }"
              @click="duplicateFilterType = tab.key"
            >
              <span>{{ tab.label }}</span>
              <strong class="tabular-nums">{{ tab.count }}</strong>
            </button>
          </div>
          <div class="cf-dup-search">
            <i class="ri-search-line"></i>
            <input
              type="text"
              v-model="duplicateSearchQuery"
              placeholder="Tìm nhanh trong danh sách trùng..."
            />
            <button v-if="duplicateSearchQuery" type="button" @click="duplicateSearchQuery = ''">✕</button>
          </div>
        </div>

        <div class="cf-dup-body">
          <div v-if="filteredDuplicateGroups.length === 0" class="cf-empty-state is-compact">
            <div class="cf-empty-icon is-emerald">
              <i class="ri-shield-check-line"></i>
            </div>
            <h3>{{ duplicateGroups.length === 0 ? 'Dữ liệu sạch — Không phát hiện trùng lặp!' : 'Không có nhóm trùng khớp bộ lọc' }}</h3>
            <p>Hệ thống đối chiếu tự động theo Tên công ty (bỏ tiền tố pháp nhân), Tên người liên hệ và Mã số thuế.</p>
          </div>

          <div v-else class="cf-dup-groups-list">
            <div v-for="(grp, gIdx) in filteredDuplicateGroups" :key="grp.id" class="cf-dup-group-card">
              <div class="cf-dup-group-head">
                <div class="cf-dup-group-title">
                  <span class="cf-dup-idx tabular-nums">Nhóm #{{ gIdx + 1 }}</span>
                  <strong>{{ grp.primaryLabel }}</strong>
                  <span class="cf-dup-count tabular-nums">{{ grp.items.length }} bản ghi</span>
                </div>
                <div class="cf-dup-reasons">
                  <span
                    v-for="r in grp.reasons"
                    :key="r.type"
                    class="cf-dup-reason-pill"
                    :style="getDuplicateReasonStyle(r.type)"
                  >
                    {{ r.label }}
                  </span>
                </div>
              </div>

              <div class="cf-dup-items-grid">
                <div
                  v-for="(item, iIdx) in grp.items"
                  :key="item._firebaseKey || item.ma_khach_hang || iIdx"
                  class="cf-dup-item-card"
                >
                  <div class="cf-dup-item-top">
                    <span class="cf-dup-rec-index tabular-nums">Bản ghi #{{ iIdx + 1 }}</span>
                    <div class="cf-row-actions">
                      <button type="button" class="cf-icon-act is-debt-act" @click="openCustomerDebtModal(item)" title="Xem công nợ">
                        <i class="ri-bank-card-line"></i>
                      </button>
                      <button type="button" class="cf-icon-act is-edit-act" @click="openEditModal(item)" title="Chỉnh sửa">
                        <i class="ri-edit-line"></i>
                      </button>
                      <button type="button" class="cf-icon-act is-del-act" @click="confirmDelete(item.ma_khach_hang, item)" title="Xoá bản ghi trùng">
                        <i class="ri-delete-bin-6-line"></i>
                      </button>
                    </div>
                  </div>
                  <div class="cf-dup-item-rows">
                    <div class="cf-dup-row tabular-nums" :class="{ 'is-diff': isDupFieldMismatched(grp.items, iIdx, 'ma') }">
                      <span class="cf-dup-row-lbl">Mã KH:</span>
                      <strong class="cf-dup-row-val">{{ item.ma_khach_hang || '—' }}</strong>
                    </div>
                    <div class="cf-dup-row" :class="{ 'is-diff': isDupFieldMismatched(grp.items, iIdx, 'company') }">
                      <span class="cf-dup-row-lbl">Công ty:</span>
                      <strong class="cf-dup-row-val">{{ item.ten_cong_ty || item.company || '—' }}</strong>
                    </div>
                    <div class="cf-dup-row" :class="{ 'is-diff': isDupFieldMismatched(grp.items, iIdx, 'person') }">
                      <span class="cf-dup-row-lbl">Người LH:</span>
                      <strong class="cf-dup-row-val">{{ item.ten_khach_hang || '—' }}</strong>
                    </div>
                    <div class="cf-dup-row tabular-nums" :class="{ 'is-diff': isDupFieldMismatched(grp.items, iIdx, 'mst') }">
                      <span class="cf-dup-row-lbl">MST:</span>
                      <strong class="cf-dup-row-val">{{ item.mst || '—' }}</strong>
                    </div>
                    <div class="cf-dup-row tabular-nums" :class="{ 'is-diff': isDupFieldMismatched(grp.items, iIdx, 'phone') }">
                      <span class="cf-dup-row-lbl">SĐT:</span>
                      <strong class="cf-dup-row-val">{{ item.so_dien_thoai_ca_nhan || item.so_dien_thoai_cong_ty || '—' }}</strong>
                    </div>
                    <div class="cf-dup-row" :class="{ 'is-diff': isDupFieldMismatched(grp.items, iIdx, 'email') }">
                      <span class="cf-dup-row-lbl">Email:</span>
                      <strong class="cf-dup-row-val">{{ item.email_ca_nhan || item.email_cong_ty || '—' }}</strong>
                    </div>
                    <div class="cf-dup-row tabular-nums">
                      <span class="cf-dup-row-lbl">Báo giá / Nợ:</span>
                      <strong class="cf-dup-row-val">
                        Chốt {{ item.hopDongChotCount || 0 }} • XL {{ item.hopDongProcessingCount || 0 }} •
                        <em :class="(Number(item.cong_no) || 0) > 0 ? 'text-rose' : 'text-emerald'">
                          {{ formatCurrency(item.cong_no || 0) || '0' }} đ
                        </em>
                      </strong>
                    </div>
                    <div class="cf-dup-row tabular-nums">
                      <span class="cf-dup-row-lbl">Cập nhật:</span>
                      <strong class="cf-dup-row-val">{{ formatLastUpdated(item.last_updated) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cust-modal-footer cf-simple-footer">
          <button type="button" class="modal-btn-secondary cf-btn cf-btn-slate" @click="isDuplicateModalOpen = false">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- ================== UNIFIED TEMPLATE DIALOG MODAL (ALERT / CONFIRM — CHUẨN BAOGIAFIREBASE) ================== -->
    <Transition name="async-modal">
      <div
        v-if="baogiaDialog.show"
        class="modal vip-modal-overlay baogia-dialog-overlay"
        style="z-index: 1000085;"
        @click.self="resolveBaogiaDialog(false)"
      >
        <div
          class="modal-card vip-modal-card baogia-dialog-card"
          :class="['is-variant-' + baogiaDialog.variant, 'is-mode-' + baogiaDialog.mode]"
          role="dialog"
          aria-modal="true"
          :aria-label="baogiaDialog.title"
        >
          <div
            class="modal-head modal-head-themed baogia-dialog-head"
            style="justify-content: space-between; position: relative; padding: 13px 20px; border-bottom: none; border-radius: 0; flex-shrink: 0;"
          >
            <div class="dt-only-head baogia-dialog-dt-head">
              <i v-if="baogiaDialog.variant === 'danger'" class="ri-delete-bin-6-line baogia-dialog-head-ico"></i>
              <i v-else-if="baogiaDialog.variant === 'error'" class="ri-close-circle-line baogia-dialog-head-ico"></i>
              <i v-else-if="baogiaDialog.variant === 'warning'" class="ri-error-warning-line baogia-dialog-head-ico"></i>
              <i v-else class="ri-information-line baogia-dialog-head-ico"></i>
              <span>{{ baogiaDialog.title }}</span>
            </div>
            <div class="m-grab-head-stack">
              <span class="m-grab-eyebrow">{{ baogiaDialog.eyebrow }}</span>
              <span class="m-grab-title">{{ baogiaDialog.title }}</span>
            </div>
            <button
              type="button"
              class="x baogia-dialog-close-x"
              @click="resolveBaogiaDialog(false)"
              aria-label="Đóng hộp thoại"
            >
              <svg class="dlg-dt-close-svg" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="baogia-dialog-body">
            <div v-if="baogiaDialog.highlightValue" class="baogia-dialog-target-card">
              <div class="baogia-dialog-target-icon">
                <i v-if="baogiaDialog.variant === 'danger'" class="ri-delete-bin-6-line"></i>
                <i v-else-if="baogiaDialog.variant === 'error'" class="ri-close-circle-line"></i>
                <i v-else class="ri-information-line"></i>
              </div>
              <div class="baogia-dialog-target-info">
                <div class="baogia-dialog-target-tag">{{ baogiaDialog.highlightLabel || baogiaDialog.eyebrow }}</div>
                <div class="baogia-dialog-target-val" :title="baogiaDialog.highlightValue">
                  {{ baogiaDialog.highlightValue }}
                </div>
              </div>
            </div>

            <div class="baogia-dialog-msg-box">
              <div class="baogia-dialog-msg-icon">
                <i v-if="baogiaDialog.variant === 'danger'" class="ri-alert-line"></i>
                <i v-else-if="baogiaDialog.variant === 'error'" class="ri-close-circle-line"></i>
                <i v-else-if="baogiaDialog.variant === 'warning'" class="ri-error-warning-line"></i>
                <i v-else class="ri-information-line"></i>
              </div>
              <div class="baogia-dialog-msg-text">{{ baogiaDialog.message }}</div>
            </div>

            <div v-if="baogiaDialog.subNote" class="baogia-dialog-subnote">
              <i class="ri-information-line baogia-dialog-subnote-ico"></i>
              <span>{{ baogiaDialog.subNote }}</span>
            </div>
          </div>

          <div
            class="modal-actions fullscreen-modal-footer baogia-dialog-foot"
            :class="{ 'is-single-action': baogiaDialog.mode === 'alert' }"
          >
            <button
              v-if="baogiaDialog.mode === 'confirm'"
              ref="baogiaDialogCancelBtnRef"
              type="button"
              class="modal-btn-secondary baogia-dlg-btn baogia-dlg-cancel"
              @click="resolveBaogiaDialog(false)"
            >
              <span>{{ baogiaDialog.cancelText }}</span>
            </button>

            <button
              ref="baogiaDialogConfirmBtnRef"
              type="button"
              class="baogia-dlg-btn baogia-dlg-confirm"
              :class="'is-btn-' + baogiaDialog.variant"
              @click="resolveBaogiaDialog(true)"
            >
              <i v-if="baogiaDialog.mode === 'confirm' && baogiaDialog.variant === 'danger'" class="ri-delete-bin-6-line"></i>
              <i v-else class="ri-check-line"></i>
              <span>{{ baogiaDialog.confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ================== ASYNC BLOCKING PROGRESS / RESULT MODAL ================== -->
    <Transition name="async-modal">
      <div v-if="asyncResultModal.show" class="async-modal-overlay" style="z-index: 10050;" @click.self="asyncResultModal.type !== 'loading' && (asyncResultModal.show = false)">
        <div class="async-modal-box" :class="'is-' + asyncResultModal.type">
          <template v-if="asyncResultModal.type === 'loading'">
            <div class="async-spinner-ring">
              <div></div><div></div><div></div><div></div>
            </div>
            <div class="async-title">{{ asyncResultModal.title }}</div>
            <div class="async-subtitle">Vui lòng không đóng trình duyệt...</div>
          </template>
          <template v-else-if="asyncResultModal.type === 'success'">
            <div class="async-icon-wrap async-icon-success">
              <svg viewBox="0 0 52 52" class="async-checkmark">
                <circle cx="26" cy="26" r="25" fill="none" />
                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <div class="async-title">{{ asyncResultModal.title }}</div>
            <div v-if="asyncResultModal.msg" class="async-subtitle">{{ asyncResultModal.msg }}</div>
          </template>
          <template v-else>
            <div class="async-icon-wrap async-icon-error">
              <svg viewBox="0 0 52 52" class="async-xmark">
                <circle cx="26" cy="26" r="25" fill="none" />
                <path fill="none" d="M16 16 36 36 M36 16 16 36" />
              </svg>
            </div>
            <div class="async-title">{{ asyncResultModal.title }}</div>
            <div v-if="asyncResultModal.msg" class="async-subtitle">{{ asyncResultModal.msg }}</div>
            <button type="button" class="async-close-btn" @click="asyncResultModal.show = false">Đóng</button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- ================== MOBILE FLOATING GLASS BOTTOM SUB-DOCK (HIỂN THỊ | THÊM MỚI | CHECK TRÙNG) ================== -->
    <nav
      v-if="isMobileViewport"
      class="cf-mobile-dock"
      :class="{ 'is-modal-hidden': isAnyCustomerModalOpen }"
      aria-label="Điều hướng nhanh Khách hàng Mobile"
    >
      <!-- 1. Chế độ hiển thị (Tối / Sáng / Kính mờ) -->
      <button
        type="button"
        class="cf-dock-btn"
        :class="{ active: uiTheme === 'custom' }"
        @click="cycleMobileTheme"
        :title="`Đang dùng giao diện ${uiTheme === 'dark' ? 'Tối' : uiTheme === 'light' ? 'Sáng' : 'Kính mờ'} — bấm để đổi`"
      >
        <div class="cf-dock-icon-wrap">
          <i v-if="uiTheme === 'dark'" class="ri-moon-clear-line"></i>
          <i v-else-if="uiTheme === 'light'" class="ri-sun-line"></i>
          <i v-else class="ri-sparkling-2-line"></i>
          <span class="cf-dock-badge is-mode">
            {{ uiTheme === 'dark' ? 'Tối' : uiTheme === 'light' ? 'Sáng' : 'Kính' }}
          </span>
        </div>
        <span>Hiển thị</span>
      </button>

      <!-- 2. Thêm mới (Primary Center CTA) -->
      <button
        type="button"
        class="cf-dock-btn is-primary is-center-cta"
        @click="showAddChoiceModal = true"
      >
        <div class="cf-dock-icon-wrap">
          <i class="ri-add-line"></i>
        </div>
        <span>Thêm mới</span>
      </button>

      <!-- 3. Check trùng -->
      <button
        type="button"
        class="cf-dock-btn"
        :class="{ 'has-dup-warn': duplicateGroups.length > 0 }"
        @click="openDuplicateCheckModal"
        title="Kiểm tra khách hàng trùng tên công ty, tên KH hoặc MST"
      >
        <div class="cf-dock-icon-wrap">
          <i class="ri-file-copy-2-line"></i>
          <span v-if="duplicateGroups.length > 0" class="cf-dock-badge is-danger tabular-nums">
            {{ duplicateGroups.length > 99 ? '99+' : duplicateGroups.length }}
          </span>
        </div>
        <span>Check trùng</span>
      </button>
    </nav>

    <!-- ================== MOBILE BOTTOM SHEET FOR FILTER PICKERS (<= 1100px) ================== -->
    <Transition name="pl-sheet">
      <div
        v-if="isMobileViewport && activeCfPicker"
        class="pl-mobile-sheet-overlay"
        @click.self="closeCfPicker"
      >
        <div class="pl-mobile-sheet" @click.stop>
          <div class="pl-sheet-grabber-wrap" @click="closeCfPicker">
            <span class="pl-sheet-grabber"></span>
          </div>

          <div class="pl-sheet-head">
            <div class="pl-sheet-head-txt">
              <h4>{{ activeCfPicker.sheetTitle }}</h4>
              <p class="tabular-nums">{{ activeCfPicker.sheetSub }}</p>
            </div>
            <button
              type="button"
              class="pl-sheet-close-btn"
              aria-label="Đóng"
              @click="closeCfPicker"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div v-if="activeCfPicker.searchable" class="pl-sheet-search-wrap">
            <svg class="pl-pop-search-ic" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              v-model="cfPickerTagSearch"
              type="text"
              class="pl-sheet-search-input"
              :placeholder="activeCfPicker.searchPlaceholder"
            />
            <button
              v-if="cfPickerTagSearch"
              type="button"
              class="pl-pop-search-clear"
              aria-label="Xóa từ khóa"
              @click="cfPickerTagSearch = ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="pl-sheet-list">
            <template v-for="(sec, sIdx) in activeCfPicker.sections" :key="'mob-' + activeCfPicker.key + '-sec-' + sIdx">
              <div v-if="sec.title" class="pl-pop-section-lbl is-sheet-lbl">
                <span>{{ sec.title }}</span>
              </div>
              <div v-if="sec.emptyText && sec.items.length === 0" class="pl-pop-empty">
                {{ sec.emptyText }}
              </div>
              <button
                v-for="opt in sec.items"
                :key="'mob-' + activeCfPicker.key + '-opt-' + opt.value"
                type="button"
                class="pl-opt-card is-sheet-card"
                :class="{ 'is-base-opt': opt.value === '', 'is-selected': activeCfPicker.activeValue === opt.value }"
                @click="selectCfPickerOption(activeCfPicker.key, opt.value)"
              >
                <div class="pl-opt-top">
                  <span class="pl-opt-radio">
                    <svg v-if="activeCfPicker.activeValue === opt.value" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span v-if="opt.dot" class="pl-opt-dot" :class="opt.dot"></span>
                  <i v-else-if="opt.icon" :class="opt.icon" class="pl-opt-icon"></i>
                  <span class="pl-opt-title">{{ opt.label }}</span>
                  <span v-if="opt.countText" class="pl-opt-count tabular-nums">{{ opt.countText }}</span>
                </div>
                <div v-if="opt.sub" class="pl-opt-sub">{{ opt.sub }}</div>
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ================== SINGLE-MERGED SMART TOAST (Z-INDEX: 2000000) ================== -->
    <Teleport to="body">
      <div class="smart-toast-layer" :class="{ 'is-light': uiTheme === 'light' }">
        <Transition name="smart-toast-drop">
          <div
            v-if="toastState.show"
            class="smart-toast"
            :class="['is-' + toastState.type, { 'is-pulsing': toastState.pulsing, 'is-paused': toastState.paused }]"
            @mouseenter="pauseSmartToast"
            @mouseleave="resumeSmartToast"
          >
            <span class="smart-toast__icon" aria-hidden="true">
              <i v-if="toastState.type === 'success'" class="ri-checkbox-circle-fill"></i>
              <i v-else-if="toastState.type === 'warning'" class="ri-error-warning-fill"></i>
              <i v-else-if="toastState.type === 'error'" class="ri-close-circle-fill"></i>
              <i v-else class="ri-information-fill"></i>
            </span>
            <span class="smart-toast__msg">{{ toastState.msg }}</span>
            <span v-if="toastState.repeatCount > 1" class="smart-toast__count tabular-nums">×{{ toastState.repeatCount }}</span>
            <button type="button" class="smart-toast__close" @click="dismissSmartToast" aria-label="Đóng thông báo">
              ✕
            </button>
            <div
              :key="toastState.progressKey"
              class="smart-toast__progress"
              :style="{ animationDuration: toastState.duration + 'ms' }"
            ></div>
          </div>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import * as XLSX from 'xlsx-js-style'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, push, update, remove } from 'firebase/database'
import { triggerZaloEventNotification } from '../utils/zaloBotService'
import { useFullAppTheme } from '../composables/useAppTheme'
import {
  computeCustomerDuplicateGroups,
  normalizeCompanyForDupCheck,
  removeDiacritics
} from '../utils/customerDuplicateHelper'
import FormattedInput from './FormattedInput.vue'

const _pdfGlobalWorker = pdfjsLib?.GlobalWorkerOptions || pdfjsLib?.default?.GlobalWorkerOptions
if (_pdfGlobalWorker && !_pdfGlobalWorker.workerSrc) {
  _pdfGlobalWorker.workerSrc = pdfWorkerUrl
}

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "929199941311",
  appId: "1:929199941311:web:ca8d86f9fd7f8dff61480a",
  measurementId: "G-48VVPGFSFK"
}

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const database = getDatabase(firebaseApp)
const router = useRouter()

// =========================================================
// 1. SHARED 3-MODE THEME & CUSTOM GLASSIFY
// =========================================================
const CUSTOM_GLASS_CFG_KEY = 'sonai_report_fb_custom_glass_cfg_v1'
const RECENT_SEARCH_STORAGE_KEY = 'sonai_customer_recent_searches_v1'

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

const { uiTheme, setUiTheme: setGlobalFullTheme } = useFullAppTheme()
const showCustomGlassTuner = ref(false)
const customGlassConfig = ref(loadInitialGlassConfig())
const tunerPopoverPos = ref({ top: '56px', left: 'auto', right: '18px' })

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
  setGlobalFullTheme(nextTheme)
  if (nextTheme !== 'custom') showCustomGlassTuner.value = false
}

const updateTunerAnchorFromEvent = (evt) => {
  if (typeof window === 'undefined' || !evt || !evt.currentTarget) return
  const rect = evt.currentTarget.getBoundingClientRect()
  const popoverWidth = 305
  const margin = 12
  const maxLeft = Math.max(margin, window.innerWidth - popoverWidth - margin)
  const clampedLeft = Math.min(Math.max(margin, rect.left - 120), maxLeft)
  const preferredTop = rect.bottom + 8
  const clampedTop = Math.min(preferredTop, Math.max(54, window.innerHeight - 360))
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

// Responsive viewport
const isMobileViewport = ref(typeof window !== 'undefined' ? window.innerWidth <= 1100 : false)

const cycleMobileTheme = () => {
  const order = ['dark', 'light', 'custom']
  const curIdx = order.indexOf(uiTheme.value)
  const next = order[(curIdx + 1) % order.length]
  setUiTheme(next)
  const label = next === 'dark' ? 'Nền Tối (Dark)' : next === 'light' ? 'Nền Sáng (Light)' : 'Kính mờ (Glass)'
  showToast(`Chế độ hiển thị: ${label}`, 'info', 1800)
}

const openCfPickerKey = ref(null)
const cfPickerTagSearch = ref('')

const isAnyCustomerModalOpen = computed(() => Boolean(
  isModalOpen.value ||
  showAddChoiceModal.value ||
  isDuplicateModalOpen.value ||
  isTagModalOpen.value ||
  isIndustryPickerOpen.value ||
  showCustomGlassTuner.value ||
  paymentModal.value?.show ||
  baogiaDialog.value?.show ||
  asyncResultModal.value?.show ||
  (isMobileViewport.value && openCfPickerKey.value)
))

const handleViewportResize = () => {
  if (typeof window !== 'undefined') {
    isMobileViewport.value = window.innerWidth <= 1100
  }
}

// =========================================================
// 2. SINGLE-MERGED SMART TOAST & QUEUED UNIFIED DIALOG
// =========================================================
const toastState = ref({
  show: false,
  msg: '',
  type: 'info',
  repeatCount: 1,
  pulsing: false,
  paused: false,
  duration: 2800,
  progressKey: 0
})
let toastTimer = null
let toastRemainingMs = 2800
let toastStartedAt = 0

const clearToastTimer = () => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
}

const dismissSmartToast = () => {
  clearToastTimer()
  toastState.value.show = false
}

const scheduleToastAutoDismiss = (ms) => {
  clearToastTimer()
  toastRemainingMs = ms
  toastStartedAt = Date.now()
  toastTimer = setTimeout(() => {
    toastState.value.show = false
    toastTimer = null
  }, ms)
}

const pauseSmartToast = () => {
  if (!toastState.value.show || toastState.value.paused) return
  toastState.value.paused = true
  const elapsed = Date.now() - toastStartedAt
  toastRemainingMs = Math.max(600, toastRemainingMs - elapsed)
  clearToastTimer()
}

const resumeSmartToast = () => {
  if (!toastState.value.show || !toastState.value.paused) return
  toastState.value.paused = false
  scheduleToastAutoDismiss(toastRemainingMs)
}

const showToast = (message, type = 'info', duration = 2800) => {
  const cleanMsg = String(message || '').trim()
  if (!cleanMsg) return
  if (toastState.value.show && toastState.value.msg === cleanMsg && toastState.value.type === type) {
    toastState.value.repeatCount += 1
    toastState.value.pulsing = false
    requestAnimationFrame(() => {
      toastState.value.pulsing = true
    })
    toastState.value.duration = duration
    toastState.value.progressKey += 1
    toastState.value.paused = false
    scheduleToastAutoDismiss(duration)
    return
  }
  toastState.value = {
    show: true,
    msg: cleanMsg,
    type,
    repeatCount: 1,
    pulsing: false,
    paused: false,
    duration,
    progressKey: toastState.value.progressKey + 1
  }
  scheduleToastAutoDismiss(duration)
}

const copyText = async (text, label = 'Nội dung') => {
  const str = String(text || '').trim()
  if (!str) return
  try {
    await navigator.clipboard.writeText(str)
    showToast(`Đã sao chép ${label}: ${str}`, 'success', 2200)
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = str
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showToast(`Đã sao chép ${label}: ${str}`, 'success', 2200)
  }
}

// Queued Promise-based Alert / Confirm Dialog (100% baogiaFirebase standard)
const baogiaDialog = ref({
  show: false,
  mode: 'alert',
  variant: 'info',
  eyebrow: 'Thông báo hệ thống',
  title: 'Thông báo',
  message: '',
  subNote: '',
  highlightLabel: '',
  highlightValue: '',
  confirmText: 'Đã hiểu',
  cancelText: 'Hủy'
})

const baogiaDialogConfirmBtnRef = ref(null)
const baogiaDialogCancelBtnRef = ref(null)
const dialogQueue = []
let activeDialogResolver = null

const pumpDialogQueue = () => {
  if (baogiaDialog.value.show || dialogQueue.length === 0) return
  const nextItem = dialogQueue.shift()
  activeDialogResolver = nextItem.resolve
  baogiaDialog.value = {
    show: true,
    ...nextItem.payload
  }
  nextTick(() => {
    if (nextItem.payload.mode === 'confirm' && nextItem.payload.variant === 'danger') {
      baogiaDialogCancelBtnRef.value?.focus?.()
    } else {
      baogiaDialogConfirmBtnRef.value?.focus?.()
    }
  })
}

const resolveBaogiaDialog = (result) => {
  baogiaDialog.value.show = false
  const resolver = activeDialogResolver
  activeDialogResolver = null
  if (resolver) resolver(Boolean(result))
  setTimeout(pumpDialogQueue, 60)
}

const openCustomerAlert = (message, options = {}) => {
  const variant = options.variant || 'info'
  const defaultTitles = {
    info: 'Thông báo',
    warning: 'Lưu ý dữ liệu',
    error: 'Không thể thực hiện',
    danger: 'Cảnh báo quan trọng'
  }
  return new Promise((resolve) => {
    dialogQueue.push({
      resolve,
      payload: {
        mode: 'alert',
        variant,
        eyebrow: options.eyebrow || 'Thông báo hệ thống',
        title: options.title || defaultTitles[variant] || 'Thông báo',
        message: String(message || ''),
        subNote: options.subNote || '',
        highlightLabel: options.highlightLabel || '',
        highlightValue: options.highlightValue || '',
        confirmText: options.confirmText || 'Đã hiểu',
        cancelText: 'Đóng'
      }
    })
    pumpDialogQueue()
  })
}

const openCustomerConfirm = (message, options = {}) => {
  const variant = options.variant || 'warning'
  return new Promise((resolve) => {
    dialogQueue.push({
      resolve,
      payload: {
        mode: 'confirm',
        variant,
        eyebrow: options.eyebrow || (variant === 'danger' ? 'Xác nhận thao tác xóa' : 'Xác nhận thao tác'),
        title: options.title || (variant === 'danger' ? 'Xác nhận xóa dữ liệu' : 'Xác nhận thực hiện'),
        message: String(message || ''),
        subNote: options.subNote || '',
        highlightLabel: options.highlightLabel || '',
        highlightValue: options.highlightValue || '',
        confirmText: options.confirmText || (variant === 'danger' ? 'Xác nhận xóa' : 'Đồng ý'),
        cancelText: options.cancelText || 'Hủy bỏ'
      }
    })
    pumpDialogQueue()
  })
}

// =========================================================
// 3. DATA MODEL, NORMALIZATION & MULTI-FILE IMPORT
// =========================================================
const KH_FIELDS = [
  'ma_khach_hang',
  'ten_khach_hang',
  'email_ca_nhan',
  'so_dien_thoai_ca_nhan',
  'ma_cong_ty',
  'ten_cong_ty',
  'so_dien_thoai_cong_ty',
  'so_fax_cong_ty',
  'dia_chi_cong_ty',
  'email_cong_ty',
  'website_cong_ty',
  'hoa_hong',
  'tong_chi_tieu',
  'tong_loi_nhuan',
  'trang_thai',
  'ghi_chu',
  'ten_khach_hang_phu',
  'so_dien_thoai_ca_nhan_phu',
  'email_ca_nhan_phu',
  'mst',
  'company',
  'address',
  'tel',
  'nganh_nghe_cong_ty'
]

const kh_genID = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `KH_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

const sanitizeFirebaseKey = (key) => {
  return String(key || '').trim().replace(/[.#$[\]/]/g, '_')
}

const normalizeCustomerRecord = (raw, fbKey) => {
  if (!raw || typeof raw !== 'object') return null
  if (Array.isArray(raw)) {
    const obj = { _firebaseKey: fbKey, cong_no: 0, tagKH: [], created_time: '', last_updated: '' }
    KH_FIELDS.forEach((field, idx) => {
      obj[field] = raw[idx] !== undefined && raw[idx] !== null ? raw[idx] : ''
    })
    if (!obj.ma_khach_hang && fbKey) obj.ma_khach_hang = fbKey
    return obj
  }
  const obj = { ...raw, _firebaseKey: fbKey }
  KH_FIELDS.forEach((field) => {
    if (obj[field] === undefined || obj[field] === null) {
      obj[field] = ''
    }
  })
  if (!obj.ma_khach_hang && fbKey) obj.ma_khach_hang = fbKey
  if (!obj.ten_cong_ty && (raw.Ten_cong_ty || raw.COMPANY)) {
    obj.ten_cong_ty = raw.Ten_cong_ty || raw.COMPANY
  }
  if (!obj.ten_khach_hang && raw.Ten_khach_hang) obj.ten_khach_hang = raw.Ten_khach_hang
  if (!obj.mst && raw.MST) obj.mst = raw.MST
  if (!obj.so_dien_thoai_ca_nhan && (raw.So_dien_thoai_ca_nhan || raw.sdt)) {
    obj.so_dien_thoai_ca_nhan = raw.So_dien_thoai_ca_nhan || raw.sdt
  }
  if (!obj.email_ca_nhan && (raw.Email_ca_nhan || raw.email)) {
    obj.email_ca_nhan = raw.Email_ca_nhan || raw.email
  }
  if (!obj.dia_chi_cong_ty && (raw.Dia_chi_cong_ty || raw.dia_chi || raw.Dia_chi || raw.diaChi || raw.dia_chi_hoa_don || raw.Dia_chi_hoa_don)) {
    obj.dia_chi_cong_ty =
      raw.Dia_chi_cong_ty ||
      raw.dia_chi ||
      raw.Dia_chi ||
      raw.diaChi ||
      raw.dia_chi_hoa_don ||
      raw.Dia_chi_hoa_don
  }
  if (!obj.address && raw.ADDRESS) obj.address = raw.ADDRESS
  if (!obj.nganh_nghe_cong_ty && (raw.Nganh_nghe_cong_ty || raw.nganh_nghe_chinh || raw.Nganh_nghe_chinh)) {
    obj.nganh_nghe_cong_ty = raw.Nganh_nghe_cong_ty || raw.nganh_nghe_chinh || raw.Nganh_nghe_chinh
  }
  obj.cong_no = Number(raw.cong_no) || 0
  obj.tagKH = Array.isArray(raw.tagKH)
    ? [...raw.tagKH]
    : (typeof raw.tagKH === 'string' && raw.tagKH.trim() ? [raw.tagKH.trim()] : [])
  obj.created_time =
    raw.created_time ||
    raw.createdAt ||
    raw.CREATED_TIME ||
    ''
  obj.last_updated =
    raw.last_updated ||
    raw.lastupdated ||
    raw.lastUpdated ||
    raw.lastupadted ||
    ''
  return obj
}

const getCustomerAddress = (kh) => {
  if (!kh || typeof kh !== 'object') return ''
  const candidates = [
    kh.dia_chi_cong_ty,
    kh.Dia_chi_cong_ty,
    kh.dia_chi,
    kh.Dia_chi,
    kh.diaChi,
    kh.dia_chi_hoa_don,
    kh.Dia_chi_hoa_don,
    kh.address,
    kh.ADDRESS
  ]
  for (const val of candidates) {
    const s = String(val ?? '').trim()
    if (s) return s
  }
  return ''
}

const fileInput = ref(null)
const quoteFileInput = ref(null)
const showAddChoiceModal = ref(false)

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const triggerQuoteFileInput = () => {
  if (quoteFileInput.value) quoteFileInput.value.click()
}

const openAddModalFromChoice = () => {
  showAddChoiceModal.value = false
  openAddModal()
}

const triggerQuoteImportFromChoice = () => {
  showAddChoiceModal.value = false
  triggerQuoteFileInput()
}

const triggerDxmhImportFromChoice = () => {
  showAddChoiceModal.value = false
  triggerFileInput()
}

const cleanExtractedQuoteCompany = (raw) => {
  if (!raw) return ''
  const s = String(raw)
    .replace(/^[\s:–\-]+/, '')
    .replace(/(?:^|\s)(?:ngày|date)\s*(?::|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}).*$/i, '')
    .replace(/(?:^|\s)(?:mst|mã\s*số\s*thuế|tax\s*code)\s*:?.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!s || /^\{+.*\}+$/i.test(s) || /nam\s+trường\s+sơn|ntssi/i.test(s)) return ''
  return s
}

const cleanExtractedQuoteRecipient = (raw) => {
  if (!raw) return ''
  const s = String(raw)
    .replace(/^[\s:–\-]+/, '')
    .replace(/(?:^|\s)(?:tel|mobile|sđt|số\s*điện\s*thoại|điện\s*thoại|đt|email|e-mail|fax|chức\s*vụ|bộ\s*phận|phòng|ngày|date)\s*:?.*$/i, '')
    .replace(/(?:[\s\-–/|,(]+(?:\+?84|0)\d[\d\s.\-]{7,}\)?)$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!s || /^\{+.*\}+$/i.test(s) || /^(?:mr|ms|mrs|miss|dr|anh|chị|chi|ông|ong|bà|ba)\.?$/i.test(s)) return ''
  return s
}

const cleanExtractedQuoteAddress = (raw) => {
  if (!raw) return ''
  const s = String(raw)
    .replace(/^[\s:–\-]+/, '')
    .replace(/(?:^|\s)(?:ngày|date)\s*(?::|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}).*$/i, '')
    .replace(/(?:^|\s)(?:tel|fax|mobile|sđt|số\s*điện\s*thoại|điện\s*thoại|mst|mã\s*số\s*thuế)\s*:?.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!s || /^\{+.*\}+$/i.test(s) || /tăng\s*bạt\s*hổ|tang\s*bat\s*ho/i.test(s)) return ''
  return s
}

const extractQuoteCustomerFromRows = (rows) => {
  let tenCT = ''
  let tenKH = ''
  let diaChi = ''
  const maxRows = Math.min(rows.length, 30)
  for (let r = 0; r < maxRows; r++) {
    const row = rows[r]
    if (!Array.isArray(row)) continue
    const nonEmptyCells = row
      .map(c => String(c ?? '').trim())
      .filter(Boolean)
    if (nonEmptyCells.length === 0) continue

    const rowUpper = nonEmptyCells.join('|').toUpperCase()
    if (
      (rowUpper.includes('STT') || rowUpper.includes('NO.')) &&
      (rowUpper.includes('TÊN HÀNG') || rowUpper.includes('MODEL') || rowUpper.includes('PART#') || rowUpper.includes('DIỄN GIẢI') || rowUpper.includes('SẢN PHẨM') || rowUpper.includes('HÀNG HÓA'))
    ) {
      break
    }

    for (let j = 0; j < nonEmptyCells.length; j++) {
      const cellText = nonEmptyCells[j]
      const subLines = cellText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      for (const line of subLines) {
        if (!tenCT && /(?:kính\s*g[ởiử]i|kinh\s*g[oiu]i)/i.test(line)) {
          const m = line.match(/(?:kính\s*g[ởiử]i|kinh\s*g[oiu]i)\s*:?\s*(.*)/i)
          let candidate = m && m[1] ? cleanExtractedQuoteCompany(m[1]) : ''
          if (!candidate && j + 1 < nonEmptyCells.length) {
            const nextCell = nonEmptyCells[j + 1]
            if (!/^(?:ngày|date|địa\s*chỉ|người\s*nhận)(?:\s|:|$)/i.test(nextCell)) {
              candidate = cleanExtractedQuoteCompany(nextCell)
            }
          }
          if (candidate) tenCT = candidate
        }
        if (
          !diaChi &&
          /(?:địa\s*chỉ|dia\s*chi|address)/i.test(line) &&
          !/giao\s*hàng|tăng\s*bạt\s*hổ|tang\s*bat\s*ho/i.test(line)
        ) {
          const m = line.match(/(?:địa\s*chỉ|dia\s*chi|address)\s*(?:\(\*\))?\s*:?\s*(.*)/i)
          let candidate = m && m[1] ? cleanExtractedQuoteAddress(m[1]) : ''
          if (!candidate && j + 1 < nonEmptyCells.length) {
            const nextCell = nonEmptyCells[j + 1]
            if (!/^(?:ngày|date|người\s*nhận|tel|mobile|sđt|email|fax|mst)(?:\s|:|$)/i.test(nextCell)) {
              candidate = cleanExtractedQuoteAddress(nextCell)
            }
          }
          if (candidate) diaChi = candidate
        }
        if (
          !tenKH &&
          /(?:người\s*nhận|nguoi\s*nhan|người\s*liên\s*hệ|attn|attention|contact)/i.test(line) &&
          !/người\s*nhận\s*hàng/i.test(line)
        ) {
          const m = line.match(/(?:người\s*nhận|nguoi\s*nhan|người\s*liên\s*hệ|attn|attention|contact)\s*:?\s*(.*)/i)
          let candidate = m && m[1] ? cleanExtractedQuoteRecipient(m[1]) : ''
          if (!candidate && j + 1 < nonEmptyCells.length) {
            const nextCell = nonEmptyCells[j + 1]
            if (!/^(?:ngày|date|địa\s*chỉ|tel|mobile|sđt|email|fax|mst)(?:\s|:|$)/i.test(nextCell)) {
              candidate = cleanExtractedQuoteRecipient(nextCell)
            }
          }
          if (candidate) tenKH = candidate
        }
      }
    }
    if (tenCT && tenKH && diaChi) break
  }
  return { tenCT, tenKH, diaChi }
}

const extractQuoteCustomerFromPdfBuffer = async (arrayBuffer) => {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const page = await doc.getPage(1)
  const vp = page.getViewport({ scale: 1.0 })
  const tc = await page.getTextContent()
  const lines = []
  for (const it of tc.items || []) {
    const str = String(it?.str ?? '')
    if (!str.trim()) continue
    const tr = it.transform || [10, 0, 0, 10, 0, 0]
    const x = Number(tr[4]) || 0
    const width = Number(it.width) || str.length * 4.5
    const topY = vp.height - (Number(tr[5]) || 0)
    let line = lines.find(l => Math.abs(l.topY - topY) <= 3.5)
    if (!line) {
      line = { topY, tokens: [] }
      lines.push(line)
    }
    line.tokens.push({ str, x, xRight: x + width })
  }
  lines.sort((a, b) => a.topY - b.topY)
  const rows = lines.map(l => {
    l.tokens.sort((a, b) => a.x - b.x)
    let txt = ''
    l.tokens.forEach((t, idx) => {
      if (idx > 0) {
        const prev = l.tokens[idx - 1]
        if (t.x - prev.xRight > 1.5 && !prev.str.endsWith(' ') && !t.str.startsWith(' ')) {
          txt += ' '
        }
      }
      txt += t.str
    })
    return [txt.trim()]
  })
  return extractQuoteCustomerFromRows(rows)
}

const handleQuoteFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  loading.value = true
  importedList.value = []
  const tempList = []
  let errorCount = 0

  try {
    const normText = (s) => removeDiacritics(String(s || '')).toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim()
    const normCode = (s) => removeDiacritics(String(s || '')).toUpperCase().replace(/[^A-Z0-9]/g, '')

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const data = await file.arrayBuffer()
        const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'

        let tenCT = ''
        let tenKH = ''
        let diaChi = ''

        if (isPdf) {
          const res = await extractQuoteCustomerFromPdfBuffer(data)
          tenCT = res.tenCT
          tenKH = res.tenKH
          diaChi = res.diaChi
        } else {
          const workbook = XLSX.read(data, { type: 'array' })
          for (const sheetName of workbook.SheetNames) {
            const ws = workbook.Sheets[sheetName]
            if (!ws) continue
            const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
            const res = extractQuoteCustomerFromRows(rawData)
            if (res.tenCT || res.tenKH || res.diaChi) {
              tenCT = res.tenCT
              tenKH = res.tenKH
              diaChi = res.diaChi
              break
            }
          }
        }

        const finalTenKH = (tenKH || '').trim().toUpperCase()
        const finalTenCT = (tenCT || '').trim().toUpperCase()
        const finalDiaChi = (diaChi || '').trim()

        if (finalTenKH || finalTenCT) {
          const expectedMaKH = genMaKH(finalTenKH, finalTenCT)
          const expectedMaCT = genMaCT(finalTenCT)
          const normExpectedMa = normCode(expectedMaKH)
          const normCT = normText(finalTenCT)
          const normKH = normText(finalTenKH)

          const existingCustomer =
            (normExpectedMa ? customers.value.find(c => normCode(c.ma_khach_hang) === normExpectedMa) : null) ||
            (normCT && normKH
              ? customers.value.find(c => normText(c.ten_cong_ty) === normCT && normText(c.ten_khach_hang) === normKH)
              : null) ||
            (normCT && !normKH
              ? customers.value.find(c => normText(c.ten_cong_ty) === normCT && !String(c.ten_khach_hang || '').trim())
              : null)

          const importedData = {
            ma_khach_hang: existingCustomer?.ma_khach_hang || expectedMaKH,
            ten_khach_hang: finalTenKH,
            ma_cong_ty: existingCustomer?.ma_cong_ty || expectedMaCT,
            ten_cong_ty: finalTenCT,
            dia_chi_cong_ty: finalDiaChi
          }

          let itemFormData = {}
          let itemIsEditing = false

          if (existingCustomer) {
            itemFormData = {
              ...initFormData(),
              ...existingCustomer,
              ...Object.fromEntries(Object.entries(importedData).filter(([_, v]) => v !== ''))
            }
            itemIsEditing = true
          } else {
            itemFormData = {
              ...initFormData(),
              ...importedData
            }
            itemIsEditing = false
          }

          tempList.push({
            data: itemFormData,
            isEditing: itemIsEditing,
            fileName: file.name
          })
        } else {
          errorCount++
        }
      } catch (fileErr) {
        console.warn('Lỗi đọc file báo giá:', file.name, fileErr)
        errorCount++
      }
    }

    if (tempList.length > 0) {
      importedList.value = tempList
      isMultiImport.value = true
      currentImportIndex.value = 0
      formData.value = { ...importedList.value[0].data }
      isEditing.value = importedList.value[0].isEditing
      captureCustomerFormSnapshot()
      isModalOpen.value = true

      if (errorCount > 0) {
        await openCustomerAlert(
          `Đã trích xuất thành công ${tempList.length} file báo giá. Có ${errorCount} file không tìm thấy mục Kính gửi / Người nhận.`,
          { variant: 'warning', title: 'Hoàn tất đọc file Báo giá' }
        )
      } else {
        showToast(`Đã trích xuất thông tin từ ${tempList.length} file báo giá`, 'success')
      }
    } else {
      await openCustomerAlert(
        'Không tìm thấy thông tin Kính gửi (Tên công ty) hoặc Người nhận hợp lệ trong file báo giá đã chọn.',
        { variant: 'warning', title: 'Không tìm thấy dữ liệu KH' }
      )
    }
  } catch (e) {
    console.error(e)
    await openCustomerAlert('Lỗi khi đọc file báo giá. Vui lòng kiểm tra định dạng PDF / Excel.', {
      variant: 'error',
      title: 'Lỗi đọc file Báo giá'
    })
  } finally {
    loading.value = false
    event.target.value = null
  }
}

const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  loading.value = true
  importedList.value = []
  const tempList = []
  let errorCount = 0

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetNamePO = workbook.SheetNames.find(name => name.toUpperCase().trim() === 'PO')
      const sheetNameDH = workbook.SheetNames.find(name => {
        const upper = name.toUpperCase().trim()
        return upper.includes('ĐƠN HÀNG') || upper.includes('DON HANG')
      })

      let worksheet = null
      if (sheetNamePO) worksheet = workbook.Sheets[sheetNamePO]
      else if (sheetNameDH) worksheet = workbook.Sheets[sheetNameDH]
      else worksheet = workbook.Sheets[workbook.SheetNames[0]]

      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
      if (rawData.length < 2) {
        errorCount++
        continue
      }

      const record = {}
      for (let r = 0; r < rawData.length; r++) {
        const row = rawData[r]
        if (!row) continue

        const label1 = (row[0] || row[1] || '').toString().trim()
        let val1 = row[2] !== undefined ? row[2] : ''
        if (row[0] && row[1] && row[0] !== label1) val1 = row[1]

        if (label1.includes('Company')) record['CUS_COMPANY'] = val1
        if (label1.includes('Address')) record['CUS_ADDRESS'] = val1
        if (label1.includes('Tel')) record['CUS_TEL'] = val1
        if (label1 === 'Fax' || label1.includes('Fax')) record['CUS_FAX'] = val1
        if (label1.includes('Contact')) record['CUS_CONTACT'] = val1
        if (label1.includes('Email')) {
          if (r < 13) record['CUS_EMAIL'] = val1
          else record['INV_EMAIL'] = val1
        }
        if (label1 === 'Mobile') record['CUS_MOBILE'] = val1
        if (label1 === 'Website') record['CUS_WEBSITE'] = val1

        if (label1.includes('Công ty')) record['INV_CONG_TY'] = val1
        if (label1 === 'Địa chỉ (*)' || label1 === 'Địa chỉ') {
          if (r > 12) record['INV_DIA_CHI'] = val1
        }
        if (label1.includes('MST')) record['INV_MST'] = val1

        const label2 = (row[3] || row[4] || '').toString().trim()
        let val2 = row[5] !== undefined ? row[5] : ''
        if (row[3] && row[4] && row[3] !== label2) val2 = row[4]

        if (label2.includes('Người nhận hàng')) record['DEL_NGUOI_NHAN'] = val2
        if (label2.includes('Số điện thoại')) record['DEL_SDT'] = val2
      }

      const contactRaw = (record.CUS_CONTACT || '').trim()
      const nguoiNhan = (record.DEL_NGUOI_NHAN || '').trim()

      const tenKH = contactRaw || nguoiNhan
      const sdt = contactRaw ? (record.CUS_MOBILE || '') : (record.DEL_SDT || '')
      const email = contactRaw ? (record.CUS_EMAIL || '') : ''

      const hasSecondary = contactRaw && nguoiNhan && contactRaw !== nguoiNhan
      const tenKHPhu = hasSecondary ? nguoiNhan : ''
      const sdtPhu = hasSecondary ? (record.DEL_SDT || '') : ''

      if (tenKH || record.INV_CONG_TY || record.CUS_COMPANY) {
        const tenCT = record.INV_CONG_TY || record.CUS_COMPANY || ''
        const expectedMaKH = genMaKH(tenKH, tenCT)
        const existingCustomer = customers.value.find(c => c.ma_khach_hang === expectedMaKH)

        const importedData = {
          ten_khach_hang: tenKH,
          email_ca_nhan: email,
          so_dien_thoai_ca_nhan: sdt,
          ten_cong_ty: tenCT,
          so_dien_thoai_cong_ty: record.CUS_TEL || '',
          so_fax_cong_ty: record.CUS_FAX || '',
          dia_chi_cong_ty: record.INV_DIA_CHI || '',
          email_cong_ty: record.INV_EMAIL || record.CUS_EMAIL || '',
          website_cong_ty: record.CUS_WEBSITE || '',
          mst: record.INV_MST || '',
          ten_khach_hang_phu: tenKHPhu,
          so_dien_thoai_ca_nhan_phu: sdtPhu,
          company: record.CUS_COMPANY || '',
          address: record.CUS_ADDRESS || '',
          tel: record.CUS_TEL || ''
        }

        let itemFormData = {}
        let itemIsEditing = false

        if (existingCustomer) {
          itemFormData = {
            ...initFormData(),
            ...existingCustomer,
            ...Object.fromEntries(Object.entries(importedData).filter(([_, v]) => v !== ''))
          }
          itemIsEditing = true
        } else {
          itemFormData = {
            ...initFormData(),
            ...importedData
          }
          itemIsEditing = false
        }

        tempList.push({
          data: itemFormData,
          isEditing: itemIsEditing,
          fileName: file.name
        })
      } else {
        errorCount++
      }
    }

    if (tempList.length > 0) {
      importedList.value = tempList
      isMultiImport.value = true
      currentImportIndex.value = 0
      formData.value = { ...importedList.value[0].data }
      isEditing.value = importedList.value[0].isEditing
      captureCustomerFormSnapshot()
      isModalOpen.value = true

      if (errorCount > 0) {
        await openCustomerAlert(
          `Đã lấy thông tin từ ${tempList.length} file DXMH. Có ${errorCount} file không đúng cấu trúc biểu mẫu.`,
          { variant: 'warning', title: 'Hoàn tất đọc file Đề xuất mua hàng' }
        )
      } else {
        showToast(`Đã trích xuất thông tin từ ${tempList.length} file DXMH`, 'success')
      }
    } else {
      await openCustomerAlert(
        'Không tìm thấy thông tin khách hàng hợp lệ trong các file Excel đã chọn.',
        { variant: 'warning', title: 'Không tìm thấy dữ liệu KH' }
      )
    }
  } catch (e) {
    console.error(e)
    await openCustomerAlert('Lỗi khi đọc file Excel Đề xuất mua hàng. Định dạng không hợp lệ.', {
      variant: 'error',
      title: 'Lỗi đọc file Excel'
    })
  } finally {
    loading.value = false
    event.target.value = null
  }
}

// =========================================================
// 4. SEARCH, RECENT SEARCHES, KPI METRICS & FILTERING
// =========================================================
const customers = ref([])
const loading = ref(false)
const saving = ref(false)
const showFilterPanel = ref(false)
const searchShellRef = ref(null)
const isSearchFocused = ref(false)

const loadRecentSearches = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(0, 6) : []
  } catch (e) {
    return []
  }
}

const recentSearches = ref(loadRecentSearches())

const saveRecentSearches = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(recentSearches.value.slice(0, 6)))
  } catch (e) {}
}

const commitRecentSearch = (term) => {
  const t = String(term || '').trim()
  if (t.length < 2) return
  recentSearches.value = [t, ...recentSearches.value.filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 6)
  saveRecentSearches()
  isSearchFocused.value = false
}

const applyRecentSearch = (term) => {
  filters.value.search = term
  isSearchFocused.value = false
}

const removeRecentSearch = (term) => {
  recentSearches.value = recentSearches.value.filter(x => x !== term)
  saveRecentSearches()
}

const clearAllRecentSearches = () => {
  recentSearches.value = []
  saveRecentSearches()
}

const onSearchEscape = () => {
  if (filters.value.search) {
    filters.value.search = ''
  } else {
    isSearchFocused.value = false
  }
}

const asyncResultModal = ref({ show: false, type: 'loading', title: '', msg: '' })
let asyncResultTimeout = null

function showAsyncLoading(title) {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'loading', title, msg: '' }
}

function showAsyncSuccess(title, msg = '') {
  asyncResultModal.value = { show: true, type: 'success', title, msg }
  asyncResultTimeout = setTimeout(() => {
    asyncResultModal.value.show = false
  }, 2400)
}

function showAsyncError(title, msg = '') {
  asyncResultModal.value = { show: true, type: 'error', title, msg }
}

function navigateToRenewal(kh) {
  const customerKey = kh.ten_cong_ty || kh.ten_khach_hang || ''
  router.push({ path: '/quanlybaogiafirebase', query: { tab: 'thoihan', card: 'renew', customer: customerKey } })
}

function navigateToContracts(kh, processingType) {
  router.push({ path: '/quanlybaogiafirebase', query: { tab: 'baogia', dashboard: processingType, customerid: kh.ma_khach_hang, sort: 'DESC' } })
}

const filters = ref({
  search: '',
  trang_thai: '',
  tagKH: '',
  sortUpdated: '',
  debt: '',
  quoteSignal: ''
})

const resetFilters = () => {
  filters.value.search = ''
  filters.value.trang_thai = ''
  filters.value.tagKH = ''
  filters.value.sortUpdated = ''
  filters.value.debt = ''
  filters.value.quoteSignal = ''
}

const toggleKpiFilter = (field, value) => {
  if (filters.value[field] === value) {
    filters.value[field] = ''
  } else {
    filters.value[field] = value
  }
}

const clearSingleFilter = (key) => {
  if (key in filters.value) {
    filters.value[key] = ''
  }
}

const activeFilterCount = computed(() => {
  let c = 0
  if (filters.value.tagKH) c++
  if (filters.value.debt) c++
  if (filters.value.quoteSignal) c++
  if (filters.value.sortUpdated) c++
  return c
})

const hasAnyActiveFilter = computed(() => {
  return Boolean(filters.value.search || activeFilterCount.value > 0)
})

const activeFilterChips = computed(() => {
  const chips = []
  if (filters.value.tagKH) {
    const lbl =
      filters.value.tagKH === '__untagged__'
        ? 'Nhóm: Chưa phân nhóm'
        : filters.value.tagKH === '__tagged__'
          ? 'Nhóm: Đã phân nhóm'
          : `Nhóm: ${filters.value.tagKH}`
    chips.push({ key: 'tagKH', label: lbl })
  }
  if (filters.value.debt) {
    chips.push({
      key: 'debt',
      label: filters.value.debt === 'debt' ? 'Công nợ: Đang nợ > 0đ' : 'Công nợ: Không nợ / Tất toán'
    })
  }
  if (filters.value.quoteSignal) {
    const map = {
      closed: 'Báo giá: Đã chốt',
      processing: 'Báo giá: Đang xử lý',
      renewal: 'Gia hạn: Cần gia hạn (< 90 ngày)',
      none: 'Báo giá: Chưa phát sinh'
    }
    chips.push({ key: 'quoteSignal', label: map[filters.value.quoteSignal] || filters.value.quoteSignal })
  }
  if (filters.value.sortUpdated) {
    const map = {
      desc: 'Sắp xếp: Cập nhật mới nhất',
      asc: 'Sắp xếp: Cập nhật cũ nhất',
      debt_desc: 'Sắp xếp: Công nợ cao → thấp'
    }
    chips.push({ key: 'sortUpdated', label: map[filters.value.sortUpdated] || filters.value.sortUpdated })
  }
  return chips
})

// Portfolio-wide KPI Computed Metrics
const uniqueCompanyCount = computed(() => {
  const setComp = new Set()
  customers.value.forEach(c => {
    const k = normalizeCompanyForDupCheck(c.ten_cong_ty || c.company || '')
    if (k) setComp.add(k)
  })
  return setComp.size
})

const taggedCustomerCount = computed(() =>
  customers.value.filter(c => Array.isArray(c.tagKH) && c.tagKH.length > 0).length
)

const untaggedCustomerCount = computed(() =>
  Math.max(0, customers.value.length - taggedCustomerCount.value)
)

const closedDealCustomerCount = computed(() =>
  customers.value.filter(c => (c.hopDongChotCount || 0) > 0).length
)

const totalClosedContractsCount = computed(() =>
  customers.value.reduce((s, c) => s + (Number(c.hopDongChotCount) || 0), 0)
)

const processingDealCustomerCount = computed(() =>
  customers.value.filter(c => (c.hopDongProcessingCount || 0) > 0).length
)

const renewalCustomerCount = computed(() =>
  customers.value.filter(c => (c.renewalCount || 0) > 0).length
)

const totalRenewalItemsCount = computed(() =>
  customers.value.reduce((s, c) => s + (Number(c.renewalCount) || 0), 0)
)

const allDebtCustomerCount = computed(() =>
  customers.value.filter(c => (Number(c.cong_no) || 0) > 0).length
)

const allNoDebtCustomerCount = computed(() =>
  Math.max(0, customers.value.length - allDebtCustomerCount.value)
)

const totalPortfolioDebt = computed(() =>
  customers.value.reduce((s, c) => s + Math.max(0, Number(c.cong_no) || 0), 0)
)

const totalPortfolioPaid = computed(() =>
  customers.value.reduce((s, c) => s + Math.max(0, Number(c.daThanhToanKH) || 0), 0)
)

const totalPortfolioReceivable = computed(() =>
  customers.value.reduce((s, c) => s + Math.max(0, Number(c.tongSauVatKH) || 0), 0)
)

const portfolioCollectionPct = computed(() => {
  if (totalPortfolioReceivable.value <= 0) {
    return totalPortfolioDebt.value <= 0 ? 100 : 0
  }
  return Math.min(100, Math.round((totalPortfolioPaid.value / totalPortfolioReceivable.value) * 100))
})

const getLastUpdatedTimestamp = (val) => {
  if (!val && val !== 0) return 0
  const rawStr = String(val).trim()
  if (!rawStr) return 0
  let dt = null
  if (/^\d+$/.test(rawStr)) {
    dt = new Date(Number(rawStr))
  } else {
    dt = parseDateStr(rawStr) || new Date(rawStr)
  }
  if (!dt || isNaN(dt.getTime())) return 0
  return dt.getTime()
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return ''
  if (isNaN(Number(value))) return value
  return Number(value).toLocaleString('vi-VN')
}

const formatVND = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return Math.round(n).toLocaleString('vi-VN')
}

const formatCompactVND = (value) => {
  const n = Math.abs(Number(value) || 0)
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2).replace(/\.00$/, '')} tỷ`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')} tr`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return `${Math.round(n)} đ`
}

const normalizeForSearch = (str) => {
  if (!str) return ''
  return removeDiacritics(String(str)).toLowerCase().replace(/[^a-z0-9]/g, '')
}

const searchedCustomers = computed(() => {
  let result = customers.value
  if (filters.value.search) {
    const q = normalizeForSearch(filters.value.search)
    if (q) {
      result = result.filter(c =>
        (c.ten_khach_hang && normalizeForSearch(c.ten_khach_hang).includes(q)) ||
        (c.ten_khach_hang_phu && normalizeForSearch(c.ten_khach_hang_phu).includes(q)) ||
        (c.so_dien_thoai_ca_nhan && normalizeForSearch(c.so_dien_thoai_ca_nhan).includes(q)) ||
        (c.so_dien_thoai_cong_ty && normalizeForSearch(c.so_dien_thoai_cong_ty).includes(q)) ||
        (c.ten_cong_ty && normalizeForSearch(c.ten_cong_ty).includes(q)) ||
        (c.mst && normalizeForSearch(c.mst).includes(q)) ||
        (c.email_ca_nhan && normalizeForSearch(c.email_ca_nhan).includes(q)) ||
        (c.email_cong_ty && normalizeForSearch(c.email_cong_ty).includes(q)) ||
        (c.ma_khach_hang && normalizeForSearch(c.ma_khach_hang).includes(q)) ||
        (Array.isArray(c.tagKH) && c.tagKH.some(t => normalizeForSearch(t).includes(q)))
      )
    }
  }
  return result
})

const filteredCustomers = computed(() => {
  let result = [...searchedCustomers.value]

  if (filters.value.tagKH === '__untagged__') {
    result = result.filter(c => !Array.isArray(c.tagKH) || c.tagKH.length === 0)
  } else if (filters.value.tagKH === '__tagged__') {
    result = result.filter(c => Array.isArray(c.tagKH) && c.tagKH.length > 0)
  } else if (filters.value.tagKH) {
    result = result.filter(c => Array.isArray(c.tagKH) && c.tagKH.includes(filters.value.tagKH))
  }

  if (filters.value.debt === 'debt') {
    result = result.filter(c => (Number(c.cong_no) || 0) > 0)
  } else if (filters.value.debt === 'no_debt') {
    result = result.filter(c => (Number(c.cong_no) || 0) <= 0)
  }

  if (filters.value.quoteSignal === 'closed') {
    result = result.filter(c => (c.hopDongChotCount || 0) > 0)
  } else if (filters.value.quoteSignal === 'processing') {
    result = result.filter(c => (c.hopDongProcessingCount || 0) > 0)
  } else if (filters.value.quoteSignal === 'renewal') {
    result = result.filter(c => (c.renewalCount || 0) > 0)
  } else if (filters.value.quoteSignal === 'none') {
    result = result.filter(c => !(c.hopDongChotCount > 0) && !(c.hopDongProcessingCount > 0))
  }

  if (filters.value.sortUpdated === 'desc') {
    result.sort((a, b) => getLastUpdatedTimestamp(b.last_updated) - getLastUpdatedTimestamp(a.last_updated))
  } else if (filters.value.sortUpdated === 'asc') {
    result.sort((a, b) => {
      const ta = getLastUpdatedTimestamp(a.last_updated)
      const tb = getLastUpdatedTimestamp(b.last_updated)
      if (ta === 0 && tb === 0) return 0
      if (ta === 0) return 1
      if (tb === 0) return -1
      return ta - tb
    })
  } else if (filters.value.sortUpdated === 'debt_desc') {
    result.sort((a, b) => (Number(b.cong_no) || 0) - (Number(a.cong_no) || 0))
  }

  return result
})

const totalCount = computed(() => searchedCustomers.value.length)
const debtCustomerCount = computed(() => searchedCustomers.value.filter(c => (Number(c.cong_no) || 0) > 0).length)

// Lazy Loading (20 customers / batch)
const CUSTOMER_PAGE_SIZE = 20
const displayLimit = ref(CUSTOMER_PAGE_SIZE)
const totalFilteredCount = computed(() => filteredCustomers.value.length)
const visibleCustomers = computed(() => filteredCustomers.value.slice(0, displayLimit.value))
const displayedCustomersCount = computed(() => Math.min(displayLimit.value, totalFilteredCount.value))
const hasMoreCustomers = computed(() => displayLimit.value < totalFilteredCount.value)

const loadMoreCustomers = () => {
  if (displayLimit.value < totalFilteredCount.value) {
    displayLimit.value = Math.min(totalFilteredCount.value, displayLimit.value + CUSTOMER_PAGE_SIZE)
  }
}

const lazyLoadSentinelRef = ref(null)
let lazyLoadObserver = null

const setupLazyLoadObserver = (el) => {
  if (lazyLoadObserver) {
    lazyLoadObserver.disconnect()
    lazyLoadObserver = null
  }
  if (!el || typeof IntersectionObserver === 'undefined') return
  lazyLoadObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting && hasMoreCustomers.value && !loading.value) {
        loadMoreCustomers()
      }
    },
    { root: null, rootMargin: '280px 0px', threshold: 0.05 }
  )
  lazyLoadObserver.observe(el)
}

watch(lazyLoadSentinelRef, (newEl) => {
  setupLazyLoadObserver(newEl)
})

watch(
  [
    () => filters.value.search,
    () => filters.value.tagKH,
    () => filters.value.sortUpdated,
    () => filters.value.debt,
    () => filters.value.quoteSignal
  ],
  () => {
    displayLimit.value = CUSTOMER_PAGE_SIZE
    nextTick(() => {
      if (lazyLoadSentinelRef.value) {
        setupLazyLoadObserver(lazyLoadSentinelRef.value)
      }
    })
  }
)

// =========================================================
// 5. DUPLICATE DETECTION (UNION-FIND) & TAG MANAGEMENT
// =========================================================
const isModalOpen = ref(false)
const isEditing = ref(false)
const formData = ref({})

const isDuplicateModalOpen = ref(false)
const duplicateFilterType = ref('all')
const duplicateSearchQuery = ref('')

const duplicateGroups = computed(() => computeCustomerDuplicateGroups(customers.value))

const duplicateFilterTabs = computed(() => {
  const groups = duplicateGroups.value
  return [
    { key: 'all', label: 'Tất cả nhóm trùng', count: groups.length },
    { key: 'both', label: 'Công ty & Tên KH', count: groups.filter(g => g.reasonTypes.includes('both')).length },
    { key: 'company', label: 'Tên công ty', count: groups.filter(g => g.reasonTypes.includes('company')).length },
    { key: 'customer', label: 'Tên khách hàng', count: groups.filter(g => g.reasonTypes.includes('customer')).length },
    { key: 'mst', label: 'Trùng MST', count: groups.filter(g => g.reasonTypes.includes('mst')).length }
  ]
})

const filteredDuplicateGroups = computed(() => {
  let groups = duplicateGroups.value
  if (duplicateFilterType.value !== 'all') {
    groups = groups.filter(g => g.reasonTypes.includes(duplicateFilterType.value))
  }
  const q = normalizeForSearch(duplicateSearchQuery.value)
  if (q) {
    groups = groups.filter(g =>
      g.items.some(c =>
        (c.ten_khach_hang && normalizeForSearch(c.ten_khach_hang).includes(q)) ||
        (c.ten_cong_ty && normalizeForSearch(c.ten_cong_ty).includes(q)) ||
        (c.ma_khach_hang && normalizeForSearch(c.ma_khach_hang).includes(q)) ||
        (c.mst && normalizeForSearch(c.mst).includes(q)) ||
        (c.so_dien_thoai_ca_nhan && normalizeForSearch(c.so_dien_thoai_ca_nhan).includes(q))
      )
    )
  }
  return groups
})

const getDuplicateReasonStyle = (type) => {
  if (type === 'both') {
    return { background: 'rgba(239, 68, 68, 0.14)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.36)' }
  }
  if (type === 'mst') {
    return { background: 'rgba(245, 158, 11, 0.14)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.36)' }
  }
  if (type === 'company') {
    return { background: 'rgba(2, 132, 199, 0.14)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.36)' }
  }
  return { background: 'rgba(16, 185, 129, 0.14)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.36)' }
}

const getDupComparableValue = (item, fieldKey) => {
  if (!item) return ''
  const normText = (v) => String(v || '').trim().replace(/\s+/g, ' ').toLowerCase()
  switch (fieldKey) {
    case 'ma':
      return normText(item.ma_khach_hang)
    case 'company':
      return normText(item.ten_cong_ty || item.company)
    case 'person':
      return normText(item.ten_khach_hang)
    case 'mst':
      return String(item.mst || '').replace(/[^0-9A-Za-z-]/g, '').trim().toUpperCase()
    case 'phone':
      return String(item.so_dien_thoai_ca_nhan || item.so_dien_thoai_cong_ty || '').replace(/\D/g, '')
    case 'email':
      return String(item.email_ca_nhan || item.email_cong_ty || '').trim().toLowerCase()
    default:
      return ''
  }
}

const isDupFieldMismatched = (groupItems, itemIndex, fieldKey) => {
  if (!Array.isArray(groupItems) || groupItems.length < 2) return false
  const values = groupItems.map((it) => getDupComparableValue(it, fieldKey))
  const counts = new Map()
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1))
  if (counts.size <= 1) return false

  let maxFreq = 0
  counts.forEach((cnt) => {
    if (cnt > maxFreq) maxFreq = cnt
  })
  const winners = []
  counts.forEach((cnt, val) => {
    if (cnt === maxFreq) winners.push(val)
  })
  if (winners.length === 1 && maxFreq > 1) {
    return values[itemIndex] !== winners[0]
  }
  return true
}

const openDuplicateCheckModal = () => {
  duplicateFilterType.value = 'all'
  duplicateSearchQuery.value = ''
  isDuplicateModalOpen.value = true
}

const importedList = ref([])
const currentImportIndex = ref(0)
const isMultiImport = ref(false)

const initFormData = () => ({
  ma_khach_hang: '',
  ten_khach_hang: '',
  email_ca_nhan: '',
  so_dien_thoai_ca_nhan: '',
  ma_cong_ty: '',
  ten_cong_ty: '',
  so_dien_thoai_cong_ty: '',
  so_fax_cong_ty: '',
  dia_chi_cong_ty: '',
  email_cong_ty: '',
  website_cong_ty: '',
  hoa_hong: '',
  tong_chi_tieu: '',
  tong_loi_nhuan: '',
  trang_thai: 'Tiềm năng',
  ghi_chu: '',
  ten_khach_hang_phu: '',
  so_dien_thoai_ca_nhan_phu: '',
  email_ca_nhan_phu: '',
  mst: '',
  company: '',
  address: '',
  tel: '',
  nganh_nghe_cong_ty: '',
  cong_no: 0,
  tagKH: [],
  created_time: '',
  last_updated: ''
})

const formatLastUpdated = (val) => {
  if (!val && val !== 0) return 'Chưa ghi nhận'
  const rawStr = String(val).trim()
  if (!rawStr) return 'Chưa ghi nhận'
  let dt = null
  if (/^\d+$/.test(rawStr)) {
    dt = new Date(Number(rawStr))
  } else {
    dt = parseDateStr(rawStr) || new Date(rawStr)
  }
  if (!dt || isNaN(dt.getTime())) return rawStr
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

// Quản lý Nhóm Khách Hàng (tagKH)
const isTagModalOpen = ref(false)
const tempTagKH = ref('')
const newTagModalInput = ref('')
const customAddedTags = ref([])
const editingTagId = ref(null)
const editTagValue = ref('')

const availableTags = computed(() => {
  const tags = new Set(customAddedTags.value)
  customers.value.forEach(c => {
    if (Array.isArray(c.tagKH)) {
      c.tagKH.forEach(t => {
        if (t && String(t).trim()) tags.add(String(t).trim())
      })
    }
  })
  if (Array.isArray(formData.value?.tagKH)) {
    formData.value.tagKH.forEach(t => {
      if (t && String(t).trim()) tags.add(String(t).trim())
    })
  }
  return Array.from(tags)
})

const getTagCustomerCount = (tagName) => {
  return customers.value.filter(c => Array.isArray(c.tagKH) && c.tagKH.includes(tagName)).length
}

const toggleCfPicker = (key) => {
  const next = openCfPickerKey.value === key ? null : key
  openCfPickerKey.value = next
  if (next === 'tagKH') {
    cfPickerTagSearch.value = ''
  }
}

const closeCfPicker = () => {
  openCfPickerKey.value = null
}

const selectCfPickerOption = (key, value) => {
  if (key in filters.value) {
    filters.value[key] = value
  }
  openCfPickerKey.value = null
}

watch(showFilterPanel, (val) => {
  if (!val) openCfPickerKey.value = null
})

const CF_SORT_OPTIONS = [
  {
    value: '',
    label: 'Mặc định (Thứ tự hệ thống)',
    sub: 'Sắp xếp theo thứ tự mặc định của dữ liệu',
    icon: 'ri-list-ordered'
  },
  {
    value: 'desc',
    label: 'Cập nhật gần nhất trước',
    sub: 'Ưu tiên hồ sơ vừa chỉnh sửa hoặc giao dịch mới',
    icon: 'ri-time-line'
  },
  {
    value: 'asc',
    label: 'Cập nhật lâu nhất trước',
    sub: 'Tìm hồ sơ lâu chưa tương tác để chăm sóc lại',
    icon: 'ri-history-line'
  },
  {
    value: 'debt_desc',
    label: 'Công nợ cao → thấp',
    sub: 'Ưu tiên khách hàng có dư nợ phải thu lớn nhất',
    icon: 'ri-sort-desc'
  }
]

const cfFilterPickers = computed(() => {
  const qNorm = normalizeForSearch(cfPickerTagSearch.value)
  const qLow = String(cfPickerTagSearch.value || '').trim().toLowerCase()
  const matchedTags = availableTags.value.filter(tag => {
    if (!qLow) return true
    if (tag.toLowerCase().includes(qLow)) return true
    return Boolean(qNorm && normalizeForSearch(tag).includes(qNorm))
  })

  const tagFixedItems = [
    {
      value: '',
      label: 'Tất cả nhóm khách hàng',
      sub: 'Hiển thị toàn bộ tệp khách hàng trên hệ thống',
      countText: `${customers.value.length} KH`,
      icon: 'ri-group-line'
    },
    {
      value: '__tagged__',
      label: 'Đã phân nhóm',
      sub: 'Khách hàng đã được gắn ít nhất 1 nhóm (tagKH)',
      countText: `${taggedCustomerCount.value} KH`,
      dot: 'is-sky'
    },
    {
      value: '__untagged__',
      label: 'Chưa phân nhóm',
      sub: 'Khách hàng chưa được gán vào nhóm nào',
      countText: `${untaggedCustomerCount.value} KH`,
      dot: 'is-slate'
    }
  ]

  const tagCustomItems = matchedTags.map(tag => ({
    value: tag,
    label: tag,
    sub: '',
    countText: `${getTagCustomerCount(tag)} KH`,
    icon: 'ri-price-tag-3-line'
  }))

  let tagDisplayName = 'Tất cả nhóm khách hàng'
  let tagDisplayCount = `${customers.value.length} KH`
  if (filters.value.tagKH === '__tagged__') {
    tagDisplayName = 'Đã phân nhóm'
    tagDisplayCount = `${taggedCustomerCount.value} KH`
  } else if (filters.value.tagKH === '__untagged__') {
    tagDisplayName = 'Chưa phân nhóm'
    tagDisplayCount = `${untaggedCustomerCount.value} KH`
  } else if (filters.value.tagKH) {
    tagDisplayName = filters.value.tagKH
    tagDisplayCount = `${getTagCustomerCount(filters.value.tagKH)} KH`
  }

  const noDebtCount = Math.max(0, totalCount.value - debtCustomerCount.value)
  const debtItems = [
    {
      value: '',
      label: 'Tất cả công nợ',
      sub: 'Hiển thị tất cả không phân biệt trạng thái nợ',
      countText: `${totalCount.value} KH`,
      icon: 'ri-wallet-3-line'
    },
    {
      value: 'debt',
      label: 'Đang nợ > 0 đ',
      sub: 'Khách hàng còn dư nợ chưa tất toán hết',
      countText: `${debtCustomerCount.value} KH`,
      dot: 'is-rose'
    },
    {
      value: 'no_debt',
      label: 'Đã tất toán / Không nợ',
      sub: 'Khách hàng không nợ hoặc đã thanh toán đủ',
      countText: `${noDebtCount} KH`,
      dot: 'is-emerald'
    }
  ]

  const activeDebtItem = debtItems.find(i => i.value === filters.value.debt) || debtItems[0]
  const activeSortItem = CF_SORT_OPTIONS.find(i => i.value === filters.value.sortUpdated) || CF_SORT_OPTIONS[0]

  return [
    {
      key: 'tagKH',
      label: 'Nhóm khách hàng (tagKH)',
      sheetTitle: 'Chọn Nhóm khách hàng',
      sheetSub: `${availableTags.value.length} nhóm • Tổng ${customers.value.length} KH`,
      icon: 'ri-price-tag-3-line',
      activeValue: filters.value.tagKH,
      isCustom: Boolean(filters.value.tagKH),
      displayName: tagDisplayName,
      displayCount: tagDisplayCount,
      searchable: availableTags.value.length > 3,
      searchPlaceholder: 'Tìm nhanh tên nhóm khách hàng...',
      sections: [
        { title: '', items: tagFixedItems, emptyText: '' },
        ...(availableTags.value.length > 0
          ? [{
              title: `Danh sách nhóm (${tagCustomItems.length})`,
              items: tagCustomItems,
              emptyText: `Không tìm thấy nhóm phù hợp với "${cfPickerTagSearch.value}"`
            }]
          : [])
      ]
    },
    {
      key: 'debt',
      label: 'Trạng thái Công nợ',
      sheetTitle: 'Lọc Trạng thái Công nợ',
      sheetSub: `${debtCustomerCount.value} KH đang nợ • ${noDebtCount} KH không nợ`,
      icon: 'ri-bank-card-line',
      activeValue: filters.value.debt,
      isCustom: Boolean(filters.value.debt),
      displayName: activeDebtItem.label,
      displayCount: activeDebtItem.countText,
      searchable: false,
      searchPlaceholder: '',
      sections: [{ title: '', items: debtItems, emptyText: '' }]
    },
    {
      key: 'sortUpdated',
      label: 'Sắp xếp cập nhật',
      sheetTitle: 'Sắp xếp danh sách Khách hàng',
      sheetSub: `Chọn tiêu chí sắp xếp ${totalFilteredCount.value} khách hàng`,
      icon: 'ri-arrow-up-down-line',
      activeValue: filters.value.sortUpdated,
      isCustom: Boolean(filters.value.sortUpdated),
      displayName: activeSortItem.label,
      displayCount: '',
      searchable: false,
      searchPlaceholder: '',
      sections: [{ title: '', items: CF_SORT_OPTIONS, emptyText: '' }]
    }
  ]
})

const activeCfPicker = computed(() => {
  if (!openCfPickerKey.value) return null
  return cfFilterPickers.value.find(p => p.key === openCfPickerKey.value) || null
})

const addNewTagFromInput = () => {
  const newTag = String(tempTagKH.value || '').trim()
  if (!newTag) return
  if (!customAddedTags.value.includes(newTag)) {
    customAddedTags.value.push(newTag)
  }
  if (!Array.isArray(formData.value.tagKH)) {
    formData.value.tagKH = []
  }
  if (!formData.value.tagKH.includes(newTag)) {
    formData.value.tagKH.push(newTag)
  }
  tempTagKH.value = ''
  showToast(`Đã thêm nhóm "${newTag}"`, 'success', 2000)
}

const createTagFromManager = () => {
  const newTag = String(newTagModalInput.value || '').trim()
  if (!newTag) return
  if (!customAddedTags.value.includes(newTag)) {
    customAddedTags.value.push(newTag)
  }
  newTagModalInput.value = ''
  showToast(`Đã tạo nhóm "${newTag}"`, 'success', 2000)
}

const toggleTag = (tagName) => {
  if (!Array.isArray(formData.value.tagKH)) {
    formData.value.tagKH = []
  }
  if (formData.value.tagKH.includes(tagName)) {
    formData.value.tagKH = formData.value.tagKH.filter(t => t !== tagName)
  } else {
    formData.value.tagKH.push(tagName)
  }
}

// ─── Ngành nghề kinh doanh picker ───
const isIndustryPickerOpen = ref(false)
const industrySearchQuery = ref('')
const newIndustryInput = ref('')
const customAddedIndustries = ref([])

const industryDirectoryList = computed(() => {
  const counts = new Map()
  const addInd = (raw, inc = 1) => {
    const clean = String(raw || '').trim()
    if (!clean || clean === 'Chưa phân loại ngành' || clean === 'Chưa rõ ngành') return
    const key = clean.toLowerCase()
    if (!counts.has(key)) {
      counts.set(key, { name: clean, count: 0 })
    }
    counts.get(key).count += inc
  }

  customers.value.forEach(c => {
    if (c?.nganh_nghe_cong_ty) addInd(c.nganh_nghe_cong_ty, 1)
  })
  customAddedIndustries.value.forEach(ind => addInd(ind, 0))
  if (formData.value?.nganh_nghe_cong_ty) {
    addInd(formData.value.nganh_nghe_cong_ty, 0)
  }

  return Array.from(counts.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'vi')
  )
})

const filteredIndustryDirectoryList = computed(() => {
  const q = String(industrySearchQuery.value || '').trim().toLowerCase()
  if (!q) return industryDirectoryList.value
  return industryDirectoryList.value.filter(it => it.name.toLowerCase().includes(q))
})

const openIndustryPickerModal = () => {
  industrySearchQuery.value = ''
  newIndustryInput.value = ''
  isIndustryPickerOpen.value = true
}

const isIndustrySelected = (name) => {
  const cur = String(formData.value?.nganh_nghe_cong_ty || '').trim().toLowerCase()
  const target = String(name || '').trim().toLowerCase()
  return Boolean(cur && target && cur === target)
}

const selectIndustryFromPicker = (name) => {
  const clean = String(name || '').trim()
  if (!clean) return
  formData.value.nganh_nghe_cong_ty = clean
  isIndustryPickerOpen.value = false
}

const createAndSelectIndustry = () => {
  const clean = String(newIndustryInput.value || industrySearchQuery.value || '').trim()
  if (!clean) return
  if (!customAddedIndustries.value.some(it => it.toLowerCase() === clean.toLowerCase())) {
    customAddedIndustries.value.push(clean)
  }
  selectIndustryFromPicker(clean)
}

const startEditTag = (tagName) => {
  editingTagId.value = tagName
  editTagValue.value = tagName
}

const saveTagEdit = async (oldTagName) => {
  const newTagName = String(editTagValue.value || '').trim()
  if (!newTagName || newTagName === oldTagName) {
    editingTagId.value = null
    return
  }

  const updates = {}
  const nowIso = new Date().toISOString()
  customers.value.forEach(c => {
    if (Array.isArray(c.tagKH) && c.tagKH.includes(oldTagName)) {
      const newTags = Array.from(new Set(c.tagKH.map(t => (t === oldTagName ? newTagName : t))))
      const fbKey = c._firebaseKey || sanitizeFirebaseKey(c.ma_khach_hang)
      if (fbKey) {
        updates[`khach_hang/${fbKey}/tagKH`] = newTags
        updates[`khach_hang/${fbKey}/last_updated`] = nowIso
      }
      c.tagKH = newTags
      c.last_updated = nowIso
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(dbRef(database), updates)
  }

  customAddedTags.value = customAddedTags.value.map(t => (t === oldTagName ? newTagName : t))
  if (Array.isArray(formData.value.tagKH) && formData.value.tagKH.includes(oldTagName)) {
    formData.value.tagKH = Array.from(new Set(formData.value.tagKH.map(t => (t === oldTagName ? newTagName : t))))
  }
  if (filters.value.tagKH === oldTagName) {
    filters.value.tagKH = newTagName
  }
  editingTagId.value = null
  showToast(`Đã đổi tên nhóm thành "${newTagName}"`, 'success')
}

const deleteTagGlobal = async (tagName) => {
  const affectedCount = getTagCustomerCount(tagName)
  const ok = await openCustomerConfirm(
    `Bạn có chắc muốn gỡ bỏ nhóm "${tagName}" khỏi toàn bộ hệ thống?`,
    {
      variant: 'danger',
      title: 'Xóa nhóm khách hàng',
      highlightLabel: 'NHÓM KHÁCH HÀNG',
      highlightValue: `${tagName} (${affectedCount} khách hàng đang gắn)`,
      subNote: 'Thao tác này chỉ gỡ nhãn phân nhóm, không xóa hồ sơ khách hàng.',
      confirmText: 'Xóa nhóm này'
    }
  )
  if (!ok) return

  const updates = {}
  const nowIso = new Date().toISOString()
  customers.value.forEach(c => {
    if (Array.isArray(c.tagKH) && c.tagKH.includes(tagName)) {
      const newTags = c.tagKH.filter(t => t !== tagName)
      const fbKey = c._firebaseKey || sanitizeFirebaseKey(c.ma_khach_hang)
      if (fbKey) {
        updates[`khach_hang/${fbKey}/tagKH`] = newTags
        updates[`khach_hang/${fbKey}/last_updated`] = nowIso
      }
      c.tagKH = newTags
      c.last_updated = nowIso
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(dbRef(database), updates)
  }

  customAddedTags.value = customAddedTags.value.filter(t => t !== tagName)
  if (Array.isArray(formData.value.tagKH)) {
    formData.value.tagKH = formData.value.tagKH.filter(t => t !== tagName)
  }
  if (filters.value.tagKH === tagName) {
    filters.value.tagKH = ''
  }
  showToast(`Đã xóa nhóm "${tagName}"`, 'success')
}

// =========================================================
// 6. CUSTOMER DEBT & PAYMENT WORKSPACE (100% BAOGIAFIREBASE)
// =========================================================
const saleReportRows = ref([])
const lichSuThanhToanList = ref([])
const mobileDebtActiveTab = ref('schedule')

const toNum = (v) => {
  if (v === null || v === undefined || v === '') return 0
  if (typeof v === 'number') return isNaN(v) ? 0 : v
  const cleaned = String(v).replace(/[^0-9.-]/g, '')
  const n = Number(cleaned)
  return isNaN(n) ? 0 : n
}

const parseDateStr = (str) => {
  if (!str) return null
  const s = String(str).trim()
  const dmyTime = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  if (dmyTime) {
    return new Date(
      Number(dmyTime[3]),
      Number(dmyTime[2]) - 1,
      Number(dmyTime[1]),
      Number(dmyTime[4] || 0),
      Number(dmyTime[5] || 0),
      Number(dmyTime[6] || 0)
    )
  }
  const timeDmy = s.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (timeDmy) {
    return new Date(
      Number(timeDmy[6]),
      Number(timeDmy[5]) - 1,
      Number(timeDmy[4]),
      Number(timeDmy[1] || 0),
      Number(timeDmy[2] || 0),
      Number(timeDmy[3] || 0)
    )
  }
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

const getFormattedNow = () => {
  const now = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(now.getDate())}/${p(now.getMonth() + 1)}/${now.getFullYear()} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`
}

const tongSauVat = (r) => {
  if (!r) return 0
  const s = toNum(r.Tong_tien_sau_thueVAT)
  return s > 0 ? s : (toNum(r.Tong_tien_truoc_thueVAT) + toNum(r.Tong_thueVAT))
}
const daThanhToan = (r) => toNum(r?.so_tien_da_thanh_toan)
const congNo = (r) => {
  if (!r) return 0
  if (r.cong_no !== undefined && r.cong_no !== null && r.cong_no !== '') {
    return Math.max(0, toNum(r.cong_no))
  }
  return Math.max(0, tongSauVat(r) - daThanhToan(r))
}

// Aliases matching baogiaFirebase template calls 1:1
const poTongSauVat = tongSauVat
const poDaThanhToan = daThanhToan
const poCongNo = congNo

const getDebtCustomerDisplayName = (cust) => {
  if (!cust) return 'Khách hàng'
  return (
    cust.ten_cong_ty ||
    cust.Ten_cong_ty ||
    cust.ten_khach_hang ||
    cust.Ten_khach_hang ||
    cust.company ||
    'Khách hàng'
  )
}

const getDebtCustomerCode = (cust) => {
  if (!cust) return 'N/A'
  return cust.ma_khach_hang || cust.Ma_khach_hang || cust.ma_cong_ty || cust.Ma_cong_ty || 'N/A'
}

const ddmmyyyyToIso = (s) => {
  if (!s) return ''
  const str = String(s).trim()
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  return ''
}
const debtDdmmyyyyToIso = ddmmyyyyToIso

const isoToDdmmyyyy = (iso) => {
  if (!iso) return ''
  const str = String(iso).trim()
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`
  return str
}

const formatDateObjToDdmmyyyy = (d) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

const addDaysToDateStr = (baseStr, days) => {
  const baseDate = parseDateStr(baseStr) || new Date()
  const target = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  target.setDate(target.getDate() + days)
  return formatDateObjToDdmmyyyy(target)
}

const getDaysUntilDue = (dueDateStr) => {
  if (!dueDateStr) return null
  const d = parseDateStr(String(dueDateStr).trim())
  if (!d || isNaN(d.getTime())) return null
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dueMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((dueMidnight - todayMidnight) / 86400000)
}

const evaluateInstallmentSchedule = (totalSau, paidTotal, mode, singleDue, items) => {
  const rawList =
    mode === 'nhieu_dot' && Array.isArray(items) && items.length > 0
      ? items
      : [
          {
            dot: 1,
            noi_dung: 'Thanh toán 100% đơn hàng',
            ty_le_pct: 100,
            so_tien_phai_thu: totalSau,
            han_thanh_toan: singleDue || (Array.isArray(items) && items[0]?.han_thanh_toan) || ''
          }
        ]

  let remainingPaid = Math.max(0, toNum(paidTotal))

  return rawList.map((inst, idx) => {
    const phaiThu = Math.max(0, toNum(inst.so_tien_phai_thu))
    const daThu = Math.min(phaiThu, remainingPaid)
    remainingPaid = Math.max(0, remainingPaid - daThu)
    const conThieu = Math.max(0, phaiThu - daThu)
    const hanTT = String(inst.han_thanh_toan || '').trim()
    const daysDiff = getDaysUntilDue(hanTT)

    let status = 'chua_co_han'
    let statusLabel = 'Chưa đặt hạn'
    let statusColor = '#64748b'

    if (conThieu <= 0 && phaiThu > 0) {
      status = 'da_thu_du'
      statusLabel = 'Đã thu đủ'
      statusColor = '#10b981'
    } else if (daysDiff !== null && daysDiff < 0) {
      status = 'qua_han'
      statusLabel = `Quá hạn ${Math.abs(daysDiff)} ngày`
      statusColor = '#ef4444'
    } else if (daysDiff !== null && daysDiff === 0) {
      status = 'den_han_hom_nay'
      statusLabel = 'Hôm nay đến hạn'
      statusColor = '#f59e0b'
    } else if (daysDiff !== null && daysDiff > 0 && daysDiff <= 7) {
      status = 'sap_den_han'
      statusLabel = `Sắp đến hạn (còn ${daysDiff} ngày)`
      statusColor = '#f59e0b'
    } else if (daThu > 0) {
      status = 'thu_mot_phan'
      statusLabel = daysDiff !== null ? `Thu 1 phần (còn ${daysDiff} ngày)` : 'Đã thu 1 phần'
      statusColor = '#0284c7'
    } else if (daysDiff !== null && daysDiff > 7) {
      status = 'trong_han'
      statusLabel = `Trong hạn (còn ${daysDiff} ngày)`
      statusColor = '#64748b'
    }

    return {
      dot: inst.dot || idx + 1,
      noi_dung: inst.noi_dung || `Đợt ${idx + 1}`,
      ty_le_pct: toNum(inst.ty_le_pct),
      so_tien_phai_thu: phaiThu,
      han_thanh_toan: hanTT,
      da_thu: daThu,
      con_thieu: conThieu,
      daysDiff,
      status,
      statusLabel,
      statusColor
    }
  })
}

const doesRowMatchCustomer = (r, kh) => {
  if (!r || !kh) return false
  const mkh = String(kh.ma_khach_hang || kh.Ma_khach_hang || '').trim()
  const mct = String(kh.ma_cong_ty || kh.Ma_cong_ty || '').trim()
  const mst = String(kh.mst || kh.MST || '').trim()
  const rMkh = String(r.Ma_khach_hang || r.ma_khach_hang || '').trim()
  const rMct = String(r.Ma_cong_ty || r.ma_cong_ty || '').trim()
  const rMst = String(r.MST || r.mst || '').trim()

  if (mkh && rMkh && mkh === rMkh) return true
  if (mct && rMct && mct === rMct) return true
  if (mkh && rMct && mkh === rMct) return true
  if (mct && rMkh && mct === rMkh) return true
  if (mst && rMst && mst === rMst) return true
  return false
}

const getPoContractContent = (po, maxLen = 0) => {
  if (!po) return 'Chưa có nội dung HĐ/PO'
  const raw = String(
    po.content_of_contract_PO ??
    po.content_of_contract_po ??
    po['content_of_contract/PO'] ??
    po.Content_of_Contract_PO ??
    po.ten_po ??
    po.Ten_PO ??
    po.So_PO ??
    po.so_hop_dong ??
    po.ma_hop_dong ??
    ''
  ).trim()
  const label = raw || 'Chưa có nội dung HĐ/PO'
  if (maxLen > 0 && label.length > maxLen) {
    return label.slice(0, maxLen).trimEnd() + '…'
  }
  return label
}

const getPoCreatedDateShort = (po) => {
  if (!po || !po.created_time) return ''
  const d = parseDateStr(po.created_time)
  if (d && !isNaN(d.getTime())) {
    return formatDateObjToDdmmyyyy(d)
  }
  const m = String(po.created_time).match(/(\d{1,2}\/\d{1,2}\/\d{4})/)
  return m ? m[1] : ''
}

const getPaymentHistoryCustomerInfo = (h) => {
  let tenKH = String(h?.ten_khach_hang || h?.Ten_khach_hang || '').trim()
  let tenCongTy = String(h?.ten_cong_ty || h?.Ten_cong_ty || '').trim()

  const srId = String(h?.id_salereport || '').trim()
  let matchedSr = null
  if ((!tenKH || !tenCongTy) && srId) {
    matchedSr = saleReportRows.value.find(
      r => String(r.ID || '') === srId || String(r._firebaseKey || '') === srId
    )
    if (matchedSr) {
      if (!tenKH) tenKH = String(matchedSr.Ten_khach_hang || matchedSr.ten_khach_hang || '').trim()
      if (!tenCongTy) tenCongTy = String(matchedSr.Ten_cong_ty || matchedSr.ten_cong_ty || '').trim()
    }
  }

  const lookupCode = String(h?.maKH || matchedSr?.Ma_khach_hang || matchedSr?.Ma_cong_ty || '').trim().toUpperCase()
  if ((!tenKH || !tenCongTy) && lookupCode) {
    const matchedKh = customers.value.find(c => {
      const cMkh = String(c.ma_khach_hang || c.Ma_khach_hang || '').trim().toUpperCase()
      const cMct = String(c.ma_cong_ty || c.Ma_cong_ty || '').trim().toUpperCase()
      return (cMkh && cMkh === lookupCode) || (cMct && cMct === lookupCode)
    })
    if (matchedKh) {
      if (!tenKH) tenKH = String(matchedKh.ten_khach_hang || matchedKh.Ten_khach_hang || '').trim()
      if (!tenCongTy) tenCongTy = String(matchedKh.ten_cong_ty || matchedKh.Ten_cong_ty || '').trim()
    }
  }

  const m = paymentModal.value
  if (!tenKH) {
    tenKH = String(
      m.row?.Ten_khach_hang ||
      m.row?.ten_khach_hang ||
      m.customer?.ten_khach_hang ||
      m.customer?.Ten_khach_hang ||
      ''
    ).trim()
  }
  if (!tenCongTy) {
    tenCongTy = String(
      m.row?.Ten_cong_ty ||
      m.row?.ten_cong_ty ||
      m.customer?.ten_cong_ty ||
      m.customer?.Ten_cong_ty ||
      ''
    ).trim()
  }

  return {
    tenKH: tenKH || '—',
    tenCongTy: tenCongTy || '—'
  }
}

const getCustomerPOs = (kh) => {
  if (!kh) return []
  return saleReportRows.value
    .filter(r => doesRowMatchCustomer(r, kh))
    .sort((a, b) => {
      const aUnpaid = congNo(a) > 0 ? 1 : 0
      const bUnpaid = congNo(b) > 0 ? 1 : 0
      if (bUnpaid !== aUnpaid) return bUnpaid - aUnpaid
      const da = parseDateStr(a.created_time)?.getTime() || 0
      const db = parseDateStr(b.created_time)?.getTime() || 0
      return db - da
    })
}

const getCustomerDebtSummary = (kh) => {
  if (!kh) return { poCount: 0, tongSauVat: 0, daThanhToan: 0, congNo: 0, progressPct: 0 }
  const pos = getCustomerPOs(kh)
  if (pos.length > 0) {
    const tongSau = pos.reduce((s, r) => s + tongSauVat(r), 0)
    const daTT = pos.reduce((s, r) => s + daThanhToan(r), 0)
    const cn = pos.reduce((s, r) => s + congNo(r), 0)
    const progressPct = tongSau > 0 ? Math.min(100, Math.round((daTT / tongSau) * 100)) : (cn <= 0 ? 100 : 0)
    return { poCount: pos.length, tongSauVat: tongSau, daThanhToan: daTT, congNo: cn, progressPct }
  }
  const fallbackCn = Math.max(0, toNum(kh.cong_no))
  return {
    poCount: 0,
    tongSauVat: fallbackCn,
    daThanhToan: 0,
    congNo: fallbackCn,
    progressPct: fallbackCn > 0 ? 0 : 100
  }
}

const getPaymentHistoryForPO = (r) => {
  if (!r) return []
  const srId = String(r.ID || r._firebaseKey || '')
  const fbKey = String(r._firebaseKey || '')
  return lichSuThanhToanList.value.filter(
    h => (srId && String(h.id_salereport) === srId) || (fbKey && String(h.id_salereport) === fbKey)
  )
}

const getPaymentHistoryForCustomer = (kh) => {
  if (!kh) return []
  const pos = getCustomerPOs(kh)
  const poIds = new Set()
  pos.forEach(p => {
    if (p.ID) poIds.add(String(p.ID))
    if (p._firebaseKey) poIds.add(String(p._firebaseKey))
  })
  const mkh = String(kh.ma_khach_hang || kh.Ma_khach_hang || '').trim()
  const mct = String(kh.ma_cong_ty || kh.Ma_cong_ty || '').trim()
  return lichSuThanhToanList.value.filter(h => {
    const srId = String(h.id_salereport || '')
    const hMaKH = String(h.maKH || '').trim()
    if (srId && poIds.has(srId)) return true
    if (mkh && hMaKH === mkh) return true
    if (mct && hMaKH === mct) return true
    return false
  })
}

const getCustomerPaymentHistoryCount = (kh) => {
  return getPaymentHistoryForCustomer(kh).length
}

const paymentModal = ref({
  show: false,
  customer: null,
  customerPOs: [],
  row: null,
  amount: 0,
  amountStr: '',
  paymentTime: '',
  note: '',
  saving: false,
  scheduleMode: 'mot_lan',
  singleDueDate: '',
  scheduleItems: [],
  savingSchedule: false,
  showScheduleSubModal: false,
  showRecordSubModal: false
})

const modalDebtProgressPct = computed(() => {
  const m = paymentModal.value
  if (!m.customer) return 0
  const total = m.row ? poTongSauVat(m.row) : getCustomerDebtSummary(m.customer).tongSauVat
  const paid = m.row ? poDaThanhToan(m.row) : getCustomerDebtSummary(m.customer).daThanhToan
  if (total <= 0) return paid > 0 ? 100 : 0
  return Math.min(100, Math.max(0, Math.round((paid / total) * 1000) / 10))
})

const currentModalPaymentHistory = computed(() => {
  if (paymentModal.value.row) {
    return getPaymentHistoryForPO(paymentModal.value.row)
  }
  return getPaymentHistoryForCustomer(paymentModal.value.customer)
})

const modalEvaluatedInstallments = computed(() => {
  const m = paymentModal.value
  if (!m.row) return []
  return evaluateInstallmentSchedule(
    tongSauVat(m.row),
    daThanhToan(m.row),
    m.scheduleMode,
    m.singleDueDate,
    m.scheduleItems
  )
})

const modalScheduleTotalPct = computed(() => {
  const m = paymentModal.value
  if (m.scheduleMode === 'mot_lan') return 100
  return Math.round(m.scheduleItems.reduce((s, it) => s + toNum(it.ty_le_pct), 0) * 100) / 100
})

const modalScheduleTotalAmount = computed(() => {
  const m = paymentModal.value
  if (!m.row) return 0
  if (m.scheduleMode === 'mot_lan') return tongSauVat(m.row)
  return m.scheduleItems.reduce((s, it) => s + toNum(it.so_tien_phai_thu), 0)
})

const setupModalForPO = (row) => {
  if (!row) {
    paymentModal.value.row = null
    paymentModal.value.scheduleItems = []
    paymentModal.value.singleDueDate = ''
    paymentModal.value.amount = 0
    paymentModal.value.amountStr = '0'
    return
  }
  const totalSau = tongSauVat(row)
  const existingMode =
    row.loai_thanh_toan === 'nhieu_dot' || (Array.isArray(row.ke_hoach_thanh_toan) && row.ke_hoach_thanh_toan.length > 1)
      ? 'nhieu_dot'
      : 'mot_lan'

  const existingSchedule =
    Array.isArray(row.ke_hoach_thanh_toan) && row.ke_hoach_thanh_toan.length > 0
      ? row.ke_hoach_thanh_toan.map((it, idx) => ({
          dot: Number(it.dot) || idx + 1,
          noi_dung: String(it.noi_dung || `Đợt ${idx + 1}`),
          ty_le_pct: Number(it.ty_le_pct) || 0,
          so_tien_phai_thu: Number(it.so_tien_phai_thu) || Math.round(totalSau * ((Number(it.ty_le_pct) || 0) / 100)),
          han_thanh_toan: String(it.han_thanh_toan || '')
        }))
      : [
          {
            dot: 1,
            noi_dung: 'Thanh toán 100% đơn hàng',
            ty_le_pct: 100,
            so_tien_phai_thu: totalSau,
            han_thanh_toan: String(row.han_thanh_toan || '')
          }
        ]

  const singleDue = String(row.han_thanh_toan || existingSchedule[0]?.han_thanh_toan || '')
  const evalInst = evaluateInstallmentSchedule(totalSau, daThanhToan(row), existingMode, singleDue, existingSchedule)
  const nextUnpaid = evalInst.find(x => x.con_thieu > 0)
  const defaultNote = existingMode === 'nhieu_dot' && nextUnpaid ? `Thanh toán Đợt ${nextUnpaid.dot} (${nextUnpaid.noi_dung})` : ''

  paymentModal.value.row = row
  paymentModal.value.amount = 0
  paymentModal.value.amountStr = '0'
  paymentModal.value.paymentTime = getFormattedNow()
  paymentModal.value.note = defaultNote
  paymentModal.value.scheduleMode = existingMode
  paymentModal.value.singleDueDate = singleDue
  paymentModal.value.scheduleItems = existingSchedule
  paymentModal.value.showScheduleSubModal = false
  paymentModal.value.showRecordSubModal = false
}

const openCustomerDebtModal = (kh) => {
  if (!kh) return
  const normalizedKh = {
    ...kh,
    ma_khach_hang: kh.ma_khach_hang || kh.Ma_khach_hang || genMaKH(kh.ten_khach_hang || '', kh.ten_cong_ty || ''),
    ma_cong_ty: kh.ma_cong_ty || kh.Ma_cong_ty || genMaCT(kh.ten_cong_ty || '')
  }
  const pos = getCustomerPOs(normalizedKh)
  const firstUnpaid = pos.find(p => congNo(p) > 0) || pos[0] || null
  paymentModal.value.customer = normalizedKh
  paymentModal.value.customerPOs = pos
  mobileDebtActiveTab.value = firstUnpaid ? 'schedule' : 'history'
  paymentModal.value.show = true
  setupModalForPO(firstUnpaid)
}

const closePaymentModal = () => {
  paymentModal.value.show = false
}

const selectPoInPaymentModal = (po) => {
  setupModalForPO(po)
}

// Schedule Sub-Modal + Dirty Guard
let initialScheduleSnapshot = ''

const serializeScheduleState = () => {
  const m = paymentModal.value
  return JSON.stringify({
    mode: m.scheduleMode,
    singleDue: String(m.singleDueDate || '').trim(),
    items: (m.scheduleItems || []).map(it => ({
      noi_dung: String(it.noi_dung || '').trim(),
      ty_le_pct: toNum(it.ty_le_pct),
      so_tien_phai_thu: toNum(it.so_tien_phai_thu),
      han_thanh_toan: String(it.han_thanh_toan || '').trim()
    }))
  })
}

const openScheduleSubModal = () => {
  if (!paymentModal.value.row) return
  setupModalForPO(paymentModal.value.row)
  paymentModal.value.showScheduleSubModal = true
  initialScheduleSnapshot = serializeScheduleState()
}

const attemptCloseScheduleSubModal = async () => {
  if (paymentModal.value.savingSchedule) return
  if (paymentModal.value.showScheduleSubModal && initialScheduleSnapshot && serializeScheduleState() !== initialScheduleSnapshot) {
    const ok = await openCustomerConfirm(
      'Bạn đang có thay đổi kế hoạch / mốc hạn thanh toán chưa lưu. Bạn có chắc muốn đóng mà không lưu?',
      {
        variant: 'warning',
        title: 'Chưa lưu kế hoạch thanh toán',
        confirmText: 'Đóng không lưu',
        cancelText: 'Tiếp tục chỉnh sửa'
      }
    )
    if (!ok) return
    setupModalForPO(paymentModal.value.row)
  }
  paymentModal.value.showScheduleSubModal = false
}

const openRecordPaymentSubModal = (evalInst) => {
  const m = paymentModal.value
  if (!m.row) return
  m.paymentTime = getFormattedNow()
  m.amount = 0
  m.amountStr = '0'
  if (evalInst) {
    const suggestedAmt = toNum(evalInst.con_thieu) > 0 ? toNum(evalInst.con_thieu) : toNum(evalInst.so_tien_phai_thu)
    m.amount = suggestedAmt
    m.amountStr = suggestedAmt > 0 ? suggestedAmt.toLocaleString('vi-VN') : '0'
    m.note = m.scheduleMode === 'nhieu_dot'
      ? `Thanh toán Đợt ${evalInst.dot} (${evalInst.noi_dung})`
      : 'Thanh toán 100% đơn hàng'
  } else {
    const nextUnpaid = modalEvaluatedInstallments.value.find(x => x.con_thieu > 0)
    m.note = m.scheduleMode === 'nhieu_dot' && nextUnpaid
      ? `Thanh toán Đợt ${nextUnpaid.dot} (${nextUnpaid.noi_dung})`
      : ''
  }
  m.showScheduleSubModal = false
  m.showRecordSubModal = true
}

const attemptCloseRecordSubModal = async () => {
  if (paymentModal.value.saving) return
  if (paymentModal.value.showRecordSubModal && toNum(paymentModal.value.amount) > 0) {
    const ok = await openCustomerConfirm(
      'Bạn đã nhập số tiền thanh toán nhưng chưa xác nhận lưu. Bạn có muốn hủy đợt ghi nhận này không?',
      {
        variant: 'warning',
        title: 'Hủy ghi nhận thanh toán?',
        confirmText: 'Hủy không lưu',
        cancelText: 'Quay lại lưu'
      }
    )
    if (!ok) return
  }
  paymentModal.value.showRecordSubModal = false
}

const applyQuickInstallmentAmount = (evalInst) => {
  const m = paymentModal.value
  if (!m.row || !evalInst) return
  const amt = toNum(evalInst.con_thieu) > 0 ? toNum(evalInst.con_thieu) : toNum(evalInst.so_tien_phai_thu)
  m.amount = amt
  m.amountStr = amt > 0 ? amt.toLocaleString('vi-VN') : '0'
  m.note = m.scheduleMode === 'nhieu_dot'
    ? `Thanh toán Đợt ${evalInst.dot} (${evalInst.noi_dung})`
    : 'Thanh toán 100% đơn hàng'
}

const resetPaymentAmountToZero = () => {
  paymentModal.value.amount = 0
  paymentModal.value.amountStr = '0'
}

const onPaymentAmountFocus = (e) => {
  const target = e?.target
  if (!target) return
  if (paymentModal.value.amount === 0 || String(target.value || '').trim() === '0') {
    requestAnimationFrame(() => target.select())
  }
}

const onPaymentAmountBlur = () => {
  if (!paymentModal.value.amount || paymentModal.value.amount <= 0) {
    paymentModal.value.amount = 0
    paymentModal.value.amountStr = '0'
  }
}

const setScheduleMode = (mode) => {
  const m = paymentModal.value
  if (!m.row) return
  m.scheduleMode = mode
  const totalSau = tongSauVat(m.row)
  if (mode === 'mot_lan') {
    if (!m.singleDueDate && m.scheduleItems.length > 0) {
      m.singleDueDate = m.scheduleItems[0].han_thanh_toan || ''
    }
  } else {
    if (m.scheduleItems.length <= 1) {
      applySchedulePreset([30, 70], ['Đợt 1 - Tạm ứng hợp đồng', 'Đợt 2 - Thanh toán khi giao hàng'])
    } else {
      m.scheduleItems.forEach((it, idx) => {
        it.dot = idx + 1
        if (!it.so_tien_phai_thu && it.ty_le_pct > 0) {
          it.so_tien_phai_thu = Math.round(totalSau * (it.ty_le_pct / 100))
        }
      })
    }
  }
}

const setSingleDueDateDays = (days, fromCreatedTime = false) => {
  const m = paymentModal.value
  if (!m.row) return
  const baseStr = fromCreatedTime && m.row.created_time ? m.row.created_time : getFormattedNow()
  m.singleDueDate = addDaysToDateStr(baseStr, days)
  if (m.scheduleItems.length === 1) {
    m.scheduleItems[0].han_thanh_toan = m.singleDueDate
  }
}

const onSingleDueDatePickerChange = (e) => {
  const dmy = isoToDdmmyyyy(e.target.value)
  paymentModal.value.singleDueDate = dmy
  if (paymentModal.value.scheduleItems.length === 1) {
    paymentModal.value.scheduleItems[0].han_thanh_toan = dmy
  }
}

const applySchedulePreset = (pcts, labels) => {
  const m = paymentModal.value
  if (!m.row) return
  m.scheduleMode = 'nhieu_dot'
  const totalSau = tongSauVat(m.row)
  const baseStr = m.row.created_time || getFormattedNow()
  let allocated = 0

  m.scheduleItems = pcts.map((pct, idx) => {
    const isLast = idx === pcts.length - 1
    const amt = isLast ? Math.max(0, totalSau - allocated) : Math.round(totalSau * (pct / 100))
    allocated += amt
    const defaultDays = idx === 0 ? 7 : idx === 1 ? 30 : 45 + (idx - 2) * 15
    return {
      dot: idx + 1,
      noi_dung: (labels && labels[idx]) || (idx === 0 ? 'Đợt 1 - Tạm ứng' : idx === pcts.length - 1 ? `Đợt ${idx + 1} - Tất toán` : `Đợt ${idx + 1} - Thanh toán`),
      ty_le_pct: pct,
      so_tien_phai_thu: amt,
      han_thanh_toan: addDaysToDateStr(baseStr, defaultDays)
    }
  })
}

const addScheduleInstallment = () => {
  const m = paymentModal.value
  if (!m.row) return
  const totalSau = tongSauVat(m.row)
  const currentPct = m.scheduleItems.reduce((s, it) => s + toNum(it.ty_le_pct), 0)
  const remainPct = Math.max(0, Math.round((100 - currentPct) * 100) / 100)
  const currentAmt = m.scheduleItems.reduce((s, it) => s + toNum(it.so_tien_phai_thu), 0)
  const remainAmt = Math.max(0, totalSau - currentAmt)
  const nextDot = m.scheduleItems.length + 1
  const lastDue = m.scheduleItems[m.scheduleItems.length - 1]?.han_thanh_toan || m.row.created_time || getFormattedNow()

  m.scheduleItems.push({
    dot: nextDot,
    noi_dung: `Đợt ${nextDot} - Thanh toán`,
    ty_le_pct: remainPct,
    so_tien_phai_thu: remainAmt,
    han_thanh_toan: addDaysToDateStr(lastDue, 15)
  })
}

const removeScheduleInstallment = (idx) => {
  const m = paymentModal.value
  if (m.scheduleItems.length <= 1) return
  m.scheduleItems.splice(idx, 1)
  m.scheduleItems.forEach((it, i) => {
    it.dot = i + 1
  })
}

const onInstallmentPctChange = (idx, valOrEvent) => {
  const m = paymentModal.value
  if (!m.row || !m.scheduleItems[idx]) return
  const rawVal = typeof valOrEvent === 'number' ? valOrEvent : (Number(valOrEvent?.target?.value) || 0)
  const pct = Math.max(0, Math.min(100, rawVal))
  const totalSau = tongSauVat(m.row)
  m.scheduleItems[idx].ty_le_pct = pct
  m.scheduleItems[idx].so_tien_phai_thu = Math.round(totalSau * (pct / 100))
}

const onInstallmentAmountInput = (idx, e) => {
  const m = paymentModal.value
  if (!m.row || !m.scheduleItems[idx]) return
  const raw = String(e.target.value || '').replace(/[^0-9]/g, '')
  const amt = raw ? Number(raw) : 0
  const totalSau = tongSauVat(m.row)
  m.scheduleItems[idx].so_tien_phai_thu = amt
  m.scheduleItems[idx].ty_le_pct = totalSau > 0 ? Math.round((amt / totalSau) * 10000) / 100 : 0
  e.target.value = amt > 0 ? amt.toLocaleString('vi-VN') : ''
}

const onInstallmentAmountPaste = (idx, e) => {
  const m = paymentModal.value
  if (!m.row || !m.scheduleItems[idx]) return
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text') ?? ''
  if (!pasted) return
  const raw = String(pasted).replace(/[^0-9]/g, '')
  const amt = raw ? Number(raw) : 0
  const totalSau = tongSauVat(m.row)
  m.scheduleItems[idx].so_tien_phai_thu = amt
  m.scheduleItems[idx].ty_le_pct = totalSau > 0 ? Math.round((amt / totalSau) * 10000) / 100 : 0
  if (e.target) {
    e.target.value = amt > 0 ? amt.toLocaleString('vi-VN') : ''
  }
}

const onInstallmentDatePickerChange = (idx, e) => {
  if (!paymentModal.value.scheduleItems[idx]) return
  paymentModal.value.scheduleItems[idx].han_thanh_toan = isoToDdmmyyyy(e.target.value)
}

const balanceLastInstallment = () => {
  const m = paymentModal.value
  if (!m.row || m.scheduleItems.length === 0) return
  const totalSau = tongSauVat(m.row)
  const lastIdx = m.scheduleItems.length - 1
  let sumOtherAmt = 0
  let sumOtherPct = 0
  for (let i = 0; i < lastIdx; i++) {
    sumOtherAmt += toNum(m.scheduleItems[i].so_tien_phai_thu)
    sumOtherPct += toNum(m.scheduleItems[i].ty_le_pct)
  }
  m.scheduleItems[lastIdx].so_tien_phai_thu = Math.max(0, totalSau - sumOtherAmt)
  m.scheduleItems[lastIdx].ty_le_pct = Math.max(0, Math.round((100 - sumOtherPct) * 100) / 100)
}

const buildSchedulePayloadForRow = (r, paidAmountOverride) => {
  const m = paymentModal.value
  const totalSau = tongSauVat(r)
  const paid = paidAmountOverride !== undefined ? paidAmountOverride : daThanhToan(r)
  const mode = m.scheduleMode

  let finalSchedule = []
  if (mode === 'mot_lan') {
    const due = (m.singleDueDate || '').trim()
    finalSchedule = [
      {
        dot: 1,
        noi_dung: 'Thanh toán 100% đơn hàng',
        ty_le_pct: 100,
        so_tien_phai_thu: totalSau,
        han_thanh_toan: due
      }
    ]
  } else {
    finalSchedule = m.scheduleItems.map((it, idx) => ({
      dot: idx + 1,
      noi_dung: String(it.noi_dung || `Đợt ${idx + 1}`).trim(),
      ty_le_pct: toNum(it.ty_le_pct),
      so_tien_phai_thu: toNum(it.so_tien_phai_thu),
      han_thanh_toan: String(it.han_thanh_toan || '').trim()
    }))
  }

  const evalList = evaluateInstallmentSchedule(totalSau, paid, mode, m.singleDueDate, finalSchedule)
  const unpaidList = evalList.filter(x => x.con_thieu > 0)
  const overdueInst = unpaidList.find(x => x.status === 'qua_han')
  const nextActive = overdueInst || unpaidList[0] || evalList[evalList.length - 1]
  const activeDueDate = String(nextActive?.han_thanh_toan || m.singleDueDate || '').trim()

  return {
    loai_thanh_toan: mode,
    han_thanh_toan: activeDueDate,
    ke_hoach_thanh_toan: finalSchedule
  }
}

const refreshCustomerCalculatedDebt = async () => {
  const updates = {}
  customers.value.forEach(kh => {
    const summary = getCustomerDebtSummary(kh)
    kh.tongSauVatKH = summary.tongSauVat
    kh.daThanhToanKH = summary.daThanhToan
    kh.paymentProgressPct = summary.progressPct
    if (summary.poCount > 0) {
      if (Number(kh.cong_no) !== summary.congNo) {
        kh.cong_no = summary.congNo
        if (kh._firebaseKey) {
          updates[`khach_hang/${kh._firebaseKey}/cong_no`] = summary.congNo
        }
      }
    }
  })
  if (formData.value && formData.value.ma_khach_hang) {
    const s = getCustomerDebtSummary(formData.value)
    if (s.poCount > 0) formData.value.cong_no = s.congNo
  }
  if (Object.keys(updates).length > 0) {
    try {
      await update(dbRef(database), updates)
    } catch (e) {
      console.warn('Lỗi đồng bộ cong_no vào khach_hang:', e)
    }
  }
}

const savePaymentScheduleOnly = async () => {
  const m = paymentModal.value
  if (!m.row || m.savingSchedule) return
  m.savingSchedule = true
  try {
    const r = m.row
    const fbKey = r._firebaseKey || r.ID
    const payload = buildSchedulePayloadForRow(r)

    const updates = {}
    if (fbKey) {
      updates[`sale_report/${fbKey}/loai_thanh_toan`] = payload.loai_thanh_toan
      updates[`sale_report/${fbKey}/han_thanh_toan`] = payload.han_thanh_toan
      updates[`sale_report/${fbKey}/ke_hoach_thanh_toan`] = payload.ke_hoach_thanh_toan
    }
    if (r.ma_hop_dong) {
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/loai_thanh_toan`] = payload.loai_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/han_thanh_toan`] = payload.han_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/ke_hoach_thanh_toan`] = payload.ke_hoach_thanh_toan
    }

    if (Object.keys(updates).length > 0) {
      await update(dbRef(database), updates)
    }

    r.loai_thanh_toan = payload.loai_thanh_toan
    r.han_thanh_toan = payload.han_thanh_toan
    r.ke_hoach_thanh_toan = payload.ke_hoach_thanh_toan
    initialScheduleSnapshot = serializeScheduleState()
    m.showScheduleSubModal = false
    showToast('Đã lưu kế hoạch & mốc hạn thanh toán', 'success')
  } catch (e) {
    console.error('Lỗi lưu kế hoạch thanh toán:', e)
    await openCustomerAlert('Lỗi khi lưu mốc hạn thanh toán lên Firebase. Vui lòng thử lại.', {
      variant: 'error',
      title: 'Lưu kế hoạch thất bại'
    })
  } finally {
    m.savingSchedule = false
  }
}

const setPaymentQuickPct = (pct) => {
  if (!paymentModal.value.row) return
  const remaining = congNo(paymentModal.value.row)
  const base = remaining > 0 ? remaining : tongSauVat(paymentModal.value.row)
  const val = Math.round(base * (pct / 100))
  paymentModal.value.amount = val
  paymentModal.value.amountStr = val > 0 ? val.toLocaleString('vi-VN') : '0'
}

const onPaymentAmountInput = (e) => {
  const raw = String(e.target.value || '').replace(/[^0-9]/g, '')
  const num = raw ? Number(raw) : 0
  paymentModal.value.amount = num
  paymentModal.value.amountStr = num > 0 ? num.toLocaleString('vi-VN') : (raw === '' ? '' : '0')
  e.target.value = paymentModal.value.amountStr
}

const onPaymentAmountPaste = (e) => {
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text') ?? ''
  if (!pasted) return
  const raw = String(pasted).replace(/[^0-9]/g, '')
  const num = raw ? Number(raw) : 0
  paymentModal.value.amount = num
  paymentModal.value.amountStr = num > 0 ? num.toLocaleString('vi-VN') : '0'
  e.target.value = paymentModal.value.amountStr
}

const submitPayment = async () => {
  const m = paymentModal.value
  if (!m.row || m.saving) return
  const payAmt = toNum(m.amount)
  if (payAmt <= 0) {
    await openCustomerAlert('Vui lòng nhập số tiền khách thanh toán lớn hơn 0 đ!', {
      variant: 'warning',
      title: 'Số tiền chưa hợp lệ'
    })
    return
  }

  m.saving = true
  try {
    const r = m.row
    const fbKey = r._firebaseKey || r.ID
    const srId = String(r.ID || fbKey)
    const maKH = String(r.Ma_khach_hang || m.customer?.ma_khach_hang || m.customer?.Ma_khach_hang || r.Ma_cong_ty || '')
    const tenKH = String(
      r.Ten_khach_hang ||
      r.ten_khach_hang ||
      m.customer?.ten_khach_hang ||
      m.customer?.Ten_khach_hang ||
      ''
    ).trim()
    const tenCongTy = String(
      r.Ten_cong_ty ||
      r.ten_cong_ty ||
      m.customer?.ten_cong_ty ||
      m.customer?.Ten_cong_ty ||
      ''
    ).trim()
    const payTime = (m.paymentTime || '').trim() || getFormattedNow()

    const totalSau = tongSauVat(r)
    const currentPaid = daThanhToan(r)
    const newPaid = currentPaid + payAmt
    const newCongNo = Math.max(0, totalSau - newPaid)

    const schedulePayload = buildSchedulePayloadForRow(r, newPaid)

    const newHistRef = push(dbRef(database, 'lich_su_thanh_toan'))
    const histKey = newHistRef.key || ('LSTT_' + Date.now())

    const newHistoryItem = {
      id: histKey,
      id_salereport: srId,
      maKH: maKH,
      ten_khach_hang: tenKH,
      ten_cong_ty: tenCongTy,
      so_tien_thanh_toan: payAmt,
      cong_no_con_lai: newCongNo,
      thoi_gian_thanh_toan: payTime,
      ghi_chu: (m.note || '').trim()
    }

    const updates = {
      [`lich_su_thanh_toan/${histKey}`]: newHistoryItem
    }

    if (fbKey) {
      updates[`sale_report/${fbKey}/so_tien_da_thanh_toan`] = newPaid
      updates[`sale_report/${fbKey}/cong_no`] = newCongNo
      updates[`sale_report/${fbKey}/thoi_gian_thanh_toan`] = payTime
      updates[`sale_report/${fbKey}/loai_thanh_toan`] = schedulePayload.loai_thanh_toan
      updates[`sale_report/${fbKey}/han_thanh_toan`] = schedulePayload.han_thanh_toan
      updates[`sale_report/${fbKey}/ke_hoach_thanh_toan`] = schedulePayload.ke_hoach_thanh_toan
      if (!r.Tong_tien_sau_thueVAT) {
        updates[`sale_report/${fbKey}/Tong_tien_sau_thueVAT`] = totalSau
      }
    }

    if (r.ma_hop_dong) {
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/da_thanh_toan`] = newPaid
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/con_phai_thu`] = newCongNo
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/trang_thai_thanh_toan`] = newCongNo <= 0 ? 'Đã thanh toán đủ' : 'Thanh toán 1 phần'
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/loai_thanh_toan`] = schedulePayload.loai_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/han_thanh_toan`] = schedulePayload.han_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/ke_hoach_thanh_toan`] = schedulePayload.ke_hoach_thanh_toan
    }

    await update(dbRef(database), updates)

    r.so_tien_da_thanh_toan = newPaid
    r.cong_no = newCongNo
    r.thoi_gian_thanh_toan = payTime
    r.loai_thanh_toan = schedulePayload.loai_thanh_toan
    r.han_thanh_toan = schedulePayload.han_thanh_toan
    r.ke_hoach_thanh_toan = schedulePayload.ke_hoach_thanh_toan
    if (!r.Tong_tien_sau_thueVAT) r.Tong_tien_sau_thueVAT = totalSau

    lichSuThanhToanList.value.unshift({
      ...newHistoryItem,
      _firebaseKey: histKey
    })

    triggerZaloEventNotification('onPaymentRecorded', {
      ten_khach_hang: tenCongTy || tenKH || maKH,
      ma_khach_hang: maKH,
      so_po: r.So_PO || getPoContractContent(r, 40) || srId,
      so_tien_thanh_toan: payAmt.toLocaleString('vi-VN'),
      cong_no_con_lai: newCongNo.toLocaleString('vi-VN'),
      thoi_gian: payTime,
      ghi_chu: (m.note || '').trim() || 'Không có'
    })

    await refreshCustomerCalculatedDebt()

    const nextEval = evaluateInstallmentSchedule(totalSau, newPaid, m.scheduleMode, m.singleDueDate, m.scheduleItems)
    const nextUnpaid = nextEval.find(x => x.con_thieu > 0)

    m.amount = 0
    m.amountStr = '0'
    m.paymentTime = getFormattedNow()
    m.note = m.scheduleMode === 'nhieu_dot' && nextUnpaid ? `Thanh toán Đợt ${nextUnpaid.dot} (${nextUnpaid.noi_dung})` : ''
    m.showRecordSubModal = false
    showToast(`Đã ghi nhận +${payAmt.toLocaleString('vi-VN')} đ thành công`, 'success')
  } catch (e) {
    console.error('Lỗi ghi nhận thanh toán:', e)
    await openCustomerAlert('Lỗi khi lưu đợt thanh toán lên Firebase. Vui lòng thử lại.', {
      variant: 'error',
      title: 'Ghi nhận thanh toán thất bại'
    })
  } finally {
    m.saving = false
  }
}

const deletePaymentHistoryItem = async (h) => {
  if (!h || !paymentModal.value.row) return
  const amtFormatted = formatVND(toNum(h.so_tien_thanh_toan)) || '0'
  const ok = await openCustomerConfirm(
    'Bạn có chắc muốn xóa đợt thanh toán này và tự động tính toán lại công nợ đơn hàng?',
    {
      variant: 'danger',
      title: 'Xóa đợt thanh toán',
      highlightLabel: 'ĐỢT THANH TOÁN',
      highlightValue: `+${amtFormatted} đ • ${h.thoi_gian_thanh_toan || 'Chưa rõ ngày'}`,
      subNote: 'Công nợ của PO, Hợp đồng tổng quát và Hồ sơ khách hàng sẽ được đồng bộ lại ngay lập tức.',
      confirmText: 'Xóa đợt thanh toán'
    }
  )
  if (!ok) return

  try {
    const r = paymentModal.value.row
    const fbKey = r._firebaseKey || r.ID
    const histFbKey = h._firebaseKey || h.id
    if (histFbKey) {
      await remove(dbRef(database, `lich_su_thanh_toan/${histFbKey}`))
    }

    lichSuThanhToanList.value = lichSuThanhToanList.value.filter(item => (item._firebaseKey || item.id) !== histFbKey)

    const remainingHistory = getPaymentHistoryForPO(r)
    const newPaid = remainingHistory.reduce((s, item) => s + toNum(item.so_tien_thanh_toan), 0)
    const totalSau = tongSauVat(r)
    const newCongNo = Math.max(0, totalSau - newPaid)
    const latestTime = remainingHistory.length > 0 ? (remainingHistory[0].thoi_gian_thanh_toan || '') : ''
    const schedulePayload = buildSchedulePayloadForRow(r, newPaid)

    const updates = {}
    if (fbKey) {
      updates[`sale_report/${fbKey}/so_tien_da_thanh_toan`] = newPaid
      updates[`sale_report/${fbKey}/cong_no`] = newCongNo
      updates[`sale_report/${fbKey}/thoi_gian_thanh_toan`] = latestTime
      updates[`sale_report/${fbKey}/han_thanh_toan`] = schedulePayload.han_thanh_toan
    }
    if (r.ma_hop_dong) {
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/da_thanh_toan`] = newPaid
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/con_phai_thu`] = newCongNo
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/trang_thai_thanh_toan`] = newCongNo <= 0 ? 'Đã thanh toán đủ' : (newPaid > 0 ? 'Thanh toán 1 phần' : 'Chưa thanh toán đủ')
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/han_thanh_toan`] = schedulePayload.han_thanh_toan
    }
    if (Object.keys(updates).length > 0) {
      await update(dbRef(database), updates)
    }

    r.so_tien_da_thanh_toan = newPaid
    r.cong_no = newCongNo
    r.thoi_gian_thanh_toan = latestTime
    r.han_thanh_toan = schedulePayload.han_thanh_toan

    await refreshCustomerCalculatedDebt()

    paymentModal.value.amount = 0
    paymentModal.value.amountStr = '0'
    showToast(`Đã xóa đợt thanh toán +${amtFormatted} đ`, 'success')
  } catch (e) {
    console.error('Lỗi xóa lịch sử thanh toán:', e)
    await openCustomerAlert('Lỗi khi xóa đợt thanh toán trên Firebase. Vui lòng thử lại.', {
      variant: 'error',
      title: 'Xóa thất bại'
    })
  }
}

// =========================================================
// 7. CODE GENERATION, SEARCH HIGHLIGHT, CRUD & DIRTY GUARDS
// =========================================================
const genMaCT = (congTy) => {
  if (!congTy) return ''
  return removeDiacritics(congTy).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
}

const genMaKH = (tenKH, congTy) => {
  const tenClean = removeDiacritics(tenKH).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '')
  const maCT = genMaCT(congTy)
  if (!tenClean && !maCT) return ''
  return [tenClean, maCT].filter(Boolean).join('-')
}

const escapeHtml = (unsafe) => {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const buildFuzzyRegex = (query) => {
  const charClass = {
    a: '[aáàảãạăắằẳẵặâấầẩẫậAÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ]',
    e: '[eéèẻẽẹêếềểễệEÉÈẺẼẸÊẾỀỂỄỆ]',
    i: '[iíìỉĩịIÍÌỈĨỊ]',
    o: '[oóòỏõọôốồổỗộơớờởỡợOÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]',
    u: '[uúùủũụưứừửữựUÚÙỦŨỤƯỨỪỬỮỰ]',
    y: '[yýỳỷỹỵYÝỲỶỸỴ]',
    d: '[dđDĐ]'
  }
  const VN_CHARS = 'a-zA-Z0-9aáàảãạăắằẳẵặâấầẩẫậeéèẻẽẹêếềểễệiíìỉĩịoóòỏõọôốồổỗộơớờởỡợuúùủũụưứừửữựyýỳỷỹỵdđAÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬEÉÈẺẼẸÊẾỀỂỄỆIÍÌỈĨỊOÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢUÚÙỦŨỤƯỨỪỬỮỰYÝỲỶỸỴDĐ'
  const NON_ALPHANUM = `[^${VN_CHARS}]*`

  const cleanQuery = removeDiacritics(String(query)).toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!cleanQuery) return null

  let pattern = ''
  for (let i = 0; i < cleanQuery.length; i++) {
    const char = cleanQuery[i]
    const mapped = charClass[char] || char
    pattern += mapped
    if (i < cleanQuery.length - 1) pattern += NON_ALPHANUM
  }
  try {
    return new RegExp(`(${pattern})`, 'gi')
  } catch (e) {
    return null
  }
}

const highlightMatch = (text) => {
  if (!text) return ''
  const str = String(text)
  const q = filters.value.search
  if (!q) return escapeHtml(str)

  const regex = buildFuzzyRegex(q)
  if (!regex) return escapeHtml(str)

  let lastIndex = 0
  let result = ''
  let match

  while ((match = regex.exec(str)) !== null) {
    result += escapeHtml(str.substring(lastIndex, match.index))
    result += `<mark class="highlight-mark">${escapeHtml(match[0])}</mark>`
    lastIndex = regex.lastIndex
    if (match.index === regex.lastIndex) regex.lastIndex++
  }
  result += escapeHtml(str.substring(lastIndex))
  return result
}

watch(
  () => formData.value.ten_khach_hang,
  (val) => {
    if (val && val !== val.toUpperCase()) {
      formData.value.ten_khach_hang = val.toUpperCase()
    }
  }
)

watch(
  () => formData.value.ten_cong_ty,
  (val) => {
    if (val && val !== val.toUpperCase()) {
      formData.value.ten_cong_ty = val.toUpperCase()
    }
  }
)

watch(
  () => [formData.value.ten_khach_hang, formData.value.ten_cong_ty],
  ([ten, congTy]) => {
    if (isEditing.value) return
    const newMaKH = genMaKH(ten, congTy)
    if (newMaKH || newMaKH === '') {
      formData.value.ma_khach_hang = newMaKH
    }
    formData.value.ma_cong_ty = genMaCT(congTy)
  }
)

const fetchCustomers = async () => {
  loading.value = true
  try {
    const [snapKH, snapHD, snapCT, snapSR, snapLSTT] = await Promise.all([
      get(dbRef(database, 'khach_hang')),
      get(dbRef(database, 'hop_dong_tong_quat')),
      get(dbRef(database, 'hop_dong_chi_tiet')),
      get(dbRef(database, 'sale_report')),
      get(dbRef(database, 'lich_su_thanh_toan'))
    ])

    const khVal = snapKH.exists() ? snapKH.val() : {}
    const hdVal = snapHD.exists() ? snapHD.val() : {}
    const ctVal = snapCT.exists() ? snapCT.val() : {}
    const srVal = snapSR.exists() ? snapSR.val() : {}
    const lsttVal = snapLSTT.exists() ? snapLSTT.val() : {}

    const mappedSR = []
    Object.entries(srVal || {}).forEach(([fbKey, item]) => {
      if (!item || typeof item !== 'object') return
      const tSau = Number(item.Tong_tien_sau_thueVAT) > 0
        ? Number(item.Tong_tien_sau_thueVAT)
        : (Number(item.Tong_tien_truoc_thueVAT) || 0) + (Number(item.Tong_thueVAT) || 0)
      const daTT = Number(item.so_tien_da_thanh_toan) || 0
      const cn = (item.cong_no !== undefined && item.cong_no !== null && item.cong_no !== '')
        ? Math.max(0, Number(item.cong_no) || 0)
        : Math.max(0, tSau - daTT)
      const loaiTT =
        item.loai_thanh_toan === 'nhieu_dot' || (Array.isArray(item.ke_hoach_thanh_toan) && item.ke_hoach_thanh_toan.length > 1)
          ? 'nhieu_dot'
          : 'mot_lan'
      mappedSR.push({
        ...item,
        so_tien_da_thanh_toan: daTT,
        cong_no: cn,
        loai_thanh_toan: loaiTT,
        han_thanh_toan: item.han_thanh_toan !== undefined ? String(item.han_thanh_toan || '') : '',
        ke_hoach_thanh_toan: Array.isArray(item.ke_hoach_thanh_toan) ? item.ke_hoach_thanh_toan : [],
        _firebaseKey: fbKey,
        ID: item.ID || fbKey
      })
    })
    saleReportRows.value = mappedSR

    const mappedLSTT = []
    Object.entries(lsttVal || {}).forEach(([key, val]) => {
      if (val && typeof val === 'object') {
        mappedLSTT.push({
          ...val,
          id: val.id || key,
          _firebaseKey: key
        })
      }
    })
    mappedLSTT.sort((a, b) => {
      const da = parseDateStr(a.thoi_gian_thanh_toan)?.getTime() || 0
      const db = parseDateStr(b.thoi_gian_thanh_toan)?.getTime() || 0
      if (db !== da) return db - da
      return String(b.id || '').localeCompare(String(a.id || ''))
    })
    lichSuThanhToanList.value = mappedLSTT

    const ctMap = {}
    Object.values(ctVal || {}).forEach(ct => {
      if (!ct) return
      const maHD = String(Array.isArray(ct) ? (ct[0] || '') : (ct.ma_hop_dong ?? ct[0] ?? '')).trim()
      if (!maHD) return
      if (!ctMap[maHD]) ctMap[maHD] = []
      ctMap[maHD].push(ct)
    })

    const contractStatsMap = {}

    Object.entries(hdVal || {}).forEach(([hdKey, hdRow]) => {
      if (!hdRow) return
      const isArr = Array.isArray(hdRow)
      const maKH = String(isArr ? (hdRow[2] || '') : (hdRow.ma_khach_hang ?? hdRow.Ma_khach_hang ?? hdRow[2] ?? '')).trim()
      if (!maKH) return

      if (!contractStatsMap[maKH]) {
        contractStatsMap[maKH] = { latestDate: null, groups: {} }
      }

      const maHopDong = String(isArr ? (hdRow[0] || '') : (hdRow.ma_hop_dong ?? hdRow[0] ?? hdKey ?? '')).trim()
      const maHopDongGoc = String(isArr ? (hdRow[32] || '') : (hdRow.ma_hop_dong_goc ?? hdRow[32] ?? '')).trim()
      const groupId = maHopDongGoc || maHopDong
      if (!groupId) return

      const isCompletedVal = String(isArr ? (hdRow[33] || '') : (hdRow.isCompleted ?? hdRow.is_completed ?? hdRow[33] ?? '')).trim().toLowerCase()
      const isCompleted = (isCompletedVal === '1' || isCompletedVal === 'true' || isCompletedVal === 'yes' || isCompletedVal === 'x')

      const ngayTao = String(isArr ? (hdRow[4] || '') : (hdRow.ngay_tao_hop_dong ?? hdRow.ngay_tao ?? hdRow.ngay_ky ?? hdRow.created_time ?? hdRow[4] ?? '')).trim()
      let dateObj = null
      if (ngayTao) {
        const dateParts = ngayTao.split(' ')
        const dateStr = dateParts.length > 1 ? dateParts[1] : dateParts[0]
        if (dateStr.includes('/')) {
          const [DD, MM, YYYY] = dateStr.split('/')
          if (DD && MM && YYYY) {
            const parsed = new Date(Number(YYYY), Number(MM) - 1, Number(DD))
            if (!isNaN(parsed.getTime())) dateObj = parsed
          }
        } else {
          const parsed = new Date(ngayTao)
          if (!isNaN(parsed.getTime())) {
            dateObj = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
          }
        }
        if (dateObj && (!contractStatsMap[maKH].latestDate || dateObj > contractStatsMap[maKH].latestDate)) {
          contractStatsMap[maKH].latestDate = dateObj
        }
      }

      const trangThaiHD = String(isArr ? (hdRow[15] || '') : (hdRow.Trang_thai_hop_dong ?? hdRow['Trang_thai_hop_dong '] ?? hdRow.loai_hop_dong ?? hdRow.trang_thai_hop_dong ?? hdRow[15] ?? '')).trim()
      const isChinhThuc = trangThaiHD === 'Chính thức'

      let localRenewalCount = 0
      if ((isChinhThuc || isCompleted) && ctMap[maHopDong]) {
        ctMap[maHopDong].forEach(ct => {
          const ctIsArr = Array.isArray(ct)
          let startDateStr = String(ctIsArr ? (ct[28] || '') : (ct.start_date ?? ct[28] ?? '')).trim()
          let endDateStr = String(ctIsArr ? (ct[29] || '') : (ct.end_date ?? ct[29] ?? '')).trim()
          if (!startDateStr || !endDateStr) return

          const normalizeDate = (s) => {
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s
            const d = new Date(s)
            if (isNaN(d.getTime())) return ''
            const pad = (n) => String(n).padStart(2, '0')
            return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
          }
          startDateStr = normalizeDate(startDateStr)
          endDateStr = normalizeDate(endDateStr)
          if (!startDateStr || !endDateStr) return

          const p1 = startDateStr.split('/')
          const p2 = endDateStr.split('/')
          if (p1.length !== 3 || p2.length !== 3) return
          const d1 = new Date(+p1[2], +p1[1] - 1, +p1[0])
          const d2 = new Date(+p2[2], +p2[1] - 1, +p2[0])
          const diff = d2.getTime() - d1.getTime()
          const days = Math.ceil(diff / (1000 * 3600 * 24))
          if (days >= 0 && days < 90) localRenewalCount++
        })
      }

      if (!contractStatsMap[maKH].groups[groupId]) {
        contractStatsMap[maKH].groups[groupId] = { isCompleted, date: dateObj, renewalCount: localRenewalCount }
      } else {
        const currentGroup = contractStatsMap[maKH].groups[groupId]
        currentGroup.renewalCount = (currentGroup.renewalCount || 0) + localRenewalCount
        if (dateObj && currentGroup.date) {
          if (dateObj > currentGroup.date) {
            currentGroup.isCompleted = isCompleted
            currentGroup.date = dateObj
          }
        } else if (dateObj) {
          currentGroup.isCompleted = isCompleted
          currentGroup.date = dateObj
        }
      }
    })

    Object.values(contractStatsMap).forEach(stats => {
      let chotCount = 0
      let processingCount = 0
      let renewalCount = 0
      Object.values(stats.groups).forEach(g => {
        if (g.isCompleted) chotCount++
        else processingCount++
        if (g.renewalCount) renewalCount += g.renewalCount
      })
      stats.chotCount = chotCount
      stats.processingCount = processingCount
      stats.renewalCount = renewalCount
    })

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const rawCustomers = Object.entries(khVal || {})
      .map(([fbKey, val]) => normalizeCustomerRecord(val, fbKey))
      .filter(Boolean)

    customers.value = rawCustomers.map(kh => {
      let lastPurchaseText = ''
      let hopDongChotCount = 0
      let hopDongProcessingCount = 0
      let renewalCount = 0

      if (kh.ma_khach_hang && contractStatsMap[kh.ma_khach_hang]) {
        const stats = contractStatsMap[kh.ma_khach_hang]
        hopDongChotCount = stats.chotCount
        hopDongProcessingCount = stats.processingCount
        renewalCount = stats.renewalCount || 0

        if (stats.latestDate) {
          const lastDate = stats.latestDate
          const diffTime = now.getTime() - lastDate.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          const pad = n => String(n).padStart(2, '0')
          const dateStr = `${pad(lastDate.getDate())}/${pad(lastDate.getMonth() + 1)}/${lastDate.getFullYear()}`

          let prefix = ''
          if (diffDays === 0) prefix = 'hôm nay'
          else if (diffDays > 0) prefix = `${diffDays} ngày trước`
          else prefix = 'vừa mua'

          lastPurchaseText = `${prefix} (${dateStr})`
        }
      }

      let computedTrangThai = kh.trang_thai || 'Tiềm năng'
      if (hopDongProcessingCount > 0) computedTrangThai = 'Đang chăm sóc'
      else if (hopDongChotCount > 0) computedTrangThai = 'Chốt deal'
      else computedTrangThai = 'Tiềm năng'

      const debtSummary = getCustomerDebtSummary(kh)
      const computedCongNo = debtSummary.poCount > 0 ? debtSummary.congNo : (Number(kh.cong_no) || 0)

      return {
        ...kh,
        cong_no: computedCongNo,
        tongSauVatKH: debtSummary.tongSauVat,
        daThanhToanKH: debtSummary.daThanhToan,
        paymentProgressPct: debtSummary.progressPct,
        trang_thai: computedTrangThai,
        lastPurchaseText,
        hopDongChotCount,
        hopDongProcessingCount,
        renewalCount
      }
    })

    refreshCustomerCalculatedDebt()
  } catch (error) {
    console.error('Lỗi fetch data từ Firebase:', error)
    await openCustomerAlert('Lỗi khi tải dữ liệu khách hàng từ Firebase: ' + (error?.message || ''), {
      variant: 'error',
      title: 'Lỗi kết nối dữ liệu'
    })
  } finally {
    loading.value = false
  }
}

// Customer Form Dirty State Tracking
let initialCustomerFormSnapshot = ''

const serializeCustomerForm = (data) => {
  if (!data) return ''
  const norm = {}
  KH_FIELDS.forEach(f => {
    norm[f] = String(data[f] ?? '').trim()
  })
  norm.tagKH = Array.isArray(data.tagKH) ? [...data.tagKH].map(String).sort() : []
  return JSON.stringify(norm)
}

const captureCustomerFormSnapshot = () => {
  nextTick(() => {
    initialCustomerFormSnapshot = serializeCustomerForm(formData.value)
  })
}

const isCustomerFormDirty = computed(() => {
  if (!isModalOpen.value) return false
  if (isMultiImport.value && importedList.value.length > 0) return true
  if (!initialCustomerFormSnapshot) return false
  return serializeCustomerForm(formData.value) !== initialCustomerFormSnapshot
})

const hasAnyUnsavedChanges = computed(() => {
  if (isCustomerFormDirty.value) return true
  if (paymentModal.value.show && paymentModal.value.showScheduleSubModal && initialScheduleSnapshot && serializeScheduleState() !== initialScheduleSnapshot) {
    return true
  }
  if (paymentModal.value.show && paymentModal.value.showRecordSubModal && toNum(paymentModal.value.amount) > 0) {
    return true
  }
  return false
})

const openAddModal = () => {
  isMultiImport.value = false
  importedList.value = []
  isEditing.value = false
  formData.value = initFormData()
  tempTagKH.value = ''
  isModalOpen.value = true
  captureCustomerFormSnapshot()
}

const openEditModal = (kh) => {
  isMultiImport.value = false
  importedList.value = []
  isEditing.value = true
  formData.value = {
    ...initFormData(),
    ...kh,
    tagKH: Array.isArray(kh.tagKH) ? [...kh.tagKH] : []
  }
  tempTagKH.value = ''
  isModalOpen.value = true
  captureCustomerFormSnapshot()
}

const attemptCloseCustomerModal = async () => {
  if (saving.value) return
  if (isCustomerFormDirty.value) {
    const ok = await openCustomerConfirm(
      isMultiImport.value
        ? `Bạn đang kiểm duyệt ${importedList.value.length} khách hàng từ file import chưa lưu. Bạn có chắc muốn hủy bỏ?`
        : 'Bạn có thông tin khách hàng vừa chỉnh sửa nhưng chưa lưu. Bạn có chắc muốn thoát?',
      {
        variant: 'warning',
        title: 'Chưa lưu thay đổi',
        confirmText: 'Thoát không lưu',
        cancelText: 'Tiếp tục chỉnh sửa'
      }
    )
    if (!ok) return
  }
  isModalOpen.value = false
  isMultiImport.value = false
  importedList.value = []
}

const prevPage = () => {
  if (currentImportIndex.value > 0) {
    importedList.value[currentImportIndex.value].data = { ...formData.value }
    currentImportIndex.value--
    formData.value = { ...importedList.value[currentImportIndex.value].data }
    isEditing.value = importedList.value[currentImportIndex.value].isEditing
  }
}

const nextPage = () => {
  if (currentImportIndex.value < importedList.value.length - 1) {
    importedList.value[currentImportIndex.value].data = { ...formData.value }
    currentImportIndex.value++
    formData.value = { ...importedList.value[currentImportIndex.value].data }
    isEditing.value = importedList.value[currentImportIndex.value].isEditing
  }
}

const saveSingleCustomerToFirebase = async (data, isUpd) => {
  let id = String(data.ma_khach_hang || '').trim()
  if (!id) {
    id = genMaKH(data.ten_khach_hang, data.ten_cong_ty) || kh_genID()
  }
  const maCT = data.ma_cong_ty || genMaCT(data.ten_cong_ty)

  const existing = customers.value.find(
    c => (data._firebaseKey && c._firebaseKey === data._firebaseKey) || String(c.ma_khach_hang) === id
  )
  const fbKey = existing?._firebaseKey || data._firebaseKey || sanitizeFirebaseKey(id)
  const nowIso = new Date().toISOString()

  const recordToSave = {}
  KH_FIELDS.forEach(field => {
    const val = data[field]
    recordToSave[field] = val !== undefined && val !== null ? val : ''
  })
  recordToSave.ma_khach_hang = id
  recordToSave.ma_cong_ty = maCT
  recordToSave.cong_no = Number(data.cong_no) || 0
  recordToSave.tagKH = Array.isArray(data.tagKH) ? [...data.tagKH] : []
  recordToSave.last_updated = nowIso

  if (isUpd || existing) {
    const existingCreatedTime = existing?.created_time || data.created_time || ''
    if (existingCreatedTime) {
      recordToSave.created_time = existingCreatedTime
    }
    await update(dbRef(database, `khach_hang/${fbKey}`), recordToSave)
  } else {
    recordToSave.created_time = data.created_time || nowIso
    await set(dbRef(database, `khach_hang/${fbKey}`), recordToSave)
    triggerZaloEventNotification('onCustomerCreated', {
      ma_khach_hang: id,
      ten_cong_ty: recordToSave.ten_cong_ty || 'Chưa có',
      ten_khach_hang: recordToSave.ten_khach_hang || 'Chưa có',
      mst: recordToSave.mst || 'Chưa có',
      dia_chi: recordToSave.dia_chi_cong_ty || 'Chưa có'
    })
  }
  return id
}

const saveCustomer = async () => {
  saving.value = true

  if (isMultiImport.value) {
    importedList.value[currentImportIndex.value].data = { ...formData.value }

    try {
      let successCount = 0
      const totalImport = importedList.value.length
      for (let i = 0; i < totalImport; i++) {
        const item = importedList.value[i]
        const isUpd = item.isEditing
        showAsyncLoading(`Đang xử lý ${i + 1}/${totalImport} khách hàng...`)
        await saveSingleCustomerToFirebase(item.data, isUpd)
        successCount++
      }

      isModalOpen.value = false
      isMultiImport.value = false
      importedList.value = []
      initialCustomerFormSnapshot = ''
      showAsyncSuccess('Đã lưu thành công', `${successCount}/${totalImport} khách hàng đã được đồng bộ.`)
      await fetchCustomers()
    } catch (error) {
      console.error('Lỗi khi lưu nhiều KH vào Firebase:', error)
      showAsyncError('Lưu thất bại', 'Lỗi Firebase: ' + error.message)
    } finally {
      saving.value = false
    }
  } else {
    const isUpd = isEditing.value
    showAsyncLoading(`Đang ${isUpd ? 'cập nhật' : 'thêm'} khách hàng...`)
    try {
      const savedId = await saveSingleCustomerToFirebase(formData.value, isUpd)
      formData.value.ma_khach_hang = savedId
      initialCustomerFormSnapshot = serializeCustomerForm(formData.value)
      isModalOpen.value = false
      showAsyncSuccess(`${isUpd ? 'Cập nhật' : 'Thêm'} KH thành công`, `Mã KH: ${savedId}`)
      await fetchCustomers()
    } catch (error) {
      console.error('Lỗi khi lưu vào Firebase:', error)
      showAsyncError('Lưu KH thất bại', 'Lỗi Firebase: ' + error.message)
    } finally {
      saving.value = false
    }
  }
}

const confirmDelete = async (ma_khach_hang, khRecord = null) => {
  const existing =
    khRecord ||
    customers.value.find(
      c => String(c.ma_khach_hang) === String(ma_khach_hang) || (formData.value._firebaseKey && c._firebaseKey === formData.value._firebaseKey)
    )

  const displayName = existing?.ten_cong_ty || existing?.ten_khach_hang || ma_khach_hang || 'Khách hàng'
  const codeStr = existing?.ma_khach_hang || ma_khach_hang || ''
  const targetVal = codeStr && codeStr !== displayName ? `${displayName} (${codeStr})` : displayName

  const ok = await openCustomerConfirm(
    'Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ khách hàng này khỏi Firebase?',
    {
      variant: 'danger',
      title: 'Xác nhận xóa khách hàng',
      highlightLabel: 'HỒ SƠ KHÁCH HÀNG',
      highlightValue: targetVal,
      subNote: 'Thao tác này xóa bản ghi trong khach_hang và không thể hoàn tác.',
      confirmText: 'Xóa vĩnh viễn'
    }
  )
  if (!ok) return

  showAsyncLoading('Đang xoá khách hàng...')
  try {
    const fbKey = existing?._firebaseKey || formData.value._firebaseKey || sanitizeFirebaseKey(ma_khach_hang)
    if (!fbKey) {
      showAsyncError('Lỗi xoá', 'Không tìm thấy khóa khách hàng cần xoá')
      return
    }

    await remove(dbRef(database, `khach_hang/${fbKey}`))
    initialCustomerFormSnapshot = ''
    isModalOpen.value = false
    showAsyncSuccess('Xoá thành công', `Đã xoá mã KH: ${codeStr || fbKey}`)
    await fetchCustomers()
  } catch (error) {
    showAsyncError('Xoá thất bại', error.message)
  }
}

// Global Click-Outside, Escape Key & Route/Unload Guards
const handleGlobalDocClick = (e) => {
  if (isSearchFocused.value && searchShellRef.value && !searchShellRef.value.contains(e.target)) {
    isSearchFocused.value = false
  }
  if (openCfPickerKey.value && !e.target?.closest?.('.cf-picker-root') && !e.target?.closest?.('.pl-mobile-sheet')) {
    openCfPickerKey.value = null
  }
}

const handleGlobalKeydown = (e) => {
  if (e.key !== 'Escape') return
  if (openCfPickerKey.value) {
    e.preventDefault()
    openCfPickerKey.value = null
    return
  }
  if (baogiaDialog.value.show) {
    e.preventDefault()
    resolveBaogiaDialog(false)
    return
  }
  if (showCustomGlassTuner.value) {
    showCustomGlassTuner.value = false
    return
  }
  if (paymentModal.value.show && paymentModal.value.showRecordSubModal) {
    e.preventDefault()
    attemptCloseRecordSubModal()
    return
  }
  if (paymentModal.value.show && paymentModal.value.showScheduleSubModal) {
    e.preventDefault()
    attemptCloseScheduleSubModal()
    return
  }
  if (paymentModal.value.show) {
    e.preventDefault()
    closePaymentModal()
    return
  }
  if (isIndustryPickerOpen.value) {
    isIndustryPickerOpen.value = false
    return
  }
  if (isTagModalOpen.value) {
    isTagModalOpen.value = false
    return
  }
  if (isDuplicateModalOpen.value) {
    isDuplicateModalOpen.value = false
    return
  }
  if (isModalOpen.value) {
    e.preventDefault()
    attemptCloseCustomerModal()
    return
  }
  if (showAddChoiceModal.value) {
    showAddChoiceModal.value = false
  }
}

const handleBeforeUnload = (e) => {
  if (hasAnyUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onBeforeRouteLeave(async () => {
  if (!hasAnyUnsavedChanges.value) return true
  const ok = await openCustomerConfirm(
    'Bạn đang có thay đổi chưa lưu trên trang Khách hàng. Bạn có chắc muốn rời trang?',
    {
      variant: 'warning',
      title: 'Rời trang khi chưa lưu?',
      confirmText: 'Rời trang',
      cancelText: 'Ở lại'
    }
  )
  return ok
})

onMounted(() => {
  syncCustomGlassVarsToDocumentRoot()
  fetchCustomers()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleViewportResize, { passive: true })
    window.addEventListener('keydown', handleGlobalKeydown)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('mousedown', handleGlobalDocClick)
  }
})

onUnmounted(() => {
  if (lazyLoadObserver) {
    lazyLoadObserver.disconnect()
    lazyLoadObserver = null
  }
  clearToastTimer()
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleViewportResize)
    window.removeEventListener('keydown', handleGlobalKeydown)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    document.removeEventListener('mousedown', handleGlobalDocClick)
  }
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700;800&display=swap');

.customer-page.page,
.customer-page.page *:not([class^="ri-"]):not([class*=" ri-"]):not(.cf-code-pill):not(.card-id):not(.sr-sb-hero-val):not(.sr-sb-foot-val):not(.sr-sb-po-badge):not(code):not(pre) {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

/* =========================================================================
   1. DESIGN TOKENS, PAGE SHELL & 3-MODE THEME ENGINE
   (Dark Navy • Crisp Light Blue • Custom Glassify)
   ========================================================================= */
.customer-page.page {
  --cf-bg: #080f1e;
  --cf-bg-elevated: #0f172a;
  --cf-card: #111c30;
  --cf-card-hover: #15233b;
  --cf-surface-soft: rgba(15, 23, 42, 0.65);
  --cf-border: rgba(148, 163, 184, 0.16);
  --cf-border-strong: rgba(148, 163, 184, 0.28);
  --cf-text: #f8fafc;
  --cf-text-sec: #cbd5e1;
  --cf-text-muted: #94a3b8;
  --cf-text-dim: #64748b;
  --cf-input-bg: rgba(15, 23, 42, 0.78);
  --cf-input-border: rgba(148, 163, 184, 0.26);
  --cf-table-head: #142036;
  --cf-row-hover: rgba(56, 189, 248, 0.065);
  --cf-shadow-sm: 0 4px 14px rgba(2, 6, 23, 0.32);
  --cf-shadow-md: 0 14px 34px -8px rgba(2, 6, 23, 0.55);

  position: relative;
  min-height: 100vh;
  padding: 16px 20px 40px;
  background:
    radial-gradient(1100px 420px at 8% -6%, rgba(14, 165, 233, 0.11), transparent 62%),
    radial-gradient(900px 380px at 95% 0%, rgba(16, 185, 129, 0.08), transparent 60%),
    var(--cf-bg);
  color: var(--cf-text);
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
  overflow-x: clip;
}

.customer-page.page *,
.customer-page.page *::before,
.customer-page.page *::after {
  box-sizing: border-box;
}

/* Crisp Light Blue Theme */
.customer-page.page.theme-light-blue {
  --cf-bg: #f1f5f9;
  --cf-bg-elevated: #ffffff;
  --cf-card: #ffffff;
  --cf-card-hover: #f8fafc;
  --cf-surface-soft: #f8fafc;
  --cf-border: #e2e8f0;
  --cf-border-strong: #cbd5e1;
  --cf-text: #0f172a;
  --cf-text-sec: #334155;
  --cf-text-muted: #64748b;
  --cf-text-dim: #94a3b8;
  --cf-input-bg: #ffffff;
  --cf-input-border: #cbd5e1;
  --cf-table-head: #f1f5f9;
  --cf-row-hover: #f0f9ff;
  --cf-shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.05);
  --cf-shadow-md: 0 12px 28px -8px rgba(15, 23, 42, 0.12);

  background:
    radial-gradient(1000px 360px at 10% -8%, rgba(14, 165, 233, 0.09), transparent 60%),
    #f1f5f9;
  color: #0f172a;
}

/* Custom Glassify Theme */
.customer-page.page.theme-custom-glass {
  --cf-border: var(--cg-border, rgba(255, 255, 255, 0.28));
  --cf-border-strong: var(--cg-border, rgba(255, 255, 255, 0.38));
  background: transparent;
  z-index: 0;
}

.customer-page.page.theme-custom-glass::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image: var(--cg-wallpaper, url('/hon-mun-island-in-nha-trang.jpg'));
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  pointer-events: none;
}

.customer-page.page.theme-custom-glass::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background: linear-gradient(180deg, var(--cg-dim-top, rgba(3, 14, 26, 0.2)), var(--cg-dim-bot, rgba(3, 14, 26, 0.35)));
  pointer-events: none;
}

.customer-page.page.theme-custom-glass .cf-filter-panel,
.customer-page.page.theme-custom-glass .report-card {
  background: linear-gradient(160deg, var(--cg-card-top, rgba(16, 42, 68, 0.56)), var(--cg-card-bot, rgba(8, 24, 44, 0.42))) !important;
  border-color: var(--cg-border, rgba(255, 255, 255, 0.28)) !important;
  backdrop-filter: blur(var(--cg-blur, 22px)) saturate(145%);
  -webkit-backdrop-filter: blur(var(--cg-blur, 22px)) saturate(145%);
}

.customer-page.page.theme-custom-glass .sr-sb-card {
  backdrop-filter: blur(var(--cg-blur, 22px)) saturate(145%);
  -webkit-backdrop-filter: blur(var(--cg-blur, 22px)) saturate(145%);
}

/* Numeric & Search Highlight Utilities */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.text-right {
  text-align: right !important;
}

.text-center {
  text-align: center !important;
}

.text-rose {
  color: #fb7185 !important;
}

.customer-page.page.theme-light-blue .text-rose {
  color: #e11d48 !important;
}

.text-emerald {
  color: #34d399 !important;
}

.customer-page.page.theme-light-blue .text-emerald {
  color: #059669 !important;
}

:deep(.highlight-mark) {
  background: rgba(250, 204, 21, 0.28);
  color: #fde047;
  padding: 0 3px;
  border-radius: 4px;
  font-weight: 700;
}

.customer-page.page.theme-light-blue :deep(.highlight-mark) {
  background: #fef08a;
  color: #854d0e;
}

@keyframes cf-spin {
  to {
    transform: rotate(360deg);
  }
}

.is-spinning {
  animation: cf-spin 0.85s linear infinite;
}

/* =========================================================================
   2. 3-MODE THEME SWITCHER
   ========================================================================= */
/* Segmented Theme Switcher */
.cf-theme-seg {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  height: 38px;
  border-radius: 10px;
  background: var(--cf-card);
  border: 1px solid var(--cf-border);
  box-shadow: var(--cf-shadow-sm);
  flex-shrink: 0;
}

.cf-theme-btn,
.cf-theme-gear {
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--cf-text-muted);
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.16s ease;
  white-space: nowrap;
  margin: 0;
  width: fit-content;
}

.cf-theme-gear {
  padding: 0 8px;
  color: #38bdf8;
}

.cf-theme-btn:hover,
.cf-theme-gear:hover {
  color: var(--cf-text);
  background: rgba(148, 163, 184, 0.1);
}

.cf-theme-btn.is-active {
  background: rgba(14, 165, 233, 0.18);
  border-color: rgba(56, 189, 248, 0.38);
  color: #38bdf8;
}

.customer-page.page.theme-light-blue .cf-theme-btn.is-active {
  background: #ffffff;
  border-color: #7dd3fc;
  color: #0284c7;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.12);
}

.cf-theme-gear.is-open {
  background: rgba(14, 165, 233, 0.2);
  border-color: rgba(56, 189, 248, 0.4);
}

/* Shared Button System (No Rainbow Colors) */
.cf-btn {
  height: 36px;
  padding: 0 13px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.16s ease;
  width: fit-content;
  margin: 0;
  border: 1px solid transparent;
  font-family: inherit;
}

.cf-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cf-btn-sm {
  height: 32px;
  padding: 0 11px;
  font-size: 12px;
  border-radius: 8px;
}

.cf-btn-slate {
  background: var(--cf-surface-soft);
  border-color: var(--cf-border-strong);
  color: var(--cf-text-sec);
}

.cf-btn-slate:hover:not(:disabled) {
  background: var(--cf-card-hover);
  border-color: rgba(56, 189, 248, 0.42);
  color: var(--cf-text);
}

.cf-btn-slate.is-active-filter {
  background: rgba(14, 165, 233, 0.14);
  border-color: rgba(56, 189, 248, 0.45);
  color: #38bdf8;
}

.customer-page.page.theme-light-blue .cf-btn-slate.is-active-filter {
  background: #e0f2fe;
  border-color: #38bdf8;
  color: #0369a1;
}

.cf-btn-slate.has-dup-warn {
  border-color: rgba(244, 63, 94, 0.42);
}

.cf-btn-primary {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  border-color: rgba(56, 189, 248, 0.35);
  color: #ffffff !important;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.28);
}

.cf-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  transform: translateY(-1px);
}

.cf-btn-emerald {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: rgba(52, 211, 153, 0.35);
  color: #ffffff !important;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.26);
}

.cf-btn-emerald:hover:not(:disabled) {
  background: linear-gradient(135deg, #34d399, #10b981);
  transform: translateY(-1px);
}

.cf-btn-danger-outline {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.cf-btn-danger-outline:hover:not(:disabled) {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}

.customer-page.page.theme-light-blue .cf-btn-danger-outline {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.cf-btn-ghost-danger {
  height: 30px;
  padding: 0 10px;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.28);
  color: #f87171;
  font-size: 12px;
}

.customer-page.page.theme-light-blue .cf-btn-ghost-danger {
  background: #fef2f2;
  color: #dc2626;
}

/* =========================================================================
   3. 3-CARD SUPER BENTO KPI GRID
   ========================================================================= */
.sr-super-bento-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.sr-sb-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 11px;
  padding: 15px 17px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 10px 26px -8px rgba(2, 6, 23, 0.42);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  overflow: hidden;
  min-width: 0;
}

.sr-sb-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.45);
}

.sr-sb-card:hover {
  transform: translateY(-2px);
}

/* Card 1: Blue (Quy mô tệp KH) */
.sr-sb-card.sb-card-revenue {
  background: linear-gradient(145deg, #0369a1 0%, #0284c7 55%, #2563eb 100%);
  border-color: rgba(125, 211, 252, 0.45);
  box-shadow: 0 10px 26px -8px rgba(2, 132, 199, 0.42);
}

.customer-page.page.theme-light-blue .sr-sb-card.sb-card-revenue {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #0284c7;
  box-shadow: 0 10px 26px -8px rgba(37, 99, 235, 0.36);
}

.sr-sb-card.sb-card-revenue:hover {
  border-color: #7dd3fc;
  box-shadow: 0 14px 30px -8px rgba(2, 132, 199, 0.52);
}

/* Card 2: Emerald (Tín hiệu Báo Giá & Deal) */
.sr-sb-card.sb-card-com {
  background: linear-gradient(145deg, #065f46 0%, #047857 55%, #059669 100%);
  border-color: rgba(110, 231, 183, 0.45);
  box-shadow: 0 10px 26px -8px rgba(5, 150, 105, 0.42);
}

.customer-page.page.theme-light-blue .sr-sb-card.sb-card-com {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #059669;
  box-shadow: 0 10px 26px -8px rgba(5, 150, 105, 0.36);
}

.sr-sb-card.sb-card-com:hover {
  border-color: #6ee7b7;
  box-shadow: 0 14px 30px -8px rgba(16, 185, 129, 0.5);
}

/* Card 3: Red (Tổng Công Nợ Phải Thu) */
.sr-sb-card.sb-card-debt {
  background: linear-gradient(145deg, #991b1b 0%, #b91c1c 52%, #dc2626 100%);
  border-color: rgba(252, 165, 165, 0.45);
  box-shadow: 0 10px 26px -8px rgba(220, 38, 38, 0.42);
}

.customer-page.page.theme-light-blue .sr-sb-card.sb-card-debt {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  border-color: #dc2626;
  box-shadow: 0 10px 26px -8px rgba(220, 38, 38, 0.36);
}

.sr-sb-card.sb-card-debt:hover {
  border-color: #fca5a5;
  box-shadow: 0 14px 30px -8px rgba(220, 38, 38, 0.5);
}

/* Tầng 1: Header */
.sr-sb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sr-sb-title-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.sr-sb-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.sr-sb-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tầng 2: Hero Metric */
.sr-sb-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 0;
  flex-wrap: wrap;
}

.sr-sb-hero-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.sr-sb-hero-val.is-money {
  font-size: 20px;
}

.sr-sb-unit {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  margin-left: 3px;
}

.sr-sb-po-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.38);
  color: #ffffff;
  white-space: nowrap;
  margin: 0;
  width: fit-content;
}

button.sr-sb-po-badge {
  cursor: pointer;
  transition: all 0.15s ease;
}

button.sr-sb-po-badge:hover,
button.sr-sb-po-badge.is-active {
  background: #ffffff;
  border-color: #ffffff;
  color: #dc2626;
}

/* Tầng 3: 2 dòng phụ phẳng có click lọc nhanh */
.sr-sb-foot {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 9px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  margin-top: auto;
}

.sr-sb-foot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  padding: 3px 6px;
  margin: 0 -6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.sr-sb-foot-row:hover {
  background: rgba(255, 255, 255, 0.14);
}

.sr-sb-foot-row.is-active {
  background: rgba(255, 255, 255, 0.24);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.42);
}

.sr-sb-foot-label {
  color: rgba(255, 255, 255, 0.88);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sr-sb-foot-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
}

.sr-sb-foot-val small {
  font-size: 10.5px;
  font-weight: 600;
  opacity: 0.82;
}

/* Thanh tiến độ mảnh 4px sát đáy Card Công nợ */
.sr-sb-bottom-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.sr-sb-bottom-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffffff 0%, #fde047 100%);
  transition: width 0.35s ease;
}

/* =========================================================================
   4. BORDERLESS TOOLBAR ROW, CENTERED SEARCH SHELL & FILTER PANEL
   ========================================================================= */
.cf-toolbar-shell {
  position: relative;
  z-index: 60;
  padding: 0;
  margin-bottom: 14px;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cf-toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.bg-search-shell {
  position: relative;
  flex: 0 1 380px;
  width: 100%;
  min-width: 240px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 12px 0 13px;
  border-radius: 10px;
  background: var(--cf-input-bg);
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow: 0 1px 4px rgba(2, 6, 23, 0.05);
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.customer-page.page.theme-light-blue .bg-search-shell {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.34);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
}

.bg-search-shell:focus-within {
  border-color: rgba(14, 165, 233, 0.55);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
}

.bg-search-ico {
  font-size: 16px;
  color: var(--cf-text-muted);
  margin-right: 8px;
  flex-shrink: 0;
}

.bg-search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none !important;
  outline: none !important;
  background: transparent !important;
  color: var(--cf-text) !important;
  font-size: 13px;
  font-weight: 500;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
}

.bg-search-input::placeholder {
  color: var(--cf-text-dim);
}

.bg-search-match {
  padding: 2px 7px;
  margin-right: 5px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  white-space: nowrap;
}

.customer-page.page.theme-light-blue .bg-search-match {
  background: #e0f2fe;
  color: #0369a1;
}

.bg-search-clear {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: rgba(148, 163, 184, 0.16);
  color: var(--cf-text-muted);
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
}

.bg-search-clear:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Recent Searches Dropdown */
.bg-recent-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 60;
  border-radius: 12px;
  background: var(--cf-bg-elevated);
  border: 1px solid var(--cf-border-strong);
  box-shadow: var(--cf-shadow-md);
  padding: 8px;
}

.bg-recent-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--cf-text-muted);
}

.bg-recent-head button {
  border: none;
  background: transparent;
  color: #38bdf8;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  margin: 0;
  width: fit-content;
}

.bg-recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bg-recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 8px;
  font-size: 12.5px;
  color: var(--cf-text-sec);
  cursor: pointer;
}

.bg-recent-item:hover {
  background: var(--cf-row-hover);
  color: var(--cf-text);
}

.bg-recent-item span {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bg-recent-del {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--cf-text-dim);
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.bg-recent-del:hover {
  background: rgba(239, 68, 68, 0.16);
  color: #ef4444;
}

.cf-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cf-badge {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1.3;
}

.cf-badge.is-sky {
  background: rgba(14, 165, 233, 0.22);
  color: #38bdf8;
}

.cf-badge.is-slate {
  background: rgba(148, 163, 184, 0.18);
  color: var(--cf-text-sec);
}

.cf-badge.is-danger {
  background: #ef4444;
  color: #ffffff;
}

.customer-page.page.theme-light-blue .cf-badge.is-sky {
  background: #0284c7;
  color: #ffffff;
}

/* Expandable Filter Panel */
.cf-filter-panel {
  position: relative;
  z-index: 65;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--cf-card);
  border: 1px solid var(--cf-border);
  box-shadow: var(--cf-shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cf-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.cf-filter-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.cf-filter-field label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--cf-text-muted);
}

/* Template Adaptive Custom Select Pickers (.cf-picker-root — Dark Navy / Light Blue / Glassify) */
.cf-picker-root {
  position: relative;
  width: 100%;
  min-width: 0;
}

.cf-picker-root.is-open {
  z-index: 120;
}

.cf-picker-root button.pl-picker-trigger {
  width: 100% !important;
  min-width: 0 !important;
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  margin: 0 !important;
  padding: 0 10px !important;
  border-radius: 10px !important;
  border: 1px solid rgba(148, 163, 184, 0.24) !important;
  background: rgba(15, 23, 42, 0.88) !important;
  color: #f8fafc !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 7px !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
  cursor: pointer !important;
  text-transform: none !important;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease !important;
}

.cf-picker-root button.pl-picker-trigger:hover {
  border-color: rgba(56, 189, 248, 0.45) !important;
  background: rgba(15, 23, 42, 0.96) !important;
  transform: none !important;
}

.cf-picker-root button.pl-picker-trigger.is-custom {
  border-color: rgba(16, 185, 129, 0.55) !important;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.94) 100%) !important;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.12) !important;
}

.cf-picker-root button.pl-picker-trigger.is-open {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.16) !important;
}

.cf-picker-root .pl-trig-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  font-size: 14px !important;
  color: #94a3b8 !important;
}

.cf-picker-root .pl-picker-trigger.is-custom .pl-trig-icon {
  color: #34d399 !important;
}

.cf-picker-root .pl-trig-name {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  font-size: 12.4px !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
  color: #f8fafc !important;
  text-align: left !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.cf-picker-root .pl-picker-trigger.is-custom .pl-trig-name {
  color: #34d399 !important;
  font-weight: 800 !important;
}

.cf-picker-root .pl-trig-count {
  flex: 0 0 auto !important;
  padding: 2px 6.5px !important;
  border-radius: 999px !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
  background: rgba(148, 163, 184, 0.14) !important;
  border: 1px solid rgba(148, 163, 184, 0.24) !important;
  color: #cbd5e1 !important;
  white-space: nowrap !important;
}

.cf-picker-root .pl-picker-trigger.is-custom .pl-trig-count {
  background: rgba(16, 185, 129, 0.18) !important;
  border-color: rgba(52, 211, 153, 0.4) !important;
  color: #6ee7b7 !important;
}

.cf-picker-root .pl-trig-reset {
  width: 17px !important;
  height: 17px !important;
  min-width: 17px !important;
  border-radius: 999px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  background: rgba(148, 163, 184, 0.18) !important;
  color: #cbd5e1 !important;
  transition: background 0.15s ease, color 0.15s ease !important;
}

.cf-picker-root .pl-trig-reset:hover {
  background: rgba(239, 68, 68, 0.25) !important;
  color: #fca5a5 !important;
}

.cf-picker-root .pl-trig-chevron {
  flex-shrink: 0 !important;
  color: #94a3b8 !important;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.cf-picker-root .pl-picker-trigger.is-open .pl-trig-chevron {
  transform: rotate(180deg) !important;
  color: #38bdf8 !important;
}

/* Desktop Floating Popover (> 1100px) */
.cf-picker-root .pl-desktop-popover {
  position: absolute !important;
  top: calc(100% + 7px) !important;
  left: 0 !important;
  min-width: max(100%, 280px) !important;
  max-width: min(360px, 92vw) !important;
  z-index: 160 !important;
  border-radius: 14px !important;
  background: #0f172a !important;
  border: 1px solid rgba(148, 163, 184, 0.24) !important;
  box-shadow:
    0 18px 40px -8px rgba(2, 6, 23, 0.72),
    0 0 0 1px rgba(56, 189, 248, 0.08) !important;
  padding: 9px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 7px !important;
}

.cf-filter-field:last-child .cf-picker-root .pl-desktop-popover {
  left: auto !important;
  right: 0 !important;
}

.pl-pop-enter-active,
.pl-pop-leave-active {
  transition: opacity 0.16s ease, transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: top center;
}

.pl-pop-enter-from,
.pl-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.pl-pop-search-box,
.pl-sheet-search-wrap {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  flex-shrink: 0 !important;
}

.pl-pop-search-ic {
  position: absolute !important;
  left: 10px !important;
  color: #64748b !important;
  pointer-events: none !important;
}

input.pl-pop-search-input,
input.pl-sheet-search-input {
  width: 100% !important;
  height: 34px !important;
  min-height: 34px !important;
  margin: 0 !important;
  padding: 0 30px 0 31px !important;
  border-radius: 9px !important;
  border: 1px solid rgba(148, 163, 184, 0.22) !important;
  background: rgba(30, 41, 59, 0.72) !important;
  color: #f8fafc !important;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  outline: none !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

input.pl-sheet-search-input {
  height: 38px !important;
  min-height: 38px !important;
  padding: 0 34px 0 34px !important;
  border-radius: 11px !important;
  font-size: 14px !important;
}

input.pl-pop-search-input:focus,
input.pl-sheet-search-input:focus {
  border-color: #38bdf8 !important;
  background: rgba(15, 23, 42, 0.95) !important;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.14) !important;
}

button.pl-pop-search-clear {
  position: absolute !important;
  right: 7px !important;
  width: 19px !important;
  min-width: 19px !important;
  height: 19px !important;
  min-height: 19px !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 999px !important;
  border: none !important;
  background: rgba(148, 163, 184, 0.2) !important;
  color: #cbd5e1 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: none !important;
  cursor: pointer !important;
}

.pl-pop-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 5px !important;
  max-height: 290px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding-right: 2px !important;
}

.pl-pop-section-lbl {
  flex: 0 0 auto !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  color: #64748b !important;
  padding: 4px 4px 1px !important;
  line-height: 1.3 !important;
}

.pl-pop-empty {
  flex: 0 0 auto !important;
  padding: 16px 10px !important;
  text-align: center !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  color: #64748b !important;
}

button.pl-opt-card {
  flex: 0 0 auto !important;
  width: 100% !important;
  min-width: 0 !important;
  height: auto !important;
  min-height: 36px !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 8.5px 10px !important;
  border-radius: 10px !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  background: rgba(30, 41, 59, 0.48) !important;
  color: #e2e8f0 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: center !important;
  gap: 3.5px !important;
  text-align: left !important;
  text-transform: none !important;
  white-space: normal !important;
  box-sizing: border-box !important;
  box-shadow: none !important;
  cursor: pointer !important;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease !important;
}

button.pl-opt-card:hover {
  background: rgba(30, 41, 59, 0.85) !important;
  border-color: rgba(148, 163, 184, 0.34) !important;
  transform: none !important;
}

button.pl-opt-card:active {
  transform: scale(0.99) !important;
}

button.pl-opt-card.is-selected {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(15, 23, 42, 0.92) 100%) !important;
  border-color: rgba(16, 185, 129, 0.62) !important;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.12) !important;
}

.pl-opt-top {
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
  width: 100% !important;
  min-width: 0 !important;
}

.pl-opt-radio {
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  border-radius: 999px !important;
  border: 1.5px solid rgba(148, 163, 184, 0.42) !important;
  background: transparent !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  color: #ffffff !important;
}

button.pl-opt-card.is-selected .pl-opt-radio {
  background: #10b981 !important;
  border-color: #10b981 !important;
  color: #ffffff !important;
}

.pl-opt-dot {
  width: 8px !important;
  height: 8px !important;
  border-radius: 999px !important;
  flex-shrink: 0 !important;
  background: #64748b !important;
}
.pl-opt-dot.is-sky { background: #38bdf8 !important; box-shadow: 0 0 8px rgba(56, 189, 248, 0.5); }
.pl-opt-dot.is-slate { background: #94a3b8 !important; }
.pl-opt-dot.is-rose { background: #f43f5e !important; box-shadow: 0 0 8px rgba(244, 63, 94, 0.5); }
.pl-opt-dot.is-emerald { background: #10b981 !important; box-shadow: 0 0 8px rgba(16, 185, 129, 0.45); }

.pl-opt-icon {
  font-size: 13.5px !important;
  color: #94a3b8 !important;
  flex-shrink: 0 !important;
}

button.pl-opt-card.is-selected .pl-opt-icon {
  color: #34d399 !important;
}

.pl-opt-title {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  font-size: 12.5px !important;
  font-weight: 800 !important;
  line-height: 1.3 !important;
  color: #f8fafc !important;
  word-break: break-word !important;
}

button.pl-opt-card.is-selected .pl-opt-title {
  color: #34d399 !important;
}

.pl-opt-count {
  flex: 0 0 auto !important;
  padding: 2px 7px !important;
  border-radius: 999px !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  background: rgba(148, 163, 184, 0.14) !important;
  border: 1px solid rgba(148, 163, 184, 0.24) !important;
  color: #cbd5e1 !important;
  white-space: nowrap !important;
}

button.pl-opt-card.is-selected .pl-opt-count {
  background: rgba(16, 185, 129, 0.2) !important;
  border-color: rgba(52, 211, 153, 0.44) !important;
  color: #6ee7b7 !important;
}

.pl-opt-sub {
  padding-left: 23px !important;
  font-size: 10.8px !important;
  font-weight: 500 !important;
  color: #94a3b8 !important;
  line-height: 1.3 !important;
}

/* Light Blue Mode Overrides for Custom Pickers */
.customer-page.page.theme-light-blue .cf-picker-root button.pl-picker-trigger {
  background: #f8fbff !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
}

.customer-page.page.theme-light-blue .cf-picker-root button.pl-picker-trigger:hover {
  background: #ffffff !important;
  border-color: #60a5fa !important;
}

.customer-page.page.theme-light-blue .cf-picker-root button.pl-picker-trigger.is-custom {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #2563eb !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12) !important;
}

.customer-page.page.theme-light-blue .cf-picker-root button.pl-picker-trigger.is-open {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-trig-icon {
  color: #64748b !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-picker-trigger.is-custom .pl-trig-icon {
  color: #2563eb !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-trig-name {
  color: #0f172a !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-picker-trigger.is-custom .pl-trig-name {
  color: #1d4ed8 !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-trig-count {
  background: #e2e8f0 !important;
  border-color: #cbd5e1 !important;
  color: #334155 !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-picker-trigger.is-custom .pl-trig-count {
  background: #ffffff !important;
  border-color: #93c5fd !important;
  color: #1d4ed8 !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-trig-reset {
  background: #dbeafe !important;
  color: #1e40af !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-trig-reset:hover {
  background: #fee2e2 !important;
  color: #dc2626 !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-trig-chevron {
  color: #64748b !important;
}

.customer-page.page.theme-light-blue .cf-picker-root .pl-picker-trigger.is-open .pl-trig-chevron {
  color: #2563eb !important;
}

.customer-page.page.theme-light-blue .pl-desktop-popover {
  background: #ffffff !important;
  border: 1px solid #bfdbfe !important;
  box-shadow:
    0 18px 38px -8px rgba(15, 23, 42, 0.16),
    0 0 0 1px rgba(37, 99, 235, 0.06) !important;
}

.customer-page.page.theme-light-blue input.pl-pop-search-input,
.customer-page.page.theme-light-blue input.pl-sheet-search-input {
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
}

.customer-page.page.theme-light-blue input.pl-pop-search-input:focus,
.customer-page.page.theme-light-blue input.pl-sheet-search-input:focus {
  background: #ffffff !important;
  border-color: #2563eb !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14) !important;
}

.customer-page.page.theme-light-blue button.pl-pop-search-clear {
  background: #e2e8f0 !important;
  color: #475569 !important;
}

.customer-page.page.theme-light-blue button.pl-opt-card {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #0f172a !important;
}

.customer-page.page.theme-light-blue button.pl-opt-card:hover {
  background: #f0f7ff !important;
  border-color: #93c5fd !important;
}

.customer-page.page.theme-light-blue button.pl-opt-card.is-selected {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #2563eb !important;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.12) !important;
}

.customer-page.page.theme-light-blue button.pl-opt-card.is-selected .pl-opt-radio {
  background: #2563eb !important;
  border-color: #2563eb !important;
}

.customer-page.page.theme-light-blue .pl-opt-title {
  color: #0f172a !important;
}

.customer-page.page.theme-light-blue button.pl-opt-card.is-selected .pl-opt-title {
  color: #1d4ed8 !important;
}

.customer-page.page.theme-light-blue .pl-opt-count {
  background: #e2e8f0 !important;
  border-color: #cbd5e1 !important;
  color: #334155 !important;
}

.customer-page.page.theme-light-blue button.pl-opt-card.is-selected .pl-opt-count {
  background: #ffffff !important;
  border-color: #93c5fd !important;
  color: #1d4ed8 !important;
}

.customer-page.page.theme-light-blue .pl-opt-sub {
  color: #64748b !important;
}

/* Custom Glassify Overrides for Pickers */
.customer-page.page.theme-custom-glass .cf-picker-root button.pl-picker-trigger {
  background: rgba(15, 35, 58, 0.56) !important;
  border-color: rgba(255, 255, 255, 0.26) !important;
}

.customer-page.page.theme-custom-glass .cf-picker-root button.pl-picker-trigger.is-custom {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(15, 35, 58, 0.72)) !important;
  border-color: rgba(52, 211, 153, 0.65) !important;
}

.customer-page.page.theme-custom-glass .pl-desktop-popover {
  background: rgba(9, 22, 40, 0.94) !important;
  border-color: rgba(186, 230, 253, 0.32) !important;
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
}

/* Mobile Bottom Sheet (Matching baogiaFirebase.vue .pl-mobile-sheet V2) */
.pl-mobile-sheet-overlay {
  position: fixed !important;
  inset: 0 !important;
  z-index: 12500 !important;
  background: rgba(2, 6, 23, 0.62) !important;
  backdrop-filter: blur(5px) !important;
  -webkit-backdrop-filter: blur(5px) !important;
  display: flex !important;
  align-items: flex-end !important;
  justify-content: center !important;
  padding: 0 !important;
  margin: 0 !important;
  box-sizing: border-box !important;
}

.pl-mobile-sheet {
  width: 100% !important;
  max-width: 560px !important;
  max-height: 84dvh !important;
  border-radius: 22px 22px 0 0 !important;
  background: #0f172a !important;
  border-top: 1px solid rgba(148, 163, 184, 0.25) !important;
  box-shadow: 0 -14px 40px rgba(2, 6, 23, 0.68) !important;
  padding: 8px 14px max(18px, calc(env(safe-area-inset-bottom, 0px) + 14px)) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

.pl-sheet-enter-active,
.pl-sheet-leave-active {
  transition: opacity 0.24s ease;
}

.pl-sheet-enter-active .pl-mobile-sheet,
.pl-sheet-leave-active .pl-mobile-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.pl-sheet-enter-from,
.pl-sheet-leave-to {
  opacity: 0;
}

.pl-sheet-enter-from .pl-mobile-sheet,
.pl-sheet-leave-to .pl-mobile-sheet {
  transform: translateY(100%);
}

.pl-sheet-grabber-wrap {
  display: flex !important;
  justify-content: center !important;
  padding: 2px 0 !important;
  flex-shrink: 0 !important;
}

.pl-sheet-grabber {
  width: 38px !important;
  height: 4px !important;
  border-radius: 999px !important;
  background: rgba(148, 163, 184, 0.36) !important;
}

.pl-sheet-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
  flex-shrink: 0 !important;
}

.pl-sheet-head-txt {
  min-width: 0 !important;
  flex: 1 1 auto !important;
}

.pl-sheet-head-txt h4 {
  margin: 0 !important;
  font-size: 15.5px !important;
  font-weight: 800 !important;
  color: #f8fafc !important;
  line-height: 1.25 !important;
}

.pl-sheet-head-txt p {
  margin: 2px 0 0 !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  color: #94a3b8 !important;
}

button.pl-sheet-close-btn {
  width: 32px !important;
  min-width: 32px !important;
  max-width: 32px !important;
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 999px !important;
  border: 1px solid rgba(148, 163, 184, 0.22) !important;
  background: rgba(30, 41, 59, 0.8) !important;
  color: #cbd5e1 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  box-shadow: none !important;
  cursor: pointer !important;
}

.pl-sheet-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 7px !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  max-height: 54dvh !important;
  padding-bottom: 4px !important;
  -webkit-overflow-scrolling: touch !important;
}

button.pl-opt-card.is-sheet-card {
  padding: 11px 12px !important;
  border-radius: 13px !important;
  gap: 5px !important;
}

button.pl-opt-card.is-sheet-card .pl-opt-title {
  font-size: 13.5px !important;
}

/* Light Blue Mode Overrides for Mobile Sheet */
.customer-page.page.theme-light-blue .pl-mobile-sheet-overlay {
  background: rgba(15, 23, 42, 0.42) !important;
}

.customer-page.page.theme-light-blue .pl-mobile-sheet {
  background: #ffffff !important;
  border-top: 1px solid #bfdbfe !important;
  box-shadow: 0 -14px 36px rgba(15, 23, 42, 0.18) !important;
}

.customer-page.page.theme-light-blue .pl-sheet-grabber {
  background: #cbd5e1 !important;
}

.customer-page.page.theme-light-blue .pl-sheet-head-txt h4 {
  color: #0f172a !important;
}

.customer-page.page.theme-light-blue .pl-sheet-head-txt p {
  color: #64748b !important;
}

.customer-page.page.theme-light-blue button.pl-sheet-close-btn {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
  color: #334155 !important;
}

/* Custom Glassify Overrides for Mobile Sheet */
.customer-page.page.theme-custom-glass .pl-mobile-sheet {
  background: linear-gradient(160deg, rgba(16, 42, 68, 0.95), rgba(8, 22, 40, 0.94)) !important;
  border-top-color: rgba(186, 230, 253, 0.34) !important;
  backdrop-filter: blur(22px) saturate(145%);
  -webkit-backdrop-filter: blur(22px) saturate(145%);
}

.cf-filter-panel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.cf-filter-summary {
  font-size: 12px;
  color: var(--cf-text-muted);
}

.cf-filter-summary strong {
  color: #38bdf8;
}

.customer-page.page.theme-light-blue .cf-filter-summary strong {
  color: #0284c7;
}

/* Active Filter Chips Strip */
.cf-active-chips-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px dashed var(--cf-border);
}

.cf-chips-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--cf-text-muted);
}

.cf-active-chip {
  height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  margin: 0;
  width: fit-content;
}

.customer-page.page.theme-light-blue .cf-active-chip {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

.cf-clear-all-link {
  border: none;
  background: transparent;
  color: #fb7185;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 6px;
  margin: 0;
  width: fit-content;
}

.customer-page.page.theme-light-blue .cf-clear-all-link {
  color: #e11d48;
}

.cf-slide-fade-enter-active,
.cf-slide-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.cf-slide-fade-enter-from,
.cf-slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* =========================================================================
   5. DATA WORKSPACE: HIGH-DENSITY PC TABLE & COMPACT 4-TIER BENTO CARDS
   ========================================================================= */
.cf-workspace {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Empty State */
.cf-empty-state {
  padding: 48px 20px;
  border-radius: 14px;
  background: var(--cf-card);
  border: 1px dashed var(--cf-border-strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.cf-empty-state.is-compact {
  padding: 34px 18px;
}

.cf-empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(14, 165, 233, 0.12);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 4px;
}

.cf-empty-icon.is-emerald {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
}

.cf-empty-state h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--cf-text);
}

.cf-empty-state p {
  margin: 0;
  max-width: 460px;
  font-size: 13px;
  color: var(--cf-text-muted);
  line-height: 1.5;
}

.cf-empty-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

/* Shared Modal Pills & Row Icon Buttons */
.cf-code-pill {
  height: 21px;
  padding: 0 7px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  margin: 0;
  width: fit-content;
  transition: all 0.14s ease;
  background: rgba(16, 185, 129, 0.13);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.cf-code-pill:hover {
  background: rgba(16, 185, 129, 0.22);
}

.customer-page.page.theme-light-blue .cf-code-pill {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #047857;
}

.cf-tag-pill {
  height: 23px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.28);
  color: #7dd3fc;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
  width: fit-content;
  white-space: nowrap;
}

.cf-tag-pill:hover,
.cf-tag-pill.active {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.customer-page.page.theme-light-blue .cf-tag-pill {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
}

.customer-page.page.theme-light-blue .cf-tag-pill:hover,
.customer-page.page.theme-light-blue .cf-tag-pill.active {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.cf-icon-act {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--cf-border);
  background: var(--cf-surface-soft);
  color: var(--cf-text-sec);
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  margin: 0;
  transition: all 0.15s ease;
}

.cf-icon-act.is-debt-act:hover {
  background: rgba(16, 185, 129, 0.18);
  border-color: rgba(16, 185, 129, 0.45);
  color: #34d399;
}

.cf-icon-act.is-edit-act:hover {
  background: rgba(14, 165, 233, 0.18);
  border-color: rgba(56, 189, 248, 0.45);
  color: #38bdf8;
}

.cf-icon-act.is-del-act:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.45);
  color: #f87171;
}

.customer-page.page.theme-light-blue .cf-icon-act.is-debt-act:hover {
  background: #ecfdf5;
  color: #059669;
}

.customer-page.page.theme-light-blue .cf-icon-act.is-edit-act:hover {
  background: #e0f2fe;
  color: #0284c7;
}

.customer-page.page.theme-light-blue .cf-icon-act.is-del-act:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* ================== CARD LIST LAYOUT (SYNCED WITH TEMPLATE & SALEREPORT FONT) ================== */
.card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px;
  align-items: stretch;
}

@media (max-width: 1180px) {
  .card-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.report-card {
  background: var(--cf-card);
  border-radius: 14px;
  padding: 0;
  box-shadow:
    0 12px 28px -6px rgba(2, 6, 23, 0.65),
    0 4px 12px -2px rgba(2, 6, 23, 0.45);
  border: 1px solid var(--cf-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.report-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 20px 38px -8px rgba(2, 6, 23, 0.78),
    0 8px 18px -4px rgba(14, 165, 233, 0.22);
  border-color: rgba(56, 189, 248, 0.5);
}

/* Shimmer Skeleton Cards */
@keyframes cf-card-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-card {
  pointer-events: none;
  padding: 16px 18px;
  border-color: var(--cf-border);
  box-shadow: var(--cf-shadow-sm);
  background: var(--cf-card);
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--cf-border);
}

.skeleton-avatar,
.skeleton-title,
.skeleton-line,
.skeleton-box {
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.1) 25%,
    rgba(148, 163, 184, 0.24) 50%,
    rgba(148, 163, 184, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: cf-card-shimmer 1.4s ease-in-out infinite;
}

.skeleton-avatar {
  width: 44px;
  height: 24px;
  border-radius: 7px;
}

.skeleton-title {
  flex: 1;
  height: 18px;
  border-radius: 6px;
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.skeleton-line {
  height: 13px;
  width: 100%;
  border-radius: 5px;
}

.skeleton-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px dashed var(--cf-border-strong);
}

.skeleton-box {
  height: 28px;
  border-radius: 7px;
}

/* Card Header (PA1: Clean 2-tier Deep Blue Banner) */
.card-row-header {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 13px 16px 12px;
  background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 48%, #1d4ed8 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  gap: 8px;
}

.customer-page.page.theme-light-blue .card-row-header {
  background: linear-gradient(135deg, #0369a1 0%, #0284c7 52%, #2563eb 100%);
}

.cf-card-head-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.card-id {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  height: 21px;
  padding: 0 7px;
  border-radius: 6px;
  font-size: 10.5px;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.time-primary {
  font-weight: 700;
  color: #ffffff;
  font-size: 14.5px;
  letter-spacing: -0.015em;
  line-height: 1.35;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.card-row-header :deep(.highlight-mark) {
  background: #fef08a;
  color: #0f172a;
}

.cf-card-head-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.cf-head-mst-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 11px;
  line-height: 1.35;
}

.cf-head-lbl {
  color: #bae6fd;
  font-weight: 700;
  font-size: 10.5px;
  letter-spacing: 0.02em;
}

.cf-head-val {
  color: #ffffff;
  font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.cf-head-industry-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  max-width: 100%;
}

.cf-head-industry-pill svg {
  flex-shrink: 0;
  color: #bae6fd;
}

.cf-head-industry-pill span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cf-head-industry-pill.is-empty {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
  color: rgba(224, 242, 254, 0.72);
  font-style: italic;
}

.cf-card-head-addr {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  line-height: 1.42;
  color: rgba(241, 245, 249, 0.94);
  word-break: break-word;
}

.cf-card-head-addr svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #bae6fd;
}

.cf-head-addr-val {
  flex: 1;
  min-width: 0;
  color: rgba(248, 250, 252, 0.95);
  font-weight: 500;
}

.cf-head-addr-val.is-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cf-head-empty {
  color: rgba(224, 242, 254, 0.65);
  font-style: italic;
}

/* Card Body & Contact Rows */
.card-row-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding: 13px 16px 16px;
}

.content-title {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.info-line {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--cf-text-sec);
  margin-bottom: 6px;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
}

.info-line svg {
  flex-shrink: 0;
  color: #38bdf8;
}

/* Inner Financial Summary Box */
.financial-wrapper {
  background: var(--cf-surface-soft);
  border: 1px solid var(--cf-border);
  border-radius: 11px;
  padding: 12px 13px;
  margin-top: auto;
}

.content-title > .info-line:last-of-type {
  margin-bottom: 12px;
}

.financial-stats {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--cf-border-strong);
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 12.5px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: var(--cf-text-muted);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.cf-stat-ico {
  flex-shrink: 0;
}
.cf-stat-ico.is-emerald { color: #34d399; }
.cf-stat-ico.is-amber { color: #fbbf24; }
.cf-stat-ico.is-sky { color: #38bdf8; }
.cf-stat-ico.is-slate { color: #94a3b8; }
.cf-stat-ico.is-rose { color: #fb7185; }

.stat-val {
  font-weight: 700;
  text-align: right;
  font-size: 12.5px;
}

.cf-stat-val.is-emerald {
  color: #34d399;
  font-weight: 800;
}

.cf-stat-val.is-amber {
  color: #fbbf24;
  font-weight: 800;
}

.cf-stat-val.is-rose {
  color: #fb7185;
  font-weight: 800;
}

.cf-stat-with-eye {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cf-eye-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease;
  border: 1px solid transparent;
}

.cf-eye-btn.is-emerald {
  color: #34d399;
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.28);
}
.cf-eye-btn.is-emerald:hover {
  background: rgba(16, 185, 129, 0.26);
  transform: translateY(-1px);
}

.cf-eye-btn.is-amber {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.28);
}
.cf-eye-btn.is-amber:hover {
  background: rgba(245, 158, 11, 0.26);
  transform: translateY(-1px);
}

.cf-eye-btn.is-rose {
  color: #fb7185;
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.28);
}
.cf-eye-btn.is-rose:hover {
  background: rgba(239, 68, 68, 0.26);
  transform: translateY(-1px);
}

.cf-eye-btn.is-sky {
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.14);
  border-color: rgba(56, 189, 248, 0.28);
}
.cf-eye-btn.is-sky:hover {
  background: rgba(14, 165, 233, 0.26);
  transform: translateY(-1px);
}

.action-eye-icon {
  display: block;
}

.cf-old-last-buy {
  color: #38bdf8;
  font-size: 12.5px;
}

.cf-old-last-upd {
  color: var(--cf-text-muted);
  font-size: 12px;
}

.cf-old-tag-pill {
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.28);
  color: #7dd3fc;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.cf-old-tag-empty {
  color: var(--cf-text-dim);
  font-style: italic;
  font-size: 11.5px;
}

/* Flat Inline Debt Stat Row */
.cf-debt-row {
  cursor: pointer;
}

.cf-debt-val-text {
  font-size: 13px;
  font-weight: 800;
}

.cf-debt-val-text.is-debt {
  color: #fb7185;
}

.cf-debt-val-text.is-settled {
  color: #34d399;
}

/* Light Blue Theme Overrides for Synchronized Card Layout */
.customer-page.page.theme-light-blue .report-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  box-shadow:
    0 10px 26px -6px rgba(15, 23, 42, 0.12),
    0 4px 12px -2px rgba(2, 132, 199, 0.08);
}

.customer-page.page.theme-light-blue .report-card:hover {
  border-color: #93c5fd;
  box-shadow:
    0 18px 36px -8px rgba(15, 23, 42, 0.18),
    0 8px 18px -4px rgba(37, 99, 235, 0.16);
}

.customer-page.page.theme-light-blue .skeleton-card {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.customer-page.page.theme-light-blue .card-id {
  background: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.26);
}

.customer-page.page.theme-light-blue .time-primary {
  color: #ffffff;
}

.customer-page.page.theme-light-blue .info-line {
  color: #334155;
}

.customer-page.page.theme-light-blue .info-line svg {
  color: #0284c7;
}

.customer-page.page.theme-light-blue .financial-wrapper {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.customer-page.page.theme-light-blue .financial-stats {
  border-top-color: #cbd5e1;
}

.customer-page.page.theme-light-blue .stat-label {
  color: #475569;
}

.customer-page.page.theme-light-blue .cf-stat-ico.is-emerald,
.customer-page.page.theme-light-blue .cf-stat-val.is-emerald,
.customer-page.page.theme-light-blue .cf-debt-val-text.is-settled {
  color: #059669;
}

.customer-page.page.theme-light-blue .cf-stat-ico.is-amber,
.customer-page.page.theme-light-blue .cf-stat-val.is-amber {
  color: #d97706;
}

.customer-page.page.theme-light-blue .cf-stat-ico.is-rose,
.customer-page.page.theme-light-blue .cf-stat-val.is-rose,
.customer-page.page.theme-light-blue .cf-debt-val-text.is-debt {
  color: #e11d48;
}

.customer-page.page.theme-light-blue .cf-stat-ico.is-sky,
.customer-page.page.theme-light-blue .cf-old-last-buy {
  color: #0284c7;
}

.customer-page.page.theme-light-blue .cf-eye-btn.is-emerald {
  color: #059669;
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.customer-page.page.theme-light-blue .cf-eye-btn.is-amber {
  color: #d97706;
  background: #fffbeb;
  border-color: #fde68a;
}

.customer-page.page.theme-light-blue .cf-eye-btn.is-rose {
  color: #e11d48;
  background: #fff1f2;
  border-color: #fecdd3;
}

.customer-page.page.theme-light-blue .cf-eye-btn.is-sky {
  color: #0284c7;
  background: #e0f2fe;
  border-color: #bae6fd;
}

.customer-page.page.theme-light-blue .cf-old-tag-pill {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
}

/* Custom Glassify inner surface harmonization */
.customer-page.page.theme-custom-glass .financial-wrapper {
  background: rgba(8, 22, 40, 0.36);
  border-color: var(--cg-border, rgba(255, 255, 255, 0.22));
}

/* Lazy Load Sentinel & Load More Button */
.cf-lazy-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0 4px;
}

.cf-lazy-status {
  font-size: 12px;
  color: var(--cf-text-muted);
}

.cf-lazy-status strong {
  color: var(--cf-text);
}

.cf-lazy-more-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--cf-card);
  border: 1px solid rgba(56, 189, 248, 0.36);
  color: #38bdf8;
  font-size: 12.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.customer-page.page.theme-light-blue .cf-lazy-more-btn {
  background: #ffffff;
  border-color: #7dd3fc;
  color: #0284c7;
}

/* =========================================================================
   6. SHARED MODAL INFRASTRUCTURE (.vip-modal-overlay, .vip-modal-card)
   ========================================================================= */
.modal.vip-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.74);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.customer-page.page.theme-light-blue .modal.vip-modal-overlay {
  background: rgba(15, 23, 42, 0.46);
}

.modal-card.vip-modal-card {
  width: 100%;
  border-radius: 16px;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: var(--cf-text);
  box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.72);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.customer-page.page.theme-light-blue .modal-card.vip-modal-card {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
  box-shadow: 0 24px 52px -12px rgba(15, 23, 42, 0.22);
}

.customer-page.page.theme-custom-glass .modal-card.vip-modal-card {
  background: linear-gradient(165deg, rgba(13, 27, 46, 0.94), rgba(8, 17, 32, 0.94));
  border-color: var(--cg-border, rgba(255, 255, 255, 0.28));
}

.modal-card.modal-fullscreen-card {
  width: min(1480px, 97vw);
  height: min(92dvh, 920px);
  max-height: 94dvh;
}

.modal-head.modal-head-themed {
  position: relative;
  padding: 14px 20px;
  background: linear-gradient(135deg, #0369a1 0%, #0f766e 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.cf-modal-dt-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 15px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #ffffff;
}

.cf-head-upd-pill {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: none;
  background: rgba(255, 255, 255, 0.16);
  color: #f8fafc;
}

.modal-head .x {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.18);
  color: #ffffff;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
  transition: background 0.15s ease;
}

.modal-head .x:hover {
  background: rgba(255, 255, 255, 0.22);
}

.modal-btn-secondary {
  background: rgba(148, 163, 184, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #e2e8f0;
}

.customer-page.page.theme-light-blue .modal-btn-secondary {
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  color: #334155 !important;
}

/* Modal 1: Add / Import Choice Modal */
.cf-choice-modal {
  max-width: 560px;
}

.cf-choice-body {
  padding: 18px 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cf-choice-lead {
  margin: 0;
  font-size: 13px;
  color: var(--cf-text-muted);
}

.cf-choice-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cf-choice-card {
  width: 100%;
  padding: 14px 15px;
  border-radius: 12px;
  background: var(--cf-surface-soft);
  border: 1px solid var(--cf-border-strong);
  color: var(--cf-text);
  display: flex;
  align-items: center;
  gap: 13px;
  text-align: left;
  cursor: pointer;
  margin: 0;
  transition: all 0.16s ease;
}

.cf-choice-card:hover {
  transform: translateY(-1px);
  border-color: #38bdf8;
  background: var(--cf-card-hover);
}

.cf-choice-ico {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  font-size: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cf-choice-ico.is-sky {
  background: rgba(14, 165, 233, 0.16);
  color: #38bdf8;
}

.cf-choice-ico.is-emerald {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
}

.cf-choice-ico.is-amber {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
}

.customer-page.page.theme-light-blue .cf-choice-ico.is-sky {
  background: #e0f2fe;
  color: #0284c7;
}

.customer-page.page.theme-light-blue .cf-choice-ico.is-emerald {
  background: #ecfdf5;
  color: #059669;
}

.customer-page.page.theme-light-blue .cf-choice-ico.is-amber {
  background: #fffbeb;
  color: #d97706;
}

.cf-choice-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cf-choice-info strong {
  font-size: 14px;
  font-weight: 800;
  color: var(--cf-text);
}

.cf-choice-info span {
  font-size: 12px;
  color: var(--cf-text-muted);
  line-height: 1.4;
}

.cf-choice-arr {
  font-size: 18px;
  color: var(--cf-text-muted);
}

/* Modal 2: Customer Add / Edit Form Modal */
.modal.vip-modal-overlay.cf-modal-full100-overlay {
  padding: 0;
  align-items: stretch;
  justify-content: stretch;
}

.modal-card.vip-modal-card.cf-customer-form-modal {
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  border-radius: 0;
  border: none;
}

.cf-multi-import-bar {
  padding: 10px 20px;
  background: rgba(14, 165, 233, 0.1);
  border-bottom: 1px solid var(--cf-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.cf-multi-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}

.cf-multi-step {
  padding: 2px 8px;
  border-radius: 6px;
  background: #0284c7;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 800;
}

.cf-multi-filename {
  font-size: 13px;
  color: var(--cf-text);
  max-width: 380px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cf-multi-mode-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.cf-multi-mode-pill.is-upd {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
}

.cf-multi-mode-pill.is-new {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
}

.cf-multi-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cf-form-body {
  padding: 16px 20px 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cf-form-2col {
  display: grid;
  grid-template-columns: 1fr 1.08fr;
  gap: 14px;
  align-items: stretch;
}

.cf-form-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  height: 100%;
}

.cf-form-col > .cust-group-company,
.cf-form-col > .cust-group-sub {
  flex: 1;
}

.cf-form-col > .cust-group-sub .cf-field:last-child {
  flex: 1;
}

.cf-form-col > .cust-group-sub .cf-textarea {
  flex: 1;
}

.cf-form-col > .cust-debt-box {
  flex-shrink: 0;
}

.cf-bento-form-box {
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--cf-surface-soft);
  border: 1px solid var(--cf-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cf-box-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cf-box-title.is-emerald {
  color: #34d399;
}

.cf-box-title.is-sky {
  color: #38bdf8;
}

.customer-page.page.theme-light-blue .cf-box-title.is-emerald {
  color: #059669;
}

.customer-page.page.theme-light-blue .cf-box-title.is-sky {
  color: #0284c7;
}

.cf-box-title-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cf-mini-manage-btn {
  height: 26px;
  padding: 0 9px;
  border-radius: 7px;
  border: 1px solid var(--cf-border-strong);
  background: transparent;
  color: var(--cf-text-muted);
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  margin: 0;
  width: fit-content;
}

.customer-page.page .modal-card .modal-head .x {
  width: 30px !important;
  min-width: 30px !important;
  height: 30px !important;
  min-height: 30px !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 50% !important;
}

.customer-page.page .modal-card .cf-mini-manage-btn {
  width: auto !important;
  min-width: 0 !important;
  height: 28px !important;
  min-height: 28px !important;
  padding: 0 10px !important;
  margin: 0 !important;
  font-size: 11.5px !important;
  border-radius: 7px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}

.cf-mini-manage-btn:hover {
  color: #38bdf8;
  border-color: #38bdf8;
}

.cf-field-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cf-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cf-field label,
.debt-sub-lbl {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--cf-text-muted);
  margin-bottom: 2px;
}

.cf-field .req {
  color: #ef4444;
}

.cf-input,
:deep(.cf-input),
.cf-textarea,
.customer-page.page .modal-card .cf-input,
.customer-page.page .modal-card .cf-textarea {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  padding: 8px 11px !important;
  border-radius: 8px !important;
  background: var(--cf-input-bg) !important;
  border: 1px solid var(--cf-input-border) !important;
  color: var(--cf-text) !important;
  font-size: 13px !important;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.customer-page.page .modal-card .cf-input {
  height: 38px !important;
}

.cf-input.is-mono {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px !important;
}

.cf-input:focus,
:deep(.cf-input:focus),
.cf-textarea:focus,
.customer-page.page .modal-card .cf-input:focus,
.customer-page.page .modal-card .cf-textarea:focus {
  border-color: #0ea5e9 !important;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.14) !important;
  background: var(--cf-input-bg) !important;
}

.cf-textarea,
.customer-page.page .modal-card .cf-textarea {
  height: auto !important;
  resize: vertical;
  min-height: 58px !important;
}

.cf-sub-divider {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--cf-border);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--cf-text-dim);
}

.cf-tag-creator-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.cf-tag-creator-row .cf-input,
.customer-page.page .modal-card .cf-tag-creator-row .cf-input {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  width: auto !important;
}

.customer-page.page .modal-card .cf-tag-creator-row .cf-btn {
  width: auto !important;
  min-width: 0 !important;
  height: 38px !important;
  min-height: 38px !important;
  padding: 0 13px !important;
  margin: 0 !important;
  font-size: 12.5px !important;
  border-radius: 8px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  display: inline-flex !important;
}

.cf-tag-selector-list {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  max-height: 110px;
  overflow-y: auto;
}

.cf-tag-select-chip,
.customer-page.page .modal-card .cf-tag-select-chip {
  height: 27px !important;
  min-height: 27px !important;
  padding: 0 10px !important;
  border-radius: 999px !important;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid var(--cf-border-strong);
  color: var(--cf-text-sec);
  font-size: 11.5px !important;
  font-weight: 700;
  display: inline-flex !important;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  margin: 0 !important;
  width: fit-content !important;
  white-space: nowrap !important;
  box-shadow: none !important;
}

.cf-tag-select-chip.active {
  background: rgba(16, 185, 129, 0.18);
  border-color: #10b981;
  color: #34d399;
}

.customer-page.page.theme-light-blue .cf-tag-select-chip.active {
  background: #ecfdf5;
  border-color: #10b981;
  color: #047857;
}

.cf-tag-empty-hint {
  font-size: 12px;
  color: var(--cf-text-dim);
  font-style: italic;
}

.cf-form-footer,
.customer-page.page .modal-card .cf-form-footer {
  position: sticky;
  bottom: 0;
  z-index: 5;
  margin: auto -20px 0;
  padding: 12px 20px;
  background: var(--cf-bg-elevated);
  border-top: 1px solid var(--cf-border);
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
  flex-wrap: nowrap !important;
}

.cf-form-footer-right,
.customer-page.page .modal-card .cf-form-footer-right {
  margin-left: auto;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: nowrap !important;
  flex-shrink: 0;
}

.customer-page.page .modal-card .cf-form-footer button.cf-btn,
.customer-page.page .modal-card .cf-simple-footer button.cf-btn,
.customer-page.page .modal-card .cf-multi-nav button.cf-btn,
.customer-page.page .modal-card .cf-industry-row button.cf-btn {
  width: auto !important;
  min-width: 0 !important;
  height: 36px !important;
  min-height: 36px !important;
  padding: 0 13px !important;
  margin: 0 !important;
  font-size: 12.5px !important;
  border-radius: 9px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  display: inline-flex !important;
}

.customer-page.page .modal-card.cf-customer-form-modal .cust-debt-btn {
  width: fit-content !important;
  min-width: 0 !important;
  height: auto !important;
  min-height: 36px !important;
  padding: 8px 13px !important;
  margin: 0 !important;
  font-size: 12px !important;
  border-radius: 8px !important;
  white-space: nowrap !important;
}

.cf-simple-footer {
  padding: 12px 20px;
  background: var(--cf-bg-elevated);
  border-top: 1px solid var(--cf-border);
  display: flex;
  justify-content: flex-end;
}

/* Modal 4: Tag Management Modal */
.cf-tag-modal {
  max-width: 520px;
  max-height: 86dvh;
}

.cf-tag-modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cf-tag-empty-box {
  padding: 28px 16px;
  text-align: center;
  color: var(--cf-text-muted);
  border: 1px dashed var(--cf-border-strong);
  border-radius: 10px;
}

.cf-tag-empty-box i {
  font-size: 24px;
  color: #38bdf8;
}

.cf-tag-manage-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.cf-tag-manage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--cf-surface-soft);
  border: 1px solid var(--cf-border);
}

.cf-tag-manage-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.cf-tag-count {
  font-size: 12px;
  color: var(--cf-text-muted);
}

/* Inline Input Picker & Industry Picker Modal */
.cf-input-with-picker {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.cf-input.cf-input-has-picker,
.customer-page.page .modal-card .cf-input.cf-input-has-picker {
  padding-right: 78px !important;
}

.cf-inline-picker-btn,
.customer-page.page .modal-card .cf-inline-picker-btn {
  position: absolute !important;
  right: 5px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  height: 26px !important;
  min-height: 26px !important;
  padding: 0 9px !important;
  border-radius: 6px !important;
  border: 1px solid rgba(16, 185, 129, 0.45) !important;
  background: rgba(16, 185, 129, 0.16) !important;
  color: #34d399 !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  cursor: pointer;
  white-space: nowrap !important;
  z-index: 2;
  transition: all 0.15s ease;
  margin: 0 !important;
  width: fit-content !important;
  min-width: 0 !important;
  box-shadow: none !important;
}

.cf-inline-picker-btn:hover,
.customer-page.page .modal-card .cf-inline-picker-btn:hover {
  background: #10b981 !important;
  border-color: #10b981 !important;
  color: #ffffff !important;
}

.customer-page.page.theme-light-blue .cf-inline-picker-btn,
.customer-page.page.theme-light-blue .modal-card .cf-inline-picker-btn {
  background: #e0f2fe !important;
  border-color: #38bdf8 !important;
  color: #0369a1 !important;
}

.customer-page.page.theme-light-blue .cf-inline-picker-btn:hover,
.customer-page.page.theme-light-blue .modal-card .cf-inline-picker-btn:hover {
  background: #0284c7 !important;
  border-color: #0284c7 !important;
  color: #ffffff !important;
}

.cf-industry-modal {
  max-width: 580px;
}

.cf-industry-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.cf-industry-search-wrap > i {
  position: absolute;
  left: 11px;
  color: var(--cf-text-muted);
  font-size: 14px;
  pointer-events: none;
}

.cf-industry-search-wrap .cf-input,
.customer-page.page .modal-card .cf-industry-search-wrap .cf-input {
  padding-left: 33px !important;
}

.cf-industry-row {
  cursor: pointer;
  transition: all 0.15s ease;
}

.cf-industry-row:hover {
  border-color: rgba(56, 189, 248, 0.48);
  background: rgba(56, 189, 248, 0.08);
}

.cf-industry-row.is-selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.14);
}

.cf-industry-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--cf-text);
  word-break: break-word;
}

.cf-industry-selected-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid #10b981;
  color: #34d399;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.customer-page.page.theme-light-blue .cf-industry-selected-pill {
  background: #ecfdf5;
  color: #047857;
}

.cf-btn.cf-btn-sky-soft {
  background: rgba(56, 189, 248, 0.16);
  border: 1px solid rgba(56, 189, 248, 0.38);
  color: #38bdf8;
}

.cf-btn.cf-btn-sky-soft:hover:not(:disabled) {
  background: #0ea5e9;
  border-color: #0ea5e9;
  color: #ffffff;
}

.customer-page.page.theme-light-blue .cf-btn.cf-btn-sky-soft {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

.customer-page.page.theme-light-blue .cf-btn.cf-btn-sky-soft:hover:not(:disabled) {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

/* Modal 5: Duplicate Check Modal */
.cf-dup-modal {
  max-width: 1180px;
  height: min(88dvh, 840px);
}

.cf-dup-toolbar {
  padding: 12px 20px;
  border-bottom: 1px solid var(--cf-border);
  background: var(--cf-surface-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.cf-dup-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cf-dup-tab {
  height: 31px;
  padding: 0 11px;
  border-radius: 8px;
  border: 1px solid var(--cf-border);
  background: var(--cf-card);
  color: var(--cf-text-muted);
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  margin: 0;
  width: fit-content;
}

.cf-dup-tab.active {
  background: rgba(14, 165, 233, 0.16);
  border-color: #38bdf8;
  color: #38bdf8;
}

.customer-page.page.theme-light-blue .cf-dup-tab.active {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #0369a1;
}

.cf-dup-search {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--cf-input-bg);
  border: 1px solid var(--cf-input-border);
  min-width: 240px;
}

.cf-dup-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--cf-text);
  font-size: 12.5px;
}

.cf-dup-search button {
  border: none;
  background: transparent;
  color: var(--cf-text-muted);
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.cf-dup-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.cf-dup-groups-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cf-dup-group-card {
  padding: 14px;
  border-radius: 12px;
  background: var(--cf-surface-soft);
  border: 1px solid var(--cf-border-strong);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cf-dup-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.cf-dup-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cf-dup-idx {
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(244, 63, 94, 0.16);
  color: #fb7185;
  font-size: 11px;
  font-weight: 800;
}

.customer-page.page.theme-light-blue .cf-dup-idx {
  background: #fff1f2;
  color: #e11d48;
}

.cf-dup-count {
  font-size: 12px;
  color: var(--cf-text-muted);
}

.cf-dup-reasons {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cf-dup-reason-pill {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.cf-dup-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 12px;
}

.cf-dup-item-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--cf-card);
  border: 1px solid var(--cf-border-strong);
  box-shadow: 0 4px 12px rgba(2, 6, 23, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cf-dup-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--cf-border);
}

.cf-dup-rec-index {
  font-size: 12px;
  font-weight: 800;
  color: var(--cf-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cf-dup-item-rows {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-size: 12.5px;
}

.cf-dup-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 5.5px 0;
  line-height: 1.45;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.cf-dup-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.cf-dup-row:first-child {
  padding-top: 0;
}

.cf-dup-row-lbl {
  color: var(--cf-text-muted);
  font-weight: 600;
  min-width: 88px;
  flex-shrink: 0;
}

.cf-dup-row-val {
  color: var(--cf-text);
  font-weight: 600;
  word-break: break-word;
  flex: 1;
  min-width: 0;
}

.cf-dup-row.is-diff .cf-dup-row-lbl {
  color: #f87171;
  font-weight: 700;
}

.cf-dup-row.is-diff .cf-dup-row-val {
  color: #f87171;
  font-weight: 700;
}

.customer-page.page.theme-light-blue .cf-dup-row.is-diff .cf-dup-row-lbl,
.customer-page.page.theme-light-blue .cf-dup-row.is-diff .cf-dup-row-val {
  color: #dc2626;
}

.cf-dup-item-rows em {
  font-style: normal;
}

/* =========================================================================
   7. BAOGIAFIREBASE 1:1 CUSTOMER DEBT & PAYMENT WORKSPACE (PC + LIGHT + MOBILE)
   ========================================================================= */
.cust-debt-btn {
  color: #38bdf8 !important;
}

.cust-debt-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.customer-page.page.theme-light-blue .cust-top-toolbar {
  background: #f8fafc !important;
  border-bottom: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
}

.customer-page.page.theme-light-blue .cust-debt-box {
  background: #f0f9ff !important;
  border: 1px solid #bae6fd !important;
  color: #0f172a !important;
}

.customer-page.page.theme-light-blue .cust-debt-btn {
  background: #e0f2fe !important;
  color: #0369a1 !important;
  border: 1px solid #7dd3fc !important;
}

/* Debt Tables (.quote-table-wrap & .quote-item-row) */
.quote-table-wrap {
  border-radius: 9px;
  border: 1px solid var(--cf-border);
  background: rgba(8, 15, 30, 0.45);
}

.quote-table-wrap table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #162238;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
}

.quote-item-row td {
  border-bottom: 1px solid rgba(148, 163, 184, 0.13);
  color: var(--cf-text);
}

.quote-item-row:last-child td {
  border-bottom: none;
}

.quote-item-row:hover td {
  background: rgba(56, 189, 248, 0.06);
}

.customer-page.page.theme-light-blue .quote-table-wrap {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
}

.customer-page.page.theme-light-blue .quote-table-wrap table thead th {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-bottom: 1px solid #cbd5e1 !important;
}

.customer-page.page.theme-light-blue .quote-item-row td {
  color: #0f172a !important;
  border-bottom-color: #e2e8f0 !important;
}

.customer-page.page.theme-light-blue .quote-item-row:hover td {
  background: #f0f9ff !important;
}

.customer-page.page.theme-light-blue .debt-single-due-box,
.customer-page.page.theme-light-blue .debt-preview-box {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  color: #334155 !important;
}

.customer-page.page.theme-light-blue .debt-modal-footer,
.customer-page.page.theme-light-blue .debt-sub-footer {
  background: #f8fafc !important;
  border-top: 1px solid #e2e8f0 !important;
}

.customer-page.page.theme-light-blue .btn-debt-close {
  background: #ffffff !important;
  color: #334155 !important;
  border: 1px solid #cbd5e1 !important;
}

.debt-quick-chip {
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  margin: 0;
  width: fit-content;
}

.debt-quick-chip:hover {
  border-color: #38bdf8;
  color: #38bdf8;
}

.debt-payment-modal .m-debt-po-code {
  display: inline-block;
  max-width: 205px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.debt-payment-modal .m-debt-hist-cust-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 5px 8px;
  margin: 4px 0 6px 0;
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.14);
  font-size: 11.5px;
  color: #94a3b8;
  line-height: 1.35;
}

.debt-payment-modal .m-debt-hist-cust-info strong {
  color: #e2e8f0;
  font-weight: 700;
}

.customer-page.page.theme-light-blue .debt-payment-modal .m-debt-hist-cust-info {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #64748b !important;
}

.customer-page.page.theme-light-blue .debt-payment-modal .m-debt-hist-cust-info strong {
  color: #0f172a !important;
}

/* Desktop vs Mobile Visibility Split (> 1100px vs <= 1100px) */
@media (min-width: 1101px) {
  .m-grab-head-stack,
  .m-debt-body,
  .m-only-debt-btn {
    display: none !important;
  }
}

@media (max-width: 1100px) {
  .dt-only-head {
    display: none !important;
  }

  .m-grab-head-stack {
    display: flex !important;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding-right: 34px;
  }

  .m-grab-eyebrow {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.8);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .m-grab-title {
    font-size: 15px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.25;
  }

  .modal-head.modal-head-themed {
    justify-content: flex-start !important;
    padding: 16px 16px 14px !important;
  }

  .modal-head.modal-head-themed::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 38px;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.38);
  }

  /* Fullscreen Mobile Modals */
  .modal.modal-fullscreen-overlay {
    padding: 0 !important;
    align-items: flex-end !important;
  }

  .modal-card.debt-payment-modal.modal-fullscreen-card,
  .modal-card.cf-dup-modal {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 96dvh !important;
    max-height: 96dvh !important;
    border-radius: 18px 18px 0 0 !important;
  }

  .modal.cf-modal-full100-overlay {
    padding: 0 !important;
    align-items: stretch !important;
  }

  .modal-card.cf-customer-form-modal {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
  }

  /* 1:1 Mobile Debt Workspace from baogiaFirebase */
  .customer-page.page .debt-payment-modal .dt-only-debt-view {
    display: none !important;
  }

  .customer-page.page .modal .modal-card.debt-payment-modal.modal-fullscreen-card {
    background: #0b1120 !important;
    color: #f8fafc !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-body {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    flex: 1 1 0% !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    padding: 10px 12px 18px 12px !important;
    background: #0b1120 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-cust-card {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    padding: 11px 13px !important;
    border-radius: 13px !important;
    background: #111c30 !important;
    border: 1px solid rgba(148, 163, 184, 0.16) !important;
    flex-shrink: 0 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-cust-top {
    display: flex !important;
    align-items: flex-start !important;
    justify-content: space-between !important;
    gap: 8px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-cust-name {
    flex: 1 1 0% !important;
    min-width: 0 !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    color: #f8fafc !important;
    line-height: 1.35 !important;
    word-break: break-word !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-cust-code {
    flex-shrink: 0 !important;
    padding: 3px 8px !important;
    border-radius: 999px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
    background: rgba(16, 185, 129, 0.14) !important;
    color: #34d399 !important;
    border: 1px solid rgba(16, 185, 129, 0.32) !important;
    white-space: nowrap !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-plan-row {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-plan-badge {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 5px 10px !important;
    border-radius: 8px !important;
    font-size: 11.5px !important;
    font-weight: 700 !important;
    line-height: 1.25 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-plan-badge.is-single {
    background: rgba(56, 189, 248, 0.12) !important;
    color: #38bdf8 !important;
    border: 1px solid rgba(56, 189, 248, 0.28) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-plan-badge.is-multi {
    background: rgba(167, 139, 250, 0.14) !important;
    color: #c4b5fd !important;
    border: 1px solid rgba(167, 139, 250, 0.32) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-plan-ico {
    width: 13px !important;
    height: 13px !important;
    flex-shrink: 0 !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-plan-edit-btn {
    flex: 0 0 auto !important;
    width: auto !important;
    height: 30px !important;
    margin: 0 !important;
    padding: 0 10px !important;
    border-radius: 8px !important;
    background: rgba(148, 163, 184, 0.12) !important;
    border: 1px solid rgba(148, 163, 184, 0.24) !important;
    color: #e2e8f0 !important;
    font-size: 11.5px !important;
    font-weight: 700 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    white-space: nowrap !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-plan-edit-btn svg {
    width: 12px !important;
    height: 12px !important;
    color: #38bdf8 !important;
    flex-shrink: 0 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-kpi-section {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    flex-shrink: 0 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-bento-grid {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
    gap: 8px !important;
    width: 100% !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-kpi-tile {
    padding: 10px 11px !important;
    border-radius: 12px !important;
    background: #111c30 !important;
    border: 1px solid rgba(148, 163, 184, 0.15) !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 4px !important;
    min-width: 0 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-kpi-tile.is-sky {
    background: linear-gradient(145deg, rgba(14, 165, 233, 0.11), rgba(17, 28, 48, 0.96)) !important;
    border-color: rgba(56, 189, 248, 0.26) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-kpi-tile.is-emerald {
    background: linear-gradient(145deg, rgba(16, 185, 129, 0.11), rgba(17, 28, 48, 0.96)) !important;
    border-color: rgba(16, 185, 129, 0.28) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-kpi-tile.is-rose {
    background: linear-gradient(145deg, rgba(244, 63, 94, 0.11), rgba(17, 28, 48, 0.96)) !important;
    border-color: rgba(244, 63, 94, 0.28) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-kpi-tile.is-amber {
    background: linear-gradient(145deg, rgba(245, 158, 11, 0.11), rgba(17, 28, 48, 0.96)) !important;
    border-color: rgba(245, 158, 11, 0.28) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-kpi-lbl {
    font-size: 10.5px !important;
    font-weight: 700 !important;
    color: #94a3b8 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.25px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-kpi-val {
    font-size: 15px !important;
    font-weight: 900 !important;
    font-variant-numeric: tabular-nums !important;
    line-height: 1.25 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-kpi-tile.is-sky .m-debt-kpi-val { color: #38bdf8 !important; }
  .customer-page.page .debt-payment-modal .m-debt-kpi-tile.is-emerald .m-debt-kpi-val { color: #34d399 !important; }
  .customer-page.page .debt-payment-modal .m-debt-kpi-tile.is-rose .m-debt-kpi-val { color: #fb7185 !important; }
  .customer-page.page .debt-payment-modal .m-debt-kpi-tile.is-amber .m-debt-kpi-val { color: #fbbf24 !important; }

  .customer-page.page .debt-payment-modal .m-debt-progress-card {
    padding: 9px 12px !important;
    border-radius: 11px !important;
    background: #111c30 !important;
    border: 1px solid rgba(148, 163, 184, 0.15) !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-progress-head {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-progress-lbl {
    font-size: 11.5px !important;
    font-weight: 700 !important;
    color: #cbd5e1 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-progress-pct {
    font-size: 12px !important;
    font-weight: 800 !important;
    font-variant-numeric: tabular-nums !important;
    color: #38bdf8 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-progress-pct.is-done {
    color: #34d399 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-progress-track {
    width: 100% !important;
    height: 7px !important;
    border-radius: 999px !important;
    background: rgba(148, 163, 184, 0.16) !important;
    overflow: hidden !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-progress-fill {
    height: 100% !important;
    border-radius: 999px !important;
    background: linear-gradient(90deg, #0ea5e9, #10b981) !important;
    transition: width 0.28s ease !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-po-strip {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    flex-shrink: 0 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-sec-head {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    padding: 0 2px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-sec-title {
    font-size: 11.5px !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.45px !important;
    color: #94a3b8 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-sec-hint {
    font-size: 11px !important;
    font-weight: 600 !important;
    color: #64748b !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-po-scroll {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 8px !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    padding-bottom: 2px !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-po-scroll::-webkit-scrollbar {
    display: none !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-po-pill {
    flex: 0 0 auto !important;
    width: auto !important;
    height: 36px !important;
    margin: 0 !important;
    padding: 0 12px !important;
    border-radius: 10px !important;
    background: #111c30 !important;
    border: 1px solid rgba(148, 163, 184, 0.2) !important;
    color: #cbd5e1 !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    white-space: nowrap !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-po-pill.is-active {
    background: rgba(14, 165, 233, 0.16) !important;
    border: 1.5px solid #38bdf8 !important;
    color: #f8fafc !important;
    box-shadow: 0 2px 10px rgba(14, 165, 233, 0.18) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-po-code {
    color: #38bdf8 !important;
    font-weight: 800 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-po-sep {
    color: #475569 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-po-state {
    color: #fb7185 !important;
    font-weight: 700 !important;
    font-variant-numeric: tabular-nums !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-po-pill.is-paid .m-debt-po-state {
    color: #34d399 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-po-empty {
    padding: 12px !important;
    border-radius: 11px !important;
    border: 1px dashed rgba(148, 163, 184, 0.26) !important;
    background: rgba(17, 28, 48, 0.6) !important;
    color: #94a3b8 !important;
    font-size: 12px !important;
    text-align: center !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-tabs-wrap {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-tabs {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 4px !important;
    padding: 3px !important;
    height: 38px !important;
    border-radius: 11px !important;
    background: #111c30 !important;
    border: 1px solid rgba(148, 163, 184, 0.16) !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-tab-btn {
    flex: 1 1 0% !important;
    height: 30px !important;
    margin: 0 !important;
    padding: 0 8px !important;
    border-radius: 8px !important;
    border: 1px solid transparent !important;
    background: transparent !important;
    color: #94a3b8 !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    white-space: nowrap !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-tab-btn.active {
    background: rgba(16, 185, 129, 0.16) !important;
    border-color: rgba(16, 185, 129, 0.38) !important;
    color: #34d399 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-tab-count {
    padding: 1px 6px !important;
    border-radius: 999px !important;
    font-size: 10.5px !important;
    font-weight: 800 !important;
    background: rgba(148, 163, 184, 0.16) !important;
    color: inherit !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-card-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 9px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-card,
  .customer-page.page .debt-payment-modal .m-debt-hist-card {
    background: #111c30 !important;
    border: 1px solid rgba(148, 163, 184, 0.16) !important;
    border-radius: 13px !important;
    padding: 12px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 9px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-head,
  .customer-page.page .debt-payment-modal .m-debt-hist-top,
  .customer-page.page .debt-payment-modal .m-debt-hist-mid,
  .customer-page.page .debt-payment-modal .m-debt-inst-foot {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-title-group {
    flex: 1 1 0% !important;
    min-width: 0 !important;
    display: flex !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-dot {
    padding: 2px 7px !important;
    border-radius: 6px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    background: rgba(167, 139, 250, 0.16) !important;
    color: #c4b5fd !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-pct {
    padding: 2px 7px !important;
    border-radius: 6px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    background: rgba(56, 189, 248, 0.14) !important;
    color: #38bdf8 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-name {
    font-size: 13px !important;
    font-weight: 700 !important;
    color: #f8fafc !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-status {
    flex-shrink: 0 !important;
    padding: 3px 8px !important;
    border-radius: 999px !important;
    font-size: 10.5px !important;
    font-weight: 800 !important;
    background: rgba(148, 163, 184, 0.14) !important;
    color: #cbd5e1 !important;
    border: 1px solid rgba(148, 163, 184, 0.28) !important;
    white-space: nowrap !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-status.status-da_thu_du {
    background: rgba(16, 185, 129, 0.14) !important;
    color: #34d399 !important;
    border-color: rgba(16, 185, 129, 0.36) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-status.status-qua_han {
    background: rgba(244, 63, 94, 0.14) !important;
    color: #fb7185 !important;
    border-color: rgba(244, 63, 94, 0.38) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-status.status-den_han_hom_nay,
  .customer-page.page .debt-payment-modal .m-debt-inst-status.status-sap_den_han {
    background: rgba(245, 158, 11, 0.15) !important;
    color: #fbbf24 !important;
    border-color: rgba(245, 158, 11, 0.38) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-status.status-thu_mot_phan {
    background: rgba(56, 189, 248, 0.14) !important;
    color: #38bdf8 !important;
    border-color: rgba(56, 189, 248, 0.36) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-metrics {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 6px !important;
    padding: 8px 10px !important;
    border-radius: 10px !important;
    background: rgba(15, 23, 42, 0.65) !important;
    border: 1px solid rgba(148, 163, 184, 0.12) !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-metric-col {
    display: flex !important;
    flex-direction: column !important;
    gap: 2px !important;
    min-width: 0 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-metric-lbl {
    font-size: 10.5px !important;
    font-weight: 600 !important;
    color: #94a3b8 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-metric-val {
    font-size: 12px !important;
    font-weight: 800 !important;
    color: #f8fafc !important;
    font-variant-numeric: tabular-nums !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-metric-val.is-emerald { color: #34d399 !important; }
  .customer-page.page .debt-payment-modal .m-debt-metric-val.is-rose { color: #fb7185 !important; }
  .customer-page.page .debt-payment-modal .m-debt-metric-val.is-muted { color: #64748b !important; }

  .customer-page.page .debt-payment-modal .m-debt-inst-due {
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    font-size: 11.5px !important;
    color: #94a3b8 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-due svg {
    width: 13px !important;
    height: 13px !important;
    color: #38bdf8 !important;
    flex-shrink: 0 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-due strong {
    color: #e2e8f0 !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-inst-pay-btn {
    height: 32px !important;
    margin: 0 !important;
    padding: 0 12px !important;
    border-radius: 8px !important;
    background: linear-gradient(135deg, #10b981, #059669) !important;
    color: #ffffff !important;
    border: none !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    white-space: nowrap !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-inst-done-tag {
    padding: 4px 10px !important;
    border-radius: 8px !important;
    font-size: 11.5px !important;
    font-weight: 800 !important;
    background: rgba(16, 185, 129, 0.14) !important;
    color: #34d399 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-hist-meta {
    display: flex !important;
    align-items: center !important;
    gap: 7px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-hist-idx {
    padding: 2px 7px !important;
    border-radius: 6px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    background: rgba(56, 189, 248, 0.14) !important;
    color: #38bdf8 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-hist-time {
    font-size: 11.5px !important;
    font-weight: 600 !important;
    color: #94a3b8 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-hist-amt {
    font-size: 14.5px !important;
    font-weight: 900 !important;
    color: #34d399 !important;
    font-variant-numeric: tabular-nums !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-hist-rem {
    font-size: 12px !important;
    color: #94a3b8 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-hist-rem strong.is-rose { color: #fb7185 !important; }
  .customer-page.page .debt-payment-modal .m-debt-hist-rem strong.is-emerald { color: #34d399 !important; }

  .customer-page.page .debt-payment-modal button.m-debt-hist-del-btn {
    height: 28px !important;
    margin: 0 !important;
    padding: 0 9px !important;
    border-radius: 7px !important;
    background: rgba(239, 68, 68, 0.12) !important;
    border: 1px solid rgba(239, 68, 68, 0.3) !important;
    color: #f87171 !important;
    font-size: 11.5px !important;
    font-weight: 700 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-hist-del-btn svg {
    width: 12px !important;
    height: 12px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-hist-note {
    padding: 7px 10px !important;
    border-radius: 8px !important;
    background: rgba(15, 23, 42, 0.65) !important;
    border-left: 2.5px solid #38bdf8 !important;
    font-size: 12px !important;
    color: #cbd5e1 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-empty-box {
    padding: 22px 16px !important;
    border-radius: 13px !important;
    background: #111c30 !important;
    border: 1px dashed rgba(148, 163, 184, 0.24) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    gap: 6px !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-empty-ico {
    width: 28px !important;
    height: 28px !important;
    color: #64748b !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-empty-title {
    font-size: 13.5px !important;
    font-weight: 800 !important;
    color: #e2e8f0 !important;
  }

  .customer-page.page .debt-payment-modal .m-debt-empty-sub {
    font-size: 12px !important;
    color: #94a3b8 !important;
  }

  .customer-page.page .debt-payment-modal button.m-debt-empty-cta {
    height: 36px !important;
    margin: 6px 0 0 0 !important;
    padding: 0 14px !important;
    border-radius: 9px !important;
    background: linear-gradient(135deg, #10b981, #059669) !important;
    color: #ffffff !important;
    border: none !important;
    font-size: 12px !important;
    font-weight: 800 !important;
  }

  .customer-page.page .debt-payment-modal .debt-modal-footer {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px)) 12px !important;
    background: #0b1120 !important;
    border-top: 1px solid rgba(148, 163, 184, 0.14) !important;
  }

  .customer-page.page .debt-payment-modal .debt-modal-footer button {
    height: 42px !important;
    margin: 0 !important;
    padding: 0 10px !important;
    border-radius: 11px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .customer-page.page .debt-payment-modal .debt-modal-footer button.btn-debt-close {
    flex: 0 0 72px !important;
    width: 72px !important;
    background: rgba(30, 41, 59, 0.8) !important;
    border: 1px solid rgba(148, 163, 184, 0.22) !important;
    color: #e2e8f0 !important;
  }

  .customer-page.page .debt-payment-modal .debt-modal-footer button.btn-debt-close:only-child {
    flex: 1 1 0% !important;
    width: auto !important;
  }

  .customer-page.page .debt-payment-modal .debt-modal-footer button.btn-debt-schedule {
    flex: 1 1 0% !important;
    background: rgba(14, 165, 233, 0.14) !important;
    border: 1px solid rgba(56, 189, 248, 0.38) !important;
    color: #38bdf8 !important;
  }

  .customer-page.page .debt-payment-modal .debt-modal-footer button.btn-debt-record {
    flex: 1.25 1 0% !important;
    background: linear-gradient(135deg, #10b981, #059669) !important;
    border: 1px solid rgba(52, 211, 153, 0.35) !important;
    color: #ffffff !important;
    font-weight: 800 !important;
  }

  /* Mobile Light Mode Debt Overrides */
  .customer-page.page.theme-light-blue .modal .modal-card.debt-payment-modal.modal-fullscreen-card,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-body {
    background: #f1f5f9 !important;
    color: #0f172a !important;
  }

  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-cust-card,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-progress-card,
  .customer-page.page.theme-light-blue .debt-payment-modal button.m-debt-po-pill,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-tabs,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-inst-card,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-hist-card,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-empty-box {
    background: #ffffff !important;
    border-color: #e2e8f0 !important;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05) !important;
  }

  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-cust-name,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-inst-name,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-metric-val,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-empty-title {
    color: #0f172a !important;
  }

  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-kpi-tile.is-sky { background: #ffffff !important; border-color: #bae6fd !important; }
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-kpi-tile.is-sky .m-debt-kpi-val { color: #0284c7 !important; }
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-kpi-tile.is-emerald { background: #ffffff !important; border-color: #a7f3d0 !important; }
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-kpi-tile.is-emerald .m-debt-kpi-val { color: #059669 !important; }
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-kpi-tile.is-rose { background: #ffffff !important; border-color: #fecdd3 !important; }
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-kpi-tile.is-rose .m-debt-kpi-val { color: #e11d48 !important; }
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-kpi-tile.is-amber { background: #ffffff !important; border-color: #fde68a !important; }
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-kpi-tile.is-amber .m-debt-kpi-val { color: #d97706 !important; }

  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-inst-metrics,
  .customer-page.page.theme-light-blue .debt-payment-modal .m-debt-hist-note {
    background: #f8fafc !important;
    border-color: #e2e8f0 !important;
    color: #334155 !important;
  }

  .customer-page.page.theme-light-blue .debt-payment-modal .debt-modal-footer {
    background: #ffffff !important;
    border-top: 1px solid #e2e8f0 !important;
  }

  .customer-page.page.theme-light-blue .debt-payment-modal .debt-modal-footer button.btn-debt-close {
    background: #f1f5f9 !important;
    border-color: #cbd5e1 !important;
    color: #334155 !important;
  }

  .customer-page.page.theme-light-blue .debt-payment-modal .debt-modal-footer button.btn-debt-schedule {
    background: #e0f2fe !important;
    border-color: #7dd3fc !important;
    color: #0369a1 !important;
  }
}

/* =========================================================================
   8. UNIFIED TEMPLATE DIALOG MODAL (.baogia-dialog-card) & ASYNC MODAL
   ========================================================================= */
.customer-page.page .baogia-dialog-overlay {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 16px !important;
  background: rgba(3, 8, 18, 0.72) !important;
  backdrop-filter: blur(5px) !important;
  -webkit-backdrop-filter: blur(5px) !important;
}

.customer-page.page.theme-light-blue .baogia-dialog-overlay {
  background: rgba(15, 23, 42, 0.45) !important;
}

.customer-page.page .modal-card.baogia-dialog-card {
  width: 470px !important;
  max-width: 94vw !important;
  height: auto !important;
  max-height: 88dvh !important;
  padding: 0 !important;
  border-radius: 14px !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  background: linear-gradient(180deg, #111c30 0%, #0b1322 100%) !important;
  border: 1px solid rgba(148, 163, 184, 0.22) !important;
  box-shadow: 0 24px 56px -12px rgba(0, 0, 0, 0.72) !important;
}

.customer-page.page.theme-light-blue .modal-card.baogia-dialog-card {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 22px 48px -12px rgba(15, 23, 42, 0.24) !important;
}

.baogia-dialog-dt-head {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #ffffff;
  text-transform: uppercase;
  font-weight: 800;
  font-size: 14.5px;
  letter-spacing: 0.35px;
  padding-right: 32px;
}

.baogia-dialog-head-ico {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}

.baogia-dialog-card.is-variant-warning .baogia-dialog-head-ico {
  color: #fbbf24;
}

.baogia-dialog-card.is-variant-error .baogia-dialog-head-ico,
.baogia-dialog-card.is-variant-danger .baogia-dialog-head-ico {
  color: #fca5a5;
}

.baogia-dialog-close-x {
  position: absolute !important;
  right: 14px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

.baogia-dialog-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.baogia-dialog-target-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.customer-page.page.theme-light-blue .baogia-dialog-target-card {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.baogia-dialog-target-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.32);
  color: #f87171;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.customer-page.page.theme-light-blue .baogia-dialog-target-icon {
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.baogia-dialog-target-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.baogia-dialog-target-tag {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.35px;
  color: #94a3b8;
}

.baogia-dialog-target-val {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--cf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.baogia-dialog-msg-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13.5px;
  line-height: 1.55;
  background: rgba(245, 158, 11, 0.11);
  border: 1px solid rgba(245, 158, 11, 0.32);
  color: #fef3c7;
}

.baogia-dialog-card.is-variant-error .baogia-dialog-msg-box,
.baogia-dialog-card.is-variant-danger .baogia-dialog-msg-box {
  background: rgba(239, 68, 68, 0.11);
  border-color: rgba(239, 68, 68, 0.32);
  color: #fee2e2;
}

.baogia-dialog-card.is-variant-info .baogia-dialog-msg-box {
  background: rgba(14, 165, 233, 0.11);
  border-color: rgba(56, 189, 248, 0.3);
  color: #e0f2fe;
}

.customer-page.page.theme-light-blue .baogia-dialog-msg-box {
  background: #fffbeb;
  border-color: #fcd34d;
  color: #92400e;
}

.customer-page.page.theme-light-blue .baogia-dialog-card.is-variant-error .baogia-dialog-msg-box,
.customer-page.page.theme-light-blue .baogia-dialog-card.is-variant-danger .baogia-dialog-msg-box {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.customer-page.page.theme-light-blue .baogia-dialog-card.is-variant-info .baogia-dialog-msg-box {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e3a8a;
}

.baogia-dialog-msg-icon {
  font-size: 17px;
  line-height: 1.35;
  flex-shrink: 0;
  color: #f59e0b;
}

.baogia-dialog-card.is-variant-error .baogia-dialog-msg-icon,
.baogia-dialog-card.is-variant-danger .baogia-dialog-msg-icon {
  color: #f87171;
}

.baogia-dialog-card.is-variant-info .baogia-dialog-msg-icon {
  color: #38bdf8;
}

.baogia-dialog-msg-text {
  flex: 1;
  min-width: 0;
  white-space: pre-line;
  font-weight: 500;
}

.baogia-dialog-subnote {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 8px;
  background: var(--cf-surface-soft);
  border: 1px solid var(--cf-border);
  color: var(--cf-text-muted);
  font-size: 12.5px;
  line-height: 1.48;
}

.baogia-dialog-foot {
  padding: 12px 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 10px !important;
  background: rgba(9, 15, 28, 0.72) !important;
  border-top: 1px solid var(--cf-border) !important;
}

.customer-page.page.theme-light-blue .baogia-dialog-foot {
  background: #f8fafc !important;
}

.baogia-dialog-foot button.baogia-dlg-btn {
  width: auto !important;
  margin: 0 !important;
  height: 38px !important;
  padding: 0 16px !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  cursor: pointer !important;
}

.baogia-dialog-foot button.baogia-dlg-confirm {
  border: none !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
}

.baogia-dialog-foot button.baogia-dlg-confirm.is-btn-warning {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
}

.baogia-dialog-foot button.baogia-dlg-confirm.is-btn-danger,
.baogia-dialog-foot button.baogia-dlg-confirm.is-btn-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
}

/* Async Progress / Result Modal */
.async-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.async-modal-box {
  width: min(360px, 90vw);
  padding: 26px 22px;
  border-radius: 16px;
  background: var(--cf-bg-elevated);
  border: 1px solid var(--cf-border-strong);
  box-shadow: var(--cf-shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.async-title {
  font-size: 15.5px;
  font-weight: 800;
  color: var(--cf-text);
}

.async-subtitle {
  font-size: 12.5px;
  color: var(--cf-text-muted);
  line-height: 1.45;
}

.async-spinner-ring {
  position: relative;
  width: 46px;
  height: 46px;
}

.async-spinner-ring div {
  position: absolute;
  width: 38px;
  height: 38px;
  margin: 4px;
  border: 3.5px solid transparent;
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: cf-spin 0.95s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.async-spinner-ring div:nth-child(1) { animation-delay: -0.3s; }
.async-spinner-ring div:nth-child(2) { animation-delay: -0.2s; }
.async-spinner-ring div:nth-child(3) { animation-delay: -0.1s; }

.async-icon-wrap {
  width: 52px;
  height: 52px;
}

.async-checkmark,
.async-xmark {
  width: 52px;
  height: 52px;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.async-checkmark {
  stroke: #10b981;
}

.async-xmark {
  stroke: #ef4444;
}

.async-close-btn {
  margin-top: 6px;
  height: 34px;
  padding: 0 18px;
  border-radius: 8px;
  border: none;
  background: #ef4444;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.async-modal-enter-active,
.async-modal-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.async-modal-enter-from,
.async-modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* =========================================================================
   9. TELEPORTED GLASSIFY TUNER & SINGLE-MERGED SMART TOAST
   ========================================================================= */
.cf-tuner-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000090;
  background: transparent;
}

.cf-glass-tuner {
  position: fixed;
  z-index: 1000095;
  width: 320px;
  padding: 14px 16px;
  border-radius: 15px;
  background: rgba(13, 25, 44, 0.94);
  border: 1px solid rgba(56, 189, 248, 0.35);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #f8fafc;
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.58);
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cf-tuner-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cf-tuner-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 800;
  color: #38bdf8;
}

.cf-tuner-head-acts {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cf-tuner-reset,
.cf-tuner-close {
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.cf-tuner-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.cf-tuner-presets button {
  height: 28px;
  border-radius: 7px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.6);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.cf-tuner-presets button.active {
  background: rgba(14, 165, 233, 0.22);
  border-color: #38bdf8;
  color: #38bdf8;
}

.cf-tuner-sliders {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.cf-slider-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cf-slider-lbl {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: #cbd5e1;
}

.cf-slider-lbl strong {
  color: #38bdf8;
}

.cf-slider-row input[type='range'] {
  width: 100%;
  accent-color: #0ea5e9;
  cursor: pointer;
}

/* Single-Merged Smart Toast (z-index: 2000000) */
.smart-toast-layer {
  position: fixed;
  top: 16px;
  left: 0;
  right: 0;
  z-index: 2000000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0 16px;
  pointer-events: none;
  box-sizing: border-box;
}

.smart-toast {
  --st-bg: rgba(15, 23, 42, 0.94);
  --st-fg: #f8fafc;
  --st-accent: #10b981;
  --st-icon-fg: #34d399;
  --st-icon-bg: rgba(16, 185, 129, 0.16);
  --st-border: rgba(16, 185, 129, 0.36);
  --st-count-bg: rgba(16, 185, 129, 0.18);
  --st-count-fg: #6ee7b7;

  pointer-events: auto;
  position: relative;
  overflow: hidden;
  width: fit-content;
  min-width: 240px;
  max-width: min(460px, calc(100vw - 32px));
  padding: 10px 11px 11px 13px;
  border-radius: 14px;
  background: var(--st-bg);
  border: 1px solid var(--st-border);
  box-shadow: 0 14px 34px -8px rgba(2, 6, 23, 0.68);
  backdrop-filter: blur(14px) saturate(1.25);
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  color: var(--st-fg);
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  display: flex;
  align-items: center;
  gap: 10px;
}

.smart-toast.is-warning {
  --st-accent: #f59e0b;
  --st-icon-fg: #fbbf24;
  --st-icon-bg: rgba(245, 158, 11, 0.16);
  --st-border: rgba(245, 158, 11, 0.38);
  --st-count-bg: rgba(245, 158, 11, 0.18);
  --st-count-fg: #fcd34d;
}

.smart-toast.is-info {
  --st-accent: #0ea5e9;
  --st-icon-fg: #38bdf8;
  --st-icon-bg: rgba(14, 165, 233, 0.16);
  --st-border: rgba(56, 189, 248, 0.36);
  --st-count-bg: rgba(14, 165, 233, 0.18);
  --st-count-fg: #7dd3fc;
}

.smart-toast.is-error {
  --st-accent: #ef4444;
  --st-icon-fg: #f87171;
  --st-icon-bg: rgba(239, 68, 68, 0.16);
  --st-border: rgba(239, 68, 68, 0.38);
  --st-count-bg: rgba(239, 68, 68, 0.18);
  --st-count-fg: #fca5a5;
}

.smart-toast-layer.is-light .smart-toast {
  --st-bg: rgba(255, 255, 255, 0.97);
  --st-fg: #0f172a;
  box-shadow: 0 12px 30px -8px rgba(15, 23, 42, 0.18);
}

.smart-toast__icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--st-icon-bg);
  color: var(--st-icon-fg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.smart-toast__msg {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.smart-toast__count {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--st-count-bg);
  color: var(--st-count-fg);
}

.smart-toast__close {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

@keyframes cf-toast-shrink {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.smart-toast__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2.5px;
  background: var(--st-accent);
  transform-origin: left center;
  animation: cf-toast-shrink linear forwards;
}

.smart-toast.is-paused .smart-toast__progress {
  animation-play-state: paused;
}

@keyframes cf-toast-pulse {
  0% { transform: scale(1); }
  45% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.smart-toast.is-pulsing {
  animation: cf-toast-pulse 0.22s ease;
}

.smart-toast-drop-enter-active,
.smart-toast-drop-leave-active {
  transition: transform 0.22s ease, opacity 0.2s ease;
}

.smart-toast-drop-enter-from,
.smart-toast-drop-leave-to {
  transform: translateY(-16px) scale(0.96);
  opacity: 0;
}

/* =========================================================================
   10. RESPONSIVE BREAKPOINTS (<= 1100px & <= 640px)
   ========================================================================= */
@media (max-width: 1200px) {
  .cf-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .cf-filter-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .hide-md {
    display: none !important;
  }

  .cf-form-2col {
    grid-template-columns: 1fr;
  }

  .cf-form-col {
    height: auto;
  }

  .cf-form-col > .cust-group-company,
  .cf-form-col > .cust-group-sub,
  .cf-form-col > .cust-group-sub .cf-field:last-child,
  .cf-form-col > .cust-group-sub .cf-textarea {
    flex: none;
  }
}

@media (max-width: 1100px) {
  .customer-page.page {
    padding: 14px 12px calc(104px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .cf-hide-mob {
    display: none !important;
  }

  /* Compact 2+1 KPI Bento Cards on Mobile (Matching SaleReportFirebase) */
  .sr-super-bento-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 10px;
  }

  .sr-super-bento-grid > .sr-sb-card:nth-child(3) {
    grid-column: 1 / -1;
  }

  .sr-super-bento-grid .sr-sb-card {
    padding: 10px 11px !important;
    gap: 6px !important;
    border-radius: 12px;
  }

  .sr-super-bento-grid .sr-sb-head {
    gap: 6px;
  }

  .sr-super-bento-grid .sr-sb-icon {
    width: 24px;
    height: 24px;
    border-radius: 7px;
  }

  .sr-super-bento-grid .sr-sb-title {
    font-size: 11.5px;
  }

  .sr-super-bento-grid .sr-sb-hero-val {
    font-size: clamp(13px, 3.7vw, 16px) !important;
    line-height: 1.2;
    word-break: break-word;
  }

  .sr-super-bento-grid .sr-sb-po-badge {
    font-size: 9.5px;
    padding: 2px 6px;
  }

  .sr-super-bento-grid .sr-sb-foot {
    gap: 3px;
  }

  .sr-super-bento-grid .sr-sb-foot-row {
    font-size: 10.5px;
    gap: 4px;
  }

  .sr-super-bento-grid .sr-sb-foot-val {
    font-size: 11px;
  }

  /* Unified 1-Row Search + Filter Bar (Matching PipelineFirebase / SaleReportFirebase) */
  .cf-toolbar-shell {
    margin-bottom: 12px;
    gap: 8px;
  }

  .cf-toolbar-row {
    flex-wrap: nowrap;
    gap: 8px;
    justify-content: stretch;
  }

  .bg-search-shell {
    flex: 1 1 0%;
    width: auto;
    min-width: 0;
    max-width: none;
    margin: 0;
    height: 40px;
    border-radius: 12px;
    padding: 0 10px 0 11px;
  }

  .cf-toolbar-actions {
    width: auto;
    flex-shrink: 0;
  }

  .cf-btn.cf-btn-filter-toggle {
    height: 40px;
    padding: 0 11px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 800;
    margin: 0;
  }

  .cf-filter-mob-caret {
    font-size: 14px;
    margin-left: -1px;
  }

  /* Floating Glass Bottom Sub-Dock (.cf-mobile-dock — Matching .pl-mobile-dock & .sr-mobile-dock) */
  .cf-mobile-dock {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: calc(74px + env(safe-area-inset-bottom, 0px));
    width: auto;
    max-width: 420px;
    margin: 0 auto;
    z-index: 955;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    gap: 6px;
    padding: 6px;
    border-radius: 20px;
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.28);
    box-shadow:
      0 14px 36px rgba(2, 6, 23, 0.62),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(22px) saturate(165%);
    -webkit-backdrop-filter: blur(22px) saturate(165%);
    transform: translate3d(0, 0, 0);
    will-change: bottom, transform;
    transition:
      bottom 0.38s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
      visibility 0.24s ease,
      box-shadow 0.3s ease;
  }

  .customer-page.page.theme-light-blue .cf-mobile-dock {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(2, 132, 199, 0.28);
    box-shadow:
      0 14px 34px rgba(15, 23, 42, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  .customer-page.page.theme-custom-glass .cf-mobile-dock {
    background: linear-gradient(
      160deg,
      var(--cg-card-top, rgba(15, 35, 58, 0.84)),
      var(--cg-card-bot, rgba(8, 22, 40, 0.74))
    );
    border-color: rgba(255, 255, 255, 0.28);
  }

  :global(.app-layout.mobile-nav-hidden .cf-mobile-dock) {
    bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .cf-mobile-dock.is-modal-hidden,
  :global(.app-layout.has-open-modal .cf-mobile-dock),
  :global(body.app-has-open-modal .cf-mobile-dock) {
    transform: translateY(calc(100% + 96px + env(safe-area-inset-bottom, 0px))) scale(0.96) !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .cf-dock-btn {
    position: relative;
    width: 100%;
    margin: 0;
    min-width: 0;
    min-height: 48px;
    padding: 5px 4px 4px;
    border-radius: 14px;
    border: 1px solid transparent;
    background: transparent;
    color: #94a3b8;
    font-family: inherit;
    font-size: 10.5px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.01em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.16s ease;
  }

  .cf-dock-btn > span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cf-dock-btn:active {
    transform: scale(0.95);
  }

  .cf-dock-btn.active {
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.14);
    border-color: rgba(56, 189, 248, 0.3);
  }

  .cf-dock-btn.has-dup-warn {
    color: #fda4af;
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(248, 113, 113, 0.28);
  }

  .customer-page.page.theme-light-blue .cf-dock-btn {
    color: #475569;
  }

  .customer-page.page.theme-light-blue .cf-dock-btn.has-dup-warn {
    color: #be123c;
    background: #fff1f2;
    border-color: #fda4af;
  }

  .customer-page.page.theme-custom-glass .cf-dock-btn {
    color: #e2e8f0;
  }

  .cf-dock-btn.is-primary.is-center-cta {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #042f2e;
    font-weight: 800;
    border-color: rgba(110, 231, 183, 0.48);
    box-shadow: 0 6px 18px -4px rgba(16, 185, 129, 0.52);
  }

  .customer-page.page.theme-light-blue .cf-dock-btn.is-primary.is-center-cta {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    color: #ffffff;
    border-color: #38bdf8;
    box-shadow: 0 6px 18px -4px rgba(2, 132, 199, 0.42);
  }

  .cf-dock-icon-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    font-size: 18px;
  }

  .cf-dock-badge {
    position: absolute;
    top: -5px;
    right: -18px;
    min-width: 17px;
    height: 15px;
    padding: 0 5px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #0f172a;
    white-space: nowrap;
  }

  .cf-dock-badge.is-mode {
    background: rgba(56, 189, 248, 0.22);
    color: #38bdf8;
    right: -24px;
  }

  .cf-dock-badge.is-danger {
    background: #ef4444;
    color: #ffffff;
    right: -14px;
  }

  .customer-page.page.theme-light-blue .cf-dock-badge {
    border-color: #ffffff;
  }

  .customer-page.page.theme-light-blue .cf-dock-badge.is-mode {
    background: #e0f2fe;
    color: #0369a1;
  }
}

@media (max-width: 768px) {
  .customer-page.page {
    padding: 12px 12px calc(158px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .hide-sm {
    display: none !important;
  }

  .card-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card-row-header {
    padding: 12px 14px;
  }

  .card-row-content {
    padding: 12px 14px 14px;
  }

  .skeleton-card {
    padding: 14px;
  }

  .cf-filter-grid,
  .cf-field-grid-2 {
    grid-template-columns: 1fr;
  }

  .baogia-dialog-foot:not(.is-single-action) {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
  }

  .baogia-dialog-foot button.baogia-dlg-btn {
    width: 100% !important;
  }
}

@media (max-width: 640px) {
  .hide-xs {
    display: none !important;
  }

  .cf-hide-xs-inline {
    display: none !important;
  }

  .customer-page.page .modal-card .cf-form-footer {
    padding: 10px 14px !important;
    gap: 6px !important;
  }

  .customer-page.page .modal-card .cf-form-footer-right {
    gap: 6px !important;
  }

  .customer-page.page .modal-card .cf-form-footer button.cf-btn {
    padding: 0 10px !important;
    font-size: 12px !important;
    height: 36px !important;
    min-height: 36px !important;
  }

  .debt-record-submodal .debt-record-2col {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }
}

@media (max-width: 380px) {
  .sr-super-bento-grid {
    grid-template-columns: 1fr;
  }
}
</style>
