const ExcelJS = require('exceljs');
const path = require('path');

async function testRead() {
  const filePath = path.resolve(__dirname, '../src/template_excel/PriceListVietnam_20260305 New.xlsx');
  console.log('Reading file:', filePath);
  
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(filePath);
    console.log('Successfully read the workbook!');
    console.log('Number of sheets:', workbook.worksheets.length);
    
    workbook.eachSheet((worksheet, sheetId) => {
      console.log(`- Sheet ${sheetId} "${worksheet.name}": ${worksheet.rowCount} rows`);
      
      // Let's print the first row as a sample if it has rows
      if (worksheet.rowCount > 0) {
        const firstRow = worksheet.getRow(1).values;
        // console.log(`  First row sample:`, firstRow.slice(0, 5)); // Just print first few cols
      }
    });
  } catch (err) {
    console.error('Error reading the file:', err);
  }
}

testRead();
