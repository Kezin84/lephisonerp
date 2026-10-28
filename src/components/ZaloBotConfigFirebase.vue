<template>
  <div class="zalo-bot-page">
    <header class="header">
      <div class="title-section">
        <h1>Cấu Hình &amp; Điều Khiển Zalo Bot</h1>
        <p class="subtitle">Quản lý kết nối Bot SONAI SI, thiết lập giờ gửi tự động, nội dung mẫu và hệ thống lệnh tương tác</p>
      </div>
    </header>

    <!-- Thống kê nhanh trạng thái Bot -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon emerald">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 10.5"></path><path d="m12 12 7.5 6.5"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Trạng thái Bot</span>
          <span class="stat-value" :style="{ color: botStatus.online ? '#34d399' : '#f87171', fontSize: '1.2rem' }">
            {{ botStatus.online ? (botStatus.displayName || config.botName || 'Đang hoạt động') : 'Chưa kiểm tra / Ngắt' }}
          </span>
          <span style="font-size: 0.76rem; color: #94a3b8; margin-top: 3px;">
            Tài khoản: {{ botStatus.accountName || config.botAccount || 'bot.QkJpMNVs' }}
          </span>
        </div>
      </div>

      <div class="stat-card" @click="activeTab = 'connect'" style="cursor: pointer;">
        <div class="stat-icon blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Nhóm / Người nhận</span>
          <span class="stat-value">{{ (config.recipients || []).filter(r => r && r.enabled).length }} / {{ (config.recipients || []).length }}</span>
          <span style="font-size: 0.76rem; color: #94a3b8; margin-top: 3px;">Đang bật nhận thông báo</span>
        </div>
      </div>

      <div class="stat-card" @click="activeTab = 'schedules'" style="cursor: pointer;">
        <div class="stat-icon amber">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Lịch hẹn giờ gửi</span>
          <span class="stat-value" style="color: #fbbf24;">{{ (config.schedules || []).filter(s => s && s.enabled).length }} / {{ (config.schedules || []).length }}</span>
          <span style="font-size: 0.76rem; color: #94a3b8; margin-top: 3px;">Khung giờ tự động đang bật</span>
        </div>
      </div>

      <div class="stat-card" @click="activeTab = 'commands'" style="cursor: pointer;">
        <div class="stat-icon purple">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Lệnh điều khiển Bot</span>
          <span class="stat-value" style="color: #c084fc;">{{ (config.commands || []).filter(c => c && c.enabled).length }} lệnh</span>
          <span style="font-size: 0.76rem; color: #94a3b8; margin-top: 3px;">
            Lắng nghe từ Zalo: <strong :style="{ color: config.commandListenerEnabled ? '#34d399' : '#f87171' }">{{ config.commandListenerEnabled ? 'BẬT' : 'TẮT' }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- Thanh điều hướng Tab & Nút Lưu cấu hình -->
    <div class="tabs-bar">
      <div class="tabs-left">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div class="tabs-right">
        <button type="button" class="btn-secondary-dark" @click="checkBotConnection" :disabled="checkingBot">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          <span>{{ checkingBot ? 'Đang kiểm tra...' : 'Kiểm tra kết nối Bot' }}</span>
        </button>
        <button type="button" class="btn-primary" @click="handleSaveAllConfig" :disabled="savingConfig">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>{{ savingConfig ? 'Đang lưu...' : 'LƯU CẤU HÌNH LÊN FIREBASE' }}</span>
        </button>
      </div>
    </div>

    <!-- Thông báo phản hồi nhanh -->
    <div v-if="statusBanner.text" class="status-banner" :class="statusBanner.type">
      <span>{{ statusBanner.text }}</span>
      <button type="button" @click="statusBanner.text = ''" class="banner-close">✕</button>
    </div>

    <!-- =====================================================
         TAB 1: KẾT NỐI BOT, NHÓM NHẬN & RA LỆNH GỬI NGAY
         ===================================================== -->
    <div v-if="activeTab === 'connect'" class="grid-2col">
      <!-- Cột trái: Cấu hình Token & Danh sách Nhóm nhận -->
      <div class="col-stack">
        <div class="form-section">
          <div class="section-header-row">
            <h3 class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Thông Tin Kết Nối HTTP API
            </h3>
            <label class="switch-label">
              <input type="checkbox" v-model="config.enabled" />
              <span>{{ config.enabled ? 'Đang kích hoạt Bot' : 'Đang tạm dừng Bot' }}</span>
            </label>
          </div>

          <div class="form-group" style="margin-top: 14px;">
            <label>Zalo Bot HTTP API Token</label>
            <div style="display: flex; gap: 8px;">
              <input
                :type="showToken ? 'text' : 'password'"
                v-model="config.botToken"
                class="form-input"
                placeholder="Nhập token từ Zalo Bot Creator..."
              />
              <button type="button" class="btn-secondary-dark" @click="showToken = !showToken" style="white-space: nowrap;">
                {{ showToken ? 'Ẩn' : 'Hiện' }}
              </button>
            </div>
          </div>

          <div class="form-group row">
            <div class="col">
              <label>Tên hiển thị Bot</label>
              <input type="text" v-model="config.botName" class="form-input" placeholder="Bot SONAI SI" />
            </div>
            <div class="col">
              <label>Link chia sẻ mời Bot vào nhóm</label>
              <div style="display: flex; gap: 8px;">
                <input type="text" v-model="config.inviteGroupUrl" class="form-input" />
                <a
                  v-if="config.inviteGroupUrl"
                  :href="config.inviteGroupUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-secondary-dark"
                  style="text-decoration: none; white-space: nowrap; display: inline-flex; align-items: center;"
                >
                  Mở link
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Danh sách Nhóm / Người nhận (Chat ID) -->
        <div class="form-section">
          <div class="section-header-row" style="margin-bottom: 14px;">
            <h3 class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Danh Sách Nhóm / Người Nhận (Chat ID)
            </h3>
            <button
              type="button"
              class="btn-secondary-dark"
              style="border-color: rgba(56, 189, 248, 0.45); color: #38bdf8;"
              @click="listenForNewChatId"
              :disabled="listeningNewChat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>
              <span>{{ listeningNewChat ? 'Đang chờ bạn tag @Bot trong nhóm Zalo...' : 'Quét bắt Nhóm Zalo mới' }}</span>
            </button>
          </div>

          <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 12px;">
            Mẹo: Khi thêm Bot vào nhóm Zalo mới, bấm <strong>"Quét bắt Nhóm Zalo mới"</strong> rồi vào nhóm Zalo gõ <code>@{{ config.botName || 'Bot SONAI SI' }} alo</code> để tự động lấy mã Chat ID.
          </div>

          <!-- Thêm thủ công -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
            <input
              type="text"
              v-model="newRecipient.name"
              placeholder="Tên gợi nhớ (VD: Nhóm Kế Toán)"
              class="form-input"
              style="flex: 1.2; min-width: 160px;"
            />
            <input
              type="text"
              v-model="newRecipient.chatId"
              placeholder="Mã Chat ID (VD: zgr-176c47813...)"
              class="form-input"
              style="flex: 1.2; min-width: 180px;"
            />
            <select v-model="newRecipient.type" class="form-input" style="width: 120px;">
              <option value="GROUP">Nhóm</option>
              <option value="USER">Cá nhân</option>
            </select>
            <button type="button" class="btn-primary" style="padding: 0 16px;" @click="addRecipient">
              Thêm
            </button>
          </div>

          <div class="list-stack">
            <div
              v-for="(rec, idx) in config.recipients"
              :key="rec.id || rec.chatId"
              class="item-card"
            >
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                <div style="display: flex; flex-direction: column; gap: 3px; flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <input
                      type="text"
                      v-model="rec.name"
                      class="inline-edit-input"
                      placeholder="Tên nhóm / người nhận"
                    />
                    <span
                      class="pill-badge"
                      :style="{
                        background: rec.type === 'GROUP' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                        color: rec.type === 'GROUP' ? '#38bdf8' : '#c084fc',
                        border: rec.type === 'GROUP' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(168, 85, 247, 0.35)'
                      }"
                    >
                      {{ rec.type === 'GROUP' ? 'NHÓM ZALO' : 'CÁ NHÂN' }}
                    </span>
                  </div>
                  <div style="font-size: 0.78rem; color: #94a3b8;">
                    Chat ID: <code style="color: #34d399;">{{ rec.chatId }}</code>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  <label class="switch-label" style="font-size: 0.78rem;">
                    <input type="checkbox" v-model="rec.enabled" />
                    <span>{{ rec.enabled ? 'Nhận tin' : 'Tắt' }}</span>
                  </label>
                  <button
                    type="button"
                    class="btn-mini sky"
                    @click="sendQuickTestToChat(rec)"
                    :disabled="sendingMessage"
                  >
                    Gửi thử
                  </button>
                  <button
                    type="button"
                    class="btn-mini danger"
                    @click="config.recipients.splice(idx, 1)"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải: Trung tâm Ra Lệnh & Gửi Tin Nhắn Ngay Lập Tức -->
      <div class="col-stack">
        <div class="form-section">
          <h3 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            Ra Lệnh Cho Bot Gửi Thông Tin Ngay Lập Tức
          </h3>

          <div class="form-group">
            <label>Chọn Nhóm / Người nhận trên Zalo</label>
            <select v-model="manualCompose.targetChatId" class="form-input">
              <option value="__all__">Gửi tới tất cả nhóm đang bật ({{ (config.recipients || []).filter(r => r && r.enabled).length }} nhóm)</option>
              <option v-for="rec in (config.recipients || [])" :key="'opt-' + rec.chatId" :value="rec.chatId">
                {{ rec.name }} ({{ rec.chatId }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Chọn nhanh mẫu thông tin cần gửi</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button
                v-for="preset in quickPresets"
                :key="preset.label"
                type="button"
                class="btn-mini emerald"
                @click="manualCompose.text = preset.template"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 6px;">
              <label style="margin-bottom: 0;">Nội dung tin nhắn (Hỗ trợ chèn biến dữ liệu thực)</label>
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                <button
                  v-for="v in availableVariables"
                  :key="v.code"
                  type="button"
                  class="var-chip"
                  :title="v.desc"
                  @click="insertVarToManual(v.code)"
                >
                  {{ v.code }}
                </button>
              </div>
            </div>
            <textarea
              v-model="manualCompose.text"
              rows="8"
              class="form-input"
              placeholder="Nhập nội dung tin nhắn hoặc chọn mẫu bên trên..."
            ></textarea>
          </div>

          <div v-if="manualPreviewText" class="preview-box">
            <div style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">
              Bản xem trước với số liệu thực tế từ Firebase:
            </div>
            <pre style="margin: 0; white-space: pre-wrap; font-family: inherit; font-size: 0.85rem; color: #e2e8f0; line-height: 1.5;">{{ manualPreviewText }}</pre>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px;">
            <button
              type="button"
              class="btn-secondary-dark"
              @click="previewManualMessage"
              :disabled="previewingManual"
            >
              {{ previewingManual ? 'Đang tổng hợp số liệu...' : 'Xem trước số liệu thực' }}
            </button>
            <button
              type="button"
              class="btn-primary"
              @click="sendManualMessageNow"
              :disabled="sendingMessage"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              <span>{{ sendingMessage ? 'Đang gửi vào Zalo...' : 'RA LỆNH GỬI VÀO ZALO NGAY' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================
         TAB 2: HẸN GIỜ BOT GỬI THÔNG TIN TỰ ĐỘNG (SCHEDULES)
         ===================================================== -->
    <div v-if="activeTab === 'schedules'" class="col-stack">
      <div class="form-section">
        <div class="section-header-row" style="margin-bottom: 14px;">
          <div>
            <h3 class="section-title" style="margin-bottom: 4px; border-bottom: none; padding-bottom: 0;">
              Thiết Lập Giờ Bot Tự Động Gửi Thông Tin
            </h3>
            <div style="font-size: 0.82rem; color: #94a3b8;">
              Khi đến đúng khung giờ đã cài đặt, hệ thống sẽ tự động lấy số liệu mới nhất từ Firebase, điền vào mẫu nội dung và gửi vào nhóm Zalo.
            </div>
          </div>
          <button type="button" class="btn-primary" @click="addNewSchedule">
            + Thêm khung giờ gửi mới
          </button>
        </div>

        <div class="list-stack">
          <div
            v-for="(sched, sIdx) in config.schedules"
            :key="sched.id || sIdx"
            class="item-card"
            style="padding: 16px;"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.08);">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1;">
                <span class="pill-badge" style="background: rgba(16, 185, 129, 0.16); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35);">
                  LỊCH #{{ sIdx + 1 }}
                </span>
                <input
                  type="text"
                  v-model="sched.name"
                  class="form-input"
                  style="max-width: 340px; padding: 8px 12px; font-weight: 700;"
                  placeholder="Tên lịch gửi (VD: Báo cáo Công nợ 8h30 sáng)"
                />
              </div>

              <div style="display: flex; align-items: center; gap: 10px;">
                <label class="switch-label">
                  <input type="checkbox" v-model="sched.enabled" />
                  <span>{{ sched.enabled ? 'Đang bật hẹn giờ' : 'Đang tắt' }}</span>
                </label>
                <button
                  type="button"
                  class="btn-mini sky"
                  @click="runScheduleNow(sched)"
                  :disabled="sendingMessage"
                >
                  Chạy gửi ngay bây giờ
                </button>
                <button
                  type="button"
                  class="btn-mini danger"
                  @click="config.schedules.splice(sIdx, 1)"
                >
                  Xoá lịch
                </button>
              </div>
            </div>

            <div class="form-group row">
              <div class="col" style="max-width: 180px;">
                <label>Giờ gửi trong ngày (24h)</label>
                <input type="time" v-model="sched.time" class="form-input" />
              </div>

              <div class="col">
                <label>Các thứ trong tuần áp dụng</label>
                <div style="display: flex; gap: 6px; flex-wrap: wrap; padding-top: 4px;">
                  <button
                    v-for="d in weekDays"
                    :key="d.val"
                    type="button"
                    @click="toggleScheduleDay(sched, d.val)"
                    style="padding: 7px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                    :style="{
                      background: sched.days?.includes(d.val) ? '#10b981' : 'rgba(30, 41, 59, 0.7)',
                      color: sched.days?.includes(d.val) ? '#ffffff' : '#94a3b8',
                      border: sched.days?.includes(d.val) ? '1px solid #10b981' : '1px solid #334155'
                    }"
                  >
                    {{ d.label }}
                  </button>
                </div>
              </div>

              <div class="col">
                <label>Nhóm / Người nhận trên Zalo</label>
                <select v-model="sched.targetChatId" class="form-input">
                  <option value="__all__">Tất cả nhóm đang bật</option>
                  <option v-for="rec in config.recipients" :key="'sched-rec-' + rec.chatId" :value="rec.chatId">
                    {{ rec.name }} ({{ rec.chatId }})
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 6px;">
                <label style="margin-bottom: 0;">Nội dung tin nhắn mẫu khi đến giờ</label>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  <button
                    v-for="v in availableVariables"
                    :key="'sv-' + v.code"
                    type="button"
                    class="var-chip"
                    @click="sched.template = (sched.template || '') + ' ' + v.code"
                  >
                    {{ v.code }}
                  </button>
                </div>
              </div>
              <textarea
                v-model="sched.template"
                rows="5"
                class="form-input"
                placeholder="Nhập nội dung tin nhắn mẫu..."
              ></textarea>
              <div v-if="sched.lastSentDate" style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
                Lần tự động gửi gần nhất: {{ sched.lastSentDate }} lúc {{ sched.time }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================
         TAB 3: CẤU HÌNH LỆNH ĐIỀU KHIỂN BOT (COMMANDS)
         ===================================================== -->
    <div v-if="activeTab === 'commands'" class="col-stack">
      <div class="form-section">
        <div class="section-header-row" style="margin-bottom: 14px;">
          <div>
            <h3 class="section-title" style="margin-bottom: 4px; border-bottom: none; padding-bottom: 0;">
              Cấu Hình Lệnh Điều Khiển Bot (Từ Zalo &amp; Từ Web)
            </h3>
            <div style="font-size: 0.82rem; color: #94a3b8;">
              Trong nhóm Zalo, gõ <code>@{{ config.botName || 'Bot SONAI SI' }} &lt;từ_khóa_lệnh&gt;</code> (VD: <code>@{{ config.botName || 'Bot SONAI SI' }} /congno</code> hoặc <code>@{{ config.botName || 'Bot SONAI SI' }} /kh global</code>) để Bot tự động truy vấn Firebase và trả lời. Bạn cũng có thể bấm nút <strong>"Ra lệnh gửi ngay"</strong> ở từng lệnh bên dưới.
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <label class="switch-label">
              <input type="checkbox" v-model="config.commandListenerEnabled" />
              <span>{{ config.commandListenerEnabled ? 'Đang lắng nghe lệnh từ Zalo' : 'Tắt lắng nghe từ Zalo' }}</span>
            </label>
            <button type="button" class="btn-secondary-dark" @click="checkZaloCommandsNow">
              Kiểm tra lệnh mới trên Zalo ngay
            </button>
            <button type="button" class="btn-primary" @click="addNewCommand">
              + Thêm lệnh mới
            </button>
          </div>
        </div>

        <div class="list-stack">
          <div
            v-for="(cmd, cIdx) in config.commands"
            :key="cmd.id || cIdx"
            class="item-card"
            style="padding: 16px;"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.08);">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span class="pill-badge" style="background: rgba(168, 85, 247, 0.18); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);">
                  LỆNH {{ cmd.keyword }}
                </span>
                <span style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600;">{{ cmd.description }}</span>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <input
                  v-if="cmd.actionType === 'customer_lookup' || cmd.actionType === 'product_lookup'"
                  type="text"
                  v-model="commandTestArgs[cmd.id || cIdx]"
                  class="form-input"
                  style="width: 190px; padding: 6px 10px; font-size: 0.8rem;"
                  placeholder="Nhập từ khóa tra cứu..."
                />
                <button
                  type="button"
                  class="btn-mini emerald"
                  @click="triggerCommandFromWeb(cmd, commandTestArgs[cmd.id || cIdx])"
                  :disabled="sendingMessage"
                >
                  Ra lệnh gửi vào Zalo ngay
                </button>
                <label class="switch-label" style="font-size: 0.78rem;">
                  <input type="checkbox" v-model="cmd.enabled" />
                  <span>{{ cmd.enabled ? 'Bật' : 'Tắt' }}</span>
                </label>
                <button
                  type="button"
                  class="btn-mini danger"
                  @click="config.commands.splice(cIdx, 1)"
                >
                  Xoá
                </button>
              </div>
            </div>

            <div class="form-group row">
              <div class="col" style="max-width: 180px;">
                <label>Từ khóa lệnh chính</label>
                <input type="text" v-model="cmd.keyword" class="form-input" placeholder="/congno" />
              </div>
              <div class="col">
                <label>Từ khóa phụ (cách nhau dấu phẩy)</label>
                <input type="text" v-model="cmd.aliases" class="form-input" placeholder="congno, no, baocaono" />
              </div>
              <div class="col">
                <label>Loại tác vụ dữ liệu</label>
                <select v-model="cmd.actionType" class="form-input">
                  <option value="debt_summary">Tổng hợp Công nợ khách hàng</option>
                  <option value="customer_lookup">Tra cứu thông tin Khách hàng theo từ khóa</option>
                  <option value="task_summary">Danh sách Công việc chưa hoàn thành</option>
                  <option value="product_lookup">Tra cứu giá &amp; thông tin Hàng hóa</option>
                  <option value="help_menu">Danh sách hướng dẫn các lệnh Bot</option>
                  <option value="custom">Nội dung tùy chỉnh / Thông báo cố định</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Mô tả ngắn gọn về lệnh</label>
              <input type="text" v-model="cmd.description" class="form-input" />
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label>Mẫu nội dung Bot phản hồi khi nhận lệnh</label>
              <textarea v-model="cmd.template" rows="4" class="form-input"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================
         TAB 4: SỰ KIỆN TỰ ĐỘNG & NHẬT KÝ GỬI TIN (EVENTS & LOGS)
         ===================================================== -->
    <div v-if="activeTab === 'events'" class="grid-2col">
      <!-- Cột trái: Các sự kiện tự động -->
      <div class="col-stack">
        <div class="form-section">
          <h3 class="section-title">
            Tự Động Gửi Zalo Khi Phát Sinh Sự Kiện Trên Hệ Thống
          </h3>

          <div
            v-for="(trig, key) in config.eventTriggers"
            :key="key"
            class="item-card"
            style="margin-bottom: 14px;"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong style="color: #f8fafc; font-size: 0.95rem;">{{ trig.name }}</strong>
              <label class="switch-label">
                <input type="checkbox" v-model="trig.enabled" />
                <span>{{ trig.enabled ? 'Đang bật' : 'Đang tắt' }}</span>
              </label>
            </div>

            <div class="form-group">
              <label>Nhóm Zalo nhận thông báo</label>
              <select v-model="trig.targetChatId" class="form-input">
                <option value="__all__">Tất cả nhóm đang bật</option>
                <option v-for="rec in config.recipients" :key="'ev-' + key + rec.chatId" :value="rec.chatId">
                  {{ rec.name }} ({{ rec.chatId }})
                </option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label>Nội dung thông báo mẫu</label>
              <textarea v-model="trig.template" rows="5" class="form-input"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải: Nhật ký gửi tin -->
      <div class="col-stack">
        <div class="form-section">
          <div class="section-header-row" style="margin-bottom: 14px;">
            <h3 class="section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">
              Nhật Ký Bot Đã Gửi Gần Đây ({{ botLogs.length }})
            </h3>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-mini sky" @click="loadBotLogs">Tải lại</button>
              <button v-if="botLogs.length > 0" type="button" class="btn-mini danger" @click="clearBotLogs">Xoá lịch sử</button>
            </div>
          </div>

          <div v-if="botLogs.length === 0" style="padding: 2rem; text-align: center; color: #64748b; font-size: 0.88rem;">
            Chưa có lịch sử gửi tin nhắn nào được ghi nhận.
          </div>

          <div v-else class="list-stack" style="max-height: 540px; overflow-y: auto;">
            <div v-for="log in botLogs" :key="log.id" class="item-card" style="padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; margin-bottom: 6px;">
                <span style="color: #94a3b8;">
                  Đến: <code style="color: #38bdf8;">{{ log.chatId }}</code> • Nguồn: <strong>{{ log.source }}</strong>
                </span>
                <span :style="{ color: log.ok ? '#34d399' : '#f87171', fontWeight: 700 }">
                  {{ formatLogTime(log.timestamp) }} — {{ log.ok ? 'THÀNH CÔNG' : 'LỖI' }}
                </span>
              </div>
              <pre style="margin: 0; white-space: pre-wrap; font-family: inherit; font-size: 0.8rem; color: #cbd5e1; background: rgba(15, 23, 42, 0.6); padding: 8px 10px; border-radius: 8px;">{{ log.text }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, remove } from 'firebase/database'
import {
  getDefaultZaloBotConfig,
  fetchZaloBotConfig,
  saveZaloBotConfig,
  callZaloBotApi,
  sendZaloBotMessage,
  renderBotTemplate,
  executeBotCommand,
  pollZaloBotCommandsOnce
} from '../utils/zaloBotService'

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
if (app?.options && !app.options.databaseURL) {
  Object.assign(app.options, firebaseConfig)
}
const database = getDatabase(app)

const activeTab = ref('connect')
const tabs = [
  { key: 'connect', label: '1. Kết nối & Gửi tin nhanh' },
  { key: 'schedules', label: '2. Hẹn giờ gửi tự động' },
  { key: 'commands', label: '3. Lệnh điều khiển Bot' },
  { key: 'events', label: '4. Sự kiện tự động & Nhật ký' }
]

const config = ref(getDefaultZaloBotConfig())
const showToken = ref(false)
const savingConfig = ref(false)
const checkingBot = ref(false)
const listeningNewChat = ref(false)
const sendingMessage = ref(false)
const previewingManual = ref(false)

const botStatus = reactive({
  online: true,
  displayName: 'Bot SONAI SI',
  accountName: 'bot.QkJpMNVs',
  id: '1563589356003514094'
})

const statusBanner = reactive({
  text: '',
  type: 'success'
})

const showBanner = (text, type = 'success') => {
  statusBanner.text = text
  statusBanner.type = type
  setTimeout(() => {
    if (statusBanner.text === text) statusBanner.text = ''
  }, 5500)
}

const newRecipient = reactive({
  name: '',
  chatId: '',
  type: 'GROUP'
})

const manualCompose = reactive({
  targetChatId: 'zgr-176c478134e0ddbe84f1',
  text:
    '[THÔNG BÁO HỆ THỐNG - {date} {time}]\n' +
    '- Tổng số khách hàng: {tong_khach_hang} KH\n' +
    '- Số khách đang nợ: {so_khach_no} KH\n' +
    '- Tổng công nợ phải thu: {tong_cong_no} đ\n\n' +
    'Chi tiết khách nợ:\n{chi_tiet_cong_no}'
})

const manualPreviewText = ref('')
const commandTestArgs = reactive({})
const botLogs = ref([])

const availableVariables = [
  { code: '{date}', desc: 'Ngày hiện tại (DD/MM/YYYY)' },
  { code: '{time}', desc: 'Giờ hiện tại (HH:mm)' },
  { code: '{tong_khach_hang}', desc: 'Tổng số khách hàng' },
  { code: '{so_khach_no}', desc: 'Số lượng khách hàng đang nợ' },
  { code: '{tong_cong_no}', desc: 'Tổng số tiền công nợ phải thu' },
  { code: '{chi_tiet_cong_no}', desc: 'Danh sách chi tiết từng khách đang nợ' },
  { code: '{cong_viec_chua_xong}', desc: 'Danh sách các công việc chưa hoàn thành' }
]

const quickPresets = [
  {
    label: 'Mẫu Báo cáo Công nợ',
    template:
      '[BÁO CÁO CÔNG NỢ KHÁCH HÀNG - {date} {time}]\n' +
      '- Tổng khách hàng: {tong_khach_hang} KH\n' +
      '- Khách đang nợ: {so_khach_no} KH\n' +
      '- Tổng công nợ phải thu: {tong_cong_no} đ\n\n' +
      'Chi tiết công nợ:\n{chi_tiet_cong_no}'
  },
  {
    label: 'Mẫu Nhắc việc chưa hoàn thành',
    template:
      '[NHẮC VIỆC CHƯA HOÀN THÀNH - {date} {time}]\n' +
      'Danh sách công việc cần xử lý:\n' +
      '{cong_viec_chua_xong}'
  },
  {
    label: 'Mẫu Thông báo tự do',
    template:
      '[THÔNG BÁO TỪ HỆ THỐNG SONAI SI - {date} {time}]\n' +
      'Nội dung: '
  }
]

const weekDays = [
  { val: 1, label: 'T2' },
  { val: 2, label: 'T3' },
  { val: 3, label: 'T4' },
  { val: 4, label: 'T5' },
  { val: 5, label: 'T6' },
  { val: 6, label: 'T7' },
  { val: 0, label: 'CN' }
]

const insertVarToManual = (code) => {
  manualCompose.text = (manualCompose.text || '') + ' ' + code
}

const checkBotConnection = async () => {
  checkingBot.value = true
  try {
    const res = await callZaloBotApi(config.value.botToken, 'getMe', {})
    if (res && res.ok && res.result) {
      botStatus.online = true
      botStatus.displayName = res.result.display_name || config.value.botName
      botStatus.accountName = res.result.account_name || config.value.botAccount
      botStatus.id = res.result.id || ''
      config.value.botName = botStatus.displayName
      config.value.botAccount = botStatus.accountName
      showBanner(`Kết nối thành công với ${botStatus.displayName} (${botStatus.accountName})`, 'success')
    } else {
      botStatus.online = false
      showBanner('Không thể xác thực Token Bot: ' + (res?.description || 'Lỗi không xác định'), 'error')
    }
  } catch (err) {
    botStatus.online = false
    showBanner('Lỗi kiểm tra kết nối: ' + (err?.message || err), 'error')
  } finally {
    checkingBot.value = false
  }
}

const handleSaveAllConfig = async () => {
  savingConfig.value = true
  try {
    await saveZaloBotConfig(config.value)
    showBanner('Đã lưu toàn bộ cấu hình Zalo Bot lên Firebase thành công.', 'success')
  } catch (err) {
    showBanner('Lỗi khi lưu cấu hình: ' + (err?.message || err), 'error')
  } finally {
    savingConfig.value = false
  }
}

const addRecipient = () => {
  const cId = String(newRecipient.chatId || '').trim()
  if (!cId) {
    showBanner('Vui lòng nhập mã Chat ID.', 'error')
    return
  }
  if (config.value.recipients.some(r => r.chatId === cId)) {
    showBanner('Chat ID này đã có trong danh sách.', 'error')
    return
  }
  config.value.recipients.push({
    id: 'rec_' + Date.now(),
    chatId: cId,
    name: String(newRecipient.name || '').trim() || `Nhóm Zalo (${cId.slice(0, 10)})`,
    type: newRecipient.type || 'GROUP',
    enabled: true,
    addedAt: new Date().toISOString()
  })
  newRecipient.name = ''
  newRecipient.chatId = ''
  showBanner('Đã thêm người nhận mới. Nhấn "Lưu cấu hình" để lưu lại.', 'success')
}

const listenForNewChatId = async () => {
  listeningNewChat.value = true
  showBanner('Đang lắng nghe trong 25 giây... Hãy vào nhóm Zalo gõ @' + (config.value.botName || 'Bot SONAI SI') + ' alo', 'info')
  try {
    const res = await callZaloBotApi(config.value.botToken, 'getUpdates', { timeout: 25 })
    if (res && res.ok && res.result) {
      const items = Array.isArray(res.result) ? res.result : [res.result]
      let addedCount = 0
      for (const item of items) {
        const msg = item?.message || item
        const chatId = msg?.chat?.id || item?.chat?.id || msg?.from?.id
        const chatType = msg?.chat?.chat_type || 'GROUP'
        const sender = msg?.from?.display_name || 'Nhóm Zalo mới'
        if (chatId) {
          const existing = config.value.recipients.find(r => r.chatId === chatId)
          if (!existing) {
            config.value.recipients.push({
              id: 'rec_' + Date.now() + '_' + addedCount,
              chatId,
              name: chatType === 'GROUP' ? `Nhóm Zalo của ${sender}` : sender,
              type: chatType,
              enabled: true,
              addedAt: new Date().toISOString()
            })
            addedCount++
          }
          await sendZaloBotMessage({
            botToken: config.value.botToken,
            chatId,
            text: `[${config.value.botName || 'Bot SONAI SI'}] Đã kết nối nhóm nhận thông báo thành công (Chat ID: ${chatId}).`,
            source: 'pair_chat'
          })
        }
      }
      await saveZaloBotConfig(config.value)
      showBanner(`Đã bắt được sự kiện từ Zalo và lưu cấu hình (${addedCount} nhóm mới).`, 'success')
    } else {
      showBanner('Hết thời gian chờ mà chưa nhận được tin nhắn tag @Bot nào.', 'error')
    }
  } catch (err) {
    showBanner('Lỗi khi quét Chat ID: ' + (err?.message || err), 'error')
  } finally {
    listeningNewChat.value = false
  }
}

const sendQuickTestToChat = async (rec) => {
  sendingMessage.value = true
  try {
    const text = await renderBotTemplate(
      `[TIN NHẮN KIỂM TRA KẾT NỐI - {date} {time}]\n` +
        `Xin chào "${rec.name}"!\n` +
        `Bot ${config.value.botName || 'Bot SONAI SI'} đã kết nối thành công với Chat ID: ${rec.chatId}.\n` +
        `Hiện có {tong_khach_hang} khách hàng ({so_khach_no} khách đang nợ, tổng nợ: {tong_cong_no} đ).`
    )
    const res = await sendZaloBotMessage({
      botToken: config.value.botToken,
      chatId: rec.chatId,
      text,
      source: 'test_button'
    })
    if (res && res.ok) {
      showBanner(`Đã gửi tin nhắn kiểm tra tới "${rec.name}" thành công!`, 'success')
      loadBotLogs()
    } else {
      showBanner('Gửi thất bại: ' + (res?.description || 'Lỗi API'), 'error')
    }
  } finally {
    sendingMessage.value = false
  }
}

const previewManualMessage = async () => {
  previewingManual.value = true
  try {
    manualPreviewText.value = await renderBotTemplate(manualCompose.text)
  } finally {
    previewingManual.value = false
  }
}

const sendManualMessageNow = async () => {
  if (!manualCompose.text.trim()) {
    showBanner('Vui lòng nhập nội dung tin nhắn.', 'error')
    return
  }
  sendingMessage.value = true
  try {
    const finalMsg = await renderBotTemplate(manualCompose.text)
    manualPreviewText.value = finalMsg

    if (manualCompose.targetChatId === '__all__') {
      const targets = config.value.recipients.filter(r => r.enabled && r.chatId)
      if (targets.length === 0) {
        showBanner('Chưa có nhóm nhận nào được bật.', 'error')
        return
      }
      let okCount = 0
      for (const rec of targets) {
        const r = await sendZaloBotMessage({
          botToken: config.value.botToken,
          chatId: rec.chatId,
          text: finalMsg,
          source: 'manual_broadcast'
        })
        if (r && r.ok) okCount++
      }
      showBanner(`Đã gửi thông tin vào ${okCount}/${targets.length} nhóm Zalo thành công!`, 'success')
    } else {
      const r = await sendZaloBotMessage({
        botToken: config.value.botToken,
        chatId: manualCompose.targetChatId,
        text: finalMsg,
        source: 'manual_direct'
      })
      if (r && r.ok) {
        showBanner('Đã gửi thông tin vào Zalo thành công!', 'success')
      } else {
        showBanner('Gửi thất bại: ' + (r?.description || 'Lỗi không xác định'), 'error')
      }
    }
    loadBotLogs()
  } finally {
    sendingMessage.value = false
  }
}

const addNewSchedule = () => {
  const defaultChat = config.value.recipients[0]?.chatId || '__all__'
  config.value.schedules.push({
    id: 'sched_' + Date.now(),
    name: 'Lịch gửi thông báo mới',
    time: '09:00',
    days: [1, 2, 3, 4, 5, 6],
    targetChatId: defaultChat,
    enabled: true,
    lastSentDate: '',
    template:
      '[THÔNG BÁO ĐỊNH KỲ - {date} {time}]\n' +
      '- Tổng số khách hàng: {tong_khach_hang} KH\n' +
      '- Số khách đang nợ: {so_khach_no} KH ({tong_cong_no} đ)\n\n' +
      '{chi_tiet_cong_no}'
  })
}

const toggleScheduleDay = (sched, dayVal) => {
  if (!Array.isArray(sched.days)) sched.days = []
  if (sched.days.includes(dayVal)) {
    sched.days = sched.days.filter(d => d !== dayVal)
  } else {
    sched.days.push(dayVal)
  }
}

const runScheduleNow = async (sched) => {
  sendingMessage.value = true
  try {
    const msgText = await renderBotTemplate(sched.template)
    const targetId = sched.targetChatId || config.value.recipients[0]?.chatId
    if (targetId === '__all__') {
      const activeRecs = config.value.recipients.filter(r => r.enabled && r.chatId)
      for (const rec of activeRecs) {
        await sendZaloBotMessage({
          botToken: config.value.botToken,
          chatId: rec.chatId,
          text: msgText,
          source: `schedule_manual:${sched.name}`
        })
      }
      showBanner(`Đã chạy gửi lịch "${sched.name}" tới ${activeRecs.length} nhóm Zalo!`, 'success')
    } else if (targetId) {
      const res = await sendZaloBotMessage({
        botToken: config.value.botToken,
        chatId: targetId,
        text: msgText,
        source: `schedule_manual:${sched.name}`
      })
      if (res && res.ok) {
        showBanner(`Đã chạy gửi lịch "${sched.name}" vào Zalo thành công!`, 'success')
      } else {
        showBanner('Lỗi khi gửi: ' + (res?.description || 'Không xác định'), 'error')
      }
    }
    loadBotLogs()
  } finally {
    sendingMessage.value = false
  }
}

const addNewCommand = () => {
  config.value.commands.push({
    id: 'cmd_' + Date.now(),
    keyword: '/thongbao',
    aliases: 'thongbao',
    description: 'Lệnh tùy chỉnh gửi thông tin nhanh',
    actionType: 'custom',
    enabled: true,
    template:
      '[THÔNG TIN TỪ BOT SONAI SI - {date} {time}]\n' +
      '- Tổng khách hàng: {tong_khach_hang} KH\n' +
      '- Tổng công nợ: {tong_cong_no} đ'
  })
}

const triggerCommandFromWeb = async (cmd, argVal = '') => {
  sendingMessage.value = true
  try {
    const replyText = await executeBotCommand(cmd, argVal, config.value.commands)
    const targetChat =
      config.value.recipients.find(r => r.enabled && r.chatId)?.chatId ||
      config.value.recipients[0]?.chatId
    if (!targetChat) {
      showBanner('Chưa có Chat ID nhóm nhận nào trong danh sách.', 'error')
      return
    }
    const res = await sendZaloBotMessage({
      botToken: config.value.botToken,
      chatId: targetChat,
      text: replyText,
      source: `web_cmd:${cmd.keyword}`
    })
    if (res && res.ok) {
      showBanner(`Đã thực thi lệnh "${cmd.keyword}" và gửi kết quả vào Zalo!`, 'success')
      loadBotLogs()
    } else {
      showBanner('Lỗi gửi kết quả lệnh: ' + (res?.description || 'Lỗi API'), 'error')
    }
  } finally {
    sendingMessage.value = false
  }
}

const checkZaloCommandsNow = async () => {
  showBanner('Đang kiểm tra tin nhắn lệnh từ Zalo...', 'info')
  const res = await pollZaloBotCommandsOnce(6)
  if (res && res.length > 0) {
    showBanner(`Đã nhận và phản hồi ${res.length} lệnh mới từ Zalo!`, 'success')
    loadBotLogs()
  } else {
    showBanner('Hiện không có lệnh mới nào đang chờ trên Zalo.', 'info')
  }
}

const loadBotLogs = async () => {
  try {
    const snap = await get(dbRef(database, 'zalo_bot_config/logs'))
    if (!snap.exists()) {
      botLogs.value = []
      return
    }
    const val = snap.val() || {}
    const list = Object.values(val).filter(x => x && typeof x === 'object')
    list.sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')))
    botLogs.value = list.slice(0, 50)
  } catch (e) {
    console.warn('Lỗi tải log Zalo Bot:', e)
  }
}

const clearBotLogs = async () => {
  if (!confirm('Xác nhận xoá lịch sử nhật ký gửi tin của Bot?')) return
  await remove(dbRef(database, 'zalo_bot_config/logs'))
  botLogs.value = []
  showBanner('Đã xoá lịch sử nhật ký gửi tin.', 'success')
}

const formatLogTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(async () => {
  config.value = await fetchZaloBotConfig()
  if (config.value.recipients.length > 0) {
    manualCompose.targetChatId = config.value.recipients[0].chatId
  }
  await checkBotConnection()
  await loadBotLogs()
})
</script>

<style scoped>
.zalo-bot-page {
  padding: 1.5rem 2rem;
  max-width: 100%;
  margin: 0 auto;
  color: #f8fafc;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 1.75rem;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #10b981;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #1e293b;
  border-radius: 16px;
  padding: 1.15rem 1.35rem;
  border: 1px solid #334155;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.25s;
}
.stat-card:hover {
  border-color: #10b981;
  transform: translateY(-2px);
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.stat-icon.blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
.stat-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.stat-icon.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 2px;
}
.stat-value {
  font-size: 1.45rem;
  font-weight: 800;
  color: #38bdf8;
  line-height: 1.1;
}

.tabs-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 14px;
  border-radius: 14px;
}

.tabs-left, .tabs-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 9px 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: #f8fafc;
  background: rgba(30, 41, 59, 0.6);
}
.tab-btn.active {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.45);
}

