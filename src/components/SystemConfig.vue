<template>
  <div
    class="sys-cfg-page page"
    :class="{ 'theme-light-blue': draft.ui.theme === 'light' }"
  >
    <!-- TOP BAR -->
    <header class="cfg-topbar">
      <div class="cfg-topbar-left">
        <button
          v-if="!isLoggedIn"
          type="button"
          class="cfg-btn cfg-btn-slate"
          @click="goBackToLogin"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>Quay lại Đăng nhập</span>
        </button>

        <div class="cfg-title-block">
          <div class="cfg-title-row">
            <span class="cfg-title-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </span>
            <h1 class="cfg-main-title">Trung Tâm Cấu Hình Hệ Thống &amp; API</h1>
            <span
              class="cfg-mode-pill"
              :class="effectiveMockActive ? 'pill-emerald' : 'pill-rose'"
            >
              <span class="pill-dot"></span>
              {{ effectiveMockActive ? 'ĐANG CHẠY MOCK JSON (0 BYTE FIREBASE)' : 'ĐANG CHẠY FIREBASE THẬT' }}
            </span>
          </div>
          <p class="cfg-subtitle">
            Môi trường: <strong class="mono-num">{{ hostLabel }}</strong>
            <span v-if="sysConfig.updatedAt">
              • Lưu lần cuối: <span class="mono-num">{{ formatDateTime(sysConfig.updatedAt) }}</span>
            </span>
            <span>
              •
              <strong v-if="effectiveMockActive" style="color: #10b981;">
                💾 Lưu Local (Tự động đẩy lên Cloud khi chuyển sang DB Thật)
              </strong>
              <strong v-else-if="cloudMeta.state === 'syncing'" style="color: #38bdf8;">
                ☁️ Đang tự động đồng bộ Cloud...
              </strong>
              <strong v-else-if="cloudMeta.state === 'error'" style="color: #f43f5e;">
                ☁️ Tạm mất kết nối Cloud ({{ cloudMeta.message }})
              </strong>
              <strong v-else style="color: #38bdf8;">
                ☁️ Tự động đồng bộ Cloud cho mọi thiết bị
              </strong>
            </span>
          </p>
        </div>
      </div>

      <div class="cfg-topbar-actions">
        <button
          type="button"
          class="cfg-btn cfg-btn-slate"
          title="Đổi giao diện Dark Navy / Light Blue"
          @click="toggleTheme"
        >
          <span v-if="draft.ui.theme === 'dark'">☀️ Light Blue</span>
          <span v-else>🌙 Dark Navy</span>
        </button>

        <button
          type="button"
          class="cfg-btn cfg-btn-emerald"
          :disabled="isSaving"
          @click="handleSaveAll(false)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>{{ isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình' }}</span>
        </button>

        <button
          type="button"
          class="cfg-btn cfg-btn-sky"
          :disabled="isSaving"
          title="Lưu toàn bộ và tải lại trang để áp dụng nguồn Database mới cho tất cả phân hệ"
          @click="handleSaveAll(true)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          <span>Lưu &amp; Tải lại App</span>
        </button>
      </div>
    </header>

    <!-- MOBILE PILL TABS -->
    <nav class="cfg-mobile-tabs" aria-label="Phân mục cấu hình">
      <button
        v-for="tab in navTabs"
        :key="tab.id"
        type="button"
        class="cfg-mob-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="cfg-mob-tab-num">{{ tab.num }}</span>
        <span>{{ tab.shortLabel }}</span>
      </button>
    </nav>

    <!-- WORKSPACE SPLIT LAYOUT -->
    <div class="cfg-workspace">
      <!-- PC STICKY SIDEBAR -->
      <aside class="cfg-sidebar">
        <div class="cfg-nav-card">
          <div class="cfg-nav-heading">PHÂN MỤC CẤU HÌNH</div>
          <button
            v-for="tab in navTabs"
            :key="tab.id"
            type="button"
            class="cfg-nav-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="cfg-nav-num mono-num">{{ tab.num }}</span>
            <div class="cfg-nav-meta">
              <div class="cfg-nav-title">{{ tab.label }}</div>
              <div class="cfg-nav-desc">{{ tab.desc }}</div>
            </div>
          </button>
        </div>

        <!-- ENVIRONMENT STATUS SUMMARY -->
        <div class="cfg-status-box">
          <div class="cfg-nav-heading">TRẠNG THÁI HIỆN TẠI</div>
          <div class="cfg-stat-line">
            <span>Nguồn DB</span>
            <strong :class="effectiveMockActive ? 'text-emerald' : 'text-sky'">
              {{ effectiveMockActive ? 'Mock JSON (Local)' : 'Firebase Cloud' }}
            </strong>
          </div>
          <div class="cfg-stat-line">
            <span>Firebase ID</span>
            <strong class="mono-num">{{ draft.firebase.projectId || 'Chưa đặt' }}</strong>
          </div>
          <div class="cfg-stat-line">
            <span>Cloudinary</span>
            <strong class="mono-num">{{ draft.storage.cloudinaryCloudName || 'Chưa đặt' }}</strong>
          </div>
          <div class="cfg-stat-line">
            <span>Mock Upload</span>
            <strong :class="draft.storage.mockLocalUpload && effectiveMockActive ? 'text-amber' : ''">
              {{ draft.storage.mockLocalUpload && effectiveMockActive ? 'Lưu ổ cứng' : 'Gửi Cloud thật' }}
            </strong>
          </div>
          <div class="cfg-stat-line">
            <span>Zalo Bot ngầm</span>
            <strong>
              {{ effectiveMockActive && draft.zaloBot.pauseInMockMode ? 'Tạm dừng (An toàn)' : 'Hoạt động' }}
            </strong>
          </div>
        </div>
      </aside>

      <!-- MAIN PANEL -->
      <section class="cfg-main">
        <!-- =========================================================
             TAB 1: DATABASE MODE & MOCK JSON 43.4 MB
             ========================================================= -->
        <div v-show="activeTab === 'db'" class="cfg-section-stack">
          <div class="cfg-card">
            <div class="cfg-card-head">
              <div>
                <h2 class="cfg-card-title">01. Chế độ Nguồn Dữ Liệu (Mock JSON ⇄ Firebase Thật)</h2>
                <p class="cfg-card-sub">
                  Chuyển đổi tức thì toàn bộ 23 trang của hệ thống mà không cần sửa code. Khi bật Mock JSON, ứng dụng tốn đúng 0 byte băng thông Firebase.
                </p>
              </div>
            </div>

            <div class="cfg-mode-grid">
              <!-- MOCK CARD -->
              <div
                class="cfg-mode-option"
                :class="{
                  'is-selected-emerald': draft.dbMode === 'mock' && isLocalHost,
                  'is-disabled': !isLocalHost
                }"
                @click="isLocalHost && selectDbMode('mock')"
              >
                <div class="cfg-mode-top">
                  <span class="cfg-badge badge-emerald">MOCK JSON LOCAL</span>
                  <span v-if="draft.dbMode === 'mock' && isLocalHost" class="cfg-active-tag tag-emerald">
                    ✓ Đang chọn
                  </span>
                </div>
                <div class="cfg-mode-name">Chạy từ file JSON trên máy (Offline)</div>
                <p class="cfg-mode-detail">
                  Đọc trực tiếp từ <code>mockdata.json</code> qua Vite Node Server. Mọi thao tác Thêm / Sửa / Xóa được ghi sang bản nháp <code>mockdata.local.json</code>, giữ nguyên vẹn file gốc.
                </p>
                <div v-if="!isLocalHost" class="cfg-warn-inline">
                  Chế độ Mock ổ cứng chỉ khả dụng khi chạy trên máy local (<code>localhost</code>).
                </div>
              </div>

              <!-- LIVE FIREBASE CARD -->
              <div
                class="cfg-mode-option"
                :class="{ 'is-selected-sky': draft.dbMode === 'live' || !isLocalHost }"
                @click="selectDbMode('live')"
              >
                <div class="cfg-mode-top">
                  <span class="cfg-badge badge-rose">FIREBASE REALTIME DB</span>
                  <span v-if="draft.dbMode === 'live' || !isLocalHost" class="cfg-active-tag tag-sky">
                    ✓ Đang chọn
                  </span>
                </div>
                <div class="cfg-mode-name">Kết nối Database Thật (Online)</div>
                <p class="cfg-mode-detail">
                  Kết nối trực tiếp tới máy chủ Google Firebase theo thông số cấu hình ở mục <strong>02. Firebase DB</strong> bên dưới.
                </p>
              </div>
            </div>

            <div v-if="isLocalHost && draft.dbMode !== sysConfig.dbMode" class="cfg-banner banner-amber">
              <div>
                <strong>Bạn vừa đổi chế độ Database sang {{ draft.dbMode === 'mock' ? 'MOCK JSON' : 'FIREBASE THẬT' }}.</strong>
                <span> Bấm nút bên phải để lưu và tải lại trang cho toàn bộ các trang nhận nguồn dữ liệu mới ngay lập tức.</span>
              </div>
              <button type="button" class="cfg-btn cfg-btn-emerald" @click="handleSaveAll(true)">
                Áp dụng &amp; Tải lại ngay
              </button>
            </div>
          </div>

          <!-- MOCK DATA WAREHOUSE MANAGER (LOCALHOST ONLY) -->
          <div v-if="isLocalHost" class="cfg-card">
            <div class="cfg-card-head">
              <div>
                <h2 class="cfg-card-title">Quản Lý Kho Dữ Liệu Mock (<code>mockdata.json</code>)</h2>
                <p class="cfg-card-sub">
                  Kiểm tra dung lượng từng bảng, nạp bản export Firebase mới, tải dữ liệu đã làm việc offline về máy hoặc khôi phục lại file gốc.
                </p>
              </div>
              <div class="cfg-head-btns">
                <button
                  type="button"
                  class="cfg-btn cfg-btn-slate"
                  :disabled="loadingStats"
                  @click="fetchMockStats"
                >
                  {{ loadingStats ? 'Đang đọc...' : '↻ Làm mới' }}
                </button>
              </div>
            </div>

            <!-- KPI STRIP -->
            <div v-if="mockStats" class="cfg-kpi-grid">
              <div class="cfg-kpi-card">
                <div class="cfg-kpi-label">NGUỒN ĐANG ĐỌC</div>
                <div class="cfg-kpi-val" :class="mockStats.activeSource === 'draft' ? 'text-amber' : 'text-emerald'">
                  {{
                    mockStats.activeSource === 'draft'
                      ? 'Bản nháp (.local.json)'
                      : mockStats.activeSource === 'base'
                        ? 'File gốc (mockdata.json)'
                        : 'Trống (Chưa có file)'
                  }}
                </div>
                <div class="cfg-kpi-sub mono-num">
                  Đã ghi {{ mockStats.mutationCount }} thao tác trong phiên này
                </div>
              </div>

              <div class="cfg-kpi-card">
                <div class="cfg-kpi-label">TỔNG DUNG LƯỢNG RAM</div>
                <div class="cfg-kpi-val mono-num text-sky">{{ mockStats.totalMemMB }} MB</div>
                <div class="cfg-kpi-sub mono-num">
                  File gốc: {{ mockStats.baseFile.exists ? `${mockStats.baseFile.sizeMB} MB` : 'Không tìm thấy' }}
                </div>
              </div>

              <div class="cfg-kpi-card">
                <div class="cfg-kpi-label">SỐ BẢNG (NODES)</div>
                <div class="cfg-kpi-val mono-num">{{ mockStats.totalTables }} bảng</div>
                <div class="cfg-kpi-sub mono-num">
                  Tổng {{ totalMockRecords.toLocaleString('vi-VN') }} bản ghi cấp 1
                </div>
              </div>
            </div>

            <div v-if="mockStats" class="cfg-file-paths-box">
              <div class="cfg-path-row">
                <span class="cfg-path-tag tag-sky">FILE GỐC</span>
                <code class="mono-num">{{ mockStats.baseFile.path }}</code>
                <span v-if="mockStats.baseFile.updatedAt" class="cfg-path-time mono-num">
                  ({{ formatDateTime(mockStats.baseFile.updatedAt) }})
                </span>
              </div>
              <div class="cfg-path-row">
                <span class="cfg-path-tag tag-amber">BẢN NHÁP</span>
                <code class="mono-num">{{ mockStats.draftFile.path }}</code>
                <span class="cfg-path-time mono-num">
                  {{
                    mockStats.draftFile.exists
                      ? `Đang tồn tại (${mockStats.draftFile.sizeMB} MB • ${formatDateTime(mockStats.draftFile.updatedAt || '')})`
                      : 'Chưa phát sinh chỉnh sửa mới (Đang đọc nguyên bản từ file gốc)'
                  }}
                </span>
              </div>
            </div>

            <!-- MOCK FILE ACTIONS -->
            <div class="cfg-action-bar">
              <input
                ref="mockJsonInputRef"
                type="file"
                accept=".json,application/json"
                style="display: none"
                @change="handleImportNewBaseMock"
              />
              <button
                type="button"
                class="cfg-btn cfg-btn-sky"
                :disabled="busyMockAction"
                @click="triggerPickBaseMockJson"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span>Nạp file .JSON Export mới</span>
              </button>

              <button
                type="button"
                class="cfg-btn cfg-btn-emerald"
                :disabled="busyMockAction"
                @click="handleDownloadWorkingMock"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Tải bản Mock hiện tại về máy (.json)</span>
              </button>

              <button
                type="button"
                class="cfg-btn cfg-btn-danger-hover"
                :disabled="busyMockAction"
                @click="handleResetMockToOriginal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                <span>Reset về mockdata.json gốc</span>
              </button>
            </div>

            <!-- TABLES BREAKDOWN -->
            <div v-if="mockStats && mockStats.tables.length" class="cfg-table-wrap">
              <div class="cfg-table-filter-row">
                <span class="cfg-mini-label">CHI TIẾT DUNG LƯỢNG TỪNG BẢNG TRONG MOCK DB</span>
                <input
                  v-model="tableSearch"
                  type="text"
                  class="cfg-input cfg-input-sm"
                  placeholder="Tìm tên bảng (VD: hang_hoa, PO_DXMH, password)..."
                />
              </div>

              <div class="cfg-data-table-scroll">
                <table class="cfg-table">
                  <thead>
                    <tr>
                      <th style="width: 44px">#</th>
                      <th>Tên bảng (Node gốc)</th>
                      <th style="width: 140px; text-align: right">Số bản ghi</th>
                      <th style="width: 140px; text-align: right">Dung lượng</th>
                      <th style="width: 180px">Tỷ trọng</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(tbl, idx) in filteredMockTables" :key="tbl.name">
                      <td class="mono-num text-muted">{{ idx + 1 }}</td>
                      <td>
                        <code class="cfg-code-chip mono-num">{{ tbl.name }}</code>
                      </td>
                      <td class="mono-num" style="text-align: right; font-weight: 700">
                        {{ tbl.count.toLocaleString('vi-VN') }}
                      </td>
                      <td class="mono-num" style="text-align: right">
                        <span :class="tbl.sizeMB >= 5 ? 'text-amber font-bold' : ''">
                          {{ tbl.sizeMB > 0 ? `${tbl.sizeMB.toFixed(2)} MB` : `${(tbl.bytes / 1024).toFixed(1)} KB` }}
                        </span>
                      </td>
                      <td>
                        <div class="cfg-bar-track">
                          <div
                            class="cfg-bar-fill"
                            :class="tbl.sizeMB >= 10 ? 'fill-amber' : 'fill-sky'"
                            :style="{
                              width: `${Math.min(100, Math.max(2, (tbl.bytes / Math.max(1, totalMockBytes)) * 100))}%`
                            }"
                          ></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- =========================================================
             TAB 2: FIREBASE REALTIME DATABASE (SINGLE CONFIG)
             ========================================================= -->
        <div v-show="activeTab === 'firebase'" class="cfg-section-stack">
          <div class="cfg-card">
            <div class="cfg-card-head">
              <div>
                <h2 class="cfg-card-title">02. Cấu Hình Kết Nối Firebase Realtime Database</h2>
                <p class="cfg-card-sub">
                  Thay đổi thông số tại đây sẽ tự động áp dụng đè lên cả 23 trang trong hệ thống khi chạy ở chế độ <strong>Firebase Thật</strong> (tiện lợi khi bạn cần chuyển sang project Firebase mới).
                </p>
              </div>
              <div class="cfg-head-btns">
                <button
                  type="button"
                  class="cfg-btn cfg-btn-sky"
                  :disabled="testingService === 'firebase'"
                  @click="testFirebaseConnection"
                >
                  {{ testingService === 'firebase' ? 'Đang kiểm tra...' : '⚡ Test kết nối Firebase' }}
                </button>
              </div>
            </div>

            <!-- TEST RESULT BANNER -->
            <div
              v-if="testResults.firebase"
              class="cfg-banner"
              :class="testResults.firebase.ok ? 'banner-emerald' : 'banner-rose'"
            >
              <div>
                <strong>{{ testResults.firebase.ok ? '✅ Kết nối thành công:' : '❌ Kết nối thất bại:' }}</strong>
                <span> {{ testResults.firebase.message }}</span>
              </div>
            </div>

            <!-- SMART PASTE BOX -->
            <div class="cfg-paste-box">
              <div class="cfg-paste-head">
                <span class="cfg-mini-label">DÁN NHANH ĐOẠN CODE <code>firebaseConfig</code> TỪ FIREBASE CONSOLE</span>
                <button
                  type="button"
                  class="cfg-btn cfg-btn-sky cfg-btn-xs"
                  :disabled="!firebaseSnippet.trim()"
                  @click="applyFirebaseSnippet"
                >
                  Bóc tách tự động vào các ô dưới
                </button>
              </div>
              <textarea
                v-model="firebaseSnippet"
                rows="3"
                class="cfg-textarea mono-num"
                placeholder='Dán nguyên đoạn const firebaseConfig = { apiKey: "...", databaseURL: "https://...", projectId: "..." } vào đây rồi bấm Bóc tách tự động...'
              ></textarea>
            </div>

            <!-- 8 FIELDS -->
            <div class="cfg-form-grid-2">
              <div class="cfg-field cfg-field-full">
                <label class="cfg-label">DATABASE URL (QUAN TRỌNG NHẤT)</label>
                <input
                  v-model.trim="draft.firebase.databaseURL"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="https://ten-project-default-rtdb.asia-southeast1.firebasedatabase.app"
                />
              </div>

              <div class="cfg-field">
                <label class="cfg-label">API KEY</label>
                <div class="cfg-secret-wrap">
                  <input
                    v-model.trim="draft.firebase.apiKey"
                    :type="revealed.firebaseApiKey ? 'text' : 'password'"
                    class="cfg-input mono-num"
                    placeholder="AIzaSy..."
                  />
                  <button
                    type="button"
                    class="cfg-eye-btn"
                    @click="revealed.firebaseApiKey = !revealed.firebaseApiKey"
                  >
                    {{ revealed.firebaseApiKey ? 'Ẩn' : 'Hiện' }}
                  </button>
                </div>
              </div>

              <div class="cfg-field">
                <label class="cfg-label">PROJECT ID</label>
                <input
                  v-model.trim="draft.firebase.projectId"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="chusonproject"
                />
              </div>

              <div class="cfg-field">
                <label class="cfg-label">AUTH DOMAIN</label>
                <input
                  v-model.trim="draft.firebase.authDomain"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="chusonproject.firebaseapp.com"
                />
              </div>

              <div class="cfg-field">
                <label class="cfg-label">STORAGE BUCKET</label>
                <input
                  v-model.trim="draft.firebase.storageBucket"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="chusonproject.firebasestorage.app"
                />
              </div>

              <div class="cfg-field">
                <label class="cfg-label">MESSAGING SENDER ID</label>
                <input
                  v-model.trim="draft.firebase.messagingSenderId"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="929199941311"
                />
              </div>

              <div class="cfg-field">
                <label class="cfg-label">APP ID</label>
                <input
                  v-model.trim="draft.firebase.appId"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="1:929199941311:web:..."
                />
              </div>

              <div class="cfg-field">
                <label class="cfg-label">MEASUREMENT ID (TÙY CHỌN)</label>
                <input
                  v-model.trim="draft.firebase.measurementId"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="G-..."
                />
              </div>
            </div>
          </div>
        </div>

        <!-- =========================================================
             TAB 3: CLOUDINARY & IMGBB + EXACT PAGE/BUTTON USAGE MAP
             ========================================================= -->
        <div v-show="activeTab === 'storage'" class="cfg-section-stack">
          <!-- LOCAL UPLOAD TOGGLE IN MOCK MODE -->
          <div v-if="isLocalHost" class="cfg-card cfg-card-compact">
            <label class="cfg-switch-row">
              <div class="cfg-switch-info">
                <div class="cfg-switch-title">
                  Lưu file &amp; ảnh upload thẳng vào ổ cứng máy (<code>public/__local_uploads/</code>) khi đang chạy Mock
                </div>
                <div class="cfg-switch-desc">
                  Khi bật công tắc này và đang ở chế độ <strong>Mock JSON</strong>, mọi nút tải file báo giá Excel, PDF, Logo, Ảnh dán sẽ lưu vào máy bạn thay vì gửi lên Cloudinary / ImgBB — tiết kiệm 100% dung lượng Cloud khi test.
                </div>
              </div>
              <input
                v-model="draft.storage.mockLocalUpload"
                type="checkbox"
                class="cfg-checkbox"
              />
            </label>
          </div>

          <!-- CLOUDINARY CONFIG + USAGE MAP -->
          <div class="cfg-card">
            <div class="cfg-card-head">
              <div>
                <h2 class="cfg-card-title">03A. Cloudinary (Lưu trữ File Báo Giá Excel, PDF, Bảng Giá Hãng &amp; Logo)</h2>
                <p class="cfg-card-sub">
                  Tự động ghi đè cả helper <code>vendorRefCloudinary.ts</code> lẫn toàn bộ các lệnh <code>fetch('https://api.cloudinary.com/...')</code> trong mọi trang. Lưu ý: Upload Preset trên Cloudinary phải để chế độ <strong>Unsigned</strong>.
                </p>
              </div>
              <div class="cfg-head-btns">
                <button
                  type="button"
                  class="cfg-btn cfg-btn-sky"
                  :disabled="testingService === 'cloudinary'"
                  @click="testCloudinaryUpload"
                >
                  {{ testingService === 'cloudinary' ? 'Đang upload thử...' : '⚡ Test Upload Cloudinary' }}
                </button>
              </div>
            </div>

            <div
              v-if="testResults.cloudinary"
              class="cfg-banner"
              :class="testResults.cloudinary.ok ? 'banner-emerald' : 'banner-rose'"
            >
              <div>
                <strong>{{ testResults.cloudinary.ok ? '✅ Upload Cloudinary OK:' : '❌ Lỗi Cloudinary:' }}</strong>
                <span> {{ testResults.cloudinary.message }}</span>
              </div>
            </div>

            <div class="cfg-form-grid-2">
              <div class="cfg-field">
                <label class="cfg-label">CLOUDINARY CLOUD NAME</label>
                <input
                  v-model.trim="draft.storage.cloudinaryCloudName"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="VD: db6fzs3rh"
                />
              </div>

              <div class="cfg-field">
                <label class="cfg-label">UPLOAD PRESET (UNSIGNED)</label>
                <input
                  v-model.trim="draft.storage.cloudinaryUploadPreset"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="VD: upload_file"
                />
              </div>
            </div>

            <div class="cfg-endpoint-preview mono-num">
              Endpoint thực tế sẽ gọi:
              <code>https://api.cloudinary.com/v1_1/{{ draft.storage.cloudinaryCloudName || '...' }}/auto/upload</code>
              (và fallback <code>/raw/upload</code> cho file <code>.xlsb</code>, <code>.zip</code>, <code>.docx</code>)
            </div>

            <!-- DETAILED CLOUDINARY USAGE MAP -->
            <div class="cfg-usage-block">
              <div class="cfg-usage-header">
                <div>
                  <div class="cfg-usage-title">
                    📍 Bản đồ chi tiết: Cloudinary đang được dùng ở {{ cloudinaryUsageMap.length }} phân hệ &amp; các nút cụ thể
                  </div>
                  <div class="cfg-usage-sub">
                     Bấm vào đường dẫn trang để nhảy tới kiểm tra trực tiếp; dùng ô tìm kiếm để lọc theo tên trang hoặc tên nút.
                  </div>
                </div>
                <input
                  v-model="cloudinaryUsageSearch"
                  type="text"
                  class="cfg-input cfg-input-sm"
                  placeholder="Lọc trang hoặc tên nút..."
                />
              </div>

              <div class="cfg-usage-list">
                <div
                  v-for="(u, idx) in filteredCloudinaryUsage"
                  :key="u.route + idx"
                  class="cfg-usage-item"
                >
                  <div class="cfg-usage-item-head">
                    <div class="cfg-usage-page">
                      <span class="cfg-usage-idx mono-num">{{ String(idx + 1).padStart(2, '0') }}</span>
                      <strong>{{ u.pageName }}</strong>
                      <code class="cfg-file-tag mono-num">{{ u.componentFile }}</code>
                    </div>
                    <router-link :to="u.route" class="cfg-route-link mono-num">
                      {{ u.route }} ↗
                    </router-link>
                  </div>
                  <ul class="cfg-usage-btns">
                    <li v-for="(btn, bIdx) in u.buttons" :key="bIdx">
                      <span class="cfg-btn-chip">{{ btn.buttonLabel }}</span>
                      <span class="cfg-btn-purpose">— {{ btn.description }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- IMGBB CONFIG + USAGE MAP -->
          <div class="cfg-card">
            <div class="cfg-card-head">
              <div>
                <h2 class="cfg-card-title">03B. ImgBB (Lưu trữ Ảnh Dán Clipboard &amp; Ảnh Minh Họa Báo Cáo)</h2>
                <p class="cfg-card-sub">
                  Dùng cho tính năng tải ảnh nhanh và bấm <code>Ctrl + V</code> dán ảnh chụp màn hình trực tiếp vào nội dung báo cáo công việc.
                </p>
              </div>
              <div class="cfg-head-btns">
                <button
                  type="button"
                  class="cfg-btn cfg-btn-sky"
                  :disabled="testingService === 'imgbb'"
                  @click="testImgbbUpload"
                >
                  {{ testingService === 'imgbb' ? 'Đang kiểm tra...' : '⚡ Test Key ImgBB' }}
                </button>
              </div>
            </div>

            <div
              v-if="testResults.imgbb"
              class="cfg-banner"
              :class="testResults.imgbb.ok ? 'banner-emerald' : 'banner-rose'"
            >
              <div>
                <strong>{{ testResults.imgbb.ok ? '✅ ImgBB hoạt động tốt:' : '❌ Lỗi ImgBB:' }}</strong>
                <span> {{ testResults.imgbb.message }}</span>
              </div>
            </div>

            <div class="cfg-form-grid-2">
              <div class="cfg-field cfg-field-full">
                <label class="cfg-label">IMGBB API KEY (LẤY TẠI API.IMGBB.COM)</label>
                <div class="cfg-secret-wrap">
                  <input
                    v-model.trim="draft.storage.imgbbApiKey"
                    :type="revealed.imgbbKey ? 'text' : 'password'"
                    class="cfg-input mono-num"
                    placeholder="Nhập API Key 32 ký tự của ImgBB..."
                  />
                  <button
                    type="button"
                    class="cfg-eye-btn"
                    @click="revealed.imgbbKey = !revealed.imgbbKey"
                  >
                    {{ revealed.imgbbKey ? 'Ẩn' : 'Hiện' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- DETAILED IMGBB USAGE MAP -->
            <div class="cfg-usage-block">
              <div class="cfg-usage-header">
                <div>
                  <div class="cfg-usage-title">
                    📍 Bản đồ chi tiết: ImgBB đang được dùng ở {{ imgbbUsageMap.length }} trang &amp; các nút cụ thể
                  </div>
                </div>
              </div>

              <div class="cfg-usage-list">
                <div
                  v-for="(u, idx) in imgbbUsageMap"
                  :key="u.route + idx"
                  class="cfg-usage-item"
                >
                  <div class="cfg-usage-item-head">
                    <div class="cfg-usage-page">
                      <span class="cfg-usage-idx mono-num">{{ String(idx + 1).padStart(2, '0') }}</span>
                      <strong>{{ u.pageName }}</strong>
                      <code class="cfg-file-tag mono-num">{{ u.componentFile }}</code>
                    </div>
                    <router-link :to="u.route" class="cfg-route-link mono-num">
                      {{ u.route }} ↗
                    </router-link>
                  </div>
                  <ul class="cfg-usage-btns">
                    <li v-for="(btn, bIdx) in u.buttons" :key="bIdx">
                      <span class="cfg-btn-chip">{{ btn.buttonLabel }}</span>
                      <span class="cfg-btn-purpose">— {{ btn.description }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- =========================================================
             TAB 4: AI & OCR (DOLA VISION & DEEPSEEK - BYTEPLUS ARK)
             ========================================================= -->
        <div v-show="activeTab === 'ai'" class="cfg-section-stack">
          <!-- DOLA VISION -->
          <div class="cfg-card">
            <div class="cfg-card-head">
              <div>
                <h2 class="cfg-card-title">04A. Dola Vision AI (Đọc OCR Ảnh Bảng Giá, PDF Mua Hàng, Thông Tin Thuế)</h2>
                <p class="cfg-card-sub">
                  Áp dụng cho <code>src/services/dolaApi.ts</code> và trình đọc chứng từ <code>universalDocumentReader.ts</code>.
                </p>
              </div>
              <div class="cfg-head-btns">
                <button
                  type="button"
                  class="cfg-btn cfg-btn-sky"
                  :disabled="testingService === 'dola'"
                  @click="testDolaKey"
                >
                  {{ testingService === 'dola' ? 'Đang ping AI...' : '⚡ Test Key Dola' }}
                </button>
              </div>
            </div>

            <div
              v-if="testResults.dola"
              class="cfg-banner"
              :class="testResults.dola.ok ? 'banner-emerald' : 'banner-rose'"
            >
              <div>
                <strong>{{ testResults.dola.ok ? '✅ Dola Vision phản hồi OK:' : '❌ Lỗi Dola Vision:' }}</strong>
                <span> {{ testResults.dola.message }}</span>
              </div>
            </div>

            <div class="cfg-form-grid-2">
              <div class="cfg-field">
                <label class="cfg-label">MODEL ID</label>
                <input
                  v-model.trim="draft.ai.dolaModel"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="seed-2-0-pro-260328"
                />
              </div>

              <div class="cfg-field">
                <label class="cfg-label">API ENDPOINT</label>
                <input
                  v-model.trim="draft.ai.dolaApiUrl"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="/byteplus-api/api/v3/responses"
                />
              </div>

              <div class="cfg-field cfg-field-full">
                <label class="cfg-label">DOLA BEARER API KEY</label>
                <div class="cfg-secret-wrap">
                  <input
                    v-model.trim="draft.ai.dolaApiKey"
                    :type="revealed.dolaKey ? 'text' : 'password'"
                    class="cfg-input mono-num"
                    placeholder="Bearer Token..."
                  />
                  <button
                    type="button"
                    class="cfg-eye-btn"
                    @click="revealed.dolaKey = !revealed.dolaKey"
                  >
                    {{ revealed.dolaKey ? 'Ẩn' : 'Hiện' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- DEEPSEEK AI -->
          <div class="cfg-card">
            <div class="cfg-card-head">
              <div>
                <h2 class="cfg-card-title">04B. DeepSeek AI (Phân Tích Văn Bản, Bóc Tách License &amp; Trợ Lý Báo Giá)</h2>
                <p class="cfg-card-sub">
                  Áp dụng cho <code>src/services/deepseek.ts</code> trên toàn bộ các trang Tạo Báo Giá, Quản Lý Hàng Hóa, License, Mẫu In.
                </p>
              </div>
              <div class="cfg-head-btns">
                <button
                  type="button"
                  class="cfg-btn cfg-btn-sky"
                  :disabled="testingService === 'deepseek'"
                  @click="testDeepSeekKey"
                >
                  {{ testingService === 'deepseek' ? 'Đang ping AI...' : '⚡ Test Key DeepSeek' }}
                </button>
              </div>
            </div>

            <div
              v-if="testResults.deepseek"
              class="cfg-banner"
              :class="testResults.deepseek.ok ? 'banner-emerald' : 'banner-rose'"
            >
              <div>
                <strong>{{ testResults.deepseek.ok ? '✅ DeepSeek phản hồi OK:' : '❌ Lỗi DeepSeek:' }}</strong>
                <span> {{ testResults.deepseek.message }}</span>
              </div>
            </div>

            <div class="cfg-form-grid-2">
              <div class="cfg-field">
                <label class="cfg-label">MODEL ID</label>
                <input
                  v-model.trim="draft.ai.deepseekModel"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="deepseek-v4-pro-ga-260813"
                />
              </div>

              <div class="cfg-field">
                <label class="cfg-label">API ENDPOINT</label>
                <input
                  v-model.trim="draft.ai.deepseekApiUrl"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="/byteplus-api/api/v3/chat/completions"
                />
              </div>

              <div class="cfg-field cfg-field-full">
                <label class="cfg-label">DEEPSEEK BEARER API KEY</label>
                <div class="cfg-secret-wrap">
                  <input
                    v-model.trim="draft.ai.deepseekApiKey"
                    :type="revealed.deepseekKey ? 'text' : 'password'"
                    class="cfg-input mono-num"
                    placeholder="Bearer Token..."
                  />
                  <button
                    type="button"
                    class="cfg-eye-btn"
                    @click="revealed.deepseekKey = !revealed.deepseekKey"
                  >
                    {{ revealed.deepseekKey ? 'Ẩn' : 'Hiện' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- =========================================================
             TAB 5: ZALO BOT & CONFIG BACKUP / RESTORE
             ========================================================= -->
        <div v-show="activeTab === 'backup'" class="cfg-section-stack">
          <!-- ZALO BOT RUNTIME -->
          <div class="cfg-card">
            <div class="cfg-card-head">
              <div>
                <h2 class="cfg-card-title">05A. Zalo Bot Mặc Định &amp; Cơ Chế An Toàn Khi Chạy Mock</h2>
                <p class="cfg-card-sub">
                  Token mặc định cho <code>zaloBotService.js</code>. Để chỉnh lịch hẹn &amp; nhóm nhận chi tiết, bạn vẫn dùng trang
                  <router-link to="/zalo-bot-config" class="cfg-inline-link">Cấu hình Zalo Bot ↗</router-link>.
                </p>
              </div>
            </div>

            <label class="cfg-switch-row" style="margin-bottom: 14px">
              <div class="cfg-switch-info">
                <div class="cfg-switch-title">
                  Tự động tạm dừng Zalo Bot chạy ngầm khi đang bật chế độ Mock JSON (Khuyên bật)
                </div>
                <div class="cfg-switch-desc">
                  Ngăn bot tự động bắn tin nhắn thông báo công nợ / tạo khách hàng thử nghiệm vào nhóm Zalo thật của công ty trong lúc bạn đang test trên Mock Data. (Ngoài ra hệ thống cũng đã tự chặn Zalo Bot chạy khi chưa đăng nhập).
                </div>
              </div>
              <input
                v-model="draft.zaloBot.pauseInMockMode"
                type="checkbox"
                class="cfg-checkbox"
              />
            </label>

            <div class="cfg-form-grid-2">
              <div class="cfg-field cfg-field-full">
                <label class="cfg-label">DEFAULT ZALO BOT TOKEN</label>
                <div class="cfg-secret-wrap">
                  <input
                    v-model.trim="draft.zaloBot.defaultBotToken"
                    :type="revealed.zaloToken ? 'text' : 'password'"
                    class="cfg-input mono-num"
                    placeholder="1563589356003514094:..."
                  />
                  <button
                    type="button"
                    class="cfg-eye-btn"
                    @click="revealed.zaloToken = !revealed.zaloToken"
                  >
                    {{ revealed.zaloToken ? 'Ẩn' : 'Hiện' }}
                  </button>
                </div>
              </div>

              <div class="cfg-field cfg-field-full">
                <label class="cfg-label">LINK MỜI BOT VÀO NHÓM MẶC ĐỊNH</label>
                <input
                  v-model.trim="draft.zaloBot.defaultInviteUrl"
                  type="text"
                  class="cfg-input mono-num"
                  placeholder="https://bot.zaloplatforms.com/groups/invite/..."
                />
              </div>
            </div>
          </div>

          <!-- QUICK BADGE & CONFIG EXPORT / IMPORT -->
          <div class="cfg-card">
            <div class="cfg-card-head">
              <div>
                <h2 class="cfg-card-title">05B. Hiển Thị Nhãn Gạt Nhanh &amp; Sao Lưu File Cài Đặt</h2>
                <p class="cfg-card-sub">
                  Trên máy local, mọi cấu hình được lưu kép vào file <code>system.config.local.json</code> (đã ẩn trong <code>.gitignore</code>) và <code>localStorage</code>.
                </p>
              </div>
            </div>

            <label v-if="isLocalHost" class="cfg-switch-row" style="margin-bottom: 16px">
              <div class="cfg-switch-info">
                <div class="cfg-switch-title">
                  Hiển thị nhãn gạt nhanh (<code>🟢 MOCK ⇄ 🔴 DB THẬT</code>) ở góc dưới màn hình Localhost
                </div>
                <div class="cfg-switch-desc">
                  Giúp bạn luôn nhìn thấy mình đang thao tác trên dữ liệu Mock hay DB Thật ở bất kỳ trang nào và bấm gạt đổi nguồn chỉ với 1 click.
                </div>
              </div>
              <input
                v-model="draft.ui.showQuickBadge"
                type="checkbox"
                class="cfg-checkbox"
              />
            </label>

            <div class="cfg-action-bar">
              <input
                ref="configFileInputRef"
                type="file"
                accept=".json,application/json"
                style="display: none"
                @change="handleImportConfigFile"
              />
              <button
                type="button"
                class="cfg-btn cfg-btn-emerald"
                @click="handleExportConfigFile"
              >
                ⬇ Xuất file Cấu hình (.json)
              </button>

              <button
                type="button"
                class="cfg-btn cfg-btn-sky"
                @click="triggerImportConfigFile"
              >
                ⬆ Nhập file Cấu hình (.json)
              </button>

              <button
                type="button"
                class="cfg-btn cfg-btn-danger-hover"
                @click="handleRestoreDefaultKeys"
              >
                ↺ Khôi phục toàn bộ Key mặc định ban đầu
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- MOBILE STICKY BOTTOM SAVE DOCK -->
    <div
      class="cfg-mobile-dock"
      :class="{ 'is-modal-hidden': confirmDialog.show }"
    >
      <button
        type="button"
        class="cfg-btn cfg-btn-emerald"
        :disabled="isSaving"
        @click="handleSaveAll(false)"
      >
        {{ isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình' }}
      </button>
      <button
        type="button"
        class="cfg-btn cfg-btn-sky"
        :disabled="isSaving"
        @click="handleSaveAll(true)"
      >
        Lưu &amp; Tải lại
      </button>
    </div>

    <!-- UNIFIED PROMISE CONFIRM DIALOG (z-index: 1000085) -->
    <Teleport to="body">
      <div
        v-if="confirmDialog.show"
        class="cfg-dialog-overlay"
        :class="{ 'theme-light-blue': draft.ui.theme === 'light' }"
        @click.self="resolveConfirm(false)"
      >
        <div class="cfg-dialog-card" :class="`variant-${confirmDialog.variant}`">
          <div class="cfg-dialog-head">
            <span class="cfg-dialog-badge">
              {{ confirmDialog.variant === 'danger' ? 'CẢNH BÁO THAO TÁC' : 'XÁC NHẬN HỆ THỐNG' }}
            </span>
            <h3 class="cfg-dialog-title">{{ confirmDialog.title }}</h3>
          </div>
          <div class="cfg-dialog-body">
            <p class="cfg-dialog-msg">{{ confirmDialog.message }}</p>
            <div v-if="confirmDialog.subNote" class="cfg-dialog-note">
              {{ confirmDialog.subNote }}
            </div>
          </div>
          <div class="cfg-dialog-foot">
            <button
              ref="cancelBtnRef"
              type="button"
              class="cfg-btn cfg-btn-slate"
              @click="resolveConfirm(false)"
            >
              {{ confirmDialog.cancelText }}
            </button>
            <button
              type="button"
              class="cfg-btn"
              :class="confirmDialog.variant === 'danger' ? 'cfg-btn-rose-solid' : 'cfg-btn-sky'"
              @click="resolveConfirm(true)"
            >
              {{ confirmDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- SINGLE-MERGED SMART TOAST (z-index: 2000000) -->
    <Teleport to="body">
      <div
        v-if="toast.visible"
        class="cfg-smart-toast-layer"
        :class="{ 'theme-light-blue': draft.ui.theme === 'light' }"
      >
        <div
          class="cfg-smart-toast"
          :class="[`toast-${toast.variant}`, { 'toast-pulse': toast.pulsing }]"
          @mouseenter="pauseToastTimer"
          @mouseleave="resumeToastTimer"
          @click="dismissToast"
          @touchstart.passive="onToastTouchStart"
          @touchend.passive="onToastTouchEnd"
        >
          <span class="cfg-toast-icon">
            <template v-if="toast.variant === 'success'">✓</template>
            <template v-else-if="toast.variant === 'warning'">!</template>
            <template v-else-if="toast.variant === 'error'">✕</template>
            <template v-else>i</template>
          </span>
          <span class="cfg-toast-text">{{ toast.message }}</span>
          <span v-if="toast.repeatCount > 1" class="cfg-toast-repeat mono-num">
            ×{{ toast.repeatCount }}
          </span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  useSystemConfig,
  useCloudSyncMeta,
  syncSystemConfigWithCloud,
  saveSystemConfig,
  cloneDefaultConfig,
  mergeSystemConfig,
  isLocalDevHost,
  hasAuthSession,
  isMockDbActive,
  parseFirebaseConfigSnippet,
  type SystemConfig
} from '../services/systemConfig'

interface MockTableStat {
  name: string
  count: number
  bytes: number
  sizeMB: number
}

interface MockStatsResponse {
  ok: boolean
  activeSource: 'draft' | 'base' | 'empty'
  mutationCount: number
  totalTables: number
  totalMemMB: number
  baseFile: {
    path: string
    exists: boolean
    sizeMB: number
    updatedAt: string | null
  }
  draftFile: {
    path: string
    exists: boolean
    sizeMB: number
    updatedAt: string | null
  }
  tables: MockTableStat[]
}

interface UsageButtonEntry {
  buttonLabel: string
  description: string
}

interface UsagePageEntry {
  pageName: string
  route: string
  componentFile: string
  buttons: UsageButtonEntry[]
}

const router = useRouter()
const sysConfig = useSystemConfig()
const cloudMeta = useCloudSyncMeta()
const isLocalHost = isLocalDevHost()
const isLoggedIn = computed(() => hasAuthSession())
const effectiveMockActive = computed(() => isMockDbActive())
const hostLabel = typeof window !== 'undefined' ? window.location.host : 'local'

type TabId = 'db' | 'firebase' | 'storage' | 'ai' | 'backup'
const activeTab = ref<TabId>('db')

const navTabs: { id: TabId; num: string; label: string; shortLabel: string; desc: string }[] = [
  {
    id: 'db',
    num: '01',
    label: 'Chế độ DB & Mock JSON',
    shortLabel: 'Mock / DB',
    desc: 'Gạt Mock 43.4MB ⇄ DB thật'
  },
  {
    id: 'firebase',
    num: '02',
    label: 'Firebase Realtime DB',
    shortLabel: 'Firebase',
    desc: 'Database URL & API Key'
  },
  {
    id: 'storage',
    num: '03',
    label: 'Cloudinary & ImgBB',
    shortLabel: 'Lưu trữ File',
    desc: 'Key upload & Bản đồ nút dùng'
  },
  {
    id: 'ai',
    num: '04',
    label: 'AI & OCR (Dola / DeepSeek)',
    shortLabel: 'AI & OCR',
    desc: 'BytePlus Vision & Chat Key'
  },
  {
    id: 'backup',
    num: '05',
    label: 'Zalo Bot & Sao lưu Config',
    shortLabel: 'Zalo & Backup',
    desc: 'An toàn Mock & Xuất/Nhập'
  }
]

const draft = reactive<SystemConfig>(mergeSystemConfig(JSON.parse(JSON.stringify(sysConfig))))
if (!isLocalHost) {
  draft.dbMode = 'live'
}

const revealed = reactive({
  firebaseApiKey: false,
  imgbbKey: false,
  dolaKey: false,
  deepseekKey: false,
  zaloToken: false
})

const isSaving = ref(false)
const firebaseSnippet = ref('')
const tableSearch = ref('')
const cloudinaryUsageSearch = ref('')

// ─── Complete Cloudinary & ImgBB Usage Maps across the entire codebase ───
const cloudinaryUsageMap: UsagePageEntry[] = [
  {
    pageName: 'Tạo Báo Giá Firebase',
    route: '/baogiafirebase',
    componentFile: 'baogiaFirebase.vue',
    buttons: [
      {
        buttonLabel: 'CHỐT DEAL & SALE REPORT',
        description:
          'Trong modal Lưu báo giá: Tự động xuất file Excel báo giá (.xlsx) và tải lên Cloudinary để gắn link vào Hợp đồng & Sale Report.'
      },
      {
        buttonLabel: '+ Tải File / Ảnh (PC) & + Tải lên (Mobile)',
        description:
          'Tại hộp "File / Ảnh báo giá" trong form Thêm sản phẩm thủ công & modal Sửa chi tiết sản phẩm: Upload file PDF/Excel/Ảnh báo giá vào lịch sử giá SP & đọc giá tự động.'
      },
      {
        buttonLabel: 'Tải lên mẫu Excel tùy chỉnh',
        description:
          'Trong phần thiết lập mẫu xuất Excel (upload_file_mau): Upload file mẫu .xlsx lên Cloudinary.'
      }
    ]
  },
  {
    pageName: 'Quản Lý Hàng Hóa Firebase',
    route: '/quanlyhanghoafirebase',
    componentFile: 'QuanLyHangHoaFirebase.vue + vendorRefCloudinary.ts',
    buttons: [
      {
        buttonLabel: 'Import Mức Off',
        description:
          'Thanh công cụ đầu trang: Upload file Ảnh / PDF bảng mức chiết khấu hãng (lưu vào bảng file_gia_off).'
      },
      {
        buttonLabel: 'Import Mua Hàng (Giá vốn)',
        description:
          'Thanh công cụ đầu trang: Upload file PDF / Excel báo giá mua hàng để bóc tách giá vốn sau thuế.'
      },
      {
        buttonLabel: 'Cụm Upload File Gốc / Trung Gian / SKU List / Mẫu Import (Sophos, Kaspersky, Acronis)',
        description:
          'Upload file bảng giá Excel (.xlsx, .xlsb — tự nén ZIP nếu >9.5MB) và file JSON chỉ mục tra cứu (*_ref_index.json) lên Cloudinary.'
      },
      {
        buttonLabel: 'Quét ảnh đối chiếu giá Sophos / Kaspersky',
        description:
          'Khi chọn ảnh hoặc Ctrl+V dán ảnh chụp bảng giá để kiểm tra chênh lệch giá với file gốc.'
      },
      {
        buttonLabel: '☁️ + Up File / Ảnh kèm giá này & ☁️ + Upload thêm File / Ảnh cho SP này',
        description:
          'Trong modal Thêm/Sửa hàng hóa và modal Lịch sử File của từng mã hàng.'
      }
    ]
  },
  {
    pageName: 'Báo Cáo Công Việc Firebase',
    route: '/report-firebase',
    componentFile: 'Firebase_change/reportFIREBASE.vue',
    buttons: [
      {
        buttonLabel: 'File Báo Giá',
        description:
          'Trong form Tạo / Sửa báo cáo công việc: Upload các file Excel (.xlsx, .xls) báo giá đính kèm.'
      },
      {
        buttonLabel: 'File Mua Hàng',
        description:
          'Trong form Tạo / Sửa báo cáo công việc: Upload các file Excel (.xlsx, .xls) đề xuất mua hàng đính kèm.'
      }
    ]
  },
  {
    pageName: 'Sale Report Firebase',
    route: '/sale-report-firebase',
    componentFile: 'SaleReportFirebase.vue',
    buttons: [
      {
        buttonLabel: 'Thêm file / Đổi file (File Báo giá, File Mua hàng, File ĐXMH & Ảnh)',
        description:
          'Trong modal chi tiết đơn Sale Report: Khi bấm Lưu đơn, toàn bộ file Excel/PDF báo giá, mua hàng, ĐXMH mới đính kèm được đẩy lên Cloudinary.'
      }
    ]
  },
  {
    pageName: 'Quản Lý Báo Giá Firebase',
    route: '/quanlybaogiafirebase',
    componentFile: 'QuanLyBaoGiaFirebase.vue',
    buttons: [
      {
        buttonLabel: 'Upload (Hộp File đính kèm)',
        description:
          'Trong khung chi tiết Hợp đồng / Báo giá: Đính kèm bổ sung file PDF, Excel, hợp đồng scan vào hồ sơ báo giá.'
      }
    ]
  },
  {
    pageName: 'Pipeline & Modal Xem Trước PO',
    route: '/pipeline-firebase',
    componentFile: 'PipelineFirebase.vue + PipelinePreviewModal.vue',
    buttons: [
      {
        buttonLabel: 'Ô chọn / kéo thả File đính kèm thẻ Pipeline',
        description:
          'Trong modal Tạo / Chỉnh sửa cơ hội kinh doanh (Pipeline): Tải tài liệu đính kèm lên Cloudinary.'
      },
      {
        buttonLabel: 'Xác nhận Lưu Hợp đồng / PO & Chốt Sale Report',
        description:
          'Trong modal PipelinePreviewModal: Tự động tải file Excel báo giá/PO của cơ hội lên Cloudinary.'
      }
    ]
  },
  {
    pageName: 'Thiết Lập Mẫu In Báo Giá / Hợp Đồng',
    route: '/mau-in-firebase',
    componentFile: 'QuanLyMauInFirebase.vue',
    buttons: [
      {
        buttonLabel: 'Upload Logo (Thanh Ribbon)',
        description: 'Nút tải nhanh ảnh Logo công ty trên thanh công cụ thiết kế mẫu in.'
      },
      {
        buttonLabel: 'Đổi Logo & Tải Logo mới lên (Cloudinary)',
        description:
          'Nút nổi trực tiếp trên khung Logo trang in và nút trong modal "Cấu hình Trang in, Logo & Thông tin Người lập".'
      }
    ]
  },
  {
    pageName: 'License Khách Hàng (Dữ Liệu Bản Quyền)',
    route: '/license-old-data-firebase',
    componentFile: 'ImportLicenseFirebaseModal.vue + ImportPDFFirebaseModal.vue',
    buttons: [
      {
        buttonLabel: 'Import Ảnh License & Import PDF License',
        description:
          'Khi chọn file ảnh hoặc PDF chứng nhận bản quyền để đọc OCR và lưu hồ sơ License, file gốc được tải lên Cloudinary.'
      }
    ]
  },
  {
    pageName: 'Kho Lưu Trữ Tài Liệu Firebase',
    route: '/kho-luu-tru-firebase',
    componentFile: 'KhoLuuTruFirebase.vue',
    buttons: [
      {
        buttonLabel: 'Tải file lên (Modal Upload / Kéo thả file)',
        description:
          'Tải các tài liệu, biểu mẫu, hợp đồng lưu trữ chung lên thư mục trên Kho Lưu Trữ.'
      }
    ]
  },
  {
    pageName: 'Quản Lý File Tổng Hợp',
    route: '/quan-ly-file',
    componentFile: 'QuanLyFile.vue',
    buttons: [
      {
        buttonLabel: 'Tải file lên & Đính kèm File Báo Giá / Mua Hàng / Ảnh (Craft Sale Report)',
        description:
          'Các nút tải file trực tiếp và lưu chứng từ trong modal chỉnh sửa nhanh hồ sơ Craft Sale Report.'
      }
    ]
  }
]

const imgbbUsageMap: UsagePageEntry[] = [
  {
    pageName: 'Báo Cáo Công Việc Firebase (Đang dùng chính)',
    route: '/report-firebase',
    componentFile: 'Firebase_change/reportFIREBASE.vue',
    buttons: [
      {
        buttonLabel: 'Tải Ảnh',
        description:
          'Nút chọn một hoặc nhiều file ảnh trong form Tạo / Chỉnh sửa báo cáo công việc (lưu link vào trường img_save).'
      },
      {
        buttonLabel: 'Dán ảnh Ctrl + V trong ô "Mô tả chi tiết nội dung báo cáo"',
        description:
          'Khi chụp màn hình và bấm Ctrl+V trực tiếp vào ô nội dung báo cáo, ảnh trong Clipboard tự động tải lên ImgBB.'
      }
    ]
  },
  {
    pageName: 'Báo Cáo Công Việc & Sale Report (Phân hệ cũ)',
    route: '/report',
    componentFile: 'report.vue + SaleReport.vue',
    buttons: [
      {
        buttonLabel: 'Nút Tải Ảnh & Dán Ctrl + V (report.vue)',
        description: 'Tải ảnh đính kèm báo cáo ở trang Báo cáo phiên bản cũ.'
      },
      {
        buttonLabel: 'Nút Lưu kèm Ảnh đính kèm đơn hàng (SaleReport.vue)',
        description:
          'Trang /sale-report bản cũ dùng ImgBB cho ảnh đơn hàng (bản mới /sale-report-firebase đã đồng bộ sang Cloudinary).'
      }
    ]
  }
]

const filteredCloudinaryUsage = computed(() => {
  const q = cloudinaryUsageSearch.value.trim().toLowerCase()
  if (!q) return cloudinaryUsageMap
  return cloudinaryUsageMap.filter((u) => {
    const blob = `${u.pageName} ${u.route} ${u.componentFile} ${u.buttons
      .map((b) => `${b.buttonLabel} ${b.description}`)
      .join(' ')}`.toLowerCase()
    return blob.includes(q)
  })
})

// ─── Mock Stats State ───
const mockStats = ref<MockStatsResponse | null>(null)
const loadingStats = ref(false)
const busyMockAction = ref(false)
const mockJsonInputRef = ref<HTMLInputElement | null>(null)
const configFileInputRef = ref<HTMLInputElement | null>(null)

const totalMockBytes = computed(() =>
  (mockStats.value?.tables || []).reduce((sum, t) => sum + t.bytes, 0)
)
const totalMockRecords = computed(() =>
  (mockStats.value?.tables || []).reduce((sum, t) => sum + t.count, 0)
)
const filteredMockTables = computed(() => {
  const list = mockStats.value?.tables || []
  const q = tableSearch.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((t) => t.name.toLowerCase().includes(q))
})

async function fetchMockStats(): Promise<void> {
  if (!isLocalHost) return
  loadingStats.value = true
  try {
    const res = await window.fetch('/__mock_rtdb/stats', { cache: 'no-store' })
    if (res.ok) {
      mockStats.value = await res.json()
    }
  } catch {
    // ignore when not running vite dev server
  } finally {
    loadingStats.value = false
  }
}

// ─── Single-Merged Smart Toast ───
type ToastVariant = 'success' | 'warning' | 'error' | 'info'
const toast = reactive({
  visible: false,
  message: '',
  variant: 'info' as ToastVariant,
  repeatCount: 1,
  pulsing: false
})
let toastTimer: ReturnType<typeof setTimeout> | null = null
let toastRemainingMs = 2800
let toastStartTs = 0
let touchStartY = 0

function showToast(message: string, variant: ToastVariant = 'info'): void {
  if (toast.visible && toast.message === message && toast.variant === variant) {
    toast.repeatCount++
    toast.pulsing = false
    nextTick(() => {
      toast.pulsing = true
    })
  } else {
    toast.message = message
    toast.variant = variant
    toast.repeatCount = 1
    toast.visible = true
    toast.pulsing = false
  }

  const baseDuration =
    variant === 'error'
      ? 4800
      : variant === 'warning'
        ? 3600
        : Math.min(4200, Math.max(2300, 1600 + message.length * 26))

  toastRemainingMs = baseDuration
  startToastCountdown(baseDuration)
}

function startToastCountdown(ms: number): void {
  if (toastTimer) clearTimeout(toastTimer)
  toastStartTs = Date.now()
  toastTimer = setTimeout(() => {
    toast.visible = false
    toastTimer = null
  }, ms)
}

function pauseToastTimer(): void {
  if (!toastTimer) return
  clearTimeout(toastTimer)
  toastTimer = null
  const elapsed = Date.now() - toastStartTs
  toastRemainingMs = Math.max(800, toastRemainingMs - elapsed)
}

function resumeToastTimer(): void {
  if (!toast.visible || toastTimer) return
  startToastCountdown(toastRemainingMs)
}

function dismissToast(): void {
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = null
  toast.visible = false
}

function onToastTouchStart(ev: TouchEvent): void {
  touchStartY = ev.touches[0]?.clientY || 0
}

function onToastTouchEnd(ev: TouchEvent): void {
  const endY = ev.changedTouches[0]?.clientY || 0
  if (endY - touchStartY < -18) {
    dismissToast()
  }
}

// ─── Unified Promise Confirm Dialog ───
const cancelBtnRef = ref<HTMLButtonElement | null>(null)
const confirmDialog = reactive({
  show: false,
  variant: 'info' as 'info' | 'danger',
  title: '',
  message: '',
  subNote: '',
  confirmText: 'Đồng ý',
  cancelText: 'Hủy bỏ'
})
let confirmResolver: ((ok: boolean) => void) | null = null

function askConfirm(opts: {
  variant?: 'info' | 'danger'
  title: string
  message: string
  subNote?: string
  confirmText?: string
  cancelText?: string
}): Promise<boolean> {
  confirmDialog.variant = opts.variant || 'info'
  confirmDialog.title = opts.title
  confirmDialog.message = opts.message
  confirmDialog.subNote = opts.subNote || ''
  confirmDialog.confirmText = opts.confirmText || 'Xác nhận'
  confirmDialog.cancelText = opts.cancelText || 'Hủy'
  confirmDialog.show = true

  if (confirmDialog.variant === 'danger') {
    nextTick(() => {
      cancelBtnRef.value?.focus()
    })
  }

  return new Promise<boolean>((resolve) => {
    confirmResolver = resolve
  })
}

function resolveConfirm(accepted: boolean): void {
  confirmDialog.show = false
  const fn = confirmResolver
  confirmResolver = null
  if (fn) fn(accepted)
}

// ─── Core Actions ───
function goBackToLogin(): void {
  router.push('/login')
}

function toggleTheme(): void {
  draft.ui.theme = draft.ui.theme === 'dark' ? 'light' : 'dark'
}

function selectDbMode(mode: 'mock' | 'live'): void {
  if (mode === 'mock' && !isLocalHost) return
  draft.dbMode = mode
}

function applyFirebaseSnippet(): void {
  const extracted = parseFirebaseConfigSnippet(firebaseSnippet.value)
  const keys = Object.keys(extracted) as (keyof typeof extracted)[]
  if (!keys.length) {
    showToast('Không tìm thấy trường firebaseConfig hợp lệ trong đoạn văn bản đã dán.', 'warning')
    return
  }
  Object.assign(draft.firebase, extracted)
  firebaseSnippet.value = ''
  showToast(`Đã bóc tách tự động ${keys.length} trường cấu hình Firebase!`, 'success')
}

async function handleSaveAll(shouldReload: boolean): Promise<void> {
  isSaving.value = true
  try {
    const payload: Partial<SystemConfig> = JSON.parse(JSON.stringify(draft))
    if (!isLocalHost) {
      payload.dbMode = 'live'
    }
    const { savedToDisk, syncedToCloud } = await saveSystemConfig(payload)
    if (shouldReload) {
      showToast(
        syncedToCloud
          ? 'Đã lưu & tự đồng bộ Cloud! Đang tải lại ứng dụng...'
          : 'Đã lưu cấu hình! Đang tải lại ứng dụng...',
        'success'
      )
      setTimeout(() => {
        window.location.reload()
      }, 350)
      return
    }
    if (syncedToCloud && savedToDisk) {
      showToast('Đã lưu Local & tự động đồng bộ Key lên Cloud cho mọi thiết bị!', 'success')
    } else if (syncedToCloud) {
      showToast('Đã lưu & tự động đồng bộ Key lên Cloud cho mọi thiết bị!', 'success')
    } else if (savedToDisk) {
      showToast('Đã lưu Local (sẽ tự động đẩy lên Cloud khi chuyển sang DB Thật)!', 'success')
    } else {
      showToast('Đã lưu cấu hình vào trình duyệt!', 'success')
    }
  } catch (err: any) {
    showToast(`Lỗi lưu cấu hình: ${err?.message || String(err)}`, 'error')
  } finally {
    isSaving.value = false
  }
}

// ─── Mock Data Operations ───
function triggerPickBaseMockJson(): void {
  mockJsonInputRef.value?.click()
}

async function handleImportNewBaseMock(ev: Event): Promise<void> {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const ok = await askConfirm({
    variant: 'danger',
    title: 'Nạp file Mock JSON gốc mới?',
    message: `Hệ thống sẽ thay thế kho Mock bằng file "${file.name}" (${(
      file.size /
      1024 /
      1024
    ).toFixed(2)} MB) và xóa bản nháp mockdata.local.json cũ.`,
    subNote: 'Nếu bạn có chỉnh sửa quan trọng trong bản nháp hiện tại, hãy bấm "Tải bản Mock hiện tại về máy" trước.',
    confirmText: 'Nạp file mới',
    cancelText: 'Hủy'
  })
  if (!ok) return

  busyMockAction.value = true
  try {
    const res = await window.fetch('/__mock_rtdb/import-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: file
    })
    const json = await res.json()
    if (!res.ok || !json.ok) {
      throw new Error(json?.error || `HTTP ${res.status}`)
    }
    mockStats.value = json
    showToast(`Đã nạp thành công "${file.name}" (${json.totalTables} bảng)!`, 'success')
  } catch (err: any) {
    showToast(`Không thể nạp file JSON: ${err?.message || String(err)}`, 'error')
  } finally {
    busyMockAction.value = false
  }
}

function handleDownloadWorkingMock(): void {
  window.open('/__mock_rtdb/export', '_blank')
  showToast('Đang xuất file JSON toàn bộ dữ liệu Mock hiện tại...', 'info')
}

async function handleResetMockToOriginal(): Promise<void> {
  const ok = await askConfirm({
    variant: 'danger',
    title: 'Khôi phục về file mockdata.json gốc?',
    message:
      'Toàn bộ dữ liệu bạn đã Thêm / Sửa / Xóa tạm thời trong mockdata.local.json sẽ bị xóa để quay về đúng nguyên trạng file mockdata.json ban đầu.',
    subNote: 'File mockdata.json gốc (43.4 MB) vẫn an toàn 100%.',
    confirmText: 'Xóa bản nháp & Reset',
    cancelText: 'Giữ lại'
  })
  if (!ok) return

  busyMockAction.value = true
  try {
    const res = await window.fetch('/__mock_rtdb/reset', { method: 'POST' })
    const json = await res.json()
    if (!res.ok || !json.ok) {
      throw new Error(json?.error || `HTTP ${res.status}`)
    }
    mockStats.value = json
    showToast('Đã khôi phục kho Mock về đúng dữ liệu mockdata.json gốc!', 'success')
  } catch (err: any) {
    showToast(`Lỗi khi reset Mock DB: ${err?.message || String(err)}`, 'error')
  } finally {
    busyMockAction.value = false
  }
}

// ─── Connection Health Pings ───
type ServiceKey = 'firebase' | 'cloudinary' | 'imgbb' | 'dola' | 'deepseek'
const testingService = ref<ServiceKey | null>(null)
const testResults = reactive<Record<ServiceKey, { ok: boolean; message: string } | null>>({
  firebase: null,
  cloudinary: null,
  imgbb: null,
  dola: null,
  deepseek: null
})

async function testFirebaseConnection(): Promise<void> {
  const dbUrl = (draft.firebase.databaseURL || '').trim().replace(/\/+$/, '')
  if (!dbUrl || !dbUrl.startsWith('https://')) {
    testResults.firebase = {
      ok: false,
      message: 'Vui lòng nhập Database URL hợp lệ bắt đầu bằng https://'
    }
    return
  }

  testingService.value = 'firebase'
  testResults.firebase = null
  const t0 = performance.now()
  try {
    // shallow=true only checks top-level key existence (~30 bytes), zero bandwidth waste!
    const res = await window.fetch(`${dbUrl}/password.json?shallow=true`, {
      method: 'GET',
      headers: { 'X-Sonai-Direct-Test': '1' },
      cache: 'no-store'
    })
    const ms = Math.round(performance.now() - t0)
    if (res.ok) {
      testResults.firebase = {
        ok: true,
        message: `Database phản hồi bình thường sau ${ms} ms (chỉ tốn < 50 bytes kiểm tra shallow).`
      }
      showToast('Kết nối Firebase Thật hoạt động tốt!', 'success')
    } else {
      const errText = await res.text().catch(() => res.statusText)
      testResults.firebase = {
        ok: false,
        message: `HTTP ${res.status} (${ms} ms) — ${errText.slice(0, 180)}`
      }
      showToast(`Firebase trả lỗi HTTP ${res.status}`, 'error')
    }
  } catch (err: any) {
    testResults.firebase = {
      ok: false,
      message: `Không thể kết nối mạng hoặc bị chặn quota/CORS: ${err?.message || String(err)}`
    }
    showToast('Không thể kết nối tới Firebase URL này.', 'error')
  } finally {
    testingService.value = null
  }
}

async function testCloudinaryUpload(): Promise<void> {
  const cloud = draft.storage.cloudinaryCloudName.trim()
  const preset = draft.storage.cloudinaryUploadPreset.trim()
  if (!cloud || !preset) {
    testResults.cloudinary = {
      ok: false,
      message: 'Vui lòng nhập đủ Cloud Name và Upload Preset.'
    }
    return
  }

  testingService.value = 'cloudinary'
  testResults.cloudinary = null
  const t0 = performance.now()
  try {
    const tinyBlob = new Blob([JSON.stringify({ ping: 'sonai_config_test', ts: Date.now() })], {
      type: 'application/json'
    })
    const fd = new FormData()
    fd.append('upload_preset', preset)
    fd.append('file', tinyBlob, `sonai_ping_${Date.now()}.json`)

    const res = await window.fetch(`https://api.cloudinary.com/v1_1/${cloud}/raw/upload`, {
      method: 'POST',
      headers: { 'X-Sonai-Direct-Test': '1' },
      body: fd
    })
    const data = await res.json().catch(() => ({}))
    const ms = Math.round(performance.now() - t0)
    if (res.ok && data?.secure_url) {
      testResults.cloudinary = {
        ok: true,
        message: `Upload thành công (${ms} ms) → ${data.secure_url}`
      }
      showToast('Cloudinary Cloud Name & Preset hoạt động chuẩn!', 'success')
    } else {
      testResults.cloudinary = {
        ok: false,
        message: data?.error?.message || `HTTP ${res.status} — Kiểm tra lại Cloud Name hoặc bật Unsigned cho Preset.`
      }
      showToast('Test Cloudinary thất bại!', 'error')
    }
  } catch (err: any) {
    testResults.cloudinary = {
      ok: false,
      message: err?.message || String(err)
    }
    showToast('Lỗi mạng khi gọi Cloudinary.', 'error')
  } finally {
    testingService.value = null
  }
}

async function testImgbbUpload(): Promise<void> {
  const key = draft.storage.imgbbApiKey.trim()
  if (!key) {
    testResults.imgbb = { ok: false, message: 'Vui lòng nhập ImgBB API Key.' }
    return
  }

  testingService.value = 'imgbb'
  testResults.imgbb = null
  const t0 = performance.now()
  try {
    // 1x1 transparent PNG base64, auto-expiring after 60s so gallery stays clean
    const onePxBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    const fd = new FormData()
    fd.append('key', key)
    fd.append('image', onePxBase64)

    const res = await window.fetch('https://api.imgbb.com/1/upload?expiration=60', {
      method: 'POST',
      headers: { 'X-Sonai-Direct-Test': '1' },
      body: fd
    })
    const data = await res.json().catch(() => ({}))
    const ms = Math.round(performance.now() - t0)
    if (res.ok && data?.success) {
      testResults.imgbb = {
        ok: true,
        message: `Key hợp lệ (${ms} ms, ảnh test 1px sẽ tự xóa sau 60 giây).`
      }
      showToast('ImgBB API Key hoạt động tốt!', 'success')
    } else {
      testResults.imgbb = {
        ok: false,
        message: data?.error?.message || `HTTP ${res.status} — API Key không hợp lệ.`
      }
      showToast('ImgBB API Key không hợp lệ!', 'error')
    }
  } catch (err: any) {
    testResults.imgbb = { ok: false, message: err?.message || String(err) }
    showToast('Lỗi mạng khi kiểm tra ImgBB.', 'error')
  } finally {
    testingService.value = null
  }
}

async function testDolaKey(): Promise<void> {
  const url = draft.ai.dolaApiUrl.trim()
  const key = draft.ai.dolaApiKey.trim()
  const model = draft.ai.dolaModel.trim()
  if (!url || !key || !model) {
    testResults.dola = { ok: false, message: 'Vui lòng điền đủ Endpoint, Model và API Key.' }
    return
  }

  testingService.value = 'dola'
  testResults.dola = null
  const t0 = performance.now()
  try {
    const res = await window.fetch(url, {
      method: 'POST',
      headers: {
        'X-Sonai-Direct-Test': '1',
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        stream: false,
        input: [{ role: 'user', content: [{ type: 'input_text', text: 'Trả lời đúng 1 từ: OK' }] }]
      })
    })
    const ms = Math.round(performance.now() - t0)
    if (res.ok) {
      testResults.dola = {
        ok: true,
        message: `Model "${model}" phản hồi thành công sau ${ms} ms.`
      }
      showToast('Dola Vision Key hoạt động tốt!', 'success')
    } else {
      const errBody = await res.text().catch(() => res.statusText)
      testResults.dola = {
        ok: false,
        message: `HTTP ${res.status} (${ms} ms) — ${errBody.slice(0, 200)}`
      }
      showToast(`Dola API lỗi HTTP ${res.status}`, 'error')
    }
  } catch (err: any) {
    testResults.dola = { ok: false, message: err?.message || String(err) }
    showToast('Không thể gọi endpoint Dola Vision.', 'error')
  } finally {
    testingService.value = null
  }
}

async function testDeepSeekKey(): Promise<void> {
  const url = draft.ai.deepseekApiUrl.trim()
  const key = draft.ai.deepseekApiKey.trim()
  const model = draft.ai.deepseekModel.trim()
  if (!url || !key || !model) {
    testResults.deepseek = { ok: false, message: 'Vui lòng điền đủ Endpoint, Model và API Key.' }
    return
  }

  testingService.value = 'deepseek'
  testResults.deepseek = null
  const t0 = performance.now()
  try {
    const res = await window.fetch(url, {
      method: 'POST',
      headers: {
        'X-Sonai-Direct-Test': '1',
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        stream: false,
        max_tokens: 12,
        messages: [{ role: 'user', content: 'Trả lời đúng 1 từ: OK' }]
      })
    })
    const ms = Math.round(performance.now() - t0)
    if (res.ok) {
      testResults.deepseek = {
        ok: true,
        message: `Model "${model}" phản hồi thành công sau ${ms} ms.`
      }
      showToast('DeepSeek Key hoạt động tốt!', 'success')
    } else {
      const errBody = await res.text().catch(() => res.statusText)
      testResults.deepseek = {
        ok: false,
        message: `HTTP ${res.status} (${ms} ms) — ${errBody.slice(0, 200)}`
      }
      showToast(`DeepSeek API lỗi HTTP ${res.status}`, 'error')
    }
  } catch (err: any) {
    testResults.deepseek = { ok: false, message: err?.message || String(err) }
    showToast('Không thể gọi endpoint DeepSeek.', 'error')
  } finally {
    testingService.value = null
  }
}

// ─── Export / Import / Restore System Config JSON ───
function handleExportConfigFile(): void {
  const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`
  a.href = url
  a.download = `sonai-system-config-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('Đã tải xuống file cấu hình hệ thống (.json)!', 'success')
}

function triggerImportConfigFile(): void {
  configFileInputRef.value?.click()
}

async function handleImportConfigFile(ev: Event): Promise<void> {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const merged = mergeSystemConfig(parsed)
    if (!isLocalHost) merged.dbMode = 'live'

    Object.assign(draft.firebase, merged.firebase)
    Object.assign(draft.storage, merged.storage)
    Object.assign(draft.ai, merged.ai)
    Object.assign(draft.zaloBot, merged.zaloBot)
    Object.assign(draft.ui, merged.ui)
    draft.dbMode = merged.dbMode

    await handleSaveAll(false)
    showToast(`Đã nạp và lưu cấu hình từ "${file.name}"!`, 'success')
  } catch (err: any) {
    showToast(`File cấu hình không hợp lệ: ${err?.message || String(err)}`, 'error')
  }
}

async function handleRestoreDefaultKeys(): Promise<void> {
  const ok = await askConfirm({
    variant: 'danger',
    title: 'Khôi phục toàn bộ API Key mặc định ban đầu?',
    message:
      'Mọi thông số Firebase, Cloudinary, ImgBB, Dola, DeepSeek và Zalo Bot sẽ quay về bộ Key gốc ban đầu của dự án.',
    confirmText: 'Khôi phục mặc định',
    cancelText: 'Hủy'
  })
  if (!ok) return

  const def = cloneDefaultConfig()
  if (!isLocalHost) def.dbMode = 'live'
  Object.assign(draft.firebase, def.firebase)
  Object.assign(draft.storage, def.storage)
  Object.assign(draft.ai, def.ai)
  Object.assign(draft.zaloBot, def.zaloBot)
  Object.assign(draft.ui, def.ui)
  draft.dbMode = def.dbMode

  await handleSaveAll(false)
  showToast('Đã khôi phục toàn bộ thông số về mặc định gốc!', 'success')
}

function formatDateTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

onMounted(async () => {
  fetchMockStats()
  const syncResult = await syncSystemConfigWithCloud(true)
  if (syncResult === 'pulled') {
    Object.assign(draft.storage, sysConfig.storage)
    Object.assign(draft.ai, sysConfig.ai)
    Object.assign(draft.zaloBot, sysConfig.zaloBot)
    showToast('Đã tự động cập nhật bộ API Key mới nhất từ Cloud!', 'info')
  }
})
</script>

<style scoped>
/* ─── BAO GIA UI SYSTEM TOKENS: DARK NAVY + ENTERPRISE LIGHT BLUE ─── */
.sys-cfg-page {
  --bg-canvas: radial-gradient(ellipse 80% 50% at 10% 0%, rgba(14, 165, 233, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 90% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    #09090b;
  --bg-card: #0f172a;
  --bg-card-elevated: #111c30;
  --bg-well: rgba(2, 6, 23, 0.65);
  --bg-input: #0b1120;
  --border-subtle: rgba(148, 163, 184, 0.16);
  --border-control: #334155;
  --ink-primary: #f8fafc;
  --ink-secondary: #cbd5e1;
  --ink-muted: #94a3b8;
  --shadow-card: 0 12px 30px rgba(0, 0, 0, 0.35);

  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-canvas);
  color: var(--ink-primary);
  font-family: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  padding: 18px 22px 48px;
}

.sys-cfg-page.theme-light-blue {
  --bg-canvas: linear-gradient(180deg, #eef4fb 0%, #e2ecf8 100%);
  --bg-card: #ffffff;
  --bg-card-elevated: #f8fbff;
  --bg-well: #f1f5f9;
  --bg-input: #f8fafc;
  --border-subtle: #cbd5e1;
  --border-control: #cbd5e1;
  --ink-primary: #0f172a;
  --ink-secondary: #334155;
  --ink-muted: #64748b;
  --shadow-card: 0 10px 28px rgba(15, 23, 42, 0.07);
}

.mono-num {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
}

.text-emerald {
  color: #10b981;
}
.theme-light-blue .text-emerald {
  color: #059669;
}
.text-sky {
  color: #38bdf8;
}
.theme-light-blue .text-sky {
  color: #0284c7;
}
.text-amber {
  color: #fbbf24;
}
.theme-light-blue .text-amber {
  color: #d97706;
}
.text-muted {
  color: var(--ink-muted);
}
.font-bold {
  font-weight: 700;
}

/* ─── TOPBAR ─── */
.cfg-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 14px 18px;
  box-shadow: var(--shadow-card);
  margin-bottom: 16px;
}

.cfg-topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex-wrap: wrap;
}

.cfg-title-block {
  min-width: 0;
}

.cfg-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cfg-title-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(14, 165, 233, 0.16);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
  flex-shrink: 0;
}
.theme-light-blue .cfg-title-icon {
  background: #e0f2fe;
  color: #0284c7;
  border-color: #93c5fd;
}

.cfg-main-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: var(--ink-primary);
}

.cfg-subtitle {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--ink-muted);
}

.cfg-topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ─── PILLS & BADGES ─── */
.cfg-mode-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.pill-emerald,
.badge-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.38);
}
.theme-light-blue .pill-emerald,
.theme-light-blue .badge-emerald {
  background: #ecfdf5;
  color: #047857;
  border-color: #6ee7b7;
}

.pill-rose,
.badge-rose {
  background: rgba(239, 68, 68, 0.14);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.36);
}
.theme-light-blue .pill-rose,
.theme-light-blue .badge-rose {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.cfg-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

/* ─── BUTTONS (NO RAINBOW COLORS DISCIPLINE) ─── */
.cfg-btn {
  width: auto;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.16s ease;
  border: 1px solid transparent;
}
.cfg-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.cfg-btn-xs {
  padding: 5px 10px;
  font-size: 11.5px;
}

.cfg-btn-sky {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  border-color: rgba(56, 189, 248, 0.4);
}
.cfg-btn-sky:hover:not(:disabled) {
  filter: brightness(1.08);
}

.cfg-btn-emerald {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border-color: rgba(52, 211, 153, 0.4);
}
.cfg-btn-emerald:hover:not(:disabled) {
  filter: brightness(1.08);
}

.cfg-btn-rose-solid {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border-color: rgba(248, 113, 113, 0.4);
}

.cfg-btn-slate {
  background: rgba(148, 163, 184, 0.12);
  color: var(--ink-secondary);
  border-color: var(--border-control);
}
.theme-light-blue .cfg-btn-slate {
  background: #f1f5f9;
  color: #334155;
}
.cfg-btn-slate:hover:not(:disabled) {
  border-color: #38bdf8;
  color: var(--ink-primary);
}

/* Slate at rest -> Rose ONLY on hover */
.cfg-btn-danger-hover {
  background: rgba(148, 163, 184, 0.1);
  color: var(--ink-secondary);
  border-color: var(--border-control);
}
.cfg-btn-danger-hover:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.16);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.45);
}
.theme-light-blue .cfg-btn-danger-hover:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* ─── WORKSPACE LAYOUT ─── */
.cfg-workspace {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.cfg-sidebar {
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cfg-nav-card,
.cfg-status-box {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 12px;
  box-shadow: var(--shadow-card);
}

.cfg-nav-heading {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-muted);
  padding: 4px 8px 8px;
}

.cfg-nav-btn {
  width: 100%;
  margin: 0 0 4px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-secondary);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}
