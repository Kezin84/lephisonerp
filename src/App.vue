<template>
  <div v-if="isLoginRoute">
    <router-view />
  </div>
  <div v-else class="app-layout" :class="{ 'sidebar-collapsed': !isSidebarOpen, 'mobile-nav-hidden': isMobileNavHidden && !isMobileDrawerOpen }">
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
        <template v-if="showAppscript">
        <div class="nav-section-title clickable hide-on-mobile" v-if="isSidebarOpen" @click="isAppscriptOpen = !isAppscriptOpen">
          <span>Appscript</span>
          <svg :style="{ transform: isAppscriptOpen ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="nav-section-divider hide-on-mobile" v-else></div>
        
        <div v-show="isAppscriptOpen || !isSidebarOpen" class="nav-group-items">
        <router-link to="/dashboard" class="nav-item" title="Báo cáo tổng quát">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span class="nav-text">Báo cáo tổng quát</span>
        </router-link>
        <router-link to="/report" class="nav-item" title="Báo cáo công việc">
          <div style="position: relative; display: inline-flex;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <div v-if="incompleteTasksCount > 0" class="task-badge">{{ incompleteTasksCount > 99 ? '99+' : incompleteTasksCount }}</div>
          </div>
          <div class="nav-text-container" style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
            <span style="white-space: nowrap;">Báo cáo công việc</span>
            <div v-if="incompleteTasksCount > 0" class="task-badge-inline">{{ incompleteTasksCount > 99 ? '99+' : incompleteTasksCount }}</div>
          </div>
        </router-link>
        <router-link to="/customer" class="nav-item hide-on-mobile" title="Khách hàng">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span class="nav-text">Khách hàng</span>
        </router-link>
        <router-link to="/baogia" class="nav-item hide-on-mobile" title="Tạo Báo giá">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="nav-text">Tạo Báo giá</span>
        </router-link>
        <router-link to="/quanlybaogia" class="nav-item hide-on-mobile" title="Quản lý báo giá">
          <div style="position: relative; display: inline-flex;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <div class="task-badge" style="font-size: 12px; font-weight: 900;">!</div>
          </div>
          <div class="nav-text-container" style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
            <span style="white-space: nowrap;">Quản lý báo giá</span>
            <div class="task-badge-inline" style="font-size: 14px; font-weight: 900; background: #ef4444;">!</div>
          </div>
        </router-link>
        <router-link to="/quanlydieukhoan" class="nav-item hide-on-mobile" title="Quản lý Điều khoản">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
          <span class="nav-text">Quản lý Điều khoản</span>
        </router-link>
        <router-link to="/quanlyhanghoa" class="nav-item hide-on-mobile" title="Quản lý hàng hóa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <span class="nav-text">Quản lý hàng hóa</span>
        </router-link>
        <router-link to="/po-preview" class="nav-item hide-on-mobile" title="Xem PO">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="nav-text">Xem PO</span>
        </router-link>
        <router-link to="/tra-cuu-mst" class="nav-item hide-on-mobile" title="Tra cứu MST">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span class="nav-text">Tra cứu MST</span>
        </router-link>
        <router-link to="/sale-report" class="nav-item hide-on-mobile" title="Sale Report">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <span class="nav-text">Sale Report</span>
        </router-link>
        <router-link to="/license-old-data" class="nav-item hide-on-mobile" title="License Old Data">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="nav-text">License Old Data</span>
        </router-link>
        <router-link to="/pipeline" class="nav-item hide-on-mobile" title="Pipeline">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          <span class="nav-text">Pipeline</span>
        </router-link>
        <router-link to="/kho-luu-tru" class="nav-item hide-on-mobile" title="Kho lưu trữ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          <span class="nav-text">Kho lưu trữ</span>
        </router-link>
        </div>
        </template>

        <div class="nav-section-divider hide-on-mobile" v-if="showAppscript && !isSidebarOpen" style="margin-top: 10px;"></div>

        <!-- NHÓM 1: TỔNG QUAN & BÁO CÁO -->
        <div class="nav-group-block">
          <div
            class="nav-section-title clickable hide-on-mobile"
            :class="{ 'has-active-child': isGroupActive('overview') && !openGroups.overview }"
            v-if="isSidebarOpen"
            @click="toggleGroup('overview')"
          >
            <span>Tổng quan & Báo cáo</span>
            <svg :style="{ transform: openGroups.overview ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="nav-group-items" :class="{ 'group-collapsed': !openGroups.overview && isSidebarOpen }">
            <router-link to="/dashboardfirebase" class="nav-item hide-on-mobile" title="Báo cáo tổng quát">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span class="nav-text">Báo cáo tổng quát</span>
            </router-link>
            <router-link to="/report-firebase" class="nav-item" title="Báo cáo công việc">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span class="nav-text">Báo cáo công việc</span>
            </router-link>
            <router-link to="/sale-report-firebase" class="nav-item hide-on-mobile" title="Sale Report">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <span class="nav-text">Sale Report</span>
            </router-link>
          </div>
        </div>

        <!-- NHÓM 2: BÁO GIÁ & ĐƠN HÀNG -->
        <div class="nav-group-block">
          <div
            class="nav-section-title clickable hide-on-mobile"
            :class="{ 'has-active-child': isGroupActive('sales') && !openGroups.sales }"
            v-if="isSidebarOpen"
            @click="toggleGroup('sales')"
          >
            <span>Báo giá & Đơn hàng</span>
            <svg :style="{ transform: openGroups.sales ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="nav-section-divider hide-on-mobile" v-else></div>
          <div class="nav-group-items" :class="{ 'group-collapsed': !openGroups.sales && isSidebarOpen }">
            <router-link to="/baogiafirebase" class="nav-item" title="Tạo báo giá">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              <span class="nav-text">Tạo báo giá</span>
            </router-link>
            <router-link to="/quanlybaogiafirebase" class="nav-item hide-on-mobile" title="Quản lý báo giá">
              <div style="position: relative; display: inline-flex;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                <div class="task-badge" style="font-size: 11px; font-weight: 900;">!</div>
              </div>
              <div class="nav-text-container" style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
                <span style="white-space: nowrap;">Quản lý báo giá</span>
                <div class="task-badge-inline" style="font-size: 12px; font-weight: 900; background: #ef4444;">!</div>
              </div>
            </router-link>
            <router-link to="/pipeline-firebase" class="nav-item hide-on-mobile" title="Pipeline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              <span class="nav-text">Pipeline</span>
            </router-link>
            <router-link to="/po-preview-firebase" class="nav-item hide-on-mobile" title="Xem PO">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span class="nav-text">Xem PO</span>
            </router-link>
          </div>
        </div>

        <!-- NHÓM 3: KHÁCH HÀNG & SẢN PHẨM -->
        <div class="nav-group-block hide-on-mobile">
          <div
            class="nav-section-title clickable hide-on-mobile"
            :class="{ 'has-active-child': isGroupActive('catalog') && !openGroups.catalog }"
            v-if="isSidebarOpen"
            @click="toggleGroup('catalog')"
          >
            <span>Khách hàng & Sản phẩm</span>
            <svg :style="{ transform: openGroups.catalog ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="nav-section-divider hide-on-mobile" v-else></div>
          <div class="nav-group-items" :class="{ 'group-collapsed': !openGroups.catalog && isSidebarOpen }">
            <router-link to="/customerfirebase" class="nav-item hide-on-mobile" title="Khách hàng">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span class="nav-text">Khách hàng</span>
            </router-link>
            <router-link to="/quanlyhanghoafirebase" class="nav-item hide-on-mobile" title="Quản lý hàng hóa">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              <span class="nav-text">Quản lý hàng hóa</span>
            </router-link>
            <router-link to="/license-old-data-firebase" class="nav-item hide-on-mobile" title="License">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span class="nav-text">License</span>
            </router-link>
          </div>
        </div>

        <!-- NHÓM 4: TÀI LIỆU & BIỂU MẪU -->
        <div class="nav-group-block hide-on-mobile">
          <div
            class="nav-section-title clickable hide-on-mobile"
            :class="{ 'has-active-child': isGroupActive('documents') && !openGroups.documents }"
            v-if="isSidebarOpen"
            @click="toggleGroup('documents')"
          >
            <span>Tài liệu & Biểu mẫu</span>
            <svg :style="{ transform: openGroups.documents ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="nav-section-divider hide-on-mobile" v-else></div>
          <div class="nav-group-items" :class="{ 'group-collapsed': !openGroups.documents && isSidebarOpen }">
            <router-link to="/quanlydieukhoanfirebase" class="nav-item hide-on-mobile" title="Quản lý Điều khoản">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
              <span class="nav-text">Quản lý Điều khoản</span>
            </router-link>
            <router-link to="/mau-in-firebase" class="nav-item hide-on-mobile" title="Thiết lập Mẫu In">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span class="nav-text">Thiết lập Mẫu In</span>
            </router-link>
            <router-link to="/kho-luu-tru-firebase" class="nav-item hide-on-mobile" title="Kho lưu trữ">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span class="nav-text">Kho lưu trữ</span>
            </router-link>
            <router-link to="/quan-ly-file" class="nav-item hide-on-mobile" title="Quản lý File">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              <span class="nav-text">Quản lý File</span>
            </router-link>
          </div>
        </div>

        <!-- NHÓM 5: HỆ THỐNG & CẤU HÌNH -->
        <div class="nav-group-block hide-on-mobile">
          <div
            class="nav-section-title clickable hide-on-mobile"
            :class="{ 'has-active-child': isGroupActive('system') && !openGroups.system }"
            v-if="isSidebarOpen"
            @click="toggleGroup('system')"
          >
            <span>Hệ thống & Cấu hình</span>
            <svg :style="{ transform: openGroups.system ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="nav-section-divider hide-on-mobile" v-else></div>
          <div class="nav-group-items" :class="{ 'group-collapsed': !openGroups.system && isSidebarOpen }">
            <router-link to="/database-viewer" class="nav-item hide-on-mobile" title="Xem Database">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              <span class="nav-text">Xem Database</span>
            </router-link>
            <router-link to="/zalo-bot-config" class="nav-item hide-on-mobile" title="Cấu hình Zalo Bot">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span class="nav-text">Cấu hình Zalo Bot</span>
            </router-link>
          </div>
        </div>

        <a href="#" class="nav-item mobile-only" :class="{ 'router-link-active': isMobileDrawerOpen || isMobileMenuRouteActive }" title="Menu" @click.prevent="isMobileDrawerOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <span class="nav-text">Menu</span>
        </a>
      </nav>

      <!-- FOOTER CỐ ĐỊNH Ở ĐÁY SIDEBAR -->
      <div class="sidebar-footer hide-on-mobile">
        <router-link to="/change-password" class="footer-action-btn" title="Đổi mật khẩu">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span v-if="isSidebarOpen">Đổi mật khẩu</span>
        </router-link>
        <a href="#" class="footer-action-btn logout-btn" title="Đăng xuất" @click.prevent="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span v-if="isSidebarOpen">Đăng xuất</span>
        </a>
      </div>
    </aside>
    <main class="main-content" ref="mainContentRef" @scroll="handleScroll">
      <router-view v-slot="{ Component, route }">
        <keep-alive include="BaoGia,BaoGiaFirebase,report,Report,ReportFIREBASE,Pipeline,PipelineFirebase,KhoLuuTru,KhoLuuTruFirebase">
          <component :is="Component" :key="route.fullPath" />
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
        <template v-if="showAppscript">
        <div class="drawer-section-title clickable" @click="isAppscriptOpen = !isAppscriptOpen">
          <span>Appscript</span>
          <svg :style="{ transform: isAppscriptOpen ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div v-show="isAppscriptOpen" class="drawer-group-items">
        <router-link to="/customer" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>Khách hàng</span>
        </router-link>
        <router-link to="/license-old-data" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>License Old Data</span>
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

        <router-link to="/pipeline" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          <span>Pipeline</span>
        </router-link>
        <router-link to="/kho-luu-tru" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          <span>Kho lưu trữ</span>
        </router-link>
        </div>
        </template>

        <!-- NHÓM 1: TỔNG QUAN & BÁO CÁO (MOBILE DRAWER) -->
        <div class="drawer-section-title clickable" @click="toggleGroup('overview')">
          <span>Tổng quan & Báo cáo</span>
          <svg :style="{ transform: openGroups.overview ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div v-show="openGroups.overview" class="drawer-group-items">
          <router-link to="/dashboardfirebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Báo cáo tổng quát</span>
          </router-link>
          <router-link to="/report-firebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Báo cáo công việc</span>
          </router-link>
          <router-link to="/sale-report-firebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <span>Sale Report</span>
          </router-link>
        </div>

        <!-- NHÓM 2: BÁO GIÁ & ĐƠN HÀNG (MOBILE DRAWER) -->
        <div class="drawer-section-title clickable" @click="toggleGroup('sales')">
          <span>Báo giá & Đơn hàng</span>
          <svg :style="{ transform: openGroups.sales ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div v-show="openGroups.sales" class="drawer-group-items">
          <router-link to="/baogiafirebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            <span>Tạo báo giá</span>
          </router-link>
          <router-link to="/quanlybaogiafirebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <span>Quản lý báo giá</span>
          </router-link>
          <router-link to="/pipeline-firebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            <span>Pipeline</span>
          </router-link>
          <router-link to="/po-preview-firebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Xem PO</span>
          </router-link>
        </div>

        <!-- NHÓM 3: KHÁCH HÀNG & SẢN PHẨM (MOBILE DRAWER) -->
        <div class="drawer-section-title clickable" @click="toggleGroup('catalog')">
          <span>Khách hàng & Sản phẩm</span>
          <svg :style="{ transform: openGroups.catalog ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div v-show="openGroups.catalog" class="drawer-group-items">
          <router-link to="/customerfirebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Khách hàng</span>
          </router-link>
          <router-link to="/quanlyhanghoafirebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            <span>Quản lý hàng hóa</span>
          </router-link>
          <router-link to="/license-old-data-firebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>License</span>
          </router-link>
        </div>

        <!-- NHÓM 4: TÀI LIỆU & BIỂU MẪU (MOBILE DRAWER) -->
        <div class="drawer-section-title clickable" @click="toggleGroup('documents')">
          <span>Tài liệu & Biểu mẫu</span>
          <svg :style="{ transform: openGroups.documents ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div v-show="openGroups.documents" class="drawer-group-items">
          <router-link to="/quanlydieukhoanfirebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
            <span>Quản lý Điều khoản</span>
          </router-link>
          <router-link to="/mau-in-firebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Thiết lập Mẫu In</span>
          </router-link>
          <router-link to="/kho-luu-tru-firebase" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span>Kho lưu trữ</span>
          </router-link>
          <router-link to="/quan-ly-file" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            <span>Quản lý File</span>
          </router-link>
        </div>

        <!-- NHÓM 5: HỆ THỐNG & CẤU HÌNH (MOBILE DRAWER) -->
        <div class="drawer-section-title clickable" @click="toggleGroup('system')">
          <span>Hệ thống & Cấu hình</span>
          <svg :style="{ transform: openGroups.system ? 'rotate(180deg)' : 'rotate(0)' }" class="nav-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div v-show="openGroups.system" class="drawer-group-items">
          <router-link to="/database-viewer" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
            <span>Xem Database</span>
          </router-link>
          <router-link to="/zalo-bot-config" class="drawer-item" @click="isMobileDrawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span>Cấu hình Zalo Bot</span>
          </router-link>
        </div>

        <div class="drawer-divider"></div>
        <router-link to="/change-password" class="drawer-item" @click="isMobileDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>Đổi mật khẩu</span>
        </router-link>
        <a v-if="!isStandaloneMode" href="#" class="drawer-item ios-guide-drawer-btn" @click.prevent="openIosInstallGuide">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
          <span>Cài App SONAI ra màn hình chính</span>
        </a>
        <a href="#" class="drawer-item logout-drawer-btn" @click.prevent="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Đăng xuất</span>
        </a>
      </div>
    </div>

    <!-- iOS Safari PWA Install Banner -->
    <div v-if="showIosInstallPrompt" class="ios-install-banner">
      <img src="/apple-touch-icon.png" alt="SONAI" class="ios-install-icon" />
      <div class="ios-install-text">
        <div class="ios-install-title">Cài đặt WebApp SONAI trên iPhone</div>
        <div class="ios-install-desc">
          Bấm nút Chia sẻ
          <span class="ios-share-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
          </span>
          trên Safari rồi chọn <strong>"Thêm vào MH chính"</strong>
        </div>
      </div>
      <button class="ios-install-close" @click="dismissIosInstallPrompt" title="Đóng">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initZaloBotBackgroundService } from './utils/zaloBotService'

