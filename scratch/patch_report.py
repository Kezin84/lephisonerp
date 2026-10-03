import re
import sys

file_path = r"c:\chuSonFireBase\reminder-main\reminder-main\src\components\reportFIREBASE.vue"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject Firebase initialization
fb_imports = """
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
"""
content = content.replace("import CustomSelect from './CustomSelect.vue'", fb_imports, 1)

# 2. Replace hideReminder
old_hideReminder = """const hideReminder = async (report) => {
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
};"""
new_hideReminder = """const hideReminder = async (report) => {
  const original = report.reminder_visible;
  report.reminder_visible = false;
  try {
    await update(dbRef(database, `REPORT/${report.id}`), { reminder_visible: "FALSE" });
  } catch (error) {
    console.error("Lỗi ẩn nhắc nhở:", error);
    report.reminder_visible = original;
  }
};"""
content = content.replace(old_hideReminder, new_hideReminder)


# 3. Replace executeDelete
old_executeDelete_start = "const executeDelete = async () => {"
old_executeDelete_end = "deleteTarget.value = null;\n}"
# We'll regex it since it has some variable parts
content = re.sub(r"const executeDelete = async \(\) => \{.*?(?=\n// Helpers giao diện)", 
"""const executeDelete = async () => {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value;
  
  isDeleting.value = true;
  deletingIds.value = [id];
  isDeleteModalOpen.value = false;
  
  try {
    await remove(dbRef(database, `REPORT/${id}`));
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
""", content, flags=re.DOTALL)


# 4. Replace markAsCompleted
old_markAsCompleted_start = "const markAsCompleted = (report) => {"
old_markAsCompleted_end = "failTarget.value = null;\n}"

content = re.sub(r"const markAsCompleted = \(report\) => \{.*?(?=\n// Xoá)", 
"""const markAsCompleted = async (report) => {
  const originalStatus = report.trang_thai;
  report.trang_thai = 'Hoàn thành';
  
  try {
    await update(dbRef(database, `REPORT/${report.id}`), { trang_thai: 'Hoàn thành' });
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
    await update(dbRef(database, `REPORT/${report.id}`), { trang_thai: 'Failed', isFailed: true });
  } catch (error) {
    report.trang_thai = originalStatus;
    report.isFailed = originalIsFailed;
    alert('Lỗi cập nhật: ' + error.message);
  }
  failTarget.value = null;
}
""", content, flags=re.DOTALL)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Applied initial replaces.")
