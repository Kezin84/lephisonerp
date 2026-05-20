const fs = require('fs');
const JSZip = require('jszip');
const z = new JSZip();
z.loadAsync(fs.readFileSync('src/template_excel/form_mau_dealreg.docx')).then(zip => {
  zip.file('word/document.xml').async('string').then(xml => {
    const cellRe = /<w:tc>([\s\S]*?)<\/w:tc>/g;
    let m, i = 0;
    while (m = cellRe.exec(xml)) {
      const cell = m[1];
      const textParts = [];
      const tRe = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let t;
      while (t = tRe.exec(cell)) textParts.push(t[1]);
      const text = textParts.join('').trim().substring(0, 60);
      if (!text) { i++; continue; }
      
      // Cell shading
      const shdMatch = cell.match(/<w:shd[^>]*w:fill="([^"]+)"/);
      const fill = shdMatch ? shdMatch[1] : 'none';
      
      // Cell borders
      const borderMatch = cell.match(/<w:tcBorders>([\s\S]*?)<\/w:tcBorders>/);
      let borders = 'default';
      if (borderMatch) {
        const colorMatch = borderMatch[1].match(/w:color="([^"]+)"/);
        borders = colorMatch ? colorMatch[1] : 'auto';
      }
      
      // All run properties
      const rPrMatch = cell.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
      const colorMatch = cell.match(/<w:color w:val="([^"]+)"/);
      const color = colorMatch ? colorMatch[1] : 'auto';
      const isBold = cell.includes('<w:b/>') || cell.includes('<w:b ');
      const isItalic = cell.includes('<w:i/>') || cell.includes('<w:i ');
      const szMatch = cell.match(/<w:sz w:val="(\d+)"/);
      const sz = szMatch ? parseInt(szMatch[1])/2 : 'def';
      
      // Grid span
      const spanMatch = cell.match(/<w:gridSpan w:val="(\d+)"/);
      const span = spanMatch ? spanMatch[1] : '1';
      
      // Vertical merge
      const vMerge = cell.includes('<w:vMerge');
      
      console.log(`[${i}] span=${span} fill=#${fill} border=${borders} | color=#${color} bold=${isBold} italic=${isItalic} sz=${sz}pt | "${text}"`);
      i++;
    }
  });
});