const route = useRoute()
const router = useRouter()
const isLoginRoute = computed(() => route.path === '/login')

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  sessionStorage.removeItem('auth_token')
  isMobileDrawerOpen.value = false
  router.push('/login')
}

const isSidebarOpen = ref(true)
const isAppscriptOpen = ref(true)
const isFirebaseOpen = ref(true)
const showAppscript = ref(false)
const mainContentRef = ref(null)
const showScrollTop = ref(false)
const isMobileDrawerOpen = ref(false)
const isMobileNavHidden = ref(false)
const showIosInstallPrompt = ref(false)
const isStandaloneMode = ref(false)

const isMobileMenuRouteActive = computed(() => {
  const directMobileRoutes = ['/report-firebase', '/baogiafirebase', '/dashboard', '/report']
  return !directMobileRoutes.includes(route.path)
})

const GROUP_ROUTES = {
  overview: ['/dashboardfirebase', '/report-firebase', '/sale-report-firebase'],
  sales: ['/baogiafirebase', '/quanlybaogiafirebase', '/pipeline-firebase', '/po-preview-firebase'],
  catalog: ['/customerfirebase', '/quanlyhanghoafirebase', '/license-old-data-firebase'],
  documents: ['/quanlydieukhoanfirebase', '/mau-in-firebase', '/kho-luu-tru-firebase', '/quan-ly-file'],
  system: ['/database-viewer', '/zalo-bot-config']
}

