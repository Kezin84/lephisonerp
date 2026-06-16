const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div class="sr-rc-right">\s*<button class="sr-btn-edit-rc" @click\.stop="openMultiEditModal\(r\)">[\s\S]*?Cập nhật số liệu\s*<\/button>\s*<\/div>/g;

content = content.replace(regex, '');

fs.writeFileSync(file, content);
console.log('Removed button');
