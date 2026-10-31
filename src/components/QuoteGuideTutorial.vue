<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

export interface GuideStepItem {
  id: string
  code: string
  groupId: string
  groupCode: string
  groupTitle: string
  title: string
  shortLabel: string
  summary: string
  detail: string
  desktopSelectors: string[]
  mobileSelectors: string[]
  autoOpenTag?: string
  keepSpotlightOnInteract?: boolean
  directHint?: string
}

export interface GuideGroup {
  id: string
  code: string
  shortTitle: string
  title: string
  subtitle: string
  wing: 'left' | 'right'
  paletteKey: 'sky' | 'indigo' | 'violet' | 'teal' | 'amber' | 'emerald' | 'rose'
  icon: 'catalog' | 'tabs' | 'table' | 'finance' | 'export' | 'tools' | 'debt'
  items: Omit<GuideStepItem, 'groupId' | 'groupCode' | 'groupTitle'>[]
}

interface DiagramBranchNode {
  id: string
  code: string
  title: string
  shortTitle: string
  subtitle: string
  wing: 'left' | 'right'
  paletteKey: GuideGroup['paletteKey']
  itemCount: number
  expanded: boolean
  dimmed: boolean
  x: number
  y: number
  w: number
  h: number
}

interface DiagramLeafNode {
  id: string
  code: string
  groupId: string
  groupTitle: string
  wing: 'left' | 'right'
  paletteKey: GuideGroup['paletteKey']
  title: string
  shortLabel: string
  summary: string
  detail: string
  autoOpenTag?: string
  dimmed: boolean
  matched: boolean
  selected: boolean
  x: number
  y: number
  w: number
  h: number
}

interface DiagramDetailNode {
  id: string
  code: string
  groupId: string
  groupTitle: string
  wing: 'left' | 'right'
  paletteKey: GuideGroup['paletteKey']
  title: string
  detail: string
  autoOpenTag?: string
  x: number
  y: number
  left: number
  w: number
  estHalfH: number
}

interface DiagramEdge {
  id: string
  path: string
  paletteKey: GuideGroup['paletteKey']
  dimmed: boolean
  isRootEdge: boolean
  isDetailEdge?: boolean
  startX?: number
  startY?: number
  endX: number
  endY: number
}

const props = defineProps<{
  modelValue: boolean
  themeMode: 'dark' | 'light'
  isMobile: boolean
  prepareStep: (step: GuideStepItem) => Promise<void> | void
  cleanupAutoOpened: (keepContextOpen: boolean, nextStepId?: string | null) => void
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'spotlight-change', stepId: string | null): void
}>()

