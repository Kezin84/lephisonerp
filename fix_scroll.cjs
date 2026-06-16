const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const regex = /\.sr-modal-body \{ max-height: calc\(100vh - 120px\) !important; padding: 16px !important; \}/g;
content = content.replace(regex, '.sr-modal-body { max-height: calc(100vh - 120px) !important; padding: 16px !important; overflow-y: auto !important; overflow-x: auto !important; }');

const regex2 = /\.chart-wrapper-mobile \{/g;
content = content.replace(regex2, '.chart-wrapper-mobile { overflow-x: auto !important;');

fs.writeFileSync(file, content);
console.log('Fixed scrolling');
