import ExcelJS from 'exceljs'
import html2canvas from 'html2canvas'
import { getDatabase, ref as dbRef, get, set, update, remove } from 'firebase/database'
import { getApps, getApp, initializeApp } from 'firebase/app'

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

function getDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  return getDatabase(app)
}

export interface QuoteFileNameParams {
  tenKhachHang?: string
  tenCongTy?: string
  contentPO?: string
  fallbackCode?: string
  prefix?: string
  date?: Date | string
}

/**
 * Định dạng tên file báo giá khi tải về:
 * "Tên khách hàng_Tên công ty_contentOfContractPO(nếu có)_ngày/tháng/năm"
 */
export function buildQuoteFileName(params: QuoteFileNameParams): string {
  const sanitizePart = (str?: string) =>
    String(str || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[/\\:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
      .trim()

  const tenKH = sanitizePart(params.tenKhachHang)
  const tenCT = sanitizePart(params.tenCongTy)
  const po = sanitizePart(params.contentPO)
  const prefix = sanitizePart(params.prefix)

  let d = new Date()
  if (params.date instanceof Date && !isNaN(params.date.getTime())) {
    d = params.date
  } else if (typeof params.date === 'string' && params.date.trim()) {
    const m = params.date.match(/(\d{1,2})[\/.\u2215-](\d{1,2})[\/.\u2215-](\d{4})/)
    if (m) {
      d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    } else {
      const parsed = new Date(params.date)
      if (!isNaN(parsed.getTime())) d = parsed
    }
  }
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  // Dùng ký tự phân số Unicode ∕ (\u2215) để hiển thị đúng "ngày/tháng/năm" mà không bị trình duyệt/Windows chặn ký tự đường dẫn "/"
  const datePart = `${dd}\u2215${mm}\u2215${yyyy}`

  const mainParts = [tenKH, tenCT, po].filter(Boolean)
  if (mainParts.length === 0) {
    const fb = sanitizePart(params.fallbackCode) || 'NTS'
    mainParts.push(`BaoGia_${fb}`)
  }
  if (prefix) {
    mainParts.unshift(prefix)
  }
  return [...mainParts, datePart].join('_')
}

function getFirstLeafNode(node: Node): Node | null {
  let cur: Node | null = node.firstChild
  while (cur) {
    if (cur.nodeType === 3 && !(cur.nodeValue || '').replace(/\u00A0/g, ' ').trim()) {
      const next = cur.nextSibling
      cur.parentNode?.removeChild(cur)
      cur = next
      continue
    }
    if (cur.nodeType === 1 && cur.childNodes.length > 0 && cur.nodeName !== 'BR' && cur.nodeName !== 'IMG') {
      cur = cur.firstChild
      continue
    }
    return cur
  }
  return null
}

function getLastLeafNode(node: Node): Node | null {
  let cur: Node | null = node.lastChild
  while (cur) {
    if (cur.nodeType === 3 && !(cur.nodeValue || '').replace(/\u00A0/g, ' ').trim()) {
      const prev = cur.previousSibling
      cur.parentNode?.removeChild(cur)
      cur = prev
      continue
    }
    if (cur.nodeType === 1 && cur.childNodes.length > 0 && cur.nodeName !== 'BR' && cur.nodeName !== 'IMG') {
      cur = cur.lastChild
      continue
    }
    return cur
  }
  return null
}

export function trimLeadingBrDeep(container: HTMLElement): boolean {
  let changed = false
  let guard = 0
  while (guard++ < 50) {
    const leaf = getFirstLeafNode(container)
    if (!leaf || leaf === container) break
    if (leaf.nodeName === 'BR') {
      let p = leaf.parentNode
      p?.removeChild(leaf)
      changed = true
      while (p && p !== container && p.childNodes.length === 0) {
        const up = p.parentNode
        up?.removeChild(p)
        p = up
      }
      continue
    }
    if (leaf.nodeType === 1 && leaf.nodeName !== 'IMG' && !(leaf.textContent || '').replace(/\u00A0/g, ' ').trim()) {
      let p = leaf.parentNode
      p?.removeChild(leaf)
      changed = true
      while (p && p !== container && p.childNodes.length === 0) {
        const up = p.parentNode
        up?.removeChild(p)
        p = up
      }
      continue
    }
    break
  }
  return changed
}

export function trimTrailingBrDeep(container: HTMLElement): boolean {
  let changed = false
  let guard = 0
  while (guard++ < 50) {
    const leaf = getLastLeafNode(container)
    if (!leaf || leaf === container) break
    if (leaf.nodeName === 'BR') {
      let p = leaf.parentNode
      p?.removeChild(leaf)
      changed = true
      while (p && p !== container && p.childNodes.length === 0) {
        const up = p.parentNode
        up?.removeChild(p)
        p = up
      }
      continue
    }
    if (leaf.nodeType === 1 && leaf.nodeName !== 'IMG' && !(leaf.textContent || '').replace(/\u00A0/g, ' ').trim()) {
      let p = leaf.parentNode
      p?.removeChild(leaf)
      changed = true
      while (p && p !== container && p.childNodes.length === 0) {
        const up = p.parentNode
        up?.removeChild(p)
        p = up
      }
      continue
    }
    break
  }
  return changed
}

/**
 * Chuẩn hóa & sửa lỗi cấu trúc `.stt-block` / `.stt-number` trong DOM:
 * - Chống lồng `.stt-block` bên trong `.stt-block` hoặc `.stt-number`
 * - Tách nội dung điều khoản bị dính vào `.stt-number` sang `.stt-content`
 * - Đánh lại số thứ tự tuần tự 1, 2, 3... (khắc phục triệt để lỗi số mũ 1.0102100101199458e+21)
 */
export function repairAndRenumberSttDom(root: HTMLElement): boolean {
  let changed = false

  // 1. Bọc các .stt-number mồ côi (không nằm trong .stt-block) vào .stt-block
  const orphanNums = Array.from(root.querySelectorAll('.stt-number')).filter(
    el => !el.closest('.stt-block')
  )
  for (const numEl of orphanNums) {
    const block = document.createElement('div')
    block.className = 'stt-block'
    block.style.cssText = 'display: flex; gap: 8px; margin: 0; padding: 0; align-items: flex-start;'
    numEl.parentNode?.insertBefore(block, numEl)
    block.appendChild(numEl)
    changed = true
  }

  // 2. Đưa các .stt-block bị lồng bên trong .stt-block khác hoặc bên trong thẻ bao (div/p/b/span) ra cấp ngoài cùng của root
  let nestedBlocks = Array.from(root.querySelectorAll('.stt-block .stt-block'))
  let guard = 0
  while (nestedBlocks.length > 0 && guard < 100) {
    guard++
    for (const inner of nestedBlocks) {
      const outer = inner.parentElement?.closest('.stt-block')
      if (outer && outer.parentNode) {
        outer.parentNode.insertBefore(inner, outer.nextSibling)
        changed = true
      }
    }
    nestedBlocks = Array.from(root.querySelectorAll('.stt-block .stt-block'))
  }

  // Nếu .stt-block bị nằm bên trong một thẻ khác (div, p, b, span...) dưới root, tách thẻ đó ra để .stt-block là con trực tiếp của root
  const wrappedBlocks = Array.from(root.querySelectorAll('.stt-block')).filter(
    el => el.parentElement && el.parentElement !== root
  ) as HTMLElement[]
  for (const block of wrappedBlocks) {
    let topWrapper: HTMLElement | null = block.parentElement
    while (topWrapper && topWrapper.parentElement && topWrapper.parentElement !== root) {
      topWrapper = topWrapper.parentElement
    }
    if (topWrapper && topWrapper.parentElement === root) {
      const wrapperText = (topWrapper.textContent || '').replace(/\u00A0/g, ' ').trim()
      const blockText = (block.textContent || '').replace(/\u00A0/g, ' ').trim()
      if (wrapperText === blockText) {
        root.replaceChild(block, topWrapper)
        changed = true
      } else {
        const beforeRange = document.createRange()
        beforeRange.selectNodeContents(topWrapper)
        beforeRange.setEndBefore(block)
        const beforeFrag = beforeRange.extractContents()

        const afterRange = document.createRange()
        afterRange.selectNodeContents(topWrapper)
        afterRange.setStartAfter(block)
        const afterFrag = afterRange.extractContents()

        const beforeDiv = document.createElement('div')
        beforeDiv.appendChild(beforeFrag)
        trimLeadingBrDeep(beforeDiv)
        trimTrailingBrDeep(beforeDiv)

        const afterDiv = document.createElement('div')
        afterDiv.appendChild(afterFrag)
        trimLeadingBrDeep(afterDiv)
        trimTrailingBrDeep(afterDiv)

        if ((beforeDiv.textContent || '').replace(/\u00A0/g, ' ').trim()) {
          root.insertBefore(beforeDiv, topWrapper)
        }
        root.insertBefore(block, topWrapper)
        if ((afterDiv.textContent || '').replace(/\u00A0/g, ' ').trim()) {
          root.insertBefore(afterDiv, topWrapper)
        }
        topWrapper.remove()
        changed = true
      }
    }
  }

  // 3. Sửa cấu trúc bên trong từng .stt-block (.stt-number + .stt-content)
  const blocks = Array.from(root.querySelectorAll('.stt-block')) as HTMLElement[]
  for (const block of blocks) {
    block.style.display = 'flex'
    block.style.gap = '8px'
    block.style.margin = '0'
    block.style.padding = '0'
    block.style.alignItems = 'flex-start'

    let numEls = Array.from(block.querySelectorAll('.stt-number')) as HTMLElement[]
    let primaryNum = numEls[0]
    if (!primaryNum) {
      primaryNum = document.createElement('div')
      primaryNum.className = 'stt-number'
      primaryNum.textContent = '1'
      block.insertBefore(primaryNum, block.firstChild)
      numEls = [primaryNum]
      changed = true
    }

    // Nếu có nhiều .stt-number trong cùng 1 .stt-block (do nhấn Enter trong .stt-number), gỡ class .stt-number của các phần tử dư
    if (numEls.length > 1) {
      for (let i = 1; i < numEls.length; i++) {
        const extra = numEls[i]
        extra.classList.remove('stt-number')
        extra.removeAttribute('style')
        extra.removeAttribute('contenteditable')
      }
      changed = true
    }

    let contentEls = Array.from(block.querySelectorAll('.stt-content')) as HTMLElement[]
    let primaryContent = contentEls[0]
    if (!primaryContent) {
      primaryContent = document.createElement('div')
      primaryContent.className = 'stt-content'
      primaryContent.style.cssText = 'flex-grow: 1; min-width: 0;'
      block.appendChild(primaryContent)
      contentEls = [primaryContent]
      changed = true
    }

    // Kiểm tra nếu primaryNum bị dính nội dung điều khoản vào trong
    const rawNumText = (primaryNum.textContent || '').replace(/\u00A0/g, ' ').trim()
    const isPureNumberOrSci = /^(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?)[.):]?\s*$/i.test(rawNumText)

    if ((rawNumText && !isPureNumberOrSci) || primaryNum.children.length > 0) {
      const walker = document.createTreeWalker(primaryNum, NodeFilter.SHOW_TEXT)
      const firstText = walker.nextNode() as Text | null
      if (firstText && firstText.nodeValue) {
        firstText.nodeValue = firstText.nodeValue.replace(
          /^[\s\u00A0]*(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?[.):]?\s*)?/i,
          ''
        )
      }
      const existingContentText = (primaryContent.textContent || '').trim()
      if (!existingContentText || existingContentText === 'Nội dung...') {
        primaryContent.innerHTML = ''
      }
      const frag = document.createDocumentFragment()
      while (primaryNum.firstChild) {
        frag.appendChild(primaryNum.firstChild)
      }
      primaryContent.insertBefore(frag, primaryContent.firstChild)
      primaryNum.textContent = '1'
      changed = true
    }

    // Nếu có nhiều .stt-content trong cùng 1 .stt-block (do Chrome chia đôi flex item khi nhấn Enter), gộp lại bằng <br>
    if (contentEls.length > 1) {
      for (let i = 1; i < contentEls.length; i++) {
        const extraContent = contentEls[i]
        if (primaryContent.childNodes.length > 0) {
          primaryContent.appendChild(document.createElement('br'))
        }
        while (extraContent.firstChild) {
          primaryContent.appendChild(extraContent.firstChild)
        }
        extraContent.remove()
      }
      changed = true
    }

    // Chuyển các node con lạc ngoài .stt-number / .stt-content vào trong primaryContent
    const strayNodes = Array.from(block.childNodes).filter(
      n => n !== primaryNum && n !== primaryContent
    )
    if (strayNodes.length > 0) {
      for (const node of strayNodes) {
        if (node.nodeType === 3 && !(node.textContent || '').trim()) {
          node.remove()
        } else {
          primaryContent.appendChild(node)
        }
      }
      changed = true
    }

    if (primaryNum.getAttribute('contenteditable') !== 'false') {
      primaryNum.setAttribute('contenteditable', 'false')
      changed = true
    }
    primaryNum.style.fontWeight = 'bold'
    primaryNum.style.minWidth = '18px'
    primaryNum.style.flexShrink = '0'
    primaryNum.style.whiteSpace = 'nowrap'
    primaryNum.style.userSelect = 'none'

    primaryContent.style.flexGrow = '1'
    primaryContent.style.minWidth = '0'

    // Dọn dẹp bảng <table> copy từ Excel và gộp các ký tự xuống dòng mã nguồn (\r\n) bên trong primaryContent
    primaryContent.querySelectorAll('table').forEach(tbl => {
      const frag = document.createDocumentFragment()
      const rows = Array.from(tbl.querySelectorAll('tr'))
      let addedRow = false
      rows.forEach(tr => {
        const rowText = (tr.textContent || '').replace(/\u00A0/g, ' ').trim()
        if (!rowText && !tr.querySelector('img')) return
        if (addedRow) {
          frag.appendChild(document.createElement('br'))
        }
        const cells = Array.from(tr.querySelectorAll('td, th'))
        if (cells.length > 0) {
          cells.forEach(cell => {
            if ((cell.textContent || '').replace(/\u00A0/g, ' ').trim() || cell.querySelector('img')) {
              while (cell.firstChild) {
                frag.appendChild(cell.firstChild)
              }
            }
          })
        } else {
          while (tr.firstChild) {
            frag.appendChild(tr.firstChild)
          }
        }
        addedRow = true
      })
      tbl.parentNode?.replaceChild(frag, tbl)
      changed = true
    })

    // Chuẩn hóa khoảng trắng / xuống dòng thừa trong text node (do copy từ Excel bị ngắt dòng mã nguồn \n  )
    const textWalker = document.createTreeWalker(primaryContent, NodeFilter.SHOW_TEXT)
    let tNode = textWalker.nextNode() as Text | null
    while (tNode) {
      const val = tNode.nodeValue || ''
      if (/[\r\n]/.test(val) || /[ \t\u00A0]{2,}/.test(val)) {
        const normalized = val
          .replace(/\u00A0/g, ' ')
          .replace(/\s*\r?\n\s*/g, ' ')
          .replace(/[ \t]{2,}/g, ' ')
        if (normalized !== val) {
          tNode.nodeValue = normalized
          changed = true
        }
      }
      tNode = textWalker.nextNode() as Text | null
    }

    // Dọn dẹp các thẻ <br> thừa ở đầu/cuối (kể cả nằm sâu trong b/span/div) và các thẻ div/p rỗng bên trong primaryContent gây khoảng trống
    const hasRealContent = (primaryContent.textContent || '').replace(/\u00A0/g, ' ').trim().length > 0
    if (hasRealContent) {
      primaryContent.querySelectorAll('div, p').forEach(innerEl => {
        const htmlInner = innerEl as HTMLElement
        htmlInner.style.margin = '0'
        htmlInner.style.padding = '0'
        if (!(htmlInner.textContent || '').replace(/\u00A0/g, ' ').trim() && !htmlInner.querySelector('img')) {
          htmlInner.remove()
          changed = true
        }
      })
      if (trimLeadingBrDeep(primaryContent)) changed = true
      if (trimTrailingBrDeep(primaryContent)) changed = true
    } else if (!primaryContent.innerHTML.trim()) {
      primaryContent.innerHTML = '<br>'
    }
  }

  // 3b. Xóa các thẻ <br> hoặc thẻ rỗng (<div><br></div>, <p></p>, <div><b></b></div>) nằm xen giữa hoặc sát cạnh .stt-block gây hở hàng
  if (root.querySelector('.stt-block')) {
    const children = Array.from(root.childNodes)
    for (const node of children) {
      if (node.nodeType === 3) {
        if (!(node.textContent || '').replace(/\u00A0/g, ' ').trim()) {
          node.remove()
          changed = true
        }
        continue
      }
      if (node.nodeType === 1) {
        const el = node as HTMLElement
        if (el.classList.contains('stt-block')) continue
        const text = (el.textContent || '').replace(/\u00A0/g, ' ').trim()
        if (el.tagName === 'BR' || (!text && !el.querySelector('img'))) {
          el.remove()
          changed = true
          continue
        }
        // Nếu phần tử thường nằm ngay sau .stt-block mà có <br> ở đầu, hoặc trước .stt-block mà có <br> ở cuối -> xóa <br> thừa (kể cả lồng trong b/span)
        if (el.previousElementSibling?.classList.contains('stt-block')) {
          if (trimLeadingBrDeep(el)) changed = true
        }
        if (el.nextElementSibling?.classList.contains('stt-block')) {
          if (trimTrailingBrDeep(el)) changed = true
        }
      }
    }
  }

  // 4. Đánh lại số thứ tự tuần tự 1, 2, 3... cho toàn bộ .stt-block
  const finalBlocks = Array.from(root.querySelectorAll('.stt-block')) as HTMLElement[]
  finalBlocks.forEach((block, idx) => {
    const numEl = block.querySelector('.stt-number') as HTMLElement | null
    if (numEl) {
      const expected = String(idx + 1)
      if ((numEl.textContent || '').trim() !== expected) {
        numEl.textContent = expected
        changed = true
      }
    }
  })

  return changed
}

export function sanitizeSttHtml(html: string): string {
  if (!html || typeof document === 'undefined') return html || ''
  if (!html.includes('stt-block') && !html.includes('stt-number') && !/\d+\.\d+e\+\d+/i.test(html)) {
    return html
  }
  const temp = document.createElement('div')
  temp.innerHTML = html
  repairAndRenumberSttDom(temp)
  // Phòng trường hợp chuỗi số mũ 1.0102100101199458e+21 nằm ngoài .stt-number do bị xóa class
  let result = temp.innerHTML
  if (/\d+\.\d+e\+\d+/i.test(result)) {
    let fallbackCounter = 1
    result = result.replace(/\b\d+\.\d+e\+\d+\b/gi, () => String(fallbackCounter++))
  }
  return result
}

/* =====================================================
   1. DANH MỤC TOKEN CHUẨN CHO BÁO GIÁ
===================================================== */
export interface TokenDef {
  token: string
  key: string
  label: string
  group: 'customer' | 'contract' | 'group_row' | 'item_row' | 'totals' | 'deal_reg' | 'agency'
  sample: string
  description?: string
  isNumeric?: boolean
}

export const TOKEN_GROUPS: { id: TokenDef['group']; label: string; icon: string; color: string; desc: string }[] = [
  {
    id: 'customer',
    label: 'Thông tin Khách hàng (Header)',
    icon: 'KH',
    color: '#10b981',
    desc: 'Chèn vào vùng Header / Thông tin người nhận báo giá'
  },
  {
    id: 'contract',
    label: 'Header Công ty, Báo giá & Người lập',
    icon: 'BG',
    color: '#3b82f6',
    desc: 'Logo, công ty phát hành, số báo giá, ngày tháng và người phụ trách'
  },
  {
    id: 'group_row',
    label: 'Dòng Nhóm danh mục (Lặp)',
    icon: 'NHOM',
    color: '#f59e0b',
    desc: 'Đặt trên dòng mẫu Nhóm (I, II, III...). Nếu không dùng có thể bỏ trống'
  },
  {
    id: 'item_row',
    label: 'Dòng Sản phẩm / Hàng hóa (Lặp)',
    icon: 'SP',
    color: '#8b5cf6',
    desc: 'Đặt trên dòng mẫu Sản phẩm. Hệ thống tự nhân bản theo danh sách hàng'
  },
  {
    id: 'totals',
    label: 'Tổng tiền, Bằng chữ & Điều khoản',
    icon: 'TONG',
    color: '#ec4899',
    desc: 'Đặt ở vùng Tổng cộng cuối bảng, Số tiền bằng chữ và Điều khoản thương mại'
  },
  {
    id: 'deal_reg',
    label: 'Mẫu Deal Registration (DealReg)',
    icon: 'DR',
    color: '#f97316',
    desc: 'Các biến End User, Cơ hội dự án (Opportunity), Đối tác (Partner) và BOM USD dành cho mẫu Deal Registration'
  },
  {
    id: 'agency',
    label: 'Mẫu Báo Giá Đại Lý (Excel Đại Lý)',
    icon: 'DL',
    color: '#16a34a',
    desc: 'Các biến Nhập khẩu, Đơn giá LP USD, OFF NTS S, Đơn giá & Thành tiền sau OFF USD, Tỷ giá, VNĐ NTS S dành cho mẫu Đại lý'
  }
]

export const AVAILABLE_TOKENS: TokenDef[] = [
  // Group 1: Customer
  { token: '{{TEN_CONG_TY}}', key: 'TEN_CONG_TY', label: 'Tên công ty KH', group: 'customer', sample: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ DEMO' },
  { token: '{{TEN_KHACH_HANG}}', key: 'TEN_KHACH_HANG', label: 'Người nhận / Liên hệ', group: 'customer', sample: 'Anh Nguyễn Văn A' },
  { token: '{{MA_KHACH_HANG}}', key: 'MA_KHACH_HANG', label: 'Mã khách hàng', group: 'customer', sample: 'KH001' },
  { token: '{{DIA_CHI_KH}}', key: 'DIA_CHI_KH', label: 'Địa chỉ khách hàng', group: 'customer', sample: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' },
  { token: '{{MST_KH}}', key: 'MST_KH', label: 'Mã số thuế KH', group: 'customer', sample: '0312345678' },
  { token: '{{SDT_KH}}', key: 'SDT_KH', label: 'Số điện thoại KH', group: 'customer', sample: '0909 123 456' },
  { token: '{{MOBILE_KH}}', key: 'MOBILE_KH', label: 'Di động người liên hệ KH', group: 'customer', sample: '0909 888 999' },
  { token: '{{EMAIL_KH}}', key: 'EMAIL_KH', label: 'Email khách hàng', group: 'customer', sample: 'contact@demotech.vn' },
  { token: '{{FAX_KH}}', key: 'FAX_KH', label: 'Số Fax KH', group: 'customer', sample: '028 3822 9999' },
  { token: '{{CHUC_VU_KH}}', key: 'CHUC_VU_KH', label: 'Chức vụ người liên hệ KH', group: 'customer', sample: 'Trưởng phòng CNTT' },
  { token: '{{PHONG_BAN_KH}}', key: 'PHONG_BAN_KH', label: 'Phòng ban KH', group: 'customer', sample: 'Phòng IT' },
  { token: '{{WEBSITE_KH}}', key: 'WEBSITE_KH', label: 'Website khách hàng', group: 'customer', sample: 'www.demotech.vn' },

  // Group 2: Contract & Sender Header
  { token: '{{LOGO}}', key: 'LOGO', label: 'Logo công ty (Header)', group: 'contract', sample: '/logo1.png' },
  { token: '{{TEN_CONG_TY_BAN}}', key: 'TEN_CONG_TY_BAN', label: 'Tên công ty phát hành (Header)', group: 'contract', sample: 'NTS System Integration Corp.' },
  { token: '{{DIA_CHI_CONG_TY_BAN}}', key: 'DIA_CHI_CONG_TY_BAN', label: 'Địa chỉ công ty phát hành (Header)', group: 'contract', sample: '20 Tăng Bạt Hổ, P.11, Q. Bình Thạnh, TP.HCM' },
  { token: '{{NGAY_BAO_GIA}}', key: 'NGAY_BAO_GIA', label: 'Ngày báo giá (dd/mm/yyyy)', group: 'contract', sample: '18/10/2026' },
  { token: '{{NGAY}}', key: 'NGAY', label: 'Ngày (dd)', group: 'contract', sample: '18' },
  { token: '{{THANG}}', key: 'THANG', label: 'Tháng (mm)', group: 'contract', sample: '10' },
  { token: '{{NAM}}', key: 'NAM', label: 'Năm (yyyy)', group: 'contract', sample: '2026' },
  { token: '{{MA_HOP_DONG}}', key: 'MA_HOP_DONG', label: 'Mã hợp đồng / Báo giá', group: 'contract', sample: 'HD1729230000' },
  { token: '{{SO_HOP_DONG}}', key: 'SO_HOP_DONG', label: 'Số hợp đồng / Báo giá', group: 'contract', sample: 'HĐ125' },
  { token: '{{SO_PO}}', key: 'SO_PO', label: 'Số PO', group: 'contract', sample: 'PO-2026-088' },
  { token: '{{TEN_PO}}', key: 'TEN_PO', label: 'Tên PO', group: 'contract', sample: 'PO Gia hạn Kaspersky' },
  { token: '{{NOI_DUNG_PO}}', key: 'NOI_DUNG_PO', label: 'Nội dung Hợp đồng / PO', group: 'contract', sample: 'Gia hạn bản quyền phần mềm bảo mật' },
  { token: '{{GHI_CHU_BAO_GIA}}', key: 'GHI_CHU_BAO_GIA', label: 'Ghi chú báo giá / Hợp đồng', group: 'contract', sample: 'Báo giá ưu đãi dự án' },
  { token: '{{TRANG_THAI_HD}}', key: 'TRANG_THAI_HD', label: 'Trạng thái hợp đồng', group: 'contract', sample: 'Chính thức' },
  { token: '{{TRANG_THAI_TT}}', key: 'TRANG_THAI_TT', label: 'Trạng thái thanh toán', group: 'contract', sample: 'Chưa thanh toán đủ' },
  { token: '{{DON_VI_TIEN_TE}}', key: 'DON_VI_TIEN_TE', label: 'Đơn vị tiền tệ (VND/USD)', group: 'contract', sample: 'VND' },
  { token: '{{TI_GIA}}', key: 'TI_GIA', label: 'Tỉ giá quy đổi', group: 'contract', sample: '25,400', isNumeric: true },
  { token: '{{NGUOI_LAP}}', key: 'NGUOI_LAP', label: 'Tên người lập báo giá', group: 'contract', sample: 'Lê Phi Sơn' },
  { token: '{{CHUC_VU_NGUOI_LAP}}', key: 'CHUC_VU_NGUOI_LAP', label: 'Chức vụ người lập', group: 'contract', sample: 'Phó giám đốc NTS' },
  { token: '{{SDT_NGUOI_LAP}}', key: 'SDT_NGUOI_LAP', label: 'SĐT người lập', group: 'contract', sample: '090 813 7488' },
  { token: '{{EMAIL_NGUOI_LAP}}', key: 'EMAIL_NGUOI_LAP', label: 'Email người lập', group: 'contract', sample: 'info@ntssi.vn' },
  { token: '{{HIEU_LUC_BAO_GIA}}', key: 'HIEU_LUC_BAO_GIA', label: 'Hiệu lực báo giá', group: 'contract', sample: '15 ngày' },

  // Group 3: Repeating Category Group Row
  { token: '{{NHOM_STT}}', key: 'NHOM_STT', label: 'STT Nhóm (La Mã: I, II...)', group: 'group_row', sample: 'I' },
  { token: '{{NHOM_TEN}}', key: 'NHOM_TEN', label: 'Tên Nhóm danh mục', group: 'group_row', sample: 'PHẦN MỀM BẢO MẬT KASPERSKY' },
  { token: '{{NHOM_NCC}}', key: 'NHOM_NCC', label: 'Nhà cung cấp nhóm', group: 'group_row', sample: 'Kaspersky' },

  // Group 4: Repeating Product Item Row
  { token: '{{STT}}', key: 'STT', label: 'Số thứ tự SP (1, 2, 3...)', group: 'item_row', sample: '1' },
  { token: '{{MA_HANG}}', key: 'MA_HANG', label: 'Mã hàng (P/N)', group: 'item_row', sample: 'KL4867XARFS' },
  { token: '{{SKU}}', key: 'SKU', label: 'Mã SKU (SKU Code)', group: 'item_row', sample: 'XGS88S12-ZZ01' },
  { token: '{{TEN_HANG}}', key: 'TEN_HANG', label: 'Tên hàng hóa / Sản phẩm', group: 'item_row', sample: 'Kaspersky Endpoint Security for Business Select' },
  { token: '{{DESCRIPTION}}', key: 'DESCRIPTION', label: 'Description (Theo file gốc)', group: 'item_row', sample: 'Workspace Protection - 1-9 users - 12 MOS' },
  { token: '{{DIEN_GIAI}}', key: 'DIEN_GIAI', label: 'Diễn giải / Thông số (Features)', group: 'item_row', sample: 'Bản quyền phần mềm bảo mật hệ thống\n- Bảo vệ máy trạm và File Server\n- Hỗ trợ kỹ thuật 24/7' },
  { token: '{{MO_TA_CHUNG}}', key: 'MO_TA_CHUNG', label: 'Mô tả chung SP', group: 'item_row', sample: 'Giải pháp bảo mật Endpoint cho doanh nghiệp' },
  { token: '{{MO_TA_CHI_TIET}}', key: 'MO_TA_CHI_TIET', label: 'Mô tả chi tiết SP', group: 'item_row', sample: 'Tích hợp chống mã độc, tường lửa, kiểm soát thiết bị' },
  { token: '{{MA_NCC}}', key: 'MA_NCC', label: 'Mã nhà cung cấp', group: 'item_row', sample: 'NCC_KASPERSKY' },
  { token: '{{HANG}}', key: 'HANG', label: 'Hãng / Nhà cung cấp (Ten_nha_cung_cap)', group: 'item_row', sample: 'Kaspersky' },
  { token: '{{DANH_MUC}}', key: 'DANH_MUC', label: 'Danh mục SP', group: 'item_row', sample: 'SECURITY' },
  { token: '{{DVT}}', key: 'DVT', label: 'Đơn vị tính', group: 'item_row', sample: 'License' },
  { token: '{{THOI_HAN}}', key: 'THOI_HAN', label: 'Thời hạn License (License_duration)', group: 'item_row', sample: '1 Năm' },
  { token: '{{BAO_HANH}}', key: 'BAO_HANH', label: 'Thời gian bảo hành', group: 'item_row', sample: '12 tháng' },
  { token: '{{NGAY_BAT_DAU}}', key: 'NGAY_BAT_DAU', label: 'Ngày bắt đầu bản quyền', group: 'item_row', sample: '01/11/2026' },
  { token: '{{NGAY_KET_THUC}}', key: 'NGAY_KET_THUC', label: 'Ngày kết thúc bản quyền', group: 'item_row', sample: '31/10/2027' },
  { token: '{{LOAI_GIA_HAN}}', key: 'LOAI_GIA_HAN', label: 'Loại Gia hạn / Mua mới', group: 'item_row', sample: 'Gia hạn' },
  { token: '{{VOLUME}}', key: 'VOLUME', label: 'Volume / Số user', group: 'item_row', sample: '50-99 users' },
  { token: '{{SO_LUONG}}', key: 'SO_LUONG', label: 'Số lượng', group: 'item_row', sample: '50', isNumeric: true },
  { token: '{{LIST_PRICE}}', key: 'LIST_PRICE', label: 'Giá List Price', group: 'item_row', sample: '1,200,000', isNumeric: true },
  { token: '{{GIA_TIEU_CHUAN}}', key: 'GIA_TIEU_CHUAN', label: 'Giá Off Hãng', group: 'item_row', sample: '950,000', isNumeric: true },
  { token: '{{PHAN_TRAM_OFF_HANG}}', key: 'PHAN_TRAM_OFF_HANG', label: '% Off Hãng', group: 'item_row', sample: '20%' },
  { token: '{{GIA_NHAP}}', key: 'GIA_NHAP', label: 'Giá nhập', group: 'item_row', sample: '800,000', isNumeric: true },
  { token: '{{GIA_HARDWARE}}', key: 'GIA_HARDWARE', label: 'Giá Hardware', group: 'item_row', sample: '15,000,000', isNumeric: true },
  { token: '{{PHAN_TRAM_OFF}}', key: 'PHAN_TRAM_OFF', label: '% Off Khách', group: 'item_row', sample: '10%' },
  { token: '{{DON_GIA_KH}}', key: 'DON_GIA_KH', label: 'Đơn giá chào KH', group: 'item_row', sample: '1,080,000', isNumeric: true },
  { token: '{{DON_GIA_USD}}', key: 'DON_GIA_USD', label: 'Đơn giá USD', group: 'item_row', sample: '42.50', isNumeric: true },
  { token: '{{GIA_TIEU_CHUAN_USD}}', key: 'GIA_TIEU_CHUAN_USD', label: 'Giá tiêu chuẩn USD', group: 'item_row', sample: '38.00', isNumeric: true },
  { token: '{{GIA_NHAP_USD}}', key: 'GIA_NHAP_USD', label: 'Giá nhập USD', group: 'item_row', sample: '32.00', isNumeric: true },
  { token: '{{TT_TRUOC_THUE}}', key: 'TT_TRUOC_THUE', label: 'Thành tiền trước thuế', group: 'item_row', sample: '54,000,000', isNumeric: true },
  { token: '{{PHAN_TRAM_VAT}}', key: 'PHAN_TRAM_VAT', label: '% Thuế VAT', group: 'item_row', sample: '8%' },
  { token: '{{TIEN_VAT}}', key: 'TIEN_VAT', label: 'Tiền thuế VAT (dòng)', group: 'item_row', sample: '4,320,000', isNumeric: true },
  { token: '{{TT_SAU_THUE}}', key: 'TT_SAU_THUE', label: 'Thành tiền sau thuế', group: 'item_row', sample: '58,320,000', isNumeric: true },
  { token: '{{GHI_CHU_SP}}', key: 'GHI_CHU_SP', label: 'Ghi chú sản phẩm', group: 'item_row', sample: 'Giao hàng qua email' },

  // Group 5: Totals & Commercial Terms
  { token: '{{TONG_TRUOC_THUE}}', key: 'TONG_TRUOC_THUE', label: 'Tổng cộng trước thuế', group: 'totals', sample: '84,000,000', isNumeric: true },
  { token: '{{TONG_TIEN_VAT}}', key: 'TONG_TIEN_VAT', label: 'Tổng tiền thuế VAT', group: 'totals', sample: '6,720,000', isNumeric: true },
  { token: '{{TONG_SAU_THUE}}', key: 'TONG_SAU_THUE', label: 'Tổng thanh toán sau thuế', group: 'totals', sample: '90,720,000', isNumeric: true },
  { token: '{{TONG_MUC_OFF}}', key: 'TONG_MUC_OFF', label: 'Tổng tiền chiết khấu/Off', group: 'totals', sample: '6,000,000', isNumeric: true },
  { token: '{{TONG_GIAM_GIA}}', key: 'TONG_GIAM_GIA', label: 'Tổng giảm giá', group: 'totals', sample: '2,000,000', isNumeric: true },
  { token: '{{DA_THANH_TOAN}}', key: 'DA_THANH_TOAN', label: 'Số tiền đã thanh toán', group: 'totals', sample: '30,000,000', isNumeric: true },
  { token: '{{CON_PHAI_THU}}', key: 'CON_PHAI_THU', label: 'Số tiền còn phải thu', group: 'totals', sample: '60,720,000', isNumeric: true },
  { token: '{{CONG_NO_CU}}', key: 'CONG_NO_CU', label: 'Công nợ cũ', group: 'totals', sample: '0', isNumeric: true },
  { token: '{{CHIET_KHAU_TONG}}', key: 'CHIET_KHAU_TONG', label: 'Chiết khấu tổng trước thuế (Gross Com)', group: 'totals', sample: '5,000,000', isNumeric: true },
  { token: '{{PHAN_TRAM_CK_TONG}}', key: 'PHAN_TRAM_CK_TONG', label: '% Chiết khấu tổng trước thuế', group: 'totals', sample: '5%' },
  { token: '{{SO_TIEN_BANG_CHU}}', key: 'SO_TIEN_BANG_CHU', label: 'Số tiền bằng chữ (Việt/Anh)', group: 'totals', sample: 'Chín mươi triệu bảy trăm hai mươi nghìn đồng chẵn' },
  { token: '{{DIEU_KHOAN}}', key: 'DIEU_KHOAN', label: 'Khối Điều khoản thương mại', group: 'totals', sample: '1. Giá trên đã bao gồm thuế VAT.\n2. Thanh toán 100% trong vòng 15 ngày.\n3. Bảo hành theo tiêu chuẩn hãng.' },

  // Group 6: Deal Registration (DealReg)
  { token: '{{TEN_CONG_TY_EN}}', key: 'TEN_CONG_TY_EN', label: 'End user Company Name* (Tên công ty KH Tiếng Anh)', group: 'deal_reg', sample: 'DEMO TECHNOLOGY CORP' },
  { token: '{{TEN_CONG_TY_VN}}', key: 'TEN_CONG_TY_VN', label: 'End user Company Name Vietnamese* (Tên công ty KH Tiếng Việt)', group: 'deal_reg', sample: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ DEMO' },
  { token: '{{DR_COUNTRY}}', key: 'DR_COUNTRY', label: 'Country* (Quốc gia KH - DealReg)', group: 'deal_reg', sample: 'VIET NAM' },
  { token: '{{DR_EXISTING_CUST}}', key: 'DR_EXISTING_CUST', label: 'Existing Customer? (Khách hàng hiện hữu: Yes/No)', group: 'deal_reg', sample: 'Yes' },
  { token: '{{DR_SIZE}}', key: 'DR_SIZE', label: 'Company Size* (Quy mô số lượng nhân sự KH)', group: 'deal_reg', sample: '100' },
  { token: '{{DR_BUDGET}}', key: 'DR_BUDGET', label: 'Estimated Customer Budget in USD (Ngân sách dự kiến USD)', group: 'deal_reg', sample: '3,500.00', isNumeric: true },
  { token: '{{DR_CLOSE_DATE}}', key: 'DR_CLOSE_DATE', label: 'Estimated Closure Date (Ngày dự kiến chốt Deal dd/mm/yyyy)', group: 'deal_reg', sample: '30/10/2026' },
  { token: '{{DR_COMP}}', key: 'DR_COMP', label: 'Competition* (Đối thủ cạnh tranh)', group: 'deal_reg', sample: 'Fortinet' },
  { token: '{{DR_POC}}', key: 'DR_POC', label: 'Proposed POC Schedule (Lịch POC dự kiến)', group: 'deal_reg', sample: 'Q4/2026' },
  { token: '{{DR_PARTNER_NAME}}', key: 'DR_PARTNER_NAME', label: 'Partner Company Name* (Tên công ty Đối tác / Partner)', group: 'deal_reg', sample: 'Nam Truong Son System Integration Corp' },
  { token: '{{DR_PARTNER_ADDRESS}}', key: 'DR_PARTNER_ADDRESS', label: 'Partner Address* (Địa chỉ công ty Đối tác / Partner)', group: 'deal_reg', sample: '55/10 Trần Đình Xu, P. Cầu Kho, Quận 1, TP.HCM' },
  { token: '{{DR_AM_NAME}}', key: 'DR_AM_NAME', label: 'Account Manager Name* (Họ tên AM phụ trách)', group: 'deal_reg', sample: 'LÊ PHI SƠN' },
  { token: '{{DR_AM_EMAIL}}', key: 'DR_AM_EMAIL', label: 'Account Manager Email* (Email AM phụ trách)', group: 'deal_reg', sample: 'sonlp@nts.com.vn' },
  { token: '{{DR_AM_PHONE}}', key: 'DR_AM_PHONE', label: 'Account Manager Phone* (SĐT AM phụ trách)', group: 'deal_reg', sample: '090 8137488' },
  { token: '{{DR_REMARKS}}', key: 'DR_REMARKS', label: 'Remarks (Ghi chú dự án / Yêu cầu kỹ thuật DealReg)', group: 'deal_reg', sample: 'Mua sắm độc lập, không theo dự án' },
  { token: '{{TT_TRUOC_THUE_USD}}', key: 'TT_TRUOC_THUE_USD', label: 'Estimated Value in USD (Thành tiền SP trước thuế USD - Dòng SP lặp)', group: 'deal_reg', sample: '2,125.98', isNumeric: true },
  { token: '{{TONG_TRUOC_THUE_USD}}', key: 'TONG_TRUOC_THUE_USD', label: 'TOTAL Estimated Value in USD (Tổng cộng trước thuế USD - Dòng Tổng)', group: 'deal_reg', sample: '3,307.09', isNumeric: true },

  // Group 7: Agency / Dealer Quote (Mẫu Báo Giá Đại Lý)
  { token: '{{DL_NHAP_KHAU}}', key: 'DL_NHAP_KHAU', label: 'Nhập khẩu (USD) - Dòng SP Đại lý', group: 'agency', sample: '340.00', isNumeric: true },
  { token: '{{DL_DON_GIA_LP}}', key: 'DL_DON_GIA_LP', label: 'Đơn giá LP (USD) - Dòng SP Đại lý', group: 'agency', sample: '2,479.50', isNumeric: true },
  { token: '{{DL_OFF_NTS}}', key: 'DL_OFF_NTS', label: 'OFF NTS S (%) - Dòng SP Đại lý', group: 'agency', sample: '35%' },
  { token: '{{DL_DON_GIA_SAU_OFF}}', key: 'DL_DON_GIA_SAU_OFF', label: 'Đơn giá sau OFF + nhập khẩu (USD) - Dòng SP Đại lý', group: 'agency', sample: '1,951.68', isNumeric: true },
  { token: '{{DL_THANH_TIEN_USD}}', key: 'DL_THANH_TIEN_USD', label: 'Thành tiền sau OFF (USD) - Dòng SP Đại lý', group: 'agency', sample: '1,951.68', isNumeric: true },
  { token: '{{DL_TY_GIA}}', key: 'DL_TY_GIA', label: 'Tỷ giá quy đổi - Dòng SP Đại lý', group: 'agency', sample: '26,600', isNumeric: true },
  { token: '{{DL_VND_NTS}}', key: 'DL_VND_NTS', label: 'VNĐ NTS S (Thành tiền trước thuế VNĐ) - Dòng SP Đại lý', group: 'agency', sample: '51,914,555', isNumeric: true },
  { token: '{{DL_TIEN_VAT}}', key: 'DL_TIEN_VAT', label: 'VAT 8% (Tiền thuế VNĐ) - Dòng SP Đại lý', group: 'agency', sample: '4,153,164', isNumeric: true },
  { token: '{{DL_TONG_CONG_VAT}}', key: 'DL_TONG_CONG_VAT', label: 'Tổng Cộng + VAT (VNĐ) - Dòng SP Đại lý', group: 'agency', sample: '56,067,719', isNumeric: true },
  { token: '{{DL_TONG_USD}}', key: 'DL_TONG_USD', label: 'Tổng cộng Thành tiền sau OFF (USD) - Dòng Tổng Đại lý', group: 'agency', sample: '3,222.75', isNumeric: true },
  { token: '{{DL_TONG_VND}}', key: 'DL_TONG_VND', label: 'Tổng cộng VNĐ NTS S (VNĐ) - Dòng Tổng Đại lý', group: 'agency', sample: '85,725,150', isNumeric: true },
  { token: '{{DL_TONG_VAT}}', key: 'DL_TONG_VAT', label: 'Tổng cộng VAT (VNĐ) - Dòng Tổng Đại lý', group: 'agency', sample: '4,153,164', isNumeric: true },
  { token: '{{DL_TONG_SAU_THUE}}', key: 'DL_TONG_SAU_THUE', label: 'Tổng cộng + VAT (VNĐ) - Dòng Tổng Đại lý', group: 'agency', sample: '89,878,314', isNumeric: true }
]

// Map legacy field names (from availableExcelFields) to item tokens
export const LEGACY_FIELD_TO_TOKEN: Record<string, string> = {
  stt: '{{STT}}',
  pn: '{{MA_HANG}}',
  sku: '{{SKU}}',
  sku_code: '{{SKU}}',
  ten_hang: '{{TEN_HANG}}',
  description: '{{DESCRIPTION}}',
  features: '{{DIEN_GIAI}}',
  mo_ta: '{{DIEN_GIAI}}',
  hang: '{{HANG}}',
  danh_muc: '{{DANH_MUC}}',
  dvt: '{{DVT}}',
  license_duration: '{{THOI_HAN}}',
  thoi_gian_bao_hanh: '{{BAO_HANH}}',
  volume: '{{VOLUME}}',
  so_luong: '{{SO_LUONG}}',
  list_price: '{{LIST_PRICE}}',
  gia_tieu_chuan: '{{GIA_TIEU_CHUAN}}',
  muc_off_hang: '{{PHAN_TRAM_OFF_HANG}}',
  don_gia_nhap: '{{GIA_NHAP}}',
  muc_off: '{{PHAN_TRAM_OFF}}',
  don_gia: '{{DON_GIA_KH}}',
  don_gia_kh: '{{DON_GIA_KH}}',
  truoc_thue: '{{TT_TRUOC_THUE}}',
  thue_vat: '{{PHAN_TRAM_VAT}}',
  vat: '{{TIEN_VAT}}',
  sau_thue: '{{TT_SAU_THUE}}',
  ghi_chu: '{{GHI_CHU_SP}}',
  don_vi_tien_te: '{{DON_VI_TIEN_TE}}',
  ti_gia: '{{TI_GIA}}',
  dl_nhap_khau: '{{DL_NHAP_KHAU}}',
  dl_don_gia_lp: '{{DL_DON_GIA_LP}}',
  dl_off_nts: '{{DL_OFF_NTS}}',
  dl_don_gia_sau_off: '{{DL_DON_GIA_SAU_OFF}}',
  dl_thanh_tien_usd: '{{DL_THANH_TIEN_USD}}',
  dl_ty_gia: '{{DL_TY_GIA}}',
  dl_vnd_nts: '{{DL_VND_NTS}}',
  dl_tien_vat: '{{DL_TIEN_VAT}}',
  dl_tong_cong_vat: '{{DL_TONG_CONG_VAT}}'
}

/* =====================================================
   2. CHUYỂN SỐ THÀNH CHỮ (VIỆT / ANH)
===================================================== */
const VN_DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']

function readTripleVN(n: number, showZeroHundred: boolean): string {
  const tram = Math.floor(n / 100)
  const chuc = Math.floor((n % 100) / 10)
  const donvi = n % 10
  if (tram === 0 && chuc === 0 && donvi === 0) return ''

  let res = ''
  if (tram !== 0 || showZeroHundred) {
    res += VN_DIGITS[tram] + ' trăm '
  }
  if (chuc === 0) {
    if (donvi !== 0 && (tram !== 0 || showZeroHundred)) {
      res += 'lẻ ' + VN_DIGITS[donvi]
    } else if (donvi !== 0) {
      res += VN_DIGITS[donvi]
    }
  } else if (chuc === 1) {
    res += 'mười'
    if (donvi === 5) res += ' lăm'
    else if (donvi !== 0) res += ' ' + VN_DIGITS[donvi]
  } else {
    res += VN_DIGITS[chuc] + ' mươi'
    if (donvi === 1) res += ' mốt'
    else if (donvi === 4) res += ' tư'
    else if (donvi === 5) res += ' lăm'
    else if (donvi !== 0) res += ' ' + VN_DIGITS[donvi]
  }
  return res.trim()
}

export function numberToWordsVN(amount: number, currency = 'VND'): string {
  const isUSD = String(currency || 'VND').toUpperCase().includes('USD')
  if (!amount || isNaN(amount) || amount <= 0) {
    return isUSD ? 'Không đô la Mỹ' : 'Không đồng'
  }

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  const intPart = Math.floor(Math.abs(amount))
  const decPart = Math.round((Math.abs(amount) - intPart) * 100)

  const groups: number[] = []
  let temp = intPart
  while (temp > 0) {
    groups.push(temp % 1000)
    temp = Math.floor(temp / 1000)
  }

  const parts: string[] = []
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]
    if (g > 0) {
      const showZero = i < groups.length - 1
      const w = readTripleVN(g, showZero)
      if (w) {
        parts.push(w + (units[i] ? ' ' + units[i] : ''))
      }
    }
  }

  let sentence = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (!sentence) sentence = 'không'
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)

  if (isUSD) {
    if (decPart > 0) {
      const centsWord = readTripleVN(decPart, false)
      return `${sentence} đô la Mỹ và ${centsWord} xu`
    }
    return `${sentence} đô la Mỹ chẵn`
  } else {
    return `${sentence} đồng chẵn`
  }
}