const GUIDE_GROUPS: GuideGroup[] = [
  {
    id: 'catalog',
    code: '01',
    shortTitle: 'Kho sản phẩm',
    title: 'Kho sản phẩm & Bảng giá',
    subtitle: 'Chọn bảng giá, tìm kiếm mặt hàng, lọc bản quyền theo User và đưa sản phẩm vào báo giá.',
    wing: 'left',
    paletteKey: 'sky',
    icon: 'catalog',
    items: [
      {
        id: 'catalog-pricelist',
        code: '01.1',
        title: 'Chọn Bảng giá áp dụng',
        shortLabel: 'Chọn Bảng giá áp dụng',
        summary: 'Chuyển đổi giữa Giá gốc hệ thống và Bảng giá riêng.',
        detail: 'Chọn bảng giá áp dụng cho phiên làm việc. Hệ thống tự động đồng bộ đơn giá và lọc phạm vi sản phẩm thuộc bảng giá đã chọn.',
        desktopSelectors: ['.pl-picker-trigger'],
        mobileSelectors: ['.pl-picker-trigger']
      },
      {
        id: 'catalog-search',
        code: '01.2',
        title: 'Tìm kiếm sản phẩm tức thời',
        shortLabel: 'Tìm kiếm Mã, Tên, NCC',
        summary: 'Tra cứu theo Mã hàng, SKU, Tên hàng hoặc Nhà cung cấp.',
        detail: 'Nhập từ khóa để lọc kho hàng theo thời gian thực. Hỗ trợ lưu và gợi ý lại các từ khóa vừa tìm gần đây.',
        desktopSelectors: ['.cub-kw-seg', '.catalog-unified-bar'],
        mobileSelectors: ['.cub-kw-seg', '.catalog-unified-bar']
      },
      {
        id: 'catalog-user-filter',
        code: '01.3',
        title: 'Lọc theo số lượng User / License',
        shortLabel: 'Lọc theo số lượng User',
        summary: 'Tự động khớp khung bản quyền theo số lượng người dùng.',
        detail: 'Nhập số User cần báo giá để hệ thống tự lọc đúng gói phần mềm hoặc thiết bị nằm trong dải số lượng tương ứng.',
        desktopSelectors: ['.cub-user-seg'],
        mobileSelectors: ['.cub-user-seg']
      },
      {
        id: 'catalog-manual-add',
        code: '01.4',
        title: 'Nhập tay sản phẩm ngoài kho',
        shortLabel: 'Nhập tay SP ngoài kho',
        summary: 'Thêm nhanh mặt hàng tùy chỉnh chưa có trong danh mục.',
        detail: 'Mở biểu mẫu tạo mặt hàng mới với đầy đủ thông tin mã, tên, cấu hình, giá vốn và đưa trực tiếp vào bảng báo giá.',
        desktopSelectors: ['.catalog-manual-add-btn'],
        mobileSelectors: ['.catalog-manual-add-btn']
      },
      {
        id: 'catalog-product-card',
        code: '01.5',
        title: 'Thẻ sản phẩm & Thêm vào báo giá',
        shortLabel: 'Thẻ SP & Thêm vào báo giá',
        summary: 'Xem chi tiết cấu hình, tài liệu đính kèm và thêm hàng.',
        detail: 'Nhấn vào thẻ sản phẩm để xem thông số, file bảng giá đính kèm, đổi đơn vị tiền tệ hoặc nhấn nút Thêm để đưa mặt hàng vào báo giá.',
        desktopSelectors: ['.product-grid .card', '.product-grid'],
        mobileSelectors: ['.product-grid .card', '.product-grid']
      }
    ]
  },
  {
    id: 'tabs',
    code: '02',
    shortTitle: 'Đa Tab & HĐ',
    title: 'Quản lý Đa Tab & Định danh Hợp đồng',
    subtitle: 'Soạn thảo song song nhiều báo giá độc lập và kiểm soát thông tin định danh hợp đồng.',
    wing: 'left',
    paletteKey: 'indigo',
    icon: 'tabs',
    items: [
      {
        id: 'tabs-bar',
        code: '02.1',
        title: 'Thanh Đa Tab báo giá song song',
        shortLabel: 'Thanh Đa Tab báo giá',
        summary: 'Chuyển đổi nhanh giữa nhiều báo giá đang mở cùng lúc.',
        detail: 'Mỗi tab lưu giữ độc lập danh sách hàng hóa, khách hàng và chiết khấu riêng, giúp xử lý nhiều yêu cầu báo giá song song.',
        desktopSelectors: ['.quote-tabs-scroll', '.quote-workspace-topbar'],
        mobileSelectors: ['.m-qtabs-overview-btn', '.quote-tabs-scroll']
      },
      {
        id: 'tabs-add',
        code: '02.2',
        title: 'Tạo Tab báo giá mới',
        shortLabel: 'Tạo Tab báo giá mới',
        summary: 'Khởi tạo thêm một phiên báo giá trống mới.',
        detail: 'Nhấn nút dấu cộng để mở thêm tab báo giá mới mà không ảnh hưởng tới dữ liệu ở các tab đang soạn thảo.',
        desktopSelectors: ['.is-desktop-inline-add', '.btn-add-quote-tab-circle'],
        mobileSelectors: ['.is-mobile-pinned-add', '.btn-add-quote-tab-circle']
      },
      {
        id: 'tabs-reset',
        code: '02.3',
        title: 'Làm mới báo giá hiện tại',
        shortLabel: 'Làm mới báo giá',
        summary: 'Xóa danh sách hàng hóa và đặt lại phiên đang mở.',
        detail: 'Đưa tab báo giá hiện tại về trạng thái ban đầu để soạn lại từ đầu. Hệ thống sẽ hỏi xác nhận trước khi xóa.',
        desktopSelectors: ['.btn-reset-quote'],
        mobileSelectors: ['.btn-reset-quote']
      },
      {
        id: 'tabs-contract-id',
        code: '02.4',
        title: 'Định danh Mã HĐ, Số HĐ & Số PO',
        shortLabel: 'Mã HĐ, Số HĐ & Số PO',
        summary: 'Theo dõi mã hợp đồng, số hợp đồng và mã PO hiện hành.',
        detail: 'Hiển thị tự động mã định danh hợp đồng, mã hợp đồng gốc (khi chỉnh sửa bản cũ) và số PO theo khách hàng.',
        desktopSelectors: ['.unified-contract-pill'],
        mobileSelectors: ['.unified-contract-pill']
      }
    ]
  },
  {
    id: 'tools',
    code: '06',
    shortTitle: 'Tiện ích & Import',
    title: 'Tiện ích mở rộng & Import thông minh',
    subtitle: 'Ghi chú PO, mở lại hợp đồng cũ, bóc tách file báo giá / mua hàng và tra cứu nhật ký chỉnh sửa.',
    wing: 'left',
    paletteKey: 'violet',
    icon: 'tools',
    items: [
      {
        id: 'tools-po-notes',
        code: '06.1',
        title: 'Ghi chú Hợp đồng & Nội dung PO',
        shortLabel: 'Ghi chú HĐ & Nội dung PO',
        summary: 'Nhập Content of Contract / PO và ghi chú đính kèm.',
        detail: 'Lưu trữ nội dung điều khoản PO và ghi chú nội bộ đi kèm theo hồ sơ hợp đồng hiện tại.',
        desktopSelectors: ['[data-guide="ma-po-notes"]'],
        mobileSelectors: ['[data-guide="ma-po-notes"]'],
        autoOpenTag: 'Thao tác mở rộng'
      },
      {
        id: 'tools-load-old',
        code: '06.2',
        title: 'Nạp dữ liệu Hợp đồng / Báo giá cũ',
        shortLabel: 'Nạp Hợp đồng / Báo giá cũ',
        summary: 'Tìm kiếm và mở lại các hợp đồng hoặc Pipeline đã lưu.',
        detail: 'Tra cứu kho hợp đồng cũ hoặc dữ liệu Pipeline để tải lên chỉnh sửa tiếp, tạo phụ lục hoặc nhân bản thành báo giá mới.',
        desktopSelectors: ['[data-guide="ma-load-data"]'],
        mobileSelectors: ['[data-guide="ma-load-data"]'],
        autoOpenTag: 'Thao tác mở rộng'
      },
      {
        id: 'tools-import-quote',
        code: '06.3',
        title: 'Import Báo giá (Excel / PDF / Word / Ảnh & AI)',
        shortLabel: 'Import Báo giá đa định dạng',
        summary: 'Tự động bóc tách khách hàng, hàng hóa & điều khoản; hỗ trợ chuyển sang quét AI.',
        detail: 'Tải lên hoặc dán ảnh / file Excel (mọi đuôi), PDF, Word báo giá có sẵn. Hệ thống quét cấu trúc chuẩn trước và hỏi chuyển sang quét bằng AI khi gặp file không chuẩn hoặc ảnh chụp.',
        desktopSelectors: ['[data-guide="ma-import-quote"]'],
        mobileSelectors: ['[data-guide="ma-import-quote"]'],
        autoOpenTag: 'Thao tác mở rộng'
      },
      {
        id: 'tools-import-purchase',
        code: '06.4',
        title: 'Import & Đối chiếu Mua hàng (Excel / PDF / Word / Ảnh & AI)',
        shortLabel: 'Import Mua hàng đa định dạng',
        summary: 'Tải file hoặc ảnh báo giá đầu vào để tính Giá vốn sau thuế và đối chiếu DB.',
        detail: 'Đọc dữ liệu từ file báo giá nhà cung cấp (Excel mọi đuôi, PDF, Word, Ảnh) để tính giá vốn nhập sau VAT, đối chiếu mã hàng DB và hỗ trợ quét bằng AI khi quét chuẩn thất bại.',
        desktopSelectors: ['[data-guide="ma-import-purchase"]'],
        mobileSelectors: ['[data-guide="ma-import-purchase"]'],
        autoOpenTag: 'Thao tác mở rộng'
      },
      {
        id: 'tools-raw-preview',
        code: '06.5',
        title: 'Xem đối chiếu Báo giá gốc',
        shortLabel: 'Xem bản Báo giá gốc',
        summary: 'Kiểm tra dữ liệu báo giá gốc trước khi điều chỉnh chênh lệch.',
        detail: 'Hiển thị song song các thông số giá gốc ban đầu để kiểm tra chéo với bảng giá sau khi đã phân bổ chênh lệch.',
        desktopSelectors: ['[data-guide="ma-raw-preview"]'],
        mobileSelectors: ['[data-guide="ma-raw-preview"]'],
        autoOpenTag: 'Thao tác mở rộng'
      },
      {
        id: 'tools-history',
        code: '06.6',
        title: 'Lịch sử & Nhật ký chỉnh sửa',
        shortLabel: 'Lịch sử & Nhật ký sửa',
        summary: 'Theo dõi toàn bộ lịch sử thay đổi giá trị trên báo giá.',
        detail: 'Ghi nhận thời điểm, giá trị cũ và giá trị mới của các lần điều chỉnh chiết khấu, chênh lệch và tổng tiền.',
        desktopSelectors: ['[data-guide="ma-history"]'],
        mobileSelectors: ['[data-guide="ma-history"]'],
        autoOpenTag: 'Thao tác mở rộng'
      }
    ]
  },
  {
    id: 'table',
    code: '03',
    shortTitle: 'Bảng báo giá',
    title: 'Bảng báo giá & Thiết lập hiển thị',
    subtitle: 'Tùy biến tiền tệ, giao diện Sáng/Tối, nhóm danh mục, kiểu đánh số STT, ẩn hiện cột, sửa giá và điều chỉnh nhóm.',
    wing: 'right',
    paletteKey: 'teal',
    icon: 'table',
    items: [
      {
        id: 'table-currency',
        code: '03.1',
        title: 'Chuyển đổi tiền tệ VND / USD',
        shortLabel: 'Chuyển đổi VND / USD',
        summary: 'Quy đổi toàn bộ bảng báo giá giữa VND và USD.',
        detail: 'Chuyển đổi tức thời đơn vị tiền hiển thị và tính toán thành tiền dựa trên tỉ giá của từng dòng sản phẩm.',
        desktopSelectors: ['.vip-currency-switch'],
        mobileSelectors: ['.vip-currency-switch']
      },
      {
        id: 'table-theme',
        code: '03.2',
        title: 'Chế độ Giao diện Sáng / Tối',
        shortLabel: 'Giao diện Sáng / Tối',
        summary: 'Chuyển đổi giữa nền Tối mặc định và nền Sáng Xanh - Trắng.',
        detail: 'Nằm trong bảng Thiết lập hiển thị. Cho phép đổi nhanh phong cách hiển thị phù hợp với điều kiện ánh sáng làm việc.',
        desktopSelectors: ['[data-guide="col-theme-mode"]', '.quote-col-setting-dropdown'],
        mobileSelectors: ['[data-guide="col-theme-mode"]', '.quote-col-setting-dropdown'],
        autoOpenTag: 'Thiết lập hiển thị'
      },
      {
        id: 'table-category-group',
        code: '03.3',
        title: 'Hiển thị theo Danh mục hoặc Riêng lẻ',
        shortLabel: 'Nhóm Danh mục / Riêng lẻ',
        summary: 'Gom nhóm hàng hóa theo danh mục cha hoặc hiển thị phẳng.',
        detail: 'Khi bật chế độ Theo danh mục, sản phẩm được gom dưới dòng tiêu đề nhóm (bao gồm cả nhóm trống cho sản phẩm chưa gán danh mục).',
        desktopSelectors: ['[data-guide="col-group-toggle"]', '.quote-col-setting-dropdown'],
        mobileSelectors: ['[data-guide="col-group-toggle"]', '.quote-col-setting-dropdown'],
        autoOpenTag: 'Thiết lập hiển thị'
      },
      {
        id: 'table-stt-format',
        code: '03.4',
        title: 'Định dạng STT (Số thường / La Mã / Phân cấp)',
        shortLabel: 'Định dạng STT (Số / La Mã)',
        summary: 'Tùy chọn đánh số I, II hoặc 1, 2 hoặc phân cấp I.1, 1.1.',
        detail: 'Điều chỉnh linh hoạt kiểu số thứ tự cho dòng danh mục cha và các dòng sản phẩm con, đồng bộ trực tiếp sang bản in và file xuất.',
        desktopSelectors: ['[data-guide="col-stt-format"]', '.quote-col-setting-dropdown'],
        mobileSelectors: ['[data-guide="col-stt-format"]', '.quote-col-setting-dropdown'],
        autoOpenTag: 'Thiết lập hiển thị'
      },
      {
        id: 'table-columns',
        code: '03.5',
        title: 'Ẩn / Hiện các cột dữ liệu bảng',
        shortLabel: 'Ẩn / Hiện các cột dữ liệu',
        summary: 'Bật tắt từng cột chuyên sâu như SKU, Giá vốn, Mức Off, Net Margin.',
        detail: 'Tích chọn các cột cần quan sát trong lúc làm giá hoặc nhấn Tất cả cột để bật đầy đủ thông tin phân tích.',
        desktopSelectors: ['[data-guide="col-visibility-list"]', '.quote-col-setting-dropdown'],
        mobileSelectors: ['[data-guide="col-visibility-list"]', '.quote-col-setting-dropdown'],
        autoOpenTag: 'Thiết lập hiển thị'
      },
      {
        id: 'table-rows',
        code: '03.6',
        title: 'Chỉnh sửa chi tiết dòng hàng & Kéo thả vị trí',
        shortLabel: 'Chỉnh sửa dòng & Kéo thả',
        summary: 'Nhấn vào từng ô để sửa số lượng, đơn giá, VAT và sắp xếp thứ tự.',
        detail: 'Trên PC nhấn vào bất kỳ ô nào của dòng sản phẩm (trên Mobile chạm vào đơn giá hoặc thẻ sản phẩm) để mở hộp thoại Chỉnh sửa hàng kèm công cụ Sửa giá / Điều chỉnh riêng; nắm biểu tượng kéo để đổi thứ tự dòng.',
        desktopSelectors: ['.quote-item-row', '.quote-table-wrap'],
        mobileSelectors: ['.m-qcard', '.quote-table-wrap']
      },
      {
        id: 'table-item-edit-price',
        code: '03.7',
        title: 'Nút Sửa giá từng mặt hàng (Tab Thông tin giá)',
        shortLabel: 'Nút Sửa giá từng mặt hàng',
        summary: 'Cập nhật trực tiếp giá thực tế cho List Price, Đơn giá (KH) hoặc TT Trước thuế mà không tạo chênh lệch.',
        detail: 'Mở dòng sản phẩm và chuyển sang tab "Thông tin giá": các ô List Price, Đơn giá (KH) và TT Trước thuế được khóa gõ trực tiếp và đi kèm nút "Sửa giá" màu xanh dương. Dùng "Sửa giá" (Sửa thường) khi muốn đổi giá bán thực tế: hệ thống tự tính ngược lại % Off khách (hoặc cập nhật List Price gốc) và xóa/không sinh Chênh lệch giá — khác với nút "Điều chỉnh" dùng để kê giá hợp đồng tạo chênh lệch.',
        desktopSelectors: ['[data-guide="qe-sales-price-group"]', '[data-guide="qe-edit-price-zone"]', '[data-guide="qe-btn-edit-unit-price"]'],
        mobileSelectors: ['[data-guide="qe-edit-price-zone"]', '[data-guide="qe-btn-edit-unit-price"]'],
        autoOpenTag: 'Tab Thông tin giá • Dữ liệu mẫu',
        keepSpotlightOnInteract: true,
        directHint: 'Dữ liệu mẫu: Nhấn thử nút "Sửa giá" màu xanh dương trong vùng sáng để mở trực tiếp Hộp thoại Sửa giá thực tế (03.8).'
      },
      {
        id: 'table-edit-price-modal',
        code: '03.8',
        title: 'Hộp thoại Sửa giá thực tế (Theo % & Nhập số tiền)',
        shortLabel: 'Hộp thoại Sửa giá thực tế',
        summary: 'Tăng/giảm nhanh giá thực tế theo % hoặc gõ thẳng mức tiền mục tiêu kèm bảng đối chiếu trực tiếp.',
        detail: 'Khi nhấn bất kỳ nút "Sửa giá" nào, hộp thoại Sửa Thường (Sửa giá thực tế) sẽ mở ra với thẻ đối chiếu trực tiếp "Giá trị gốc → Giá mới dự kiến". Bạn có thể chọn tab "Theo %" (đổi chiều Giảm - / Tăng +, gõ % hoặc chạm mốc nhanh ±5%, ±10%, ±15%), hoặc chuyển sang tab "Nhập số tiền" để gõ thẳng con số mong muốn, bấm "Về giá gốc" nếu cần khôi phục rồi nhấn "Lưu giá mới".',
        desktopSelectors: ['[data-guide="adj-price-modal-card"]', '.adjust-price-modal-card'],
        mobileSelectors: ['[data-guide="adj-price-interactive-zone"]', '.adj-compare-card'],
        autoOpenTag: 'Hộp thoại Sửa giá • Mẫu -10%',
        keepSpotlightOnInteract: true,
        directHint: 'Dữ liệu mẫu (-10%): Bấm thử tab "Theo %" / "Nhập số tiền", chọn mốc ±5%..±15%, "Về giá gốc" hoặc "Lưu giá mới" ngay trong vùng sáng.'
      },
      {
        id: 'table-group-edit-price',
        code: '03.9',
        title: 'Nút Sửa giá theo Danh mục',
        shortLabel: 'Nút Sửa giá theo Danh mục',
        summary: 'Cập nhật đồng loạt Giá thực tế gốc cho toàn bộ sản phẩm thuộc cùng một danh mục.',
        detail: 'Nằm trên thanh tiêu đề của mỗi nhóm Danh mục trong bảng báo giá (trên di động là nút biểu tượng cây bút màu xanh dương). Nhấn "Sửa giá" để tăng/giảm theo % hoặc đặt tổng tiền trước thuế mục tiêu cho cả nhóm; hệ thống tự động tính lại % Off khách và cập nhật thẳng vào Giá thực tế của toàn bộ mặt hàng trong nhóm mà không tạo khoản Chênh lệch giá.',
        desktopSelectors: ['[data-guide="group-btn-edit-price"]', '[data-guide="group-adjust-actions"]', '.group-row', '.quote-table-wrap'],
        mobileSelectors: ['[data-guide="group-btn-edit-price"]', '[data-guide="group-adjust-actions"]', '.group-row', '.quote-table-wrap'],
        autoOpenTag: 'Thanh danh mục'
      },
      {
        id: 'table-group-adjust',
        code: '03.10',
        title: 'Nút Điều chỉnh chênh lệch theo Danh mục',
        shortLabel: 'Nút Điều chỉnh theo Danh mục',
        summary: 'Tăng/giảm giá hợp đồng cho toàn bộ sản phẩm trong một danh mục để tạo Chênh lệch giá.',
        detail: 'Đặt cạnh nút Sửa giá trên thanh tiêu đề Danh mục (trên di động là nút biểu tượng mũi tên hai chiều). Dùng để tăng hoặc giảm giá hợp đồng theo % hoặc số tiền mục tiêu cho tất cả mặt hàng thuộc nhóm danh mục đó mà vẫn giữ nguyên Giá thực tế gốc, phần chênh tự động ghi nhận vào Chênh lệch giá.',
        desktopSelectors: ['[data-guide="group-btn-adjust-diff"]', '[data-guide="group-adjust-actions"]', '.group-row', '.quote-table-wrap'],
        mobileSelectors: ['[data-guide="group-btn-adjust-diff"]', '[data-guide="group-adjust-actions"]', '.group-row', '.quote-table-wrap'],
        autoOpenTag: 'Thanh danh mục'
      }
    ]
  },
  {
    id: 'finance',
    code: '04',
    shortTitle: 'KH & Tài chính',
    title: 'Khách hàng, Chiết khấu & Tổng hợp Tài chính',
    subtitle: 'Quản lý hồ sơ khách hàng, quét OCR thuế, chiết khấu, điều chỉnh chênh lệch và điều chỉnh tổng giá báo giá.',
    wing: 'right',
    paletteKey: 'amber',
    icon: 'finance',
    items: [
      {
        id: 'finance-customer',
        code: '04.1',
        title: 'Thông tin Khách hàng & Tra cứu MST',
        shortLabel: 'Thông tin KH & Mã số thuế',
        summary: 'Nhập hoặc chọn khách hàng có sẵn từ cơ sở dữ liệu.',
        detail: 'Tra cứu và điền nhanh thông tin khách hàng theo Mã số thuế, Tên người liên hệ hoặc Tên doanh nghiệp.',
        desktopSelectors: ['[data-guide="dock-customer-panel"]', '.sidebar-dock-tabs'],
        mobileSelectors: ['.save-export-cust-modal .cust-group-main', '.save-export-cust-modal']
      },
      {
        id: 'finance-ocr-tax',
        code: '04.2',
        title: 'Quét ảnh Thuế (OCR) & Import Khách hàng',
        shortLabel: 'Quét ảnh Thuế (OCR) & KH',
        summary: 'Tự động nhận diện MST, tên công ty từ ảnh chụp hoặc file.',
        detail: 'Hỗ trợ tải ảnh chụp thông tin thuế để nhận diện chữ tự động (OCR), hoặc nạp hồ sơ khách hàng từ file Đề xuất mua hàng / Báo giá.',
        desktopSelectors: ['[data-guide="cust-import-toolbar"]', '.cust-import-btn.tax'],
        mobileSelectors: ['[data-guide="cust-import-toolbar"]', '.cust-import-btn.tax'],
        autoOpenTag: 'Hồ sơ Khách hàng'
      },
      {
        id: 'finance-discount',
        code: '04.3',
        title: 'Chiết khấu tổng & Thuế chênh lệch giá',
        shortLabel: 'Chiết khấu & Thuế chênh lệch',
        summary: 'Thiết lập % chiết khấu trước thuế, thuế chênh lệch và theo dõi khoản còn lại.',
        detail: 'Nhập tỷ lệ % chiết khấu tổng trước thuế và % thuế chênh lệch giá để hệ thống tự động khấu trừ và tính Tổng Chiết khấu.',
        desktopSelectors: ['[data-guide="dock-discount-panel"]', '.sidebar-dock-tabs'],
        mobileSelectors: ['.m-sum-card.is-discount']
      },
      {
        id: 'finance-adjust-diff',
        code: '04.4',
        title: 'Nút Điều chỉnh Tổng Chênh lệch giá',
        shortLabel: 'Điều chỉnh Chênh lệch giá',
        summary: 'Phân bổ tăng/giảm tổng chênh lệch giá trên toàn báo giá.',
        detail: 'Nằm ngay cạnh mục Chênh lệch giá. Mở hộp thoại điều chỉnh tổng khoản chênh lệch theo % hoặc nhập số tiền cụ thể; hệ thống tự động phân bổ lên giá hợp đồng của các mặt hàng mà vẫn giữ nguyên Tổng giá thực tế.',
        desktopSelectors: ['[data-guide="btn-adjust-total-diff"]', '[data-guide="dock-discount-panel"]'],
        mobileSelectors: ['[data-guide="m-btn-adjust-total-diff"]', '.m-sum-card.is-discount'],
        autoOpenTag: 'Mục Chiết khấu'
      },
      {
        id: 'finance-summary',
        code: '04.5',
        title: 'Tổng hợp Tài chính & Giá trị sau thuế',
        shortLabel: 'Tổng hợp Tài chính & VAT',
        summary: 'Đối chiếu Tổng giá thực tế, Tổng trước thuế HĐ, VAT và Sau thuế.',
        detail: 'Tổng hợp minh bạch các chỉ số tài chính cốt lõi của báo giá kèm nút xem nhanh lịch sử biến động từng chỉ số.',
        desktopSelectors: ['[data-guide="dock-finance-panel"]', '.sidebar-dock-tabs'],
        mobileSelectors: ['.m-sum-card.is-finance']
      },
      {
        id: 'finance-adjust-total-price',
        code: '04.6',
        title: 'Nút Điều chỉnh Tổng giá Báo giá (HĐ)',
        shortLabel: 'Điều chỉnh Tổng giá Báo giá',
        summary: 'Chốt tổng tiền trước thuế HĐ theo % hoặc mức giá mục tiêu.',
        detail: 'Nằm cạnh dòng Tổng trước thuế (HĐ). Cho phép tăng/giảm đồng loạt giá toàn bộ báo giá theo % hoặc chốt cứng một mức Tổng tiền hợp đồng mong muốn; hệ thống tự chia tỷ lệ đơn giá xuống toàn bộ sản phẩm và ghi nhận vào Chênh lệch giá.',
        desktopSelectors: ['[data-guide="btn-adjust-all-quote"]', '[data-guide="dock-finance-panel"]'],
        mobileSelectors: ['[data-guide="m-btn-adjust-all-quote"]', '.m-sum-card.is-finance'],
        autoOpenTag: 'Mục Tài chính'
      }
    ]
  },
  {
    id: 'export',
    code: '05',
    shortTitle: 'Lưu & Xuất',
    title: 'Lưu trữ & Xuất bản Báo giá',
    subtitle: 'Lưu hợp đồng lên hệ thống dữ liệu và xuất file theo mẫu in chuyên nghiệp.',
    wing: 'right',
    paletteKey: 'emerald',
    icon: 'export',
    items: [
      {
        id: 'save-quote',
        code: '05.1',
        title: 'Lưu Báo giá lên hệ thống',
        shortLabel: 'Lưu Báo giá lên hệ thống',
        summary: 'Kiểm tra hồ sơ khách hàng và lưu bản ghi báo giá / hợp đồng.',
        detail: 'Mở màn hình xác nhận thông tin khách hàng, lưu khách hàng vào DB (nếu mới) và ghi nhận toàn bộ dữ liệu báo giá lên hệ thống.',
        desktopSelectors: ['.action-btn.action-save'],
        mobileSelectors: ['.m-step-save', '.mobile-screen2-action-bar']
      },
      {
        id: 'export-multi-format',
        code: '05.2',
        title: 'Xuất dữ liệu đa định dạng (Excel, PDF, Word, In)',
        shortLabel: 'Xuất Excel, PDF, Word, In',
        summary: 'Chọn mẫu in (Template), xem trước bố cục và xuất file.',
        detail: 'Hỗ trợ xem trước bản in trực quan, chỉnh sửa nội dung ô trên bản xem trước và xuất ra Excel, PDF, Word, HTML hoặc Ảnh PNG.',
        desktopSelectors: ['[data-guide="ma-export-data"]'],
        mobileSelectors: ['[data-guide="ma-export-data"]'],
        autoOpenTag: 'Thao tác mở rộng'
      }
    ]
  },
  {
    id: 'debt',
    code: '07',
    shortTitle: 'Công nợ & TT',
    title: 'Quản lý & Thanh toán Công nợ',
    subtitle: 'Theo dõi dư nợ khách hàng theo từng PO, lập kế hoạch chia đợt hạn thu, ghi nhận thanh toán và quản lý lịch sử thu.',
    wing: 'right',
    paletteKey: 'rose',
    icon: 'debt',
    items: [
      {
        id: 'debt-customer-overview',
        code: '07.1',
        title: 'Tổng quan Công nợ KH & Mở bảng quản lý',
        shortLabel: 'Tổng quan Công nợ KH',
        summary: 'Xem nhanh dư nợ hiện tại, tiến độ thu và mở bảng quản lý công nợ khách hàng.',
        detail: 'Nằm trong hồ sơ Chi tiết Khách hàng (và màn hình Lưu Báo giá). Hiển thị tức thời Công nợ hiện tại, số tiền Đã thanh toán, Tổng phải thu của tất cả PO kèm thanh tiến độ %. Nhấn "Xem Tiến Độ Trả Nợ & Lịch Sử TT" để mở không gian quản lý công nợ chi tiết.',
        desktopSelectors: ['[data-guide="cust-debt-overview"]', '.cust-debt-btn'],
        mobileSelectors: ['[data-guide="cust-debt-overview"]', '.cust-debt-btn'],
        autoOpenTag: 'Hồ sơ Khách hàng'
      },
      {
        id: 'debt-po-kpi',
        code: '07.2',
        title: 'Theo dõi KPI Công nợ & Chọn đơn hàng PO',
        shortLabel: 'KPI Công nợ & Chọn PO',
        summary: 'Đối chiếu 4 chỉ số công nợ cốt lõi và chuyển đổi giữa các đơn hàng PO của khách.',
        detail: 'Tổng hợp Tổng tiền sau VAT, Đã thanh toán, Công nợ còn lại của PO đang chọn và Tổng nợ toàn khách hàng. Chọn từng đơn hàng ở cột Danh sách đơn hàng PO (hoặc dải thẻ PO vuốt ngang trên di động) để kiểm tra riêng từng hợp đồng, tự động ưu tiên đơn còn nợ lên đầu.',
        desktopSelectors: ['[data-guide="debt-dt-po-list"]', '.debt-payment-modal'],
        mobileSelectors: ['[data-guide="debt-m-po-strip"]', '.m-debt-kpi-section'],
        autoOpenTag: 'Quản lý Công nợ'
      },
      {
        id: 'debt-schedule-plan',
        code: '07.3',
        title: 'Thiết lập Kế hoạch & Chia đợt hạn thanh toán',
        shortLabel: 'Kế hoạch & Chia đợt hạn TT',
        summary: 'Đặt hạn thanh toán 1 lần (100%) hoặc chia nhiều đợt thu theo % và theo dõi quá hạn.',
        detail: 'Theo dõi tiến độ từng đợt thu (Phải thu, Đã thu, Còn thiếu, Mốc hạn và cảnh báo Quá hạn / Sắp đến hạn). Nhấn "Chỉnh sửa mốc hạn / Chia đợt" (hoặc "Sửa hạn") để chọn hạn nhanh (+7 đến +60 ngày), áp dụng mẫu chia đợt (30-70, 50-50, 30-50-20) và tự cân bằng đợt cuối khớp 100%.',
        desktopSelectors: ['[data-guide="debt-dt-schedule-box"]', '[data-guide="debt-dt-btn-schedule"]'],
        mobileSelectors: ['[data-guide="debt-m-plan-row"]', '[data-guide="debt-m-btn-schedule"]'],
        autoOpenTag: 'Quản lý Công nợ'
      },
      {
        id: 'debt-record-payment',
        code: '07.4',
        title: 'Ghi nhận đợt thanh toán mới & Thu nhanh theo đợt',
        shortLabel: 'Ghi nhận đợt thanh toán mới',
        summary: 'Nhập số tiền khách trả hoặc chọn nhanh theo đợt còn thiếu, tự động đồng bộ dư nợ.',
        detail: 'Nhấn "+ Ghi nhận đợt thanh toán mới" (hoặc nút "Thu đợt này" trên từng đợt) để nhập số tiền thu hoặc chọn chip nhanh (Đợt còn thiếu, Tất toán 100%, 50%, 30%). Khi lưu, hệ thống tự động trừ công nợ và đồng bộ sang Lịch sử thanh toán, Sale Report, Hợp đồng tổng quát và Hồ sơ khách hàng.',
        desktopSelectors: ['[data-guide="debt-dt-btn-record"]', '[data-guide="debt-dt-schedule-box"]'],
        mobileSelectors: ['[data-guide="debt-m-btn-record"]', '.m-debt-inst-pay-btn'],
        autoOpenTag: 'Quản lý Công nợ'
      },
      {
        id: 'debt-payment-history',
        code: '07.5',
        title: 'Lịch sử thanh toán & Xóa hoàn lại công nợ',
        shortLabel: 'Lịch sử TT & Hoàn công nợ',
        summary: 'Tra cứu nhật ký các lần khách đã trả tiền và hỗ trợ xóa đợt thu nhầm để hoàn nợ.',
        detail: 'Ghi nhận đầy đủ từng lần thu thực tế gồm Thời gian thanh toán, Số tiền đã thu, Công nợ còn lại sau giao dịch và Ghi chú. Khi cần điều chỉnh đợt nhập nhầm, nhấn nút "Xóa" trên dòng lịch sử để hủy giao dịch và tự động cộng hoàn lại công nợ.',
        desktopSelectors: ['[data-guide="debt-dt-history-box"]', '.debt-payment-modal'],
        mobileSelectors: ['.m-debt-hist-card', '[data-guide="debt-m-history-empty"]', '[data-guide="debt-m-tabs"]'],
        autoOpenTag: 'Quản lý Công nợ'
      }
    ]
  }
]

