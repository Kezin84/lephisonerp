const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const newComputed = `
const currentTimeLabel = computed(() => {
  if (timeFilterMode.value === 'all') return 'Tất cả thời gian';
  if (timeFilterMode.value === 'day') {
    if (dateFrom.value && dateTo.value) {
      if (dateFrom.value === dateTo.value) return \`Ngày \${dateFrom.value}\`;
      return \`Từ \${dateFrom.value} đến \${dateTo.value}\`;
    }
    if (dateFrom.value) return \`Từ ngày \${dateFrom.value}\`;
    if (dateTo.value) return \`Đến ngày \${dateTo.value}\`;
    return 'Ngày (Chưa chọn)';
  }
  if (timeFilterMode.value === 'month') {
    if (monthFrom.value && monthTo.value) {
      if (monthFrom.value === monthTo.value) return \`Tháng \${monthFrom.value}\`;
      return \`Từ \${monthFrom.value} đến \${monthTo.value}\`;
    }
    if (monthFrom.value) return \`Từ tháng \${monthFrom.value}\`;
    if (monthTo.value) return \`Đến tháng \${monthTo.value}\`;
    return 'Tháng (Chưa chọn)';
  }
  if (timeFilterMode.value === 'year') {
    if (yearFrom.value && yearTo.value) {
      if (yearFrom.value === yearTo.value) return \`Năm \${yearFrom.value}\`;
      return \`Từ \${yearFrom.value} đến \${yearTo.value}\`;
    }
    if (yearFrom.value) return \`Từ năm \${yearFrom.value}\`;
    if (yearTo.value) return \`Đến năm \${yearTo.value}\`;
    return 'Năm (Chưa chọn)';
  }
  return '';
});

const isSwitchingTab`;
content = content.replace('const isSwitchingTab', newComputed);

const spanHTML = `\n                <span style="font-size: 13px; font-weight: 500; background: rgba(56,189,248,0.1); color: #38bdf8; padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(56,189,248,0.2); margin-left: 8px; text-transform: none;">{{ currentTimeLabel }}</span>`;

content = content.replace(
  'Biểu đồ {{ chartData.datasets[1]?.label }}\n              </h3>',
  'Biểu đồ {{ chartData.datasets[1]?.label }}' + spanHTML + '\n              </h3>'
);

content = content.replace(
  'BXH Khách hàng - {{ topCustomerModal.metricLabel }}\n              </h3>',
  'BXH Khách hàng - {{ topCustomerModal.metricLabel }}' + spanHTML + '\n              </h3>'
);

content = content.replace(
  'BXH Sản phẩm - {{ topProductModal.metricLabel }}\n              </h3>',
  'BXH Sản phẩm - {{ topProductModal.metricLabel }}' + spanHTML + '\n              </h3>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Added time labels successfully');