/* =====================================================
   3. SCHEMA MẪU IN THIẾT LẬP (`mau_in_thiet_lap`)
===================================================== */
export interface GridCellStyle {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  fontSize?: number
  fontFamily?: string
  color?: string
  bgColor?: string
  align?: 'left' | 'center' | 'right'
  valign?: 'top' | 'middle' | 'bottom'
  border?: boolean
  borderColor?: string
  wrapText?: boolean
  numFmt?: string
}

export interface GridCellData {
  value: string
  style?: GridCellStyle
}

export interface GridMerge {
  top: number    // 1-indexed row
  left: number   // 1-indexed col
  bottom: number // 1-indexed row
  right: number  // 1-indexed col
}

export interface PrintTemplateConfig {
  id: string
  ten_mau: string
  ghi_chu: string
  loai_mau: 'imported_excel' | 'web_builder'
  mac_dinh: boolean
  ngay_tao: string
  ngay_cap_nhat: string
  link_file_goc: string // URL Cloudinary hoặc '/template_goc.xlsx' hoặc ''
  source_upload_id?: string // ID từ bảng upload_file_mau nếu đồng bộ sang

  cau_hinh_trang: {
    kho_giay: 'A4' | 'A3' | 'Letter'
    huong_giay: 'portrait' | 'landscape'
    font_mac_dinh: string
    co_chu_mac_dinh: number
    padding_trang: number
    logo_url?: string
    logo_width?: number
    logo_width_pct?: number
    logo_height?: number
    logo_trai: string
    logo_phai: string
    ty_le_logo: number
    hien_thi_logo: boolean
    hien_thi_line_mau: boolean
  }

  thong_tin_nguoi_lap: {
    ten_nguoi_lap: string
    chuc_vu: string
    so_dien_thoai: string
    email: string
    ten_cong_ty_ban: string
    dia_chi_cong_ty_ban: string
    hieu_luc_bao_gia: string
  }

  mapping_vung: {
    dong_tieu_de_bang: number // 1-indexed
    dong_mau_nhom: number     // 1-indexed (0 = không xuất dòng nhóm)
    dong_mau_san_pham: number // 1-indexed
    danh_sach_dong_tong: number[] // 1-indexed rows
    dong_dieu_khoan: number   // 1-indexed
    dong_chu_ky: number       // 1-indexed
  }

  cau_hinh_cot_bang: {
    colIndex: number
    header: string
    field: string
    token?: string
    width?: number
  }[]

  // Dữ liệu lưới thiết kế trên web & chế độ Code song song (HTML/CSS/JS)
  che_do_soan_thao?: 'manual' | 'code'
  custom_css?: string
  custom_js?: string
  so_dong: number
  so_cot: number
  col_widths: Record<number, number> // 1-indexed col -> width in px/chars
  row_heights: Record<number, number> // 1-indexed row -> height in pt
  merges: GridMerge[]
  grid_cells: Record<string, GridCellData> // key: "R_C" (e.g. "7_1" for A7)
}

export function colIndexToLetter(col: number): string {
  let temp = col
  let letter = ''
  while (temp > 0) {
    const mod = (temp - 1) % 26
    letter = String.fromCharCode(65 + mod) + letter
    temp = Math.floor((temp - mod) / 26)
  }
  return letter
}

export function cellCoordToAddress(r: number, c: number): string {
  return `${colIndexToLetter(c)}${r}`
}

