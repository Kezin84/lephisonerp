const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        search(fullPath);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.cjs') || file.endsWith('.mjs') || file.endsWith('.vue')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('puppeteer')) {
          console.log(`Found in: ${fullPath}`);
        }
      }
    }
  });
}

search('c:/chuSonProject/reminder-main/reminder-main');
