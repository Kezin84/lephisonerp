const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'created_time: item.createdTime || getFormattedNow(),',
    "created_time: \"'\" + (item.createdTime || getFormattedNow()),"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Modified created_time to force string');
