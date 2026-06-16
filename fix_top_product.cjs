const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const target1 = '                BXH Sản phẩm - {{ topProductModal.metricLabel }}\r\n              </h3>\r\n                <button class="sr-tab-btn active">Sản phẩm</button>\r\n              </div>';
const target2 = '                BXH Sản phẩm - {{ topProductModal.metricLabel }}\n              </h3>\n                <button class="sr-tab-btn active">Sản phẩm</button>\n              </div>';

const replacement = `                BXH Sản phẩm - {{ topProductModal.metricLabel }}
              </h3>
              <div style="position: absolute; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <div class="sr-modal-tabs" style="display: flex; gap: 4px; background: rgba(30, 41, 59, 0.5); padding: 4px; border-radius: 8px; border: 1px solid #334155;">
                  <button class="sr-tab-btn" @click="topProductModal.show = false; openChart(topProductModal.metric, topProductModal.metric.includes('Pct'))">Chỉ số</button>
                  <button class="sr-tab-btn" @click="isSwitchingTab = true; topProductModal.show = false; openTopCustomerModal(topProductModal.metric); setTimeout(() => isSwitchingTab = false, 50)">Khách hàng</button>
                  <button class="sr-tab-btn active">Sản phẩm</button>
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #22c55e; text-transform: none; letter-spacing: 0.5px;">{{ currentTimeLabel }}</div>
              </div>`;

if (content.includes(target1)) {
    content = content.replace(target1, replacement);
    fs.writeFileSync(file, content);
    console.log("Fixed target1");
} else if (content.includes(target2)) {
    content = content.replace(target2, replacement);
    fs.writeFileSync(file, content);
    console.log("Fixed target2");
} else {
    console.log("Target not found!");
}
