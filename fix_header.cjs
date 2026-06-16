const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Update header padding for all 3 modals
const targetPadding = 'padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;';
const replacePadding = 'padding: 24px 24px 16px; display: flex; justify-content: space-between; align-items: center;';

// Update time text style for all 3 modals
const targetText = 'font-size: 13px; font-weight: 700; color: #22c55e; text-transform: none; letter-spacing: 0.5px;';
const replaceText = 'font-size: 14px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 1px;';

if (content.includes(targetPadding)) {
    content = content.replaceAll(targetPadding, replacePadding);
    console.log("Replaced padding");
}

if (content.includes(targetText)) {
    content = content.replaceAll(targetText, replaceText);
    console.log("Replaced text style");
}

fs.writeFileSync(file, content);
