const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix topCustomerBarOptions
content = content.replace(
  /x: \{ grid: \{ display: false \}, ticks: \{ color: '#e2e8f0', minRotation: 0, maxRotation: 0, autoSkip: false, font: \{ size: 11 \} \} \}/,
  `x: { grid: { display: false }, ticks: { color: '#e2e8f0', minRotation: 0, maxRotation: 0, autoSkip: false, font: { size: 11 }, callback: function(val) { let label = this.getLabelForValue(val); if (isMobile.value && label && label.length > 10) return label.substring(0, 10) + '...'; return label; } } }`
);

content = content.replace(
  /formatter: \(val: number\) => topCustomerModal\.value\.metric\.includes\('Pct'\) \? pctFmt\(val\) : fmt\(val\),/g,
  `formatter: (val: number) => {
            if (topCustomerModal.value.metric.includes('Pct')) return pctFmt(val);
            if (isMobile.value) {
              if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + ' Tỷ';
              if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + ' Tr';
            }
            return fmt(val);
          },`
);

content = content.replace(
  /percent: \{\s*color: '#22c55e',\s*anchor: 'end',\s*align: 'top',\s*offset: 2,\s*formatter: \(val: number\) => \{/g,
  `percent: {
          color: '#22c55e',
          anchor: 'end',
          align: 'top',
          offset: 2,
          font: { weight: 'bold', size: isMobile.value ? 9 : 11 },
          formatter: (val: number) => {`
);

content = content.replace(
  /value: \{\s*color: '#fff',\s*anchor: 'end',\s*align: 'top', offset: 4,/g,
  `value: {
          color: '#fff',
          anchor: 'end',
          align: 'top', offset: 4,
          font: { weight: 'bold', size: isMobile.value ? 9 : 11 },`
);

// 2. Fix topProductBarOptions
content = content.replace(
  /x: \{ grid: \{ display: false \}, ticks: \{ color: '#e2e8f0', minRotation: 0, maxRotation: 0, autoSkip: false, font: \{ size: 11 \} \} \}/,
  `x: { grid: { display: false }, ticks: { color: '#e2e8f0', minRotation: 0, maxRotation: 0, autoSkip: false, font: { size: 11 }, callback: function(val) { let label = this.getLabelForValue(val); if (isMobile.value && label && label.length > 10) return label.substring(0, 10) + '...'; return label; } } }`
);

content = content.replace(
  /formatter: \(val: number\) => topProductModal\.value\.metric\.includes\('Pct'\) \? pctFmt\(val\) : fmt\(val\),/g,
  `formatter: (val: number) => {
            if (topProductModal.value.metric.includes('Pct')) return pctFmt(val);
            if (isMobile.value) {
              if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + ' Tỷ';
              if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + ' Tr';
            }
            return fmt(val);
          },`
);

// 3. Fix chartOptions (chartModal)
// Let's shorten numbers for chartModal too
content = content.replace(
  /formatter: \(val: number\) => chartModal\.value\.metric\.includes\('Pct'\) \? pctFmt\(val\) : fmt\(val\)/g,
  `formatter: (val: number) => {
              if (chartModal.value.metric.includes('Pct')) return pctFmt(val);
              if (isMobile.value) {
                if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + ' Tỷ';
                if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + ' Tr';
              }
              return fmt(val);
            }`
);

fs.writeFileSync(file, content);
console.log('Fixed formatting on mobile to avoid overlap.');
