<template>
  <div class="dashboard-container" :class="{ 'theme-light-blue': uiTheme === 'light' }">
    <!-- Header -->
    <header class="dash-header">
      <div class="dash-header__left">
        <div class="dash-header__icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
        </div>
        <div class="dash-header__text">
          <div class="dash-header__title-row">
            <h1 class="dash-header__title">Báo Cáo Tổng Quát</h1>
            <span class="dash-header__range-pill tabular-nums">{{ activeRangeBadgeText }}</span>
          </div>
          <p class="dash-header__subtitle">Theo dõi tổng quan công việc, báo giá và tình trạng bản quyền License</p>
        </div>
      </div>

      <div class="dash-header__actions">
        <button
          type="button"
          class="dash-header__btn dash-header__btn--theme"
          @click="toggleUiTheme"
          :title="uiTheme === 'dark' ? 'Chuyển sang giao diện Sáng (Light Blue)' : 'Chuyển sang giao diện Tối (Dark Navy)'"
        >
          <svg v-if="uiTheme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <span>{{ uiTheme === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>

        <button type="button" class="dash-header__btn dash-header__refresh" @click="fetchData" :disabled="loading">
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span v-if="loading" class="dash-spinner-sm"></span>
          <span>Làm mới</span>
        </button>
      </div>
    </header>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="dash-grid dash-skeleton-wrapper">
      <div class="dash-sidebar">
        <div class="dash-date-picker skeleton-box" style="height: 150px; padding: 0;"></div>

        <div class="dash-sidebar__cards">
          <div class="dash-nav-card skeleton-box" style="height: 132px; padding: 0;"></div>
          <div class="dash-nav-card skeleton-box" style="height: 132px; padding: 0;"></div>
          <div class="dash-nav-card skeleton-box" style="height: 132px; padding: 0;"></div>
        </div>
      </div>

      <div class="dash-detail-col">
        <div class="dash-detail skeleton-box" style="flex: 1; padding: 0;"></div>
        <div class="dash-floating-actions">
          <div class="skeleton-box" style="width: 148px; height: 44px; border-radius: 14px;"></div>
          <div class="skeleton-box" style="width: 46px; height: 46px; border-radius: 50%;"></div>
        </div>
      </div>
    </div>

    <!-- 2 Column Layout -->
    <div v-else class="dash-grid">
      <!-- ═══ COLUMN 1: SIDEBAR ═══ -->
      <div class="dash-sidebar">
        <!-- Date / Week / Month Picker -->
        <div class="dash-date-picker">
          <div class="dash-date-picker__head">
            <div class="dash-date-picker__label">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Mốc thời gian</span>
            </div>
            <span class="dash-date-picker__sub tabular-nums">{{ activeRangeShortText }}</span>
          </div>

          <div class="dash-date-tabs">
            <button type="button" :class="{ active: filterMode === 'day' }" @click="filterMode = 'day'">Ngày</button>
            <button type="button" :class="{ active: filterMode === 'week' }" @click="filterMode = 'week'">Tuần</button>
            <button type="button" :class="{ active: filterMode === 'month' }" @click="filterMode = 'month'">Tháng</button>
          </div>

          <div class="dash-date-picker__input-wrap">
            <input v-if="filterMode === 'day'" type="date" v-model="reportDate" class="dash-date-picker__input tabular-nums" />
            <input v-else-if="filterMode === 'week'" type="week" v-model="reportWeek" class="dash-date-picker__input tabular-nums" />
            <input v-else-if="filterMode === 'month'" type="month" v-model="reportMonth" class="dash-date-picker__input tabular-nums" />
          </div>

          <div class="dash-date-picker__actions">
            <button type="button" @click="setToday" class="dash-date-picker__btn" :class="{ 'dash-date-picker__btn--active': isToday }">
              {{ filterMode === 'day' ? 'Hôm nay' : filterMode === 'week' ? 'Tuần này' : 'Tháng này' }}
            </button>
            <button type="button" @click="setYesterday" class="dash-date-picker__btn" :class="{ 'dash-date-picker__btn--active': isYesterday }">
              {{ filterMode === 'day' ? 'Hôm qua' : filterMode === 'week' ? 'Tuần trước' : 'Tháng trước' }}
            </button>
          </div>
        </div>

        <div class="dash-sidebar__cards">
          <!-- Work Card -->
          <div
            class="dash-nav-card"
            :class="{ 'dash-nav-card--active': expandedSection === 'work' }"
            @click="expandedSection = 'work'"
          >
            <div class="dash-nav-card__indicator"></div>
            <div class="dash-nav-card__glow"></div>
            <div class="dash-nav-card__body">
              <div class="dash-nav-card__header">
                <div style="flex: 1; min-width: 0;">
                  <h3 class="dash-nav-card__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>Công Việc {{ periodTitleSuffix }}</span>
                  </h3>
                </div>
                <span class="dash-nav-card__total tabular-nums">{{ workData.total }}</span>
              </div>
              <div class="dash-nav-card__stats">
                <div class="dash-nav-card__stat">
                  <span class="dash-nav-card__stat-dot is-emerald"></span>
                  <span class="dash-nav-card__stat-label">Hoàn thành</span>
                  <span class="dash-nav-card__stat-value tabular-nums" :class="{ 'is-emerald-pill': workData.done.length > 0 }">
                    {{ workData.done.length }}
                  </span>
                </div>
                <div class="dash-nav-card__stat">
                  <span class="dash-nav-card__stat-dot is-amber"></span>
                  <span class="dash-nav-card__stat-label">Chưa xong</span>
                  <span class="dash-nav-card__stat-value tabular-nums" :class="{ 'dash-nav-card__stat-value--warn': workData.pending.length > 0 }">
                    {{ workData.pending.length }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quote Card -->
          <div
            class="dash-nav-card"
            :class="{ 'dash-nav-card--active': expandedSection === 'quote' }"
            @click="expandedSection = 'quote'"
          >
            <div class="dash-nav-card__indicator"></div>
            <div class="dash-nav-card__glow"></div>
            <div class="dash-nav-card__body">
              <div class="dash-nav-card__header">
                <div style="flex: 1; min-width: 0;">
                  <h3 class="dash-nav-card__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                    <span>Báo Giá Xử Lý</span>
                  </h3>
                </div>
                <span class="dash-nav-card__total tabular-nums">{{ quoteData.total }}</span>
              </div>
              <div class="dash-nav-card__stats">
                <div class="dash-nav-card__stat">
                  <span class="dash-nav-card__stat-dot is-emerald"></span>
                  <span class="dash-nav-card__stat-label">Đã chốt</span>
                  <span class="dash-nav-card__stat-value tabular-nums" :class="{ 'is-emerald-pill': quoteData.completed.length > 0 }">
                    {{ quoteData.completed.length }}
                  </span>
                </div>
                <div class="dash-nav-card__stat">
                  <span class="dash-nav-card__stat-dot is-blue"></span>
                  <span class="dash-nav-card__stat-label">Đang xử lý</span>
                  <span class="dash-nav-card__stat-value tabular-nums" :class="{ 'is-blue-pill': quoteData.pending.length > 0 }">
                    {{ quoteData.pending.length }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- License Gia Hạn & Hết Hiệu Lực Card -->
          <div
            class="dash-nav-card"
            :class="{ 'dash-nav-card--active': expandedSection === 'license' }"
            @click="expandedSection = 'license'"
          >
            <div class="dash-nav-card__indicator"></div>
            <div class="dash-nav-card__glow"></div>
            <div class="dash-nav-card__body">
              <div class="dash-nav-card__header">
                <div style="flex: 1; min-width: 0;">
                  <h3 class="dash-nav-card__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>License Gia Hạn &amp; Hết HL</span>
                  </h3>
                </div>
                <span class="dash-nav-card__total tabular-nums">{{ licenseData.total }}</span>
              </div>
              <div class="dash-nav-card__stats">
                <div class="dash-nav-card__stat">
                  <span class="dash-nav-card__stat-dot is-amber"></span>
                  <span class="dash-nav-card__stat-label">License gia hạn</span>
                  <span
                    class="dash-nav-card__stat-value tabular-nums"
                    :class="{ 'dash-nav-card__stat-value--warn': licenseData.renewal.length > 0 }"
                  >
                    {{ licenseData.renewal.length }}
                  </span>
                </div>
                <div class="dash-nav-card__stat">
                  <span class="dash-nav-card__stat-dot is-rose"></span>
                  <span class="dash-nav-card__stat-label">License hết hiệu lực</span>
                  <span
                    class="dash-nav-card__stat-value tabular-nums"
                    :class="{ 'dash-nav-card__stat-value--alert': licenseData.expiredGrace.length > 0 }"
                  >
                    {{ licenseData.expiredGrace.length }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ COLUMN 2: DETAILS PANE ═══ -->
      <div class="dash-detail-col" :class="{ 'dash-detail-col--expanded': isDetailExpanded }">
        <div class="dash-detail">
          <!-- WORK DETAIL -->
          <div v-if="expandedSection === 'work'" class="dash-detail__inner">
            <div class="dash-detail__banner is-work-banner">
              <h3 class="dash-detail__banner-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Chi Tiết Công Việc {{ periodTitleSuffix }}</span>
                <span class="dash-banner-count tabular-nums">{{ workData.total }}</span>
              </h3>
              <button
                v-if="isDetailExpanded"
                type="button"
                class="dash-banner-close-btn"
                @click="isDetailExpanded = false"
                aria-label="Thu gọn"
              >✕</button>
            </div>

            <div class="dash-detail__content dash-detail__content--2col">
              <div class="dash-detail__section">
                <h4 class="dash-detail__section-title is-emerald" @click="goToReport()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>Hoàn thành (<span class="tabular-nums">{{ workData.done.length }}</span>)</span>
                </h4>
                <ul v-if="workData.done.length > 0" class="dash-detail__list">
                  <li v-for="(item, idx) in workData.done" :key="item.id || idx" class="dash-detail__list-item" @click="goToReport(item)">
                    <span class="dash-detail__list-num is-emerald">
                      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </span>
                    <div class="dash-detail__item-text">
                      <div class="dash-detail__item-main">{{ item.noi_dung || item.thoi_gian }}</div>
                      <div v-if="item.thoi_gian && item.noi_dung" class="dash-detail__item-sub tabular-nums">{{ item.thoi_gian }}</div>
                    </div>
                  </li>
                </ul>
                <div v-else class="dash-detail__empty">Chưa có công việc hoàn thành trong mốc thời gian này.</div>
              </div>

              <div class="dash-detail__section">
                <h4 class="dash-detail__section-title is-amber" @click="goToReport()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>Chưa xong (<span class="tabular-nums">{{ workData.pending.length }}</span>)</span>
                </h4>
                <ul v-if="workData.pending.length > 0" class="dash-detail__list">
                  <li v-for="(item, idx) in workData.pending" :key="item.id || idx" class="dash-detail__list-item" @click="goToReport(item)">
                    <span class="dash-detail__list-num is-amber">
                      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </span>
                    <div class="dash-detail__item-text">
                      <div class="dash-detail__item-main">{{ item.noi_dung || item.thoi_gian }}</div>
                      <div v-if="item.thoi_gian && item.noi_dung" class="dash-detail__item-sub tabular-nums">{{ item.thoi_gian }}</div>
                    </div>
                  </li>
                </ul>
                <div v-else class="dash-detail__empty">Tuyệt vời! Không có công việc tồn đọng.</div>
              </div>
            </div>
          </div>

          <!-- QUOTE DETAIL -->
          <div v-else-if="expandedSection === 'quote'" class="dash-detail__inner">
            <div class="dash-detail__banner is-quote-banner">
              <h3 class="dash-detail__banner-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                <span>Chi Tiết Báo Giá Xử Lý</span>
                <span class="dash-banner-count tabular-nums">{{ quoteData.total }}</span>
              </h3>
              <button
                v-if="isDetailExpanded"
                type="button"
                class="dash-banner-close-btn"
                @click="isDetailExpanded = false"
                aria-label="Thu gọn"
              >✕</button>
            </div>

            <div class="dash-detail__content dash-detail__content--2col">
              <div class="dash-detail__section">
                <h4 class="dash-detail__section-title is-emerald" @click="goToQuote('COMPLETED')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                  <span>Đã chốt (<span class="tabular-nums">{{ quoteData.completed.length }}</span>)</span>
                </h4>
                <ul v-if="quoteData.completed.length > 0" class="dash-detail__list">
                  <li v-for="(item, idx) in quoteData.completed" :key="item.latest?.ma_hop_dong || idx" class="dash-detail__list-item" @click="goToQuote('COMPLETED', item)">
                    <span class="dash-detail__list-num is-emerald">
                      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                    </span>
                    <div class="dash-detail__item-text">
                      <div class="dash-detail__quote-title">Báo giá "{{ item.latest.content_of_contract_po || 'Không có tiêu đề' }}"</div>
                      <div class="dash-detail__quote-subtitle">{{ item.tenKh }} — {{ item.tenCty }}</div>
                    </div>
                  </li>
                </ul>
                <div v-else class="dash-detail__empty">Chưa có báo giá đã chốt trong mốc thời gian này.</div>
              </div>

              <div class="dash-detail__section">
                <h4 class="dash-detail__section-title is-blue" @click="goToQuote('PROCESSING')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>Đang xử lý (<span class="tabular-nums">{{ quoteData.pending.length }}</span>)</span>
                </h4>
                <ul v-if="quoteData.pending.length > 0" class="dash-detail__list">
                  <li v-for="(item, idx) in quoteData.pending" :key="item.latest?.ma_hop_dong || idx" class="dash-detail__list-item" @click="goToQuote('PROCESSING', item)">
                    <span class="dash-detail__list-num is-blue">
                      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </span>
                    <div class="dash-detail__item-text">
                      <div class="dash-detail__quote-title">Báo giá "{{ item.latest.content_of_contract_po || 'Không có tiêu đề' }}"</div>
                      <div class="dash-detail__quote-subtitle">{{ item.tenKh }} — {{ item.tenCty }}</div>
                    </div>
                  </li>
                </ul>
                <div v-else class="dash-detail__empty">Không có báo giá đang xử lý trong mốc thời gian này.</div>
              </div>
            </div>
          </div>

          <!-- LICENSE GIA HẠN & HẾT HIỆU LỰC DETAIL (Đồng bộ trang license-old-data-firebase) -->
          <div v-else-if="expandedSection === 'license'" class="dash-detail__inner">
            <div class="dash-detail__banner is-license-banner">
              <h3 class="dash-detail__banner-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>License Gia Hạn &amp; License Hết Hiệu Lực</span>
                <span class="dash-banner-count tabular-nums">{{ licenseData.total }}</span>
              </h3>
              <button
                v-if="isDetailExpanded"
                type="button"
                class="dash-banner-close-btn"
                @click="isDetailExpanded = false"
                aria-label="Thu gọn"
              >✕</button>
            </div>

            <!-- Compact Filter Strip -->
            <div class="dash-lic-toolbar">
              <div class="dash-lic-search">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  v-model="licenseSearch"
                  type="text"
                  class="dash-lic-search__input"
                  placeholder="Tìm công ty, License ID, tên sản phẩm, hãng, số PO..."
                />
                <button
                  v-if="licenseSearch"
                  type="button"
                  class="dash-lic-search__clear"
                  @click="licenseSearch = ''"
                  aria-label="Xóa từ khóa"
                >✕</button>
              </div>
              <div class="dash-lic-summary-pills tabular-nums">
                <button type="button" class="dash-lic-pill is-warn" @click="goToLicensePage(getRenewalColumnFilter())">
                  <span>Gia hạn: {{ filteredLicenseRenewal.length }}</span>
                </button>
                <button type="button" class="dash-lic-pill is-danger" @click="goToLicensePage('qua_hieu_luc')">
                  <span>Hết hiệu lực: {{ filteredLicenseExpiredGrace.length }}</span>
                </button>
              </div>
            </div>

            <div class="dash-detail__content dash-detail__content--2col">
              <!-- Cột 1: License gia hạn -->
              <div class="dash-detail__section">
                <div class="dash-section-head">
                  <h4 class="dash-detail__section-title is-amber" @click="goToLicensePage(getRenewalColumnFilter())">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>License gia hạn (<span class="tabular-nums">{{ filteredLicenseRenewal.length }}</span>)</span>
                  </h4>
                  <p class="dash-section-hint">Sắp hết hạn ≤ 90 ngày hoặc quá hạn bản quyền còn trong ân hạn</p>
                </div>

                <ul v-if="filteredLicenseRenewal.length > 0" class="dash-detail__list">
                  <li
                    v-for="(item, idx) in filteredLicenseRenewal"
                    :key="item.firebase_id || idx"
                    class="dash-lic-card"
                    @click="goToLicenseItem(item, item.daysLeftExp !== null && item.daysLeftExp < 0 ? 'qua_han' : '')"
                  >
                    <div class="dash-lic-card__top">
                      <div class="dash-lic-card__product">{{ item.PRODUCT_NAME || 'Sản phẩm bản quyền' }}</div>
                      <span
                        v-if="item.NHA_SAN_XUAT"
                        class="dash-lic-vendor"
                        :style="getVendorBadgeStyle(item.NHA_SAN_XUAT)"
                      >
                        {{ item.NHA_SAN_XUAT }}
                      </span>
                    </div>

                    <div class="dash-lic-card__company">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <span>{{ item.displayCompany }}</span>
                    </div>

                    <div class="dash-lic-card__meta tabular-nums">
                      <span v-if="item.LICENSE_ID" class="dash-lic-chip">ID: {{ item.LICENSE_ID }}</span>
                      <span v-if="item.SO_PO" class="dash-lic-chip is-po">PO #{{ item.SO_PO }}</span>
                      <span v-if="item.LICENSE_VOLUME" class="dash-lic-chip">SL: {{ item.LICENSE_VOLUME }}</span>
                    </div>

                    <div class="dash-lic-card__foot tabular-nums">
                      <div class="dash-lic-dates">
                        <span>Hết hạn: <strong>{{ item.EXPIRATION_TIME || '—' }}</strong></span>
                        <span v-if="item.SO_NGAY_HIEU_LUC" class="dash-lic-date-sep">•</span>
                        <span v-if="item.SO_NGAY_HIEU_LUC">Hiệu lực: <strong>{{ item.SO_NGAY_HIEU_LUC }}</strong></span>
                      </div>
                      <span
                        class="dash-days-pill"
                        :class="item.daysLeftExp !== null && item.daysLeftExp < 0 ? 'is-danger' : (item.daysLeftExp !== null && item.daysLeftExp <= 30 ? 'is-warn' : 'is-blue')"
                      >
                        {{ item.expTimeText }}
                      </span>
                    </div>
                  </li>
                </ul>
                <div v-else class="dash-detail__empty">
                  {{ licenseSearch ? 'Không tìm thấy License gia hạn khớp từ khóa.' : 'Không có License cần gia hạn trong mốc thời gian này.' }}
                </div>
              </div>

              <!-- Cột 2: License hết hiệu lực -->
              <div class="dash-detail__section">
                <div class="dash-section-head">
                  <h4 class="dash-detail__section-title is-rose" @click="goToLicensePage('qua_hieu_luc')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    <span>License hết hiệu lực (<span class="tabular-nums">{{ filteredLicenseExpiredGrace.length }}</span>)</span>
                  </h4>
                  <p class="dash-section-hint">Đã quá ngày hiệu lực gia hạn (ân hạn) và chưa xử lý</p>
                </div>

                <ul v-if="filteredLicenseExpiredGrace.length > 0" class="dash-detail__list">
                  <li
                    v-for="(item, idx) in filteredLicenseExpiredGrace"
                    :key="item.firebase_id || idx"
                    class="dash-lic-card is-expired-grace"
                    @click="goToLicenseItem(item, 'qua_hieu_luc')"
                  >
                    <div class="dash-lic-card__top">
                      <div class="dash-lic-card__product">{{ item.PRODUCT_NAME || 'Sản phẩm bản quyền' }}</div>
                      <span
                        v-if="item.NHA_SAN_XUAT"
                        class="dash-lic-vendor"
                        :style="getVendorBadgeStyle(item.NHA_SAN_XUAT)"
                      >
                        {{ item.NHA_SAN_XUAT }}
                      </span>
                    </div>

                    <div class="dash-lic-card__company">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <span>{{ item.displayCompany }}</span>
                    </div>

                    <div class="dash-lic-card__meta tabular-nums">
                      <span v-if="item.LICENSE_ID" class="dash-lic-chip">ID: {{ item.LICENSE_ID }}</span>
                      <span v-if="item.SO_PO" class="dash-lic-chip is-po">PO #{{ item.SO_PO }}</span>
                      <span v-if="item.LICENSE_VOLUME" class="dash-lic-chip">SL: {{ item.LICENSE_VOLUME }}</span>
                    </div>

                    <div class="dash-lic-card__foot tabular-nums">
                      <div class="dash-lic-dates">
                        <span v-if="item.EXPIRATION_TIME">Hết hạn: <strong>{{ item.EXPIRATION_TIME }}</strong></span>
                        <span v-if="item.EXPIRATION_TIME && item.SO_NGAY_HIEU_LUC" class="dash-lic-date-sep">•</span>
                        <span>Hết HL: <strong class="is-rose-txt">{{ item.SO_NGAY_HIEU_LUC || '—' }}</strong></span>
                      </div>
                      <span class="dash-days-pill is-danger">
                        {{ item.graceTimeText }}
                      </span>
                    </div>
                  </li>
                </ul>
                <div v-else class="dash-detail__empty">
                  {{ licenseSearch ? 'Không tìm thấy License hết hiệu lực khớp từ khóa.' : 'Tuyệt vời! Không có License nào hết hiệu lực chưa xử lý.' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FLOATING ACTIONS -->
        <div class="dash-floating-actions">
          <button type="button" class="dash-floating-btn dash-floating-btn--nav" @click="handleNavigate">
            <span>{{ navigateButtonLabel }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <button
            type="button"
            class="dash-floating-btn dash-floating-btn--expand"
            @click="isDetailExpanded = !isDetailExpanded"
            :title="isDetailExpanded ? 'Thu gọn' : 'Phóng to chi tiết'"
          >
            <svg v-if="!isDetailExpanded" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DashboardFirebase'
}
</script>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get } from 'firebase/database'
import { useBinaryAppTheme } from '../composables/useAppTheme'

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

// --- Dual Theme (Synced globally across all pages via useAppTheme) ---
const { uiTheme, toggleUiTheme } = useBinaryAppTheme()

// Lock parent scroll when Dashboard is active
onMounted(() => {
  const parent = document.querySelector('.main-content') as HTMLElement
  if (parent) {
    parent.style.overflow = 'hidden'
  }
})
onUnmounted(() => {
  const parent = document.querySelector('.main-content') as HTMLElement
  if (parent) {
    parent.style.overflow = ''
  }
})

const expandedSection = ref<'work' | 'quote' | 'license'>('work')
const isDetailExpanded = ref(false)
const licenseSearch = ref('')

const navigateButtonLabel = computed(() => {
  if (expandedSection.value === 'work') return 'Mở Báo Cáo Công Việc'
  if (expandedSection.value === 'quote') return 'Mở Quản Lý Báo Giá'
  return 'Mở Trang License'
})

const buildLicenseTimeQuery = (): Record<string, string> => {
  const q: Record<string, string> = { mode: filterMode.value }
  if (filterMode.value === 'day') q.date = reportDate.value
  else if (filterMode.value === 'week') q.week = reportWeek.value
  else if (filterMode.value === 'month') q.month = reportMonth.value
  return q
}

const getRenewalColumnFilter = () => {
  const list = licenseData.value.renewal
  if (!list.length) return ''
  const hasOverdue = list.some(i => i.daysLeftExp !== null && i.daysLeftExp < 0)
  const hasUpcoming = list.some(i => i.daysLeftExp !== null && i.daysLeftExp >= 0)
  if (hasOverdue && !hasUpcoming) return 'qua_han'
  if (!hasOverdue && hasUpcoming) return 'renewal'
  return ''
}

const handleNavigate = () => {
  if (expandedSection.value === 'work') goToReport()
  else if (expandedSection.value === 'quote') goToQuote('ALL')
  else if (expandedSection.value === 'license') goToLicensePage()
}

const goToReport = (item?: any) => {
  if (item && item.id) {
    router.push({ path: '/report-firebase', query: { date: reportDate.value, id: item.id } })
  } else {
    router.push({ path: '/report-firebase', query: { date: reportDate.value } })
  }
}

const goToQuote = (status: string, item?: any) => {
  if (item && item.latest) {
    router.push({ path: '/quanlybaogiafirebase', query: { tab: 'baogia', dashboard: status, search: item.latest.content_of_contract_po || item.latest.ma_hop_dong } })
  } else {
    router.push({ path: '/quanlybaogiafirebase', query: { tab: 'baogia', dashboard: status } })
  }
}

const goToLicensePage = (filter?: string) => {
  const query: Record<string, string> = buildLicenseTimeQuery()
  if (filter) query.filter = filter
  if (licenseSearch.value.trim()) query.search = licenseSearch.value.trim()
  router.push({ path: '/license-old-data-firebase', query })
}

const goToLicenseItem = (item: any, filter?: string) => {
  const query: Record<string, string> = buildLicenseTimeQuery()
  if (filter) query.filter = filter
  const searchVal = String(item?.LICENSE_ID || item?.PRODUCT_NAME || item?.displayCompany || '').trim()
  if (searchVal) query.search = searchVal
  router.push({ path: '/license-old-data-firebase', query })
}

const loading = ref(true)

// Data references
const reports = ref<any[]>([])
const quotes = ref<any[]>([])
const licenses = ref<any[]>([])
const customers = ref<any[]>([])

function toNum(v: any, def = 0): number {
  if (v === null || v === undefined || v === '') return def
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : def
}

const removeDiacritics = (str: string) => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

const normalizeForSearch = (str: any) => {
  if (!str) return ''
  return removeDiacritics(String(str)).toLowerCase().replace(/[^a-z0-9]/g, '')
}

const excelDateToJSDate = (serial: number) => {
  if (!serial || isNaN(serial)) return null
  const days = Math.floor(serial - 25569)
  return new Date(days * 86400 * 1000)
}

const formatFirebaseLicenseDate = (val: any): string => {
  if (val === null || val === undefined || val === '') return ''
  if (typeof val === 'number' || (!isNaN(Number(val)) && Number(val) > 10000 && !String(val).includes('/') && !String(val).includes('-'))) {
    const d = excelDateToJSDate(Number(val))
    if (d && !isNaN(d.getTime())) {
      const day = String(d.getUTCDate()).padStart(2, '0')
      const month = String(d.getUTCMonth() + 1).padStart(2, '0')
      const year = d.getUTCFullYear()
      return `${day}/${month}/${year}`
    }
  }
  const str = String(val).trim()
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split('/')
    return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`
  }
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (ymdMatch) {
    return `${ymdMatch[3].padStart(2, '0')}/${ymdMatch[2].padStart(2, '0')}/${ymdMatch[1]}`
  }
  const d = new Date(str)
  if (!isNaN(d.getTime()) && (str.includes('-') || str.includes('T'))) {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }
  return str
}

const parseLicenseDate = (dateStr: any): Date | null => {
  if (!dateStr) return null
  const str = String(dateStr).trim()
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
    d.setHours(0, 0, 0, 0)
    return isNaN(d.getTime()) ? null : d
  }
  const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (ymd) {
    const d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
    d.setHours(0, 0, 0, 0)
    return isNaN(d.getTime()) ? null : d
  }
  const fallback = new Date(str)
  if (isNaN(fallback.getTime())) return null
  fallback.setHours(0, 0, 0, 0)
  return fallback
}

function fbHopDongTongQuatToRow(item: any, fbKey = ''): any[] {
  if (Array.isArray(item)) {
    const r = item.slice(0, 37)
    while (r.length < 37) r.push('')
    return r
  }
  if (!item || typeof item !== 'object') return new Array(37).fill('')
  return [
    String(item.ma_hop_dong ?? item.Ma_hop_dong ?? fbKey ?? ''),
    String(item.so_hop_dong ?? item.So_hop_dong ?? ''),
    String(item.ma_khach_hang ?? item.Ma_khach_hang ?? ''),
    String(item.ten_khach_hang ?? item.Ten_khach_hang ?? ''),
    String(item.ngay_tao_hop_dong ?? item.ngay_tao ?? item.ngay_tao_date ?? item.ngay_ky ?? ''),
    toNum(item.Tong_tien_truoc_thueVAT ?? item.tong_truoc_vat ?? item.tong_truoc_vat_goc ?? item.tong_tien, 0),
    toNum(item.Tong_thueVAT ?? item.tong_vat, 0),
    toNum(item.Tong_tien_sau_thueVAT ?? item.tong_sau_vat ?? item.tong_tien, 0),
    toNum(item.Tong_giam_gia, 0),
    toNum(item.Tong_cong ?? item.Tong_tien_sau_thueVAT ?? item.tong_sau_vat, 0),
    toNum(item.Tong_thanh_toan ?? item.da_thanh_toan, 0),
    toNum(item.Tong_hoa_hong_khach_hang, 0),
    toNum(item.Tong_hoa_hong_ca_nhan, 0),
    toNum(item.Cong_no_cu, 0),
    String(item.Trang_thai_thanh_toan ?? item.trang_thai_thanh_toan ?? 'Chưa thanh toán đủ'),
    String(item.Trang_thai_hop_dong ?? item['Trang_thai_hop_dong '] ?? item.loai_hop_dong ?? item.trang_thai_hop_dong ?? ''),
    String(item.Ghi_chu ?? item.ghi_chu ?? ''),
    String(item.Don_vi_tien_te ?? item.don_vi_tien_te ?? 'VND'),
    toNum(item.Ti_gia ?? item.ti_gia, 1),
    String(item.ma_hop_dong_cu ?? ''),
    toNum(item.Tong_gia_thuc_te ?? item.tong_gia_thuc_te, 0),
    String(item.created_time ?? ''),
    String(item.So_PO ?? item.so_po ?? ''),
    String(item.Ten_PO ?? item.ten_po ?? item.po_content ?? ''),
    String(item['content_of_contract/PO'] ?? item.content_of_contract_PO ?? item.content_of_contract_po ?? item.content_po ?? item.content ?? item.ten_hop_dong ?? ''),
    toNum(item.chiet_khau_tong_truoc_thue ?? item.gross_com, 0),
    toNum(item.phan_tram_chiet_khau_tong_truoc_thue ?? item.phan_tram_chiet_khau, 0),
    toNum(item.thue_chenh_lech_gia, 0),
    toNum(item.phan_tram_thue_chenh_lech_gia ?? item.phan_tram_thue, 0),
    toNum(item.chenh_lech_gia, 0),
    toNum(item.con_lai, 0),
    toNum(item.tong_chiet_khau, 0),
    String(item.ma_hop_dong_goc ?? item.ma_hop_dong ?? fbKey ?? ''),
    item.isCompleted === true || String(item.isCompleted).toUpperCase() === 'TRUE',
    String(item.ten_file ?? ''),
    String(item.link_file ?? ''),
    String(item.structure ?? '')
  ]
}

function fbKhachHangToRow(item: any, fbKey = ''): any[] {
  if (Array.isArray(item)) {
    const r = item.slice(0, 23)
    while (r.length < 23) r.push('')
    return r
  }
  if (!item || typeof item !== 'object') return new Array(23).fill('')
  return [
    String(item.ma_khach_hang ?? item.Ma_khach_hang ?? fbKey ?? ''),
    String(item.ten_khach_hang ?? item.Ten_khach_hang ?? ''),
    String(item.email_ca_nhan ?? item.Email_ca_nhan ?? ''),
    String(item.so_dien_thoai_ca_nhan ?? item.So_dien_thoai_ca_nhan ?? ''),
    String(item.ma_cong_ty ?? item.Ma_cong_ty ?? ''),
    String(item.ten_cong_ty ?? item.Ten_cong_ty ?? ''),
    String(item.so_dien_thoai_cong_ty ?? item.So_dien_thoai_cong_ty ?? ''),
    String(item.so_fax_cong_ty ?? item.So_fax_cong_ty ?? ''),
    String(item.dia_chi_cong_ty ?? item.Dia_chi_cong_ty ?? ''),
    String(item.email_cong_ty ?? item.Email_cong_ty ?? ''),
    String(item.website_cong_ty ?? item.Website_cong_ty ?? ''),
    String(item.hoa_hong ?? item.Hoa_hong ?? ''),
    String(item.tong_chi_tieu ?? item.Tong_chi_tieu ?? ''),
    String(item.tong_loi_nhuan ?? item.Tong_loi_nhuan ?? ''),
    String(item.trang_thai ?? item.Trang_thai ?? ''),
    String(item.ghi_chu ?? item.Ghi_chu ?? ''),
    String(item.ten_khach_hang_phu ?? item.Ten_khach_hang_phu ?? ''),
    String(item.so_dien_thoai_ca_nhan_phu ?? item.So_dien_thoai_ca_nhan_phu ?? ''),
    String(item.email_ca_nhan_phu ?? item.Email_ca_nhan_phu ?? ''),
    String(item.mst ?? item.MST ?? ''),
    String(item.company ?? item.COMPANY ?? ''),
    String(item.address ?? item.ADDRESS ?? ''),
    String(item.tel ?? item.TEL ?? '')
  ]
}

async function fetchReportsFromFirebase(): Promise<any[]> {
  try {
    const snap = await get(dbRef(database, 'REPORT'))
    if (!snap.exists()) return []
    const val = snap.val()
    if (!val || typeof val !== 'object') return []
    const data: any[] = []
    const keyMap: Record<string, string> = {
      'GHI_CHU': 'ghi_chu',
      'NOI_DUNG': 'noi_dung',
      'PHAN_LOAI': 'phan_loai',
      'TAG': 'tag',
      'THOI_GIAN': 'thoi_gian',
      'TRANG_THAI': 'trang_thai',
      'CREATED_TIME': 'created_time',
      'reminder-time': 'reminder_time',
      'reminder-content': 'reminder_content',
      'reminder-visible': 'reminder_visible',
      'MAKH': 'maKH',
      'ma_khach_hang': 'maKH',
      'maKH': 'maKH',
      'ID_QUANLYFILE': 'id_quanlyfile',
      'id_quan_ly_file': 'id_quanlyfile',
      'id_quanlyfile': 'id_quanlyfile'
    }
    for (const k in val) {
      if (!val[k] || typeof val[k] !== 'object') continue
      const item: any = { ...val[k], id: k }
      delete item.action
      for (const oldKey in keyMap) {
        const newKey = keyMap[oldKey]
        if (item[oldKey] !== undefined) {
          item[newKey] = item[oldKey]
        }
      }
      data.push(item)
    }
    return data.sort((a, b) => String(b.id).localeCompare(String(a.id)))
  } catch (e) {
    console.error('Lỗi đọc REPORT từ Firebase:', e)
    return []
  }
}

async function fetchHopDongTongQuatFromFirebase(): Promise<any[][]> {
  try {
    const snap = await get(dbRef(database, 'hop_dong_tong_quat'))
    const data = snap.val()
    if (!data || typeof data !== 'object') return []
    return Object.entries(data).map(([k, v]) => fbHopDongTongQuatToRow(v, k))
  } catch (e) {
    console.error('Lỗi đọc hop_dong_tong_quat từ Firebase:', e)
    return []
  }
}

async function fetchLicenseOldDataFromFirebase(): Promise<Record<string, any>> {
  try {
    const snap = await get(dbRef(database, 'license_old_data'))
    if (!snap.exists()) return {}
    const data = snap.val()
    return data && typeof data === 'object' ? data : {}
  } catch (e) {
    console.error('Lỗi đọc license_old_data từ Firebase:', e)
    return {}
  }
}

async function fetchKhachHangRowsFromFirebase(): Promise<any[][]> {
  try {
    const snap = await get(dbRef(database, 'khach_hang'))
    const data = snap.val()
    if (!data || typeof data !== 'object') return []
    return Object.entries(data).map(([k, v]) => fbKhachHangToRow(v, k))
  } catch (e) {
    console.error('Lỗi đọc khach_hang từ Firebase:', e)
    return []
  }
}

// Date Utils (local timezone safe)
const formatLocalYMD = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatLocalDMY = (d: Date) => {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const getTodayStr = () => formatLocalYMD(new Date())

const getThisMonthStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const getWeekString = (d: Date) => {
  const date = new Date(d.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`
}

const getWeekDateRange = (weekStr: string) => {
  const [year, week] = weekStr.split('-W').map(Number)
  const d = new Date(year, 0, 4)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1 + (week - 1) * 7)
  const from = new Date(d)
  from.setHours(0, 0, 0, 0)
  const to = new Date(d)
  to.setDate(to.getDate() + 6)
  to.setHours(23, 59, 59, 999)
  return { from, to }
}

// Mặc định hiển thị theo TUẦN
const filterMode = ref<'day' | 'week' | 'month'>('week')
const reportDate = ref(getTodayStr())
const reportWeek = ref(getWeekString(new Date()))
const reportMonth = ref(getThisMonthStr())

const periodTitleSuffix = computed(() => {
  if (filterMode.value === 'day') return 'Hôm Nay'
  if (filterMode.value === 'week') return 'Tuần Này'
  return 'Tháng Này'
})

const activeRangeBadgeText = computed(() => {
  const range = getFilterRange()
  if (filterMode.value === 'day') {
    return `Ngày ${formatLocalDMY(range.start)}`
  }
  if (filterMode.value === 'week') {
    const weekNum = reportWeek.value.split('-W')[1] || ''
    return `Tuần ${weekNum} · ${formatLocalDMY(range.start)} – ${formatLocalDMY(range.end)}`
  }
  const [y, m] = reportMonth.value.split('-')
  return `Tháng ${m}/${y}`
})

const activeRangeShortText = computed(() => {
  const range = getFilterRange()
  if (filterMode.value === 'day') return formatLocalDMY(range.start)
  if (filterMode.value === 'week') {
    const s = `${String(range.start.getDate()).padStart(2, '0')}/${String(range.start.getMonth() + 1).padStart(2, '0')}`
    const e = `${String(range.end.getDate()).padStart(2, '0')}/${String(range.end.getMonth() + 1).padStart(2, '0')}`
    return `${s} – ${e}`
  }
  const [y, m] = reportMonth.value.split('-')
  return `Tháng ${m}/${y}`
})

const setToday = () => {
  if (filterMode.value === 'day') reportDate.value = getTodayStr()
  else if (filterMode.value === 'week') reportWeek.value = getWeekString(new Date())
  else if (filterMode.value === 'month') reportMonth.value = getThisMonthStr()
}

const setYesterday = () => {
  const d = new Date()
  if (filterMode.value === 'day') {
    d.setDate(d.getDate() - 1)
    reportDate.value = formatLocalYMD(d)
  } else if (filterMode.value === 'week') {
    d.setDate(d.getDate() - 7)
    reportWeek.value = getWeekString(d)
  } else if (filterMode.value === 'month') {
    d.setMonth(d.getMonth() - 1)
    reportMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
}

const isToday = computed(() => {
  if (filterMode.value === 'day') return reportDate.value === getTodayStr()
  if (filterMode.value === 'week') return reportWeek.value === getWeekString(new Date())
  if (filterMode.value === 'month') return reportMonth.value === getThisMonthStr()
  return false
})

const isYesterday = computed(() => {
  const d = new Date()
  if (filterMode.value === 'day') {
    d.setDate(d.getDate() - 1)
    return reportDate.value === formatLocalYMD(d)
  }
  if (filterMode.value === 'week') {
    d.setDate(d.getDate() - 7)
    return reportWeek.value === getWeekString(d)
  }
  if (filterMode.value === 'month') {
    d.setMonth(d.getMonth() - 1)
    return reportMonth.value === `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  return false
})

const fetchData = async () => {
  loading.value = true
  try {
    const [rawReports, rawQuotes, rawLicenseMap, rawCustomers] = await Promise.all([
      fetchReportsFromFirebase(),
      fetchHopDongTongQuatFromFirebase(),
      fetchLicenseOldDataFromFirebase(),
      fetchKhachHangRowsFromFirebase()
    ])

    reports.value = rawReports || []

    quotes.value = (rawQuotes || []).map((r: any) => ({
      ma_hop_dong: String(r[0] || ''),
      so_hop_dong: String(r[1] || ''),
      ma_khach_hang: String(r[2] || ''),
      ten_khach_hang: String(r[3] || ''),
      ngay_tao: String(r[4] || ''),
      ghi_chu: String(r[16] || ''),
      content_of_contract_po: String(r[24] || ''),
      ma_hop_dong_goc: String(r[32] || ''),
      trang_thai_hop_dong: String(r[15] || ''),
      trang_thai: String(r[15] || ''),
      is_completed: r[33] === true || r[33] === 'true' || r[33] === 'TRUE' || String(r[15] || '') === 'Chính thức'
    })).filter((q: any) => q.ma_hop_dong)

    const parsedCustomers = (rawCustomers || []).map((r: any) => ({
      ma_khach_hang: String(r[0] || ''),
      ten_khach_hang: String(r[1] || ''),
      ten_cong_ty: String(r[5] || '')
    }))
    customers.value = parsedCustomers

    // Chuẩn hóa dữ liệu license_old_data đồng bộ 100% với LicenseOldDataFirebase.vue
    const licRows: any[] = []
    const vendorToDbCustMap = new Map<string, { maKh: string; tenCongTy: string; tenKhachHang: string }>()

    for (const [key, item] of Object.entries(rawLicenseMap || {})) {
      if (!item || typeof item !== 'object') continue
      let maKh = String(item.MA_KHACH_HANG || item.ma_khach_hang || '').trim()
      let tenCongTy = String(item.TEN_CONG_TY || item.ten_cong_ty || '').trim()
      let tenKhachHang = String(item.TEN_KHACH_HANG || item.ten_khach_hang || '').trim()

      if (maKh || tenCongTy) {
        const normComp = normalizeForSearch(tenCongTy)
        const foundCust = parsedCustomers.find(
          c => (maKh && c.ma_khach_hang === maKh) || (normComp && normalizeForSearch(c.ten_cong_ty) === normComp)
        )
        if (foundCust) {
          if (!maKh) maKh = foundCust.ma_khach_hang || ''
          if (!tenCongTy) tenCongTy = foundCust.ten_cong_ty || ''
          if (!tenKhachHang) tenKhachHang = foundCust.ten_khach_hang || ''
        }
      }

      const rowObj = {
        firebase_id: key,
        LICENSE_ID: String(item.LICENSE_ID || item.lICENSE_ID || '').trim(),
        CUSTOMER: String(item.CUSTOMER || '').trim(),
        MA_KHACH_HANG: maKh,
        TEN_CONG_TY: tenCongTy,
        TEN_KHACH_HANG: tenKhachHang,
        SO_PO: String(item.SO_PO || item.so_po || '').trim(),
        PRODUCT_NAME: String(item.PRODUCT_NAME || '').trim(),
        PRODUCT_CODE: String(item.PRODUCT_CODE || '').trim(),
        LICENSE_VOLUME: String(item.LICENSE_VOLUME || '').trim(),
        LICENSE_TYPE: String(item.LICENSE_TYPE || '').trim(),
        DATE_OF_LICENSE: formatFirebaseLicenseDate(item.DATE_OF_LICENSE),
        EXPIRATION_TIME: formatFirebaseLicenseDate(item.EXPIRATION_TIME),
        SO_NGAY_HIEU_LUC: formatFirebaseLicenseDate(item.SO_NGAY_HIEU_LUC || item.so_ngay_hieu_luc),
        NHA_SAN_XUAT: String(item.NHA_SAN_XUAT || item.nha_san_xuat || '').trim(),
        IS_GIA_HAN: String(item.IS_GIA_HAN || item.is_gia_han || '').trim()
      }
      licRows.push(rowObj)

      const normVendor = normalizeForSearch(rowObj.CUSTOMER)
      if (normVendor && (rowObj.MA_KHACH_HANG || rowObj.TEN_CONG_TY) && !vendorToDbCustMap.has(normVendor)) {
        vendorToDbCustMap.set(normVendor, {
          maKh: rowObj.MA_KHACH_HANG,
          tenCongTy: rowObj.TEN_CONG_TY,
          tenKhachHang: rowObj.TEN_KHACH_HANG
        })
      }
    }

    for (const r of licRows) {
      if (!r.MA_KHACH_HANG && !r.TEN_CONG_TY && r.CUSTOMER) {
        const inherited = vendorToDbCustMap.get(normalizeForSearch(r.CUSTOMER))
        if (inherited) {
          r.MA_KHACH_HANG = inherited.maKh
          r.TEN_CONG_TY = inherited.tenCongTy
          r.TEN_KHACH_HANG = inherited.tenKhachHang
        }
      }
      r.displayCompany = String(r.TEN_CONG_TY || r.CUSTOMER || 'KHÁCH HÀNG ẨN DANH').trim()
    }

    licenses.value = licRows
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu dashboard từ Firebase:', error)
  } finally {
    loading.value = false
  }
}

const formatDateDDMMYYYY = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const parseDateFromReport = (thoi_gian: string) => {
  try {
    const parts = thoi_gian.split(' /')
    if (parts.length === 3) {
      const timePart = parts[0]
      const datePart = parts[2]
      const [hour, minute] = timePart.split(':')
      const [d, m, y] = datePart.split('/')
      return new Date(Number(y), Number(m) - 1, Number(d), Number(hour), Number(minute))
    }
  } catch (e) {}
  return null
}

const parseDateFromQuote = (ngay_tao: string) => {
  try {
    if (!ngay_tao) return null

    const match = ngay_tao.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (match) {
      return new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10))
    }

    const matchDash = ngay_tao.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (matchDash) {
      return new Date(parseInt(matchDash[1], 10), parseInt(matchDash[2], 10) - 1, parseInt(matchDash[3], 10))
    }

    const native = new Date(ngay_tao)
    if (!isNaN(native.getTime())) {
      return native
    }
  } catch (e) {
    console.error('Error parsing quote date:', ngay_tao, e)
  }
  return null
}

const getFilterRange = () => {
  if (filterMode.value === 'day') {
    const [y, m, day] = reportDate.value.split('-').map(Number)
    const d = new Date(y, (m || 1) - 1, day || 1, 0, 0, 0, 0)
    const end = new Date(y, (m || 1) - 1, day || 1, 23, 59, 59, 999)
    return { start: d, end }
  } else if (filterMode.value === 'week') {
    const range = getWeekDateRange(reportWeek.value)
    return { start: range.from, end: range.to }
  } else if (filterMode.value === 'month') {
    const [y, m] = reportMonth.value.split('-')
    const start = new Date(Number(y), Number(m) - 1, 1, 0, 0, 0, 0)
    const end = new Date(Number(y), Number(m), 0, 23, 59, 59, 999)
    return { start, end }
  }
  return { start: new Date(), end: new Date() }
}

const formatLicenseRangeText = (
  targetDateObj: Date | null,
  baseStart: Date,
  baseEnd: Date,
  kind: 'exp' | 'grace'
) => {
  if (!targetDateObj) return '—'
  const daysLeftStart = Math.round((targetDateObj.getTime() - baseStart.getTime()) / 86400000)
  const daysLeftEnd = Math.round((targetDateObj.getTime() - baseEnd.getTime()) / 86400000)
  const overduePrefix = kind === 'exp' ? 'Quá hạn' : 'Hết'
  const zeroText = kind === 'exp' ? 'Hết hạn hôm nay' : 'Hết HL hôm nay'

  if (filterMode.value === 'day') {
    if (daysLeftEnd < 0) return `${overduePrefix} ${Math.abs(daysLeftEnd)} ngày`
    if (daysLeftEnd === 0) return zeroText
    return `Còn ${daysLeftEnd} ngày`
  }

  if (daysLeftStart < 0 && daysLeftEnd < 0) {
    return `${overduePrefix} ${Math.abs(daysLeftStart)} - ${Math.abs(daysLeftEnd)} ngày`
  }
  if (daysLeftStart >= 0 && daysLeftEnd >= 0) {
    return `Còn ${daysLeftEnd} - ${daysLeftStart} ngày`
  }
  return `Còn ${daysLeftStart} ngày → ${overduePrefix} ${Math.abs(daysLeftEnd)} ngày`
}

const getVendorBadgeStyle = (nsx: string) => {
  if (!nsx) return {}
  const name = nsx.toLowerCase()
  if (name.includes('sophos')) return { background: '#1d4ed8', color: '#ffffff', borderColor: '#3b82f6' }
  if (name.includes('kaspersky')) return { background: '#047857', color: '#ffffff', borderColor: '#10b981' }
  if (name.includes('acronis')) return { background: '#1e3a8a', color: '#ffffff', borderColor: '#60a5fa' }
  if (name.includes('delinea')) return { background: '#6d28d9', color: '#ffffff', borderColor: '#a78bfa' }
  return {}
}

// ------------------------------------------------------------------
// VISUAL DATA COMPUTED PROPERTIES
// ------------------------------------------------------------------
const workData = computed(() => {
  const range = getFilterRange()

  const todaysWork = reports.value.filter(r => {
    const d = parseDateFromReport(r.thoi_gian || '')
    if (!d) return false
    return d >= range.start && d <= range.end
  })

  const done = todaysWork.filter(r => r.trang_thai === 'Hoàn thành')
  const pending = todaysWork.filter(r => r.trang_thai !== 'Hoàn thành')

  return { done, pending, total: todaysWork.length }
})

const quoteData = computed(() => {
  const range = getFilterRange()

  const todaysQuotes = quotes.value.filter(q => {
    const d = parseDateFromQuote(q.ngay_tao || '')
    if (!d) return false
    return d >= range.start && d <= range.end
  })

  const map = new Map<string, any[]>()
  todaysQuotes.forEach(c => {
    const goc = c.ma_hop_dong_goc
    if (goc) {
      if (!map.has(goc)) map.set(goc, [])
      if (!map.get(goc)!.find(v => v.ma_hop_dong === c.ma_hop_dong)) {
        map.get(goc)!.push(c)
      }
    }
  })
  todaysQuotes.forEach(c => {
    if (map.has(c.ma_hop_dong) && !map.get(c.ma_hop_dong)!.find(v => v.ma_hop_dong === c.ma_hop_dong)) {
      map.get(c.ma_hop_dong)!.unshift(c)
    }
  })

  const groupedContracts: any[] = []
  map.forEach((versions, goc) => {
    if (versions.length > 0) {
      versions.sort((a, b) => {
        const vA = parseInt((a.ma_hop_dong?.split('V')[1] || '1'))
        const vB = parseInt((b.ma_hop_dong?.split('V')[1] || '1'))
        return vB - vA
      })
      groupedContracts.push({ goc, latest: versions[0], versions })
    }
  })

  const groupedIds = new Set<string>()
  groupedContracts.forEach(g => {
    g.versions.forEach((v: any) => groupedIds.add(v.ma_hop_dong))
  })
  const standaloneContracts = todaysQuotes.filter(c => !groupedIds.has(c.ma_hop_dong))

  const processItem = (item: any, isGroup: boolean) => {
    const latest = isGroup ? item.latest : item
    const isCompleted = latest.trang_thai === 'Chính thức' && latest.is_completed
    const isProcessing = latest.trang_thai === 'Tạm' && !latest.is_completed

    let tenKh = 'Không rõ'
    let tenCty = 'Không rõ'
    if (latest.ma_khach_hang) {
      const kh = customers.value.find(k => k.ma_khach_hang === latest.ma_khach_hang)
      if (kh) {
        tenKh = kh.ten_khach_hang || tenKh
        tenCty = kh.ten_cong_ty || tenCty
      }
    }
    return { latest, isCompleted, isProcessing, tenKh, tenCty }
  }

  const allProcessed = [
    ...groupedContracts.map(g => processItem(g, true)),
    ...standaloneContracts.map(c => processItem(c, false))
  ]

  const completed = allProcessed.filter(g => g.isCompleted)
  const pending = allProcessed.filter(g => g.isProcessing)

  return { completed, pending, total: completed.length + pending.length }
})

// Đồng bộ quy tắc từ LicenseOldDataFirebase.vue:
// - Loại trừ các bản ghi đã xử lý (IS_GIA_HAN = 'Đã gia hạn' | 'Không gia hạn')
// - License hết hiệu lực: SO_NGAY_HIEU_LUC < targetDate (trùng khớp 100% kpiStats.quaHieuLuc)
// - License gia hạn: Chưa hết hiệu lực (SO_NGAY_HIEU_LUC >= targetDate hoặc trống) và EXPIRATION_TIME <= 90 ngày (bao gồm quá hạn bản quyền nhưng còn ân hạn)
const licenseData = computed(() => {
  const range = getFilterRange()
  const baseStart = new Date(range.start)
  baseStart.setHours(0, 0, 0, 0)
  const baseEnd = new Date(range.end)
  baseEnd.setHours(0, 0, 0, 0)
  const targetTime = baseEnd.getTime()

  const renewal: any[] = []
  const expiredGrace: any[] = []

  for (const item of licenses.value) {
    if (item.IS_GIA_HAN) continue

    const dExp = parseLicenseDate(item.EXPIRATION_TIME)
    const dGrace = parseLicenseDate(item.SO_NGAY_HIEU_LUC)

    const daysLeftExp = dExp ? Math.round((dExp.getTime() - targetTime) / 86400000) : null
    const daysLeftGrace = dGrace ? Math.round((dGrace.getTime() - targetTime) / 86400000) : null

    const expTimeText = formatLicenseRangeText(dExp, baseStart, baseEnd, 'exp')
    const graceTimeText = formatLicenseRangeText(dGrace, baseStart, baseEnd, 'grace')

    const enriched = {
      ...item,
      daysLeftExp,
      daysLeftGrace,
      expTimeText,
      graceTimeText
    }

    if (dGrace && dGrace.getTime() < targetTime) {
      expiredGrace.push(enriched)
    } else if (dExp && daysLeftExp !== null && daysLeftExp <= 90) {
      renewal.push(enriched)
    }
  }

  renewal.sort((a, b) => (a.daysLeftExp ?? 99999) - (b.daysLeftExp ?? 99999))
  expiredGrace.sort((a, b) => (a.daysLeftGrace ?? 99999) - (b.daysLeftGrace ?? 99999))

  return {
    renewal,
    expiredGrace,
    total: renewal.length + expiredGrace.length
  }
})

const matchesLicenseSearch = (item: any, normQuery: string) => {
  if (!normQuery) return true
  const haystack = normalizeForSearch(
    `${item.displayCompany || ''} ${item.CUSTOMER || ''} ${item.TEN_CONG_TY || ''} ${item.MA_KHACH_HANG || ''} ${item.LICENSE_ID || ''} ${item.PRODUCT_NAME || ''} ${item.PRODUCT_CODE || ''} ${item.NHA_SAN_XUAT || ''} ${item.SO_PO || ''}`
  )
  return haystack.includes(normQuery)
}

const filteredLicenseRenewal = computed(() => {
  const q = normalizeForSearch(licenseSearch.value)
  if (!q) return licenseData.value.renewal
  return licenseData.value.renewal.filter(item => matchesLicenseSearch(item, q))
})

const filteredLicenseExpiredGrace = computed(() => {
  const q = normalizeForSearch(licenseSearch.value)
  if (!q) return licenseData.value.expiredGrace
  return licenseData.value.expiredGrace.filter(item => matchesLicenseSearch(item, q))
})

// ------------------------------------------------------------------
// TEXT REPORT COMPUTED PROPERTIES (For Copying)
// ------------------------------------------------------------------
const workReportText = computed(() => {
  const range = getFilterRange()
  let titleStr = ''
  if (filterMode.value === 'day') {
    titleStr = `NGÀY ${formatDateDDMMYYYY(reportDate.value)}`
  } else if (filterMode.value === 'week') {
    titleStr = `TỪ NGÀY ${formatLocalDMY(range.start)} ĐẾN NGÀY ${formatLocalDMY(range.end)}`
  } else {
    titleStr = `THÁNG ${reportMonth.value.split('-')[1]}/${reportMonth.value.split('-')[0]}`
  }

  const textLines: string[] = []
  textLines.push(`BÁO CÁO CÔNG VIỆC ${titleStr}`)
  textLines.push(`Tổng : ${workData.value.total} việc `)

  textLines.push(`Hoàn Thành ( ${workData.value.done.length} )  : `)
  if (workData.value.done.length === 0) textLines.push('  (Không có)')
  workData.value.done.forEach((r, idx) => {
    textLines.push(`${idx + 1}. ${r.noi_dung}`)
    if (r.ghi_chu) textLines.push(`  - ${r.ghi_chu.replace(/\n/g, ' ')}`)
  })

  textLines.push(`Chưa hoàn thành ( ${workData.value.pending.length} )  : `)
  if (workData.value.pending.length === 0) textLines.push('  (Không có)')
  workData.value.pending.forEach((r, idx) => {
    textLines.push(`${idx + 1}. ${r.noi_dung}`)
    if (r.ghi_chu) textLines.push(`  - ${r.ghi_chu.replace(/\n/g, ' ')}`)
  })

  return textLines.join('\n')
})

const quoteReportText = computed(() => {
  const range = getFilterRange()
  let titleStr = ''
  if (filterMode.value === 'day') {
    titleStr = `NGÀY ${formatDateDDMMYYYY(reportDate.value)}`
  } else if (filterMode.value === 'week') {
    titleStr = `TỪ NGÀY ${formatLocalDMY(range.start)} ĐẾN NGÀY ${formatLocalDMY(range.end)}`
  } else {
    titleStr = `THÁNG ${reportMonth.value.split('-')[1]}/${reportMonth.value.split('-')[0]}`
  }

  const textLines: string[] = []
  textLines.push(`BÁO CÁO BÁO GIÁ ${titleStr}`)
  textLines.push(`Tổng xử lý : ${quoteData.value.total} báo giá `)

  textLines.push('Đã hoàn thành ')
  if (quoteData.value.completed.length === 0) textLines.push('  (Không có)')
  quoteData.value.completed.forEach((g, idx) => {
    textLines.push(`${idx + 1}. Báo giá "${g.latest.content_of_contract_po || 'Không có tiêu đề'}" `)
    textLines.push(` - ${g.tenKh} - ${g.tenCty}`)
  })

  textLines.push('')
  textLines.push('Đang xử lý : ')
  if (quoteData.value.pending.length === 0) textLines.push('  (Không có)')
  quoteData.value.pending.forEach((g, idx) => {
    textLines.push(`${idx + 1}. Báo giá "${g.latest.content_of_contract_po || 'Không có tiêu đề'}" `)
    textLines.push(` - ${g.tenKh} - ${g.tenCty}`)
  })

  return textLines.join('\n')
})

const licenseReportText = computed(() => {
  const textLines: string[] = []
  textLines.push(`BÁO CÁO LICENSE GIA HẠN & HẾT HIỆU LỰC (${activeRangeBadgeText.value})`)
  textLines.push(`Tổng cần theo dõi: ${licenseData.value.total} License`)

  textLines.push(`\n1. LICENSE GIA HẠN (${licenseData.value.renewal.length}):`)
  if (licenseData.value.renewal.length === 0) textLines.push('  (Không có)')
  licenseData.value.renewal.forEach((r, idx) => {
    textLines.push(`${idx + 1}. ${r.PRODUCT_NAME || 'Sản phẩm'} (${r.NHA_SAN_XUAT || 'N/A'})`)
    textLines.push(`  - Công ty: ${r.displayCompany} | ID: ${r.LICENSE_ID || 'N/A'}`)
    textLines.push(`  - Hết hạn: ${r.EXPIRATION_TIME || 'N/A'} (${r.expTimeText})`)
  })

  textLines.push(`\n2. LICENSE HẾT HIỆU LỰC (${licenseData.value.expiredGrace.length}):`)
  if (licenseData.value.expiredGrace.length === 0) textLines.push('  (Không có)')
  licenseData.value.expiredGrace.forEach((r, idx) => {
    textLines.push(`${idx + 1}. ${r.PRODUCT_NAME || 'Sản phẩm'} (${r.NHA_SAN_XUAT || 'N/A'})`)
    textLines.push(`  - Công ty: ${r.displayCompany} | ID: ${r.LICENSE_ID || 'N/A'}`)
    textLines.push(`  - Hết hiệu lực: ${r.SO_NGAY_HIEU_LUC || 'N/A'} (${r.graceTimeText})`)
  })

  return textLines.join('\n')
})

const copyText = (text: string, title: string) => {
  navigator.clipboard.writeText(text).then(() => {
    alert(`Đã copy ${title} vào bộ nhớ tạm!`)
  }).catch(err => {
    console.error('Lỗi copy', err)
    alert('Không thể copy, vui lòng thử lại!')
  })
}

const copyAllReports = () => {
  const fullText = [workReportText.value, quoteReportText.value, licenseReportText.value].join('\n\n====================\n\n')
  copyText(fullText, 'Toàn bộ báo cáo')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ==========================================================================
   ENTERPRISE BLUE TEMPLATE — DUAL-THEME (DARK NAVY BLUE & LIGHT BLUE)
========================================================================== */
.dashboard-container {
  --dash-canvas: radial-gradient(ellipse 75% 48% at 12% 0%, rgba(37, 99, 235, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse 65% 45% at 92% 100%, rgba(14, 165, 233, 0.16) 0%, transparent 55%),
    linear-gradient(180deg, #060d1f 0%, #0a1428 50%, #071020 100%);
  --dash-panel: rgba(12, 23, 46, 0.88);
  --dash-panel-solid: #0c172e;
  --dash-card: #10203e;
  --dash-card-hover: #152b52;
  --dash-card-active: linear-gradient(135deg, rgba(37, 99, 235, 0.24) 0%, rgba(14, 165, 233, 0.12) 100%);
  --dash-well: rgba(6, 13, 30, 0.56);
  --dash-border: rgba(96, 165, 250, 0.18);
  --dash-border-strong: rgba(96, 165, 250, 0.34);
  --dash-border-active: rgba(56, 189, 248, 0.62);
  --dash-ink: #f8fafc;
  --dash-ink-sec: #cbd5e1;
  --dash-ink-muted: #94a3b8;
  --dash-shadow: 0 14px 36px -12px rgba(2, 6, 23, 0.65);
  --dash-scheme: dark;

  --dash-blue: #38bdf8;
  --dash-blue-strong: #2563eb;
  --dash-blue-bg: rgba(37, 99, 235, 0.18);
  --dash-blue-border: rgba(56, 189, 248, 0.44);
  --dash-blue-grad: linear-gradient(135deg, #2563eb 0%, #0284c7 100%);
  --dash-blue-glow: 0 6px 18px rgba(37, 99, 235, 0.38);

  --dash-emerald: #34d399;
  --dash-emerald-bg: rgba(16, 185, 129, 0.15);
  --dash-emerald-border: rgba(16, 185, 129, 0.42);

  --dash-amber: #fbbf24;
  --dash-amber-bg: rgba(245, 158, 11, 0.16);
  --dash-amber-border: rgba(245, 158, 11, 0.44);

  --dash-rose: #f87171;
  --dash-rose-bg: rgba(239, 68, 68, 0.16);
  --dash-rose-border: rgba(239, 68, 68, 0.45);

  --dash-neutral-bg: rgba(148, 163, 184, 0.12);
  --dash-neutral-hover: rgba(59, 130, 246, 0.18);

  padding: 16px 22px;
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  background: var(--dash-canvas);
  color: var(--dash-ink);
  font-family: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
}

.dashboard-container.theme-light-blue {
  --dash-canvas: linear-gradient(180deg, #e8f2fc 0%, #dcebfb 55%, #e6f0fc 100%);
  --dash-panel: #ffffff;
  --dash-panel-solid: #ffffff;
  --dash-card: #ffffff;
  --dash-card-hover: #f0f7ff;
  --dash-card-active: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  --dash-well: #f1f7fe;
  --dash-border: #bfdbfe;
  --dash-border-strong: #93c5fd;
  --dash-border-active: #2563eb;
  --dash-ink: #0f172a;
  --dash-ink-sec: #334155;
  --dash-ink-muted: #64748b;
  --dash-shadow: 0 10px 28px -8px rgba(30, 64, 175, 0.12);
  --dash-scheme: light;

  --dash-blue: #1d4ed8;
  --dash-blue-strong: #2563eb;
  --dash-blue-bg: #eff6ff;
  --dash-blue-border: #93c5fd;
  --dash-blue-grad: linear-gradient(135deg, #2563eb 0%, #0284c7 100%);
  --dash-blue-glow: 0 6px 18px rgba(37, 99, 235, 0.24);

  --dash-emerald: #059669;
  --dash-emerald-bg: #ecfdf5;
  --dash-emerald-border: #6ee7b7;

  --dash-amber: #b45309;
  --dash-amber-bg: #fffbeb;
  --dash-amber-border: #fcd34d;

  --dash-rose: #dc2626;
  --dash-rose-bg: #fef2f2;
  --dash-rose-border: #fecaca;

  --dash-neutral-bg: #eff6ff;
  --dash-neutral-hover: #dbeafe;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* ── Header ── */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: var(--dash-panel);
  border: 1px solid var(--dash-border);
  border-radius: 14px;
  box-shadow: var(--dash-shadow);
  flex-shrink: 0;
}
.dash-header__left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.dash-header__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--dash-blue-grad);
  border: 1px solid rgba(147, 197, 253, 0.45);
  color: #ffffff;
  box-shadow: var(--dash-blue-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dash-header__text {
  min-width: 0;
}
.dash-header__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dash-header__title {
  color: var(--dash-ink);
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.25px;
}
.dash-header__range-pill {
  padding: 3px 11px;
  border-radius: 999px;
  background: var(--dash-blue-bg);
  border: 1px solid var(--dash-blue-border);
  color: var(--dash-blue);
  font-size: 11.5px;
  font-weight: 700;
}
.dash-header__subtitle {
  color: var(--dash-ink-muted);
  font-size: 12.5px;
  margin: 3px 0 0;
  font-weight: 500;
}
.dash-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-header__btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
  font-family: inherit;
}
.dash-header__btn--theme {
  background: var(--dash-neutral-bg);
  color: var(--dash-blue);
  border: 1px solid var(--dash-blue-border);
}
.dash-header__btn--theme:hover {
  background: var(--dash-neutral-hover);
  transform: translateY(-1px);
}
.dash-header__refresh {
  background: var(--dash-blue-grad);
  color: #ffffff;
  border: 1px solid transparent;
  box-shadow: var(--dash-blue-glow);
}
.dash-header__refresh:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}
.dash-header__refresh:disabled {
  opacity: 0.65;
  cursor: wait;
}

/* ── Loading Skeleton ── */
.dash-skeleton-wrapper {
  pointer-events: none;
}
.skeleton-box {
  background: var(--dash-card);
  border: 1px solid var(--dash-border);
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}
.skeleton-box::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.16), transparent);
  animation: dash-skeleton-shimmer 1.5s infinite;
}
@keyframes dash-skeleton-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.dash-spinner-sm {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-left-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* ── 2-Column Grid ── */
.dash-grid {
  display: grid;
  grid-template-columns: 316px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ── Sidebar ── */
.dash-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}
.dash-sidebar__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

/* ── Date Picker ── */
.dash-date-picker {
  background: var(--dash-panel);
  border: 1px solid var(--dash-border);
  border-radius: 16px;
  padding: 14px;
  box-shadow: var(--dash-shadow);
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
}
.dash-date-picker__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.dash-date-picker__label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--dash-blue);
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.dash-date-picker__sub {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--dash-ink-muted);
}
.dash-date-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: var(--dash-well);
  border: 1px solid var(--dash-border);
  border-radius: 9px;
  padding: 3px;
  margin-bottom: 10px;
  gap: 3px;
}
.dash-date-tabs button {
  padding: 6px 0;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--dash-ink-muted);
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
}
.dash-date-tabs button:hover {
  color: var(--dash-blue);
  background: var(--dash-blue-bg);
}
.dash-date-tabs button.active {
  background: var(--dash-blue-grad);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.34);
}
.dash-date-picker__input-wrap {
  background: var(--dash-well);
  border: 1px solid var(--dash-border-strong);
  border-radius: 10px;
  padding: 2px 4px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.dash-date-picker__input-wrap:hover,
.dash-date-picker__input-wrap:focus-within {
  border-color: var(--dash-blue-strong);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
}
.dash-date-picker__input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--dash-ink);
  font-size: 14px;
  font-weight: 700;
  outline: none;
  cursor: pointer;
  color-scheme: var(--dash-scheme);
  font-family: inherit;
  padding: 7px 9px;
  box-sizing: border-box;
}
.dash-date-picker__actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.dash-date-picker__btn {
  flex: 1;
  background: var(--dash-neutral-bg);
  border: 1px solid var(--dash-border-strong);
  color: var(--dash-ink-sec);
  padding: 7px 0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
}
.dash-date-picker__btn:hover {
  background: var(--dash-blue-bg);
  color: var(--dash-blue);
  border-color: var(--dash-blue-border);
}
.dash-date-picker__btn--active {
  background: var(--dash-blue-grad) !important;
  color: #ffffff !important;
  border-color: transparent !important;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.34);
}

/* ── Navigation Cards (Cohesive Blue Template) ── */
.dash-nav-card {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.22s ease;
  background: var(--dash-card);
  border: 1px solid var(--dash-border);
  box-shadow: var(--dash-shadow);
}
.dash-nav-card:hover {
  background: var(--dash-card-hover);
  border-color: var(--dash-blue-border);
  transform: translateX(3px);
}
.dash-nav-card--active {
  background: var(--dash-card-active);
  border-color: var(--dash-border-active);
  box-shadow: 0 10px 26px -10px rgba(37, 99, 235, 0.35);
}

.dash-nav-card__indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(180deg, #2563eb 0%, #38bdf8 100%);
  opacity: 0.28;
  transition: opacity 0.25s, width 0.25s;
}
.dash-nav-card--active .dash-nav-card__indicator {
  opacity: 1;
  width: 5px;
}

.dash-nav-card__glow {
  position: absolute;
  top: -24px;
  left: -24px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.dash-nav-card--active .dash-nav-card__glow {
  opacity: 1;
}

.dash-nav-card__body {
  position: relative;
  z-index: 1;
  padding: 14px 15px 14px 18px;
}

.dash-nav-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-nav-card__title {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.28px;
  color: var(--dash-blue);
  display: flex;
  align-items: center;
  gap: 7px;
}
.dash-nav-card__title svg {
  flex-shrink: 0;
}
.dash-nav-card__total {
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--dash-blue-bg);
  border: 1px solid var(--dash-blue-border);
  color: var(--dash-blue);
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.dash-nav-card__stats {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 11px;
  padding-top: 11px;
  border-top: 1px solid var(--dash-border);
}
.dash-nav-card__stat {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-nav-card__stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dash-nav-card__stat-dot.is-emerald { background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.55); }
.dash-nav-card__stat-dot.is-blue { background: #3b82f6; box-shadow: 0 0 6px rgba(59, 130, 246, 0.55); }
.dash-nav-card__stat-dot.is-amber { background: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.55); }
.dash-nav-card__stat-dot.is-rose { background: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.55); }

.dash-nav-card__stat-label {
  font-size: 11.5px;
  color: var(--dash-ink-sec);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.35px;
}
.dash-nav-card__stat-value {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--dash-ink);
  margin-left: auto;
  min-width: 26px;
  height: 25px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--dash-well);
}
.dash-nav-card__stat-value.is-emerald-pill {
  background: var(--dash-emerald-bg);
  color: var(--dash-emerald);
  border: 1px solid var(--dash-emerald-border);
}
.dash-nav-card__stat-value.is-blue-pill {
  background: var(--dash-blue-bg);
  color: var(--dash-blue);
  border: 1px solid var(--dash-blue-border);
}
.dash-nav-card__stat-value--warn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.32);
}
.dash-nav-card__stat-value--alert {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}

/* ── Detail Pane ── */
.dash-detail-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.dash-detail {
  background: var(--dash-panel);
  border-radius: 18px;
  border: 1px solid var(--dash-border-strong);
  box-shadow: var(--dash-shadow);
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  transition: border-color 0.25s ease;
}

.dash-detail-col--expanded {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  z-index: 10060;
  background: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(8px);
  padding: 24px 5%;
  box-sizing: border-box;
}
.dashboard-container.theme-light-blue .dash-detail-col--expanded {
  background: rgba(15, 23, 42, 0.45);
}

.dash-detail__inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Blue Executive Banner */
.dash-detail__banner {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 24px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(147, 197, 253, 0.24);
}
.dash-detail__banner.is-work-banner {
  background: linear-gradient(135deg, #0f2f6e 0%, #1d4ed8 54%, #0284c7 100%);
}
.dash-detail__banner.is-quote-banner {
  background: linear-gradient(135deg, #102a63 0%, #2563eb 54%, #0ea5e9 100%);
}
.dash-detail__banner.is-license-banner {
  background: linear-gradient(135deg, #0b2559 0%, #1e40af 52%, #0369a1 100%);
}

.dash-detail__banner-title {
  color: #ffffff;
  margin: 0;
  font-size: 16.5px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.35px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
}
.dash-banner-count {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.32);
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
}

.dash-banner-close-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  background: rgba(2, 6, 23, 0.28);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dash-banner-close-btn:hover {
  background: rgba(239, 68, 68, 0.85);
}

/* License Search Toolbar */
.dash-lic-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 11px 18px;
  background: var(--dash-well);
  border-bottom: 1px solid var(--dash-border);
  flex-shrink: 0;
}
.dash-lic-search {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 36px;
  border-radius: 10px;
  background: var(--dash-card);
  border: 1px solid var(--dash-border-strong);
  color: var(--dash-ink-muted);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.dash-lic-search:focus-within {
  border-color: var(--dash-blue-strong);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  color: var(--dash-blue);
}
.dash-lic-search__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dash-ink);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
}
.dash-lic-search__input::placeholder {
  color: var(--dash-ink-muted);
  font-weight: 500;
}
.dash-lic-search__clear {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: var(--dash-neutral-bg);
  color: var(--dash-ink-sec);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dash-lic-summary-pills {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-lic-pill {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: inherit;
  transition: transform 0.15s ease, filter 0.15s ease;
}
.dash-lic-pill:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
.dash-lic-pill.is-warn {
  background: var(--dash-amber-bg);
  color: var(--dash-amber);
  border-color: var(--dash-amber-border);
}
.dash-lic-pill.is-danger {
  background: var(--dash-rose-bg);
  color: var(--dash-rose);
  border-color: var(--dash-rose-border);
}

/* Content area */
.dash-detail__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: grid;
  gap: 16px;
  align-content: start;
}
.dash-detail__content--2col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: stretch;
}

.dash-detail__content::-webkit-scrollbar,
.dash-sidebar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.dash-detail__content::-webkit-scrollbar-thumb,
.dash-sidebar::-webkit-scrollbar-thumb {
  background: var(--dash-border-strong);
  border-radius: 3px;
}

/* Sections inside detail */
.dash-detail__section {
  border-radius: 14px;
  padding: 14px 15px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dash-border);
  background: var(--dash-well);
  min-width: 0;
}
.dash-section-head {
  margin-bottom: 12px;
}
.dash-section-head .dash-detail__section-title {
  margin-bottom: 5px;
}
.dash-section-hint {
  margin: 0;
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--dash-ink-muted);
}
.dash-detail__section-title {
  font-size: 14.5px;
  margin: 0 0 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding-bottom: 9px;
  border-bottom: 1px solid currentColor;
  cursor: pointer;
  transition: opacity 0.18s;
}
.dash-detail__section-title:hover {
  opacity: 0.8;
}
.dash-detail__section-title.is-emerald,
.dash-detail__list-num.is-emerald {
  color: var(--dash-emerald);
}
.dash-detail__section-title.is-blue,
.dash-detail__list-num.is-blue {
  color: var(--dash-blue);
}
.dash-detail__section-title.is-amber,
.dash-detail__list-num.is-amber {
  color: var(--dash-amber);
}
.dash-detail__section-title.is-rose,
.dash-detail__list-num.is-rose {
  color: var(--dash-rose);
}

/* List */
.dash-detail__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.dash-detail__list-item {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 11px 13px;
  border-radius: 11px;
  background: var(--dash-card);
  border: 1px solid var(--dash-border);
  color: var(--dash-ink);
  cursor: pointer;
  transition: all 0.16s ease;
}
.dash-detail__list-item:hover {
  background: var(--dash-card-hover);
  border-color: var(--dash-blue-border);
  transform: translateY(-1px);
}
.dash-detail__list-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-top: 2px;
}
.dash-detail__item-text {
  flex: 1;
  min-width: 0;
}
.dash-detail__item-main,
.dash-detail__quote-title {
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--dash-ink);
  word-break: break-word;
}
.dash-detail__item-sub,
.dash-detail__quote-subtitle {
  font-size: 12.5px;
  color: var(--dash-ink-muted);
  margin-top: 3px;
  font-weight: 600;
}

.dash-detail__empty {
  padding: 26px 16px;
  text-align: center;
  color: var(--dash-ink-muted);
  font-size: 13px;
  font-style: italic;
  border: 1px dashed var(--dash-border-strong);
  border-radius: 12px;
}

/* ── License Cards (Synced with LicenseOldDataFirebase) ── */
.dash-lic-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px 13px;
  border-radius: 12px;
  background: var(--dash-card);
  border: 1px solid var(--dash-border);
  border-left: 3.5px solid #2563eb;
  cursor: pointer;
  transition: all 0.18s ease;
}
.dash-lic-card.is-expired-grace {
  border-left-color: #ef4444;
}
.dash-lic-card:hover {
  background: var(--dash-card-hover);
  border-color: var(--dash-blue-border);
  transform: translateY(-1px);
}
.dash-lic-card.is-expired-grace:hover {
  border-color: var(--dash-rose-border);
}

.dash-lic-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.dash-lic-card__product {
  font-size: 14px;
  font-weight: 800;
  color: var(--dash-ink);
  line-height: 1.38;
  word-break: break-word;
}
.dash-lic-vendor {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.25px;
  background: var(--dash-blue-bg);
  color: var(--dash-blue);
  border: 1px solid var(--dash-blue-border);
  white-space: nowrap;
}

.dash-lic-card__company {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--dash-blue);
  line-height: 1.35;
}
.dash-lic-card__company svg {
  flex-shrink: 0;
  opacity: 0.85;
}

.dash-lic-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.dash-lic-chip {
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--dash-well);
  border: 1px solid var(--dash-border);
  color: var(--dash-ink-sec);
  font-size: 11px;
  font-weight: 700;
}
.dash-lic-chip.is-po {
  background: var(--dash-blue-bg);
  border-color: var(--dash-blue-border);
  color: var(--dash-blue);
}

.dash-lic-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 7px;
  border-top: 1px dashed var(--dash-border);
}
.dash-lic-dates {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  font-size: 11.5px;
  color: var(--dash-ink-muted);
  font-weight: 600;
}
.dash-lic-dates strong {
  color: var(--dash-ink-sec);
  font-weight: 700;
}
.dash-lic-dates strong.is-rose-txt {
  color: var(--dash-rose);
}
.dash-lic-date-sep {
  opacity: 0.5;
}

.dash-days-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
}
.dash-days-pill.is-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.dash-days-pill.is-warn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.dash-days-pill.is-blue {
  background: var(--dash-blue-grad);
}

/* Floating Actions */
.dash-floating-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.dash-floating-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: var(--dash-shadow);
}
.dash-floating-btn--nav {
  color: #ffffff;
  background: var(--dash-blue-grad);
  padding: 11px 26px;
  border-radius: 13px;
  font-weight: 800;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  box-shadow: var(--dash-blue-glow);
}
.dash-floating-btn--nav:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
}

.dash-floating-btn--expand {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--dash-panel);
  border: 1px solid var(--dash-blue-border);
  color: var(--dash-blue);
  padding: 0;
}
.dash-floating-btn--expand:hover {
  transform: translateY(-2px);
  background: var(--dash-blue-bg);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  :global(.main-content) {
    overflow: auto !important;
  }
  .dashboard-container {
    height: auto;
    max-height: none;
    min-height: 100dvh;
    overflow: visible;
  }
  .dash-grid {
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
  .dash-sidebar {
    overflow: visible;
  }
  .dash-detail {
    height: auto;
    min-height: 55vh;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px 10px 76px;
    gap: 10px;
  }
  .dash-header {
    padding: 12px;
    gap: 10px;
  }
  .dash-header__title {
    font-size: 18px;
  }
  .dash-header__actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .dash-header__btn {
    width: 100%;
  }

  .dash-detail__content--2col {
    grid-template-columns: 1fr;
  }
  .dash-detail__content {
    padding: 12px;
  }
  .dash-detail__banner {
    padding: 14px 44px 14px 14px;
  }
  .dash-detail__banner-title {
    font-size: 14px;
    gap: 7px;
  }
  .dash-lic-toolbar {
    padding: 10px 12px;
  }
  .dash-lic-search {
    min-width: 0;
    width: 100%;
  }
  .dash-lic-summary-pills {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .dash-detail__item-main,
  .dash-detail__quote-title {
    font-size: 14px;
  }

  /* Fullscreen Expanded Mode on Mobile: Edge-to-Edge Safe-Area Top 52px */
  .dash-detail-col--expanded {
    padding: 0 !important;
    gap: 0 !important;
    background: var(--dash-panel-solid) !important;
  }
  .dash-detail-col--expanded .dash-detail {
    border-radius: 0 !important;
    border: none !important;
    min-height: 0;
  }
  .dash-detail-col--expanded .dash-detail__banner {
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) !important;
    padding-bottom: 12px !important;
    justify-content: flex-start !important;
  }
  .dash-detail-col--expanded .dash-banner-close-btn {
    top: max(calc(env(safe-area-inset-top, 0px) + 8px), 52px) !important;
    right: 12px !important;
    transform: none !important;
  }
  .dash-detail-col--expanded .dash-floating-actions {
    width: 100%;
    justify-content: center;
    padding: 10px 14px max(calc(env(safe-area-inset-bottom, 0px) + 10px), 14px) !important;
    background: var(--dash-panel);
    border-top: 1px solid var(--dash-border);
    box-sizing: border-box;
  }
}
</style>
