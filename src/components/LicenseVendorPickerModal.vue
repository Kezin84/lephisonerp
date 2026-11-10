<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="lic-vp-modal-overlay"
      :class="{ 'is-light': theme === 'light' }"
      @click.self="closeModal"
    >
      <div class="lic-vp-modal-card">
        <!-- HEADER -->
        <div class="lic-vp-modal-head">
          <div class="lic-vp-head-left">
            <span class="lic-vp-modal-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </span>
            <div class="lic-vp-title-row">
              <h4>Chọn Hãng / Nhà Sản Xuất</h4>
            </div>
          </div>

          <button type="button" class="lic-vp-modal-close" @click="closeModal" title="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- TOOLBAR: SEARCH + SCOPE + QUICK ADD -->
        <div class="lic-vp-modal-toolbar">
          <div class="lic-vp-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              ref="searchInputRef"
              type="text"
              v-model="searchQuery"
              class="lic-vp-search-input"
              placeholder="Tìm tên hãng / nhà sản xuất (VD: Kaspersky, Sophos, Acronis, Delinea, Microsoft...)..."
              @keyup.enter="handleEnterSearch"
            />
            <button v-if="searchQuery" type="button" class="lic-vp-search-clear" @click="searchQuery = ''">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <button
            v-if="canAddCustomSearch"
            type="button"
            class="lic-vp-add-custom-btn"
            @click="addAndSelectCustomVendor(searchQuery)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Thêm &amp; Chọn "{{ searchQuery.trim() }}"</span>
          </button>

          <div class="lic-vp-scope-switch">
            <button
              type="button"
              class="lic-vp-scope-btn"
              :class="{ active: scopeMode === 'all' }"
              @click="scopeMode = 'all'"
            >
              Tất cả ({{ allVendorItems.length }})
            </button>
            <button
              v-if="usedVendorItems.length > 0"
              type="button"
              class="lic-vp-scope-btn"
              :class="{ active: scopeMode === 'used' }"
              @click="scopeMode = 'used'"
            >
              Đang có dữ liệu ({{ usedVendorItems.length }})
            </button>
          </div>
        </div>

        <!-- BODY: VENDOR LIST -->
        <div class="lic-vp-modal-body">
          <div v-if="filteredVendors.length === 0" class="lic-vp-empty">
            <p>Không tìm thấy hãng sản xuất nào khớp với từ khóa "{{ searchQuery }}".</p>
            <button
              v-if="searchQuery.trim()"
              type="button"
              class="lic-vp-add-custom-btn is-large"
              @click="addAndSelectCustomVendor(searchQuery)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Sử dụng tên hãng mới: "{{ searchQuery.trim() }}"</span>
            </button>
          </div>

          <div v-else class="lic-vp-grid">
            <div
              v-for="v in filteredVendors"
              :key="v.normKey"
              class="lic-vp-item"
              :class="{ 'is-selected': isVendorSelected(v.name) }"
              @click="selectVendor(v.name)"
            >
              <div class="lic-vp-item-left">
                <span class="lic-vp-avatar" :class="getVendorBrandClass(v.name)">
                  {{ getVendorInitials(v.name) }}
                </span>
                <div class="lic-vp-item-info">
                  <div class="lic-vp-item-title-row">
                    <strong class="lic-vp-item-name">{{ v.name }}</strong>
                    <span v-if="v.isCustom" class="lic-vp-tag is-custom">Tùy chỉnh</span>
                  </div>
                  <div class="lic-vp-item-meta">
                    <span v-if="v.licenseCount > 0" class="lic-vp-meta-pill is-emerald">
                      {{ v.licenseCount }} License
                    </span>
                    <span v-if="v.poCount > 0" class="lic-vp-meta-pill is-sky">
                      {{ v.poCount }} PO
                    </span>
                    <span v-if="v.licenseCount === 0 && v.poCount === 0" class="lic-vp-meta-text">
                      {{ v.category || 'Hãng phần mềm / Bản quyền' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="lic-vp-item-actions" @click.stop>
                <button
                  type="button"
                  class="lic-vp-pick-pill"
                  :class="{ 'is-selected': isVendorSelected(v.name) }"
                  @click="selectVendor(v.name)"
                >
                  <svg v-if="isVendorSelected(v.name)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ isVendorSelected(v.name) ? 'Đang chọn' : 'Chọn' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="lic-vp-modal-foot">
          <div class="lic-vp-foot-status">
            Đang chọn:
            <strong>{{ modelValue || 'Chưa chọn hãng sản xuất' }}</strong>
          </div>
          <div class="lic-vp-foot-btns">
            <button
              v-if="modelValue"
              type="button"
              class="lic-vp-foot-btn is-clear"
              @click="clearVendor"
            >
              Xóa trống
            </button>
            <button type="button" class="lic-vp-foot-btn" @click="closeModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { normalizeViText as normalizeVN } from '../utils/licensePoSync'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  vendors: {
    type: Array,
    default: () => []
  },
  licenseItems: {
    type: Array,
    default: () => []
  },
  officialPos: {
    type: Array,
    default: () => []
  },
  theme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['update:show', 'update:modelValue', 'select'])