.cfg-nav-btn:hover {
  background: rgba(56, 189, 248, 0.07);
}
.cfg-nav-btn.active {
  background: rgba(2, 132, 199, 0.18);
  border-color: rgba(56, 189, 248, 0.42);
  color: var(--ink-primary);
}
.theme-light-blue .cfg-nav-btn.active {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #0f172a;
}

.cfg-nav-num {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.14);
  color: #38bdf8;
  flex-shrink: 0;
}
.theme-light-blue .cfg-nav-num {
  background: #dbeafe;
  color: #1d4ed8;
}

.cfg-nav-meta {
  min-width: 0;
}
.cfg-nav-title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
}
.cfg-nav-desc {
  font-size: 11.5px;
  color: var(--ink-muted);
  margin-top: 2px;
}

.cfg-stat-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  font-size: 12px;
  border-top: 1px solid var(--border-subtle);
}
.cfg-stat-line:first-of-type {
  border-top: none;
}

/* ─── CARDS & FORMS ─── */
.cfg-main {
  min-width: 0;
}
.cfg-section-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cfg-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: var(--shadow-card);
}
.cfg-card-compact {
  padding: 14px 18px;
}

.cfg-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.cfg-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--ink-primary);
}
.cfg-card-sub {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--ink-muted);
  max-width: 780px;
}

