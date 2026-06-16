const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Replace using regex to handle varying whitespaces and newlines
content = content.replace(
  /formatter:\s*\(val:\s*number\)\s*=>\s*topCustomerModal\.value\.metric\.includes\('Pct'\)\s*\?\s*pctFmt\(val\)\s*:\s*fmt\(val\),/,
  `formatter: (val: number) => {
        if (topCustomerModal.value.metric.includes('Pct')) return pctFmt(val);
        const total = topCustomerRawData.value.total;
        if (!total) return fmt(val);
        const pct = (val / total) * 100;
        return [fmt(val), \`(\${pct.toFixed(1)}%)\`];
      },
      textAlign: 'center',`
);

content = content.replace(
  /formatter:\s*\(val:\s*number\)\s*=>\s*topProductModal\.value\.metric\.includes\('Pct'\)\s*\?\s*pctFmt\(val\)\s*:\s*fmt\(val\),/,
  `formatter: (val: number) => {
          if (topProductModal.value.metric.includes('Pct')) return pctFmt(val);
          const total = topProductRawData.value.total;
          if (!total) return fmt(val);
          const pct = (val / total) * 100;
          return [fmt(val), \`(\${pct.toFixed(1)}%)\`];
        },
        textAlign: 'center',`
);

fs.writeFileSync(file, content);
console.log("Updated using regex");