const loadSavedSidebarGroups = () => {
  try {
    const saved = localStorage.getItem('sonai_sidebar_groups_v1')
    if (saved) {
      return {
        overview: true,
        sales: true,
        catalog: false,
        documents: false,
        system: false,
        ...JSON.parse(saved)
      }
    }
  } catch (e) {}
  return {
    overview: true,
    sales: true,
    catalog: false,
    documents: false,
    system: false
  }
}

const openGroups = reactive(loadSavedSidebarGroups())

const saveSidebarGroups = () => {
  try {
    localStorage.setItem('sonai_sidebar_groups_v1', JSON.stringify(openGroups))
  } catch (e) {}
}

const toggleGroup = (key) => {
  openGroups[key] = !openGroups[key]
  saveSidebarGroups()
}

const isGroupActive = (key) => {
  const paths = GROUP_ROUTES[key] || []
  return paths.some(p => route.path === p || route.path.startsWith(p + '/'))
}

const EXCLUDED_SCROLL_SELECTORS =
  '.modal, .vip-modal-overlay, .load-invoice-modal-overlay, .modal-overlay, .pipeline-modal-overlay, .mobile-drawer, .sidebar'

const scrolledTargets = new Set()
let activeScrollTarget = null
let isScrollingToTop = false
let scrollToTopTimer = null

