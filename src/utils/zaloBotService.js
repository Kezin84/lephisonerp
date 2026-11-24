import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, update, push, onValue } from 'firebase/database'
import { getSystemConfigSync, hasAuthSession, isMockDbActive } from '../services/systemConfig'
import {
  DEFAULT_BOT_TOKEN,
  DEFAULT_INVITE_URL,
  DEFAULT_TASK_LINK_MODE,
  DEFAULT_WEB_APP_URL,
  TASK_SCHEDULES_VERSION,
  buildContextFromDatasets,
  buildZaloHeaderTextStyles,
  extractZaloChatFromUpdate,
  getVietnamDateParts,
  interpolateTemplate,
  isScheduleDueNow,
  isZaloHeaderLine,
  matchIncomingZaloCommand,
  normalizeBotConfigWithDefault,
  normalizeZaloChatType,
  resolveBotCommandText,
  resolveShortReportRedirect,
  safeFirebaseKey,
  splitZaloMessages,
  upsertZaloRecipient
} from './zaloBotCore.js'

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

export {
  DEFAULT_BOT_TOKEN,
  DEFAULT_INVITE_URL,
  DEFAULT_TASK_LINK_MODE,
  DEFAULT_WEB_APP_URL,
  buildZaloHeaderTextStyles,
  extractZaloChatFromUpdate,
  isZaloHeaderLine,
  normalizeZaloChatType,
  resolveShortReportRedirect,
  splitZaloMessages,
  upsertZaloRecipient
}

export const subscribeZaloRecipientsRealtime = (onRecipientsUpdate) => {
  try {
    const db = getDbInstance()
    const targetRef = dbRef(db, 'zalo_bot_config/settings/recipients')
    return onValue(targetRef, (snap) => {
      if (!snap.exists()) return
      const raw = snap.val()
      const list = (Array.isArray(raw) ? raw : Object.values(raw || {}))
        .filter((r) => r && typeof r === 'object' && r.chatId)
        .map((r) => ({
          ...r,
          chatId: String(r.chatId).trim(),
          type: normalizeZaloChatType(r.type, r.chatId)
        }))
      if (typeof onRecipientsUpdate === 'function') {
        onRecipientsUpdate(list)
      }
    })
  } catch (err) {
    console.warn('Không thể lắng nghe realtime recipients Zalo Bot:', err)
    return () => {}
  }
}

export const WORKER_HEARTBEAT_FRESH_MS = 180 * 1000

export const isWorkerHeartbeatFresh = (hb) => {
  if (!hb || typeof hb !== 'object' || !hb.lastRunAt) return false
  const ts = Date.parse(hb.lastRunAt)
  return Number.isFinite(ts) && Date.now() - ts < WORKER_HEARTBEAT_FRESH_MS
}

export const fetchWorkerHeartbeat = async () => {
  try {
    const db = getDbInstance()
    const snap = await get(dbRef(db, 'zalo_bot_config/worker_heartbeat'))
    return snap.exists() ? snap.val() : null
  } catch {
    return null
  }
}

export const getDefaultZaloBotConfig = () => {
  const sysZalo = getSystemConfigSync().zaloBot
  return normalizeBotConfigWithDefault(null, sysZalo)
}

export const normalizeBotConfig = (raw) => {
  const sysZalo = getSystemConfigSync().zaloBot
  return normalizeBotConfigWithDefault(raw, sysZalo)
}

