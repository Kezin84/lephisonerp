const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const regex = /(<div class="sr-card-top-customer"\s+@click\.stop="openTopCustomerModal\('([^']+)'\)" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba\(148, 163, 184, 0\.2\);)/g;

let matchCount = 0;
let replacedContent = content.replace(regex, (match, p1, metric) => {
  matchCount++;
  
  const isRatio = metric.includes('Pct');
  const chartArgs = isRatio ? `'${metric}', true` : `'${metric}'`;
  
  const newBlock = `
          <div class="sr-card-detail-chart" @click.stop="openChart(${chartArgs})" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.2); font-size: 13px; color: #94a3b8; display: flex; justify-content: center; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#8b5cf6'; this.querySelector('.arrow-icon-c-${metric}').style.transform='translateX(4px)'" onmouseout="this.style.color='#94a3b8'; this.querySelector('.arrow-icon-c-${metric}').style.transform='translateX(0)'" title="Xem biểu đồ chi tiết">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style="font-weight: 600;">Xem biểu đồ chi tiết</span>
            <svg class="arrow-icon-c-${metric}" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="sr-card-top-customer" @click.stop="openTopCustomerModal('${metric}')" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148, 163, 184, 0.1);`;
          
  return newBlock;
});

console.log('Matches found:', matchCount);
if (matchCount === 9) {
  fs.writeFileSync(file, replacedContent);
  console.log('File successfully updated!');
} else {
  console.log('Did not match 9 times, matched:', matchCount);
}
