<template>
  <div class="db-viewer-container">
    <div class="db-header">
      <h2 style="display: inline-flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        <span>Database Viewer</span>
      </h2>
      <div class="db-controls">
        <label style="font-weight: 600; color: #475569;">Chọn bảng (Node): </label>
        <select v-model="selectedNode" @change="fetchData" class="elite-input" style="min-width: 150px;">
          <option v-for="node in availableNodes" :key="node" :value="node">
            {{ node }}
          </option>
        </select>

        <input type="text" v-model="searchQuery" placeholder="Tìm kiếm trong bảng..." class="elite-input" style="width: 250px;" />
        
        <button @click="exportToCSV" class="elite-btn-save" :disabled="!flattenedData.length" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Xuất Excel (CSV)</span>
        </button>
      </div>
    </div>

    <div class="db-table-wrapper" v-if="loading">
      <div class="loading-state">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        <span>Đang tải dữ liệu...</span>
      </div>
    </div>
    
    <div class="db-table-wrapper" v-else-if="flattenedData.length === 0">
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        <span style="margin-top: 1rem;">Không có dữ liệu trong bảng này.</span>
      </div>
    </div>
    
    <div class="db-table-wrapper" v-else>
      <table class="elite-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col" @click="sortBy(col)">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                {{ col }}
                <span v-if="sortCol === col" style="color: #3b82f6;">{{ sortAsc ? '▲' : '▼' }}</span>
                <span v-else style="color: #cbd5e1; opacity: 0.5;">↕</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedData" :key="index" @dblclick="handleRowDblClick(row)">
            <td v-for="col in columns" :key="col" :title="row[col]">
              <div class="cell-content">{{ row[col] !== undefined ? row[col] : '' }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="db-pagination" v-if="filteredData.length > 0">
      <button :disabled="currentPage === 1" @click="currentPage--">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <span style="font-weight: 500; color: #334155;">Trang {{ currentPage }} / {{ totalPages }} <span style="color: #94a3b8; font-size: 0.9em;">({{ filteredData.length }} dòng)</span></span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
      
      <select v-model="rowsPerPage" class="elite-input" style="padding: 0.4rem; font-size: 0.85rem; margin-left: 1rem;">
        <option :value="20">20 dòng/trang</option>
        <option :value="50">50 dòng/trang</option>
        <option :value="100">100 dòng/trang</option>
        <option :value="500">500 dòng/trang</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, markRaw, toRaw } from 'vue';
import { getDatabase, ref as dbRef, onValue, off } from "firebase/database";
import { initializeApp, getApps, getApp } from "firebase/app";
import { useRouter } from 'vue-router';

const router = useRouter();

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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = markRaw(getDatabase(app));

const availableNodes = ref([]);
const selectedNode = ref('');
const rawData = ref({});
const flattenedData = ref([]);
const columns = ref([]);
const loading = ref(false);
const searchQuery = ref('');

const sortCol = ref('id');
const sortAsc = ref(true);
const currentPage = ref(1);
const rowsPerPage = ref(50);

let currentDbRef = null;

const fetchData = () => {
  loading.value = true;
  if (currentDbRef) {
    off(toRaw(currentDbRef));
  }
  
  currentDbRef = markRaw(dbRef(db, selectedNode.value));
  onValue(currentDbRef, (snapshot) => {
    const data = snapshot.val() || {};
    rawData.value = data;
    processData(data);
    loading.value = false;
  }, (error) => {
    console.error("Firebase read error:", error);
    loading.value = false;
  });
};

const fetchRootNodes = async () => {
  try {
    const url = `${firebaseConfig.databaseURL}/.json?shallow=true`;
    const response = await fetch(url);
    const data = await response.json();
    if (data) {
      const keys = new Set([...Object.keys(data), 'sale_report', 'lich_su_thanh_toan', 'khach_hang']);
      availableNodes.value = Array.from(keys).sort();
      if (availableNodes.value.length > 0 && !selectedNode.value) {
        selectedNode.value = availableNodes.value[0];
        fetchData();
      }
    }
  } catch (error) {
    console.error("Failed to fetch root nodes:", error);
    // Fallback if REST API fails (e.g., due to rules)
    availableNodes.value = ['khach_hang', 'quan_ly_file', 'sale_report', 'sale_report_craft', 'lich_su_thanh_toan', 'bao_gia', 'hang_hoa', 'mau_in_thiet_lap', 'upload_file_mau', 'Tasks'];
    if (!selectedNode.value) {
      selectedNode.value = 'khach_hang';
      fetchData();
    }
  }
};

onMounted(() => {
  fetchRootNodes();
});

onUnmounted(() => {
  if (currentDbRef) {
    off(toRaw(currentDbRef));
    currentDbRef = null;
  }
});

watch([searchQuery, rowsPerPage], () => {
  currentPage.value = 1;
});

