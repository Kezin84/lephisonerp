<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dash-header">
      <div class="dash-header__left">
        <div class="dash-header__icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
        </div>
        <div>
          <h1 class="dash-header__title">Báo Cáo Tổng Quát</h1>
          <p class="dash-header__subtitle">Theo dõi tổng quan công việc, báo giá và gia hạn sản phẩm</p>
        </div>
      </div>
      <button class="dash-header__refresh" @click="fetchData" :disabled="loading">
        <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        <span v-if="loading" class="dash-spinner-sm"></span>
        <span>Làm mới</span>
      </button>
    </header>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="dash-grid dash-skeleton-wrapper">
      <div class="dash-sidebar">
        <!-- Date Picker Skeleton -->
        <div class="dash-date-picker skeleton-box" style="height: 128px; padding: 0;"></div>
        
        <div class="dash-sidebar__cards">
          <div class="dash-nav-card skeleton-box" style="height: 140px; padding: 0;"></div>
          <div class="dash-nav-card skeleton-box" style="height: 140px; padding: 0;"></div>
          <div class="dash-nav-card skeleton-box" style="height: 140px; padding: 0;"></div>
        </div>
        
        <div class="dash-floating-actions">
          <div class="skeleton-box" style="width: 140px; height: 44px; border-radius: 16px;"></div>
          <div class="skeleton-box" style="width: 48px; height: 48px; border-radius: 50%;"></div>
        </div>
      </div>

      <div class="dash-detail-col">
        <div class="dash-detail skeleton-box" style="flex: 1; padding: 0; background: rgba(30,41,59,0.35);"></div>
      </div>
    </div>

    <!-- 2 Column Layout -->
    <div v-else class="dash-grid">

      <!-- ═══ COLUMN 1: SIDEBAR ═══ -->
      <div class="dash-sidebar">

        <!-- Date Picker -->
        <div class="dash-date-picker">
          <div class="dash-date-picker__label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Mốc thời gian</span>
          </div>

          <div class="dash-date-tabs">
            <button :class="{ active: filterMode === 'day' }" @click="filterMode = 'day'">Ngày</button>
            <button :class="{ active: filterMode === 'week' }" @click="filterMode = 'week'">Tuần</button>
            <button :class="{ active: filterMode === 'month' }" @click="filterMode = 'month'">Tháng</button>
          </div>

          <div class="dash-date-picker__input-wrap">
            <input v-if="filterMode === 'day'" type="date" v-model="reportDate" class="dash-date-picker__input" />
            <input v-else-if="filterMode === 'week'" type="week" v-model="reportWeek" class="dash-date-picker__input" />
            <input v-else-if="filterMode === 'month'" type="month" v-model="reportMonth" class="dash-date-picker__input" />
          </div>
          <div class="dash-date-picker__actions">
            <button @click="setToday" class="dash-date-picker__btn" :class="{ 'dash-date-picker__btn--active': isToday }">
              {{ filterMode === 'day' ? 'Hôm nay' : filterMode === 'week' ? 'Tuần này' : 'Tháng này' }}
            </button>
            <button @click="setYesterday" class="dash-date-picker__btn" :class="{ 'dash-date-picker__btn--active': isYesterday }">
              {{ filterMode === 'day' ? 'Hôm qua' : filterMode === 'week' ? 'Tuần trước' : 'Tháng trước' }}
            </button>
          </div>
        </div>

        <div class="dash-sidebar__cards">
        <!-- Work Card -->
        <div class="dash-nav-card dash-nav-card--work" :class="{ 'dash-nav-card--active': expandedSection === 'work' }" @click="expandedSection = 'work'">
          <div class="dash-nav-card__indicator"></div>
          <div class="dash-nav-card__glow"></div>
          <div class="dash-nav-card__body">
            <div class="dash-nav-card__header">
              <div style="flex:1;">
                <h3 class="dash-nav-card__title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Công Việc {{ filterMode === 'day' ? 'Hôm Nay' : filterMode === 'week' ? 'Tuần Này' : 'Tháng Này' }}
                </h3>
              </div>
            </div>
            <div class="dash-nav-card__stats">
              <div class="dash-nav-card__stat">
                <span class="dash-nav-card__stat-dot" style="background: #10b981; box-shadow: 0 0 6px #10b981;"></span>
                <span class="dash-nav-card__stat-label">Hoàn thành</span>
                <span class="dash-nav-card__stat-value" :class="{ 'dash-nav-card__stat-value--alert': workData.done.length > 0 }">{{ workData.done.length }}</span>
              </div>
              <div class="dash-nav-card__stat">
                <span class="dash-nav-card__stat-dot" style="background: #f59e0b; box-shadow: 0 0 6px #f59e0b;"></span>
                <span class="dash-nav-card__stat-label">Chưa xong</span>
                <span class="dash-nav-card__stat-value" :class="{ 'dash-nav-card__stat-value--alert': workData.pending.length > 0 }">{{ workData.pending.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quote Card -->
        <div class="dash-nav-card dash-nav-card--amber" :class="{ 'dash-nav-card--active': expandedSection === 'quote' }" @click="expandedSection = 'quote'">
          <div class="dash-nav-card__indicator"></div>
          <div class="dash-nav-card__glow"></div>
          <div class="dash-nav-card__body">
            <div class="dash-nav-card__header">
              <div style="flex:1;">
                <h3 class="dash-nav-card__title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                  Báo Giá Xử Lý
                </h3>
              </div>
            </div>
            <div class="dash-nav-card__stats">
              <div class="dash-nav-card__stat">
                <span class="dash-nav-card__stat-dot" style="background: #10b981; box-shadow: 0 0 6px #10b981;"></span>
                <span class="dash-nav-card__stat-label">Đã chốt</span>
                <span class="dash-nav-card__stat-value" :class="{ 'dash-nav-card__stat-value--alert': quoteData.completed.length > 0 }">{{ quoteData.completed.length }}</span>
              </div>
              <div class="dash-nav-card__stat">
                <span class="dash-nav-card__stat-dot" style="background: #ef4444; box-shadow: 0 0 6px #ef4444;"></span>
                <span class="dash-nav-card__stat-label">Đang xử lý</span>
                <span class="dash-nav-card__stat-value" :class="{ 'dash-nav-card__stat-value--alert': quoteData.pending.length > 0 }">{{ quoteData.pending.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Renewal Card -->
        <div class="dash-nav-card dash-nav-card--red" :class="{ 'dash-nav-card--active': expandedSection === 'renewal' }" @click="expandedSection = 'renewal'">
          <div class="dash-nav-card__indicator"></div>
          <div class="dash-nav-card__glow"></div>
          <div class="dash-nav-card__body">
            <div class="dash-nav-card__header">
              <div style="flex:1;">
                <h3 class="dash-nav-card__title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  SP Cần Gia Hạn
                </h3>
              </div>
              <span class="dash-nav-card__badge" :class="renewalData.length > 0 ? 'dash-nav-card__badge--alert' : 'dash-nav-card__badge--normal'">{{ renewalData.length }}</span>
            </div>
          </div>
        </div>
        </div>

      </div>

      <!-- ═══ COLUMN 2: DETAILS PANE ═══ -->
      <div class="dash-detail-col" :class="{ 'dash-detail-col--expanded': isDetailExpanded }">
        <div class="dash-detail" :class="`dash-detail--${expandedSection}`">

        <!-- WORK DETAIL -->
        <div v-if="expandedSection === 'work'" class="dash-detail__inner">
          <div class="dash-detail__banner" style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);">
            <h3 class="dash-detail__banner-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Chi Tiết Công Việc {{ filterMode === 'day' ? 'Hôm Nay' : filterMode === 'week' ? 'Tuần Này' : 'Tháng Này' }} ({{ workData.total }})
            </h3>
          </div>
          <div class="dash-detail__content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="dash-detail__section dash-detail__section--green">
              <h4 class="dash-detail__section-title" style="color: #10b981;" @click="goToReport()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Hoàn thành ({{ workData.done.length }})
              </h4>
              <ul class="dash-detail__list">
                <li v-for="(item, idx) in workData.done" :key="idx" class="dash-detail__list-item" @click="goToReport(item)">
                  <span class="dash-detail__list-num" style="color: #10b981;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </span>
                  <span>{{ item.noi_dung || item.thoi_gian }}</span>
                </li>
              </ul>
            </div>
            <div class="dash-detail__section dash-detail__section--amber">
              <h4 class="dash-detail__section-title" style="color: #f59e0b;" @click="goToReport()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Chưa xong ({{ workData.pending.length }})
              </h4>
              <ul class="dash-detail__list">
                <li v-for="(item, idx) in workData.pending" :key="idx" class="dash-detail__list-item" @click="goToReport(item)">
                  <span class="dash-detail__list-num" style="color: #f59e0b;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </span>
                  <span>{{ item.noi_dung || item.thoi_gian }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- QUOTE DETAIL -->
        <div v-else-if="expandedSection === 'quote'" class="dash-detail__inner">
          <div class="dash-detail__banner" style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%);">
            <h3 class="dash-detail__banner-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
              Chi Tiết Báo Giá Xử Lý ({{ quoteData.total }})
            </h3>
          </div>
          <div class="dash-detail__content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="dash-detail__section dash-detail__section--green">
              <h4 class="dash-detail__section-title" style="color: #10b981;" @click="goToQuote('COMPLETED')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                Đã chốt ({{ quoteData.completed.length }})
              </h4>
              <ul class="dash-detail__list">
                <li v-for="(item, idx) in quoteData.completed" :key="idx" class="dash-detail__list-item" @click="goToQuote('COMPLETED', item)">
                  <span class="dash-detail__list-num" style="color: #10b981;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                  </span>
                  <div>
                    <div style="color: #ffffff; font-weight: 600; font-size: 30px;">Báo giá "{{ item.latest.content_of_contract_po || 'Không có tiêu đề' }}"</div>
                    <div style="color: #e2e8f0; font-size: 20px; margin-top: 4px; padding-left: 6px;">{{ item.tenKh }} — {{ item.tenCty }}</div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="dash-detail__section dash-detail__section--red">
              <h4 class="dash-detail__section-title" style="color: #ef4444;" @click="goToQuote('PROCESSING')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Đang xử lý ({{ quoteData.pending.length }})
              </h4>
              <ul class="dash-detail__list">
                <li v-for="(item, idx) in quoteData.pending" :key="idx" class="dash-detail__list-item" @click="goToQuote('PROCESSING', item)">
                  <span class="dash-detail__list-num" style="color: #ef4444;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </span>
                  <div>
                    <div style="color: #ffffff; font-weight: 600; font-size: 30px;">Báo giá "{{ item.latest.content_of_contract_po || 'Không có tiêu đề' }}"</div>
                    <div style="color: #e2e8f0; font-size: 20px; margin-top: 4px; padding-left: 6px;">{{ item.tenKh }} — {{ item.tenCty }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- RENEWAL DETAIL -->
        <div v-else-if="expandedSection === 'renewal'" class="dash-detail__inner">
          <div class="dash-detail__banner" style="background: linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #f87171 100%);">
            <h3 class="dash-detail__banner-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Chi Tiết SP Cần Gia Hạn ({{ renewalData.length }})
            </h3>
          </div>
          <div class="dash-detail__content" style="display: grid; gap: 16px; grid-template-columns: 1fr; align-content: start;">
            <div v-for="(group, idx) in groupedRenewalData" :key="group.ma_hop_dong" style="position: relative;">
              <!-- Folder Tab -->
              <div class="dash-renewal-tab">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                MÃ HĐ: {{ group.ma_hop_dong }}
              </div>
              <!-- Folder Body -->
              <div class="dash-renewal-body">
                <div class="dash-renewal-customer">
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; flex-wrap: wrap;">
                    <span style="color: #64748b;">KHÁCH HÀNG:</span>
                    <div style="display: flex; align-items: center; gap: 4px; color: #38bdf8;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {{ group.ten_khach_hang }}
                    </div>
                    <span style="color: #334155;">•</span>
                    <div style="display: flex; align-items: center; gap: 4px; color: #10b981;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      {{ group.ten_cong_ty }}
                    </div>
                  </div>
                </div>
                <div style="padding: 4px 12px 12px; overflow-x: auto;">
                  <table class="dash-renewal-table">
                    <thead>
                      <tr>
                        <th style="width: 50px; text-align: center;">STT</th>
                        <th>TÊN HÀNG</th>
                        <th style="text-align: center;">START DATE</th>
                        <th style="text-align: center;">END DATE</th>
                        <th style="text-align: center;">THỜI HẠN</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, iIndex) in group.items" :key="iIndex" @click="goToRenewal(group, item)">
                        <td style="text-align: center; color: #64748b; font-weight: 700;">{{ iIndex + 1 }}</td>
                        <td style="color: #38bdf8; font-weight: 600;">{{ item.ten_hang }}</td>
                        <td style="text-align: center; color: #94a3b8;">{{ item.start_date || '—' }}</td>
                        <td style="text-align: center; color: #94a3b8;">{{ item.end_date || '—' }}</td>
                        <td style="text-align: center;">
                          <span :style="{ color: '#fff', fontWeight: 700, background: item.daysLeft <= 0 ? '#ef4444' : (item.daysLeft <= 15 ? '#ef4444' : '#f59e0b'), padding: '4px 10px', borderRadius: '6px', display: 'inline-block', fontSize: '13px', whiteSpace: 'nowrap' }">
                            {{ item.timeText || (item.daysLeft < 0 ? `Quá hạn ${Math.abs(item.daysLeft)} ngày` : (item.daysLeft === 0 ? 'Hết hạn hôm nay' : `Còn ${item.daysLeft} ngày`)) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div v-if="groupedRenewalData.length === 0" class="dash-detail__empty">Không có sản phẩm nào cần gia hạn.</div>
          </div>
        </div>

        </div>

        <!-- FLOATING ACTIONS -->
        <div class="dash-floating-actions">
          <button class="dash-floating-btn dash-floating-btn--nav" :class="`dash-floating-btn--nav-${expandedSection}`" @click="handleNavigate">
            <span>Điều hướng</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
          <button class="dash-floating-btn dash-floating-btn--expand" :class="`dash-floating-btn--expand-${expandedSection}`" @click="isDetailExpanded = !isDetailExpanded">
            <svg v-if="!isDetailExpanded" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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

const expandedSection = ref<'work' | 'quote' | 'renewal'>('work');
const isDetailExpanded = ref(false);

const handleNavigate = () => {
  if (expandedSection.value === 'work') goToReport()
  else if (expandedSection.value === 'quote') goToQuote('ALL')
  else if (expandedSection.value === 'renewal') goToRenewal()
}

const toggleExpand = (section: 'work' | 'quote' | 'renewal') => {
  if (expandedSection.value === section) {
    expandedSection.value = null;
  } else {
    expandedSection.value = section;
  }
}

const goToReport = (item?: any) => {
  router.push({ path: '/report', query: { date: reportDate.value } })
}

const goToQuote = (status: string, item?: any) => {
  if (item && item.latest) {
    router.push({ path: '/quanlybaogia', query: { tab: 'baogia', dashboard: status, search: item.latest.content_of_contract_po || item.latest.ma_hop_dong } })
  } else {
    router.push({ path: '/quanlybaogia', query: { tab: 'baogia', dashboard: status } })
  }
}

const goToRenewal = (group?: any, item?: any) => {
  if (item && item.ten_hang && group && group.ma_hop_dong) {
    // Search for both contract code and product name to exactly pinpoint this product under this contract
    router.push({ path: '/quanlybaogia', query: { tab: 'thoihan', search: `${group.ma_hop_dong} ${item.ten_hang}`, highlight: item.ten_hang } })
  } else if (item && item.ten_hang) {
    router.push({ path: '/quanlybaogia', query: { tab: 'thoihan', search: item.ten_hang, highlight: item.ten_hang } })
  } else if (group && group.ten_khach_hang) {
    router.push({ path: '/quanlybaogia', query: { tab: 'thoihan', search: group.ten_khach_hang } })
  } else {
    router.push({ path: '/quanlybaogia', query: { tab: 'thoihan', card: 'renew' } })
  }
}

const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'
const loading = ref(true)

// Data references
const reports = ref<any[]>([])
const quotes = ref<any[]>([])
const quoteDetails = ref<any[]>([])
const customers = ref<any[]>([])

// Date Utils
const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const getThisMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const getWeekString = (d: Date) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const getWeekDateRange = (weekStr: string) => {
  const [year, week] = weekStr.split('-W').map(Number);
  const d = new Date(year, 0, 4);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1 + (week - 1) * 7);
  const from = new Date(d);
  from.setHours(0, 0, 0, 0);
  const to = new Date(d);
  to.setDate(to.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return { from, to };
};

const filterMode = ref<'day'|'week'|'month'>('day')
const reportDate = ref(getTodayStr())
const reportWeek = ref(getWeekString(new Date()))
const reportMonth = ref(getThisMonthStr())

const setToday = () => {
  if (filterMode.value === 'day') reportDate.value = getTodayStr();
  else if (filterMode.value === 'week') reportWeek.value = getWeekString(new Date());
  else if (filterMode.value === 'month') reportMonth.value = getThisMonthStr();
}
const setYesterday = () => {
  const d = new Date();
  if (filterMode.value === 'day') {
    d.setDate(d.getDate() - 1);
    reportDate.value = d.toISOString().split('T')[0];
  } else if (filterMode.value === 'week') {
    d.setDate(d.getDate() - 7);
    reportWeek.value = getWeekString(d);
  } else if (filterMode.value === 'month') {
    d.setMonth(d.getMonth() - 1);
    reportMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}

const isToday = computed(() => {
  if (filterMode.value === 'day') return reportDate.value === getTodayStr();
  if (filterMode.value === 'week') return reportWeek.value === getWeekString(new Date());
  if (filterMode.value === 'month') return reportMonth.value === getThisMonthStr();
  return false;
})

const isYesterday = computed(() => {
  const d = new Date();
  if (filterMode.value === 'day') {
    d.setDate(d.getDate() - 1);
    return reportDate.value === d.toISOString().split('T')[0];
  }
  if (filterMode.value === 'week') {
    d.setDate(d.getDate() - 7);
    return reportWeek.value === getWeekString(d);
  }
  if (filterMode.value === 'month') {
    d.setMonth(d.getMonth() - 1);
    return reportMonth.value === `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  return false;
})

// Format utils
const calculateDaysDiff = (start: string, end: string) => {
  if (!end) return 0
  const p2 = end.split('/')
  if (p2.length !== 3) return 0
  
  const d1 = new Date(reportDate.value)
  d1.setHours(0, 0, 0, 0)
  const d2 = new Date(+p2[2], +p2[1] - 1, +p2[0])
  d2.setHours(0, 0, 0, 0)
  
  const diff = d2.getTime() - d1.getTime()
  return Math.ceil(diff / (1000 * 3600 * 24))
}

const fetchData = async () => {
  loading.value = true
  try {
    const [resReports, resQuotes, resDetails, resCustomers] = await Promise.all([
      fetch(`${API_URL}?action=get`).then(r => r.json()),
      fetch(`${API_URL}?action=hop_dong_tong_quat`).then(r => r.json()),
      fetch(`${API_URL}?action=hop_dong_chi_tiet`).then(r => r.json()),
      fetch(`${API_URL}?action=khach_hang`).then(r => r.json())
    ])

    reports.value = resReports.data || []
    
    const rawQuotes = resQuotes.data || resQuotes || []
    quotes.value = rawQuotes.map((r: any) => ({
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
      is_completed: r[33] === true || r[33] === 'true' || r[33] === 'TRUE' || String(r[15]||'') === 'Chính thức'
    }))

    const rawDetails = resDetails.data || resDetails || []
    quoteDetails.value = rawDetails.map((r: any) => {
      let sd = r[28] ? String(r[28]) : ''
      let ed = r[29] ? String(r[29]) : ''
      if (sd && sd.includes('T')) {
        const d = new Date(sd); sd = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
      }
      if (ed && ed.includes('T')) {
        const d = new Date(ed); ed = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
      }
      return {
        ma_hop_dong: String(r[0] || ''),
        ma_hang: String(r[2] || ''),
        ten_hang: String(r[3] || ''),
        hang: String(r[6] || ''),
        start_date: sd,
        end_date: ed,
        is_giahan: String(r[30] ?? '').trim().toUpperCase()
      }
    })

    const rawCustomers = resCustomers.data || resCustomers || []
    customers.value = rawCustomers.map((r: any) => ({
      ma_khach_hang: String(r[0] || ''),
      ten_khach_hang: String(r[1] || ''),
      ten_cong_ty: String(r[5] || '')
    }))

  } catch (error) {
    console.error('Lỗi khi tải dữ liệu dashboard:', error)
  } finally {
    loading.value = false
  }
}

const statusEffects = ref<Record<string, string>>({});

const updateGiaHanStatus = async (item: any, status: string) => {
  const payload = {
    ma_hop_dong: item.ma_hop_dong,
    ma_hang: item.ma_hang,
    is_giahan: status
  }
  
  // Optimistic UI Effect
  const key = `${item.ma_hop_dong}_${item.ma_hang}`;
  statusEffects.value[key] = status;
  setTimeout(() => {
    delete statusEffects.value[key];
    item.is_giahan = status;
    const original = quoteDetails.value.find((d: any) => d.ma_hop_dong === item.ma_hop_dong && d.ma_hang === item.ma_hang);
    if (original) {
      original.is_giahan = status;
      quoteDetails.value = [...quoteDetails.value];
    }
  }, 800);

  const body = new URLSearchParams()
  body.set('action', 'update_giahan_status')
  body.set('payload', JSON.stringify(payload))
  
  fetch(API_URL, { method: 'POST', body })
    .then(res => res.json())
    .then(data => {
      if (!data.ok) throw new Error(data.error || 'Lỗi server')
    })
    .catch(error => console.error('Lỗi khi cập nhật trạng thái gia hạn', error));
}


const formatDateDDMMYYYY = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const parseDateFromReport = (thoi_gian: string) => {
  try {
    const parts = thoi_gian.split(' /');
    if (parts.length === 3) {
      const timePart = parts[0];
      const datePart = parts[2];
      const [hour, minute] = timePart.split(':');
      const [d, m, y] = datePart.split('/');
      return new Date(Number(y), Number(m) - 1, Number(d), Number(hour), Number(minute));
    }
  } catch (e) {}
  return null;
}

const parseDateFromQuote = (ngay_tao: string) => {
  try {
    if (!ngay_tao) return null;
    
    // Tìm chuỗi có dạng DD/MM/YYYY hoặc D/M/YYYY
    const match = ngay_tao.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      return new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
    }
    
    // Tìm chuỗi có dạng YYYY-MM-DD
    const matchDash = ngay_tao.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (matchDash) {
      return new Date(parseInt(matchDash[1], 10), parseInt(matchDash[2], 10) - 1, parseInt(matchDash[3], 10));
    }

    // Nếu không khớp regex, thử parse tự động bằng Javascript
    const native = new Date(ngay_tao);
    if (!isNaN(native.getTime())) {
      return native;
    }
  } catch(e) {
    console.error("Error parsing quote date:", ngay_tao, e);
  }
  return null;
}

const getFilterRange = () => {
  if (filterMode.value === 'day') {
    const d = new Date(reportDate.value);
    d.setHours(0,0,0,0);
    const end = new Date(d);
    end.setHours(23,59,59,999);
    return { start: d, end };
  } else if (filterMode.value === 'week') {
    const range = getWeekDateRange(reportWeek.value);
    return { start: range.from, end: range.to };
  } else if (filterMode.value === 'month') {
    const [y, m] = reportMonth.value.split('-');
    const start = new Date(Number(y), Number(m) - 1, 1);
    const end = new Date(Number(y), Number(m), 0);
    end.setHours(23,59,59,999);
    return { start, end };
  }
  return { start: new Date(), end: new Date() };
}

// ------------------------------------------------------------------
// VISUAL DATA COMPUTED PROPERTIES
// ------------------------------------------------------------------

const workData = computed(() => {
  const range = getFilterRange();
  
  const todaysWork = reports.value.filter(r => {
    const d = parseDateFromReport(r.thoi_gian || '');
    if (!d) return false;
    return d >= range.start && d <= range.end;
  })
  
  const done = todaysWork.filter(r => r.trang_thai === 'Hoàn thành')
  const pending = todaysWork.filter(r => r.trang_thai !== 'Hoàn thành')
  
  return { done, pending, total: todaysWork.length }
})

const quoteData = computed(() => {
  const range = getFilterRange();
  
  const todaysQuotes = quotes.value.filter(q => {
    const d = parseDateFromQuote(q.ngay_tao || '');
    if (!d) return false;
    return d >= range.start && d <= range.end;
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
    const latest = isGroup ? item.latest : item;
    const isCompleted = latest.trang_thai === 'Chính thức' && latest.is_completed;
    const isProcessing = latest.trang_thai === 'Tạm' && !latest.is_completed;
    
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
  ];
  
  const completed = allProcessed.filter(g => g.isCompleted)
  const pending = allProcessed.filter(g => g.isProcessing)
  
  return { completed, pending, total: completed.length + pending.length }
})

const renewalData = computed(() => {
  const list: any[] = []
  const range = getFilterRange();
  
  // Lấy danh sách mã hợp đồng hợp lệ (Chính thức hoặc is_completed)
  const validQuotes = quotes.value.filter(q => 
    q.trang_thai_hop_dong === 'Chính thức' || q.trang_thai === 'Chính thức' || q.is_completed
  )
  const validQuoteIds = new Set(validQuotes.map(q => q.ma_hop_dong))

  quoteDetails.value.forEach(det => {
    // Bỏ qua nếu đã đánh dấu Đã gia hạn hoặc Khách hủy
    if (det.is_giahan !== 'TRUE' && det.is_giahan !== 'FALSE') {
      if (det.start_date && det.end_date) {
        if (validQuoteIds.has(det.ma_hop_dong)) {
          const p2 = det.end_date.split('/')
          if (p2.length === 3) {
            const endDate = new Date(+p2[2], +p2[1] - 1, +p2[0]);
            endDate.setHours(0, 0, 0, 0);
            
            const baseStart = new Date(range.start);
            baseStart.setHours(0, 0, 0, 0);
            const baseEnd = new Date(range.end);
            baseEnd.setHours(0, 0, 0, 0);
            
            const diffStart = endDate.getTime() - baseStart.getTime();
            const daysLeftStart = Math.ceil(diffStart / (1000 * 3600 * 24));
            
            const diffEnd = endDate.getTime() - baseEnd.getTime();
            const daysLeftEnd = Math.ceil(diffEnd / (1000 * 3600 * 24));
            
            let timeText = '';
            if (filterMode.value === 'day') {
              timeText = daysLeftEnd < 0 ? `Quá hạn ${Math.abs(daysLeftEnd)} ngày` : (daysLeftEnd === 0 ? 'Hết hạn hôm nay' : `Còn ${daysLeftEnd} ngày`);
            } else {
              if (daysLeftStart < 0 && daysLeftEnd < 0) {
                timeText = `Quá hạn ${Math.abs(daysLeftStart)} - ${Math.abs(daysLeftEnd)} ngày`;
              } else if (daysLeftStart >= 0 && daysLeftEnd >= 0) {
                timeText = `Còn ${daysLeftEnd} - ${daysLeftStart} ngày`;
              } else {
                timeText = `Còn ${daysLeftStart} ngày -> Quá hạn ${Math.abs(daysLeftEnd)} ngày`;
              }
            }
            
            // Giữ lại 90 ngày nhưng daysLeft tính toán dựa trên thời gian đang chọn (range.end)
            if (daysLeftEnd <= 90) {
              const hd = validQuotes.find(q => q.ma_hop_dong === det.ma_hop_dong)
              let tenKh = 'Không rõ'
              let tenCty = 'Không rõ'
              if (hd) {
                tenKh = hd.ten_khach_hang || 'Không rõ'
                if (hd.ma_khach_hang) {
                  const kh = customers.value.find(k => k.ma_khach_hang === hd.ma_khach_hang)
                  if (kh && kh.ten_cong_ty) {
                    tenCty = kh.ten_cong_ty
                  }
                }
              }
              const qty = Number(det.so_luong) || 1
              for (let i = 0; i < qty; i++) {
                list.push({ ...det, daysLeft: daysLeftEnd, timeText, ten_khach_hang: tenKh, ten_cong_ty: tenCty })
              }
            }
          }
        }
      }
    }
  })
  
  list.sort((a, b) => a.daysLeft - b.daysLeft)
  return list
})

const groupedRenewalData = computed(() => {
  const groups: Record<string, {
    ma_hop_dong: string,
    ten_khach_hang: string,
    ten_cong_ty: string,
    items: any[]
  }> = {}

  renewalData.value.forEach(item => {
    if (!groups[item.ma_hop_dong]) {
      groups[item.ma_hop_dong] = {
        ma_hop_dong: item.ma_hop_dong,
        ten_khach_hang: item.ten_khach_hang,
        ten_cong_ty: item.ten_cong_ty,
        items: []
      }
    }
    groups[item.ma_hop_dong].items.push(item)
  })

  // Sắp xếp các nhóm dựa trên số ngày còn lại ngắn nhất
  return Object.values(groups).sort((a, b) => {
    const minA = Math.min(...a.items.map(i => i.daysLeft))
    const minB = Math.min(...b.items.map(i => i.daysLeft))
    return minA - minB
  })
})

const getDaysLeftClass = (days: number) => {
  if (days <= 15) return 'bg-red'
  if (days <= 45) return 'bg-orange'
  return 'bg-blue'
}

// ------------------------------------------------------------------
// TEXT REPORT COMPUTED PROPERTIES (For Copying)
// ------------------------------------------------------------------

const workReportText = computed(() => {
  const range = getFilterRange();
  let titleStr = '';
  if (filterMode.value === 'day') {
    titleStr = `NGÀY ${formatDateDDMMYYYY(reportDate.value)}`;
  } else if (filterMode.value === 'week') {
    titleStr = `TỪ NGÀY ${formatDateDDMMYYYY(range.start.toISOString().split('T')[0])} ĐẾN NGÀY ${formatDateDDMMYYYY(range.end.toISOString().split('T')[0])}`;
  } else {
    titleStr = `THÁNG ${reportMonth.value.split('-')[1]}/${reportMonth.value.split('-')[0]}`;
  }
  
  let textLines: string[] = []
  textLines.push(`BÁO CÁO CÔNG VIỆC ${titleStr}`)
  textLines.push(`Tổng : ${workData.value.total} việc `)
  
  textLines.push(`Hoàn Thành ( ${workData.value.done.length} )  : `)
  if (workData.value.done.length === 0) textLines.push(`  (Không có)`)
  workData.value.done.forEach((r, idx) => {
    textLines.push(`${idx + 1}. ${r.noi_dung}`)
    if (r.ghi_chu) textLines.push(`  - ${r.ghi_chu.replace(/\n/g, ' ')}`)
  })
  
  textLines.push(`Chưa hoàn thành ( ${workData.value.pending.length} )  : `)
  if (workData.value.pending.length === 0) textLines.push(`  (Không có)`)
  workData.value.pending.forEach((r, idx) => {
    textLines.push(`${idx + 1}. ${r.noi_dung}`)
    if (r.ghi_chu) textLines.push(`  - ${r.ghi_chu.replace(/\n/g, ' ')}`)
  })
  
  return textLines.join('\n')
})

const quoteReportText = computed(() => {
  const range = getFilterRange();
  let titleStr = '';
  if (filterMode.value === 'day') {
    titleStr = `NGÀY ${formatDateDDMMYYYY(reportDate.value)}`;
  } else if (filterMode.value === 'week') {
    titleStr = `TỪ NGÀY ${formatDateDDMMYYYY(range.start.toISOString().split('T')[0])} ĐẾN NGÀY ${formatDateDDMMYYYY(range.end.toISOString().split('T')[0])}`;
  } else {
    titleStr = `THÁNG ${reportMonth.value.split('-')[1]}/${reportMonth.value.split('-')[0]}`;
  }
  
  let textLines: string[] = []
  textLines.push(`BÁO CÁO BÁO GIÁ ${titleStr}`)
  textLines.push(`Tổng xử lý : ${quoteData.value.total} báo giá `)
  
  textLines.push(`Đã hoàn thành `)
  if (quoteData.value.completed.length === 0) textLines.push(`  (Không có)`)
  quoteData.value.completed.forEach((g, idx) => {
    textLines.push(`${idx + 1}. Báo giá "${g.latest.content_of_contract_po || 'Không có tiêu đề'}" `)
    textLines.push(` - ${g.tenKh} - ${g.tenCty}`)
  })
  
  textLines.push('')
  textLines.push(`Đang xử lý : `)
  if (quoteData.value.pending.length === 0) textLines.push(`  (Không có)`)
  quoteData.value.pending.forEach((g, idx) => {
    textLines.push(`${idx + 1}. Báo giá "${g.latest.content_of_contract_po || 'Không có tiêu đề'}" `)
    textLines.push(` - ${g.tenKh} - ${g.tenCty}`)
  })
  
  return textLines.join('\n')
})

const renewalReportText = computed(() => {
  const formattedDate = formatDateDDMMYYYY(reportDate.value)
  const [d, m, y] = formattedDate.split('/')
  const targetDateStr2 = `${parseInt(d)}/${parseInt(m)}/${y}`
  
  let textLines: string[] = []
  textLines.push(`BÁO CÁO GIA HẠN SẢN PHẨM ${targetDateStr2}`)
  textLines.push(`Tổng SP gia hạn : ${renewalData.value.length} sản phẩm `)
  
  renewalData.value.forEach((r, idx) => {
    textLines.push(`${idx + 1}. Tên sản phẩm : ${r.ten_hang}`)
    textLines.push(`  - Còn ${r.daysLeft} ngày (${r.start_date} - ${r.end_date})`)
    textLines.push(`  - ${r.ma_hop_dong || 'N/A'}`)
    textLines.push(`  - ${r.ten_khach_hang || 'N/A'} - ${r.ten_cong_ty || 'N/A'}`)
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
  const fullText = [workReportText.value, quoteReportText.value, renewalReportText.value].join('\n\n====================\n\n')
  copyText(fullText, 'Toàn bộ báo cáo')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════
   DASHBOARD — PREMIUM DESIGN SYSTEM
   ═══════════════════════════════════════════ */

/* Container */
.dashboard-container {
  padding: 16px 24px;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: linear-gradient(145deg, #0c1222 0%, #0f172a 40%, #131b2e 100%);
  color: #f8fafc;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* ── Header ── */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.dash-header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.dash-header__icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(56,189,248,0.15) 100%);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16,185,129,0.15);
}
.dash-header__title {
  color: #f1f5f9;
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.3px;
}
.dash-header__subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 4px 0 0 0;
  font-weight: 500;
}
.dash-header__refresh {
  background: rgba(56,189,248,0.08);
  color: #38bdf8;
  border: 1px solid rgba(56,189,248,0.15);
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s;
}
.dash-header__refresh:hover {
  background: rgba(56,189,248,0.15);
  border-color: rgba(56,189,248,0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56,189,248,0.1);
}

/* ── Loading Skeleton ── */
.dash-skeleton-wrapper {
  pointer-events: none;
}
.skeleton-box {
  background: rgba(30,41,59,0.5);
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}
.skeleton-box::after {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: dash-skeleton-shimmer 1.5s infinite;
}
@keyframes dash-skeleton-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.dash-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(56,189,248,0.1);
  border-left-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.dash-spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(56,189,248,0.2);
  border-left-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

/* ── 2-Column Grid ── */
.dash-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: minmax(0, 1fr);
  gap: 20px;
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
  overflow: hidden;
}
.dash-sidebar__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

/* ── Date Picker ── */
.dash-date-picker {
  background: rgba(30,41,59,0.5);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 14px;
  backdrop-filter: blur(12px);
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
}
.dash-date-picker__label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
}
.dash-date-tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 12px;
  gap: 4px;
}
.dash-date-tabs button {
  flex: 1;
  padding: 6px 0;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}
.dash-date-tabs button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}
.dash-date-tabs button.active {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
.dash-date-picker__input-wrap {
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 2px 4px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}
.dash-date-picker__input-wrap:hover {
  border-color: rgba(16,185,129,0.4);
}
.dash-date-picker__input {
  width: 100%;
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  color-scheme: dark;
  font-family: 'Inter', sans-serif;
  padding: 8px 10px;
  box-sizing: border-box;
}
.dash-date-picker__actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.dash-date-picker__btn {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #cbd5e1;
  padding: 6px 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}
.dash-date-picker__btn:hover {
  background: rgba(16,185,129,0.15);
  color: #10b981;
  border-color: rgba(16,185,129,0.3);
}
.dash-date-picker__btn--active {
  background: #10b981 !important;
  color: #ffffff !important;
  border-color: #10b981 !important;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

/* ── Navigation Cards ── */
.dash-nav-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(30,41,59,0.4);
  border: 1px solid rgba(255,255,255,0.06);
}
.dash-nav-card:hover {
  background: rgba(30,41,59,0.6);
  transform: translateX(4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.dash-nav-card--active {
  background: rgba(30,41,59,0.8);
  box-shadow: 0 12px 32px rgba(0,0,0,0.4);
}

/* ── Card Color Themes ── */
.dash-nav-card--work .dash-nav-card__indicator { background: #10b981; }
.dash-nav-card--amber .dash-nav-card__indicator { background: #f59e0b; }
.dash-nav-card--red .dash-nav-card__indicator { background: #ef4444; }

.dash-nav-card--work .dash-nav-card__glow { background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%); }
.dash-nav-card--amber .dash-nav-card__glow { background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%); }
.dash-nav-card--red .dash-nav-card__glow { background: radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%); }

.dash-nav-card--work .dash-nav-card__title { color: #10b981; }
.dash-nav-card--amber .dash-nav-card__title { color: #f59e0b; }
.dash-nav-card--red .dash-nav-card__title { color: #ef4444; }

.dash-nav-card--work.dash-nav-card--active { border-color: rgba(16,185,129,0.5); }
.dash-nav-card--amber.dash-nav-card--active { border-color: rgba(245,158,11,0.5); }
.dash-nav-card--red.dash-nav-card--active { border-color: rgba(239,68,68,0.5); }

/* Left indicator bar */
.dash-nav-card__indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: opacity 0.3s, width 0.3s;
}
.dash-nav-card--active .dash-nav-card__indicator {
  opacity: 1;
  width: 5px;
  box-shadow: 0 0 12px currentColor;
}

/* Background glow */
.dash-nav-card__glow {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 120px;
  height: 120px;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.dash-nav-card--active .dash-nav-card__glow {
  opacity: 1;
}

.dash-nav-card__body {
  position: relative;
  z-index: 1;
  padding: 18px 18px 18px 22px;
}

.dash-nav-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dash-nav-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dash-nav-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-nav-card--active .dash-nav-card__title {
  color: #f1f5f9;
}

.dash-nav-card__badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 15px;
  flex-shrink: 0;
}
.dash-nav-card__badge--normal {
  background: rgba(16,185,129,0.15);
  color: #10b981;
}
.dash-nav-card__badge--alert {
  background: #ef4444;
  color: #ffffff;
  min-width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

.dash-nav-card__stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.dash-nav-card__stat {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.dash-nav-card__stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dash-nav-card__stat-label {
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dash-nav-card__stat-value {
  font-size: 16px;
  font-weight: 800;
  color: #f1f5f9;
  margin-left: auto;
}
.dash-nav-card__stat-value--alert {
  background: #ef4444;
  color: #ffffff;
  min-width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

/* ── Detail Pane ── */
.dash-detail-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  height: 100%;
  min-height: 0;
}

.dash-detail {
  background: rgba(30,41,59,0.35);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  backdrop-filter: blur(16px);
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  transition: all 0.3s ease;
}
.dash-detail--work { border-color: #10b981; }
.dash-detail--quote { border-color: #f59e0b; }
.dash-detail--renewal { border-color: #ef4444; }
.dash-detail-col--expanded {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: rgba(15,23,42,0.85);
  backdrop-filter: blur(10px);
  padding: 40px 10%;
  box-sizing: border-box;
}
.dash-detail-col--expanded .dash-detail {
  box-shadow: 0 30px 100px rgba(0,0,0,0.5);
}

.dash-detail__inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Floating Actions */
.dash-floating-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  margin-top: 4px;
}
.dash-floating-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
}
.dash-floating-btn--nav {
  color: #fff;
  padding: 12px 32px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.dash-floating-btn--nav-work { background: linear-gradient(135deg, #059669, #10b981); }
.dash-floating-btn--nav-quote { background: linear-gradient(135deg, #d97706, #f59e0b); }
.dash-floating-btn--nav-renewal { background: linear-gradient(135deg, #b91c1c, #ef4444); }

.dash-floating-btn--nav:hover {
  transform: translateY(-3px);
}
.dash-floating-btn--nav-work:hover { box-shadow: 0 12px 32px rgba(16,185,129,0.35); }
.dash-floating-btn--nav-quote:hover { box-shadow: 0 12px 32px rgba(245,158,11,0.35); }
.dash-floating-btn--nav-renewal:hover { box-shadow: 0 12px 32px rgba(239,68,68,0.35); }

.dash-floating-btn--expand {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(30,41,59,0.8);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0;
}
.dash-floating-btn--expand-work { color: #10b981; }
.dash-floating-btn--expand-quote { color: #f59e0b; }
.dash-floating-btn--expand-renewal { color: #ef4444; }

.dash-floating-btn--expand:hover {
  transform: translateY(-3px);
}
.dash-floating-btn--expand-work:hover {
  background: rgba(16,185,129,0.15);
  border-color: rgba(16,185,129,0.4);
}
.dash-floating-btn--expand-quote:hover {
  background: rgba(245,158,11,0.15);
  border-color: rgba(245,158,11,0.4);
}
.dash-floating-btn--expand-renewal:hover {
  background: rgba(239,68,68,0.15);
  border-color: rgba(239,68,68,0.4);
}

/* Banner */
.dash-detail__banner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px 28px;
  flex-shrink: 0;
}
.dash-detail__banner-title {
  color: #fff;
  margin: 0;
  font-size: 20px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.dash-detail__nav-btn {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.25);
  padding: 8px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
}
.dash-detail__nav-btn:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

/* Content area */
.dash-detail__content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.dash-detail__content::-webkit-scrollbar {
  width: 6px;
}
.dash-detail__content::-webkit-scrollbar-track {
  background: transparent;
}
.dash-detail__content::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
}
.dash-detail__content::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.2);
}

/* Sections inside detail */
.dash-detail__section {
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(15,23,42,0.3);
  transition: border-color 0.3s;
}
.dash-detail__section:hover {
  border-color: rgba(255,255,255,0.1);
}
.dash-detail__section--green {}
.dash-detail__section--amber {}
.dash-detail__section--red {}

.dash-detail__section-title {
  font-size: 18px;
  margin: 0 0 10px 0;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid currentColor;
  cursor: pointer;
  transition: opacity 0.2s;
}
.dash-detail__section-title:hover {
  opacity: 0.8;
}

/* List */
.dash-detail__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dash-detail__list-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 30px;
  color: #e2e8f0;
  line-height: 1.5;
  cursor: pointer;
  padding: 7px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.dash-detail__list-item:hover {
  background: rgba(56,189,248,0.06);
  border-color: rgba(56,189,248,0.1);
  color: #38bdf8;
}
.dash-detail__list-num {
  font-weight: 800;
  flex-shrink: 0;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 2px;
}

.dash-detail__empty {
  padding: 28px 20px;
  text-align: center;
  color: #475569;
  font-size: 14px;
  font-style: italic;
  border: 1px dashed rgba(255,255,255,0.08);
  border-radius: 12px;
}

/* ── Renewal Tab/Body ── */
.dash-renewal-tab {
  background: linear-gradient(135deg, #10b981, #059669);
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 8px 8px 0 0;
  color: white;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
  box-shadow: 0 -4px 16px rgba(16,185,129,0.2);
  border: 1px solid rgba(16,185,129,0.5);
  border-bottom: none;
}

.dash-renewal-body {
  border: 1px solid rgba(16,185,129,0.25);
  border-radius: 0 14px 14px 14px;
  background: rgba(15,23,42,0.5);
  position: relative;
  z-index: 1;
  margin-top: -1px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  overflow: hidden;
}

.dash-renewal-customer {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(16,185,129,0.15);
  background: rgba(16,185,129,0.03);
  border-top-right-radius: 14px;
}

.dash-renewal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  text-align: left;
}
.dash-renewal-table thead tr {
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.dash-renewal-table th {
  padding: 8px 6px;
  color: #64748b;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.dash-renewal-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: all 0.2s;
  cursor: pointer;
}
.dash-renewal-table tbody tr:hover {
  background: rgba(56,189,248,0.06);
}
.dash-renewal-table td {
  padding: 10px 6px;
  font-size: 14px;
  font-weight: 500;
}

/* ── Data Table ── */
.dash-data-table {
  width: 100%;
  border-collapse: collapse;
}
.dash-data-table thead tr {
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.dash-data-table th {
  padding: 10px 12px;
  color: #64748b;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-align: left;
}
.dash-data-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: all 0.15s;
  cursor: pointer;
}
.dash-data-table tbody tr:hover {
  background: rgba(56,189,248,0.06);
}
.dash-data-table td {
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
}
.dash-data-table__num {
  text-align: center;
  color: #475569 !important;
  font-weight: 700 !important;
}

/* ── Status Chips ── */
.dash-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.dash-chip--green { background: rgba(16,185,129,0.15); color: #34d399; }
.dash-chip--amber { background: rgba(245,158,11,0.15); color: #fbbf24; }
.dash-chip--red { background: rgba(239,68,68,0.15); color: #f87171; }

/* ── Banner Stats ── */
.dash-banner-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0,0,0,0.15);
  padding: 5px 14px;
  border-radius: 8px;
}
.dash-banner-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255,255,255,0.9);
}
.dash-banner-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

/* ── Animations ── */
@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .dash-grid {
    grid-template-columns: 1fr;
  }
  .dash-sidebar {
    position: static;
  }
  .dash-detail {
    height: auto;
    min-height: 60vh;
  }
}
</style>


