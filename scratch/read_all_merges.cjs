const ExcelJS = require('exceljs');

async function testMerges() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('public/template_goc.xlsx');
    const ws = workbook.worksheets[0];
    
    console.log('Original Merges:');
    const merges = Object.values(ws._merges);
    merges.forEach(merge => {
        console.log(`[${merge.model.top},${merge.model.left} -> ${merge.model.bottom},${merge.model.right}]`);
    });
}
testMerges().catch(console.error);
