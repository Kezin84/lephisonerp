const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('lucide-upload')) console.log('Upload at: ' + (i+1));
  if (lines[i].includes('lucide-download')) console.log('Download at: ' + (i+1));
  if (lines[i].includes('.totals-body [style*="grid"]')) console.log('CSS at: ' + (i+1));
}