const CUSTOM_VENDOR_STORAGE_KEY = 'lic_custom_vendors_v1'
const HANG_HOA_NCC_CACHE_KEY = 'sr_hang_hoa_ncc_cache_v1'

const STANDARD_VENDORS = [
  { name: 'Kaspersky', category: 'Bảo mật Endpoint & An ninh mạng' },
  { name: 'Sophos', category: 'Bảo mật Firewall & Endpoint' },
  { name: 'Acronis', category: 'Sao lưu & Bảo vệ dữ liệu' },
  { name: 'Delinea', category: 'Quản lý đặc quyền truy cập (PAM)' },
  { name: 'Microsoft', category: 'Hệ điều hành, Cloud & Office 365' },
  { name: 'Fortinet', category: 'Thiết bị & Bản quyền tường lửa' },
  { name: 'Palo Alto Networks', category: 'An ninh mạng thế hệ mới' },
  { name: 'Trend Micro', category: 'Bảo mật máy chủ & đám mây' },
  { name: 'Bitdefender', category: 'Bảo mật doanh nghiệp (GravityZone)' },
  { name: 'Symantec', category: 'Bảo mật thông tin doanh nghiệp' },
  { name: 'VMware', category: 'Ảo hóa & Hạ tầng đám mây' },
  { name: 'Veeam', category: 'Sao lưu & Phục hồi thảm họa' },
  { name: 'Cisco', category: 'Hạ tầng mạng & Bảo mật' },
  { name: 'CrowdStrike', category: 'EDR / XDR & Bảo mật điểm cuối' },
  { name: 'Check Point', category: 'Tường lửa & An ninh mạng' },
  { name: 'ESET', category: 'Bảo mật Endpoint doanh nghiệp' },
  { name: 'SentinelOne', category: 'AI Endpoint Security' },
  { name: 'BeyondTrust', category: 'Quản lý truy cập đặc quyền' },
  { name: 'CyberArk', category: 'Bảo mật định danh & PAM' },
  { name: 'ManageEngine', category: 'Quản trị CNTT & Dịch vụ IT' },
  { name: 'SolarWinds', category: 'Giám sát mạng & hạ tầng IT' },
  { name: 'Veritas', category: 'Quản lý & Sao lưu dữ liệu' },
  { name: 'Adobe', category: 'Phần mềm đồ họa & Tài liệu PDF' },
  { name: 'Autodesk', category: 'Phần mềm thiết kế kỹ thuật CAD/BIM' },
  { name: 'Oracle', category: 'Cơ sở dữ liệu & Phần mềm doanh nghiệp' },
  { name: 'Red Hat', category: 'Hệ điều hành Linux & OpenShift' },
  { name: 'Citrix', category: 'Ảo hóa ứng dụng & máy trạm' },
  { name: 'Zscaler', category: 'Zero Trust & Cloud Security' },
  { name: 'Tenable', category: 'Quản lý lỗ hổng bảo mật' },
  { name: 'Qualys', category: 'Đánh giá & Tuân thủ bảo mật' },
  { name: 'Splunk', category: 'SIEM & Phân tích nhật ký an ninh' }
]

