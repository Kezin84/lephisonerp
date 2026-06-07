const fs = require('fs');
const lines = fs.readFileSync('src/components/BaoGia.vue', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('v-model=\"col.header\"')) {
    console.log('Found around line ' + (i+1));
    for (let j = Math.max(0, i - 5); j <= i + 10; j++) {
      console.log(j+1 + ': ' + lines[j].trim());
    }
  }
}
