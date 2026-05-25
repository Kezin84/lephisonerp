const fs = require('fs');
const file = `c:/chuSonProject/reminder-main/reminder-main/src/components/BaoGia.vue`;
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('<div class="print-only">');
if (idx !== -1) {
  console.log(content.substring(idx, idx + 2500));
} else {
  console.log("Not found!");
}
