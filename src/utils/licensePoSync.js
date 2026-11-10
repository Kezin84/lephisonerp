import { ref as dbRef, get, set, push, update } from 'firebase/database'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url'
import Tesseract from 'tesseract.js'
import { callDeepSeek } from '../services/deepseek'
import { callSmartDocumentAI } from './universalDocumentReader'

const _pdfWorker = pdfjsLib?.GlobalWorkerOptions || pdfjsLib?.default?.GlobalWorkerOptions
if (_pdfWorker && !_pdfWorker.workerSrc) {
  _pdfWorker.workerSrc = pdfWorkerUrl
}

export function normalizeViText(str) {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const COMPANY_STOP_WORDS = new Set([
  'cong', 'ty', 'tnhh', 'co', 'phan', 'cp', 'tm', 'dv', 'sx', 'xd', 'mtv',
  'mot', 'thanh', 'vien', 'chi', 'nhanh', 'cn', 'tap', 'doan', 'tong',
  'thuong', 'mai', 'dich', 'vu', 'san', 'xuat', 'xay', 'dung', 'dau', 'tu',
  'phat', 'trien', 'cong', 'nghe', 'giai', 'phap', 'tin', 'hoc', 'phan', 'mem',
  'company', 'ltd', 'limited', 'jsc', 'joint', 'stock', 'corp', 'corporation',
  'inc', 'group', 'vietnam', 'viet', 'nam', 'vn', 'trading', 'service',
  'services', 'technology', 'solutions', 'solution', 'one', 'member', 'branch',
  'of', 'the', 'and', 'international', 'global', 'system', 'systems', 'enterprises'
])

export function extractCompanyCoreInfo(rawName) {
  const norm = normalizeViText(rawName)
  if (!norm) return { norm: '', coreKey: '', coreTokens: [] }
  const allTokens = norm.split(' ').filter(Boolean)
  const coreTokens = allTokens.filter(t => t.length > 1 && !COMPANY_STOP_WORDS.has(t))
  const effectiveTokens = coreTokens.length > 0 ? coreTokens : allTokens
  return {
    norm,
    coreKey: effectiveTokens.join(' '),
    coreTokens: effectiveTokens
  }
}

export async function loadCustomerAndPoCatalog(database) {
  const customersMap = new Map()
  const officialPos = []

  try {
    const [khSnap, srSnap] = await Promise.all([
      get(dbRef(database, 'khach_hang')),
      get(dbRef(database, 'sale_report'))
    ])

    if (khSnap.exists()) {
      const khRaw = khSnap.val() || {}
      const KH_ARRAY_FIELDS = [
        'ma_khach_hang',
        'ten_khach_hang',
        'email_ca_nhan',
        'so_dien_thoai_ca_nhan',
        'ma_cong_ty',
        'ten_cong_ty',
        'so_dien_thoai_cong_ty',
        'so_fax_cong_ty',
        'dia_chi_cong_ty',
        'email_cong_ty',
        'website_cong_ty',
        'hoa_hong',
        'tong_chi_tieu',
        'tong_loi_nhuan',
        'trang_thai',
        'ghi_chu',
        'ten_khach_hang_phu',
        'so_dien_thoai_ca_nhan_phu',
        'email_ca_nhan_phu',
        'mst'
      ]
      Object.entries(khRaw).forEach(([fbKey, rawVal]) => {
        if (!rawVal || typeof rawVal !== 'object') return
        let val = rawVal
        if (Array.isArray(rawVal)) {
          val = {}
          KH_ARRAY_FIELDS.forEach((field, idx) => {
            val[field] = rawVal[idx] !== undefined && rawVal[idx] !== null ? rawVal[idx] : ''
          })
        }
        const maKhachHang = String(val.ma_khach_hang || val.Ma_khach_hang || val.MA_KHACH_HANG || fbKey || '').trim()
        const tenCongTy = String(val.ten_cong_ty || val.Ten_cong_ty || val.company || val.customer || val.ten_khach_hang || val.Ten_khach_hang || '').trim()
        const tenKhachHang = String(val.ten_khach_hang || val.Ten_khach_hang || '').trim()
        const mst = String(val.mst || val.MST || val.ma_so_thue || '').trim()
        const maCongTy = String(val.ma_cong_ty || val.Ma_cong_ty || '').trim()
        if (!maKhachHang && !tenCongTy && !tenKhachHang) return

        const key = maKhachHang || normalizeViText(tenCongTy || tenKhachHang)
        const core = extractCompanyCoreInfo(tenCongTy || tenKhachHang)
        customersMap.set(key, {
          firebaseKey: fbKey,
          ma_khach_hang: maKhachHang || key,
          ten_cong_ty: tenCongTy || tenKhachHang || maKhachHang,
          ten_khach_hang: tenKhachHang,
          ten_khach_hang_phu: String(val.ten_khach_hang_phu || '').trim(),
          mst,
          ma_cong_ty: maCongTy,
          so_dien_thoai_ca_nhan: String(val.so_dien_thoai_ca_nhan || val.sdt || val.tel || '').trim(),
          email_ca_nhan: String(val.email_ca_nhan || val.email || '').trim(),
          dia_chi_cong_ty: String(val.dia_chi_cong_ty || val.dia_chi || val.address || '').trim(),
          so_dien_thoai_cong_ty: String(val.so_dien_thoai_cong_ty || '').trim(),
          email_cong_ty: String(val.email_cong_ty || '').trim(),
          website_cong_ty: String(val.website_cong_ty || '').trim(),
          nganh_nghe_cong_ty: String(val.nganh_nghe_cong_ty || val.Nganh_nghe_cong_ty || '').trim(),
          ghi_chu: String(val.ghi_chu || '').trim(),
          normName: core.norm,
          coreKey: core.coreKey,
          coreTokens: core.coreTokens
        })
      })
    }

    if (srSnap.exists()) {
      const srRaw = srSnap.val() || {}
      Object.entries(srRaw).forEach(([fbKey, r]) => {
        if (!r || typeof r !== 'object') return
        const soPO = String(r.So_PO || r.so_po || r.soPO || '').trim()
        const maKhachHang = String(r.Ma_khach_hang || r.ma_khach_hang || '').trim()
        const tenCongTy = String(r.Ten_cong_ty || r.customer || r.Ten_khach_hang || '').trim()
        const tenKhachHang = String(r.Ten_khach_hang || r.recipient || '').trim()
        const mst = String(r.MST || r.mst || '').trim()
        const content = String(
          r.content_of_contract_PO ||
          r.content_of_contract_po ||
          r['content_of_contract/PO'] ||
          r.Content_of_Contract_PO ||
          r.Noi_dung ||
          r.content ||
          r.Ten_file ||
          ''
        ).trim()
        const createdTime = String(r.Created_time || r.created_time || r.Ngay_PO || '').trim()
        const productType = String(r.Ten_nha_cung_cap || r.ten_nha_cung_cap || r.Product_Type || r.product_type || '').trim()
        const danhSachLicense = Array.isArray(r.danh_sach_license)
          ? r.danh_sach_license
          : (r.danh_sach_license && typeof r.danh_sach_license === 'object' ? Object.values(r.danh_sach_license) : [])

        const danhSachFileKhac = Array.isArray(r.danh_sach_file_khac)
          ? r.danh_sach_file_khac.filter(Boolean)
          : (r.danh_sach_file_khac && typeof r.danh_sach_file_khac === 'object' ? Object.values(r.danh_sach_file_khac).filter(Boolean) : [])

        officialPos.push({
          firebaseKey: fbKey,
          soPO,
          maKhachHang,
          tenCongTy,
          tenKhachHang,
          mst,
          content,
          createdTime,
          productType,
          linkBaoGia: String(r.link_excel_bao_gia || r.link_excel_bao_gia_hd || r.linkBaoGia || '').trim(),
          tenFileBaoGia: String(r.ten_file_bao_gia || r.ten_file_bao_gia_hd || r.tenFileBG || '').trim(),
          linkMuaHang: String(r.link_excel_mua_hang || '').trim(),
          tenFileMuaHang: String(r.ten_file_mua_hang || '').trim(),
          linkDxmh: String(r.link_excel_dxmh || '').trim(),
          tenFileDxmh: String(r.ten_file_dxmh || '').trim(),
          imgSave: String(r.img_save || '').trim(),
          danhSachFileKhac,
          danhSachLicense
        })

        if (tenCongTy || maKhachHang) {
          const existingByCode = maKhachHang && customersMap.get(maKhachHang)
          if (!existingByCode) {
            // Check if company name already exists
            const core = extractCompanyCoreInfo(tenCongTy || tenKhachHang)
            let foundKey = null
            for (const [k, c] of customersMap.entries()) {
              if (c.normName && c.normName === core.norm) {
                foundKey = k
                break
              }
            }
            if (!foundKey) {
              const fallbackCode = maKhachHang || `KH_${fbKey.slice(-6).toUpperCase()}`
              customersMap.set(fallbackCode, {
                firebaseKey: fbKey,
                ma_khach_hang: fallbackCode,
                ten_cong_ty: tenCongTy || tenKhachHang || fallbackCode,
                ten_khach_hang: tenKhachHang,
                mst,
                ma_cong_ty: '',
                normName: core.norm,
                coreKey: core.coreKey,
                coreTokens: core.coreTokens
              })
            }
          }
        }
      })
    }
  } catch (err) {
    console.error('Error loading customer & PO catalog:', err)
  }

  const customers = Array.from(customersMap.values()).sort((a, b) =>
    (a.ten_cong_ty || '').localeCompare(b.ten_cong_ty || '', 'vi')
  )

  // Sort POs newest first
  officialPos.sort((a, b) => String(b.soPO || '').localeCompare(String(a.soPO || ''), undefined, { numeric: true }))

  return { customers, officialPos }
}

export async function saveCustomerRecordToFirebase(database, payload = {}, isCreate = false) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  let maKhachHang = String(payload.ma_khach_hang || '').trim()
  if (!maKhachHang) {
    maKhachHang = `KH_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  }
  const safeFbKey = String(payload.firebaseKey || maKhachHang).trim().replace(/[.#$[\]/]/g, '_')

  const tenCongTy = String(payload.ten_cong_ty || '').trim()
  const tenKhachHang = String(payload.ten_khach_hang || '').trim()
  const mst = String(payload.mst || '').trim()
  const soDienThoaiCaNhan = String(payload.so_dien_thoai_ca_nhan || '').trim()
  const emailCaNhan = String(payload.email_ca_nhan || '').trim()
  const diaChiCongTy = String(payload.dia_chi_cong_ty || '').trim()
  const ghiChu = String(payload.ghi_chu || '').trim()

  const targetRef = dbRef(database, `khach_hang/${safeFbKey}`)
  const existingSnap = await get(targetRef)
  const existingVal = (existingSnap.exists() && existingSnap.val() && typeof existingSnap.val() === 'object' && !Array.isArray(existingSnap.val()))
    ? existingSnap.val()
    : {}

  const recordToSave = {
    ...existingVal,
    ma_khach_hang: maKhachHang,
    ten_cong_ty: tenCongTy,
    ten_khach_hang: tenKhachHang,
    mst,
    so_dien_thoai_ca_nhan: soDienThoaiCaNhan,
    email_ca_nhan: emailCaNhan,
    dia_chi_cong_ty: diaChiCongTy,
    ghi_chu: ghiChu,
    last_updated: nowStr
  }
  if (isCreate || !recordToSave.created_time) {
    recordToSave.created_time = nowStr
  }

  await set(targetRef, recordToSave)

  const core = extractCompanyCoreInfo(tenCongTy || tenKhachHang)
  return {
    firebaseKey: safeFbKey,
    ma_khach_hang: maKhachHang,
    ten_cong_ty: tenCongTy,
    ten_khach_hang: tenKhachHang,
    mst,
    so_dien_thoai_ca_nhan: soDienThoaiCaNhan,
    email_ca_nhan: emailCaNhan,
    dia_chi_cong_ty: diaChiCongTy,
    ghi_chu: ghiChu,
    normName: core.norm,
    coreKey: core.coreKey,
    coreTokens: core.coreTokens
  }
}

export async function propagateCustomerToSameVendorLicenses(
  database,
  vendorCustomerName = '',
  customerPayload = {},
  excludeFirebaseId = ''
) {
  if (!database || !vendorCustomerName) return []
  const normVendor = normalizeViText(vendorCustomerName)
  if (!normVendor) return []

  const maKhachHang = String(customerPayload.ma_khach_hang || customerPayload.MA_KHACH_HANG || '').trim()
  const tenCongTy = String(customerPayload.ten_cong_ty || customerPayload.TEN_CONG_TY || '').trim()
  const tenKhachHang = String(customerPayload.ten_khach_hang || customerPayload.TEN_KHACH_HANG || '').trim()
  if (!maKhachHang && !tenCongTy) return []

  try {
    const licSnap = await get(dbRef(database, 'license_old_data'))
    if (!licSnap.exists()) return []
    const allLicenses = licSnap.val() || {}
    const updatedKeys = []
    const batchUpdates = {}

    for (const [fbKey, rec] of Object.entries(allLicenses)) {
      if (!rec || typeof rec !== 'object') continue
      if (excludeFirebaseId && fbKey === excludeFirebaseId) continue

      const recVendor = normalizeViText(rec.CUSTOMER || '')
      if (!recVendor || recVendor !== normVendor) continue

      const hasExistingDbCust = Boolean(
        String(rec.MA_KHACH_HANG || rec.ma_khach_hang || '').trim() ||
        String(rec.TEN_CONG_TY || rec.ten_cong_ty || '').trim()
      )
      if (!hasExistingDbCust) {
        batchUpdates[`${fbKey}/MA_KHACH_HANG`] = maKhachHang
        batchUpdates[`${fbKey}/TEN_CONG_TY`] = tenCongTy
        if (tenKhachHang) {
          batchUpdates[`${fbKey}/TEN_KHACH_HANG`] = tenKhachHang
        }
        updatedKeys.push(fbKey)
      }
    }

    if (updatedKeys.length > 0) {
      await update(dbRef(database, 'license_old_data'), batchUpdates)
    }

    return updatedKeys
  } catch (err) {
    console.error('propagateCustomerToSameVendorLicenses error:', err)
    return []
  }
}

export function fuzzyMatchCustomer(rawVendorCustomer, customers = []) {
  if (!rawVendorCustomer || !Array.isArray(customers) || customers.length === 0) {
    return { matched: null, score: 0, suggestions: [] }
  }

  const queryInfo = extractCompanyCoreInfo(rawVendorCustomer)
  if (!queryInfo.norm) {
    return { matched: null, score: 0, suggestions: [] }
  }

  const scored = []

  for (const cust of customers) {
    if (!cust.normName) continue
    let score = 0

    if (cust.normName === queryInfo.norm || normalizeViText(cust.ma_khach_hang) === queryInfo.norm) {
      score = 1.0
    } else if (cust.coreKey && queryInfo.coreKey && cust.coreKey === queryInfo.coreKey) {
      score = 0.95
    } else if (
      cust.coreKey &&
      queryInfo.coreKey &&
      cust.coreKey.length >= 4 &&
      queryInfo.coreKey.length >= 4 &&
      (cust.coreKey.includes(queryInfo.coreKey) || queryInfo.coreKey.includes(cust.coreKey))
    ) {
      const shorter = Math.min(cust.coreKey.length, queryInfo.coreKey.length)
      const longer = Math.max(cust.coreKey.length, queryInfo.coreKey.length)
      score = 0.78 + 0.14 * (shorter / longer)
    } else if (cust.coreTokens.length > 0 && queryInfo.coreTokens.length > 0) {
      const setA = new Set(queryInfo.coreTokens)
      const setB = new Set(cust.coreTokens)
      let inter = 0
      for (const tok of setA) {
        if (setB.has(tok)) inter++
      }
      if (inter > 0) {
        const dice = (2 * inter) / (setA.size + setB.size)
        const coverageA = inter / setA.size
        const coverageB = inter / setB.size
        score = Math.max(dice, (coverageA + coverageB) / 2) * 0.88
      }
    }

    if (score >= 0.45) {
      scored.push({ customer: cust, score })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0] || null
  return {
    matched: best && best.score >= 0.62 ? best.customer : null,
    score: best ? best.score : 0,
    suggestions: scored.slice(0, 6).map(s => s.customer)
  }
}

export function filterPosForCustomer(officialPos = [], maKhachHang = '', tenCongTy = '', vendorCustomer = '') {
  if (!Array.isArray(officialPos) || officialPos.length === 0) return []
  const normCode = normalizeViText(maKhachHang)
  const coreCompany = extractCompanyCoreInfo(tenCongTy)
  const coreVendor = extractCompanyCoreInfo(vendorCustomer)

  if (!normCode && !coreCompany.coreKey && !coreVendor.coreKey) {
    return officialPos
  }

  const matched = officialPos.filter(po => {
    if (normCode && normalizeViText(po.maKhachHang) === normCode) return true
    const poCore = extractCompanyCoreInfo(po.tenCongTy)
    if (!poCore.coreKey) return false
    if (coreCompany.coreKey && (poCore.coreKey === coreCompany.coreKey || poCore.norm === coreCompany.norm)) {
      return true
    }
    if (
      coreVendor.coreKey &&
      coreVendor.coreKey.length >= 4 &&
      (poCore.coreKey === coreVendor.coreKey ||
        poCore.coreKey.includes(coreVendor.coreKey) ||
        coreVendor.coreKey.includes(poCore.coreKey))
    ) {
      return true
    }
    return false
  })

  return matched.length > 0 ? matched : officialPos
}

export function buildLicenseSummaryForPO(licenseFirebaseId, licenseData = {}) {
  const fileName =
    licenseData.NAME_FILE ||
    licenseData.ten_file ||
    (licenseData.LICENSE_ID ? `License_${licenseData.LICENSE_ID}.pdf` : 'License_Certificate.pdf')
  const fileUrl = licenseData.LINK_FILE || licenseData.link_file || ''
  const resolvedFbId = String(
    licenseFirebaseId || licenseData.firebase_id || licenseData.licenseFirebaseId || licenseData.id || ''
  )

  return {
    id: resolvedFbId,
    firebase_id: resolvedFbId,
    licenseFirebaseId: resolvedFbId,
    LICENSE_ID: String(licenseData.LICENSE_ID || ''),
    PRODUCT_NAME: String(licenseData.PRODUCT_NAME || ''),
    PRODUCT_CODE: String(licenseData.PRODUCT_CODE || ''),
    NHA_SAN_XUAT: String(licenseData.NHA_SAN_XUAT || ''),
    LICENSE_VOLUME: String(licenseData.LICENSE_VOLUME || ''),
    LICENSE_TYPE: String(licenseData.LICENSE_TYPE || ''),
    LOCALIZATION: String(licenseData.LOCALIZATION || ''),
    LICENSE_DESCRIPTION: String(licenseData.LICENSE_DESCRIPTION || ''),
    DATE_OF_LICENSE: String(licenseData.DATE_OF_LICENSE || ''),
    EXPIRATION_TIME: String(licenseData.EXPIRATION_TIME || ''),
    SO_NGAY_HIEU_LUC: String(licenseData.SO_NGAY_HIEU_LUC || ''),
    CUSTOMER: String(licenseData.CUSTOMER || ''),
    MA_KHACH_HANG: String(licenseData.MA_KHACH_HANG || ''),
    TEN_CONG_TY: String(licenseData.TEN_CONG_TY || ''),
    SO_PO: String(licenseData.SO_PO || ''),
    PO_FIREBASE_KEY: String(licenseData.PO_FIREBASE_KEY || ''),
    NAME_FILE: String(fileName),
    LINK_FILE: String(fileUrl),
    ten_file: String(fileName),
    link_file: String(fileUrl),
    ngay_tai: String(licenseData.ngay_tai || new Date().toLocaleString('vi-VN'))
  }
}

function isPoLicenseEntryMatchingTarget(item, targetFbId, normLicId = '') {
  if (!item || typeof item !== 'object') return false
  const fb = String(targetFbId || '').trim()
  if (fb) {
    if (
      String(item.licenseFirebaseId || '').trim() === fb ||
      String(item.firebase_id || '').trim() === fb ||
      String(item.firebaseId || '').trim() === fb ||
      String(item.id || '').trim() === fb
    ) {
      return true
    }
  }
  if (normLicId) {
    const rawCatalogId = String(item.licenseFirebaseId || item.firebase_id || item.firebaseId || '').trim()
    const rawId = String(item.id || '').trim()
    const hasCatalogId = Boolean(rawCatalogId || (rawId && !/^lic_\d+$/i.test(rawId)))
    const itemLicId = String(item.LICENSE_ID || item.SERIAL_KEY || '').trim()
    if (!hasCatalogId && itemLicId && itemLicId === normLicId) {
      return true
    }
  }
  return false
}

export async function removeLicenseFromSaleReportPO(database, licenseFirebaseId, poFirebaseKey, licenseIdStr = '') {
  if (!database || (!licenseFirebaseId && !licenseIdStr) || !poFirebaseKey) return false
  try {
    const poLicRef = dbRef(database, `sale_report/${poFirebaseKey}/danh_sach_license`)
    const snap = await get(poLicRef)
    if (!snap.exists()) return false
    const raw = snap.val()
    const list = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.values(raw) : [])
    const normLicId = String(licenseIdStr || '').trim()
    const filtered = list.filter(item => item && !isPoLicenseEntryMatchingTarget(item, licenseFirebaseId, normLicId))
    if (filtered.length !== list.length) {
      await set(poLicRef, filtered)
      return true
    }
    return false
  } catch (err) {
    console.error('removeLicenseFromSaleReportPO error:', err)
    return false
  }
}

export async function unlinkDeletedLicenseFromSaleReport(database, licenseFirebaseId, options = {}) {
  if (!database || !licenseFirebaseId) return []
  const { poKeys = [], soPos = [], officialPos = [], licenseId = '' } = options || {}
  const targetFbId = String(licenseFirebaseId).trim()
  const normLicId = String(licenseId || '').trim()
  const targetPoKeySet = new Set()

  if (Array.isArray(poKeys)) {
    poKeys.forEach(k => {
      const clean = String(k || '').trim()
      if (clean) targetPoKeySet.add(clean)
    })
  }

  const cleanSoPoSet = new Set(
    (Array.isArray(soPos) ? soPos : [])
      .map(s => String(s || '').trim())
      .filter(Boolean)
  )

  if (Array.isArray(officialPos) && officialPos.length > 0) {
    officialPos.forEach(po => {
      if (!po || !po.firebaseKey) return
      const poSo = String(po.soPO || '').trim()
      if (poSo && cleanSoPoSet.has(poSo)) {
        targetPoKeySet.add(String(po.firebaseKey).trim())
      }
      if (Array.isArray(po.danhSachLicense)) {
        const hasMatch = po.danhSachLicense.some(entry =>
          isPoLicenseEntryMatchingTarget(entry, targetFbId, normLicId)
        )
        if (hasMatch) {
          targetPoKeySet.add(String(po.firebaseKey).trim())
        }
      }
    })
  }

  const keysToProcess = Array.from(targetPoKeySet)
  if (keysToProcess.length === 0) return []

  const unlinkedPoKeys = []
  await Promise.all(
    keysToProcess.map(async poKey => {
      const removed = await removeLicenseFromSaleReportPO(database, targetFbId, poKey, normLicId)
      if (removed) {
        unlinkedPoKeys.push(poKey)
      }
      if (Array.isArray(officialPos)) {
        const memPo = officialPos.find(p => String(p?.firebaseKey || '').trim() === poKey)
        if (memPo && Array.isArray(memPo.danhSachLicense)) {
          memPo.danhSachLicense = memPo.danhSachLicense.filter(
            entry => entry && !isPoLicenseEntryMatchingTarget(entry, targetFbId, normLicId)
          )
        }
      }
    })
  )

  return unlinkedPoKeys
}

export async function syncLicenseToSaleReportPO(database, licenseFirebaseId, licenseData = {}, oldPoFirebaseKey = '') {
  if (!database || !licenseFirebaseId) return
  const newPoKey = String(licenseData.PO_FIREBASE_KEY || '').trim()
  const prevPoKey = String(oldPoFirebaseKey || '').trim()

  if (prevPoKey && prevPoKey !== newPoKey) {
    await removeLicenseFromSaleReportPO(database, licenseFirebaseId, prevPoKey, licenseData.LICENSE_ID || '')
  }

  if (!newPoKey) return

  try {
    const poRef = dbRef(database, `sale_report/${newPoKey}`)
    const poSnap = await get(poRef)
    if (!poSnap.exists()) return

    const poVal = poSnap.val() || {}
    const rawList = poVal.danh_sach_license
    const currentList = Array.isArray(rawList)
      ? [...rawList]
      : (rawList && typeof rawList === 'object' ? Object.values(rawList) : [])

    const summary = buildLicenseSummaryForPO(licenseFirebaseId, {
      ...licenseData,
      SO_PO: licenseData.SO_PO || poVal.So_PO || poVal.so_po || '',
      MA_KHACH_HANG: licenseData.MA_KHACH_HANG || poVal.Ma_khach_hang || poVal.ma_khach_hang || '',
      TEN_CONG_TY: licenseData.TEN_CONG_TY || poVal.Ten_cong_ty || poVal.customer || ''
    })

    const existingIdx = currentList.findIndex(item =>
      isPoLicenseEntryMatchingTarget(item, licenseFirebaseId, summary.LICENSE_ID)
    )

    if (existingIdx >= 0) {
      currentList[existingIdx] = { ...currentList[existingIdx], ...summary }
    } else {
      currentList.push(summary)
    }

    await update(poRef, { danh_sach_license: currentList })
  } catch (err) {
    console.error('syncLicenseToSaleReportPO error:', err)
  }
}

export async function uploadLicenseFileToCloudinary(file) {
  if (!file) return ''
  const cloudName = 'db6fzs3rh'
  const uploadPreset = 'upload_file'
  const formDataUpload = new FormData()
  formDataUpload.append('file', file)
  formDataUpload.append('upload_preset', uploadPreset)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formDataUpload
    })
    const data = await res.json()
    return data.secure_url || ''
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    return ''
  }
}

export function formatLicenseDateStr(dateStr) {
  if (dateStr === null || dateStr === undefined || dateStr === '') return ''
  const raw = String(dateStr).trim()
  if (!raw) return ''

  // 1. Excel serial number (e.g. 45778)
  if (/^\d{5}(\.\d+)?$/.test(raw) && Number(raw) > 10000 && Number(raw) < 100000) {
    const days = Math.floor(Number(raw) - 25569)
    const excelDate = new Date(days * 86400 * 1000)
    if (!isNaN(excelDate.getTime())) {
      const dd = String(excelDate.getDate()).padStart(2, '0')
      const mm = String(excelDate.getMonth() + 1).padStart(2, '0')
      return `${dd}/${mm}/${excelDate.getFullYear()}`
    }
  }

  // 2. ISO datetime string (e.g. 2025-05-01T17:00:00.000Z)
  if (raw.includes('T') && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    const isoDate = new Date(raw)
    if (!isNaN(isoDate.getTime())) {
      const dd = String(isoDate.getDate()).padStart(2, '0')
      const mm = String(isoDate.getMonth() + 1).padStart(2, '0')
      return `${dd}/${mm}/${isoDate.getFullYear()}`
    }
  }

  // 3. Pure date with - / . separators (YYYY-MM-DD or DD/MM/YYYY)
  const cleanDatePart = raw.split(/\s+/)[0]
  const parts = cleanDatePart.split(/[-/.]/)
  if (parts.length === 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && /^\d{4}$/.test(parts[2])) {
    const p1 = parseInt(parts[0], 10)
    const p2 = parseInt(parts[1], 10)
    const y = parts[2]
    let d, m
    if (p1 > 12) {
      d = p1
      m = p2
    } else if (p2 > 12) {
      d = p2
      m = p1
    } else {
      d = p1
      m = p2
    }
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
  }
  if (parts.length === 3 && /^\d{4}$/.test(parts[0]) && /^\d+$/.test(parts[1]) && /^\d+$/.test(parts[2])) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`
  }

  const parsedDate = new Date(raw)
  if (!isNaN(parsedDate.getTime())) {
    const d = String(parsedDate.getDate()).padStart(2, '0')
    const m = String(parsedDate.getMonth() + 1).padStart(2, '0')
    const y = parsedDate.getFullYear()
    return `${d}/${m}/${y}`
  }
  return raw
}

