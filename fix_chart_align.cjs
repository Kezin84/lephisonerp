const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// The chartModal body
const searchStr = '<div class="sr-modal-body" style="padding: 24px; flex: 1; background: #0b1121; position: relative;">\n            <div class="chart-wrapper-mobile"';
const replaceStr = '<div class="sr-modal-body" style="padding: 24px; flex: 1; background: #0b1121; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">\n            <div class="chart-wrapper-mobile"';

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(file, content);
console.log('Fixed chart vertical alignment');
