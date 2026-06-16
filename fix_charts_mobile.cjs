const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix pie chart legend position (right -> bottom)
content = content.replace(/legend: \{ position: 'right' as const/g, "legend: { position: 'bottom' as const");

// 2. Fix bar chart label offset (16 -> 4)
content = content.replace(/offset: \(ctx: any\) => topCustomerModal\.value\.metric\.includes\('Pct'\) \? 4 : 16/g, "offset: (ctx: any) => 4");
content = content.replace(/offset: \(ctx: any\) => topProductModal\.value\.metric\.includes\('Pct'\) \? 4 : 16/g, "offset: (ctx: any) => 4");

// 3. Fix chartModal labels overlapping (font size 11 -> 9, offset 8 -> 4)
content = content.replace(/align: 'bottom',\s*offset: 8,\s*font: \{ weight: 'bold', size: 11 \}/g, "align: 'bottom', offset: 4, font: { weight: 'bold', size: 9 }");

// 4. In case align: 'top' is used for topCustomerBarOptions:
content = content.replace(/align: 'top',\s*offset: \(ctx: any\) => 4/g, "align: 'top', offset: 4");

// 5. Let's make sure the pie chart wrapper is using flex-direction: column so it doesn't get squished horizontally on mobile
content = content.replace(/<div class="chart-wrapper-mobile" style="height: 500px; width: 100%;">/g, '<div class="chart-wrapper-mobile" style="height: 400px; width: 100%; display: flex; justify-content: center;">');

fs.writeFileSync(file, content);
console.log('Fixed chart options.');
