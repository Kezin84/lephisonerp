const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const newLabelContent = `const currentTimeLabel = computed(() => {
  const formatYMD = (s) => {
    if (!s) return '';
    const parts = s.split('-');
    if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
    return s;
  };
  const formatYM = (s) => {
    if (!s) return '';
    const parts = s.split('-');
    if (parts.length === 2) return parts[1] + '/' + parts[0];
    return s;
  };

  if (timeFilterMode.value === 'all') return 'Tất cả thời gian';
  if (timeFilterMode.value === 'day') {
    if (dateFrom.value && dateTo.value) {
      if (dateFrom.value === dateTo.value) return \`Ngày \${formatYMD(dateFrom.value)}\`;
      return \`\${formatYMD(dateFrom.value)} đến \${formatYMD(dateTo.value)}\`;
    }
    if (dateFrom.value) return \`Từ ngày \${formatYMD(dateFrom.value)}\`;
    if (dateTo.value) return \`Đến ngày \${formatYMD(dateTo.value)}\`;
    return 'Ngày (Chưa chọn)';
  }
  if (timeFilterMode.value === 'month') {
    if (monthFrom.value && monthTo.value) {
      if (monthFrom.value === monthTo.value) return \`Tháng \${formatYM(monthFrom.value)}\`;
      return \`\${formatYM(monthFrom.value)} đến \${formatYM(monthTo.value)}\`;
    }
    if (monthFrom.value) return \`Từ tháng \${formatYM(monthFrom.value)}\`;
    if (monthTo.value) return \`Đến tháng \${formatYM(monthTo.value)}\`;
    return 'Tháng (Chưa chọn)';
  }
  if (timeFilterMode.value === 'year') {
    if (yearFrom.value && yearTo.value) {
      if (yearFrom.value === yearTo.value) return \`Năm \${yearFrom.value}\`;
      return \`\${yearFrom.value} đến \${yearTo.value}\`;
    }
    if (yearFrom.value) return \`Từ năm \${yearFrom.value}\`;
    if (yearTo.value) return \`Đến năm \${yearTo.value}\`;
    return 'Năm (Chưa chọn)';
  }
  return '';
});`;

const oldLabelRegex = /const currentTimeLabel = computed\(\(\) => \{[\s\S]*?return '';\r?\n\}\);/;
content = content.replace(oldLabelRegex, newLabelContent);

content = content.replace(/color: #10b981;/g, 'color: #22c55e !important;');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed dates and colors');
