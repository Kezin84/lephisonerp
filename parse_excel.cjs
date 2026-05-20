const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'template_excel', 'LP_HANGHOA.xlsx');
const workbook = xlsx.readFile(filePath);

const sheetName = 'XGS - Desktop';
const worksheet = workbook.Sheets[sheetName];

if (!worksheet) {
  console.log(`Sheet "${sheetName}" not found.`);
  process.exit(1);
}

// Convert sheet to JSON
// To see where the data starts, we'll just get the raw JSON first and log it
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

// Let's print the first 15 rows to understand the structure
console.log("--- First 15 rows of the sheet ---");
for (let i = 0; i < Math.min(15, data.length); i++) {
  console.log(`Row ${i}:`, JSON.stringify(data[i]));
}