const searchQuery = ref('')
const scopeMode = ref('all')
const searchInputRef = ref(null)
const customVendors = ref([])

function loadCustomVendors() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOM_VENDOR_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

function saveCustomVendor(name) {
  const clean = String(name || '').trim()
  if (!clean) return
  const current = loadCustomVendors()
  const norm = normalizeVN(clean)
  if (!current.some(v => normalizeVN(v) === norm)) {
    current.unshift(clean)
    customVendors.value = current
    try {
      localStorage.setItem(CUSTOM_VENDOR_STORAGE_KEY, JSON.stringify(current.slice(0, 100)))
    } catch {}
  }
}

function loadCachedHangHoaNccs() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HANG_HOA_NCC_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter(Boolean)
    if (Array.isArray(parsed?.list)) return parsed.list.filter(Boolean)
    return []
  } catch {
    return []
  }
}

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      customVendors.value = loadCustomVendors()
      searchQuery.value = ''
      scopeMode.value = 'all'
      nextTick(() => {
        searchInputRef.value?.focus?.()
      })
    }
  },
  { immediate: true }
)

const allVendorItems = computed(() => {
  const map = new Map()

  const ensureEntry = (rawName, extra = {}) => {
    const clean = String(rawName || '').trim()
    if (!clean) return null
    const normKey = normalizeVN(clean)
    if (!normKey) return null
    if (!map.has(normKey)) {
      map.set(normKey, {
        name: clean,
        normKey,
        category: extra.category || '',
        licenseCount: 0,
        poCount: 0,
        isCustom: Boolean(extra.isCustom),
        priority: extra.priority ?? 50
      })
    } else {
      const existing = map.get(normKey)
      if (extra.category && !existing.category) existing.category = extra.category
      if (extra.priority !== undefined && extra.priority < existing.priority) {
        existing.priority = extra.priority
      }
    }
    return map.get(normKey)
  }

  // 1. Standard vendors (with nice casing)
  STANDARD_VENDORS.forEach((sv, idx) => {
    ensureEntry(sv.name, { category: sv.category, priority: idx < 6 ? 10 + idx : 30 })
  })

  // 2. Custom vendors saved by user
  customVendors.value.forEach(cv => {
    ensureEntry(cv, { category: 'Hãng đã thêm', isCustom: true, priority: 5 })
  })

  // 3. Vendors prop passed from parent
  if (Array.isArray(props.vendors)) {
    props.vendors.forEach(v => {
      ensureEntry(v, { category: 'Danh mục hệ thống', priority: 15 })
    })
  }

  // 4. Cached NCCs from hang_hoa
  loadCachedHangHoaNccs().forEach(ncc => {
    ensureEntry(ncc, { category: 'Nhà cung cấp / Hãng hàng hóa', priority: 20 })
  })

  // 5. Count from licenseItems
  if (Array.isArray(props.licenseItems)) {
    props.licenseItems.forEach(item => {
      if (!item) return
      const nsx = String(item.NHA_SAN_XUAT || item.nha_san_xuat || '').trim()
      if (!nsx) return
      const entry = ensureEntry(nsx, { category: 'Hãng có trong Kho License', priority: 8 })
      if (entry) entry.licenseCount++
    })
  }

  // 6. Count from officialPos
  if (Array.isArray(props.officialPos)) {
    props.officialPos.forEach(po => {
      if (!po) return
      const pt = String(po.productType || po.Ten_nha_cung_cap || '').trim()
      if (!pt) return
      const entry = ensureEntry(pt, { category: 'Nhà cung cấp trên PO', priority: 12 })
      if (entry) entry.poCount++
    })
  }

  // 7. Current modelValue if not in list
  if (props.modelValue && String(props.modelValue).trim()) {
    ensureEntry(props.modelValue, { category: 'Giá trị hiện tại', priority: 1 })
  }

  const list = Array.from(map.values())
  list.sort((a, b) => {
    const aSelected = isVendorSelected(a.name) ? 1 : 0
    const bSelected = isVendorSelected(b.name) ? 1 : 0
    if (aSelected !== bSelected) return bSelected - aSelected

    const aTotal = a.licenseCount * 3 + a.poCount
    const bTotal = b.licenseCount * 3 + b.poCount
    if (aTotal !== bTotal) return bTotal - aTotal

    if (a.priority !== b.priority) return a.priority - b.priority
    return a.name.localeCompare(b.name, 'vi')
  })

  return list
})

