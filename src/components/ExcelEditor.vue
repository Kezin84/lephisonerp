<template>
  <div class="excel-editor">
    <div class="excel-toolbar">
      <!-- Font Family -->
      <div class="toolbar-group">
        <select v-model="fontFamily" @change="execCmd('fontName', fontFamily)" class="toolbar-select font-select">
          <option v-for="f in availableFonts" :key="f" :value="f">{{ f }}</option>
        </select>
        
        <!-- Font Size -->
        <div style="position: relative; display: flex; align-items: center;">
          <input 
            type="number" 
            list="font-sizes" 
            v-model="fontSizeDisplay" 
            @change="applyCustomFontSize" 
            @keydown.enter.prevent="applyCustomFontSize"
            class="toolbar-select size-input" 
            title="Cỡ chữ (pt)"
          />
          <datalist id="font-sizes">
            <option value="8"></option>
            <option value="9"></option>
            <option value="10"></option>
            <option value="11"></option>
            <option value="12"></option>
            <option value="14"></option>
            <option value="16"></option>
            <option value="18"></option>
            <option value="20"></option>
            <option value="22"></option>
            <option value="24"></option>
            <option value="26"></option>
            <option value="28"></option>
            <option value="36"></option>
            <option value="48"></option>
            <option value="72"></option>
          </datalist>
        </div>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Formatting -->
      <div class="toolbar-group formatting-group">
        <button type="button" class="toolbar-btn" @mousedown.prevent="execCmd('bold')" title="Bold (Ctrl+B)">
          <strong style="font-family: serif; font-size: 16px;">B</strong>
        </button>
        <button type="button" class="toolbar-btn" @mousedown.prevent="execCmd('italic')" title="Italic (Ctrl+I)">
          <i style="font-family: serif; font-size: 16px;">I</i>
        </button>
        <button type="button" class="toolbar-btn" @mousedown.prevent="execCmd('underline')" title="Underline (Ctrl+U)">
          <u style="font-family: serif; font-size: 16px;">U</u>
        </button>
        
        <div class="color-picker-group">
          <div class="color-picker-wrapper">
            <button type="button" class="color-btn" @mousedown.prevent="showTextColorPicker = !showTextColorPicker; showBgColorPicker = false" title="Text Color">
              <span style="font-weight: bold; font-size: 15px; margin-bottom: 2px;">A</span>
              <div class="color-indicator" :style="{ backgroundColor: textColor }"></div>
            </button>
            <div v-if="showTextColorPicker" class="color-palette-modern">
              <div class="palette-reset" @mousedown.prevent="selectTextColor('#000000')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                Đặt lại
              </div>
              <div class="palette-grid main-grid">
                <template v-for="(row, rIdx) in googleColors" :key="'tc-r'+rIdx">
                  <div v-for="c in row" :key="'tc-'+c" class="color-swatch-circle" :style="{ backgroundColor: c }" @mousedown.prevent="selectTextColor(c)">
                    <svg v-if="textColor === c" class="swatch-check" :style="{ color: isLight(c) ? '#000' : '#fff' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </template>
              </div>
              <div class="palette-section-title">CHUẨN</div>
              <div class="palette-grid standard-grid">
                <div v-for="c in standardColorsRow" :key="'tcs-'+c" class="color-swatch-circle" :style="{ backgroundColor: c }" @mousedown.prevent="selectTextColor(c)">
                  <svg v-if="textColor === c" class="swatch-check" :style="{ color: isLight(c) ? '#000' : '#fff' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div class="palette-divider"></div>
              <div class="palette-section-title">TÙY CHỈNH</div>
              <div class="palette-custom-row">
                <div v-for="c in customTextColors" :key="'tcc-'+c" class="color-swatch-circle" :style="{ backgroundColor: c }" @mousedown.prevent="selectTextColor(c)">
                  <svg v-if="textColor === c" class="swatch-check" :style="{ color: isLight(c) ? '#000' : '#fff' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <label class="custom-color-btn" title="Thêm màu">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  <input type="color" class="hidden-color-input" @input="addCustomTextColor">
                </label>
              </div>
            </div>
          </div>

          <div class="color-picker-wrapper">
            <button type="button" class="color-btn" @mousedown.prevent="showBgColorPicker = !showBgColorPicker; showTextColorPicker = false" title="Highlight Color">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 2px;"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
              <div class="color-indicator" :style="{ backgroundColor: bgColor }"></div>
            </button>
            <div v-if="showBgColorPicker" class="color-palette-modern">
              <div class="palette-reset" @mousedown.prevent="selectBgColor('transparent')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                Đặt lại
              </div>
              <div class="palette-grid main-grid">
                <template v-for="(row, rIdx) in googleColors" :key="'bg-r'+rIdx">
                  <div v-for="c in row" :key="'bg-'+c" class="color-swatch-circle" :style="{ backgroundColor: c }" @mousedown.prevent="selectBgColor(c)">
                    <svg v-if="bgColor === c" class="swatch-check" :style="{ color: isLight(c) ? '#000' : '#fff' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </template>
              </div>
              <div class="palette-section-title">CHUẨN</div>
              <div class="palette-grid standard-grid">
                <div v-for="c in standardColorsRow" :key="'bgs-'+c" class="color-swatch-circle" :style="{ backgroundColor: c }" @mousedown.prevent="selectBgColor(c)">
                  <svg v-if="bgColor === c" class="swatch-check" :style="{ color: isLight(c) ? '#000' : '#fff' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div class="palette-divider"></div>
              <div class="palette-section-title">TÙY CHỈNH</div>
              <div class="palette-custom-row">
                <div v-for="c in customBgColors" :key="'bgc-'+c" class="color-swatch-circle" :style="{ backgroundColor: c }" @mousedown.prevent="selectBgColor(c)">
                  <svg v-if="bgColor === c" class="swatch-check" :style="{ color: isLight(c) ? '#000' : '#fff' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <label class="custom-color-btn" title="Thêm màu">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  <input type="color" class="hidden-color-input" @input="addCustomBgColor">
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Alignment -->
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" @mousedown.prevent="execCmd('justifyLeft')" title="Align Left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="15" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <button type="button" class="toolbar-btn" @mousedown.prevent="execCmd('justifyCenter')" title="Center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <button type="button" class="toolbar-btn" @mousedown.prevent="execCmd('justifyRight')" title="Align Right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="9" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div style="width: 4px;"></div>
        <button type="button" class="toolbar-btn" @mousedown.prevent="execCmd('insertUnorderedList')" title="Bullet List">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="21" y2="6"></line><line x1="9" y1="12" x2="21" y2="12"></line><line x1="9" y1="18" x2="21" y2="18"></line><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>
        </button>
        <button type="button" class="toolbar-btn" @mousedown.prevent="execCmd('insertOrderedList')" title="Numbered List">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <!-- Erase formatting -->
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" @mousedown.prevent="execCmd('removeFormat')" title="Clear Formatting">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l18 18M6 6l3.5-3.5a2.121 2.121 0 0 1 3 0L18 8l-4 4"></path><path d="M14 12l-4 4-4-4 4-4"></path></svg>
        </button>
      </div>
    </div>
    
    <div 
      ref="editor" 
      class="editor-content" 
      contenteditable="true" 
      @input="onInput"
      @blur="onBlur"
      @paste="onPaste"
      :placeholder="placeholder"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Nhập nội dung...'
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = ref<HTMLElement | null>(null)
const availableFonts = ref([
  'Arial',
  'Calibri',
  'Times New Roman',
  'Plus Jakarta Sans',
  'Tahoma',
  'Verdana'
])
const fontFamily = ref('Calibri')
const fontSizeDisplay = ref('12')
const textColor = ref('#000000')
const bgColor = ref('#ffff00')
const showTextColorPicker = ref(false)
const showBgColorPicker = ref(false)

