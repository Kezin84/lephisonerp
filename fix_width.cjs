const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

const targetStr = "origWidths['ghi_chu'] = 25;";
const replacement = `origWidths['ghi_chu'] = 25;
          // Ensure monetary columns have enough width to avoid ########
          origWidths['don_gia_kh'] = Math.max(origWidths['don_gia_kh'] || 0, 18);
          origWidths['gia_tieu_chuan'] = Math.max(origWidths['gia_tieu_chuan'] || 0, 18);
          origWidths['list_price'] = Math.max(origWidths['list_price'] || 0, 18);
          origWidths['don_gia_nhap'] = Math.max(origWidths['don_gia_nhap'] || 0, 18);
          origWidths['truoc_thue'] = Math.max(origWidths['truoc_thue'] || 0, 18);
          origWidths['sau_thue'] = Math.max(origWidths['sau_thue'] || 0, 18);
          origWidths['vat_amount'] = Math.max(origWidths['vat_amount'] || 0, 15);`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
console.log('Success update column widths');
