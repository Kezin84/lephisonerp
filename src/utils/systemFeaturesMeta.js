/**
 * System Core Features Architecture Metadata, Tree & Business Flow Layouts,
 * Edge Geometry & Standalone Vector SVG / High-DPI 2x PNG Exporter
 * for DatabaseViewer.vue ("Chức năng chính" View Mode).
 */

export const FEATURE_GROUPS = {
  overview: {
    id: 'overview',
    label: 'Tổng quan & Báo cáo',
    shortLabel: 'Tổng quan',
    color: '#2563eb',
    order: 0
  },
  sales: {
    id: 'sales',
    label: 'Báo giá & Đơn hàng',
    shortLabel: 'Báo giá & ĐH',
    color: '#0284c7',
    order: 1
  },
  catalog: {
    id: 'catalog',
    label: 'Khách hàng, SP & License',
    shortLabel: 'KH, SP & Lic',
    color: '#059669',
    order: 2
  },
  docs: {
    id: 'docs',
    label: 'Tài liệu & Biểu mẫu',
    shortLabel: 'Tài liệu',
    color: '#7c3aed',
    order: 3
  },
  system: {
    id: 'system',
    label: 'Hệ thống & Tự động hóa',
    shortLabel: 'Hệ thống',
    color: '#d97706',
    order: 4
  }
}

export const SYSTEM_ROOT_NODE = {
  id: 'sys_root',
  kind: 'root',
  name: 'HỆ THỐNG QUẢN LÝ NTS',
  subtitle: 'SONAI SI • Vue 3 + Firebase + Worker 24/7',
  desc: 'Nền tảng quản trị kinh doanh hợp nhất: Báo giá, Hợp đồng PO, Công nợ, Bản quyền License, Kho tài liệu & Zalo Bot tự động.',
  highlights: [
    '5 phân hệ nghiệp vụ • 14 chức năng chính',
    'Đồng bộ dữ liệu thời gian thực (Firebase RTDB)',
    'Hỗ trợ PC & Mobile • Dark Navy / Light Blue'
  ]
}