export function licenseDateToYmd(dateStr) {
  const dmy = formatLicenseDateStr(dateStr)
  if (!dmy) return ''
  const m = String(dmy).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return ''
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
}

export function ymdToLicenseDate(ymdStr) {
  const raw = String(ymdStr || '').trim()
  if (!raw) return ''
  const m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (m) {
    return `${m[3].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[1]}`
  }
  return formatLicenseDateStr(raw)
}

export function parseLicenseDateObj(dateStr) {
  const dmy = formatLicenseDateStr(dateStr)
  if (!dmy) return null
  const m = String(dmy).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  if (isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
}

export function diffDaysBetweenLicenseDates(startDateStr, endDateStr) {
  const dStart = parseLicenseDateObj(startDateStr)
  const dEnd = parseLicenseDateObj(endDateStr)
  if (!dStart || !dEnd) return null
  return Math.round((dEnd.getTime() - dStart.getTime()) / (1000 * 3600 * 24))
}

export function addDaysToLicenseDate(dateStr, days = 30) {
  if (!dateStr) return ''
  const d = parseLicenseDateObj(dateStr)
  if (!d) return ''
  const numDays =
    days === '' || days === null || days === undefined || isNaN(Number(days))
      ? 30
      : Number(days)
  d.setDate(d.getDate() + numDays)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

export function createEmptyLicenseRecord(fileName = '') {
  return {
    LICENSE_ID: '',
    CUSTOMER: '',
    MA_KHACH_HANG: '',
    TEN_CONG_TY: '',
    SO_PO: '',
    PO_FIREBASE_KEY: '',
    PRODUCT_NAME: '',
    LOCALIZATION: '',
    LICENSE_VOLUME: '',
    LICENSE_DESCRIPTION: '',
    DATE_OF_LICENSE: '',
    EXPIRATION_TIME: '',
    LICENSE_TYPE: '',
    PRODUCT_CODE: '',
    SO_NGAY_HIEU_LUC: '',
    NHA_SAN_XUAT: '',
    NAME_FILE: fileName,
    LINK_FILE: ''
  }
}

export function parseLicenseTextRuleBased(text, fileName = '', lineText = '') {
  const rawStr = String(text || '')
  const lineStr = String(lineText || text || '')
  const lowerText = rawStr.toLowerCase()
  const tempForms = []

  // 1. Kaspersky Format (PDF inline regex + OCR line-by-line fallback)
  if ((lowerText.includes('kaspersky') && lowerText.includes('license id')) || lowerText.includes('license id:') || lowerText.includes('date of license')) {
    const formData = createEmptyLicenseRecord(fileName)
    formData.NHA_SAN_XUAT = 'Kaspersky'

    const customerMatch = rawStr.match(/Customer:\s*(.*?)(?=\s+Product Name)/is)
    if (customerMatch) formData.CUSTOMER = customerMatch[1].replace(/[\n\r]+/g, ' ').trim()

    const productMatch = rawStr.match(/Product Name\s*(.*?)(?=\s+Localization)/is)
    if (productMatch) formData.PRODUCT_NAME = productMatch[1].replace(/[\n\r]+/g, ' ').trim()

    const locMatch = rawStr.match(/Localization\s*(.*?)(?=\s+License Description)/is)
    if (locMatch) formData.LOCALIZATION = locMatch[1].trim()

    const volMatch = rawStr.match(/License Description\s*(.*?)(?=\s+Date of License)/is)
    if (volMatch) formData.LICENSE_VOLUME = volMatch[1].trim()

    const dateMatch = rawStr.match(/Date of License\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|[\d-/.]+)/is)
    if (dateMatch) formData.DATE_OF_LICENSE = formatLicenseDateStr(dateMatch[1])

    const expMatch = rawStr.match(/Expiration Time\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|[\d-/.]+)/is)
    if (expMatch) {
      formData.EXPIRATION_TIME = formatLicenseDateStr(expMatch[1])
    }

    const typeMatch = rawStr.match(/License Type\s*(.*?)(?=\s+Product Code)/is)
    if (typeMatch) formData.LICENSE_TYPE = typeMatch[1].trim()

    const codeMatch = rawStr.match(/Product Code\s*:?\s*([A-Z0-9\-]+)/i)
    if (codeMatch) formData.PRODUCT_CODE = codeMatch[1].trim()

    const idMatch = rawStr.match(/License ID:\s*([A-Z0-9\-]+)/i)
    if (idMatch) formData.LICENSE_ID = idMatch[1].trim()

    // Fallback line-by-line (giống 100% ImportLicenseFirebaseModal.vue cho OCR Ảnh & các dòng rời)
    const lines = lineStr.split('\n').map(l => l.trim()).filter(Boolean)
    let currentField = ''
    const customerText = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lower = line.toLowerCase()

      if (lower.startsWith('license id:')) {
        if (!formData.LICENSE_ID) formData.LICENSE_ID = line.replace(/license id:/i, '').trim()
        currentField = 'LICENSE_ID'
      } else if (lower.startsWith('customer:')) {
        customerText.push(line.replace(/customer:/i, '').trim())
        currentField = 'CUSTOMER'
      } else if (lower.startsWith('product name')) {
        if (!formData.PRODUCT_NAME) formData.PRODUCT_NAME = line.replace(/product name/i, '').trim()
        currentField = 'PRODUCT_NAME'
      } else if (lower.startsWith('localization')) {
        if (!formData.LOCALIZATION) formData.LOCALIZATION = line.replace(/localization/i, '').trim()
        currentField = 'LOCALIZATION'
      } else if (lower.startsWith('license description')) {
        if (!formData.LICENSE_VOLUME) formData.LICENSE_VOLUME = line.replace(/license description/i, '').trim()
        currentField = 'LICENSE_VOLUME'
      } else if (lower.startsWith('date of license')) {
        if (!formData.DATE_OF_LICENSE) {
          formData.DATE_OF_LICENSE = formatLicenseDateStr(line.replace(/date of license/i, '').replace(':', '').trim())
        }
        currentField = 'DATE_OF_LICENSE'
      } else if (lower.startsWith('expiration time')) {
        if (!formData.EXPIRATION_TIME) {
          formData.EXPIRATION_TIME = formatLicenseDateStr(line.replace(/expiration time/i, '').replace(':', '').trim())
        }
        currentField = 'EXPIRATION_TIME'
      } else if (lower.startsWith('license type')) {
        if (!formData.LICENSE_TYPE) formData.LICENSE_TYPE = line.replace(/license type/i, '').trim()
        currentField = 'LICENSE_TYPE'
      } else if (lower.startsWith('product code')) {
        if (!formData.PRODUCT_CODE) formData.PRODUCT_CODE = line.replace(/product code/i, '').trim()
        currentField = 'PRODUCT_CODE'
      } else if (currentField === 'CUSTOMER') {
        customerText.push(line)
      }
    }
    if (!formData.CUSTOMER && customerText.length > 0) {
      formData.CUSTOMER = customerText.join(' ').trim()
    }

    if (formData.EXPIRATION_TIME && !formData.SO_NGAY_HIEU_LUC) {
      formData.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(formData.EXPIRATION_TIME, 30)
    }

    if (formData.LICENSE_ID || formData.PRODUCT_NAME || formData.CUSTOMER) {
      tempForms.push(formData)
    }
  }
  // 2. Sophos Format (PDF multi-product + single product + Image OCR fallback)
  else if (lowerText.includes('sophos')) {
    let customerStr = ''
    const customerMatch = rawStr.match(/Customer Address\s*Reseller\s*(.*?)(?=Nam Truong Son|Please keep this|Distributor)/is)
    if (customerMatch) customerStr = customerMatch[1].replace(/[\n\r]+/g, ' ').trim()

    let typeStr = ''
    const typeMatch = rawStr.match(/Enhanced Support/i)
    if (typeMatch) typeStr = 'Enhanced Support'

    const productRegex = /(?:\d+\s+)?([a-zA-Z0-9\s\-]+?)\s*\(SKU:\s*([A-Z0-9]+)[^\)]*\)\s*([A-Z0-9]+)\s+(\d+)\s+[a-zA-Z]+\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})/g
    let match
    let found = false

    while ((match = productRegex.exec(rawStr)) !== null) {
      found = true
      const formData = createEmptyLicenseRecord(fileName)
      formData.NHA_SAN_XUAT = 'Sophos'
      formData.CUSTOMER = customerStr
      formData.LICENSE_TYPE = typeStr
      formData.PRODUCT_NAME = match[1].replace(/[\n\r]+/g, ' ').trim()
      formData.PRODUCT_CODE = match[2].trim()
      formData.LICENSE_ID = match[3].trim()
      formData.LICENSE_VOLUME = match[4].trim()
      formData.DATE_OF_LICENSE = match[5].trim()
      formData.EXPIRATION_TIME = match[6].trim()
      formData.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(formData.EXPIRATION_TIME, 30)
      tempForms.push(formData)
    }

    if (!found) {
      const formData = createEmptyLicenseRecord(fileName)
      formData.NHA_SAN_XUAT = 'Sophos'
      formData.CUSTOMER = customerStr
      formData.LICENSE_TYPE = typeStr
      const prodMatch = rawStr.match(/Term \(Months\)\s+(.*?)\s+\(SKU:/i)
      if (prodMatch) formData.PRODUCT_NAME = prodMatch[1].replace(/[\n\r]+/g, ' ').trim()
      const skuMatch = rawStr.match(/\(SKU:\s*([A-Z0-9]+)/i)
      if (skuMatch) formData.PRODUCT_CODE = skuMatch[1].trim()
      const licNumMatch = rawStr.match(/(LN\d+)/i) || rawStr.match(/\b\d[A-Z]\d{8,}\b/i)
      if (licNumMatch) formData.LICENSE_ID = (licNumMatch[1] || licNumMatch[0]).trim()

      const datesMatch = rawStr.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})/)
      if (datesMatch) {
        formData.DATE_OF_LICENSE = datesMatch[1]
        formData.EXPIRATION_TIME = datesMatch[2]
      } else {
        const dateList = rawStr.match(/\d{2}\/\d{2}\/\d{4}/g)
        if (dateList && dateList.length >= 2) {
          formData.DATE_OF_LICENSE = formatLicenseDateStr(dateList[0])
          formData.EXPIRATION_TIME = formatLicenseDateStr(dateList[1])
        } else if (dateList && dateList.length === 1) {
          formData.EXPIRATION_TIME = formatLicenseDateStr(dateList[0])
        }
      }

      if (formData.EXPIRATION_TIME) {
        formData.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(formData.EXPIRATION_TIME, 30)
      }

      const volMatch = rawStr.match(/LN\d+\s+(\d+)\s+USERS/i) || rawStr.match(/(\d+)\s*USERS?/i)
      if (volMatch) formData.LICENSE_VOLUME = (volMatch[1] || volMatch[0]).trim()
      if (formData.LICENSE_ID || formData.PRODUCT_CODE || formData.EXPIRATION_TIME || formData.CUSTOMER || formData.LICENSE_VOLUME) {
        if (!formData.PRODUCT_NAME) formData.PRODUCT_NAME = 'Sophos'
        tempForms.push(formData)
      }
    }
  }
  // 3. Acronis Format
  else if (lowerText.includes('acronis')) {
    const formData = createEmptyLicenseRecord(fileName)
    formData.NHA_SAN_XUAT = 'Acronis'
    const customerMatch = rawStr.match(/Licensee\s*(.*?)(?=No\.|VIETNAM)/is)
    if (customerMatch) formData.CUSTOMER = customerMatch[1].replace(/[\n\r]+/g, ' ').trim()

    const quantityMatch = rawStr.match(/Quantity\s+(\d+)/i)
    if (quantityMatch) formData.LICENSE_VOLUME = quantityMatch[1].trim()

    const typeMatch = rawStr.match(/License\s+Type\s*(.*?)(?=\s*valid\s+from)/is)
    if (typeMatch) formData.LICENSE_TYPE = typeMatch[1].replace(/[\n\r]+/g, ' ').trim()

    const dateMatch = rawStr.match(/valid\s+from\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})\s+to\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/is)
    if (dateMatch) {
      formData.DATE_OF_LICENSE = formatLicenseDateStr(dateMatch[1])
      formData.EXPIRATION_TIME = formatLicenseDateStr(dateMatch[2])
      formData.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(formData.EXPIRATION_TIME, 30)
    }

    const productMatch =
      rawStr.match(/License\s*Product\s*([A-Za-z\s,]+(?:1 Year|2 Years|3 Years|Subscription License)[\w\s,]*?)\s*License\s*Key/is) ||
      rawStr.match(/License\s*Product\s*(.*?)\s*License\s*Key/is)
    if (productMatch) formData.PRODUCT_NAME = productMatch[1].replace(/[\n\r]+/g, ' ').trim()

    const skuMatch = rawStr.match(/SKU\s+([A-Z0-9]+)/i)
    if (skuMatch) formData.PRODUCT_CODE = skuMatch[1].trim()

    const certMatch = rawStr.match(/CERTSG-\d+/i) || rawStr.match(/License\s*Certificate\s*([A-Z0-9\-]+)/i)
    if (certMatch) formData.LICENSE_ID = certMatch[1] || certMatch[0]

    const keyMatch = rawStr.match(/License\s*Key\s+([A-Z0-9\-]{20,})/i)
    if (keyMatch) formData.LICENSE_DESCRIPTION = 'Key: ' + keyMatch[1]

    if (formData.LICENSE_ID || formData.PRODUCT_NAME || formData.CUSTOMER || formData.EXPIRATION_TIME) {
      tempForms.push(formData)
    }
  }
  // 4. Delinea Format
  else if (lowerText.includes('delinea') || lowerText.includes('secret server')) {
    const certIdMatch = rawStr.match(/License Certificate Id\s+([A-Z0-9\-]+)/i)
    const certId = certIdMatch ? certIdMatch[1].trim() : ''

    let customerStr = ''
    const customerMatch = rawStr.match(/End User\s+(.*?)(?=Contact Name)/is)
    if (customerMatch) {
      customerStr = customerMatch[1].replace(/[\n\r]+/g, ' ').trim()
    }

    const regex = /(?:Entitlements\s+|License End Date:\s*[\d\-]+\s+)?([a-zA-Z0-9\s\-\/\.]+?)\s*License Name:\s*(.*?)\s*License Key:\s*([A-Z0-9\-]+)\s*License Quantity:\s*(\d+)\s*License Start Date:\s*([\d\-]+)\s*License End Date:\s*([\d\-]+)/g
    let match

    while ((match = regex.exec(rawStr)) !== null) {
      const formData = createEmptyLicenseRecord(fileName)
      formData.CUSTOMER = customerStr
      formData.NHA_SAN_XUAT = 'Delinea'
      formData.LICENSE_ID = certId
      let productName = match[1].replace(/[\n\r]+/g, ' ').trim()
      if (productName.startsWith('Entitlements')) {
        productName = productName.substring(12).trim()
      }
      formData.PRODUCT_NAME = productName
      formData.LICENSE_DESCRIPTION = 'Key: ' + match[3].trim()
      formData.LICENSE_VOLUME = match[4].trim()
      formData.DATE_OF_LICENSE = formatLicenseDateStr(match[5].trim())
      formData.EXPIRATION_TIME = formatLicenseDateStr(match[6].trim())
      formData.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(formData.EXPIRATION_TIME, 30)
      tempForms.push(formData)
    }
  }

  // Deduplicate LICENSE_ID within same file (giống 100% ImportPDFFirebaseModal.vue)
  const idGroups = {}
  tempForms.forEach(f => {
    const id = f.LICENSE_ID
    if (id) {
      if (!idGroups[id]) idGroups[id] = []
      idGroups[id].push(f)
    }
  })
  Object.keys(idGroups).forEach(id => {
    const group = idGroups[id]
    if (group.length > 1) {
      group.forEach((f, idx) => {
        f.LICENSE_ID = `${id}-${idx + 1}`
      })
    }
  })

  return tempForms
}

