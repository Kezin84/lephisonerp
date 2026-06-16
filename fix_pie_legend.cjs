const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const labels = topN\.map\(d => wrapText\(d\[0\], 25\)\);/g,
  `const labels = topN.map(d => {
    let text = d[0];
    if (isMobile.value && text.length > 15) return text.substring(0, 15) + '...';
    if (!isMobile.value && text.length > 25) return text.substring(0, 25) + '...';
    return text;
  });`
);

fs.writeFileSync(file, content);
console.log('Fixed Pie chart legend overlap by truncating strings instead of array wrapping.');
