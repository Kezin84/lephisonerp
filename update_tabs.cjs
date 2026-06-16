const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Update inline styles for the tab containers
content = content.replace(/background: rgba\(30, 41, 59, 0\.5\); padding: 4px; border-radius: 8px; border: 1px solid #334155;/g, 'background: rgba(16, 185, 129, 0.1); padding: 4px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);');

// Replace CSS block
const oldCss1 = `.sr-tab-btn {
  background: transparent; color: #94a3b8; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;
}`;
const newCss1 = `.sr-tab-btn {
  background: transparent; color: #6ee7b7; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s; white-space: nowrap;
}`;

const oldCss2 = `.sr-tab-btn:hover {
  color: #f8fafc; background: rgba(51, 65, 85, 0.5);
}`;
const newCss2 = `.sr-tab-btn:hover {
  color: #f8fafc; background: rgba(16, 185, 129, 0.2);
}`;

const oldCss3 = `.sr-tab-btn.active {
  background: #334155; color: #f8fafc; cursor: default; pointer-events: none;
}`;
const newCss3 = `.sr-tab-btn.active {
  background: #10b981; color: #ffffff; cursor: default; pointer-events: none; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}`;

content = content.replace(oldCss1, newCss1);
content = content.replace(oldCss2, newCss2);
content = content.replace(oldCss3, newCss3);

fs.writeFileSync(file, content);
console.log('Updated styling');
