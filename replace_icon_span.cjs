const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

const oldSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
// We will replace it with a text "X" for maximum compatibility, or lucide-x
const newSvg = '<i class="lucide-x" style="width: 18px; height: 18px; stroke: #ffffff; color: #ffffff;"></i>';

content = content.replace(oldSvg, newSvg);

// In case the lucide icons are NOT initialized, fallback to text "✖"
const alternativeSvg = '<span style="font-size: 16px; color: #ffffff; font-weight: bold; line-height: 1;">✖</span>';
content = content.replace(newSvg, alternativeSvg); // Actually let's just use the span directly so it works 100%

// Let's re-read and replace directly with the span just to be absolutely certain it'll show up
let content2 = fs.readFileSync('src/components/BaoGia.vue', 'utf8');
content2 = content2.replace(oldSvg, alternativeSvg);
content2 = content2.replace(newSvg, alternativeSvg);

fs.writeFileSync('src/components/BaoGia.vue', content2, 'utf8');
console.log('Success replace X to span');
