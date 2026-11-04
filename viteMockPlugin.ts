import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

interface TableStat {
  name: string
  count: number
  bytes: number
}

function readRequestBodyBuffer(req: IncomingMessage, maxBytes = 200 * 1024 * 1024): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let total = 0
    req.on('data', (chunk: Buffer) => {
      total += chunk.length
      if (total > maxBytes) {
        reject(new Error(`Payload vượt quá giới hạn cho phép (${Math.round(maxBytes / 1024 / 1024)} MB)`))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  const body = JSON.stringify(payload)
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(body)
}

function normalizeDbPath(rawPath?: string | null): string {
  if (!rawPath) return ''
  return String(rawPath)
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/')
}

function getValueAtPath(root: Record<string, any>, cleanPath: string): any {
  if (!cleanPath) return root
  const parts = cleanPath.split('/')
  let cur: any = root
  for (const seg of parts) {
    if (cur === null || cur === undefined || typeof cur !== 'object') {
      return null
    }
    cur = cur[seg]
  }
  return cur === undefined ? null : cur
}

function setValueAtPath(root: Record<string, any>, cleanPath: string, val: any): string {
  if (!cleanPath) {
    for (const k of Object.keys(root)) {
      delete root[k]
    }
    if (val && typeof val === 'object') {
      Object.assign(root, val)
    }
    return '*'
  }

  const parts = cleanPath.split('/')
  const topTable = parts[0] || ''

  if (val === null || val === undefined) {
    let cur: any = root
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i]!
      if (cur === null || cur === undefined || typeof cur !== 'object') {
        return topTable
      }
      cur = cur[seg]
    }
    const lastKey = parts[parts.length - 1]!
    if (cur && typeof cur === 'object') {
      delete cur[lastKey]
    }
    return topTable
  }

  let cur: any = root
  for (let i = 0; i < parts.length - 1; i++) {
    const seg = parts[i]!
    if (cur[seg] === null || cur[seg] === undefined || typeof cur[seg] !== 'object') {
      cur[seg] = {}
    }
    cur = cur[seg]
  }
  const lastKey = parts[parts.length - 1]!
  cur[lastKey] = val
  return topTable
}

function parseMultipartFile(
  buf: Buffer,
  contentType: string
): { fileName: string; data: Buffer; mimeType: string } | null {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)
  const boundaryStr = boundaryMatch?.[1] || boundaryMatch?.[2]
  if (!boundaryStr) return null

  const delimiter = Buffer.from(`--${boundaryStr.trim()}`)
  const headerSep = Buffer.from('\r\n\r\n')

  let pos = buf.indexOf(delimiter)
  while (pos !== -1) {
    const partStart = pos + delimiter.length
    if (buf.subarray(partStart, partStart + 2).toString('utf8') === '--') {
      break
    }
    const nextPos = buf.indexOf(delimiter, partStart)
    if (nextPos === -1) break

    // Strip leading \r\n and trailing \r\n around part
    const sliceStart =
      buf[partStart] === 0x0d && buf[partStart + 1] === 0x0a ? partStart + 2 : partStart
    const sliceEnd =
      buf[nextPos - 2] === 0x0d && buf[nextPos - 1] === 0x0a ? nextPos - 2 : nextPos
    const partBuf = buf.subarray(sliceStart, sliceEnd)

    const hEnd = partBuf.indexOf(headerSep)
    if (hEnd !== -1) {
      const headerText = partBuf.subarray(0, hEnd).toString('utf8')
      if (/name="(?:file|image)"/i.test(headerText) || /filename="/i.test(headerText)) {
        const fnMatch = headerText.match(/filename="([^"]*)"/i)
        const ctMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i)
        const fileName = fnMatch?.[1] || `upload_${Date.now()}.bin`
        const mimeType = ctMatch?.[1]?.trim() || 'application/octet-stream'
        const data = partBuf.subarray(hEnd + 4)
        return { fileName, data, mimeType }
      }
    }
    pos = nextPos
  }
  return null
}

