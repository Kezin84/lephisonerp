const ExcelJS = require('exceljs');
const fs = require('fs');

async function main() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  
  // No cell base font
  ws.getCell('A1').value = {
    richText: [
      { text: 'Rich Text Arial 20', font: { name: 'Arial', size: 20 } }
    ]
  };

  // With cell base font
  ws.getCell('B1').font = { name: 'Arial', size: 20 };
  ws.getCell('B1').value = {
    richText: [
      { text: 'Rich Text Arial 20', font: { name: 'Arial', size: 20 } }
    ]
  };

  await wb.xlsx.writeFile('test2.xlsx');
  console.log('Done');
}
main();