export function formatNowVN(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/* =====================================================
   4. KHỞI TẠO MẪU CHUẨN NTS & MẪU TRẮNG
===================================================== */
export function createStarterTemplateConfig(customId?: string, name = 'Mẫu Báo Giá Chuẩn NTS'): PrintTemplateConfig {
  const id = customId || `MINTL_${Date.now()}`
  const now = formatNowVN()
  const cells: Record<string, GridCellData> = {}
  const setCell = (r: number, c: number, value: string, style: GridCellStyle = {}) => {
    cells[`${r}_${c}`] = { value, style }
  }

  // Row 1: Single Logo directly inside the grid (A1:I1 — matches top banner in baogiachuan.xlsx)
  setCell(1, 1, '{{LOGO}}', { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#0070c0', align: 'left', valign: 'middle' })

  // Row 2: Kính gởi & Ngày báo giá (Row 5 in baogiachuan.xlsx)
  setCell(2, 1, 'Kính gởi : {{TEN_CONG_TY}}', { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true })
  setCell(2, 7, 'Ngày : {{NGAY_BAO_GIA}}', { italic: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'right', valign: 'middle', wrapText: true })

  // Row 3: Địa chỉ công ty KH (Row 6 in baogiachuan.xlsx)
  setCell(3, 1, 'Địa chỉ : {{DIA_CHI_KH}}', { fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true })

  // Row 4: Người nhận (Row 7 in baogiachuan.xlsx)
  setCell(4, 1, 'Người nhận : {{TEN_KHACH_HANG}}', { fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true })

  // Row 5: BẢNG BÁO GIÁ (Row 9 in baogiachuan.xlsx — 20pt Bold Blue #0000ff)
  setCell(5, 1, 'BẢNG BÁO GIÁ', { bold: true, fontSize: 20, fontFamily: 'Arial', color: '#0000ff', align: 'center', valign: 'middle' })

  // Row 6: Lời mở đầu (Row 10 in baogiachuan.xlsx)
  setCell(6, 1, 'Công ty Nam Trường Sơn trân trọng gởi đến Quý khách hàng bảng báo giá như sau:', { fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true })

  // Row 7: Table Header (9 columns A..I — Row 11 in baogiachuan.xlsx)
  const headers = [
    { c: 1, text: 'Stt' },
    { c: 2, text: 'Tên hàng' },
    { c: 3, text: 'Diễn giải' },
    { c: 4, text: 'S.L' },
    { c: 5, text: 'Đơn vị' },
    { c: 6, text: 'Đơn giá\n({{DON_VI_TIEN_TE}})' },
    { c: 7, text: 'Thành tiền\n({{DON_VI_TIEN_TE}})' },
    { c: 8, text: 'Thuế\nVAT' },
    { c: 9, text: 'Thành tiền sau VAT' }
  ]
  headers.forEach(h => {
    setCell(7, h.c, h.text, {
      bold: true,
      fontSize: 11,
      fontFamily: 'Arial',
      color: '#000000',
      bgColor: '#ccffcc',
      align: 'center',
      valign: 'middle',
      border: true,
      wrapText: true
    })
  })

  // Row 8: Repeating Item Row (Rows 12-13 in baogiachuan.xlsx)
  const itemTokens: { c: number; val: string; align: 'left' | 'center' | 'right'; bold?: boolean; fontSize?: number }[] = [
    { c: 1, val: '{{STT}}', align: 'center', bold: true, fontSize: 11 },
    { c: 2, val: '{{TEN_HANG}}', align: 'left', bold: false, fontSize: 11 },
    { c: 3, val: '{{DIEN_GIAI}}', align: 'left', bold: false, fontSize: 10 },
    { c: 4, val: '{{SO_LUONG}}', align: 'center', bold: true, fontSize: 11 },
    { c: 5, val: '{{DVT}}', align: 'center', bold: false, fontSize: 11 },
    { c: 6, val: '{{DON_GIA_KH}}', align: 'right', bold: true, fontSize: 11 },
    { c: 7, val: '{{TT_TRUOC_THUE}}', align: 'right', bold: true, fontSize: 11 },
    { c: 8, val: '{{TIEN_VAT}}', align: 'right', bold: true, fontSize: 11 },
    { c: 9, val: '{{TT_SAU_THUE}}', align: 'right', bold: true, fontSize: 11 }
  ]
  itemTokens.forEach(it => {
    setCell(8, it.c, it.val, {
      bold: it.bold,
      fontSize: it.fontSize || 11,
      fontFamily: 'Arial',
      color: '#000000',
      align: it.align,
      valign: 'middle',
      border: true,
      wrapText: true
    })
  })

  // Row 9: Total Row (Row 14 in baogiachuan.xlsx)
  setCell(9, 1, 'TỔNG CỘNG', { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', bgColor: '#ffff00', align: 'center', valign: 'middle', border: true, wrapText: true })
  for (let c = 2; c <= 6; c++) {
    setCell(9, c, '', { bold: true, fontSize: 11, fontFamily: 'Arial', bgColor: '#ffff00', border: true })
  }
  setCell(9, 7, '{{TONG_TRUOC_THUE}}', { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', bgColor: '#ffff00', align: 'right', valign: 'middle', border: true, wrapText: true })
  setCell(9, 8, '{{TONG_TIEN_VAT}}', { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', bgColor: '#ffff00', align: 'right', valign: 'middle', border: true, wrapText: true })
  setCell(9, 9, '{{TONG_SAU_THUE}}', { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', bgColor: '#ffff00', align: 'right', valign: 'middle', border: true, wrapText: true })

  // Row 10: Terms Header (Row 16 in baogiachuan.xlsx)
  setCell(10, 1, 'CÁC ĐIỀU KHOẢN THƯƠNG MẠI KHÁC:', { bold: true, underline: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle' })

  // Row 11: Commercial Terms Block pulled from schema `dieu_khoan` (Rows 17-23 in baogiachuan.xlsx)
  setCell(11, 1, '1, 2...', { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'center', valign: 'middle' })
  setCell(11, 2, '{{DIEU_KHOAN}}', { fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true })

  // Row 12: Order Confirmation Note (Row 24 in baogiachuan.xlsx)
  setCell(
    12,
    2,
    '- Đơn đặt hàng chỉ được tiến hành sau khi Bên Mua Hàng đồng ý với các điều khoản nêu trên bằng cách\n  kí và đóng dấu vào Xác nhận đơn hàng này và gởi lại cho Bên Bán hàng',
    { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true }
  )

  // Row 13-15: Signature Block (Rows 26-28 in baogiachuan.xlsx)
  setCell(13, 1, 'Trân Trọng,', { bold: true, fontSize: 10, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle' })
  setCell(13, 7, 'Xác nhận đặt hàng', { bold: true, fontSize: 10, fontFamily: 'Arial', color: '#000000', align: 'center', valign: 'middle' })

  setCell(14, 1, '', { fontSize: 10, fontFamily: 'Arial', align: 'left' })

  setCell(15, 1, '{{NGUOI_LAP}}  -  {{SDT_NGUOI_LAP}}', { bold: true, fontSize: 10, fontFamily: 'Arial', color: '#0000cc', align: 'left', valign: 'middle' })

  // Row 16-18: Company Footer (Rows 30-32 in baogiachuan.xlsx)
  setCell(16, 1, '{{TEN_CONG_TY_BAN}}', { bold: true, fontSize: 9, fontFamily: 'Arial', color: '#002060', align: 'left', valign: 'middle' })
  setCell(17, 1, 'Add: {{DIA_CHI_CONG_TY_BAN}}', { fontSize: 9, fontFamily: 'Arial', color: '#0070c0', align: 'left', valign: 'middle' })
  setCell(18, 1, 'T:  (028) 3841 8080 | F:  (028) 3841 5555 | E: {{EMAIL_NGUOI_LAP}} | W: www.ntssi.vn', { underline: true, fontSize: 11, fontFamily: 'Calibri', color: '#0563c1', align: 'left', valign: 'middle' })

  return {
    id,
    ten_mau: name,
    ghi_chu: 'Mẫu báo giá chuẩn NTS (baogiachuan.xlsx - 9 cột A4 Dọc, cố định 1 trang ngang)',
    loai_mau: 'imported_excel',
    mac_dinh: false,
    ngay_tao: now,
    ngay_cap_nhat: now,
    link_file_goc: '/baogiachuan.xlsx',
    cau_hinh_trang: {
      kho_giay: 'A4',
      huong_giay: 'portrait',
      font_mac_dinh: 'Arial',
      co_chu_mac_dinh: 11,
      padding_trang: 16,
      logo_url: '/logo1.png',
      logo_width: 700,
      logo_width_pct: 100,
      logo_height: 78,
      logo_trai: '/logo1.png',
      logo_phai: '/logo2.png',
      ty_le_logo: 100,
      hien_thi_logo: true,
      hien_thi_line_mau: false
    },
    thong_tin_nguoi_lap: {
      ten_nguoi_lap: 'Le Phi Son',
      chuc_vu: 'Phó giám đốc NTS',
      so_dien_thoai: '090 813 7488',
      email: 'info@ntssi.vn',
      ten_cong_ty_ban: 'NTS System Integration Corp.',
      dia_chi_cong_ty_ban: '20 Tang Bat Ho Street, Ward 11, Binh Thanh District, Ho Chi Minh City, VN',
      hieu_luc_bao_gia: '07 ngày'
    },
    mapping_vung: {
      dong_tieu_de_bang: 7,
      dong_mau_nhom: 0,
      dong_mau_san_pham: 8,
      danh_sach_dong_tong: [9],
      dong_dieu_khoan: 11,
      dong_chu_ky: 13
    },
    cau_hinh_cot_bang: [
      { colIndex: 1, header: 'Stt', field: 'stt', token: '{{STT}}', width: 5 },
      { colIndex: 2, header: 'Tên hàng', field: 'ten_hang', token: '{{TEN_HANG}}', width: 21 },
      { colIndex: 3, header: 'Diễn giải', field: 'features', token: '{{DIEN_GIAI}}', width: 46 },
      { colIndex: 4, header: 'S.L', field: 'so_luong', token: '{{SO_LUONG}}', width: 5 },
      { colIndex: 5, header: 'Đơn vị', field: 'dvt', token: '{{DVT}}', width: 7 },
      { colIndex: 6, header: 'Đơn giá\n({{DON_VI_TIEN_TE}})', field: 'don_gia_kh', token: '{{DON_GIA_KH}}', width: 14 },
      { colIndex: 7, header: 'Thành tiền\n({{DON_VI_TIEN_TE}})', field: 'truoc_thue', token: '{{TT_TRUOC_THUE}}', width: 14 },
      { colIndex: 8, header: 'Thuế\nVAT', field: 'vat', token: '{{TIEN_VAT}}', width: 9 },
      { colIndex: 9, header: 'Thành tiền sau VAT', field: 'sau_thue', token: '{{TT_SAU_THUE}}', width: 14 }
    ],
    so_dong: 18,
    so_cot: 9,
    col_widths: { 1: 38, 2: 152, 3: 280, 4: 36, 5: 52, 6: 102, 7: 104, 8: 70, 9: 104 },
    row_heights: { 1: 84, 2: 22, 3: 22, 4: 24, 5: 36, 6: 24, 7: 54, 8: 64, 9: 34, 10: 24, 11: 48, 12: 38, 13: 22, 14: 44, 15: 22, 16: 20, 17: 20, 18: 22 },
    merges: [
      { top: 1, left: 1, bottom: 1, right: 9 },
      { top: 2, left: 1, bottom: 2, right: 6 },
      { top: 2, left: 7, bottom: 2, right: 9 },
      { top: 3, left: 1, bottom: 3, right: 9 },
      { top: 4, left: 1, bottom: 4, right: 9 },
      { top: 5, left: 1, bottom: 5, right: 9 },
      { top: 6, left: 1, bottom: 6, right: 9 },
      { top: 9, left: 1, bottom: 9, right: 6 },
      { top: 10, left: 1, bottom: 10, right: 9 },
      { top: 11, left: 2, bottom: 11, right: 9 },
      { top: 12, left: 2, bottom: 12, right: 9 },
      { top: 13, left: 1, bottom: 13, right: 3 },
      { top: 13, left: 7, bottom: 13, right: 9 },
      { top: 14, left: 1, bottom: 14, right: 5 },
      { top: 15, left: 1, bottom: 15, right: 5 },
      { top: 16, left: 1, bottom: 16, right: 9 },
      { top: 17, left: 1, bottom: 17, right: 9 },
      { top: 18, left: 1, bottom: 18, right: 9 }
    ],
    grid_cells: cells
  }
}

export function normalizeLegacyTokenSyntax(val: string): string {
  if (!val || !val.includes('{{')) return val
  return val
    .replace(/\{\{\s*tên công ty\s*\}\}/gi, '{{TEN_CONG_TY}}')
    .replace(/\{\{\s*ten cong ty\s*\}\}/gi, '{{TEN_CONG_TY}}')
    .replace(/\{\{\s*địa chỉ công ty\s*\}\}/gi, '{{DIA_CHI_KH}}')
    .replace(/\{\{\s*dia chi cong ty\s*\}\}/gi, '{{DIA_CHI_KH}}')
    .replace(/\{\{\s*địa chỉ khách hàng\s*\}\}/gi, '{{DIA_CHI_KH}}')
    .replace(/\{\{\s*tên khách hàng\s*\}\}/gi, '{{TEN_KHACH_HANG}}')
    .replace(/\{\{\s*ten khach hang\s*\}\}/gi, '{{TEN_KHACH_HANG}}')
    .replace(/\{\{\s*người nhận\s*\}\}/gi, '{{TEN_KHACH_HANG}}')
    .replace(/\{\{\s*ngày báo giá\s*\}\}/gi, '{{NGAY_BAO_GIA}}')
    .replace(/\{\{\s*điều khoản\s*\}\}/gi, '{{DIEU_KHOAN}}')
    .replace(/\{\{\s*description\s*\}\}/gi, '{{DESCRIPTION}}')
    .replace(/\{\{\s*sku(?:[\s_]*code)?\s*\}\}/gi, '{{SKU}}')
}

export function findTableSttColumn(tpl: PrintTemplateConfig): number {
  const totalCols = Math.max(tpl.so_cot || 9, 1)
  const itemR = tpl.mapping_vung?.dong_mau_san_pham || 0
  const headerR = tpl.mapping_vung?.dong_tieu_de_bang || 0
  if (itemR > 0) {
    for (let c = 1; c <= totalCols; c++) {
      if (tpl.grid_cells?.[`${itemR}_${c}`]?.value?.includes('{{STT}}')) {
        return c
      }
    }
  }
  if (headerR > 0) {
    for (let c = 1; c <= totalCols; c++) {
      const hVal = (tpl.grid_cells?.[`${headerR}_${c}`]?.value || '').trim().toUpperCase()
      if (hVal === 'STT' || hVal === 'TT' || hVal === 'NO' || hVal === 'NO.') {
        return c
      }
    }
  }
  const colCfg = (tpl.cau_hinh_cot_bang || []).find(
    c => c.token === '{{STT}}' || c.key === 'stt' || (c.header || '').trim().toUpperCase() === 'STT'
  )
  if (colCfg && colCfg.colIndex && colCfg.colIndex >= 1 && colCfg.colIndex <= totalCols) {
    return colCfg.colIndex
  }
  return 1
}

export function normalizeNumericIndexMap(rawMap: any, fallbackMap: Record<number, number> = {}): Record<number, number> {
  let source = rawMap
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source)
    } catch {
      source = null
    }
  }
  const result: Record<number, number> = {}
  if (Array.isArray(source)) {
    source.forEach((val, idx) => {
      if (idx >= 1 && val !== null && val !== undefined && !Number.isNaN(Number(val))) {
        result[idx] = Number(val)
      }
    })
  } else if (source && typeof source === 'object') {
    Object.entries(source).forEach(([k, val]) => {
      const idx = Number(k)
      if (idx >= 1 && val !== null && val !== undefined && !Number.isNaN(Number(val))) {
        result[idx] = Number(val)
      }
    })
  }
  if (Object.keys(result).length === 0 && fallbackMap && typeof fallbackMap === 'object') {
    Object.entries(fallbackMap).forEach(([k, val]) => {
      const idx = Number(k)
      if (idx >= 1 && val !== null && val !== undefined && !Number.isNaN(Number(val))) {
        result[idx] = Number(val)
      }
    })
  }
  return result
}

export function ensureGridHeaderPopulated(tpl: PrintTemplateConfig, forcePopulateDefaults = false): PrintTemplateConfig {
  if (!tpl.grid_cells) tpl.grid_cells = {}
  if (!tpl.merges) tpl.merges = []
  tpl.col_widths = normalizeNumericIndexMap(tpl.col_widths)
  tpl.row_heights = normalizeNumericIndexMap(tpl.row_heights)
  if (!tpl.cau_hinh_trang) {
    tpl.cau_hinh_trang = createStarterTemplateConfig().cau_hinh_trang
  }
  if (!tpl.cau_hinh_trang.logo_url) {
    tpl.cau_hinh_trang.logo_url = tpl.cau_hinh_trang.logo_trai || '/logo1.png'
  }
  if (!tpl.cau_hinh_trang.logo_width_pct) {
    if (tpl.cau_hinh_trang.logo_width) {
      tpl.cau_hinh_trang.logo_width_pct = Math.max(10, Math.min(100, Math.round((tpl.cau_hinh_trang.logo_width / 700) * 100)))
    } else {
      tpl.cau_hinh_trang.logo_width_pct = 100
    }
  }
  if (!tpl.cau_hinh_trang.logo_height) {
    tpl.cau_hinh_trang.logo_height = 74
  }

  // Convert legacy {{LOGO_TRAI}} / {{LOGO_PHAI}} and Vietnamese tokens without overwriting user edits
  Object.keys(tpl.grid_cells).forEach(k => {
    const cell = tpl.grid_cells[k]
    if (!cell || !cell.value) return
    if (cell.value.includes('{{LOGO_TRAI}}')) {
      cell.value = cell.value.replace(/\{\{LOGO_TRAI\}\}/g, '{{LOGO}}')
    }
    if (cell.value.includes('{{LOGO_PHAI}}')) {
      cell.value = cell.value.replace(/\{\{LOGO_PHAI\}\}/g, '').trim()
    }
    cell.value = normalizeLegacyTokenSyntax(cell.value)
  })

  const hasExistingCells = Object.keys(tpl.grid_cells).length > 0
  if (hasExistingCells && !forcePopulateDefaults) {
    return tpl
  }

  const totalCols = Math.max(tpl.so_cot || 9, 1)
  const midCol = Math.min(6, Math.max(1, Math.floor(totalCols * 0.65)))
  const rightStart = Math.min(totalCols, midCol + 1)
  const headerR = tpl.mapping_vung?.dong_tieu_de_bang || 7

  const isRowEmpty = (r: number) => {
    for (let c = 1; c <= totalCols; c++) {
      if (tpl.grid_cells[`${r}_${c}`]?.value?.trim()) return false
    }
    return true
  }

  const ensureRowMerge = (r: number, left: number, right: number) => {
    if (right <= left) return
    const exists = tpl.merges.some(m => m.top === r && m.bottom === r && !(m.right < left || m.left > right))
    if (!exists) {
      tpl.merges.push({ top: r, left, bottom: r, right })
    }
  }

  // Row 1: Single Logo merged across all columns 1..totalCols (only when logo is enabled)
  if (headerR >= 5 && tpl.cau_hinh_trang?.hien_thi_logo !== false) {
    if (isRowEmpty(1)) {
      tpl.grid_cells['1_1'] = {
        value: '{{LOGO}}',
        style: { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#0070c0', align: 'left', valign: 'middle' }
      }
    }
    if (!tpl.row_heights[1]) tpl.row_heights[1] = 84
    tpl.merges = tpl.merges.filter(m => m.top !== 1)
    ensureRowMerge(1, 1, totalCols)
  }

  // Populate standard baogiachuan header layout if rows 2..6 are empty and headerR === 7
  if (headerR === 7) {
    if (isRowEmpty(2)) {
      tpl.grid_cells['2_1'] = {
        value: 'Kính gởi : {{TEN_CONG_TY}}',
        style: { bold: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true }
      }
      tpl.grid_cells[`2_${rightStart}`] = {
        value: 'Ngày : {{NGAY_BAO_GIA}}',
        style: { italic: true, fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'right', valign: 'middle', wrapText: true }
      }
      ensureRowMerge(2, 1, midCol)
      ensureRowMerge(2, rightStart, totalCols)
    }
    if (isRowEmpty(3)) {
      tpl.grid_cells['3_1'] = {
        value: 'Địa chỉ : {{DIA_CHI_KH}}',
        style: { fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true }
      }
      ensureRowMerge(3, 1, totalCols)
    }
    if (isRowEmpty(4)) {
      tpl.grid_cells['4_1'] = {
        value: 'Người nhận : {{TEN_KHACH_HANG}}',
        style: { fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true }
      }
      ensureRowMerge(4, 1, totalCols)
    }
    if (isRowEmpty(5)) {
      tpl.grid_cells['5_1'] = {
        value: 'BẢNG BÁO GIÁ',
        style: { bold: true, fontSize: 20, fontFamily: 'Arial', color: '#0000ff', align: 'center', valign: 'middle' }
      }
      ensureRowMerge(5, 1, totalCols)
    }
    if (isRowEmpty(6)) {
      tpl.grid_cells['6_1'] = {
        value: 'Công ty Nam Trường Sơn trân trọng gởi đến Quý khách hàng bảng báo giá như sau:',
        style: { fontSize: 11, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true }
      }
      ensureRowMerge(6, 1, totalCols)
    }
  }

  // Ensure Table Column Header row (`dong_tieu_de_bang`) is populated from `cau_hinh_cot_bang` if any cell is empty
  if (headerR > 0 && Array.isArray(tpl.cau_hinh_cot_bang)) {
    tpl.cau_hinh_cot_bang.forEach((col, idx) => {
      const c = col.colIndex || (idx + 1)
      if (c <= totalCols && !tpl.grid_cells[`${headerR}_${c}`]?.value?.trim()) {
        tpl.grid_cells[`${headerR}_${c}`] = {
          value: col.header || `Cột ${c}`,
          style: {
            bold: true,
            fontSize: 11,
            fontFamily: 'Arial',
            color: '#000000',
            bgColor: '#ccffcc',
            align: 'center',
            valign: 'middle',
            border: true,
            wrapText: true
          }
        }
      }
    })
  }

  // Ensure commercial terms row (`dong_dieu_khoan`) has STT placeholder in `sttCol` and `{{DIEU_KHOAN}}` in `sttCol + 1 .. totalCols`
  const termR = tpl.mapping_vung?.dong_dieu_khoan || 0
  if (termR > 0 && totalCols >= 2) {
    const sttCol = findTableSttColumn(tpl)
    const contentCol = Math.min(sttCol + 1, totalCols)
    const c1Val = tpl.grid_cells[`${termR}_1`]?.value?.trim() || ''
    const cSttVal = tpl.grid_cells[`${termR}_${sttCol}`]?.value?.trim() || ''
    if ((c1Val === '{{DIEU_KHOAN}}' || cSttVal === '{{DIEU_KHOAN}}') && contentCol > sttCol) {
      const existingStyle = tpl.grid_cells[`${termR}_${sttCol}`]?.style || tpl.grid_cells[`${termR}_1`]?.style || {}
      for (let cc = 1; cc <= totalCols; cc++) {
        delete tpl.grid_cells[`${termR}_${cc}`]
      }
      tpl.grid_cells[`${termR}_${sttCol}`] = {
        value: '1, 2...',
        style: { bold: true, fontSize: existingStyle.fontSize || 11, fontFamily: existingStyle.fontFamily || 'Arial', color: '#000000', align: 'center', valign: 'middle' }
      }
      tpl.grid_cells[`${termR}_${contentCol}`] = {
        value: '{{DIEU_KHOAN}}',
        style: { fontSize: existingStyle.fontSize || 11, fontFamily: existingStyle.fontFamily || 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true }
      }
      tpl.merges = tpl.merges.filter(m => m.top !== termR)
      ensureRowMerge(termR, contentCol, totalCols)
    }
    if (termR > 1 && sttCol > 1) {
      const prevC1 = tpl.grid_cells[`${termR - 1}_1`]?.value?.trim() || ''
      const prevStt = tpl.grid_cells[`${termR - 1}_${sttCol}`]?.value?.trim() || ''
      if (prevC1.toUpperCase().includes('ĐIỀU KHOẢN') && !prevStt) {
        tpl.grid_cells[`${termR - 1}_${sttCol}`] = tpl.grid_cells[`${termR - 1}_1`]
        delete tpl.grid_cells[`${termR - 1}_1`]
        tpl.merges = tpl.merges.filter(m => m.top !== termR - 1)
        ensureRowMerge(termR - 1, sttCol, totalCols)
      }
    }
  }

  return tpl
}

export function createBlankTemplateConfig(name = 'Mẫu Báo Giá Tự Tạo'): PrintTemplateConfig {
  const tpl = createStarterTemplateConfig(undefined, name)
  tpl.ghi_chu = 'Mẫu tự thiết kế trên bảng lưới (đã có sẵn khung Header chuẩn 1910)'
  tpl.link_file_goc = ''
  const hRow = tpl.mapping_vung?.dong_tieu_de_bang || 7
  const headerCells: Record<string, GridCellData> = {}
  Object.entries(tpl.grid_cells).forEach(([k, v]) => {
    const r = Number(k.split('_')[0])
    if (r <= hRow) headerCells[k] = v
  })
  tpl.grid_cells = headerCells
  tpl.merges = tpl.merges.filter(m => m.bottom <= hRow)
  return tpl
}

export function createDealRegTemplateConfig(customId?: string, name = 'Mẫu Deal Registration'): PrintTemplateConfig {
  const id = customId || 'MINTL_DEAL_REG'
  const now = formatNowVN()
  const cells: Record<string, GridCellData> = {}
  const borderColor = '#2F5496'

  const setCell = (r: number, c: number, value: string, style: GridCellStyle = {}) => {
    cells[`${r}_${c}`] = {
      value,
      style: {
        fontFamily: 'Calibri',
        fontSize: 10,
        border: true,
        borderColor,
        wrapText: true,
        valign: 'top',
        ...style
      }
    }
  }

  const setFullBannerRow = (r: number, title: string, extraStyle: GridCellStyle = {}) => {
    const bannerStyle: GridCellStyle = {
      bold: true,
      fontSize: 11,
      color: '#000000',
      bgColor: '#FBE4D5',
      align: 'left',
      valign: 'middle',
      ...extraStyle
    }
    setCell(r, 1, title, bannerStyle)
    for (let c = 2; c <= 4; c++) {
      setCell(r, c, '', bannerStyle)
    }
  }

  const lblStyle = (color = '#2E74B5', bold = false, italic = false): GridCellStyle => ({
    bold,
    italic,
    color,
    bgColor: '#EDEDED',
    align: 'left',
    valign: 'top'
  })

  const valStyle = (align: 'left' | 'center' | 'right' = 'left', bold = false): GridCellStyle => ({
    bold,
    color: '#000000',
    align,
    valign: 'top'
  })

  // Row 1: Deal Registration Form
  setFullBannerRow(1, 'Deal Registration Form')

  // Row 2: End user Company Name & End User Name
  setCell(2, 1, 'End user Company Name*:', lblStyle('#00B0F0', true, false))
  setCell(2, 2, '{{TEN_CONG_TY_EN}}', valStyle())
  setCell(2, 3, 'End User Name* (First, Last Name):', lblStyle('#2E74B5', true, true))
  setCell(2, 4, '{{TEN_KHACH_HANG}}', valStyle())

  // Row 3: End user Company Name Vietnamese & End User Email
  setCell(3, 1, 'End user Company Name Vietnamese: *', lblStyle('#2E74B5', false, false))
  setCell(3, 2, '{{TEN_CONG_TY_VN}}', valStyle())
  setCell(3, 3, 'End User Email:', lblStyle('#2E74B5', false, false))
  setCell(3, 4, '{{EMAIL_KH}}', valStyle())

  // Row 4: Company Address & End User Phone
  setCell(4, 1, 'Company Address*:', lblStyle('#2E74B5', false, false))
  setCell(4, 2, '{{DIA_CHI_KH}}', valStyle())
  setCell(4, 3, 'End User Phone*:', lblStyle('#2F5496', true, false))
  setCell(4, 4, '{{SDT_KH}}', valStyle())

  // Row 5: Blank left & End User Website
  setCell(5, 1, '', lblStyle('#2E74B5', false, false))
  setCell(5, 2, '', valStyle())
  setCell(5, 3, 'End User Website*:', lblStyle('#2F5496', true, false))
  setCell(5, 4, '{{WEBSITE_KH}}', valStyle())

  // Row 6: Country & Existing Sophos Customer?
  setCell(6, 1, 'Country*:', lblStyle('#2E74B5', false, false))
  setCell(6, 2, '{{DR_COUNTRY}}', valStyle())
  setCell(6, 3, 'Existing Sophos Customer?', lblStyle('#000000', true, false))
  setCell(6, 4, '{{DR_EXISTING_CUST}}', valStyle())

  // Row 7: Company Size & Estimated Customer Budget (in USD)
  setCell(7, 1, 'Company Size* (no. of employees):', lblStyle('#0070C0', true, true))
  setCell(7, 2, '{{DR_SIZE}}', valStyle())
  setCell(7, 3, 'Estimated Customer Budget (in USD):', lblStyle('#000000', true, false))
  setCell(7, 4, '{{DR_BUDGET}}', valStyle())

  // Row 8: Estimated Closure Date & Competition
  setCell(8, 1, 'Estimated Closure Date (DD/MM/YYYY):*', lblStyle('#0070C0', true, true))
  setCell(8, 2, '{{DR_CLOSE_DATE}}', valStyle())
  setCell(8, 3, 'Competition:*', lblStyle('#000000', true, false))
  setCell(8, 4, '{{DR_COMP}}', valStyle())

  // Row 9: Proposed POC Schedule
  setCell(9, 1, 'Proposed POC Schedule:', lblStyle('#000000', true, false))
  setCell(9, 2, '{{DR_POC}}', valStyle())
  setCell(9, 3, '', lblStyle('#000000', false, false))
  setCell(9, 4, '', valStyle())

  // Row 10: Partner Information
  setFullBannerRow(10, 'Partner Information')

  // Row 11: Partner Company Name & Account Manager Email
  setCell(11, 1, 'Partner Company Name*:', lblStyle('#2E74B5', false, false))
  setCell(11, 2, '{{TEN_CONG_TY_BAN}}', valStyle())
  setCell(11, 3, 'Account Manager Email*:', lblStyle('#2E74B5', false, false))
  setCell(11, 4, '{{EMAIL_NGUOI_LAP}}', valStyle())

  // Row 12: Partner Address
  setCell(12, 1, 'Partner Address:*', lblStyle('#2E74B5', false, false))
  setCell(12, 2, '{{DIA_CHI_CONG_TY_BAN}}', valStyle())
  setCell(12, 3, '', lblStyle('#2E74B5', false, false))
  setCell(12, 4, '', valStyle())

  // Row 13: Account Manager Name & Account Manager Phone
  setCell(13, 1, 'Account Manager Name* (First, Last Name):', lblStyle('#2E74B5', true, true))
  setCell(13, 2, '{{NGUOI_LAP}}', valStyle())
  setCell(13, 3, 'Account Manager Phone*', lblStyle('#2E74B5', false, false))
  setCell(13, 4, '{{SDT_NGUOI_LAP}}', valStyle())

  // Row 14: Remarks Header
  setFullBannerRow(14, 'Remarks (Any comments/ details/ requirements/ project name / tender specifications and etc.)', {
    fontSize: 10,
    italic: true
  })

  // Row 15: Remarks Value (merged 1..4)
  setCell(15, 1, '{{DR_REMARKS}}', valStyle())
  for (let c = 2; c <= 4; c++) {
    setCell(15, c, '', valStyle())
  }

  // Row 16: Bill of Materials Header
  setFullBannerRow(16, 'Bill of Materials')

  // Row 17: BOM Table Column Header (`dong_tieu_de_bang = 17`)
  const bomHeaderStyle = (align: 'left' | 'center' | 'right' = 'left'): GridCellStyle => ({
    bold: true,
    fontSize: 10,
    color: '#2E74B5',
    bgColor: '#FBE4D5',
    align,
    valign: 'middle'
  })
  setCell(17, 1, 'SKU / Product / Description*', bomHeaderStyle('left'))
  setCell(17, 2, '', bomHeaderStyle('left'))
  setCell(17, 3, 'Qty*', bomHeaderStyle('center'))
  setCell(17, 4, 'Estimated Value (in USD)', bomHeaderStyle('right'))

  // Row 18: Repeating Product Item Row (`dong_mau_san_pham = 18`)
  setCell(18, 1, '{{TEN_HANG}}', valStyle('left'))
  setCell(18, 2, '', valStyle('left'))
  setCell(18, 3, '{{SO_LUONG}}', valStyle('center'))
  setCell(18, 4, '{{TT_TRUOC_THUE_USD}}', valStyle('right'))

  // Row 19: Total Row (`danh_sach_dong_tong = [19]`)
  setCell(19, 1, 'TOTAL', valStyle('left', true))
  setCell(19, 2, '', valStyle('left', true))
  setCell(19, 3, '', valStyle('center', true))
  setCell(19, 4, '{{TONG_TRUOC_THUE_USD}}', valStyle('right', true))

  return {
    id,
    ten_mau: name,
    ghi_chu: 'Mẫu đăng ký dự án (Deal Registration Form - Sophos / Hãng bảo mật, 4 cột chuẩn Word)',
    loai_mau: 'web_builder',
    mac_dinh: false,
    ngay_tao: now,
    ngay_cap_nhat: now,
    link_file_goc: '',
    cau_hinh_trang: {
      kho_giay: 'A4',
      huong_giay: 'portrait',
      font_mac_dinh: 'Calibri',
      co_chu_mac_dinh: 10,
      padding_trang: 16,
      logo_url: '/logo1.png',
      logo_width: 700,
      logo_width_pct: 100,
      logo_height: 74,
      logo_trai: '/logo1.png',
      logo_phai: '/logo2.png',
      ty_le_logo: 100,
      hien_thi_logo: false,
      hien_thi_line_mau: false
    },
    thong_tin_nguoi_lap: {
      ten_nguoi_lap: 'LÊ PHI SƠN',
      chuc_vu: 'Account Manager',
      so_dien_thoai: '090 8137488',
      email: 'sonlp@nts.com.vn',
      ten_cong_ty_ban: 'Nam Truong Son System Integration Corp',
      dia_chi_cong_ty_ban: '55/10 Trần Đình Xu, Phường Cầu Kho, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
      hieu_luc_bao_gia: '15 ngày'
    },
    mapping_vung: {
      dong_tieu_de_bang: 17,
      dong_mau_nhom: 0,
      dong_mau_san_pham: 18,
      danh_sach_dong_tong: [19],
      dong_dieu_khoan: 0,
      dong_chu_ky: 0
    },
    cau_hinh_cot_bang: [
      { colIndex: 1, header: 'SKU / Product / Description*', field: 'ten_hang', token: '{{TEN_HANG}}', width: 25 },
      { colIndex: 2, header: 'Description', field: 'empty', token: '', width: 35 },
      { colIndex: 3, header: 'Qty*', field: 'so_luong', token: '{{SO_LUONG}}', width: 18 },
      { colIndex: 4, header: 'Estimated Value (in USD)', field: 'truoc_thue_usd', token: '{{TT_TRUOC_THUE_USD}}', width: 22 }
    ],
    so_dong: 19,
    so_cot: 4,
    col_widths: { 1: 160, 2: 240, 3: 160, 4: 240 },
    row_heights: {
      1: 26,
      2: 26,
      3: 26,
      4: 34,
      5: 22,
      6: 24,
      7: 26,
      8: 26,
      9: 24,
      10: 26,
      11: 28,
      12: 34,
      13: 26,
      14: 26,
      15: 26,
      16: 26,
      17: 26,
      18: 26,
      19: 26
    },
    merges: [
      { top: 1, left: 1, bottom: 1, right: 4 },
      { top: 10, left: 1, bottom: 10, right: 4 },
      { top: 14, left: 1, bottom: 14, right: 4 },
      { top: 15, left: 1, bottom: 15, right: 4 },
      { top: 16, left: 1, bottom: 16, right: 4 },
      { top: 17, left: 1, bottom: 17, right: 2 },
      { top: 18, left: 1, bottom: 18, right: 2 },
      { top: 19, left: 1, bottom: 19, right: 2 }
    ],
    grid_cells: cells
  }
}

export function createAgencyTemplateConfig(customId?: string, name = 'Mẫu Báo Giá Đại Lý'): PrintTemplateConfig {
  const id = customId || 'MINTL_DAI_LY'
  const now = formatNowVN()
  const cells: Record<string, GridCellData> = {}

  const setCell = (r: number, c: number, value: string, style: GridCellStyle = {}) => {
    cells[`${r}_${c}`] = {
      value,
      style: {
        fontFamily: 'Arial',
        fontSize: 11,
        color: '#000000',
        border: true,
        wrapText: true,
        valign: 'middle',
        ...style
      }
    }
  }

  // Row 1: Blank top spacer row (matches Row 1 in bao_gia_dl_template.xlsx)
  for (let c = 1; c <= 13; c++) {
    cells[`1_${c}`] = {
      value: '',
      style: { fontFamily: 'Arial', fontSize: 11, border: false, align: 'left', valign: 'middle' }
    }
  }

  // Row 2: Table Header (`dong_tieu_de_bang = 2`, 13 columns A..M matching bao_gia_dl_template.xlsx)
  const headers: { c: number; text: string; bgColor: string }[] = [
    { c: 1, text: 'STT', bgColor: '#00B050' },
    { c: 2, text: 'SẢN PHẨM', bgColor: '#00B050' },
    { c: 3, text: 'Diễn giải', bgColor: '#00B050' },
    { c: 4, text: 'Số lượng', bgColor: '#00B050' },
    { c: 5, text: 'Nhập khẩu', bgColor: '#00B050' },
    { c: 6, text: 'Đơn giá LP', bgColor: '#00B050' },
    { c: 7, text: 'OFF NTS S', bgColor: '#00B050' },
    { c: 8, text: 'Đơn giá sau OFF + nhập khẩu', bgColor: '#00B050' },
    { c: 9, text: 'Thành tiền sau OFF\nUSD', bgColor: '#00B050' },
    { c: 10, text: 'Tỷ giá', bgColor: '#00B050' },
    { c: 11, text: 'VNĐ NTS S', bgColor: '#FFFF00' },
    { c: 12, text: 'VAT 8%', bgColor: '#FFFF00' },
    { c: 13, text: 'Tổng Cộng + VAT', bgColor: '#FFFF00' }
  ]
  headers.forEach(h => {
    setCell(2, h.c, h.text, {
      bold: true,
      bgColor: h.bgColor,
      align: 'center'
    })
  })

  // Row 3: Repeating Product Item Row (`dong_mau_san_pham = 3`)
  const itemTokens: { c: number; val: string; align: 'left' | 'center' | 'right'; bold: boolean }[] = [
    { c: 1, val: '{{STT}}', align: 'center', bold: true },
    { c: 2, val: '{{TEN_HANG}}', align: 'left', bold: true },
    { c: 3, val: '{{DIEN_GIAI}}', align: 'left', bold: false },
    { c: 4, val: '{{SO_LUONG}}', align: 'center', bold: true },
    { c: 5, val: '{{DL_NHAP_KHAU}}', align: 'right', bold: true },
    { c: 6, val: '{{DL_DON_GIA_LP}}', align: 'right', bold: true },
    { c: 7, val: '{{DL_OFF_NTS}}', align: 'center', bold: true },
    { c: 8, val: '{{DL_DON_GIA_SAU_OFF}}', align: 'right', bold: true },
    { c: 9, val: '{{DL_THANH_TIEN_USD}}', align: 'right', bold: true },
    { c: 10, val: '{{DL_TY_GIA}}', align: 'right', bold: true },
    { c: 11, val: '{{DL_VND_NTS}}', align: 'right', bold: true },
    { c: 12, val: '{{DL_TIEN_VAT}}', align: 'right', bold: true },
    { c: 13, val: '{{DL_TONG_CONG_VAT}}', align: 'right', bold: true }
  ]
  itemTokens.forEach(it => {
    setCell(3, it.c, it.val, {
      bold: it.bold,
      align: it.align
    })
  })

  // Row 4: Total Row (`danh_sach_dong_tong = [4]`, A4:H4 merged "TỔNG CỘNG")
  setCell(4, 1, 'TỔNG CỘNG', {
    bold: true,
    fontSize: 14,
    bgColor: '#FFFF00',
    align: 'center'
  })
  for (let c = 2; c <= 8; c++) {
    setCell(4, c, '', {
      bold: true,
      fontSize: 14,
      bgColor: '#FFFF00',
      align: 'center'
    })
  }
  setCell(4, 9, '{{DL_TONG_USD}}', {
    bold: true,
    align: 'right'
  })
  setCell(4, 10, '', {
    bold: true,
    align: 'center'
  })
  setCell(4, 11, '{{DL_TONG_VND}}', {
    bold: true,
    bgColor: '#FFFF00',
    align: 'right'
  })
  setCell(4, 12, '{{DL_TIEN_VAT}}'.replace('{{DL_TIEN_VAT}}', '{{DL_TONG_VAT}}'), {
    bold: true,
    bgColor: '#FFFF00',
    align: 'right'
  })
  setCell(4, 13, '{{DL_TONG_SAU_THUE}}', {
    bold: true,
    bgColor: '#FFFF00',
    align: 'right'
  })

  return {
    id,
    ten_mau: name,
    ghi_chu: 'Mẫu báo giá dành cho Đại lý (13 cột chuẩn bao_gia_dl_template - USD & VNĐ NTS S)',
    loai_mau: 'imported_excel',
    mac_dinh: false,
    ngay_tao: now,
    ngay_cap_nhat: now,
    link_file_goc: '/bao_gia_dl_template.xlsx',
    cau_hinh_trang: {
      kho_giay: 'A4',
      huong_giay: 'landscape',
      font_mac_dinh: 'Arial',
      co_chu_mac_dinh: 11,
      padding_trang: 14,
      logo_url: '/logo1.png',
      logo_width: 700,
      logo_width_pct: 100,
      logo_height: 74,
      logo_trai: '/logo1.png',
      logo_phai: '/logo2.png',
      ty_le_logo: 100,
      hien_thi_logo: false,
      hien_thi_line_mau: false
    },
    thong_tin_nguoi_lap: {
      ten_nguoi_lap: 'Le Phi Son',
      chuc_vu: 'Phó giám đốc NTS',
      so_dien_thoai: '090 813 7488',
      email: 'info@ntssi.vn',
      ten_cong_ty_ban: 'NTS System Integration Corp.',
      dia_chi_cong_ty_ban: '20 Tang Bat Ho Street, Ward 11, Binh Thanh District, Ho Chi Minh City, VN',
      hieu_luc_bao_gia: '15 ngày'
    },
    mapping_vung: {
      dong_tieu_de_bang: 2,
      dong_mau_nhom: 0,
      dong_mau_san_pham: 3,
      danh_sach_dong_tong: [4],
      dong_dieu_khoan: 0,
      dong_chu_ky: 0
    },
    cau_hinh_cot_bang: [
      { colIndex: 1, header: 'STT', field: 'stt', token: '{{STT}}', width: 6 },
      { colIndex: 2, header: 'SẢN PHẨM', field: 'ten_hang', token: '{{TEN_HANG}}', width: 12 },
      { colIndex: 3, header: 'Diễn giải', field: 'features', token: '{{DIEN_GIAI}}', width: 40 },
      { colIndex: 4, header: 'Số lượng', field: 'so_luong', token: '{{SO_LUONG}}', width: 10 },
      { colIndex: 5, header: 'Nhập khẩu', field: 'dl_nhap_khau', token: '{{DL_NHAP_KHAU}}', width: 8 },
      { colIndex: 6, header: 'Đơn giá LP', field: 'dl_don_gia_lp', token: '{{DL_DON_GIA_LP}}', width: 11 },
      { colIndex: 7, header: 'OFF NTS S', field: 'dl_off_nts', token: '{{DL_OFF_NTS}}', width: 10 },
      { colIndex: 8, header: 'Đơn giá sau OFF + nhập khẩu', field: 'dl_don_gia_sau_off', token: '{{DL_DON_GIA_SAU_OFF}}', width: 14 },
      { colIndex: 9, header: 'Thành tiền sau OFF\nUSD', field: 'dl_thanh_tien_usd', token: '{{DL_THANH_TIEN_USD}}', width: 12 },
      { colIndex: 10, header: 'Tỷ giá', field: 'dl_ty_gia', token: '{{DL_TY_GIA}}', width: 9 },
      { colIndex: 11, header: 'VNĐ NTS S', field: 'dl_vnd_nts', token: '{{DL_VND_NTS}}', width: 16 },
      { colIndex: 12, header: 'VAT 8%', field: 'dl_tien_vat', token: '{{DL_TIEN_VAT}}', width: 15 },
      { colIndex: 13, header: 'Tổng Cộng + VAT', field: 'dl_tong_cong_vat', token: '{{DL_TONG_CONG_VAT}}', width: 16 }
    ],
    so_dong: 4,
    so_cot: 13,
    col_widths: {
      1: 42,
      2: 95,
      3: 245,
      4: 58,
      5: 68,
      6: 82,
      7: 68,
      8: 98,
      9: 92,
      10: 66,
      11: 112,
      12: 98,
      13: 116
    },
    row_heights: {
      1: 18,
      2: 58,
      3: 54,
      4: 42
    },
    merges: [
      { top: 4, left: 1, bottom: 4, right: 8 }
    ],
    grid_cells: cells
  }
}

/* =====================================================
   5. ĐỌC FILE EXCEL (.XLSX) LÊN BẢNG LƯỚI & TỰ ĐỘNG GẮN TOKEN
===================================================== */
export function excelCellToPlainText(v: any): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  if (v.richText && Array.isArray(v.richText)) return v.richText.map((r: any) => r.text || '').join('')
  if (v.text) return String(v.text)
  if (v.result !== undefined) return String(v.result)
  return String(v)
}

function argbToHex(argb?: string): string | undefined {
  if (!argb || typeof argb !== 'string') return undefined
  const clean = argb.replace(/^#/, '').trim()
  if (clean.length === 8) {
    return '#' + clean.slice(2).toLowerCase()
  }
  if (clean.length === 6) {
    return '#' + clean.toLowerCase()
  }
  return undefined
}

const EXCEL_INDEXED_COLOR_MAP: Record<number, string> = {
  8: '#000000',
  9: '#ffffff',
  10: '#ff0000',
  11: '#00ff00',
  12: '#0000ff',
  13: '#ffff00',
  14: '#ff00ff',
  15: '#00ffff',
  16: '#800000',
  17: '#008000',
  18: '#000080',
  19: '#808000',
  20: '#800080',
  21: '#008080',
  22: '#c0c0c0',
  23: '#808080',
  30: '#002060',
  40: '#00ccff',
  41: '#ccffff',
  42: '#ccffcc',
  43: '#ffff99',
  44: '#99ccff',
  45: '#ff99cc',
  46: '#cc99ff',
  47: '#ffcc99',
  48: '#3366ff',
  53: '#ed7d31'
}

function resolveExcelColorToHex(colorObj: any): string | undefined {
  if (!colorObj) return undefined
  if (colorObj.argb) return argbToHex(colorObj.argb)
  if (colorObj.indexed !== undefined && EXCEL_INDEXED_COLOR_MAP[colorObj.indexed]) {
    return EXCEL_INDEXED_COLOR_MAP[colorObj.indexed]
  }
  if (colorObj.theme === 10) return '#0563c1'
  if (colorObj.theme === 1) return '#000000'
  if (colorObj.theme === 0) return '#ffffff'
  return undefined
}

export function identifyHeaderField(text: string): string | null {
  const t = String(text || '').toUpperCase().trim()
  if (!t) return null
  if (t === 'STT' || t === 'SỐ TT' || t === 'NO.' || t === 'TT') return 'stt'
  if (t === 'SKU' || t === 'SKU CODE' || t === 'SKUCODE' || t.includes('MÃ SKU') || t.includes('MA SKU')) return 'sku_code'
  if (t === 'P/N' || t === 'PN' || t.includes('MÃ HÀNG') || t.includes('PART NUMBER')) return 'pn'
  if (t.includes('NHẬP KHẨU') || t.includes('NHAP KHAU')) return 'dl_nhap_khau'
  if (t.includes('ĐƠN GIÁ LP') || t.includes('DON GIA LP')) return 'dl_don_gia_lp'
  if (t.includes('OFF NTS')) return 'dl_off_nts'
  if (t.includes('ĐƠN GIÁ SAU OFF') || t.includes('DON GIA SAU OFF')) return 'dl_don_gia_sau_off'
  if (t.includes('THÀNH TIỀN SAU OFF') || t.includes('THANH TIEN SAU OFF')) return 'dl_thanh_tien_usd'
  if (t === 'TỶ GIÁ' || t === 'TỈ GIÁ' || t === 'TY GIA' || t === 'TI GIA') return 'dl_ty_gia'
  if (t.includes('VNĐ NTS') || t.includes('VND NTS')) return 'dl_vnd_nts'
  if (t.includes('TỔNG CỘNG + VAT') || t.includes('TONG CONG + VAT')) return 'dl_tong_cong_vat'
  if (t.includes('VAT 8%') || t.includes('VAT 10%')) return 'dl_tien_vat'
  if (t.includes('TÊN HÀNG') || t.includes('HÀNG HÓA') || t.includes('DỊCH VỤ') || t.includes('SẢN PHẨM') || t === 'MODEL') return 'ten_hang'
  if (t === 'DESCRIPTION' || t === 'PRODUCT DESCRIPTION' || t.startsWith('DESCRIPTION (')) return 'description'
  if (t.includes('DIỄN GIẢI') || t.includes('DIEN GIAI') || t.includes('MÔ TẢ') || t.includes('ĐẶC TÍNH') || t.includes('THÔNG SỐ') || t.includes('NỘI DUNG') || t.includes('HẠNG MỤC') || t.includes('SPEC')) return 'features'
  if (t === 'ĐVT' || t === 'DVT' || t.includes('ĐƠN VỊ') || t.includes('DON VI') || t === 'UNIT') return 'dvt'
  if (t.includes('THỜI HẠN') || t.includes('THOI HAN') || t.includes('DURATION')) return 'license_duration'
  if (t.includes('BẢO HÀNH') || t.includes('BAO HANH') || t.includes('WARRANTY')) return 'thoi_gian_bao_hanh'
  if (t.includes('SỐ LƯỢNG') || t.includes('S.LƯỢNG') || t === 'SL' || t === 'S.L' || t === 'S.L.' || t.includes('SO LUONG') || t === 'QTY') return 'so_luong'
  if (t.includes('ĐƠN GIÁ') || t.includes('DON GIA') || t.includes('UNIT PRICE')) return 'don_gia_kh'
  if (t.includes('TRƯỚC THUẾ') || t.includes('TRUOC THUE')) return 'truoc_thue'
  if (t.includes('SAU THUẾ') || t.includes('SAU THUE') || t.includes('SAU VAT') || t.includes('+ VAT') || t.includes('+VAT')) return 'sau_thue'
  if (t.includes('VAT') || (t.includes('THUẾ') && !t.includes('TRƯỚC') && !t.includes('SAU') && !t.includes('THÀNH TIỀN'))) return 'vat'
  if (t.includes('THÀNH TIỀN') || t.includes('THANH TIEN') || t.includes('AMOUNT')) return 'truoc_thue'
  return null
}

export async function parseExcelBufferToTemplateConfig(
  buffer: ArrayBuffer,
  baseTemplate?: Partial<PrintTemplateConfig>
): Promise<PrintTemplateConfig> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer)
  const ws = wb.worksheets[0]
  if (!ws) throw new Error('File Excel không có trang tính (worksheet) nào.')

  const tpl = createStarterTemplateConfig(
    baseTemplate?.id,
    baseTemplate?.ten_mau || ws.name || 'Mẫu Import Excel'
  )
  tpl.loai_mau = 'imported_excel'
  tpl.link_file_goc = baseTemplate?.link_file_goc || '/baogiachuan.xlsx'
  tpl.ghi_chu = baseTemplate?.ghi_chu || ''
  tpl.grid_cells = {}
  tpl.merges = []
  tpl.col_widths = {}
  tpl.row_heights = {}

  if (ws.pageSetup?.orientation === 'portrait' || ws.pageSetup?.orientation === 'landscape') {
    tpl.cau_hinh_trang.huong_giay = ws.pageSetup.orientation
  }

  // Extract merges (collapse multi-row top logo merge A1:I5 to horizontal row merges)
  const mergesObj = (ws as any)._merges || {}
  let maxMergedCol = 1
  let maxMergedRow = 1
  Object.values(mergesObj).forEach((m: any) => {
    const model = m.model || m
    if (model && model.top && model.left) {
      tpl.merges.push({
        top: model.top,
        left: model.left,
        bottom: model.bottom,
        right: model.right
      })
      if (model.right > maxMergedCol) maxMergedCol = model.right
      if (model.bottom > maxMergedRow) maxMergedRow = model.bottom
    }
  })

  // Determine grid bounds without artificially inflating 9-column templates to 10 columns
  const rowCount = Math.min(Math.max(ws.rowCount || 20, maxMergedRow, 18), 80)
  let colCount = Math.max(maxMergedCol, 9)
  ws.eachRow((row) => {
    row.eachCell((cell, colNumber) => {
      if (colNumber <= 25 && excelCellToPlainText(cell.value).trim()) {
        if (colNumber > colCount) colCount = colNumber
      }
    })
  })
  colCount = Math.min(Math.max(colCount, 8), 20)

  tpl.so_dong = rowCount
  tpl.so_cot = colCount

  for (let c = 1; c <= colCount; c++) {
    const colObj = ws.getColumn(c)
    if (colObj.hidden) {
      tpl.col_widths[c] = 0
    } else {
      const w = colObj.width
      tpl.col_widths[c] = w ? Math.round(w * 7.2) : 95
    }
  }

  // Scan rows for header, group, item, total, terms, signature
  let headerRowIdx = -1
  let totalRowIdx = -1
  let termRowIdx = -1
  let sigRowIdx = -1
  const colFieldMap: Record<number, string> = {}

  for (let r = 1; r <= rowCount; r++) {
    const row = ws.getRow(r)
    if (row.hidden) {
      tpl.row_heights[r] = 0
    } else if (row.height) {
      tpl.row_heights[r] = Math.round(row.height * 1.15)
    }

    // Check if this row is the table header
    if (headerRowIdx === -1) {
      let recognized = 0
      const tempMap: Record<number, string> = {}
      for (let c = 1; c <= colCount; c++) {
        const text = excelCellToPlainText(row.getCell(c).value).trim()
        const f = identifyHeaderField(text)
        if (f) {
          tempMap[c] = f
          recognized++
        }
      }
      if (recognized >= 3) {
        headerRowIdx = r
        Object.assign(colFieldMap, tempMap)
      }
    }

    // Check cells in this row
    for (let c = 1; c <= colCount; c++) {
      const cell = row.getCell(c)
      let val = normalizeLegacyTokenSyntax(excelCellToPlainText(cell.value))
      const font = cell.font || {}
      const fill = cell.fill as any
      const align = cell.alignment || {}
      const border = cell.border

      const bgColor = resolveExcelColorToHex(fill?.fgColor)
      const textColor = resolveExcelColorToHex(font?.color)

      // Auto-convert common static labels in header area into tokens
      if (headerRowIdx === -1 || r < headerRowIdx) {
        const lower = val.toLowerCase().trim()
        if (lower.startsWith('kính gởi') || lower.startsWith('kính gửi')) {
          val = 'Kính gởi: {{TEN_CONG_TY}}'
        } else if (lower.startsWith('địa chỉ') && !lower.includes('giao hàng') && !lower.includes('tăng bạt hổ')) {
          val = 'Địa chỉ: {{DIA_CHI_KH}}'
        } else if (lower.startsWith('người nhận') && !lower.includes('hàng')) {
          val = 'Người nhận : {{TEN_KHACH_HANG}}'
        } else if (lower.startsWith('ngày :') || lower.startsWith('ngày:')) {
          val = 'Ngày : {{NGAY_BAO_GIA}}'
        }
      }

      // Detect total row
      const upperVal = val.toUpperCase()
      if (headerRowIdx !== -1 && r > headerRowIdx && totalRowIdx === -1) {
        if (upperVal.includes('TỔNG CỘNG') || upperVal.includes('TONG CONG') || val.includes('{{TONG_')) {
          totalRowIdx = r
        }
      }

      // Detect terms & signature rows
      if (totalRowIdx !== -1 && r > totalRowIdx) {
        const lower = val.toLowerCase()
        if (termRowIdx === -1 && (lower.includes('điều khoản') || lower.includes('điều kiện') || val.includes('{{DIEU_KHOAN}}'))) {
          termRowIdx = val.includes('{{DIEU_KHOAN}}') ? r : Math.min(r + 1, rowCount)
        }
        if (
          sigRowIdx === -1 &&
          (val.includes('Trân Trọng') ||
            val.includes('Trân trọng') ||
            val.includes('TRÂN TRỌNG') ||
            val.includes('Người lập') ||
            val.includes('ĐẠI DIỆN') ||
            val.includes('Xác nhận đặt hàng') ||
            val.includes('BÊN MUA') ||
            val.includes('{{NGUOI_LAP}}'))
        ) {
          if (val.length < 60 && (termRowIdx === -1 || r > termRowIdx)) {
            sigRowIdx = r
          }
        }
      }

      // Save cell to grid_cells
      if (val !== '' || bgColor || border || font.bold) {
        tpl.grid_cells[`${r}_${c}`] = {
          value: val,
          style: {
            bold: !!font.bold,
            italic: !!font.italic,
            underline: !!font.underline,
            fontSize: font.size ? Math.round(font.size) : 10,
            fontFamily: font.name || 'Arial',
            color: textColor || '#000000',
            bgColor: bgColor,
            align: (align.horizontal as any) || 'left',
            valign: (align.vertical as any) || 'middle',
            border: !!(border && (border.top || border.bottom || border.left || border.right)),
            wrapText: !!align.wrapText
          }
        }
      }
    }
  }

  // Configure mapping_vung & auto-populate tokens on group/item/total rows if not already tokenized
  if (headerRowIdx !== -1) {
    tpl.mapping_vung.dong_tieu_de_bang = headerRowIdx
    const candidateGroupRow = headerRowIdx + 1
    const candidateItemRow = headerRowIdx + 2
    const candGrpC1 = (tpl.grid_cells[`${candidateGroupRow}_1`]?.value || '').trim().toUpperCase()
    const candGrpHasMerge = tpl.merges.some(
      m => m.top === candidateGroupRow && m.bottom === candidateGroupRow && m.right - m.left >= 2
    )
    const isRomanOrGroupToken =
      /^(I|II|III|IV|V|VI|VII|VIII|IX|X|\{\{NHOM_STT\}\})$/.test(candGrpC1) || candGrpHasMerge

    if (totalRowIdx !== -1 && totalRowIdx - headerRowIdx >= 3 && isRomanOrGroupToken) {
      tpl.mapping_vung.dong_mau_nhom = candidateGroupRow
      tpl.mapping_vung.dong_mau_san_pham = candidateItemRow
    } else if (totalRowIdx !== -1 && totalRowIdx - headerRowIdx >= 2) {
      tpl.mapping_vung.dong_mau_nhom = 0
      tpl.mapping_vung.dong_mau_san_pham = candidateGroupRow
    } else {
      tpl.mapping_vung.dong_mau_nhom = isRomanOrGroupToken ? candidateGroupRow : 0
      tpl.mapping_vung.dong_mau_san_pham = isRomanOrGroupToken ? candidateItemRow : candidateGroupRow
    }

    if (totalRowIdx !== -1) {
      tpl.mapping_vung.danh_sach_dong_tong = [totalRowIdx]
    }
    if (termRowIdx !== -1) {
      tpl.mapping_vung.dong_dieu_khoan = termRowIdx
    }
    if (sigRowIdx !== -1) {
      tpl.mapping_vung.dong_chu_ky = sigRowIdx
    }

    // Build cau_hinh_cot_bang
    const colsConfig: PrintTemplateConfig['cau_hinh_cot_bang'] = []
    for (let c = 1; c <= colCount; c++) {
      const hText = tpl.grid_cells[`${headerRowIdx}_${c}`]?.value || ''
      const field = colFieldMap[c] || identifyHeaderField(hText) || 'empty'
      const token = LEGACY_FIELD_TO_TOKEN[field] || ''
      colsConfig.push({
        colIndex: c,
        header: hText || `Cột ${c}`,
        field,
        token,
        width: Math.round((tpl.col_widths[c] || 95) / 7.5)
      })

      // Auto-fill item row tokens if the imported template had sample values instead of {{TOKEN}}
      const itemR = tpl.mapping_vung.dong_mau_san_pham
      if (itemR > 0 && token) {
        const existingCell = tpl.grid_cells[`${itemR}_${c}`]
        const existingVal = existingCell?.value || ''
        if (!existingVal.includes('{{')) {
          tpl.grid_cells[`${itemR}_${c}`] = {
            value: token,
            style: existingCell?.style || {
              fontSize: 11,
              fontFamily: 'Arial',
              align: [
                'so_luong',
                'don_gia_kh',
                'truoc_thue',
                'vat',
                'sau_thue',
                'dl_nhap_khau',
                'dl_don_gia_lp',
                'dl_don_gia_sau_off',
                'dl_thanh_tien_usd',
                'dl_ty_gia',
                'dl_vnd_nts',
                'dl_tien_vat',
                'dl_tong_cong_vat'
              ].includes(field)
                ? 'right'
                : 'left',
              border: true
            }
          }
        }
      }

      // Auto-fill total row tokens
      if (totalRowIdx !== -1) {
        const totCell = tpl.grid_cells[`${totalRowIdx}_${c}`]
        if (field === 'truoc_thue' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{TONG_TRUOC_THUE}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        } else if (field === 'vat' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{TONG_TIEN_VAT}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        } else if (field === 'sau_thue' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{TONG_SAU_THUE}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        } else if (field === 'dl_thanh_tien_usd' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{DL_TONG_USD}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        } else if (field === 'dl_vnd_nts' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{DL_TONG_VND}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        } else if (field === 'dl_tien_vat' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{DL_TONG_VAT}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        } else if (field === 'dl_tong_cong_vat' && (!totCell?.value || !totCell.value.includes('{{'))) {
          tpl.grid_cells[`${totalRowIdx}_${c}`] = {
            value: '{{DL_TONG_SAU_THUE}}',
            style: { ...(totCell?.style || {}), bold: true, align: 'right', border: true }
          }
        }
      }
    }
    tpl.cau_hinh_cot_bang = colsConfig

    // Auto-fill group row tokens if group row exists
    const grpR = tpl.mapping_vung.dong_mau_nhom
    if (grpR > 0) {
      const c1 = tpl.grid_cells[`${grpR}_1`]
      if (!c1?.value?.includes('{{')) {
        tpl.grid_cells[`${grpR}_1`] = {
          value: '{{NHOM_STT}}',
          style: { ...(c1?.style || {}), bold: true, align: 'center', border: true }
        }
      }
      const c2 = tpl.grid_cells[`${grpR}_2`]
      if (!c2?.value?.includes('{{')) {
        tpl.grid_cells[`${grpR}_2`] = {
          value: '{{NHOM_TEN}}',
          style: { ...(c2?.style || {}), bold: true, align: 'left', border: true }
        }
      }
      // Ensure group row is merged across 2..colCount
      tpl.merges = tpl.merges.filter(m => m.top !== grpR)
      tpl.merges.push({ top: grpR, left: 2, bottom: grpR, right: colCount })
    }

    // Collapse static term rows (between termRowIdx+1 and sigRowIdx-1) and extra sample item rows (between itemRowIdx+1 and totalRowIdx-1)
    // so the template uses dynamic {{DIEU_KHOAN}} from schema `dieu_khoan` and a single repeating item row!
    const rowsToSkip = new Set<number>()
    const itemR = tpl.mapping_vung.dong_mau_san_pham
    if (itemR > 0 && totalRowIdx > itemR + 1) {
      for (let rr = itemR + 1; rr < totalRowIdx; rr++) {
        rowsToSkip.add(rr)
      }
    }
    if (termRowIdx !== -1 && sigRowIdx !== -1 && sigRowIdx > termRowIdx + 1) {
      for (let rr = termRowIdx + 1; rr < sigRowIdx; rr++) {
        rowsToSkip.add(rr)
      }
    }
    // Also collapse empty logo merge rows 2..6 if row 1 is part of a multi-row top logo merge (like A1:I5 in template_mau_1910.xlsx)
    if (headerRowIdx >= 12) {
      for (let rr = 2; rr <= 6; rr++) {
        let empty = true
        for (let cc = 1; cc <= colCount; cc++) {
          if (tpl.grid_cells[`${rr}_${cc}`]?.value?.trim()) {
            empty = false
            break
          }
        }
        if (empty) rowsToSkip.add(rr)
      }
    }

    if (termRowIdx !== -1) {
      // Clear any static bullet text on termRowIdx; place STT placeholder in Col 1 and {{DIEU_KHOAN}} in Col 2..colCount
      for (let cc = 1; cc <= colCount; cc++) {
        delete tpl.grid_cells[`${termRowIdx}_${cc}`]
      }
      tpl.grid_cells[`${termRowIdx}_1`] = {
        value: '1, 2...',
        style: { fontSize: 10, fontFamily: 'Arial', color: '#000000', align: 'right', valign: 'middle' }
      }
      tpl.grid_cells[`${termRowIdx}_2`] = {
        value: '{{DIEU_KHOAN}}',
        style: { fontSize: 10, fontFamily: 'Arial', color: '#000000', align: 'left', valign: 'middle', wrapText: true }
      }
      tpl.merges = tpl.merges.filter(m => m.top !== termRowIdx)
      if (colCount >= 2) {
        tpl.merges.push({ top: termRowIdx, left: 2, bottom: termRowIdx, right: colCount })
      }
    }

    if (rowsToSkip.size > 0) {
      const oldToNewRow = new Map<number, number>()
      let newR = 0
      for (let r = 1; r <= tpl.so_dong; r++) {
        if (rowsToSkip.has(r)) continue
        newR++
        oldToNewRow.set(r, newR)
      }
      const nextCells: Record<string, GridCellData> = {}
      Object.entries(tpl.grid_cells).forEach(([k, v]) => {
        const [rS, cS] = k.split('_')
        const mappedR = oldToNewRow.get(Number(rS))
        if (mappedR) {
          nextCells[`${mappedR}_${cS}`] = v
        }
      })
      const nextHeights: Record<number, number> = {}
      Object.entries(tpl.row_heights).forEach(([rS, h]) => {
        const mappedR = oldToNewRow.get(Number(rS))
        if (mappedR) nextHeights[mappedR] = h
      })
      const nextMerges: GridMerge[] = []
      tpl.merges.forEach(m => {
        const mTop = oldToNewRow.get(m.top)
        const mBot = oldToNewRow.get(m.bottom) || mTop
        if (mTop && mBot) {
          nextMerges.push({ top: mTop, bottom: mBot, left: m.left, right: m.right })
        }
      })
      const mapRowIdx = (origR: number) => {
        if (origR <= 0) return 0
        return oldToNewRow.get(origR) || origR
      }
      tpl.mapping_vung.dong_tieu_de_bang = mapRowIdx(tpl.mapping_vung.dong_tieu_de_bang)
      tpl.mapping_vung.dong_mau_nhom = mapRowIdx(tpl.mapping_vung.dong_mau_nhom)
      tpl.mapping_vung.dong_mau_san_pham = mapRowIdx(tpl.mapping_vung.dong_mau_san_pham)
      tpl.mapping_vung.danh_sach_dong_tong = (tpl.mapping_vung.danh_sach_dong_tong || []).map(mapRowIdx)
      tpl.mapping_vung.dong_dieu_khoan = mapRowIdx(tpl.mapping_vung.dong_dieu_khoan)
      tpl.mapping_vung.dong_chu_ky = mapRowIdx(tpl.mapping_vung.dong_chu_ky)
      tpl.grid_cells = nextCells
      tpl.row_heights = nextHeights
      tpl.merges = nextMerges
      tpl.so_dong = newR
    }
  }

  return ensureGridHeaderPopulated(tpl)
}

/* =====================================================
   6. ĐỒNG BỘ FIREBASE (`mau_in_thiet_lap` <-> `upload_file_mau` & `dieu_khoan`)
===================================================== */
export const DEFAULT_1910_TERMS_HTML = [
  '<div class="stt-block" style="display: flex; gap: 8px; margin: 0; padding: 0; align-items: flex-start;"><div class="stt-number" contenteditable="false" style="font-weight: bold; min-width: 18px; flex-shrink: 0; white-space: nowrap; user-select: none;">1</div><div class="stt-content" style="flex-grow: 1;"><b>Thuế VAT: Giá trên đã bao gồm thuế GTGT;</b></div></div>',
  '<div class="stt-block" style="display: flex; gap: 8px; margin: 0; padding: 0; align-items: flex-start;"><div class="stt-number" contenteditable="false" style="font-weight: bold; min-width: 18px; flex-shrink: 0; white-space: nowrap; user-select: none;">2</div><div class="stt-content" style="flex-grow: 1;">Bảng giá nêu trên không bao gồm phí cài đặt. Bảo hành: 01 năm</div></div>',
  '<div class="stt-block" style="display: flex; gap: 8px; margin: 0; padding: 0; align-items: flex-start;"><div class="stt-number" contenteditable="false" style="font-weight: bold; min-width: 18px; flex-shrink: 0; white-space: nowrap; user-select: none;">3</div><div class="stt-content" style="flex-grow: 1;">Giao hàng: trong vòng 01-02 tuần kể từ ngày ký xác nhận đặt hàng.</div></div>',
  '<div class="stt-block" style="display: flex; gap: 8px; margin: 0; padding: 0; align-items: flex-start;"><div class="stt-number" contenteditable="false" style="font-weight: bold; min-width: 18px; flex-shrink: 0; white-space: nowrap; user-select: none;">4</div><div class="stt-content" style="flex-grow: 1;">Phương thức thanh toán: Thanh toán bằng tiền mặt / chuyển khoản .<br> - Thanh toán 100% giá trị HĐ trong vòng 10 ngày sau khi giao hàng và hóa đơn tài chính.</div></div>',
  '<div class="stt-block" style="display: flex; gap: 8px; margin: 0; padding: 0; align-items: flex-start;"><div class="stt-number" contenteditable="false" style="font-weight: bold; min-width: 18px; flex-shrink: 0; white-space: nowrap; user-select: none;">5</div><div class="stt-content" style="flex-grow: 1;"><b>TÀI KHOẢN NGÂN HÀNG:<br>Đơn vị thụ hưởng:  CÔNG TY CP TÍCH HỢP HỆ THỐNG NAM TRƯỜNG SƠN <br>STK 1 (Bank A/C): 199458149 tại NH TMCP Á Châu - CN Phan Đăng Lưu - P. GD Lê Quang Định</b></div></div>',
  '<div class="stt-block" style="display: flex; gap: 8px; margin: 0; padding: 0; align-items: flex-start;"><div class="stt-number" contenteditable="false" style="font-weight: bold; min-width: 18px; flex-shrink: 0; white-space: nowrap; user-select: none;">6</div><div class="stt-content" style="flex-grow: 1;">Bảng giá có giá trị trong vòng <b>30 ngày</b> kể từ ngày báo giá.</div></div>'
].join('')

let cachedDefaultTermsHtml = ''

export function getDefaultTermsHtmlFromCache(): string {
  return cachedDefaultTermsHtml || DEFAULT_1910_TERMS_HTML
}

const DELETED_TPL_STORAGE_KEY = 'nts_deleted_print_templates'

function getLocalDeletedTemplateIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_TPL_STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? new Set(arr.map((x: any) => String(x))) : new Set()
  } catch {
    return new Set()
  }
}

function saveLocalDeletedTemplateIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DELETED_TPL_STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch {}
}

export async function fetchAndSyncPrintTemplates(): Promise<PrintTemplateConfig[]> {
  const database = getDb()
  try {
    const [mauInSnap, legacySnap, dieuKhoanSnap, deletedSnap] = await Promise.all([
      get(dbRef(database, 'mau_in_thiet_lap')),
      get(dbRef(database, 'upload_file_mau')),
      get(dbRef(database, 'dieu_khoan')).catch(() => null),
      get(dbRef(database, 'mau_in_da_xoa')).catch(() => null)
    ])

    const deletedIds = getLocalDeletedTemplateIds()
    if (deletedSnap && deletedSnap.exists()) {
      const delVal = deletedSnap.val()
      if (delVal && typeof delVal === 'object') {
        for (const [dk, dv] of Object.entries(delVal)) {
          if (dv) deletedIds.add(String(dk))
        }
      }
    }
    saveLocalDeletedTemplateIds(deletedIds)

    // Sync default commercial terms from `dieu_khoan` schema (prioritize "Mẫu mặc định")
    if (dieuKhoanSnap && dieuKhoanSnap.exists()) {
      const dkData = dieuKhoanSnap.val()
      if (dkData && typeof dkData === 'object') {
        let fallbackContent = ''
        let defaultSampleContent = ''
        for (const v of Object.values(dkData) as any[]) {
          const mauName = Array.isArray(v)
            ? String(v[1] || '')
            : String(v?.Mau ?? v?.mau ?? v?.loai_dieu_khoan ?? '')
          const content = Array.isArray(v)
            ? String(v[6] || '')
            : String(v?.Noi_dung ?? v?.noi_dung ?? '')
          if (content && content.trim()) {
            if (!fallbackContent) fallbackContent = content.trim()
            const normMau = mauName.toLowerCase()
            if (normMau.includes('mặc định') || normMau.includes('mac dinh')) {
              defaultSampleContent = content.trim()
              break
            }
          }
        }
        if (defaultSampleContent || fallbackContent) {
          cachedDefaultTermsHtml = sanitizeSttHtml(defaultSampleContent || fallbackContent)
        }
      }
    }

    const mauInData = mauInSnap.val() || {}
    const legacyData = legacySnap.val() || {}

    const templatesMap = new Map<string, PrintTemplateConfig>()
    const syncedLegacyIds = new Set<string>()
    const newSyncUpdates: Record<string, any> = {}

    // 1. Load existing records in `mau_in_thiet_lap`
    if (mauInData && typeof mauInData === 'object') {
      for (const [k, raw] of Object.entries(mauInData) as [string, any][]) {
        if (!raw || typeof raw !== 'object') continue
        const id = String(raw.id || k)
        const bareId = id.replace(/^MINTL_/, '')
        const srcId = raw.source_upload_id ? String(raw.source_upload_id) : ''

        if (
          deletedIds.has(id) ||
          deletedIds.has(k) ||
          (bareId && deletedIds.has(bareId)) ||
          (srcId && deletedIds.has(srcId))
        ) {
          newSyncUpdates[`mau_in_thiet_lap/${k}`] = null
          continue
        }

        const parsedGridCells = typeof raw.grid_cells_json === 'string'
          ? JSON.parse(raw.grid_cells_json || '{}')
          : typeof raw.grid_cells === 'string'
            ? JSON.parse(raw.grid_cells || '{}')
            : (raw.grid_cells || {})

        const isDealRegId = id === 'MINTL_DEAL_REG' || String(raw.ten_mau || '').toLowerCase().includes('deal reg')
        const isAgencyId =
          id === 'MINTL_DAI_LY' ||
          id.startsWith('MINTL_DAI_LY_') ||
          String(raw.ten_mau || '').toLowerCase().includes('đại lý') ||
          String(raw.ten_mau || '').toLowerCase().includes('dai ly') ||
          String(raw.link_file_goc || '').includes('bao_gia_dl_template')

        const hasExplicitMergesJson = typeof raw.merges_json === 'string'
        const parsedMerges = hasExplicitMergesJson
          ? JSON.parse(raw.merges_json || '[]')
          : typeof raw.merges === 'string'
            ? JSON.parse(raw.merges || '[]')
            : (Array.isArray(raw.merges) ? raw.merges : [])
        const parsedCols = typeof raw.cau_hinh_cot_bang_json === 'string'
          ? JSON.parse(raw.cau_hinh_cot_bang_json || '[]')
          : typeof raw.cau_hinh_cot_bang === 'string'
            ? JSON.parse(raw.cau_hinh_cot_bang || '[]')
            : (Array.isArray(raw.cau_hinh_cot_bang) ? raw.cau_hinh_cot_bang : [])

        const starter = isDealRegId
          ? createDealRegTemplateConfig(id, raw.ten_mau || 'Mẫu Deal Registration')
          : isAgencyId
            ? createAgencyTemplateConfig(id, raw.ten_mau || 'Mẫu Báo Giá Đại Lý')
            : createStarterTemplateConfig(id, raw.ten_mau || 'Mẫu in')
        const normalizedColWidths = normalizeNumericIndexMap(
          raw.col_widths_json ?? raw.col_widths,
          starter.col_widths
        )
        const normalizedRowHeights = normalizeNumericIndexMap(
          raw.row_heights_json ?? raw.row_heights,
          starter.row_heights
        )
        const tpl: PrintTemplateConfig = ensureGridHeaderPopulated({
          ...starter,
          ...raw,
          id,
          ten_mau: (raw.ten_mau && String(raw.ten_mau).trim()) ? String(raw.ten_mau).trim() : starter.ten_mau,
          ghi_chu: raw.ghi_chu !== undefined ? String(raw.ghi_chu) : starter.ghi_chu,
          cau_hinh_trang: { ...starter.cau_hinh_trang, ...(raw.cau_hinh_trang || {}) },
          thong_tin_nguoi_lap: { ...starter.thong_tin_nguoi_lap, ...(raw.thong_tin_nguoi_lap || {}) },
          mapping_vung: {
            ...starter.mapping_vung,
            ...(raw.mapping_vung || {}),
            danh_sach_dong_tong: Array.isArray(raw.mapping_vung?.danh_sach_dong_tong)
              ? raw.mapping_vung.danh_sach_dong_tong
              : starter.mapping_vung.danh_sach_dong_tong
          },
          cau_hinh_cot_bang: parsedCols.length ? parsedCols : starter.cau_hinh_cot_bang,
          col_widths: normalizedColWidths,
          row_heights: normalizedRowHeights,
          merges: parsedMerges,
          grid_cells: parsedGridCells
        })
        templatesMap.set(id, tpl)
        if (tpl.source_upload_id) syncedLegacyIds.add(String(tpl.source_upload_id))
        if (bareId) syncedLegacyIds.add(bareId)
        syncedLegacyIds.add(id)
        syncedLegacyIds.add(k)
      }
    }

    // 2. Auto-sync any templates in `upload_file_mau` that are not yet in `mau_in_thiet_lap`
    if (legacyData && typeof legacyData === 'object') {
      for (const [k, v] of Object.entries(legacyData) as [string, any][]) {
        if (!v) continue
        let legId = k
        let legName = ''
        let legUrl = ''
        let legNote = ''
        let legStruct: any[] = []

        if (Array.isArray(v)) {
          legId = String(v[0] || k)
          legName = String(v[1] || 'Mẫu tải lên')
          legUrl = String(v[2] || '')
          try { legStruct = typeof v[3] === 'string' ? JSON.parse(v[3]) : (v[3] || []) } catch {}
          legNote = String(v[4] || '')
        } else {
          legId = String(v.ID ?? v.id ?? k)
          legName = String(v.TEN_FILE ?? v.ten_file ?? 'Mẫu tải lên')
          legUrl = String(v.LINK_FILE ?? v.link_file ?? '')
          legNote = String(v.GHI_CHU ?? v.ghi_chu ?? '')
          const rawS = v.STRUCTURE ?? v.structure ?? ''
          if (Array.isArray(rawS)) legStruct = rawS
          else if (typeof rawS === 'string' && rawS.trim()) {
            try { legStruct = JSON.parse(rawS) } catch {}
          }
        }

        const prefixedLegId = legId.startsWith('MINTL_') ? legId : `MINTL_${legId}`
        const bareLegId = legId.replace(/^MINTL_/, '')

        if (
          deletedIds.has(k) ||
          deletedIds.has(legId) ||
          deletedIds.has(prefixedLegId) ||
          (bareLegId && deletedIds.has(bareLegId))
        ) {
          newSyncUpdates[`upload_file_mau/${k}`] = null
          continue
        }

        if (
          !legId ||
          syncedLegacyIds.has(k) ||
          syncedLegacyIds.has(legId) ||
          syncedLegacyIds.has(prefixedLegId) ||
          (bareLegId && syncedLegacyIds.has(bareLegId))
        ) {
          continue
        }

        const newId = prefixedLegId
        let migratedTpl = createStarterTemplateConfig(newId, legName.replace(/\.xlsx$/i, ''))
        migratedTpl.loai_mau = 'imported_excel'
        migratedTpl.link_file_goc = legUrl
        migratedTpl.ghi_chu = legNote || 'Đồng bộ tự động từ mẫu đã tải lên'
        migratedTpl.source_upload_id = legId

        // Try fetching and parsing the Excel file from legUrl so its grid & tokens are ready
        if (legUrl && legUrl.startsWith('http')) {
          try {
            const resp = await fetch(legUrl)
            if (resp.ok) {
              const buf = await resp.arrayBuffer()
              migratedTpl = await parseExcelBufferToTemplateConfig(buf, {
                id: newId,
                ten_mau: legName.replace(/\.xlsx$/i, ''),
                link_file_goc: legUrl,
                ghi_chu: legNote || 'Đồng bộ tự động từ mẫu đã tải lên',
                source_upload_id: legId
              })
            }
          } catch (err) {
            console.warn('Không thể tải trực tiếp file mẫu cũ khi đồng bộ, dùng cấu hình mặc định:', err)
          }
        }

        if (Array.isArray(legStruct) && legStruct.length > 0) {
          migratedTpl.cau_hinh_cot_bang = legStruct.map((col: any, idx: number) => ({
            colIndex: col.colIndex || (idx + 1),
            header: col.header || `Cột ${idx + 1}`,
            field: col.field || 'empty',
            token: LEGACY_FIELD_TO_TOKEN[col.field] || '',
            width: 15
          }))
        }

        migratedTpl = ensureGridHeaderPopulated(migratedTpl)
        templatesMap.set(newId, migratedTpl)
        newSyncUpdates[`mau_in_thiet_lap/${newId}`] = serializeTemplateForFirebase(migratedTpl)
      }
    }

    // 3. Ensure at least 1 default starter template exists if `mau_in_thiet_lap` is completely empty
    if (templatesMap.size === 0) {
      const defaultTpl = createStarterTemplateConfig('MINTL_DEFAULT_NTS', 'Mẫu Báo Giá Chuẩn NTS')
      defaultTpl.mac_dinh = true
      templatesMap.set(defaultTpl.id, defaultTpl)
      newSyncUpdates[`mau_in_thiet_lap/${defaultTpl.id}`] = serializeTemplateForFirebase(defaultTpl)
    } else {
      // Ensure at least one template has mac_dinh = true
      const hasDefault = Array.from(templatesMap.values()).some(t => t.mac_dinh)
      if (!hasDefault) {
        const first = Array.from(templatesMap.values())[0]
        first.mac_dinh = true
        newSyncUpdates[`mau_in_thiet_lap/${first.id}/mac_dinh`] = true
      }
    }

    // 4. Auto-seed built-in Deal Registration template (`MINTL_DEAL_REG`) if not yet present and not deleted by user
    if (!templatesMap.has('MINTL_DEAL_REG') && !deletedIds.has('MINTL_DEAL_REG')) {
      const dealRegTpl = createDealRegTemplateConfig('MINTL_DEAL_REG', 'Mẫu Deal Registration')
      dealRegTpl.mac_dinh = false
      templatesMap.set(dealRegTpl.id, dealRegTpl)
      newSyncUpdates[`mau_in_thiet_lap/${dealRegTpl.id}`] = serializeTemplateForFirebase(dealRegTpl)
    }

    // 5. Auto-seed built-in Agency / Dealer template (`MINTL_DAI_LY`) if not yet present and not deleted by user
    if (!templatesMap.has('MINTL_DAI_LY') && !deletedIds.has('MINTL_DAI_LY')) {
      const agencyTpl = createAgencyTemplateConfig('MINTL_DAI_LY', 'Mẫu Báo Giá Đại Lý')
      agencyTpl.mac_dinh = false
      templatesMap.set(agencyTpl.id, agencyTpl)
      newSyncUpdates[`mau_in_thiet_lap/${agencyTpl.id}`] = serializeTemplateForFirebase(agencyTpl)
    }

    if (Object.keys(newSyncUpdates).length > 0) {
      await update(dbRef(database), newSyncUpdates)
    }

    const list = Array.from(templatesMap.values())
    list.sort((a, b) => (b.mac_dinh ? 1 : 0) - (a.mac_dinh ? 1 : 0))
    return list
  } catch (e) {
    console.error('Lỗi fetchAndSyncPrintTemplates:', e)
    const fallback = createStarterTemplateConfig('MINTL_DEFAULT_NTS', 'Mẫu Báo Giá Chuẩn NTS')
    fallback.mac_dinh = true
    const dealRegFallback = createDealRegTemplateConfig('MINTL_DEAL_REG', 'Mẫu Deal Registration')
    const agencyFallback = createAgencyTemplateConfig('MINTL_DAI_LY', 'Mẫu Báo Giá Đại Lý')
    return [fallback, agencyFallback, dealRegFallback]
  }
}

export function serializeTemplateForFirebase(tpl: PrintTemplateConfig): any {
  const cloned = JSON.parse(JSON.stringify(tpl))
  const cleanColWidths = normalizeNumericIndexMap(cloned.col_widths)
  const cleanRowHeights = normalizeNumericIndexMap(cloned.row_heights)
  cloned.col_widths = cleanColWidths
  cloned.row_heights = cleanRowHeights

  // Đồng bộ cau_hinh_cot_bang theo các ô tiêu đề bảng & dòng mẫu sản phẩm hiện tại trên lưới
  const headerR = Number(cloned.mapping_vung?.dong_tieu_de_bang) || 0
  const itemR = Number(cloned.mapping_vung?.dong_mau_san_pham) || 0
  const totalCols = Math.max(Number(cloned.so_cot) || 9, 1)
  if (headerR > 0) {
    const prevCols: any[] = Array.isArray(cloned.cau_hinh_cot_bang) ? cloned.cau_hinh_cot_bang : []
    const syncedCols: PrintTemplateConfig['cau_hinh_cot_bang'] = []
    for (let c = 1; c <= totalCols; c++) {
      const prev = prevCols.find(x => Number(x?.colIndex) === c) || prevCols[c - 1]
      const hCellVal = cloned.grid_cells?.[`${headerR}_${c}`]?.value
      const iCellVal = itemR > 0 ? (cloned.grid_cells?.[`${itemR}_${c}`]?.value || '') : ''
      const headerText = hCellVal !== undefined ? String(hCellVal) : (prev?.header || `Cột ${c}`)
      const tokenMatch = String(iCellVal).match(/\{\{[A-Z0-9_]+\}\}/)
      const tokenStr = tokenMatch ? tokenMatch[0] : (prev?.token || '')
      const fieldStr = identifyHeaderField(headerText) || prev?.field || 'empty'
      syncedCols.push({
        colIndex: c,
        header: headerText,
        field: fieldStr,
        token: tokenStr,
        width: Math.max(4, Math.round((cleanColWidths[c] || 95) / 7.2))
      })
    }
    cloned.cau_hinh_cot_bang = syncedCols
  }

  return {
    ...cloned,
    ten_mau: (cloned.ten_mau || '').trim() || 'Mẫu in',
    ghi_chu: cloned.ghi_chu !== undefined && cloned.ghi_chu !== null ? String(cloned.ghi_chu) : '',
    ngay_cap_nhat: formatNowVN(),
    grid_cells_json: JSON.stringify(cloned.grid_cells || {}),
    merges_json: JSON.stringify(cloned.merges || []),
    col_widths_json: JSON.stringify(cleanColWidths),
    row_heights_json: JSON.stringify(cleanRowHeights),
    cau_hinh_cot_bang_json: JSON.stringify(cloned.cau_hinh_cot_bang || [])
  }
}

export async function savePrintTemplateToFirebase(tpl: PrintTemplateConfig): Promise<void> {
  const database = getDb()
  tpl.ngay_cap_nhat = formatNowVN()
  const payload = serializeTemplateForFirebase(tpl)

  const deletedIds = getLocalDeletedTemplateIds()
  const bareId = tpl.id.replace(/^MINTL_/, '')
  deletedIds.delete(tpl.id)
  if (bareId) deletedIds.delete(bareId)
  if (tpl.source_upload_id) deletedIds.delete(String(tpl.source_upload_id))
  saveLocalDeletedTemplateIds(deletedIds)

  const updates: Record<string, any> = {
    [`mau_in_thiet_lap/${tpl.id}`]: payload,
    [`mau_in_da_xoa/${tpl.id}`]: null
  }
  if (bareId) updates[`mau_in_da_xoa/${bareId}`] = null
  if (tpl.source_upload_id) updates[`mau_in_da_xoa/${tpl.source_upload_id}`] = null

  // Đồng bộ ngược sang upload_file_mau nếu có link_file_goc để tương thích hoàn toàn
  if (tpl.link_file_goc) {
    const legacyId = tpl.source_upload_id || tpl.id
    const structStr = JSON.stringify(
      (tpl.cau_hinh_cot_bang || []).map(c => ({
        colIndex: c.colIndex,
        header: c.header,
        field: c.field
      }))
    )
    updates[`upload_file_mau/${legacyId}`] = {
      ID: legacyId,
      id: legacyId,
      TEN_FILE: tpl.ten_mau.endsWith('.xlsx') ? tpl.ten_mau : `${tpl.ten_mau}.xlsx`,
      ten_file: tpl.ten_mau.endsWith('.xlsx') ? tpl.ten_mau : `${tpl.ten_mau}.xlsx`,
      LINK_FILE: tpl.link_file_goc,
      link_file: tpl.link_file_goc,
      STRUCTURE: structStr,
      structure: structStr,
      GHI_CHU: tpl.ghi_chu || '',
      ghi_chu: tpl.ghi_chu || ''
    }
  }

  await update(dbRef(database), updates)
}

export async function setDefaultPrintTemplateInFirebase(targetId: string, allTemplates: PrintTemplateConfig[]): Promise<void> {
  const database = getDb()
  const updates: Record<string, any> = {}
  allTemplates.forEach(t => {
    const isDef = t.id === targetId
    t.mac_dinh = isDef
    updates[`mau_in_thiet_lap/${t.id}/mac_dinh`] = isDef
  })
  await update(dbRef(database), updates)
}

export async function deletePrintTemplateFromFirebase(tpl: PrintTemplateConfig): Promise<void> {
  const database = getDb()
  const candidateIds = new Set<string>()
  if (tpl.id) {
    candidateIds.add(String(tpl.id))
    const bare = String(tpl.id).replace(/^MINTL_/, '')
    if (bare) {
      candidateIds.add(bare)
      candidateIds.add(`MINTL_${bare}`)
    }
  }
  if (tpl.source_upload_id) {
    const src = String(tpl.source_upload_id)
    candidateIds.add(src)
    candidateIds.add(`MINTL_${src}`)
    const bareSrc = src.replace(/^MINTL_/, '')
    if (bareSrc) candidateIds.add(bareSrc)
  }

  const deletedIds = getLocalDeletedTemplateIds()
  candidateIds.forEach(cid => deletedIds.add(cid))
  saveLocalDeletedTemplateIds(deletedIds)

  const updates: Record<string, any> = {}
  candidateIds.forEach(cid => {
    updates[`mau_in_thiet_lap/${cid}`] = null
    updates[`upload_file_mau/${cid}`] = null
    updates[`mau_in_da_xoa/${cid}`] = true
  })

  try {
    const [mauInSnap, legacySnap] = await Promise.all([
      get(dbRef(database, 'mau_in_thiet_lap')).catch(() => null),
      get(dbRef(database, 'upload_file_mau')).catch(() => null)
    ])

    if (mauInSnap && mauInSnap.exists()) {
      const mauInData = mauInSnap.val()
      if (mauInData && typeof mauInData === 'object') {
        for (const [k, v] of Object.entries(mauInData) as [string, any][]) {
          if (!v || typeof v !== 'object') continue
          const recId = String(v.id || k)
          const recSrc = v.source_upload_id ? String(v.source_upload_id) : ''
          if (candidateIds.has(k) || candidateIds.has(recId) || (recSrc && candidateIds.has(recSrc))) {
            updates[`mau_in_thiet_lap/${k}`] = null
            updates[`mau_in_da_xoa/${k}`] = true
            updates[`mau_in_da_xoa/${recId}`] = true
          }
        }
      }
    }

    if (legacySnap && legacySnap.exists()) {
      const legacyData = legacySnap.val()
      if (legacyData && typeof legacyData === 'object') {
        for (const [k, v] of Object.entries(legacyData) as [string, any][]) {
          if (!v) continue
          const legId = Array.isArray(v)
            ? String(v[0] || k)
            : String(v.ID ?? v.id ?? k)
          const legUrl = Array.isArray(v)
            ? String(v[2] || '')
            : String(v.LINK_FILE ?? v.link_file ?? '')
          const matchById = candidateIds.has(k) || candidateIds.has(legId) || candidateIds.has(`MINTL_${legId}`)
          const matchByUrl = Boolean(tpl.link_file_goc && legUrl && tpl.link_file_goc === legUrl)
          if (matchById || matchByUrl) {
            updates[`upload_file_mau/${k}`] = null
            updates[`mau_in_da_xoa/${k}`] = true
            if (legId) {
              updates[`mau_in_da_xoa/${legId}`] = true
              updates[`mau_in_da_xoa/MINTL_${legId}`] = true
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Lỗi quét xóa đồng bộ mẫu in:', err)
  }

  await update(dbRef(database), updates)
}


/* =====================================================
   7. ENGINE KẾT XUẤT ĐA ĐỊNH DẠNG (EXCEL, HTML, PDF, PNG, WORD)
===================================================== */
export interface QuoteExportRowItem {
  type: 'group' | 'item'
  roman?: string
  title?: string
  supplier?: string
  stt?: number | string
  item?: any
  // Pre-calculated values from baogiaFirebase
  donGiaKH?: number
  truocThue?: number
  vatAmount?: number
  sauThue?: number
  listPrice?: number
  giaTieuChuan?: number
  giaNhap?: number
  pctOffHang?: number | string
  pctOff?: number | string
  pctVat?: number | string
}

export interface QuoteExportContext {
  khach: {
    Ma_khach_hang?: string
    Ten_khach_hang?: string
    Ten_cong_ty?: string
    COMPANY?: string
    Dia_chi_cong_ty?: string
    ADDRESS?: string
    MST?: string
    So_dien_thoai_cong_ty?: string
    So_dien_thoai_ca_nhan?: string
    TEL?: string
    Email_cong_ty?: string
    Email_ca_nhan?: string
    So_fax_cong_ty?: string
    Website_cong_ty?: string
    WEBSITE?: string
    [key: string]: any
  }
  maHopDong: string
  soHopDong: string
  soPO: string
  noiDungPO: string
  currency: 'VND' | 'USD'
  tiGia: number
  rows: QuoteExportRowItem[]
  totals: {
    truoc: number
    vat: number
    sau: number
    off: number
  }
  termsHtml: string
  noTerms?: boolean
  customDefaultFont?: { name: string; size: number }
  dealReg?: Record<string, any>
  previewCellOverrides?: Record<string, PreviewCellOverride>
  previewColWidthOverrides?: Record<number, number>
  previewRowHeightOverrides?: Record<number, number>
}

export interface PreviewCellOverride {
  html?: string
  text?: string
  style?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    align?: 'left' | 'center' | 'right'
    color?: string
    bgColor?: string
    fontSize?: number
  }
}

export function resolveEffectiveTermsHtml(ctx: QuoteExportContext): string {
  if (ctx.noTerms) return ''
  if (ctx.termsHtml !== undefined && ctx.termsHtml !== null) {
    return ctx.termsHtml
  }
  return getDefaultTermsHtmlFromCache()
}

export function formatPctNumber(val: any): number {
  const n = Number(val)
  if (!Number.isFinite(n)) return 0
  return Number(n.toFixed(2))
}

export function formatPctDisplay(val: any): string {
  return `${formatPctNumber(val)}%`
}

export function getExcelPctNumFmt(pctVal: number): string {
  return Number.isInteger(pctVal) ? '0%' : '0.##%'
}

const CENTER_DEFAULT_TOKENS = new Set([
  '{{STT}}',
  '{{SO_LUONG}}',
  '{{DL_OFF_NTS}}',
  '{{PHAN_TRAM_OFF}}',
  '{{PHAN_TRAM_OFF_HANG}}',
  '{{PHAN_TRAM_VAT}}'
])

const RIGHT_DEFAULT_TOKENS = new Set([
  '{{LIST_PRICE}}',
  '{{GIA_TIEU_CHUAN}}',
  '{{GIA_NHAP}}',
  '{{GIA_HARDWARE}}',
  '{{DON_GIA_KH}}',
  '{{DON_GIA_USD}}',
  '{{GIA_TIEU_CHUAN_USD}}',
  '{{GIA_NHAP_USD}}',
  '{{TT_TRUOC_THUE}}',
  '{{TT_TRUOC_THUE_USD}}',
  '{{TIEN_VAT}}',
  '{{TT_SAU_THUE}}',
  '{{DL_NHAP_KHAU}}',
  '{{DL_DON_GIA_LP}}',
  '{{DL_DON_GIA_SAU_OFF}}',
  '{{DL_THANH_TIEN_USD}}',
  '{{DL_TY_GIA}}',
  '{{DL_VND_NTS}}',
  '{{DL_TIEN_VAT}}',
  '{{DL_TONG_CONG_VAT}}',
  '{{TONG_TRUOC_THUE}}',
  '{{TONG_TRUOC_THUE_USD}}',
  '{{TONG_TIEN_VAT}}',
  '{{TONG_SAU_THUE}}',
  '{{TONG_MUC_OFF}}',
  '{{TONG_GIAM_GIA}}',
  '{{DA_THANH_TOAN}}',
  '{{CON_PHAI_THU}}',
  '{{CONG_NO_CU}}',
  '{{CHIET_KHAU_TONG}}',
  '{{DL_TONG_USD}}',
  '{{DL_TONG_VND}}',
  '{{DL_TONG_VAT}}',
  '{{DL_TONG_SAU_THUE}}'
])

export function resolveCellHorizontalAlign(
  rawCellVal: string,
  explicitAlign?: 'left' | 'center' | 'right'
): 'left' | 'center' | 'right' {
  if (explicitAlign === 'left' || explicitAlign === 'center' || explicitAlign === 'right') {
    return explicitAlign
  }
  const trimmed = normalizeLegacyTokenSyntax(rawCellVal || '').trim()
  if (CENTER_DEFAULT_TOKENS.has(trimmed)) return 'center'
  if (RIGHT_DEFAULT_TOKENS.has(trimmed)) return 'right'
  return 'left'
}

export function createMockQuoteContext(_tpl: PrintTemplateConfig): QuoteExportContext {
  return {
    khach: {
      Ma_khach_hang: 'KH_DEMO_01',
      Ten_khach_hang: 'Anh Nguyễn Văn Minh',
      Ten_cong_ty: 'CÔNG TY CỔ PHẦN GIẢI PHÁP SỐ ĐẠI DƯƠNG',
      COMPANY: 'OCEAN DIGITAL SOLUTIONS CORPORATION',
      Dia_chi_cong_ty: 'Tầng 12, Tòa nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10, TP.HCM',
      MST: '0314567890',
      So_dien_thoai_cong_ty: '0909 888 999',
      Email_cong_ty: 'minh.nguyen@daiduongdigital.vn',
      So_fax_cong_ty: '028 3868 9999',
      Website_cong_ty: 'www.daiduongdigital.vn'
    },
    maHopDong: 'HD20261019',
    soHopDong: 'HĐ168',
    soPO: 'PO-168',
    noiDungPO: 'Báo giá thiết bị tường lửa Sophos XGS',
    currency: 'VND',
    tiGia: 25400,
    rows: [
      {
        type: 'group',
        roman: 'I',
        title: 'FIREWALL SOPHOS XGS 88 / XGS 118',
        supplier: 'Sophos'
      },
      {
        type: 'item',
        stt: 1,
        item: {
          Ma_hang: 'XGS-88',
          sku_code: 'XGS88S12-ZZ01',
          Ten_hang: 'Thiết bị tường lửa Sophos XGS 88 kèm bản quyền 12 tháng Standard Protection.',
          Description: 'Sophos XGS 88 Standard Protection - 12 MOS',
          Features: 'Thiết bị tường lửa Sophos XGS 88 kèm bản quyền 12 tháng Standard Protection.\n- Firewall throughput: 9,900 Mbps\n- Firewall IMIX: 6,000 Mbps\n- Bảo hành: 12 tháng theo tiêu chuẩn của nhà sản xuất',
          Ten_nha_cung_cap: 'Sophos',
          Danh_muc: 'FIREWALL SOPHOS XGS 88 / XGS 118',
          DVT: 'Thiết bị',
          License_duration: '12 tháng',
          thoi_han_bao_hanh: '12 tháng',
          volume: '1',
          So_luong: 1,
          Don_gia: 2479.5,
          gia_nhap: 340,
          muc_phan_tram_off: 35,
          Ti_gia: 26600,
          Thue_VAT: 8,
          Ghi_chu: ''
        },
        listPrice: 28000000,
        giaTieuChuan: 26395000,
        giaNhap: 22000000,
        pctOffHang: 0,
        pctOff: 35,
        donGiaKH: 26395000,
        truocThue: 26395000,
        pctVat: 8,
        vatAmount: 2111600,
        sauThue: 28506600
      },
      {
        type: 'item',
        stt: 2,
        item: {
          Ma_hang: 'XGS-118',
          sku_code: 'XGS118S12-ZZ01',
          Ten_hang: 'Thiết bị tường lửa Sophos XGS 118 kèm bản quyền 12 tháng Standard Protection.',
          Description: 'Sophos XGS 118 Standard Protection - 12 MOS',
          Features: 'Thiết bị tường lửa Sophos XGS 118 kèm bản quyền 12 tháng Standard Protection.\n- Firewall throughput: 15,500 Mbps\n- Firewall IMIX: 8,500 Mbps\n- Bảo hành: 12 tháng theo tiêu chuẩn của nhà sản xuất',
          Ten_nha_cung_cap: 'Sophos',
          Danh_muc: 'FIREWALL SOPHOS XGS 88 / XGS 118',
          DVT: 'Thiết bị',
          License_duration: '12 tháng',
          thoi_han_bao_hanh: '12 tháng',
          volume: '1',
          So_luong: 1,
          Don_gia: 1955.5,
          gia_nhap: 0,
          muc_phan_tram_off: 35,
          Ti_gia: 26600,
          Thue_VAT: 8,
          Ghi_chu: ''
        },
        listPrice: 44000000,
        giaTieuChuan: 41664000,
        giaNhap: 35000000,
        pctOffHang: 0,
        pctOff: 35,
        donGiaKH: 41664000,
        truocThue: 41664000,
        pctVat: 8,
        vatAmount: 3333120,
        sauThue: 44997120
      }
    ],
    totals: {
      truoc: 68059000,
      vat: 5444720,
      sau: 73503720,
      off: 0
    },
    termsHtml: getDefaultTermsHtmlFromCache()
  }
}

export function formatMoneyVal(val: number, currency: 'VND' | 'USD'): string {
  const n = Number(val) || 0
  if (currency === 'USD') {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return Math.round(n).toLocaleString('vi-VN')
}

export function computeAgencyTotals(ctx: QuoteExportContext): {
  tongUsd: number
  tongVnd: number
  tongVat: number
  tongSauThue: number
} {
  let tongUsd = 0
  let tongVnd = 0
  let tongVat = 0
  let tongSauThue = 0
  const curr = ctx.currency || 'VND'

  ;(ctx.rows || []).forEach(r => {
    if (r.type !== 'item') return
    const it = r.item || {}
    const sl = Number(it.So_luong) || 1
    const dlTyGia = Number(it.Ti_gia) > 0 ? Number(it.Ti_gia) : (Number(ctx.tiGia) > 1 ? Number(ctx.tiGia) : 26600)
    const lp = Number(r.listPrice) || 0
    const gn = Number(r.giaNhap) || 0
    const dlLpUsd =
      it.Don_gia !== undefined && it.Don_gia !== null && it.Don_gia !== ''
        ? Number(it.Don_gia) || 0
        : curr === 'USD'
          ? lp
          : dlTyGia > 1
            ? lp / dlTyGia
            : lp
    const dlNhapKhauUsd =
      it.gia_nhap !== undefined && it.gia_nhap !== null && it.gia_nhap !== ''
        ? Number(it.gia_nhap) || 0
        : curr === 'USD'
          ? gn
          : dlTyGia > 1
            ? gn / dlTyGia
            : gn
    const dlOffPct = formatPctNumber(
      it.muc_phan_tram_off !== undefined && it.muc_phan_tram_off !== null && it.muc_phan_tram_off !== ''
        ? it.muc_phan_tram_off
        : r.pctOff
    )
    const dlVatPct = formatPctNumber(
      it.Thue_VAT !== undefined && it.Thue_VAT !== null && it.Thue_VAT !== ''
        ? it.Thue_VAT
        : r.pctVat !== undefined && r.pctVat !== null && r.pctVat !== ''
          ? r.pctVat
          : 8
    )

    const hRes = dlLpUsd * (1 - dlOffPct / 100) + dlNhapKhauUsd
    const iRes = hRes * sl
    const kRes = iRes * dlTyGia
    const lRes = kRes * (dlVatPct / 100)
    const mRes = kRes + lRes

    tongUsd += iRes
    tongVnd += kRes
    tongVat += lRes
    tongSauThue += mRes
  })

  return {
    tongUsd,
    tongVnd,
    tongVat,
    tongSauThue
  }
}

export function buildGlobalTokenMap(tpl: PrintTemplateConfig, ctx: QuoteExportContext): Record<string, string> {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = String(now.getFullYear())
  const sender = tpl.thong_tin_nguoi_lap || ({} as any)
  const k = (ctx.khach || {}) as any
  const curr = ctx.currency || 'VND'
  const cAny = ctx as any

  const tenCongTy = k.Ten_cong_ty || k.COMPANY || ''
  const tenCongTyEn = k.COMPANY || k.company || k.Ten_cong_ty || ''
  const tenCongTyVn = k.INV_CONG_TY || k.Ten_cong_ty || k.COMPANY || ''
  const tenKhachHang = k.Ten_khach_hang || k.CUS_CONTACT || k.CONTACT || k.Ten_khach_hang_phu || ''
  const diaChiKH = k.Dia_chi_cong_ty || k.ADDRESS || k.address || ''
  const websiteKH = k.Website_cong_ty || k.Website || k.WEBSITE || k.website || ''

  const rate = Number(ctx.tiGia) > 1 ? Number(ctx.tiGia) : 25400
  const tongTruocUsd = curr === 'USD' ? ctx.totals.truoc : (ctx.totals.truoc / rate)
  const dlTotals = computeAgencyTotals(ctx)

  return {
    '{{TEN_CONG_TY}}': tenCongTy,
    '{{TEN_CONG_TY_EN}}': tenCongTyEn,
    '{{TEN_CONG_TY_VN}}': tenCongTyVn,
    '{{tên công ty}}': tenCongTy,
    '{{ tên công ty }}': tenCongTy,
    '{{TEN_KHACH_HANG}}': tenKhachHang,
    '{{tên khách hàng}}': tenKhachHang,
    '{{ tên khách hàng }}': tenKhachHang,
    '{{MA_KHACH_HANG}}': k.Ma_khach_hang || '',
    '{{DIA_CHI_KH}}': diaChiKH,
    '{{địa chỉ công ty}}': diaChiKH,
    '{{ địa chỉ công ty }}': diaChiKH,
    '{{MST_KH}}': k.MST || '',
    '{{SDT_KH}}': k.So_dien_thoai_cong_ty || k.So_dien_thoai_ca_nhan || k.So_dien_thoai_ca_nhan_phu || k.TEL || '',
    '{{MOBILE_KH}}': k.So_dien_thoai_ca_nhan || k.MOBILE || k.So_dien_thoai_cong_ty || '',
    '{{EMAIL_KH}}': k.Email_cong_ty || k.Email_ca_nhan || k.EMAIL || '',
    '{{FAX_KH}}': k.So_fax_cong_ty || k.FAX || '',
    '{{CHUC_VU_KH}}': k.Chuc_vu || k.chuc_vu || '',
    '{{PHONG_BAN_KH}}': k.Phong_ban || k.phong_ban || '',
    '{{WEBSITE_KH}}': websiteKH,

    // DealReg fields
    '{{DR_COUNTRY}}': k.DR_COUNTRY || cAny.dealReg?.country || cAny.drCountry || 'VIET NAM',
    '{{DR_EXISTING_CUST}}': k.DR_EXISTING_CUST || cAny.dealReg?.isExistingCustomer || cAny.drExistingCust || 'Yes',
    '{{DR_SIZE}}': k.DR_SIZE || cAny.dealReg?.companySize || cAny.drSize || '100',
    '{{DR_BUDGET}}': k.DR_BUDGET || cAny.dealReg?.budget || cAny.drBudget || formatMoneyVal(tongTruocUsd, 'USD'),
    '{{DR_CLOSE_DATE}}': k.DR_CLOSE_DATE || cAny.dealReg?.closeDate || cAny.drCloseDate || `${dd}/${mm}/${yyyy}`,
    '{{DR_COMP}}': k.DR_COMP || cAny.dealReg?.competition || cAny.drComp || 'Fortinet',
    '{{DR_POC}}': k.DR_POC || cAny.dealReg?.pocSchedule || cAny.drPoc || '',
    '{{DR_PARTNER_NAME}}': k.DR_PARTNER_NAME || cAny.dealReg?.partnerName || cAny.drPartnerName || sender.ten_cong_ty_ban || 'Nam Truong Son System Integration Corp',
    '{{DR_PARTNER_ADDRESS}}': k.DR_PARTNER_ADDRESS || cAny.dealReg?.partnerAddress || cAny.drPartnerAddress || sender.dia_chi_cong_ty_ban || '55/10 Trần Đình Xu, Phường Cầu Kho, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
    '{{DR_AM_NAME}}': k.DR_AM_NAME || cAny.dealReg?.amName || cAny.drAmName || sender.ten_nguoi_lap || 'LÊ PHI SƠN',
    '{{DR_AM_EMAIL}}': k.DR_AM_EMAIL || cAny.dealReg?.amEmail || cAny.drAmEmail || sender.email || 'sonlp@nts.com.vn',
    '{{DR_AM_PHONE}}': k.DR_AM_PHONE || cAny.dealReg?.amPhone || cAny.drAmPhone || sender.so_dien_thoai || '090 8137488',
    '{{DR_REMARKS}}': k.DR_REMARKS || cAny.dealReg?.remarks || cAny.drRemarks || cAny.ghiChu || 'Mua sắm độc lập, không theo dự án',

    '{{NGAY_BAO_GIA}}': `${dd}/${mm}/${yyyy}`,
    '{{NGAY}}': dd,
    '{{THANG}}': mm,
    '{{NAM}}': yyyy,
    '{{MA_HOP_DONG}}': ctx.maHopDong || '',
    '{{SO_HOP_DONG}}': ctx.soHopDong || '',
    '{{SO_PO}}': ctx.soPO || '',
    '{{TEN_PO}}': cAny.tenPO || ctx.noiDungPO || '',
    '{{NOI_DUNG_PO}}': ctx.noiDungPO || '',
    '{{GHI_CHU_BAO_GIA}}': cAny.ghiChu || '',
    '{{TRANG_THAI_HD}}': cAny.trangThaiHD || 'Chính thức',
    '{{TRANG_THAI_TT}}': cAny.trangThaiTT || 'Chưa thanh toán đủ',
    '{{DON_VI_TIEN_TE}}': curr,
    '{{TI_GIA}}': formatMoneyVal(ctx.tiGia || 1, 'VND'),

    '{{NGUOI_LAP}}': sender.ten_nguoi_lap || 'Le Phi Son',
    '{{CHUC_VU_NGUOI_LAP}}': sender.chuc_vu || 'Phó giám đốc NTS',
    '{{SDT_NGUOI_LAP}}': sender.so_dien_thoai || '090 813 7488',
    '{{EMAIL_NGUOI_LAP}}': sender.email || 'info@ntssi.vn',
    '{{TEN_CONG_TY_BAN}}': sender.ten_cong_ty_ban || 'NTS System Integration Corp.',
    '{{DIA_CHI_CONG_TY_BAN}}': sender.dia_chi_cong_ty_ban || '20 Tang Bat Ho Street, Ward 11, Binh Thanh District, Ho Chi Minh City, VN',
    '{{HIEU_LUC_BAO_GIA}}': sender.hieu_luc_bao_gia || '15 ngày',
    '{{LOGO}}': '',
    '{{LOGO_TRAI}}': '',
    '{{LOGO_PHAI}}': '',

    '{{TONG_TRUOC_THUE}}': formatMoneyVal(ctx.totals.truoc, curr),
    '{{TONG_TRUOC_THUE_USD}}': formatMoneyVal(tongTruocUsd, 'USD'),
    '{{TONG_TIEN_VAT}}': formatMoneyVal(ctx.totals.vat, curr),
    '{{TONG_SAU_THUE}}': formatMoneyVal(ctx.totals.sau, curr),
    '{{TONG_MUC_OFF}}': formatMoneyVal(ctx.totals.off, curr),
    '{{TONG_GIAM_GIA}}': formatMoneyVal(cAny.totals?.giamGia || ctx.totals.off || 0, curr),
    '{{DA_THANH_TOAN}}': formatMoneyVal(cAny.totals?.daThanhToan || 0, curr),
    '{{CON_PHAI_THU}}': formatMoneyVal(cAny.totals?.conPhaiThu ?? ctx.totals.sau, curr),
    '{{CONG_NO_CU}}': formatMoneyVal(cAny.totals?.congNoCu || 0, curr),
    '{{CHIET_KHAU_TONG}}': formatMoneyVal(cAny.totals?.chietKhauTong || 0, curr),
    '{{PHAN_TRAM_CK_TONG}}': `${cAny.totals?.phanTramCKTong || 0}%`,
    '{{SO_TIEN_BANG_CHU}}': numberToWordsVN(ctx.totals.sau, curr),

    // Agency / Dealer Totals
    '{{DL_TONG_USD}}': formatMoneyVal(dlTotals.tongUsd, 'USD'),
    '{{DL_TONG_VND}}': formatMoneyVal(dlTotals.tongVnd, 'VND'),
    '{{DL_TONG_VAT}}': formatMoneyVal(dlTotals.tongVat, 'VND'),
    '{{DL_TONG_SAU_THUE}}': formatMoneyVal(dlTotals.tongSauThue, 'VND')
  }
}

export function buildRowTokenMap(
  rowItem: QuoteExportRowItem,
  ctx: QuoteExportContext,
  globalMap: Record<string, string>
): { textMap: Record<string, string>; rawNumberMap: Record<string, number> } {
  const curr = ctx.currency || 'VND'
  if (rowItem.type === 'group') {
    return {
      textMap: {
        ...globalMap,
        '{{NHOM_STT}}': String(rowItem.roman || ''),
        '{{NHOM_TEN}}': String(rowItem.title || '').toUpperCase(),
        '{{NHOM_NCC}}': String(rowItem.supplier || '')
      },
      rawNumberMap: {}
    }
  }

  const it = rowItem.item || {}
  const sl = Number(it.So_luong) || 1
  const lp = Number(rowItem.listPrice) || 0
  const gtc = Number(rowItem.giaTieuChuan) || 0
  const gn = Number(rowItem.giaNhap) || 0
  const ghw = Number(it.gia_hardware) || 0
  const dg = Number(rowItem.donGiaKH) || 0
  const dgUsd = Number(it.Don_giaUSD ?? it.Don_giaUS) || 0
  const gtcUsd = Number(it.Gia_tieu_chuanUSD) || 0
  const gnUsd = Number(it.gia_nhapUSD) || 0
  const tt = Number(rowItem.truocThue) || 0
  const itemRate = Number(it.Ti_gia || ctx.tiGia) > 1 ? Number(it.Ti_gia || ctx.tiGia) : 25400
  const ttUsd = curr === 'USD' ? tt : (tt / itemRate)
  const vat = Number(rowItem.vatAmount) || 0
  const st = Number(rowItem.sauThue) || 0
  const desc = it.Features || [it.Mo_ta_chung, it.Mo_ta_chi_tiet].filter(Boolean).join('\n') || it.Ten_hang || ''

  // Agency / Dealer item calculations (matching exportAgencyExcel in baogiaFirebase)
  const dlTyGia = Number(it.Ti_gia) > 0 ? Number(it.Ti_gia) : (Number(ctx.tiGia) > 1 ? Number(ctx.tiGia) : 26600)
  const dlLpUsd =
    it.Don_gia !== undefined && it.Don_gia !== null && it.Don_gia !== ''
      ? Number(it.Don_gia) || 0
      : curr === 'USD'
        ? lp
        : dlTyGia > 1
          ? lp / dlTyGia
          : lp
  const dlNhapKhauUsd =
    it.gia_nhap !== undefined && it.gia_nhap !== null && it.gia_nhap !== ''
      ? Number(it.gia_nhap) || 0
      : curr === 'USD'
        ? gn
        : dlTyGia > 1
          ? gn / dlTyGia
          : gn
  const dlOffPct = formatPctNumber(
    it.muc_phan_tram_off !== undefined && it.muc_phan_tram_off !== null && it.muc_phan_tram_off !== ''
      ? it.muc_phan_tram_off
      : rowItem.pctOff
  )
  const dlVatPct = formatPctNumber(
    it.Thue_VAT !== undefined && it.Thue_VAT !== null && it.Thue_VAT !== ''
      ? it.Thue_VAT
      : rowItem.pctVat !== undefined && rowItem.pctVat !== null && rowItem.pctVat !== ''
        ? rowItem.pctVat
        : 8
  )
  const pctOffHangVal = formatPctNumber(rowItem.pctOffHang)
  const pctOffVal = formatPctNumber(rowItem.pctOff)
  const pctVatVal = formatPctNumber(rowItem.pctVat)

  const dlDonGiaSauOffUsd = dlLpUsd * (1 - dlOffPct / 100) + dlNhapKhauUsd
  const dlThanhTienUsd = dlDonGiaSauOffUsd * sl
  const dlVndNts = dlThanhTienUsd * dlTyGia
  const dlTienVat = dlVndNts * (dlVatPct / 100)
  const dlTongCongVat = dlVndNts + dlTienVat

  return {
    textMap: {
      ...globalMap,
      '{{STT}}': String(rowItem.stt ?? ''),
      '{{MA_HANG}}': String(it.Ma_hang || ''),
      '{{SKU}}': String(it.sku_code || it.SKU || it.sku || it.ma_sku || it.Ma_hang || ''),
      '{{SKU_CODE}}': String(it.sku_code || it.SKU || it.sku || it.ma_sku || it.Ma_hang || ''),
      '{{TEN_HANG}}': String(it.Ten_hang || ''),
      '{{DESCRIPTION}}': String(it.Description || ''),
      '{{DIEN_GIAI}}': String(desc || ''),
      '{{MO_TA_CHUNG}}': String(it.Mo_ta_chung || ''),
      '{{MO_TA_CHI_TIET}}': String(it.Mo_ta_chi_tiet || ''),
      '{{MA_NCC}}': String(it.Ma_nha_cung_cap || ''),
      '{{HANG}}': String(it.Ten_nha_cung_cap || it.Ma_nha_cung_cap || ''),
      '{{DANH_MUC}}': String(it.Danh_muc || ''),
      '{{DVT}}': String(it.DVT || ''),
      '{{THOI_HAN}}': String(it.License_duration || ''),
      '{{BAO_HANH}}': String(it.thoi_han_bao_hanh || it.thoi_gian_bao_hanh || ''),
      '{{NGAY_BAT_DAU}}': String(it.start_date || ''),
      '{{NGAY_KET_THUC}}': String(it.end_date || ''),
      '{{LOAI_GIA_HAN}}': String(it.is_giahan || ''),
      '{{VOLUME}}': String(it.volume || ''),
      '{{SO_LUONG}}': String(sl),
      '{{LIST_PRICE}}': formatMoneyVal(lp, curr),
      '{{GIA_TIEU_CHUAN}}': formatMoneyVal(gtc, curr),
      '{{PHAN_TRAM_OFF_HANG}}': `${pctOffHangVal}%`,
      '{{GIA_NHAP}}': formatMoneyVal(gn, curr),
      '{{GIA_HARDWARE}}': formatMoneyVal(ghw, curr),
      '{{PHAN_TRAM_OFF}}': `${pctOffVal}%`,
      '{{DON_GIA_KH}}': formatMoneyVal(dg, curr),
      '{{DON_GIA_USD}}': formatMoneyVal(dgUsd, 'USD'),
      '{{GIA_TIEU_CHUAN_USD}}': formatMoneyVal(gtcUsd, 'USD'),
      '{{GIA_NHAP_USD}}': formatMoneyVal(gnUsd, 'USD'),
      '{{TT_TRUOC_THUE}}': formatMoneyVal(tt, curr),
      '{{TT_TRUOC_THUE_USD}}': formatMoneyVal(ttUsd, 'USD'),
      '{{PHAN_TRAM_VAT}}': `${pctVatVal}%`,
      '{{TIEN_VAT}}': formatMoneyVal(vat, curr),
      '{{TT_SAU_THUE}}': formatMoneyVal(st, curr),
      '{{GHI_CHU_SP}}': String(it.Ghi_chu || ''),
      '{{DL_NHAP_KHAU}}': dlNhapKhauUsd ? formatMoneyVal(dlNhapKhauUsd, 'USD') : '-',
      '{{DL_DON_GIA_LP}}': formatMoneyVal(dlLpUsd, 'USD'),
      '{{DL_OFF_NTS}}': `${dlOffPct}%`,
      '{{DL_DON_GIA_SAU_OFF}}': formatMoneyVal(dlDonGiaSauOffUsd, 'USD'),
      '{{DL_THANH_TIEN_USD}}': formatMoneyVal(dlThanhTienUsd, 'USD'),
      '{{DL_TY_GIA}}': formatMoneyVal(dlTyGia, 'VND'),
      '{{DL_VND_NTS}}': formatMoneyVal(dlVndNts, 'VND'),
      '{{DL_TIEN_VAT}}': formatMoneyVal(dlTienVat, 'VND'),
      '{{DL_TONG_CONG_VAT}}': formatMoneyVal(dlTongCongVat, 'VND')
    },
    rawNumberMap: {
      '{{SO_LUONG}}': sl,
      '{{LIST_PRICE}}': lp,
      '{{GIA_TIEU_CHUAN}}': gtc,
      '{{GIA_NHAP}}': gn,
      '{{GIA_HARDWARE}}': ghw,
      '{{DON_GIA_KH}}': dg,
      '{{DON_GIA_USD}}': dgUsd,
      '{{GIA_TIEU_CHUAN_USD}}': gtcUsd,
      '{{GIA_NHAP_USD}}': gnUsd,
      '{{TT_TRUOC_THUE}}': tt,
      '{{TT_TRUOC_THUE_USD}}': Number(ttUsd.toFixed(2)),
      '{{TIEN_VAT}}': vat,
      '{{TT_SAU_THUE}}': st,
      '{{DL_NHAP_KHAU}}': dlNhapKhauUsd,
      '{{DL_DON_GIA_LP}}': dlLpUsd,
      '{{DL_OFF_NTS}}': dlOffPct / 100,
      '{{DL_DON_GIA_SAU_OFF}}': dlDonGiaSauOffUsd,
      '{{DL_THANH_TIEN_USD}}': dlThanhTienUsd,
      '{{DL_TY_GIA}}': dlTyGia,
      '{{DL_VND_NTS}}': dlVndNts,
      '{{DL_TIEN_VAT}}': dlTienVat,
      '{{DL_TONG_CONG_VAT}}': dlTongCongVat
    }
  }
}

export function replaceTokensInText(text: string, tokenMap: Record<string, string>): string {
  if (!text) return ''
  let out = text
  for (const [tk, val] of Object.entries(tokenMap)) {
    if (out.includes(tk)) {
      out = out.split(tk).join(val ?? '')
    }
  }
  return out
}

/* =====================================================
   8. RENDER HTML ĐỂ XEM TRƯỚC / IN PDF / XUẤT PNG / XUẤT HTML
===================================================== */
export function renderTemplateToHtml(tpl: PrintTemplateConfig, ctx: QuoteExportContext): string {
  const globalMap = buildGlobalTokenMap(tpl, ctx)
  const vung = tpl.mapping_vung || {
    dong_tieu_de_bang: 7,
    dong_mau_nhom: 8,
    dong_mau_san_pham: 9,
    danh_sach_dong_tong: [10],
    dong_dieu_khoan: 12,
    dong_chu_ky: 13
  }
  const pageCfg = tpl.cau_hinh_trang || ({} as any)
  const fontFamily = pageCfg.font_mac_dinh || 'Arial, Calibri, sans-serif'
  const baseFontSize = pageCfg.co_chu_mac_dinh || 10
  const totalCols = Math.max(tpl.so_cot || 9, 1)
  const totalRows = Math.max(tpl.so_dong || 18, 1)

  const logoWidthPct = Math.max(5, Math.min(100, Number(pageCfg.logo_width_pct) || 100))
  const logoHeight = Math.max(24, Math.min(500, Number(pageCfg.logo_height) || 68))
  const logoUrl = pageCfg.logo_url || pageCfg.logo_trai || '/logo1.png'
  const showLogo = pageCfg.hien_thi_logo !== false
  const showColorLine = pageCfg.hien_thi_line_mau !== false

  const singleLogoHtml = showLogo && logoUrl
    ? `<img src="${logoUrl}" style="width: ${logoWidthPct}%; height: ${logoHeight}px; object-fit: fill; display: block;" onerror="this.style.display='none'" />`
    : ''

  // Check if grid already contains {{LOGO}} or {{LOGO_TRAI}}
  const hasGridLogoToken = Object.values(tpl.grid_cells || {}).some(
    c => c?.value?.includes('{{LOGO}}') || c?.value?.includes('{{LOGO_TRAI}}')
  )

  const groupRowIdx = Number(vung.dong_mau_nhom) || 0
  const itemRowIdx = Number(vung.dong_mau_san_pham) || 9

  // Helper to get horizontal merges on a specific template row
  const getRowMerges = (r: number) => {
    const map = new Map<number, { colspan: number; rowspan: number }>()
    const skipped = new Set<number>()
    ;(tpl.merges || []).forEach(m => {
      if (m.top === r && m.bottom === r && m.right > m.left) {
        map.set(m.left, { colspan: m.right - m.left + 1, rowspan: 1 })
        for (let c = m.left + 1; c <= m.right; c++) skipped.add(c)
      }
    })
    return { map, skipped }
  }

  // Build expanded rows list
  interface ExpandedRow {
    sourceRow: number
    rowType: 'normal' | 'group' | 'item' | 'terms'
    tokenMap: Record<string, string>
    height?: number
    qRowIdx?: number
  }

  const expandedRows: ExpandedRow[] = []
  let continuousItemStt = 0
  for (let r = 1; r <= totalRows; r++) {
    if (r === groupRowIdx && groupRowIdx > 0) {
      continue
    }
    if (r === itemRowIdx) {
      ctx.rows.forEach((qRow, qRowIdx) => {
        if (qRow.type === 'group') {
          if (groupRowIdx > 0) {
            const { textMap } = buildRowTokenMap(qRow, ctx, globalMap)
            expandedRows.push({
              sourceRow: groupRowIdx,
              rowType: 'group',
              tokenMap: textMap,
              height: tpl.row_heights?.[groupRowIdx],
              qRowIdx
            })
          }
        } else {
          continuousItemStt++
          const { textMap } = buildRowTokenMap(qRow, ctx, globalMap)
          if (groupRowIdx <= 0) {
            textMap['{{STT}}'] = String(continuousItemStt)
          }
          expandedRows.push({
            sourceRow: itemRowIdx,
            rowType: 'item',
            tokenMap: textMap,
            height: tpl.row_heights?.[itemRowIdx],
            qRowIdx
          })
        }
      })
      continue
    }

    let hasTermsToken = false
    for (let c = 1; c <= totalCols; c++) {
      if (tpl.grid_cells?.[`${r}_${c}`]?.value?.includes('{{DIEU_KHOAN}}')) {
        hasTermsToken = true
        break
      }
    }

    expandedRows.push({
      sourceRow: r,
      rowType: hasTermsToken ? 'terms' : 'normal',
      tokenMap: globalMap,
      height: tpl.row_heights?.[r]
    })
  }

  const getColW = (c: number) => Math.max(0, ctx.previewColWidthOverrides?.[c] ?? tpl.col_widths?.[c] ?? 100)

  // Compute total width and column percentages (preserving 0px columns)
  let sumColWidths = 0
  for (let c = 1; c <= totalCols; c++) {
    sumColWidths += getColW(c)
  }
  const safeSumCols = Math.max(1, sumColWidths)

  let colgroupHtml = '<colgroup>'
  for (let c = 1; c <= totalCols; c++) {
    const w = getColW(c)
    const pct = sumColWidths === 0 ? '0.00' : ((w / safeSumCols) * 100).toFixed(2)
    colgroupHtml += `<col data-col-idx="${c}" style="width: ${pct}%;" />`
  }
  colgroupHtml += '</colgroup>'

  const effectiveTermsHtml = resolveEffectiveTermsHtml(ctx)
  const parsedTermsLines = resolveParsedTermsForTemplate(tpl, ctx)

  const findColLetterByItemToken = (token: string): string | null => {
    for (let c = 1; c <= totalCols; c++) {
      if ((tpl.grid_cells?.[`${itemRowIdx}_${c}`]?.value || '').trim() === token) {
        return colIndexToLetter(c)
      }
    }
    return null
  }
  const colQtyL = findColLetterByItemToken('{{SO_LUONG}}')
  const colPriceKhL = findColLetterByItemToken('{{DON_GIA_KH}}')
  const colTruocThueL = findColLetterByItemToken('{{TT_TRUOC_THUE}}')
  const colTienVatL = findColLetterByItemToken('{{TIEN_VAT}}')
  const colSauThueL = findColLetterByItemToken('{{TT_SAU_THUE}}')
  const colImpL = findColLetterByItemToken('{{DL_NHAP_KHAU}}')
  const colLpL = findColLetterByItemToken('{{DL_DON_GIA_LP}}')
  const colOffL = findColLetterByItemToken('{{DL_OFF_NTS}}')
  const colAfterOffL = findColLetterByItemToken('{{DL_DON_GIA_SAU_OFF}}')
  const colTotalUsdL = findColLetterByItemToken('{{DL_THANH_TIEN_USD}}')
  const colRateL = findColLetterByItemToken('{{DL_TY_GIA}}')
  const colVndNtsL = findColLetterByItemToken('{{DL_VND_NTS}}')
  const colVatL = findColLetterByItemToken('{{DL_TIEN_VAT}}')

  let outExcelRowIdx = 1
  let firstDataRowIdx = -1
  let lastDataRowIdx = -1

  // Render rows
  let trsHtml = ''
  expandedRows.forEach(er => {
    const r = er.sourceRow
    const { map: mergeMap, skipped } = getRowMerges(r)
    const rowHasLogo = showLogo && (
      tpl.grid_cells?.[`${r}_1`]?.value?.includes('{{LOGO}}') ||
      tpl.grid_cells?.[`${r}_1`]?.value?.includes('{{LOGO_TRAI}}')
    )
    const rowH = rowHasLogo && (!er.height || er.height <= 0) ? logoHeight + 6 : er.height
    const isZeroRow = !rowHasLogo && rowH !== undefined && rowH <= 0
    const isCompactRow = !rowHasLogo && rowH !== undefined && rowH > 0 && rowH < 20
    const hStyle = isZeroRow
      ? 'height: 0px; max-height: 0px; line-height: 0; font-size: 0; overflow: hidden; display: none;'
      : rowH !== undefined
        ? `height: ${rowH}px;`
        : ''

    // Special multi-row rendering for commercial terms: sttCol = STT (1, 2...), sttCol+1..totalCols = term content
    if (er.rowType === 'terms') {
      if (isZeroRow || parsedTermsLines.length === 0) {
        return
      }
      if (totalCols >= 2) {
        const sttCol = findTableSttColumn(tpl)
        const contentCol = Math.min(sttCol + 1, totalCols)
        const st1 = tpl.grid_cells?.[`${r}_${sttCol}`]?.style || tpl.grid_cells?.[`${r}_1`]?.style || {}
        const st2 = tpl.grid_cells?.[`${r}_${contentCol}`]?.style || tpl.grid_cells?.[`${r}_2`]?.style || tpl.grid_cells?.[`${r}_1`]?.style || {}
        const col1WidthPx = getColW(sttCol)
        const isCol1Zero = col1WidthPx <= 0
        const isCol1Compact = col1WidthPx > 0 && col1WidthPx < 30

        let restWidthPx = 0
        for (let cc = contentCol; cc <= totalCols; cc++) {
          restWidthPx += getColW(cc)
        }
        const isRestZero = restWidthPx <= 0

        const restSpanCount = Math.max(1, totalCols - contentCol + 1)
        const restColspanAttr = restSpanCount > 1 ? ` colspan="${restSpanCount}"` : ''
        const preSpacerTd = sttCol > 1
          ? `<td${sttCol - 1 > 1 ? ` colspan="${sttCol - 1}"` : ''} data-grid-row="${r}" data-grid-col="1" data-target-col="${sttCol - 1}" style="padding: 0; border: none;"></td>`
          : ''

        parsedTermsLines.forEach((termLine, idx) => {
          const curXlRow = outExcelRowIdx++
          const termRowH = ctx.previewRowHeightOverrides?.[curXlRow]
          const termPadV = termRowH !== undefined && termRowH < 24 ? '0px' : '2px'
          const sttEditKey = `terms_${idx}_stt`
          const contentEditKey = `terms_${idx}_content`
          const ov1 = ctx.previewCellOverrides?.[sttEditKey]
          const ov2 = ctx.previewCellOverrides?.[contentEditKey]
          const effSt1 = ov1?.style ? { ...st1, ...ov1.style } : st1
          const effSt2 = ov2?.style ? { ...st2, ...ov2.style } : st2

          const col1Css: string[] = [
            `padding: ${termPadV} ${isCol1Zero ? '0px' : isCol1Compact ? '1px' : '6px'}`,
            'box-sizing: border-box',
            `font-size: ${isCol1Zero ? 0 : effSt1.fontSize || baseFontSize}pt`,
            `font-family: ${effSt1.fontFamily || fontFamily}`,
            `text-align: ${effSt1.align || 'center'}`,
            `vertical-align: ${effSt1.valign || 'middle'}`,
            `color: ${effSt1.color || '#0f172a'}`,
            'word-break: break-word'
          ]
          if (termRowH !== undefined) {
            col1Css.push(`height: ${termRowH}px`)
            if (termRowH < 22) col1Css.push(`line-height: ${Math.max(8, termRowH - 2)}px`)
          }
          if (isCol1Zero) col1Css.push('width: 0px', 'max-width: 0px', 'overflow: hidden')
          if (effSt1.bold !== false) col1Css.push('font-weight: 700')
          if (effSt1.italic) col1Css.push('font-style: italic')
          if (effSt1.underline) col1Css.push('text-decoration: underline')
          if (effSt1.bgColor) col1Css.push(`background-color: ${effSt1.bgColor}`)
          if (effSt1.border && !isCol1Zero) {
            col1Css.push(`border: 1px solid ${effSt1.borderColor || '#1e293b'}`)
          } else {
            col1Css.push('border: none')
          }

          const col2Css: string[] = [
            `padding: ${termPadV} ${isRestZero ? '0px' : '6px'}`,
            'box-sizing: border-box',
            `font-size: ${isRestZero ? 0 : effSt2.fontSize || ctx.customDefaultFont?.size || st2.fontSize || baseFontSize}pt`,
            `font-family: ${ctx.customDefaultFont?.name || effSt2.fontFamily || fontFamily}`,
            `text-align: ${effSt2.align || 'left'}`,
            `vertical-align: ${effSt2.valign || 'middle'}`,
            `color: ${effSt2.color || '#0f172a'}`
          ]
          if (termRowH !== undefined) {
            col2Css.push(`height: ${termRowH}px`)
            if (termRowH < 22) col2Css.push(`line-height: ${Math.max(8, termRowH - 2)}px`)
          }
          if (effSt2.wrapText === false) {
            col2Css.push('white-space: nowrap', 'word-break: normal', 'overflow: hidden', 'text-overflow: clip')
          } else {
            col2Css.push('word-break: break-word', 'overflow-wrap: anywhere')
          }
          if (isRestZero) col2Css.push('width: 0px', 'max-width: 0px', 'overflow: hidden')
          if (effSt2.bold) col2Css.push('font-weight: 700')
          if (effSt2.italic) col2Css.push('font-style: italic')
          if (effSt2.underline) col2Css.push('text-decoration: underline')
          if (effSt2.bgColor) col2Css.push(`background-color: ${effSt2.bgColor}`)
          if (effSt2.border && !isRestZero) {
            col2Css.push(`border: 1px solid ${effSt2.borderColor || '#1e293b'}`)
          } else {
            col2Css.push('border: none')
          }

          const sttDisplay = ov1?.html !== undefined
            ? ov1.html
            : ov1?.text !== undefined
              ? escapeHtmlPreserveSpaces(ov1.text)
              : termLine.bulletNumber !== null
                ? String(termLine.bulletNumber)
                : ''
          const contentDisplay = ov2?.html !== undefined
            ? ov2.html
            : ov2?.text !== undefined
              ? escapeHtmlPreserveSpaces(ov2.text)
              : termLine.htmlContent

          const cellAId = idx === 0 ? ` id="cell-${colIndexToLetter(sttCol)}${r}"` : ''
          const cellBId = idx === 0 ? ` id="cell-${colIndexToLetter(contentCol)}${r}"` : ''
          const addr1 = `${colIndexToLetter(sttCol)}${curXlRow}`
          const addr2 = `${colIndexToLetter(contentCol)}${curXlRow}`
          const termRowStyle = termRowH !== undefined ? ` style="height: ${termRowH}px;"` : ''
          const clipMaxH = termRowH !== undefined ? Math.max(6, termRowH - (termRowH < 24 ? 2 : 4)) : 0
          const finalSttHtml = isCol1Zero ? '' : (termRowH !== undefined ? `<div class="pv-cell-clip" style="max-height: ${clipMaxH}px; overflow: hidden;">${sttDisplay}</div>` : sttDisplay)
          const finalContentHtml = isRestZero ? '' : (termRowH !== undefined ? `<div class="pv-cell-clip" style="max-height: ${clipMaxH}px; overflow: hidden;">${contentDisplay}</div>` : contentDisplay)
          const td1 = `<td${cellAId} data-edit-key="${sttEditKey}" data-excel-addr="${addr1}" data-grid-row="${r}" data-grid-col="${sttCol}" data-target-col="${sttCol}"${isCol1Zero ? '' : ' class="preview-interactive-td"'} style="${col1Css.join('; ')}">${finalSttHtml}</td>`
          const td2 = `<td${restColspanAttr}${cellBId} data-edit-key="${contentEditKey}" data-excel-addr="${addr2}" data-grid-row="${r}" data-grid-col="${contentCol}" data-target-col="${totalCols}"${isRestZero ? '' : ' class="preview-interactive-td"'} style="${col2Css.join('; ')}">${finalContentHtml}</td>`
          trsHtml += `<tr class="nts-row row-${r}" data-grid-row="${r}" data-excel-row="${curXlRow}"${termRowStyle}>${preSpacerTd}${td1}${td2}</tr>`
        })
        return
      }
    }

    const rowHasFooterCompany = Boolean(tpl.grid_cells?.[`${r}_1`]?.value?.includes('{{TEN_CONG_TY_BAN}}'))
    if (rowHasFooterCompany && !isZeroRow) {
      trsHtml += `<tr class="nts-row row-${r}-footer-line" data-grid-row="${r}" style="height: 4px;"><td colspan="${totalCols}" style="padding: 4px 0 2px 0; border: none;"><img src="data:image/png;base64,${NTS_FOOTER_LINE_BASE64}" style="width: 100%; height: 3px; display: block; object-fit: fill;" /></td></tr>`
    }

    const curXlRow = outExcelRowIdx++
    const overriddenRowH = ctx.previewRowHeightOverrides?.[curXlRow]
    const effectiveRowH = overriddenRowH !== undefined ? overriddenRowH : rowH
    const effectiveIsZeroRow = !rowHasLogo && effectiveRowH !== undefined && effectiveRowH <= 0
    const effectiveIsCompactRow = !rowHasLogo && effectiveRowH !== undefined && effectiveRowH > 0 && effectiveRowH < 20
    const effectiveHStyle = effectiveIsZeroRow
      ? 'height: 0px; max-height: 0px; line-height: 0; font-size: 0; overflow: hidden; display: none;'
      : effectiveRowH !== undefined
        ? `height: ${effectiveRowH}px;`
        : hStyle

    if (er.rowType === 'group' || er.rowType === 'item') {
      if (firstDataRowIdx < 0) firstDataRowIdx = curXlRow
      lastDataRowIdx = curXlRow
    }

    let rowHasTruocThue = false
    let rowHasTienVat = false
    if (er.rowType === 'normal') {
      for (let cc = 1; cc <= totalCols; cc++) {
        const rv = normalizeLegacyTokenSyntax(tpl.grid_cells?.[`${r}_${cc}`]?.value || '').trim()
        if (rv === '{{TONG_TRUOC_THUE}}') rowHasTruocThue = true
        if (rv === '{{TONG_TIEN_VAT}}') rowHasTienVat = true
      }
    }

    let tdsHtml = ''
    for (let c = 1; c <= totalCols; c++) {
      if (skipped.has(c)) continue
      const mInfo = mergeMap.get(c)
      const cell = tpl.grid_cells?.[`${r}_${c}`]
      const rawVal = cell?.value || ''
      const baseSt = cell?.style || {}
      const editKey = (er.rowType === 'group' || er.rowType === 'item') && er.qRowIdx !== undefined
        ? `row_${er.qRowIdx}_${c}`
        : `grid_${r}_${c}`
      const ov = ctx.previewCellOverrides?.[editKey]
      const st = {
        ...baseSt,
        ...(ov?.style || {}),
        ...(ov?.bold !== undefined ? { bold: ov.bold } : {}),
        ...(ov?.italic !== undefined ? { italic: ov.italic } : {}),
        ...(ov?.underline !== undefined ? { underline: ov.underline } : {}),
        ...(ov?.align ? { align: ov.align } : {}),
        ...(ov?.fontSizePt ? { fontSize: ov.fontSizePt } : {}),
        ...(ov?.color ? { color: ov.color } : {}),
        ...(ov?.bgColor ? { bgColor: ov.bgColor } : {})
      }

      const isLogoCellVal = rawVal.includes('{{LOGO}}') || rawVal.includes('{{LOGO_TRAI}}')
      const isFooterCompanyRow = rawVal.includes('{{TEN_CONG_TY_BAN}}') && c === 1
      const isNoWrap = st.wrapText === false

      let spanCount = mInfo && mInfo.colspan > 1 ? mInfo.colspan : 1
      let colspanAttr = spanCount > 1 ? ` colspan="${spanCount}"` : ''

      // Force full-table colspan on Logo row
      if (isLogoCellVal && c === 1) {
        spanCount = totalCols
        colspanAttr = ` colspan="${totalCols}"`
        for (let cc = 2; cc <= totalCols; cc++) skipped.add(cc)
      }

      let spanWidthPx = 0
      for (let cc = c; cc < c + spanCount && cc <= totalCols; cc++) {
        spanWidthPx += getColW(cc)
      }
      const isZeroCol = spanWidthPx <= 0
      const isCompactCol = spanWidthPx > 0 && spanWidthPx < 30

      const rowLogoHtml = showLogo && logoUrl
        ? `<img src="${logoUrl}" style="width: ${logoWidthPct}%; height: ${overriddenRowH !== undefined ? Math.max(12, overriddenRowH - 6) : logoHeight}px; object-fit: fill; display: block;" onerror="this.style.display='none'" />`
        : singleLogoHtml

      const htmlTokenMap: Record<string, string> = {
        ...er.tokenMap,
        '{{LOGO}}': rowLogoHtml,
        '{{LOGO_TRAI}}': rowLogoHtml,
        '{{LOGO_PHAI}}': ''
      }

      const cellBaseFont = {
        name: st.fontFamily || fontFamily,
        size: st.fontSize || baseFontSize,
        bold: !!st.bold,
        italic: !!st.italic,
        underline: !!st.underline,
        colorHex: st.color || undefined
      }

      let displayHtml = ''
      if (ov?.html !== undefined && !isLogoCellVal) {
        displayHtml = ov.html
      } else if (ov?.text !== undefined && !isLogoCellVal) {
        displayHtml = escapeHtmlPreserveSpaces(ov.text).replace(/\r?\n/g, isNoWrap ? ' ' : '<br/>')
      } else if (rawVal.includes('{{DIEU_KHOAN}}')) {
        const formattedTerms = formatRichMultilineContent(effectiveTermsHtml, cellBaseFont, isNoWrap).html
        displayHtml = replaceTokensInText(rawVal, {
          ...htmlTokenMap,
          '{{DIEU_KHOAN}}': formattedTerms
        })
      } else if (rawVal.includes('{{DIEN_GIAI}}') || rawVal.includes('{{DESCRIPTION}}')) {
        const replacedDgOrDesc = replaceTokensInText(rawVal, htmlTokenMap)
        displayHtml = formatRichMultilineContent(replacedDgOrDesc, cellBaseFont, isNoWrap).html
      } else {
        const replaced = replaceTokensInText(rawVal, htmlTokenMap)
        displayHtml = escapeHtmlPreserveSpaces(replaced).replace(/\r?\n/g, isNoWrap ? ' ' : '<br/>')
        if (isLogoCellVal) {
          displayHtml = replaced.replace(/\r?\n/g, isNoWrap ? ' ' : '<br/>')
        }
      }

      // Compute Excel formula metadata if applicable
      let excelFormula = ''
      const trimmedToken = normalizeLegacyTokenSyntax(rawVal).trim()
      const colLet = colIndexToLetter(c)
      if (er.rowType === 'item') {
        if (trimmedToken === '{{TT_TRUOC_THUE}}' && colQtyL && colPriceKhL) {
          excelFormula = `=${colQtyL}${curXlRow}*${colPriceKhL}${curXlRow}`
        } else if (trimmedToken === '{{TT_SAU_THUE}}' && colTienVatL && colTruocThueL) {
          excelFormula = `=${colTienVatL}${curXlRow}+${colTruocThueL}${curXlRow}`
        } else if (trimmedToken === '{{DL_DON_GIA_SAU_OFF}}' && colLpL && colOffL && colImpL) {
          excelFormula = `=${colLpL}${curXlRow}*(1-${colOffL}${curXlRow})+${colImpL}${curXlRow}`
        } else if (trimmedToken === '{{DL_THANH_TIEN_USD}}' && colAfterOffL && colQtyL) {
          excelFormula = `=${colAfterOffL}${curXlRow}*${colQtyL}${curXlRow}`
        } else if (trimmedToken === '{{DL_VND_NTS}}' && colRateL && colTotalUsdL) {
          excelFormula = `=${colRateL}${curXlRow}*${colTotalUsdL}${curXlRow}`
        } else if (trimmedToken === '{{DL_TIEN_VAT}}' && colVndNtsL) {
          excelFormula = `=${colVndNtsL}${curXlRow}*VAT%`
        } else if (trimmedToken === '{{DL_TONG_CONG_VAT}}' && colVatL && colVndNtsL) {
          excelFormula = `=${colVatL}${curXlRow}+${colVndNtsL}${curXlRow}`
        }
      } else if (er.rowType === 'normal' && firstDataRowIdx > 0 && lastDataRowIdx >= firstDataRowIdx) {
        if (
          trimmedToken === '{{DL_TONG_USD}}' ||
          trimmedToken === '{{DL_TONG_VND}}' ||
          trimmedToken === '{{DL_TONG_VAT}}' ||
          trimmedToken === '{{DL_TONG_SAU_THUE}}' ||
          (trimmedToken === '{{TONG_TRUOC_THUE}}' && colTruocThueL === colLet) ||
          (trimmedToken === '{{TONG_TIEN_VAT}}' && colTienVatL === colLet)
        ) {
          excelFormula = `=SUM(${colLet}${firstDataRowIdx}:${colLet}${lastDataRowIdx})`
        } else if (trimmedToken === '{{TONG_SAU_THUE}}') {
          if (rowHasTruocThue && rowHasTienVat && colTienVatL && colTruocThueL) {
            excelFormula = `=${colTienVatL}${curXlRow}+${colTruocThueL}${curXlRow}`
          } else if (colSauThueL === colLet) {
            excelFormula = `=SUM(${colLet}${firstDataRowIdx}:${colLet}${lastDataRowIdx})`
          }
        }
      }

      const padV = (effectiveIsZeroRow || effectiveIsCompactRow || (overriddenRowH !== undefined && overriddenRowH < 26)) ? '0px' : '4px'
      const padH = isZeroCol ? '0px' : isCompactCol ? '1px' : '6px'
      const resolvedAlign = resolveCellHorizontalAlign(rawVal, st.align)

      const cssParts: string[] = [
        isLogoCellVal ? 'padding: 0 0 4px 0' : `padding: ${padV} ${padH}`,
        'box-sizing: border-box',
        `font-size: ${effectiveIsZeroRow || isZeroCol ? 0 : st.fontSize || baseFontSize}pt`,
        `font-family: ${st.fontFamily || fontFamily}`,
        `text-align: ${resolvedAlign}`,
        `vertical-align: ${st.valign || 'middle'}`,
        `color: ${st.color || '#0f172a'}`
      ]
      if (overriddenRowH !== undefined && !effectiveIsZeroRow) {
        cssParts.push(`height: ${overriddenRowH}px`)
        if (overriddenRowH < 24 && !isLogoCellVal) {
          cssParts.push(`line-height: ${Math.max(8, overriddenRowH - 2)}px`)
        }
      }
      if (isNoWrap) {
        cssParts.push('white-space: nowrap', 'word-break: normal', 'overflow-wrap: normal', 'overflow: hidden', 'text-overflow: clip')
      } else {
        cssParts.push('word-break: break-word', 'overflow-wrap: anywhere')
      }
      if (effectiveIsCompactRow) {
        cssParts.push(`line-height: ${Math.max(1, effectiveRowH!)}px`, 'overflow: hidden')
      }
      if (isZeroCol) {
        cssParts.push('width: 0px', 'max-width: 0px', 'overflow: hidden')
      }
      if (st.bold) cssParts.push('font-weight: 700')
      if (st.italic) cssParts.push('font-style: italic')
      if (st.underline) cssParts.push('text-decoration: underline')
      if (st.bgColor) cssParts.push(`background-color: ${st.bgColor}`)
      if (st.border && !effectiveIsZeroRow && !isZeroCol) {
        cssParts.push(`border: 1px solid ${st.borderColor || '#1e293b'}`)
      } else {
        cssParts.push('border: none')
      }
      if (r === 1 && hasGridLogoToken && showColorLine) {
        cssParts.push('border-bottom: 3px solid #ed7d31')
      }
      if (isFooterCompanyRow) {
        cssParts.push('padding-top: 2px')
      }

      const cellAddr = `${colIndexToLetter(c)}${r}`
      const xlAddr = `${colIndexToLetter(c)}${curXlRow}`
      const targetCol = Math.min(totalCols, c + spanCount - 1)
      const formulaAttr = excelFormula ? ` data-excel-formula="${excelFormula.replace(/"/g, '&quot;')}"` : ''
      const interactiveClass = (!effectiveIsZeroRow && !isZeroCol && !isLogoCellVal) ? ' class="preview-interactive-td"' : ''
      const clipMaxH = overriddenRowH !== undefined ? Math.max(6, overriddenRowH - (overriddenRowH < 26 ? 2 : 8)) : 0
      const finalCellHtml = (effectiveIsZeroRow || isZeroCol)
        ? ''
        : (overriddenRowH !== undefined && !isLogoCellVal)
          ? `<div class="pv-cell-clip" style="max-height: ${clipMaxH}px; overflow: hidden;">${displayHtml}</div>`
          : displayHtml
      tdsHtml += `<td${colspanAttr} id="cell-${cellAddr}" data-edit-key="${editKey}" data-excel-addr="${xlAddr}"${formulaAttr} data-grid-row="${r}" data-grid-col="${c}" data-target-col="${targetCol}"${interactiveClass} style="${cssParts.join('; ')}">${finalCellHtml}</td>`
    }

    trsHtml += `<tr class="nts-row row-${r}" data-grid-row="${r}" data-excel-row="${curXlRow}" style="${effectiveHStyle}">${tdsHtml}</tr>`
  })

  const headerLogosHtml = !hasGridLogoToken && showLogo
    ? `
      <div data-grid-row="1" data-grid-col="1" style="display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 6px; width: 100%;">
        ${logoUrl ? `<img src="${logoUrl}" style="width: ${logoWidthPct}%; height: ${logoHeight}px; object-fit: fill; display: block;" onerror="this.style.display='none'" />` : ''}
      </div>
      ${showColorLine ? `
      <div style="display: flex; height: 3px; width: 100%; margin-bottom: 10px;">
        <div style="width: 18%; background: #0070c0;"></div>
        <div style="width: 82%; background: #ed7d31;"></div>
      </div>` : ''}
    `
    : ''

  const customCssBlock = tpl.custom_css?.trim()
    ? `<style class="nts-custom-css">\n${tpl.custom_css}\n</style>`
    : ''

  return `
    <div class="nts-print-sheet" style="background: #ffffff; color: #0f172a; font-family: ${fontFamily}; font-size: ${baseFontSize}pt; padding: ${pageCfg.padding_trang ?? 14}px; width: 100%; max-width: 100%; overflow-x: hidden; box-sizing: border-box;">
      ${customCssBlock}
      ${headerLogosHtml}
      <table class="nts-grid-table" style="width: 100%; min-width: 0; max-width: 100%; border-collapse: collapse; table-layout: fixed;">
        ${colgroupHtml}
        <tbody>
          ${trsHtml}
        </tbody>
      </table>
    </div>
  `
}

/* =====================================================
   8B. ĐỒNG BỘ SONG SONG 2 CHIỀU: THỦ CÔNG <-> CODE (HTML / CSS / JS)
===================================================== */
const CUSTOM_CSS_MARKER = '/* === 2. CSS TÙY CHỈNH MỞ RỘNG (GÕ THÊM BÊN DƯỚI) === */'
const DEFAULT_CUSTOM_JS_CODE = `// Code JS chạy song song trên tờ báo giá
// Biến có sẵn:
//   sheet : Phần tử DOM gốc (.nts-print-sheet) của tờ báo giá
//   ctx   : Dữ liệu báo giá hiện tại (customer, contract, rows, totals, currency)
//   tpl   : Cấu hình mẫu in hiện tại
`

function letterToColIndex(letters: string): number {
  const clean = letters.trim().toUpperCase()
  let col = 0
  for (let i = 0; i < clean.length; i++) {
    col = col * 26 + (clean.charCodeAt(i) - 64)
  }
  return Math.max(1, col)
}

export function serializeTemplateToCode(tpl: PrintTemplateConfig): { html: string; css: string; js: string } {
  const totalCols = Math.max(1, tpl.so_cot || 9)
  const totalRows = Math.max(1, tpl.so_dong || 18)
  const pageCfg = tpl.cau_hinh_trang || ({} as any)
  const mv = tpl.mapping_vung || ({} as any)

  let sumColW = 0
  for (let c = 1; c <= totalCols; c++) {
    sumColW += Math.max(0, tpl.col_widths?.[c] ?? 100)
  }
  const safeSum = Math.max(1, sumColW)

  const htmlLines: string[] = [
    '<div class="nts-print-sheet">',
    '  <table class="nts-grid-table">',
    '    <colgroup>'
  ]

  for (let c = 1; c <= totalCols; c++) {
    const w = Math.max(0, tpl.col_widths?.[c] ?? 100)
    const pct = sumColW === 0 ? '0.00' : ((w / safeSum) * 100).toFixed(2)
    htmlLines.push(`      <col data-col="${c}" data-width="${w}" style="width: ${pct}%;" />`)
  }
  htmlLines.push('    </colgroup>', '    <tbody>')

  for (let r = 1; r <= totalRows; r++) {
    const rowH = tpl.row_heights?.[r] ?? 26
    let roleAttr = ''
    if (mv.dong_tieu_de_bang === r) roleAttr = ' data-row-role="header"'
    else if (mv.dong_mau_nhom === r) roleAttr = ' data-row-role="group"'
    else if (mv.dong_mau_san_pham === r) roleAttr = ' data-row-role="item"'
    else if (Array.isArray(mv.danh_sach_dong_tong) && mv.danh_sach_dong_tong.includes(r)) roleAttr = ' data-row-role="total"'
    else if (mv.dong_dieu_khoan === r) roleAttr = ' data-row-role="terms"'
    else if (mv.dong_chu_ky === r) roleAttr = ' data-row-role="signature"'

    htmlLines.push(`      <tr data-row="${r}"${roleAttr} data-height="${rowH}" style="height: ${rowH}px;">`)

    const skippedCols = new Set<number>()
    const mergeSpanMap = new Map<number, number>()
    ;(tpl.merges || []).forEach(m => {
      if (m.top <= r && m.bottom >= r && m.right > m.left) {
        mergeSpanMap.set(m.left, m.right - m.left + 1)
        for (let cc = m.left + 1; cc <= m.right; cc++) skippedCols.add(cc)
      }
    })

    const firstCellVal = tpl.grid_cells?.[`${r}_1`]?.value?.trim() || ''
    if (firstCellVal === '{{LOGO}}' || firstCellVal === '{{LOGO_TRAI}}') {
      mergeSpanMap.set(1, totalCols)
      for (let cc = 2; cc <= totalCols; cc++) skippedCols.add(cc)
    }

    for (let c = 1; c <= totalCols; c++) {
      if (skippedCols.has(c)) continue
      const cell = tpl.grid_cells?.[`${r}_${c}`]
      const rawVal = cell?.value || ''
      const st = cell?.style || {}
      const span = mergeSpanMap.get(c) || 1
      const spanAttr = span > 1 ? ` colspan="${span}"` : ''

      const styleParts: string[] = []
      if (st.fontFamily) styleParts.push(`font-family: ${st.fontFamily}`)
      if (st.fontSize) styleParts.push(`font-size: ${st.fontSize}pt`)
      if (st.bold) styleParts.push('font-weight: bold')
      if (st.italic) styleParts.push('font-style: italic')
      if (st.underline) styleParts.push('text-decoration: underline')
      if (st.align) styleParts.push(`text-align: ${st.align}`)
      if (st.valign) styleParts.push(`vertical-align: ${st.valign}`)
      if (st.wrapText === false) styleParts.push('white-space: nowrap')
      if (st.color) styleParts.push(`color: ${st.color}`)
      if (st.bgColor) styleParts.push(`background-color: ${st.bgColor}`)
      if (st.border) styleParts.push(`border: 1px solid ${st.borderColor || '#1e293b'}`)

      const styleAttr = styleParts.length ? ` style="${styleParts.join('; ')};"` : ''
      const escapedVal = rawVal
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>')

      const addr = `${colIndexToLetter(c)}${r}`
      htmlLines.push(`        <td id="cell-${addr}" data-row="${r}" data-col="${c}"${spanAttr}${styleAttr}>${escapedVal}</td>`)
    }

    htmlLines.push('      </tr>')
  }

  htmlLines.push('    </tbody>', '  </table>', '</div>')

  // Generate synchronized CSS
  const cssLines: string[] = [
    '/* === 1. CẤU HÌNH TRANG & KÍCH THƯỚC ĐỒNG BỘ BẢNG LƯỚI === */',
    '.nts-print-sheet {',
    `  padding: ${pageCfg.padding_trang ?? 14}px;`,
    `  font-family: ${pageCfg.font_mac_dinh || 'Arial'};`,
    `  font-size: ${pageCfg.co_chu_mac_dinh || 10}pt;`,
    `  --logo-width-pct: ${pageCfg.logo_width_pct || 35}%;`,
    `  --logo-height: ${pageCfg.logo_height || 68}px;`,
    '}',
    '',
    '/* Độ rộng từng cột (px) — Sửa số px ở đây sẽ đồng bộ ngay sang Bảng lưới */'
  ]
  for (let c = 1; c <= totalCols; c++) {
    const w = Math.max(0, tpl.col_widths?.[c] ?? 100)
    cssLines.push(`col[data-col="${c}"] { width: ${w}px; } /* Cột ${colIndexToLetter(c)} */`)
  }
  cssLines.push('', '/* Chiều cao từng dòng (px) — Sửa số px ở đây sẽ đồng bộ ngay sang Bảng lưới */')
  for (let r = 1; r <= totalRows; r++) {
    const h = Math.max(0, tpl.row_heights?.[r] ?? 26)
    cssLines.push(`tr[data-row="${r}"] { height: ${h}px; } /* Dòng ${r} */`)
  }
  cssLines.push(
    '',
    CUSTOM_CSS_MARKER,
    tpl.custom_css?.trim()
      ? tpl.custom_css
      : '/* Gõ thêm CSS tùy chỉnh cho bất kỳ ô (#cell-A1, #cell-B5...) hoặc bảng bên dưới */\n'
  )

  return {
    html: htmlLines.join('\n'),
    css: cssLines.join('\n'),
    js: tpl.custom_js !== undefined && tpl.custom_js !== '' ? tpl.custom_js : DEFAULT_CUSTOM_JS_CODE
  }
}

export function applyHtmlCodeToTemplate(tpl: PrintTemplateConfig, htmlCode: string): void {
  if (typeof DOMParser === 'undefined') return
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlCode, 'text/html')

  // 1. Parse <col> widths if present
  const colEls = Array.from(doc.querySelectorAll('col'))
  if (colEls.length > 0) {
    const newColWidths: Record<number, number> = {}
    colEls.forEach((colEl, idx) => {
      const colIdx = Number(colEl.getAttribute('data-col')) || idx + 1
      const dataW = colEl.getAttribute('data-width')
      const styleW = colEl.getAttribute('style') || ''
      const pxMatch = styleW.match(/width\s*:\s*(\d+(?:\.\d+)?)px/i)
      if (pxMatch) {
        newColWidths[colIdx] = Math.max(0, Math.round(Number(pxMatch[1])))
      } else if (dataW !== null && dataW !== '') {
        newColWidths[colIdx] = Math.max(0, Math.round(Number(dataW)))
      } else {
        newColWidths[colIdx] = tpl.col_widths?.[colIdx] ?? 100
      }
    })
    tpl.col_widths = newColWidths
    tpl.so_cot = Math.max(1, colEls.length)
  }

  // 2. Parse <tr> and <td> elements
  const trEls = Array.from(doc.querySelectorAll('tbody tr, table tr'))
  if (trEls.length === 0) return

  const newCells: Record<string, GridCellData> = {}
  const newMerges: GridMerge[] = []
  const newRowHeights: Record<number, number> = {}
  const totalRowsList: number[] = []
  let maxColCount = tpl.so_cot || 1

  trEls.forEach((trEl, rIdx) => {
    const r = rIdx + 1
    const dataH = trEl.getAttribute('data-height')
    const styleH = (trEl as HTMLElement).style?.height || ''
    const pxHMatch = styleH.match(/(\d+(?:\.\d+)?)px/i)
    if (pxHMatch) {
      newRowHeights[r] = Math.max(0, Math.round(Number(pxHMatch[1])))
    } else if (dataH !== null && dataH !== '') {
      newRowHeights[r] = Math.max(0, Math.round(Number(dataH)))
    } else {
      newRowHeights[r] = tpl.row_heights?.[r] ?? 26
    }

    const role = (trEl.getAttribute('data-row-role') || '').trim().toLowerCase()
    if (role === 'header') tpl.mapping_vung.dong_tieu_de_bang = r
    else if (role === 'group') tpl.mapping_vung.dong_mau_nhom = r
    else if (role === 'item') tpl.mapping_vung.dong_mau_san_pham = r
    else if (role === 'total') totalRowsList.push(r)
    else if (role === 'terms') tpl.mapping_vung.dong_dieu_khoan = r
    else if (role === 'signature') tpl.mapping_vung.dong_chu_ky = r

    const tdEls = Array.from(trEl.querySelectorAll(':scope > td, :scope > th'))
    let curCol = 1
    tdEls.forEach(tdEl => {
      const explicitCol = Number(tdEl.getAttribute('data-col'))
      const c = explicitCol > 0 ? explicitCol : curCol
      const span = Math.max(1, Number(tdEl.getAttribute('colspan')) || 1)

      let rawHtml = tdEl.innerHTML
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
      const tmp = doc.createElement('div')
      tmp.innerHTML = rawHtml
      const textVal = tmp.textContent || ''

      const isLogoVal = textVal.trim() === '{{LOGO}}' || textVal.trim() === '{{LOGO_TRAI}}'
      if (span > 1 && !isLogoVal) {
        newMerges.push({
          top: r,
          bottom: r,
          left: c,
          right: c + span - 1
        })
      }

      const inlineSt = (tdEl as HTMLElement).style
      const prevStyle = tpl.grid_cells?.[`${r}_${c}`]?.style || {}
      const styleObj: GridCellStyle = { ...prevStyle }

      if (inlineSt) {
        if (inlineSt.fontFamily) styleObj.fontFamily = inlineSt.fontFamily.replace(/['"]/g, '').trim()
        if (inlineSt.fontSize) {
          const fsNum = parseFloat(inlineSt.fontSize)
          if (!Number.isNaN(fsNum) && fsNum > 0) styleObj.fontSize = fsNum
        }
        const fw = inlineSt.fontWeight
        if (fw) styleObj.bold = fw === 'bold' || Number(fw) >= 600
        if (inlineSt.fontStyle) styleObj.italic = inlineSt.fontStyle === 'italic'
        if (inlineSt.textDecoration) styleObj.underline = inlineSt.textDecoration.includes('underline')
        if (inlineSt.textAlign === 'left' || inlineSt.textAlign === 'center' || inlineSt.textAlign === 'right') {
          styleObj.align = inlineSt.textAlign
        }
        if (inlineSt.verticalAlign === 'top' || inlineSt.verticalAlign === 'middle' || inlineSt.verticalAlign === 'bottom') {
          styleObj.valign = inlineSt.verticalAlign
        }
        if (inlineSt.whiteSpace === 'nowrap') {
          styleObj.wrapText = false
        } else if (inlineSt.whiteSpace === 'pre-wrap' || inlineSt.whiteSpace === 'normal') {
          styleObj.wrapText = true
        }
        if (inlineSt.color) styleObj.color = inlineSt.color
        if (inlineSt.backgroundColor) styleObj.backgroundColor = inlineSt.backgroundColor
        if (inlineSt.backgroundColor) styleObj.bgColor = inlineSt.backgroundColor
        if (inlineSt.border) {
          styleObj.border = !inlineSt.border.includes('none') && !inlineSt.border.includes('0px')
        }
      }

      if (textVal !== '' || Object.keys(styleObj).length > 0) {
        newCells[`${r}_${c}`] = {
          value: textVal,
          style: styleObj
        }
      }

      curCol = c + span
      if (curCol - 1 > maxColCount) maxColCount = curCol - 1
    })
  })

  if (totalRowsList.length > 0) {
    tpl.mapping_vung.danh_sach_dong_tong = totalRowsList
  }

  tpl.so_dong = Math.max(1, trEls.length)
  tpl.so_cot = Math.max(1, maxColCount)
  tpl.row_heights = newRowHeights
  tpl.merges = newMerges
  tpl.grid_cells = newCells
}

export function applyCssCodeToTemplate(tpl: PrintTemplateConfig, cssCode: string): void {
  // 1. Parse .nts-print-sheet block
  const sheetMatch = cssCode.match(/\.nts-print-sheet\s*\{([^}]*)\}/i)
  if (sheetMatch) {
    const body = sheetMatch[1]
    const padMatch = body.match(/padding\s*:\s*(\d+(?:\.\d+)?)px/i)
    if (padMatch) tpl.cau_hinh_trang.padding_trang = Math.max(0, Math.round(Number(padMatch[1])))

    const fontMatch = body.match(/font-family\s*:\s*([^;\n]+)/i)
    if (fontMatch) tpl.cau_hinh_trang.font_mac_dinh = fontMatch[1].replace(/['"]/g, '').trim()

    const fsMatch = body.match(/font-size\s*:\s*(\d+(?:\.\d+)?)pt/i)
    if (fsMatch) tpl.cau_hinh_trang.co_chu_mac_dinh = Math.max(6, Math.round(Number(fsMatch[1])))

    const logoWM = body.match(/--logo-width-pct\s*:\s*(\d+(?:\.\d+)?)%/i)
    if (logoWM) tpl.cau_hinh_trang.logo_width_pct = Math.max(5, Math.min(100, Math.round(Number(logoWM[1]))))

    const logoHM = body.match(/--logo-height\s*:\s*(\d+(?:\.\d+)?)px/i)
    if (logoHM) tpl.cau_hinh_trang.logo_height = Math.max(20, Math.min(500, Math.round(Number(logoHM[1]))))
  }

  // 2. Parse col[data-col="X"] { width: Ypx; }
  const colRegex = /col\[data-col=["']?(\d+)["']?\]\s*\{([^}]*)\}/gi
  let colMatch: RegExpExecArray | null
  while ((colMatch = colRegex.exec(cssCode)) !== null) {
    const c = Number(colMatch[1])
    const wMatch = colMatch[2].match(/width\s*:\s*(\d+(?:\.\d+)?)px/i)
    if (c > 0 && wMatch) {
      tpl.col_widths[c] = Math.max(0, Math.min(600, Math.round(Number(wMatch[1]))))
    }
  }

  // 3. Parse tr[data-row="R"] { height: Hpx; }
  const rowRegex = /tr\[data-row=["']?(\d+)["']?\]\s*\{([^}]*)\}/gi
  let rowMatch: RegExpExecArray | null
  while ((rowMatch = rowRegex.exec(cssCode)) !== null) {
    const r = Number(rowMatch[1])
    const hMatch = rowMatch[2].match(/height\s*:\s*(\d+(?:\.\d+)?)px/i)
    if (r > 0 && hMatch) {
      tpl.row_heights[r] = Math.max(0, Math.min(400, Math.round(Number(hMatch[1]))))
    }
  }

  // 4. Also sync any #cell-A1 { ... } rules back into grid_cells so Manual Grid reflects cell CSS edits
  const cellRuleRegex = /#cell-([A-Za-z]+)(\d+)\s*\{([^}]*)\}/g
  let cellMatch: RegExpExecArray | null
  while ((cellMatch = cellRuleRegex.exec(cssCode)) !== null) {
    const colLetters = cellMatch[1]
    const r = Number(cellMatch[2])
    const c = letterToColIndex(colLetters)
    const props = cellMatch[3]
    if (r > 0 && c > 0 && r <= tpl.so_dong && c <= tpl.so_cot) {
      const key = `${r}_${c}`
      if (!tpl.grid_cells[key]) {
        tpl.grid_cells[key] = { value: '', style: {} }
      }
      if (!tpl.grid_cells[key].style) tpl.grid_cells[key].style = {}
      const st = tpl.grid_cells[key].style!

      const colorM = props.match(/(?:^|;|\s)color\s*:\s*([^;\n]+)/i)
      if (colorM) st.color = colorM[1].trim()

      const bgM = props.match(/background(?:-color)?\s*:\s*([^;\n]+)/i)
      if (bgM) st.bgColor = bgM[1].trim()

      const fsM = props.match(/font-size\s*:\s*(\d+(?:\.\d+)?)(?:pt|px)/i)
      if (fsM) st.fontSize = Number(fsM[1])

      const fwM = props.match(/font-weight\s*:\s*([^;\n]+)/i)
      if (fwM) st.bold = fwM[1].trim() === 'bold' || Number(fwM[1].trim()) >= 600

      const taM = props.match(/text-align\s*:\s*(left|center|right)/i)
      if (taM) st.align = taM[1].toLowerCase() as 'left' | 'center' | 'right'
    }
  }

  // 5. Extract custom CSS below marker
  const markerIdx = cssCode.indexOf(CUSTOM_CSS_MARKER)
  if (markerIdx !== -1) {
    tpl.custom_css = cssCode.slice(markerIdx + CUSTOM_CSS_MARKER.length).trim()
  } else {
    tpl.custom_css = cssCode.trim()
  }
}

export function runTemplateCustomJs(
  containerEl: HTMLElement | null,
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext
): string | null {
  const code = tpl.custom_js?.trim()
  if (!code || !containerEl) return null
  const sheetEl = (containerEl.querySelector('.nts-print-sheet') as HTMLElement) || containerEl
  try {
    const fn = new Function('sheet', 'ctx', 'tpl', code)
    fn(sheetEl, ctx, tpl)
    return null
  } catch (err: any) {
    return err?.message || String(err)
  }
}

/* =====================================================
   9. XUẤT FILE EXCEL (.XLSX) TỪ MẪU IN THIẾT LẬP
===================================================== */
const HTML_FONT_SIZE_PT_MAP: Record<number, number> = {
  1: 8,
  2: 10,
  3: 11,
  4: 12,
  5: 14,
  6: 18,
  7: 24
}

function cleanFontFamilyName(rawFont?: string | null, fallback = 'Arial'): string {
  if (!rawFont) return fallback
  const first = rawFont.split(',')[0].replace(/['"]/g, '').trim()
  return first || fallback
}

function applyElementFontStyles(el: HTMLElement, curFont: any): any {
  const nextFont = { ...curFont }
  const tag = el.tagName.toLowerCase()
  if (tag === 'b' || tag === 'strong') nextFont.bold = true
  if (tag === 'i' || tag === 'em') nextFont.italic = true
  if (tag === 'u') nextFont.underline = true
  if (tag === 's' || tag === 'strike') nextFont.strike = true

  if (el.style) {
    const fw = el.style.fontWeight
    if (fw === 'bold' || fw === 'bolder' || Number(fw) >= 600) nextFont.bold = true
    else if (fw === 'normal' || fw === 'lighter' || (Number(fw) > 0 && Number(fw) < 600)) nextFont.bold = false

    const fs = el.style.fontStyle
    if (fs === 'italic' || fs === 'oblique') nextFont.italic = true
    else if (fs === 'normal') nextFont.italic = false

    const td = el.style.textDecoration || el.style.textDecorationLine || ''
    if (td.includes('underline')) nextFont.underline = true
    if (td.includes('line-through')) nextFont.strike = true
    if (td.includes('none')) {
      nextFont.underline = false
      nextFont.strike = false
    }

    if (el.style.color) {
      const parsedColor = parseCssColorToHexAndArgb(el.style.color)
      if (parsedColor) {
        nextFont.colorHex = parsedColor.hex
        nextFont.color = { argb: parsedColor.argb }
      }
    }
    if (el.style.fontFamily) {
      nextFont.name = cleanFontFamilyName(el.style.fontFamily, nextFont.name)
    }
    if (el.style.fontSize) {
      const rawSize = el.style.fontSize.trim().toLowerCase()
      const val = parseFloat(rawSize)
      if (!Number.isNaN(val) && val > 0) {
        nextFont.size = rawSize.endsWith('px') ? Math.max(6, Math.round(val * 0.75 * 10) / 10) : val
      }
    }
  }

  if (tag === 'font') {
    if (el.hasAttribute('face')) {
      nextFont.name = cleanFontFamilyName(el.getAttribute('face'), nextFont.name)
    }
    if (el.hasAttribute('size')) {
      const sAttr = Number(el.getAttribute('size'))
      if (HTML_FONT_SIZE_PT_MAP[sAttr]) {
        nextFont.size = HTML_FONT_SIZE_PT_MAP[sAttr]
      } else if (!Number.isNaN(sAttr) && sAttr > 7) {
        nextFont.size = sAttr
      }
    }
    if (el.hasAttribute('color')) {
      const parsedColor = parseCssColorToHexAndArgb(el.getAttribute('color'))
      if (parsedColor) {
        nextFont.colorHex = parsedColor.hex
        nextFont.color = { argb: parsedColor.argb }
      }
    }
  }

  return nextFont
}

function renderRunToHtml(r: { text: string; font: any }, baseFont?: any): string {
  let chunk = escapeHtmlPreserveSpaces(r.text)
  if (!chunk) return ''
  const f = r.font || {}
  if (f.bold) chunk = `<b>${chunk}</b>`
  if (f.italic) chunk = `<i>${chunk}</i>`
  if (f.underline) chunk = `<u>${chunk}</u>`
  if (f.strike) chunk = `<s>${chunk}</s>`

  const inlineStyles: string[] = []
  if (f.colorHex) inlineStyles.push(`color: ${f.colorHex}`)
  const baseName = cleanFontFamilyName(baseFont?.name, '')
  const runName = cleanFontFamilyName(f.name, '')
  if (runName && baseName && runName.toLowerCase() !== baseName.toLowerCase()) {
    inlineStyles.push(`font-family: ${runName}`)
  }
  if (f.size && baseFont?.size && Number(f.size) !== Number(baseFont.size)) {
    inlineStyles.push(`font-size: ${f.size}pt`)
  }
  if (inlineStyles.length > 0) {
    chunk = `<span style="${inlineStyles.join('; ')};">${chunk}</span>`
  }
  return chunk
}

export function formatRichMultilineContent(
  htmlOrText: string,
  baseFont: any,
  isNoWrap = false
): { html: string; excelValue: any; plainLinesCount: number } {
  if (!htmlOrText) return { html: '', excelValue: '', plainLinesCount: 1 }

  const normBaseFont = {
    name: cleanFontFamilyName(baseFont?.name, 'Arial'),
    size: Number(baseFont?.size) || 10,
    bold: !!baseFont?.bold,
    italic: !!baseFont?.italic,
    underline: !!baseFont?.underline,
    strike: !!baseFont?.strike,
    colorHex: baseFont?.colorHex || undefined,
    color: baseFont?.color?.argb
      ? { argb: baseFont.color.argb }
      : baseFont?.colorHex
        ? { argb: hexToArgb(baseFont.colorHex) || 'FF000000' }
        : { argb: 'FF000000' }
  }

  if (
    typeof document !== 'undefined' &&
    /<(br|span|b|strong|i|em|u|s|strike|div|p|font|ul|ol|li|table|tr|td)\b/i.test(htmlOrText)
  ) {
    const parsedLines = parseTermsHtmlToExcelLines(htmlOrText, normBaseFont, {
      preserveBulletInText: true,
      autoBoldKeywords: false
    })
    if (parsedLines.length === 0) {
      return { html: '', excelValue: '', plainLinesCount: 1 }
    }
    const htmlJoined = parsedLines
      .map(ln => ln.htmlContent)
      .join(isNoWrap ? ' ' : '<br/>')

    const sep = isNoWrap ? ' ' : '\n'
    const excelRuns: Array<{ text: string; font: any }> = []
    parsedLines.forEach((ln, idx) => {
      ln.richText.forEach(r => {
        excelRuns.push({ text: r.text, font: { ...r.font } })
      })
      if (idx < parsedLines.length - 1) {
        const lastFont = ln.richText[ln.richText.length - 1]?.font || normBaseFont
        excelRuns.push({ text: sep, font: { ...lastFont } })
      }
    })

    const estimatedLines = isNoWrap
      ? 1
      : parsedLines.reduce((acc, ln) => acc + Math.max(1, Math.ceil(ln.plainText.length / 36)), 0)

    return {
      html: htmlJoined,
      excelValue: excelRuns.length > 0 ? { richText: excelRuns } : parsedLines.map(l => l.plainText).join(sep),
      plainLinesCount: Math.max(1, estimatedLines)
    }
  }

  const rawLines = String(htmlOrText).split(/\r?\n/)
  const sepHtml = isNoWrap ? ' ' : '<br/>'
  const sepExcel = isNoWrap ? ' ' : '\n'
  const htmlOut = rawLines.map(ln => escapeHtmlPreserveSpaces(ln)).join(sepHtml)
  const excelOut = rawLines.join(sepExcel)
  const estimatedLines = isNoWrap
    ? 1
    : rawLines.reduce((acc, ln) => acc + Math.max(1, Math.ceil(ln.length / 36)), 0)

  return {
    html: htmlOut,
    excelValue: excelOut,
    plainLinesCount: Math.max(1, estimatedLines)
  }
}

function htmlToExcelRichText(htmlOrText: string, baseFont: any, isNoWrap = false): any {
  return formatRichMultilineContent(htmlOrText, baseFont, isNoWrap).excelValue
}

export interface ParsedTermLine {
  bulletNumber: number | null
  richText: Array<{ text: string; font: any }>
  plainText: string
  htmlContent: string
}

function escapeHtmlPreserveSpaces(str: string): string {
  const escaped = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\u00A0/g, '&nbsp;')
  return escaped.replace(/^ +/g, m => '&nbsp;'.repeat(m.length)).replace(/  +/g, m => '&nbsp;'.repeat(m.length))
}

function parseCssColorToHexAndArgb(cssColor?: string | null): { hex: string; argb: string } | null {
  if (!cssColor) return null
  const c = cssColor.trim()
  const rgbMatch = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, Number(rgbMatch[1]))).toString(16).padStart(2, '0').toUpperCase()
    const g = Math.min(255, Math.max(0, Number(rgbMatch[2]))).toString(16).padStart(2, '0').toUpperCase()
    const b = Math.min(255, Math.max(0, Number(rgbMatch[3]))).toString(16).padStart(2, '0').toUpperCase()
    return { hex: `#${r}${g}${b}`, argb: `FF${r}${g}${b}` }
  }
  if (c.startsWith('#')) {
    let hex = c.slice(1).trim()
    if (hex.length === 3) {
      hex = hex.split('').map(ch => ch + ch).join('')
    }
    if (hex.length === 6) {
      const upper = hex.toUpperCase()
      return { hex: `#${upper}`, argb: `FF${upper}` }
    }
  }
  return null
}

function buildTermLineObject(
  runs: Array<{ text: string; font: any }>,
  implicitOlNum: number | null = null,
  allowPrefixMatch: boolean = true,
  options?: {
    preserveBulletInText?: boolean
    autoBoldKeywords?: boolean
    baseFont?: any
  }
): ParsedTermLine | null {
  const preserveBulletInText = options?.preserveBulletInText === true
  const autoBoldKeywords = options?.autoBoldKeywords !== false
  const baseFont = options?.baseFont

  const clonedRuns = runs.map(r => ({
    text: (r.text || '').replace(/\u00A0/g, ' ').replace(/\s*\r?\n\s*/g, ' ').replace(/[ \t]{2,}/g, ' '),
    font: { ...(r.font || {}) }
  }))

  // Trim leading spaces on first non-empty run and trailing spaces on last non-empty run
  for (let i = 0; i < clonedRuns.length; i++) {
    const trimmed = clonedRuns[i].text.replace(/^\s+/, '')
    clonedRuns[i].text = trimmed
    if (trimmed.length > 0) break
  }
  for (let i = clonedRuns.length - 1; i >= 0; i--) {
    const trimmed = clonedRuns[i].text.replace(/\s+$/, '')
    clonedRuns[i].text = trimmed
    if (trimmed.length > 0) break
  }

  const rawJoined = clonedRuns.map(r => r.text).join('').trim()
  if (!rawJoined && implicitOlNum === null) return null

  let bulletNumber: number | null = implicitOlNum

  if (preserveBulletInText) {
    if (bulletNumber !== null) {
      const firstFont = clonedRuns[0]?.font || baseFont || { name: 'Arial', size: 10 }
      clonedRuns.unshift({ text: `${bulletNumber}. `, font: { ...firstFont, bold: true } })
      bulletNumber = null
    }
  } else if (allowPrefixMatch && bulletNumber === null) {
    // Chỉ tách số thứ tự ở đầu dòng cho văn bản thuần chưa có .stt-block (ví dụ: "1. ", "2) ")
    const prefixMatch = rawJoined.match(/^([1-9]\d?)\s*[\.\)]\s+(?=\S)/)
    if (prefixMatch) {
      bulletNumber = Number(prefixMatch[1])
      let charsToRemove = prefixMatch[0].length
      for (const r of clonedRuns) {
        if (charsToRemove <= 0) break
        if (r.text.length <= charsToRemove) {
          charsToRemove -= r.text.length
          r.text = ''
        } else {
          r.text = r.text.slice(charsToRemove)
          charsToRemove = 0
        }
      }
    }
  }

  const finalRuns = clonedRuns.filter(r => r.text.length > 0)
  const plainText = finalRuns.map(r => r.text).join('').replace(/\u00A0/g, ' ').trim()
  if (!plainText && bulletNumber === null) return null

  const lowerPlain = plainText.toLowerCase()
  const shouldForceBoldLine =
    autoBoldKeywords &&
    (lowerPlain.startsWith('thuế vat:') ||
      lowerPlain.startsWith('tài khoản ngân hàng') ||
      lowerPlain.startsWith('đơn vị thụ hưởng:') ||
      lowerPlain.startsWith('stk ') ||
      lowerPlain.startsWith('số tài khoản') ||
      lowerPlain.includes('đơn đặt hàng chỉ được tiến hành') ||
      lowerPlain.includes('xác nhận đơn hàng này và gởi lại') ||
      lowerPlain.includes('xác nhận đơn hàng này và gửi lại'))

  if (shouldForceBoldLine) {
    finalRuns.forEach(r => {
      r.font = { ...(r.font || {}), bold: true }
    })
  }

  const htmlContent = finalRuns.map(r => renderRunToHtml(r, baseFont)).join('')

  return {
    bulletNumber,
    richText: finalRuns.map(r => {
      const xlFont: any = {
        name: cleanFontFamilyName(r.font?.name, baseFont?.name || 'Arial'),
        size: Number(r.font?.size) || Number(baseFont?.size) || 11
      }
      if (r.font?.bold) xlFont.bold = true
      if (r.font?.italic) xlFont.italic = true
      if (r.font?.underline) xlFont.underline = true
      if (r.font?.strike) xlFont.strike = true
      if (r.font?.color?.argb) xlFont.color = { argb: r.font.color.argb }
      return { text: r.text, font: xlFont }
    }),
    plainText,
    htmlContent
  }
}

export function parseTermsHtmlToExcelLines(
  htmlOrText: string,
  baseFont: any,
  options?: {
    preserveBulletInText?: boolean
    autoBoldKeywords?: boolean
  }
): ParsedTermLine[] {
  if (!htmlOrText || !htmlOrText.trim()) return []
  const defaultFont: any = {
    name: cleanFontFamilyName(baseFont?.name, 'Arial'),
    size: Number(baseFont?.size) || 11,
    bold: !!baseFont?.bold,
    italic: !!baseFont?.italic,
    underline: !!baseFont?.underline,
    strike: !!baseFont?.strike,
    colorHex: baseFont?.colorHex || undefined,
    color: baseFont?.color?.argb ? { argb: baseFont.color.argb } : undefined
  }

  if (typeof document !== 'undefined' && /<(br|span|b|strong|i|em|u|s|strike|div|p|font|ul|ol|li|table|tr|td)\b/i.test(htmlOrText)) {
    const temp = document.createElement('div')
    temp.innerHTML = htmlOrText
    repairAndRenumberSttDom(temp)
    const hasSttBlocks = Boolean(temp.querySelector('.stt-block'))
    const lines: ParsedTermLine[] = []
    let currentRuns: Array<{ text: string; font: any }> = []
    let pendingOlNum: number | null = null

    const flushLine = () => {
      if (currentRuns.length > 0 || pendingOlNum !== null) {
        const built = buildTermLineObject(currentRuns, pendingOlNum, !hasSttBlocks, {
          ...options,
          baseFont: defaultFont
        })
        currentRuns = []
        pendingOlNum = null
        if (built && (built.plainText || built.bulletNumber !== null)) {
          lines.push(built)
        }
      }
    }

    const blockTags = new Set(['p', 'div', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr', 'blockquote'])
    const traverse = (node: Node, curFont: any, listCtx?: { type: 'ul' | 'ol'; counter: number }) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const rawTxt = node.textContent || ''
        if (!rawTxt) return
        // Trong HTML, ký tự \r\n bên trong text node chỉ là khoảng trắng định dạng mã nguồn, KHÔNG phải thẻ <br> xuống dòng
        const normalizedTxt = rawTxt
          .replace(/\u00A0/g, ' ')
          .replace(/\s*\r?\n\s*/g, ' ')
          .replace(/[ \t]{2,}/g, ' ')
        if (normalizedTxt) {
          currentRuns.push({ text: normalizedTxt, font: { ...curFont } })
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tag = el.tagName.toLowerCase()
        if (tag === 'br') {
          flushLine()
          return
        }

        const nextFont = applyElementFontStyles(el, curFont)

        // Handle ExcelEditor `.stt-block` structure (<div class="stt-number">1</div><div class="stt-content">...</div>)
        if (el.classList && el.classList.contains('stt-block')) {
          flushLine()
          const numEl = el.querySelector('.stt-number')
          const contentEl = el.querySelector('.stt-content')
          const rawNumStr = (numEl?.textContent || '').replace(/\u00A0/g, ' ').trim().replace(/[\.\)\:\/]+$/, '')
          const sttNum = rawNumStr && /^\d+$/.test(rawNumStr) ? Number(rawNumStr) : null

          if (contentEl) {
            pendingOlNum = sttNum
            const contentFont = applyElementFontStyles(contentEl as HTMLElement, nextFont)
            contentEl.childNodes.forEach(c => traverse(c, contentFont, listCtx))
            flushLine()
          } else if (sttNum !== null) {
            pendingOlNum = sttNum
            el.childNodes.forEach(c => {
              if (c !== numEl) traverse(c, nextFont, listCtx)
            })
            flushLine()
          }
          return
        }

        if (el.classList && el.classList.contains('stt-number')) {
          const rawNumStr = (el.textContent || '').replace(/\u00A0/g, ' ').trim().replace(/[\.\)\:\/]+$/, '')
          if (rawNumStr && /^\d+$/.test(rawNumStr)) {
            pendingOlNum = Number(rawNumStr)
          }
          return
        }

        const isBlock = blockTags.has(tag) && !(el.classList && el.classList.contains('stt-content'))
        if (isBlock) flushLine()

        if (tag === 'ol' || tag === 'ul') {
          const childListCtx = { type: tag as 'ul' | 'ol', counter: 1 }
          el.childNodes.forEach(c => traverse(c, nextFont, childListCtx))
          flushLine()
          return
        }

        if (tag === 'li') {
          if (listCtx?.type === 'ol') {
            pendingOlNum = listCtx.counter++
          } else {
            currentRuns.push({ text: '- ', font: { ...nextFont } })
          }
        }
        el.childNodes.forEach(c => traverse(c, nextFont, listCtx))
        if (isBlock) flushLine()
      }
    }

    traverse(temp, defaultFont)
    flushLine()
    return lines
  }

  return htmlOrText
    .split(/\r?\n/)
    .map(line =>
      buildTermLineObject([{ text: line, font: { ...defaultFont } }], null, true, {
        ...options,
        baseFont: defaultFont
      })
    )
    .filter((item): item is ParsedTermLine => item !== null && (Boolean(item.plainText) || item.bulletNumber !== null))
}

function hexToArgb(hex?: string): string | undefined {
  if (!hex) return undefined
  const clean = hex.replace(/^#/, '').trim()
  if (clean.length === 3) {
    return 'FF' + clean.split('').map(c => c + c).join('').toUpperCase()
  }
  if (clean.length === 6) {
    return 'FF' + clean.toUpperCase()
  }
  return undefined
}

const NTS_FOOTER_LINE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAooAAAAMCAYAAADlApxgAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAIlJREFUeNrs0KEOgmAUBeDLxiAw56tQCEa7meobYTYS7L4C2WIhWXwEqk1mYkbLv+H3bWd3J9xyIgAAAAAAAAAAAAAAAAAAAFLKlmXTXur5nMwCsA7H8haHYoxd/jQG/LHt+bH/5S//6tOcwZwA69C/mk/a4h5ddTUIAAAAAAAAAAAAAJDcW4ABALTkDsr4aS+pAAAAAElFTkSuQmCC'

function resolveParsedTermsForTemplate(
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext
): ParsedTermLine[] {
  const effectiveTermsHtml = resolveEffectiveTermsHtml(ctx)
  if (!effectiveTermsHtml || !effectiveTermsHtml.trim()) return []

  const totalCols = Math.max(tpl.so_cot || 9, 1)
  const totalRows = Math.max(tpl.so_dong || 18, 1)
  const pageCfg = tpl.cau_hinh_trang || ({} as any)
  const defaultFontFamily = cleanFontFamilyName(pageCfg.font_mac_dinh, 'Arial')
  const defaultFontSize = Number(pageCfg.co_chu_mac_dinh) || 11
  const sttCol = findTableSttColumn(tpl)
  const contentCol = Math.min(sttCol + 1, totalCols)

  let termsRowIdx = Number(tpl.mapping_vung?.dong_dieu_khoan) || 0
  for (let r = 1; r <= totalRows; r++) {
    for (let c = 1; c <= totalCols; c++) {
      if (tpl.grid_cells?.[`${r}_${c}`]?.value?.includes('{{DIEU_KHOAN}}')) {
        termsRowIdx = r
        break
      }
    }
  }

  const st2 =
    (termsRowIdx > 0 &&
      (tpl.grid_cells?.[`${termsRowIdx}_${contentCol}`]?.style ||
        tpl.grid_cells?.[`${termsRowIdx}_2`]?.style ||
        tpl.grid_cells?.[`${termsRowIdx}_1`]?.style)) ||
    {}

  const baseTermFont = {
    name: cleanFontFamilyName(ctx.customDefaultFont?.name || st2.fontFamily || defaultFontFamily, 'Arial'),
    size: Number(ctx.customDefaultFont?.size) || Number(st2.fontSize) || defaultFontSize,
    bold: !!st2.bold,
    italic: !!st2.italic,
    underline: !!st2.underline,
    colorHex: st2.color || undefined,
    color: st2.color ? { argb: hexToArgb(st2.color) } : { argb: 'FF000000' }
  }

  const hasSeparateOrderConfirmRow = Object.values(tpl.grid_cells || {}).some(cell =>
    String(cell?.value || '').includes('Đơn đặt hàng chỉ được tiến hành')
  )
  const rawParsedTermsLines = parseTermsHtmlToExcelLines(effectiveTermsHtml, baseTermFont)
  return hasSeparateOrderConfirmRow
    ? rawParsedTermsLines.filter(ln => {
        const p = ln.plainText.toLowerCase()
        return (
          !p.includes('đơn đặt hàng chỉ được tiến hành') &&
          !p.includes('xác nhận đơn hàng này và gởi lại') &&
          !p.includes('xác nhận đơn hàng này và gửi lại')
        )
      })
    : rawParsedTermsLines
}

export async function generateExcelBlobFromTemplate(
  rawTpl: PrintTemplateConfig,
  ctx: QuoteExportContext
): Promise<Blob> {
  const tpl = rawTpl
  const wb = new ExcelJS.Workbook()
  const safeSheetName = (ctx.noiDungPO || '')
    .trim()
    .replace(/[/\\?*:[\]]+/g, '-')
    .slice(0, 31)
  const ws = wb.addWorksheet(safeSheetName || 'BaoGia')

  const totalCols = Math.max(tpl.so_cot || 9, 1)
  const totalRows = Math.max(tpl.so_dong || 18, 1)
  const pageCfg = tpl.cau_hinh_trang || ({} as any)
  const defaultFontFamily = pageCfg.font_mac_dinh || 'Arial'
  const defaultFontSize = pageCfg.co_chu_mac_dinh || 11
  const showLogo = pageCfg.hien_thi_logo !== false
  const logoUrl = pageCfg.logo_url || pageCfg.logo_trai || '/logo1.png'
  const logoWidthPct = Math.max(5, Math.min(100, Number(pageCfg.logo_width_pct) || 100))

  const globalMap = buildGlobalTokenMap(tpl, ctx)
  const agencyTotals = computeAgencyTotals(ctx)
  const isUSD = ctx.currency === 'USD'
  const numFmt = isUSD ? '#,##0.00' : '#,##0'
  const dlUsdFmt = '_(* #,##0.00_);_(* \\(#,##0.00\\);_(* "-"??_);_(@_)'
  const dlVndFmt = '_(* #,##0_);_(* \\(#,##0\\);_(* "-"??_);_(@_)'

  // 1. Set column widths & visibility 100% from tpl.col_widths (or previewColWidthOverrides)
  for (let c = 1; c <= totalCols; c++) {
    const pxW = Math.max(0, ctx.previewColWidthOverrides?.[c] ?? tpl.col_widths?.[c] ?? 100)
    if (pxW === 0) {
      ws.getColumn(c).width = 0
      ws.getColumn(c).hidden = true
    } else {
      ws.getColumn(c).hidden = false
      ws.getColumn(c).width = Math.max(Number((pxW / 7).toFixed(2)), 1)
    }
  }

  const vung = tpl.mapping_vung || {
    dong_tieu_de_bang: 7,
    dong_mau_nhom: 0,
    dong_mau_san_pham: 8,
    danh_sach_dong_tong: [9],
    dong_dieu_khoan: 11,
    dong_chu_ky: 13
  }
  const gridHeaderRowIdx = Number(vung.dong_tieu_de_bang) || 7
  const groupRowIdx = Number(vung.dong_mau_nhom) || 0
  const itemRowIdx = Number(vung.dong_mau_san_pham) || (gridHeaderRowIdx + 1)

  // Map token -> column letter on itemRowIdx for dynamic Excel formulas
  const findColLetterByToken = (token: string): string | null => {
    for (let c = 1; c <= totalCols; c++) {
      if ((tpl.grid_cells?.[`${itemRowIdx}_${c}`]?.value || '').trim() === token) {
        return colIndexToLetter(c)
      }
    }
    return null
  }
  const colQtyL = findColLetterByToken('{{SO_LUONG}}')
  const colPriceKhL = findColLetterByToken('{{DON_GIA_KH}}')
  const colTruocThueL = findColLetterByToken('{{TT_TRUOC_THUE}}')
  const colTienVatL = findColLetterByToken('{{TIEN_VAT}}')
  const colSauThueL = findColLetterByToken('{{TT_SAU_THUE}}')
  const colImpL = findColLetterByToken('{{DL_NHAP_KHAU}}')
  const colLpL = findColLetterByToken('{{DL_DON_GIA_LP}}')
  const colOffL = findColLetterByToken('{{DL_OFF_NTS}}')
  const colAfterOffL = findColLetterByToken('{{DL_DON_GIA_SAU_OFF}}')
  const colTotalUsdL = findColLetterByToken('{{DL_THANH_TIEN_USD}}')
  const colRateL = findColLetterByToken('{{DL_TY_GIA}}')
  const colVndNtsL = findColLetterByToken('{{DL_VND_NTS}}')
  const colVatL = findColLetterByToken('{{DL_TIEN_VAT}}')

  // Helper to get horizontal merges on a specific template grid row
  const getGridRowMerges = (r: number) => {
    return (tpl.merges || []).filter(m => m.top === r && m.bottom === r && m.right > m.left)
  }

  // Helper to apply GridCellStyle to an Excel cell
  const applyGridStyleToExcelCell = (xlCell: any, st?: GridCellStyle, rawCellVal = '') => {
    const s = st || {}
    xlCell.font = {
      name: s.fontFamily || defaultFontFamily,
      size: s.fontSize || defaultFontSize,
      bold: !!s.bold,
      italic: !!s.italic,
      underline: !!s.underline,
      color: s.color ? { argb: hexToArgb(s.color) } : { argb: 'FF000000' }
    }
    if (s.bgColor) {
      const bgArgb = hexToArgb(s.bgColor)
      if (bgArgb) {
        xlCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } }
      }
    }
    xlCell.alignment = {
      horizontal: resolveCellHorizontalAlign(rawCellVal, s.align),
      vertical: s.valign || 'middle',
      wrapText: s.wrapText !== false
    }
    if (s.border) {
      const bArgb = (s.borderColor && hexToArgb(s.borderColor)) || 'FF000000'
      xlCell.border = {
        top: { style: 'thin', color: { argb: bArgb } },
        bottom: { style: 'thin', color: { argb: bArgb } },
        left: { style: 'thin', color: { argb: bArgb } },
        right: { style: 'thin', color: { argb: bArgb } }
      }
    }
  }

  // Helper to merge cells on an Excel row and propagate border/fill across the merged range
  const applyRowMergesWithStyle = (xlRowIdx: number, mergesList: { left: number; right: number }[]) => {
    const rObj = ws.getRow(xlRowIdx)
    mergesList.forEach(m => {
      if (m.right <= m.left) return
      const masterCell = rObj.getCell(m.left)
      const masterBorder = masterCell.border ? JSON.parse(JSON.stringify(masterCell.border)) : undefined
      const masterFill = masterCell.fill ? JSON.parse(JSON.stringify(masterCell.fill)) : undefined
      for (let cc = m.left + 1; cc <= m.right && cc <= totalCols; cc++) {
        const subCell = rObj.getCell(cc)
        if (masterBorder && (!subCell.border || Object.keys(subCell.border).length === 0)) {
          subCell.border = JSON.parse(JSON.stringify(masterBorder))
        }
        if (masterFill && !subCell.fill) {
          subCell.fill = JSON.parse(JSON.stringify(masterFill))
        }
      }
      try {
        ws.mergeCells(xlRowIdx, m.left, xlRowIdx, Math.min(m.right, totalCols))
      } catch {}
    })
  }

  // Parse Commercial Terms (`dieu_khoan`) using the exact same helper as `renderTemplateToHtml`
  const parsedTermsLines = resolveParsedTermsForTemplate(tpl, ctx)

  const rateForUsd = Number(ctx.tiGia) > 1 ? Number(ctx.tiGia) : 25400
  const tongTruocUsdVal = Number((ctx.currency === 'USD' ? ctx.totals.truoc : (ctx.totals.truoc / rateForUsd)).toFixed(2))
  const numericGlobalTokens: Record<string, number> = {
    '{{TONG_TRUOC_THUE}}': ctx.totals.truoc,
    '{{TONG_TRUOC_THUE_USD}}': tongTruocUsdVal,
    '{{TONG_TIEN_VAT}}': ctx.totals.vat,
    '{{TONG_SAU_THUE}}': ctx.totals.sau,
    '{{TONG_MUC_OFF}}': ctx.totals.off,
    '{{DL_TONG_USD}}': agencyTotals.tongUsd,
    '{{DL_TONG_VND}}': agencyTotals.tongVnd,
    '{{DL_TONG_VAT}}': agencyTotals.tongVat,
    '{{DL_TONG_SAU_THUE}}': agencyTotals.tongSauThue
  }

  // Helper to apply live preview override (text/html/style) to an Excel cell
  const applyPreviewOverrideToExcelCell = (
    xlCell: any,
    editKey: string,
    baseStyle?: GridCellStyle,
    rawTokenVal = ''
  ): { appliedValue: boolean; plainLines: number } => {
    const ov = ctx.previewCellOverrides?.[editKey]
    if (!ov) return { appliedValue: false, plainLines: 1 }
    const effStyle: GridCellStyle = ov.style ? { ...(baseStyle || {}), ...ov.style } : (baseStyle || {})
    if (ov.style) {
      applyGridStyleToExcelCell(xlCell, effStyle, rawTokenVal)
    }
    if (ov.text === undefined && ov.html === undefined) {
      return { appliedValue: false, plainLines: 1 }
    }
    const rawTxt = String(ov.text ?? '').trim()
    if (rawTxt.startsWith('=') && rawTxt.length > 1) {
      xlCell.value = { formula: rawTxt.slice(1).trim(), result: 0 }
      return { appliedValue: true, plainLines: 1 }
    }
    const compact = rawTxt.replace(/\s+/g, '')
    const isLeadingZeroCode = /^0\d+/.test(compact)
    if (!isLeadingZeroCode && compact.length > 0) {
      if (/^-?\d+(\.\d+)?%$/.test(compact)) {
        const pctN = Number(compact.slice(0, -1))
        if (!Number.isNaN(pctN)) {
          xlCell.value = pctN / 100
          xlCell.numFmt = getExcelPctNumFmt(pctN)
          return { appliedValue: true, plainLines: 1 }
        }
      } else if (!isUSD && /^-?\d{1,3}([.,]\d{3})+$/.test(compact)) {
        const nVal = Number(compact.replace(/[.,]/g, ''))
        if (!Number.isNaN(nVal)) {
          xlCell.value = nVal
          xlCell.numFmt = numFmt
          return { appliedValue: true, plainLines: 1 }
        }
      } else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(compact)) {
        const nVal = Number(compact.replace(/,/g, ''))
        if (!Number.isNaN(nVal)) {
          xlCell.value = nVal
          xlCell.numFmt = isUSD ? '#,##0.00' : numFmt
          return { appliedValue: true, plainLines: 1 }
        }
      } else if (/^-?\d+(\.\d+)?$/.test(compact)) {
        const nVal = Number(compact)
        if (!Number.isNaN(nVal)) {
          xlCell.value = nVal
          return { appliedValue: true, plainLines: 1 }
        }
      }
    }
    const wrap = effStyle.wrapText !== false
    if (ov.html && /<(b|strong|i|em|u|s|strike|span|font|br|div|p)\b/i.test(ov.html)) {
      const rich = formatRichMultilineContent(
        ov.html,
        {
          name: effStyle.fontFamily || defaultFontFamily,
          size: effStyle.fontSize || defaultFontSize,
          bold: !!effStyle.bold,
          italic: !!effStyle.italic,
          underline: !!effStyle.underline,
          colorHex: effStyle.color || undefined,
          color: effStyle.color ? { argb: hexToArgb(effStyle.color) } : { argb: 'FF000000' }
        },
        !wrap
      )
      xlCell.value = rich.excelValue
      return { appliedValue: true, plainLines: rich.plainLinesCount }
    }
    xlCell.value = ov.text ?? ''
    const lines = String(ov.text ?? '')
      .split(/\r?\n/)
      .reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / 26)), 0)
    return { appliedValue: true, plainLines: lines }
  }

  // 2. Expand & write rows top-to-bottom (1-to-1 with `renderTemplateToHtml` in Thiết lập mẫu in)
  let outRowIdx = 1
  let firstDataRowIdx = -1
  let lastDataRowIdx = -1
  let continuousExcelStt = 0
  let excelLogoRowIdx = -1
  let excelFooterCompanyRowIdx = -1

  for (let r = 1; r <= totalRows; r++) {
    // Skip standalone group template row (emitted dynamically inside itemRowIdx loop)
    if (r === groupRowIdx && groupRowIdx > 0) {
      continue
    }

    // Dynamic Quote Items & Groups block
    if (r === itemRowIdx) {
      firstDataRowIdx = outRowIdx
      ctx.rows.forEach((qRow, qRowIdx) => {
        if (qRow.type === 'group') {
          if (groupRowIdx <= 0) return
          const row = ws.getRow(outRowIdx)
          const grpH = tpl.row_heights?.[groupRowIdx]
          row.height = grpH && grpH > 0 ? Math.max(18, Math.round(grpH * 0.75)) : 22
          const { textMap } = buildRowTokenMap(qRow, ctx, globalMap)

          for (let c = 1; c <= totalCols; c++) {
            const gCell = tpl.grid_cells?.[`${groupRowIdx}_${c}`]
            const cell = row.getCell(c)
            applyGridStyleToExcelCell(cell, gCell?.style, gCell?.value || '')
            cell.value = replaceTokensInText(gCell?.value || '', textMap)
            applyPreviewOverrideToExcelCell(cell, `row_${qRowIdx}_${c}`, gCell?.style, gCell?.value || '')
          }
          applyRowMergesWithStyle(outRowIdx, getGridRowMerges(groupRowIdx))
          outRowIdx++
        } else {
          continuousExcelStt++
          const row = ws.getRow(outRowIdx)
          const { textMap, rawNumberMap } = buildRowTokenMap(qRow, ctx, globalMap)
          if (groupRowIdx <= 0) {
            textMap['{{STT}}'] = String(continuousExcelStt)
          }
          const it = qRow.item || {}
          const vatPctVal = formatPctNumber(
            it.Thue_VAT !== undefined && it.Thue_VAT !== null && it.Thue_VAT !== ''
              ? it.Thue_VAT
              : qRow.pctVat !== undefined && qRow.pctVat !== null && qRow.pctVat !== ''
                ? qRow.pctVat
                : 8
          )
          const vatRateDec = vatPctVal / 100
          const dlOffPctVal = formatPctNumber(
            it.muc_phan_tram_off !== undefined && it.muc_phan_tram_off !== null && it.muc_phan_tram_off !== ''
              ? it.muc_phan_tram_off
              : qRow.pctOff
          )

          let maxEstimatedLines = 1
          for (let c = 1; c <= totalCols; c++) {
            const gCell = tpl.grid_cells?.[`${itemRowIdx}_${c}`]
            const gStyle = gCell?.style || {}
            const rawText = (gCell?.value || '').trim()
            const cell = row.getCell(c)
            applyGridStyleToExcelCell(cell, gStyle, rawText)

            const hAlign = resolveCellHorizontalAlign(rawText, gStyle.align)
            const vAlign = gStyle.valign || 'middle'
            const wrap = gStyle.wrapText !== false

            if (rawText === '{{STT}}') {
              const sttNum = Number(textMap['{{STT}}'])
              cell.value = !Number.isNaN(sttNum) && sttNum > 0 ? sttNum : textMap['{{STT}}']
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{DL_OFF_NTS}}') {
              cell.value = rawNumberMap['{{DL_OFF_NTS}}'] ?? 0
              cell.numFmt = getExcelPctNumFmt(dlOffPctVal)
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{DL_NHAP_KHAU}}') {
              cell.value = rawNumberMap[rawText] ?? 0
              cell.numFmt = dlUsdFmt
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{DL_DON_GIA_LP}}') {
              cell.value = rawNumberMap[rawText] ?? 0
              cell.numFmt = '#,##0.00'
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{DL_DON_GIA_SAU_OFF}}') {
              if (colLpL && colOffL && colImpL) {
                cell.value = {
                  formula: `${colLpL}${outRowIdx}*(1-${colOffL}${outRowIdx})+${colImpL}${outRowIdx}`,
                  result: rawNumberMap['{{DL_DON_GIA_SAU_OFF}}'] ?? 0
                }
              } else {
                cell.value = rawNumberMap['{{DL_DON_GIA_SAU_OFF}}'] ?? 0
              }
              cell.numFmt = '#,##0.00'
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{DL_THANH_TIEN_USD}}') {
              if (colAfterOffL && colQtyL) {
                cell.value = {
                  formula: `${colAfterOffL}${outRowIdx}*${colQtyL}${outRowIdx}`,
                  result: rawNumberMap['{{DL_THANH_TIEN_USD}}'] ?? 0
                }
              } else {
                cell.value = rawNumberMap['{{DL_THANH_TIEN_USD}}'] ?? 0
              }
              cell.numFmt = '#,##0.00'
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{DL_TY_GIA}}') {
              cell.value = rawNumberMap['{{DL_TY_GIA}}'] ?? 26600
              cell.numFmt = '#,##0'
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{DL_VND_NTS}}') {
              if (colRateL && colTotalUsdL) {
                cell.value = {
                  formula: `${colRateL}${outRowIdx}*${colTotalUsdL}${outRowIdx}`,
                  result: rawNumberMap['{{DL_VND_NTS}}'] ?? 0
                }
              } else {
                cell.value = rawNumberMap['{{DL_VND_NTS}}'] ?? 0
              }
              cell.numFmt = '#,##0'
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{DL_TIEN_VAT}}') {
              if (colVndNtsL) {
                cell.value = {
                  formula: `${colVndNtsL}${outRowIdx}*${vatRateDec}`,
                  result: rawNumberMap['{{DL_TIEN_VAT}}'] ?? 0
                }
              } else {
                cell.value = rawNumberMap['{{DL_TIEN_VAT}}'] ?? 0
              }
              cell.numFmt = '#,##0'
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{DL_TONG_CONG_VAT}}') {
              if (colVatL && colVndNtsL) {
                cell.value = {
                  formula: `${colVatL}${outRowIdx}+${colVndNtsL}${outRowIdx}`,
                  result: rawNumberMap['{{DL_TONG_CONG_VAT}}'] ?? 0
                }
              } else {
                cell.value = rawNumberMap['{{DL_TONG_CONG_VAT}}'] ?? 0
              }
              cell.numFmt = '#,##0'
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{TT_TRUOC_THUE}}') {
              if (colQtyL && colPriceKhL) {
                cell.value = {
                  formula: `${colQtyL}${outRowIdx}*${colPriceKhL}${outRowIdx}`,
                  result: rawNumberMap['{{TT_TRUOC_THUE}}'] ?? 0
                }
              } else {
                cell.value = rawNumberMap['{{TT_TRUOC_THUE}}'] ?? 0
              }
              cell.numFmt = numFmt
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawText === '{{TT_SAU_THUE}}') {
              if (colTienVatL && colTruocThueL) {
                cell.value = {
                  formula: `${colTienVatL}${outRowIdx}+${colTruocThueL}${outRowIdx}`,
                  result: rawNumberMap['{{TT_SAU_THUE}}'] ?? 0
                }
              } else {
                cell.value = rawNumberMap['{{TT_SAU_THUE}}'] ?? 0
              }
              cell.numFmt = numFmt
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
            } else if (rawNumberMap[rawText] !== undefined) {
              cell.value = rawNumberMap[rawText]
              cell.numFmt = rawText === '{{SO_LUONG}}' ? '#,##0' : numFmt
              cell.alignment = {
                horizontal: hAlign,
                vertical: vAlign,
                wrapText: wrap
              }
            } else if (rawText.includes('{{DIEN_GIAI}}') || rawText.includes('{{DESCRIPTION}}')) {
              const dgStr = replaceTokensInText(rawText, textMap)
              const formattedRich = formatRichMultilineContent(dgStr, {
                name: gStyle.fontFamily || defaultFontFamily,
                size: gStyle.fontSize || defaultFontSize,
                bold: !!gStyle.bold,
                italic: !!gStyle.italic,
                underline: !!gStyle.underline,
                colorHex: gStyle.color || undefined,
                color: gStyle.color ? { argb: hexToArgb(gStyle.color) } : { argb: 'FF000000' }
              }, !wrap)
              cell.value = formattedRich.excelValue
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
              if (wrap && formattedRich.plainLinesCount > maxEstimatedLines) {
                maxEstimatedLines = formattedRich.plainLinesCount
              }
            } else {
              const finalTxt = replaceTokensInText(rawText, textMap)
              cell.value = finalTxt
              cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
              const lines = finalTxt
                .split(/\r?\n/)
                .reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / 26)), 0)
              if (wrap && lines > maxEstimatedLines) maxEstimatedLines = lines
            }
            const ovRes = applyPreviewOverrideToExcelCell(cell, `row_${qRowIdx}_${c}`, gStyle, rawText)
            if (wrap && ovRes.appliedValue && ovRes.plainLines > maxEstimatedLines) {
              maxEstimatedLines = ovRes.plainLines
            }
          }
          row.height = Math.max(26, maxEstimatedLines * 14.5 + 8)
          applyRowMergesWithStyle(outRowIdx, getGridRowMerges(itemRowIdx))
          outRowIdx++
        }
      })
      lastDataRowIdx = Math.max(firstDataRowIdx, outRowIdx - 1)
      continue
    }

    // Check if this grid row is the Commercial Terms (`{{DIEU_KHOAN}}`) row
    let hasTermsToken = false
    for (let c = 1; c <= totalCols; c++) {
      if (tpl.grid_cells?.[`${r}_${c}`]?.value?.includes('{{DIEU_KHOAN}}')) {
        hasTermsToken = true
        break
      }
    }

    if (hasTermsToken) {
      const rowH = tpl.row_heights?.[r]
      const isZeroRow = rowH !== undefined && rowH <= 0
      if (!isZeroRow && totalCols >= 2 && parsedTermsLines.length > 0) {
        const sttCol = findTableSttColumn(tpl)
        const contentCol = Math.min(sttCol + 1, totalCols)
        const st1 = tpl.grid_cells?.[`${r}_${sttCol}`]?.style || tpl.grid_cells?.[`${r}_1`]?.style || {}
        const st2 = tpl.grid_cells?.[`${r}_${contentCol}`]?.style || tpl.grid_cells?.[`${r}_2`]?.style || {}

        parsedTermsLines.forEach((lineObj, tIdx) => {
          const tRow = ws.getRow(outRowIdx)
          const cStt = tRow.getCell(sttCol)
          if (lineObj.bulletNumber !== null) {
            applyGridStyleToExcelCell(cStt, {
              ...st1,
              bold: st1.bold !== false,
              align: st1.align || 'center',
              valign: st1.valign || 'middle'
            })
            cStt.value = lineObj.bulletNumber
          }
          applyPreviewOverrideToExcelCell(cStt, `terms_${tIdx}_stt`, st1)

          const cContent = tRow.getCell(contentCol)
          applyGridStyleToExcelCell(cContent, {
            ...st2,
            fontFamily: ctx.customDefaultFont?.name || st2.fontFamily || defaultFontFamily,
            fontSize: ctx.customDefaultFont?.size || st2.fontSize || defaultFontSize,
            align: st2.align || 'left',
            valign: st2.valign || 'middle',
            wrapText: st2.wrapText !== false
          })
          cContent.value = lineObj.richText.length > 0 ? { richText: lineObj.richText } : lineObj.plainText
          applyPreviewOverrideToExcelCell(cContent, `terms_${tIdx}_content`, st2)

          if (contentCol < totalCols) {
            applyRowMergesWithStyle(outRowIdx, [{ left: contentCol, right: totalCols }])
          }

          const isWrap = st2.wrapText !== false
          const estLines = isWrap ? Math.max(1, Math.ceil(lineObj.plainText.length / 115)) : 1
          tRow.height = Math.max(16, estLines * 16)
          outRowIdx++
        })
      }
      continue
    }

    // Normal Row (Logo, Customer Header, Title, Table Header, Total Row, Terms Title, Order Confirm, Signature, Footer)
    const rowObj = ws.getRow(outRowIdx)
    const firstCellRaw = tpl.grid_cells?.[`${r}_1`]?.value || ''
    const rowHasLogo = showLogo && (firstCellRaw.includes('{{LOGO}}') || firstCellRaw.includes('{{LOGO_TRAI}}'))
    const rowH = tpl.row_heights?.[r]

    if (rowHasLogo) {
      excelLogoRowIdx = outRowIdx
      rowObj.height = Math.max(54, Math.round((rowH || 84) * 0.75))
    } else if (rowH !== undefined && rowH <= 0) {
      rowObj.height = 0
      rowObj.hidden = true
    } else if (rowH !== undefined) {
      rowObj.height = Math.max(15, Math.round(rowH * 0.75))
    }

    const rowMerges = [...getGridRowMerges(r)]
    if (rowHasLogo) {
      // Force full-table merge on Logo row, matching `renderTemplateToHtml`
      const hasFullLogoMerge = rowMerges.some(m => m.left === 1 && m.right === totalCols)
      if (!hasFullLogoMerge && totalCols > 1) {
        rowMerges.push({ top: r, bottom: r, left: 1, right: totalCols })
      }
    }

    let rowHasTruocThue = false
    let rowHasTienVat = false
    for (let cc = 1; cc <= totalCols; cc++) {
      const rv = normalizeLegacyTokenSyntax(tpl.grid_cells?.[`${r}_${cc}`]?.value || '').trim()
      if (rv === '{{TONG_TRUOC_THUE}}') rowHasTruocThue = true
      if (rv === '{{TONG_TIEN_VAT}}') rowHasTienVat = true
    }

    for (let c = 1; c <= totalCols; c++) {
      const gCell = tpl.grid_cells?.[`${r}_${c}`]
      const hasGridOv = Boolean(ctx.previewCellOverrides?.[`grid_${r}_${c}`])
      if (!gCell && !hasGridOv) continue
      const rawVal = gCell?.value || ''
      const xlCell = rowObj.getCell(c)
      applyGridStyleToExcelCell(xlCell, gCell?.style, rawVal)

      if (rawVal.includes('{{LOGO}}') || rawVal.includes('{{LOGO_TRAI}}')) {
        xlCell.value = ''
        continue
      }
      if (rawVal.includes('{{TEN_CONG_TY_BAN}}') && c === 1) {
        excelFooterCompanyRowIdx = outRowIdx
      }

      const normVal = normalizeLegacyTokenSyntax(rawVal)
      const trimmed = normVal.trim()
      const colLet = colIndexToLetter(c)
      const hasDataRows = firstDataRowIdx > 0 && lastDataRowIdx >= firstDataRowIdx && ctx.rows.some(x => x.type === 'item')

      if (
        trimmed === '{{DL_TONG_USD}}' ||
        trimmed === '{{DL_TONG_VND}}' ||
        trimmed === '{{DL_TONG_VAT}}' ||
        trimmed === '{{DL_TONG_SAU_THUE}}'
      ) {
        const resVal = numericGlobalTokens[trimmed] ?? 0
        if (hasDataRows) {
          xlCell.value = {
            formula: `SUM(${colLet}${firstDataRowIdx}:${colLet}${lastDataRowIdx})`,
            result: resVal
          }
        } else {
          xlCell.value = resVal
        }
        xlCell.numFmt = trimmed === '{{DL_TONG_USD}}' ? '#,##0.00' : '#,##0'
      } else if (numericGlobalTokens[trimmed] !== undefined) {
        if (trimmed === '{{TONG_TRUOC_THUE}}' && hasDataRows && colTruocThueL === colLet) {
          xlCell.value = {
            formula: `SUM(${colLet}${firstDataRowIdx}:${colLet}${lastDataRowIdx})`,
            result: ctx.totals.truoc
          }
        } else if (trimmed === '{{TONG_TIEN_VAT}}' && hasDataRows && colTienVatL === colLet) {
          xlCell.value = {
            formula: `SUM(${colLet}${firstDataRowIdx}:${colLet}${lastDataRowIdx})`,
            result: ctx.totals.vat
          }
        } else if (trimmed === '{{TONG_SAU_THUE}}' && hasDataRows) {
          if (rowHasTruocThue && rowHasTienVat && colTienVatL && colTruocThueL) {
            xlCell.value = {
              formula: `${colTienVatL}${outRowIdx}+${colTruocThueL}${outRowIdx}`,
              result: ctx.totals.sau
            }
          } else if (colSauThueL === colLet) {
            xlCell.value = {
              formula: `SUM(${colLet}${firstDataRowIdx}:${colLet}${lastDataRowIdx})`,
              result: ctx.totals.sau
            }
          } else {
            xlCell.value = ctx.totals.sau
          }
        } else {
          xlCell.value = numericGlobalTokens[trimmed]
        }
        xlCell.numFmt = trimmed === '{{TONG_TRUOC_THUE_USD}}' ? '#,##0.00' : numFmt
      } else {
        xlCell.value = replaceTokensInText(normVal, globalMap)
      }
      applyPreviewOverrideToExcelCell(xlCell, `grid_${r}_${c}`, gCell?.style, rawVal)
    }

    applyRowMergesWithStyle(outRowIdx, rowMerges)
    outRowIdx++
  }

  // Apply any custom row height overrides from live preview dragging
  if (ctx.previewRowHeightOverrides) {
    for (const [xlRowStr, hPx] of Object.entries(ctx.previewRowHeightOverrides)) {
      const xlRowNum = Number(xlRowStr)
      if (xlRowNum > 0 && xlRowNum < outRowIdx && typeof hPx === 'number') {
        const rObj = ws.getRow(xlRowNum)
        if (hPx <= 0) {
          rObj.height = 0
          rObj.hidden = true
        } else {
          rObj.hidden = false
          rObj.height = Math.max(12, Math.round(hPx * 0.75))
        }
      }
    }
  }

  // 3. Embed Header Logo image & Footer Orange/Blue line image matching Thiết lập mẫu in
  if (showLogo && excelLogoRowIdx > 0 && logoUrl) {
    try {
      const resp = await fetch(logoUrl)
      if (resp.ok) {
        const buf = await resp.arrayBuffer()
        const ext = logoUrl.toLowerCase().includes('.jpg') || logoUrl.toLowerCase().includes('.jpeg') ? 'jpeg' : 'png'
        const imgId = wb.addImage({ buffer: buf, extension: ext })
        const brCol = Math.max(1, Math.round((totalCols * logoWidthPct) / 100))
        ws.addImage(imgId, {
          tl: { col: 0, row: excelLogoRowIdx - 1 } as any,
          br: { col: brCol, row: excelLogoRowIdx } as any,
          editAs: 'oneCell'
        })
      }
    } catch (e) {
      console.warn('Không thể nhúng ảnh logo vào Excel:', e)
    }
  }

  if (excelFooterCompanyRowIdx > 0) {
    try {
      const lineImgId = wb.addImage({
        base64: NTS_FOOTER_LINE_BASE64,
        extension: 'png'
      })
      ws.addImage(lineImgId, {
        tl: { col: 0, row: excelFooterCompanyRowIdx - 1 } as any,
        br: { col: totalCols, row: excelFooterCompanyRowIdx - 1 + 0.18 } as any,
        editAs: 'oneCell'
      })
    } catch {}
  }

  // 4. Strictly lock horizontal PageView to 1 page wide (matching Thiết lập mẫu in page config)
  const finalLastRow = Math.max(ws.rowCount, 1)
  const lastColLetter = colIndexToLetter(totalCols)
  ws.pageSetup.paperSize = tpl.cau_hinh_trang?.kho_giay === 'A3' ? 8 : 9 // 9 = A4
  ws.pageSetup.orientation = tpl.cau_hinh_trang?.huong_giay || 'portrait'
  ws.pageSetup.margins = {
    left: 0.25,
    right: 0.25,
    top: 0.25,
    bottom: 0.25,
    header: 0.3,
    footer: 0.3
  }
  ws.pageSetup.fitToPage = true
  ws.pageSetup.fitToWidth = 1
  ws.pageSetup.fitToHeight = 0
  ;(ws.pageSetup as any).scale = undefined
  ws.pageSetup.printArea = `A1:${lastColLetter}${finalLastRow}`
  if ((ws as any).properties?.pageSetup) {
    ;(ws as any).properties.pageSetup.fitToPage = true
  }
  ws.views = [
    {
      state: 'normal',
      style: 'pageBreakPreview',
      zoomScale: 85,
      zoomScaleNormal: 85
    } as any
  ]

  const outBuffer = await wb.xlsx.writeBuffer()
  return new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/* =====================================================
   10. XUẤT PDF / IN TRỰC TIẾP, ẢNH PNG, FILE HTML, WORD (.DOC) & HỖ TRỢ IPHONE PWA
===================================================== */

