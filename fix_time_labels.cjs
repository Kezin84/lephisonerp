const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const spanHTML = ` <span style="font-size: 13px; font-weight: 500; background: rgba(56,189,248,0.1); color: #38bdf8; padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(56,189,248,0.2); margin-left: 8px; text-transform: none;">{{ currentTimeLabel }}</span>`;

content = content.replace(
  /Biểu đồ \{\{ chartData\.datasets\[1\]\?\.label \}\}/g,
  'Biểu đồ {{ chartData.datasets[1]?.label }}' + spanHTML
);

content = content.replace(
  /BXH Khách hàng - \{\{ topCustomerModal\.metricLabel \}\}/g,
  'BXH Khách hàng - {{ topCustomerModal.metricLabel }}' + spanHTML
);

content = content.replace(
  /BXH Sản phẩm - \{\{ topProductModal\.metricLabel \}\}/g,
  'BXH Sản phẩm - {{ topProductModal.metricLabel }}' + spanHTML
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Windows line endings and added labels');