export const SYSTEM_FEATURES = [
  // ── 1. Tổng quan & Báo cáo ──
  {
    id: 'feat_dashboard',
    group: 'overview',
    name: 'Báo cáo Tổng quát',
    route: '/dashboardfirebase',
    stageCol: 3,
    summary: 'Trung tâm theo dõi toàn cảnh công việc, báo giá và tình trạng bản quyền theo Ngày / Tuần / Tháng.',
    bullets: [
      'Thống kê tổng quan mặc định theo Tuần (Ngày / Tuần / Tháng)',
      'Theo dõi tiến độ Công việc & Báo giá đã chốt / đang xử lý',
      'Cảnh báo License gia hạn & License hết hiệu lực chưa xử lý',
      'Điều hướng sâu sang từng phân hệ với đúng bộ lọc thời gian'
    ],
    tables: ['REPORT', 'hop_dong_tong_quat', 'license_old_data', 'khach_hang']
  },
  {
    id: 'feat_report',
    group: 'overview',
    name: 'Báo cáo Công việc',
    route: '/report-firebase',
    stageCol: 2,
    summary: 'Quản lý nhật ký công việc hằng ngày, trạng thái xử lý và nhắc việc chủ động.',
    bullets: [
      'Ghi nhận đầu việc, phân loại nhóm & theo dõi trạng thái hoàn thành',
      'Hẹn giờ nhắc việc (Reminder) & gắn thẻ theo dõi ưu tiên',
      'Liên kết trực tiếp khách hàng & tệp hồ sơ công việc',
      'Sao chép nhanh mẫu báo cáo công việc gửi quản lý / Zalo'
    ],
    tables: ['REPORT', 'khach_hang', 'quan_ly_file']
  },
  {
    id: 'feat_sale_report',
    group: 'overview',
    name: 'Sale Report & Công nợ',
    route: '/sale-report-firebase',
    stageCol: 2,
    summary: 'Quản lý đơn hàng PO chính thức, lợi nhuận, hoa hồng và lộ trình thu hồi công nợ.',
    bullets: [
      'Quản lý PO chính thức & bản nháp, tự tính doanh thu / lợi nhuận',
      'Lập kế hoạch thanh toán nhiều đợt & ghi nhận lịch sử thu nợ',
      'Theo dõi hoa hồng khách hàng, hoa hồng cá nhân & chi phí đơn',
      'Liên kết & đồng bộ tự động License bản quyền gắn theo từng PO'
    ],
    tables: ['sale_report', 'sale_report_craft', 'lich_su_thanh_toan', 'khach_hang', 'license_old_data']
  },

  // ── 2. Báo giá & Đơn hàng ──
  {
    id: 'feat_baogia',
    group: 'sales',
    name: 'Tạo Báo giá',
    route: '/baogiafirebase',
    stageCol: 1,
    summary: 'Công cụ lập báo giá chuyên nghiệp đa phiên bản, quy đổi ngoại tệ và xuất biểu mẫu tự động.',
    bullets: [
      'Soạn báo giá nhiều phiên bản (V1, V2...), tính VAT & chiết khấu',
      'Quy đổi tỉ giá USD / VND, quản lý giá vốn & mức % Off theo hãng',
      'Xuất file Excel / PDF chuẩn theo Mẫu In & điều khoản tùy chọn',
      'Chốt báo giá sang đơn hàng PO / Sale Report chỉ bằng 1 click'
    ],
    tables: ['hop_dong_tong_quat', 'hop_dong_chi_tiet', 'hop_dong_version', 'khach_hang', 'hang_hoa', 'dieu_khoan', 'mau_in_thiet_lap']
  },
  {
    id: 'feat_ql_baogia',
    group: 'sales',
    name: 'Quản lý Báo giá',
    route: '/quanlybaogiafirebase',
    stageCol: 1,
    summary: 'Theo dõi tập trung toàn bộ lịch sử báo giá, trạng thái duyệt và thời hạn hợp đồng.',
    bullets: [
      'Tra cứu & lọc báo giá theo trạng thái Tạm / Chính thức / Đã chốt',
      'Gom nhóm các phiên bản sửa đổi theo mã hợp đồng gốc',
      'Tải lại file báo giá gửi khách hàng & file giá vốn nội bộ',
      'Chuyển tiếp nhanh báo giá đã chốt sang theo dõi Sale Report'
    ],
    tables: ['hop_dong_tong_quat', 'hop_dong_chi_tiet', 'hop_dong_version', 'khach_hang']
  },
  {
    id: 'feat_pipeline',
    group: 'sales',
    name: 'Pipeline Dự án',
    route: '/pipeline-firebase',
    stageCol: 1,
    summary: 'Quản trị cơ hội kinh doanh theo quy trình bán hàng nhiều bước dạng bảng Kanban.',
    bullets: [
      'Tổ chức cơ hội & dự án khách hàng trên bảng Kanban kéo thả',
      'Tùy biến linh hoạt nhiều quy trình Workflow & bước trạng thái',
      'Gắn trực tiếp khách hàng, mã báo giá & hạn xử lý từng cơ hội',
      'Theo dõi tiến độ Deal Registration bảo vệ dự án với hãng'
    ],
    tables: ['pipeline', 'pipeline_projects', 'pipeline_workflow', 'pipeline_workflow_meta', 'deal_reg', 'khach_hang']
  },

  // ── 3. Khách hàng, SP & License ──
  {
    id: 'feat_customer',
    group: 'catalog',
    name: 'Quản lý Khách hàng',
    route: '/customerfirebase',
    stageCol: 0,
    summary: 'Kho danh bạ khách hàng & doanh nghiệp trung tâm kết nối toàn bộ hệ thống.',
    bullets: [
      'Lưu trữ hồ sơ đối tác chuẩn 25 trường (tiếng Việt & PO tiếng Anh)',
      'Tra cứu tự động thông tin công ty theo Mã số thuế (MST)',
      'Tự động phát hiện & gộp các hồ sơ khách hàng nghi trùng lặp',
      'Tổng hợp chi tiêu, lợi nhuận & công nợ tức thời theo từng KH'
    ],
    tables: ['khach_hang', 'sale_report', 'hop_dong_tong_quat']
  },
  {
    id: 'feat_hanghoa',
    group: 'catalog',
    name: 'Quản lý Hàng hóa',
    route: '/quanlyhanghoafirebase',
    stageCol: 0,
    summary: 'Quản lý danh mục SKU sản phẩm đa hãng, đối chiếu bảng giá và kiểm soát giá vốn.',
    bullets: [
      'Kho SKU đa hãng: Sophos, Kaspersky, Acronis, Delinea...',
      'Import & So sánh bảng giá từ file Excel / PDF / Ảnh OCR',
      'Đổi tỉ giá toàn hệ thống & tạo bảng giá riêng theo nhu cầu',
      'Quản lý giá vốn, mức % Off & lưu file bảng giá gốc từ hãng'
    ],
    tables: ['hang_hoa', 'bang_gia', 'hang_hoa_tuy_chon', 'vendor_ref_files', 'file_gia_off']
  },
  {
    id: 'feat_license',
    group: 'catalog',
    name: 'Bản quyền License',
    route: '/license-old-data-firebase',
    stageCol: 3,
    summary: 'Kiểm soát vòng đời bản quyền phần mềm, thời hạn gia hạn và ân hạn của khách hàng.',
    bullets: [
      'Theo dõi ngày hết hạn bản quyền & ngày hết hiệu lực ân hạn',
      'Quét OCR / AI bóc tách tự động thông số từ chứng từ PDF & Ảnh',
      'Đánh dấu Đã gia hạn / Ngưng gia hạn & cảnh báo trùng License ID',
      'Tự động kế thừa khách hàng DB & đồng bộ liên kết đơn hàng PO'
    ],
    tables: ['license_old_data', 'khach_hang', 'sale_report']
  },

  // ── 4. Tài liệu & Biểu mẫu ──
  {
    id: 'feat_dieukhoan',
    group: 'docs',
    name: 'Quản lý Điều khoản',
    route: '/quanlydieukhoanfirebase',
    stageCol: 0,
    summary: 'Thư viện điều khoản thương mại, giao hàng và bảo hành dùng chung cho báo giá.',
    bullets: [
      'Lưu trữ bộ điều khoản mẫu chuẩn hóa theo từng nhóm dịch vụ',
      'Thiết lập bộ điều khoản mặc định tự nạp khi lập báo giá',
      'Tái sử dụng & chỉnh sửa linh hoạt cho từng hợp đồng cụ thể'
    ],
    tables: ['dieu_khoan']
  },
  {
    id: 'feat_mauin',
    group: 'docs',
    name: 'Thiết lập Mẫu In',
    route: '/mau-in-firebase',
    stageCol: 0,
    summary: 'Tùy biến giao diện mẫu xuất Excel / PDF báo giá & PO chuyên nghiệp theo nhận diện.',
    bullets: [
      'Tùy chỉnh bố cục cột, tiêu đề, logo, chữ ký & ghi chú chân trang',
      'Quản lý nhiều bộ mẫu in khác nhau & chọn mẫu áp dụng mặc định',
      'Hỗ trợ khôi phục mẫu in từ thùng rác tránh mất cấu hình'
    ],
    tables: ['mau_in_thiet_lap', 'mau_in_da_xoa', 'upload_file_mau']
  },
  {
    id: 'feat_kholuutru',
    group: 'docs',
    name: 'Kho Lưu Trữ Tài Liệu',
    route: '/kho-luu-tru-firebase',
    stageCol: 2,
    summary: 'Kho chứng từ tập trung trên đám mây phân loại theo khách hàng và nhãn nghiệp vụ.',
    bullets: [
      'Tải lên & quản lý tệp hợp đồng, PO, chứng từ qua Cloudinary',
      'Phân loại theo Khách hàng, Nhãn (Label) & tìm kiếm nhanh',
      'Xem trước trực tiếp PDF / Ảnh / Office & thêm nhanh khách hàng'
    ],
    tables: ['kho_luu_tru', 'khach_hang']
  },

  // ── 5. Hệ thống & Tự động hóa ──
  {
    id: 'feat_zalobot',
    group: 'system',
    name: 'Zalo Bot 24/7',
    route: '/zalo-bot-config',
    stageCol: 4,
    summary: 'Trợ lý Zalo Bot chạy nền 24/7 qua Cloudflare Worker gửi báo cáo, cảnh báo và tra cứu lệnh.',
    bullets: [
      'Tự động quét & đồng bộ realtime Chat ID cá nhân và nhóm Zalo',
      'Lập lịch gửi tự động báo cáo công nợ đầu ngày & nhắc việc cuối ngày',
      'Bắn cảnh báo tức thì khi ghi nhận thanh toán hoặc tạo KH mới',
      'Tra cứu dữ liệu nhanh bằng lệnh: /congno, /kh, /gia, /congviec'
    ],
    tables: ['zalo_bot_config', 'zalo_bot_logs', 'khach_hang', 'sale_report', 'REPORT', 'hang_hoa']
  },
  {
    id: 'feat_sysconfig',
    group: 'system',
    name: 'Cấu hình Hệ thống & DB',
    route: '/system-config',
    stageCol: 4,
    summary: 'Trung tâm cấu hình kỹ thuật, bảo mật đăng nhập và trực quan hóa kiến trúc cơ sở dữ liệu.',
    bullets: [
      'Thiết lập API key, tỉ giá mặc định & thông số kết nối dịch vụ',
      'Tra cứu dữ liệu gốc toàn bộ bảng Firebase & xuất CSV nhanh',
      'Vẽ & xuất ảnh PNG Sơ đồ Quan hệ DB (ERD) & Sơ đồ Chức năng',
      'Quản lý bảo mật đăng nhập & đổi mật khẩu tài khoản quản trị'
    ],
    tables: ['system_config', 'password', 'ACTIVITY_LOGS']
  }
]