.cfg-head-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ─── DB MODE SELECTOR CARDS ─── */
.cfg-mode-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.cfg-mode-option {
  background: var(--bg-well);
  border: 1.5px solid var(--border-control);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.16s ease;
}
.cfg-mode-option:hover:not(.is-disabled) {
  border-color: #38bdf8;
}
.cfg-mode-option.is-selected-emerald {
  background: rgba(16, 185, 129, 0.09);
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}
.theme-light-blue .cfg-mode-option.is-selected-emerald {
  background: #ecfdf5;
  border-color: #059669;
}
.cfg-mode-option.is-selected-sky {
  background: rgba(2, 132, 199, 0.11);
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
}
.theme-light-blue .cfg-mode-option.is-selected-sky {
  background: #eff6ff;
  border-color: #2563eb;
}
.cfg-mode-option.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cfg-mode-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.cfg-active-tag {
  font-size: 11.5px;
  font-weight: 800;
}
.tag-emerald {
  color: #34d399;
}
.theme-light-blue .tag-emerald {
  color: #059669;
}
.tag-sky {
  color: #38bdf8;
}
.theme-light-blue .tag-sky {
  color: #2563eb;
}

.cfg-mode-name {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--ink-primary);
  margin-bottom: 6px;
}
.cfg-mode-detail {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink-secondary);
}
.cfg-warn-inline {
  margin-top: 8px;
  font-size: 11.5px;
  color: #fbbf24;
}

