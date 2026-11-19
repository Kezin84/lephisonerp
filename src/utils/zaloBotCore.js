export const DEFAULT_FIREBASE_DATABASE_URL =
  'https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app'

export const DEFAULT_BOT_TOKEN =
  '1563589356003514094:IQXjmlrjRECxVFrbKGrCBToMkXiwjEsamxjqPaOcWENyYzPzYYygUQgoYxHdCRge'

export const DEFAULT_INVITE_URL = 'https://bot.zaloplatforms.com/groups/invite/bot.QkJpMNVs'

export const DEFAULT_WORKER_TIMEZONE = 'Asia/Ho_Chi_Minh'

const escapeRegExp = (str) => String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const safeFirebaseKey = (raw) =>
  String(raw || 'item')
    .trim()
    .replace(/[.#$[\]/\\]/g, '_')
    .slice(0, 120) || 'item'

export const normalizeZaloChatType = (rawType, chatId = '') => {
  const t = String(rawType || '').trim().toUpperCase()
  if (t === 'PRIVATE' || t === 'USER' || t === 'DIRECT' || t === 'PERSONAL' || t === 'DM') {
    return 'USER'
  }
  if (t === 'GROUP' || t === 'SUPERGROUP' || t === 'CHANNEL') {
    return 'GROUP'
  }
  const cid = String(chatId || '').trim().toLowerCase()
  if (cid.startsWith('zgr-')) return 'GROUP'
  return cid ? 'USER' : 'GROUP'
}

export const extractZaloChatFromUpdate = (item) => {
  const msg = item?.message || item || {}
  const chatId = String(msg?.chat?.id || item?.chat?.id || msg?.from?.id || '').trim()
  const rawChatType = msg?.chat?.chat_type || msg?.chat?.type || item?.chat?.chat_type || ''
  const chatType = normalizeZaloChatType(rawChatType, chatId)
  const senderName = String(
    msg?.from?.display_name || msg?.from?.name || msg?.chat?.title || ''
  ).trim() || 'Người dùng Zalo'
  const groupTitle = String(msg?.chat?.title || msg?.chat?.name || '').trim()
  const displayName =
    chatType === 'GROUP'
      ? groupTitle || `Nhóm Zalo của ${senderName}`
      : `${senderName} (Cá nhân)`

  return {
    msg,
    msgId: msg?.message_id || item?.message_id || '',
    chatId,
    chatType,
    senderName,
    displayName,
    rawText: String(msg?.text || '').trim()
  }
}

export const upsertZaloRecipient = (recipients, info) => {
  if (!Array.isArray(recipients) || !info?.chatId) return { added: false, updated: false }
  const chatId = String(info.chatId).trim()
  const chatType = normalizeZaloChatType(info.chatType, chatId)
  const existing = recipients.find((r) => String(r?.chatId || '').trim() === chatId)
  if (!existing) {
    recipients.push({
      id: 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      chatId,
      name: info.displayName || (chatType === 'GROUP' ? `Nhóm Zalo (${chatId.slice(0, 10)})` : 'Người dùng Zalo (Cá nhân)'),
      type: chatType,
      enabled: true,
      autoCaptured: true,
      addedAt: new Date().toISOString()
    })
    return { added: true, updated: true }
  }
  let changed = false
  if (existing.type !== chatType) {
    existing.type = chatType
    changed = true
  }
  if (!existing.name && info.displayName) {
    existing.name = info.displayName
    changed = true
  }
  return { added: false, updated: changed }
}

export const removeDiacritics = (str) => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const formatNum = (val) => {
  const n = Number(val) || 0
  return n.toLocaleString('vi-VN')
}

const WEEKDAY_MAP = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
}

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export const TASK_SCHEDULES_VERSION = 2

const pad2 = (n) => String(n).padStart(2, '0')

const truncateText = (str, maxLen = 120) => {
  const clean = String(str || '').replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  if (clean.length <= maxLen) return clean
  return clean.slice(0, Math.max(1, maxLen - 1)).trimEnd() + '…'
}

const clampZaloMessage = (text, maxChars = 1900) => {
  const str = String(text || '').trim()
  if (str.length <= maxChars) return str
  const cut = str.slice(0, maxChars - 58)
  const lastNewline = cut.lastIndexOf('\n')
  const base = lastNewline > maxChars * 0.6 ? cut.slice(0, lastNewline) : cut
  return `${base.trimEnd()}\n... (xem đầy đủ danh sách trên web Report Firebase)`
}

/**
 * Compute date/time parts reliably in Vietnam timezone (UTC+7),
 * regardless of server (Cloudflare Workers runs in UTC) or client timezone.
 */
export const getVietnamDateParts = (date = new Date(), timeZone = DEFAULT_WORKER_TIMEZONE) => {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
      hour12: false
    })
    const parts = {}
    for (const p of fmt.formatToParts(date)) {
      if (p.type !== 'literal') parts[p.type] = p.value
    }
    const yearNum = Number(parts.year) || 1970
    const monthNum = Number(parts.month) || 1
    const dayNum = Number(parts.day) || 1
    const year = String(yearNum)
    const month = pad2(monthNum)
    const day = pad2(dayNum)
    const rawHour = Number(parts.hour)
    const hourNum = Number.isFinite(rawHour) ? (rawHour === 24 ? 0 : rawHour) : 0
    const minuteNum = Number(parts.minute) || 0
    const hour = pad2(hourNum)
    const minute = pad2(minuteNum)
    const dayOfWeek = WEEKDAY_MAP[parts.weekday] ?? date.getUTCDay()

    return {
      dateStr: `${day}/${month}/${year}`,
      timeStr: `${hour}:${minute}`,
      isoDateStr: `${year}-${month}-${day}`,
      dayOfWeek,
      weekdayLabel: WEEKDAY_LABELS[dayOfWeek] || '',
      yearNum,
      monthNum,
      dayNum,
      minutesOfDay: hourNum * 60 + minuteNum
    }
  } catch {
    const shifted = new Date(date.getTime() + 7 * 60 * 60 * 1000)
    const yearNum = shifted.getUTCFullYear()
    const monthNum = shifted.getUTCMonth() + 1
    const dayNum = shifted.getUTCDate()
    const y = String(yearNum)
    const m = pad2(monthNum)
    const d = pad2(dayNum)
    const hhNum = shifted.getUTCHours()
    const mmNum = shifted.getUTCMinutes()
    const hh = pad2(hhNum)
    const mm = pad2(mmNum)
    const dayOfWeek = shifted.getUTCDay()
    return {
      dateStr: `${d}/${m}/${y}`,
      timeStr: `${hh}:${mm}`,
      isoDateStr: `${y}-${m}-${d}`,
      dayOfWeek,
      weekdayLabel: WEEKDAY_LABELS[dayOfWeek] || '',
      yearNum,
      monthNum,
      dayNum,
      minutesOfDay: hhNum * 60 + mmNum
    }
  }
}

