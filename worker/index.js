import {
  DEFAULT_BOT_TOKEN,
  DEFAULT_FIREBASE_DATABASE_URL,
  buildContextFromDatasets,
  getVietnamDateParts,
  interpolateTemplate,
  isScheduleDueNow,
  matchIncomingZaloCommand,
  normalizeBotConfigWithDefault,
  resolveBotCommandText,
  safeFirebaseKey
} from '../src/utils/zaloBotCore.js'

const ZALO_BOT_API_ORIGIN = 'https://bot-api.zaloplatforms.com'
const PROCESSED_MSG_TTL_MS = 48 * 60 * 60 * 1000

const jsonResponse = (payload, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  })

const buildCorsHeaders = (request) => {
  const reqOrigin = request?.headers?.get('Origin') || '*'
  return {
    'Access-Control-Allow-Origin': reqOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Bot-Api-Secret-Token, X-Cron-Secret',
    Vary: 'Origin'
  }
}

const createRtdbClient = (env = {}) => {
  const baseUrl = String(env.FIREBASE_DATABASE_URL || DEFAULT_FIREBASE_DATABASE_URL)
    .trim()
    .replace(/\/+$/, '')
  const dbSecret = String(env.FIREBASE_DATABASE_SECRET || '').trim()

  const buildUrl = (path) => {
    const clean = String(path || '').replace(/^\/+|\/+$/g, '')
    const authSuffix = dbSecret ? `?auth=${encodeURIComponent(dbSecret)}` : ''
    return `${baseUrl}/${clean}.json${authSuffix}`
  }

  return {
    async get(path) {
      const res = await fetch(buildUrl(path), { method: 'GET' })
      if (!res.ok) throw new Error(`Firebase GET ${path} failed (${res.status})`)
      return res.json()
    },

    async set(path, val) {
      const res = await fetch(buildUrl(path), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(val)
      })
      if (!res.ok) throw new Error(`Firebase PUT ${path} failed (${res.status})`)
      return res.json()
    },

    async patch(path, val) {
      const res = await fetch(buildUrl(path), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(val)
      })
      if (!res.ok) throw new Error(`Firebase PATCH ${path} failed (${res.status})`)
      return res.json()
    },

    async push(path, val) {
      const res = await fetch(buildUrl(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(val)
      })
      if (!res.ok) throw new Error(`Firebase POST ${path} failed (${res.status})`)
      return res.json()
    },

    async claimLock(path, value) {
      const url = buildUrl(path)
      const getRes = await fetch(url, {
        method: 'GET',
        headers: { 'X-Firebase-ETag': 'true' }
      })
      if (!getRes.ok) return false
      const existing = await getRes.json()
      if (existing !== null && existing !== undefined) return false

      const etag = getRes.headers.get('etag')
      const headers = { 'Content-Type': 'application/json' }
      if (etag) headers['If-Match'] = etag

      const putRes = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(value)
      })
      return putRes.ok
    }
  }
}

