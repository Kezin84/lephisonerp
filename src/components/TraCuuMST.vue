<template>
  <div class="mst-page-wrapper">
    <div class="mst-container">
      <div class="header-section">
        <h2>Tra cứu Thông tin Doanh nghiệp</h2>
      </div>

      <div class="search-card">
        <div class="search-wrapper">
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="mstInput" 
              placeholder="Nhập mã số thuế (vd: 0101243150)" 
              @keyup.enter="searchMST"
              class="mst-input"
            />
          </div>
          <button class="btn-search" @click="searchMST" :disabled="loading || !mstInput.trim()">
            <span v-if="loading" class="spinner-small"></span>
            <span v-else>Tra cứu ngay</span>
          </button>
        </div>
        <transition name="slide-fade">
          <div v-if="errorMsg" class="error-msg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {{ errorMsg }}
          </div>
        </transition>
      </div>

      <!-- Kết quả -->
      <transition name="fade">
        <div v-if="result" class="result-card">
          <h3 class="company-name">{{ result.name }}</h3>
          
          <table class="info-table">
            <tbody>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                  Mã số thuế
                </td>
                <td class="value-cell">{{ result.id }}</td>
              </tr>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Địa chỉ Thuế
                </td>
                <td class="value-cell">{{ result.address }}</td>
              </tr>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Địa chỉ
                </td>
                <td class="value-cell">{{ result.address }}</td>
              </tr>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  Tình trạng
                </td>
                <td class="value-cell">{{ result.status || 'Đang hoạt động' }}</td>
              </tr>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  Tên quốc tế
                </td>
                <td class="value-cell">{{ result.internationalName || '---' }}</td>
              </tr>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Người đại diện
                </td>
                <td class="value-cell text-muted">API miễn phí chưa hỗ trợ</td>
              </tr>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Ngày hoạt động
                </td>
                <td class="value-cell text-muted">API miễn phí chưa hỗ trợ</td>
              </tr>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Quản lý bởi
                </td>
                <td class="value-cell text-muted">API miễn phí chưa hỗ trợ</td>
              </tr>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                  Loại hình DN
                </td>
                <td class="value-cell text-muted">API miễn phí chưa hỗ trợ</td>
              </tr>
              <tr>
                <td class="label-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  Ngành nghề chính
                </td>
                <td class="value-cell text-muted">API miễn phí chưa hỗ trợ</td>
              </tr>
            </tbody>
          </table>

        </div>
      </transition>

      <!-- State trống -->
      <transition name="fade">
        <div v-if="!result && !loading && !errorMsg" class="empty-state">
          <div class="illustration-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <h3>Tra cứu nhanh gọn &amp; chính xác</h3>
          <p>Nhập mã số thuế doanh nghiệp vào ô tìm kiếm ở trên để nhận về đầy đủ thông tin pháp lý mới nhất.</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mstInput = ref('')
const loading = ref(false)
const errorMsg = ref('')
const result = ref(null)

const searchMST = async () => {
  if (!mstInput.value.trim()) return
  
  loading.value = true
  errorMsg.value = ''
  result.value = null

  try {
    const response = await fetch(`https://api.vietqr.io/v2/business/${mstInput.value.trim()}`)
    const textData = await response.text()
    
    let data;
    try {
      data = JSON.parse(textData)
    } catch(e) {
      if(response.status === 429 || textData.includes('Too many requests') || textData.includes('rate limit')) {
        errorMsg.value = 'Hệ thống tra cứu đang quá tải (vượt giới hạn truy cập miễn phí). Vui lòng đợi khoảng 1-2 phút rồi thử lại.'
      } else {
        errorMsg.value = 'API tra cứu tạm thời không phản hồi. Vui lòng thử lại sau ít phút.'
      }
      return
    }
    
    if (data.code === '00' && data.data) {
      result.value = data.data
    } else {
      errorMsg.value = data.desc || 'Không tìm thấy thông tin cho mã số thuế này.'
    }
  } catch (err) {
    console.error('Lỗi API Tra cứu MST:', err)
    errorMsg.value = 'Lỗi kết nối mạng hoặc API từ chối truy cập. Vui lòng thử lại sau.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mst-page-wrapper {
  background: #f8f9fa;
  min-height: calc(100vh - 48px);
  padding: 40px 20px;
  font-family: Arial, Helvetica, sans-serif;
}

.mst-container {
  max-width: 900px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 24px;
}

.header-section h2 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.search-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
}

.search-wrapper {
  display: flex;
  gap: 12px;
}

.input-group {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #6c757d;
}

.mst-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1.1rem;
  color: #495057;
  outline: none;
}

.mst-input:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.btn-search {
  padding: 0 32px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1.05rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}

.btn-search:hover:not(:disabled) {
  background: #0069d9;
}

.btn-search:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 6px;
  font-size: 0.95rem;
}

/* Transitions */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.result-card {
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.company-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: #343a40;
  margin-top: 0;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #dee2e6;
  text-transform: uppercase;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table tr {
  border-bottom: 1px solid #f1f3f5;
}

.info-table tr:last-child {
  border-bottom: none;
}

.info-table td {
  padding: 16px 8px;
  vertical-align: middle;
}

.label-cell {
  width: 250px;
  color: #495057;
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 12px;
}

.label-cell svg {
  color: #6c757d;
}

.value-cell {
  color: #212529;
  font-weight: normal;
}

.text-muted {
  color: #adb5bd !important;
  font-style: italic;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.illustration-circle {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  color: #adb5bd;
}

.empty-state h3 {
  font-size: 1.3rem;
  font-weight: bold;
  color: #343a40;
  margin-bottom: 12px;
}

.empty-state p {
  color: #6c757d;
  max-width: 400px;
  line-height: 1.6;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .search-wrapper {
    flex-direction: column;
  }
  .label-cell {
    width: 150px;
  }
}
</style>
