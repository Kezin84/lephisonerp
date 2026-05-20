const fs = require('fs');
let code = fs.readFileSync('src/components/SaleReport.vue', 'utf8');

const leftColStartStr = `<div style="flex: 0 0 650px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; padding-right: 8px; min-height: 0;">`;
const rightColStartStr = `<div style="flex: 1; display: flex; flex-direction: column; background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; min-width: 0;">`;

const leftColStart = code.indexOf(leftColStartStr);
const rightColStart = code.indexOf(rightColStartStr);

if (leftColStart !== -1 && rightColStart !== -1) {
  let leftColBlock = code.substring(leftColStart, rightColStart);
  
  const footerStart = code.indexOf(`<div class="sr-import-card-footer"`);
  let rightColBlockRaw = code.substring(rightColStart, footerStart);
  
  // rightColBlockRaw ends with `</div>\n</div>\n</div>\n</div>\n`
  // The first `</div>` closes rightCol.
  // The second `</div>` closes the flex container.
  // The third `</div>` closes the body.
  
  // Let's strip the last 2 `</div>`s from rightColBlockRaw
  let rightColBlock = rightColBlockRaw.replace(/(<\/div>\s*){2}$/, '');
  let trailingDivs = rightColBlockRaw.match(/(<\/div>\s*){2}$/)[0];
  
  // Now we have pure `rightColBlock` and pure `leftColBlock`
  let newLeftColBlock = leftColBlock.replace(/flex: 0 0 650px;/, 'flex: 1;');
  let newRightColBlock = rightColBlock.replace(/flex: 1;/, 'flex: 0 0 650px;');
  
  // Swap them!
  let newCode = code.substring(0, leftColStart) + newRightColBlock + newLeftColBlock + trailingDivs + code.substring(footerStart);
  fs.writeFileSync('src/components/SaleReport.vue', newCode);
  console.log('Successfully swapped the entire columns!');
} else {
  console.log('Failed to find columns.');
}
