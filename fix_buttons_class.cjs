const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

// Find the index of the exact block
const targetStr = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">\n<button class="action-btn" @click="showPreviewRawModal = true"';
const replaceStr = '<div class="action-buttons-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">\n<button class="action-btn" @click="showPreviewRawModal = true"';

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
  console.log('Successfully replaced!');
} else {
  // Maybe CRLF?
  const targetStrCRLF = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">\r\n<button class="action-btn" @click="showPreviewRawModal = true"';
  const replaceStrCRLF = '<div class="action-buttons-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">\r\n<button class="action-btn" @click="showPreviewRawModal = true"';
  if (content.includes(targetStrCRLF)) {
    content = content.replace(targetStrCRLF, replaceStrCRLF);
    fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
    console.log('Successfully replaced (CRLF)!');
  } else {
    // Try regex
    const regex = /<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">(\s*)<button class="action-btn" @click="showPreviewRawModal = true"/;
    if (regex.test(content)) {
      content = content.replace(regex, '<div class="action-buttons-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">$1<button class="action-btn" @click="showPreviewRawModal = true"');
      fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
      console.log('Successfully replaced (Regex)!');
    } else {
      console.log('Could not find target string to replace.');
    }
  }
}
