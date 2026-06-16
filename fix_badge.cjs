const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const targetStyle = 'font-size: 14px; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 1px;';
const replaceStyle = 'font-size: 12px; font-weight: 700; color: #ffffff; background-color: #ef4444; padding: 2px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;';

if (content.includes(targetStyle)) {
    content = content.replaceAll(targetStyle, replaceStyle);
    console.log("Replaced badge style");
} else {
    console.log("Target not found!");
}

fs.writeFileSync(file, content);
