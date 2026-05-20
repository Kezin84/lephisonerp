import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const files = [
  'src/template_excel/bao_gia_pdf1.pdf',
  'src/template_excel/bao_gia_pdf2.pdf', 
  'src/template_excel/bao_gia_pdf3.pdf',
  'src/template_excel/bao_gia_pdf4.pdf'
];

function parseGoodsFromLines(lines) {
  let inGoodsSectionPDF = false;
  let goodsList = [];
  let pendingDescLines = [];
  let headerSkipCount = 0;
  let currentCategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const lineOriginal = lines[i];
    const line = lineOriginal.toLowerCase();

    if (!inGoodsSectionPDF) {
      const headerKeywords = ['stt', 'số tt', 'so tt', 'model', 'tên', 'hàng hóa', 'hang hoa', 'mô tả', 'mo ta', 'sản phẩm', 'san pham', 'chi tiết', 'chi tiet', 'hạng mục', 'hang muc', 'diễn giải', 'dien giai', 'đvt', 'dvt', 'đơn giá', 'don gia', 'unit price', 'số lượng', 'so luong', 's\\.l', 'qty', 'thành tiền', 'thanh tien', 'amount'];
      let hdrCount = 0;
      for (const kw of headerKeywords) {
        if (new RegExp('(?:^|\\s)' + kw + '(?:\\s|$)', 'i').test(line)) hdrCount++;
      }
      if (hdrCount >= 3 && !/(đơn vị\s*(thụ|thu)|tên\s*:|người\s*:|gởi\s*:|gửi\s*:|kính\s*:|địa chỉ|address|mst\s*:|mã số thuế|ngân hàng|bank)/i.test(line)) {
        inGoodsSectionPDF = true;
        pendingDescLines = [];
        headerSkipCount = 2;
        continue;
      }
    }
    
    if (inGoodsSectionPDF && headerSkipCount > 0) {
      const subHeaderWords = /(^|\s)(lượng|trước\s*thuế|sau\s*thuế|vnđ|\(vnđ\)|đơn vị|tính|hạn|thuế|vat)(\s|$)/gi;
      const matches = line.match(subHeaderWords);
      const wordCount = line.trim().split(/\s+/).length;
      const isSubHeader = matches && matches.length >= 2 && (matches.length / wordCount) >= 0.3;
      if (isSubHeader) {
        headerSkipCount--;
        continue;
      }
      headerSkipCount = 0;
    }
    
    if (inGoodsSectionPDF && /^(tổng cộng|cộng|tổng tiền|tổng thanh toán|subtotal|grand total|các điều khoản)/i.test(line.trim())) {
      inGoodsSectionPDF = false;
      continue;
    }

    if (inGoodsSectionPDF) {
      const tokens = lineOriginal.split(/\s+/);
      let allNums = [];
      
      for (let j = 0; j < tokens.length; j++) {
        const tok = tokens[j];
        if (/^-+$/.test(tok) || /^#+$/.test(tok) || /^\d+%$/.test(tok)) continue;
        if (/^[\d,.]+$/.test(tok)) {
          const num = Number(tok.replace(/[,.]/g, ''));
          if (!isNaN(num)) {
            allNums.push({ val: num, idx: j });
          }
        }
      }

      let firstDataNumIdx = -1;
      let sl = 1, donGia = 0, ttTruoc = 0, vatNum = 0, ttSau = 0;
      let found = false;
      const MIN_THANH_TIEN = 100000;
      
      if (allNums.length >= 3) {
        for (let a = 0; a <= allNums.length - 3; a++) {
          const n1 = allNums[a].val, n2 = allNums[a+1].val, n3 = allNums[a+2].val;
          if (n1 > 0 && n2 > 0 && n3 >= MIN_THANH_TIEN && Math.abs(n1 * n2 - n3) <= 2) {
            sl = n1; donGia = n2; ttTruoc = n3;
            firstDataNumIdx = allNums[a].idx;
            for (let b = a + 3; b < allNums.length; b++) {
              if (allNums[b].val > ttTruoc * 0.5) { ttSau = allNums[b].val; break; }
              else if (allNums[b].val > 0) { vatNum = allNums[b].val; }
            }
            found = true; break;
          }
        }
      }
      if (!found && allNums.length >= 2) {
        for (let a = 0; a <= allNums.length - 2; a++) {
          if (allNums[a].val >= MIN_THANH_TIEN && allNums[a].val === allNums[a+1].val) {
            sl = 1; donGia = allNums[a].val; ttTruoc = allNums[a+1].val;
            firstDataNumIdx = allNums[a].idx;
            for (let b = a + 2; b < allNums.length; b++) {
              if (allNums[b].val > ttTruoc * 0.5) { ttSau = allNums[b].val; break; }
              else if (allNums[b].val > 0) { vatNum = allNums[b].val; }
            }
            found = true; break;
          }
        }
      }
      if (!found && allNums.length >= 2) {
        for (let a = 0; a <= allNums.length - 2; a++) {
          if (allNums[a].val > 0 && allNums[a].val < allNums[a+1].val && allNums[a+1].val >= MIN_THANH_TIEN && allNums[a+1].val % allNums[a].val === 0) {
            sl = allNums[a].val; ttTruoc = allNums[a+1].val; donGia = ttTruoc / sl;
            firstDataNumIdx = allNums[a].idx;
            found = true; break;
          }
        }
      }

      if (found && sl > 0 && ttTruoc > 0) {
        let textTokens = [];
        for (let j = 0; j < firstDataNumIdx; j++) {
          const tok = tokens[j];
          if (/^-+$/.test(tok) || /^#+$/.test(tok) || /^\d+%$/.test(tok)) continue;
          textTokens.push(tok);
        }

        let stt = '';
        if (textTokens.length > 0 && /^\d[\w.-]*$/.test(textTokens[0])) {
          stt = textTokens.shift() || '';
        }

        let dvt = '';
        const knownUnits = ['cái', 'bộ', 'tháng', 'chiếc', 'gói', 'lô', 'cuộn', 'hộp', 'pcs', 'lic', 'thùng', 'kg', 'm', 'km', 'lít', 'bản', 'quyển', 'quyề', 'chai', 'lọ', 'năm'];
        if (textTokens.length > 0) {
          const lastWord = textTokens[textTokens.length - 1].toLowerCase();
          if (knownUnits.includes(lastWord)) {
            dvt = textTokens.pop() || '';
          }
        }

        let ten = textTokens.join(' ').trim();
        let dienGiai = pendingDescLines.join('\n').trim();
        pendingDescLines = [];

        if (!ttSau && ttTruoc > 0) ttSau = ttTruoc + vatNum;

        // NEW LOGIC: if ten is empty/short, it means the name is entirely in dienGiai
        if (ten.length <= 2 && dienGiai.length > 0) {
          ten = dienGiai.replace(/\n/g, ' ');
          dienGiai = '';
        }

        goodsList.push({ stt, ten, dvt, sl, donGia, ttTruoc, vat: vatNum, ttSau: ttSau, dienGiai, danhMuc: currentCategory });
      } else {
        const trimmed = lineOriginal.trim();
        if (trimmed.length > 1 && !/^(VNĐ|vnd|\(VNĐ\)|trước thuế|sau thuế|thuế|lượng|tính|hạn|đơn vị)$/i.test(trimmed)) {
          const isGroupLine = /^\d+[\.\s]*[A-ZÀ-Ỹ]/.test(trimmed) && allNums.length <= 1;
          
          if (isGroupLine) {
            currentCategory = trimmed.replace(/^\d+[\.\s]+/, '').trim();
            pendingDescLines = [];
          } else {
            const startsWithLowercaseOrPunct = /^[a-zà-ỹ\(\[\{\+\,\.\/\\]/.test(trimmed);
            if (startsWithLowercaseOrPunct && goodsList.length > 0) {
              let lastItem = goodsList[goodsList.length - 1];
              lastItem.dienGiai = lastItem.dienGiai ? lastItem.dienGiai + '\n' + trimmed : trimmed;
            } else {
              pendingDescLines.push(trimmed);
            }
          }
        }
      }
    }
  }
  return goodsList;
}

for (const filePath of files) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  
  console.log('\n========================================');
  console.log('FILE: ' + path.basename(filePath));
  console.log('========================================');
  
  let allLines = [];
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
    for (const y of sortedYs) {
      const lineItems = yMap.get(y).sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = lineItems.map(t => t.str).join(' ').replace(/\s+/g, ' ').trim();
      if (lineText) allLines.push(lineText);
    }
  }
  
  const goods = parseGoodsFromLines(allLines);
  console.log('\n--- FINAL RESULT ---');
  if (goods.length === 0) {
    console.log('  NO GOODS FOUND!');
  } else {
    goods.forEach((g, idx) => {
      console.log(`  ${idx+1}. [${g.stt}] "${g.ten}"`);
      console.log(`      Danh mục: ${g.danhMuc}`);
      console.log(`      Diễn giải: ${g.dienGiai.replace(/\n/g, ' \\ ')}`);
      console.log(`      SL=${g.sl} DG=${g.donGia.toLocaleString()} TT=${g.ttTruoc.toLocaleString()} VAT=${g.vat.toLocaleString()} TTS=${g.ttSau.toLocaleString()}`);
    });
  }
}
