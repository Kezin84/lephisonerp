const XLSX = require('xlsx');
const fs = require('fs');

async function testScanImprovedXLSX(filename) {
  try {
    const data = new Uint8Array(fs.readFileSync(filename));
    const workbook = XLSX.read(data, { type: 'array' });
    const wsName = workbook.SheetNames[0];
    const ws = workbook.Sheets[wsName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    let beforeTaxCol = -1;
    let foundTotal = 0;
    
    // First pass
    rows.forEach(row => {
      if (!row || !Array.isArray(row)) return;
      row.forEach((cell, colNumber) => {
        const text = String(cell || '').toLowerCase();
        if (text.includes('thành tiền trước thuế') || 
            (text.includes('thành tiền') && !text.includes('sau thuế') && !text.includes('vat')) || 
            text === 'thành tiền' || text.includes('amount')) {
          if (beforeTaxCol === -1) beforeTaxCol = colNumber;
        }
      });
    });
    
    // Second pass
    rows.forEach(row => {
      if (!row || !Array.isArray(row)) return;
      let isTotalRow = false;
      let rowNumbers = [];
      let colMap = {};
      
      row.forEach((cell, colNumber) => {
        const val = cell;
        let text = String(val || '');
        
        if (typeof val === 'number') {
          rowNumbers.push(val);
          colMap[colNumber] = val;
        } else if (typeof val === 'string') {
          const cleanStr = val.replace(/,/g, '');
          if (cleanStr && !isNaN(Number(cleanStr)) && cleanStr.trim() !== '') {
             const n = Number(cleanStr);
             rowNumbers.push(n);
             colMap[colNumber] = n;
          }
        }
        
        text = text.toLowerCase();
        if (text.includes('tổng cộng') || text.includes('cộng tiền hàng') || text.includes('tổng tiền') || text.includes('total') || text.includes('cộng')) {
          isTotalRow = true;
        }
      });
      
      if (isTotalRow) {
        if (beforeTaxCol !== -1 && colMap[beforeTaxCol] !== undefined && colMap[beforeTaxCol] > 0) {
          if (colMap[beforeTaxCol] > foundTotal) {
            foundTotal = colMap[beforeTaxCol];
          }
        } else {
          const nums = rowNumbers.filter(n => !isNaN(n) && n > 0);
          if (nums.length >= 2) {
             const firstNum = nums[0];
             if (firstNum > foundTotal) foundTotal = firstNum;
          } else if (nums.length === 1) {
             if (nums[0] > foundTotal) foundTotal = nums[0];
          } else if (nums.length > 0) {
             const rowMax = Math.max(...nums);
             if (rowMax > foundTotal) foundTotal = rowMax;
          }
        }
      }
    });
    
    console.log(filename, '->', foundTotal);
  } catch (e) {
    console.log(filename, '-> ERROR', e.message);
  }
}

async function main() {
  const dir = 'src/template_excel';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
  for (const f of files) {
    await testScanImprovedXLSX(`${dir}/${f}`);
  }
}
main();
