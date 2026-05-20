const fs = require('fs');
const content = fs.readFileSync('c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue', 'utf8');

const startStr = '<Teleport to="body">';
const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf('</Teleport>', startIdx);
const block = content.substring(startIdx, endIdx);

let openCount = 0;
let lines = block.split('\n');
for(let i=0; i<lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div(\s|>)/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  openCount += opens - closes;
  if (openCount < 0) {
    console.log('Negative openCount at line', i, ':', line);
    openCount = 0; // reset to avoid cascading
  }
}
console.log('Total unclosed divs in first Teleport:', openCount);