watch(
  () => route.path,
  (newPath) => {
    isMobileNavHidden.value = false
    showScrollTop.value = false
    activeScrollTarget = null
    scrolledTargets.clear()
    for (const [key, paths] of Object.entries(GROUP_ROUTES)) {
      if (paths.some(p => newPath === p || newPath.startsWith(p + '/'))) {
        if (!openGroups[key]) {
          openGroups[key] = true
          saveSidebarGroups()
        }
        break
      }
    }
  },
  { immediate: true }
)

const checkIosInstallPrompt = () => {
  if (typeof window === 'undefined') return
  const standalone =
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  isStandaloneMode.value = standalone
  if (standalone) {
    showIosInstallPrompt.value = false
    return
  }
  const ua = window.navigator.userAgent || ''
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const dismissed = localStorage.getItem('sonai_ios_install_dismissed') === '1'
  if (isIos && !dismissed) {
    showIosInstallPrompt.value = true
  }
}

const dismissIosInstallPrompt = () => {
  showIosInstallPrompt.value = false
  localStorage.setItem('sonai_ios_install_dismissed', '1')
}

const openIosInstallGuide = () => {
  isMobileDrawerOpen.value = false
  localStorage.removeItem('sonai_ios_install_dismissed')
  showIosInstallPrompt.value = true
}

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