const SORTED_LIST_GROUPS: GuideGroup[] = [...GUIDE_GROUPS].sort((a, b) => a.code.localeCompare(b.code))

const ALL_STEPS: GuideStepItem[] = SORTED_LIST_GROUPS.flatMap((g) =>
  g.items.map((it) => ({
    ...it,
    groupId: g.id,
    groupCode: g.code,
    groupTitle: g.title
  }))
)

/* ================== VIEW MODE, SEARCH & SELECTED LEAF DETAIL STATE ================== */
const viewMode = ref<'diagram' | 'list'>('diagram')
const searchQuery = ref('')
const expandedGroupIds = ref<Set<string>>(new Set())
const selectedLeafId = ref<string | null>(null)

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

function doesItemMatchQuery(
  item: Omit<GuideStepItem, 'groupId' | 'groupCode' | 'groupTitle'>,
  group: GuideGroup,
  q: string
): boolean {
  if (!q) return true
  return (
    item.title.toLowerCase().includes(q) ||
    item.shortLabel.toLowerCase().includes(q) ||
    item.summary.toLowerCase().includes(q) ||
    item.detail.toLowerCase().includes(q) ||
    item.code.toLowerCase().includes(q) ||
    group.title.toLowerCase().includes(q) ||
    group.code.toLowerCase().includes(q)
  )
}

function doesGroupHaveQueryMatch(group: GuideGroup, q: string): boolean {
  if (!q) return true
  return group.items.some((it) => doesItemMatchQuery(it, group, q))
}

function isGroupExpanded(groupId: string): boolean {
  const q = normalizedQuery.value
  if (q) {
    const grp = GUIDE_GROUPS.find((g) => g.id === groupId)
    return grp ? doesGroupHaveQueryMatch(grp, q) : false
  }
  return expandedGroupIds.value.has(groupId)
}

const areAllExpanded = computed(() => {
  return GUIDE_GROUPS.every((g) => expandedGroupIds.value.has(g.id))
})

/* ================== MINDMAP DIAGRAM GEOMETRY ENGINE (3 LEVELS) ================== */
const ROOT_W = 204
const ROOT_H = 74
const BRANCH_W = 236
const BRANCH_H = 54
const LEAF_W = 262
const LEAF_H = 42
const LEAF_GAP_Y = 10
const CLUSTER_GAP_Y = 36
const COLLAPSED_SLOT_H = 74
const X_BRANCH_OFFSET = 316
const X_LEAF_OFFSET = 628
const DETAIL_GAP_X = 68
const DETAIL_W = 322

