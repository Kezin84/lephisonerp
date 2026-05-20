const fs = require('fs');
let code = fs.readFileSync('src/components/SaleReport.vue', 'utf8');

const startStr = `<div class="sr-import-card-body" @input="isModalDirty = true" @change="isModalDirty = true">`;
const endStr = `<div class="sr-import-card-footer"`;

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  let block = code.substring(startIndex, endIndex);
  
  // 1. Remove tabs
  block = block.replace(/<div class="sr-tabs">[\s\S]*?<\/div>/, '');
  
  // 2. Add Left column opening
  block = block.replace(/<div v-show="item\.activeTab === 'po' \|\| !item\.activeTab">/, 
`<div style="display: flex; gap: 24px; padding: 24px; height: calc(100vh - 220px); box-sizing: border-box;">
  <div style="flex: 0 0 580px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; padding-right: 8px; min-height: 0;">
    <div style="background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; padding: 16px; flex-shrink: 0;">
      <h4 style="margin: 0 0 16px 0; font-size: 14px; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">Thông tin PO</h4>`);

  // 3. Move Metrics up into Left column
  const metricsMatch = block.match(/<div v-show="item\.activeTab === 'metrics'">[\s\S]*?<!-- Dự đoán Net Margin \/ DSB -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/template>\s*<\/div>/);
  if (metricsMatch) {
    let mStr = metricsMatch[0];
    block = block.replace(metricsMatch[0], '');
    
    mStr = mStr.replace(/<div v-show="item\.activeTab === 'metrics'">/, 
      `<div style="background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; padding: 16px; flex-shrink: 0;">
        <h4 style="margin: 0 0 16px 0; font-size: 14px; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">Chỉ số tài chính</h4>`);
    mStr = mStr.replace(/class="sr-modal-finance-grid"/, 'class="sr-modal-finance-grid" style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 12px;"');
    
    // Inject before FILE ĐÍNH KÈM
    block = block.replace(/<!-- FILE ĐÍNH KÈM -->/, 
`   </div>
    ${mStr}
  </div>
  <div style="flex: 1; display: flex; flex-direction: column; background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; min-width: 0;">
    <div style="padding: 16px; border-bottom: 1px solid #1e293b; background: rgba(15,23,42,.6); display: flex; align-items: center; flex-shrink: 0;">
      <h4 style="margin: 0; font-size: 14px; color: #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">📄 File Đính Kèm & Xem Trước</h4>
    </div>
    <div style="padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; flex: 1; min-height: 0;">
    <!-- FILE ĐÍNH KÈM -->`);
  }
  
  // Clean up
  block = block.replace(/<\/div>\s*<\/div>\s*$/g, '\n    </div>\n  </div>\n</div>\n');
  block = block.replace(/<div class="sr-import-card-body" @input="isModalDirty = true" @change="isModalDirty = true">/, 
    `<div class="sr-import-card-body" @input="isModalDirty = true" @change="isModalDirty = true" style="padding: 0; background: #0f172a;">`);
    
  code = code.substring(0, startIndex) + block + code.substring(endIndex);
  fs.writeFileSync('src/components/SaleReport.vue', code);
  console.log('Done');
} else {
  console.log('Bounds not found');
}