const usedVendorItems = computed(() => {
  return allVendorItems.value.filter(v => v.licenseCount > 0 || v.poCount > 0 || v.isCustom)
})

const filteredVendors = computed(() => {
  const base = scopeMode.value === 'used' && usedVendorItems.value.length > 0
    ? usedVendorItems.value
    : allVendorItems.value
  const q = normalizeVN(searchQuery.value)
  if (!q) return base
  return base.filter(v => {
    const hay = normalizeVN(`${v.name} ${v.category || ''}`)
    return hay.includes(q)
  })
})

const canAddCustomSearch = computed(() => {
  const clean = String(searchQuery.value || '').trim()
  if (!clean) return false
  const norm = normalizeVN(clean)
  return !allVendorItems.value.some(v => v.normKey === norm)
})

function isVendorSelected(name) {
  const cur = normalizeVN(props.modelValue)
  const target = normalizeVN(name)
  return Boolean(cur && target && cur === target)
}

function getVendorInitials(name) {
  const clean = String(name || '').trim()
  if (!clean) return 'NSX'
  const words = clean.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

function getVendorBrandClass(name) {
  const low = String(name || '').toLowerCase()
  if (low.includes('kaspersky')) return 'is-kaspersky'
  if (low.includes('sophos')) return 'is-sophos'
  if (low.includes('acronis')) return 'is-acronis'
  if (low.includes('delinea')) return 'is-delinea'
  if (low.includes('microsoft')) return 'is-microsoft'
  if (low.includes('fortinet') || low.includes('trend') || low.includes('crowdstrike')) return 'is-rose'
  if (low.includes('veeam') || low.includes('bitdefender') || low.includes('eset')) return 'is-emerald'
  return 'is-default'
}

function selectVendor(vendorName) {
  const clean = String(vendorName || '').trim()
  emit('update:modelValue', clean)
  emit('select', clean)
  closeModal()
}

function addAndSelectCustomVendor(rawName) {
  const clean = String(rawName || '').trim()
  if (!clean) return
  saveCustomVendor(clean)
  selectVendor(clean)
}

function handleEnterSearch() {
  if (filteredVendors.value.length === 1) {
    selectVendor(filteredVendors.value[0].name)
  } else if (canAddCustomSearch.value) {
    addAndSelectCustomVendor(searchQuery.value)
  }
}

function clearVendor() {
  emit('update:modelValue', '')
  emit('select', '')
  closeModal()
}

function closeModal() {
  emit('update:show', false)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.lic-vp-modal-overlay,
.lic-vp-modal-overlay * {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  box-sizing: border-box;
}

.lic-vp-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100280;
  background: rgba(2, 6, 23, 0.78);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lic-vp-modal-card {
  width: min(860px, 100%);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #0b141c;
  border: 1.5px solid rgba(52, 211, 153, 0.45);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  overflow: hidden;
  color: #f8fafc;
}

.lic-vp-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 20px;
  background: linear-gradient(90deg, #059669 0%, #047857 55%, #0f766e 100%);
  border-bottom: 1px solid rgba(52, 211, 153, 0.32);
  color: #ffffff;
  flex-shrink: 0;
}

.lic-vp-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.lic-vp-modal-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.34);
  color: #ffffff;
  flex-shrink: 0;
}