let lastScrollMap = new WeakMap()
let lastWindowScrollY = 0

const updateMobileNavByScroll = (currentScrollTop, prevScrollTop) => {
  if (typeof window === 'undefined' || window.innerWidth > 768) {
    if (isMobileNavHidden.value) isMobileNavHidden.value = false
    return
  }
  const delta = currentScrollTop - prevScrollTop
  if (currentScrollTop <= 36) {
    isMobileNavHidden.value = false
  } else if (delta > 10 && currentScrollTop > 64) {
    isMobileNavHidden.value = true
  } else if (delta < -8) {
    isMobileNavHidden.value = false
  }
}

const computeShouldShowScrollTop = () => {
  if (typeof window === 'undefined') return false
  if ((window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0) > 300) {
    return true
  }
  if (mainContentRef.value && mainContentRef.value.scrollTop > 300) {
    return true
  }
  for (const el of Array.from(scrolledTargets)) {
    if (!el || !el.isConnected) {
      scrolledTargets.delete(el)
      continue
    }
    if (el.clientHeight <= 0) continue
    if (el.scrollTop <= 0) {
      scrolledTargets.delete(el)
      continue
    }
    if (el.scrollTop > 300) return true
  }
  return false
}

const clearScrollingToTopGuard = () => {
  isScrollingToTop = false
  if (scrollToTopTimer) {
    clearTimeout(scrollToTopTimer)
    scrollToTopTimer = null
  }
}

