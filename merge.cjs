const fs = require('fs');
const path = require('path');

const srcBackend = path.join(__dirname, 'src', 'backend');
const backendBaogia = path.join(__dirname, 'backend_baogia');

let baogiaCode = fs.readFileSync(backendBaogia, 'utf-8');

// Transformations for baogiaCode
baogiaCode = baogiaCode.replace(/function doGet\(e\)/g, 'function bg_doGet(e)');
baogiaCode = baogiaCode.replace(/function doPost\(e\)/g, 'function bg_doPost(e)');
baogiaCode = baogiaCode.replace(/function json\(data\)/g, 'function bg_json(data)');
baogiaCode = baogiaCode.replace(/json\(/g, 'bg_json(');

// Remove the global SHEETS definition and SPREADSHEET_ID from baogiaCode, we'll redefine them safely
baogiaCode = baogiaCode.replace(/const SPREADSHEET_ID = .*?\n/, '');
baogiaCode = baogiaCode.replace(/const SHEETS = {[\s\S]*?}/, 'const BG_SHEETS = {\n    hang_hoa: \'hang_hoa\',\n    khach_hang: \'khach_hang\',\n    nha_cung_cap: \'nha_cung_cap\',\n    hop_dong_tong_quat: \'hop_dong_tong_quat\',\n    hop_dong_chi_tiet: \'hop_dong_chi_tiet\',\n    Thong_tin_ca_nhan: \'Thong_tin_ca_nhan\',\n    hop_dong_version: \'hop_dong_version\'\n}');
baogiaCode = baogiaCode.replace(/SHEETS\./g, 'BG_SHEETS.');
baogiaCode = baogiaCode.replace(/SHEETS\[/g, 'BG_SHEETS[');

// Update SpreadsheetApp.openById to getActiveSpreadsheet()
baogiaCode = baogiaCode.replace(/SpreadsheetApp\.openById\(SPREADSHEET_ID\)/g, 'SpreadsheetApp.getActiveSpreadsheet()');

// Remove myFunction
baogiaCode = baogiaCode.replace(/function myFunction\(\) {[\s\S]*?}/, '');

let srcCode = fs.readFileSync(srcBackend, 'utf-8');

// Patch doGet
const doGetTarget = 'function doGet(e) {\n  const params = e.parameter || {};\n  const sheet  = (params.sheet || "report").toLowerCase();';
const doGetReplacement = 'function doGet(e) {\n  const params = e.parameter || {};\n\n  // --- TÍCH HỢP BÁO GIÁ ---\n  const action = params.action || "";\n  const bgActions = ["all", "hang_hoa", "khach_hang", "hop_dong_tong_quat", "hop_dong_chi_tiet", "hop_dong_version", "hop_dong_active"];\n  if (bgActions.includes(action)) {\n    return bg_doGet(e);\n  }\n  // -------------------------\n\n  const sheet  = (params.sheet || "report").toLowerCase();';
srcCode = srcCode.replace(doGetTarget, doGetReplacement);

// Patch doPost
const doPostTarget = 'function doPost(e) {\n  let result;\n\n  try {\n    const payload = JSON.parse(e.postData.contents || "{}");';
const doPostReplacement = 'function doPost(e) {\n  // --- TÍCH HỢP BÁO GIÁ ---\n  const action = (e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : "";\n  if (action === "save_contract_temp" || action === "save_contract_official") {\n    return bg_doPost(e);\n  }\n  // -------------------------\n\n  let result;\n\n  try {\n    const payload = JSON.parse(e.postData.contents || "{}");';
srcCode = srcCode.replace(doPostTarget, doPostReplacement);

// Append baogiaCode
srcCode += '\n\n// ==========================================\n// TÍCH HỢP LOGIC BÁO GIÁ TỪ backend_baogia\n// ==========================================\n' + baogiaCode;

fs.writeFileSync(srcBackend, srcCode, 'utf-8');
console.log('Done merging backend logic.');
