const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const regexGrid = /\.fintech-grid\s*{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(220px,\s*1fr\)\);\s*gap:\s*16px;\s*}/g;

const replaceGrid = `.fintech-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}`;

if (regexGrid.test(content)) {
    content = content.replace(regexGrid, replaceGrid);
    fs.writeFileSync(file, content);
    console.log("Updated to 2 cards per row");
} else {
    console.log("Target not found");
}