.status-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
  font-weight: 600;
}
.status-banner.success {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #34d399;
}
.status-banner.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.45);
  color: #f87171;
}
.status-banner.info {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #38bdf8;
}
.banner-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
}

.grid-2col {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 1.25rem;
}
@media (max-width: 1100px) {
  .grid-2col {
    grid-template-columns: 1fr;
  }
}

.col-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-section {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.55), rgba(15, 23, 42, 0.45));
  border-radius: 16px;
  padding: 1.35rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 0.95rem;
  color: #10b981;
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  padding-bottom: 0.75rem;
  margin: 0 0 1.15rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
}

.form-group {
  margin-bottom: 1rem;
}
.form-group.row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.form-group.row .col {
  flex: 1;
  min-width: 180px;
}
.form-group label {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: 0.75rem 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  font-size: 0.9rem;
  background: rgba(15, 23, 42, 0.7);
  color: #f8fafc;
  box-sizing: border-box;
  transition: all 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: #10b981;
  background: rgba(15, 23, 42, 0.95);
}

.inline-edit-input {
  background: transparent;
  border: 1px dashed rgba(148, 163, 184, 0.25);
  color: #f8fafc;
  font-weight: 700;
  font-size: 0.92rem;
  padding: 4px 8px;
  border-radius: 6px;
}
.inline-edit-input:focus {
  outline: none;
  border-color: #10b981;
  background: rgba(15, 23, 42, 0.8);
}

.list-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
}

.pill-badge {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary-dark {
  background: rgba(30, 41, 59, 0.85);
  color: #e2e8f0;
  border: 1px solid #334155;
  padding: 9px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.btn-secondary-dark:hover:not(:disabled) {
  border-color: #64748b;
  color: #ffffff;
}

.btn-mini {
  padding: 6px 11px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-mini.emerald {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.btn-mini.sky {
  background: rgba(56, 189, 248, 0.14);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}
.btn-mini.danger {
  background: rgba(239, 68, 68, 0.14);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.var-chip {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 0.72rem;
  font-family: monospace;
  cursor: pointer;
}
.var-chip:hover {
  background: rgba(56, 189, 248, 0.24);
}

.preview-box {
  background: rgba(2, 6, 23, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 10px;
  padding: 12px 14px;
  margin-top: 10px;
}

.switch-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #cbd5e1;
  cursor: pointer;
}
.switch-label input[type='checkbox'] {
  accent-color: #10b981;
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>
