/**
 * Database Schema Metadata, Known Relationships, Auto FK Detector,
 * Smart Cluster Layout & Standalone Vector SVG / High-DPI PNG Exporter
 * for DatabaseViewer.vue (Read-only ERD Diagram Mode).
 */

export const SCHEMA_GROUPS = {
  core: {
    id: 'core',
    label: 'Khách hàng',
    color: '#2563eb',
    darkBg: 'rgba(37, 99, 235, 0.22)',
    lightBg: '#dbeafe',
    order: 0
  },
  quote: {
    id: 'quote',
    label: 'Báo giá & HĐ',
    color: '#0284c7',
    darkBg: 'rgba(2, 132, 199, 0.22)',
    lightBg: '#e0f2fe',
    order: 1
  },
  sales: {
    id: 'sales',
    label: 'PO & Công nợ',
    color: '#059669',
    darkBg: 'rgba(5, 150, 105, 0.22)',
    lightBg: '#d1fae5',
    order: 2
  },
  license: {
    id: 'license',
    label: 'License',
    color: '#d97706',
    darkBg: 'rgba(217, 119, 6, 0.22)',
    lightBg: '#fef3c7',
    order: 3
  },
  product: {
    id: 'product',
    label: 'Hàng hóa & Giá',
    color: '#4f46e5',
    darkBg: 'rgba(79, 70, 229, 0.22)',
    lightBg: '#e0e7ff',
    order: 4
  },
  workflow: {
    id: 'workflow',
    label: 'Pipeline & File',
    color: '#7c3aed',
    darkBg: 'rgba(124, 58, 237, 0.22)',
    lightBg: '#ede9fe',
    order: 5
  },
  system: {
    id: 'system',
    label: 'Hệ thống',
    color: '#475569',
    darkBg: 'rgba(71, 85, 105, 0.28)',
    lightBg: '#e2e8f0',
    order: 6
  }
}

