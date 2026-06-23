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
    component: Login
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/report',
    name: 'Report',
    component: Report
  },
  {
    path: '/customer',
    name: 'Customer',
    component: Customer
  },
  {
    path: '/baogia',
    name: 'BaoGia',
    component: BaoGia
  },
  {
    path: '/quanlybaogia',
    name: 'QuanLyBaoGia',
    component: QuanLyBaoGia
  },
  {
    path: '/quanlydieukhoan',
    name: 'QuanLyDieuKhoan',
    component: QuanLyDieuKhoan
  },
  {
    path: '/quanlyhanghoa',
    name: 'QuanLyHangHoa',
    component: QuanLyHangHoa
  },
  {
    path: '/po-preview',
    name: 'POPreview',
    component: POPreview
  },
  {
    path: '/tra-cuu-mst',
    name: 'TraCuuMST',
    component: TraCuuMST
  },
  {
    path: '/sale-report',
    name: 'SaleReport',
    component: SaleReport
  },
  {
    path: '/license-old-data',
    name: 'LicenseOldData',
    component: LicenseOldData
  },
  {
    path: '/pipeline',
    name: 'Pipeline',
    component: Pipeline
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

export default router

