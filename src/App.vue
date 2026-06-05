<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <aside class="sidebar">
      <div class="logo">
        <div v-if="isSidebarOpen" style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
          <div style="flex-shrink: 0; width: 42px; height: 42px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(16,185,129,0.3); box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <img :src="'/avatar.jpg'" @error="$event.target.src='https://ui-avatars.com/api/?name=Lê+Phi+Sơn&background=047857&color=fff&bold=true'" alt="Lê Phi Sơn" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="display: flex; flex-direction: column; justify-content: center;">
            <h2 style="margin: 0; color: #f8fafc; font-size: 15px; font-weight: 700; letter-spacing: 0;">Lê Phi Sơn</h2>
            <span style="color: #10b981; font-size: 12px; font-weight: 600;">Phó giám đốc NTS</span>
          </div>
        </div>
        <button class="toggle-btn" @click="isSidebarOpen = !isSidebarOpen">
          <svg v-if="isSidebarOpen" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item" title="Báo cáo tổng quát">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span v-if="isSidebarOpen">Báo cáo tổng quát</span>
        </router-link>
        <router-link to="/report" class="nav-item" title="Báo cáo công việc">
          <div style="position: relative; display: inline-flex;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <div v-if="incompleteTasksCount > 0" class="task-badge">{{ incompleteTasksCount > 99 ? '99+' : incompleteTasksCount }}</div>
          </div>
          <div v-if="isSidebarOpen" class="nav-text-container" style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
            <span style="white-space: nowrap;">Báo cáo công việc</span>
            <div v-if="incompleteTasksCount > 0" class="task-badge-inline">{{ incompleteTasksCount > 99 ? '99+' : incompleteTasksCount }}</div>
          </div>
        </router-link>
        <router-link to="/customer" class="nav-item hide-on-mobile" title="Khách hàng">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span v-if="isSidebarOpen">Khách hàng</span>
        </router-link>
        <router-link to="/baogia" class="nav-item hide-on-mobile" title="Tạo Báo giá">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span v-if="isSidebarOpen">Tạo Báo giá</span>
        </router-link>
        <router-link to="/quanlybaogia" class="nav-item hide-on-mobile" title="Quản lý báo giá">
          <div style="position: relative; display: inline-flex;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <div class="task-badge" style="font-size: 12px; font-weight: 900;">!</div>
          </div>
          <div v-if="isSidebarOpen" class="nav-text-container" style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
            <span style="white-space: nowrap;">Quản lý báo giá</span>
            <div class="task-badge-inline" style="font-size: 14px; font-weight: 900; background: #ef4444;">!</div>
          </div>
        </router-link>
        <router-link to="/quanlydieukhoan" class="nav-item hide-on-mobile" title="Quản lý Điều khoản">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
          <span v-if="isSidebarOpen">Quản lý Điều khoản</span>
        </router-link>
        <router-link to="/quanlyhanghoa" class="nav-item hide-on-mobile" title="Quản lý hàng hóa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <span v-if="isSidebarOpen">Quản lý hàng hóa</span>
        </router-link>
        <router-link to="/po-preview" class="nav-item hide-on-mobile" title="Xem PO">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span v-if="isSidebarOpen">Xem PO</span>
        </router-link>
        <router-link to="/tra-cuu-mst" class="nav-item hide-on-mobile" title="Tra cứu MST">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span v-if="isSidebarOpen">Tra cứu MST</span>
        </router-link>
        <router-link to="/sale-report" class="nav-item hide-on-mobile" title="Sale Report">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <span v-if="isSidebarOpen">Sale Report</span>
        </router-link>
        <router-link to="/license-old-data" class="nav-item hide-on-mobile" title="License Old Data">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span v-if="isSidebarOpen">License Old Data</span>
        </router-link>
        <a href="#" class="nav-item mobile-only" title="Menu" @click.prevent="isMobileDrawerOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <span v-if="isSidebarOpen">Menu</span>
        </a>
      </nav>
    </aside>
    <main class="main-content" ref="mainContentRef" @scroll="handleScroll">
      <router-view v-slot="{ Component }">
        <keep-alive include="BaoGia">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>

    <!-- Scroll to Top Button -->
    <button 
      class="scroll-to-top" 
      :class="{ 'show': showScrollTop }"
      @click="scrollToTop"
      title="Lên đầu trang"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
    </button>

    <!-- Mobile Drawer Overlay -->
    <div class="mobile-drawer-overlay" v-if="isMobileDrawerOpen" @click="isMobileDrawerOpen = false"></div>
    
    <!-- Mobile Drawer -->
    <div class="mobile-drawer" :class="{ 'open': isMobileDrawerOpen }">
      <div class="drawer-header">
        <h3 style="margin:0; font-size: 18px; color: #f8fafc;">Menu</h3>
        <button class="toggle-btn" @click="isMobileDrawerOpen = false" style="margin:0;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="drawer-content">
        <router-link to="/customer" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>Khách hàng</span>
        </router-link>
        <router-link to="/baogia" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Tạo Báo giá</span>
        </router-link>
        <router-link to="/quanlybaogia" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          <span>Quản lý báo giá</span>
        </router-link>
        <router-link to="/quanlydieukhoan" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
          <span>Quản lý Điều khoản</span>
        </router-link>
        <router-link to="/quanlyhanghoa" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <span>Quản lý hàng hóa</span>
        </router-link>
        <router-link to="/po-preview" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Xem PO</span>
        </router-link>
        <router-link to="/tra-cuu-mst" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Tra cứu MST</span>
        </router-link>
        <router-link to="/sale-report" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <span>Sale Report</span>
        </router-link>
        <router-link to="/license-old-data" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>License Old Data</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isSidebarOpen = ref(true)