const googleColors = [
  ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff'],
  ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'],
  ['#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
  ['#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
  ['#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0'],
  ['#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79'],
  ['#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47'],
  ['#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130']
]

const standardColorsRow = [
  '#000000', '#ffffff', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#ff00ff'
]

const customTextColors = ref<string[]>([])
const customBgColors = ref<string[]>([])

function addCustomTextColor(e: Event) {
  const target = e.target as HTMLInputElement
  const c = target.value
  if (!customTextColors.value.includes(c)) customTextColors.value.push(c)
  selectTextColor(c)
}

function addCustomBgColor(e: Event) {
  const target = e.target as HTMLInputElement
  const c = target.value
  if (!customBgColors.value.includes(c)) customBgColors.value.push(c)
  selectBgColor(c)
}

function isLight(color: string) {
  if (color === 'transparent' || !color) return true
  const hex = color.replace('#', '')
  if (hex.length < 6) return true
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return brightness > 155
}

let isTyping = false
let savedRange: Range | null = null

function saveSelection() {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0) {
    savedRange = sel.getRangeAt(0)
  }
}

function restoreSelection() {
  if (savedRange) {
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(savedRange)
    }
  }
}

function syncToolbarToFirstElement() {
  if (editor.value && editor.value.firstElementChild) {
    const computedStyle = window.getComputedStyle(editor.value.firstElementChild);
    let ff = computedStyle.fontFamily;
    if (ff) {
      ff = ff.split(',')[0].replace(/['"]/g, '').trim();
      if (ff) {
        const exactMatch = availableFonts.value.find(f => f.toLowerCase() === ff.toLowerCase());
        if (exactMatch) {
          fontFamily.value = exactMatch;
        } else if (!availableFonts.value.includes(ff)) {
          availableFonts.value.push(ff);
          fontFamily.value = ff;
        }
      }
    }
    const fs = computedStyle.fontSize;
    if (fs && fs.endsWith('px')) {
      const pt = Math.round(parseFloat(fs) * 0.75);
      if (pt > 0) fontSizeDisplay.value = pt.toString();
    }
  }
}

watch(() => props.modelValue, (newVal) => {
  if (editor.value && !isTyping) {
    if (editor.value.innerHTML !== newVal) {
      editor.value.innerHTML = newVal || ''
      setTimeout(syncToolbarToFirstElement, 0)
    }
  }
})

onMounted(() => {
  if (editor.value) {
    editor.value.innerHTML = props.modelValue || ''
    setTimeout(syncToolbarToFirstElement, 0)
  }
  document.addEventListener('selectionchange', handleSelectionChange)
  document.addEventListener('mousedown', closePickers)
  // Force browser to use inline styles instead of deprecated <font> tags
  // which might be overridden by CSS resets
  try {
    document.execCommand('styleWithCSS', false, 'true')
  } catch (e) {}
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelectionChange)
  document.removeEventListener('mousedown', closePickers)
})

function closePickers(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.color-picker-wrapper')) {
    showTextColorPicker.value = false
    showBgColorPicker.value = false
  }
}

