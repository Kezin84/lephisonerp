const fs = require('fs');
const path = 'c:/chuSonProject/reminder-main/reminder-main/src/components/report.vue';
let content = fs.readFileSync(path, 'utf8');

// Replace the ones with @click.stop first
content = content.replace(/:href="link" target="_blank" @click\.stop/g, 'href="#" @click.prevent.stop="selectedImage = link"');

// Replace the remaining ones
content = content.replace(/:href="link" target="_blank"/g, 'href="#" @click.prevent.stop="selectedImage = link"');

fs.writeFileSync(path, content, 'utf8');
console.log('Done replacing links');