const mainContentRef = ref(null)
const showScrollTop = ref(false)
const isMobileDrawerOpen = ref(false)

const incompleteTasksCount = ref(0)
const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const fetchIncompleteTasks = async () => {
  try {
    const response = await fetch(`${API_URL}?action=get`);
    const result = await response.json();
    if (result.status === 'success') {
      const reports = result.data;
      incompleteTasksCount.value = reports.filter(r => r.trang_thai === 'Chưa xử lý').length;
    }
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
}

const handleScroll = (e) => {
  if (e.target) {
    showScrollTop.value = e.target.scrollTop > 300
  }
}

const handleWindowScroll = () => {
  if (window.scrollY > 300) {
    showScrollTop.value = true
  } else if (!mainContentRef.value || mainContentRef.value.scrollTop <= 300) {
    showScrollTop.value = false
  }
}

const scrollToTop = () => {
  if (mainContentRef.value) {
    mainContentRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll)
  fetchIncompleteTasks()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleWindowScroll)
})
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 45px;
  height: 45px;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.4);
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 900;
}

.scroll-to-top.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.scroll-to-top:hover {
  filter: brightness(1.1);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.5);
}

.scroll-to-top:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .scroll-to-top {
    bottom: 80px;
    right: 20px;
    width: 40px;
    height: 40px;
  }
  .scroll-to-top svg {
    width: 20px;
    height: 20px;
  }
}

/* Mobile Drawer Styles */
.mobile-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 10000;
  backdrop-filter: blur(2px);
}
.mobile-drawer {
  position: fixed;
  top: 0;
  right: -300px;
  width: 260px;
  height: 100vh;
  background: #0d1b2a;
  z-index: 10001;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0,0,0,0.5);
}
.mobile-drawer.open {
  right: 0;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drawer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px !important;
  text-decoration: none;
  color: #94a3b8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-direction: row !important;
  justify-content: flex-start !important;
  text-align: left !important;
}
.drawer-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}
.drawer-item.router-link-active {
  background: linear-gradient(90deg, #185a59, #113f3e);
  color: #ffffff;
}
.drawer-item svg {
  width: 20px !important;
  height: 20px !important;
  flex-shrink: 0;
}
.drawer-item span {
  display: inline !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

.task-badge {
  display: none;
  position: absolute;
  top: -8px;
  right: -14px;
  background-color: #ef4444;
  color: white;
  border-radius: 20px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: 800;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px #0d1b2a;
}

.app-layout.sidebar-collapsed .task-badge {
  display: inline-flex;
}
.task-badge-inline {
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  padding: 0;
  font-size: 12px;
  font-weight: 800;
  margin-left: 8px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
}

@media (max-width: 768px) {
  .nav-text-container {
    justify-content: center !important;
    gap: 4px;
  }
  .task-badge-inline {
    display: none !important;
  }
  .task-badge {
    display: inline-flex;
    top: -8px;
    right: -16px;
  }
}
</style>
