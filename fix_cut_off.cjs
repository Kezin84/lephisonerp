const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Replace pie chart wrappers to limit height on mobile
content = content.replace(/<div style="height: 500px; width: 100%;">\s*<Pie/g, '<div class="chart-wrapper-mobile" style="height: 500px; width: 100%;">\n                     <Pie');

// Fix min-width for mobile
const styleToAppend = `
@media (max-width: 768px) {
  .sr-modal-body > div[style*="flex-wrap: wrap"] > div {
    min-width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 16px;
  }
}
</style>
`;
content = content.replace('</style>', styleToAppend);

fs.writeFileSync(file, content);
console.log('Fixed cut off charts');
