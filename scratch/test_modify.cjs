const ExcelJS = require('exceljs');

async function testModify() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('public/template_goc.xlsx');
    const ws = workbook.worksheets[0];
    
    // We want to replace rows 14 to 17 with our own dynamic rows
    // Let's find the header row
    let headerRowIdx = -1;
    let totalRowIdx = -1;
    
    ws.eachRow((row, rowNumber) => {
        if (row.getCell(1).value === 'STT' && row.getCell(2).value === 'TÊN HÀNG HÓA') {
            headerRowIdx = rowNumber;
        }
        if (String(row.getCell(1).value).includes('TỔNG CỘNG + THUẾ')) {
            totalRowIdx = rowNumber;
        }
    });
    
    console.log(`Header: ${headerRowIdx}, Total: ${totalRowIdx}`);
    
    // Remove the sample data and total row (rows 14 to 17)
    // Actually, spliceRows removes rows and shifts everything up.
    const numRowsToRemove = totalRowIdx - headerRowIdx; 
    
    // Let's save the style of the first data row and the total row before removing
    const dataRowStyle = {};
    const totalRowStyle = {};
    for (let c=1; c<=9; c++) {
        dataRowStyle[c] = ws.getRow(headerRowIdx + 2).getCell(c).style; // row 15 in template is an item
        totalRowStyle[c] = ws.getRow(totalRowIdx).getCell(c).style;
    }
    const groupStyle = {};
    for (let c=1; c<=9; c++) {
        groupStyle[c] = ws.getRow(headerRowIdx + 1).getCell(c).style; // row 14 in template is a group
    }
    
    // remove rows
    ws.spliceRows(headerRowIdx + 1, numRowsToRemove);
    
    // Now we insert our new rows.
    const newItems = [
        { type: 'group', title: 'FIREWALL' },
        { type: 'item', stt: 1, name: 'Item 1', desc: 'Desc 1', dvt: 'Cái', sl: 1, price: 100, pre: 100, vat: 10, post: 110 },
        { type: 'item', stt: 2, name: 'Item 2', desc: 'Desc 2', dvt: 'Cái', sl: 2, price: 50, pre: 100, vat: 10, post: 110 }
    ];
    
    let insertIdx = headerRowIdx + 1;
    newItems.forEach(item => {
        ws.spliceRows(insertIdx, 1);
        const row = ws.getRow(insertIdx);
        if (item.type === 'group') {
            row.getCell(2).value = item.title;
            for(let c=1; c<=9; c++) row.getCell(c).style = groupStyle[c];
        } else {
            row.getCell(1).value = item.stt;
            row.getCell(2).value = item.name;
            row.getCell(3).value = item.desc;
            row.getCell(4).value = item.dvt;
            row.getCell(5).value = item.sl;
            row.getCell(6).value = item.price;
            row.getCell(7).value = item.pre;
            row.getCell(8).value = item.vat;
            row.getCell(9).value = item.post;
            for(let c=1; c<=9; c++) row.getCell(c).style = dataRowStyle[c];
        }
        insertIdx++;
    });
    
    // insert total row
    ws.spliceRows(insertIdx, 1);
    const totRow = ws.getRow(insertIdx);
    totRow.getCell(1).value = 'TỔNG CỘNG + THUẾ';
    totRow.getCell(7).value = 200;
    totRow.getCell(8).value = 20;
    totRow.getCell(9).value = 220;
    for(let c=1; c<=9; c++) totRow.getCell(c).style = totalRowStyle[c];
    ws.mergeCells(`A${insertIdx}:F${insertIdx}`);
    
    await workbook.xlsx.writeFile('scratch/out.xlsx');
    console.log('done');
}
testModify().catch(console.error);