const diagramGraph = computed(() => {
  const q = normalizedQuery.value
  const branches: DiagramBranchNode[] = []
  const leaves: DiagramLeafNode[] = []
  const edges: DiagramEdge[] = []
  let detailNode: DiagramDetailNode | null = null

  const buildWing = (wing: 'left' | 'right') => {
    const dir = wing === 'left' ? -1 : 1
    const wingGroups = GUIDE_GROUPS.filter((g) => g.wing === wing)
    const xBranch = dir * X_BRANCH_OFFSET
    const xLeaf = dir * X_LEAF_OFFSET

    const clusterMeta = wingGroups.map((g) => {
      const expanded = isGroupExpanded(g.id)
      const hasMatch = doesGroupHaveQueryMatch(g, q)
      const count = g.items.length
      const leavesSpanH = expanded ? count * LEAF_H + Math.max(0, count - 1) * LEAF_GAP_Y : 0
      const clusterH = expanded ? Math.max(BRANCH_H + 10, leavesSpanH) : COLLAPSED_SLOT_H
      return { group: g, expanded, hasMatch, leavesSpanH, clusterH }
    })

    const totalH =
      clusterMeta.reduce((acc, m) => acc + m.clusterH, 0) +
      Math.max(0, clusterMeta.length - 1) * CLUSTER_GAP_Y

    let cursorY = -totalH / 2

    clusterMeta.forEach((meta, idx) => {
      const g = meta.group
      const centerY = Math.round(cursorY + meta.clusterH / 2)
      const dimmedBranch = Boolean(q && !meta.hasMatch)

      branches.push({
        id: g.id,
        code: g.code,
        title: g.title,
        shortTitle: g.shortTitle,
        subtitle: g.subtitle,
        wing,
        paletteKey: g.paletteKey,
        itemCount: g.items.length,
        expanded: meta.expanded,
        dimmed: dimmedBranch,
        x: xBranch,
        y: centerY,
        w: BRANCH_W,
        h: BRANCH_H
      })

      const rootAnchorX = dir * (ROOT_W / 2)
      const rootOffsetFactor =
        clusterMeta.length <= 1
          ? 0
          : Math.round(((idx / (clusterMeta.length - 1)) * 2 - 1) * (clusterMeta.length > 3 ? 18 : 14))
      const rootAnchorY = rootOffsetFactor
      const branchInnerX = xBranch - dir * (BRANCH_W / 2)
      const branchInnerY = centerY
      const midRootX = Math.round(rootAnchorX + (branchInnerX - rootAnchorX) * 0.48)

      edges.push({
        id: `edge-root-${g.id}`,
        path: `M ${rootAnchorX} ${rootAnchorY} C ${midRootX} ${rootAnchorY}, ${midRootX} ${branchInnerY}, ${branchInnerX} ${branchInnerY}`,
        paletteKey: g.paletteKey,
        dimmed: dimmedBranch,
        isRootEdge: true,
        endX: branchInnerX,
        endY: branchInnerY
      })

      if (meta.expanded) {
        const startLeafCenterY = centerY - meta.leavesSpanH / 2 + LEAF_H / 2
        const branchOuterX = xBranch + dir * (BRANCH_W / 2)
        const leafInnerX = xLeaf - dir * (LEAF_W / 2)
        const midLeafX = Math.round(branchOuterX + (leafInnerX - branchOuterX) * 0.48)

        g.items.forEach((it, itemIdx) => {
          const leafY = Math.round(startLeafCenterY + itemIdx * (LEAF_H + LEAF_GAP_Y))
          const matched = doesItemMatchQuery(it, g, q)
          const dimmedLeaf = Boolean(q && !matched)
          const isSelected = selectedLeafId.value === it.id && !dimmedLeaf

          leaves.push({
            id: it.id,
            code: it.code,
            groupId: g.id,
            groupTitle: g.title,
            wing,
            paletteKey: g.paletteKey,
            title: it.title,
            shortLabel: it.shortLabel,
            summary: it.summary,
            detail: it.detail,
            autoOpenTag: it.autoOpenTag,
            dimmed: dimmedLeaf,
            matched: Boolean(q && matched),
            selected: isSelected,
            x: xLeaf,
            y: leafY,
            w: LEAF_W,
            h: LEAF_H
          })

          edges.push({
            id: `edge-${g.id}-${it.id}`,
            path: `M ${branchOuterX} ${centerY} C ${midLeafX} ${centerY}, ${midLeafX} ${leafY}, ${leafInnerX} ${leafY}`,
            paletteKey: g.paletteKey,
            dimmed: dimmedLeaf,
            isRootEdge: false,
            endX: leafInnerX,
            endY: leafY
          })

          if (isSelected) {
            const leafOuterX = xLeaf + dir * (LEAF_W / 2)
            const detailInnerX = leafOuterX + dir * DETAIL_GAP_X
            const detailCenterX = detailInnerX + dir * (DETAIL_W / 2)
            const detailLeft = detailCenterX - DETAIL_W / 2
            const midDetailX = Math.round((leafOuterX + detailInnerX) / 2)

            detailNode = {
              id: it.id,
              code: it.code,
              groupId: g.id,
              groupTitle: g.title,
              wing,
              paletteKey: g.paletteKey,
              title: it.title,
              detail: it.detail,
              autoOpenTag: it.autoOpenTag,
              x: detailCenterX,
              y: leafY,
              left: detailLeft,
              w: DETAIL_W,
              estHalfH: 108
            }

            edges.push({
              id: `edge-detail-${it.id}`,
              path: `M ${leafOuterX} ${leafY} C ${midDetailX} ${leafY}, ${midDetailX} ${leafY}, ${detailInnerX} ${leafY}`,
              paletteKey: g.paletteKey,
              dimmed: false,
              isRootEdge: false,
              isDetailEdge: true,
              startX: leafOuterX,
              startY: leafY,
              endX: detailInnerX,
              endY: leafY
            })
          }
        })
      }

      cursorY += meta.clusterH + CLUSTER_GAP_Y
    })
  }

  buildWing('left')
  buildWing('right')

  let minX = -ROOT_W / 2
  let maxX = ROOT_W / 2
  let minY = -ROOT_H / 2
  let maxY = ROOT_H / 2

  for (const b of branches) {
    minX = Math.min(minX, b.x - b.w / 2)
    maxX = Math.max(maxX, b.x + b.w / 2)
    minY = Math.min(minY, b.y - b.h / 2)
    maxY = Math.max(maxY, b.y + b.h / 2)
  }
  for (const lf of leaves) {
    minX = Math.min(minX, lf.x - lf.w / 2)
    maxX = Math.max(maxX, lf.x + lf.w / 2)
    minY = Math.min(minY, lf.y - lf.h / 2)
    maxY = Math.max(maxY, lf.y + lf.h / 2)
  }
  if (detailNode) {
    const dn = detailNode as DiagramDetailNode
    minX = Math.min(minX, dn.x - dn.w / 2)
    maxX = Math.max(maxX, dn.x + dn.w / 2)
    minY = Math.min(minY, dn.y - dn.estHalfH)
    maxY = Math.max(maxY, dn.y + dn.estHalfH)
  }

  return {
    branches,
    leaves,
    edges,
    detailNode: detailNode as DiagramDetailNode | null,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
})

/* ================== CANVAS PAN, ZOOM & INSPECTOR ================== */
const canvasWrapRef = ref<HTMLElement | null>(null)
const detailCardRef = ref<HTMLElement | null>(null)
const pan = ref({ x: 0, y: -12 })
const zoom = ref(1)
const isInteractingCanvas = ref(false)
let suppressNextNodeClick = false

interface HoveredInfo {
  code: string
  title: string
  desc: string
  tag?: string
  hint: string
}
const hoveredNodeInfo = ref<HoveredInfo | null>(null)

let dragState: {
  active: boolean
  startX: number
  startY: number
  originPanX: number
  originPanY: number
  moved: boolean
} | null = null

let pinchState: {
  initialDist: number
  initialZoom: number
  midX: number
  midY: number
  initialPanX: number
  initialPanY: number
} | null = null

function clampZoom(z: number): number {
  return Math.min(1.65, Math.max(0.42, Number(z.toFixed(3))))
}

function fitDiagramToViewport(animate = true) {
  const wrap = canvasWrapRef.value
  if (!wrap) return
  const rect = wrap.getBoundingClientRect()
  if (rect.width < 40 || rect.height < 40) return

  const padX = rect.width <= 768 ? 28 : 64
  const padTop = 36
  const padBottom = 76
  const availW = Math.max(200, rect.width - padX * 2)
  const availH = Math.max(180, rect.height - padTop - padBottom)

  const b = diagramGraph.value.bounds
  const scaleX = availW / Math.max(1, b.width)
  const scaleY = availH / Math.max(1, b.height)
  let nextZoom = Math.min(1.04, scaleX, scaleY)

  if (rect.width <= 640 && expandedGroupIds.value.size === 0 && !normalizedQuery.value) {
    nextZoom = Math.max(nextZoom, 0.72)
  }
  nextZoom = clampZoom(nextZoom)

  const centerX = (b.minX + b.maxX) / 2
  const centerY = (b.minY + b.maxY) / 2
  const verticalBias = (padTop - padBottom) / 2

  if (!animate) {
    isInteractingCanvas.value = true
  } else {
    isInteractingCanvas.value = false
  }

  zoom.value = nextZoom
  pan.value = {
    x: Math.round(-centerX * nextZoom),
    y: Math.round(-centerY * nextZoom + verticalBias)
  }

  if (!animate) {
    requestAnimationFrame(() => {
      isInteractingCanvas.value = false
    })
  }
}

function ensureRegionVisibleInCanvas(minX: number, maxX: number, minY: number, maxY: number, centerOnMobile = false) {
  const wrap = canvasWrapRef.value
  if (!wrap) return
  const rect = wrap.getBoundingClientRect()
  if (rect.width < 40 || rect.height < 40) return

  isInteractingCanvas.value = false

  if (rect.width <= 768 && centerOnMobile) {
    const mobileTargetZoom = clampZoom(Math.min(0.92, (rect.width - 28) / Math.max(1, maxX - minX)))
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    zoom.value = Math.max(0.58, mobileTargetZoom)
    pan.value = {
      x: Math.round(-cx * zoom.value),
      y: Math.round(-cy * zoom.value - 18)
    }
    return
  }

  const z = zoom.value
  const halfW = rect.width / 2
  const halfH = rect.height / 2
  const marginX = 36
  const marginTop = 28
  const marginBottom = 72

  const regionW = (maxX - minX) * z
  const regionH = (maxY - minY) * z
  const availW = rect.width - marginX * 2
  const availH = rect.height - marginTop - marginBottom

  if (regionW > availW || regionH > availH) {
    const targetZ = clampZoom(Math.min(z, availW / Math.max(1, maxX - minX), availH / Math.max(1, maxY - minY)))
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    zoom.value = targetZ
    pan.value = {
      x: Math.round(-cx * targetZ),
      y: Math.round(-cy * targetZ - 14)
    }
    return
  }

  const screenLeft = halfW + pan.value.x + minX * z
  const screenRight = halfW + pan.value.x + maxX * z
  const screenTop = halfH + pan.value.y + minY * z
  const screenBottom = halfH + pan.value.y + maxY * z

  let nextPanX = pan.value.x
  let nextPanY = pan.value.y

  if (screenLeft < marginX) {
    nextPanX += marginX - screenLeft
  } else if (screenRight > rect.width - marginX) {
    nextPanX -= screenRight - (rect.width - marginX)
  }

  if (screenTop < marginTop) {
    nextPanY += marginTop - screenTop
  } else if (screenBottom > rect.height - marginBottom) {
    nextPanY -= screenBottom - (rect.height - marginBottom)
  }

  pan.value = {
    x: Math.round(nextPanX),
    y: Math.round(nextPanY)
  }
}

function ensureBranchVisibleInCanvas(groupId: string) {
  const branch = diagramGraph.value.branches.find((b) => b.id === groupId)
  if (!branch) return

  const groupLeaves = diagramGraph.value.leaves.filter((lf) => lf.groupId === groupId)
  let minX = branch.x - branch.w / 2
  let maxX = branch.x + branch.w / 2
  let minY = branch.y - branch.h / 2
  let maxY = branch.y + branch.h / 2

  for (const lf of groupLeaves) {
    minX = Math.min(minX, lf.x - lf.w / 2)
    maxX = Math.max(maxX, lf.x + lf.w / 2)
    minY = Math.min(minY, lf.y - lf.h / 2)
    maxY = Math.max(maxY, lf.y + lf.h / 2)
  }

  ensureRegionVisibleInCanvas(minX, maxX, minY, maxY, true)
}

function ensureLeafDetailVisibleInCanvas(leafId: string) {
  const leaf = diagramGraph.value.leaves.find((lf) => lf.id === leafId)
  const dn = diagramGraph.value.detailNode
  if (!leaf || !dn || dn.id !== leafId) return

  let halfCardH = dn.estHalfH
  if (detailCardRef.value && zoom.value > 0) {
    const measuredH = detailCardRef.value.getBoundingClientRect().height / zoom.value
    if (measuredH > 40) {
      halfCardH = Math.ceil(measuredH / 2) + 8
    }
  }

  const minX = Math.min(leaf.x - leaf.w / 2, dn.x - dn.w / 2)
  const maxX = Math.max(leaf.x + leaf.w / 2, dn.x + dn.w / 2)
  const minY = Math.min(leaf.y - leaf.h / 2, dn.y - halfCardH)
  const maxY = Math.max(leaf.y + leaf.h / 2, dn.y + halfCardH)

  ensureRegionVisibleInCanvas(minX, maxX, minY, maxY, true)
}

function stepCanvasZoom(delta: number) {
  isInteractingCanvas.value = false
  const prevZoom = zoom.value
  const nextZoom = clampZoom(prevZoom + delta)
  const ratio = nextZoom / prevZoom
  zoom.value = nextZoom
  pan.value = {
    x: Math.round(pan.value.x * ratio),
    y: Math.round(pan.value.y * ratio)
  }
}

function onCanvasWheel(ev: WheelEvent) {
  const wrap = canvasWrapRef.value
  if (!wrap) return
  isInteractingCanvas.value = true

  const rect = wrap.getBoundingClientRect()
  const relX = ev.clientX - rect.left - rect.width / 2
  const relY = ev.clientY - rect.top - rect.height / 2

  const prevZoom = zoom.value
  const factor = ev.deltaY < 0 ? 1.09 : 0.915
  const nextZoom = clampZoom(prevZoom * factor)
  if (nextZoom === prevZoom) return

  const worldX = (relX - pan.value.x) / prevZoom
  const worldY = (relY - pan.value.y) / prevZoom

  zoom.value = nextZoom
  pan.value = {
    x: Math.round(relX - worldX * nextZoom),
    y: Math.round(relY - worldY * nextZoom)
  }
}

function onCanvasBackgroundClick(ev: MouseEvent) {
  if (suppressNextNodeClick) return
  const target = ev.target as HTMLElement | null
  if (!target) return
  if (
    target.classList.contains('qg-diagram-canvas') ||
    target.classList.contains('qg-canvas-stage')
  ) {
    selectedLeafId.value = null
  }
}

function onCanvasMouseDown(ev: MouseEvent) {
  if (ev.button !== 0) return
  dragState = {
    active: true,
    startX: ev.clientX,
    startY: ev.clientY,
    originPanX: pan.value.x,
    originPanY: pan.value.y,
    moved: false
  }
}

function onWindowMouseMove(ev: MouseEvent) {
  if (!dragState || !dragState.active) return
  const dx = ev.clientX - dragState.startX
  const dy = ev.clientY - dragState.startY
  if (!dragState.moved && Math.hypot(dx, dy) > 5) {
    dragState.moved = true
    isInteractingCanvas.value = true
  }
  if (dragState.moved) {
    pan.value = {
      x: Math.round(dragState.originPanX + dx),
      y: Math.round(dragState.originPanY + dy)
    }
  }
}

function onWindowMouseUp() {
  if (!dragState) return
  if (dragState.moved) {
    suppressNextNodeClick = true
    window.setTimeout(() => {
      suppressNextNodeClick = false
    }, 60)
  }
  dragState = null
  isInteractingCanvas.value = false
}

function getTouchDistance(t1: Touch, t2: Touch): number {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}

function onCanvasTouchStart(ev: TouchEvent) {
  if (ev.touches.length === 2) {
    const wrap = canvasWrapRef.value
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    const t1 = ev.touches[0]
    const t2 = ev.touches[1]
    dragState = null
    isInteractingCanvas.value = true
    pinchState = {
      initialDist: Math.max(10, getTouchDistance(t1, t2)),
      initialZoom: zoom.value,
      midX: (t1.clientX + t2.clientX) / 2 - rect.left - rect.width / 2,
      midY: (t1.clientY + t2.clientY) / 2 - rect.top - rect.height / 2,
      initialPanX: pan.value.x,
      initialPanY: pan.value.y
    }
    return
  }

  if (ev.touches.length === 1) {
    const t = ev.touches[0]
    pinchState = null
    dragState = {
      active: true,
      startX: t.clientX,
      startY: t.clientY,
      originPanX: pan.value.x,
      originPanY: pan.value.y,
      moved: false
    }
  }
}

function onCanvasTouchMove(ev: TouchEvent) {
  if (pinchState && ev.touches.length === 2) {
    ev.preventDefault()
    const dist = getTouchDistance(ev.touches[0], ev.touches[1])
    const nextZoom = clampZoom(pinchState.initialZoom * (dist / pinchState.initialDist))
    const worldX = (pinchState.midX - pinchState.initialPanX) / pinchState.initialZoom
    const worldY = (pinchState.midY - pinchState.initialPanY) / pinchState.initialZoom
    zoom.value = nextZoom
    pan.value = {
      x: Math.round(pinchState.midX - worldX * nextZoom),
      y: Math.round(pinchState.midY - worldY * nextZoom)
    }
    return
  }

  if (dragState && dragState.active && ev.touches.length === 1) {
    const t = ev.touches[0]
    const dx = t.clientX - dragState.startX
    const dy = t.clientY - dragState.startY
    if (!dragState.moved && Math.hypot(dx, dy) > 6) {
      dragState.moved = true
      isInteractingCanvas.value = true
    }
    if (dragState.moved) {
      ev.preventDefault()
      pan.value = {
        x: Math.round(dragState.originPanX + dx),
        y: Math.round(dragState.originPanY + dy)
      }
    }
  }
}

function onCanvasTouchEnd() {
  if (dragState?.moved) {
    suppressNextNodeClick = true
    window.setTimeout(() => {
      suppressNextNodeClick = false
    }, 80)
  }
  dragState = null
  pinchState = null
  isInteractingCanvas.value = false
}

function onDiagramRootClick() {
  if (suppressNextNodeClick) return
  toggleExpandAll()
}

function onDiagramBranchClick(groupId: string) {
  if (suppressNextNodeClick) return
  if (normalizedQuery.value) {
    searchQuery.value = ''
  }
  const next = new Set(expandedGroupIds.value)
  const willExpand = !next.has(groupId)
  if (willExpand) {
    next.add(groupId)
  } else {
    next.delete(groupId)
    if (selectedLeafId.value) {
      const selStep = ALL_STEPS.find((s) => s.id === selectedLeafId.value)
      if (selStep && selStep.groupId === groupId) {
        selectedLeafId.value = null
      }
    }
  }
  expandedGroupIds.value = next

  nextTick(() => {
    if (willExpand) {
      ensureBranchVisibleInCanvas(groupId)
    } else if (next.size === 0) {
      fitDiagramToViewport(true)
    }
  })
}

function onDiagramLeafClick(stepId: string) {
  if (suppressNextNodeClick) return
  if (selectedLeafId.value === stepId) {
    selectedLeafId.value = null
    return
  }
  selectedLeafId.value = stepId
  nextTick(() => {
    ensureLeafDetailVisibleInCanvas(stepId)
  })
}

function onDiagramLeafQuickJump(stepId: string) {
  if (suppressNextNodeClick) return
  launchStepById(stepId)
}

function setHoverBranch(b: DiagramBranchNode) {
  hoveredNodeInfo.value = {
    code: b.code,
    title: b.title,
    desc: b.subtitle,
    hint: b.expanded ? 'Nhấn để thu gọn nhánh' : `Nhấn để mở ${b.itemCount} chức năng con`
  }
}

function setHoverLeaf(lf: DiagramLeafNode) {
  hoveredNodeInfo.value = {
    code: lf.code,
    title: lf.title,
    desc: lf.summary,
    tag: lf.autoOpenTag,
    hint: lf.selected ? 'Nhấn "Đi tới nút chức năng" trên thẻ giải thích' : 'Nhấn để xem giải thích • Nhấn mũi tên để đi tới ngay'
  }
}

function clearHoverNode() {
  hoveredNodeInfo.value = null
}

/* ================== LIST VIEW FILTERING & TOGGLES ================== */
const filteredListGroups = computed(() => {
  const q = normalizedQuery.value
  if (!q) return SORTED_LIST_GROUPS
  return SORTED_LIST_GROUPS.map((g) => {
    const matchedItems = g.items.filter((it) => doesItemMatchQuery(it, g, q))
    return {
      ...g,
      items: matchedItems
    }
  }).filter((g) => g.items.length > 0)
})

function toggleListGroup(groupId: string) {
  const next = new Set(expandedGroupIds.value)
  if (next.has(groupId)) {
    next.delete(groupId)
  } else {
    next.add(groupId)
  }
  expandedGroupIds.value = next
}

function toggleExpandAll() {
  if (normalizedQuery.value) {
    searchQuery.value = ''
  }
  if (areAllExpanded.value) {
    expandedGroupIds.value = new Set()
    selectedLeafId.value = null
  } else {
    expandedGroupIds.value = new Set(GUIDE_GROUPS.map((g) => g.id))
  }
  if (viewMode.value === 'diagram') {
    nextTick(() => {
      fitDiagramToViewport(true)
    })
  }
}

function switchViewMode(mode: 'diagram' | 'list') {
  viewMode.value = mode
  if (mode === 'diagram') {
    nextTick(() => {
      fitDiagramToViewport(false)
    })
  }
}

watch(normalizedQuery, () => {
  if (viewMode.value === 'diagram' && props.modelValue) {
    nextTick(() => {
      fitDiagramToViewport(true)
    })
  }
})

function closeMapModal() {
  emit('update:modelValue', false)
}

/* ================== SPOTLIGHT CUTOUT & CLICK-THROUGH ENGINE ================== */
const activeStepIndex = ref<number>(-1)
const isPreparingStep = ref(false)
const targetFound = ref(true)
const popoverRef = ref<HTMLElement | null>(null)
let currentTargetEl: HTMLElement | null = null
let rafTrackId = 0
let postAnimTimer = 0
let resizeObserver: ResizeObserver | null = null

const viewport = ref({ w: 1280, h: 800 })
const hole = ref({ x: 0, y: 0, w: 0, h: 0, rx: 8 })
const popoverSize = ref({ w: 340, h: 210 })

const activeStep = computed<GuideStepItem | null>(() => {
  if (activeStepIndex.value < 0 || activeStepIndex.value >= ALL_STEPS.length) return null
  return ALL_STEPS[activeStepIndex.value]
})

const isSpotlightOpen = computed(() => activeStep.value !== null)

watch(
  () => activeStep.value?.id ?? null,
  (stepId) => {
    emit('spotlight-change', stepId)
  }
)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      updateViewportSize()
      if (viewMode.value === 'diagram') {
        nextTick(() => {
          if (selectedLeafId.value) {
            fitDiagramToViewport(false)
            ensureLeafDetailVisibleInCanvas(selectedLeafId.value)
          } else {
            fitDiagramToViewport(false)
          }
        })
      }
    }
  }
)

