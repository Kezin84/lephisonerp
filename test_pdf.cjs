const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractText() {
    const data = new Uint8Array(fs.readFileSync('src/template_excel/baogia_moi.pdf'));
    const doc = await pdfjsLib.getDocument({ data: data }).promise;
    let fullText = '';
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' \n ';
    }
    
    // Test logic from Pipeline.vue
    const lines = fullText.split('\n');
    let numbers = [];
    lines.forEach(line => {
      const parts = line.split(/[\s:-]+/); // Removed comma from split
      parts.forEach(part => {
        let clean = part.replace(/[.,]/g, '');
        if (/^\d+$/.test(clean)) {
          let num = parseInt(clean, 10);
          if (num > 100000 && num < 100000000000) {
             numbers.push(num);
          }
        }
      });
    });
    
    console.log("--- FOUND NUMBERS ---");
    console.log(numbers);
    
    let foundTotal = 0;
    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < numbers.length; j++) {
        if (i !== j) {
          let num1 = numbers[i];
          let num2 = numbers[j];
          let min = Math.min(num1, num2);
          let max = Math.max(num1, num2);
          
          let diff10 = Math.abs((min * 1.1) - max);
          let diff8 = Math.abs((min * 1.08) - max);
          
          if (diff10 <= 10 || diff8 <= 10) {
            foundTotal = min;
            break;
          }
        }
      }
      if (foundTotal > 0) break;
    }
    
    console.log("--- EXTRACTED TOTAL ---");
    console.log(foundTotal);
}

extractText().catch(console.error);
