const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

const targetStr = `if (Array.isArray(parsed) && parsed.length >= 3) {
          excelMappingConfig.value = parsed
        }`;
        
const replacement = `if (Array.isArray(parsed) && parsed.length >= 3) {
          // Migration for old configs
          parsed.forEach(col => {
            if (col.field === 'so_luong' && col.header === 'SỐ LƯỢNG') col.header = 'SL';
            if (col.field === 'features' && col.header === 'MÔ TẢ SẢN PHẨM') col.header = 'DIỄN GIẢI';
          });
          excelMappingConfig.value = parsed
        }`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
console.log('Success migrate localStorage config');