/**
 * Compute current week range (Monday -> Sunday) in Vietnam calendar date.
 */
export const getVietnamWeekRange = (vn) => {
  const todayUtcMs = Date.UTC(vn.yearNum, vn.monthNum - 1, vn.dayNum)
  const offsetFromMonday = (vn.dayOfWeek + 6) % 7
  const monday = new Date(todayUtcMs - offsetFromMonday * 86400000)
  const sunday = new Date(monday.getTime() + 6 * 86400000)

  const mY = monday.getUTCFullYear()
  const mM = pad2(monday.getUTCMonth() + 1)
  const mD = pad2(monday.getUTCDate())
  const sY = sunday.getUTCFullYear()
  const sM = pad2(sunday.getUTCMonth() + 1)
  const sD = pad2(sunday.getUTCDate())

  return {
    mondayIso: `${mY}-${mM}-${mD}`,
    sundayIso: `${sY}-${sM}-${sD}`,
    weekLabel: `${mD}/${mM} - ${sD}/${sM}`
  }
}

const parseReportDateTime = (thoiGianStr, createdTimeStr = '') => {
  const raw = String(thoiGianStr || '').trim()

  const buildResult = (y, m, d, hh = null, mm = 0) => {
    const year = Number(y)
    const month = Number(m)
    const day = Number(d)
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
    if (year < 2000 || month < 1 || month > 12 || day < 1 || day > 31) return null
    const hasHour = hh !== null && hh !== undefined && Number.isFinite(Number(hh))
    const hourNum = hasHour ? Math.max(0, Math.min(23, Number(hh))) : 0
    const minNum = hasHour && Number.isFinite(Number(mm)) ? Math.max(0, Math.min(59, Number(mm))) : 0
    return {
      isoDate: `${year}-${pad2(month)}-${pad2(day)}`,
      shortDate: `${pad2(day)}/${pad2(month)}`,
      fullDate: `${pad2(day)}/${pad2(month)}/${year}`,
      period: hasHour ? (hourNum < 12 ? 'Sáng' : 'Chiều') : '',
      periodOrder: hasHour ? (hourNum < 12 ? 0 : 1) : 2,
      sortTs: Date.UTC(year, month - 1, day, hourNum, minNum)
    }
  }

  // 1. Định dạng chuẩn của reportFIREBASE.vue: "HH:MM /thu /DD/MM/YYYY"
  if (raw) {
    const mReport = raw.match(
      /^(\d{1,2})\s*:\s*(\d{1,2})(?::\d{1,2})?\s*\/\s*\d+\s*\/\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/
    )
    if (mReport) {
      return buildResult(mReport[5], mReport[4], mReport[3], mReport[1], mReport[2])
    }

    // 2. "HH:MM DD/MM/YYYY"
    const mTimeDate = raw.match(/^(\d{1,2}):(\d{1,2})(?::\d{1,2})?[\s,.-]+(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (mTimeDate) {
      return buildResult(mTimeDate[5], mTimeDate[4], mTimeDate[3], mTimeDate[1], mTimeDate[2])
    }

    // 3. "DD/MM/YYYY" hoặc "DD/MM/YYYY HH:MM"
    const mDateTime = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[\s,]+(\d{1,2}):(\d{1,2}))?/)
    if (mDateTime) {
      return buildResult(
        mDateTime[3],
        mDateTime[2],
        mDateTime[1],
        mDateTime[4] !== undefined ? mDateTime[4] : null,
        mDateTime[5] || 0
      )
    }

    // 4. ISO "YYYY-MM-DD" hoặc "YYYY-MM-DDTHH:MM"
    const mIso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2}))?/)
    if (mIso) {
      return buildResult(
        mIso[1],
        mIso[2],
        mIso[3],
        mIso[4] !== undefined ? mIso[4] : null,
        mIso[5] || 0
      )
    }
  }

  // Fallback sang created_time nếu thoi_gian trống hoặc không hợp lệ
  const cRaw = String(createdTimeStr || '').trim()
  if (cRaw && cRaw !== raw) {
    const parsedFromCreated = parseReportDateTime(cRaw, '')
    if (parsedFromCreated) return parsedFromCreated
    const parsedMs = Date.parse(cRaw)
    if (Number.isFinite(parsedMs)) {
      const cVn = getVietnamDateParts(new Date(parsedMs))
      return {
        isoDate: cVn.isoDateStr,
        shortDate: `${pad2(cVn.dayNum)}/${pad2(cVn.monthNum)}`,
        fullDate: cVn.dateStr,
        period: cVn.minutesOfDay < 12 * 60 ? 'Sáng' : 'Chiều',
        periodOrder: cVn.minutesOfDay < 12 * 60 ? 0 : 1,
        sortTs: Date.UTC(cVn.yearNum, cVn.monthNum - 1, cVn.dayNum, Math.floor(cVn.minutesOfDay / 60), cVn.minutesOfDay % 60)
      }
    }
  }

  return {
    isoDate: '',
    shortDate: '',
    fullDate: '',
    period: '',
    periodOrder: 2,
    sortTs: 0
  }
}

const parseCreatedSortTs = (createdTimeStr, fbKey = '', fallbackTs = 0) => {
  const cRaw = String(createdTimeStr || '').trim()
  if (cRaw) {
    const parsed = parseReportDateTime(cRaw, '')
    if (parsed && parsed.sortTs > 0) return parsed.sortTs
    const ms = Date.parse(cRaw)
    if (Number.isFinite(ms)) return ms
  }
  const numFromKey = Number(String(fbKey || '').replace(/[^\d]/g, '').slice(-13))
  if (Number.isFinite(numFromKey) && numFromKey > 1000000000) return numFromKey
  return fallbackTs || 0
}

