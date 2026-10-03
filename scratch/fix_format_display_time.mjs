import fs from 'fs';

const filePath = 'C:\\chuSonFireBase\\reminder-main\\reminder-main\\src\\components\\reportFIREBASE.vue';
let content = fs.readFileSync(filePath, 'utf-8');

// We will find the formatDisplayTime function and replace it.
// Here is the target we know exists:
/*
const formatDisplayTime = (thoi_gian) => {
  if (!thoi_gian) return { time: '', thu: '', date: '' };
  const parts = thoi_gian.split(' /');
  if (parts.length === 3) {
    const timePart = parts[0];
    const thuPart = parts[1].trim();
    const datePart = parts[2];
    
    const [h, m] = timePart.split(':');
    const thuText = thuPart === '8' ? 'CN' : \`Th? \${thuPart}\`;
    const hourNum = parseInt(h);
    const periodText = hourNum < 12 ? 'Sáng' : 'Chiều';
    
    return {
      time: \`\${h} : \${m}\`,
      thu: thuText,
      date: datePart.split('/').join(' / '),
      period: periodText
    };
  }
  return { time: thoi_gian, thu: '', date: '', period: '' };
}
*/

const oldRegex = /const formatDisplayTime = \(thoi_gian\) => \{[\s\S]*?return \{ time: thoi_gian, thu: '', date: '', period: '' \};\s*\}/;

const newFunc = `const formatDisplayTime = (thoi_gian) => {
  if (!thoi_gian) return { time: '', thu: '', date: '', period: '' };
  
  // Xác định Sáng/Chiều dựa vào giờ đầu tiên trong chuỗi
  let periodText = '';
  const firstPart = thoi_gian.trim().split(' ')[0];
  if (firstPart && firstPart.includes(':')) {
    const h = parseInt(firstPart.split(':')[0]);
    if (!isNaN(h)) {
      periodText = h < 12 ? 'Sáng' : 'Chiều';
    }
  }

  const parts = thoi_gian.split(' /');
  if (parts.length === 3) {
    const timePart = parts[0];
    const thuPart = parts[1].trim();
    const datePart = parts[2];
    
    const [h, m] = timePart.split(':');
    const thuText = thuPart === '8' ? 'CN' : \`Thứ \${thuPart}\`;
    
    return {
      time: \`\${h} : \${m}\`,
      thu: thuText,
      date: datePart.split('/').join(' / '),
      period: periodText
    };
  }
  return { time: thoi_gian, thu: '', date: '', period: periodText };
}`;

if (content.match(oldRegex)) {
    content = content.replace(oldRegex, newFunc);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Fixed formatDisplayTime successfully!");
} else {
    console.log("Could not find formatDisplayTime to replace.");
}