/**
 * End-to-End Business Process Flow links between features (used in "Luồng nghiệp vụ" mode)
 */
export const FEATURE_FLOW_EDGES = [
  { id: 'fl_kh_pipe', from: 'feat_customer', to: 'feat_pipeline', label: 'Cơ hội dự án' },
  { id: 'fl_kh_bg', from: 'feat_customer', to: 'feat_baogia', label: 'Hồ sơ KH' },
  { id: 'fl_hh_bg', from: 'feat_hanghoa', to: 'feat_baogia', label: 'SKU & Bảng giá' },
  { id: 'fl_dk_bg', from: 'feat_dieukhoan', to: 'feat_baogia', label: 'Điều khoản' },
  { id: 'fl_mi_bg', from: 'feat_mauin', to: 'feat_baogia', label: 'Mẫu xuất file' },
  { id: 'fl_pipe_bg', from: 'feat_pipeline', to: 'feat_baogia', label: 'Lập báo giá' },
  { id: 'fl_bg_qlbg', from: 'feat_baogia', to: 'feat_ql_baogia', label: 'Quản lý phiên bản' },
  { id: 'fl_qlbg_sr', from: 'feat_ql_baogia', to: 'feat_sale_report', label: 'Chốt PO' },
  { id: 'fl_bg_sr', from: 'feat_baogia', to: 'feat_sale_report', label: 'Chốt trực tiếp' },
  { id: 'fl_sr_lic', from: 'feat_sale_report', to: 'feat_license', label: 'Đồng bộ License' },
  { id: 'fl_sr_klt', from: 'feat_sale_report', to: 'feat_kholuutru', label: 'Lưu chứng từ' },
  { id: 'fl_lic_dash', from: 'feat_license', to: 'feat_dashboard', label: 'Gia hạn / Hết HL' },
  { id: 'fl_qlbg_dash', from: 'feat_ql_baogia', to: 'feat_dashboard', label: 'Tổng hợp BG' },
  { id: 'fl_rep_dash', from: 'feat_report', to: 'feat_dashboard', label: 'Tiến độ việc' },
  { id: 'fl_sr_zalo', from: 'feat_sale_report', to: 'feat_zalobot', label: 'Báo cáo công nợ' },
  { id: 'fl_rep_zalo', from: 'feat_report', to: 'feat_zalobot', label: 'Nhắc việc' },
  { id: 'fl_kh_zalo', from: 'feat_customer', to: 'feat_zalobot', label: 'Cảnh báo KH mới' },
  { id: 'fl_sys_zalo', from: 'feat_sysconfig', to: 'feat_zalobot', label: 'Cấu hình Bot' },
  { id: 'fl_sys_hh', from: 'feat_sysconfig', to: 'feat_hanghoa', label: 'Tỉ giá hệ thống' }
]

