const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Revert .fintech-grid
const regexFintech = /\.fintech-grid\s*{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(2,\s*1fr\);\s*gap:\s*16px;\s*}/g;
const replaceFintech = `.fintech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}`;

if (regexFintech.test(content)) {
    content = content.replace(regexFintech, replaceFintech);
    console.log("Reverted .fintech-grid");
}

// 2. Change .sr-card-list to 2 columns
const regexCardList = /\.sr-card-list\s*{\s*display:\s*flex;\s*flex-direction:\s*column;\s*gap:\s*24px;\s*margin-bottom:\s*40px;\s*}/g;
const replaceCardList = `.sr-card-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}`;

if (regexCardList.test(content)) {
    content = content.replace(regexCardList, replaceCardList);
    console.log("Updated .sr-card-list to grid");
}

fs.writeFileSync(file, content);
console.log("Done");