const handleGlobalClickSyncScrollTop = (e) => {
  if (!showScrollTop.value) return
  if (e?.target instanceof Element && e.target.closest('.scroll-to-top')) return
  requestAnimationFrame(() => {
    if (showScrollTop.value && !isScrollingToTop) {
      showScrollTop.value = computeShouldShowScrollTop()
    }
  })
}

const handleScroll = (e) => {
  if (e.target instanceof HTMLElement) {
    if (e.target.scrollTop > 0) {
      scrolledTargets.add(e.target)
    } else {
      scrolledTargets.delete(e.target)
    }
    if (!isScrollingToTop) {
      showScrollTop.value = computeShouldShowScrollTop()
    }
  }
}

const handleGlobalScrollCapture = (e) => {
  const target = e.target
  if (
    target === window ||
    target === document ||
    target === document.documentElement ||
    target === document.body
  ) {
    const curY = window.scrollY || document.documentElement.scrollTop || 0
    if (!isScrollingToTop) {
      showScrollTop.value = computeShouldShowScrollTop()
    }
    updateMobileNavByScroll(curY, lastWindowScrollY)
    lastWindowScrollY = curY
    return
  }

  if (target instanceof HTMLElement) {
    if (target.closest(EXCLUDED_SCROLL_SELECTORS)) {
      return
    }
    if (target.clientHeight < 160) return
    const curY = target.scrollTop || 0
    const hasPrev = lastScrollMap.has(target)
    const prevY = hasPrev ? lastScrollMap.get(target) : curY

    // Bo qua su kien cuon ngang thuan tuy (scrollLeft thay doi nhung scrollTop giu nguyen)
    if (hasPrev && curY === prevY) return

    if (curY > 0) {
      scrolledTargets.add(target)
      activeScrollTarget = target
    } else {
      scrolledTargets.delete(target)
      if (activeScrollTarget === target) {
        activeScrollTarget = null
      }
    }

    if (!isScrollingToTop) {
      showScrollTop.value = computeShouldShowScrollTop()
    }
    updateMobileNavByScroll(curY, prevY)
    lastScrollMap.set(target, curY)
  }
}

