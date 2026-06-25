import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import ChangePassword from '../components/ChangePassword.vue'
import Report from '../components/report.vue'
import POPreview from '../components/POPreview.vue'
import TraCuuMST from '../components/TraCuuMST.vue'
import Customer from '../components/Customer.vue'
import BaoGia from '../components/BaoGia.vue'
import QuanLyBaoGia from '../components/QuanLyBaoGia.vue'
import QuanLyDieuKhoan from '../components/QuanLyDieuKhoan.vue'
import QuanLyHangHoa from '../components/QuanLyHangHoa.vue'
import SaleReport from '../components/SaleReport.vue'
import LicenseOldData from '../components/LicenseOldData.vue'
import Dashboard from '../components/Dashboard.vue'
import Pipeline from '../components/Pipeline.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
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
    path: '/report',
    name: 'Report',
    component: Report,
    meta: { title: 'Báo cáo công việc' }
  },
  {
    path: '/customer',
    name: 'Customer',
    component: Customer,
    meta: { title: 'Khách hàng' }
  },
  {
    path: '/baogia',
    name: 'BaoGia',
    component: BaoGia,
    meta: { title: 'Tạo Báo giá' }
  },
  {
    path: '/quanlybaogia',
    name: 'QuanLyBaoGia',
    component: QuanLyBaoGia,
    meta: { title: 'Quản lý báo giá' }
  },
  {
    path: '/quanlydieukhoan',
    name: 'QuanLyDieuKhoan',
    component: QuanLyDieuKhoan,
    meta: { title: 'Quản lý Điều khoản' }
  },
  {
    path: '/quanlyhanghoa',
    name: 'QuanLyHangHoa',
    component: QuanLyHangHoa,
    meta: { title: 'Quản lý hàng hóa' }
  },
  {
    path: '/po-preview',
    name: 'POPreview',
    component: POPreview,
    meta: { title: 'Xem PO' }
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
    path: '/license-old-data',
    name: 'LicenseOldData',
    component: LicenseOldData,
    meta: { title: 'License Old Data' }
  },
  {
    path: '/pipeline',
    name: 'Pipeline',
    component: Pipeline,
    meta: { title: 'Pipeline' }
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