export const TABLE_META = {
  khach_hang: {
    title: 'Khách hàng',
    desc: 'Danh mục khách hàng & đối tác trung tâm toàn hệ thống',
    group: 'core',
    pk: 'ma_khach_hang',
    priorityCols: ['ma_khach_hang', 'ten_cong_ty', 'ten_khach_hang', 'mst', 'so_dien_thoai_ca_nhan', 'email_ca_nhan', 'cong_no']
  },
  hop_dong_tong_quat: {
    title: 'Báo giá / Hợp đồng (Tổng quát)',
    desc: 'Thông tin tổng hợp báo giá, hợp đồng & tổng tiền',
    group: 'quote',
    pk: 'ma_hop_dong',
    priorityCols: ['ma_hop_dong', 'ma_khach_hang', 'ma_hop_dong_goc', 'id_sale_report', 'id_sale_report_craft', 'So_PO', 'Trang_thai_hop_dong', 'Tong_tien_sau_thueVAT', 'ngay_tao_hop_dong']
  },
  hop_dong_chi_tiet: {
    title: 'Chi tiết Báo giá / HĐ',
    desc: 'Danh sách dòng sản phẩm, đơn giá, VAT & thời hạn của từng báo giá',
    group: 'quote',
    pk: '_key',
    priorityCols: ['_key', 'ma_hop_dong', 'Ma_hang', 'Ten_hang', 'So_luong', 'Don_gia', 'start_date', 'end_date', 'is_giahan']
  },
  hop_dong_version: {
    title: 'Phiên bản Báo giá',
    desc: 'Lịch sử các phiên bản V1, V2... của báo giá gốc',
    group: 'quote',
    pk: '_key',
    priorityCols: ['_key', 'ma_hop_dong', 'ma_hop_dong_goc', 'version', 'ngay_tao']
  },
  dieu_khoan: {
    title: 'Điều khoản Báo giá',
    desc: 'Danh mục điều khoản mẫu dùng khi lập báo giá',
    group: 'quote',
    pk: '_key',
    priorityCols: ['_key', 'ten_dieu_khoan', 'noi_dung', 'mac_dinh']
  },
  mau_in_thiet_lap: {
    title: 'Thiết lập Mẫu In',
    desc: 'Cấu hình giao diện & bố cục mẫu in báo giá / PO',
    group: 'quote',
    pk: '_key',
    priorityCols: ['_key', 'name', 'type', 'isDefault', 'updatedAt']
  },
  mau_in_da_xoa: {
    title: 'Mẫu In đã xóa',
    desc: 'Thùng rác lưu trữ các mẫu in đã xóa để khôi phục',
    group: 'quote',
    pk: '_key',
    priorityCols: ['_key', 'source_id', 'name', 'deletedAt']
  },
  upload_file_mau: {
    title: 'File mẫu Upload',
    desc: 'Kho file biểu mẫu Excel/Word mẫu của hệ thống',
    group: 'quote',
    pk: '_key',
    priorityCols: ['_key', 'name', 'url', 'type']
  },
  sale_report: {
    title: 'Sale Report (Đơn hàng PO)',
    desc: 'Đơn hàng PO chính thức, doanh thu, lợi nhuận & công nợ',
    group: 'sales',
    pk: '_key',
    priorityCols: ['_key', 'So_PO', 'Ma_khach_hang', 'ma_hop_dong', 'Ten_cong_ty', 'Tong_tien_sau_thueVAT', 'so_tien_da_thanh_toan', 'cong_no', 'han_thanh_toan']
  },
  sale_report_craft: {
    title: 'Sale Report Nháp',
    desc: 'Bản nháp / chờ duyệt trước khi chốt vào Sale Report chính thức',
    group: 'sales',
    pk: '_key',
    priorityCols: ['_key', 'So_PO', 'Ma_khach_hang', 'ma_hop_dong', 'id_quanlyfile', 'Trang_thai', 'Tong_tien_sau_thueVAT']
  },
  lich_su_thanh_toan: {
    title: 'Lịch sử Thanh toán',
    desc: 'Các đợt thanh toán công nợ gắn với từng PO & khách hàng',
    group: 'sales',
    pk: 'id',
    priorityCols: ['id', 'id_salereport', 'maKH', 'so_tien_thanh_toan', 'cong_no_con_lai', 'thoi_gian_thanh_toan', 'ghi_chu']
  },
  chi_tiet_mua_hang: {
    title: 'Chi tiết Mua hàng',
    desc: 'Chi tiết mặt hàng đặt mua đầu vào từ NCC theo PO',
    group: 'sales',
    pk: '_key',
    priorityCols: ['_key', 'so_po', 'ma_hop_dong', 'Ma_hang', 'Ten_hang', 'So_luong', 'gia_nhap']
  },
  PO_DXMH: {
    title: 'Đề xuất Mua hàng (PO DXMH)',
    desc: 'Phiếu đề xuất mua hàng liên kết báo giá & đơn hàng PO',
    group: 'sales',
    pk: '_key',
    priorityCols: ['_key', 'so_po', 'ma_hop_dong', 'ma_khach_hang', 'ngay_tao', 'trang_thai']
  },
  license_old_data: {
    title: 'Kho Bản quyền License',
    desc: 'Quản lý hạn bản quyền, ân hạn & trạng thái gia hạn License',
    group: 'license',
    pk: 'LICENSE_ID',
    priorityCols: ['LICENSE_ID', 'MA_KHACH_HANG', 'PO_FIREBASE_KEY', 'SO_PO', 'CUSTOMER', 'NHA_SAN_XUAT', 'PRODUCT_NAME', 'EXPIRATION_TIME', 'SO_NGAY_HIEU_LUC', 'IS_GIA_HAN']
  },
  hang_hoa: {
    title: 'Danh mục Hàng hóa',
    desc: 'Kho SKU sản phẩm, giá niêm yết, giá nhập & mức chiết khấu',
    group: 'product',
    pk: 'Ma_hang',
    priorityCols: ['Ma_hang', 'sku_code', 'Ten_hang', 'Ten_nha_cung_cap', 'Danh_muc', 'Don_gia', 'Don_vi_tien_te', 'muc_%_off']
  },
  bang_gia: {
    title: 'Bảng giá riêng',
    desc: 'Các bảng giá tùy chỉnh theo khách hàng / hãng',
    group: 'product',
    pk: '_key',
    priorityCols: ['_key', 'ten_bang_gia', 'Ma_hang', 'ma_khach_hang', 'ti_gia', 'ngay_tao']
  },
  hang_hoa_tuy_chon: {
    title: 'Hàng hóa Tùy chọn',
    desc: 'Cấu hình tùy chọn mở rộng cho sản phẩm',
    group: 'product',
    pk: '_key',
    priorityCols: ['_key', 'Ma_hang', 'ten_tuy_chon', 'gia_tri']
  },
  vendor_ref_files: {
    title: 'File bảng giá Hãng',
    desc: 'Lưu trữ file gốc nhà cung cấp (Sophos, Kaspersky, Acronis...)',
    group: 'product',
    pk: '_key',
    priorityCols: ['_key', 'vendor', 'fileName', 'url', 'uploadedAt']
  },
  file_gia_off: {
    title: 'File Giá vốn & Mức Off',
    desc: 'File tham chiếu giá nhập & phần trăm chiết khấu theo hãng',
    group: 'product',
    pk: '_key',
    priorityCols: ['_key', 'hang', 'ten_file', 'link_file', 'updatedAt']
  },
  pipeline: {
    title: 'Pipeline Cơ hội',
    desc: 'Theo dõi các task/cơ hội bán hàng theo từng bước workflow',
    group: 'workflow',
    pk: 'Id_pipeline',
    priorityCols: ['Id_pipeline', 'id_project', 'id_workflow', 'id_status_workflow', 'ma_khach_hang', 'ma_hop_dong', 'ten_cong_viec']
  },
  pipeline_projects: {
    title: 'Dự án Pipeline',
    desc: 'Nhóm dự án khách hàng gắn với các quy trình Pipeline',
    group: 'workflow',
    pk: 'id_project',
    priorityCols: ['id_project', 'ma_khach_hang', 'default_workflow_id', 'linked_workflow_ids', 'ten_du_an', 'last_updated']
  },
  pipeline_workflow: {
    title: 'Quy trình Workflow',
    desc: 'Định nghĩa các bước trạng thái trong từng quy trình Pipeline',
    group: 'workflow',
    pk: 'id_status_workflow',
    priorityCols: ['id_status_workflow', 'id_workflow', 'name_workflow', 'step_name', 'order']
  },
  pipeline_workflow_meta: {
    title: 'Metadata Workflow',
    desc: 'Cấu hình mở rộng & thứ tự hiển thị của quy trình Workflow',
    group: 'workflow',
    pk: 'id_workflow',
    priorityCols: ['id_workflow', 'name_workflow', 'color', 'updatedAt']
  },
  deal_reg: {
    title: 'Deal Registration',
    desc: 'Đăng ký bảo vệ dự án (Deal Reg) với hãng cho khách hàng',
    group: 'workflow',
    pk: '_key',
    priorityCols: ['_key', 'ma_khach_hang', 'ma_hop_dong', 'hang', 'trang_thai', 'ngay_het_han']
  },
  REPORT: {
    title: 'Báo cáo Công việc',
    desc: 'Nhật ký công việc hằng ngày, nhắc việc & trạng thái hoàn thành',
    group: 'workflow',
    pk: 'id',
    priorityCols: ['id', 'maKH', 'id_quanlyfile', 'NOI_DUNG', 'THOI_GIAN', 'TRANG_THAI', 'PHAN_LOAI']
  },
  reports: {
    title: 'Báo cáo (Phụ)',
    desc: 'Node lưu trữ dữ liệu báo cáo bổ sung',
    group: 'workflow',
    pk: '_key',
    priorityCols: ['_key', 'maKH', 'noi_dung', 'thoi_gian', 'trang_thai']
  },
  quan_ly_file: {
    title: 'Quản lý File',
    desc: 'Hồ sơ tệp đính kèm liên kết công việc & đơn hàng',
    group: 'workflow',
    pk: '_key',
    priorityCols: ['_key', 'ma_khach_hang', 'ten_file', 'link_file', 'ngay_tao']
  },
  kho_luu_tru: {
    title: 'Kho Lưu Trữ Tài Liệu',
    desc: 'Tài liệu, chứng từ & nhãn khách hàng lưu trên đám mây',
    group: 'workflow',
    pk: '_key',
    priorityCols: ['_key', 'ma_khach_hang', 'ten_cong_ty', 'ten_file', 'nhan', 'ngay_tai_len']
  },
  zalo_bot_config: {
    title: 'Cấu hình Zalo Bot',
    desc: 'Token, danh sách người nhận, lịch gửi tự động & lệnh Bot Zalo',
    group: 'system',
    pk: '_key',
    priorityCols: ['botName', 'botAccount', 'enabled', 'recipients', 'schedules', 'commands']
  },
  zalo_bot_logs: {
    title: 'Nhật ký Zalo Bot',
    desc: 'Lịch sử gửi/nhận tin nhắn và thực thi lệnh của Bot Zalo',
    group: 'system',
    pk: '_key',
    priorityCols: ['_key', 'chatId', 'type', 'status', 'timestamp']
  },
  ACTIVITY_LOGS: {
    title: 'Nhật ký Hoạt động',
    desc: 'Log thao tác người dùng trong hệ thống',
    group: 'system',
    pk: '_key',
    priorityCols: ['_key', 'action', 'module', 'user', 'timestamp']
  },
  password: {
    title: 'Mật khẩu & Đăng nhập',
    desc: 'Thông tin xác thực truy cập hệ thống quản trị',
    group: 'system',
    pk: '_key',
    priorityCols: ['_key', 'password', 'updatedAt']
  },
  system_config: {
    title: 'Cấu hình Hệ thống',
    desc: 'Tham số cấu hình toàn cục (tỉ giá, Zalo default...)',
    group: 'system',
    pk: '_key',
    priorityCols: ['_key', 'usdRate', 'zalo']
  }
}

