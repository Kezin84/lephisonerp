import { getSystemConfigSync, isMockUploadActive } from './systemConfig'

let installed = false

export function installFetchInterceptor(): void {
  if (installed || typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return
  }
  installed = true

  const nativeFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input?.url || ''

      // Allow SystemConfig test pings to bypass rewriting when explicitly marked
      const headersObj = init?.headers
      const isDirectTest =
        headersObj &&
        ((headersObj instanceof Headers && headersObj.get('X-Sonai-Direct-Test') === '1') ||
          (Array.isArray(headersObj) &&
            headersObj.some(([k, v]) => k.toLowerCase() === 'x-sonai-direct-test' && v === '1')) ||
          (typeof headersObj === 'object' &&
            !(headersObj instanceof Headers) &&
            !Array.isArray(headersObj) &&
            ((headersObj as Record<string, string>)['X-Sonai-Direct-Test'] === '1' ||
              (headersObj as Record<string, string>)['x-sonai-direct-test'] === '1')))

      if (isDirectTest) {
        const cleanHeaders = new Headers(init?.headers)
        cleanHeaders.delete('X-Sonai-Direct-Test')
        return nativeFetch(input, { ...init, headers: cleanHeaders })
      }

      const cfg = getSystemConfigSync()

      // 1. Intercept Cloudinary Upload API calls across all 15+ components & helpers
      const cloudinaryMatch = urlStr.match(
        /^https:\/\/api\.cloudinary\.com\/v1_1\/([^/]+)\/([^/]+)\/upload(\?.*)?$/i
      )
      if (cloudinaryMatch) {
        if (isMockUploadActive() && init?.body instanceof FormData) {
          const fileEntry = init.body.get('file')
          const mockFd = new FormData()
          if (fileEntry instanceof Blob) {
            const fName = (fileEntry as File).name || `cloudinary_mock_${Date.now()}.bin`
            mockFd.append('file', fileEntry, fName)
            return nativeFetch('/__mock_upload?provider=cloudinary', {
              method: 'POST',
              body: mockFd
            })
          }
        }

        const resourceType = cloudinaryMatch[2] || 'auto'
        const querySuffix = cloudinaryMatch[3] || ''
        const targetCloud = (cfg.storage.cloudinaryCloudName || cloudinaryMatch[1]).trim()
        const targetPreset = (cfg.storage.cloudinaryUploadPreset || '').trim()

        const nextUrl = `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload${querySuffix}`
        if (init?.body instanceof FormData && targetPreset) {
          init.body.set('upload_preset', targetPreset)
        }
        return nativeFetch(nextUrl, init)
      }

      // 2. Intercept ImgBB Upload API calls across reportFIREBASE, SaleReport, report
      if (/^https:\/\/api\.imgbb\.com\/1\/upload(\?.*)?$/i.test(urlStr)) {
        if (isMockUploadActive() && init?.body instanceof FormData) {
          const imgEntry = init.body.get('image') || init.body.get('file')
          if (imgEntry instanceof Blob) {
            const mockFd = new FormData()
            const fName = (imgEntry as File).name || `imgbb_mock_${Date.now()}.png`
            mockFd.append('file', imgEntry, fName)
            return nativeFetch('/__mock_upload?provider=imgbb', {
              method: 'POST',
              body: mockFd
            })
          }
        }

        const activeKey = (cfg.storage.imgbbApiKey || '').trim()
        let nextUrl = urlStr
        if (activeKey) {
          if (init?.body instanceof FormData && init.body.has('key')) {
            init.body.set('key', activeKey)
          }
          if (nextUrl.includes('key=')) {
            const u = new URL(nextUrl)
            u.searchParams.set('key', activeKey)
            nextUrl = u.toString()
          }
        }
        return nativeFetch(nextUrl, init)
      }
    } catch (interceptErr) {
      console.warn('[SystemConfig] Fetch interceptor warning:', interceptErr)
    }

    return nativeFetch(input, init)
  }
}