export const parseTimeToMinutes = (hhmm) => {
  const m = String(hhmm || '').trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null
  return hh * 60 + mm
}

export const isScheduleDueNow = (sched, vnNow, graceMinutes = 1) => {
  if (!sched || !sched.enabled || !sched.time) return false
  const allowedDays = Array.isArray(sched.days) ? sched.days.map(Number) : [0, 1, 2, 3, 4, 5, 6]
  if (!allowedDays.includes(vnNow.dayOfWeek)) return false
  if (sched.lastSentDate === vnNow.isoDateStr) return false

  const targetMin = parseTimeToMinutes(sched.time)
  if (targetMin === null) return false

  const diff = vnNow.minutesOfDay - targetMin
  return diff >= 0 && diff <= graceMinutes
}

export const buildMorningTasksScheduleDefault = () => ({
  id: 'sched_morning_tasks',
  name: 'Nhắc việc chưa làm trong tuần (07:00 sáng)',
  time: '07:00',
  days: [0, 1, 2, 3, 4, 5, 6],
  targetChatId: '__all__',
  enabled: true,
  lastSentDate: '',
  template:
    '[VIỆC CHƯA LÀM TRONG TUẦN - {time} | {thu} {date}]\n' +
    '{ban_tin_viec_sang}'
})

export const buildAfternoonTasksScheduleDefault = () => ({
  id: 'sched_afternoon_tasks',
  name: 'Tổng kết cuối ngày & việc tồn tuần (17:20 chiều)',
  time: '17:20',
  days: [0, 1, 2, 3, 4, 5, 6],
  targetChatId: '__all__',
  enabled: true,
  lastSentDate: '',
  template:
    '[TỔNG KẾT CUỐI NGÀY - {time} | {thu} {date}]\n\n' +
    '{ban_tin_tong_ket_chieu}'
})

export const buildBaseBotConfig = (sysZalo = {}) => {
  const token = String(sysZalo.defaultBotToken || DEFAULT_BOT_TOKEN).trim()
  const invite = String(sysZalo.defaultInviteUrl || DEFAULT_INVITE_URL).trim()
  return {
    botToken: token,
    botName: 'Bot SONAI SI',
    botAccount: 'bot.QkJpMNVs',
    inviteGroupUrl: invite,
    enabled: true,
    commandListenerEnabled: true,
    taskSchedulesVersion: TASK_SCHEDULES_VERSION,
    recipients: [
      {
        id: 'rec_group_main',
        chatId: 'zgr-176c478134e0ddbe84f1',
        name: 'Nhóm Zalo Thông Báo Chung',
        type: 'GROUP',
        enabled: true,
        addedAt: new Date().toISOString()
      },
      {
        id: 'rec_user_dinhanh',
        chatId: '211e41e32fadc6f39fbc',
        name: 'Đình Anh (Cá nhân)',
        type: 'USER',
        enabled: false,
        addedAt: new Date().toISOString()
      }
    ],
    schedules: [
      buildMorningTasksScheduleDefault(),
      {
        id: 'sched_morning_debt',
        name: 'Báo cáo Công nợ đầu ngày',
        time: '08:30',
        days: [1, 2, 3, 4, 5, 6],
        targetChatId: 'zgr-176c478134e0ddbe84f1',
        enabled: true,
        lastSentDate: '',
        template:
          '[BÁO CÁO CÔNG NỢ ĐẦU NGÀY - {date}]\n' +
          '- Tổng số khách hàng: {tong_khach_hang} KH\n' +
          '- Số khách đang nợ: {so_khach_no} KH\n' +
          '- Tổng công nợ phải thu: {tong_cong_no} đ\n\n' +
          'Chi tiết khách nợ:\n{chi_tiet_cong_no}'
      },
      buildAfternoonTasksScheduleDefault()
    ],
    commands: [
      {
        id: 'cmd_congno',
        keyword: '/congno',
        aliases: 'congno, no, baocaono',
        description: 'Xem tổng hợp các khách hàng đang có công nợ',
        actionType: 'debt_summary',
        enabled: true,
        template:
          '[TRA CỨU CÔNG NỢ KHÁCH HÀNG - {date} {time}]\n' +
          '- Số khách đang nợ: {so_khach_no} KH\n' +
          '- Tổng công nợ: {tong_cong_no} đ\n\n' +
          '{chi_tiet_cong_no}'
      },
      {
        id: 'cmd_khachhang',
        keyword: '/kh',
        aliases: 'kh, khachhang, timkh',
        description: 'Tra cứu khách hàng theo tên công ty, tên khách hoặc MST (VD: /kh global)',
        actionType: 'customer_lookup',
        enabled: true,
        template:
          '[KẾT QUẢ TRA CỨU KHÁCH HÀNG]\n' +
          'Từ khóa: "{arg}"\n\n' +
          '{ket_qua_tra_cuu}'
      },
      {
        id: 'cmd_congviec',
        keyword: '/congviec',
        aliases: 'congviec, baocao, viec',
        description: 'Xem danh sách các công việc chưa hoàn thành',
        actionType: 'task_summary',
        enabled: true,
        template:
          '[DANH SÁCH CÔNG VIỆC CHƯA HOÀN THÀNH - {date}]\n\n' +
          '{cong_viec_chua_xong}'
      },
      {
        id: 'cmd_hanghoa',
        keyword: '/gia',
        aliases: 'gia, sp, hanghoa',
        description: 'Tra cứu nhanh giá & thông tin hàng hóa theo mã hoặc tên (VD: /gia sophos)',
        actionType: 'product_lookup',
        enabled: true,
        template:
          '[KẾT QUẢ TRA CỨU HÀNG HÓA]\n' +
          'Từ khóa: "{arg}"\n\n' +
          '{ket_qua_tra_cuu}'
      },
      {
        id: 'cmd_trogiup',
        keyword: '/trogiup',
        aliases: 'trogiup, help, menu, alo',
        description: 'Hiển thị danh sách các lệnh điều khiển Bot hiện có',
        actionType: 'help_menu',
        enabled: true,
        template:
          '[DANH SÁCH LỆNH ĐIỀU KHIỂN BOT SONAI SI]\n' +
          'Gõ @Bot SONAI SI kèm lệnh bên dưới:\n' +
          '{danh_sach_lenh}'
      }
    ],
    eventTriggers: {
      onPaymentRecorded: {
        enabled: true,
        name: 'Khi ghi nhận thanh toán công nợ mới',
        targetChatId: 'zgr-176c478134e0ddbe84f1',
        template:
          '[GHI NHẬN THANH TOÁN MỚI]\n' +
          '- Khách hàng: {ten_khach_hang}\n' +
          '- Mã KH: {ma_khach_hang}\n' +
          '- Số PO: {so_po}\n' +
          '- Số tiền vừa thanh toán: {so_tien_thanh_toan} đ\n' +
          '- Công nợ còn lại của PO: {cong_no_con_lai} đ\n' +
          '- Thời gian: {thoi_gian}\n' +
          '- Ghi chú: {ghi_chu}'
      },
      onCustomerCreated: {
        enabled: true,
        name: 'Khi thêm mới khách hàng',
        targetChatId: 'zgr-176c478134e0ddbe84f1',
        template:
          '[KHÁCH HÀNG MỚI ĐƯỢC TẠO]\n' +
          '- Mã KH: {ma_khach_hang}\n' +
          '- Tên công ty: {ten_cong_ty}\n' +
          '- Người nhận: {ten_khach_hang}\n' +
          '- MST: {mst}\n' +
          '- Địa chỉ: {dia_chi}\n' +
          '- Thời gian tạo: {thoi_gian}'
      }
    }
  }
}

