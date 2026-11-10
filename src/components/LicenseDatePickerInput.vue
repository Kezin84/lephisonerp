<template>
  <div
    ref="rootRef"
    class="lic-dp-root"
    :class="[{ 'is-light': theme === 'light', 'is-open': isOpen, 'is-disabled': disabled }]"
  >
    <div
      ref="triggerRef"
      class="lic-dp-trigger"
      role="button"
      :tabindex="disabled ? -1 : 0"
      @click="toggleOpen"
      @keydown.enter.prevent="toggleOpen"
      @keydown.space.prevent="toggleOpen"
    >
      <span class="lic-dp-cal-ico">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </span>

      <span class="lic-dp-val" :class="{ 'is-placeholder': !displayValue }">
        {{ displayValue || placeholder }}
      </span>

      <div class="lic-dp-actions">
        <button
          v-if="displayValue && !disabled"
          type="button"
          class="lic-dp-clear-btn"
          title="Xóa ngày"
          @click.stop="clearDate"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span class="lic-dp-chevron">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="lic-dp-backdrop"
        :class="{ 'is-light': theme === 'light' }"
        @mousedown.self="closePopover"
      >
        <div
          ref="popoverRef"
          class="lic-dp-popover"
          :class="{ 'is-light': theme === 'light' }"
          :style="popoverStyle"
          @mousedown.stop
        >
          <!-- Thanh nhập tay nhanh DD/MM/YYYY -->
          <div class="lic-dp-manual-bar">
            <input
              ref="manualInputRef"
              v-model="manualInput"
              type="text"
              class="lic-dp-manual-input"
              placeholder="Nhập DD/MM/YYYY..."
              @keydown.enter.prevent="commitManualInput"
              @keydown.esc.prevent="closePopover"
            />
            <button
              type="button"
              class="lic-dp-manual-apply"
              @click="commitManualInput"
            >
              Áp dụng
            </button>
          </div>

          <!-- Điều hướng Tháng / Năm -->
          <div class="lic-dp-nav">
            <div class="lic-dp-nav-group">
              <button type="button" class="lic-dp-nav-btn" title="Năm trước" @click="shiftYear(-1)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
              </button>
              <button type="button" class="lic-dp-nav-btn" title="Tháng trước" @click="shiftMonth(-1)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            </div>

            <div class="lic-dp-selectors">
              <select v-model.number="viewMonth" class="lic-dp-select">
                <option v-for="m in 12" :key="m" :value="m - 1">Tháng {{ m }}</option>
              </select>
              <select v-model.number="viewYear" class="lic-dp-select is-year">
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>

            <div class="lic-dp-nav-group">
              <button type="button" class="lic-dp-nav-btn" title="Tháng sau" @click="shiftMonth(1)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button type="button" class="lic-dp-nav-btn" title="Năm sau" @click="shiftYear(1)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
              </button>
            </div>
          </div>

          <!-- Thứ trong tuần -->
          <div class="lic-dp-weekdays">
            <span v-for="w in weekdays" :key="w" class="lic-dp-weekday">{{ w }}</span>
          </div>

          <!-- Lưới ngày -->
          <div class="lic-dp-days-grid">
            <button
              v-for="cell in calendarCells"
              :key="cell.key"
              type="button"
              class="lic-dp-day-btn"
              :class="{
                'is-other-month': !cell.isCurrentMonth,
                'is-today': cell.isToday,
                'is-selected': cell.isSelected
              }"
              @click="selectDateCell(cell)"
            >
              {{ cell.day }}
            </button>
          </div>

          <!-- Phím tắt nhanh -->
          <div class="lic-dp-footer">
            <div class="lic-dp-quick-btns">
              <button type="button" class="lic-dp-quick-chip" @click="selectToday">Hôm nay</button>
              <button type="button" class="lic-dp-quick-chip" @click="shiftFromCurrentOrToday(10)">+10 ngày</button>
              <button type="button" class="lic-dp-quick-chip" @click="shiftFromCurrentOrToday(30)">+30 ngày</button>
              <button type="button" class="lic-dp-quick-chip" @click="shiftYearsFromCurrentOrToday(1)">+1 năm</button>
            </div>
            <button type="button" class="lic-dp-close-btn" @click="closePopover">Đóng</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { formatLicenseDateStr, parseLicenseDateObj } from '../utils/licensePoSync'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Chọn ngày (DD/MM/YYYY)'
  },
  theme: {
    type: String,
    default: 'dark'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const rootRef = ref(null)
const triggerRef = ref(null)
const popoverRef = ref(null)
const manualInputRef = ref(null)

const isOpen = ref(false)
const manualInput = ref('')
const today = new Date()
const viewMonth = ref(today.getMonth())
const viewYear = ref(today.getFullYear())
const popoverStyle = ref({})

const displayValue = computed(() => {
  return formatLicenseDateStr(props.modelValue || '')
})

const selectedDateObj = computed(() => {
  return parseLicenseDateObj(props.modelValue || '')
})

const yearOptions = computed(() => {
  const baseYear = new Date().getFullYear()
  const selYear = selectedDateObj.value ? selectedDateObj.value.getFullYear() : baseYear
  const minYear = Math.min(baseYear - 15, selYear - 5, viewYear.value - 5)
  const maxYear = Math.max(baseYear + 20, selYear + 5, viewYear.value + 5)
  const list = []
  for (let y = minYear; y <= maxYear; y++) {
    list.push(y)
  }
  return list
})

const formatDateObjToDmy = (d) => {
  if (!d || isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const isSameDay = (a, b) => {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const calendarCells = computed(() => {
  const y = viewYear.value
  const m = viewMonth.value
  const firstDayOfMonth = new Date(y, m, 1)
  // Convert Sunday (0) -> 6, Monday (1) -> 0
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7
  const startDate = new Date(y, m, 1 - startOffset)
  const now = new Date()
  const sel = selectedDateObj.value

  const cells = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
    cells.push({
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      dateObj: d,
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === m && d.getFullYear() === y,
      isToday: isSameDay(d, now),
      isSelected: isSameDay(d, sel)
    })
  }
  return cells
})

const updatePopoverPosition = () => {
  if (typeof window === 'undefined' || !triggerRef.value) return
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (vw <= 640) {
    popoverStyle.value = {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(336px, calc(100vw - 24px))'
    }
    return
  }

  const rect = triggerRef.value.getBoundingClientRect()
  const popWidth = 316
  const popHeight = 368

  let left = rect.left
  if (left + popWidth > vw - 12) {
    left = Math.max(12, vw - popWidth - 12)
  }

  let top = rect.bottom + 6
  if (top + popHeight > vh - 12 && rect.top > popHeight + 12) {
    top = rect.top - popHeight - 6
  } else if (top + popHeight > vh - 12) {
    top = Math.max(12, vh - popHeight - 12)
  }

  popoverStyle.value = {
    position: 'fixed',
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
    width: `${popWidth}px`
  }
}

const syncViewToValue = () => {
  const d = selectedDateObj.value || new Date()
  viewMonth.value = d.getMonth()
  viewYear.value = d.getFullYear()
  manualInput.value = displayValue.value || ''
}

const toggleOpen = () => {
  if (props.disabled) return
  if (isOpen.value) {
    closePopover()
  } else {
    syncViewToValue()
    isOpen.value = true
    nextTick(() => {
      updatePopoverPosition()
    })
  }
}

const closePopover = () => {
  isOpen.value = false
}

const emitValue = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
}

const selectDateCell = (cell) => {
  if (!cell?.dateObj) return
  const formatted = formatDateObjToDmy(cell.dateObj)
  manualInput.value = formatted
  emitValue(formatted)
  closePopover()
}

const commitManualInput = () => {
  const raw = String(manualInput.value || '').trim()
  if (!raw) {
    emitValue('')
    closePopover()
    return
  }
  const parsed = parseLicenseDateObj(raw)
  if (parsed) {
    const formatted = formatDateObjToDmy(parsed)
    manualInput.value = formatted
    viewMonth.value = parsed.getMonth()
    viewYear.value = parsed.getFullYear()
    emitValue(formatted)
    closePopover()
  } else {
    const fallback = formatLicenseDateStr(raw)
    emitValue(fallback)
    closePopover()
  }
}

const selectToday = () => {
  const now = new Date()
  const formatted = formatDateObjToDmy(now)
  manualInput.value = formatted
  emitValue(formatted)
  closePopover()
}

const shiftFromCurrentOrToday = (days) => {
  const base = selectedDateObj.value ? new Date(selectedDateObj.value) : new Date()
  base.setDate(base.getDate() + Number(days || 0))
  const formatted = formatDateObjToDmy(base)
  manualInput.value = formatted
  emitValue(formatted)
  closePopover()
}

const shiftYearsFromCurrentOrToday = (years) => {
  const base = selectedDateObj.value ? new Date(selectedDateObj.value) : new Date()
  base.setFullYear(base.getFullYear() + Number(years || 1))
  const formatted = formatDateObjToDmy(base)
  manualInput.value = formatted
  emitValue(formatted)
  closePopover()
}

const clearDate = () => {
  if (props.disabled) return
  manualInput.value = ''
  emitValue('')
  closePopover()
}

const shiftMonth = (delta) => {
  const d = new Date(viewYear.value, viewMonth.value + delta, 1)
  viewMonth.value = d.getMonth()
  viewYear.value = d.getFullYear()
}

const shiftYear = (delta) => {
  viewYear.value += delta
}

watch(
  () => props.modelValue,
  () => {
    if (isOpen.value) {
      syncViewToValue()
    }
  }
)

const onWindowResizeOrScroll = () => {
  if (isOpen.value) {
    updatePopoverPosition()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onWindowResizeOrScroll, { passive: true })
    window.addEventListener('scroll', onWindowResizeOrScroll, true)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onWindowResizeOrScroll)
    window.removeEventListener('scroll', onWindowResizeOrScroll, true)
  }
})
</script>

