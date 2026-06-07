const ExcelJS = require('exceljs');
async function read() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('public/template_goc.xlsx');
  const ws = wb.worksheets[0];
  for(let i=15; i<=45; i++) {
    const row = ws.getRow(i);
    let text = '';
    row.eachCell((c) => { 
      let val = '';
      if (c.value) {
        if (typeof c.value === 'object' && c.value.richText) {
          val = c.value.richText.map(t=>t.text).join('');
        } else {
          val = c.value.toString();
        }
      }
      text += val + ' | ';
    });
    if(text) console.log(i + ': ' + text.substring(0, 100).replace(/\n/g, '\\n'));
  }
}
read();
