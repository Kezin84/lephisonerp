const fs=require('fs'); 
const lines=fs.readFileSync('src/components/SaleReport.vue','utf8').split('\n'); 
const idx = lines.findIndex(l => l.includes('sr-metric-card'));
if (idx >= 0) { 
  console.log(lines.slice(Math.max(0, idx - 15), idx + 2).join('\n')); 
} else {
  console.log("Not found");
}
