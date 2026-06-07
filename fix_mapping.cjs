const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

// The dropdown options are populated by availableColumns.
// Currently: { value: 'so_luong', label: 'SL' }
// User wants Data Mapping (dropdown) to be 'SỐ LƯỢNG'
content = content.replace(
  "{ value: 'so_luong', label: 'SL' }",
  "{ value: 'so_luong', label: 'SỐ LƯỢNG' }"
);

// We keep defaultColumns header as 'SL', but wait, the user's input might be loaded from local storage.
// We will also check if we replaced anything else that should be reversed.
// Currently: { header: 'SL', field: 'so_luong' } is fine because the header/nhãn is 'SL'.

fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
console.log('Success replace datamapping label');
