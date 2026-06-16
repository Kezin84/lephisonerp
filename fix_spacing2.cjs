const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Update header padding from 24px 24px to 36px 24px
const targetPadding = 'padding: 24px 24px; display: flex; justify-content: space-between; align-items: center; position: relative;';
const replacePadding = 'padding: 36px 24px; display: flex; justify-content: space-between; align-items: center; position: relative;';

if (content.includes(targetPadding)) {
    content = content.replaceAll(targetPadding, replacePadding);
    console.log("Replaced padding");
}

fs.writeFileSync(file, content);