export const FEAT_ROOT_WIDTH = 290
export const FEAT_HUB_WIDTH = 216
export const FEAT_CARD_WIDTH = 312

export function estimateFeatureNodeSize(node, showDbTables = true) {
  if (node.kind === 'root') {
    return { w: FEAT_ROOT_WIDTH, h: 196 }
  }
  if (node.kind === 'hub') {
    return { w: FEAT_HUB_WIDTH, h: 82 }
  }
  const bullets = Array.isArray(node.bullets) ? node.bullets : []
  // Estimate 2 lines per bullet conservatively for readable card height
  const bulletLinesH = bullets.reduce((acc, b) => acc + (b.length > 44 ? 34 : 21), 0)
  const dbRows = showDbTables && node.tables?.length
    ? Math.ceil(node.tables.length / 2) * 24 + 26
    : 0
  const headerH = 54
  const bodyPad = 24
  return {
    w: FEAT_CARD_WIDTH,
    h: Math.max(146, headerH + bodyPad + bulletLinesH + dbRows)
  }
}

/**
 * Builds the node list & edges for either:
 * - 'tree': Root System -> 5 Domain Group Hubs -> Feature Cards
 * - 'flow': End-to-End Business Process Flow between Feature Cards
 */
export function buildFeatureGraph(styleMode, visibleFeatures) {
  const featIds = new Set(visibleFeatures.map(f => f.id))

  if (styleMode === 'flow') {
    const nodes = visibleFeatures.map(f => ({
      ...f,
      kind: 'feature',
      groupInfo: FEATURE_GROUPS[f.group] || FEATURE_GROUPS.system
    }))
    const edges = FEATURE_FLOW_EDGES.filter(e => featIds.has(e.from) && featIds.has(e.to))
    return { nodes, edges }
  }

  // Tree / Hierarchy Mode
  const activeGroupIds = Array.from(new Set(visibleFeatures.map(f => f.group)))
    .sort((a, b) => (FEATURE_GROUPS[a]?.order ?? 99) - (FEATURE_GROUPS[b]?.order ?? 99))

  const nodes = [
    { ...SYSTEM_ROOT_NODE }
  ]
  const edges = []

  for (const gid of activeGroupIds) {
    const grp = FEATURE_GROUPS[gid]
    if (!grp) continue
    const groupFeats = visibleFeatures.filter(f => f.group === gid)
    const hubId = `hub_${gid}`
    nodes.push({
      id: hubId,
      kind: 'hub',
      group: gid,
      name: grp.label,
      subtitle: `${groupFeats.length} chức năng chính`,
      groupInfo: grp
    })
    edges.push({
      id: `tree_root_${hubId}`,
      from: SYSTEM_ROOT_NODE.id,
      to: hubId,
      label: '',
      color: grp.color,
      isHierarchy: true
    })

    for (const f of groupFeats) {
      nodes.push({
        ...f,
        kind: 'feature',
        groupInfo: grp
      })
      edges.push({
        id: `tree_${hubId}_${f.id}`,
        from: hubId,
        to: f.id,
        label: '',
        color: grp.color,
        isHierarchy: true
      })
    }
  }

  return { nodes, edges }
}