const scrollElementToTop = (el) => {
  if (!el || el.scrollTop <= 0) return
  if (typeof el.scrollTo === 'function') {
    el.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    el.scrollTop = 0
  }
}

const scrollToTop = () => {
  isMobileNavHidden.value = false
  showScrollTop.value = false

  clearScrollingToTopGuard()
  isScrollingToTop = true
  scrollToTopTimer = setTimeout(() => {
    isScrollingToTop = false
    scrollToTopTimer = null
  }, 650)

  let scrolledInner = false

  if (
    activeScrollTarget &&
    activeScrollTarget.isConnected &&
    activeScrollTarget.clientHeight > 0 &&
    activeScrollTarget.scrollTop > 0
  ) {
    scrollElementToTop(activeScrollTarget)
    scrolledInner = true
  }

  for (const el of Array.from(scrolledTargets)) {
    if (!el || !el.isConnected) {
      scrolledTargets.delete(el)
      continue
    }
    if (el !== activeScrollTarget && el.clientHeight > 0 && el.scrollTop > 0) {
      scrollElementToTop(el)
      scrolledInner = true
    }
  }

  if (mainContentRef.value) {
    if (mainContentRef.value.scrollTop > 0) {
      scrollElementToTop(mainContentRef.value)
      scrolledInner = true
    }
    if (!scrolledInner) {
      const descendants = mainContentRef.value.querySelectorAll('*')
      for (let i = 0; i < descendants.length; i++) {
        const el = descendants[i]
        if (
          el instanceof HTMLElement &&
          el.scrollTop > 0 &&
          el.clientHeight > 0 &&
          !el.closest(EXCLUDED_SCROLL_SELECTORS)
        ) {
          scrollElementToTop(el)
        }
      }
    }
  }

  if ((window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0) > 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleGlobalScrollCapture, { passive: true, capture: true })
  window.addEventListener('touchstart', clearScrollingToTopGuard, { passive: true })
  window.addEventListener('wheel', clearScrollingToTopGuard, { passive: true })
  window.addEventListener('click', handleGlobalClickSyncScrollTop, { passive: true })
  fetchIncompleteTasks()
  checkIosInstallPrompt()
  initZaloBotBackgroundService()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleGlobalScrollCapture, { capture: true })
  window.removeEventListener('touchstart', clearScrollingToTopGuard)
  window.removeEventListener('wheel', clearScrollingToTopGuard)
  window.removeEventListener('click', handleGlobalClickSyncScrollTop)
  clearScrollingToTopGuard()
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
  pointer-events: none;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 955;
}

.scroll-to-top.show {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
}

.app-layout:has(.modal, .vip-modal-overlay, .load-invoice-modal-overlay, .modal-overlay, .pipeline-modal-overlay) .scroll-to-top {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.scroll-to-top:hover {
  filter: brightness(1.1);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.5);
}

.scroll-to-top:active {
  transform: translateY(0);
  text-decoration: none;
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 10px 16px;
}

.logout-btn {
  color: #ef4444;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.drawer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 10px 20px;
  flex-shrink: 0;
}

.logout-drawer-btn {
  color: #ef4444 !important;
}

.logout-drawer-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

.ios-guide-drawer-btn {
  color: #38bdf8 !important;
}

