import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const files = [
  'src/template_excel/bao_gia_pdf1.pdf',
  'src/template_excel/bao_gia_pdf2.pdf', 
  'src/template_excel/bao_gia_pdf3.pdf',
  'src/template_excel/bao_gia_pdf4.pdf'
];

for (const filePath of files) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  console.log('\n\n========================================');
  console.log('FILE: ' + path.basename(filePath));
  console.log('Pages: ' + pdf.numPages);
  console.log('========================================');
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const yMap = new Map();
    textContent.items.forEach(item => {
      const y = Math.round(item.transform[5]);
      if (!yMap.has(y)) yMap.set(y, []);
      yMap.get(y).push(item);
    });
    const sortedYs = Array.from(yMap.keys()).sort((a, b) => b - a);
    console.log('\n--- Page ' + pageNum + ' ---');
    let lineNum = 0;
    for (const y of sortedYs) {
      const lineItems = yMap.get(y).sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = lineItems.map(t => t.str).join(' ').replace(/\s+/g, ' ').trim();
      if (lineText) {
        lineNum++;
        console.log(`[L${lineNum} Y=${y}] ${lineText}`);
      }
    }
  }
}
