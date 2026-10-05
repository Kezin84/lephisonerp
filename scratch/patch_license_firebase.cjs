const fs = require('fs');
const filePath = 'C:/chuSonFireBase/reminder-main/reminder-main/src/components/LicenseOldDataFirebase.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace API_URL with Firebase initialization
const firebaseInit = `import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, get, set, update, remove, push, child } from "firebase/database";

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

const excelDateToJSDate = (serial) => {
  if (!serial || isNaN(Number(serial))) return null;
  const days = Math.floor(serial - 25569);
  const value = days * 86400 * 1000;
  return new Date(value);
};

const formatFirebaseDate = (val) => {
  if (!val) return '';
  if (!isNaN(val) && Number(val) > 10000) {
    const d = excelDateToJSDate(Number(val));
    if (d) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return \`\${day}/\${month}/\${year}\`;
    }
  }
  return formatDisplayDate(val);
};`;

content = content.replace("const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'", firebaseInit);

// 2. Replace setGiaHan
const setGiaHanOld = `const setGiaHan = async (item, newVal) => {
  if (item.IS_GIA_HAN === newVal) return // already set
  item._toggling = true
  try {
    const payload = {
      sheet: 'license_old_data',
      action: 'update',
      ...item,
      IS_GIA_HAN: newVal
    }
    delete payload._toggling
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(r => r.json())
    if (res.status === 'success') {
      item.IS_GIA_HAN = newVal
    }
  } catch(e) {
    console.error('Lỗi set gia hạn:', e)
  } finally {
    item._toggling = false
  }
}`;

const setGiaHanNew = `const setGiaHan = async (item, newVal) => {
  if (item.IS_GIA_HAN === newVal) return // already set
  item._toggling = true
  try {
    if (!item.firebase_id) throw new Error('No firebase_id');
    const updateRef = dbRef(database, 'license_old_data/' + item.firebase_id);
    await update(updateRef, { is_gia_han: newVal, IS_GIA_HAN: newVal });
    item.IS_GIA_HAN = newVal;
    item.is_gia_han = newVal;
  } catch(e) {
    console.error('Lỗi set gia hạn:', e)
  } finally {
    item._toggling = false
  }
}`;
if (content.includes(setGiaHanOld)) {
  content = content.replace(setGiaHanOld, setGiaHanNew);
} else {
  console.log("Could not find setGiaHanOld");
}

// 3. Replace updateCard
const updateCardOld = `const updateCard = async () => {
  const userConfirmed = await confirmAction('Lưu thay đổi', 'Bạn có chắc chắn muốn lưu các thay đổi này?', 'Lưu');
  if (!userConfirmed) return;

  saving.value = true
  editErrorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang cập nhật thông tin...' }
  try {
    // Nếu có nhập số ngày hiệu lực, tính ra ngày cụ thể
    if (editGraceDays.value && selectedCard.value.EXPIRATION_TIME) {
      selectedCard.value.SO_NGAY_HIEU_LUC = calcGraceDate(selectedCard.value.EXPIRATION_TIME, editGraceDays.value)
    }
    const payload = {
      sheet: 'license_old_data',
      action: 'update',
      ...selectedCard.value
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(r => r.json())
    
    if (res.status === 'success') {
      const idx = rawData.value.findIndex(r => r.ROW_INDEX === selectedCard.value.ROW_INDEX)
      if (idx !== -1) {
        rawData.value[idx] = { ...selectedCard.value }
      }
      selectedCard.value = null
      asyncModal.value = { show: true, type: 'success', title: 'Thành công!', msg: 'Đã lưu thay đổi' }
      setTimeout(() => asyncModal.value.show = false, 1500)
    } else {
      editErrorMsg.value = res.message || 'Lỗi cập nhật'
      asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
    }
  } catch(e) {
    editErrorMsg.value = 'Lỗi kết nối mạng'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
  } finally {
    saving.value = false
  }
}`;

const updateCardNew = `const updateCard = async () => {
  const userConfirmed = await confirmAction('Lưu thay đổi', 'Bạn có chắc chắn muốn lưu các thay đổi này?', 'Lưu');
  if (!userConfirmed) return;

  saving.value = true
  editErrorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang cập nhật thông tin...' }
  try {
    if (editGraceDays.value && selectedCard.value.EXPIRATION_TIME) {
      selectedCard.value.SO_NGAY_HIEU_LUC = calcGraceDate(selectedCard.value.EXPIRATION_TIME, editGraceDays.value)
    }
    if (!selectedCard.value.firebase_id) {
        throw new Error('No firebase_id');
    }
    const updateData = { ...selectedCard.value };
    delete updateData.firebase_id;
    delete updateData.ROW_INDEX;
    const updateRef = dbRef(database, 'license_old_data/' + selectedCard.value.firebase_id);
    await update(updateRef, updateData);
    
    const idx = rawData.value.findIndex(r => r.firebase_id === selectedCard.value.firebase_id)
    if (idx !== -1) {
      rawData.value[idx] = { ...selectedCard.value }
    }
    selectedCard.value = null
    asyncModal.value = { show: true, type: 'success', title: 'Thành công!', msg: 'Đã lưu thay đổi' }
    setTimeout(() => asyncModal.value.show = false, 1500)
  } catch(e) {
    console.error(e);
    editErrorMsg.value = 'Lỗi kết nối mạng'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
  } finally {
    saving.value = false
  }
}`;
if (content.includes(updateCardOld)) {
  content = content.replace(updateCardOld, updateCardNew);
} else {
  console.log("Could not find updateCardOld");
}

