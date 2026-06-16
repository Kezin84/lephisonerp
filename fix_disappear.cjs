const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Revert position: relative from header
content = content.replaceAll('padding: 36px 24px; display: flex; justify-content: space-between; align-items: center; position: relative;', 'padding: 32px 24px; display: flex; justify-content: space-between; align-items: center;');

// Revert top: 50% and translate(-50%, -50%) to just translateX(-50%)
content = content.replaceAll('position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 8px;', 'position: absolute; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 10;');

fs.writeFileSync(file, content);
console.log("Reverted positioning");
