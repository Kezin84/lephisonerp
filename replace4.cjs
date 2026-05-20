const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/report.vue';
let content = fs.readFileSync(file, 'utf8');

// The exact SVG string currently in the file
const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';

// For report Báo giá
const bgOld = svgString + '\n                            {{ getExcelFileName(report, \\'link_excel_bao_gia\\', i, \\'Báo giá\\') }}';
const bgNew = '<span v-html="getFileIconSvg(getExcelFileName(report, \\'link_excel_bao_gia\\', i, \\'Báo giá\\'))" style="display:flex;align-items:center;"></span>\n                            <span class="file-attach-text">{{ getExcelFileName(report, \\'link_excel_bao_gia\\', i, \\'Báo giá\\') }}</span>';
content = content.split(bgOld).join(bgNew);

// For report Mua hàng
const mhOld = svgString + '\n                            {{ getExcelFileName(report, \\'link_excel_mua_hang\\', i, \\'Mua hàng\\') }}';
const mhNew = '<span v-html="getFileIconSvg(getExcelFileName(report, \\'link_excel_mua_hang\\', i, \\'Mua hàng\\'))" style="display:flex;align-items:center;"></span>\n                            <span class="file-attach-text">{{ getExcelFileName(report, \\'link_excel_mua_hang\\', i, \\'Mua hàng\\') }}</span>';
content = content.split(mhOld).join(mhNew);

// For task Báo giá
const tbgOld = svgString + '\n                              {{ getExcelFileName(task, \\'link_excel_bao_gia\\', i, \\'Báo giá\\') }}';
const tbgNew = '<span v-html="getFileIconSvg(getExcelFileName(task, \\'link_excel_bao_gia\\', i, \\'Báo giá\\'))" style="display:flex;align-items:center;"></span>\n                              <span class="file-attach-text">{{ getExcelFileName(task, \\'link_excel_bao_gia\\', i, \\'Báo giá\\') }}</span>';
content = content.split(tbgOld).join(tbgNew);

// For task Mua hàng
const tmhOld = svgString + '\n                              {{ getExcelFileName(task, \\'link_excel_mua_hang\\', i, \\'Mua hàng\\') }}';
const tmhNew = '<span v-html="getFileIconSvg(getExcelFileName(task, \\'link_excel_mua_hang\\', i, \\'Mua hàng\\'))" style="display:flex;align-items:center;"></span>\n                              <span class="file-attach-text">{{ getExcelFileName(task, \\'link_excel_mua_hang\\', i, \\'Mua hàng\\') }}</span>';
content = content.split(tmhOld).join(tmhNew);

// Replace styles
const styleBgOld = 'class="tl-attach-badge" style="background: rgba(16,185,129,0.1); color: #34d399; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; text-decoration: none; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(16,185,129,0.2); transition: all 0.2s;" onmouseover="this.style.background=\\'rgba(16,185,129,0.2)\\'; this.style.transform=\\'translateY(-1px)\\'" onmouseout="this.style.background=\\'rgba(16,185,129,0.1)\\'; this.style.transform=\\'none\\'"';
const styleMhOld = 'class="tl-attach-badge" style="background: rgba(139,92,246,0.1); color: #a78bfa; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; text-decoration: none; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(139,92,246,0.2); transition: all 0.2s;" onmouseover="this.style.background=\\'rgba(139,92,246,0.2)\\'; this.style.transform=\\'translateY(-1px)\\'" onmouseout="this.style.background=\\'rgba(139,92,246,0.1)\\'; this.style.transform=\\'none\\'"';
const styleNew = 'class="file-attach-badge"';

content = content.split(styleBgOld).join(styleNew);
content = content.split(styleMhOld).join(styleNew);

fs.writeFileSync(file, content, 'utf8');
console.log("Done");