export function isMobileOrIOSPWA(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isStandalone =
    (window.navigator as any).standalone === true ||
    (typeof window.matchMedia === 'function' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches))
  const isMobileViewport =
    window.innerWidth <= 900 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  return isIOS || isStandalone || isMobileViewport
}

export function triggerBrowserDownload(blob: Blob, fullFileName: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const safeFileName = String(fullFileName || 'BaoGia.xlsx').replace(/\//g, '\u2215')
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = safeFileName
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    if (a.parentNode) a.parentNode.removeChild(a)
  }, 1500)
  // Không revoke ngay lập tức vì trên iOS / WebKit quá trình tải đọc Blob bất đồng bộ
  setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 60000)
}

function formatByteSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',')
  const mimeMatch = parts[0]?.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(parts[1] || '')
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

export async function deliverExportedFile(
  blob: Blob,
  fullFileName: string,
  mimeType: string,
  options?: { previewDataUrl?: string; title?: string }
): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  fullFileName = String(fullFileName || 'BaoGia.xlsx').replace(/\//g, '\u2215')

  if (!isMobileOrIOSPWA()) {
    triggerBrowserDownload(blob, fullFileName)
    return
  }

  const isImage = mimeType.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(fullFileName)
  const file = new File([blob], fullFileName, {
    type: mimeType || (isImage ? 'image/png' : 'application/octet-stream'),
    lastModified: Date.now()
  })
  const canWebShareFile =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] }))

  const objectUrl = window.URL.createObjectURL(blob)
  let previewDataUrl = options?.previewDataUrl || ''
  if (isImage && !previewDataUrl) {
    previewDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : objectUrl)
      reader.onerror = () => resolve(objectUrl)
      reader.readAsDataURL(blob)
    })
  }

  // Luôn hiển thị bảng Lưu / Chia sẻ chuyên dụng cho iPhone PWA để người dùng thấy ngay file/ảnh
  const existingSheet = document.getElementById('agy-mobile-export-sheet')
  if (existingSheet && existingSheet.parentNode) {
    existingSheet.parentNode.removeChild(existingSheet)
  }

  const overlay = document.createElement('div')
  overlay.id = 'agy-mobile-export-sheet'
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    background: rgba(2, 6, 23, 0.86);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
  `

  const ext = (fullFileName.split('.').pop() || '').toUpperCase()
  const badgeColor =
    ext === 'XLSX' || ext === 'XLS'
      ? '#10b981'
      : ext === 'DOC' || ext === 'DOCX'
      ? '#3b82f6'
      : isImage
      ? '#f59e0b'
      : '#8b5cf6'

  overlay.innerHTML = `
    <div style="
      width: 100%;
      max-width: 520px;
      max-height: 90dvh;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.75);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: #f8fafc;
    ">
      <!-- Header -->
      <div style="
        padding: 16px 18px;
        background: linear-gradient(135deg, rgba(16,185,129,0.18), rgba(15,23,42,0.95));
        border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      ">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div style="
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: rgba(16,185,129,0.2);
            border: 1px solid rgba(16,185,129,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #34d399;
            font-weight: 800;
            font-size: 12px;
            flex-shrink: 0;
          ">${ext || 'FILE'}</div>
          <div style="min-width: 0;">
            <div style="font-size: 15px; font-weight: 800; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${isImage ? 'Ảnh báo giá đã sẵn sàng' : 'File báo giá đã sẵn sàng'}
            </div>
            <div style="font-size: 12px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${fullFileName} • ${formatByteSize(blob.size)}
            </div>
          </div>
        </div>
        <button id="agy-exp-close-btn" type="button" style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          color: #cbd5e1;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">✕</button>
      </div>

      <!-- Body -->
      <div style="
        padding: 16px 18px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        display: flex;
        flex-direction: column;
        gap: 14px;
      ">
        <div style="
          padding: 11px 13px;
          border-radius: 12px;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.28);
          color: #e0f2fe;
          font-size: 12.5px;
          line-height: 1.45;
        ">
          ${
            isImage
              ? '📱 <b>Trên iPhone (PWA):</b> Bấm nút <b>Lưu / Chia sẻ</b> bên dưới (chọn <b>Lưu hình ảnh</b> để lưu vào Thư viện Ảnh hoặc gửi qua <b>Zalo</b>), hoặc <b>nhấn giữ trực tiếp vào ảnh</b> bên dưới để Lưu vào Ảnh.'
              : '📱 <b>Trên iPhone (PWA):</b> Bấm nút <b>Lưu vào Tệp / Chia sẻ</b> bên dưới rồi chọn <b>Lưu vào Tệp (Save to Files)</b>, mở bằng <b>Excel / Word</b>, hoặc gửi ngay qua <b>Zalo, Mail</b>.'
          }
        </div>

        ${
          isImage
            ? `
          <div style="
            background: #ffffff;
            border-radius: 12px;
            padding: 8px;
            border: 1px solid rgba(255,255,255,0.15);
            max-height: 46dvh;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            text-align: center;
          ">
            <img
              src="${previewDataUrl || objectUrl}"
              alt="${fullFileName}"
              style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 6px; -webkit-touch-callout: default !important; user-select: auto !important;"
            />
          </div>
        `
            : `
          <div style="
            background: rgba(30, 41, 59, 0.75);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 14px;
          ">
            <div style="
              width: 48px;
              height: 48px;
              border-radius: 12px;
              background: ${badgeColor}22;
              border: 1px solid ${badgeColor}66;
              color: ${badgeColor};
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 13px;
              flex-shrink: 0;
            ">.${ext}</div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-size: 14px; font-weight: 700; color: #f8fafc; word-break: break-all; line-height: 1.35;">
                ${fullFileName}
              </div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
                Dung lượng: <b style="color: #cbd5e1;">${formatByteSize(blob.size)}</b> • Sẵn sàng lưu hoặc gửi đi
              </div>
            </div>
          </div>
        `
        }

        <!-- Actions -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 2px;">
          <button id="agy-exp-share-btn" type="button" style="
            width: 100%;
            padding: 14px 16px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #10b981, #059669);
            color: #ffffff;
            font-size: 14.5px;
            font-weight: 800;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.55);
          ">
            <span>📤 ${isImage ? 'Lưu vào Ảnh / Chia sẻ (Zalo, Tệp...)' : 'Lưu vào Tệp (Files) / Chia sẻ (Zalo, Mail...)'}</span>
          </button>

          <a
            id="agy-exp-direct-dl"
            href="${objectUrl}"
            download="${fullFileName}"
            style="
              width: 100%;
              box-sizing: border-box;
              padding: 12px 16px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.16);
              background: rgba(255,255,255,0.06);
              color: #e2e8f0;
              font-size: 13.5px;
              font-weight: 700;
              text-decoration: none;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            "
          >
            <span>⬇️ Tải trực tiếp (${fullFileName})</span>
          </a>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  const cleanup = () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl)
    }, 60000)
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cleanup()
  })

  const closeBtn = overlay.querySelector('#agy-exp-close-btn')
  if (closeBtn) closeBtn.addEventListener('click', cleanup)

  const shareBtn = overlay.querySelector('#agy-exp-share-btn')
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (canWebShareFile) {
        try {
          await navigator.share({
            files: [file],
            title: fullFileName
          })
          return
        } catch (err: any) {
          if (err && err.name === 'AbortError') return
        }
      }
      // Fallback nếu thiết bị không hỗ trợ navigator.share({ files })
      triggerBrowserDownload(blob, fullFileName)
    })
  }

  // Nếu trình duyệt vẫn còn giữ user activation sau khi tạo file, mở luôn bảng Share của iOS
  if (canWebShareFile) {
    try {
      await navigator.share({
        files: [file],
        title: fullFileName
      })
    } catch {
      // Nếu iOS hết hạn user gesture do quá trình tạo file/ảnh mất > 1s,
      // người dùng vẫn đang thấy sẵn modal #agy-mobile-export-sheet để bấm nút Lưu/Chia sẻ.
    }
  }
}