<style scoped>
.lic-dp-root {
  position: relative;
  width: 100%;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.lic-dp-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 38px;
  padding: 0 8px 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: #090f1a;
  color: #f8fafc;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.lic-dp-trigger:hover {
  border-color: rgba(52, 211, 153, 0.55);
  background: #0c1424;
}

.lic-dp-root.is-open .lic-dp-trigger,
.lic-dp-trigger:focus-visible {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18);
}

.lic-dp-root.is-disabled .lic-dp-trigger {
  opacity: 0.6;
  cursor: not-allowed;
}

.lic-dp-cal-ico {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #34d399;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lic-dp-val {
  flex: 1;
  min-width: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #f8fafc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lic-dp-val.is-placeholder {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 500;
  color: #64748b;
}

.lic-dp-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.lic-dp-clear-btn {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: none;
  background: rgba(148, 163, 184, 0.14);
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.14s ease;
}

.lic-dp-clear-btn:hover {
  background: rgba(239, 68, 68, 0.22);
  color: #fca5a5;
}

.lic-dp-chevron {
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.16s ease;
}

.lic-dp-root.is-open .lic-dp-chevron {
  transform: rotate(180deg);
  color: #34d399;
}

/* ================= LIGHT MODE TRIGGER ================= */
.lic-dp-root.is-light .lic-dp-trigger {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-dp-root.is-light .lic-dp-trigger:hover {
  border-color: #10b981;
  background: #f8fafc;
}

.lic-dp-root.is-light .lic-dp-cal-ico {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.28);
  color: #059669;
}