export const normalizeBotConfigWithDefault = (raw, sysZalo = {}) => {
  const def = buildBaseBotConfig(sysZalo)
  if (!raw || typeof raw !== 'object') return def

  let normalizedSchedules =
    Array.isArray(raw.schedules) && raw.schedules.length > 0
      ? raw.schedules.map((s) => ({
          ...s,
          days: Array.isArray(s.days) ? s.days.map(Number) : [0, 1, 2, 3, 4, 5, 6]
        }))
      : raw.schedules && typeof raw.schedules === 'object'
        ? Object.values(raw.schedules).map((s) => ({
            ...s,
            days: Array.isArray(s.days) ? s.days.map(Number) : [0, 1, 2, 3, 4, 5, 6]
          }))
        : def.schedules

  // Tự động bổ sung lịch 07:00 sáng & nâng cấp lịch 17:20 chiều 1 lần duy nhất cho cấu hình cũ trên Firebase
  const currentVersion = Number(raw.taskSchedulesVersion || 0)
  if (currentVersion < TASK_SCHEDULES_VERSION) {
    const morningDef = buildMorningTasksScheduleDefault()
    const afternoonDef = buildAfternoonTasksScheduleDefault()

    const hasMorning = normalizedSchedules.some((s) => s && s.id === 'sched_morning_tasks')
    if (!hasMorning) {
      normalizedSchedules = [morningDef, ...normalizedSchedules]
    }

    const aftIdx = normalizedSchedules.findIndex((s) => s && s.id === 'sched_afternoon_tasks')
    if (aftIdx >= 0) {
      const oldAft = normalizedSchedules[aftIdx]
      const isLegacyPlaceholder =
        String(oldAft.template || '').includes('{cong_viec_chua_xong}') ||
        (oldAft.time === '17:00' && oldAft.enabled === false)
      if (isLegacyPlaceholder) {
        normalizedSchedules[aftIdx] = {
          ...afternoonDef,
          lastSentDate: oldAft.lastSentDate || ''
        }
      }
    } else {
      normalizedSchedules = [...normalizedSchedules, afternoonDef]
    }
  }

  return {
    botToken: String(raw.botToken || def.botToken).trim(),
    botName: String(raw.botName || def.botName).trim(),
    botAccount: String(raw.botAccount || def.botAccount).trim(),
    inviteGroupUrl: String(raw.inviteGroupUrl || def.inviteGroupUrl).trim(),
    enabled: raw.enabled !== undefined ? Boolean(raw.enabled) : def.enabled,
    commandListenerEnabled:
      raw.commandListenerEnabled !== undefined
        ? Boolean(raw.commandListenerEnabled)
        : def.commandListenerEnabled,
    taskSchedulesVersion: TASK_SCHEDULES_VERSION,
    recipients: (
      Array.isArray(raw.recipients) && raw.recipients.length > 0
        ? raw.recipients
        : raw.recipients && typeof raw.recipients === 'object'
          ? Object.values(raw.recipients)
          : def.recipients
    )
      .filter((r) => r && typeof r === 'object' && r.chatId)
      .map((r) => ({
        ...r,
        chatId: String(r.chatId).trim(),
        type: normalizeZaloChatType(r.type, r.chatId)
      })),
    schedules: normalizedSchedules,
    commands:
      Array.isArray(raw.commands) && raw.commands.length > 0
        ? raw.commands
        : raw.commands && typeof raw.commands === 'object'
          ? Object.values(raw.commands)
          : def.commands,
    eventTriggers: {
      onPaymentRecorded: {
        ...def.eventTriggers.onPaymentRecorded,
        ...(raw.eventTriggers?.onPaymentRecorded || {})
      },
      onCustomerCreated: {
        ...def.eventTriggers.onCustomerCreated,
        ...(raw.eventTriggers?.onCustomerCreated || {})
      }
    }
  }
}

const resolveCustomerLabelFromMaKH = (rawMaKH, customerNameById) => {
  const ids = Array.isArray(rawMaKH)
    ? rawMaKH.map((x) => String(x || '').trim()).filter(Boolean)
    : String(rawMaKH || '')
        .split(/[,;|]+/)
        .map((x) => x.trim())
        .filter(Boolean)
  if (ids.length === 0) return ''
  const names = []
  for (const id of ids) {
    const label = customerNameById[id] || id
    if (label && !names.includes(label)) names.push(label)
  }
  return truncateText(names.join(', '), 46)
}