function triggerInPagePrint(htmlBody: string, sizeCss: string, title: string): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const oldRoot = document.getElementById('agy-mobile-print-root')
  if (oldRoot && oldRoot.parentNode) oldRoot.parentNode.removeChild(oldRoot)
  const oldStyle = document.getElementById('agy-mobile-print-style')
  if (oldStyle && oldStyle.parentNode) oldStyle.parentNode.removeChild(oldStyle)

  const styleEl = document.createElement('style')
  styleEl.id = 'agy-mobile-print-style'
  styleEl.textContent = `
    @media screen {
      #agy-mobile-print-root {
        display: none !important;
      }
    }
    @media print {
      @page {
        size: ${sizeCss};
        margin: 8mm;
      }
      body > *:not(#agy-mobile-print-root) {
        display: none !important;
      }
      html, body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #agy-mobile-print-root {
        display: block !important;
        position: static !important;
        width: 100% !important;
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      #agy-mobile-print-root table {
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed !important;
        page-break-inside: auto;
      }
      #agy-mobile-print-root tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
  `

  const printRoot = document.createElement('div')
  printRoot.id = 'agy-mobile-print-root'
  printRoot.innerHTML = htmlBody

  document.head.appendChild(styleEl)
  document.body.appendChild(printRoot)

  const prevTitle = document.title
  if (title) document.title = title

  const cleanupPrint = () => {
    document.title = prevTitle
    setTimeout(() => {
      if (printRoot.parentNode) printRoot.parentNode.removeChild(printRoot)
      if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl)
    }, 1000)
    window.removeEventListener('afterprint', cleanupPrint)
  }
  window.addEventListener('afterprint', cleanupPrint)

  setTimeout(() => {
    window.focus()
    window.print()
  }, 150)
}