.lic-vp-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.lic-vp-title-row h4 {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.01em;
}

.lic-vp-modal-close {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(15, 23, 42, 0.28);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
  padding: 0;
}

.lic-vp-modal-close:hover {
  background: rgba(239, 68, 68, 0.55);
  border-color: #fecaca;
}

.lic-vp-modal-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #0f1b29;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  flex-wrap: wrap;
}

.lic-vp-search-wrap {
  flex: 1;
  min-width: 240px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 9px;
  background: #070d17;
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #94a3b8;
}

.lic-vp-search-wrap:focus-within {
  border-color: #10b981;
}

.lic-vp-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fafc;
  font-size: 13px;
}

.lic-vp-search-clear {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lic-vp-add-custom-btn {
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(52, 211, 153, 0.55);
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.lic-vp-add-custom-btn.is-large {
  height: 40px;
  padding: 0 16px;
  font-size: 13px;
}

.lic-vp-add-custom-btn:hover {
  filter: brightness(1.08);
}

.lic-vp-scope-switch {
  display: inline-flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(52, 211, 153, 0.35);
}

.lic-vp-scope-btn {
  height: 34px;
  padding: 0 12px;
  border: none;
  background: rgba(15, 23, 42, 0.75);
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.lic-vp-scope-btn.active {
  background: #059669;
  color: #ffffff;
}

.lic-vp-modal-body {
  flex: 1;
  min-height: 260px;
  max-height: 56vh;
  overflow-y: auto;
  padding: 14px 18px;
}

.lic-vp-empty {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.lic-vp-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.lic-vp-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #f8fafc;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lic-vp-item:hover {
  border-color: rgba(52, 211, 153, 0.55);
  background: rgba(16, 185, 129, 0.08);
}

.lic-vp-item.is-selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.16);
}

.lic-vp-item-left {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  flex: 1;
}

.lic-vp-avatar {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.03em;
  flex-shrink: 0;
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #e2e8f0;
}

.lic-vp-avatar.is-kaspersky {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #34d399;
  color: #ffffff;
}

.lic-vp-avatar.is-sophos {
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  border-color: #60a5fa;
  color: #ffffff;
}

.lic-vp-avatar.is-acronis {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-color: #60a5fa;
  color: #ffffff;
}

.lic-vp-avatar.is-delinea {
  background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%);
  border-color: #a78bfa;
  color: #ffffff;
}

.lic-vp-avatar.is-microsoft {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  border-color: #38bdf8;
  color: #ffffff;
}

