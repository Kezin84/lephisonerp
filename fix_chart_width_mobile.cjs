const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Replace any existing .chart-wrapper-mobile blocks in media queries
content = content.replace(/\.chart-wrapper-mobile\s*\{[^}]*\}/g, '');

const cssToAdd = `
@media (max-width: 768px) {
  .chart-wrapper-mobile {
    position: relative !important;
    width: 100% !important;
    max-width: 100vw !important;
    height: 350px !important;
    overflow: hidden !important;
  }
  .chart-wrapper-mobile canvas {
    max-width: 100% !important;
    max-height: 100% !important;
  }
}
</style>
`;

content = content.replace('</style>', cssToAdd);
fs.writeFileSync(file, content);
console.log('Fixed chart wrapper width for mobile.');
