const ExcelJS = require('exceljs');
const fs = require('fs');

async function main() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  
  ws.getCell('B2').value = {
    richText: [
      { text: 'Hello', font: { name: 'Arial', size: 13, bold: true } },
      { text: ' World', font: { name: 'Arial', size: 13 } }
    ]
  };

  // Cell without rich text
  ws.getCell('A2').value = 1;
  ws.getCell('A2').font = { name: 'Arial', size: 13, bold: true };

  await wb.xlsx.writeFile('test.xlsx');
  console.log('Done');
}
main();