function updateViewportSize() {
  if (typeof window === 'undefined') return
  viewport.value = {
    w: window.innerWidth,
    h: window.innerHeight
  }
}

function isElementVisible(el: HTMLElement): boolean {
  const rects = el.getClientRects()
  if (!rects || rects.length === 0) return false
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
    return false
  }
  const rect = el.getBoundingClientRect()
  return rect.width > 2 && rect.height > 2
}

function findTargetElement(step: GuideStepItem): HTMLElement | null {
  const mobileNow = typeof window !== 'undefined' ? window.innerWidth <= 1100 : props.isMobile
  const selectors = mobileNow ? step.mobileSelectors : step.desktopSelectors
  for (const sel of selectors) {
    const nodes = document.querySelectorAll(sel)
    for (let i = 0; i < nodes.length; i++) {
      const candidate = nodes[i]
      if (candidate instanceof HTMLElement && isElementVisible(candidate)) {
        return candidate
      }
    }
  }
  return null
}

function scrollElementIntoContainers(el: HTMLElement) {
  if (typeof window === 'undefined') return
  const isMobileShell = window.innerWidth <= 1100
  let parent = el.parentElement
  while (parent && parent !== document.body && parent !== document.documentElement) {
    if (isMobileShell && parent.classList.contains('main-content')) {
      parent = parent.parentElement
      continue
    }
    const style = window.getComputedStyle(parent)
    const canScrollY =
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      parent.scrollHeight > parent.clientHeight + 2
    const canScrollX =
      (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
      parent.scrollWidth > parent.clientWidth + 2

    if (canScrollY || canScrollX) {
      const pRect = parent.getBoundingClientRect()
      const eRect = el.getBoundingClientRect()

      if (canScrollY) {
        const marginY = Math.min(48, pRect.height * 0.18)
        if (eRect.top < pRect.top + marginY || eRect.bottom > pRect.bottom - marginY) {
          const offsetInside = eRect.top - pRect.top + parent.scrollTop
          const desiredTop = offsetInside - pRect.height / 2 + Math.min(eRect.height, pRect.height * 0.6) / 2
          parent.scrollTop = Math.max(0, desiredTop)
        }
      }

      if (canScrollX) {
        const marginX = 24
        if (eRect.left < pRect.left + marginX || eRect.right > pRect.right - marginX) {
          const offsetLeft = eRect.left - pRect.left + parent.scrollLeft
          const desiredLeft = offsetLeft - pRect.width / 2 + Math.min(eRect.width, pRect.width * 0.6) / 2
          parent.scrollLeft = Math.max(0, desiredLeft)
        }
      }
    }
    parent = parent.parentElement
  }

  if (!isMobileShell) {
    const rect = el.getBoundingClientRect()
    if (rect.top < 60 || rect.bottom > window.innerHeight - 60) {
      const targetY = window.scrollY + rect.top - window.innerHeight / 2 + Math.min(rect.height, 260) / 2
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'auto' })
    }
  }
}

function measureTargetHole() {
  updateViewportSize()
  const vw = viewport.value.w
  const vh = viewport.value.h

  if (popoverRef.value) {
    const pRect = popoverRef.value.getBoundingClientRect()
    if (pRect.width > 20 && pRect.height > 20) {
      popoverSize.value = { w: pRect.width, h: pRect.height }
    }
  }

  if (!currentTargetEl || !document.body.contains(currentTargetEl) || !isElementVisible(currentTargetEl)) {
    if (activeStep.value) {
      currentTargetEl = findTargetElement(activeStep.value)
    }
  }

  if (!currentTargetEl) {
    targetFound.value = false
    const boxW = Math.min(320, vw - 32)
    hole.value = {
      x: Math.round((vw - boxW) / 2),
      y: Math.round(vh / 2),
      w: 0,
      h: 0,
      rx: 8
    }
    return
  }

  targetFound.value = true
  const rect = currentTargetEl.getBoundingClientRect()
  const pad = 5
  const rawX = Math.round(rect.left - pad)
  const rawY = Math.round(rect.top - pad)
  const rawR = Math.round(rect.right + pad)
  const rawB = Math.round(rect.bottom + pad)

  const clampedX = Math.max(4, Math.min(vw - 20, rawX))
  const clampedY = Math.max(4, Math.min(vh - 20, rawY))
  const clampedR = Math.max(clampedX + 16, Math.min(vw - 4, rawR))
  const clampedB = Math.max(clampedY + 16, Math.min(vh - 4, rawB))

  const computedRadius = parseFloat(window.getComputedStyle(currentTargetEl).borderRadius || '6')
  const rx = Number.isFinite(computedRadius) ? Math.min(16, Math.max(6, Math.round(computedRadius + 2))) : 8

  hole.value = {
    x: clampedX,
    y: clampedY,
    w: clampedR - clampedX,
    h: clampedB - clampedY,
    rx
  }
}

function waitMs(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

async function activateStepByIndex(idx: number) {
  if (idx < 0 || idx >= ALL_STEPS.length) return
  const nextStep = ALL_STEPS[idx]

  if (postAnimTimer) {
    window.clearTimeout(postAnimTimer)
    postAnimTimer = 0
  }

  isPreparingStep.value = true
  emit('update:modelValue', false)

  if (activeStep.value && activeStep.value.id !== nextStep.id) {
    props.cleanupAutoOpened(false, nextStep.id)
  }

  activeStepIndex.value = idx
  selectedLeafId.value = nextStep.id
  const exp = new Set(expandedGroupIds.value)
  exp.add(nextStep.groupId)
  expandedGroupIds.value = exp

  await nextTick()
  await props.prepareStep(nextStep)
  await nextTick()
  await waitMs(75)

  currentTargetEl = findTargetElement(nextStep)
  if (!currentTargetEl) {
    await waitMs(90)
    currentTargetEl = findTargetElement(nextStep)
  }

  if (currentTargetEl) {
    scrollElementIntoContainers(currentTargetEl)
    await waitMs(30)
  }

  detachTargetResizeObserver()
  if (currentTargetEl && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleMeasure()
    })
    resizeObserver.observe(currentTargetEl)
  }

  measureTargetHole()
  await nextTick()
  measureTargetHole()

  isPreparingStep.value = false

  postAnimTimer = window.setTimeout(() => {
    postAnimTimer = 0
    if (isSpotlightOpen.value) {
      measureTargetHole()
    }
  }, 290)
}

function launchStepById(stepId: string) {
  const idx = ALL_STEPS.findIndex((s) => s.id === stepId)
  if (idx >= 0) {
    activateStepByIndex(idx)
  }
}

function startFullTour() {
  activateStepByIndex(0)
}

function goPrevStep() {
  if (activeStepIndex.value > 0) {
    activateStepByIndex(activeStepIndex.value - 1)
  }
}

function goNextStep() {
  if (activeStepIndex.value < ALL_STEPS.length - 1) {
    activateStepByIndex(activeStepIndex.value + 1)
  } else {
    closeSpotlight(false)
  }
}

function returnToMap() {
  const stepSnapshot = activeStep.value
  closeSpotlight(false)
  if (stepSnapshot) {
    const exp = new Set(expandedGroupIds.value)
    exp.add(stepSnapshot.groupId)
    expandedGroupIds.value = exp
    selectedLeafId.value = stepSnapshot.id
  }
  emit('update:modelValue', true)
}

function detachTargetResizeObserver() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

function closeSpotlight(keepContextOpen: boolean) {
  if (rafTrackId) {
    cancelAnimationFrame(rafTrackId)
    rafTrackId = 0
  }
  if (postAnimTimer) {
    window.clearTimeout(postAnimTimer)
    postAnimTimer = 0
  }
  detachTargetResizeObserver()
  currentTargetEl = null
  activeStepIndex.value = -1
  isPreparingStep.value = false
  props.cleanupAutoOpened(keepContextOpen, null)
}

function onViewportResize() {
  updateViewportSize()
  if (isSpotlightOpen.value) {
    scheduleMeasure()
  } else if (props.modelValue && viewMode.value === 'diagram') {
    fitDiagramToViewport(false)
  }
}

function scheduleMeasure() {
  if (!isSpotlightOpen.value || rafTrackId) return
  rafTrackId = requestAnimationFrame(() => {
    rafTrackId = 0
    if (isSpotlightOpen.value) {
      measureTargetHole()
    }
  })
}

const popoverStyle = computed(() => {
  const vw = viewport.value.w
  const vh = viewport.value.h
  const margin = 12
  const gap = 12
  const maxCardW = Math.min(368, vw - margin * 2)
  const cardW = maxCardW
  const cardH = Math.min(popoverSize.value.h || 215, vh - margin * 2)

  if (!targetFound.value || hole.value.w <= 0 || hole.value.h <= 0) {
    return {
      width: `${cardW}px`,
      left: `${Math.round((vw - cardW) / 2)}px`,
      top: `${Math.max(margin, Math.round((vh - cardH) / 2))}px`
    }
  }

  const h = hole.value
  const spaceBelow = vh - (h.y + h.h) - margin
  const spaceAbove = h.y - margin
  const spaceRight = vw - (h.x + h.w) - margin
  const spaceLeft = h.x - margin

  let top = 0
  let left = 0

  if (spaceBelow >= cardH + gap) {
    top = h.y + h.h + gap
    left = h.x + h.w / 2 - cardW / 2
  } else if (spaceAbove >= cardH + gap) {
    top = h.y - cardH - gap
    left = h.x + h.w / 2 - cardW / 2
  } else if (spaceRight >= cardW + gap) {
    left = h.x + h.w + gap
    top = h.y + h.h / 2 - cardH / 2
  } else if (spaceLeft >= cardW + gap) {
    left = h.x - cardW - gap
    top = h.y + h.h / 2 - cardH / 2
  } else {
    top = spaceBelow >= spaceAbove ? vh - cardH - margin : margin
    left = vw - cardW - margin
  }

  left = Math.max(margin, Math.min(vw - cardW - margin, Math.round(left)))
  top = Math.max(margin, Math.min(vh - cardH - margin, Math.round(top)))

  return {
    width: `${cardW}px`,
    left: `${left}px`,
    top: `${top}px`
  }
})

function isPointInsideHole(x: number, y: number): boolean {
  if (!targetFound.value || hole.value.w <= 0 || hole.value.h <= 0) return false
  return (
    x >= hole.value.x &&
    x <= hole.value.x + hole.value.w &&
    y >= hole.value.y &&
    y <= hole.value.y + hole.value.h
  )
}

function onGlobalClickCapture(ev: MouseEvent) {
  if (!isSpotlightOpen.value || isPreparingStep.value || !ev.isTrusted) return
  const target = ev.target as HTMLElement | null
  if (!target) return

  if (popoverRef.value && popoverRef.value.contains(target)) {
    return
  }
  if (target.closest('.guide-hit-shield')) {
    return
  }

  const hitTarget =
    (currentTargetEl && (currentTargetEl === target || currentTargetEl.contains(target))) ||
    isPointInsideHole(ev.clientX, ev.clientY)

  if (hitTarget) {
    if (activeStep.value?.keepSpotlightOnInteract) {
      nextTick(() => {
        scheduleMeasure()
      })
      return
    }
    window.setTimeout(() => {
      closeSpotlight(true)
    }, 0)
  }
}

function onGlobalFocusInCapture(ev: FocusEvent) {
  if (!isSpotlightOpen.value || isPreparingStep.value) return
  const target = ev.target as HTMLElement | null
  if (!target) return
  if (popoverRef.value && popoverRef.value.contains(target)) return

  if (
    currentTargetEl &&
    currentTargetEl.contains(target) &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
  ) {
    if (activeStep.value?.keepSpotlightOnInteract) {
      return
    }
    window.setTimeout(() => {
      closeSpotlight(true)
    }, 0)
  }
}

function onGlobalKeyDown(ev: KeyboardEvent) {
  if (isSpotlightOpen.value) {
    const activeEl = document.activeElement as HTMLElement | null
    const isTypingTarget = Boolean(
      activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable)
    )
    if (ev.key === 'Escape') {
      ev.preventDefault()
      ev.stopPropagation()
      closeSpotlight(false)
    } else if (ev.key === 'ArrowRight' && !isTypingTarget) {
      ev.preventDefault()
      goNextStep()
    } else if (ev.key === 'ArrowLeft' && !isTypingTarget) {
      ev.preventDefault()
      goPrevStep()
    }
    return
  }

  if (props.modelValue && ev.key === 'Escape') {
    const activeTag = (document.activeElement as HTMLElement | null)?.tagName
    if (activeTag === 'INPUT' && searchQuery.value) {
      searchQuery.value = ''
      return
    }
    if (viewMode.value === 'diagram' && selectedLeafId.value) {
      ev.preventDefault()
      selectedLeafId.value = null
      return
    }
    ev.preventDefault()
    closeMapModal()
  }
}

defineExpose({
  jumpToStep: launchStepById
})

onMounted(() => {
  updateViewportSize()
  window.addEventListener('resize', onViewportResize, { passive: true })
  window.addEventListener('scroll', scheduleMeasure, { capture: true, passive: true })
  window.addEventListener('mousemove', onWindowMouseMove, { passive: true })
  window.addEventListener('mouseup', onWindowMouseUp, { passive: true })
  window.addEventListener('click', onGlobalClickCapture, true)
  window.addEventListener('focusin', onGlobalFocusInCapture, true)
  window.addEventListener('keydown', onGlobalKeyDown)
})

onUnmounted(() => {
  if (rafTrackId) {
    cancelAnimationFrame(rafTrackId)
    rafTrackId = 0
  }
  if (postAnimTimer) {
    window.clearTimeout(postAnimTimer)
    postAnimTimer = 0
  }
  detachTargetResizeObserver()
  window.removeEventListener('resize', onViewportResize)
  window.removeEventListener('scroll', scheduleMeasure, true)
  window.removeEventListener('mousemove', onWindowMouseMove)
  window.removeEventListener('mouseup', onWindowMouseUp)
  window.removeEventListener('click', onGlobalClickCapture, true)
  window.removeEventListener('focusin', onGlobalFocusInCapture, true)
  window.removeEventListener('keydown', onGlobalKeyDown)
})
</script>

