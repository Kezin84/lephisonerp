const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Replace chart containers with a class wrapper
content = content.replace('<div style="height: 650px; width: 100%;">', '<div class="chart-wrapper-mobile" style="height: 650px; width: 100%;">');
content = content.replace(/<div :style="\{ height: '500px', width: Math.max\(100, Math.min\(topCustomerRawData.sorted.length, Number\(topCustomerLimit\) \|\| 5\) \* 120\) \+ 'px', minWidth: '100%' \}">/g, `<div class="chart-wrapper-mobile" :style="{ height: '500px', width: Math.max(100, Math.min(topCustomerRawData.sorted.length, Number(topCustomerLimit) || 5) * 120) + 'px', minWidth: '100%' }">`);
content = content.replace(/<div :style="\{ height: '500px', width: Math.max\(100, Math.min\(topProductRawData.sorted.length, Number\(topProductLimit\) \|\| 5\) \* 120\) \+ 'px', minWidth: '100%' \}">/g, `<div class="chart-wrapper-mobile" :style="{ height: '500px', width: Math.max(100, Math.min(topProductRawData.sorted.length, Number(topProductLimit) || 5) * 120) + 'px', minWidth: '100%' }">`);

// Add the CSS to restrict height on mobile
const style = `@media (max-width: 768px) {
  .chart-wrapper-mobile {
    height: 400px !important;
  }
}
</style>`;

content = content.replace('</style>', style);

fs.writeFileSync(file, content);
console.log('Fixed chart heights for mobile');
