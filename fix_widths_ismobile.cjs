const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Add isMobile ref to setup
if (!content.includes('const isMobile = ref(')) {
  content = content.replace(
    /const isSwitchingTab = ref\(false\);/,
    `const isSwitchingTab = ref(false);
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => { isMobile.value = window.innerWidth <= 768; });
}`
  );
}

// Replace topCustomerBar dynamic width
content = content.replace(
  /:style="\{ height: '500px', width: Math\.max\(100, Math\.min\(topCustomerRawData\.sorted\.length, Number\(topCustomerLimit\) \|\| 5\) \* 120\) \+ 'px', minWidth: '100%' \}"/g,
  `:style="{ height: '500px', width: isMobile ? '100%' : Math.max(100, Math.min(topCustomerRawData.sorted.length, Number(topCustomerLimit) || 5) * 120) + 'px', minWidth: '100%' }"`
);

// Replace topProductBar dynamic width
content = content.replace(
  /:style="\{ height: '500px', width: Math\.max\(100, Math\.min\(topProductRawData\.sorted\.length, Number\(topProductLimit\) \|\| 5\) \* 120\) \+ 'px', minWidth: '100%' \}"/g,
  `:style="{ height: '500px', width: isMobile ? '100%' : Math.max(100, Math.min(topProductRawData.sorted.length, Number(topProductLimit) || 5) * 120) + 'px', minWidth: '100%' }"`
);

// Replace chartModal dynamic width
content = content.replace(
  /:style="\{ height: '400px', width: Math\.max\(100, Math\.min\(chartLabels\.length, 30\) \* 80\) \+ 'px', minWidth: '100%' \}"/g,
  `:style="{ height: '400px', width: isMobile ? '100%' : Math.max(100, Math.min(chartLabels.length, 30) * 80) + 'px', minWidth: '100%' }"`
);

// Also remove inline overflow-x: auto so we can control it via CSS
content = content.replace(/style="flex: 1; overflow-x: auto; padding-bottom: 8px;"/g, 'style="flex: 1; padding-bottom: 8px;"');

const cssToAdd = `
.custom-scrollbar {
  overflow-x: auto;
}
@media (max-width: 768px) {
  .custom-scrollbar {
    overflow-x: hidden !important;
  }
}
</style>
`;
content = content.replace('</style>', cssToAdd);

fs.writeFileSync(file, content);
console.log('Fixed widths with isMobile ref.');