const SMART_LICENSE_SYSTEM_PROMPT = `Bạn là chuyên gia phân tích chứng nhận giấy phép bản quyền phần mềm (Software License Certificate / Subscription Entitlement).
Hãy đọc kỹ toàn bộ nội dung/hình ảnh chứng từ và trả về DUY NHẤT 1 JSON object hợp lệ (không Markdown, không giải thích thêm):
{
  "LICENSE_ID": "",
  "CUSTOMER": "",
  "PRODUCT_NAME": "",
  "LOCALIZATION": "",
  "LICENSE_VOLUME": "",
  "DATE_OF_LICENSE": "",
  "EXPIRATION_TIME": "",
  "LICENSE_TYPE": "",
  "PRODUCT_CODE": "",
  "NHA_SAN_XUAT": "",
  "LICENSE_DESCRIPTION": ""
}

QUY TẮC BÓC TÁCH CHÍNH XÁC:
1. LICENSE_ID: Mã định danh bản quyền chính (License ID / License Number / Certificate No / Activation Code / Serial Number / Serial Key / Subscription ID / Contract or Entitlement ID). Giữ nguyên chính xác từng ký tự chữ, số, dấu gạch ngang (phân biệt rõ 0 và O, 1 và I, 5 và S). Không kèm nhãn tiền tố.
2. CUSTOMER: Tên Công ty / Tổ chức KHÁCH HÀNG CUỐI sử dụng bản quyền (End User / Customer / Licensee / Issued To / Registered To / Account Name). TUYỆT ĐỐI KHÔNG lấy nhầm tên Nhà phân phối / Đại lý bán hàng (Distributor / Reseller / Partner / Sold By như Tech Data, Ingram Micro, Synnex FPT, QD.TEK, Pacisoft, Mi2, NTC...).
3. PRODUCT_NAME: Tên đầy đủ của phần mềm / gói bản quyền / gói gia hạn.
4. PRODUCT_CODE: Mã SKU / Part Number / Product Code / Item Code của hãng (VD: KL4867XARFS, CPAT-0100-0120...). Không nhầm với LICENSE_ID.
5. LICENSE_VOLUME: Số lượng bản quyền (VD: "50", "25 Users", "100 Nodes", "1 Server"...).
6. DATE_OF_LICENSE: Ngày cấp / Ngày bắt đầu hiệu lực (Start Date / Issue Date / Effective Date / Valid From), bắt buộc chuẩn hóa về định dạng DD/MM/YYYY.
7. EXPIRATION_TIME: Ngày hết hạn bản quyền (Expiration Date / End Date / Valid Until / Expiry Date / Subscription End), bắt buộc chuẩn hóa về định dạng DD/MM/YYYY. Chú ý đổi đúng tháng tiếng Anh (Jan..Dec) hoặc chuẩn quốc tế sang DD/MM/YYYY, không đảo nhầm ngày và tháng.
8. LICENSE_TYPE: Loại giấy phép (VD: Base, New, Renewal, Upgrade, Commercial, Subscription, Perpetual, Maintenance...).
9. LOCALIZATION: Ngôn ngữ hoặc khu vực áp dụng (VD: Global, All Languages, Vietnamese, English, APAC...).
10. NHA_SAN_XUAT: Tên chuẩn ngắn gọn của hãng phần mềm (VD: Kaspersky, Sophos, Acronis, Delinea, Fortinet, Microsoft, Bitdefender, Veeam, VMware, Symantec, Trend Micro, Palo Alto, Cisco, Check Point, CrowdStrike, Adobe, Autodesk...). Nếu không ghi nhãn riêng, hãy suy ra từ logo/tiêu đề chứng nhận hoặc tên sản phẩm.
11. LICENSE_DESCRIPTION: Ghi chú hoặc thời hạn gói ngắn gọn nếu có (VD: "1 Year Subscription"); nếu không có để "".
12. Trường nào thực sự không có thông tin trên chứng từ thì trả về chuỗi rỗng "".`