const callZaloApiDirect = async (botToken, method, payload = {}) => {
  const token = String(botToken || DEFAULT_BOT_TOKEN).trim()
  const res = await fetch(`${ZALO_BOT_API_ORIGIN}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { ok: res.ok, status: res.status, description: text.slice(0, 300) }
  }
}

const loadResolvedBotConfig = async (rtdb, env = {}) => {
  const [settingsVal, runtimeVal] = await Promise.all([
    rtdb.get('zalo_bot_config/settings').catch(() => null),
    rtdb.get('_sonai_runtime_api_config').catch(() => null)
  ])

  const fallbackToken = String(
    runtimeVal?.zaloBot?.defaultBotToken || env.ZALO_BOT_TOKEN || DEFAULT_BOT_TOKEN
  ).trim()

  const sysZalo = {
    ...(runtimeVal?.zaloBot || {}),
    defaultBotToken: fallbackToken
  }

  return {
    config: normalizeBotConfigWithDefault(settingsVal, sysZalo),
    rawExists: Boolean(settingsVal && typeof settingsVal === 'object')
  }
}

const createContextLoader = (rtdb) => {
  let cachedCtx = null
  let cachedHhVal = undefined

  const getContext = async () => {
    if (cachedCtx) return cachedCtx
    const [khVal, srVal, repVal] = await Promise.all([
      rtdb.get('khach_hang').catch(() => ({})),
      rtdb.get('sale_report').catch(() => ({})),
      rtdb.get('reports').catch(() => ({}))
    ])
    cachedCtx = buildContextFromDatasets({
      khVal: khVal || {},
      srVal: srVal || {},
      repVal: repVal || {},
      now: new Date()
    })
    return cachedCtx
  }

  const getHangHoa = async () => {
    if (cachedHhVal !== undefined) return cachedHhVal
    cachedHhVal = await rtdb.get('hang_hoa').catch(() => null)
    return cachedHhVal
  }

  return { getContext, getHangHoa }
}

const sendAndLog = async ({ rtdb, botToken, chatId, text, source }) => {
  if (!chatId || !text) {
    return { ok: false, description: 'Thiếu chatId hoặc nội dung tin nhắn' }
  }
  try {
    const data = await callZaloApiDirect(botToken, 'sendMessage', {
      chat_id: String(chatId).trim(),
      text: String(text)
    })
    await rtdb
      .push('zalo_bot_config/logs', {
        timestamp: new Date().toISOString(),
        chatId,
        text: String(text).slice(0, 600),
        source,
        ok: Boolean(data && data.ok),
        response: data?.description || (data?.ok ? 'Thành công' : 'Lỗi')
      })
      .catch(() => {})
    return data
  } catch (err) {
    await rtdb
      .push('zalo_bot_config/logs', {
        timestamp: new Date().toISOString(),
        chatId,
        text: String(text).slice(0, 600),
        source,
        ok: false,
        response: err?.message || 'Lỗi kết nối API'
      })
      .catch(() => {})
    return { ok: false, description: err?.message || 'Lỗi kết nối API' }
  }
}

const processIncomingUpdates = async ({ rtdb, config, items, loader }) => {
  if (!Array.isArray(items) || items.length === 0) return { processed: 0, replied: 0 }

  const remoteProcessed = (await rtdb.get('zalo_bot_config/processed_msg_ids').catch(() => ({}))) || {}
  const nowMs = Date.now()
  const msgPatch = {}

  Object.entries(remoteProcessed).forEach(([k, ts]) => {
    const num = Number(ts)
    if (Number.isFinite(num) && nowMs - num > PROCESSED_MSG_TTL_MS) {
      msgPatch[k] = null
    }
  })

  let configUpdated = false
  let processed = 0
  let replied = 0

  for (const item of items) {
    const msg = item?.message || item
    const msgId = msg?.message_id
    const msgKey = msgId ? safeFirebaseKey(msgId) : ''
    if (msgKey && (remoteProcessed[msgKey] || msgPatch[msgKey])) continue

    if (msgKey) {
      msgPatch[msgKey] = nowMs
    }

    const chatId = msg?.chat?.id || item?.chat?.id || msg?.from?.id
    const chatType = msg?.chat?.chat_type || 'GROUP'
    const senderName = msg?.from?.display_name || msg?.from?.name || 'Người dùng Zalo'
    const rawText = String(msg?.text || '').trim()
    if (!chatId) continue

    processed++

    const existsRec = (config.recipients || []).some((r) => r.chatId === chatId)
    if (!existsRec) {
      config.recipients.push({
        id: 'rec_' + Date.now(),
        chatId,
        name: chatType === 'GROUP' ? `Nhóm Zalo (${String(chatId).slice(0, 10)})` : senderName,
        type: chatType,
        enabled: true,
        addedAt: new Date().toISOString()
      })
      configUpdated = true
    }

    const matched = matchIncomingZaloCommand(rawText, config.botName, config.commands)
    if (matched) {
      const ctx = await loader.getContext()
      const hhVal = matched.cmd.actionType === 'product_lookup' ? await loader.getHangHoa() : {}
      const replyText = resolveBotCommandText({
        cmdObj: matched.cmd,
        argStr: matched.argStr,
        allCommands: config.commands,
        ctx,
        hhVal
      })
      const sendRes = await sendAndLog({
        rtdb,
        botToken: config.botToken,
        chatId,
        text: replyText,
        source: matched.type === 'matched' ? `cf_cmd:${matched.cmd.keyword}` : 'cf_cmd:auto_help'
      })
      if (sendRes?.ok) replied++
    }
  }

  if (Object.keys(msgPatch).length > 0) {
    await rtdb.patch('zalo_bot_config/processed_msg_ids', msgPatch).catch(() => {})
  }
  if (configUpdated) {
    await rtdb.set('zalo_bot_config/settings', config).catch(() => {})
  }

  return { processed, replied }
}

const runCronCycle = async (env = {}, cronExpr = '* * * * *') => {
  const rtdb = createRtdbClient(env)
  const vnNow = getVietnamDateParts(new Date())
  const { config, rawExists } = await loadResolvedBotConfig(rtdb, env)

  await rtdb
    .set('zalo_bot_config/worker_heartbeat', {
      lastRunAt: new Date().toISOString(),
      vnDate: vnNow.dateStr,
      vnTime: vnNow.timeStr,
      cron: cronExpr,
      status: config.enabled ? 'active' : 'paused',
      source: 'cloudflare_worker'
    })
    .catch(() => {})

  if (!rawExists) {
    await rtdb.set('zalo_bot_config/settings', config).catch(() => {})
  }

  if (!config.enabled) {
    return {
      ok: true,
      paused: true,
      vnTime: `${vnNow.dateStr} ${vnNow.timeStr}`,
      schedulesSent: 0,
      commandsReplied: 0
    }
  }

  const loader = createContextLoader(rtdb)
  let schedulesSent = 0
  let configChanged = false

  for (const sched of config.schedules || []) {
    if (!isScheduleDueNow(sched, vnNow, 1)) continue

    const lockKey = `${safeFirebaseKey(sched.id)}_${vnNow.isoDateStr}`
    const claimed = await rtdb.claimLock(`zalo_bot_config/schedule_locks/${lockKey}`, {
      claimedAt: new Date().toISOString(),
      date: vnNow.isoDateStr,
      source: 'cloudflare_cron'
    })

    sched.lastSentDate = vnNow.isoDateStr
    configChanged = true

    if (!claimed) continue

    const ctx = await loader.getContext()
    const msgText = interpolateTemplate(sched.template, ctx)

    if (sched.targetChatId === '__all__') {
      const activeRecs = (config.recipients || []).filter((r) => r.enabled && r.chatId)
      for (const rec of activeRecs) {
        const res = await sendAndLog({
          rtdb,
          botToken: config.botToken,
          chatId: rec.chatId,
          text: msgText,
          source: `cf_schedule:${sched.name}`
        })
        if (res?.ok) schedulesSent++
      }
    } else if (sched.targetChatId) {
      const res = await sendAndLog({
        rtdb,
        botToken: config.botToken,
        chatId: sched.targetChatId,
        text: msgText,
        source: `cf_schedule:${sched.name}`
      })
      if (res?.ok) schedulesSent++
    }
  }

  if (configChanged) {
    await rtdb.set('zalo_bot_config/settings', config).catch(() => {})
  }

  let commandsReplied = 0
  if (config.commandListenerEnabled) {
    try {
      const upd = await callZaloApiDirect(config.botToken, 'getUpdates', { timeout: 2 })
      if (upd?.ok && upd?.result) {
        const items = Array.isArray(upd.result) ? upd.result : [upd.result]
        const cmdRes = await processIncomingUpdates({ rtdb, config, items, loader })
        commandsReplied = cmdRes.replied
      }
    } catch {
      // Ignore transient polling failures so scheduled jobs never fail
    }
  }

  return {
    ok: true,
    paused: false,
    vnTime: `${vnNow.dateStr} ${vnNow.timeStr}`,
    schedulesSent,
    commandsReplied
  }
}

const proxyZaloBotApi = async (request, url) => {
  const corsHeaders = buildCorsHeaders(request)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const upstreamPath = url.pathname.replace(/^\/zalo-bot-api/, '') || '/'
  const upstreamUrl = `${ZALO_BOT_API_ORIGIN}${upstreamPath}${url.search}`

  const headers = new Headers()
  const ct = request.headers.get('content-type')
  if (ct) headers.set('content-type', ct)

  const init = {
    method: request.method,
    headers
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }

  const upstreamRes = await fetch(upstreamUrl, init)
  const outHeaders = new Headers(upstreamRes.headers)
  Object.entries(corsHeaders).forEach(([k, v]) => outHeaders.set(k, v))

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: outHeaders
  })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // 1. Proxy /zalo-bot-api/* sang bot-api.zaloplatforms.com (chống CORS trên Cloudflare)
    if (url.pathname.startsWith('/zalo-bot-api/')) {
      return proxyZaloBotApi(request, url)
    }

    // 2. Health check cho Cloudflare Worker 24/7
    if (url.pathname === '/api/zalo-bot/health') {
      const rtdb = createRtdbClient(env)
      const [hb, cfgWrap] = await Promise.all([
        rtdb.get('zalo_bot_config/worker_heartbeat').catch(() => null),
        loadResolvedBotConfig(rtdb, env).catch(() => null)
      ])
      const vnNow = getVietnamDateParts(new Date())
      return jsonResponse(
        {
          ok: true,
          worker: 'cloudflare',
          vnTime: `${vnNow.dateStr} ${vnNow.timeStr}`,
          botEnabled: cfgWrap?.config?.enabled ?? null,
          schedulesActive: (cfgWrap?.config?.schedules || []).filter((s) => s && s.enabled).length,
          heartbeat: hb
        },
        200,
        buildCorsHeaders(request)
      )
    }

    // 3. Webhook endpoint (tùy chọn nếu bật setWebhook để phản hồi tức thì 0 giây)
    if (url.pathname === '/api/zalo-bot/webhook' && request.method === 'POST') {
      const expectedSecret = String(env.ZALO_WEBHOOK_SECRET || '').trim()
      if (expectedSecret) {
        const provided = request.headers.get('X-Bot-Api-Secret-Token') || ''
        if (provided !== expectedSecret) {
          return jsonResponse({ ok: false, error: 'Invalid webhook secret' }, 401)
        }
      }
      try {
        const body = await request.json()
        const rtdb = createRtdbClient(env)
        const { config } = await loadResolvedBotConfig(rtdb, env)
        if (!config.enabled || !config.commandListenerEnabled) {
          return jsonResponse({ ok: true, skipped: true })
        }
        const loader = createContextLoader(rtdb)
        const items = Array.isArray(body) ? body : [body]
        ctx.waitUntil(processIncomingUpdates({ rtdb, config, items, loader }))
        return jsonResponse({ ok: true })
      } catch (err) {
        return jsonResponse({ ok: false, error: err?.message || 'Bad payload' }, 400)
      }
    }

    // 4. Manual trigger protected by CRON_SECRET (nếu bạn cấu hình secret trên Cloudflare)
    if (url.pathname === '/api/zalo-bot/run-cron' && request.method === 'POST') {
      const cronSecret = String(env.CRON_SECRET || '').trim()
      if (!cronSecret) {
        return jsonResponse(
          { ok: false, error: 'Set CRON_SECRET env variable to enable manual trigger' },
          403
        )
      }
      const authHeader = request.headers.get('Authorization') || ''
      const headerSecret = request.headers.get('X-Cron-Secret') || ''
      const matches = authHeader === `Bearer ${cronSecret}` || headerSecret === cronSecret
      if (!matches) {
        return jsonResponse({ ok: false, error: 'Unauthorized' }, 401)
      }
      const result = await runCronCycle(env, 'manual_http')
      return jsonResponse(result, 200)
    }

    // 5. Fallback tĩnh cho SPA
    if (env.ASSETS) {
      return env.ASSETS.fetch(request)
    }
    return new Response('Not found', { status: 404 })
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runCronCycle(env, controller?.cron || '* * * * *'))
  }
}
