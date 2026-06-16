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
    content = content.replace('<!-- UNIFIED MODALS -->', modalHtml + '\n    <!-- UNIFIED MODALS -->');
}

// 4. Update the script logic
const logicToReplaceRegex = /async function onReportSelected\(e: Event\) \{[\s\S]*?loadData\(\);\s*\n\}/;

const newLogic = `
function onReportFilesSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  pendingReportFiles.value = Array.from(target.files);
  showYearModal.value = true;
  target.value = ''; // reset
}

async function confirmYearAndImportReport() {
  showYearModal.value = false;
  if (pendingReportFiles.value.length === 0) return;

  loading.value = true;
  try {
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
        
        const items: ImportItem[] = [];
        
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
          
          let createdTime = '';
          const dateMatch = content.match(/(\\d{2})[./](\\d{2})[./](\\d{4})/);
          if (dateMatch) {
            const dd = dateMatch[1];
            const mm = dateMatch[2];
            // Override the year with the selected year
            const yyyy = selectedYearForReport.value;
            createdTime = \`\${dd}/\${mm}/\${yyyy} 00:00:00\`;
          } else if (monCell) {
            const monthNum = parseInt(monCell.replace(/\\D/g, ''));
            if (monthNum >= 1 && monthNum <= 12) {
              const yyyy = selectedYearForReport.value;
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
          
          items.push({
            id: Date.now() + Math.random(),
            soPO: po,
            productType,
            customer,
            recipient: '',
            mst,
            createdTime,
            content,
            doanhSoBan,
            giaMua,
            tongCP,
            grossCom,
            taxPct,
            netCom,
            am,
            row: null
          });
        });
        
        const grouped = new Map<string, ImportItem>();
        for (const item of items) {
          if (!item.content) continue;
          const key = item.content.trim().toLowerCase();
          if (!grouped.has(key)) {
            grouped.set(key, item);
          } else {
            const existing = grouped.get(key)!;
            existing.doanhSoBan = (existing.doanhSoBan || 0) + (item.doanhSoBan || 0);
            existing.giaMua = (existing.giaMua || 0) + (item.giaMua || 0);
            existing.tongCP = (existing.tongCP || 0) + (item.tongCP || 0);
            existing.grossCom = (existing.grossCom || 0) + (item.grossCom || 0);
            existing.netCom = (existing.netCom || 0) + (item.netCom || 0);
          }
        }
        
        const validItems = Array.from(grouped.values());
        
        for (const item of validItems) {
          if (!item.customer || !item.content) continue;
          
          const maCongTyGen = genMaCongTy(item.customer);
          const maKHGen = genMaKhachHang(item.recipient, item.customer);
          
          const tTruoc = item.doanhSoBan || 0;
          const tVat = 0; 
          const tSau = tTruoc + tVat;
          
          const maHD = 'HD-' + Date.now() + Math.floor(Math.random() * 1000);
          const soHD = 'SHD-' + Math.floor(Math.random() * 10000);
          
          const payloadSaleReport = {
            Ma_khach_hang: maKHGen,
            Ten_khach_hang: item.recipient || item.customer,
            Ma_cong_ty: maCongTyGen,
            Ten_cong_ty: item.customer,
            MST: item.mst,
            created_time: item.createdTime || getFormattedNow(),
            content_of_contract_PO: item.content,
            Tong_tien_truoc_thueVAT: item.doanhSoBan,
            chiet_khau_tong_truoc_thue: item.grossCom,
            phan_tram_thue_chenh_lech_gia: item.taxPct,
            thue_chenh_lech_gia: item.grossCom * (item.taxPct / 100),
            Tong_thanh_tien_chua_VAT_mua_hang: item.giaMua,
            Tong_CP_don_hang: item.tongCP,
            con_lai: item.netCom,
            account_manager_name: item.am,
            img_save: '',
            link_excel_bao_gia: '',
            link_excel_mua_hang: '',
            ten_file_bao_gia: '',
            ten_file_mua_hang: ''
          };
          
          await fetch('https://script.google.com/macros/s/AKfycbyI75L-yP6d5eMvOInBvQY7n45iU611U5tqRIt6F8S-cK7mFz5wP-mXlU7tVp2bF9E01g/exec', {
            method: 'POST',
            body: JSON.stringify(payloadSaleReport)
          });
        }
      } catch(err) {
        console.error('L?i khi d?c file report:', file.name, err);
      }
    }
  } finally {
    loading.value = false;
    loadData();
    alert("Import thA?nh cA'ng!");
  }
}
`;

content = content.replace(logicToReplaceRegex, newLogic);

fs.writeFileSync(file, content);
console.log('Done replacement.');