function cleanAiFieldString(val) {
  if (val === null || val === undefined) return ''
  const s = String(val).replace(/\s+/g, ' ').trim()
  if (!s || /^(null|undefined|n\/a|none|unknown|-|—)$/i.test(s)) return ''
  return s
}

function normalizeVendorBrandName(rawVendor, productName = '') {
  const cleaned = cleanAiFieldString(rawVendor)
  const checkStr = `${cleaned} ${productName || ''}`.toLowerCase()
  const knownBrands = [
    { match: /\bkaspersky\b/i, name: 'Kaspersky' },
    { match: /\bsophos\b/i, name: 'Sophos' },
    { match: /\bacronis\b/i, name: 'Acronis' },
    { match: /\b(delinea|thycotic|secret\s*server)\b/i, name: 'Delinea' },
    { match: /\b(fortinet|fortigate|forticare|fortiguard)\b/i, name: 'Fortinet' },
    { match: /\b(microsoft|office\s*365|microsoft\s*365|azure)\b/i, name: 'Microsoft' },
    { match: /\bbitdefender\b/i, name: 'Bitdefender' },
    { match: /\bveeam\b/i, name: 'Veeam' },
    { match: /\bvmware\b/i, name: 'VMware' },
    { match: /\b(symantec|broadcom)\b/i, name: 'Symantec' },
    { match: /\btrend\s*micro\b/i, name: 'Trend Micro' },
    { match: /\bpalo\s*alto\b/i, name: 'Palo Alto' },
    { match: /\bcisco\b/i, name: 'Cisco' },
    { match: /\bcheck\s*point\b/i, name: 'Check Point' },
    { match: /\bcrowdstrike\b/i, name: 'CrowdStrike' },
    { match: /\badobe\b/i, name: 'Adobe' },
    { match: /\bautodesk\b/i, name: 'Autodesk' }
  ]
  for (const b of knownBrands) {
    if (cleaned && b.match.test(cleaned)) return b.name
  }
  if (!cleaned) {
    for (const b of knownBrands) {
      if (b.match.test(checkStr)) return b.name
    }
  }
  return cleaned
}