/**
 * Computes crisp non-overlapping layout for either 'tree' or 'flow' mode.
 */
export function computeFeatureLayout(styleMode, visibleFeatures, showDbTables = true) {
  const positions = {}

  if (styleMode === 'flow') {
    const STAGE_GAP_X = 112
    const ROW_GAP_Y = 34
    const START_X = 60
    const START_Y = 70

    const byStage = new Map()
    for (const f of visibleFeatures) {
      const col = Number.isFinite(f.stageCol) ? f.stageCol : 0
      if (!byStage.has(col)) byStage.set(col, [])
      byStage.get(col).push(f)
    }

    const sortedCols = Array.from(byStage.keys()).sort((a, b) => a - b)
    let curX = START_X

    // Pre-calculate column heights to vertically center shorter columns cleanly
    const colHeights = sortedCols.map(c => {
      const items = byStage.get(c)
      return items.reduce((sum, it, idx) => {
        const sz = estimateFeatureNodeSize({ ...it, kind: 'feature' }, showDbTables)
        return sum + sz.h + (idx > 0 ? ROW_GAP_Y : 0)
      }, 0)
    })
    const maxColH = Math.max(400, ...colHeights)

    sortedCols.forEach((c, cIdx) => {
      const items = byStage.get(c)
      let curY = START_Y + Math.round((maxColH - colHeights[cIdx]) / 2)
      for (const f of items) {
        positions[f.id] = { x: curX, y: curY }
        const sz = estimateFeatureNodeSize({ ...f, kind: 'feature' }, showDbTables)
        curY += sz.h + ROW_GAP_Y
      }
      curX += FEAT_CARD_WIDTH + STAGE_GAP_X
    })

    return positions
  }

  // Tree / Hierarchy Mode: Left-to-Right 3-tier layout (Root -> 5 Group Hubs -> Feature Cards)
  const ROOT_X = 50
  const HUB_X = ROOT_X + FEAT_ROOT_WIDTH + 96
  const FEAT_COL1_X = HUB_X + FEAT_HUB_WIDTH + 96
  const FEAT_COL2_X = FEAT_COL1_X + FEAT_CARD_WIDTH + 34
  const GROUP_GAP_Y = 44
  const ROW_GAP_Y = 24

  const activeGroupIds = Array.from(new Set(visibleFeatures.map(f => f.group)))
    .sort((a, b) => (FEATURE_GROUPS[a]?.order ?? 99) - (FEATURE_GROUPS[b]?.order ?? 99))

  let curY = 56
  let firstBandTop = curY
  let lastBandBottom = curY

  for (const gid of activeGroupIds) {
    const groupFeats = visibleFeatures.filter(f => f.group === gid)
    const bandStartY = curY
    let col1Y = bandStartY
    let col2Y = bandStartY

    // Distribute group's features across 2 neat sub-columns when >= 2 cards so total height stays compact
    groupFeats.forEach((f, idx) => {
      const sz = estimateFeatureNodeSize({ ...f, kind: 'feature' }, showDbTables)
      if (idx % 2 === 0) {
        positions[f.id] = { x: FEAT_COL1_X, y: col1Y }
        col1Y += sz.h + ROW_GAP_Y
      } else {
        positions[f.id] = { x: FEAT_COL2_X, y: col2Y }
        col2Y += sz.h + ROW_GAP_Y
      }
    })

    const bandEndY = Math.max(col1Y, col2Y) - ROW_GAP_Y
    const hubSz = estimateFeatureNodeSize({ kind: 'hub' }, showDbTables)
    const hubY = Math.round(bandStartY + Math.max(0, bandEndY - bandStartY - hubSz.h) / 2)
    positions[`hub_${gid}`] = { x: HUB_X, y: hubY }

    lastBandBottom = Math.max(bandEndY, hubY + hubSz.h)
    curY = lastBandBottom + GROUP_GAP_Y
  }

  const rootSz = estimateFeatureNodeSize({ kind: 'root' }, showDbTables)
  const rootY = Math.round(firstBandTop + Math.max(0, lastBandBottom - firstBandTop - rootSz.h) / 2)
  positions[SYSTEM_ROOT_NODE.id] = { x: ROOT_X, y: rootY }

  return positions
}

/**
 * Computes smooth Bezier curve & arrowhead geometry between two feature graph nodes.
 */
