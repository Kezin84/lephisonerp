const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Add `isReportImport` to `multiEditModal` initial state
content = content.replace(
    /const multiEditModal = ref\(\{\s*show: false,\s*mode: 'update' as 'create' \| 'update',\s*items: \[\] as ImportItem\[\]\s*\}\)/,
    "const multiEditModal = ref({\n  show: false,\n  mode: 'update' as 'create' | 'update',\n  items: [] as ImportItem[],\n  isReportImport: false\n})"
);

// 2. Set `isReportImport: true` when opening modal for Report Import
content = content.replace(
    /mode: 'create',\n\s*items: allItems\n\s*\}/,
    "mode: 'create',\n      items: allItems,\n      isReportImport: true\n    }"
);

// 3. Prevent pushing to `bulkOfficialItems` if `m.isReportImport` is true
const pushCode = `          bulkOfficialItems.push({
              hd_tong_quat_row: hdTongRow,
              hd_chi_tiet_rows: hdChiTietRows,
              ma_khach_hang: maKHGen,
              tong_sau_thue: (item.doanhSoBan > 0 ? item.doanhSoBan : 1) // Bypass backend zero check
          });`;

const newPushCode = `          if (!m.isReportImport) {
              bulkOfficialItems.push({
                  hd_tong_quat_row: hdTongRow,
                  hd_chi_tiet_rows: hdChiTietRows,
                  ma_khach_hang: maKHGen,
                  tong_sau_thue: (item.doanhSoBan > 0 ? item.doanhSoBan : 1) // Bypass backend zero check
              });
          }`;

content = content.replace(pushCode, newPushCode);

fs.writeFileSync(file, content, 'utf8');
console.log('Modified successfully');
