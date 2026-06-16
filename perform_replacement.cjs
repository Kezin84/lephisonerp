const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('async function onReportSelected(e: Event) {');
const searchSuggestionsIdx = content.indexOf('const searchSuggestions = computed(() => {');

if (startIdx !== -1 && searchSuggestionsIdx !== -1) {
    const newLogic = `
function onReportFilesSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  pendingReportFiles.value = Array.from(target.files);
  showYearModal.value = true;
  target.value = ''; // clear input so same files can be selected again
}

async function confirmYearAndImportReport() {
  showYearModal.value = false;
  if (pendingReportFiles.value.length === 0) return;

  const allItems: ImportItem[] = [];

  for (const file of pendingReportFiles.value) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(arrayBuffer);
      const ws = wb.worksheets[0];
      
      if (!ws) {
        console.error("File khA'ng hA?p lA?:", file.name);
        continue;
      }
      
      ws.eachRow((row, rowNumber) => {
        // BA? qua dA?ng tiA?u dA? (dA?ng 1)
        if (rowNumber === 1) return;
        
        const getNum = (c: number) => {
          const val = row.getCell(c).value;
          if (typeof val === 'number') return val;
          if (typeof val === 'object' && val && 'result' in val) {
            return Number(val.result) || 0;
          }
          return Number(val?.toString().replace(/[,]/g, '')) || 0;
        };
  
        const mst = row.getCell(1).value?.toString() || '';
        const po = row.getCell(2).value?.toString() || '';
        const am = row.getCell(3).value?.toString() || '';
        const monCell = row.getCell(4).value?.toString() || '';
        const customer = row.getCell(5).value?.toString() || '';
        const contentVal = row.getCell(6).value?.toString() || '';
        const productType = row.getCell(7).value?.toString() || '';
        
        // TA  dA?ng nh?n d?ng th?i gian t?o (createdTime)
        let createdTime = '';
        const dateMatch = contentVal.match(/(\\d{2})[./](\\d{2})[./](\\d{4})/);
        if (dateMatch) {
          // TA?m th?y ngA?y thA?ng nam trong Content
          const dd = dateMatch[1];
          const mm = dateMatch[2];
          const yyyy = selectedYearForReport.value; // Override selected year!
          createdTime = \`\${dd}/\${mm}/\${yyyy} 00:00:00\`;
        } else if (monCell) {
          // Fallback: DA1ng c?t Month + NA?m dA? ch?n
          const monthNum = parseInt(monCell.replace(/\\D/g, ''));
          if (monthNum >= 1 && monthNum <= 12) {
            const yyyy = selectedYearForReport.value; // Override selected year!
            const mm = String(monthNum).padStart(2, '0');
            createdTime = \`01/\${mm}/\${yyyy} 00:00:00\`;
          }
        }
        
        const doanhSoBan = getNum(8);
        const giaMua = getNum(9);
        const tongCP = getNum(13);
        const grossCom = getNum(14);
        const thueVal = getNum(15);
        const netCom = getNum(16);
        
        let taxPct = 0;
        if (grossCom > 0 && thueVal > 0) {
          taxPct = Math.round((thueVal / grossCom) * 100);
        } else if (thueVal > 0) {
          taxPct = 25; // fallback
        }
        
        // Ch? import cA?c dA?ng cA? d? li?u PO ho?c Doanh s?
        if (po || doanhSoBan > 0) {
          allItems.push({
            id: Date.now() + Math.random(),
            row: null,
            doanhSoBan,
            giaMua,
            tongCP,
            grossCom,
            soPO: po,
            productType,
            customer,
            mst,
            createdTime,
            content: contentVal,
            netCom,
            am,
            taxPct,
            scanning: false,
            activeTab: 'po'
          });
        }
      });
    } catch (error) {
      console.error("L?i d?c file Excel:", error);
    }
  }

  if (allItems.length > 0) {
    multiEditModal.value = {
      show: true,
      mode: 'create',
      items: allItems
    };
  } else {
    alert("KhA'ng tA?m th?y d? li?u hA?p lA? trong cA?c file Excel dA? ch?n.");
  }
}

  `;
    
    content = content.substring(0, startIdx) + newLogic + content.substring(searchSuggestionsIdx);
    fs.writeFileSync(file, content);
    console.log('Replaced onReportSelected!');
} else {
    console.log('Could not find boundaries.');
}