.lic-dp-root.is-light .lic-dp-val {
  color: #0f172a;
}

.lic-dp-root.is-light .lic-dp-val.is-placeholder {
  color: #94a3b8;
}

.lic-dp-root.is-light .lic-dp-clear-btn {
  background: #f1f5f9;
  color: #64748b;
}

.lic-dp-root.is-light .lic-dp-clear-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* ================= POPOVER CALENDAR ================= */
.lic-dp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100400;
  background: transparent;
}

@media (max-width: 640px) {
  .lic-dp-backdrop {
    background: rgba(2, 6, 23, 0.65);
    backdrop-filter: blur(4px);
  }
}

.lic-dp-popover {
  background: #0c1425;
  border: 1px solid rgba(52, 211, 153, 0.38);
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 20px 48px -8px rgba(0, 0, 0, 0.78), 0 0 0 1px rgba(16, 185, 129, 0.14);
  color: #f8fafc;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  animation: licDpFadeIn 0.14s ease-out;
}

@keyframes licDpFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lic-dp-manual-bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lic-dp-manual-input {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: #070d19;
  color: #f8fafc;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  outline: none;
}

.lic-dp-manual-input:focus {
  border-color: #10b981;
}

.lic-dp-manual-apply {
  height: 32px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid rgba(52, 211, 153, 0.4);
  background: rgba(16, 185, 129, 0.18);
  color: #6ee7b7;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.lic-dp-manual-apply:hover {
  background: #059669;
  color: #ffffff;
}

