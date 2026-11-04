import { reactive } from 'vue'

export interface FirebaseRuntimeConfig {
  apiKey: string
  authDomain: string
  databaseURL: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

export interface StorageRuntimeConfig {
  cloudinaryCloudName: string
  cloudinaryUploadPreset: string
  imgbbApiKey: string
  mockLocalUpload: boolean
}

export interface AiRuntimeConfig {
  dolaApiUrl: string
  dolaApiKey: string
  dolaModel: string
  deepseekApiUrl: string
  deepseekApiKey: string
  deepseekModel: string
}

export interface ZaloBotRuntimeConfig {
  defaultBotToken: string
  defaultInviteUrl: string
  pauseInMockMode: boolean
}

export interface UiRuntimeConfig {
  showQuickBadge: boolean
  theme: 'dark' | 'light'
}

export interface SystemConfig {
  dbMode: 'mock' | 'live'
  firebase: FirebaseRuntimeConfig
  storage: StorageRuntimeConfig
  ai: AiRuntimeConfig
  zaloBot: ZaloBotRuntimeConfig
  ui: UiRuntimeConfig
  updatedAt: string
}

declare global {
  interface Window {
    __SONAI_DISK_CONFIG__?: Partial<SystemConfig>
  }
}

export const SYSTEM_CONFIG_STORAGE_KEY = 'sonai_system_config_v1'
export const CLOUD_RUNTIME_CONFIG_NODE = '_sonai_runtime_api_config'

export interface CloudSharedApiConfig {
  storage: Pick<
    StorageRuntimeConfig,
    'cloudinaryCloudName' | 'cloudinaryUploadPreset' | 'imgbbApiKey'
  >
  ai: AiRuntimeConfig
  zaloBot: ZaloBotRuntimeConfig
  updatedAt: string
}

export interface CloudSyncMeta {
  state: 'idle' | 'syncing' | 'synced' | 'offline_mock' | 'error'
  lastSyncedAt: string
  message: string
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  dbMode: 'mock',
  firebase: {
    apiKey: 'AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8',
    authDomain: 'chusonproject.firebaseapp.com',
    databaseURL: 'https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'chusonproject',
    storageBucket: 'chusonproject.firebasestorage.app',
    messagingSenderId: '929199941311',
    appId: '1:929199941311:web:ca8d86f9fd7f8dff61480a',
    measurementId: 'G-48VVPGFSFK'
  },
  storage: {
    cloudinaryCloudName: 'db6fzs3rh',
    cloudinaryUploadPreset: 'upload_file',
    imgbbApiKey: 'b202a4bdc79bf1dc72f6f6ded6b74501',
    mockLocalUpload: false
  },
  ai: {
    dolaApiUrl: '/byteplus-api/api/v3/responses',
    dolaApiKey:
      'VxCgNvLTE.ChthcGlrZXktMjAyNjEwMDUyMjA3NDktbGZyenEQ-5_rmAsYAiDyo-wtKhDgCT1nn4hI6LzlzeTU72K3.vUwluX2I2E5r_-5GdUJJapo_mIprJtyuroN1FWEcgAsaRatBdjaMKEGtxSmDrms9MZr5Zs0LXZ13LOWgJyDZrAeZ',
    dolaModel: 'deepseek-v4-1-flash-261017',
    deepseekApiUrl: '/byteplus-api/api/v3/responses',
    deepseekApiKey:
      'VxCgNvLTE.ChthcGlrZXktMjAyNjEwMDUyMjA3NDktbGZyenEQ-5_rmAsYAiDyo-wtKhDgCT1nn4hI6LzlzeTU72K3.vUwluX2I2E5r_-5GdUJJapo_mIprJtyuroN1FWEcgAsaRatBdjaMKEGtxSmDrms9MZr5Zs0LXZ13LOWgJyDZrAeZ',
    deepseekModel: 'deepseek-v4-1-flash-261017'
  },
  zaloBot: {
    defaultBotToken:
      '1563589356003514094:IQXjmlrjRECxVFrbKGrCBToMkXiwjEsamxjqPaOcWENyYzPzYYygUQgoYxHdCRge',
    defaultInviteUrl: 'https://bot.zaloplatforms.com/groups/invite/bot.QkJpMNVs',
    pauseInMockMode: true
  },
  ui: {
    showQuickBadge: true,
    theme: 'dark'
  },
  updatedAt: ''
}

export function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '[::1]' ||
    h.endsWith('.local') ||
    /^192\.168\.\d+\.\d+$/.test(h) ||
    /^10\.\d+\.\d+\.\d+$/.test(h)
  )
}