function normalizeAiLicenseParsedData(parsedInput, fileName = '') {
  if (!parsedInput || typeof parsedInput !== 'object') return []
  let target = parsedInput
  if (Array.isArray(parsedInput)) {
    target = parsedInput[0]
  } else if (Array.isArray(parsedInput.records) && parsedInput.records.length > 0) {
    target = parsedInput.records[0]
  } else if (Array.isArray(parsedInput.licenses) && parsedInput.licenses.length > 0) {
    target = parsedInput.licenses[0]
  } else if (Array.isArray(parsedInput.items) && parsedInput.items.length > 0) {
    target = parsedInput.items[0]
  }
  if (!target || typeof target !== 'object') return []

  const form = createEmptyLicenseRecord(fileName)
  Object.keys(form).forEach(k => {
    if (target[k] !== undefined && k !== 'LINK_FILE' && k !== 'NAME_FILE') {
      form[k] = cleanAiFieldString(target[k])
    }
  })

  // Strip accidental label prefixes in LICENSE_ID
  if (form.LICENSE_ID) {
    form.LICENSE_ID = form.LICENSE_ID
      .replace(/^(license\s*(id|no|number|key)?|serial\s*(no|number|key)?|activation\s*code)\s*[:#\-]\s*/i, '')
      .trim()
  }

  if (form.DATE_OF_LICENSE) {
    form.DATE_OF_LICENSE = formatLicenseDateStr(form.DATE_OF_LICENSE)
  }
  if (form.EXPIRATION_TIME) {
    form.EXPIRATION_TIME = formatLicenseDateStr(form.EXPIRATION_TIME)
  }
  form.NHA_SAN_XUAT = normalizeVendorBrandName(form.NHA_SAN_XUAT, form.PRODUCT_NAME)

  if (form.EXPIRATION_TIME && !form.SO_NGAY_HIEU_LUC) {
    form.SO_NGAY_HIEU_LUC = addDaysToLicenseDate(form.EXPIRATION_TIME, 30)
  }

  const hasMeaningfulData = Boolean(
    form.LICENSE_ID ||
    form.PRODUCT_NAME ||
    form.CUSTOMER ||
    form.PRODUCT_CODE ||
    form.EXPIRATION_TIME
  )
  return hasMeaningfulData ? [form] : []
}

export async function parseLicenseTextWithAI(rawText, fileName = '') {
  if (!rawText || !String(rawText).trim()) return []
  const messages = [
    { role: 'system', content: SMART_LICENSE_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Chứng từ License "${fileName || 'License'}":\n"""\n${String(rawText).slice(0, 22000)}\n"""`
    }
  ]

  try {
    const result = await callDeepSeek(messages, false, false)
    let jsonContent = ''
    if (result.choices && result.choices.length > 0) {
      jsonContent = result.choices[0]?.message?.content || result.choices[0]?.text || ''
    } else if (result.output && Array.isArray(result.output)) {
      const messageObj = result.output.find(item => item.type === 'message')
      const textObj = messageObj?.content?.find(c => c.type === 'output_text')
      jsonContent = textObj ? textObj.text : ''
    }
    jsonContent = jsonContent.replace(/```json/gi, '').replace(/```/g, '').trim()
    const firstBrace = jsonContent.indexOf('{')
    const lastBrace = jsonContent.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonContent = jsonContent.slice(firstBrace, lastBrace + 1)
    }
    const parsedData = JSON.parse(jsonContent)
    return normalizeAiLicenseParsedData(parsedData, fileName)
  } catch (err) {
    console.error('parseLicenseTextWithAI error:', err)
    return []
  }
}

/**
 * Quét thông minh chứng từ License bằng AI đa phương thức (Dùng chung cho cả Trang License & SaleReport):
 * - Ưu tiên callSmartDocumentAI (Vision AI đọc trực tiếp Ảnh / PDF scan, hoặc DeepSeek đọc cấu trúc PDF có lớp text) để không bị sai ký tự do OCR cục bộ.
 * - Tự động fallback sang parseLicenseTextWithAI(fallbackRawText) nếu không truyền File hoặc khi tầng 1 gặp sự cố.
 */
export async function extractSmartLicenseWithAI(file, fallbackRawText = '', fileName = '', onProgress) {
  const effectiveName = fileName || file?.name || 'License'

  if (file) {
    try {
      const smartRes = await callSmartDocumentAI(
        file,
        SMART_LICENSE_SYSTEM_PROMPT,
        'Hãy bóc tách chuẩn xác thông số giấy phép bản quyền phần mềm (License Certificate)',
        onProgress,
        4
      )
      const records = normalizeAiLicenseParsedData(smartRes?.parsed ?? smartRes, effectiveName)
      if (records.length > 0) {
        return records
      }
    } catch (smartErr) {
      console.warn('extractSmartLicenseWithAI: callSmartDocumentAI lỗi, chuyển sang fallback text AI:', smartErr)
    }
  }

  if (fallbackRawText && String(fallbackRawText).trim()) {
    onProgress?.('AI đang phân tích văn bản trích xuất từ chứng từ...')
    return await parseLicenseTextWithAI(fallbackRawText, effectiveName)
  }

  return []
}

export async function extractLicenseRecordsFromFile(file, useAiFallback = false) {
  if (!file) return []
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')
  let rawText = ''
  let lineText = ''

  if (isPdf) {
    const arrayBuffer = await file.arrayBuffer()
    const getDocFn = pdfjsLib?.getDocument || pdfjsLib?.default?.getDocument
    const pdf = await getDocFn({ data: new Uint8Array(arrayBuffer) }).promise
    let fullText = ''
    let fullLineText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const items = textContent.items || []
      const pageText = items.map(it => it.str).join(' ')
      const pageLines = items.map(it => `${it.str || ''}${it.hasEOL ? '\n' : ' '}`).join('')
      fullText += pageText + ' \n'
      fullLineText += pageLines + '\n'
    }
    rawText = fullText
    lineText = fullLineText

    // Nếu PDF là bản scan ảnh (không có text layer), tự động render trang sang canvas và OCR bằng Tesseract
    if (rawText.replace(/\s+/g, '').length < 20 && typeof document !== 'undefined') {
      let ocrText = ''
      const maxOcrPages = Math.min(pdf.numPages, 3)
      for (let i = 1; i <= maxOcrPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          await page.render({ canvasContext: ctx, viewport }).promise
          const res = await Tesseract.recognize(canvas, 'eng+vie')
          if (res?.data?.text) {
            ocrText += res.data.text + '\n'
          }
        }
      }
      if (ocrText.trim()) {
        rawText = ocrText
        lineText = ocrText
      }
    }
  } else {
    const res = await Tesseract.recognize(file, 'eng+vie')
    rawText = res?.data?.text || ''
    lineText = rawText
  }

  let records = parseLicenseTextRuleBased(rawText, file.name, lineText)
  if (records.length === 0 && useAiFallback) {
    records = await extractSmartLicenseWithAI(file, lineText || rawText, file.name)
  }
  if (records.length === 0) {
    const empty = createEmptyLicenseRecord(file.name)
    empty._formatError = true
    empty._rawText = lineText || rawText
    records = [empty]
  } else {
    records.forEach(r => {
      r._rawText = lineText || rawText
      r._formatError = false
    })
  }
  return records
}

// ============================================================================
// KIỂM TRA TRÙNG LICENSE_ID / SERIAL KEY & HỖ TRỢ CẬP NHẬT GIA HẠN (PHƯƠNG ÁN 2)
// ============================================================================
export function normalizeLicenseIdKey(val) {
  const raw = String(val || '').trim().replace(/\s+/g, '').toUpperCase()
  if (!raw || raw === '—' || raw === '-' || raw === 'N/A' || raw === 'NONE' || raw === 'NULL') {
    return ''
  }
  return raw
}

export async function loadExistingLicensesCatalog(database) {
  if (!database) return []
  try {
    const snap = await get(dbRef(database, 'license_old_data'))
    if (!snap.exists()) return []
    const raw = snap.val() || {}
    const list = []
    Object.entries(raw).forEach(([fbKey, rec]) => {
      if (!rec || typeof rec !== 'object') return
      const licId = String(rec.LICENSE_ID || rec.SERIAL_KEY || '').trim()
      const prodCode = String(rec.PRODUCT_CODE || '').trim()
      const prodName = String(rec.PRODUCT_NAME || rec.PRODUCT || '').trim()
      const expDate = formatLicenseDateStr(rec.EXPIRATION_TIME || rec.END_DATE || '')
      const issueDate = formatLicenseDateStr(rec.DATE_OF_LICENSE || rec.START_DATE || '')
      list.push({
        ...rec,
        firebaseKey: fbKey,
        LICENSE_ID: licId,
        PRODUCT_CODE: prodCode,
        PRODUCT_NAME: prodName,
        DATE_OF_LICENSE: issueDate,
        EXPIRATION_TIME: expDate,
        _normLicId: normalizeLicenseIdKey(licId),
        _normProdCode: prodCode.toUpperCase(),
        _normExpDate: expDate
      })
    })
    return list
  } catch (err) {
    console.error('loadExistingLicensesCatalog error:', err)
    return []
  }
}

export function inspectLicenseDuplicate(candidate, existingCatalog = [], options = {}) {
  const excludeFirebaseKey = String(options.excludeFirebaseKey || '').trim()
  const rawId = String(candidate?.LICENSE_ID || candidate?.SERIAL_KEY || '').trim()
  const normId = normalizeLicenseIdKey(rawId)
  if (!normId || !Array.isArray(existingCatalog) || existingCatalog.length === 0) {
    return {
      isDuplicate: false,
      status: 'ok',
      matchedRecord: null,
      allMatches: [],
      message: ''
    }
  }

  const matches = existingCatalog.filter(r => {
    if (!r) return false
    const rKey = String(r.firebaseKey || r.FIREBASE_ID || '').trim()
    if (excludeFirebaseKey && rKey === excludeFirebaseKey) return false
    const rNormId = r._normLicId || normalizeLicenseIdKey(r.LICENSE_ID || r.SERIAL_KEY || '')
    return rNormId === normId
  })

  if (matches.length === 0) {
    return {
      isDuplicate: false,
      status: 'ok',
      matchedRecord: null,
      allMatches: [],
      message: ''
    }
  }

  const candExp = formatLicenseDateStr(candidate?.EXPIRATION_TIME || candidate?.END_DATE || '')
  const candProdCode = String(candidate?.PRODUCT_CODE || '').trim().toUpperCase()

  const exactExpMatch =
    matches.find(m => (m._normExpDate || formatLicenseDateStr(m.EXPIRATION_TIME)) === candExp && (!candProdCode || !m._normProdCode || m._normProdCode === candProdCode)) ||
    matches.find(m => (m._normExpDate || formatLicenseDateStr(m.EXPIRATION_TIME)) === candExp)

  if (exactExpMatch || !candExp) {
    const target = exactExpMatch || matches[0]
    const custLabel = target.TEN_CONG_TY || target.CUSTOMER || 'Chưa rõ KH'
    const prodLabel = target.PRODUCT_NAME || target.PRODUCT_CODE || '—'
    const expLabel = target._normExpDate || formatLicenseDateStr(target.EXPIRATION_TIME) || '—'
    const poLabel = target.SO_PO ? ` • PO: ${target.SO_PO}` : ''
    return {
      isDuplicate: true,
      status: 'exact_duplicate',
      matchedRecord: target,
      allMatches: matches,
      message: `License ID "${rawId}" đã tồn tại trên hệ thống (Khách hàng: ${custLabel} • Sản phẩm: ${prodLabel} • Hết hạn: ${expLabel}${poLabel}). Không thể thêm mới bản ghi trùng lặp!`
    }
  }

  const renewalTarget =
    matches.find(m => candProdCode && (m._normProdCode || String(m.PRODUCT_CODE || '').trim().toUpperCase()) === candProdCode) ||
    matches[0]
  const custLabel = renewalTarget.TEN_CONG_TY || renewalTarget.CUSTOMER || 'Chưa rõ KH'
  const prodLabel = renewalTarget.PRODUCT_NAME || renewalTarget.PRODUCT_CODE || '—'
  const oldExpLabel = renewalTarget._normExpDate || formatLicenseDateStr(renewalTarget.EXPIRATION_TIME) || '—'
  const poLabel = renewalTarget.SO_PO ? ` • PO cũ: ${renewalTarget.SO_PO}` : ''

  return {
    isDuplicate: true,
    status: 'renewal_candidate',
    matchedRecord: renewalTarget,
    allMatches: matches,
    oldExpDate: oldExpLabel,
    newExpDate: candExp,
    message: `License ID "${rawId}" đã tồn tại trên hệ thống (Khách hàng: ${custLabel} • Sản phẩm: ${prodLabel}${poLabel}) với Ngày hết hạn cũ: ${oldExpLabel} → Ngày hết hạn mới: ${candExp}.`
  }
}

export async function applyRenewalUpdateToExistingLicense(database, existingFirebaseKey, newPayload = {}, existingRecord = {}) {
  if (!database || !existingFirebaseKey) return null
  const oldPoKey = String(existingRecord?.PO_FIREBASE_KEY || '').trim()
  const merged = {
    ...existingRecord,
    ...newPayload,
    LICENSE_ID: String(newPayload.LICENSE_ID || existingRecord.LICENSE_ID || '').trim(),
    CUSTOMER: String(newPayload.CUSTOMER || existingRecord.CUSTOMER || '').trim(),
    MA_KHACH_HANG: String(newPayload.MA_KHACH_HANG || existingRecord.MA_KHACH_HANG || '').trim(),
    TEN_CONG_TY: String(newPayload.TEN_CONG_TY || existingRecord.TEN_CONG_TY || '').trim(),
    SO_PO: String(newPayload.SO_PO || existingRecord.SO_PO || '').trim(),
    PO_FIREBASE_KEY: String(newPayload.PO_FIREBASE_KEY || existingRecord.PO_FIREBASE_KEY || '').trim(),
    PRODUCT_NAME: String(newPayload.PRODUCT_NAME || existingRecord.PRODUCT_NAME || '').trim(),
    PRODUCT_CODE: String(newPayload.PRODUCT_CODE || existingRecord.PRODUCT_CODE || '').trim(),
    LICENSE_VOLUME: String(newPayload.LICENSE_VOLUME || existingRecord.LICENSE_VOLUME || '').trim(),
    LICENSE_TYPE: String(newPayload.LICENSE_TYPE || existingRecord.LICENSE_TYPE || '').trim(),
    LOCALIZATION: String(newPayload.LOCALIZATION || existingRecord.LOCALIZATION || '').trim(),
    NHA_SAN_XUAT: String(newPayload.NHA_SAN_XUAT || existingRecord.NHA_SAN_XUAT || '').trim(),
    DATE_OF_LICENSE: String(newPayload.DATE_OF_LICENSE || existingRecord.DATE_OF_LICENSE || '').trim(),
    EXPIRATION_TIME: String(newPayload.EXPIRATION_TIME || existingRecord.EXPIRATION_TIME || '').trim(),
    SO_NGAY_HIEU_LUC: String(newPayload.SO_NGAY_HIEU_LUC || existingRecord.SO_NGAY_HIEU_LUC || '').trim(),
    LICENSE_DESCRIPTION: String(newPayload.LICENSE_DESCRIPTION || existingRecord.LICENSE_DESCRIPTION || '').trim(),
    LINK_FILE: String(newPayload.LINK_FILE || existingRecord.LINK_FILE || '').trim(),
    NAME_FILE: String(newPayload.NAME_FILE || existingRecord.NAME_FILE || '').trim()
  }

  // Xóa các trường nội bộ tạm thời trước khi lưu Firebase
  delete merged.firebaseKey
  delete merged.FIREBASE_ID
  delete merged._normLicId
  delete merged._normProdCode
  delete merged._normExpDate
  delete merged._file
  delete merged._formatError
  delete merged._rawText
  delete merged._aiProcessing
  delete merged._autoMatchedCust
  delete merged.sheet
  delete merged.action
  delete merged.IS_GIA_HAN

  await set(dbRef(database, `license_old_data/${existingFirebaseKey}`), merged)
  if (merged.PO_FIREBASE_KEY || oldPoKey) {
    await syncLicenseToSaleReportPO(database, existingFirebaseKey, merged, oldPoKey)
  }
  if (merged.CUSTOMER && (merged.MA_KHACH_HANG || merged.TEN_CONG_TY)) {
    await propagateCustomerToSameVendorLicenses(database, merged.CUSTOMER, merged, existingFirebaseKey)
  }
  return existingFirebaseKey
}

