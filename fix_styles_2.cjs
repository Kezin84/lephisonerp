const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the time labels
const oldSpan = '<span style="font-size: 13px; font-weight: 500; background: rgba(56,189,248,0.1); color: #38bdf8; padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(56,189,248,0.2); margin-left: 8px; text-transform: none;">{{ currentTimeLabel }}</span>';
const newSpan = '<span style="font-size: 14px; font-weight: 700; color: #059669; margin-left: 8px; text-transform: none;">{{ currentTimeLabel }}</span>';
content = content.replace(new RegExp(oldSpan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newSpan);

// 2. Fix the 3 toggle buttons (.sr-tab-btn at the end of the file)
// We'll replace the second definition of .sr-tab-btn
content = content.replace(
  /\.sr-tab-btn \{\r?\n\s*background: transparent; color: #94a3b8; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0\.2s; white-space: nowrap;\r?\n\s*\}/g,
  '.sr-tab-btn {\n    background: transparent; color: #94a3b8; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-transform: uppercase;\n  }'
);

content = content.replace(
  /\.sr-tab-btn\.active \{\r?\n\s*background: #334155; color: #f8fafc; cursor: default; pointer-events: none;\r?\n\s*\}/g,
  '.sr-tab-btn.active {\n    background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); cursor: default; pointer-events: none;\n  }'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Modified time labels and toggle buttons');