export function computeFeatureEdgeGeometry(edge, positions, nodeMap, showDbTables = true) {
  const fromPos = positions[edge.from]
  const toPos = positions[edge.to]
  const fromNode = nodeMap[edge.from]
  const toNode = nodeMap[edge.to]
  if (!fromPos || !toPos || !fromNode || !toNode) return null

  const fromSz = estimateFeatureNodeSize(fromNode, showDbTables)
  const toSz = estimateFeatureNodeSize(toNode, showDbTables)

  const fromCx = fromPos.x + fromSz.w / 2
  const toCx = toPos.x + toSz.w / 2
  const y1 = fromPos.y + fromSz.h / 2
  const y2 = toPos.y + toSz.h / 2

  let x1, x2, dir1, dir2
  if (Math.abs(fromCx - toCx) < Math.min(fromSz.w, toSz.w) * 0.55) {
    // Same column -> connect via right edge cleanly
    x1 = fromPos.x + fromSz.w
    x2 = toPos.x + toSz.w
    dir1 = 1
    dir2 = 1
  } else if (fromCx < toCx) {
    x1 = fromPos.x + fromSz.w
    x2 = toPos.x
    dir1 = 1
    dir2 = -1
  } else {
    x1 = fromPos.x
    x2 = toPos.x + toSz.w
    dir1 = -1
    dir2 = 1
  }

  const dx = Math.abs(x2 - x1)
  const curve = Math.max(50, Math.min(165, dx * 0.45 + 26))
  const c1x = x1 + dir1 * curve
  const c2x = x2 + dir2 * curve

  const path = `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`
  const midX = 0.125 * x1 + 0.375 * c1x + 0.375 * c2x + 0.125 * x2
  const midY = 0.125 * y1 + 0.375 * y1 + 0.375 * y2 + 0.125 * y2

  // Arrowhead pointing into (x2, y2) coming from direction dir2
  const tipX = x2
  const tipY = y2
  const baseArrowX = x2 + dir2 * 10
  const arrowPoints = `${tipX},${tipY} ${baseArrowX},${tipY - 5} ${baseArrowX},${tipY + 5}`

  return { x1, y1, x2, y2, midX, midY, path, arrowPoints }
}

const escapeXml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const wrapTextLines = (text, maxCharsPerLine = 42, maxLines = 2) => {
  const words = String(text || '').trim().split(/\s+/)
  const lines = []
  let current = ''

  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w
    if (candidate.length <= maxCharsPerLine) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = w
      if (lines.length >= maxLines - 1) break
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current)
  }
  if (lines.length === maxLines) {
    const joined = lines.join(' ')
    if (joined.length < String(text || '').trim().length) {
      const last = lines[maxLines - 1]
      lines[maxLines - 1] = last.length > maxCharsPerLine - 1 ? last.slice(0, maxCharsPerLine - 2) + '…' : last + '…'
    }
  }
  return lines
}

/**
 * Builds a 100% self-contained pure-vector SVG string of the Feature Diagram (Tree or Business Flow).
 */