const normalizeReportTask = (fbKey, raw, customerNameById) => {
  if (!raw || typeof raw !== 'object') return null

  const noiDung = truncateText(
    raw.noi_dung ?? raw.NOI_DUNG ?? raw.noi_dung_cong_viec ?? raw.tieu_de ?? '',
    130
  )
  if (!noiDung) return null

  const ghiChu = truncateText(raw.ghi_chu ?? raw.GHI_CHU ?? '', 85)
  const thoiGian = String(raw.thoi_gian ?? raw.THOI_GIAN ?? raw.thoi_han ?? raw.deadline ?? '').trim()
  const createdTime = String(raw.created_time ?? raw.CREATED_TIME ?? '').trim()
  const trangThai = String(raw.trang_thai ?? raw.TRANG_THAI ?? raw.status ?? '').trim()
  const phanLoai = String(raw.phan_loai ?? raw.PHAN_LOAI ?? '').trim()
  const tagStr = String(raw.tag ?? raw.TAG ?? '').trim()
  const maKH = raw.maKH ?? raw.MAKH ?? raw.ma_khach_hang ?? raw.Ma_khach_hang ?? ''
  const pinned = raw.pinned === true || String(raw.pinned || '').toUpperCase() === 'TRUE'
  const isFailedFlag = raw.isFailed === true || String(raw.isFailed || '').toUpperCase() === 'TRUE'

  const statusLower = trangThai.toLowerCase()
  const isDone = statusLower.includes('hoàn thành') || statusLower.includes('đã xong')
  const isFailed =
    !isDone &&
    (isFailedFlag ||
      statusLower === 'failed' ||
      statusLower.includes('thất bại') ||
      statusLower.includes('huỷ') ||
      statusLower.includes('hủy'))
  const isPending = !isDone && !isFailed

  const tagNorm = removeDiacritics(tagStr).toUpperCase()
  const isPriority = tagNorm.includes('UU TIEN') || pinned

  const phanLoaiNorm = removeDiacritics(phanLoai).toUpperCase()
  const isLife = phanLoaiNorm.includes('DOI SONG')

  const dt = parseReportDateTime(thoiGian, createdTime)
  const createdSortTs = parseCreatedSortTs(createdTime, fbKey, dt.sortTs)
  const customerLabel = resolveCustomerLabelFromMaKH(maKH, customerNameById)

  return {
    id: String(fbKey || ''),
    noiDung,
    ghiChu,
    isoDate: dt.isoDate,
    shortDate: dt.shortDate,
    fullDate: dt.fullDate,
    period: dt.period,
    periodOrder: dt.periodOrder,
    sortTs: dt.sortTs,
    createdSortTs,
    isDone,
    isFailed,
    isPending,
    isPriority,
    isLife,
    customerLabel
  }
}

const buildTaskTagsPrefix = (t, { includePeriod = false } = {}) => {
  const parts = []
  if (includePeriod && t.period) parts.push(`[${t.period}]`)
  if (t.isPriority) parts.push('[ƯU TIÊN]')
  if (t.isLife) parts.push('[ĐỜI SỐNG]')
  return parts.length > 0 ? parts.join(' ') + ' ' : ''
}

const formatMorningWeeklyTasksDigest = ({
  weekLabel,
  todayPending,
  weekOtherPending,
  prevWeeksPendingCount
}) => {
  const totalWeekPending = todayPending.length + weekOtherPending.length
  const totalPriority =
    todayPending.filter((t) => t.isPriority).length +
    weekOtherPending.filter((t) => t.isPriority).length

  const lines = []
  if (totalWeekPending === 0) {
    lines.push(`Tuần ${weekLabel} • Hiện không có công việc nào chưa xử lý trong tuần này.`)
  } else {
    lines.push(
      `Tuần ${weekLabel} • Còn ${totalWeekPending} việc chưa xử lý` +
        (totalPriority > 0 ? ` (${totalPriority} ưu tiên)` : '')
    )
  }

  const MAX_TOTAL_DISPLAY = 15
  const shownToday = todayPending.slice(0, Math.min(10, MAX_TOTAL_DISPLAY))
  const remainingSlots = Math.max(0, MAX_TOTAL_DISPLAY - shownToday.length)
  const shownWeekOther = weekOtherPending.slice(0, remainingSlots)

  let seq = 1

  if (shownToday.length > 0) {
    lines.push('')
    lines.push(`◆ HÔM NAY (${todayPending.length} việc)`)
    for (const t of shownToday) {
      const prefix = buildTaskTagsPrefix(t, { includePeriod: true })
      lines.push(`${seq++}. ${prefix}${t.noiDung}`)
      if (t.customerLabel) {
        lines.push(`   • KH: ${t.customerLabel}`)
      }
      if (t.ghiChu) {
        lines.push(`   • Ghi chú: ${t.ghiChu}`)
      }
    }
    if (todayPending.length > shownToday.length) {
      lines.push(`   ... và ${todayPending.length - shownToday.length} việc hôm nay khác.`)
    }
  }

  if (shownWeekOther.length > 0) {
    lines.push('')
    lines.push(`◆ MỚI TRONG TUẦN NÀY (${weekOtherPending.length} việc)`)
    for (const t of shownWeekOther) {
      const prefix = buildTaskTagsPrefix(t, { includePeriod: false })
      lines.push(`${seq++}. ${prefix}${t.noiDung}`)
      const metaParts = []
      if (t.shortDate) {
        metaParts.push(t.period ? `${t.shortDate} (${t.period})` : t.shortDate)
      } else if (t.period) {
        metaParts.push(t.period)
      }
      if (t.customerLabel) {
        metaParts.push(`KH: ${t.customerLabel}`)
      }
      if (metaParts.length > 0) {
        lines.push(`   • ${metaParts.join(' | ')}`)
      }
      if (t.ghiChu) {
        lines.push(`   • Ghi chú: ${t.ghiChu}`)
      }
    }
  }

  const hiddenWeekOther = weekOtherPending.length - shownWeekOther.length
  if (hiddenWeekOther > 0) {
    lines.push(`... và ${hiddenWeekOther} công việc khác trong tuần.`)
  }

  if (prevWeeksPendingCount > 0) {
    lines.push('')
    lines.push('────────────────────')
    lines.push(
      `▸ Lưu ý: Còn ${prevWeeksPendingCount} việc tồn từ tuần trước chưa xử lý (xem trên web hoặc nhắn /congviec).`
    )
  }

  return clampZaloMessage(lines.join('\n'))
}

