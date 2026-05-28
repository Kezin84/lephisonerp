const fs = require('fs');
const content = fs.readFileSync('src/components/report.vue', 'utf8');
const formMatch = content.match(/<form @submit\.prevent=\"saveReport\"[\s\S]*?<\/form>/);
const formHTML = formMatch[0];
const lines = formHTML.split('\n');
const selfClosing = new Set(['input', 'img', 'rect', 'circle', 'line', 'polyline', 'path']);
const stack = [];
const regex = /<\/?([a-zA-Z0-9-]+)[^>]*>/g;
let match;
lines.forEach((line, index) => {
  while ((match = regex.exec(line)) !== null) {
    const tagContent = match[0];
    const tagName = match[1].toLowerCase();
    
    if (tagContent.startsWith('</')) {
      if (stack.length > 0 && stack[stack.length - 1] === tagName) {
        stack.pop();
        if (tagName === 'div' || tagName === 'form') {
            console.log('Line', index + 802, 'POP', tagName, 'depth:', stack.length);
        }
      } else {
        if (tagName === 'div' || tagName === 'form') {
          console.log('Line', index + 802, 'Mismatch closing tag:', tagName, 'expected:', stack.length ? stack[stack.length - 1] : 'empty', 'around:', tagContent);
        }
      }
    } else if (!tagContent.endsWith('/>') && !selfClosing.has(tagName)) {
      stack.push(tagName);
      if (tagName === 'div' || tagName === 'form') {
        console.log('Line', index + 802, 'PUSH', tagName, 'depth:', stack.length, tagContent.substring(0, 50));
      }
    }
  }
});
console.log('Remaining in stack:', stack);
