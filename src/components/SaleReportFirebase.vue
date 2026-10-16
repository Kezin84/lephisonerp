<template>
  <div class="sr-page">
    <div class="sr-header">
      <div class="sr-title-group">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <h1>SALE REPORT</h1>
        <span class="sr-badge">{{ rows.length }} records</span>
      </div>
      <div class="sr-actions">
        <button class="sr-btn sr-btn-refresh" @click="loadData" :disabled="loading">
          <svg :class="{ spin: loading }" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ loading ? 'Đang tải...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Search bar centered -->
    <div class="sr-search-container" style="display: flex; justify-content: center; margin-bottom: 24px; position: relative; z-index: 40;">
      <div style="width: 100%; max-width: 600px; position: relative;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input 
          v-model="searchStr" 
          @focus="showSearchSuggestions = true"
          @blur="hideSearchSuggestionsDelay"
          @keydown.enter="showSearchSuggestions = false"
          placeholder="Tìm kiếm PO, Content of contract/PO, Khách hàng, MST, AM..." 
          style="width: 100%; padding: 16px 24px 16px 48px; border-radius: 24px; border: 1px solid #334155; background: #0f172a; color: #f8fafc; font-size: 16px; outline: none; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: all 0.3s; box-sizing: border-box;"
          onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 3px rgba(56,189,248,0.2)'"
          onblur="this.style.borderColor='#334155'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
        />
        
        <!-- Suggestions dropdown -->
        <transition name="sr-fade">
          <div v-if="showSearchSuggestions && searchStr && searchSuggestions.length > 0" style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 8px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-height: 400px; overflow-y: auto;">
            <div v-for="(item, idx) in searchSuggestions" :key="idx" @mousedown.prevent @click="selectSuggestion(item)" style="padding: 12px 16px; border-bottom: 1px solid #334155; cursor: pointer; transition: background 0.2s; display: flex; flex-direction: column; gap: 4px;" onmouseover="this.style.background='rgba(56,189,248,0.1)'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #f8fafc; font-weight: 600; font-size: 14px;">PO {{ item.So_PO }}</span>
              <span style="color: #38bdf8; font-size: 12px; background: rgba(56,189,248,0.1); padding: 2px 8px; border-radius: 12px;">{{ item.account_manager_name }}</span>
            </div>
            <div v-if="item.content_of_contract_PO" style="color: #22c55e; font-size: 13px; font-weight: 600;">{{ item.content_of_contract_PO }}</div>
            <div style="color: #94a3b8; font-size: 13px;">Khách hàng: <span style="color: #e2e8f0;">{{ item.Ten_cong_ty }}</span></div>
            <div style="color: #64748b; font-size: 12px;">MST: {{ item.MST }}</div>
          </div>
          <div v-if="filteredRows.length > 5" style="padding: 10px; text-align: center; color: #94a3b8; font-size: 12px; font-style: italic; border-top: 1px solid #334155;">
            Hiển thị 5 / {{ filteredRows.length }} kết quả. Nhấn Enter để xem tất cả.
          </div>
        </div>
        </transition>
        <transition name="sr-fade">
          <div v-if="showSearchSuggestions && searchStr && searchSuggestions.length === 0" style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 8px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); padding: 16px; text-align: center; color: #94a3b8;">
            Không tìm thấy kết quả nào cho "{{ searchStr }}"
          </div>
        </transition>
      </div>
    </div>


    <!-- Elite Filters -->
    <div class="elite-filter-panel">
      <div class="elite-filter-accent"></div>
      <div class="elite-filter-header">
        <div class="elite-filter-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          <span>Bộ lọc nâng cao</span>
        </div>
        <button class="elite-refresh-btn" @click="loadData">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
          Làm mới
        </button>
      </div>

      <div class="elite-filter-body">
        <div class="elite-filter-row" style="width: 100%;">
          <div class="elite-date-group group-tabs" style="flex: 0 0 auto; min-width: auto; max-width: none;">
            <label style="opacity: 0; user-select: none;" class="mobile-hidden-label">Chế độ</label>
            <div class="elite-mode-tabs" style="min-width: 180px; width: auto;">
              <button type="button" :class="{ active: timeFilterMode === 'all' }" @click="timeFilterMode = 'all'">Tất cả</button>
              <button type="button" :class="{ active: timeFilterMode === 'day' }" @click="timeFilterMode = 'day'">Ngày</button>
              <button type="button" :class="{ active: timeFilterMode === 'month' }" @click="timeFilterMode = 'month'">Tháng</button>
              <button type="button" :class="{ active: timeFilterMode === 'year' }" @click="timeFilterMode = 'year'">Năm</button>
            </div>
          </div>

          <template v-if="timeFilterMode === 'day'">
            <div class="elite-date-group group-date" style="flex: 1; max-width: 500px;">
              <label style="color: #94a3b8 !important;">Từ ngày</label>
              <input type="date" v-model="dateFrom" :max="dateTo" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" style="width: 100%;" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date" style="flex: 1; max-width: 500px;">
              <label style="color: #94a3b8 !important;">Đến ngày</label>
              <input type="date" v-model="dateTo" :min="dateFrom" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" style="width: 100%;" />
            </div>
          </template>

          <template v-if="timeFilterMode === 'month'">
            <div class="elite-date-group group-date" style="flex: 1; max-width: 500px;">
              <label style="color: #94a3b8 !important;">Từ tháng</label>
              <input type="month" v-model="monthFrom" :max="monthTo" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" style="width: 100%;" />
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date" style="flex: 1; max-width: 500px;">
              <label style="color: #94a3b8 !important;">Đến tháng</label>
              <input type="month" v-model="monthTo" :min="monthFrom" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" style="width: 100%;" />
            </div>
          </template>

          <template v-if="timeFilterMode === 'year'">
            <div class="elite-date-group group-date" style="flex: 1; max-width: 500px;">
              <label style="color: #94a3b8 !important;">Từ năm</label>
              <select v-model="yearFrom" class="elite-input" style="width: 100%;">
                <option value="">Chọn năm...</option>
                <option v-for="y in availableYearsList" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
            <span class="elite-range-sep">→</span>
            <div class="elite-date-group group-date" style="flex: 1; max-width: 500px;">
              <label style="color: #94a3b8 !important;">Đến năm</label>
              <select v-model="yearTo" class="elite-input" style="width: 100%;">
                <option value="">Chọn năm...</option>
                <option v-for="y in availableYearsList" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </template>
        </div>


      </div>
    </div>
    <!-- Top Summary Dashboard -->
    <div class="sr-top-summary" v-if="!loading && filteredRows.length > 0" style="margin-bottom: 24px;">
      <div class="fintech-grid">
        <!-- Primary Metrics -->
        <div class="fintech-card primary" @click="openChart('doanhSoBan')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Doanh số bán</span>
            <div class="fintech-icon primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
          <div class="fintech-val">{{ fmt(sumCol('doanhSoBan')) }} <span class="fintech-currency">VND</span></div>
          <template v-if="getTrendData(sumCol('doanhSoBan'), sumColPrev('doanhSoBan'))">
            <div class="fintech-trend" :class="getTrendData(sumCol('doanhSoBan'), sumColPrev('doanhSoBan'))?.state">
              <svg v-if="getTrendData(sumCol('doanhSoBan'), sumColPrev('doanhSoBan'))?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(sumCol('doanhSoBan'), sumColPrev('doanhSoBan'))?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(sumCol('doanhSoBan'), sumColPrev('doanhSoBan'))?.text }} so với kỳ trước</span>
            </div>
          </template>
          
          <div class="sr-card-detail-chart" @click.stop="openChart('doanhSoBan')" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-doanhSoBan').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-doanhSoBan').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-doanhSoBan" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('doanhSoBan')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#38bdf8'; this.querySelector('.arrow-icon').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon').style.transform='translateX(0)'" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-product" @click.stop="openTopProductModal('doanhSoBan')" style="margin-top: 0px; padding-top: 8px; font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#38bdf8'; this.querySelector('.arrow-icon-p-doanhSoBan').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-p-doanhSoBan').style.transform='translateX(0)'" title="Xem BXH Top Sản phẩm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span style="font-weight: 600;">Xem top sản phẩm</span>
            <svg class="arrow-icon-p-doanhSoBan" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <div class="fintech-card primary" @click="openChart('grossCom')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Gross Com</span>
            <div class="fintech-icon primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div class="fintech-val">{{ fmt(sumCol('grossCom')) }}</div>
          <template v-if="getTrendData(sumCol('grossCom'), sumColPrev('grossCom'))">
            <div class="fintech-trend" :class="getTrendData(sumCol('grossCom'), sumColPrev('grossCom'))?.state">
              <svg v-if="getTrendData(sumCol('grossCom'), sumColPrev('grossCom'))?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(sumCol('grossCom'), sumColPrev('grossCom'))?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(sumCol('grossCom'), sumColPrev('grossCom'))?.text }} so với kỳ trước</span>
            </div>
          </template>
          
          <div class="sr-card-detail-chart" @click.stop="openChart('grossCom')" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-grossCom').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-grossCom').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-grossCom" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('grossCom')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#38bdf8'; this.querySelector('.arrow-icon').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon').style.transform='translateX(0)'" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-product" @click.stop="openTopProductModal('grossCom')" style="margin-top: 0px; padding-top: 8px; font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#38bdf8'; this.querySelector('.arrow-icon-p-grossCom').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-p-grossCom').style.transform='translateX(0)'" title="Xem BXH Top Sản phẩm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span style="font-weight: 600;">Xem top sản phẩm</span>
            <svg class="arrow-icon-p-grossCom" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <div class="fintech-card success" @click="openChart('netCom')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Net Com</span>
            <div class="fintech-icon success">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
          </div>
          <div class="fintech-val green">{{ fmt(sumCol('netCom')) }}</div>
          <template v-if="getTrendData(sumCol('netCom'), sumColPrev('netCom'))">
            <div class="fintech-trend" :class="getTrendData(sumCol('netCom'), sumColPrev('netCom'))?.state">
              <svg v-if="getTrendData(sumCol('netCom'), sumColPrev('netCom'))?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(sumCol('netCom'), sumColPrev('netCom'))?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(sumCol('netCom'), sumColPrev('netCom'))?.text }} so với kỳ trước</span>
            </div>
          </template>
          
          <div class="sr-card-detail-chart" @click.stop="openChart('netCom')" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-netCom').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-netCom').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-netCom" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('netCom')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#34d399'; this.querySelector('.arrow-icon').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon').style.transform='translateX(0)'" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-product" @click.stop="openTopProductModal('netCom')" style="margin-top: 0px; padding-top: 8px; font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#34d399'; this.querySelector('.arrow-icon-p-netCom').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-p-netCom').style.transform='translateX(0)'" title="Xem BXH Top Sản phẩm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span style="font-weight: 600;">Xem top sản phẩm</span>
            <svg class="arrow-icon-p-netCom" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <div class="fintech-card" :class="sumCol('netMargin') >= 0 ? 'success' : 'danger'" @click="openChart('netMargin')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Net Margin</span>
            <div class="fintech-icon" :class="sumCol('netMargin') >= 0 ? 'success' : 'danger'">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
            </div>
          </div>
          <div class="fintech-val" :class="sumCol('netMargin') >= 0 ? 'green' : 'red'">{{ fmt(sumCol('netMargin')) }}</div>
          <template v-if="getTrendData(sumCol('netMargin'), sumColPrev('netMargin'))">
            <div class="fintech-trend" :class="getTrendData(sumCol('netMargin'), sumColPrev('netMargin'))?.state">
              <svg v-if="getTrendData(sumCol('netMargin'), sumColPrev('netMargin'))?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(sumCol('netMargin'), sumColPrev('netMargin'))?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(sumCol('netMargin'), sumColPrev('netMargin'))?.text }} so với kỳ trước</span>
            </div>
          </template>
          
          <div class="sr-card-detail-chart" @click.stop="openChart('netMargin')" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-netMargin').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-netMargin').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-netMargin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('netMargin')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#f8fafc'; this.querySelector('.arrow-icon').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon').style.transform='translateX(0)'" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-product" @click.stop="openTopProductModal('netMargin')" style="margin-top: 0px; padding-top: 8px; font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#f8fafc'; this.querySelector('.arrow-icon-p-netMargin').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-p-netMargin').style.transform='translateX(0)'" title="Xem BXH Top Sản phẩm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span style="font-weight: 600;">Xem top sản phẩm</span>
            <svg class="arrow-icon-p-netMargin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <div class="fintech-card primary" @click="openChart('netPO')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Net PO</span>
            <div class="fintech-icon primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
            </div>
          </div>
          <div class="fintech-val">{{ fmt(sumCol('netPO')) }}</div>
          <template v-if="getTrendData(sumCol('netPO'), sumColPrev('netPO'))">
            <div class="fintech-trend" :class="getTrendData(sumCol('netPO'), sumColPrev('netPO'))?.state">
              <svg v-if="getTrendData(sumCol('netPO'), sumColPrev('netPO'))?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(sumCol('netPO'), sumColPrev('netPO'))?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(sumCol('netPO'), sumColPrev('netPO'))?.text }} so với kỳ trước</span>
            </div>
          </template>
          
          <div class="sr-card-detail-chart" @click.stop="openChart('netPO')" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-netPO').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-netPO').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-netPO" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('netPO')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#38bdf8'; this.querySelector('.arrow-icon').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon').style.transform='translateX(0)'" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-product" @click.stop="openTopProductModal('netPO')" style="margin-top: 0px; padding-top: 8px; font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#38bdf8'; this.querySelector('.arrow-icon-p-netPO').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-p-netPO').style.transform='translateX(0)'" title="Xem BXH Top Sản phẩm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span style="font-weight: 600;">Xem top sản phẩm</span>
            <svg class="arrow-icon-p-netPO" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
        
        <!-- Ratio Metrics -->
        <div class="fintech-card ratio" @click="openChart('totalNetComPct', true)" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Net Com / Net PO</span>
            <div class="fintech-icon ratio"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg></div>
          </div>
          <div class="fintech-val green">{{ pctFmt(totalNetComPct) }}</div>
          <template v-if="getTrendData(totalNetComPct, prevTotalNetComPct, true)">
            <div class="fintech-trend" :class="getTrendData(totalNetComPct, prevTotalNetComPct, true)?.state">
              <svg v-if="getTrendData(totalNetComPct, prevTotalNetComPct, true)?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(totalNetComPct, prevTotalNetComPct, true)?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(totalNetComPct, prevTotalNetComPct, true)?.text }} so với kỳ trước</span>
            </div>
          </template>
          
          <div class="sr-card-detail-chart" @click.stop="openChart('totalNetComPct', true)" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-totalNetComPct').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-totalNetComPct').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-totalNetComPct" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('totalNetComPct')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.querySelector('.arrow-icon').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon').style.transform='translateX(0)'" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-product" @click.stop="openTopProductModal('totalNetComPct')" style="margin-top: 0px; padding-top: 8px; font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.querySelector('.arrow-icon-p-totalNetComPct').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-p-totalNetComPct').style.transform='translateX(0)'" title="Xem BXH Top Sản phẩm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span style="font-weight: 600;">Xem top sản phẩm</span>
            <svg class="arrow-icon-p-totalNetComPct" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <div class="fintech-card ratio" @click="openChart('totalNetMarginPct', true)" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Net Margin / Net PO</span>
            <div class="fintech-icon" :class="totalNetMarginPct >= 0 ? 'ratio' : 'danger'"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg></div>
          </div>
          <div class="fintech-val" :class="totalNetMarginPct >= 0 ? 'green' : 'red'">{{ pctFmt(totalNetMarginPct) }}</div>
          <template v-if="getTrendData(totalNetMarginPct, prevTotalNetMarginPct, true)">
            <div class="fintech-trend" :class="getTrendData(totalNetMarginPct, prevTotalNetMarginPct, true)?.state">
              <svg v-if="getTrendData(totalNetMarginPct, prevTotalNetMarginPct, true)?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(totalNetMarginPct, prevTotalNetMarginPct, true)?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(totalNetMarginPct, prevTotalNetMarginPct, true)?.text }} so với kỳ trước</span>
            </div>
          </template>
          
          <div class="sr-card-detail-chart" @click.stop="openChart('totalNetMarginPct', true)" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-totalNetMarginPct').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-totalNetMarginPct').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-totalNetMarginPct" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('totalNetMarginPct')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.querySelector('.arrow-icon').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon').style.transform='translateX(0)'" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-product" @click.stop="openTopProductModal('totalNetMarginPct')" style="margin-top: 0px; padding-top: 8px; font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.querySelector('.arrow-icon-p-totalNetMarginPct').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-p-totalNetMarginPct').style.transform='translateX(0)'" title="Xem BXH Top Sản phẩm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span style="font-weight: 600;">Xem top sản phẩm</span>
            <svg class="arrow-icon-p-totalNetMarginPct" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <div class="fintech-card ratio" @click="openChart('totalNetComDsbPct', true)" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Net Com / DSB</span>
            <div class="fintech-icon ratio"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg></div>
          </div>
          <div class="fintech-val green">{{ pctFmt(totalNetComDsbPct) }}</div>
          <template v-if="getTrendData(totalNetComDsbPct, prevTotalNetComDsbPct, true)">
            <div class="fintech-trend" :class="getTrendData(totalNetComDsbPct, prevTotalNetComDsbPct, true)?.state">
              <svg v-if="getTrendData(totalNetComDsbPct, prevTotalNetComDsbPct, true)?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(totalNetComDsbPct, prevTotalNetComDsbPct, true)?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(totalNetComDsbPct, prevTotalNetComDsbPct, true)?.text }} so với kỳ trước</span>
            </div>
          </template>
          
          <div class="sr-card-detail-chart" @click.stop="openChart('totalNetComDsbPct', true)" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-totalNetComDsbPct').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-totalNetComDsbPct').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-totalNetComDsbPct" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('totalNetComDsbPct')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.querySelector('.arrow-icon').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon').style.transform='translateX(0)'" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-product" @click.stop="openTopProductModal('totalNetComDsbPct')" style="margin-top: 0px; padding-top: 8px; font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.querySelector('.arrow-icon-p-totalNetComDsbPct').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-p-totalNetComDsbPct').style.transform='translateX(0)'" title="Xem BXH Top Sản phẩm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span style="font-weight: 600;">Xem top sản phẩm</span>
            <svg class="arrow-icon-p-totalNetComDsbPct" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <div class="fintech-card ratio" @click="openChart('totalNetMarginDsbPct', true)" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Net Margin / DSB</span>
            <div class="fintech-icon" :class="totalNetMarginDsbPct >= 0 ? 'ratio' : 'danger'"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg></div>
          </div>
          <div class="fintech-val" :class="totalNetMarginDsbPct >= 0 ? 'green' : 'red'">{{ pctFmt(totalNetMarginDsbPct) }}</div>
          <template v-if="getTrendData(totalNetMarginDsbPct, prevTotalNetMarginDsbPct, true)">
            <div class="fintech-trend" :class="getTrendData(totalNetMarginDsbPct, prevTotalNetMarginDsbPct, true)?.state">
              <svg v-if="getTrendData(totalNetMarginDsbPct, prevTotalNetMarginDsbPct, true)?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(totalNetMarginDsbPct, prevTotalNetMarginDsbPct, true)?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(totalNetMarginDsbPct, prevTotalNetMarginDsbPct, true)?.text }} so với kỳ trước</span>
            </div>
          </template>
          
          <div class="sr-card-detail-chart" @click.stop="openChart('totalNetMarginDsbPct', true)" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-totalNetMarginDsbPct').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-totalNetMarginDsbPct').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-totalNetMarginDsbPct" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('totalNetMarginDsbPct')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.querySelector('.arrow-icon').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon').style.transform='translateX(0)'" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-product" @click.stop="openTopProductModal('totalNetMarginDsbPct')" style="margin-top: 0px; padding-top: 8px; font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.querySelector('.arrow-icon-p-totalNetMarginDsbPct').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-p-totalNetMarginDsbPct').style.transform='translateX(0)'" title="Xem BXH Top Sản phẩm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span style="font-weight: 600;">Xem top sản phẩm</span>
            <svg class="arrow-icon-p-totalNetMarginDsbPct" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <!-- Debt & Payment Metrics -->
        <div class="fintech-card primary" @click="openChart('tongSauVat')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Tổng tiền sau VAT</span>
            <div class="fintech-icon primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
          </div>
          <div class="fintech-val">{{ fmt(sumCol('tongSauVat')) }} <span class="fintech-currency">VND</span></div>
          <template v-if="getTrendData(sumCol('tongSauVat'), sumColPrev('tongSauVat'))">
            <div class="fintech-trend" :class="getTrendData(sumCol('tongSauVat'), sumColPrev('tongSauVat'))?.state">
              <svg v-if="getTrendData(sumCol('tongSauVat'), sumColPrev('tongSauVat'))?.isUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg v-else-if="getTrendData(sumCol('tongSauVat'), sumColPrev('tongSauVat'))?.isDown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              <span>{{ getTrendData(sumCol('tongSauVat'), sumColPrev('tongSauVat'))?.text }} so với kỳ trước</span>
            </div>
          </template>
          <div class="sr-card-detail-chart" @click.stop="openChart('tongSauVat')" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('tongSauVat')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
          </div>
        </div>

        <div class="fintech-card success" @click="openChart('daThanhToan')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Khách đã thanh toán</span>
            <div class="fintech-icon success">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div class="fintech-val green">{{ fmt(sumCol('daThanhToan')) }} <span class="fintech-currency">VND</span></div>
          <div style="margin-top: 8px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center;">
            <span>Tỷ lệ thu hồi:</span>
            <strong style="color: #34d399;">{{ sumCol('tongSauVat') > 0 ? pctFmt((sumCol('daThanhToan') / sumCol('tongSauVat')) * 100) : '0%' }}</strong>
          </div>
          <div class="sr-card-detail-chart" @click.stop="openChart('daThanhToan')" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('daThanhToan')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" title="Xem BXH Top Khách hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            <span style="font-weight: 600;">Xem top khách hàng</span>
          </div>
        </div>

        <div class="fintech-card" :class="sumCol('congNo') > 0 ? 'danger' : 'success'" @click="openChart('congNo')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
          <div class="fintech-glow"></div>
          <div class="fintech-header">
            <span class="fintech-title">Tổng công nợ còn lại</span>
            <div class="fintech-icon" :class="sumCol('congNo') > 0 ? 'danger' : 'success'">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div class="fintech-val" :class="sumCol('congNo') > 0 ? 'red' : 'green'">{{ fmt(sumCol('congNo')) }} <span class="fintech-currency">VND</span></div>
          <div style="margin-top: 8px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center;">
            <span>Số PO còn nợ:</span>
            <strong :style="{ color: unpaidPoCount > 0 ? '#f87171' : '#4ade80' }">{{ unpaidPoCount }} / {{ filteredRows.length }} PO</strong>
          </div>
          <div class="sr-card-detail-chart" @click.stop="openChart('congNo')" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('congNo')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" title="Xem BXH Top Khách hàng công nợ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            <span style="font-weight: 600;">Xem top KH công nợ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar: Buttons (Left) & Center (Khách Hàng) & Right (Filters) -->
    <div class="sr-toolbar-bottom">
      
      <!-- Left side: Buttons -->
      <div class="toolbar-left-buttons" style="display: flex; gap: 12px; align-items: center; padding-bottom: 2px;">
        <button class="sr-btn sr-btn-import bg-btn" style="background:#2563eb;color:#ffffff;border-color:#1d4ed8;font-weight:700;height:42px;" @click="triggerImport(null, 'bao_gia')">📄 Import Báo giá</button>
        <button class="sr-btn sr-btn-import bg-btn" style="background:#8b5cf6;color:#ffffff;border-color:#7c3aed;font-weight:700;height:42px;" @click="triggerReportImport()">📊 Import Report</button>
        <input type="file" ref="reportUploadInput" accept=".xlsx, .xls" multiple style="display: none" @change="onReportFilesSelected" />
        <button class="sr-btn sr-btn-export" style="background:#16a34a;color:#ffffff;border-color:#15803d;font-weight:700;display:flex;align-items:center;gap:6px;padding:0 16px;height:42px;" @click="showExportModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18"><path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"/><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"/><path fill="#2E7D32" d="M27,42L6,38.746C5.416,38.655,5,38.146,5,37.555v-27.11c0-0.591,0.416-1.1,1-1.191L27,6V42z"/><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"/></svg>
          Xuất Excel
        </button>
      </div>

      <!-- Center: Khách hàng Filter -->
      <div class="elite-select-group center-filter" style="position: relative;">
        <label style="color: #10b981 !important; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Khách hàng Đối tác
        </label>
        <div style="position: relative; width: 100%;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); z-index: 10; opacity: 0.9;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" v-model="filterCustomer" class="elite-input" style="width: 100%; padding-left: 42px; background: linear-gradient(135deg, #10b981 0%, #047857 100%) !important; color: #ffffff !important; border: 1px solid #059669 !important; font-weight: 600; font-size: 14px; height: 42px; border-radius: 10px; box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.4); outline: none; transition: all 0.3s;" placeholder="Nhập để tìm khách hàng..." @focus="filterCustomer === 'Tất cả' ? filterCustomer = '' : null; showCustomerDropdown = true; $event.target.style.boxShadow='0 0 0 3px rgba(16, 185, 129, 0.5), 0 8px 20px -4px rgba(16, 185, 129, 0.5)'; $event.target.style.transform='translateY(-1px)'" @blur="onCustomerInputBlur(); $event.target.style.boxShadow='0 8px 20px -4px rgba(16, 185, 129, 0.4)'; $event.target.style.transform='translateY(0)'" />
          
          <!-- Custom Dropdown -->
          <ul v-if="showCustomerDropdown" style="position: absolute; top: 100%; left: 0; width: 100%; margin-top: 8px; padding: 6px; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); z-index: 1000; max-height: 280px; overflow-y: auto; list-style: none; display: flex; flex-direction: column; gap: 2px;" class="custom-scrollbar">
            <li v-for="c in filteredCustomerOptions" :key="c.companyName + c.companyCode" @mousedown="selectCustomerOption(c)" style="padding: 10px 14px; cursor: pointer; border-radius: 6px; transition: all 0.2s; text-align: left; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='rgba(16, 185, 129, 0.15)'" onmouseout="this.style.background='transparent'">
              <template v-if="c.companyName === 'Tất cả'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span style="color: #cbd5e1; font-size: 13.5px; font-weight: 500;">-- Tất cả khách hàng --</span>
              </template>
              <template v-else>
                <div style="display: flex; flex-direction: column; gap: 2px; width: 100%;">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                    <span style="font-weight: 700; color: #10b981; font-size: 14px;">{{ c.companyName }}</span>
                    <span v-if="c.totalCongNo > 0" style="font-size: 11px; font-weight: 700; color: #f87171; background: rgba(248,113,113,0.12); padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(248,113,113,0.25); white-space: nowrap;">Nợ: {{ fmt(c.totalCongNo) }}</span>
                  </div>
                  <span style="font-size: 11.5px; color: #94a3b8;">{{ c.customerName }} <span v-if="c.companyCode" style="opacity: 0.6;">({{ c.companyCode }})</span></span>
                </div>
              </template>
            </li>
            <li v-if="filteredCustomerOptions.length === 0" style="padding: 10px 14px; color: #64748b; font-size: 13px; text-align: center; font-style: italic;">
              Không tìm thấy khách hàng
            </li>
          </ul>
        </div>
      </div>

      <!-- Right side: Filters -->
      <div class="toolbar-right-filters" style="display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap;">
        <div class="elite-select-group" style="min-width: 195px;">
          <label style="color: #f87171 !important;">Trạng thái công nợ / Hạn TT</label>
          <select v-model="filterDebtStatus" class="elite-select" style="width: 100%;">
            <option value="Tất cả">Tất cả công nợ</option>
            <option value="Còn công nợ">Còn công nợ ({{ unpaidPoCount }})</option>
            <option value="Quá hạn thanh toán">Quá hạn thanh toán ({{ overduePoCount }})</option>
            <option value="Sắp đến hạn">Sắp đến hạn &le; 7 ngày ({{ dueSoonPoCount }})</option>
            <option value="Chưa thanh toán">Chưa thanh toán</option>
            <option value="Thanh toán 1 phần">Thanh toán 1 phần</option>
            <option value="Đã tất toán">Đã tất toán (Hết nợ)</option>
          </select>
        </div>

        <div class="elite-select-group" style="min-width: 170px;">
          <label style="color: #94a3b8 !important;">Sắp xếp theo số PO</label>
          <select v-model="sortPoOrder" class="elite-select" style="width: 100%;">
            <option value="">Mặc định</option>
            <option value="PO giảm">Lớn nhất ➝ Nhỏ nhất</option>
            <option value="PO tăng">Nhỏ nhất ➝ Lớn nhất</option>
          </select>
        </div>

        <div class="elite-select-group" style="min-width: 170px;">
          <label style="color: #94a3b8 !important;">Sắp xếp theo ngày tạo</label>
          <select v-model="sortOrder" class="elite-select" style="width: 100%;">
            <option value="Mới nhất">Mới nhất ➝ Cũ nhất</option>
            <option value="Cũ nhất">Cũ nhất ➝ Mới nhất</option>
          </select>
        </div>

        <div class="elite-select-group" style="min-width: 170px;">
          <label style="color: #94a3b8 !important;">Product Type</label>
          <select v-model="filterProductType" class="elite-select" style="width: 100%;">
            <option value="Tất cả">Tất cả</option>
            <option v-for="pt in uniqueProductTypes" :key="pt" :value="pt">{{ pt }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Grouped Card List -->
    <div class="sr-groups-container" v-if="!loading && filteredRows.length > 0">
      <div v-for="(group, gIdx) in groupedDisplayedRows" :key="group.ma_cong_ty + gIdx" class="sr-report-group" style="margin-bottom: 24px;">
        <div class="folder-header" style="cursor: pointer; margin-bottom: 16px;">
          <div class="folder-tab" style="background: linear-gradient(135deg, #059669, #10b981); border: 1px solid rgba(16, 185, 129, 0.5); border-bottom: none; border-radius: 10px 10px 0 0; padding: 8px 24px; width: max-content; max-width: 100%; color: #ffffff; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <span>{{ group.ma_cong_ty }}</span>
              </span>
              <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.3);"></div>
              <span style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ group.ten_cong_ty }}</span>
              <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.3);"></div>
              <span>SỐ LƯỢNG: {{ group.items.length }}</span>
              <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.3);"></div>
              <span style="background: rgba(15, 23, 42, 0.35); padding: 2px 10px; border-radius: 999px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
                <span>ĐÃ TT: {{ fmt(getGroupDaThanhToan(group)) }} đ</span>
                <span>•</span>
                <span :style="{ color: getGroupCongNo(group) > 0 ? '#fde047' : '#ffffff', fontWeight: '800' }">
                  CÔNG NỢ KH: {{ fmt(getGroupCongNo(group)) }} đ
                </span>
              </span>
            </div>
          </div>
          <div class="folder-body-line" style="height: 4px; background: #10b981; border-radius: 0 4px 4px 4px; box-shadow: 0 2px 10px rgba(16,185,129,0.2);"></div>
        </div>
        
        <div class="sr-card-list">
          <div v-for="(r, idx) in group.items" :key="r.ID || idx" class="sr-record-card" @click="openMultiEditModal(r)" style="cursor: pointer;">
        
        <div class="sr-rc-header">
          <div class="sr-rc-left">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span class="sr-rc-po">PO {{ r.So_PO }}</span>
              <h3 class="sr-rc-customer" style="margin: 0;">{{ r.content_of_contract_PO || 'N/A' }}</h3>
            </div>
            <span class="sr-rc-date" style="color: #f8fafc;">Tạo: {{ fmtDate(r.created_time) }} (Tháng {{ getMonth(r.created_time) }})</span>
          </div>
          <div class="sr-rc-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
              <span
                v-if="congNo(r) <= 0 && tongSauVat(r) > 0"
                style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; background: rgba(16, 185, 129, 0.18); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); text-transform: uppercase; letter-spacing: 0.4px;"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Đã tất toán</span>
              </span>
              <span
                v-else-if="daThanhToan(r) > 0 && congNo(r) > 0"
                style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 0.4px;"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Thanh toán 1 phần</span>
              </span>
              <span
                v-else
                style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; background: rgba(244, 63, 94, 0.18); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4); text-transform: uppercase; letter-spacing: 0.4px;"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Chưa thanh toán</span>
              </span>

              <!-- Badge Mốc hạn thanh toán / Đợt thanh toán -->
              <span
                v-if="congNo(r) > 0 && getPoDueInfo(r).dueBadgeText"
                @click.stop="openPaymentModal(r)"
                :style="{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  background: getPoDueInfo(r).dueStatus === 'qua_han'
                    ? 'rgba(239, 68, 68, 0.22)'
                    : (getPoDueInfo(r).dueStatus === 'den_han_hom_nay' || getPoDueInfo(r).dueStatus === 'sap_den_han')
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(56, 189, 248, 0.14)',
                  color: getPoDueInfo(r).dueStatus === 'qua_han'
                    ? '#fca5a5'
                    : (getPoDueInfo(r).dueStatus === 'den_han_hom_nay' || getPoDueInfo(r).dueStatus === 'sap_den_han')
                      ? '#fde047'
                      : '#7dd3fc',
                  border: getPoDueInfo(r).dueStatus === 'qua_han'
                    ? '1px solid rgba(239, 68, 68, 0.55)'
                    : (getPoDueInfo(r).dueStatus === 'den_han_hom_nay' || getPoDueInfo(r).dueStatus === 'sap_den_han')
                      ? '1px solid rgba(245, 158, 11, 0.45)'
                      : '1px solid rgba(56, 189, 248, 0.35)'
                }"
                title="Nhấp để xem / chỉnh sửa mốc thời gian thanh toán"
              >
                <svg v-if="getPoDueInfo(r).dueStatus === 'qua_han'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>{{ getPoDueInfo(r).dueBadgeText }}</span>
              </span>
            </div>

            <button
              type="button"
              @click.stop="openPaymentModal(r)"
              style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(56, 189, 248, 0.1)); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); transition: all 0.2s; box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);"
              onmouseover="this.style.background='linear-gradient(135deg, rgba(14, 165, 233, 0.35), rgba(56, 189, 248, 0.2))'; this.style.transform='translateY(-1px)'"
              onmouseout="this.style.background='linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(56, 189, 248, 0.1))'; this.style.transform='translateY(0)'"
              title="Ghi nhận thanh toán, thiết lập mốc hạn TT & Xem lịch sử công nợ"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span>Thanh toán / Hạn TT</span>
              <span v-if="getPaymentHistoryForPO(r).length > 0" style="background: #38bdf8; color: #0f172a; border-radius: 999px; padding: 0 6px; font-size: 11px; font-weight: 800;">
                {{ getPaymentHistoryForPO(r).length }}
              </span>
            </button>
          </div>
        </div>

        <div class="sr-rc-body" style="flex-direction: column;">
          <div class="sr-rc-meta-wrapper">
            <div class="sr-rc-meta">
              <div class="sr-meta-item"><label>MST</label><span>{{ r.MST || 'N/A' }}</span></div>
              <div class="sr-meta-item" style="grid-column: span 2; min-width: 250px;"><label>Customer</label><span class="content-text" style="font-weight: 700;">{{ r.Ten_cong_ty || 'N/A' }}</span></div>
              <div class="sr-meta-item"><label>AM</label><span class="highlight-text">{{ r.account_manager_name || 'N/A' }}</span></div>
              <div class="sr-meta-item"><label>Product Type</label><span class="badge-blue">{{ r.Ten_nha_cung_cap || 'N/A' }}</span></div>
            </div>
          </div>
          
          <div class="sr-rc-media-stack" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="sr-rc-image-preview" v-if="r.img_save" style="margin: 0; align-self: flex-start;">
              <a :href="r.img_save" target="_blank" title="Bấm để xem ảnh lớn" @click.stop>
                <img :src="r.img_save" alt="Chứng từ" />
                <div class="img-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                </div>
              </a>
            </div>

            <div class="sr-rc-links" v-if="r.link_excel_bao_gia || r.link_excel_mua_hang" style="display:flex; flex-direction:column; gap:8px; align-items: flex-start;">
              <div v-if="r.link_excel_bao_gia" style="display:flex; align-items:center; gap: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">File Báo giá :</span>
                <a :href="r.link_excel_bao_gia" target="_blank" @click.stop style="display:inline-flex;align-items:center;gap:6px;font-size:14px;color:#ffffff;text-decoration:none;font-weight:600; white-space: nowrap; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                  <img v-if="r.ten_file_bao_gia?.toLowerCase().endsWith('.pdf')" src="/pdf-icon.png" style="width: 20px; height: 20px; object-fit: contain;" />
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"/><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"/><path fill="#2E7D32" d="M27,42L6,38.746C5.416,38.655,5,38.146,5,37.555v-27.11c0-0.591,0.416-1.1,1-1.191L27,6V42z"/><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"/></svg>
                  <span>{{ r.ten_file_bao_gia || 'Báo giá' }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              </div>
              <div v-if="r.link_excel_mua_hang" style="display:flex; align-items:center; gap: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">File Mua hàng :</span>
                <a :href="r.link_excel_mua_hang" target="_blank" @click.stop style="display:inline-flex;align-items:center;gap:6px;font-size:14px;color:#ffffff;text-decoration:none;font-weight:600; white-space: nowrap; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                  <img v-if="r.ten_file_mua_hang?.toLowerCase().endsWith('.pdf')" src="/pdf-icon.png" style="width: 20px; height: 20px; object-fit: contain;" />
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"/><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"/><path fill="#2E7D32" d="M27,42L6,38.746C5.416,38.655,5,38.146,5,37.555v-27.11c0-0.591,0.416-1.1,1-1.191L27,6V42z"/><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"/></svg>
                  <span>{{ r.ten_file_mua_hang || 'Mua hàng' }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="sr-rc-finance">
          <div class="sr-fin-col">
            <div class="sr-fin-row sr-fin-row-clickable" @click.stop="openMultiEditModal(r, 'doanhSoBan')" title="Nhấp để sửa Doanh số bán"><span class="fin-lbl">Doanh số bán</span> <span class="fin-val">{{ fmt(doanhSoBan(r)) }}</span></div>
            <div class="sr-fin-row sr-fin-row-clickable" @click.stop="openMultiEditModal(r, 'giaMua')" title="Nhấp để sửa Giá mua"><span class="fin-lbl">Giá mua</span> <span class="fin-val">{{ fmt(giaMua(r)) }}</span></div>
            <div class="sr-fin-row sr-fin-row-clickable" @click.stop="openMultiEditModal(r, 'tongCP')" title="Nhấp để sửa Tổng CP đơn hàng"><span class="fin-lbl">Tổng CP đơn hàng</span> <span class="fin-val">{{ fmt(tongCP(r)) }}</span></div>
          </div>
          <div class="sr-fin-col">
            <div class="sr-fin-row sr-fin-row-clickable" @click.stop="openMultiEditModal(r, 'netCom')" title="Nhấp để sửa Net COM"><span class="fin-lbl">Net COM</span> <span class="fin-val text-green">{{ fmt(netCom(r)) }}</span></div>
            <div class="sr-fin-row sr-fin-row-clickable" @click.stop="openMultiEditModal(r, 'grossCom')" title="Nhấp để sửa Gross COM"><span class="fin-lbl">Gross COM</span> <span class="fin-val">{{ fmt(grossCom(r)) }}</span></div>
            <div class="sr-fin-row sr-fin-row-clickable" @click.stop="openMultiEditModal(r, 'taxPct')" title="Nhấp để sửa Thuế"><span class="fin-lbl">Thuế {{ thuePct(r) }}%</span> <span class="fin-val">{{ fmt(thue(r)) }}</span></div>
            <div class="sr-fin-row"><span class="fin-lbl">Net PO</span> <span class="fin-val">{{ fmt(netPO(r)) }}</span></div>
            <div class="sr-fin-row" style="margin-top: 8px"><span class="fin-lbl">Net Margin</span> <span class="fin-val" :class="netMargin(r) >= 0 ? 'text-green' : 'text-red'">{{ fmt(netMargin(r)) }}</span></div>
          </div>
          <div class="sr-fin-col highlight-col">
            <div class="sr-fin-row"><span class="fin-lbl">Net COM / Net PO</span> <span class="fin-val text-green">{{ pctFmt(netComPct(r)) }}</span></div>
            <div class="sr-fin-row"><span class="fin-lbl">Net Margin / Net PO</span> <span class="fin-val" :class="netMarginPct(r) >= 0 ? 'text-green' : 'text-red'">{{ pctFmt(netMarginPct(r)) }}</span></div>
            <div class="sr-fin-row" style="margin-top: 8px"><span class="fin-lbl">Net COM / Doanh số bán</span> <span class="fin-val text-green">{{ pctFmt(netComDsbPct(r)) }}</span></div>
            <div class="sr-fin-row"><span class="fin-lbl">Net Margin / Doanh số bán</span> <span class="fin-val" :class="netMarginDsbPct(r) >= 0 ? 'text-green' : 'text-red'">{{ pctFmt(netMarginDsbPct(r)) }}</span></div>
          </div>
          <div class="sr-fin-col" style="background: rgba(14, 165, 233, 0.04); border-top: 1px dashed rgba(56, 189, 248, 0.15);">
            <div class="sr-fin-row"><span class="fin-lbl" style="color: #38bdf8;">Tổng tiền sau VAT</span> <span class="fin-val" style="color: #38bdf8;">{{ fmt(tongSauVat(r)) }}</span></div>
            <div class="sr-fin-row sr-fin-row-clickable" @click.stop="openPaymentModal(r)" title="Nhấp để ghi nhận/xem lịch sử thanh toán"><span class="fin-lbl">Đã thanh toán</span> <span class="fin-val text-green">{{ fmt(daThanhToan(r)) }}</span></div>
            <div class="sr-fin-row sr-fin-row-clickable" @click.stop="openPaymentModal(r)" title="Nhấp để ghi nhận/xem lịch sử thanh toán"><span class="fin-lbl">Công nợ còn lại</span> <span class="fin-val" :class="congNo(r) > 0 ? 'text-red' : 'text-green'">{{ fmt(congNo(r)) }}</span></div>
            <div class="sr-fin-row" style="margin-top: 4px;"><span class="fin-lbl" style="font-size: 12px; color: #94a3b8;">Thời gian TT</span> <span style="font-size: 12px; color: #cbd5e1; font-family: 'JetBrains Mono', monospace;">{{ r.thoi_gian_thanh_toan ? fmtDate(r.thoi_gian_thanh_toan) : 'Chưa TT' }}</span></div>
            <div class="sr-fin-row sr-fin-row-clickable" @click.stop="openPaymentModal(r)" title="Nhấp để thiết lập mốc thời gian / đợt thanh toán" style="margin-top: 2px;">
              <span class="fin-lbl" style="font-size: 12px; color: #94a3b8;">
                Hạn thanh toán
                <span v-if="getPoDueInfo(r).loaiThanhToan === 'nhieu_dot'" style="color: #38bdf8; font-weight: 700;">
                  (Đợt {{ getPoDueInfo(r).currentDot }}/{{ getPoDueInfo(r).totalDots }})
                </span>
              </span>
              <span
                style="font-size: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 700;"
                :style="{
                  color: congNo(r) <= 0
                    ? '#34d399'
                    : getPoDueInfo(r).dueStatus === 'qua_han'
                      ? '#f87171'
                      : (getPoDueInfo(r).dueStatus === 'den_han_hom_nay' || getPoDueInfo(r).dueStatus === 'sap_den_han')
                        ? '#fbbf24'
                        : getPoDueInfo(r).nextDueDate
                          ? '#38bdf8'
                          : '#64748b'
                }"
              >
                {{ getPoDueInfo(r).nextDueDate || 'Chưa đặt hạn' }}
              </span>
            </div>
          </div>
        </div>
        


        <div class="sr-rc-footer" v-if="r.ghi_chu">
          <strong>Note:</strong> {{ r.ghi_chu }}
        </div>
      </div>
      </div>
      </div>

      <div v-if="displayLimit < filteredRows.length" style="display: flex; justify-content: center; margin-top: 24px; margin-bottom: 24px;">
        <button @click="loadMore" class="sr-btn sr-btn-import" style="background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px dashed rgba(56, 189, 248, 0.4); padding: 12px 32px; font-weight: 600; border-radius: 12px; transition: all 0.2s;" onmouseover="this.style.background='rgba(56, 189, 248, 0.2)'" onmouseout="this.style.background='rgba(56, 189, 248, 0.1)'">
          Xem thêm ({{ filteredRows.length - displayLimit }} bản ghi nữa)
        </button>
      </div>
    </div>

    <div v-if="loading" class="sr-loading">
      <div class="sr-spinner"></div>
      <p>Đang tải dữ liệu Sale Report...</p>
    </div>

    <div v-if="!loading && filteredRows.length === 0" class="sr-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <p>Chưa có dữ liệu Sale Report</p>
    </div>

    <!-- Multi Edit Modal -->
    <Teleport to="body">
      <div v-if="multiEditModal.show" class="sr-modal-overlay" :class="{ 'no-anim': isSwitchingTab }" @click.self="multiEditModal.show = false" style="z-index: 10000;">
        <div class="sr-modal sr-modal-large" :class="{ 'no-anim': isSwitchingTab }">
          
          <div class="sr-modal-body" style="background: transparent; padding: 0; max-height: 95vh; overflow-y: auto; border-radius: 16px;">
            <div v-if="multiEditModal.items.length === 0" style="text-align:center;color:#64748b;padding:20px;">
              Không có dữ liệu
            </div>
            <div v-for="(item, idx) in multiEditModal.items" :key="item.id">
              <div class="sr-import-card-header" style="border-radius: 16px 16px 0 0; border-top: none; border-left: none; border-right: none; background: linear-gradient(135deg, #1e293b, #0f172a); display: flex; justify-content: space-between; align-items: center;">
                 <h4 style="margin:0; font-size: 18px; color:#f8fafc;">{{ multiEditModal.mode === 'create' ? `📄 ${item.content}` : (item.content ? `🛒 ${item.content}` : `Cập nhật PO ${item.row?.So_PO}`) }}</h4>
                 <button v-if="idx === 0" @click="multiEditModal.show = false" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,.15)'; this.style.color='#ef4444'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'" title="Đóng cửa sổ">
                   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
              </div>
              <div class="sr-import-card-body" @input="isModalDirty = true" @change="isModalDirty = true" style="padding: 0; background: transparent;">
                

                <div style="display: flex; gap: 24px; padding: 24px; height: calc(90vh - 180px); box-sizing: border-box;">
  <div style="flex: 0 0 500px; display: flex; flex-direction: column; background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; min-width: 0;">
    <div style="padding: 16px; border-bottom: 1px solid #1e293b; background: rgba(15,23,42,.6); display: flex; align-items: center; flex-shrink: 0;">
      <h4 style="margin: 0; font-size: 14px; color: #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">📄 File Đính Kèm & Xem Trước</h4>
    </div>
    <div style="padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; flex: 1; min-height: 0;">
    <!-- FILE ĐÍNH KÈM -->
                  <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #334155; display: flex; flex-direction: column; gap: 12px;">
                    <label class="sr-modal-label" style="font-weight: 700; color: #e2e8f0; font-size: 13px; margin-bottom: 4px;">
                      📄 File đính kèm & Chứng từ
                    </label>

                    <!-- Ảnh chứng từ -->
                    <div style="background: rgba(15,23,42,.6); border: 1px dashed rgba(56,189,248,.3); border-radius: 8px; padding: 16px; display: flex; align-items: flex-start; gap: 16px;">
                      <div @click="triggerScan(item)" style="cursor:pointer; flex-shrink: 0; display:flex; flex-direction: column; align-items:center; justify-content: center; width: 64px; height: 64px; background:rgba(14,165,233,.1); border:1px solid rgba(14,165,233,.25); border-radius:8px;" :title="item.base64Img || item.row?.img_save ? 'Bấm để chọn ảnh khác' : 'Chọn ảnh chứng từ'">
                        <img v-if="item.base64Img || item.row?.img_save" :src="item.base64Img ? 'data:image/jpeg;base64,' + item.base64Img : item.row?.img_save" style="width:100%; height:100%; border-radius:8px; object-fit:cover; border:1px solid rgba(56,189,248,.3);" />
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                      </div>
                      <div style="flex: 1;">
                        <h5 style="margin: 0 0 4px 0; color: #e2e8f0; font-size: 13px;">Ảnh chứng từ</h5>
                        <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 12px; line-height: 1.4;">{{ item.scanning ? 'Đang tải và quét...' : (item.base64Img || item.row?.img_save ? 'Đã có ảnh chứng từ. Bấm vào hình thu nhỏ để đổi ảnh.' : 'Bấm vào khung bên trái để tải lên ảnh chứng từ và trích xuất dữ liệu.') }}</p>
                      </div>
                      <div style="display: flex; gap: 8px;">
                        <a v-if="item.row?.img_save || item.base64Img" :href="item.base64Img ? 'data:image/jpeg;base64,' + item.base64Img : item.row?.img_save" target="_blank" class="sr-btn" style="background: rgba(56,189,248,.1); color: #38bdf8; border: 1px solid rgba(56,189,248,.25); padding: 4px 12px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; text-decoration: none; gap: 6px;" title="Mở rộng để xem toàn bộ">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg> Mở rộng
                        </a>
                        <button v-if="!(item.base64Img || item.row?.img_save)" class="sr-btn" @click="triggerScan(item)" style="background: rgba(56,189,248,.1); color: #38bdf8; border: 1px dashed rgba(56,189,248,.4); padding: 4px 12px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Thêm ảnh
                        </button>
                        <button v-else class="sr-btn" @click="triggerScan(item)" style="background: rgba(56,189,248,.1); color: #38bdf8; border: 1px solid rgba(56,189,248,.25); padding: 4px 12px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center;">Đổi ảnh</button>
                      </div>
                    </div>
                    <!-- Ảnh chứng từ lớn (Luôn hiển thị) -->
                    <div v-if="item.base64Img || item.row?.img_save" style="margin-top: -4px; padding: 12px; background: rgba(15,23,42,.6); border: 1px solid #1e293b; border-radius: 8px; text-align: center;">
                       <img :src="item.base64Img ? 'data:image/jpeg;base64,' + item.base64Img : item.row?.img_save" style="max-height: 500px; max-width: 100%; object-fit: contain; border-radius: 6px; border: 1px solid #334155;" />
                    </div>

                    <!-- File Báo Giá -->
                    <div style="background: rgba(15,23,42,.6); border: 1px dashed rgba(16,185,129,.3); border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 16px;">
                      <div @click="triggerImport(item, 'update_item_bao_gia')" style="cursor:pointer; flex-shrink: 0; display:flex; align-items:center; justify-content: center; width: 40px; height: 40px; background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.25); border-radius:8px;" title="Chọn file Báo giá">
                        <img v-if="(item.rawFileBaoGia?.name || item.row?.ten_file_bao_gia)?.toLowerCase().endsWith('.pdf')" src="/pdf-icon.png" style="width: 24px; height: 24px; object-fit: contain;" />
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div style="flex: 1; overflow: hidden;">
                        <h5 style="margin: 0 0 4px 0; color: #e2e8f0; font-size: 13px;">File Báo giá</h5>
                        <div style="color: #34d399; font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          {{ item.rawFileBaoGia?.name || item.row?.ten_file_bao_gia || 'Chưa đính kèm file' }}
                        </div>
                      </div>
                      <div style="display: flex; gap: 8px;">
                        <a v-if="item.previewUrlBG || (item.row?.link_excel_bao_gia && !item.rawFileBaoGia)" :href="item.previewUrlBG ? (item.previewUrlBG.startsWith('blob:') ? item.previewUrlBG : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(item.previewUrlBG)}`) : ((item.row?.ten_file_bao_gia || item.row?.link_excel_bao_gia || '').toLowerCase().endsWith('.pdf') ? item.row.link_excel_bao_gia : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(item.row.link_excel_bao_gia)}`)" target="_blank" class="sr-btn" style="background: rgba(56,189,248,.1); color: #38bdf8; border: 1px solid rgba(56,189,248,.25); padding: 4px 12px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; text-decoration: none; gap: 6px;" title="Mở rộng để xem toàn bộ">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg> Mở rộng
                        </a>
                        <button v-if="!(item.rawFileBaoGia?.name || item.row?.ten_file_bao_gia)" class="sr-btn" @click="triggerImport(item, 'update_item_bao_gia')" style="background: rgba(16,185,129,.1); color: #34d399; border: 1px dashed rgba(16,185,129,.4); padding: 4px 12px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Thêm file
                        </button>
                        <button v-else class="sr-btn" @click="triggerImport(item, 'update_item_bao_gia')" style="background: rgba(16,185,129,.1); color: #34d399; border: 1px solid rgba(16,185,129,.25); padding: 4px 12px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center;">Đổi file</button>
                      </div>
                    </div>
                    <!-- Frame Báo Giá -->
                    <iframe v-if="item.previewUrlBG || (item.row?.link_excel_bao_gia && !item.rawFileBaoGia)" :src="item.previewUrlBG ? (item.previewUrlBG.startsWith('blob:') ? item.previewUrlBG : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.previewUrlBG)}`) : ((item.row?.ten_file_bao_gia || item.row?.link_excel_bao_gia || '').toLowerCase().endsWith('.pdf') ? item.row.link_excel_bao_gia : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.row.link_excel_bao_gia)}`)" style="width: 100%; height: 500px; border: 1px solid #334155; border-radius: 8px; margin-top: -4px; background: #fff;"></iframe>
                    <!-- Preview HTML Báo Giá (Excel local) -->
                    <div v-if="item.previewHtmlBG && !item.previewUrlBG" style="width: 100%; height: 500px; border: 1px solid #334155; border-radius: 8px; margin-top: -4px; background: #fff; overflow: auto; padding: 16px; color: #334155; font-size: 13px;" v-html="item.previewHtmlBG"></div>
                    <!-- File Mua Hàng -->
                    <div style="background: rgba(15,23,42,.6); border: 1px dashed rgba(190,24,93,.3); border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 16px;">
                      <div @click="triggerImport(item, 'update_item_mua_hang')" style="cursor:pointer; flex-shrink: 0; display:flex; align-items:center; justify-content: center; width: 40px; height: 40px; background:rgba(190,24,93,.1); border:1px solid rgba(190,24,93,.25); border-radius:8px;" title="Chọn file Mua hàng">
                        <img v-if="(item.rawFileMuaHang?.name || item.row?.ten_file_mua_hang)?.toLowerCase().endsWith('.pdf')" src="/pdf-icon.png" style="width: 24px; height: 24px; object-fit: contain;" />
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div style="flex: 1; overflow: hidden;">
                        <h5 style="margin: 0 0 4px 0; color: #e2e8f0; font-size: 13px;">File Mua hàng</h5>
                        <div style="color: #f472b6; font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          {{ item.rawFileMuaHang?.name || item.row?.ten_file_mua_hang || 'Chưa đính kèm file' }}
                        </div>
                      </div>
                      <div style="display: flex; gap: 8px;">
                        <a v-if="item.previewUrlMH || (item.row?.link_excel_mua_hang && !item.rawFileMuaHang)" :href="item.previewUrlMH ? (item.previewUrlMH.startsWith('blob:') ? item.previewUrlMH : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(item.previewUrlMH)}`) : ((item.row?.ten_file_mua_hang || item.row?.link_excel_mua_hang || '').toLowerCase().endsWith('.pdf') ? item.row.link_excel_mua_hang : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(item.row.link_excel_mua_hang)}`)" target="_blank" class="sr-btn" style="background: rgba(56,189,248,.1); color: #38bdf8; border: 1px solid rgba(56,189,248,.25); padding: 4px 12px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; text-decoration: none; gap: 6px;" title="Mở rộng để xem toàn bộ">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg> Mở rộng
                        </a>
                        <button v-if="!(item.rawFileMuaHang?.name || item.row?.ten_file_mua_hang)" class="sr-btn" @click="triggerImport(item, 'update_item_mua_hang')" style="background: rgba(190,24,93,.1); color: #f472b6; border: 1px dashed rgba(190,24,93,.4); padding: 4px 12px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Thêm file
                        </button>
                        <button v-else class="sr-btn" @click="triggerImport(item, 'update_item_mua_hang')" style="background: rgba(190,24,93,.1); color: #f472b6; border: 1px solid rgba(190,24,93,.25); padding: 4px 12px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center;">Đổi file</button>
                      </div>
                    </div>
                    <!-- Frame Mua Hàng -->
                    <iframe v-if="item.previewUrlMH || (item.row?.link_excel_mua_hang && !item.rawFileMuaHang)" :src="item.previewUrlMH ? (item.previewUrlMH.startsWith('blob:') ? item.previewUrlMH : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.previewUrlMH)}`) : ((item.row?.ten_file_mua_hang || item.row?.link_excel_mua_hang || '').toLowerCase().endsWith('.pdf') ? item.row.link_excel_mua_hang : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.row.link_excel_mua_hang)}`)" style="width: 100%; height: 500px; border: 1px solid #334155; border-radius: 8px; margin-top: -4px; background: #fff;"></iframe>
                    <div v-if="item.previewHtmlMH && !item.previewUrlMH" style="width: 100%; height: 500px; border: 1px solid #334155; border-radius: 8px; margin-top: -4px; background: #fff; overflow: auto; padding: 16px; color: #334155; font-size: 13px;" v-html="item.previewHtmlMH"></div>
                  </div>
                
    </div>
  </div>
  <div style="flex: 1; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; padding-right: 8px; min-height: 0;">
    <div style="background: linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9)); border: 1px solid rgba(56,189,248,0.2); border-radius: 12px; padding: 20px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.3); flex-shrink: 0; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #38bdf8, transparent); opacity: 0.5;"></div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(51,65,85,0.8); padding-bottom: 12px; margin-bottom: 20px;">
        <h4 style="margin: 0; font-size: 15px; color: #f8fafc; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          Thông tin tổng quan PO
        </h4>
        
        <div style="display: flex; align-items: center; gap: 8px; background: rgba(15,23,42,0.6); border: 1px solid rgba(51,65,85,0.6); padding: 4px 12px; border-radius: 20px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <input type="text" v-model="item.createdTime" style="background: transparent; border: none; color: #cbd5e1; font-size: 12px; width: 140px; outline: none; font-family: monospace;" placeholder="Thời gian tạo..." />
        </div>
      </div>

                <!-- UPDATE MODE: ROW SELECTOR -->
                <div class="sr-form-group" v-if="multiEditModal.mode === 'update'" style="margin-bottom: 24px;">
                  <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">Map với PO (Chọn để lấy dữ liệu Báo giá)</label>
                  <select v-model="item.row" class="sr-modal-input text-left" style="border-color: #38bdf8; border-width: 2px; background: rgba(15,23,42,1); font-weight: 600;" @change="onRowSelectedInModal(item)">
                    <option :value="null" style="background: #0f172a; color: #94a3b8;">-- Chọn PO cần cập nhật --</option>
                    <option v-for="r in rows" :key="r.ID" :value="r" style="background: #0f172a; color: #4ade80; font-weight: 500;">
                      PO: {{ r.So_PO }} - {{ r.Ten_cong_ty }}
                    </option>
                  </select>
                </div>

                <!-- PO FIELDS (FOR BOTH CREATE AND UPDATE MODE) -->
                <template v-if="multiEditModal.mode === 'create' || (multiEditModal.mode === 'update' && item.row)">
                  <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px;">
                    <!-- Row 1 -->
                    <div class="sr-form-group" style="grid-column: span 2; margin: 0;">
                      <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">PO</label>
                      <input type="text" v-model="item.soPO" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                    </div>
                    <div class="sr-form-group" style="grid-column: span 6; margin: 0;">
                      <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">Content of contract/PO (Tên File)</label>
                      <input type="text" v-model="item.content" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); color: #38bdf8; transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                    </div>
                    <div class="sr-form-group" style="grid-column: span 2; margin: 0;">
                      <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">Product Type</label>
                      <input type="text" v-model="item.productType" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                    </div>
                    <div class="sr-form-group" style="grid-column: span 2; margin: 0;">
                      <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">AM</label>
                      <input type="text" v-model="item.am" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                    </div>

                    <!-- Row 2: Customer Info Header + DB Picker + Option A/B Conflict Switcher -->
                    <div style="grid-column: span 12; display: flex; flex-direction: column; gap: 8px; margin-top: 2px; padding-top: 10px; border-top: 1px dashed rgba(51,65,85,0.6);">
                      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                          <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; display: inline-flex; align-items: center; gap: 5px;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Thông tin khách hàng (MST / Công ty / Người nhận)
                          </span>
                          <span v-if="getMatchedDbCustomerForItem(item)" style="font-size: 11px; padding: 2px 8px; border-radius: 999px; background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.3); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;" :title="'Giữ nguyên Mã KH: ' + getMatchedDbCustomerForItem(item).ma_khach_hang + ' | Mã công ty: ' + (getMatchedDbCustomerForItem(item).ma_cong_ty || '')">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Đã liên kết DB: {{ getMatchedDbCustomerForItem(item).ma_khach_hang }}
                          </span>
                          <span v-else-if="item.customer || item.recipient" style="font-size: 11px; padding: 2px 8px; border-radius: 999px; background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            Khách mới (Tự tạo vào DB khi lưu)
                          </span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                          <!-- Quick toggle DB vs Quote name when different -->
                          <template v-if="hasItemCustomerDiffWithQuote(item)">
                            <button type="button" @click="applyItemCustomerSource(item, 'db')" style="background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.35); border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Áp dụng tên khách hàng đang lưu trong DB (Giữ nguyên Mã KH)">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                              Dùng tên DB
                            </button>
                            <button type="button" @click="applyItemCustomerSource(item, 'quote')" style="background: rgba(168,85,247,0.12); color: #c084fc; border: 1px solid rgba(168,85,247,0.35); border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Áp dụng tên vừa trích xuất từ file Báo giá (Giữ nguyên Mã KH)">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                              Dùng tên Báo giá
                            </button>
                          </template>
                          <button type="button" @click="toggleItemCustomerPicker(item)" style="background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.35); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <span>{{ item.customerPickerOpen ? 'Đóng danh sách KH' : 'Chọn KH từ DB' }}</span>
                          </button>
                        </div>
                      </div>

                      <!-- Dropdown / Drawer chọn khách hàng từ DB -->
                      <div v-if="item.customerPickerOpen" style="background: rgba(15,23,42,0.95); border: 1px solid rgba(56,189,248,0.4); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.45);">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <div style="position: relative; flex: 1;">
                            <input
                              type="text"
                              v-model="item.customerSearchQuery"
                              placeholder="Tìm theo Tên công ty, Người nhận, Mã KH, MST..."
                              class="sr-modal-input text-left"
                              style="width: 100%; padding: 6px 10px 6px 30px; font-size: 12px; background: rgba(30,41,59,0.8); border-color: rgba(56,189,248,0.35);"
                            />
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 9px; top: 50%; transform: translateY(-50%); pointer-events: none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          </div>
                          <span style="font-size: 11px; color: #64748b; white-space: nowrap;">{{ getFilteredDbCustomersForItem(item).length }} kết quả</span>
                        </div>
                        <div style="max-height: 185px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;" class="sr-scroll">
                          <div
                            v-for="c in getFilteredDbCustomersForItem(item)"
                            :key="c.id || c.ma_khach_hang"
                            @click="selectDbCustomerForModalItem(item, c)"
                            style="padding: 7px 10px; border-radius: 6px; background: rgba(30,41,59,0.65); border: 1px solid rgba(51,65,85,0.6); cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px; transition: all 0.15s;"
                            onmouseover="this.style.borderColor='#38bdf8'; this.style.background='rgba(56,189,248,0.1)'"
                            onmouseout="this.style.borderColor='rgba(51,65,85,0.6)'; this.style.background='rgba(30,41,59,0.65)'"
                          >
                            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
                              <div style="font-size: 12px; font-weight: 700; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                {{ c.ten_cong_ty || c.ten_khach_hang || c.ma_khach_hang }}
                              </div>
                              <div style="font-size: 11px; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 10px;">
                                <span>Người nhận: <strong style="color: #cbd5e1;">{{ c.ten_khach_hang || '—' }}</strong></span>
                                <span>MST: <strong style="color: #38bdf8; font-family: monospace;">{{ c.mst || '—' }}</strong></span>
                              </div>
                            </div>
                            <span style="font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px; background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.25); white-space: nowrap; flex-shrink: 0;">
                              {{ c.ma_khach_hang }}
                            </span>
                          </div>
                          <div v-if="getFilteredDbCustomersForItem(item).length === 0" style="padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
                            Không tìm thấy khách hàng phù hợp trong DB.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="sr-form-group" style="grid-column: span 2; margin: 0;">
                      <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">MST</label>
                      <input type="text" v-model="item.mst" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); font-family: monospace; transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                    </div>
                    <div class="sr-form-group" style="grid-column: span 6; margin: 0;">
                      <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">Customer (Tên công ty)</label>
                      <input type="text" v-model="item.customer" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                    </div>
                    <div class="sr-form-group" style="grid-column: span 4; margin: 0;">
                      <label class="sr-modal-label" style="margin-bottom: 6px; color: #ffffff; font-weight: 700;">Người nhận (Tên KH)</label>
                      <input type="text" v-model="item.recipient" class="sr-modal-input text-left" style="background: rgba(15,23,42,0.6); border-color: rgba(51,65,85,0.8); transition: all 0.2s;" onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 0 2px rgba(56,189,248,0.2)'" onblur="this.style.borderColor='rgba(51,65,85,0.8)'; this.style.boxShadow='none'" />
                    </div>
                  </div>
                </template>

                     </div>
    <div style="background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; margin-top: 8px;">
        <div style="display: flex; border-bottom: 1px solid #1e293b; background: rgba(30,41,59,.5);">
            <button @click="item.activeTab = 'metrics'" :style="{ padding: '12px 24px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: item.activeTab !== 'goods' ? '#10b981' : '#94a3b8', borderBottom: item.activeTab !== 'goods' ? '2px solid #10b981' : '2px solid transparent', background: 'transparent', cursor: 'pointer', transition: 'all .2s', flex: 1, borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none' }">Chỉ số tài chính</button>
            <button v-if="item.goodsList && item.goodsList.length > 0" @click="item.activeTab = 'goods'" :style="{ padding: '12px 24px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: item.activeTab === 'goods' ? '#38bdf8' : '#94a3b8', borderBottom: item.activeTab === 'goods' ? '2px solid #38bdf8' : '2px solid transparent', background: 'transparent', cursor: 'pointer', transition: 'all .2s', flex: 1, borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none' }">Bảng Hàng Hóa</button>
        </div>
        
        <div style="padding: 16px;">
            <!-- FINANCIAL FIELDS TAB -->
            <div v-show="item.activeTab !== 'goods'">
                <!-- FINANCIAL FIELDS -->
                <template v-if="multiEditModal.mode === 'create' || item.row">
                  <div class="sr-modal-finance-grid" style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 16px;">
                    <!-- Cột 1 -->
                    <div class="sr-modal-fin-col">
                      <div class="sr-form-group" style="margin: 0;">
                        <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Doanh số bán</label>
                        <input :id="'input-doanhSoBan-' + item.id" type="text" :value="fmtInput(item.doanhSoBan)" @input="e => formatNumberInput(e, item, 'doanhSoBan')" class="sr-modal-input text-right" style="padding: 6px 10px;" />
                      </div>
                      <div class="sr-form-group" style="margin: 0;">
                        <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Giá mua</label>
                        <input :id="'input-giaMua-' + item.id" type="text" :value="fmtInput(item.giaMua)" @input="e => formatNumberInput(e, item, 'giaMua')" class="sr-modal-input text-right" style="padding: 6px 10px;" />
                      </div>
                      <div class="sr-form-group" style="margin: 0;">
                        <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Tổng CP đơn hàng</label>
                        <input :id="'input-tongCP-' + item.id" type="text" :value="fmtInput(item.tongCP)" @input="e => formatNumberInput(e, item, 'tongCP')" class="sr-modal-input text-right" style="padding: 6px 10px;" />
                      </div>
                    </div>

                    <!-- Cột 2 -->
                    <div class="sr-modal-fin-col">
                      <div class="sr-form-group" style="margin: 0;">
                        <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Net COM </label>
                        <input :id="'input-netCom-' + item.id" type="text" :value="fmtInput(item.netCom)" @input="e => formatNumberInput(e, item, 'netCom', true)" class="sr-modal-input text-right" style="color: #34d399; font-weight: 700; padding: 6px 10px; border-color: rgba(16,185,129,.3); background: rgba(16,185,129,.08);" />
                      </div>
                      <div class="sr-form-group" style="margin: 0;">
                        <label class="sr-modal-label" style="color: #ffffff; font-weight: 700; margin-bottom: 6px; display: block;">Gross com</label>
                        <input :id="'input-grossCom-' + item.id" type="text" :value="fmtInput(item.grossCom)" @input="e => formatNumberInput(e, item, 'grossCom')" class="sr-modal-input text-right" style="padding: 6px 10px;" />
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; gap: 8px;">
                        <span style="font-size: 13px; color: #ffffff; font-weight: 700; white-space: nowrap;">Thuế</span>
                        <input :id="'input-taxPct-' + item.id" type="number" v-model.number="item.taxPct" @input="() => onFinancialInput(item, 'taxPct' as any)" class="sr-modal-input text-right" style="border-color:#38bdf8; background:rgba(56,189,248,.06); padding: 4px 8px; width: 60px; flex-shrink: 0; font-size: 13px;" />
                        <span style="font-size: 13px; color: #94a3b8;">%</span>
                        <strong style="color: #cbd5e1; font-size: 14px; margin-left: auto; white-space: nowrap;">{{ fmt(item.grossCom * ((item.taxPct || 0) / 100)) }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                        <span style="font-size: 13px; color: #ffffff; font-weight: 700;">Net PO</span>
                        <strong style="color: #f8fafc; font-size: 14px;">{{ fmt(item.doanhSoBan - item.grossCom) }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0 0 0; border-top: 1px dashed #334155; margin-top: 6px;">
                        <span style="font-size: 13px; color: #ffffff; font-weight: 700;">Net Margin</span>
                        <strong style="font-size: 14px;" :class="(item.doanhSoBan - item.grossCom - item.tongCP) >= 0 ? 'text-green' : 'text-red'">{{ fmt(item.doanhSoBan - item.grossCom - item.tongCP) }}</strong>
                      </div>
                    </div>

                    <!-- Cột 3: Highlight -->
                    <div class="sr-modal-fin-col highlight-col">
                      <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="font-size: 12px; color: #ffffff; font-weight: 700;">Net COM / Net PO</span>
                        <strong style="font-size: 13px; color: #22c55e;">{{ pctFmt(item.doanhSoBan - item.grossCom !== 0 ? (item.netCom / (item.doanhSoBan - item.grossCom)) * 100 : 0) }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="font-size: 12px; color: #ffffff; font-weight: 700;">Net Margin / Net PO</span>
                        <strong style="font-size: 13px;" :class="(item.doanhSoBan - item.grossCom) !== 0 && (item.doanhSoBan - item.grossCom - item.tongCP) / (item.doanhSoBan - item.grossCom) >= 0 ? 'text-green' : 'text-red'">{{ pctFmt(item.doanhSoBan - item.grossCom !== 0 ? ((item.doanhSoBan - item.grossCom - item.tongCP) / (item.doanhSoBan - item.grossCom)) * 100 : 0) }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid rgba(16,185,129,.15); margin-top: 4px; padding-top: 8px;">
                        <span style="font-size: 12px; color: #ffffff; font-weight: 700;">Net COM / DSB</span>
                        <strong style="font-size: 13px; color: #22c55e;">{{ pctFmt(item.doanhSoBan !== 0 ? (item.netCom / item.doanhSoBan) * 100 : 0) }}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="font-size: 12px; color: #ffffff; font-weight: 700;">Net Margin / DSB</span>
                        <strong style="font-size: 13px;" :class="item.doanhSoBan !== 0 && (item.doanhSoBan - item.grossCom - item.tongCP) / item.doanhSoBan >= 0 ? 'text-green' : 'text-red'">{{ pctFmt(item.doanhSoBan !== 0 ? ((item.doanhSoBan - item.grossCom - item.tongCP) / item.doanhSoBan) * 100 : 0) }}</strong>
                      </div>

                      <!-- Dự đoán Net Margin / DSB -->
                      <div style="margin-top: auto; padding: 10px; background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2); border-radius: 6px;">
                        <label class="sr-modal-label" style="color: #fbbf24; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; font-size: 11px;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                          Dự đoán Net Margin / DSB
                        </label>
                        <div style="display: flex; gap: 6px; align-items: center;">
                          <input type="number" placeholder="Nhập %..." :value="item.predictPct" @input="e => onPredictInput(e, item)" class="sr-modal-input text-right" style="border-color: rgba(245,158,11,.3); flex: 1; padding: 4px 8px; font-size: 13px; background: rgba(15,23,42,.8);" />
                          <span style="color: #fbbf24; font-weight: 600; font-size: 13px;">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Thanh toán & Công nợ Bar trong Modal -->
                  <div style="margin-top: 14px; padding: 12px 16px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
                      <div>
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Tổng tiền sau thuế VAT</div>
                        <div style="font-size: 15px; font-weight: 800; color: #38bdf8; margin-top: 2px;">
                          {{ fmt(item.goodsTotal?.ttSau || (item.row ? tongSauVat(item.row) : item.doanhSoBan)) }} đ
                        </div>
                      </div>
                      <div style="height: 28px; width: 1px; background: #334155;"></div>
                      <div v-if="multiEditModal.mode === 'create'">
                        <label style="font-size: 11px; color: #34d399; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 4px;">Khách đã thanh toán ban đầu</label>
                        <input type="text" :value="fmtInput(item.soTienDaThanhToan || 0)" @input="e => formatNumberInput(e, item, 'soTienDaThanhToan', false)" placeholder="0" class="sr-modal-input text-right" style="padding: 5px 10px; width: 160px; color: #34d399; font-weight: 700; border-color: rgba(16,185,129,0.4);" />
                      </div>
                      <div v-else>
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Khách đã thanh toán</div>
                        <div style="font-size: 15px; font-weight: 800; color: #34d399; margin-top: 2px;">
                          {{ fmt(item.row ? daThanhToan(item.row) : 0) }} đ
                        </div>
                      </div>
                      <div style="height: 28px; width: 1px; background: #334155;"></div>
                      <div>
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Công nợ còn lại</div>
                        <div style="font-size: 15px; font-weight: 800; margin-top: 2px;" :style="{ color: Math.max(0, (item.goodsTotal?.ttSau || (item.row ? tongSauVat(item.row) : item.doanhSoBan)) - (multiEditModal.mode === 'create' ? (item.soTienDaThanhToan || 0) : (item.row ? daThanhToan(item.row) : 0))) > 0 ? '#f87171' : '#34d399' }">
                          {{ fmt(Math.max(0, (item.goodsTotal?.ttSau || (item.row ? tongSauVat(item.row) : item.doanhSoBan)) - (multiEditModal.mode === 'create' ? (item.soTienDaThanhToan || 0) : (item.row ? daThanhToan(item.row) : 0)))) }} đ
                        </div>
                      </div>
                      <div v-if="item.row && item.row.thoi_gian_thanh_toan" style="height: 28px; width: 1px; background: #334155;"></div>
                      <div v-if="item.row && item.row.thoi_gian_thanh_toan">
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Thanh toán gần nhất</div>
                        <div style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-top: 3px;">{{ fmtDate(item.row.thoi_gian_thanh_toan) }}</div>
                      </div>
                    </div>
                    <button v-if="multiEditModal.mode === 'update' && item.row" type="button" @click="openPaymentModal(item.row)" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.2)); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.45); border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;">
                      💳 Quản lý Thanh toán & Lịch sử ({{ getPaymentHistoryForPO(item.row).length }})
                    </button>
                  </div>
                </template>
            </div>

            <!-- GOODS TABLE TAB -->
            <div v-show="item.activeTab === 'goods'" style="overflow-x: auto;" class="custom-scrollbar">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #e2e8f0; min-width: 1000px;">
                <thead>
                  <tr style="background: rgba(15,23,42,.8); border-bottom: 1px solid #334155; text-align: left;">
                    <th style="padding: 8px; white-space: nowrap;">STT</th>
                    <th style="padding: 8px; white-space: nowrap;">TÊN HÀNG HÓA</th>
                    <th style="padding: 8px; white-space: nowrap;">DIỄN GIẢI</th>
                    <th style="padding: 8px; white-space: nowrap;">DVT</th>
                    <th style="padding: 8px; text-align: center; white-space: nowrap;">S.L</th>
                    <th style="padding: 8px; text-align: right; white-space: nowrap;">ĐƠN GIÁ</th>
                    <th style="padding: 8px; text-align: right; white-space: nowrap;">TT TRƯỚC THUẾ</th>
                    <th style="padding: 8px; text-align: right; white-space: nowrap;">THUẾ VAT</th>
                    <th style="padding: 8px; text-align: right; white-space: nowrap;">TT SAU THUẾ</th>
                    <th style="padding: 8px; text-align: center; width: 40px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(g, i) in item.goodsList" :key="i">
                    <!-- Danh mục Row -->
                    <tr v-if="g.danhMuc && (i === 0 || g.danhMuc !== item.goodsList[i-1].danhMuc)">
                      <td colspan="10" style="padding: 0; background-color: #1e3a8a;">
                        <input :value="g.danhMuc" @input="updateCategory(item, i, $event.target.value, g.danhMuc)" style="width: 100%; padding: 10px 12px; background: transparent; color: #ffffff; font-weight: bold; text-transform: uppercase; border: none; font-size: 13px; outline: none; text-align: left;" placeholder="Tên danh mục..." />
                      </td>
                    </tr>
                    
                    <tr style="border-bottom: 1px dashed #1e293b;">
                      <td style="padding: 16px 8px;">{{ g.stt }}</td>
                      <td style="padding: 16px 8px; vertical-align: top;">
                      <textarea v-model="g.ten" class="sr-modal-input custom-scrollbar" style="width: 100%; min-width: 150px; padding: 10px 8px; border-color: #334155; font-size: 13px; min-height: 70px; background: rgba(15,23,42,.6); color: #f8fafc; font-weight: 600; resize: vertical; text-align: left; line-height: 1.4;" rows="2" @input="isModalDirty = true"></textarea>
                    </td>
                    <td style="padding: 16px 8px; vertical-align: top;">
                      <textarea v-model="g.dienGiai" class="sr-modal-input custom-scrollbar" style="width: 100%; min-width: 200px; padding: 10px 8px; border-color: #334155; font-size: 12px; min-height: 70px; background: rgba(15,23,42,.6); color: #94a3b8; resize: vertical; text-align: left; line-height: 1.4;" rows="2" @input="isModalDirty = true"></textarea>
                    </td>
                    <td style="padding: 16px 8px;">{{ g.dvt }}</td>
                    <td style="padding: 16px 8px; text-align: center;">
                       <input type="text" :value="g.slStr !== undefined ? g.slStr : g.sl" @input="e => onGoodsInput(e, item, g, 'sl')" class="sr-modal-input text-center" style="width: 50px; padding: 6px 4px; border-color: #334155; font-size: 12px; height: 32px; background: rgba(15,23,42,.6);" />
                    </td>
                    <td style="padding: 16px 8px; text-align: right; color: #fbbf24;">
                       <input type="text" :value="g.donGiaStr !== undefined ? g.donGiaStr : fmtInput(g.donGia)" @input="e => onGoodsInput(e, item, g, 'donGia')" class="sr-modal-input text-right" style="width: 110px; padding: 6px 4px; border-color: #334155; color: #fbbf24; font-size: 12px; height: 32px; background: rgba(15,23,42,.6);" />
                    </td>
                    <td style="padding: 16px 8px; text-align: right;">{{ fmtInput(g.ttTruoc) }}</td>
                    <td style="padding: 16px 8px; text-align: right; min-width: 100px;">
                       <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                          <div style="display: flex; align-items: center; gap: 4px;">
                             <input type="text" :value="g.vatPct" @input="e => onGoodsInput(e, item, g, 'vatPct')" class="sr-modal-input text-center" style="width: 50px; padding: 6px 4px; border-color: #334155; font-size: 12px; height: 32px; background: rgba(15,23,42,.6);" placeholder="%" />
                             <span style="color: #94a3b8; font-size: 12px; font-weight: bold;">%</span>
                          </div>
                          <input type="text" :value="g.vatStr !== undefined ? g.vatStr : fmtInput(g.vat)" @input="e => onGoodsInput(e, item, g, 'vat')" class="sr-modal-input text-right" style="width: 110px; padding: 6px 4px; border-color: #334155; font-size: 12px; height: 32px; background: rgba(15,23,42,.6);" placeholder="VNĐ" />
                       </div>
                    </td>
                    <td style="padding: 16px 8px; text-align: right; color: #22c55e; font-weight: 600;">{{ fmtInput(g.ttSau) }}</td>
                    <td style="padding: 16px 8px; text-align: center;">
                       <button @click="removeGoodsRow(item, i)" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" class="hover:bg-red-500/20" title="Xóa hàng hóa">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </td>
                  </tr>
                  </template>
                  <tr v-if="item.goodsTotal" style="background: rgba(16,185,129,.1); font-weight: 700; color: #22c55e;">
                    <td style="padding: 10px 8px;"></td>
                    <td colspan="5" style="padding: 10px 8px; text-align: left; text-transform: uppercase; padding-left: 8px;">Tổng Cộng</td>
                    <td style="padding: 10px 8px; text-align: right;">{{ fmtInput(item.goodsTotal.ttTruoc) }}</td>
                    <td style="padding: 10px 8px; text-align: right;">{{ fmtInput(item.goodsTotal.vat) }}</td>
                    <td style="padding: 10px 8px; text-align: right; font-size: 13px;">{{ fmtInput(item.goodsTotal.ttSau) }}</td>
                    <td style="padding: 10px 8px;"></td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
    </div>
  </div>
</div>
</div>
<div class="sr-import-card-footer" style="padding: 16px 24px; border-top: 1px solid #1e293b; display: flex; align-items: center; background: rgba(15,23,42,.6); border-radius: 0 0 16px 16px;">
                <div style="flex: 1; text-align: left;">
                  <button class="sr-btn-remove" @click="deletePO(item, idx)" style="padding: 8px 16px; font-size: 13px;">🗑 Xóa PO</button>
                </div>
                <div style="flex: 1; text-align: center; display: flex; justify-content: center;">
                  <button v-if="isModalDirty || multiEditModal.mode === 'create'" class="sr-btn sr-btn-save" @click="saveMultiModal" :disabled="savingModal || multiEditModal.items.length === 0" style="padding: 12px 48px; font-size: 15px; font-weight: bold; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s;">
                    <svg v-if="savingModal" class="spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    {{ savingModal ? 'Đang lưu...' : (multiEditModal.mode === 'create' ? '💾 LƯU TẤT CẢ' : '💾 LƯU THAY ĐỔI') }}
                  </button>
                </div>
                <div style="flex: 1; text-align: right;">
                  <button class="sr-btn sr-btn-cancel" @click="multiEditModal.show = false" style="padding: 8px 16px; font-size: 13px; background: rgba(100,116,139,.1); color: #cbd5e1; border: 1px solid rgba(100,116,139,.3); border-radius: 6px;">Hủy bỏ</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Hidden file input for import -->
    <input type="file" ref="fileInput" style="display: none" accept=".xlsx, .xls, .pdf" multiple @change="onFileSelected" />
    <!-- Hidden file input for scanning image -->
    <input type="file" ref="scanInput" style="display: none" accept="image/*" @change="onScanSelected" />

    <!-- Scan Confirm Modal -->
    <Teleport to="body">
      <div v-if="scanConfirmModal.show" class="sr-modal-overlay" :class="{ 'no-anim': isSwitchingTab }" @click.self="closeScanConfirmModal" style="z-index: 10000">
        <div class="sr-modal" style="max-width: 500px">
          <div class="sr-modal-header">
            <div class="sr-modal-icon" style="background:rgba(2,132,199,.2);color:#0284c7">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div>
              <h3>Kết quả quét ảnh</h3>
              <p class="sr-modal-sub">Vui lòng kiểm tra lại số liệu</p>
            </div>
            <button class="sr-modal-close" @click="closeScanConfirmModal">&times;</button>
          </div>
          <div class="sr-modal-body">
            <!-- Add image preview -->
            <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-height: 200px; display: flex; justify-content: center; background: #f1f5f9;">
              <img v-if="scanConfirmModal.imageUrl" :src="scanConfirmModal.imageUrl" style="max-width: 100%; object-fit: contain;" alt="Scanned Image" />
            </div>

            <div class="sr-form-group">
              <label class="sr-modal-label">Nâng giá (Gross com)</label>
              <input type="text" :value="fmtInput(scanConfirmModal.nangGia)" readonly class="sr-modal-input text-right" style="background: #f8fafc; font-weight: 600" />
            </div>
            <div class="sr-form-group">
              <label class="sr-modal-label">Thuế %</label>
              <input type="text" :value="scanConfirmModal.thuePct + '%'" readonly class="sr-modal-input text-right" style="background: #f8fafc; font-weight: 600" />
            </div>
            <div class="sr-form-group">
              <label class="sr-modal-label">Còn lại (Net com)</label>
              <input type="text" :value="fmtInput(scanConfirmModal.conLai)" readonly class="sr-modal-input text-right" style="background: #f8fafc; font-weight: 600; color: #16a34a" />
            </div>
          </div>
          <div class="sr-modal-footer">
            <button class="sr-btn sr-btn-cancel" @click="closeScanConfirmModal">Hủy</button>
            <button class="sr-btn sr-btn-save" style="background:#0284c7;box-shadow:0 2px 8px rgba(2,132,199,.3)" @click="confirmScanResult">
              ✅ Xác nhận & Áp dụng
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Export Modal -->
    <Teleport to="body">
      <div v-if="showExportModal" class="sr-modal-overlay" :class="{ 'no-anim': isSwitchingTab }" @click.self="showExportModal = false">
        <div class="sr-modal" style="max-width: 700px; width: 90vw;">
          <div class="sr-modal-header">
            <div class="sr-modal-icon" style="background:rgba(16,185,129,.2);color:#34d399">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div>
              <h3>Xuất Sale Report</h3>
              <p class="sr-modal-sub">Chọn tháng để xuất file Excel</p>
            </div>
            <button class="sr-modal-close" @click="showExportModal = false">&times;</button>
          </div>
          <div class="sr-modal-body" style="max-height: 60vh; display: flex; flex-direction: column;">
            
            <!-- BƯỚC 1: CHỌN THỜI GIAN -->
            <div v-if="!showExportPreview" style="display: flex; flex-direction: column; gap: 16px; max-width: 400px; margin: 0 auto; width: 100%; padding: 20px 0;">
              <div class="elite-date-group group-tabs" style="width: 100%;">
                <label class="sr-modal-label" style="margin-bottom: 12px; display: block; text-align: center; font-size: 14px;">Phân loại thời gian</label>
                <div class="elite-mode-tabs" style="width: 100%; display: flex; background: rgba(15,23,42,0.8); border-radius: 8px; padding: 4px; border: 1px solid #1e293b;">
                  <button type="button" :class="{ active: exportTimeMode === 'day' }" @click="exportTimeMode = 'day'" style="flex: 1; border: none; background: transparent; padding: 8px; color: #94a3b8; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="if(!this.classList.contains('active')) this.style.color='#f8fafc'" onmouseout="if(!this.classList.contains('active')) this.style.color='#94a3b8'" :style="exportTimeMode === 'day' ? 'background: rgba(56,189,248,0.15); color: #38bdf8; font-weight: 600;' : ''">Ngày</button>
                  <button type="button" :class="{ active: exportTimeMode === 'month' }" @click="exportTimeMode = 'month'" style="flex: 1; border: none; background: transparent; padding: 8px; color: #94a3b8; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="if(!this.classList.contains('active')) this.style.color='#f8fafc'" onmouseout="if(!this.classList.contains('active')) this.style.color='#94a3b8'" :style="exportTimeMode === 'month' ? 'background: rgba(56,189,248,0.15); color: #38bdf8; font-weight: 600;' : ''">Tháng</button>
                  <button type="button" :class="{ active: exportTimeMode === 'year' }" @click="exportTimeMode = 'year'" style="flex: 1; border: none; background: transparent; padding: 8px; color: #94a3b8; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="if(!this.classList.contains('active')) this.style.color='#f8fafc'" onmouseout="if(!this.classList.contains('active')) this.style.color='#94a3b8'" :style="exportTimeMode === 'year' ? 'background: rgba(56,189,248,0.15); color: #38bdf8; font-weight: 600;' : ''">Năm</button>
                </div>
              </div>

              <template v-if="exportTimeMode === 'day'">
                <div class="elite-date-group group-date" style="width: 100%;">
                  <label style="color: #94a3b8 !important; margin-bottom: 4px; display: block; font-size: 12px;">Từ ngày</label>
                  <input type="date" v-model="exportDateFrom" :max="exportDateTo" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" style="width: 100%; padding: 10px;" />
                </div>
                <div class="elite-date-group group-date" style="width: 100%;">
                  <label style="color: #94a3b8 !important; margin-bottom: 4px; display: block; font-size: 12px;">Đến ngày</label>
                  <input type="date" v-model="exportDateTo" :min="exportDateFrom" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" style="width: 100%; padding: 10px;" />
                </div>
              </template>

              <template v-if="exportTimeMode === 'month'">
                <div class="elite-date-group group-date" style="width: 100%;">
                  <label style="color: #94a3b8 !important; margin-bottom: 4px; display: block; font-size: 12px;">Từ tháng</label>
                  <input type="month" v-model="exportMonthFrom" :max="exportMonthTo" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" style="width: 100%; padding: 10px;" />
                </div>
                <div class="elite-date-group group-date" style="width: 100%;">
                  <label style="color: #94a3b8 !important; margin-bottom: 4px; display: block; font-size: 12px;">Đến tháng</label>
                  <input type="month" v-model="exportMonthTo" :min="exportMonthFrom" @click="e => e.target.showPicker && e.target.showPicker()" class="elite-input" style="width: 100%; padding: 10px;" />
                </div>
              </template>

              <template v-if="exportTimeMode === 'year'">
                <div class="elite-date-group group-date" style="width: 100%;">
                  <label style="color: #94a3b8 !important; margin-bottom: 4px; display: block; font-size: 12px;">Từ năm</label>
                  <select v-model="exportYearFrom" class="elite-input" style="width: 100%; padding: 10px;">
                    <option value="">Chọn năm...</option>
                    <option v-for="y in availableYearsList" :key="y" :value="y">{{ y }}</option>
                  </select>
                </div>
                <div class="elite-date-group group-date" style="width: 100%;">
                  <label style="color: #94a3b8 !important; margin-bottom: 4px; display: block; font-size: 12px;">Đến năm</label>
                  <select v-model="exportYearTo" class="elite-input" style="width: 100%; padding: 10px;">
                    <option value="">Chọn năm...</option>
                    <option v-for="y in availableYearsList" :key="y" :value="y">{{ y }}</option>
                  </select>
                </div>
              </template>
            </div>

            <!-- BƯỚC 2: DANH SÁCH BẢN GHI -->
            <div v-else style="display: flex; flex-direction: column; overflow: hidden; flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <label class="sr-modal-label" style="margin: 0; white-space: nowrap;">Danh sách bản ghi</label>
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: nowrap;">
                  <select v-model="exportSortOrder" class="elite-select" style="background: rgba(15,23,42,0.6); border: 1px solid #1e293b; color: #94a3b8; font-size: 12px; padding: 4px 8px; border-radius: 6px; outline: none; cursor: pointer;">
                    <option value="Cũ => Mới">Cũ ➔ Mới</option>
                    <option value="Mới => Cũ">Mới ➔ Cũ</option>
                  </select>
                  <span style="font-size: 12px; font-weight: 600; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 4px 10px; border-radius: 12px; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center;">{{ exportRecords.length }} bản ghi</span>
                </div>
              </div>
              <div style="overflow-y: auto; flex: 1; padding-right: 8px; display: flex; flex-direction: column; gap: 8px;" class="sr-scroll">
                <div v-for="(r, i) in exportRecords" :key="r.ID || i" style="background: rgba(15,23,42,0.6); border: 1px solid #1e293b; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="flex: 1; overflow: hidden;">
                    <div style="font-size: 13px; font-weight: 600; color: #f8fafc; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ r.content_of_contract_PO || 'Chưa có thông tin Content of contract/PO' }}</div>
                    <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ r.Ten_cong_ty || 'Chưa có thông tin Customer' }}</div>
                    <div style="font-size: 11px; color: #94a3b8; display: flex; flex-wrap: wrap; align-items: center;">
                      <span>PO: <span style="color: #38bdf8;">{{ r.So_PO }}</span> <span style="color: #475569; margin: 0 6px;">|</span></span>
                      <span>DSB: <span style="color: #22c55e;">{{ fmt(doanhSoBan(r)) }}</span> <span style="color: #475569; margin: 0 6px;">|</span></span>
                      <span>Giá mua: <span style="color: #f59e0b;">{{ fmt(giaMua(r)) }}</span> <span style="color: #475569; margin: 0 6px;">|</span></span>
                      <span>Gross COM: <span style="color: #a855f7;">{{ fmt(grossCom(r)) }}</span> <span style="color: #475569; margin: 0 6px;">|</span></span>
                      <span>Net COM: <span style="color: #34d399;">{{ fmt(netCom(r)) }}</span></span>
                    </div>
                  </div>
                  <button @click="exportRecords.splice(i, 1)" style="background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.3); border-radius: 6px; width: 28px; height: 28px; display: flex; justify-content: center; align-items: center; cursor: pointer; flex-shrink: 0;" title="Bỏ xuất bản ghi này" onmouseover="this.style.background='rgba(239,68,68,.2)'" onmouseout="this.style.background='rgba(239,68,68,.1)'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                <div v-if="exportRecords.length === 0" style="text-align: center; color: #64748b; padding: 24px; font-size: 13px;">
                  Không còn bản ghi nào để xuất.
                </div>
              </div>
            </div>
          </div>
          <div class="sr-modal-footer">
            <template v-if="!showExportPreview">
              <button class="sr-btn sr-btn-cancel" @click="showExportModal = false">Hủy</button>
              <button class="sr-btn sr-btn-save" style="background:linear-gradient(135deg,#38bdf8,#0ea5e9);box-shadow:0 2px 8px rgba(14,165,233,.3)" @click="showExportPreview = true">
                Tiếp tục &rarr;
              </button>
            </template>
            <template v-else>
              <button class="sr-btn sr-btn-cancel" @click="showExportPreview = false">&larr; Quay lại</button>
              <button class="sr-btn sr-btn-save" style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 2px 8px rgba(5,150,105,.3)" @click="doExport" :disabled="exportRecords.length === 0 || exporting">
                <svg v-if="exporting" class="spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                {{ exporting ? 'Đang xuất...' : '📥 Xuất file' }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Chart Modal -->
    <Teleport to="body">
      <div v-if="chartModal.show" class="sr-modal-overlay" :class="{ 'no-anim': isSwitchingTab }" @click.self="chartModal.show = false" style="z-index: 100000; padding: 24px;">
        <div class="sr-modal sr-modal-large" :class="{ 'no-anim': isSwitchingTab }" style="width: 1000px; max-width: 95%; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">
          <div class="sr-modal-header" style="background: rgba(15,23,42,.8); border-bottom: 1px solid #1e293b; padding: 32px 24px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #f8fafc; font-size: 18px; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
              Biểu đồ {{ chartData.datasets[1]?.label }}
            </h3>
              <div class="sr-modal-center-block" style="display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 10;">
                <div class="sr-modal-tabs" style="display: flex; gap: 4px; background: rgba(30, 41, 59, 0.5); padding: 4px; border-radius: 8px; border: 1px solid #334155;">
                  <button class="sr-tab-btn active">Chỉ số</button>
                  <button class="sr-tab-btn" @click="isSwitchingTab = true; chartModal.show = false; openTopCustomerModal(chartModal.metric); setTimeout(() => isSwitchingTab = false, 50)">Khách hàng</button>
                  <button class="sr-tab-btn" @click="isSwitchingTab = true; chartModal.show = false; openTopProductModal(chartModal.metric); setTimeout(() => isSwitchingTab = false, 50)">Sản phẩm</button>
                </div>
                <div style="font-size: 12px; font-weight: 700; color: #ffffff; background-color: #ef4444; padding: 2px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">{{ currentTimeLabel }}</div>
              </div>
            <button class="sr-btn-close" @click="chartModal.show = false" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer;">×</button>
          </div>
          <div class="sr-modal-body" style="padding: 24px; flex: 1; background: #0b1121; position: relative;">
            <div class="chart-wrapper-mobile" style="height: 650px; width: 100%;">
                <Bar v-if="chartModal.show" :data="chartData" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Top Customer Chart Modal -->
    <Teleport to="body">
      <div v-if="topCustomerModal.show" class="sr-modal-overlay" :class="{ 'no-anim': isSwitchingTab }" @click.self="topCustomerModal.show = false" style="z-index: 100000; padding: 24px;">
        <div class="sr-modal sr-modal-large" :class="{ 'no-anim': isSwitchingTab }" style="width: 1100px; max-width: 95%; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">
          <div class="sr-modal-header" style="background: rgba(15,23,42,.8); border-bottom: 1px solid #1e293b; padding: 32px 24px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #f8fafc; font-size: 18px; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              BXH Khách hàng - {{ topCustomerModal.metricLabel }}
            </h3>
              <div class="sr-modal-center-block" style="display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 10;">
                <div class="sr-modal-tabs" style="display: flex; gap: 4px; background: rgba(30, 41, 59, 0.5); padding: 4px; border-radius: 8px; border: 1px solid #334155;">
                  <button class="sr-tab-btn" @click="topCustomerModal.show = false; openChart(topCustomerModal.metric, topCustomerModal.metric.includes('Pct'))">Chỉ số</button>
                  <button class="sr-tab-btn active">Khách hàng</button>
                  <button class="sr-tab-btn" @click="isSwitchingTab = true; topCustomerModal.show = false; openTopProductModal(topCustomerModal.metric); setTimeout(() => isSwitchingTab = false, 50)">Sản phẩm</button>
                </div>
                <div style="font-size: 12px; font-weight: 700; color: #ffffff; background-color: #ef4444; padding: 2px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">{{ currentTimeLabel }}</div>
              </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600; margin-right: 12px; padding-right: 12px; border-right: 1px solid #334155;">Hiện có: <span style="color: #38bdf8;">{{ topCustomerRawData.sorted.length }}</span></span>
                  <label style="color: #94a3b8; font-size: 14px; font-weight: 600;">Số lượng TOP:</label>
                <input type="number" v-model.number="topCustomerLimit" min="1" max="100" style="width: 70px; background: rgba(15,23,42,0.6); border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 4px 8px; outline: none; text-align: center;" />
                  <button @click="topCustomerLimit = topCustomerRawData.sorted.length" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-left: 8px;" onmouseover="this.style.background='rgba(34, 197, 94, 0.2)'" onmouseout="this.style.background='rgba(34, 197, 94, 0.1)'">Tất cả</button>
              </div>
              <button class="sr-btn-close" @click="topCustomerModal.show = false" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;">×</button>
            </div>
          </div>
          <div class="sr-modal-body" style="padding: 24px; flex: 1; background: #0b1121; position: relative;">
            <div style="display: flex; gap: 24px; flex-wrap: wrap;">
              <!-- Pie Chart (Hide for ratio metrics) -->
              <div v-if="!topCustomerModal.metric.includes('Pct')" class="modal-pie-container" style="flex: 1; min-width: 300px; max-width: 400px; background: rgba(15,23,42,.6); border: 1px solid #1e293b; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; align-items: center;">
                 <h4 style="color: #94a3b8; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Tỉ trọng Top Khách Hàng</h4>
                 <div class="chart-wrapper-mobile" style="height: 400px; width: 100%; display: flex; justify-content: center;">
                     <Pie v-if="topCustomerModal.show" :data="topCustomerPieData" :options="topCustomerPieOptions" />
                 </div>
              </div>
              
              <!-- Bar Chart -->
              <div class="modal-bar-container" style="flex: 2; min-width: 500px; background: rgba(15,23,42,.6); border: 1px solid #1e293b; border-radius: 12px; padding: 16px; display: flex; flex-direction: column;">
                 <h4 style="color: #94a3b8; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Xếp Hạng Khách Hàng</h4>
                 <div style="flex: 1; overflow-x: auto; padding-bottom: 8px;" class="custom-scrollbar">
                   <div class="chart-wrapper-mobile" :style="{ height: '500px', width: Math.max(100, Math.min(topCustomerRawData.sorted.length, Number(topCustomerLimit) || 5) * (isMobile ? 90 : 120)) + 'px', minWidth: '100%' }">
                     <Bar v-if="topCustomerModal.show" :data="topCustomerBarData" :options="topCustomerBarOptions" />
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

      <!-- Top Product Chart Modal -->
      <Teleport to="body">
        <div v-if="topProductModal.show" class="sr-modal-overlay" :class="{ 'no-anim': isSwitchingTab }" @click.self="topProductModal.show = false" style="z-index: 100000; padding: 24px;">
          <div class="sr-modal sr-modal-large" :class="{ 'no-anim': isSwitchingTab }" style="width: 1100px; max-width: 95%; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">
            <div class="sr-modal-header" style="background: rgba(15,23,42,.8); border-bottom: 1px solid #1e293b; padding: 32px 24px; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0; color: #f8fafc; font-size: 18px; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                BXH Sản phẩm - {{ topProductModal.metricLabel }}
              </h3>
              <div class="sr-modal-center-block" style="display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 10;">
                <div class="sr-modal-tabs" style="display: flex; gap: 4px; background: rgba(30, 41, 59, 0.5); padding: 4px; border-radius: 8px; border: 1px solid #334155;">
                  <button class="sr-tab-btn" @click="topProductModal.show = false; openChart(topProductModal.metric, topProductModal.metric.includes('Pct'))">Chỉ số</button>
                  <button class="sr-tab-btn" @click="isSwitchingTab = true; topProductModal.show = false; openTopCustomerModal(topProductModal.metric); setTimeout(() => isSwitchingTab = false, 50)">Khách hàng</button>
                  <button class="sr-tab-btn active">Sản phẩm</button>
                </div>
                <div style="font-size: 12px; font-weight: 700; color: #ffffff; background-color: #ef4444; padding: 2px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">{{ currentTimeLabel }}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: #cbd5e1; font-size: 13px; font-weight: 600; margin-right: 12px; padding-right: 12px; border-right: 1px solid #334155;">Hiện có: <span style="color: #22c55e;">{{ topProductRawData.sorted.length }}</span></span>
                  <label style="color: #94a3b8; font-size: 14px; font-weight: 600;">Số lượng TOP:</label>
                  <input type="number" v-model.number="topProductLimit" min="1" max="100" style="width: 70px; background: rgba(15,23,42,0.6); border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 4px 8px; outline: none; text-align: center;" />
                  <button @click="topProductLimit = topProductRawData.sorted.length" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-left: 8px;" onmouseover="this.style.background='rgba(34, 197, 94, 0.2)'" onmouseout="this.style.background='rgba(34, 197, 94, 0.1)'">Tất cả</button>
                </div>
                <button class="sr-btn-close" @click="topProductModal.show = false" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;">&times;</button>
              </div>
            </div>
            <div class="sr-modal-body" style="padding: 24px; flex: 1; background: #0b1121; position: relative;">
              <div style="display: flex; gap: 24px; flex-wrap: wrap;">
                <!-- Pie Chart -->
                <div v-if="!topProductModal.metric.includes('Pct')" class="modal-pie-container" style="flex: 1; min-width: 300px; max-width: 400px; background: rgba(15,23,42,.6); border: 1px solid #1e293b; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; align-items: center;">
                   <h4 style="color: #94a3b8; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Tỷ trọng Top Sản Phẩm</h4>
                   <div class="chart-wrapper-mobile" style="height: 400px; width: 100%; display: flex; justify-content: center;">
                     <Pie v-if="topProductModal.show" :data="topProductPieData" :options="topProductPieOptions" />
                   </div>
                </div>
                
                <!-- Bar Chart -->
                <div class="modal-bar-container" style="flex: 2; min-width: 500px; background: rgba(15,23,42,.6); border: 1px solid #1e293b; border-radius: 12px; padding: 16px; display: flex; flex-direction: column;">
                   <h4 style="color: #94a3b8; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Xếp Hạng Sản Phẩm</h4>
                   <div style="flex: 1; overflow-x: auto; padding-bottom: 8px;" class="custom-scrollbar">
                     <div class="chart-wrapper-mobile" :style="{ height: '500px', width: Math.max(100, Math.min(topProductRawData.sorted.length, Number(topProductLimit) || 5) * (isMobile ? 90 : 120)) + 'px', minWidth: '100%' }">
                       <Bar v-if="topProductModal.show" :data="topProductBarData" :options="topProductBarOptions" />
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

    <!-- Year Selection Modal for Report Import -->
    <Teleport to="body">
      <div v-if="showYearModal" class="sr-modal-overlay" style="z-index: 100000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5);">
        <div class="sr-modal" style="width: 400px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
          <h3 style="margin-top: 0; color: #f8fafc; font-size: 18px; text-transform: uppercase;">Chọn năm cho dữ liệu</h3>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">Vui lòng chọn năm cho ({{ pendingReportFiles.length }}) file dữ liệu báo cáo cần import.</p>
          
          <div class="elite-date-group group-date" style="margin-bottom: 20px; width: 100%;">
            <label style="color: #94a3b8 !important; margin-bottom: 8px; display: block;">Năm báo cáo</label>
            <select v-model="selectedYearForReport" class="elite-input" style="width: 100%; background: #1e293b; color: white; border: 1px solid #334155; padding: 10px; border-radius: 6px;">
              <option v-for="y in availableYearsList" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button class="sr-btn sr-btn-cancel" @click="showYearModal = false" style="background: transparent; color: #cbd5e1; border: 1px solid #334155; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Hủy bỏ</button>
            <button class="sr-btn sr-btn-save" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;" @click="confirmYearAndImportReport">Xác nhận import</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Payment & Debt History Modal (lich_su_thanh_toan) -->
    <Teleport to="body">
      <div v-if="paymentModal.show && paymentModal.row" class="sr-modal-overlay" @click.self="paymentModal.show = false" style="z-index: 100050; padding: 20px;">
        <div class="sr-modal" style="max-width: 960px; width: 96vw; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; max-height: 92vh;">
          <!-- Header -->
          <div class="sr-modal-header" style="background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid #1e293b; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div>
                <h3 style="margin: 0; color: #f8fafc; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  Quản lý Công nợ & Thanh toán — PO #{{ paymentModal.row.So_PO || 'N/A' }}
                </h3>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 3px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
                    <strong style="color: #e2e8f0;">{{ paymentModal.row.Ten_cong_ty || paymentModal.row.Ten_khach_hang || 'Khách hàng' }}</strong>
                  </span>
                  <span>• Mã KH: <code style="color: #38bdf8; background: rgba(56,189,248,0.1); padding: 1px 6px; border-radius: 4px;">{{ paymentModal.row.Ma_khach_hang || 'N/A' }}</code></span>
                  <span>• ID SaleReport: <code style="color: #a855f7; background: rgba(168,85,247,0.1); padding: 1px 6px; border-radius: 4px;">{{ paymentModal.row.ID || paymentModal.row._firebaseKey }}</code></span>
                </div>
              </div>
            </div>
            <button @click="paymentModal.show = false" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;">&times;</button>
          </div>

          <!-- Body -->
          <div class="sr-modal-body custom-scrollbar" style="padding: 20px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 18px;">
            <!-- 4 Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 12px;">
              <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 12px 14px;">
                <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Tổng tiền sau VAT (PO)</div>
                <div style="font-size: 17px; font-weight: 800; color: #38bdf8; margin-top: 4px;">{{ fmt(tongSauVat(paymentModal.row)) }} đ</div>
              </div>
              <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 12px 14px;">
                <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Khách đã thanh toán</div>
                <div style="font-size: 17px; font-weight: 800; color: #34d399; margin-top: 4px;">{{ fmt(daThanhToan(paymentModal.row)) }} đ</div>
              </div>
              <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 12px 14px;">
                <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Công nợ còn lại (PO)</div>
                <div style="font-size: 17px; font-weight: 800; margin-top: 4px;" :style="{ color: congNo(paymentModal.row) > 0 ? '#f87171' : '#34d399' }">
                  {{ fmt(congNo(paymentModal.row)) }} đ
                </div>
              </div>
              <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 12px 14px;">
                <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Tổng nợ toàn KH</div>
                <div style="font-size: 17px; font-weight: 800; color: #fbbf24; margin-top: 4px;">
                  {{ fmt(getCustomerTotalCongNo(paymentModal.row)) }} đ
                </div>
              </div>
            </div>

            <!-- Thanh nút hành động chính: Thiết lập Kế hoạch TT & Ghi nhận Đợt TT mới -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: rgba(15, 23, 42, 0.85); border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px;">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">Hình thức TT hiện tại:</span>
                <span
                  :style="{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: paymentModal.scheduleMode === 'nhieu_dot' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(56, 189, 248, 0.15)',
                    color: paymentModal.scheduleMode === 'nhieu_dot' ? '#c084fc' : '#38bdf8',
                    border: paymentModal.scheduleMode === 'nhieu_dot' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(56, 189, 248, 0.35)'
                  }"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span v-if="paymentModal.scheduleMode === 'nhieu_dot'">Chia {{ modalEvaluatedInstallments.length }} đợt thanh toán</span>
                  <span v-else>Thanh toán 1 lần (100% — Hạn: {{ paymentModal.singleDueDate || 'Chưa đặt' }})</span>
                </span>
              </div>

              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <button
                  type="button"
                  @click="openScheduleSubModal"
                  style="display: inline-flex; align-items: center; gap: 7px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.45); border-radius: 9px; padding: 8px 14px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>Thiết lập Kế hoạch / Hạn thanh toán</span>
                </button>

                <button
                  type="button"
                  @click="openRecordPaymentSubModal()"
                  style="display: inline-flex; align-items: center; gap: 7px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 9px; padding: 8px 16px; font-size: 12.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.28); transition: all 0.2s;"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  <span>Ghi nhận đợt thanh toán mới</span>
                </button>
              </div>
            </div>

            <!-- Bảng Tóm tắt Kế hoạch & Tiến độ các mốc hạn thanh toán (Read-only Overview) -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
              <div style="padding: 11px 16px; background: rgba(30, 41, 59, 0.55); border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span style="font-size: 12.5px; font-weight: 700; color: #e2e8f0; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Tiến độ Kế hoạch & Mốc hạn thanh toán ({{ modalEvaluatedInstallments.length }} đợt)
                </span>
                <button
                  type="button"
                  @click="openScheduleSubModal"
                  style="background: transparent; color: #38bdf8; border: 1px dashed rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; cursor: pointer;"
                >
                  Chỉnh sửa mốc hạn / Chia đợt
                </button>
              </div>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #e2e8f0;">
                  <thead>
                    <tr style="background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid #334155; text-align: left; color: #94a3b8; font-size: 11px; text-transform: uppercase;">
                      <th style="padding: 9px 12px; width: 55px;">Đợt</th>
                      <th style="padding: 9px 12px;">Nội dung đợt</th>
                      <th style="padding: 9px 12px; text-align: right; width: 80px;">Tỷ lệ</th>
                      <th style="padding: 9px 12px; text-align: right;">Phải thu</th>
                      <th style="padding: 9px 12px; text-align: right;">Đã thu</th>
                      <th style="padding: 9px 12px; text-align: right;">Còn thiếu</th>
                      <th style="padding: 9px 12px;">Mốc hạn TT</th>
                      <th style="padding: 9px 12px;">Trạng thái hạn</th>
                      <th style="padding: 9px 12px; text-align: center; width: 105px;">Thu nhanh</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(inst, idx) in modalEvaluatedInstallments" :key="idx" style="border-bottom: 1px dashed #1e293b;">
                      <td style="padding: 9px 12px; font-weight: 800; color: #c084fc;">#{{ inst.dot }}</td>
                      <td style="padding: 9px 12px; font-weight: 600; color: #f8fafc;">{{ inst.noi_dung }}</td>
                      <td style="padding: 9px 12px; text-align: right; font-weight: 700; color: #38bdf8;">{{ inst.ty_le_pct }}%</td>
                      <td style="padding: 9px 12px; text-align: right; font-weight: 700; color: #e2e8f0;">{{ fmt(inst.so_tien_phai_thu) }} đ</td>
                      <td style="padding: 9px 12px; text-align: right; font-weight: 700; color: #34d399;">{{ fmt(inst.da_thu) }} đ</td>
                      <td style="padding: 9px 12px; text-align: right; font-weight: 700;" :style="{ color: inst.con_thieu > 0 ? '#f87171' : '#64748b' }">
                        {{ fmt(inst.con_thieu) }} đ
                      </td>
                      <td style="padding: 9px 12px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #cbd5e1;">
                        {{ inst.han_thanh_toan || 'Chưa đặt hạn' }}
                      </td>
                      <td style="padding: 9px 12px;">
                        <span
                          :style="{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: inst.statusColor,
                            background: 'rgba(15, 23, 42, 0.85)',
                            border: `1px solid ${inst.statusColor}`
                          }"
                        >
                          <span>{{ inst.statusLabel }}</span>
                        </span>
                      </td>
                      <td style="padding: 9px 12px; text-align: center;">
                        <button
                          v-if="inst.con_thieu > 0"
                          type="button"
                          @click="openRecordPaymentSubModal(inst)"
                          style="background: rgba(16, 185, 129, 0.16); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap;"
                        >
                          Thu đợt này
                        </button>
                        <span v-else style="font-size: 11px; color: #34d399; font-weight: 700;">Hoàn tất</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Bảng Lịch sử thanh toán (lich_su_thanh_toan) -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
              <div style="padding: 12px 16px; background: rgba(30, 41, 59, 0.6); border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 13px; font-weight: 700; color: #e2e8f0; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Lịch sử thanh toán thực tế của PO ({{ getPaymentHistoryForPO(paymentModal.row).length }} lần)
                </span>
                <span style="font-size: 11px; color: #64748b;">Schema: <code>lich_su_thanh_toan</code></span>
              </div>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #e2e8f0;">
                  <thead>
                    <tr style="background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid #334155; text-align: left; color: #94a3b8;">
                      <th style="padding: 10px 12px;">Lần</th>
                      <th style="padding: 10px 12px;">Mã GD (id)</th>
                      <th style="padding: 10px 12px;">Thời gian TT</th>
                      <th style="padding: 10px 12px;">Mã KH (maKH)</th>
                      <th style="padding: 10px 12px; text-align: right;">Số tiền thanh toán</th>
                      <th style="padding: 10px 12px; text-align: right;">Công nợ còn lại</th>
                      <th style="padding: 10px 12px;">Ghi chú</th>
                      <th style="padding: 10px 12px; text-align: center; width: 50px;">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(h, idx) in getPaymentHistoryForPO(paymentModal.row)" :key="h.id || idx" style="border-bottom: 1px dashed #1e293b;">
                      <td style="padding: 10px 12px; font-weight: 700; color: #38bdf8;">#{{ getPaymentHistoryForPO(paymentModal.row).length - idx }}</td>
                      <td style="padding: 10px 12px; font-family: monospace; font-size: 11px; color: #94a3b8;">{{ h.id }}</td>
                      <td style="padding: 10px 12px; color: #f8fafc;">{{ h.thoi_gian_thanh_toan || '—' }}</td>
                      <td style="padding: 10px 12px; color: #cbd5e1;">{{ h.maKH }}</td>
                      <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #34d399;">+{{ fmt(toNum(h.so_tien_thanh_toan)) }} đ</td>
                      <td style="padding: 10px 12px; text-align: right; font-weight: 700;" :style="{ color: toNum(h.cong_no_con_lai) > 0 ? '#f87171' : '#34d399' }">
                        {{ fmt(toNum(h.cong_no_con_lai)) }} đ
                      </td>
                      <td style="padding: 10px 12px; color: #94a3b8;">{{ h.ghi_chu || '—' }}</td>
                      <td style="padding: 10px 12px; text-align: center;">
                        <button type="button" @click="deletePaymentHistoryItem(h)" title="Xóa đợt thanh toán này và hoàn lại công nợ" style="background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 5px 7px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="getPaymentHistoryForPO(paymentModal.row).length === 0">
                      <td colspan="8" style="padding: 24px; text-align: center; color: #64748b; font-style: italic;">
                        Chưa có lịch sử thanh toán nào cho PO này.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sr-modal-footer" style="padding: 14px 24px; background: rgba(15, 23, 42, 0.9); border-top: 1px solid #1e293b; display: flex; justify-content: flex-end;">
            <button type="button" class="sr-btn sr-btn-cancel" @click="paymentModal.show = false" style="padding: 8px 20px;">Đóng</button>
          </div>
        </div>
      </div>

      <!-- SUB-MODAL 1: Thiết lập Kế hoạch & Mốc thời gian phải thanh toán -->
      <div v-if="paymentModal.show && paymentModal.row && paymentModal.showScheduleSubModal" class="sr-modal-overlay" @click.self="paymentModal.showScheduleSubModal = false" style="z-index: 100065; padding: 20px; background: rgba(2, 6, 23, 0.78);">
        <div class="sr-modal" style="max-width: 880px; width: 95vw; background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; max-height: 88vh; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);">
          <div class="sr-modal-header" style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid #1e293b; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 9px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <h4 style="margin: 0; color: #f8fafc; font-size: 15px; font-weight: 800; text-transform: uppercase;">
                  Thiết lập Kế hoạch & Mốc hạn thanh toán — PO #{{ paymentModal.row.So_PO || 'N/A' }}
                </h4>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                  Tổng giá trị PO sau VAT: <strong style="color: #38bdf8;">{{ fmt(tongSauVat(paymentModal.row)) }} đ</strong>
                  • Đã thu: <strong style="color: #34d399;">{{ fmt(daThanhToan(paymentModal.row)) }} đ</strong>
                </div>
              </div>
            </div>
            <button @click="paymentModal.showScheduleSubModal = false" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;">&times;</button>
          </div>

          <div class="sr-modal-body custom-scrollbar" style="padding: 18px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
            <!-- Chế độ: 1 lần vs Chia nhiều đợt -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: inline-flex; background: #090f1d; border: 1px solid #334155; border-radius: 8px; padding: 3px; gap: 4px;">
                <button
                  type="button"
                  @click="setScheduleMode('mot_lan')"
                  :style="{
                    background: paymentModal.scheduleMode === 'mot_lan' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: paymentModal.scheduleMode === 'mot_lan' ? '#38bdf8' : '#94a3b8',
                    border: paymentModal.scheduleMode === 'mot_lan' ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }"
                >
                  Thanh toán 1 lần (100%)
                </button>
                <button
                  type="button"
                  @click="setScheduleMode('nhieu_dot')"
                  :style="{
                    background: paymentModal.scheduleMode === 'nhieu_dot' ? 'rgba(168, 85, 247, 0.22)' : 'transparent',
                    color: paymentModal.scheduleMode === 'nhieu_dot' ? '#c084fc' : '#94a3b8',
                    border: paymentModal.scheduleMode === 'nhieu_dot' ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }"
                >
                  Chia theo đợt (% khác nhau)
                </button>
              </div>
            </div>

            <!-- Chế độ 1: Thanh toán 1 lần (100%) -->
            <div v-if="paymentModal.scheduleMode === 'mot_lan'" style="display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; background: rgba(30, 41, 59, 0.45); border: 1px solid #1e293b; border-radius: 10px; padding: 16px;">
              <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                <div>
                  <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 6px;">Mốc hạn thanh toán (DD/MM/YYYY)</label>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input
                      type="text"
                      v-model="paymentModal.singleDueDate"
                      placeholder="DD/MM/YYYY"
                      class="sr-modal-input"
                      style="width: 135px; padding: 8px 10px; font-size: 13px; font-weight: 700; color: #f8fafc; font-family: 'JetBrains Mono', monospace;"
                    />
                    <input
                      type="date"
                      :value="ddmmyyyyToIso(paymentModal.singleDueDate)"
                      @change="onSingleDueDatePickerChange"
                      class="sr-modal-input"
                      style="padding: 7px 10px; font-size: 12.5px; color: #cbd5e1; width: 148px;"
                    />
                  </div>
                </div>

                <div>
                  <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 6px;">Chọn nhanh hạn TT (từ ngày tạo PO)</label>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button type="button" @click="setSingleDueDateDays(7, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+7 ngày</button>
                    <button type="button" @click="setSingleDueDateDays(15, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+15 ngày</button>
                    <button type="button" @click="setSingleDueDateDays(30, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+30 ngày</button>
                    <button type="button" @click="setSingleDueDateDays(45, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+45 ngày</button>
                    <button type="button" @click="setSingleDueDateDays(60, true)" style="background: rgba(51, 65, 85, 0.55); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;">+60 ngày</button>
                  </div>
                </div>
              </div>

              <div v-if="modalEvaluatedInstallments.length > 0" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                <span style="font-size: 11px; color: #94a3b8;">Trạng thái mốc thanh toán:</span>
                <span
                  :style="{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: modalEvaluatedInstallments[0].statusColor,
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: `1px solid ${modalEvaluatedInstallments[0].statusColor}`
                  }"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{{ modalEvaluatedInstallments[0].statusLabel }}</span>
                </span>
              </div>
            </div>

            <!-- Chế độ 2: Chia theo nhiều đợt (% khác nhau) -->
            <div v-else style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span style="font-size: 11.5px; color: #94a3b8; font-weight: 600;">Mẫu chia đợt nhanh:</span>
                  <button type="button" @click="applySchedulePreset([30, 70], ['Đợt 1 - Tạm ứng 30%', 'Đợt 2 - Tất toán 70%'])" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    2 đợt (30% - 70%)
                  </button>
                  <button type="button" @click="applySchedulePreset([50, 50], ['Đợt 1 - Tạm ứng 50%', 'Đợt 2 - Tất toán 50%'])" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    2 đợt (50% - 50%)
                  </button>
                  <button type="button" @click="applySchedulePreset([30, 50, 20], ['Đợt 1 - Tạm ứng 30%', 'Đợt 2 - Giao hàng 50%', 'Đợt 3 - Nghiệm thu 20%'])" style="background: rgba(168, 85, 247, 0.14); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    3 đợt (30% - 50% - 20%)
                  </button>
                  <button type="button" @click="applySchedulePreset([20, 50, 30], ['Đợt 1 - Tạm ứng 20%', 'Đợt 2 - Giao hàng 50%', 'Đợt 3 - Nghiệm thu 30%'])" style="background: rgba(168, 85, 247, 0.14); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                    3 đợt (20% - 50% - 30%)
                  </button>
                </div>

                <button type="button" @click="addScheduleInstallment" style="display: inline-flex; align-items: center; gap: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 6px; padding: 5px 11px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span>Thêm đợt TT</span>
                </button>
              </div>

              <div style="overflow-x: auto; border: 1px solid #1e293b; border-radius: 10px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #e2e8f0;">
                  <thead>
                    <tr style="background: rgba(30, 41, 59, 0.75); border-bottom: 1px solid #334155; text-align: left; color: #94a3b8; font-size: 11px; text-transform: uppercase;">
                      <th style="padding: 8px 10px; width: 46px;">Đợt</th>
                      <th style="padding: 8px 10px; min-width: 160px;">Nội dung đợt</th>
                      <th style="padding: 8px 10px; width: 85px; text-align: right;">Tỷ lệ (%)</th>
                      <th style="padding: 8px 10px; width: 145px; text-align: right;">Số tiền phải thu</th>
                      <th style="padding: 8px 10px; width: 150px;">Hạn thanh toán</th>
                      <th style="padding: 8px 10px; min-width: 130px;">Trạng thái hạn</th>
                      <th style="padding: 8px 10px; text-align: center; width: 60px;">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(inst, idx) in paymentModal.scheduleItems"
                      :key="idx"
                      style="border-bottom: 1px dashed #1e293b; background: rgba(15, 23, 42, 0.55);"
                    >
                      <td style="padding: 8px 10px; font-weight: 800; color: #c084fc;">#{{ idx + 1 }}</td>
                      <td style="padding: 8px 10px;">
                        <input
                          type="text"
                          v-model="inst.noi_dung"
                          placeholder="VD: Đợt 1 - Tạm ứng..."
                          class="sr-modal-input"
                          style="width: 100%; padding: 6px 8px; font-size: 12px; color: #f8fafc;"
                        />
                      </td>
                      <td style="padding: 8px 10px;">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          :value="inst.ty_le_pct"
                          @input="onInstallmentPctChange(idx, $event)"
                          class="sr-modal-input text-right"
                          style="width: 75px; padding: 6px 6px; font-size: 12px; font-weight: 700; color: #38bdf8;"
                        />
                      </td>
                      <td style="padding: 8px 10px;">
                        <input
                          type="text"
                          :value="inst.so_tien_phai_thu > 0 ? inst.so_tien_phai_thu.toLocaleString('vi-VN') : ''"
                          @input="onInstallmentAmountInput(idx, $event)"
                          placeholder="0"
                          class="sr-modal-input text-right"
                          style="width: 135px; padding: 6px 8px; font-size: 12px; font-weight: 700; color: #f8fafc;"
                        />
                      </td>
                      <td style="padding: 8px 10px;">
                        <input
                          type="date"
                          :value="ddmmyyyyToIso(inst.han_thanh_toan)"
                          @change="onInstallmentDatePickerChange(idx, $event)"
                          class="sr-modal-input"
                          style="width: 140px; padding: 5px 8px; font-size: 12px; color: #f8fafc;"
                        />
                      </td>
                      <td style="padding: 8px 10px;">
                        <span
                          v-if="modalEvaluatedInstallments[idx]"
                          :style="{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: modalEvaluatedInstallments[idx].statusColor,
                            background: 'rgba(15, 23, 42, 0.85)',
                            border: `1px solid ${modalEvaluatedInstallments[idx].statusColor}`
                          }"
                        >
                          <span>{{ modalEvaluatedInstallments[idx].statusLabel }}</span>
                        </span>
                      </td>
                      <td style="padding: 8px 10px; text-align: center;">
                        <button
                          v-if="paymentModal.scheduleItems.length > 1"
                          type="button"
                          @click="removeScheduleInstallment(idx)"
                          title="Xóa đợt này"
                          style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 5px 7px; cursor: pointer; display: inline-flex; align-items: center;"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #94a3b8; padding: 2px 4px;">
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                  <span>
                    Tổng tỷ lệ các đợt:
                    <strong :style="{ color: Math.abs(modalScheduleTotalPct - 100) < 0.1 ? '#34d399' : '#fbbf24' }">{{ modalScheduleTotalPct }}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Tổng tiền kế hoạch:
                    <strong :style="{ color: Math.abs(modalScheduleTotalAmount - tongSauVat(paymentModal.row)) <= 10 ? '#34d399' : '#fbbf24' }">
                      {{ fmt(modalScheduleTotalAmount) }} / {{ fmt(tongSauVat(paymentModal.row)) }} đ
                    </strong>
                  </span>
                </div>
                <button
                  v-if="Math.abs(modalScheduleTotalAmount - tongSauVat(paymentModal.row)) > 1"
                  type="button"
                  @click="balanceLastInstallment"
                  style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer;"
                >
                  Tự động cân bằng đợt cuối cho khớp 100%
                </button>
              </div>
            </div>
          </div>

          <div class="sr-modal-footer" style="padding: 14px 22px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid #1e293b; display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="sr-btn sr-btn-cancel" @click="paymentModal.showScheduleSubModal = false" style="padding: 8px 18px;">Hủy</button>
            <button
              type="button"
              @click="savePaymentScheduleOnly"
              :disabled="paymentModal.savingSchedule"
              style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #ffffff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 700; cursor: pointer;"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>{{ paymentModal.savingSchedule ? 'Đang lưu...' : 'Lưu Kế hoạch & Hạn TT' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- SUB-MODAL 2: Ghi nhận đợt thanh toán mới -->
      <div v-if="paymentModal.show && paymentModal.row && paymentModal.showRecordSubModal" class="sr-modal-overlay" @click.self="paymentModal.showRecordSubModal = false" style="z-index: 100065; padding: 20px; background: rgba(2, 6, 23, 0.78);">
        <div class="sr-modal" style="max-width: 620px; width: 95vw; background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.45); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);">
          <div class="sr-modal-header" style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid #1e293b; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 9px; background: rgba(16, 185, 129, 0.16); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; color: #34d399;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <div>
                <h4 style="margin: 0; color: #f8fafc; font-size: 15px; font-weight: 800; text-transform: uppercase;">
                  Ghi nhận đợt thanh toán mới — PO #{{ paymentModal.row.So_PO || 'N/A' }}
                </h4>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                  Công nợ hiện tại của PO: <strong style="color: #f87171;">{{ fmt(congNo(paymentModal.row)) }} đ</strong>
                </div>
              </div>
            </div>
            <button @click="paymentModal.showRecordSubModal = false" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;">&times;</button>
          </div>

          <div class="sr-modal-body" style="padding: 18px 22px; display: flex; flex-direction: column; gap: 14px;">
            <!-- Chọn nhanh theo đợt hoặc theo % công nợ -->
            <div>
              <label style="font-size: 11px; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 6px;">Chọn nhanh số tiền thanh toán:</label>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <template v-if="paymentModal.scheduleMode === 'nhieu_dot'">
                  <button
                    v-for="(inst, idx) in modalEvaluatedInstallments.filter(x => x.con_thieu > 0)"
                    :key="'quick-inst-' + idx"
                    type="button"
                    @click="openRecordPaymentSubModal(inst)"
                    style="background: rgba(168, 85, 247, 0.16); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;"
                  >
                    Đợt {{ inst.dot }} ({{ fmt(inst.con_thieu) }} đ)
                  </button>
                </template>
                <button type="button" @click="setPaymentQuickPct(100)" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  Tất toán 100% nợ ({{ fmt(congNo(paymentModal.row)) }})
                </button>
                <button type="button" @click="setPaymentQuickPct(50)" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  50% công nợ
                </button>
                <button type="button" @click="setPaymentQuickPct(30)" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  30% công nợ
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px;">
              <div>
                <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 5px;">Số tiền khách thanh toán (VNĐ)</label>
                <input type="text" :value="paymentModal.amountStr" @input="onPaymentAmountInput" placeholder="Nhập số tiền..." class="sr-modal-input text-right" style="width: 100%; padding: 9px 12px; font-size: 15px; font-weight: 800; color: #34d399; border-color: rgba(16, 185, 129, 0.45); background: rgba(16, 185, 129, 0.06);" />
              </div>
              <div>
                <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 5px;">Thời gian thanh toán</label>
                <input type="text" v-model="paymentModal.paymentTime" placeholder="DD/MM/YYYY HH:mm:ss" class="sr-modal-input" style="width: 100%; padding: 9px 10px; font-size: 12.5px; color: #f8fafc;" />
              </div>
            </div>

            <div>
              <label style="font-size: 11.5px; color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 5px;">Ghi chú đợt thanh toán (Tùy chọn)</label>
              <input type="text" v-model="paymentModal.note" placeholder="VD: Thanh toán đợt 1 chuyển khoản..." class="sr-modal-input" style="width: 100%; padding: 9px 12px; font-size: 12.5px; color: #f8fafc;" />
            </div>

            <!-- Live preview công nợ còn lại sau đợt thanh toán -->
            <div style="padding: 10px 12px; background: rgba(30, 41, 59, 0.5); border: 1px dashed #334155; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: #94a3b8;">
              <span>
                Dự kiến Đã TT mới:
                <strong style="color: #34d399;">{{ fmt(daThanhToan(paymentModal.row) + (paymentModal.amount || 0)) }} đ</strong>
              </span>
              <span>
                Công nợ còn lại:
                <strong :style="{ color: Math.max(0, congNo(paymentModal.row) - (paymentModal.amount || 0)) > 0 ? '#f87171' : '#34d399', fontSize: '13px' }">
                  {{ fmt(Math.max(0, congNo(paymentModal.row) - (paymentModal.amount || 0))) }} đ
                </strong>
              </span>
            </div>
          </div>

          <div class="sr-modal-footer" style="padding: 14px 22px; background: rgba(15, 23, 42, 0.95); border-top: 1px solid #1e293b; display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="sr-btn sr-btn-cancel" @click="paymentModal.showRecordSubModal = false" style="padding: 8px 18px;">Hủy</button>
            <button
              type="button"
              @click="submitPayment"
              :disabled="paymentModal.saving || paymentModal.amount <= 0"
              style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);"
            >
              <svg v-if="!paymentModal.saving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>{{ paymentModal.saving ? 'Đang lưu...' : 'Xác nhận Ghi nhận TT' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx-js-style'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Pie } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
)

import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// ─── Firebase Setup ───
import { initializeApp, getApps, getApp } from "firebase/app"
import { getDatabase, ref as dbRef, get, set, push, update, remove, child } from "firebase/database"

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
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const database = getDatabase(firebaseApp)

// BASE_URL removed - all CRUD operations now use Firebase Realtime Database

const loading = ref(false)
const rows = ref<any[]>([])
const hdChiTietData = ref<any[]>([])
const searchStr = ref('')
const showSearchSuggestions = ref(false)

const reportUploadInput = ref<HTMLInputElement | null>(null);

const showYearModal = ref(false);
const selectedYearForReport = ref(new Date().getFullYear().toString());
const pendingReportFiles = ref<File[]>([]);

const availableYearsList = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
});


function triggerReportImport() {
  reportUploadInput.value?.click();
}


function onReportFilesSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  pendingReportFiles.value = Array.from(target.files);
  showYearModal.value = true;
  target.value = ''; // clear input so same files can be selected again
}

async function confirmYearAndImportReport() {
  showYearModal.value = false;
  if (pendingReportFiles.value.length === 0) return;

  const allItems: ImportItem[] = [];

  for (const file of pendingReportFiles.value) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(arrayBuffer);
      const ws = wb.worksheets[0];
      
      if (!ws) {
        console.error("File không hợp lệ:", file.name);
        continue;
      }
      
      ws.eachRow((row, rowNumber) => {
        // Bỏ qua dòng tiêu đề (dòng 1)
        if (rowNumber === 1) return;
        
        const getNum = (c: number) => {
          const val = row.getCell(c).value;
          if (typeof val === 'number') return val;
          if (typeof val === 'object' && val && 'result' in val) {
            return Number(val.result) || 0;
          }
          return Number(val?.toString().replace(/[,]/g, '')) || 0;
        };
  
        const mst = row.getCell(1).value?.toString() || '';
        const po = row.getCell(2).value?.toString() || '';
        const am = row.getCell(3).value?.toString() || '';
        const monCell = row.getCell(4).value?.toString() || '';
        const customer = row.getCell(5).value?.toString() || '';
        const contentVal = row.getCell(6).value?.toString() || '';
        const productType = row.getCell(7).value?.toString() || '';
        
        // Lấy thời gian tạo theo cột Month và năm đã chọn, ngày mặc định là 01
        let createdTime = '';
        if (monCell) {
          const monthNum = parseInt(monCell.replace(/\D/g, ''));
          if (monthNum >= 1 && monthNum <= 12) {
            const yyyy = selectedYearForReport.value; // Override selected year!
            const mm = String(monthNum).padStart(2, '0');
            createdTime = `01/${mm}/${yyyy} 00:00:00`;
          }
        }
        
        const doanhSoBan = getNum(8);
        const giaMua = getNum(9);
        const tongCP = getNum(13);
        const grossCom = getNum(14);
        const thueVal = getNum(15);
        const netCom = getNum(16);
        
        let taxPct = 0;
        if (grossCom > 0 && thueVal > 0) {
          taxPct = Math.round((thueVal / grossCom) * 100);
        } else if (thueVal > 0) {
          taxPct = 25; // fallback
        }
        
        // Chỉ import các dòng có dữ liệu PO hoặc Doanh số
        if (po || doanhSoBan > 0) {
          allItems.push({
            id: Date.now() + Math.random(),
            row: null,
            doanhSoBan,
            giaMua,
            tongCP,
            grossCom,
            soPO: po,
            productType,
            customer,
            mst,
            createdTime,
            content: contentVal,
            netCom,
            am,
            taxPct,
            scanning: false,
            activeTab: 'po'
          });
        }
      });
    } catch (error) {
      console.error("Lỗi đọc file Excel:", error);
    }
  }

  if (allItems.length > 0) {
    multiEditModal.value = {
      show: true,
      mode: 'create',
      items: allItems
    };
  } else {
    alert("Không tìm thấy dữ liệu hợp lệ trong các file Excel đã chọn.");
  }
}

  const searchSuggestions = computed(() => {
  return filteredRows.value.slice(0, 5)
})

const hideSearchSuggestionsDelay = () => {
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 250)
}

const selectSuggestion = (item: any) => {
  searchStr.value = item.So_PO;
  showSearchSuggestions.value = false;
  setTimeout(() => {
    searchStr.value = "";
    const fullRow = rows.value.find(r => String(r.So_PO).trim() === String(item.So_PO).trim());
    if (fullRow) openMultiEditModal(fullRow); else openMultiEditModal(item);
  }, 150);
}

const currentDate = new Date()
const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

const timeFilterMode = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const monthFrom = ref('')
const monthTo = ref('')
const yearFrom = ref('')
const yearTo = ref('')
const filterAM = ref('')
const sortOrder = ref('Mới nhất')
const sortPoOrder = ref('')
const filterProductType = ref('Tất cả')
const filterDebtStatus = ref('Tất cả')
const lichSuThanhToanList = ref<any[]>([])
const khachHangMap = ref<Record<string, any>>({})

interface PaymentScheduleItem {
  dot: number;
  noi_dung: string;
  ty_le_pct: number;
  so_tien_phai_thu: number;
  han_thanh_toan: string;
}

const paymentModal = ref<{
  show: boolean;
  row: any;
  amount: number;
  amountStr: string;
  paymentTime: string;
  note: string;
  saving: boolean;
  scheduleMode: 'mot_lan' | 'nhieu_dot';
  singleDueDate: string;
  scheduleItems: PaymentScheduleItem[];
  savingSchedule: boolean;
  showScheduleSubModal: boolean;
  showRecordSubModal: boolean;
}>({
  show: false,
  row: null,
  amount: 0,
  amountStr: '',
  paymentTime: '',
  note: '',
  saving: false,
  scheduleMode: 'mot_lan',
  singleDueDate: '',
  scheduleItems: [],
  savingSchedule: false,
  showScheduleSubModal: false,
  showRecordSubModal: false
})

const uniqueProductTypes = computed(() => {
  const map = new Map<string, string>()
  rows.value.forEach(r => {
    if (r.Ten_nha_cung_cap) {
      const original = String(r.Ten_nha_cung_cap).trim()
      const lower = original.toLowerCase()
      if (lower && !map.has(lower)) {
        map.set(lower, original)
      }
    }
  })
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b))
})

watch([dateFrom, dateTo], ([newFrom, newTo], [oldFrom, oldTo]) => {
  if (newFrom && newTo && newFrom > newTo) {
    if (newFrom !== oldFrom) dateTo.value = newFrom
    else dateFrom.value = newTo
  }
})

watch([monthFrom, monthTo], ([newFrom, newTo], [oldFrom, oldTo]) => {
  if (newFrom && newTo && newFrom > newTo) {
    if (newFrom !== oldFrom) monthTo.value = newFrom
    else monthFrom.value = newTo
  }
})

watch([yearFrom, yearTo], ([newFrom, newTo], [oldFrom, oldTo]) => {
  if (newFrom && newTo && Number(newFrom) > Number(newTo)) {
    if (newFrom !== oldFrom) yearTo.value = newFrom
    else yearFrom.value = newTo
  }
})
const modalInput = ref<HTMLInputElement | null>(null)
const editModal = ref<{ show: boolean; row: any; field: string; label: string; value: number }>({
  show: false, row: null, field: '', label: '', value: 0
})
const savingModal = ref(false)

// ─── Core Helpers & Financial Formulas (Hoisted before computed/watchers) ───
const toNum = (v: any) => {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

const getMonth = (t: string) => {
  if (!t) return ''
  const parts = String(t).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (parts) return Number(parts[2])
  const iso = String(t).match(/(\d{4})-(\d{2})/)
  if (iso) return Number(iso[2])
  return ''
}

const fmtDate = (v: any): string => {
  if (!v) return ''
  const s = String(v)
  const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/)
  if (m1) return s
  const m1b = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/)
  if (m1b) return `${m1b[1]}/${m1b[2]}/${m1b[3]} ${m1b[4]}:${m1b[5]}:00`
  const d = new Date(v)
  if (!isNaN(d.getTime())) {
    const p = (n: number) => String(n).padStart(2, '0')
    return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  }
  return s
}

const parseDateStr = (s: string) => {
  if (!s) return null;
  s = String(s);
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
  if (m1) {
    return new Date(`${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}T${m1[4].padStart(2,'0')}:${m1[5].padStart(2,'0')}:${(m1[6]||'00').padStart(2,'0')}`);
  }
  const m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m2) {
    return new Date(`${m2[3]}-${m2[2].padStart(2,'0')}-${m2[1].padStart(2,'0')}T00:00:00`);
  }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return new Date(s);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const doanhSoBan = (r: any) => toNum(r?.Tong_tien_truoc_thueVAT)
const tongSauVat = (r: any) => {
  const s = toNum(r?.Tong_tien_sau_thueVAT)
  return s > 0 ? s : (toNum(r?.Tong_tien_truoc_thueVAT) + toNum(r?.Tong_thueVAT))
}
const daThanhToan = (r: any) => toNum(r?.so_tien_da_thanh_toan)
const congNo = (r: any) => {
  if (!r) return 0
  if (r.cong_no !== undefined && r.cong_no !== null && r.cong_no !== '') {
    return Math.max(0, toNum(r.cong_no))
  }
  return Math.max(0, tongSauVat(r) - daThanhToan(r))
}

// ─── Payment Due Date & Multi-Installment Helpers ───
const ddmmyyyyToIso = (s: string): string => {
  if (!s) return ''
  const str = String(s).trim()
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) {
    return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  }
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  return ''
}

const isoToDdmmyyyy = (iso: string): string => {
  if (!iso) return ''
  const str = String(iso).trim()
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`
  return str
}

const formatDateObjToDdmmyyyy = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

const addDaysToDateStr = (baseStr: string, days: number): string => {
  const baseDate = parseDateStr(baseStr) || new Date()
  const target = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  target.setDate(target.getDate() + days)
  return formatDateObjToDdmmyyyy(target)
}

const getDaysUntilDue = (dueDateStr: string): number | null => {
  if (!dueDateStr) return null
  const d = parseDateStr(String(dueDateStr).trim())
  if (!d || isNaN(d.getTime())) return null
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dueMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((dueMidnight - todayMidnight) / 86400000)
}

const evaluateInstallmentSchedule = (
  totalSau: number,
  paidTotal: number,
  mode: 'mot_lan' | 'nhieu_dot',
  singleDue: string,
  items: PaymentScheduleItem[]
) => {
  const rawList: PaymentScheduleItem[] =
    mode === 'nhieu_dot' && Array.isArray(items) && items.length > 0
      ? items
      : [
          {
            dot: 1,
            noi_dung: 'Thanh toán 100% đơn hàng',
            ty_le_pct: 100,
            so_tien_phai_thu: totalSau,
            han_thanh_toan: singleDue || (Array.isArray(items) && items[0]?.han_thanh_toan) || ''
          }
        ]

  let remainingPaid = Math.max(0, toNum(paidTotal))

  return rawList.map((inst, idx) => {
    const phaiThu = Math.max(0, toNum(inst.so_tien_phai_thu))
    const daThu = Math.min(phaiThu, remainingPaid)
    remainingPaid = Math.max(0, remainingPaid - daThu)
    const conThieu = Math.max(0, phaiThu - daThu)
    const hanTT = String(inst.han_thanh_toan || '').trim()
    const daysDiff = getDaysUntilDue(hanTT)

    let status: 'da_thu_du' | 'qua_han' | 'den_han_hom_nay' | 'sap_den_han' | 'thu_mot_phan' | 'trong_han' | 'chua_co_han' = 'chua_co_han'
    let statusLabel = 'Chưa đặt hạn'
    let statusColor = '#64748b'

    if (conThieu <= 0 && phaiThu > 0) {
      status = 'da_thu_du'
      statusLabel = 'Đã thu đủ'
      statusColor = '#34d399'
    } else if (daysDiff !== null && daysDiff < 0) {
      status = 'qua_han'
      statusLabel = `Quá hạn ${Math.abs(daysDiff)} ngày`
      statusColor = '#f87171'
    } else if (daysDiff !== null && daysDiff === 0) {
      status = 'den_han_hom_nay'
      statusLabel = 'Hôm nay đến hạn'
      statusColor = '#fbbf24'
    } else if (daysDiff !== null && daysDiff > 0 && daysDiff <= 7) {
      status = 'sap_den_han'
      statusLabel = `Sắp đến hạn (còn ${daysDiff} ngày)`
      statusColor = '#fbbf24'
    } else if (daThu > 0) {
      status = 'thu_mot_phan'
      statusLabel = daysDiff !== null ? `Thu 1 phần (còn ${daysDiff} ngày)` : 'Đã thu 1 phần'
      statusColor = '#38bdf8'
    } else if (daysDiff !== null && daysDiff > 7) {
      status = 'trong_han'
      statusLabel = `Trong hạn (còn ${daysDiff} ngày)`
      statusColor = '#94a3b8'
    }

    return {
      dot: inst.dot || idx + 1,
      noi_dung: inst.noi_dung || `Đợt ${idx + 1}`,
      ty_le_pct: toNum(inst.ty_le_pct),
      so_tien_phai_thu: phaiThu,
      han_thanh_toan: hanTT,
      da_thu: daThu,
      con_thieu: conThieu,
      daysDiff,
      status,
      statusLabel,
      statusColor
    }
  })
}

const getPoDueInfo = (r: any) => {
  if (!r) {
    return {
      loaiThanhToan: 'mot_lan' as const,
      totalDots: 1,
      paidDots: 0,
      currentDot: 1,
      nextDueDate: '',
      nextDueAmount: 0,
      daysDiff: null as number | null,
      dueStatus: 'chua_co_han' as const,
      dueBadgeText: ''
    }
  }
  const totalSau = tongSauVat(r)
  const paid = daThanhToan(r)
  const cn = congNo(r)
  const mode: 'mot_lan' | 'nhieu_dot' =
    r.loai_thanh_toan === 'nhieu_dot' || (Array.isArray(r.ke_hoach_thanh_toan) && r.ke_hoach_thanh_toan.length > 1)
      ? 'nhieu_dot'
      : 'mot_lan'
  const schedule: PaymentScheduleItem[] = Array.isArray(r.ke_hoach_thanh_toan) ? r.ke_hoach_thanh_toan : []
  const singleDue = String(r.han_thanh_toan || (schedule[0]?.han_thanh_toan || '')).trim()

  const evalList = evaluateInstallmentSchedule(totalSau, paid, mode, singleDue, schedule)
  const totalDots = evalList.length
  const paidDots = evalList.filter(x => x.con_thieu <= 0 && x.so_tien_phai_thu > 0).length

  if (cn <= 0 && totalSau > 0) {
    const lastDue = evalList[evalList.length - 1]?.han_thanh_toan || singleDue
    return {
      loaiThanhToan: mode,
      totalDots,
      paidDots: totalDots,
      currentDot: totalDots,
      nextDueDate: lastDue,
      nextDueAmount: 0,
      daysDiff: null as number | null,
      dueStatus: 'da_thu_du' as const,
      dueBadgeText: 'Đã tất toán đủ'
    }
  }

  // Tìm đợt chưa thu đủ tiếp theo (ưu tiên đợt quá hạn trước, hoặc đợt chưa thu đầu tiên)
  const unpaidList = evalList.filter(x => x.con_thieu > 0)
  const overdueInst = unpaidList.find(x => x.status === 'qua_han')
  const activeInst = overdueInst || unpaidList[0] || evalList[evalList.length - 1]

  const nextDueDate = activeInst?.han_thanh_toan || singleDue || ''
  const daysDiff = getDaysUntilDue(nextDueDate)
  const currentDot = activeInst?.dot || 1
  const nextDueAmount = activeInst ? activeInst.con_thieu : cn

  let dueStatus: 'qua_han' | 'den_han_hom_nay' | 'sap_den_han' | 'trong_han' | 'chua_co_han' = 'chua_co_han'
  let dueBadgeText = ''

  if (daysDiff !== null && daysDiff < 0) {
    dueStatus = 'qua_han'
    dueBadgeText = mode === 'nhieu_dot'
      ? `Đợt ${currentDot}/${totalDots}: Quá hạn ${Math.abs(daysDiff)} ngày (${nextDueDate})`
      : `Quá hạn ${Math.abs(daysDiff)} ngày (Hạn: ${nextDueDate})`
  } else if (daysDiff !== null && daysDiff === 0) {
    dueStatus = 'den_han_hom_nay'
    dueBadgeText = mode === 'nhieu_dot'
      ? `Đợt ${currentDot}/${totalDots}: Hôm nay đến hạn (${nextDueDate})`
      : `Hôm nay đến hạn (${nextDueDate})`
  } else if (daysDiff !== null && daysDiff > 0 && daysDiff <= 7) {
    dueStatus = 'sap_den_han'
    dueBadgeText = mode === 'nhieu_dot'
      ? `Đợt ${currentDot}/${totalDots}: Còn ${daysDiff} ngày (${nextDueDate})`
      : `Sắp đến hạn: Còn ${daysDiff} ngày (${nextDueDate})`
  } else if (nextDueDate) {
    dueStatus = 'trong_han'
    dueBadgeText = mode === 'nhieu_dot'
      ? `Đợt ${currentDot}/${totalDots} • Hạn TT: ${nextDueDate}`
      : `Hạn TT: ${nextDueDate}`
  } else if (mode === 'nhieu_dot') {
    dueStatus = 'chua_co_han'
    dueBadgeText = `Chia ${totalDots} đợt (Đã thu ${paidDots}/${totalDots} đợt)`
  }

  return {
    loaiThanhToan: mode,
    totalDots,
    paidDots,
    currentDot,
    nextDueDate,
    nextDueAmount,
    daysDiff,
    dueStatus,
    dueBadgeText
  }
}

async function syncAllCustomersCongNo(currentRows?: any[]) {
  try {
    const activeRows = currentRows || rows.value || []
    const khSnapshot = await get(dbRef(database, 'khach_hang'))
    const khData = khSnapshot.val() || {}
    khachHangMap.value = khData

    // Tính tổng công nợ theo Ma_khach_hang và Ma_cong_ty từ sale_report
    const debtByMaKH = new Map<string, number>()
    const debtByMaCty = new Map<string, number>()

    activeRows.forEach((r: any) => {
      if (!r || typeof r !== 'object') return
      const d = congNo(r)
      const mkh = String(r.Ma_khach_hang || '').trim()
      const mct = String(r.Ma_cong_ty || '').trim()
      if (mkh) debtByMaKH.set(mkh, (debtByMaKH.get(mkh) || 0) + d)
      if (mct) debtByMaCty.set(mct, (debtByMaCty.get(mct) || 0) + d)
    })

    const updates: Record<string, any> = {}
    Object.entries(khData).forEach(([khKey, khObj]: [string, any]) => {
      if (!khObj || typeof khObj !== 'object') return
      const mkh = String(khObj.ma_khach_hang || khObj.Ma_khach_hang || khKey || '').trim()
      const mct = String(khObj.ma_cong_ty || khObj.Ma_cong_ty || '').trim()
      let totalDebt = 0
      if (mkh && debtByMaKH.has(mkh)) {
        totalDebt = debtByMaKH.get(mkh) || 0
      } else if (mct && debtByMaCty.has(mct)) {
        totalDebt = debtByMaCty.get(mct) || 0
      } else if (mkh && debtByMaCty.has(mkh)) {
        totalDebt = debtByMaCty.get(mkh) || 0
      }
      if (Number(khObj.cong_no) !== totalDebt) {
        updates[`khach_hang/${khKey}/cong_no`] = totalDebt
        khObj.cong_no = totalDebt
      }
    })

    if (Object.keys(updates).length > 0) {
      await update(dbRef(database), updates)
    }
  } catch (e) {
    console.warn('Lỗi đồng bộ cong_no vào khach_hang:', e)
  }
}

async function loadData() {
  loading.value = true
  try {
    // ─── Read sale_report from Firebase ───
    const saleReportSnapshot = await get(dbRef(database, 'sale_report'))
    const saleReportData = saleReportSnapshot.val() || {}
    
    const mappedRows: any[] = []
    const backfillUpdates: Record<string, any> = {}

    Object.entries(saleReportData).forEach(([firebaseKey, item]: [string, any]) => {
      if (!item || typeof item !== 'object') return
      const tSau = Number(item.Tong_tien_sau_thueVAT) > 0
        ? Number(item.Tong_tien_sau_thueVAT)
        : (Number(item.Tong_tien_truoc_thueVAT) || 0) + (Number(item.Tong_thueVAT) || 0)
      const daTT = Number(item.so_tien_da_thanh_toan) || 0
      const cn = (item.cong_no !== undefined && item.cong_no !== null && item.cong_no !== '')
        ? Math.max(0, Number(item.cong_no) || 0)
        : Math.max(0, tSau - daTT)
      const tgTT = item.thoi_gian_thanh_toan !== undefined ? String(item.thoi_gian_thanh_toan || '') : ''
      const loaiTT: 'mot_lan' | 'nhieu_dot' =
        item.loai_thanh_toan === 'nhieu_dot' || (Array.isArray(item.ke_hoach_thanh_toan) && item.ke_hoach_thanh_toan.length > 1)
          ? 'nhieu_dot'
          : 'mot_lan'
      const hanTT = item.han_thanh_toan !== undefined ? String(item.han_thanh_toan || '') : ''
      const keHoachTT = Array.isArray(item.ke_hoach_thanh_toan) ? item.ke_hoach_thanh_toan : []

      if (item.so_tien_da_thanh_toan === undefined || item.cong_no === undefined || item.thoi_gian_thanh_toan === undefined) {
        backfillUpdates[`sale_report/${firebaseKey}/so_tien_da_thanh_toan`] = daTT
        backfillUpdates[`sale_report/${firebaseKey}/cong_no`] = cn
        backfillUpdates[`sale_report/${firebaseKey}/thoi_gian_thanh_toan`] = tgTT
      }

      mappedRows.push({
        ...item,
        so_tien_da_thanh_toan: daTT,
        cong_no: cn,
        thoi_gian_thanh_toan: tgTT,
        loai_thanh_toan: loaiTT,
        han_thanh_toan: hanTT,
        ke_hoach_thanh_toan: keHoachTT,
        _firebaseKey: firebaseKey, // lưu key Firebase để update/delete
        ID: item.ID || firebaseKey
      })
    })
    rows.value = mappedRows

    if (Object.keys(backfillUpdates).length > 0) {
      update(dbRef(database), backfillUpdates).catch(err => console.warn('Backfill sale_report debt fields error:', err))
    }

    // ─── Read lich_su_thanh_toan from Firebase ───
    try {
      const lsttSnapshot = await get(dbRef(database, 'lich_su_thanh_toan'))
      const lsttData = lsttSnapshot.val() || {}
      const list: any[] = []
      Object.entries(lsttData).forEach(([key, val]: [string, any]) => {
        if (val && typeof val === 'object') {
          list.push({
            ...val,
            id: val.id || key,
            _firebaseKey: key
          })
        }
      })
      list.sort((a, b) => {
        const da = parseDateStr(a.thoi_gian_thanh_toan)?.getTime() || 0
        const db = parseDateStr(b.thoi_gian_thanh_toan)?.getTime() || 0
        if (db !== da) return db - da
        return String(b.id || '').localeCompare(String(a.id || ''))
      })
      lichSuThanhToanList.value = list
    } catch (e) {
      console.warn('Lỗi load lich_su_thanh_toan từ Firebase:', e)
    }

    // ─── Sync cong_no to khach_hang (non-blocking) ───
    syncAllCustomersCongNo(mappedRows)
    
    // ─── Read hop_dong_chi_tiet from Firebase ───
    try {
      const chiTietSnapshot = await get(dbRef(database, 'hop_dong_chi_tiet'))
      const chiTietData = chiTietSnapshot.val() || {}
      // Convert object to array format tương thích với code cũ
      const chiTietArr: any[] = []
      Object.values(chiTietData).forEach((item: any) => {
        if (Array.isArray(item)) {
          chiTietArr.push(item)
        } else if (item && typeof item === 'object') {
          chiTietArr.push([
            item.ma_hop_dong ?? item.Ma_hop_dong ?? '',
            item.so_hop_dong ?? item.So_hop_dong ?? '',
            item.ma_hang ?? item.Ma_hang_hoa ?? item.ma_hang_hoa ?? '',
            item.ten_hang ?? item.Ten_hang_hoa ?? item.ten_hang_hoa ?? '',
            item.main_img ?? '',
            item.ma_ncc ?? item.Ma_nha_cung_cap ?? item.ma_nha_cung_cap ?? '',
            item.ten_ncc ?? item.Ten_nha_cung_cap ?? item.ten_nha_cung_cap ?? '',
            item.mo_ta_chung ?? item.Mo_ta_chung ?? '',
            item.mo_ta_chi_tiet ?? item.Mo_ta_chi_tiet ?? '',
            item.dien_giai ?? item.Dien_giai ?? '',
            item.danh_muc ?? item.Danh_muc ?? '',
            item.ghi_chu ?? item.Ghi_chu ?? '',
            item.dvt ?? item.DVT ?? '',
            item.don_gia ?? item.Don_gia ?? 0,
            item.gia_tieu_chuan ?? item.Gia_tieu_chuan ?? 0,
            item.don_vi_tien_te ?? item.Don_vi_tien_te ?? 'VND',
            item.ti_gia ?? item.Ti_gia ?? 1,
            item.thue_vat ?? item.Thue_VAT ?? 0,
            item.so_luong ?? item.So_luong ?? 1,
            item.features ?? item.Features ?? '',
            item.gia_hardware ?? item.Gia_hardware ?? 0,
            item.gia_nhap ?? item.Gia_nhap ?? 0,
            item.muc_phan_tram_off ?? item.Muc_phan_tram_off ?? 0
          ])
        }
      })
      hdChiTietData.value = chiTietArr
    } catch(e) {
      console.warn('Lỗi load hd_chi_tiet từ Firebase:', e)
    }
  } catch (e) {
    console.error('Lỗi load sale_report từ Firebase:', e)
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const uniqueAMs = computed(() => {
  const set = new Set<string>()
  rows.value.forEach(r => {
    if (r.account_manager_name) set.add(r.account_manager_name)
  })
  return [...set].sort()
})

const filterCustomer = ref('Tất cả');
const showCustomerDropdown = ref(false);

const filteredCustomerOptions = computed(() => {
  const search = (filterCustomer.value || '').toLowerCase().trim();
  const allOptions = uniqueCustomers.value;
  if (!search || search === 'tất cả') return [{ companyName: 'Tất cả' }, ...allOptions];
  
  return allOptions.filter(c => 
    c.companyName.toLowerCase().includes(search) || 
    c.customerName.toLowerCase().includes(search) ||
    c.companyCode.toLowerCase().includes(search)
  );
});

const selectCustomerOption = (c: any) => {
  filterCustomer.value = c.companyName === 'Tất cả' ? 'Tất cả' : c.companyName;
  showCustomerDropdown.value = false;
};

const onCustomerInputBlur = () => {
  setTimeout(() => {
    showCustomerDropdown.value = false;
    if (!filterCustomer.value) {
      filterCustomer.value = 'Tất cả';
    }
  }, 200); // delay to allow click event on dropdown items
};

const uniqueCustomers = computed(() => {
  const map = new Map();
  rows.value.forEach(r => {
    const maCty = String(r.Ma_cong_ty || '').trim();
    const cn = congNo(r);
    if (maCty) {
      if (!map.has(maCty)) {
        map.set(maCty, {
          companyName: String(r.Ten_cong_ty || '').trim() || maCty,
          customerName: String(r.Ten_khach_hang || '').trim(),
          companyCode: maCty,
          totalCongNo: 0
        });
      }
      map.get(maCty).totalCongNo += cn;
    } else {
      const cty = String(r.Ten_cong_ty || '').trim();
      if (cty) {
        if (!map.has(cty)) {
          map.set(cty, {
            companyName: cty,
            customerName: String(r.Ten_khach_hang || '').trim(),
            companyCode: '',
            totalCongNo: 0
          });
        }
        map.get(cty).totalCongNo += cn;
      }
    }
  });
  return Array.from(map.values()).sort((a, b) => a.companyName.localeCompare(b.companyName));
});

const filteredRows = computed(() => {
  let list = rows.value
  if (searchStr.value) {
    const q = searchStr.value.toLowerCase()
    list = list.filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(q))
    )
  }
  
  list = list.filter(r => {
    if (!r.created_time) return true
    const d = parseDateStr(r.created_time)
    if (!d) return true
    
    if (timeFilterMode.value === 'day') {
      if (dateFrom.value && new Date(dateFrom.value) > d) return false
      if (dateTo.value) {
        const to = new Date(dateTo.value)
        to.setHours(23, 59, 59, 999)
        if (to < d) return false
      }
    } else if (timeFilterMode.value === 'month') {
      const rowMonthStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if (monthFrom.value && monthFrom.value > rowMonthStr) return false
      if (monthTo.value && monthTo.value < rowMonthStr) return false
    } else if (timeFilterMode.value === 'year') {
      const y = d.getFullYear()
      if (yearFrom.value && parseInt(yearFrom.value) > y) return false
      if (yearTo.value && parseInt(yearTo.value) < y) return false
    }
    return true
  })

  if (filterAM.value) {
    list = list.filter(r => r.account_manager_name === filterAM.value)
  }

  if (filterCustomer.value && filterCustomer.value !== 'Tất cả') {
    const target = filterCustomer.value.toLowerCase().trim();
    const exactMatch = uniqueCustomers.value.find(c => c.companyName.toLowerCase() === target);
    const targetCode = exactMatch ? exactMatch.companyCode.toLowerCase() : '';

    list = list.filter(r => {
      const ten = String(r.Ten_cong_ty || '').toLowerCase();
      const tenKh = String(r.Ten_khach_hang || '').toLowerCase();
      const macty = String(r.Ma_cong_ty || '').toLowerCase();
      
      if (targetCode && macty === targetCode) return true;
      return ten.includes(target) || tenKh.includes(target) || macty.includes(target);
    });
  }

  if (filterProductType.value !== 'Tất cả') {
    const targetLower = filterProductType.value.toLowerCase()
    list = list.filter(r => r.Ten_nha_cung_cap && String(r.Ten_nha_cung_cap).toLowerCase().trim() === targetLower)
  }

  if (filterDebtStatus.value && filterDebtStatus.value !== 'Tất cả') {
    list = list.filter(r => {
      const cn = congNo(r)
      const dtt = daThanhToan(r)
      const dueInfo = getPoDueInfo(r)
      if (filterDebtStatus.value === 'Còn công nợ') return cn > 0
      if (filterDebtStatus.value === 'Quá hạn thanh toán') return cn > 0 && dueInfo.dueStatus === 'qua_han'
      if (filterDebtStatus.value === 'Sắp đến hạn') return cn > 0 && (dueInfo.dueStatus === 'sap_den_han' || dueInfo.dueStatus === 'den_han_hom_nay')
      if (filterDebtStatus.value === 'Chưa thanh toán') return cn > 0 && dtt <= 0
      if (filterDebtStatus.value === 'Thanh toán 1 phần') return cn > 0 && dtt > 0
      if (filterDebtStatus.value === 'Đã tất toán') return cn <= 0
      return true
    })
  }

  list.sort((a, b) => {
    if (sortPoOrder.value === 'PO giảm') {
      const pa = parseInt(String(a.So_PO).replace(/\D/g, '')) || 0
      const pb = parseInt(String(b.So_PO).replace(/\D/g, '')) || 0
      if (pa !== pb) return pb - pa
    } else if (sortPoOrder.value === 'PO tăng') {
      const pa = parseInt(String(a.So_PO).replace(/\D/g, '')) || 0
      const pb = parseInt(String(b.So_PO).replace(/\D/g, '')) || 0
      if (pa !== pb) return pa - pb
    }
    const da = parseDateStr(a.created_time)?.getTime() || 0
    const db = parseDateStr(b.created_time)?.getTime() || 0
    return sortOrder.value === 'Mới nhất' ? db - da : da - db
  })

  return list
})

const displayLimit = ref(15)

watch(filteredRows, () => {
  displayLimit.value = 15
})

const displayedRows = computed(() => {
  return filteredRows.value.slice(0, displayLimit.value)
})

const groupedDisplayedRows = computed(() => {
  const map = new Map();
  displayedRows.value.forEach(r => {
    const maCty = r.Ma_cong_ty || 'Khác';
    if (!map.has(maCty)) {
      map.set(maCty, {
        ma_cong_ty: maCty,
        ten_cong_ty: r.Ten_cong_ty || 'N/A',
        items: []
      });
    }
    map.get(maCty).items.push(r);
  });
  return Array.from(map.values());
});

const loadMore = () => {
  displayLimit.value += 15
}

const unpaidPoCount = computed(() => filteredRows.value.filter(r => congNo(r) > 0).length)
const overduePoCount = computed(() => rows.value.filter(r => congNo(r) > 0 && getPoDueInfo(r).dueStatus === 'qua_han').length)
const dueSoonPoCount = computed(() => rows.value.filter(r => {
  if (congNo(r) <= 0) return false
  const st = getPoDueInfo(r).dueStatus
  return st === 'sap_den_han' || st === 'den_han_hom_nay'
}).length)

const getGroupCongNo = (groupOrItems: any) => {
  const arr = Array.isArray(groupOrItems)
    ? groupOrItems
    : (Array.isArray(groupOrItems?.items) ? groupOrItems.items : [])
  return arr.reduce((s: number, r: any) => s + congNo(r), 0)
}
const getGroupDaThanhToan = (groupOrItems: any) => {
  const arr = Array.isArray(groupOrItems)
    ? groupOrItems
    : (Array.isArray(groupOrItems?.items) ? groupOrItems.items : [])
  return arr.reduce((s: number, r: any) => s + daThanhToan(r), 0)
}

const getPaymentHistoryForPO = (r: any) => {
  if (!r) return []
  const srId = String(r.ID || r._firebaseKey || '')
  const fbKey = String(r._firebaseKey || '')
  return lichSuThanhToanList.value.filter(h =>
    (srId && String(h.id_salereport) === srId) ||
    (fbKey && String(h.id_salereport) === fbKey)
  )
}

const getCustomerTotalCongNo = (r: any) => {
  if (!r) return 0
  const maKH = String(r.Ma_khach_hang || '').trim()
  const maCty = String(r.Ma_cong_ty || '').trim()
  return rows.value
    .filter(item => {
      if (maKH && String(item.Ma_khach_hang || '').trim() === maKH) return true
      if (maCty && String(item.Ma_cong_ty || '').trim() === maCty) return true
      return false
    })
    .reduce((sum, item) => sum + congNo(item), 0)
}

function openPaymentModal(row: any) {
  const remaining = congNo(row)
  const totalSau = tongSauVat(row)
  const existingMode: 'mot_lan' | 'nhieu_dot' =
    row.loai_thanh_toan === 'nhieu_dot' || (Array.isArray(row.ke_hoach_thanh_toan) && row.ke_hoach_thanh_toan.length > 1)
      ? 'nhieu_dot'
      : 'mot_lan'

  const existingSchedule: PaymentScheduleItem[] =
    Array.isArray(row.ke_hoach_thanh_toan) && row.ke_hoach_thanh_toan.length > 0
      ? row.ke_hoach_thanh_toan.map((it: any, idx: number) => ({
          dot: Number(it.dot) || idx + 1,
          noi_dung: String(it.noi_dung || `Đợt ${idx + 1}`),
          ty_le_pct: Number(it.ty_le_pct) || 0,
          so_tien_phai_thu: Number(it.so_tien_phai_thu) || Math.round(totalSau * ((Number(it.ty_le_pct) || 0) / 100)),
          han_thanh_toan: String(it.han_thanh_toan || '')
        }))
      : [
          {
            dot: 1,
            noi_dung: 'Thanh toán 100% đơn hàng',
            ty_le_pct: 100,
            so_tien_phai_thu: totalSau,
            han_thanh_toan: String(row.han_thanh_toan || '')
          }
        ]

  const singleDue = String(row.han_thanh_toan || existingSchedule[0]?.han_thanh_toan || '')

  // Gợi ý số tiền thanh toán theo đợt tiếp theo chưa thu đủ (nếu chia nhiều đợt)
  const evalInst = evaluateInstallmentSchedule(totalSau, daThanhToan(row), existingMode, singleDue, existingSchedule)
  const nextUnpaid = evalInst.find(x => x.con_thieu > 0)
  const defaultPayAmt = existingMode === 'nhieu_dot' && nextUnpaid
    ? nextUnpaid.con_thieu
    : (remaining > 0 ? remaining : 0)
  const defaultNote = existingMode === 'nhieu_dot' && nextUnpaid
    ? `Thanh toán Đợt ${nextUnpaid.dot} (${nextUnpaid.noi_dung})`
    : ''

  paymentModal.value = {
    show: true,
    row,
    amount: defaultPayAmt,
    amountStr: defaultPayAmt > 0 ? defaultPayAmt.toLocaleString('vi-VN') : '',
    paymentTime: getFormattedNow(),
    note: defaultNote,
    saving: false,
    scheduleMode: existingMode,
    singleDueDate: singleDue,
    scheduleItems: existingSchedule,
    savingSchedule: false,
    showScheduleSubModal: false,
    showRecordSubModal: false
  }
}

function openScheduleSubModal() {
  if (!paymentModal.value.row) return
  paymentModal.value.showScheduleSubModal = true
}

function openRecordPaymentSubModal(evalInst?: any) {
  const m = paymentModal.value
  if (!m.row) return
  m.paymentTime = getFormattedNow()
  if (evalInst) {
    const amt = toNum(evalInst.con_thieu) > 0 ? toNum(evalInst.con_thieu) : toNum(evalInst.so_tien_phai_thu)
    m.amount = amt
    m.amountStr = amt > 0 ? amt.toLocaleString('vi-VN') : ''
    m.note = m.scheduleMode === 'nhieu_dot'
      ? `Thanh toán Đợt ${evalInst.dot} (${evalInst.noi_dung})`
      : 'Thanh toán 100% đơn hàng'
  } else {
    const remaining = congNo(m.row)
    const nextUnpaid = modalEvaluatedInstallments.value.find(x => x.con_thieu > 0)
    const defaultPayAmt = m.scheduleMode === 'nhieu_dot' && nextUnpaid
      ? nextUnpaid.con_thieu
      : (remaining > 0 ? remaining : 0)
    m.amount = defaultPayAmt
    m.amountStr = defaultPayAmt > 0 ? defaultPayAmt.toLocaleString('vi-VN') : ''
    m.note = m.scheduleMode === 'nhieu_dot' && nextUnpaid
      ? `Thanh toán Đợt ${nextUnpaid.dot} (${nextUnpaid.noi_dung})`
      : ''
  }
  m.showScheduleSubModal = false
  m.showRecordSubModal = true
}

const modalEvaluatedInstallments = computed(() => {
  const m = paymentModal.value
  if (!m.row) return []
  return evaluateInstallmentSchedule(
    tongSauVat(m.row),
    daThanhToan(m.row),
    m.scheduleMode,
    m.singleDueDate,
    m.scheduleItems
  )
})

const modalScheduleTotalPct = computed(() => {
  const m = paymentModal.value
  if (m.scheduleMode === 'mot_lan') return 100
  return Math.round(m.scheduleItems.reduce((s, it) => s + toNum(it.ty_le_pct), 0) * 100) / 100
})

const modalScheduleTotalAmount = computed(() => {
  const m = paymentModal.value
  if (!m.row) return 0
  if (m.scheduleMode === 'mot_lan') return tongSauVat(m.row)
  return m.scheduleItems.reduce((s, it) => s + toNum(it.so_tien_phai_thu), 0)
})

function setScheduleMode(mode: 'mot_lan' | 'nhieu_dot') {
  const m = paymentModal.value
  if (!m.row) return
  m.scheduleMode = mode
  const totalSau = tongSauVat(m.row)
  if (mode === 'mot_lan') {
    if (!m.singleDueDate && m.scheduleItems.length > 0) {
      m.singleDueDate = m.scheduleItems[0].han_thanh_toan || ''
    }
  } else {
    if (m.scheduleItems.length <= 1) {
      applySchedulePreset([30, 70], ['Đợt 1 - Tạm ứng hợp đồng', 'Đợt 2 - Thanh toán khi giao hàng'])
    } else {
      // Đảm bảo số tiền đồng bộ với tổng tiền sau VAT
      m.scheduleItems.forEach((it, idx) => {
        it.dot = idx + 1
        if (!it.so_tien_phai_thu && it.ty_le_pct > 0) {
          it.so_tien_phai_thu = Math.round(totalSau * (it.ty_le_pct / 100))
        }
      })
    }
  }
}

function setSingleDueDateDays(days: number, fromCreatedTime = false) {
  const m = paymentModal.value
  if (!m.row) return
  const baseStr = fromCreatedTime && m.row.created_time ? m.row.created_time : getFormattedNow()
  m.singleDueDate = addDaysToDateStr(baseStr, days)
  if (m.scheduleItems.length === 1) {
    m.scheduleItems[0].han_thanh_toan = m.singleDueDate
  }
}

function onSingleDueDatePickerChange(e: Event) {
  const target = e.target as HTMLInputElement
  const dmy = isoToDdmmyyyy(target.value)
  paymentModal.value.singleDueDate = dmy
  if (paymentModal.value.scheduleItems.length === 1) {
    paymentModal.value.scheduleItems[0].han_thanh_toan = dmy
  }
}

function applySchedulePreset(pcts: number[], labels?: string[]) {
  const m = paymentModal.value
  if (!m.row) return
  m.scheduleMode = 'nhieu_dot'
  const totalSau = tongSauVat(m.row)
  const baseStr = m.row.created_time || getFormattedNow()
  let allocated = 0

  m.scheduleItems = pcts.map((pct, idx) => {
    const isLast = idx === pcts.length - 1
    const amt = isLast ? Math.max(0, totalSau - allocated) : Math.round(totalSau * (pct / 100))
    allocated += amt
    const defaultDays = idx === 0 ? 7 : idx === 1 ? 30 : 45 + (idx - 2) * 15
    return {
      dot: idx + 1,
      noi_dung: (labels && labels[idx]) || (idx === 0 ? 'Đợt 1 - Tạm ứng' : idx === pcts.length - 1 ? `Đợt ${idx + 1} - Tất toán` : `Đợt ${idx + 1} - Thanh toán`),
      ty_le_pct: pct,
      so_tien_phai_thu: amt,
      han_thanh_toan: addDaysToDateStr(baseStr, defaultDays)
    }
  })
}

function addScheduleInstallment() {
  const m = paymentModal.value
  if (!m.row) return
  const totalSau = tongSauVat(m.row)
  const currentPct = m.scheduleItems.reduce((s, it) => s + toNum(it.ty_le_pct), 0)
  const remainPct = Math.max(0, Math.round((100 - currentPct) * 100) / 100)
  const currentAmt = m.scheduleItems.reduce((s, it) => s + toNum(it.so_tien_phai_thu), 0)
  const remainAmt = Math.max(0, totalSau - currentAmt)
  const nextDot = m.scheduleItems.length + 1
  const lastDue = m.scheduleItems[m.scheduleItems.length - 1]?.han_thanh_toan || m.row.created_time || getFormattedNow()

  m.scheduleItems.push({
    dot: nextDot,
    noi_dung: `Đợt ${nextDot} - Thanh toán`,
    ty_le_pct: remainPct,
    so_tien_phai_thu: remainAmt,
    han_thanh_toan: addDaysToDateStr(lastDue, 15)
  })
}

function removeScheduleInstallment(idx: number) {
  const m = paymentModal.value
  if (m.scheduleItems.length <= 1) return
  m.scheduleItems.splice(idx, 1)
  m.scheduleItems.forEach((it, i) => {
    it.dot = i + 1
  })
}

function onInstallmentPctChange(idx: number, e: Event) {
  const m = paymentModal.value
  if (!m.row || !m.scheduleItems[idx]) return
  const target = e.target as HTMLInputElement
  const pct = Math.max(0, Math.min(100, Number(target.value) || 0))
  const totalSau = tongSauVat(m.row)
  m.scheduleItems[idx].ty_le_pct = pct
  m.scheduleItems[idx].so_tien_phai_thu = Math.round(totalSau * (pct / 100))
}

function onInstallmentAmountInput(idx: number, e: Event) {
  const m = paymentModal.value
  if (!m.row || !m.scheduleItems[idx]) return
  const target = e.target as HTMLInputElement
  const raw = target.value.replace(/[^0-9]/g, '')
  const amt = raw ? Number(raw) : 0
  const totalSau = tongSauVat(m.row)
  m.scheduleItems[idx].so_tien_phai_thu = amt
  m.scheduleItems[idx].ty_le_pct = totalSau > 0 ? Math.round((amt / totalSau) * 10000) / 100 : 0
  target.value = amt > 0 ? amt.toLocaleString('vi-VN') : ''
}

function onInstallmentDatePickerChange(idx: number, e: Event) {
  const m = paymentModal.value
  if (!m.scheduleItems[idx]) return
  const target = e.target as HTMLInputElement
  m.scheduleItems[idx].han_thanh_toan = isoToDdmmyyyy(target.value)
}

function balanceLastInstallment() {
  const m = paymentModal.value
  if (!m.row || m.scheduleItems.length === 0) return
  const totalSau = tongSauVat(m.row)
  const lastIdx = m.scheduleItems.length - 1
  let sumOtherAmt = 0
  let sumOtherPct = 0
  for (let i = 0; i < lastIdx; i++) {
    sumOtherAmt += toNum(m.scheduleItems[i].so_tien_phai_thu)
    sumOtherPct += toNum(m.scheduleItems[i].ty_le_pct)
  }
  const remainAmt = Math.max(0, totalSau - sumOtherAmt)
  const remainPct = Math.max(0, Math.round((100 - sumOtherPct) * 100) / 100)
  m.scheduleItems[lastIdx].so_tien_phai_thu = remainAmt
  m.scheduleItems[lastIdx].ty_le_pct = remainPct
}

function selectInstallmentToPay(evalInst: any) {
  openRecordPaymentSubModal(evalInst)
}

function buildSchedulePayloadForRow(r: any, paidAmountOverride?: number) {
  const m = paymentModal.value
  const totalSau = tongSauVat(r)
  const paid = paidAmountOverride !== undefined ? paidAmountOverride : daThanhToan(r)
  const mode = m.scheduleMode

  let finalSchedule: PaymentScheduleItem[] = []
  if (mode === 'mot_lan') {
    const due = (m.singleDueDate || '').trim()
    finalSchedule = [
      {
        dot: 1,
        noi_dung: 'Thanh toán 100% đơn hàng',
        ty_le_pct: 100,
        so_tien_phai_thu: totalSau,
        han_thanh_toan: due
      }
    ]
  } else {
    finalSchedule = m.scheduleItems.map((it, idx) => ({
      dot: idx + 1,
      noi_dung: String(it.noi_dung || `Đợt ${idx + 1}`).trim(),
      ty_le_pct: toNum(it.ty_le_pct),
      so_tien_phai_thu: toNum(it.so_tien_phai_thu),
      han_thanh_toan: String(it.han_thanh_toan || '').trim()
    }))
  }

  const evalList = evaluateInstallmentSchedule(totalSau, paid, mode, m.singleDueDate, finalSchedule)
  const unpaidList = evalList.filter(x => x.con_thieu > 0)
  const overdueInst = unpaidList.find(x => x.status === 'qua_han')
  const nextActive = overdueInst || unpaidList[0] || evalList[evalList.length - 1]
  const activeDueDate = String(nextActive?.han_thanh_toan || m.singleDueDate || '').trim()

  return {
    loai_thanh_toan: mode,
    han_thanh_toan: activeDueDate,
    ke_hoach_thanh_toan: finalSchedule
  }
}

async function savePaymentScheduleOnly() {
  const m = paymentModal.value
  if (!m.row || m.savingSchedule) return
  m.savingSchedule = true
  try {
    const r = m.row
    const fbKey = r._firebaseKey || r.ID
    const payload = buildSchedulePayloadForRow(r)

    const updates: Record<string, any> = {}
    if (fbKey) {
      updates[`sale_report/${fbKey}/loai_thanh_toan`] = payload.loai_thanh_toan
      updates[`sale_report/${fbKey}/han_thanh_toan`] = payload.han_thanh_toan
      updates[`sale_report/${fbKey}/ke_hoach_thanh_toan`] = payload.ke_hoach_thanh_toan
    }
    if (r.ma_hop_dong) {
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/loai_thanh_toan`] = payload.loai_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/han_thanh_toan`] = payload.han_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/ke_hoach_thanh_toan`] = payload.ke_hoach_thanh_toan
    }

    if (Object.keys(updates).length > 0) {
      await update(dbRef(database), updates)
    }

    r.loai_thanh_toan = payload.loai_thanh_toan
    r.han_thanh_toan = payload.han_thanh_toan
    r.ke_hoach_thanh_toan = payload.ke_hoach_thanh_toan
    m.showScheduleSubModal = false
  } catch (e) {
    console.error('Lỗi lưu kế hoạch thanh toán:', e)
    alert('Lỗi khi lưu mốc hạn thanh toán. Vui lòng thử lại.')
  } finally {
    m.savingSchedule = false
  }
}

function setPaymentQuickPct(pct: number) {
  if (!paymentModal.value.row) return
  const remaining = congNo(paymentModal.value.row)
  const base = remaining > 0 ? remaining : tongSauVat(paymentModal.value.row)
  const val = Math.round(base * (pct / 100))
  paymentModal.value.amount = val
  paymentModal.value.amountStr = val > 0 ? val.toLocaleString('vi-VN') : ''
}

function onPaymentAmountInput(e: Event) {
  const target = e.target as HTMLInputElement
  const raw = target.value.replace(/[^0-9]/g, '')
  const num = raw ? Number(raw) : 0
  paymentModal.value.amount = num
  paymentModal.value.amountStr = num > 0 ? num.toLocaleString('vi-VN') : ''
  target.value = paymentModal.value.amountStr
}

async function submitPayment() {
  const m = paymentModal.value
  if (!m.row || m.saving) return
  const payAmt = toNum(m.amount)
  if (payAmt <= 0) {
    alert('Vui lòng nhập số tiền thanh toán lớn hơn 0!')
    return
  }

  m.saving = true
  try {
    const r = m.row
    const fbKey = r._firebaseKey || r.ID
    const srId = String(r.ID || fbKey)
    const maKH = String(r.Ma_khach_hang || r.Ma_cong_ty || genMaKhachHang(r.Ten_khach_hang || '', r.Ten_cong_ty || ''))
    const payTime = (m.paymentTime || '').trim() || getFormattedNow()

    const totalSau = tongSauVat(r)
    const currentPaid = daThanhToan(r)
    const newPaid = currentPaid + payAmt
    const newCongNo = Math.max(0, totalSau - newPaid)

    const schedulePayload = buildSchedulePayloadForRow(r, newPaid)

    const newHistRef = push(dbRef(database, 'lich_su_thanh_toan'))
    const histKey = newHistRef.key || ('LSTT_' + Date.now())

    const newHistoryItem = {
      id: histKey,
      id_salereport: srId,
      maKH: maKH,
      so_tien_thanh_toan: payAmt,
      cong_no_con_lai: newCongNo,
      thoi_gian_thanh_toan: payTime,
      ghi_chu: (m.note || '').trim()
    }

    const updates: Record<string, any> = {
      [`lich_su_thanh_toan/${histKey}`]: newHistoryItem
    }

    if (fbKey) {
      updates[`sale_report/${fbKey}/so_tien_da_thanh_toan`] = newPaid
      updates[`sale_report/${fbKey}/cong_no`] = newCongNo
      updates[`sale_report/${fbKey}/thoi_gian_thanh_toan`] = payTime
      updates[`sale_report/${fbKey}/loai_thanh_toan`] = schedulePayload.loai_thanh_toan
      updates[`sale_report/${fbKey}/han_thanh_toan`] = schedulePayload.han_thanh_toan
      updates[`sale_report/${fbKey}/ke_hoach_thanh_toan`] = schedulePayload.ke_hoach_thanh_toan
      if (!r.Tong_tien_sau_thueVAT) {
        updates[`sale_report/${fbKey}/Tong_tien_sau_thueVAT`] = totalSau
      }
    }

    if (r.ma_hop_dong) {
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/da_thanh_toan`] = newPaid
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/con_phai_thu`] = newCongNo
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/trang_thai_thanh_toan`] = newCongNo <= 0 ? 'Đã thanh toán đủ' : 'Thanh toán 1 phần'
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/loai_thanh_toan`] = schedulePayload.loai_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/han_thanh_toan`] = schedulePayload.han_thanh_toan
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/ke_hoach_thanh_toan`] = schedulePayload.ke_hoach_thanh_toan
    }

    await update(dbRef(database), updates)

    // Cập nhật state tại chỗ
    r.so_tien_da_thanh_toan = newPaid
    r.cong_no = newCongNo
    r.thoi_gian_thanh_toan = payTime
    r.loai_thanh_toan = schedulePayload.loai_thanh_toan
    r.han_thanh_toan = schedulePayload.han_thanh_toan
    r.ke_hoach_thanh_toan = schedulePayload.ke_hoach_thanh_toan
    if (!r.Tong_tien_sau_thueVAT) r.Tong_tien_sau_thueVAT = totalSau

    lichSuThanhToanList.value.unshift({
      ...newHistoryItem,
      _firebaseKey: histKey
    })

    // Đồng bộ cong_no vào schema khach_hang
    await syncAllCustomersCongNo()

    // Gợi ý số tiền đợt tiếp theo sau khi đã thu đợt hiện tại
    const nextEval = evaluateInstallmentSchedule(totalSau, newPaid, m.scheduleMode, m.singleDueDate, m.scheduleItems)
    const nextUnpaid = nextEval.find(x => x.con_thieu > 0)
    const nextPayAmt = m.scheduleMode === 'nhieu_dot' && nextUnpaid ? nextUnpaid.con_thieu : (newCongNo > 0 ? newCongNo : 0)

    m.amount = nextPayAmt
    m.amountStr = nextPayAmt > 0 ? nextPayAmt.toLocaleString('vi-VN') : ''
    m.paymentTime = getFormattedNow()
    m.note = m.scheduleMode === 'nhieu_dot' && nextUnpaid ? `Thanh toán Đợt ${nextUnpaid.dot} (${nextUnpaid.noi_dung})` : ''
    m.showRecordSubModal = false
  } catch (e) {
    console.error('Lỗi ghi nhận thanh toán:', e)
    alert('Lỗi khi lưu thanh toán. Vui lòng thử lại.')
  } finally {
    m.saving = false
  }
}

async function deletePaymentHistoryItem(h: any) {
  if (!h || !paymentModal.value.row) return
  if (!confirm(`Bạn có chắc muốn xóa đợt thanh toán ${fmt(toNum(h.so_tien_thanh_toan))} đ (${h.thoi_gian_thanh_toan || ''}) và tính lại công nợ?`)) return

  try {
    const r = paymentModal.value.row
    const fbKey = r._firebaseKey || r.ID
    const histFbKey = h._firebaseKey || h.id
    if (histFbKey) {
      await remove(dbRef(database, `lich_su_thanh_toan/${histFbKey}`))
    }

    lichSuThanhToanList.value = lichSuThanhToanList.value.filter(item => (item._firebaseKey || item.id) !== histFbKey)

    const remainingHistory = getPaymentHistoryForPO(r)
    const newPaid = remainingHistory.reduce((s, item) => s + toNum(item.so_tien_thanh_toan), 0)
    const totalSau = tongSauVat(r)
    const newCongNo = Math.max(0, totalSau - newPaid)
    const latestTime = remainingHistory.length > 0 ? (remainingHistory[0].thoi_gian_thanh_toan || '') : ''
    const schedulePayload = buildSchedulePayloadForRow(r, newPaid)

    const updates: Record<string, any> = {}
    if (fbKey) {
      updates[`sale_report/${fbKey}/so_tien_da_thanh_toan`] = newPaid
      updates[`sale_report/${fbKey}/cong_no`] = newCongNo
      updates[`sale_report/${fbKey}/thoi_gian_thanh_toan`] = latestTime
      updates[`sale_report/${fbKey}/han_thanh_toan`] = schedulePayload.han_thanh_toan
    }
    if (r.ma_hop_dong) {
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/da_thanh_toan`] = newPaid
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/con_phai_thu`] = newCongNo
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/trang_thai_thanh_toan`] = newCongNo <= 0 ? 'Đã thanh toán đủ' : (newPaid > 0 ? 'Thanh toán 1 phần' : 'Chưa thanh toán đủ')
      updates[`hop_dong_tong_quat/${r.ma_hop_dong}/han_thanh_toan`] = schedulePayload.han_thanh_toan
    }
    if (Object.keys(updates).length > 0) {
      await update(dbRef(database), updates)
    }

    r.so_tien_da_thanh_toan = newPaid
    r.cong_no = newCongNo
    r.thoi_gian_thanh_toan = latestTime
    r.han_thanh_toan = schedulePayload.han_thanh_toan

    await syncAllCustomersCongNo()

    paymentModal.value.amount = newCongNo > 0 ? newCongNo : 0
    paymentModal.value.amountStr = newCongNo > 0 ? newCongNo.toLocaleString('vi-VN') : ''
  } catch (e) {
    console.error('Lỗi xóa lịch sử thanh toán:', e)
    alert('Lỗi khi xóa đợt thanh toán.')
  }
}

const giaMua = (r: any) => toNum(r.Tong_thanh_tien_chua_VAT_mua_hang)
const tongCP = (r: any) => toNum(r.Tong_CP_don_hang)
const grossCom = (r: any) => toNum(r.chiet_khau_tong_truoc_thue)

const thuePct = (r: any) => {
  const val = Number(r.phan_tram_thue_chenh_lech_gia)
  if (!isNaN(val) && val > 0) return val
  return 25 // Default fallback to 25% if empty
}
const thue = (r: any) => grossCom(r) * (thuePct(r) / 100)

const netCom = (r: any) => toNum(r.con_lai)
const netPO = (r: any) => doanhSoBan(r) - grossCom(r)
const netMargin = (r: any) => doanhSoBan(r) - grossCom(r) - tongCP(r)
const netMarginPct = (r: any) => {
  const np = netPO(r)
  return np !== 0 ? (netMargin(r) / np) * 100 : 0
}
const netComPct = (r: any) => {
  const np = netPO(r)
  return np !== 0 ? (netCom(r) / np) * 100 : 0
}
const netComDsbPct = (r: any) => {
  const dsb = doanhSoBan(r)
  return dsb !== 0 ? (netCom(r) / dsb) * 100 : 0
}
const netMarginDsbPct = (r: any) => {
  const dsb = doanhSoBan(r)
  return dsb !== 0 ? (netMargin(r) / dsb) * 100 : 0
}

// ─── Totals ───
const sumCol = (fn: string) => {
  const fns: Record<string, (r: any) => number> = {
    doanhSoBan, tongSauVat, daThanhToan, congNo, giaMua, tongCP, grossCom, thue, netCom, netPO, netMargin
  }
  return filteredRows.value.reduce((s, r) => s + (fns[fn]?.(r) || 0), 0)
}

const totalNetMarginPct = computed(() => {
  const np = sumCol('netPO')
  return np !== 0 ? (sumCol('netMargin') / np) * 100 : 0
})

const totalNetComPct = computed(() => {
  const np = sumCol('netPO')
  return np !== 0 ? (sumCol('netCom') / np) * 100 : 0
})

const totalNetComDsbPct = computed(() => {
  const dsb = sumCol('doanhSoBan')
  return dsb !== 0 ? (sumCol('netCom') / dsb) * 100 : 0
})

const totalNetMarginDsbPct = computed(() => {
  const dsb = sumCol('doanhSoBan')
  return dsb !== 0 ? (sumCol('netMargin') / dsb) * 100 : 0
})

const getTopCustomerData = (metric: string) => {
  const fns: Record<string, (r: any) => number> = {
    doanhSoBan, tongSauVat, daThanhToan, congNo, giaMua, tongCP, grossCom, thue, netCom, netPO, netMargin
  }
  const fn = fns[metric]
  if (!fn) return null

  const map = new Map<string, number>()
  filteredRows.value.forEach(r => {
    const name = r.Ten_cong_ty ? String(r.Ten_cong_ty).trim() : 'N/A'
    if (name !== 'N/A') {
      const val = fn(r)
      map.set(name, (map.get(name) || 0) + val)
    }
  })
  
  if (map.size === 0) return null
  let maxName = ''
  let maxVal = -Infinity
  for (const [name, val] of map.entries()) {
    if (val > maxVal) {
      maxVal = val
      maxName = name
    }
  }
  return { name: maxName, value: maxVal }
}

// ─── Trend / Previous Period Logic ───
const isPrevPeriod = computed(() => {
  return (d: Date) => {
    if (timeFilterMode.value === 'day') {
      if (!dateFrom.value && !dateTo.value) return false
      const dfStr = dateFrom.value || dateTo.value
      const dtStr = dateTo.value || dateFrom.value
      if (!dfStr || !dtStr) return false
      
      const df = new Date(dfStr)
      const dt = new Date(dtStr)
      df.setHours(0,0,0,0)
      dt.setHours(23,59,59,999)
      const durationMs = dt.getTime() - df.getTime() + 1
      
      const prevEnd = new Date(df.getTime() - 1)
      const prevStart = new Date(prevEnd.getTime() - durationMs + 1)
      return d >= prevStart && d <= prevEnd
    }
    else if (timeFilterMode.value === 'month') {
      if (!monthFrom.value && !monthTo.value) return false
      const mfStr = monthFrom.value || monthTo.value
      const mtStr = monthTo.value || monthFrom.value
      if (!mfStr || !mtStr) return false
      
      const mf = new Date(mfStr + '-01T00:00:00')
      const mt = new Date(mtStr + '-01T00:00:00')
      const durMonths = (mt.getFullYear() - mf.getFullYear()) * 12 + mt.getMonth() - mf.getMonth() + 1
      
      const prevMt = new Date(mf)
      prevMt.setMonth(prevMt.getMonth() - 1)
      const prevMf = new Date(prevMt)
      prevMf.setMonth(prevMf.getMonth() - durMonths + 1)
      
      const p = (n: number) => String(n).padStart(2,'0')
      const prevStartStr = `${prevMf.getFullYear()}-${p(prevMf.getMonth()+1)}`
      const prevEndStr = `${prevMt.getFullYear()}-${p(prevMt.getMonth()+1)}`
      const rowMonthStr = `${d.getFullYear()}-${p(d.getMonth()+1)}`
      return rowMonthStr >= prevStartStr && rowMonthStr <= prevEndStr
    }
    else if (timeFilterMode.value === 'year') {
      if (!yearFrom.value && !yearTo.value) return false
      const yf = parseInt(String(yearFrom.value || yearTo.value))
      const yt = parseInt(String(yearTo.value || yearFrom.value))
      if (isNaN(yf) || isNaN(yt)) return false
      
      const dur = yt - yf + 1
      const prevYt = yf - 1
      const prevYf = prevYt - dur + 1
      const y = d.getFullYear()
      return y >= prevYf && y <= prevYt
    }
    return false
  }
})

const prevFilteredRows = computed(() => {
  let list = rows.value
  if (searchStr.value) {
    const q = searchStr.value.toLowerCase()
    list = list.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)))
  }
  
  list = list.filter(r => {
    if (!r.created_time) return false
    const d = parseDateStr(r.created_time)
    if (!d) return false
    return isPrevPeriod.value(d)
  })

  if (filterAM.value) {
    list = list.filter(r => r.account_manager_name === filterAM.value)
  }

  if (filterProductType.value !== 'Tất cả') {
    const targetLower = filterProductType.value.toLowerCase()
    list = list.filter(r => r.Ten_nha_cung_cap && String(r.Ten_nha_cung_cap).toLowerCase().trim() === targetLower)
  }
  return list
})

const sumColPrev = (fn: string) => {
  const fns: Record<string, (r: any) => number> = {
    doanhSoBan, tongSauVat, daThanhToan, congNo, giaMua, tongCP, grossCom, thue, netCom, netPO, netMargin
  }
  return prevFilteredRows.value.reduce((s, r) => s + (fns[fn]?.(r) || 0), 0)
}

const prevTotalNetComPct = computed(() => {
  const np = sumColPrev('netPO')
  return np !== 0 ? (sumColPrev('netCom') / np) * 100 : 0
})
const prevTotalNetMarginPct = computed(() => {
  const np = sumColPrev('netPO')
  return np !== 0 ? (sumColPrev('netMargin') / np) * 100 : 0
})
const prevTotalNetComDsbPct = computed(() => {
  const dsb = sumColPrev('doanhSoBan')
  return dsb !== 0 ? (sumColPrev('netCom') / dsb) * 100 : 0
})
const prevTotalNetMarginDsbPct = computed(() => {
  const dsb = sumColPrev('doanhSoBan')
  return dsb !== 0 ? (sumColPrev('netMargin') / dsb) * 100 : 0
})

const getTrendData = (curr: number, prev: number, isRatio = false) => {
  if (prev === 0 && curr === 0) return null;
  let diff = 0;
  let pct = 0;
  
  if (isRatio) {
    diff = curr - prev;
    pct = diff; // For ratios, difference in percentage points
  } else {
    diff = curr - prev;
    if (prev === 0) {
      pct = curr > 0 ? 100 : (curr < 0 ? -100 : 0);
    } else {
      pct = (diff / Math.abs(prev)) * 100;
    }
  }
  
  const isUp = pct > 0;
  const isDown = pct < 0;
  const state = isUp ? 'up' : (isDown ? 'down' : 'neutral');
  const text = (isUp ? '+' : '') + pct.toFixed(1) + (isRatio ? ' đ.t.p' : '%');
  
  return { state, text, isUp, isDown };
}

// ─── Formatting ───
const fmt = (v: number) => {
  if (v === 0) return '0'
  return Math.round(v).toLocaleString('vi-VN')
}

const pctFmt = (v: number) => {
  if (v === 0) return '0%'
  return v.toFixed(2) + '%'
}

// ─── Chart Modal ───

const currentTimeLabel = computed(() => {
  const formatYMD = (s) => {
    if (!s) return '';
    const parts = s.split('-');
    if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
    return s;
  };
  const formatYM = (s) => {
    if (!s) return '';
    const parts = s.split('-');
    if (parts.length === 2) return parts[1] + '/' + parts[0];
    return s;
  };

  if (timeFilterMode.value === 'all') return 'Tất cả thời gian';
  if (timeFilterMode.value === 'day') {
    if (dateFrom.value && dateTo.value) {
      if (dateFrom.value === dateTo.value) return `Ngày ${formatYMD(dateFrom.value)}`;
      return `${formatYMD(dateFrom.value)} đến ${formatYMD(dateTo.value)}`;
    }
    if (dateFrom.value) return `Từ ngày ${formatYMD(dateFrom.value)}`;
    if (dateTo.value) return `Đến ngày ${formatYMD(dateTo.value)}`;
    return 'Ngày (Chưa chọn)';
  }
  if (timeFilterMode.value === 'month') {
    if (monthFrom.value && monthTo.value) {
      if (monthFrom.value === monthTo.value) return `Tháng ${formatYM(monthFrom.value)}`;
      return `${formatYM(monthFrom.value)} đến ${formatYM(monthTo.value)}`;
    }
    if (monthFrom.value) return `Từ tháng ${formatYM(monthFrom.value)}`;
    if (monthTo.value) return `Đến tháng ${formatYM(monthTo.value)}`;
    return 'Tháng (Chưa chọn)';
  }
  if (timeFilterMode.value === 'year') {
    if (yearFrom.value && yearTo.value) {
      if (yearFrom.value === yearTo.value) return `Năm ${yearFrom.value}`;
      return `${yearFrom.value} đến ${yearTo.value}`;
    }
    if (yearFrom.value) return `Từ năm ${yearFrom.value}`;
    if (yearTo.value) return `Đến năm ${yearTo.value}`;
    return 'Năm (Chưa chọn)';
  }
  return '';
});

const isSwitchingTab = ref(false);
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth <= 1000 : false);
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => { isMobile.value = window.innerWidth <= 1000; });
}
const chartModal = ref({
  show: false,
  metric: '',
  isRatio: false
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(51, 65, 85, 0.5)' },
        ticks: { 
          color: '#94a3b8', 
          callback: (value: any) => chartModal.value.isRatio ? pctFmt(value) : fmt(value) 
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    },
    plugins: {
      legend: { labels: { color: '#cbd5e1' } },
      tooltip: {
        callbacks: {
          label: (context: any) => context.dataset.label + ': ' + (chartModal.value.isRatio ? pctFmt(context.raw) : fmt(context.raw))
        }
      },
      datalabels: {
        display: false // Disable by default, enable specifically on the bar dataset
      }
    }
  }
})

const chartData = computed(() => {
  if (!chartModal.value.metric) return { labels: [], datasets: [] };
  
  const metric = chartModal.value.metric;
  
  // Group by date
  const grouped = new Map<string, { sum: number, np: number, dsb: number }>();
  
  // Sort rows by date first to ensure chart is chronological
  const sorted = [...filteredRows.value].sort((a, b) => {
     const da = parseDateStr(a.created_time)?.getTime() || 0;
     const db = parseDateStr(b.created_time)?.getTime() || 0;
     return da - db;
  });

  sorted.forEach(r => {
     const dObj = parseDateStr(r.created_time);
     let date = 'N/A';
     if (dObj) {
       if (timeFilterMode.value === 'day') {
         date = `${dObj.getDate().toString().padStart(2, '0')}/${(dObj.getMonth()+1).toString().padStart(2, '0')}/${dObj.getFullYear()}`;
       } else if (timeFilterMode.value === 'month') {
         date = `${(dObj.getMonth()+1).toString().padStart(2, '0')}/${dObj.getFullYear()}`;
       } else if (timeFilterMode.value === 'year') {
         date = `${dObj.getFullYear()}`;
       }
     }
     
     const gross = grossCom(r) || 0;
     const cp = tongCP(r) || 0;
     const d = doanhSoBan(r) || 0;
     const tsv = tongSauVat(r) || 0;
     const dtt = daThanhToan(r) || 0;
     const cn = congNo(r) || 0;
     const nc = netCom(r) || 0;
     const np = netPO(r) || 0;
     const nm = netMargin(r) || 0;
     
     if (!grouped.has(date)) grouped.set(date, { sum: 0, np: 0, dsb: 0 });
     const g = grouped.get(date)!;
     
     switch (metric) {
       case 'doanhSoBan': g.sum += d; break;
       case 'tongSauVat': g.sum += tsv; break;
       case 'daThanhToan': g.sum += dtt; break;
       case 'congNo': g.sum += cn; break;
       case 'grossCom': g.sum += gross; break;
       case 'netCom': g.sum += nc; break;
       case 'netPO': g.sum += np; break;
       case 'netMargin': g.sum += nm; break;
       case 'totalNetComPct':
         g.sum += nc; g.np += np; break;
       case 'totalNetMarginPct':
         g.sum += nm; g.np += np; break;
       case 'totalNetComDsbPct':
         g.sum += nc; g.dsb += d; break;
       case 'totalNetMarginDsbPct':
         g.sum += nm; g.dsb += d; break;
     }
  });
  
  const labels = Array.from(grouped.keys());
  const data = Array.from(grouped.values()).map(g => {
    if (metric === 'totalNetComPct' || metric === 'totalNetMarginPct') {
      return g.np !== 0 ? (g.sum / g.np) * 100 : 0;
    }
    if (metric === 'totalNetComDsbPct' || metric === 'totalNetMarginDsbPct') {
      return g.dsb !== 0 ? (g.sum / g.dsb) * 100 : 0;
    }
    return g.sum;
  });
  
  const labelMap: Record<string, string> = {
    'doanhSoBan': 'Doanh số bán',
    'tongSauVat': 'Tổng tiền sau VAT',
    'daThanhToan': 'Khách đã thanh toán',
    'congNo': 'Công nợ còn lại',
    'grossCom': 'Gross COM',
    'netCom': 'Net COM',
    'netPO': 'Net PO',
    'netMargin': 'Net Margin',
    'totalNetComPct': 'Net COM / Net PO',
    'totalNetMarginPct': 'Net Margin / Net PO',
    'totalNetComDsbPct': 'Net COM / DSB',
    'totalNetMarginDsbPct': 'Net Margin / DSB',
  };
  
  return {
    labels,
    datasets: [
      {
        type: 'line',
        label: 'Đường xu hướng',
        data: data,
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        yAxisID: 'y'
      },
      {
        type: 'bar',
        label: labelMap[metric] || metric,
        data: data,
        backgroundColor: (ctx: any) => ctx.raw < 0 ? '#ef4444' : '#2563eb', // Đỏ nếu âm, Xanh dương nếu dương
        borderRadius: 4,
        yAxisID: 'y',
        datalabels: {
          display: true,
          color: '#ffffff',
          anchor: 'center',
          align: 'center',
          formatter: (value: any) => {
            if (!value || value === 0) return '';
            return metric === 'totalNetComPct' || metric === 'totalNetMarginPct' || metric === 'totalNetComDsbPct' || metric === 'totalNetMarginDsbPct' ? pctFmt(value) : fmt(value);
          },
          font: { weight: 'bold', size: 11 },
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    ]
  };
})

function openChart(metric: string, isRatio = false) {
  chartModal.value = { show: true, metric, isRatio }
}

// ─── Top Customer Modal ───
const topCustomerLimit = ref(5);
const topCustomerModal = ref({
  show: false,
  metric: '',
  metricLabel: ''
});

const labelMap: Record<string, string> = {
  'doanhSoBan': 'Doanh số bán',
  'tongSauVat': 'Tổng tiền sau VAT',
  'daThanhToan': 'Khách đã thanh toán',
  'congNo': 'Công nợ còn lại',
  'grossCom': 'Gross COM',
  'netCom': 'Net COM',
  'netPO': 'Net PO',
  'netMargin': 'Net Margin',
  'totalNetComPct': 'Net Com / Net PO',
  'totalNetMarginPct': 'Net Margin / Net PO',
  'totalNetComDsbPct': 'Net Com / DSB',
  'totalNetMarginDsbPct': 'Net Margin / DSB'
};

const topCustomerPieOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  onClick: (e: any, activeEls: any[]) => {
    if (activeEls.length > 0) {
      const index = activeEls[0].index;
      const clickedLabel = topCustomerPieData.value.labels[index];
      if (clickedLabel && clickedLabel !== 'Khác') {
        filterCustomer.value = topCustomerRawData.value.sorted[index][0].split(' / ')[0];
        topCustomerModal.value.show = false;
      }
    }
  },
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: '#cbd5e1', font: { size: 11 } } },
    tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw / topCustomerRawData.value.total) * 100).toFixed(1)}%)` } },
    datalabels: {
      color: '#fff',
      formatter: (val: number, ctx: any) => {
        const pct = (val / topCustomerRawData.value.total) * 100;
        return pct > 5 ? `${pct.toFixed(0)}%` : '';
      },
      font: { weight: 'bold', size: 11 },
      textShadowBlur: 4,
      textShadowColor: 'rgba(0,0,0,0.8)'
    }
  }
}));

const topCustomerBarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  onClick: (e: any, activeEls: any[]) => {
    if (activeEls.length > 0) {
      const index = activeEls[0].index;
      const clickedLabel = topCustomerRawData.value.sorted[index][0];
      if (clickedLabel && clickedLabel !== 'Khác') {
        filterCustomer.value = clickedLabel.split(' / ')[0];
        topCustomerModal.value.show = false;
      }
    }
  },
  layout: { padding: { top: 30, bottom: 20 } },
  scales: {
    y: { grid: { color: 'rgba(51, 65, 85, 0.5)' }, ticks: { color: '#94a3b8', callback: (v: any) => fmt(v) } },
    x: { grid: { display: false }, ticks: { color: '#e2e8f0', minRotation: 0, maxRotation: 0, autoSkip: false, font: { size: 11 }, callback: function(val) { let label = this.getLabelForValue(val); if (isMobile.value && label && label.length > 10) return label.substring(0, 10) + '...'; return label; } } }
  },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: any) => topCustomerModal.value.metric.includes('Pct') ? pctFmt(ctx.raw) : fmt(ctx.raw) } },
    datalabels: {
      labels: {
        value: {
          color: '#fff',
          anchor: 'end',
          align: 'top', offset: 20,
          font: { weight: 'bold', size: isMobile.value ? 9 : 11 },
          formatter: (val: number) => {
            if (topCustomerModal.value.metric.includes('Pct')) return pctFmt(val);
            if (isMobile.value) {
              if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + ' Tỷ';
              if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + ' Tr';
            }
            return fmt(val);
          },
          
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.5)'
        },
        percent: {
          color: '#22c55e',
          anchor: 'end',
          align: 'top',
          offset: 4,
          font: { weight: 'bold', size: isMobile.value ? 9 : 11 },
          formatter: (val: number) => {
            if (topCustomerModal.value.metric.includes('Pct')) return '';
            const total = topCustomerRawData.value.total;
            if (!total) return '';
            const pct = (val / total) * 100;
            return `${pct.toFixed(1)}%`;
          },
          
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }
  }
}));

const topCustomerRawData = computed(() => {
    const metric = topCustomerModal.value.metric;
    if (!metric) return { sorted: [], total: 0 };
    
    const map = new Map<string, { num: number; den: number; names: Set<string> }>();
    let total = 0;
    
    filteredRows.value.forEach(r => {
      const tenCty = r.Ten_cong_ty ? String(r.Ten_cong_ty).trim() : '';
      const maKH = r.Ma_khach_hang ? String(r.Ma_khach_hang).trim() : '';
      const maCT = r.Ma_cong_ty ? String(r.Ma_cong_ty).trim() : '';
      
      const key = (maKH || maCT) ? `${maKH}_${maCT}` : (tenCty || 'Khác');
      
      let num = 0, den = 0;
      if (metric === 'doanhSoBan') { num = doanhSoBan(r); den = 1 }
      else if (metric === 'tongSauVat') { num = tongSauVat(r); den = 1 }
      else if (metric === 'daThanhToan') { num = daThanhToan(r); den = 1 }
      else if (metric === 'congNo') { num = congNo(r); den = 1 }
      else if (metric === 'grossCom') { num = grossCom(r); den = 1 }
      else if (metric === 'netCom') { num = netCom(r); den = 1 }
      else if (metric === 'netPO') { num = netPO(r); den = 1 }
      else if (metric === 'netMargin') { num = netMargin(r); den = 1 }
      else if (metric === 'totalNetComPct') { num = netCom(r); den = netPO(r) }
      else if (metric === 'totalNetMarginPct') { num = netMargin(r); den = netPO(r) }
      else if (metric === 'totalNetComDsbPct') { num = netCom(r); den = doanhSoBan(r) }
      else if (metric === 'totalNetMarginDsbPct') { num = netMargin(r); den = doanhSoBan(r) }
      
      if (!map.has(key)) map.set(key, { num: 0, den: 0, names: new Set() });
      const val = map.get(key)!;
      val.num += num;
      val.den += den;
      if (tenCty) val.names.add(tenCty);
    });
    
    const entries: [string, number][] = [];
    for (const val of map.values()) {
      let finalVal = 0;
      if (metric.includes('Pct')) {
        finalVal = val.den !== 0 ? (val.num / val.den) * 100 : 0;
      } else {
        finalVal = val.num;
        total += finalVal;
      }
      
      const displayName = val.names.size > 0 ? Array.from(val.names).join(' / ') : 'Khác';
      entries.push([displayName, finalVal]);
    }
    
    const finalMap = new Map<string, number>();
    for (const [name, val] of entries) {
      finalMap.set(name, (finalMap.get(name) || 0) + val);
    }
    
    const mergedEntries: [string, number][] = Array.from(finalMap.entries());
    const sorted = mergedEntries.sort((a, b) => b[1] - a[1]);
    
    return { sorted, total };
  });

const wrapText = (text: string, maxLen: number = 20) => {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length <= maxLen) {
      line = (line + ' ' + word).trim();
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const topCustomerPieData = computed(() => {
  const data = topCustomerRawData.value.sorted;
  const limit = Number(topCustomerLimit.value) || 5;
  const topN = data.slice(0, limit);
  const others = data.slice(limit).reduce((sum, item) => sum + item[1], 0);
  
  const labels = topN.map(d => {
    let text = d[0];
    if (isMobile.value && text.length > 15) return text.substring(0, 15) + '...';
    if (!isMobile.value && text.length > 25) return text.substring(0, 25) + '...';
    return text;
  });
  const values = topN.map(d => d[1]);
  
  if (others > 0) {
    labels.push('Khác');
    values.push(others);
  }
  
  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'],
      borderWidth: 1,
      borderColor: '#0f172a'
    }]
  };
});

const topCustomerBarData = computed(() => {
  const allData = topCustomerRawData.value.sorted;
  const limit = Number(topCustomerLimit.value) || 5;
  
  return {
    labels: allData.slice(0, limit).map(d => wrapText(d[0], 20)),
    datasets: [{
      data: allData.slice(0, limit).map(d => d[1]),
      backgroundColor: (ctx: any) => ctx.raw < 0 ? '#ef4444' : '#38bdf8',
      borderRadius: 4,
      maxBarThickness: 60,
    }]
  };
});

function openTopCustomerModal(metric: string) {
  topCustomerModal.value = {
    show: true,
    metric,
    metricLabel: labelMap[metric] || metric
  };
}

  // --- Top Product Modal ---
  const topProductLimit = ref(5);
  const topProductModal = ref({
    show: false,
    metric: '',
    metricLabel: ''
  });

  const topProductPieOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    onClick: (e: any, activeEls: any[]) => {
      if (activeEls.length > 0) {
        const index = activeEls[0].index;
        const clickedLabel = topProductPieData.value.labels[index];
        if (clickedLabel && clickedLabel !== 'Khác') {
          filterProductType.value = topProductRawData.value.sorted[index][0];
          topProductModal.value.show = false;
        }
      }
    },
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#cbd5e1', font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw / topProductRawData.value.total) * 100).toFixed(1)}%)` } },
      datalabels: {
        color: '#fff',
        formatter: (val: number, ctx: any) => {
          const pct = (val / topProductRawData.value.total) * 100;
          return pct > 5 ? `${pct.toFixed(0)}%` : '';
        },
        font: { weight: 'bold', size: 11 },
        textShadowBlur: 4,
        textShadowColor: 'rgba(0,0,0,0.8)'
      }
    }
  }));

  const topProductBarOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    onClick: (e: any, activeEls: any[]) => {
      if (activeEls.length > 0) {
        const index = activeEls[0].index;
        const clickedLabel = topProductRawData.value.sorted[index][0];
        if (clickedLabel && clickedLabel !== 'Khác') {
          filterProductType.value = clickedLabel;
          topProductModal.value.show = false;
        }
      }
    },
    layout: { padding: { top: 30, bottom: 20 } },
    scales: {
      y: { grid: { color: 'rgba(51, 65, 85, 0.5)' }, ticks: { color: '#94a3b8', callback: (v: any) => fmt(v) } },
      x: { grid: { display: false }, ticks: { color: '#e2e8f0', minRotation: 0, maxRotation: 0, autoSkip: false, font: { size: 11 }, callback: function(val) { let label = this.getLabelForValue(val); if (isMobile.value && label && label.length > 10) return label.substring(0, 10) + '...'; return label; } } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => topProductModal.value.metric.includes('Pct') ? pctFmt(ctx.raw) : fmt(ctx.raw) } },
      datalabels: {
      labels: {
        value: {
          color: '#fff',
          anchor: 'end',
          align: 'top', offset: 20,
          font: { weight: 'bold', size: isMobile.value ? 9 : 11 },
          formatter: (val: number) => {
            if (topProductModal.value.metric.includes('Pct')) return pctFmt(val);
            if (isMobile.value) {
              if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + ' Tỷ';
              if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + ' Tr';
            }
            return fmt(val);
          },
          
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.5)'
        },
        percent: {
          color: '#22c55e',
          anchor: 'end',
          align: 'top',
          offset: 4,
          font: { weight: 'bold', size: isMobile.value ? 9 : 11 },
          formatter: (val: number) => {
            if (topProductModal.value.metric.includes('Pct')) return '';
            const total = topProductRawData.value.total;
            if (!total) return '';
            const pct = (val / total) * 100;
            return `${pct.toFixed(1)}%`;
          },
          
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }
    }
  }));

  const topProductRawData = computed(() => {
    const metric = topProductModal.value.metric;
    if (!metric) return { sorted: [], total: 0 };
    
    const map = new Map<string, { num: number; den: number; original: string }>();
    let total = 0;
    
    filteredRows.value.forEach(r => {
      const tenCty = r.Ten_nha_cung_cap ? String(r.Ten_nha_cung_cap).trim() : 'Khác';
      const key = tenCty.toLowerCase();
      
      let num = 0, den = 0;
      if (metric === 'doanhSoBan') { num = doanhSoBan(r); den = 1 }
      else if (metric === 'tongSauVat') { num = tongSauVat(r); den = 1 }
      else if (metric === 'daThanhToan') { num = daThanhToan(r); den = 1 }
      else if (metric === 'congNo') { num = congNo(r); den = 1 }
      else if (metric === 'grossCom') { num = grossCom(r); den = 1 }
      else if (metric === 'netCom') { num = netCom(r); den = 1 }
      else if (metric === 'netPO') { num = netPO(r); den = 1 }
      else if (metric === 'netMargin') { num = netMargin(r); den = 1 }
      else if (metric === 'totalNetComPct') { num = netCom(r); den = netPO(r) }
      else if (metric === 'totalNetMarginPct') { num = netMargin(r); den = netPO(r) }
      else if (metric === 'totalNetComDsbPct') { num = netCom(r); den = doanhSoBan(r) }
      else if (metric === 'totalNetMarginDsbPct') { num = netMargin(r); den = doanhSoBan(r) }
      
      if (!map.has(key)) map.set(key, { num: 0, den: 0, original: tenCty });
      const val = map.get(key)!;
      val.num += num;
      val.den += den;
    });
    
    const entries: [string, number][] = [];
    for (const val of map.values()) {
      let finalVal = 0;
      if (metric.includes('Pct')) {
        finalVal = val.den !== 0 ? (val.num / val.den) * 100 : 0;
      } else {
        finalVal = val.num;
        total += finalVal;
      }
      entries.push([val.original, finalVal]);
    }
    
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return { sorted, total };
  });

  const topProductPieData = computed(() => {
    const data = topProductRawData.value.sorted;
    const limit = Number(topProductLimit.value) || 5;
    const topN = data.slice(0, limit);
    const others = data.slice(limit).reduce((sum, item) => sum + item[1], 0);
    
    const labels = topN.map(d => {
    let text = d[0];
    if (isMobile.value && text.length > 15) return text.substring(0, 15) + '...';
    if (!isMobile.value && text.length > 25) return text.substring(0, 25) + '...';
    return text;
  });
    const values = topN.map(d => d[1]);
    
    if (others > 0) {
      labels.push('Khác');
      values.push(others);
    }
    
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#d946ef', '#0ea5e9', '#a855f7', '#eab308', '#f43f5e', '#06b6d4', '#64748b'],
        borderWidth: 1,
        borderColor: '#1e293b'
      }]
    };
  });

  const topProductBarData = computed(() => {
    const allData = topProductRawData.value.sorted;
    const limit = Number(topProductLimit.value) || 5;
    
    return {
      labels: allData.slice(0, limit).map(d => wrapText(d[0], 20)),
      datasets: [{
        data: allData.slice(0, limit).map(d => d[1]),
        backgroundColor: (ctx: any) => ctx.raw < 0 ? '#ef4444' : '#10b981',
        borderRadius: 4,
        maxBarThickness: 60,
      }]
    };
  });

  function openTopProductModal(metric: string) {
    topProductModal.value = {
      show: true,
      metric,
      metricLabel: labelMap[metric] || metric
    };
  }


// ─── Modal edit ───
interface ImportItem {
  id: number;
  row: any;
  doanhSoBan: number;
  giaMua: number;
  tongCP: number;
  grossCom: number;
  soPO: string;
  productType: string;
  customer: string;
  recipient?: string;
  mst: string;
  linkedMaKH?: string;
  linkedMaCongTy?: string;
  extractedCompany?: string;
  extractedRecipient?: string;
  extractedMST?: string;
  _approvedDbNameUpdate?: boolean;
  customerPickerOpen?: boolean;
  customerSearchQuery?: string;
  createdTime: string;
  content: string;
  netCom: number;
  am: string;
  taxPct: number;
  scanning: boolean;
  scanned?: boolean;
  base64Img?: string;
  rawFileBaoGia?: File;
  rawFileMuaHang?: File;
  linkBaoGia?: string;
  linkMuaHang?: string;
  predictPct?: string;
  _origGross?: number;
  _origNet?: number;
  activeTab?: 'po' | 'metrics';
  previewBaoGia?: boolean;
  previewMuaHang?: boolean;
  previewUrlBG?: string;
  previewUrlMH?: string;
  previewHtmlBG?: string;
  previewHtmlMH?: string;
  goodsList?: any[];
  goodsTotal?: any;
  soTienDaThanhToan?: number;
}

const multiEditModal = ref({
  show: false,
  mode: 'update' as 'create' | 'update',
  items: [] as ImportItem[],
  isReportImport: false
})

const isModalDirty = ref(false)

function normalizeCustomerCompareStr(s: any): string {
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

const khachHangList = computed(() => {
  const map = khachHangMap.value || {}
  return Object.entries(map)
    .filter(([, v]) => v && typeof v === 'object')
    .map(([k, v]: [string, any]) => ({
      ...v,
      id: k,
      ma_khach_hang: String(v.ma_khach_hang || v.Ma_khach_hang || k || '').trim(),
      ma_cong_ty: String(v.ma_cong_ty || v.Ma_cong_ty || '').trim(),
      ten_cong_ty: String(v.ten_cong_ty || v.Ten_cong_ty || '').trim(),
      ten_khach_hang: String(v.ten_khach_hang || v.Ten_khach_hang || '').trim(),
      mst: String(v.mst || v.MST || '').trim()
    }))
})

function getMatchedDbCustomerForItem(item: ImportItem | null | undefined): any | null {
  if (!item) return null
  const list = khachHangList.value
  if (!list.length) return null

  // 1. Ưu tiên mã KH đã gắn trên item hoặc từ bản ghi gốc
  const targetMaKH = String(item.linkedMaKH || item.row?.Ma_khach_hang || '').trim()
  if (targetMaKH) {
    const byMaKH = list.find(c => c.ma_khach_hang === targetMaKH)
    if (byMaKH) return byMaKH
  }

  // 2. Tra cứu theo MST
  const mstClean = String(item.mst || '').replace(/[^0-9A-Za-z-]/g, '').trim()
  if (mstClean && mstClean.length >= 8) {
    const byMst = list.find(c => String(c.mst || '').replace(/[^0-9A-Za-z-]/g, '').trim() === mstClean)
    if (byMst) return byMst
  }

  // 3. Tra cứu theo Mã KH / Mã công ty sinh tự động hoặc tên chính xác
  const comp = String(item.customer || '').trim()
  const rec = String(item.recipient || '').trim()
  const genKH = genMaKhachHang(rec, comp)
  const genCT = genMaCongTy(comp || rec)

  if (genKH) {
    const byGenKH = list.find(c => c.ma_khach_hang === genKH)
    if (byGenKH) return byGenKH
  }
  if (genCT) {
    const byGenCT = list.find(c => c.ma_cong_ty === genCT || c.ma_khach_hang === genCT)
    if (byGenCT) return byGenCT
  }
  if (comp) {
    const normComp = normalizeCustomerCompareStr(comp)
    const byName = list.find(c => normalizeCustomerCompareStr(c.ten_cong_ty) === normComp || normalizeCustomerCompareStr(c.ten_khach_hang) === normComp)
    if (byName) return byName
  }
  return null
}

function hasItemCustomerDiffWithQuote(item: ImportItem | null | undefined): boolean {
  if (!item) return false
  const dbCus = getMatchedDbCustomerForItem(item)
  if (!dbCus) return false
  const extComp = String(item.extractedCompany || '').trim()
  const extRec = String(item.extractedRecipient || '').trim()
  if (!extComp && !extRec) return false
  const dbComp = String(dbCus.ten_cong_ty || '').trim()
  const dbRec = String(dbCus.ten_khach_hang || '').trim()
  const compDiff = extComp && dbComp && normalizeCustomerCompareStr(extComp) !== normalizeCustomerCompareStr(dbComp)
  const recDiff = extRec && dbRec && normalizeCustomerCompareStr(extRec) !== normalizeCustomerCompareStr(dbRec)
  return Boolean(compDiff || recDiff)
}

function applyItemCustomerSource(item: ImportItem, source: 'db' | 'quote') {
  if (!item) return
  const dbCus = getMatchedDbCustomerForItem(item)
  if (source === 'db' && dbCus) {
    item.customer = dbCus.ten_cong_ty || dbCus.ten_khach_hang || item.customer || ''
    item.recipient = dbCus.ten_khach_hang || item.recipient || ''
    item.mst = dbCus.mst || item.mst || ''
    item.linkedMaKH = dbCus.ma_khach_hang
    item.linkedMaCongTy = dbCus.ma_cong_ty || genMaCongTy(dbCus.ten_cong_ty || dbCus.ten_khach_hang)
    item._approvedDbNameUpdate = false
    isModalDirty.value = true
  } else if (source === 'quote') {
    if (item.extractedCompany) item.customer = item.extractedCompany
    if (item.extractedRecipient) item.recipient = item.extractedRecipient
    if (item.extractedMST) item.mst = item.extractedMST
    if (dbCus) {
      item.linkedMaKH = dbCus.ma_khach_hang
      item.linkedMaCongTy = dbCus.ma_cong_ty || genMaCongTy(dbCus.ten_cong_ty || dbCus.ten_khach_hang)
    }
    isModalDirty.value = true
  }
}

function toggleItemCustomerPicker(item: ImportItem) {
  if (!item) return
  item.customerPickerOpen = !item.customerPickerOpen
  if (item.customerPickerOpen && item.customerSearchQuery === undefined) {
    item.customerSearchQuery = ''
  }
}

function getFilteredDbCustomersForItem(item: ImportItem) {
  const list = khachHangList.value
  const q = String(item?.customerSearchQuery || '').trim().toLowerCase()
  if (!q) return list.slice(0, 60)
  return list.filter(c => {
    const s = [c.ten_cong_ty, c.ten_khach_hang, c.ma_khach_hang, c.ma_cong_ty, c.mst, c.sdt, c.email]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return s.includes(q)
  }).slice(0, 60)
}

function selectDbCustomerForModalItem(item: ImportItem, cus: any) {
  if (!item || !cus) return
  const newMaKH = String(cus.ma_khach_hang || '').trim()
  const currentMaKH = String(item.linkedMaKH || item.row?.Ma_khach_hang || '').trim()

  if (currentMaKH && currentMaKH !== newMaKH) {
    const ok = confirm(
      `PO này đang gắn với Mã KH "${currentMaKH}".\nBạn có chắc chắn muốn đổi sang khách hàng "${cus.ten_cong_ty || cus.ten_khach_hang}" (Mã KH: ${newMaKH}) không?`
    )
    if (!ok) return
  }

  item.mst = cus.mst || item.mst || ''
  item.customer = cus.ten_cong_ty || cus.ten_khach_hang || ''
  item.recipient = cus.ten_khach_hang || ''
  item.linkedMaKH = newMaKH
  item.linkedMaCongTy = cus.ma_cong_ty || genMaCongTy(cus.ten_cong_ty || cus.ten_khach_hang)
  item._approvedDbNameUpdate = false
  item.customerPickerOpen = false
  isModalDirty.value = true
}

function applyExtractedQuoteCustomerToModalItem(
  item: ImportItem,
  extractedCompany: string,
  extractedRecipient: string,
  extractedMST: string
) {
  if (!item) return
  item.extractedCompany = extractedCompany || ''
  item.extractedRecipient = extractedRecipient || ''
  item.extractedMST = extractedMST || ''

  let dbCus = getMatchedDbCustomerForItem(item)
  if (!dbCus) {
    // Thử điền tạm để dò trong DB theo MST / Tên trích xuất
    const tempItem: any = {
      ...item,
      customer: extractedCompany || item.customer || '',
      recipient: extractedRecipient || item.recipient || extractedCompany || '',
      mst: extractedMST || item.mst || ''
    }
    dbCus = getMatchedDbCustomerForItem(tempItem)
  }

  if (dbCus) {
    // Giữ cố định 100% Mã KH và Mã công ty từ DB
    item.linkedMaKH = dbCus.ma_khach_hang
    item.linkedMaCongTy = dbCus.ma_cong_ty || genMaCongTy(dbCus.ten_cong_ty || dbCus.ten_khach_hang)

    const dbComp = String(dbCus.ten_cong_ty || '').trim()
    const dbRec = String(dbCus.ten_khach_hang || '').trim()
    const dbMst = String(dbCus.mst || '').trim()

    // Phương án A: Trường nào trong DB đang trống thì tự động bù từ Báo giá; trường nào DB đã có thì giữ mặc định theo DB
    item.mst = dbMst || extractedMST || item.mst || ''
    item.customer = dbComp || extractedCompany || item.customer || ''
    item.recipient = dbRec || extractedRecipient || item.recipient || ''

    // Phương án B: Nếu tên trong Báo giá lệch với tên trong DB -> hỏi xác nhận + bật nút chuyển đổi nhanh 1-click
    const compDiff = extractedCompany && dbComp && normalizeCustomerCompareStr(extractedCompany) !== normalizeCustomerCompareStr(dbComp)
    const recDiff = extractedRecipient && dbRec && normalizeCustomerCompareStr(extractedRecipient) !== normalizeCustomerCompareStr(dbRec)
    if (compDiff || recDiff) {
      let diffMsg = `Khách hàng đã có trong DB (Mã KH giữ nguyên: ${dbCus.ma_khach_hang}) nhưng tên trong File Báo giá có sự khác biệt:\n\n`
      if (compDiff) diffMsg += `- Tên công ty:\n  + Trong DB: "${dbComp}"\n  + Trong Báo giá: "${extractedCompany}"\n`
      if (recDiff) diffMsg += `- Người nhận (Tên KH):\n  + Trong DB: "${dbRec}"\n  + Trong Báo giá: "${extractedRecipient}"\n`
      diffMsg += `\nBạn có muốn áp dụng tên theo File Báo giá và cập nhật lại tên hiển thị vào DB không?\n(Lưu ý: Mã KH "${dbCus.ma_khach_hang}" và Mã công ty vẫn giữ nguyên 100% để không ảnh hưởng Công nợ. Nếu bấm Hủy, hệ thống giữ tên DB và bạn vẫn có thể bấm nút chuyển đổi nhanh phía trên ô nhập).`

      if (confirm(diffMsg)) {
        if (extractedCompany) item.customer = extractedCompany
        if (extractedRecipient) item.recipient = extractedRecipient
        item._approvedDbNameUpdate = true
      }
    }
  } else {
    // Khách mới hoàn toàn
    item.customer = extractedCompany || item.customer || ''
    item.recipient = extractedRecipient || item.recipient || item.customer || ''
    if (extractedMST && !item.mst) item.mst = extractedMST
    if (!item.mst) {
      const existingRow = rows.value.find(r => r.Ten_cong_ty?.trim().toLowerCase() === item.customer.toLowerCase() && r.MST)
      if (existingRow) item.mst = existingRow.MST
    }
  }
}

async function upsertCustomerFromModalItem(item: ImportItem) {
  const rawComp = String(item.customer || '').trim()
  const rawRec = String(item.recipient || '').trim()
  const rawMst = String(item.mst || '').trim()

  const existingCus = getMatchedDbCustomerForItem(item)
  if (existingCus) {
    // QUY TẮC BẤT BIẾN: Không bao giờ thay đổi ma_khach_hang và ma_cong_ty của khách hàng đã tồn tại trong DB
    const maKHGen = String(existingCus.ma_khach_hang || '').trim() || genMaKhachHang(rawRec, rawComp)
    const maCongTyGen = String(existingCus.ma_cong_ty || '').trim() || genMaCongTy(existingCus.ten_cong_ty || existingCus.ten_khach_hang || rawComp || rawRec)

    const dbComp = String(existingCus.ten_cong_ty || '').trim()
    const dbRec = String(existingCus.ten_khach_hang || '').trim()
    const dbMst = String(existingCus.mst || '').trim()

    const khUpdates: Record<string, any> = {}
    if (!dbMst && rawMst) khUpdates.mst = rawMst
    if (!dbComp && rawComp) khUpdates.ten_cong_ty = rawComp
    if (!dbRec && rawRec) khUpdates.ten_khach_hang = rawRec

    const compChanged = dbComp && rawComp && normalizeCustomerCompareStr(dbComp) !== normalizeCustomerCompareStr(rawComp)
    const recChanged = dbRec && rawRec && normalizeCustomerCompareStr(dbRec) !== normalizeCustomerCompareStr(rawRec)
    const mstChanged = dbMst && rawMst && dbMst !== rawMst

    if (compChanged || recChanged || mstChanged) {
      let allowUpdate = Boolean(item._approvedDbNameUpdate)
      if (!allowUpdate) {
        let msg = `Thông tin khách hàng trên PO #${item.soPO || ''} khác với dữ liệu gốc trong DB (Mã KH giữ nguyên: ${maKHGen}):\n\n`
        if (compChanged) msg += `- Tên công ty: "${dbComp}" -> "${rawComp}"\n`
        if (recChanged) msg += `- Người nhận: "${dbRec}" -> "${rawRec}"\n`
        if (mstChanged) msg += `- MST: "${dbMst}" -> "${rawMst}"\n`
        msg += `\nBạn có muốn cập nhật lại tên hiển thị / MST mới này vào bảng Khách Hàng (khach_hang) không?\n(Mã KH "${maKHGen}" và Mã công ty "${maCongTyGen}" vẫn giữ nguyên 100% để bảo toàn Công nợ).`
        allowUpdate = confirm(msg)
      }
      if (allowUpdate) {
        if (compChanged) khUpdates.ten_cong_ty = rawComp
        if (recChanged) khUpdates.ten_khach_hang = rawRec
        if (mstChanged) khUpdates.mst = rawMst
        item._approvedDbNameUpdate = true
      }
    }

    if (Object.keys(khUpdates).length > 0 && existingCus.id) {
      try {
        await update(dbRef(database, `khach_hang/${existingCus.id}`), khUpdates)
        if (khachHangMap.value[existingCus.id]) {
          Object.assign(khachHangMap.value[existingCus.id], khUpdates)
        }
      } catch (e) {
        console.warn('Lỗi cập nhật khach_hang:', e)
      }
    }

    item.linkedMaKH = maKHGen
    item.linkedMaCongTy = maCongTyGen
    return {
      maKHGen,
      maCongTyGen,
      tenCongTy: rawComp || dbComp || rawRec || dbRec,
      tenKhachHang: rawRec || dbRec || rawComp || dbComp,
      mstVal: rawMst || dbMst
    }
  }

  // Khách hàng mới hoàn toàn -> Tạo bản ghi mới vào khach_hang
  const tenCongTy = rawComp || rawRec
  const tenKhachHang = rawRec || rawComp
  const maKHGen = item.row?.Ma_khach_hang || genMaKhachHang(tenKhachHang, tenCongTy) || ('KH_UNKNOWN_' + Date.now())
  const maCongTyGen = item.row?.Ma_cong_ty || genMaCongTy(tenCongTy || tenKhachHang) || ('CTY_UNKNOWN_' + Date.now())
  const mstVal = rawMst

  if (tenCongTy || tenKhachHang) {
    try {
      const newKhRef = push(dbRef(database, 'khach_hang'))
      const newKey = newKhRef.key
      const newKhPayload = {
        mst: mstVal,
        ma_cong_ty: maCongTyGen,
        ten_cong_ty: tenCongTy || tenKhachHang,
        ma_khach_hang: maKHGen,
        ten_khach_hang: tenKhachHang || tenCongTy,
        sdt: '',
        email: '',
        dia_chi: '',
        ngay_thanh_lap: '',
        doanh_so: 0,
        cong_no: 0,
        ghi_chu: 'Tạo tự động từ Sale Report / Báo giá',
        createdAt: Date.now()
      }
      await set(newKhRef, newKhPayload)
      if (newKey) {
        khachHangMap.value = {
          ...khachHangMap.value,
          [newKey]: newKhPayload
        }
      }
      item.linkedMaKH = maKHGen
      item.linkedMaCongTy = maCongTyGen
    } catch (e) {
      console.warn('Lỗi tạo mới khach_hang từ SaleReport:', e)
    }
  }

  return {
    maKHGen,
    maCongTyGen,
    tenCongTy: tenCongTy || tenKhachHang,
    tenKhachHang: tenKhachHang || tenCongTy,
    mstVal
  }
}

function onFinancialInput(item: ImportItem, fieldChanged?: keyof ImportItem | 'taxPct') {
  if (fieldChanged === 'doanhSoBan' && item.goodsTotal) {
    const dsbVal = Number(item.doanhSoBan) || 0;
    const vatVal = Number(item.goodsTotal.vat) || 0;
    item.goodsTotal = {
      ...item.goodsTotal,
      ttTruoc: dsbVal,
      vat: vatVal,
      ttSau: dsbVal + vatVal
    };
  }
  const pct = (Number(item.taxPct) || 0) / 100;

  if (fieldChanged === 'netCom') {
    if (pct < 1) {
      item.grossCom = item.netCom / (1 - pct);
    }
  } else if (fieldChanged === 'grossCom' || fieldChanged === 'taxPct') {
    item.netCom = item.grossCom * (1 - pct);
  } else {
    // Mặc định tự tính netCom từ grossCom khi thay đổi trường khác
    item.netCom = item.grossCom * (1 - pct);
  }

  // Cập nhật lại số liệu gốc sau khi chỉnh sửa tay, và reset dự đoán
  item._origGross = item.grossCom;
  item._origNet = item.netCom;
  item.predictPct = '';
}

function onGoodsInput(e: Event, item: ImportItem, g: any, field: string) {
  const target = e.target as HTMLInputElement;
  const raw = target.value;
  
  if (field === 'sl') {
     g.slStr = raw;
     g.sl = parseFloat(raw.replace(/[^0-9.-]/g, '')) || 0;
  } else if (field === 'vatPct') {
     g.vatPct = raw;
     let pct = parseFloat(raw.replace(/[^0-9.-]/g, '')) || 0;
     g.vat = (g.ttTruoc || 0) * (pct / 100);
     g.vatStr = g.vat === 0 ? '' : g.vat.toLocaleString('vi-VN');
  } else if (field === 'vat') {
     const val = parseInt(raw.replace(/[^0-9-]/g, '')) || 0;
     target.value = val === 0 && raw.replace(/[^0-9-]/g, '') === '' ? '' : val.toLocaleString('vi-VN');
     g.vatStr = target.value;
     g.vat = val;
     if (g.ttTruoc > 0) {
        let pct = (val / g.ttTruoc) * 100;
        g.vatPct = pct % 1 === 0 ? String(pct) : pct.toFixed(2);
     } else {
        g.vatPct = '';
     }
  } else if (field === 'donGia') {
     const val = parseInt(raw.replace(/[^0-9-]/g, '')) || 0;
     target.value = val === 0 && raw.replace(/[^0-9-]/g, '') === '' ? '' : val.toLocaleString('vi-VN');
     g.donGiaStr = target.value;
     g.donGia = val;
  }
  
  g.ttTruoc = (g.sl || 0) * (g.donGia || 0);
  
  // Re-eval vat based on vatPct if available
  if (field !== 'vat' && g.vatPct) {
     let pct = parseFloat(String(g.vatPct).replace(/[^0-9.-]/g, '')) || 0;
     g.vat = g.ttTruoc * (pct / 100);
     g.vatStr = g.vat === 0 ? '' : g.vat.toLocaleString('vi-VN');
  }
  
  g.ttSau = g.ttTruoc + (g.vat || 0);
  
  // Calc Total
  if (item.goodsList) {
    let tTruoc = 0, tVat = 0, tSau = 0;
    item.goodsList.forEach(row => {
       tTruoc += (row.ttTruoc || 0);
       tVat += (row.vat || 0);
       tSau += (row.ttSau || 0);
    });
    item.goodsTotal = { ttTruoc: tTruoc, vat: tVat, ttSau: tSau };
    
    // Update Doanh số bán when goods list is edited
    item.doanhSoBan = tTruoc;
    
    // Recompute Gross Com / Net Com if prediction is active
    if (item.predictPct) {
       const pct = parseFloat(item.predictPct.replace(/[^0-9.-]/g, ''));
       if (!isNaN(pct)) {
         item.netCom = item.doanhSoBan * (pct / 100);
         const taxPctNum = (Number(item.taxPct) || 0) / 100;
         item.grossCom = taxPctNum < 1 ? item.netCom / (1 - taxPctNum) : item.netCom;
       }
    }
  }
  isModalDirty.value = true;
}

function updateCategory(item: any, startIdx: number, newCategory: string, oldCategory: string) {
  if (!item.goodsList) return;
  for (let i = startIdx; i < item.goodsList.length; i++) {
    if (item.goodsList[i].danhMuc === oldCategory) {
      item.goodsList[i].danhMuc = newCategory;
    } else {
      break;
    }
  }
  isModalDirty.value = true;
}

function removeGoodsRow(item: any, idx: number) {
  if (item.goodsList && item.goodsList.length > 1) {
    item.goodsList.splice(idx, 1);
    onGoodsInput(null as any, item, null, 'delete');
  } else {
    alert("Hợp đồng bắt buộc phải có ít nhất 1 hàng hóa! Vui lòng sửa thay vì xóa.");
  }
}

function handleInputThueTruoc() {
  return '';
}

function fmtInput(val: number) {
  if (!val) return '';
  return val.toLocaleString('vi-VN');
}

function formatNumberInput(e: Event, item: ImportItem, field: keyof ImportItem, triggerCalc = true) {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/[^0-9-]/g, '');
  const isNegative = raw.startsWith('-');
  const digits = raw.replace(/-/g, '');
  let numericVal = digits ? Number(digits) : 0;
  if (isNegative) numericVal = -numericVal;
  
  (item as any)[field] = numericVal;
  
  if (raw === '' || raw === '-') {
    target.value = raw;
  } else {
    target.value = numericVal.toLocaleString('vi-VN');
  }
  if (triggerCalc) {
    onFinancialInput(item, field);
  }
}

function onPredictInput(e: Event, item: ImportItem) {
  const target = e.target as HTMLInputElement;
  item.predictPct = target.value;
  
  if (target.value === '') {
    // Nếu xóa thì khôi phục lại giá trị gốc
    if (item._origGross !== undefined) item.grossCom = item._origGross;
    if (item._origNet !== undefined) item.netCom = item._origNet;
    return;
  }
  
  const desiredPct = Number(target.value);
  if (isNaN(desiredPct)) return;

  // Lưu lại giá trị hiện hành nếu chưa lưu
  if (item._origGross === undefined) {
    item._origGross = item.grossCom;
    item._origNet = item.netCom;
  }

  const pct = desiredPct / 100;
  const tax = (Number(item.taxPct) || 0) / 100;
  const dsb = item.doanhSoBan || 0;
  const tcp = item.tongCP || 0;

  const targetNetMargin = dsb * pct;
  const requiredGrossCom = dsb - tcp - targetNetMargin;
  const requiredNetCom = requiredGrossCom * (1 - tax);
  
  item.grossCom = requiredGrossCom;
  item.netCom = requiredNetCom;
}

function openMultiEditModal(row: any, fieldToFocus?: string) {
  isModalDirty.value = false
  const id = Date.now()
  multiEditModal.value = {
    show: true,
    mode: 'update',
    items: [{
      id,
      row,
      doanhSoBan: doanhSoBan(row),
      giaMua: giaMua(row),
      tongCP: tongCP(row),
      grossCom: grossCom(row),
      soPO: row.So_PO || '',
      productType: row.Ten_nha_cung_cap || '',
      customer: row.Ten_cong_ty || row.Ten_khach_hang || '',
      recipient: row.Ten_khach_hang || row.Ten_cong_ty || '',
      mst: row.MST || '',
      linkedMaKH: row.Ma_khach_hang || '',
      linkedMaCongTy: row.Ma_cong_ty || '',
      extractedCompany: '',
      extractedRecipient: '',
      extractedMST: '',
      _approvedDbNameUpdate: false,
      customerPickerOpen: false,
      customerSearchQuery: '',
      createdTime: fmtDate(row.created_time) || '',
      content: row.content_of_contract_PO || '',
      netCom: netCom(row),
      am: row.account_manager_name || '',
      taxPct: thuePct(row),
      scanning: false,
      activeTab: 'po',
      goodsList: []
    }]
  }
  
  if (row && hdChiTietData.value.length > 0) {
    const rowMaHD = row.ma_hop_dong ? String(row.ma_hop_dong).trim() : '';
    const matchingRows = rowMaHD ? hdChiTietData.value.filter(r => {
      return String(r[0] || '').trim() === rowMaHD;
    }) : [];
    if (matchingRows.length > 0) {
      multiEditModal.value.items[0].goodsList = matchingRows.map((r, i) => {
        const donGia = Number(r[13]) || 0;
        const sl = Number(r[18]) || 1;
        const ttTruoc = donGia * sl;
        const vatPct = Number(r[17]) || 0;
        const vat = (ttTruoc * vatPct) / 100;
        return {
          stt: i + 1, danhMuc: r[10] || '', ten: r[3] || '', dienGiai: r[9] || '', dvt: r[12] || '',
          sl: sl, donGia: donGia, ttTruoc: ttTruoc, vat: vat, ttSau: ttTruoc + vat,
          vatPct: String(vatPct), vatStr: vat > 0 ? vat.toLocaleString('vi-VN') : ''
        };
      });
    }
  }

  if (fieldToFocus) {
    nextTick(() => {
      const el = document.getElementById(`input-${fieldToFocus}-${id}`)
      if (el) {
        el.focus()
        // Optional: highlight text inside input
        if (el instanceof HTMLInputElement) {
          el.select()
        }
      }
    })
  }
}

function onRowSelectedInModal(item: ImportItem) {
  isModalDirty.value = true
  if (!item.row) return
  
  if (item.row && hdChiTietData.value.length > 0) {
    const rowMaHD = item.row.ma_hop_dong ? String(item.row.ma_hop_dong).trim() : '';
    const matchingRows = rowMaHD ? hdChiTietData.value.filter(r => {
      return String(r[0] || '').trim() === rowMaHD;
    }) : [];
    if (matchingRows.length > 0) {
      item.goodsList = matchingRows.map((r, i) => {
        const donGia = Number(r[13]) || 0;
        const sl = Number(r[18]) || 1;
        const ttTruoc = donGia * sl;
        const vatPct = Number(r[17]) || 0;
        const vat = (ttTruoc * vatPct) / 100;
        return {
          stt: i + 1, danhMuc: r[10] || '', ten: r[3] || '', dienGiai: r[9] || '', dvt: r[12] || '',
          sl: sl, donGia: donGia, ttTruoc: ttTruoc, vat: vat, ttSau: ttTruoc + vat,
          vatPct: String(vatPct), vatStr: vat > 0 ? vat.toLocaleString('vi-VN') : ''
        };
      });
    } else {
      item.goodsList = [];
    }
  } else {
    item.goodsList = [];
  }

  item.mst = item.row.MST || ''
  item.am = item.row.account_manager_name || ''
  item.productType = item.row.Ten_nha_cung_cap || ''
  item.customer = item.row.Ten_cong_ty || item.row.Ten_khach_hang || ''
  item.recipient = item.row.Ten_khach_hang || item.row.Ten_cong_ty || ''
  item.linkedMaKH = item.row.Ma_khach_hang || ''
  item.linkedMaCongTy = item.row.Ma_cong_ty || ''
  item.content = item.row.content_of_contract_PO || ''
  item.soPO = item.row.So_PO || ''
  item.createdTime = fmtDate(item.row.created_time) || ''
  
  if (item.content) {
    item.doanhSoBan = doanhSoBan(item.row)
    if (!item.scanned) {
      item.grossCom = grossCom(item.row)
      item.netCom = netCom(item.row)
      item.taxPct = thuePct(item.row)
    }
  } else {
    item.doanhSoBan = doanhSoBan(item.row)
    item.giaMua = giaMua(item.row)
    item.tongCP = tongCP(item.row)
    if (!item.scanned) {
      item.grossCom = grossCom(item.row)
      item.netCom = netCom(item.row)
      item.taxPct = thuePct(item.row)
    }
  }
}

function getFormattedNow() {
  const d = new Date()
  const p = (n: any) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function formatNgayTaoHopDong() {
  const d = new Date();
  const p = (n: any) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatCreatedTimeDateOnly() {
  const d = new Date();
  const p = (n: any) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function genMaKhachHang(recipient: string, company: string) {
  const r = (recipient || '').trim();
  const c = (company || '').trim();
  if (r && c && r.toLowerCase() !== c.toLowerCase()) {
    return genMaCongTy(r) + '-' + genMaCongTy(c);
  }
  return genMaCongTy(r || c);
}

function genMaCongTy(company: string) {
    if (!company) return '';
    // XoA h?u t? lA d?u g?ch ngang vA s? ? cu?i (vA d?: " -725", "- 725")
    const baseName = String(company).replace(/\s*-\s*\d+.*$/, '');
    return baseName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

async function saveMultiModal() {
  const m = multiEditModal.value
  const validItems = m.mode === 'create' ? m.items : m.items.filter(i => i.row)
  if (validItems.length === 0 || savingModal.value) return

  savingModal.value = true
  try {
    // ─── Get hop_dong_tong_quat count from Firebase ───
    let hdLen = 0;
    try {
      const hdSnapshot = await get(dbRef(database, 'hop_dong_tong_quat'));
      const hdData = hdSnapshot.val();
      if (hdData && typeof hdData === 'object') hdLen = Object.keys(hdData).length;
    } catch (e) {
      console.warn('Lấy count hop_dong_tong_quat từ Firebase thất bại', e);
    }

    if (m.mode === 'create') {
        // --- BULK CREATE SEQUENCE ---
        const bulkOfficialItems = [];
        const bulkSaleReportItems = [];
        
        for (const item of validItems) {
          const uploadCloudinary = async (file: any) => {
            try {
              const formData = new FormData()
              formData.append('upload_preset', 'upload_file')
              formData.append('file', file)
              const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', { method: 'POST', body: formData }).then(r => r.json())
              return uploadRes.secure_url || ''
            } catch (e) { return '' }
          }
  
          let uploadedUrl = ''
          if (item.base64Img) {
            uploadedUrl = await uploadCloudinary('data:image/jpeg;base64,' + item.base64Img)
          }
  
          let linkBG = '', linkMH = '', tenBG = '', tenMH = ''
          if (item.rawFileBaoGia) { linkBG = await uploadCloudinary(item.rawFileBaoGia); tenBG = item.rawFileBaoGia.name; }
          if (item.rawFileMuaHang) { linkMH = await uploadCloudinary(item.rawFileMuaHang); tenMH = item.rawFileMuaHang.name; }
  
          const maHD = 'HD' + Date.now() + Math.floor(Math.random() * 10000);
          hdLen++;
          const soHD = `HĐ ${hdLen}`;
  
          // Đồng bộ / tạo mới khách hàng vào khach_hang (Giữ cố định 100% ma_khach_hang & ma_cong_ty nếu đã có)
          const {
            maKHGen,
            maCongTyGen,
            tenCongTy,
            tenKhachHang,
            mstVal
          } = await upsertCustomerFromModalItem(item);
  
          const tTruoc = Number(item.doanhSoBan ?? item.goodsTotal?.ttTruoc ?? 0);
          const tVat = Number(item.goodsTotal?.vat || 0);
          const tSau = tTruoc + tVat;
          if (item.goodsTotal) {
            item.goodsTotal = { ...item.goodsTotal, ttTruoc: tTruoc, vat: tVat, ttSau: tSau };
          }

          const initPaid = toNum(item.soTienDaThanhToan);
          const initCongNo = Math.max(0, tSau - initPaid);
          const nowStr = getFormattedNow();
          const initPayTime = initPaid > 0 ? nowStr : '';

          const srID = 'SR_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  
          bulkSaleReportItems.push({
              ID: srID,
              ma_hop_dong: maHD,
              so_hop_dong: soHD,
              So_PO: item.soPO,
              Ten_nha_cung_cap: item.productType,
              Ma_khach_hang: maKHGen,
              Ten_khach_hang: tenKhachHang || tenCongTy,
              Ma_cong_ty: maCongTyGen,
              Ten_cong_ty: tenCongTy,
              MST: mstVal,
              created_time: item.createdTime || nowStr,
              content_of_contract_PO: item.content,
              Tong_tien_truoc_thueVAT: tTruoc,
              Tong_thueVAT: tVat,
              Tong_tien_sau_thueVAT: tSau,
              so_tien_da_thanh_toan: initPaid,
              cong_no: initCongNo,
              thoi_gian_thanh_toan: initPayTime,
              chiet_khau_tong_truoc_thue: item.grossCom,
              phan_tram_thue_chenh_lech_gia: item.taxPct,
              thue_chenh_lech_gia: item.grossCom * (item.taxPct / 100),
              Tong_thanh_tien_chua_VAT_mua_hang: item.giaMua,
              Tong_CP_don_hang: item.tongCP,
              con_lai: item.netCom,
              account_manager_name: item.am,
              img_save: uploadedUrl,
              link_excel_bao_gia: linkBG,
              link_excel_mua_hang: linkMH,
              ten_file_bao_gia: tenBG,
              ten_file_mua_hang: tenMH
          });
        }

        // ─── Write bulk to Firebase ───
        if (bulkSaleReportItems.length > 0) {
          const updates: Record<string, any> = {};
          for (const srItem of bulkSaleReportItems) {
            const newKey = push(dbRef(database, 'sale_report')).key;
            if (newKey) {
              updates[`sale_report/${newKey}`] = srItem;
              if (toNum(srItem.so_tien_da_thanh_toan) > 0) {
                const histKey = push(dbRef(database, 'lich_su_thanh_toan')).key || ('LSTT_' + Date.now());
                updates[`lich_su_thanh_toan/${histKey}`] = {
                  id: histKey,
                  id_salereport: srItem.ID || newKey,
                  maKH: srItem.Ma_khach_hang || srItem.Ma_cong_ty || '',
                  so_tien_thanh_toan: toNum(srItem.so_tien_da_thanh_toan),
                  cong_no_con_lai: toNum(srItem.cong_no),
                  thoi_gian_thanh_toan: srItem.thoi_gian_thanh_toan,
                  ghi_chu: 'Thanh toán ban đầu khi tạo PO'
                };
              }
            }
          }
          await update(dbRef(database), updates);
        }

        await loadData()
      } else {
        // Update sequence
      for (const item of validItems) {
        const uploadCloudinary = async (file: any) => {
          try {
            const formData = new FormData()
            formData.append('upload_preset', 'upload_file')
            formData.append('file', file)
            const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
              method: 'POST',
              body: formData
            }).then(r => r.json())
            return uploadRes.secure_url || ''
          } catch (e) {
            console.error('Lỗi upload file:', e)
            return ''
          }
        }

        let uploadedUrl = ''
        if (item.base64Img) {
          uploadedUrl = await uploadCloudinary('data:image/jpeg;base64,' + item.base64Img)
          if (!uploadedUrl) {
            alert('Lỗi upload ảnh lên Cloudinary')
          }
        }

        let linkBG = ''
        let linkMH = ''
        let tenBG = ''
        let tenMH = ''
        if (item.rawFileBaoGia) {
          linkBG = await uploadCloudinary(item.rawFileBaoGia)
          tenBG = item.rawFileBaoGia.name
        }
        if (item.rawFileMuaHang) {
          linkMH = await uploadCloudinary(item.rawFileMuaHang)
          tenMH = item.rawFileMuaHang.name
        }

        const maHD = item.row.ma_hop_dong || 'HD' + Date.now();
        
        let soHD = item.row.so_hop_dong;
        if (!soHD || !soHD.trim()) {
            hdLen++;
            soHD = `HĐ${hdLen}`;
        }

        // Đồng bộ / tạo mới khách hàng vào khach_hang (Giữ cố định 100% ma_khach_hang & ma_cong_ty nếu đã có)
        const {
          maKHGen,
          maCongTyGen,
          tenCongTy,
          tenKhachHang,
          mstVal
        } = await upsertCustomerFromModalItem(item);

        const tTruoc = Number(item.doanhSoBan ?? item.goodsTotal?.ttTruoc ?? 0);
        const tVat = Number(item.goodsTotal?.vat ?? toNum(item.row?.Tong_thueVAT) ?? 0);
        const tSau = tTruoc + tVat;
        if (item.goodsTotal) {
          item.goodsTotal = { ...item.goodsTotal, ttTruoc: tTruoc, vat: tVat, ttSau: tSau };
        }

        const currentPaid = daThanhToan(item.row);
        const updatedCongNo = Math.max(0, tSau - currentPaid);
        const currentPayTime = item.row?.thoi_gian_thanh_toan || '';

        // ─── Build update payload for Firebase ───
        const updatePayload: Record<string, any> = {
            ma_hop_dong: maHD,
            so_hop_dong: soHD,
            Ma_khach_hang: maKHGen,
            Ten_khach_hang: tenKhachHang || tenCongTy,
            Ma_cong_ty: maCongTyGen,
            Ten_cong_ty: tenCongTy,
            MST: mstVal,
            account_manager_name: item.am,
            Ten_nha_cung_cap: item.productType,
            Tong_tien_truoc_thueVAT: tTruoc,
            Tong_thueVAT: tVat,
            Tong_tien_sau_thueVAT: tSau,
            so_tien_da_thanh_toan: currentPaid,
            cong_no: updatedCongNo,
            thoi_gian_thanh_toan: currentPayTime,
            Tong_thanh_tien_chua_VAT_mua_hang: item.giaMua,
            Tong_CP_don_hang: item.tongCP,
            chiet_khau_tong_truoc_thue: item.grossCom,
            phan_tram_thue_chenh_lech_gia: item.taxPct,
            thue_chenh_lech_gia: item.grossCom * (item.taxPct / 100),
            con_lai: item.netCom,
            content_of_contract_PO: item.content,
        };
        if (uploadedUrl) updatePayload.img_save = uploadedUrl;
        if (linkBG) { updatePayload.link_excel_bao_gia = linkBG; updatePayload.ten_file_bao_gia = tenBG; }
        if (linkMH) { updatePayload.link_excel_mua_hang = linkMH; updatePayload.ten_file_mua_hang = tenMH; }

        // ─── Update sale_report in Firebase ───
        const firebaseKey = item.row._firebaseKey || item.row.ID;
        if (firebaseKey) {
          await update(dbRef(database, `sale_report/${firebaseKey}`), updatePayload);
        }

        // ─── Update hop_dong_tong_quat in Firebase ───
        const hdTongData = {
          ma_hop_dong: maHD,
          so_hop_dong: soHD,
          ma_khach_hang: maKHGen,
          ten_khach_hang: tenKhachHang || tenCongTy,
          ngay_tao: formatNgayTaoHopDong(),
          tong_truoc_vat: tTruoc,
          tong_vat: tVat,
          tong_sau_vat: tSau,
          da_thanh_toan: currentPaid,
          con_phai_thu: updatedCongNo,
          trang_thai_thanh_toan: updatedCongNo <= 0 ? 'Đã thanh toán đủ' : (currentPaid > 0 ? 'Thanh toán 1 phần' : 'Chưa thanh toán đủ'),
          loai_hop_dong: 'Chính thức',
          content: item.content || '',
          don_vi_tien_te: 'VND',
          ti_gia: 1,
          ghi_chu: '',
          tong_truoc_vat_goc: tTruoc,
          ngay_tao_date: formatCreatedTimeDateOnly(),
          so_po: item.soPO || '',
          po_content: '',
          content_po: item.content || '',
          gross_com: item.grossCom || 0,
          phan_tram_chiet_khau: 0,
          thue_chenh_lech_gia: (item.grossCom * (item.taxPct / 100)) || 0,
          phan_tram_thue: item.taxPct || 0,
          tong_chiet_khau: 0,
          con_lai: item.netCom || 0,
          tong_cp: 0
        };
        await set(dbRef(database, `hop_dong_tong_quat/${maHD}`), hdTongData);

        // ─── Update hop_dong_chi_tiet in Firebase ───
        let hdChiTietRows: any[] = [];
        if (item.goodsList && item.goodsList.length > 0) {
          hdChiTietRows = item.goodsList.map(g => ({
            ma_hop_dong: maHD,
            so_hop_dong: soHD,
            ma_hang: '',
            ten_hang: g.ten || '',
            main_img: '',
            ma_ncc: '',
            ten_ncc: item.productType || '',
            mo_ta_chung: '',
            mo_ta_chi_tiet: '',
            dien_giai: g.dienGiai || '',
            danh_muc: g.danhMuc || '',
            ghi_chu: '',
            dvt: g.dvt || '',
            don_gia: g.donGia || 0,
            gia_tieu_chuan: g.donGia || 0,
            don_vi_tien_te: 'VND',
            ti_gia: 1,
            thue_vat: g.vatPct || 0,
            so_luong: g.sl || 1,
            features: '',
            gia_hardware: 0,
            gia_nhap: 0,
            muc_phan_tram_off: 0
          }));
        } else {
          hdChiTietRows = [{
            ma_hop_dong: maHD,
            so_hop_dong: soHD,
            ma_hang: '',
            ten_hang: 'Hàng hóa mặc định',
            main_img: '',
            ma_ncc: '',
            ten_ncc: item.productType || '',
            mo_ta_chung: '',
            mo_ta_chi_tiet: '',
            dien_giai: item.content || '',
            danh_muc: '',
            ghi_chu: '',
            dvt: 'Cái',
            don_gia: tTruoc,
            gia_tieu_chuan: tTruoc,
            don_vi_tien_te: 'VND',
            ti_gia: 1,
            thue_vat: 0,
            so_luong: 1,
            features: '',
            gia_hardware: 0,
            gia_nhap: 0,
            muc_phan_tram_off: 0
          }];
        }

        // Remove old chi tiet entries for this contract and add new ones
        const chiTietUpdates: Record<string, any> = {};
        for (const ct of hdChiTietRows) {
          const newCtKey = push(dbRef(database, 'hop_dong_chi_tiet')).key;
          if (newCtKey) {
            chiTietUpdates[`hop_dong_chi_tiet/${newCtKey}`] = ct;
          }
        }
        if (Object.keys(chiTietUpdates).length > 0) {
          await update(dbRef(database), chiTietUpdates);
        }

        // ─── Update local state ───
        item.row.MST = item.mst
        item.row.Ma_khach_hang = maKHGen
        item.row.Ten_khach_hang = item.recipient || item.customer
        item.row.Ma_cong_ty = maCongTyGen
        item.row.Ten_cong_ty = item.customer
        item.row.account_manager_name = item.am
        item.row.Ten_nha_cung_cap = item.productType
        item.row.Tong_tien_truoc_thueVAT = tTruoc
        item.row.Tong_thueVAT = tVat
        item.row.Tong_tien_sau_thueVAT = tSau
        item.row.so_tien_da_thanh_toan = currentPaid
        item.row.cong_no = updatedCongNo
        item.row.thoi_gian_thanh_toan = currentPayTime
        item.row.Tong_thanh_tien_chua_VAT_mua_hang = item.giaMua
        item.row.Tong_CP_don_hang = item.tongCP
        item.row.chiet_khau_tong_truoc_thue = item.grossCom
        item.row.phan_tram_thue_chenh_lech_gia = item.taxPct
        item.row.thue_chenh_lech_gia = item.grossCom * (item.taxPct / 100)
        item.row.con_lai = item.netCom
        if (linkBG) {
          item.row.link_excel_bao_gia = linkBG
          item.row.ten_file_bao_gia = tenBG
        }
        if (linkMH) {
          item.row.link_excel_mua_hang = linkMH
          item.row.ten_file_mua_hang = tenMH
        }
      }
      await syncAllCustomersCongNo()
    }
    m.show = false
  } catch (e) {
    console.error('Lỗi update:', e)
    alert('❌ Lỗi khi lưu. Vui lòng thử lại.')
  } finally {
    savingModal.value = false
  }
}

async function deletePO(item: ImportItem, idx: number) {
  const poName = item.row?.So_PO || item.content || 'này'
  if (!confirm(`⚠️ Bạn có chắc muốn XÓA PO ${poName}? Hành động này không thể hoàn tác!`)) return
  try {
    // ─── Delete from Firebase ───
    const firebaseKey = item.row?._firebaseKey || item.row?.ID;
    const srId = item.row?.ID || firebaseKey;
    if (firebaseKey) {
      await remove(dbRef(database, `sale_report/${firebaseKey}`));
    }
    // ─── Xóa lịch sử thanh toán liên quan tới PO này ───
    if (srId || firebaseKey) {
      const relatedHist = lichSuThanhToanList.value.filter(h =>
        (srId && String(h.id_salereport) === String(srId)) ||
        (firebaseKey && String(h.id_salereport) === String(firebaseKey))
      );
      for (const h of relatedHist) {
        const hk = h._firebaseKey || h.id;
        if (hk) await remove(dbRef(database, `lich_su_thanh_toan/${hk}`));
      }
    }
    // ─── Đồng bộ gỡ trạng thái Đã chốt deal bên Quản lý file & Sale Report Craft ───
    const fromCraft = item.row?.from_craft;
    if (fromCraft) {
      await update(dbRef(database, `sale_report_craft/${fromCraft}`), {
        chotDeal: false,
        id_sale_report: ''
      });
    }
    const idQuanLyFile = item.row?.id_quanlyfile || item.row?.id_quan_ly_file;
    if (idQuanLyFile) {
      const remainingSrKeys = (rows.value || [])
        .filter((r: any) => {
          const rKey = r?._firebaseKey || r?.ID
          if (!rKey || rKey === firebaseKey) return false
          return r?.id_quanlyfile === idQuanLyFile || r?.id_quan_ly_file === idQuanLyFile
        })
        .map((r: any) => r?._firebaseKey || r?.ID)
        .filter(Boolean)

      await update(dbRef(database, `quan_ly_file/${idQuanLyFile}`), {
        craft_chotDeal: remainingSrKeys.length > 0,
        id_sale_report: remainingSrKeys[0] || '',
        sale_report_ids: remainingSrKeys
      });
    }
    // Remove from modal
    multiEditModal.value.items.splice(idx, 1)
    if (multiEditModal.value.items.length === 0) multiEditModal.value.show = false
    // Reload data to refresh PO count, contract numbers, and sync khach_hang.cong_no
    await loadData()
  } catch (e) {
    console.error('Lỗi xóa PO:', e)
    alert('❌ Lỗi khi xóa. Vui lòng thử lại.')
  }
}



// ─── Import Excel ───
const fileInput = ref<HTMLInputElement | null>(null)
const importTarget = ref<{row: any, type: 'bao_gia' | 'mua_hang' | 'update_item_mua_hang' | 'update_item_bao_gia'} | null>(null)

function triggerImport(r: any, type: 'bao_gia' | 'mua_hang' | 'update_item_mua_hang' | 'update_item_bao_gia') {
  importTarget.value = { row: r, type }
  if (fileInput.value) {
    fileInput.value.value = ''
    fileInput.value.click()
  }
}

// ─── Scan Image ───
const scanInput = ref<HTMLInputElement | null>(null)
const scanTarget = ref<ImportItem | null>(null)

const scanConfirmModal = ref({
  show: false,
  item: null as ImportItem | null,
  nangGia: 0,
  thuePct: 25,
  conLai: 0,
  imageUrl: ''
})

function confirmScanResult() {
  const m = scanConfirmModal.value
  if (m.item) {
    if (m.nangGia) m.item.grossCom = m.nangGia
    if (m.conLai) m.item.netCom = m.conLai
    m.item.taxPct = m.thuePct
    m.item.scanned = true
    isModalDirty.value = true
  }
  closeScanConfirmModal()
}

function closeScanConfirmModal() {
  if (scanConfirmModal.value.imageUrl) {
    URL.revokeObjectURL(scanConfirmModal.value.imageUrl)
  }
  scanConfirmModal.value.show = false
  scanConfirmModal.value.imageUrl = ''
}

function triggerScan(item: ImportItem) {
  scanTarget.value = item
  if (scanInput.value) {
    scanInput.value.value = ''
    scanInput.value.click()
  }
}

async function onScanSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const item = scanTarget.value
  if (!item) return
  
  const file = target.files[0]
  item.scanning = true
  
  try {
    // 1. Nén ảnh và chuyển sang Base64
    const { base64, url } = await new Promise<{base64: string, url: string}>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200
          let width = img.width
          let height = img.height

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.7)
          const base64Data = compressedUrl.split(',')[1]
          resolve({ base64: base64Data, url: compressedUrl })
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })

    item.base64Img = base64

    // 2. OCR từ ảnh đã nén
    const worker = await Tesseract.createWorker('vie', 1, {
      logger: m => console.log(m)
    })
    
    const result = await worker.recognize(url)
    await worker.terminate()
    // Do not revoke object url here, wait for modal close
    
    const textData = result.data.text || ''
    const lines = textData.split('\n').map((l: string) => l.trim().toLowerCase()).filter((l: string) => l)
    
    let nangGia = 0
    let thuePct = 25
    let conLai = 0
    
    const extractMoney = (text: string) => {
      const matches = text.match(/\d[\d,\.]+/g)
      if (matches) {
        const strVal = matches[matches.length - 1].replace(/[,.]/g, '')
        return Number(strVal)
      }
      return 0
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.includes('nâng giá')) {
        let val = extractMoney(line.replace('nâng giá', ''))
        if (!val && i + 1 < lines.length) val = extractMoney(lines[i+1])
        if (val) nangGia = val
      }
      
      if (line.includes('thuế') || line.includes('thue')) {
        const pctMatch = line.match(/(\d+)\s*%/)
        if (pctMatch) {
          thuePct = Number(pctMatch[1])
        }
      }
      
      if (line.includes('còn lại')) {
        let val = extractMoney(line.replace('còn lại', ''))
        if (!val && i + 1 < lines.length) val = extractMoney(lines[i+1])
        if (val) conLai = val
      }
    }
    
    scanConfirmModal.value = {
      show: true,
      item,
      nangGia,
      thuePct,
      conLai,
      imageUrl: url
    }
    
  } catch(err: any) {
    console.error('Lỗi quét ảnh:', err)
    alert('Lỗi quét ảnh: ' + (err.message || err))
  } finally {
    item.scanning = false
    isModalDirty.value = true
  }
}

async function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const tgt = importTarget.value
  if (!tgt) return

  loading.value = true

  const uploadCloudinary = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('upload_preset', 'upload_file')
      formData.append('file', file)
      const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
        method: 'POST',
        body: formData
      }).then(r => r.json())
      return uploadRes.secure_url || ''
    } catch (e) {
      console.error('Lỗi upload file:', e)
      return ''
    }
  }

  const parsedItems: ImportItem[] = []
  let currentMaxPO = Math.max(...rows.value.map(r => parseInt(String(r.So_PO))).filter(n => !isNaN(n)), 0)

  for (let fIdx = 0; fIdx < target.files.length; fIdx++) {
    const file = target.files[fIdx]
    try {
      const arrayBuffer = await file.arrayBuffer()
      let extractedDSB = 0
      let extractedCustomer = ''
      let extractedCompany = ''
      let extractedRecipient = ''
      let extractedMST = ''
      let extractedTime = ''
      let pUrl = ''
      let pHtml = ''
      let expectingCompanyPDF = false
      let expectingRecipientPDF = false
      let expectingCompanyExcel = false
      let expectingRecipientExcel = false
      let inGoodsSectionPDF = false
      let goodsList: any[] = [];
      let goodsTotal: any = null;
      let pendingDescLines: string[] = [];
      let headerSkipCount = 0;
      let currentCategory = '';

      if (file.name.toLowerCase().endsWith('.pdf')) {
        pUrl = URL.createObjectURL(file)
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let lines: string[] = []
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          const yMap = new Map<number, any[]>()
          textContent.items.forEach((item: any) => {
            const y = Math.round(item.transform[5])
            if (!yMap.has(y)) yMap.set(y, [])
            yMap.get(y)!.push(item)
          })
          const sortedYs = Array.from(yMap.keys()).sort((a, b) => b - a)
          for (const y of sortedYs) {
            const lineItems = yMap.get(y)!.sort((a, b) => a.transform[4] - b.transform[4])
            const lineText = lineItems.map(t => t.str).join(' ').replace(/\s+/g, ' ').trim()
            if (lineText) lines.push(lineText)
          }
        }

        for (let i = 0; i < lines.length; i++) {
          const lineOriginal = lines[i];
          const line = lineOriginal.toLowerCase();
          
          if (!extractedDSB && line.includes('tổng cộng')) {
            const parts = lines[i].toUpperCase().split('TỔNG CỘNG')
            if (parts[1]) {
              const matches = parts[1].match(/[\d,.]+/g)
              if (matches) {
                for (const m of matches) {
                  const num = Number(m.replace(/[,.]/g, ''))
                  if (num > 1000) { extractedDSB = num; break }
                }
              }
            }
            if (!extractedDSB && i + 1 < lines.length) {
              const nextLine = lines[i+1].toUpperCase()
              const matches = nextLine.match(/[\d,.]+/g)
              if (matches) {
                for (const m of matches) {
                  const num = Number(m.replace(/[,.]/g, ''))
                  if (num > 1000) { extractedDSB = num; break }
                }
              }
            }
          }

          if ((tgt.type === 'bao_gia' || tgt.type === 'update_item_bao_gia')) {
            if (expectingCompanyPDF && !extractedCompany && lineOriginal.trim()) {
              extractedCompany = lineOriginal.trim()
              expectingCompanyPDF = false
            }
            if (expectingRecipientPDF && !extractedRecipient && lineOriginal.trim()) {
              extractedRecipient = lineOriginal.trim()
              expectingRecipientPDF = false
            }

            if (!extractedCompany && (line.includes('kính gởi') || line.includes('kính gửi') || line.includes('bên mua') || line.includes('khách hàng') || line.includes('đơn vị') || line.includes('công ty') || line.includes('company') || line.includes('buyer') || line.includes('to:'))) {
              const match = lineOriginal.match(/(kính g[ưở]i|bên mua|khách hàng|đơn vị|tên công ty|công ty|company|buyer|purchaser|to\s*:|bên a|bên b)/i)
              if (match) {
                const colonIdx = line.indexOf(':', match.index)
                let cLine = ''
                if (colonIdx !== -1) {
                  cLine = lineOriginal.substring(colonIdx + 1).trim()
                } else {
                  cLine = lineOriginal.substring(match.index + match[0].length).trim()
                }
                if (!cLine && i + 1 < lines.length) {
                  cLine = lines[i+1].trim()
                }
                if (cLine.length > 2) {
                  extractedCompany = cLine
                } else {
                  expectingCompanyPDF = true
                }
              }
            }

            if (!extractedRecipient && (line.includes('người nhận') || line.includes('attn') || line.includes('attention') || line.includes('contact') || line.includes('đại diện') || line.includes('liên hệ'))) {
              const match = lineOriginal.match(/(người nhận|attn|attention|contact|đại diện|người liên hệ|người mua)/i)
              if (match) {
                const colonIdx = line.indexOf(':', match.index)
                let cLine = ''
                if (colonIdx !== -1) {
                  cLine = lineOriginal.substring(colonIdx + 1).trim()
                } else {
                  cLine = lineOriginal.substring(match.index + match[0].length).trim()
                }
                if (!cLine && i + 1 < lines.length) {
                  cLine = lines[i+1].trim()
                }
                if (cLine.length > 2) {
                  extractedRecipient = cLine
                } else {
                  expectingRecipientPDF = true
                }
              }
            }

            if (!extractedMST && (line.includes('mã số thuế') || line.includes('mst') || line.includes('tax code'))) {
              const mstMatch = lineOriginal.match(/[0-9]{8,14}(?:-[0-9]{1,4})?/)
              if (mstMatch) extractedMST = mstMatch[0]
            }

            if (!extractedTime && line.includes('ngày') && line.includes('tháng') && line.includes('năm')) {
              const m = line.match(/ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/i)
              if (m) extractedTime = `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${m[3]}`
            } else if (!extractedTime && line.includes('ngày')) {
              const m2 = line.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
              if (m2) extractedTime = m2[0]
          }

          // --- GOODS PARSING CHO PDF (IMPROVED) ---
          // Phát hiện dòng header bảng: yêu cầu >= 3 keyword cột quan trọng trên cùng 1 dòng
          if (!inGoodsSectionPDF) {
            const headerKeywords = ['stt', 'số tt', 'so tt', 'model', 'tên', 'hàng hóa', 'hang hoa', 'mô tả', 'mo ta', 'sản phẩm', 'san pham', 'chi tiết', 'chi tiet', 'hạng mục', 'hang muc', 'diễn giải', 'dien giai', 'đvt', 'dvt', 'đơn giá', 'don gia', 'unit price', 'số lượng', 'so luong', 's\\.l', 'qty', 'thành tiền', 'thanh tien', 'amount'];
            let hdrCount = 0;
            for (const kw of headerKeywords) {
              if (new RegExp('(?:^|\\s)' + kw + '(?:\\s|$)', 'i').test(line)) hdrCount++;
            }
            // Cần ít nhất 3 keyword header VÀ không phải dòng metadata (đơn vị thụ hưởng, kính gởi, etc.)
            if (hdrCount >= 3 && !/(đơn vị\s*(thụ|thu)|tên\s*:|người\s*:|gởi\s*:|gửi\s*:|kính\s*:|địa chỉ|address|mst\s*:|mã số thuế|ngân hàng|bank)/i.test(line)) {
              inGoodsSectionPDF = true;
              pendingDescLines = [];
              headerSkipCount = 2;
              continue;
            }
          }
          // Bỏ qua dòng header phụ (continuation) - VD: "lượng (VNĐ) trước thuế Thuế thuế"
          if (inGoodsSectionPDF && headerSkipCount > 0) {
            const subHeaderWords = /(^|\s)(lượng|trước\s*thuế|sau\s*thuế|vnđ|\(vnđ\)|đơn vị|tính|hạn|thuế|vat)(\s|$)/gi;
            const matches = line.match(subHeaderWords);
            const wordCount = line.trim().split(/\s+/).length;
            const isSubHeader = matches && matches.length >= 2 && (matches.length / wordCount) >= 0.3;
            if (isSubHeader) {
              headerSkipCount--;
              continue;
            }
            headerSkipCount = 0;
          }
          // Kết thúc bảng hàng hóa khi gặp dòng tổng cộng hoặc các điều khoản
          if (inGoodsSectionPDF && /^(tổng cộng|cộng|tổng tiền|tổng thanh toán|subtotal|grand total|các điều khoản)/i.test(line.trim())) {
            inGoodsSectionPDF = false;
          }

          if (inGoodsSectionPDF) {
            // Trích xuất tất cả các số từ dòng, bỏ qua %, -, ######
            const tokens = lineOriginal.split(/\s+/);
            let allNums: {val: number, idx: number}[] = [];
            let textTokens: string[] = [];

            for (let j = 0; j < tokens.length; j++) {
              const tok = tokens[j];
              // Bỏ qua các token đặc biệt: %, -, ######
              if (/^-+$/.test(tok) || /^#+$/.test(tok) || /^\d+%$/.test(tok)) continue;
              if (/^[\d,.]+$/.test(tok)) {
                const num = Number(tok.replace(/[,.]/g, ''));
                if (!isNaN(num)) {
                  allNums.push({ val: num, idx: j });
                }
              }
            }

            // Phần text = tất cả token trước số cuối cùng mà không phải là số/special
            let firstDataNumIdx = -1; // index token đầu tiên thuộc chuỗi SL, DG, TT
            let sl = 1, donGia = 0, ttTruoc = 0, vatNum = 0, ttSau = 0;
            let found = false;

            if (allNums.length >= 3) {
              // Thuật toán: quét từ trái qua phải tìm bộ 3 số: SL * DG = TT
              for (let a = 0; a <= allNums.length - 3; a++) {
                const n1 = allNums[a].val, n2 = allNums[a+1].val, n3 = allNums[a+2].val;
                if (n1 > 0 && n2 > 0 && n3 >= 100000 && Math.abs(n1 * n2 - n3) <= 2) {
                  sl = n1; donGia = n2; ttTruoc = n3;
                  firstDataNumIdx = allNums[a].idx;
                  // Tìm VAT và thành tiền sau thuế từ các số còn lại
                  for (let b = a + 3; b < allNums.length; b++) {
                    if (allNums[b].val > ttTruoc * 0.5) { ttSau = allNums[b].val; break; }
                    else if (allNums[b].val > 0) { vatNum = allNums[b].val; }
                  }
                  found = true; break;
                }
              }
            }
            // Fallback: SL=1 khi DG == TT (2 số bằng nhau, > 1000)
            if (!found && allNums.length >= 2) {
              for (let a = 0; a <= allNums.length - 2; a++) {
                if (allNums[a].val >= 100000 && allNums[a].val === allNums[a+1].val) {
                  sl = 1; donGia = allNums[a].val; ttTruoc = allNums[a+1].val;
                  firstDataNumIdx = allNums[a].idx;
                  for (let b = a + 2; b < allNums.length; b++) {
                    if (allNums[b].val > ttTruoc * 0.5) { ttSau = allNums[b].val; break; }
                    else if (allNums[b].val > 0) { vatNum = allNums[b].val; }
                  }
                  found = true; break;
                }
              }
            }
            // Fallback: SL < DG, TT = SL * DG (2 số, tìm hệ số)
            if (!found && allNums.length >= 2) {
              for (let a = 0; a <= allNums.length - 2; a++) {
                if (allNums[a].val > 0 && allNums[a].val < allNums[a+1].val && allNums[a+1].val >= 100000 && allNums[a+1].val % allNums[a].val === 0) {
                  sl = allNums[a].val; ttTruoc = allNums[a+1].val; donGia = ttTruoc / sl;
                  firstDataNumIdx = allNums[a].idx;
                  found = true; break;
                }
              }
            }

            if (found && sl > 0 && ttTruoc > 0) {
              // Phần text = tất cả token trước firstDataNumIdx, bỏ qua %, -, ######, và các số thuộc phần dữ liệu
              textTokens = [];
              for (let j = 0; j < firstDataNumIdx; j++) {
                const tok = tokens[j];
                if (/^-+$/.test(tok) || /^#+$/.test(tok) || /^\d+%$/.test(tok)) continue;
                textTokens.push(tok);
              }

              let stt = '';
              if (textTokens.length > 0 && /^\d[\w.-]*$/.test(textTokens[0])) {
                stt = textTokens.shift() || '';
              }

              let dvt = '';
              const knownUnits = ['cái', 'bộ', 'tháng', 'chiếc', 'gói', 'lô', 'cuộn', 'hộp', 'pcs', 'lic', 'thùng', 'kg', 'm', 'km', 'lít', 'bản', 'quyển', 'quyề', 'chai', 'lọ', 'năm'];
              if (textTokens.length > 0) {
                const lastWord = textTokens[textTokens.length - 1].toLowerCase();
                if (knownUnits.includes(lastWord)) {
                  dvt = textTokens.pop() || '';
                }
              }

              let ten = textTokens.join(' ').trim();
              let dienGiai = pendingDescLines.join('\n').trim();
              pendingDescLines = []; // Reset

              if (!ttSau && ttTruoc > 0) ttSau = ttTruoc + vatNum;

              if (ten.length <= 2 && dienGiai.length > 0) {
                ten = dienGiai.replace(/\n/g, ' ');
                dienGiai = '';
              }

              let calculatedVatPct = '';
              if (ttTruoc > 0 && vatNum > 0) {
                calculatedVatPct = Math.round((vatNum / ttTruoc) * 100).toString();
              }

              goodsList.push({ stt, ten, dvt, sl, donGia, ttTruoc, vat: vatNum, ttSau: ttSau, dienGiai, danhMuc: currentCategory, vatPct: calculatedVatPct, vatStr: vatNum > 0 ? vatNum.toLocaleString('vi-VN') : '' });
            } else {
              // Dòng không có dữ liệu số hợp lệ -> tích lũy làm mô tả
              const trimmed = lineOriginal.trim();
              if (trimmed.length > 1 && !/^(VNĐ|vnd|\(VNĐ\)|trước thuế|sau thuế|thuế|lượng|tính|hạn|đơn vị)$/i.test(trimmed)) {
                // Kiểm tra xem dòng có phải là group category (STT + text dài, không có số tiền)
                const isGroupLine = /^\d+[\.\s]*[A-ZÀ-Ỹ]/.test(trimmed) && allNums.length <= 1;
                
                if (isGroupLine) {
                  currentCategory = trimmed.replace(/^\d+[\.\s]+/, '').trim();
                  pendingDescLines = [];
                } else {
                  // Nối các dòng có vẻ như là mô tả thêm (bắt đầu bằng chữ thường hoặc ký tự đặc biệt) vào item trước đó
                  const startsWithLowercaseOrPunct = /^[a-zà-ỹ\(\[\{\+\,\.\/\\]/.test(trimmed);
                  if (startsWithLowercaseOrPunct && goodsList.length > 0) {
                    let lastItem = goodsList[goodsList.length - 1];
                    lastItem.dienGiai = lastItem.dienGiai ? lastItem.dienGiai + '\n' + trimmed : trimmed;
                  } else {
                    pendingDescLines.push(trimmed);
                  }
                }
              }
            }
          }
          }
        }
        
        if (extractedTime) {
          const d = new Date()
          const p = (n: number) => String(n).padStart(2, '0')
          extractedTime = `${extractedTime} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
        }

      } else {
        const wb = XLSX.read(arrayBuffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 })
        pHtml = XLSX.utils.sheet_to_html(ws)
        pHtml = pHtml.replace(/<table/gi, '<table class="preview-excel-table" style="border-collapse:collapse; font-family: \'Calibri\', sans-serif; font-size: 13px; color: #1e293b; background: white; margin: 0;"')
        pHtml = pHtml.replace(/<td/gi, '<td style="border: 1px solid #cbd5e1; padding: 6px 10px; white-space: nowrap; min-width: 60px; text-align: left; vertical-align: bottom;"')

        let headerRowIdx = -1;
        let sttIdx = -1, tenIdx = -1, dienGiaiIdx = -1, dvtIdx = -1, slIdx = -1, dgIdx = -1, ttTruocIdx = -1, vatIdx = -1, ttSauIdx = -1;
        let currentCategory = '';

        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          if (!row || !Array.isArray(row)) continue

          // Goods table extraction
          if (headerRowIdx === -1) {
            let foundHeaderKey = false;
            for (let j = 0; j < row.length; j++) {
               let val = String(row[j] || '').toUpperCase().trim();
               if (!val) continue;
               
               const valNoAccent = val.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/Đ/g, 'D');
               
               if (sttIdx === -1 && (val === 'STT' || val === 'SỐ TT' || valNoAccent === 'SO TT' || val === 'NO' || val === 'NO.')) { sttIdx = j; foundHeaderKey = true; }
               if (tenIdx === -1 && (val.includes('TÊN') || valNoAccent.includes('TEN HANG') || val.includes('HÀNG HÓA') || valNoAccent.includes('HANG HOA') || val.includes('VẬT TƯ') || val.includes('SẢN PHẨM') || val.includes('NỘI DUNG') || val.includes('MÔ TẢ') || val.includes('CHI TIẾT') || val.includes('HẠNG MỤC') || val.includes('ITEM') || val.includes('DESCRIPTION'))) { tenIdx = j; foundHeaderKey = true; }
               if (dienGiaiIdx === -1 && (val.includes('DIỄN GIẢI'))) { dienGiaiIdx = j; }
               if (dvtIdx === -1 && (val === 'DVT' || val === 'ĐVT' || val.includes('ĐƠN VỊ') || valNoAccent.includes('DON VI') || val === 'UNIT' || val === 'UOM')) { dvtIdx = j; foundHeaderKey = true; }
               if (slIdx === -1 && (val === 'S.L' || val === 'SL' || val.includes('SỐ LƯỢNG') || valNoAccent.includes('SO LUONG') || val === 'QTY')) { slIdx = j; foundHeaderKey = true; }
               if (dgIdx === -1 && (val.includes('ĐƠN GIÁ') || valNoAccent.includes('DON GIA') || val === 'GIÁ' || valNoAccent === 'GIA' || val.includes('PRICE') || val.includes('UNIT PRICE'))) { dgIdx = j; foundHeaderKey = true; }
               
               if (ttTruocIdx === -1 && (val.includes('THÀNH TIỀN') || valNoAccent.includes('THANH TIEN') || val.includes('AMOUNT') || val.includes('TOTAL')) && (val.includes('TRƯỚC') || valNoAccent.includes('TRUOC') || val.includes('CHƯA') || valNoAccent.includes('CHUA'))) { ttTruocIdx = j; foundHeaderKey = true; }
               else if (ttSauIdx === -1 && (val.includes('THÀNH TIỀN') || valNoAccent.includes('THANH TIEN') || val.includes('AMOUNT') || val.includes('TOTAL')) && (val.includes('SAU') || valNoAccent.includes('SAU') || val.includes('CÓ') || valNoAccent.includes('CO'))) { ttSauIdx = j; foundHeaderKey = true; }
               else if (ttSauIdx === -1 && (val.includes('THÀNH TIỀN') || valNoAccent.includes('THANH TIEN') || val === 'CỘNG' || valNoAccent === 'CONG' || val.includes('TỔNG TIỀN') || valNoAccent.includes('TONG TIEN') || val.includes('AMOUNT') || val.includes('TOTAL'))) { ttSauIdx = j; foundHeaderKey = true; }
               else if (vatIdx === -1 && (val.includes('THUẾ') || valNoAccent.includes('THUE') || val.includes('VAT') || val.includes('TAX'))) { vatIdx = j; foundHeaderKey = true; }
            }
            
            let validKeysCount = (sttIdx !== -1 ? 1 : 0) + (tenIdx !== -1 ? 1 : 0) + (dvtIdx !== -1 ? 1 : 0) + (slIdx !== -1 ? 1 : 0) + (dgIdx !== -1 ? 1 : 0) + (ttTruocIdx !== -1 ? 1 : 0) + (ttSauIdx !== -1 ? 1 : 0);
            if (foundHeaderKey && validKeysCount >= 2) {
               headerRowIdx = i;
               // Fallback: If we couldn't find a 'Tên' column, pick the first non-empty column that isn't already assigned
               if (tenIdx === -1) {
                  for (let c = 0; c < row.length; c++) {
                     if (c !== sttIdx && c !== dvtIdx && c !== slIdx && c !== dgIdx && c !== ttTruocIdx && c !== vatIdx && c !== ttSauIdx && String(row[c]||'').trim().length > 0) {
                        tenIdx = c;
                        break;
                     }
                  }
                  // If still not found, just default to column next to STT
                  if (tenIdx === -1 && sttIdx !== -1) tenIdx = sttIdx + 1;
               }
               continue;
            } else {
               // Reset indices if it was a false positive metadata row
               sttIdx = -1; tenIdx = -1; dienGiaiIdx = -1; dvtIdx = -1; slIdx = -1; dgIdx = -1; ttTruocIdx = -1; vatIdx = -1; ttSauIdx = -1;
            }
          }

          if (headerRowIdx !== -1 && i > headerRowIdx && !extractedDSB) {
             let stt = sttIdx !== -1 ? row[sttIdx] : undefined;
             let ten = tenIdx !== -1 ? row[tenIdx] : undefined;
             
             let isTotalRow = String(stt || '').toUpperCase().includes('CỘNG') || String(ten || '').toUpperCase().includes('CỘNG') || String(stt || '').toUpperCase().includes('TỔNG') || String(ten || '').toUpperCase().includes('TỔNG');
             
             if (isTotalRow) {
                goodsTotal = {
                   ttTruoc: ttTruocIdx !== -1 ? Number(row[ttTruocIdx]) : 0,
                   vat: vatIdx !== -1 ? Number(row[vatIdx]) : 0,
                   ttSau: ttSauIdx !== -1 ? Number(row[ttSauIdx]) : 0
                };
             } else {
                let anyText = '';
                for(let c=0; c<row.length; c++){
                   if(row[c] && typeof row[c] === 'string') {
                      let t = row[c].trim();
                      if (t.length > 2 && t.toUpperCase() !== 'OFF') {
                         anyText = t;
                         break;
                      }
                   }
                }
                let hasValidData = ten || anyText || (dgIdx !== -1 && Number(row[dgIdx]) > 0) || (ttSauIdx !== -1 && Number(row[ttSauIdx]) > 0) || (slIdx !== -1 && Number(row[slIdx]) > 0);
                if (hasValidData) {
                   // Cố gắng tìm tên nếu bị thiếu (merge cell bị lệch cột)
                   if (!ten) {
                      for(let c=0; c<row.length; c++){
                         if(c !== sttIdx && c !== dvtIdx && c !== slIdx && c !== dgIdx && c !== ttTruocIdx && c !== vatIdx && c !== ttSauIdx && typeof row[c] === 'string') {
                            let t = row[c].trim();
                            if (t.length > 2 && t.toUpperCase() !== 'OFF') {
                               ten = t;
                               break;
                            }
                         }
                      }
                   }
                    let ttTruoc = ttTruocIdx !== -1 ? Number(row[ttTruocIdx]) || 0 : 0;
                    let donGia = dgIdx !== -1 ? Number(row[dgIdx]) || 0 : 0;
                    let sl = slIdx !== -1 ? Number(row[slIdx]) || 0 : 0;
                    if (ttTruoc === 0 && sl > 0 && donGia > 0) ttTruoc = sl * donGia;

                    let vatVal = vatIdx !== -1 ? row[vatIdx] : 0;
                    let vatNum = 0;
                    if (typeof vatVal === 'string' && vatVal.includes('%')) {
                       let pct = parseFloat(vatVal) || 0;
                       vatNum = ttTruoc * (pct / 100);
                    } else {
                       vatNum = Number(vatVal) || 0;
                       if (vatNum > 0 && vatNum < 1) {
                          vatNum = ttTruoc * vatNum;
                       }
                    }

                    let ttSau = ttSauIdx !== -1 ? Number(row[ttSauIdx]) || 0 : 0;
                    if (ttSau === 0 && ttTruoc > 0) ttSau = ttTruoc + vatNum;

                    let isCategoryRow = false;
                    let potentialCategoryText = '';
                    for (let c = 0; c < row.length; c++) {
                       if (row[c] && typeof row[c] === 'string' && row[c].trim().length > 2) {
                          potentialCategoryText = row[c].trim();
                          break;
                       }
                    }
                    if (potentialCategoryText && sl === 0 && donGia === 0 && ttTruoc === 0 && ttSau === 0) {
                       if (!potentialCategoryText.toUpperCase().includes('CỘNG') && !potentialCategoryText.toUpperCase().includes('TỔNG')) {
                          isCategoryRow = true;
                          currentCategory = String(potentialCategoryText).trim();
                       }
                    }

                    let calculatedVatPct = '';
                    if (ttTruoc > 0 && vatNum > 0) {
                      calculatedVatPct = Math.round((vatNum / ttTruoc) * 100).toString();
                    }

                    if (!isCategoryRow && ten) {
                        goodsList.push({
                           stt: stt || '',
                           ten: ten || '',
                           dienGiai: dienGiaiIdx !== -1 ? row[dienGiaiIdx] : '',
                           danhMuc: currentCategory,
                           dvt: dvtIdx !== -1 ? row[dvtIdx] : '',
                           sl: sl,
                           donGia: donGia,
                           ttTruoc: ttTruoc,
                           vat: vatNum,
                           ttSau: ttSau,
                           vatPct: calculatedVatPct,
                           vatStr: vatNum > 0 ? vatNum.toLocaleString('vi-VN') : ''
                        });
                    }
                }
             }
          }

          if (!row || !Array.isArray(row)) continue

          let tongCongCol = -1
          for (let j = 0; j < row.length; j++) {
            if (String(row[j] || '').toUpperCase().includes('TỔNG CỘNG')) {
              tongCongCol = j
              break
            }
          }

          if (tongCongCol !== -1) {
            for (let j = tongCongCol + 1; j < row.length; j++) {
              if (!extractedDSB && row[j] !== undefined && row[j] !== null && row[j] !== '') {
                const numVal = Number(row[j])
                if (!isNaN(numVal) && numVal > 0) {
                  extractedDSB = numVal
                }
              }
            }
          }
          
          if ((tgt.type === 'bao_gia' || tgt.type === 'update_item_bao_gia') && i <= 18) {
             if (!extractedCompany || !extractedRecipient || !extractedTime || !extractedMST) {
               for (let j = 0; j < row.length; j++) {
                 const v = String(row[j] || '').trim()
                 if (!v) continue

                 if (expectingCompanyExcel && !extractedCompany) {
                   extractedCompany = v
                   expectingCompanyExcel = false
                   continue
                 }
                 if (expectingRecipientExcel && !extractedRecipient) {
                   extractedRecipient = v
                   expectingRecipientExcel = false
                   continue
                 }

                 const vLower = v.toLowerCase()
                 
                 if (!extractedCompany && (vLower.includes('kính gởi') || vLower.includes('kính gửi') || vLower.includes('bên mua') || vLower.includes('khách hàng') || vLower.includes('đơn vị'))) {
                   const match = v.match(/(kính g[ưở]i|bên mua|khách hàng|đơn vị)/i)
                   if (match) {
                     const colonIdx = v.indexOf(':', match.index)
                     if (colonIdx !== -1) {
                       extractedCompany = v.substring(colonIdx + 1).trim()
                     } else {
                       extractedCompany = v.substring(match.index + match[0].length).trim()
                     }
                     
                     if (!extractedCompany) {
                       for (let k = j + 1; k < row.length; k++) {
                         const nextVal = String(row[k] || '').trim()
                         if (nextVal) {
                           extractedCompany = nextVal
                           break
                         }
                       }
                     }
                     
                     if (!extractedCompany) {
                       expectingCompanyExcel = true
                     }
                   }
                 }

                 if (!extractedRecipient && vLower.includes('người nhận')) {
                   const match = v.match(/(người nhận)/i)
                   if (match) {
                     const colonIdx = v.indexOf(':', match.index)
                     if (colonIdx !== -1) {
                       extractedRecipient = v.substring(colonIdx + 1).trim()
                     } else {
                       extractedRecipient = v.substring(match.index + match[0].length).trim()
                     }
                     
                     if (!extractedRecipient) {
                       for (let k = j + 1; k < row.length; k++) {
                         const nextVal = String(row[k] || '').trim()
                         if (nextVal) {
                           extractedRecipient = nextVal
                           break
                         }
                       }
                     }
                     
                     if (!extractedRecipient) {
                       expectingRecipientExcel = true
                     }
                   }
                 }

                 if (!extractedMST && (vLower.includes('mã số thuế') || vLower.includes('mst') || vLower.includes('tax code'))) {
                   const colonIdx = v.indexOf(':')
                   let candidate = colonIdx !== -1 ? v.substring(colonIdx + 1).trim() : ''
                   if (!candidate && row[j + 1]) candidate = String(row[j + 1] || '').trim()
                   const mstMatch = candidate.match(/[0-9]{8,14}(?:-[0-9]{1,4})?/)
                   if (mstMatch) extractedMST = mstMatch[0]
                 }
                 
                 if (!extractedTime && /^ngày/i.test(vLower)) {
                   let t = ''
                   if (vLower.includes(':')) {
                     t = v.split(/ngày\s*:/i)[1] || ''
                   } else {
                     t = v.replace(/^ngày\s*/i, '')
                   }
                   t = t.trim().replace(/\s*\/\s*/g, '/')
                   if (t) {
                     if (!t.includes(':')) {
                       const d = new Date()
                       const p = (n: number) => String(n).padStart(2, '0')
                       t = `${t} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
                     }
                     extractedTime = t
                   }
                 }
               }
             }
          }
        }
        
        // Upload immediately to Cloudinary to enable Office Online Viewer
        pUrl = await uploadCloudinary(file)
      }

      if (!extractedDSB) {
        console.warn('Không tìm thấy dòng TỔNG CỘNG trong file:', file.name)
        continue
      }

      let finalCompany = extractedCompany || extractedCustomer;
      let finalRecipient = extractedRecipient || finalCompany;
      extractedCustomer = finalCompany;

      if (tgt.type === 'bao_gia' || tgt.type === 'update_item_bao_gia') {
        const existingRow = rows.value.find(r => r.Ten_cong_ty?.trim().toLowerCase() === extractedCustomer.toLowerCase() && r.MST)
        currentMaxPO++
        
        let gTTruoc = 0, gVat = 0, gTSau = 0;
        if (goodsList && goodsList.length > 0) {
           goodsList.forEach(g => {
              gTTruoc += g.ttTruoc || 0;
              gVat += g.vat || 0;
              gTSau += g.ttSau || 0;
           });
           goodsTotal = { ttTruoc: gTTruoc, vat: gVat, ttSau: gTSau };
        }

        const newItemObj: ImportItem = {
          id: Date.now() + fIdx,
          row: null,
          doanhSoBan: extractedDSB,
          giaMua: 0,
          tongCP: 0,
          grossCom: 0,
          soPO: currentMaxPO > 0 ? String(currentMaxPO) : '',
          productType: '',
          customer: extractedCustomer,
          recipient: finalRecipient,
          mst: extractedMST || (existingRow ? existingRow.MST : ''),
          extractedCompany: extractedCompany || '',
          extractedRecipient: extractedRecipient || '',
          extractedMST: extractedMST || '',
          createdTime: extractedTime,
          content: file.name.replace(/\.[^/.]+$/, ''),
          netCom: 0,
          am: 'Lê Phi Sơn',
          taxPct: 25,
          scanning: false,
          rawFileBaoGia: fIdx === 0 ? target.files[fIdx] : undefined,
          previewUrlBG: pUrl,
          previewHtmlBG: pHtml,
          goodsList: goodsList,
          goodsTotal: goodsTotal
        }
        if (tgt.type === 'bao_gia') {
          applyExtractedQuoteCustomerToModalItem(newItemObj, extractedCompany, extractedRecipient, extractedMST)
        }
        parsedItems.push(newItemObj)
      } else {
        parsedItems.push({
          id: Date.now() + fIdx,
          row: null,
          doanhSoBan: 0,
          giaMua: extractedDSB,
          tongCP: extractedDSB,
          grossCom: 0,
          soPO: '', productType: '', customer: '', mst: '', createdTime: '', content: file.name.replace(/\.[^/.]+$/, ''), netCom: 0, am: '', taxPct: 25, scanning: false,
          rawFileMuaHang: target.files[fIdx],
          previewUrlMH: pUrl,
          previewHtmlMH: pHtml
        })
      }
    } catch(err) {
      console.error('Lỗi khi đọc file:', file.name, err)
    }
  }

  if (parsedItems.length === 0) {
    loading.value = false
    alert('Không thể đọc dữ liệu hợp lệ từ các file đã chọn. Đảm bảo file có dòng "TỔNG CỘNG" ở cột G.')
    return
  }

  if (tgt.type === 'update_item_bao_gia') {
    if (parsedItems[0] && parsedItems[0].doanhSoBan) {
       tgt.row.doanhSoBan = parsedItems[0].doanhSoBan
       tgt.row.rawFileBaoGia = target.files[0]
       tgt.row.previewUrlBG = parsedItems[0].previewUrlBG
       tgt.row.previewHtmlBG = parsedItems[0].previewHtmlBG
       tgt.row.goodsList = parsedItems[0].goodsList
       tgt.row.goodsTotal = parsedItems[0].goodsTotal
       applyExtractedQuoteCustomerToModalItem(
         tgt.row,
         parsedItems[0].extractedCompany || '',
         parsedItems[0].extractedRecipient || '',
         parsedItems[0].extractedMST || ''
       )
       onFinancialInput(tgt.row)
       isModalDirty.value = true
    } else {
       alert('Không tìm thấy dòng TỔNG CỘNG hoặc dữ liệu hợp lệ trong file báo giá.')
    }
    loading.value = false
    return
  }

  if (tgt.type === 'update_item_mua_hang') {
    if (parsedItems[0] && parsedItems[0].giaMua) {
       tgt.row.giaMua = parsedItems[0].giaMua
       tgt.row.tongCP = parsedItems[0].giaMua
       tgt.row.rawFileMuaHang = target.files[0]
       tgt.row.previewUrlMH = parsedItems[0].previewUrlMH
       tgt.row.previewHtmlMH = parsedItems[0].previewHtmlMH
       onFinancialInput(tgt.row)
       isModalDirty.value = true
    } else {
       alert('Không tìm thấy dòng TỔNG CỘNG hoặc dữ liệu hợp lệ trong file mua hàng.')
    }
    loading.value = false
    return
  }

  isModalDirty.value = (tgt.type === 'bao_gia' || tgt.type === 'mua_hang')
  multiEditModal.value = {
    show: true,
    mode: (tgt.type === 'bao_gia' || tgt.type === 'mua_hang') ? 'create' : 'update',
    items: parsedItems
  }
  loading.value = false
}


// ─── Export Excel ───
const showExportModal = ref(false)
const showExportPreview = ref(false)
const exporting = ref(false)

watch(showExportModal, (val) => {
  if (!val) {
    showExportPreview.value = false
  }
})

const exportTimeMode = ref('month')
const exportDateFrom = ref('')
const exportDateTo = ref('')
const exportMonthFrom = ref(currentMonthStr)
const exportMonthTo = ref(currentMonthStr)
const exportYearFrom = ref('')
const exportYearTo = ref('')

const exportRecords = ref<any[]>([])

const exportSortOrder = ref('Cũ => Mới')

const rowsForExportFilter = computed(() => {
  let list = rows.value
  list = list.filter(r => {
    if (!r.created_time) return false
    const d = parseDateStr(r.created_time)
    if (!d) return false
    
    if (exportTimeMode.value === 'day') {
      if (exportDateFrom.value && new Date(exportDateFrom.value) > d) return false
      if (exportDateTo.value) {
        const to = new Date(exportDateTo.value)
        to.setHours(23, 59, 59, 999)
        if (to < d) return false
      }
    } else if (exportTimeMode.value === 'month') {
      const rowMonthStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if (exportMonthFrom.value && exportMonthFrom.value > rowMonthStr) return false
      if (exportMonthTo.value && exportMonthTo.value < rowMonthStr) return false
    } else if (exportTimeMode.value === 'year') {
      const y = d.getFullYear()
      if (exportYearFrom.value && parseInt(exportYearFrom.value) > y) return false
      if (exportYearTo.value && parseInt(exportYearTo.value) < y) return false
    }
    return true
  })
  return list
})

watch(rowsForExportFilter, (newList) => {
  const sorted = [...newList].sort((a, b) => {
    const da = parseDateStr(a.created_time)
    const db = parseDateStr(b.created_time)
    const timeA = da ? da.getTime() : 0
    const timeB = db ? db.getTime() : 0
    return exportSortOrder.value === 'Mới => Cũ' ? timeB - timeA : timeA - timeB
  })
  exportRecords.value = sorted
}, { immediate: true })

watch(exportSortOrder, (newOrder) => {
  exportRecords.value.sort((a, b) => {
    const da = parseDateStr(a.created_time)
    const db = parseDateStr(b.created_time)
    const timeA = da ? da.getTime() : 0
    const timeB = db ? db.getTime() : 0
    return newOrder === 'Mới => Cũ' ? timeB - timeA : timeA - timeB
  })
})

watch([exportDateFrom, exportDateTo], ([newFrom, newTo], [oldFrom, oldTo]) => {
  if (newFrom && newTo && newFrom > newTo) {
    if (newFrom !== oldFrom) exportDateTo.value = newFrom
    else exportDateFrom.value = newTo
  }
})

watch([exportMonthFrom, exportMonthTo], ([newFrom, newTo], [oldFrom, oldTo]) => {
  if (newFrom && newTo && newFrom > newTo) {
    if (newFrom !== oldFrom) exportMonthTo.value = newFrom
    else exportMonthFrom.value = newTo
  }
})

watch([exportYearFrom, exportYearTo], ([newFrom, newTo], [oldFrom, oldTo]) => {
  if (newFrom && newTo && Number(newFrom) > Number(newTo)) {
    if (newFrom !== oldFrom) exportYearTo.value = newFrom
    else exportYearFrom.value = newTo
  }
})

const exportTitle = computed(() => {
  if (exportTimeMode.value === 'day') {
    if (!exportDateFrom.value && !exportDateTo.value) return 'SALE_REPORT_ALL'
    return `SALE_REPORT_NGAY_${exportDateFrom.value || 'ALL'}_DEN_${exportDateTo.value || 'ALL'}`
  }
  if (exportTimeMode.value === 'month') {
    if (!exportMonthFrom.value && !exportMonthTo.value) return 'SALE_REPORT_ALL'
    return `SALE_REPORT_THANG_${exportMonthFrom.value || 'ALL'}_DEN_${exportMonthTo.value || 'ALL'}`
  }
  if (exportTimeMode.value === 'year') {
    if (!exportYearFrom.value && !exportYearTo.value) return 'SALE_REPORT_ALL'
    return `SALE_REPORT_NAM_${exportYearFrom.value || 'ALL'}_DEN_${exportYearTo.value || 'ALL'}`
  }
  return 'SALE_REPORT'
})

async function doExport() {
  if (exporting.value) return
  exporting.value = true

  try {
    const monthRows = exportRecords.value
    if (!monthRows.length) { alert('Không có dữ liệu để xuất'); return }

    // Load template
    const resp = await fetch('/template_excel/SALE_REPORT_TEMPLATE.xlsx')
    const buf = await resp.arrayBuffer()
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(buf)
    const ws = wb.worksheets[0]

    // Update title row
    ws.getCell('A1').value = exportTitle.value.replace(/_/g, ' ')

    // Get header style from row 2 for data cells
    const borderStyle: Partial<ExcelJS.Borders> = {
      left: { style: 'thin' as const, color: { argb: 'FF000000' } },
      right: { style: 'thin' as const, color: { argb: 'FF000000' } },
      top: { style: 'thin' as const, color: { argb: 'FF000000' } },
      bottom: { style: 'thin' as const, color: { argb: 'FF000000' } }
    }
    const dataFont: Partial<ExcelJS.Font> = { name: 'Arial', size: 11 }
    const dataAlign: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true }
    const moneyFmt = '#,##0'
    const pctFmtEx = '0.00%'

    // Fill data rows starting from row 3
    monthRows.forEach((r, idx) => {
      const rowNum = idx + 3
      const dsb = doanhSoBan(r)
      const gm = giaMua(r)
      const tcp = tongCP(r)
      const gc = grossCom(r)
      const t25 = thue(r)
      const nc = netCom(r)
      const np = netPO(r)
      const nm = netMargin(r)
      const nmPct = np !== 0 ? nm / np : 0
      const ncPct = np !== 0 ? nc / np : 0

      const vals: any[] = [
        idx + 1,                        // STT
        r.MST || '',                    // MST
        r.So_PO || '',                  // PO
        r.account_manager_name || '',   // AM
        getMonth(r.created_time) || '', // Mon
        r.Ten_cong_ty || '',            // Customer
        r.content_of_contract_PO || '', // Content
        r.Ten_nha_cung_cap || '',       // Product type
        dsb,                            // Doanh số bán
        gm,                             // Giá mua
        tcp,                            // Tổng CP đơn hàng
        gc,                             // Gross com
        t25,                            // Thuế 25%
        nc,                             // Net com
        np,                             // Net PO
        nm,                             // Net Margin
        nmPct,                          // Net Margin / Net PO
        ncPct,                          // Net com / Net PO
        r.ghi_chu || ''                 // Note
      ]

      const row = ws.getRow(rowNum)
      vals.forEach((v, ci) => {
        const cell = row.getCell(ci + 1)
        cell.value = v
        cell.border = borderStyle
        cell.font = { ...dataFont }
        cell.alignment = { ...dataAlign }

        // Number formatting
        if (ci >= 8 && ci <= 15) {
          cell.numFmt = moneyFmt
        }
        if (ci === 16 || ci === 17) {
          cell.numFmt = pctFmtEx
        }
      })
      row.commit()
    })

    // Auto-fit columns
    for (let i = 1; i <= 19; i++) {
      let maxLen = 0;
      const col = ws.getColumn(i);
      col.eachCell({ includeEmpty: false }, cell => {
        if (Number(cell.row) >= 2 && cell.value !== null && cell.value !== undefined) {
          const valStr = String(cell.value);
          const lines = valStr.split('\n');
          for (const line of lines) {
            maxLen = Math.max(maxLen, line.length);
          }
        }
      });
      col.width = Math.min(50, Math.max(10, maxLen + 2));
    }

    // Generate & download
    const outBuf = await wb.xlsx.writeBuffer()
    const blob = new Blob([outBuf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportTitle.value}.xlsx`
    a.click()
    URL.revokeObjectURL(url)

    showExportModal.value = false
  } catch (e: any) {
    console.error('Lỗi xuất Excel:', e)
    alert('❌ Lỗi xuất Excel: ' + e.message)
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.sr-page {
  font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
  padding: 24px;
  background: radial-gradient(circle at 0% 5%, rgba(30, 120, 180, 0.18) 0%, transparent 45%), #09090b;
  min-height: 100vh;
  color: #f8fafc;
}

/* Header */
.sr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.sr-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sr-title-group svg { color: #38bdf8; }
.sr-title-group h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #f8fafc, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}
.sr-badge {
  background: rgba(56,189,248,0.15);
  color: #38bdf8;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(56,189,248,0.2);
}

.sr-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  font-family: inherit;
}
.sr-btn-refresh {
  background: #18181b;
  color: #a1a1aa;
  border: 1px solid #3f3f46;
}
.sr-btn-refresh:hover { background: #27272a; border-color: #52525b; color: #f4f4f5; }
.sr-btn-export {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(14,165,233,.25);
}
.sr-btn-export:hover { background: linear-gradient(135deg, #0284c7, #0369a1); box-shadow: 0 6px 16px rgba(14,165,233,.4); }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Filters */
.sr-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.sr-filter-item { display: flex; flex-direction: column; gap: 6px; }
.sr-filter-item label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: .05em;
}
.sr-filter-item input,
.sr-filter-item select {
  padding: 8px 14px;
  border: 1px solid #334155;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: #0f172a;
  color: #f8fafc;
  min-width: 160px;
  transition: all .2s;
}
.sr-filter-item input:focus,
.sr-filter-item select:focus {
  border-color: #38bdf8;
  outline: none;
  box-shadow: 0 0 0 3px rgba(56,189,248,.15);
}

.elite-mode-tabs {
  display: flex;
  background: rgba(15,23,42,0.6);
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  padding: 2px;
  height: 35px;
}
.elite-mode-tabs button {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.elite-mode-tabs button:hover {
  color: #e2e8f0;
}
.elite-mode-tabs button.active {
  background: #3b82f6;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Cards Layout */
.sr-card-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}
.sr-record-card {
  background: linear-gradient(135deg, rgba(0, 61, 77, 0.4) 0%, rgba(0, 201, 150, 0.05) 30%, rgba(15, 23, 34, 0.75) 100%) !important;
  border: 2px solid rgba(255, 255, 255, 0.08) !important;
  border-top: 2px solid rgba(255, 255, 255, 0.18) !important;
  border-left: 2px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 20px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5);
  overflow: hidden;
  transition: all 0.35s ease;
}
.sr-record-card:hover {
  transform: translateY(-4px) scale(1.015);
  filter: brightness(1.1);
  box-shadow: 0 12px 32px -4px rgba(56, 189, 248, 0.25), inset 0 1px 2px rgba(255,255,255,0.1) !important;
  border-color: rgba(56, 189, 248, 0.4) !important;
}
.sr-rc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: transparent;
}
.sr-rc-left { display: flex; flex-direction: column; gap: 4px; }
.sr-rc-po { font-size: 13px; font-weight: 800; color: #ffffff; background: #10b981; padding: 2px 10px; border-radius: 12px; align-self: flex-start; border: 1px solid #059669; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3); }
.sr-rc-customer { margin: 6px 0 2px 0; font-size: 18px; font-weight: 700; color: #f8fafc; word-break: break-word; white-space: normal; }
.sr-rc-date { font-size: 12px; color: #64748b; font-weight: 500; }
.sr-rc-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.sr-btn-edit-rc {
  display: inline-flex; align-items: center; gap: 6px;
  background: #1e293b; border: 1px solid #334155;
  color: #e2e8f0; padding: 6px 12px; border-radius: 6px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.sr-btn-edit-rc:hover { background: #334155; border-color: #475569; color: #ffffff; }

.sr-rc-body {
  display: flex;
  gap: 24px;
  padding: 20px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
  background: transparent;
}
.sr-rc-meta-wrapper {
  flex: 1;
}
.sr-rc-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.sr-meta-item { display: flex; flex-direction: column; gap: 6px; }
.sr-meta-item label { font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
.sr-meta-item span { font-size: 14px; color: #94a3b8; font-weight: 500; }
.sr-meta-item.wide { grid-column: 1 / -1; }
.sr-meta-item .highlight-text { color: #f8fafc; font-weight: 600; }
.sr-meta-item .badge-blue { background: rgba(56,189,248,0.1); color: #38bdf8; padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(56,189,248,0.2); display: inline-block; width: max-content; font-size: 12px; font-weight: 600;}
.sr-meta-item .content-text { color: #e2e8f0; font-size: 15px; font-weight: 500; line-height: 1.5; }

.sr-rc-image-preview {
  width: 240px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #020617;
  border: 1px solid #1e293b;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}
.sr-rc-image-preview:hover {
  border-color: #38bdf8;
  box-shadow: 0 0 0 1px #38bdf8, 0 10px 20px rgba(0,0,0,0.4);
  transform: translateY(-4px);
}
.sr-rc-image-preview a {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}
.sr-rc-image-preview img {
  width: 100%;
  height: 100%;
  max-height: 140px;
  object-fit: contain;
  border-radius: 8px;
  transition: opacity 0.3s;
}
.sr-rc-image-preview:hover img {
  opacity: 0.4;
}
.img-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  color: #fff;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(2,132,199,0.9);
  padding: 14px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sr-rc-image-preview:hover .img-overlay {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

.sr-rc-finance {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  background: transparent;
}
.sr-fin-col {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}
.sr-fin-col:last-child { border-right: none; }
.sr-fin-row { display: flex; justify-content: space-between; align-items: center; }
.sr-fin-row-clickable {
  cursor: pointer;
  padding: 4px 8px;
  margin: -4px -8px;
  border-radius: 6px;
  transition: all 0.2s;
}
.sr-fin-row-clickable:hover {
  background: rgba(56, 189, 248, 0.1);
}
.fin-lbl { font-size: 13px; color: #ffffff; font-weight: 700; display: flex; align-items: center; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
.fin-lbl small { font-size: 11px; opacity: 0.8; margin-left: 6px; background: #1e293b; padding: 2px 6px; border-radius: 4px; color: #cbd5e1;}
.fin-val { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600; color: #f8fafc; }

.highlight-col { background: rgba(56, 189, 248, 0.03); }
.text-green { color: #10b981 !important; text-shadow: 0 0 10px rgba(16,185,129,0.3); }
.text-red { color: #f43f5e !important; text-shadow: 0 0 10px rgba(244,63,94,0.3); }

.sr-rc-footer {
  padding: 12px 20px;
  background: rgba(245, 158, 11, 0.1);
  border-top: 1px solid rgba(245, 158, 11, 0.2);
  font-size: 13px;
  color: #fbbf24;
}

.sr-total-card {
  background: linear-gradient(135deg, rgba(0, 61, 77, 0.5) 0%, rgba(0, 201, 150, 0.08) 30%, rgba(15, 23, 34, 0.85) 100%) !important;
  border: 2px solid rgba(255, 255, 255, 0.08) !important;
  border-top: 2px solid rgba(255, 255, 255, 0.18) !important;
  border-left: 2px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 20px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
  margin-top: 10px;
  color: #f8fafc;
}
.sr-tc-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sr-tc-header h3 { margin: 0; font-size: 18px; color: #38bdf8; font-weight: 700; text-shadow: 0 0 10px rgba(56,189,248,0.3); }
.sr-tc-header span { background: #1e293b; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; color: #94a3b8; border: 1px solid #334155; }
.sr-total-card .sr-rc-finance { background: transparent; }
.sr-total-card .sr-fin-col { border-color: #1e293b; }
.sr-total-card .fin-lbl { color: #ffffff; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
.sr-total-card .fin-lbl small { background: #0f172a; color: #94a3b8; border: 1px solid #1e293b; }
.sr-total-card .fin-val { color: #ffffff; font-size: 17px; }
.sr-total-card .highlight-col { background: rgba(16, 185, 129, 0.05); }
.sr-total-card .text-green { color: #10b981 !important; text-shadow: 0 0 15px rgba(16,185,129,0.4); }
.sr-total-card .text-red { color: #f43f5e !important; text-shadow: 0 0 15px rgba(244,63,94,0.4); }
.sr-total-card .text-red { color: #f87171 !important; }

/* ─── Edit Modal ─── */
.sr-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2,6,23,.75);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
@keyframes shimmerBorder {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.sr-modal {
  background: #020617;
  border-radius: 16px;
  width: 420px;
  max-width: 92vw;
  box-shadow: 0 25px 60px rgba(0,0,0,.5);
  animation: slideUp .25s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  border: none;
}
.sr-modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-bottom: 1px solid rgba(56,189,248,.15);
  color: #f8fafc;
  position: relative;
}
.sr-modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56,189,248,.4), transparent);
}
.sr-modal-icon {
  width: 42px; height: 42px;
  border-radius: 12px;
  background: rgba(56,189,248,.1);
  border: 1px solid rgba(56,189,248,.25);
  display: flex; align-items: center; justify-content: center;
  color: #38bdf8;
  flex-shrink: 0;
}
.sr-modal-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #f8fafc, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sr-modal-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sr-modal-close {
  position: absolute;
  right: 20px; top: 20px;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
  width: 32px; height: 32px; border-radius: 8px;
  color: #94a3b8; font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; line-height: 1;
  transition: all .2s;
}
.sr-modal-close:hover { color: #f8fafc; background: rgba(244,63,94,.15); border-color: rgba(244,63,94,.3); }

.sr-modal-body {
  padding: 24px 20px;
}
.sr-form-group { margin-bottom: 16px; }
.sr-form-group:last-child { margin-bottom: 0; }
.sr-modal-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: 8px;
}
.sr-modal-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(15,23,42,.8);
  border: 1px solid #334155;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  color: #e2e8f0;
  outline: none;
  transition: all .2s;
  box-sizing: border-box;
}
.sr-modal-input.text-left { text-align: left !important; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; }
.sr-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.sr-modal-divider { border: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(56,189,248,.2), transparent); margin: 12px 0 20px 0; }
.sr-calc-preview {
  display: flex;
  gap: 12px;
  background: transparent;
  border: none;
  padding: 0;
  margin-top: 20px;
}
.sr-calc-item {
  flex: 1;
  background: rgba(15,23,42,.6);
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.sr-calc-item span { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
.sr-calc-item strong { font-size: 16px; color: #f8fafc; font-family: 'JetBrains Mono', monospace; }
.sr-calc-item.highlight { background: rgba(16,185,129,.08); border-color: rgba(16,185,129,.2); }
.sr-calc-item.highlight span { color: #34d399; }
.sr-calc-item.highlight strong { color: #22c55e; }
.sr-modal-large { width: 1920px !important; max-width: 96vw; }
.sr-import-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.03);
  overflow: hidden;
  position: relative;
}
.sr-import-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
  background-size: 200% 100%;
  animation: shimmerBorder 3s linear infinite;
}
.sr-import-card-header {
  background: linear-gradient(135deg, rgba(30,41,59,.8), rgba(15,23,42,.8));
  padding: 14px 20px;
  border-bottom: 1px solid #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sr-import-card-header h4 { margin: 0; font-size: 14px; color: #e2e8f0; font-weight: 600; }
.sr-btn-remove { background: rgba(239,68,68,.1); color: #f87171; border: 1px solid rgba(239,68,68,.25); padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
.sr-btn-remove:hover { background: rgba(239,68,68,.2); border-color: rgba(239,68,68,.4); }
.sr-import-card-body { padding: 20px; }
.sr-modal-label { color: #94a3b8; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; }
.sr-modal-input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56,189,248,.15);
  background: rgba(15,23,42,1);
}
.sr-modal-preview {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
}

.sr-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #1e293b;
  background: linear-gradient(135deg, #0f172a, #020617);
}
.sr-btn-cancel {
  background: rgba(255,255,255,.05);
  color: #94a3b8;
  border: 1px solid #334155;
}
.sr-btn-cancel:hover { background: rgba(255,255,255,.1); color: #e2e8f0; border-color: #475569; }
.sr-btn-save {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(14,165,233,.35), 0 0 20px rgba(14,165,233,.1);
}
.sr-btn-save:hover:not(:disabled) { background: linear-gradient(135deg, #38bdf8, #0ea5e9); box-shadow: 0 6px 20px rgba(14,165,233,.45); }
.sr-btn-save:disabled { opacity: .5; cursor: not-allowed; }

/* Export month grid */
.sr-export-months {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.sr-month-btn {
  padding: 10px 4px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
}
.sr-month-btn:hover {
  border-color: #22c55e;
  background: #ecfdf5;
  color: #22c55e;
}
.sr-month-btn.active {
  border-color: #22c55e;
  background: #10b981;
  color: #fff;
  box-shadow: 0 2px 8px rgba(16,185,129,.3);
}
.sr-export-preview {
  padding: 10px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.cell-note { color: #64748b; font-size: 11.5px; }

/* Total row */
.sr-total-row {
  background: linear-gradient(135deg, #fef9c3, #fef3c7) !important;
}
.sr-total-row td {
  padding: 10px 10px;
  border-top: 2px solid #f59e0b;
  font-weight: 700;
  font-size: 12.5px;
}
.sr-total-row .cell-money { color: #92400e; }

/* States */
.sr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #64748b;
}
.sr-spinner {
  width: 32px; height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.sr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 20px;
  color: #94a3b8;
}
.sr-empty p { margin: 0; font-size: 14px; }

/* Tabs inside Modal */
.sr-tabs {
  display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 0;
  background: rgba(15,23,42,.5); border-radius: 8px 8px 0 0; padding: 4px;
}
.sr-tab-btn {
  background: transparent; border: none; padding: 10px 20px; font-weight: 600; cursor: pointer; font-size: 13px; border-radius: 6px; transition: all 0.2s; color: #64748b; position: relative; flex: 1; text-align: center;
}
.sr-tab-btn:hover { color: #cbd5e1; background: rgba(255,255,255,.04); }
.sr-tab-btn.active { color: #38bdf8; background: rgba(56,189,248,.1); border: 1px solid rgba(56,189,248,.2); box-shadow: 0 0 12px rgba(56,189,248,.1); }
.sr-tab-btn.active::after { display: none; }

/* Modal Finance Grid */
.sr-modal-finance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  background: rgba(15,23,42,.6);
  border: 1px solid #1e293b;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
}
.sr-modal-fin-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-right: 1px solid #1e293b;
}
.sr-modal-fin-col:last-child {
  border-right: none;
}
.sr-modal-fin-col.highlight-col {
  background: rgba(16,185,129,.04);
}
@media (max-width: 768px) {
  .sr-modal-fin-col { border-right: none; border-bottom: 1px solid #1e293b; }
  .sr-modal-fin-col:last-child { border-bottom: none; }
}

/* ELITE CSS IMPORTED FROM REPORT.VUE */
.elite-voice-btn {
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.elite-voice-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
}

.elite-voice-btn.is-recording {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  animation: pulse-recording 1.5s infinite;
}

.elite-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  animation: fadeIn 0.2s ease forwards;
}

.elite-modal {
  background: white;
  width: calc(100% - 2rem);
  max-width: 680px;
  max-height: 95vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex;
  flex-direction: column;
}

.elite-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem 1.25rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  background: linear-gradient(180deg, rgba(248,250,252,0.6) 0%, white 100%);
}

.elite-modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.elite-modal-title svg {
  color: #4f46e5;
}

.elite-modal-title h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.elite-btn-close {
  background: #f1f5f9;
  color: #64748b;
  padding: 0.5rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
}

.elite-btn-close:hover {
  background: #e2e8f0;
  color: #0f172a;
  transform: rotate(90deg);
}

.elite-modal-body {
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.elite-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.elite-form-row {
  display: flex;
  gap: 1.25rem;
}

.elite-form-row .elite-form-group {
  flex: 1;
}

.elite-form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.elite-quote-btn {
  background: #10b981;
  color: white;
  border: 1px solid #059669;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 2px 6px -1px rgba(16, 185, 129, 0.2);
}

.elite-quote-btn:hover {
  background: #059669;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.4);
}

.elite-quick-times {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.elite-quick-btn {
  flex: 1;
  background: #0d3b3f;
  color: #4ade80;
  border: 1.5px solid #14532d;
  padding: 0.6rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.elite-quick-btn:hover {
  background: #0a4d52;
  border-color: #22c55e;
  color: #86efac;
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.2);
}

.elite-quick-btn.active {
  background: #052e16;
  color: #4ade80;
  border-color: #16a34a;
  box-shadow: 0 4px 12px -2px rgba(16, 163, 74, 0.35);
}

.elite-quick-btn.active svg {
  color: #4ade80;
}

.elite-time-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
  justify-content: center;
}

.elite-select-mini {
  appearance: none;
  background: transparent;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  padding: 0.2rem 0.5rem;
  text-align: center;
  cursor: pointer;
  outline: none;
  border-radius: 6px;
  min-width: 50px;
}

.elite-select-mini:hover, .elite-select-mini:focus {
  background: white;
  box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
}

.elite-status-toggle {
  display: flex;
  gap: 0.4rem;
  background: #f1f5f9;
  padding: 0.35rem;
  border-radius: 12px;
}

.elite-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
}

.elite-btn-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.elite-btn-cancel:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.elite-btn-primary {
  padding: 0.75rem 1.75rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  border: none;
  box-shadow: 0 4px 12px -2px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.elite-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -2px rgba(79, 70, 229, 0.4);
}

.elite-btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.1);
  border: 1.5px solid rgba(79, 70, 229, 0.2);
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.elite-btn-secondary:hover {
  background: rgba(79, 70, 229, 0.15);
}

.elite-btn-cancel { order: 3; color: #ef4444; }

.elite-btn-cancel:hover { background: #fee2e2; color: #dc2626; }

.elite-btn-secondary:hover:not(:disabled) {
  background: rgba(79, 70, 229, 0.15);
  border-color: rgba(79, 70, 229, 0.3);
  transform: translateY(-1px);
}

.elite-btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.elite-select-group label {
  font-size: 0.65rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.2px;
}

.elite-active { border-color: #60a5fa !important; box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important; background: rgba(96, 165, 250, 0.12) !important; }

.elite-active::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 16px 16px 0; border-color: transparent #60a5fa transparent transparent; }

.elite-active { border-color: #fbbf24 !important; box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.2) !important; background: rgba(251, 191, 36, 0.12) !important; }

.elite-active::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 16px 16px 0; border-color: transparent #fbbf24 transparent transparent; }

.elite-active { border-color: #34d399 !important; box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.2) !important; background: rgba(52, 211, 153, 0.12) !important; }

.elite-active::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 16px 16px 0; border-color: transparent #34d399 transparent transparent; }

.elite-filter-panel {
  position: relative;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 8px 32px -4px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  z-index: 10;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.elite-filter-panel:hover {
  box-shadow:
    0 16px 48px -8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.elite-filter-accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981 0%, #34d399 40%, #6ee7b7 70%, #a7f3d0 100%);
  border-radius: 20px 20px 0 0;
}

.elite-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem 0;
}

.elite-filter-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.elite-filter-title svg { color: #22c55e; }

.elite-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(52, 211, 153, 0.08) 100%);
  color: #22c55e;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.12);
  transition: all 0.25s ease;
}

.elite-refresh-btn:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.2);
}

.elite-filter-body {
  padding: 1.25rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.elite-filter-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: nowrap;
}

.elite-mode-tabs {
  display: flex;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 4px;
  gap: 3px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}

.elite-mode-tabs button {
  padding: 0.5rem 1.4rem;
  border-radius: 9px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: none;
}

.elite-mode-tabs button.active {
  background: #0f172a;
  color: #34d399;
  box-shadow: 0 2px 8px -1px rgba(15, 23, 42, 0.4), 0 1px 2px rgba(15, 23, 42, 0.2);
}

.elite-mode-tabs button:hover:not(.active) {
  color: #334155;
  background: rgba(255, 255, 255, 0.5);
}

.elite-date-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 120px;
  flex: 1;
}

.elite-date-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0;
}

.elite-input {
  width: 100%;
  padding: 0.6rem 1.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.875rem;
  color: #1e293b;
  background: rgba(248, 250, 252, 0.8);
  transition: all 0.25s ease;
  box-sizing: border-box;
  font-weight: 500;
}

.elite-input:focus {
  border-color: #34d399;
  background: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08), 0 2px 8px -2px rgba(16, 185, 129, 0.12);
}

.elite-range-sep {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: #22c55e;
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.6;
}

.elite-select-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 150px;
  flex: 1;
}

.elite-select-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0;
}

.elite-select {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 1.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.875rem;
  color: #1e293b;
  background: rgba(248, 250, 252, 0.8);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 14px;
  transition: all 0.25s ease;
  box-sizing: border-box;
  font-weight: 500;
}

.elite-select:focus {
  border-color: #34d399;
  background-color: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08), 0 2px 8px -2px rgba(16, 185, 129, 0.12);
}

.elite-select option {
  background-color: #0f172a; /* Nền xanh đậm */
  color: #22c55e; /* Chữ xanh lá cây */
  font-weight: 600;
  padding: 8px;
}

.elite-filter-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 30%, #e2e8f0 70%, transparent 100%);
}

.elite-table-container {
  background: white;
  border-radius: 20px;
  box-shadow:
    0 8px 32px -4px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.elite-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid #d1fae5;
  background: linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 50%, white 100%);
  position: relative;
}

.elite-table-scroll { overflow-x: auto; }

.elite-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.elite-table thead tr {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%);
}

.elite-table th {
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
  position: relative;
}

.elite-table th:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0; top: 28%; height: 44%;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.elite-table .elite-row {
  animation: fadeIn 0.4s ease forwards;
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.elite-table .elite-row:nth-child(1) { animation-delay: 0.03s; }

.elite-table .elite-row:nth-child(2) { animation-delay: 0.06s; }

.elite-table .elite-row:nth-child(3) { animation-delay: 0.09s; }

.elite-table .elite-row:nth-child(4) { animation-delay: 0.12s; }

.elite-table .elite-row:nth-child(5) { animation-delay: 0.15s; }

.elite-table .elite-row:nth-child(6) { animation-delay: 0.18s; }

.elite-table .elite-row:nth-child(7) { animation-delay: 0.21s; }

.elite-table .elite-row:nth-child(8) { animation-delay: 0.24s; }

.elite-table .elite-row:nth-child(odd) {
  background: rgba(16, 185, 129, 0.04);
}

.elite-table .elite-row:hover {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 50%, transparent 100%);
  box-shadow: inset 4px 0 0 #10b981;
}

.elite-table .elite-row:hover td:first-child {
  padding-left: calc(1.5rem + 4px);
}

.elite-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.9rem;
  color: #334155;
  transition: padding 0.2s ease;
}

.elite-table .elite-row:last-child td { border-bottom: none; }

.elite-row:hover .row-index {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #22c55e;
}

.elite-time-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.elite-time-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.elite-time-hm {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
  font-feature-settings: 'tnum';
  letter-spacing: 0.02em;
}

.elite-time-thu {
  color: #22c55e;
  font-weight: 600;
  font-size: 0.7rem;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  letter-spacing: 0.02em;
}

.elite-time-period {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.elite-time-period.is-morning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.elite-time-period.is-afternoon {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.elite-time-date {
  font-size: 0.78rem;
  color: #047857;
  font-weight: 600;
  font-feature-settings: 'tnum';
}

.elite-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  margin-left: 0.35rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
}

.elite-action-btn.success {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 6px -1px rgba(16, 185, 129, 0.3);
}

.elite-action-btn.success:hover {
  background: #059669;
  transform: scale(1.08);
  box-shadow: 0 4px 10px -2px rgba(16, 185, 129, 0.5);
}

.elite-action-btn.delete {
  background: #ef4444;
  color: white;
  box-shadow: 0 2px 6px -1px rgba(239, 68, 68, 0.3);
}

.elite-action-btn.delete:hover {
  background: #dc2626;
  transform: scale(1.08);
  box-shadow: 0 4px 10px -2px rgba(239, 68, 68, 0.5);
}

.elite-filter-panel {
    border-radius: 12px;
  }

.elite-filter-header {
    padding: 0.75rem 1rem 0;
  }

.elite-filter-header .elite-filter-title span {
    font-size: 0.85rem;
  }

.elite-filter-body {
    padding: 0.75rem 1rem 1rem;
    gap: 0.6rem;
  }

.elite-filter-divider {
    margin: 0.25rem 0;
  }

.elite-filter-row {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.5rem;
  }

.elite-mode-tabs {
    width: 100%;
  }

.elite-mode-tabs button {
    flex: 1;
    justify-content: center;
    padding: 0.45rem 0.5rem;
    font-size: 0.8rem;
  }

.elite-date-group {
    flex: 1;
    min-width: 0;
    max-width: none;
  }

.elite-date-group.group-tabs {
    flex: 1 1 65% !important;
    grid-column: 1 / -1 !important;
  }

.elite-date-group.group-period {
    order: 0;
    flex: 1 1 25% !important;
    max-width: none !important;
  }

.elite-date-group.group-date {
    flex: 1 1 100% !important;
    margin-bottom: 0.2rem;
  }

.elite-date-group label {
    font-size: 0.75rem;
    margin-bottom: 0.35rem;
    color: #f8fafc !important;
  }

.elite-date-group .elite-input {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    width: 100%;
    box-sizing: border-box;
  }

.elite-range-sep {
    display: none !important;
  }

.elite-filter-row:last-child {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

.elite-select-group {
    min-width: 0;
  }

.elite-select-group label {
    font-size: 0.7rem;
    margin-bottom: 0.15rem;
  }

.elite-modal-overlay {
    justify-content: flex-start !important;
    align-items: stretch !important;
  }

.elite-modal {
    width: 100vw !important;
    max-width: 100% !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100vh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    margin: 0 !important;
    animation: slideRightMobile 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  }

.elite-modal-header {
    padding: 1rem 1.25rem 0.75rem;
  }

.elite-modal-body {
    padding: 0.8rem 1.25rem 1.25rem;
    padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 40px));
    gap: 0.8rem;
  }

.elite-form-row {
    gap: 0.8rem;
  }

.elite-form-group {
    gap: 0.35rem;
  }

.elite-form-group label {
    font-size: 0.75rem;
    margin-bottom: 0;
  }

.elite-time-picker {
    padding: 0.6rem 0.75rem;
    gap: 0.6rem;
  }

.elite-quick-times {
    margin-bottom: 0.25rem;
    gap: 0.5rem;
  }

.elite-quick-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

.elite-modal-actions {
    margin-top: 0.25rem;
    padding-top: 0.75rem;
  }

.elite-input, .elite-select {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

.elite-filter-panel {
  background: rgba(20, 32, 50, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #f8fafc !important;
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05) !important;
}

.elite-modal {
  background: white !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  color: #0f172a !important;
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.4) !important;
}

.elite-modal.dark-mode-modal {
  background: #1e293b !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: #f8fafc !important;
}

.elite-modal.dark-mode-modal .elite-modal-title h2,
.elite-modal.dark-mode-modal label,
.elite-modal.dark-mode-modal .elite-form-group label,
.elite-modal.dark-mode-modal p {
  color: #f8fafc !important;
}

.elite-modal.dark-mode-modal .elite-input,
.elite-modal.dark-mode-modal .elite-select,
.elite-modal.dark-mode-modal .elite-textarea,
.elite-modal.dark-mode-modal .elite-select-mini {
  background: rgba(15, 23, 42, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
}

.elite-modal.dark-mode-modal .elite-input:focus,
.elite-modal.dark-mode-modal .elite-select:focus,
.elite-modal.dark-mode-modal .elite-textarea:focus {
  border-color: #a855f7 !important;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15) !important;
}

.elite-modal.dark-mode-modal .elite-btn-save {
  background: linear-gradient(135deg, #a855f7, #7e22ce) !important;
  box-shadow: 0 4px 15px -3px rgba(168, 85, 247, 0.5) !important;
}

.elite-modal.dark-mode-modal .elite-btn-save:hover {
  background: linear-gradient(135deg, #9333ea, #6b21a8) !important;
}

.elite-modal.dark-mode-modal .upload-zone {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.elite-modal.dark-mode-modal .upload-zone:hover {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: #a855f7 !important;
}

.elite-modal.dark-mode-modal .elite-modal-title svg {
  color: #a855f7 !important;
}

.elite-modal.dark-mode-modal .elite-modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
  background: rgba(15, 23, 42, 0.4) !important;
}

.elite-modal.dark-mode-modal .elite-btn-cancel {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
}

.elite-modal.dark-mode-modal .elite-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
}

.elite-modal.dark-mode-modal .elite-btn-close {
  color: #94a3b8 !important;
}

.elite-modal.dark-mode-modal .elite-btn-close:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
}

.elite-modal .elite-modal-title h2,
.elite-modal label,
.elite-modal .elite-form-group label,
.elite-modal p {
  color: #1e293b !important;
}

.elite-modal .elite-input,
.elite-modal .elite-select,
.elite-modal .elite-textarea,
.elite-modal .elite-select-mini {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #0f172a !important;
}

.elite-modal .elite-modal-header {
  border-bottom-color: #f1f5f9 !important;
}

.elite-table-toolbar {
  background: transparent !important;
  color: #f8fafc !important;
}

.elite-filter-title, .toolbar-left h3, .kanban-title h3, .elite-modal-title h2, .tl-body-text {
  color: #f8fafc !important;
}

.elite-input, .elite-select, .elite-textarea, .elite-select-mini, .time-picker-wrapper select {
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
}

.elite-input::placeholder, .elite-textarea::placeholder {
  color: #64748b !important;
}

.elite-mode-tabs {
  background: rgba(0, 0, 0, 0.4) !important;
}

.elite-mode-tabs button[style*="background: white"],
.elite-mode-tabs button.active {
  background: #ffffff !important;
  color: #065f46 !important;
  font-weight: 800 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
}

.elite-mode-tabs button {
  color: #94a3b8 !important;
}

.elite-form-group label {
  color: #cbd5e1 !important;
}

.elite-quick-btn {
  background: #f1f5f9 !important;
  color: #64748b !important;
  border-color: #e2e8f0 !important;
}

.elite-quick-btn.active {
  background: #0d3b3f !important;
  color: #4ade80 !important;
  border-color: #16a34a !important;
  box-shadow: 0 4px 12px -2px rgba(16, 163, 74, 0.35) !important;
}

.elite-quick-note,
.tl-rect-note,
.delete-confirm-modal {
  background: rgba(13, 20, 30, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
}

.elite-label,
.elite-form-group label,
.elite-modal-title h2,
.elite-modal-title p,
.delete-title,
.delete-desc,
.toolbar-left h3,
.record-meta span,
.tl-body-text,
.tl-date,
.tl-time,
.tl-thu-period,
.tl-stt {
  color: #e2e8f0 !important;
}

.elite-input,
.elite-select,
.elite-textarea {
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: #f1f5f9 !important;
}
/* Fintech Dashboard */
.fintech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.fintech-card {
  position: relative;
  background: linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fintech-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.12);
}
.fintech-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  opacity: 0.6;
}
.fintech-card.primary::before { background: linear-gradient(90deg, transparent, #38bdf8, transparent); }
.fintech-card.success::before { background: linear-gradient(90deg, transparent, #34d399, transparent); }
.fintech-card.warning::before { background: linear-gradient(90deg, transparent, #fbbf24, transparent); }
.fintech-card.danger::before { background: linear-gradient(90deg, transparent, #f87171, transparent); }
.fintech-card.ratio {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(16, 185, 129, 0.1);
}
.fintech-card.ratio::before { background: linear-gradient(90deg, transparent, #10b981, transparent); }
.fintech-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;
}
.fintech-title {
  color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
}
.fintech-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.fintech-icon.primary { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
.fintech-icon.success { background: rgba(52, 211, 153, 0.1); color: #34d399; }
.fintech-icon.warning { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
.fintech-icon.danger { background: rgba(248, 113, 113, 0.1); color: #f87171; }
.fintech-icon.ratio { background: rgba(16, 185, 129, 0.1); color: #22c55e; }

.fintech-val {
  font-size: 24px; font-weight: 800; color: #f8fafc; font-family: 'Inter', sans-serif;
  letter-spacing: -0.5px; display: flex; align-items: baseline; gap: 4px;
}
.fintech-val.green { color: #4ade80; }
.fintech-val.red { color: #f87171; }
.fintech-currency { font-size: 14px; font-weight: 600; color: #64748b; }
.fintech-glow {
  position: absolute; bottom: -30px; right: -30px; width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.fintech-card.primary .fintech-glow { background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%); }
.fintech-card.success .fintech-glow { background: radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%); }
.fintech-card.danger .fintech-glow { background: radial-gradient(circle, rgba(248,113,113,0.1) 0%, transparent 70%); }
.fintech-card.ratio .fintech-glow { background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%); }

.fintech-trend {
  display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; margin-top: 16px; padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.05); color: #94a3b8;
}
.fintech-trend.up { color: #4ade80; }
.fintech-trend.down { color: #f87171; }
.fintech-trend svg { width: 14px; height: 14px; }
.fintech-trend span:last-child { color: #64748b; font-weight: 500; font-size: 12px; }

/* Desktop Toolbar */
.sr-toolbar-bottom {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
  width: 100%;
}
.toolbar-left-buttons { justify-self: start; }
.center-filter { width: 400px; justify-self: center; }
.toolbar-right-filters { justify-self: end; }

/* Mobile Toolbar */
@media (max-width: 1100px) {
  .sr-toolbar-bottom {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .toolbar-left-buttons, .center-filter, .toolbar-right-filters {
    justify-self: auto;
  }
  .center-filter { width: 100%; }
  .toolbar-left-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  .toolbar-left-buttons > button {
    flex: 1 1 calc(33.333% - 8px);
    min-width: 100px;
    padding: 0 4px !important;
    font-size: 12px !important;
    justify-content: center;
  }
}


.sr-tab-btn {
    background: transparent; color: #94a3b8; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-transform: uppercase;
  }
.sr-tab-btn:hover {
  color: #f8fafc; background: rgba(51, 65, 85, 0.5);
}
.sr-tab-btn.active {
    background: rgba(16, 185, 129, 0.15); color: #22c55e; border: 1px solid rgba(16, 185, 129, 0.2); cursor: default; pointer-events: none;
  }
.no-anim {
  animation: none !important;
  transition: none !important;
}
@media (max-width: 768px) {
  
}

@media (max-width: 768px) {
  .sr-modal-body > div[style*="flex-wrap: wrap"] > div {
    min-width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .sr-modal-large {
    width: 100% !important;
    max-width: 100% !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
  .sr-modal-overlay {
    padding: 0 !important;
  }
  .sr-modal-large .sr-modal-header {
    border-radius: 0 !important;
    padding: 16px !important;
  }
  .sr-modal-large .sr-modal-body {
    padding: 16px !important;
    overflow-y: auto !important;
    flex: 1 !important;
  }
}

.sr-modal-center-block {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

@media (max-width: 768px) {
  .sr-modal-large .sr-modal-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    position: relative !important;
    gap: 12px !important;
  }
  .sr-modal-center-block {
    position: static !important;
    transform: none !important;
    width: 100% !important;
    align-items: flex-start !important;
  }
  .sr-btn-close {
    position: absolute !important;
    top: 16px !important;
    right: 16px !important;
  }
  
  /* Make the tabs scrollable horizontally if they exceed width */
  .sr-modal-tabs {
    flex-wrap: wrap !important;
    justify-content: flex-start !important;
    width: 100% !important;
  }
}

@media (max-width: 768px) {
  .chart-wrapper-mobile {
    position: relative !important;
    min-width: 100% !important;
    height: 350px !important;
    overflow-x: auto !important;
  }
  .chart-wrapper-mobile canvas {
    max-width: 100% !important;
    max-height: 100% !important;
  }
}

@media (max-width: 768px) {
  .modal-pie-container {
    min-width: 100% !important;
    max-width: 100% !important;
  }
  .modal-bar-container {
    min-width: 100% !important;
    max-width: 100% !important;
  }
  .modal-chart-main-container {
    min-width: 100% !important;
    max-width: 100% !important;
  }
}

.custom-scrollbar {
  overflow-x: auto;
}
@media (max-width: 768px) {
  .custom-scrollbar { overflow-x: auto !important; }
}

@media (max-width: 768px) {
  .sr-card-list {
    grid-template-columns: 1fr !important;
  }
}
</style>





