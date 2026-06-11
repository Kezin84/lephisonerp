import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function run() {
  let files = [
    'src/import_file_old_data/kaspersky/Kaspersky Certificate 359C-260129-033227-1-978-197.pdf',
    'src/import_file_old_data/sophos/ELicense_15387_DASS-SOPHOS.pdf',
    'src/import_file_old_data/acronis/LicenseCertificate-SOSG286466.pdf'
  ];
  for (let file of files) {
    try {
      let data = new Uint8Array(fs.readFileSync(file));
      let doc = await pdfjsLib.getDocument({data: data}).promise;
      let text = '';
      for (let i = 1; i <= doc.numPages; i++) {
        let page = await doc.getPage(i);
        let content = await page.getTextContent();
        text += content.items.map(i => i.str).join(' ');
      }
      console.log('--- File:', file.split('/').pop());
      console.log(text.substring(0, 1500));
    } catch (e) {
      console.log('Error reading', file, e);
    }
  }
}
run();
