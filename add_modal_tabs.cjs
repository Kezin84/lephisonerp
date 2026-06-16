const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const r1 = /(Biểu đồ \{\{ chartData\.datasets\[1\]\?\.label \}\}\s*<\/h3>)/g;
const r2 = /(BXH Khách hàng - \{\{ topCustomerModal\.metricLabel \}\}\s*<\/h3>)/g;
const r3 = /(BXH Sản phẩm - \{\{ topProductModal\.metricLabel \}\}\s*<\/h3>)/g;

const template1 = `$1
              <div class="sr-modal-tabs" style="display: flex; gap: 4px; background: rgba(30, 41, 59, 0.5); padding: 4px; border-radius: 8px; border: 1px solid #334155; position: absolute; left: 50%; transform: translateX(-50%);">
                <button class="sr-tab-btn active">Chỉ số</button>
                <button class="sr-tab-btn" @click="chartModal.show = false; openTopCustomerModal(chartModal.metric)">Khách hàng</button>
                <button class="sr-tab-btn" @click="chartModal.show = false; openTopProductModal(chartModal.metric)">Sản phẩm</button>
              </div>`;

const template2 = `$1
              <div class="sr-modal-tabs" style="display: flex; gap: 4px; background: rgba(30, 41, 59, 0.5); padding: 4px; border-radius: 8px; border: 1px solid #334155; position: absolute; left: 50%; transform: translateX(-50%);">
                <button class="sr-tab-btn" @click="topCustomerModal.show = false; openChart(topCustomerModal.metric, topCustomerModal.metric.includes('Pct'))">Chỉ số</button>
                <button class="sr-tab-btn active">Khách hàng</button>
                <button class="sr-tab-btn" @click="topCustomerModal.show = false; openTopProductModal(topCustomerModal.metric)">Sản phẩm</button>
              </div>`;

const template3 = `$1
              <div class="sr-modal-tabs" style="display: flex; gap: 4px; background: rgba(30, 41, 59, 0.5); padding: 4px; border-radius: 8px; border: 1px solid #334155; position: absolute; left: 50%; transform: translateX(-50%);">
                <button class="sr-tab-btn" @click="topProductModal.show = false; openChart(topProductModal.metric, topProductModal.metric.includes('Pct'))">Chỉ số</button>
                <button class="sr-tab-btn" @click="topProductModal.show = false; openTopCustomerModal(topProductModal.metric)">Khách hàng</button>
                <button class="sr-tab-btn active">Sản phẩm</button>
              </div>`;

content = content.replace(r1, template1);
content = content.replace(r2, template2);
content = content.replace(r3, template3);

const styleBlock = `
.sr-tab-btn {
  background: transparent; color: #94a3b8; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.sr-tab-btn:hover {
  color: #f8fafc; background: rgba(51, 65, 85, 0.5);
}
.sr-tab-btn.active {
  background: #334155; color: #f8fafc; cursor: default; pointer-events: none;
}
</style>`;

content = content.replace(/<\/style>/, styleBlock);

fs.writeFileSync(file, content);
console.log("Successfully injected tabs!");
