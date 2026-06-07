const fs = require('fs');
let lines = fs.readFileSync('src/components/BaoGia.vue', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  // Add class to the div
  if (lines[i].includes('<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">') && lines[i+1] && lines[i+1].includes('showPreviewRawModal')) {
    lines[i] = lines[i].replace('<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">', '<div class="action-buttons-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">');
  }

  // Swap Xuat and Nap
  if (lines[i].includes('showExportInfoModal = true') && lines[i+1].includes('lucide-upload')) {
    // lines[i] to lines[i+2] is Xuat
    // lines[i+3] to lines[i+5] is Nap
    let xuat = [lines[i], lines[i+1], lines[i+2]];
    let nap = [lines[i+3], lines[i+4], lines[i+5]];
    
    lines[i] = nap[0];
    lines[i+1] = nap[1];
    lines[i+2] = nap[2];
    lines[i+3] = xuat[0];
    lines[i+4] = xuat[1];
    lines[i+5] = xuat[2];
    
    i += 5; // skip the rest
  }
}

let content = lines.join('\n');

const targetCss = `.totals-body [style*="grid"],
  .totals-body > div[style*="flex"] {
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
      align-items: stretch !important;
      width: 100% !important;
  }`;

const targetCssRegex = /\.totals-body\s*\[style\*="grid"\],\s*\.totals-body\s*>\s*div\[style\*="flex"\]\s*\{\s*display:\s*flex\s*!important;\s*flex-direction:\s*column\s*!important;\s*gap:\s*16px\s*!important;\s*align-items:\s*stretch\s*!important;\s*width:\s*100%\s*!important;\s*\}/gm;

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

if (targetCssRegex.test(content)) {
  content = content.replace(targetCssRegex, newCss);
  console.log('Replaced CSS via regex');
} else if (content.includes(targetCss)) {
  content = content.replace(targetCss, newCss);
  console.log('Replaced CSS via string');
} else {
  // If we can't find it easily, append it to the end of the file
  console.log('Could not find CSS block, appending to end of file');
  content += '\n' + newCss + '\n';
}

fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
console.log('Success update mobile layout buttons');
