const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const regexCustomer = /datalabels:\s*{\s*color:\s*'#fff',\s*anchor:\s*'end',\s*align:\s*'top',\s*offset:\s*4,\s*formatter:\s*\(val:\s*number\)\s*=>\s*{\s*if\s*\(topCustomerModal\.value\.metric\.includes\('Pct'\)\)\s*return\s*pctFmt\(val\);\s*const\s*total\s*=\s*topCustomerRawData\.value\.total;\s*if\s*\(!total\)\s*return\s*fmt\(val\);\s*const\s*pct\s*=\s*\(val\s*\/\s*total\)\s*\*\s*100;\s*return\s*\[fmt\(val\),\s*`\(\${pct\.toFixed\(1\)}%\)`\];\s*},\s*textAlign:\s*'center',\s*font:\s*{\s*weight:\s*'bold',\s*size:\s*11\s*},\s*textShadowBlur:\s*4,\s*textShadowColor:\s*'rgba\(0,0,0,0\.5\)'\s*}/;

const replaceCustomer = `datalabels: {
      labels: {
        value: {
          color: '#fff',
          anchor: 'end',
          align: 'top',
          offset: (ctx: any) => topCustomerModal.value.metric.includes('Pct') ? 4 : 16,
          formatter: (val: number) => topCustomerModal.value.metric.includes('Pct') ? pctFmt(val) : fmt(val),
          font: { weight: 'bold', size: 11 },
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.5)'
        },
        percent: {
          color: '#22c55e',
          anchor: 'end',
          align: 'top',
          offset: 2,
          formatter: (val: number) => {
            if (topCustomerModal.value.metric.includes('Pct')) return '';
            const total = topCustomerRawData.value.total;
            if (!total) return '';
            const pct = (val / total) * 100;
            return \`\${pct.toFixed(1)}%\`;
          },
          font: { weight: 'bold', size: 11 },
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }`;

let updated = false;
if (regexCustomer.test(content)) {
    content = content.replace(regexCustomer, replaceCustomer);
    console.log("Updated customer datalabels");
    updated = true;
}

const regexProduct = /datalabels:\s*{\s*color:\s*'#fff',\s*anchor:\s*'end',\s*align:\s*'top',\s*offset:\s*4,\s*formatter:\s*\(val:\s*number\)\s*=>\s*{\s*if\s*\(topProductModal\.value\.metric\.includes\('Pct'\)\)\s*return\s*pctFmt\(val\);\s*const\s*total\s*=\s*topProductRawData\.value\.total;\s*if\s*\(!total\)\s*return\s*fmt\(val\);\s*const\s*pct\s*=\s*\(val\s*\/\s*total\)\s*\*\s*100;\s*return\s*\[fmt\(val\),\s*`\(\${pct\.toFixed\(1\)}%\)`\];\s*},\s*textAlign:\s*'center',\s*font:\s*{\s*weight:\s*'bold',\s*size:\s*11\s*},\s*textShadowBlur:\s*4,\s*textShadowColor:\s*'rgba\(0,0,0,0\.5\)'\s*}/;

const replaceProduct = `datalabels: {
      labels: {
        value: {
          color: '#fff',
          anchor: 'end',
          align: 'top',
          offset: (ctx: any) => topProductModal.value.metric.includes('Pct') ? 4 : 16,
          formatter: (val: number) => topProductModal.value.metric.includes('Pct') ? pctFmt(val) : fmt(val),
          font: { weight: 'bold', size: 11 },
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.5)'
        },
        percent: {
          color: '#22c55e',
          anchor: 'end',
          align: 'top',
          offset: 2,
          formatter: (val: number) => {
            if (topProductModal.value.metric.includes('Pct')) return '';
            const total = topProductRawData.value.total;
            if (!total) return '';
            const pct = (val / total) * 100;
            return \`\${pct.toFixed(1)}%\`;
          },
          font: { weight: 'bold', size: 11 },
          textShadowBlur: 4,
          textShadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }`;

if (regexProduct.test(content)) {
    content = content.replace(regexProduct, replaceProduct);
    console.log("Updated product datalabels");
    updated = true;
}

if (updated) {
    fs.writeFileSync(file, content);
} else {
    console.log("Targets not found!");
}