.lic-vp-avatar.is-rose {
  background: linear-gradient(135deg, #be123c 0%, #e11d48 100%);
  border-color: #fb7185;
  color: #ffffff;
}

.lic-vp-avatar.is-emerald {
  background: linear-gradient(135deg, #047857 0%, #10b981 100%);
  border-color: #34d399;
  color: #ffffff;
}

.lic-vp-item-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.lic-vp-item-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.lic-vp-item-name {
  font-size: 13.5px;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.3;
}

.lic-vp-tag.is-custom {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fde68a;
}

.lic-vp-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.lic-vp-meta-pill {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
}

.lic-vp-meta-pill.is-emerald {
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #6ee7b7;
}

.lic-vp-meta-pill.is-sky {
  background: rgba(14, 165, 233, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
}

.lic-vp-meta-text {
  font-size: 11.5px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lic-vp-item-actions {
  flex-shrink: 0;
}

.lic-vp-pick-pill {
  height: 30px;
  padding: 0 12px;
  border-radius: 7px;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(52, 211, 153, 0.45);
  color: #6ee7b7;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lic-vp-pick-pill:hover {
  background: #059669;
  color: #ffffff;
}

.lic-vp-pick-pill.is-selected {
  background: #059669;
  border-color: #10b981;
  color: #ffffff;
}

.lic-vp-modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  background: #08101a;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.lic-vp-foot-status {
  font-size: 12.5px;
  color: #94a3b8;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-vp-foot-status strong {
  color: #f8fafc;
}

.lic-vp-foot-btns {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.lic-vp-foot-btn {
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #1e293b;
  color: #f8fafc;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.lic-vp-foot-btn.is-clear {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(248, 113, 113, 0.45);
  color: #fca5a5;
}

/* ================= LIGHT THEME SUPPORT ================= */
.lic-vp-modal-overlay.is-light .lic-vp-modal-card {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-vp-modal-overlay.is-light .lic-vp-modal-head {
  background: linear-gradient(90deg, #0284c7 0%, #2563eb 55%, #1d4ed8 100%);
  border-bottom-color: #7dd3fc;
}

.lic-vp-modal-overlay.is-light .lic-vp-modal-toolbar {
  background: #f1f5f9;
  border-bottom-color: #e2e8f0;
}

.lic-vp-modal-overlay.is-light .lic-vp-search-wrap {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #475569;
}

.lic-vp-modal-overlay.is-light .lic-vp-search-input {
  color: #0f172a;
}

.lic-vp-modal-overlay.is-light .lic-vp-scope-btn {
  background: #ffffff;
  color: #475569;
}

.lic-vp-modal-overlay.is-light .lic-vp-scope-btn.active {
  background: #059669;
  color: #ffffff;
}

.lic-vp-modal-overlay.is-light .lic-vp-item {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #0f172a;
}

.lic-vp-modal-overlay.is-light .lic-vp-item:hover {
  border-color: #10b981;
  background: #ecfdf5;
}

.lic-vp-modal-overlay.is-light .lic-vp-item.is-selected {
  border-color: #059669;
  background: #d1fae5;
}

.lic-vp-modal-overlay.is-light .lic-vp-item-name {
  color: #0f172a;
}

.lic-vp-modal-overlay.is-light .lic-vp-meta-text {
  color: #64748b;
}

.lic-vp-modal-overlay.is-light .lic-vp-meta-pill.is-emerald {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #047857;
}

.lic-vp-modal-overlay.is-light .lic-vp-meta-pill.is-sky {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0369a1;
}

.lic-vp-modal-overlay.is-light .lic-vp-pick-pill:not(.is-selected) {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #047857;
}

.lic-vp-modal-overlay.is-light .lic-vp-modal-foot {
  background: #f1f5f9;
  border-top-color: #e2e8f0;
}

.lic-vp-modal-overlay.is-light .lic-vp-foot-status strong {
  color: #0f172a;
}

.lic-vp-modal-overlay.is-light .lic-vp-foot-btn:not(.is-clear) {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

@media (max-width: 1100px) {
  .lic-vp-modal-overlay {
    padding: 0 !important;
  }

  .lic-vp-modal-card {
    width: 100% !important;
    max-width: 100% !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border: none !important;
  }

  .lic-vp-modal-card > .lic-vp-modal-head {
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) !important;
    padding-bottom: 12px !important;
    padding-left: 14px !important;
    padding-right: 14px !important;
    border-radius: 0 !important;
  }

  .lic-vp-modal-body {
    max-height: none !important;
    flex: 1 1 0% !important;
    min-height: 0 !important;
    padding: 12px 14px !important;
  }

  .lic-vp-modal-toolbar {
    padding: 10px 14px !important;
  }

  .lic-vp-modal-card > .lic-vp-modal-foot {
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

@media (max-width: 768px) {
  .lic-vp-search-wrap {
    min-width: 0;
    flex: 1 1 100%;
  }
  .lic-vp-grid {
    grid-template-columns: 1fr;
  }
}
</style>