export function hasAuthSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return Boolean(
      window.localStorage.getItem('auth_token') || window.sessionStorage.getItem('auth_token')
    )
  } catch {
    return false
  }
}

export function cloneDefaultConfig(): SystemConfig {
  return JSON.parse(JSON.stringify(DEFAULT_SYSTEM_CONFIG))
}

const LEGACY_AI_MODELS = new Set(['seed-2-0-pro-260328', 'deepseek-v4-pro-ga-260813'])
const LEGACY_DEEPSEEK_KEY =
  'VxCgNvLTE.ChthcGlrZXktMjAyNjEwMDUyMTA2MjEtN2ZzOW0Q-5_rmAsYAiCfgOwtKhAaV-B60txBRYBHBOtS7fGX.3anjjKeiObCad8KG5EhozRtIuoD2U-BFpSMbkg0T_HZW4vy4gHGiyyx5DjmiJrkVDu0bG_oO8PuNQmGsOS12HweZ'

function migrateLegacyAiConfig(ai: AiRuntimeConfig, baseAi: AiRuntimeConfig): AiRuntimeConfig {
  const out = { ...baseAi, ...ai }
  if (!out.dolaModel || LEGACY_AI_MODELS.has(out.dolaModel.trim())) {
    out.dolaModel = baseAi.dolaModel
  }
  if (!out.deepseekModel || LEGACY_AI_MODELS.has(out.deepseekModel.trim())) {
    out.deepseekModel = baseAi.deepseekModel
  }
  if (!out.dolaApiUrl || /\/chat\/completions\/?$/i.test(out.dolaApiUrl.trim())) {
    out.dolaApiUrl = baseAi.dolaApiUrl
  }
  if (!out.deepseekApiUrl || /\/chat\/completions\/?$/i.test(out.deepseekApiUrl.trim())) {
    out.deepseekApiUrl = baseAi.deepseekApiUrl
  }
  if (!out.dolaApiKey || out.dolaApiKey.trim() === LEGACY_DEEPSEEK_KEY) {
    out.dolaApiKey = baseAi.dolaApiKey
  }
  if (!out.deepseekApiKey || out.deepseekApiKey.trim() === LEGACY_DEEPSEEK_KEY) {
    out.deepseekApiKey = baseAi.deepseekApiKey
  }
  return out
}

export function mergeSystemConfig(partial?: Partial<SystemConfig> | null): SystemConfig {
  const base = cloneDefaultConfig()
  if (!partial || typeof partial !== 'object') return base

  const dbMode = partial.dbMode === 'live' || partial.dbMode === 'mock' ? partial.dbMode : base.dbMode
  const mergedAi = migrateLegacyAiConfig(
    {
      ...base.ai,
      ...(partial.ai && typeof partial.ai === 'object' ? partial.ai : {})
    },
    base.ai
  )

  return {
    dbMode,
    firebase: {
      ...base.firebase,
      ...(partial.firebase && typeof partial.firebase === 'object' ? partial.firebase : {})
    },
    storage: {
      ...base.storage,
      ...(partial.storage && typeof partial.storage === 'object' ? partial.storage : {})
    },
    ai: mergedAi,
    zaloBot: {
      ...base.zaloBot,
      ...(partial.zaloBot && typeof partial.zaloBot === 'object' ? partial.zaloBot : {})
    },
    ui: {
      ...base.ui,
      ...(partial.ui && typeof partial.ui === 'object' ? partial.ui : {})
    },
    updatedAt: typeof partial.updatedAt === 'string' ? partial.updatedAt : base.updatedAt
  }
}

