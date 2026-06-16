const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

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
        fs.writeFileSync(file, content);
        console.log('Injected modal UI');
    } else {
        // Find </template>
        const tmpIdx = content.lastIndexOf('</template>');
        if (tmpIdx !== -1) {
            content = content.substring(0, tmpIdx) + '\n' + modalHtml + '\n' + content.substring(tmpIdx);
            fs.writeFileSync(file, content);
            console.log('Injected modal UI before </template>');
        }
    }
} else {
    console.log('Modal UI already exists');
}