const processData = (data) => {
  let arr = [];
  if (typeof data === 'object' && !Array.isArray(data)) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        let item = data[key];
        if (typeof item === 'object' && item !== null) {
          arr.push(flattenObject({ _key: key, ...item }));
        } else {
          arr.push({ _key: key, value: item });
        }
      }
    }
  } else if (Array.isArray(data)) {
    arr = data.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return flattenObject({ _key: index, ...item });
      }
      return { _key: index, value: item };
    });
  }

  const cols = new Set();
  arr.forEach(row => {
    Object.keys(row).forEach(k => cols.add(k));
  });
  
  const colArray = Array.from(cols);
  colArray.sort((a, b) => {
    if (a === '_key' || a === 'id') return -1;
    if (b === '_key' || b === 'id') return 1;
    return a.localeCompare(b);
  });

  columns.value = colArray;
  flattenedData.value = arr;
};

const flattenObject = (ob) => {
  let toReturn = {};
  for (let i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;
    if ((typeof ob[i]) == 'object' && ob[i] !== null) {
      if (Array.isArray(ob[i])) {
        if (i === 'ke_hoach_thanh_toan') {
          toReturn[i] = ob[i]
            .map(x => {
              if (!x || typeof x !== 'object') return String(x);
              const amt = Number(x.so_tien_phai_thu || 0).toLocaleString('vi-VN');
              return `Đợt ${x.dot || ''}: ${x.ty_le_pct || 0}% (${amt}đ - Hạn: ${x.han_thanh_toan || 'Chưa đặt'})`;
            })
            .join(' | ');
        } else {
          toReturn[i] = ob[i].map(x => typeof x === 'object' ? JSON.stringify(x) : x).join(', ');
        }
      } else {
        toReturn[i] = JSON.stringify(ob[i]);
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

const sortBy = (col) => {
  if (sortCol.value === col) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortCol.value = col;
    sortAsc.value = true;
  }
};

const filteredData = computed(() => {
  let result = flattenedData.value;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(row => {
      return Object.values(row).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      );
    });
  }

  if (sortCol.value) {
    result = [...result].sort((a, b) => {
      const valA = a[sortCol.value] !== undefined ? a[sortCol.value] : '';
      const valB = b[sortCol.value] !== undefined ? b[sortCol.value] : '';
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc.value ? valA - valB : valB - valA;
      }
      
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortAsc.value ? -1 : 1;
      if (strA > strB) return sortAsc.value ? 1 : -1;
      return 0;
    });
  }

  return result;
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredData.value.length / rowsPerPage.value));
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredData.value.slice(start, end);
});

const handleRowDblClick = (row) => {
  if (selectedNode.value === 'khach_hang') {
    // Attempt to route to customer page. The app structure uses Modals heavily, 
    // but navigating to the route might be best we can do globally.
    alert(`Click đúp vào Khách Hàng (ID: ${row.id || row._key}). Vui lòng vào trang Khách hàng để chỉnh sửa.`);
    router.push('/customer');
  } else if (selectedNode.value === 'quan_ly_file') {
    alert(`Click đúp vào Công việc (ID: ${row.id || row._key}). Vui lòng vào trang Quản lý File để chỉnh sửa.`);
    router.push('/quan-ly-file');
  } else {
    alert(`Double-click vào record ID: ${row.id || row._key}`);
  }
};

const exportToCSV = () => {
  if (!filteredData.value.length) return;
  
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent += columns.value.map(col => `"${col}"`).join(",") + "\r\n";
  
  filteredData.value.forEach(row => {
    let rowString = columns.value.map(col => {
      let val = row[col];
      if (val === undefined || val === null) val = '';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(",");
    csvContent += rowString + "\r\n";
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Export_${selectedNode.value}_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
.db-viewer-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 3rem);
  background: #f8fafc;
  box-sizing: border-box;
}
.db-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background: #ffffff;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}
.db-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.db-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.elite-input {
  padding: 0.6rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  background: #ffffff;
  color: #334155;
}
.elite-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
.elite-btn-save {
  background: #10b981;
  color: #ffffff;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.elite-btn-save:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}
.elite-btn-save:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}
.db-table-wrapper {
  flex: 1;
  overflow: auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}
.elite-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  white-space: nowrap;
}
.elite-table th {
  background: #f8fafc;
  position: sticky;
  top: 0;
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 700;
  color: #475569;
  border-bottom: 2px solid #cbd5e1;
  cursor: pointer;
  user-select: none;
  z-index: 10;
  transition: background 0.2s;
}
.elite-table th:hover {
  background: #e2e8f0;
}
.elite-table td {
  padding: 0.8rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.9rem;
  transition: background 0.15s;
}
.cell-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.elite-table tr:hover td {
  background: rgba(59, 130, 246, 0.04);
}
.db-pagination {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}
.db-pagination button {
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s;
}
.db-pagination button:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}
.db-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
}
.spinner {
  animation: spin 1.5s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>