/* ─── BANNERS ─── */
.cfg-banner {
  margin-top: 14px;
  margin-bottom: 14px;
  padding: 11px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12.5px;
}
.banner-amber {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.38);
  color: #fde68a;
}
.theme-light-blue .banner-amber {
  background: #fffbeb;
  border-color: #fcd34d;
  color: #92400e;
}
.banner-emerald {
  background: rgba(16, 185, 129, 0.13);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #a7f3d0;
}
.theme-light-blue .banner-emerald {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #065f46;
}
.banner-rose {
  background: rgba(239, 68, 68, 0.13);
  border: 1px solid rgba(239, 68, 68, 0.42);
  color: #fecaca;
}
.theme-light-blue .banner-rose {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

/* ─── KPI GRID & PATHS ─── */
.cfg-kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.cfg-kpi-card {
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 12px 14px;
}
.cfg-kpi-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--ink-muted);
}
.cfg-kpi-val {
  font-size: 16px;
  font-weight: 800;
  margin-top: 4px;
}
.cfg-kpi-sub {
  font-size: 11.5px;
  color: var(--ink-muted);
  margin-top: 3px;
}

.cfg-file-paths-box {
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cfg-path-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
}
.cfg-path-tag {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 5px;
  background: rgba(148, 163, 184, 0.16);
}
.cfg-path-time {
  color: var(--ink-muted);
  font-size: 11.5px;
}

