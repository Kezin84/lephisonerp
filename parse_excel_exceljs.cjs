const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'src', 'template_excel', 'LP_HANGHOA.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheetName = 'XGS - Desktop';
  const worksheet = workbook.getWorksheet(sheetName);

  if (!worksheet) {
    console.log(`Sheet "${sheetName}" not found.`);
    process.exit(1);
  }

  const products = [];
  let currentStt = null;
  let currentMaSp = null;

  // Let's assume data starts at row 2 for header, 3 for data, but let's iterate rows
  let headerRowIndex = 0;
  
  worksheet.eachRow((row, rowNumber) => {
    // Find header
    if (!headerRowIndex) {
      const values = row.values;
      if (values && values.join(',').includes('MÔ TẢ SẢN PHẨM')) {
        headerRowIndex = rowNumber;
      }
      return;
    }
    
    if (rowNumber > headerRowIndex) {
      const stt = row.getCell(1).value;
      const maSp = row.getCell(2).value;
      const moTa = row.getCell(3).value;
      const giaThamKhao = row.getCell(4).value;

      // Handle merged cells or blank cells for STT and MA SP
      if (stt !== null && stt !== '') {
        currentStt = stt;
      }
      if (maSp !== null && maSp !== '') {
        currentMaSp = maSp;
      }

      // If there is a mo ta, it's a valid row
      if (moTa !== null && moTa !== '') {
        products.push({
          STT: currentStt,
          'MÃ SP': currentMaSp,
          'MÔ TẢ SẢN PHẨM': moTa,
          'GIÁ THAM KHẢO (USD)': giaThamKhao
        });
      }
    }
  });

  console.log(`Total items found: ${products.length}`);
  products.forEach((p, index) => {
    console.log(`\nItem ${index + 1}:`);
    console.log(`- STT: ${p.STT}`);
    console.log(`- MÃ SP: ${p['MÃ SP']}`);
    console.log(`- MÔ TẢ: ${typeof p['MÔ TẢ SẢN PHẨM'] === 'object' ? JSON.stringify(p['MÔ TẢ SẢN PHẨM']) : p['MÔ TẢ SẢN PHẨM'].substring(0, 50) + '...'}`);
    console.log(`- GIÁ: ${p['GIÁ THAM KHẢO (USD)']}`);
  });
}

main().catch(console.error);
