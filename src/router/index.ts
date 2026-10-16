import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import ChangePassword from '../components/ChangePassword.vue'
import Report from '../components/report.vue'
import ReportFIREBASE from '../components/Firebase_change/reportFIREBASE.vue'
import POPreview from '../components/POPreview.vue'
import POPreviewFirebase from '../components/POPreviewFirebase.vue'
import TraCuuMST from '../components/TraCuuMST.vue'
import Customer from '../components/Customer.vue'
import CustomerFirebase from '../components/CustomerFirebase.vue'
import BaoGia from '../components/BaoGia.vue'
import BaoGiaFirebase from '../components/baogiaFirebase.vue'
import QuanLyBaoGia from '../components/QuanLyBaoGia.vue'
import QuanLyBaoGiaFirebase from '../components/QuanLyBaoGiaFirebase.vue'
import QuanLyDieuKhoan from '../components/QuanLyDieuKhoan.vue'
import QuanLyDieuKhoanFirebase from '../components/QuanLyDieuKhoanFirebase.vue'
import QuanLyHangHoa from '../components/QuanLyHangHoa.vue'
import QuanLyHangHoaFirebase from '../components/QuanLyHangHoaFirebase.vue'
import SaleReport from '../components/SaleReport.vue'
import SaleReportFirebase from '../components/SaleReportFirebase.vue'
import LicenseOldData from '../components/LicenseOldData.vue'
import Dashboard from '../components/Dashboard.vue'
import DashboardFirebase from '../components/DashboardFirebase.vue'
import Pipeline from '../components/Pipeline.vue'
import PipelineFirebase from '../components/PipelineFirebase.vue'
import LicenseOldDataFirebase from '../components/LicenseOldDataFirebase.vue'
import KhoLuuTru from '../components/KhoLuuTru.vue'
import KhoLuuTruFirebase from '../components/KhoLuuTruFirebase.vue'
import QuanLyFile from '../components/QuanLyFile.vue'
import DatabaseViewer from '../components/DatabaseViewer.vue'

const routes = [
  {
    path: '/',
    redirect: '/report-firebase'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Đăng nhập' }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { title: 'Đổi mật khẩu' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Báo cáo tổng quát' }
  },
  {
    path: '/dashboardfirebase',
    alias: ['/dashboard-firebase'],
    name: 'DashboardFirebase',
    component: DashboardFirebase,
    meta: { title: 'Báo cáo tổng quát Firebase' }
  },
  {
    path: '/report',
    name: 'Report',
    component: Report,
    meta: { title: 'Báo cáo công việc' }
  },
  {
    path: '/report-firebase',
    name: 'ReportFIREBASE',
    component: ReportFIREBASE,
    meta: { title: 'Báo cáo Firebase' }
  },
  {
    path: '/customer',
    name: 'Customer',
    component: Customer,
    meta: { title: 'Khách hàng' }
  },
  {
    path: '/customerfirebase',
    alias: ['/customer-firebase'],
    name: 'CustomerFirebase',
    component: CustomerFirebase,
    meta: { title: 'Khách hàng Firebase' }
  },
  {
    path: '/baogia',
    name: 'BaoGia',
    component: BaoGia,
    meta: { title: 'Tạo Báo giá' }
  },
  {
    path: '/baogiafirebase',
    name: 'BaoGiaFirebase',
    component: BaoGiaFirebase,
    meta: { title: 'Tạo Báo giá Firebase' }
  },
  {
    path: '/quanlybaogia',
    name: 'QuanLyBaoGia',
    component: QuanLyBaoGia,
    meta: { title: 'Quản lý báo giá' }
  },
  {
    path: '/quanlybaogiafirebase',
    alias: ['/quan-ly-bao-gia-firebase'],
    name: 'QuanLyBaoGiaFirebase',
    component: QuanLyBaoGiaFirebase,
    meta: { title: 'Quản lý báo giá Firebase' }
  },
  {
    path: '/quanlydieukhoan',
    name: 'QuanLyDieuKhoan',
    component: QuanLyDieuKhoan,
    meta: { title: 'Quản lý Điều khoản' }
  },
  {
    path: '/quanlydieukhoanfirebase',
    alias: ['/quan-ly-dieu-khoan-firebase'],
    name: 'QuanLyDieuKhoanFirebase',
    component: QuanLyDieuKhoanFirebase,
    meta: { title: 'Quản lý Điều khoản Firebase' }
  },
  {
    path: '/quanlyhanghoa',
    name: 'QuanLyHangHoa',
    component: QuanLyHangHoa,
    meta: { title: 'Quản lý hàng hóa' }
  },
  {
    path: '/quanlyhanghoafirebase',
    alias: ['/quan-ly-hang-hoa-firebase'],
    name: 'QuanLyHangHoaFirebase',
    component: QuanLyHangHoaFirebase,
    meta: { title: 'Quản lý hàng hóa Firebase' }
  },
  {
    path: '/po-preview',
    name: 'POPreview',
    component: POPreview,
    meta: { title: 'Xem PO' }
  },
  {
    path: '/po-preview-firebase',
    alias: ['/popreviewfirebase'],
    name: 'POPreviewFirebase',
    component: POPreviewFirebase,
    meta: { title: 'Xem PO Firebase' }
  },
  {
    path: '/tra-cuu-mst',
    name: 'TraCuuMST',
    component: TraCuuMST,
    meta: { title: 'Tra cứu MST' }
  },
  {
    path: '/sale-report',
    name: 'SaleReport',
    component: SaleReport,
    meta: { title: 'Sale Report' }
  },
  {
    path: '/sale-report-firebase',
    name: 'SaleReportFirebase',
    component: SaleReportFirebase,
    meta: { title: 'Sale Report Firebase' }
  },
  {
    path: '/license-old-data',
    name: 'LicenseOldData',
    component: LicenseOldData,
    meta: { title: 'License Old Data' }
  },
  {
    path: '/license-old-data-firebase',
    name: 'LicenseOldDataFirebase',
    component: LicenseOldDataFirebase,
    meta: { title: 'License Firebase' }
  },
  {
    path: '/pipeline',
    name: 'Pipeline',
    component: Pipeline,
    meta: { title: 'Pipeline' }
  },
  {
    path: '/pipeline-firebase',
    alias: ['/pipelinefirebase'],
    name: 'PipelineFirebase',
    component: PipelineFirebase,
    meta: { title: 'Pipeline Firebase' }
  },
  {
    path: '/kho-luu-tru',
    name: 'KhoLuuTru',
    component: KhoLuuTru,
    meta: { title: 'Kho Lưu Trữ' }
  },
  {
    path: '/kho-luu-tru-firebase',
    alias: ['/kholuutrufirebase'],
    name: 'KhoLuuTruFirebase',
    component: KhoLuuTruFirebase,
    meta: { title: 'Kho Lưu Trữ Firebase' }
  },
  {
    path: '/quan-ly-file',
    name: 'QuanLyFile',
    component: QuanLyFile,
    meta: { title: 'Quản lý File' }
  },
  {
    path: '/database-viewer',
    name: 'DatabaseViewer',
    component: DatabaseViewer,
    meta: { title: 'Xem Database' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
    return
  }
  
  const tokenLocal = localStorage.getItem('auth_token')
  const tokenSession = sessionStorage.getItem('auth_token')
  
  if (tokenLocal || tokenSession) {
    next()
  } else {
    next('/login')
  }
})

router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title as string
  } else {
    document.title = 'Reminder'
  }
})

export default router
