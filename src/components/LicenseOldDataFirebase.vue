<template>
  <div
    class="sr-page license-page page"
    :class="[
      { 'theme-light-blue': uiTheme === 'light', 'is-mobile-shell': isMobileShell },
      isMobileShell ? 'm-tab-' + mobileActiveTab : ''
    ]"
    @click="showDisplaySettingPopover = false"
  >
    <!-- Minimal Page Identity Header (chuẩn SaleReportFirebase.vue) -->
    <header class="bg-topbar">
      <div class="bg-topbar-left">
        <div class="bg-brand-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div class="bg-title-wrap">
          <div class="bg-title-row">
            <h1 class="bg-title">Quản Lý License</h1>
            <span v-if="!isMobileShell" class="bg-count-pill">
              {{ filteredData.length }} / {{ rawData.length }} License
            </span>
          </div>
          <p class="bg-subtitle">Theo dõi thời hạn bản quyền, hiệu lực gia hạn &amp; hồ sơ chứng từ License theo từng công ty</p>
        </div>
      </div>
    </header>

    <!-- Thanh Tìm kiếm mỏng + Dải Chip Bộ lọc đang bật trên Mobile (Thay cho 3 hàng nút cũ) -->
    <div v-if="isMobileShell && mobileActiveTab === 'overview'" class="lic-mob-top-search-wrap" @click.stop>
      <div class="lic-mob-search-row">
        <div class="lic-mob-search-box">
          <svg class="lic-mob-search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchQuery"
            type="text"
            class="lic-mob-search-input"
            placeholder="Tìm công ty, License ID, sản phẩm, số PO..."
          />
          <button
            v-if="searchQuery"
            type="button"
            class="lic-mob-search-clear"
            @click="searchQuery = ''"
            title="Xóa từ khóa"
          >✕</button>
        </div>

        <button
          type="button"
          class="lic-mob-refresh-btn"
          :disabled="loading"
          @click="fetchData"
          title="Tải lại dữ liệu"
        >
          <svg :class="{ spin: loading }" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>

      <div v-if="mobileActiveFilterChips.length > 0" class="lic-mob-active-chips">
        <button
          v-for="chip in mobileActiveFilterChips"
          :key="chip.key"
          type="button"
          class="lic-mob-filter-chip"
          @click="chip.clear()"
        >
          <span>{{ chip.label }}</span>
          <span class="lic-mfc-x">✕</span>
        </button>
        <button
          v-if="mobileActiveFilterChips.length > 1"
          type="button"
          class="lic-mob-filter-chip is-reset-all"
          @click="resetMobileSheetFilters()"
        >
          <span>Đặt lại lọc</span>
        </button>
      </div>
    </div>

    <!-- Top Summary Dashboard: Phương án 1 Slim (1 Card / 1 Hàng trên Mobile) + Thanh Gập Nhanh PA2 -->
    <div class="sr-top-summary" v-if="!loading && rawData.length > 0 && (isMobileShell ? mobileActiveTab === 'overview' : !isKpiCollapsed)">
      <!-- Thanh gập nhanh KPI Tổng 1 chạm trên Mobile (Phương án 2) -->
      <div
        v-if="isMobileShell"
        class="lic-mob-kpi-collapse-bar"
        :class="{ 'is-collapsed': isKpiCollapsed }"
        @click="isKpiCollapsed = !isKpiCollapsed"
      >
        <div class="lic-mkcb-left">
          <span class="lic-mkcb-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </span>
          <span v-if="!isKpiCollapsed" class="lic-mkcb-title">Chỉ số bản quyền (4 thẻ)</span>
          <div v-else class="lic-mkcb-summary-pills">
            <span class="lic-mkcb-chip">Tổng: <strong>{{ baseData.length }}</strong></span>
            <span class="lic-mkcb-chip is-emerald">Còn hạn: <strong>{{ kpiStats.conHan }}</strong></span>
            <span class="lic-mkcb-chip" :class="kpiStats.quaHan > 0 ? 'is-rose' : 'is-emerald'">Quá hạn: <strong>{{ kpiStats.quaHan }}</strong></span>
            <span v-if="kpiStats.daXuLy > 0" class="lic-mkcb-chip is-sky">Đã XL: <strong>{{ kpiStats.daXuLy }}</strong></span>
          </div>
        </div>
        <button type="button" class="lic-mkcb-btn" @click.stop="isKpiCollapsed = !isKpiCollapsed">
          <span>{{ isKpiCollapsed ? 'Mở rộng' : 'Thu gọn' }}</span>
          <svg :style="{ transform: isKpiCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      <div v-show="!isKpiCollapsed" class="sr-super-bento-grid">
        <!-- CARD 1: Quy mô Kho Bản quyền | Tổng License + Cty & Hãng NSX -->
        <article class="sr-sb-card sb-card-revenue lic-kpi-card">
          <div class="sr-sb-head">
            <div class="sr-sb-title-cluster">
              <span class="sr-sb-icon is-blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <h3 class="sr-sb-title">Quy mô Kho Bản quyền</h3>
            </div>
            <div class="sr-sb-quick-acts">
              <button type="button" class="sr-sb-act-pill" @click.stop="setQuickFilter('all')" title="Hiển thị toàn bộ License">
                <span>Xem tất cả</span>
              </button>
            </div>
          </div>

          <div class="lic-kpi-hero-split" @click="setQuickFilter('all')" title="Nhấn để xem toàn bộ License">
            <div class="lic-kpi-hero-left">
              <div class="sr-sb-hero-val money-white">
                {{ baseData.length }}
                <span class="sr-sb-unit">LICENSE</span>
              </div>
              <span class="lic-kpi-hero-sub">Tổng chứng nhận hệ thống</span>
            </div>
            <div class="lic-kpi-mini-stack">
              <div class="lic-kpi-mini-pill">
                <span class="lic-kpi-mini-lbl">Khách hàng</span>
                <strong class="lic-kpi-mini-val">{{ totalGroupsCount }} <small>Cty</small></strong>
              </div>
              <div class="lic-kpi-mini-pill">
                <span class="lic-kpi-mini-lbl">Nhà sản xuất</span>
                <strong class="lic-kpi-mini-val">{{ uniqueNhaSanXuat.length }} <small>Hãng</small></strong>
              </div>
            </div>
          </div>

          <div class="lic-kpi-health-foot">
            <div class="lic-kpi-health-meta">
              <span class="lic-kpi-health-lbl">Đang hiển thị theo bộ lọc</span>
              <strong class="lic-kpi-health-pct is-blue">{{ allCustomerGroups.length }}/{{ totalGroupsCount }} Công ty</strong>
            </div>
            <div class="lic-kpi-seg-track" aria-hidden="true">
              <div
                class="lic-kpi-seg-fill is-sky"
                :style="{ width: (totalGroupsCount > 0 ? Math.round((allCustomerGroups.length / totalGroupsCount) * 100) : 100) + '%' }"
              ></div>
            </div>
          </div>
        </article>

        <!-- CARD 2: Thời hạn Bản quyền | Dual-Stat (Còn hạn vs Quá hạn) + Segmented Health Bar -->
        <article class="sr-sb-card sb-card-com lic-kpi-card" :class="{ 'has-alert': kpiStats.quaHan > 0 }">
          <div class="sr-sb-head">
            <div class="sr-sb-title-cluster">
              <span class="sr-sb-icon is-emerald">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <h3 class="sr-sb-title">Thời hạn Bản quyền</h3>
            </div>
            <div class="sr-sb-quick-acts">
              <button
                v-if="kpiStats.daXuLy > 0"
                type="button"
                class="sr-sb-act-pill"
                :class="{ 'is-active-filter': quickFilter === 'da_xu_ly' }"
                @click.stop="setQuickFilter(quickFilter === 'da_xu_ly' ? 'all' : 'da_xu_ly')"
                title="Lọc xem các License đã xử lý (Đã gia hạn / Không gia hạn)"
              >
                <span>Đã xử lý ({{ kpiStats.daXuLy }})</span>
              </button>
              <button
                type="button"
                class="sr-sb-act-pill"
                :class="{ 'is-active-filter': filterExpirationStatus !== 'all' }"
                @click.stop="setQuickFilter(filterExpirationStatus !== 'all' ? 'all' : 'con_han')"
                title="Lọc nhanh các License đang còn hạn"
              >
                <span>{{ filterExpirationStatus !== 'all' ? 'Bỏ lọc' : 'Lọc Còn hạn' }}</span>
              </button>
            </div>
          </div>

          <div class="lic-kpi-dual-grid is-triple">
            <div
              class="lic-kpi-stat-box is-emerald"
              :class="{ 'is-selected': filterExpirationStatus === 'active' }"
              @click="setQuickFilter(filterExpirationStatus === 'active' ? 'all' : 'con_han')"
              title="Click để lọc các License đang còn hạn"
            >
              <div class="lic-kpi-stat-top">
                <span class="lic-kpi-dot is-emerald"></span>
                <span class="lic-kpi-stat-tag">CÒN HẠN</span>
              </div>
              <div class="lic-kpi-stat-num money-green">{{ kpiStats.conHan }}</div>
              <div class="lic-kpi-stat-sub">Đang hoạt động</div>
            </div>

            <div
              class="lic-kpi-stat-box"
              :class="[
                kpiStats.quaHan > 0 ? 'is-rose' : 'is-neutral',
                { 'is-selected': filterExpirationStatus === 'expired' }
              ]"
              @click="setQuickFilter(filterExpirationStatus === 'expired' ? 'all' : 'qua_han')"
              title="Click để lọc các License quá hạn CHƯA XỬ LÝ"
            >
              <div class="lic-kpi-stat-top">
                <span class="lic-kpi-dot" :class="kpiStats.quaHan > 0 ? 'is-rose' : 'is-emerald'"></span>
                <span class="lic-kpi-stat-tag">CHƯA XỬ LÝ</span>
              </div>
              <div class="lic-kpi-stat-num" :class="kpiStats.quaHan > 0 ? 'money-red' : 'money-green'">{{ kpiStats.quaHan }}</div>
              <div class="lic-kpi-stat-sub">{{ kpiStats.quaHan > 0 ? 'Quá hạn' : 'Không quá hạn' }}</div>
            </div>

            <div
              class="lic-kpi-stat-box is-sky"
              :class="{ 'is-selected': quickFilter === 'da_xu_ly' }"
              @click="setQuickFilter(quickFilter === 'da_xu_ly' ? 'all' : 'da_xu_ly')"
              title="Click để lọc xem các License quá hạn ĐÃ XỬ LÝ (Đã gia hạn / Không gia hạn)"
            >
              <div class="lic-kpi-stat-top">
                <span class="lic-kpi-dot is-sky"></span>
                <span class="lic-kpi-stat-tag">ĐÃ XỬ LÝ</span>
              </div>
              <div class="lic-kpi-stat-num money-blue">{{ kpiStats.daXuLyExp }}</div>
              <div class="lic-kpi-stat-sub">{{ kpiStats.daGiaHan }} GH · {{ kpiStats.khongGiaHan }} Ngưng</div>
            </div>
          </div>

          <div class="lic-kpi-health-foot">
            <div class="lic-kpi-health-meta">
              <span class="lic-kpi-health-lbl">Sức khỏe bản quyền</span>
              <strong class="lic-kpi-health-pct" :class="kpiStats.quaHan > 0 ? 'is-amber' : 'is-emerald'">
                {{ baseData.length > 0 ? Math.round(((kpiStats.conHan + kpiStats.daXuLyExp) / Math.max(1, kpiStats.conHan + kpiStats.quaHan + kpiStats.daXuLyExp)) * 100) : 0 }}% đảm bảo
              </strong>
            </div>
            <div class="lic-kpi-seg-track" aria-hidden="true">
              <div
                class="lic-kpi-seg-fill is-good"
                :style="{ width: (baseData.length > 0 ? Math.round(((kpiStats.conHan + kpiStats.daXuLyExp) / Math.max(1, kpiStats.conHan + kpiStats.quaHan + kpiStats.daXuLyExp)) * 100) : 0) + '%' }"
              ></div>
              <div
                v-if="kpiStats.quaHan > 0"
                class="lic-kpi-seg-fill is-bad"
                :style="{ width: Math.max(4, 100 - Math.round(((kpiStats.conHan + kpiStats.daXuLyExp) / Math.max(1, kpiStats.conHan + kpiStats.quaHan + kpiStats.daXuLyExp)) * 100)) + '%' }"
              ></div>
            </div>
          </div>
        </article>

        <!-- CARD 3: Hiệu lực Gia hạn (Ân hạn) | 3 Khối (Còn hiệu lực • Chưa xử lý • Đã xử lý) -->
        <article class="sr-sb-card sb-card-margin lic-kpi-card" :class="{ 'has-alert': kpiStats.quaHieuLuc > 0 }">
          <div class="sr-sb-head">
            <div class="sr-sb-title-cluster">
              <span class="sr-sb-icon" :class="kpiStats.quaHieuLuc > 0 ? 'is-red' : 'is-emerald'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </span>
              <h3 class="sr-sb-title">Hiệu lực Gia hạn</h3>
            </div>
            <div class="sr-sb-quick-acts">
              <button
                type="button"
                class="sr-sb-act-pill"
                :class="{ 'is-active-filter': filterGraceStatus !== 'all' }"
                @click.stop="setQuickFilter(filterGraceStatus !== 'all' ? 'all' : 'con_hieu_luc')"
                title="Lọc nhanh các License còn hiệu lực gia hạn"
              >
                <span>{{ filterGraceStatus !== 'all' ? 'Bỏ lọc' : 'Lọc Hiệu lực' }}</span>
              </button>
            </div>
          </div>

          <div class="lic-kpi-dual-grid is-triple">
            <div
              class="lic-kpi-stat-box is-emerald"
              :class="{ 'is-selected': filterGraceStatus === 'active' }"
              @click="setQuickFilter(filterGraceStatus === 'active' ? 'all' : 'con_hieu_luc')"
              title="Click để lọc các License còn hiệu lực ân hạn"
            >
              <div class="lic-kpi-stat-top">
                <span class="lic-kpi-dot is-emerald"></span>
                <span class="lic-kpi-stat-tag">CÒN HL</span>
              </div>
              <div class="lic-kpi-stat-num money-green">{{ kpiStats.conHieuLuc }}</div>
              <div class="lic-kpi-stat-sub">Trong ân hạn</div>
            </div>

            <div
              class="lic-kpi-stat-box"
              :class="[
                kpiStats.quaHieuLuc > 0 ? 'is-rose' : 'is-neutral',
                { 'is-selected': filterGraceStatus === 'expired' }
              ]"
              @click="setQuickFilter(filterGraceStatus === 'expired' ? 'all' : 'qua_hieu_luc')"
              title="Click để lọc các License quá hiệu lực CHƯA XỬ LÝ"
            >
              <div class="lic-kpi-stat-top">
                <span class="lic-kpi-dot" :class="kpiStats.quaHieuLuc > 0 ? 'is-rose' : 'is-emerald'"></span>
                <span class="lic-kpi-stat-tag">CHƯA XỬ LÝ</span>
              </div>
              <div class="lic-kpi-stat-num" :class="kpiStats.quaHieuLuc > 0 ? 'money-red' : 'money-green'">{{ kpiStats.quaHieuLuc }}</div>
              <div class="lic-kpi-stat-sub">{{ kpiStats.quaHieuLuc > 0 ? 'Quá hiệu lực' : 'Đảm bảo 100%' }}</div>
            </div>

            <div
              class="lic-kpi-stat-box is-sky"
              :class="{ 'is-selected': quickFilter === 'da_xu_ly' }"
              @click="setQuickFilter(quickFilter === 'da_xu_ly' ? 'all' : 'da_xu_ly')"
              title="Click để lọc xem các License quá hiệu lực ĐÃ XỬ LÝ"
            >
              <div class="lic-kpi-stat-top">
                <span class="lic-kpi-dot is-sky"></span>
                <span class="lic-kpi-stat-tag">ĐÃ XỬ LÝ</span>
              </div>
              <div class="lic-kpi-stat-num money-blue">{{ kpiStats.daXuLyGrace }}</div>
              <div class="lic-kpi-stat-sub">Quá HL đã xử lý</div>
            </div>
          </div>

          <div class="lic-kpi-health-foot">
            <div class="lic-kpi-health-meta">
              <span class="lic-kpi-health-lbl">Tỷ lệ trong hạn ân hạn</span>
              <strong class="lic-kpi-health-pct" :class="kpiStats.quaHieuLuc > 0 ? 'is-rose' : 'is-emerald'">
                {{ (kpiStats.conHieuLuc + kpiStats.quaHieuLuc + kpiStats.daXuLyGrace) > 0 ? Math.round(((kpiStats.conHieuLuc + kpiStats.daXuLyGrace) / (kpiStats.conHieuLuc + kpiStats.quaHieuLuc + kpiStats.daXuLyGrace)) * 100) : 100 }}% an toàn
              </strong>
            </div>
            <div class="lic-kpi-seg-track" aria-hidden="true">
              <div
                class="lic-kpi-seg-fill is-good"
                :style="{ width: ((kpiStats.conHieuLuc + kpiStats.quaHieuLuc + kpiStats.daXuLyGrace) > 0 ? Math.round(((kpiStats.conHieuLuc + kpiStats.daXuLyGrace) / (kpiStats.conHieuLuc + kpiStats.quaHieuLuc + kpiStats.daXuLyGrace)) * 100) : 100) + '%' }"
              ></div>
              <div
                v-if="kpiStats.quaHieuLuc > 0"
                class="lic-kpi-seg-fill is-bad"
                :style="{ width: Math.max(4, 100 - Math.round(((kpiStats.conHieuLuc + kpiStats.daXuLyGrace) / Math.max(1, kpiStats.conHieuLuc + kpiStats.quaHieuLuc + kpiStats.daXuLyGrace)) * 100)) + '%' }"
              ></div>
            </div>
          </div>
        </article>

        <!-- CARD 4: Đồng bộ Đơn hàng PO & Mã Khách hàng chuẩn -->
        <article class="sr-sb-card sb-card-debt lic-kpi-card">
          <div class="sr-sb-head">
            <div class="sr-sb-title-cluster">
              <span class="sr-sb-icon" :class="kpiStats.linkedPo > 0 ? 'is-emerald' : 'is-blue'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </span>
              <h3 class="sr-sb-title">Liên kết PO &amp; Mã KH</h3>
            </div>
            <div class="sr-sb-quick-acts">
              <button
                type="button"
                class="sr-sb-act-pill"
                :class="{ 'is-active-filter': quickFilter !== 'all' }"
                @click.stop="setQuickFilter(quickFilter !== 'all' ? 'all' : 'linked_po')"
                title="Lọc các License đã liên kết đơn hàng PO chính thức"
              >
                <span>{{ quickFilter !== 'all' ? 'Bỏ lọc' : 'Đã gắn PO' }}</span>
              </button>
            </div>
          </div>

          <div class="lic-kpi-dual-grid">
            <div
              class="lic-kpi-stat-box is-emerald"
              :class="{ 'is-selected': quickFilter === 'linked_po' || quickFilter === 'unlinked_po' }"
              @click="setQuickFilter(quickFilter === 'linked_po' ? 'all' : 'linked_po')"
              title="Click để lọc các License đã gắn đơn hàng PO"
            >
              <div class="lic-kpi-stat-top">
                <span class="lic-kpi-dot is-emerald"></span>
                <span class="lic-kpi-stat-tag">ĐÃ GẮN PO</span>
              </div>
              <div class="lic-kpi-stat-num money-green">{{ kpiStats.linkedPo }}</div>
              <button
                type="button"
                class="lic-kpi-sub-action"
                @click.stop="setQuickFilter(quickFilter === 'unlinked_po' ? 'all' : 'unlinked_po')"
                title="Click để lọc các License chưa gắn PO"
              >
                Chưa gắn: <strong>{{ kpiStats.unlinkedPo }}</strong>
              </button>
            </div>

            <div
              class="lic-kpi-stat-box is-sky"
              :class="{ 'is-selected': quickFilter === 'linked_kh' || quickFilter === 'unlinked_kh' }"
              @click="setQuickFilter(quickFilter === 'linked_kh' ? 'all' : 'linked_kh')"
              title="Click để lọc các License đã khớp Mã KH chuẩn"
            >
              <div class="lic-kpi-stat-top">
                <span class="lic-kpi-dot is-sky"></span>
                <span class="lic-kpi-stat-tag">KHỚP MÃ KH</span>
              </div>
              <div class="lic-kpi-stat-num money-blue">{{ kpiStats.linkedKh }}</div>
              <button
                type="button"
                class="lic-kpi-sub-action"
                :class="{ 'is-warn': kpiStats.unlinkedKh > 0 }"
                @click.stop="setQuickFilter(quickFilter === 'unlinked_kh' ? 'all' : 'unlinked_kh')"
                title="Click để lọc nhanh các License chưa gắn Mã KH chuẩn"
              >
                Chưa khớp: <strong>{{ kpiStats.unlinkedKh }}</strong>
              </button>
            </div>
          </div>

          <div class="lic-kpi-health-foot">
            <div class="lic-kpi-health-meta">
              <span class="lic-kpi-health-lbl">Đồng bộ dữ liệu chuẩn DB</span>
              <strong class="lic-kpi-health-pct is-emerald">{{ linkedKhPct }}% Mã KH</strong>
            </div>
            <div class="lic-kpi-seg-track" aria-hidden="true">
              <div
                class="lic-kpi-seg-fill is-good"
                :style="{ width: Math.min(100, Math.max(0, linkedKhPct)) + '%' }"
              ></div>
              <div
                v-if="kpiStats.unlinkedKh > 0"
                class="lic-kpi-seg-fill is-warn"
                :style="{ width: Math.max(4, 100 - Math.min(100, Math.max(0, linkedKhPct))) + '%' }"
              ></div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Trạng thái Đang tải dữ liệu -->
    <div v-if="loading" class="lic-state-box">
      <div class="spinner-small" style="margin: 0 auto;"></div>
      <div class="lic-state-text">Đang tải dữ liệu License từ hệ thống...</div>
    </div>

    <!-- Không gian Quản lý License (Tỉ lệ 3:7 chuẩn SaleReportFirebase.vue — Cột trái Danh sách công ty & Bộ lọc | Cột phải Header File Folder + Tác vụ/Thiết lập + Card License) -->
    <div class="sr-groups-container" v-else>
      <div class="sr-workspace-layout" :class="{ 'is-master-detail': viewMode !== 'all' && layoutViewMode === 'master-detail' }">
        <!-- CỘT TRÁI (30%): DANH SÁCH CÔNG TY + TÌM KIẾM & BỘ LỌC TÍCH HỢP (PC) -->
        <aside
          v-if="!isMobileShell"
          class="sr-md-sidebar"
          :class="{ 'is-stacked-filter-bar': viewMode === 'all' || layoutViewMode === 'stacked-groups' }"
        >
          <div class="sr-md-sidebar-head">
            <!-- Dòng 1: Tiêu đề Danh sách công ty / Tất cả License + Cụm nút Đặt lại / Bộ lọc / Làm mới -->
            <div class="sr-md-sh-top">
              <div class="sr-md-sh-title-group">
                <span class="sr-md-sh-title">{{ viewMode === 'all' ? 'Tất cả License' : 'Danh sách công ty' }}</span>
                <span class="sr-md-sh-plain-count">({{ allCustomerGroups.length }}/{{ totalRawCustomerCount }} Cty • {{ filteredData.length }} License)</span>
              </div>

              <div class="sr-md-sh-actions">
                <button
                  v-if="activeFilterCount > 0"
                  type="button"
                  class="sr-sb-head-btn is-reset"
                  @click="resetAllFilters"
                  title="Xoá toàn bộ điều kiện lọc"
                >
                  <span>Đặt lại ({{ activeFilterCount }})</span>
                </button>

                <button
                  type="button"
                  class="sr-sb-head-btn is-filter-toggle"
                  :class="{ active: isSidebarFilterExpanded || activeFilterCount > 0 }"
                  @click="isSidebarFilterExpanded = !isSidebarFilterExpanded"
                  title="Đóng/Mở bộ lọc chi tiết"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  <span>Bộ lọc</span>
                  <span v-if="activeFilterCount > 0" class="sr-sb-filter-count">{{ activeFilterCount }}</span>
                </button>

                <button
                  type="button"
                  class="sr-sb-head-btn"
                  @click="fetchData"
                  :disabled="loading"
                  title="Tải lại dữ liệu từ Firebase"
                >
                  <svg :class="{ spin: loading }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                </button>
              </div>
            </div>

            <!-- Dòng 2: Thanh tìm kiếm hợp nhất -->
            <div class="bg-search-shell sr-sidebar-search-shell">
              <svg class="bg-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm tên công ty, License ID, sản phẩm, mã SP..."
              />
              <button v-if="searchQuery" type="button" class="bg-search-clear" @click="searchQuery = ''" title="Xoá từ khoá">&times;</button>
            </div>

            <!-- Dòng 2.5: 2 Option chuyển chế độ hiển thị Tên Công Ty (DB) / Tên trên License -->
            <div class="lic-company-name-mode-switch" role="tablist" aria-label="Chế độ hiển thị tên công ty">
              <button
                type="button"
                class="lic-cnm-btn"
                :class="{ active: companyNameDisplayMode === 'db' }"
                @click="setCompanyNameDisplayMode('db')"
                title="Hiển thị và gom nhóm theo Tên Công Ty chuẩn trong Database"
              >
                <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                <span>Tên Công Ty (DB)</span>
              </button>
              <button
                type="button"
                class="lic-cnm-btn"
                :class="{ active: companyNameDisplayMode === 'license' }"
                @click="setCompanyNameDisplayMode('license')"
                title="Hiển thị và gom nhóm theo tên khách hàng gốc trên file License"
              >
                <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span>Tên trên License</span>
              </button>
            </div>

            <!-- Dòng 3: Khối Bộ lọc tích hợp ngay trong phần Danh sách công ty -->
            <div v-show="isSidebarFilterExpanded" class="sr-sidebar-filter-panel">
              <!-- Lọc Mốc thời gian tính toán -->
              <div class="sr-sb-time-block">
                <div class="sr-sb-time-top">
                  <div class="bg-seg-group sr-sb-seg-group is-full-width-5">
                    <button type="button" class="bg-seg-btn" :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">Hiện tại</button>
                    <button type="button" class="bg-seg-btn" :class="{ active: filterMode === 'day' }" @click="filterMode = 'day'">Ngày</button>
                    <button type="button" class="bg-seg-btn" :class="{ active: filterMode === 'week' }" @click="filterMode = 'week'">Tuần</button>
                    <button type="button" class="bg-seg-btn" :class="{ active: filterMode === 'month' }" @click="filterMode = 'month'">Tháng</button>
                    <button type="button" class="bg-seg-btn" :class="{ active: filterMode === 'year' }" @click="filterMode = 'year'">Năm</button>
                  </div>
                </div>

                <div v-if="filterMode !== 'all'" class="sr-sb-time-range-row is-single-capsule">
                  <div v-if="filterMode === 'day'" class="bg-date-capsule sr-sb-date-capsule">
                    <span class="sr-date-cap-lbl">Ngày mốc:</span>
                    <input type="date" v-model="filterDate" />
                  </div>
                  <div v-else-if="filterMode === 'week'" class="bg-date-capsule sr-sb-date-capsule">
                    <span class="sr-date-cap-lbl">Tuần mốc:</span>
                    <input type="week" v-model="filterWeek" />
                  </div>
                  <div v-else-if="filterMode === 'month'" class="bg-date-capsule sr-sb-date-capsule">
                    <span class="sr-date-cap-lbl">Tháng mốc:</span>
                    <input type="month" v-model="filterMonth" />
                  </div>
                  <div v-else-if="filterMode === 'year'" class="bg-date-capsule sr-sb-date-capsule">
                    <button type="button" class="bg-period-step-btn" @click="filterYear--">−</button>
                    <span class="sr-date-cap-lbl" style="font-weight: 800;">Năm {{ filterYear }}</span>
                    <button type="button" class="bg-period-step-btn" @click="filterYear++">+</button>
                  </div>
                </div>
              </div>

              <!-- Lưới Pill Pickers trong Sidebar -->
              <div class="sr-sidebar-pickers-grid">
                <!-- 1. Khách hàng -->
                <div class="pl-picker-wrap is-full-span">
                  <div class="pl-picker-trigger" :class="{ 'has-value': filterCustomer !== 'all' }">
                    <span class="pl-picker-tag">KH:</span>
                    <select v-model="filterCustomer" class="pl-picker-native-select">
                      <option value="all">Tất cả khách hàng ({{ uniqueCustomer.length }})</option>
                      <option v-for="item in uniqueCustomer" :key="item" :value="item">{{ item }}</option>
                    </select>
                  </div>
                </div>

                <!-- 2. Nhà sản xuất (Hãng) -->
                <div class="pl-picker-wrap">
                  <div class="pl-picker-trigger" :class="{ 'has-value': filterNhaSanXuat !== 'all' }">
                    <span class="pl-picker-tag">Hãng:</span>
                    <select v-model="filterNhaSanXuat" class="pl-picker-native-select">
                      <option value="all">Tất cả ({{ uniqueNhaSanXuat.length }})</option>
                      <option v-for="item in uniqueNhaSanXuat" :key="item" :value="item">{{ item }}</option>
                    </select>
                  </div>
                </div>

                <!-- 3. Liên kết PO / Mã KH & Trạng thái xử lý -->
                <div class="pl-picker-wrap is-right-col">
                  <div class="pl-picker-trigger" :class="{ 'has-value': quickFilter !== 'all' }">
                    <span class="pl-picker-tag">Lọc nhanh:</span>
                    <select v-model="quickFilter" class="pl-picker-native-select">
                      <option value="all">Tất cả</option>
                      <option value="da_xu_ly">Đã xử lý ({{ kpiStats.daXuLy }})</option>
                      <option value="da_gia_han">↳ Đã gia hạn ({{ kpiStats.daGiaHan }})</option>
                      <option value="khong_gia_han">↳ Không gia hạn ({{ kpiStats.khongGiaHan }})</option>
                      <option value="linked_po">Đã gắn PO</option>
                      <option value="unlinked_po">Chưa gắn PO</option>
                      <option value="linked_kh">Đã gắn Mã KH</option>
                      <option value="unlinked_kh">Chưa gắn Mã KH</option>
                    </select>
                  </div>
                </div>

                <!-- 4. Thời hạn bản quyền -->
                <div class="pl-picker-wrap">
                  <div class="pl-picker-trigger" :class="{ 'has-value': filterExpirationStatus !== 'all' }">
                    <span class="pl-picker-tag">Hạn:</span>
                    <select v-model="filterExpirationStatus" class="pl-picker-native-select">
                      <option value="all">Tất cả</option>
                      <option value="active">Còn hạn</option>
                      <option value="expired">Quá hạn (Chưa xử lý)</option>
                    </select>
                  </div>
                </div>

                <!-- 5. Nhập kỳ hạn còn lại / quá hạn (Ngày / Tháng / Năm) -->
                <div class="pl-picker-wrap is-right-col">
                  <div class="lic-dur-picker-box" :class="{ 'has-value': Boolean(filterExpirationValue) }">
                    <span class="lic-dur-prefix">≤</span>
                    <input
                      type="number"
                      min="1"
                      v-model="filterExpirationValue"
                      class="lic-dur-num-input"
                      placeholder="Số..."
                      title="Nhập thời gian Còn hạn / Quá hạn mong muốn"
                    />
                    <select v-model="filterExpirationUnit" class="lic-dur-unit-select" title="Chọn đơn vị Ngày / Tháng / Năm">
                      <option value="day">Ngày</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                    <button
                      v-if="filterExpirationValue"
                      type="button"
                      class="lic-dur-clear-btn"
                      @click="filterExpirationValue = ''"
                      title="Xóa giới hạn thời gian"
                    >✕</button>
                  </div>
                </div>

                <!-- 6. Hiệu lực gia hạn -->
                <div class="pl-picker-wrap">
                  <div class="pl-picker-trigger" :class="{ 'has-value': filterGraceStatus !== 'all' }">
                    <span class="pl-picker-tag">H.Lực:</span>
                    <select v-model="filterGraceStatus" class="pl-picker-native-select">
                      <option value="all">Tất cả</option>
                      <option value="active">Còn hiệu lực</option>
                      <option value="expired">Quá hiệu lực (Chưa xử lý)</option>
                    </select>
                  </div>
                </div>

                <!-- 7. Nhập kỳ hạn hiệu lực (Ngày / Tháng / Năm) -->
                <div class="pl-picker-wrap is-right-col">
                  <div class="lic-dur-picker-box" :class="{ 'has-value': Boolean(filterGraceValue) }">
                    <span class="lic-dur-prefix">≤</span>
                    <input
                      type="number"
                      min="1"
                      v-model="filterGraceValue"
                      class="lic-dur-num-input"
                      placeholder="Số..."
                      title="Nhập thời gian Còn hiệu lực / Quá hiệu lực mong muốn"
                    />
                    <select v-model="filterGraceUnit" class="lic-dur-unit-select" title="Chọn đơn vị Ngày / Tháng / Năm">
                      <option value="day">Ngày</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                    <button
                      v-if="filterGraceValue"
                      type="button"
                      class="lic-dur-clear-btn"
                      @click="filterGraceValue = ''"
                      title="Xóa giới hạn thời gian hiệu lực"
                    >✕</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Danh sách Công ty cuộn dọc bên cột trái (chế độ 3:7 Master-Detail) -->
          <div v-if="!isMobileShell && viewMode !== 'all' && layoutViewMode === 'master-detail'" class="sr-md-company-list">
            <div v-if="allCustomerGroups.length === 0" class="sr-md-empty-sidebar">
              Không tìm thấy công ty phù hợp với điều kiện lọc hiện tại.
            </div>

            <div
              v-for="(cGroup, cIdx) in allCustomerGroups"
              :key="cGroup.customer"
              class="sr-md-company-card"
              :class="{ active: activeMasterGroup && activeMasterGroup.customer === cGroup.customer }"
              @click="selectMasterCustomer(cGroup.customer)"
            >
              <!-- Dòng 1: STT + Tên công ty -->
              <div class="sr-md-cc-header-line">
                <span class="sr-md-cc-idx">{{ cIdx + 1 }}</span>
                <div class="sr-md-cc-title-block">
                  <div class="sr-md-cc-name" :title="cGroup.customer">
                    <span v-if="!cGroup.hasDbCompany" class="lic-unlinked-db-pill" title="Chưa gắn khách hàng trong Database">Chưa gắn DB</span>
                    <span v-html="highlightMatch(cGroup.customer, searchQuery)"></span>
                  </div>
                  <div
                    v-if="companyNameDisplayMode === 'db' && cGroup.vendorCustomer && cGroup.vendorCustomer !== cGroup.customer"
                    class="lic-vendor-sub"
                    :title="cGroup.vendorCustomer"
                  >
                    Tên License: <span v-html="highlightMatch(cGroup.vendorCustomer, searchQuery)"></span>
                  </div>
                  <div
                    v-else-if="companyNameDisplayMode === 'license' && cGroup.dbCompanyName && cGroup.dbCompanyName !== cGroup.customer"
                    class="lic-vendor-sub is-db-sub"
                    :title="cGroup.dbCompanyName"
                  >
                    Tên Cty (DB): <span v-html="highlightMatch(cGroup.dbCompanyName, searchQuery)"></span>
                  </div>
                </div>
              </div>

              <!-- Dòng 2: 4 chỉ số License của Công ty -->
              <div class="sr-md-cc-metrics-4col">
                <div class="sr-md-ccm-item">
                  <span class="sr-md-ccm-lbl">Tổng số</span>
                  <strong class="sr-md-ccm-val">{{ cGroup.items.length }} License</strong>
                </div>
                <div class="sr-md-ccm-item">
                  <span class="sr-md-ccm-lbl">Còn hạn</span>
                  <strong class="sr-md-ccm-val is-com-text">{{ cGroup.conHan }}</strong>
                </div>
                <div class="sr-md-ccm-item">
                  <span class="sr-md-ccm-lbl">Quá hạn</span>
                  <strong class="sr-md-ccm-val" :class="cGroup.quaHan > 0 ? 'is-debt-text' : 'is-com-text'">{{ cGroup.quaHan }}</strong>
                </div>
                <div class="sr-md-ccm-item">
                  <span class="sr-md-ccm-lbl">Liên kết PO</span>
                  <strong class="sr-md-ccm-val" :class="cGroup.linkedPo > 0 ? 'is-com-text' : ''">{{ cGroup.linkedPo }}/{{ cGroup.items.length }}</strong>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- CỘT PHẢI (70%): THANH TÁC VỤ PHÍA TRÊN + HEADER CÔNG TY DẠNG FILE FOLDER + 4 CARD KPI RIÊNG KHÁCH HÀNG & DANH SÁCH LICENSE -->
        <div
          v-show="!isMobileShell || mobileActiveTab === 'overview' || mobileActiveTab === 'company_detail'"
          class="sr-md-main-area"
        >
          <!-- Thanh tác vụ nằm phía trên Header của tên công ty (PC & Mobile Tab Chi tiết) -->
          <div v-if="!isMobileShell || mobileActiveTab === 'company_detail'" class="sr-company-top-toolbar" @click.stop>
            <!-- Thanh ngữ cảnh Mobile (Tab Chi tiết License: Quay lại Tổng quan & Chuyển nhanh License Trước/Sau) -->
            <div v-if="isMobileShell && mobileActiveTab === 'company_detail'" class="sr-mob-toolbar-left">
              <button
                type="button"
                class="sr-mob-ctx-btn is-back-list"
                @click.stop="switchMobileTab('overview')"
                title="Quay lại màn hình Tổng quan"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                <span>Tổng quan</span>
              </button>

              <div v-if="filteredData.length > 1" class="sr-mob-company-stepper">
                <button
                  type="button"
                  class="sr-mob-step-btn"
                  @click.stop="prevMobileLic()"
                  title="License trước"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span class="sr-mob-step-pos">Lic {{ activeMobileLicIndex + 1 }}/{{ filteredData.length }}</span>
                <button
                  type="button"
                  class="sr-mob-step-btn"
                  @click.stop="nextMobileLic()"
                  title="License tiếp theo"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              <button
                v-if="activeMobileLicRow"
                type="button"
                class="sr-mob-ctx-btn is-edit-po"
                @click.stop="openEditModal(activeMobileLicRow)"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <span>Sửa License</span>
              </button>
            </div>

            <div v-if="!isMobileShell" class="sr-ctt-left">
              <!-- Chuyển đổi Theo Công ty | Tất cả Card (Không nhóm) -->
              <div class="sr-ctt-mode-switcher" role="tablist" aria-label="Chế độ hiển thị License">
                <button
                  type="button"
                  class="sr-ctt-mode-btn is-official"
                  :class="{ active: viewMode === 'grouped' }"
                  @click.stop="setViewMode('grouped')"
                  title="Xem theo từng nhóm Công ty"
                >
                  <svg class="sr-ctt-mode-icon" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <span class="sr-ctt-mode-label">Theo Công ty</span>
                  <span class="sr-ctt-mode-count">{{ allCustomerGroups.length }}</span>
                </button>
                <button
                  type="button"
                  class="sr-ctt-mode-btn is-craft"
                  :class="{ active: viewMode === 'all' }"
                  @click.stop="setViewMode('all')"
                  title="Hiển thị trực tiếp toàn bộ Card License (không chia nhóm)"
                >
                  <svg class="sr-ctt-mode-icon" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                  <span class="sr-ctt-mode-label">Tất cả</span>
                  <span class="sr-ctt-mode-count">{{ filteredData.length }}</span>
                </button>
              </div>

              <!-- Lọc nhanh trạng thái bản quyền -->
              <div class="sr-ctt-mode-switcher is-price-row" role="tablist" aria-label="Lọc nhanh trạng thái">
                <button
                  type="button"
                  class="sr-ctt-mode-btn is-price-hd"
                  :class="{ active: quickFilter === 'all' && filterExpirationStatus === 'all' && filterGraceStatus === 'all' }"
                  @click.stop="setQuickFilter('all')"
                >
                  <span class="sr-ctt-mode-label">Tất cả</span>
                </button>
                <button
                  type="button"
                  class="sr-ctt-mode-btn is-price-khach"
                  :class="{ active: filterExpirationStatus === 'active' }"
                  @click.stop="setQuickFilter(filterExpirationStatus === 'active' ? 'all' : 'con_han')"
                >
                  <span class="sr-ctt-mode-label">Còn hạn ({{ kpiStats.conHan }})</span>
                </button>
                <button
                  type="button"
                  class="sr-ctt-mode-btn is-price-danger"
                  :class="{ active: filterExpirationStatus === 'expired' }"
                  @click.stop="setQuickFilter(filterExpirationStatus === 'expired' ? 'all' : 'qua_han')"
                  title="Chỉ hiển thị các License quá hạn chưa xử lý"
                >
                  <span class="sr-ctt-mode-label">Quá hạn ({{ kpiStats.quaHan }})</span>
                </button>
                <button
                  type="button"
                  class="sr-ctt-mode-btn is-price-khach"
                  :class="{ active: filterGraceStatus === 'active' }"
                  @click.stop="setQuickFilter(filterGraceStatus === 'active' ? 'all' : 'con_hieu_luc')"
                >
                  <span class="sr-ctt-mode-label">Còn HL ({{ kpiStats.conHieuLuc }})</span>
                </button>
                <button
                  type="button"
                  class="sr-ctt-mode-btn is-price-handled"
                  :class="{ active: quickFilter === 'da_xu_ly' || quickFilter === 'da_gia_han' || quickFilter === 'khong_gia_han' }"
                  @click.stop="setQuickFilter(quickFilter === 'da_xu_ly' ? 'all' : 'da_xu_ly')"
                  title="Hiển thị các License quá hạn / quá hiệu lực đã xử lý (Đã gia hạn / Không gia hạn)"
                >
                  <span class="sr-ctt-mode-label">Đã xử lý ({{ kpiStats.daXuLy }})</span>
                </button>
              </div>

              <!-- Bộ lọc thời gian Còn hạn & Còn hiệu lực tùy chỉnh (Ngày / Tháng / Năm) ngay trên thanh công cụ -->
              <div class="lic-toolbar-dur-wrap" @click.stop>
                <div class="lic-tb-dur-pill" :class="{ 'is-active': Boolean(filterExpirationValue) }">
                  <span class="lic-tb-dur-lbl">{{ filterExpirationStatus === 'expired' ? 'Quá hạn ≤' : 'Còn hạn ≤' }}</span>
                  <input
                    type="number"
                    min="1"
                    v-model="filterExpirationValue"
                    class="lic-tb-dur-input"
                    placeholder="Số"
                    title="Nhập thời gian Còn hạn / Quá hạn mong muốn"
                  />
                  <select v-model="filterExpirationUnit" class="lic-tb-dur-select" title="Đơn vị thời gian">
                    <option value="day">Ngày</option>
                    <option value="month">Tháng</option>
                    <option value="year">Năm</option>
                  </select>
                  <button
                    v-if="filterExpirationValue"
                    type="button"
                    class="lic-tb-dur-clear"
                    @click.stop="filterExpirationValue = ''"
                    title="Xóa lọc thời gian hạn"
                  >✕</button>
                </div>

                <div class="lic-tb-dur-pill" :class="{ 'is-active': Boolean(filterGraceValue) }">
                  <span class="lic-tb-dur-lbl">{{ filterGraceStatus === 'expired' ? 'Quá HL ≤' : 'Còn HL ≤' }}</span>
                  <input
                    type="number"
                    min="1"
                    v-model="filterGraceValue"
                    class="lic-tb-dur-input"
                    placeholder="Số"
                    title="Nhập thời gian Còn hiệu lực / Quá hiệu lực mong muốn"
                  />
                  <select v-model="filterGraceUnit" class="lic-tb-dur-select" title="Đơn vị thời gian">
                    <option value="day">Ngày</option>
                    <option value="month">Tháng</option>
                    <option value="year">Năm</option>
                  </select>
                  <button
                    v-if="filterGraceValue"
                    type="button"
                    class="lic-tb-dur-clear"
                    @click.stop="filterGraceValue = ''"
                    title="Xóa lọc thời gian hiệu lực"
                  >✕</button>
                </div>
              </div>
            </div>

            <div class="sr-ctt-right">
              <button
                type="button"
                class="sr-hdr-action-btn is-add"
                @click.stop="showImportModal = true"
                title="Thêm mới bản quyền License (Quét Ảnh OCR, Upload PDF hoặc nhập tay)"
              >
                <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Thêm mới</span>
              </button>

              <!-- Nút & Popover Thiết lập hiển thị (chuẩn SaleReportFirebase.vue) -->
              <div class="sr-display-setting-wrap">
                <button
                  type="button"
                  class="sr-hdr-action-btn is-setting"
                  :class="{ active: showDisplaySettingPopover }"
                  @click.stop="showDisplaySettingPopover = !showDisplaySettingPopover"
                  title="Thiết lập hiển thị cột Card, bố cục nhóm & giao diện"
                >
                  <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span>Thiết lập hiển thị</span>
                </button>

                <!-- Dropdown Thiết lập hiển thị (PC) -->
                <div v-if="!isMobileShell && showDisplaySettingPopover" class="sr-display-setting-dropdown" @click.stop>
                  <div class="sr-ds-head">
                    <span class="sr-ds-title">Thiết lập hiển thị</span>
                    <button type="button" class="sr-ds-close" @click="showDisplaySettingPopover = false">✕</button>
                  </div>

                  <!-- 1. Giao diện (Theme) -->
                  <div class="sr-ds-section">
                    <div class="sr-ds-label">Giao diện (Theme)</div>
                    <div class="sr-ds-grid-2">
                      <button
                        type="button"
                        class="sr-ds-opt-btn"
                        :class="{ active: uiTheme === 'dark' }"
                        @click="setUiTheme('dark')"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        <span>Tối (Mặc định)</span>
                      </button>
                      <button
                        type="button"
                        class="sr-ds-opt-btn"
                        :class="{ active: uiTheme === 'light' }"
                        @click="setUiTheme('light')"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line></svg>
                        <span>Sáng (Xanh-Trắng)</span>
                      </button>
                    </div>
                  </div>

                  <!-- 2. Số cột hiển thị Card License -->
                  <div v-if="!isMobileShell" class="sr-ds-section">
                    <div class="sr-ds-label">Hiển thị cột Card License</div>
                    <div class="sr-ds-grid-2">
                      <button
                        type="button"
                        class="sr-ds-opt-btn"
                        :class="{ active: activeCardCols === 1 }"
                        @click="setActiveCardCols(1)"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/></svg>
                        <span>1 Cột Card</span>
                      </button>
                      <button
                        type="button"
                        class="sr-ds-opt-btn"
                        :class="{ active: activeCardCols === 2 }"
                        @click="setActiveCardCols(2)"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        <span>2 Cột Card</span>
                      </button>
                    </div>
                  </div>

                  <!-- 3. Bố cục hiển thị Nhóm công ty (chỉ hiện khi ở chế độ Theo Công ty trên PC) -->
                  <div v-if="!isMobileShell && viewMode !== 'all'" class="sr-ds-section">
                    <div class="sr-ds-label">Bố cục nhóm công ty</div>
                    <div class="sr-ds-grid-2">
                      <button
                        type="button"
                        class="sr-ds-opt-btn"
                        :class="{ active: layoutViewMode === 'master-detail' }"
                        @click="layoutViewMode = 'master-detail'"
                      >
                        <span>Chia 2 Cột (3:7)</span>
                      </button>
                      <button
                        type="button"
                        class="sr-ds-opt-btn"
                        :class="{ active: layoutViewMode === 'stacked-groups' }"
                        @click="layoutViewMode = 'stacked-groups'"
                      >
                        <span>Tất cả nhóm dọc</span>
                      </button>
                    </div>
                  </div>

                  <!-- 4. Thu gọn / Mở rộng khu vực hiển thị -->
                  <div class="sr-ds-section is-last">
                    <div class="sr-ds-label">Chế độ chi tiết</div>
                    <div class="sr-ds-stack-btns">
                      <button
                        type="button"
                        class="sr-ds-toggle-row"
                        :class="{ active: !isAllCardsCollapsed }"
                        @click="toggleAllCardsCollapse()"
                      >
                        <span>{{ isAllCardsCollapsed ? 'Đang thu gọn Card License (1 dòng)' : 'Đang mở rộng chi tiết Card License' }}</span>
                        <strong>{{ isAllCardsCollapsed ? 'Mở rộng' : 'Thu gọn' }}</strong>
                      </button>

                      <button
                        type="button"
                        class="sr-ds-toggle-row"
                        :class="{ active: !isKpiCollapsed }"
                        @click="isKpiCollapsed = !isKpiCollapsed"
                      >
                        <span>{{ isKpiCollapsed ? 'Đang ẩn 4 thẻ KPI tổng hợp' : 'Đang hiện 4 thẻ KPI tổng hợp' }}</span>
                        <strong>{{ isKpiCollapsed ? 'Hiện KPI' : 'Ẩn KPI' }}</strong>
                      </button>

                      <button
                        v-if="!isMobileShell && viewMode !== 'all' && layoutViewMode === 'stacked-groups'"
                        type="button"
                        class="sr-ds-toggle-row"
                        :class="{ active: !areAllVisibleGroupsCollapsed }"
                        @click="toggleCollapseAllGroups()"
                      >
                        <span>{{ areAllVisibleGroupsCollapsed ? 'Đang thu gọn các nhóm công ty' : 'Đang mở tất cả nhóm công ty' }}</span>
                        <strong>{{ areAllVisibleGroupsCollapsed ? 'Mở tất cả' : 'Thu gọn' }}</strong>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Khi bộ lọc không khớp công ty nào -->
          <div v-if="renderedMainGroups.length === 0" class="sr-report-group is-md-active-group">
            <div class="sr-company-folder-header">
              <div class="sr-folder-top-bar">
                <div class="sr-folder-ear-tab">
                  <svg class="sr-folder-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span class="sr-cpb-name">Không có License phù hợp</span>
                </div>
              </div>
              <div class="sr-customer-kpi-sheet sr-folder-body-sheet sr-empty-folder-sheet">
                <span>Không tìm thấy License nào khớp với điều kiện lọc hiện tại.</span>
                <button v-if="activeFilterCount > 0" type="button" class="sr-plain-text-btn" @click="resetAllFilters">
                  Đặt lại toàn bộ bộ lọc ({{ activeFilterCount }})
                </button>
              </div>
            </div>
          </div>

          <!-- Danh sách Nhóm Công Ty hoặc Luồng Tất Cả Card (Không nhóm) được render bên vùng chính -->
          <div
            v-for="(group, gIdx) in renderedMainGroups"
            :key="group.customer + gIdx"
            class="sr-report-group"
            :class="{
              'is-flat-all-stream': Boolean(group.isFlatAllGroup),
              'is-group-collapsed': !group.isFlatAllGroup && !isMobileShell && layoutViewMode === 'stacked-groups' && isGroupCollapsed(group.customer),
              'is-md-active-group': !group.isFlatAllGroup && (isMobileShell ? mobileActiveTab === 'company_detail' : layoutViewMode === 'master-detail')
            }"
          >
            <!-- Header Công Ty Dạng Hình File / Bìa Hồ Sơ (Ẩn hoàn toàn khi ở chế độ Dạng Tất Cả không nhóm) -->
            <div
              v-if="!group.isFlatAllGroup"
              class="sr-company-folder-header"
              @click="isMobileShell ? (mobileActiveTab === 'overview' ? toggleMobCompanyKpi(group.customer) : undefined) : (layoutViewMode === 'stacked-groups' ? toggleCustomerGroup(group.customer) : undefined)"
              :style="{ cursor: (isMobileShell && mobileActiveTab === 'overview') || (!isMobileShell && layoutViewMode === 'stacked-groups') ? 'pointer' : 'default' }"
            >
              <div class="sr-folder-top-bar">
                <div class="sr-folder-ear-tab">
                  <svg class="sr-folder-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span v-if="!group.hasDbCompany" class="lic-folder-unlinked-badge">Chưa gắn DB</span>
                  <h3 class="sr-cpb-name" :title="group.customer" v-html="highlightMatch(group.customer, searchQuery)"></h3>
                  <span class="sr-folder-sep">•</span>
                  <span class="sr-folder-pocount">{{ group.items.length }} License</span>
                  <template v-if="group.quaHan > 0">
                    <span class="sr-folder-sep">•</span>
                    <span class="sr-folder-expired-pill">{{ group.quaHan }} quá hạn</span>
                  </template>
                </div>

                <!-- Nút Đóng/Mở nhanh 4 Card KPI riêng công ty trên Mobile (Phương án 1) -->
                <div
                  v-if="isMobileShell && mobileActiveTab === 'overview'"
                  class="sr-cpb-right"
                  @click.stop
                >
                  <button
                    type="button"
                    class="lic-mob-company-kpi-btn"
                    :class="{ active: isMobCompanyKpiOpen(group.customer) }"
                    @click.stop="toggleMobCompanyKpi(group.customer)"
                  >
                    <span>{{ isMobCompanyKpiOpen(group.customer) ? 'Ẩn KPI' : 'KPI' }}</span>
                    <svg :style="{ transform: isMobCompanyKpiOpen(group.customer) ? 'rotate(180deg)' : 'rotate(0deg)' }" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </div>

                <div
                  v-else-if="!isMobileShell && layoutViewMode === 'stacked-groups'"
                  class="sr-cpb-right"
                  @click.stop
                >
                  <button
                    type="button"
                    class="sr-plain-text-btn"
                    @click.stop="toggleCustomerGroup(group.customer)"
                  >
                    <span class="sr-hide-mob">{{ isGroupCollapsed(group.customer) ? 'Mở rộng' : 'Thu gọn' }}</span>
                  </button>
                </div>
              </div>

              <!-- Bên dưới Header Tên Công Ty: 4 Card KPI Dành Riêng Cho Khách Hàng Này -->
              <div
                v-show="isMobileShell ? (mobileActiveTab === 'company_detail' || isMobCompanyKpiOpen(group.customer)) : (layoutViewMode === 'master-detail' || !isGroupCollapsed(group.customer))"
                class="sr-customer-kpi-sheet sr-folder-body-sheet"
                @click.stop
              >
                <div class="sr-super-bento-grid is-customer-bento">
                  <!-- CARD 1 (KH): Tổng License của Công ty -->
                  <article class="sr-sb-card sb-card-revenue lic-kpi-card">
                    <div class="sr-sb-head">
                      <div class="sr-sb-title-cluster">
                        <span class="sr-sb-icon is-blue">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </span>
                        <h3 class="sr-sb-title">Tổng License KH</h3>
                      </div>
                    </div>

                    <div class="lic-kpi-hero-split is-compact">
                      <div class="lic-kpi-hero-left">
                        <div class="sr-sb-hero-val money-white">
                          {{ group.items.length }}
                          <span class="sr-sb-unit">LICENSE</span>
                        </div>
                        <span class="lic-kpi-hero-sub">Hồ sơ của công ty</span>
                      </div>
                      <div class="lic-kpi-mini-stack">
                        <div class="lic-kpi-mini-pill">
                          <span class="lic-kpi-mini-lbl">Hãng NSX</span>
                          <strong class="lic-kpi-mini-val">{{ group.nsxList.length }} <small>Hãng</small></strong>
                        </div>
                        <div class="lic-kpi-mini-pill">
                          <span class="lic-kpi-mini-lbl">Đính kèm</span>
                          <strong class="lic-kpi-mini-val">{{ group.fileCount }}/{{ group.items.length }} <small>File</small></strong>
                        </div>
                      </div>
                    </div>

                    <div class="lic-kpi-health-foot">
                      <div class="lic-kpi-health-meta">
                        <span class="lic-kpi-health-lbl">Chứng từ số hóa</span>
                        <strong class="lic-kpi-health-pct is-blue">
                          {{ group.items.length > 0 ? Math.round((group.fileCount / group.items.length) * 100) : 0 }}% có File
                        </strong>
                      </div>
                      <div class="lic-kpi-seg-track" aria-hidden="true">
                        <div
                          class="lic-kpi-seg-fill is-sky"
                          :style="{ width: (group.items.length > 0 ? Math.round((group.fileCount / group.items.length) * 100) : 0) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </article>

                  <!-- CARD 2 (KH): Thời hạn Bản quyền của Công ty -->
                  <article class="sr-sb-card sb-card-com lic-kpi-card" :class="{ 'has-alert': group.quaHan > 0 }">
                    <div class="sr-sb-head">
                      <div class="sr-sb-title-cluster">
                        <span class="sr-sb-icon is-emerald">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </span>
                        <h3 class="sr-sb-title">Thời hạn Bản quyền</h3>
                      </div>
                    </div>

                    <div class="lic-kpi-dual-grid is-compact is-triple">
                      <div class="lic-kpi-stat-box is-emerald">
                        <div class="lic-kpi-stat-top">
                          <span class="lic-kpi-dot is-emerald"></span>
                          <span class="lic-kpi-stat-tag">CÒN HẠN</span>
                        </div>
                        <div class="lic-kpi-stat-num money-green">{{ group.conHan }}</div>
                        <div class="lic-kpi-stat-sub">Đang hoạt động</div>
                      </div>

                      <div class="lic-kpi-stat-box" :class="group.quaHan > 0 ? 'is-rose' : 'is-neutral'">
                        <div class="lic-kpi-stat-top">
                          <span class="lic-kpi-dot" :class="group.quaHan > 0 ? 'is-rose' : 'is-emerald'"></span>
                          <span class="lic-kpi-stat-tag">CHƯA XỬ LÝ</span>
                        </div>
                        <div class="lic-kpi-stat-num" :class="group.quaHan > 0 ? 'money-red' : 'money-green'">{{ group.quaHan }}</div>
                        <div class="lic-kpi-stat-sub">{{ group.quaHan > 0 ? 'Quá hạn' : 'Không quá hạn' }}</div>
                      </div>

                      <div class="lic-kpi-stat-box is-sky">
                        <div class="lic-kpi-stat-top">
                          <span class="lic-kpi-dot is-sky"></span>
                          <span class="lic-kpi-stat-tag">ĐÃ XỬ LÝ</span>
                        </div>
                        <div class="lic-kpi-stat-num money-blue">{{ group.daXuLyExp }}</div>
                        <div class="lic-kpi-stat-sub">{{ group.daGiaHan }} GH · {{ group.khongGiaHan }} Ngưng</div>
                      </div>
                    </div>

                    <div class="lic-kpi-health-foot">
                      <div class="lic-kpi-health-meta">
                        <span class="lic-kpi-health-lbl">Tỷ lệ đảm bảo</span>
                        <strong class="lic-kpi-health-pct" :class="group.quaHan > 0 ? 'is-amber' : 'is-emerald'">
                          {{ (group.conHan + group.quaHan + group.daXuLyExp) > 0 ? Math.round(((group.conHan + group.daXuLyExp) / (group.conHan + group.quaHan + group.daXuLyExp)) * 100) : 100 }}% ổn định
                        </strong>
                      </div>
                      <div class="lic-kpi-seg-track" aria-hidden="true">
                        <div
                          class="lic-kpi-seg-fill is-good"
                          :style="{ width: ((group.conHan + group.quaHan + group.daXuLyExp) > 0 ? Math.round(((group.conHan + group.daXuLyExp) / (group.conHan + group.quaHan + group.daXuLyExp)) * 100) : 100) + '%' }"
                        ></div>
                        <div
                          v-if="group.quaHan > 0"
                          class="lic-kpi-seg-fill is-bad"
                          :style="{ width: Math.max(4, 100 - Math.round(((group.conHan + group.daXuLyExp) / Math.max(1, group.conHan + group.quaHan + group.daXuLyExp)) * 100)) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </article>

                  <!-- CARD 3 (KH): Hiệu lực Gia hạn của Công ty -->
                  <article class="sr-sb-card sb-card-margin lic-kpi-card" :class="{ 'has-alert': group.quaHieuLuc > 0 }">
                    <div class="sr-sb-head">
                      <div class="sr-sb-title-cluster">
                        <span class="sr-sb-icon" :class="group.quaHieuLuc > 0 ? 'is-red' : 'is-emerald'">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </span>
                        <h3 class="sr-sb-title">Hiệu lực Gia hạn</h3>
                      </div>
                    </div>

                    <div class="lic-kpi-dual-grid is-compact is-triple">
                      <div class="lic-kpi-stat-box is-emerald">
                        <div class="lic-kpi-stat-top">
                          <span class="lic-kpi-dot is-emerald"></span>
                          <span class="lic-kpi-stat-tag">CÒN HL</span>
                        </div>
                        <div class="lic-kpi-stat-num money-green">{{ group.conHieuLuc }}</div>
                        <div class="lic-kpi-stat-sub">Trong ân hạn</div>
                      </div>

                      <div class="lic-kpi-stat-box" :class="group.quaHieuLuc > 0 ? 'is-rose' : 'is-neutral'">
                        <div class="lic-kpi-stat-top">
                          <span class="lic-kpi-dot" :class="group.quaHieuLuc > 0 ? 'is-rose' : 'is-emerald'"></span>
                          <span class="lic-kpi-stat-tag">CHƯA XỬ LÝ</span>
                        </div>
                        <div class="lic-kpi-stat-num" :class="group.quaHieuLuc > 0 ? 'money-red' : 'money-blue'">{{ group.quaHieuLuc }}</div>
                        <div class="lic-kpi-stat-sub">{{ group.quaHieuLuc > 0 ? 'Quá hiệu lực' : 'Đảm bảo' }}</div>
                      </div>

                      <div class="lic-kpi-stat-box is-sky">
                        <div class="lic-kpi-stat-top">
                          <span class="lic-kpi-dot is-sky"></span>
                          <span class="lic-kpi-stat-tag">ĐÃ XỬ LÝ</span>
                        </div>
                        <div class="lic-kpi-stat-num money-blue">{{ group.daXuLyGrace }}</div>
                        <div class="lic-kpi-stat-sub">Quá HL đã xử lý</div>
                      </div>
                    </div>

                    <div class="lic-kpi-health-foot">
                      <div class="lic-kpi-health-meta">
                        <span class="lic-kpi-health-lbl">Tỷ lệ hiệu lực</span>
                        <strong class="lic-kpi-health-pct" :class="group.quaHieuLuc > 0 ? 'is-rose' : 'is-emerald'">
                          {{ (group.conHieuLuc + group.quaHieuLuc + group.daXuLyGrace) > 0 ? Math.round(((group.conHieuLuc + group.daXuLyGrace) / (group.conHieuLuc + group.quaHieuLuc + group.daXuLyGrace)) * 100) : 100 }}% an toàn
                        </strong>
                      </div>
                      <div class="lic-kpi-seg-track" aria-hidden="true">
                        <div
                          class="lic-kpi-seg-fill is-good"
                          :style="{ width: ((group.conHieuLuc + group.quaHieuLuc + group.daXuLyGrace) > 0 ? Math.round(((group.conHieuLuc + group.daXuLyGrace) / (group.conHieuLuc + group.quaHieuLuc + group.daXuLyGrace)) * 100) : 100) + '%' }"
                        ></div>
                        <div
                          v-if="group.quaHieuLuc > 0"
                          class="lic-kpi-seg-fill is-bad"
                          :style="{ width: Math.max(4, 100 - Math.round(((group.conHieuLuc + group.daXuLyGrace) / Math.max(1, group.conHieuLuc + group.quaHieuLuc + group.daXuLyGrace)) * 100)) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </article>

                  <!-- CARD 4 (KH): Liên kết PO & Hồ sơ Khách hàng -->
                  <article class="sr-sb-card sb-card-debt lic-kpi-card">
                    <div class="sr-sb-head">
                      <div class="sr-sb-title-cluster">
                        <span class="sr-sb-icon" :class="group.linkedPo > 0 ? 'is-emerald' : 'is-blue'">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        </span>
                        <h3 class="sr-sb-title">Liên kết PO &amp; Mã KH</h3>
                      </div>
                    </div>

                    <div class="lic-kpi-dual-grid is-compact">
                      <div class="lic-kpi-stat-box is-emerald">
                        <div class="lic-kpi-stat-top">
                          <span class="lic-kpi-dot is-emerald"></span>
                          <span class="lic-kpi-stat-tag">ĐÃ GẮN PO</span>
                        </div>
                        <div class="lic-kpi-stat-num money-green">{{ group.linkedPo }}</div>
                        <div class="lic-kpi-stat-sub">Tỷ lệ: {{ group.linkedPoPct }}%</div>
                      </div>

                      <div class="lic-kpi-stat-box" :class="group.maKhachHang ? 'is-sky' : 'is-rose'">
                        <div class="lic-kpi-stat-top">
                          <span class="lic-kpi-dot" :class="group.maKhachHang ? 'is-sky' : 'is-rose'"></span>
                          <span class="lic-kpi-stat-tag">KHỚP MÃ KH</span>
                        </div>
                        <div class="lic-kpi-stat-num" :class="group.maKhachHang ? 'money-blue' : 'money-red'">
                          {{ group.linkedKh }}/{{ group.items.length }}
                        </div>
                        <div class="lic-kpi-stat-sub">{{ group.maKhachHang ? group.maKhachHang : 'Chưa gắn DB' }}</div>
                      </div>
                    </div>

                    <div class="lic-kpi-health-foot">
                      <div class="lic-kpi-health-meta">
                        <span class="lic-kpi-health-lbl">Đồng bộ PO &amp; DB</span>
                        <strong class="lic-kpi-health-pct is-emerald">{{ group.linkedPoPct }}% PO</strong>
                      </div>
                      <div class="lic-kpi-seg-track" aria-hidden="true">
                        <div
                          class="lic-kpi-seg-fill is-good"
                          :style="{ width: Math.min(100, Math.max(0, group.linkedPoPct)) + '%' }"
                        ></div>
                        <div
                          v-if="group.linkedPoPct < 100"
                          class="lic-kpi-seg-fill is-warn"
                          :style="{ width: Math.max(4, 100 - Math.min(100, Math.max(0, group.linkedPoPct))) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>

            <!-- DANH SÁCH THẺ CARD LICENSE (PO-1) -->
            <div
              v-show="group.isFlatAllGroup || isMobileShell || layoutViewMode === 'master-detail' || !isGroupCollapsed(group.customer)"
              class="sr-card-list"
              :class="activeCardCols === 2 ? 'is-cols-2' : 'is-cols-1'"
            >
              <div
                v-for="(item, idx) in group.items"
                :key="item.firebase_id || item.ROW_INDEX || idx"
                class="sr-card-outer-item"
              >
                <div
                  class="sr-record-card sr-po1-card"
                  :class="[
                    { 'is-collapsed-card': isEffectiveCardCollapsed(item) },
                    isCardSessionPinned(item)
                      ? (getHandlingStatus(item) === 'Đã gia hạn'
                          ? 'is-just-renewed'
                          : (getHandlingStatus(item) === 'Không gia hạn' ? 'is-just-stopped' : ''))
                      : ''
                  ]"
                  @click="openEditModal(item)"
                  style="cursor: pointer;"
                >
                  <!-- 1. HEADER CARD LICENSE (MÀU NỀN NỔI BẬT, SẮP XẾP RÕ RÀNG CHUẨN PO-1) -->
                  <div class="sr-po1-header">
                    <!-- Dòng 1: Định danh License bên trái | Thời hạn & Thao tác bên phải -->
                    <div class="sr-po1-hbar">
                      <div class="sr-po1-meta-left">
                        <span class="lic-card-stt-pill">#{{ idx + 1 }}</span>
                        <strong class="sr-po1-po-num">
                          License <span v-html="highlightMatch(item.LICENSE_ID || 'Chưa có ID', searchQuery)"></span>
                        </strong>
                        <template v-if="item.SO_PO">
                          <span class="sr-po1-sep">•</span>
                          <span class="lic-header-po-pill">PO #{{ item.SO_PO }}</span>
                        </template>
                        <span class="sr-po1-sep">•</span>
                        <span class="sr-po1-plain-meta">Ngày cấp: <strong>{{ item.DATE_OF_LICENSE || '—' }}</strong></span>
                        <template v-if="item.NHA_SAN_XUAT">
                          <span class="sr-po1-sep">•</span>
                          <span class="sr-po1-plain-meta">Hãng: <strong v-html="highlightMatch(item.NHA_SAN_XUAT, searchQuery)"></strong></span>
                        </template>
                        <template v-if="item.LICENSE_TYPE">
                          <span class="sr-po1-sep">•</span>
                          <span class="sr-po1-plain-meta">Loại: <strong>{{ item.LICENSE_TYPE }}</strong></span>
                        </template>
                      </div>

                      <div class="sr-po1-meta-right" @click.stop>
                        <span
                          class="sr-po1-plain-status"
                          :class="[
                            isItemHandled(item)
                              ? 'is-handled-text'
                              : (getRemainingTimeBadgeClass(item.EXPIRATION_TIME) === 'badge-danger' ? 'is-debt-text' : 'is-com-text')
                          ]"
                        >
                          {{ getRemainingTimeText(item.EXPIRATION_TIME) || 'Chưa rõ hạn' }}
                        </span>

                        <!-- Nhãn tóm tắt trên thanh tiêu đề khi đã xử lý -->
                        <template v-if="isItemHandled(item)">
                          <span class="sr-po1-sep">|</span>
                          <span
                            class="lic-handled-badge"
                            :class="getHandlingStatus(item) === 'Đã gia hạn' ? 'is-renewed' : 'is-stopped'"
                          >
                            <svg v-if="getHandlingStatus(item) === 'Đã gia hạn'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            <span>Đã xử lý: {{ getHandlingStatus(item) }}</span>
                          </span>
                        </template>

                        <span class="sr-po1-sep">|</span>
                        <button
                          type="button"
                          class="sr-po-pay-extend-btn"
                          @click.stop="openEditModal(item)"
                        >
                          Chỉnh sửa License
                        </button>
                        <button
                          type="button"
                          class="sr-po-collapse-arrow-btn"
                          :class="{ 'is-collapsed': isCardCollapsed(item) }"
                          @click.stop="toggleCardCollapse(item)"
                          :title="isCardCollapsed(item) ? 'Mở rộng chi tiết License' : 'Thu gọn chi tiết License'"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Dòng 2: Tên sản phẩm bản quyền nổi bật -->
                    <div class="sr-po1-contract-row">
                      <div class="sr-po1-contract-title" :title="item.PRODUCT_NAME || 'Sản phẩm ẩn danh'">
                        <span class="sr-po1-contract-prefix">Sản phẩm:</span>
                        <span v-html="highlightMatch(item.PRODUCT_NAME || 'Sản phẩm ẩn danh', searchQuery)"></span>
                      </div>

                      <!-- Khi thu gọn 1 dòng: hiện tóm tắt ngay bên phải -->
                      <div v-if="isEffectiveCardCollapsed(item)" class="sr-po1-collapsed-summary">
                        <span v-if="item.PRODUCT_CODE">Mã SP: <strong v-html="highlightMatch(item.PRODUCT_CODE, searchQuery)"></strong></span>
                        <span v-if="item.PRODUCT_CODE" class="sr-po1-sep">•</span>
                        <span>Hết hạn: <strong :class="isItemHandled(item) ? 'is-handled-dimmed' : (getRemainingTimeBadgeClass(item.EXPIRATION_TIME) === 'badge-danger' ? 'is-debt-text' : 'is-com-text')">{{ item.EXPIRATION_TIME || '—' }}</strong></span>
                        <span class="sr-po1-sep">•</span>
                        <span>Hiệu lực: <strong :class="{ 'is-handled-dimmed': isItemHandled(item) }" :style="isItemHandled(item) ? undefined : { color: getHieuLucColor(item.SO_NGAY_HIEU_LUC) }">{{ getHieuLucText(item.SO_NGAY_HIEU_LUC) }}</strong></span>
                        <template v-if="item.SO_PO">
                          <span class="sr-po1-sep">•</span>
                          <span>Đơn hàng: <strong class="is-com-text">PO #{{ item.SO_PO }}</strong></span>
                        </template>
                      </div>
                    </div>

                    <!-- Dòng 3: Chứng từ gốc đính kèm & Mã sản phẩm / Số lượng -->
                    <div
                      v-if="!isEffectiveCardCollapsed(item)"
                      class="sr-po1-contract-files"
                      @click.stop
                    >
                      <div class="sr-po1-file-entry">
                        <span class="lic-inline-file-svg" v-html="getLicenseFileSvg(item.NAME_FILE || item.LINK_FILE)"></span>
                        <span class="sr-po1-fe-name">
                          Chứng từ:
                          <strong>{{ item.LINK_FILE ? (item.NAME_FILE || 'Tệp chứng từ License') : 'Chưa đính kèm file' }}</strong>
                        </span>
                        <div v-if="item.LINK_FILE" class="sr-po1-fe-actions">
                          <a
                            :href="item.LINK_FILE"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="sr-po1-fe-btn is-view"
                            title="Mở xem chứng từ gốc"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span>Mở xem</span>
                          </a>
                        </div>
                      </div>

                      <div v-if="item.PRODUCT_CODE" class="sr-po1-file-entry">
                        <span class="sr-po1-fe-name">Mã SP (SKU): <strong v-html="highlightMatch(item.PRODUCT_CODE, searchQuery)"></strong></span>
                      </div>

                      <div v-if="item.LICENSE_VOLUME" class="sr-po1-file-entry">
                        <span class="sr-po1-fe-name">Số lượng: <strong class="is-com-text">{{ item.LICENSE_VOLUME }}</strong></span>
                      </div>

                      <div v-if="item.CUSTOMER && item.TEN_CONG_TY && item.CUSTOMER !== item.TEN_CONG_TY" class="sr-po1-file-entry">
                        <span class="sr-po1-fe-name" :title="item.CUSTOMER">Tên trên file: <strong>{{ item.CUSTOMER }}</strong></span>
                      </div>
                    </div>
                  </div>

                  <!-- 2. BỐ CỤC SPLIT 2 CỘT (40% PREVIEW CHỨNG TỪ / PO • 60% THÔNG SỐ BẢN QUYỀN) -->
                  <div v-show="!isEffectiveCardCollapsed(item)" class="lic-card-split-body" @click.stop>
                    <!-- CỘT TRÁI (40%): PREVIEW TRỰC TIẾP CHỨNG TỪ LICENSE & HỒ SƠ PO LIÊN KẾT -->
                    <div class="lic-card-preview-pane">
                      <div class="lic-card-preview-bar">
                        <div class="lic-card-preview-tabs">
                          <button
                            v-for="doc in getItemPreviewDocs(item)"
                            :key="doc.key"
                            type="button"
                            class="lic-preview-tab-btn"
                            :class="{ active: getActiveDocForItem(item)?.key === doc.key }"
                            @click.stop="setCardPreviewTab(item, doc.key)"
                            :title="doc.name"
                          >
                            <span>{{ doc.label }}</span>
                          </button>
                        </div>
                        <div v-if="getActiveDocForItem(item)?.url" class="lic-card-preview-actions">
                          <a
                            :href="getDocOpenHref(getActiveDocForItem(item))"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="sr-po1-fe-btn is-view"
                            title="Mở rộng sang tab mới"
                            @click.stop
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                            <span>Mở rộng</span>
                          </a>
                        </div>
                      </div>

                      <div class="lic-card-preview-stage">
                        <template v-if="getActiveDocForItem(item)?.url">
                          <div v-if="getActiveDocForItem(item)?.kind === 'image'" class="lic-preview-img-wrap">
                            <img :src="getActiveDocForItem(item).url" :alt="getActiveDocForItem(item).name" loading="lazy" />
                          </div>
                          <iframe
                            v-else
                            :src="getDocEmbedUrl(getActiveDocForItem(item))"
                            class="lic-preview-iframe"
                            loading="lazy"
                          ></iframe>
                        </template>
                        <div v-else class="lic-preview-empty" @click.stop="openEditModal(item)">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <strong>Chưa có File Preview</strong>
                          <span>Nhấp để đính kèm chứng từ License hoặc liên kết PO</span>
                        </div>
                      </div>
                    </div>

                    <!-- CỘT PHẢI (60%): 3 KHỐI THÔNG SỐ BẢN QUYỀN & LIÊN KẾT PO -->
                    <div class="lic-card-metrics-pane" @click="openEditModal(item)">
                      <div class="sr-po1-4blocks is-3blocks">
                        <!-- KHỐI 1: Thông tin Bản quyền & Mã KH -->
                        <div class="sr-po1-block">
                          <div class="sr-po1-block-title is-blue-head">Thông tin Bản quyền</div>
                          <div class="sr-po1-b-row is-primary">
                            <span class="sr-po1-b-lbl">License ID</span>
                            <strong class="sr-po1-b-val is-com-text" v-html="highlightMatch(item.LICENSE_ID || '—', searchQuery)"></strong>
                          </div>
                          <div class="sr-po1-b-row">
                            <span class="sr-po1-b-lbl">Mã SP (SKU)</span>
                            <span class="sr-po1-b-val" v-html="highlightMatch(item.PRODUCT_CODE || '—', searchQuery)"></span>
                          </div>
                          <div class="sr-po1-b-row">
                            <span class="sr-po1-b-lbl">Loại License</span>
                            <span class="sr-po1-b-val">{{ item.LICENSE_TYPE || '—' }}</span>
                          </div>
                          <div class="sr-po1-b-row">
                            <span class="sr-po1-b-lbl">Hãng sản xuất</span>
                            <span class="sr-po1-b-val">{{ item.NHA_SAN_XUAT || '—' }}</span>
                          </div>
                          <div class="sr-po1-b-row is-sub-divider">
                            <span class="sr-po1-b-lbl">Số lượng (Volume)</span>
                            <strong class="sr-po1-b-val is-com-text">{{ item.LICENSE_VOLUME || '—' }}</strong>
                          </div>
                        </div>

                        <!-- KHỐI 2: Thời hạn Bản quyền -->
                        <div class="sr-po1-block">
                          <div class="sr-po1-block-title is-green-head">Thời hạn Bản quyền</div>
                          <div class="sr-po1-b-row is-primary">
                            <span class="sr-po1-b-lbl">Ngày hết hạn</span>
                            <strong
                              class="sr-po1-b-val"
                              :class="[
                                isItemHandled(item)
                                  ? 'is-handled-dimmed'
                                  : (getRemainingTimeBadgeClass(item.EXPIRATION_TIME) === 'badge-danger' ? 'is-debt-text' : 'is-com-text')
                              ]"
                            >{{ item.EXPIRATION_TIME || '—' }}</strong>
                          </div>
                          <div class="sr-po1-b-row">
                            <span class="sr-po1-b-lbl">Ngày cấp License</span>
                            <span class="sr-po1-b-val">{{ item.DATE_OF_LICENSE || '—' }}</span>
                          </div>
                          <div class="sr-po1-b-row is-sub-divider">
                            <span class="sr-po1-b-lbl">Thời gian còn lại</span>
                            <strong
                              class="sr-po1-b-val"
                              :class="[
                                isItemHandled(item)
                                  ? 'is-handled-dimmed'
                                  : (getRemainingTimeBadgeClass(item.EXPIRATION_TIME) === 'badge-danger' ? 'is-debt-text' : 'is-com-text')
                              ]"
                            >{{ getRemainingTimeText(item.EXPIRATION_TIME) || '—' }}</strong>
                          </div>
                          <!-- Trạng thái xử lý ngay bên dưới Thời gian còn lại -->
                          <div class="sr-po1-b-row is-handle-row" @click.stop>
                            <span class="sr-po1-b-lbl">Trạng thái xử lý</span>
                            <div class="lic-block-handle-cell">
                              <div v-if="isItemHandled(item)" class="lic-handled-cluster">
                                <span
                                  class="lic-handled-badge"
                                  :class="getHandlingStatus(item) === 'Đã gia hạn' ? 'is-renewed' : 'is-stopped'"
                                >
                                  <svg v-if="getHandlingStatus(item) === 'Đã gia hạn'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                  <span>{{ getHandlingStatus(item) }}</span>
                                </span>
                                <button
                                  type="button"
                                  class="lic-handled-undo-btn"
                                  :disabled="item._toggling"
                                  @click.stop="setGiaHan(item, '')"
                                  title="Hoàn tác trạng thái Đã xử lý để đưa về diện theo dõi"
                                >
                                  Hoàn tác
                                </button>
                              </div>
                              <div v-else-if="isItemOverdueOrGraceExpired(item)" class="lic-handle-btn-group">
                                <button
                                  type="button"
                                  class="lic-handle-act-btn is-renewed"
                                  :disabled="item._toggling"
                                  @click.stop="setGiaHan(item, 'Đã gia hạn')"
                                  title="Đánh dấu Đã xử lý: Khách hàng Đã gia hạn (ẩn khỏi cảnh báo Quá hạn/Quá hiệu lực)"
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  <span>Đã gia hạn</span>
                                </button>
                                <button
                                  type="button"
                                  class="lic-handle-act-btn is-stopped"
                                  :disabled="item._toggling"
                                  @click.stop="setGiaHan(item, 'Không gia hạn')"
                                  title="Đánh dấu Đã xử lý: Khách hàng Không gia hạn (ẩn khỏi cảnh báo Quá hạn/Quá hiệu lực)"
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  <span>Không gia hạn</span>
                                </button>
                              </div>
                              <span v-else class="lic-block-status-normal">Đang còn hạn</span>
                            </div>
                          </div>
                        </div>

                        <!-- KHỐI 3: Hiệu lực Gia hạn & Liên kết Đơn hàng PO -->
                        <div class="sr-po1-block">
                          <div class="sr-po1-block-title is-green-head">Hiệu lực &amp; Liên kết PO</div>
                          <div class="sr-po1-b-row is-primary">
                            <span class="sr-po1-b-lbl">Thời gian hiệu lực</span>
                            <strong
                              class="sr-po1-b-val"
                              :class="{ 'is-handled-dimmed': isItemHandled(item) }"
                              :style="isItemHandled(item) ? undefined : { color: getHieuLucColor(item.SO_NGAY_HIEU_LUC) }"
                            >{{ getHieuLucText(item.SO_NGAY_HIEU_LUC) }}</strong>
                          </div>
                          <!-- Trạng thái xử lý ngay bên dưới Thời gian hiệu lực -->
                          <div class="sr-po1-b-row is-handle-row" @click.stop>
                            <span class="sr-po1-b-lbl">Trạng thái xử lý</span>
                            <div class="lic-block-handle-cell">
                              <div v-if="isItemHandled(item)" class="lic-handled-cluster">
                                <span
                                  class="lic-handled-badge"
                                  :class="getHandlingStatus(item) === 'Đã gia hạn' ? 'is-renewed' : 'is-stopped'"
                                >
                                  <svg v-if="getHandlingStatus(item) === 'Đã gia hạn'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                  <span>{{ getHandlingStatus(item) }}</span>
                                </span>
                                <button
                                  type="button"
                                  class="lic-handled-undo-btn"
                                  :disabled="item._toggling"
                                  @click.stop="setGiaHan(item, '')"
                                  title="Hoàn tác trạng thái Đã xử lý để đưa về diện theo dõi"
                                >
                                  Hoàn tác
                                </button>
                              </div>
                              <div v-else-if="isItemOverdueOrGraceExpired(item)" class="lic-handle-btn-group">
                                <button
                                  type="button"
                                  class="lic-handle-act-btn is-renewed"
                                  :disabled="item._toggling"
                                  @click.stop="setGiaHan(item, 'Đã gia hạn')"
                                  title="Đánh dấu Đã xử lý: Khách hàng Đã gia hạn (ẩn khỏi cảnh báo Quá hạn/Quá hiệu lực)"
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  <span>Đã gia hạn</span>
                                </button>
                                <button
                                  type="button"
                                  class="lic-handle-act-btn is-stopped"
                                  :disabled="item._toggling"
                                  @click.stop="setGiaHan(item, 'Không gia hạn')"
                                  title="Đánh dấu Đã xử lý: Khách hàng Không gia hạn (ẩn khỏi cảnh báo Quá hạn/Quá hiệu lực)"
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  <span>Không gia hạn</span>
                                </button>
                              </div>
                              <span v-else class="lic-block-status-normal">Trong hạn hiệu lực</span>
                            </div>
                          </div>
                          <div class="sr-po1-b-row is-sub-divider">
                            <span class="sr-po1-b-lbl">Hạn hiệu lực (Ân hạn)</span>
                            <span
                              class="sr-po1-b-val"
                              :class="{ 'is-handled-dimmed': isItemHandled(item) }"
                            >{{ item.SO_NGAY_HIEU_LUC || '—' }}</span>
                          </div>
                          <div class="sr-po1-b-row is-cust-2lines-row">
                            <span class="sr-po1-b-lbl">Tên khách hàng</span>
                            <div class="lic-cust-2lines">
                              <strong
                                class="lic-cust-line1"
                                :class="(item.TEN_CONG_TY || item.CUSTOMER) ? 'is-com-text' : ''"
                                :title="item.TEN_CONG_TY || item.CUSTOMER || 'Chưa cập nhật công ty'"
                                v-html="highlightMatch(item.TEN_CONG_TY || item.CUSTOMER || 'Chưa cập nhật công ty', searchQuery)"
                              ></strong>
                              <span
                                class="lic-cust-line2"
                                :title="item.TEN_KHACH_HANG || item.CUSTOMER || 'Chưa cập nhật tên KH'"
                              >
                                Tên KH: <strong v-html="highlightMatch(item.TEN_KHACH_HANG || item.CUSTOMER || '—', searchQuery)"></strong>
                              </span>
                            </div>
                          </div>
                          <div class="sr-po1-b-row is-sub-divider">
                            <span class="sr-po1-b-lbl">Liên kết PO chính thức</span>
                            <strong class="sr-po1-b-val" :class="item.SO_PO ? 'is-com-text' : ''">
                              {{ item.SO_PO ? `PO #${item.SO_PO} ✓` : 'Chưa liên kết PO' }}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <!-- 3. Dòng Ghi chú / Mô tả License -->
                      <div class="sr-po1-note-line" v-if="item.LICENSE_DESCRIPTION">
                        <span class="sr-po1-files-label">Mô tả License:</span>
                        <span>{{ item.LICENSE_DESCRIPTION }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Nút xem thêm cho chế độ Dạng Tất Cả (không nhóm) -->
          <button
            v-if="viewMode === 'all' && !(isMobileShell && mobileActiveTab === 'company_detail') && flatSortedCards.length > flatDisplayLimit"
            type="button"
            class="lic-load-more-btn"
            @click="flatDisplayLimit += 24"
          >
            <span>Xem thêm (còn {{ flatSortedCards.length - flatDisplayLimit }} Card License)</span>
          </button>

          <!-- Nút xem thêm nhóm công ty khi ở chế độ Theo Công ty (Tất cả nhóm dọc hoặc Mobile Tổng quan) -->
          <button
            v-else-if="viewMode !== 'all' && (isMobileShell ? mobileActiveTab === 'overview' : layoutViewMode === 'stacked-groups') && allCustomerGroups.length > displayLimit"
            type="button"
            class="lic-load-more-btn"
            @click="displayLimit += 10"
          >
            <span>Xem thêm (còn {{ allCustomerGroups.length - displayLimit }} nhóm công ty)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Thêm mới License (Hợp nhất Quét Ảnh OCR, Upload PDF & Nhập tay chuẩn giao diện Modal License) -->
    <ImportLicenseModal
      v-if="showImportModal"
      :theme="uiTheme"
      @close="showImportModal = false"
      @import-success="fetchData"
    />
    <ImportPDFModal
      v-if="showPdfModal"
      @close="showPdfModal = false"
      @import-success="fetchData"
    />

    <!-- MODAL CHỈNH SỬA LICENSE -->
    <div
      v-if="selectedCard"
      class="lic-modal-overlay"
      :class="{ 'theme-light-blue': uiTheme === 'light' }"
      @click.self="selectedCard = null"
    >
      <div class="lic-modal-card">
        <div class="lic-modal-head">
          <div class="lic-modal-head-left">
            <span class="lic-modal-head-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </span>
            <div class="lic-modal-title-row">
              <h3>Chỉnh sửa thông tin License</h3>
            </div>
          </div>
          <button type="button" class="lic-modal-close-x" @click="selectedCard = null" title="Đóng cửa sổ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="lic-modal-body">
          <div class="lic-modal-split-workspace">
            <!-- CỘT TRÁI (50%): PREVIEW TRỰC TIẾP CHỨNG TỪ LICENSE & HỒ SƠ PO LIÊN KẾT -->
            <div class="lic-modal-preview-col">
              <div class="lic-modal-banner is-teal-head">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>XEM TRƯỚC CHỨNG TỪ &amp; HỒ SƠ PO (50%)</span>
              </div>

              <input
                ref="editModalFileInput"
                type="file"
                accept=".pdf,image/*"
                style="display: none"
                @change="onEditModalFileSelected"
              />

              <div class="lic-card-preview-bar is-modal-bar">
                <div class="lic-card-preview-tabs">
                  <button
                    v-for="doc in getItemPreviewDocs(selectedCard)"
                    :key="doc.key"
                    type="button"
                    class="lic-preview-tab-btn"
                    :class="{ 'is-active': getActiveDocForItem(selectedCard)?.key === doc.key }"
                    @click="setCardPreviewTab(selectedCard, doc.key)"
                    :title="doc.name"
                  >
                    <span>{{ doc.label }}</span>
                  </button>
                </div>
                <div class="lic-modal-bar-actions">
                  <button
                    type="button"
                    class="lic-scan-replace-btn"
                    :disabled="scanningEditFile || saving || deleting"
                    @click="triggerEditModalFileScan"
                    title="Chọn file PDF hoặc Ảnh License mới để quét thông số & thay thế chứng từ"
                  >
                    <span v-if="scanningEditFile" class="spinner-small"></span>
                    <svg v-else width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{{ scanningEditFile ? 'Đang quét file...' : (selectedCard.LINK_FILE ? 'Quét / Đổi file' : 'Quét tải file') }}</span>
                  </button>
                  <a
                    v-if="getActiveDocForItem(selectedCard)?.url"
                    :href="getDocOpenHref(getActiveDocForItem(selectedCard))"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="lic-open-file-btn"
                    title="Mở xem trên tab mới"
                  >
                    Mở rộng ↗
                  </a>
                </div>
              </div>

              <div class="lic-modal-preview-stage">
                <template v-if="getActiveDocForItem(selectedCard)?.url">
                  <div v-if="getActiveDocForItem(selectedCard)?.kind === 'image'" class="lic-preview-img-wrap">
                    <img :src="getActiveDocForItem(selectedCard).url" :alt="getActiveDocForItem(selectedCard).name" class="lic-preview-img" />
                  </div>
                  <iframe
                    v-else
                    :src="getDocEmbedUrl(getActiveDocForItem(selectedCard))"
                    class="lic-preview-iframe"
                  ></iframe>
                </template>
                <div v-else class="lic-preview-empty">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <strong>Chưa có File Chứng Từ</strong>
                  <span>Liên kết với PO đã có chứng từ hoặc tải lên file License để xem trước</span>
                  <button
                    type="button"
                    class="lic-scan-replace-btn is-empty-cta"
                    :disabled="scanningEditFile || saving || deleting"
                    @click="triggerEditModalFileScan"
                  >
                    <span v-if="scanningEditFile" class="spinner-small"></span>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{{ scanningEditFile ? 'Đang quét & tải file...' : 'Quét / Đổi file License' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- CỘT PHẢI (50%): THÔNG SỐ BẢN QUYỀN, KHÁCH HÀNG, LIÊN KẾT PO & THỜI HẠN -->
            <div class="lic-modal-specs-col">
              <div class="lic-modal-group">
                <div class="lic-modal-banner is-blue-head">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>THÔNG SỐ BẢN QUYỀN &amp; LIÊN KẾT PO (50%)</span>
                </div>

                <div
                  v-if="selectedCardDuplicateInfo.isDuplicate"
                  class="lic-modal-dup-banner"
                  :class="selectedCardDuplicateInfo.status === 'exact_duplicate' ? 'is-block' : 'is-renewal'"
                >
                  <div class="lic-modal-dup-head">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <strong v-if="selectedCardDuplicateInfo.status === 'exact_duplicate'">
                      CẢNH BÁO TRÙNG LICENSE ID VỚI BẢN GHI KHÁC
                    </strong>
                    <strong v-else>
                      CÙNG LICENSE ID VỚI BẢN GHI KHÁC (KHÁC NGÀY HẾT HẠN)
                    </strong>
                  </div>
                  <p class="lic-modal-dup-desc">{{ selectedCardDuplicateInfo.message }}</p>
                </div>

                <!-- HÀNG 1: KHỐI CHỌN TÊN KHÁCH HÀNG / CTY (DATABASE) & LIÊN KẾT PO CHÍNH THỨC -->
                <LicenseCustomerPoPicker
                  :modelValue="selectedCard"
                  :customers="dbCustomers"
                  :officialPos="officialPos"
                  :theme="uiTheme"
                  @customer-saved="handleCustomerSavedInModal"
                  @view-po="selectedCard = null"
                />

                <!-- HÀNG 2 (FULL 100%): KHÁCH HÀNG (TÊN GỐC TRÊN FILE LICENSE) -->
                <div class="lic-form-row is-full">
                  <div class="lic-form-field">
                    <label>Khách hàng (Tên gốc trên File License)</label>
                    <input type="text" v-model="selectedCard.CUSTOMER" class="lic-input" placeholder="Tên công ty đầy đủ trên chứng từ License..." />
                  </div>
                </div>

                <!-- HÀNG 3 (2 CỘT): LICENSE ID & NHÀ SẢN XUẤT (HÃNG) -->
                <div class="lic-form-row">
                  <div class="lic-form-field">
                    <label class="lic-label-with-dup-pill">
                      <span>License ID / Serial Key</span>
                      <span v-if="selectedCardDuplicateInfo.status === 'exact_duplicate'" class="lic-dup-inline-pill is-block">Trùng lặp</span>
                      <span v-else-if="selectedCardDuplicateInfo.status === 'renewal_candidate'" class="lic-dup-inline-pill is-renewal">Khác kỳ hạn</span>
                    </label>
                    <input type="text" v-model="selectedCard.LICENSE_ID" class="lic-input" placeholder="Nhập License ID / Serial Key..." />
                  </div>
                  <div class="lic-form-field">
                    <label>Nhà sản xuất (Hãng)</label>
                    <div class="lic-input-with-picker">
                      <input
                        type="text"
                        v-model="selectedCard.NHA_SAN_XUAT"
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
                    <input type="text" v-model="selectedCard.PRODUCT_NAME" class="lic-input" placeholder="Tên phần mềm / gói bản quyền..." />
                  </div>
                  <div class="lic-form-field">
                    <label>Mã sản phẩm (Product Code)</label>
                    <input type="text" v-model="selectedCard.PRODUCT_CODE" class="lic-input" placeholder="Nhập mã sản phẩm..." />
                  </div>
                </div>

                <!-- HÀNG 5 (3 CỘT GỌN): SỐ LƯỢNG, LOẠI LICENSE & LOCALIZATION -->
                <div class="lic-form-row is-three-cols">
                  <div class="lic-form-field">
                    <label>Số lượng (Volume)</label>
                    <input type="text" v-model="selectedCard.LICENSE_VOLUME" class="lic-input" placeholder="VD: 10, 50..." />
                  </div>
                  <div class="lic-form-field">
                    <label>Loại License (Type)</label>
                    <input type="text" v-model="selectedCard.LICENSE_TYPE" class="lic-input" placeholder="VD: Base, Renewal..." />
                  </div>
                  <div class="lic-form-field">
                    <label>Khu vực / Ngôn ngữ (Localization)</label>
                    <input type="text" v-model="selectedCard.LOCALIZATION" class="lic-input" placeholder="VD: Vietnamese, Global..." />
                  </div>
                </div>
              </div>

              <div class="lic-modal-group">
                <div class="lic-modal-banner is-green-head">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>THỜI GIAN, HIỆU LỰC GIA HẠN &amp; MÔ TẢ</span>
                </div>

                <div class="lic-form-row">
                  <div class="lic-form-field">
                    <label>Ngày cấp (DD/MM/YYYY)</label>
                    <LicenseDatePickerInput
                      v-model="selectedCard.DATE_OF_LICENSE"
                      :theme="uiTheme"
                      placeholder="Chọn ngày cấp..."
                    />
                  </div>
                  <div class="lic-form-field">
                    <label>Ngày hết hạn (DD/MM/YYYY)</label>
                    <LicenseDatePickerInput
                      v-model="selectedCard.EXPIRATION_TIME"
                      :theme="uiTheme"
                      placeholder="Chọn ngày hết hạn..."
                      @change="onEditExpirationDateChange"
                    />
                  </div>
                </div>

                <div class="lic-form-row">
                  <div class="lic-form-field">
                    <label>Số ngày cộng thêm (sau hết hạn)</label>
                    <input
                      type="number"
                      v-model="editGraceDays"
                      class="lic-input"
                      placeholder="VD: 10, 30..."
                      @input="onEditGraceDaysInput"
                    />
                    <small v-if="editGraceDays !== '' && selectedCard.EXPIRATION_TIME" class="lic-grace-preview">
                      → Hạn hiệu lực: <b>{{ calcGraceDate(selectedCard.EXPIRATION_TIME, editGraceDays) }}</b>
                    </small>
                  </div>
                  <div class="lic-form-field">
                    <label>Hạn hiệu lực (Ân hạn DD/MM/YYYY)</label>
                    <LicenseDatePickerInput
                      v-model="selectedCard.SO_NGAY_HIEU_LUC"
                      :theme="uiTheme"
                      placeholder="Chọn hạn hiệu lực..."
                      @change="onEditGraceDateChange"
                    />
                  </div>
                </div>

                <!-- Trạng thái xử lý License quá hạn / quá hiệu lực (3 thẻ nổi bật) -->
                <div class="lic-form-field">
                  <label>Trạng thái xử lý (Dành cho License quá hạn / quá hiệu lực)</label>
                  <div class="lic-modal-handle-seg" role="radiogroup" aria-label="Trạng thái xử lý License">
                    <button
                      type="button"
                      class="lic-mhs-btn is-unhandled"
                      :class="{ active: !selectedCard.IS_GIA_HAN }"
                      @click="selectedCard.IS_GIA_HAN = ''"
                    >
                      <div class="lic-mhs-top">
                        <span class="lic-mhs-ico">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </span>
                        <span class="lic-mhs-dot"></span>
                      </div>
                      <div class="lic-mhs-texts">
                        <strong class="lic-mhs-title">Chưa xử lý</strong>
                        <span class="lic-mhs-sub">Đang theo dõi</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      class="lic-mhs-btn is-renewed"
                      :class="{ active: selectedCard.IS_GIA_HAN === 'Đã gia hạn' }"
                      @click="selectedCard.IS_GIA_HAN = 'Đã gia hạn'"
                    >
                      <div class="lic-mhs-top">
                        <span class="lic-mhs-ico">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        <span class="lic-mhs-dot"></span>
                      </div>
                      <div class="lic-mhs-texts">
                        <strong class="lic-mhs-title">Đã gia hạn</strong>
                        <span class="lic-mhs-sub">Đã xử lý xong</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      class="lic-mhs-btn is-stopped"
                      :class="{ active: selectedCard.IS_GIA_HAN === 'Không gia hạn' }"
                      @click="selectedCard.IS_GIA_HAN = 'Không gia hạn'"
                    >
                      <div class="lic-mhs-top">
                        <span class="lic-mhs-ico">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </span>
                        <span class="lic-mhs-dot"></span>
                      </div>
                      <div class="lic-mhs-texts">
                        <strong class="lic-mhs-title">Không gia hạn</strong>
                        <span class="lic-mhs-sub">Ngưng sử dụng</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div class="lic-form-field">
                  <label>Mô tả (Description)</label>
                  <textarea v-model="selectedCard.LICENSE_DESCRIPTION" class="lic-input" rows="2" placeholder="Ghi chú chi tiết..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <div v-if="editErrorMsg" class="error-msg">{{ editErrorMsg }}</div>
        </div>

        <div class="lic-modal-foot">
          <button type="button" class="lic-foot-btn is-danger" :disabled="saving || deleting" @click="deleteCard">
            <span v-if="deleting" class="spinner-small"></span>
            <span v-else>✕ Xóa mặt hàng</span>
          </button>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="lic-foot-btn is-secondary" @click="selectedCard = null">Đóng</button>
            <button
              v-if="hasChanges"
              type="button"
              class="lic-foot-btn is-primary"
              :disabled="saving || deleting"
              @click="updateCard"
            >
              <span v-if="saving" class="spinner-small"></span>
              <span v-else>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL CHỌN HÃNG / NHÀ SẢN XUẤT -->
      <LicenseVendorPickerModal
        v-model:show="showVendorPickerModal"
        v-model="selectedCard.NHA_SAN_XUAT"
        :vendors="uniqueNhaSanXuat"
        :licenseItems="rawData"
        :officialPos="officialPos"
        :theme="uiTheme"
      />
    </div>

    <!-- AI Chat FAB & Panel -->
    <div v-if="!isMobileShell" class="ai-chat-fab" :class="{ 'bumped-up': isScrolled }" @click="showAIChat = true" title="Hỏi Trợ lý AI">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </div>

    <!-- MOBILE FLOATING GLASS BOTTOM DOCK (PA1: 1. Tổng quan | 2. Bộ lọc | 3. + Thêm mới | 4. Hiển thị | 5. Lic đang chọn) -->
    <nav
      v-if="isMobileShell"
      class="sr-mobile-dock"
      :class="{ 'is-modal-hidden': isAnyLicenseModalOpen }"
      aria-label="Điều hướng nhanh License Mobile"
    >
      <!-- 1. Tổng quan -->
      <button
        type="button"
        class="sr-dock-btn is-slot-overview"
        :class="{ active: mobileActiveTab === 'overview' && !showMobileFilterSheet && !showDisplaySettingPopover }"
        @click="switchMobileTab('overview')"
      >
        <div class="sr-dock-icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span v-if="filteredData.length > 0" class="sr-dock-badge">{{ filteredData.length > 999 ? '999+' : filteredData.length }}</span>
        </div>
        <span>Tổng quan</span>
      </button>

      <!-- 2. Bộ lọc (Mở Bottom Sheet Bộ lọc) -->
      <button
        type="button"
        class="sr-dock-btn is-slot-filter"
        :class="{ active: showMobileFilterSheet || mobileSheetFilterCount > 0 }"
        @click.stop="toggleMobileFilterSheet()"
      >
        <div class="sr-dock-icon-wrap">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span v-if="mobileSheetFilterCount > 0" class="sr-dock-badge is-amber" :title="`Đang bật ${mobileSheetFilterCount} điều kiện lọc`">{{ mobileSheetFilterCount }}</span>
        </div>
        <span>Bộ lọc</span>
      </button>

      <!-- 3. Nút Thêm mới (Primary CTA chính giữa) -->
      <button
        type="button"
        class="sr-dock-btn is-primary is-center-cta"
        @click="openMobileImportModal()"
      >
        <div class="sr-dock-icon-wrap">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <span>Thêm mới</span>
      </button>

      <!-- 4. Nút Thiết lập hiển thị (Mở Bottom Sheet Hiển thị) -->
      <button
        type="button"
        class="sr-dock-btn is-slot-display"
        :class="{ active: showDisplaySettingPopover }"
        @click.stop="toggleMobileDisplaySheet()"
        title="Thiết lập hiển thị & Giao diện"
      >
        <div class="sr-dock-icon-wrap">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
        <span>Hiển thị</span>
      </button>

      <!-- 5. License đang chọn (Xem chi tiết License / Công ty đang chọn) -->
      <button
        type="button"
        class="sr-dock-btn is-company-slot"
        :class="{
          active: mobileActiveTab === 'company_detail' && !showMobileFilterSheet && !showDisplaySettingPopover,
          'is-disabled': !activeMobileLicRow
        }"
        @click="activeMobileLicRow ? selectMobileLicDetail(activeMobileLicRow) : switchMobileTab('overview')"
        :title="activeMobileLicRow ? `Đang chọn License ${activeMobileLicRow.LICENSE_ID || ''} - ${activeMobileLicRow.TEN_CONG_TY || activeMobileLicRow.CUSTOMER || ''}` : 'Chọn một License từ Tổng quan'"
      >
        <div class="sr-dock-icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <span class="sr-dock-company-name">{{ getMobileDockLicLabel(activeMobileLicRow) }}</span>
      </button>
    </nav>

    <!-- ================= BOTTOM SHEET 1 (MOBILE): BỘ LỌC DỮ LIỆU LICENSE ================= -->
    <Teleport to="body">
      <div
        v-if="isMobileShell && showMobileFilterSheet"
        class="lic-mob-sheet-overlay"
        :class="{ 'is-light': uiTheme === 'light' }"
        @click.self="showMobileFilterSheet = false"
      >
        <div class="lic-mob-sheet-card" @click.stop>
          <div class="lic-mob-sheet-grab" @click="showMobileFilterSheet = false">
            <span class="lic-mob-sheet-handle"></span>
          </div>

          <div class="lic-mob-sheet-head">
            <span class="lic-mob-sheet-title">Bộ lọc dữ liệu License</span>
            <button type="button" class="lic-mob-sheet-close" @click="showMobileFilterSheet = false" aria-label="Đóng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="lic-mob-sheet-body">
            <!-- 1. Lọc nhanh trạng thái bản quyền & xử lý -->
            <div class="lic-ms-section">
              <div class="lic-ms-label">Trạng thái bản quyền &amp; Xử lý</div>
              <div class="lic-ms-chip-grid">
                <button
                  type="button"
                  class="lic-ms-opt-btn"
                  :class="{ active: quickFilter === 'all' && filterExpirationStatus === 'all' && filterGraceStatus === 'all' }"
                  @click="setQuickFilter('all')"
                >
                  <span>Tất cả</span>
                  <strong>{{ baseData.length }}</strong>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn is-emerald"
                  :class="{ active: filterExpirationStatus === 'active' }"
                  @click="setQuickFilter(filterExpirationStatus === 'active' ? 'all' : 'con_han')"
                >
                  <span>Còn hạn</span>
                  <strong>{{ kpiStats.conHan }}</strong>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn is-rose"
                  :class="{ active: filterExpirationStatus === 'expired' }"
                  @click="setQuickFilter(filterExpirationStatus === 'expired' ? 'all' : 'qua_han')"
                >
                  <span>Quá hạn</span>
                  <strong>{{ kpiStats.quaHan }}</strong>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn is-emerald"
                  :class="{ active: filterGraceStatus === 'active' }"
                  @click="setQuickFilter(filterGraceStatus === 'active' ? 'all' : 'con_hieu_luc')"
                >
                  <span>Còn hiệu lực</span>
                  <strong>{{ kpiStats.conHieuLuc }}</strong>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn is-rose"
                  :class="{ active: filterGraceStatus === 'expired' }"
                  @click="setQuickFilter(filterGraceStatus === 'expired' ? 'all' : 'qua_hieu_luc')"
                >
                  <span>Quá hiệu lực</span>
                  <strong>{{ kpiStats.quaHieuLuc }}</strong>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn is-sky"
                  :class="{ active: quickFilter === 'da_xu_ly' }"
                  @click="setQuickFilter(quickFilter === 'da_xu_ly' ? 'all' : 'da_xu_ly')"
                >
                  <span>Đã xử lý</span>
                  <strong>{{ kpiStats.daXuLy }}</strong>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn is-emerald"
                  :class="{ active: quickFilter === 'da_gia_han' }"
                  @click="setQuickFilter(quickFilter === 'da_gia_han' ? 'all' : 'da_gia_han')"
                >
                  <span>Đã gia hạn</span>
                  <strong>{{ kpiStats.daGiaHan }}</strong>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn is-amber"
                  :class="{ active: quickFilter === 'khong_gia_han' }"
                  @click="setQuickFilter(quickFilter === 'khong_gia_han' ? 'all' : 'khong_gia_han')"
                >
                  <span>Không gia hạn</span>
                  <strong>{{ kpiStats.khongGiaHan }}</strong>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn"
                  :class="{ active: quickFilter === 'linked_po' }"
                  @click="setQuickFilter(quickFilter === 'linked_po' ? 'all' : 'linked_po')"
                >
                  <span>Đã gắn PO</span>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn"
                  :class="{ active: quickFilter === 'unlinked_po' }"
                  @click="setQuickFilter(quickFilter === 'unlinked_po' ? 'all' : 'unlinked_po')"
                >
                  <span>Chưa gắn PO</span>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn"
                  :class="{ active: quickFilter === 'linked_kh' }"
                  @click="setQuickFilter(quickFilter === 'linked_kh' ? 'all' : 'linked_kh')"
                >
                  <span>Đã gắn Mã KH</span>
                </button>
                <button
                  type="button"
                  class="lic-ms-opt-btn"
                  :class="{ active: quickFilter === 'unlinked_kh' }"
                  @click="setQuickFilter(quickFilter === 'unlinked_kh' ? 'all' : 'unlinked_kh')"
                >
                  <span>Chưa gắn Mã KH</span>
                </button>
              </div>
            </div>

            <!-- 2. Giới hạn kỳ hạn Còn hạn / Hiệu lực tùy chỉnh -->
            <div class="lic-ms-section">
              <div class="lic-ms-label">Giới hạn thời gian (Ngày / Tháng / Năm)</div>
              <div class="lic-ms-dur-stack">
                <div class="lic-ms-dur-row">
                  <select v-model="filterExpirationStatus" class="lic-ms-select is-dur-status">
                    <option value="all">Thời hạn: Tất cả</option>
                    <option value="active">Còn hạn ≤</option>
                    <option value="expired">Quá hạn ≤</option>
                  </select>
                  <div class="lic-ms-dur-input-wrap">
                    <input
                      type="number"
                      min="1"
                      v-model="filterExpirationValue"
                      class="lic-ms-num-input"
                      placeholder="Nhập số..."
                    />
                    <select v-model="filterExpirationUnit" class="lic-ms-unit-select">
                      <option value="day">Ngày</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                    <button
                      v-if="filterExpirationValue"
                      type="button"
                      class="lic-ms-inline-clear"
                      @click="filterExpirationValue = ''"
                    >✕</button>
                  </div>
                </div>

                <div class="lic-ms-dur-row">
                  <select v-model="filterGraceStatus" class="lic-ms-select is-dur-status">
                    <option value="all">Hiệu lực: Tất cả</option>
                    <option value="active">Còn HL ≤</option>
                    <option value="expired">Quá HL ≤</option>
                  </select>
                  <div class="lic-ms-dur-input-wrap">
                    <input
                      type="number"
                      min="1"
                      v-model="filterGraceValue"
                      class="lic-ms-num-input"
                      placeholder="Nhập số..."
                    />
                    <select v-model="filterGraceUnit" class="lic-ms-unit-select">
                      <option value="day">Ngày</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                    </select>
                    <button
                      v-if="filterGraceValue"
                      type="button"
                      class="lic-ms-inline-clear"
                      @click="filterGraceValue = ''"
                    >✕</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Khách hàng & Hãng sản xuất -->
            <div class="lic-ms-section">
              <div class="lic-ms-label">Khách hàng &amp; Hãng sản xuất</div>
              <div class="lic-ms-field-stack">
                <select v-model="filterCustomer" class="lic-ms-select">
                  <option value="all">Tất cả khách hàng / công ty ({{ uniqueCustomer.length }})</option>
                  <option v-for="item in uniqueCustomer" :key="item" :value="item">{{ item }}</option>
                </select>

                <select v-model="filterNhaSanXuat" class="lic-ms-select">
                  <option value="all">Tất cả hãng sản xuất ({{ uniqueNhaSanXuat.length }})</option>
                  <option v-for="item in uniqueNhaSanXuat" :key="item" :value="item">{{ item }}</option>
                </select>
              </div>
            </div>

            <!-- 4. Mốc thời gian tính toán -->
            <div class="lic-ms-section is-last">
              <div class="lic-ms-label">Mốc thời gian đối chiếu</div>
              <div class="lic-ms-seg-5">
                <button type="button" class="lic-ms-seg-btn" :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">Hiện tại</button>
                <button type="button" class="lic-ms-seg-btn" :class="{ active: filterMode === 'day' }" @click="filterMode = 'day'">Ngày</button>
                <button type="button" class="lic-ms-seg-btn" :class="{ active: filterMode === 'week' }" @click="filterMode = 'week'">Tuần</button>
                <button type="button" class="lic-ms-seg-btn" :class="{ active: filterMode === 'month' }" @click="filterMode = 'month'">Tháng</button>
                <button type="button" class="lic-ms-seg-btn" :class="{ active: filterMode === 'year' }" @click="filterMode = 'year'">Năm</button>
              </div>

              <div v-if="filterMode !== 'all'" class="lic-ms-date-box">
                <input v-if="filterMode === 'day'" type="date" v-model="filterDate" class="lic-ms-date-input" />
                <input v-else-if="filterMode === 'week'" type="week" v-model="filterWeek" class="lic-ms-date-input" />
                <input v-else-if="filterMode === 'month'" type="month" v-model="filterMonth" class="lic-ms-date-input" />
                <div v-else-if="filterMode === 'year'" class="lic-ms-year-stepper">
                  <button type="button" class="lic-ms-year-btn" @click="filterYear--">−</button>
                  <strong>Năm {{ filterYear }}</strong>
                  <button type="button" class="lic-ms-year-btn" @click="filterYear++">+</button>
                </div>
              </div>
            </div>
          </div>

          <div class="lic-mob-sheet-foot">
            <button
              type="button"
              class="lic-ms-foot-btn is-reset"
              :disabled="mobileSheetFilterCount === 0"
              @click="resetMobileSheetFilters()"
            >
              Đặt lại{{ mobileSheetFilterCount > 0 ? ` (${mobileSheetFilterCount})` : '' }}
            </button>
            <button
              type="button"
              class="lic-ms-foot-btn is-apply"
              @click="showMobileFilterSheet = false"
            >
              Xem {{ filteredData.length }} License
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ================= BOTTOM SHEET 2 (MOBILE): THIẾT LẬP HIỂN THỊ ================= -->
    <Teleport to="body">
      <div
        v-if="isMobileShell && showDisplaySettingPopover"
        class="lic-mob-sheet-overlay"
        :class="{ 'is-light': uiTheme === 'light' }"
        @click.self="showDisplaySettingPopover = false"
      >
        <div class="lic-mob-sheet-card" @click.stop>
          <div class="lic-mob-sheet-grab" @click="showDisplaySettingPopover = false">
            <span class="lic-mob-sheet-handle"></span>
          </div>

          <div class="lic-mob-sheet-head">
            <span class="lic-mob-sheet-title">Thiết lập hiển thị</span>
            <button type="button" class="lic-mob-sheet-close" @click="showDisplaySettingPopover = false" aria-label="Đóng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="lic-mob-sheet-body">
            <!-- 1. Chế độ hiển thị danh sách: Theo Công ty | Tất cả -->
            <div class="lic-ms-section">
              <div class="lic-ms-label">Chế độ xem danh sách</div>
              <div class="lic-ms-grid-2">
                <button
                  type="button"
                  class="lic-ms-choice-btn"
                  :class="{ active: viewMode === 'grouped' }"
                  @click="setViewMode('grouped')"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <span>Theo Công ty ({{ allCustomerGroups.length }})</span>
                </button>
                <button
                  type="button"
                  class="lic-ms-choice-btn"
                  :class="{ active: viewMode === 'all' }"
                  @click="setViewMode('all')"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                  <span>Tất cả ({{ filteredData.length }})</span>
                </button>
              </div>
            </div>

            <!-- 2. Kiểu hiển thị tên khách hàng -->
            <div class="lic-ms-section">
              <div class="lic-ms-label">Kiểu hiển thị tên khách hàng</div>
              <div class="lic-ms-grid-2">
                <button
                  type="button"
                  class="lic-ms-choice-btn"
                  :class="{ active: companyNameDisplayMode === 'db' }"
                  @click="setCompanyNameDisplayMode('db')"
                >
                  <span>Tên Công Ty (DB)</span>
                </button>
                <button
                  type="button"
                  class="lic-ms-choice-btn"
                  :class="{ active: companyNameDisplayMode === 'license' }"
                  @click="setCompanyNameDisplayMode('license')"
                >
                  <span>Tên trên License</span>
                </button>
              </div>
            </div>

            <!-- 3. Giao diện (Theme) -->
            <div class="lic-ms-section">
              <div class="lic-ms-label">Giao diện (Theme)</div>
              <div class="lic-ms-grid-2">
                <button
                  type="button"
                  class="lic-ms-choice-btn"
                  :class="{ active: uiTheme === 'dark' }"
                  @click="setUiTheme('dark')"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  <span>Tối (Mặc định)</span>
                </button>
                <button
                  type="button"
                  class="lic-ms-choice-btn"
                  :class="{ active: uiTheme === 'light' }"
                  @click="setUiTheme('light')"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
                  <span>Sáng (Xanh-Trắng)</span>
                </button>
              </div>
            </div>

            <!-- 4. Thu gọn / Mở rộng khu vực hiển thị -->
            <div class="lic-ms-section is-last">
              <div class="lic-ms-label">Chế độ chi tiết</div>
              <div class="lic-ms-toggle-list">
                <button
                  type="button"
                  class="lic-ms-toggle-row"
                  :class="{ active: !isAllCardsCollapsed }"
                  @click="toggleAllCardsCollapse()"
                >
                  <span>{{ isAllCardsCollapsed ? 'Đang thu gọn Card License (1 dòng)' : 'Đang mở rộng chi tiết Card License' }}</span>
                  <strong>{{ isAllCardsCollapsed ? 'Mở rộng' : 'Thu gọn' }}</strong>
                </button>

                <button
                  type="button"
                  class="lic-ms-toggle-row"
                  :class="{ active: !isKpiCollapsed }"
                  @click="isKpiCollapsed = !isKpiCollapsed"
                >
                  <span>{{ isKpiCollapsed ? 'Đang ẩn 4 thẻ KPI tổng hợp' : 'Đang hiện 4 thẻ KPI tổng hợp' }}</span>
                  <strong>{{ isKpiCollapsed ? 'Hiện KPI' : 'Ẩn KPI' }}</strong>
                </button>

                <button
                  v-if="viewMode !== 'all'"
                  type="button"
                  class="lic-ms-toggle-row"
                  :class="{ active: !areAllVisibleGroupsCollapsed }"
                  @click="toggleCollapseAllGroups()"
                >
                  <span>{{ areAllVisibleGroupsCollapsed ? 'Đang thu gọn các nhóm công ty' : 'Đang mở tất cả nhóm công ty' }}</span>
                  <strong>{{ areAllVisibleGroupsCollapsed ? 'Mở tất cả' : 'Thu gọn' }}</strong>
                </button>
              </div>
            </div>
          </div>

          <div class="lic-mob-sheet-foot is-single">
            <button
              type="button"
              class="lic-ms-foot-btn is-apply"
              @click="showDisplaySettingPopover = false"
            >
              Xong
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showAIChat" class="chat-overlay" @click.self="showAIChat = false">
        <div class="chat-panel">
          <div class="chat-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0e7ff" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12 2.1 7.1"/></svg>
              <h3 style="margin:0; font-size:1.1rem; color: white;">Trợ lý AI (Dữ liệu)</h3>
            </div>
            <button class="btn-close-chat" @click="showAIChat = false">&times;</button>
          </div>

          <div class="chat-body" ref="chatBody">
            <div v-for="(msg, i) in chatHistory" :key="i" class="chat-message-wrapper" :class="msg.role">
              <div class="chat-bubble" v-html="renderMarkdown(msg.content)"></div>
            </div>
            <div v-if="aiTyping" class="chat-message-wrapper assistant">
              <div class="chat-bubble typing">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              </div>
            </div>
          </div>

          <div class="chat-footer">
            <input type="text" v-model="chatInput" @keyup.enter="sendChat" placeholder="Hỏi AI về dữ liệu này..." class="chat-input" />
            <button @click="sendChat" :disabled="!chatInput.trim() || aiTyping" class="btn-send-chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import ImportLicenseModal from './ImportLicenseFirebaseModal.vue'
import ImportPDFModal from './ImportPDFFirebaseModal.vue'
import AsyncConfirmModal from './AsyncConfirmModal.vue'
import LicenseCustomerPoPicker from './LicenseCustomerPoPicker.vue'
import LicenseVendorPickerModal from './LicenseVendorPickerModal.vue'
import LicenseDatePickerInput from './LicenseDatePickerInput.vue'
import { callDeepSeek } from '../services/deepseek'

// === THEME & VIEW MODE SYNC (Chuẩn SaleReportFirebase) ===
const getInitialUiTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('baogia_theme_pref')
    if (saved === 'light' || saved === 'dark') return saved
  }
  return 'dark'
}
const uiTheme = ref(getInitialUiTheme())
const setUiTheme = (mode) => {
  uiTheme.value = mode
  if (typeof window !== 'undefined') {
    localStorage.setItem('baogia_theme_pref', mode)
  }
}

const getInitialViewMode = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('license_fb_view_mode')
    if (saved === 'all' || saved === 'grouped') return saved
  }
  return 'grouped'
}
const viewMode = ref(getInitialViewMode())
const sessionPinnedMap = ref({})
const clearSessionPinnedCards = () => {
  if (Object.keys(sessionPinnedMap.value).length > 0) {
    sessionPinnedMap.value = {}
  }
}
const setViewMode = (mode) => {
  const normalized = mode === 'all' ? 'all' : 'grouped'
  clearSessionPinnedCards()
  viewMode.value = normalized
  if (typeof window !== 'undefined') {
    localStorage.setItem('license_fb_view_mode', normalized)
  }
}

// === BỐ CỤC 3:7 MASTER-DETAIL & THIẾT LẬP HIỂN THỊ ===
const layoutViewMode = ref('master-detail')
const cardCols = ref(1)
const allModeCardCols = ref(2)
const activeCardCols = computed(() => {
  if (isMobileShell.value) return 1
  return viewMode.value === 'all' ? allModeCardCols.value : cardCols.value
})
const setActiveCardCols = (cols) => {
  if (viewMode.value === 'all') {
    allModeCardCols.value = cols
  } else {
    cardCols.value = cols
  }
}
const isKpiCollapsed = ref(false)
const isAllCardsCollapsed = ref(false)
const collapsedCardsMap = ref({})
const showDisplaySettingPopover = ref(false)
const isSidebarFilterExpanded = ref(false)
const selectedMasterCustomer = ref('')

const getCardKey = (item) => String(item.firebase_id || item.ROW_INDEX || item.LICENSE_ID || '')
const isCardCollapsed = (item) => !!collapsedCardsMap.value[getCardKey(item)]
const isEffectiveCardCollapsed = (item) => isAllCardsCollapsed.value || isCardCollapsed(item)
const toggleCardCollapse = (item) => {
  const key = getCardKey(item)
  if (!key) return
  collapsedCardsMap.value = {
    ...collapsedCardsMap.value,
    [key]: !collapsedCardsMap.value[key]
  }
}
const toggleAllCardsCollapse = () => {
  isAllCardsCollapsed.value = !isAllCardsCollapsed.value
  collapsedCardsMap.value = {}
}

const collapsedGroups = ref({})
const isGroupCollapsed = (customer) => !!collapsedGroups.value[customer]
const toggleCustomerGroup = (customer) => {
  collapsedGroups.value = {
    ...collapsedGroups.value,
    [customer]: !collapsedGroups.value[customer]
  }
}

const mobCompanyKpiOpenMap = ref({})
const isMobCompanyKpiOpen = (customer) => !!mobCompanyKpiOpenMap.value[customer]
const toggleMobCompanyKpi = (customer) => {
  if (!customer) return
  mobCompanyKpiOpenMap.value = {
    ...mobCompanyKpiOpenMap.value,
    [customer]: !mobCompanyKpiOpenMap.value[customer]
  }
}

const getLicenseFileSvg = (nameOrUrl) => {
  const s = String(nameOrUrl || '').toLowerCase()
  if (s.includes('.pdf')) {
    return `<svg viewBox="0 0 48 48" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4h18l12 12v26a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#FEE2E2" stroke="#EF4444" stroke-width="2"/><path d="M28 4v12h12" fill="#FECACA" stroke="#EF4444" stroke-width="2" stroke-linejoin="round"/><rect x="11" y="23" width="26" height="13" rx="3" fill="#EF4444"/><text x="24" y="32.5" text-anchor="middle" fill="#FFFFFF" font-size="8.5" font-weight="800" font-family="Inter, Arial, sans-serif">PDF</text></svg>`
  }
  if (/\.(png|jpg|jpeg|webp|gif|bmp)(\?|$)/.test(s)) {
    return `<svg viewBox="0 0 48 48" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="8" width="36" height="32" rx="4" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/><circle cx="16.5" cy="18.5" r="3.5" fill="#0284C7"/><path d="M9 36l10-11 7 7 5-5 8 9H9z" fill="#38BDF8"/></svg>`
  }
  return `<svg viewBox="0 0 48 48" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4h18l12 12v26a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/><path d="M28 4v12h12" fill="#CBD5E1" stroke="#64748B" stroke-width="2" stroke-linejoin="round"/><line x1="15" y1="24" x2="33" y2="24" stroke="#64748B" stroke-width="2.2" stroke-linecap="round"/><line x1="15" y1="31" x2="27" y2="31" stroke="#64748B" stroke-width="2.2" stroke-linecap="round"/></svg>`
}

const asyncModal = ref({ show: false, type: 'confirm', title: '', msg: '', confirmText: 'Đồng ý', cancelText: 'Hủy' })
let confirmResolve = null
const confirmAction = (title, msg, confirmText, cancelText = 'Hủy') => {
  return new Promise((resolve) => {
    asyncModal.value = { show: true, type: 'confirm', title, msg, confirmText, cancelText }
    confirmResolve = resolve
  })
}
const handleAsyncConfirm = () => {
  if (confirmResolve) confirmResolve(true)
}
const handleAsyncCancel = () => {
  if (confirmResolve) confirmResolve(false)
  asyncModal.value.show = false
}

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref as dbRef, get, update, remove } from "firebase/database";
import {
  loadCustomerAndPoCatalog,
  fuzzyMatchCustomer,
  filterPosForCustomer,
  syncLicenseToSaleReportPO,
  removeLicenseFromSaleReportPO,
  unlinkDeletedLicenseFromSaleReport,
  propagateCustomerToSameVendorLicenses,
  licenseDateToYmd,
  ymdToLicenseDate,
  addDaysToLicenseDate,
  diffDaysBetweenLicenseDates,
  extractLicenseRecordsFromFile,
  extractSmartLicenseWithAI,
  inspectLicenseDuplicate
} from "../utils/licensePoSync";

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "929199941311",
  appId: "1:929199941311:web:ca8d86f9fd7f8dff61480a",
  measurementId: "G-48VVPGFSFK"
};
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(firebaseApp);

const excelDateToJSDate = (serial) => {
  if (!serial || isNaN(Number(serial))) return null;
  const days = Math.floor(serial - 25569);
  const value = days * 86400 * 1000;
  return new Date(value);
};

const formatFirebaseDate = (val) => {
  if (!val) return '';
  if (!isNaN(val) && Number(val) > 10000) {
    const d = excelDateToJSDate(Number(val));
    if (d) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
  return formatDisplayDate(val);
};

const searchQuery = ref('')
const loading = ref(false)
const showImportModal = ref(false)
const showPdfModal = ref(false)
const rawData = ref([])
const filterMode = ref('all')
const filterDate = ref(getTodayStr())
const filterWeek = ref(getWeekString(new Date()))
const filterMonth = ref(getThisMonthStr())
const filterYear = ref(new Date().getFullYear())

const filterExpirationStatus = ref('all')
const filterExpirationMonths = ref('all')
const filterExpirationValue = ref('')
const filterExpirationUnit = ref('month')
const filterGraceStatus = ref('all')
const filterGraceMonths = ref('all')
const filterGraceValue = ref('')
const filterGraceUnit = ref('day')
const filterNhaSanXuat = ref('all')
const filterCustomer = ref('all')
const quickFilter = ref('all')

const convertDurationToDays = (val, unit) => {
  const num = parseFloat(val)
  if (isNaN(num) || num <= 0) return null
  if (unit === 'day') return Math.round(num)
  if (unit === 'year') return Math.round(num * 365)
  return Math.round(num * 30)
}

watch(filterExpirationValue, (newVal) => {
  const num = parseFloat(newVal)
  if (!isNaN(num) && num > 0 && filterExpirationStatus.value === 'all') {
    filterExpirationStatus.value = 'active'
  }
})

watch(filterGraceValue, (newVal) => {
  const num = parseFloat(newVal)
  if (!isNaN(num) && num > 0 && filterGraceStatus.value === 'all') {
    filterGraceStatus.value = 'active'
  }
})

const activeFilterCount = computed(() => {
  let c = 0
  if (searchQuery.value.trim()) c++
  if (filterMode.value !== 'all') c++
  if (filterExpirationStatus.value !== 'all' || convertDurationToDays(filterExpirationValue.value, filterExpirationUnit.value) !== null) c++
  if (filterGraceStatus.value !== 'all' || convertDurationToDays(filterGraceValue.value, filterGraceUnit.value) !== null) c++
  if (filterNhaSanXuat.value !== 'all') c++
  if (filterCustomer.value !== 'all') c++
  if (quickFilter.value !== 'all') c++
  return c
})

const resetAllFilters = () => {
  clearSessionPinnedCards()
  searchQuery.value = ''
  filterMode.value = 'all'
  filterExpirationStatus.value = 'all'
  filterExpirationMonths.value = 'all'
  filterExpirationValue.value = ''
  filterExpirationUnit.value = 'month'
  filterGraceStatus.value = 'all'
  filterGraceMonths.value = 'all'
  filterGraceValue.value = ''
  filterGraceUnit.value = 'day'
  filterNhaSanXuat.value = 'all'
  filterCustomer.value = 'all'
  quickFilter.value = 'all'
}

const uniqueNhaSanXuat = computed(() => {
  const set = new Set(rawData.value.map(i => i.NHA_SAN_XUAT || i.nha_san_xuat).filter(Boolean));
  return Array.from(set).sort();
})

const dbCustomers = ref([])
const officialPos = ref([])

const getInitialCompanyNameMode = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('license_company_name_mode')
    if (saved === 'db' || saved === 'license') return saved
  }
  return 'db'
}
const companyNameDisplayMode = ref(getInitialCompanyNameMode())

const setCompanyNameDisplayMode = (mode) => {
  if (mode !== 'db' && mode !== 'license') return
  const currentActiveItem = activeMasterGroup.value?.items?.[0] || null
  companyNameDisplayMode.value = mode
  if (typeof window !== 'undefined') {
    localStorage.setItem('license_company_name_mode', mode)
  }
  if (currentActiveItem) {
    selectedMasterCustomer.value = getDisplayCompanyForItem(currentActiveItem)
  }
}

const getDisplayCompanyForItem = (item) => {
  if (!item) return 'KHÁCH HÀNG ẨN DANH'
  if (companyNameDisplayMode.value === 'license') {
    return String(item.CUSTOMER || item.TEN_CONG_TY || 'KHÁCH HÀNG ẨN DANH').trim()
  }
  return String(item.TEN_CONG_TY || item.CUSTOMER || 'KHÁCH HÀNG ẨN DANH').trim()
}

const uniqueCustomer = computed(() => {
  const set = new Set(rawData.value.map(i => getDisplayCompanyForItem(i)).filter(Boolean));
  return Array.from(set).sort();
})

const totalRawCustomerCount = computed(() => {
  const set = new Set(rawData.value.map(i => getDisplayCompanyForItem(i)));
  return set.size;
})

const setQuickFilter = (type) => {
  clearSessionPinnedCards()
  filterExpirationStatus.value = 'all'
  filterExpirationMonths.value = 'all'
  filterExpirationValue.value = ''
  filterGraceStatus.value = 'all'
  filterGraceMonths.value = 'all'
  filterGraceValue.value = ''
  quickFilter.value = 'all'

  if (type === 'con_han') filterExpirationStatus.value = 'active'
  else if (type === 'qua_han') filterExpirationStatus.value = 'expired'
  else if (type === 'con_hieu_luc') filterGraceStatus.value = 'active'
  else if (type === 'qua_hieu_luc') filterGraceStatus.value = 'expired'
  else if (type === 'linked_po') quickFilter.value = 'linked_po'
  else if (type === 'unlinked_po') quickFilter.value = 'unlinked_po'
  else if (type === 'linked_kh') quickFilter.value = 'linked_kh'
  else if (type === 'unlinked_kh') quickFilter.value = 'unlinked_kh'
  else if (type === 'da_xu_ly') quickFilter.value = 'da_xu_ly'
  else if (type === 'da_gia_han') quickFilter.value = 'da_gia_han'
  else if (type === 'khong_gia_han') quickFilter.value = 'khong_gia_han'
}

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getThisMonthStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getWeekString(d) {
  const date = new Date(d.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function getWeekDateRange(weekStr) {
  if (!weekStr) return null;
  const parts = weekStr.split('-W');
  if (parts.length !== 2) return null;
  const [year, week] = parts.map(Number);
  const d = new Date(year, 0, 4);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1 + (week - 1) * 7);
  const start = new Date(d); start.setHours(0, 0, 0, 0);
  const end = new Date(d); end.setDate(end.getDate() + 6); end.setHours(23, 59, 59, 999);
  return { start, end };
}

const getFilterRange = () => {
  if (filterMode.value === 'all') return null
  if (filterMode.value === 'day') {
    const d = new Date(filterDate.value); d.setHours(0,0,0,0)
    const end = new Date(d); end.setHours(23,59,59,999)
    return { start: d, end }
  }
  if (filterMode.value === 'week') {
    return getWeekDateRange(filterWeek.value)
  }
  if (filterMode.value === 'month') {
    const [y, m] = filterMonth.value.split('-')
    const start = new Date(Number(y), Number(m) - 1, 1)
    const end = new Date(Number(y), Number(m), 0); end.setHours(23,59,59,999)
    return { start, end }
  }
  if (filterMode.value === 'year') {
    const y = Number(filterYear.value)
    return { start: new Date(y, 0, 1), end: new Date(y, 11, 31, 23, 59, 59, 999) }
  }
  return null
}

const selectedCard = ref(null)
const originalCard = ref(null)
const saving = ref(false)
const deleting = ref(false)
const editErrorMsg = ref('')
const editGraceDays = ref('')
const originalGraceDays = ref('')
const cardPreviewTabMap = ref({})
const editModalFileInput = ref(null)
const scanningEditFile = ref(false)
const showVendorPickerModal = ref(false)

const uploadLicenseFileToCloudinary = async (file) => {
  try {
    const fd = new FormData()
    fd.append('upload_preset', 'upload_file')
    fd.append('file', file)
    const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
      method: 'POST',
      body: fd
    }).then(r => r.json())
    return uploadRes.secure_url || ''
  } catch (err) {
    console.error('Lỗi upload file License:', err)
    return ''
  }
}

const triggerEditModalFileScan = () => {
  if (scanningEditFile.value) return
  if (editModalFileInput.value) {
    editModalFileInput.value.value = ''
    editModalFileInput.value.click()
  }
}

const applyScannedRecordToSelectedCard = (rec) => {
  if (!rec || !selectedCard.value) return
  const fieldsToApply = [
    'LICENSE_ID',
    'PRODUCT_CODE',
    'CUSTOMER',
    'PRODUCT_NAME',
    'LICENSE_VOLUME',
    'LICENSE_TYPE',
    'NHA_SAN_XUAT',
    'LOCALIZATION',
    'DATE_OF_LICENSE',
    'EXPIRATION_TIME',
    'SO_NGAY_HIEU_LUC',
    'LICENSE_DESCRIPTION'
  ]
  fieldsToApply.forEach((field) => {
    const val = String(rec[field] || '').trim()
    if (val) {
      selectedCard.value[field] = val
    }
  })

  if (selectedCard.value.SO_NGAY_HIEU_LUC && selectedCard.value.EXPIRATION_TIME) {
    const dGrace = parseDate(selectedCard.value.SO_NGAY_HIEU_LUC)
    const dExp = parseDate(selectedCard.value.EXPIRATION_TIME)
    if (dGrace && !isNaN(dGrace.getTime()) && dExp && !isNaN(dExp.getTime())) {
      const diffDays = Math.round((dGrace.getTime() - dExp.getTime()) / (1000 * 3600 * 24))
      editGraceDays.value = diffDays > 0 ? diffDays : ''
    }
  }

  if (!selectedCard.value.MA_KHACH_HANG && selectedCard.value.CUSTOMER) {
    const matchRes = fuzzyMatchCustomer(selectedCard.value.CUSTOMER, dbCustomers.value)
    const matched = matchRes?.matched || null
    if (matched) {
      selectedCard.value.MA_KHACH_HANG = matched.ma_khach_hang || ''
      selectedCard.value.TEN_CONG_TY = matched.ten_cong_ty || ''
      if (matched.ten_khach_hang) {
        selectedCard.value.TEN_KHACH_HANG = matched.ten_khach_hang
      }
    }
  }
}

const onEditModalFileSelected = async (e) => {
  const file = e.target?.files?.[0]
  if (!file || !selectedCard.value) return

  scanningEditFile.value = true
  editErrorMsg.value = ''

  const localBlobUrl = URL.createObjectURL(file)
  selectedCard.value.NAME_FILE = file.name
  selectedCard.value.LINK_FILE = localBlobUrl
  setCardPreviewTab(selectedCard.value, 'license')

  try {
    const [cloudUrl, extractedRecords] = await Promise.all([
      uploadLicenseFileToCloudinary(file),
      extractLicenseRecordsFromFile(file, false)
    ])

    if (cloudUrl) {
      selectedCard.value.LINK_FILE = cloudUrl
    } else {
      editErrorMsg.value = 'Không thể tải file lên máy chủ đám mây, vui lòng kiểm tra kết nối mạng.'
    }

    let rec = null
    if (Array.isArray(extractedRecords) && extractedRecords.length > 0) {
      rec =
        extractedRecords.find(
          r =>
            (selectedCard.value.PRODUCT_CODE && r.PRODUCT_CODE === selectedCard.value.PRODUCT_CODE) ||
            (selectedCard.value.LICENSE_ID && r.LICENSE_ID === selectedCard.value.LICENSE_ID)
        ) || extractedRecords[0]
    }

    const hasStandardData = Boolean(
      rec &&
      !rec._formatError &&
      (rec.LICENSE_ID || rec.PRODUCT_NAME || rec.CUSTOMER || rec.PRODUCT_CODE || rec.EXPIRATION_TIME)
    )

    if (!hasStandardData) {
      scanningEditFile.value = false
      const useAi = await confirmAction(
        'Sử dụng AI để quét thông số License?',
        `Hệ thống không tự động nhận diện được định dạng chuẩn của file "${file.name}". Bạn có muốn sử dụng AI để quét và bóc tách thông số License không?`,
        'Sử dụng AI để quét',
        'Để tự nhập tay'
      )
      asyncModal.value.show = false
      if (useAi) {
        scanningEditFile.value = true
        const aiRecs = await extractSmartLicenseWithAI(file, rec?._rawText || '', file.name)
        if (aiRecs && aiRecs.length > 0) {
          rec = { ...aiRecs[0], _formatError: false }
        } else {
          editErrorMsg.value = 'AI không tìm thấy thông tin hợp lệ từ chứng từ này. Vui lòng kiểm tra và nhập tay.'
        }
      }
    }

    if (rec && !rec._formatError) {
      applyScannedRecordToSelectedCard(rec)
    }
  } catch (err) {
    console.error('Lỗi quét file chỉnh sửa License:', err)
    editErrorMsg.value = 'Lỗi khi đọc & quét file: ' + (err.message || String(err))
  } finally {
    scanningEditFile.value = false
    if (e.target) e.target.value = ''
  }
}

const detectDocKind = (url, name) => {
  const check = `${name || ''} ${url || ''}`.toLowerCase()
  if (check.startsWith('data:image/') || /\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|\s|$)/i.test(check)) return 'image'
  if (/\.(xlsx?|xls|xlsm|xlsb|docx?|pptx?)(\?|#|\s|$)/i.test(check)) return 'office'
  return 'pdf'
}

const findLinkedPoForItem = (item) => {
  if (!item || !Array.isArray(officialPos.value)) return null
  const poKey = String(item.PO_FIREBASE_KEY || '').trim()
  const soPo = String(item.SO_PO || '').trim()
  if (poKey) {
    const found = officialPos.value.find(p => p.firebaseKey === poKey)
    if (found) return found
  }
  if (soPo) {
    const found = officialPos.value.find(p => String(p.soPO || '').trim() === soPo)
    if (found) return found
  }
  return null
}

const getItemPreviewDocs = (item) => {
  if (!item) return []
  const docs = []
  const licUrl = String(item.LINK_FILE || '').trim()
  const licName = String(item.NAME_FILE || 'Chứng từ License').trim()
  docs.push({
    key: 'license',
    label: 'License',
    name: licName,
    url: licUrl,
    kind: detectDocKind(licUrl, licName)
  })

  const linkedPo = findLinkedPoForItem(item)
  if (linkedPo) {
    if (linkedPo.linkBaoGia) {
      docs.push({
        key: 'po_bg',
        label: `Báo giá PO #${linkedPo.soPO || ''}`,
        name: linkedPo.tenFileBaoGia || 'File Báo giá PO',
        url: linkedPo.linkBaoGia,
        kind: detectDocKind(linkedPo.linkBaoGia, linkedPo.tenFileBaoGia)
      })
    }
    if (linkedPo.linkMuaHang) {
      docs.push({
        key: 'po_mh',
        label: `Mua hàng PO #${linkedPo.soPO || ''}`,
        name: linkedPo.tenFileMuaHang || 'File Mua hàng PO',
        url: linkedPo.linkMuaHang,
        kind: detectDocKind(linkedPo.linkMuaHang, linkedPo.tenFileMuaHang)
      })
    }
    if (linkedPo.linkDxmh) {
      docs.push({
        key: 'po_dxmh',
        label: `ĐXMH PO #${linkedPo.soPO || ''}`,
        name: linkedPo.tenFileDxmh || 'File ĐXMH PO',
        url: linkedPo.linkDxmh,
        kind: detectDocKind(linkedPo.linkDxmh, linkedPo.tenFileDxmh)
      })
    }
    if (linkedPo.imgSave) {
      docs.push({
        key: 'po_com',
        label: `COM PO #${linkedPo.soPO || ''}`,
        name: 'Chứng từ COM',
        url: linkedPo.imgSave,
        kind: 'image'
      })
    }
  }
  return docs
}

const getCardScopeKey = (item) => {
  if (!item) return 'default'
  return String(item.firebase_id || item.ROW_INDEX || item.LICENSE_ID || 'default')
}

const getActiveDocForItem = (item) => {
  const docs = getItemPreviewDocs(item)
  if (!docs.length) return null
  const scope = getCardScopeKey(item)
  const wantedKey = cardPreviewTabMap.value[scope]
  if (wantedKey) {
    const found = docs.find(d => d.key === wantedKey)
    if (found) return found
  }
  const firstWithUrl = docs.find(d => Boolean(d.url))
  return firstWithUrl || docs[0]
}

const setCardPreviewTab = (item, tabKey) => {
  const scope = getCardScopeKey(item)
  cardPreviewTabMap.value = {
    ...cardPreviewTabMap.value,
    [scope]: tabKey
  }
}

const getDocEmbedUrl = (doc) => {
  if (!doc || !doc.url) return ''
  if (doc.kind === 'office' && /^https?:\/\//i.test(doc.url)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.url)}`
  }
  return doc.url
}

const getDocOpenHref = (doc) => {
  if (!doc || !doc.url) return '#'
  if (doc.kind === 'office' && /^https?:\/\//i.test(doc.url)) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.url)}`
  }
  return doc.url
}

const calcGraceDate = (expirationTime, days) => {
  if (!expirationTime || days === '' || days === null || days === undefined || isNaN(Number(days))) return ''
  return addDaysToLicenseDate(expirationTime, Number(days))
}

const onEditGraceDaysInput = () => {
  if (!selectedCard.value) return
  if (editGraceDays.value !== '' && editGraceDays.value !== null && selectedCard.value.EXPIRATION_TIME) {
    selectedCard.value.SO_NGAY_HIEU_LUC = calcGraceDate(
      selectedCard.value.EXPIRATION_TIME,
      editGraceDays.value
    )
  }
}

const onEditExpirationDateChange = (newExpDate) => {
  if (!selectedCard.value) return
  if (editGraceDays.value !== '' && editGraceDays.value !== null && newExpDate) {
    selectedCard.value.SO_NGAY_HIEU_LUC = calcGraceDate(newExpDate, editGraceDays.value)
  } else if (newExpDate && selectedCard.value.SO_NGAY_HIEU_LUC) {
    const diff = diffDaysBetweenLicenseDates(newExpDate, selectedCard.value.SO_NGAY_HIEU_LUC)
    editGraceDays.value = diff !== null ? diff : ''
  }
}

const onEditGraceDateChange = (newGraceDate) => {
  if (!selectedCard.value) return
  if (!newGraceDate) {
    editGraceDays.value = ''
    return
  }
  if (selectedCard.value.EXPIRATION_TIME) {
    const diff = diffDaysBetweenLicenseDates(selectedCard.value.EXPIRATION_TIME, newGraceDate)
    editGraceDays.value = diff !== null ? diff : ''
  }
}

const getNsxStyle = (nsx) => {
  if (!nsx) return {}
  const name = nsx.toString().toLowerCase()
  if (name.includes('sophos')) {
    return { background: '#1d4ed8', color: '#ffffff', borderColor: '#3b82f6', fontWeight: '700' }
  }
  if (name.includes('kaspersky')) {
    return { background: '#059669', color: '#ffffff', borderColor: '#10b981', fontWeight: '700' }
  }
  if (name.includes('acronis')) {
    return { background: '#1e3a8a', color: '#ffffff', borderColor: '#3b82f6', fontWeight: '700' }
  }
  if (name.includes('delinea')) {
    return { background: '#7c3aed', color: '#ffffff', borderColor: '#8b5cf6', fontWeight: '700' }
  }
  return {}
}

const availablePosForSelected = computed(() => {
  if (!selectedCard.value) return []
  return filterPosForCustomer(
    officialPos.value,
    selectedCard.value.MA_KHACH_HANG,
    selectedCard.value.TEN_CONG_TY,
    selectedCard.value.CUSTOMER
  )
})

const onSelectedCardCustomerChange = () => {
  if (!selectedCard.value) return
  const found = dbCustomers.value.find(c => c.ma_khach_hang === selectedCard.value.MA_KHACH_HANG)
  selectedCard.value.TEN_CONG_TY = found ? found.ten_cong_ty : ''
  if (selectedCard.value.PO_FIREBASE_KEY) {
    const valid = availablePosForSelected.value.some(p => p.firebaseKey === selectedCard.value.PO_FIREBASE_KEY)
    if (!valid) {
      selectedCard.value.PO_FIREBASE_KEY = ''
      selectedCard.value.SO_PO = ''
    }
  }
}

const onSelectedCardPoChange = () => {
  if (!selectedCard.value) return
  const po = officialPos.value.find(p => p.firebaseKey === selectedCard.value.PO_FIREBASE_KEY)
  if (po) {
    selectedCard.value.SO_PO = po.soPO || ''
    if (!selectedCard.value.MA_KHACH_HANG && po.maKhachHang) {
      selectedCard.value.MA_KHACH_HANG = po.maKhachHang
    }
    if (!selectedCard.value.TEN_CONG_TY && po.tenCongTy) {
      selectedCard.value.TEN_CONG_TY = po.tenCongTy
    }
  } else {
    selectedCard.value.SO_PO = ''
  }
}

const syncSameVendorCustomerInMemory = (vendorName, custInfo, excludeFbId = '') => {
  const normVendor = normalizeForSearch(vendorName)
  if (!normVendor) return 0
  const maKh = String(custInfo?.MA_KHACH_HANG || custInfo?.ma_khach_hang || '').trim()
  const tenCty = String(custInfo?.TEN_CONG_TY || custInfo?.ten_cong_ty || '').trim()
  const tenKh = String(custInfo?.TEN_KHACH_HANG || custInfo?.ten_khach_hang || '').trim()
  if (!maKh && !tenCty) return 0

  let count = 0
  rawData.value.forEach(row => {
    if (excludeFbId && row.firebase_id === excludeFbId) return
    if (normalizeForSearch(row.CUSTOMER) !== normVendor) return
    if (!row.MA_KHACH_HANG && !row.TEN_CONG_TY) {
      row.MA_KHACH_HANG = maKh
      row.TEN_CONG_TY = tenCty
      if (tenKh) row.TEN_KHACH_HANG = tenKh
      count++
    }
  })
  return count
}

const handleCustomerSavedInModal = async (savedCust) => {
  if (!savedCust) return
  const idx = dbCustomers.value.findIndex(
    c => c.firebaseKey === savedCust.firebaseKey || c.ma_khach_hang === savedCust.ma_khach_hang
  )
  if (idx >= 0) {
    dbCustomers.value.splice(idx, 1, savedCust)
  } else {
    dbCustomers.value.unshift(savedCust)
  }

  if (selectedCard.value?.CUSTOMER) {
    syncSameVendorCustomerInMemory(
      selectedCard.value.CUSTOMER,
      savedCust,
      selectedCard.value.firebase_id
    )
    await propagateCustomerToSameVendorLicenses(
      database,
      selectedCard.value.CUSTOMER,
      savedCust,
      selectedCard.value.firebase_id
    )
  }
}

const getHandlingStatus = (item) => {
  if (!item) return ''
  return String(item.IS_GIA_HAN || item.is_gia_han || '').trim()
}

const isItemHandled = (item) => {
  return Boolean(getHandlingStatus(item))
}

const pinCardInCurrentSession = (item, statusBeforeChange) => {
  if (!item) return
  const key = getCardScopeKey(item)
  if (!key) return
  if (!Object.prototype.hasOwnProperty.call(sessionPinnedMap.value, key)) {
    sessionPinnedMap.value = {
      ...sessionPinnedMap.value,
      [key]: {
        initialStatus: String(statusBeforeChange ?? '').trim()
      }
    }
  }
}

const isCardSessionPinned = (item) => {
  if (!item) return false
  const entry = sessionPinnedMap.value[getCardScopeKey(item)]
  if (!entry) return false
  return getHandlingStatus(item) !== entry.initialStatus
}

const isItemOverdueOrGraceExpired = (item) => {
  if (!item) return false
  const t = targetCalcDate.value.getTime()
  const dExp = parseDateForCalc(item.EXPIRATION_TIME)
  if (dExp && dExp.getTime() < t) return true
  const dGrc = parseDateForCalc(item.SO_NGAY_HIEU_LUC)
  if (dGrc && dGrc.getTime() < t) return true
  return false
}

const setGiaHan = async (item, newVal) => {
  if (!item || !item.firebase_id) return
  const cleanVal = String(newVal || '').trim()
  const prevStatus = getHandlingStatus(item)
  if (prevStatus === cleanVal) return
  item._toggling = true
  try {
    const itemRef = dbRef(database, `license_old_data/${item.firebase_id}`)
    await update(itemRef, { IS_GIA_HAN: cleanVal })
    pinCardInCurrentSession(item, prevStatus)
    item.IS_GIA_HAN = cleanVal
    delete item.is_gia_han
    const idx = rawData.value.findIndex(r => r.firebase_id === item.firebase_id)
    if (idx !== -1) {
      rawData.value[idx].IS_GIA_HAN = cleanVal
      delete rawData.value[idx].is_gia_han
    }
    if (item.PO_FIREBASE_KEY) {
      await syncLicenseToSaleReportPO(
        database,
        item.firebase_id,
        { ...item, IS_GIA_HAN: cleanVal },
        item.PO_FIREBASE_KEY
      )
    }
  } catch (e) {
    console.error('Lỗi cập nhật trạng thái xử lý License:', e)
    asyncModal.value = {
      show: true,
      type: 'error',
      title: 'Lỗi cập nhật',
      msg: 'Không thể lưu trạng thái xử lý. Vui lòng thử lại.'
    }
  } finally {
    item._toggling = false
  }
}

const openEditModal = (item) => {
  if (item) {
    selectedMobileLicKey.value = getCardKey(item)
  }
  selectedCard.value = {
    MA_KHACH_HANG: '',
    TEN_CONG_TY: '',
    TEN_KHACH_HANG: '',
    SO_PO: '',
    PO_FIREBASE_KEY: '',
    IS_GIA_HAN: getHandlingStatus(item),
    ...JSON.parse(JSON.stringify(item))
  }
  selectedCard.value.IS_GIA_HAN = getHandlingStatus(item)
  originalCard.value = JSON.parse(JSON.stringify(selectedCard.value))
  editErrorMsg.value = ''

  if (item.SO_NGAY_HIEU_LUC && item.EXPIRATION_TIME) {
    const dGrace = parseDate(item.SO_NGAY_HIEU_LUC)
    const dExp = parseDate(item.EXPIRATION_TIME)
    if (dGrace && !isNaN(dGrace.getTime()) && dExp && !isNaN(dExp.getTime())) {
      const diffTime = dGrace.getTime() - dExp.getTime()
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24))
      editGraceDays.value = diffDays > 0 ? diffDays : ''
    } else {
      editGraceDays.value = ''
    }
  } else {
    editGraceDays.value = ''
  }
  originalGraceDays.value = editGraceDays.value
}

const selectedCardDuplicateInfo = computed(() => {
  if (!selectedCard.value) return { isDuplicate: false, status: 'ok', message: '' }
  const catalog = rawData.value.map(r => ({
    ...r,
    firebaseKey: r.firebase_id
  }))
  return inspectLicenseDuplicate(selectedCard.value, catalog, {
    excludeFirebaseKey: selectedCard.value.firebase_id
  })
})

const hasChanges = computed(() => {
  if (!selectedCard.value || !originalCard.value) return false;
  if (editGraceDays.value !== originalGraceDays.value) return true;
  return Object.keys(selectedCard.value).some(key => {
    return selectedCard.value[key] !== originalCard.value[key];
  });
})

const updateCard = async () => {
  editErrorMsg.value = ''
  if (selectedCardDuplicateInfo.value.status === 'exact_duplicate') {
    editErrorMsg.value = selectedCardDuplicateInfo.value.message
    asyncModal.value = {
      show: true,
      type: 'error',
      title: 'Cảnh báo trùng License ID — Chặn lưu',
      msg: selectedCardDuplicateInfo.value.message
    }
    return
  }

  const userConfirmed = await confirmAction('Lưu thay đổi', 'Bạn có chắc chắn muốn lưu các thay đổi này?', 'Lưu');
  if (!userConfirmed) return;

  saving.value = true
  editErrorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang cập nhật thông tin...' }
  try {
    if (
      !selectedCard.value.SO_NGAY_HIEU_LUC &&
      editGraceDays.value !== '' &&
      editGraceDays.value !== null &&
      selectedCard.value.EXPIRATION_TIME
    ) {
      selectedCard.value.SO_NGAY_HIEU_LUC = calcGraceDate(selectedCard.value.EXPIRATION_TIME, editGraceDays.value)
    }
    if (!selectedCard.value.firebase_id) {
      throw new Error('No firebase_id');
    }
    const oldPoKey = originalCard.value?.PO_FIREBASE_KEY || ''
    const updateData = { ...selectedCard.value };
    updateData.IS_GIA_HAN = String(selectedCard.value.IS_GIA_HAN || '').trim();
    delete updateData.firebase_id;
    delete updateData.ROW_INDEX;
    delete updateData.is_gia_han;
    delete updateData._toggling;
    const updateRef = dbRef(database, 'license_old_data/' + selectedCard.value.firebase_id);
    await update(updateRef, updateData);

    await syncLicenseToSaleReportPO(
      database,
      selectedCard.value.firebase_id,
      updateData,
      oldPoKey
    );

    const prevModalStatus = String(originalCard.value?.IS_GIA_HAN || '').trim()
    if (prevModalStatus !== updateData.IS_GIA_HAN) {
      pinCardInCurrentSession(selectedCard.value, prevModalStatus)
    }

    const idx = rawData.value.findIndex(r => r.firebase_id === selectedCard.value.firebase_id)
    if (idx !== -1) {
      rawData.value[idx] = { ...selectedCard.value, IS_GIA_HAN: updateData.IS_GIA_HAN }
    }

    // Tự động gắn luôn cho các License khác có cùng tên CUSTOMER (đang trống DB)
    let autoLinkedSiblingsCount = 0
    if (
      selectedCard.value.CUSTOMER &&
      (selectedCard.value.MA_KHACH_HANG || selectedCard.value.TEN_CONG_TY)
    ) {
      syncSameVendorCustomerInMemory(
        selectedCard.value.CUSTOMER,
        selectedCard.value,
        selectedCard.value.firebase_id
      )
      const updatedKeys = await propagateCustomerToSameVendorLicenses(
        database,
        selectedCard.value.CUSTOMER,
        selectedCard.value,
        selectedCard.value.firebase_id
      )
      autoLinkedSiblingsCount = updatedKeys.length
    }

    selectedCard.value = null
    asyncModal.value = {
      show: true,
      type: 'success',
      title: 'Thành công!',
      msg:
        autoLinkedSiblingsCount > 0
          ? `Đã lưu & tự động gắn KH cho thêm ${autoLinkedSiblingsCount} License cùng tên!`
          : 'Đã lưu thay đổi & đồng bộ PO'
    }
    setTimeout(() => asyncModal.value.show = false, 1800)
  } catch(e) {
    console.error(e);
    editErrorMsg.value = 'Lỗi kết nối mạng'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
  } finally {
    saving.value = false
  }
}

const deleteCard = async () => {
  if (!selectedCard.value?.firebase_id) return
  const fbId = String(selectedCard.value.firebase_id).trim()
  const origPoKey = String(originalCard.value?.PO_FIREBASE_KEY || '').trim()
  const curPoKey = String(selectedCard.value.PO_FIREBASE_KEY || '').trim()
  const origSoPo = String(originalCard.value?.SO_PO || '').trim()
  const curSoPo = String(selectedCard.value.SO_PO || '').trim()
  const targetLicenseId = String(originalCard.value?.LICENSE_ID || selectedCard.value.LICENSE_ID || '').trim()

  const matchedPosInCatalog = (officialPos.value || []).filter(po => {
    if (!po || !po.firebaseKey) return false
    const pKey = String(po.firebaseKey).trim()
    const pSo = String(po.soPO || '').trim()
    if (origPoKey && pKey === origPoKey) return true
    if (origSoPo && pSo && pSo === origSoPo) return true
    if (Array.isArray(po.danhSachLicense)) {
      return po.danhSachLicense.some(entry =>
        entry &&
        (String(entry.licenseFirebaseId || '').trim() === fbId ||
          String(entry.firebase_id || '').trim() === fbId ||
          String(entry.firebaseId || '').trim() === fbId ||
          String(entry.id || '').trim() === fbId)
      )
    }
    return false
  })

  const linkedPoLabels = Array.from(
    new Set(
      [
        origSoPo,
        ...matchedPosInCatalog.map(po => String(po.soPO || '').trim())
      ].filter(Boolean)
    )
  )
  const hasLinkedPo = Boolean(origPoKey || origSoPo || matchedPosInCatalog.length > 0)
  const poLabelDisplay = linkedPoLabels.length > 0 ? linkedPoLabels.join(', ') : origPoKey
  const confirmTitle = hasLinkedPo ? 'Xóa License & Hủy liên kết PO' : 'Xóa License'
  const confirmMsg = hasLinkedPo
    ? `License này đang liên kết với PO "${poLabelDisplay}". Khi xóa khỏi kho bản quyền, hệ thống sẽ đồng thời hủy liên kết trên PO bên SaleReport. Bạn có chắc chắn muốn xóa?`
    : 'Bạn có chắc chắn muốn xóa bản quyền này khỏi cơ sở dữ liệu?'

  const userConfirmed = await confirmAction(
    confirmTitle,
    confirmMsg,
    hasLinkedPo ? 'Xóa & Hủy liên kết' : 'Xóa',
    'Hủy'
  );
  if (!userConfirmed) return;

  deleting.value = true
  editErrorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang xóa bản quyền & đồng bộ PO...' }
  try {
    const scopeKey = getCardScopeKey(selectedCard.value)
    const delRef = dbRef(database, 'license_old_data/' + fbId);
    await remove(delRef);

    const unlinkedKeys = await unlinkDeletedLicenseFromSaleReport(database, fbId, {
      poKeys: [origPoKey, curPoKey],
      soPos: [origSoPo, curSoPo],
      officialPos: officialPos.value,
      licenseId: targetLicenseId
    })

    if (scopeKey && Object.prototype.hasOwnProperty.call(sessionPinnedMap.value, scopeKey)) {
      const nextMap = { ...sessionPinnedMap.value }
      delete nextMap[scopeKey]
      sessionPinnedMap.value = nextMap
    }

    rawData.value = rawData.value.filter(r => r.firebase_id !== fbId)
    selectedCard.value = null
    asyncModal.value = {
      show: true,
      type: 'success',
      title: 'Thành công!',
      msg:
        unlinkedKeys.length > 0 || hasLinkedPo
          ? `Đã xóa License & hủy liên kết PO${poLabelDisplay ? ' ' + poLabelDisplay : ''}`
          : 'Đã xóa bản quyền'
    }
    setTimeout(() => asyncModal.value.show = false, 1600)
  } catch(e) {
    editErrorMsg.value = 'Lỗi kết nối mạng'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
  } finally {
    deleting.value = false
  }
}

const removeDiacritics = (str) => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

const normalizeForSearch = (str) => {
  if (!str) return '';
  return removeDiacritics(String(str))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const escapeHtml = (unsafe) => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const highlightMatch = (text, query) => {
  if (!query || !text) return escapeHtml(text);

  const normQuery = normalizeForSearch(query);
  if (!normQuery) return escapeHtml(text);

  const originalStr = String(text);
  let matchStartIndex = -1;
  let matchEndIndex = -1;

  for (let i = 0; i < originalStr.length; i++) {
    let currentNormMatch = '';
    let j = i;
    while (j < originalStr.length && currentNormMatch.length < normQuery.length) {
      const cNorm = normalizeForSearch(originalStr[j]);
      if (cNorm) {
        currentNormMatch += cNorm;
      }
      j++;
    }

    if (currentNormMatch === normQuery) {
      matchStartIndex = i;
      matchEndIndex = j;
      break;
    }
  }

  if (matchStartIndex !== -1) {
    const before = originalStr.substring(0, matchStartIndex);
    const match = originalStr.substring(matchStartIndex, matchEndIndex);
    const after = originalStr.substring(matchEndIndex);
    return `${escapeHtml(before)}<mark style="background-color: #fef08a; color: #854d0e; padding: 0 2px; border-radius: 3px;">${escapeHtml(match)}</mark>${escapeHtml(after)}`;
  }

  return escapeHtml(text);
}

const formatDisplayDate = (val) => {
  if (!val) return '';
  const str = String(val).trim();

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;

  const d = new Date(str);
  if (!isNaN(d.getTime()) && (str.includes('-') || str.includes('T'))) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return str;
}

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = String(dateStr).split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
}

const parseDateForCalc = (dateStr) => {
  if (!dateStr) return null;
  const d = parseDate(dateStr);
  if (!d || isNaN(d.getTime())) return null;
  return d;
}

const targetCalcDate = computed(() => {
  const range = getFilterRange();
  if (range && range.end) {
    const d = new Date(range.end);
    d.setHours(0,0,0,0);
    return d;
  }
  const d = new Date();
  d.setHours(0,0,0,0);
  return d;
})

const getRemainingDays = (expirationTime) => {
  if (!expirationTime) return null;
  const expDate = parseDate(expirationTime);
  if (!expDate || isNaN(expDate.getTime())) return null;

  const now = targetCalcDate.value;
  const diffTime = expDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const getRemainingTimeText = (expirationTime) => {
  if (!expirationTime) return '';
  const expDate = parseDate(expirationTime);
  if (!expDate || isNaN(expDate.getTime())) return '';

  const range = getFilterRange();
  if (!range) {
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diff < 0) return `Quá hạn ${Math.abs(diff)} ngày`;
    if (diff === 0) return 'Hết hạn hôm nay';
    return `Còn ${diff} ngày`;
  }

  const diffStart = expDate.getTime() - range.start.getTime();
  const daysLeftStart = Math.ceil(diffStart / (1000 * 3600 * 24));

  const diffEnd = expDate.getTime() - range.end.getTime();
  const daysLeftEnd = Math.ceil(diffEnd / (1000 * 3600 * 24));

  if (filterMode.value === 'day') {
    if (daysLeftEnd < 0) return `Quá hạn ${Math.abs(daysLeftEnd)} ngày`;
    if (daysLeftEnd === 0) return 'Hết hạn hôm nay';
    return `Còn ${daysLeftEnd} ngày`;
  } else {
    if (daysLeftStart < 0 && daysLeftEnd < 0) {
      return `Quá hạn ${Math.abs(daysLeftStart)} - ${Math.abs(daysLeftEnd)} ngày`;
    } else if (daysLeftStart >= 0 && daysLeftEnd >= 0) {
      return `Còn ${daysLeftEnd} - ${daysLeftStart} ngày`;
    } else {
      return `Còn ${daysLeftStart} ngày -> Quá hạn ${Math.abs(daysLeftEnd)} ngày`;
    }
  }
}

const getRemainingTimeBadgeClass = (expirationTime) => {
  const days = getRemainingDays(expirationTime);
  if (days === null) return '';
  if (days < 0) return 'badge-danger';
  if (days <= 30) return 'badge-warning';
  return 'badge-success';
}

const getHieuLucText = (soNgayHieuLuc) => {
  if (!soNgayHieuLuc) return '—';
  const expDate = parseDate(soNgayHieuLuc);
  if (!expDate || isNaN(expDate.getTime())) return '—';

  const range = getFilterRange();
  if (!range) {
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diff < 0) return `Hết ${Math.abs(diff)} ngày`;
    if (diff === 0) return 'Hôm nay';
    return `Còn ${diff} ngày`;
  }

  const diffStart = expDate.getTime() - range.start.getTime();
  const daysLeftStart = Math.ceil(diffStart / (1000 * 3600 * 24));

  const diffEnd = expDate.getTime() - range.end.getTime();
  const daysLeftEnd = Math.ceil(diffEnd / (1000 * 3600 * 24));

  if (filterMode.value === 'day') {
    if (daysLeftEnd < 0) return `Hết ${Math.abs(daysLeftEnd)} ngày`;
    if (daysLeftEnd === 0) return 'Hôm nay';
    return `Còn ${daysLeftEnd} ngày`;
  } else {
    if (daysLeftStart < 0 && daysLeftEnd < 0) {
      return `Hết ${Math.abs(daysLeftStart)} - ${Math.abs(daysLeftEnd)} ngày`;
    } else if (daysLeftStart >= 0 && daysLeftEnd >= 0) {
      return `Còn ${daysLeftEnd} - ${daysLeftStart} ngày`;
    } else {
      return `Còn ${daysLeftStart} ngày -> Hết ${Math.abs(daysLeftEnd)} ngày`;
    }
  }
}

const getHieuLucColor = (soNgayHieuLuc) => {
  const isLight = uiTheme.value === 'light'
  if (!soNgayHieuLuc) return isLight ? '#64748b' : '#94a3b8';
  const d = parseDate(soNgayHieuLuc);
  if (!d || isNaN(d.getTime())) return isLight ? '#64748b' : '#94a3b8';
  const now = targetCalcDate.value;
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return isLight ? '#dc2626' : '#f87171';
  if (diff <= 10) return isLight ? '#d97706' : '#fbbf24';
  return isLight ? '#059669' : '#34d399';
}

const baseData = computed(() => {
  let data = rawData.value;
  if (searchQuery.value) {
    const q = normalizeForSearch(searchQuery.value);
    data = data.filter(item => {
      return (
        (item.CUSTOMER && normalizeForSearch(item.CUSTOMER).includes(q)) ||
        (item.TEN_CONG_TY && normalizeForSearch(item.TEN_CONG_TY).includes(q)) ||
        (item.MA_KHACH_HANG && normalizeForSearch(item.MA_KHACH_HANG).includes(q)) ||
        (item.SO_PO && normalizeForSearch(item.SO_PO).includes(q)) ||
        (item.LICENSE_ID && normalizeForSearch(item.LICENSE_ID).includes(q)) ||
        (item.PRODUCT_NAME && normalizeForSearch(item.PRODUCT_NAME).includes(q)) ||
        (item.PRODUCT_CODE && normalizeForSearch(item.PRODUCT_CODE).includes(q))
      );
    });
  }

  if (filterNhaSanXuat.value !== 'all') {
    data = data.filter(item => (item.NHA_SAN_XUAT || item.nha_san_xuat) === filterNhaSanXuat.value);
  }

  if (filterCustomer.value !== 'all') {
    data = data.filter(item => getDisplayCompanyForItem(item) === filterCustomer.value || item.CUSTOMER === filterCustomer.value);
  }

  return data;
})

const kpiStats = computed(() => {
  const t = targetCalcDate.value.getTime()
  let conHan = 0
  let quaHan = 0
  let conHieuLuc = 0
  let quaHieuLuc = 0
  let linkedPo = 0
  let unlinkedPo = 0
  let linkedKh = 0
  let unlinkedKh = 0
  let daXuLy = 0
  let daGiaHan = 0
  let khongGiaHan = 0
  let daXuLyExp = 0
  let daXuLyGrace = 0

  for (const i of baseData.value) {
    const status = getHandlingStatus(i)
    const handled = Boolean(status)
    if (handled) {
      daXuLy++
      if (status === 'Đã gia hạn') daGiaHan++
      else if (status === 'Không gia hạn') khongGiaHan++
    }

    const dExp = parseDateForCalc(i.EXPIRATION_TIME)
    if (dExp) {
      if (dExp.getTime() >= t) {
        conHan++
      } else if (handled) {
        daXuLyExp++
      } else {
        quaHan++
      }
    }
    const dGrc = parseDateForCalc(i.SO_NGAY_HIEU_LUC)
    if (dGrc) {
      if (dGrc.getTime() >= t) {
        conHieuLuc++
      } else if (handled) {
        daXuLyGrace++
      } else {
        quaHieuLuc++
      }
    }
    if (i.PO_FIREBASE_KEY || i.SO_PO) linkedPo++
    else unlinkedPo++

    if (i.MA_KHACH_HANG) linkedKh++
    else unlinkedKh++
  }
  return {
    conHan,
    quaHan,
    conHieuLuc,
    quaHieuLuc,
    linkedPo,
    unlinkedPo,
    linkedKh,
    unlinkedKh,
    daXuLy,
    daGiaHan,
    khongGiaHan,
    daXuLyExp,
    daXuLyGrace
  }
})

const linkedKhPct = computed(() => {
  if (!baseData.value.length) return 0
  return Math.round((kpiStats.value.linkedKh / baseData.value.length) * 100)
})

const matchesHandlingAndExpiryFilters = (item, statusStr, targetDate, expLimitDays, graceLimitDays) => {
  const handled = Boolean(statusStr);

  if (filterExpirationStatus.value !== 'all' || expLimitDays !== null) {
    const expDate = parseDateForCalc(item.EXPIRATION_TIME);
    if (!expDate) return false;
    const diffExp = Math.ceil((expDate.getTime() - targetDate.getTime()) / (1000 * 3600 * 24));

    const effExpStatus = filterExpirationStatus.value !== 'all' ? filterExpirationStatus.value : 'active'
    if (effExpStatus === 'active' && diffExp < 0) return false;
    if (effExpStatus === 'expired') {
      if (diffExp >= 0) return false;
      // Loại trừ các License đã xử lý để khi lọc Quá hạn không bị sai lệch
      if (handled) return false;
    }

    if (expLimitDays !== null) {
      if (Math.abs(diffExp) > expLimitDays) return false;
    } else if (filterExpirationMonths.value !== 'all') {
      const months = parseInt(filterExpirationMonths.value);
      if (Math.abs(diffExp) > months * 30) return false;
    }
  }

  if (filterGraceStatus.value !== 'all' || graceLimitDays !== null) {
    const graceDate = parseDateForCalc(item.SO_NGAY_HIEU_LUC);
    if (!graceDate) return false;
    const diffGrace = Math.ceil((graceDate.getTime() - targetDate.getTime()) / (1000 * 3600 * 24));

    const effGraceStatus = filterGraceStatus.value !== 'all' ? filterGraceStatus.value : 'active'
    if (effGraceStatus === 'active' && diffGrace < 0) return false;
    if (effGraceStatus === 'expired') {
      if (diffGrace >= 0) return false;
      // Loại trừ các License đã xử lý để khi lọc Quá hiệu lực không bị sai lệch
      if (handled) return false;
    }

    if (graceLimitDays !== null) {
      if (Math.abs(diffGrace) > graceLimitDays) return false;
    } else if (filterGraceMonths.value !== 'all') {
      const months = parseInt(filterGraceMonths.value);
      if (Math.abs(diffGrace) > months * 30) return false;
    }
  }

  if (quickFilter.value === 'da_xu_ly' && !handled) return false;
  if (quickFilter.value === 'da_gia_han' && statusStr !== 'Đã gia hạn') return false;
  if (quickFilter.value === 'khong_gia_han' && statusStr !== 'Không gia hạn') return false;

  return true;
}

const filteredData = computed(() => {
  let data = baseData.value;
  const targetDate = targetCalcDate.value;
  const expLimitDays = convertDurationToDays(filterExpirationValue.value, filterExpirationUnit.value);
  const graceLimitDays = convertDurationToDays(filterGraceValue.value, filterGraceUnit.value);
  const pinnedSnapshot = sessionPinnedMap.value;

  data = data.filter(item => {
    if (quickFilter.value === 'linked_po' && !(item.PO_FIREBASE_KEY || item.SO_PO)) return false;
    if (quickFilter.value === 'unlinked_po' && !!(item.PO_FIREBASE_KEY || item.SO_PO)) return false;
    if (quickFilter.value === 'linked_kh' && !item.MA_KHACH_HANG) return false;
    if (quickFilter.value === 'unlinked_kh' && !!item.MA_KHACH_HANG) return false;

    const currentStatus = getHandlingStatus(item);
    if (matchesHandlingAndExpiryFilters(item, currentStatus, targetDate, expLimitDays, graceLimitDays)) {
      return true;
    }

    // Phương án 1: Giữ cố định Card vừa bấm Đã gia hạn / Không gia hạn / Hoàn tác tại chỗ trong phiên lọc hiện tại
    const pinnedEntry = pinnedSnapshot[getCardScopeKey(item)];
    if (
      pinnedEntry &&
      matchesHandlingAndExpiryFilters(item, pinnedEntry.initialStatus, targetDate, expLimitDays, graceLimitDays)
    ) {
      return true;
    }

    return false;
  });

  return data;
})

const fetchData = async () => {
  clearSessionPinnedCards();
  loading.value = true;
  try {
    const [snapshot, catalog] = await Promise.all([
      get(dbRef(database, 'license_old_data')),
      loadCustomerAndPoCatalog(database)
    ]);
    dbCustomers.value = catalog.customers;
    officialPos.value = catalog.officialPos;

    if (snapshot.exists()) {
      const data = snapshot.val();
      const rows = [];
      let index = 0;
      const vendorToDbCustMap = new Map();

      for (const key in data) {
        const item = data[key];
        let maKh = item.MA_KHACH_HANG || item.ma_khach_hang || '';
        let tenCongTy = item.TEN_CONG_TY || item.ten_cong_ty || '';
        let tenKhachHang = item.TEN_KHACH_HANG || item.ten_khach_hang || '';
        if (maKh || tenCongTy) {
          const normComp = normalizeForSearch(tenCongTy);
          const foundCust = catalog.customers.find(
            c => (maKh && c.ma_khach_hang === maKh) || (normComp && normalizeForSearch(c.ten_cong_ty) === normComp)
          );
          if (foundCust) {
            if (!maKh) maKh = foundCust.ma_khach_hang || '';
            if (!tenCongTy) tenCongTy = foundCust.ten_cong_ty || '';
            if (!tenKhachHang) tenKhachHang = foundCust.ten_khach_hang || '';
          }
        }
        const rowObj = {
          firebase_id: key,
          ROW_INDEX: index + 2,
          LICENSE_ID: item.LICENSE_ID || item.lICENSE_ID || '',
          CUSTOMER: item.CUSTOMER || '',
          MA_KHACH_HANG: maKh,
          TEN_CONG_TY: tenCongTy,
          TEN_KHACH_HANG: tenKhachHang,
          SO_PO: item.SO_PO || item.so_po || '',
          PO_FIREBASE_KEY: item.PO_FIREBASE_KEY || item.po_firebase_key || '',
          PRODUCT_NAME: item.PRODUCT_NAME || '',
          LOCALIZATION: item.LOCALIZATION || '',
          LICENSE_VOLUME: item.LICENSE_VOLUME || '',
          LICENSE_DESCRIPTION: item.LICENSE_DESCRIPTION || '',
          DATE_OF_LICENSE: formatFirebaseDate(item.DATE_OF_LICENSE),
          EXPIRATION_TIME: formatFirebaseDate(item.EXPIRATION_TIME),
          LICENSE_TYPE: item.LICENSE_TYPE || '',
          PRODUCT_CODE: item.PRODUCT_CODE || '',
          LINK_FILE: item.LINK_FILE || '',
          NAME_FILE: item.NAME_FILE || '',
          SO_NGAY_HIEU_LUC: formatFirebaseDate(item.SO_NGAY_HIEU_LUC || item.so_ngay_hieu_luc),
          NHA_SAN_XUAT: item.NHA_SAN_XUAT || item.nha_san_xuat || '',
          IS_GIA_HAN: item.IS_GIA_HAN || item.is_gia_han || '',
        };
        rows.push(rowObj);

        const normVendor = normalizeForSearch(rowObj.CUSTOMER);
        if (normVendor && (rowObj.MA_KHACH_HANG || rowObj.TEN_CONG_TY) && !vendorToDbCustMap.has(normVendor)) {
          vendorToDbCustMap.set(normVendor, {
            maKh: rowObj.MA_KHACH_HANG,
            tenCongTy: rowObj.TEN_CONG_TY,
            tenKhachHang: rowObj.TEN_KHACH_HANG
          });
        }
        index++;
      }

      // Tự động kế thừa KH (DB) cho các License khác có cùng tên CUSTOMER mà đang bị trống DB
      const autoPropagateUpdates = {};
      for (const r of rows) {
        if (!r.MA_KHACH_HANG && !r.TEN_CONG_TY && r.CUSTOMER) {
          const normV = normalizeForSearch(r.CUSTOMER);
          const inherited = normV ? vendorToDbCustMap.get(normV) : null;
          if (inherited) {
            r.MA_KHACH_HANG = inherited.maKh;
            r.TEN_CONG_TY = inherited.tenCongTy;
            r.TEN_KHACH_HANG = inherited.tenKhachHang;
            if (r.firebase_id) {
              autoPropagateUpdates[`${r.firebase_id}/MA_KHACH_HANG`] = inherited.maKh;
              autoPropagateUpdates[`${r.firebase_id}/TEN_CONG_TY`] = inherited.tenCongTy;
              if (inherited.tenKhachHang) {
                autoPropagateUpdates[`${r.firebase_id}/TEN_KHACH_HANG`] = inherited.tenKhachHang;
              }
            }
          }
        }
      }
      if (Object.keys(autoPropagateUpdates).length > 0) {
        update(dbRef(database, 'license_old_data'), autoPropagateUpdates).catch(err =>
          console.error('Auto-inherit customer for same CUSTOMER error:', err)
        );
      }

      rawData.value = rows;
    } else {
      rawData.value = [];
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu license_old_data:', err);
  } finally {
    loading.value = false;
  }
}

// === GOM NHÓM CÔNG TY CHUẨN SALEREPORTFIREBASE (SIDEBAR + MAIN AREA) ===
const allCustomerGroups = computed(() => {
  const map = new Map()
  const t = targetCalcDate.value.getTime()

  for (const item of filteredData.value) {
    const customer = getDisplayCompanyForItem(item)
    if (!map.has(customer)) {
      map.set(customer, [])
    }
    map.get(customer).push(item)
  }

  const keys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b, 'vi'))
  const anonIdx = keys.indexOf('KHÁCH HÀNG ẨN DANH')
  if (anonIdx > -1) {
    keys.splice(anonIdx, 1)
    keys.push('KHÁCH HÀNG ẨN DANH')
  }

  return keys.map(customer => {
    const items = map.get(customer) || []
    let conHan = 0
    let quaHan = 0
    let conHieuLuc = 0
    let quaHieuLuc = 0
    let linkedPo = 0
    let linkedKh = 0
    let fileCount = 0
    let daXuLy = 0
    let daGiaHan = 0
    let khongGiaHan = 0
    let daXuLyExp = 0
    let daXuLyGrace = 0
    let maKhachHang = ''
    let vendorCustomer = ''
    let dbCompanyName = ''
    const nsxSet = new Set()

    for (const i of items) {
      const status = getHandlingStatus(i)
      const handled = Boolean(status)
      if (handled) {
        daXuLy++
        if (status === 'Đã gia hạn') daGiaHan++
        else if (status === 'Không gia hạn') khongGiaHan++
      }

      const dExp = parseDateForCalc(i.EXPIRATION_TIME)
      if (dExp) {
        if (dExp.getTime() >= t) conHan++
        else if (handled) daXuLyExp++
        else quaHan++
      }
      const dGrc = parseDateForCalc(i.SO_NGAY_HIEU_LUC)
      if (dGrc) {
        if (dGrc.getTime() >= t) conHieuLuc++
        else if (handled) daXuLyGrace++
        else quaHieuLuc++
      }
      if (i.PO_FIREBASE_KEY || i.SO_PO) linkedPo++
      if (i.MA_KHACH_HANG || i.TEN_CONG_TY) {
        linkedKh++
        if (!maKhachHang && i.MA_KHACH_HANG) maKhachHang = i.MA_KHACH_HANG
        if (!dbCompanyName && i.TEN_CONG_TY) dbCompanyName = i.TEN_CONG_TY
      }
      if (!vendorCustomer && i.CUSTOMER) {
        vendorCustomer = i.CUSTOMER
      }

      if (i.LINK_FILE) fileCount++
      if (i.NHA_SAN_XUAT) nsxSet.add(i.NHA_SAN_XUAT)
    }

    const linkedPoPct = items.length > 0 ? Math.round((linkedPo / items.length) * 100) : 0
    const hasDbCompany = Boolean(maKhachHang || dbCompanyName)

    return {
      customer,
      maKhachHang,
      vendorCustomer,
      dbCompanyName,
      hasDbCompany,
      items,
      conHan,
      quaHan,
      conHieuLuc,
      quaHieuLuc,
      linkedPo,
      linkedKh,
      fileCount,
      daXuLy,
      daGiaHan,
      khongGiaHan,
      daXuLyExp,
      daXuLyGrace,
      nsxList: Array.from(nsxSet),
      linkedPoPct
    }
  })
})

const totalGroupsCount = computed(() => allCustomerGroups.value.length)

const activeMasterGroup = computed(() => {
  if (!allCustomerGroups.value.length) return null
  if (selectedMasterCustomer.value) {
    const found = allCustomerGroups.value.find(g => g.customer === selectedMasterCustomer.value)
    if (found) return found
  }
  return allCustomerGroups.value[0]
})

const selectMasterCustomer = (customer) => {
  selectedMasterCustomer.value = customer
  if (isMobileShell.value) {
    const matchedGroup = allCustomerGroups.value.find(g => g.customer === customer)
    if (matchedGroup && matchedGroup.items && matchedGroup.items[0]) {
      selectedMobileLicKey.value = getCardKey(matchedGroup.items[0])
    }
    mobileActiveTab.value = 'company_detail'
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

// ===== MOBILE NATIVE APP SHELL & FLOATING GLASS DOCK (<= 1100px chuẩn SaleReportFirebase.vue) =====
const MOBILE_SHELL_BREAKPOINT = 1100
const isMobileShell = ref(
  typeof window !== 'undefined' ? window.innerWidth <= MOBILE_SHELL_BREAKPOINT : false
)
const mobileActiveTab = ref('overview')
const selectedMobileLicKey = ref('')
const showMobileFilterSheet = ref(false)

const updateMobileShellViewport = () => {
  if (typeof window === 'undefined') return
  isMobileShell.value = window.innerWidth <= MOBILE_SHELL_BREAKPOINT
  if (!isMobileShell.value) {
    showMobileFilterSheet.value = false
  }
}

const switchMobileTab = (tab) => {
  showMobileFilterSheet.value = false
  showDisplaySettingPopover.value = false
  mobileActiveTab.value = tab
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const toggleMobileFilterSheet = () => {
  showDisplaySettingPopover.value = false
  showMobileFilterSheet.value = !showMobileFilterSheet.value
}

const toggleMobileDisplaySheet = () => {
  showMobileFilterSheet.value = false
  showDisplaySettingPopover.value = !showDisplaySettingPopover.value
}

const openMobileImportModal = () => {
  showMobileFilterSheet.value = false
  showDisplaySettingPopover.value = false
  showImportModal.value = true
}

const mobileSheetFilterCount = computed(() => {
  let c = 0
  if (filterMode.value !== 'all') c++
  if (filterExpirationStatus.value !== 'all' || convertDurationToDays(filterExpirationValue.value, filterExpirationUnit.value) !== null) c++
  if (filterGraceStatus.value !== 'all' || convertDurationToDays(filterGraceValue.value, filterGraceUnit.value) !== null) c++
  if (filterNhaSanXuat.value !== 'all') c++
  if (filterCustomer.value !== 'all') c++
  if (quickFilter.value !== 'all') c++
  return c
})

const resetMobileSheetFilters = () => {
  clearSessionPinnedCards()
  filterMode.value = 'all'
  filterExpirationStatus.value = 'all'
  filterExpirationMonths.value = 'all'
  filterExpirationValue.value = ''
  filterExpirationUnit.value = 'month'
  filterGraceStatus.value = 'all'
  filterGraceMonths.value = 'all'
  filterGraceValue.value = ''
  filterGraceUnit.value = 'day'
  filterNhaSanXuat.value = 'all'
  filterCustomer.value = 'all'
  quickFilter.value = 'all'
}

const getUnitViLabel = (u) => {
  if (u === 'day') return 'Ngày'
  if (u === 'year') return 'Năm'
  return 'Tháng'
}

const mobileActiveFilterChips = computed(() => {
  const chips = []

  if (filterExpirationStatus.value !== 'all' || convertDurationToDays(filterExpirationValue.value, filterExpirationUnit.value) !== null) {
    const baseLbl = filterExpirationStatus.value === 'expired' ? 'Quá hạn' : 'Còn hạn'
    const durVal = String(filterExpirationValue.value || '').trim()
    const lbl = durVal ? `${baseLbl} ≤ ${durVal} ${getUnitViLabel(filterExpirationUnit.value)}` : baseLbl
    chips.push({
      key: 'exp',
      label: lbl,
      clear: () => {
        filterExpirationStatus.value = 'all'
        filterExpirationValue.value = ''
      }
    })
  }

  if (filterGraceStatus.value !== 'all' || convertDurationToDays(filterGraceValue.value, filterGraceUnit.value) !== null) {
    const baseLbl = filterGraceStatus.value === 'expired' ? 'Quá HL' : 'Còn HL'
    const durVal = String(filterGraceValue.value || '').trim()
    const lbl = durVal ? `${baseLbl} ≤ ${durVal} ${getUnitViLabel(filterGraceUnit.value)}` : baseLbl
    chips.push({
      key: 'grace',
      label: lbl,
      clear: () => {
        filterGraceStatus.value = 'all'
        filterGraceValue.value = ''
      }
    })
  }

  if (quickFilter.value !== 'all') {
    const qMap = {
      da_xu_ly: 'Đã xử lý',
      da_gia_han: 'Đã gia hạn',
      khong_gia_han: 'Không gia hạn',
      linked_po: 'Đã gắn PO',
      unlinked_po: 'Chưa gắn PO',
      linked_kh: 'Đã gắn Mã KH',
      unlinked_kh: 'Chưa gắn Mã KH'
    }
    chips.push({
      key: 'quick',
      label: qMap[quickFilter.value] || quickFilter.value,
      clear: () => {
        quickFilter.value = 'all'
      }
    })
  }

  if (filterCustomer.value !== 'all') {
    const cName = String(filterCustomer.value)
    chips.push({
      key: 'cust',
      label: `KH: ${cName.length > 22 ? cName.slice(0, 21) + '…' : cName}`,
      clear: () => {
        filterCustomer.value = 'all'
      }
    })
  }

  if (filterNhaSanXuat.value !== 'all') {
    chips.push({
      key: 'nsx',
      label: `Hãng: ${filterNhaSanXuat.value}`,
      clear: () => {
        filterNhaSanXuat.value = 'all'
      }
    })
  }

  if (filterMode.value !== 'all') {
    const mMap = {
      day: `Ngày ${filterDate.value}`,
      week: `Tuần ${filterWeek.value}`,
      month: `Tháng ${filterMonth.value}`,
      year: `Năm ${filterYear.value}`
    }
    chips.push({
      key: 'mode',
      label: `Mốc: ${mMap[filterMode.value] || filterMode.value}`,
      clear: () => {
        filterMode.value = 'all'
      }
    })
  }

  return chips
})

// Danh sách toàn bộ Card không chia nhóm (chế độ Dạng Tất Cả), ưu tiên:
// 1. Quá hạn / Quá hiệu lực chưa xử lý -> 2. Còn hạn sắp hết hạn gần nhất -> 3. Không ngày -> 4. Đã xử lý
const flatSortedCards = computed(() => {
  const targetTs = targetCalcDate.value.getTime()
  const rows = [...filteredData.value]
  const pinnedSnapshot = sessionPinnedMap.value

  const getSortMeta = (item) => {
    const pinnedEntry = pinnedSnapshot[getCardScopeKey(item)]
    const effectiveStatus = pinnedEntry ? pinnedEntry.initialStatus : getHandlingStatus(item)
    const handled = Boolean(effectiveStatus)
    const expDate = parseDateForCalc(item.EXPIRATION_TIME)
    const graceDate = parseDateForCalc(item.SO_NGAY_HIEU_LUC)
    const diffExp = expDate ? Math.ceil((expDate.getTime() - targetTs) / (1000 * 3600 * 24)) : null
    const diffGrace = graceDate ? Math.ceil((graceDate.getTime() - targetTs) / (1000 * 3600 * 24)) : null

    if (handled) {
      return {
        tier: 3,
        primarySort: expDate ? -expDate.getTime() : 0
      }
    }
    if ((diffExp !== null && diffExp < 0) || (diffGrace !== null && diffGrace < 0)) {
      return {
        tier: 0,
        primarySort: diffExp !== null ? diffExp : (diffGrace ?? 0)
      }
    }
    if (diffExp !== null) {
      return {
        tier: 1,
        primarySort: diffExp
      }
    }
    return {
      tier: 2,
      primarySort: diffGrace !== null ? diffGrace : Number.MAX_SAFE_INTEGER
    }
  }

  return rows.sort((a, b) => {
    const ma = getSortMeta(a)
    const mb = getSortMeta(b)
    if (ma.tier !== mb.tier) return ma.tier - mb.tier
    return ma.primarySort - mb.primarySort
  })
})

// Tự động giải phóng danh sách ghim tạm khi người dùng chuyển bộ lọc, đổi chế độ xem hoặc chọn công ty khác
watch(
  [
    filterMode,
    filterDate,
    filterWeek,
    filterMonth,
    filterYear,
    filterExpirationStatus,
    filterExpirationMonths,
    filterExpirationValue,
    filterExpirationUnit,
    filterGraceStatus,
    filterGraceMonths,
    filterGraceValue,
    filterGraceUnit,
    filterNhaSanXuat,
    filterCustomer,
    quickFilter,
    viewMode,
    selectedMasterCustomer
  ],
  () => {
    clearSessionPinnedCards()
  }
)

const mobileNavRows = computed(() => {
  return viewMode.value === 'all' ? flatSortedCards.value : filteredData.value
})

const activeMobileLicRow = computed(() => {
  const rows = mobileNavRows.value
  if (!rows.length) return null
  if (selectedMobileLicKey.value) {
    const found = rows.find(r => getCardKey(r) === selectedMobileLicKey.value)
    if (found) return found
  }
  return rows[0]
})

const activeMobileLicIndex = computed(() => {
  const active = activeMobileLicRow.value
  if (!active) return -1
  const key = getCardKey(active)
  return mobileNavRows.value.findIndex(r => getCardKey(r) === key)
})

const activeMobileLicGroup = computed(() => {
  const r = activeMobileLicRow.value
  if (!r) return null
  const custName = getDisplayCompanyForItem(r)
  const matchedGroup = allCustomerGroups.value.find(g => g.customer === custName)
  if (matchedGroup) {
    return {
      ...matchedGroup,
      items: [r]
    }
  }
  return {
    customer: custName,
    maKhachHang: r.MA_KHACH_HANG || '',
    vendorCustomer: r.CUSTOMER || '',
    dbCompanyName: r.TEN_CONG_TY || '',
    hasDbCompany: Boolean(r.MA_KHACH_HANG || r.TEN_CONG_TY),
    items: [r],
    conHan: 0,
    quaHan: 0,
    conHieuLuc: 0,
    quaHieuLuc: 0,
    linkedPo: (r.PO_FIREBASE_KEY || r.SO_PO) ? 1 : 0,
    linkedKh: (r.MA_KHACH_HANG || r.TEN_CONG_TY) ? 1 : 0,
    fileCount: r.LINK_FILE ? 1 : 0,
    daXuLy: isItemHandled(r) ? 1 : 0,
    daGiaHan: getHandlingStatus(r) === 'Đã gia hạn' ? 1 : 0,
    khongGiaHan: getHandlingStatus(r) === 'Không gia hạn' ? 1 : 0,
    daXuLyExp: 0,
    daXuLyGrace: 0,
    nsxList: r.NHA_SAN_XUAT ? [r.NHA_SAN_XUAT] : [],
    linkedPoPct: (r.PO_FIREBASE_KEY || r.SO_PO) ? 100 : 0
  }
})

const selectMobileLicDetail = (row) => {
  if (!row) return
  selectedMobileLicKey.value = getCardKey(row)
  selectedMasterCustomer.value = getDisplayCompanyForItem(row)
  if (isMobileShell.value) {
    showMobileFilterSheet.value = false
    showDisplaySettingPopover.value = false
    mobileActiveTab.value = 'company_detail'
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

const prevMobileLic = () => {
  const rows = mobileNavRows.value
  if (rows.length <= 1) return
  const idx = activeMobileLicIndex.value
  const prevIdx = idx > 0 ? idx - 1 : rows.length - 1
  selectMobileLicDetail(rows[prevIdx])
}

const nextMobileLic = () => {
  const rows = mobileNavRows.value
  if (rows.length <= 1) return
  const idx = activeMobileLicIndex.value
  const nextIdx = idx >= 0 && idx < rows.length - 1 ? idx + 1 : 0
  selectMobileLicDetail(rows[nextIdx])
}

const getMobileDockLicLabel = (row) => {
  if (!row) return 'Chưa có Lic'
  const licId = String(row.LICENSE_ID || '').trim()
  if (!licId) return 'Chi tiết Lic'
  return licId.length > 13 ? licId.slice(0, 12).trim() + '…' : licId
}

const isAnyLicenseModalOpen = computed(() => {
  return Boolean(
    selectedCard.value ||
    showImportModal.value ||
    showPdfModal.value ||
    showVendorPickerModal.value ||
    showAIChat.value ||
    asyncModal.value.show ||
    showMobileFilterSheet.value ||
    (isMobileShell.value && showDisplaySettingPopover.value)
  )
})

const displayLimit = ref(10)
const flatDisplayLimit = ref(24)
const isScrolled = ref(false)

const renderedMainGroups = computed(() => {
  if (isMobileShell.value && mobileActiveTab.value === 'company_detail') {
    return activeMobileLicGroup.value ? [activeMobileLicGroup.value] : []
  }
  if (viewMode.value === 'all') {
    if (!flatSortedCards.value.length) return []
    return [
      {
        customer: '__ALL_FLAT__',
        isFlatAllGroup: true,
        items: flatSortedCards.value.slice(0, flatDisplayLimit.value)
      }
    ]
  }
  if (isMobileShell.value) {
    return allCustomerGroups.value.slice(0, displayLimit.value)
  }
  if (layoutViewMode.value === 'master-detail') {
    return activeMasterGroup.value ? [activeMasterGroup.value] : []
  }
  return allCustomerGroups.value.slice(0, displayLimit.value)
})

watch([searchQuery, quickFilter, filterExpirationStatus, filterExpirationValue, filterGraceStatus, filterGraceValue], () => {
  displayLimit.value = 10
  flatDisplayLimit.value = 24
})

const handleScroll = (e) => {
  const target = e.target === document ? window : e.target;
  const scrollTop = target.scrollY ?? target.scrollTop ?? window.scrollY ?? 0;
  const clientHeight = target.innerHeight ?? target.clientHeight ?? window.innerHeight ?? 0;
  const scrollHeight = target.document?.body?.offsetHeight ?? target.scrollHeight ?? document.body.offsetHeight ?? 0;

  isScrolled.value = scrollTop > 300;

  if ((clientHeight + scrollTop) >= scrollHeight - 500) {
    if (viewMode.value === 'all') {
      if (flatSortedCards.value.length > flatDisplayLimit.value) {
        flatDisplayLimit.value += 24;
      }
    } else if (isMobileShell.value || layoutViewMode.value === 'stacked-groups') {
      if (allCustomerGroups.value.length > displayLimit.value) {
        displayLimit.value += 10;
      }
    }
  }
}

const areAllVisibleGroupsCollapsed = computed(() => {
  if (!renderedMainGroups.value.length) return false
  return renderedMainGroups.value.every(g => !!collapsedGroups.value[g.customer])
})

const toggleCollapseAllGroups = () => {
  const targetState = !areAllVisibleGroupsCollapsed.value
  const next = { ...collapsedGroups.value }
  renderedMainGroups.value.forEach(g => {
    next[g.customer] = targetState
  })
  collapsedGroups.value = next
}

// === AI CHAT LOGIC ===
const showAIChat = ref(false)
const chatHistory = ref([
  { role: 'assistant', content: 'Chào bạn! Mình là Trợ lý AI. Mình đã đọc toàn bộ dữ liệu bảng License của bạn. Bạn muốn hỏi gì nào? (Ví dụ: "Có bao nhiêu khách hàng mua Kaspersky?")' }
])
const chatInput = ref('')
const aiTyping = ref(false)
const chatBody = ref(null)

const renderMarkdown = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight
    }
  }, 100)
}

const sendChat = async () => {
  if (!chatInput.value.trim() || aiTyping.value) return;
  const userText = chatInput.value.trim();
  chatInput.value = '';

  chatHistory.value.push({ role: 'user', content: userText });
  aiTyping.value = true;
  scrollToBottom();

  const compressedData = filteredData.value.slice(0, 150).map(i => ({
    C: i.CUSTOMER,
    P: i.PRODUCT_NAME,
    E: i.EXPIRATION_TIME,
    N: i.NHA_SAN_XUAT,
    G: i.IS_GIA_HAN || i.is_gia_han
  }));

  const recentHistory = chatHistory.value.slice(-6);

  const systemMessage = {
    role: 'system',
    content: `Bạn là Trợ lý AI của công ty. Nhiệm vụ của bạn là phân tích và trả lời các câu hỏi về cơ sở dữ liệu phần mềm nội bộ (License).
Dữ liệu nội bộ tóm tắt (C=Khách hàng, P=Sản phẩm, E=Ngày hết hạn, N=NSX, G=Trạng thái gia hạn):
${JSON.stringify(compressedData)}

Hãy trả lời câu hỏi mới nhất của người dùng một cách chính xác dựa trên dữ liệu. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn và tự nhiên. KHÔNG sử dụng Markdown dạng \`\`\`, chỉ dùng in đậm (**) nếu cần.`
  };

  const messagesToSend = [
    systemMessage,
    ...recentHistory.map(m => ({ role: m.role, content: m.content }))
  ];

  try {
    const result = await callDeepSeek(messagesToSend, false, false);
    let aiText = '';

    if (result.choices && result.choices.length > 0) {
      aiText = result.choices[0]?.message?.content || result.choices[0]?.text || '';
    } else if (result.output && Array.isArray(result.output)) {
      const messageObj = result.output.find(item => item.type === 'message');
      if (messageObj && messageObj.content && Array.isArray(messageObj.content)) {
        const textObj = messageObj.content.find(c => c.type === 'output_text');
        aiText = textObj ? textObj.text : '';
      } else {
        const errObj = result.output.find(item => item.type === 'error');
        if (errObj) throw new Error(errObj.message || JSON.stringify(errObj));
        aiText = JSON.stringify(result.output);
      }
    } else if (result.output && typeof result.output === 'object' && result.output.text) {
      aiText = result.output.text;
    } else if (result.error) {
      throw new Error(result.error.message || JSON.stringify(result.error));
    } else {
      aiText = typeof result === 'string' ? result : JSON.stringify(result);
    }

    if (!aiText || aiText === '[]' || aiText === '{}') {
      aiText = "Xin lỗi, dữ liệu trả về từ AI không đúng định dạng. Chi tiết: " + JSON.stringify(result).substring(0, 200);
    }

    chatHistory.value.push({ role: 'assistant', content: aiText });
  } catch (err) {
    chatHistory.value.push({ role: 'assistant', content: 'Xin lỗi, có lỗi kết nối với máy chủ AI. Chi tiết: ' + err.message });
  } finally {
    aiTyping.value = false;
    scrollToBottom();
  }
}

watch(showAIChat, (val) => {
  if (val) scrollToBottom()
})

onMounted(() => {
  updateMobileShellViewport();
  fetchData();
  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', updateMobileShellViewport, { passive: true });
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true);
  window.removeEventListener('resize', updateMobileShellViewport);
})
</script>

<style scoped>
/* ============================================================================
   DESIGN TOKENS & SALEREPORTFIREBASE PARITY ARCHITECTURE
   ============================================================================ */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.sr-page.license-page,
.sr-page.license-page *,
.lic-modal-overlay,
.lic-modal-overlay * {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.sr-page.license-page {
  --bg-page: #070d19;
  --bg-surface-1: #0c1425;
  --bg-surface-2: #121d33;
  --bg-surface-3: #182642;
  --bg-border-subtle: rgba(148, 163, 184, 0.14);
  --bg-border-strong: rgba(56, 189, 248, 0.38);
  --bg-text-primary: #f8fafc;
  --bg-text-secondary: #cbd5e1;
  --bg-text-muted: #94a3b8;
  --bg-accent: #10b981;
  --bg-accent-strong: #059669;

  min-height: 100vh;
  padding: 20px 26px 96px;
  background:
    radial-gradient(1100px 460px at 12% -5%, rgba(16, 185, 129, 0.12), transparent 60%),
    radial-gradient(900px 420px at 90% 0%, rgba(14, 165, 233, 0.1), transparent 55%),
    linear-gradient(180deg, #060b14 0%, #09111f 48%, #070d19 100%);
  color: var(--bg-text-primary);
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  box-sizing: border-box;
}

/* ─── 1. MINIMAL PAGE IDENTITY HEADER (.bg-topbar chuẩn SaleReportFirebase) ─── */
.bg-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.bg-topbar-left {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.bg-brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border: 1px solid rgba(110, 231, 183, 0.45);
  color: #ffffff;
  box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.45);
  flex-shrink: 0;
}

.bg-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.bg-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.bg-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f8fafc;
  line-height: 1.2;
}

.bg-count-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(52, 211, 153, 0.36);
  color: #6ee7b7;
}

.bg-subtitle {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: #94a3b8;
}

/* ─── 2. TOP SUMMARY DASHBOARD — 4 SUPER BENTO CARDS (.sr-super-bento-grid) PHƯƠNG ÁN 1: DUAL-STAT & SEGMENTED HEALTH ─── */
.sr-super-bento-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.sr-sb-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 11px;
  padding: 15px 16px 13px 20px;
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(13, 27, 36, 0.96) 0%, rgba(8, 17, 24, 0.99) 100%);
  border: 1px solid rgba(52, 211, 153, 0.24);
  box-shadow: 0 10px 26px -8px rgba(0, 0, 0, 0.52);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  overflow: hidden;
}

/* Viền phát sáng dọc bên trái 4px (Left Vertical Glow Bar) đặc trưng riêng cho trang License */
.sr-sb-card::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  height: auto;
  right: auto;
  background: linear-gradient(180deg, #10b981 0%, #34d399 100%);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
}

.sr-sb-card.sb-card-revenue::before {
  background: linear-gradient(180deg, #38bdf8 0%, #10b981 100%);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
}

.sr-sb-card.has-alert::before {
  background: linear-gradient(180deg, #10b981 0%, #f59e0b 50%, #ef4444 100%);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.45);
}

.sr-sb-card.sb-card-debt::before {
  background: linear-gradient(180deg, #10b981 0%, #0ea5e9 100%);
  box-shadow: 0 0 12px rgba(14, 165, 233, 0.45);
}

.sr-sb-card:hover {
  transform: translateY(-2px);
  border-color: rgba(52, 211, 153, 0.5);
  box-shadow: 0 14px 30px -8px rgba(5, 150, 105, 0.25);
}

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
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(52, 211, 153, 0.32);
  color: #34d399;
}

.sr-sb-icon.is-blue {
  background: rgba(14, 165, 233, 0.16);
  border-color: rgba(56, 189, 248, 0.36);
  color: #38bdf8;
}

.sr-sb-icon.is-red {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(248, 113, 113, 0.36);
  color: #f87171;
}

.sr-sb-title {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.sr-sb-quick-acts {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.sr-sb-act-pill {
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.25);
  color: #6ee7b7;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sr-sb-act-pill:hover,
.sr-sb-act-pill.is-active-filter {
  background: #059669;
  border-color: #34d399;
  color: #ffffff;
}

.sr-sb-hero-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.sr-sb-unit {
  font-size: 10.5px;
  font-weight: 800;
  opacity: 0.78;
  margin-left: 3px;
  letter-spacing: 0.04em;
}

.money-white { color: #ffffff; }
.money-green { color: #34d399; }
.money-blue  { color: #38bdf8; }
.money-red   { color: #f87171; }

/* Card 1: Bố cục Hero + 2 Pill ngang bên phải */
.lic-kpi-hero-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(56, 189, 248, 0.2);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.lic-kpi-hero-split:hover {
  border-color: rgba(56, 189, 248, 0.45);
  background: rgba(15, 23, 42, 0.85);
}

.lic-kpi-hero-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.lic-kpi-hero-sub {
  font-size: 10.5px;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lic-kpi-mini-stack {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  padding-left: 10px;
  border-left: 1px dashed rgba(148, 163, 184, 0.24);
}

.lic-kpi-mini-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 3px 7px;
  border-radius: 6px;
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.lic-kpi-mini-lbl {
  font-size: 10.5px;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}

.lic-kpi-mini-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 800;
  color: #7dd3fc;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.lic-kpi-mini-val small {
  font-size: 9.5px;
  font-weight: 600;
  opacity: 0.8;
}

/* Card 2, 3, 4: Bố cục 2 Ô Thông số Đối xứng (Dual-Stat Split Grid) */
.lic-kpi-dual-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.lic-kpi-stat-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 3px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.2);
  cursor: pointer;
  transition: all 0.16s ease;
  min-width: 0;
}

.lic-kpi-stat-box.is-emerald {
  background: linear-gradient(145deg, rgba(6, 78, 59, 0.32) 0%, rgba(15, 23, 42, 0.72) 100%);
  border-color: rgba(52, 211, 153, 0.28);
}

.lic-kpi-stat-box.is-emerald:hover,
.lic-kpi-stat-box.is-emerald.is-selected {
  border-color: #34d399;
  background: linear-gradient(145deg, rgba(6, 95, 70, 0.5) 0%, rgba(15, 23, 42, 0.88) 100%);
  box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.35);
}

.lic-kpi-stat-box.is-rose {
  background: linear-gradient(145deg, rgba(127, 29, 29, 0.34) 0%, rgba(15, 23, 42, 0.75) 100%);
  border-color: rgba(248, 113, 113, 0.34);
}

.lic-kpi-stat-box.is-rose:hover,
.lic-kpi-stat-box.is-rose.is-selected {
  border-color: #f87171;
  background: linear-gradient(145deg, rgba(153, 27, 27, 0.5) 0%, rgba(15, 23, 42, 0.9) 100%);
  box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.38);
}

.lic-kpi-stat-box.is-sky {
  background: linear-gradient(145deg, rgba(12, 74, 110, 0.34) 0%, rgba(15, 23, 42, 0.75) 100%);
  border-color: rgba(56, 189, 248, 0.3);
}

.lic-kpi-stat-box.is-sky:hover,
.lic-kpi-stat-box.is-sky.is-selected {
  border-color: #38bdf8;
  background: linear-gradient(145deg, rgba(3, 105, 161, 0.48) 0%, rgba(15, 23, 42, 0.9) 100%);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.35);
}

.lic-kpi-stat-box.is-neutral:hover,
.lic-kpi-stat-box.is-neutral.is-selected {
  border-color: rgba(52, 211, 153, 0.45);
}

.lic-kpi-stat-top {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.lic-kpi-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
  background: #34d399;
}

.lic-kpi-dot.is-emerald {
  background: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.7);
}

.lic-kpi-dot.is-rose {
  background: #f87171;
  box-shadow: 0 0 6px rgba(248, 113, 113, 0.75);
}

.lic-kpi-dot.is-sky {
  background: #38bdf8;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.7);
}

.lic-kpi-stat-tag {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lic-kpi-stat-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.lic-kpi-stat-sub {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lic-kpi-sub-action {
  margin-top: 1px;
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  font-size: 10px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.14s ease;
}

.lic-kpi-sub-action strong {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  color: #f8fafc;
}

.lic-kpi-sub-action.is-warn {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(251, 191, 36, 0.38);
  color: #fde68a;
}

.lic-kpi-sub-action.is-warn strong {
  color: #fbbf24;
}

.lic-kpi-sub-action:hover {
  border-color: #38bdf8;
  background: rgba(14, 165, 233, 0.22);
  color: #ffffff;
}

/* Footer: Thanh Sức Khỏe Phân Đoạn 2 Màu (Segmented Health Bar) */
.lic-kpi-health-foot {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 8px;
  border-top: 1px solid rgba(52, 211, 153, 0.15);
  margin-top: auto;
}

.lic-kpi-health-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 11px;
}

.lic-kpi-health-lbl {
  color: #94a3b8;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lic-kpi-health-pct {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: #6ee7b7;
}

.lic-kpi-health-pct.is-blue { color: #7dd3fc; }
.lic-kpi-health-pct.is-emerald { color: #34d399; }
.lic-kpi-health-pct.is-amber { color: #fbbf24; }
.lic-kpi-health-pct.is-rose { color: #fca5a5; }

.lic-kpi-seg-track {
  display: flex;
  align-items: stretch;
  gap: 3px;
  height: 6px;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.85);
  padding: 1px;
  overflow: hidden;
}

.lic-kpi-seg-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.35s ease;
}

.lic-kpi-seg-fill.is-good {
  background: linear-gradient(90deg, #059669 0%, #34d399 100%);
}

.lic-kpi-seg-fill.is-bad {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}

.lic-kpi-seg-fill.is-warn {
  background: linear-gradient(90deg, #d97706 0%, #fbbf24 100%);
}

.lic-kpi-seg-fill.is-sky {
  background: linear-gradient(90deg, #0284c7 0%, #38bdf8 100%);
}

/* ─── 3. BỐ CỤC 2 CỘT TỈ LỆ 3 : 7 (MASTER-DETAIL SIDEBAR & MAIN AREA) ─── */
.sr-workspace-layout.is-master-detail {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 7fr);
  gap: 18px;
  align-items: start;
}

.sr-md-sidebar {
  position: sticky;
  top: 14px;
  height: calc(100vh - 28px);
  max-height: calc(100vh - 28px);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  background: rgba(11, 20, 28, 0.96);
  border: 1px solid rgba(52, 211, 153, 0.26);
  box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.5);
  overflow: visible;
  z-index: 25;
}

.sr-md-sidebar.is-stacked-filter-bar {
  position: relative;
  top: 0;
  height: auto;
  max-height: none;
  margin-bottom: 16px;
}

.sr-md-sidebar-head {
  flex: 0 0 auto;
  flex-shrink: 0;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 30;
  padding: 12px 13px 10px;
  border-radius: 13px 13px 0 0;
  border-bottom: 1px solid rgba(52, 211, 153, 0.36);
  background: linear-gradient(135deg, rgba(6, 95, 70, 0.88) 0%, rgba(15, 118, 110, 0.72) 55%, rgba(15, 23, 42, 0.96) 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sr-md-sidebar.is-stacked-filter-bar .sr-md-sidebar-head {
  border-radius: 13px;
  border-bottom: none;
}

.sr-md-sh-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-width: 0;
  width: 100%;
}

.sr-md-sh-title-group {
  display: flex;
  align-items: baseline;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
}

.sr-md-sh-title {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sr-md-sh-plain-count {
  font-size: 11px;
  font-weight: 600;
  color: #a7f3d0;
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.sr-md-sh-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.sr-sb-head-btn {
  height: 25px;
  padding: 0 7px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(15, 23, 42, 0.55);
  color: #f8fafc;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.sr-sb-head-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.32);
  border-color: #34d399;
}

.sr-sb-head-btn.is-filter-toggle.active {
  background: rgba(16, 185, 129, 0.28);
  border-color: #34d399;
  color: #ffffff;
}

.sr-sb-head-btn.is-reset {
  background: rgba(239, 68, 68, 0.24);
  border-color: rgba(248, 113, 113, 0.5);
  color: #fecaca;
}

.sr-sb-filter-count {
  padding: 0 5px;
  border-radius: 999px;
  background: #10b981;
  color: #022c22;
  font-size: 10px;
  font-weight: 800;
}

/* Search Shell inside Sidebar */
.bg-search-shell.sr-sidebar-search-shell {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 35px;
  width: 100%;
  min-width: 0;
  height: 35px;
  min-height: 35px;
  padding: 0 10px;
  box-sizing: border-box;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(52, 211, 153, 0.38);
}

.bg-search-icon {
  color: #6ee7b7;
  flex-shrink: 0;
}

.bg-search-shell.sr-sidebar-search-shell input {
  flex: 1;
  min-width: 0;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fafc;
  font-size: 12px;
  font-family: inherit;
}

.bg-search-shell.sr-sidebar-search-shell input::placeholder {
  color: #94a3b8;
}

.bg-search-clear {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: none;
  background: rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.bg-search-clear:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}

/* Collapsible Filter Panel inside Sidebar */
.sr-sidebar-filter-panel {
  flex: 0 0 auto;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 8px 9px;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.sr-sb-time-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.sr-sb-time-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  width: 100%;
  min-width: 0;
}

.bg-seg-group.sr-sb-seg-group.is-full-width-5 {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 2px;
  padding: 2px;
  border-radius: 7px;
  background: rgba(9, 14, 24, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-sizing: border-box;
}

.sr-sb-seg-group .bg-seg-btn {
  height: 24px;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 700;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.sr-sb-seg-group .bg-seg-btn:hover {
  color: #f8fafc;
}

.sr-sb-seg-group .bg-seg-btn.active {
  background: #10b981;
  color: #022c22;
  font-weight: 800;
}

.sr-sb-time-range-row.is-single-capsule {
  display: flex;
  width: 100%;
}

.bg-date-capsule.sr-sb-date-capsule {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 28px;
  padding: 2px 8px;
  gap: 6px;
  border-radius: 7px;
  background: rgba(9, 14, 24, 0.85);
  border: 1px solid rgba(52, 211, 153, 0.3);
  box-sizing: border-box;
}

.sr-date-cap-lbl {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}

.sr-sb-date-capsule input {
  flex: 1;
  min-width: 0;
  height: 22px;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fafc;
  font-size: 11.5px;
  font-family: 'JetBrains Mono', monospace;
  color-scheme: dark;
}

.bg-period-step-btn {
  width: 24px;
  height: 22px;
  border-radius: 5px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(30, 41, 59, 0.8);
  color: #f8fafc;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bg-period-step-btn:hover {
  background: #10b981;
  color: #022c22;
}

.sr-sidebar-pickers-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  width: 100%;
  min-width: 0;
}

.sr-sidebar-pickers-grid .pl-picker-wrap {
  width: 100%;
  min-width: 0;
}

.sr-sidebar-pickers-grid .pl-picker-wrap.is-full-span {
  grid-column: 1 / -1;
}

.pl-picker-trigger {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: 29px;
  padding: 0 7px;
  border-radius: 7px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(9, 14, 24, 0.85);
  color: #e2e8f0;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
}

.pl-picker-trigger.has-value {
  border-color: rgba(52, 211, 153, 0.55);
  background: rgba(6, 78, 59, 0.35);
}

.pl-picker-tag {
  font-size: 10.5px;
  font-weight: 800;
  color: #6ee7b7;
  white-space: nowrap;
  flex-shrink: 0;
}

.pl-picker-native-select {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fafc;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.pl-picker-native-select option {
  background: #0f172a;
  color: #f8fafc;
}

.pl-picker-native-select:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Company List inside Sidebar */
.sr-md-company-list {
  flex: 1 1 0%;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.sr-md-company-list::-webkit-scrollbar {
  width: 5px;
}

.sr-md-company-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.28);
  border-radius: 999px;
}

.sr-md-empty-sidebar {
  padding: 28px 14px;
  text-align: center;
  font-size: 12.5px;
  color: #94a3b8;
}

.sr-md-company-card {
  flex: 0 0 auto;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  position: relative;
  padding: 11px 13px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.18);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sr-md-company-card:hover {
  background: rgba(30, 41, 59, 0.82);
  border-color: rgba(52, 211, 153, 0.38);
}

.sr-md-company-card.active {
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.52) 0%, rgba(15, 23, 42, 0.88) 100%);
  border-color: #10b981;
  box-shadow: inset 3px 0 0 #10b981;
}

.sr-md-cc-header-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  width: 100%;
}

.sr-md-cc-idx {
  min-width: 22px;
  height: 20px;
  padding: 0 5px;
  border-radius: 5px;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #6ee7b7;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.sr-md-cc-title-block {
  flex: 1;
  min-width: 0;
}

.sr-md-cc-name {
  font-size: 13px;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.sr-md-cc-metrics-4col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px 10px;
  padding-top: 7px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  width: 100%;
  min-width: 0;
}

.sr-md-ccm-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
}

.sr-md-ccm-lbl {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

.sr-md-ccm-val {
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.is-com-text { color: #34d399 !important; }
.is-debt-text { color: #f87171 !important; }

/* ─── 4. CỘT PHẢI (70%): TOP TOOLBAR + COMPANY FOLDER HEADER + CARD PO-1 / TABLE ─── */
.sr-md-main-area {
  min-width: 0;
}

.sr-company-top-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.sr-ctt-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sr-ctt-mode-switcher {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border-radius: 9px;
  background: rgba(11, 20, 28, 0.94);
  border: 1px solid rgba(52, 211, 153, 0.28);
}

.sr-ctt-mode-btn {
  height: 26px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.sr-ctt-mode-btn:hover {
  color: #f8fafc;
  background: rgba(16, 185, 129, 0.12);
}

.sr-ctt-mode-btn.active {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: rgba(110, 231, 183, 0.5);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.32);
}

.sr-ctt-mode-btn.is-price-danger.active {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  border-color: #fca5a5;
  color: #ffffff;
}

.sr-ctt-mode-count {
  padding: 0 5px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.45);
  font-size: 10.5px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}

.sr-ctt-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sr-hdr-action-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.sr-hdr-action-btn.is-add {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 1px solid #34d399;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.28);
}

.sr-hdr-action-btn.is-add:hover {
  filter: brightness(1.08);
}

.sr-hdr-action-btn.is-export {
  background: rgba(14, 165, 233, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #7dd3fc;
}

.sr-hdr-action-btn.is-export:hover {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

.sr-display-setting-wrap {
  position: relative;
  display: inline-flex;
}

.sr-hdr-action-btn.is-setting {
  background: #1e293b;
  border: 1px solid #334155;
  color: #e2e8f0;
}

.sr-hdr-action-btn.is-setting:hover,
.sr-hdr-action-btn.is-setting.active {
  border-color: #10b981;
  color: #34d399;
}

.sr-display-setting-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 316px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65);
  padding: 12px;
  z-index: 150;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sr-ds-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #1e293b;
}

.sr-ds-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #f8fafc;
}

.sr-ds-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0 4px;
}

.sr-ds-section {
  padding-bottom: 10px;
  border-bottom: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sr-ds-section.is-last {
  padding-bottom: 0;
  border-bottom: none;
}

.sr-ds-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sr-ds-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.sr-ds-opt-btn {
  height: 30px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #090d16;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.sr-ds-opt-btn:hover {
  border-color: rgba(52, 211, 153, 0.5);
  color: #f8fafc;
}

.sr-ds-opt-btn.active {
  background: #1e293b;
  border-color: #10b981;
  color: #34d399;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.18);
}

.sr-ds-stack-btns {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sr-ds-toggle-row {
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #090d16;
  color: #cbd5e1;
  font-size: 11.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sr-ds-toggle-row strong {
  color: #34d399;
  font-size: 11px;
  font-weight: 800;
}

.sr-ds-toggle-row:hover {
  border-color: #10b981;
}

/* ─── 5. HEADER CÔNG TY DẠNG HÌNH FILE / BÌA HỒ SƠ (.sr-company-folder-header) ─── */
.sr-report-group {
  margin-bottom: 20px;
}

.sr-report-group.is-group-collapsed {
  margin-bottom: 10px;
}

.sr-company-folder-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.sr-folder-top-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.sr-folder-ear-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 100%;
  padding: 10px 28px 9px 16px;
  border-radius: 12px 16px 0 0;
  background: linear-gradient(135deg, #059669 0%, #0d9488 58%, #0f766e 100%);
  border: 1px solid rgba(52, 211, 153, 0.55);
  border-bottom: none;
  color: #ffffff;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%);
  box-shadow: 0 -2px 12px rgba(16, 185, 129, 0.18);
}

.sr-folder-icon {
  color: #a7f3d0;
  flex-shrink: 0;
}

.sr-cpb-name {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.sr-folder-sep {
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
}

.sr-folder-pocount {
  font-size: 12.5px;
  font-weight: 800;
  color: #fde047;
  font-variant-numeric: tabular-nums;
}

.sr-folder-expired-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: rgba(239, 68, 68, 0.28);
  border: 1px solid rgba(252, 165, 165, 0.55);
  color: #fecaca;
}

.sr-customer-kpi-sheet.sr-folder-body-sheet {
  padding: 12px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 20, 28, 0.98) 100%);
  border: 1px solid rgba(52, 211, 153, 0.38);
  border-top: 3px solid #10b981;
  border-radius: 0 12px 12px 12px;
  box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.48);
}

.sr-empty-folder-sheet {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  color: #94a3b8;
  font-size: 13px;
}

.sr-super-bento-grid.is-customer-bento {
  margin-bottom: 0;
  gap: 10px;
}

.sr-super-bento-grid.is-customer-bento .sr-sb-card {
  padding: 12px 13px 11px 17px;
  gap: 8px;
}

.sr-super-bento-grid.is-customer-bento .sr-sb-hero-val {
  font-size: 19px;
}

.sr-super-bento-grid.is-customer-bento .lic-kpi-stat-num {
  font-size: 16.5px;
}

.sr-super-bento-grid.is-customer-bento .lic-kpi-stat-box {
  padding: 6px 8px;
}

.sr-super-bento-grid.is-customer-bento .lic-kpi-hero-split {
  padding: 6px 8px;
  gap: 8px;
}

.sr-plain-text-btn {
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(15, 23, 42, 0.65);
  border-radius: 6px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  color: #f8fafc;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.sr-plain-text-btn:hover {
  background: rgba(16, 185, 129, 0.32);
  border-color: #34d399;
  color: #ffffff;
}

/* ─── 6. THIẾT KẾ CARD PO-1 (.sr-record-card.sr-po1-card) CHUẨN SALEREPORTFIREBASE ─── */
.sr-card-list.is-cols-1 {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 14px !important;
  margin-bottom: 18px !important;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sr-card-list.is-cols-2 {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 14px !important;
  margin-bottom: 18px !important;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sr-card-outer-item {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sr-record-card.sr-po1-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: rgba(11, 20, 28, 0.96) !important;
  border: 2px solid rgba(56, 189, 248, 0.62) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 22px -8px rgba(0, 0, 0, 0.48) !important;
  transition: border-color 0.16s ease, box-shadow 0.16s ease !important;
  overflow: hidden;
}

.sr-record-card.sr-po1-card:hover {
  border-color: #38bdf8 !important;
  box-shadow: 0 12px 26px -8px rgba(0, 0, 0, 0.58) !important;
}

.sr-po1-header {
  padding: 12px 18px;
  border-bottom: 1.5px solid rgba(56, 189, 248, 0.48);
  background: linear-gradient(90deg, rgba(14, 116, 144, 0.42) 0%, rgba(15, 118, 110, 0.32) 52%, rgba(30, 41, 59, 0.94) 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sr-record-card.sr-po1-card.is-collapsed-card .sr-po1-header {
  border-bottom: none;
}

.sr-po1-hbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.sr-po1-meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.lic-card-stt-pill {
  padding: 1px 7px;
  border-radius: 5px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
}

.sr-po1-po-num {
  font-size: 14.5px;
  font-weight: 800;
  color: #38bdf8;
  font-family: 'JetBrains Mono', monospace;
}

.sr-po1-sep {
  color: rgba(148, 163, 184, 0.65);
  user-select: none;
}

.sr-po1-plain-meta {
  font-size: 12.5px;
  font-weight: 500;
  color: #e2e8f0;
}

.sr-po1-plain-meta strong {
  font-weight: 700;
  color: #ffffff;
}

.sr-po1-meta-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: #e2e8f0;
}

.sr-po1-plain-status {
  font-weight: 700;
  color: #f8fafc;
}

.sr-po-pay-extend-btn {
  height: 26px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.45);
  background: rgba(14, 165, 233, 0.18);
  color: #7dd3fc;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sr-po-pay-extend-btn:hover {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

.sr-po-collapse-arrow-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  background: rgba(15, 23, 42, 0.6);
  color: #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;
}

.sr-po-collapse-arrow-btn:hover {
  border-color: #38bdf8;
  color: #ffffff;
}

.sr-po-collapse-arrow-btn.is-collapsed svg {
  transform: rotate(180deg);
}

.sr-po1-contract-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 7px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.sr-po1-contract-prefix {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin-right: 6px;
}

.sr-po1-contract-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.4;
  flex: 1;
  min-width: 200px;
}

.sr-po1-collapsed-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: #cbd5e1;
}

.sr-po1-collapsed-summary strong {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #f8fafc;
}

.sr-po1-contract-files {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding-top: 7px;
  border-top: 1px dashed rgba(148, 163, 184, 0.22);
}

.sr-po1-file-entry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 9px;
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.62);
  border: 1px solid rgba(148, 163, 184, 0.24);
  max-width: 100%;
}

.lic-inline-file-svg {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.sr-po1-fe-name {
  font-size: 12px;
  font-weight: 500;
  color: #cbd5e1;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sr-po1-fe-name strong {
  color: #f8fafc;
  font-weight: 700;
}

.sr-po1-fe-actions {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.sr-po1-fe-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 23px;
  padding: 0 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  text-decoration: none;
}

.sr-po1-fe-btn.is-view {
  background: rgba(56, 189, 248, 0.16);
  border-color: rgba(56, 189, 248, 0.38);
  color: #7dd3fc;
}

.sr-po1-fe-btn.is-view:hover {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

/* 3 Khối Chỉ Số Xếp Dọc Bên Cột Phải (.sr-po1-4blocks.is-3blocks) */
.sr-po1-4blocks,
.sr-po1-4blocks.is-3blocks,
.sr-card-list.is-cols-2 .sr-po1-4blocks,
.sr-card-list.is-cols-2 .sr-po1-4blocks.is-3blocks {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  max-width: 100%;
  background: transparent;
}

.sr-po1-block {
  padding: 12px 16px;
  border-right: none;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.sr-po1-block:last-child {
  border-right: none;
  border-bottom: none;
}

.sr-po1-block-title {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ffffff !important;
  padding: 6px 10px;
  margin-bottom: 4px;
  border-radius: 7px;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.14);
}

.sr-po1-block-title.is-blue-head {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;
  color: #ffffff !important;
}

.sr-po1-block-title.is-green-head {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
  color: #ffffff !important;
}

.sr-po1-block-title.is-red-head {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
  color: #ffffff !important;
}

.sr-po1-b-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-height: 21px;
}

.sr-po1-b-row.is-primary .sr-po1-b-lbl {
  color: #cbd5e1;
  font-weight: 600;
}

.sr-po1-b-row.is-primary .sr-po1-b-val {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.sr-po1-b-row.is-sub-divider {
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px dashed rgba(148, 163, 184, 0.16);
}

.sr-po1-b-lbl {
  font-size: 12.5px;
  font-weight: 400;
  color: #94a3b8;
  line-height: 1.35;
}

.sr-po1-b-val {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sr-po1-note-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 9px 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  font-size: 12.5px;
  color: #cbd5e1;
  background: rgba(15, 23, 42, 0.3);
}

.sr-po1-files-label {
  font-weight: 600;
  color: #94a3b8;
}

/* Cụm nút xác nhận Gia hạn bên trong Khối 4 */
.lic-po1-action-box {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed rgba(148, 163, 184, 0.16);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-gia-han {
  flex: 1;
  min-width: 105px;
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #ffffff;
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn-gia-han.is-compact {
  flex: 0 1 auto;
  min-width: 0;
  height: 27px;
  padding: 0 9px;
  font-size: 11px;
}

.btn-gia-han.da-gia-han {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: rgba(52, 211, 153, 0.5);
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.25);
}

.btn-gia-han.da-gia-han:hover:not(:disabled) {
  filter: brightness(1.08);
}

.btn-gia-han.chua-gia-han {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  border-color: rgba(251, 191, 36, 0.45);
  box-shadow: 0 3px 10px rgba(217, 119, 6, 0.25);
}

.btn-gia-han.chua-gia-han:hover:not(:disabled) {
  filter: brightness(1.08);
}

.lic-po1-resolved-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 6px;
}

.lic-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 27px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  color: #ffffff;
}

.lic-status-pill.is-renewed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.lic-status-pill.is-declined {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.lic-status-pill.is-pending {
  background: #334155;
}

.lic-undo-btn {
  height: 25px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.65);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lic-undo-btn:hover {
  border-color: #38bdf8;
  color: #ffffff;
}

/* ─── 7. CHẾ ĐỘ DẠNG BẢNG (.lic-table-container) ─── */
.lic-table-container {
  margin-bottom: 18px;
}

.lic-table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  border: 1.5px solid rgba(52, 211, 153, 0.32);
  background: rgba(11, 20, 28, 0.96);
  box-shadow: 0 10px 26px -8px rgba(0, 0, 0, 0.5);
}

.lic-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.lic-table thead th {
  background: linear-gradient(90deg, rgba(6, 78, 59, 0.85) 0%, rgba(15, 23, 42, 0.96) 100%);
  color: #a7f3d0;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 11px 10px;
  text-align: left;
  border-bottom: 1.5px solid rgba(52, 211, 153, 0.35);
  white-space: nowrap;
}

.lic-table-item-row {
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  cursor: pointer;
  transition: background 0.14s ease;
}

.lic-table-item-row:hover {
  background: rgba(16, 185, 129, 0.08);
}

.lic-table td {
  padding: 10px;
  vertical-align: middle;
  color: #e2e8f0;
}

.lic-table td.center {
  text-align: center;
}

.lic-td-stt {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: #94a3b8;
}

.lic-tbl-file-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.lic-tbl-no-file {
  color: #64748b;
}

.lic-td-id {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  color: #38bdf8;
}

.lic-td-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.lic-td-prod {
  font-weight: 700;
  color: #f8fafc;
}

.lic-td-desc {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 700;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
}

.lic-remain-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.lic-remain-pill.badge-success {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.35);
}

.lic-remain-pill.badge-warning {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.lic-remain-pill.badge-danger {
  background: rgba(239, 68, 68, 0.18);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.4);
}

.lic-tbl-gia-han-pair,
.lic-tbl-resolved-pair {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.lic-load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(52, 211, 153, 0.35);
  background: rgba(15, 23, 42, 0.85);
  color: #6ee7b7;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lic-load-more-btn:hover {
  background: #059669;
  color: #ffffff;
}

.lic-state-box {
  padding: 48px 20px;
  text-align: center;
  border-radius: 14px;
  background: rgba(11, 20, 28, 0.9);
  border: 1px solid rgba(52, 211, 153, 0.25);
  color: #94a3b8;
}

.lic-state-text {
  margin-top: 10px;
  font-size: 13.5px;
  font-weight: 600;
}

/* ─── 8. MODAL CHỈNH SỬA LICENSE (.lic-modal-overlay — FULLSCREEN 100% & 50:50 SPLIT) ─── */
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

.lic-modal-2col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
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

@media (max-width: 680px) {
  .lic-form-row.is-product-split,
  .lic-form-row.is-three-cols {
    grid-template-columns: minmax(0, 1fr);
  }
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
  transition: all 0.15s ease;
}

.lic-inline-picker-btn:hover {
  filter: brightness(1.08);
}

.lic-grace-preview {
  font-size: 11px;
  color: #34d399;
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
  transition: all 0.15s ease;
}

.lic-open-file-btn:hover {
  background: #0369a1;
}

.lic-modal-bar-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
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

.lic-scan-replace-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #34d399;
  color: #ffffff;
}

.lic-scan-replace-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.lic-scan-replace-btn.is-empty-cta {
  margin-top: 8px;
  height: 34px;
  padding: 0 14px;
  font-size: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #34d399;
  color: #ffffff;
  box-shadow: 0 6px 16px -4px rgba(16, 185, 129, 0.45);
}

.lic-modal-overlay.theme-light-blue .lic-scan-replace-btn {
  background: #ecfdf5;
  border-color: #34d399;
  color: #047857;
}

.lic-modal-overlay.theme-light-blue .lic-scan-replace-btn:hover:not(:disabled),
.lic-modal-overlay.theme-light-blue .lic-scan-replace-btn.is-empty-cta {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #38bdf8;
  color: #ffffff;
}

.lic-modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  background: #080f18;
}

.lic-foot-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lic-foot-btn.is-danger {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(248, 113, 113, 0.45);
  color: #fca5a5;
}

.lic-foot-btn.is-danger:hover {
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

/* ─── 9. LIGHT BLUE THEME PARITY (.sr-page.theme-light-blue) CHUẨN SALEREPORTFIREBASE ─── */
.sr-page.theme-light-blue {
  background:
    radial-gradient(1100px 460px at 12% -5%, rgba(2, 132, 199, 0.14), transparent 60%),
    radial-gradient(900px 420px at 90% 0%, rgba(37, 99, 235, 0.1), transparent 55%),
    linear-gradient(180deg, #eaf4ff 0%, #f4f8fd 48%, #edf2f9 100%) !important;
  color: #0f172a !important;
}

.sr-page.theme-light-blue .bg-brand-icon {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 6px 18px -4px rgba(2, 132, 199, 0.4);
}

.sr-page.theme-light-blue .bg-title {
  color: #0f172a;
}

.sr-page.theme-light-blue .bg-subtitle {
  color: #475569;
}

.sr-page.theme-light-blue .bg-count-pill {
  background: #e0f2fe;
  color: #0369a1;
  border-color: #7dd3fc;
}

/* Super Bento Cards in Light Mode — Phương án 1: Dual-Stat & Segmented Health */
.sr-page.theme-light-blue .sr-sb-card {
  background: #ffffff;
  border: 1px solid #bae6fd;
  box-shadow: 0 8px 22px -8px rgba(2, 132, 199, 0.14);
}

.sr-page.theme-light-blue .sr-sb-card::before {
  background: linear-gradient(180deg, #0284c7 0%, #10b981 100%);
  box-shadow: none;
}

.sr-page.theme-light-blue .sr-sb-card.has-alert::before {
  background: linear-gradient(180deg, #059669 0%, #f59e0b 50%, #dc2626 100%);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-debt::before {
  background: linear-gradient(180deg, #059669 0%, #0284c7 100%);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #0284c7;
  box-shadow: 0 10px 26px -8px rgba(37, 99, 235, 0.38);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue::before {
  background: rgba(255, 255, 255, 0.65);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .sr-sb-title {
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .sr-sb-icon {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .sr-sb-act-pill {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.32);
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .sr-sb-act-pill:hover {
  background: #ffffff;
  color: #0284c7;
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-hero-split {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.28);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-hero-split:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.5);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-hero-sub {
  color: #e0f2fe;
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-mini-stack {
  border-left-color: rgba(255, 255, 255, 0.3);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-mini-pill {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.25);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-mini-lbl {
  color: #e0f2fe;
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-mini-val {
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-health-foot {
  border-top-color: rgba(255, 255, 255, 0.22);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-health-lbl {
  color: #e0f2fe;
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-health-pct {
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-seg-track {
  background: rgba(255, 255, 255, 0.22);
}

.sr-page.theme-light-blue .sr-sb-card.sb-card-revenue .lic-kpi-seg-fill.is-sky {
  background: #ffffff;
}

.sr-page.theme-light-blue .sr-sb-title {
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-sb-icon.is-emerald {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #059669;
}

.sr-page.theme-light-blue .sr-sb-icon.is-blue {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0284c7;
}

.sr-page.theme-light-blue .sr-sb-icon.is-red {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.sr-page.theme-light-blue .sr-sb-act-pill {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0284c7;
}

.sr-page.theme-light-blue .sr-sb-act-pill:hover,
.sr-page.theme-light-blue .sr-sb-act-pill.is-active-filter {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.sr-page.theme-light-blue .money-white { color: #ffffff !important; }
.sr-page.theme-light-blue .money-green { color: #059669 !important; }
.sr-page.theme-light-blue .money-blue  { color: #0284c7 !important; }
.sr-page.theme-light-blue .money-red   { color: #dc2626 !important; }

.sr-page.theme-light-blue .lic-kpi-stat-box {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.sr-page.theme-light-blue .lic-kpi-stat-box.is-emerald {
  background: linear-gradient(145deg, #ecfdf5 0%, #f8fafc 100%);
  border-color: #a7f3d0;
}

.sr-page.theme-light-blue .lic-kpi-stat-box.is-emerald:hover,
.sr-page.theme-light-blue .lic-kpi-stat-box.is-emerald.is-selected {
  border-color: #059669;
  background: #ecfdf5;
  box-shadow: 0 0 0 1px rgba(5, 150, 105, 0.25);
}

.sr-page.theme-light-blue .lic-kpi-stat-box.is-rose {
  background: linear-gradient(145deg, #fef2f2 0%, #fff1f2 100%);
  border-color: #fecaca;
}

.sr-page.theme-light-blue .lic-kpi-stat-box.is-rose:hover,
.sr-page.theme-light-blue .lic-kpi-stat-box.is-rose.is-selected {
  border-color: #dc2626;
  background: #fef2f2;
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.25);
}

.sr-page.theme-light-blue .lic-kpi-stat-box.is-sky {
  background: linear-gradient(145deg, #f0f9ff 0%, #f8fafc 100%);
  border-color: #bae6fd;
}

.sr-page.theme-light-blue .lic-kpi-stat-box.is-sky:hover,
.sr-page.theme-light-blue .lic-kpi-stat-box.is-sky.is-selected {
  border-color: #0284c7;
  background: #e0f2fe;
  box-shadow: 0 0 0 1px rgba(2, 132, 199, 0.25);
}

.sr-page.theme-light-blue .lic-kpi-stat-tag {
  color: #334155;
}

.sr-page.theme-light-blue .lic-kpi-stat-sub {
  color: #64748b;
}

.sr-page.theme-light-blue .lic-kpi-sub-action {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}

.sr-page.theme-light-blue .lic-kpi-sub-action strong {
  color: #0f172a;
}

.sr-page.theme-light-blue .lic-kpi-sub-action.is-warn {
  background: #fffbeb;
  border-color: #fcd34d;
  color: #92400e;
}

.sr-page.theme-light-blue .lic-kpi-sub-action.is-warn strong {
  color: #b45309;
}

.sr-page.theme-light-blue .lic-kpi-sub-action:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.sr-page.theme-light-blue .lic-kpi-sub-action:hover strong {
  color: #ffffff;
}

.sr-page.theme-light-blue .lic-kpi-health-foot {
  border-top-color: #e2e8f0;
}

.sr-page.theme-light-blue .lic-kpi-health-lbl {
  color: #64748b;
}

.sr-page.theme-light-blue .lic-kpi-health-pct.is-blue { color: #0284c7; }
.sr-page.theme-light-blue .lic-kpi-health-pct.is-emerald { color: #059669; }
.sr-page.theme-light-blue .lic-kpi-health-pct.is-amber { color: #d97706; }
.sr-page.theme-light-blue .lic-kpi-health-pct.is-rose { color: #dc2626; }

.sr-page.theme-light-blue .lic-kpi-seg-track {
  background: #e2e8f0;
}

/* Sidebar in Light Mode */
.sr-page.theme-light-blue .sr-md-sidebar {
  background: #ffffff;
  border-color: #93c5fd;
  box-shadow: 0 10px 28px -8px rgba(2, 132, 199, 0.12);
}

.sr-page.theme-light-blue .sr-md-sidebar-head {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 60%, #1d4ed8 100%);
  border-bottom-color: #7dd3fc;
}

.sr-page.theme-light-blue .sr-md-sh-plain-count {
  color: #e0f2fe;
}

.sr-page.theme-light-blue .sr-sb-head-btn {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-sb-head-btn:hover:not(:disabled),
.sr-page.theme-light-blue .sr-sb-head-btn.is-filter-toggle.active {
  background: #ffffff;
  border-color: #ffffff;
  color: #0284c7;
}

.sr-page.theme-light-blue .sr-sidebar-search-shell {
  background: #ffffff !important;
  border-color: #bae6fd !important;
}

.sr-page.theme-light-blue .bg-search-icon {
  color: #0284c7;
}

.sr-page.theme-light-blue .sr-sidebar-search-shell input {
  color: #0f172a !important;
}

.sr-page.theme-light-blue .sr-sidebar-filter-panel {
  background: #f8fafc;
  border-color: #bae6fd;
}

.sr-page.theme-light-blue .bg-seg-group.sr-sb-seg-group.is-full-width-5,
.sr-page.theme-light-blue .bg-date-capsule.sr-sb-date-capsule,
.sr-page.theme-light-blue .pl-picker-trigger {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-sb-seg-group .bg-seg-btn.active {
  background: #0284c7;
  color: #ffffff;
}

.sr-page.theme-light-blue .pl-picker-tag {
  color: #0284c7;
}

.sr-page.theme-light-blue .pl-picker-native-select {
  color: #0f172a;
}

.sr-page.theme-light-blue .pl-picker-native-select option {
  background: #ffffff;
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-md-company-card {
  background: #ffffff;
  border-color: #e2e8f0;
}

.sr-page.theme-light-blue .sr-md-company-card:hover {
  background: #f8fafc;
  border-color: #93c5fd;
}

.sr-page.theme-light-blue .sr-md-company-card.active {
  background: linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%);
  border-color: #0284c7;
  box-shadow: inset 3px 0 0 #0284c7, 0 4px 12px -4px rgba(2, 132, 199, 0.16);
}

.sr-page.theme-light-blue .sr-md-cc-idx {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

.sr-page.theme-light-blue .sr-md-cc-name {
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-md-cc-metrics-4col {
  border-top-color: #e2e8f0;
}

.sr-page.theme-light-blue .sr-md-ccm-lbl {
  color: #64748b;
}

.sr-page.theme-light-blue .sr-md-ccm-val {
  color: #0f172a;
}

/* Main Area Toolbar & Folder Header in Light Mode */
.sr-page.theme-light-blue .sr-ctt-mode-switcher {
  background: #ffffff;
  border-color: #bae6fd;
}

.sr-page.theme-light-blue .sr-ctt-mode-btn {
  color: #475569;
}

.sr-page.theme-light-blue .sr-ctt-mode-btn.active {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #0284c7;
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-hdr-action-btn.is-export {
  background: #ffffff;
  border-color: #7dd3fc;
  color: #0284c7;
}

.sr-page.theme-light-blue .sr-hdr-action-btn.is-export:hover {
  background: #0284c7;
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-hdr-action-btn.is-setting {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #1e293b;
}

.sr-page.theme-light-blue .sr-display-setting-dropdown {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
}

.sr-page.theme-light-blue .sr-ds-head,
.sr-page.theme-light-blue .sr-ds-section {
  border-bottom-color: #e2e8f0;
}

.sr-page.theme-light-blue .sr-ds-title {
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-ds-opt-btn {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #64748b;
}

.sr-page.theme-light-blue .sr-ds-opt-btn.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1d4ed8;
}

.sr-page.theme-light-blue .sr-ds-toggle-row {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.sr-page.theme-light-blue .sr-ds-toggle-row strong {
  color: #2563eb;
}

.sr-page.theme-light-blue .sr-folder-ear-tab {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 60%, #1d4ed8 100%);
  border-color: #38bdf8;
}

.sr-page.theme-light-blue .sr-customer-kpi-sheet.sr-folder-body-sheet {
  background: #f8fafc;
  border-color: #93c5fd;
  border-top: 3px solid #0284c7;
  box-shadow: 0 8px 20px -6px rgba(2, 132, 199, 0.14);
}

.sr-page.theme-light-blue .sr-record-card.sr-po1-card {
  background: #ffffff !important;
  border: 2px solid #0284c7 !important;
  box-shadow: 0 8px 22px -6px rgba(2, 132, 199, 0.22) !important;
}

.sr-page.theme-light-blue .sr-po1-header {
  background: linear-gradient(90deg, #dbeafe 0%, #e0f2fe 55%, #f0f9ff 100%);
  border-bottom: 1.5px solid #38bdf8;
}

.sr-page.theme-light-blue .lic-card-stt-pill {
  background: #ffffff;
  border-color: #7dd3fc;
  color: #0369a1;
}

.sr-page.theme-light-blue .sr-po1-po-num {
  color: #0369a1;
}

.sr-page.theme-light-blue .sr-po1-plain-meta {
  color: #334155;
}

.sr-page.theme-light-blue .sr-po1-plain-meta strong {
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-po-pay-extend-btn {
  background: #ffffff;
  border-color: #38bdf8;
  color: #0284c7;
}

.sr-page.theme-light-blue .sr-po-pay-extend-btn:hover {
  background: #0284c7;
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-po-collapse-arrow-btn {
  background: #ffffff;
  border-color: #93c5fd;
  color: #0369a1;
}

.sr-page.theme-light-blue .sr-po1-contract-row {
  border-top-color: #bae6fd;
}

.sr-page.theme-light-blue .sr-po1-contract-prefix {
  color: #475569;
}

.sr-page.theme-light-blue .sr-po1-contract-title {
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-po1-collapsed-summary {
  color: #475569;
}

.sr-page.theme-light-blue .sr-po1-collapsed-summary strong {
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-po1-contract-files {
  border-top-color: #93c5fd;
}

.sr-page.theme-light-blue .sr-po1-file-entry {
  background: #ffffff;
  border-color: #bae6fd;
}

.sr-page.theme-light-blue .sr-po1-fe-name {
  color: #475569;
}

.sr-page.theme-light-blue .sr-po1-fe-name strong {
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-po1-fe-btn.is-view {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

.sr-page.theme-light-blue .sr-po1-4blocks {
  background: #ffffff;
}

.sr-page.theme-light-blue .sr-po1-block {
  border-right-color: #cbd5e1;
  border-bottom-color: #cbd5e1;
}

.sr-page.theme-light-blue .sr-po1-b-row.is-primary .sr-po1-b-lbl,
.sr-page.theme-light-blue .sr-po1-b-row.is-primary .sr-po1-b-val {
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-po1-b-lbl {
  color: #475569;
}

.sr-page.theme-light-blue .sr-po1-b-val {
  color: #0f172a;
}

.sr-page.theme-light-blue .is-com-text,
.sr-page.theme-light-blue .sr-po1-b-val.is-com-text {
  color: #059669 !important;
}

.sr-page.theme-light-blue .is-debt-text,
.sr-page.theme-light-blue .sr-po1-b-val.is-debt-text {
  color: #dc2626 !important;
}

.sr-page.theme-light-blue .sr-po1-note-line {
  background: #f8fafc;
  border-top-color: #e2e8f0;
  color: #334155;
}

.sr-page.theme-light-blue .lic-undo-btn {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.sr-page.theme-light-blue .lic-table-wrap {
  background: #ffffff;
  border-color: #93c5fd;
  box-shadow: 0 8px 22px -6px rgba(2, 132, 199, 0.14);
}

.sr-page.theme-light-blue .lic-table thead th {
  background: linear-gradient(90deg, #0284c7 0%, #2563eb 100%);
  color: #ffffff;
  border-bottom-color: #38bdf8;
}

.sr-page.theme-light-blue .lic-table-item-row {
  border-bottom-color: #e2e8f0;
}

.sr-page.theme-light-blue .lic-table-item-row:hover {
  background: #f0f9ff;
}

.sr-page.theme-light-blue .lic-table td {
  color: #1e293b;
}

.sr-page.theme-light-blue .lic-td-id {
  color: #0284c7;
}

.sr-page.theme-light-blue .lic-td-prod {
  color: #0f172a;
}

.sr-page.theme-light-blue .lic-tbl-file-link {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Light Mode Modal */
.lic-modal-overlay.theme-light-blue .lic-modal-card {
  background: #f8fafc;
  border-color: #93c5fd;
  color: #0f172a;
}

.lic-modal-overlay.theme-light-blue .lic-modal-head {
  background: linear-gradient(90deg, #0284c7 0%, #2563eb 55%, #1d4ed8 100%);
  border-bottom-color: #7dd3fc;
}

.lic-modal-overlay.theme-light-blue .lic-modal-group {
  background: #ffffff;
  border-color: #cbd5e1;
}

.lic-modal-overlay.theme-light-blue .lic-modal-banner {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 3px 10px -2px rgba(2, 132, 199, 0.24);
}

.lic-modal-overlay.theme-light-blue .lic-modal-banner.is-teal-head {
  background: linear-gradient(90deg, #0284c7 0%, #0d9488 100%);
  border-color: #38bdf8;
}

.lic-modal-overlay.theme-light-blue .lic-modal-banner.is-blue-head {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-color: #38bdf8;
}

.lic-modal-overlay.theme-light-blue .lic-modal-banner.is-green-head {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #34d399;
}

.lic-modal-overlay.theme-light-blue .lic-form-field label {
  color: #475569;
}

.lic-modal-overlay.theme-light-blue .lic-input {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-modal-overlay.theme-light-blue .lic-modal-foot {
  background: #f1f5f9;
  border-top-color: #cbd5e1;
}

/* ─── 10. AI CHAT FAB & PANEL + SPINNER + RESPONSIVE ─── */
.spinner-small {
  width: 16px;
  height: 16px;
  border: 2.2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: lic-spin 0.7s linear infinite;
  display: inline-block;
}

.spin {
  animation: lic-spin 0.8s linear infinite;
}

@keyframes lic-spin {
  to { transform: rotate(360deg); }
}

.ai-chat-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.45);
  cursor: pointer;
  z-index: 990;
  transition: transform 0.2s ease, bottom 0.2s ease;
}

.ai-chat-fab:hover {
  transform: scale(1.06);
}

.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.65);
  backdrop-filter: blur(4px);
  z-index: 2500;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 20px;
}

.chat-panel {
  width: min(420px, 100%);
  height: min(600px, 85vh);
  background: #0f172a;
  border: 1px solid rgba(52, 211, 153, 0.4);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(90deg, #059669 0%, #0d9488 100%);
}

.btn-close-chat {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
}

.chat-body {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-message-wrapper {
  display: flex;
}

.chat-message-wrapper.user {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 82%;
  padding: 10px 13px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.45;
  background: #1e293b;
  color: #f8fafc;
}

.chat-message-wrapper.user .chat-bubble {
  background: #059669;
  color: #ffffff;
}

.chat-footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #1e293b;
  background: #090d16;
}

.chat-input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #f8fafc;
  outline: none;
}

.btn-send-chat {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: none;
  background: #10b981;
  color: #022c22;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* ─── KHÁCH HÀNG & PO SYNC BADGES ─── */
.lic-kh-code-pill {
  display: inline-block;
  padding: 1px 6px;
  margin-right: 6px;
  border-radius: 5px;
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(52, 211, 153, 0.38);
  color: #6ee7b7;
  font-size: 11px;
  font-weight: 800;
  vertical-align: middle;
}

.lic-vendor-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-folder-kh-badge {
  display: inline-block;
  padding: 2px 7px;
  margin-right: 6px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(52, 211, 153, 0.42);
  color: #34d399;
  font-size: 11.5px;
  font-weight: 800;
}

.lic-header-kh-pill,
.lic-header-po-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.lic-header-kh-pill {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #6ee7b7;
}

.lic-header-po-pill {
  background: rgba(56, 189, 248, 0.16);
  border: 1px solid rgba(56, 189, 248, 0.42);
  color: #7dd3fc;
}

.lic-po-sync-box {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px dashed rgba(52, 211, 153, 0.35);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lic-label-with-act {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lic-auto-match-btn {
  padding: 2px 8px;
  border-radius: 5px;
  border: 1px solid rgba(52, 211, 153, 0.45);
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.lic-auto-match-btn:hover {
  background: #059669;
  color: #ffffff;
}

.sr-page.theme-light-blue .lic-kh-code-pill,
.sr-page.theme-light-blue .lic-folder-kh-badge,
.sr-page.theme-light-blue .lic-header-kh-pill {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #047857;
}

.sr-page.theme-light-blue .lic-header-po-pill {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

.sr-page.theme-light-blue .lic-po-sync-box {
  background: #f0fdf4;
  border-color: #86efac;
}

.sr-page.theme-light-blue .lic-auto-match-btn {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #047857;
}

.sr-page.theme-light-blue .lic-vendor-sub {
  color: #64748b;
}

/* ============================================================================
   SPLIT 2-COLUMN WORKSPACE: CỘT TRÁI PREVIEW • CỘT PHẢI 3 KHỐI XẾP DỌC
   ============================================================================ */
.lic-card-split-body {
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: stretch;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
}

.lic-card-preview-pane {
  display: flex;
  flex-direction: column;
  background: rgba(6, 12, 24, 0.55);
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  min-width: 0;
}

.lic-card-preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 11px;
  background: rgba(15, 23, 42, 0.72);
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
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
  height: 24px;
  padding: 0 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.22);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.lic-preview-tab-btn:hover {
  color: #f8fafc;
  border-color: rgba(52, 211, 153, 0.45);
}

.lic-preview-tab-btn.is-active {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(52, 211, 153, 0.6);
  color: #6ee7b7;
}

.lic-preview-tab-btn.is-sky.is-active {
  background: rgba(14, 165, 233, 0.22);
  border-color: rgba(56, 189, 248, 0.65);
  color: #7dd3fc;
}

.lic-preview-tab-btn.is-amber.is-active {
  background: rgba(245, 158, 11, 0.22);
  border-color: rgba(251, 191, 36, 0.65);
  color: #fcd34d;
}

.lic-preview-tab-btn.is-violet.is-active {
  background: rgba(139, 92, 246, 0.22);
  border-color: rgba(167, 139, 250, 0.65);
  color: #c4b5fd;
}

.lic-preview-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
}

.lic-preview-dot.is-ready {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.7);
}

.lic-card-preview-actions {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.lic-preview-mini-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 23px;
  padding: 0 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #e2e8f0;
  background: rgba(51, 65, 85, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.28);
  text-decoration: none;
  transition: all 0.15s ease;
}

.lic-preview-mini-btn:hover {
  background: #0ea5e9;
  border-color: #38bdf8;
  color: #ffffff;
}

.lic-card-preview-stage {
  position: relative;
  flex: 1;
  min-height: 360px;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  background: #050a14;
}

.lic-preview-img-wrap {
  width: 100%;
  height: 100%;
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-sizing: border-box;
}

.lic-preview-img {
  max-width: 100%;
  max-height: 440px;
  object-fit: contain;
  border-radius: 6px;
}

.lic-preview-iframe {
  width: 100%;
  height: 100%;
  min-height: 360px;
  border: 0;
  background: #ffffff;
}

.lic-preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px 14px;
  text-align: center;
  color: #94a3b8;
}

.lic-preview-empty-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #cbd5e1;
}

.lic-preview-empty-sub {
  font-size: 11.5px;
  color: #64748b;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-preview-open-pill {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 11px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(52, 211, 153, 0.45);
  color: #6ee7b7;
  font-size: 11.5px;
  font-weight: 700;
  text-decoration: none;
}

.lic-card-metrics-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  justify-content: space-between;
}

/* Modal Split 50% - 50% Fullscreen */
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

.lic-modal-preview-stage {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050a14;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  overflow: hidden;
}

.lic-modal-preview-stage .lic-preview-iframe {
  width: 100%;
  height: 100%;
  min-height: 360px;
}

.lic-modal-preview-stage .lic-preview-img-wrap {
  max-height: none;
  height: 100%;
}

.lic-modal-preview-stage .lic-preview-img {
  max-height: 100%;
}

.lic-modal-preview-link-box {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.55);
  flex-shrink: 0;
}

.lic-modal-specs-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

/* Light theme cho Split 2 cột */
.sr-page.theme-light-blue .lic-card-split-body {
  border-top-color: #cbd5e1;
}

.sr-page.theme-light-blue .lic-card-preview-pane {
  background: #f1f5f9;
  border-right-color: #cbd5e1;
}

.sr-page.theme-light-blue .lic-card-preview-bar {
  background: #e2e8f0;
  border-bottom-color: #cbd5e1;
}

.sr-page.theme-light-blue .lic-preview-tab-btn {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}

.sr-page.theme-light-blue .lic-preview-tab-btn.is-active {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.sr-page.theme-light-blue .lic-preview-tab-btn.is-sky.is-active {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #075985;
}

.sr-page.theme-light-blue .lic-preview-mini-btn {
  background: #ffffff;
  border-color: #94a3b8;
  color: #0f172a;
}

.sr-page.theme-light-blue .lic-card-preview-stage,
.lic-modal-overlay.theme-light-blue .lic-modal-preview-stage {
  background: #f8fafc;
}

.sr-page.theme-light-blue .lic-preview-empty-title,
.lic-modal-overlay.theme-light-blue .lic-preview-empty-title {
  color: #334155;
}

.lic-modal-overlay.theme-light-blue .lic-modal-preview-col {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.lic-modal-overlay.theme-light-blue .lic-modal-preview-link-box {
  background: #f1f5f9;
  border-top-color: #cbd5e1;
}

/* 2 Option chuyển chế độ hiển thị Tên Công Ty (DB) / Tên trên License dưới ô Search */
.lic-company-name-mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  padding: 3px;
  margin-top: 7px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.lic-cnm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 27px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.lic-cnm-btn:hover {
  color: #e2e8f0;
  background: rgba(148, 163, 184, 0.1);
}

.lic-cnm-btn.active {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(52, 211, 153, 0.45);
  color: #6ee7b7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.lic-unlinked-db-pill {
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  margin-right: 5px;
  border-radius: 4px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fcd34d;
  vertical-align: middle;
}

.lic-folder-unlinked-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 800;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fcd34d;
  flex-shrink: 0;
}

.lic-vendor-sub.is-db-sub {
  color: #6ee7b7;
  font-weight: 600;
}

.sr-page.theme-light-blue .lic-company-name-mode-switch {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.sr-page.theme-light-blue .lic-cnm-btn {
  color: #64748b;
}

.sr-page.theme-light-blue .lic-cnm-btn:hover {
  color: #0f172a;
  background: #e2e8f0;
}

.sr-page.theme-light-blue .lic-cnm-btn.active {
  background: #ffffff;
  border-color: #10b981;
  color: #047857;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.sr-page.theme-light-blue .lic-unlinked-db-pill,
.sr-page.theme-light-blue .lic-folder-unlinked-badge {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #b45309;
}

.sr-page.theme-light-blue .lic-vendor-sub.is-db-sub {
  color: #047857;
}

/* Responsive Breakpoints chuẩn SaleReportFirebase */
@media (max-width: 1180px) {
  .lic-card-split-body,
  .lic-modal-split-workspace {
    grid-template-columns: 1fr;
  }
  .lic-modal-body,
  .lic-modal-split-workspace,
  .lic-modal-specs-col {
    height: auto;
    overflow: visible;
  }
  .lic-modal-body {
    overflow-y: auto;
  }
  .lic-card-preview-pane {
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }
  .lic-modal-preview-col {
    position: static;
    height: 420px;
  }
  .sr-super-bento-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sr-workspace-layout.is-master-detail {
    grid-template-columns: minmax(0, 1fr);
  }
  .sr-md-sidebar {
    position: static !important;
    top: auto !important;
    height: auto !important;
    max-height: none !important;
  }
  .sr-md-company-list {
    max-height: 320px !important;
  }
  .sr-card-list.is-cols-2 {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .sr-page.license-page {
    padding: 14px 12px 96px;
  }
  .sr-super-bento-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .sr-po1-4blocks,
  .sr-po1-4blocks.is-3blocks,
  .sr-card-list.is-cols-2 .sr-po1-4blocks,
  .sr-card-list.is-cols-2 .sr-po1-4blocks.is-3blocks,
  .sr-workspace-layout.is-master-detail .sr-po1-4blocks,
  .sr-workspace-layout.is-master-detail .sr-po1-4blocks.is-3blocks {
    grid-template-columns: minmax(0, 1fr);
  }
  .sr-po1-block {
    border-right: none !important;
    border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  }
  .sr-po1-block:last-child {
    border-bottom: none;
  }
  .lic-modal-2col,
  .lic-form-row {
    grid-template-columns: 1fr;
  }
}

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

/* ─── TRẠNG THÁI ĐÃ XỬ LÝ (PHƯƠNG ÁN 2: ĐÃ GIA HẠN / KHÔNG GIA HẠN + HOÀN TÁC) ─── */
.lic-kpi-sub-action.is-handled {
  background: rgba(14, 165, 233, 0.14);
  border-color: rgba(56, 189, 248, 0.35);
  color: #bae6fd;
}

.lic-kpi-sub-action.is-handled strong {
  color: #38bdf8;
}

.lic-kpi-sub-action.is-handled:hover,
.lic-kpi-sub-action.is-handled.is-active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

.lic-kpi-sub-action.is-handled:hover strong,
.lic-kpi-sub-action.is-handled.is-active strong {
  color: #ffffff;
}

.sr-ctt-mode-btn.is-price-handled.active {
  background: rgba(14, 165, 233, 0.22);
  border-color: #38bdf8;
  color: #7dd3fc;
}

.sr-po1-plain-status.is-handled-text {
  color: #94a3b8 !important;
  text-decoration: line-through;
  opacity: 0.85;
}

.lic-handle-btn-group,
.lic-handled-cluster {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.lic-handle-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #cbd5e1;
}

.lic-handle-act-btn {
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.lic-handle-act-btn.is-renewed {
  background: rgba(16, 185, 129, 0.16);
  border-color: rgba(52, 211, 153, 0.42);
  color: #6ee7b7;
}

.lic-handle-act-btn.is-renewed:hover:not(:disabled) {
  background: #059669;
  border-color: #34d399;
  color: #ffffff;
}

.lic-handle-act-btn.is-stopped {
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(251, 191, 36, 0.42);
  color: #fcd34d;
}

.lic-handle-act-btn.is-stopped:hover:not(:disabled) {
  background: #d97706;
  border-color: #fbbf24;
  color: #ffffff;
}

.lic-handle-act-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.lic-handled-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  border: 1px solid transparent;
  white-space: nowrap;
}

.lic-handled-badge.is-renewed {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(52, 211, 153, 0.48);
  color: #6ee7b7;
}

.lic-handled-badge.is-stopped {
  background: rgba(148, 163, 184, 0.2);
  border-color: rgba(148, 163, 184, 0.45);
  color: #e2e8f0;
}

.lic-handled-undo-btn {
  height: 22px;
  padding: 0 7px;
  border-radius: 5px;
  background: rgba(30, 41, 59, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.lic-handled-undo-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.22);
  border-color: #f87171;
  color: #fecaca;
}

/* Table View compact buttons */
.lic-tbl-remain-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.lic-tbl-handled-row,
.lic-tbl-handle-btns {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.lic-handled-badge.is-mini {
  height: 19px;
  padding: 0 6px;
  font-size: 10px;
}

.lic-handled-undo-btn.is-mini,
.lic-handle-act-btn.is-mini {
  height: 19px;
  padding: 0 6px;
  font-size: 10px;
  border-radius: 4px;
}

/* Viền nhận diện trực quan khi Card vừa đổi trạng thái xử lý nhưng giữ nguyên vị trí (Phương án 1) */
.sr-record-card.sr-po1-card.is-just-renewed {
  border-color: rgba(52, 211, 153, 0.65) !important;
  box-shadow:
    0 10px 26px -8px rgba(16, 185, 129, 0.25),
    0 0 0 1px rgba(52, 211, 153, 0.25) !important;
}

.sr-record-card.sr-po1-card.is-just-stopped {
  border-color: rgba(251, 191, 36, 0.65) !important;
  box-shadow:
    0 10px 26px -8px rgba(245, 158, 11, 0.22),
    0 0 0 1px rgba(251, 191, 36, 0.24) !important;
}

/* Modal 3-Card Handling Status Selector (Nổi bật, rõ trạng thái) */
.lic-modal-handle-seg {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 0;
  background: transparent;
  border: none;
}

.lic-mhs-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  gap: 7px;
  min-height: 66px;
  padding: 9px 10px;
  border-radius: 11px;
  border: 1.5px solid rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.72);
  color: #cbd5e1;
  cursor: pointer;
  text-align: left;
  min-width: 0;
  box-sizing: border-box;
  transition: all 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.lic-mhs-btn:hover {
  border-color: rgba(148, 163, 184, 0.52);
  background: rgba(30, 41, 59, 0.88);
  transform: translateY(-1px);
}

.lic-mhs-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
}

.lic-mhs-ico {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.lic-mhs-btn.is-unhandled .lic-mhs-ico {
  background: rgba(14, 165, 233, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.36);
  color: #38bdf8;
}

.lic-mhs-btn.is-renewed .lic-mhs-ico {
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(52, 211, 153, 0.36);
  color: #34d399;
}

.lic-mhs-btn.is-stopped .lic-mhs-ico {
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(251, 191, 36, 0.38);
  color: #fbbf24;
}

.lic-mhs-dot {
  width: 15px;
  height: 15px;
  border-radius: 999px;
  border: 2px solid rgba(148, 163, 184, 0.45);
  background: transparent;
  flex-shrink: 0;
  position: relative;
  box-sizing: border-box;
  transition: all 0.18s ease;
}

.lic-mhs-btn.active .lic-mhs-dot::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 999px;
  background: currentColor;
}

.lic-mhs-texts {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.lic-mhs-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #e2e8f0;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lic-mhs-sub {
  font-size: 10.5px;
  font-weight: 600;
  color: #94a3b8;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Active State 1: Chưa xử lý (Sky-Blue nổi bật) */
.lic-mhs-btn.is-unhandled.active {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(37, 99, 235, 0.24) 100%);
  border-color: #38bdf8;
  box-shadow:
    0 8px 20px -6px rgba(14, 165, 233, 0.42),
    0 0 0 1px rgba(56, 189, 248, 0.28) inset;
}

.lic-mhs-btn.is-unhandled.active .lic-mhs-ico {
  background: #0284c7;
  border-color: #7dd3fc;
  color: #ffffff;
}

.lic-mhs-btn.is-unhandled.active .lic-mhs-dot {
  border-color: #38bdf8;
  color: #38bdf8;
}

.lic-mhs-btn.is-unhandled.active .lic-mhs-title {
  color: #ffffff;
}

.lic-mhs-btn.is-unhandled.active .lic-mhs-sub {
  color: #bae6fd;
}

/* Active State 2: Đã gia hạn (Emerald rực rỡ) */
.lic-mhs-btn.is-renewed.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.34) 0%, rgba(5, 150, 105, 0.26) 100%);
  border-color: #34d399;
  box-shadow:
    0 8px 20px -6px rgba(16, 185, 129, 0.45),
    0 0 0 1px rgba(52, 211, 153, 0.3) inset;
}

.lic-mhs-btn.is-renewed.active .lic-mhs-ico {
  background: #059669;
  border-color: #6ee7b7;
  color: #ffffff;
}

.lic-mhs-btn.is-renewed.active .lic-mhs-dot {
  border-color: #34d399;
  color: #34d399;
}

.lic-mhs-btn.is-renewed.active .lic-mhs-title {
  color: #ecfdf5;
}

.lic-mhs-btn.is-renewed.active .lic-mhs-sub {
  color: #a7f3d0;
}

/* Active State 3: Không gia hạn (Amber-Orange rõ nét) */
.lic-mhs-btn.is-stopped.active {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.34) 0%, rgba(217, 119, 6, 0.26) 100%);
  border-color: #fbbf24;
  box-shadow:
    0 8px 20px -6px rgba(245, 158, 11, 0.44),
    0 0 0 1px rgba(251, 191, 36, 0.3) inset;
}

.lic-mhs-btn.is-stopped.active .lic-mhs-ico {
  background: #d97706;
  border-color: #fde68a;
  color: #ffffff;
}

.lic-mhs-btn.is-stopped.active .lic-mhs-dot {
  border-color: #fbbf24;
  color: #fbbf24;
}

.lic-mhs-btn.is-stopped.active .lic-mhs-title {
  color: #fffbeb;
}

.lic-mhs-btn.is-stopped.active .lic-mhs-sub {
  color: #fde68a;
}

@media (max-width: 520px) {
  .lic-modal-handle-seg {
    gap: 6px;
  }
  .lic-mhs-btn {
    min-height: 62px;
    padding: 8px 7px;
  }
  .lic-mhs-title {
    font-size: 11.5px;
  }
  .lic-mhs-sub {
    font-size: 10px;
  }
}

/* Light Mode overrides for Handled Status */
.sr-page.theme-light-blue .lic-kpi-sub-action.is-handled {
  background: #f0f9ff;
  border-color: #7dd3fc;
  color: #0369a1;
}

.sr-page.theme-light-blue .lic-kpi-sub-action.is-handled strong {
  color: #0284c7;
}

.sr-page.theme-light-blue .lic-kpi-sub-action.is-handled:hover,
.sr-page.theme-light-blue .lic-kpi-sub-action.is-handled.is-active {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.sr-page.theme-light-blue .lic-kpi-sub-action.is-handled:hover strong,
.sr-page.theme-light-blue .lic-kpi-sub-action.is-handled.is-active strong {
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-ctt-mode-btn.is-price-handled.active {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.sr-page.theme-light-blue .sr-po1-plain-status.is-handled-text {
  color: #64748b !important;
}

.sr-page.theme-light-blue .lic-handle-lbl {
  color: #e0f2fe;
}

.sr-page.theme-light-blue .lic-handle-act-btn.is-renewed {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #047857;
}

.sr-page.theme-light-blue .lic-handle-act-btn.is-renewed:hover:not(:disabled) {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.sr-page.theme-light-blue .lic-handle-act-btn.is-stopped {
  background: #fffbeb;
  border-color: #fcd34d;
  color: #b45309;
}

.sr-page.theme-light-blue .lic-handle-act-btn.is-stopped:hover:not(:disabled) {
  background: #d97706;
  border-color: #d97706;
  color: #ffffff;
}

.sr-page.theme-light-blue .lic-handled-badge.is-renewed {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #047857;
}

.sr-page.theme-light-blue .lic-handled-badge.is-stopped {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.sr-page.theme-light-blue .lic-handled-undo-btn {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}

.sr-page.theme-light-blue .lic-handled-undo-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #f87171;
  color: #dc2626;
}

.sr-page.theme-light-blue .sr-record-card.sr-po1-card.is-just-renewed {
  border-color: #10b981 !important;
  box-shadow:
    0 8px 22px -6px rgba(16, 185, 129, 0.22),
    0 0 0 1px rgba(16, 185, 129, 0.22) !important;
}

.sr-page.theme-light-blue .sr-record-card.sr-po1-card.is-just-stopped {
  border-color: #f59e0b !important;
  box-shadow:
    0 8px 22px -6px rgba(245, 158, 11, 0.22),
    0 0 0 1px rgba(245, 158, 11, 0.22) !important;
}

.lic-modal-overlay.theme-light-blue .lic-modal-handle-seg {
  background: transparent;
  border: none;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-title {
  color: #1e293b;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-sub {
  color: #64748b;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-dot {
  border-color: #94a3b8;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-unhandled .lic-mhs-ico {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0284c7;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-renewed .lic-mhs-ico {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #059669;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-stopped .lic-mhs-ico {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #d97706;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-unhandled.active {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-color: #0284c7;
  box-shadow: 0 6px 16px -4px rgba(2, 132, 199, 0.25);
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-unhandled.active .lic-mhs-ico {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-unhandled.active .lic-mhs-dot {
  border-color: #0284c7;
  color: #0284c7;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-unhandled.active .lic-mhs-title {
  color: #0c4a6e;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-unhandled.active .lic-mhs-sub {
  color: #0369a1;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-renewed.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #059669;
  box-shadow: 0 6px 16px -4px rgba(5, 150, 105, 0.26);
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-renewed.active .lic-mhs-ico {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-renewed.active .lic-mhs-dot {
  border-color: #059669;
  color: #059669;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-renewed.active .lic-mhs-title {
  color: #064e3b;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-renewed.active .lic-mhs-sub {
  color: #047857;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-stopped.active {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #d97706;
  box-shadow: 0 6px 16px -4px rgba(217, 119, 6, 0.26);
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-stopped.active .lic-mhs-ico {
  background: #d97706;
  border-color: #d97706;
  color: #ffffff;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-stopped.active .lic-mhs-dot {
  border-color: #d97706;
  color: #d97706;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-stopped.active .lic-mhs-title {
  color: #78350f;
}

.lic-modal-overlay.theme-light-blue .lic-mhs-btn.is-stopped.active .lic-mhs-sub {
  color: #b45309;
}

/* Dòng Trạng thái xử lý bên dưới Thời gian còn lại & Thời gian hiệu lực trong Card */
.sr-po1-b-row.is-handle-row {
  align-items: center;
  margin-top: 3px;
  padding-top: 5px;
  border-top: 1px dashed rgba(148, 163, 184, 0.16);
  min-height: 28px;
}

.lic-block-handle-cell {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-wrap: wrap;
}

.lic-block-status-normal {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #6ee7b7;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.sr-page.theme-light-blue .sr-po1-b-row.is-handle-row {
  border-top-color: #e2e8f0;
}

.sr-page.theme-light-blue .lic-block-status-normal {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #047857;
}

/* Khoảng cách thoáng giữa cột Preview và cột 3 khối chỉ số trong Card License */
.sr-record-card.sr-po1-card .lic-card-split-body {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 16px;
  padding: 14px 16px;
  align-items: stretch;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sr-record-card.sr-po1-card .lic-card-preview-pane {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(6, 12, 24, 0.65);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.sr-record-card.sr-po1-card .lic-card-metrics-pane {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.sr-record-card.sr-po1-card .sr-po1-4blocks.is-3blocks {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.sr-record-card.sr-po1-card .sr-po1-block {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.48);
  padding: 12px 15px;
}

.sr-record-card.sr-po1-card .sr-po1-note-line {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 9px;
}

/* Dòng Tên khách hàng (2 hàng: Tên công ty & Tên KH) trong Khối 3 */
.sr-po1-b-row.is-cust-2lines-row {
  align-items: flex-start;
  padding: 3px 0;
}

.sr-po1-b-row.is-cust-2lines-row .sr-po1-b-lbl {
  padding-top: 2px;
  flex-shrink: 0;
}

.lic-cust-2lines {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
  max-width: 72%;
  text-align: right;
}

.lic-cust-line1 {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1.35;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-cust-line2 {
  font-size: 11.5px;
  font-weight: 500;
  color: #94a3b8;
  line-height: 1.3;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-cust-line2 strong {
  font-weight: 700;
  color: #cbd5e1;
}

/* Light Mode overrides cho khoảng cách Split & 2 hàng Tên khách hàng */
.sr-page.theme-light-blue .sr-record-card.sr-po1-card .lic-card-split-body {
  border-top-color: #cbd5e1;
  background: #f8fafc;
}

.sr-page.theme-light-blue .sr-record-card.sr-po1-card .lic-card-preview-pane {
  border-color: #cbd5e1;
  background: #ffffff;
}

.sr-page.theme-light-blue .sr-record-card.sr-po1-card .sr-po1-block {
  border-color: #cbd5e1;
  background: #ffffff;
}

.sr-page.theme-light-blue .sr-record-card.sr-po1-card .sr-po1-note-line {
  border-color: #cbd5e1;
  background: #ffffff;
}

.sr-page.theme-light-blue .lic-cust-line1 {
  color: #0f172a;
}

.sr-page.theme-light-blue .lic-cust-line2 {
  color: #64748b;
}

.sr-page.theme-light-blue .lic-cust-line2 strong {
  color: #334155;
}

/* Gạch ngang & giảm nhạt màu cho phần Quá hạn / Hiệu lực khi License đã xử lý */
.is-handled-dimmed {
  text-decoration: line-through !important;
  text-decoration-thickness: 1.5px !important;
  color: #64748b !important;
  opacity: 0.65 !important;
}

.sr-page.theme-light-blue .is-handled-dimmed {
  color: #94a3b8 !important;
  opacity: 0.72 !important;
}

/* Bộ lọc thời gian Còn hạn / Còn hiệu lực tùy chỉnh (Ngày / Tháng / Năm) trong Sidebar */
.lic-dur-picker-box {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 7px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.25);
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.lic-dur-picker-box.has-value {
  border-color: #34d399;
  background: rgba(6, 78, 59, 0.35);
}

.lic-dur-prefix {
  font-size: 11px;
  font-weight: 800;
  color: #6ee7b7;
  flex-shrink: 0;
}

.lic-dur-num-input {
  width: 44px;
  min-width: 0;
  flex: 1;
  height: 24px;
  padding: 0 4px;
  border: none;
  background: transparent;
  color: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  outline: none;
}

.lic-dur-num-input::placeholder {
  color: #64748b;
  font-weight: 500;
}

.lic-dur-unit-select {
  height: 24px;
  padding: 0 4px;
  border-radius: 5px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(30, 41, 59, 0.85);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
}

.lic-dur-clear-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.22);
  color: #fca5a5;
  font-size: 10px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.lic-dur-clear-btn:hover {
  background: #ef4444;
  color: #ffffff;
}

/* Bộ lọc thời gian Còn hạn & Còn hiệu lực ngay trên Thanh công cụ (Top Toolbar) */
.lic-toolbar-dur-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.lic-tb-dur-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 31px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.28);
  transition: all 0.15s ease;
}

.lic-tb-dur-pill.is-active {
  border-color: #34d399;
  background: rgba(6, 78, 59, 0.42);
  box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.2);
}

.lic-tb-dur-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  white-space: nowrap;
}

.lic-tb-dur-pill.is-active .lic-tb-dur-lbl {
  color: #6ee7b7;
}

.lic-tb-dur-input {
  width: 44px;
  height: 22px;
  padding: 0 5px;
  border-radius: 5px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(2, 6, 23, 0.55);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-align: center;
  outline: none;
}

.lic-tb-dur-input:focus {
  border-color: #38bdf8;
}

.lic-tb-dur-input::placeholder {
  color: #64748b;
  font-weight: 500;
}

.lic-tb-dur-select {
  height: 22px;
  padding: 0 4px;
  border-radius: 5px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
}

.lic-tb-dur-clear {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.22);
  color: #fca5a5;
  font-size: 9.5px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.lic-tb-dur-clear:hover {
  background: #ef4444;
  color: #ffffff;
}

/* Light Mode overrides cho Bộ lọc thời gian Ngày / Tháng / Năm */
.sr-page.theme-light-blue .lic-dur-picker-box {
  background: #ffffff;
  border-color: #cbd5e1;
}

.sr-page.theme-light-blue .lic-dur-picker-box.has-value {
  background: #ecfdf5;
  border-color: #10b981;
}

.sr-page.theme-light-blue .lic-dur-prefix {
  color: #059669;
}

.sr-page.theme-light-blue .lic-dur-num-input {
  color: #0f172a;
}

.sr-page.theme-light-blue .lic-dur-unit-select {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.sr-page.theme-light-blue .lic-tb-dur-pill {
  background: #ffffff;
  border-color: #cbd5e1;
}

.sr-page.theme-light-blue .lic-tb-dur-pill.is-active {
  background: #ecfdf5;
  border-color: #10b981;
}

.sr-page.theme-light-blue .lic-tb-dur-lbl {
  color: #475569;
}

.sr-page.theme-light-blue .lic-tb-dur-pill.is-active .lic-tb-dur-lbl {
  color: #047857;
}

.sr-page.theme-light-blue .lic-tb-dur-input {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.sr-page.theme-light-blue .lic-tb-dur-select {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

/* Lưới 3 khối riêng trong Card KPI Tổng & Card KPI Riêng (Còn hạn • Chưa xử lý • Đã xử lý) */
.lic-kpi-dual-grid.is-triple {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.lic-kpi-dual-grid.is-triple .lic-kpi-stat-box {
  padding: 7px 8px;
}

.lic-kpi-dual-grid.is-triple .lic-kpi-stat-tag {
  font-size: 9.5px;
  letter-spacing: 0.02em;
}

.lic-kpi-dual-grid.is-triple .lic-kpi-stat-num {
  font-size: 20px;
}

.lic-kpi-dual-grid.is-triple .lic-kpi-stat-sub {
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lic-kpi-dual-grid.is-compact.is-triple {
  gap: 5px;
}

.lic-kpi-dual-grid.is-compact.is-triple .lic-kpi-stat-box {
  padding: 6px 7px;
}

.lic-kpi-dual-grid.is-compact.is-triple .lic-kpi-stat-num {
  font-size: 17px;
}

/* ============================================================================
   MOBILE SHELL ARCHITECTURE (<= 1100px & <= 768px) — ĐỒNG BỘ SALEREPORT
   ============================================================================ */
.sr-page.is-mobile-shell {
  padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px)) !important;
}

.sr-mob-mode-switcher-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin: -4px 0 12px 0;
}

.sr-ctt-mode-switcher.is-mobile-full {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  padding: 4px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(56, 189, 248, 0.25);
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.28);
  gap: 4px;
}

.sr-ctt-mode-switcher.is-mobile-full .sr-ctt-mode-btn {
  width: 100%;
  justify-content: center;
  padding: 8px 10px;
  font-size: 12.5px;
  font-weight: 700;
  border-radius: 9px;
}

.sr-ctt-mode-switcher.is-lic-mob-quick {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  width: 100%;
  padding: 3px;
  border-radius: 11px;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.22);
  gap: 3px;
}

.sr-ctt-mode-switcher.is-lic-mob-quick .sr-ctt-mode-btn {
  width: 100%;
  justify-content: center;
  padding: 6px 4px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 8px;
  white-space: nowrap;
}

.sr-mob-dur-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  width: 100%;
}

.lic-toolbar-dur-wrap.is-mobile-full {
  width: 100%;
  justify-content: space-between;
  padding: 4px 7px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.82);
}

.lic-toolbar-dur-wrap.is-mobile-full .lic-tb-dur-label {
  font-size: 10.5px;
}

.lic-toolbar-dur-wrap.is-mobile-full .lic-tb-dur-input {
  width: 44px;
  height: 24px;
  font-size: 11px;
}

.lic-toolbar-dur-wrap.is-mobile-full .lic-tb-dur-select {
  height: 24px;
  font-size: 10.5px;
  padding: 0 16px 0 5px;
}

/* Mobile Context Toolbar (Tab Chi tiết License) */
.sr-mob-toolbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  flex-wrap: wrap;
}

.sr-mob-ctx-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 10px;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.82);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.18s ease;
}

.sr-mob-ctx-btn.is-back {
  border-color: rgba(56, 189, 248, 0.35);
  color: #7dd3fc;
}

.sr-mob-ctx-btn.is-create-po {
  margin-left: auto;
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.28), rgba(37, 99, 235, 0.28));
  border-color: rgba(56, 189, 248, 0.45);
  color: #bae6fd;
}

.sr-mob-company-stepper {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 32px;
  padding: 2px;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(56, 189, 248, 0.28);
}

.sr-mob-step-btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: none;
  background: rgba(30, 41, 59, 0.75);
  color: #7dd3fc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.sr-mob-step-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.sr-mob-step-pos {
  padding: 0 7px;
  font-size: 11px;
  font-weight: 800;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
}

/* Floating Glass Bottom Dock (5 nút giống SaleReport) */
.sr-mobile-dock {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: min(460px, calc(100vw - 20px));
  z-index: 955;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 20px;
  background: rgba(9, 14, 28, 0.94);
  border: 1px solid rgba(56, 189, 248, 0.32);
  box-shadow:
    0 18px 40px -8px rgba(0, 0, 0, 0.72),
    0 0 0 1px rgba(56, 189, 248, 0.14);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition:
    bottom 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.sr-mobile-dock.is-modal-hidden {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transform: translate(-50%, 24px) scale(0.96) !important;
}

.sr-dock-btn {
  position: relative;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  min-height: 48px;
  padding: 5px 4px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}

.sr-dock-btn > span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.15;
}

/* Thứ tự 5 nút PA1: 1: Tổng quan | 2: Bộ lọc | 3: + Thêm mới | 4: Hiển thị | 5: Lic đang chọn */
.sr-mobile-dock > .sr-dock-btn.is-slot-overview {
  order: 1 !important;
}
.sr-mobile-dock > .sr-dock-btn.is-slot-filter {
  order: 2 !important;
}
.sr-mobile-dock > .sr-dock-btn.is-center-cta {
  order: 3 !important;
}
.sr-mobile-dock > .sr-dock-btn.is-slot-display {
  order: 4 !important;
}
.sr-mobile-dock > .sr-dock-btn.is-company-slot {
  order: 5 !important;
}

.sr-dock-btn:hover,
.sr-dock-btn:active {
  color: #f0f9ff;
  background: rgba(14, 165, 233, 0.12);
}

.sr-dock-btn.active,
.sr-dock-btn.is-active {
  background: linear-gradient(180deg, rgba(14, 165, 233, 0.22) 0%, rgba(37, 99, 235, 0.16) 100%);
  border-color: rgba(56, 189, 248, 0.42);
  color: #f8fafc;
  box-shadow: 0 6px 16px rgba(2, 132, 199, 0.22);
}

.sr-dock-btn.active svg,
.sr-dock-btn.is-active svg {
  color: #38bdf8;
}

.sr-dock-btn.is-disabled {
  opacity: 0.55;
}

.sr-dock-btn.is-primary.is-center-cta,
.sr-dock-btn.is-primary-cta {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 55%, #4f46e5 100%);
  border-color: rgba(125, 211, 252, 0.55);
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.45);
}

.sr-dock-btn.is-primary.is-center-cta svg,
.sr-dock-btn.is-primary-cta svg {
  color: #ffffff;
}

.sr-dock-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
}

.sr-dock-badge {
  position: absolute;
  top: -5px;
  right: -13px;
  min-width: 16px;
  height: 15px;
  padding: 0 4px;
  border-radius: 999px;
  background: #0ea5e9;
  color: #ffffff;
  font-size: 9.5px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #090e1c;
  font-variant-numeric: tabular-nums;
}

.sr-dock-badge.is-amber {
  background: #f59e0b;
  color: #0f172a;
}

.sr-dock-company-name {
  max-width: 100%;
  padding: 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Ẩn nút Thêm mới / Thiết lập hiển thị trên thanh công cụ phụ vì đã đưa xuống thanh Dock 5 nút */
.sr-page.is-mobile-shell .sr-company-top-toolbar .sr-hdr-action-btn {
  display: none !important;
}

.sr-page.is-mobile-shell.m-tab-overview .sr-company-top-toolbar {
  margin-bottom: 0 !important;
  min-height: 0 !important;
}

/* Dropdown Hiển thị bật lên từ thanh Dock dưới cùng */
.sr-page.is-mobile-shell .sr-display-setting-dropdown {
  position: fixed !important;
  top: auto !important;
  right: 12px !important;
  left: 12px !important;
  bottom: calc(84px + env(safe-area-inset-bottom, 0px)) !important;
  width: auto !important;
  max-width: 390px !important;
  margin: 0 auto !important;
  max-height: min(74vh, 520px);
  overflow-y: auto;
  z-index: 980 !important;
  border-radius: 16px !important;
  box-shadow: 0 24px 56px rgba(2, 6, 23, 0.78) !important;
  transition: bottom 0.38s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

/* Folder Tab Shape cho Header Công ty trên Mobile (chuẩn SaleReport) */
.sr-page.is-mobile-shell .sr-company-folder-header,
.sr-page.is-mobile-shell.m-tab-overview .sr-company-folder-header,
.sr-page.theme-light-blue.is-mobile-shell .sr-company-folder-header,
.sr-page.theme-light-blue.is-mobile-shell.m-tab-overview .sr-company-folder-header {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  margin-bottom: 10px !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.sr-page.is-mobile-shell .sr-folder-top-bar,
.sr-page.is-mobile-shell.m-tab-overview .sr-folder-top-bar {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 40px 10px 12px !important;
  border-radius: 10px !important;
  background: linear-gradient(135deg, #059669 0%, #0d9488 60%, #0f172a 100%) !important;
  border: 1px solid rgba(52, 211, 153, 0.5) !important;
  box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.32) !important;
  flex-wrap: wrap !important;
}

.sr-page.theme-light-blue.is-mobile-shell .sr-folder-top-bar,
.sr-page.theme-light-blue.is-mobile-shell.m-tab-overview .sr-folder-top-bar {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 65%, #075985 100%) !important;
  border-color: #38bdf8 !important;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.18) !important;
}

.sr-page.is-mobile-shell .sr-folder-ear-tab,
.sr-page.is-mobile-shell.m-tab-overview .sr-folder-ear-tab {
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: 4px 6px !important;
  width: 100% !important;
  flex: 1 1 100% !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  clip-path: none !important;
}

.sr-page.is-mobile-shell .sr-cpb-right,
.sr-page.is-mobile-shell.m-tab-overview .sr-cpb-right {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
}

.sr-page.is-mobile-shell .sr-customer-kpi-sheet.sr-folder-body-sheet,
.sr-page.is-mobile-shell.m-tab-overview .sr-customer-kpi-sheet.sr-folder-body-sheet {
  margin-top: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Tối ưu Topbar, Dock trượt cùng Bottom Bar App & 4 Card KPI 2x2 trên Mobile <= 768px */
@media (max-width: 768px) {
  .sr-page.is-mobile-shell {
    padding: 14px 12px calc(158px + env(safe-area-inset-bottom, 0px)) !important;
  }

  /* Đặt thanh Dock nằm ngay phía trên Pill Bottom Bar (.sidebar cao 56px ở bottom 10px) */
  .sr-mobile-dock {
    left: 10px;
    right: 10px;
    bottom: calc(74px + env(safe-area-inset-bottom, 0px));
    width: auto;
    max-width: 460px;
    margin: 0 auto;
    padding: 5px 6px !important;
    gap: 4px !important;
    transform: translate3d(0, 0, 0);
    will-change: bottom, transform;
    transition:
      bottom 0.38s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.3s ease !important;
  }

  /* Khi cuộn xuống làm Bottom Bar của App tự ẩn (.mobile-nav-hidden), thanh Dock trượt mượt xuống đúng vị trí thanh Bottom Bar */
  :global(.app-layout.mobile-nav-hidden .sr-mobile-dock) {
    bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .sr-mobile-dock.is-modal-hidden,
  :global(.app-layout.has-open-modal .sr-mobile-dock) {
    transform: translateY(calc(100% + 96px + env(safe-area-inset-bottom, 0px))) scale(0.96) !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .sr-dock-btn {
    min-height: 46px !important;
    padding: 4px 2px !important;
    font-size: 9.5px !important;
    border-radius: 12px !important;
  }

  .sr-page.is-mobile-shell .sr-display-setting-dropdown {
    bottom: calc(138px + env(safe-area-inset-bottom, 0px)) !important;
  }

  :global(.app-layout.mobile-nav-hidden .sr-page.is-mobile-shell .sr-display-setting-dropdown) {
    bottom: calc(74px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .sr-page.license-page .bg-topbar {
    padding: 10px 12px;
    gap: 8px;
  }

  .sr-page.license-page .bg-topbar-right {
    width: 100%;
    flex-wrap: wrap;
    gap: 6px;
  }

  .sr-page.license-page .bg-search-box {
    flex: 1 1 100%;
    width: 100%;
    order: -1;
  }

  /* Card License: thu gọn header + 1 cột trên mobile */
  .sr-page.license-page .sr-po1-header {
    position: relative;
    padding: 10px 40px 10px 12px;
  }

  .sr-page.license-page .sr-po1-header-right {
    width: 100%;
    justify-content: flex-start;
    padding-right: 0;
  }

  .sr-page.license-page .sr-po-collapse-arrow-btn {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .sr-page.license-page .lic-card-split-body {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 10px !important;
    padding: 10px !important;
  }
}

/* ─── THANH GẬP NHANH KPI TỔNG (PA2) & 1 CARD / 1 HÀNG SLIM (PA1) TRÊN MOBILE SHELL ─── */
.lic-mob-kpi-collapse-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 11px;
  margin-bottom: 8px;
  border-radius: 11px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(56, 189, 248, 0.28);
  box-shadow: 0 4px 12px rgba(2, 6, 23, 0.28);
  cursor: pointer;
  user-select: none;
}

.lic-mob-kpi-collapse-bar.is-collapsed {
  margin-bottom: 0;
}

.lic-mkcb-left {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  flex: 1;
}

.lic-mkcb-icon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(14, 165, 233, 0.16);
  border: 1px solid rgba(56, 189, 248, 0.34);
  color: #38bdf8;
}

.lic-mkcb-title {
  font-size: 12px;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -0.01em;
}

.lic-mkcb-summary-pills {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  min-width: 0;
}

.lic-mkcb-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #cbd5e1;
  white-space: nowrap;
}

.lic-mkcb-chip strong {
  font-weight: 800;
  color: #ffffff;
}

.lic-mkcb-chip.is-emerald {
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(52, 211, 153, 0.32);
  color: #a7f3d0;
}

.lic-mkcb-chip.is-emerald strong {
  color: #34d399;
}

.lic-mkcb-chip.is-rose {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(248, 113, 113, 0.36);
  color: #fecaca;
}

.lic-mkcb-chip.is-rose strong {
  color: #f87171;
}

.lic-mkcb-chip.is-sky {
  background: rgba(14, 165, 233, 0.14);
  border-color: rgba(56, 189, 248, 0.32);
  color: #bae6fd;
}

.lic-mkcb-chip.is-sky strong {
  color: #38bdf8;
}

.lic-mkcb-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 25px;
  padding: 0 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(14, 165, 233, 0.16);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #7dd3fc;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}

.lic-mkcb-btn svg {
  transition: transform 0.2s ease;
}

/* Nút bật/tắt nhanh KPI riêng từng công ty trên thanh Folder Header Mobile */
.lic-mob-company-kpi-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #f0fdf4;
  cursor: pointer;
  white-space: nowrap;
}

.lic-mob-company-kpi-btn.active {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.55);
  color: #ffffff;
}

.lic-mob-company-kpi-btn svg {
  transition: transform 0.2s ease;
}

/* ─── HƯỚNG 1: LƯỚI 2 CỘT × 2 HÀNG (2+1 MINI-BENTO: 2 Ô TRÊN + 1 THANH NGANG DƯỚI) TRÊN MOBILE ─── */
.sr-page.is-mobile-shell .sr-super-bento-grid,
.sr-page.is-mobile-shell .sr-super-bento-grid.is-customer-bento,
.sr-page.is-mobile-shell .sr-super-bento-grid.is-customer-sheet {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 8px !important;
  align-items: stretch !important;
}

.sr-page.is-mobile-shell .sr-sb-card.lic-kpi-card {
  padding: 9px 9px 8px !important;
  border-radius: 12px !important;
  gap: 6px !important;
  display: flex !important;
  flex-direction: column !important;
}

/* Header Card: ẩn nút lọc phụ góc phải để tiêu đề có trọn vẹn chiều ngang */
.sr-page.is-mobile-shell .sr-sb-card.lic-kpi-card .sr-sb-quick-acts {
  display: none !important;
}

.sr-page.is-mobile-shell .sr-sb-card.lic-kpi-card .sr-sb-head {
  gap: 6px !important;
}

.sr-page.is-mobile-shell .sr-sb-card.lic-kpi-card .sr-sb-title-cluster {
  gap: 6px !important;
  min-width: 0 !important;
  width: 100% !important;
}

.sr-page.is-mobile-shell .sr-sb-icon {
  width: 22px !important;
  height: 22px !important;
  border-radius: 6px !important;
}

.sr-page.is-mobile-shell .sr-sb-icon svg {
  width: 12.5px !important;
  height: 12.5px !important;
}

.sr-page.is-mobile-shell .sr-sb-title {
  font-size: 11.5px !important;
  font-weight: 800 !important;
  line-height: 1.25 !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}

/* Card 1 (Quy mô Kho / Tổng License KH): Hàng trên Số lớn, Hàng dưới 2 ô 50/50 */
.sr-page.is-mobile-shell .lic-kpi-hero-split {
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: space-between !important;
  flex: 1 !important;
  gap: 5px !important;
  padding: 6px 7px !important;
}

.sr-page.is-mobile-shell .lic-kpi-hero-left {
  display: flex !important;
  flex-direction: row !important;
  align-items: baseline !important;
  justify-content: space-between !important;
  gap: 4px !important;
}

.sr-page.is-mobile-shell .sr-sb-hero-val {
  font-size: 20px !important;
  line-height: 1.1 !important;
}

.sr-page.is-mobile-shell .sr-sb-unit {
  font-size: 9px !important;
}

.sr-page.is-mobile-shell .lic-kpi-hero-sub {
  display: none !important;
}

.sr-page.is-mobile-shell .lic-kpi-mini-stack {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 5px !important;
  padding-left: 0 !important;
  border-left: none !important;
  padding-top: 5px !important;
  border-top: 1px dashed rgba(148, 163, 184, 0.22) !important;
}

.sr-page.is-mobile-shell .lic-kpi-mini-pill {
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: center !important;
  gap: 2px !important;
  padding: 4px 6px !important;
}

.sr-page.is-mobile-shell .lic-kpi-mini-lbl {
  font-size: 9.5px !important;
  white-space: normal !important;
  line-height: 1.2 !important;
}

.sr-page.is-mobile-shell .lic-kpi-mini-val {
  font-size: 12px !important;
}

/* Card 2 & Card 3 (.is-triple): 2 ô trên 50/50 (Còn hạn | Chưa XL) + 1 thanh ngang 100% dưới (Đã xử lý) */
.sr-page.is-mobile-shell .lic-kpi-dual-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 5px !important;
  flex: 1 !important;
}

.sr-page.is-mobile-shell .lic-kpi-dual-grid.is-triple {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 5px !important;
}

.sr-page.is-mobile-shell .lic-kpi-dual-grid .lic-kpi-stat-box,
.sr-page.is-mobile-shell .lic-kpi-dual-grid.is-triple .lic-kpi-stat-box {
  padding: 5px 6px !important;
  border-radius: 8px !important;
  gap: 2px !important;
}

.sr-page.is-mobile-shell .lic-kpi-stat-top {
  gap: 4px !important;
}

.sr-page.is-mobile-shell .lic-kpi-dot {
  width: 5.5px !important;
  height: 5.5px !important;
}

.sr-page.is-mobile-shell .lic-kpi-stat-tag,
.sr-page.is-mobile-shell .lic-kpi-dual-grid.is-triple .lic-kpi-stat-tag {
  font-size: 9px !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  white-space: nowrap !important;
}

.sr-page.is-mobile-shell .lic-kpi-stat-num,
.sr-page.is-mobile-shell .lic-kpi-dual-grid.is-triple .lic-kpi-stat-num {
  font-size: 17px !important;
  line-height: 1.15 !important;
}

/* Ẩn chữ phụ thừa ở 2 ô trên của Card 2 & 3 để 2 ô trên gọn sắc nét */
.sr-page.is-mobile-shell .lic-kpi-dual-grid.is-triple > .lic-kpi-stat-box:nth-child(1) .lic-kpi-stat-sub,
.sr-page.is-mobile-shell .lic-kpi-dual-grid.is-triple > .lic-kpi-stat-box:nth-child(2) .lic-kpi-stat-sub {
  display: none !important;
}

/* Ô thứ 3 (ĐÃ XỬ LÝ): trải ngang 100% ở hàng dưới bên trong Card */
.sr-page.is-mobile-shell .lic-kpi-dual-grid.is-triple > .lic-kpi-stat-box:nth-child(3) {
  grid-column: 1 / -1 !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-wrap: wrap !important;
  gap: 2px 6px !important;
  padding: 4px 7px !important;
}

.sr-page.is-mobile-shell .lic-kpi-dual-grid.is-triple > .lic-kpi-stat-box:nth-child(3) .lic-kpi-stat-num {
  font-size: 14px !important;
  margin-left: auto !important;
}

.sr-page.is-mobile-shell .lic-kpi-dual-grid.is-triple > .lic-kpi-stat-box:nth-child(3) .lic-kpi-stat-sub {
  font-size: 9.5px !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
  opacity: 0.9;
}

/* Card 4 (2 cột Đã gắn PO | Khớp Mã KH): hiển thị gọn không khuyết chữ */
.sr-page.is-mobile-shell .lic-kpi-dual-grid:not(.is-triple) .lic-kpi-stat-sub,
.sr-page.is-mobile-shell .lic-kpi-sub-action {
  font-size: 9.5px !important;
  padding: 2px 4px !important;
  white-space: normal !important;
  line-height: 1.2 !important;
}

/* Chân Card: giữ tỷ lệ % tự giải thích + thanh sức khỏe màu gọn 4px */
.sr-page.is-mobile-shell .lic-kpi-health-foot {
  margin-top: auto !important;
  gap: 3px !important;
}

.sr-page.is-mobile-shell .lic-kpi-health-lbl {
  display: none !important;
}

.sr-page.is-mobile-shell .lic-kpi-health-meta {
  justify-content: flex-end !important;
}

.sr-page.is-mobile-shell .lic-kpi-health-pct {
  font-size: 10px !important;
  white-space: nowrap !important;
}

.sr-page.is-mobile-shell .lic-kpi-seg-track {
  height: 4px !important;
}

/* Light Mode cho Mobile Shell */
.sr-page.theme-light-blue .sr-ctt-mode-switcher.is-mobile-full,
.sr-page.theme-light-blue .sr-ctt-mode-switcher.is-lic-mob-quick,
.sr-page.theme-light-blue .lic-toolbar-dur-wrap.is-mobile-full {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.sr-page.theme-light-blue .sr-mob-ctx-btn {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #1e293b;
}

.sr-page.theme-light-blue .sr-mob-ctx-btn.is-back,
.sr-page.theme-light-blue .sr-mob-ctx-btn.is-back-list {
  color: #0284c7;
  border-color: #7dd3fc;
}

.sr-page.theme-light-blue .sr-mob-ctx-btn.is-create-po,
.sr-page.theme-light-blue .sr-mob-ctx-btn.is-edit-po {
  background: linear-gradient(135deg, #e0f2fe, #dbeafe);
  border-color: #7dd3fc;
  color: #0369a1;
}

.sr-page.theme-light-blue .sr-mob-company-stepper {
  background: #ffffff;
  border-color: #cbd5e1;
}

.sr-page.theme-light-blue .sr-mob-step-btn {
  background: #f1f5f9;
  color: #0284c7;
}

.sr-page.theme-light-blue .sr-mob-step-pos {
  color: #0f172a;
}

.sr-page.theme-light-blue .sr-mobile-dock {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(14, 165, 233, 0.32);
  box-shadow:
    0 16px 38px rgba(15, 23, 42, 0.16),
    0 0 0 1px rgba(226, 232, 240, 0.9) inset;
}

.sr-page.theme-light-blue .sr-dock-btn {
  color: #475569;
}

.sr-page.theme-light-blue .sr-dock-btn:hover,
.sr-page.theme-light-blue .sr-dock-btn:active {
  color: #0284c7;
  background: #f0f9ff;
}

.sr-page.theme-light-blue .sr-dock-btn.active,
.sr-page.theme-light-blue .sr-dock-btn.is-active {
  background: linear-gradient(180deg, #e0f2fe 0%, #dbeafe 100%);
  border-color: #7dd3fc;
  color: #0369a1;
}

.sr-page.theme-light-blue .sr-dock-btn.active svg,
.sr-page.theme-light-blue .sr-dock-btn.is-active svg {
  color: #0284c7;
}

/* Nút + Thêm mới ở giữa Dock nổi bật rõ nét trên nền sáng Light Mode */
.sr-page.theme-light-blue .sr-dock-btn.is-primary.is-center-cta,
.sr-page.theme-light-blue .sr-dock-btn.is-primary-cta {
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 55%, #4f46e5 100%) !important;
  border-color: #38bdf8 !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  box-shadow:
    0 8px 20px -4px rgba(37, 99, 235, 0.52),
    0 2px 6px rgba(2, 132, 199, 0.28),
    0 1px 0 rgba(255, 255, 255, 0.35) inset !important;
}

.sr-page.theme-light-blue .sr-dock-btn.is-primary.is-center-cta:hover,
.sr-page.theme-light-blue .sr-dock-btn.is-primary.is-center-cta:active,
.sr-page.theme-light-blue .sr-dock-btn.is-primary-cta:hover,
.sr-page.theme-light-blue .sr-dock-btn.is-primary-cta:active {
  background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 55%, #4338ca 100%) !important;
  border-color: #0284c7 !important;
  color: #ffffff !important;
}

.sr-page.theme-light-blue .sr-dock-btn.is-primary.is-center-cta svg,
.sr-page.theme-light-blue .sr-dock-btn.is-primary-cta svg {
  color: #ffffff !important;
  stroke: #ffffff !important;
}

.sr-page.theme-light-blue .sr-dock-badge {
  border-color: #ffffff;
}

/* Light Mode cho Thanh gập nhanh KPI Tổng trên Mobile */
.sr-page.theme-light-blue .lic-mob-kpi-collapse-bar {
  background: #ffffff;
  border-color: #bae6fd;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.08);
}

.sr-page.theme-light-blue .lic-mkcb-icon {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0284c7;
}

.sr-page.theme-light-blue .lic-mkcb-title {
  color: #0f172a;
}

.sr-page.theme-light-blue .lic-mkcb-chip {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.sr-page.theme-light-blue .lic-mkcb-chip strong {
  color: #0f172a;
}

.sr-page.theme-light-blue .lic-mkcb-chip.is-emerald {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #065f46;
}

.sr-page.theme-light-blue .lic-mkcb-chip.is-emerald strong {
  color: #059669;
}

.sr-page.theme-light-blue .lic-mkcb-chip.is-rose {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #991b1b;
}

.sr-page.theme-light-blue .lic-mkcb-chip.is-rose strong {
  color: #dc2626;
}

.sr-page.theme-light-blue .lic-mkcb-chip.is-sky {
  background: #f0f9ff;
  border-color: #7dd3fc;
  color: #075985;
}

.sr-page.theme-light-blue .lic-mkcb-chip.is-sky strong {
  color: #0284c7;
}

.sr-page.theme-light-blue .lic-mkcb-btn {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

/* ─── CHỐNG TRÀN / KHUYẾT CHIỀU RỘNG CARD LICENSE TRÊN TOÀN BỘ MOBILE SHELL ─── */
.sr-page.is-mobile-shell .sr-groups-container,
.sr-page.is-mobile-shell .sr-workspace-layout,
.sr-page.is-mobile-shell .sr-md-main-area,
.sr-page.is-mobile-shell .sr-report-group,
.sr-page.is-mobile-shell .lic-group-body-wrap,
.sr-page.is-mobile-shell .sr-company-folder-header,
.sr-page.is-mobile-shell .sr-customer-kpi-sheet,
.sr-page.is-mobile-shell .sr-card-list,
.sr-page.is-mobile-shell .sr-card-outer-item,
.sr-page.is-mobile-shell .sr-record-card.sr-po1-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sr-page.is-mobile-shell .sr-card-list.is-cols-1,
.sr-page.is-mobile-shell .sr-card-list.is-cols-2 {
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 12px !important;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-header {
  position: relative;
  padding: 10px 40px 10px 12px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po-collapse-arrow-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-hbar,
.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-meta-left,
.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-meta-right,
.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-contract-row {
  min-width: 0;
  max-width: 100%;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-po-num {
  font-size: 13.5px;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-contract-title {
  min-width: 0 !important;
  max-width: 100%;
  font-size: 13.5px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-contract-files {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-file-entry {
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-fe-name {
  flex: 1 1 0%;
  min-width: 0;
  max-width: none;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .lic-card-split-body {
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 10px !important;
  padding: 10px !important;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .lic-card-preview-bar {
  flex-wrap: wrap;
  padding: 7px 10px;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-block {
  padding: 10px 12px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-b-row {
  min-width: 0;
  max-width: 100%;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-b-lbl {
  min-width: 0;
  flex-shrink: 0;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-b-val {
  flex: 1 1 0%;
  min-width: 0;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-b-row.is-handle-row {
  flex-wrap: wrap;
  row-gap: 6px;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .lic-block-handle-cell {
  margin-left: auto;
  min-width: 0;
  max-width: 100%;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .lic-cust-2lines {
  flex: 1 1 0%;
  min-width: 0;
  max-width: 100%;
}

.sr-page.is-mobile-shell .sr-record-card.sr-po1-card .sr-po1-note-line {
  padding: 8px 12px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* ─── ĐỒNG BỘ KÍCH THƯỚC HEADER MODAL CHỈNH SỬA LICENSE TRÊN MOBILE CHUẨN SALEREPORT ─── */
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

/* ============================================================================
   MOBILE TOP SEARCH BAR + ACTIVE FILTER CHIPS & BOTTOM SHEETS (PA1 - BỎ AI)
   ============================================================================ */
.lic-mob-top-search-wrap {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
  margin: -4px 0 10px 0;
  box-sizing: border-box;
}

.lic-mob-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.lic-mob-search-box {
  flex: 1 1 0;
  min-width: 0;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.28);
  box-shadow: 0 4px 14px rgba(2, 6, 23, 0.28);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  box-sizing: border-box;
}

.lic-mob-search-box:focus-within {
  border-color: rgba(56, 189, 248, 0.65);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.16);
}

.lic-mob-search-ico {
  color: #38bdf8;
  flex-shrink: 0;
}

.lic-mob-search-input {
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fafc;
  font-size: 13.5px;
  font-weight: 500;
}

.lic-mob-search-input::placeholder {
  color: #64748b;
}

.lic-mob-search-clear {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.lic-mob-refresh-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(56, 189, 248, 0.28);
  background: rgba(15, 23, 42, 0.9);
  color: #38bdf8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(2, 6, 23, 0.28);
  transition: all 0.18s ease;
}

.lic-mob-refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lic-mob-active-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.lic-mob-active-chips::-webkit-scrollbar {
  display: none;
}

.lic-mob-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 27px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(56, 189, 248, 0.38);
  background: rgba(14, 165, 233, 0.16);
  color: #bae6fd;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
}

.lic-mob-filter-chip.is-reset-all {
  border-color: rgba(248, 113, 113, 0.44);
  background: rgba(239, 68, 68, 0.15);
  color: #fecaca;
}

.lic-mfc-x {
  font-size: 10px;
  opacity: 0.85;
  font-weight: 800;
}

/* Light Mode — Thanh Tìm kiếm & Chip lọc trên Mobile */
.sr-page.theme-light-blue .lic-mob-search-box {
  background: #ffffff;
  border-color: rgba(14, 165, 233, 0.34);
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05);
}

.sr-page.theme-light-blue .lic-mob-search-box:focus-within {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.14);
}

.sr-page.theme-light-blue .lic-mob-search-ico {
  color: #0284c7;
}

.sr-page.theme-light-blue .lic-mob-search-input {
  color: #0f172a;
}

.sr-page.theme-light-blue .lic-mob-search-input::placeholder {
  color: #94a3b8;
}

.sr-page.theme-light-blue .lic-mob-search-clear {
  background: #f1f5f9;
  color: #475569;
}

.sr-page.theme-light-blue .lic-mob-refresh-btn {
  background: #ffffff;
  border-color: rgba(14, 165, 233, 0.34);
  color: #0284c7;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05);
}

.sr-page.theme-light-blue .lic-mob-filter-chip {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

.sr-page.theme-light-blue .lic-mob-filter-chip.is-reset-all {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
}

.sr-page.theme-light-blue .sr-dock-badge.is-amber {
  background: #f59e0b;
  color: #ffffff;
  border-color: #ffffff;
}

/* ─── MOBILE BOTTOM SHEETS (BỘ LỌC & THIẾT LẬP HIỂN THỊ) ─── */
@keyframes licSheetFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes licSheetSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.lic-mob-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  background: rgba(2, 6, 23, 0.68);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: licSheetFadeIn 0.18s ease-out;
}

.lic-mob-sheet-card {
  width: min(520px, 100%);
  max-height: 86dvh;
  background: linear-gradient(180deg, #0f172a 0%, #0b1120 100%);
  border-top: 1px solid rgba(56, 189, 248, 0.34);
  border-left: 1px solid rgba(56, 189, 248, 0.16);
  border-right: 1px solid rgba(56, 189, 248, 0.16);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -18px 48px rgba(0, 0, 0, 0.68);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  color: #f1f5f9;
  animation: licSheetSlideUp 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.lic-mob-sheet-grab {
  display: flex;
  justify-content: center;
  padding: 9px 0 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.lic-mob-sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.38);
}

.lic-mob-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 16px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  flex-shrink: 0;
}

.lic-mob-sheet-title {
  font-size: 15.5px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.01em;
}

.lic-mob-sheet-close {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(30, 41, 59, 0.72);
  color: #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.lic-mob-sheet-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.lic-ms-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.16);
}

.lic-ms-section.is-last {
  padding-bottom: 2px;
  border-bottom: none;
}

.lic-ms-label {
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #7dd3fc;
}

.lic-ms-chip-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.lic-ms-opt-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-height: 38px;
  padding: 7px 11px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(30, 41, 59, 0.62);
  color: #cbd5e1;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  min-width: 0;
  box-sizing: border-box;
  transition: all 0.16s ease;
}

.lic-ms-opt-btn span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-ms-opt-btn strong {
  font-size: 11.5px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.65);
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.lic-ms-opt-btn.active {
  border-color: rgba(56, 189, 248, 0.68);
  background: rgba(14, 165, 233, 0.22);
  color: #f0f9ff;
}

.lic-ms-opt-btn.active strong {
  background: rgba(2, 132, 199, 0.45);
  color: #ffffff;
}

.lic-ms-opt-btn.is-emerald.active {
  border-color: rgba(52, 211, 153, 0.68);
  background: rgba(16, 185, 129, 0.22);
  color: #ecfdf5;
}

.lic-ms-opt-btn.is-emerald.active strong {
  background: rgba(5, 150, 105, 0.45);
  color: #ffffff;
}

.lic-ms-opt-btn.is-rose.active {
  border-color: rgba(248, 113, 113, 0.7);
  background: rgba(239, 68, 68, 0.22);
  color: #fef2f2;
}

.lic-ms-opt-btn.is-rose.active strong {
  background: rgba(220, 38, 38, 0.45);
  color: #ffffff;
}

.lic-ms-opt-btn.is-amber.active {
  border-color: rgba(251, 191, 36, 0.7);
  background: rgba(245, 158, 11, 0.22);
  color: #fffbeb;
}

.lic-ms-opt-btn.is-amber.active strong {
  background: rgba(217, 119, 6, 0.45);
  color: #ffffff;
}

.lic-ms-dur-stack,
.lic-ms-field-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lic-ms-dur-row {
  display: grid;
  grid-template-columns: minmax(0, 0.96fr) minmax(0, 1.04fr);
  gap: 7px;
  align-items: center;
}

.lic-ms-select {
  width: 100%;
  min-width: 0;
  height: 39px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(30, 41, 59, 0.78);
  color: #f1f5f9;
  font-size: 12.5px;
  font-weight: 600;
  outline: none;
  box-sizing: border-box;
}

.lic-ms-dur-input-wrap {
  display: flex;
  align-items: center;
  height: 39px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(30, 41, 59, 0.78);
  overflow: hidden;
  min-width: 0;
  box-sizing: border-box;
}

.lic-ms-num-input {
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
  height: 100%;
  padding: 0 8px;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fafc;
  font-size: 12.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.lic-ms-num-input::placeholder {
  color: #64748b;
  font-weight: 500;
}

.lic-ms-unit-select {
  height: 100%;
  padding: 0 6px;
  border: none;
  border-left: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.55);
  color: #7dd3fc;
  font-size: 11.5px;
  font-weight: 700;
  outline: none;
  flex-shrink: 0;
}

.lic-ms-inline-clear {
  width: 24px;
  height: 100%;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
}

.lic-ms-seg-5 {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border-radius: 11px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.lic-ms-seg-btn {
  height: 33px;
  padding: 0 4px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.16s ease;
}

.lic-ms-seg-btn.active {
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.35);
}

.lic-ms-date-box {
  margin-top: 2px;
}

.lic-ms-date-input {
  width: 100%;
  height: 39px;
  padding: 0 11px;
  border-radius: 10px;
  border: 1px solid rgba(56, 189, 248, 0.35);
  background: rgba(30, 41, 59, 0.82);
  color: #f8fafc;
  font-size: 13px;
  font-weight: 600;
  box-sizing: border-box;
  outline: none;
}

.lic-ms-year-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 6px;
  border-radius: 10px;
  border: 1px solid rgba(56, 189, 248, 0.35);
  background: rgba(30, 41, 59, 0.82);
}

.lic-ms-year-stepper strong {
  font-size: 13.5px;
  font-weight: 800;
  color: #f8fafc;
}

.lic-ms-year-btn {
  width: 32px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.75);
  color: #7dd3fc;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lic-ms-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.lic-ms-choice-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  padding: 8px 10px;
  border-radius: 11px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(30, 41, 59, 0.65);
  color: #cbd5e1;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  min-width: 0;
  box-sizing: border-box;
  transition: all 0.16s ease;
}

.lic-ms-choice-btn span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-ms-choice-btn svg {
  flex-shrink: 0;
}

.lic-ms-choice-btn.active {
  border-color: rgba(56, 189, 248, 0.72);
  background: linear-gradient(180deg, rgba(14, 165, 233, 0.25) 0%, rgba(37, 99, 235, 0.18) 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.22);
}

.lic-ms-choice-btn.active svg {
  color: #38bdf8;
}

.lic-ms-toggle-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.lic-ms-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 42px;
  padding: 8px 12px;
  border-radius: 11px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(30, 41, 59, 0.62);
  color: #cbd5e1;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}

.lic-ms-toggle-row strong {
  font-size: 11.5px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 7px;
  background: rgba(14, 165, 233, 0.16);
  border: 1px solid rgba(56, 189, 248, 0.34);
  color: #7dd3fc;
  white-space: nowrap;
  flex-shrink: 0;
}

.lic-mob-sheet-foot {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(9, 14, 28, 0.96);
  flex-shrink: 0;
}

.lic-mob-sheet-foot.is-single {
  grid-template-columns: minmax(0, 1fr);
}

.lic-ms-foot-btn {
  height: 42px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.16s ease;
}

.lic-ms-foot-btn.is-reset {
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(30, 41, 59, 0.8);
  color: #cbd5e1;
}

.lic-ms-foot-btn.is-reset:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.lic-ms-foot-btn.is-apply {
  border: 1px solid rgba(125, 211, 252, 0.5);
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 60%, #4f46e5 100%);
  color: #ffffff;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.38);
}

/* ─── LIGHT MODE CHO MOBILE BOTTOM SHEETS (.lic-mob-sheet-overlay.is-light) ─── */
.lic-mob-sheet-overlay.is-light {
  background: rgba(15, 23, 42, 0.42);
}

.lic-mob-sheet-overlay.is-light .lic-mob-sheet-card {
  background: #ffffff;
  border-color: rgba(14, 165, 233, 0.28);
  box-shadow: 0 -14px 40px rgba(15, 23, 42, 0.18);
  color: #0f172a;
}

.lic-mob-sheet-overlay.is-light .lic-mob-sheet-handle {
  background: #cbd5e1;
}

.lic-mob-sheet-overlay.is-light .lic-mob-sheet-head {
  border-bottom-color: #e2e8f0;
}

.lic-mob-sheet-overlay.is-light .lic-mob-sheet-title {
  color: #0f172a;
}

.lic-mob-sheet-overlay.is-light .lic-mob-sheet-close {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

.lic-mob-sheet-overlay.is-light .lic-ms-section {
  border-bottom-color: #e2e8f0;
}

.lic-mob-sheet-overlay.is-light .lic-ms-label {
  color: #0369a1;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn,
.lic-mob-sheet-overlay.is-light .lic-ms-choice-btn,
.lic-mob-sheet-overlay.is-light .lic-ms-toggle-row {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn strong {
  background: #e2e8f0;
  color: #0f172a;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn.active,
.lic-mob-sheet-overlay.is-light .lic-ms-choice-btn.active {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #0369a1;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.12);
}

.lic-mob-sheet-overlay.is-light .lic-ms-choice-btn.active svg {
  color: #0284c7;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn.active strong {
  background: #0284c7;
  color: #ffffff;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn.is-emerald.active {
  background: #ecfdf5;
  border-color: #10b981;
  color: #047857;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn.is-emerald.active strong {
  background: #059669;
  color: #ffffff;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn.is-rose.active {
  background: #fef2f2;
  border-color: #ef4444;
  color: #b91c1c;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn.is-rose.active strong {
  background: #dc2626;
  color: #ffffff;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn.is-amber.active {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #b45309;
}

.lic-mob-sheet-overlay.is-light .lic-ms-opt-btn.is-amber.active strong {
  background: #d97706;
  color: #ffffff;
}

.lic-mob-sheet-overlay.is-light .lic-ms-select,
.lic-mob-sheet-overlay.is-light .lic-ms-dur-input-wrap,
.lic-mob-sheet-overlay.is-light .lic-ms-date-input,
.lic-mob-sheet-overlay.is-light .lic-ms-year-stepper {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-mob-sheet-overlay.is-light .lic-ms-num-input,
.lic-mob-sheet-overlay.is-light .lic-ms-year-stepper strong {
  color: #0f172a;
}

.lic-mob-sheet-overlay.is-light .lic-ms-unit-select {
  background: #f1f5f9;
  border-left-color: #cbd5e1;
  color: #0369a1;
}

.lic-mob-sheet-overlay.is-light .lic-ms-year-btn {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0369a1;
}

.lic-mob-sheet-overlay.is-light .lic-ms-seg-5 {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.lic-mob-sheet-overlay.is-light .lic-ms-seg-btn {
  color: #475569;
}

.lic-mob-sheet-overlay.is-light .lic-ms-seg-btn.active {
  color: #ffffff;
}

.lic-mob-sheet-overlay.is-light .lic-ms-toggle-row strong {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

.lic-mob-sheet-overlay.is-light .lic-mob-sheet-foot {
  background: #f8fafc;
  border-top-color: #e2e8f0;
}

.lic-mob-sheet-overlay.is-light .lic-ms-foot-btn.is-reset {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}
</style>
