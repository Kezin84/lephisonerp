const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove isMobile ? '100%' width overriding
content = content.replace(
  /:style="\{ height: '500px', width: isMobile \? '100%' : Math\.max\(100, Math\.min\(topCustomerRawData\.sorted\.length, Number\(topCustomerLimit\) \|\| 5\) \* 120\) \+ 'px', minWidth: '100%' \}"/g,
  `:style="{ height: '500px', width: Math.max(100, Math.min(topCustomerRawData.sorted.length, Number(topCustomerLimit) || 5) * (isMobile ? 90 : 120)) + 'px', minWidth: '100%' }"`
);

content = content.replace(
  /:style="\{ height: '500px', width: isMobile \? '100%' : Math\.max\(100, Math\.min\(topProductRawData\.sorted\.length, Number\(topProductLimit\) \|\| 5\) \* 120\) \+ 'px', minWidth: '100%' \}"/g,
  `:style="{ height: '500px', width: Math.max(100, Math.min(topProductRawData.sorted.length, Number(topProductLimit) || 5) * (isMobile ? 90 : 120)) + 'px', minWidth: '100%' }"`
);

// 2. Remove overflow-x: hidden for custom-scrollbar and chart-wrapper-mobile
content = content.replace(
  /\.custom-scrollbar\s*\{\s*overflow-x: hidden !important;\s*\}/g,
  `.custom-scrollbar { overflow-x: auto !important; }`
);

// In media queries, we might have added overflow: hidden !important to chart-wrapper-mobile
content = content.replace(
  /\.chart-wrapper-mobile\s*\{\s*position: relative !important;\s*width: 100% !important;\s*max-width: 100% !important;\s*height: 350px !important;\s*overflow: hidden !important;\s*\}/g,
  `.chart-wrapper-mobile {
    position: relative !important;
    min-width: 100% !important;
    height: 350px !important;
    overflow-x: auto !important;
  }`
);

// Check if there is another .chart-wrapper-mobile with overflow: hidden
content = content.replace(
  /overflow: hidden !important;\s*\}\s*\.chart-wrapper-mobile canvas/g,
  `overflow-x: auto !important;\n  }\n  .chart-wrapper-mobile canvas`
);

// Make sure the parent container allows scrolling
content = content.replace(
  /style="flex: 1; padding-bottom: 8px;"/g,
  `style="flex: 1; overflow-x: auto; padding-bottom: 8px;"`
);

fs.writeFileSync(file, content);
console.log('Restored horizontal scroll for mobile charts.');