export function exportPdfOrPrintFromTemplate(
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext,
  title = 'Bang_Bao_Gia'
): void {
  let htmlBody = renderTemplateToHtml(tpl, ctx)
  if (tpl.custom_js?.trim() && typeof document !== 'undefined') {
    const tmp = document.createElement('div')
    tmp.innerHTML = htmlBody
    runTemplateCustomJs(tmp, tpl, ctx)
    htmlBody = tmp.innerHTML
  }
  const pageCfg = tpl.cau_hinh_trang || ({} as any)
  const size = `${pageCfg.kho_giay || 'A4'} ${pageCfg.huong_giay || 'portrait'}`

  // Trên iPhone PWA / Mobile: không dùng window.open('', '_blank') vì PWA chặn popup hoặc mở màn hình trắng
  if (isMobileOrIOSPWA()) {
    const existingModal = document.getElementById('agy-mobile-print-modal')
    if (existingModal && existingModal.parentNode) {
      existingModal.parentNode.removeChild(existingModal)
    }

    const modal = document.createElement('div')
    modal.id = 'agy-mobile-print-modal'
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: rgba(2, 6, 23, 0.9);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
    `

    modal.innerHTML = `
      <div style="
        padding: 14px 16px;
        background: #0f172a;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-shrink: 0;
      ">
        <div style="min-width: 0;">
          <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">Xem &amp; In / Lưu PDF</div>
          <div style="font-size: 11.5px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${title} • Bấm "Mở hộp thoại In / Lưu PDF" hoặc "Xuất Ảnh PNG"
          </div>
        </div>
        <button id="agy-mprint-close" type="button" style="
          padding: 7px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          color: #f8fafc;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          flex-shrink: 0;
        ">Đóng ✕</button>
      </div>

      <div style="
        flex: 1;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        padding: 12px;
        background: #1e293b;
      ">
        <div style="
          background: #ffffff;
          color: #000000;
          border-radius: 8px;
          padding: 12px;
          min-width: ${pageCfg.huong_giay === 'landscape' ? '920px' : '680px'};
          box-shadow: 0 12px 32px rgba(0,0,0,0.45);
          margin: 0 auto;
        ">
          ${htmlBody}
        </div>
      </div>

      <div style="
        padding: 12px 16px;
        background: #0f172a;
        border-top: 1px solid rgba(255,255,255,0.1);
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        flex-shrink: 0;
      ">
        <button id="agy-mprint-do-print" type="button" style="
          flex: 1;
          min-width: 160px;
          padding: 13px 14px;
          border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: #ffffff;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
        ">🖨️ Mở hộp thoại In / Lưu PDF</button>
        <button id="agy-mprint-do-png" type="button" style="
          flex: 1;
          min-width: 150px;
          padding: 13px 14px;
          border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #ffffff;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
        ">🖼️ Lưu thành Ảnh (.png)</button>
      </div>
    `

    document.body.appendChild(modal)

    const closeBtn = modal.querySelector('#agy-mprint-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (modal.parentNode) modal.parentNode.removeChild(modal)
      })
    }

    const printBtn = modal.querySelector('#agy-mprint-do-print')
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        if (modal.parentNode) modal.parentNode.removeChild(modal)
        triggerInPagePrint(htmlBody, size, title)
      })
    }

    const pngBtn = modal.querySelector('#agy-mprint-do-png')
    if (pngBtn) {
      pngBtn.addEventListener('click', async () => {
        if (modal.parentNode) modal.parentNode.removeChild(modal)
        await exportPngFromTemplate(tpl, ctx, title)
      })
    }
    return
  }

  const printWin = window.open('', '_blank', 'width=1050,height=850')
  if (!printWin) {
    // Fallback in trực tiếp trên trang hiện tại nếu trình duyệt chặn popup
    triggerInPagePrint(htmlBody, size, title)
    return
  }

  const originBase = typeof window !== 'undefined' && window.location?.origin
    ? `<base href="${window.location.origin}/" />`
    : ''

  printWin.document.open()
  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      ${originBase}
      <title>${title}</title>
      <style>
        @page {
          size: ${size};
          margin: 8mm;
        }
        html, body {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          background: #ffffff;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
      </style>
    </head>
    <body>
      ${htmlBody}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `)
  printWin.document.close()
}

