import { createRouter, createWebHistory } from 'vue-router'
import Report from '../components/report.vue'
import POPreview from '../components/POPreview.vue'
import TraCuuMST from '../components/TraCuuMST.vue'
import Customer from '../components/Customer.vue'
import BaoGia from '../components/BaoGia.vue'
import QuanLyBaoGia from '../components/QuanLyBaoGia.vue'
import QuanLyDieuKhoan from '../components/QuanLyDieuKhoan.vue'
import QuanLyHangHoa from '../components/QuanLyHangHoa.vue'
import SaleReport from '../components/SaleReport.vue'

const routes = [
  {
    path: '/',
    redirect: '/report'
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

