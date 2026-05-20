const ExcelJS = require('exceljs');

async function checkTemplate() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('public/template_goc.xlsx');
    const worksheet = workbook.worksheets[0];
    
    worksheet.eachRow((row, rowNumber) => {
        let cells = [];
        row.eachCell((cell, colNumber) => {
            const val = cell.value;
            let strVal = typeof val === 'object' && val !== null && val.richText ? val.richText.map(rt => rt.text).join('') : String(val);
            if (strVal && strVal !== 'null' && strVal !== 'undefined') {
                cells.push(`[R${rowNumber}C${colNumber}]: ${strVal}`);
            }
        });
        if (cells.length > 0) console.log(cells.join(', '));
    });
}

checkTemplate().catch(console.error);
