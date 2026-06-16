const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Add `multiple` to reportUploadInput and change handler
content = content.replace(
  /<input type="file" ref="reportUploadInput" accept="\.xlsx, \.xls" style="display: none" @change="onReportSelected" \/>/,
  '<input type="file" ref="reportUploadInput" accept=".xlsx, .xls" multiple style="display: none" @change="onReportFilesSelected" />'
);

// 2. Add reactive state
const stateToAdd = `
const showYearModal = ref(false);
const selectedYearForReport = ref(new Date().getFullYear().toString());
const pendingReportFiles = ref<File[]>([]);
`;
if (!content.includes('showYearModal = ref(')) {
  content = content.replace('const reportUploadInput = ref<HTMLInputElement | null>(null);', 'const reportUploadInput = ref<HTMLInputElement | null>(null);\n' + stateToAdd);
}

// 3. Add Modal UI before <!-- UNIFIED MODALS --> or at the end of the template
const modalHtml = `
    <!-- Year Selection Modal for Report Import -->
    <Teleport to="body">
      <div v-if="showYearModal" class="sr-modal-overlay" style="z-index: 100000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5);">
        <div class="sr-modal" style="width: 400px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
          <h3 style="margin-top: 0; color: #f8fafc; font-size: 18px; text-transform: uppercase;">Ch?n nam cho d? li?u</h3>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">Vui lA?ng ch?n nam cho ({{ pendingReportFiles.length }}) file dA? li?u bA?o cA?o c?n import.</p>
          
          <div class="elite-form-group">
            <label style="color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 8px;">Nam</label>
            <input type="number" v-model="selectedYearForReport" class="elite-input" style="width: 100%; background: #1e293b; color: white; border: 1px solid #334155; padding: 10px; border-radius: 6px;" />
          </div>

          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button class="sr-btn sr-btn-cancel" @click="showYearModal = false" style="background: transparent; color: #cbd5e1; border: 1px solid #334155; padding: 8px 16px; border-radius: 6px; cursor: pointer;">H?y b?</button>
            <button class="sr-btn sr-btn-save" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;" @click="confirmYearAndImportReport">XA?c nh?n & Import</button>
          </div>
        </div>
      </div>
    </Teleport>
`;

if (!content.includes('Year Selection Modal for Report Import')) {
    // Replace the last match of </Teleport>
    const idx = content.lastIndexOf('</Teleport>');
    if (idx !== -1) {
        content = content.substring(0, idx + 11) + '\n' + modalHtml + content.substring(idx + 11);
    } else {
        // Find </template>
        const tmpIdx = content.lastIndexOf('</template>');
        if (tmpIdx !== -1) {
            content = content.substring(0, tmpIdx) + '\n' + modalHtml + '\n' + content.substring(tmpIdx);
        }
    }
}

// 4. Update the script logic
const logicToReplaceRegex = /async function onReportSelected[\s\S]*?target\.value = ''; \/\/ clear input\n    \}\n  \}/;

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
        const content = row.getCell(6).value?.toString() || '';
        const productType = row.getCell(7).value?.toString() || '';
        
        // TA  dA?ng nh?n d?ng th?i gian t?o (createdTime)
        let createdTime = '';
        const dateMatch = content.match(/(\\d{2})[./](\\d{2})[./](\\d{4})/);
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
            content,
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
    alert("KhA'ng tA?m th?y d? li?u hA?p lA? trong file Excel.");
  }
}
`;

content = content.replace(logicToReplaceRegex, newLogic);

fs.writeFileSync(file, content);
console.log('Done replacement.');
