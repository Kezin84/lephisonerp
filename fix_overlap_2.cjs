const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Fix value block duplication and set offset
content = content.replace(
  /font: \{ weight: 'bold', size: isMobile\.value \? 9 : 11 \},([\s\S]*?)font: \{ weight: 'bold', size: 11 \},/g,
  `font: { weight: 'bold', size: isMobile.value ? 9 : 11 },$1`
);

// Fix percent block alignment and offset
content = content.replace(
  /percent: \{\s*color: '#22c55e',\s*anchor: 'end',\s*align: 'top',\s*offset: 2,/g,
  `percent: {
          color: '#fff',
          anchor: 'end',
          align: 'bottom',
          offset: 4,`
);

// Ensure the formatter doesn't rely strictly on 768px for truncation
// Let's change window.innerWidth <= 768 to window.innerWidth <= 1000 in isMobile definition
content = content.replace(
  /window\.innerWidth <= 768/g,
  `window.innerWidth <= 1000`
);

fs.writeFileSync(file, content);
console.log('Fixed overlapping labels.');