export async function exportPngFromTemplate(
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext,
  fileName = 'BaoGia_NTS'
): Promise<void> {
  const htmlBody = renderTemplateToHtml(tpl, ctx)
  const wrapper = document.createElement('div')
  const isLandscape = tpl.cau_hinh_trang?.huong_giay === 'landscape'
  wrapper.style.cssText = `
    position: fixed;
    top: -10000px;
    left: -10000px;
    width: ${isLandscape ? '1120px' : '820px'};
    background: #ffffff;
    z-index: -9999;
  `
  wrapper.innerHTML = htmlBody
  document.body.appendChild(wrapper)
  runTemplateCustomJs(wrapper, tpl, ctx)

  try {
    // Chuyển ảnh logo sang data URL để html2canvas trên iOS PWA không bị lỗi trắng ảnh
    const imgs = Array.from(wrapper.querySelectorAll('img'))
    for (const img of imgs) {
      const src = img.getAttribute('src') || ''
      if (src && !src.startsWith('data:')) {
        const absUrl =
          src.startsWith('/') && typeof window !== 'undefined'
            ? `${window.location.origin}${src}`
            : src
        const dataUrl = await resolveImageUrlToDataUrl(absUrl)
        img.setAttribute('src', dataUrl)
      }
    }

    await new Promise(r => setTimeout(r, 250))
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    const dataUrl = canvas.toDataURL('image/png')
    const blob =
      (await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))) ||
      dataUrlToBlob(dataUrl)
    const cleanName = String(fileName || 'BaoGia_NTS').replace(/\.(png|jpe?g|xlsx|doc|pdf|html)$/i, '')
    await deliverExportedFile(blob, `${cleanName}.png`, 'image/png', { previewDataUrl: dataUrl })
  } finally {
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper)
  }
}