.cfg-action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

/* ─── INPUTS & FORMS ─── */
.cfg-form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}
.cfg-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.cfg-field-full {
  grid-column: 1 / -1;
}
.cfg-label,
.cfg-mini-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-muted);
}

.cfg-input,
.cfg-textarea {
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-input);
  color: var(--ink-primary);
  border: 1px solid var(--border-control);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cfg-input:focus,
.cfg-textarea:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.16);
}
.theme-light-blue .cfg-input:focus,
.theme-light-blue .cfg-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
}
.cfg-input-sm {
  max-width: 290px;
  padding: 6px 10px;
  font-size: 12px;
}

.cfg-secret-wrap {
  display: flex;
  align-items: stretch;
  gap: 6px;
}
.cfg-eye-btn {
  width: auto;
  margin: 0;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--border-control);
  background: var(--bg-well);
  color: var(--ink-secondary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.cfg-eye-btn:hover {
  border-color: #38bdf8;
  color: var(--ink-primary);
}

.cfg-paste-box {
  background: var(--bg-well);
  border: 1px dashed var(--border-control);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}
.cfg-paste-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.cfg-endpoint-preview {
  margin-top: 12px;
  padding: 9px 12px;
  border-radius: 8px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  font-size: 12px;
  color: var(--ink-secondary);
  overflow-x: auto;
}

/* ─── SWITCH ROW ─── */
.cfg-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
}
.cfg-switch-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-primary);
}
.cfg-switch-desc {
  font-size: 12px;
  color: var(--ink-muted);
  margin-top: 2px;
}
.cfg-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #10b981;
  cursor: pointer;
  flex-shrink: 0;
}

