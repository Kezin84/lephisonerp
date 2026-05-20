const ExcelJS = require('exceljs');

async function readTemplate() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('public/template_goc.xlsx');
    const worksheet = workbook.worksheets[0];
    
    console.log(`Sheet name: ${worksheet.name}`);
    
    worksheet.eachRow((row, rowNumber) => {
        const values = row.values.slice(1).map(v => typeof v === 'object' && v !== null && v.richText ? v.richText.map(rt => rt.text).join('') : v);
        if (values.some(v => v !== undefined && v !== '')) {
            console.log(`Row ${rowNumber}:`, values.join(' | '));
        }
    });
}

readTemplate().catch(console.error);