function loadInitialSystemConfig(): SystemConfig {
  if (typeof window === 'undefined') return cloneDefaultConfig()

  let localParsed: Partial<SystemConfig> | null = null
  try {
    const raw = window.localStorage.getItem(SYSTEM_CONFIG_STORAGE_KEY)
    if (raw) {
      localParsed = JSON.parse(raw)
    }
  } catch {
    localParsed = null
  }

  const diskCfg = window.__SONAI_DISK_CONFIG__
  if (diskCfg && typeof diskCfg === 'object') {
    const merged = mergeSystemConfig(diskCfg)
    try {
      window.localStorage.setItem(SYSTEM_CONFIG_STORAGE_KEY, JSON.stringify(merged))
    } catch {
      // ignore storage quota errors
    }
    return merged
  }

  if (localParsed) {
    return mergeSystemConfig(localParsed)
  }

  const envMock = (import.meta as any)?.env?.VITE_USE_MOCK_DB
  const fallback = cloneDefaultConfig()
  if (envMock === 'false') {
    fallback.dbMode = 'live'
  } else if (envMock === 'true') {
    fallback.dbMode = 'mock'
  } else if (!isLocalDevHost()) {
    fallback.dbMode = 'live'
  }
  return fallback
}

const reactiveConfig = reactive<SystemConfig>(loadInitialSystemConfig())

const cloudSyncMeta = reactive<CloudSyncMeta>({
  state: isLocalDevHost() && reactiveConfig.dbMode === 'mock' ? 'offline_mock' : 'idle',
  lastSyncedAt: '',
  message: ''
})

export function getSystemConfigSync(): SystemConfig {
  return reactiveConfig
}

export function useSystemConfig(): SystemConfig {
  return reactiveConfig
}

export function useCloudSyncMeta(): CloudSyncMeta {
  return cloudSyncMeta
}

export function isMockDbActive(): boolean {
  if (!isLocalDevHost()) return false
  return reactiveConfig.dbMode === 'mock'
}

export function isMockUploadActive(): boolean {
  if (!isLocalDevHost()) return false
  return reactiveConfig.dbMode === 'mock' && Boolean(reactiveConfig.storage.mockLocalUpload)
}

function getLiveFirebaseBaseUrl(cfg: SystemConfig = reactiveConfig): string {
  return (cfg.firebase.databaseURL || DEFAULT_SYSTEM_CONFIG.firebase.databaseURL || '')
    .trim()
    .replace(/\/+$/, '')
}