<template>
  <!-- FULLSCREEN 100% MODAL: SO DO NHANH (DIAGRAM 3 CAP) & DANH SACH -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="quote-guide-modal-overlay"
      :class="themeMode === 'light' ? 'is-light' : 'is-dark'"
    >
      <div class="qg-modal-card" role="dialog" aria-modal="true" aria-label="Sơ đồ chức năng Báo giá">
        <!-- UNIFIED TOP HEADER BAR -->
        <header class="qg-head">
          <div class="qg-head-left">
            <div class="qg-brand-block">
              <h2 class="qg-title">Sơ đồ chức năng Báo giá</h2>
              <span class="qg-count-pill">{{ GUIDE_GROUPS.length }} phân hệ • {{ ALL_STEPS.length }} mục</span>
            </div>

            <!-- VIEW MODE SEGMENTED SWITCH -->
            <div class="qg-view-switch" role="tablist" aria-label="Chế độ hiển thị">
              <button
                type="button"
                role="tab"
                class="qg-view-tab"
                :class="{ 'is-active': viewMode === 'diagram' }"
                :aria-selected="viewMode === 'diagram'"
                @click="switchViewMode('diagram')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="6" height="6" rx="1"></rect>
                  <rect x="2" y="3" width="5" height="4" rx="1"></rect>
                  <rect x="2" y="17" width="5" height="4" rx="1"></rect>
                  <rect x="17" y="3" width="5" height="4" rx="1"></rect>
                  <rect x="17" y="17" width="5" height="4" rx="1"></rect>
                  <path d="M7 5h2v4M7 19h2v-4M17 5h-2v4M17 19h-2v-4"></path>
                </svg>
                <span>Sơ đồ nhánh</span>
              </button>
              <button
                type="button"
                role="tab"
                class="qg-view-tab"
                :class="{ 'is-active': viewMode === 'list' }"
                :aria-selected="viewMode === 'list'"
                @click="switchViewMode('list')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                <span>Danh sách</span>
              </button>
            </div>
          </div>

          <!-- QUICK SEARCH -->
          <div class="qg-head-search">
            <svg class="qg-search-ico" xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              class="qg-search-input"
              placeholder="Tìm chức năng: sửa giá, công nợ, thanh toán, chênh lệch, OCR, PDF..."
            />
            <button
              v-if="searchQuery"
              type="button"
              class="qg-search-clear"
              aria-label="Xóa từ khóa"
              @click="searchQuery = ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- RIGHT ACTIONS -->
          <div class="qg-head-actions">
            <button
              type="button"
              class="qg-util-head-btn"
              @click="toggleExpandAll"
            >
              {{ areAllExpanded ? 'Thu gọn tất cả' : 'Bung tất cả' }}
            </button>

            <button type="button" class="qg-tour-btn" @click="startFullTour">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span class="qg-tour-lbl">Hướng dẫn tuần tự</span>
            </button>

            <button type="button" class="qg-close-btn" title="Đóng (Esc)" aria-label="Đóng" @click="closeMapModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <!-- ================== VIEW 1: MINDMAP / RADIAL BRANCH DIAGRAM ================== -->
        <div
          v-if="viewMode === 'diagram'"
          ref="canvasWrapRef"
          class="qg-diagram-canvas"
          :class="{ 'is-dragging': isInteractingCanvas }"
          @wheel.prevent="onCanvasWheel"
          @mousedown="onCanvasMouseDown"
          @click="onCanvasBackgroundClick"
          @touchstart="onCanvasTouchStart"
          @touchmove="onCanvasTouchMove"
          @touchend="onCanvasTouchEnd"
          @touchcancel="onCanvasTouchEnd"
        >
          <!-- TRANSFORMED STAGE CENTERED AT (50%, 50%) -->
          <div
            class="qg-canvas-stage"
            :class="{ 'no-anim': isInteractingCanvas }"
            :style="{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`
            }"
          >
            <!-- SVG CONNECTOR CURVES (ROOT -> BRANCH -> LEAF -> DETAIL CARD) -->
            <svg
              class="qg-edges-svg"
              viewBox="-1800 -1200 3600 2400"
              aria-hidden="true"
            >
              <g v-for="edge in diagramGraph.edges" :key="edge.id">
                <path
                  :d="edge.path"
                  class="qg-edge-path"
                  :class="[
                    `is-${edge.paletteKey}`,
                    {
                      'is-root': edge.isRootEdge,
                      'is-detail': edge.isDetailEdge,
                      'is-dimmed': edge.dimmed
                    }
                  ]"
                />
                <circle
                  v-if="edge.isDetailEdge && edge.startX !== undefined && edge.startY !== undefined"
                  :cx="edge.startX"
                  :cy="edge.startY"
                  r="3"
                  class="qg-edge-dot"
                  :class="`is-${edge.paletteKey}`"
                />
                <circle
                  :cx="edge.endX"
                  :cy="edge.endY"
                  :r="edge.isDetailEdge ? 3 : 2.4"
                  class="qg-edge-dot"
                  :class="[`is-${edge.paletteKey}`, { 'is-dimmed': edge.dimmed }]"
                />
              </g>
            </svg>

            <!-- CENTER ROOT HUB NODE -->
            <button
              type="button"
              class="qg-root-node"
              :style="{
                width: `${ROOT_W}px`,
                height: `${ROOT_H}px`,
                left: `${-ROOT_W / 2}px`,
                top: `${-ROOT_H / 2}px`
              }"
              :title="areAllExpanded ? 'Nhấn để thu gọn toàn bộ các nhánh' : 'Nhấn để bung toàn bộ các chức năng'"
              @click.stop="onDiagramRootClick"
            >
              <span class="qg-root-eyebrow">TRUNG TÂM NGHIỆP VỤ</span>
              <span class="qg-root-title">BÁO GIÁ</span>
              <span class="qg-root-meta">{{ areAllExpanded ? 'Thu gọn nhánh' : 'Bung toàn bộ sơ đồ' }}</span>
            </button>

            <!-- 6 MAIN BRANCH NODES -->
            <button
              v-for="br in diagramGraph.branches"
              :key="br.id"
              type="button"
              class="qg-branch-node"
              :class="[
                `is-${br.paletteKey}`,
                `is-wing-${br.wing}`,
                { 'is-expanded': br.expanded, 'is-dimmed': br.dimmed }
              ]"
              :style="{
                width: `${br.w}px`,
                height: `${br.h}px`,
                left: `${br.x - br.w / 2}px`,
                top: `${br.y - br.h / 2}px`
              }"
              @mouseenter="setHoverBranch(br)"
              @mouseleave="clearHoverNode"
              @focus="setHoverBranch(br)"
              @blur="clearHoverNode"
              @click.stop="onDiagramBranchClick(br.id)"
            >
              <span class="qg-br-code">{{ br.code }}</span>
              <span class="qg-br-label">{{ br.shortTitle }}</span>
              <span class="qg-br-toggle" :title="br.expanded ? 'Thu gọn nhánh' : 'Mở các chức năng con'">
                {{ br.expanded ? '−' : `+${br.itemCount}` }}
              </span>
            </button>

            <!-- CHILD LEAF NODES (CLICK BODY -> MO THE GIAI THICH CAP 3 | CLICK MUI TEN -> DI THANG TOI NUT) -->
            <div
              v-for="lf in diagramGraph.leaves"
              :key="lf.id"
              role="button"
              tabindex="0"
              class="qg-leaf-node"
              :class="[
                `is-${lf.paletteKey}`,
                `is-wing-${lf.wing}`,
                {
                  'is-dimmed': lf.dimmed,
                  'is-matched': lf.matched,
                  'is-selected': lf.selected
                }
              ]"
              :style="{
                width: `${lf.w}px`,
                height: `${lf.h}px`,
                left: `${lf.x - lf.w / 2}px`,
                top: `${lf.y - lf.h / 2}px`
              }"
              @mouseenter="setHoverLeaf(lf)"
              @mouseleave="clearHoverNode"
              @focus="setHoverLeaf(lf)"
              @blur="clearHoverNode"
              @click.stop="onDiagramLeafClick(lf.id)"
              @dblclick.stop="onDiagramLeafQuickJump(lf.id)"
              @keydown.enter.stop.prevent="onDiagramLeafClick(lf.id)"
            >
              <span class="qg-lf-code">{{ lf.code }}</span>
              <span class="qg-lf-label">{{ lf.shortLabel }}</span>
              <button
                type="button"
                class="qg-lf-jump-btn"
                title="Đi thẳng tới vị trí nút chức năng này"
                aria-label="Đi tới nút chức năng"
                @click.stop="onDiagramLeafQuickJump(lf.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            <!-- PHUONG AN A: THE GIAI THICH CAP 3 NOI DAY TRUC TIEP TU NHANH CON -->
            <aside
              v-if="diagramGraph.detailNode"
              ref="detailCardRef"
              class="qg-detail-card"
              :class="[
                `is-${diagramGraph.detailNode.paletteKey}`,
                `is-wing-${diagramGraph.detailNode.wing}`
              ]"
              :style="{
                width: `${diagramGraph.detailNode.w}px`,
                left: `${diagramGraph.detailNode.left}px`,
                top: `${diagramGraph.detailNode.y}px`
              }"
              @click.stop
            >
              <div class="qg-dc-head">
                <span class="qg-dc-code">{{ diagramGraph.detailNode.code }}</span>
                <span v-if="diagramGraph.detailNode.autoOpenTag" class="qg-dc-tag">
                  {{ diagramGraph.detailNode.autoOpenTag }}
                </span>
                <button
                  type="button"
                  class="qg-dc-close"
                  title="Đóng giải thích"
                  aria-label="Đóng giải thích"
                  @click.stop="selectedLeafId = null"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div class="qg-dc-body">
                <h4 class="qg-dc-title">{{ diagramGraph.detailNode.title }}</h4>
                <p class="qg-dc-desc">{{ diagramGraph.detailNode.detail }}</p>
              </div>

              <div class="qg-dc-foot">
                <button
                  type="button"
                  class="qg-dc-go-btn"
                  @click.stop="launchStepById(diagramGraph.detailNode.id)"
                >
                  <span>Đi tới nút chức năng</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </aside>
          </div>

          <!-- BOTTOM FLOATING HUD: INSPECTOR LEFT + ZOOM CONTROLS RIGHT -->
          <div class="qg-canvas-hud" @mousedown.stop @touchstart.stop>
            <div class="qg-hud-inspector">
              <template v-if="hoveredNodeInfo">
                <span class="qg-insp-code">{{ hoveredNodeInfo.code }}</span>
                <strong class="qg-insp-title">{{ hoveredNodeInfo.title }}</strong>
                <span v-if="hoveredNodeInfo.tag" class="qg-insp-tag">{{ hoveredNodeInfo.tag }}</span>
                <span class="qg-insp-sep">—</span>
                <span class="qg-insp-desc">{{ hoveredNodeInfo.desc }}</span>
                <span class="qg-insp-action">({{ hoveredNodeInfo.hint }})</span>
              </template>
              <template v-else>
                <span class="qg-insp-idle">
                  Nhấn nhánh chính để bung mục con • Nhấn mục con để mở <b>Thẻ giải thích</b> • Nhấn mũi tên trên mục con hoặc nút <b>Đi tới nút chức năng</b> để xem vị trí thực tế
                </span>
              </template>
            </div>

            <div class="qg-hud-zoom">
              <button type="button" class="qg-zoom-btn" title="Thu nhỏ" aria-label="Thu nhỏ" @click="stepCanvasZoom(-0.12)">
                −
              </button>
              <span class="qg-zoom-val">{{ Math.round(zoom * 100) }}%</span>
              <button type="button" class="qg-zoom-btn" title="Phóng to" aria-label="Phóng to" @click="stepCanvasZoom(0.12)">
                +
              </button>
              <button type="button" class="qg-zoom-fit" title="Căn vừa toàn bộ sơ đồ" @click="fitDiagramToViewport(true)">
                Căn giữa
              </button>
            </div>
          </div>
        </div>

        <!-- ================== VIEW 2: STRUCTURED LIST VIEW ================== -->
        <div v-else class="qg-body-scroll">
          <div class="qg-list-container">
            <div v-if="filteredListGroups.length === 0" class="qg-empty-state">
              Không tìm thấy chức năng phù hợp với từ khóa "{{ searchQuery }}".
            </div>

            <div class="qg-group-list">
              <section
                v-for="grp in filteredListGroups"
                :key="grp.id"
                class="qg-group-card"
                :class="{ 'is-expanded': isGroupExpanded(grp.id) }"
              >
                <button
                  type="button"
                  class="qg-group-header"
                  :aria-expanded="isGroupExpanded(grp.id)"
                  @click="toggleListGroup(grp.id)"
                >
                  <span class="qg-group-idx">{{ grp.code }}</span>

                  <span class="qg-group-ico" aria-hidden="true">
                    <svg v-if="grp.icon === 'catalog'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                      <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                      <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                      <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                    </svg>
                    <svg v-else-if="grp.icon === 'tabs'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                    </svg>
                    <svg v-else-if="grp.icon === 'table'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="3" y1="15" x2="21" y2="15"></line>
                      <line x1="9" y1="9" x2="9" y2="21"></line>
                    </svg>
                    <svg v-else-if="grp.icon === 'finance'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <svg v-else-if="grp.icon === 'export'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <svg v-else-if="grp.icon === 'debt'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                      <line x1="2" y1="10" x2="22" y2="10"></line>
                      <line x1="6" y1="15" x2="10" y2="15"></line>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="4" y1="21" x2="4" y2="14"></line>
                      <line x1="4" y1="10" x2="4" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12" y2="3"></line>
                      <line x1="20" y1="21" x2="20" y2="16"></line>
                      <line x1="20" y1="12" x2="20" y2="3"></line>
                      <line x1="1" y1="14" x2="7" y2="14"></line>
                      <line x1="9" y1="8" x2="15" y2="8"></line>
                      <line x1="17" y1="16" x2="23" y2="16"></line>
                    </svg>
                  </span>

                  <div class="qg-group-text">
                    <div class="qg-group-title">{{ grp.title }}</div>
                    <div class="qg-group-sub">{{ grp.subtitle }}</div>
                  </div>

                  <div class="qg-group-right">
                    <span class="qg-group-count">{{ grp.items.length }} mục</span>
                    <span class="qg-group-toggle-sign" aria-hidden="true">
                      {{ isGroupExpanded(grp.id) ? '−' : '+' }}
                    </span>
                  </div>
                </button>

                <div v-if="isGroupExpanded(grp.id)" class="qg-items-grid">
                  <button
                    v-for="item in grp.items"
                    :key="item.id"
                    type="button"
                    class="qg-item-btn"
                    @click="launchStepById(item.id)"
                  >
                    <div class="qg-item-top">
                      <span class="qg-item-code">{{ item.code }}</span>
                      <span v-if="item.autoOpenTag" class="qg-item-tag">{{ item.autoOpenTag }}</span>
                      <span class="qg-item-go">
                        <span>Chỉ dẫn</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </span>
                    </div>
                    <div class="qg-item-title">{{ item.title }}</div>
                    <div class="qg-item-desc">{{ item.detail }}</div>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- LOP SPOTLIGHT LAM MO XUNG QUANH & CHO PHEP CLICK TRUC TIEP VAO VUNG SANG -->
  <Teleport to="body">
    <div
      v-if="activeStep"
      class="quote-guide-spotlight-root"
      :class="themeMode === 'light' ? 'is-light' : 'is-dark'"
    >
      <svg
        class="guide-spotlight-svg"
        :width="viewport.w"
        :height="viewport.h"
        :viewBox="`0 0 ${viewport.w} ${viewport.h}`"
        aria-hidden="true"
      >
        <defs>
          <mask id="quote-guide-cutout-mask">
            <rect x="0" y="0" :width="viewport.w" :height="viewport.h" fill="white" />
            <rect
              v-if="targetFound && hole.w > 0 && hole.h > 0"
              :x="hole.x"
              :y="hole.y"
              :width="hole.w"
              :height="hole.h"
              :rx="hole.rx"
              :ry="hole.rx"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          :width="viewport.w"
          :height="viewport.h"
          class="guide-spotlight-backdrop-rect"
          mask="url(#quote-guide-cutout-mask)"
        />
      </svg>

      <template v-if="targetFound && hole.w > 0 && hole.h > 0">
        <div
          class="guide-hit-shield"
          :style="{ left: '0px', top: '0px', width: '100vw', height: `${hole.y}px` }"
          @click.stop.prevent="closeSpotlight(false)"
        ></div>
        <div
          class="guide-hit-shield"
          :style="{ left: '0px', top: `${hole.y + hole.h}px`, width: '100vw', bottom: '0px' }"
          @click.stop.prevent="closeSpotlight(false)"
        ></div>
        <div
          class="guide-hit-shield"
          :style="{ left: '0px', top: `${hole.y}px`, width: `${hole.x}px`, height: `${hole.h}px` }"
          @click.stop.prevent="closeSpotlight(false)"
        ></div>
        <div
          class="guide-hit-shield"
          :style="{ left: `${hole.x + hole.w}px`, top: `${hole.y}px`, right: '0px', height: `${hole.h}px` }"
          @click.stop.prevent="closeSpotlight(false)"
        ></div>

        <div
          class="guide-cutout-frame"
          :style="{
            left: `${hole.x}px`,
            top: `${hole.y}px`,
            width: `${hole.w}px`,
            height: `${hole.h}px`,
            borderRadius: `${hole.rx}px`
          }"
        ></div>
      </template>
      <div
        v-else
        class="guide-hit-shield"
        style="inset: 0;"
        @click.stop.prevent="closeSpotlight(false)"
      ></div>

      <aside
        ref="popoverRef"
        class="guide-spotlight-popover"
        :style="popoverStyle"
        role="dialog"
        aria-live="polite"
        @click.stop
      >
        <div class="gsp-top">
          <div class="gsp-breadcrumb">
            <span class="gsp-code">{{ activeStep.code }}</span>
            <span class="gsp-group-lbl">{{ activeStep.groupTitle }}</span>
          </div>
          <div class="gsp-top-right">
            <span class="gsp-counter">{{ activeStepIndex + 1 }} / {{ ALL_STEPS.length }}</span>
            <button
              type="button"
              class="gsp-close"
              title="Đóng hướng dẫn (Esc)"
              aria-label="Đóng hướng dẫn"
              @click="closeSpotlight(false)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <h3 class="gsp-title">{{ activeStep.title }}</h3>
        <p class="gsp-desc">{{ activeStep.detail }}</p>

        <div v-if="targetFound" class="gsp-direct-hint">
          <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
            <path d="m13 13 6 6"></path>
          </svg>
          <span>{{ activeStep.directHint || 'Nhấn trực tiếp vào vùng sáng để thao tác ngay (lớp hướng dẫn sẽ tự đóng).' }}</span>
        </div>

        <div class="gsp-actions">
          <button type="button" class="gsp-btn is-ghost" @click="returnToMap">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="6" height="6" rx="1"></rect>
              <rect x="2" y="3" width="5" height="4" rx="1"></rect>
              <rect x="17" y="17" width="5" height="4" rx="1"></rect>
              <path d="M7 5h2v4M17 19h-2v-4"></path>
            </svg>
            <span>Sơ đồ</span>
          </button>

          <div class="gsp-nav-cluster">
            <button
              type="button"
              class="gsp-btn"
              :disabled="activeStepIndex <= 0 || isPreparingStep"
              @click="goPrevStep"
            >
              Trước
            </button>
            <button
              type="button"
              class="gsp-btn is-primary"
              :disabled="isPreparingStep"
              @click="goNextStep"
            >
              {{ activeStepIndex < ALL_STEPS.length - 1 ? 'Tiếp theo' : 'Hoàn tất' }}
            </button>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
