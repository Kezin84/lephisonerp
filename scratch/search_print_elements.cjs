const fs = require('fs');
const file = `c:/chuSonProject/reminder-main/reminder-main/src/components/BaoGia.vue`;
const content = fs.readFileSync(file, 'utf8');

const printStylesIdx = content.indexOf('@media print');
if (printStylesIdx !== -1) {
  console.log(content.substring(printStylesIdx, printStylesIdx + 1200));
} else {
  console.log("No @media print found!");
}
