const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const sIdx = content.indexOf("if (m.mode === 'create') {");
const eIdx = content.indexOf("} else {\n        // Update sequence");

console.log(sIdx, eIdx);
