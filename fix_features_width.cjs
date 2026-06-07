const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

content = content.replace(
  "origWidths['features'] = origWidths['mo_ta'] || 35;",
  "origWidths['features'] = Math.max(origWidths['mo_ta'] || 0, 45);"
);

fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
console.log('Success update features column width');