/* ─── USAGE MAP (CLOUDINARY & IMGBB PAGES + EXACT BUTTONS) ─── */
.cfg-usage-block {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}
.cfg-usage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.cfg-usage-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--ink-primary);
}
.cfg-usage-sub {
  font-size: 12px;
  color: var(--ink-muted);
  margin-top: 2px;
}

.cfg-usage-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cfg-usage-item {
  background: var(--bg-well);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid #0284c7;
  border-radius: 10px;
  padding: 11px 14px;
}
.cfg-usage-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.cfg-usage-page {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.cfg-usage-idx {
  font-size: 11px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 5px;
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
}
.theme-light-blue .cfg-usage-idx {
  background: #dbeafe;
  color: #1d4ed8;
}
.cfg-file-tag {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 5px;
  background: rgba(148, 163, 184, 0.14);
  color: var(--ink-muted);
}
.cfg-route-link,
.cfg-inline-link {
  color: #38bdf8;
  font-weight: 700;
  font-size: 12px;
  text-decoration: none;
}
.theme-light-blue .cfg-route-link,
.theme-light-blue .cfg-inline-link {
  color: #2563eb;
}
.cfg-route-link:hover,
.cfg-inline-link:hover {
  text-decoration: underline;
}

.cfg-usage-btns {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cfg-usage-btns li {
  font-size: 12.5px;
  color: var(--ink-secondary);
  line-height: 1.45;
}
.cfg-btn-chip {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 5px;
  font-weight: 700;
  font-size: 12px;
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.32);
  margin-right: 4px;
}
.theme-light-blue .cfg-btn-chip {
  background: #ecfdf5;
  color: #047857;
  border-color: #6ee7b7;
}
.cfg-btn-purpose {
  color: var(--ink-secondary);
}

/* ─── DATA TABLE ─── */
.cfg-table-wrap {
  margin-top: 8px;
}
.cfg-table-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.cfg-data-table-scroll {
  max-height: 360px;
  overflow: auto;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}
.cfg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.cfg-table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-card-elevated);
  color: var(--ink-muted);
  text-align: left;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 9px 12px;
  border-bottom: 1px solid var(--border-subtle);
}
.cfg-table tbody td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-subtle);
}
.cfg-code-chip {
  font-size: 12px;
  font-weight: 700;
  color: #38bdf8;
}
.theme-light-blue .cfg-code-chip {
  color: #1d4ed8;
}
.cfg-bar-track {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  overflow: hidden;
}
.cfg-bar-fill {
  height: 100%;
  border-radius: 999px;
}
.fill-sky {
  background: #38bdf8;
}
.fill-amber {
  background: #f59e0b;
}

