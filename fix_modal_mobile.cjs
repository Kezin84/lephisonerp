const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const styleToAppend = `
@media (max-width: 768px) {
  .sr-modal-large {
    width: 100% !important;
    max-width: 100% !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
  .sr-modal-overlay {
    padding: 0 !important;
  }
  .sr-modal-large .sr-modal-header {
    border-radius: 0 !important;
    padding: 16px !important;
  }
  .sr-modal-large .sr-modal-body {
    padding: 16px !important;
    overflow-y: auto !important;
    flex: 1 !important;
  }
}
</style>
`;

if (!content.includes('.sr-modal-large {\\n    width: 100% !important;')) {
  content = content.replace('</style>', styleToAppend);
  fs.writeFileSync(file, content);
  console.log('Appended mobile modal styles.');
} else {
  console.log('Styles already exist.');
}