/* ================== THEME TOKENS (MINIMALIST DARK & LIGHT) ================== */
.quote-guide-modal-overlay,
.quote-guide-spotlight-root {
  --qg-bg: #0f172a;
  --qg-canvas-bg: #0b1120;
  --qg-grid-dot: rgba(148, 163, 184, 0.14);
  --qg-bg-sub: #111827;
  --qg-bg-elev: #1e293b;
  --qg-bg-hover: #172033;
  --qg-leaf-bg: #0f172a;
  --qg-border: #1e293b;
  --qg-border-strong: #334155;
  --qg-text: #f8fafc;
  --qg-text-sec: #cbd5e1;
  --qg-text-muted: #94a3b8;
  --qg-accent: #38bdf8;
  --qg-accent-soft: rgba(56, 189, 248, 0.1);
  --qg-accent-border: rgba(56, 189, 248, 0.45);
  --qg-primary-bg: #0284c7;
  --qg-primary-hover: #0369a1;
  --qg-primary-fg: #ffffff;
  --qg-cutout-dim: rgba(2, 6, 23, 0.72);
  --qg-shadow: 0 14px 36px rgba(2, 6, 23, 0.55);

  /* Minimalist Branch Palettes (Dark Mode) */
  --pal-sky-line: #38bdf8;
  --pal-sky-bg: rgba(56, 189, 248, 0.11);
  --pal-sky-hover: rgba(56, 189, 248, 0.18);
  --pal-sky-text: #7dd3fc;

  --pal-indigo-line: #818cf8;
  --pal-indigo-bg: rgba(129, 140, 248, 0.11);
  --pal-indigo-hover: rgba(129, 140, 248, 0.18);
  --pal-indigo-text: #a5b4fc;

  --pal-violet-line: #c084fc;
  --pal-violet-bg: rgba(192, 132, 252, 0.11);
  --pal-violet-hover: rgba(192, 132, 252, 0.18);
  --pal-violet-text: #d8b4fe;

  --pal-teal-line: #2dd4bf;
  --pal-teal-bg: rgba(45, 212, 191, 0.11);
  --pal-teal-hover: rgba(45, 212, 191, 0.18);
  --pal-teal-text: #5eead4;

  --pal-amber-line: #fbbf24;
  --pal-amber-bg: rgba(251, 191, 36, 0.11);
  --pal-amber-hover: rgba(251, 191, 36, 0.18);
  --pal-amber-text: #fcd34d;

  --pal-emerald-line: #34d399;
  --pal-emerald-bg: rgba(52, 211, 153, 0.11);
  --pal-emerald-hover: rgba(52, 211, 153, 0.18);
  --pal-emerald-text: #6ee7b7;

  --pal-rose-line: #fb7185;
  --pal-rose-bg: rgba(251, 113, 133, 0.11);
  --pal-rose-hover: rgba(251, 113, 133, 0.18);
  --pal-rose-text: #fda4af;

  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

.quote-guide-modal-overlay.is-light,
.quote-guide-spotlight-root.is-light {
  --qg-bg: #ffffff;
  --qg-canvas-bg: #f8fafc;
  --qg-grid-dot: rgba(100, 116, 139, 0.2);
  --qg-bg-sub: #f8fafc;
  --qg-bg-elev: #f1f5f9;
  --qg-bg-hover: #f1f5f9;
  --qg-leaf-bg: #ffffff;
  --qg-border: #e2e8f0;
  --qg-border-strong: #cbd5e1;
  --qg-text: #0f172a;
  --qg-text-sec: #334155;
  --qg-text-muted: #64748b;
  --qg-accent: #2563eb;
  --qg-accent-soft: #eff6ff;
  --qg-accent-border: #93c5fd;
  --qg-primary-bg: #2563eb;
  --qg-primary-hover: #1d4ed8;
  --qg-primary-fg: #ffffff;
  --qg-cutout-dim: rgba(15, 23, 42, 0.56);
  --qg-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);

  /* Minimalist Branch Palettes (Light Mode) */
  --pal-sky-line: #0284c7;
  --pal-sky-bg: #f0f9ff;
  --pal-sky-hover: #e0f2fe;
  --pal-sky-text: #0369a1;

  --pal-indigo-line: #4f46e5;
  --pal-indigo-bg: #eef2ff;
  --pal-indigo-hover: #e0e7ff;
  --pal-indigo-text: #4338ca;

  --pal-violet-line: #7c3aed;
  --pal-violet-bg: #f5f3ff;
  --pal-violet-hover: #ede9fe;
  --pal-violet-text: #6d28d9;

  --pal-teal-line: #0d9488;
  --pal-teal-bg: #f0fdfa;
  --pal-teal-hover: #ccfbf1;
  --pal-teal-text: #0f766e;

  --pal-amber-line: #d97706;
  --pal-amber-bg: #fffbeb;
  --pal-amber-hover: #fef3c7;
  --pal-amber-text: #b45309;

  --pal-emerald-line: #059669;
  --pal-emerald-bg: #ecfdf5;
  --pal-emerald-hover: #d1fae5;
  --pal-emerald-text: #047857;

  --pal-rose-line: #e11d48;
  --pal-rose-bg: #fff1f2;
  --pal-rose-hover: #ffe4e6;
  --pal-rose-text: #be123c;
}

.quote-guide-modal-overlay *,
.quote-guide-spotlight-root * {
  box-sizing: border-box;
}

/* ================== FULLSCREEN 100% MODAL SHELL ================== */
.quote-guide-modal-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  z-index: 150000;
  background: var(--qg-bg);
  display: flex;
  padding: 0;
}

.qg-modal-card {
  width: 100%;
  height: 100%;
  background: var(--qg-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--qg-text);
}

/* ================== UNIFIED TOP HEADER ================== */
.qg-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--qg-border);
  background: var(--qg-bg);
  flex-shrink: 0;
  z-index: 10;
}

.qg-head-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.qg-brand-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qg-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--qg-text);
  white-space: nowrap;
}

.qg-count-pill {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: var(--qg-text-muted);
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid var(--qg-border);
  background: var(--qg-bg-sub);
  white-space: nowrap;
}

.qg-view-switch {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 7px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg-sub);
  gap: 2px;
}

.qg-view-tab {
  width: auto !important;
  margin: 0 !important;
  height: 26px;
  padding: 0 10px !important;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--qg-text-muted);
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.qg-view-tab:hover {
  color: var(--qg-text);
}

.qg-view-tab.is-active {
  background: var(--qg-bg);
  color: var(--qg-accent);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.qg-head-search {
  position: relative;
  flex: 1 1 260px;
  max-width: 430px;
  display: flex;
  align-items: center;
}

.qg-search-ico {
  position: absolute;
  left: 10px;
  color: var(--qg-text-muted);
  pointer-events: none;
}

.qg-search-input {
  width: 100% !important;
  height: 30px !important;
  margin: 0 !important;
  padding: 0 28px 0 30px !important;
  border-radius: 6px !important;
  border: 1px solid var(--qg-border-strong) !important;
  background: var(--qg-bg-sub) !important;
  color: var(--qg-text) !important;
  font-size: 12px !important;
  outline: none !important;
  box-shadow: none !important;
  transition: border-color 0.15s ease;
}

.qg-search-input::placeholder {
  color: var(--qg-text-muted);
}

.qg-search-input:focus {
  border-color: var(--qg-accent) !important;
}

.qg-search-clear {
  position: absolute;
  right: 5px;
  width: 20px !important;
  min-width: 20px !important;
  height: 20px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--qg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.qg-search-clear:hover {
  color: var(--qg-text);
  background: var(--qg-bg-elev);
}

.qg-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.qg-util-head-btn {
  width: auto !important;
  margin: 0 !important;
  height: 30px;
  padding: 0 10px !important;
  border-radius: 6px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg-sub);
  color: var(--qg-text-sec);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

.qg-util-head-btn:hover {
  border-color: var(--qg-accent-border);
  color: var(--qg-accent);
  background: var(--qg-accent-soft);
}

.qg-tour-btn {
  width: auto !important;
  margin: 0 !important;
  height: 30px;
  padding: 0 11px !important;
  border-radius: 6px;
  border: 1px solid transparent;
  background: var(--qg-primary-bg);
  color: var(--qg-primary-fg);
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease;
}

.qg-tour-btn:hover {
  background: var(--qg-primary-hover);
}

.qg-close-btn {
  width: 30px !important;
  min-width: 30px !important;
  height: 30px !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 6px;
  border: 1px solid var(--qg-border-strong);
  background: transparent;
  color: var(--qg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.qg-close-btn:hover {
  color: var(--qg-text);
  background: var(--qg-bg-elev);
}

/* ================== MINDMAP DIAGRAM CANVAS ================== */
.qg-diagram-canvas {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--qg-canvas-bg);
  background-image: radial-gradient(var(--qg-grid-dot) 1px, transparent 1px);
  background-size: 22px 22px;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.qg-diagram-canvas.is-dragging {
  cursor: grabbing;
}

.qg-canvas-stage {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform-origin: 0 0;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.qg-canvas-stage.no-anim {
  transition: none !important;
}

/* SVG Connector Lines */
.qg-edges-svg {
  position: absolute;
  left: -1800px;
  top: -1200px;
  width: 3600px;
  height: 2400px;
  overflow: visible;
  pointer-events: none;
}

.qg-edge-path {
  fill: none;
  stroke-width: 1.75;
  stroke-linecap: round;
  opacity: 0.78;
  transition: opacity 0.18s ease, stroke-width 0.18s ease;
}

.qg-edge-path.is-root {
  stroke-width: 2.1;
  opacity: 0.88;
}

.qg-edge-path.is-detail {
  stroke-width: 2.2;
  opacity: 1;
}

.qg-edge-path.is-sky { stroke: var(--pal-sky-line); }
.qg-edge-path.is-indigo { stroke: var(--pal-indigo-line); }
.qg-edge-path.is-violet { stroke: var(--pal-violet-line); }
.qg-edge-path.is-teal { stroke: var(--pal-teal-line); }
.qg-edge-path.is-amber { stroke: var(--pal-amber-line); }
.qg-edge-path.is-emerald { stroke: var(--pal-emerald-line); }
.qg-edge-path.is-rose { stroke: var(--pal-rose-line); }

.qg-edge-dot.is-sky { fill: var(--pal-sky-line); }
.qg-edge-dot.is-indigo { fill: var(--pal-indigo-line); }
.qg-edge-dot.is-violet { fill: var(--pal-violet-line); }
.qg-edge-dot.is-teal { fill: var(--pal-teal-line); }
.qg-edge-dot.is-amber { fill: var(--pal-amber-line); }
.qg-edge-dot.is-emerald { fill: var(--pal-emerald-line); }
.qg-edge-dot.is-rose { fill: var(--pal-rose-line); }

.qg-edge-path.is-dimmed,
.qg-edge-dot.is-dimmed {
  opacity: 0.14 !important;
}

/* Center Root Hub Node */
.qg-root-node {
  position: absolute;
  margin: 0 !important;
  padding: 8px 14px !important;
  border-radius: 12px;
  border: 2px solid var(--qg-accent);
  background: var(--qg-bg);
  color: var(--qg-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  z-index: 4;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
}

.qg-root-node:hover {
  background: var(--qg-bg-hover);
  transform: scale(1.02);
}

.qg-root-eyebrow {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--qg-accent);
}

.qg-root-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--qg-text);
  line-height: 1.15;
}

.qg-root-meta {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--qg-text-muted);
}

/* Palette Variable Binding on Nodes & Detail Card */
.qg-branch-node.is-sky,
.qg-leaf-node.is-sky,
.qg-detail-card.is-sky {
  --br-line: var(--pal-sky-line);
  --br-bg: var(--pal-sky-bg);
  --br-hover: var(--pal-sky-hover);
  --br-text: var(--pal-sky-text);
}

.qg-branch-node.is-indigo,
.qg-leaf-node.is-indigo,
.qg-detail-card.is-indigo {
  --br-line: var(--pal-indigo-line);
  --br-bg: var(--pal-indigo-bg);
  --br-hover: var(--pal-indigo-hover);
  --br-text: var(--pal-indigo-text);
}

.qg-branch-node.is-violet,
.qg-leaf-node.is-violet,
.qg-detail-card.is-violet {
  --br-line: var(--pal-violet-line);
  --br-bg: var(--pal-violet-bg);
  --br-hover: var(--pal-violet-hover);
  --br-text: var(--pal-violet-text);
}

.qg-branch-node.is-teal,
.qg-leaf-node.is-teal,
.qg-detail-card.is-teal {
  --br-line: var(--pal-teal-line);
  --br-bg: var(--pal-teal-bg);
  --br-hover: var(--pal-teal-hover);
  --br-text: var(--pal-teal-text);
}

.qg-branch-node.is-amber,
.qg-leaf-node.is-amber,
.qg-detail-card.is-amber {
  --br-line: var(--pal-amber-line);
  --br-bg: var(--pal-amber-bg);
  --br-hover: var(--pal-amber-hover);
  --br-text: var(--pal-amber-text);
}

.qg-branch-node.is-emerald,
.qg-leaf-node.is-emerald,
.qg-detail-card.is-emerald {
  --br-line: var(--pal-emerald-line);
  --br-bg: var(--pal-emerald-bg);
  --br-hover: var(--pal-emerald-hover);
  --br-text: var(--pal-emerald-text);
}

.qg-branch-node.is-rose,
.qg-leaf-node.is-rose,
.qg-detail-card.is-rose {
  --br-line: var(--pal-rose-line);
  --br-bg: var(--pal-rose-bg);
  --br-hover: var(--pal-rose-hover);
  --br-text: var(--pal-rose-text);
}

/* 6 Main Branch Nodes */
.qg-branch-node {
  position: absolute;
  margin: 0 !important;
  padding: 0 12px !important;
  border-radius: 10px;
  border: 1.6px solid var(--br-line);
  background: var(--br-bg);
  color: var(--qg-text);
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  cursor: pointer;
  z-index: 3;
  backdrop-filter: blur(4px);
  transition:
    top 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.15s ease,
    opacity 0.18s ease,
    transform 0.15s ease;
}

.qg-branch-node:hover {
  background: var(--br-hover);
  transform: translateY(-1px);
}

.qg-branch-node.is-dimmed,
.qg-leaf-node.is-dimmed {
  opacity: 0.2;
}

.qg-br-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--br-text);
  padding: 2px 6px;
  border-radius: 5px;
  background: var(--qg-bg);
  border: 1px solid var(--br-line);
  flex-shrink: 0;
}

