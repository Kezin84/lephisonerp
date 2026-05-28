<template>
  <div class="license-page-wrapper">
    <div class="license-container">
      <div class="header-section">
        <h2>Dữ liệu License Cũ</h2>
        <p class="subtitle">Quản lý và tra cứu thông tin license cũ</p>
      </div>

      <div class="search-card">
        <div class="search-wrapper">
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Tìm kiếm theo Tên khách hàng, License ID, Sản phẩm..." 
              class="license-input"
            />
          </div>
          <button class="btn-search" @click="fetchData" :disabled="loading">
            <span v-if="loading" class="spinner-small"></span>
            <span v-else>Làm mới</span>
          </button>
        </div>
      </div>

      <!-- Bảng Dữ Liệu -->
      <div class="result-card">
        <div class="table-responsive">
          <table class="license-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>LICENSE ID</th>
                <th>KHÁCH HÀNG</th>
                <th>SẢN PHẨM</th>
                <th>LOCALIZATION</th>
                <th>VOLUME</th>
                <th>DESCRIPTION</th>
                <th>DATE OF LICENSE</th>
                <th>EXPIRATION TIME</th>
                <th>TYPE</th>
                <th>CODE</th>
                <th>FILE</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="12" class="text-center" style="padding: 40px;">
                  <div class="spinner-small" style="margin: 0 auto; border-top-color: #007bff;"></div>
                  <div style="margin-top: 10px; color: #6c757d;">Đang tải dữ liệu...</div>
                </td>
              </tr>
              <tr v-else-if="filteredData.length === 0">
                <td colspan="12" class="text-center" style="padding: 40px; color: #6c757d;">
                  Không tìm thấy dữ liệu.
                </td>
              </tr>
              <tr v-else v-for="(item, index) in filteredData" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.LICENSE_ID }}</td>
                <td>{{ item.CUSTOMER }}</td>
                <td>{{ item.PRODUCT_NAME }}</td>
                <td>{{ item.LOCALIZATION }}</td>
                <td>{{ item.LICENSE_VOLUME }}</td>
                <td>{{ item.LICENSE_DESCRIPTION }}</td>
                <td>{{ item.DATE_OF_LICENSE }}</td>
                <td>{{ item.EXPIRATION_TIME }}</td>
                <td>{{ item.LICENSE_TYPE }}</td>
                <td>{{ item.PRODUCT_CODE }}</td>
                <td class="text-center">
                  <a v-if="item.LINK_FILE" :href="item.LINK_FILE" target="_blank" class="link-file" :title="item.NAME_FILE">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

const searchQuery = ref('')
const loading = ref(false)
const rawData = ref([])

const removeDiacritics = (str) => {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

const normalizeForSearch = (str) => {
  if (!str) return '';
  return removeDiacritics(String(str)).toLowerCase().trim();
}

const filteredData = computed(() => {
  if (!searchQuery.value) return rawData.value;
  
  const q = normalizeForSearch(searchQuery.value);
  return rawData.value.filter(item => {
    return (
      (item.CUSTOMER && normalizeForSearch(item.CUSTOMER).includes(q)) ||
      (item.LICENSE_ID && normalizeForSearch(item.LICENSE_ID).includes(q)) ||
      (item.PRODUCT_NAME && normalizeForSearch(item.PRODUCT_NAME).includes(q))
    );
  });
})

const fetchData = async () => {
  loading.value = true;
  try {
    const url = new URL(API_URL);
    url.searchParams.append('sheet', 'license_old_data');
    url.searchParams.append('action', 'get');
    
    const response = await fetch(url.toString());
    const result = await response.json();
    
    if (result.status === 'success' && result.data) {
      if (Array.isArray(result.data)) {
         if (result.data.length > 0 && Array.isArray(result.data[0])) {
           // Array of arrays format
           const dataRows = result.data;
           rawData.value = dataRows.map(row => {
             return {
               LICENSE_ID: row[0] || '',
               CUSTOMER: row[1] || '',
               PRODUCT_NAME: row[2] || '',
               LOCALIZATION: row[3] || '',
               LICENSE_VOLUME: row[4] || '',
               LICENSE_DESCRIPTION: row[5] || '',
               DATE_OF_LICENSE: row[6] || '',
               EXPIRATION_TIME: row[7] || '',
               LICENSE_TYPE: row[8] || '',
               PRODUCT_CODE: row[9] || '',
               LINK_FILE: row[10] || '',
               NAME_FILE: row[11] || '',
             }
           });
         } else {
           // Array of objects format
           rawData.value = result.data.map(item => ({
               LICENSE_ID: item.LICENSE_ID || item.lICENSE_ID || '',
               CUSTOMER: item.CUSTOMER || '',
               PRODUCT_NAME: item.PRODUCT_NAME || '',
               LOCALIZATION: item.LOCALIZATION || '',
               LICENSE_VOLUME: item.LICENSE_VOLUME || '',
               LICENSE_DESCRIPTION: item.LICENSE_DESCRIPTION || '',
               DATE_OF_LICENSE: item.DATE_OF_LICENSE || '',
               EXPIRATION_TIME: item.EXPIRATION_TIME || '',
               LICENSE_TYPE: item.LICENSE_TYPE || '',
               PRODUCT_CODE: item.PRODUCT_CODE || '',
               LINK_FILE: item.LINK_FILE || '',
               NAME_FILE: item.NAME_FILE || '',
           }));
         }
      } else {
         rawData.value = [];
      }
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu license_old_data:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
})
</script>

<style scoped>
.license-page-wrapper {
  background: #f8f9fa;
  min-height: calc(100vh - 48px);
  padding: 40px 20px;
  font-family: Arial, Helvetica, sans-serif;
}

.license-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.header-section h2 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #6c757d;
  font-size: 1rem;
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

.license-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  color: #495057;
  outline: none;
}

.license-input:focus {
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

.result-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.license-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.license-table th, .license-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.95rem;
  color: #495057;
}

.license-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
}

.license-table tr:hover {
  background-color: #f8f9fa;
}

.text-center {
  text-align: center !important;
}

.link-file {
  color: #007bff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.link-file:hover {
  background-color: #e9ecef;
  color: #0056b3;
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
}
</style>
