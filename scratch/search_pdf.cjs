const fs = require('fs');
const file = `c:/chuSonProject/reminder-main/reminder-main/src/components/BaoGia.vue`;
const content = fs.readFileSync(file, 'utf8');

const lines = content.split(/\r?\n/);
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('pdf')) {
    console.log(`${index + 1}: ${line}`);
  }
});
