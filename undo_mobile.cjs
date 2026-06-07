const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

// 1. Revert CSS
const cssToRemove = `
.totals-body .action-buttons-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    flex-direction: row !important;
    gap: 8px !important;
}
`;
content = content.replace(cssToRemove, '');

// 2. Revert class
content = content.replace('<div class="action-buttons-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">', '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">');

// 3. Swap buttons back
const newHtml = `<button class="action-btn" @click="showLoadInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #eab308; border: none; color: #1e3a8a;">
<i class="lucide-download" style="margin-right: 6px; font-size: 16px;"></i> Nạp dữ liệu
</button>
<button class="action-btn" @click="showExportInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #16a34a; border: none; color: #ffffff;">
<i class="lucide-upload" style="margin-right: 6px; font-size: 16px;"></i> Xuất dữ liệu
</button>`;

const oldHtml = `<button class="action-btn" @click="showExportInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #16a34a; border: none; color: #ffffff;">
<i class="lucide-upload" style="margin-right: 6px; font-size: 16px;"></i> Xuất dữ liệu
</button>
<button class="action-btn" @click="showLoadInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #eab308; border: none; color: #1e3a8a;">
<i class="lucide-download" style="margin-right: 6px; font-size: 16px;"></i> Nạp dữ liệu
</button>`;

content = content.replace(newHtml, oldHtml);

// 4. Try regex swap in case formatting is slightly different
const regex = /(<button class="action-btn" @click="showLoadInfoModal = true"[\s\S]*?<\/button>)\s*(<button class="action-btn" @click="showExportInfoModal = true"[\s\S]*?<\/button>)/;
content = content.replace(regex, '$2\n$1');

fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
console.log('Undone successfully');