export async function exportHtmlFileFromTemplate(
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext,
  fileName = 'BaoGia_NTS'
): Promise<void> {
  let htmlBody = renderTemplateToHtml(tpl, ctx)
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div')
    tmp.innerHTML = htmlBody
    if (tpl.custom_js?.trim()) {
      runTemplateCustomJs(tmp, tpl, ctx)
    }

    const pageCfg = tpl.cau_hinh_trang || ({} as any)
    const showLogo = pageCfg.hien_thi_logo !== false
    const logoUrl = pageCfg.logo_url || pageCfg.logo_trai || '/logo1.png'
    const logoWidthPct = Math.max(5, Math.min(100, Number(pageCfg.logo_width_pct) || 100))
    const logoHeight = Math.max(24, Math.min(500, Number(pageCfg.logo_height) || 68))

    // Nếu mẫu in đang bật hiển thị Logo nhưng trong DOM chưa có thẻ <img> nào (do ô {{LOGO}} bị xóa/ghi đè), tự động chèn Header Logo vào đầu tờ báo giá
    if (showLogo && logoUrl && tmp.querySelectorAll('img').length === 0) {
      const sheetEl = (tmp.querySelector('.nts-print-sheet') || tmp) as HTMLElement
      const headerDiv = document.createElement('div')
      headerDiv.style.cssText = 'display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 6px; width: 100%;'
      headerDiv.innerHTML = `<img src="${logoUrl}" style="width: ${logoWidthPct}%; height: ${logoHeight}px; object-fit: fill; display: block;" />`
      sheetEl.insertBefore(headerDiv, sheetEl.firstChild)
    }

    // Nhúng toàn bộ ảnh (đặc biệt là ảnh Header /logo1.png hoặc ảnh Cloudinary) thành Base64 Data URL để file .html tải về mở độc lập trên mọi máy đều có đầy đủ ảnh Header
    const imgs = Array.from(tmp.querySelectorAll('img'))
    for (const img of imgs) {
      const src = img.getAttribute('src') || ''
      if (src && !src.startsWith('data:')) {
        const absUrl =
          src.startsWith('/') && typeof window !== 'undefined'
            ? `${window.location.origin}${src}`
            : src
        const dataUrl = await resolveImageUrlToDataUrl(absUrl)
        img.setAttribute('src', dataUrl)
        img.removeAttribute('onerror')
      }
    }

    htmlBody = tmp.innerHTML
  }
  const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fileName}</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #f1f5f9;
      display: flex;
      justify-content: center;
    }
    .page-container {
      max-width: ${tpl.cau_hinh_trang?.huong_giay === 'landscape' ? '1160px' : '840px'};
      width: 100%;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      border-radius: 8px;
      overflow-x: hidden;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .page-container { box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    ${htmlBody}
  </div>
</body>
</html>`

  const cleanName = String(fileName || 'BaoGia_NTS').replace(/\.(html|htm|xlsx|doc|pdf|png)$/i, '')
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
  await deliverExportedFile(blob, `${cleanName}.html`, 'text/html;charset=utf-8')
}

async function resolveImageUrlToDataUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url
  try {
    const resp = await fetch(url)
    if (resp.ok) {
      const blob = await resp.blob()
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : url)
        reader.onerror = () => resolve(url)
        reader.readAsDataURL(blob)
      })
      if (dataUrl.startsWith('data:')) return dataUrl
    }
  } catch {}

  // Fallback qua HTMLImageElement + Canvas nếu fetch gặp lỗi CORS
  if (typeof document !== 'undefined' && typeof Image !== 'undefined') {
    try {
      return await new Promise<string>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth || img.width || 600
            canvas.height = img.naturalHeight || img.height || 100
            const ctx2d = canvas.getContext('2d')
            if (ctx2d) {
              ctx2d.drawImage(img, 0, 0)
              resolve(canvas.toDataURL('image/png'))
              return
            }
          } catch {}
          resolve(url)
        }
        img.onerror = () => resolve(url)
        img.src = url
      })
    } catch {}
  }

  return url
}

export async function exportWordFromTemplate(
  tpl: PrintTemplateConfig,
  ctx: QuoteExportContext,
  fileName = 'BaoGia_NTS'
): Promise<void> {
  let htmlBody = renderTemplateToHtml(tpl, ctx)
  const pageCfg = tpl.cau_hinh_trang || ({} as any)
  const isLandscape = pageCfg.huong_giay === 'landscape'
  const fontFamily = pageCfg.font_mac_dinh || 'Calibri, Arial, sans-serif'
  const baseFontSize = pageCfg.co_chu_mac_dinh || 10

  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div')
    tmp.innerHTML = htmlBody
    if (tpl.custom_js?.trim()) {
      runTemplateCustomJs(tmp, tpl, ctx)
    }

    // Ensure images have explicit pixel width/height attributes and embedded base64 data URLs for MS Word
    const contentWidthPx = isLandscape ? 980 : 660
    const logoWidthPct = Math.max(5, Math.min(100, Number(pageCfg.logo_width_pct) || 100))
    const targetImgW = Math.round((contentWidthPx * logoWidthPct) / 100)
    const targetImgH = Math.max(24, Math.min(500, Number(pageCfg.logo_height) || 74))

    const imgs = Array.from(tmp.querySelectorAll('img'))
    for (const img of imgs) {
      const src = img.getAttribute('src') || ''
      if (src) {
        const absUrl = src.startsWith('/') && typeof window !== 'undefined'
          ? `${window.location.origin}${src}`
          : src
        const dataUrl = await resolveImageUrlToDataUrl(absUrl)
        img.setAttribute('src', dataUrl)
      }
      img.setAttribute('width', String(targetImgW))
      img.setAttribute('height', String(targetImgH))
      img.style.width = `${targetImgW}px`
      img.style.height = `${targetImgH}px`
    }

    // Add explicit percentage widths to table cells on each row so MS Word respects column widths
    const totalCols = Math.max(tpl.so_cot || 9, 1)
    let sumColW = 0
    for (let c = 1; c <= totalCols; c++) {
      sumColW += Math.max(0, ctx.previewColWidthOverrides?.[c] ?? tpl.col_widths?.[c] ?? 100)
    }
    const safeSum = Math.max(1, sumColW)

    const trs = Array.from(tmp.querySelectorAll('tr'))
    trs.forEach(tr => {
      let curCol = 1
      const tds = Array.from(tr.querySelectorAll(':scope > td, :scope > th')) as HTMLElement[]
      tds.forEach(td => {
        const span = Math.max(1, Number(td.getAttribute('colspan')) || 1)
        let spanW = 0
        for (let cc = curCol; cc < curCol + span && cc <= totalCols; cc++) {
          spanW += Math.max(0, ctx.previewColWidthOverrides?.[cc] ?? tpl.col_widths?.[cc] ?? 100)
        }
        const pct = ((spanW / safeSum) * 100).toFixed(2)
        td.setAttribute('width', `${pct}%`)
        if (!td.style.width || td.style.width !== '0px') {
          td.style.width = `${pct}%`
        }
        curCol += span
      })
    })

    htmlBody = tmp.innerHTML
  }

  const pageSizePt = isLandscape ? '841.9pt 595.3pt' : '595.3pt 841.9pt'
  const orientXml = isLandscape ? 'landscape' : 'portrait'

  const wordDocHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${fileName}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page WordSection1 {
      size: ${pageSizePt};
      mso-page-orientation: ${orientXml};
      margin: 1.0cm 1.0cm 1.0cm 1.0cm;
      mso-header-margin: 0.5cm;
      mso-footer-margin: 0.5cm;
    }
    div.WordSection1 {
      page: WordSection1;
      width: 100%;
    }
    body {
      font-family: ${fontFamily};
      font-size: ${baseFontSize}pt;
      margin: 0;
      padding: 0;
      color: #000000;
    }
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td, th {
      word-wrap: break-word;
      mso-line-height-rule: exactly;
    }
  </style>
</head>
<body>
  <div class="WordSection1">
    ${htmlBody}
  </div>
</body>
</html>`

  const cleanName = String(fileName || 'BaoGia_NTS').replace(/\.(doc|docx|xlsx|pdf)$/i, '')
  const blob = new Blob(['\ufeff', wordDocHtml], { type: 'application/msword;charset=utf-8' })
  await deliverExportedFile(blob, `${cleanName}.doc`, 'application/msword')
}


