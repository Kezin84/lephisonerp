import fs from 'fs';

const filePath = 'C:\\chuSonFireBase\\reminder-main\\reminder-main\\src\\components\\reportFIREBASE.vue';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Inject Firebase initialization
const fb_imports = `
import CustomSelect from './CustomSelect.vue'

// --- FIREBASE IMPORT ---
import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, get, set, update, remove, child, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "929199941311",
  appId: "1:929199941311:web:ca8d86f9fd7f8dff61480a",
  measurementId: "G-48VVPGFSFK"
};
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
`;
content = content.replace("import CustomSelect from './CustomSelect.vue'", fb_imports);

// 2. Replace hideReminder
const old_hideReminder = `const hideReminder = async (report) => {
  const original = report.reminder_visible;
  report.reminder_visible = false;
  
  if (API_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    try {
      const payload = {
        action: 'hide_reminder',
        id: report.id
      };
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (!result || result.status !== 'success') {
        report.reminder_visible = original;
      }
    } catch (error) {
      console.error("Lỗi ẩn nhắc nhở:", error);
      report.reminder_visible = original;
    }
  }
};`;
const new_hideReminder = `const hideReminder = async (report) => {
  const original = report.reminder_visible;
  report.reminder_visible = false;
  try {
    await update(dbRef(database, \`REPORT/\${report.id}\`), { reminder_visible: "FALSE" });
  } catch (error) {
    console.error("Lỗi ẩn nhắc nhở:", error);
    report.reminder_visible = original;
  }
};`;
content = content.replace(old_hideReminder, new_hideReminder);

// 3. Replace executeDelete
content = content.replace(/const executeDelete = async \(\) => \{[\s\S]*?(?=\n\/\/ Helpers giao diện)/,
`const executeDelete = async () => {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value;
  
  isDeleting.value = true;
  deletingIds.value = [id];
  isDeleteModalOpen.value = false;
  
  try {
    await remove(dbRef(database, \`REPORT/\${id}\`));
    await new Promise(r => setTimeout(r, 400));
    reports.value = reports.value.filter(r => r.id !== id);
  } catch (error) {
    console.error('Lỗi delete:', error);
    alert('Lỗi khi xoá: ' + error.message);
  }
  
  deletingIds.value = [];
  isDeleting.value = false;
  deleteTarget.value = null;
}
`);

// 4. Replace markAsCompleted and markAsFailed
content = content.replace(/const markAsCompleted = \(report\) => \{[\s\S]*?(?=\n\/\/ Xoá)/,
`const markAsCompleted = async (report) => {
  const originalStatus = report.trang_thai;
  report.trang_thai = 'Hoàn thành';
  
  try {
    await update(dbRef(database, \`REPORT/\${report.id}\`), { trang_thai: 'Hoàn thành' });
  } catch (error) {
    report.trang_thai = originalStatus;
    alert('Lỗi cập nhật: ' + error.message);
  }
}

const markAsFailed = async (report) => {
  const originalStatus = report.trang_thai;
  const originalIsFailed = report.isFailed;
  
  report.trang_thai = 'Failed';
  report.isFailed = true;
  
  try {
    await update(dbRef(database, \`REPORT/\${report.id}\`), { trang_thai: 'Failed', isFailed: true });
  } catch (error) {
    report.trang_thai = originalStatus;
    report.isFailed = originalIsFailed;
    alert('Lỗi cập nhật: ' + error.message);
  }
  failTarget.value = null;
}
`);

// 5. Replace fetchReports
const new_fetch = `const fetchReports = async () => {
  loading.value = true
  try {
    const reportRef = dbRef(database, 'REPORT')
    const snapshot = await get(reportRef)
    if (snapshot.exists()) {
      const dataObj = snapshot.val()
      let rawReports = []
      for (const key in dataObj) {
        rawReports.push({ ...dataObj[key], id: key })
      }

      let filtered = rawReports
      if (filters.value.tag) filtered = filtered.filter(r => String(r.tag).toLowerCase().includes(filters.value.tag.toLowerCase()))
      if (filters.value.phan_loai) filtered = filtered.filter(r => String(r.phan_loai).toLowerCase() === filters.value.phan_loai.toLowerCase())
      if (filters.value.trang_thai) filtered = filtered.filter(r => String(r.trang_thai).toLowerCase() === filters.value.trang_thai.toLowerCase())

      // Sort ID descending for newest first
      filtered.sort((a,b) => String(b.id).localeCompare(String(a.id)))
      
      reports.value = filtered

      if (route.query.id && !autoOpenedId) {
        autoOpenedId = true
        const r = reports.value.find(x => String(x.id) === String(route.query.id))
        if (r) {
          const rd = parseDateFromReport(r.thoi_gian)
          if (rd) {
            filters.value.filterMode = 'day'
            const dStr = \`\${rd.getFullYear()}-\${String(rd.getMonth() + 1).padStart(2, '0')}-\${String(rd.getDate()).padStart(2, '0')}\`
            filters.value.dateFrom = dStr
            filters.value.dateTo = dStr
          }
          highlightedReportId.value = r.id;
          setTimeout(() => {
            const el = document.getElementById('report-card-' + r.id)
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              setTimeout(() => {
                if (highlightedReportId.value === r.id) {
                  highlightedReportId.value = null;
                }
              }, 3000);
            }
          }, 300);
        }
      }
    } else {
      reports.value = []
    }
  } catch (error) {
    alert('Lỗi khi tải dữ liệu: ' + error.message)
  } finally {
    loading.value = false
  }
}
`;
content = content.replace(/const fetchReports = async \(\) => \{[\s\S]*?(?=\nconst submitForm = async \(\) => \{)/, new_fetch);

// 6. Replace submitForm part
const old_submitForm_fetch = `    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const result = await response.json()
    if (result.status === 'success') {
      if (isEditing.value) {
        const index = reports.value.findIndex(r => String(r.id) === String(payload.id))
        if (index !== -1) reports.value[index] = { ...reports.value[index], ...payload }
      } else {
        payload.id = result.id
        payload.thoi_gian = result.thoi_gian
        reports.value.unshift(payload)
      }
      isModalOpen.value = false
    } else {
      alert('Lỗi: ' + result.message)
    }`;
const new_submitForm_fetch = `    if (isEditing.value) {
      await update(dbRef(database, \`REPORT/\${payload.id}\`), payload)
      const index = reports.value.findIndex(r => String(r.id) === String(payload.id))
      if (index !== -1) reports.value[index] = { ...reports.value[index], ...payload }
    } else {
      // Auto-generate ID RPT_YYYYMMDD_HHMMSS
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      payload.id = \`RPT_\${d.getFullYear()}\${pad(d.getMonth()+1)}\${pad(d.getDate())}_\${pad(d.getHours())}\${pad(d.getMinutes())}\${pad(d.getSeconds())}\`
      await set(dbRef(database, \`REPORT/\${payload.id}\`), payload)
      reports.value.unshift(payload)
    }
    isModalOpen.value = false`;
content = content.replace(old_submitForm_fetch, new_submitForm_fetch);

// 7. Remove API_URL warning if any (optional, we overwrote fetchReports)
fs.writeFileSync(filePath, content, 'utf-8');
console.log("Patched successfully!");
