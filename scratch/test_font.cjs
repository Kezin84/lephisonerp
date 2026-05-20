const ExcelJS = require('exceljs');

async function testFont() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('public/template_goc.xlsx');
    const ws = workbook.worksheets[0];
    
    const c = ws.getCell('G7');
    console.log(c.font);
    
    c.font = { ...c.font, italic: true };
    console.log(c.font);
}
testFont().catch(console.error);
