const fs=require('fs'); 
const lines=fs.readFileSync('src/components/SaleReport.vue','utf8').split('\n'); 
lines.forEach((l,i)=>{
  if(l.includes('class="sr-grid"') || l.includes('grid-template-columns') || l.includes('class="sr-metric-card"')) 
    console.log(i+1, l.trim());
});