@media (min-width: 769px) and (max-width: 1100px) {
  .scroll-to-top {
    bottom: calc(76px + env(safe-area-inset-bottom, 0px));
    right: 20px;
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  .scroll-to-top {
    bottom: calc(138px + env(safe-area-inset-bottom, 0px));
    right: 14px;
    width: 38px;
    height: 38px;
  }
  .scroll-to-top svg {
    width: 19px;
    height: 19px;
  }
}

/* iOS Safari PWA Install Banner */
.ios-install-banner {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(66px + env(safe-area-inset-bottom, 0px));
  z-index: 9998;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
}

.ios-install-icon {
  width: 40px;
  height: 40px;
  border-radius: 9px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.ios-install-text {
  flex: 1;
  min-width: 0;
}

.ios-install-title {
  color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
}

.ios-install-desc {
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.35;
}

.ios-install-desc strong {
  color: #38bdf8;
}

.ios-share-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(56, 189, 248, 0.16);
  color: #38bdf8;
  border-radius: 4px;
  padding: 1px 4px;
  margin: 0 2px;
  vertical-align: middle;
}

.ios-install-close {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
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
  height: 100%;
  max-height: 100dvh;
  background: #0d1b2a;
  z-index: 10001;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0,0,0,0.5);
  padding-top: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-sizing: border-box;
}
.mobile-drawer.open {
  right: 0;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) 16px 14px 16px;
  background:
    radial-gradient(125% 135% at 12% 0%, rgba(16, 185, 129, 0.2) 0%, rgba(56, 189, 248, 0.12) 50%, rgba(13, 27, 42, 0) 85%),
    linear-gradient(180deg, #091322 0%, #0d1b2a 100%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.drawer-header .toggle-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #f8fafc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  -webkit-overflow-scrolling: touch;
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
  flex-shrink: 0;
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

.nav-group-block {
  display: flex;
  flex-direction: column;
}

.nav-section-title {
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 9px 12px 7px;
  margin-top: 6px;
  border-radius: 6px;
  user-select: none;
}

.nav-group-block:first-of-type .nav-section-title {
  margin-top: 0;
}

.nav-section-title.has-active-child {
  color: #2dd4bf;
  background: rgba(20, 184, 166, 0.12);
}

.nav-section-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 8px 12px;
}

.drawer-section-title {
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 9px 14px 5px;
  margin-top: 4px;
  user-select: none;
  flex-shrink: 0;
}

.nav-section-title.clickable {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}
.nav-section-title.clickable:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}
.drawer-section-title.clickable {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}
.drawer-section-title.clickable:hover {
  color: #ffffff;
}
.nav-chevron {
  transition: transform 0.25s ease;
  opacity: 0.9;
  flex-shrink: 0;
}
.nav-group-items {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}
.nav-group-items.group-collapsed {
  display: none;
}
.drawer-group-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 4px;
  flex-shrink: 0;
  overflow: visible;
}

/* Footer cố định ở đáy Sidebar */
.sidebar-footer {
  padding: 10px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  background: rgba(10, 21, 32, 0.45);
}

.app-layout.sidebar-collapsed .sidebar-footer {
  flex-direction: column;
  padding: 10px 8px;
  gap: 6px;
}

.footer-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 8px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: #94a3b8;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.app-layout.sidebar-collapsed .footer-action-btn {
  width: 100%;
  padding: 10px 0;
}

.footer-action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.footer-action-btn.router-link-active {
  background: linear-gradient(90deg, #185a59, #113f3e);
  color: #ffffff;
  border-color: rgba(20, 184, 166, 0.3);
}

.footer-action-btn.logout-btn {
  color: #f87171;
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.15);
}

.footer-action-btn.logout-btn:hover {
  background: rgba(239, 68, 68, 0.16);
  color: #fca5a5;
}

@media (max-width: 768px) {
  .nav-section-title,
  .nav-section-divider,
  .sidebar-footer {
    display: none !important;
  }
  .nav-group-block:not(.hide-on-mobile),
  .nav-group-block:not(.hide-on-mobile) .nav-group-items,
  .nav-group-block:not(.hide-on-mobile) .nav-group-items.group-collapsed {
    display: flex !important;
    flex-direction: row !important;
    flex: 1 1 0 !important;
    gap: 0 !important;
    height: 100% !important;
    overflow: visible !important;
  }
  @supports (display: contents) {
    .nav-group-block:not(.hide-on-mobile),
    .nav-group-block:not(.hide-on-mobile) .nav-group-items,
    .nav-group-block:not(.hide-on-mobile) .nav-group-items.group-collapsed {
      display: contents !important;
    }
  }
  .hide-on-mobile {
    display: none !important;
  }
}
</style>