const formatAfternoonDailyWeeklySummary = ({
  weekLabel,
  todayAll,
  todayDone,
  todayPending,
  todayFailed,
  weekOtherPending,
  prevWeeksPendingCount
}) => {
  const lines = []
  const totalToday = todayAll.length
  const pct = totalToday > 0 ? Math.round((todayDone.length / totalToday) * 100) : 0

  lines.push(`◆ THỐNG KÊ HÔM NAY (Tổng: ${totalToday} việc)`)
  if (totalToday === 0) {
    lines.push('• Hôm nay chưa ghi nhận công việc nào.')
  } else {
    lines.push(
      `• Hoàn thành: ${todayDone.length} (${pct}%) | Chưa xong: ${todayPending.length} | Thất bại: ${todayFailed.length}`
    )
  }

  if (todayDone.length > 0) {
    lines.push('')
    lines.push(`✓ ĐÃ HOÀN THÀNH HÔM NAY (${todayDone.length})`)
    const shownDone = todayDone.slice(0, 8)
    shownDone.forEach((t, idx) => {
      const prefix = buildTaskTagsPrefix(t, { includePeriod: true })
      const cust = t.customerLabel ? ` [${t.customerLabel}]` : ''
      lines.push(`${idx + 1}. ${prefix}${t.noiDung}${cust}`)
    })
    if (todayDone.length > shownDone.length) {
      lines.push(`... và ${todayDone.length - shownDone.length} việc đã hoàn thành khác.`)
    }
  }

  if (todayPending.length > 0) {
    lines.push('')
    lines.push(`○ CHƯA XONG HÔM NAY (${todayPending.length})`)
    const shownTodayPending = todayPending.slice(0, 8)
    shownTodayPending.forEach((t, idx) => {
      const prefix = buildTaskTagsPrefix(t, { includePeriod: true })
      const cust = t.customerLabel ? ` [${t.customerLabel}]` : ''
      lines.push(`${idx + 1}. ${prefix}${t.noiDung}${cust}`)
    })
    if (todayPending.length > shownTodayPending.length) {
      lines.push(`... và ${todayPending.length - shownTodayPending.length} việc chưa xong khác.`)
    }
  }

  if (todayFailed.length > 0) {
    lines.push('')
    lines.push(`× THẤT BẠI HÔM NAY (${todayFailed.length})`)
    const shownFailed = todayFailed.slice(0, 5)
    shownFailed.forEach((t, idx) => {
      const prefix = buildTaskTagsPrefix(t, { includePeriod: true })
      const cust = t.customerLabel ? ` [${t.customerLabel}]` : ''
      lines.push(`${idx + 1}. ${prefix}${t.noiDung}${cust}`)
    })
    if (todayFailed.length > shownFailed.length) {
      lines.push(`... và ${todayFailed.length - shownFailed.length} việc thất bại khác.`)
    }
  }

  const totalWeekPending = todayPending.length + weekOtherPending.length
  lines.push('')
  lines.push('────────────────────')
  if (totalWeekPending === 0) {
    lines.push(`◆ TỒN CHƯA LÀM TRONG TUẦN (${weekLabel}): 0 việc`)
    lines.push('• Đã hoàn thành toàn bộ công việc trong tuần.')
  } else {
    lines.push(`◆ TỒN CHƯA LÀM TRONG TUẦN (${weekLabel}): Tổng ${totalWeekPending} việc`)
    if (todayPending.length > 0 && weekOtherPending.length > 0) {
      lines.push(
        `(Gồm ${todayPending.length} việc hôm nay ở trên + ${weekOtherPending.length} việc ngày khác trong tuần)`
      )
    } else if (todayPending.length > 0 && weekOtherPending.length === 0) {
      lines.push(`(Toàn bộ là ${todayPending.length} việc hôm nay đã liệt kê ở trên)`)
    }

    if (weekOtherPending.length > 0) {
      lines.push('')
      const shownWeekOther = weekOtherPending.slice(0, 10)
      for (const t of shownWeekOther) {
        const prefix = buildTaskTagsPrefix(t, { includePeriod: false })
        const dateTag = t.shortDate
          ? t.period
            ? `${t.shortDate} (${t.period}) - `
            : `${t.shortDate} - `
          : t.period
            ? `(${t.period}) - `
            : ''
        const cust = t.customerLabel ? ` [${t.customerLabel}]` : ''
        lines.push(`▸ ${prefix}${dateTag}${t.noiDung}${cust}`)
      }
      if (weekOtherPending.length > shownWeekOther.length) {
        lines.push(`... và ${weekOtherPending.length - shownWeekOther.length} việc khác trong tuần.`)
      }
    }
  }

  if (prevWeeksPendingCount > 0) {
    lines.push('')
    lines.push(`▸ Tuần trước còn ${prevWeeksPendingCount} việc tồn chưa xử lý.`)
  }

  return clampZaloMessage(lines.join('\n'))
}

const formatAllPendingTasksSummary = (allPending, vn) => {
  if (!allPending || allPending.length === 0) {
    return 'Hiện không có công việc nào chưa xử lý.'
  }
  const lines = [`Tổng: ${allPending.length} công việc chưa xử lý (mới nhất lên đầu)`, '']
  const shown = allPending.slice(0, 15)
  shown.forEach((t, idx) => {
    const isToday = t.isoDate === vn.isoDateStr
    const prefix = buildTaskTagsPrefix(t, { includePeriod: isToday })
    const datePart = isToday
      ? 'Hôm nay'
      : t.shortDate
        ? t.period
          ? `${t.shortDate} (${t.period})`
          : t.shortDate
        : t.period || ''
    const cust = t.customerLabel ? ` [${t.customerLabel}]` : ''
    lines.push(`${idx + 1}. ${prefix}${datePart ? `${datePart} - ` : ''}${t.noiDung}${cust}`)
  })
  if (allPending.length > shown.length) {
    lines.push(`... và ${allPending.length - shown.length} công việc khác.`)
  }
  return clampZaloMessage(lines.join('\n'))
}