// 4. Replace deleteCard
const deleteCardOld = `const deleteCard = async () => {
  const userConfirmed = await confirmAction('Xóa mặt hàng', 'Bạn có chắc chắn muốn xóa mặt hàng này khỏi cơ sở dữ liệu?', 'Xóa');
  if (!userConfirmed) return;

  deleting.value = true
  editErrorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang xóa mặt hàng...' }
  try {
    const payload = {
      sheet: 'license_old_data',
      action: 'delete',
      ROW_INDEX: selectedCard.value.ROW_INDEX
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(r => r.json())
    
    if (res.status === 'success') {
      rawData.value = rawData.value.filter(r => r.ROW_INDEX !== selectedCard.value.ROW_INDEX)
      selectedCard.value = null
      asyncModal.value = { show: true, type: 'success', title: 'Thành công!', msg: 'Đã xóa mặt hàng' }
      setTimeout(() => asyncModal.value.show = false, 1500)
    } else {
      editErrorMsg.value = res.message || 'Lỗi khi xóa'
      asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
    }
  } catch(e) {
    editErrorMsg.value = 'Lỗi kết nối mạng'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
  } finally {
    deleting.value = false
  }
}`;

const deleteCardNew = `const deleteCard = async () => {
  const userConfirmed = await confirmAction('Xóa mặt hàng', 'Bạn có chắc chắn muốn xóa mặt hàng này khỏi cơ sở dữ liệu?', 'Xóa');
  if (!userConfirmed) return;

  deleting.value = true
  editErrorMsg.value = ''
  asyncModal.value = { show: true, type: 'loading', title: 'Đang xử lý...', msg: 'Đang xóa mặt hàng...' }
  try {
    if (!selectedCard.value.firebase_id) throw new Error('No firebase_id');
    const delRef = dbRef(database, 'license_old_data/' + selectedCard.value.firebase_id);
    await remove(delRef);
    
    rawData.value = rawData.value.filter(r => r.firebase_id !== selectedCard.value.firebase_id)
    selectedCard.value = null
    asyncModal.value = { show: true, type: 'success', title: 'Thành công!', msg: 'Đã xóa mặt hàng' }
    setTimeout(() => asyncModal.value.show = false, 1500)
  } catch(e) {
    editErrorMsg.value = 'Lỗi kết nối mạng'
    asyncModal.value = { show: true, type: 'error', title: 'Lỗi', msg: editErrorMsg.value }
  } finally {
    deleting.value = false
  }
}`;
if (content.includes(deleteCardOld)) {
  content = content.replace(deleteCardOld, deleteCardNew);
} else {
  console.log("Could not find deleteCardOld");
}

// 5. Replace fetchData
const fetchDataRegex = /const fetchData = async \(\) => \{[\s\S]*?loading\.value = false;\s*\}\s*\}/;

const fetchDataNew = `const fetchData = async () => {
  loading.value = true;
  try {
    const dataRef = dbRef(database, 'license_old_data');
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const rows = [];
      let index = 0;
      for (const key in data) {
        const item = data[key];
        rows.push({
            firebase_id: key,
            ROW_INDEX: index + 2, // Keep for compatibility if needed elsewhere
            LICENSE_ID: item.LICENSE_ID || item.lICENSE_ID || '',
            CUSTOMER: item.CUSTOMER || '',
            PRODUCT_NAME: item.PRODUCT_NAME || '',
            LOCALIZATION: item.LOCALIZATION || '',
            LICENSE_VOLUME: item.LICENSE_VOLUME || '',
            LICENSE_DESCRIPTION: item.LICENSE_DESCRIPTION || '',
            DATE_OF_LICENSE: formatFirebaseDate(item.DATE_OF_LICENSE),
            EXPIRATION_TIME: formatFirebaseDate(item.EXPIRATION_TIME),
            LICENSE_TYPE: item.LICENSE_TYPE || '',
            PRODUCT_CODE: item.PRODUCT_CODE || '',
            LINK_FILE: item.LINK_FILE || '',
            NAME_FILE: item.NAME_FILE || '',
            IS_GIA_HAN: item.IS_GIA_HAN || item.is_gia_han || '',
            SO_NGAY_HIEU_LUC: formatFirebaseDate(item.SO_NGAY_HIEU_LUC || item.so_ngay_hieu_luc),
            NHA_SAN_XUAT: item.NHA_SAN_XUAT || item.nha_san_xuat || '',
        });
        index++;
      }
      rawData.value = rows;
    } else {
      rawData.value = [];
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu license_old_data:', err);
  } finally {
    loading.value = false;
  }
}`;

if (fetchDataRegex.test(content)) {
  content = content.replace(fetchDataRegex, fetchDataNew);
} else {
  console.log("Could not find fetchData regex match");
}

fs.writeFileSync(filePath, content);
console.log('Done replacing');
