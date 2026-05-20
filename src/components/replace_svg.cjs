const fs = require('fs');
const path = 'c:/chuSonProject/reminder-main/reminder-main/src/components/report.vue';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div class="tl-note-icon">[\s\S]*?<\/svg>\s*<\/div>/g;
content = content.replace(regex, '<div class="tl-note-icon">NOTE</div>');

fs.writeFileSync(path, content, 'utf8');
console.log('Done replacing note icons');