export const buildContextFromDatasets = ({ khVal = {}, srVal = {}, repVal = {}, now = new Date() } = {}) => {
  const vn = getVietnamDateParts(now)
  const weekRange = getVietnamWeekRange(vn)
  const customersList = []
  const debtCustomers = []
  const customerNameById = {}
  let totalDebt = 0

  const debtByMaKH = {}
  Object.values(srVal || {}).forEach((sr) => {
    if (!sr || typeof sr !== 'object') return
    const maKH = String(sr.Ma_khach_hang || sr.ma_khach_hang || '').trim()
    if (!maKH) return
    const tSau =
      Number(sr.Tong_tien_sau_thueVAT) > 0
        ? Number(sr.Tong_tien_sau_thueVAT)
        : (Number(sr.Tong_tien_truoc_thueVAT) || 0) + (Number(sr.Tong_thueVAT) || 0)
    const daTT = Number(sr.so_tien_da_thanh_toan) || 0
    const cn =
      sr.cong_no !== undefined && sr.cong_no !== null && sr.cong_no !== ''
        ? Math.max(0, Number(sr.cong_no) || 0)
        : Math.max(0, tSau - daTT)
    debtByMaKH[maKH] = (debtByMaKH[maKH] || 0) + cn
  })

  Object.entries(khVal || {}).forEach(([fbKey, raw]) => {
    if (!raw || typeof raw !== 'object') return
    const maKH = String(raw.ma_khach_hang || raw.Ma_khach_hang || fbKey).trim()
    const congNo = debtByMaKH[maKH] !== undefined ? debtByMaKH[maKH] : Number(raw.cong_no) || 0
    const displayName = String(
      raw.ten_cong_ty || raw.Ten_cong_ty || raw.ten_khach_hang || raw.Ten_khach_hang || maKH
    ).trim()
    if (maKH && displayName) {
      customerNameById[maKH] = displayName
    }
    if (fbKey && displayName && !customerNameById[fbKey]) {
      customerNameById[fbKey] = displayName
    }
    const item = {
      ...raw,
      ma_khach_hang: maKH,
      cong_no: congNo
    }
    customersList.push(item)
    if (congNo > 0) {
      debtCustomers.push(item)
      totalDebt += congNo
    }
  })

  debtCustomers.sort((a, b) => (b.cong_no || 0) - (a.cong_no || 0))

  // Tổng hợp dữ liệu công việc từ bảng REPORT (reportFIREBASE.vue)
  const allTasks = []
  Object.entries(repVal || {}).forEach(([fbKey, raw]) => {
    const task = normalizeReportTask(fbKey, raw, customerNameById)
    if (task) allTasks.push(task)
  })

  const sortTodayPending = (a, b) => {
    if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1
    if (a.periodOrder !== b.periodOrder) return a.periodOrder - b.periodOrder
    return (b.createdSortTs || b.sortTs) - (a.createdSortTs || a.sortTs)
  }

  const sortTodayDoneOrFailed = (a, b) => {
    if (a.periodOrder !== b.periodOrder) return a.periodOrder - b.periodOrder
    return (b.createdSortTs || b.sortTs) - (a.createdSortTs || a.sortTs)
  }

  // Ưu tiên hiển thị công việc mới nhất lên đầu trong tuần
  const sortNewestFirst = (a, b) => {
    if (a.isoDate !== b.isoDate) {
      return String(b.isoDate || '').localeCompare(String(a.isoDate || ''))
    }
    if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1
    return (b.createdSortTs || b.sortTs) - (a.createdSortTs || a.sortTs)
  }

  const todayAll = allTasks.filter((t) => t.isoDate === vn.isoDateStr)
  const todayDone = todayAll.filter((t) => t.isDone).sort(sortTodayDoneOrFailed)
  const todayPending = todayAll.filter((t) => t.isPending).sort(sortTodayPending)
  const todayFailed = todayAll.filter((t) => t.isFailed).sort(sortTodayDoneOrFailed)

  const weekOtherPending = allTasks
    .filter(
      (t) =>
        t.isPending &&
        t.isoDate &&
        t.isoDate >= weekRange.mondayIso &&
        t.isoDate <= weekRange.sundayIso &&
        t.isoDate !== vn.isoDateStr
    )
    .sort(sortNewestFirst)

  const prevWeeksPendingCount = allTasks.filter(
    (t) => t.isPending && t.isoDate && t.isoDate < weekRange.mondayIso
  ).length

  const allPending = allTasks.filter((t) => t.isPending).sort(sortNewestFirst)

  const morningWeeklyTasksDigest = formatMorningWeeklyTasksDigest({
    weekLabel: weekRange.weekLabel,
    todayPending,
    weekOtherPending,
    prevWeeksPendingCount
  })

  const afternoonDailyWeeklySummary = formatAfternoonDailyWeeklySummary({
    weekLabel: weekRange.weekLabel,
    todayAll,
    todayDone,
    todayPending,
    todayFailed,
    weekOtherPending,
    prevWeeksPendingCount
  })

  const incompleteTasksText = formatAllPendingTasksSummary(allPending, vn)

  const debtDetailLines =
    debtCustomers.length > 0
      ? debtCustomers
          .slice(0, 15)
          .map(
            (c, idx) =>
              `${idx + 1}. ${c.ten_cong_ty || c.ten_khach_hang || c.ma_khach_hang} (${c.ma_khach_hang}): ${formatNum(c.cong_no)} đ`
          )
          .join('\n') +
        (debtCustomers.length > 15 ? `\n... và ${debtCustomers.length - 15} khách hàng khác.` : '')
      : 'Hiện không có khách hàng nào còn công nợ.'

  return {
    date: vn.dateStr,
    time: vn.timeStr,
    thu: vn.weekdayLabel,
    tuan_hien_tai: weekRange.weekLabel,
    tong_khach_hang: customersList.length,
    so_khach_no: debtCustomers.length,
    tong_cong_no: formatNum(totalDebt),
    chi_tiet_cong_no: debtDetailLines,
    so_viec_chua_lam_tuan: todayPending.length + weekOtherPending.length,
    so_viec_hom_nay_chua_xong: todayPending.length,
    so_viec_ton_tuan_truoc: prevWeeksPendingCount,
    ban_tin_viec_sang: morningWeeklyTasksDigest,
    ban_tin_tong_ket_chieu: afternoonDailyWeeklySummary,
    cong_viec_chua_xong: incompleteTasksText,
    _customersList: customersList
  }
}