export const fetchZaloBotConfig = async () => {
  try {
    const db = getDbInstance()
    const snap = await get(dbRef(db, 'zalo_bot_config/settings'))
    if (snap.exists()) {
      const raw = snap.val()
      const normalized = normalizeBotConfig(raw)
      if (Number(raw?.taskSchedulesVersion || 0) < TASK_SCHEDULES_VERSION) {
        const clean = JSON.parse(JSON.stringify(normalized))
        await set(dbRef(db, 'zalo_bot_config/settings'), clean).catch(() => {})
      }
      return normalized
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

const sleepMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const sendZaloBotMessage = async ({ botToken, chatId, text, source = 'manual' }) => {
  if (!chatId || !text) {
    return { ok: false, description: 'Thiếu chatId hoặc nội dung tin nhắn' }
  }
  const parts = splitZaloMessages(text)
  if (parts.length === 0) {
    return { ok: false, description: 'Nội dung tin nhắn trống' }
  }

  let lastData = null
  let partsSent = 0
  let firstErrorDesc = ''

  for (let i = 0; i < parts.length; i++) {
    const partText = parts[i]
    const partSource = parts.length > 1 ? `${source} [${i + 1}/${parts.length}]` : source
    if (i > 0) {
      await sleepMs(260)
    }
    try {
      const textStyles = buildZaloHeaderTextStyles(partText)
      const payload = {
        chat_id: String(chatId).trim(),
        text: String(partText),
        ...(textStyles.length > 0 ? { text_styles: textStyles } : {})
      }
      let data = await callZaloBotApi(botToken, 'sendMessage', payload)
      if ((!data || !data.ok) && textStyles.length > 0) {
        data = await callZaloBotApi(botToken, 'sendMessage', {
          chat_id: String(chatId).trim(),
          text: String(partText)
        })
      }
      lastData = data
      if (data && data.ok) {
        partsSent++
      } else if (!firstErrorDesc) {
        firstErrorDesc = data?.description || 'Lỗi'
      }
      await appendZaloBotLog({
        chatId,
        text: String(partText).slice(0, 800),
        source: partSource,
        ok: Boolean(data && data.ok),
        response: data?.description || (data?.ok ? 'Thành công' : 'Lỗi')
      })
    } catch (err) {
      if (!firstErrorDesc) {
        firstErrorDesc = err?.message || 'Lỗi kết nối API'
      }
      await appendZaloBotLog({
        chatId,
        text: String(partText).slice(0, 800),
        source: partSource,
        ok: false,
        response: err?.message || 'Lỗi kết nối'
      })
    }
  }

  const allOk = partsSent === parts.length
  return {
    ...(lastData && typeof lastData === 'object' ? lastData : {}),
    ok: allOk,
    partsSent,
    totalParts: parts.length,
    description: allOk
      ? parts.length > 1
        ? `Thành công (${partsSent}/${parts.length} tin)`
        : lastData?.description || 'Thành công'
      : firstErrorDesc || lastData?.description || 'Lỗi gửi tin nhắn'
  }
}

export const buildDynamicSystemContext = async (options = {}) => {
  const db = getDbInstance()
  try {
    let webAppUrl = options?.webAppUrl
    let taskLinkMode = options?.taskLinkMode
    if (!webAppUrl || !taskLinkMode) {
      const snapSettings = await get(dbRef(db, 'zalo_bot_config/settings')).catch(() => null)
      const settingsVal = snapSettings && snapSettings.exists() ? snapSettings.val() : null
      if (!webAppUrl) webAppUrl = settingsVal?.webAppUrl || DEFAULT_WEB_APP_URL
      if (!taskLinkMode) taskLinkMode = settingsVal?.taskLinkMode || DEFAULT_TASK_LINK_MODE
    }

    const [snapKH, snapSR, snapRep] = await Promise.all([
      get(dbRef(db, 'khach_hang')),
      get(dbRef(db, 'sale_report')),
      get(dbRef(db, 'REPORT'))
    ])

    let repVal = snapRep.exists() ? snapRep.val() : null
    if (!repVal || (typeof repVal === 'object' && Object.keys(repVal).length === 0)) {
      const snapLegacy = await get(dbRef(db, 'reports')).catch(() => null)
      if (snapLegacy && snapLegacy.exists()) repVal = snapLegacy.val()
    }

    return buildContextFromDatasets({
      khVal: snapKH.exists() ? snapKH.val() : {},
      srVal: snapSR.exists() ? snapSR.val() : {},
      repVal: repVal || {},
      now: new Date(),
      webAppUrl,
      taskLinkMode
    })
  } catch (e) {
    console.warn('Lỗi tổng hợp dữ liệu cho Zalo Bot:', e)
    return buildContextFromDatasets({
      now: new Date(),
      webAppUrl: options?.webAppUrl || DEFAULT_WEB_APP_URL,
      taskLinkMode: options?.taskLinkMode || DEFAULT_TASK_LINK_MODE
    })
  }
}

export const renderBotTemplate = async (templateStr, extraVars = {}, contextOptions = {}) => {
  const ctx = await buildDynamicSystemContext(contextOptions)
  return interpolateTemplate(templateStr, ctx, extraVars)
}

export const executeBotCommand = async (cmdObj, argStr = '', allCommands = [], contextOptions = {}) => {
  const ctx = await buildDynamicSystemContext(contextOptions)
  let hhVal = {}
  if (cmdObj?.actionType === 'product_lookup') {
    try {
      const db = getDbInstance()
      const snapHH = await get(dbRef(db, 'hang_hoa'))
      hhVal = snapHH.exists() ? snapHH.val() : {}
    } catch {
      hhVal = null
    }
  }
  return resolveBotCommandText({ cmdObj, argStr, allCommands, ctx, hhVal })
}

const shouldPauseZaloBotNow = () => {
  if (!hasAuthSession()) return true
  if (isMockDbActive() && getSystemConfigSync().zaloBot.pauseInMockMode) return true
  return false
}

export const triggerZaloEventNotification = async (eventKey, vars = {}) => {
  if (shouldPauseZaloBotNow()) return
  try {
    const config = await fetchZaloBotConfig()
    if (!config.enabled) return
    const trig = config.eventTriggers?.[eventKey]
    if (!trig || !trig.enabled) return

    const vn = getVietnamDateParts(new Date())
    const defaultTime = `${vn.dateStr} ${vn.timeStr}`

    const text = await renderBotTemplate(
      trig.template,
      {
        thoi_gian: defaultTime,
        ...vars
      },
      { webAppUrl: config.webAppUrl, taskLinkMode: config.taskLinkMode }
    )

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

// ─── Background Scheduler & Command Listener (Fallback khi chưa có Cloudflare Cron Worker) ───
let bgIntervalId = null
let isPollingInFlight = false
const processedMessageIds = new Set()

export const checkAndRunScheduledBotTasks = async () => {
  if (shouldPauseZaloBotNow()) return
  try {
    const config = await fetchZaloBotConfig()
    if (!config.enabled) return

    const db = getDbInstance()
    const vn = getVietnamDateParts(new Date())
    let configChanged = false

    for (const sched of config.schedules || []) {
      if (!isScheduleDueNow(sched, vn, 0)) continue
      const lockKey = `${safeFirebaseKey(sched.id)}_${vn.isoDateStr}`
      const lockSnap = await get(dbRef(db, `zalo_bot_config/schedule_locks/${lockKey}`)).catch(() => null)
      if (lockSnap && lockSnap.exists()) {
        sched.lastSentDate = vn.isoDateStr
        configChanged = true
        continue
      }

      await set(dbRef(db, `zalo_bot_config/schedule_locks/${lockKey}`), {
        claimedAt: new Date().toISOString(),
        date: vn.isoDateStr,
        source: 'browser_tab'
      }).catch(() => {})

      sched.lastSentDate = vn.isoDateStr
      configChanged = true
      const msgText = await renderBotTemplate(
        sched.template,
        {},
        { webAppUrl: config.webAppUrl, taskLinkMode: config.taskLinkMode }
      )
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

    const db = getDbInstance()
    const processedSnap = await get(dbRef(db, 'zalo_bot_config/processed_msg_ids')).catch(() => null)
    const remoteProcessed = processedSnap && processedSnap.exists() ? processedSnap.val() || {} : {}

    const results = Array.isArray(data.result) ? data.result : [data.result]
    const msgPatch = {}
    let configUpdated = false

    for (const item of results) {
      const info = extractZaloChatFromUpdate(item)
      const msgId = info.msgId
      const msgKey = msgId ? safeFirebaseKey(msgId) : ''
      if (msgId && (processedMessageIds.has(msgId) || remoteProcessed[msgKey])) continue
      if (msgId) {
        processedMessageIds.add(msgId)
        msgPatch[msgKey] = Date.now()
      }

      const { chatId, rawText } = info
      if (!chatId) continue

      if (!Array.isArray(config.recipients)) config.recipients = []
      const recRes = upsertZaloRecipient(config.recipients, info)
      if (recRes.updated) {
        configUpdated = true
      }

      const matched = matchIncomingZaloCommand(rawText, config.botName, config.commands)
      if (matched) {
        const replyText = await executeBotCommand(matched.cmd, matched.argStr, config.commands, {
          webAppUrl: config.webAppUrl,
          taskLinkMode: config.taskLinkMode
        })
        await sendZaloBotMessage({
          botToken: config.botToken,
          chatId,
          text: replyText,
          source: matched.type === 'matched' ? `command:${matched.cmd.keyword}` : 'command:auto_help'
        })
      }
    }

    if (Object.keys(msgPatch).length > 0) {
      await update(dbRef(db, 'zalo_bot_config/processed_msg_ids'), msgPatch).catch(() => {})
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

const runBrowserFallbackTick = async () => {
  if (shouldPauseZaloBotNow()) return
  const hb = await fetchWorkerHeartbeat()
  if (isWorkerHeartbeatFresh(hb)) return
  await checkAndRunScheduledBotTasks()
  await pollZaloBotCommandsOnce(6)
}

export const initZaloBotBackgroundService = () => {
  if (shouldPauseZaloBotNow()) return
  if (bgIntervalId) return
  runBrowserFallbackTick()
  bgIntervalId = setInterval(() => {
    runBrowserFallbackTick()
  }, 25000)
}

export const stopZaloBotBackgroundService = () => {
  if (bgIntervalId) {
    clearInterval(bgIntervalId)
    bgIntervalId = null
  }
}