function updateToolbarFromSelection() {
  const fontName = document.queryCommandValue('fontName');
  if (fontName) {
    let cleanFont = fontName.replace(/['"]/g, '').trim();
    if (cleanFont) {
      const exactMatch = availableFonts.value.find(f => f.toLowerCase() === cleanFont.toLowerCase());
      if (exactMatch) {
        fontFamily.value = exactMatch;
      } else if (!availableFonts.value.includes(cleanFont)) {
        availableFonts.value.push(cleanFont);
        fontFamily.value = cleanFont;
      }
    }
  }

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    let node = sel.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentNode as Node;
    if (node && node.nodeType === 1) {
      const computedStyle = window.getComputedStyle(node as Element);
      const fs = computedStyle.fontSize;
      if (fs && fs.endsWith('px')) {
        const pt = Math.round(parseFloat(fs) * 0.75);
        if (pt > 0) fontSizeDisplay.value = pt.toString();
      }
    }
  }
}

function handleSelectionChange() {
  if (document.activeElement === editor.value) {
    saveSelection()
    updateToolbarFromSelection()
  }
}

function onInput() {
  isTyping = true
  if (editor.value) {
    emit('update:modelValue', editor.value.innerHTML)
  }
}

function onBlur() {
  isTyping = false
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  
  let paste = (e.clipboardData || (window as any).clipboardData).getData('text/html')
  
  if (!paste) {
    paste = (e.clipboardData || (window as any).clipboardData).getData('text/plain')
    paste = paste.replace(/\n/g, '<br>')
    document.execCommand('insertHTML', false, paste)
    return
  }
  
  const temp = document.createElement('div')
  temp.innerHTML = paste
  
  const elements = temp.querySelectorAll('*')
  elements.forEach(el => {
    // Strip classes and IDs to prevent external CSS interference
    el.removeAttribute('class')
    el.removeAttribute('id')
    
    // Clean inline styles that restrict dimensions/layout
    if (el.hasAttribute('style')) {
      const htmlEl = el as HTMLElement
      htmlEl.style.width = ''
      htmlEl.style.maxWidth = ''
      htmlEl.style.minWidth = ''
      htmlEl.style.height = ''
      htmlEl.style.margin = ''
      htmlEl.style.padding = ''
      htmlEl.style.float = ''
      htmlEl.style.position = ''
      htmlEl.style.display = ''
      htmlEl.style.whiteSpace = ''
      
      if (!htmlEl.getAttribute('style')) {
        htmlEl.removeAttribute('style')
      }
    }
  })
  
  document.execCommand('insertHTML', false, temp.innerHTML)
}

function execCmd(command: string, value: string = '') {
  restoreSelection()
  try {
    document.execCommand('styleWithCSS', false, 'true')
  } catch (e) {}
  document.execCommand(command, false, value)
  if (editor.value) {
    editor.value.focus()
    emit('update:modelValue', editor.value.innerHTML)
  }
}

function applyHighlight(color: string) {
  restoreSelection()
  // Use hiliteColor for some browsers, backColor for others
  if (!document.execCommand('hiliteColor', false, color)) {
    document.execCommand('backColor', false, color)
  }
  if (editor.value) {
    editor.value.focus()
    emit('update:modelValue', editor.value.innerHTML)
  }
}

function selectTextColor(c: string) {
  textColor.value = c
  showTextColorPicker.value = false
  execCmd('foreColor', c)
}

function selectBgColor(c: string) {
  bgColor.value = c
  showBgColorPicker.value = false
  applyHighlight(c)
}

function applyCustomFontSize() {
  const size = parseInt(fontSizeDisplay.value)
  if (!size || size < 1 || size > 100) return
  
  restoreSelection()
  try {
    document.execCommand('styleWithCSS', false, 'true')
  } catch(e) {}
  
  const dummyFont = `dummy_font_${Date.now()}`
  document.execCommand('fontName', false, dummyFont)
  
  if (editor.value) {
    const elements = editor.value.querySelectorAll(`[style*="${dummyFont}"]`)
    elements.forEach(el => {
      const htmlEl = el as HTMLElement
      htmlEl.style.fontFamily = htmlEl.style.fontFamily.replace(new RegExp(`"?${dummyFont}"?`, 'gi'), '')
      if (htmlEl.style.fontFamily === '') {
        htmlEl.style.removeProperty('font-family')
      }
      htmlEl.style.fontSize = size + 'pt'
    })
    
    const fonts = editor.value.querySelectorAll(`font[face="${dummyFont}"]`)
    fonts.forEach(el => {
      const htmlEl = el as HTMLElement
      htmlEl.removeAttribute('face')
      htmlEl.style.fontSize = size + 'pt'
    })
    
    editor.value.focus()
    emit('update:modelValue', editor.value.innerHTML)
  }
}

defineExpose({
  getToolbarFont: () => ({
    name: fontFamily.value,
    size: parseInt(fontSizeDisplay.value) || 12
  })
})
</script>

<style scoped>
.excel-editor {
  border: 1px solid var(--border, #475569);
  border-radius: 8px;
  background: var(--surface, #1e293b);
  display: flex;
  flex-direction: column;
}

.excel-toolbar {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: #2d3748; /* Similar to Excel dark mode ribbon */
  border-bottom: 1px solid var(--border, #475569);
  gap: 12px;
  flex-wrap: wrap;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.formatting-group {
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #475569;
}

.toolbar-select {
  background: #1a202c;
  color: #f1f5f9;
  border: 1px solid #4a5568;
  border-radius: 4px;
  padding: 4px 24px 4px 8px; /* Extra padding for arrow */
  font-size: 13px;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
}

.toolbar-select:focus {
  border-color: #3b82f6;
}

.font-select {
  width: 120px;
}

.size-input {
  width: 50px;
  padding-right: 4px; /* remove large padding for arrow since it's an input now */
  text-align: center;
  background-image: none; /* remove native custom arrow to avoid double arrow */
}
.size-input::-webkit-calendar-picker-indicator {
  display: none !important;
}

.toolbar-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #e2e8f0;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4a5568;
}

.toolbar-btn:active {
  background: rgba(255, 255, 255, 0.2);
}

.color-picker-group {
  display: flex;
  align-items: center;
  margin-left: 4px;
  gap: 4px;
}

.color-btn {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  background: transparent;
  color: #e2e8f0;
}

.color-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4a5568;
}

.color-indicator {
  width: 16px;
  height: 4px;
  border-radius: 2px;
}

.color-picker-wrapper {
  position: relative;
}

.color-palette-modern {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 50;
  width: 280px;
  color: #333333;
}

.palette-reset {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #444;
  margin-bottom: 8px;
}
.palette-reset:hover {
  background: #f1f1f1;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
}

.main-grid {
  margin-bottom: 12px;
}

.color-swatch-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}
.color-swatch-circle:hover {
  transform: scale(1.15);
  box-shadow: 0 0 0 1px #000;
  z-index: 2;
}

.swatch-check {
  pointer-events: none;
}

.palette-section-title {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.palette-divider {
  height: 1px;
  background: #e5e5e5;
  margin: 12px 0;
}

.palette-custom-row {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.custom-color-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px dashed #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  position: relative;
  transition: all 0.2s;
}
.custom-color-btn:hover {
  border-color: #333;
  color: #333;
}

.hidden-color-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  padding: 0;
  border: none;
}

.editor-content {
  padding: 16px;
  min-height: 200px;
  color: #f1f5f9;
  background: #1e293b;
  outline: none;
  font-family: Calibri, 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  line-height: 1.5;
  overflow-y: auto;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.editor-content:focus {
  background: #1a2235;
}

.editor-content[placeholder]:empty:before {
  content: attr(placeholder);
  color: #64748b;
  pointer-events: none;
  display: block;
}

/* Base formatting inside editor */
.editor-content b, .editor-content strong {
  font-weight: 700;
}
.editor-content i, .editor-content em {
  font-style: italic;
}
.editor-content u {
  text-decoration: underline;
}
.editor-content ul, .editor-content ol {
  padding-left: 24px;
  margin: 8px 0;
}
.editor-content li {
  margin-bottom: 4px;
}
.editor-content table {
  width: 100% !important;
  border-collapse: collapse;
  margin: 8px 0;
}
.editor-content td, .editor-content th {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
