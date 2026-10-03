import fs from 'fs';

const filePath = 'C:\\chuSonFireBase\\reminder-main\\reminder-main\\src\\components\\reportFIREBASE.vue';
let content = fs.readFileSync(filePath, 'utf-8');

const oldCode = `    if (result.status === 'success') {
      reports.value = result.data
      if (route.query.id && !autoOpenedId) {`;

const newCode = `    if (result.status === 'success') {
      // Sắp xếp dữ liệu mới nhất lên đầu tiên (Dựa trên id hoặc thoi_gian)
      const sortedData = result.data.sort((a, b) => String(b.id).localeCompare(String(a.id)));
      reports.value = sortedData;
      if (route.query.id && !autoOpenedId) {`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Fixed sorting successfully!");