export function buildStandaloneFeatureSvg({
  styleMode = 'tree',
  nodes,
  edges,
  positions,
  theme = 'dark',
  showDbTables = true,
  showFlowLabels = true
}) {
  const isLight = theme === 'light'
  const palette = isLight
    ? {
        bg: '#eaf2fc',
        gridDot: '#bfdbfe',
        cardBg: '#ffffff',
        cardBorder: '#93c5fd',
        ink: '#0f172a',
        inkSec: '#334155',
        inkMuted: '#475569',
        dbBg: '#eff6ff',
        dbBorder: '#93c5fd',
        dbInk: '#1d4ed8',
        edge: '#2563eb',
        pillBg: '#ffffff',
        pillBorder: '#93c5fd',
        pillText: '#1d4ed8',
        titleBg: '#ffffff',
        titleBorder: '#bfdbfe'
      }
    : {
        bg: '#071124',
        gridDot: '#1e3a5f',
        cardBg: '#0f1e38',
        cardBorder: '#284673',
        ink: '#f8fafc',
        inkSec: '#cbd5e1',
        inkMuted: '#94a3b8',
        dbBg: 'rgba(56, 189, 248, 0.14)',
        dbBorder: 'rgba(56, 189, 248, 0.4)',
        dbInk: '#bae6fd',
        edge: '#38bdf8',
        pillBg: '#0c1830',
        pillBorder: '#38bdf8',
        pillText: '#bae6fd',
        titleBg: '#0d1b36',
        titleBorder: '#254370'
      }

  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.id] = n })

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  nodes.forEach(n => {
    const pos = positions[n.id]
    if (!pos) return
    const sz = estimateFeatureNodeSize(n, showDbTables)
    minX = Math.min(minX, pos.x)
    minY = Math.min(minY, pos.y)
    maxX = Math.max(maxX, pos.x + sz.w)
    maxY = Math.max(maxY, pos.y + sz.h)
  })

  if (!Number.isFinite(minX)) {
    minX = 0; minY = 0; maxX = 1280; maxY = 820
  }

  const PAD = 60
  const HEADER_H = 78
  const offsetX = PAD - minX
  const offsetY = PAD + HEADER_H - minY
  const totalW = Math.max(1020, Math.round(maxX - minX + PAD * 2))
  const totalH = Math.max(660, Math.round(maxY - minY + PAD * 2 + HEADER_H))

  const shiftedPos = {}
  for (const [k, p] of Object.entries(positions)) {
    shiftedPos[k] = { x: p.x + offsetX, y: p.y + offsetY }
  }

  const now = new Date()
  const stamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const featureCount = nodes.filter(n => n.kind === 'feature').length
  const titleMain = styleMode === 'flow'
    ? 'SƠ ĐỒ LUỒNG NGHIỆP VỤ CHỨC NĂNG CHÍNH — HỆ THỐNG NTS'
    : 'SƠ ĐỒ CÂY PHÂN HỆ CHỨC NĂNG CHÍNH — HỆ THỐNG NTS'
  const titleSub = `${featureCount} chức năng chính • ${edges.length} kết nối • ${showDbTables ? 'Kèm bảng dữ liệu Firebase' : 'Chế độ gọn trình bày'} • Xuất lúc ${stamp}`

  const edgesSvg = []
  const labelsSvg = []

  for (const edge of edges) {
    const geo = computeFeatureEdgeGeometry(edge, shiftedPos, nodeMap, showDbTables)
    if (!geo) continue
    const stroke = edge.color || palette.edge
    edgesSvg.push(
      `<path d="${geo.path}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-opacity="0.82" />`,
      `<circle cx="${geo.x1}" cy="${geo.y1}" r="3.4" fill="${stroke}" />`,
      `<polygon points="${geo.arrowPoints}" fill="${stroke}" />`
    )
    if (showFlowLabels && edge.label) {
      const lbl = edge.label.length > 20 ? edge.label.slice(0, 19) + '…' : edge.label
      const boxW = Math.max(58, lbl.length * 6.4 + 16)
      labelsSvg.push(
        `<g transform="translate(${geo.midX - boxW / 2}, ${geo.midY - 10})">`,
        `<rect width="${boxW}" height="20" rx="10" fill="${palette.pillBg}" stroke="${palette.pillBorder}" stroke-width="1" />`,
        `<text x="${boxW / 2}" y="13.5" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="700" fill="${palette.pillText}">${escapeXml(lbl)}</text>`,
        `</g>`
      )
    }
  }

  const cardsSvg = []
  for (const node of nodes) {
    const pos = shiftedPos[node.id]
    if (!pos) continue
    const sz = estimateFeatureNodeSize(node, showDbTables)

    if (node.kind === 'root') {
      cardsSvg.push(
        `<g transform="translate(${pos.x}, ${pos.y})">`,
        `<rect width="${sz.w}" height="${sz.h}" rx="16" fill="url(#feat-root-grad)" stroke="#60a5fa" stroke-width="2" />`,
        `<rect x="16" y="16" width="54" height="22" rx="11" fill="rgba(255,255,255,0.2)" />`,
        `<text x="43" y="30.5" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="800" fill="#ffffff">CORE</text>`,
        `<text x="16" y="64" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="16.5" font-weight="800" fill="#ffffff">${escapeXml(node.name)}</text>`,
        `<text x="16" y="84" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="600" fill="#bae6fd">${escapeXml(node.subtitle)}</text>`
      )
      ;(node.highlights || []).forEach((h, idx) => {
        cardsSvg.push(
          `<circle cx="22" cy="${114 + idx * 24}" r="3" fill="#7dd3fc" />`,
          `<text x="32" y="${118 + idx * 24}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="600" fill="#f8fafc">${escapeXml(h)}</text>`
        )
      })
      cardsSvg.push('</g>')
      continue
    }

    if (node.kind === 'hub') {
      const color = node.groupInfo?.color || '#2563eb'
      cardsSvg.push(
        `<g transform="translate(${pos.x}, ${pos.y})">`,
        `<rect width="${sz.w}" height="${sz.h}" rx="13" fill="${palette.cardBg}" stroke="${color}" stroke-width="2" />`,
        `<rect width="7" height="${sz.h}" rx="3.5" fill="${color}" />`,
        `<text x="20" y="34" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="13.5" font-weight="800" fill="${palette.ink}">${escapeXml(node.name)}</text>`,
        `<text x="20" y="57" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="700" fill="${color}">${escapeXml(node.subtitle)}</text>`,
        `</g>`
      )
      continue
    }

    // Feature Module Card
    const accent = node.groupInfo?.color || '#2563eb'
    cardsSvg.push(`<g transform="translate(${pos.x}, ${pos.y})">`)
    cardsSvg.push(
      `<rect width="${sz.w}" height="${sz.h}" rx="13" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.4" />`,
      `<path d="M 13 0 L ${sz.w - 13} 0 Q ${sz.w} 0 ${sz.w} 13 L ${sz.w} 52 L 0 52 L 0 13 Q 0 0 13 0 Z" fill="${accent}" />`,
      `<text x="13" y="24" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="13.5" font-weight="800" fill="#ffffff">${escapeXml(node.name)}</text>`,
      `<text x="13" y="42" font-family="Consolas, Menlo, monospace" font-size="10.5" font-weight="600" fill="rgba(255,255,255,0.88)">${escapeXml(node.route || '')}</text>`
    )

    let cursorY = 70
    ;(node.bullets || []).forEach((b) => {
      const lines = wrapTextLines(b, 43, 2)
      cardsSvg.push(`<circle cx="16" cy="${cursorY - 3.5}" r="2.6" fill="${accent}" />`)
      lines.forEach((ln, li) => {
        cardsSvg.push(
          `<text x="25" y="${cursorY + li * 14}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="11.2" font-weight="500" fill="${palette.inkSec}">${escapeXml(ln)}</text>`
        )
      })
      cursorY += lines.length * 14 + 7
    })

    if (showDbTables && Array.isArray(node.tables) && node.tables.length > 0) {
      const dbTop = sz.h - (Math.ceil(node.tables.length / 2) * 23 + 22)
      cardsSvg.push(
        `<line x1="12" y1="${dbTop}" x2="${sz.w - 12}" y2="${dbTop}" stroke="${palette.cardBorder}" stroke-width="1" stroke-dasharray="3 3" />`,
        `<text x="13" y="${dbTop + 14}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="9.5" font-weight="800" fill="${palette.inkMuted}">BẢNG FIREBASE:</text>`
      )
      const colW = (sz.w - 32) / 2
      node.tables.forEach((tbl, tIdx) => {
        const c = tIdx % 2
        const r = Math.floor(tIdx / 2)
        const tx = 13 + c * (colW + 6)
        const ty = dbTop + 20 + r * 22
        const label = tbl.length > 18 ? tbl.slice(0, 17) + '…' : tbl
        cardsSvg.push(
          `<rect x="${tx}" y="${ty}" width="${colW}" height="18" rx="5" fill="${palette.dbBg}" stroke="${palette.dbBorder}" stroke-width="0.9" />`,
          `<text x="${tx + 6}" y="${ty + 12.5}" font-family="Consolas, Menlo, monospace" font-size="9.8" font-weight="700" fill="${palette.dbInk}">${escapeXml(label)}</text>`
        )
      })
    }

    cardsSvg.push('</g>')
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <defs>
    <pattern id="feat-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${palette.gridDot}" opacity="0.65" />
    </pattern>
    <linearGradient id="feat-root-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f2f6e" />
      <stop offset="52%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${palette.bg}" />
  <rect width="100%" height="100%" fill="url(#feat-dot-grid)" />

  <g transform="translate(28, 20)">
    <rect width="${totalW - 56}" height="56" rx="12" fill="${palette.titleBg}" stroke="${palette.titleBorder}" stroke-width="1.2" />
    <rect x="14" y="13" width="30" height="30" rx="8" fill="#2563eb" />
    <text x="29" y="33" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" fill="#ffffff">FN</text>
    <text x="56" y="27" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="15.5" font-weight="800" fill="${palette.ink}">${escapeXml(titleMain)}</text>
    <text x="56" y="45" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="600" fill="${palette.inkMuted}">${escapeXml(titleSub)}</text>
  </g>

  <g>${edgesSvg.join('')}</g>
  <g>${cardsSvg.join('')}</g>
  <g>${labelsSvg.join('')}</g>
</svg>`
}

/**
 * Exports the active Feature Diagram as a crisp 2x Retina PNG image.
 */
export async function exportFeaturesToPng(options) {
  const svgString = buildStandaloneFeatureSvg(options)
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgEl = doc.documentElement
  const width = Number(svgEl.getAttribute('width')) || 1600
  const height = Number(svgEl.getAttribute('height')) || 1000

  const maxDim = Math.max(width, height)
  const scale = Math.min(2, Math.max(1, Math.floor((7600 / maxDim) * 10) / 10))

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = (err) => reject(err)
      image.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Không khởi tạo được Canvas 2D')
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Không xuất được PNG'))), 'image/png', 1)
    })

    const now = new Date()
    const tag = options.styleMode === 'flow' ? 'LuongNghiepVu' : 'CayPhanHe'
    const fileName = `ChucNangChinh_${tag}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.png`
    const dlUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = dlUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(dlUrl), 1500)
    return { fileName, width: canvas.width, height: canvas.height }
  } finally {
    URL.revokeObjectURL(url)
  }
}
