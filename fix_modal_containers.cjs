const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Add classes to the pie and bar containers
content = content.replace(/style="flex: 1; min-width: 300px; max-width: 400px;/g, 'class="modal-pie-container" style="flex: 1; min-width: 300px; max-width: 400px;');
content = content.replace(/style="flex: 2; min-width: 500px;/g, 'class="modal-bar-container" style="flex: 2; min-width: 500px;');

// Also fix the chartModal container (it has min-width: 800px)
content = content.replace(/style="background: rgba\(15,23,42,\.6\); border: 1px solid #1e293b; border-radius: 12px; padding: 16px; min-width: 800px;"/g, 'class="modal-chart-main-container" style="background: rgba(15,23,42,.6); border: 1px solid #1e293b; border-radius: 12px; padding: 16px; min-width: 800px;"');

// Add the responsive CSS
const cssToAdd = `
@media (max-width: 768px) {
  .modal-pie-container {
    min-width: 100% !important;
    max-width: 100% !important;
  }
  .modal-bar-container {
    min-width: 100% !important;
    max-width: 100% !important;
  }
  .modal-chart-main-container {
    min-width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
`;

content = content.replace('</style>', cssToAdd);

fs.writeFileSync(file, content);
console.log('Added responsive classes to modal containers.');
