const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const targetCustomer = `      formatter: (val: number) => topCustomerModal.value.metric.includes('Pct') ? pctFmt(val) : fmt(val),
      font: { weight: 'bold', size: 11 },`;

const replaceCustomer = `      formatter: (val: number) => {
        if (topCustomerModal.value.metric.includes('Pct')) return pctFmt(val);
        const total = topCustomerRawData.value.total;
        if (!total) return fmt(val);
        const pct = (val / total) * 100;
        return [fmt(val), \`(\${pct.toFixed(1)}%)\`];
      },
      textAlign: 'center',
      font: { weight: 'bold', size: 11 },`;

const targetProduct = `        formatter: (val: number) => topProductModal.value.metric.includes('Pct') ? pctFmt(val) : fmt(val),
        font: { weight: 'bold', size: 11 },`;

const replaceProduct = `        formatter: (val: number) => {
          if (topProductModal.value.metric.includes('Pct')) return pctFmt(val);
          const total = topProductRawData.value.total;
          if (!total) return fmt(val);
          const pct = (val / total) * 100;
          return [fmt(val), \`(\${pct.toFixed(1)}%)\`];
        },
        textAlign: 'center',
        font: { weight: 'bold', size: 11 },`;

let updated = false;

if (content.includes(targetCustomer)) {
    content = content.replace(targetCustomer, replaceCustomer);
    console.log("Replaced customer formatter");
    updated = true;
}

if (content.includes(targetProduct)) {
    content = content.replace(targetProduct, replaceProduct);
    console.log("Replaced product formatter");
    updated = true;
}

if (updated) {
    fs.writeFileSync(file, content);
} else {
    console.log("Targets not found!");
}