/* ─── MOBILE TABS & BOTTOM DOCK ─── */
.cfg-mobile-tabs {
  display: none;
}
.cfg-mobile-dock {
  display: none;
}

/* ─── PROMISE CONFIRM DIALOG (z-index: 1000085) ─── */
.cfg-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000085;
  background: rgba(2, 6, 23, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.cfg-dialog-card {
  width: 100%;
  max-width: 440px;
  background: linear-gradient(180deg, #111c30 0%, #0b1322 100%);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55);
}
.cfg-dialog-overlay.theme-light-blue .cfg-dialog-card {
  background: #ffffff;
  color: #0f172a;
  border-color: #cbd5e1;
}
.cfg-dialog-card.variant-danger {
  border-top: 3px solid #ef4444;
}
.cfg-dialog-badge {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #f87171;
}
.cfg-dialog-title {
  margin: 4px 0 10px;
  font-size: 16px;
  font-weight: 800;
}
.cfg-dialog-msg {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #cbd5e1;
}
.cfg-dialog-overlay.theme-light-blue .cfg-dialog-msg {
  color: #334155;
}
.cfg-dialog-note {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.32);
  color: #fde68a;
  font-size: 12px;
}
.cfg-dialog-overlay.theme-light-blue .cfg-dialog-note {
  background: #fffbeb;
  color: #92400e;
}
.cfg-dialog-foot {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ─── SMART TOAST (z-index: 2000000) ─── */
.cfg-smart-toast-layer {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000000;
  pointer-events: none;
}
.cfg-smart-toast {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 280px;
  max-width: min(540px, 92vw);
  padding: 10px 15px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.96);
  color: #f8fafc;
  border: 1px solid rgba(56, 189, 248, 0.42);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.cfg-smart-toast-layer.theme-light-blue .cfg-smart-toast {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
}
.cfg-smart-toast.toast-success {
  border-color: rgba(16, 185, 129, 0.5);
}
.cfg-smart-toast.toast-warning {
  border-color: rgba(245, 158, 11, 0.5);
}
.cfg-smart-toast.toast-error {
  border-color: rgba(239, 68, 68, 0.55);
}
.cfg-toast-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  background: rgba(56, 189, 248, 0.18);
  color: #38bdf8;
  flex-shrink: 0;
}
.toast-success .cfg-toast-icon {
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
}
.toast-warning .cfg-toast-icon {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
}
.toast-error .cfg-toast-icon {
  background: rgba(239, 68, 68, 0.18);
  color: #f87171;
}
.cfg-toast-repeat {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: rgba(148, 163, 184, 0.2);
}
.toast-pulse {
  animation: cfg-toast-pulse 0.18s ease;
}
@keyframes cfg-toast-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.028);
  }
  100% {
    transform: scale(1);
  }
}

