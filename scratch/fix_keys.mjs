import fs from 'fs';

const filePath = 'C:\\chuSonFireBase\\reminder-main\\reminder-main\\src\\components\\reportFIREBASE.vue';
let content = fs.readFileSync(filePath, 'utf-8');

const oldFetchArray = `      if (snap.exists()) {
        const val = snap.val();
        for (const k in val) {
          data.push({ ...val[k], id: k });
        }
      }`;

const newFetchArray = `      if (snap.exists()) {
        const val = snap.val();
        for (const k in val) {
          let item = { ...val[k], id: k };
          
          // Chuẩn hoá key do file Excel bị viết hoa hoặc dùng dấu gạch ngang
          const keyMap = {
            'GHI_CHU': 'ghi_chu',
            'NOI_DUNG': 'noi_dung',
            'PHAN_LOAI': 'phan_loai',
            'TAG': 'tag',
            'THOI_GIAN': 'thoi_gian',
            'TRANG_THAI': 'trang_thai',
            'CREATED_TIME': 'created_time',
            'reminder-time': 'reminder_time',
            'reminder-content': 'reminder_content',
            'reminder-visible': 'reminder_visible'
          };
          
          for (const oldKey in keyMap) {
            const newKey = keyMap[oldKey];
            if (item[oldKey] !== undefined) {
              item[newKey] = item[oldKey];
            }
          }
          
          data.push(item);
        }
      }`;

if (content.includes(oldFetchArray)) {
    content = content.replace(oldFetchArray, newFetchArray);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Fixed keys mapping successfully!");
} else {
    console.log("Could not find fetch logic to replace.");
}
