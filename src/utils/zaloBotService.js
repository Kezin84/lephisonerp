import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, update, push } from 'firebase/database'

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

const getDbInstance = () => {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  if (app?.options && !app.options.databaseURL) {
    Object.assign(app.options, firebaseConfig)
  }
  return getDatabase(app)
}

export const DEFAULT_BOT_TOKEN =
  '1563589356003514094:IQXjmlrjRECxVFrbKGrCBToMkXiwjEsamxjqPaOcWENyYzPzYYygUQgoYxHdCRge'

export const DEFAULT_INVITE_URL = 'https://bot.zaloplatforms.com/groups/invite/bot.QkJpMNVs'

export const getDefaultZaloBotConfig = () => ({
  botToken: DEFAULT_BOT_TOKEN,
  botName: 'Bot SONAI SI',
  botAccount: 'bot.QkJpMNVs',
  inviteGroupUrl: DEFAULT_INVITE_URL,
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
})

export const normalizeBotConfig = (raw) => {
  const def = getDefaultZaloBotConfig()
  if (!raw || typeof raw !== 'object') return def

  return {
    botToken: String(raw.botToken || def.botToken).trim(),
    botName: String(raw.botName || def.botName).trim(),
    botAccount: String(raw.botAccount || def.botAccount).trim(),
    inviteGroupUrl: String(raw.inviteGroupUrl || def.inviteGroupUrl).trim(),
    enabled: raw.enabled !== undefined ? Boolean(raw.enabled) : def.enabled,
    commandListenerEnabled:
      raw.commandListenerEnabled !== undefined ? Boolean(raw.commandListenerEnabled) : def.commandListenerEnabled,
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

export const fetchZaloBotConfig = async () => {
  try {
    const db = getDbInstance()
    const snap = await get(dbRef(db, 'zalo_bot_config/settings'))
    if (snap.exists()) {
      return normalizeBotConfig(snap.val())
    }
    const def = getDefaultZaloBotConfig()
    await set(dbRef(db, 'zalo_bot_config/settings'), def)
    return def
  } catch (err) {
    console.warn('Lỗi tải cấu hình Zalo Bot:', err)
    return getDefaultZaloBotConfig()
  }
}

export const saveZaloBotConfig = async (config) => {
  const db = getDbInstance()
  const clean = JSON.parse(JSON.stringify(normalizeBotConfig(config)))
  await set(dbRef(db, 'zalo_bot_config/settings'), clean)
  return clean
}

export const appendZaloBotLog = async (logEntry) => {
  try {
    const db = getDbInstance()
    const newRef = push(dbRef(db, 'zalo_bot_config/logs'))
    await set(newRef, {
      id: newRef.key,
      timestamp: new Date().toISOString(),
      ...logEntry
    })
  } catch (e) {
    console.warn('Không thể ghi log Zalo Bot:', e)
  }
}

export const callZaloBotApi = async (botToken, method, payload = {}) => {
  const token = String(botToken || DEFAULT_BOT_TOKEN).trim()
  const proxyUrl = `/zalo-bot-api/bot${token}/${method}`
  const directUrl = `https://bot-api.zaloplatforms.com/bot${token}/${method}`

  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await res.json()
    }
  } catch (err) {
    // Fallback to directUrl below
  }

  const resDirect = await fetch(directUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return await resDirect.json()
}

export const sendZaloBotMessage = async ({ botToken, chatId, text, source = 'manual' }) => {
  if (!chatId || !text) {
    return { ok: false, description: 'Thiếu chatId hoặc nội dung tin nhắn' }
  }
  try {
    const data = await callZaloBotApi(botToken, 'sendMessage', {
      chat_id: String(chatId).trim(),
      text: String(text)
    })
    await appendZaloBotLog({
      chatId,
      text: String(text).slice(0, 600),
      source,
      ok: Boolean(data && data.ok),
      response: data?.description || (data?.ok ? 'Thành công' : 'Lỗi')
    })
    return data
  } catch (err) {
    await appendZaloBotLog({
      chatId,
      text: String(text).slice(0, 600),
      source,
      ok: false,
      response: err?.message || 'Lỗi kết nối'
    })
    return { ok: false, description: err?.message || 'Lỗi kết nối API' }
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

const formatNum = (val) => {
  const n = Number(val) || 0
  return n.toLocaleString('vi-VN')
}

export const buildDynamicSystemContext = async () => {
  const db = getDbInstance()
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`

  let customersList = []
  let debtCustomers = []
  let totalDebt = 0
  let incompleteTasksText = 'Không có công việc tồn đọng.'

  try {
    const [snapKH, snapSR, snapRep] = await Promise.all([
      get(dbRef(db, 'khach_hang')),
      get(dbRef(db, 'sale_report')),
      get(dbRef(db, 'reports'))
    ])

    const khVal = snapKH.exists() ? snapKH.val() : {}
    const srVal = snapSR.exists() ? snapSR.val() : {}
    const repVal = snapRep.exists() ? snapRep.val() : {}

    // Tính công nợ theo sale_report giống CustomerFirebase
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

    // Lấy công việc chưa hoàn thành
    const pendingTasks = []
    Object.values(repVal || {}).forEach((r) => {
      if (!r || typeof r !== 'object') return
      const status = String(r.trang_thai || r.status || '').toLowerCase()
      if (!status.includes('hoàn thành') && !status.includes(' đã xong') && !status.includes('huỷ')) {
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
  } catch (e) {
    console.warn('Lỗi tổng hợp dữ liệu cho Zalo Bot:', e)
  }

  const debtDetailLines =
    debtCustomers.length > 0
      ? debtCustomers
          .slice(0, 15)
          .map(
            (c, idx) =>
              `${idx + 1}. ${c.ten_cong_ty || c.ten_khach_hang || c.ma_khach_hang} (${c.ma_khach_hang}): ${formatNum(c.cong_no)} đ`
          )
          .join('\n') + (debtCustomers.length > 15 ? `\n... và ${debtCustomers.length - 15} khách hàng khác.` : '')
      : 'Hiện không có khách hàng nào còn công nợ.'

  return {
    date: dateStr,
    time: timeStr,
    tong_khach_hang: customersList.length,
    so_khach_no: debtCustomers.length,
    tong_cong_no: formatNum(totalDebt),
    chi_tiet_cong_no: debtDetailLines,
    cong_viec_chua_xong: incompleteTasksText,
    _customersList: customersList
  }
}

export const renderBotTemplate = async (templateStr, extraVars = {}) => {
  const ctx = await buildDynamicSystemContext()
  const merged = { ...ctx, ...extraVars }
  let out = String(templateStr || '')
  Object.entries(merged).forEach(([k, v]) => {
    if (k.startsWith('_')) return
    out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v ?? ''))
  })
  return out
}

export const executeBotCommand = async (cmdObj, argStr = '', allCommands = []) => {
  const ctx = await buildDynamicSystemContext()
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
    try {
      const db = getDbInstance()
      const snapHH = await get(dbRef(db, 'hang_hoa'))
      const hhVal = snapHH.exists() ? snapHH.val() : {}
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
    } catch (e) {
      ketQuaTraCuu = 'Lỗi khi truy vấn danh mục hàng hóa.'
    }
  }

  const danhSachLenh = (allCommands || [])
    .filter((c) => c.enabled)
    .map((c) => `- ${c.keyword}: ${c.description}`)
    .join('\n')

  return renderBotTemplate(cmdObj.template, {
    arg: cleanArg || 'Tất cả',
    ket_qua_tra_cuu: ketQuaTraCuu,
    danh_sach_lenh: danhSachLenh
  })
}

export const triggerZaloEventNotification = async (eventKey, vars = {}) => {
  try {
    const config = await fetchZaloBotConfig()
    if (!config.enabled) return
    const trig = config.eventTriggers?.[eventKey]
    if (!trig || !trig.enabled) return

    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const defaultTime = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`

    const text = await renderBotTemplate(trig.template, {
      thoi_gian: defaultTime,
      ...vars
    })

    const targetId = trig.targetChatId
    if (targetId === '__all__') {
      const activeRecs = (config.recipients || []).filter((r) => r.enabled && r.chatId)
      for (const rec of activeRecs) {
        await sendZaloBotMessage({
          botToken: config.botToken,
          chatId: rec.chatId,
          text,
          source: `event:${eventKey}`
        })
      }
    } else if (targetId) {
      await sendZaloBotMessage({
        botToken: config.botToken,
        chatId: targetId,
        text,
        source: `event:${eventKey}`
      })
    }
  } catch (e) {
    console.warn('Lỗi gửi thông báo sự kiện Zalo Bot:', e)
  }
}

// ─── Background Scheduler & Command Listener ───
let bgIntervalId = null
let isPollingInFlight = false
const processedMessageIds = new Set()

export const checkAndRunScheduledBotTasks = async () => {
  try {
    const config = await fetchZaloBotConfig()
    if (!config.enabled) return

    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const currentHHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const currentDay = now.getDay() // 0 = CN, 1 = T2, ...

    let configChanged = false
    for (const sched of config.schedules || []) {
      if (!sched.enabled || !sched.time) continue
      const allowedDays = Array.isArray(sched.days) ? sched.days : [0, 1, 2, 3, 4, 5, 6]
      if (!allowedDays.includes(currentDay)) continue
      if (sched.time === currentHHMM && sched.lastSentDate !== todayStr) {
        sched.lastSentDate = todayStr
        configChanged = true
        const msgText = await renderBotTemplate(sched.template)
        if (sched.targetChatId === '__all__') {
          const activeRecs = (config.recipients || []).filter((r) => r.enabled && r.chatId)
          for (const rec of activeRecs) {
            await sendZaloBotMessage({
              botToken: config.botToken,
              chatId: rec.chatId,
              text: msgText,
              source: `schedule:${sched.name}`
            })
          }
        } else if (sched.targetChatId) {
          await sendZaloBotMessage({
            botToken: config.botToken,
            chatId: sched.targetChatId,
            text: msgText,
            source: `schedule:${sched.name}`
          })
        }
      }
    }

    if (configChanged) {
      await saveZaloBotConfig(config)
    }
  } catch (e) {
    console.warn('Lỗi kiểm tra lịch hẹn Zalo Bot:', e)
  }
}

export const pollZaloBotCommandsOnce = async (customTimeout = 8) => {
  if (isPollingInFlight) return null
  isPollingInFlight = true
  try {
    const config = await fetchZaloBotConfig()
    if (!config.enabled || !config.commandListenerEnabled) return null

    const data = await callZaloBotApi(config.botToken, 'getUpdates', { timeout: customTimeout })
    if (!data || !data.ok || !data.result) return null

    const results = Array.isArray(data.result) ? data.result : [data.result]
    let configUpdated = false

    for (const item of results) {
      const msg = item?.message || item
      const msgId = msg?.message_id
      if (msgId && processedMessageIds.has(msgId)) continue
      if (msgId) processedMessageIds.add(msgId)

      const chatId = msg?.chat?.id || item?.chat?.id || msg?.from?.id
      const chatType = msg?.chat?.chat_type || 'GROUP'
      const senderName = msg?.from?.display_name || msg?.from?.name || 'Người dùng Zalo'
      const rawText = String(msg?.text || '').trim()
      if (!chatId) continue

      // Tự động lưu Chat ID mới nếu chưa có trong recipients
      const existsRec = (config.recipients || []).some((r) => r.chatId === chatId)
      if (!existsRec) {
        config.recipients.push({
          id: 'rec_' + Date.now(),
          chatId,
          name: chatType === 'GROUP' ? `Nhóm Zalo (${chatId.slice(0, 10)})` : senderName,
          type: chatType,
          enabled: true,
          addedAt: new Date().toISOString()
        })
        configUpdated = true
      }

      // Bóc tách lệnh (loại bỏ @Bot SONAI SI ở đầu nếu có)
      const cleanedText = rawText
        .replace(/^@\S+(?:\s+\S+){0,3}?\s+(?=\/)/i, '')
        .replace(new RegExp(`^@?${config.botName || 'Bot SONAI SI'}\\s*`, 'i'), '')
        .replace(/^@bot[^\s]*\s*/i, '')
        .trim()

      const parts = cleanedText.split(/\s+/).filter(Boolean)
      const firstWord = (parts[0] || '').toLowerCase()
      const firstWordNoSlash = firstWord.replace(/^\//, '')
      const argStr = parts.slice(1).join(' ').trim()

      const matchedCmd = (config.commands || []).find((c) => {
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
        const replyText = await executeBotCommand(matchedCmd, argStr, config.commands)
        await sendZaloBotMessage({
          botToken: config.botToken,
          chatId,
          text: replyText,
          source: `command:${matchedCmd.keyword}`
        })
      } else if (rawText) {
        // Nếu người dùng tag bot nhưng chưa gõ đúng từ khóa lệnh, gửi hướng dẫn ngắn
        const helpCmd = (config.commands || []).find((c) => c.actionType === 'help_menu' && c.enabled)
        if (helpCmd) {
          const replyText = await executeBotCommand(helpCmd, '', config.commands)
          await sendZaloBotMessage({
            botToken: config.botToken,
            chatId,
            text: replyText,
            source: 'command:auto_help'
          })
        }
      }
    }

    if (configUpdated) {
      await saveZaloBotConfig(config)
    }
    return results
  } catch (e) {
    return null
  } finally {
    isPollingInFlight = false
  }
}

export const initZaloBotBackgroundService = () => {
  if (bgIntervalId) return
  checkAndRunScheduledBotTasks()
  bgIntervalId = setInterval(() => {
    checkAndRunScheduledBotTasks()
    pollZaloBotCommandsOnce(6)
  }, 25000)
}
