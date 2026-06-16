const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Update 'value' offset from 4 to 20
content = content.replace(
  /value: \{\s*color: '#fff',\s*anchor: 'end',\s*align: 'top', offset: 4,/g,
  `value: {
          color: '#fff',
          anchor: 'end',
          align: 'top', offset: 20,`
);

// Update 'percent' color, align, and offset
content = content.replace(
  /percent: \{\s*color: '#fff',\s*anchor: 'end',\s*align: 'bottom',\s*offset: 4,/g,
  `percent: {
          color: '#22c55e',
          anchor: 'end',
          align: 'top',
          offset: 4,`
);

// Fix the 'chartModal' value offset as well (if any)
content = content.replace(
  /align: 'bottom', offset: 4, font: \{ weight: 'bold', size: 9 \}/g,
  `align: 'top', offset: 4, font: { weight: 'bold', size: 9 }`
);

fs.writeFileSync(file, content);
console.log('Fixed percent alignment and colors.');
