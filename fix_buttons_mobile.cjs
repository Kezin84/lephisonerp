const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

// 1. Swap the buttons
const oldHtml = `<button class="action-btn" @click="showExportInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #16a34a; border: none; color: #ffffff;">
<i class="lucide-upload" style="margin-right: 6px; font-size: 16px;"></i> Xuất dữ liệu
</button>
<button class="action-btn" @click="showLoadInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #eab308; border: none; color: #1e3a8a;">
<i class="lucide-download" style="margin-right: 6px; font-size: 16px;"></i> Nạp dữ liệu
</button>`;

const newHtml = `<button class="action-btn" @click="showLoadInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #eab308; border: none; color: #1e3a8a;">
<i class="lucide-download" style="margin-right: 6px; font-size: 16px;"></i> Nạp dữ liệu
</button>
<button class="action-btn" @click="showExportInfoModal = true" style="margin: 0; padding: 10px 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; flex-direction: row; justify-content: center; min-height: 38px; background: #16a34a; border: none; color: #ffffff;">
<i class="lucide-upload" style="margin-right: 6px; font-size: 16px;"></i> Xuất dữ liệu
</button>`;

content = content.replace(oldHtml, newHtml);

// 2. Add class to the grid div to override the media query
content = content.replace(
  '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">\n<button class="action-btn" @click="showPreviewRawModal = true"',
  '<div class="action-buttons-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">\n<button class="action-btn" @click="showPreviewRawModal = true"'
);

// 3. Add CSS to override the bad media query
const targetCss = `.totals-body [style*="grid"],
  .totals-body > div[style*="flex"] {
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
      align-items: stretch !important;
      width: 100% !important;
  }`;

const newCss = `.totals-body [style*="grid"],
  .totals-body > div[style*="flex"] {
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
      align-items: stretch !important;
      width: 100% !important;
  }
  
  .totals-body .action-buttons-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      flex-direction: row !important;
      gap: 8px !important;
  }`;

content = content.replace(targetCss, newCss);

fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
console.log('Success update mobile layout buttons');
