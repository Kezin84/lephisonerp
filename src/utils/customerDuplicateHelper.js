const KH_FIELDS = [
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
  'mst',
  'company',
  'address',
  'tel',
  'nganh_nghe_cong_ty'
]

export const removeDiacritics = (str) => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const normalizeCompanyForDupCheck = (str) => {
  if (!str) return ''
  let s = removeDiacritics(String(str)).toLowerCase()
  s = s.replace(/[^a-z0-9\s]/g, ' ')
  let cleaned = ` ${s.replace(/\s+/g, ' ').trim()} `
  for (const w of [
    'trach nhiem huu han',
    'mot thanh vien',
    'cong ty',
    'co phan',
    'co ltd',
    'chi nhanh',
    'cty',
    'tnhh',
    'mtv',
    'cp',
    'jsc',
    'ltd',
    'limited',
    'company',
    'corp',
    'corporation',
    'inc'
  ]) {
    const reg = new RegExp(`\\b${w}\\b`, 'g')
    cleaned = cleaned.replace(reg, ' ')
  }
  const compact = cleaned.replace(/\s+/g, '').trim()
  if (compact.length >= 2) return compact
  return s.replace(/\s+/g, '').trim()
}

export const normalizePersonForDupCheck = (str) => {
  if (!str) return { key: '', wordCount: 0 }
  let s = removeDiacritics(String(str)).toLowerCase()
  s = s.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  s = s.replace(/^(?:anh|chi|ong|ba|mr|ms|mrs|miss|dr|a|c)\s+/i, '').trim()
  const words = s.split(' ').filter(Boolean)
  return {
    key: words.join(''),
    wordCount: words.length
  }
}

export const normalizeMstForDupCheck = (str) => {
  if (!str) return ''
  const s = String(str).replace(/[^0-9A-Za-z-]/g, '').trim()
  const digitsOnly = s.replace(/[^0-9]/g, '')
  if (digitsOnly.length < 7) return ''
  return s.toUpperCase()
}

/**
 * Convert raw Firebase `khach_hang` snapshot value into normalized array items
 * supporting both object entries and legacy positional array entries.
 */
export const extractCustomerListFromSnapshotVal = (khVal) => {
  if (!khVal || typeof khVal !== 'object') return []
  const list = []
  Object.entries(khVal).forEach(([fbKey, raw]) => {
    if (!raw || typeof raw !== 'object') return
    if (Array.isArray(raw)) {
      const obj = { _firebaseKey: fbKey }
      KH_FIELDS.forEach((field, idx) => {
        obj[field] = raw[idx] !== undefined && raw[idx] !== null ? raw[idx] : ''
      })
      if (!obj.ma_khach_hang && fbKey) obj.ma_khach_hang = fbKey
      list.push(obj)
      return
    }
    list.push({
      ...raw,
      _firebaseKey: fbKey,
      ma_khach_hang: raw.ma_khach_hang || fbKey || ''
    })
  })
  return list
}

/**
 * Detect duplicate customer groups using Union-Find across company name, customer name, and MST.
 */
export const computeCustomerDuplicateGroups = (customersList) => {
  const list = Array.isArray(customersList) ? customersList : []
  const n = list.length
  if (n < 2) return []

  const prep = list.map((kh, idx) => {
    const compRaw = kh.ten_cong_ty || kh.company || ''
    const personInfo = normalizePersonForDupCheck(kh.ten_khach_hang)
    return {
      idx,
      kh,
      compKey: normalizeCompanyForDupCheck(compRaw),
      personKey: personInfo.key,
      personWords: personInfo.wordCount,
      mstKey: normalizeMstForDupCheck(kh.mst)
    }
  })

  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const union = (a, b) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[rb] = ra
  }

  const pairReasons = new Map()
  const addPairReason = (i, j, type) => {
    const key = i < j ? `${i}_${j}` : `${j}_${i}`
    if (!pairReasons.has(key)) pairReasons.set(key, new Set())
    pairReasons.get(key).add(type)
  }

  for (let i = 0; i < n; i++) {
    const a = prep[i]
    for (let j = i + 1; j < n; j++) {
      const b = prep[j]
      const sameMst = Boolean(a.mstKey && b.mstKey && a.mstKey === b.mstKey)
      const sameComp = Boolean(a.compKey && b.compKey && a.compKey === b.compKey)
      const samePerson = Boolean(
        a.personKey &&
        b.personKey &&
        a.personKey === b.personKey &&
        (sameComp || !a.compKey || !b.compKey || a.personWords >= 2)
      )

      if (sameMst || sameComp || samePerson) {
        union(i, j)
        if (sameComp && samePerson) addPairReason(i, j, 'both')
        if (sameComp) addPairReason(i, j, 'company')
        if (samePerson) addPairReason(i, j, 'customer')
        if (sameMst) addPairReason(i, j, 'mst')
      }
    }
  }

  const groupsMap = new Map()
  for (let i = 0; i < n; i++) {
    const root = find(i)
    if (!groupsMap.has(root)) groupsMap.set(root, [])
    groupsMap.get(root).push(i)
  }

  const result = []
  groupsMap.forEach((indices) => {
    if (indices.length < 2) return
    const reasonSet = new Set()
    for (let aIdx = 0; aIdx < indices.length; aIdx++) {
      for (let bIdx = aIdx + 1; bIdx < indices.length; bIdx++) {
        const i = indices[aIdx]
        const j = indices[bIdx]
        const key = i < j ? `${i}_${j}` : `${j}_${i}`
        const rSet = pairReasons.get(key)
        if (rSet) rSet.forEach(t => reasonSet.add(t))
      }
    }

    const reasons = []
    if (reasonSet.has('both')) reasons.push({ type: 'both', label: 'Trùng Công ty & Tên KH' })
    if (reasonSet.has('company') && !reasonSet.has('both')) reasons.push({ type: 'company', label: 'Trùng Tên công ty' })
    if (reasonSet.has('customer') && !reasonSet.has('both')) reasons.push({ type: 'customer', label: 'Trùng Tên khách hàng' })
    if (reasonSet.has('mst')) reasons.push({ type: 'mst', label: 'Trùng MST' })

    const items = indices.map(idx => list[idx])
    const firstWithComp = items.find(it => it.ten_cong_ty || it.company)
    const firstWithName = items.find(it => it.ten_khach_hang)
    const primaryLabel =
      (firstWithComp && (firstWithComp.ten_cong_ty || firstWithComp.company)) ||
      (firstWithName && firstWithName.ten_khach_hang) ||
      items[0]?.ma_khach_hang ||
      'Nhóm khách hàng trùng'

    result.push({
      id: indices.map(idx => list[idx]._firebaseKey || list[idx].ma_khach_hang || idx).join('__'),
      primaryLabel,
      reasonTypes: Array.from(reasonSet),
      reasons,
      items
    })
  })

  return result
}
