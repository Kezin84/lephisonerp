const fs = require('fs');

function restructureBaoGia(filePath, isGoc) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. EXTRACT PREVIEW TABLE
  let previewTableRegex = isGoc ? /<div v-if="showPreviewRawModal"[\s\S]*?<div class="quote-table-wrap">([\s\S]*?)<\/div>\s*<div class="totals-grid totals-quote">([\s\S]*?)<\/div>.*?<\/div>\s*<\/div>/ 
                                : /<div v-if="showPreviewModal"[\s\S]*?<div class="quote-table-wrap">([\s\S]*?)<\/div>\s*<div class="totals-grid totals-quote">([\s\S]*?)<\/div>.*?<\/div>\s*<\/div>/;
  
  let match = previewTableRegex.exec(content);
  if (!match) {
    console.error("Could not find preview modal in " + filePath);
    return;
  }
  let tableWrapHtml = `<div class="quote-table-wrap" style="flex: 1; background: #fff; border-radius: 12px; padding: 14px; border: 1px solid #e5e7eb; overflow: auto; margin-bottom: 16px;">
          <div class="sidebar-head" style="margin-bottom: 12px; position: sticky; left: 0;">
            <h3>📄 Bảng báo giá chi tiết</h3>
            <span class="hint" style="font-size: 0.85em; font-weight: normal;">Click vào ô <b>SL / Giá Lic / VAT</b> để sửa trực tiếp.</span>
          </div>
          <div style="min-width: 1200px">
          ${match[1]}
          </div>
        </div>`;
  
  // totals html
  let totalsHtmlOriginal = match[2];
  // Convert totals-grid to bottom-totals
  let bottomTotalsHtml = `<div class="bottom-totals" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          ${totalsHtmlOriginal}
        </div>`;

  // Remove both showPreviewModal and showPreviewRawModal from content
  if (!isGoc) {
      content = content.replace(/<div v-if="showPreviewModal"[\s\S]*?<!-- ================== MODAL: XEM BÁO GIÁ GỐC/, "<!-- ================== MODAL: XEM BÁO GIÁ GỐC");
      content = content.replace(/<div v-if="showPreviewRawModal"[\s\S]*?<!-- ================== MODAL: CHỈNH SỬA ITEM BÁO GIÁ/, "<!-- ================== MODAL: CHỈNH SỬA ITEM BÁO GIÁ");
  } else {
      content = content.replace(/<div v-if="showPreviewModal"[\s\S]*?<!-- ================== MODAL: XEM BÁO GIÁ GỐC/, "<!-- ================== MODAL: XEM BÁO GIÁ GỐC");
      content = content.replace(/<div v-if="showPreviewRawModal"[\s\S]*?<!-- ================== MODAL: CHỈNH SỬA ITEM BÁO GIÁ/, "<!-- ================== MODAL: CHỈNH SỬA ITEM BÁO GIÁ");
  }

  // 2. REWRITE MAIN GRID
  let mainGridRegex = /<!-- ================== CENTER: SEARCH \+ CARDS ================== -->([\s\S]*?)<!-- ================== RIGHT SIDEBAR: HỢP ĐỒNG \+ THAO TÁC ================== -->([\s\S]*?)<!-- NÚT MỞ SIDEBAR HỢP ĐỒNG -->/;
  
  let gridMatch = mainGridRegex.exec(content);
  if (!gridMatch) {
      console.log("Could not find main grid in " + filePath);
      return;
  }
  let centerBox = gridMatch[1];
  let rightSidebar = gridMatch[2];

  // Modify centerBox to become left sidebar
  centerBox = centerBox.replace(/<section class="box center">/, `<aside class="sidebar sidebar-left" :class="{ closed: !showProductSidebar }">
        <div class="sidebar-head">
          <h3>🛒 Sản phẩm</h3>
          <button class="icon-btn" @click="showProductSidebar = false">✕</button>
        </div>`);
  centerBox = centerBox.replace(/<\/section>/, `</aside>\n      <button v-if="!showProductSidebar" class="open-tab left" @click="showProductSidebar = true">🛒 SP</button>`);
  
  // Make product grid scrollable
  centerBox = centerBox.replace(/<div class="product-grid">/, `<div class="product-grid" style="grid-template-columns: 1fr; overflow-y: auto; max-height: calc(100vh - 160px);">`);
  centerBox = centerBox.replace(/<div class="top-bar">/, `<div class="top-bar" style="flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">`);
  
  // Add width 100% to inputs
  centerBox = centerBox.replace(/<button class="primary" @click="showManualModal = true">/, `<button class="primary" style="width: 100%" @click="showManualModal = true">`);
  centerBox = centerBox.replace(/<input v-model="keyword"/, `<input v-model="keyword" style="width: 100%"`);
  centerBox = centerBox.replace(/class="select"/, `class="select" style="width: 100%"`);

  // Build the new center column
  let newCenterColumn = `
      <!-- ================== CENTER: QUOTE TABLE ================== -->
      <section class="box center quote-center" style="display: flex; flex-direction: column; padding: 0; background: transparent; box-shadow: none; overflow: hidden; height: calc(100vh - 32px);">
        ${tableWrapHtml}
        ${bottomTotalsHtml}
      </section>
  `;

  // Right sidebar cleanup
  rightSidebar = rightSidebar.replace(/<button class="primary" @click="showPreviewModal = true">Xem báo giá<\/button>\s*<button class="primary" @click="showPreviewRawModal = true">Xem báo giá gốc<\/button>/, "");
  // Remove totals-grid from right sidebar
  rightSidebar = rightSidebar.replace(/<div class="totals-grid">[\s\S]*?<\/div>\s*<\/div>/, "");
  
  let newGrid = `<!-- ================== LEFT SIDEBAR ================== -->\n      ${centerBox}\n${newCenterColumn}\n      <!-- ================== RIGHT SIDEBAR: HỢP ĐỒNG + THAO TÁC ================== -->${rightSidebar}<!-- NÚT MỞ SIDEBAR HỢP ĐỒNG -->`;
  
  content = content.replace(gridMatch[0], newGrid);

  // CSS Fixes
  content = content.replace(/grid-template-columns: 1fr 360px;/g, "grid-template-columns: 340px 1fr 340px;");
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated " + filePath);
}

restructureBaoGia('src/components/BaoGia.vue', false);
restructureBaoGia('baogiamau.vue', true);
