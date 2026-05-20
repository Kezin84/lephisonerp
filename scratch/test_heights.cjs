const ExcelJS = require('exceljs');

async function testHeights() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('public/template_goc.xlsx');
    const ws = workbook.worksheets[0];
    
    console.log('Row 41 height:', ws.getRow(41).height);
    console.log('Row 42 height:', ws.getRow(42).height);
    console.log('Row 43 height:', ws.getRow(43).height);
    console.log('Row 44 height:', ws.getRow(44).height);
    console.log('Row 45 height:', ws.getRow(45).height);
}
testHeights().catch(console.error);
