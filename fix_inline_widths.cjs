const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Replace the topCustomerBar chart wrapper
content = content.replace(
  /:style="\{ height: '500px', width: Math\.max\(100, Math\.min\(topCustomerRawData\.sorted\.length, Number\(topCustomerLimit\) \|\| 5\) \* 120\) \+ 'px', minWidth: '100%' \}"/g,
  `:style="{ height: '500px', width: (window.innerWidth <= 768) ? '100%' : Math.max(100, Math.min(topCustomerRawData.sorted.length, Number(topCustomerLimit) || 5) * 120) + 'px', minWidth: '100%' }"`
);

// Replace the topProductBar chart wrapper
content = content.replace(
  /:style="\{ height: '500px', width: Math\.max\(100, Math\.min\(topProductRawData\.sorted\.length, Number\(topProductLimit\) \|\| 5\) \* 120\) \+ 'px', minWidth: '100%' \}"/g,
  `:style="{ height: '500px', width: (window.innerWidth <= 768) ? '100%' : Math.max(100, Math.min(topProductRawData.sorted.length, Number(topProductLimit) || 5) * 120) + 'px', minWidth: '100%' }"`
);

// We need to ensure that the window object is tracked if they resize, but a simple evaluation at render time is usually enough for modal open.
// Also let's fix chartModal wrapper which might have the same issue.
// "chartModal" uses min-width: 800px inline
content = content.replace(
  /class="modal-chart-main-container" style="background: rgba\(15,23,42,\.6\); border: 1px solid #1e293b; border-radius: 12px; padding: 16px; min-width: 800px;"/g,
  `class="modal-chart-main-container" :style="{ background: 'rgba(15,23,42,.6)', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', minWidth: (window.innerWidth <= 768) ? '100%' : '800px' }"`
);

// What about the chart wrapper inside chartModal?
content = content.replace(
  /div class="chart-wrapper-mobile" :style="\{ height: '400px', width: Math\.max\(100, Math\.min\(chartLabels\.length, 30\) \* 80\) \+ 'px', minWidth: '100%' \}"/g,
  `div class="chart-wrapper-mobile" :style="{ height: '400px', width: (window.innerWidth <= 768) ? '100%' : Math.max(100, Math.min(chartLabels.length, 30) * 80) + 'px', minWidth: '100%' }"`
);

fs.writeFileSync(file, content);
console.log('Fixed inline dynamic widths for mobile.');