async function persistToLocalDiskIfDev(cfg: SystemConfig): Promise<boolean> {
  if (!isLocalDevHost()) return false
  try {
    const res = await window.fetch('/__sys_config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    })
    return res.ok
  } catch {
    return false
  }
}

async function pushSharedConfigToCloud(cfg: SystemConfig): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (isMockDbActive()) {
    cloudSyncMeta.state = 'offline_mock'
    cloudSyncMeta.message = 'Đang chạy Mock JSON (sẽ tự đồng bộ Cloud khi chuyển sang DB Thật)'
    return false
  }
  const dbUrl = getLiveFirebaseBaseUrl(cfg)
  if (!dbUrl || !dbUrl.startsWith('https://')) return false

  const payload: CloudSharedApiConfig = {
    storage: {
      cloudinaryCloudName: cfg.storage.cloudinaryCloudName,
      cloudinaryUploadPreset: cfg.storage.cloudinaryUploadPreset,
      imgbbApiKey: cfg.storage.imgbbApiKey
    },
    ai: { ...cfg.ai },
    zaloBot: { ...cfg.zaloBot },
    updatedAt: cfg.updatedAt || new Date().toISOString()
  }

  cloudSyncMeta.state = 'syncing'
  try {
    const res = await window.fetch(`${dbUrl}/${CLOUD_RUNTIME_CONFIG_NODE}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Sonai-Direct-Test': '1'
      },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      cloudSyncMeta.state = 'synced'
      cloudSyncMeta.lastSyncedAt = new Date().toISOString()
      cloudSyncMeta.message = 'Đã đồng bộ tự động lên Cloud'
      return true
    }
    cloudSyncMeta.state = 'error'
    cloudSyncMeta.message = `Cloud trả mã HTTP ${res.status}`
    return false
  } catch (err: any) {
    cloudSyncMeta.state = 'error'
    cloudSyncMeta.message = err?.message || 'Không thể kết nối Cloud'
    return false
  }
}

let lastCloudSyncCheckMs = 0
let inflightCloudSync: Promise<'pulled' | 'pushed' | 'up_to_date' | 'skipped'> | null = null

export async function syncSystemConfigWithCloud(
  force = false
): Promise<'pulled' | 'pushed' | 'up_to_date' | 'skipped'> {
  if (typeof window === 'undefined') return 'skipped'
  if (isMockDbActive()) {
    cloudSyncMeta.state = 'offline_mock'
    return 'skipped'
  }
  // Security & Zero-Bot-Bandwidth: never fetch or expose runtime API keys before login!
  if (!hasAuthSession()) {
    return 'skipped'
  }

  const now = Date.now()
  if (!force && now - lastCloudSyncCheckMs < 60_000) {
    return 'up_to_date'
  }
  if (inflightCloudSync) {
    return inflightCloudSync
  }

  inflightCloudSync = (async () => {
    const dbUrl = getLiveFirebaseBaseUrl()
    if (!dbUrl || !dbUrl.startsWith('https://')) return 'skipped'

    cloudSyncMeta.state = 'syncing'
    try {
      const res = await window.fetch(`${dbUrl}/${CLOUD_RUNTIME_CONFIG_NODE}.json`, {
        method: 'GET',
        headers: { 'X-Sonai-Direct-Test': '1' },
        cache: 'no-store'
      })
      if (!res.ok) {
        cloudSyncMeta.state = 'error'
        cloudSyncMeta.message = `HTTP ${res.status}`
        return 'skipped'
      }

      lastCloudSyncCheckMs = Date.now()
      const cloudData = (await res.json()) as Partial<CloudSharedApiConfig> | null

      const localTs = Date.parse(reactiveConfig.updatedAt || '') || 0
      const cloudTs =
        cloudData && typeof cloudData === 'object' && typeof cloudData.updatedAt === 'string'
          ? Date.parse(cloudData.updatedAt) || 0
          : 0

      if (cloudData && typeof cloudData === 'object' && cloudTs > localTs) {
        // Cloud has fresher API keys -> automatically pull into this device!
        const nextMerged = mergeSystemConfig({
          ...JSON.parse(JSON.stringify(reactiveConfig)),
          storage: {
            ...reactiveConfig.storage,
            ...(cloudData.storage || {}),
            mockLocalUpload: reactiveConfig.storage.mockLocalUpload
          },
          ai: {
            ...reactiveConfig.ai,
            ...(cloudData.ai || {})
          },
          zaloBot: {
            ...reactiveConfig.zaloBot,
            ...(cloudData.zaloBot || {})
          },
          updatedAt: cloudData.updatedAt
        })

        Object.assign(reactiveConfig.storage, nextMerged.storage)
        Object.assign(reactiveConfig.ai, nextMerged.ai)
        Object.assign(reactiveConfig.zaloBot, nextMerged.zaloBot)
        reactiveConfig.updatedAt = nextMerged.updatedAt

        try {
          window.localStorage.setItem(SYSTEM_CONFIG_STORAGE_KEY, JSON.stringify(nextMerged))
        } catch {
          // ignore
        }
        await persistToLocalDiskIfDev(nextMerged)

        cloudSyncMeta.state = 'synced'
        cloudSyncMeta.lastSyncedAt = new Date().toISOString()
        cloudSyncMeta.message = 'Đã nhận Key mới nhất từ Cloud'
        return 'pulled'
      }

      if (localTs > cloudTs && localTs > 0) {
        // Local device has newer API key edits (e.g. edited while in Mock mode) -> auto push to Cloud!
        const ok = await pushSharedConfigToCloud(reactiveConfig)
        return ok ? 'pushed' : 'skipped'
      }

      cloudSyncMeta.state = 'synced'
      cloudSyncMeta.lastSyncedAt = new Date().toISOString()
      cloudSyncMeta.message = 'Đồng bộ Cloud mới nhất'
      return 'up_to_date'
    } catch (err: any) {
      cloudSyncMeta.state = 'error'
      cloudSyncMeta.message = err?.message || 'Lỗi kiểm tra Cloud'
      return 'skipped'
    } finally {
      inflightCloudSync = null
    }
  })()

  return inflightCloudSync
}

export async function saveSystemConfig(
  nextPartial: Partial<SystemConfig>,
  options?: { syncCloud?: boolean; preserveUpdatedAt?: boolean }
): Promise<{ savedToDisk: boolean; syncedToCloud: boolean; config: SystemConfig }> {
  const shouldSyncCloud = options?.syncCloud !== false
  const nextUpdatedAt = options?.preserveUpdatedAt
    ? reactiveConfig.updatedAt
    : new Date().toISOString()

  const merged = mergeSystemConfig({
    ...JSON.parse(JSON.stringify(reactiveConfig)),
    ...nextPartial,
    firebase: {
      ...reactiveConfig.firebase,
      ...(nextPartial.firebase || {})
    },
    storage: {
      ...reactiveConfig.storage,
      ...(nextPartial.storage || {})
    },
    ai: {
      ...reactiveConfig.ai,
      ...(nextPartial.ai || {})
    },
    zaloBot: {
      ...reactiveConfig.zaloBot,
      ...(nextPartial.zaloBot || {})
    },
    ui: {
      ...reactiveConfig.ui,
      ...(nextPartial.ui || {})
    },
    updatedAt: nextUpdatedAt
  })

  Object.assign(reactiveConfig.firebase, merged.firebase)
  Object.assign(reactiveConfig.storage, merged.storage)
  Object.assign(reactiveConfig.ai, merged.ai)
  Object.assign(reactiveConfig.zaloBot, merged.zaloBot)
  Object.assign(reactiveConfig.ui, merged.ui)
  reactiveConfig.dbMode = merged.dbMode
  reactiveConfig.updatedAt = merged.updatedAt

  try {
    window.localStorage.setItem(SYSTEM_CONFIG_STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // ignore
  }

  const savedToDisk = await persistToLocalDiskIfDev(merged)

  let syncedToCloud = false
  if (shouldSyncCloud && !isMockDbActive()) {
    syncedToCloud = await pushSharedConfigToCloud(merged)
    if (syncedToCloud) {
      lastCloudSyncCheckMs = Date.now()
    }
  }

  return { savedToDisk, syncedToCloud, config: merged }
}

export async function switchDbModeAndReload(targetMode?: 'mock' | 'live'): Promise<void> {
  if (!isLocalDevHost()) return
  const nextMode = targetMode || (reactiveConfig.dbMode === 'mock' ? 'live' : 'mock')
  await saveSystemConfig({ dbMode: nextMode }, { syncCloud: false, preserveUpdatedAt: true })
  window.location.reload()
}

export function parseFirebaseConfigSnippet(snippet: string): Partial<FirebaseRuntimeConfig> {
  const result: Partial<FirebaseRuntimeConfig> = {}
  if (!snippet || !snippet.trim()) return result

  const keys: (keyof FirebaseRuntimeConfig)[] = [
    'apiKey',
    'authDomain',
    'databaseURL',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
    'measurementId'
  ]

  for (const key of keys) {
    const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`)
    const match = snippet.match(regex)
    if (match && match[1]) {
      result[key] = match[1].trim()
    }
  }
  return result
}
