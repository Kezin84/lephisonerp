const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const searchStr = 'style="position: absolute; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 10;"';
const replaceStr = 'class="sr-modal-center-block" style="display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 10;"';

// Replace the inline styles
content = content.split(searchStr).join(replaceStr);

// Append the new responsive styles for sr-modal-center-block and sr-modal-header
const cssToAdd = `
.sr-modal-center-block {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

@media (max-width: 768px) {
  .sr-modal-large .sr-modal-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    position: relative !important;
    gap: 12px !important;
  }
  .sr-modal-center-block {
    position: static !important;
    transform: none !important;
    width: 100% !important;
    align-items: flex-start !important;
  }
  .sr-btn-close {
    position: absolute !important;
    top: 16px !important;
    right: 16px !important;
  }
  
  /* Make the tabs scrollable horizontally if they exceed width */
  .sr-modal-tabs {
    flex-wrap: wrap !important;
    justify-content: flex-start !important;
    width: 100% !important;
  }
}
</style>
`;

if (!content.includes('.sr-modal-center-block {\\n  position: absolute;')) {
  content = content.replace('</style>', cssToAdd);
  fs.writeFileSync(file, content);
  console.log('Fixed header layout overlap.');
} else {
  console.log('Already fixed.');
}
