const ExcelJS = require('exceljs');

async function testHeights2() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('public/template_goc.xlsx');
    const ws = workbook.worksheets[0];
    
    let headerRowIdx = -1;
    let totalRowIdx = -1;
    
    ws.eachRow((row, rowNumber) => {
        if (row.getCell(1).value === 'STT' && String(row.getCell(2).value).includes('TÊN HÀNG HÓA')) {
            headerRowIdx = rowNumber;
        }
        if (String(row.getCell(1).value).includes('TỔNG CỘNG + THUẾ')) {
            totalRowIdx = rowNumber;
        }
    });

    const footerHeights = [];
    const maxRow = ws.rowCount;
    for (let r = totalRowIdx + 1; r <= maxRow; r++) {
        footerHeights.push(ws.getRow(r).height);
    }

    const diff = 5; // Suppose we insert 5 items instead of 3
    ws.spliceRows(headerRowIdx + 1, totalRowIdx - headerRowIdx, [], [], [], [], [], [], [], [], []);
    
    for (let r = headerRowIdx + 1; r <= maxRow + 10; r++) {
        ws.getRow(r).height = undefined;
    }

    let insertIdx = headerRowIdx + 1 + 9; // Let's say total row is now here
    let currentFooterIdx = insertIdx + 1;
    footerHeights.forEach(h => {
        ws.getRow(currentFooterIdx).height = h;
        currentFooterIdx++;
    });

    await workbook.xlsx.writeFile('scratch/test_heights_out.xlsx');
    console.log('done');
}
testHeights2().catch(console.error);