/**
 * Verified business relationships across Firebase Realtime Database nodes.
 * `from` (Child / FK side) ---> `to` (Parent / PK side)
 */
export const KNOWN_RELATIONS = [
  // Center: khach_hang
  { id: 'rel_hdtq_kh', from: 'hop_dong_tong_quat', fromField: 'ma_khach_hang', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_sr_kh', from: 'sale_report', fromField: 'Ma_khach_hang', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_src_kh', from: 'sale_report_craft', fromField: 'Ma_khach_hang', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_lstt_kh', from: 'lich_su_thanh_toan', fromField: 'maKH', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_lic_kh', from: 'license_old_data', fromField: 'MA_KHACH_HANG', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_rep_kh', from: 'REPORT', fromField: 'maKH', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_pipe_kh', from: 'pipeline', fromField: 'ma_khach_hang', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_pproj_kh', from: 'pipeline_projects', fromField: 'ma_khach_hang', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_dr_kh', from: 'deal_reg', fromField: 'ma_khach_hang', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_klt_kh', from: 'kho_luu_tru', fromField: 'ma_khach_hang', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_qlf_kh', from: 'quan_ly_file', fromField: 'ma_khach_hang', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Khách hàng' },
  { id: 'rel_bg_kh', from: 'bang_gia', fromField: 'ma_khach_hang', to: 'khach_hang', toField: 'ma_khach_hang', cardinality: 'N:1', label: 'Bảng giá riêng' },

  // Quotes & Contracts
  { id: 'rel_hdct_hdtq', from: 'hop_dong_chi_tiet', fromField: 'ma_hop_dong', to: 'hop_dong_tong_quat', toField: 'ma_hop_dong', cardinality: 'N:1', label: 'Thuộc báo giá' },
  { id: 'rel_hdver_hdtq', from: 'hop_dong_version', fromField: 'ma_hop_dong_goc', to: 'hop_dong_tong_quat', toField: 'ma_hop_dong', cardinality: 'N:1', label: 'Phiên bản' },
  { id: 'rel_sr_hdtq', from: 'sale_report', fromField: 'ma_hop_dong', to: 'hop_dong_tong_quat', toField: 'ma_hop_dong', cardinality: '1:1', label: 'Từ báo giá' },
  { id: 'rel_src_hdtq', from: 'sale_report_craft', fromField: 'ma_hop_dong', to: 'hop_dong_tong_quat', toField: 'ma_hop_dong', cardinality: '1:1', label: 'Báo giá nháp' },
  { id: 'rel_dxmh_hdtq', from: 'PO_DXMH', fromField: 'ma_hop_dong', to: 'hop_dong_tong_quat', toField: 'ma_hop_dong', cardinality: 'N:1', label: 'Báo giá' },
  { id: 'rel_dr_hdtq', from: 'deal_reg', fromField: 'ma_hop_dong', to: 'hop_dong_tong_quat', toField: 'ma_hop_dong', cardinality: 'N:1', label: 'Báo giá' },
  { id: 'rel_pipe_hdtq', from: 'pipeline', fromField: 'ma_hop_dong', to: 'hop_dong_tong_quat', toField: 'ma_hop_dong', cardinality: 'N:1', label: 'Báo giá' },
  { id: 'rel_midx_mitl', from: 'mau_in_da_xoa', fromField: 'source_id', to: 'mau_in_thiet_lap', toField: '_key', cardinality: 'N:1', label: 'Mẫu gốc' },

  // Sale Report / PO / Debt / License
  { id: 'rel_lstt_sr', from: 'lich_su_thanh_toan', fromField: 'id_salereport', to: 'sale_report', toField: '_key', cardinality: 'N:1', label: 'Thanh toán PO' },
  { id: 'rel_lic_sr', from: 'license_old_data', fromField: 'PO_FIREBASE_KEY', to: 'sale_report', toField: '_key', cardinality: 'N:1', label: 'Gắn PO' },
  { id: 'rel_ctmh_sr', from: 'chi_tiet_mua_hang', fromField: 'so_po', to: 'sale_report', toField: 'So_PO', cardinality: 'N:1', label: 'Mua hàng PO' },
  { id: 'rel_dxmh_sr', from: 'PO_DXMH', fromField: 'so_po', to: 'sale_report', toField: 'So_PO', cardinality: 'N:1', label: 'Đơn hàng PO' },
  { id: 'rel_src_qlf', from: 'sale_report_craft', fromField: 'id_quanlyfile', to: 'quan_ly_file', toField: '_key', cardinality: 'N:1', label: 'Hồ sơ file' },

  // Products & Pricing
  { id: 'rel_hdct_hh', from: 'hop_dong_chi_tiet', fromField: 'Ma_hang', to: 'hang_hoa', toField: 'Ma_hang', cardinality: 'N:1', label: 'Sản phẩm' },
  { id: 'rel_ctmh_hh', from: 'chi_tiet_mua_hang', fromField: 'Ma_hang', to: 'hang_hoa', toField: 'Ma_hang', cardinality: 'N:1', label: 'Sản phẩm' },
  { id: 'rel_bg_hh', from: 'bang_gia', fromField: 'Ma_hang', to: 'hang_hoa', toField: 'Ma_hang', cardinality: 'N:1', label: 'Sản phẩm' },
  { id: 'rel_hhtc_hh', from: 'hang_hoa_tuy_chon', fromField: 'Ma_hang', to: 'hang_hoa', toField: 'Ma_hang', cardinality: 'N:1', label: 'Tùy chọn SP' },
  { id: 'rel_vrf_hh', from: 'vendor_ref_files', fromField: 'vendor', to: 'hang_hoa', toField: 'Ten_nha_cung_cap', cardinality: 'N:1', label: 'Theo hãng' },
  { id: 'rel_fgo_hh', from: 'file_gia_off', fromField: 'hang', to: 'hang_hoa', toField: 'Ten_nha_cung_cap', cardinality: 'N:1', label: 'Giá Off hãng' },

  // Pipeline & Files & Reports
  { id: 'rel_pipe_proj', from: 'pipeline', fromField: 'id_project', to: 'pipeline_projects', toField: 'id_project', cardinality: 'N:1', label: 'Thuộc dự án' },
  { id: 'rel_pipe_wf', from: 'pipeline', fromField: 'id_workflow', to: 'pipeline_workflow', toField: 'id_workflow', cardinality: 'N:1', label: 'Quy trình' },
  { id: 'rel_pproj_wf', from: 'pipeline_projects', fromField: 'default_workflow_id', to: 'pipeline_workflow', toField: 'id_workflow', cardinality: 'N:N', label: 'Workflow dự án' },
  { id: 'rel_wfmeta_wf', from: 'pipeline_workflow_meta', fromField: 'id_workflow', to: 'pipeline_workflow', toField: 'id_workflow', cardinality: '1:1', label: 'Metadata' },
  { id: 'rel_rep_qlf', from: 'REPORT', fromField: 'id_quanlyfile', to: 'quan_ly_file', toField: '_key', cardinality: 'N:1', label: 'Tệp đính kèm' }
]

const AUTO_FK_PATTERNS = [
  { regex: /^(ma_?kh|ma_?khach_?hang|customer_?id)$/i, target: 'khach_hang', toField: 'ma_khach_hang', label: 'Khách hàng (tự dò)' },
  { regex: /^(ma_?hop_?dong|ma_?hd|contract_?id)$/i, target: 'hop_dong_tong_quat', toField: 'ma_hop_dong', label: 'Báo giá/HĐ (tự dò)' },
  { regex: /^(id_?sale_?report|po_?firebase_?key|sale_?report_?id)$/i, target: 'sale_report', toField: '_key', label: 'Sale Report (tự dò)' },
  { regex: /^(ma_?hang|product_?id|sku_?code)$/i, target: 'hang_hoa', toField: 'Ma_hang', label: 'Hàng hóa (tự dò)' },
  { regex: /^(id_?quan_?ly_?file|file_?id)$/i, target: 'quan_ly_file', toField: '_key', label: 'Quản lý file (tự dò)' },
  { regex: /^(id_?project|project_?id)$/i, target: 'pipeline_projects', toField: 'id_project', label: 'Dự án (tự dò)' },
  { regex: /^(id_?workflow|workflow_?id)$/i, target: 'pipeline_workflow', toField: 'id_workflow', label: 'Workflow (tự dò)' },
  { regex: /^(license_?id)$/i, target: 'license_old_data', toField: 'LICENSE_ID', label: 'License (tự dò)' }
]

export function getTableMeta(nodeName) {
  const known = TABLE_META[nodeName]
  if (known) {
    return {
      ...known,
      groupInfo: SCHEMA_GROUPS[known.group] || SCHEMA_GROUPS.system
    }
  }
  // Heuristic group assignment for any newly added Firebase node
  const lower = String(nodeName || '').toLowerCase()
  let group = 'system'
  if (lower.includes('khach') || lower.includes('customer')) group = 'core'
  else if (lower.includes('hop_dong') || lower.includes('bao_gia') || lower.includes('mau_in') || lower.includes('dieu_khoan')) group = 'quote'
  else if (lower.includes('sale') || lower.includes('thanh_toan') || lower.includes('po') || lower.includes('mua_hang')) group = 'sales'
  else if (lower.includes('license')) group = 'license'
  else if (lower.includes('hang_hoa') || lower.includes('gia') || lower.includes('vendor')) group = 'product'
  else if (lower.includes('pipeline') || lower.includes('file') || lower.includes('report') || lower.includes('kho') || lower.includes('deal')) group = 'workflow'

  return {
    title: nodeName.replace(/[_-]+/g, ' '),
    desc: `Node dữ liệu "${nodeName}" trên Firebase Realtime Database`,
    group,
    pk: '_key',
    priorityCols: ['_key', 'id'],
    groupInfo: SCHEMA_GROUPS[group] || SCHEMA_GROUPS.system
  }
}

export function buildRelationsForNodes(nodeList) {
  const existingSet = new Set(nodeList.map(n => n.name))
  const relations = []
  const pairSeen = new Set()

  // 1. Add verified known relations where both endpoints exist
  for (const rel of KNOWN_RELATIONS) {
    if (!existingSet.has(rel.from) || !existingSet.has(rel.to)) continue
    relations.push({
      ...rel,
      isAutoDetected: false
    })
    pairSeen.add(`${rel.from}-->${rel.to}`)
  }

  // 2. Auto-detect extra FK links for tables/columns not covered by known relations
  for (const node of nodeList) {
    const cols = Array.isArray(node.columns) ? node.columns : []
    for (const col of cols) {
      for (const pat of AUTO_FK_PATTERNS) {
        if (!pat.regex.test(col)) continue
        if (pat.target === node.name) continue
        if (!existingSet.has(pat.target)) continue
        const pairKey = `${node.name}-->${pat.target}`
        if (pairSeen.has(pairKey)) continue
        pairSeen.add(pairKey)
        relations.push({
          id: `auto_${node.name}_${col}_${pat.target}`,
          from: node.name,
          fromField: col,
          to: pat.target,
          toField: pat.toField,
          cardinality: 'N:1',
          label: pat.label,
          isAutoDetected: true
        })
      }
    }
  }

  return relations
}

export const NODE_CARD_WIDTH = 264
export const NODE_HEADER_HEIGHT = 56
export const NODE_ROW_HEIGHT = 27
export const NODE_FOOTER_HEIGHT = 30
export const MAX_COLLAPSED_COLS = 7

/**
 * Computes displayed columns for an entity node, ordering PK first, then FKs, then priority cols.
 */
export function getOrderedColumnsForNode(node, relations, isExpanded = false) {
  const meta = getTableMeta(node.name)
  const fkSet = new Set()
  const referencedPkSet = new Set()

  for (const r of relations) {
    if (r.from === node.name) fkSet.add(r.fromField)
    if (r.to === node.name) referencedPkSet.add(r.toField)
  }

  const allCols = new Set(Array.isArray(node.columns) ? node.columns : [])
  // Ensure PK and FK fields used by relations always show in the table box
  if (meta.pk) allCols.add(meta.pk)
  fkSet.forEach(f => allCols.add(f))
  referencedPkSet.forEach(f => allCols.add(f))

  const priorityMap = new Map()
  ;(meta.priorityCols || []).forEach((c, idx) => priorityMap.set(c, idx))

  const sorted = Array.from(allCols).sort((a, b) => {
    const aIsPk = a === meta.pk || referencedPkSet.has(a)
    const bIsPk = b === meta.pk || referencedPkSet.has(b)
    if (aIsPk !== bIsPk) return aIsPk ? -1 : 1

    const aIsFk = fkSet.has(a)
    const bIsFk = fkSet.has(b)
    if (aIsFk !== bIsFk) return aIsFk ? -1 : 1

    const aPrio = priorityMap.has(a) ? priorityMap.get(a) : 999
    const bPrio = priorityMap.has(b) ? priorityMap.get(b) : 999
    if (aPrio !== bPrio) return aPrio - bPrio

    return a.localeCompare(b)
  })

  const keyCount = sorted.filter(c => c === meta.pk || referencedPkSet.has(c) || fkSet.has(c)).length
  const totalCount = sorted.length
  const collapsedLimit = Math.max(MAX_COLLAPSED_COLS, keyCount)
  const visible = isExpanded ? sorted : sorted.slice(0, collapsedLimit)
  const hiddenCount = Math.max(0, totalCount - visible.length)

  return {
    rows: visible.map(colName => ({
      name: colName,
      isPk: colName === meta.pk || referencedPkSet.has(colName),
      isFk: fkSet.has(colName)
    })),
    totalCount,
    hiddenCount
  }
}

export function estimateNodeHeight(node, relations, isExpanded = false) {
  const { rows, hiddenCount } = getOrderedColumnsForNode(node, relations, isExpanded)
  const hasFooter = hiddenCount > 0 || (isExpanded && rows.length > MAX_COLLAPSED_COLS)
  return NODE_HEADER_HEIGHT + rows.length * NODE_ROW_HEIGHT + (hasFooter ? NODE_FOOTER_HEIGHT : 10)
}

/**
 * Smart domain-clustered grid layout so all ~30 Firebase tables appear well-spaced,
 * grouped logically with core entities centered and zero card overlaps.
 */
export function computeSmartLayout(nodes, relations, expandedMap = {}) {
  const laneOrder = ['product', 'quote', 'core', 'sales', 'license', 'workflow', 'system']
  const byGroup = {}
  laneOrder.forEach(g => { byGroup[g] = [] })

  nodes.forEach(node => {
    const g = getTableMeta(node.name).group
    if (!byGroup[g]) byGroup[g] = []
    byGroup[g].push(node)
  })

  // Sort tables inside each lane by number of connections (most connected on top)
  const degreeMap = {}
  relations.forEach(r => {
    degreeMap[r.from] = (degreeMap[r.from] || 0) + 1
    degreeMap[r.to] = (degreeMap[r.to] || 0) + 1
  })

  const positions = {}
  const COL_GAP = 108
  const ROW_GAP = 36
  const START_X = 60
  const START_Y = 70

  // Arrange lanes cleanly into columns; split tall lanes (>4 tables) into 2 sub-columns
  let currentX = START_X

  for (const groupKey of laneOrder) {
    const list = (byGroup[groupKey] || []).sort((a, b) => {
      const degDiff = (degreeMap[b.name] || 0) - (degreeMap[a.name] || 0)
      if (degDiff !== 0) return degDiff
      return a.name.localeCompare(b.name)
    })
    if (list.length === 0) continue

    const maxPerCol = groupKey === 'core' ? 3 : 4
    const numSubCols = Math.ceil(list.length / maxPerCol)

    for (let sc = 0; sc < numSubCols; sc++) {
      const slice = list.slice(sc * maxPerCol, (sc + 1) * maxPerCol)
      let currentY = START_Y
      // Center single-table core column vertically for visual balance
      if (groupKey === 'core' && slice.length === 1) {
        currentY = START_Y + 210
      }

      for (const node of slice) {
        positions[node.name] = { x: currentX, y: currentY }
        const h = estimateNodeHeight(node, relations, Boolean(expandedMap[node.name]))
        currentY += h + ROW_GAP
      }
      currentX += NODE_CARD_WIDTH + COL_GAP
    }
  }

  return positions
}

/**
 * Computes exact anchor point (x, y) & Bezier path for a relation edge.
 */
export function computeEdgeGeometry(rel, positions, nodeMap, relations, expandedMap = {}) {
  const fromPos = positions[rel.from]
  const toPos = positions[rel.to]
  const fromNode = nodeMap[rel.from]
  const toNode = nodeMap[rel.to]
  if (!fromPos || !toPos || !fromNode || !toNode) return null

  const fromCols = getOrderedColumnsForNode(fromNode, relations, Boolean(expandedMap[rel.from])).rows
  const toCols = getOrderedColumnsForNode(toNode, relations, Boolean(expandedMap[rel.to])).rows

  const fromIdx = Math.max(0, fromCols.findIndex(c => c.name === rel.fromField))
  const toIdx = Math.max(0, toCols.findIndex(c => c.name === rel.toField))

  const y1 = fromPos.y + NODE_HEADER_HEIGHT + fromIdx * NODE_ROW_HEIGHT + NODE_ROW_HEIGHT / 2
  const y2 = toPos.y + NODE_HEADER_HEIGHT + toIdx * NODE_ROW_HEIGHT + NODE_ROW_HEIGHT / 2

  const fromCenterX = fromPos.x + NODE_CARD_WIDTH / 2
  const toCenterX = toPos.x + NODE_CARD_WIDTH / 2

  let x1, x2, dir1, dir2
  if (Math.abs(fromCenterX - toCenterX) < NODE_CARD_WIDTH * 0.65) {
    // Stacked vertically in same column -> route smoothly on the right side
    x1 = fromPos.x + NODE_CARD_WIDTH
    x2 = toPos.x + NODE_CARD_WIDTH
    dir1 = 1
    dir2 = 1
  } else if (fromCenterX < toCenterX) {
    x1 = fromPos.x + NODE_CARD_WIDTH
    x2 = toPos.x
    dir1 = 1
    dir2 = -1
  } else {
    x1 = fromPos.x
    x2 = toPos.x + NODE_CARD_WIDTH
    dir1 = -1
    dir2 = 1
  }

  const dx = Math.abs(x2 - x1)
  const curveOffset = Math.max(54, Math.min(180, dx * 0.45 + 32))
  const c1x = x1 + dir1 * curveOffset
  const c2x = x2 + dir2 * curveOffset

  const path = `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`

  // Midpoint of cubic Bezier at t = 0.5
  const midX = 0.125 * x1 + 0.375 * c1x + 0.375 * c2x + 0.125 * x2
  const midY = 0.125 * y1 + 0.375 * y1 + 0.375 * y2 + 0.125 * y2

  // Crow's foot / arrow tips at endpoints
  const fromStubX = x1 + dir1 * 12
  const toStubX = x2 + dir2 * 12

  return {
    x1,
    y1,
    x2,
    y2,
    dir1,
    dir2,
    fromStubX,
    toStubX,
    midX,
    midY,
    path
  }
}

const escapeXml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const truncateText = (str, maxLen) => {
  const s = String(str ?? '')
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s
}

/**
 * Builds a 100% self-contained pure-vector SVG string of the entire visible ERD diagram.
 * Safe for Canvas 2D drawImage (zero <foreignObject>, zero taint, razor-sharp export).
 */
export function buildStandaloneErdSvg({
  nodes,
  relations,
  positions,
  theme = 'dark',
  expandedMap = {},
  showLabels = true
}) {
  const isLight = theme === 'light'
  const palette = isLight
    ? {
        bg: '#eaf2fc',
        gridDot: '#bfdbfe',
        cardBg: '#ffffff',
        cardBorder: '#93c5fd',
        rowAlt: '#f8fbff',
        rowBorder: '#e2ecfb',
        ink: '#0f172a',
        inkSec: '#334155',
        inkMuted: '#64748b',
        edgeSolid: '#2563eb',
        edgeAuto: '#0284c7',
        pillBg: '#ffffff',
        pillBorder: '#93c5fd',
        pillText: '#1d4ed8',
        pkBg: '#fef3c7',
        pkBorder: '#f59e0b',
        pkText: '#b45309',
        fkBg: '#dbeafe',
        fkBorder: '#3b82f6',
        fkText: '#1d4ed8',
        titleBg: '#ffffff',
        titleBorder: '#bfdbfe'
      }
    : {
        bg: '#071124',
        gridDot: '#1e3a5f',
        cardBg: '#0f1e38',
        cardBorder: '#284673',
        rowAlt: '#132544',
        rowBorder: '#1d355a',
        ink: '#f8fafc',
        inkSec: '#cbd5e1',
        inkMuted: '#94a3b8',
        edgeSolid: '#38bdf8',
        edgeAuto: '#60a5fa',
        pillBg: '#0c1830',
        pillBorder: '#38bdf8',
        pillText: '#bae6fd',
        pkBg: 'rgba(245, 158, 11, 0.22)',
        pkBorder: '#fbbf24',
        pkText: '#fde68a',
        fkBg: 'rgba(56, 189, 248, 0.2)',
        fkBorder: '#38bdf8',
        fkText: '#bae6fd',
        titleBg: '#0d1b36',
        titleBorder: '#254370'
      }

  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.name] = n })

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  nodes.forEach(n => {
    const pos = positions[n.name]
    if (!pos) return
    const h = estimateNodeHeight(n, relations, Boolean(expandedMap[n.name]))
    minX = Math.min(minX, pos.x)
    minY = Math.min(minY, pos.y)
    maxX = Math.max(maxX, pos.x + NODE_CARD_WIDTH)
    maxY = Math.max(maxY, pos.y + h)
  })

  if (!Number.isFinite(minX)) {
    minX = 0
    minY = 0
    maxX = 1200
    maxY = 800
  }

  const PAD = 64
  const HEADER_H = 74
  const offsetX = PAD - minX
  const offsetY = PAD + HEADER_H - minY
  const totalW = Math.max(960, Math.round(maxX - minX + PAD * 2))
  const totalH = Math.max(640, Math.round(maxY - minY + PAD * 2 + HEADER_H))

  const now = new Date()
  const stamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const shiftedPositions = {}
  for (const [k, p] of Object.entries(positions)) {
    shiftedPositions[k] = { x: p.x + offsetX, y: p.y + offsetY }
  }

  const edgesSvg = []
  const labelsSvg = []

  for (const rel of relations) {
    const geo = computeEdgeGeometry(rel, shiftedPositions, nodeMap, relations, expandedMap)
    if (!geo) continue
    const stroke = rel.isAutoDetected ? palette.edgeAuto : palette.edgeSolid
    const dash = rel.isAutoDetected ? ' stroke-dasharray="6 5"' : ''
    const isManyFrom = String(rel.cardinality || 'N:1').startsWith('N')

    edgesSvg.push(
      `<path d="${geo.path}" fill="none" stroke="${stroke}" stroke-width="2" stroke-opacity="0.82"${dash} />`
    )
    // Endpoint markers: Crow's foot on N side, perpendicular bar on 1 side
    if (isManyFrom) {
      edgesSvg.push(
        `<line x1="${geo.x1}" y1="${geo.y1}" x2="${geo.fromStubX}" y2="${geo.y1}" stroke="${stroke}" stroke-width="2" />`,
        `<line x1="${geo.fromStubX}" y1="${geo.y1}" x2="${geo.x1}" y2="${geo.y1 - 6}" stroke="${stroke}" stroke-width="1.8" />`,
        `<line x1="${geo.fromStubX}" y1="${geo.y1}" x2="${geo.x1}" y2="${geo.y1 + 6}" stroke="${stroke}" stroke-width="1.8" />`
      )
    } else {
      edgesSvg.push(
        `<line x1="${geo.x1 + geo.dir1 * 7}" y1="${geo.y1 - 6}" x2="${geo.x1 + geo.dir1 * 7}" y2="${geo.y1 + 6}" stroke="${stroke}" stroke-width="2" />`
      )
    }
    edgesSvg.push(
      `<circle cx="${geo.x2}" cy="${geo.y2}" r="3.6" fill="${stroke}" />`,
      `<line x1="${geo.x2 + geo.dir2 * 9}" y1="${geo.y2 - 6}" x2="${geo.x2 + geo.dir2 * 9}" y2="${geo.y2 + 6}" stroke="${stroke}" stroke-width="2" />`
    )

    if (showLabels) {
      const lblText = truncateText(rel.fromField, 22)
      const boxW = Math.max(52, lblText.length * 6.5 + 16)
      labelsSvg.push(
        `<g transform="translate(${geo.midX - boxW / 2}, ${geo.midY - 10})">`,
        `<rect width="${boxW}" height="20" rx="10" fill="${palette.pillBg}" stroke="${palette.pillBorder}" stroke-width="1" />`,
        `<text x="${boxW / 2}" y="13.5" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="700" fill="${palette.pillText}">${escapeXml(lblText)}</text>`,
        `</g>`
      )
    }
  }

  const cardsSvg = []
  for (const node of nodes) {
    const pos = shiftedPositions[node.name]
    if (!pos) continue
    const meta = getTableMeta(node.name)
    const accent = meta.groupInfo.color
    const isExp = Boolean(expandedMap[node.name])
    const { rows, hiddenCount } = getOrderedColumnsForNode(node, relations, isExp)
    const cardH = estimateNodeHeight(node, relations, isExp)
    const countLabel = `${node.rowCount ?? 0} dòng`
    const countW = Math.max(54, countLabel.length * 6.6 + 14)

    cardsSvg.push(`<g transform="translate(${pos.x}, ${pos.y})">`)
    // Card container
    cardsSvg.push(
      `<rect width="${NODE_CARD_WIDTH}" height="${cardH}" rx="12" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.4" />`
    )
    // Colored top header
    cardsSvg.push(
      `<path d="M 12 0 L ${NODE_CARD_WIDTH - 12} 0 Q ${NODE_CARD_WIDTH} 0 ${NODE_CARD_WIDTH} 12 L ${NODE_CARD_WIDTH} ${NODE_HEADER_HEIGHT} L 0 ${NODE_HEADER_HEIGHT} L 0 12 Q 0 0 12 0 Z" fill="${accent}" />`,
      `<text x="12" y="23" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" fill="#ffffff">${escapeXml(truncateText(node.name, 22))}</text>`,
      `<text x="12" y="42" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="11" font-weight="500" fill="rgba(255,255,255,0.88)">${escapeXml(truncateText(meta.title, 30))}</text>`,
      `<rect x="${NODE_CARD_WIDTH - countW - 10}" y="11" width="${countW}" height="20" rx="10" fill="rgba(0,0,0,0.24)" />`,
      `<text x="${NODE_CARD_WIDTH - countW / 2 - 10}" y="24.5" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="10" font-weight="700" fill="#ffffff">${escapeXml(countLabel)}</text>`
    )

    // Column rows
    rows.forEach((col, idx) => {
      const ry = NODE_HEADER_HEIGHT + idx * NODE_ROW_HEIGHT
      if (idx % 2 === 1) {
        cardsSvg.push(
          `<rect x="1" y="${ry}" width="${NODE_CARD_WIDTH - 2}" height="${NODE_ROW_HEIGHT}" fill="${palette.rowAlt}" />`
        )
      }
      cardsSvg.push(
        `<line x1="0" y1="${ry + NODE_ROW_HEIGHT}" x2="${NODE_CARD_WIDTH}" y2="${ry + NODE_ROW_HEIGHT}" stroke="${palette.rowBorder}" stroke-width="1" />`
      )

      let textStartX = 12
      if (col.isPk) {
        cardsSvg.push(
          `<rect x="10" y="${ry + 5}" width="26" height="17" rx="4" fill="${palette.pkBg}" stroke="${palette.pkBorder}" stroke-width="1" />`,
          `<text x="23" y="${ry + 17}" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="9.5" font-weight="800" fill="${palette.pkText}">PK</text>`
        )
        textStartX = 43
      } else if (col.isFk) {
        cardsSvg.push(
          `<rect x="10" y="${ry + 5}" width="26" height="17" rx="4" fill="${palette.fkBg}" stroke="${palette.fkBorder}" stroke-width="1" />`,
          `<text x="23" y="${ry + 17}" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="9.5" font-weight="800" fill="${palette.fkText}">FK</text>`
        )
        textStartX = 43
      }

      const maxChars = textStartX > 20 ? 27 : 32
      cardsSvg.push(
        `<text x="${textStartX}" y="${ry + 17.5}" font-family="Consolas, Menlo, monospace" font-size="11.5" font-weight="${col.isPk || col.isFk ? '700' : '500'}" fill="${col.isPk || col.isFk ? palette.ink : palette.inkSec}">${escapeXml(truncateText(col.name, maxChars))}</text>`
      )
    })

    if (hiddenCount > 0) {
      const fy = NODE_HEADER_HEIGHT + rows.length * NODE_ROW_HEIGHT
      cardsSvg.push(
        `<text x="${NODE_CARD_WIDTH / 2}" y="${fy + 19}" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="11" font-weight="700" fill="${palette.inkMuted}">+ ${hiddenCount} cột khác</text>`
      )
    }

    cardsSvg.push('</g>')
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <defs>
    <pattern id="erd-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${palette.gridDot}" opacity="0.65" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${palette.bg}" />
  <rect width="100%" height="100%" fill="url(#erd-dot-grid)" />

  <!-- Export Title Bar -->
  <g transform="translate(28, 20)">
    <rect width="${totalW - 56}" height="52" rx="12" fill="${palette.titleBg}" stroke="${palette.titleBorder}" stroke-width="1.2" />
    <rect x="14" y="12" width="28" height="28" rx="8" fill="#2563eb" />
    <text x="28" y="30.5" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" fill="#ffffff">DB</text>
    <text x="54" y="26" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="15" font-weight="800" fill="${palette.ink}">SƠ ĐỒ QUAN HỆ CƠ SỞ DỮ LIỆU (FIREBASE ERD)</text>
    <text x="54" y="42" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="600" fill="${palette.inkMuted}">${nodes.length} bảng • ${relations.length} liên kết • Xuất lúc ${escapeXml(stamp)}</text>
  </g>

  <!-- Edges -->
  <g>${edgesSvg.join('')}</g>

  <!-- Entity Cards -->
  <g>${cardsSvg.join('')}</g>

  <!-- Edge Labels -->
  <g>${labelsSvg.join('')}</g>
</svg>`
}

/**
 * Exports the full ERD diagram as a high-resolution PNG image.
 */
export async function exportErdToPng(options) {
  const svgString = buildStandaloneErdSvg(options)
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgEl = doc.documentElement
  const width = Number(svgEl.getAttribute('width')) || 1600
  const height = Number(svgEl.getAttribute('height')) || 1000

  // Compute safe DPR (prefer 2x Retina while staying within browser max canvas dimension 8192px)
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
    const fileName = `Database_ERD_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.png`
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
