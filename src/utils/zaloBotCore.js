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
    const year = String(parts.year || '1970')
    const month = String(parts.month || '01').padStart(2, '0')
    const day = String(parts.day || '01').padStart(2, '0')
    const rawHour = Number(parts.hour)
    const hourNum = Number.isFinite(rawHour) ? (rawHour === 24 ? 0 : rawHour) : 0
    const minuteNum = Number(parts.minute) || 0
    const hour = String(hourNum).padStart(2, '0')
    const minute = String(minuteNum).padStart(2, '0')
    const dayOfWeek = WEEKDAY_MAP[parts.weekday] ?? date.getUTCDay()

    return {
      dateStr: `${day}/${month}/${year}`,
      timeStr: `${hour}:${minute}`,
      isoDateStr: `${year}-${month}-${day}`,
      dayOfWeek,
      minutesOfDay: hourNum * 60 + minuteNum
    }
  } catch {
    const shifted = new Date(date.getTime() + 7 * 60 * 60 * 1000)
    const pad = (n) => String(n).padStart(2, '0')
    const y = shifted.getUTCFullYear()
    const m = pad(shifted.getUTCMonth() + 1)
    const d = pad(shifted.getUTCDate())
    const hhNum = shifted.getUTCHours()
    const mmNum = shifted.getUTCMinutes()
    const hh = pad(hhNum)
    const mm = pad(mmNum)
    return {
      dateStr: `${d}/${m}/${y}`,
      timeStr: `${hh}:${mm}`,
      isoDateStr: `${y}-${m}-${d}`,
      dayOfWeek: shifted.getUTCDay(),
      minutesOfDay: hhNum * 60 + mmNum
    }
  }
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
      {
        id: 'sched_afternoon_tasks',
        name: 'Nhắc việc chưa hoàn thành cuối ngày',
        time: '17:00',
        days: [1, 2, 3, 4, 5, 6],
        targetChatId: 'zgr-176c478134e0ddbe84f1',
        enabled: false,
        lastSentDate: '',
        template:
          '[TỔNG HỢP CÔNG VIỆC CHƯA HOÀN THÀNH - {date} {time}]\n' +
          '{cong_viec_chua_xong}'
      }
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
    recipients:
      Array.isArray(raw.recipients) && raw.recipients.length > 0
        ? raw.recipients
        : raw.recipients && typeof raw.recipients === 'object'
          ? Object.values(raw.recipients)
          : def.recipients,
    schedules:
      Array.isArray(raw.schedules) && raw.schedules.length > 0
        ? raw.schedules.map((s) => ({
            ...s,
            days: Array.isArray(s.days) ? s.days.map(Number) : [1, 2, 3, 4, 5, 6]
          }))
        : raw.schedules && typeof raw.schedules === 'object'
          ? Object.values(raw.schedules).map((s) => ({
              ...s,
              days: Array.isArray(s.days) ? s.days.map(Number) : [1, 2, 3, 4, 5, 6]
            }))
          : def.schedules,
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

export const buildContextFromDatasets = ({ khVal = {}, srVal = {}, repVal = {}, now = new Date() } = {}) => {
  const vn = getVietnamDateParts(now)
  const customersList = []
  const debtCustomers = []
  let totalDebt = 0
  let incompleteTasksText = 'Không có công việc tồn đọng.'

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
    const maKH = String(raw.ma_khach_hang || fbKey).trim()
    const congNo = debtByMaKH[maKH] !== undefined ? debtByMaKH[maKH] : Number(raw.cong_no) || 0
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

  const pendingTasks = []
  Object.values(repVal || {}).forEach((r) => {
    if (!r || typeof r !== 'object') return
    const status = String(r.trang_thai || r.status || '').toLowerCase()
    if (!status.includes('hoàn thành') && !status.includes('đã xong') && !status.includes('huỷ') && !status.includes('hủy')) {
      const title = r.noi_dung_cong_viec || r.tieu_de || r.noi_dung || ''
      const deadline = r.thoi_han || r.deadline || ''
      if (title) {
        pendingTasks.push(`- ${title}${deadline ? ` (Hạn: ${deadline})` : ''}`)
      }
    }
  })
  if (pendingTasks.length > 0) {
    incompleteTasksText = pendingTasks.slice(0, 12).join('\n')
    if (pendingTasks.length > 12) {
      incompleteTasksText += `\n... và ${pendingTasks.length - 12} công việc khác.`
    }
  }

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
    tong_khach_hang: customersList.length,
    so_khach_no: debtCustomers.length,
    tong_cong_no: formatNum(totalDebt),
    chi_tiet_cong_no: debtDetailLines,
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
