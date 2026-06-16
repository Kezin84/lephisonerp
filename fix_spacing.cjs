const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Update header padding and add position: relative
const targetPadding = 'padding: 24px 24px 16px; display: flex; justify-content: space-between; align-items: center;';
const replacePadding = 'padding: 24px 24px; display: flex; justify-content: space-between; align-items: center; position: relative;';

// Update wrapper to be perfectly centered and increase gap
const targetWrapper = 'position: absolute; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px;';
const replaceWrapper = 'position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 8px;';

if (content.includes(targetPadding)) {
    content = content.replaceAll(targetPadding, replacePadding);
    console.log("Replaced padding");
}

if (content.includes(targetWrapper)) {
    content = content.replaceAll(targetWrapper, replaceWrapper);
    console.log("Replaced wrapper");
}

fs.writeFileSync(file, content);