export function sonaiMockAndConfigPlugin(rootDir: string): Plugin {
  const appProxyPath = path.resolve(rootDir, 'src/services/firebaseAppProxy.ts').replace(/\\/g, '/')
  const dbProxyPath = path
    .resolve(rootDir, 'src/services/firebaseDatabaseProxy.ts')
    .replace(/\\/g, '/')

  const sysConfigFilePath = path.resolve(rootDir, 'system.config.local.json')
  const draftMockFilePath = path.resolve(rootDir, 'mockdata.local.json')
  const localUploadsDir = path.resolve(rootDir, 'public/__local_uploads')

  function resolveBaseMockPath(): string {
    const candidates = [
      path.resolve(rootDir, 'mockdata.json'),
      path.resolve(rootDir, '../../mockdata.json'),
      path.resolve(rootDir, '../mockdata.json')
    ]
    for (const c of candidates) {
      if (fs.existsSync(c)) return c
    }
    return path.resolve(rootDir, '../../mockdata.json')
  }

  let memDb: Record<string, any> | null = null
  let activeSource: 'draft' | 'base' | 'empty' = 'empty'
  let mutationCount = 0
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  let isDirtyToDisk = false
  const tableStatsCache = new Map<string, TableStat>()
  const dirtyStatTables = new Set<string>()

  function computeSingleTableStat(tableName: string, val: any): TableStat {
    if (val === null || val === undefined) {
      return { name: tableName, count: 0, bytes: 0 }
    }
    const count =
      typeof val === 'object'
        ? Array.isArray(val)
          ? val.filter((x) => x !== null && x !== undefined).length
          : Object.keys(val).length
        : 1
    let bytes = 0
    try {
      bytes = Buffer.byteLength(JSON.stringify(val), 'utf8')
    } catch {
      bytes = 0
    }
    return { name: tableName, count, bytes }
  }

  function rebuildAllTableStats(db: Record<string, any>): void {
    tableStatsCache.clear()
    dirtyStatTables.clear()
    for (const [k, v] of Object.entries(db)) {
      tableStatsCache.set(k, computeSingleTableStat(k, v))
    }
  }

  function ensureDbLoaded(): Record<string, any> {
    if (memDb !== null) return memDb

    if (fs.existsSync(draftMockFilePath)) {
      try {
        const raw = fs.readFileSync(draftMockFilePath, 'utf8')
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          memDb = parsed
          activeSource = 'draft'
          rebuildAllTableStats(memDb!)
          return memDb!
        }
      } catch (e) {
        console.warn('[MockRTDB] Không thể đọc mockdata.local.json, chuyển sang file gốc:', e)
      }
    }

    const basePath = resolveBaseMockPath()
    if (fs.existsSync(basePath)) {
      try {
        const raw = fs.readFileSync(basePath, 'utf8')
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          memDb = parsed
          activeSource = 'base'
          rebuildAllTableStats(memDb!)
          return memDb!
        }
      } catch (e) {
        console.error('[MockRTDB] Lỗi đọc file mockdata.json gốc:', e)
      }
    }

    memDb = {}
    activeSource = 'empty'
    tableStatsCache.clear()
    return memDb
  }

  function flushDraftToDiskSync(): void {
    if (!isDirtyToDisk || !memDb) return
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    try {
      const tmpPath = `${draftMockFilePath}.tmp`
      fs.writeFileSync(tmpPath, JSON.stringify(memDb), 'utf8')
      fs.renameSync(tmpPath, draftMockFilePath)
      isDirtyToDisk = false
      activeSource = 'draft'
    } catch (err) {
      console.error('[MockRTDB] Lỗi ghi mockdata.local.json:', err)
    }
  }

  function scheduleDraftSave(): void {
    isDirtyToDisk = true
    activeSource = 'draft'
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      flushDraftToDiskSync()
    }, 1000)
  }

  function buildStatsPayload() {
    const db = ensureDbLoaded()
    if (dirtyStatTables.has('*')) {
      rebuildAllTableStats(db)
    } else {
      for (const tbl of dirtyStatTables) {
        if (!tbl) continue
        if (db[tbl] === undefined || db[tbl] === null) {
          tableStatsCache.delete(tbl)
        } else {
          tableStatsCache.set(tbl, computeSingleTableStat(tbl, db[tbl]))
        }
      }
      dirtyStatTables.clear()
    }

    const basePath = resolveBaseMockPath()
    const baseStat = fs.existsSync(basePath) ? fs.statSync(basePath) : null
    const draftStat = fs.existsSync(draftMockFilePath) ? fs.statSync(draftMockFilePath) : null

    const tables = Array.from(tableStatsCache.values())
      .sort((a, b) => b.bytes - a.bytes)
      .map((t) => ({
        name: t.name,
        count: t.count,
        bytes: t.bytes,
        sizeMB: Number((t.bytes / 1024 / 1024).toFixed(2))
      }))

    const totalMemBytes = tables.reduce((acc, t) => acc + t.bytes, 0)

    return {
      ok: true,
      activeSource,
      mutationCount,
      isPendingFlush: isDirtyToDisk,
      totalTables: tables.length,
      totalMemMB: Number((totalMemBytes / 1024 / 1024).toFixed(2)),
      baseFile: {
        path: basePath,
        exists: Boolean(baseStat),
        sizeMB: baseStat ? Number((baseStat.size / 1024 / 1024).toFixed(2)) : 0,
        updatedAt: baseStat ? baseStat.mtime.toISOString() : null
      },
      draftFile: {
        path: draftMockFilePath,
        exists: Boolean(draftStat),
        sizeMB: draftStat ? Number((draftStat.size / 1024 / 1024).toFixed(2)) : 0,
        updatedAt: draftStat ? draftStat.mtime.toISOString() : null
      },
      tables
    }
  }

  return {
    name: 'sonai-mock-rtdb-and-config',
    enforce: 'pre',

    config() {
      return {
        optimizeDeps: {
          include: ['firebase/app', 'firebase/database']
        }
      }
    },

    resolveId: {
      filter: {
        id: /^firebase\/(app|database)$/
      },
      handler(source, importer) {
        const cleanImporter = (importer || '').replace(/\\/g, '/').split('?')[0] || ''
        if (source === 'firebase/app') {
          if (cleanImporter === appProxyPath || cleanImporter.includes('/node_modules/')) {
            return null
          }
          return appProxyPath
        }
        if (source === 'firebase/database') {
          if (cleanImporter === dbProxyPath || cleanImporter.includes('/node_modules/')) {
            return null
          }
          return dbProxyPath
        }
        return null
      }
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        // NEVER inject local disk config into static production builds!
        if (!ctx.server) return html
        if (!fs.existsSync(sysConfigFilePath)) return html
        try {
          const raw = fs.readFileSync(sysConfigFilePath, 'utf8')
          const parsed = JSON.parse(raw)
          const safeJson = JSON.stringify(parsed).replace(/</g, '\\u003c')
          const injectTag = `    <script>window.__SONAI_DISK_CONFIG__ = ${safeJson};</script>\n`
          return html.replace('</head>', `${injectTag}  </head>`)
        } catch {
          return html
        }
      }
    },

    configureServer(server) {
      const onExit = () => flushDraftToDiskSync()
      process.once('exit', onExit)
      process.once('SIGINT', () => {
        flushDraftToDiskSync()
        process.exit(0)
      })

      const ttsViAudioCache = new Map<string, Buffer>()

      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || ''
        if (
          !rawUrl.startsWith('/__sys_config') &&
          !rawUrl.startsWith('/__mock_rtdb') &&
          !rawUrl.startsWith('/__mock_upload') &&
          !rawUrl.startsWith('/__tts_vi')
        ) {
          next()
          return
        }

        const parsedUrl = new URL(rawUrl, 'http://localhost')
        const pathname = parsedUrl.pathname

        try {
          // 1. System Config Disk Read/Write
          if (pathname === '/__sys_config') {
            if (req.method === 'GET') {
              if (!fs.existsSync(sysConfigFilePath)) {
                sendJson(res, 200, { ok: true, exists: false, config: null })
                return
              }
              const raw = fs.readFileSync(sysConfigFilePath, 'utf8')
              sendJson(res, 200, { ok: true, exists: true, config: JSON.parse(raw) })
              return
            }
            if (req.method === 'POST') {
              const buf = await readRequestBodyBuffer(req, 5 * 1024 * 1024)
              const body = JSON.parse(buf.toString('utf8'))
              fs.writeFileSync(sysConfigFilePath, JSON.stringify(body, null, 2), 'utf8')
              sendJson(res, 200, { ok: true, path: sysConfigFilePath })
              return
            }
          }

          // 2. Mock RTDB Stats
          if (pathname === '/__mock_rtdb/stats' && req.method === 'GET') {
            sendJson(res, 200, buildStatsPayload())
            return
          }

          // 3. Mock RTDB Read Data at Path
          if (pathname === '/__mock_rtdb/data' && req.method === 'GET') {
            const db = ensureDbLoaded()
            const targetPath = normalizeDbPath(parsedUrl.searchParams.get('path'))
            const val = getValueAtPath(db, targetPath)
            sendJson(res, 200, { ok: true, path: targetPath, data: val })
            return
          }

          // 4. Mock RTDB Mutate (set / update / remove)
          if (pathname === '/__mock_rtdb/mutate' && req.method === 'POST') {
            const db = ensureDbLoaded()
            const buf = await readRequestBodyBuffer(req, 150 * 1024 * 1024)
            const payload = JSON.parse(buf.toString('utf8'))
            const op = payload?.op as 'set' | 'update' | 'remove'
            const basePath = normalizeDbPath(payload?.path)
            const value = payload?.value

            if (op === 'set') {
              const tbl = setValueAtPath(db, basePath, value)
              dirtyStatTables.add(tbl)
            } else if (op === 'remove') {
              const tbl = setValueAtPath(db, basePath, null)
              dirtyStatTables.add(tbl)
            } else if (op === 'update' && value && typeof value === 'object') {
              for (const [subKey, subVal] of Object.entries(value)) {
                const fullSubPath = basePath
                  ? `${basePath}/${normalizeDbPath(subKey)}`
                  : normalizeDbPath(subKey)
                const tbl = setValueAtPath(db, fullSubPath, subVal)
                dirtyStatTables.add(tbl)
              }
            } else {
              sendJson(res, 400, { ok: false, error: `Operation không hợp lệ: ${String(op)}` })
              return
            }

            mutationCount++
            scheduleDraftSave()
            sendJson(res, 200, { ok: true, mutationCount })
            return
          }

          // 5. Mock RTDB Reset to Original Base mockdata.json
          if (pathname === '/__mock_rtdb/reset' && req.method === 'POST') {
            if (saveTimer) {
              clearTimeout(saveTimer)
              saveTimer = null
            }
            isDirtyToDisk = false
            if (fs.existsSync(draftMockFilePath)) {
              fs.unlinkSync(draftMockFilePath)
            }
            memDb = null
            mutationCount = 0
            ensureDbLoaded()
            sendJson(res, 200, buildStatsPayload())
            return
          }

          // 6. Mock RTDB Import New Base JSON File
          if (pathname === '/__mock_rtdb/import-base' && req.method === 'POST') {
            const buf = await readRequestBodyBuffer(req, 250 * 1024 * 1024)
            const parsed = JSON.parse(buf.toString('utf8'))
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
              sendJson(res, 400, {
                ok: false,
                error: 'File JSON không đúng định dạng Object gốc của Firebase Export.'
              })
              return
            }
            if (saveTimer) {
              clearTimeout(saveTimer)
              saveTimer = null
            }
            isDirtyToDisk = false
            const targetBase = resolveBaseMockPath()
            fs.mkdirSync(path.dirname(targetBase), { recursive: true })
            const tmpBase = `${targetBase}.tmp`
            fs.writeFileSync(tmpBase, buf)
            fs.renameSync(tmpBase, targetBase)
            if (fs.existsSync(draftMockFilePath)) {
              fs.unlinkSync(draftMockFilePath)
            }
            memDb = parsed
            activeSource = 'base'
            mutationCount = 0
            rebuildAllTableStats(memDb!)
            sendJson(res, 200, buildStatsPayload())
            return
          }

          // 7. Mock RTDB Export Current Working DB as Downloadable JSON
          if (pathname === '/__mock_rtdb/export' && req.method === 'GET') {
            const db = ensureDbLoaded()
            flushDraftToDiskSync()
            const now = new Date()
            const pad = (n: number) => String(n).padStart(2, '0')
            const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`
            const fileName = `sonai-mockdata-export-${stamp}.json`
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
            res.setHeader('Cache-Control', 'no-store')
            res.end(JSON.stringify(db, null, 2))
            return
          }

          // 8. Local File Upload Mock (Saves Cloudinary / ImgBB files locally during testing)
          if (pathname === '/__mock_upload' && req.method === 'POST') {
            const ct = String(req.headers['content-type'] || '')
            const buf = await readRequestBodyBuffer(req, 100 * 1024 * 1024)
            const filePart = parseMultipartFile(buf, ct)
            if (!filePart) {
              sendJson(res, 400, { ok: false, error: 'Không tìm thấy file trong multipart payload' })
              return
            }
            fs.mkdirSync(localUploadsDir, { recursive: true })
            const safeBase = filePart.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
            const savedName = `${Date.now()}_${safeBase}`
            const destPath = path.join(localUploadsDir, savedName)
            fs.writeFileSync(destPath, filePart.data)

            const hostHeader = req.headers.host || 'localhost:5173'
            const localUrl = `http://${hostHeader}/__local_uploads/${encodeURIComponent(savedName)}`

            sendJson(res, 200, {
              ok: true,
              success: true,
              status: 200,
              secure_url: localUrl,
              url: localUrl,
              original_filename: filePart.fileName,
              bytes: filePart.data.length,
              data: {
                url: localUrl,
                display_url: localUrl,
                title: filePart.fileName,
                size: filePart.data.length
              }
            })
            return
          }

          // 9. Vietnamese TTS Audio Stream Proxy (Đảm bảo giọng đọc Tiếng Việt chuẩn vi-VN 100% trên mọi trình duyệt)
          if (pathname === '/__tts_vi' && req.method === 'GET') {
            const q = String(parsedUrl.searchParams.get('q') || '').trim().slice(0, 220)
            if (!q) {
              sendJson(res, 400, { ok: false, error: 'Thiếu nội dung cần đọc (q)' })
              return
            }
            let audioBuf = ttsViAudioCache.get(q)
            if (!audioBuf) {
              const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(q)}`
              const upstream = await fetch(ttsUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                  'Referer': 'https://translate.google.com/'
                }
              })
              if (!upstream.ok) {
                sendJson(res, upstream.status, { ok: false, error: `TTS upstream HTTP ${upstream.status}` })
                return
              }
              const arrBuf = await upstream.arrayBuffer()
              audioBuf = Buffer.from(arrBuf)
              if (ttsViAudioCache.size >= 400) {
                const oldestKey = ttsViAudioCache.keys().next().value
                if (oldestKey) ttsViAudioCache.delete(oldestKey)
              }
              ttsViAudioCache.set(q, audioBuf)
            }
            res.statusCode = 200
            res.setHeader('Content-Type', 'audio/mpeg')
            res.setHeader('Content-Length', String(audioBuf.length))
            res.setHeader('Accept-Ranges', 'bytes')
            res.setHeader('Cache-Control', 'public, max-age=86400')
            res.end(audioBuf)
            return
          }

          sendJson(res, 404, { ok: false, error: `Endpoint không tồn tại: ${pathname}` })
        } catch (err: any) {
          console.error(`[MockPlugin] Error handling ${pathname}:`, err)
          sendJson(res, 500, { ok: false, error: err?.message || String(err) })
        }
      })
    }
  }
}
