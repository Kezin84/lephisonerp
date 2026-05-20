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
}
console.log('Total unclosed divs in first Teleport:', openCount);

const startIdx2 = content.indexOf(startStr, endIdx);
if (startIdx2 !== -1) {
  const endIdx2 = content.indexOf('</Teleport>', startIdx2);
  const block2 = content.substring(startIdx2, endIdx2);
  let openCount2 = 0;
  let lines2 = block2.split('\n');
  for(let i=0; i<lines2.length; i++) {
    const opens = (lines2[i].match(/<div(\s|>)/g) || []).length;
    const closes = (lines2[i].match(/<\/div>/g) || []).length;
    openCount2 += opens - closes;
  }
  console.log('Total unclosed divs in second Teleport:', openCount2);
}