.qg-br-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--qg-text);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qg-br-toggle {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--br-text);
  min-width: 26px;
  height: 22px;
  padding: 0 5px;
  border-radius: 5px;
  border: 1px solid var(--br-line);
  background: var(--qg-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Child Leaf Nodes */
.qg-leaf-node {
  position: absolute;
  margin: 0 !important;
  padding: 0 6px 0 11px !important;
  border-radius: 8px;
  border: 1.35px solid var(--br-line);
  background: var(--qg-leaf-bg);
  color: var(--qg-text);
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
  cursor: pointer;
  z-index: 3;
  outline: none;
  transition:
    background-color 0.14s ease,
    border-width 0.12s ease,
    box-shadow 0.14s ease,
    opacity 0.18s ease;
}

.qg-leaf-node:hover,
.qg-leaf-node.is-matched {
  background: var(--br-bg);
}

.qg-leaf-node.is-selected {
  background: var(--br-hover);
  border-width: 1.8px;
  box-shadow: 0 0 0 3px var(--br-bg);
  z-index: 5;
}

.qg-lf-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--br-text);
  flex-shrink: 0;
}

.qg-lf-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--qg-text);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qg-lf-jump-btn {
  width: 26px !important;
  min-width: 26px !important;
  height: 26px !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 5px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--br-text);
  opacity: 0.65;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.14s ease, background-color 0.14s ease, border-color 0.14s ease;
}

.qg-leaf-node:hover .qg-lf-jump-btn,
.qg-leaf-node.is-selected .qg-lf-jump-btn {
  opacity: 1;
}

.qg-lf-jump-btn:hover {
  background: var(--qg-bg);
  border-color: var(--br-line);
}

/* 3rd-Level Connected Explanation Card (Phuong an A) */
.qg-detail-card {
  position: absolute;
  transform: translateY(-50%);
  border-radius: 10px;
  border: 1.7px solid var(--br-line);
  background: var(--qg-bg);
  color: var(--qg-text);
  box-shadow: var(--qg-shadow);
  z-index: 6;
  overflow: hidden;
  cursor: default;
  user-select: text;
  -webkit-user-select: text;
}

.qg-dc-head {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px 8px 12px;
  background: var(--br-bg);
  border-bottom: 1px solid var(--qg-border);
}

.qg-dc-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--br-text);
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--qg-bg);
  border: 1px solid var(--br-line);
  flex-shrink: 0;
}

.qg-dc-tag {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--qg-text-sec);
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--qg-bg);
  border: 1px solid var(--qg-border-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qg-dc-close {
  margin: 0 0 0 auto !important;
  width: 22px !important;
  min-width: 22px !important;
  height: 22px !important;
  padding: 0 !important;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--qg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.qg-dc-close:hover {
  color: var(--qg-text);
  background: var(--qg-bg);
}

.qg-dc-body {
  padding: 11px 13px 10px;
}

.qg-dc-title {
  margin: 0 0 6px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--qg-text);
  line-height: 1.35;
}

.qg-dc-desc {
  margin: 0;
  font-size: 12px;
  color: var(--qg-text-sec);
  line-height: 1.55;
}

.qg-dc-foot {
  padding: 9px 13px 11px;
  border-top: 1px solid var(--qg-border);
  background: var(--qg-bg-sub);
  display: flex;
  justify-content: flex-end;
}

.qg-dc-go-btn {
  width: 100% !important;
  margin: 0 !important;
  height: 31px !important;
  padding: 0 12px !important;
  border-radius: 6px;
  border: 1px solid var(--br-line);
  background: var(--br-bg);
  color: var(--qg-text);
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.qg-dc-go-btn:hover {
  background: var(--br-hover);
}

.qg-dc-go-btn svg {
  color: var(--br-text);
  transition: transform 0.15s ease;
}

.qg-dc-go-btn:hover svg {
  transform: translateX(2px);
}

/* Bottom Floating HUD Bar on Diagram */
.qg-canvas-hud {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 8;
  pointer-events: none;
}

.qg-hud-inspector {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 7px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg);
  color: var(--qg-text-sec);
  font-size: 12px;
  min-width: 0;
  max-width: min(780px, calc(100% - 210px));
  overflow: hidden;
}

.qg-insp-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--qg-accent);
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--qg-accent-soft);
  border: 1px solid var(--qg-accent-border);
  flex-shrink: 0;
}

.qg-insp-title {
  font-weight: 700;
  color: var(--qg-text);
  white-space: nowrap;
  flex-shrink: 0;
}

.qg-insp-tag {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--qg-text-muted);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg-sub);
  white-space: nowrap;
  flex-shrink: 0;
}

.qg-insp-sep {
  color: var(--qg-text-muted);
  flex-shrink: 0;
}

.qg-insp-desc {
  color: var(--qg-text-sec);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.qg-insp-action {
  color: var(--qg-accent);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.qg-insp-idle {
  font-size: 11.5px;
  color: var(--qg-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qg-insp-idle b {
  color: var(--qg-text);
}

.qg-hud-zoom {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 7px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg);
  flex-shrink: 0;
}

.qg-zoom-btn {
  width: 26px !important;
  min-width: 26px !important;
  height: 26px !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 5px;
  border: 1px solid transparent;
  background: var(--qg-bg-sub);
  color: var(--qg-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.qg-zoom-btn:hover {
  border-color: var(--qg-border-strong);
  background: var(--qg-bg-elev);
}

.qg-zoom-val {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  color: var(--qg-text-sec);
  min-width: 42px;
  text-align: center;
}

.qg-zoom-fit {
  width: auto !important;
  margin: 0 !important;
  height: 26px !important;
  padding: 0 9px !important;
  border-radius: 5px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg-sub);
  color: var(--qg-text-sec);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.qg-zoom-fit:hover {
  border-color: var(--qg-accent-border);
  color: var(--qg-accent);
}

/* ================== LIST VIEW BODY ================== */
.qg-body-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 32px;
  background: var(--qg-canvas-bg);
}

.qg-list-container {
  max-width: 1080px;
  margin: 0 auto;
}

.qg-empty-state {
  padding: 36px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--qg-text-muted);
  border: 1px dashed var(--qg-border-strong);
  border-radius: 8px;
  background: var(--qg-bg);
}

.qg-group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qg-group-card {
  border: 1px solid var(--qg-border-strong);
  border-radius: 8px;
  background: var(--qg-bg);
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.qg-group-card.is-expanded {
  border-color: var(--qg-accent-border);
}

.qg-group-header {
  width: 100% !important;
  margin: 0 !important;
  padding: 12px 14px !important;
  border: none;
  background: var(--qg-bg-sub);
  color: var(--qg-text);
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.qg-group-header:hover {
  background: var(--qg-bg-hover);
}

.qg-group-card.is-expanded .qg-group-header {
  border-bottom: 1px solid var(--qg-border);
}

.qg-group-idx {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--qg-accent);
  padding: 3px 7px;
  border-radius: 5px;
  border: 1px solid var(--qg-accent-border);
  background: var(--qg-accent-soft);
  flex-shrink: 0;
}

.qg-group-ico {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg);
  color: var(--qg-text-sec);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qg-group-text {
  flex: 1;
  min-width: 0;
}

.qg-group-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--qg-text);
  line-height: 1.3;
}

.qg-group-sub {
  font-size: 12px;
  color: var(--qg-text-muted);
  margin-top: 2px;
  line-height: 1.4;
}

.qg-group-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.qg-group-count {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: var(--qg-text-muted);
  white-space: nowrap;
}

.qg-group-toggle-sign {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg);
  color: var(--qg-text-sec);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.qg-items-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 10px;
  background: var(--qg-bg);
}

.qg-item-btn {
  width: 100% !important;
  margin: 0 !important;
  padding: 10px 12px !important;
  border-radius: 6px;
  border: 1px solid var(--qg-border);
  background: var(--qg-bg-sub);
  color: var(--qg-text);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.qg-item-btn:hover {
  border-color: var(--qg-accent);
  background: var(--qg-bg-hover);
}

.qg-item-top {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.qg-item-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--qg-accent);
}

.qg-item-tag {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--qg-text-muted);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg);
}

.qg-item-go {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  color: var(--qg-text-muted);
  transition: color 0.15s ease, transform 0.15s ease;
}

.qg-item-btn:hover .qg-item-go {
  color: var(--qg-accent);
  transform: translateX(2px);
}

.qg-item-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--qg-text);
  line-height: 1.35;
}

.qg-item-desc {
  font-size: 11.5px;
  color: var(--qg-text-muted);
  line-height: 1.45;
}

/* ================== SPOTLIGHT CUTOUT & POPOVER ================== */
.quote-guide-spotlight-root {
  position: fixed;
  inset: 0;
  z-index: 150100;
  pointer-events: none;
}

.guide-spotlight-svg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 150100;
  pointer-events: none;
}

.guide-spotlight-backdrop-rect {
  fill: var(--qg-cutout-dim);
}

.guide-hit-shield {
  position: fixed;
  z-index: 150101;
  background: transparent;
  pointer-events: auto;
  cursor: default;
}

.guide-cutout-frame {
  position: fixed;
  z-index: 150102;
  pointer-events: none;
  border: 1.5px solid var(--qg-accent);
  box-shadow: 0 0 0 3px var(--qg-accent-soft);
  transition:
    left 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    top 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.guide-spotlight-popover {
  position: fixed;
  z-index: 150106;
  pointer-events: auto;
  background: var(--qg-bg);
  border: 1px solid var(--qg-border-strong);
  border-radius: 10px;
  box-shadow: var(--qg-shadow);
  padding: 14px 16px;
  color: var(--qg-text);
  transition:
    left 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    top 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.gsp-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.gsp-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.gsp-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--qg-accent);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--qg-accent-border);
  background: var(--qg-accent-soft);
  flex-shrink: 0;
}

.gsp-group-lbl {
  font-size: 11px;
  font-weight: 600;
  color: var(--qg-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gsp-top-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.gsp-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: var(--qg-text-muted);
}

.gsp-close {
  width: 24px !important;
  min-width: 24px !important;
  height: 24px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--qg-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.gsp-close:hover {
  color: var(--qg-text);
  background: var(--qg-bg-elev);
}

.gsp-title {
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: 700;
  color: var(--qg-text);
  line-height: 1.35;
}

.gsp-desc {
  margin: 0 0 10px;
  font-size: 12.5px;
  color: var(--qg-text-sec);
  line-height: 1.5;
}

.gsp-direct-hint {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 7px 9px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg-sub);
  font-size: 11.5px;
  color: var(--qg-text-muted);
  line-height: 1.4;
}

.gsp-direct-hint svg {
  color: var(--qg-accent);
  flex-shrink: 0;
  margin-top: 1px;
}

.gsp-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--qg-border);
}

.gsp-nav-cluster {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gsp-btn {
  width: auto !important;
  margin: 0 !important;
  height: 29px;
  padding: 0 11px !important;
  border-radius: 6px;
  border: 1px solid var(--qg-border-strong);
  background: var(--qg-bg-sub);
  color: var(--qg-text-sec);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.gsp-btn:hover:not(:disabled) {
  border-color: var(--qg-accent-border);
  color: var(--qg-text);
  background: var(--qg-bg-hover);
}

.gsp-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.gsp-btn.is-ghost {
  background: transparent;
}

.gsp-btn.is-primary {
  border-color: transparent;
  background: var(--qg-primary-bg);
  color: var(--qg-primary-fg);
}

.gsp-btn.is-primary:hover:not(:disabled) {
  background: var(--qg-primary-hover);
  color: var(--qg-primary-fg);
}

/* ================== TABLET & MOBILE RESPONSIVE ================== */
@media (max-width: 960px) {
  .qg-count-pill {
    display: none;
  }

  .qg-head {
    flex-wrap: wrap;
    padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 10px;
    gap: 8px;
  }

  .qg-head-left {
    flex: 1 1 auto;
    gap: 10px;
  }

  .qg-head-search {
    order: 3;
    flex: 1 1 100%;
    max-width: 100%;
  }

  .qg-hud-inspector {
    display: none;
  }

  .qg-canvas-hud {
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .qg-title {
    font-size: 14px;
  }

  .qg-util-head-btn {
    padding: 0 8px !important;
    font-size: 11px;
  }

  .qg-tour-lbl {
    display: none;
  }

  .qg-tour-btn {
    padding: 0 9px !important;
  }

  .qg-tour-btn::after {
    content: 'Tuần tự';
    font-size: 11px;
  }

  .qg-body-scroll {
    padding: 12px 12px 24px;
  }

  .qg-group-ico {
    display: none;
  }

  .qg-items-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .qg-canvas-stage,
  .qg-branch-node,
  .qg-leaf-node,
  .guide-cutout-frame,
  .guide-spotlight-popover {
    transition: none !important;
  }
}
</style>
