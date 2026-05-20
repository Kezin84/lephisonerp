const fs = require('fs');
let code = fs.readFileSync('src/components/SaleReport.vue', 'utf8');

// The block starts from <div style="background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; padding: 16px; flex-shrink: 0;">
// up to the end of <template v-if="multiEditModal.mode === 'create' || item.row">

const chiSoStartStr = `<div style="background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; padding: 16px; flex-shrink: 0;">
        <h4 style="margin: 0 0 16px 0; font-size: 14px; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">Chỉ số tài chính</h4>`;
const fileStartStr = `<div style="flex: 1; display: flex; flex-direction: column; background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; min-width: 0;">
    <div style="padding: 16px; border-bottom: 1px solid #1e293b; background: rgba(15,23,42,.6); display: flex; align-items: center; flex-shrink: 0;">
      <h4 style="margin: 0; font-size: 14px; color: #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">📄 File Đính Kèm & Xem Trước</h4>`;
      
const footerStr = `<div class="sr-import-card-footer"`;

let chiSoStart = code.indexOf(chiSoStartStr);
let fileStart = code.indexOf(fileStartStr);
let footerStart = code.indexOf(footerStr);

if (chiSoStart !== -1 && fileStart !== -1 && footerStart !== -1) {
  // Extract "Chỉ số tài chính" block. It ends exactly at `     </div>` right before `</div>` closing Left column.
  // Wait, let's just use string parsing.
  let chiSoBlock = code.substring(chiSoStart, fileStart);
  // It includes `  </div>\n  <div style="flex: 1; ...` at the end. We need to strip the closing div of Left column.
  // Actually, chiSoBlock ends right before `</div>\n  <div style="flex: 1;`
  
  // Let's do it cleanly by extracting the pure blocks.
  
  // Extract block 1 (Chỉ số)
  let block1Regex = /<div style="background: rgba\(15,23,42,\.4\); border: 1px solid #1e293b; border-radius: 8px; padding: 16px; flex-shrink: 0;">\s*<h4 style="margin: 0 0 16px 0; font-size: 14px; color: #10b981;[^>]*>Chỉ số tài chính<\/h4>[\s\S]*?<\/template>\s*<\/div>/;
  
  // Extract block 2 (File đính kèm right column contents)
  let block2Regex = /<div style="flex: 1; display: flex; flex-direction: column; background: rgba\(15,23,42,\.4\); border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; min-width: 0;">\s*<div style="padding: 16px; border-bottom: 1px solid #1e293b; background: rgba\(15,23,42,\.6\); display: flex; align-items: center; flex-shrink: 0;">\s*<h4[^>]*>📄 File Đính Kèm & Xem Trước<\/h4>\s*<\/div>\s*<div style="padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; flex: 1; min-height: 0;">[\s\S]*?<!-- Frame Mua Hàng -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

  let m1 = code.match(block1Regex);
  
  // Wait, the Right column block ends with `</div></div></div></div>` right before sr-import-card-footer.
  
  // Let's just find the blocks inside the body.
  // What if we swap the flex wrappers too? No, the flex wrappers define the layout!
  // If we want "File" in 650px column, and "Chỉ số" in flex:1 column, we should just swap the content of the wrappers!
  // Wrapper 1 (Left Col): flex: 0 0 650px.
  // Wrapper 2 (Right Col): flex: 1.
  
  // Let's extract the "Chỉ số tài chính" block:
  let chiso = m1[0];
  
  // The "File đính kèm" block content:
  // It is currently inside the right column wrapper.
  let fileContentRegex = /<!-- FILE ĐÍNH KÈM -->[\s\S]*?<!-- Frame Mua Hàng -->[\s\S]*?<\/iframe>\s*<\/div>/;
  let fileMatch = code.match(fileContentRegex);
  let fileContent = fileMatch[0];
  
  // Now, what do we want the layout to be?
  // Left col: Thông tin PO + File đính kèm.
  // Right col: Chỉ số tài chính.
  
  // So we remove `chiso` from its current place.
  // We insert `fileContent` where `chiso` was.
  // We remove `fileContent` from its current place.
  // We insert `chiso` into the right column wrapper where `fileContent` was.
  
  let newCode = code;
  newCode = newCode.replace(chiso, fileContent);
  newCode = newCode.replace(fileContent, chiso); // Wait, this will replace the first occurrence! Which is the one we just inserted!
  
  // So we must do it differently.
  let rightColRegex = /<div style="flex: 1; display: flex; flex-direction: column; background: rgba\(15,23,42,\.4\); border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; min-width: 0;">[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="sr-import-card-footer")/;
  
  let leftColRegex = /(<h4[^>]*>Thông tin PO<\/h4>[\s\S]*?<\/div>\s*)<div style="background: rgba\(15,23,42,\.4\); border: 1px solid #1e293b; border-radius: 8px; padding: 16px; flex-shrink: 0;">\s*<h4[^>]*>Chỉ số tài chính<\/h4>[\s\S]*?<\/template>\s*<\/div>/;
  
  // Let's just do an exact index replacement.
  
} else {
  console.log('Not found');
}
