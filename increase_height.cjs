const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Replace 500px -> 650px (only for the div containing the <Bar>)
// Wait, there are iframes and other things with height: 500px.
// Let's explicitly replace the one for the chart modal body:
// It looks like: <div style="height: 500px; width: 100%;">
content = content.replace(/<div style="height: 500px; width: 100%;">\s*<Bar v-if="chartModal\.show"/g, '<div style="height: 650px; width: 100%;">\n                <Bar v-if="chartModal.show"');

// Replace 350px -> 500px for Pie charts
content = content.replace(/<div style="height: 350px; width: 100%;">\s*<Pie/g, '<div style="height: 500px; width: 100%;">\n                     <Pie');

// Replace height: '350px' -> height: '500px' for Bar charts
content = content.replace(/:style="\{ height: '350px', width/g, ':style="{ height: \'500px\', width');

fs.writeFileSync(file, content);
console.log('Replaced heights globally.');
