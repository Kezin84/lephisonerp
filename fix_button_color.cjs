const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const customerButtonTarget = `style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-left: 8px;" onmouseover="this.style.background='rgba(56, 189, 248, 0.2)'" onmouseout="this.style.background='rgba(56, 189, 248, 0.1)'"`;
const productButtonTarget = `style="background: rgba(244, 114, 182, 0.1); border: 1px solid rgba(244, 114, 182, 0.3); color: #f472b6; border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-left: 8px;" onmouseover="this.style.background='rgba(244, 114, 182, 0.2)'" onmouseout="this.style.background='rgba(244, 114, 182, 0.1)'"`;

const greenButtonReplacement = `style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-left: 8px;" onmouseover="this.style.background='rgba(34, 197, 94, 0.2)'" onmouseout="this.style.background='rgba(34, 197, 94, 0.1)'"`;

if (content.includes(customerButtonTarget)) {
    content = content.replace(customerButtonTarget, greenButtonReplacement);
    console.log("Replaced customer button");
}

if (content.includes(productButtonTarget)) {
    content = content.replace(productButtonTarget, greenButtonReplacement);
    console.log("Replaced product button");
}

fs.writeFileSync(file, content);