.lic-dp-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.lic-dp-nav-group {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.lic-dp-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #121d33;
  color: #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.14s ease;
}

.lic-dp-nav-btn:hover {
  border-color: rgba(52, 211, 153, 0.5);
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
}

.lic-dp-selectors {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  justify-content: center;
}

.lic-dp-select {
  height: 28px;
  padding: 0 6px;
  border-radius: 7px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #121d33;
  color: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
}

.lic-dp-select:focus {
  border-color: #10b981;
}

.lic-dp-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  text-align: center;
  padding: 2px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.lic-dp-weekday {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  padding: 3px 0;
}

.lic-dp-days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3px;
}

.lic-dp-day-btn {
  height: 32px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.12s ease;
}

.lic-dp-day-btn:hover {
  background: rgba(16, 185, 129, 0.18);
  border-color: rgba(52, 211, 153, 0.38);
  color: #ffffff;
}

.lic-dp-day-btn.is-other-month {
  color: #475569;
  font-weight: 500;
}

.lic-dp-day-btn.is-today {
  border-color: rgba(56, 189, 248, 0.55);
  color: #38bdf8;
  font-weight: 800;
}

.lic-dp-day-btn.is-selected {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #34d399;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.45);
}

.lic-dp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
}

.lic-dp-quick-btns {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.lic-dp-quick-chip {
  height: 24px;
  padding: 0 7px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #121d33;
  color: #cbd5e1;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.14s ease;
}

.lic-dp-quick-chip:hover {
  border-color: rgba(52, 211, 153, 0.45);
  background: rgba(16, 185, 129, 0.16);
  color: #6ee7b7;
}

.lic-dp-close-btn {
  height: 24px;
  padding: 0 9px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.lic-dp-close-btn:hover {
  background: rgba(148, 163, 184, 0.22);
}

/* ================= LIGHT MODE POPOVER ================= */
.lic-dp-popover.is-light {
  background: #ffffff;
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 20px 44px -10px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(16, 185, 129, 0.12);
  color: #0f172a;
}

.lic-dp-popover.is-light .lic-dp-manual-input {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-dp-popover.is-light .lic-dp-manual-apply {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
  color: #047857;
}

.lic-dp-popover.is-light .lic-dp-manual-apply:hover {
  background: #059669;
  color: #ffffff;
}

.lic-dp-popover.is-light .lic-dp-nav-btn,
.lic-dp-popover.is-light .lic-dp-select {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.lic-dp-popover.is-light .lic-dp-weekday {
  color: #64748b;
}

.lic-dp-popover.is-light .lic-dp-day-btn {
  color: #1e293b;
}

.lic-dp-popover.is-light .lic-dp-day-btn.is-other-month {
  color: #cbd5e1;
}

.lic-dp-popover.is-light .lic-dp-day-btn:hover {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
  color: #065f46;
}

.lic-dp-popover.is-light .lic-dp-day-btn.is-today {
  border-color: #0284c7;
  color: #0284c7;
}

.lic-dp-popover.is-light .lic-dp-day-btn.is-selected {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: #059669;
  color: #ffffff;
}

.lic-dp-popover.is-light .lic-dp-quick-chip {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.lic-dp-popover.is-light .lic-dp-quick-chip:hover {
  background: rgba(16, 185, 129, 0.12);
  border-color: #10b981;
  color: #047857;
}

.lic-dp-popover.is-light .lic-dp-close-btn {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}
</style>
