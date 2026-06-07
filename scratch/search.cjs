const fs = require('fs');
const content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');
const lines = content.split(/\r?\n/);
const query = process.argv[2];
console.log(`Searching for: ${query}`);
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes(query.toLowerCase())) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
