const fs = require('fs');
let content = fs.readFileSync('src/components/report.vue', 'utf8');

const asyncModalRegex = /<!-- ASYNC RESULT MODAL \(Custom Alert\) -->[\s\S]*?<\/Transition>/;
const oldModal = `<!-- Custom Alert Modal -->
    <div class="elite-modal-overlay" v-if="customAlertState.isOpen" @click.self="closeAlert" style="z-index: 9999999; background: rgba(15,23,42,0.8); backdrop-filter: blur(8px);">
      <div class="elite-modal dark-mode-modal" style="width: 400px; max-width: 90vw; background: #1e293b !important; border: 1px solid rgba(255,255,255,0.1) !important; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border-radius: 16px; overflow: hidden; transform: scale(1); animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
        <div style="padding: 1.5rem; text-align: center;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: center;">
            <div v-if="customAlertState.type === 'error'" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; color: #ef4444;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <div v-else-if="customAlertState.type === 'success'" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); display: flex; align-items: center; justify-content: center; color: #10b981;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div v-else style="width: 56px; height: 56px; border-radius: 50%; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); display: flex; align-items: center; justify-content: center; color: #3b82f6;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #f8fafc; margin-bottom: 0.6rem;">Thông báo</h3>
          <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1.5rem;">{{ customAlertState.message }}</p>
          <button @click="closeAlert" style="width: 100%; padding: 0.8rem; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(59,130,246,0.3);" onmouseover="this.style.background='#2563eb'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#3b82f6'; this.style.transform='none'">
            Xác nhận
          </button>
        </div>
      </div>
    </div>`;

content = content.replace(asyncModalRegex, oldModal);

// Replace showCustomAlert changes
content = content.replace(/if \(type === 'success' && title === 'Th.*?nh c.*?ng'\) title = 'Th.*?nh c.*?ng';\n\s*if \(type === 'error' && title === 'Th.*?ng b.*?o'\) title = 'L.*?i';\n\n\s*customAlertState\.value = \{ isOpen: true, message, type, title \}\n\s*if \(type === 'success'\) \{\n\s*setTimeout\(\(\) => \{\n\s*customAlertState\.value\.isOpen = false;\n\s*\}, 2000\);\n\s*\}/g, 'customAlertState.value = { isOpen: true, message, type }');

content = content.replace(/customAlertState\.value = \{ isOpen: true, message, type, title \}/, 'customAlertState.value = { isOpen: true, message, type }');

// We also need to wipe out the CSS.
// We can just find .async-spinner-wrap to the end of the async CSS block.
content = content.replace(/\.async-spinner-wrap[\s\S]*?\.async-modal-enter-active[\s\S]*?\}\n/g, '');

fs.writeFileSync('src/components/report.vue', content);
console.log('Reverted prompt 9 changes successfully');