export const interpolateTemplate = (templateStr, ctxVars = {}, extraVars = {}) => {
  const merged = { ...ctxVars, ...extraVars }
  let out = String(templateStr || '')
  Object.entries(merged).forEach(([k, v]) => {
    if (k.startsWith('_')) return
    out = out.replace(new RegExp(`\\{${escapeRegExp(k)}\\}`, 'g'), String(v ?? ''))
  })
  return out
}

export const resolveBotCommandText = ({ cmdObj, argStr = '', allCommands = [], ctx = {}, hhVal = null }) => {
  const cleanArg = String(argStr || '').trim()
  const qNorm = removeDiacritics(cleanArg).toLowerCase()
  let ketQuaTraCuu = ''

  if (cmdObj.actionType === 'customer_lookup') {
    const list = ctx._customersList || []
    const matched = cleanArg
      ? list.filter((c) => {
          const blob = removeDiacritics(
            `${c.ma_khach_hang || ''} ${c.ten_cong_ty || ''} ${c.ten_khach_hang || ''} ${c.mst || ''} ${c.so_dien_thoai_ca_nhan || ''}`
          ).toLowerCase()
          return blob.includes(qNorm)
        })
      : list.slice(0, 5)

    if (matched.length === 0) {
      ketQuaTraCuu = `Không tìm thấy khách hàng nào khớp với "${cleanArg}".`
    } else {
      ketQuaTraCuu = matched
        .slice(0, 5)
        .map(
          (c, i) =>
            `${i + 1}. ${c.ten_cong_ty || c.ten_khach_hang}\n` +
            `   - Mã KH: ${c.ma_khach_hang}\n` +
            `   - Người nhận: ${c.ten_khach_hang || 'Chưa có'}\n` +
            `   - SĐT: ${c.so_dien_thoai_ca_nhan || c.so_dien_thoai_cong_ty || 'Chưa có'}\n` +
            `   - MST: ${c.mst || 'Chưa có'}\n` +
            `   - Địa chỉ: ${c.dia_chi_cong_ty || 'Chưa có'}\n` +
            `   - Công nợ: ${formatNum(c.cong_no)} đ`
        )
        .join('\n\n')
    }
  } else if (cmdObj.actionType === 'product_lookup') {
    if (!hhVal) {
      ketQuaTraCuu = 'Lỗi khi truy vấn danh mục hàng hóa.'
    } else {
      const items = Object.values(hhVal || {}).filter((it) => it && typeof it === 'object')
      const matched = cleanArg
        ? items.filter((it) => {
            const blob = removeDiacritics(
              `${it.Ma_hang || ''} ${it.sku_code || ''} ${it.Ten_hang || ''} ${it.Danh_muc || ''}`
            ).toLowerCase()
            return blob.includes(qNorm)
          })
        : items.slice(0, 5)

      if (matched.length === 0) {
        ketQuaTraCuu = `Không tìm thấy sản phẩm nào khớp với "${cleanArg}".`
      } else {
        ketQuaTraCuu = matched
          .slice(0, 6)
          .map(
            (p, i) =>
              `${i + 1}. ${p.Ten_hang || p.Ma_hang}\n` +
              `   - Mã hàng / SKU: ${p.sku_code || p.Ma_hang || 'N/A'}\n` +
              `   - Đơn giá: ${formatNum(p.Don_gia || p.Gia_tieu_chuan)} ${p.Don_vi_tien_te || 'VND'}\n` +
              `   - Thời hạn / Bảo hành: ${p.License_duration || p.thoi_han_bao_hanh || 'N/A'}`
          )
          .join('\n\n')
      }
    }
  }

  const danhSachLenh = (allCommands || [])
    .filter((c) => c.enabled)
    .map((c) => `- ${c.keyword}: ${c.description}`)
    .join('\n')

  return interpolateTemplate(cmdObj.template, ctx, {
    arg: cleanArg || 'Tất cả',
    ket_qua_tra_cuu: ketQuaTraCuu,
    danh_sach_lenh: danhSachLenh
  })
}

export const matchIncomingZaloCommand = (rawText, botName, commands = []) => {
  const safeBotName = escapeRegExp(botName || 'Bot SONAI SI')
  const cleanedText = String(rawText || '')
    .trim()
    .replace(/^@\S+(?:\s+\S+){0,3}?\s+(?=\/)/i, '')
    .replace(new RegExp(`^@?${safeBotName}\\s*`, 'i'), '')
    .replace(/^@bot[^\s]*\s*/i, '')
    .trim()

  const parts = cleanedText.split(/\s+/).filter(Boolean)
  const firstWord = (parts[0] || '').toLowerCase()
  const firstWordNoSlash = firstWord.replace(/^\//, '')
  const argStr = parts.slice(1).join(' ').trim()

  const matchedCmd = (commands || []).find((c) => {
    if (!c.enabled) return false
    const kw = String(c.keyword || '').toLowerCase().trim()
    const kwNoSlash = kw.replace(/^\//, '')
    const aliasList = String(c.aliases || '')
      .split(',')
      .map((a) => a.trim().toLowerCase().replace(/^\//, ''))
      .filter(Boolean)
    return (
      firstWord === kw ||
      (firstWordNoSlash && firstWordNoSlash === kwNoSlash) ||
      (firstWordNoSlash && aliasList.includes(firstWordNoSlash))
    )
  })

  if (matchedCmd) {
    return { type: 'matched', cmd: matchedCmd, argStr }
  }

  if (String(rawText || '').trim()) {
    const helpCmd = (commands || []).find((c) => c.actionType === 'help_menu' && c.enabled)
    if (helpCmd) {
      return { type: 'help', cmd: helpCmd, argStr: '' }
    }
  }
  return null
}
