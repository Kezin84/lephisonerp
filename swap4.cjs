const fs = require('fs');
let code = fs.readFileSync('src/components/SaleReport.vue', 'utf8');

const leftColStartStr = `<div style="flex: 0 0 650px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; padding-right: 8px; min-height: 0;">`;
const rightColStartStr = `<div style="flex: 1; display: flex; flex-direction: column; background: rgba(15,23,42,.4); border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; min-width: 0;">`;

const leftColStart = code.indexOf(leftColStartStr);
const rightColStart = code.indexOf(rightColStartStr);

if (leftColStart !== -1 && rightColStart !== -1) {
  const leftColBlock = code.substring(leftColStart, rightColStart);
  
  // Right Col Block ends at `<div class="sr-import-card-footer"` minus 2 `</div>`s (one for flex container, one for body)
  const footerStart = code.indexOf(`<div class="sr-import-card-footer"`);
  // Let's grab rightColBlock precisely.
  let rightColBlock = code.substring(rightColStart, footerStart);
  
  // The layout is:
  // [leftColStartStr ... ] </div>
  // [rightColStartStr ... ] </div> </div>
  // </div> (closes flex gap: 24px container)
  // </div> (closes body)
  // <div class="sr-import-card-footer"
  
  // Since `rightColBlock` includes `</div></div></div></div>`, we just need to isolate it properly.
  // Actually, leftColBlock ends exactly at `    </div>\n  </div>\n` 
  
  // Wait, let's swap the strings.
  // To avoid messing up trailing divs, let's just make the left col flex:1 and right col flex:0 0 650px
  
  let newLeftColBlock = leftColBlock.replace(/flex: 0 0 650px;/, 'flex: 1;');
  let newRightColBlock = rightColBlock.replace(/flex: 1;/, 'flex: 0 0 650px;');
  
  // Now place newRightColBlock BEFORE newLeftColBlock
  // So the DOM order is: RightColBlock, then LeftColBlock.
  // Which means File đính kèm will be first (left), and Form will be second (right).
  
  let newCode = code.substring(0, leftColStart) + newRightColBlock + newLeftColBlock + code.substring(footerStart);
  fs.writeFileSync('src/components/SaleReport.vue', newCode);
  console.log('Successfully swapped the entire columns!');
} else {
  console.log('Failed to find columns.');
}