/* ─── RESPONSIVE BREAKPOINTS (<= 1100px & <= 768px) ─── */
@media (max-width: 1100px) {
  .sys-cfg-page {
    padding: 12px 12px 92px;
    backdrop-filter: none;
    transform: none;
    filter: none;
  }
  .cfg-sidebar {
    display: none;
  }
  .cfg-workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .cfg-mobile-tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 4px 2px 12px;
  }
  .cfg-mob-tab {
    width: auto;
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid var(--border-control);
    background: var(--bg-card);
    color: var(--ink-secondary);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
  }
  .cfg-mob-tab.active {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    color: #ffffff;
    border-color: #38bdf8;
  }
  .cfg-mob-tab-num {
    font-size: 10.5px;
    opacity: 0.85;
  }

  .cfg-mobile-dock {
    position: fixed;
    left: 72px;
    right: 0;
    bottom: 0;
    z-index: 950;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px));
    background: var(--bg-card);
    border-top: 1px solid var(--border-subtle);
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.3);
  }
  .cfg-mobile-dock.is-modal-hidden {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .cfg-mode-grid,
  .cfg-kpi-grid,
  .cfg-form-grid-2 {
    grid-template-columns: minmax(0, 1fr);
  }
  .cfg-topbar-actions {
    width: 100%;
  }
  .cfg-mobile-dock {
    left: 0;
  }
  .cfg-smart-toast-layer {
    top: calc(10px + env(safe-area-inset-top, 0px));
    left: 12px;
    right: 12px;
    transform: none;
    display: flex;
    justify-content: center;
  }
  .cfg-smart-toast {
    min-width: 0;
    width: fit-content;
    max-width: calc(100vw - 24px);
    border-radius: 20px;
    padding: 9px 14px;
  }
}
</style>
